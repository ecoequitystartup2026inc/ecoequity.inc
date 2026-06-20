import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaPaperPlane, FaHeadset, FaUser, FaEnvelope, FaTag, FaCommentDots, FaUpload, FaCheckCircle, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";

const SupportTicketModal = ({ isOpen, onClose, loggedInUser, userEmail, onSubmit }) => {
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
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div style={modalStyles.header}>
          <div style={modalStyles.headerIcon}>
            <FaHeadset size={24} />
          </div>
          <h2 style={modalStyles.title}>Submit a Support Ticket</h2>
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
              rows="5"
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
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    animation: "fadeIn 0.3s ease",
  },
  modalContent: {
    maxWidth: "560px",
    width: "100%",
    maxHeight: "90vh",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflowY: "auto",
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
    alignItems: "center",
    textAlign: "center",
    marginBottom: "24px",
  },
  headerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(134,239,172,0.2), rgba(125,211,252,0.2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#15803d",
    marginBottom: "12px",
    boxShadow: "0 8px 24px rgba(34,197,94,0.15)",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#000",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.6)",
    margin: 0,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#000",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    color: "#000",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    color: "#000",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    appearance: "none", // Hide default arrow
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2315803d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "14px",
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
    padding: "14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "15px",
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