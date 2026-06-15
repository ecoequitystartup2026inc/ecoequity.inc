import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaWeightHanging, FaDollarSign, FaPlusCircle, FaHandshake, FaTimes, FaChevronDown, FaCheckCircle, FaCalendarAlt, FaChartLine, FaFilter, FaPaperPlane, FaMicrophone, FaImage } from "react-icons/fa";

const mockSurplusListings = [
  { id: 1, product: "Organic Tomatoes", quantity: 500, unit: "kg", price: 120, location: "Benguet", farmer: "Green Harvest Farms", status: "Available", description: "Freshly harvested organic tomatoes for bulk delivery." },
  { id: 2, product: "Native Adlai Grains", quantity: 200, unit: "kg", price: 180, location: "Mindanao", farmer: "Adlai Gold Producers", status: "Available", description: "High-quality sustainable grains." }
  // Add more mock data if needed for testing different scenarios
];

const mockRestaurantDemand = [
  { id: 101, restaurant: "Green Leaf Bistro", verified: true, product: "Organic Romaine Lettuce", quantity: 50, unit: "kg", targetPrice: 150, location: "Makati City", neededDate: "2026-06-05", logo: "🥗", matchScore: 98, urgent: true, status: "Open" },
  { id: 102, restaurant: "Farm to Table Resto", verified: true, product: "Cherry Tomatoes", quantity: 30, unit: "kg", targetPrice: 120, location: "BGC, Taguig", neededDate: "2026-06-03", logo: "🍲", matchScore: 85, urgent: false, status: "Open" },
  { id: 103, restaurant: "Vegan Eats", verified: true, product: "Sweet Basil", quantity: 5, unit: "kg", targetPrice: 400, location: "Quezon City", neededDate: "2026-06-02", logo: "🌱", matchScore: 72, urgent: true, status: "Open" },
];

