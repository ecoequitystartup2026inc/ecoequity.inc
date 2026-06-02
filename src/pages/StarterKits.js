import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaLeaf, FaTimes, FaLightbulb, FaRocket, FaCheckCircle, FaTrash, FaMinus, FaPlus, FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaCreditCard, FaMoneyBillWave, FaLock, FaSeedling, FaGift, FaBoxOpen, FaTag, FaHeart, FaShoppingCart } from "react-icons/fa";

const starterKitsData = [
  {
    id: 1,
    title: "Balcony Herb Garden",
    desc: "Perfect for urban spaces. Includes 5 organic herb varieties, premium soil, and eco-pots for your apartment balcony.",
    price: "₱850.00",
    icon: "🌿",
    badge: "Best Seller",
    suggestions: [
      "Use vertical planters to maximize space on your balcony.",
      "Prune the herbs regularly to encourage bushier growth.",
      "Ensure the pots get at least 4-6 hours of direct sunlight."
    ],
    getStartedGuide: [
      "Unpack the eco-pots and place them on a catch plate.",
      "Fill the pots with the provided premium potting soil.",
      "Sow the herb seeds about 1/4 inch deep into the soil.",
      "Water gently and place in a sunny spot."
    ],
  },
  {
    id: 2,
    title: "Tomato Success Kit",
    desc: "Everything you need for juicy heirloom tomatoes. Includes seeds, trellis, specialized fertilizer, and pest control.",
    price: "₱920.00",
    icon: "🍅",
    badge: "Beginner Friendly",
    suggestions: [
      "Pinch off 'suckers' (small shoots between the main stem and branches) to direct energy to fruit.",
      "Tap the tomato flowers gently to aid in natural pollination.",
      "Water at the base of the plant to prevent leaf fungal diseases."
    ],
    getStartedGuide: [
      "Germinate seeds in the provided starter tray.",
      "Transplant the seedlings when they are 3-4 inches tall.",
      "Install the trellis early so you don't disturb the roots later.",
      "Apply the specialized fertilizer once flowers appear."
    ],
  },
  {
    id: 3,
    title: "Vegetable Starter Pack",
    desc: "A robust collection of fast-growing local vegetables tailored for the Philippine climate. High yield guaranteed.",
    price: "₱1,200.00",
    icon: "🥕",
    badge: "High Yield",
    suggestions: [
      "Practice companion planting (e.g., marigolds with your veggies) to naturally deter pests.",
      "Rotate crops every season to maintain soil health.",
      "Use organic compost to top-dress the soil mid-season."
    ],
    getStartedGuide: [
      "Prepare your garden bed or large containers with organic compost.",
      "Follow the spacing guide printed on each seed packet.",
      "Mulch around the base of the plants to retain soil moisture.",
      "Monitor for pests daily and use natural deterrents if needed."
    ],
  },
  {
    id: 4,
    title: "Basic Gardening Tools",
    desc: "Ergonomic, rust-resistant essential hand tools including a trowel, pruner, cultivator, and gardening gloves.",
    price: "₱650.00",
    icon: "🛠️",
    badge: "Essential",
    suggestions: [
      "Clean and dry your tools after each use to prevent rust.",
      "Wipe the metal parts with a lightly oiled cloth for longevity.",
      "Sharpen your pruners seasonally for clean, healthy cuts on plants."
    ],
    getStartedGuide: [
      "Wear the provided gloves to protect your hands from thorns and soil.",
      "Use the trowel for digging small holes and transplanting.",
      "Use the cultivator to loosen compacted soil and uproot weeds.",
      "Keep tools stored in a dry, covered area."
    ],
  },
];

