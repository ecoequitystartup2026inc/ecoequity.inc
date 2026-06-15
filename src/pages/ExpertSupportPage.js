
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FaArrowLeft, FaUserTie, FaStar, FaCheckCircle, FaComments, FaCalendarAlt, FaAward, FaTimes, FaVideo, FaPhone, FaPaperPlane, FaClock, FaCalendarCheck, FaExclamationTriangle, FaQuestionCircle, FaMoneyBillWave, FaCheck, FaInfoCircle, FaPaperclip, FaLightbulb, FaLeaf, FaCreditCard, FaLock } from "react-icons/fa";

const mockAdvisors = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    image: "/russell.jpeg", // Placeholder image
    verified: true,
    rating: 4.9,
    expertise: ["Hydroponics", "Organic Farming", "Pest Management"],
    availability: "Available",
    availableDays: "Mon - Fri",
    availableTime: "9:00 AM - 5:00 PM",
    bio: "Dr. Santos is a leading expert in sustainable agriculture with over 15 years of experience in hydroponic systems and organic pest control.",
  },
  {
    id: 2,
    name: "Engr. Ana Reyes",
    image: "/rus3.jpeg", // Placeholder image
    verified: true,
    rating: 4.7,
    expertise: ["Soil Health", "Crop Rotation", "Farm Management"],
    availability: "Not Available",
    availableDays: "Tue, Thu, Sat",
    availableTime: "10:00 AM - 4:00 PM",
    bio: "Engr. Reyes specializes in optimizing soil health and implementing efficient crop rotation strategies for commercial farms.",
  },
  {
    id: 3,
    name: "Mr. Juan Dela Cruz",
    image: "/rus4.jpeg", // Placeholder image
    verified: true,
    rating: 4.8,
    expertise: ["Native Crops", "Seed Saving", "Community Farming"],
    availability: "Available",
    availableDays: "Mon, Wed, Fri",
    availableTime: "8:00 AM - 12:00 PM",
    bio: "Mr. Dela Cruz is passionate about preserving native Philippine crops and empowering local communities through sustainable farming practices.",
  },
  {
    id: 4,
    name: "Atty. Elena Garcia",
    image: "/rus5.jpeg", // Placeholder image
    verified: false, // Example of unverified advisor
    rating: 4.5,
    expertise: ["Agricultural Law", "Land Use", "Farm Policy"],
    availability: "Not Available",
    availableDays: "Weekends",
    availableTime: "1:00 PM - 6:00 PM",
    bio: "Atty. Garcia provides legal counsel and guidance on agricultural policies and land use regulations for farmers and agribusinesses.",
  },
];

// Extract unique expertise categories for filtering
const allExpertise = [...new Set(mockAdvisors.flatMap((advisor) => advisor.expertise))];

// Consultation pricing options
const consultationTypes = [
  { id: "video", name: "Video Call", duration: "3 hours", price: 1000, icon: FaVideo, description: "Face-to-face video consultation" },
  { id: "phone", name: "Phone Call", duration: "2 hours", price: 500, icon: FaPhone, description: "Quick voice consultation" },
  { id: "chat", name: "Unlimited Support", duration: "Unlimited chat, video, and phone call", price: 1500, icon: FaPaperPlane, description: "Unlimited chat with included video and phone access" },
  { id: "emergency", name: "Emergency", duration: "45 mins", price: 800, icon: FaExclamationTriangle, description: "Urgent assistance" },
];

// FAQ data
const faqData = [
  { question: "How do I prepare for my consultation?", answer: "Write down your questions and concerns beforehand. Have any relevant photos or documents ready if needed." },
  { question: "Can I reschedule my appointment?", answer: "Yes, you can reschedule up to 24 hours before your scheduled appointment at no extra cost." },
  { question: "What if the advisor is not available?", answer: "You can still book an appointment for when they become available. You'll be notified once they are available." },
  { question: "Is the consultation confidential?", answer: "Absolutely. All consultations are confidential and your information is secure." },
];

// Available time slots
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

// Quick suggestions based on expertise areas
const quickSuggestionsData = {
  "Hydroponics": [
    "What is the best nutrient solution for lettuce?",
    "How often should I change the water in my hydroponic system?",
    "What are the common pests in hydroponic farming?",
    "How do I set up a basic DWC system?"
  ],
  "Organic Farming": [
    "What organic fertilizers do you recommend?",
    "How to make compost at home?",
    "How to control pests organically?",
    "What crops grow best in organic farming?"
  ],
  "Pest Management": [
    "How to identify common plant pests?",
    "Natural ways to repel insects?",
    "What is integrated pest management?",
    "How to deal with root rot?"
  ],
  "Soil Health": [
    "How to test soil pH at home?",
    "What is crop rotation?",
    "How to improve clay soil?",
    "Best cover crops for soil fertility?"
  ],
  "Crop Rotation": [
    "What is the best crop sequence?",
    "How does rotation prevent disease?",
    "Can I rotate with legumes?",
    "How long should rotation cycle be?"
  ],
  "Farm Management": [
    "How to start a small farm?",
    "What records should I keep?",
    "How to price my produce?",
    "What insurance do I need?"
  ],
  "Native Crops": [
    "What are native Philippine crops?",
    "How to preserve native seeds?",
    "Best native varieties for my area?",
    "How to start a seed bank?"
  ],
  "Seed Saving": [
    "How to save seeds properly?",
    "What seeds can I save?",
    "How long do seeds last?",
    "Best storage for seeds?"
  ],
  "Community Farming": [
    "How to organize a farming group?",
    "What is a farming cooperative?",
    "How to share resources?",
    "How to start urban farming?"
  ],
  "Agricultural Law": [
    "What permits do I need?",
    "How to register my farm?",
    "What are farmer benefits?",
    "Land use regulations?"
  ],
  "Land Use": [
    "Can I convert agricultural land?",
    "What is farmland preservation?",
    "How to lease farm land?",
    "Zoning for farming?"
  ],
  "Farm Policy": [
    "What government programs exist?",
    "How to avail of loans?",
    "What subsidies are available?",
    "How to join AGRI programs?"
  ]
};

// Default suggestions
const defaultSuggestions = [
  "I need help with my crops",
  "What plants are best for beginners?",
  "How to start a home garden?",
  "Sustainable farming tips"
];

