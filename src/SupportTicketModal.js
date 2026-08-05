import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaPaperPlane, FaHeadset, FaUser, FaEnvelope, FaTag, FaCommentDots, FaUpload, FaCheckCircle, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";
import { MODAL_LAYER } from "./styles/modal";

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

  // Docked corner panel, matching SiteFeedbackWidget and AIChatInterface — no
  // scrim, so the page (or the Account modal it can be opened from) stays visible.
  return ReactDOM.createPortal(
    <div style={{ ...modalStyles.panel, ...(isMobile ? modalStyles.panelMobile : {}) }}>
      <div style={modalStyles.header}>
        <div style={modalStyles.headerText}>
          <div style={modalStyles.headerTitleRow}>
            <FaHeadset size={14} style={modalStyles.headerIconInline} />
            <h2 style={modalStyles.title}>Submit a Support Ticket</h2>
          </div>
          <p style={modalStyles.subtitle}>
            We'll get back to you as soon as possible.
          </p>
        </div>
        <button style={modalStyles.closeBtn} aria-label="Close support ticket form" onClick={onClose}>
          <FaTimes size={12} />
        </button>
      </div>

      <div style={modalStyles.body} className="slim-scroll">
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
  // Same anchor, width, radius, glass and shadow as SiteFeedbackWidget's `panel`.
  // It sits at the nested-modal tier because it can be opened from inside the
  // Account Settings modal and has to stay visible over it.
  panel: {
    position: "fixed",
    right: "28px",
    bottom: "112px",
    zIndex: MODAL_LAYER.nested,
    width: "370px",
    maxHeight: "min(72vh, 620px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.97), rgba(var(--eco-c0-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "20px",
    boxShadow: "0 24px 50px rgba(var(--eco-c19-rgb), 0.22)",
    backdropFilter: "blur(20px) saturate(170%)",
    WebkitBackdropFilter: "blur(20px) saturate(170%)",
    animation: "scaleUp 0.25s ease",
  },
  panelMobile: {
    right: "clamp(12px, 4vw, 20px)",
    left: "clamp(12px, 4vw, 20px)",
    width: "auto",
    bottom: "calc(clamp(16px, 3dvh, 24px) + 152px)",
    maxHeight: "70dvh",
  },
  closeBtn: {
    flexShrink: 0,
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(var(--eco-c19-rgb), 0.06)",
    color: "var(--eco-c19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px 10px",
    borderBottom: "1px solid rgba(var(--eco-c19-rgb), 0.08)",
    flexShrink: 0,
  },
  headerText: {
    minWidth: 0,
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  headerIconInline: {
    color: "var(--eco-c13)",
    flexShrink: 0,
  },
  title: {
    fontSize: "15px",
    fontWeight: 850,
    color: "var(--eco-c19)",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: "12px",
    color: "rgba(var(--eco-c19-rgb), 0.6)",
    margin: "3px 0 0",
    lineHeight: 1.45,
  },
  body: {
    overflowY: "auto",
    padding: "12px 16px 16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11.5px",
    fontWeight: 700,
    color: "rgba(var(--eco-c19-rgb), 0.62)",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
    background: "rgba(255,255,255,0.85)",
    fontSize: "12.5px",
    color: "var(--eco-c19)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    padding: "9px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
    background: "rgba(255,255,255,0.85)",
    fontSize: "12.5px",
    color: "var(--eco-c19)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    appearance: "none", // Hide default arrow
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2315803d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  },
  textarea: {
    padding: "9px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
    background: "rgba(255,255,255,0.85)",
    fontSize: "12.5px",
    color: "var(--eco-c19)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "none",
  },
  fileInput: {
    padding: "6px 0",
    fontSize: "11.5px",
    color: "rgba(var(--eco-c19-rgb), 0.7)",
    fontFamily: "inherit",
  },
  fileName: {
    fontSize: "11px",
    color: "rgba(var(--eco-c19-rgb), 0.55)",
    marginTop: "-4px",
    marginLeft: "2px",
    wordBreak: "break-all",
  },
  submitBtn: {
    marginTop: "4px",
    padding: "12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.96), rgba(var(--eco-c5-rgb), 0.96))",
    border: "1px solid rgba(255,255,255,0.45)",
    color: "var(--eco-c19)",
    fontSize: "13px",
    fontWeight: 850,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(var(--eco-c7-rgb), 0.22)",
    transition: "transform 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    border: "3px solid rgba(0,0,0,0.3)",
    borderTop: "3px solid var(--eco-c19)",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    animation: "spin 1s linear infinite",
  },
  statusMessageSuccess: {
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    color: "var(--eco-c13)",
    fontSize: "12.5px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.3s ease",
  },
  statusMessageError: {
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    color: "var(--eco-c13)",
    fontSize: "12.5px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.3s ease",
  },
};

export default SupportTicketModal;
