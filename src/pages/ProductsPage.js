import React, { useState, useEffect } from "react";
import { FaStore, FaTools, FaHeadset, FaGraduationCap, FaArrowLeft } from "react-icons/fa";
import QuickViewModal from "./QuickViewModal";

function ProductsPage({ setActiveNav, setCartItems, products }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredItem, setHoveredItem] = useState(null); // Renamed from hoveredProduct to avoid confusion with product cards
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`@keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
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
          .floating-leaf {
            position: absolute;
            opacity: 0.1;
            pointer-events: none;
            animation: floatAndRotate 15s infinite ease-in-out;
            z-index: 0;
          }
          .floating-leaf.leaf1 { top: 10%; left: 5%; transform: scale(0.8) rotate(20deg); animation-delay: 0s; }
          .floating-leaf.leaf2 { top: 30%; right: 10%; transform: scale(1.2) rotate(-30deg); animation-delay: 5s; }
          .floating-leaf.leaf3 { bottom: 20%; left: 15%; transform: scale(0.9) rotate(45deg); animation-delay: 10s; }
          .floating-leaf.leaf4 { top: 50%; left: 40%; transform: scale(0.7) rotate(10deg); animation-delay: 3s; }
          .floating-leaf.leaf5 { bottom: 10%; right: 20%; transform: scale(1.1) rotate(-10deg); animation-delay: 8s; }

          @keyframes floatAndRotate {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
        `}
      </style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(134,239,172,0.95)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0.95)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Leaf Background Elements */}
      

      <div style={{ ...styles.contentContainer, ...(isMobile ? styles.contentContainerMobile : {}) }}>
        <div style={{ ...styles.leftColumn, ...(isMobile ? styles.leftColumnMobile : {}) }}>
          <div style={styles.headerRow}>
            <div style={styles.backBtnWrap}>
              <button
                type="button"
                className="inner-blur-glass"
                style={{
                  ...styles.backBtn,
                  ...(isHoveredBack ? styles.backBtnHov : {}),
                }}
                onClick={() => setActiveNav && setActiveNav("Product & Services")}
                onMouseEnter={() => setIsHoveredBack(true)}
                onMouseLeave={() => setIsHoveredBack(false)}
              > 
                <FaArrowLeft />
              </button>
            </div>
            <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
              <span style={styles.badgeDot} />
              <span style={styles.glassContentLayer}>Our Products</span>
            </div>
          </div>
          <h1 style={{ ...styles.title, fontSize: "clamp(20px, 2.8vw, 32px)", textAlign: "left", ...(isMobile ? styles.titleMobile : {}), marginTop: "20px" }}>
            Explore Our <span style={styles.titleAccent}>Sustainable Products</span>
          </h1>
          <div style={{ ...styles.titleUnderline, marginLeft: 0, marginBottom: "16px", ...(isMobile ? { ...styles.titleUnderlineMobile, marginLeft: 0 } : {}) }}></div>
          <p style={{ ...styles.body, fontSize: "clamp(12px, 1.4vw, 15px)", marginBottom: "16px", textAlign: "left", ...(isMobile ? styles.bodyMobile : {}) }}>
            From farm-fresh organic vegetables to essential gardening kits, EcoEquity offers a curated selection of products to support your sustainable lifestyle.
          </p>
          {!isMobile && (
            <button
              type="button"
              style={{
                ...styles.primaryBtn,
                ...(hoveredItem === "shopAllProductsBtn" ? styles.primaryBtnHov : {}),
                marginTop: "10px", // Added spacing below the body text
              }}
              onClick={() => setActiveNav && setActiveNav("Shop All Products")} // Navigate to the new page
              onMouseEnter={() => setHoveredItem("shopAllProductsBtn")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span aria-hidden="true" style={styles.primaryInnerBlur} />
              <span style={styles.glassContentLayer}>Shop All Products</span>
            </button>
          )}
            {/* Horizontal small glass container for categories */}
            <div className="inner-blur-glass hide-scroll" style={{ ...styles.emptyGlassContainer, ...(isMobile ? styles.emptyGlassContainerMobile : {}) }}>
              {[
                { icon: <FaStore fill="url(#iconGradient)" />, label: "View all Products", navTarget: "Shop All Products" },
                { icon: <FaTools fill="url(#iconGradient)" />, label: "Starter Kits & Toolsets", navTarget: "Starter Kits & Toolsets" },
                { icon: <FaHeadset fill="url(#iconGradient)" />, label: "AI Data Subscription", navTarget: "AI Data Subscription" },
                { icon: <FaGraduationCap fill="url(#iconGradient)" />, label: "Specialist Certification", navTarget: "Specialist Certification" },
              ].map((cat, i, arr) => (
                <React.Fragment key={cat.label}>
                  <button
                    type="button"
                    style={{
                      ...styles.categoryItemBtn,
                      ...(hoveredItem === `category-${i}` ? styles.categoryItemBtnHov : {}),
                    }}
                    onClick={() => {
                      if (cat.navTarget) {
                        setActiveNav(cat.navTarget);
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(`category-${i}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <span style={styles.categoryLabel}>{cat.label}</span>
                  </button>
                  {i < arr.length - 1 && <div style={styles.categoryDivider} />}
                </React.Fragment>
              ))}
            </div>
        </div>

        <div className="hide-scroll" style={{ ...styles.rightColumn, ...(isMobile ? styles.rightColumnMobile : {}), paddingTop: 0 }}>
          <div style={{ ...styles.productGrid, ...(isMobile ? styles.productGridMobile : {}) }}>
            {products.map((product, index) => (
              <div
                key={product.name}
                className="inner-blur-glass"
                style={{
                  ...styles.productCard,
                  ...(isMobile ? styles.productCardMobile : {}),
                  ...(hoveredItem === `product-${index}` ? styles.productCardHov : {}),
                  cursor: "pointer"
                }}
                onMouseEnter={() => setHoveredItem(`product-${index}`)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setQuickViewProduct(product)}
              >
                <span aria-hidden="true" style={styles.productCardInnerBlur} />
                <div style={styles.productImageContainer}>
                  <span style={{ fontSize: "48px" }}>{product.emoji || "🌱"}</span>
                  <span style={styles.sustainabilityBadge}>{product.sustainabilityBadge}</span>
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={{ ...styles.productDescription, ...(isMobile ? styles.productDescriptionMobile : {}) }}>{product.description}</p>
                <div style={styles.productMeta}>
                  <span style={styles.productPrice}>₱{product.price.toFixed(2)}</span>
                  <span style={styles.productStock}>{product.stock}</span>
                </div>
                <div style={styles.productActions}>
                  <button 
                    type="button" 
                    style={styles.addToCartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartItems(prev => [...prev, product.id]);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    type="button" 
                    style={styles.viewProductBtn}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 14px 28px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav("Shop All Products");
                    }}
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator Dots - Mobile Only */}
          {isMobile && (
            <div style={styles.indicatorRow}>
              {products.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    ...(hoveredItem === `product-${i}` ? styles.dotActive : {}), // Use hoveredItem for active dot
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct}
          allProducts={products}
          onClose={() => setQuickViewProduct(null)}
          onSelectProduct={setQuickViewProduct}
          isMobile={isMobile}
          setCartItems={setCartItems}
          setActiveNav={setActiveNav}
        />
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "18px 16px 18px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowY: "auto", // Allow scrolling for the entire page
  },
  wrapMobile: {
    padding: "16px 8px 20px",
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
    color: "#15803d",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 5px rgba(74,222,128,0.9)",
    display: "inline-block",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "12px",
  },
  backBtnWrap: {
    position: "absolute",
    left: 0,
    top: "-5px",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#000",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
  glassContentLayer: { // Added for the badge in loginPageLeftContent
    position: "relative",
    zIndex: 1,
  },
  contentContainer: {
    display: "flex",
    gap: "40px",
    width: "100%",
    maxWidth: "1200px", // Increased max-width for two columns
    marginTop: "0px",
    alignItems: "flex-start",
  },
  contentContainerMobile: {
    flexDirection: "column",
    gap: "20px",
    marginTop: "10px",
  },
  leftColumn: {
    flex: "0 0 400px", // Fixed width for left column
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    paddingTop: "50px", // Added padding-top to move content lower
    paddingRight: "20px",
    borderRight: "1px solid rgba(0,0,0,0.05)",
  },
  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  rightColumnMobile: {
    width: "100%",
    padding: "0 10px",
  },
  title: {
    fontSize: "clamp(24px, 3.2vw, 38px)",
    fontWeight: 800,
    color: "#000",
    margin: "0 0 10px",
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.03,
    letterSpacing: "0",
    whiteSpace: "pre-line",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(20px, min(7vw, 3.25dvh), 30px)",
    lineHeight: 1.02,
    maxWidth: "100%",
    overflowWrap: "break-word",
    marginBottom: "clamp(4px, 0.8dvh, 7px)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(22,163,74,0) 0%, #16a34a 30%, #0284c7 50%, #16a34a 70%, rgba(2,132,199,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 22px",
    boxShadow: "0 0 12px rgba(22,163,74,0.4)",
    borderRadius: "999px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both, shimmerLine 2.5s linear infinite",
  },
  titleUnderlineMobile: {
    width: "clamp(70px, 22vw, 94px)",
    height: "3px",
    margin: "0 auto clamp(7px, 1.2dvh, 11px)",
  },
  accent: {
    background: "linear-gradient(90deg, #4ade80, #86efac)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  titleAccent: { // Used for the left column title
    background: "linear-gradient(90deg, #15803d, #16a34a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    marginBottom: "30px",
    fontSize: "clamp(14px, 1.6vw, 17px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "640px",
    textShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  bodyMobile: {
    fontSize: "clamp(10px, min(3.3vw, 1.55dvh), 13px)",
    lineHeight: 1.34,
    marginBottom: "clamp(8px, 1.2dvh, 12px)",
    width: "100%",
    maxWidth: "min(320px, 100%)",
    padding: "0 4px",
    overflowWrap: "break-word",
  },
  // Mini cards (from login page left content)
  miniCard: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "12px 14px 14px",
    flex: "0 1 210px",
    maxWidth: "230px",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    cursor: "default",
    transform: "scale(1)",
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
  },
  miniCardInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.6), transparent 42%), linear-gradient(155deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
    backdropFilter: "blur(34px) saturate(180%)",
    WebkitBackdropFilter: "blur(34px) saturate(180%)",
    filter: "blur(0.2px)",
  },
  miniCardContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  miniCardMobile: {
    flex: "1 1 0",
    width: "auto",
    maxWidth: "none",
    minWidth: 0,
    height: "auto",
    padding: "clamp(6px, 1dvh, 8px) clamp(5px, 1.6vw, 7px)",
    overflow: "visible",
    alignItems: "center",
    textAlign: "center",
  },
  miniCardHov: {
    transform: "scale(1.025)",
  },
  miniCardIcon: {
    fontSize: "30px",
    lineHeight: 1,
    marginTop: "-5px",
    marginLeft: "-5px",
    filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.22))",
  },
  miniCardIconMobile: {
    marginLeft: 0,
    alignSelf: "center",
  },
  miniCardHeading: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
    fontFamily: "'Poppins', sans-serif",
    marginTop: "-18px",
    textAlign: "left",
  },
  miniCardHeadingMobile: {
    fontSize: "clamp(9px, 2.6vw, 11px)",
    marginTop: "clamp(-14px, -2.2dvh, -10px)",
    lineHeight: 1.08,
    textAlign: "center",
    width: "100%",
  },
  miniCardText: {
    fontSize: "10.5px",
    color: "rgba(0, 0, 0, 0.82)",
    lineHeight: 1.5,
    margin: 0,
    marginTop: "-4px",
    textAlign: "left",
  },
  miniCardTextMobile: {
    fontSize: "clamp(8.5px, 2.3vw, 10px)",
    lineHeight: 1.25,
    textAlign: "center",
    overflowWrap: "anywhere",
  },
  // Product Grid and Cards
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // Forces a strict 2-column grid
    gap: "16px",
    width: "100%", // Keep width as 100%
    marginTop: "50px", 
  },
  productGridMobile: {
    gridTemplateColumns: "repeat(2, 1fr)", // Forces 2 columns on mobile as well
    gap: "12px",
  },
  productCard: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    height: "100%", // Ensure the cards stretch to form a uniform grid
    boxSizing: "border-box",
  },
  productCardInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.6), transparent 42%), linear-gradient(155deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
    backdropFilter: "blur(34px) saturate(180%)",
    WebkitBackdropFilter: "blur(34px) saturate(180%)",
    filter: "blur(0.2px)",
  },
  productCardHov: {
    transform: "scale(1.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  productImageContainer: {
    position: "relative",
    width: "100%",
    height: "120px",
    marginBottom: "8px",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  sustainabilityBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#15803d",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 600,
    zIndex: 1,
  },
  productName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: "0",
  },
  productDescription: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.7)",
    margin: "0",
    flexGrow: 1,
  },
  productDescriptionMobile: {
    fontSize: "10px",
  },
  productMeta: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
  },
  productPrice: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#15803d",
  },
  productStock: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.6)",
  },
  productActions: {
    display: "flex",
    gap: "8px",
    width: "100%",
    marginTop: "auto",
  },
  addToCartBtn: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(21, 128, 61, 0.1)",    border: "1px solid #15803d",    color: "#15803d",    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease",
    "&:hover": {
      background: "#16a34a",
    },
  },
  viewProductBtn: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  primaryBtn: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    padding: "13px 30px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transform: "scale(1)",
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.16s ease",
    backdropFilter: "blur(18px) saturate(165%)",
    WebkitBackdropFilter: "blur(18px) saturate(165%)",
  },
  primaryInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), " +
      "linear-gradient(135deg, rgba(134,239,172,0.36), rgba(125,211,252,0.32))",
    backdropFilter: "blur(34px) saturate(185%)",
    WebkitBackdropFilter: "blur(34px) saturate(185%)",
  },
  primaryBtnHov: {
    transform: "scale(1.035)",
  },
  emptyGlassContainer: {
    width: "fit-content",
    maxWidth: "100%",
    height: "auto",
    minHeight: "64px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.3)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px) saturate(150%)",
    WebkitBackdropFilter: "blur(10px) saturate(150%)",
    marginTop: "60px", // Spacing from the button above
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "nowrap", // Forces items into a single horizontal line
    overflowX: "auto", // Allows scrolling if items overflow
    padding: "16px 20px",
    gap: "16px",
  },
  emptyGlassContainerMobile: {
    marginTop: "20px",
  },
  categoryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0, // Prevents the item from squishing
    width: "90px", // Forces text to wrap if it exceeds this width
  },
  categoryItemBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    width: "90px",
    background: "transparent",
    border: "none",
    padding: "8px 0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.1s ease",
    fontFamily: "inherit",
    color: "inherit",
    boxSizing: "border-box",
  },
  categoryIcon: {
    fontSize: "22px",
  },
  categoryLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.75)",
    textAlign: "center", // Centers the wrapped text
    lineHeight: 1.25, // Adds a slight gap between wrapped lines
  },
  categoryItemBtnHov: {
    background: "rgba(0,0,0,0.05)",
    transform: "scale(1.02)",
  },
  categoryDivider: {
    width: "1px",
    height: "32px",
    background: "rgba(0,0,0,0.15)",
    flexShrink: 0,
  },
  modalOverlay: {
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
  },
  quickViewModal: {
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflowY: "auto",
  },
  quickViewModalMobile: {
    padding: "24px 16px",
    maxHeight: "95vh",
  },
  closeModalBtn: {
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
};

export default ProductsPage;