function ExpertSupportPage({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  
// Consultation modal state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [consultationStep, setConsultationStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentData, setPaymentData] = useState({ gcashRef: "", cardNum: "", cardName: "", cardExp: "", cardCvv: "", mayaRef: "", bankName: "", accNumber: "", accName: "" });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [paidChatAdvisors, setPaidChatAdvisors] = useState([]);
  const [paidCallAdvisors, setPaidCallAdvisors] = useState([]);
  const [paidVideoAdvisors, setPaidVideoAdvisors] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [notesFocused, setNotesFocused] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [isInstantCheckout, setIsInstantCheckout] = useState(false);

// Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedAdvisorForChat, setSelectedAdvisorForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

useEffect(() => {
    if (showConsultationModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showConsultationModal]);

  // Scroll to bottom when chat messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Filter advisors based on selected filter
  const filteredAdvisors = selectedFilter === "All"
    ? mockAdvisors
    : mockAdvisors.filter((advisor) => advisor.expertise.includes(selectedFilter));

const handleBookConsultation = (advisor, defaultType = null, isInstant = false) => {
    setSelectedAdvisor(advisor);
    setShowConsultationModal(true);
    setConsultationStep(isInstant ? 2 : 1);
    setSelectedType(defaultType);
    setSelectedDate(isInstant ? "Instant" : "");
    setSelectedTime(isInstant ? "Now" : "");
    setSelectedTopic(isInstant ? `Instant ${defaultType?.name || 'Session'}` : "");
    setIsInstantCheckout(isInstant);
    setSelectedPayment("");
    setPaymentData({ gcashRef: "", cardNum: "", cardName: "", cardExp: "", cardCvv: "", mayaRef: "", bankName: "", accNumber: "", accName: "" });
    setConsultationNotes("");
    setBookingConfirmed(false);
    setShowTopicDropdown(false);
  };

// Custom dropdown state for topic
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // Custom Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  // Calendar helper functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[month]} ${day}, ${year}`;
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPastDate = (day, month, year) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const isSelectedDate = (day, month, year) => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    const selYear = parseInt(parts[0]);
    const selMonth = parseInt(parts[1]) - 1;
    const selDay = parseInt(parts[2]);
    return day === selDay && month === selMonth && year === selYear;
  };

  const handlePrevMonth = () => {
    setCalendarView(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    setCalendarView(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const handleSelectDate = (day, month, year) => {
    if (isPastDate(day, month, year)) return;
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
    setShowCalendar(false);
  };

  const isPaymentValid = () => {
    if (!selectedPayment) return false;
    if (selectedPayment === "gcash") return paymentData.gcashRef.trim() !== "";
    if (selectedPayment === "maya") return paymentData.mayaRef.trim() !== "";
    if (selectedPayment === "card") {
      return paymentData.cardNum.length >= 15 && paymentData.cardName.trim() !== "" && paymentData.cardExp.length === 5 && paymentData.cardCvv.length >= 3;
    }
    if (selectedPayment === "bank") {
      return paymentData.bankName.trim() !== "" && paymentData.accNumber.trim() !== "" && paymentData.accName.trim() !== "";
    }
    return false;
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "";
    return price.toLocaleString("en-PH");
  };

  const handleCloseModal = () => {
    setShowConsultationModal(false);
    setSelectedAdvisor(null);
  };

const handleConfirmBooking = () => {
    if (selectedType?.id === "chat") {
      setPaidChatAdvisors(prev => 
        prev.includes(selectedAdvisor.id) ? prev : [...prev, selectedAdvisor.id]
      );
      setPaidCallAdvisors(prev => 
        prev.includes(selectedAdvisor.id) ? prev : [...prev, selectedAdvisor.id]
      );
      setPaidVideoAdvisors(prev => 
        prev.includes(selectedAdvisor.id) ? prev : [...prev, selectedAdvisor.id]
      );
    } else if (selectedType?.id === "phone") {
      setPaidCallAdvisors(prev => 
        prev.includes(selectedAdvisor.id) ? prev : [...prev, selectedAdvisor.id]
      );
    } else if (selectedType?.id === "video") {
      setPaidVideoAdvisors(prev => 
        prev.includes(selectedAdvisor.id) ? prev : [...prev, selectedAdvisor.id]
      );
    }
    setBookingConfirmed(true);
    setConsultationStep(3);
  };

// Chat handlers
  const handleOpenChat = (advisor) => {
    setSelectedAdvisorForChat(advisor);
    setChatMessages([]);
    setShowChatModal(true);
    setChatInput("");
    // Initial greeting
    setChatMessages([{
      id: 1,
      text: `Hi! I'm ${advisor.name}. ${advisor.bio} How can I help you with your agriculture questions today?`,
      sender: "advisor",
      timestamp: new Date()
    }]);
  };

  // Handle sending a suggestion directly
  const handleSendSuggestion = (suggestionText) => {
    if (!suggestionText.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: suggestionText,
      sender: "user",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    // Simulate advisor response
    setTimeout(() => {
      const advisorMsg = {
        id: Date.now() + 1,
        text: getAutoResponse(suggestionText, selectedAdvisorForChat),
        sender: "advisor",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, advisorMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedAdvisorForChat(null);
    setChatMessages([]);
    setChatInput("");
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: chatInput,
      sender: "user",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    // Simulate advisor response
    setTimeout(() => {
      const advisorMsg = {
        id: Date.now() + 1,
        text: getAutoResponse(chatInput, selectedAdvisorForChat),
        sender: "advisor",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, advisorMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getAutoResponse = (input, advisor) => {
    const lowerInput = input.toLowerCase();
    
    // Basic auto-responses based on keywords
    if (lowerInput.includes("pest") || lowerInput.includes("bug")) {
      return "For pest management, I recommend using integrated pest management (IPM) techniques. This includes biological control, cultural practices, and organic pesticides when necessary. Would you like more specific advice on a particular pest?";
    }
    if (lowerInput.includes("soil") || lowerInput.includes("land")) {
      return "Healthy soil is the foundation of successful farming. I recommend testing your soil pH and nutrient levels regularly. Adding organic matter like compost can significantly improve soil health. What type of soil are you working with?";
    }
    if (lowerInput.includes("water") || lowerInput.includes("irrigat")) {
      return "Proper watering is crucial. Most crops need about 1 inch of water per week. Consider drip irrigation for efficiency. The timing also matters - early morning is best to prevent fungal diseases. What's your current watering setup?";
    }
    if (lowerInput.includes("fertiliz") || lowerInput.includes("nutrient")) {
      return "For fertilizers, I always recommend a soil test first to know exactly what your plants need. Organic options like compost, fish emulsion, and worm castings are excellent choices. Chemical fertilizers should be used carefully to avoid burns. What are you currently using?";
    }
    if (lowerInput.includes("plant") || lowerInput.includes("crop") || lowerInput.includes("grow")) {
      return "Great question! The best crops depend on your location, soil type, and season. For Philippine climate, consider heat-tolerant varieties. Would you like specific recommendations for your area or the current season?";
    }
    if (lowerInput.includes("help") || lowerInput.includes("how")) {
      return "I'm here to help! Based on my expertise in " + advisor.expertise.join(", ") + ", I can provide guidance. Could you tell me more about your specific situation or what you're trying to grow?";
    }
    if (lowerInput.includes("thank")) {
      return "You're welcome! Don't hesitate to ask if you have more questions. Good luck with your farming journey!";
    }
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! It's great to connect with you. What agriculture questions can I help you with today?";
    }
    
    // Default response based on advisor expertise
    return `Thank you for your question! Based on my experience in ${advisor.expertise[0]}, I'd be happy to provide more detailed information. Could you share more details about your specific situation? For example, what are you growing, and what challenges are you facing?`;
  };

const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  // Get quick suggestions based on advisor expertise
  const getQuickSuggestions = () => {
    if (!selectedAdvisorForChat) return defaultSuggestions;
    
    for (const exp of selectedAdvisorForChat.expertise) {
      if (quickSuggestionsData[exp]) {
        return quickSuggestionsData[exp];
      }
    }
    return defaultSuggestions;
  };

  // Chat Modal Render
  const renderChatModal = () => {
    if (!selectedAdvisorForChat) return null;

    const hasChatSubscription = paidChatAdvisors.includes(selectedAdvisorForChat.id);
    const isCallPaid = hasChatSubscription || paidCallAdvisors.includes(selectedAdvisorForChat.id);
    const isVideoPaid = hasChatSubscription || paidVideoAdvisors.includes(selectedAdvisorForChat.id);

    return ReactDOM.createPortal(
      <div style={chatModalStyles.overlay} onClick={handleCloseChat}>
        <div style={chatModalStyles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Chat Header */}
          <div style={chatModalStyles.header}>
            <div style={chatModalStyles.headerLeft}>
              <img src={selectedAdvisorForChat.image} alt={selectedAdvisorForChat.name} style={chatModalStyles.headerImg} />
              <div style={chatModalStyles.headerInfo}>
                <h3 style={chatModalStyles.headerName}>{selectedAdvisorForChat.name}</h3>
                <span style={chatModalStyles.headerStatus}>
                  <span style={chatModalStyles.statusDot} />
                  Available
                </span>
              </div>
            </div>
            <div style={chatModalStyles.headerActions}>
              <button
                style={{
                  ...chatModalStyles.actionIconBtn,
                  opacity: isCallPaid ? 1 : 0.6,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isCallPaid) {
                    alert(`Calling ${selectedAdvisorForChat.name}...`);
                  } else {
                    handleBookConsultation(selectedAdvisorForChat, consultationTypes.find(t => t.id === "phone"), true);
                  }
                }}
                title={isCallPaid ? "Voice Call" : "Locked: Book Phone Call"}
                onMouseEnter={(e) => e.currentTarget.style.background = isCallPaid ? 'rgba(21,128,61,0.1)' : 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <div style={{ position: 'relative', display: 'flex' }}>
                  <FaPhone />
                  {!isCallPaid && <FaLock style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px', color: '#dc2626' }} />}
                </div>
              </button>
              <button
                style={{
                  ...chatModalStyles.actionIconBtn,
                  opacity: isVideoPaid ? 1 : 0.6,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isVideoPaid) {
                    alert(`Starting video call with ${selectedAdvisorForChat.name}...`);
                  } else {
                    handleBookConsultation(selectedAdvisorForChat, consultationTypes.find(t => t.id === "video"), true);
                  }
                }}
                title={isVideoPaid ? "Video Call" : "Locked: Book Video Call"}
                onMouseEnter={(e) => e.currentTarget.style.background = isVideoPaid ? 'rgba(21,128,61,0.1)' : 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <div style={{ position: 'relative', display: 'flex' }}>
                  <FaVideo />
                  {!isVideoPaid && <FaLock style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px', color: '#dc2626' }} />}
                </div>
              </button>
              <button style={chatModalStyles.closeBtn} onClick={handleCloseChat}>
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={chatModalStyles.messagesContainer} className="custom-scrollbar">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...chatModalStyles.messageBubble,
                  ...(msg.sender === "user" ? chatModalStyles.userMessage : chatModalStyles.advisorMessage),
                }}
              >
                {msg.text}
              </div>
            ))}
            
            {isTyping && (
              <div style={chatModalStyles.typingIndicator}>
                <span style={chatModalStyles.typingDot} />
                <span style={chatModalStyles.typingDot} />
                <span style={chatModalStyles.typingDot} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={chatModalStyles.suggestionsContainer}>
            <div style={chatModalStyles.suggestionsTitle}>
              <FaLightbulb style={{ marginRight: "6px" }} />
              Quick Questions
            </div>
            <div style={chatModalStyles.suggestionsGrid}>
              {getQuickSuggestions().slice(0, 4).map((suggestion, idx) => (
                <button
                  key={idx}
                  style={chatModalStyles.suggestionChip}
                  onClick={() => {
                    setChatInput(suggestion);
                    handleSendChat();
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Container */}
          <div style={chatModalStyles.inputContainer}>
            <input
              type="text"
              style={chatModalStyles.input}
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              style={chatModalStyles.sendBtn}
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const handleAddToCalendar = () => {
    if (selectedDate && selectedTime && selectedAdvisor) {
      const dateStr = selectedDate;
      const timeStr = selectedTime;
      const title = encodeURIComponent(`Consultation with ${selectedAdvisor.name}`);
      const details = encodeURIComponent(`${selectedType?.name} consultation about ${selectedTopic || selectedAdvisor.expertise[0]}`);
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr.replace(/-/g, '')}/${dateStr.replace(/-/g, '')}&details=${details}`;
      window.open(calendarUrl, '_blank');
    }
  };

  const renderConsultationModal = () => {
    if (!selectedAdvisor) return null;

    return ReactDOM.createPortal(
      <div style={modalStyles.overlay} onClick={handleCloseModal}>
        <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
          <button style={modalStyles.closeBtn} onClick={handleCloseModal}><FaTimes /></button>
          
          {/* Step 1: Consultation Type & Pricing */}
          {consultationStep === 1 && (
            <div style={modalStyles.stepContent}>
              <div style={modalStyles.advisorHeader}>
                <img src={selectedAdvisor.image} alt={selectedAdvisor.name} style={modalStyles.advisorImg} />
                <div>
                  <h3 style={modalStyles.advisorName}>{selectedAdvisor.name}</h3>
                  <span style={modalStyles.advisorExpertise}>{selectedAdvisor.expertise.join(", ")}</span>
                </div>
              </div>
              
              <h2 style={modalStyles.stepTitle}><FaCalendarCheck /> Book a Consultation</h2>
              
              {/* Consultation Type Selection */}
              <div style={modalStyles.typeGrid}>
                {consultationTypes.map((type) => (
                  <button
                    key={type.id}
                    style={{ ...modalStyles.typeCard, ...(selectedType?.id === type.id ? modalStyles.typeCardSelected : {}) }}
                    onClick={() => setSelectedType(type)}
                  >
                    <type.icon style={{ fontSize: "20px", color: selectedType?.id === type.id ? "#15803d" : "#6b7280" }} />
                    <span style={modalStyles.typeName}>{type.name}</span>
                    <span style={modalStyles.typeDuration}>{type.duration}</span>
                    <span style={modalStyles.typePrice}>₱{formatPrice(type.price)}</span>
                  </button>
                ))}
              </div>

              {/* Emergency Consultation Notice */}
              <div style={modalStyles.emergencyNote}>
                <FaExclamationTriangle style={{ marginRight: "8px" }} />
                <span>Emergency consultations prioritize urgent agricultural issues and are charged a premium rate.</span>
              </div>

              {/* FAQ Toggle */}
              <button style={modalStyles.faqToggle} onClick={() => setShowFaq(!showFaq)}>
                <FaQuestionCircle /> Frequently Asked Questions {showFaq ? "▲" : "▼"}
              </button>
              
              {showFaq && (
                <div style={modalStyles.faqContainer}>
                  {faqData.map((faq, index) => (
                    <div key={index} style={modalStyles.faqItem}>
                      <button style={modalStyles.faqQuestion} onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}>
                        {faq.question} {faqOpenIndex === index ? "−" : "+"}
                      </button>
                      {faqOpenIndex === index && <p style={modalStyles.faqAnswer}>{faq.answer}</p>}
                    </div>
                  ))}
                </div>
              )}

              <button 
                style={{ ...modalStyles.nextBtn, opacity: selectedType ? 1 : 0.5 }} 
                disabled={!selectedType}
                onClick={() => setConsultationStep(2)}
              >
                Continue <FaPaperPlane />
              </button>
            </div>
          )}

          {/* Step 2: Date, Time & Details */}
          {consultationStep === 2 && (
            <div style={modalStyles.stepContent}>
              <h2 style={modalStyles.stepTitle}>
                {isInstantCheckout ? <FaCreditCard /> : <FaClock />} 
                {isInstantCheckout ? " Payment Details" : " Select Date & Time"}
              </h2>
              
              {isInstantCheckout && (
                <div style={{ padding: "16px", background: "rgba(22, 163, 74, 0.1)", borderRadius: "12px", border: "1px solid rgba(22, 163, 74, 0.2)", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                     <div style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>Instant {selectedType?.name}</div>
                     <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>Duration: {selectedType?.duration}</div>
                   </div>
                   <div style={{ fontSize: "20px", fontWeight: 800, color: "#15803d" }}>
                     ₱{formatPrice(selectedType?.price)}
                   </div>
                </div>
              )}
              
              {!isInstantCheckout && (
                <>
                  {/* Topic Selection - Custom Dropdown */}
                  <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>What is this consultation about?</label>
                    <div style={modalStyles.customDropdownWrap}>
                      <button
                        type="button"
                        onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                        style={{
                          ...modalStyles.customDropdownHeader,
                          ...(showTopicDropdown ? modalStyles.customDropdownHeaderActive : {}),
                        }}
                      >
                        <span style={{ 
                          color: selectedTopic ? "#000" : "rgba(0,0,0,0.5)",
                          fontWeight: selectedTopic ? 600 : 400 
                        }}>
                          {selectedTopic || "Select a topic..."}
                        </span>
                        <svg 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#15803d" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ 
                            transition: 'transform 0.3s ease', 
                            transform: showTopicDropdown ? 'rotate(180deg)' : 'rotate(0)',
                            color: '#15803d'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {showTopicDropdown && (
                        <div style={modalStyles.customDropdownList}>
                          {selectedAdvisor.expertise.map((topic) => (
                            <div 
                              key={topic} 
                              onClick={() => { setSelectedTopic(topic); setShowTopicDropdown(false); }}
                              style={{ 
                                ...modalStyles.customDropdownItem, 
                                ...(selectedTopic === topic ? modalStyles.customDropdownItemActive : {})
                              }}
                            >
                              <span>{topic}</span>
                              {selectedTopic === topic && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          ))}
                          <div 
                            onClick={() => { setSelectedTopic("Other"); setShowTopicDropdown(false); }}
                            style={{ 
                              ...modalStyles.customDropdownItem, 
                              ...(selectedTopic === "Other" ? modalStyles.customDropdownItemActive : {})
                            }}
                          >
                            <span>Other</span>
                            {selectedTopic === "Other" && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Selection - Custom Calendar */}
                  <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Preferred Date</label>
                    <div style={modalStyles.customCalendarWrap}>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                          ...modalStyles.customCalendarHeader,
                          ...(showCalendar ? modalStyles.customCalendarHeaderActive : {}),
                        }}
                      >
                        <span style={{ 
                          color: selectedDate ? "#000" : "rgba(0,0,0,0.5)",
                          fontWeight: selectedDate ? 600 : 400 
                        }}>
                          {selectedDate ? formatDisplayDate(selectedDate) : "Select a date..."}
                        </span>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#15803d" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ 
                            transition: 'transform 0.3s ease', 
                            transform: showCalendar ? 'rotate(180deg)' : 'rotate(0)',
                            color: '#15803d'
                          }}
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </button>
                      
                      {showCalendar && (
                        <div style={modalStyles.customCalendarDropdown}>
                          {/* Calendar Header */}
                          <div style={modalStyles.calendarHeader}>
                            <button 
                              type="button"
                              onClick={handlePrevMonth}
                              style={modalStyles.calendarNavBtn}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </button>
                            <span style={modalStyles.calendarMonthYear}>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][calendarView.month]} {calendarView.year}
                            </span>
                            <button 
                              type="button"
                              onClick={handleNextMonth}
                              style={modalStyles.calendarNavBtn}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Calendar Days Header */}
                          <div style={modalStyles.calendarDaysHeader}>
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                              <span key={idx} style={modalStyles.calendarDayHeaderLabel}>{day}</span>
                            ))}
                          </div>
                          
                          {/* Calendar Days Grid */}
                          <div style={modalStyles.calendarDaysGrid}>
                            {Array.from({ length: getFirstDayOfMonth(calendarView.month, calendarView.year) }, (_, i) => (
                              <span key={`empty-${i}`} style={modalStyles.calendarDayEmpty} />
                            ))}
                            {Array.from({ length: getDaysInMonth(calendarView.month, calendarView.year) }, (_, i) => {
                              const day = i + 1;
                              const isTodayDate = isToday(day, calendarView.month, calendarView.year);
                              const isPast = isPastDate(day, calendarView.month, calendarView.year);
                              const isSelected = isSelectedDate(day, calendarView.month, calendarView.year);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleSelectDate(day, calendarView.month, calendarView.year)}
                                  disabled={isPast}
                                  style={{
                                    ...modalStyles.calendarDay,
                                    ...(isSelected ? modalStyles.calendarDaySelected : {}),
                                    ...(isTodayDate && !isSelected ? modalStyles.calendarDayToday : {}),
                                    ...(isPast ? modalStyles.calendarDayPast : {}),
                                  }}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Preferred Time</label>
                    <div style={modalStyles.timeSlots}>
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          style={{ ...modalStyles.timeSlot, ...(selectedTime === time ? modalStyles.timeSlotSelected : {}) }}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Additional Notes (Optional)</label>
                    <textarea 
                      style={{
                        ...modalStyles.textarea,
                        ...(notesFocused ? modalStyles.textareaFocus : {}),
                      }}
                      placeholder="Describe your issue or question..."
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      onFocus={() => setNotesFocused(true)}
                      onBlur={() => setNotesFocused(false)}
                    />
                  </div>
                </>
              )}

              {/* Payment Method */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Select Payment Method</label>
                <div style={modalStyles.paymentGrid}>
                  {[
                    { id: "gcash", name: "GCash", icon: <span style={{ color: "#0284c7", fontWeight: 800, fontStyle: "italic", fontSize: "14px" }}>G</span> },
                    { id: "maya", name: "Maya", icon: <span style={{ color: "#10b981", fontWeight: 800, fontStyle: "italic", fontSize: "12px" }}>maya</span> },
                    { id: "card", name: "Credit/Debit Card", icon: <FaCreditCard style={{ color: "#4b5563", fontSize: "14px" }} /> },
                    { id: "bank", name: "Bank Transfer", icon: <FaMoneyBillWave style={{ color: "#15803d", fontSize: "14px" }} /> }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      style={{
                        ...modalStyles.paymentCard,
                        ...(selectedPayment === method.id ? modalStyles.paymentCardSelected : {})
                      }}
                    >
                      <div style={{ ...modalStyles.paymentIconWrap, ...(selectedPayment === method.id ? modalStyles.paymentIconWrapSelected : {}) }}>
                        {method.icon}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: selectedPayment === method.id ? 700 : 600, color: selectedPayment === method.id ? "#15803d" : "#374151" }}>
                        {method.name}
                      </span>
                      {selectedPayment === method.id && (
                         <div style={modalStyles.paymentCheck}>
                           <FaCheckCircle size={14} color="#16a34a" />
                         </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Payment Details */}
              {selectedPayment && (
                <div style={modalStyles.paymentDetailsWrap}>
                  {selectedPayment === "gcash" && (
                    <div style={modalStyles.paymentDetailsCard}>
                      <div style={modalStyles.paymentInstructions}>Send payment to GCash Number: <strong>0912 345 6789</strong></div>
                      <div style={modalStyles.qrPlaceholder}>
                        <span style={{ fontSize: "24px" }}>📱</span>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Scan QR Code</span>
                      </div>
                      <input type="text" placeholder="Reference Number (e.g. 1000293812)" value={paymentData.gcashRef} onChange={(e) => setPaymentData({...paymentData, gcashRef: e.target.value})} style={modalStyles.input} />
                    </div>
                  )}
                  {selectedPayment === "card" && (
                    <div style={modalStyles.paymentDetailsCard}>
                      <input type="text" placeholder="Card Number (0000 0000 0000 0000)" value={paymentData.cardNum} onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').substring(0, 19);
                        const formatted = v.match(/.{1,4}/g)?.join(' ') || "";
                        setPaymentData({...paymentData, cardNum: formatted});
                      }} style={modalStyles.input} />
                      <input type="text" placeholder="Card Holder Name (Juan Dela Cruz)" value={paymentData.cardName} onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})} style={modalStyles.input} />
                      <div style={{ display: "flex", gap: "12px" }}>
                        <input type="text" placeholder="Expiry (MM/YY)" value={paymentData.cardExp} onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length === 1 && parseInt(v) > 1) v = '0' + v;
                          v = v.substring(0, 4);
                          let formatted = v;
                          if (v.length > 2) formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}`;
                          setPaymentData({...paymentData, cardExp: formatted});
                        }} style={{...modalStyles.input, flex: 1}} />
                        <input type="text" placeholder="CVV (123)" value={paymentData.cardCvv} onChange={(e) => setPaymentData({...paymentData, cardCvv: e.target.value.replace(/\D/g, '').substring(0, 4)})} style={{...modalStyles.input, flex: 1}} />
                      </div>
                    </div>
                  )}
                  {selectedPayment === "maya" && (
                    <div style={modalStyles.paymentDetailsCard}>
                      <div style={modalStyles.paymentInstructions}>Send payment to Maya Number: <strong>0912 345 6789</strong></div>
                      <div style={modalStyles.qrPlaceholder}>
                        <span style={{ fontSize: "24px" }}>📱</span>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Scan QR Code</span>
                      </div>
                      <input type="text" placeholder="Reference Number (e.g. 1000293812)" value={paymentData.mayaRef} onChange={(e) => setPaymentData({...paymentData, mayaRef: e.target.value})} style={modalStyles.input} />
                    </div>
                  )}
                  {selectedPayment === "bank" && (
                    <div style={modalStyles.paymentDetailsCard}>
                      <div style={modalStyles.paymentInstructions}>Transfer to BDO Account: <strong>0012 3456 7890</strong><br/>Account Name: <strong>VerdeVersity Inc.</strong></div>
                      <input type="text" placeholder="Bank Name (e.g. BDO / BPI)" value={paymentData.bankName} onChange={(e) => setPaymentData({...paymentData, bankName: e.target.value})} style={modalStyles.input} />
                      <input type="text" placeholder="Your Account Number" value={paymentData.accNumber} onChange={(e) => setPaymentData({...paymentData, accNumber: e.target.value})} style={modalStyles.input} />
                      <input type="text" placeholder="Your Account Name" value={paymentData.accName} onChange={(e) => setPaymentData({...paymentData, accName: e.target.value})} style={modalStyles.input} />
                    </div>
                  )}
                </div>
              )}

              <div style={modalStyles.btnGroup}>
                <button style={modalStyles.backBtnSmall} onClick={() => {
                  setShowConsultationModal(false);
                }}>Cancel</button>
                <button 
                  style={{ ...modalStyles.nextBtn, opacity: selectedPayment && isPaymentValid() ? 1 : 0.5 }} 
                  disabled={!selectedPayment || !isPaymentValid()}
                  onClick={handleConfirmBooking}
                >
                  Confirm Payment <FaCheck />
                </button>
              </div>
            </div>
          )}

{/* Step 3: Confirmation */}
          {consultationStep === 3 && bookingConfirmed && (
            <div style={modalStyles.confirmationWrapper}>
              {/* Success Icon with Animation */}
              <div style={modalStyles.successIcon}>
                <FaCheckCircle />
              </div>
              
              <h2 style={modalStyles.confirmTitle}>
                Booking Confirmed!
              </h2>
              <p style={modalStyles.confirmText}>
                Your payment is successful. You can now start your session!
              </p>
              
              {/* Advisor Card */}
              <div style={modalStyles.advisorConfirmCard}>
                <img src={selectedAdvisor.image} alt={selectedAdvisor.name} style={modalStyles.advisorConfirmImg} />
                <div style={{ flex: 1 }}>
                  <h3 style={modalStyles.advisorConfirmName}>{selectedAdvisor.name}</h3>
                  <p style={modalStyles.advisorConfirmType}>{selectedType?.name} • {selectedType?.duration}</p>
                  <span style={modalStyles.checkMarkBadge}>
                    <FaCheckCircle style={{ fontSize: "10px" }} /> Confirmed
                  </span>
                </div>
              </div>
              
              {/* Booking Details */}
              <div style={modalStyles.bookingSummary}>
                <div style={modalStyles.summaryRow}>
                  <span>Service</span>
                  <span style={modalStyles.summaryRowValue}>Instant {selectedType?.name}</span>
                </div>
                <div style={modalStyles.summaryRow}>
                  <span>Duration</span>
                  <span style={modalStyles.summaryRowValue}>{selectedType?.duration}</span>
                </div>
                <div style={modalStyles.summaryRow}>
                  <span>Payment Method</span>
                  <span style={modalStyles.summaryRowValue}>
                    {selectedPayment === "gcash" ? "GCash" : selectedPayment === "maya" ? "Maya" : selectedPayment === "card" ? "Credit/Debit Card" : selectedPayment === "bank" ? "Bank Transfer" : "Not Selected"}
                  </span>
                </div>
                <div style={{ ...modalStyles.summaryRow, borderBottom: "none" }}>
                  <span>Total Fee</span>
                  <span style={modalStyles.totalPrice}>₱{formatPrice(selectedType?.price)}</span>
                </div>
              </div>
              
              <button style={{ ...modalStyles.doneBtn, marginTop: "12px", width: "100%" }} onClick={() => {
                handleCloseModal();
                if (selectedType?.id === 'video') alert(`Starting video call with ${selectedAdvisor.name}...`);
                else if (selectedType?.id === 'phone') alert(`Calling ${selectedAdvisor.name}...`);
                else if (selectedType?.id === 'chat') handleOpenChat(selectedAdvisor);
              }}>
                Start {selectedType?.name}
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
<style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
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
              onClick={() => setActiveNav && setActiveNav(isMobile ? "Home" : "ServicesPage")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Expert Support</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Verified <span style={styles.accent}>Agriculture Specialists</span>
      </h1>
      <div style={styles.titleUnderline} />

<p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Connect with our network of verified agriculture specialists and advisors for personalized guidance and support.
      </p>

      {/* Filter Buttons */}
      <div style={styles.filterContainer}>
        <button
          style={{
            ...styles.filterBtn,
            ...(selectedFilter === "All" ? styles.filterBtnActive : {}),
          }}
          onClick={() => setSelectedFilter("All")}
        >
          All
        </button>
        {allExpertise.map((category) => (
          <button
            key={category}
            style={{
              ...styles.filterBtn,
              ...(selectedFilter === category ? styles.filterBtnActive : {}),
            }}
            onClick={() => setSelectedFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="hide-scroll" style={styles.gridContainer}>
        {filteredAdvisors.map((advisor) => {
          const isChatPaid = paidChatAdvisors.includes(advisor.id);
          return (
          <div
            key={advisor.id}
            className="inner-blur-glass"
            style={{
              ...styles.card,
              ...(hoveredCard === advisor.id ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(advisor.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span aria-hidden="true" style={styles.cardInnerBlur} />
            <div style={styles.profileHeader}>
              <img src={advisor.image} alt={advisor.name} style={styles.profileImage} />
              <div style={styles.nameAndBadge}>
                <h3 style={styles.advisorName}>{advisor.name}</h3>
                {advisor.verified && <span style={styles.verifiedBadge}><FaCheckCircle /> Verified</span>}
              </div>
            </div>
            <div style={styles.ratingAndAvailability}>
              <span style={styles.rating}><FaStar /> {advisor.rating}</span>
              <span style={{ ...styles.availabilityStatus, ...(advisor.availability === "Available" ? styles.online : styles.offline) }}>
                {advisor.availability}
              </span>
            </div>
            <div style={styles.advisorSchedule}>
              <span style={styles.scheduleItem}><FaCalendarAlt color="#15803d" /> {advisor.availableDays}</span>
              <span style={styles.scheduleItem}><FaClock color="#15803d" /> {advisor.availableTime}</span>
            </div>
            <p style={styles.expertise}>
              <strong>Expertise:</strong> {advisor.expertise.join(", ")}
            </p>
            <p style={styles.bio}>{advisor.bio}</p>
<div style={styles.ctaButtons}>
              <button 
                style={{
                  ...styles.actionBtnSmall,
                  padding: "10px 0",
                  fontSize: "13px",
                  opacity: isChatPaid ? 1 : 0.7,
                  cursor: "pointer",
                  background: isChatPaid ? "rgba(21, 128, 61, 0.1)" : "rgba(0,0,0,0.05)",
                  color: isChatPaid ? "#15803d" : "#6b7280",
                  border: isChatPaid ? "1px solid rgba(21, 128, 61, 0.2)" : "1px solid rgba(0,0,0,0.1)",
                }}
                onClick={() => {
                  if (isChatPaid) {
                    handleOpenChat(advisor);
                  } else {
                    handleBookConsultation(advisor, consultationTypes.find(t => t.id === "chat"), true);
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.025)'} 
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isChatPaid ? <FaComments /> : <FaLock />} Chat Now
              </button>
            </div>
          </div>
        )})}
      </div>

{/* Render Consultation Modal */}
      {renderConsultationModal()}

      {/* Render Chat Modal */}
      {showChatModal && renderChatModal()}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px 16px 60px",
    maxWidth: "1200px",
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
  titleMobile: {
    fontSize: "clamp(24px, 7vw, 32px)", // Slightly smaller title on mobile
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
    marginBottom: "30px",
    fontSize: "clamp(14px, 1.6vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: "700px",
  },
bodyMobile: {
    marginBottom: "24px",
  },
  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "24px",
    width: "100%",
  },
  filterBtn: {
    padding: "8px 18px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.04)",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    boxShadow: "0 4px 16px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.48)",
  },
  gridContainer: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "24px",
    width: "100%",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    padding: "10px 10px 30px",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "8px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    cursor: "pointer",
    flex: "0 0 280px",
    scrollSnapAlign: "center",
  },
  cardInnerBlur: {
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
  cardHov: {
    transform: "scale(1.025)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
    position: "relative",
    zIndex: 1,
  },
  profileImage: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #4ade80",
    boxShadow: "0 4px 12px rgba(74,222,128,0.3)",
  },
  nameAndBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  advisorName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
  },
  verifiedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#dcfce7",
    color: "#15803d",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },
  ratingAndAvailability: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "10px",
    position: "relative",
    zIndex: 1,
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#fbbf24",
    fontSize: "13px",
    fontWeight: 600,
  },
  availabilityStatus: {
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },
  online: {
    background: "#dcfce7",
    color: "#15803d",
  },
  offline: {
    background: "#fee2e2",
    color: "#ef4444",
  },
  advisorSchedule: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "10px",
    position: "relative",
    zIndex: 1,
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.7)",
  },
  expertise: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.8)",
    margin: "0 0 10px",
    position: "relative",
    zIndex: 1,
  },
  bio: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.5,
    flexGrow: 1,
    position: "relative",
    zIndex: 1,
  },
  ctaButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    marginTop: "auto",
    position: "relative",
    zIndex: 1,
  },
  actionBtnSmall: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
bookConsultationBtn: {
    flex: 1,
    padding: "7px 12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

// Modal Styles for Consultation Booking
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
modal: {
    maxWidth: "560px",
    width: "100%",
    maxHeight: "90vh",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflowY: "auto",
  },
closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 50,
    background: "#f3f4f6",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  advisorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(22, 163, 74, 0.05)",
    borderRadius: "12px",
  },
  advisorImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #4ade80",
  },
  advisorName: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
  },
  advisorExpertise: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.6)",
  },
stepTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#15803d",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  stepTitleWhite: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "14px 10px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  typeCardSelected: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
  },
  typeName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#000",
  },
  typeDuration: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.5)",
  },
  typePrice: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#15803d",
  },
  emergencyNote: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    color: "#b45309",
    background: "rgba(251,191,36,0.1)",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(251,191,36,0.2)",
  },
  faqToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#15803d",
    cursor: "pointer",
  },
  faqContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  faqItem: {
    borderRadius: "8px",
    overflow: "hidden",
  },
  faqQuestion: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "rgba(22,128,61,0.05)",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#000",
    cursor: "pointer",
    textAlign: "left",
  },
  faqAnswer: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.7)",
    padding: "8px 12px",
    margin: 0,
    lineHeight: 1.5,
  },
  nextBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(34,197,94,0.2)",
    transition: "all 0.2s ease",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#000",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: "13px",
    background: "rgba(255,255,255,0.8)",
  },
