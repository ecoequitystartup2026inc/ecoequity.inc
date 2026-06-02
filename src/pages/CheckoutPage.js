import React, { useState, useEffect, useRef } from "react";
import { FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaGift, FaTag, FaSeedling, FaStar, FaTimes, FaTrash } from "react-icons/fa";

const getProductStats = (product) => {
  const baseRating = product.rating || 0;
  const baseCount = product.reviewCount || 0;
  return { rating: baseRating.toFixed(1), reviewCount: baseCount };
};

export default function CheckoutPage({ setActiveNav, cartItems, setCartItems, addEcoPoints, setOrders, onTrackOrder, products, setProducts, promoCodes }) {
  const [localCartItems, setLocalCartItems] = useState([]);
  const activeCartItems = cartItems !== undefined ? cartItems : localCartItems;
  const activeSetCartItems = setCartItems !== undefined ? setCartItems : setLocalCartItems;

  const [localTrackOrder, setLocalTrackOrder] = useState(null);
  const activeOnTrackOrder = onTrackOrder !== undefined ? onTrackOrder : (order) => {
    setLocalTrackOrder(order);
    console.log("Tracking order locally:", order);
  };

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showSuccess, setShowSuccess] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [supportSeed, setSupportSeed] = useState(false);
  const [showEcoTooltip, setShowEcoTooltip] = useState(false);
  const [showSeedTooltip, setShowSeedTooltip] = useState(false);
  const [showSeedOptionTooltip, setShowSeedOptionTooltip] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [productToReview, setProductToReview] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bankDetails, setBankDetails] = useState({ bankName: "", accNumber: "", accName: "" });
  const [showGcashModal, setShowGcashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [localReviews, setLocalReviews] = useState({});
  const [highlightedReview, setHighlightedReview] = useState(null);
  const reviewsTopRef = useRef(null);
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
  const [touched, setTouched] = useState({});

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
    return false;
  };

  useEffect(() => {
    const saved = localStorage.getItem("verdeversity_reviews");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalReviews(parsed);
        products.forEach(p => {
          if (parsed[p.id] && !p.__reviewsHydrated) {
             p.__reviewsHydrated = true;
             p.reviews = [...parsed[p.id], ...(p.reviews || [])];
             const addedScore = parsed[p.id].reduce((sum, r) => sum + r.rating, 0);
             const originalTotalScore = (p.rating || 0) * (p.reviewCount || 0);
             p.reviewCount = (p.reviewCount || 0) + parsed[p.id].length;
             p.rating = (originalTotalScore + addedScore) / p.reviewCount;
          }
        });
      } catch (e) { console.error("Could not parse saved reviews."); }
    }

    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (showSuccess || reviewModalOpen || showGcashModal) {
       document.body.style.overflow = "hidden";
    } else {
       document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showSuccess, reviewModalOpen, showGcashModal]);

  const cartItemCounts = activeCartItems.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const uniqueCartItems = Object.keys(cartItemCounts).map((id) => {
    const product = products.find((p) => p.id === parseInt(id));
    return product ? { ...product, quantity: cartItemCounts[id] } : null;
  }).filter(Boolean);

  const subtotal = uniqueCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = uniqueCartItems.length > 0 ? (deliverySpeed === "express" ? 150 : 50) : 0;
  const serviceFee = uniqueCartItems.length > 0 ? 15 : 0;
  const seedDonation = supportSeed ? 20 : 0;
  const totalAmount = Math.max(0, subtotal + shippingFee + serviceFee + seedDonation - discount);
  const ecoPoints = Math.floor(totalAmount * 0.1);
  
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
      setPromoError(false);
      setPromoSuccess(true);
      setTimeout(() => setPromoSuccess(false), 2000);
    } else { 
      setDiscount(0); 
      setPromoError(true); 
      setPromoSuccess(false);
      setTimeout(() => setPromoError(false), 2000); 
    }
  };
  
  const isFormValid = formData.fullName.trim() !== "" &&
                      formData.phone.trim() !== "" && /^(09|\+639)\d{9}$/.test(formData.phone.trim().replace(/[\s-]/g, '')) &&
                      formData.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
                      formData.address.trim() !== "" &&
                      formData.city.trim() !== "" &&
                      formData.province.trim() !== "" &&
                      formData.zip.trim() !== "" && /^\d{4}$/.test(formData.zip.trim()) &&
                      (selectedPayment === 'card' ? (cardDetails.number.trim() !== "" && cardDetails.expiry.trim() !== "" && cardDetails.cvv.trim() !== "" && cardDetails.name.trim() !== "") : true) &&
                      (selectedPayment === 'bank' ? (bankDetails.bankName.trim() !== "" && bankDetails.accNumber.trim() !== "" && bankDetails.accName.trim() !== "") : true);

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

  const handlePlaceOrder = () => {
    if (uniqueCartItems.length === 0 || !isFormValid || isProcessing) return;

    if (selectedPayment === "gcash") {
      setShowGcashModal(true);
    } else {
      processOrder();
    }
  };

  const processOrder = () => {
    if (uniqueCartItems.length === 0 || !isFormValid || isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      if (addEcoPoints && ecoPoints > 0) {
        addEcoPoints(ecoPoints, "Buy Organic Products");
      }
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
        payment: selectedPayment === 'cod' ? 'Cash on Delivery' : selectedPayment === 'gcash' ? 'GCash' : selectedPayment === 'maya' ? 'Maya' : selectedPayment === 'bank' ? 'Bank Transfer' : 'Credit Card',
        paymentStatus: selectedPayment === 'cod' ? 'Pending' : 'Paid',
        deliverySpeed,
        subtotal,
        shippingFee,
        serviceFee,
        seedDonation,
        discount,
        rider: "Unassigned"
      };
      setLatestOrder(newOrder);
      if (setOrders) {
        setOrders(prev => [newOrder, ...prev]);
      }
      activeSetCartItems([]);
    }, 1500);
  };

  const modalStats = productToReview ? getProductStats(productToReview) : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 animate-fadeIn overflow-hidden box-border font-sans text-gray-900">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 relative z-10">
            <button 
               onClick={() => setActiveNav && setActiveNav("Shop All Products")}
               className="p-3 rounded-full bg-white/60 border border-black/5 hover:bg-white/80 transition-transform hover:scale-105 backdrop-blur-md shadow-sm flex items-center justify-center text-gray-800"
            >
              <FaArrowLeft />
            </button>
            <div className="flex-1 text-left">
               <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500 drop-shadow-sm">
                 Checkout
               </h1>
               <p className="text-sm md:text-base text-gray-600 font-medium mt-1">Complete your order with secure payment.</p>
            </div>
        </div>

        {/* Checkout Progress Stepper */}
        <div className="flex items-center justify-center w-[85%] max-w-[400px] mx-auto mb-10 mt-2 relative z-10">
          {['Cart', 'Delivery & Payment', 'Confirmation'].map((step, idx) => (
             <div key={step} className={`flex items-center relative ${idx < 2 ? 'flex-1' : 'flex-none'}`}>
               <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-extrabold z-10 border-2 transition-all ${idx <= 1 ? 'bg-gradient-to-br from-green-600 to-green-700 text-white border-transparent shadow-[0_4px_12px_rgba(21,128,61,0.3)]' : 'bg-gray-100 text-gray-400 border-white shadow-sm'}`}>
                 {idx < 1 ? '✓' : idx + 1}
               </div>
               <span className={`absolute top-9 left-[14px] -translate-x-1/2 text-[11px] font-bold whitespace-nowrap ${idx <= 1 ? 'text-green-700' : 'text-gray-400'}`}>
                 {step}
               </span>
               {idx < 2 && (
                 <div className="flex-1 h-1 mx-1 rounded-full relative z-0 bg-black/5">
                   <div className={`h-full rounded-full ${idx < 1 ? 'bg-gradient-to-r from-green-500 to-green-300' : ''}`} />
                 </div>
               )}
             </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-7 flex flex-col gap-8">
             {/* Delivery Info */}
             <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h2 className="text-xl font-bold mb-5 text-green-900 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm">1</span>
                 Delivery Information
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputField label="Full Name" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={(val) => handleInputChange("fullName", val)} onBlur={() => handleBlur("fullName")} error={getError("fullName")} />
                 <InputField label="Phone Number" placeholder="0912 345 6789" value={formData.phone} onChange={(val) => handleInputChange("phone", val)} onBlur={() => handleBlur("phone")} error={getError("phone")} />
                 <InputField label="Email Address" placeholder="juan@example.com" className="md:col-span-2" value={formData.email} onChange={(val) => handleInputChange("email", val)} onBlur={() => handleBlur("email")} error={getError("email")} />
                 <InputField label="Delivery Address" placeholder="123 Main St, Brgy 1" className="md:col-span-2" value={formData.address} onChange={(val) => handleInputChange("address", val)} onBlur={() => handleBlur("address")} error={getError("address")} />
                 <InputField label="City / Municipality" placeholder="Quezon City" value={formData.city} onChange={(val) => handleInputChange("city", val)} onBlur={() => handleBlur("city")} error={getError("city")} />
                 <InputField label="Province" placeholder="Metro Manila" value={formData.province} onChange={(val) => handleInputChange("province", val)} onBlur={() => handleBlur("province")} error={getError("province")} />
                 <InputField label="ZIP / Postal Code" placeholder="1100" value={formData.zip} onChange={(val) => handleInputChange("zip", val)} onBlur={() => handleBlur("zip")} error={getError("zip")} />
                 <InputField label="Delivery Instructions" placeholder="Leave at the front desk..." className="md:col-span-2" value={formData.instructions} onChange={(val) => handleInputChange("instructions", val)} onBlur={() => handleBlur("instructions")} />
                 <div className="md:col-span-2 flex flex-col gap-1.5 mt-2">
                   <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest ml-1">Delivery Speed</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <DeliverySpeedCard id="standard" label="Standard" desc="3-5 Business Days" price="₱50" selected={deliverySpeed} onSelect={setDeliverySpeed} />
                     <DeliverySpeedCard id="express" label="Express" desc="1-2 Business Days" price="₱150" selected={deliverySpeed} onSelect={setDeliverySpeed} />
                   </div>
                 </div>
               </div>
             </div>

             {/* Payment Method */}
             <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h2 className="text-xl font-bold mb-5 text-green-900 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm">2</span>
                 Payment Method
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <PaymentCard id="cod" label="Cash on Delivery" icon={<FaMoneyBillWave className="text-green-600" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                 <PaymentCard id="gcash" label="GCash" icon={<span className="text-blue-500 font-bold italic text-lg tracking-tighter">G</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
                 <PaymentCard id="card" label="Credit / Debit Card" icon={<FaCreditCard className="text-gray-600" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                 <PaymentCard id="bank" label="Bank Transfer" icon={<FaMoneyBillWave className="text-emerald-600" size={24} />} selected={selectedPayment} onSelect={setSelectedPayment} />
                 <PaymentCard id="maya" label="Maya" icon={<span className="text-emerald-500 font-bold italic text-lg">maya</span>} selected={selectedPayment} onSelect={setSelectedPayment} />
               </div>

               {selectedPayment === 'card' && (
                 <div className="mt-5 p-5 rounded-2xl bg-white/60 border border-black/5 animate-fadeIn flex flex-col gap-4">
                   <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-1">Card Details</h3>
                   <InputField label="Card Number" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={(val) => setCardDetails(prev => ({...prev, number: val}))} />
                   <div className="grid grid-cols-2 gap-4">
                     <InputField label="Expiry Date" placeholder="MM/YY" value={cardDetails.expiry} onChange={(val) => setCardDetails(prev => ({...prev, expiry: val}))} />
                     <InputField label="CVV" placeholder="123" value={cardDetails.cvv} onChange={(val) => setCardDetails(prev => ({...prev, cvv: val}))} />
                   </div>
                   <InputField label="Cardholder Name" placeholder="Juan Dela Cruz" value={cardDetails.name} onChange={(val) => setCardDetails(prev => ({...prev, name: val}))} />
                 </div>
               )}

               {selectedPayment === 'bank' && (
                 <div className="mt-5 p-5 rounded-2xl bg-white/60 border border-black/5 animate-fadeIn flex flex-col gap-4">
                   <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-1">Bank Details</h3>
                   <InputField label="Bank Name" placeholder="e.g. BDO / BPI / Metrobank" value={bankDetails.bankName} onChange={(val) => setBankDetails(prev => ({...prev, bankName: val}))} />
                   <InputField label="Account Number" placeholder="0000 0000 0000" value={bankDetails.accNumber} onChange={(val) => setBankDetails(prev => ({...prev, accNumber: val}))} />
                   <InputField label="Account Name" placeholder="Juan Dela Cruz" value={bankDetails.accName} onChange={(val) => setBankDetails(prev => ({...prev, accName: val}))} />
                 </div>
               )}
             </div>

             {/* Eco & Support Options */}
             <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h2 className="text-xl font-bold mb-5 text-green-900 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm">3</span>
                 Eco & Support Options
               </h2>
               <label className="flex items-center gap-3 p-4 rounded-2xl border border-green-200 bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors shadow-sm">
                 <input type="checkbox" checked={supportSeed} onChange={(e) => setSupportSeed(e.target.checked)} className="w-5 h-5 text-green-600 accent-green-600 rounded border-green-300 focus:ring-green-500" />
                 <FaSeedling className="text-green-600 text-lg" />
                 <span className="text-sm font-bold text-green-900 flex-1 flex items-center gap-2">
                   Add ₱20 to support native seed preservation
                   <span 
                     className="cursor-help relative text-green-700"
                     onMouseEnter={() => setShowSeedOptionTooltip(true)}
                     onMouseLeave={() => setShowSeedOptionTooltip(false)}
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSeedOptionTooltip(!showSeedOptionTooltip); }}
                   >
                     (?)
                     {showSeedOptionTooltip && (
                       <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#062018] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold w-[240px] text-center z-[100] shadow-xl pointer-events-none leading-relaxed whitespace-normal animate-fadeIn">
                         Your ₱20 helps preserve endangered native Philippine seeds like Heirloom Adlai, local Tomato varieties, and indigenous herbs.
                         <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-solid border-transparent border-t-[#062018]" />
                       </span>
                     )}
                   </span>
                 </span>
               </label>
             </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
             <div className="bg-gradient-to-br from-white/90 to-green-50/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.08)] lg:sticky lg:top-6">
               <h2 className="text-xl font-bold mb-6 text-green-900 border-b border-black/5 pb-4">Order Summary</h2>
               
               <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                 {uniqueCartItems.map(item => {
                   const stats = getProductStats(item);
                   return (
                   <div key={item.id} className="flex items-center gap-4 bg-white/70 p-3 rounded-2xl border border-black/5 hover:border-black/10 transition-colors shadow-sm">
                     <div className="w-16 h-16 bg-green-600/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {item.emoji || "🌱"}
                     </div>
                     <div className="flex-1 flex flex-col">
                       <span className="font-bold text-sm text-gray-800">{item.name}</span>
                       <div className="flex items-center gap-1 mt-0.5 mb-0.5 cursor-pointer hover:bg-black/5 w-max px-1 -ml-1 rounded transition-colors" onClick={() => { setProductToReview(item); setReviewModalOpen(true); }}>
                         <FaStar className="text-yellow-400 text-[10px]" />
                         <span className="text-[10px] font-bold text-gray-700">{stats.rating}</span>
                         <span className="text-[10px] text-gray-500 hover:text-green-600 underline decoration-green-600/30">({stats.reviewCount} reviews)</span>
                       </div>
                       <span className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity}</span>
                     </div>
                     <div className="font-extrabold text-sm text-green-700">
                       ₱{(item.price * item.quantity).toFixed(2)}
                     </div>
                   </div>
                 )})}
                 {uniqueCartItems.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8 font-medium bg-white/40 rounded-2xl border border-dashed border-black/10">Your cart is empty.</div>
                 )}
               </div>

               {/* Promo Code Input */}
               <div className={`mt-6 flex items-center bg-white/70 border rounded-xl overflow-hidden transition-all duration-300 shadow-sm ${promoError ? 'border-red-400 bg-red-50/50' : promoSuccess ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-black/5'}`}>
                  <div className={`pl-4 ${promoError ? "text-red-400" : promoSuccess ? "text-green-600" : "text-gray-400"}`}><FaTag /></div>
                  <input 
                    value={promoCode} 
                    onChange={e => { setPromoCode(e.target.value); if (promoError) setPromoError(false); if (promoSuccess) setPromoSuccess(false); }} 
                    placeholder="Promo code (e.g. GREEN10)" 
                    className={`flex-1 bg-transparent border-none px-3 py-3 text-sm font-medium outline-none ${promoError ? 'text-red-600 placeholder:text-red-300' : promoSuccess ? 'text-green-700' : 'text-gray-800'}`} 
                  />
                  <button onClick={handleApplyPromo} className={`px-5 py-3 text-sm font-bold text-white transition-colors ${promoError ? 'bg-red-500 hover:bg-red-600' : promoSuccess ? 'bg-green-600' : 'bg-green-700 hover:bg-green-800'}`}>
                    {promoSuccess ? 'Applied ✓' : 'Apply'}
                  </button>
               </div>

               <div className="mt-5 border-t border-black/10 pt-5 flex flex-col gap-3">
                 <div className="flex justify-between text-sm text-gray-600 font-semibold">
                   <span>Subtotal</span>
                   <span className="text-gray-800">₱{subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 font-semibold">
                   <span>Shipping Fee</span>
                   <span className="text-gray-800">₱{shippingFee.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 font-semibold">
                   <span>Service Fee</span>
                   <span className="text-gray-800">₱{serviceFee.toFixed(2)}</span>
                 </div>
                 {supportSeed && (
                   <div className="flex justify-between text-sm text-green-700 font-bold">
                     <span 
                       className="cursor-help relative border-b border-dotted border-green-700"
                       onMouseEnter={() => setShowSeedTooltip(true)}
                       onMouseLeave={() => setShowSeedTooltip(false)}
                       onClick={(e) => { e.stopPropagation(); setShowSeedTooltip(!showSeedTooltip); }}
                     >
                       Seed Donation
                       {showSeedTooltip && (
                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#062018] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold w-[240px] text-center z-[100] shadow-xl pointer-events-none leading-relaxed whitespace-normal animate-fadeIn">
                           Your ₱20 helps preserve endangered native Philippine seeds like Heirloom Adlai, local Tomato varieties, and indigenous herbs.
                           <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-solid border-transparent border-t-[#062018]" />
                         </span>
                       )}
                     </span>
                     <span>₱20.00</span>
                   </div>
                 )}
                 {discount > 0 && (
                   <div className="flex justify-between text-sm text-emerald-600 font-bold">
                     <span>Discount</span>
                     <span>-₱{discount.toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-xl font-black text-green-800 mt-3 border-t border-black/5 pt-4">
                   <span>Total</span>
                   <span>₱{totalAmount.toFixed(2)}</span>
                 </div>
               </div>

               {/* EcoPoints Reward */}
               <div className="mt-4 bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 flex items-center gap-3 text-amber-700 text-sm font-semibold">
                 <FaGift className="text-green-700 text-lg" />
                 <span>You'll earn <strong 
                   className="text-green-700 cursor-help relative border-b border-dotted border-green-700"
                   onMouseEnter={() => setShowEcoTooltip(true)}
                   onMouseLeave={() => setShowEcoTooltip(false)}
                   onClick={(e) => { e.stopPropagation(); setShowEcoTooltip(!showEcoTooltip); }}
                 >
                   {ecoPoints} EcoPoints
                   {showEcoTooltip && (
                     <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#062018] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold w-[220px] text-center z-[100] shadow-xl pointer-events-none leading-relaxed whitespace-normal animate-fadeIn">
                       Earn EcoPoints on every order. Redeem them for discounts or use them to fund real tree-planting initiatives!
                       <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-solid border-transparent border-t-[#062018]" />
                     </span>
                   )}
                 </strong> from this purchase!</span>
               </div>

               <div className="mt-8 flex flex-col gap-3">
                 <button 
                   onClick={handlePlaceOrder}
               className="w-full py-4 rounded-full font-bold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2" 
                   style={{
                     background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
                     border: "1px solid rgba(255,255,255,0.35)",
                     color: "#062018",
                     boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
               disabled={uniqueCartItems.length === 0 || !isFormValid || isProcessing}
                 >
               {isProcessing ? (
                 <>
                   <div className="w-5 h-5 border-2 border-[#062018]/30 border-t-[#062018] rounded-full animate-spin"></div>
                   <span>Processing...</span>
                 </>
               ) : (
                 `Pay ₱${totalAmount.toFixed(2)}`
               )}
                 </button>
                 <button 
                   onClick={() => setActiveNav && setActiveNav("Shop All Products")}
                   className="w-full py-3.5 rounded-full bg-white/60 text-gray-700 font-bold border border-black/10 transition-transform shadow-sm"
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                 >
                   Back to Cart
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pb-12 relative z-10">
          <TrustBadge icon={<FaShieldAlt className="text-green-600 text-2xl" />} title="Secure Checkout" desc="100% Encrypted Payment" />
          <TrustBadge icon={<FaTruck className="text-green-600 text-2xl" />} title="Fast Delivery" desc="Nationwide Shipping" />
          <TrustBadge icon={<FaUndo className="text-green-600 text-2xl" />} title="Easy Returns" desc="7-Day Return Policy" />
          <TrustBadge icon={<FaHeadset className="text-green-600 text-2xl" />} title="Support 24/7" desc="Always Here to Help" />
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl">
              <FaCheckCircle className="text-green-500 text-6xl mb-4" />
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-6">Your order has been successfully placed. We will send you an email confirmation shortly.</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    activeOnTrackOrder(latestOrder);
                  }}
                  className="w-full py-3.5 rounded-full font-bold text-lg transition-transform bg-gray-100 text-gray-700 hover:bg-gray-200 border border-black/5"
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Track Order
                </button>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    activeSetCartItems([]);
                    if (setActiveNav) setActiveNav("Shop All Products");
                  }}
                  className="w-full py-3.5 rounded-full font-bold text-lg transition-transform"
                  style={{
                    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
                    border: "1px solid rgba(255,255,255,0.35)",
                    color: "#062018",
                    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GCash Modal */}
        {showGcashModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative">
              <button onClick={() => setShowGcashModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaTimes />
              </button>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-blue-500 font-extrabold italic text-3xl tracking-tighter">G</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Scan to Pay</h2>
              <p className="text-gray-600 mb-6 text-sm">Please scan the QR code using your GCash app to complete the payment of <strong>₱{totalAmount.toFixed(2)}</strong>.</p>
              
              <div className="w-48 h-48 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-200 shadow-inner">
                 <div className="text-center text-gray-400 font-bold text-sm">
                   <div className="w-32 h-32 border-4 border-dashed border-gray-300 mx-auto mb-2 flex items-center justify-center rounded-xl">
                     <span className="text-3xl">📱</span>
                   </div>
                   Mock QR Code
                 </div>
              </div>

              <button 
                onClick={() => {
                  setShowGcashModal(false);
                  processOrder();
                }}
                className="w-full py-3.5 rounded-full font-bold text-lg transition-transform text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                I've Paid
              </button>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && productToReview && modalStats && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setReviewModalOpen(false)}>
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
              <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaTimes />
              </button>
              
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{productToReview.name}</h2>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                 <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.round(Number(modalStats.rating)) ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                 </div>
                 <span className="font-bold text-gray-800">{modalStats.rating} out of 5</span>
                 <span className="text-sm text-gray-500">({modalStats.reviewCount} reviews)</span>
              </div>

              <div className="flex flex-col gap-4 mb-6">
                 <div ref={reviewsTopRef} />
                 {(productToReview.reviews || []).map((rev, idx) => (
                    <div key={idx} className={`bg-gray-50 rounded-2xl p-4 border border-gray-100 ${highlightedReview === rev ? 'animate-highlightFlash' : ''}`}>
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800">{rev.user}</span>
                            {rev.user === "You" && (
                              <button 
                                onClick={() => {
                                  const revIndex = productToReview.reviews.findIndex(r => r === rev);
                                  if (revIndex > -1) {
                                    productToReview.reviews.splice(revIndex, 1);
                                    const currentTotalScore = (productToReview.rating || 0) * (productToReview.reviewCount || 0);
                                    productToReview.reviewCount = Math.max(0, (productToReview.reviewCount || 0) - 1);
                                    productToReview.rating = productToReview.reviewCount > 0 ? (currentTotalScore - rev.rating) / productToReview.reviewCount : 0;
                                    setLocalReviews(prev => {
                                      const productReviews = prev[productToReview.id] || [];
                                      const updatedProductReviews = productReviews.filter(r => r !== rev && !(r.user === rev.user && r.comment === rev.comment && r.rating === rev.rating));
                                      const updated = { ...prev, [productToReview.id]: updatedProductReviews };
                                      localStorage.setItem("verdeversity_reviews", JSON.stringify(updated));
                                      return updated;
                                    });
                                  }
                                }}
                                className="text-red-400 hover:text-red-600 transition-colors"
                                title="Delete Review"
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                          <div className="flex text-yellow-400 text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < rev.rating ? "text-yellow-400" : "text-gray-200"} />
                            ))}
                          </div>
                       </div>
                       <p className="text-sm text-gray-600">{rev.comment}</p>
                    </div>
                 ))}
              </div>

              <div className="mt-auto bg-green-50/50 p-4 rounded-2xl border border-green-100">
                 <h3 className="font-bold text-green-900 mb-3 text-sm">Write a Review</h3>
                 <div className="flex items-center gap-1 mb-3 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className={star <= newReviewRating ? "text-yellow-400 text-lg" : "text-gray-300 text-lg"} onClick={() => setNewReviewRating(star)} />
                    ))}
                 </div>
                 <div className="relative mb-3">
                   <textarea 
                      maxLength={500} value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Share your experience with this product..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 pb-7 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 resize-none h-24 custom-scrollbar"
                   />
                   <span className="absolute bottom-2.5 right-3 text-[10px] font-bold text-gray-400">{newReviewText.length}/500</span>
                 </div>
                 <button 
                    onClick={() => { 
                      if (!newReviewText.trim()) return; 
                      const newReview = { user: "You", rating: newReviewRating, comment: newReviewText }; 
                      if (!productToReview.reviews) productToReview.reviews = [];
                      productToReview.reviews.unshift(newReview);
                      const currentTotalScore = (productToReview.rating || 0) * (productToReview.reviewCount || 0);
                      productToReview.reviewCount = (productToReview.reviewCount || 0) + 1;
                      productToReview.rating = (currentTotalScore + newReviewRating) / productToReview.reviewCount;
                      setLocalReviews(prev => {
                        const updated = { ...prev, [productToReview.id]: [newReview, ...(prev[productToReview.id] || [])] };
                        localStorage.setItem("verdeversity_reviews", JSON.stringify(updated));
                        return updated;
                      });
                      setNewReviewText(""); 
                      setNewReviewRating(5); 
                      setHighlightedReview(newReview);
                      setTimeout(() => setHighlightedReview(null), 2000);
                      setTimeout(() => {
                        reviewsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    disabled={!newReviewText.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                 >
                    Submit Review
                 </button>
              </div>
            </div>
          </div>
        )}

      </div>
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
            animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes highlightFlash {
            0% { background-color: rgba(74, 222, 128, 0.3); transform: scale(1.02); box-shadow: 0 4px 12px rgba(74, 222, 128, 0.2); }
            100% { background-color: #f9fafb; transform: scale(1); box-shadow: none; }
        }
        .animate-highlightFlash {
            animation: highlightFlash 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

const InputField = ({ label, placeholder, value, onChange, onBlur, error, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className={`text-[11px] font-extrabold uppercase tracking-widest ml-1 ${error ? 'text-red-500' : 'text-gray-600'}`}>{label}</label>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full bg-white/60 border rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-4 transition-all placeholder:text-gray-400 placeholder:font-normal shadow-sm ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50/50' : 'border-black/5 focus:border-green-400 focus:ring-green-400/20'}`}
    />
    {typeof error === 'string' && <span className="text-[10px] font-bold text-red-500 ml-1 -mt-0.5">{error}</span>}
  </div>
);

const PaymentCard = ({ id, label, icon, selected, onSelect }) => (
  <button 
    onClick={() => onSelect(id)}
    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
      selected === id 
        ? "bg-green-50/90 border-green-500 shadow-[0_4px_15px_rgb(34,197,94,0.15)] ring-1 ring-green-500" 
        : "bg-white/60 border-black/5 hover:border-black/15 hover:bg-white/90 shadow-sm"
    }`}
  >
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected === id ? 'border-green-500 bg-white' : 'border-gray-300 bg-white/50'}`}>
      {selected === id && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
    </div>
    <div className="flex-1 text-left font-bold text-sm text-gray-800">{label}</div>
    <div className="shrink-0 drop-shadow-sm">{icon}</div>
  </button>
);

const DeliverySpeedCard = ({ id, label, desc, price, selected, onSelect }) => (
  <button 
    onClick={() => onSelect(id)}
    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
      selected === id 
        ? "bg-green-50/90 border-green-500 shadow-[0_4px_15px_rgb(34,197,94,0.15)] ring-1 ring-green-500" 
        : "bg-white/60 border-black/5 hover:border-black/15 hover:bg-white/90 shadow-sm"
    }`}
  >
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected === id ? 'border-green-500 bg-white' : 'border-gray-300 bg-white/50'}`}>
      {selected === id && <div className="w-2 h-2 bg-green-500 rounded-full" />}
    </div>
    <div className="flex-1 text-left flex flex-col gap-0.5">
      <span className="font-bold text-sm text-gray-800 leading-none">{label}</span>
      <span className="font-medium text-[11px] text-gray-500 leading-none">{desc}</span>
    </div>
    <div className="shrink-0 font-extrabold text-sm text-green-700">{price}</div>
  </button>
);

const TrustBadge = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
    <div className="w-12 h-12 rounded-full bg-green-100/80 flex items-center justify-center mb-3 shadow-sm">
      {icon}
    </div>
    <h4 className="font-extrabold text-gray-800 text-sm">{title}</h4>
    <p className="text-xs font-medium text-gray-500 mt-1">{desc}</p>
  </div>
);