function SurplusExchangePage({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("listings");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'negotiate' or 'offer'
  const [searchQuery, setSearchQuery] = useState("");
  const [surplusListings, setSurplusListings] = useState(mockSurplusListings);
  const [restaurantDemands, setRestaurantDemands] = useState(mockRestaurantDemand);
  const [showListSurplusModal, setShowListSurplusModal] = useState(false);
  const [showPostDemandModal, setShowPostDemandModal] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [sellerStatus, setSellerStatus] = useState("pending"); // 'pending', 'accepted', 'countered'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acceptedPrice, setAcceptedPrice] = useState(null);
  const [negotiations, setNegotiations] = useState({});
  const [showOngoingOnly, setShowOngoingOnly] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' or 'archived'
  const chatEndRef = useRef(null);
  const negotiationInputRef = useRef(null);

  const [sortConfig, setSortConfig] = useState({ key: 'product', direction: 'ascending' });
  const [newSurplus, setNewSurplus] = useState({ product: "", quantity: "", unit: "kg", price: "", location: "", description: "" });
  const [isSubmittingSurplus, setIsSubmittingSurplus] = useState(false);

  const [newDemand, setNewDemand] = useState({ product: "", quantity: "", unit: "kg", targetPrice: "", location: "", neededDate: "", restaurant: "My Restaurant" });
  const [isSubmittingDemand, setIsSubmittingDemand] = useState(false);

  const [showRestaurantOfferModal, setShowRestaurantOfferModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [restaurantOffer, setRestaurantOffer] = useState({ price: "", quantity: "", deliveryDate: "", message: "" });
  const [isSubmittingDemandOffer, setIsSubmittingDemandOffer] = useState(false);

  const [trackingDelivery, setTrackingDelivery] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    if (selectedItem || showListSurplusModal || showRestaurantOfferModal || showPostDemandModal || trackingDelivery) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem, showListSurplusModal, showRestaurantOfferModal, showPostDemandModal, trackingDelivery]);

  useEffect(() => {
    // Reset sort config when switching tabs to avoid sorting by a non-existent column
    setSortConfig({ key: 'product', direction: 'ascending' });
  }, [activeTab]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [negotiationHistory]);

  const openNegotiateModal = (item) => {
    const negotiationId = `negotiate-${item.id}`;
    const existingNegotiation = negotiations[negotiationId];

    setSelectedItem(item);
    setModalType('negotiate');
    setNegotiationMessage('');
    setShowConfirmation(false);
    setAcceptedPrice(null);

    if (existingNegotiation) {
      setNegotiationHistory(existingNegotiation.history);
      setSellerStatus(existingNegotiation.status || 'pending');
      setAcceptedPrice(existingNegotiation.acceptedPrice || null);
    } else {
      const initialHistory = [
        { sender: 'system', text: `You are negotiating for ${item.product}. Original price: ₱${item.price}/${item.unit}.` }
      ];
      setNegotiationHistory(initialHistory);
      setSellerStatus('pending');
      setNegotiations(prev => ({
        ...prev,
        [negotiationId]: { history: initialHistory, status: 'pending', acceptedPrice: null }
      }));
    }
  };

  const openRestaurantNegotiationModal = (item) => {
    const negotiationId = `restaurant-${item.id}`;
    const existingNegotiation = negotiations[negotiationId];

    setSelectedItem({ ...item, buyer: item.restaurant }); 
    setModalType('restaurantOffer');
    setNegotiationMessage('');
    setShowConfirmation(false);
    setAcceptedPrice(null);

    if (existingNegotiation) {
      setNegotiationHistory(existingNegotiation.history);
      setSellerStatus(existingNegotiation.status || 'pending');
      setAcceptedPrice(existingNegotiation.acceptedPrice || null);
    } else {
      const initialHistory = [
        { sender: 'system', text: `You are negotiating a supply agreement with ${item.restaurant} for ${item.quantity}${item.unit} of ${item.product}. Target price: ~₱${item.targetPrice}/${item.unit}.` }
      ];
      setNegotiationHistory(initialHistory);
      setSellerStatus('pending');
      setNegotiations(prev => ({
        ...prev,
        [negotiationId]: { history: initialHistory, status: 'pending', acceptedPrice: null }
      }));
    }
  };

  const extractOfferPrice = (message) => {
    const currencyMatch = message.match(/(?:₱|PHP\s*)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
    if (currencyMatch) return parseFloat(currencyMatch[1].replace(/,/g, ""));

    const unitMatch = message.match(/\b(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:\/|per\s+)(?:kg|ton|pcs|crates|unit)\b/i);
    return unitMatch ? parseFloat(unitMatch[1].replace(/,/g, "")) : null;
  };

  const getQuickPrices = () => {
    if (!selectedItem) return [];

    const basePrice = modalType === 'negotiate' ? selectedItem.price : selectedItem.targetPrice;
    const multipliers = modalType === 'negotiate' ? [0.95, 0.9, 0.85] : [1, 1.05, 1.1];

    return multipliers.map(multiplier => (basePrice * multiplier).toFixed(2));
  };

  const getQuickMessages = () => {
    if (!selectedItem) return [];

    if (modalType === 'negotiate') {
      return [
        `Hi, is ${selectedItem.product} still available for delivery this week?`,
        `Can you confirm the quality and harvest date for ${selectedItem.product}?`,
        `I can proceed today if we can agree on the final price.`
      ];
    }

    return [
      `Hi, we can supply ${selectedItem.quantity}${selectedItem.unit} of ${selectedItem.product}.`,
      `We can deliver on your needed date if the price is confirmed today.`,
      `Can you confirm receiving requirements and delivery window?`
    ];
  };

  const buildQuickPriceMessage = (price) => {
    if (!selectedItem) return "";

    if (modalType === 'negotiate') {
      return `Hi, I'd like to offer ₱${price} per ${selectedItem.unit} for ${selectedItem.product}.`;
    }

    return `Hi, we can supply ${selectedItem.product} for ₱${price} per ${selectedItem.unit}.`;
  };

  const setNegotiationDraft = (message) => {
    setNegotiationMessage(message);
    setTimeout(() => {
      if (negotiationInputRef.current) {
        negotiationInputRef.current.style.height = "auto";
        negotiationInputRef.current.style.height = `${Math.min(negotiationInputRef.current.scrollHeight, 92)}px`;
        negotiationInputRef.current.focus();
      }
    }, 0);
  };

  const handleSendOffer = () => {
    const message = negotiationMessage.trim();
    const offer = extractOfferPrice(message);
    if (!message || isSubmitting) return;

    setIsSubmitting(true);
    const negotiationId = `negotiate-${selectedItem.id}`;
    const newHistory = [
      ...negotiationHistory,
      { sender: "user", text: message }
    ];
    setNegotiationHistory(newHistory);
    setNegotiations(prev => ({ ...prev, [negotiationId]: { ...prev[negotiationId], history: newHistory } }));
    setNegotiationMessage("");
    if (negotiationInputRef.current) negotiationInputRef.current.style.height = "auto";

    // Simulate seller response
    setTimeout(() => {
      const sellerResponse = { sender: "other", text: `Thank you for your offer. We are reviewing it.` };
      setNegotiationHistory(prev => [...prev, sellerResponse]);
      setIsSubmitting(false);
      setSellerStatus("reviewing");
      setNegotiations(prev => ({
        ...prev,
        [negotiationId]: { ...prev[negotiationId], history: [...prev[negotiationId].history, sellerResponse], status: 'reviewing' }
      }));

      // Simulate further seller action
      setTimeout(() => {
        const originalPrice = selectedItem.price;
        let responseText = "";
        let newStatus = sellerStatus;
        let finalAcceptedPrice = acceptedPrice;

        if (!offer) {
          responseText = `Thanks for the message. Please include your preferred price per ${selectedItem.unit} so we can evaluate the offer.`;
          newStatus = "pending";
        } else if (offer >= originalPrice * 0.9) {
          responseText = `We accept your offer of ₱${offer.toFixed(2)}! Please proceed to confirm.`;
          newStatus = "accepted";
          finalAcceptedPrice = offer.toFixed(2);
        } else {
          const counter = (originalPrice * 0.95).toFixed(2);
          responseText = `Your offer is a bit low. Can you do ₱${counter}?`;
          newStatus = "countered";
        }
        const finalResponse = { sender: "other", text: responseText };
        setNegotiationHistory(prev => [...prev, finalResponse]);
        setSellerStatus(newStatus);
        if (finalAcceptedPrice) setAcceptedPrice(finalAcceptedPrice);
        setNegotiations(prev => ({
          ...prev,
          [negotiationId]: { ...prev[negotiationId], history: [...prev[negotiationId].history, finalResponse], status: newStatus, acceptedPrice: finalAcceptedPrice }
        }));
      }, 2500);

    }, 1500);
  };

  const handleMakeOffer = () => {
    const message = negotiationMessage.trim();
    const offer = extractOfferPrice(message);
    if (!message || isSubmitting) return;

    setIsSubmitting(true);
    const isRestaurant = modalType === 'restaurantOffer';
    const negotiationId = isRestaurant ? `restaurant-${selectedItem.id}` : `offer-${selectedItem.id}`;
    const newHistory = [
      ...negotiationHistory,
      { sender: "user", text: message }
    ];
    setNegotiationHistory(newHistory);
    setNegotiationMessage("");
    if (negotiationInputRef.current) negotiationInputRef.current.style.height = "auto";

    setNegotiations(prev => ({ ...prev, [negotiationId]: { ...prev[negotiationId], history: newHistory } }));

    // Simulate buyer response
    setTimeout(() => {
      const buyerResponse = { sender: "other", text: `Thank you for your offer. We are reviewing it.` };
      setNegotiationHistory(prev => [...prev, buyerResponse]);
      setIsSubmitting(false);
      setSellerStatus("reviewing");
      setNegotiations(prev => ({
        ...prev,
        [negotiationId]: { ...prev[negotiationId], history: [...prev[negotiationId].history, buyerResponse], status: 'reviewing' }
      }));

      // Simulate further buyer action
      setTimeout(() => {
        const targetPrice = selectedItem.targetPrice;
        let responseText = "";
        let newStatus = sellerStatus;
        let finalAcceptedPrice = acceptedPrice;

        if (!offer) {
          responseText = `Thanks for the message. Please include your supply price per ${selectedItem.unit} so we can evaluate the offer.`;
          newStatus = "pending";
        } else if (offer <= targetPrice * 1.1) {
          responseText = `We accept your offer of ₱${offer.toFixed(2)}! Please proceed to confirm the supply agreement.`;
          newStatus = "accepted";
          finalAcceptedPrice = offer.toFixed(2);
        } else {
          const counter = (targetPrice * 1.05).toFixed(2);
          responseText = `Your offer is a bit high for our budget. Can you do ₱${counter}?`;
          newStatus = "countered";
        }
        const finalResponse = { sender: "other", text: responseText };
        setNegotiationHistory(prev => [...prev, finalResponse]);
        setSellerStatus(newStatus);
        if (finalAcceptedPrice) setAcceptedPrice(finalAcceptedPrice);
        setNegotiations(prev => ({
          ...prev,
          [negotiationId]: { ...prev[negotiationId], history: [...prev[negotiationId].history, finalResponse], status: newStatus, acceptedPrice: finalAcceptedPrice }
        }));
      }, 2500);

    }, 1500);
  };

  const handleNegotiationKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    if (modalType === 'negotiate') {
      handleSendOffer();
    } else {
      handleMakeOffer();
    }
  };

  const handleNegotiationMessageChange = (e) => {
    setNegotiationMessage(e.target.value);
    if (negotiationInputRef.current) {
      negotiationInputRef.current.style.height = "auto";
      negotiationInputRef.current.style.height = `${Math.min(negotiationInputRef.current.scrollHeight, 92)}px`;
    }
  };

  const handleAcceptOffer = () => {
    if (sellerStatus === 'accepted') {
      setShowConfirmation(true);
    }
  };

  const handleConfirmPurchase = () => {
    setIsSubmitting(true);
    const negotiationId = `${modalType === 'restaurantOffer' ? 'restaurant' : modalType}-${selectedItem.id}`;
    // Simulate finalization
    setTimeout(() => {
      alert('Deal confirmed! You will be redirected to the order page.');
      
      // Mark the negotiation as completed/archived instead of deleting
      setNegotiations(prev => ({
        ...prev,
        [negotiationId]: { ...prev[negotiationId], status: 'completed' }
      }));
      setIsSubmitting(false);
      setSelectedItem(null); // This will close the modal
    }, 2000);
  };

  const handleDecline = () => {
    if (window.confirm('Are you sure you want to decline this negotiation? You can re-open it later.')) {
      const negotiationId = `${modalType}-${selectedItem.id}`;
      
      const newHistory = [...negotiationHistory, { sender: 'system', text: 'You have declined this negotiation.' }];
      setNegotiationHistory(newHistory);
      setSellerStatus('declined');

      setNegotiations(prev => {
        return { ...prev, [negotiationId]: { ...prev[negotiationId], history: newHistory, status: 'declined' } };
      });

      setSelectedItem(null); // Close the modal
    }
  };

  const handleReopen = () => {
    const negotiationId = `${modalType}-${selectedItem.id}`;
    const newHistory = [...negotiationHistory, { sender: 'system', text: 'Negotiation re-opened.' }];
    
    setNegotiationHistory(newHistory);
    setSellerStatus('pending'); // Reset status to pending
    setNegotiations(prev => ({ ...prev, [negotiationId]: { ...prev[negotiationId], history: newHistory, status: 'pending' } }));
  };

  const handleRestaurantAction = (demand, isCompleted) => {
      if (isCompleted) {
         setTrackingDelivery(demand);
      } else {
         openRestaurantNegotiationModal(demand);
      }
  };

  const sortedListings = useMemo(() => {
    let sortableItems = [...surplusListings];

    // Primary filter: Active vs. Archived
    if (filter === 'active') {
      sortableItems = sortableItems.filter(item => {
        const negotiation = negotiations[`negotiate-${item.id}`];
        return !negotiation || negotiation.status !== 'completed';
      });
    } else { // 'archived'
      sortableItems = sortableItems.filter(item => {
        const negotiation = negotiations[`negotiate-${item.id}`];
        return negotiation && negotiation.status === 'completed';
      });
    }

    // Secondary filter for 'active' tab
    if (filter === 'active' && showOngoingOnly) {
      sortableItems = sortableItems.filter(item => negotiations[`negotiate-${item.id}`] && negotiations[`negotiate-${item.id}`].status !== 'declined');
    }

    if (searchQuery) {
      sortableItems = sortableItems.filter(item =>
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems; // Renamed to filteredAndSortedListings for clarity
  }, [surplusListings, sortConfig, searchQuery]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (name) => sortConfig.key === name ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '';

  const handleListSurplusSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingSurplus(true);
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        ...newSurplus,
        farmer: "Your Farm", // Placeholder for logged-in user
        status: "Available"
      };
      setSurplusListings(prev => [newItem, ...prev]);
      setIsSubmittingSurplus(false);
      setShowListSurplusModal(false);
      setNewSurplus({ product: "", quantity: "", unit: "kg", price: "", location: "", description: "" });
    }, 1500);
  };

  const handleNewSurplusChange = (field, value) => {
    setNewSurplus(prev => ({ ...prev, [field]: value }));
  };

  const handleNewDemandChange = (field, value) => {
    setNewDemand(prev => ({ ...prev, [field]: value }));
  };

  const handlePostDemandSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingDemand(true);
    setTimeout(() => {
      const newItem = { id: Date.now(), ...newDemand, verified: true, logo: "🏢" };
      setRestaurantDemands(prev => [newItem, ...prev]);
      setIsSubmittingDemand(false);
      setShowPostDemandModal(false);
      setNewDemand({ product: "", quantity: "", unit: "kg", targetPrice: "", location: "", neededDate: "", restaurant: "My Restaurant" });
    }, 1500);
  };

  const handleRestaurantOfferChange = (field, value) => {
    setRestaurantOffer(prev => ({ ...prev, [field]: value }));
  };

  const handleRestaurantOfferSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingDemandOffer(true);
    setTimeout(() => {
      setIsSubmittingDemandOffer(false);
      setShowRestaurantOfferModal(false);
      setRestaurantOffer({ price: "", quantity: "", deliveryDate: "", message: "" });
      alert("Offer sent successfully!");
    }, 1500);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button style={styles.backBtn} onClick={() => setActiveNav(isMobile ? "Home" : "ServicesPage")}><FaArrowLeft /></button>
        </div>
        <div className="inner-blur-glass" style={styles.badge}><span style={styles.badgeDot} /><span>B2B Marketplace</span></div>
      </div>
      <h1 style={styles.title}>Surplus <span style={styles.accent}>Exchange Dashboard</span></h1>
      
      <div style={styles.tabContainer}>
        <button style={{ ...styles.tabButton, ...(activeTab === "listings" ? styles.tabButtonActive : {}), ...(hoveredTab === "listings" && activeTab !== "listings" ? styles.tabButtonHover : {}) }} onMouseEnter={() => setHoveredTab("listings")} onMouseLeave={() => setHoveredTab(null)} onClick={() => setActiveTab("listings")}>Listings</button>
        <button style={{ ...styles.tabButton, ...(activeTab === "restaurantDemand" ? styles.tabButtonActive : {}), ...(hoveredTab === "restaurantDemand" && activeTab !== "restaurantDemand" ? styles.tabButtonHover : {}) }} onMouseEnter={() => setHoveredTab("restaurantDemand")} onMouseLeave={() => setHoveredTab(null)} onClick={() => setActiveTab("restaurantDemand")}>Establishment Demands</button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      
      <div style={styles.filterContainer}>
        <div style={styles.mainFilterGroup}>
          <button onClick={() => setFilter('active')} style={filter === 'active' ? styles.mainFilterActive : styles.mainFilter}>Active</button>
          <button onClick={() => setFilter('archived')} style={filter === 'archived' ? styles.mainFilterActive : styles.mainFilter}>Archived</button>
        </div>
        {filter === 'active' && (
          <label style={styles.filterLabel}>
            <input
              type="checkbox"
              checked={showOngoingOnly}
              onChange={() => setShowOngoingOnly(!showOngoingOnly)}
              style={styles.filterCheckbox}
            />
            Show only ongoing negotiations
          </label>
        )}
      </div>

      {activeTab !== 'restaurantDemand' && (
      <div className="inner-blur-glass" style={styles.tableWrapper}>
        {activeTab === 'listings' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => requestSort('product')}>Product{getSortIndicator('product')}</th>
                <th style={styles.th} onClick={() => requestSort('quantity')}>Qty{getSortIndicator('quantity')}</th>
                {!isMobile && <th style={styles.th} onClick={() => requestSort('price')}>Price{getSortIndicator('price')}</th>}
                <th style={{...styles.th, cursor: 'default'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map(item => (
                (() => {
                  const negotiationId = `negotiate-${item.id}`;
                  const negotiationState = negotiations[negotiationId];
                  const isCompleted = negotiationState?.status === 'completed';
                  const isDeclined = negotiationState?.status === 'declined';
                  const hasOngoingNegotiation = negotiationState && !isDeclined && !isCompleted;
                  return (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>{item.product}</td>
                      <td style={styles.td}>{item.quantity}{item.unit}</td>
                      {!isMobile && <td style={styles.td}>₱{item.price}</td>}
                      <td style={styles.td}><button style={{...styles.tableActionBtn, ...(isDeclined ? styles.reopenBtnSmall : {}), ...(isCompleted ? styles.viewArchiveBtn : {})}} onClick={() => openNegotiateModal(item)}>{isCompleted ? 'View Archive' : isDeclined ? 'Re-open' : hasOngoingNegotiation ? 'Continue' : 'Negotiate'}</button>{hasOngoingNegotiation && <span style={styles.ongoingIndicator}>Ongoing</span>}{isDeclined && <span style={styles.declinedIndicator}>Declined</span>}{isCompleted && <span style={styles.completedIndicator}>Completed</span>}</td>
                    </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {activeTab === 'restaurantDemand' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '10px 0' }}>
           {/* Analytics Cards */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="inner-blur-glass" style={{ ...styles.restaurantCard, padding: '20px', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#15803d' }}><FaChartLine /></div>
                 <h3 style={{ margin: '4px 0', fontSize: '24px', fontWeight: 800 }}>₱1.2M</h3>
                 <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>Total Open Demand</span>
              </div>
              <div className="inner-blur-glass" style={{ ...styles.restaurantCard, padding: '20px', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#0ea5e9' }}><FaHandshake /></div>
                 <h3 style={{ margin: '4px 0', fontSize: '24px', fontWeight: 800 }}>15</h3>
                 <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>Active Institutional Buyers</span>
              </div>
              <div className="inner-blur-glass" style={{ ...styles.restaurantCard, padding: '20px', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#d97706' }}><FaWeightHanging /></div>
                 <h3 style={{ margin: '4px 0', fontSize: '24px', fontWeight: 800 }}>850 kg</h3>
                 <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>Volume Needed This Week</span>
              </div>
           </div>

           {/* Advanced Filters */}
           <div className="inner-blur-glass" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))', padding: '16px 24px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <span style={{ fontSize: '15px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}><FaFilter /> Filters:</span>
               <div style={{ width: '180px', zIndex: 100 }}>
                 <CustomDropdown 
                    options={["All Categories", "Vegetables", "Herbs"]} 
                    value={categoryFilter} 
                    onChange={setCategoryFilter} 
                 />
               </div>
               <div style={{ width: '180px', zIndex: 99 }}>
                 <CustomDropdown 
                    options={["All Locations", "Makati City", "BGC, Taguig", "Quezon City"]} 
                    value={locationFilter} 
                    onChange={setLocationFilter} 
                 />
               </div>
               <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#000' }} onClick={(e) => { e.preventDefault(); setUrgentOnly(!urgentOnly); }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: urgentOnly ? 'none' : '2px solid rgba(0,0,0,0.2)', background: urgentOnly ? 'linear-gradient(135deg, #4ade80, #16a34a)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: urgentOnly ? '0 4px 10px rgba(34,197,94,0.3)' : 'none' }}>
                     {urgentOnly && <FaCheckCircle color="#fff" size={12} />}
                  </div>
                  Urgent Only
               </label>
           </div>

         <div style={styles.restaurantGrid}>
          {restaurantDemands.filter(req => {
            const matchesSearch = req.product.toLowerCase().includes(searchQuery.toLowerCase()) || req.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = locationFilter === "All Locations" || req.location.includes(locationFilter);
            const matchesUrgent = urgentOnly ? req.urgent === true : true;
            return matchesSearch && matchesLocation && matchesUrgent;
          }).map(demand => (
            <div key={demand.id} className="inner-blur-glass" style={styles.restaurantCard} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)'; }}>
               <div style={styles.restaurantCardHeader}>
                  <div style={styles.restaurantLogo}>{demand.logo}</div>
                  <div style={{ flex: 1 }}>
                     <div style={styles.restaurantNameWrap}>
                       <h3 style={styles.restaurantName}>{demand.restaurant}</h3>
                       {demand.verified && <FaCheckCircle style={styles.verifiedBadge} title="Verified Buyer" />}
                     </div>
                     <span style={styles.restaurantLocation}><FaMapMarkerAlt /> {demand.location}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                     <div style={{ background: demand.matchScore > 90 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: demand.matchScore > 90 ? '#15803d' : '#b45309', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                        {demand.matchScore}% Match
                     </div>
                     {demand.urgent && (
                       <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Urgent
                       </div>
                     )}
                  </div>
               </div>
               <div style={styles.restaurantCardBody}>
                  <div style={styles.demandItem}>
                     <span style={styles.demandLabel}>Needs:</span>
                     <span style={styles.demandValue}>{demand.product}</span>
                  </div>
                  <div style={styles.demandRow}>
                     <div style={styles.demandItem}>
                       <span style={styles.demandLabel}>Quantity:</span>
                       <span style={styles.demandValue}>{demand.quantity} {demand.unit}</span>
                     </div>
                     <div style={styles.demandItem}>
                       <span style={styles.demandLabel}>Target Price:</span>
                       <span style={styles.demandValueHighlight}>₱{demand.targetPrice}/{demand.unit}</span>
                     </div>
                  </div>
                  <div style={styles.demandItem}>
                     <span style={styles.demandLabel}>Needed By:</span>
                     <span style={styles.demandDate}><FaCalendarAlt /> {demand.neededDate}</span>
                  </div>
               </div>
               {(()=>{
                  const negotiationId = `restaurant-${demand.id}`;
                  const negotiationState = negotiations[negotiationId];
                  const isCompleted = negotiationState?.status === 'completed';
                  const isDeclined = negotiationState?.status === 'declined';
                  const hasOngoingNegotiation = negotiationState && !isDeclined && !isCompleted;
                  
                  return (
                     <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexDirection: 'column' }}>
                        <button style={{...styles.sendOfferBtnCard, ...(isDeclined ? styles.reopenBtnSmall : {})}} 
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(34,197,94,0.3)'; }} 
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.2)'; }} 
                                onClick={() => handleRestaurantAction(demand, isCompleted)}>
                           {isCompleted ? 'Track Delivery' : isDeclined ? 'Re-open Negotiation' : hasOngoingNegotiation ? 'Continue Negotiation' : 'Negotiate / Send Offer'}
                        </button>
                        {(hasOngoingNegotiation || isCompleted) && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', background: isCompleted ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isCompleted ? '#0284c7' : '#059669', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                            {isCompleted ? 'Preparing Delivery' : 'Ongoing Negotiation'}
                          </div>
                        )}
                     </div>
                  );
               })()}
            </div>
          ))}
         </div>
        </div>
      )}

      <button style={styles.floatingActionBtn} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => activeTab === 'restaurantDemand' ? setShowPostDemandModal(true) : setShowListSurplusModal(true)}>
        <FaPlusCircle /> {activeTab === 'restaurantDemand' ? 'Post Demand' : 'List Surplus'}
      </button>

      {selectedItem && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className="inner-blur-glass custom-scrollbar" style={{...styles.negotiateModalContent, ...(isMobile ? styles.negotiateModalContentMobile : {})}} onClick={e => e.stopPropagation()}>
            <div style={styles.negotiationHeader}>
              <h2 style={styles.negotiationTitle}>{modalType === 'negotiate' ? 'Negotiate Price' : 'Make an Offer'}</h2>
              <button style={styles.saveAndCloseBtn} onClick={() => setSelectedItem(null)}>Save & Close</button>
            </div>
            
            <div style={styles.negotiateProductSummary}>
              <div style={{...styles.negotiateProductIcon, ...(isMobile ? styles.negotiateProductIconMobile : {})}}>{modalType === 'negotiate' ? '🍅' : '🥕'}</div>
              <div style={styles.negotiateProductDetails}>
                <h3 style={styles.negotiateProductTitle}>{selectedItem.product}</h3>
                <p style={styles.negotiateProductFarmer}>
                  {modalType === 'negotiate' ? `from ${selectedItem.farmer}` : `requested by ${selectedItem.buyer}`}
                </p>
              </div>
              <div style={styles.negotiatePriceInfo}>
                <span style={styles.negotiateOriginalPriceLabel}>{modalType === 'negotiate' ? 'Original Price' : 'Target Price'}</span>
                <span style={styles.negotiateOriginalPrice}>
                  {modalType === 'negotiate' ? `₱${selectedItem.price}/${selectedItem.unit}` : `~₱${selectedItem.targetPrice}/${selectedItem.unit}`}
                </span>
              </div>
            </div>

            {showConfirmation ? (
              <div style={styles.confirmationView}>
                <h3 style={styles.confirmationTitle}>
                  {modalType === 'negotiate' ? 'Confirm Your Purchase' : 'Confirm Supply Agreement'}
                </h3>
                <div style={styles.confirmationSummary}>
                  <p style={{ margin: '0 0 12px', color: 'rgba(0,0,0,0.7)' }}>You are agreeing to {modalType === 'negotiate' ? 'purchase' : 'supply'}:</p>
                  <div style={styles.summaryItem}><strong>Product:</strong> {selectedItem.product}</div>
                  <div style={styles.summaryItem}><strong>Quantity:</strong> {selectedItem.quantity}{selectedItem.unit}</div>
                  <div style={styles.summaryItem}><strong>Agreed Price:</strong> ₱{acceptedPrice}/{selectedItem.unit}</div>
                  <div style={styles.summaryTotal}>
                    <strong>Total: ₱{(acceptedPrice * selectedItem.quantity).toFixed(2)}</strong>
                  </div>
                </div>
                <div style={styles.confirmationActions}>
                  <button style={styles.confirmationBackBtn} onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>
                    Back to Chat
                  </button>
                  <button style={styles.confirmationConfirmBtn} onClick={handleConfirmPurchase} disabled={isSubmitting}>
                    {isSubmitting ? 'Finalizing...' : (modalType === 'negotiate' ? 'Confirm & Pay' : 'Finalize Agreement')}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
                <div style={styles.negotiateChatContainer} className="custom-scrollbar">
                  {negotiationHistory.map((msg, index) => (
                    <div key={index} style={{...styles.chatBubble, ...(
                      msg.sender === 'user' ? styles.chatBubbleBuyer :
                      msg.sender === 'other' ? styles.chatBubbleSeller :
                      styles.chatBubbleSystem
                    )}}>
                      {msg.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                {sellerStatus === 'completed' ? (
                  <div style={styles.archivedNotice}>
                    <FaCheckCircle style={{ color: '#16a34a', fontSize: '24px' }} />
                    <p>This negotiation was successfully completed and is now archived.</p>
                  </div>
                ) : sellerStatus === 'declined' ? (
                  <div style={styles.reopenContainer}>
                    <p style={styles.reopenText}>This negotiation was declined.</p>
                    <button style={styles.reopenBtn} onClick={handleReopen}>Re-open Negotiation</button>
                  </div>
                ) : (
                    <div style={{...styles.negotiateInputArea, ...(isMobile ? styles.negotiateInputAreaMobile : {})}}>
                      <div style={styles.negotiationQuickPanel}>
                        <div style={styles.quickPriceRow}>
                          <span style={styles.quickPriceLabel}>Quick prices</span>
                          {getQuickPrices().map(price => (
                            <button key={price} style={styles.quickPricePill} onClick={() => setNegotiationDraft(buildQuickPriceMessage(price))}>
                              ₱{price}
                            </button>
                          ))}
                        </div>
                        <div style={styles.quickPromptRow}>
                          {getQuickMessages().map(message => (
                            <button key={message} style={styles.quickPromptBtn} onClick={() => setNegotiationDraft(message)}>
                              {message}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.messageInputWrapper}>
                        <button type="button" style={{...styles.chatIconButton, ...(isMobile ? styles.chatIconButtonMobile : {})}} aria-label="Voice input">
                          <FaMicrophone />
                        </button>
                        <button type="button" style={{...styles.chatIconButton, ...(isMobile ? styles.chatIconButtonMobile : {})}} aria-label="Attach image">
                          <FaImage />
                        </button>
                        <textarea
                          ref={negotiationInputRef}
                          id="offer-input"
                          className="custom-scrollbar"
                          rows={1}
                          style={{...styles.negotiationInput, ...(isMobile ? styles.negotiationInputMobile : {})}}
                          placeholder={modalType === 'negotiate' ? "Write your message to the seller..." : "Write your message to the buyer..."}
                          value={negotiationMessage}
                          onChange={handleNegotiationMessageChange}
                          onKeyDown={handleNegotiationKeyDown}
                          disabled={isSubmitting || sellerStatus === 'accepted'}
                        />
                        <button style={{...styles.sendOfferBtn, ...(isMobile ? styles.sendOfferBtnMobile : {})}} onClick={modalType === 'negotiate' ? handleSendOffer : handleMakeOffer} disabled={isSubmitting || sellerStatus === 'accepted' || !negotiationMessage.trim()}>
                          {isSubmitting ? "..." : <FaPaperPlane />}
                        </button>
                      </div>
                    </div>
                )}
              </div>
            )}

            <div style={styles.negotiateActions}>
              <button style={{...styles.declineBtn, opacity: isSubmitting || sellerStatus === 'declined' || sellerStatus === 'completed' ? 0.5 : 1}} onClick={handleDecline} disabled={isSubmitting || sellerStatus === 'declined' || sellerStatus === 'completed'}>Decline</button>
              <button style={{...styles.counterBtn, opacity: sellerStatus === 'accepted' || sellerStatus === 'declined' || sellerStatus === 'completed' ? 0.5 : 1}} disabled={sellerStatus === 'accepted' || sellerStatus === 'declined' || sellerStatus === 'completed'} onClick={() => { const input = document.getElementById('offer-input'); if (input) input.focus(); }}>Counter Offer</button>
              <button style={{...styles.acceptBtn, opacity: sellerStatus !== 'accepted' ? 0.5 : 1}} disabled={sellerStatus !== 'accepted'} onClick={handleAcceptOffer}>
                {modalType === 'negotiate' ? 'Accept & Checkout' : 'Confirm Supply'}
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {showListSurplusModal && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowListSurplusModal(false)}>
          <div className="inner-blur-glass custom-scrollbar" style={{...styles.listSurplusModalContent, ...(isMobile ? styles.listSurplusModalContentMobile : {})}} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowListSurplusModal(false)}><FaTimes /></button>
            <h2 style={styles.modalTitle}>List New Surplus</h2>
            <form onSubmit={handleListSurplusSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Product Name</label>
                <input type="text" style={styles.inputField} value={newSurplus.product} onChange={e => handleNewSurplusChange('product', e.target.value)} required />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{...styles.inputGroup, flex: 2}}>
                  <label style={styles.inputLabel}>Quantity</label>
                  <input type="number" style={styles.inputField} value={newSurplus.quantity} onChange={e => handleNewSurplusChange('quantity', e.target.value)} required />
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.inputLabel}>Unit</label>
                  <CustomDropdown 
                    options={["kg", "ton", "pcs", "crates"]} 
                    value={newSurplus.unit} 
                    onChange={(val) => handleNewSurplusChange('unit', val)} 
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Price (per unit)</label>
                <input type="number" style={styles.inputField} value={newSurplus.price} onChange={e => handleNewSurplusChange('price', e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Location</label>
                <input type="text" style={styles.inputField} value={newSurplus.location} onChange={e => handleNewSurplusChange('location', e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Description</label>
                <textarea style={styles.textareaField} value={newSurplus.description} onChange={e => handleNewSurplusChange('description', e.target.value)} />
              </div>
              <button type="submit" style={styles.submitBtn} disabled={isSubmittingSurplus}>
                {isSubmittingSurplus ? "Submitting..." : "Submit Listing"}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showRestaurantOfferModal && selectedDemand && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowRestaurantOfferModal(false)}>
          <div className="inner-blur-glass custom-scrollbar" style={{...styles.listSurplusModalContent, ...(isMobile ? styles.listSurplusModalContentMobile : {})}} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowRestaurantOfferModal(false)}><FaTimes /></button>
            <h2 style={styles.modalTitle}>Send Offer to {selectedDemand.restaurant}</h2>
            
            <div style={styles.negotiateProductSummary}>
              <div style={{fontSize: '32px'}}>{selectedDemand.logo}</div>
              <div>
                <h3 style={styles.negotiateProductTitle}>{selectedDemand.product}</h3>
                <p style={styles.negotiateProductFarmer}>Target: ₱{selectedDemand.targetPrice} / {selectedDemand.unit}</p>
              </div>
            </div>

            <form onSubmit={handleRestaurantOfferSubmit} style={styles.form}>
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.inputLabel}>Offered Price (per {selectedDemand.unit})</label>
                  <input type="number" style={styles.inputField} value={restaurantOffer.price} onChange={e => handleRestaurantOfferChange('price', e.target.value)} required placeholder={`e.g. ${selectedDemand.targetPrice}`} />
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.inputLabel}>Available Quantity ({selectedDemand.unit})</label>
                  <input type="number" style={styles.inputField} value={restaurantOffer.quantity} onChange={e => handleRestaurantOfferChange('quantity', e.target.value)} required placeholder={`Max: ${selectedDemand.quantity}`} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Delivery Date</label>
                <input type="date" style={styles.inputField} value={restaurantOffer.deliveryDate} onChange={e => handleRestaurantOfferChange('deliveryDate', e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Message to Buyer</label>
                <textarea style={styles.textareaField} value={restaurantOffer.message} onChange={e => handleRestaurantOfferChange('message', e.target.value)} placeholder="Describe your produce quality, farming methods, etc." />
              </div>
              <button type="submit" style={styles.submitBtn} disabled={isSubmittingDemandOffer}>
                {isSubmittingDemandOffer ? "Sending Offer..." : "Submit Offer"}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showPostDemandModal && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowPostDemandModal(false)}>
          <div className="inner-blur-glass custom-scrollbar" style={{...styles.listSurplusModalContent, ...(isMobile ? styles.listSurplusModalContentMobile : {})}} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowPostDemandModal(false)}><FaTimes /></button>
            <h2 style={styles.modalTitle}>Post a Product Demand</h2>
            <form onSubmit={handlePostDemandSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Product Needed</label>
                <input type="text" style={styles.inputField} value={newDemand.product} onChange={e => handleNewDemandChange('product', e.target.value)} required placeholder="e.g. Organic Romaine Lettuce" />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{...styles.inputGroup, flex: 2}}>
                  <label style={styles.inputLabel}>Quantity Needed</label>
                  <input type="number" style={styles.inputField} value={newDemand.quantity} onChange={e => handleNewDemandChange('quantity', e.target.value)} required />
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.inputLabel}>Unit</label>
                  <CustomDropdown options={["kg", "ton", "pcs", "crates"]} value={newDemand.unit} onChange={(val) => handleNewDemandChange('unit', val)} />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Target Price (per unit)</label>
                <input type="number" style={styles.inputField} value={newDemand.targetPrice} onChange={e => handleNewDemandChange('targetPrice', e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Delivery Location</label>
                <input type="text" style={styles.inputField} value={newDemand.location} onChange={e => handleNewDemandChange('location', e.target.value)} required placeholder="e.g. Makati City" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Needed By Date</label>
                <input type="date" style={styles.inputField} value={newDemand.neededDate} onChange={e => handleNewDemandChange('neededDate', e.target.value)} required />
              </div>
              <button type="submit" style={styles.submitBtn} disabled={isSubmittingDemand}>{isSubmittingDemand ? "Posting..." : "Post Demand"}</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Tracking Delivery Modal */}
      {trackingDelivery && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setTrackingDelivery(null)}>
          <div className="inner-blur-glass" style={{ ...styles.negotiateModalContent, ...(isMobile ? styles.negotiateModalContentMobile : {}), maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setTrackingDelivery(null)}><FaTimes /></button>
            <h2 style={{ ...styles.modalTitle, margin: '0 0 20px', textAlign: 'center' }}>Delivery Tracking</h2>
            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>{trackingDelivery.product}</h3>
               <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', margin: '0 0 16px' }}>To: {trackingDelivery.restaurant}</p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#16a34a' }} />
                  <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                     <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}><FaCheckCircle /></div>
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Agreement Confirmed</div>
                        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>Today, 10:00 AM</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                     <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 0 0 4px rgba(22, 163, 74, 0.2)' }}><span style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} /></div>
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>Preparing for Dispatch</div>
                        <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Estimated Delivery: Tomorrow</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1, opacity: 0.4 }}>
                     <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>In Transit</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1, opacity: 0.4 }}>
                     <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Delivered</div>
                     </div>
                  </div>
               </div>
               
               <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '16px', border: '1px solid rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛵</div>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: '15px', fontWeight: 800, color: '#000', marginBottom: '2px' }}>Rider: Juan Perez</div>
                     <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 700 }}>0912 345 6789</div>
                     <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', fontWeight: 500, marginTop: '2px' }}>Honda Click • ABC-1234</div>
                  </div>
               </div>
            </div>
            <button style={styles.saveAndCloseBtn} onClick={() => setTrackingDelivery(null)}>Close Tracker</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  headerRow: { display: "flex", width: "100%", justifyContent: "center", alignItems: 'center', position: 'relative', marginBottom: "20px" },
  backBtnWrap: { position: 'absolute', left: 0 },
  backBtn: { padding: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer" },
  badge: { display: 'flex', alignItems: 'center', gap: '7px', padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", color: "#15803d", fontWeight: 600, fontSize: "11px" },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)", display: "inline-block" },
  title: { fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, margin: "10px 0" },
  titleMobile: { fontSize: "clamp(20px, 6vw, 30px)" }, // Smaller title on mobile
  accent: { color: "#15803d" }, // Kept accent for consistency
  tabContainer: { display: "flex", gap: "10px", marginBottom: "24px", padding: "5px", background: "rgba(255,255,255,0.4)", borderRadius: "999px" },
  tabButton: { padding: "8px 20px", borderRadius: "999px", border: "1px solid transparent", background: "transparent", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease" },
  tabButtonActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))",
    border: "1px solid rgba(134,239,172,0.4)",
    color: "#064e3b",
    boxShadow: "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },
  tabButtonHover: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))",
    color: "#064e3b",
    boxShadow: "0 4px 12px rgba(34,197,94,0.08)",
  },
  tableWrapper: { width: "100%", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.4)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px", color: "#15803d", fontSize: "13px", borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: 'pointer', userSelect: 'none' },
  td: { padding: "16px", fontSize: "14px", borderBottom: "1px solid rgba(0,0,0,0.02)" },
  tableActionBtn: { padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", cursor: "pointer", fontWeight: 700, boxShadow: "0 18px 38px rgba(34,197,94,0.26)", transition: "all 0.2s ease" },
  floatingActionBtn: { marginTop: "24px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26)", fontSize: "14px", transition: "all 0.2s ease" }, 
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.3s ease", padding: "20px", boxSizing: "border-box" },
  negotiateModalContent: { maxWidth: "880px", width: "100%", maxHeight: "calc(100vh - 40px)", background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(240,253,244,0.93))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleUp 0.4s cubic-bezier(.22,1,.36,1)", overflow: "hidden", boxSizing: "border-box" },
  negotiateModalContentMobile: { padding: "16px", maxHeight: "calc(100vh - 24px)", borderRadius: "18px" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", zIndex: 50, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "background 0.2s ease" },
  negotiationHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" },
  negotiationTitle: { margin: 0, color: "#000", fontSize: "18px", fontWeight: 800, lineHeight: 1.2, textAlign: "left" },
  negotiateProductSummary: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.78)", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "10px", minWidth: 0 },
  negotiateProductIcon: { width: "42px", height: "42px", flexShrink: 0, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(21,128,61,0.08)", fontSize: "28px" },
  negotiateProductIconMobile: { width: "38px", height: "38px", fontSize: "24px" },
  negotiateProductDetails: { minWidth: 0, flex: 1 },
  negotiateProductTitle: { fontSize: "16px", fontWeight: 800, margin: 0, color: "#000", lineHeight: 1.25 },
  negotiateProductFarmer: { fontSize: "13px", color: "rgba(0,0,0,0.6)", margin: 0 },
  negotiatePriceInfo: { marginLeft: "auto", textAlign: "right", flexShrink: 0 },
  negotiateOriginalPriceLabel: { display: "block", fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" },
  negotiateOriginalPrice: { display: "block", fontSize: "14px", fontWeight: 800, color: "#15803d", lineHeight: 1.2 },
  negotiateChatContainer: { flex: "1 1 auto", minHeight: "160px", maxHeight: "230px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", padding: "14px 4px 14px 0", background: "transparent" },
  chatBubble: { maxWidth: "85%", padding: "12px 14px", borderRadius: "16px", lineHeight: 1.5, fontSize: "13px" },
  chatBubbleSystem: { alignSelf: "center", background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", fontWeight: 500, fontSize: "11px", fontStyle: "italic" },
  chatBubbleBuyer: { alignSelf: "flex-end", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", borderBottomRightRadius: "4px" },
  chatBubbleSeller: { alignSelf: "flex-start", background: "#fff", color: "#000", border: "1px solid rgba(21,128,61,0.15)", borderBottomLeftRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  negotiateInputArea: { width: "100%", display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "18px", overflow: "hidden", background: "rgba(255,255,255,0.38)", boxSizing: "border-box" },
  negotiateInputAreaMobile: { borderRadius: "16px" },
  negotiationQuickPanel: { padding: "10px 12px", background: "rgba(249,250,251,0.18)", backdropFilter: "none", WebkitBackdropFilter: "none", borderTop: "1px solid rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "8px", boxSizing: "border-box" },
  quickPriceRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", width: "100%", minHeight: "28px" },
  quickPriceLabel: { marginRight: "2px", color: "#15803d", fontSize: "11px", fontWeight: 800, lineHeight: 1.2, whiteSpace: "nowrap" },
  quickPricePill: { height: "26px", padding: "0 10px", borderRadius: "999px", background: "#ffffff", border: "1px solid rgba(21,128,61,0.22)", color: "#15803d", fontSize: "12px", lineHeight: "24px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s ease" },
  quickPromptRow: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px", maxHeight: "104px", overflowY: "auto", paddingRight: "2px", width: "100%", boxSizing: "border-box" },
  quickPromptBtn: { width: "100%", minWidth: 0, padding: "7px 10px", borderRadius: "12px", background: "rgba(255,255,255,0.68)", border: "1px solid rgba(21,128,61,0.14)", color: "#374151", fontSize: "11px", lineHeight: 1.25, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", textAlign: "left", whiteSpace: "normal", boxSizing: "border-box" },
  messageInputWrapper: { padding: "12px", background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.05)", display: "grid", gridTemplateColumns: "38px 38px minmax(0, 1fr) 44px", gap: "10px", alignItems: "end", width: "100%", boxSizing: "border-box" },
  chatIconButton: { width: "38px", height: "38px", flexShrink: 0, borderRadius: "50%", border: "none", background: "transparent", color: "#6b7280", fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s, color 0.2s" },
  chatIconButtonMobile: { width: "34px", height: "34px", fontSize: "15px" },
  negotiationInput: { flex: 1, minWidth: 0, height: "44px", minHeight: "44px", maxHeight: "92px", padding: "11px 14px", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.1)", background: "#f3f4f6", color: "#111827", fontSize: "14px", outline: "none", resize: "none", overflowY: "auto", lineHeight: 1.45, fontFamily: "inherit", transition: "border-color 0.2s, background 0.2s", boxSizing: "border-box" },
  negotiationInputMobile: { height: "40px", minHeight: "40px", padding: "9px 12px", fontSize: "13px" },
  sendOfferBtn: { width: "44px", height: "44px", flexShrink: 0, borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease, box-shadow 0.2s ease", fontWeight: 700 },
  sendOfferBtnMobile: { width: "40px", height: "40px" },
  negotiateActions: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "10px" },
  declineBtn: { flex: "1 1 110px", minHeight: "38px", padding: "9px 10px", borderRadius: "12px", background: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  counterBtn: { flex: "1 1 110px", minHeight: "38px", padding: "9px 10px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  acceptBtn: { flex: "1 1 132px", minHeight: "38px", padding: "9px 10px", borderRadius: "12px", background: "linear-gradient(135deg, #4ade80, #22c55e)", color: "#fff", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(34,197,94,0.3)" },
  completedIndicator: { marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: '#6b7280', background: 'rgba(107, 114, 128, 0.1)', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(107, 114, 128, 0.2)' },
  viewArchiveBtn: { background: "rgba(107, 114, 128, 0.1)", color: "#4b5563", border: "1px solid rgba(107, 114, 128, 0.2)" },
  ongoingIndicator: { marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' },
  declinedIndicator: { marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: '#dc2626', background: 'rgba(220, 38, 38, 0.1)', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(220, 38, 38, 0.2)' },
  confirmationView: { padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, animation: "fadeIn 0.5s ease-out" },
  confirmationTitle: { fontSize: "20px", fontWeight: 800, color: "#000", marginBottom: "16px" },
  confirmationSummary: { background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "16px", marginBottom: "24px", textAlign: "left" },
  summaryItem: { fontSize: "14px", color: "rgba(0,0,0,0.8)", marginBottom: "8px" },
  summaryTotal: { fontSize: "18px", fontWeight: 800, color: "#15803d", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.1)" },
  confirmationActions: { display: "flex", gap: "12px", justifyContent: "center" },
  confirmationBackBtn: { padding: "12px 24px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" },
  confirmationConfirmBtn: { padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #4ade80, #22c55e)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(34,197,94,0.3)" },
  archivedNotice: { padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "rgba(22, 163, 74, 0.05)", borderRadius: "16px", border: "1px solid rgba(22, 163, 74, 0.2)", flex: 1 },
  reopenContainer: { padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "rgba(234, 179, 8, 0.05)", borderRadius: "16px", border: "1px solid rgba(234, 179, 8, 0.2)" },
  reopenText: { fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.7)", margin: 0 },
  reopenBtn: { padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #facc15, #eab308)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)" },
  reopenBtnSmall: { background: "linear-gradient(135deg, #facc15, #eab308)", color: "#fff", border: "none" },
  searchBarContainer: {
    width: "100%", maxWidth: "600px", marginBottom: "20px",
  },
  searchInput: {
    width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.7)",
    fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease", fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  filterContainer: { display: "flex", justifyContent: "space-between", alignItems: 'center', width: "100%", maxWidth: "1100px", marginBottom: "16px" },
  mainFilterGroup: { display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)' },
  mainFilter: { padding: '6px 16px', borderRadius: '8px', border: 'none', background: 'transparent', fontWeight: 600, fontSize: '13px', color: 'rgba(0,0,0,0.6)', cursor: 'pointer' },
  mainFilterActive: { padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', fontWeight: 700, fontSize: '13px', color: '#15803d', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  filterLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.7)", cursor: "pointer" },
  filterCheckbox: { width: "16px", height: "16px", accentColor: "#16a34a" },
  listSurplusModalContent: {
    maxWidth: "540px", width: "100%", maxHeight: "90vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto", textAlign: "left", boxSizing: "border-box",
  },
  listSurplusModalContentMobile: {
    padding: "24px 16px"
  },
  modalTitle: {
    fontSize: "24px", fontWeight: 800, color: "#000", margin: "0 0 20px", lineHeight: 1.2, letterSpacing: "-0.5px", textAlign: 'center'
  },
  form: {
    display: "flex", flexDirection: "column", gap: "16px"
  },
  inputGroup: {
    display: "flex", flexDirection: "column", gap: "6px"
  },
  inputLabel: {
    fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "4px"
  },
  inputField: {
    width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease", fontFamily: "inherit"
  },
  textareaField: {
    width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease", fontFamily: "inherit",
    height: '100px',
    resize: 'vertical'
  },
  submitBtn: {
    marginTop: "8px", padding: "16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)", transition: "all 0.2s ease"
  },
  saveAndCloseBtn: { padding: "8px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", color: "#000", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s ease" },
  customDropdownWrap: { position: "relative", width: "100%" },
  customDropdownHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255, 255, 255, 0.8)", fontSize: "14px", color: "#000", cursor: "pointer", transition: "all 0.2s ease", outline: "none", textAlign: "left", boxSizing: "border-box", fontFamily: "inherit" },
  customDropdownHeaderActive: { borderColor: "#16a34a", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)", background: "rgba(255, 255, 255, 0.95)" },
  customDropdownList: { position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.2)", padding: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", maxHeight: "200px", overflowY: "auto", animation: "fadeIn 0.2s ease" },
  customDropdownItem: { padding: "10px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s ease" },
  customDropdownItemActive: { background: "rgba(34, 197, 94, 0.12)", color: "#15803d", fontWeight: 700 },
  restaurantGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", width: "100%", padding: "10px 0" },
  restaurantCard: { background: "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(240,253,244,0.7))", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", transition: "transform 0.3s ease, box-shadow 0.3s ease" },
  restaurantCardHeader: { display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" },
  restaurantLogo: { width: "56px", height: "56px", borderRadius: "16px", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  restaurantNameWrap: { display: "flex", alignItems: "center", gap: "6px" },
  restaurantName: { fontSize: "18px", fontWeight: 800, color: "#000", margin: 0 },
  verifiedBadge: { color: "#16a34a", fontSize: "14px" },
  restaurantLocation: { fontSize: "13px", color: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontWeight: 500 },
  restaurantCardBody: { display: "flex", flexDirection: "column", gap: "16px", flex: 1 },
  demandItem: { display: "flex", flexDirection: "column", gap: "4px" },
  demandRow: { display: "flex", justifyContent: "space-between", gap: "12px", background: "rgba(255,255,255,0.5)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.03)" },
  demandLabel: { fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" },
  demandValue: { fontSize: "14px", fontWeight: 700, color: "#000" },
  demandValueHighlight: { fontSize: "16px", fontWeight: 800, color: "#15803d" },
  demandDate: { fontSize: "13px", fontWeight: 700, color: "#0284c7", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(14, 165, 233, 0.1)", padding: "6px 12px", borderRadius: "8px", width: "fit-content" },
  sendOfferBtnCard: { marginTop: "auto", padding: "14px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", border: "1px solid rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 24px rgba(34,197,94,0.2)", transition: "all 0.2s ease" },
};

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
        <FaChevronDown style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', color: '#15803d' }} size={12} />
      </button>
      {isOpen && (
        <div className="inner-blur-glass custom-scrollbar" style={styles.customDropdownList}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ ...styles.customDropdownItem, ...(value === opt ? styles.customDropdownItemActive : {}) }}
              onMouseEnter={(e) => { if (value !== opt) { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)'; e.currentTarget.style.color = '#15803d'; } }}
              onMouseLeave={(e) => { if (value !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000'; } }}
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

export default SurplusExchangePage;
