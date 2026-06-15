import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import AboutUs from "./pages/AboutUs";
import OurTeam from "./pages/OurTeam";
import ProductServices from "./pages/ProductServices";
import TargetMarket from "./pages/TargetMarket";
import GetInTouch from "./pages/GetInTouch";
import LearnMore from "./pages/LearnMore";
import BenefitsOfTheProject from "./pages/BenefitsOfTheProject"; // Import the new component
import ProductsPage from "./pages/ProductsPage"; // Import the new ProductsPage component
import ServicesPage from "./pages/ServicesPage"; // Import the ServicesPage component
import IncomeGenerationPage from "./pages/IncomeGenerationPage"; // Import the new IncomeGenerationPage
import ShopAllProducts from "./pages/ShopAllProducts"; // Import the ShopAllProducts page
import StarterKits from "./pages/StarterKits";
import ExploreMore from "./pages/ExploreMore";
import AIDataSubscription from "./pages/AIDataSubscription";
import TargetMarketExplore from "./pages/TargetMarketExplore";
import SpecialistCertification from "./pages/SpecialistCertification";
import AIChatInterface from "./AIChatInterface";
import SustainabilityAppMarket from "./pages/SustainabilityAppMarket";
import AIPlantDoctor from "./pages/AIPlantDoctor";
import ExpertSupportPage from "./pages/ExpertSupportPage"; // Import the new ExpertSupportPage
import ImpactTrackingPage from "./pages/ImpactTrackingPage"; // Import the new ImpactTrackingPage
import NativeSeedBankPage from "./pages/NativeSeedBankPage"; // Import the new NativeSeedBankPage
import LGUPartnershipPage from "./pages/LGUPartnershipPage"; // Import the new LGU Partnership Page
import OurImpactPage from "./pages/OurImpactPage"; // Import the new OurImpactPage
import SurplusExchangePage from "./pages/SurplusExchangePage"; // Corrected path
import CheckoutPage from "./pages/CheckoutPage"; // Import the CheckoutPage
import AdminPortal from "./pages/AdminPortal"; // Import the AdminPortal
import SeasonalHarvestPage from "./pages/SeasonalHarvestPage";

import EventsAndWorkshopsPage from "./pages/EventsAndWorkshopsPage"; // Import the new EventsAndWorkshopsPage
import { FaShoppingCart, FaCalendarAlt, FaUserPlus, FaRobot, FaTrash, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaChevronDown, FaBell, FaCalendar } from "react-icons/fa";
import { Leaf, Stethoscope, Users, Sprout, Sun, Activity, HeartPulse, Globe, MessageCircle, Droplet, Wheat, Microscope, Bug, Share2, Store, TrendingUp, Handshake, Sparkles, Home, Headset, Award, GraduationCap, Wrench, Calendar, Info, CircleUserRound } from "lucide-react";
import { BiCalendarEvent } from "react-icons/bi";
const navItems = ["Home", "About Us", "Product & Services", "Target Market", "Our Team", "Seasonal Harvest"];

const initialProducts = [
  { id: 1, name: "Heirloom Tomatoes", category: "Organic Edibles", price: 150, image: "/tomato.png", badge: "Best Seller", stock: "In Stock", emoji: "🍅", description: "Freshly harvested, pesticide-free organic tomatoes, perfect for salads and cooking.", sustainabilityBadge: "Eco-Friendly", rating: 4.8, reviewCount: 124, reviews: [{user: "Maria G.", rating: 5, comment: "Very fresh and juicy!"}, {user: "Jose P.", rating: 4, comment: "Good quality."}] },
  { id: 2, name: "Basil Grow Kit", category: "Herbs", price: 350, image: "/basil.png", badge: "New", stock: "Low Stock", emoji: "🌿", description: "Everything you need to grow your own aromatic basil at home. Includes seeds, soil, and pot.", sustainabilityBadge: "Sustainable", rating: 4.5, reviewCount: 89, reviews: [{user: "Ana D.", rating: 5, comment: "Sprouted in just a few days. Love it!"}] },
  { id: 3, name: "Sampaguita Starter", category: "Floriculture", price: 200, image: "/sampaguita.png", stock: "In Stock", emoji: "🌸", description: "Smells wonderful, arrived healthy.", sustainabilityBadge: "Local & Organic", rating: 4.9, reviewCount: 210, reviews: [{user: "Luz V.", rating: 5, comment: "Smells wonderful, arrived healthy."}] },
  { id: 4, name: "Native Adlai Seeds", category: "Native Seeds", price: 250, image: "/adlai.png", badge: "Organic", stock: "In Stock", emoji: "🌾", description: "High-quality native Adlai seeds, a healthy and sustainable alternative to rice.", sustainabilityBadge: "Local & Organic", rating: 4.7, reviewCount: 56, reviews: [{user: "Mark T.", rating: 4, comment: "Great alternative to rice, high yield."}] },
  { id: 5, name: "Premium Potting Mix", category: "Soil Mixes", price: 280, image: "/potting_mix.png", stock: "Low Stock", emoji: "🪴", description: "Nutrient-rich organic potting mix, ideal for all types of plants and urban gardens.", sustainabilityBadge: "Recycled Content", rating: 4.6, reviewCount: 340, reviews: [{user: "Rene C.", rating: 5, comment: "My plants are thriving with this mix."}] },
  { id: 6, name: "Ergonomic Hand Trowel", category: "Gardening Tools", price: 450, image: "/trowel.png", stock: "In Stock", emoji: "⛏️", description: "Sturdy and comfortable to hold.", sustainabilityBadge: "Essential", rating: 4.8, reviewCount: 112, reviews: [{user: "Sam L.", rating: 5, comment: "Sturdy and comfortable to hold."}] },
  { id: 7, name: "Organic Eggplant", category: "Organic Edibles", price: 120, image: "/eggplant.png", stock: "In Stock", emoji: "🍆", description: "Fresh, but a bit smaller than expected.", sustainabilityBadge: "Eco-Friendly", rating: 4.3, reviewCount: 45, reviews: [{user: "Karen B.", rating: 4, comment: "Fresh, but a bit smaller than expected."}] },
  { id: 8, name: "Peppermint Seeds", category: "Herbs", price: 90, image: "/mint.png", stock: "In Stock", emoji: "🌱", description: "Grows very fast!", sustainabilityBadge: "Sustainable", rating: 4.5, reviewCount: 78, reviews: [{user: "Leo M.", rating: 5, comment: "Grows very fast!"}] },
  { id: 9, name: "Compost Booster", category: "Soil Mixes", price: 320, image: "/compost.png", badge: "Eco", stock: "In Stock", emoji: "♻️", description: "Speeds up composting significantly.", sustainabilityBadge: "Eco-Friendly", rating: 4.9, reviewCount: 150, reviews: [{user: "Gina R.", rating: 5, comment: "Speeds up composting significantly."}] },
  { id: 10, name: "Urban Farming Starter Kit", category: "Starter Kits", price: 1200, image: "/starter_kit.png", badge: "Popular", stock: "In Stock", emoji: "📦", description: "Everything you need to start your urban farm. Includes varied seeds, tools, and premium soil.", sustainabilityBadge: "Eco-Friendly", rating: 4.9, reviewCount: 88, reviews: [{user: "Sarah L.", rating: 5, comment: "Amazing kit to get started!"}] },
];

const initialHarvests = [
  { id: 1, name: "Heirloom Tomatoes", category: "Vegetables", months: ["March", "April", "May", "June"], peak: "May", icon: "🍅", estDate: "May 15", location: "Benguet", region: "Luzon", countdown: "Starts in 12 days", weather: "Sunny ☀️", risk: "Low", demand: "High Demand", priceTrend: "₱120-150/kg", plantingMonth: "January", yield: "High", water: "Medium", soil: "Loamy", temp: "20-28°C", pestRisk: "Medium", suppliers: 5, restaurantMatches: 3, growthProgress: 85 },
  { id: 2, name: "Sweet Mangoes", category: "Fruits", months: ["March", "April", "May", "June"], peak: "April", icon: "🥭", estDate: "April 20", location: "Guimaras", region: "Visayas", countdown: "Active", weather: "Sunny ☀️", risk: "Low", demand: "High Demand", priceTrend: "₱180-220/kg", plantingMonth: "June", yield: "Medium", water: "Low", soil: "Well-drained", temp: "25-35°C", pestRisk: "High", suppliers: 12, restaurantMatches: 8, growthProgress: 95 },
  { id: 3, name: "Basil Genovese", category: "Herbs", months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], peak: "June", icon: "🌿", estDate: "Year-round", location: "Urban Farms", region: "All Regions", countdown: "Ongoing", weather: "Partial Sun ⛅", risk: "Low", demand: "Medium Demand", priceTrend: "₱300-400/kg", plantingMonth: "Any", yield: "High", water: "High", soil: "Moist", temp: "20-30°C", pestRisk: "Low", suppliers: 8, restaurantMatches: 15, growthProgress: 60 },
  { id: 4, name: "Native Adlai", category: "Grains", months: ["October", "November", "December", "January"], peak: "November", icon: "🌾", estDate: "Nov 10", location: "Bukidnon", region: "Mindanao", countdown: "150 days", weather: "Rainy 🌧️", risk: "Medium", demand: "High Demand", priceTrend: "₱250-280/kg", plantingMonth: "May", yield: "Medium", water: "Medium", soil: "Adaptable", temp: "22-30°C", pestRisk: "Low", suppliers: 3, restaurantMatches: 5, growthProgress: 40 },
  { id: 5, name: "Baguio Strawberries", category: "Fruits", months: ["December", "January", "February", "March", "April"], peak: "February", icon: "🍓", estDate: "Feb 14", location: "La Trinidad", region: "Luzon", countdown: "200 days", weather: "Cool ☁️", risk: "Medium", demand: "High Demand", priceTrend: "₱300-450/kg", plantingMonth: "September", yield: "Medium", water: "High", soil: "Acidic", temp: "15-22°C", pestRisk: "High", suppliers: 2, restaurantMatches: 10, growthProgress: 25 },
  { id: 6, name: "Organic Eggplant", category: "Vegetables", months: ["June", "July", "August", "September"], peak: "July", icon: "🍆", estDate: "July 05", location: "Pangasinan", region: "Luzon", countdown: "45 days", weather: "Sunny ☀️", risk: "Low", demand: "Medium Demand", priceTrend: "₱80-120/kg", plantingMonth: "March", yield: "High", water: "Medium", soil: "Loamy", temp: "25-32°C", pestRisk: "Medium", suppliers: 6, restaurantMatches: 2, growthProgress: 75 },
  { id: 7, name: "Sweet Corn", category: "Vegetables", months: ["April", "May", "June", "July"], peak: "May", icon: "🌽", estDate: "May 25", location: "Isabela", region: "Luzon", countdown: "22 days", weather: "Sunny ☀️", risk: "Low", demand: "High Demand", priceTrend: "₱50-80/kg", plantingMonth: "February", yield: "High", water: "High", soil: "Well-drained", temp: "20-30°C", pestRisk: "Medium", suppliers: 10, restaurantMatches: 6, growthProgress: 80 },
  { id: 8, name: "Watermelon", category: "Fruits", months: ["March", "April", "May"], peak: "April", icon: "🍉", estDate: "April 10", location: "Ilocos", region: "Luzon", countdown: "Active", weather: "Hot ☀️", risk: "Low", demand: "High Demand", priceTrend: "₱40-60/kg", plantingMonth: "January", yield: "High", water: "Low", soil: "Sandy", temp: "25-35°C", pestRisk: "Low", suppliers: 8, restaurantMatches: 4, growthProgress: 100 },
];

const initialPromoCodes = [
  { id: 1, code: "ECO20", type: "percent", value: 20, desc: "20% off Pro Plan", uses: 45 },
  { id: 2, code: "GREENSTART", type: "percent", value: 100, desc: "1 Free Month Trial", uses: 112 },
  { id: 3, code: "GREEN10", type: "percent", value: 10, desc: "10% off total", uses: 320 },
  { id: 4, code: "ECOFREE", type: "shipping", value: 0, desc: "Free Shipping", uses: 56 },
  { id: 5, code: "FARM20", type: "fixed", value: 20, desc: "₱20 off", uses: 89 }
];

const initialOrders = [
  { id: "ORD-9824", customer: "Elena Gomez", email: "elena@example.com", phone: "0917 123 4567", address: "88 Palms, Makati City, Metro Manila 1200", amount: "₱2,100", status: "Pending Approval", date: "May 29, 2026", payment: "Credit Card", paymentStatus: "Paid", products: "1x Starter Kit, 2x Organic Soil", rider: "Unassigned", instructions: "Please leave at the gate.", total: 2100.00, items: "1x Starter Kit, 2x Organic Soil" },
  { id: "ORD-9823", customer: "Maria Clara", email: "maria@example.com", phone: "0912 345 6789", address: "123 Green St, Baguio City, Benguet 2600", amount: "₱1,250", status: "Approved", date: "May 28, 2026", payment: "GCash", paymentStatus: "Paid", products: "2x Heirloom Tomatoes, 1x Basil Kit", rider: "Unassigned", instructions: "Call upon arrival.", total: 1250.00, items: "2x Heirloom Tomatoes, 1x Basil Kit" },
  { id: "ORD-9822", customer: "Juan Dela Cruz", email: "juan@example.com", phone: "0987 654 3210", address: "456 Pine Rd, Davao City, Davao del Sur 8000", amount: "₱850", status: "Approved", date: "May 28, 2026", payment: "Cash on Delivery", paymentStatus: "Pending", products: "1x Premium Potting Mix", rider: "Mike T.", instructions: "", total: 850.00, items: "1x Premium Potting Mix" },
  { id: "ORD-9821", customer: "Healthy Eats Cafe", email: "contact@healthyeats.com", phone: "0999 888 7777", address: "789 Metro Ave, Quezon City, Metro Manila 1100", amount: "₱5,400", status: "Approved", date: "May 27, 2026", payment: "Credit Card", paymentStatus: "Paid", products: "10x Assorted Veggies Bundle", rider: "Sarah L.", instructions: "Deliver to back kitchen door.", total: 5400.00, items: "10x Assorted Veggies Bundle" },
  { id: "ORD-9820", customer: "Urban Roots", email: "hello@urbanroots.ph", phone: "0977 111 2222", address: "101 Cedar Ln, Cebu City, Cebu 6000", amount: "₱3,200", status: "Pending Approval", date: "May 27, 2026", payment: "Maya", paymentStatus: "Paid", products: "5x Microgreens Kit", rider: "Unassigned", instructions: "", total: 3200.00, items: "5x Microgreens Kit" },
];

const ORDERS_STORAGE_KEY = "verdeversity_orders";

const getInitialOrders = () => {
  try {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!savedOrders) return initialOrders;
    const parsedOrders = JSON.parse(savedOrders);
    return Array.isArray(parsedOrders) ? parsedOrders : initialOrders;
  } catch (error) {
    return initialOrders;
  }
};

const ecoTimelineActivities = [
  { title: "Redeemed Rewards", time: "2 hours ago", points: "-500", icon: "🎁", color: "#e11d48", bg: "rgba(225,29,72,0.1)", glow: "rgba(225,29,72,0.3)" },
  { title: "Workshop Attendance", time: "Yesterday", points: "+75", icon: "🧑‍🌾", color: "#16a34a", bg: "rgba(34,197,94,0.2)", glow: "rgba(34,197,94,0.4)" },
  { title: "Referral Bonuses", time: "May 25, 2026", points: "+200", icon: "👥", color: "#16a34a", bg: "rgba(34,197,94,0.2)", glow: "rgba(34,197,94,0.4)" },
  { title: "Purchased Organic Seeds", time: "May 24, 2026", points: "-50", icon: "🌱", color: "#e11d48", bg: "rgba(225,29,72,0.1)", glow: "rgba(225,29,72,0.3)" },
  { title: "Completed 'Intro to Composting' course", time: "May 23, 2026", points: "+150", icon: "🎓", color: "#16a34a", bg: "rgba(34,197,94,0.2)", glow: "rgba(34,197,94,0.4)" },
];

