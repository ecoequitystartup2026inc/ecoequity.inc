import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaUserTie, FaClock, FaStar, FaPlayCircle, FaTimes, FaCheckCircle, FaChevronDown, FaCreditCard, FaQrcode } from "react-icons/fa";

const coursesData = [
  {
    id: 1,
    title: "Urban Hydroponics Masterclass",
    desc: "Master soil-less farming techniques optimized for small urban spaces and balconies. Perfect for starting your own micro-farm.",
    instructor: "Dr. Maria Santos",
    duration: "4 Weeks",
    lessons: 12,
    price: "₱1,500",
    icon: "🌱",
    badge: "Best Seller",
    rating: 4.9,
    progress: 0,
  },
  {
    id: 2,
    title: "Advanced Crop Diagnostics",
    desc: "A deep dive into identifying native Philippine crop diseases and applying organic treatments effectively.",
    instructor: "Prof. Juan Dela Cruz",
    duration: "6 Weeks",
    lessons: 18,
    price: "₱2,200",
    icon: "🔬",
    badge: "Advanced",
    rating: 4.8,
    progress: 0,
  },
  {
    id: 3,
    title: "Commercial Surplus Management",
    desc: "Learn to efficiently manage, list, and distribute commercial agricultural surplus to institutional buyers.",
    instructor: "Engr. Ana Reyes",
    duration: "3 Weeks",
    lessons: 8,
    price: "₱1,200",
    icon: "📦",
    badge: "B2B Focus",
    rating: 4.7,
    progress: 0,
  },
  {
    id: 4,
    title: "Organic Pest Control Strategies",
    desc: "Discover sustainable, chemical-free methods to protect your crops from common regional pests and insects.",
    instructor: "Dr. Maria Santos",
    duration: "4 Weeks",
    lessons: 10,
    price: "₱1,400",
    icon: "🐞",
    badge: "Essential",
    rating: 4.9,
    progress: 0,
  }
];

