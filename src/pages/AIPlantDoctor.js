import React, { useState, useEffect, useRef, useCallback } from "react";
import { Microscope, BarChart3, Download, Bell } from "lucide-react";
import { MODAL_LAYER, modalOverlay } from "../styles/modal";
import { FaUpload, FaRobot, FaLeaf, FaFlask, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaArrowLeft, FaTimes, FaCheck, FaLock, FaCrown, FaComments } from "react-icons/fa";

// Premium features that require subscription
const PREMIUM_FEATURES = [
  { id: "advancedDiagnosis", name: "Advanced AI Diagnosis", icon: <Microscope size="1em" color="#0284c7" />, description: "Deep learning analysis with 95%+ accuracy for complex plant diseases" },
  { id: "cropAnalytics", name: "Crop Analytics", icon: <BarChart3 size="1em" color="var(--eco-c9)" />, description: "Predictive growth metrics and yield forecasting" },
  { id: "downloadableReports", name: "Downloadable Reports", icon: <Download size="1em" color="var(--eco-c11)" />, description: "Export comprehensive PDF health reports" },
  { id: "smartAlerts", name: "Smart Alerts", icon: <Bell size="1em" color="#f59e0b" />, description: "Real-time notifications for pest outbreaks and weather threats" },
];

// Used only if the Admin Portal's Disease Library is somehow empty.
const FALLBACK_DISEASES = [
  { id: "DIS-FALLBACK", name: "Early Blight (Fungal)", plant: "Heirloom Tomato", crop: "Tomato", severity: "Moderate", confidence: "94.2%", recommendations: [
    "Remove infected lower leaves to prevent spore splash.",
    "Apply organic copper-based fungicide every 7-10 days.",
    "Improve air circulation by pruning excess foliage.",
    "Water at the base of the plant only, avoiding the leaves.",
  ] },
];

const ANALYSIS_STEPS = [
  { id: 1, label: "Scanning Image Structure...", icon: <FaUpload /> },
  { id: 2, label: "Identifying Plant Species...", icon: <FaLeaf /> },
  { id: 3, label: "Detecting Symptom Patterns...", icon: <FaFlask /> },
  { id: 4, label: "Generating Health Report...", icon: <FaRobot /> },
];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // the 10MB the upload area advertises

// --- The copy of the photo that travels with the scan record ----------------
// The on-screen preview is a `blob:` URL, which is only valid for this page in
// this tab and is revoked the moment the user navigates away. The Admin Portal
// reads the scan back later — from localStorage, or from Supabase on another
// device entirely — so the record has to carry the pixels themselves.
//
// A raw 10MB upload cannot go in a JSON record, so the photo is redrawn on a
// canvas capped at 720px and exported as a JPEG data URL: a few tens of KB,
// still plenty to see a leaf lesion at review size.
const SYNC_PHOTO_MAX_PX = 720;
const SYNC_PHOTO_QUALITY = 0.72;

const buildSyncPhoto = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const img = new window.Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    try {
      const scale = Math.min(1, SYNC_PHOTO_MAX_PX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", SYNC_PHOTO_QUALITY));
    } catch (error) {
      resolve(null); // a photo the browser won't re-encode is not worth failing the scan over
    }
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
  img.src = url;
});

// The scan result the page hands to the chat, so the AI Plant Doctor bot opens
// already knowing what was just diagnosed and the user can keep asking about it.
const buildChatHandoff = (result) => [
  "🔬 Plant Scan Complete",
  "",
  `🌱 Plant: ${result.plantName}`,
  `🦠 Condition: ${result.condition}`,
  `📊 Confidence: ${result.confidence}`,
  `⚠️ Severity: ${result.severity}`,
  "",
  "Recommended care:",
  ...result.recommendations.map((rec) => `• ${rec}`),
  "",
  "Ask me anything about this diagnosis — treatment timing, organic alternatives, or how to stop it spreading to nearby plants.",
].join("\n");

