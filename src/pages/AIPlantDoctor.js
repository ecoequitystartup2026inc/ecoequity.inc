import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaUpload, FaRobot, FaLeaf, FaFlask, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaArrowLeft, FaTimes, FaCheck, FaLock, FaCrown, FaStar } from "react-icons/fa";

// Premium features that require subscription
const PREMIUM_FEATURES = [
  { id: "advancedDiagnosis", name: "Advanced AI Diagnosis", icon: "🔬", description: "Deep learning analysis with 95%+ accuracy for complex plant diseases" },
  { id: "cropAnalytics", name: "Crop Analytics", icon: "📊", description: "Predictive growth metrics and yield forecasting" },
  { id: "downloadableReports", name: "Downloadable Reports", icon: "📥", description: "Export comprehensive PDF health reports" },
  { id: "smartAlerts", name: "Smart Alerts", icon: "🔔", description: "Real-time notifications for pest outbreaks and weather threats" },
];

const ANALYSIS_STEPS = [
  { id: 1, label: "Scanning Image Structure...", icon: <FaUpload /> },
  { id: 2, label: "Identifying Plant Species...", icon: <FaLeaf /> },
  { id: 3, label: "Detecting Symptom Patterns...", icon: <FaFlask /> },
  { id: 4, label: "Generating Health Report...", icon: <FaRobot /> },
];