input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: "13px",
    background: "rgba(255,255,255,0.8)",
  },
  // Custom Calendar Styles
  customCalendarWrap: {
    position: "relative",
    width: "100%",
  },
  customCalendarHeader: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  customCalendarHeaderActive: {
    border: "1px solid #15803d",
    boxShadow: "0 0 0 3px rgba(21, 128, 61, 0.1)",
  },
  customCalendarDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "6px",
    background: "rgba(255,255,255,0.98)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(21, 128, 61, 0.2)",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(21, 128, 61, 0.1)",
    zIndex: 50,
    padding: "12px",
    animation: "fadeInDown 0.2s ease",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },
  calendarNavBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(21, 128, 61, 0.08)",
    color: "#15803d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  calendarMonthYear: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
  },
  calendarDaysHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: "8px",
  },
  calendarDayHeaderLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  calendarDaysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  calendarDayEmpty: {
    width: "32px",
    height: "32px",
  },
  calendarDay: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#000",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDaySelected: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
  },
  calendarDayToday: {
    background: "rgba(21, 128, 61, 0.1)",
    color: "#15803d",
    fontWeight: 600,
    border: "1px solid rgba(21, 128, 61, 0.3)",
  },
calendarDayPast: {
    color: "rgba(0,0,0,0.25)",
    cursor: "not-allowed",
    background: "transparent",
  },
  // Calendar Day Hover
  calendarDayHover: {
    background: "rgba(21, 128, 61, 0.08)",
  },
  timeSlots: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  timeSlot: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  timeSlotSelected: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
  },
