import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaMinus, FaPlus, FaStar } from "react-icons/fa";

function QuickViewModal({ product, allProducts, onClose, onSelectProduct, isMobile, setCartItems, setActiveNav, setCheckoutOpen }) {
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef(null);

  useEffect(() => {
    if (product && modalRef.current) {
      modalRef.current.scrollTop = 0;
      setQuantity(1);
    }
  }, [product]);

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
        
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", marginTop: "8px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(22, 163, 74, 0.05)", borderRadius: "20px", border: "1px solid rgba(22, 163, 74, 0.1)", position: "relative" }}>
              <span style={{ position: "absolute", top: "12px", left: "12px", background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {product.sustainabilityBadge || product.badge || "Eco-Friendly"}
              </span>
              <span style={{ fontSize: "80px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}>🌱</span>
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
      </div>
    </div>,
    document.body
  );
}

const styles = {
  modalOverlay: { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease" },
  quickViewModal: { maxWidth: "500px", width: "100%", maxHeight: "90vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto" },
  quickViewModalMobile: { padding: "20px 16px", maxHeight: "95vh" },
  closeModalBtn: { position: "absolute", top: "12px", right: "12px", zIndex: 50, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "background 0.2s" },
};

export default QuickViewModal;