function AIPlantDoctor({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [showPremiumUnlock, setShowPremiumUnlock] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState(null);
  const fileInputRef = useRef(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

/**
   * Resets all state variables related to the AI Plant Doctor's content and analysis.
   * This ensures a clean slate when navigating away or clearing the current session.
   */
  const resetAIPlantDoctorState = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setDiagnosisResult(null);
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
    setSelectedImage(URL.createObjectURL(file));
    setDiagnosisResult(null);
  };

  const startDiagnosis = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          showResult();
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const showResult = () => {
    setDiagnosisResult({
      plantName: "Heirloom Tomato",
      condition: "Early Blight (Fungal)",
      confidence: "94.2%",
      severity: "Moderate",
      recommendations: [
        "Remove infected lower leaves to prevent spore splash.",
        "Apply organic copper-based fungicide every 7-10 days.",
        "Improve air circulation by pruning excess foliage.",
        "Water at the base of the plant only, avoiding the leaves."
      ]
    });
  };

return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
<style>
        {`
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 5px rgba(74, 222, 128, 0.2); }
            50% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.5); }
            100% { box-shadow: 0 0 5px rgba(74, 222, 128, 0.2); }
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
                <li><FaCheck style={{ color: "#4ade80" }} /> Advanced AI Diagnosis</li>
                <li><FaCheck style={{ color: "#4ade80" }} /> Crop Analytics</li>
                <li><FaCheck style={{ color: "#4ade80" }} /> Downloadable Reports</li>
                <li><FaCheck style={{ color: "#4ade80" }} /> Smart Alerts</li>
              </ul>
            </div>
            <button style={modalStyles.upgradeBtn}>
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
        Advanced neural networks trained for Philippine micro-climates. Upload a clear photo of your plant's leaves for real-time analysis.
      </p>

      <div style={{ ...styles.mainGrid, ...(isMobile ? styles.mainGridMobile : {}) }}>
        {/* Left Column: Upload & Preview */}
        <div style={styles.leftCol}>
          <div 
            className="inner-blur-glass"
            style={{
              ...styles.uploadArea,
              borderColor: dragActive ? "#4ade80" : "rgba(255,255,255,0.2)",
              animation: isAnalyzing ? "pulseGlow 2s infinite" : "none"
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isAnalyzing && fileInputRef.current.click()}
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

          <div style={styles.actionRow}>
            <button 
              style={{ ...styles.primaryBtn, opacity: selectedImage && !isAnalyzing ? 1 : 0.6 }}
              disabled={!selectedImage || isAnalyzing}
              onClick={startDiagnosis}
              onMouseEnter={(e) => (!selectedImage || isAnalyzing) ? null : e.currentTarget.style.transform = 'scale(1.035)'}
              onMouseLeave={(e) => (!selectedImage || isAnalyzing) ? null : e.currentTarget.style.transform = 'scale(1)'}
            >
              {isAnalyzing ? "Analyzing..." : "Start Diagnosis"}
            </button>
            {selectedImage && !isAnalyzing && (
              <button style={styles.secondaryBtn} onClick={() => setSelectedImage(null)}>
                Clear
              </button>
            )}
          </div>
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
                      <span style={{ ...styles.stepIcon, color: isCompleted ? "#4ade80" : "#fff" }}>
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
                    <span style={{ ...styles.statValue, color: "#fbbf24" }}>{diagnosisResult.severity}</span>
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
              </div>
            </div>
) : (
            <div className="inner-blur-glass" style={styles.emptyCard}>
              <FaRobot style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>Neural Engine Idle</h3>
              <p style={styles.emptyText}>Upload a plant photo to begin the diagnostic process. Our AI will analyze the leaf patterns to identify pests, diseases, or nutrient deficiencies.</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Features Section */}
      <div style={styles.premiumFeaturesSection}>
        <h3 style={styles.premiumFeaturesTitle}>
          <FaCrown style={{ marginRight: "8px", color: "#fbbf24" }} />
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

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
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
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 14px",
    borderRadius: "999px",
    background: "rgba(22, 163, 74, 0.15)",
    border: "1px solid rgba(74, 222, 128, 0.3)",
    fontSize: "11px",
    fontWeight: 600,
    color: "#4ade80",
    textTransform: "uppercase",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 10px #4ade80",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 800,
    margin: "0 0 12px",
    textAlign: "left",
    letterSpacing: "-0.5px",
  },
  accent: {
    background: "linear-gradient(90deg, #4ade80, #86efac)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
    maxWidth: "600px",
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
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  uploadArea: {
    height: "380px",
    borderRadius: "24px",
    border: "2px dashed rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.3s ease",
    background: "rgba(255,255,255,0.03)",
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
    background: "rgba(74, 222, 128, 0.8)",
    boxShadow: "0 0 15px #4ade80",
    animation: "scanLine 2s linear infinite",
    zIndex: 2,
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "40px",
  },
  uploadIcon: {
    fontSize: "48px",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "8px",
  },
  uploadText: {
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
  },
  uploadSubtext: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
  },
  primaryBtn: {
    flex: 1,
    padding: "16px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34, 197, 94, 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
  },
  secondaryBtn: {
    padding: "16px 24px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  analysisCard: {
    padding: "32px",
    borderRadius: "24px",
    textAlign: "left",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 24px",
  },
  progressTrack: {
    height: "8px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "32px",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #4ade80, #22c55e)",
    boxShadow: "0 0 10px #4ade80",
    transition: "width 0.1s ease",
  },
  stepsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "opacity 0.3s ease",
  },
  stepIcon: {
    fontSize: "20px",
  },
  stepLabel: {
    fontSize: "15px",
    fontWeight: 500,
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    animation: "fadeInUp 0.5s ease",
  },
  resultCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(22, 163, 74, 0.15), rgba(255,255,255,0.05))",
  },
  resultHeader: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "32px",
    color: "#4ade80",
  },
  resultPlant: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
  },
  resultConfidence: {
    fontSize: "13px",
    color: "rgba(74, 222, 128, 0.8)",
    margin: 0,
    fontWeight: 600,
  },
  resultDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "0 0 20px",
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
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "16px",
    fontWeight: 700,
  },
  careCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
  },
  careTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
    color: "#4ade80",
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
    color: "rgba(255,255,255,0.8)",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  recBullet: {
    fontSize: "14px",
    color: "#4ade80",
    marginTop: "3px",
    flexShrink: 0,
  },
  emptyCard: {
    padding: "48px 32px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    textAlign: "center",
    opacity: 0.6,
  },
  emptyIcon: {
    fontSize: "48px",
    color: "rgba(255,255,255,0.2)",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
  },
emptyText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.6,
    margin: 0,
  },
  // Premium Features Section
  premiumFeaturesSection: {
    marginTop: "32px",
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  premiumFeaturesTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 8px",
    display: "flex",
    alignItems: "center",
  },
  premiumFeaturesSubtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "20px",
  },
  premiumFeaturesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  premiumFeatureCard: {
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
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
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "blurPulse 2s ease-in-out infinite",
  },
  lockIcon: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "18px",
  },
  premiumFeatureIcon: {
    fontSize: "32px",
    color: "rgba(255,255,255,0.5)",
    filter: "blur(4px)",
  },
  premiumFeatureContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  premiumFeatureName: {
    fontSize: "16px",
    fontWeight: 700,
    margin: 0,
  },
  premiumFeatureDesc: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    margin: 0,
    lineHeight: 1.4,
  },
  unlockBtn: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    animation: "fadeIn 0.3s ease",
    overflow: "hidden",
  },
  modalContent: {
    maxWidth: "420px",
    width: "100%",
    maxHeight: "500px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))",
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
    background: "linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(21, 128, 61, 0.2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    border: "2px solid rgba(74, 222, 128, 0.3)",
  },
  introIcon: {
    color: "#15803d",
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
    background: "rgba(22, 163, 74, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#15803d",
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
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34, 197, 94, 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
    marginTop: "auto",
  },
// Premium Unlock Modal Styles
  premiumUnlockModal: {
    maxWidth: "420px",
    width: "100%",
    maxHeight: "500px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))",
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
    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    border: "2px solid rgba(251, 191, 36, 0.3)",
    color: "#f59e0b",
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
    background: "rgba(251, 191, 36, 0.08)",
    border: "1px solid rgba(251, 191, 36, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  premiumFeatureInfoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(251, 191, 36, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f59e0b",
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
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "none",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
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