textarea: {
    padding: "12px 14px",
    borderRadius: "16px",
    border: "1px solid rgba(21, 128, 61, 0.15)",
    fontSize: "13px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(240,253,244,0.7))",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
    color: "#000",
    outline: "none",
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(21,128,61,0.08)",
  },
  textareaFocus: {
    border: "1px solid #15803d",
    boxShadow: "0 0 0 4px rgba(21, 128, 61, 0.15), 0 6px 20px rgba(21,128,61,0.12)",
    background: "linear-gradient(150deg, rgba(255,255,255,0.95), rgba(240,253,244,0.85))",
  },
  pricingSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "rgba(22,163,74,0.05)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#000",
  },
totalPrice: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#059669",
  },
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  paymentCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },
  paymentCardSelected: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.15), rgba(125,211,252,0.15))",
    border: "1px solid #16a34a",
    boxShadow: "0 4px 12px rgba(34,197,94,0.15)",
  },
  paymentIconWrap: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  paymentIconWrapSelected: {
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  paymentCheck: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  paymentDetailsWrap: {
    marginTop: "16px",
    animation: "fadeIn 0.3s ease",
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
  btnGroup: {
    display: "flex",
    gap: "10px",
  },
backBtnSmall: {
    padding: "10px 16px",
    borderRadius: "12px",
    background: "rgba(0,0,0,0.05)",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  // Custom Dropdown Styles
  customDropdownWrap: {
    position: "relative",
    width: "100%",
  },
  customDropdownHeader: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  customDropdownHeaderActive: {
    border: "1px solid #15803d",
    boxShadow: "0 0 0 3px rgba(21, 128, 61, 0.1)",
  },
  customDropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "6px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(21, 128, 61, 0.2)",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    zIndex: 50,
    maxHeight: "180px",
    overflowY: "auto",
  },
  customDropdownItem: {
    padding: "10px 14px",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#000",
    transition: "all 0.15s ease",
  },
  customDropdownItemActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.2), rgba(125,211,252,0.2))",
    color: "#15803d",
    fontWeight: 600,
  },
