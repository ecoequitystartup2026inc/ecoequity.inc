import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaShoppingCart, FaHeart, FaTimes, FaPlus, FaMinus, FaTrash, FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaLock, FaSeedling, FaGift, FaBoxOpen, FaClipboardList, FaTag, FaStar } from "react-icons/fa";
import { Sprout, Heart, Check, Smartphone, ShoppingCart, ArrowLeft } from "lucide-react";
import QuickViewModal from "./QuickViewModal";
import { MODAL_LAYER, modalOverlay, nestedConfirmOverlay } from "../styles/modal";

const categories = [
  "All",
  "Organic Edibles",
  "Herbs",
  "Floriculture",
  "Native Seeds",
  "Soil Mixes",
  "Gardening Tools",
  "Starter Kits",
];

/* `stock` is a label ("In Stock" / "Low Stock"), not a number, so scarcity is
   whatever the catalogue says it is — never something the UI works out itself. */
const isLowStock = (product) =>
  typeof product?.stock === "string" && /low|out/i.test(product.stock);

function ShopAllProducts({ setActiveNav, cartItems, setCartItems, savedProducts, setSavedProducts, setOrders, onTrackOrder, products, setProducts, promoCodes, addOrderEcoPoints, ecoEarnRate = 0.1, initialCheckoutOpen = false }) {
  // Append a customer review to a product and recompute its average rating + count.
  const handleAddReview = (productId, review) => {
    if (!setProducts) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const reviews = [...(p.reviews || []), review];
        const reviewCount = (p.reviewCount || 0) + 1;
        const totalStars = (p.rating || 0) * (p.reviewCount || 0) + review.rating;
        const rating = Math.round((totalStars / reviewCount) * 10) / 10;
        return { ...p, reviews, reviewCount, rating };
      })
    );
  };
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // The checkout header gives up detail in stages as it narrows: below 1120px
  // only the active step keeps its label, below 940px the stepper goes.
  const [winWidth, setWinWidth] = useState(window.innerWidth);
  const isNarrow = winWidth < 1120;
  const showStepper = winWidth >= 940;
  // Below this the summary can no longer sit beside the form and wraps under
  // it, where a 420px-capped, sticky rail would be a narrow card with half a
  // row of empty space next to it.
  const summaryStacked = winWidth < 900;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileCategoryDropdownOpen, setIsMobileCategoryDropdownOpen] = useState(false);
  const [hoveredMobileCatSelect, setHoveredMobileCatSelect] = useState(false);
  const mobileCategoryDropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState("Recommended");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [hoveredSortOption, setHoveredSortOption] = useState(null);
  const sortDropdownRef = useRef(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);
  const [animations, setAnimations] = useState([]);
  const cartIconRef = useRef(null);
  const heartIconRef = useRef(null);
  // Opens straight into checkout when the shop was entered from a "Buy Now".
  const [checkoutOpen, setCheckoutOpen] = useState(initialCheckoutOpen);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [showSuccess, setShowSuccess] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [supportSeed, setSupportSeed] = useState(false);
  const [ecoPackaging, setEcoPackaging] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    instructions: ""
  });
  const [paymentData, setPaymentData] = useState({
    gcashRef: "",
    gcashProof: null,
    cardNum: "",
    cardName: "",
    cardExp: "",
    cardCvv: "",
    mayaRef: "",
    mayaProof: null,
  });
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showEcoTooltip, setShowEcoTooltip] = useState(false);
  const [showSeedTooltip, setShowSeedTooltip] = useState(false);
  const [showSeedOptionTooltip, setShowSeedOptionTooltip] = useState(false);
  const [showEcoPackagingTooltip, setShowEcoPackagingTooltip] = useState(false);
  const [cartBadgeAnim, setCartBadgeAnim] = useState(false);
  const [wishlistBadgeAnim, setWishlistBadgeAnim] = useState(false);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setCartBadgeAnim(true);
      const t = setTimeout(() => setCartBadgeAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [cartItems ? cartItems.length : 0]);

  useEffect(() => {
    if (savedProducts && savedProducts.length > 0) {
      setWishlistBadgeAnim(true);
      const t = setTimeout(() => setWishlistBadgeAnim(false), 300);
      return () => clearTimeout(t);
    }
  }, [savedProducts ? savedProducts.length : 0]);

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

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

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

  useEffect(() => {
    if (cartOpen || wishlistOpen || checkoutOpen || showSuccess || quickViewProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, wishlistOpen, checkoutOpen, showSuccess, quickViewProduct]);

  const cartItemCounts = cartItems.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const uniqueCartItems = Object.keys(cartItemCounts).map((id) => {
    const product = products.find((p) => p.id === parseInt(id));
    return product ? { ...product, quantity: cartItemCounts[id] } : null;
  }).filter(Boolean);

  const uniqueWishlistItems = savedProducts.map((id) => {
    return products.find((p) => p.id === id);
  }).filter(Boolean);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      const currentCount = prev.filter((itemId) => itemId === id).length;
      const newCount = currentCount + delta;
      if (newCount <= 0) {
        return prev.filter((itemId) => itemId !== id);
      }
      if (delta > 0) {
        return [...prev, id];
      } else {
        const index = prev.indexOf(id);
        if (index > -1) {
          const next = [...prev];
          next.splice(index, 1);
          return next;
        }
        return prev;
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const subtotal = uniqueCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = uniqueCartItems.length > 0 ? (deliverySpeed === "express" ? 150 : 50) : 0;
  const serviceFee = uniqueCartItems.length > 0 ? 15 : 0;
  const seedDonation = supportSeed ? 20 : 0;
  const totalAmount = Math.max(0, subtotal + shippingFee + serviceFee + seedDonation - discount);
  /* The admin-configured rate (eco_program.earnRate), not a hardcoded 0.1 —
     the summary was quoting a number the program no longer used. */
  const ecoPoints = Math.floor(totalAmount * ecoEarnRate);

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "") {
      setDiscount(0);
      setPromoError(false);
      setPromoSuccess(false);
      return;
    }
    
    const promo = (promoCodes || []).find(p => p.code.toUpperCase() === code);
    if (promo) {
      let discAmount = 0;
      if (promo.type === "percent") discAmount = subtotal * (promo.value / 100);
      else if (promo.type === "shipping") discAmount = shippingFee;
      else if (promo.type === "fixed") discAmount = parseFloat(promo.value) || 0;
      
      setDiscount(discAmount);
      setPromoError(false); setPromoSuccess(true); setTimeout(() => setPromoSuccess(false), 2000);
    } else { 
      setDiscount(0); 
      setPromoError(true); 
      setPromoSuccess(false);
      setTimeout(() => setPromoError(false), 500); 
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
    if (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) return;

    const orderItems = uniqueCartItems.map(item => `${item.quantity}x ${item.name || item.title}`).join(", ");
    const newOrder = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
      payment: selectedPayment === 'cod' ? 'Cash on Delivery' : selectedPayment === 'gcash' ? 'GCash' : selectedPayment === 'maya' ? 'Maya' : 'Credit Card',
      paymentStatus: selectedPayment === 'cod' ? 'Pending' : 'Paid',
      deliverySpeed,
      subtotal,
      shippingFee,
      serviceFee,
      seedDonation,
      discount,
      ecoPackaging,
      rider: "Unassigned",
      // Structured cart, saved as order_items rows in Supabase (see data/orders.js).
      lineItems: uniqueCartItems.map(item => ({
        product_id: item.id,
        name: item.name || item.title,
        qty: item.quantity,
        price: Number(item.price) || 0,
      })),
    };

    setCheckoutOpen(false);
    setShowSuccess(true);
    setLatestOrder(newOrder);
    if (setOrders) {
      setOrders(prev => [newOrder, ...prev]);
    }
    // The summary promises "You'll earn N EcoPoints"; this is what actually
    // credits them. Without it the checkout made a claim the account never
    // honoured. The server recomputes the amount — totalAmount is the input.
    if (addOrderEcoPoints && totalAmount > 0) {
      addOrderEcoPoints(totalAmount);
    }
    if (setCartItems) setCartItems([]);
    setFormData({
      fullName: "", phone: "", email: "", address: "", city: "", province: "", zip: "", instructions: ""
    });
    setPromoCode("");
    setDiscount(0);
    setPromoError(false);
    setSupportSeed(false);
    setEcoPackaging(false);
    setPaymentData({
      gcashRef: "", gcashProof: null, cardNum: "", cardName: "", cardExp: "", cardCvv: "", mayaRef: "", mayaProof: null,
    });
    setTouched({});
  };

  useEffect(() => {
    const saved = localStorage.getItem("ecoequity_reviews");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let changed = false;
        products.forEach(p => {
          if (parsed[p.id] && !p.__reviewsHydratedShop) {
             p.__reviewsHydratedShop = true;
             p.reviews = [...parsed[p.id], ...(p.reviews || [])];
             const addedScore = parsed[p.id].reduce((sum, r) => sum + r.rating, 0);
             const originalTotalScore = (p.rating || 0) * (p.reviewCount || 0);
             p.reviewCount = (p.reviewCount || 0) + parsed[p.id].length;
             p.rating = (originalTotalScore + addedScore) / p.reviewCount;
             changed = true;
          }
        });
        if (changed) setForceRender(prev => prev + 1);
      } catch (e) { console.error("Could not parse saved reviews."); }
    }

    const handleClickOutside = (event) => {
      if (mobileCategoryDropdownRef.current && !mobileCategoryDropdownRef.current.contains(event.target)) {
        setIsMobileCategoryDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isMobileCategoryDropdownOpen || isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileCategoryDropdownOpen, isSortDropdownOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWinWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSaveProduct = (id) => {
    setSavedProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const triggerAnimation = (e, type) => {
    const targetRef = type === 'cart' ? cartIconRef : heartIconRef;
    if (!targetRef.current) return;
    const targetRect = targetRef.current.getBoundingClientRect();
    
    const newAnim = {
      id: Date.now() + Math.random(),
      startX: e.clientX,
      startY: e.clientY,
      endX: targetRect.left + targetRect.width / 2,
      endY: targetRect.top + targetRect.height / 2,
      type
    };
    
    setAnimations(prev => [...prev, newAnim]);
    setTimeout(() => setAnimations(prev => prev.filter(a => a.id !== newAnim.id)), 600);
  };

  const getSortedProducts = (products) => {
    const sorted = [...products];
    if (sortOption === "Price: Low to High") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === "Price: High to Low") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === "Highest Rated") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  };

  const filteredProducts = getSortedProducts(
    products
      .filter(p => selectedCategory === "All" || p.category === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
    
  // Get 2 items not in cart for recommendations
  const recommendations = products.filter(p => !cartItems.includes(p.id)).slice(0, 2);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>{`
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
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(var(--eco-c7-rgb), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0); }
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
        @keyframes shakeIcon {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
        }
        @keyframes fillLine {
            from { width: 0%; }
            to { width: 100%; }
        }
        @keyframes badgePop {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
        }
        .animate-badgePop {
            animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHovered ? styles.backBtnHov : {}),
            }}
              onClick={() => setActiveNav && setActiveNav(isMobile ? "Home" : "ProductsPage")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          > 
            <span>←</span>
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Shop</span>
        </div>
      </div>

      <h1 style={styles.title}>
        Shop <span style={styles.accent}>All Products</span>
      </h1>

      <div style={{ ...styles.shopLayout, ...(isMobile ? styles.shopLayoutMobile : {}) }}>
        {/* Sidebar (Desktop) */}
        {!isMobile && (
          <aside className="inner-blur-glass" style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Categories</h3>
            <div style={styles.categoryList}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    ...styles.catBtn,
                    ...(selectedCategory === cat ? styles.catBtnActive : {}),
                    ...(hoveredCategory === cat && selectedCategory !== cat ? styles.catBtnHover : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main style={styles.mainArea}>
          <div style={{ ...styles.toolbar, ...(isMobile ? styles.toolbarMobile : {}) }}>
            <div style={{ ...styles.searchSection, ...(isMobile ? styles.searchSectionMobile : {}) }}>
              <div style={styles.searchWrap}>
                <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search organic products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>
            
            <div style={styles.filtersWrap}>
              {isMobile && (
                <div style={{ position: 'relative', flex: 1 }} ref={mobileCategoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsMobileCategoryDropdownOpen(!isMobileCategoryDropdownOpen)}
                    onMouseEnter={() => setHoveredMobileCatSelect(true)}
                    onMouseLeave={() => setHoveredMobileCatSelect(false)}
                    style={{
                      ...styles.customSortSelect,
                      ...(isMobileCategoryDropdownOpen ? styles.customSortSelectActive : {}),
                      ...(hoveredMobileCatSelect && !isMobileCategoryDropdownOpen ? styles.customSortSelectHover : {})
                    }}
                  >
                    {selectedCategory}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isMobileCategoryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease"
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {isMobileCategoryDropdownOpen && (
                    <div style={{...styles.sortByDropdownMenu, zIndex: 101}}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsMobileCategoryDropdownOpen(false);
                          }}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          style={{ ...styles.sortByDropdownItem, ...(selectedCategory === cat ? styles.sortByDropdownItemActive : {}), ...(hoveredCategory === cat && selectedCategory !== cat ? styles.sortByDropdownItemHover : {}) }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sort Dropdown */}
              <div style={{ position: 'relative', flex: isMobile ? 1 : 'none' }} ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  style={{
                    ...styles.customSortSelect,
                    ...(isSortDropdownOpen ? styles.customSortSelectActive : {})
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!isMobile && <span style={{ marginRight: "4px", fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>Sort:</span>}
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isMobile ? "70px" : "120px" }}>{sortOption}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSortDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", marginLeft: "6px", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {isSortDropdownOpen && (
                  <div style={{...styles.sortByDropdownMenu, zIndex: 101, right: 0, left: isMobile ? 0 : "auto", minWidth: "160px"}}>
                    {["Recommended", "Price: Low to High", "Price: High to Low", "Highest Rated"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortOption(opt); setIsSortDropdownOpen(false); }}
                        onMouseEnter={() => setHoveredSortOption(opt)}
                        onMouseLeave={() => setHoveredSortOption(null)}
                        style={{ ...styles.sortByDropdownItem, ...(sortOption === opt ? styles.sortByDropdownItemActive : {}), ...(hoveredSortOption === opt && sortOption !== opt ? styles.sortByDropdownItemHover : {}) }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={styles.iconActions}>
                <button ref={heartIconRef} style={styles.iconActionBtn} title="Wishlist" onClick={() => setWishlistOpen(true)}>
                  <FaHeart style={{ color: "var(--eco-c13)" }} size={18} />
                  {savedProducts.length > 0 && <span data-no-invert style={styles.iconBadge} className={wishlistBadgeAnim ? "animate-badgePop" : ""}>{savedProducts.length}</span>}
                </button>
                <button ref={cartIconRef} style={styles.iconActionBtn} title="Cart" onClick={() => setCartOpen(true)}>
                  <FaShoppingCart style={{ color: "var(--eco-c13)" }} size={18} />
                  {cartItems.length > 0 && <span data-no-invert style={styles.iconBadge} className={cartBadgeAnim ? "animate-badgePop" : ""}>{cartItems.length}</span>}
                </button>
              </div>
            </div>
          </div>

          <div style={{ ...styles.productGrid, ...(isMobile ? styles.productGridMobile : {}) }}>
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="inner-blur-glass"
                style={{ ...styles.productCard, ...(isMobile ? styles.productCardMobile : {}), ...(hoveredProduct === product.id ? styles.productCardHov : {}), cursor: "pointer" }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => setQuickViewProduct(product)}
              >
                <div style={{ ...styles.imageContainer, ...(isMobile ? styles.imageContainerMobile : {}) }}>
                  <div style={styles.imagePlaceholder}>
                     <ProductImage
                       src={product.image}
                       alt={product.name}
                       emoji={product.emoji}
                       imgStyle={styles.productImg}
                       fallbackSize={isMobile ? "28px" : "36px"}
                     />
                  </div>
                  {product.badge && <span style={{ ...styles.badgeLabel, ...(isMobile ? styles.badgeLabelMobile : {}) }}>{product.badge}</span>}
                  <button 
                    style={{ ...styles.saveBtn, ...(isMobile ? styles.saveBtnMobile : {}), ...(savedProducts.includes(product.id) ? styles.saveBtnActive : {}) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!savedProducts.includes(product.id)) {
                        triggerAnimation(e, 'heart');
                      }
                      toggleSaveProduct(product.id);
                    }}
                    title="Save Product"
                  >
                    {savedProducts.includes(product.id) ? <Heart size="1em" fill="var(--eco-c9)" color="var(--eco-c9)" /> : <Heart size="1em" color="#94a3b8" />}
                  </button>
                </div>
                <div style={{ ...styles.productInfo, ...(isMobile ? styles.productInfoMobile : {}) }}>
                  <span style={{ ...styles.productCat, ...(isMobile ? styles.productCatMobile : {}) }}>{product.category}</span>
                  <h3 style={{ ...styles.productName, ...(isMobile ? styles.productNameMobile : {}) }}>{product.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px", marginBottom: "1px", minWidth: 0 }}>
                     <FaStar style={{ color: "var(--eco-c6)", fontSize: isMobile ? "10px" : "12px", flexShrink: 0 }} />
                     <span style={{ fontSize: isMobile ? "10px" : "12px", fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                     <span style={{ fontSize: isMobile ? "9px" : "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>({product.reviewCount || 0} reviews)</span>
                  </div>
                  <div style={{ ...styles.productPrice, ...(isMobile ? styles.productPriceMobile : {}) }}>₱{product.price.toFixed(2)}</div>
                </div>
                <div style={{ ...styles.actionButtons, ...(isMobile ? styles.actionButtonsMobile : {}) }}>
                  <button 
                    style={{ ...styles.addToCartBtn, ...(isMobile ? styles.productActionBtnMobile : {}) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartItems(prev => [...prev, product.id]);
                      triggerAnimation(e, 'cart');
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Add to Cart
                  </button>
                  <button style={{ ...styles.buyNowBtn, ...(isMobile ? styles.productActionBtnMobile : {}) }} onClick={(e) => { e.stopPropagation(); setCartItems(prev => [...prev, product.id]); setCheckoutOpen(true); }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    Buy Now
                  </button>
                </div>
              </div>
            )) : (
              <div style={styles.emptyState}>No products found matching your search.</div>
            )}
          </div>
        </main>
      </div>
      
      {/* Render active flying animations */}
      {animations.map(anim => <FloatingIcon key={anim.id} anim={anim} />)}

      {/* Wishlist Modal */}
      {wishlistOpen && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => { setWishlistOpen(false); setShowClearWishlistConfirm(false); }}>
          <div 
            className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-gradient-to-br from-white/90 to-green-50/80 border border-white/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md inner-blur-glass" 
            style={{ ...styles.cartModal, ...(isMobile ? styles.cartModalMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            {showClearWishlistConfirm && (
              <div style={styles.confirmOverlay}>
                <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
                    <FaTrash size={24} style={{ color: "var(--eco-c13)" }} />
                  </div>
                  <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Empty Wishlist?</h3>
                  <p style={{ margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button 
                      onClick={() => setShowClearWishlistConfirm(false)} 
                      style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                    >Cancel</button>
                    <button 
                      onClick={() => { setSavedProducts([]); setShowClearWishlistConfirm(false); }} 
                      style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
                    >Empty</button>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => { setWishlistOpen(false); setShowClearWishlistConfirm(false); }} 
              style={styles.closeModalBtn}
              className="absolute top-4 right-4 bg-black/5 rounded-full w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
            >
              <FaTimes />
            </button>
            
            <h2 style={styles.modalTitle} className="text-2xl font-extrabold text-black text-center mb-5 tracking-tight">Your Wishlist</h2>
            
            {uniqueWishlistItems.length > 0 && (
              <div className="flex justify-end mb-2 px-1">
                <button 
                  onClick={() => setShowClearWishlistConfirm(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px", borderRadius: "999px",
                    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)",
                    color: "rgba(0,0,0,0.6)", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c0-rgb), 0.9)"; e.currentTarget.style.borderColor = "rgba(var(--eco-c9-rgb), 0.2)"; e.currentTarget.style.color = "var(--eco-c9)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(var(--eco-c9-rgb), 0.1), inset 0 1px 0 rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "rgba(0,0,0,0.6)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <FaTrash size={12} style={{ marginTop: "-1px" }} /> Empty Wishlist
                </button>
              </div>
            )}
            
            <div style={styles.cartItemsContainer} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mb-5 hide-scroll">
              {uniqueWishlistItems.length === 0 ? (
                <p style={styles.emptyCartText} className="text-center text-black/50 text-base mt-5">Your wishlist is empty.</p>
              ) : (
                uniqueWishlistItems.map(item => (
                  <div key={item.id} style={styles.cartItem} className="flex items-center gap-3 bg-white/60 border border-black/5 rounded-2xl p-3">
                    <div style={styles.cartItemImgWrap} className="w-16 h-16 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0">
                      <span style={{ fontSize: "24px" }}><Sprout size="1em" color="var(--eco-c9)" /></span>
                    </div>
                    <div style={styles.cartItemDetails} className="flex-1 flex flex-col gap-1">
                      <div style={styles.cartItemName} className="text-sm font-bold text-black">{item.name}</div>
                      <div style={styles.cartItemPrice} className="text-sm font-semibold text-green-700">₱{item.price.toFixed(2)}</div>
                      
                      <div style={styles.cartItemActions} className="flex items-center gap-3 mt-1">
                        <button style={{ ...styles.addToCartBtn, flex: "none", padding: "6px 12px" }} onClick={(e) => { setCartItems(prev => [...prev, item.id]); triggerAnimation(e, 'cart'); }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Add to Cart</button>
                        <button style={styles.removeBtn} className="bg-rose-600/10 border-none rounded-lg p-2 text-rose-600 cursor-pointer flex items-center justify-center" onClick={() => toggleSaveProduct(item.id)}><FaTrash size={12} /></button>
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
            className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-gradient-to-br from-white/90 to-green-50/80 border border-white/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md inner-blur-glass" 
            style={{ ...styles.cartModal, ...(isMobile ? styles.cartModalMobile : {}) }} 
            onClick={(e) => e.stopPropagation()}
          >
            {showClearConfirm && (
              <div style={styles.confirmOverlay}>
                <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
                    <FaTrash size={24} style={{ color: "var(--eco-c13)" }} />
                  </div>
                  <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Clear Cart?</h3>
                  <p style={{ margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button 
                      onClick={() => setShowClearConfirm(false)} 
                      style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                    >Cancel</button>
                    <button 
                      onClick={() => { setCartItems([]); setShowClearConfirm(false); }} 
                      style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
                    >Clear All</button>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => { setCartOpen(false); setShowClearConfirm(false); }} 
              style={styles.closeModalBtn}
              className="absolute top-4 right-4 bg-black/5 rounded-full w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
            >
              <FaTimes />
            </button>
            
            <h2 style={styles.modalTitle} className="text-2xl font-extrabold text-black text-center mb-5 tracking-tight">Your Cart ({cartItems.length})</h2>
            
            {uniqueCartItems.length > 0 && (
              <div className="flex justify-end mb-2 px-1">
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px", borderRadius: "999px",
                    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)",
                    color: "rgba(0,0,0,0.6)", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c0-rgb), 0.9)"; e.currentTarget.style.borderColor = "rgba(var(--eco-c9-rgb), 0.2)"; e.currentTarget.style.color = "var(--eco-c9)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(var(--eco-c9-rgb), 0.1), inset 0 1px 0 rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "rgba(0,0,0,0.6)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <FaTrash size={12} style={{ marginTop: "-1px" }} /> Clear All
                </button>
              </div>
            )}
            
            <div style={styles.cartItemsContainer} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mb-5 hide-scroll">
              {uniqueCartItems.length === 0 ? (
                <p style={styles.emptyCartText} className="text-center text-black/50 text-base mt-5">Your cart is empty.</p>
              ) : (
                uniqueCartItems.map(item => (
                  <div key={item.id} style={styles.cartItem} className="flex items-center gap-3 bg-white/60 border border-black/5 rounded-2xl p-3">
                    <div style={styles.cartItemImgWrap} className="w-16 h-16 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0">
                      <span style={{ fontSize: "24px" }}><Sprout size="1em" color="var(--eco-c9)" /></span>
                    </div>
                    <div style={styles.cartItemDetails} className="flex-1 flex flex-col gap-1">
                      <div style={styles.cartItemName} className="text-sm font-bold text-black">{item.name}</div>
                      <div style={styles.cartItemPrice} className="text-sm font-semibold text-green-700">₱{item.price.toFixed(2)}</div>
                      
                      <div style={styles.cartItemActions} className="flex items-center gap-3 mt-1">
                        <div style={styles.quantityControls} className="flex items-center bg-black/5 rounded-lg overflow-hidden">
                          <button style={styles.qtyBtn} className="bg-transparent border-none p-2 cursor-pointer text-black flex items-center justify-center" onClick={() => updateQuantity(item.id, -1)}><FaMinus size={10} /></button>
                          <span style={styles.qtyText} className="text-sm font-semibold min-w-[20px] text-center">{item.quantity}</span>
                          <button style={styles.qtyBtn} className="bg-transparent border-none p-2 cursor-pointer text-black flex items-center justify-center" onClick={() => updateQuantity(item.id, 1)}><FaPlus size={10} /></button>
                        </div>
                        <button style={styles.removeBtn} className="bg-rose-600/10 border-none rounded-lg p-2 text-rose-600 cursor-pointer flex items-center justify-center" onClick={() => removeFromCart(item.id)}><FaTrash size={12} /></button>
                      </div>
                    </div>
                    <div style={styles.cartItemSubtotal} className="text-sm font-extrabold text-black">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={styles.cartFooter} className="border-t border-black/10 pt-4 flex flex-col gap-4">
              <div style={styles.cartTotalRow} className="flex justify-between items-center text-lg font-bold text-black">
                <span>Total:</span>
                <span style={styles.cartTotalAmount} className="text-xl font-extrabold text-green-700">
                  ₱{uniqueCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <div style={styles.cartFooterBtns} className="flex gap-3">
                <button style={styles.continueBtn} className="flex-1 p-3 rounded-xl bg-white/60 border border-black/10 text-black text-sm font-semibold cursor-pointer" onClick={() => { setCartOpen(false); setShowClearConfirm(false); }}>Continue Shopping</button>
                <button style={styles.checkoutBtn} disabled={uniqueCartItems.length === 0} onClick={() => { setCartOpen(false); setShowClearConfirm(false); setCheckoutOpen(true); }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Checkout</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Checkout Modal */}
      {checkoutOpen && ReactDOM.createPortal(
        /* Full-bleed, same sizing as the Settings shell: the scrim keeps its
           blur but gives up its gutter, so the form owns the whole viewport
           instead of a 1160px card floating in the middle of it. */
        <div style={{ ...styles.modalOverlay, padding: 0, overflow: "hidden" }} onClick={() => setCheckoutOpen(false)}>
          <div
            className="relative inner-blur-glass"
            onClick={(e) => e.stopPropagation()}
            style={{ ...styles.checkoutModal, ...(isMobile ? styles.checkoutModalMobile : {}) }}
          >
            {/* Fixed header bar. Full-screen means there is no card edge to
                anchor the title or the exit control to, so both live in a bar
                that never scrolls away — the stepper, the way back to the cart
                and the way out stay reachable from anywhere in a long form. */}
            <div style={{ ...styles.checkoutHeader, ...(isMobile ? styles.checkoutHeaderMobile : {}) }}>
              <div style={styles.checkoutHeaderSide}>
                <button
                  type="button"
                  onClick={() => { setCheckoutOpen(false); setCartOpen(true); }}
                  style={{ ...styles.checkoutBackBtn, ...(isMobile ? { padding: "8px", borderRadius: "50%" } : {}) }}
                  aria-label="Back to cart"
                >
                  <ArrowLeft size={16} strokeWidth={2.4} />
                  {!isMobile && <span>Back to cart</span>}
                </button>
                <div style={styles.checkoutHeaderTitleWrap}>
                  <h1 style={styles.checkoutHeaderTitle}>Checkout</h1>
                  {/* Just the count: the stepper beside it already names the
                      step on desktop, and the long form truncated at 1024. */}
                  <p style={styles.checkoutHeaderSub}>Step 2 of 3</p>
                </div>
              </div>

              {/* Checkout Progress Stepper — desktop only. Its labels are
                  centred under their dots and need ~420px to stay legible,
                  which a phone header does not have; the subtitle above
                  carries the same "where am I" information there. */}
              {showStepper && (
                <div style={styles.headerStepper}>
                  {['Cart', 'Delivery & Payment', 'Confirmation'].map((step, idx) => {
                    const done = idx < 1;
                    const current = idx === 1;
                    // Labels are inline, not floating under the dots: a header
                    // bar has no room below the row for them to hang in.
                    const showLabel = !isNarrow || current;
                    return (
                      <React.Fragment key={step}>
                        <div style={styles.headerStep}>
                          <div style={{...styles.stepDot, ...(done || current ? styles.stepDotActive : {})}}>{done ? <Check size={13} strokeWidth={3} /> : idx + 1}</div>
                          {showLabel && (
                            <span style={{...styles.headerStepText, ...(done || current ? styles.stepTextActive : {})}}>{step}</span>
                          )}
                        </div>
                        {idx < 2 && (
                          <div style={styles.stepLineTrack}>
                            <div style={{ ...styles.stepLineFill, ...(done ? styles.stepLineFillActive : {}) }} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              <div style={{ ...styles.checkoutHeaderSide, justifyContent: "flex-end" }}>
                {!isMobile && (
                  <span style={styles.secureChip}>
                    <FaLock size={10} /> Secure checkout
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  style={styles.checkoutCloseBtn}
                  aria-label="Close checkout"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar" style={{ ...styles.checkoutScroll, ...(isMobile ? styles.checkoutScrollMobile : {}) }}>
            {/* The shell runs edge to edge; the columns inside do not. Past
                ~1500px a form row is wider than the eye tracks comfortably,
                so the content centres and the extra width becomes margin. */}
            <div style={styles.checkoutContent}>

            <div style={styles.checkoutGrid}>
              {/* Left Column: Form & Payment */}
              <div style={styles.checkoutLeft}>
                 {/* Delivery Info */}
                 <div style={styles.checkoutSection}>
                   {/* The arrival estimate rides in the section header rather
                       than in a banner of its own above the card — it was
                       repeating, word for word, the speed card selected below
                       it. */}
                   <h2 style={styles.checkoutSectionTitle}>
                     <span style={styles.checkoutSectionNumber}>1</span>
                     Delivery Information
                     <span style={{ ...styles.sectionMetaChip, ...(isMobile ? { marginLeft: 0 } : {}) }}>
                       <FaTruck size={11} /> Arrives in {deliverySpeed === "express" ? "1-2" : "3-5"} business days
                     </span>
                   </h2>
                   <div style={{ ...styles.checkoutFormGrid, gridTemplateColumns: isMobile ? "1fr" : isNarrow ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))" }}>
                     <InputField label="Full Name" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={(val) => handleInputChange("fullName", val)} onBlur={() => handleBlur("fullName")} error={getError("fullName")} />
                     <InputField label="Phone Number" placeholder="0912 345 6789" value={formData.phone} onChange={(val) => handleInputChange("phone", val)} onBlur={() => handleBlur("phone")} error={getError("phone")} />
                     <InputField label="Email Address" placeholder="juan@example.com" value={formData.email} onChange={(val) => handleInputChange("email", val)} onBlur={() => handleBlur("email")} error={getError("email")} />
                     {/* A street address is the longest thing typed here, so it
                         gets two tracks while the codes beside it get one. */}
                     <InputField full label="Delivery Address" placeholder="123 Main St, Brgy 1" value={formData.address} onChange={(val) => handleInputChange("address", val)} onBlur={() => handleBlur("address")} error={getError("address")} />
                     <InputField label="City / Municipality" placeholder="Quezon City" value={formData.city} onChange={(val) => handleInputChange("city", val)} onBlur={() => handleBlur("city")} error={getError("city")} />
                     <InputField label="Province" placeholder="Metro Manila" value={formData.province} onChange={(val) => handleInputChange("province", val)} onBlur={() => handleBlur("province")} error={getError("province")} />
                     <InputField label="ZIP / Postal Code" placeholder="1100" value={formData.zip} onChange={(val) => handleInputChange("zip", val)} onBlur={() => handleBlur("zip")} error={getError("zip")} />
                     <InputField full label="Delivery Instructions" placeholder="Leave at the front desk..." value={formData.instructions} onChange={(val) => handleInputChange("instructions", val)} />
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
                   <div style={{ ...styles.checkoutPaymentGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                     <PaymentCard id="cod" label="Cash on Delivery" icon={<FaMoneyBillWave color="var(--eco-c9)" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="gcash" label="GCash" icon={<span style={{ color: "var(--eco-c13)", fontWeight: 800, fontStyle: "italic", fontSize: "20px", letterSpacing: "-1px" }}>G</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="card" label="Credit / Debit Card" icon={<FaCreditCard color="#4b5563" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                     <PaymentCard id="maya" label="Maya" icon={<span style={{ color: "var(--eco-c13)", fontWeight: 800, fontStyle: "italic", fontSize: "20px" }}>maya</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
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
                              <span style={{ fontSize: "24px" }}><Smartphone size="1em" color="var(--eco-c11)" /></span>
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
                 </div>

                 {/* Eco & Support Options — its own numbered step. These were
                     two unlabelled checkboxes hanging off the bottom of the
                     payment card, where they read as fine print rather than
                     the third thing the form asks you to decide. */}
                 <div style={styles.checkoutSection}>
                   <h2 style={styles.checkoutSectionTitle}>
                     <span style={styles.checkoutSectionNumber}>3</span>
                     Eco &amp; Support Options
                   </h2>
                   <div style={styles.ecoOptionsWrap}>
                      <label style={{ ...styles.checkboxLabel, ...styles.ecoOptionRow }}>
                        <input type="checkbox" checked={supportSeed} onChange={(e) => setSupportSeed(e.target.checked)} style={styles.checkboxInput} />
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          Add ₱20 to support native seed preservation
                          <span 
                            style={{ cursor: 'help', position: 'relative', color: 'var(--eco-c13)', fontWeight: 800 }}
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
                      <label style={{ ...styles.checkboxLabel, ...styles.ecoOptionRow }}>
                        <input type="checkbox" checked={ecoPackaging} onChange={(e) => setEcoPackaging(e.target.checked)} style={styles.checkboxInput} />
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          Use eco-friendly packaging
                          <span 
                            style={{ cursor: 'help', position: 'relative', color: 'var(--eco-c13)', fontWeight: 800 }}
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
              <div style={{ ...styles.checkoutRight, ...(summaryStacked ? styles.checkoutRightMobile : {}) }}>
                 <div style={{ ...styles.checkoutSection, ...styles.summaryCard }}>
                   {/* Counts units, not lines — the cart icon and the cart
                       modal both count units, and "(1)" over two tomatoes read
                       as a missing item. */}
                   <h2 style={{ ...styles.checkoutSectionTitle, borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "14px", marginBottom: "14px", flexShrink: 0 }}>
                     Order Summary
                     <span style={styles.summaryCountPill}>{cartItems.length}</span>
                   </h2>

                   {/* Everything between the heading and the buttons scrolls as
                       one region. A cart of five items used to push the whole
                       card past the rail's height and clip Place Order in
                       half; now the heading and the CTA are pinned and only
                       this middle band moves. */}
                   <div className="custom-scrollbar" style={{ ...styles.summaryScroll, ...(summaryStacked ? { overflowY: "visible" } : {}) }}>
                   <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                     {uniqueCartItems.map(item => (
                       <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "12px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                         <div style={{ width: "48px", height: "48px", background: "rgba(var(--eco-c9-rgb), 0.1)", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                            <ProductImage src={item.image} alt={item.name} emoji={item.emoji} imgStyle={styles.thumbImg} fallbackSize="20px" />
                         </div>
                         <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000", lineHeight: 1.2 }}>{item.name}</span>
                           {/* The unit price, plus the product's real stock
                               label when it is running low. This line used to
                               read "Only N left in stock!" with N derived from
                               the product id — an invented number shown as
                               fact on every row, including in-stock ones. */}
                           <span style={{ fontSize: "11px", fontWeight: 700, marginTop: "2px", color: isLowStock(item) ? "var(--eco-c13)" : "rgba(0,0,0,0.5)" }}>
                             {isLowStock(item) ? `${item.stock} · ` : ""}₱{Number(item.price).toFixed(2)} each
                           </span>
                           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                             <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.05)", borderRadius: "6px", overflow: "hidden" }}>
                               <button type="button" style={{ background: "transparent", border: "none", padding: "4px 8px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQuantity(item.id, -1)}><FaMinus size={8} /></button>
                               <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "16px", textAlign: "center", color: "#000" }}>{item.quantity}</span>
                               <button type="button" style={{ background: "transparent", border: "none", padding: "4px 8px", cursor: "pointer", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQuantity(item.id, 1)}><FaPlus size={8} /></button>
                             </div>
                             <button type="button" style={{ background: "rgba(var(--eco-c9-rgb), 0.1)", border: "none", borderRadius: "6px", padding: "4px 8px", color: "var(--eco-c13)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => removeFromCart(item.id)}><FaTrash size={10} /></button>
                           </div>
                         </div>
                         <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--eco-c13)" }}>
                           ₱{(item.price * item.quantity).toFixed(2)}
                         </div>
                       </div>
                     ))}
                     {uniqueCartItems.length === 0 && (
                        <div style={{ textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "13px", padding: "24px 0", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>Your cart is empty.</div>
                     )}
                   </div>
                   
                   {/* Promo Code Input */}
                   <div style={{ ...styles.promoWrap, ...(promoError ? { border: '1px solid var(--eco-c7)', background: 'rgba(var(--eco-c7-rgb), 0.05)' } : promoSuccess ? { border: '1px solid var(--eco-c9)', background: 'rgba(var(--eco-c9-rgb), 0.05)', boxShadow: '0 0 15px rgba(var(--eco-c7-rgb), 0.2)' } : {}) }} className={`${promoError ? "animate-shakeError" : ""} ${promoSuccess ? "highlight-flash" : ""}`}>
                      <FaTag style={{color: promoError ? 'var(--eco-c13)' : promoSuccess ? 'var(--eco-c13)' : 'rgba(0,0,0,0.3)', marginLeft: '12px'}} />
                      <input 
                        value={promoCode} 
                        onChange={e => { setPromoCode(e.target.value); if (promoError) setPromoError(false); if (promoSuccess) setPromoSuccess(false); }} 
                        placeholder="Promo code (e.g. GREEN10)" 
                        style={{ ...styles.promoInput, color: promoError ? 'var(--eco-c13)' : promoSuccess ? 'var(--eco-c13)' : '#000' }} 
                      />
                      <button onClick={handleApplyPromo} style={{ ...styles.promoBtn, background: promoError ? 'var(--eco-c7)' : promoSuccess ? 'var(--eco-c9)' : 'var(--eco-c11)' }}>{promoSuccess ? 'Applied' : 'Apply'}</button>
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
                       <div className="animate-slideInDiscount" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--eco-c13)", fontWeight: 700 }}>
                         <span>Discount</span>
                         <span>-₱{discount.toFixed(2)}</span>
                       </div>
                     )}
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800, color: "#000", marginTop: "8px", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "16px" }}>
                       <span>Total Amount</span>
                       <span style={{ color: "var(--eco-c13)" }}>₱{totalAmount.toFixed(2)}</span>
                     </div>
                     
                     {/* Reward Points */}
                     <div style={styles.rewardsBox}>
                        <FaGift style={{color: 'var(--eco-c13)'}} />
                        <span>You'll earn <strong 
                          style={{ color: 'var(--eco-c13)', cursor: 'help', position: 'relative', borderBottom: '1px dotted var(--eco-c11)' }}
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

                   {/* AI Recommendations */}
                   {recommendations.length > 0 && (
                     <div style={styles.recommendationsWrap}>
                        <h4 style={styles.recTitle}>Recommended For Your Garden</h4>
                        <div style={styles.recGrid}>
                           {recommendations.map(p => (
                              <div key={p.id} style={styles.recCard}>
                                 <div style={{ width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", background: "rgba(var(--eco-c9-rgb), 0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ProductImage src={p.image} alt={p.name} emoji={p.emoji} imgStyle={styles.thumbImg} fallbackSize="24px" />
                                 </div>
                                 <div style={{flex: 1}}>
                                   <div style={styles.recName}>{p.name}</div>
                                   <div style={styles.recPrice}>₱{p.price}</div>
                                 </div>
                                 <button onClick={() => updateQuantity(p.id, 1)} style={styles.recAddBtn}><FaPlus size={10}/></button>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}

                   </div>

                   {/* Phones get these two actions from the fixed bar at the
                       foot of the screen instead — repeating them here would
                       put the same button on screen twice. */}
                   {!isMobile && (
                     <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingTop: "18px" }}>
                       <button
                         onClick={handlePlaceOrder}
                         style={{ ...styles.buyNowBtn, padding: "16px", fontSize: "16px", borderRadius: "999px", opacity: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? 0.5 : 1, pointerEvents: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? "none" : "auto", transition: "transform 0.2s ease" }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         Place Order
                       </button>
                       <button
                         style={{ ...styles.continueBtn, padding: "12px", fontSize: "14px", borderRadius: "999px" }}
                         onClick={() => { setCheckoutOpen(false); setCartOpen(true); }}
                       >
                         Back to Cart
                       </button>
                     </div>
                   )}

                   <div style={{textAlign: 'center', fontSize: '11px', color: 'rgba(0,0,0,0.5)', fontWeight: 600, marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      <FaSeedling color="var(--eco-c9)" /> This purchase helps support local farmers.
                   </div>
                 </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={styles.trustBadgeRow}>
              <TrustBadge icon={<FaLock color="var(--eco-c9)" size={14} />} title="SSL Secured" desc="100% Encrypted" />
              <TrustBadge icon={<FaShieldAlt color="var(--eco-c9)" size={14} />} title="Verified Payment" desc="Safe Checkout" />
              <TrustBadge icon={<FaTruck color="var(--eco-c9)" size={14} />} title="Fast Delivery" desc="Nationwide" />
              <TrustBadge icon={<FaBoxOpen color="var(--eco-c9)" size={14} />} title="Eco-Packaging" desc="Sustainable" />
            </div>

            </div>
            </div>

            {/* Phone action bar. On a phone the summary sits under three
                sections of form, so the button that ends the flow was a full
                screen of scrolling away from the last field. */}
            {isMobile && (
              <div style={styles.checkoutMobileBar}>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--eco-c13)" }}>₱{totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  style={{ ...styles.buyNowBtn, flex: 1, padding: "14px", fontSize: "15px", borderRadius: "999px", opacity: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? 0.5 : 1, pointerEvents: (uniqueCartItems.length === 0 || !isFormValid || !isPaymentValid()) ? "none" : "auto" }}
                >
                  Place Order
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccess && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowSuccess(false)}>
          <div className="inner-blur-glass" style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            {/* Checkout Progress Stepper */}
            <div style={{ ...styles.stepperWrap, marginBottom: "32px", marginTop: "-8px" }}>
              {['Cart', 'Delivery & Payment', 'Confirmation'].map((step, idx) => (
                 <div key={step} style={{...styles.step, flex: idx < 2 ? 1 : "none"}}>
                   <div style={{...styles.stepDot, ...styles.stepDotActive}}>{idx < 2 ? <Check size={14} /> : idx + 1}</div>
                   <span style={{...styles.stepText, ...styles.stepTextActive}}>{step}</span>
                   {idx < 2 && (
                     <div style={styles.stepLineTrack}>
                       <div style={{ ...styles.stepLineFill, ...(idx === 0 ? styles.stepLineFillCompleted : styles.stepLineFillActive) }} />
                     </div>
                   )}
                 </div>
              ))}
            </div>

            <FaCheckCircle style={{ color: "var(--eco-c13)", fontSize: "64px", marginBottom: "16px" }} />
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
                 style={{ ...styles.buyNowBtn, flex: 1, padding: "14px", fontSize: "14px" }}
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
          setCheckoutOpen={setCheckoutOpen}
          onAddReview={handleAddReview}
        />
      )}
    </div>
  );
}

const FloatingIcon = ({ anim }) => {
  const [style, setStyle] = useState({
    position: 'fixed',
    left: anim.startX,
    top: anim.startY,
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    fontSize: '24px',
    zIndex: 9999,
    pointerEvents: 'none',
    textShadow: '0 4px 12px rgba(0,0,0,0.2)'
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStyle(prev => ({ ...prev, left: anim.endX, top: anim.endY, transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 }));
      });
    });
  }, [anim]);

  return <div style={style}>{anim.type === 'cart' ? <ShoppingCart size={20} color="var(--eco-c9)" /> : <Heart size={20} fill="var(--eco-c9)" color="var(--eco-c9)" />}</div>;
};

const InputField = ({ label, placeholder, value, onChange, onBlur, error, full = false }) => {
  // Focus is inline state, like every other interactive style in this file —
  // there is no stylesheet here to carry a :focus rule.
  const [focused, setFocused] = useState(false);
  return (
    // `full` is "1 / -1" rather than a span count so it stays one whole row at
    // one, two or three columns without forcing extra tracks into the grid.
    <div style={{ ...styles.inputWrap, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <label style={{ ...styles.inputLabel, color: error ? 'var(--eco-c13)' : 'rgba(0,0,0,0.55)' }}>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
        style={{ ...styles.inputField, ...(focused && !error ? styles.inputFieldFocus : {}), ...(error ? styles.inputFieldError : {}) }}
      />
      {typeof error === 'string' && <span style={styles.errorText}>{error}</span>}
    </div>
  );
};

// Renders a real product photo, falling back to the product's icon/emoji if the
// image is missing or fails to load.
const ProductImage = ({ src, alt, emoji, imgStyle, fallbackSize = "36px", fallbackWrapStyle }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <span style={{ fontSize: fallbackSize, display: "flex", alignItems: "center", justifyContent: "center", ...fallbackWrapStyle }}>
        {emoji || <Sprout size="1em" color="var(--eco-c9)" />}
      </span>
    );
  }
  return <img src={src} alt={alt || ""} loading="lazy" style={imgStyle} onError={() => setErrored(true)} />;
};

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
    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>{price}</div>
  </button>
);

const TrustBadge = ({ icon, title, desc }) => (
  <div style={styles.trustBadge}>
    <div style={styles.trustBadgeIconWrap}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <h4 style={{ margin: 0, fontSize: "12.5px", fontWeight: 800, color: "rgba(0,0,0,0.75)" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.42)" }}>{desc}</p>
    </div>
  </div>
);

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "left", // Adjusted for the marketplace layout
    padding: "24px 16px 40px",
    maxWidth: "1200px", // Expanded for sidebar + grid
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "16px 12px 30px",
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
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--eco-c6)",
    boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)",
    display: "inline-block",
  },
  title: {
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 auto 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
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
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
  shopLayout: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    gap: "24px",
  },
  shopLayoutMobile: {
    flexDirection: "column",
    gap: "16px",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    borderRadius: "20px",
    padding: "24px 20px",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.04)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  sidebarTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "16px",
    marginTop: "0",
    color: "#000",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  catBtn: {
    background: "transparent",
    border: "1px solid transparent",
    textAlign: "left",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.7)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  catBtnActive: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.4)",
    color: "var(--eco-c15)",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },
  catBtnHover: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))",
    color: "var(--eco-c15)",
    boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)",
  },
  mainArea: {
    flex: 1,
    width: "100%",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "16px",
  },
  toolbarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  searchSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  searchSectionMobile: {
    width: "100%",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    maxWidth: "360px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(0,0,0,0.4)",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    backdropFilter: "blur(10px)",
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
    background: "var(--eco-c9)",
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
  filtersWrap: {
    display: "flex",
    gap: "12px",
  },
  sortSelect: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.6)",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    backdropFilter: "blur(10px)",
  },
  customSortSelect: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.3)",
    background: "rgba(255, 255, 255, 0.7)",
    fontSize: "13.5px",
    fontWeight: 600,
    color: "#000",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.05)",
    outline: "none",
    textAlign: "left"
  },
  customSortSelectActive: {
    borderColor: "var(--eco-c9)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c7-rgb), 0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
    background: "rgba(255, 255, 255, 0.95)",
  },
  customSortSelectHover: {
    background: "rgba(255, 255, 255, 0.9)",
  },
  sortByDropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.2)",
    padding: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    maxHeight: "240px",
    overflowY: "auto",
  },
  sortByDropdownItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "#000",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
  },
  sortByDropdownItemActive: {
    background: "rgba(var(--eco-c7-rgb), 0.12)",
    color: "var(--eco-c13)",
    fontWeight: 700,
  },
  sortByDropdownItemHover: {
    background: "rgba(var(--eco-c7-rgb), 0.08)",
    color: "var(--eco-c13)",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  productGridMobile: {
    gridTemplateColumns: "repeat(auto-fill, minmax(136px, 1fr))",
    gap: "9px",
  },
  productCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.04)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  },
  productCardMobile: {
    padding: "9px",
    gap: "7px",
    borderRadius: "12px",
  },
  productCardHov: {
    transform: "translateY(-4px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 28px rgba(0,0,0,0.08)",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "160px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  imageContainerMobile: {
    height: "108px",
    borderRadius: "8px",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    background: "rgba(var(--eco-c9-rgb), 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  badgeLabel: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c6-rgb), 0.95))",
    color: "var(--eco-c19)",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  badgeLabelMobile: {
    top: "7px",
    left: "7px",
    padding: "3px 7px",
    fontSize: "8px",
    letterSpacing: "0.3px",
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
  saveBtnMobile: {
    top: "7px",
    right: "7px",
    width: "25px",
    height: "25px",
    fontSize: "14px",
  },
  saveBtnActive: {
    color: "var(--eco-c13)", // red
    background: "#fff",
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  productInfoMobile: {
    gap: "2px",
  },
  productCat: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  productCatMobile: {
    fontSize: "8px",
    letterSpacing: "0.35px",
    lineHeight: 1.1,
  },
  productName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  productNameMobile: {
    fontSize: "12px",
    lineHeight: 1.15,
    minHeight: "28px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  productPrice: {
    fontSize: "14px",
    fontWeight: 800,
    color: "var(--eco-c13)",
    marginTop: "2px",
  },
  productPriceMobile: {
    fontSize: "12px",
    marginTop: "0",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  actionButtonsMobile: {
    gap: "5px",
  },
  addToCartBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: "8px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
    color: "var(--eco-c13)",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  buyNowBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: "8px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "var(--eco-c19)",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.15)",
  },
  productActionBtnMobile: {
    padding: "6px 0",
    borderRadius: "7px",
    fontSize: "9px",
    lineHeight: 1,
    minHeight: "25px",
    whiteSpace: "nowrap",
  },
  emptyState: {
    gridColumn: "1 / -1",
    padding: "40px",
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
    fontSize: "15px",
  },
  modalOverlay: modalOverlay(MODAL_LAYER.base),
  confirmOverlay: nestedConfirmOverlay(),
  cartModal: {
    maxWidth: "500px",
    width: "100%",
    maxHeight: "85vh",
    background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(var(--eco-c0-rgb), 0.8))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
  },
  cartModalMobile: {
    padding: "24px 16px",
    maxHeight: "90vh",
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
  modalTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#000",
    textAlign: "center",
    margin: "0 0 20px",
    letterSpacing: "-0.5px",
    position: "relative",
    zIndex: 1,
  },
  cartItemsContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingRight: "4px",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },
  emptyCartText: {
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
    fontSize: "15px",
    marginTop: "20px",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "12px",
  },
  cartItemImgWrap: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cartItemDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  cartItemName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
  },
  cartItemPrice: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--eco-c13)",
  },
  cartItemActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "4px",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    background: "rgba(0,0,0,0.05)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  qtyBtn: {
    background: "transparent",
    border: "none",
    padding: "6px 8px",
    cursor: "pointer",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: "13px",
    fontWeight: 600,
    minWidth: "20px",
    textAlign: "center",
    color: "#000",
  },
  removeBtn: {
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    border: "none",
    borderRadius: "8px",
    padding: "6px 8px",
    color: "var(--eco-c13)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemSubtotal: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#000",
  },
  cartFooter: {
    borderTop: "1px solid rgba(0,0,0,0.1)",
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },
  cartTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
  },
  cartTotalAmount: {
    fontSize: "20px",
    fontWeight: 800,
    color: "var(--eco-c13)",
  },
  cartFooterBtns: {
    display: "flex",
    gap: "12px",
  },
  continueBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "#000",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  checkoutBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "var(--eco-c19)",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
  },
  /* Full-screen surface, not a card: no frame, radius or drop shadow, and it
     fills the viewport on every breakpoint the way the Settings shell does.
     It is an app shell — a header that stays put, a body that scrolls — so
     the padding lives on the scroller, not here. */
  checkoutModal: {
    maxWidth: "none",
    width: "100%",
    height: "100%",
    maxHeight: "none",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))",
    border: "none",
    borderRadius: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    boxShadow: "none",
    position: "relative",
    animation: "fadeIn 0.25s ease",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  checkoutModalMobile: {
    height: "100%",
    width: "100%",
    maxWidth: "none",
    borderRadius: 0,
  },
  checkoutHeader: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px clamp(16px, 4vw, 40px)",
    /* Opaque, not glass: the form scrolls underneath it, and a translucent
       bar would let field labels smear through the title. */
    background: "linear-gradient(180deg, #ffffff, rgba(var(--eco-c0-rgb), 0.97))",
    borderBottom: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 1px 12px rgba(0,0,0,0.03)",
    zIndex: 5,
  },
  checkoutHeaderMobile: {
    padding: "10px 14px",
    gap: "10px",
  },
  checkoutHeaderSide: {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    /* Clips instead of colliding: the title is nowrap, so without this it ran
       straight over the stepper once the bar got tight. */
    overflow: "hidden",
  },
  checkoutHeaderTitleWrap: {
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  checkoutHeaderTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    color: "#000",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  checkoutHeaderSub: {
    margin: 0,
    fontSize: "11.5px",
    fontWeight: 650,
    color: "rgba(0,0,0,0.48)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  checkoutBackBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.08)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
    color: "var(--eco-c14)",
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.2s ease",
  },
  checkoutCloseBtn: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.05)",
    border: "none",
    color: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  secureChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.08)",
    color: "var(--eco-c14)",
    fontSize: "11.5px",
    fontWeight: 700,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
  },
  checkoutScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "26px clamp(20px, 4vw, 48px) 40px",
    boxSizing: "border-box",
  },
  checkoutScrollMobile: {
    padding: "16px 14px 28px",
  },
  checkoutContent: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  checkoutGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    width: "100%",
    alignItems: "flex-start",
  },
  /* 460px basis, not 520: with the summary's 340 and the 20px gap, a wider
     basis wrapped the rail under the form at ~950px — a width where the two
     columns still fit — and `summaryStacked` had not kicked in to widen it. */
  checkoutLeft: {
    flex: "1 1 460px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  /* Capped, not free-growing: on a full-screen panel a summary that tracks the
     form column ends up ~600px wide, which strands each amount half a screen
     from its label. The form takes the extra width instead. */
  checkoutRight: {
    flex: "1 1 340px",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    /* Sticks just under the header, and caps its own height so the Place
       Order button stays on screen however long the cart is. */
    top: "0px",
    maxHeight: "calc(100vh - 118px)",
    alignSelf: "flex-start",
  },
  checkoutRightMobile: {
    position: "static",
    maxWidth: "none",
    maxHeight: "none",
  },
  checkoutSection: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 18px rgba(0,0,0,0.035)",
  },
  summaryCard: {
    background: "rgba(255,255,255,0.88)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 34px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  summaryScroll: {
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "6px",
    marginRight: "-6px",
  },
  summaryCountPill: {
    marginLeft: "auto",
    minWidth: "24px",
    height: "24px",
    padding: "0 8px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    color: "var(--eco-c14)",
    fontSize: "12px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutSectionTitle: {
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "-0.2px",
    color: "#000",
    marginBottom: "16px",
    marginTop: "0",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  checkoutSectionNumber: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "var(--eco-c11)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(var(--eco-c7-rgb), 0.32)",
  },
  checkoutMobileBar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 14px calc(12px + env(safe-area-inset-bottom))",
    background: "linear-gradient(180deg, rgba(255,255,255,0.97), #ffffff)",
    borderTop: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 -2px 16px rgba(0,0,0,0.05)",
  },
  /* 240px tracks, not 200: on a full-screen panel the narrower track fitted
     four fields to a row, which put "Delivery Address" in the same width as
     "ZIP" and made the form read as a spreadsheet. */
  checkoutFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px 18px",
  },
  /* Right-aligned note in a section header — supporting detail that belongs
     with the heading, not a banner of its own. */
  sectionMetaChip: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.09)",
    color: "var(--eco-c14)",
    fontSize: "11.5px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  /* Two up, not auto-fit: there are four methods, and a three-across track
     left the fourth stranded alone on its own row. */
  checkoutPaymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "100%",
  },
  inputLabel: {
    fontSize: "10.5px",
    fontWeight: 800,
    color: "rgba(0,0,0,0.55)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginLeft: "2px",
  },
  inputField: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.09)",
    background: "#fff",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "#000",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    fontFamily: "inherit",
  },
  inputFieldFocus: {
    /* Full `border` shorthand, not `borderColor`: the base style sets the
       shorthand, and React warns when a rerender mixes the two forms. */
    border: "1px solid var(--eco-c9)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c7-rgb), 0.18)",
  },
  inputFieldError: {
    border: "1px solid var(--eco-c7)",
    background: "rgba(var(--eco-c7-rgb), 0.05)",
  },
  stepperWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto 32px",
    position: "relative",
  },
  /* Header variant: shrinkable, centred between the title and the exit
     controls, with its labels beside the dots rather than under them. */
  headerStepper: {
    flex: "0 1 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  headerStep: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  headerStepText: {
    fontSize: "12.5px",
    fontWeight: 650,
    color: "rgba(0,0,0,0.42)",
    whiteSpace: "nowrap",
  },
  /* The connector between two step dots. These four keys were referenced by
     both steppers but never defined, so every connector rendered unstyled —
     a zero-height, zero-width div — and the dots floated unjoined. */
  stepLineTrack: {
    /* Grows to fill in the success modal, where each step is a flex:1 column;
       falls back to its own width in the header, where it is not. */
    flex: "1 1 auto",
    width: "clamp(24px, 6vw, 64px)",
    minWidth: "16px",
    height: "3px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  stepLineFill: {
    width: "0%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c11))",
    transition: "width 0.4s ease",
  },
  stepLineFillActive: {
    width: "100%",
  },
  stepLineFillCompleted: {
    width: "100%",
    background: "linear-gradient(90deg, var(--eco-c11), var(--eco-c13))",
  },
  step: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  stepDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.05)",
    color: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    zIndex: 2,
    border: "2px solid #fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  stepDotActive: {
    background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(var(--eco-c11-rgb), 0.3)",
  },
  stepText: {
    position: "absolute",
    top: "36px",
    left: "14px",
    transform: "translateX(-50%)",
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    whiteSpace: "nowrap",
  },
  stepTextActive: {
    color: "var(--eco-c13)",
    fontWeight: 800,
  },
  stepLine: {
    flex: 1,
    height: "4px",
    background: "rgba(0,0,0,0.05)",
    margin: "0 4px",
    borderRadius: "999px",
    position: "relative",
    zIndex: 1,
  },
  stepLineActive: {
    background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c5))",
  },
  ecoOptionsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  /* Each option is a tappable row, not a bare checkbox on the card ground —
     it gives the label a hit area and matches the payment/delivery cards. */
  ecoOptionRow: {
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.18)",
    background: "rgba(var(--eco-c9-rgb), 0.05)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.8)",
    cursor: "pointer",
  },
  checkboxInput: {
    width: "18px",
    height: "18px",
    accentColor: "var(--eco-c9)",
    cursor: "pointer",
  },
  promoWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "14px",
    marginTop: "8px",
    overflow: "hidden",
  },
  promoInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 500,
    outline: "none",
    color: "#000",
  },
  promoBtn: {
    background: "var(--eco-c11)",
    color: "#fff",
    border: "none",
    padding: "0 16px",
    height: "100%",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  rewardsBox: {
    background: "rgba(var(--eco-c6-rgb), 0.15)",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.3)",
    borderRadius: "12px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--eco-c13)",
    marginTop: "4px",
  },
  ecoTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: "10px",
    background: "var(--eco-c19)",
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
    borderColor: "var(--eco-c19) transparent transparent transparent",
  },
  recommendationsWrap: {
    marginTop: "16px",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    paddingTop: "16px",
  },
  recTitle: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#000",
    margin: "0 0 10px",
  },
  /* One per row. Two 150px cards in the summary rail left the product name
     three words tall next to a 40px thumbnail. */
  recGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  recCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "12px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    transition: "transform 0.2s",
  },
  recName: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#000",
    lineHeight: 1.2,
    marginBottom: "2px",
  },
  recPrice: {
    fontSize: "11px",
    fontWeight: 800,
    color: "var(--eco-c13)",
  },
  recAddBtn: {
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    color: "var(--eco-c13)",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  paymentCard: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.09)",
    background: "#fff",
    cursor: "pointer",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.025)",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  paymentCardActive: {
    background: "rgba(var(--eco-c9-rgb), 0.07)",
    border: "1px solid var(--eco-c9)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c7-rgb), 0.16)",
  },
  paymentRadio: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "rgba(255,255,255,0.5)",
  },
  paymentRadioActive: {
    borderColor: "var(--eco-c9)",
    background: "#fff",
  },
  paymentRadioInner: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "var(--eco-c9)",
  },
  paymentDetailsWrap: {
    marginTop: "16px",
    animation: "fadeIn 0.3s ease",
  },
  paymentInfoBox: {
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
    borderRadius: "12px",
    padding: "16px",
    color: "var(--eco-c13)",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paymentDetailsCard: {
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  paymentInstructions: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
  },
  qrPlaceholder: {
    width: "100%",
    height: "100px",
    background: "rgba(0,0,0,0.03)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(0,0,0,0.15)",
    color: "rgba(0,0,0,0.5)",
    gap: "4px",
  },
  uploadProofWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  uploadProofBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    background: "rgba(0,0,0,0.05)",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  uploadSuccess: {
    fontSize: "12px",
    color: "var(--eco-c13)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "150px",
  },
  /* A quiet footer strip, not four more cards. Below three stacked panels of
     form, boxed badges read as another section to fill in. */
  trustBadgeRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  trustBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 4px",
    background: "transparent",
    border: "none",
  },
  trustBadgeIconWrap: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successModal: {
    maxWidth: "460px",
    width: "90%",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "32px",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    boxSizing: "border-box"
  },
};

export default ShopAllProducts;
