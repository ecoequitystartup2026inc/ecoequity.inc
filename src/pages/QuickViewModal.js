import React, { useState, useEffect, useRef } from "react";
import { Sprout } from "lucide-react";
import ReactDOM from "react-dom";
import { FaTimes, FaMinus, FaPlus, FaStar } from "react-icons/fa";

function QuickViewModal({ product: productProp, allProducts, onClose, onSelectProduct, isMobile, setCartItems, setActiveNav, setCheckoutOpen, onAddReview }) {
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const modalRef = useRef(null);
  const [imgErrored, setImgErrored] = useState(false);

  // Use the live product from the store so newly added reviews appear instantly.
  const product = (productProp && allProducts && allProducts.find((p) => p.id === productProp.id)) || productProp;

  // Reset the image error state whenever a different product is shown.
  useEffect(() => {
    setImgErrored(false);
  }, [productProp && productProp.id]);

  useEffect(() => {
    if (productProp && modalRef.current) {
      modalRef.current.scrollTop = 0;
      setQuantity(1);
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewName("");
      setReviewComment("");
    }
  }, [productProp]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const submitReview = () => {
    if (!reviewComment.trim() || !onAddReview) return;
    onAddReview(product.id, {
      user: reviewName.trim() || "Anonymous",
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    setShowReviewForm(false);
    setReviewRating(5);
    setReviewName("");
    setReviewComment("");
  };

  if (!product) {
    return null;
  }

  return ReactDOM.createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div 
        ref={modalRef}
        className="inner-blur-glass custom-scrollbar" 
        onClick={handleModalContentClick}
        style={{ ...styles.quickViewModal, ...(isMobile ? styles.quickViewModalMobile : {}) }}
      >
        <button 
          onClick={onClose} 
          style={styles.closeModalBtn}
        >
          <FaTimes />
        </button>
        
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "20px" : "24px", marginTop: "8px" }}>
          {/* Left / main section: image, details and buy actions */}
          <div style={{ flex: 1.5, minWidth: 0, display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(22, 163, 74, 0.05)", borderRadius: "20px", border: "1px solid rgba(22, 163, 74, 0.1)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", top: "12px", left: "12px", zIndex: 1, background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {product.sustainabilityBadge || product.badge || "Eco-Friendly"}
              </span>
              {product.image && !imgErrored ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImgErrored(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <span style={{ fontSize: "80px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}>
                  {product.emoji || <Sprout size="1em" color="#16a34a" />}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "flex-start", textAlign: "left" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
              {product.category}
            </span>
            <h2 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: "#000", margin: "0 0 10px", lineHeight: 1.1 }}>
              {product.name}
            </h2>
           
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(251, 191, 36, 0.1)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                <FaStar style={{ color: "#fbbf24", fontSize: "12px" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#b45309" }}>
                  {product.rating ? product.rating.toFixed(1) : "0.0"}
                </span>
             </div>
              <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.2)" }}>
                ({product.reviewCount || 0} reviews)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "4px 8px", borderRadius: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></div>
                {product.stock || "In Stock"}
              </span>
           </div>
           
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#15803d", marginBottom: "12px" }}>
              ₱{Number(product.price).toFixed(2)}
            </div>
           
            <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5, marginBottom: "20px" }}>
             {product.description || `Experience the best of local, sustainable agriculture with our ${product.name}. Perfect for your home or garden, carefully sourced to ensure top quality and freshness.`}
           </p>
           
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.8)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}>
                  <button type="button" style={{ background: "transparent", border: "none", padding: "12px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setQuantity(Math.max(1, quantity - 1))}><FaMinus size={10} /></button>
                  <span style={{ fontSize: "14px", fontWeight: 700, minWidth: "24px", textAlign: "center", color: "#000" }}>{quantity}</span>
                  <button type="button" style={{ background: "transparent", border: "none", padding: "12px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setQuantity(quantity + 1)}><FaPlus size={10} /></button>
               </div>
               <button 
                  style={{ flex: 1, minWidth: "120px", padding: "12px 16px", borderRadius: "12px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", color: "#15803d", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                 onClick={() => {
                   setCartItems(prev => [...prev, ...Array(quantity).fill(product.id)]);
                   onClose();
                 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(22, 163, 74, 0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'; }}
               >
                 Add to Cart
               </button>
             </div>
             <button 
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.4)", color: "#062018", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(34,197,94,0.2)", transition: "transform 0.2s ease" }}
               onClick={() => {
                 setCartItems(prev => [...prev, ...Array(quantity).fill(product.id)]);
                 onClose();
                 if (setCheckoutOpen) {
                    setCheckoutOpen(true);
                 } else if (setActiveNav) {
                    setActiveNav("CheckoutPage");
                 }
               }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
             >
               Buy Now
             </button>
           </div>
          </div>
          </div>

          {/* Right section: customer feedback */}
          <aside style={{ ...styles.reviewsSection, ...(isMobile ? styles.reviewsSectionMobile : {}) }}>
          <div style={styles.reviewsHeader}>
            <h3 style={styles.reviewsTitle}>
              Customer Feedback
              <span style={styles.reviewsCount}> ({product.reviewCount || 0})</span>
            </h3>
          </div>

          <div style={styles.ratingSummary}>
            <span style={styles.ratingAverage}>{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
            <div>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} style={{ fontSize: "13px", color: Math.round(product.rating || 0) >= s ? "#fbbf24" : "#e5e7eb" }} />
                ))}
              </div>
              <span style={styles.ratingSummaryLabel}>
                Based on {product.reviewCount || 0} review{(product.reviewCount || 0) === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {onAddReview && (
            <button type="button" style={styles.writeReviewBtn} onClick={() => setShowReviewForm((s) => !s)}>
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          )}

          {showReviewForm && (
            <div style={styles.reviewForm}>
              <span style={styles.starPickerLabel}>Tap a star to rate</span>
              <div style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate ${s} star${s === 1 ? "" : "s"}`}
                    onClick={() => setReviewRating(s)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setReviewRating(s); } }}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ cursor: "pointer", fontSize: "24px", outline: "none", color: (hoverRating || reviewRating) >= s ? "#fbbf24" : "#d1d5db", transform: (hoverRating || reviewRating) >= s ? "scale(1.08)" : "scale(1)", transition: "color 0.15s, transform 0.15s" }}
                  />
                ))}
                <span style={styles.starPickerValue}>{hoverRating || reviewRating}/5</span>
              </div>
              <input
                style={styles.reviewInput}
                placeholder="Your name (optional)"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
              />
              <textarea
                style={{ ...styles.reviewInput, minHeight: "70px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Share your experience with this product…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <button
                type="button"
                style={{ ...styles.submitReviewBtn, ...(reviewComment.trim() ? {} : styles.submitReviewBtnDisabled) }}
                onClick={submitReview}
                disabled={!reviewComment.trim()}
              >
                Submit Review
              </button>
            </div>
          )}

          {product.reviews && product.reviews.length > 0 ? (
            <div style={styles.reviewList}>
              {product.reviews.slice().reverse().map((r, i) => (
                <div key={i} style={styles.reviewItem}>
                  <div style={styles.reviewItemHead}>
                    <div style={styles.reviewAvatar}>{(r.user || "?").charAt(0).toUpperCase()}</div>
                    <span style={styles.reviewUser}>{r.user || "Anonymous"}</span>
                    <span style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} style={{ fontSize: "11px", color: (r.rating || 0) >= s ? "#fbbf24" : "#e5e7eb" }} />
                      ))}
                    </span>
                  </div>
                  <p style={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
          )}
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  modalOverlay: { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease" },
  quickViewModal: { maxWidth: "900px", width: "100%", maxHeight: "90vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto" },
  quickViewModalMobile: { padding: "20px 16px", maxHeight: "95vh" },
  closeModalBtn: { position: "absolute", top: "12px", right: "12px", zIndex: 50, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "background 0.2s" },
  reviewsSection: { width: "320px", flexShrink: 0, paddingLeft: "24px", borderLeft: "1px solid rgba(0,0,0,0.08)", textAlign: "left", display: "flex", flexDirection: "column" },
  reviewsSectionMobile: { width: "100%", paddingLeft: 0, borderLeft: "none", paddingTop: "18px", borderTop: "1px solid rgba(0,0,0,0.08)" },
  reviewsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  reviewsTitle: { fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 },
  reviewsCount: { fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.45)" },
  ratingSummary: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "14px", background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)", marginBottom: "12px" },
  ratingAverage: { fontSize: "28px", fontWeight: 800, color: "#b45309", lineHeight: 1 },
  ratingSummaryLabel: { display: "block", marginTop: "4px", fontSize: "11.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)" },
  writeReviewBtn: { width: "100%", padding: "9px 14px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", color: "#15803d", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" },
  reviewForm: { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", padding: "14px", marginBottom: "16px" },
  starPickerLabel: { display: "block", fontSize: "11.5px", fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: "6px" },
  starPicker: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" },
  starPickerValue: { marginLeft: "6px", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.5)" },
  reviewInput: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", fontSize: "13px", color: "#0f172a", marginBottom: "10px", boxSizing: "border-box", outline: "none" },
  submitReviewBtn: { width: "100%", padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(22,163,74,0.25)" },
  submitReviewBtnDisabled: { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
  reviewList: { display: "flex", flexDirection: "column", gap: "12px", flex: 1, minHeight: 0, maxHeight: "300px", overflowY: "auto", paddingRight: "2px" },
  reviewItem: { padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)" },
  reviewItemHead: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  reviewAvatar: { width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  reviewUser: { fontSize: "13px", fontWeight: 700, color: "#0f172a", flex: 1 },
  reviewStars: { display: "inline-flex", gap: "1px" },
  reviewComment: { fontSize: "13px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5, margin: 0 },
  noReviews: { fontSize: "13px", color: "rgba(0,0,0,0.5)", padding: "8px 0" },
};

export default QuickViewModal;