successIcon: {
    fontSize: "48px",
    color: "#22c55e",
    marginBottom: "12px",
    filter: "drop-shadow(0 2px 8px rgba(34,197,94,0.4))",
  },
confirmTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 12px",
    textAlign: "center",
    letterSpacing: "-0.5px",
  },
confirmText: {
    fontSize: "13px",
    color: "#4b5563",
    margin: "0 0 16px",
    lineHeight: 1.6,
    textAlign: "center",
  },
confirmationWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "12px 6px",
    background: "#ffffff",
    borderRadius: "24px",
  },
advisorConfirmCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    background: "linear-gradient(135deg, #f0fdf4, #ecfeff)",
    borderRadius: "16px",
    border: "1px solid #bbf7d0",
    marginBottom: "16px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(34,197,94,0.1)",
  },
advisorConfirmImg: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #22c55e",
    boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
  },
advisorConfirmName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  advisorConfirmType: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  checkMarkBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "linear-gradient(135deg, #22c55e, #14b8a6)",
    color: "#ffffff",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 600,
    marginTop: "6px",
    boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
  },
bookingSummary: {
    background: "#f9fafb",
    borderRadius: "16px",
    padding: "14px",
    marginTop: "12px",
    width: "100%",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#6b7280",
  },
  summaryRowValue: {
    fontWeight: 600,
    color: "#111827",
  },
calendarBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    border: "none",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    width: "100%",
  },
  rsvpBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "all 0.2s ease",
  },
doneBtn: {
    padding: "12px 20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #22c55e, #14b8a6)",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
    width: "100%",
  },
};

// Chat Modal Styles
const chatModalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    animation: "fadeIn 0.3s ease",
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    maxHeight: "90vh",
    background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,253,244,0.95))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    position: "relative",
    animation: "scaleUp 0.3s ease",
    overflow: "hidden",
  },
  header: {
    padding: "16px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.15), rgba(125,211,252,0.1))",
    borderBottom: "1px solid rgba(21,128,61,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerImg: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #4ade80",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#15803d",
    marginTop: "2px",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 8px rgba(74,222,128,0.8)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionIconBtn: {
    background: "rgba(0,0,0,0.05)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#15803d",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  closeBtn: {
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
  messagesContainer: {
    flex: 1,
    minHeight: "200px",
    maxHeight: "300px",
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: "12px 14px",
    borderRadius: "16px",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    borderBottomRightRadius: "4px",
  },
  advisorMessage: {
    alignSelf: "flex-start",
    background: "#fff",
    border: "1px solid rgba(21,128,61,0.15)",
    color: "#000",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  typingIndicator: {
    display: "flex",
    gap: "4px",
    padding: "12px 16px",
    background: "#fff",
    borderRadius: "16px",
    borderBottomLeftRadius: "4px",
    width: "fit-content",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#15803d",
    animation: "typingDot 1.4s infinite ease-in-out",
  },
  suggestionsContainer: {
    padding: "12px 16px",
    background: "rgba(21,128,61,0.03)",
    borderTop: "1px solid rgba(21,128,61,0.1)",
  },
  suggestionsTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#15803d",
    marginBottom: "8px",
  },
  suggestionsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  suggestionChip: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(21,128,61,0.15)",
    color: "#374151",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  inputContainer: {
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#f9fafb",
    fontSize: "13px",
    outline: "none",
    transition: "border 0.2s",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
    transition: "transform 0.2s ease",
  },
};

export default ExpertSupportPage;