function StarterKits({ setActiveNav, cartItems, setCartItems, setOrders, onTrackOrder, savedProducts, setSavedProducts }) {
  const [localCartItems, setLocalCartItems] = useState([]);
  const activeCartItems = cartItems !== undefined ? cartItems : localCartItems;
  const activeSetCartItems = setCartItems !== undefined ? setCartItems : setLocalCartItems;

  const [localSavedProducts, setLocalSavedProducts] = useState([]);
  const activeSavedProducts = savedProducts !== undefined ? savedProducts : localSavedProducts;
  const activeSetSavedProducts = setSavedProducts !== undefined ? setSavedProducts : setLocalSavedProducts;

  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [hoveredKit, setHoveredKit] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedKit, setSelectedKit] = useState(null);
  const [modalType, setModalType] = useState(null); // 'details' or 'start'
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [showEcoTooltip, setShowEcoTooltip] = useState(false);
  const [showSeedTooltip, setShowSeedTooltip] = useState(false);
  const [showSeedOptionTooltip, setShowSeedOptionTooltip] = useState(false);
  const [showEcoPackagingTooltip, setShowEcoPackagingTooltip] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [supportSeed, setSupportSeed] = useState(false);
  const [ecoPackaging, setEcoPackaging] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "", address: "", city: "", province: "", zip: "", instructions: "" });
  const [paymentData, setPaymentData] = useState({ gcashRef: "", gcashProof: null, cardNum: "", cardName: "", cardExp: "", cardCvv: "", mayaRef: "", mayaProof: null });
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const cartItemsEndRef = useRef(null);
  const [cartBadgeAnim, setCartBadgeAnim] = useState(false);
  const [wishlistBadgeAnim, setWishlistBadgeAnim] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedKit || cartOpen || checkoutOpen || showSuccess || wishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedKit, cartOpen, checkoutOpen, showSuccess, wishlistOpen]);

  useEffect(() => {
    if (cartOpen && cartItemsEndRef.current) {
      setTimeout(() => {
        cartItemsEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [cartOpen, activeCartItems.length]);

  useEffect(() => {
    if (activeCartItems.length > 0) {
      setCartBadgeAnim(true);
      const t = setTimeout(() => setCartBadgeAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [activeCartItems.length]);

  useEffect(() => {
    if (activeSavedProducts.length > 0) {
      setWishlistBadgeAnim(true);
      const t = setTimeout(() => setWishlistBadgeAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [activeSavedProducts.length]);

  // Cart logic
  const cartItemCounts = activeCartItems.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const uniqueCartItems = Object.keys(cartItemCounts).map((id) => {
    const product = starterKitsData.find((p) => p.id === parseInt(id));
    if (!product) return { id: parseInt(id), title: `Item #${id}`, price: "₱0.00", icon: "🌱", quantity: cartItemCounts[id], numericPrice: 0 };
    const numericPrice = parseFloat(product.price.replace(/[^\d.]/g, ''));
    return { ...product, quantity: cartItemCounts[id], numericPrice };
  });

  const uniqueWishlistItems = activeSavedProducts.map((id) => {
    return starterKitsData.find((p) => p.id === id);
  }).filter(Boolean);

  const subtotal = uniqueCartItems.reduce((sum, item) => sum + (item.numericPrice * item.quantity), 0);
  const shippingFee = uniqueCartItems.length > 0 ? (deliverySpeed === "express" ? 150 : 50) : 0;
  const serviceFee = uniqueCartItems.length > 0 ? 15 : 0;
  const seedDonation = supportSeed ? 20 : 0;
  const totalAmount = Math.max(0, subtotal + shippingFee + serviceFee + seedDonation - discount);
  const ecoPoints = Math.floor(totalAmount * 0.1);

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === "phone") {
      let cleaned = value.replace(/[^\d+]/g, '');
      if (cleaned.indexOf('+') > 0) {
        cleaned = cleaned.replace(/\+/g, '');
        if (value.startsWith('+')) cleaned = '+' + cleaned;
      }
      
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(0, 11);
        if (cleaned.length > 7) {
          formattedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length > 4) {
          formattedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        } else {
          formattedValue = cleaned;
        }
      } else if (cleaned.startsWith('+63')) {
        cleaned = cleaned.substring(0, 13);
        if (cleaned.length > 8) {
          formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
        } else if (cleaned.length > 6) {
          formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length > 3) {
          formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        } else {
          formattedValue = cleaned;
        }
      } else {
        formattedValue = cleaned.substring(0, 15);
      }
    } else if (field === "zip") {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };
  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
  const handlePaymentInputChange = (field, value) => setPaymentData(prev => ({ ...prev, [field]: value }));

  const handleCardNumberChange = (value) => {
    const v = value.replace(/\D/g, '').substring(0, 19);
    const formatted = v.match(/.{1,4}/g)?.join(' ') || "";
    setPaymentData(prev => ({ ...prev, cardNum: formatted }));
  };

  const handleCardExpiryChange = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length === 1 && parseInt(v) > 1) {
      v = '0' + v;
    }
    v = v.substring(0, 4);
    let formatted = v;
    if (v.length > 2) {
      formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    setPaymentData(prev => ({ ...prev, cardExp: formatted }));
  };

  const handleCardCvvChange = (value) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    setPaymentData(prev => ({ ...prev, cardCvv: v }));
  };

  const getError = (field) => {
    if (!touched[field]) return false;
    if (formData[field] !== undefined) {
      const val = formData[field].trim();
      if (val === "" && field !== "instructions") return "This field is required.";
      if (field === "email" && val !== "") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "Invalid email address." : false;
      if (field === "phone" && val !== "") return !/^(09|\+639)\d{9}$/.test(val.replace(/[\s-]/g, '')) ? "Invalid phone format." : false;
      if (field === "zip" && val !== "") return !/^\d{4}$/.test(val) ? "ZIP must be 4 digits." : false;
      return false;
    }
    if (paymentData[field] !== undefined) {
      const val = paymentData[field] ? String(paymentData[field]).trim() : "";
      if (val === "") return "This field is required.";
      if (field === "cardNum") return !/^[\d\s-]{15,19}$/.test(val) ? "Must be 15-19 digits." : false;
      if (field === "cardExp") return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(val) ? "Invalid format (MM/YY)." : false;
      if (field === "cardCvv") return !/^\d{3,4}$/.test(val) ? "Must be 3 or 4 digits." : false;
    }
    return false;
  };

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "") { setDiscount(0); setPromoError(false); setPromoSuccess(false); return; }
    let success = false;
    if (code === "GREEN10") { setDiscount(subtotal * 0.10); success = true; }
    else if (code === "ECOFREE") { setDiscount(shippingFee); success = true; }
    else if (code === "FARM20") { setDiscount(20); success = true; }
    if (success) {
      setPromoError(false); setPromoSuccess(true); setTimeout(() => setPromoSuccess(false), 2000);
    } else {
      setDiscount(0); setPromoError(true); setPromoSuccess(false); setTimeout(() => setPromoError(false), 2000);
    }
  };

  const isFormValid = formData.fullName.trim() !== "" &&
                      formData.phone.trim() !== "" && /^(09|\+639)\d{9}$/.test(formData.phone.trim().replace(/[\s-]/g, '')) &&
                      formData.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
                      formData.address.trim() !== "" &&
                      formData.city.trim() !== "" &&
                      formData.province.trim() !== "" &&
                      formData.zip.trim() !== "" && /^\d{4}$/.test(formData.zip.trim());

  const isPaymentValid = () => {
    if (selectedPayment === "cod") return true;
    if (selectedPayment === "gcash") return paymentData.gcashRef.trim() !== "" && paymentData.gcashProof !== null;
    if (selectedPayment === "card") {
      const isNumValid = /^[\d\s-]{15,19}$/.test(paymentData.cardNum.trim());
      const isExpValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.cardExp.trim());
      const isCvvValid = /^\d{3,4}$/.test(paymentData.cardCvv.trim());
      return paymentData.cardName.trim() !== "" && isNumValid && isExpValid && isCvvValid;
    }
    if (selectedPayment === "maya") return paymentData.mayaRef.trim() !== "" && paymentData.mayaProof !== null;
    return false;
  };

  const handlePlaceOrder = () => {
    setCheckoutOpen(false);
    setShowSuccess(true);
    if (setOrders && uniqueCartItems.length > 0) {
      const orderItems = uniqueCartItems.map(item => `${item.quantity}x ${item.name || item.title}`).join(", ");
      const newOrder = {
        id: `ORD-2026-0528-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: "Pending Approval",
        total: totalAmount,
        amount: `₱${totalAmount.toFixed(2)}`,
        items: orderItems,
        products: orderItems,
        customer: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.zip}`,
        instructions: formData.instructions,
        payment: selectedPayment === 'cod' ? 'Cash on Delivery' : selectedPayment === 'gcash' ? 'GCash' : selectedPayment === 'maya' ? 'Maya' : selectedPayment === 'bank' ? 'Bank Transfer' : 'Credit Card',
        paymentStatus: selectedPayment === 'cod' ? 'Pending' : 'Paid',
        rider: "Unassigned"
      };
      setLatestOrder(newOrder);
      setOrders(prev => [newOrder, ...(prev || [])]);
    }
    activeSetCartItems([]);
    setFormData({ fullName: "", phone: "", email: "", address: "", city: "", province: "", zip: "", instructions: "" });
    setPromoCode(""); setDiscount(0); setPromoError(false); setSupportSeed(false); setEcoPackaging(false);
    setPaymentData({ gcashRef: "", gcashProof: null, cardNum: "", cardName: "", cardExp: "", cardCvv: "", mayaRef: "", mayaProof: null });
    setTouched({});
  };

  const updateQuantity = (id, delta) => {
    activeSetCartItems((prev) => {
      const prevArray = prev || [];
      const currentCount = prevArray.filter((itemId) => itemId === id).length;
      if (currentCount + delta <= 0) return prevArray.filter((itemId) => itemId !== id);
      if (delta > 0) return [...prevArray, id];
      const index = prevArray.indexOf(id);
      if (index > -1) { const next = [...prevArray]; next.splice(index, 1); return next; }
      return prevArray;
    });
  };

  const removeFromCart = (id) => activeSetCartItems((prev) => (prev || []).filter((itemId) => itemId !== id));

  const toggleSaveProduct = (id) => {
    activeSetSavedProducts(prev => {
      const current = prev || [];
      return current.includes(id) ? current.filter(pId => pId !== id) : [...current, id];
    });
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
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes shakeIcon {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes highlightFlash {
            0% { background-color: rgba(74, 222, 128, 0.4) !important; transform: scale(1.02); box-shadow: 0 4px 12px rgba(74, 222, 128, 0.2); }
            100% { background-color: rgba(255,255,255,0.6) !important; transform: scale(1); box-shadow: none; }
          }
          .highlight-flash {
            animation: highlightFlash 1.5s ease-out forwards;
          }
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          .animate-pulseGlow {
            animation: pulseGlow 2s infinite;
          }
          @keyframes slideInDiscount {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideInDiscount {
            animation: slideInDiscount 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes shakeError {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-shakeError {
            animation: shakeError 0.4s ease-in-out;
          }
          @keyframes badgePop {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
          }
          .animate-badgePop {
            animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
          <span>Eco-Friendly Kits</span>
        </div>
      </div>

      <h1 style={styles.title}>
        Starter Kits <span style={styles.accent}>& Toolsets</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Kickstart your sustainable agricultural journey with our premium, all-in-one gardening kits and ergonomic toolsets designed specifically for the Philippine climate.
      </p>

      {/* Action Icons: Wishlist & Cart */}
      <div style={styles.toolbar}>
        <div style={styles.iconActions}>
          <button 
            style={styles.iconActionBtn} 
            title="Wishlist" 
            onClick={() => setWishlistOpen(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaHeart style={{ color: "#15803d" }} size={18} />
            {activeSavedProducts.length > 0 && <span style={styles.iconBadge} className={wishlistBadgeAnim ? "animate-badgePop" : ""}>{activeSavedProducts.length}</span>}
          </button>
          <button 
            style={styles.iconActionBtn} 
            title="Cart" 
            onClick={() => setCartOpen(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaShoppingCart style={{ color: "#15803d" }} size={18} />
            {activeCartItems.length > 0 && <span style={styles.iconBadge} className={cartBadgeAnim ? "animate-badgePop" : ""}>{activeCartItems.length}</span>}
          </button>
        </div>
      </div>

      <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : {}) }}>
        {starterKitsData.map((kit) => (
          <div 
            key={kit.id} 
            className="inner-blur-glass"
            style={{ 
              ...styles.card, 
              ...(hoveredKit === kit.id ? styles.cardHov : {}) 
            }}
            onMouseEnter={() => setHoveredKit(kit.id)}
            onMouseLeave={() => setHoveredKit(null)}
          >
            <div style={styles.imageContainer}>
              <div style={styles.imagePlaceholder}>
                <span style={{ fontSize: "52px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}>
                  {kit.icon}
                </span>
              </div>
              {kit.badge && (
                <span style={styles.badgeLabel}>
                  <FaLeaf size={10} style={{ marginRight: '4px' }}/> {kit.badge}
                </span>
              )}
              <button 
                style={{ ...styles.saveBtn, ...(activeSavedProducts.includes(kit.id) ? styles.saveBtnActive : {}) }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveProduct(kit.id);
                }}
                title="Save Product"
              >
                {activeSavedProducts.includes(kit.id) ? "♥" : "♡"}
              </button>
            </div>
            
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{kit.title}</h3>
                <span style={styles.cardPrice}>{kit.price}</span>
              </div>
              <p style={styles.cardDesc}>{kit.desc}</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    style={styles.addToCartBtn}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={(e) => {
                      e.stopPropagation();
                      activeSetCartItems((prev) => [...(prev || []), kit.id]);
                      setLastAddedId(kit.id);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    style={styles.buyNowBtn}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={(e) => {
                      e.stopPropagation();
                      activeSetCartItems((prev) => [...(prev || []), kit.id]);
                      setLastAddedId(kit.id);
                      setCheckoutOpen(true);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.viewBtn}
                    onClick={() => { setSelectedKit(kit); setModalType('details'); }}
                  >
                    Details
                  </button>
                  <button 
                    style={styles.viewBtn}
                    onClick={() => { setSelectedKit(kit); setModalType('start'); }}
                  >
                    Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedKit && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setSelectedKit(null)}>
          <div 
            className="inner-blur-glass" 
            style={{ ...styles.modalContent, ...(isMobile ? styles.modalContentMobile : {}) }} 
            onClick={e => e.stopPropagation()}
          >
            <button style={styles.modalCloseBtn} onClick={() => setSelectedKit(null)}><FaTimes /></button>
            
            <h2 style={styles.modalTitle}>
              {selectedKit.title} 
              <span style={{ display: 'block', fontSize: '15px', color: 'rgba(0,0,0,0.6)', marginTop: '4px' }}>
                {modalType === 'details' ? 'Details & Suggestions' : 'How to Get Started'}
              </span>
            </h2>
            
            <div style={styles.modalBody}>
              {modalType === 'details' ? (
                <>
                  <p style={{ marginBottom: "16px" }}><strong>Overview:</strong> {selectedKit.desc}</p>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#15803d" }}><FaLightbulb style={{color: '#fbbf24'}}/> Ideas & Suggestions:</p>
                  <ul style={styles.modalList}>
                    {selectedKit.suggestions.map((sug, i) => <li key={i} style={styles.modalListItem}>{sug}</li>)}
                  </ul>
                </>
              ) : (
                <>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#15803d" }}><FaRocket style={{color: '#3b82f6'}}/> Step-by-Step Guide:</p>
                  <ol style={styles.modalList}>
                    {selectedKit.getStartedGuide.map((step, i) => <li key={i} style={styles.modalListItem}>{step}</li>)}
                  </ol>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button 
                      style={{...styles.addToCartBtn, padding: "14px"}}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => {
                        activeSetCartItems((prev) => [...(prev || []), selectedKit.id]);
                        setLastAddedId(selectedKit.id);
                        setSelectedKit(null);
                      }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      style={styles.actionBtnModal}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => {
                        activeSetCartItems((prev) => [...(prev || []), selectedKit.id]);
                        setLastAddedId(selectedKit.id);
                        setSelectedKit(null);
                        setCheckoutOpen(true);
                      }}
                    >
                      Buy Now - {selectedKit.price}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>, 
        document.body
      )}

      {/* Wishlist Modal */}
      {wishlistOpen && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => { setWishlistOpen(false); setShowClearWishlistConfirm(false); }}>
          <div 
            className="custom-scrollbar inner-blur-glass" 
            style={{ ...styles.cartModal, ...(isMobile ? styles.cartModalMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            {showClearWishlistConfirm && (
              <div style={styles.confirmOverlay}>
                <div style={styles.confirmBox}>
                  <div style={styles.confirmIconWrap}>
                    <FaTrash size={24} style={{ color: "#e11d48" }} />
                  </div>
                  <h3 style={styles.confirmTitle}>Empty Wishlist?</h3>
                  <p style={styles.confirmText}>Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
                  <div style={styles.confirmBtnRow}>
                    <button onClick={() => setShowClearWishlistConfirm(false)} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={() => { activeSetSavedProducts([]); setShowClearWishlistConfirm(false); }} style={styles.clearAllBtn}>Empty</button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { setWishlistOpen(false); setShowClearWishlistConfirm(false); }} style={styles.modalCloseBtn}><FaTimes /></button>
            
            <h2 style={styles.cartModalTitle}>Your Wishlist</h2>
            
            {uniqueWishlistItems.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <button onClick={() => setShowClearWishlistConfirm(true)} style={styles.emptyCartBtn}>
                  <FaTrash size={12} /> Empty Wishlist
                </button>
              </div>
            )}
            
            <div className="hide-scroll" style={styles.cartItemsContainer}>
              {uniqueWishlistItems.length === 0 ? (
                <p style={styles.emptyCartText}>Your wishlist is empty.</p>
              ) : (
                uniqueWishlistItems.map(item => (
                  <div key={item.id} style={styles.cartItem}>
                    <div style={styles.cartItemImgWrap}>
                      <span style={{ fontSize: "24px" }}>{item.icon || "🌱"}</span>
                    </div>
                    <div style={styles.cartItemDetails}>
                      <div style={styles.cartItemName}>{item.title}</div>
                      <div style={styles.cartItemPrice}>{item.price}</div>
                      
                      <div style={styles.cartItemActions}>
                        <button style={{ ...styles.getStartedBtn, flex: "none", padding: "6px 12px" }} onClick={(e) => { activeSetCartItems(prev => [...(prev || []), item.id]); setLastAddedId(item.id); setWishlistOpen(false); setCartOpen(true); }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Add to Cart</button>
                        <button style={styles.removeBtn} onClick={() => toggleSaveProduct(item.id)}><FaTrash size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cart Modal */}
      {cartOpen && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => { setCartOpen(false); setShowClearConfirm(false); }}>
          <div 
            className="inner-blur-glass" 
            style={{ ...styles.cartModal, ...(isMobile ? styles.cartModalMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            {showClearConfirm && (
              <div style={styles.confirmOverlay}>
                <div style={styles.confirmBox}>
                  <div style={styles.confirmIconWrap}>
                    <FaTrash size={24} style={{ color: "#e11d48" }} />
                  </div>
                  <h3 style={styles.confirmTitle}>Clear Cart?</h3>
                  <p style={styles.confirmText}>Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
                  <div style={styles.confirmBtnRow}>
                    <button onClick={() => setShowClearConfirm(false)} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={() => { activeSetCartItems([]); setShowClearConfirm(false); }} style={styles.clearAllBtn}>Clear All</button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { setCartOpen(false); setShowClearConfirm(false); }} style={styles.modalCloseBtn}><FaTimes /></button>
            
            <h2 style={styles.cartModalTitle}>Your Cart ({activeCartItems.length})</h2>
            
            {uniqueCartItems.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <button onClick={() => setShowClearConfirm(true)} style={styles.emptyCartBtn}>
                  <FaTrash size={12} /> Clear All
                </button>
              </div>
            )}
            
            <div className="hide-scroll" style={styles.cartItemsContainer}>
              {uniqueCartItems.length === 0 ? (
                <p style={styles.emptyCartText}>Your cart is empty.</p>
              ) : (
                uniqueCartItems.map(item => (
                  <div 
                    key={item.id} 
                    style={styles.cartItem}
                    className={item.id === lastAddedId ? "highlight-flash" : ""}
                  >
                    <div style={styles.cartItemImgWrap}>
                      <span style={{ fontSize: "24px" }}>{item.icon || "🌱"}</span>
                    </div>
                    <div style={styles.cartItemDetails}>
                      <div style={styles.cartItemName}>{item.title}</div>
                      <div style={styles.cartItemPrice}>₱{item.numericPrice.toFixed(2)}</div>
                      
                      <div style={styles.cartItemActions}>
                        <div style={styles.quantityControls}>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}><FaMinus size={10} /></button>
                          <span style={styles.qtyText}>{item.quantity}</span>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}><FaPlus size={10} /></button>
                        </div>
                        <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}><FaTrash size={12} /></button>
                      </div>
                    </div>
                    <div style={styles.cartItemSubtotal}>₱{(item.numericPrice * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              )}
              <div ref={cartItemsEndRef} />
            </div>
            
            <div style={styles.cartFooter}>
              <div style={styles.cartTotalRow}><span>Total:</span><span style={styles.cartTotalAmount}>₱{subtotal.toFixed(2)}</span></div>
              <div style={styles.cartFooterBtns}>
                <button style={styles.continueBtn} onClick={() => { setCartOpen(false); setShowClearConfirm(false); }}>Continue Shopping</button>
                <button 
                  style={styles.checkoutBtn} 
                  disabled={uniqueCartItems.length === 0} 
                  onClick={() => { 
                    setCartOpen(false); 
                    setShowClearConfirm(false); 
                    setCheckoutOpen(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >Checkout</button>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Checkout Modal */}
      {checkoutOpen && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setCheckoutOpen(false)}>
          <div 
            className="relative max-w-5xl w-[90%] max-h-[85vh] overflow-y-auto bg-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl custom-scrollbar inner-blur-glass" 
            onClick={(e) => e.stopPropagation()}
            style={{ ...styles.checkoutModal, ...(isMobile ? styles.checkoutModalMobile : {}) }}
          >
            <button 
              onClick={() => { setCheckoutOpen(false); setCartOpen(true); }} 
              style={styles.modalCloseBtn}
            >
              <FaTimes size={18} />
            </button>
            
            {/* Checkout Progress Stepper */}
            <div style={styles.stepperWrap}>
              {['Cart', 'Delivery & Payment', 'Confirmation'].map((step, idx) => (
                 <div key={step} style={{...styles.step, flex: idx < 2 ? 1 : "none", ...(idx === 1 ? styles.stepActive : idx === 0 ? styles.stepCompleted : {})}}>
                   <div style={{...styles.stepDot, ...(idx <= 1 ? styles.stepDotActive : {})}}>{idx < 1 ? '✓' : idx + 1}</div>
                   <span style={{...styles.stepText, ...(idx <= 1 ? styles.stepTextActive : {})}}>{step}</span>
                   {idx < 2 && <div style={{...styles.stepLine, ...(idx < 1 ? styles.stepLineActive : {})}} />}
                 </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "24px", marginTop: "0px" }}>
               <h1 style={{ ...styles.modalTitle, marginBottom: "4px", fontSize: "28px" }} className="font-extrabold text-gray-900 drop-shadow-sm">
                 Checkout
               </h1>
               <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>Complete your order with secure payment.</p>
            </div>

            <div style={styles.checkoutGrid}>
              {/* Left Column: Form & Payment */}
              <div style={styles.checkoutLeft}>
                 <div style={styles.deliveryEstimateCard}>
                    <FaTruck size={20} style={{color: '#15803d'}} />
                    <div style={{flex: 1}}>
                       <div style={{fontSize: '14px', fontWeight: 800, color: '#000'}}>Estimated Delivery</div>
                       <div style={{fontSize: '13px', color: 'rgba(0,0,0,0.6)', fontWeight: 600}}>
                         {deliverySpeed === "express" ? "1-2 Business Days" : "3-5 Business Days"}
                       </div>
                    </div>
                 </div>
                 {/* Delivery Info */}
                 <div style={styles.checkoutSection}>
                   <h2 style={styles.checkoutSectionTitle}>
                     <span style={styles.checkoutSectionNumber}>1</span>
                     Delivery Information
                   </h2>
                   <div style={styles.checkoutFormGrid}>
                     <InputField label="Full Name" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={(val) => handleInputChange("fullName", val)} onBlur={() => handleBlur("fullName")} error={getError("fullName")} />
                     <InputField label="Phone Number" placeholder="0912 345 6789" value={formData.phone} onChange={(val) => handleInputChange("phone", val)} onBlur={() => handleBlur("phone")} error={getError("phone")} />
                     <InputField label="Email Address" placeholder="juan@example.com" value={formData.email} onChange={(val) => handleInputChange("email", val)} onBlur={() => handleBlur("email")} error={getError("email")} />
                     <InputField label="Delivery Address" placeholder="123 Main St, Brgy 1" value={formData.address} onChange={(val) => handleInputChange("address", val)} onBlur={() => handleBlur("address")} error={getError("address")} />
                     <InputField label="City / Municipality" placeholder="Quezon City" value={formData.city} onChange={(val) => handleInputChange("city", val)} onBlur={() => handleBlur("city")} error={getError("city")} />
                     <InputField label="Province" placeholder="Metro Manila" value={formData.province} onChange={(val) => handleInputChange("province", val)} onBlur={() => handleBlur("province")} error={getError("province")} />
                     <InputField label="ZIP / Postal Code" placeholder="1100" value={formData.zip} onChange={(val) => handleInputChange("zip", val)} onBlur={() => handleBlur("zip")} error={getError("zip")} />
                     <InputField label="Delivery Instructions" placeholder="Leave at the front desk..." value={formData.instructions} onChange={(val) => handleInputChange("instructions", val)} />
                     <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                       <label style={styles.inputLabel}>Delivery Speed</label>
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                         <DeliverySpeedCard id="standard" label="Standard" desc="3-5 Business Days" price="₱50" selected={deliverySpeed} onSelect={setDeliverySpeed} />
                         <DeliverySpeedCard id="express" label="Express" desc="1-2 Business Days" price="₱150" selected={deliverySpeed} onSelect={setDeliverySpeed} />
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Payment Method */}
                 <div style={styles.checkoutSection}>
                   <h2 style={styles.checkoutSectionTitle}>
                     <span style={styles.checkoutSectionNumber}>2</span>
                     Payment Method
                   </h2>
                   <div style={styles.checkoutFormGrid}>
                     <PaymentCard id="cod" label="Cash on Delivery" icon={<FaMoneyBillWave color="#16a34a" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="gcash" label="GCash" icon={<span style={{ color: "#3b82f6", fontWeight: 800, fontStyle: "italic", fontSize: "20px", letterSpacing: "-1px" }}>G</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="card" label="Credit / Debit Card" icon={<FaCreditCard color="#4b5563" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="maya" label="Maya" icon={<span style={{ color: "#10b981", fontWeight: 800, fontStyle: "italic", fontSize: "20px" }}>maya</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
                   </div>

                   {/* Dynamic Payment Details */}
                   <div style={styles.paymentDetailsWrap}>
                     {selectedPayment === "cod" && (
                       <div style={styles.paymentInfoBox}>
                          <FaCheckCircle size={16} /> Pay when your order is delivered.
                       </div>
                     )}
                     {selectedPayment === "gcash" && (
                        <div style={styles.paymentDetailsCard}>
                           <div style={styles.paymentInstructions}>Send payment to GCash Number: <strong>0912 345 6789</strong></div>
                           <div style={styles.qrPlaceholder}>
                              <span style={{ fontSize: "24px" }}>📱</span>
                              <span style={{ fontSize: "12px", fontWeight: 600 }}>Scan QR Code</span>
                           </div>
                           <InputField label="Reference Number" placeholder="e.g. 1000293812" value={paymentData.gcashRef} onChange={(val) => handlePaymentInputChange("gcashRef", val)} onBlur={() => handleBlur("gcashRef")} error={getError("gcashRef")} />
                           <div style={styles.uploadProofWrap}>
                              <input type="file" id="gcashProof" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePaymentInputChange("gcashProof", e.target.files[0])} />
                              <button type="button" onClick={() => document.getElementById('gcashProof').click()} style={styles.uploadProofBtn}>Upload Proof</button>
                              {paymentData.gcashProof && <span style={styles.uploadSuccess}><FaCheckCircle /> {paymentData.gcashProof.name}</span>}
                           </div>
                        </div>
                     )}
                     {selectedPayment === "card" && (
                        <div style={styles.paymentDetailsCard}>
                           <InputField label="Card Number" placeholder="0000 0000 0000 0000" value={paymentData.cardNum} onChange={handleCardNumberChange} onBlur={() => handleBlur("cardNum")} error={getError("cardNum")} />
                           <InputField label="Card Holder Name" placeholder="Juan Dela Cruz" value={paymentData.cardName} onChange={(val) => handlePaymentInputChange("cardName", val)} onBlur={() => handleBlur("cardName")} error={getError("cardName")} />
                           <div style={{ display: "flex", gap: "12px" }}>
                              <div style={{ flex: 1 }}><InputField label="Expiry Date" placeholder="MM/YY" value={paymentData.cardExp} onChange={handleCardExpiryChange} onBlur={() => handleBlur("cardExp")} error={getError("cardExp")} /></div>
                              <div style={{ flex: 1 }}><InputField label="CVV" placeholder="123" value={paymentData.cardCvv} onChange={handleCardCvvChange} onBlur={() => handleBlur("cardCvv")} error={getError("cardCvv")} /></div>
                           </div>
                        </div>
                     )}
                     {selectedPayment === "maya" && (
                        <div style={styles.paymentDetailsCard}>
                           <div style={styles.paymentInstructions}>Send payment to Maya Number: <strong>0912 345 6789</strong></div>
                           <InputField label="Reference Number" placeholder="e.g. 1000293812" value={paymentData.mayaRef} onChange={(val) => handlePaymentInputChange("mayaRef", val)} onBlur={() => handleBlur("mayaRef")} error={getError("mayaRef")} />
                           <div style={styles.uploadProofWrap}>
                              <input type="file" id="mayaProof" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePaymentInputChange("mayaProof", e.target.files[0])} />
                              <button type="button" onClick={() => document.getElementById('mayaProof').click()} style={styles.uploadProofBtn}>Upload Proof</button>
                              {paymentData.mayaProof && <span style={styles.uploadSuccess}><FaCheckCircle /> {paymentData.mayaProof.name}</span>}
                           </div>
                        </div>
                     )}
                   </div>
                   
                   {/* Eco Options */}
                   <div style={styles.ecoOptionsWrap}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={supportSeed} onChange={(e) => setSupportSeed(e.target.checked)} style={styles.checkboxInput} />
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          Add ₱20 to support native seed preservation 🌱
                          <span 
                            style={{ cursor: 'help', position: 'relative', color: '#15803d', fontWeight: 800 }}
                            onMouseEnter={() => setShowSeedOptionTooltip(true)}
                            onMouseLeave={() => setShowSeedOptionTooltip(false)}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSeedOptionTooltip(!showSeedOptionTooltip); }}
                          >
                            (?)
                            {showSeedOptionTooltip && (
                              <span style={styles.ecoTooltip} className="animate-fadeIn">
                                Your ₱20 helps preserve endangered native Philippine seeds like Heirloom Adlai, local Tomato varieties, and indigenous herbs.
                                <span style={styles.ecoTooltipArrow} />
                              </span>
                            )}
                          </span>
                        </span>
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={ecoPackaging} onChange={(e) => setEcoPackaging(e.target.checked)} style={styles.checkboxInput} />
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          Use eco-friendly packaging 📦
                          <span 
                            style={{ cursor: 'help', position: 'relative', color: '#15803d', fontWeight: 800 }}
                            onMouseEnter={() => setShowEcoPackagingTooltip(true)}
                            onMouseLeave={() => setShowEcoPackagingTooltip(false)}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEcoPackagingTooltip(!showEcoPackagingTooltip); }}
                          >
                            (?)
                            {showEcoPackagingTooltip && (
                              <span style={styles.ecoTooltip} className="animate-fadeIn">
                                Our eco-packaging uses 100% biodegradable cassava starch peanuts, recycled cardboard, and compostable tape.
                                <span style={styles.ecoTooltipArrow} />
                              </span>
                            )}
                          </span>
                        </span>
                      </label>
                   </div>
                 </div>
              </div>

              {/* Right Column: Order Summary */}
              <div style={styles.checkoutRight}>
                 <div style={{ ...styles.checkoutSection, background: "rgba(255,255,255,0.8)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", height: "100%", display: "flex", flexDirection: "column" }}>
                   <h2 style={{ ...styles.checkoutSectionTitle, borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "12px", marginBottom: "12px", flexShrink: 0 }}>Order Summary ({(uniqueCartItems.length)})</h2>
                   
                   <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "350px", overflowY: "auto", paddingRight: "8px", flexShrink: 0 }} className="custom-scrollbar">
                     {uniqueCartItems.map(item => (
                       <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "12px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                         <div style={{ width: "48px", height: "48px", background: "rgba(22,163,74,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                            {item.icon || "🌱"}
                         </div>
                         <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000", lineHeight: 1.2 }}>{item.title}</span>
                           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                             <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.05)", borderRadius: "6px", overflow: "hidden" }}>
                               <button type="button" style={{ background: "transparent", border: "none", padding: "4px 8px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQuantity(item.id, -1)}><FaMinus size={8} /></button>
                               <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "16px", textAlign: "center", color: "#000" }}>{item.quantity}</span>
                               <button type="button" style={{ background: "transparent", border: "none", padding: "4px 8px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQuantity(item.id, 1)}><FaPlus size={8} /></button>
                             </div>
                             <button type="button" style={{ background: "rgba(225, 29, 72, 0.1)", border: "none", borderRadius: "6px", padding: "4px 8px", color: "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => removeFromCart(item.id)}><FaTrash size={10} /></button>
                           </div>
                         </div>
                         <div style={{ fontSize: "14px", fontWeight: 800, color: "#15803d" }}>
                           ₱{(item.numericPrice * item.quantity).toFixed(2)}
                         </div>
                       </div>
                     ))}
                     {uniqueCartItems.length === 0 && (
                        <div style={{ textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "13px", padding: "24px 0", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>Your cart is empty.</div>
                     )}
                   </div>
                   
                   {/* Promo Code Input */}
                   <div style={{ ...styles.promoWrap, ...(promoError ? { border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' } : promoSuccess ? { border: '1px solid #16a34a', background: 'rgba(22, 163, 74, 0.05)', boxShadow: '0 0 15px rgba(34,197,94,0.2)' } : {}) }} className={`${promoError ? "animate-shakeError" : ""} ${promoSuccess ? "highlight-flash" : ""}`}>
                      <FaTag style={{color: promoError ? '#ef4444' : promoSuccess ? '#16a34a' : 'rgba(0,0,0,0.3)', marginLeft: '12px'}} />
                      <input 
                        value={promoCode} 
                        onChange={e => { setPromoCode(e.target.value); if (promoError) setPromoError(false); if (promoSuccess) setPromoSuccess(false); }} 
                        placeholder="Promo code (e.g. GREEN10)" 
                        style={{ ...styles.promoInput, color: promoError ? '#ef4444' : promoSuccess ? '#16a34a' : '#000' }} 
                      />
                      <button onClick={handleApplyPromo} style={{ ...styles.promoBtn, background: promoError ? '#ef4444' : promoSuccess ? '#16a34a' : '#15803d' }}>{promoSuccess ? 'Applied ✓' : 'Apply'}</button>
                   </div>

                   <div style={{ marginTop: "12px", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
                       <span>Subtotal</span>
                       <span style={{ color: "#000" }}>₱{subtotal.toFixed(2)}</span>
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
                       <span>Shipping Fee</span>
                       <span style={{ color: "#000" }}>₱{shippingFee.toFixed(2)}</span>
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
                       <span>Service Fee</span>
                       <span style={{ color: "#000" }}>₱{serviceFee.toFixed(2)}</span>
                     </div>
                     {supportSeed && (
                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
                         <span 
                           style={{ cursor: 'help', position: 'relative', borderBottom: '1px dotted rgba(0,0,0,0.6)' }}
                           onMouseEnter={() => setShowSeedTooltip(true)}
                           onMouseLeave={() => setShowSeedTooltip(false)}
                           onClick={(e) => { e.stopPropagation(); setShowSeedTooltip(!showSeedTooltip); }}
                         >
                           Seed Donation
                           {showSeedTooltip && (
                             <span style={styles.ecoTooltip} className="animate-fadeIn">
                               Your ₱20 helps preserve endangered native Philippine seeds like Heirloom Adlai, local Tomato varieties, and indigenous herbs.
                               <span style={styles.ecoTooltipArrow} />
                             </span>
                           )}
                         </span>
                         <span style={{ color: "#000" }}>₱20.00</span>
                       </div>
                     )}
                     {discount > 0 && (
                       <div className="animate-slideInDiscount" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#16a34a", fontWeight: 700 }}>
                         <span>Discount</span>
                         <span>-₱{discount.toFixed(2)}</span>
                       </div>
                     )}
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800, color: "#000", marginTop: "8px", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "16px" }}>
                       <span>Total Amount</span>
                       <span style={{ color: "#15803d" }}>₱{totalAmount.toFixed(2)}</span>
                     </div>
                     
                     {/* Reward Points */}
                     <div style={styles.rewardsBox}>
                        <FaGift style={{color: '#15803d'}} />
                        <span>You'll earn <strong 
                          style={{ color: '#15803d', cursor: 'help', position: 'relative', borderBottom: '1px dotted #15803d' }}
                          onMouseEnter={() => setShowEcoTooltip(true)}
                          onMouseLeave={() => setShowEcoTooltip(false)}
                          onClick={(e) => { e.stopPropagation(); setShowEcoTooltip(!showEcoTooltip); }}
                        >
                          {ecoPoints} EcoPoints
                          {showEcoTooltip && (
                            <span style={styles.ecoTooltip} className="animate-fadeIn">
                              Earn EcoPoints on every order. Redeem them for discounts or use them to fund real tree-planting initiatives!
                              <span style={styles.ecoTooltipArrow} />
                            </span>
                          )}
                        </strong> from this purchase!</span>
                     </div>
                   </div>

                   <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "16px" }}>
                     <button 
                       onClick={handlePlaceOrder}
                       className="animate-pulseGlow"
                       style={{ ...styles.checkoutBtnModal, padding: "16px", fontSize: "16px", opacity: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? 0.5 : 1, pointerEvents: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? "none" : "auto" }} 
                       onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                       onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                     >
                       Place Order
                     </button>
                     <button 
                       style={{ ...styles.continueBtn, padding: "12px", fontSize: "14px" }}
                       onClick={() => { setCheckoutOpen(false); setCartOpen(true); }}
                     >
                       Back to Cart
                     </button>
                   </div>
                 </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={styles.trustBadgeRow}>
              <TrustBadge icon={<FaLock color="#16a34a" size={16} />} title="SSL Secured" desc="100% Encrypted" />
              <TrustBadge icon={<FaShieldAlt color="#16a34a" size={16} />} title="Verified Payment" desc="Safe Checkout" />
              <TrustBadge icon={<FaTruck color="#16a34a" size={16} />} title="Fast Delivery" desc="Nationwide" />
              <TrustBadge icon={<FaBoxOpen color="#16a34a" size={16} />} title="Eco-Packaging" desc="Sustainable" />
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccess && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowSuccess(false)}>
          <div className="inner-blur-glass" style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <FaCheckCircle style={{ color: "#22c55e", fontSize: "64px", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#000", margin: "0 0 8px" }}>Order Confirmed!</h2>
            <p style={{ fontSize: "15px", color: "rgba(0,0,0,0.6)", marginBottom: "32px", lineHeight: 1.5 }}>
              Your order has been successfully placed. We will send you an email confirmation shortly.
            </p>
            <div style={{display: 'flex', gap: '12px', width: '100%'}}>
               <button 
                 style={{ ...styles.continueBtn, flex: 1, padding: "14px", fontSize: "14px", background: "rgba(0,0,0,0.05)" }}
                 onClick={() => {
                   setShowSuccess(false);
                   if (onTrackOrder) onTrackOrder(latestOrder);
                 }}
               >
                 Track Order
               </button>
               <button 
                 onClick={() => setShowSuccess(false)}
                 style={{ ...styles.checkoutBtnModal, flex: 1, padding: "14px", fontSize: "14px" }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
               >
                 Continue Shopping
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const InputField = ({ label, placeholder, value, onChange, onBlur, error }) => (
  <div style={styles.inputWrap}>
    <label style={{ ...styles.inputLabel, color: error ? '#ef4444' : 'rgba(0,0,0,0.7)' }}>{label}</label>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onBlur={onBlur}
      style={{ ...styles.inputField, ...(error ? styles.inputFieldError : {}) }}
    />
    {typeof error === 'string' && <span style={styles.errorText}>{error}</span>}
  </div>
);

const PaymentCard = ({ id, label, icon, selected, onSelect }) => (
  <button 
    type="button"
    onClick={() => onSelect(id)}
    style={{ ...styles.paymentCard, ...(selected === id ? styles.paymentCardActive : {}) }}
  >
    <div style={{ ...styles.paymentRadio, ...(selected === id ? styles.paymentRadioActive : {}) }}>
      {selected === id && <div style={styles.paymentRadioInner} />}
    </div>
    <div style={{ flex: 1, textAlign: "left", fontSize: "15px", fontWeight: 700, color: "#000" }}>{label}</div>
    <div style={{ flexShrink: 0 }}>{icon}</div>
  </button>
);

const DeliverySpeedCard = ({ id, label, desc, price, selected, onSelect }) => (
  <button 
    type="button"
    onClick={() => onSelect(id)}
    style={{ ...styles.paymentCard, ...(selected === id ? styles.paymentCardActive : {}), padding: "12px 14px" }}
  >
    <div style={{ ...styles.paymentRadio, ...(selected === id ? styles.paymentRadioActive : {}) }}>
      {selected === id && <div style={styles.paymentRadioInner} />}
    </div>
    <div style={{ flex: 1, textAlign: "left", display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#000", lineHeight: 1 }}>{label}</span>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", lineHeight: 1 }}>{desc}</span>
    </div>
    <div style={{ fontSize: "13px", fontWeight: 800, color: "#15803d" }}>{price}</div>
  </button>
);

const TrustBadge = ({ icon, title, desc }) => (
  <div style={styles.trustBadge}>
    <div style={styles.trustBadgeIconWrap}>
      {icon}
    </div>
    <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 800, color: "#000" }}>{title}</h4>
    <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>{desc}</p>
  </div>
);

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px 16px 60px",
    maxWidth: "1000px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "16px 12px 40px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "20px",
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
  title: {
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 800,
    color: "#000",
    margin: "0 auto 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 18px",
    boxShadow: "0 0 18px rgba(134,239,172,0.75)",
    borderRadius: "999px",
  },
  accent: {
    background: "linear-gradient(90deg, #4ade80, #86efac)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    marginBottom: "40px",
    fontSize: "clamp(14px, 1.6vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: "600px",
  },
  bodyMobile: {
    marginBottom: "24px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: "16px",
  },
  iconActions: {
    display: "flex",
    gap: "8px",
  },
  iconActionBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "12px",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
    flexShrink: 0,
  },
  iconBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#e11d48",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 700,
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    width: "100%",
  },
  gridMobile: {
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: "24px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardHov: {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 40px rgba(21,128,61,0.12)",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "180px",
    background: "rgba(22, 163, 74, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  badgeLabel: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(21,128,61,0.3)",
  },
  saveBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(255,255,255,0.8)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  saveBtnActive: {
    color: "#e11d48",
    background: "#fff",
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    textAlign: "left",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "10px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
    lineHeight: 1.2,
  },
  cardPrice: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#15803d",
    background: "rgba(22, 163, 74, 0.1)",
    padding: "4px 10px",
    borderRadius: "8px",
  },
  cardDesc: {
    fontSize: "13.5px",
    color: "rgba(0,0,0,0.65)",
    lineHeight: 1.6,
    margin: "0 0 24px",
    flex: 1,
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "auto",
  },
  viewBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "#000",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  addToCartBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: "12px",
    background: "rgba(22, 163, 74, 0.1)",
    border: "1px solid rgba(22, 163, 74, 0.2)",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  buyNowBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#062018",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34,197,94,0.15)",
    transition: "transform 0.2s ease",
  },
  getStartedBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #4ade80, #0ea5e9)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
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
  modalContent: {
    maxWidth: "540px",
    width: "100%",
    maxHeight: "85vh",
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
    textAlign: "left",
  },
  modalContentMobile: {
    padding: "24px 16px"
  },
  modalCloseBtn: {
    position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "background 0.2s"
  },
  modalTitle: {
    fontSize: "24px", fontWeight: 800, color: "#000", margin: "0 0 20px", lineHeight: 1.2
  },
  modalBody: {
    fontSize: "14.5px", color: "rgba(0,0,0,0.8)", lineHeight: 1.6
  },
  modalList: {
    paddingLeft: "20px", margin: "10px 0 24px"
  },
  modalListItem: {
    marginBottom: "10px"
  },
  actionBtnModal: {
    width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.4)", color: "#062018", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(34,197,94,0.2)", transition: "transform 0.2s ease"
  },
  cartModal: {
    maxWidth: "500px", width: "100%", maxHeight: "85vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "24px", padding: "32px 24px", display: "flex", flexDirection: "column", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", position: "relative", animation: "scaleUp 0.3s ease", textAlign: "left"
  },
  cartModalMobile: { padding: "24px 16px", maxHeight: "90vh" },
  confirmOverlay: {
    position: "absolute", inset: 0, zIndex: 60, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "inherit", animation: "fadeIn 0.2s ease-out"
  },
  confirmBox: {
    background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out"
  },
  confirmIconWrap: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(225, 29, 72, 0.2)", animation: "shakeIcon 0.6s ease-in-out" },
  confirmTitle: { margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" },
  confirmText: { margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 },
  confirmBtnRow: { display: "flex", gap: "12px", width: "100%" },
  cancelBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" },
  clearAllBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(225, 29, 72, 0.3)" },
  emptyCartBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", fontSize: "12px", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)", transition: "all 0.3s ease" },
  cartModalTitle: { fontSize: "24px", fontWeight: 800, color: "#000", textAlign: "center", margin: "0 0 20px", letterSpacing: "-0.5px", position: "relative", zIndex: 1 },
  cartItemsContainer: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px", marginBottom: "20px", position: "relative", zIndex: 1 },
  emptyCartText: { textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "15px", marginTop: "20px" },
  cartItem: { display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "12px" },
  cartItemImgWrap: { width: "60px", height: "60px", borderRadius: "12px", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cartItemDetails: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  cartItemName: { fontSize: "14px", fontWeight: 700, color: "#000" },
  cartItemPrice: { fontSize: "13px", fontWeight: 600, color: "#15803d" },
  cartItemActions: { display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" },
  quantityControls: { display: "flex", alignItems: "center", background: "rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" },
  qtyBtn: { background: "transparent", border: "none", padding: "6px 8px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: "13px", fontWeight: 600, minWidth: "20px", textAlign: "center", color: "#000" },
  removeBtn: { background: "rgba(225, 29, 72, 0.1)", border: "none", borderRadius: "8px", padding: "6px 8px", color: "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  cartItemSubtotal: { fontSize: "14px", fontWeight: 800, color: "#000" },
  cartFooter: { borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 },
  cartTotalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "18px", fontWeight: 700, color: "#000" },
  cartTotalAmount: { fontSize: "20px", fontWeight: 800, color: "#15803d" },
  cartFooterBtns: { display: "flex", gap: "12px" },
  continueBtn: {
    flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", color: "#000", fontSize: "14px", fontWeight: 600, cursor: "pointer"
  },
  checkoutBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease"
  },
  checkoutBtnModal: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#062018",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(34,197,94,0.2)",
    transition: "transform 0.2s ease"
  },
  checkoutModal: {
    maxWidth: "1160px",
    width: "100%",
    height: "calc(100vh - 40px)",
    maxHeight: "none",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "30px",
    padding: "24px 40px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflowY: "auto",
    boxSizing: "border-box"
  },
  checkoutModalMobile: {
    height: "calc(100dvh - clamp(8px, 2dvh, 16px))",
    width: "calc(100vw - clamp(18px, 6vw, 48px))",
    maxWidth: "430px",
    padding: "24px 16px",
    borderRadius: "clamp(18px, 5vw, 24px)",
  },
  checkoutGrid: { display: "flex", flexWrap: "wrap", gap: "16px", width: "100%", alignItems: "stretch" },
  checkoutLeft: { flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "20px" },
  checkoutRight: { flex: "1 1 300px", display: "flex", flexDirection: "column", position: "sticky", top: "0px", alignSelf: "flex-start" },
  checkoutSection: { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "24px", padding: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" },
  checkoutSectionTitle: { fontSize: "18px", fontWeight: 800, color: "#000", marginBottom: "12px", marginTop: "0", display: "flex", alignItems: "center", gap: "10px" },
  checkoutSectionNumber: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800 },
  checkoutFormGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  inputWrap: { display: "flex", flexDirection: "column", gap: "4px", width: "100%" },
  inputLabel: { fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "4px" },
  inputField: { width: "100%", padding: "10px 14px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "13px", color: "#000", outline: "none", boxSizing: "border-box", transition: "all 0.2s ease", fontFamily: "inherit" },
  inputFieldError: { border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.05)" },
  errorText: { fontSize: "10px", fontWeight: 800, color: "#ef4444", marginLeft: "4px", marginTop: "-2px" },
  stepperWrap: { display: "flex", alignItems: "center", justifyContent: "center", width: "85%", maxWidth: "400px", margin: "0 auto 32px", position: "relative" },
  step: { display: "flex", alignItems: "center", position: "relative", flex: 1 },
  stepDot: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, zIndex: 2, border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "all 0.3s ease" },
  stepDotActive: { background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", boxShadow: "0 4px 12px rgba(21,128,61,0.3)" },
  stepText: { position: "absolute", top: "36px", left: "14px", transform: "translateX(-50%)", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.4)", whiteSpace: "nowrap" },
  stepTextActive: { color: "#15803d", fontWeight: 800 },
  stepLine: { flex: 1, height: "4px", background: "rgba(0,0,0,0.05)", margin: "0 4px", borderRadius: "999px", position: "relative", zIndex: 1 },
  stepLineActive: { background: "linear-gradient(90deg, #16a34a, #86efac)" },
  deliveryEstimateCard: { background: "linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(22, 163, 74, 0.05))", border: "1px solid rgba(22, 163, 74, 0.2)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  ecoOptionsWrap: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.05)" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600, color: "rgba(0,0,0,0.8)", cursor: "pointer" },
  checkboxInput: { width: "18px", height: "18px", accentColor: "#16a34a", cursor: "pointer" },
  promoWrap: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "14px", marginTop: "8px", overflow: "hidden" },
  promoInput: { flex: 1, border: "none", background: "transparent", padding: "12px", fontSize: "13px", fontWeight: 500, outline: "none", color: "#000" },
  promoBtn: { background: "#15803d", color: "#fff", border: "none", padding: "0 16px", height: "100%", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  rewardsBox: { background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", fontWeight: 600, color: "#b45309", marginTop: "4px" },
  ecoTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: "10px",
    background: "#062018",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    width: "220px",
    textAlign: "center",
    zIndex: 100,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    pointerEvents: "none",
    lineHeight: 1.5,
    whiteSpace: "normal"
  },
  ecoTooltipArrow: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    borderWidth: "6px",
    borderStyle: "solid",
    borderColor: "#062018 transparent transparent transparent",
  },
  paymentCard: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" },
  paymentCardActive: { background: "rgba(22, 163, 74, 0.08)", border: "1px solid #16a34a", boxShadow: "0 4px 15px rgba(22,163,74,0.15)" },
  paymentRadio: { width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,255,255,0.5)" },
  paymentRadioActive: { borderColor: "#16a34a", background: "#fff" },
  paymentRadioInner: { width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a" },
  paymentDetailsWrap: { marginTop: "16px", animation: "fadeIn 0.3s ease" },
  paymentInfoBox: { background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", borderRadius: "12px", padding: "16px", color: "#15803d", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" },
  paymentDetailsCard: { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" },
  paymentInstructions: { fontSize: "13px", color: "rgba(0,0,0,0.7)" },
  qrPlaceholder: { width: "100%", height: "100px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(0,0,0,0.15)", color: "rgba(0,0,0,0.5)", gap: "4px" },
  uploadProofWrap: { display: "flex", alignItems: "center", gap: "12px" },
  uploadProofBtn: { padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "background 0.2s" },
  uploadSuccess: { fontSize: "12px", color: "#15803d", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" },
  trustBadgeRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" },
  trustBadge: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  trustBadgeIconWrap: { width: "32px", height: "32px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" },
  successModal: { maxWidth: "460px", width: "90%", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "32px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", boxSizing: "border-box" },
};

export default StarterKits;