const CustomDropdown = ({ options, value, onChange }) => {
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
        <span>{value}</span>
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
        <div className="inner-blur-glass custom-scrollbar" style={styles.customDropdownList}>
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} style={{ ...styles.customDropdownItem, ...(value === opt ? styles.customDropdownItemActive : {}) }}>
              <span>{opt}</span>
              {value === opt && <FaCheckCircle size={14} style={{ color: '#16a34a' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [activeNav, setActiveNav] = useState("Login");
  const [mobileAuthView, setMobileAuthView] = useState("landing");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null); // State for navigation buttons
  const [btnHovered, setBtnHovered] = useState(false); // State for 'Get in Touch' button (reverted from previous change)
  const [ghostHovered, setGhostHovered] = useState(false); // State for 'Learn More' button
  const [exploreHovered, setExploreHovered] = useState(false); // State for 'Explore more' button
  const [activeHeroTab, setActiveHeroTab] = useState("crop"); // State for right card tabs
  const [rightCardHovered, setRightCardHovered] = useState(false); // State for the right card
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null); // State for line chart tooltips
  const [hoveredStatBadge, setHoveredStatBadge] = useState(null); // State for stat badges
  const [chatHovered, setChatHovered] = useState(false); // State for 'Chat with AI' button
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false); // State for showing AI chat interface
  const [statsStripHovered, setStatsStripHovered] = useState(false); // State for the stats strip panel
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false); // State for Target Market dropdown
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // State for hovering dropdown items
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false); // New state for Product & Services dropdown
  const [hoveredProductDropdown, setHoveredProductDropdown] = useState(null); // New state for Product & Services dropdown items
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const [hoveredSocialBtn, setHoveredSocialBtn] = useState(null); // State for social login buttons
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false); // Separated terms from rememberMe
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for logged-in status
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const [loggedInUser, setLoggedInUser] = useState(""); // State for user name
  const [profilePic, setProfilePic] = useState(null); // State for user profile picture
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Profile dropdown
  const [hoveredProfileDropdown, setHoveredProfileDropdown] = useState(null); // Profile dropdown hover
  const [hoveredSettingsTab, setHoveredSettingsTab] = useState(null); // State for settings sidebar hover
  const [showSettingsModal, setShowSettingsModal] = useState(false); // State for Settings modal
  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);
  const [showRewardSuccessModal, setShowRewardSuccessModal] = useState(false); // State for reward redemption success modal
  const [settingsTab, setSettingsTab] = useState("profile"); // State for Settings Modal Tabs
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success popup
  const [authMessage, setAuthMessage] = useState(null); // State for auth feedback messages (text and type)
  const [formErrorShake, setFormErrorShake] = useState(false); // State for shake error animation
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [currentTier, setCurrentTier] = useState("Green Grower 🌿");
  const [progressToNextTier, setProgressToNextTier] = useState(62.5);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [redeemHistory, setRedeemHistory] = useState([
    { reward: "Free Delivery Voucher", points: "-500", date: "May 20, 2026", status: "Active" },
    { reward: "Native Seed Kit", points: "-1,200", date: "Apr 15, 2026", status: "Shipped" }
  ]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [ecoPointsSection, setEcoPointsSection] = useState("All");
  const [isEcoPointsDropdownOpen, setIsEcoPointsDropdownOpen] = useState(false);
  const [hoveredEcoPointsOption, setHoveredEcoPointsOption] = useState(null);
  const [showSectorActionsMobile, setShowSectorActionsMobile] = useState(false);
  const [redeemHistoryFilter, setRedeemHistoryFilter] = useState("All");
  const [isRedeemFilterDropdownOpen, setIsRedeemFilterDropdownOpen] = useState(false);
  const [hoveredRedeemFilterOption, setHoveredRedeemFilterOption] = useState(null);
  const ecoPointsDropdownRef = useRef(null);
  const redeemFilterDropdownRef = useRef(null);
  const [badges, setBadges] = useState([
    { name: "Tree Protector", icon: "🛡️🌲", earned: true },
    { name: "Urban Farmer", icon: "🏙️🧑‍🌾", earned: true },
    { name: "Seed Guardian", icon: "🌱✨", earned: false },
    { name: "Climate Warrior", icon: "⚔️🌎", earned: false }
  ]);
  const [rewardParticles, setRewardParticles] = useState([]);
  const [cartItems, setCartItems] = useState([]); // Shared cart state
  const [savedProducts, setSavedProducts] = useState([]); // Shared wishlist state
  const [orders, setOrders] = useState(getInitialOrders);
  const [visibleTimelineItems, setVisibleTimelineItems] = useState(4);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true, sms: true
  });
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [orderFilter, setOrderFilter] = useState("All Orders");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [showRiderChat, setShowRiderChat] = useState(false);
  const [riderChatMessages, setRiderChatMessages] = useState([{ text: "Hi! I'm on my way with your order. Any specific instructions?", sender: "rider" }]);
  const [riderChatInput, setRiderChatInput] = useState("");
  const [orderReviewRating, setOrderReviewRating] = useState(5);
  const [orderReviewText, setOrderReviewText] = useState("");
  const [orderReviewSubmitted, setOrderReviewSubmitted] = useState(false);
  const [products, setProducts] = useState(initialProducts); // Global product state
  const [harvests, setHarvests] = useState(initialHarvests); // Global harvests state
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes); // Global promo codes state

  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifBadgeAnim, setNotifBadgeAnim] = useState(false);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      setNotifBadgeAnim(true);
      const t = setTimeout(() => setNotifBadgeAnim(false), 500);
      return () => clearTimeout(t);
    }
  }, [notifications.filter(n => !n.read).length]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const handleNotify = (cropName) => {
    setNotifications(prev => [
      { message: `You will be notified when ${cropName} is available or in peak season!`, time: "Just now", read: false },
      ...prev
    ]);
  };

  const handleLogin = () => {
    if (!email || !password) {
      setAuthMessage({ text: "Please enter both email and password.", type: "error" });
      setFormErrorShake(true);
      setTimeout(() => setFormErrorShake(false), 400);
      return;
    }

    if (email.toLowerCase() === "admin@ecoequity.com" && password === "Ecoequity") {
      setAuthMessage({ text: "Welcome back, Admin!", type: "success" });
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setLoggedInUser("Admin");
        handleNavChange("Admin Portal");
        setEmail("");
        setPassword("");
        setAuthMessage(null);
      }, 1500);
      return;
    }

    setAuthMessage({ text: `Welcome back! Logged in as ${email}`, type: "success" });
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoggedInUser(email.split('@')[0] || "User");
      handleNavChange("Home");
      setEmail("");
      setPassword("");
      setAuthMessage(null);
    }, 1500);
  };

  const handleSignUp = () => {
    if (!fullName || !email || !password) {
      setAuthMessage({ text: "Please fill in all fields.", type: "error" });
      setFormErrorShake(true);
      setTimeout(() => setFormErrorShake(false), 400);
      return;
    }
    if (!agreeTerms) {
      setAuthMessage({ text: "Please agree to the Terms & Conditions.", type: "error" });
      setFormErrorShake(true);
      setTimeout(() => setFormErrorShake(false), 400);
      return;
    }

    // Simulated check for already registered user
    if (email === "user@example.com") {
      setAuthMessage({ text: "This email is already registered. Please login instead.", type: "error" });
      return;
    }

    setAuthMessage({ text: `Account created successfully for ${fullName}!`, type: "success" });
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoggedInUser(fullName.split(' ')[0] || "User");
      handleNavChange("Home");
      setFullName("");
      setEmail("");
      setPassword("");
      setAgreeTerms(false);
      setAuthMessage(null);
    }, 1500);
  };

  const handleSocialAuth = (provider) => {
    let authUrl = "";
    if (provider === "Google") {
      authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=email%20profile";
    } else if (provider === "Facebook") {
      authUrl = "https://www.facebook.com/v12.0/dialog/oauth?client_id=YOUR_FACEBOOK_CLIENT_ID&redirect_uri=http://localhost:3000";
    } else if (provider === "Apple") {
      authUrl = "https://appleid.apple.com/auth/authorize?client_id=YOUR_APPLE_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=name%20email";
    }
    
    if (authUrl) {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(authUrl, `${provider} Login`, `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0`);
      
      if (popup) {
        // Show the connecting banner immediately on the main form
        setAuthMessage({ text: `Connecting to ${provider}...`, type: "success" });
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            setAuthMessage({ text: `Successfully connected with ${provider}!`, type: "success" });
            setTimeout(() => {
              setIsLoggedIn(true);
              setLoggedInUser(`${provider} User`);
              handleNavChange("Home");
              setAuthMessage(null);
            }, 1500);
          }
        }, 500);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setAuthMessage({ text: "Please enter your email to reset your password.", type: "error" });
      return;
    }
    setAuthMessage({ text: `Password reset link sent to ${email}`, type: "success" });
  };

  const handleLogout = (e) => {
    if (e) e.stopPropagation();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedInUser("");
    setProfilePic(null);
    setIsProfileDropdownOpen(false);
    handleNavChange("Login");
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const handleTrackOrder = (orderToTrack) => {
    setShowSettingsModal(true);
    setSettingsTab("orders");
    if (orderToTrack) {
      setSelectedOrderForTracking(orderToTrack);
    }
  };

  const saveEcoPointsData = (newPoints, newHistory, newRedeemed) => {
    if (newPoints !== undefined) localStorage.setItem("ecoPoints", newPoints);
    if (newHistory !== undefined) localStorage.setItem("redeemHistory", JSON.stringify(newHistory));
    if (newRedeemed !== undefined) localStorage.setItem("redeemedRewards", JSON.stringify(newRedeemed));
  };

  const addEcoPoints = (amount, reason) => {
    const newPoints = ecoPoints + amount;
    setEcoPoints(newPoints);
    const newHistoryEntry = { reward: reason, points: `+${amount}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: "Earned" };
    const newHistory = [newHistoryEntry, ...redeemHistory];
    setRedeemHistory(newHistory);
    saveEcoPointsData(newPoints, newHistory, undefined);
  };

  const redeemReward = (reward) => {
    const cost = parseInt(reward.points.replace(/,/g, '').replace(' pts', ''));
    if (ecoPoints >= cost) {
      const newPoints = ecoPoints - cost;
      setEcoPoints(newPoints);
      
      const newRedeemed = [reward, ...redeemedRewards];
      setRedeemedRewards(newRedeemed);
      
      const newHistoryEntry = { reward: reward.title, points: `-${cost}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: "Active" };
      const newHistory = [newHistoryEntry, ...redeemHistory];
      setRedeemHistory(newHistory);
      
      saveEcoPointsData(newPoints, newHistory, newRedeemed);
      
      setShowRewardSuccessModal(true);
      setErrorMessage(null);
    } else {
      setErrorMessage("Not enough EcoPoints to redeem this reward.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleSendRiderMessage = () => {
    if (!riderChatInput.trim()) return;
    setRiderChatMessages(prev => [...prev, { text: riderChatInput, sender: "user" }]);
    setRiderChatInput("");
    setTimeout(() => {
      setRiderChatMessages(prev => [...prev, { text: "Got it, thanks!", sender: "rider" }]);
    }, 1500);
  };

  const copyReferralCode = (e) => {
    navigator.clipboard.writeText("ECO-GROW-26");
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i + 'copy',
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        emoji: ["📋", "✅", "✨", "💚"][Math.floor(Math.random() * 4)],
        angle: Math.random() * Math.PI * 2,
        velocity: 30 + Math.random() * 60
      }));
      setRewardParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => setRewardParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);
    }
  };

  const shareReferral = (platform) => {
    const url = encodeURIComponent("https://ecoequity.com?ref=ECO-GROW-26");
    const text = encodeURIComponent("Join EcoEquity and earn 500 EcoPoints!");
    let shareUrl = "";
    if (platform === "Facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === "Twitter" || platform === "Twitter / X") shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    if (platform === "WhatsApp") shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    if (shareUrl) window.open(shareUrl, "_blank");
  };

  const openAccordion = (sectionName) => {
    setEcoPointsSection(sectionName);
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };


  const unlockBadge = (badgeName, e) => {
    setBadges(prev => prev.map(b => b.name === badgeName ? { ...b, earned: true, justUnlocked: true } : b));
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i + 'b',
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      emoji: ["🌟", "✨", "💫", "👏"][Math.floor(Math.random() * 4)],
      angle: Math.random() * Math.PI * 2,
      velocity: 40 + Math.random() * 80
    }));
    setRewardParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setRewardParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);

    setTimeout(() => {
      window.alert(`Congratulations! You unlocked the "${badgeName}" badge!`);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (ecoPointsDropdownRef.current && !ecoPointsDropdownRef.current.contains(event.target)) {
        setIsEcoPointsDropdownOpen(false);
      }
    };
    if (isEcoPointsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideDropdown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, [isEcoPointsDropdownOpen]);

  useEffect(() => {
    if (settingsTab !== "orders") {
      setSelectedOrderForTracking(null);
    }
  }, [settingsTab]);

  useEffect(() => {
    if (selectedOrderForTracking) {
      setOrderReviewRating(5);
      setOrderReviewText("");
      setOrderReviewSubmitted(false);
    }
  }, [selectedOrderForTracking]);

  useEffect(() => {
    const handleClickOutsideRedeemFilter = (event) => {
      if (redeemFilterDropdownRef.current && !redeemFilterDropdownRef.current.contains(event.target)) {
        setIsRedeemFilterDropdownOpen(false);
      }
    };
    if (isRedeemFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideRedeemFilter);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideRedeemFilter);
    };
  }, [isRedeemFilterDropdownOpen]);

  const filteredOrders = orders.filter(order => {
    if (orderFilter === "All Orders") return true;
    return order.status === orderFilter;
  });

  useEffect(() => {
    if (showSettingsModal || showRewardSuccessModal || showCancelConfirmModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettingsModal, showRewardSuccessModal, showCancelConfirmModal]);

  useEffect(() => {
    const savedPoints = localStorage.getItem("ecoPoints");
    if (savedPoints !== null) setEcoPoints(parseInt(savedPoints));
    
    const savedHistory = localStorage.getItem("redeemHistory");
    if (savedHistory) setRedeemHistory(JSON.parse(savedHistory));

    const savedRedeemed = localStorage.getItem("redeemedRewards");
    if (savedRedeemed) setRedeemedRewards(JSON.parse(savedRedeemed));

    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  useEffect(() => {
    let tier = "Seedling 🌱";
    let progress = 0;
    
    let base = 0;
    let max = 1000;

    if (ecoPoints < 1000) {
      tier = "Seedling 🌱";
      base = 0;
      max = 1000;
    } else if (ecoPoints < 5000) {
      tier = "Green Grower 🌿";
      base = 1000;
      max = 5000;
    } else if (ecoPoints < 10000) {
      tier = "Eco Guardian 🌳";
      base = 5000;
      max = 10000;
    } else {
      tier = "Sustainability Hero 🌎";
      base = 10000;
      max = 10000;
    }

    if (max === base) {
      progress = 100;
    } else {
      progress = ((ecoPoints - base) / (max - base)) * 100;
    }
    
    setCurrentTier(tier);
    setProgressToNextTier(Math.min(100, Math.max(0, progress)));
  }, [ecoPoints]);

  useEffect(() => {
    // Dynamically set the favicon and title to the brand identity when the app loads
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/Eco.png';
    document.title = "EcoEquity.Inc";

    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Clear any auth messages when navigating between login and signup
    setAuthMessage(null);
  }, [activeNav]);

  const handleNavChange = (navName, options = {}) => {
    setActiveNav(navName);
    if (isMobile && (navName === "Login" || navName === "Sign Up")) {
      setMobileAuthView(options.authView || "landing");
    }
    if (isMobile) {
      setIsMobileMenuOpen(false);
      setIsProductDropdownOpen(false);
      setIsTargetDropdownOpen(false);
    }
  };

  const openMobileAuthForm = (navName) => {
    setMobileAuthView("form");
    handleNavChange(navName, { authView: "form" });
  };

  const isAuthPage = activeNav === "Login" || activeNav === "Sign Up";

  const activeTabData = {
    crop: {
      points: [
        { id: 1, cx: 80, cy: 70, label: "Day 3", value: "+5%" },
        { id: 2, cx: 160, cy: 60, label: "Day 7", value: "+12%" },
        { id: 3, cx: 240, cy: 30, label: "Day 10", value: "+18%" },
        { id: 4, cx: 300, cy: 15, label: "Day 14", value: "+24%" },
      ],
      strokeColor: "#16a34a",
      gradientStart: "rgba(34,197,94,0.3)",
      gradientEnd: "rgba(34,197,94,0)",
      title: "Crop Growth",
      subtitle: "Heirloom Tomatoes",
      icon: <Leaf color="#15803d" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.1))",
      iconBorder: "1px solid rgba(34,197,94,0.3)",
      status: "Healthy",
      statusIcon: <Activity size={12} strokeWidth={3} />,
      statusBg: "rgba(22,163,74,0.1)",
      statusColor: "#15803d",
      statusBorder: "1px solid rgba(34,197,94,0.2)",
      stats: [
        { label: "Growth Rate", value: "+24%", progress: "24%", icon: <TrendingUp size={14} color="#16a34a" />, color: "#16a34a" },
        { label: "Soil Moisture", value: "68%", progress: "68%", icon: <Droplet size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Est. Harvest", value: "14 Days", progress: "85%", icon: <Sun size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Crop Health", value: "92%", progress: "92%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
      ],
      topListTitle: "Top Crops",
      topList: [
        { name: "Heirloom Tomatoes", progress: "85%", icon: "🍅", color: "#16a34a" },
        { name: "Basil Genovese", progress: "65%", icon: "🌿", color: "#0284c7" },
        { name: "Native Adlai", progress: "45%", icon: "🌾", color: "#f59e0b" }
      ]
    },
    users: {
      points: [
        { id: 1, cx: 80, cy: 80, label: "Week 1", value: "10k" },
        { id: 2, cx: 160, cy: 60, label: "Week 2", value: "25k" },
        { id: 3, cx: 240, cy: 40, label: "Week 3", value: "85k" },
        { id: 4, cx: 300, cy: 20, label: "Week 4", value: "150k" },
      ],
      strokeColor: "#0284c7",
      gradientStart: "rgba(2,132,199,0.3)",
      gradientEnd: "rgba(2,132,199,0)",
      title: "Active Users",
      subtitle: "Monthly Active",
      icon: <Users color="#0369a1" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(2,132,199,0.2), rgba(3,105,161,0.1))",
      iconBorder: "1px solid rgba(2,132,199,0.3)",
      status: "Growing",
      statusIcon: <TrendingUp size={12} strokeWidth={3} />,
      statusBg: "rgba(2,132,199,0.1)",
      statusColor: "#0369a1",
      statusBorder: "1px solid rgba(2,132,199,0.2)",
      stats: [
        { label: "Retention", value: "85%", progress: "85%", icon: <Users size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Engagement", value: "4.2hrs", progress: "70%", icon: <Activity size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "New Signups", value: "12k", progress: "60%", icon: <Globe size={14} color="#16a34a" />, color: "#16a34a" },
        { label: "Active Rate", value: "94%", progress: "94%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
      ],
      topListTitle: "Top Demographics",
      topList: [
        { name: "Urban Farmers", progress: "92%", icon: "👨‍🌾", color: "#0284c7" },
        { name: "Micro-Vendors", progress: "78%", icon: "🏪", color: "#f59e0b" },
        { name: "Institutions", progress: "45%", icon: "🏢", color: "#16a34a" }
      ]
    },
    harvests: {
      points: [
        { id: 1, cx: 80, cy: 90, label: "Jan", value: "2T" },
        { id: 2, cx: 160, cy: 70, label: "Feb", value: "5T" },
        { id: 3, cx: 240, cy: 50, label: "Mar", value: "12T" },
        { id: 4, cx: 300, cy: 25, label: "Apr", value: "28T" },
      ],
      strokeColor: "#f59e0b",
      gradientStart: "rgba(245,158,11,0.3)",
      gradientEnd: "rgba(245,158,11,0)",
      title: "Total Harvests",
      subtitle: "This Season",
      icon: <Wheat color="#b45309" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(180,83,9,0.1))",
      iconBorder: "1px solid rgba(245,158,11,0.3)",
      status: "High Yield",
      statusIcon: <Sun size={12} strokeWidth={3} />,
      statusBg: "rgba(245,158,11,0.1)",
      statusColor: "#b45309",
      statusBorder: "1px solid rgba(245,158,11,0.2)",
      stats: [
        { label: "Volume", value: "28T", progress: "80%", icon: <Wheat size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Quality", value: "A+", progress: "95%", icon: <Sun size={14} color="#e11d48" />, color: "#e11d48" },
        { label: "Distribution", value: "18T", progress: "65%", icon: <Globe size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Profit", value: "₱1.2M", progress: "75%", icon: <TrendingUp size={14} color="#16a34a" />, color: "#16a34a" },
      ],
      topListTitle: "Top Harvests",
      topList: [
        { name: "Cabbage", progress: "95%", icon: "🥬", color: "#f59e0b" },
        { name: "Carrots", progress: "82%", icon: "🥕", color: "#e11d48" },
        { name: "Potatoes", progress: "64%", icon: "🥔", color: "#0284c7" }
      ]
    },
    subs: {
      points: [
        { id: 1, cx: 80, cy: 60, label: "Q1", value: "1.2k" },
        { id: 2, cx: 160, cy: 50, label: "Q2", value: "2.8k" },
        { id: 3, cx: 240, cy: 30, label: "Q3", value: "4.5k" },
        { id: 4, cx: 300, cy: 10, label: "Q4", value: "8.9k" },
      ],
      strokeColor: "#e11d48",
      gradientStart: "rgba(225,29,72,0.3)",
      gradientEnd: "rgba(225,29,72,0)",
      title: "Subscribers",
      subtitle: "Pro & Enterprise",
      icon: <Activity color="#be123c" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(225,29,72,0.2), rgba(190,18,60,0.1))",
      iconBorder: "1px solid rgba(225,29,72,0.3)",
      status: "On Track",
      statusIcon: <HeartPulse size={12} strokeWidth={3} />,
      statusBg: "rgba(225,29,72,0.1)",
      statusColor: "#be123c",
      statusBorder: "1px solid rgba(225,29,72,0.2)",
      stats: [
        { label: "Pro Plan", value: "5.4k", progress: "60%", icon: <Activity size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Enterprise", value: "3.5k", progress: "40%", icon: <Users size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Churn Rate", value: "2.1%", progress: "10%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
        { label: "Growth", value: "+18%", progress: "75%", icon: <TrendingUp size={14} color="#16a34a" />, color: "#16a34a" },
      ],
      topListTitle: "Top Plans",
      topList: [
        { name: "Pro Plan", progress: "88%", icon: "⭐", color: "#0284c7" },
        { name: "Enterprise", progress: "56%", icon: "🏢", color: "#f59e0b" },
        { name: "Basic", progress: "34%", icon: "🌱", color: "#16a34a" }
      ]
    }
  }[activeHeroTab];

  const isEcoAllMobile = isMobile && ecoPointsSection === "All";
  const mobileEcoGlassCardStyle = {
    padding: "18px",
    borderRadius: "18px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42))",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
  };

  return (
    <div style={{ 
      ...styles.page, 
      ...(isMobile ? styles.pageMobile : {}),
      '--text-primary': '#000000',
      '--text-secondary': 'rgba(0, 0, 0, 0.7)',
      '--shell-bg': 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))',
      '--border-subtle': 'rgba(0, 0, 0, 0.05)',
      '--accent': '#15803d',
    }}>
      <style>
        {`
          @keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes titleReveal {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
                  .glow-card {
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05);
                  }
                  @keyframes cardPulseGlow {
                    0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05), 0 0 0px rgba(34, 197, 94, 0); }
                    50% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05), 0 0 25px rgba(22, 163, 74, 0.4); }
                  }
                  .animate-cardPulseGlow {
                    animation: cardPulseGlow 3.5s infinite ease-in-out;
                  }
                  @keyframes heroRightCardPulseGlow {
                    0%, 100% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0px rgba(34, 197, 94, 0); }
                    50% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 35px rgba(34, 197, 94, 0.4); }
                  }
                  .animate-heroRightCardPulseGlow {
                    animation: heroRightCardPulseGlow 4s infinite ease-in-out;
                  }
          @keyframes shakeError {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-shakeError {
            animation: shakeError 0.4s ease-in-out;
          }
          @keyframes progressPulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          .animate-progressPulse {
            animation: progressPulse 2s ease-in-out infinite;
          }
          @keyframes dashMove {
            to { stroke-dashoffset: -16; }
          }
          @keyframes riderFloat {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-6px) rotate(2deg); }
          }
          @keyframes unlockBounce {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes particleExplode {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
          }
          .animate-unlock {
            animation: unlockBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes copyBounce {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          .animate-copy {
            animation: copyBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes shakeIcon {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes orbitSpin {
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          .orbit-container {
            position: absolute;
            inset: 0;
            border-radius: 999px;
            box-sizing: border-box;
            padding: 2px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 1;
          }
          .orbit-container::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300%;
            height: 300%;
            background: conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.8) 90%, rgba(255,255,255,1) 100%);
            transform: translate(-50%, -50%);
            animation: orbitSpin 2s linear infinite;
          }
          .orbit-container-mobile {
            position: absolute;
            inset: 0;
            border-radius: 999px;
            box-sizing: border-box;
            padding: 2px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 1;
          }
          .orbit-container-mobile::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300%;
            height: 300%;
            background: conic-gradient(from 0deg, transparent 70%, rgba(134,239,172,0.8) 90%, rgba(125,211,252,1) 100%);
            transform: translate(-50%, -50%);
            animation: orbitSpin 2s linear infinite;
          }
          @keyframes chatAiPulseGlow {
            0%, 100% { transform: scale(1); opacity: 0.5; filter: blur(15px); }
            50% { transform: scale(1.15); opacity: 0.8; filter: blur(25px); }
          }
          .chat-ai-glow {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(74,222,128,0.8), rgba(56,189,248,0.8));
            border-radius: 999px;
            animation: chatAiPulseGlow 3s infinite ease-in-out;
            pointer-events: none;
            z-index: -1;
          }
          @keyframes mobileWelcomeGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      {/* Background Scrim */}
      <div style={{
        ...styles.bgScrim,
        // Ensure the scrim is above the video but below other content
        zIndex: 1,
      }} />
      
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="appIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(134,239,172,0.95)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0.95)" />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ ...styles.shell, ...(isMobile ? styles.shellMobile : {}) }}>

        {/* ── NAVBAR ── */}
        <nav style={{ ...styles.navbar, ...(isMobile ? styles.navbarMobile : {}) }}>
          <div style={styles.logoWrap}>
            <img src="/Eco.png" alt="EcoEquity Inc Logo" style={{ ...styles.ecoLogo, ...(isMobile ? styles.ecoLogoMobile : {}) }} />
            <span style={{ ...styles.logoText, ...(isMobile ? styles.logoTextMobile : {}) }}>EcoEquity.Inc</span>
          </div> {/* End of logoWrap */}
          {!isAuthPage && activeNav !== "Admin Portal" && (
            <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", zIndex: 2000 }}>
              {isMobile && isLoggedIn && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    style={{
                      ...styles.hamburgerButton,
                      marginLeft: 0,
                      ...(isNotificationOpen ? styles.hamburgerButtonActive : {}),
                    }}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <FaBell size={18} color={isNotificationOpen ? "#15803d" : "rgba(0,0,0,0.7)"} style={{ animation: notifBadgeAnim ? "shakeIcon 0.5s ease-in-out" : "none" }} />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className={notifBadgeAnim ? "animate-badgePop" : ""} style={{ position: "absolute", top: "-2px", right: "-2px", background: "#e11d48", color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: "9px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.5)" }}>
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <div style={{ position: "absolute", top: "100%", right: 0, paddingTop: "8px", zIndex: 100, width: "280px" }}>
                      <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, width: "100%", maxWidth: "100%", maxHeight: "300px", overflowY: "auto", padding: "8px" }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>No notifications</div>
                        ) : (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 8px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "4px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)" }}>Notifications</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setNotifications(notifications.map(n => ({ ...n, read: true }))); }} 
                                style={{ background: "transparent", border: "none", fontSize: "11px", fontWeight: 600, color: "#15803d", cursor: "pointer", padding: 0 }}
                              >
                                Mark all as read
                              </button>
                            </div>
                            {notifications.map((notif, idx) => (
                              <div key={idx} style={{ padding: "10px 12px", borderBottom: idx === notifications.length - 1 ? "none" : "1px solid rgba(0,0,0,0.05)", background: notif.read ? "transparent" : "rgba(34, 197, 94, 0.05)", fontSize: "13px", color: "#000", textAlign: "left", lineHeight: 1.4, width: "100%", boxSizing: "border-box", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                 {!notif.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#15803d", marginTop: "6px", flexShrink: 0 }} />}
                                 <div>
                                   {notif.message}
                                   <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", marginTop: "4px" }}>{notif.time}</div>
                                 </div>
                               </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                className="mobile-hamburger"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                style={{
                  ...styles.hamburgerButton,
                  marginLeft: 0,
                  ...(isMobileMenuOpen ? styles.hamburgerButtonActive : {}),
                }}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
              >
                <span style={{ ...styles.hamburgerLine, ...(isMobileMenuOpen ? styles.hamburgerLineTopOpen : {}) }} />
                <span style={{ ...styles.hamburgerLine, ...(isMobileMenuOpen ? styles.hamburgerLineMiddleOpen : {}) }} />
                <span style={{ ...styles.hamburgerLine, ...(isMobileMenuOpen ? styles.hamburgerLineBottomOpen : {}) }} />
              </button>
            </div>
              {isMobileMenuOpen && (
                <button
                  type="button"
                  className="mobile-menu-backdrop"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              <div
                className={`nav-links-panel ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
                style={{ ...styles.navLinks, ...(isMobile ? styles.navLinksMobile : {}), ...(isMobile && !isMobileMenuOpen ? styles.navLinksMobileHidden : {}) }}
              >
                {navItems
                  .filter((item) => !isMobile || !["About Us", "Seasonal Harvest"].includes(item))
                  .map((item) => {
                  if (item === "Target Market") {
                    const isTargetMarketActive = activeNav === "Target Market" || activeNav === "Target Market Explore" || activeNav === "Sustainability App Market";
                    let targetMarketLabel = item;
                    if (activeNav === "Target Market Explore") targetMarketLabel = "DCAT";
                    else if (activeNav === "Sustainability App Market") targetMarketLabel = "SAM";

                    return (
                      <div
                        key={item}
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          ...(isMobile ? styles.navDropdownWrapMobile : {}),
                        }}
                        onMouseEnter={() => !isMobile && setIsTargetDropdownOpen(true)}
                        onMouseLeave={() => !isMobile && setIsTargetDropdownOpen(false)} // Close dropdown on mouse leave for desktop
                      >
                        <button
                          type="button"
                          style={{
                            ...styles.linkBtn,
                            ...(isMobile ? styles.linkBtnMobile : {}),
                            ...(isTargetMarketActive ? styles.linkBtnActive : {}),
                            ...(hoveredNav === item && !isTargetMarketActive ? styles.linkBtnHover : {}),
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            padding: "4px 6px 4px 14px"
                          }}
                          onClick={() => {
                            setActiveNav(item);
                            if (isMobile) { // Toggle dropdown on click for mobile
                              setIsTargetDropdownOpen(true);
                            }
                          }}
                          onMouseEnter={() => setHoveredNav(item)}
                          onMouseLeave={() => setHoveredNav(null)}
                        >
                          {targetMarketLabel}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTargetDropdownOpen(!isTargetDropdownOpen);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px",
                              marginLeft: "2px",
                              borderRadius: "50%",
                              background: isTargetDropdownOpen ? "rgba(255, 255, 255, 0.15)" : "transparent",
                              cursor: "pointer",
                              transition: "background 0.2s ease"
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: isTargetDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                              }}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </span>
                        </button>

                        {isTargetDropdownOpen && (
                          <div style={{ 
                            position: isMobile ? "relative" : "absolute", 
                            top: isMobile ? "auto" : "100%", 
                            left: isMobile ? "auto" : "50%", 
                            transform: isMobile ? "none" : "translateX(-50%)", 
                            paddingTop: isMobile ? "0px" : "8px", 
                            zIndex: 100, 
                            width: isMobile ? "100%" : "auto" 
                          }}>
                            <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(isMobile ? styles.dropdownMenuMobile : {}) }}>
                            <button
                              type="button"
                              style={{
                                ...styles.dropdownItem,
                                ...(isMobile ? styles.dropdownItemMobile : {}),
                                ...(activeNav === "Target Market" ? styles.dropdownItemActive : {}),
                                ...(hoveredDropdown === "Overview" && activeNav !== "Target Market" ? styles.dropdownItemHover : {})
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveNav("Target Market");
                                setIsTargetDropdownOpen(false);
                                if (isMobile) setIsMobileMenuOpen(false);
                              }}
                              onMouseEnter={() => setHoveredDropdown("Overview")}
                              onMouseLeave={() => setHoveredDropdown(null)}
                            >
                              Overview
                            </button>
                            <button
                              type="button"
                              style={{
                                ...styles.dropdownItem,
                                ...(isMobile ? styles.dropdownItemMobile : {}),
                                ...(activeNav === "Target Market Explore" ? styles.dropdownItemActive : {}),
                                ...(hoveredDropdown === "Distribution Channels and Acquisition Tactics" && activeNav !== "Target Market Explore" ? styles.dropdownItemHover : {})
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveNav("Target Market Explore");
                                setIsTargetDropdownOpen(false);
                                if (isMobile) setIsMobileMenuOpen(false);
                              }}
                              onMouseEnter={() => setHoveredDropdown("Distribution Channels and Acquisition Tactics")}
                              onMouseLeave={() => setHoveredDropdown(null)}
                            >
                              Distribution Channels and Acquisition Tactics
                            </button>
                            <button
                              type="button"
                              style={{
                                ...styles.dropdownItem,
                                ...(isMobile ? styles.dropdownItemMobile : {}),
                                ...(activeNav === "Sustainability App Market" ? styles.dropdownItemActive : {}),
                                ...(hoveredDropdown === "Sustainability" && activeNav !== "Sustainability App Market" ? styles.dropdownItemHover : {})
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveNav("Sustainability App Market");
                                setIsTargetDropdownOpen(false);
                                if (isMobile) setIsMobileMenuOpen(false);
                              }}
                              onMouseEnter={() => setHoveredDropdown("Sustainability")}
                              onMouseLeave={() => setHoveredDropdown(null)}
                            >
                              Sustainability App Market
                            </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else if (item === "Product & Services") { // Product & Services Dropdown
                    const isProductServicesActive = activeNav === "Product & Services" || activeNav === "Benefits of the Project";

                    let productServicesLabel = item;
                    if (activeNav === "Benefits of the Project") {
                      productServicesLabel = "Benefits of the Project";
                    }
                    return (
                      <div
                        key={item}
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          ...(isMobile ? styles.navDropdownWrapMobile : {}),
                        }}
                        onMouseEnter={() => !isMobile && setIsProductDropdownOpen(true)}
                        onMouseLeave={() => !isMobile && setIsProductDropdownOpen(false)} // Close dropdown on mouse leave for desktop
                      >
                        <button
                          type="button"
                          style={{
                            ...styles.linkBtn,
                            ...(isMobile ? styles.linkBtnMobile : {}),
                            ...(isProductServicesActive ? styles.linkBtnActive : {}),
                            ...(hoveredNav === item && !isProductServicesActive ? styles.linkBtnHover : {}),
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            padding: "4px 6px 4px 14px"
                          }}
                          onClick={() => {
                            setActiveNav(item); // Default to the main Product & Services page
                            if (isMobile) { // Toggle dropdown on click for mobile
                              setIsProductDropdownOpen(true);
                            }
                          }}
                          onMouseEnter={() => setHoveredNav(item)}
                          onMouseLeave={() => setHoveredNav(null)}
                        >
                          {productServicesLabel} {/* Display "Benefits of the Project" if active, otherwise "Product & Services" */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProductDropdownOpen(!isProductDropdownOpen);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px",
                              marginLeft: "2px",
                              borderRadius: "50%",
                              background: isProductDropdownOpen ? "rgba(255, 255, 255, 0.15)" : "transparent",
                              cursor: "pointer",
                              transition: "background 0.2s ease"
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: isProductDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                              }}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </span>
                        </button>

                        {isProductDropdownOpen && (
                          <div style={{ 
                            position: isMobile ? "relative" : "absolute", 
                            top: isMobile ? "auto" : "100%", 
                            left: isMobile ? "auto" : "50%", 
                            transform: isMobile ? "none" : "translateX(-50%)", 
                            paddingTop: isMobile ? "0px" : "8px", 
                            zIndex: 100, 
                            width: isMobile ? "100%" : "auto" 
                          }}>
                            <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(isMobile ? styles.dropdownMenuMobile : {}) }}>
                              <button
                                type="button"
                                style={{
                                  ...styles.dropdownItem,
                                  ...(isMobile ? styles.dropdownItemMobile : {}),
                                  ...(activeNav === "Product & Services" ? styles.dropdownItemActive : {}),
                                  ...(hoveredProductDropdown === "Overview" && activeNav !== "Product & Services" ? styles.dropdownItemHover : {})
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNav("Product & Services");
                                  setIsProductDropdownOpen(false);
                                  if (isMobile) setIsMobileMenuOpen(false);
                                }}
                                onMouseEnter={() => setHoveredProductDropdown("Overview")}
                                onMouseLeave={() => setHoveredProductDropdown(null)}
                              >
                                Overview
                              </button>
                              <button
                                type="button"
                                style={{
                                  ...styles.dropdownItem,
                                  ...(isMobile ? styles.dropdownItemMobile : {}),
                                  ...(activeNav === "Benefits of the Project" ? styles.dropdownItemActive : {}),
                                  ...(hoveredProductDropdown === "Benefits of the Project" && activeNav !== "Benefits of the Project" ? styles.dropdownItemHover : {})
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNav("Benefits of the Project");
                                  setIsProductDropdownOpen(false);
                                  if (isMobile) setIsMobileMenuOpen(false);
                                }}
                                onMouseEnter={() => setHoveredProductDropdown("Benefits of the Project")}
                                onMouseLeave={() => setHoveredProductDropdown(null)}
                              >
                                Benefits of the Project
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return ( // Regular navigation items
                    <button
                      key={item}
                      type="button"
                      style={{
                        ...styles.linkBtn,
                        ...(isMobile ? styles.linkBtnMobile : {}),
                        ...(activeNav === item ? styles.linkBtnActive : {}),
                        ...(hoveredNav === item && activeNav !== item ? styles.linkBtnHover : {}),
                      }}
                      onClick={() => handleNavChange(item)}
                      onMouseEnter={() => setHoveredNav(item)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      {item}
                    </button>
                  );
                })}
                  
                  {/* Auth Buttons */}
                  {isLoggedIn && (
                    <>
                      <div style={{ width: isMobile ? "100%" : "1px", height: isMobile ? "1px" : "auto", background: "rgba(0,0,0,0.1)", margin: isMobile ? "4px 0" : "0 4px" }} />
                      
                      {/* Notifications Dropdown */}
                      {!isMobile && (
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            order: 2,
                          }}
                          onMouseEnter={() => setIsNotificationOpen(true)}
                          onMouseLeave={() => setIsNotificationOpen(false)}
                        >
                          <button
                            type="button"
                            style={{
                              ...styles.linkBtn,
                              position: "relative",
                              background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
                              border: "1px solid rgba(255,255,255,0.35)",
                              color: "#062018",
                              boxShadow: "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              marginRight: "8px",
                              flexShrink: 0
                            }}
                            title="Notifications"
                          >
                            <FaBell size={16} style={{ animation: notifBadgeAnim ? "shakeIcon 0.5s ease-in-out" : "none" }} />
                            {notifications.filter(n => !n.read).length > 0 && (
                              <span className={notifBadgeAnim ? "animate-badgePop" : ""} style={{ position: "absolute", top: "-2px", right: "-2px", background: "#e11d48", color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: "9px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.5)" }}>
                                {notifications.filter(n => !n.read).length}
                              </span>
                            )}
                          </button>

                          {isNotificationOpen && (
                            <div style={{ position: "absolute", top: "100%", right: 0, paddingTop: "8px", zIndex: 100, width: "280px" }}>
                              <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, width: "100%", maxWidth: "100%", maxHeight: "300px", overflowY: "auto", padding: "8px" }}>
                                {notifications.length === 0 ? (
                                  <div style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>No notifications</div>
                                ) : (
                                  <>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 8px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "4px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)" }}>Notifications</span>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setNotifications(notifications.map(n => ({ ...n, read: true }))); }} 
                                        style={{ background: "transparent", border: "none", fontSize: "11px", fontWeight: 600, color: "#15803d", cursor: "pointer", padding: 0 }}
                                      >
                                        Mark all as read
                                      </button>
                                    </div>
                                    {notifications.map((notif, idx) => (
                                      <div key={idx} style={{ padding: "10px 12px", borderBottom: idx === notifications.length - 1 ? "none" : "1px solid rgba(0,0,0,0.05)", background: notif.read ? "transparent" : "rgba(34, 197, 94, 0.05)", fontSize: "13px", color: "#000", textAlign: "left", lineHeight: 1.4, width: "100%", boxSizing: "border-box", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                         {!notif.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#15803d", marginTop: "6px", flexShrink: 0 }} />}
                                         <div>
                                           {notif.message}
                                           <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", marginTop: "4px" }}>{notif.time}</div>
                                         </div>
                                       </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isMobile ? (
                        <button
                          type="button"
                          style={{
                            ...styles.linkBtn,
                            ...styles.linkBtnMobile,
                            ...(hoveredProfileDropdown === "Logout" ? styles.linkBtnHover : {}),
                          }}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }}
                          onMouseEnter={() => setHoveredProfileDropdown("Logout")}
                          onMouseLeave={() => setHoveredProfileDropdown(null)}
                        >
                          Logout
                        </button>
                      ) : (
                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          order: 1,
                          ...(isMobile ? styles.navDropdownWrapMobile : {}),
                        }}
                        onMouseEnter={() => !isMobile && setIsProfileDropdownOpen(true)}
                        onMouseLeave={() => !isMobile && setIsProfileDropdownOpen(false)}
                      >
                        <button
                          type="button"
                          style={{
                            ...styles.linkBtn,
                            ...(isMobile ? styles.linkBtnMobile : {}),
                            ...(isProfileDropdownOpen ? styles.linkBtnActive : {}),
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 6px 4px 14px"
                          }}
                          onClick={() => {
                            if (isMobile) setIsProfileDropdownOpen(!isProfileDropdownOpen);
                          }}
                        >
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#15803d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", overflow: "hidden" }}>
                            {profilePic ? (
                              <img src={profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "U"
                            )}
                          </div>
                          {loggedInUser || "User"}
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px",
                              marginLeft: "2px",
                              borderRadius: "50%",
                              background: isProfileDropdownOpen ? "rgba(0, 0, 0, 0.05)" : "transparent",
                              cursor: "pointer",
                              transition: "background 0.2s ease"
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isProfileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </span>
                        </button>

                        {isProfileDropdownOpen && (
                          <div style={{ position: isMobile ? "relative" : "absolute", top: isMobile ? "auto" : "100%", left: isMobile ? "auto" : "50%", transform: isMobile ? "none" : "translateX(-50%)", paddingTop: isMobile ? "0px" : "8px", zIndex: 100, width: isMobile ? "100%" : "auto" }}>
                            <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(isMobile ? styles.dropdownMenuMobile : {}) }}>
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "My Profile" ? styles.dropdownItemHover : {}) }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProfileDropdownOpen(false);
                                  setShowSettingsModal(true);
                                  setSettingsTab("profile");
                                }}
                                onMouseEnter={() => setHoveredProfileDropdown("My Profile")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                My Profile
                              </button>
                              {isAdmin && (
                                <button 
                                  type="button" 
                                  style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "Admin Portal" ? styles.dropdownItemHover : {}) }} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsProfileDropdownOpen(false);
                                    handleNavChange("Admin Portal");
                                  }}
                                  onMouseEnter={() => setHoveredProfileDropdown("Admin Portal")} 
                                  onMouseLeave={() => setHoveredProfileDropdown(null)}
                                >
                                  Admin Portal
                                </button>
                              )}
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "My Certificate" ? styles.dropdownItemHover : {}) }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProfileDropdownOpen(false);
                                  setShowSettingsModal(true);
                                  setSettingsTab("certificate");
                                }}
                                onMouseEnter={() => setHoveredProfileDropdown("My Certificate")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                My Certificate
                              </button>
	                              {!isMobile && (
	                                <>
	                                  <button 
	                                    type="button" 
	                                    style={{ ...styles.dropdownItem, ...(hoveredProfileDropdown === "EcoPoints" ? styles.dropdownItemHover : {}) }} 
	                                    onClick={(e) => {
	                                      e.stopPropagation();
	                                      setIsProfileDropdownOpen(false);
	                                      setShowSettingsModal(true);
	                                      setSettingsTab("ecopoints");
	                                    }}
	                                    onMouseEnter={() => setHoveredProfileDropdown("EcoPoints")} 
	                                    onMouseLeave={() => setHoveredProfileDropdown(null)}
	                                  >
	                                    EcoPoints & Rewards
	                                  </button>
	                                  <button 
	                                    type="button" 
	                                    style={{ ...styles.dropdownItem, ...(hoveredProfileDropdown === "EarnHistory" ? styles.dropdownItemHover : {}) }} 
	                                    onClick={(e) => {
	                                      e.stopPropagation();
	                                      setIsProfileDropdownOpen(false);
	                                      setShowSettingsModal(true);
	                                      setSettingsTab("earnHistory");
	                                    }}
	                                    onMouseEnter={() => setHoveredProfileDropdown("EarnHistory")} 
	                                    onMouseLeave={() => setHoveredProfileDropdown(null)}
	                                  >
	                                    Earn History
	                                  </button>
	                                </>
	                              )}
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "Orders" ? styles.dropdownItemHover : {}) }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProfileDropdownOpen(false);
                                  setShowSettingsModal(true);
                                  setSettingsTab("orders");
                                }}
                                onMouseEnter={() => setHoveredProfileDropdown("Orders")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                Orders
                              </button>
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "Wishlist" ? styles.dropdownItemHover : {}) }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProfileDropdownOpen(false);
                                  setShowSettingsModal(true);
                                  setSettingsTab("wishlist");
                                }}
                                onMouseEnter={() => setHoveredProfileDropdown("Wishlist")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                Wishlist
                              </button>
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "Settings" ? styles.dropdownItemHover : {}) }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProfileDropdownOpen(false);
                                  setShowSettingsModal(true);
                                  setSettingsTab("settings");
                                }}
                                onMouseEnter={() => setHoveredProfileDropdown("Settings")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                Settings
                              </button>
                              <button 
                                type="button" 
                                style={{ ...styles.dropdownItem, ...(isMobile ? styles.dropdownItemMobile : {}), ...(hoveredProfileDropdown === "Logout" ? styles.dropdownItemHover : {}) }} 
                                onClick={handleLogout} 
                                onMouseEnter={() => setHoveredProfileDropdown("Logout")} 
                                onMouseLeave={() => setHoveredProfileDropdown(null)}
                              >
                                Logout
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </>
                  )}
              </div>
            </>
          )}
        </nav>

        {/* ── PAGE CONTENT ── */}
        {activeNav === "Home" && (
          <div style={{ ...styles.hero, flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: "clamp(24px, 4vw, 60px)", maxWidth: "1200px", textAlign: "left", ...(isMobile ? styles.heroMobile : {}) }}>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: isMobile ? "100%" : "680px" }}>
              
              {isMobile && (
                <div className="inner-blur-glass" style={{ 
                  ...styles.mobileWelcomeCard, 
                  margin: "0 auto 24px auto", 
                  width: "calc(100vw - clamp(60px, 16vw, 100px))",
                  maxWidth: "360px",
                  flexDirection: "column",
                  padding: "24px 16px"
                }}>
                  <div style={{ display: "flex", flexDirection: "row", gap: "12px", width: "100%" }}>
                    <div style={{ ...styles.mobileWelcomeText, display: "flex", flexDirection: "column", gap: "8px", whiteSpace: "normal", textAlign: "left", width: "auto", flex: 1, marginTop: "0", alignSelf: "flex-start" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(6, 32, 24, 0.7)", lineHeight: 1 }}>Welcome back,</span>
                      <span style={{ fontSize: "clamp(18px, 6vw, 22px)", fontWeight: 800, color: "#062018", whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>{loggedInUser || "Google User"}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#15803d", lineHeight: 1.2 }}>
                          Grow Food. Build Community.<br />Earn Sustainably.
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 500, color: "rgba(0,0,0,0.65)", lineHeight: 1.3 }}>
                          EcoEquity is a digital-first, high-engagement platform designed to boost agricultural self-sufficiency in the Philippines, starting at the household and community level.
                        </span>
                      </div>
                    </div>
                    <div style={styles.mobileWelcomeAvatar}>
                      {profilePic ? (
                        <img src={profilePic} alt="User Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "G"
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px", width: "100%" }}>
                    <button type="button" onClick={() => handleNavChange("Contact")} style={{ ...styles.primaryBtn, padding: "10px 12px", fontSize: "12px", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span aria-hidden="true" style={styles.primaryInnerBlur} />
                      <span style={styles.glassContentLayer}>Get in Touch</span>
                    </button>
                    <button type="button" onClick={() => handleNavChange("Learn More")} style={{ ...styles.glassBtn, padding: "10px 12px", fontSize: "12px", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span aria-hidden="true" style={styles.glassInnerBlur} />
                      <span style={styles.glassContentLayer}>Learn More</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions Grid for Mobile */}
              {isMobile && (
                <div className="inner-blur-glass" style={{ 
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "calc(100vw - clamp(60px, 16vw, 100px))", 
                  maxWidth: "360px", 
                  margin: "0 auto 24px auto",
                  padding: "16px",
                  borderRadius: "18px",
                  background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  boxSizing: "border-box"
                }}>
                  <h3 style={{ margin: 0, textAlign: "left", fontSize: "16px", fontWeight: 800, color: "#062018", lineHeight: 1.1 }}>
                    Product &amp; Services.
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", width: "100%" }}>
                    {[
                      { nav: "Shop All Products", icon: <Store size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                      { nav: "Starter Kits & Toolsets", icon: <Wrench size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                      { nav: "AI Data Subscription", icon: <Headset size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                      { nav: "Specialist Certification", icon: <GraduationCap size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                      { action: () => setShowAIChat(true), nav: "ChatWithAI", icon: <FaRobot size={36} style={{ fill: "url(#appIconGradient)" }} /> },
                      { nav: "ExpertSupportPage", icon: <FaCalendar size={36} style={{ fill: "url(#appIconGradient)" }} /> },
                      { nav: "SurplusExchangePage", icon: <Handshake size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                      { nav: "ImpactTrackingPage", icon: <Activity size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => item.action ? item.action() : handleNavChange(item.nav)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 0",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease",
                          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.15) translateY(-2px)";
                          e.currentTarget.style.filter = "drop-shadow(0 8px 12px rgba(0,0,0,0.25))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.15))";
                        }}
                        onTouchStart={(e) => {
                          e.currentTarget.style.transform = "scale(1.15) translateY(-2px)";
                          e.currentTarget.style.filter = "drop-shadow(0 8px 12px rgba(0,0,0,0.25))";
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.15))";
                        }}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectorActionsMobile(!showSectorActionsMobile)}
                    aria-label={showSectorActionsMobile ? "Hide sector actions" : "Show sector actions"}
                    style={{
                      width: "26px",
                      height: "24px",
                      margin: "-4px 0 -4px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, rgba(134,239,172,0.38), rgba(125,211,252,0.32))",
                      border: "1px solid rgba(255,255,255,0.72)",
                      borderRadius: "999px",
                      color: "#15803d",
                      cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(34,197,94,0.14), inset 0 1px 0 rgba(255,255,255,0.62)",
                      backdropFilter: "blur(14px) saturate(170%)",
                      WebkitBackdropFilter: "blur(14px) saturate(170%)",
                      transition: "transform 0.22s ease, box-shadow 0.22s ease"
                    }}
                  >
                    <FaChevronDown size={10} style={{ transform: showSectorActionsMobile ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.24s ease" }} />
                  </button>
                  {showSectorActionsMobile && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "8px",
                        width: "100%",
                        paddingTop: "2px",
                        animation: "fadeInUp 0.28s cubic-bezier(.22,1,.36,1) both"
                      }}
                    >
                      {[
                        { nav: "OurImpactPage", label: "Impact", icon: <Globe size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                        { nav: "LGUPartnershipPage", label: "LGU", icon: <Handshake size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                        { nav: "IncomeGenerationPage", label: "Income", icon: <TrendingUp size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> },
                        { nav: "NativeSeedBankPage", label: "Seeds", icon: <Sprout size={36} color="url(#appIconGradient)" strokeWidth={2.5} /> }
                      ].map((item) => (
                        <button
                          key={item.nav}
                          type="button"
                          onClick={() => handleNavChange(item.nav)}
                          aria-label={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 0",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            outline: "none",
                            transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease",
                            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.15) translateY(-2px)";
                            e.currentTarget.style.filter = "drop-shadow(0 8px 12px rgba(0,0,0,0.25))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1) translateY(0)";
                            e.currentTarget.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.15))";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(1.15) translateY(-2px)";
                            e.currentTarget.style.filter = "drop-shadow(0 8px 12px rgba(0,0,0,0.25))";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "scale(1) translateY(0)";
                            e.currentTarget.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.15))";
                          }}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EcoPoints & Rewards Dropdown + Lower Mobile Home Section */}
              {isMobile && (
                <div style={{ width: "calc(100vw - clamp(60px, 16vw, 100px))", maxWidth: "360px", margin: "0 auto 24px auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ position: "relative", zIndex: 35 }} ref={ecoPointsDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsEcoPointsDropdownOpen(!isEcoPointsDropdownOpen)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.66)",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.74), rgba(240,253,244,0.56))",
                        color: "#062018",
                        boxShadow: "0 10px 24px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        fontSize: "13px",
                        fontWeight: 800,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        backdropFilter: "blur(18px) saturate(165%)",
                        WebkitBackdropFilter: "blur(18px) saturate(165%)",
                      }}
                    >
                      <span>{ecoPointsSection === "All" ? "All Sections" : ecoPointsSection}</span>
                      <FaChevronDown size={12} style={{ color: "#15803d", transform: isEcoPointsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                    </button>

                    {isEcoPointsDropdownOpen && (
                      <div className="inner-blur-glass custom-scrollbar" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", padding: "8px", borderRadius: "16px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.66)", boxShadow: "0 18px 36px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", gap: "4px", maxHeight: "260px", overflowY: "auto", zIndex: 60, backdropFilter: "blur(22px) saturate(170%)", WebkitBackdropFilter: "blur(22px) saturate(170%)" }}>
                        {["All", "Dashboard", "Rewards Marketplace", "How to Earn", "Eco Tiers", "Community Impact", "Referral Program", "Achievement Badges", "Redeem History"].map((section) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => { setEcoPointsSection(section); setIsEcoPointsDropdownOpen(false); }}
                            style={{ padding: "10px 12px", borderRadius: "12px", border: ecoPointsSection === section ? "1px solid rgba(134,239,172,0.42)" : "1px solid transparent", background: ecoPointsSection === section ? "linear-gradient(135deg, rgba(134,239,172,0.28), rgba(125,211,252,0.28))" : "transparent", color: ecoPointsSection === section ? "#064e3b" : "#062018", fontSize: "12px", fontWeight: ecoPointsSection === section ? 800 : 650, textAlign: "left", cursor: "pointer" }}
                          >
                            {section === "All" ? "All Sections" : section}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={isEcoAllMobile ? "" : "inner-blur-glass"} style={isEcoAllMobile ? { display: "flex", flexDirection: "column", gap: "16px" } : { ...mobileEcoGlassCardStyle, display: "flex", flexDirection: "column", gap: "14px" }}>
                    {(ecoPointsSection === "All" || ecoPointsSection === "Dashboard") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>Current Balance</span>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d", marginTop: "4px", lineHeight: 1 }}>{ecoPoints.toLocaleString()} <span style={{ fontSize: "13px", fontWeight: 800 }}>pts</span></div>
                          </div>
                          <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "21px", boxShadow: "0 8px 16px rgba(22, 163, 74, 0.28)" }}>🎁</div>
                        </div>
	                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
	                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
	                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#15803d" }}>Eco Level: {currentTier}</span>
	                            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>1,250 / 2,000 pts to next tier</span>
	                          </div>
	                          <div style={{ width: "100%", height: "6px", background: "rgba(22, 163, 74, 0.18)", borderRadius: "999px", overflow: "hidden" }}>
	                            <div style={{ height: "100%", width: `${progressToNextTier}%`, background: "linear-gradient(90deg, #4ade80, #16a34a)", borderRadius: "999px" }} />
	                          </div>
	                        </div>
	                        <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
	                          <button
	                            type="button"
	                            onClick={() => setEcoPointsSection("Rewards Marketplace")}
	                            style={{ flex: 1, padding: "10px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(34,197,94,0.2)" }}
	                          >
	                            Redeem Rewards
	                          </button>
	                          <button
	                            type="button"
	                            onClick={() => setEcoPointsSection("How to Earn")}
	                            style={{ flex: 1, padding: "10px", borderRadius: "999px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#15803d", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
	                          >
	                            Earn More Points
	                          </button>
	                        </div>
                          {isEcoAllMobile && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px" }}>
                              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Eco Activity Timeline</h3>
                              <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", maxHeight: "210px", overflowY: "auto", paddingRight: "6px" }}>
                                <div style={{ position: "absolute", left: "15px", top: "15px", bottom: "15px", width: "2px", background: "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(34,197,94,0.1))", borderRadius: "999px" }} />
                                {ecoTimelineActivities.slice(0, 5).map((activity, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "11px", position: "relative", zIndex: 1 }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, boxShadow: `0 0 10px ${activity.glow}` }}>{activity.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0, padding: "10px 11px", borderRadius: "13px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#062018", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activity.title}</span>
                                        <span style={{ fontSize: "9.5px", color: "rgba(0,0,0,0.5)", fontWeight: 650 }}>{activity.time}</span>
                                      </div>
                                      <span style={{ fontSize: "11.5px", fontWeight: 850, color: activity.color, flexShrink: 0 }}>{activity.points}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
	                      </div>
	                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Rewards Marketplace") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Rewards Marketplace</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {[
                            { title: "Free Delivery", points: "500 pts", icon: "🚚" },
                            { title: "Native Seed Kit", points: "1,200 pts", icon: "🌱" },
                            { title: "Gardening Set", points: "2,500 pts", icon: "🛠️" },
                            { title: "AI Premium", points: "3,000 pts", icon: "🤖" },
                          ].map((reward) => (
                            <div key={reward.title} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", flexDirection: "column", gap: "7px" }}>
                              <span style={{ fontSize: "24px" }}>{reward.icon}</span>
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#062018", lineHeight: 1.15 }}>{reward.title}</span>
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d" }}>{reward.points}</span>
                              <button type="button" onClick={() => redeemReward(reward)} style={{ marginTop: "auto", padding: "7px 8px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.42)", background: "linear-gradient(135deg, rgba(134,239,172,0.9), rgba(125,211,252,0.9))", color: "#062018", fontSize: "10px", fontWeight: 800 }}>Redeem</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "How to Earn") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>How to Earn EcoPoints</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {[
                            { icon: <FaShoppingCart size={16} color="#15803d" />, label: "Buy Organic Products", points: "+50 pts" },
                            { icon: <FaCalendarAlt size={16} color="#15803d" />, label: "Attend Workshop", points: "+75 pts" },
                            { icon: <FaUserPlus size={16} color="#15803d" />, label: "Invite Friend", points: "+200 pts" },
                            { icon: <FaRobot size={16} color="#15803d" />, label: "AI Diagnosis", points: "+30 pts" },
                          ].map((item) => (
                            <div key={item.label} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", flexDirection: "column", gap: "7px" }}>
                              {item.icon}
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#062018", lineHeight: 1.15 }}>{item.label}</span>
                              <span style={{ fontSize: "11px", fontWeight: 850, color: "#16a34a" }}>{item.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Eco Tiers") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Eco Tier Levels</h3>
                        {[
                          { title: "Seedling", points: "0 - 999 pts" },
                          { title: "Green Grower", points: "1,000 - 4,999 pts", active: true },
                          { title: "Eco Guardian", points: "5,000 - 9,999 pts" },
                        ].map((tier) => (
                          <div key={tier.title} style={{ padding: "11px 12px", borderRadius: "14px", background: tier.active ? "linear-gradient(135deg, rgba(134,239,172,0.24), rgba(125,211,252,0.2))" : "rgba(255,255,255,0.56)", border: tier.active ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(255,255,255,0.58)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 850, color: "#062018" }}>{tier.title}</span>
                            <span style={{ fontSize: "10.5px", fontWeight: 750, color: tier.active ? "#15803d" : "rgba(0,0,0,0.55)" }}>{tier.points}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Community Impact") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Community Impact</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {[
                            { label: "Trees Planted", value: "12", icon: "🌲" },
                            { label: "Farmers Supported", value: "3", icon: "🧑‍🌾" },
                            { label: "Seeds Preserved", value: "250", icon: "🌾" },
                            { label: "CO2 Reduced", value: "45kg", icon: "☁️" },
                          ].map((stat) => (
                            <div key={stat.label} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.6)", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "20px" }}>{stat.icon}</span>
                              <span style={{ fontSize: "17px", fontWeight: 850, color: "#15803d", lineHeight: 1 }}>{stat.value}</span>
                              <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>{stat.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Referral Program") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Referral Program</h3>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 650, color: "rgba(0,0,0,0.62)", lineHeight: 1.35 }}>Invite friends and earn 500 EcoPoints when they join EcoEquity.</p>
                        <div style={{ padding: "10px 12px", borderRadius: "14px", border: "1px dashed #15803d", background: "rgba(22,163,74,0.08)", color: "#15803d", fontSize: "14px", fontWeight: 850, letterSpacing: "1px" }}>ECO-GROW-26</div>
                        <button type="button" onClick={copyReferralCode} style={{ padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.42)", background: "rgba(255,255,255,0.82)", color: "#064e3b", fontSize: "12px", fontWeight: 850 }}>{copiedReferral ? "Copied!" : "Copy Link"}</button>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Achievement Badges") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Achievement Badges</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                          {badges.map((badge) => (
                            <div key={badge.name} style={{ padding: "12px", borderRadius: "14px", background: badge.earned ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.34)", border: badge.earned ? "1px solid rgba(22,163,74,0.24)" : "1px dashed rgba(0,0,0,0.12)", opacity: badge.earned ? 1 : 0.62, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
                              <span style={{ fontSize: "25px", filter: badge.earned ? "none" : "grayscale(100%)" }}>{badge.icon}</span>
                              <span style={{ fontSize: "10.5px", fontWeight: 800, color: badge.earned ? "#15803d" : "rgba(0,0,0,0.52)" }}>{badge.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Redeem History") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Redeem History</h3>
                        {(redeemHistory.length ? redeemHistory : [{ reward: "Free Delivery Voucher", points: "-500", date: "May 20, 2026", status: "Active" }, { reward: "Native Seed Kit", points: "-1,200", date: "Apr 15, 2026", status: "Shipped" }]).slice(0, 4).map((item, idx) => (
                          <div key={`${item.reward}-${idx}`} style={{ padding: "11px 12px", borderRadius: "14px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.58)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                              <span style={{ fontSize: "11.5px", fontWeight: 850, color: "#062018", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.reward}</span>
                              <span style={{ fontSize: "10px", fontWeight: 650, color: "rgba(0,0,0,0.52)" }}>{item.date}</span>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 850, color: "#e11d48", flexShrink: 0 }}>{item.points} pts</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                  {ecoPointsSection === "Dashboard" && (
                    <div className="inner-blur-glass" style={{ padding: "18px", borderRadius: "18px", background: "linear-gradient(150deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42))", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>Eco Activity Timeline</h3>
                      <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", maxHeight: "210px", overflowY: "auto", paddingRight: "6px" }}>
                        <div style={{ position: "absolute", left: "15px", top: "15px", bottom: "15px", width: "2px", background: "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(34,197,94,0.1))", borderRadius: "999px" }} />
                        {ecoTimelineActivities.slice(0, 5).map((activity, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "11px", position: "relative", zIndex: 1 }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, boxShadow: `0 0 10px ${activity.glow}` }}>{activity.icon}</div>
                            <div style={{ flex: 1, minWidth: 0, padding: "10px 11px", borderRadius: "13px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                <span style={{ fontSize: "11px", fontWeight: 800, color: "#062018", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activity.title}</span>
                                <span style={{ fontSize: "9.5px", color: "rgba(0,0,0,0.5)", fontWeight: 650 }}>{activity.time}</span>
                              </div>
                              <span style={{ fontSize: "11.5px", fontWeight: 850, color: activity.color, flexShrink: 0 }}>{activity.points}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Badge */}
              {!isMobile && (
                <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
                  <span style={styles.badgeDot} />
                  <span style={styles.glassContentLayer}>Agricultural Innovation · Philippines</span>
                </div>
              )}

              {!isMobile && (
                <h1 style={styles.title}>
                  <>
                    Grow Food.{" "}
                    <span style={styles.titleAccent}>Build Community.</span>
                    {"\n"}Earn Sustainably.
                  </>
                </h1>
              )}
              {!isMobile && <div style={styles.titleUnderline}></div>}
              {!isMobile && (
                <p style={styles.body}>
                  EcoEquity is a digital-first, high-engagement platform designed to boost
                  agricultural self-sufficiency in the Philippines — starting at the household
                  and community level.
                </p>
              )}
              {!isMobile && (
                <div style={styles.ctaRow}>
                  <button
                    type="button"
                    style={{
                      ...styles.primaryBtn,
                      ...(btnHovered ? styles.primaryBtnHov : {}),
                    }}
                    onClick={() => handleNavChange("Contact")}
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                  >
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>Get in Touch</span>
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.glassBtn,
                      ...(ghostHovered ? styles.glassBtnHov : {}),
                    }}
                    onClick={() => handleNavChange("Learn More")}
                    onMouseEnter={() => setGhostHovered(true)}
                    onMouseLeave={() => setGhostHovered(false)}
                  >
                    <span aria-hidden="true" style={styles.glassInnerBlur} />
                    <span style={styles.glassContentLayer}>Learn More</span>
                  </button>
                </div>
              )}
              {!isMobile && (
                <div style={styles.cardRow}>
                  {[
                    { icons: [<Leaf key={1} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <Sprout key={2} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <Sun key={3} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />], heading: "Organic Edibles", text: "Local produce, herbs, organic kits, floriculture, and localized native seeds." },
                    { icons: [<Stethoscope key={1} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <Activity key={2} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <HeartPulse key={3} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />], heading: "AI Plant Doctor", text: "24/7 localized care guides tailored to Philippine climate and native crop varieties." },
                    { icons: [<Users key={1} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <Globe key={2} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, <MessageCircle key={3} size={20} color="url(#appIconGradient)" strokeWidth={2.5} />], heading: "Community Hub", text: "Essential digital tools and localized data supporting both urban and traditional farmers." },
                  ].map((c) => (
                    <div
                      key={c.heading}
                      style={{
                        ...styles.card,
                        ...(hoveredCard === c.heading ? styles.cardHov : {}),
                      }}
                      onMouseEnter={() => setHoveredCard(c.heading)}
                      onMouseLeave={() => setHoveredCard(null)}
                    > 
                      <span aria-hidden="true" style={styles.cardInnerBlur} />
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap", width: "100%", justifyContent: "center" }}>
                        {c.icons.map((icon, idx) => (
                          <div key={idx} style={styles.featureIconWrap}>{icon}</div>
                        ))}
                      </div>
                      {c.heading && <h3 style={{ ...styles.cardContentLayer, ...styles.cardHeading }}>{c.heading}</h3>}
                      {c.text && <p style={{ ...styles.cardContentLayer, ...styles.cardText }}>{c.text}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Horizontal Glass Panel with new stats */}
              {!isMobile && (
                <div
                  style={{
                    ...styles.statsStrip,
                    marginTop: '20px',
                    ...(statsStripHovered ? styles.statsStripHov : {}) }}
                  onMouseEnter={() => setStatsStripHovered(true)}
                  onMouseLeave={() => setStatsStripHovered(false)}
                >
                  <span aria-hidden="true" style={styles.glassInnerBlur} />
                  {[
                    { value: "98%", label: "Company Growth", icon: <TrendingUp color="url(#appIconGradient)" strokeWidth={2.5} /> },
                    { value: "99+", label: "Partners", icon: <Handshake color="url(#appIconGradient)" strokeWidth={2.5} /> },
                    { value: "1000+", label: "Customers", icon: <Users color="url(#appIconGradient)" strokeWidth={2.5} /> },
                  ].map((s, i, arr) => (
                    <div
                      key={s.label}
                      style={{
                        ...styles.statCell,
                        ...(i < arr.length - 1 ? styles.statCellDivider : {}),
                      }}
                    >
                      <div style={styles.featureIconWrap}>
                        {React.cloneElement(s.icon, { size: 20 })}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span style={styles.statVal}>{s.value}</span>
                        <span style={styles.statLbl}>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Side Rectangle Glass Card - Growth Charts */}
            {!isMobile && (
              <div 
                style={{
                  ...styles.heroRightCard,
                  ...(rightCardHovered ? styles.heroRightCardHov : {})
                }} 
                className={`inner-blur-glass ${!rightCardHovered ? 'animate-heroRightCardPulseGlow' : ''}`}
                onMouseEnter={() => setRightCardHovered(true)}
                onMouseLeave={() => setRightCardHovered(false)}
              >
                <span aria-hidden="true" style={styles.cardInnerBlur} />
                <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    {[
                      { id: 'crop', label: 'Crop Growth', icon: <Leaf size={14} color="#15803d" />, badgeBg: 'rgba(22,163,74,0.15)', activeBorder: 'rgba(22,163,74,0.3)', activeBg: 'rgba(22,163,74,0.05)', activeColor: '#15803d' },
                      { id: 'users', label: 'Active Users', icon: <Users size={14} color="#0369a1" />, badgeBg: 'rgba(2,132,199,0.15)', activeBorder: 'rgba(2,132,199,0.3)', activeBg: 'rgba(2,132,199,0.05)', activeColor: '#0369a1' },
                      { id: 'harvests', label: 'Harvests', icon: <Wheat size={14} color="#b45309" />, badgeBg: 'rgba(245,158,11,0.15)', activeBorder: 'rgba(245,158,11,0.3)', activeBg: 'rgba(245,158,11,0.05)', activeColor: '#b45309' },
                      { id: 'subs', label: 'Subscribers', icon: <Activity size={14} color="#be123c" />, badgeBg: 'rgba(225,29,72,0.15)', activeBorder: 'rgba(225,29,72,0.3)', activeBg: 'rgba(225,29,72,0.05)', activeColor: '#be123c' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveHeroTab(tab.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: activeHeroTab === tab.id ? `1px solid ${tab.activeBorder}` : '1px solid rgba(0,0,0,0.05)',
                          background: activeHeroTab === tab.id ? tab.activeBg : 'rgba(255,255,255,0.9)',
                          color: activeHeroTab === tab.id ? tab.activeColor : 'rgba(0,0,0,0.6)',
                          boxShadow: activeHeroTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : '0 2px 6px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (activeHeroTab !== tab.id) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeHeroTab !== tab.id) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                          }
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: tab.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {tab.icon}
                        </div>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Title and SVG Line Chart Glass Card */}
                  <div style={{ 
                    flex: 1, 
                    marginBottom: "16px",
                      background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))", 
                      border: "1px solid rgba(0,0,0,0.05)", 
                      borderRadius: "16px", 
                      padding: "16px", 
                      display: "flex", 
                      flexDirection: "column", 
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.02)",
                      position: "relative"
                  }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: activeTabData.iconBg, border: activeTabData.iconBorder, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)", flexShrink: 0 }}>
                            {React.cloneElement(activeTabData.icon, { size: 18 })}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#000", letterSpacing: "-0.3px", lineHeight: 1.1 }}>{activeTabData.title}</h3>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>{activeTabData.subtitle}</span>
                          </div>
                        </div>
                        <div style={{ padding: "4px 10px", background: activeTabData.statusBg, border: activeTabData.statusBorder, borderRadius: "999px", color: activeTabData.statusColor, fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                          {activeTabData.statusIcon}
                          {activeTabData.status}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1, minHeight: "100px", position: "relative" }}>
                      <svg viewBox="0 0 300 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={activeTabData.gradientStart} />
                            <stop offset="100%" stopColor={activeTabData.gradientEnd} />
                          </linearGradient>
                        </defs>
                        <path d="M 0 100 Q 40 90, 80 70 T 160 60 T 240 30 L 300 15 L 300 120 L 0 120 Z" fill="url(#growthGradient)" />
                        <path d="M 0 100 Q 40 90, 80 70 T 160 60 T 240 30 L 300 15" fill="none" stroke={activeTabData.strokeColor} strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Data Points */}
                        {activeTabData.points.map((point, index) => (
                          <g key={point.id} 
                             onMouseEnter={() => setHoveredDataPoint(point)} 
                             onMouseLeave={() => setHoveredDataPoint(null)}
                             style={{ cursor: "pointer" }}
                          >
                            <text 
                              x={point.cx} 
                              y={point.cy - 12} 
                              fontSize="10" 
                              fill={activeTabData.strokeColor} 
                              textAnchor="middle" 
                              fontWeight="800" 
                              fontFamily="inherit"
                              style={{ 
                                opacity: hoveredDataPoint?.id === point.id ? 0 : 1, 
                                transition: "opacity 0.2s ease" 
                              }}
                            >
                              {point.value}
                            </text>
                            <circle cx={point.cx} cy={point.cy} r="15" fill="transparent" />
                            <circle 
                              cx={point.cx} 
                              cy={point.cy} 
                              r={hoveredDataPoint?.id === point.id ? 7 : (index === 3 ? 6 : 5)} 
                              fill={index === 3 ? activeTabData.strokeColor : "#fff"} 
                              stroke={index === 3 ? "#fff" : activeTabData.strokeColor} 
                              strokeWidth={hoveredDataPoint?.id === point.id ? 3 : 2.5} 
                              style={{
                                transition: "all 0.2s ease",
                                ...(index === 3 ? { filter: `drop-shadow(0 4px 8px ${activeTabData.gradientStart})` } : {})
                              }} 
                            />
                          </g>
                        ))}
  
                        {/* Tooltip */}
                        {hoveredDataPoint && (
                          <g transform={`translate(${hoveredDataPoint.cx}, ${hoveredDataPoint.cy - 12})`} style={{ pointerEvents: "none", transition: "transform 0.1s ease" }}>
                            <rect x="-35" y="-35" width="70" height="32" rx="6" fill="#062018" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }} />
                            <polygon points="-5,-4 5,-4 0,2" fill="#062018" />
                            <text x="0" y="-21" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontWeight="600" fontFamily="inherit">{hoveredDataPoint.label}</text>
                            <text x="0" y="-9" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="bold" fontFamily="inherit">{hoveredDataPoint.value}</text>
                          </g>
                        )}
                      </svg>
                      </div>
                  </div>

                  {/* Stat Badges with Progress */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "auto" }}>
                    {activeTabData.stats.map((badge, idx) => (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setHoveredStatBadge(idx)}
                    onMouseLeave={() => setHoveredStatBadge(null)}
                    style={{ 
                      background: "rgba(255,255,255,0.9)", 
                      border: "1px solid rgba(0,0,0,0.05)", 
                      padding: "6px 8px", 
                      borderRadius: "10px", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "2px", 
                      boxShadow: hoveredStatBadge === idx ? "0 4px 16px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
                      transform: hoveredStatBadge === idx ? "translateY(-2px)" : "translateY(0)",
                      transition: "all 0.2s ease"
                    }}
                  >
                        <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{badge.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {React.cloneElement(badge.icon, { size: 12 })}
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#000", lineHeight: 1 }}>{badge.value}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "100%", height: "2px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ width: badge.progress, height: "100%", background: badge.color, borderRadius: "999px", transition: "width 0.5s ease" }} />
                          </div>
                          <span style={{ fontSize: "8px", fontWeight: 700, color: badge.color }}>{badge.progress}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
        {/* Chat with AI Button */}
        {activeNav === "Home" && !isMobile && (
          <div style={isMobile ? styles.chatWithAiBtnWrapMobile : styles.chatWithAiBtnWrap}>
            <div className="chat-ai-glow" />
            <button
              type="button"
              style={{
                ...styles.primaryBtn,
                ...(isMobile ? styles.chatWithAiBtnMobile : {}),
                ...(chatHovered ? styles.primaryBtnHov : {}),
              }}
              onClick={() => setShowAIChat(true)}
              onMouseEnter={() => setChatHovered(true)}
              onMouseLeave={() => setChatHovered(false)}
            >
              <span aria-hidden="true" style={styles.primaryInnerBlur} />
              <span className="orbit-container" />
              <span style={{ ...styles.glassContentLayer, display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                <Sparkles size={16} strokeWidth={2.5} />
                Chat with AI
              </span>
            </button>
          </div>
        )}

        {activeNav !== "Home" && (
          <div
            style={{
              ...styles.pageContent, // Fixed: Removed overflowY: "hidden" override to allow scrolling on all pages
            }}
          >
            {activeNav === "About Us" && !isMobile && <AboutUs />}
            {activeNav === "Product & Services" && <ProductServices setActiveNav={setActiveNav} />}
            {activeNav === "ProductsPage" && <ProductsPage setActiveNav={setActiveNav} setCartItems={setCartItems} products={products} />}
{activeNav === "ServicesPage" && <ServicesPage setActiveNav={setActiveNav} showAIChat={showAIChat} setShowAIChat={setShowAIChat} />}
            {activeNav === "Target Market" && <TargetMarket />}
            {activeNav === "Our Team" && <OurTeam />}
            {activeNav === "Contact" && <GetInTouch setActiveNav={setActiveNav} />}
            {activeNav === "Learn More" && <LearnMore setActiveNav={setActiveNav} />}
            {activeNav === "Explore More" && <ExploreMore setActiveNav={setActiveNav} />}
            {activeNav === "Target Market Explore" && <TargetMarketExplore />}
            {activeNav === "Sustainability App Market" && <SustainabilityAppMarket />}
            {activeNav === "Benefits of the Project" && <BenefitsOfTheProject />}
            {activeNav === "Seasonal Harvest" && !isMobile && <SeasonalHarvestPage setActiveNav={setActiveNav} onNotify={handleNotify} harvests={harvests} />}
            {activeNav === "Shop All Products" && (
              <ShopAllProducts 
                setActiveNav={setActiveNav} 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                savedProducts={savedProducts} 
                setSavedProducts={setSavedProducts} 
                setOrders={setOrders}
                onTrackOrder={handleTrackOrder}
                products={products}
                promoCodes={promoCodes}
              />
            )}
            {activeNav === "Admin Portal" && isAdmin && <AdminPortal setActiveNav={setActiveNav} handleLogout={handleLogout} products={products} setProducts={setProducts} harvests={harvests} setHarvests={setHarvests} promoCodes={promoCodes} setPromoCodes={setPromoCodes} orders={orders} setOrders={setOrders} />}
            {activeNav === "EventsAndWorkshops" && <EventsAndWorkshopsPage setActiveNav={setActiveNav} />}
            {activeNav === "Starter Kits & Toolsets" && <StarterKits setActiveNav={setActiveNav} />}
            {activeNav === "AI Data Subscription" && <AIDataSubscription setActiveNav={setActiveNav} promoCodes={promoCodes} />}
            {activeNav === "Specialist Certification" && <SpecialistCertification setActiveNav={setActiveNav} />}
            {activeNav === "AIPlantDoctor" && <AIPlantDoctor setActiveNav={setActiveNav} />}
            {activeNav === "ExpertSupportPage" && <ExpertSupportPage setActiveNav={setActiveNav} />} {/* Add routing for ExpertSupportPage */}
            {activeNav === "LGUPartnershipPage" && <LGUPartnershipPage setActiveNav={setActiveNav} />}
            {activeNav === "ImpactTrackingPage" && <ImpactTrackingPage setActiveNav={setActiveNav} />}
            {activeNav === "NativeSeedBankPage" && <NativeSeedBankPage setActiveNav={setActiveNav} />}
            {activeNav === "OurImpactPage" && <OurImpactPage setActiveNav={setActiveNav} />}
            {activeNav === "IncomeGenerationPage" && <IncomeGenerationPage setActiveNav={setActiveNav} />}
            {activeNav === "SurplusExchangePage" && <SurplusExchangePage setActiveNav={setActiveNav} />}
            {activeNav === "CheckoutPage" && <CheckoutPage setActiveNav={setActiveNav} cartItems={cartItems} setCartItems={setCartItems} addEcoPoints={addEcoPoints} setOrders={setOrders} onTrackOrder={handleTrackOrder} products={products} setProducts={setProducts} promoCodes={promoCodes} />}

            {activeNav === "Login" && (
              <div style={{ ...styles.hero, flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: isMobile ? "center" : "space-between", gap: isMobile ? "22px" : "clamp(24px, 4vw, 60px)", maxWidth: isMobile ? (mobileAuthView === "landing" ? "430px" : "440px") : "1000px", textAlign: isMobile ? "center" : "left", ...(isMobile ? styles.heroMobile : {}), marginTop: isMobile ? "clamp(10px, 2dvh, 22px)" : "clamp(20px, 5vh, 50px)" }}>
                
                <div style={{ flex: isMobile ? "none" : 1, display: isMobile && mobileAuthView === "form" ? "none" : "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", width: "100%", textAlign: isMobile ? "center" : "left" }}>
                  <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
                    <span style={styles.badgeDot} />
                    <span style={styles.glassContentLayer}>AGRICULTURAL INNOVATION • PHILIPPINES</span>
                  </div>

                  <h1 style={{ ...styles.title, fontSize: "clamp(20px, 2.8vw, 32px)", textAlign: isMobile ? "center" : "left", ...(isMobile ? styles.titleMobile : {}) }}>
                    Welcome to <span style={styles.titleAccent}>EcoEquity!</span>
                  </h1>
                  <div style={{ ...styles.titleUnderline, marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0, marginBottom: "20px", ...(isMobile ? { ...styles.titleUnderlineMobile, marginLeft: "auto" } : {}) }}></div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", gap: "4px", marginBottom: "28px", maxWidth: "420px" }}>
                    <p style={{ ...styles.body, fontSize: "14px", lineHeight: "1.5", color: "rgba(0,0,0,0.75)", margin: 0, textAlign: isMobile ? "center" : "left", ...(isMobile ? { ...styles.bodyMobile, fontSize: "13px" } : {}) }}>
                      EcoEquity is a digital-first, high-engagement platform.
                    </p>
                    <p style={{ ...styles.body, fontSize: "14px", lineHeight: "1.5", color: "rgba(0,0,0,0.75)", margin: 0, textAlign: isMobile ? "center" : "left", ...(isMobile ? { ...styles.bodyMobile, fontSize: "13px" } : {}) }}>
                      Designed to boost agricultural self-sufficiency in the Philippines — starting at the household and community level.
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%", maxWidth: isMobile ? "360px" : "340px", marginTop: "4px" }}>
                    {[
                      { icon: <Leaf size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "Organic Edibles", text: "Organic Edibles: Local produce, herbs, organic kits. Floriculture, localized seeds." },
                      { icon: <Stethoscope size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "AI Plant Doctor", text: "24/7 AI Plant Doctor, localized care guides tailored to Philippine climate and native crops." },
                      { icon: <Users size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "Community Hub", text: "Provides essential digital tools and localized data, supporting both urban farming and traditional farming centers during periods of oversupply." },
                    ].map((c) => (
                      <div
                        key={c.heading}
                        style={{
                          ...styles.card,
                          ...(isMobile ? styles.cardMobile : {}),
                          ...(hoveredCard === c.heading ? styles.cardHov : {}),
                          flex: "none",
                          maxWidth: "100%",
                          width: "100%",
                          padding: "12px 14px",
                          gap: "10px",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        onMouseEnter={() => setHoveredCard(c.heading)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <span aria-hidden="true" style={styles.cardInnerBlur} />
                        <div style={styles.featureIconWrapSmall}>
                          {c.icon}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", flex: 1, position: "relative", zIndex: 1 }}>
                          {c.heading && <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}), marginTop: 0, fontSize: "14px", textAlign: "left" }}>{c.heading}</h3>}
                          {c.text && <p style={{ ...styles.cardText, ...(isMobile ? styles.cardTextMobile : {}), marginTop: 0, fontSize: "11px", lineHeight: "1.4", textAlign: "left" }}>{c.text}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isMobile && mobileAuthView === "landing" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: "360px", marginTop: "22px" }}>
                      <button
                        type="button"
                        onClick={() => openMobileAuthForm("Login")}
                        style={{ ...styles.primaryBtn, width: "100%", padding: "13px 10px", fontSize: "14px" }}
                      >
                        <span aria-hidden="true" style={styles.primaryInnerBlur} />
                        <span style={styles.glassContentLayer}>Login</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openMobileAuthForm("Sign Up")}
                        style={{ ...styles.glassBtn, width: "100%", padding: "13px 10px", fontSize: "14px", fontWeight: 800, color: "#15803d" }}
                      >
                        <span aria-hidden="true" style={styles.glassInnerBlur} />
                        <span style={styles.glassContentLayer}>Register</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className={`inner-blur-glass glow-card animate-cardPulseGlow ${formErrorShake ? 'animate-shakeError' : ''}`} style={{ flex: isMobile ? "none" : 1, maxWidth: "440px", width: "100%", background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "24px", padding: isMobile ? "30px 22px" : "40px 32px", display: isMobile && mobileAuthView === "landing" ? "none" : "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h2 style={{ ...styles.title, fontSize: "24px", textAlign: "center", marginBottom: "8px" }}>Login to Your Account</h2>
                  <p style={{ ...styles.body, fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>Your Sustainable Journey Continues</p>
                  
                  {authMessage && (
                    <div style={{ ...styles.authMessage, ...(authMessage.type === "success" ? styles.authMessageSuccess : styles.authMessageError) }}>
                      {authMessage.text}
                    </div>
                  )}

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Email/Phone Input */}
                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        type="text" 
                        placeholder="Email or Phone Number" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} 
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                    </div>

                    {/* Password Input */}
                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "14px 44px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} 
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </div>
                    </div>

                    {/* Options Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", width: "100%", marginTop: "-4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }} onClick={() => setRememberMe(!rememberMe)}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: rememberMe ? "none" : "1px solid rgba(0,0,0,0.2)", background: rememberMe ? "#15803d" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                          {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>Remember me</span>
                      </div>
                      <span onClick={handleForgotPassword} style={{ color: "#15803d", fontWeight: 600, cursor: "pointer" }}>Forgot Password?</span>
                    </div>

                    {/* Login Button */}
                    <button onClick={handleLogin} style={{ ...styles.primaryBtn, width: "100%", marginTop: "8px", padding: "14px", fontSize: "15px" }}>
                      <span aria-hidden="true" style={styles.primaryInnerBlur} />
                      <span style={styles.glassContentLayer}>Login</span>
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "8px 0" }}>
                      <div style={{ flex: 1, height: "1px", background: "rgba(21, 128, 61, 0.3)" }} />
                      <span style={{ padding: "0 12px", fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>or connect with</span>
                      <div style={{ flex: 1, height: "1px", background: "rgba(21, 128, 61, 0.3)" }} />
                    </div>

                    {/* Social Login Buttons */}
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px", width: "100%" }}>
                      <button 
                        onClick={() => handleSocialAuth("Google")}
                        type="button"
                        style={{ ...styles.glassBtn, flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", ...(hoveredSocialBtn === "Google" ? styles.glassBtnHov : {}) }}
                        onMouseEnter={() => setHoveredSocialBtn("Google")}
                        onMouseLeave={() => setHoveredSocialBtn(null)}
                      >
                        <span aria-hidden="true" style={styles.glassInnerBlur} />
                        <span style={{ ...styles.glassContentLayer, display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google
                        </span>
                      </button>
                      <button 
                        onClick={() => handleSocialAuth("Facebook")}
                        type="button"
                        style={{ ...styles.glassBtn, flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", ...(hoveredSocialBtn === "Facebook" ? styles.glassBtnHov : {}) }}
                        onMouseEnter={() => setHoveredSocialBtn("Facebook")}
                        onMouseLeave={() => setHoveredSocialBtn(null)}
                      >
                        <span aria-hidden="true" style={styles.glassInnerBlur} />
                        <span style={{ ...styles.glassContentLayer, display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </span>
                      </button>
                      <button 
                        onClick={() => handleSocialAuth("Apple")}
                        type="button"
                        style={{ ...styles.glassBtn, flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", ...(hoveredSocialBtn === "Apple" ? styles.glassBtnHov : {}) }}
                        onMouseEnter={() => setHoveredSocialBtn("Apple")}
                        onMouseLeave={() => setHoveredSocialBtn(null)}
                      >
                        <span aria-hidden="true" style={styles.glassInnerBlur} />
                        <span style={{ ...styles.glassContentLayer, display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.68 3.12.68.61 0 1.9-.75 3.47-.64 1.37.05 2.6.53 3.44 1.41-2.95 1.57-2.5 5.56.36 6.8-.75 1.95-1.63 3.65-2.39 4.72zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                          Apple
                        </span>
                      </button>
                    </div>
                    
                    {/* Sign Up Prompt */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", width: "100%", fontSize: "12px" }}>
                      <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => isMobile ? openMobileAuthForm("Sign Up") : handleNavChange("Sign Up")}
                        style={{ background: "transparent", border: "none", color: "#15803d", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "12px", transition: "color 0.2s ease" }}
                        onMouseEnter={(e) => { e.target.style.color = "#16a34a"; }}
                        onMouseLeave={(e) => { e.target.style.color = "#15803d"; }}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeNav === "Sign Up" && (
              <div style={{ ...styles.hero, flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: isMobile ? "center" : "space-between", gap: isMobile ? "22px" : "clamp(24px, 4vw, 60px)", maxWidth: isMobile ? "440px" : "1000px", textAlign: isMobile ? "center" : "left", ...(isMobile ? styles.heroMobile : {}), marginTop: isMobile ? "clamp(10px, 2dvh, 22px)" : "clamp(20px, 5vh, 50px)" }}>
                
                <div style={{ flex: 1, display: isMobile ? "none" : "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
                    <span style={styles.badgeDot} />
                    <span style={styles.glassContentLayer}>AGRICULTURAL INNOVATION • PHILIPPINES</span>
                  </div>

                  <h1 style={{ ...styles.title, fontSize: "clamp(20px, 2.8vw, 32px)", textAlign: "left", ...(isMobile ? styles.titleMobile : {}) }}>
                    Welcome to <span style={styles.titleAccent}>EcoEquity!</span>
                  </h1>
                  <div style={{ ...styles.titleUnderline, marginLeft: 0, marginBottom: "20px", ...(isMobile ? { ...styles.titleUnderlineMobile, marginLeft: 0 } : {}) }}></div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "28px", maxWidth: "420px" }}>
                    <p style={{ ...styles.body, fontSize: "14px", lineHeight: "1.5", color: "rgba(0,0,0,0.75)", margin: 0, textAlign: "left", ...(isMobile ? { ...styles.bodyMobile, fontSize: "13px" } : {}) }}>
                      EcoEquity is a digital-first, high-engagement platform.
                    </p>
                    <p style={{ ...styles.body, fontSize: "14px", lineHeight: "1.5", color: "rgba(0,0,0,0.75)", margin: 0, textAlign: "left", ...(isMobile ? { ...styles.bodyMobile, fontSize: "13px" } : {}) }}>
                      Designed to boost agricultural self-sufficiency in the Philippines — starting at the household and community level.
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "340px", marginTop: "4px" }}>
                    {[
                      { icon: <Leaf size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "Organic Edibles", text: "Organic Edibles: Local produce, herbs, organic kits. Floriculture, localized seeds." },
                      { icon: <Stethoscope size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "AI Plant Doctor", text: "24/7 AI Plant Doctor, localized care guides tailored to Philippine climate and native crops." },
                      { icon: <Users size={20} color="url(#appIconGradient)" strokeWidth={2.5} />, heading: "Community Hub", text: "Provides essential digital tools and localized data, supporting both urban farming and traditional farming centers during periods of oversupply." },
                    ].map((c) => (
                      <div
                        key={c.heading}
                        style={{
                          ...styles.card,
                          ...(isMobile ? styles.cardMobile : {}),
                          ...(hoveredCard === c.heading ? styles.cardHov : {}),
                          flex: "none",
                          maxWidth: "100%",
                          width: "100%",
                          padding: "12px 14px",
                          gap: "10px",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        onMouseEnter={() => setHoveredCard(c.heading)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <span aria-hidden="true" style={styles.cardInnerBlur} />
                        <div style={styles.featureIconWrapSmall}>
                          {c.icon}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", flex: 1, position: "relative", zIndex: 1 }}>
                          {c.heading && <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}), marginTop: 0, fontSize: "14px", textAlign: "left" }}>{c.heading}</h3>}
                          {c.text && <p style={{ ...styles.cardText, ...(isMobile ? styles.cardTextMobile : {}), marginTop: 0, fontSize: "11px", lineHeight: "1.4", textAlign: "left" }}>{c.text}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`inner-blur-glass glow-card animate-cardPulseGlow ${formErrorShake ? 'animate-shakeError' : ''}`} style={{ flex: isMobile ? "none" : 1, maxWidth: "440px", width: "100%", background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "24px", padding: isMobile ? "30px 22px" : "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h2 style={{ ...styles.title, fontSize: "24px", textAlign: "center", marginBottom: "8px" }}>Create an Account</h2>
                  <p style={{ ...styles.body, fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>Join the EcoEquity Community</p>
                  
                  {authMessage && (
                    <div style={{ ...styles.authMessage, ...(authMessage.type === "success" ? styles.authMessageSuccess : styles.authMessageError) }}>
                      {authMessage.text}
                    </div>
                  )}

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Full Name Input */}
                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} 
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    </div>

                    {/* Email/Phone Input */}
                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        type="text" 
                        placeholder="Email or Phone Number" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} 
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                    </div>

                    {/* Password Input */}
                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "14px 44px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} 
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </div>
                    </div>

                    {/* Options Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", width: "100%", marginTop: "-4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }} onClick={() => setAgreeTerms(!agreeTerms)}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: agreeTerms ? "none" : "1px solid rgba(0,0,0,0.2)", background: agreeTerms ? "#15803d" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                          {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>I agree to the Terms & Conditions</span>
                      </div>
                    </div>

                    {/* Sign Up Button */}
                    <button onClick={handleSignUp} style={{ ...styles.primaryBtn, width: "100%", marginTop: "8px", padding: "14px", fontSize: "15px" }}>
                      <span aria-hidden="true" style={styles.primaryInnerBlur} />
                      <span style={styles.glassContentLayer}>Sign Up</span>
                    </button>

                    {/* Login Prompt */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", width: "100%", fontSize: "12px" }}>
                      <span style={{ color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>Already have an account?</span>
                      <button
                        type="button"
                        onClick={() => isMobile ? openMobileAuthForm("Login") : handleNavChange("Login")}
                        style={{ background: "transparent", border: "none", color: "#15803d", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "12px", transition: "color 0.2s ease" }}
                        onMouseEnter={(e) => { e.target.style.color = "#16a34a"; }}
                        onMouseLeave={(e) => { e.target.style.color = "#15803d"; }}
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settings Modal */}
        {showSettingsModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, animation: "fadeIn 0.3s ease" }}>
            <div className="inner-blur-glass" style={{ maxWidth: isMobile ? "430px" : "1160px", width: isMobile ? "calc(100vw - clamp(18px, 6vw, 48px))" : "100%", height: isMobile ? "calc(100dvh - clamp(8px, 2dvh, 16px))" : "calc(100vh - 40px)", maxHeight: "none", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: isMobile ? "clamp(18px, 5vw, 24px)" : "30px", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", boxSizing: "border-box" }}>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer", color: "rgba(0,0,0,0.6)", zIndex: 10, transition: "background 0.2s" }}
              >
                &times;
              </button>

              {/* Sidebar */}
              <div style={{ width: isMobile ? "100%" : "320px", background: "rgba(22, 163, 74, 0.05)", borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,0.05)", borderBottom: isMobile ? "1px solid rgba(0,0,0,0.05)" : "none", padding: isMobile ? "24px" : "40px 32px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0, overflowY: isMobile ? "visible" : "auto" }}>
                {!isMobile && (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div 
                      style={{ position: "relative", cursor: "pointer", flexShrink: 0 }} 
                      onClick={() => document.getElementById('profilePicInput').click()}
                    >
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", border: "2px solid #15803d", overflow: "hidden" }}>
                        {profilePic ? (
                          <img src={profilePic} alt="User Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "24px", fontWeight: 800, color: "#15803d", margin: "auto" }}>
                            {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "U"}
                          </span>
                        )}
                      </div>
                      <div style={{ position: "absolute", bottom: 0, right: 0, background: "#15803d", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      </div>
                      <input type="file" id="profilePicInput" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) setProfilePic(URL.createObjectURL(file)); }} />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#000", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInUser || "User"}</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "rgba(0,0,0,0.6)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{email || "hello@verdeversity.com"}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: "8px", overflowX: isMobile ? "auto" : "visible" }}>
                  <button 
                    onClick={() => setSettingsTab("profile")}
                    onMouseEnter={() => setHoveredSettingsTab("profile")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "profile" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "profile" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "profile" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "profile" || hoveredSettingsTab === "profile" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "profile" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "profile" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "profile" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "profile" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "profile" ? "blur(12px) saturate(180%)" : "none" }}
                  >
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => setSettingsTab("certificate")}
                    onMouseEnter={() => setHoveredSettingsTab("certificate")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "certificate" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "certificate" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "certificate" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "certificate" || hoveredSettingsTab === "certificate" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "certificate" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "certificate" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "certificate" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "certificate" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "certificate" ? "blur(12px) saturate(180%)" : "none" }}
                  >
                    My Certificate
                  </button>
	                  {!isMobile && (
	                    <>
	                      <button 
	                        onClick={() => setSettingsTab("earnHistory")}
	                        onMouseEnter={() => setHoveredSettingsTab("earnHistory")}
	                        onMouseLeave={() => setHoveredSettingsTab(null)}
	                        style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "earnHistory" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "earnHistory" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "earnHistory" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "earnHistory" || hoveredSettingsTab === "earnHistory" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "earnHistory" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "earnHistory" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "earnHistory" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "earnHistory" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "earnHistory" ? "blur(12px) saturate(180%)" : "none" }}
	                      >
	                        Earn History
	                      </button>
	                      <button 
	                        onClick={() => setSettingsTab("ecopoints")}
	                        onMouseEnter={() => setHoveredSettingsTab("ecopoints")}
	                        onMouseLeave={() => setHoveredSettingsTab(null)}
	                        style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "ecopoints" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "ecopoints" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "ecopoints" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "ecopoints" || hoveredSettingsTab === "ecopoints" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "ecopoints" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "ecopoints" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "ecopoints" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "ecopoints" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "ecopoints" ? "blur(12px) saturate(180%)" : "none" }}
	                      >
	                        EcoPoints & Rewards
	                      </button>
	                    </>
	                  )}
                  <button 
                    onClick={() => setSettingsTab("orders")}
                    onMouseEnter={() => setHoveredSettingsTab("orders")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "orders" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "orders" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "orders" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "orders" || hoveredSettingsTab === "orders" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "orders" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "orders" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "orders" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "orders" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "orders" ? "blur(12px) saturate(180%)" : "none" }}
                  >
                    Order History
                  </button>
                  <button 
                    onClick={() => setSettingsTab("wishlist")}
                    onMouseEnter={() => setHoveredSettingsTab("wishlist")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "wishlist" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "wishlist" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "wishlist" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "wishlist" || hoveredSettingsTab === "wishlist" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "wishlist" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "wishlist" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "wishlist" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "wishlist" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "wishlist" ? "blur(12px) saturate(180%)" : "none" }}
                  >
                    Wishlist
                  </button>
                  <button 
                    onClick={() => setSettingsTab("settings")}
                    onMouseEnter={() => setHoveredSettingsTab("settings")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: settingsTab === "settings" ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", background: settingsTab === "settings" ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredSettingsTab === "settings" ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", color: settingsTab === "settings" || hoveredSettingsTab === "settings" ? "#064e3b" : "rgba(0,0,0,0.7)", fontSize: "14px", fontWeight: settingsTab === "settings" ? 700 : 600, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", boxShadow: settingsTab === "settings" ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredSettingsTab === "settings" ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: settingsTab === "settings" ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: settingsTab === "settings" ? "blur(12px) saturate(180%)" : "none" }}
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div style={{ flex: 1, padding: isMobile ? "24px" : "48px 56px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                
                {settingsTab === "profile" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                    {isMobile && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", width: "100%", marginTop: "2px" }}>
                        <div 
                          style={{ position: "relative", cursor: "pointer", flexShrink: 0 }} 
                          onClick={() => document.getElementById('profilePicInputMobile').click()}
                        >
                          <div style={{ width: "86px", height: "86px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #15803d", overflow: "hidden", boxShadow: "0 12px 26px rgba(22,163,74,0.16)" }}>
                            {profilePic ? (
                              <img src={profilePic} alt="User Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: "32px", fontWeight: 800, color: "#15803d" }}>
                                {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "U"}
                              </span>
                            )}
                          </div>
                          <div style={{ position: "absolute", bottom: "3px", right: "3px", background: "#15803d", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          </div>
                          <input type="file" id="profilePicInputMobile" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) setProfilePic(URL.createObjectURL(file)); }} />
                        </div>
                        <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 850, color: "#000", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInUser || "User"}</h3>
                          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(0,0,0,0.58)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{email || "hello@verdeversity.com"}</p>
                        </div>
                      </div>
                    )}
                    <div style={{ textAlign: isMobile ? "center" : "left" }}>
                      <h2 style={{ margin: isMobile ? "0 0 6px" : "0 0 8px", fontSize: "24px", fontWeight: 800, color: "#000" }}>My Profile</h2>
                      <p style={{ margin: "0", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>Update your personal information and delivery details.</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", width: "100%" }}>
                      <div style={{ position: "relative", width: "100%" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "6px", textTransform: "uppercase" }}>Full Name</label>
                        <input type="text" placeholder="Full Name" value={loggedInUser} onChange={(e) => setLoggedInUser(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box" }} />
                      </div>

                      <div style={{ position: "relative", width: "100%" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "6px", textTransform: "uppercase" }}>Phone Number</label>
                        <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box" }} />
                      </div>
                      
                      <div style={{ position: "relative", width: "100%", gridColumn: isMobile ? "auto" : "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "6px", textTransform: "uppercase" }}>Email Address</label>
                        <input type="email" placeholder="Email" value={email || "hello@verdeversity.com"} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.02)", fontSize: "14px", color: "rgba(0,0,0,0.5)", outline: "none", boxSizing: "border-box", cursor: "not-allowed" }} />
                      </div>
                    </div>

                    <div style={{ position: "relative", width: "100%" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "6px", textTransform: "uppercase" }}>Delivery Address</label>
                      <textarea placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "14px", color: "#000", outline: "none", boxSizing: "border-box", resize: "none", height: "100px" }} />
                    </div>

                    <button 
                      onClick={() => { setShowSuccessModal(true); setShowSettingsModal(false); }} 
                      style={{ padding: "14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "4px", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {settingsTab === "earnHistory" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: "24px", fontWeight: 800, color: "#000" }}>Earn History</h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                      {[
                        { date: "May 27, 2026", action: "Buy Organic Products", points: "+50", icon: "🛒" },
                        { date: "May 25, 2026", action: "Complete AI Diagnosis", points: "+30", icon: "🤖" },
                        { date: "May 20, 2026", action: "Invite Friend", points: "+200", icon: "👥" },
                      ].map((log, idx) => (
                        <div key={idx} style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "40px", height: "40px", background: "rgba(22, 163, 74, 0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "18px" }}>
                              {log.icon}
                            </div>
                            <div>
                              <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#000" }}>{log.action}</h4>
                              <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>{log.date}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#16a34a" }}>
                            {log.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === "orders" && !selectedOrderForTracking && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#000" }}>Order History</h2>
                      <CustomDropdown 
                        options={["All Orders", "Pending Approval", "Approved", "Disapproved", "Processing", "Out for Delivery", "Delivered", "Cancelled"]}
                        value={orderFilter}
                        onChange={setOrderFilter}
                      />
                    </div>
                    
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                        <div key={order.id} style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
                            <div>
                              <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>ORDER ID</span>
                              <div style={{ fontSize: "14px", fontWeight: 800, color: "#000" }}>{order.id}</div>
                            </div>
                            <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", background: order.status === "Delivered" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)", color: order.status === "Delivered" ? "#15803d" : "#ca8a04" }}>
                              {order.status}
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div style={{ flex: 1, paddingRight: "16px" }}>
                              <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.8)", marginBottom: "4px", fontWeight: 600 }}>{order.items}</div>
                              <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Placed on {order.date}</div>
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>
                              ₱{order.total.toFixed(2)}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "12px", marginTop: "4px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                            <button onClick={() => setSelectedOrderForTracking(order)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", color: "#15803d", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22, 163, 74, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'}>Track Order</button>
                            <button onClick={() => setSelectedOrderForTracking(order)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.15)", transition: "transform 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>View Details</button>
                          </div>
                        </div>
                      ))
                      ) : (
                        <div style={{ textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "14px", padding: "32px 0", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>
                          No orders found for this status.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {settingsTab === "orders" && selectedOrderForTracking && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.3s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                      <button 
                        onClick={() => setSelectedOrderForTracking(null)}
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", transition: "background 0.2s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                      >
                        <FaArrowLeft />
                      </button>
                      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#000", flexGrow: 1 }}>Order Details</h2>
                      {selectedOrderForTracking.status === "Processing" && (
                        <button 
                          onClick={() => setShowCancelConfirmModal(true)}
                          style={{ 
                            marginLeft: isMobile ? 0 : "auto", marginTop: isMobile ? '12px' : 0, width: isMobile ? '100%' : 'auto', 
                            padding: "10px 16px", borderRadius: "999px", background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.2)", color: "#dc2626", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220, 38, 38, 0.15)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)"}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Order Info Summary */}
                      <div style={styles.orderDetailsCard}>
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>ORDER ID</span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>{selectedOrderForTracking.id}</span>
                          
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>PLACED ON</span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.8)" }}>{selectedOrderForTracking.date}</span>

                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>STATUS</span>
                          <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", justifySelf: "start", background: selectedOrderForTracking.status === "Delivered" ? "rgba(34, 197, 94, 0.1)" : selectedOrderForTracking.status === "Cancelled" ? "rgba(220, 38, 38, 0.1)" : selectedOrderForTracking.status === "Out for Delivery" ? "rgba(14, 165, 233, 0.1)" : "rgba(234, 179, 8, 0.1)", color: selectedOrderForTracking.status === "Delivered" ? "#15803d" : selectedOrderForTracking.status === "Cancelled" ? "#dc2626" : selectedOrderForTracking.status === "Out for Delivery" ? "#0284c7" : "#ca8a04" }}>
                            {selectedOrderForTracking.status}
                          </span>
                          
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>TOTAL</span>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>₱{selectedOrderForTracking.total.toFixed(2)}</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>ITEMS</span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.8)", lineHeight: 1.5 }}>{selectedOrderForTracking.items}</span>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))", border: "1px solid rgba(34, 197, 94, 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                        <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Tracking Timeline</h3>
                        
                        {selectedOrderForTracking.status === "Out for Delivery" && (
                          <>
                          <div style={{ marginBottom: "20px", borderRadius: "16px", overflow: "hidden", position: "relative", height: "180px", background: "#f0f9ff", border: "1px solid rgba(14, 165, 233, 0.2)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
                            <div style={{ position: "absolute", inset: 0, backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%230ea5e9\\' fill-opacity=\\'0.1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
                            <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                              <path d="M 40 140 Q 200 140 200 90 T 360 40" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 8" style={{ animation: "dashMove 2s linear infinite" }} />
                            </svg>
                            <div style={{ position: "absolute", top: "140px", left: "10%", transform: "translate(-50%, -50%)", fontSize: "28px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))", zIndex: 5 }}>🏪</div>
                            <div style={{ position: "absolute", top: "40px", left: "90%", transform: "translate(-50%, -50%)", fontSize: "28px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))", zIndex: 5 }}>📍</div>
                            <div style={{ position: "absolute", top: "90px", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                              <div style={{ fontSize: "32px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", animation: "riderFloat 3s infinite ease-in-out" }}>🛵</div>
                            </div>
                            <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#0284c7", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} className="animate-progressPulse" /> Live Update
                            </div>
                          </div>
                          <div style={{ marginBottom: "28px", padding: "20px", background: "rgba(255,255,255,0.9)", borderRadius: "16px", border: "1px solid rgba(14, 165, 233, 0.3)", boxShadow: "0 8px 24px rgba(14, 165, 233, 0.1)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(14, 165, 233, 0.15)", border: "2px solid #0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                                🛵
                              </div>
                              <div style={{ flex: 1, minWidth: "120px" }}>
                                <div style={{ fontSize: "15px", fontWeight: 800, color: "#000" }}>Rider: Juan Perez</div>
                                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>Honda Click • Plate: ABC-1234</div>
                              </div>
                              <button onClick={() => setShowRiderChat(true)} style={{ padding: "8px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(125,211,252,0.95), rgba(56,189,248,0.95))", border: "1px solid rgba(255,255,255,0.4)", color: "#082f49", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                Contact Rider
                              </button>
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
                              <div className="animate-progressPulse" style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #38bdf8, #0284c7)", borderRadius: "999px", boxShadow: "0 0 10px rgba(14,165,233,0.5)" }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", fontWeight: 700, color: "#0284c7" }}>
                              <span>On the way</span>
                              <span>Arriving in ~15 mins</span>
                            </div>
                          </div>
                          </>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                          
                          <div style={{ position: "absolute", left: "15px", top: "16px", bottom: "16px", width: "2px", background: selectedOrderForTracking.status === "Delivered" ? "#16a34a" : "rgba(0,0,0,0.05)", transition: "background 0.5s ease" }}>
                             <div style={{ 
                               width: "100%", 
                               background: "#16a34a", 
                               height: selectedOrderForTracking.status === "Delivered" ? "100%" : 
                                       selectedOrderForTracking.status === "Out for Delivery" ? "75%" : 
                                       selectedOrderForTracking.status === "Shipped" ? "50%" : "25%",
                               transition: "height 1s ease-in-out",
                               boxShadow: selectedOrderForTracking.status === "Delivered" ? "0 0 12px rgba(22, 163, 74, 0.6)" : "none"
                             }} />
                          </div>

                          {[
                            { label: "Order Placed", desc: "We have received your order.", time: selectedOrderForTracking.date },
                            { label: "Processing", desc: "Your order is being prepared and packed.", time: "In Progress" },
                            { label: "Shipped", desc: "Your order has been handed over to the courier.", time: "Pending" },
                            { label: "Out for Delivery", desc: "The courier is on their way to your address.", time: "Pending" },
                            { label: "Delivered", desc: "Order has been successfully delivered.", time: "Pending" },
                          ].map((step, idx) => {
                            const statusWeights = { "Order Placed": 1, "Processing": 2, "Shipped": 3, "Out for Delivery": 4, "Delivered": 5 };
                            const currentWeight = statusWeights[selectedOrderForTracking.status] || 2;
                            const stepWeight = idx + 1;
                            const isCompleted = currentWeight >= stepWeight;
                            const isCurrent = currentWeight === stepWeight;
                            
                            let timeText = step.time;
                            if (isCompleted && step.label !== "Order Placed") timeText = selectedOrderForTracking.date;
                            else if (!isCompleted) timeText = "Pending";
                            
                            return (
                              <div key={idx} style={{ display: "flex", gap: "16px", paddingBottom: idx === 4 ? "0" : "32px", position: "relative", zIndex: 1, opacity: isCompleted ? 1 : 0.4 }}>
                                <div className={step.label === "Delivered" && isCompleted ? "animate-unlock" : ""} style={{ 
                                  width: "32px", height: "32px", borderRadius: "50%", 
                                  background: isCompleted ? "#16a34a" : "#fff", 
                                  border: isCompleted ? "none" : "2px solid rgba(0,0,0,0.1)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "12px", flexShrink: 0,
                                  boxShadow: isCurrent ? "0 0 0 4px rgba(34, 197, 94, 0.2)" : "none",
                                  transition: "all 0.3s ease"
                                }}>
                                  {isCompleted ? <span style={{ color: "#fff", fontWeight: 800 }}>✓</span> : <span style={{ color: "rgba(0,0,0,0.2)", fontWeight: 800 }}>{idx + 1}</span>}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "6px", flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 700, color: isCompleted ? "#15803d" : "#000" }}>{step.label}</span>
                                    <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.4)" }}>{timeText}</span>
                                  </div>
                                  <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{step.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {selectedOrderForTracking.status === "Delivered" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "8px" }}>
                          {!orderReviewSubmitted ? (
                            <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))", border: "1px solid rgba(34, 197, 94, 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                              <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#000" }}>How was your order?</h3>
                              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Rate your experience to help us improve and earn 10 EcoPoints!</p>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} onClick={() => setOrderReviewRating(star)} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} width="28" height="28" viewBox="0 0 24 24" fill={star <= orderReviewRating ? "#fbbf24" : "none"} stroke={star <= orderReviewRating ? "#fbbf24" : "rgba(0,0,0,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                              </div>
                              <div style={{ position: "relative", marginBottom: "16px" }}>
                                <textarea maxLength={500} value={orderReviewText} onChange={(e) => setOrderReviewText(e.target.value)} placeholder="Write your review here..." style={{ width: "100%", padding: "12px", paddingBottom: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", outline: "none", fontSize: "13px", fontFamily: "inherit", resize: "none", height: "80px", boxSizing: "border-box", background: "rgba(255,255,255,0.8)" }}></textarea>
                                <span style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "11px", color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>{orderReviewText.length}/500</span>
                              </div>
                              <button 
                                onClick={(e) => { 
                                  setOrderReviewSubmitted(true); 
                                  addEcoPoints(10, "Order Review"); 
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const newParticles = Array.from({ length: 8 }).map((_, i) => ({
                                    id: Date.now() + i + 'rev',
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2,
                                    emoji: ["⭐", "✨", "🎉", "💚"][Math.floor(Math.random() * 4)],
                                    angle: Math.random() * Math.PI * 2,
                                    velocity: 40 + Math.random() * 80
                                  }));
                                  setRewardParticles(prev => [...prev, ...newParticles]);
                                  setTimeout(() => setRewardParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);
                                }} 
                                style={{ width: "100%", padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 700, fontSize: "13px", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.2s ease", marginTop: "auto" }} 
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                Submit Review
                              </button>
                            </div>
                          ) : (
                            <div style={{ padding: "20px 24px", borderRadius: "16px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", gap: "16px", animation: "scaleUp 0.3s ease-out" }}>
                              <div style={{ fontSize: "28px" }}>🎉</div>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 800, color: "#15803d" }}>Review Submitted!</h3>
                                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= orderReviewRating ? "#fbbf24" : "none"} stroke={star <= orderReviewRating ? "#fbbf24" : "rgba(21,128,61,0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                  ))}
                                </div>
                                <p style={{ margin: 0, fontSize: "13px", color: "rgba(21, 128, 61, 0.8)", fontWeight: 500 }}>Thank you for your feedback. You earned 10 EcoPoints.</p>
                              </div>
                            </div>
                          )}

                          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Need Help?</h3>
                            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Report missing items, damages, or request a return within our 7-day guarantee period.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                              <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(225, 29, 72, 0.08)", color: "#e11d48", fontWeight: 700, fontSize: "13px", border: "1px solid rgba(225, 29, 72, 0.2)", cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.15)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.08)'}>Report an Issue</button>
                              <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.03)", color: "#000", fontWeight: 700, fontSize: "13px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}>Return Policy</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {settingsTab === "certificate" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: "24px", fontWeight: 800, color: "#000" }}>My Certificates</h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                      {(() => {
                        const certificates = [
                          { id: "CERT-2026-0528", course: "Urban Hydroponics Masterclass", date: "May 25, 2026", status: "Verified" },
                          { id: "CERT-2026-0410", course: "Advanced Crop Diagnostics", date: "April 10, 2026", status: "Verified" }
                        ];
                        
                        if (certificates.length === 0) {
                          return (
                            <div style={{ textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "14px", padding: "32px 0", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>
                              No certificates earned yet. Complete courses to unlock your certificates!
                            </div>
                          );
                        }

                        return certificates.map((cert, idx) => (
                          <div key={idx} style={{ padding: "20px", borderRadius: "16px", background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))", border: "1px solid rgba(34, 197, 94, 0.2)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
                              <div>
                                <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>CERTIFICATE ID</span>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#000" }}>{cert.id}</div>
                              </div>
                              <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", background: "rgba(34, 197, 94, 0.1)", color: "#15803d", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaCheckCircle /> {cert.status}
                              </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                              <div style={{ flex: 1, paddingRight: "16px" }}>
                                <div style={{ fontSize: "16px", fontWeight: 800, color: "#000", marginBottom: "4px" }}>{cert.course}</div>
                                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>Completed on {cert.date}</div>
                              </div>
                              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, boxShadow: "0 4px 12px rgba(34,197,94,0.15)" }}>
                                🎓
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "4px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                              <button 
                                style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }} 
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22, 163, 74, 0.2)'} 
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'}
                                onClick={() => alert(`Previewing ${cert.course} Certificate`)}
                              >
                                Preview
                              </button>
                              <button 
                                style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.2)", color: "#0284c7", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }} 
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)'} 
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'}
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({ title: 'My Certificate', text: `I just earned my ${cert.course} certificate on EcoEquity!`, url: window.location.href }).catch(console.error);
                                  } else {
                                    alert(`Share options for ${cert.course} Certificate`);
                                  }
                                }}
                              >
                                Share
                              </button>
                              <button 
                                style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.15)", transition: "transform 0.2s ease" }} 
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={() => alert(`Downloading ${cert.course} Certificate`)}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {settingsTab === "wishlist" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%", position: 'relative' }}>
                    {showClearWishlistConfirm && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "inherit", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(225, 29, 72, 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
                            <FaTrash size={24} style={{ color: "#e11d48" }} />
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
                              style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(225, 29, 72, 0.3)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(225, 29, 72, 0.4)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.3)'; }}
                            >Empty</button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h2 style={{ margin: "0", fontSize: "24px", fontWeight: 800, color: "#000" }}>Wishlist</h2>
                      {savedProducts && savedProducts.length > 0 && (
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
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 241, 242, 0.9)"; e.currentTarget.style.borderColor = "rgba(225, 29, 72, 0.2)"; e.currentTarget.style.color = "#e11d48"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(225, 29, 72, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "rgba(0,0,0,0.6)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                          <FaTrash size={12} style={{ marginTop: "-1px" }} /> Empty Wishlist
                        </button>
                      )}
                    </div>
                    {successMessage && (
                      <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#15803d", fontSize: "14px", fontWeight: 700, marginBottom: "16px", animation: "fadeIn 0.3s ease", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{fontSize: "16px"}}>✅</span> {successMessage}
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                       {savedProducts && savedProducts.length > 0 ? (
                         savedProducts.map(id => {
                           const product = products.find(p => p.id === id);
                           if (!product) return null;
                           return (
                             <div key={id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                               <div style={{ width: "48px", height: "48px", background: "rgba(22,163,74,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                                  🌱
                               </div>
                               <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                 <span style={{ fontSize: "15px", fontWeight: 700, color: "#000", lineHeight: 1.2 }}>{product.name}</span>
                                 <span style={{ fontSize: "13px", fontWeight: 600, color: "#15803d", marginTop: "4px" }}>₱{product.price.toFixed(2)}</span>
                               </div>
                               <div style={{ display: "flex", gap: "8px" }}>
                                 <button 
                                   onClick={() => {
                                     setCartItems(prev => [...prev, id]);
                                     setSuccessMessage(`${product.name} successfully added to cart!`);
                                     setTimeout(() => setSuccessMessage(null), 3000);
                                   }} 
                                   style={{ background: "rgba(22, 163, 74, 0.1)", color: "#15803d", padding: "8px 16px", borderRadius: "999px", border: "1px solid rgba(22, 163, 74, 0.2)", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease" }}
                                   onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(22, 163, 74, 0.2)'; e.currentTarget.style.transform = 'scale(1.035)'; }}
                                   onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                 >Add to Cart</button>
                                 <button 
                                   onClick={() => { setShowSettingsModal(false); setActiveNav("Shop All Products"); }} 
                                   style={{ background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", padding: "8px 16px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                 >View Product</button>
                               </div>
                               <button 
                                 onClick={() => setSavedProducts(prev => prev.filter(pId => pId !== id))}
                                 style={{ background: "rgba(225, 29, 72, 0.1)", border: "none", borderRadius: "8px", padding: "8px", color: "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                               ><FaTrash size={14} /></button>
                             </div>
                           );
                         })
                       ) : (
                         <div style={{ textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "14px", padding: "32px 0", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>Your wishlist is empty. Explore our products and save your favorites!</div>
                       )}
                    </div>
                  </div>
                )}

                {settingsTab === "ecopoints" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#000" }}>EcoPoints & Rewards</h2>
                      <div style={{ position: "relative" }} ref={ecoPointsDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsEcoPointsDropdownOpen(!isEcoPointsDropdownOpen)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "1px solid rgba(0,0,0,0.1)",
                            background: "rgba(255,255,255,0.8)",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#000",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                          }}
                        >
                          {ecoPointsSection === "All" ? "All Sections" : ecoPointsSection}
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
                              transform: isEcoPointsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease"
                            }}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>

                        {isEcoPointsDropdownOpen && (
                          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px", minWidth: "200px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 100 }}>
                            {["All", "Dashboard", "Rewards Marketplace", "How to Earn", "Eco Tiers", "Community Impact", "Referral Program", "Achievement Badges", "Redeem History"].map((section) => (
                              <button
                                key={section}
                                onClick={() => { setEcoPointsSection(section); setIsEcoPointsDropdownOpen(false); }}
                              onMouseEnter={() => setHoveredEcoPointsOption(section)}
                              onMouseLeave={() => setHoveredEcoPointsOption(null)}
                              style={{ padding: "10px 14px", borderRadius: "10px", background: ecoPointsSection === section ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredEcoPointsOption === section ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", border: ecoPointsSection === section ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", color: ecoPointsSection === section || hoveredEcoPointsOption === section ? "#064e3b" : "#000", fontSize: "13px", fontWeight: ecoPointsSection === section ? 700 : 500, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", boxShadow: ecoPointsSection === section ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredEcoPointsOption === section ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: ecoPointsSection === section ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: ecoPointsSection === section ? "blur(12px) saturate(180%)" : "none" }}
                              >
                                {section === "All" ? "All Sections" : section}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {successMessage && (
                      <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#15803d", fontSize: "14px", fontWeight: 700, marginBottom: "16px", animation: "fadeIn 0.3s ease" }}>
                        {successMessage}
                      </div>
                    )}
                    {errorMessage && (
                      <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(225, 29, 72, 0.1)", border: "1px solid rgba(225, 29, 72, 0.3)", color: "#e11d48", fontSize: "14px", fontWeight: 700, marginBottom: "16px", animation: "fadeIn 0.3s ease" }}>
                        {errorMessage}
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                      {(ecoPointsSection === "All" || ecoPointsSection === "Dashboard") && (
                        <>
                          <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.1))", border: "1px solid rgba(22, 163, 74, 0.2)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>Current Balance</span>
                              <div style={{ fontSize: "36px", fontWeight: 800, color: "#15803d", marginTop: "4px", lineHeight: 1 }}>{ecoPoints.toLocaleString()} <span style={{ fontSize: "16px", fontWeight: 700 }}>pts</span></div>
                          </div>
                          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 8px 16px rgba(22, 163, 74, 0.3)" }}>
                            🎁
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#15803d" }}>Eco Level: Green Grower 🌿</span>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>1,250 / 2,000 pts to next tier</span>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "rgba(22, 163, 74, 0.2)", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: "62.5%", background: "linear-gradient(90deg, #4ade80, #16a34a)", borderRadius: "999px" }}></div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                          <button 
                            onClick={() => openAccordion("Rewards Marketplace")}
                            style={{ flex: 1, padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >Redeem Rewards</button>
                          <button onClick={() => openAccordion("How to Earn")} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#15803d", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Earn More Points</button>
                        </div>
                          </div>

                          {/* Eco Activity Timeline */}
                          <div style={{ marginTop: "16px", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }}>
                            <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Eco Activity Timeline</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
                              <div style={{ position: "absolute", left: "20px", top: "20px", bottom: "20px", width: "2px", background: "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(34,197,94,0.1))", borderRadius: "999px" }}></div>
                              
                              {ecoTimelineActivities.slice(0, visibleTimelineItems).map((activity, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
                                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, zIndex: 2, boxShadow: `0 0 15px ${activity.glow}` }}>
                                    {activity.icon}
                                  </div>
                                  <div style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))", border: "1px solid rgba(255,255,255,0.6)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#000" }}>{activity.title}</h4>
                                      <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>{activity.time}</span>
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: 800, color: activity.color }}>
                                      {activity.points} pts
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {visibleTimelineItems < ecoTimelineActivities.length && (
                              <button 
                                onClick={() => setVisibleTimelineItems(prev => prev + 4)}
                                style={{ width: "100%", marginTop: "24px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#15803d", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}>
                                Load More
                              </button>
                            )}
                          </div>
                        </>
                      )}
                      
                      {(ecoPointsSection === "All" || ecoPointsSection === "Rewards Marketplace") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>REWARDS MARKETPLACE</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        {[
                          { title: "Free Delivery Voucher", points: "500 pts", icon: "🚚", badge: "Eco-Logistics" },
                          { title: "Native Seed Kit", points: "1,200 pts", icon: "🌱", badge: "Biodiversity" },
                          { title: "Organic Gardening Set", points: "2,500 pts", icon: "🛠️", badge: "Zero Waste" },
                          { title: "Premium AI Subscription", points: "3,000 pts", icon: "🤖", badge: "Digital" }
                        ].map((reward, idx) => (
                          <div key={idx} style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ height: "120px", borderRadius: "12px", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                              <span style={{ position: "absolute", top: "8px", left: "8px", background: "#15803d", color: "#fff", padding: "4px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>{reward.badge}</span>
                              <span style={{ fontSize: "48px" }}>{reward.icon}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#000" }}>{reward.title}</h4>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: "#16a34a" }}>{reward.points}</span>
                            </div>
                            <button 
                                onClick={() => redeemReward(reward)} 
                              style={{ width: "100%", padding: "10px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "auto", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >Redeem</button>
                          </div>
                        ))}
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "How to Earn") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>HOW TO EARN ECOPOINTS</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                           <FaShoppingCart size={20} color="#15803d" />
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>Buy Organic Products</span>
                           <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>+50 pts</span>
                        </div>
                        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                           <FaCalendarAlt size={20} color="#15803d" />
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>Attend Workshop</span>
                           <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>+75 pts</span>
                        </div>
                        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                           <FaUserPlus size={20} color="#15803d" />
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>Invite Friend</span>
                           <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>+200 pts</span>
                        </div>
                        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                           <FaRobot size={20} color="#15803d" />
                           <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>Complete AI Diagnosis</span>
                           <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>+30 pts</span>
                        </div>
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Eco Tiers") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>ECO TIER LEVELS</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        {[
                          { title: "Seedling 🌱", points: "0 - 999 pts", benefits: ["Basic rewards", "Community access"] },
                          { title: "Green Grower 🌿", points: "1,000 - 4,999 pts", benefits: ["Free delivery", "5% Discounts"], active: true },
                          { title: "Eco Guardian 🌳", points: "5,000 - 9,999 pts", benefits: ["Exclusive workshops", "10% Discounts"] },
                          { title: "Sustainability Hero 🌎", points: "10,000+ pts", benefits: ["Bonus EcoPoints", "VIP Support", "15% Discounts"] }
                        ].map((tier, idx) => (
                          <div key={idx} style={{ background: tier.active ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.1))" : "rgba(255,255,255,0.6)", border: tier.active ? "1px solid rgba(22, 163, 74, 0.4)" : "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                            {tier.active && <span style={{ position: "absolute", top: "-10px", right: "16px", background: "#15803d", color: "#fff", padding: "4px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>Current Level</span>}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#000" }}>{tier.title}</h4>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>{tier.points}</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", gap: "6px" }}>
                              {tier.benefits.map((b, i) => <li key={i} style={{ fontWeight: 500 }}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Community Impact") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>COMMUNITY IMPACT</h3>
                          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                          {[
                            { label: "Trees Planted", value: "12", icon: "🌲" },
                            { label: "Farmers Supported", value: "3", icon: "🧑‍🌾" },
                            { label: "Native Seeds Preserved", value: "250", icon: "🌾" },
                            { label: "CO₂ Reduced", value: "45kg", icon: "☁️" },
                          ].map((stat, idx) => (
                             <div key={idx} style={{ background: "rgba(22, 163, 74, 0.05)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                               <span style={{ fontSize: "24px" }}>{stat.icon}</span>
                               <span style={{ fontSize: "20px", fontWeight: 800, color: "#15803d", lineHeight: 1 }}>{stat.value}</span>
                               <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>{stat.label}</span>
                             </div>
                          ))}
                        </div>
                        <div style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(21, 128, 61, 0.15))", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", border: "1px solid rgba(22, 163, 74, 0.2)", marginTop: "8px" }}>
                          <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#15803d", flex: 1 }}>“Your EcoPoints helped support 3 local farmers 🌱”</span>
                          <button 
                            onClick={() => window.alert("Thanks for sharing your EcoPoints impact!")} 
                            style={{ padding: "8px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", border: "1px solid rgba(255,255,255,0.35)", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Share
                          </button>
                        </div>
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Referral Program") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>REFERRAL PROGRAM</h3>
                          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Invite Friends → Earn 500 EcoPoints</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Share your unique referral code with friends. You both earn points when they sign up!</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(22, 163, 74, 0.1)", padding: "12px 16px", borderRadius: "12px", border: "1px dashed #15803d" }}>
                          <span style={{ fontSize: "18px", fontWeight: 800, color: "#15803d", letterSpacing: "2px" }}>ECO-GROW-26</span>
                          <button 
                            onClick={copyReferralCode}
                            className={copiedReferral ? "animate-copy" : ""}
                            style={{ background: copiedReferral ? "#15803d" : "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: copiedReferral ? "#fff" : "#062018", border: "1px solid rgba(255,255,255,0.35)", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "all 0.3s ease" }}
                            onMouseEnter={(e) => !copiedReferral && (e.currentTarget.style.transform = 'scale(1.035)')}
                            onMouseLeave={(e) => !copiedReferral && (e.currentTarget.style.transform = 'scale(1)')}
                          >{copiedReferral ? "Copied!" : "Copy Link"}</button>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                           <button onClick={() => shareReferral("Facebook")} style={{ padding: "8px 16px", borderRadius: "8px", background: "#1877F2", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Facebook</button>
                           <button onClick={() => shareReferral("Twitter / X")} style={{ padding: "8px 16px", borderRadius: "8px", background: "#1DA1F2", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Twitter / X</button>
                           <button onClick={() => shareReferral("WhatsApp")} style={{ padding: "8px 16px", borderRadius: "8px", background: "#25D366", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>WhatsApp</button>
                        </div>
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Achievement Badges") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>ACHIEVEMENT BADGES</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                        {badges.map((badge, idx) => (
                               <div key={idx} onClick={(e) => {
                                 if (badge.earned) {
                                   window.alert(`Badge Details:\n\n${badge.name}\n\nYou've unlocked this badge!`);
                                 } else {
                                   window.alert("Keep earning EcoPoints to unlock this badge");
                                 }
                               }} className={badge.justUnlocked ? "animate-unlock" : ""} style={{ background: badge.earned ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.02)", border: badge.earned ? "1px solid rgba(22, 163, 74, 0.3)" : "1px dashed rgba(0,0,0,0.1)", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", opacity: badge.earned ? 1 : 0.6, cursor: badge.earned ? "default" : "pointer", transition: "all 0.3s ease" }}>
                             <span style={{ fontSize: "32px", filter: badge.earned ? "none" : "grayscale(100%)", transition: "filter 0.3s ease" }}>{badge.icon}</span>
                             <span style={{ fontSize: "13px", fontWeight: 700, color: badge.earned ? "#15803d" : "rgba(0,0,0,0.5)" }}>{badge.name}</span>
                             {!badge.earned && <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)", marginTop: "-4px" }}>Click to unlock</span>}
                           </div>
                        ))}
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Redeem History") && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 4px", position: "relative", zIndex: 10 }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#000" }}>REDEEM HISTORY</h3>
                            <div style={{ position: "relative" }} ref={redeemFilterDropdownRef}>
                              <button
                                type="button"
                                onClick={() => setIsRedeemFilterDropdownOpen(!isRedeemFilterDropdownOpen)}
                                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#000", display: "flex", alignItems: "center", gap: "6px" }}
                              >
                                {redeemHistoryFilter === "All" ? "All Status" : redeemHistoryFilter}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    transform: isRedeemFilterDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s ease"
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>

                              {isRedeemFilterDropdownOpen && (
                                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "4px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", minWidth: "120px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 100 }}>
                                  {["All", "Active", "Shipped"].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => { setRedeemHistoryFilter(status); setIsRedeemFilterDropdownOpen(false); }}
                                      onMouseEnter={() => setHoveredRedeemFilterOption(status)}
                                      onMouseLeave={() => setHoveredRedeemFilterOption(null)}
                                      style={{ padding: "8px 12px", borderRadius: "8px", background: redeemHistoryFilter === status ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : hoveredRedeemFilterOption === status ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent", border: redeemHistoryFilter === status ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent", color: redeemHistoryFilter === status || hoveredRedeemFilterOption === status ? "#064e3b" : "#000", fontSize: "12px", fontWeight: redeemHistoryFilter === status ? 700 : 500, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", boxShadow: redeemHistoryFilter === status ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredRedeemFilterOption === status ? "0 4px 12px rgba(34,197,94,0.08)" : "none", backdropFilter: redeemHistoryFilter === status ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: redeemHistoryFilter === status ? "blur(12px) saturate(180%)" : "none" }}
                                    >
                                      {status === "All" ? "All Status" : status}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", overflowX: "auto" }}>
                        <table style={{ width: "100%", minWidth: "400px", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "12px 8px", fontSize: "12px", color: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Reward Redeemed</th>
                              <th style={{ padding: "12px 8px", fontSize: "12px", color: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>EcoPoints Used</th>
                              <th style={{ padding: "12px 8px", fontSize: "12px", color: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Date</th>
                              <th style={{ padding: "12px 8px", fontSize: "12px", color: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const history = [
                                { reward: "Free Delivery Voucher", points: "-500", date: "May 20, 2026", status: "Active" },
                                { reward: "Native Seed Kit", points: "-1,200", date: "Apr 15, 2026", status: "Shipped" }
                              ].filter(item => redeemHistoryFilter === "All" || item.status === redeemHistoryFilter);
                              
                              if (history.length === 0) {
                                return <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "13px" }}>No records found for this status.</td></tr>;
                              }
                              
                              return history.map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 600 }}>{item.reward}</td>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 700, color: "#e11d48" }}>{item.points} pts</td>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>{item.date}</td>
                                  <td style={{ padding: "12px 8px" }}><span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: item.status === "Active" ? "rgba(34, 197, 94, 0.1)" : "rgba(0,0,0,0.05)", color: item.status === "Active" ? "#15803d" : "rgba(0,0,0,0.6)" }}>{item.status}</span></td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {settingsTab === "settings" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: "24px", fontWeight: 800, color: "#000" }}>Account Settings</h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                      <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Notifications</h3>
                        <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.8)", cursor: "pointer" }} onClick={() => handleNotificationChange('email')}>
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.email} 
                            readOnly
                            style={{ width: "18px", height: "18px", accentColor: "#16a34a", cursor: "pointer" }} />
                          Email Notifications
                        </label>
                        <div style={{ height: "12px" }}></div>
                        <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.8)", cursor: "pointer" }} onClick={() => handleNotificationChange('sms')}>
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.sms} 
                            readOnly
                            style={{ width: "18px", height: "18px", accentColor: "#16a34a", cursor: "pointer" }} />
                          SMS Updates
                        </label>
                      </div>
                      <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Security</h3>
                        <button style={{ padding: "12px 20px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s ease" }}>Change Password</button>
                        <button style={{ padding: "12px 20px", borderRadius: "10px", border: "none", background: "rgba(220, 38, 38, 0.1)", color: "#dc2626", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s ease", marginLeft: "12px" }}>Deactivate Account</button>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9 — SUCCESS MODAL */}
        {showRewardSuccessModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", padding: "40px", borderRadius: "24px", textAlign: "center", maxWidth: "400px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
              <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 800, color: "#000" }}>Reward Successfully Redeemed!</h2>
              <p style={{ margin: "0 0 32px", fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>Your EcoPoints have been deducted and your reward is now active.</p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { setShowRewardSuccessModal(false); setShowSettingsModal(false); setActiveNav("Shop All Products"); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Continue Shopping</button>
                <button 
                  onClick={() => setShowRewardSuccessModal(false)} 
                  style={{ flex: 1, padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >View Rewards</button>
              </div>
            </div>
          </div>
        )}

        {showCancelConfirmModal && selectedOrderForTracking && ReactDOM.createPortal(
          <div style={styles.cancelModalOverlay} onClick={() => setShowCancelConfirmModal(false)}>
            <div 
              style={styles.cancelConfirmModal}
              onClick={e => e.stopPropagation()}
            >
              <div style={styles.cancelIconWrap}>
                <FaExclamationTriangle size={24} style={{ color: "#dc2626" }} />
              </div>
              <h3 style={styles.cancelModalTitle}>Cancel This Order?</h3>
              <p style={styles.cancelModalText}>
                Are you sure you want to cancel order <strong>{selectedOrderForTracking.id}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <button 
                  onClick={() => setShowCancelConfirmModal(false)} 
                  style={styles.cancelModalKeepBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                >
                  Keep Order
                </button>
                <button 
                  onClick={() => {
                    setOrders(prev => prev.map(o => o.id === selectedOrderForTracking.id ? { ...o, status: "Cancelled" } : o));
                    setSelectedOrderForTracking(prev => ({ ...prev, status: "Cancelled" }));
                    setShowCancelConfirmModal(false);
                  }} 
                  style={styles.cancelModalConfirmBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(225, 29, 72, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.3)'; }}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {showRiderChat && (
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 4000, width: "320px", background: "#fff", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid rgba(14, 165, 233, 0.3)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "scaleUp 0.3s ease" }}>
             <div style={{ background: "linear-gradient(135deg, #7dd3fc, #38bdf8)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#082f49" }}>
               <div style={{ fontWeight: 800, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                 <span style={{ fontSize: "18px" }}>🛵</span> Juan Perez
               </div>
               <button onClick={() => setShowRiderChat(false)} style={{ background: "rgba(255,255,255,0.3)", border: "none", color: "#082f49", cursor: "pointer", fontSize: "16px", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>&times;</button>
             </div>
             <div className="custom-scrollbar" style={{ height: "240px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "#f0f9ff" }}>
               {riderChatMessages.map((msg, i) => (
                 <div key={i} style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", background: msg.sender === "user" ? "#0ea5e9" : "#fff", color: msg.sender === "user" ? "#fff" : "#0f172a", padding: "10px 14px", borderRadius: "14px", borderBottomRightRadius: msg.sender === "user" ? "4px" : "14px", borderBottomLeftRadius: msg.sender === "rider" ? "4px" : "14px", fontSize: "13px", maxWidth: "85%", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: msg.sender === "rider" ? "1px solid rgba(14,165,233,0.15)" : "none", lineHeight: 1.4 }}>
                   {msg.text}
                 </div>
               ))}
             </div>
             <div style={{ padding: "12px", background: "#fff", borderTop: "1px solid rgba(14,165,233,0.1)", display: "flex", gap: "8px" }}>
               <input value={riderChatInput} onChange={e => setRiderChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendRiderMessage()} placeholder="Type your message..." style={{ flex: 1, padding: "10px 14px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", outline: "none", fontSize: "13px", background: "#f8fafc", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#38bdf8"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"} />
               <button onClick={handleSendRiderMessage} style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", color: "#fff", border: "none", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s ease", boxShadow: "0 2px 8px rgba(14,165,233,0.3)", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "-2px" }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
               </button>
             </div>
          </div>
        )}

        {showAIChat && (
          <AIChatInterface onClose={() => setShowAIChat(false)} isMobile={isMobile} />
        )}

        {rewardParticles.map(p => (
          <div key={p.id} style={{
            position: "fixed", left: p.x, top: p.y, zIndex: 9999, pointerEvents: "none", fontSize: "24px",
            '--tx': `${Math.cos(p.angle) * p.velocity}px`,
            '--ty': `${Math.sin(p.angle) * p.velocity}px`,
            animation: "particleExplode 1s ease-out forwards"
          }}>
            {p.emoji}
          </div>
        ))}

        {activeNav === "Learn More" && !isMobile && (
          <button
            type="button"
            style={{
              ...styles.glassBtn,
              ...styles.exploreMoreBtn,
              ...(isMobile ? styles.exploreMoreBtnMobile : {}),
              ...(exploreHovered ? styles.glassBtnHov : {}),
            }}
            onClick={() => setActiveNav("Explore More")}
            onMouseEnter={() => setExploreHovered(true)}
            onMouseLeave={() => setExploreHovered(false)}
          >
            <span aria-hidden="true" style={styles.glassInnerBlur} />
            <span style={styles.glassContentLayer}>Explore more</span>
          </button>
        )}

        {/* Bottom Mobile Glass Container */}
        {isMobile && !isAuthPage && (
          <div style={styles.bottomGlassContainerMobile}>
            <button onClick={() => handleNavChange("Home")} style={{ ...styles.bottomNavBtn, opacity: activeNav === "Home" ? 1 : 0.6 }}>
              <Home size={22} color="#ffffff" />
            </button>
            <button onClick={() => handleNavChange("About Us")} style={{ ...styles.bottomNavBtn, opacity: activeNav === "About Us" ? 1 : 0.6 }}>
              <Users size={22} color="#ffffff" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ position: "relative", width: "48px", height: "48px", transform: "translateY(-12px)" }}>
                <div className="chat-ai-glow" />
                <button onClick={() => setShowAIChat(true)} style={{ ...styles.bottomNavBtnCenter, transform: "none", position: "relative", overflow: "hidden" }}>
                  <span className="orbit-container-mobile" />
                  <Sparkles size={24} color="url(#appIconGradient)" style={{ position: "relative", zIndex: 1 }} />
                </button>
              </div>
            </div>
            <button
              onClick={() => handleNavChange("Seasonal Harvest")}
              aria-label="Seasonal Harvest"
              style={{ ...styles.bottomNavBtn, opacity: activeNav === "Seasonal Harvest" ? 1 : 0.6 }}
            >
              <Wheat size={23} color="#ffffff" />
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsProfileDropdownOpen(false);
                setSettingsTab("profile");
                setShowSettingsModal(true);
              }}
              aria-label="My Profile"
              style={{ ...styles.bottomNavBtn, opacity: showSettingsModal && settingsTab === "profile" ? 1 : 0.6 }}
            >
              <CircleUserRound size={23} color="#ffffff" />
            </button>
          </div>
        )}

        {/* Mobile Seasonal Harvest Modal */}
        {activeNav === "Seasonal Harvest" && isMobile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", overflowY: "auto", display: "flex", flexDirection: "column", animation: "scaleUp 0.3s ease" }}>
            <button onClick={() => handleNavChange("Home")} aria-label="Close Seasonal Harvest" style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ padding: "40px 0" }}>
              <SeasonalHarvestPage setActiveNav={setActiveNav} onNotify={handleNotify} harvests={harvests} />
            </div>
          </div>
        )}

        {/* Mobile About Us Modal */}
        {activeNav === "About Us" && isMobile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", overflowY: "auto", display: "flex", flexDirection: "column", animation: "scaleUp 0.3s ease" }}>
            <button onClick={() => handleNavChange("Home")} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ padding: "40px 0" }}>
              <AboutUs />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
const styles = {
 
  page: {
    height: "100vh",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    color: "#000",
    // Removed backgroundImage and backgroundSize as video will be used
    // backgroundImage: "url('/IMG_6223.jpeg')",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  pageMobile: {
    minHeight: "100dvh",
    height: "100dvh",
    padding: 0,
    alignItems: "stretch",
    justifyContent: "center",
    overflowX: "hidden",
  },


  bgScrim: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(140deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)",
    pointerEvents: "none",
    // zIndex is set inline in the component to ensure it's above the video
    // but below the shell content.
  },

  shell: {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.05), " +
      "inset 0 1px 0 rgba(255,255,255,0.8), " +
      "inset 0 -1px 0 rgba(255,255,255,0.3)",
    maxWidth: "1400px",
    width: "100%",
    height: "calc(100vh - 40px)",
    margin: "0 auto",
    borderRadius: "30px",
    padding: "28px clamp(20px, 4vw, 52px)",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(24px) saturate(155%)",
    WebkitBackdropFilter: "blur(24px) saturate(155%)",
  },

  shellMobile: {
    height: "calc(100dvh - clamp(8px, 2dvh, 16px))",
    width: "calc(100vw - clamp(18px, 6vw, 48px))",
    maxWidth: "430px",
    minWidth: 0,
    margin: "clamp(4px, 1dvh, 8px) auto 0",
    borderRadius: "clamp(18px, 5vw, 24px)",
    padding: "clamp(7px, 1.3dvh, 11px) clamp(10px, 3.5vw, 16px) 100px",
    overflowY: "auto",
    overflowX: "hidden",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px 10px 14px",
    borderRadius: "999px",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    marginBottom: "0",
    position: "relative",
    zIndex: 50,
  },

  navbarMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: "clamp(6px, 2vw, 10px)",
    borderRadius: "20px",
    padding: "0 2px clamp(4px, 1dvh, 7px)",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoLeaf: {
    fontSize: "19px",
    lineHeight: 1,
  },

  logoText: {
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "0",
    background: "linear-gradient(90deg, #065f46, #0284c7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  logoTextMobile: { // New mobile style for logoText
    fontSize: "clamp(12px, 3.4vw, 14px)",
    fontWeight: 700,
  },

  ecoLogo: {
    height: "54px",
    width: "auto",
    // Removed marginRight as gap in logoWrap will handle spacing
  },
  ecoLogoMobile: { // New mobile style for ecoLogo
    height: "clamp(24px, 7vw, 30px)",
  },

  mobileWelcomeCard: {
    width: "calc(100% - 12px)",
    minHeight: "100px",
    margin: "8px 8px 0 4px",
    padding: "14px 13px 14px 18px",
    borderRadius: "18px",
    background: "linear-gradient(-45deg, rgba(134,239,172,0.5), rgba(125,211,252,0.5), rgba(253,230,138,0.5), rgba(167,243,208,0.5))",
    backgroundSize: "300% 300%",
    animation: "mobileWelcomeGradient 8s ease infinite",
    border: "1px solid rgba(255,255,255,0.42)",
    boxShadow: "0 12px 28px rgba(34,197,94,0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
    backdropFilter: "blur(18px) saturate(165%)",
    WebkitBackdropFilter: "blur(18px) saturate(165%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    boxSizing: "border-box",
  },

  mobileWelcomeText: {
    minWidth: 0,
    flex: 1,
    color: "#062018",
    fontSize: "clamp(12px, 3.5vw, 14px)",
    fontWeight: 800,
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  mobileWelcomeAvatar: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(255,255,255,0.7)",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    fontSize: "48px",
    fontWeight: 800,
    boxShadow: "0 8px 24px rgba(6,32,24,0.12)",
  },

  hamburgerButton: {
    position: "relative",
    zIndex: 2000,
    width: "clamp(34px, 9vw, 40px)",
    height: "clamp(34px, 9vw, 40px)",
    marginLeft: "auto",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.05)",
    background: "rgba(255,255,255,0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
  },
  hamburgerButtonActive: {
    background: "rgba(134,239,172,0.4)",
    border: "1px solid rgba(134,239,172,0.5)",
  },
  hamburgerLine: {
    width: "18px",
    height: "2px",
    borderRadius: "999px",
    background: "#000",
    transition: "transform 0.18s ease, opacity 0.18s ease",
  },
  hamburgerLineTopOpen: {
    transform: "translateY(7px) rotate(45deg)",
  },
  hamburgerLineMiddleOpen: {
    opacity: 0,
  },
  hamburgerLineBottomOpen: {
    transform: "translateY(-7px) rotate(-45deg)",
  },

  navLinks: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  navLinksMobile: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "8px",
    padding: "10px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 16px 34px rgba(0,0,0,0.05)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
  },

  navLinksMobileHidden: {
    display: "none",
  },

  bottomGlassContainerMobile: {
    position: "fixed",
    bottom: "clamp(16px, 3dvh, 24px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100vw - clamp(60px, 16vw, 100px))",
    maxWidth: "360px",
    height: "56px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "clamp(18px, 5vw, 24px)",
    zIndex: 2000,
    boxSizing: "border-box",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },
  bottomNavBtn: {
    background: "transparent",
    border: "none",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#062018",
    flex: 1,
    transition: "opacity 0.2s ease"
  },
  bottomNavBtnCenter: {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
    transform: "translateY(-12px)",
  },
  navDropdownWrapMobile: {
    width: "100%",
    alignItems: "stretch",
  },

  linkBtn: {
    cursor: "pointer", 
    fontSize: "13px", 
    fontWeight: 600,
    color: "rgba(0, 0, 0, 0.75)",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.02)",
    border: "1px solid transparent",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },

  linkBtnMobile: {
    width: "100%",
    justifyContent: "center",
    minHeight: "42px",
  },

  linkBtnActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))",
    border: "1px solid rgba(134,239,172,0.4)",
    color: "#064e3b",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },

  linkBtnHover: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))",
    border: "1px solid transparent",
    color: "#064e3b",
    boxShadow: "0 4px 12px rgba(34,197,94,0.08)",
    transform: "translateY(-1px)",
  },

  pageContent: { 
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    marginTop: "6px",
    borderRadius: "20px",
  },

  hero: {
    width: "calc(100% - 100px)", // Prevents overflow from the left margin
    maxWidth: "820px",
    margin: "clamp(20px, 5vh, 50px) 0 0 78px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    animation: "fadeInUp 0.85s cubic-bezier(.22,1,.36,1) both",
  },

  heroMobile: {
    maxWidth: "100%",
    width: "100%",
    minWidth: 0,
    margin: "clamp(15px, 3dvh, 30px) 0 0 0",
    padding: "0",
    overflowX: "hidden",
  },

  heroRightCard: {
    flex: "0 1 540px",
    width: "100%",
    background: "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  heroRightCardHov: {
    transform: "translateY(-4px)",
    boxShadow: "0 24px 48px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
  },

  badge: { 
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 15px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    fontSize: "11px",
    fontWeight: 600,
    color: "#15803d",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "22px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
  },

  badgeMobile: {
    maxWidth: "100%",
    padding: "clamp(4px, 0.8dvh, 6px) clamp(8px, 2.6vw, 12px)",
    fontSize: "clamp(8px, 2.5vw, 10px)",
    whiteSpace: "nowrap",
    marginBottom: "clamp(6px, 1.3dvh, 12px)",
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

  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(22,163,74,0) 0%, #16a34a 30%, #0284c7 50%, #16a34a 70%, rgba(2,132,199,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 0 22px",
    boxShadow: "0 0 12px rgba(22,163,74,0.4)",
    borderRadius: "999px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both, shimmerLine 2.5s linear infinite",
  },

  titleUnderlineMobile: {
    width: "clamp(70px, 22vw, 94px)",
    height: "3px",
    margin: "0 0 clamp(7px, 1.2dvh, 11px)",
  },

  titleMobile: {
    fontSize: "clamp(20px, min(7vw, 3.25dvh), 30px)",
    lineHeight: 1.02,
    maxWidth: "100%",
    overflowWrap: "break-word",
    marginBottom: "clamp(4px, 0.8dvh, 7px)",
  },

  titleAccent: { 
    background: "linear-gradient(90deg, #4ade80, #86efac)",
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

  ctaRow: { 
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: "38px",
  },

  ctaRowMobile: {
    flexDirection: "column",
    gap: "clamp(6px, 1dvh, 9px)",
    width: "100%",
    maxWidth: "clamp(210px, 68vw, 260px)",
    marginBottom: "clamp(10px, 1.8dvh, 16px)",
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
  customDropdownWrap: { position: "relative", width: "200px" },
  customDropdownHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255, 255, 255, 0.7)",
    fontSize: "13px",
    fontWeight: 600,
    color: "#000",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    outline: "none",
    textAlign: "left"
  },
  customDropdownHeaderActive: {
    borderColor: "#16a34a",
    boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)",
  },
  customDropdownList: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    zIndex: 10,
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    padding: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    maxHeight: "200px",
    overflowY: "auto",
  },
  customDropdownItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
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
  cancelModalOverlay: { position: "fixed", inset: 0, zIndex: 2001, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, animation: "fadeIn 0.3s ease" },
  orderDetailsCard: { padding: "24px", borderRadius: "20px", background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)", backdropFilter: "blur(20px) saturate(165%)", WebkitBackdropFilter: "blur(20px) saturate(165%)", display: "flex", flexDirection: "column", gap: "16px" },
  cancelConfirmModal: { background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "90%", maxWidth: "380px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out" },
  cancelIconWrap: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(225, 29, 72, 0.2)", animation: "shakeIcon 0.6s ease-in-out" },
  cancelModalTitle: { margin: "0 0 12px", fontSize: "22px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" },
  cancelModalText: { margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 },
  cancelModalKeepBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" },
  cancelModalConfirmBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(225, 29, 72, 0.3)" },
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

  responsiveBtnMobile: {
    width: "100%",
    flex: "none",
    minWidth: 0,
    maxWidth: "none",
    padding: "clamp(6px, 1dvh, 8px) 10px",
    fontSize: "clamp(11px, 3.3vw, 13px)",
    minHeight: "clamp(30px, 4.5dvh, 36px)",
    textAlign: "center",
  },

  glassBtn: { 
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    padding: "13px 28px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#000",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transform: "scale(1)", // Default scale for transition
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.16s ease",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
  },
  glassInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.8), transparent 45%), " +
      "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
    backdropFilter: "blur(34px) saturate(185%)",
    WebkitBackdropFilter: "blur(34px) saturate(185%)",
  },
  glassContentLayer: {
    position: "relative",
    zIndex: 1,
  },

  glassBtnHov: {
    transform: "scale(1.035)",
  },

  exploreMoreBtn: {
    position: "absolute",
    bottom: "28px",
    right: "clamp(12px, 3vw, 42px)",
    zIndex: 10,
    padding: "10px 24px",
    fontSize: "13px",
  },

  exploreMoreBtnMobile: {
    bottom: "20px",
    right: "16px",
    padding: "10px 20px",
    fontSize: "13px",
  },

  chatWithAiBtnWrap: {
    position: "absolute",
    bottom: "28px",
    right: "clamp(20px, 4vw, 52px)",
    zIndex: 10,
  },

  chatWithAiBtnWrapMobile: {
    position: "relative",
    margin: "clamp(10px, 2dvh, 20px) 0 0 clamp(38px, 11vw, 50px)",
    display: "flex",
    justifyContent: "flex-start",
    width: "fit-content",
  },

  chatWithAiBtnMobile: {
    padding: "clamp(8px, 1.4dvh, 11px) clamp(13px, 4vw, 18px)",
    fontSize: "clamp(11px, 3.4vw, 13px)",
    whiteSpace: "nowrap",
  },

  statsStrip: { 
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "10px 30px",
    borderRadius: "14px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    transition:
      "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  statsStripHov: {
    transform: "scale(1.015)",
  },
  statsStripMobile: {
    width: "100%",
    maxWidth: "100%",
    padding: "clamp(8px, 1dvh, 10px) clamp(5px, 1.5vw, 10px)",
    flexDirection: "row",
    gap: "2px",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginTop: "clamp(10px, 1.8dvh, 16px)",
  },
  statCell: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "clamp(4px, 1vw, 10px)",
    padding: "0 clamp(5px, 2vw, 12px)",
  },

  statCellDivider: {
    borderRight: "1px solid rgba(0,0,0,0.1)",
  },
  statCellDividerMobile: { // New mobile style for statCellDivider
    borderRight: "1px solid rgba(0,0,0,0.1)",
    borderBottom: "none",
    paddingBottom: 0,
    width: "auto",
  },

  statVal: {
    fontSize: "clamp(13px, min(4vw, 2dvh), 17px)",
    fontWeight: 700,
    color: "#000", 
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
    marginBottom: "3px", // Adjusted spacing
  },

  statLbl: {
    fontSize: "clamp(6px, 1.9vw, 8px)",
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.7)",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
  },

  cardRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "nowrap",
    justifyContent: "flex-start", // Left-aligned content within the strip
    marginTop: "-10px", // Moved up further
    width: "100%",
  },
  cardRowMobile: { // New mobile style for cardRow
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: "clamp(5px, 2vw, 9px)",
    marginTop: "0",
    width: "100%",
    maxWidth: "100%",
    overflow: "visible",
    padding: "0 0 clamp(4px, 0.8dvh, 7px)",
    marginLeft: "0",
    marginRight: "0",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "10px 12px 12px",
    flex: "0 1 170px",
    maxWidth: "190px",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // Changed to justify left the content within the card
    gap: "8px",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
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
  cardInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.6), transparent 42%), " +
      "linear-gradient(155deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
    backdropFilter: "blur(34px) saturate(180%)",
    WebkitBackdropFilter: "blur(34px) saturate(180%)",
    filter: "blur(0.2px)",
  },
  cardContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  cardMobile: { // New mobile style for card
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
  cardHov: {
    transform: "scale(1.025)",
  },

  cardIcon: {
    fontSize: "30px",
    lineHeight: 1,
    marginTop: "-5px",
    marginLeft: "-5px",
    filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.22))",
  },
  cardIconMobile: {
    marginLeft: 0,
    alignSelf: "center",
  },
  cardHeading: {
    fontSize: "13px",
    fontWeight: 700,
      color: "#064e3b",
    margin: 0,
      letterSpacing: "-0.2px",
    fontFamily: "'Poppins', sans-serif",
  },
    cardHeadingMobile: {
      fontSize: "14px",
  },
  cardText: {
    fontSize: "10px",
      color: "rgba(0, 0, 0, 0.65)",
    lineHeight: 1.4,
    margin: 0,
      textAlign: "left",
  },
    cardTextMobile: {
      fontSize: "12px",
      lineHeight: 1.4,
  },
  featureIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(134,239,172,0.15), rgba(125,211,252,0.15))",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 16px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
    position: "relative",
    zIndex: 1,
  },
  featureIconWrapSmall: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(134,239,172,0.15), rgba(125,211,252,0.15))",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 4px 8px rgba(34, 197, 94, 0.1), inset 0 1px 2px rgba(255,255,255,0.5)",
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
  },

  dropdownMenu: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderRadius: "14px",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "max-content",
    maxWidth: "240px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  dropdownMenuMobile: {
    marginTop: "6px",
    background: "rgba(255,255,255,0.4)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
    border: "none",
    maxWidth: "none",
    minWidth: "100%",
    width: "100%",
    alignItems: "center",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
  },
  dropdownItem: {
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.8)",
    padding: "8px 14px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid transparent",
    whiteSpace: "normal",
    lineHeight: "1.4",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.3s ease",
    width: "100%",
  },
  dropdownItemMobile: {
    textAlign: "center",
  },
  dropdownItemActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))",
    border: "1px solid rgba(134,239,172,0.4)",
    color: "#064e3b",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },
  dropdownItemHover: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))",
    color: "#064e3b",
    boxShadow: "0 4px 12px rgba(34,197,94,0.08)",
  },
  authMessage: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
    boxSizing: "border-box",
    animation: "fadeIn 0.3s ease",
  },
  authMessageSuccess: {
    background: "rgba(22, 163, 74, 0.1)",
    color: "#15803d",
    border: "1px solid rgba(22, 163, 74, 0.2)",
  },
  authMessageError: {
    background: "rgba(220, 38, 38, 0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(220, 38, 38, 0.15)",
  },
};

export default App;
