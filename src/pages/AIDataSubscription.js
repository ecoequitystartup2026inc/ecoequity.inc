import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaCheckCircle, FaStar, FaRobot, FaTimes, FaCreditCard, FaQrcode, FaChevronDown } from "react-icons/fa";

function AIDataSubscription({ setActiveNav, isAdmin = false, promoCodes }) {
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('Plans & Pricing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [formData, setFormData] = useState({ name: "Juan Dela Cruz", email: "juan.delacruz@example.com", phone: "0912 345 6789", orgType: "Individual", billingCycle: "Monthly", paymentMethod: "Credit Card", promoCode: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", refNumber: "" });
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const [subscriptionHistory, setSubscriptionHistory] = useState([
    { id: 'SUB-001', plan: 'Basic', status: 'Active', date: '2023-01-15', nextBilling: 'N/A' }
  ]);
  const [enterpriseRequests, setEnterpriseRequests] = useState([
    { id: 'REQ-001', name: 'Acme Corp', email: 'contact@acme.com', status: 'Pending' }
  ]);

  const comparisonFeatures = [
    { feature: "AI Plant Diagnostics", basic: "Basic", pro: "Advanced", enterprise: "Custom" },
    { feature: "Weather Alerts", basic: "Local", pro: "Smart / Predictive", enterprise: "Regional API" },
    { feature: "Support", basic: "Community", pro: "Priority Email", enterprise: "1-on-1 Dedicated" },
    { feature: "Surplus Module", basic: "View Only", pro: "List up to 10", enterprise: "Unlimited" },
    { feature: "Free Trial", basic: "N/A", pro: "14 Days", enterprise: "30 Days" },
  ];

  const handlePlanClick = (plan) => {
    setSelectedPlanDetails(plan);
    setIsModalOpen(true);
    setFormData(prev => ({ ...prev, billingCycle: isYearly ? "Yearly" : "Monthly" }));
    setMessage(null);
    setTouched({});
    setDiscountAmount(0);
    setPromoSuccess(false);
    setPromoError(false);
  };

  const handleApplyPromo = () => {
    const code = formData.promoCode.toUpperCase().trim();
    if (code === "") {
      setDiscountAmount(0); setPromoError(false); setPromoSuccess(false); return;
    }
    const promo = (promoCodes || []).find(p => p.code.toUpperCase() === code);
    if (promo) {
      let rawPrice = isYearly ? selectedPlanDetails.priceYearly : selectedPlanDetails.priceMonthly;
      let numPrice = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;
      let discAmount = 0;
      if (promo.type === "percent") discAmount = numPrice * (promo.value / 100);
      else if (promo.type === "fixed") discAmount = parseFloat(promo.value) || 0;
      
      setDiscountAmount(discAmount);
      setPromoError(false); setPromoSuccess(true);
    } else {
      setDiscountAmount(0); setPromoError(true); setPromoSuccess(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (selectedPlanDetails.name === 'Pro') {
      if (formData.paymentMethod === 'Credit Card') {
        if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
          setMessage({ type: 'error', text: 'Please fill all credit card details.' });
          return;
        }
        const isNumValid = /^[\d\s-]{15,19}$/.test(formData.cardNumber.trim());
        const isExpValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry.trim());
        const isCvvValid = /^\d{3,4}$/.test(formData.cardCvv.trim());
        if (!isNumValid || !isExpValid || !isCvvValid) {
          setMessage({ type: 'error', text: 'Please enter valid credit card details (e.g., 16-digit number, MM/YY expiry).' });
          return;
        }
      } else if (formData.paymentMethod === 'GCash' || formData.paymentMethod === 'Maya') {
        if (!formData.refNumber) {
          setMessage({ type: 'error', text: 'Please enter the transaction reference number.' });
          return;
        }
      }
    }

    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      if (selectedPlanDetails.name === 'Basic') {
        setSubscriptionHistory([{ id: 'SUB-' + Math.floor(Math.random()*10000), plan: 'Basic', status: 'Active', date: new Date().toLocaleDateString(), nextBilling: 'N/A' }, ...subscriptionHistory]);
      } else if (selectedPlanDetails.name === 'Enterprise') {
        setEnterpriseRequests([{ id: 'REQ-' + Math.floor(Math.random()*10000), name: formData.name, email: formData.email, status: 'Pending' }, ...enterpriseRequests]);
      } else {
        setSubscriptionHistory([{ id: 'SUB-' + Math.floor(Math.random()*10000), plan: 'Pro', status: 'Active', date: new Date().toLocaleDateString(), nextBilling: isYearly ? 'Next Year' : 'Next Month' }, ...subscriptionHistory]);
      }
      setIsModalOpen(false);
      setShowPaymentSuccess(true);
    }, 1500);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, billingCycle: isYearly ? "Yearly" : "Monthly" }));
  }, [isYearly]);

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
  
  const getError = (field) => {
    if (!touched[field]) return null;
    const val = formData[field] ? String(formData[field]).trim() : "";
    if (val === "") return "This field is required.";

    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email.";
    if (field === "cardNumber" && !/^[\d\s-]{15,19}$/.test(val)) return "Invalid card number.";
    if (field === "cardExpiry" && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(val)) return "Invalid expiry date (MM/YY).";
    if (field === "cardCvv" && !/^\d{3,4}$/.test(val)) return "Invalid CVV.";
    return null;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    let formattedValue = value;
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.indexOf('+') > 0) {
      cleaned = cleaned.replace(/\+/g, '');
      if (value.startsWith('+')) cleaned = '+' + cleaned;
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(0, 11);
      if (cleaned.length > 7) formattedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      else if (cleaned.length > 4) formattedValue = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
      else formattedValue = cleaned;
    } else if (cleaned.startsWith('+63')) {
      cleaned = cleaned.substring(0, 13);
      if (cleaned.length > 8) formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
      else if (cleaned.length > 6) formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      else if (cleaned.length > 3) formattedValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      else formattedValue = cleaned;
    } else formattedValue = cleaned.substring(0, 15);
    
    setFormData({ ...formData, phone: formattedValue });
  };

  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 19);
    const formatted = v.match(/.{1,4}/g)?.join(' ') || "";
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleCardExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    // Auto-prefix '0' for months 2-9
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

  const calculateTotal = () => {
    if (selectedPlanDetails.name === 'Enterprise') return 'Custom';
    let rawPrice = isYearly ? selectedPlanDetails.priceYearly : selectedPlanDetails.priceMonthly;
    let numPrice = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;
    let total = Math.max(0, numPrice - discountAmount);
    return `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

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
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes blurIn {
            from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes spinFade {
            0% { transform: rotate(0deg); opacity: 1; }
            50% { opacity: 0.5; }
            100% { transform: rotate(360deg); opacity: 1; }
        }
        .ring-spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(6, 32, 24, 0.3);
            border-radius: 50%;
            border-top-color: #062018;
            animation: spinFade 1s linear infinite;
        }
        @keyframes checkmarkPop {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes successDraw {
            0% { stroke-dasharray: 50; stroke-dashoffset: 50; }
            100% { stroke-dasharray: 50; stroke-dashoffset: 0; }
        }
        @keyframes pulseBadge {
            0% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }
            50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 6px 16px rgba(234, 179, 8, 0.5); }
            100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }
        }
      `}</style>
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
          <span>Pricing Plans</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Unlock AI-Powered <span style={styles.accent}>Agriculture</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Scale your farming with predictive diagnostics, localized weather alerts, and actionable crop analytics. Choose the plan that fits your growth.
      </p>

      <div style={styles.tabContainer}>
        {['Plans & Pricing', 'My Subscriptions', ...(isAdmin ? ['Admin Panel'] : [])].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab ? styles.activeTabBtn : {})
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Plans & Pricing' && (
        <>
      {/* Toggle switch for Monthly / Yearly */}
      <div style={styles.toggleContainer}>
        <span style={{ ...styles.toggleLabel, fontWeight: !isYearly ? 700 : 500, color: !isYearly ? "#15803d" : "rgba(0,0,0,0.6)" }}>Monthly</span>
        <div 
          style={styles.toggleTrack}
          onClick={() => setIsYearly(!isYearly)}
        >
          <div style={{ ...styles.toggleThumb, transform: isYearly ? "translateX(24px)" : "translateX(0)" }} />
        </div>
        <span style={{ ...styles.toggleLabel, fontWeight: isYearly ? 700 : 500, color: isYearly ? "#15803d" : "rgba(0,0,0,0.6)" }}>
          Yearly <span style={styles.discountBadge}>Save 20%</span>
        </span>
      </div>

      {/* Pricing Cards */}
            <div className="slim-scroll" style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? "none" : "repeat(3, 1fr)", gap: "16px", overflowX: isMobile ? "auto" : "visible", scrollSnapType: isMobile ? "x mandatory" : "none", paddingBottom: isMobile ? "8px" : "0", width: "100%", maxWidth: "900px", margin: "0 auto 40px" }}>
              {/* Basic Plan */}
              <div style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "24px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.08)", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", transition: "all 0.2s ease", boxShadow: "0 12px 24px rgba(0,0,0,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.04)"; }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#000" }}>Basic</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For casual gardeners and beginners.</p>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  Free
                </div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", marginBottom: "20px", fontWeight: 500 }}>Forever</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#16a34a", fontSize: "14px" }}>✓</span> General AI Chat</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#16a34a", fontSize: "14px" }}>✓</span> Community Access</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "14px" }}>✗</span> 24/7 Plant Doctor</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "14px" }}>✗</span> Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "14px" }}>✗</span> Priority Support</li>
                </ul>
                <button disabled style={{ width: "100%", padding: "12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 700, fontSize: "14px", cursor: "not-allowed", transition: "all 0.2s ease", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", opacity: 0.7 }}>Current Plan</button>
              </div>

              {/* Pro Plan */}
              <div style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "24px", borderRadius: "20px", border: "2px solid #eab308", background: "linear-gradient(145deg, rgba(234,179,8,0.05), rgba(255,255,255,1))", display: "flex", flexDirection: "column", position: "relative", transition: "all 0.2s ease", boxShadow: "0 8px 16px rgba(234, 179, 8, 0.15)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = "0 16px 32px rgba(234, 179, 8, 0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = "0 8px 16px rgba(234, 179, 8, 0.15)"; }}>
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "#ffffff", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)", animation: "pulseBadge 2s infinite ease-in-out" }}>Most Popular</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#ca8a04" }}>Pro</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)", lineHeight: 1.4 }}>For serious growers & urban farmers.</p>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {isYearly ? '₱4,790' : '₱499'}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", marginBottom: "20px", fontWeight: 500 }}>
                  per {isYearly ? 'year, billed annually' : 'month'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "14px" }}>✓</span> Unlimited AI Chat</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "14px" }}>✓</span> 24/7 AI Plant Doctor</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "14px" }}>✓</span> Advanced Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "14px" }}>✓</span> Priority Support</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "14px" }}>✗</span> API Access</li>
                </ul>
                <button onClick={() => handlePlanClick({name: 'Pro', priceMonthly: '₱499', priceYearly: '₱4,790'})} style={{ width: "100%", padding: "12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, #facc15, #ca8a04)", color: "#ffffff", fontWeight: 800, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(202,138,4,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(202,138,4,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(202,138,4,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>Subscribe Now</button>
              </div>

              {/* Enterprise Plan */}
              <div style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "24px", borderRadius: "20px", border: "1px solid #0ea5e9", background: "rgba(14, 165, 233, 0.02)", display: "flex", flexDirection: "column", position: "relative", transition: "all 0.2s ease", boxShadow: "0 0 0 1px rgba(14, 165, 233, 0.1), 0 12px 24px rgba(0,0,0,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(14, 165, 233, 0.1), 0 16px 32px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(14, 165, 233, 0.1), 0 12px 24px rgba(0,0,0,0.04)"; }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#0284c7" }}>Enterprise</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For commercial farms & businesses.</p>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {isYearly ? '₱14,390' : '₱1,499'}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", marginBottom: "20px", fontWeight: 500 }}>
                  per {isYearly ? 'year, billed annually' : 'month'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "14px" }}>✓</span> Everything in Pro</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "14px" }}>✓</span> Dedicated Human Agent</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "14px" }}>✓</span> 24/7 VIP Phone Support</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "14px" }}>✓</span> Custom API Access</li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "14px" }}>✓</span> Team Analytics Dashboard</li>
                </ul>
                <button onClick={() => handlePlanClick({name: 'Enterprise', priceMonthly: '₱1,499', priceYearly: '₱14,390'})} style={{ width: "100%", padding: "12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#ffffff", fontWeight: 800, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(14,165,233,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(14,165,233,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>Contact Sales</button>
              </div>
            </div>

          <h2 style={styles.comparisonTitle}>Plan Comparison</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Basic</th>
                  <th style={styles.th}>Pro</th>
                  <th style={styles.th}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{f.feature}</td>
                    <td style={styles.td}>{f.basic}</td>
                    <td style={styles.td}>{f.pro}</td>
                    <td style={styles.td}>{f.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'My Subscriptions' && (
        <div style={styles.panelContainer}>
           <h2 style={styles.panelTitle}>Subscription History</h2>
           <div style={styles.tableWrapper}>
             <table style={styles.table}>
               <thead>
                 <tr>
                   <th style={styles.th}>ID</th>
                   <th style={styles.th}>Plan</th>
                   <th style={styles.th}>Status</th>
                   <th style={styles.th}>Started On</th>
                   <th style={styles.th}>Next Billing</th>
                   <th style={styles.th}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {subscriptionHistory.map((sub, i) => (
                   <tr key={i} style={styles.tr}>
                     <td style={styles.td}>{sub.id}</td>
                     <td style={styles.td}>{sub.plan}</td>
                     <td style={styles.td}>{sub.status}</td>
                     <td style={styles.td}>{sub.date}</td>
                     <td style={styles.td}>{sub.nextBilling}</td>
                     <td style={styles.td}>
                       <button style={styles.actionBtn}>Upgrade</button>
                       <button style={{...styles.actionBtn, color: '#ef4444'}}>Cancel</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {isAdmin && activeTab === 'Admin Panel' && (
        <div style={styles.panelContainer}>
           <h2 style={styles.panelTitle}>Enterprise Requests</h2>
           <div style={styles.tableWrapper}>
             <table style={styles.table}>
               <thead>
                 <tr>
                   <th style={styles.th}>Req ID</th>
                   <th style={styles.th}>Name</th>
                   <th style={styles.th}>Email</th>
                   <th style={styles.th}>Status</th>
                   <th style={styles.th}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {enterpriseRequests.map((req, i) => (
                   <tr key={i} style={styles.tr}>
                     <td style={styles.td}>{req.id}</td>
                     <td style={styles.td}>{req.name}</td>
                     <td style={styles.td}>{req.email}</td>
                     <td style={styles.td}>{req.status}</td>
                     <td style={styles.td}>
                       {req.status === 'Pending' ? (
                         <>
                           <button style={styles.actionBtn} onClick={() => {
                             const newReqs = [...enterpriseRequests];
                             newReqs[i].status = 'Approved';
                             setEnterpriseRequests(newReqs);
                           }}>Approve</button>
                           <button style={{...styles.actionBtn, color: '#ef4444'}} onClick={() => {
                             const newReqs = [...enterpriseRequests];
                             newReqs[i].status = 'Rejected';
                             setEnterpriseRequests(newReqs);
                           }}>Reject</button>
                         </>
                       ) : (
                         <span>-</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

{isModalOpen && selectedPlanDetails && ReactDOM.createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease", boxSizing: "border-box" }} onClick={() => setIsModalOpen(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "24px" : "40px", maxWidth: "900px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out", display: "flex", flexDirection: "column", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>&times;</button>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: "32px" }}>
              {/* Left Column: Order Summary & Account Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", order: isMobile ? 1 : 1 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Order Summary</h3>
                  <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: selectedPlanDetails.name === 'Enterprise' ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : selectedPlanDetails.name === 'Pro' ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>✨</div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{selectedPlanDetails.name} Plan</div>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{isYearly ? 'Yearly' : 'Monthly'} Billing</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#475569" }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{isYearly ? selectedPlanDetails.priceYearly : selectedPlanDetails.priceMonthly}</span>
                    </div>
                    {isYearly && selectedPlanDetails.name !== 'Basic' && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#16a34a" }}>
                        <span>Annual Discount</span>
                        <span style={{ fontWeight: 600 }}>Included</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#16a34a" }}>
                        <span>Promo Discount</span>
                        <span style={{ fontWeight: 600 }}>-₱{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    <div style={{ height: "1px", background: "#e2e8f0", margin: "20px 0" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#000" }}>Total Due</span>
                      <span style={{ fontSize: "24px", fontWeight: 800, color: "#15803d" }}>{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Account Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} onBlur={() => handleBlur('name')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('name') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('name')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('name'); if (!getError('name')) e.target.style.borderColor = "#e2e8f0"}} />
                    </div>
                    <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                      <input type="email" placeholder="juan@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} onBlur={() => handleBlur('email')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('email') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('email')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('email'); if (!getError('email')) e.target.style.borderColor = "#e2e8f0"}} />
                    </div>
                    <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone Number</label>
                      <input type="tel" placeholder="0912 345 6789" required value={formData.phone} onChange={handlePhoneChange} onBlur={() => handleBlur('phone')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('phone') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('phone')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('phone'); if (!getError('phone')) e.target.style.borderColor = "#e2e8f0"}} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Organization Type</label>
                      <CustomDropdown options={["Individual", "Micro-Vendor", "Commercial Farm", "LGU / Institution"]} value={formData.orgType} onChange={(val) => setFormData({...formData, orgType: val})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Details & Submit */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", order: isMobile ? 2 : 2 }}>
                {selectedPlanDetails.name !== 'Basic' && selectedPlanDetails.name !== 'Enterprise' ? (
                  <>
                    <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Payment Method</h3>
                    <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
                      {['Credit Card', 'GCash', 'Maya'].map(method => (
                        <button 
                          key={method} 
                          type="button" 
                          onClick={() => setFormData({...formData, paymentMethod: method, refNumber: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "" })}
                          style={{ flex: 1, padding: "10px 8px", borderRadius: "8px", border: "none", background: formData.paymentMethod === method ? "#ffffff" : "transparent", color: formData.paymentMethod === method ? "#15803d" : "#64748b", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: formData.paymentMethod === method ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>
                          {method}
                        </button>
                      ))}
                    </div>

                    {formData.paymentMethod === 'Credit Card' ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeIn 0.3s ease" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cardholder Name</label>
                          <input type="text" placeholder="Juan Dela Cruz" value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} onBlur={() => handleBlur('cardName')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('cardName') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('cardName')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('cardName'); if (!getError('cardName')) e.target.style.borderColor = "#e2e8f0"}} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Card Number</label>
                          <div style={{ position: "relative" }}>
                            <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={formData.cardNumber} onChange={handleCardNumberChange} onBlur={() => handleBlur('cardNumber')} style={{ width: "100%", padding: "14px 16px", paddingRight: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('cardNumber') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('cardNumber')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('cardNumber'); if (!getError('cardNumber')) e.target.style.borderColor = "#e2e8f0"}} />
                            <svg style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expiry Date</label>
                            <input type="text" placeholder="MM/YY" maxLength="5" value={formData.cardExpiry} onChange={handleCardExpiryChange} onBlur={() => handleBlur('cardExpiry')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('cardExpiry') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('cardExpiry')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('cardExpiry'); if (!getError('cardExpiry')) e.target.style.borderColor = "#e2e8f0"}} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>CVC</label>
                            <input type="text" placeholder="123" maxLength="4" value={formData.cardCvv} onChange={handleCardCvvChange} onBlur={() => handleBlur('cardCvv')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('cardCvv') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('cardCvv')) e.target.style.borderColor = "#16a34a"}} onBlur={e => {handleBlur('cardCvv'); if (!getError('cardCvv')) e.target.style.borderColor = "#e2e8f0"}} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ padding: "16px", background: formData.paymentMethod === 'GCash' ? "#eff6ff" : "#ecfdf5", borderRadius: "12px", border: formData.paymentMethod === 'GCash' ? "1px solid #bfdbfe" : "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
                          <div style={{ fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>📱</div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: formData.paymentMethod === 'GCash' ? "#1d4ed8" : "#047857" }}>Pay with {formData.paymentMethod}</div>
                            <div style={{ fontSize: "12px", color: formData.paymentMethod === 'GCash' ? "#3b82f6" : "#059669", fontWeight: 500, marginTop: "2px" }}>Scan QR code or use the app to pay.</div>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Transaction Ref Number</label>
                          <input type="text" placeholder="e.g. 1000293812" value={formData.refNumber} onChange={e => setFormData({...formData, refNumber: e.target.value})} onBlur={() => handleBlur('refNumber')} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", ...(getError('refNumber') ? {borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)'} : {}) }} onFocus={e => {if (!getError('refNumber')) e.target.style.borderColor = formData.paymentMethod === 'GCash' ? "#3b82f6" : "#10b981"}} onBlur={e => {handleBlur('refNumber'); if (!getError('refNumber')) e.target.style.borderColor = "#e2e8f0"}} />
                        </div>
                        <button type="button" onClick={() => window.open(formData.paymentMethod === 'GCash' ? 'https://m.gcash.com' : 'https://maya.ph', '_blank')} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease', marginTop: '4px' }}>Open {formData.paymentMethod} App</button>
                      </div>
                    )}

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Promo Code (Optional)</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" placeholder="Enter code" value={formData.promoCode} onChange={e => { setFormData({...formData, promoCode: e.target.value}); setPromoError(false); setPromoSuccess(false); }} style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: promoError ? "1px solid #ef4444" : promoSuccess ? "1px solid #16a34a" : "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = promoError ? "#ef4444" : "#16a34a"} onBlur={e => e.target.style.borderColor = promoError ? "#ef4444" : promoSuccess ? "#16a34a" : "#e2e8f0"} />
                        <button type="button" onClick={handleApplyPromo} style={{ padding: "0 20px", borderRadius: "12px", background: promoError ? "#ef4444" : promoSuccess ? "#16a34a" : "#15803d", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                          {promoSuccess ? "Applied ✓" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                   <div style={{ padding: "16px", background: "#f1f5f9", borderRadius: "12px", textAlign: "center", color: "#475569", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", justifyContent: "center", flex: 1 }}>
                     <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "8px" }}>
                       {selectedPlanDetails.name === 'Basic' ? '🎉' : '🤝'}
                     </div>
                     <div style={{ fontSize: "14px", fontWeight: 600 }}>
                       {selectedPlanDetails.name === 'Basic' ? 'No payment required for the Basic plan.' : 'Our sales team will contact you for custom Enterprise billing.'}
                     </div>
                   </div>
                )}

                {message && (
                  <div style={{ padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, textAlign: "center", background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, marginTop: "auto" }}>
                    {message.text}
                  </div>
                )}

                <button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  style={{ width: "100%", padding: "16px", marginTop: message ? "8px" : "auto", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#ffffff", fontWeight: 800, fontSize: "15px", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 8px 24px rgba(22, 163, 74, 0.25)", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isLoading ? 0.8 : 1 }}
                  onMouseEnter={(e) => { if(!isLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(22, 163, 74, 0.35)'; } }}
                  onMouseLeave={(e) => { if(!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 163, 74, 0.25)'; } }}
                >
                  {isLoading ? (
                    <>
                      <div className="ring-spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      {selectedPlanDetails.name === 'Enterprise' ? "Submit Inquiry" : (selectedPlanDetails.name === 'Basic' ? "Activate Free Plan" : `Pay ${isYearly ? selectedPlanDetails.priceYearly : selectedPlanDetails.priceMonthly}`)}
                    </>
                  )}
                </button>
                
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Information is secure and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showPaymentSuccess && selectedPlanDetails && ReactDOM.createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "32px 24px" : "40px", maxWidth: "380px", width: "100%", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: selectedPlanDetails.name === 'Enterprise' ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : selectedPlanDetails.name === 'Pro' ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: selectedPlanDetails.name === 'Enterprise' ? "0 8px 16px rgba(14, 165, 233, 0.3)" : selectedPlanDetails.name === 'Pro' ? "0 8px 16px rgba(234, 179, 8, 0.3)" : "0 8px 16px rgba(22, 163, 74, 0.3)", animation: "checkmarkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "successDraw 0.6s ease-out 0.2s both" }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>
              {selectedPlanDetails.name === 'Enterprise' ? "Inquiry Submitted!" : "Payment Successful!"}
            </h2>
            <p style={{ margin: "0 0 32px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
              {selectedPlanDetails.name === 'Enterprise' 
                ? "Our sales team will contact you shortly to discuss your custom plan."
                : <>You are now successfully subscribed to the <strong style={{ color: selectedPlanDetails.name === 'Pro' ? "#ca8a04" : "#15803d" }}>{selectedPlanDetails.name}</strong> plan.</>}
            </p>
            <button 
              onClick={() => setShowPaymentSuccess(false)}
              style={{ width: "100%", padding: "14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
            >
              Continue
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

const FieldWrap = ({ error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, width: "100%", textAlign: "left" }}>
    {children}
    {typeof error === 'string' && <span style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444", marginLeft: "4px" }}>{error}</span>}
  </div>
);

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
        <FaChevronDown 
          style={{ 
            transition: 'transform 0.3s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            color: '#15803d'
          }} 
          size={12} 
        />
      </button>
      {isOpen && (
        <div 
          className="custom-scrollbar animate-fadeIn" 
          style={styles.customDropdownList}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                ...styles.customDropdownItem,
                ...(value === opt ? styles.customDropdownItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (value !== opt) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
                  e.currentTarget.style.color = '#15803d';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== opt) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#000';
                }
              }}
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

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 16px 60px", maxWidth: "1100px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  wrapMobile: { padding: "16px 12px 40px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", marginBottom: "20px" },
  backBtnWrap: { position: "absolute", left: 0, top: "-5px" },
  backBtn: { padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s ease" },
  backBtnHov: { transform: "scale(1.035)" },
  badge: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: 600, color: "#15803d", letterSpacing: "0.6px", textTransform: "uppercase", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)" },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)", display: "inline-block" },
  title: { fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 800, color: "#000", margin: "0 auto 16px", lineHeight: 1.15, letterSpacing: "-0.8px", textShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  titleMobile: { fontSize: "clamp(24px, 7vw, 32px)" },
  titleUnderline: { width: "118px", height: "4px", background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)", backgroundSize: "200% 100%", margin: "0 auto 18px", boxShadow: "0 0 18px rgba(134,239,172,0.75)", borderRadius: "999px" },
  accent: { background: "linear-gradient(90deg, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  body: { color: "#000", marginBottom: "32px", fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, lineHeight: 1.6, maxWidth: "600px" },
  bodyMobile: { marginBottom: "24px" },
  toggleContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "40px", padding: "10px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" },
  toggleLabel: { fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s ease, font-weight 0.2s ease" },
  toggleTrack: { width: "48px", height: "24px", background: "linear-gradient(135deg, #86efac, #4ade80)", borderRadius: "999px", position: "relative", cursor: "pointer", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)", border: "1px solid rgba(21,128,61,0.2)" },
  toggleThumb: { width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "1px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)" },
  discountBadge: { background: "rgba(22, 163, 74, 0.1)", color: "#15803d", fontSize: "10px", padding: "2px 8px", borderRadius: "999px", fontWeight: 700, border: "1px solid rgba(22, 163, 74, 0.2)" },
  tabContainer: { display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px", flexWrap: "wrap" },
  tabBtn: { padding: "10px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(0,0,0,0.05)", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", fontSize: "14px" },
  activeTabBtn: { background: "linear-gradient(135deg, rgba(134,239,172,0.9), rgba(125,211,252,0.9))", color: "#064e3b" },
  panelContainer: { width: "100%", background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))", borderRadius: "20px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", boxSizing: "border-box" },
  panelTitle: { fontSize: "24px", fontWeight: 800, marginBottom: "20px", color: "#000" },
  comparisonTitle: { fontSize: "28px", fontWeight: 800, margin: "40px 0 20px", color: "#000" },
  tableWrapper: { width: "100%", overflowX: "auto", borderRadius: "16px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px", borderBottom: "2px solid rgba(0,0,0,0.1)", color: "#15803d", fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap" },
  td: { padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.8)", fontSize: "14px", whiteSpace: "nowrap" },
  tr: { transition: "background 0.2s ease" },
  actionBtn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginRight: "8px" },
  customDropdownWrap: { position: "relative", width: "100%" },
  customDropdownHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    background: "rgba(255, 255, 255, 0.7)",
    fontSize: "14px",
    fontWeight: 500,
    color: "#000",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.05)",
    outline: "none",
    textAlign: "left"
  },
  customDropdownHeaderActive: {
    borderColor: "#16a34a",
    boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
    background: "rgba(255, 255, 255, 0.95)",
  },
  customDropdownList: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid rgba(34, 197, 94, 0.2)",
    padding: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxHeight: "200px",
    overflowY: "auto",
  },
  customDropdownItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#000",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
  },
  customDropdownItemActive: {
    background: "rgba(34, 197, 94, 0.12)",
    color: "#15803d",
    fontWeight: 700,
  },
};

export default AIDataSubscription;