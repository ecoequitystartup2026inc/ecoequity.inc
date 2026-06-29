import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaPaperPlane, FaHeadset, FaUser, FaEnvelope, FaTag, FaCommentDots, FaUpload, FaCheckCircle, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";

const SupportTicketModal = ({ isOpen, onClose, loggedInUser, userEmail, onSubmit, isMobile }) => {
  const [formData, setFormData] = useState({
    name: loggedInUser || "",
    email: userEmail || "",
    subject: "",
    category: "General Inquiry",
    description: "",
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || loggedInUser || "",
      email: prev.email || userEmail || "",
    }));
  }, [isOpen, loggedInUser, userEmail]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      console.log("Support ticket submitted:", formData);
      setSubmitStatus('success');
      // Reset form after successful submission
      setFormData({
        name: loggedInUser || "",
        email: userEmail || "",
        subject: "",
        category: "General Inquiry",
        description: "",
        attachment: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onSubmit) onSubmit(formData); // Callback to parent
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000); // Clear status message after 5 seconds
    }
  };

  return ReactDOM.createPortal(
    <div style={{ ...modalStyles.overlay, ...(isMobile ? modalStyles.overlayMobile : {}) }}>
      <div style={{ ...modalStyles.modalContent, ...(isMobile ? modalStyles.modalContentMobile : {}) }} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div style={modalStyles.header}>
          <div style={modalStyles.headerTitleRow}>
            <FaHeadset size={18} style={modalStyles.headerIconInline} />
            <h2 style={modalStyles.title}>Submit a Support Ticket</h2>
          </div>
          <p style={modalStyles.subtitle}>
            Please fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaUser /> Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaEnvelope /> Your Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaFileAlt /> Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Briefly describe your issue"
              required
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaTag /> Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={modalStyles.select}
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Billing & Payments">Billing & Payments</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaCommentDots /> Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of your issue or request"
              rows="4"
              required
              style={modalStyles.textarea}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}><FaUpload /> Attachment (Optional)</label>
            <input
              type="file"
              name="attachment"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={modalStyles.fileInput}
            />
            {formData.attachment && (
              <span style={modalStyles.fileName}>{formData.attachment.name}</span>
            )}
          </div>

          {submitStatus === 'success' && (
            <div style={modalStyles.statusMessageSuccess}>
              <FaCheckCircle /> Your ticket has been submitted successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div style={modalStyles.statusMessageError}>
              <FaExclamationTriangle /> Failed to submit ticket. Please try again.
            </div>
          )}

          <button type="submit" style={modalStyles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" style={modalStyles.spinner} /> Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    background: "transparent",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 80px 0 0",
    boxSizing: "border-box",
    animation: "fadeIn 0.3s ease",
    pointerEvents: "none",
  },
  overlayMobile: {
    background: "rgba(0, 0, 0, 0.42)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    pointerEvents: "auto",
  },
  modalContent: {
    maxWidth: "360px",
    width: "min(90vw, 360px)",
    maxHeight: "72vh",
    background: "linear-gradient(180deg, #ffffff 0%, #f6f9fb 100%)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "16px",
    padding: "26px 24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 60px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.06)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflowY: "auto",
    pointerEvents: "auto",
  },
  modalContentMobile: {
    width: "100vw",
    maxWidth: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    margin: 0,
    borderRadius: 0,
    border: "none",
    boxSizing: "border-box",
    transformOrigin: "top center",
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
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "6px",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerIconInline: {
    color: "#15803d",
    flexShrink: 0,
  },
  title: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.45,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    appearance: "none", // Hide default arrow
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2315803d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    color: "#000",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
  },
  fileInput: {
    padding: "12px 0",
    fontSize: "14px",
    color: "#000",
    fontFamily: "inherit",
  },
  fileName: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.6)",
    marginTop: "-8px",
    marginLeft: "4px",
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    border: "3px solid rgba(0,0,0,0.3)",
    borderTop: "3px solid #062018",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    animation: "spin 1s linear infinite",
  },
  statusMessageSuccess: {
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(22, 163, 74, 0.1)",
    color: "#15803d",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.3s ease",
  },
  statusMessageError: {
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(220, 38, 38, 0.1)",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.3s ease",
  },
};

export default SupportTicketModal;