function AIPlantDoctor({ setActiveNav, onScanComplete, loggedInUser, plantDiseases = [], onAskAI }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [showPremiumUnlock, setShowPremiumUnlock] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState(null);
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const previewUrlRef = useRef(null); // the object URL behind <img src>, so it can be revoked
  // Holds the *promise* of the downscaled photo, not the photo: the encode
  // starts the moment a file is picked and the scan reads it five seconds
  // later, so awaiting the promise removes the race entirely.
  const syncPhotoRef = useRef(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // A half-finished scan must not keep ticking, and the preview blob must not
  // leak, once the user navigates away from the page.
  useEffect(() => () => {
    clearInterval(progressTimerRef.current);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const releasePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    // The photo belongs to the file that was just dropped; clearing or
    // replacing that file must not leave the previous one attached to the
    // next scan. handleFile re-arms it immediately after.
    syncPhotoRef.current = null;
  };

/**
   * Resets all state variables related to the AI Plant Doctor's content and analysis.
   * This ensures a clean slate when navigating away or clearing the current session.
   */
  const resetAIPlantDoctorState = () => {
    clearInterval(progressTimerRef.current);
    releasePreview();
    setSelectedImage(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setDiagnosisResult(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input element's value
    }
  };

  // Handle premium feature access attempt
  const handlePremiumFeatureClick = (feature) => {
    setPremiumFeature(feature);
    setShowPremiumUnlock(true);
  };

  // Close premium unlock modal
  const closePremiumUnlock = () => {
    setShowPremiumUnlock(false);
    setPremiumFeature(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setUploadError("That file isn't an image — please upload a JPG or PNG photo of the plant.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("That photo is larger than 10MB. Please upload a smaller image.");
      return;
    }
    clearInterval(progressTimerRef.current);
    releasePreview();
    previewUrlRef.current = URL.createObjectURL(file);
    syncPhotoRef.current = buildSyncPhoto(file);
    setUploadError("");
    setSelectedImage(previewUrlRef.current);
    setDiagnosisResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  // "Clear" has to wipe the whole session, not just the photo — otherwise the
  // previous diagnosis stayed on screen next to an empty upload area.
  const clearImage = () => {
    clearInterval(progressTimerRef.current);
    releasePreview();
    setSelectedImage(null);
    setDiagnosisResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startDiagnosis = () => {
    if (!selectedImage || isAnalyzing) return;
    setDiagnosisResult(null);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress — roughly 5s from 0 to 100.
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setAnalysisProgress((prev) => Math.min(prev + 2, 100));
    }, 100);
  };

  const showResult = useCallback(() => {
    // Pull the diagnosis from the admin-managed Disease Library so user-facing
    // results always reflect the content curated in the Admin Portal.
    const library = plantDiseases && plantDiseases.length > 0 ? plantDiseases : FALLBACK_DISEASES;
    const entry = library[Math.floor(Math.random() * library.length)];
    const recommendations = (entry.recommendations && entry.recommendations.length > 0)
      ? entry.recommendations
      : ["Monitor the plant and consult a local agronomist."];

    const result = {
      plantName: entry.plant || entry.crop || "Detected Plant",
      condition: entry.name,
      confidence: entry.confidence || "90%",
      severity: entry.severity || "Moderate",
      recommendations,
    };
    setDiagnosisResult(result);

    // Sync this scan to the Admin Portal's AI Plant Doctor records, photo
    // included — an admin reviewing a diagnosis needs to see the leaf the
    // member actually uploaded, not just the label the model put on it.
    // The record is built inside the .then so it always carries a settled
    // photo; a photo that failed to encode simply arrives as null.
    if (onScanComplete) {
      Promise.resolve(syncPhotoRef.current).then((image) => {
        onScanComplete({
          id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
          plant: result.plantName,
          disease: entry.name,
          confidence: result.confidence,
          user: loggedInUser || "Website User",
          status: entry.severity === "High" ? "Critical" : "Disease Detected",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          recommendation: recommendations[0],
          image: image || null,
        });
      });
    }
  }, [plantDiseases, onScanComplete, loggedInUser]);

  // The scan finishes here rather than inside the setAnalysisProgress updater:
  // a state updater must stay pure, and running the result there fired it twice
  // under React's StrictMode double-invoke (two rows per scan in the Admin Portal).
  useEffect(() => {
    if (!isAnalyzing || analysisProgress < 100) return;
    clearInterval(progressTimerRef.current);
    setIsAnalyzing(false);
    showResult();
  }, [isAnalyzing, analysisProgress, showResult]);

  // Hands the finished diagnosis to the docked AI chat panel (bottom-right) —
  // the page itself stays put, the chat never takes the section over.
  const askAIAboutResult = () => {
    if (!onAskAI) return;
    onAskAI({
      bot: "plantDoctor",
      message: diagnosisResult ? buildChatHandoff(diagnosisResult) : null,
    });
  };

return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
<style>
        {`
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 5px rgba(var(--eco-c6-rgb), 0.2); }
            50% { box-shadow: 0 0 20px rgba(var(--eco-c6-rgb), 0.5); }
            100% { box-shadow: 0 0 5px rgba(var(--eco-c6-rgb), 0.2); }
          }
          @keyframes scanLine {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes blurPulse {
            0%, 100% { filter: blur(0px); }
            50% { filter: blur(2px); }
          }
        `}
      </style>

      {/* Premium Unlock Modal */}
      {showPremiumUnlock && (
        <div style={modalStyles.overlay} onClick={closePremiumUnlock}>
          <div 
            className="inner-blur-glass"
            style={modalStyles.premiumUnlockModal} 
            onClick={e => e.stopPropagation()}
          >
            <button style={modalStyles.closeBtn} onClick={closePremiumUnlock}>
              <FaTimes />
            </button>
            <div style={modalStyles.premiumLockIcon}>
              <FaLock size={32} />
            </div>
            <h2 style={modalStyles.premiumUnlockTitle}>Premium Feature Locked</h2>
            <p style={modalStyles.premiumUnlockSubtitle}>
              {premiumFeature?.name} is available exclusively for Premium subscribers.
            </p>
<div style={modalStyles.premiumFeatureInfo}>
              <div style={modalStyles.premiumFeatureInfoIcon}>{premiumFeature?.icon}</div>
              <p style={modalStyles.premiumFeatureDesc}>{premiumFeature?.description}</p>
            </div>
            <div style={modalStyles.premiumBenefits}>
              <h4 style={modalStyles.premiumBenefitsTitle}>Premium Benefits Include:</h4>
              <ul style={modalStyles.premiumBenefitsList}>
                <li><FaCheck style={{ color: "var(--eco-c6)" }} /> Advanced AI Diagnosis</li>
                <li><FaCheck style={{ color: "var(--eco-c6)" }} /> Crop Analytics</li>
                <li><FaCheck style={{ color: "var(--eco-c6)" }} /> Downloadable Reports</li>
                <li><FaCheck style={{ color: "var(--eco-c6)" }} /> Smart Alerts</li>
              </ul>
            </div>
            <button style={modalStyles.upgradeBtn} onClick={() => { closePremiumUnlock(); setActiveNav && setActiveNav("AI Data Subscription"); }}>
              <FaCrown style={{ marginRight: "8px" }} /> Upgrade to Premium
            </button>
            <button style={modalStyles.maybeLaterBtn} onClick={closePremiumUnlock}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/*
        The "AI Plant Doctor button" is interpreted here as the back button that navigates
        away from the AI Plant Doctor dashboard. Clicking it will reset the component's state.
      */}
      <div style={styles.header}>
        <button 
          style={styles.backBtn} 
          onClick={() => {
            resetAIPlantDoctorState(); // Clear the content/state before navigating away
            setActiveNav(isMobile ? "Home" : "ServicesPage");
          }}
        >
          <FaArrowLeft />
        </button>
        <div className="inner-blur-glass" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>AI Diagnostic Lab</span>
        </div>
      </div>

      <h1 style={styles.title}>
        AI Plant <span style={styles.accent}>Doctor Dashboard</span>
      </h1>
      <p style={styles.subtitle}>
        Advanced neural networks trained for Philippine micro-climates. Upload a clear photo of your plant's leaves for real-time analysis — then talk the results through with the AI Plant Doctor.
      </p>

      <div style={{ ...styles.mainGrid, ...(isMobile ? styles.mainGridMobile : {}) }}>
        {/* Left Column: Upload & Preview */}
        <div style={styles.leftCol}>
          <div 
            className="inner-blur-glass"
            style={{
              ...styles.uploadArea,
              borderColor: dragActive ? "var(--eco-c9)" : "rgba(var(--eco-c11-rgb), 0.25)",
              background: dragActive ? "rgba(var(--eco-c5-rgb), 0.28)" : "rgba(255,255,255,0.55)",
              animation: isAnalyzing ? "pulseGlow 2s infinite" : "none"
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => { if (!isAnalyzing && fileInputRef.current) fileInputRef.current.click(); }}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              style={{ display: "none" }} 
              onChange={handleFileChange}
              accept="image/*"
            />
            
            {selectedImage ? (
              <div style={styles.previewContainer}>
                <img src={selectedImage} alt="Plant Preview" style={styles.previewImg} />
                {isAnalyzing && <div style={styles.scanLine} />}
              </div>
            ) : (
              <div style={styles.uploadPlaceholder}>
                <FaUpload style={styles.uploadIcon} />
                <h3 style={styles.uploadText}>Drop image here or click to browse</h3>
                <p style={styles.uploadSubtext}>Supports JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div style={styles.uploadError} role="alert">
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{uploadError}</span>
            </div>
          )}

          <div style={styles.actionRow}>
            <button
              style={{ ...styles.primaryBtn, opacity: selectedImage && !isAnalyzing ? 1 : 0.55, cursor: selectedImage && !isAnalyzing ? "pointer" : "not-allowed" }}
              disabled={!selectedImage || isAnalyzing}
              onClick={startDiagnosis}
              onMouseEnter={(e) => (!selectedImage || isAnalyzing) ? null : e.currentTarget.style.transform = 'scale(1.035)'}
              onMouseLeave={(e) => (!selectedImage || isAnalyzing) ? null : e.currentTarget.style.transform = 'scale(1)'}
            >
              {isAnalyzing ? "Analyzing..." : "Start Diagnosis"}
            </button>
            {selectedImage && !isAnalyzing && (
              <button style={styles.secondaryBtn} onClick={clearImage}>
                Clear
              </button>
            )}
          </div>

          {/* Handoff to the chat that works with or without a scan — the panel
              docks in the corner, so this page stays on screen behind it. */}
          {onAskAI && (
            <button
              type="button"
              style={styles.askAIBtn}
              onClick={askAIAboutResult}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.16)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.08)"; }}
            >
              <FaComments />
              {diagnosisResult ? "Discuss this diagnosis with the AI" : "Chat with the AI Plant Doctor"}
            </button>
          )}
        </div>

        {/* Right Column: Steps & Results */}
        <div style={styles.rightCol}>
          {isAnalyzing || (analysisProgress > 0 && !diagnosisResult) ? (
            <div className="inner-blur-glass" style={styles.analysisCard}>
              <h3 style={styles.cardTitle}>AI Analysis in Progress</h3>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressBar, width: `${analysisProgress}%` }} />
              </div>
              <div style={styles.stepsList}>
                {ANALYSIS_STEPS.map((step) => {
                  const isCompleted = analysisProgress >= (step.id * 25);
                  const isCurrent = analysisProgress < (step.id * 25) && analysisProgress >= ((step.id - 1) * 25);
                  return (
                    <div key={step.id} style={{ ...styles.stepItem, opacity: isCompleted || isCurrent ? 1 : 0.4 }}>
                      <span style={{ ...styles.stepIcon, color: isCompleted ? "var(--eco-c6)" : "#fff" }}>
                        {isCompleted ? <FaCheckCircle /> : step.icon}
                      </span>
                      <span style={styles.stepLabel}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : diagnosisResult ? (
            <div style={styles.resultsContainer}>
              <div className="inner-blur-glass" style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <FaCheckCircle style={styles.successIcon} />
                  <div>
                    <h3 style={styles.resultPlant}>{diagnosisResult.plantName}</h3>
                    <p style={styles.resultConfidence}>Diagnosis Confidence: {diagnosisResult.confidence}</p>
                  </div>
                </div>
                <div style={styles.resultDivider} />
                <div style={styles.resultMain}>
                  <div style={styles.resultStat}>
                    <span style={styles.statLabel}>Detected Condition</span>
                    <span style={styles.statValue}>{diagnosisResult.condition}</span>
                  </div>
                  <div style={styles.resultStat}>
                    <span style={styles.statLabel}>Severity Level</span>
                    <span style={{ ...styles.statValue, color: "var(--eco-c6)" }}>{diagnosisResult.severity}</span>
                  </div>
                </div>
              </div>

              <div className="inner-blur-glass" style={styles.careCard}>
                <h3 style={styles.careTitle}>
                  <FaLightbulb style={{ marginRight: "8px" }} />
                  Care Recommendations
                </h3>
                <ul style={styles.recommendationList}>
                  {diagnosisResult.recommendations.map((rec, i) => (
                    <li key={i} style={styles.recItem}>
                      <FaLeaf style={styles.recBullet} />
                      {rec}
                    </li>
                  ))}
                </ul>
                {onAskAI && (
                  <button
                    type="button"
                    style={styles.followUpBtn}
                    onClick={askAIAboutResult}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <FaComments />
                    Ask a follow-up question
                  </button>
                )}
              </div>
            </div>
) : (
            <div className="inner-blur-glass" style={styles.emptyCard}>
              <FaRobot style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>Neural Engine Idle</h3>
              <p style={styles.emptyText}>Upload a plant photo to begin the diagnostic process. Our AI will analyze the leaf patterns to identify pests, diseases, or nutrient deficiencies.</p>
              <p style={styles.emptyText}>No photo to hand? Describe the symptoms to the AI Plant Doctor in the chat instead.</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Features Section */}
      <div style={styles.premiumFeaturesSection}>
        <h3 style={styles.premiumFeaturesTitle}>
          <FaCrown style={{ marginRight: "8px", color: "var(--eco-c6)" }} />
          Premium Features
        </h3>
        <p style={styles.premiumFeaturesSubtitle}>
          Unlock advanced diagnostic tools and analytics with Premium subscription.
        </p>
        <div style={styles.premiumFeaturesGrid}>
          {PREMIUM_FEATURES.map((feature) => (
            <div 
              key={feature.id}
              style={styles.premiumFeatureCard}
              onClick={() => handlePremiumFeatureClick(feature)}
            >
              <div style={styles.premiumFeatureLocked}>
                <div style={styles.blurOverlay}>
                  <FaLock style={styles.lockIcon} />
                </div>
                <div style={styles.premiumFeatureIcon}>{feature.icon}</div>
              </div>
              <div style={styles.premiumFeatureContent}>
                <h4 style={styles.premiumFeatureName}>{feature.name}</h4>
                <p style={styles.premiumFeatureDesc}>{feature.description}</p>
              </div>
              <button style={styles.unlockBtn}>
                <FaLock size={12} style={{ marginRight: "4px" }} /> Unlock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The page sits on the site's light sage background, so every surface here is a
// translucent white card with dark text — the same recipe the Farm Planner and
// Surplus Exchange pages use. (It previously carried a dark-theme palette of
// white text on near-transparent panels, which rendered invisible.)
const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', sans-serif",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  wrapMobile: {
    padding: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  backBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.06)",
    color: "var(--eco-c13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "5px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--eco-c9)",
    boxShadow: "0 0 5px rgba(var(--eco-c9-rgb), 0.9)",
  },
  title: {
    fontSize: "clamp(24px, 3.2vw, 38px)",
    fontWeight: 300,
    color: "#000",
    fontFamily: "'Poppins', sans-serif",
    margin: "0 0 12px",
    textAlign: "left",
    letterSpacing: "-0.5px",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c11), var(--eco-c9))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "15px",
    color: "rgba(0,0,0,0.7)",
    maxWidth: "640px",
    textAlign: "left",
    lineHeight: 1.6,
    marginBottom: "32px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "32px",
    alignItems: "start",
  },
  mainGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "20px",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minWidth: 0,
  },
  uploadArea: {
    height: "380px",
    borderRadius: "24px",
    border: "2px dashed rgba(var(--eco-c11-rgb), 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "border-color 0.25s ease, background 0.25s ease",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
    position: "relative",
  },
  previewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "4px",
    background: "rgba(var(--eco-c9-rgb), 0.85)",
    boxShadow: "0 0 15px var(--eco-c9)",
    animation: "scanLine 2s linear infinite",
    zIndex: 2,
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "40px",
    textAlign: "center",
  },
  uploadIcon: {
    fontSize: "44px",
    color: "rgba(var(--eco-c9-rgb), 0.55)",
    marginBottom: "8px",
  },
  uploadText: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  uploadSubtext: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.5)",
    margin: 0,
  },
  uploadError: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c7-rgb), 0.14)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.3)",
    color: "var(--eco-c13)",
    fontSize: "13px",
    lineHeight: 1.45,
    fontWeight: 600,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
  },
  primaryBtn: {
    flex: 1,
    padding: "15px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(var(--eco-c9-rgb), 0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
    transition: "transform 0.2s ease",
  },
  secondaryBtn: {
    padding: "15px 24px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.06)",
    color: "var(--eco-c13)",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  askAIBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "13px 18px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.08)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.28)",
    color: "var(--eco-c13)",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: 0,
  },
  analysisCard: {
    padding: "28px",
    borderRadius: "24px",
    textAlign: "left",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 20px",
  },
  progressTrack: {
    height: "8px",
    background: "rgba(var(--eco-c11-rgb), 0.12)",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "28px",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c11))",
    transition: "width 0.1s ease",
  },
  stepsList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "opacity 0.3s ease",
  },
  stepIcon: {
    fontSize: "18px",
  },
  stepLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "fadeInUp 0.5s ease",
  },
  resultCard: {
    padding: "22px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(var(--eco-c5-rgb), 0.35), rgba(255,255,255,0.7))",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.22)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  resultHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginBottom: "18px",
  },
  successIcon: {
    fontSize: "30px",
    color: "var(--eco-c11)",
    flexShrink: 0,
  },
  resultPlant: {
    fontSize: "19px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  resultConfidence: {
    fontSize: "13px",
    color: "var(--eco-c11)",
    margin: 0,
    fontWeight: 600,
  },
  resultDivider: {
    height: "1px",
    background: "rgba(0,0,0,0.08)",
    margin: "0 0 18px",
  },
  resultMain: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  resultStat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  statValue: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
  },
  careCard: {
    padding: "22px",
    borderRadius: "24px",
    textAlign: "left",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  careTitle: {
    fontSize: "17px",
    fontWeight: 700,
    margin: "0 0 14px",
    display: "flex",
    alignItems: "center",
    color: "var(--eco-c13)",
  },
  recommendationList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recItem: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "rgba(0,0,0,0.75)",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  recBullet: {
    fontSize: "13px",
    color: "var(--eco-c9)",
    marginTop: "4px",
    flexShrink: 0,
  },
  followUpBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "18px",
    width: "100%",
    padding: "12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    fontSize: "13.5px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(var(--eco-c9-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.4)",
    transition: "transform 0.2s ease",
  },
  emptyCard: {
    padding: "44px 28px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    textAlign: "center",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  emptyIcon: {
    fontSize: "44px",
    color: "rgba(var(--eco-c9-rgb), 0.5)",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
emptyText: {
    fontSize: "13.5px",
    color: "rgba(0,0,0,0.6)",
    lineHeight: 1.6,
    margin: 0,
  },
  // Premium Features Section
  premiumFeaturesSection: {
    marginTop: "32px",
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  premiumFeaturesTitle: {
    fontSize: "19px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
    display: "flex",
    alignItems: "center",
  },
  premiumFeaturesSubtitle: {
    fontSize: "13.5px",
    color: "rgba(0,0,0,0.6)",
    marginBottom: "20px",
  },
  premiumFeaturesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  premiumFeatureCard: {
    padding: "18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  premiumFeatureLocked: {
    position: "relative",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  blurOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(var(--eco-c11-rgb), 0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    color: "var(--eco-c13)",
    fontSize: "18px",
  },
  premiumFeatureIcon: {
    fontSize: "30px",
    color: "var(--eco-c9)",
    filter: "blur(4px)",
  },
  premiumFeatureContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  premiumFeatureName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  premiumFeatureDesc: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.55)",
    margin: 0,
    lineHeight: 1.4,
  },
  unlockBtn: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.3)",
    color: "var(--eco-c13)",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
};

const modalStyles = {
  overlay: modalOverlay(MODAL_LAYER.base, { overflow: "hidden" }),
  modalContent: {
    maxWidth: "420px",
    width: "100%",
    maxHeight: "500px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
  },
  modalContentMobile: {
    padding: "20px",
    maxHeight: "500px",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 50,
    background: "rgba(0,0,0,0.05)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "rgba(0,0,0,0.6)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
// Intro Modal Styles
  introIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.2), rgba(var(--eco-c11-rgb), 0.2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    border: "2px solid rgba(var(--eco-c6-rgb), 0.3)",
  },
  introIcon: {
    color: "var(--eco-c13)",
    fontSize: "24px",
  },
  introTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#000",
    textAlign: "center",
    margin: "0 0 8px",
  },
  introSubtitle: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.6)",
    marginBottom: "12px",
    textAlign: "center",
    lineHeight: 1.4,
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  featureIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--eco-c13)",
    fontSize: "14px",
    flexShrink: 0,
  },
  featureContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  featureTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#000",
  },
  featureDesc: {
    fontSize: "10px",
    color: "rgba(0,0,0,0.6)",
    lineHeight: 1.3,
  },
  primaryBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "var(--eco-c19)",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
    marginTop: "auto",
  },
// Premium Unlock Modal Styles
  premiumUnlockModal: {
    maxWidth: "420px",
    width: "100%",
    maxHeight: "500px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
  },
  premiumLockIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.2), rgba(var(--eco-c7-rgb), 0.2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    border: "2px solid rgba(var(--eco-c6-rgb), 0.3)",
    color: "var(--eco-c13)",
  },
  premiumUnlockTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#000",
    textAlign: "center",
    margin: "0 0 8px",
  },
  premiumUnlockSubtitle: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.6)",
    marginBottom: "20px",
    textAlign: "center",
  },
  premiumFeatureInfo: {
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c6-rgb), 0.08)",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  premiumFeatureInfoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(var(--eco-c6-rgb), 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--eco-c13)",
    fontSize: "20px",
  },
  premiumFeatureDesc: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.4,
  },
  premiumBenefits: {
    marginBottom: "20px",
  },
  premiumBenefitsTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 12px",
  },
  premiumBenefitsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
  },
  upgradeBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))",
    border: "none",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.3)",
    transition: "transform 0.2s ease",
    marginBottom: "12px",
  },
  maybeLaterBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    background: "transparent",
    border: "none",
    color: "rgba(0,0,0,0.5)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default AIPlantDoctor;