function SpecialistCertification({ setActiveNav, onCertificateUnlock }) {
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [courses, setCourses] = useState(coursesData);
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState(null);
  const [isViewingOnly, setIsViewingOnly] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [lastEnrolledCourse, setLastEnrolledCourse] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    // Added for certificate download modal
    downloadFormat: "PDF",
    isDownloading: false,
    downloadSuccess: false,
    email: "",
    phone: "",
    learningMode: "Online (Self-Paced)",
    paymentMethod: "Credit Card",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    refNumber: "",
  });
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedEnrollCourse || showSuccess || activeCourse || showCertificatePreview || showDownloadModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = ""; // Ensure overflow is reset
    };
  }, [selectedEnrollCourse, showSuccess, activeCourse, showCertificatePreview, showDownloadModal]);

  const handleCloseModal = () => {
    setSelectedEnrollCourse(null);
    setIsViewingOnly(false);
  };

  const handleLessonClick = (lessonIndex, isCurrent) => {
    if (activeCourse && isCurrent) {
      const newProgress = Math.min(100, Math.round(((lessonIndex + 1) / activeCourse.lessons) * 100));
      const updatedCourse = { ...activeCourse, progress: newProgress };
      setActiveCourse(updatedCourse);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      if (lastEnrolledCourse && lastEnrolledCourse.id === updatedCourse.id) {
        setLastEnrolledCourse(updatedCourse);
      }

      if (newProgress === 100 && onCertificateUnlock) {
        onCertificateUnlock(updatedCourse);
      }
    }
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const initialProgress = Math.round(100 / selectedEnrollCourse.lessons);
      setCourses(prevCourses => prevCourses.map(c => c.id === selectedEnrollCourse.id ? { ...c, progress: initialProgress } : c));
      setLastEnrolledCourse({ ...selectedEnrollCourse, progress: initialProgress });
      setSelectedEnrollCourse(null);
      setShowSuccess(true);
      setFormData({ fullName: "", email: "", phone: "", learningMode: "Online (Self-Paced)", paymentMethod: "Credit Card", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", refNumber: "" });
    }, 1500);
  };

  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 19);
    const formatted = v.match(/.{1,4}/g)?.join(' ') || "";
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleCardExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length === 1 && parseInt(v) > 1) {
      v = '0' + v;
    }
    v = v.substring(0, 4);
    let formatted = v;
    if (v.length > 2) {
      formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    setFormData({ ...formData, cardExpiry: formatted });
  };

  const handleCardCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 4);
    setFormData({ ...formData, cardCvv: v });
  };

  const handleDownloadCertificate = () => {
    if (!activeCourse) return;
    setFormData(prev => ({ ...prev, isDownloading: true, downloadSuccess: false }));
    setTimeout(() => {
      setFormData(prev => ({ ...prev, isDownloading: false, downloadSuccess: true }));
      // Simulate actual download or API call
      console.log(`Downloading certificate for ${activeCourse.title} in ${formData.downloadFormat} format.`);
      setTimeout(() => {
        setShowDownloadModal(false);
        setFormData(prev => ({ ...prev, downloadSuccess: false })); // Reset success state
      }, 1500); // Close modal after success message
    }, 2000);
  };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHoveredBack ? styles.backBtnHov : {}),
            }}
              onClick={() => setActiveNav && setActiveNav(isMobile ? "Home" : "ProductsPage")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          > 
            <span>←</span>
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Specialist Certification</span>
        </div>
      </div>

      <h1 style={styles.title}>
        Level Up Your <span style={styles.accent}>Green Skills</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Gain verifiable expertise with our curated online courses. Learn from top agriculture specialists in the Philippines and earn certifications to boost your micro-vendor credibility.
      </p>

      <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : {}) }}>
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="inner-blur-glass"
            style={{ 
              ...styles.card, 
              ...(hoveredCourse === course.id ? styles.cardHov : {}) 
            }}
            onMouseEnter={() => setHoveredCourse(course.id)}
            onMouseLeave={() => setHoveredCourse(null)}
          >
            <div style={styles.imageContainer}>
              <div style={styles.imagePlaceholder}>
                <span style={{ fontSize: "52px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}>
                  {course.icon}
                </span>
              </div>
              {course.badge && (
                <span style={styles.badgeLabel}>
                  {course.badge}
                </span>
              )}
              <div style={styles.ratingBadge}>
                <FaStar style={{ color: "#fbbf24", marginRight: "4px" }} />
                {course.rating}
              </div>
            </div>
            
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{course.title}</h3>
              </div>
              
              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <FaUserTie style={styles.metaIcon} />
                  <span>{course.instructor}</span>
                </div>
                <div style={styles.metaItem}>
                  <FaClock style={styles.metaIcon} />
                  <span>{course.duration}</span>
                </div>
                <div style={styles.metaItem}>
                  <FaPlayCircle style={styles.metaIcon} />
                  <span>{course.lessons} Lessons</span>
                </div>
              </div>
              
              <p style={styles.cardDesc}>{course.desc}</p>

              {/* Progress Indicator */}
              <div style={styles.progressWrap}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Course Progress</span>
                  <span style={styles.progressValue}>{course.progress}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${course.progress}%` }} />
                </div>
              </div>
              
              <div style={styles.cardFooter}>
                <span style={styles.cardPrice}>{course.price}</span>
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.viewBtn}
                    onClick={() => {
                      setSelectedEnrollCourse(course);
                      setIsViewingOnly(true);
                    }}
                  >View Course</button>
                  {course.progress > 0 ? (
                    <button 
                      style={styles.enrollBtn}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => setActiveCourse(course)}
                    >Continue Course</button>
                  ) : (
                    <button 
                      style={styles.enrollBtn}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => {
                        setSelectedEnrollCourse(course);
                        setIsViewingOnly(false);
                      }}
                    >Enroll Now</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Modal */}
      {selectedEnrollCourse && !showSuccess && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div 
            className="inner-blur-glass custom-scrollbar" 
            style={{ ...styles.modalContent, ...(isMobile ? styles.modalContentMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={handleCloseModal} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <FaTimes />
            </button>
            <h2 style={styles.modalTitle}>{isViewingOnly ? 'Course Details' : 'Enroll in Certification'}</h2>
            
            <div style={styles.courseSummaryCard}>
              <div style={styles.courseSummaryIcon}>{selectedEnrollCourse.icon}</div>
              <div style={styles.courseSummaryInfo}>
                <h3 style={styles.courseSummaryTitle}>{selectedEnrollCourse.title}</h3>
                <p style={styles.courseSummaryDesc}>Instructor: {selectedEnrollCourse.instructor}</p>
              </div>
              <div style={styles.courseSummaryPrice}>{selectedEnrollCourse.price}</div>
            </div>

            {isViewingOnly ? (
              <div style={{animation: "fadeIn 0.5s ease-out"}}>
                <p style={{...styles.cardDesc, fontSize: '14px', margin: '16px 0', color: 'rgba(0,0,0,0.8)'}}>{selectedEnrollCourse.desc}</p>
                <div style={{...styles.metaRow, marginBottom: '24px'}}>
                  <div style={styles.metaItem}>
                    <FaUserTie style={styles.metaIcon} />
                    <span>{selectedEnrollCourse.instructor}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FaClock style={styles.metaIcon} />
                    <span>{selectedEnrollCourse.duration}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FaPlayCircle style={styles.metaIcon} />
                    <span>{selectedEnrollCourse.lessons} Lessons</span>
                  </div>
                </div>
                <button 
                  style={styles.submitBtn} 
                  onClick={() => setIsViewingOnly(false)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Enroll Now - {selectedEnrollCourse.price}
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} style={styles.enrollForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Full Name</label>
                  <input required type="text" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={styles.inputField} />
                </div>
                <div style={{ ...styles.inputRow, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.inputLabel}>Email Address</label>
                    <input required type="email" placeholder="juan@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.inputField} />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.inputLabel}>Phone Number</label>
                    <input required type="tel" placeholder="0912 345 6789" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.inputField} />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Learning Mode</label>
                  <CustomDropdown 
                    options={["Online (Self-Paced)", "Hybrid (Online + 1 Field Session)"]}
                    value={formData.learningMode}
                    onChange={val => setFormData({...formData, learningMode: val})}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Payment Method</label>
                  <div style={styles.paymentOptions}>
                    {['Credit Card', 'GCash', 'Maya'].map(method => (
                      <button 
                        key={method} 
                        type="button" 
                        onClick={() => setFormData({...formData, paymentMethod: method})}
                        style={{
                          ...styles.paymentBtn,
                          ...(formData.paymentMethod === method ? styles.paymentBtnActive : {})
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.paymentDetailsWrapper}>
                  {formData.paymentMethod === 'Credit Card' && (
                    <div style={styles.paymentDetailsContainer}>
                      <div style={styles.paymentHeader}>
                        <FaCreditCard style={{ color: '#15803d' }} />
                        <span>Pay with Credit/Debit Card</span>
                      </div>
                      <input type="text" placeholder="Cardholder Name" required value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} style={styles.inputField} />
                      <input type="text" placeholder="Card Number" required value={formData.cardNumber} onChange={handleCardNumberChange} style={styles.inputField} />
                      <div style={styles.inputRow}>
                        <input type="text" placeholder="MM/YY" required value={formData.cardExpiry} onChange={handleCardExpiryChange} style={{...styles.inputField, flex: 1}} />
                        <input type="text" placeholder="CVV" required value={formData.cardCvv} onChange={handleCardCvvChange} style={{...styles.inputField, flex: 1}} />
                      </div>
                    </div>
                  )}

                  {(formData.paymentMethod === 'GCash' || formData.paymentMethod === 'Maya') && (
                    <div style={styles.paymentDetailsContainer}>
                      <div style={styles.qrContainer}>
                        <div style={styles.qrCodePlaceholder}><FaQrcode size={48} style={{ color: 'rgba(0,0,0,0.1)' }} /></div>
                        <div style={styles.qrInstruction}>
                          <p style={{ margin: "0 0 4px" }}>Scan the QR code using your {formData.paymentMethod} app to pay.</p>
                          <strong style={{ color: "#15803d" }}>Amount: {selectedEnrollCourse.price}</strong>
                        </div>
                      </div>
                      <input type="text" placeholder="Transaction Reference Number" required value={formData.refNumber} onChange={e => setFormData({...formData, refNumber: e.target.value})} style={styles.inputField} />
                      <button type="button" onClick={() => window.open(formData.paymentMethod === 'GCash' ? 'https://m.gcash.com' : 'https://maya.ph', '_blank')} style={styles.redirectBtn}>Open {formData.paymentMethod} App</button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  style={{ ...styles.submitBtn, opacity: isProcessing ? 0.7 : 1 }}
                  disabled={isProcessing}
                  onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isProcessing ? "Processing..." : `Confirm Payment - ${selectedEnrollCourse.price}`}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccess && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowSuccess(false)}>
           <div className="inner-blur-glass" style={styles.successModal} onClick={(e) => e.stopPropagation()}>
             <div style={styles.successIconWrap}>
               <FaCheckCircle style={styles.successIcon} />
             </div>
             <h2 style={styles.successTitle}>Enrollment Successful!</h2>
             <p style={styles.successText}>Welcome aboard! Your course materials and receipt have been sent to your email.</p>
             <button style={styles.successBtn} onClick={() => { setShowSuccess(false); setActiveCourse(lastEnrolledCourse); }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
               Start Learning
             </button>
           </div>
        </div>,
        document.body
      )}

      {/* Active Course Player Modal */}
      {activeCourse && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setActiveCourse(null)}>
          <div 
            className="inner-blur-glass custom-scrollbar" 
            style={{ ...styles.modalContent, maxWidth: "800px", ...(isMobile ? styles.modalContentMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setActiveCourse(null)} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <FaTimes />
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingRight: "30px" }}>
              <span style={{ fontSize: "28px" }}>{activeCourse.icon}</span>
              <h2 style={{ ...styles.modalTitle, margin: 0 }}>{activeCourse.title}</h2>
            </div>
            
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
               <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1530836369250-ef71a3f5e4bb?auto=format&fit=crop&q=80&w=1000') center/cover", opacity: 0.5 }} />
               <FaPlayCircle size={64} color="rgba(255,255,255,0.9)" style={{ cursor: "pointer", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))", transition: "transform 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
            </div>

            <div style={styles.progressWrap}>
               <div style={styles.progressHeader}>
                 <span style={styles.progressLabel}>Course Progress</span>
                 <span style={styles.progressValue}>{activeCourse.progress}%</span>
               </div>
               <div style={styles.progressBarBg}>
                 <div style={{ ...styles.progressBarFill, width: `${activeCourse.progress}%` }} />
               </div>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#000", marginBottom: "12px", marginTop: "8px" }}>Curriculum</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
              {[...Array(activeCourse.lessons)].map((_, i) => {
                const lessonPercentage = 100 / activeCourse.lessons;
                const completedLessons = Math.round(activeCourse.progress / lessonPercentage);
                const isCompleted = i < completedLessons;
                const isCurrent = i === completedLessons;
                return (
                  <div 
                    key={i} 
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: isCurrent ? "rgba(22, 163, 74, 0.1)" : "rgba(255,255,255,0.6)", borderRadius: "12px", border: isCurrent ? "1px solid rgba(22, 163, 74, 0.3)" : "1px solid rgba(0,0,0,0.05)", cursor: isCurrent || isCompleted ? "pointer" : "default", transition: "all 0.2s ease", opacity: !isCompleted && !isCurrent ? 0.6 : 1 }} 
                    onMouseEnter={(e) => { if (isCurrent || isCompleted) e.currentTarget.style.background = isCurrent ? "rgba(22, 163, 74, 0.15)" : "rgba(255,255,255,0.9)" }} 
                    onMouseLeave={(e) => { if (isCurrent || isCompleted) e.currentTarget.style.background = isCurrent ? "rgba(22, 163, 74, 0.1)" : "rgba(255,255,255,0.6)" }}
                    onClick={() => handleLessonClick(i, isCurrent)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {isCompleted ? <FaCheckCircle color="#16a34a" size={16} /> : <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: isCurrent ? "2px solid #15803d" : "2px solid rgba(0,0,0,0.2)" }} />}
                      <span style={{ fontSize: "14px", fontWeight: isCurrent || isCompleted ? 700 : 500, color: isCurrent ? "#15803d" : "#000" }}>
                        Lesson {i + 1}: {i === 0 ? "Introduction & Overview" : i === 1 ? "Core Concepts & Fundamentals" : `Advanced Module ${i - 1}`}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: isCurrent ? "#15803d" : "rgba(0,0,0,0.5)", fontWeight: 600 }}>
                      {isCurrent ? "Start Lesson" : `${10 + i * 2}:00`}
                    </span>
                  </div>
                );
              })}
            </div>

            {activeCourse.progress === 100 && (
              <div style={{ animation: "fadeIn 0.5s ease-out", marginTop: "24px", padding: "20px", background: "linear-gradient(135deg, rgba(134,239,172,0.2), rgba(125,211,252,0.2))", borderRadius: "16px", border: "1px solid rgba(22, 163, 74, 0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#15803d", margin: "0 0 4px" }}>🎉 Course Completed!</h3>
                  <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.7)", margin: 0 }}>You've unlocked your Specialist Certificate.</p>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button 
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.08)", transition: "transform 0.2s ease" }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setShowCertificatePreview(true)}
                  >
                    View
                  </button>
                  <button 
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.2)", color: "#0284c7", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.08)", transition: "transform 0.2s ease" }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Specialist Certificate', text: `I just earned my ${activeCourse.title} certificate on EcoEquity!`, url: window.location.href }).catch(console.error);
                      } else {
                        alert(`Share options for ${activeCourse.title} Certificate`);
                      }
                    }}
                  >
                    Share
                  </button>
                  <button 
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.15)", transition: "transform 0.2s ease" }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setShowDownloadModal(true)}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Certificate Preview Modal */}
      {showCertificatePreview && activeCourse && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowCertificatePreview(false)}>
          <div 
            className="inner-blur-glass custom-scrollbar" 
            style={{ ...styles.modalContent, maxWidth: "800px", padding: "32px", ...(isMobile ? styles.modalContentMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setShowCertificatePreview(false)} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <FaTimes />
            </button>
            <h2 style={{ ...styles.modalTitle, marginBottom: "20px" }}>Certificate Preview</h2>
            <div style={{ width: "100%", aspectRatio: "1.414/1", background: "linear-gradient(135deg, #e0ffe0, #c0f0c0)", border: "1px solid #16a34a", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#15803d", marginBottom: "10px" }}>Certificate of Completion</h3>
              <p style={{ fontSize: "18px", color: "rgba(0,0,0,0.7)", marginBottom: "20px" }}>This certifies that</p>
              <h2 style={{ fontSize: "42px", fontWeight: 900, color: "#000", marginBottom: "10px", textDecoration: "underline" }}>Juan Dela Cruz</h2>
              <p style={{ fontSize: "18px", color: "rgba(0,0,0,0.7)", marginBottom: "30px" }}>has successfully completed the course</p>
              <h3 style={{ fontSize: "32px", fontWeight: 800, color: "#15803d", marginBottom: "40px" }}>"{activeCourse.title}"</h3>
              <div style={{ display: "flex", justifyContent: "space-between", width: "80%" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(0,0,0,0.8)", borderTop: "1px solid rgba(0,0,0,0.3)", paddingTop: "5px" }}>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(0,0,0,0.8)", borderTop: "1px solid rgba(0,0,0,0.3)", paddingTop: "5px" }}>VerdeVersity</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Certificate Download Modal */}
      {showDownloadModal && activeCourse && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowDownloadModal(false)}>
          <div 
            className="inner-blur-glass custom-scrollbar" 
            style={{ ...styles.modalContent, maxWidth: "500px", padding: "32px", ...(isMobile ? styles.modalContentMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setShowDownloadModal(false)} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <FaTimes />
            </button>
            <h2 style={{ ...styles.modalTitle, marginBottom: "10px" }}>Download Certificate</h2>
            <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.7)", marginBottom: "20px", textAlign: "center" }}>
              Get your certificate for <strong>{activeCourse.title}</strong>.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Download Format</label>
              <CustomDropdown 
                options={["PDF", "PNG", "JPEG"]}
                value={formData.downloadFormat}
                onChange={val => setFormData({...formData, downloadFormat: val})}
              />
            </div>

            {formData.downloadSuccess ? (
              <div style={{ animation: "fadeIn 0.5s ease-out", textAlign: "center", marginTop: "20px" }}>
                <FaCheckCircle style={{ fontSize: "48px", color: "#16a34a", marginBottom: "10px" }} />
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#15803d" }}>Download Complete!</p>
                <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Your certificate has been downloaded.</p>
              </div>
            ) : (
              <button 
                type="button" 
                style={{ 
                  ...styles.submitBtn, 
                  marginTop: "20px", 
                  opacity: formData.isDownloading ? 0.7 : 1 
                }}
                disabled={formData.isDownloading}
                onClick={handleDownloadCertificate}
                onMouseEnter={(e) => !formData.isDownloading && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => !formData.isDownloading && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {formData.isDownloading ? "Downloading..." : `Download as ${formData.downloadFormat}`}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 16px 60px", maxWidth: "1100px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "16px 12px 40px",
  },
  headerRow: {
    display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", marginBottom: "20px",
  },
  backBtnWrap: {
    position: "absolute", left: 0, top: "-5px",
  },
  backBtn: {
    padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s ease",
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: 600, color: "#15803d", letterSpacing: "0.6px", textTransform: "uppercase", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)", display: "inline-block",
  },
  title: {
    fontSize: "clamp(32px, 4.5vw, 46px)", fontWeight: 800, color: "#000", margin: "0 auto 16px", lineHeight: 1.15, letterSpacing: "-0.8px", textShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  titleUnderline: {
    width: "118px", height: "4px", background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)", backgroundSize: "200% 100%", margin: "0 auto 18px", boxShadow: "0 0 18px rgba(134,239,172,0.75)", borderRadius: "999px",
  },
  accent: {
    background: "linear-gradient(90deg, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  body: {
    color: "#000", marginBottom: "40px", fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, lineHeight: 1.6, maxWidth: "700px",
  },
  bodyMobile: {
    marginBottom: "24px",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px", width: "100%",
  },
  gridMobile: {
    gridTemplateColumns: "1fr", gap: "20px",
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", transition: "transform 0.3s ease, box-shadow 0.3s ease", textAlign: "left",
  },
  cardHov: {
    transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(21,128,61,0.12)",
  },
  imageContainer: {
    position: "relative", width: "100%", height: "160px", background: "linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(14, 165, 233, 0.15))", display: "flex", alignItems: "center", justifyContent: "center",
  },
  imagePlaceholder: {
    width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  badgeLabel: {
    position: "absolute", top: "16px", left: "16px", background: "linear-gradient(135deg, #22c55e, #15803d)", color: "#fff", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 4px 10px rgba(21,128,61,0.3)",
  },
  ratingBadge: {
    position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.9)", color: "#000", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  cardContent: {
    padding: "24px", display: "flex", flexDirection: "column", flex: 1,
  },
  cardHeader: {
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "20px", fontWeight: 800, color: "#000", margin: 0, lineHeight: 1.2,
  },
  metaRow: {
    display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px",
  },
  metaItem: {
    display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500,
  },
  metaIcon: {
    color: "#16a34a", fontSize: "13px",
  },
  cardDesc: {
    fontSize: "13.5px", color: "rgba(0,0,0,0.7)", lineHeight: 1.6, margin: "0 0 24px", flex: 1,
  },
  progressWrap: {
    marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px",
  },
  progressHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.8)",
  },
  progressBarBg: {
    width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", overflow: "hidden",
  },
  progressBarFill: {
    height: "100%", background: "linear-gradient(90deg, #4ade80, #16a34a)", borderRadius: "999px", transition: "width 0.5s ease-out",
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "20px", gap: "12px", flexWrap: "wrap",
  },
  cardPrice: {
    fontSize: "22px", fontWeight: 800, color: "#15803d",
  },
  actionButtons: {
    display: "flex", gap: "8px", flex: 1, justifyContent: "flex-end",
  },
  viewBtn: {
    padding: "10px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.1)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s ease",
  },
  enrollBtn: {
    padding: "10px 18px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease",
  },
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease",
  },
  modalContent: {
    maxWidth: "540px", width: "100%", maxHeight: "90vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto", textAlign: "left", boxSizing: "border-box",
  },
  modalContentMobile: {
    padding: "24px 16px"
  },
  closeBtn: {
    position: "absolute", top: "16px", right: "16px", zIndex: 50, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "background 0.2s ease",
  },
  modalTitle: {
    fontSize: "24px", fontWeight: 800, color: "#000", margin: "0 0 20px", lineHeight: 1.2, letterSpacing: "-0.5px"
  },
  courseSummaryCard: {
    display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.2)", borderRadius: "16px", marginBottom: "24px"
  },
  courseSummaryIcon: {
    width: "48px", height: "48px", background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", flexShrink: 0
  },
  courseSummaryInfo: {
    flex: 1, display: "flex", flexDirection: "column", gap: "4px"
  },
  courseSummaryTitle: {
    fontSize: "15px", fontWeight: 700, margin: 0, color: "#000", lineHeight: 1.2
  },
  courseSummaryDesc: {
    fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0, fontWeight: 500
  },
  courseSummaryPrice: {
    fontSize: "16px", fontWeight: 800, color: "#15803d"
  },
  enrollForm: {
    display: "flex", flexDirection: "column", gap: "16px"
  },
  inputGroup: {
    display: "flex", flexDirection: "column", gap: "6px"
  },
  inputRow: {
    display: "flex", gap: "12px", width: "100%"
  },
  inputLabel: {
    fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "4px"
  },
  inputField: {
    width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease", fontFamily: "inherit"
  },
  customDropdownWrap: { position: "relative", width: "100%" },
  customDropdownHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255, 255, 255, 0.8)", fontSize: "14px", color: "#000", cursor: "pointer", transition: "all 0.2s ease", outline: "none", textAlign: "left", boxSizing: "border-box", fontFamily: "inherit"
  },
  customDropdownHeaderActive: {
    borderColor: "#16a34a", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)", background: "rgba(255, 255, 255, 0.95)"
  },
  customDropdownList: {
    position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", maxHeight: "200px", overflowY: "auto", animation: "fadeIn 0.2s ease"
  },
  customDropdownItem: {
    padding: "10px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s ease"
  },
  customDropdownItemActive: {
    background: "rgba(34, 197, 94, 0.12)", color: "#15803d", fontWeight: 700
  },
  paymentOptions: {
    display: "flex", gap: "8px", flexWrap: "wrap"
  },
  paymentBtn: {
    flex: 1, minWidth: "100px", padding: "10px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600, color: "rgba(0,0,0,0.7)", cursor: "pointer", transition: "all 0.2s ease"
  },
  paymentBtnActive: {
    background: "rgba(22, 163, 74, 0.1)", border: "1px solid #16a34a", color: "#15803d", fontWeight: 700, boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)"
  },
  submitBtn: {
    marginTop: "8px", padding: "16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)", transition: "all 0.2s ease"
  },
  successModal: {
    maxWidth: "400px", width: "100%", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "32px", padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", boxSizing: "border-box"
  },
  successIconWrap: {
    width: "72px", height: "72px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px"
  },
  successIcon: {
    fontSize: "36px", color: "#16a34a"
  },
  successTitle: {
    fontSize: "24px", fontWeight: 800, color: "#000", margin: "0 0 12px", letterSpacing: "-0.5px"
  },
  successText: {
    fontSize: "14px", color: "rgba(0,0,0,0.6)", marginBottom: "32px", lineHeight: 1.5
  },
  successBtn: {
    width: "100%", padding: "14px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)", transition: "transform 0.2s ease"
  },
  paymentDetailsWrapper: { animation: "fadeIn 0.5s ease-out", marginTop: "4px" },
  paymentDetailsContainer: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' },
  paymentHeader: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, color: '#000', marginBottom: '8px' },
  qrContainer: { display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px' },
  qrCodePlaceholder: { width: '80px', height: '80px', flexShrink: 0, background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' },
  qrInstruction: { textAlign: 'left', fontSize: '13px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 },
  redirectBtn: { padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' },
};

const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={styles.customDropdownWrap} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.customDropdownHeader,
          ...(isOpen ? styles.customDropdownHeaderActive : {}),
        }}
      >
        <span>{value || placeholder}</span>
        <FaChevronDown style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', color: '#15803d' }} size={12} />
      </button>
      {isOpen && (
        <div className="inner-blur-glass custom-scrollbar" style={styles.customDropdownList}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ ...styles.customDropdownItem, ...(value === opt ? styles.customDropdownItemActive : {}) }}
              onMouseEnter={(e) => { if (value !== opt) { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)'; e.currentTarget.style.color = '#15803d'; } }}
              onMouseLeave={(e) => { if (value !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000'; } }}
            >
              <span>{opt}</span>
              {value === opt && <FaCheckCircle size={14} style={{ color: '#16a34a' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialistCertification;