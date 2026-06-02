import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, Users, ShieldCheck, Box, ShoppingCart, 
  Truck, CreditCard, Repeat, CalendarDays, Stethoscope, 
  BarChart2, FileText, Settings, LogOut, 
  Search, Bell, TrendingUp, TrendingDown, CheckCircle, XCircle, Edit2, Save, X, Image, AlertCircle, Trash2, Eye, Clock, MapPin, Phone, Package, Filter, Navigation, UserCheck, MessageSquare, Route, Leaf, RefreshCcw, Download, Zap, Crown, Activity, Tag, Ticket, Video, Scan, Target, Bug, Thermometer, PieChart, Globe, Lightbulb, Megaphone, Wand2, Layout, Plus, Play, Database, Wheat, Send
} from "lucide-react";

const mockStats = [
  { label: "Total Users", value: "15,243", trend: "+12%", up: true, icon: <Users size={16} color="#15803d" /> },
  { label: "Total Orders", value: "3,492", trend: "+8%", up: true, icon: <ShoppingCart size={16} color="#0284c7" /> },
  { label: "Total Revenue", value: "₱2.4M", trend: "+15%", up: true, icon: <CreditCard size={16} color="#b45309" /> },
  { label: "Pending Deliveries", value: "142", trend: "-3%", up: false, icon: <Truck size={16} color="#be123c" /> },
  { label: "Active Farmers", value: "3,500+", trend: "+5%", up: true, icon: <ShieldCheck size={16} color="#15803d" /> },
  { label: "AI Diagnoses", value: "12,845", trend: "+22%", up: true, icon: <Stethoscope size={16} color="#0369a1" /> },
];

const ORDERS_STORAGE_KEY = "verdeversity_orders";

const mockTopProducts = [
  { name: "Heirloom Tomatoes", sales: "1,240", rev: "₱186K", stock: "In Stock", emoji: "🍅" },
  { name: "Premium Potting Mix", sales: "985", rev: "₱275K", stock: "Low Stock", emoji: "🪴" },
  { name: "Basil Grow Kit", sales: "842", rev: "₱294K", stock: "In Stock", emoji: "🌿" },
];

const mockVerifications = [
  { name: "Reyes Organic Farm", location: "Benguet", date: "2 hrs ago", type: "Commercial" },
  { name: "Isabella Cruz", location: "Quezon City", date: "5 hrs ago", type: "Micro-Vendor" },
  { name: "Green Valley Co.", location: "Davao", date: "1 day ago", type: "Commercial" },
];

const mockUsers = [
  { id: "USR-001", name: "Maria Clara", email: "maria@example.com", role: "Customer", lastLogin: "10 mins ago", status: "Online" },
  { id: "USR-002", name: "Juan Dela Cruz", email: "juan@example.com", role: "Farmer", lastLogin: "1 hour ago", status: "Offline" },
  { id: "USR-003", name: "Healthy Eats Cafe", email: "contact@healthyeats.com", role: "B2B Buyer", lastLogin: "2 hours ago", status: "Offline" },
  { id: "USR-004", name: "Urban Roots", email: "hello@urbanroots.ph", role: "Customer", lastLogin: "Just now", status: "Online" },
  { id: "USR-005", name: "Reyes Organic Farm", email: "admin@reyesorganic.com", role: "Farmer", lastLogin: "5 mins ago", status: "Online" },
];

const mockActivityFeed = [
  { text: "New commercial farm registered from Benguet.", time: "10 mins ago", color: "#16a34a" },
  { text: "High volume of AI diagnoses detected for 'Tomato Blight'.", time: "1 hr ago", color: "#eab308" },
  { text: "LGU Partnership completed for Baguio City.", time: "3 hrs ago", color: "#0284c7" },
  { text: "Payouts successfully disbursed to 450 micro-vendors.", time: "5 hrs ago", color: "#8b5cf6" },
];

const mockDeliveryStats = [
  { label: "Total Deliveries", value: "124", trend: "+12%", up: true, icon: <Truck size={16} color="#0284c7" /> },
  { label: "Out for Delivery", value: "18", trend: "+5%", up: true, icon: <Navigation size={16} color="#f59e0b" /> },
  { label: "Delivered Today", value: "92", trend: "+8%", up: true, icon: <CheckCircle size={16} color="#16a34a" /> },
  { label: "Delayed Orders", value: "4", trend: "-2%", up: false, icon: <AlertCircle size={16} color="#dc2626" /> },
  { label: "Active Riders", value: "24", trend: "+10%", up: true, icon: <UserCheck size={16} color="#8b5cf6" /> },
  { label: "Avg Time", value: "35m", trend: "-5m", up: true, icon: <Clock size={16} color="#0d9488" /> },
];

const mockDeliveriesList = [
  { id: "TRK-001", orderId: "ORD-9823", customer: "Maria Clara", rider: "Mike T.", status: "Out for Delivery", eta: "10 mins", type: "Eco-Bike", distance: "2.5 km" },
  { id: "TRK-002", orderId: "ORD-9822", customer: "Juan Dela Cruz", rider: "Sarah L.", status: "In Transit", eta: "25 mins", type: "EV-Van", distance: "5.1 km" },
  { id: "TRK-003", orderId: "ORD-9821", customer: "Healthy Eats", rider: "Unassigned", status: "Pending Pickup", eta: "N/A", type: "Standard", distance: "1.2 km" },
  { id: "TRK-004", orderId: "ORD-9820", customer: "Urban Roots", rider: "John D.", status: "Delivered", eta: "Delivered", type: "Eco-Bike", distance: "3.8 km" },
  { id: "TRK-005", orderId: "ORD-9819", customer: "Green Valley", rider: "Alex R.", status: "Delayed", eta: "45 mins", type: "EV-Van", distance: "8.4 km" },
];

const mockRiders = [
  { name: "Mike T.", status: "On Delivery", rating: 4.9, deliveries: 1245 },
  { name: "Sarah L.", status: "Available", rating: 4.8, deliveries: 890 },
  { name: "John D.", status: "Offline", rating: 4.7, deliveries: 654 },
];

const riderNotificationStatuses = [
  "Preparing Order",
  "Packing Items",
  "Ready for Pickup",
  "Picked Up by Rider",
  "In Transit",
  "Out for Delivery",
  "Delivered"
];

const ecoPrimaryButtonStyle = {
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
  color: "#062018",
  boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
  backdropFilter: "blur(18px) saturate(165%)",
  WebkitBackdropFilter: "blur(18px) saturate(165%)",
};

const ecoPrimaryInnerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  borderRadius: "inherit",
  background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), linear-gradient(135deg, rgba(134,239,172,0.36), rgba(125,211,252,0.32))",
  backdropFilter: "blur(34px) saturate(185%)",
  WebkitBackdropFilter: "blur(34px) saturate(185%)",
};

const ecoGlassPanelStyle = {
  background: "linear-gradient(150deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))",
  border: "1px solid rgba(255,255,255,0.78)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 34px rgba(22,163,74,0.08)",
  backdropFilter: "blur(18px) saturate(165%)",
  WebkitBackdropFilter: "blur(18px) saturate(165%)",
};

const ecoGlassInputStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(134,239,172,0.42)",
  background: "rgba(255,255,255,0.72)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 18px rgba(15,23,42,0.04)",
  color: "#062018",
  fontSize: "13px",
  fontWeight: 700,
};

const AdminEcoDropdown = ({ value, options, onChange, placeholder, compact = false, align = "left" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: "100%",
          padding: compact ? "9px 12px" : "12px 14px",
          borderRadius: compact ? "12px" : "14px",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.8)",
          fontSize: compact ? "12px" : "13px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          color: "#062018",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          fontFamily: "inherit",
          textAlign: "left",
          boxSizing: "border-box"
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption?.label || placeholder || "Select option"}
        </span>
        <svg
          width={compact ? "12" : "14"}
          height={compact ? "12" : "14"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            [align === "right" ? "right" : "left"]: 0,
            marginTop: compact ? "4px" : "8px",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: compact ? "12px" : "16px",
            padding: compact ? "6px" : "8px",
            display: "flex",
            flexDirection: "column",
            gap: compact ? "2px" : "4px",
            minWidth: "100%",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            zIndex: 120
          }}
        >
          {options.map(option => {
            const isSelected = value === option.value;
            const isHovered = hoveredOption === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHoveredOption(option.value)}
                onMouseLeave={() => setHoveredOption(null)}
                style={{
                  padding: compact ? "8px 12px" : "10px 14px",
                  borderRadius: compact ? "8px" : "10px",
                  background: isSelected ? "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))" : isHovered ? "linear-gradient(135deg, rgba(134,239,172,0.12), rgba(125,211,252,0.12))" : "transparent",
                  border: isSelected ? "1px solid rgba(134,239,172,0.4)" : "1px solid transparent",
                  color: isSelected || isHovered ? "#064e3b" : "#000",
                  fontSize: compact ? "12px" : "13px",
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected ? "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : isHovered ? "0 4px 12px rgba(34,197,94,0.08)" : "none",
                  backdropFilter: isSelected ? "blur(12px) saturate(180%)" : "none",
                  WebkitBackdropFilter: isSelected ? "blur(12px) saturate(180%)" : "none",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap"
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const mockPaymentStats = [
  { label: "Total Revenue", value: "₱124,500", trend: "+18%", up: true, icon: <CreditCard size={16} color="#15803d" /> },
  { label: "Successful", value: "98", trend: "+5%", up: true, icon: <CheckCircle size={16} color="#0284c7" /> },
  { label: "Pending", value: "12", trend: "-2%", up: false, icon: <Clock size={16} color="#eab308" /> },
  { label: "Refunds", value: "3", trend: "+1%", up: false, icon: <RefreshCcw size={16} color="#dc2626" /> },
];

const mockTransactions = [
  { id: "TXN-001", orderId: "ORD-9823", customer: "Maria Clara", method: "GCash", amount: "₱1,250", status: "Paid", date: "May 28, 2026, 10:30 AM", refNo: "8291038471" },
  { id: "TXN-002", orderId: "ORD-9822", customer: "Juan Dela Cruz", method: "Cash on Delivery", amount: "₱850", status: "Pending", date: "May 28, 2026, 11:15 AM", refNo: "N/A" },
  { id: "TXN-003", orderId: "ORD-9821", customer: "Healthy Eats", method: "Credit Card", amount: "₱5,400", status: "Paid", date: "May 27, 2026, 2:45 PM", refNo: "CH-992817" },
  { id: "TXN-004", orderId: "ORD-9820", customer: "Urban Roots", method: "Maya", amount: "₱3,200", status: "Refunded", date: "May 27, 2026, 4:20 PM", refNo: "MY-112349" },
  { id: "TXN-005", orderId: "ORD-9819", customer: "Green Valley", method: "Bank Transfer", amount: "₱12,000", status: "Failed", date: "May 26, 2026, 9:00 AM", refNo: "BT-88219" },
];

const mockSubscriptionStats = [
  { label: "Total Subscribers", value: "1,245", trend: "+12%", up: true, icon: <Users size={16} color="#0284c7" /> },
  { label: "Monthly Revenue", value: "₱58,400", trend: "+8%", up: true, icon: <CreditCard size={16} color="#15803d" /> },
  { label: "Renewal Rate", value: "82%", trend: "+5%", up: true, icon: <Repeat size={16} color="#8b5cf6" /> },
  { label: "Active Pro Users", value: "148", trend: "+15%", up: true, icon: <Crown size={16} color="#f59e0b" /> },
];

const mockPlans = [
  { name: "Basic", price: "Free", users: "850", revenue: "₱0", features: ["Limited AI Scans", "Community Access", "Marketplace Buying"], color: "#64748b", bg: "rgba(100,116,139,0.05)" },
  { name: "Pro", price: "₱499/mo", users: "345", revenue: "₱172K", features: ["Unlimited AI Doctor", "Advanced Analytics", "Priority Support"], color: "#f59e0b", bg: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))" },
  { name: "Enterprise", price: "Custom", users: "50", revenue: "₱450K", features: ["LGU Dashboard", "API Integration", "Team Accounts"], color: "#0ea5e9", bg: "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.05))" },
];

const mockSubscribers = [
  { id: "SUB-001", user: "Maria Clara", email: "maria@example.com", plan: "Pro", status: "Active", renewal: "Jun 15, 2026", payment: "GCash", joined: "Jan 10, 2026", aiScans: 85, aiLimit: 100 },
  { id: "SUB-002", user: "Juan Dela Cruz", email: "juan@example.com", plan: "Basic", status: "Active", renewal: "N/A", payment: "Free", joined: "Feb 05, 2026", aiScans: 8, aiLimit: 10 },
  { id: "SUB-003", user: "Healthy Eats Cafe", email: "contact@healthyeats.com", plan: "Enterprise", status: "Active", renewal: "Dec 01, 2026", payment: "Bank Transfer", joined: "Dec 01, 2025", aiScans: 1250, aiLimit: 5000 },
  { id: "SUB-004", user: "Urban Roots", email: "hello@urbanroots.ph", plan: "Pro", status: "Pending Renewal", renewal: "May 30, 2026", payment: "Credit Card", joined: "May 30, 2025", aiScans: 100, aiLimit: 100 },
  { id: "SUB-005", user: "Reyes Organic", email: "admin@reyesorganic.com", plan: "Pro", status: "Cancelled", renewal: "May 15, 2026", payment: "Maya", joined: "Oct 12, 2025", aiScans: 20, aiLimit: 100 },
];

const subscriptionPlanOptions = [
  { value: "Basic", label: "Basic" },
  { value: "Pro", label: "Pro" },
  { value: "Enterprise", label: "Enterprise" },
];

const subscriptionStatusOptions = [
  { value: "Active", label: "Active" },
  { value: "Pending Renewal", label: "Pending Renewal" },
  { value: "Cancelled", label: "Cancelled" },
];

const subscriptionPaymentOptions = [
  { value: "Free", label: "Free" },
  { value: "GCash", label: "GCash" },
  { value: "Maya", label: "Maya" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

const subscriptionRenewalOptions = [
  { value: "N/A", label: "No Renewal" },
  { value: "Jun 15, 2026", label: "Jun 15, 2026" },
  { value: "Jul 01, 2026", label: "Jul 01, 2026" },
  { value: "Dec 01, 2026", label: "Dec 01, 2026" },
];

const subscriberAudienceOptions = [
  { value: "subscriber", label: "Selected Subscriber Only" },
  { value: "all", label: "All Users" },
  { value: "basic", label: "Basic Plan Users" },
  { value: "pro", label: "Pro Users Only" },
  { value: "enterprise", label: "Enterprise Users Only" },
];

const subscriberCampaignTypeOptions = [
  { value: "maintenance", label: "Maintenance Announcement" },
  { value: "promo", label: "Promo Discount" },
  { value: "feature", label: "New Feature Update" },
  { value: "event", label: "Event Invitation" },
  { value: "renewal", label: "Subscription Reminder" },
  { value: "failed-payment", label: "Failed Payment Alert" },
];

const subscriberDeliveryOptions = [
  { value: "push", label: "In-App Push" },
  { value: "email", label: "Email" },
  { value: "both", label: "Push + Email" },
];

const subscriberScheduleOptions = [
  { value: "now", label: "Send Now" },
  { value: "later", label: "Schedule for Later" },
];

const mockEventStats = [
  { label: "Total Events", value: "48", trend: "+4", up: true, icon: <CalendarDays size={16} color="#0284c7" /> },
  { label: "Total Attendees", value: "8,420", trend: "+12%", up: true, icon: <Users size={16} color="#15803d" /> },
  { label: "Upcoming Workshops", value: "12", trend: "+2", up: true, icon: <Ticket size={16} color="#f59e0b" /> },
  { label: "Event Revenue", value: "₱145K", trend: "+18%", up: true, icon: <CreditCard size={16} color="#8b5cf6" /> },
];

const mockEventsList = [
  { id: "EVT-001", title: "Urban Hydroponics Masterclass", date: "Jun 15, 2026", time: "09:00 AM", type: "Workshop", attendees: 45, maxAttendees: 50, status: "Upcoming", price: "₱1,200", location: "Baguio City Hall" },
  { id: "EVT-002", title: "Sustainable Pest Management", date: "Jul 10, 2026", time: "02:00 PM", type: "Webinar", attendees: 120, maxAttendees: 500, status: "Upcoming", price: "Free", location: "Online (Zoom)" },
  { id: "EVT-003", title: "Seed Exchange & Planting Day", date: "Aug 05, 2026", time: "04:00 PM", type: "Community", attendees: 85, maxAttendees: 100, status: "Upcoming", price: "Free", location: "Local Garden" },
  { id: "EVT-004", title: "Farm-to-Table Cooking", date: "May 20, 2026", time: "10:00 AM", type: "Workshop", attendees: 30, maxAttendees: 30, status: "Completed", price: "₱2,500", location: "VerdeVersity Center" },
  { id: "EVT-005", title: "Advanced Soil Health", date: "May 10, 2026", time: "07:00 PM", type: "Webinar", attendees: 250, maxAttendees: 300, status: "Completed", price: "Free", location: "Online" },
];

const mockAIStats = [
  { label: "Total AI Scans", value: "12,450", trend: "+18%", up: true, icon: <Scan size={16} color="#0284c7" /> },
  { label: "AI Accuracy Rate", value: "98.4%", trend: "+1.2%", up: true, icon: <Target size={16} color="#16a34a" /> },
  { label: "Diseases Detected", value: "3,248", trend: "-5%", up: false, icon: <Bug size={16} color="#eab308" /> },
  { label: "Reports Generated", value: "2,400", trend: "+22%", up: true, icon: <FileText size={16} color="#8b5cf6" /> },
];

const mockScansList = [
  { id: "SCN-8821", plant: "Tomato", disease: "Early Blight", confidence: "94%", user: "Maria Clara", status: "Critical", date: "May 28, 2026", recommendation: "Apply copper-based fungicide and remove affected lower leaves to prevent spore spread." },
  { id: "SCN-8820", plant: "Lettuce", disease: "None", confidence: "99%", user: "Urban Roots", status: "Healthy", date: "May 28, 2026", recommendation: "Plant is healthy. Continue current watering and nutrient schedule." },
  { id: "SCN-8819", plant: "Mango", disease: "Anthracnose", confidence: "87%", user: "Juan Dela Cruz", status: "Disease Detected", date: "May 27, 2026", recommendation: "Prune infected branches and apply organic fungicide during dry weather." },
  { id: "SCN-8818", plant: "Banana", disease: "Stem Weevil", confidence: "76%", user: "Green Valley", status: "Under Review", date: "May 27, 2026", recommendation: "Requires agronomist confirmation. Temporarily isolate affected crops." },
  { id: "SCN-8817", plant: "Eggplant", disease: "Downy Mildew", confidence: "91%", user: "Healthy Eats", status: "Resolved", date: "May 26, 2026", recommendation: "Previous treatment successful. Monitor for 7 more days." },
];

const mockDiseaseDatabase = [
  { name: "Early Blight", crop: "Tomato, Potato", severity: "High" },
  { name: "Downy Mildew", crop: "Eggplant, Cucumber", severity: "Medium" },
  { name: "Anthracnose", crop: "Mango, Papaya", severity: "High" },
  { name: "Powdery Mildew", crop: "Squash, Melon", severity: "Medium" },
];

const mockAnalyticsStats = [
  { label: "Total Revenue", value: "₱245,000", trend: "+18%", up: true, icon: <CreditCard size={16} color="#15803d" /> },
  { label: "Active Users", value: "4,200", trend: "+12%", up: true, icon: <Users size={16} color="#0284c7" /> },
  { label: "AI Diagnoses", value: "12,400", trend: "+24%", up: true, icon: <Scan size={16} color="#8b5cf6" /> },
  { label: "CO₂ Reduced", value: "3.2 Tons", trend: "+8%", up: true, icon: <Leaf size={16} color="#16a34a" /> },
];

const mockAIInsights = [
  { text: "Orders increased 18% this month, primarily from Metro Manila.", type: "positive", color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  { text: "Palawan has the highest AI scan activity this week.", type: "neutral", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  { text: "High disease outbreak ('Tomato Blight') detected in Region IV-B.", type: "warning", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  { text: "Organic Edibles generated the most revenue in the past 30 days.", type: "positive", color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
];

const mockRegionalData = [
  { region: "Metro Manila", pct: "45%", color: "#0ea5e9" },
  { region: "Cordillera (CAR)", pct: "25%", color: "#16a34a" },
  { region: "Central Visayas", pct: "15%", color: "#f59e0b" },
  { region: "Davao Region", pct: "10%", color: "#8b5cf6" },
  { region: "Others", pct: "5%", color: "#64748b" },
];

const mockContentStats = [
  { label: "Total Articles", value: "245", trend: "+12", up: true, icon: <FileText size={16} color="#0284c7" /> },
  { label: "Total Views", value: "18.4K", trend: "+15%", up: true, icon: <Eye size={16} color="#15803d" /> },
  { label: "Active Listings", value: "120", trend: "+5", up: true, icon: <ShoppingCart size={16} color="#f59e0b" /> },
  { label: "Announcements", value: "45", trend: "+2", up: true, icon: <Megaphone size={16} color="#8b5cf6" /> },
];

const mockContentList = [
  { id: "CNT-001", title: "10 Benefits of Urban Farming", type: "Article", status: "Published", date: "May 28, 2026", author: "Admin" },
  { id: "CNT-002", title: "Summer Workshop Registration", type: "Page", status: "Draft", date: "May 27, 2026", author: "Editor" },
  { id: "CNT-003", title: "Platform Maintenance Notice", type: "Announcement", status: "Scheduled", date: "May 26, 2026", author: "Admin" },
  { id: "CNT-004", title: "How to use the AI Plant Doctor", type: "Tutorial", status: "Published", date: "May 25, 2026", author: "Admin" },
  { id: "CNT-005", title: "Homepage Hero Banner", type: "Component", status: "Published", date: "May 24, 2026", author: "Designer" },
];

const mockSettingsStats = [
  { label: "System Status", value: "Online", trend: "99.9% Uptime", up: true, icon: <Activity size={16} color="#15803d" /> },
  { label: "Active Admins", value: "5", trend: "Secure", up: true, icon: <ShieldCheck size={16} color="#0284c7" /> },
  { label: "Database Load", value: "42%", trend: "Healthy", up: true, icon: <Database size={16} color="#f59e0b" /> },
  { label: "API Health", value: "Stable", trend: "< 200ms ping", up: true, icon: <Globe size={16} color="#8b5cf6" /> },
];

export default function AdminPortal({ setActiveNav, handleLogout, products, setProducts, harvests, setHarvests, promoCodes, setPromoCodes, orders, setOrders }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [hoveredStat, setHoveredStat] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editableOrderDetails, setEditableOrderDetails] = useState(null);
  const [isEditingOrderDetails, setIsEditingOrderDetails] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliverySearchTerm, setDeliverySearchTerm] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("All");
  const [deliveriesList, setDeliveriesList] = useState(mockDeliveriesList);
  const [editableDelivery, setEditableDelivery] = useState(null);
  const [editingDeliveryId, setEditingDeliveryId] = useState(null);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");
  const [isRiderChatOpen, setIsRiderChatOpen] = useState(false);
  const [riderChatInput, setRiderChatInput] = useState("");
  const [riderChatMessages, setRiderChatMessages] = useState([
    { sender: "rider", text: "Rider app connected. Send delivery instructions here.", time: "Just now" }
  ]);
  const riderChatBottomRef = useRef(null);

  const [selectedPaymentTxn, setSelectedPaymentTxn] = useState(null);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");

  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [subscribersList, setSubscribersList] = useState(mockSubscribers);
  const [editableSubscriber, setEditableSubscriber] = useState(null);
  const [subscriberCampaignForm, setSubscriberCampaignForm] = useState({
    audience: "subscriber",
    type: "maintenance",
    delivery: "push",
    schedule: "now",
    title: "",
    message: ""
  });
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [subPlanFilter, setSubPlanFilter] = useState("All");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const [eventsList, setEventsList] = useState(mockEventsList);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState(null);

  const [selectedScan, setSelectedScan] = useState(null);
  const [scanSearchTerm, setScanSearchTerm] = useState("");
  const [scanStatusFilter, setScanStatusFilter] = useState("All");

  const [contentSearchTerm, setContentSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("All");
  const [aiPrompt, setAiPrompt] = useState("");

  const [editingHarvest, setEditingHarvest] = useState(null);
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [harvestCategoryFilter, setHarvestCategoryFilter] = useState("All");
  const [harvestToDelete, setHarvestToDelete] = useState(null);

  const [activeSettingsTab, setActiveSettingsTab] = useState("General");

  const [editingPromo, setEditingPromo] = useState(null);
  
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState([
    { id: 1, title: "New Enterprise Request", message: "Healthy Eats Cafe requested Enterprise plan.", time: "10 mins ago", type: "info", unread: true },
    { id: 2, title: "Server Load High", message: "Database usage spiked to 85%.", time: "1 hr ago", type: "warning", unread: true },
    { id: 3, title: "Payment Failed", message: "Transaction TXN-005 failed.", time: "2 hrs ago", type: "error", unread: false },
  ]);
  const unreadCount = adminNotifications.filter(n => n.unread).length;
  const [sendNotifForm, setSendNotifForm] = useState({ title: "", message: "", audience: "All", type: "Announcement" });

  const notifRef = useRef(null);
  const [simulatedRiderDelivery, setSimulatedRiderDelivery] = useState(null);

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct.name || !editingProduct.name.trim() || !editingProduct.price || editingProduct.price <= 0) {
      setToastMessage("Please provide a valid product name and a price greater than 0 before saving.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (editingProduct.isNew) {
      const productToSave = { ...editingProduct };
      delete productToSave.isNew;
      setProducts([productToSave, ...products]);
    } else {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    }
    setEditingProduct(null);
  };

  const handleManageOrder = (order) => {
    setSelectedOrder(order);
    setEditableOrderDetails({ ...order });
    setIsEditingOrderDetails(false);
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = () => {
    setProducts(products.filter(p => p.id !== productToDelete));
    setProductToDelete(null);
    setToastMessage("Product deleted.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddProduct = () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setEditingProduct({
      id: newId,
      name: "",
      category: "",
      price: 0,
      stockQuantity: 10,
      stock: "In Stock",
      emoji: "🌱",
      image: "/tomato.png",
      badge: "New",
      description: "A brand new sustainable product.",
      sustainabilityBadge: "Eco-Friendly",
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      isNew: true
    });
  };

  const handleEditOrder = (order) => {
    setEditingOrderId(order.id);
    setNewOrderStatus(order.status);
  };

  const handleSaveOrderStatus = (id) => {
    const order = (orders || []).find(o => o.id === id);
    setOrders((orders || []).map(o => o.id === id ? { ...o, status: newOrderStatus } : o));
    
    setDeliveriesList(prev => {
      if (newOrderStatus === "Pending Approval" || newOrderStatus === "Disapproved") {
        return prev.filter(d => d.orderId !== id);
      }

      const existingDelivery = prev.find(d => d.orderId === id);
      let deliveryStatus = "Pending Pickup";
      
      if (existingDelivery) {
        return prev.map(d => d.orderId === id ? { ...d, status: deliveryStatus } : d);
      } else if (order) {
        const newDelivery = {
          id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
          orderId: id, 
          customer: order.customer, 
          phone: order.phone,
          address: order.address,
          payment: order.payment,
          paymentStatus: order.paymentStatus || "Paid",
          instructions: order.instructions || "N/A",
          products: order.products || order.items,
          rider: "Unassigned", 
          status: deliveryStatus, 
          eta: "N/A", 
          type: "Standard", 
          distance: "TBD"
        };
        return [newDelivery, ...prev];
      }
      return prev;
    });

    setEditingOrderId(null);
    setToastMessage("Order status synced with deliveries.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefreshOrders = () => {
    try {
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!savedOrders) {
        setToastMessage("No saved orders to refresh.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const parsedOrders = JSON.parse(savedOrders);
      if (!Array.isArray(parsedOrders)) {
        throw new Error("Invalid orders payload");
      }

      setOrders(parsedOrders);
      setSelectedOrder(null);
      setEditingOrderId(null);
      setToastMessage("Orders refreshed.");
    } catch (error) {
      setToastMessage("Could not refresh orders.");
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveOrder = (order) => {
    setOrders((orders || []).map(o => o.id === order.id ? { ...o, status: "Approved" } : o));
    setDeliveriesList(prev => {
      const existingDelivery = prev.find(d => d.orderId === order.id);
      if (!existingDelivery) {
        const newDelivery = {
          id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
          orderId: order.id,
          customer: order.customer,
          phone: order.phone,
          address: order.address,
          payment: order.payment,
          paymentStatus: order.paymentStatus || "Paid",
          instructions: order.instructions || "N/A",
          products: order.products || order.items,
          rider: "Unassigned",
          status: "Pending Pickup",
          eta: "N/A",
          type: "Standard",
          distance: "TBD"
        };
        return [newDelivery, ...prev];
      } else {
        return prev.map(d => d.orderId === order.id ? { ...d, status: "Pending Pickup" } : d);
      }
    });
    setSelectedOrder(null);
    setToastMessage("Order approved and sent to Deliveries!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelOrder = (order) => {
    setOrders((orders || []).map(o => o.id === order.id ? { ...o, status: "Disapproved" } : o));
    setDeliveriesList(prev => prev.filter(d => d.orderId !== order.id));
    setSelectedOrder(null);
    setToastMessage("Order disapproved.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveDelivery = () => {
    setDeliveriesList(deliveriesList.map(d => d.id === editableDelivery.id ? {
      ...d,
      rider: editableDelivery.rider,
      eta: editableDelivery.eta,
      riderStatus: editableDelivery.riderStatus || "Preparing Order",
    } : d));
    setSelectedDelivery(prev => ({
      ...prev,
      rider: editableDelivery.rider,
      eta: editableDelivery.eta,
      riderStatus: editableDelivery.riderStatus || "Preparing Order",
    }));
    setToastMessage("Delivery details updated.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNotifyRider = () => {
    if (!editableDelivery || editableDelivery.rider === "Unassigned") {
      setToastMessage("Please assign a rider first before notifying.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const orderDetails = (orders || []).find(o => o.id === editableDelivery.orderId);
    setSimulatedRiderDelivery({
      ...editableDelivery,
      status: editableDelivery.riderStatus || "Preparing Order",
      orderStatus: editableDelivery.status,
      orderDetails
    });
    setToastMessage(`Notification sent to ${editableDelivery.rider}'s app!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendRiderChatMessage = (presetMessage) => {
    const messageText = (presetMessage || riderChatInput).trim();
    if (!messageText) return;

    setRiderChatMessages(prev => [
      ...prev,
      { sender: "admin", text: messageText, time: "Just now" }
    ]);
    if (!presetMessage) {
      setRiderChatInput("");
    }

    setTimeout(() => {
      setRiderChatMessages(prev => [
        ...prev,
        { sender: "rider", text: "Received, admin. I will follow this update.", time: "Just now" }
      ]);
    }, 900);
  };

  useEffect(() => {
    if (!isRiderChatOpen) return;
    riderChatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [riderChatMessages, isRiderChatOpen]);

  const updateRiderStatus = (newStatus) => {
    setSimulatedRiderDelivery(prev => ({ ...prev, status: newStatus }));
    setDeliveriesList(prev => prev.map(d => d.id === simulatedRiderDelivery.id ? { ...d, riderStatus: newStatus } : d));
    
    if (editableDelivery && editableDelivery.id === simulatedRiderDelivery.id) {
       setEditableDelivery(prev => ({ ...prev, riderStatus: newStatus }));
       if (selectedDelivery && selectedDelivery.id === simulatedRiderDelivery.id) {
           setSelectedDelivery(prev => ({ ...prev, riderStatus: newStatus }));
       }
    }
    setToastMessage(`Rider marked delivery as ${newStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditDeliveryInline = (delivery) => {
    setEditingDeliveryId(delivery.id);
    setNewDeliveryStatus(delivery.status);
  };

  const handleSaveDeliveryStatus = (id) => {
    const delivery = deliveriesList.find(d => d.id === id);
    setDeliveriesList(deliveriesList.map(d => d.id === id ? { ...d, status: newDeliveryStatus } : d));
    
    setEditingDeliveryId(null);
    setToastMessage("Delivery status updated.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenSubscriber = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setEditableSubscriber({ ...subscriber });
    setSubscriberCampaignForm({
      audience: "subscriber",
      type: "maintenance",
      delivery: "push",
      schedule: "now",
      title: "",
      message: ""
    });
  };

  const handleCloseSubscriber = () => {
    setSelectedSubscriber(null);
    setEditableSubscriber(null);
  };

  const handleSaveSubscriber = () => {
    if (!editableSubscriber) return;
    setSubscribersList(subscribersList.map(sub => sub.id === editableSubscriber.id ? editableSubscriber : sub));
    setSelectedSubscriber(editableSubscriber);
    setToastMessage("Subscription details updated.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDispatchSubscriberCampaign = () => {
    setToastMessage("Subscription campaign dispatched successfully!");
    setTimeout(() => setToastMessage(null), 3000);
    setSubscriberCampaignForm({
      audience: "subscriber",
      type: "maintenance",
      delivery: "push",
      schedule: "now",
      title: "",
      message: ""
    });
  };

  const filteredAdminHarvests = (harvests || []).filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(harvestSearchTerm.toLowerCase());
    const matchesCategory = harvestCategoryFilter === "All" || h.category === harvestCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEditHarvest = (harvest) => {
    setEditingHarvest({ ...harvest, monthsStr: harvest.months.join(", ") });
  };

  const handleSaveHarvest = () => {
    if (!editingHarvest.name || !editingHarvest.name.trim()) {
      setToastMessage("Please provide a valid crop name.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const harvestToSave = { 
      ...editingHarvest,
      months: editingHarvest.monthsStr ? editingHarvest.monthsStr.split(",").map(m => m.trim()) : []
    };
    delete harvestToSave.monthsStr;

    if (editingHarvest.isNew) {
      delete harvestToSave.isNew;
      setHarvests([harvestToSave, ...(harvests || [])]);
    } else {
      setHarvests((harvests || []).map(h => h.id === editingHarvest.id ? harvestToSave : h));
    }
    setEditingHarvest(null);
    setToastMessage("Seasonal harvest saved successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNewEvent = () => {
    const newId = `EVT-00${eventsList.length + 1}`;
    const newEvent = {
      id: newId,
      title: "",
      date: "",
      time: "",
      type: "Workshop",
      attendees: 0,
      maxAttendees: 50,
      status: "Upcoming",
      price: "Free",
      location: "",
      isNew: true
    };
    setEditableEvent(newEvent);
    setSelectedEvent(newEvent);
    setIsEditingEvent(true);
  };

  const handleGenerateCertificates = () => {
    setToastMessage("Generating certificates...");
    setTimeout(() => {
      const certText = "CERTIFICATE OF COMPLETION\n\nThis is to certify that the attendees have successfully completed their respective events and workshops.\n\nGenerated by EcoEquity Admin Portal\nDate: " + new Date().toLocaleDateString();
      const element = document.createElement("a");
      const file = new Blob([certText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "Batch_Certificates.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setToastMessage("Certificates generated and downloaded!");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const handleExportAttendees = () => {
    setToastMessage("Exporting attendee list...");
    setTimeout(() => {
      const csvContent = "Event ID,Title,Date,Attendees,Max Attendees,Status\n" + eventsList.map(e => `${e.id},"${e.title}",${e.date},${e.attendees},${e.maxAttendees},${e.status}`).join("\n");
      const element = document.createElement("a");
      const file = new Blob([csvContent], {type: 'text/csv'});
      element.href = URL.createObjectURL(file);
      element.download = "Attendee_List.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setToastMessage("Attendee list exported as CSV.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const handleSaveEvent = () => {
    if (!editableEvent.title || !editableEvent.title.trim()) {
      setToastMessage("Please provide a valid event title.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const eventToSave = { ...editableEvent };
    let updatedEvents;
    
    if (editableEvent.isNew) {
      delete eventToSave.isNew;
      updatedEvents = [eventToSave, ...eventsList];
    } else {
      updatedEvents = eventsList.map(e => e.id === editableEvent.id ? eventToSave : e);
    }
    
    setEventsList(updatedEvents);
    setSelectedEvent(eventToSave);
    setIsEditingEvent(false);
    setToastMessage("Event saved successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteHarvest = (id) => {
    setHarvestToDelete(id);
  };

  const confirmDeleteHarvest = () => {
    setHarvests((harvests || []).filter(h => h.id !== harvestToDelete));
    setHarvestToDelete(null);
    setToastMessage("Crop deleted.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddHarvest = () => {
    const newId = (harvests || []).length > 0 ? Math.max(...(harvests || []).map(h => h.id)) + 1 : 1;
    setEditingHarvest({
      id: newId,
      name: "",
      category: "Vegetables",
      monthsStr: "",
      peak: "",
      icon: "🌱",
      estDate: "",
      location: "",
      region: "",
      countdown: "",
      weather: "",
      risk: "Low",
      demand: "Medium Demand",
      priceTrend: "",
      plantingMonth: "",
      yield: "Medium",
      water: "Medium",
      soil: "",
      temp: "",
      pestRisk: "Low",
      suppliers: 0,
      restaurantMatches: 0,
      growthProgress: 0,
      isNew: true
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsAdminNotifOpen(false);
      }
    };
    if (isAdminNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdminNotifOpen]);

  const handleSavePromo = () => {
    if (!editingPromo.code || !editingPromo.code.trim()) {
      setToastMessage("Please provide a valid promo code.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (editingPromo.isNew) {
      const promoToSave = { ...editingPromo, id: Date.now(), uses: 0 };
      delete promoToSave.isNew;
      setPromoCodes([promoToSave, ...(promoCodes || [])]);
    } else {
      setPromoCodes((promoCodes || []).map(p => p.id === editingPromo.id ? editingPromo : p));
    }
    setEditingPromo(null);
    setToastMessage("Promo saved successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Users", icon: Users },
    { name: "Farmers Verification", icon: ShieldCheck },
    { name: "Products", icon: Box },
    { name: "Orders", icon: ShoppingCart },
    { name: "Deliveries", icon: Truck },
    { name: "Delivered Reports", icon: CheckCircle },
    { name: "Payments", icon: CreditCard },
    { name: "Subscriptions", icon: Repeat },
    { name: "Events & Workshops", icon: CalendarDays },
    { name: "Seasonal Harvests", icon: Wheat },
    { name: "AI Plant Doctor", icon: Stethoscope },
    { name: "Reports & Analytics", icon: BarChart2 },
    { name: "Content Management", icon: FileText },
    { name: "Settings", icon: Settings },
  ];

  const filteredOrdersList = (orders || []).filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;
    const isVisible = order.status === "Pending Approval" || order.status === "Disapproved";
    return matchesSearch && matchesStatus && isVisible;
  });

  const todayLabel = new Date().toDateString();
  const revenueToday = (orders || []).reduce((sum, order) => {
    const orderDate = order.date ? new Date(order.date).toDateString() : "";
    return orderDate === todayLabel ? sum + (Number(order.total) || 0) : sum;
  }, 0);
  const pendingOrdersCount = (orders || []).filter(order => order.status === "Pending Approval").length;
  const deliveredOrdersCount = (orders || []).filter(order => order.status === "Delivered").length;

  const filteredDeliveriesList = deliveriesList.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(deliverySearchTerm.toLowerCase()) || 
                          delivery.customer.toLowerCase().includes(deliverySearchTerm.toLowerCase());
    const matchesStatus = deliveryStatusFilter === "All" || delivery.status === deliveryStatusFilter;
    const isActiveDelivery = delivery.status !== "Delivered";
    return matchesSearch && matchesStatus && isActiveDelivery;
  });

  const deliveredReportsList = deliveriesList.filter(delivery => delivery.status === "Delivered");

  const filteredTransactionsList = mockTransactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                          txn.customer.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    const matchesStatus = paymentStatusFilter === "All" || txn.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = subscribersList.filter(sub => {
    const matchesSearch = sub.user.toLowerCase().includes(subSearchTerm.toLowerCase()) || 
                          sub.id.toLowerCase().includes(subSearchTerm.toLowerCase());
    const matchesPlan = subPlanFilter === "All" || sub.plan === subPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredEventsList = eventsList.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(eventSearchTerm.toLowerCase()) || 
                          ev.id.toLowerCase().includes(eventSearchTerm.toLowerCase());
    const matchesType = eventTypeFilter === "All" || ev.type === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredScansList = mockScansList.filter(scan => {
    const matchesSearch = scan.plant.toLowerCase().includes(scanSearchTerm.toLowerCase()) || 
                          scan.disease.toLowerCase().includes(scanSearchTerm.toLowerCase()) ||
                          scan.user.toLowerCase().includes(scanSearchTerm.toLowerCase());
    const matchesStatus = scanStatusFilter === "All" || scan.status === scanStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContentList = mockContentList.filter(cnt => {
    const matchesSearch = cnt.title.toLowerCase().includes(contentSearchTerm.toLowerCase()) || 
                          cnt.id.toLowerCase().includes(contentSearchTerm.toLowerCase());
    const matchesType = contentTypeFilter === "All" || cnt.type === contentTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredAdminProducts = products.filter(p => 
    productCategoryFilter === "All" || p.category === productCategoryFilter
  );

  const getStatusStyle = (status) => {
    if (status === "Pending Approval") return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
    if (status === "Approved") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (status === "Delivered") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Processing") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (status === "Packed") return { background: "rgba(139,92,246,0.1)", color: "#8b5cf6" };
    if (status === "Shipped") return { background: "rgba(59,130,246,0.1)", color: "#3b82f6" };
    if (status === "Out for Delivery" || status === "In Transit") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Cancelled" || status === "Delayed" || status === "Disapproved") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    if (status === "Pending Pickup") return { background: "rgba(107,114,128,0.1)", color: "#4b5563" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getPaymentStatusStyle = (status) => {
    if (status === "Paid") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Pending") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Failed") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    if (status === "Refunded") return { background: "rgba(107,114,128,0.1)", color: "#4b5563" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getSubStatusStyle = (status) => {
    if (status === "Active") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Trial") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (status === "Pending Renewal") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Cancelled" || status === "Expired") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getEventStatusStyle = (status) => {
    if (status === "Upcoming") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (status === "Ongoing") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Completed") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Cancelled") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getScanStatusStyle = (status) => {
    if (status === "Healthy" || status === "Resolved") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Disease Detected") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Critical") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    if (status === "Under Review") return { background: "rgba(139,92,246,0.1)", color: "#8b5cf6" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getContentStatusStyle = (status) => {
    if (status === "Published") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Draft") return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
    if (status === "Scheduled") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes scanLine {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes warningPulse {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6); }
            70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
          }
          @keyframes pulseBadge {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
      {toastMessage && (
        <div style={styles.toast}>
          <AlertCircle size={16} />
          {toastMessage}
        </div>
      )}
      {productToDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(225, 29, 72, 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
              <Trash2 size={24} color="#e11d48" />
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Delete Product?</h3>
            <p style={{ margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button 
                onClick={() => setProductToDelete(null)} 
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
              >Cancel</button>
              <button 
                onClick={confirmDeleteProduct} 
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(225, 29, 72, 0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(225, 29, 72, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.3)'; }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {harvestToDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(225, 29, 72, 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
              <Trash2 size={24} color="#e11d48" />
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Delete Crop?</h3>
            <p style={{ margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Are you sure you want to delete this crop? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button 
                onClick={() => setHarvestToDelete(null)} 
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
              >Cancel</button>
              <button 
                onClick={confirmDeleteHarvest} 
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(225, 29, 72, 0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(225, 29, 72, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.3)'; }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800 }}>Order {selectedOrder.id}</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                 <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(selectedOrder.status) }}>{selectedOrder.status}</span>
                 <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{selectedOrder.date}</span>
               </div>
               {!isEditingOrderDetails && selectedOrder.status === "Pending Approval" && (
                 <button onClick={() => setIsEditingOrderDetails(true)} style={{ background: "rgba(14,165,233,0.1)", border: "none", color: "#0ea5e9", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><Edit2 size={12}/> Edit Details</button>
               )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Customer Info</h4>
                 {isEditingOrderDetails ? (
                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                     <input type="text" value={editableOrderDetails.customer} onChange={e => setEditableOrderDetails({...editableOrderDetails, customer: e.target.value})} style={styles.editInput} placeholder="Customer Name" />
                     <input type="text" value={editableOrderDetails.phone} onChange={e => setEditableOrderDetails({...editableOrderDetails, phone: e.target.value})} style={styles.editInput} placeholder="Phone Number" />
                     <input type="text" value={editableOrderDetails.email} onChange={e => setEditableOrderDetails({...editableOrderDetails, email: e.target.value})} style={styles.editInput} placeholder="Email" />
                     <textarea value={editableOrderDetails.address} onChange={e => setEditableOrderDetails({...editableOrderDetails, address: e.target.value})} style={{...styles.editInput, resize: "vertical"}} placeholder="Address" rows={2} />
                     <textarea value={editableOrderDetails.instructions} onChange={e => setEditableOrderDetails({...editableOrderDetails, instructions: e.target.value})} style={{...styles.editInput, resize: "vertical"}} placeholder="Delivery Instructions" rows={2} />
                   </div>
                 ) : (
                   <>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><Users size={14} color="#15803d" /> {selectedOrder.customer}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px" }}><Phone size={14} color="#15803d" /> {selectedOrder.phone}</div>
                     {selectedOrder.email && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px" }}><FileText size={14} color="#15803d" /> {selectedOrder.email}</div>}
                     <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.4 }}><MapPin size={14} color="#15803d" style={{ flexShrink: 0, marginTop: "2px" }} /> {selectedOrder.address}</div>
                     {selectedOrder.instructions && <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.4, marginTop: "8px", color: "#d97706", padding: "8px", background: "rgba(245,158,11,0.1)", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.2)" }}><MessageSquare size={14} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} /> Note: {selectedOrder.instructions}</div>}
                   </>
                 )}
               </div>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Order Details</h4>
                 {isEditingOrderDetails ? (
                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                     <input type="text" value={editableOrderDetails.amount || `₱${editableOrderDetails.total?.toFixed(2)}`} onChange={e => setEditableOrderDetails({...editableOrderDetails, amount: e.target.value})} style={styles.editInput} placeholder="Amount (e.g. ₱2,100)" />
                     <select value={editableOrderDetails.payment} onChange={e => setEditableOrderDetails({...editableOrderDetails, payment: e.target.value})} style={styles.editInput}>
                       <option value="Credit Card">Credit Card</option>
                       <option value="GCash">GCash</option>
                       <option value="Maya">Maya</option>
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Cash on Delivery">Cash on Delivery</option>
                     </select>
                     <select value={editableOrderDetails.paymentStatus} onChange={e => setEditableOrderDetails({...editableOrderDetails, paymentStatus: e.target.value})} style={styles.editInput}>
                       <option value="Paid">Paid</option>
                       <option value="Pending">Pending</option>
                     </select>
                     <textarea value={editableOrderDetails.products || editableOrderDetails.items} onChange={e => setEditableOrderDetails({...editableOrderDetails, products: e.target.value})} style={{...styles.editInput, resize: "vertical"}} placeholder="Products" rows={3} />
                   </div>
                 ) : (
                   <>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 700 }}><CreditCard size={14} color="#15803d" /> {selectedOrder.amount || `₱${selectedOrder.total?.toFixed(2)}`} ({selectedOrder.payment}) <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10px", background: selectedOrder.paymentStatus === "Paid" ? "rgba(22,163,74,0.1)" : "rgba(245,158,11,0.1)", color: selectedOrder.paymentStatus === "Paid" ? "#16a34a" : "#d97706" }}>{selectedOrder.paymentStatus || "Pending"}</span></div>
                     <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px", fontSize: "13px", lineHeight: 1.4 }}><Package size={14} color="#15803d" style={{ flexShrink: 0, marginTop: "2px" }} /> {selectedOrder.products || selectedOrder.items}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><Truck size={14} color="#15803d" /> Rider: {selectedOrder.rider}</div>
                   </>
                 )}
               </div>
            </div>

            {isEditingOrderDetails ? (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => {
                  setOrders((orders || []).map(o => o.id === editableOrderDetails.id ? editableOrderDetails : o));
                  setSelectedOrder(editableOrderDetails);
                  setIsEditingOrderDetails(false);
                  setToastMessage("Order details updated.");
                  setTimeout(() => setToastMessage(null), 3000);
                }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}><Save size={16}/> Save Details</button>
                <button onClick={() => setIsEditingOrderDetails(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Cancel</button>
              </div>
            ) : selectedOrder.status === "Pending Approval" ? (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => handleApproveOrder(selectedOrder)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}><CheckCircle size={16}/> Approve Order</button>
                <button onClick={() => handleCancelOrder(selectedOrder)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Disapprove Order</button>
              </div>
            ) : null}

            <button onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 20px rgba(22, 163, 74, 0.3)" }}>Close Details</button>
          </div>
        </div>
      )}
      {selectedDelivery && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setSelectedDelivery(null)}>
          <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(240,253,244,0.92))", padding: "32px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.82)", boxShadow: "0 24px 70px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.9)", width: "90%", maxWidth: "500px", position: "relative", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: "4px", background: "linear-gradient(90deg, #86efac, #7dd3fc, #86efac)" }} />
            <button onClick={() => setSelectedDelivery(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#064e3b", boxShadow: "0 10px 22px rgba(15,23,42,0.08)" }}><X size={16} /></button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", paddingRight: "38px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 14px 30px rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#064e3b", flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#062018", letterSpacing: "-0.2px" }}>Delivery {selectedDelivery.id}</h2>
                <div style={{ fontSize: "12px", color: "rgba(6,32,24,0.58)", fontWeight: 700 }}>Manage rider assignment and rider-only updates</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(editableDelivery.status) }}>{editableDelivery.status}</span>
                <span style={{ fontSize: "12px", color: "rgba(6,32,24,0.55)", alignSelf: "center", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.7)" }}>Order: {editableDelivery.orderId}</span>
            </div>

            <div style={{ ...ecoGlassPanelStyle, padding: "20px", borderRadius: "20px", marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(6,32,24,0.58)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><Settings size={14} color="#15803d" /> Manage Delivery</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                 <div>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Assign Rider</label>
                   <select value={editableDelivery.rider} onChange={(e) => setEditableDelivery({...editableDelivery, rider: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                     <option value="Unassigned">Unassigned</option>
                     {mockRiders.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Rider Status</label>
                   <select value={editableDelivery.riderStatus || "Preparing Order"} onChange={(e) => setEditableDelivery({...editableDelivery, riderStatus: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                     {riderNotificationStatuses.map(status => (
                       <option key={status} value={status}>{status}</option>
                     ))}
                   </select>
                 </div>
                 <div style={{ gridColumn: "1 / -1" }}>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Estimated Time of Arrival (ETA)</label>
                   <input type="text" value={editableDelivery.eta} onChange={(e) => setEditableDelivery({...editableDelivery, eta: e.target.value})} placeholder="e.g. 15 mins or 2:00 PM" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                 </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <button onClick={handleNotifyRider} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "14px", background: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.18)", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 10px 22px rgba(245,158,11,0.08)" }}><Truck size={16} /> Notify Rider</button>
              <button onClick={() => { setToastMessage(`Notified ${editableDelivery.customer} of delivery update!`); setTimeout(() => setToastMessage(null), 3000); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "14px", background: "rgba(14,165,233,0.1)", color: "#0369a1", border: "1px solid rgba(14,165,233,0.16)", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 10px 22px rgba(14,165,233,0.08)" }}><Bell size={16} /> Notify Customer</button>
            </div>
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <button onClick={handleSaveDelivery} style={{ ...ecoPrimaryButtonStyle, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "999px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <Save size={16} style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Save Changes</span>
              </button>
            </div>

            <button onClick={() => setSelectedDelivery(null)} style={{ ...ecoPrimaryButtonStyle, width: "100%", padding: "14px", borderRadius: "999px", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
              <span style={{ position: "relative", zIndex: 1 }}>Close Tracker</span>
            </button>
          </div>
        </div>
      )}
      {simulatedRiderDelivery && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => { setSimulatedRiderDelivery(null); setIsRiderChatOpen(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "500px", position: "relative", color: "#000" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", color: "#000" }}><Truck color="#15803d" /> Rider Logistics App</h2>
              <button onClick={() => { setSimulatedRiderDelivery(null); setIsRiderChatOpen(false); }} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#000" }}><X size={16} /></button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700 }}>ORDER ID</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#15803d" }}>{simulatedRiderDelivery.orderId}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <MapPin size={16} color="#f59e0b" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700, marginBottom: "2px" }}>PICKUP LOCATION</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>EcoEquity Main Hub, Baguio</div>
                  </div>
                </div>
                <div style={{ width: "2px", height: "16px", background: "rgba(22,163,74,0.16)", marginLeft: "7px" }} />
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <MapPin size={16} color="#10b981" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700, marginBottom: "2px" }}>DELIVERY ADDRESS</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{simulatedRiderDelivery.orderDetails?.address || "Customer Address"}</div>
                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", marginTop: "4px" }}>{simulatedRiderDelivery.customer} • {simulatedRiderDelivery.orderDetails?.phone || "09123456789"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "16px", padding: "16px", marginBottom: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700, marginBottom: "8px" }}>PRODUCTS</div>
              <div style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}>{simulatedRiderDelivery.orderDetails?.products || "N/A"}</div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", marginTop: "12px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700 }}>RIDER STATUS</span>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(22,163,74,0.1)", color: "#15803d", fontSize: "11px", fontWeight: 800 }}>{simulatedRiderDelivery.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", marginBottom: "20px" }}>
              <button onClick={() => setIsRiderChatOpen(true)} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><MessageSquare size={16} /> Chat Rider</button>
            </div>

            {isRiderChatOpen && (
              <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: "24px", display: "flex", alignItems: "stretch", justifyContent: "stretch" }} onClick={() => setIsRiderChatOpen(false)}>
                <div style={{ width: "100%", minHeight: "100%", background: "linear-gradient(145deg, #ffffff, #f0fdf4)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", color: "#000", boxSizing: "border-box", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#000", display: "flex", alignItems: "center", gap: "7px" }}><MessageSquare size={18} color="#15803d" /> Chat Rider</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700, marginTop: "3px" }}>{simulatedRiderDelivery.rider} • {simulatedRiderDelivery.orderId}</div>
                    </div>
                    <button onClick={() => setIsRiderChatOpen(false)} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#000" }}><X size={16} /></button>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "12px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Quick Messages</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                      {[
                        "The item is ready for pickup.",
                        "The item is being prepared now. Please wait for the next update.",
                        "Packing is almost done. Stand by for pickup instructions.",
                        "Please proceed to the pickup point.",
                        "Please confirm once you have picked up the order.",
                        "Customer requested careful handling of the items."
                      ].map(message => (
                        <button key={message} onClick={() => handleSendRiderChatMessage(message)} style={{ minHeight: "42px", padding: "8px 10px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#15803d", border: "1px solid rgba(22,163,74,0.18)", fontSize: "10px", fontWeight: 700, cursor: "pointer", textAlign: "left", lineHeight: 1.25 }}>
                          {message}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="custom-scrollbar" style={{ flex: 1, minHeight: "130px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "10px", marginBottom: "12px", background: "rgba(255,255,255,0.45)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "16px" }}>
                    {riderChatMessages.map((message, idx) => {
                      const isAdmin = message.sender === "admin";
                      return (
                        <div key={`${message.sender}-${idx}`} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "84%", padding: "9px 11px", borderRadius: "14px", borderBottomRightRadius: isAdmin ? "4px" : "14px", borderBottomLeftRadius: isAdmin ? "14px" : "4px", background: isAdmin ? "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))" : "linear-gradient(135deg, rgba(74,222,128,0.25), rgba(134,239,172,0.15))", color: isAdmin ? "#062018" : "#111827", border: isAdmin ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(134,239,172,0.3)", boxShadow: isAdmin ? "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" : "0 0 18px rgba(134,239,172,0.25), inset 0 1px 0 rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, lineHeight: 1.35 }}>
                            <div>{message.text}</div>
                            <div style={{ marginTop: "4px", fontSize: "9px", color: isAdmin ? "rgba(6,32,24,0.62)" : "rgba(17,24,39,0.55)", fontWeight: 700 }}>{message.time}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={riderChatBottomRef} />
                  </div>
                  <div style={{ display: "flex", gap: "8px", paddingTop: "2px" }}>
                    <input
                      value={riderChatInput}
                      onChange={(e) => setRiderChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendRiderChatMessage();
                      }}
                      placeholder="Type a custom rider message..."
                      style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "#000", outline: "none", fontSize: "12px", fontFamily: "inherit" }}
                    />
                    <button onClick={() => handleSendRiderChatMessage()} disabled={!riderChatInput.trim()} style={{ width: "42px", height: "42px", borderRadius: "14px", ...(riderChatInput.trim() ? ecoPrimaryButtonStyle : { border: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.35)" }), cursor: riderChatInput.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {riderChatInput.trim() && <span aria-hidden="true" style={ecoPrimaryInnerStyle} />}
                      <Send size={16} style={{ position: "relative", zIndex: 1 }} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button 
                onClick={() => updateRiderStatus("In Transit")}
                disabled={simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Delivered" || simulatedRiderDelivery.status === "Out for Delivery"}
                style={{ padding: "14px", borderRadius: "12px", background: simulatedRiderDelivery.status === "Pending Pickup" ? "#f59e0b" : "rgba(0,0,0,0.05)", color: simulatedRiderDelivery.status === "Pending Pickup" ? "#fff" : "rgba(0,0,0,0.3)", border: "none", fontWeight: 700, fontSize: "14px", cursor: simulatedRiderDelivery.status === "Pending Pickup" ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                Accept & Start Delivery
              </button>
              <button 
                onClick={() => updateRiderStatus("Delivered")}
                disabled={simulatedRiderDelivery.status !== "In Transit" && simulatedRiderDelivery.status !== "Out for Delivery"}
                style={{ padding: "14px", borderRadius: "12px", background: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "#16a34a" : "rgba(0,0,0,0.05)", color: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "#fff" : "rgba(0,0,0,0.3)", border: "none", fontWeight: 700, fontSize: "14px", cursor: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedPaymentTxn && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setSelectedPaymentTxn(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "450px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPaymentTxn(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800 }}>Transaction {selectedPaymentTxn.id}</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getPaymentStatusStyle(selectedPaymentTxn.status) }}>{selectedPaymentTxn.status}</span>
                <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", alignSelf: "center", fontWeight: 600 }}>{selectedPaymentTxn.date}</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "20px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                 <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Customer</span>
                 <span style={{ fontSize: "13px", fontWeight: 700 }}>{selectedPaymentTxn.customer}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                 <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Order ID</span>
                 <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>{selectedPaymentTxn.orderId}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                 <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Payment Method</span>
                 <span style={{ fontSize: "13px", fontWeight: 700 }}>{selectedPaymentTxn.method}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                 <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Reference No.</span>
                 <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "monospace" }}>{selectedPaymentTxn.refNo}</span>
               </div>
               <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", margin: "16px 0" }} />
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <span style={{ fontSize: "15px", fontWeight: 800 }}>Total Amount</span>
                 <span style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>{selectedPaymentTxn.amount}</span>
               </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><CheckCircle size={16} /> Verify</button>
              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "rgba(107,114,128,0.1)", color: "#4b5563", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Download size={16} /> Receipt</button>
            </div>

            {selectedPaymentTxn.status === "Paid" && (
              <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginBottom: "16px" }}>Refund Payment</button>
            )}

            <button onClick={() => setSelectedPaymentTxn(null)} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
      {editingPromo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "400px", position: "relative" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 800 }}>{editingPromo.isNew ? "Add Promo Code" : "Edit Promo Code"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <input type="text" placeholder="Promo Code (e.g. SUMMER20)" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase().replace(/\s+/g, '')})} style={styles.editInput} />
              <input type="text" placeholder="Description" value={editingPromo.desc} onChange={e => setEditingPromo({...editingPromo, desc: e.target.value})} style={styles.editInput} />
              <select value={editingPromo.type} onChange={e => setEditingPromo({...editingPromo, type: e.target.value})} style={styles.editInput}>
                <option value="percent">Percentage Discount (%)</option>
                <option value="fixed">Fixed Amount Discount (₱)</option>
                <option value="shipping">Free Shipping</option>
              </select>
              {editingPromo.type !== "shipping" && (
                <input type="number" placeholder="Discount Value" value={editingPromo.value || ""} onChange={e => setEditingPromo({...editingPromo, value: parseFloat(e.target.value) || 0})} style={styles.editInput} />
              )}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEditingPromo(null)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSavePromo} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {selectedSubscriber && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease", boxSizing: "border-box" }} onClick={handleCloseSubscriber}>
          <div className="custom-scrollbar inner-blur-glass" style={{ maxWidth: "740px", width: "100%", maxHeight: "82vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseSubscriber} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#064e3b", boxShadow: "0 10px 22px rgba(15,23,42,0.08)" }}><X size={15} /></button>
            
            <div style={{ textAlign: "center", marginBottom: "14px", padding: "0 36px" }}>
              <h1 style={{ margin: "0 0 3px", fontSize: "23px", fontWeight: 800, color: "#111827" }}>
                Manage Subscription
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>Update plan details, usage, billing, and subscriber messaging.</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", padding: "10px 12px", borderRadius: "18px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#064e3b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 10px 22px rgba(34,197,94,0.16)", flexShrink: 0 }}>
                {selectedSubscriber.user.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: "0 0 1px", fontSize: "18px", fontWeight: 800, color: "#062018", letterSpacing: "-0.2px" }}>{selectedSubscriber.user}</h2>
                <div style={{ fontSize: "12px", color: "rgba(6,32,24,0.58)", fontWeight: 700 }}>{selectedSubscriber.email}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", width: "100%", alignItems: "stretch", marginBottom: "14px" }}>
               <div style={{ background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>1</span> Subscription Info</h4>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Plan:</span> <span style={{ fontSize: "13px", fontWeight: 800, color: selectedSubscriber.plan === "Pro" ? "#f59e0b" : selectedSubscriber.plan === "Enterprise" ? "#0ea5e9" : "#64748b" }}>{selectedSubscriber.plan}</span></div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Status:</span> <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, ...getSubStatusStyle(selectedSubscriber.status) }}>{selectedSubscriber.status}</span></div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Payment:</span> <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.7)" }}>{selectedSubscriber.payment}</span></div>
                 <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Renewal:</span> <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.7)" }}>{selectedSubscriber.renewal}</span></div>
               </div>
               {(() => {
                 const pct = (selectedSubscriber.aiScans / selectedSubscriber.aiLimit) * 100;
                 const isNearLimit = pct >= 80 && pct < 100;
                 const isAtLimit = pct >= 100;
                 return (
                   <div style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "0 8px 22px rgba(0,0,0,0.06)" }}>
                     <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>2</span> AI Usage</h4>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                       <span>Plant Scans</span>
                       <span style={{ color: isAtLimit ? "#dc2626" : isNearLimit ? "#f97316" : "#15803d" }}>{selectedSubscriber.aiScans} / {selectedSubscriber.aiLimit}</span>
                     </div>
                     <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                       <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: isAtLimit ? "#dc2626" : isNearLimit ? "#f97316" : "linear-gradient(90deg, #16a34a, #4ade80)", borderRadius: "999px", animation: isNearLimit ? "warningPulse 1.5s infinite" : "none" }} />
                     </div>
                     {isNearLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#f97316", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> ⚠️ Only {selectedSubscriber.aiLimit - selectedSubscriber.aiScans} scans remaining this month</p>
                     )}
                     {isAtLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#dc2626", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> 🔒 Limit reached. Upgrade to unlock unlimited diagnostics.</p>
                     )}
                   </div>
                 );
               })()}
               
               <div style={{ background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>3</span> Manage Plan</h4>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Plan</label>
                     <AdminEcoDropdown value={editableSubscriber?.plan || selectedSubscriber.plan} options={subscriptionPlanOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), plan: value, aiLimit: value === "Basic" ? 10 : value === "Pro" ? 100 : 5000 })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Status</label>
                     <AdminEcoDropdown value={editableSubscriber?.status || selectedSubscriber.status} options={subscriptionStatusOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), status: value })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Payment Method</label>
                     <AdminEcoDropdown value={editableSubscriber?.payment || selectedSubscriber.payment} options={subscriptionPaymentOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), payment: value })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Renewal Date</label>
                     <AdminEcoDropdown value={editableSubscriber?.renewal || selectedSubscriber.renewal} options={subscriptionRenewalOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), renewal: value })} />
                   </div>
                 </div>
               </div>

               <div style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "0 8px 22px rgba(0,0,0,0.06)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>4</span> Notifications</h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "142px", overflowY: "auto", paddingRight: "2px" }} className="custom-scrollbar">
                   <div style={{ padding: "7px 9px", background: "rgba(22,163,74,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#15803d", fontWeight: 600 }}><CheckCircle size={13} /> Subscription renewed successfully</div>
                   <div style={{ padding: "7px 9px", background: "rgba(249,115,22,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#c2410c", fontWeight: 600 }}><AlertCircle size={13} /> AI Scan limit almost reached</div>
                   <div style={{ padding: "7px 9px", background: "rgba(14,165,233,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#0284c7", fontWeight: 600 }}><CalendarDays size={13} /> New eco workshop available</div>
                   <div style={{ padding: "7px 9px", background: "rgba(139,92,246,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#7c3aed", fontWeight: 600 }}><Tag size={13} /> Promo: 20% off yearly plan</div>
                   <div style={{ padding: "7px 9px", background: "rgba(22,163,74,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#15803d", fontWeight: 600 }}><span style={{fontSize: "13px"}}>🎉</span> You earned 120 EcoPoints this month</div>
                 </div>
               </div>
               <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>5</span> Alert & Campaign</h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                       <AdminEcoDropdown value={subscriberCampaignForm.audience} options={subscriberAudienceOptions.map(option => ({ ...option, label: option.value === "subscriber" ? `Send to ${selectedSubscriber.user} Only` : option.label }))} onChange={value => setSubscriberCampaignForm({...subscriberCampaignForm, audience: value})} compact />
                       <AdminEcoDropdown value={subscriberCampaignForm.type} options={subscriberCampaignTypeOptions} onChange={value => setSubscriberCampaignForm({...subscriberCampaignForm, type: value})} compact />
                        <AdminEcoDropdown value={subscriberCampaignForm.delivery} options={subscriberDeliveryOptions.map(option => ({ ...option, label: `Delivery: ${option.label}` }))} onChange={value => setSubscriberCampaignForm({...subscriberCampaignForm, delivery: value})} compact />
                       <AdminEcoDropdown value={subscriberCampaignForm.schedule} options={subscriberScheduleOptions} onChange={value => setSubscriberCampaignForm({...subscriberCampaignForm, schedule: value})} compact />
                   </div>
                   <input type="text" placeholder="Title (e.g. New AI Plant Doctor update available)" value={subscriberCampaignForm.title} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, title: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px" }} />
                   <textarea placeholder="Message body (e.g. You can now detect 20+ new crop diseases...)" rows={2} value={subscriberCampaignForm.message} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, message: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px", resize: "none", fontFamily: "inherit", minHeight: "56px" }} />
                 </div>
               </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginBottom: "10px" }}>
              <button onClick={handleSaveSubscriber} style={{ ...ecoPrimaryButtonStyle, minWidth: 0, padding: "8px 9px", borderRadius: "999px", fontWeight: 800, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <Save size={13} style={{ position: "relative", zIndex: 1, flexShrink: 0 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Save Subscription</span>
              </button>
              <button style={{ minWidth: 0, padding: "8px 9px", borderRadius: "999px", background: "rgba(22,163,74,0.1)", color: "#15803d", border: "1px solid rgba(22,163,74,0.18)", fontWeight: 800, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", boxShadow: "0 10px 22px rgba(22,163,74,0.08)", whiteSpace: "nowrap" }}><CreditCard size={13} style={{ flexShrink: 0 }}/> Manage Billing</button>
              <button onClick={handleDispatchSubscriberCampaign} style={{ ...ecoPrimaryButtonStyle, minWidth: 0, padding: "8px 9px", borderRadius: "999px", fontWeight: 800, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <Send size={13} style={{ position: "relative", zIndex: 1, flexShrink: 0 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Dispatch Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedEvent && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              {isEditingEvent ? (
                <select value={editableEvent.type} onChange={e => setEditableEvent({...editableEvent, type: e.target.value})} style={styles.editInput}>
                  <option value="Workshop">Workshop</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Community">Community</option>
                </select>
              ) : (
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: selectedEvent.type === "Workshop" ? "rgba(139,92,246,0.1)" : selectedEvent.type === "Webinar" ? "rgba(2,132,199,0.1)" : "rgba(22,163,74,0.1)", color: selectedEvent.type === "Workshop" ? "#8b5cf6" : selectedEvent.type === "Webinar" ? "#0284c7" : "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>{selectedEvent.type}</span>
              )}
              {isEditingEvent ? (
                <select value={editableEvent.status} onChange={e => setEditableEvent({...editableEvent, status: e.target.value})} style={styles.editInput}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              ) : (
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, ...getEventStatusStyle(selectedEvent.status) }}>{selectedEvent.status}</span>
              )}
            </div>
            
            {isEditingEvent ? (
              <input type="text" value={editableEvent.title} onChange={e => setEditableEvent({...editableEvent, title: e.target.value})} placeholder="Event Title" style={{...styles.editInput, fontSize: "18px", fontWeight: 800, marginBottom: "16px"}} />
            ) : (
              <h2 style={{ margin: "0 0 16px", fontSize: "22px", fontWeight: 800, lineHeight: 1.2 }}>{selectedEvent.title}</h2>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Schedule & Location</h4>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><CalendarDays size={14} color="#15803d" /> {isEditingEvent ? <input type="text" value={editableEvent.date} onChange={e => setEditableEvent({...editableEvent, date: e.target.value})} style={styles.editInput} placeholder="Date (e.g. Jun 15, 2026)" /> : selectedEvent.date}</div>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><Clock size={14} color="#15803d" /> {isEditingEvent ? <input type="text" value={editableEvent.time} onChange={e => setEditableEvent({...editableEvent, time: e.target.value})} style={styles.editInput} placeholder="Time (e.g. 09:00 AM)" /> : selectedEvent.time}</div>
                 <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}><MapPin size={14} color="#15803d" style={{ flexShrink: 0, marginTop: "2px" }} /> {isEditingEvent ? <input type="text" value={editableEvent.location} onChange={e => setEditableEvent({...editableEvent, location: e.target.value})} style={styles.editInput} placeholder="Location" /> : selectedEvent.location}</div>
               </div>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Event Info</h4>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", alignItems: "center" }}><span style={{ fontWeight: 600 }}>Price:</span> {isEditingEvent ? <input type="text" value={editableEvent.price} onChange={e => setEditableEvent({...editableEvent, price: e.target.value})} style={{...styles.editInput, width: "80px"}} /> : <span style={{ fontWeight: 800, color: "#15803d" }}>{selectedEvent.price}</span>}</div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: 600, alignItems: "center" }}><span>Attendees:</span> {isEditingEvent ? (<div style={{display: "flex", gap: "4px", alignItems: "center"}}><input type="number" value={editableEvent.attendees} onChange={e => setEditableEvent({...editableEvent, attendees: parseInt(e.target.value) || 0})} style={{...styles.editInput, width: "50px", padding: "4px"}} /> / <input type="number" value={editableEvent.maxAttendees} onChange={e => setEditableEvent({...editableEvent, maxAttendees: parseInt(e.target.value) || 0})} style={{...styles.editInput, width: "50px", padding: "4px"}} /></div>) : (<span>{selectedEvent.attendees} / {selectedEvent.maxAttendees}</span>)}</div>
                 {!isEditingEvent && (
                   <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", marginTop: "4px" }}>
                     <div style={{ width: `${Math.min((selectedEvent.attendees / selectedEvent.maxAttendees) * 100, 100)}%`, height: "100%", background: selectedEvent.attendees >= selectedEvent.maxAttendees ? "#eab308" : "linear-gradient(90deg, #16a34a, #4ade80)", borderRadius: "999px" }} />
                   </div>
                 )}
               </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {isEditingEvent ? (
                <>
                  <button onClick={handleSaveEvent} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}><Save size={16}/> Save Changes</button>
                  <button onClick={() => { setIsEditingEvent(false); if (editableEvent.isNew) setSelectedEvent(null); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Cancel</button>
                </>
              ) : (
                <>
                  <button style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Users size={16}/> View Attendees</button>
                  <button onClick={() => { setIsEditingEvent(true); setEditableEvent({ ...selectedEvent }); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Edit2 size={16}/> Edit Event</button>
                </>
              )}
            </div>

            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Close Details</button>
          </div>
        </div>
      )}
      {selectedScan && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setSelectedScan(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.3)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedScan(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: "0", fontSize: "22px", fontWeight: 800 }}>AI Scan: {selectedScan.id}</h2>
              <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getScanStatusStyle(selectedScan.status) }}>{selectedScan.status}</span>
            </div>

            {/* Image Preview & Holographic Scan Line */}
            <div style={{ position: "relative", height: "200px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.05))", border: "1px solid rgba(22,163,74,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "inset 0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "64px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}>🌿</div>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "rgba(74, 222, 128, 0.8)", boxShadow: "0 0 15px 2px #4ade80", animation: "scanLine 2.5s ease-in-out infinite" }} />
            </div>

            {/* Confidence Meter & Details */}
            <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "20px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                 <span style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}><Stethoscope size={14} color="#15803d" /> Detected: {selectedScan.disease}</span>
                 <span style={{ fontSize: "13px", fontWeight: 800, color: parseInt(selectedScan.confidence) > 90 ? "#16a34a" : "#f59e0b" }}>{selectedScan.confidence} Confidence</span>
               </div>
               <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", marginBottom: "16px" }}>
                 <div style={{ width: selectedScan.confidence, height: "100%", background: parseInt(selectedScan.confidence) > 90 ? "linear-gradient(90deg, #16a34a, #4ade80)" : "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: "999px", boxShadow: `0 0 10px ${parseInt(selectedScan.confidence) > 90 ? "rgba(74,222,128,0.5)" : "rgba(251,191,36,0.5)"}` }} />
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", fontSize: "13px" }}>
                 <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600, fontSize: "11px" }}>PLANT</span> <span style={{ fontWeight: 700 }}>{selectedScan.plant}</span></div>
                 <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600, fontSize: "11px" }}>SCANNED BY</span> <span style={{ fontWeight: 700 }}>{selectedScan.user}</span></div>
               </div>
               
               <h4 style={{ margin: "0 0 6px", fontSize: "11px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>AI Recommendation</h4>
               <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(0,0,0,0.8)", background: "rgba(14,165,233,0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(14,165,233,0.1)" }}>{selectedScan.recommendation}</p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Download size={16}/> Download Report</button>
              <button style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}><MessageSquare size={16}/> Consult Expert</button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="inner-blur-glass" style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBadge}>
            <ShieldCheck size={16} color="#15803d" />
          </div>
          <h2 style={styles.sidebarTitle}>Admin Portal</h2>
        </div>
        
        <div className="custom-scrollbar" style={styles.sidebarNav}>
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              style={{
                ...styles.navItem,
                ...(activeTab === item.name ? styles.navItemActive : {})
              }}
            >
              <item.icon size={16} />
              {item.name}
            </button>
          ))}
        </div>
        
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="inner-blur-glass custom-scrollbar" style={styles.mainContent}>
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={styles.pageTitle}>{activeTab}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={styles.searchBar}>
              <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
              <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>
            <div style={{ position: "relative" }} ref={notifRef}>
              <button 
                onClick={() => setIsAdminNotifOpen(!isAdminNotifOpen)}
                style={styles.iconBtn}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: "bold", padding: "2px 5px", borderRadius: "50%", boxShadow: "0 0 8px #ef4444", border: "1px solid #fff", animation: "pulseBadge 2s infinite" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {isAdminNotifOpen && (
                 <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "300px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: "14px", fontWeight: 700 }}>Notifications</span>
                       <button onClick={() => setAdminNotifications(adminNotifications.map(n => ({...n, unread: false})))} style={{ background: "none", border: "none", fontSize: "11px", color: "#16a34a", cursor: "pointer", fontWeight: 600 }}>Mark all as read</button>
                    </div>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                       {adminNotifications.map(n => (
                          <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: n.unread ? "rgba(14,165,233,0.05)" : "transparent" }}>
                             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: n.type === 'error' ? '#dc2626' : n.type === 'warning' ? '#f59e0b' : '#0284c7' }}>{n.title}</span>
                                <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>{n.time}</span>
                             </div>
                             <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.7)", lineHeight: 1.4 }}>{n.message}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>
            <div style={styles.adminProfile}>
              A
            </div>
          </div>
        </header>

        {/* Tab Content Rendering */}
        {activeTab === "Dashboard" ? (
          <div style={styles.dashboardContainer}>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {mockStats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="inner-blur-glass" 
                  style={{
                    ...styles.statCard,
                    ...(hoveredStat === idx ? styles.statCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={styles.chartsRow}>
              {/* Revenue Line Chart */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={styles.cardHeading}>Revenue Overview</h3>
                <div style={styles.chartWrapper}>
                  <svg viewBox="0 0 400 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <defs>
                      <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34,197,94,0.3)" />
                        <stop offset="100%" stopColor="rgba(34,197,94,0)" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 120 L 0 90 C 50 80, 100 100, 150 60 S 250 80, 300 40 S 350 50, 400 20 L 400 120 Z" fill="url(#adminRevGrad)" />
                    <path d="M 0 90 C 50 80, 100 100, 150 60 S 250 80, 300 40 S 350 50, 400 20" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="400" cy="20" r="5" fill="#fff" stroke="#16a34a" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Order Status Bars */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={styles.cardHeading}>Order Status</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  {[
                    { label: "Delivered", pct: "65%", color: "#16a34a" },
                    { label: "Processing", pct: "20%", color: "#0ea5e9" },
                    { label: "Out for Delivery", pct: "10%", color: "#f59e0b" },
                    { label: "Cancelled", pct: "5%", color: "#ef4444" },
                  ].map(item => (
                    <div key={item.label} style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.7)", marginBottom: "4px" }}>
                        <span>{item.label}</span>
                        <span>{item.pct}</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                        <div style={{ width: item.pct, height: "100%", background: item.color, borderRadius: "999px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div style={styles.bottomGrid}>
              {/* Recent Orders */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={styles.cardHeading}>Recent Orders</h3>
                  <button style={styles.textBtn}>View All</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orders || []).slice(0, 5).map(order => (
                        <tr key={order.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{order.id}</td>
                          <td style={styles.td}>{order.customer}</td>
                          <td style={{ ...styles.td, fontWeight: 600, color: "#15803d" }}>{order.amount}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: "3px 6px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
                              ...getStatusStyle(order.status)
                            }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: "rgba(0,0,0,0.5)", fontSize: "11px" }}>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={{ ...styles.cardHeading, marginBottom: "12px" }}>Top Products</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mockTopProducts.map(prod => (
                    <div key={prod.name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{prod.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{prod.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>{prod.sales} sold</div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#15803d" }}>{prod.rev}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer Verifications */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={{ ...styles.cardHeading, marginBottom: "12px" }}>Pending Verifications</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mockVerifications.map((ver, idx) => (
                    <div key={idx} style={{ padding: "10px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{ver.name}</div>
                          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>{ver.location} • {ver.type}</div>
                        </div>
                        <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)" }}>{ver.date}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ flex: 1, padding: "4px", borderRadius: "6px", background: "#16a34a", color: "#fff", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><CheckCircle size={12} /> Approve</button>
                        <button style={{ flex: 1, padding: "4px", borderRadius: "6px", background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><XCircle size={12} /> Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Activity */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={{ ...styles.cardHeading, marginBottom: "12px" }}>Platform Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", paddingLeft: "10px" }}>
                  <div style={{ position: "absolute", left: "13px", top: "8px", bottom: "8px", width: "2px", background: "rgba(0,0,0,0.05)" }} />
                  {mockActivityFeed.map((act, idx) => (
                    <div key={idx} style={{ position: "relative", zIndex: 1, display: "flex", gap: "10px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: act.color, marginTop: "6px", boxShadow: `0 0 0 3px rgba(255,255,255,0.8), 0 0 6px ${act.color}` }} />
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "12px", color: "rgba(0,0,0,0.8)", lineHeight: 1.4 }}>{act.text}</p>
                        <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Products" ? (
          <div style={styles.dashboardContainer}>
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Manage Products</h3>
                <button onClick={handleAddProduct} style={{ ...styles.textBtn, background: "#16a34a", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Add Product</button>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px", flexWrap: "wrap" }}>
                {["All", ...new Set(products.map(p => p.category))].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setProductCategoryFilter(cat)}
                        style={{
                            padding: "6px 14px",
                            borderRadius: "999px",
                            border: "1px solid rgba(0,0,0,0.1)",
                            background: productCategoryFilter === cat ? "#16a34a" : "rgba(255,255,255,0.7)",
                            color: productCategoryFilter === cat ? "#fff" : "rgba(0,0,0,0.7)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {cat}
                    </button>
                ))}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Product Info</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Stock Qty</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingProduct && editingProduct.isNew && (
                      <tr style={styles.tr}>
                        <td style={styles.td}>{editingProduct.id}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input 
                              type="text" 
                              value={editingProduct.name} 
                              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                              style={styles.editInput}
                              placeholder="Product Name"
                            />
                            <label style={{ cursor: "pointer", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Upload Image">
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setEditingProduct({...editingProduct, image: URL.createObjectURL(e.target.files[0])});
                                }
                              }} />
                              <Image size={14} />
                            </label>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <textarea 
                            value={editingProduct.description || ""} 
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                            style={{ ...styles.editInput, resize: "vertical", minHeight: "30px", fontFamily: "inherit" }}
                            placeholder="Product Description"
                            rows={2}
                          />
                        </td>
                        <td style={styles.td}>
                          <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} style={styles.editInput} placeholder="Category" />
                        </td>
                        <td style={styles.td}>
                          <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} style={styles.editInput} placeholder="Price" />
                        </td>
                        <td style={styles.td}>
                          <input type="number" value={editingProduct.stockQuantity || 0} onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})} style={styles.editInput} placeholder="Qty" />
                        </td>
                        <td style={styles.td}>
                          <select value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} style={styles.editInput}>
                            <option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out of Stock</option>
                          </select>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={handleSaveProduct} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "6px 12px", fontWeight: "bold" }}>Post</button>
                            <button onClick={() => setEditingProduct(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filteredAdminProducts.map((product) => (
                      <tr key={product.id} style={styles.tr}>
                        <td style={styles.td}>{product.id}</td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input 
                                type="text" 
                                value={editingProduct.name} // Editable product name
                                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                style={styles.editInput}
                              />
                              <label style={{ cursor: "pointer", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Upload Image">
                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setEditingProduct({...editingProduct, image: URL.createObjectURL(e.target.files[0])});
                                  }
                                }} />
                                <Image size={14} />
                              </label>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {product.image && product.image.startsWith('blob:') ? (
                                <img src={product.image} alt={product.name} style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontSize: "16px" }}>{product.emoji}</span>
                              )}
                              <span style={{ fontWeight: 600 }}>{product.name}</span>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <textarea 
                              value={editingProduct.description || ""} 
                              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                              style={{ ...styles.editInput, resize: "vertical", minHeight: "30px", fontFamily: "inherit" }}
                              placeholder="Product Description"
                              rows={2}
                            />
                          ) : (
                            <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={product.description}>{product.description}</div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} style={styles.editInput} />
                          ) : (
                            product.category
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} style={styles.editInput} />
                          ) : (
                            `₱${product.price}`
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <input type="number" value={editingProduct.stockQuantity || 0} onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})} style={styles.editInput} placeholder="Qty" />
                          ) : (
                            product.stockQuantity || 0
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <select value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} style={styles.editInput}>
                              <option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out of Stock</option>
                            </select>
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: product.stock === "In Stock" ? "rgba(22,163,74,0.1)" : product.stock === "Low Stock" ? "rgba(245,158,11,0.1)" : "rgba(220,38,38,0.1)", color: product.stock === "In Stock" ? "#16a34a" : product.stock === "Low Stock" ? "#f59e0b" : "#dc2626" }}>{product.stock}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={handleSaveProduct} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "6px 12px", fontWeight: "bold" }}>Update</button>
                              <button onClick={() => setEditingProduct(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleEditClick(product)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }}><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><XCircle size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "Users" ? (
          <div style={styles.dashboardContainer}>
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>User Management</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>User ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Last Login</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{user.id}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #0284c7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                              {user.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>{user.role}</td>
                        <td style={{ ...styles.td, color: "rgba(0,0,0,0.5)", fontSize: "11px" }}>{user.lastLogin}</td>
                        <td style={styles.td}>
                          <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: user.status === "Online" ? "rgba(22,163,74,0.1)" : "rgba(107,114,128,0.1)", color: user.status === "Online" ? "#16a34a" : "#6b7280" }}>{user.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "Orders" ? (
          <div style={styles.dashboardContainer}>
            {/* Orders Analytics Cards */}
            <div style={styles.statsGrid}>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><CreditCard size={16} color="#15803d" /></div>
                  <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22, 163, 74, 0.1)" }}><TrendingUp size={10} /> +12%</span>
                </div>
                <div style={styles.statValue}>₱{revenueToday.toLocaleString()}</div>
                <div style={styles.statLabel}>Revenue Today</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><ShoppingCart size={16} color="#0284c7" /></div>
                  <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22, 163, 74, 0.1)" }}><TrendingUp size={10} /> +5%</span>
                </div>
                <div style={styles.statValue}>{(orders || []).length}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Clock size={16} color="#eab308" /></div>
                  <span style={{ ...styles.trendBadge, color: "#e11d48", background: "rgba(225, 29, 72, 0.1)" }}><TrendingDown size={10} /> -2%</span>
                </div>
                <div style={styles.statValue}>{pendingOrdersCount}</div>
                <div style={styles.statLabel}>Pending Orders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><CheckCircle size={16} color="#16a34a" /></div>
                  <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22, 163, 74, 0.1)" }}><TrendingUp size={10} /> +8%</span>
                </div>
                <div style={styles.statValue}>{deliveredOrdersCount}</div>
                <div style={styles.statLabel}>Delivered Orders</div>
              </div>
            </div>

            {/* Orders Table Container */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Order Management</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleRefreshOrders}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "6px 16px", borderRadius: "999px",
                      background: "rgba(22,163,74,0.1)",
                      color: "#15803d",
                      border: "1px solid rgba(22,163,74,0.2)",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#15803d";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(22,163,74,0.1)";
                      e.currentTarget.style.color = "#15803d";
                    }}
                  >
                    <RefreshCcw size={14} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter(orderStatusFilter === "Out for Delivery" ? "All" : "Out for Delivery")}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "6px 16px", borderRadius: "999px",
                      background: orderStatusFilter === "Out for Delivery" ? "#f59e0b" : "rgba(245,158,11,0.1)",
                      color: orderStatusFilter === "Out for Delivery" ? "#fff" : "#b45309",
                      border: orderStatusFilter === "Out for Delivery" ? "1px solid #f59e0b" : "1px solid rgba(245,158,11,0.2)",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Navigation size={14} />
                    Out for Delivery Only
                  </button>
                  <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                    <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                    <input type="text" placeholder="Search orders..." value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)} style={styles.searchInput} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                    <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                      <option value="All">All Statuses</option>
                      <option value="Pending Approval">Pending Approval</option>
                        <option value="Disapproved">Disapproved</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}>Payment</th>
                        <th style={styles.th}>Address</th>
                      <th style={styles.th}>Status of Approval</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrdersList.map((order) => (
                      <tr key={order.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>
                            {order.id}
                            <div style={{ color: "rgba(0,0,0,0.5)", fontSize: "10px", marginTop: "2px" }}>{order.date}</div>
                          </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                              {order.customer.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{order.customer}</span>
                          </div>
                        </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: "12px", color: "#000", fontWeight: 500 }}>{order.phone}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: "#15803d", fontSize: "13px" }}>{order.amount || `₱${order.total?.toFixed(2)}`}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.6)", marginTop: "2px" }}>{order.payment} • <span style={{ color: order.paymentStatus === "Paid" ? "#16a34a" : "#d97706" }}>{order.paymentStatus || "Pending"}</span></div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.7)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={order.address}>{order.address}</div>
                          </td>
                        <td style={styles.td}>
                          {editingOrderId === order.id ? (
                            <select value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value)} style={styles.editInput}>
                              <option value="Pending Approval">Pending Approval</option>
                              <option value="Approved">Approved</option>
                              <option value="Disapproved">Disapproved</option>
                            </select>
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(order.status) }}>{order.status}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingOrderId === order.id ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleSaveOrderStatus(order.id)} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                              <button onClick={() => setEditingOrderId(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleManageOrder(order)} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)" }}><Eye size={14} /></button>
                                {order.status === "Pending Approval" && (
                                  <button onClick={() => handleEditOrder(order)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }}><Edit2 size={14} /></button>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "Deliveries" ? (
          <div style={styles.dashboardContainer}>
            {/* Delivery Stats Grid */}
            <div style={{ ...styles.statsGrid, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              {mockDeliveryStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Delivery Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Delivery Queue</h3>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setDeliveryStatusFilter(deliveryStatusFilter === "Out for Delivery" ? "All" : "Out for Delivery")}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 16px", borderRadius: "999px",
                        background: deliveryStatusFilter === "Out for Delivery" ? "#f59e0b" : "rgba(245,158,11,0.1)",
                        color: deliveryStatusFilter === "Out for Delivery" ? "#fff" : "#b45309",
                        border: deliveryStatusFilter === "Out for Delivery" ? "1px solid #f59e0b" : "1px solid rgba(245,158,11,0.2)",
                        fontWeight: 700, fontSize: "12px", cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <Navigation size={14} />
                      Out for Delivery Only
                    </button>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search deliveries..." value={deliverySearchTerm} onChange={(e) => setDeliverySearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <select value={deliveryStatusFilter} onChange={(e) => setDeliveryStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                        <option value="All">All Statuses</option>
                        <option value="Pending Pickup">Pending Pickup</option>
                        <option value="Packed">Packed</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Tracking ID</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Rider</th>
                        <th style={styles.th}>Status of Orders</th>
                        <th style={styles.th}>ETA</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveriesList.map((delivery) => (
                        <tr key={delivery.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{delivery.id}</td>
                          <td style={styles.td}>{delivery.customer}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#475569" }}>
                                {delivery.rider === "Unassigned" ? "?" : delivery.rider.charAt(0)}
                              </div>
                              <span style={{ fontWeight: 600 }}>{delivery.rider}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {editingDeliveryId === delivery.id ? (
                              <select value={newDeliveryStatus} onChange={(e) => setNewDeliveryStatus(e.target.value)} style={styles.editInput}>
                                <option value="Pending Pickup">Pending Pickup</option>
                                <option value="Packed">Packed</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Delayed">Delayed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(delivery.status) }}>{delivery.status}</span>
                            )}
                          </td>
                          <td style={{ ...styles.td, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{delivery.eta}</td>
                          <td style={styles.td}>
                            {editingDeliveryId === delivery.id ? (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleSaveDeliveryStatus(delivery.id)} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                                <button onClick={() => setEditingDeliveryId(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "8px" }}>
                                {delivery.status === "Delivered" ? (
                                  <button disabled title="Delivered orders cannot be managed." style={{ ...styles.actionBtn, color: "#6b7280", background: "rgba(107,114,128,0.1)", padding: "4px 8px", fontWeight: "bold", fontSize: "11px", cursor: "not-allowed", opacity: 0.65 }}>Delivered</button>
                                ) : (
                                  <button onClick={() => { setSelectedDelivery(delivery); setEditableDelivery({...delivery, riderStatus: delivery.riderStatus || "Preparing Order"}); }} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "4px 8px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
                                )}
                                <button onClick={() => handleEditDeliveryInline(delivery)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }}><Edit2 size={14} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - Map & Riders */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Live Tracking Map Preview */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: 0, overflow: "hidden", position: "relative", height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
                    <path d="M 50 150 Q 150 50 250 120 T 380 60" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="8 8" />
                    <circle cx="50" cy="150" r="8" fill="#15803d" />
                    <circle cx="250" cy="120" r="8" fill="#eab308" />
                    <circle cx="380" cy="60" r="8" fill="#0ea5e9" />
                    
                    {/* Live Rider Node */}
                    <g transform="translate(150, 100)">
                      <circle cx="0" cy="0" r="16" fill="rgba(22,163,74,0.2)">
                        <animate attributeName="r" values="16; 24; 16" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="8" fill="#16a34a" />
                    </g>
                  </svg>
                  <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "6px", color: "#15803d" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }}></span> Live Tracking
                  </div>
                </div>

                {/* Rider Management */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px" }}>Active Riders</h3>
                    <button style={styles.textBtn}>View All</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {mockRiders.map((rider, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "rgba(255,255,255,0.5)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ position: "relative" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569" }}>
                              {rider.name.charAt(0)}
                            </div>
                            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: rider.status === "Available" ? "#16a34a" : rider.status === "On Delivery" ? "#f59e0b" : "#94a3b8", border: "2px solid #fff" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{rider.name}</div>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>★ {rider.rating} • {rider.deliveries} trips</div>
                          </div>
                        </div>
                        <button style={{ background: "rgba(14,165,233,0.1)", border: "none", color: "#0ea5e9", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eco Metrics Box */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Leaf size={18} color="#15803d" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "#15803d" }}>Eco-Delivery Impact</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>45%</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>Eco-Bike Usage</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>120kg</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>CO₂ Saved Today</div>
                    </div>
                  </div>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", marginTop: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Megaphone size={18} color="#0ea5e9" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#0ea5e9" }}>Broadcast Notifications</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <select value={sendNotifForm.audience} onChange={e => setSendNotifForm({...sendNotifForm, audience: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)" }}>
                        <option value="All">All Users</option>
                        <option value="Basic">Basic Plan Users</option>
                        <option value="Pro">Pro Plan Users</option>
                        <option value="Enterprise">Enterprise Users</option>
                      </select>
                      <select value={sendNotifForm.type} onChange={e => setSendNotifForm({...sendNotifForm, type: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)" }}>
                        <option value="Announcement">Feature Announcement</option>
                        <option value="Promo">Promo / Discount</option>
                        <option value="Alert">Maintenance Alert</option>
                        <option value="Reminder">Subscription Reminder</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Notification Title" value={sendNotifForm.title} onChange={e => setSendNotifForm({...sendNotifForm, title: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)" }} />
                    <textarea placeholder="Type your message here..." value={sendNotifForm.message} onChange={e => setSendNotifForm({...sendNotifForm, message: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)", height: "80px", resize: "none", fontFamily: "inherit" }} />
                    <button 
                      onClick={() => {
                        if(!sendNotifForm.title || !sendNotifForm.message) { setToastMessage("Please fill all fields"); setTimeout(()=>setToastMessage(null), 3000); return; }
                        setToastMessage(`Broadcast sent to ${sendNotifForm.audience} users.`);
                        setSendNotifForm({ title: "", message: "", audience: "All", type: "Announcement" });
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      style={{ padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(2,132,199,0.3)" }}
                    >
                      <Send size={14} /> Send Broadcast
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Delivered Reports" ? (
          <div style={styles.dashboardContainer}>
            <div style={styles.statsGrid}>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><CheckCircle size={16} color="#16a34a" /></div>
                  <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22, 163, 74, 0.1)" }}>Complete</span>
                </div>
                <div style={styles.statValue}>{deliveredReportsList.length}</div>
                <div style={styles.statLabel}>Delivered Items</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Truck size={16} color="#0284c7" /></div>
                  <span style={{ ...styles.trendBadge, color: "#0284c7", background: "rgba(14,165,233,0.1)" }}>Archived</span>
                </div>
                <div style={styles.statValue}>{deliveredReportsList.filter(delivery => delivery.rider !== "Unassigned").length}</div>
                <div style={styles.statLabel}>Assigned Riders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Leaf size={16} color="#15803d" /></div>
                  <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22,163,74,0.1)" }}>Eco</span>
                </div>
                <div style={styles.statValue}>{deliveredReportsList.filter(delivery => delivery.type === "Eco-Bike" || delivery.type === "EV-Van").length}</div>
                <div style={styles.statLabel}>Eco Deliveries</div>
              </div>
            </div>

            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "4px" }}>Delivered Reports</h3>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600 }}>Completed deliveries are archived here after they are marked as delivered.</div>
                </div>
                <span style={{ padding: "6px 12px", borderRadius: "999px", background: "rgba(22,163,74,0.1)", color: "#15803d", fontSize: "12px", fontWeight: 800 }}>
                  {deliveredReportsList.length} Completed
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "760px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Tracking ID</th>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Rider</th>
                      <th style={styles.th}>Products</th>
                      <th style={styles.th}>Payment</th>
                      <th style={styles.th}>Address</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredReportsList.length > 0 ? deliveredReportsList.map((delivery) => {
                      const orderDetails = (orders || []).find(order => order.id === delivery.orderId);
                      return (
                        <tr key={delivery.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 800 }}>{delivery.id}</td>
                          <td style={{ ...styles.td, color: "#15803d", fontWeight: 700 }}>{delivery.orderId}</td>
                          <td style={styles.td}>{delivery.customer}</td>
                          <td style={styles.td}>{delivery.rider}</td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: "210px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={orderDetails?.products || delivery.products || "N/A"}>
                              {orderDetails?.products || delivery.products || "N/A"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, color: "#15803d" }}>{orderDetails?.amount || "N/A"}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.55)", marginTop: "2px" }}>{orderDetails?.payment || delivery.payment || "N/A"}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: "190px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={orderDetails?.address || delivery.address || "N/A"}>
                              {orderDetails?.address || delivery.address || "N/A"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getStatusStyle(delivery.status) }}>{delivery.status}</span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr style={styles.tr}>
                        <td colSpan="8" style={{ ...styles.td, textAlign: "center", padding: "28px", color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>
                          No delivered items yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "Payments" ? (
          <div style={styles.dashboardContainer}>
            {/* Payments Stats Grid */}
            <div style={styles.statsGrid}>
              {mockPaymentStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Transactions Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Transactions</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search transactions..." value={paymentSearchTerm} onChange={(e) => setPaymentSearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Transaction ID</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Method</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactionsList.map((txn) => (
                        <tr key={txn.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{txn.id}</td>
                          <td style={styles.td}>{txn.customer}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                              {txn.method === "GCash" ? <span style={{ color: "#0284c7" }}>GCash</span> : txn.method === "Maya" ? <span style={{ color: "#16a34a" }}>Maya</span> : txn.method}
                            </div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: "#15803d" }}>{txn.amount}</td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getPaymentStatusStyle(txn.status) }}>{txn.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedPaymentTxn(txn)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - Analytics & Export */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Export Options */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Financial Reports</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#15803d", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <FileText size={16} /> Export CSV Report
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <Download size={16} /> Download Invoices (PDF)
                    </button>
                  </div>
                </div>

                {/* AI Financial Insights */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <BarChart2 size={18} color="#b45309" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "#b45309" }}>AI Financial Insights</h3>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "rgba(0,0,0,0.7)", fontSize: "12px", lineHeight: 1.6 }}>
                    <li>Projected monthly revenue to increase by <strong>12%</strong> based on subscription renewals.</li>
                    <li>GCash transactions represent <strong>45%</strong> of all payments.</li>
                    <li>Low risk of fraud detected this week.</li>
                  </ul>
                </div>
                
                {/* Method Breakdown Chart Mock */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Payment Methods</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { label: "GCash", pct: "45%", color: "#0284c7" },
                      { label: "Credit Card", pct: "30%", color: "#8b5cf6" },
                      { label: "Cash on Delivery", pct: "15%", color: "#16a34a" },
                      { label: "Maya", pct: "10%", color: "#f59e0b" },
                    ].map(item => (
                      <div key={item.label} style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.7)", marginBottom: "4px" }}>
                          <span>{item.label}</span>
                          <span>{item.pct}</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                          <div style={{ width: item.pct, height: "100%", background: item.color, borderRadius: "999px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Subscriptions" ? (
          <div style={styles.dashboardContainer}>
            {/* Subscriptions Stats Grid */}
            <div style={styles.statsGrid}>
              {mockSubscriptionStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Plans Management Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "8px" }}>
              {mockPlans.map(plan => (
                <div key={plan.name} className="inner-blur-glass" style={{ ...styles.chartCard, background: plan.bg, padding: "20px", border: `1px solid ${plan.color}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: plan.color, margin: 0 }}>{plan.name}</h3>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#000" }}>{plan.price}</span>
                  </div>
                  <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>
                        <CheckCircle size={14} color={plan.color} /> {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <div><strong style={{ fontSize: "15px", color: "#000" }}>{plan.users}</strong> <span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Users</span></div>
                    <div style={{ color: "#15803d", fontWeight: 800 }}>{plan.revenue} MRR</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Subscribers Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Subscribers</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search users..." value={subSearchTerm} onChange={(e) => setSubSearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "130px" }}>
                        <AdminEcoDropdown value={subPlanFilter} options={[{ value: "All", label: "All Plans" }, ...subscriptionPlanOptions]} onChange={setSubPlanFilter} compact align="right" />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "600px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>User</th>
                        <th style={styles.th}>Plan</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Renewal Date</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((sub) => (
                        <tr key={sub.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.05)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                                {sub.user.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{sub.user}</div>
                                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>{sub.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: sub.plan === "Pro" ? "#b45309" : sub.plan === "Enterprise" ? "#0284c7" : "#475569" }}>{sub.plan}</td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getSubStatusStyle(sub.status) }}>{sub.status}</span>
                          </td>
                          <td style={{ ...styles.td, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{sub.renewal}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleOpenSubscriber(sub)} style={{ ...styles.actionBtn, color: "#8b5cf6", background: "rgba(139,92,246,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - MRR Chart & Promos */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px" }}>Recurring Revenue Growth</h3>
                  <div style={styles.chartWrapper}>
                    <svg viewBox="0 0 400 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="subRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
                          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 120 L 0 100 C 50 90, 100 110, 150 70 S 250 80, 300 30 S 350 40, 400 10 L 400 120 Z" fill="url(#subRevGrad)" />
                      <path d="M 0 100 C 50 90, 100 110, 150 70 S 250 80, 300 30 S 350 40, 400 10" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="400" cy="10" r="5" fill="#fff" stroke="#8b5cf6" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Tag size={18} color="#059669" />
                      <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "#059669" }}>Active Promo Campaigns</h3>
                    </div>
                    <button onClick={() => setEditingPromo({ isNew: true, code: "", type: "percent", value: 0, desc: "" })} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>+ Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
                    {(promoCodes || []).map(promo => (
                      <div key={promo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.6)", padding: "10px", borderRadius: "10px", border: "1px dashed #10b981" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#047857" }}>{promo.code} {promo.type !== 'shipping' && <span style={{fontSize: "10px", color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px"}}>{promo.type === 'percent' ? `${promo.value}%` : `₱${promo.value}`}</span>}</div>
                          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{promo.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d" }}>{promo.uses || 0} Uses</span>
                          <button onClick={() => setEditingPromo(promo)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#0ea5e9" }}><Edit2 size={14}/></button>
                          <button onClick={() => setPromoCodes((promoCodes || []).filter(p => p.id !== promo.id))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#dc2626" }}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Events & Workshops" ? (
          <div style={styles.dashboardContainer}>
            {/* Events Stats Grid */}
            <div style={styles.statsGrid}>
              {mockEventStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Events Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Event Management</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search events..." value={eventSearchTerm} onChange={(e) => setEventSearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                        <option value="All">All Types</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Community">Community</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "650px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Event Title</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Date & Time</th>
                        <th style={styles.th}>Attendees</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventsList.map((ev) => (
                        <tr key={ev.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                              {ev.type === "Workshop" ? <Ticket size={14} color="#8b5cf6" /> : ev.type === "Webinar" ? <Video size={14} color="#0284c7" /> : <Users size={14} color="#16a34a" />}
                              <span style={{ color: ev.type === "Workshop" ? "#8b5cf6" : ev.type === "Webinar" ? "#0284c7" : "#16a34a" }}>{ev.type}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600 }}>{ev.date}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>{ev.time}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 600 }}>{ev.attendees} / {ev.maxAttendees}</span>
                              <div style={{ width: "60px", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                                <div style={{ width: `${Math.min((ev.attendees / ev.maxAttendees) * 100, 100)}%`, height: "100%", background: ev.attendees >= ev.maxAttendees ? "#eab308" : "#16a34a", borderRadius: "999px" }} />
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getEventStatusStyle(ev.status) }}>{ev.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedEvent(ev)} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - Event Tools */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#15803d", marginBottom: "16px" }}>Event Tools</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={handleCreateNewEvent} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}>
                      <CalendarDays size={16} /> Create New Event
                    </button>
                    <button onClick={handleGenerateCertificates} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <FileText size={16} /> Generate Certificates
                    </button>
                    <button onClick={handleExportAttendees} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <Users size={16} /> Export Attendee List
                    </button>
                  </div>
                </div>

                {/* Mini Calendar Mock */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Upcoming Schedule</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", color: "#15803d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Jun</span>
                        <span style={{ fontSize: "16px", fontWeight: 800 }}>15</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>Urban Hydroponics</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>09:00 AM • Baguio City Hall</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(2,132,199,0.1)", color: "#0284c7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Jul</span>
                        <span style={{ fontSize: "16px", fontWeight: 800 }}>10</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>Sustainable Pest Mgt.</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>02:00 PM • Online (Zoom)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Seasonal Harvests" ? (
          <div style={styles.dashboardContainer}>
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Manage Seasonal Harvests</h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                    <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                    <input type="text" placeholder="Search crops..." value={harvestSearchTerm} onChange={(e) => setHarvestSearchTerm(e.target.value)} style={styles.searchInput} />
                  </div>
                  <button onClick={handleAddHarvest} style={{ ...styles.textBtn, background: "#16a34a", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Add Crop</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>Total Crops</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#16a34a" }}>{harvests?.length || 0}</div>
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>High Demand</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#eab308" }}>{harvests?.filter(h => h.demand === "High Demand").length || 0}</div>
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>Est. Revenue Opps</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0284c7" }}>₱{((harvests?.length || 0) * 150000).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "900px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Crop Info</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Peak Month</th>
                      <th style={styles.th}>Demand & Price</th>
                      <th style={styles.th}>Environment</th>
                      <th style={styles.th}>Conditions</th>
                      <th style={styles.th}>Growth & Est. Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingHarvest && editingHarvest.isNew && (
                      <tr style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input type="text" value={editingHarvest.icon} onChange={(e) => setEditingHarvest({...editingHarvest, icon: e.target.value})} style={{...styles.editInput, width: "40px"}} placeholder="Icon" />
                            <input type="text" value={editingHarvest.name} onChange={(e) => setEditingHarvest({...editingHarvest, name: e.target.value})} style={styles.editInput} placeholder="Crop Name" />
                          </div>
                        </td>
                        <td style={styles.td}><input type="text" value={editingHarvest.category} onChange={(e) => setEditingHarvest({...editingHarvest, category: e.target.value})} style={{...styles.editInput, width: "80px"}} placeholder="Category" /></td>
                        <td style={styles.td}><input type="text" value={editingHarvest.peak} onChange={(e) => setEditingHarvest({...editingHarvest, peak: e.target.value})} style={{...styles.editInput, width: "80px"}} placeholder="Peak Month" /></td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <select value={editingHarvest.demand} onChange={(e) => setEditingHarvest({...editingHarvest, demand: e.target.value})} style={styles.editInput}>
                              <option value="High Demand">High Demand</option>
                              <option value="Medium Demand">Medium Demand</option>
                              <option value="Low Demand">Low Demand</option>
                            </select>
                            <input type="text" value={editingHarvest.priceTrend} onChange={(e) => setEditingHarvest({...editingHarvest, priceTrend: e.target.value})} style={styles.editInput} placeholder="Price Trend" />
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <input type="text" value={editingHarvest.weather} onChange={(e) => setEditingHarvest({...editingHarvest, weather: e.target.value})} style={styles.editInput} placeholder="Weather (e.g. Sunny ☀️)" />
                            <input type="text" value={editingHarvest.temp} onChange={(e) => setEditingHarvest({...editingHarvest, temp: e.target.value})} style={styles.editInput} placeholder="Temp (e.g. 20-28°C)" />
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <select value={editingHarvest.water} onChange={(e) => setEditingHarvest({...editingHarvest, water: e.target.value})} style={styles.editInput}>
                              <option value="High">High Water</option>
                              <option value="Medium">Medium Water</option>
                              <option value="Low">Low Water</option>
                            </select>
                            <input type="text" value={editingHarvest.soil} onChange={(e) => setEditingHarvest({...editingHarvest, soil: e.target.value})} style={styles.editInput} placeholder="Soil (e.g. Loamy)" />
                            <select value={editingHarvest.pestRisk} onChange={(e) => setEditingHarvest({...editingHarvest, pestRisk: e.target.value})} style={styles.editInput}>
                              <option value="High">High Pest Risk</option>
                              <option value="Medium">Medium Pest Risk</option>
                              <option value="Low">Low Pest Risk</option>
                            </select>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="range" min="0" max="100" value={editingHarvest.growthProgress} onChange={(e) => setEditingHarvest({...editingHarvest, growthProgress: parseInt(e.target.value) || 0})} style={{ width: "120px" }} />
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>{editingHarvest.growthProgress}%</span>
                          </div>
                          <input type="text" value={editingHarvest.estDate} onChange={(e) => setEditingHarvest({...editingHarvest, estDate: e.target.value})} style={{...styles.editInput, marginTop: "4px"}} placeholder="Est Date" />
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={handleSaveHarvest} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "6px 12px", fontWeight: "bold" }}>Save</button>
                            <button onClick={() => setEditingHarvest(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filteredAdminHarvests.map((h) => (
                      <tr key={h.id} style={styles.tr}>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input type="text" value={editingHarvest.icon} onChange={(e) => setEditingHarvest({...editingHarvest, icon: e.target.value})} style={{...styles.editInput, width: "40px"}} />
                              <input type="text" value={editingHarvest.name} onChange={(e) => setEditingHarvest({...editingHarvest, name: e.target.value})} style={styles.editInput} />
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "20px" }}>{h.icon}</span>
                              <span style={{ fontWeight: 700 }}>{h.name}</span>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <input type="text" value={editingHarvest.category} onChange={(e) => setEditingHarvest({...editingHarvest, category: e.target.value})} style={{...styles.editInput, width: "80px"}} />
                          ) : (
                            h.category
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <input type="text" value={editingHarvest.peak} onChange={(e) => setEditingHarvest({...editingHarvest, peak: e.target.value})} style={{...styles.editInput, width: "80px"}} />
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", background: "rgba(22,163,74,0.1)", color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>{h.peak}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <select value={editingHarvest.demand} onChange={(e) => setEditingHarvest({...editingHarvest, demand: e.target.value})} style={styles.editInput}>
                                <option value="High Demand">High Demand</option>
                                <option value="Medium Demand">Medium Demand</option>
                                <option value="Low Demand">Low Demand</option>
                              </select>
                              <input type="text" value={editingHarvest.priceTrend} onChange={(e) => setEditingHarvest({...editingHarvest, priceTrend: e.target.value})} style={styles.editInput} placeholder="Price Trend" />
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ padding: "4px 8px", borderRadius: "999px", background: h.demand === "High Demand" ? "rgba(225,29,72,0.1)" : "rgba(245,158,11,0.1)", color: h.demand === "High Demand" ? "#e11d48" : "#f59e0b", fontSize: "11px", fontWeight: 700, width: "fit-content" }}>{h.demand}</span>
                              <span style={{ color: "#0284c7", fontWeight: 600, fontSize: "12px" }}>{h.priceTrend}</span>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <input type="text" value={editingHarvest.weather} onChange={(e) => setEditingHarvest({...editingHarvest, weather: e.target.value})} style={styles.editInput} placeholder="Weather (e.g. Sunny ☀️)" />
                              <input type="text" value={editingHarvest.temp} onChange={(e) => setEditingHarvest({...editingHarvest, temp: e.target.value})} style={styles.editInput} placeholder="Temp (e.g. 20-28°C)" />
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontSize: "12px", fontWeight: 600 }}>{h.weather}</div>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)" }}>{h.temp}</div>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <select value={editingHarvest.water} onChange={(e) => setEditingHarvest({...editingHarvest, water: e.target.value})} style={styles.editInput}>
                                <option value="High">High Water</option>
                                <option value="Medium">Medium Water</option>
                                <option value="Low">Low Water</option>
                              </select>
                              <input type="text" value={editingHarvest.soil} onChange={(e) => setEditingHarvest({...editingHarvest, soil: e.target.value})} style={styles.editInput} placeholder="Soil (e.g. Loamy)" />
                              <select value={editingHarvest.pestRisk} onChange={(e) => setEditingHarvest({...editingHarvest, pestRisk: e.target.value})} style={styles.editInput}>
                                <option value="High">High Pest Risk</option>
                                <option value="Medium">Medium Pest Risk</option>
                                <option value="Low">Low Pest Risk</option>
                              </select>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>💧 {h.water} | 🌱 {h.soil}</div>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>🐛 Pest: <span style={{ color: h.pestRisk === 'High' ? '#dc2626' : h.pestRisk === 'Medium' ? '#f59e0b' : '#16a34a' }}>{h.pestRisk}</span></div>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input type="range" min="0" max="100" value={editingHarvest.growthProgress} onChange={(e) => setEditingHarvest({...editingHarvest, growthProgress: parseInt(e.target.value) || 0})} style={{ width: "120px" }} />
                                <span style={{ fontSize: "12px", fontWeight: 700 }}>{editingHarvest.growthProgress}%</span>
                              </div>
                              <input type="text" value={editingHarvest.estDate} onChange={(e) => setEditingHarvest({...editingHarvest, estDate: e.target.value})} style={styles.editInput} placeholder="Est Date" />
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "100px", height: "4px", background: "rgba(0,0,0,0.1)", borderRadius: "999px" }}>
                                  <div style={{ width: `${h.growthProgress}%`, height: "100%", background: "#16a34a", borderRadius: "999px" }} />
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 700 }}>{h.growthProgress}%</span>
                              </div>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Est: {h.estDate}</div>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={handleSaveHarvest} style={{ ...styles.actionBtn, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                              <button onClick={() => setEditingHarvest(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleEditHarvest(h)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }}><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteHarvest(h.id)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }}><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "AI Plant Doctor" ? (
          <div style={styles.dashboardContainer}>
            {/* AI Stats Grid */}
            <div style={styles.statsGrid}>
              {mockAIStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Diagnosis Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Recent Diagnoses</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search plant or disease..." value={scanSearchTerm} onChange={(e) => setScanSearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <select value={scanStatusFilter} onChange={(e) => setScanStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                        <option value="All">All Statuses</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Disease Detected">Disease Detected</option>
                        <option value="Critical">Critical</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "650px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Scan ID</th>
                        <th style={styles.th}>Plant / Disease</th>
                        <th style={styles.th}>Confidence</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScansList.map((scan) => (
                        <tr key={scan.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{scan.id}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 700, fontSize: "13px" }}>{scan.plant}</span>
                              <span style={{ fontSize: "11px", color: scan.disease === "None" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{scan.disease}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 800 }}>{scan.confidence}</span>
                              <div style={{ width: "40px", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                                <div style={{ width: scan.confidence, height: "100%", background: parseInt(scan.confidence) > 90 ? "#16a34a" : "#f59e0b", borderRadius: "999px" }} />
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getScanStatusStyle(scan.status) }}>{scan.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedScan(scan)} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><Eye size={12} style={{ marginRight: "4px" }} /> View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - AI Insights & Database */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#0284c7", marginBottom: "16px" }}>AI System Status</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(2,132,199,0.3)" }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>Neural Engine Active</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>V.2.4 (Philippine Climate Model)</div>
                    </div>
                  </div>
                  <button style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#fff", border: "1px solid rgba(2,132,199,0.2)", color: "#0284c7", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><RefreshCcw size={14} /> Update AI Models</button>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Disease Library</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {mockDiseaseDatabase.map((disease, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <div><div style={{ fontSize: "13px", fontWeight: 700 }}>{disease.name}</div><div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{disease.crop}</div></div>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: disease.severity === "High" ? "#dc2626" : "#f59e0b", padding: "2px 6px", borderRadius: "4px", background: disease.severity === "High" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)" }}>{disease.severity}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: "100%", padding: "10px", marginTop: "12px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", border: "none", color: "#15803d", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Manage Database</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Reports & Analytics" ? (
          <div style={styles.dashboardContainer}>
            {/* Analytics Stats Grid */}
            <div style={styles.statsGrid}>
              {mockAnalyticsStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Main Revenue Chart */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Revenue & Growth</h3>
                    <select style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, outline: "none" }}>
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                  <div style={{ width: "100%", height: "220px", overflow: "visible" }}>
                    <svg viewBox="0 0 600 220" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="mainRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(14,165,233,0.3)" />
                          <stop offset="100%" stopColor="rgba(14,165,233,0)" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      {[0, 50, 100, 150, 200].map(y => (
                        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      ))}
                      {/* Data Path */}
                      <path d="M 0 200 L 0 150 C 50 140, 100 180, 150 120 S 250 130, 300 80 S 400 90, 450 40 S 550 50, 600 10 L 600 200 Z" fill="url(#mainRevGrad)" />
                      <path d="M 0 150 C 50 140, 100 180, 150 120 S 250 130, 300 80 S 400 90, 450 40 S 550 50, 600 10" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="600" cy="10" r="6" fill="#fff" stroke="#0ea5e9" strokeWidth="3" />
                    </svg>
                  </div>
                </div>

                {/* Smart AI Insights */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <Zap size={20} color="#8b5cf6" fill="rgba(139,92,246,0.2)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#6d28d9" }}>Smart AI Insights</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {mockAIInsights.map((insight, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.03)" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: insight.color, marginTop: "6px", boxShadow: `0 0 0 4px ${insight.bg}` }} />
                        <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.8)", lineHeight: 1.5, fontWeight: 500 }}>{insight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", marginBottom: "16px" }}>User Retention</h3>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "80px" }}>
                      {["60%", "65%", "72%", "81%", "85%", "88%"].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,0.03)", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: "100%", height: h, background: "linear-gradient(0deg, #0ea5e9, #38bdf8)", borderRadius: "6px" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", marginBottom: "16px" }}>Delivery Success</h3>
                    <div style={{ position: "relative", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "conic-gradient(#16a34a 0% 92%, #e2e8f0 92% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#15803d" }}>92%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Eco Impact Dashboard */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", background: "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#15803d", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><Leaf size={18} /> Eco Impact Tracking</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Organic Products Sold</span> <span style={{ color: "#15803d" }}>15,240</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "85%", height: "100%", background: "#16a34a", borderRadius: "999px" }} /></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Farmers Supported</span> <span style={{ color: "#15803d" }}>3,500</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "70%", height: "100%", background: "#16a34a", borderRadius: "999px" }} /></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Waste Reduced</span> <span style={{ color: "#15803d" }}>1.5 Tons</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "45%", height: "100%", background: "#16a34a", borderRadius: "999px" }} /></div>
                    </div>
                  </div>
                </div>

                {/* Regional Performance */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><Globe size={18} color="#0284c7" /> Regional Performance</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {mockRegionalData.map(region => (
                      <div key={region.region} style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.8)", marginBottom: "6px" }}>
                          <span>{region.region}</span>
                          <span>{region.pct}</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                          <div style={{ width: region.pct, height: "100%", background: region.color, borderRadius: "999px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automated Report Generator */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Generate Reports</h3>
                  <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", marginBottom: "16px", lineHeight: 1.5 }}>Export enterprise-level financial and environmental metrics for investors and partners.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}><Download size={16}/> Export Full PDF</button>
                    <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}><FileText size={16}/> Download Raw CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Content Management" ? (
          <div style={styles.dashboardContainer}>
            {/* Content Stats Grid */}
            <div style={styles.statsGrid}>
              {mockContentStats.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Content CMS Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Content Library</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)" }}>
                      <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <input type="text" placeholder="Search content..." value={contentSearchTerm} onChange={(e) => setContentSearchTerm(e.target.value)} style={styles.searchInput} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 600 }}>
                        <option value="All">All Types</option>
                        <option value="Article">Article</option>
                        <option value="Page">Page</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Component">Component</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "650px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Last Updated</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContentList.map((cnt) => (
                        <tr key={cnt.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{cnt.title}</td>
                          <td style={styles.td}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>{cnt.type}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getContentStatusStyle(cnt.status) }}>{cnt.status}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600 }}>{cnt.date}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>by {cnt.author}</div>
                          </td>
                          <td style={styles.td}>
                            <button style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><Edit2 size={12} style={{ marginRight: "4px" }} /> Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - Actions & AI */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* AI Generator Box */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Wand2 size={18} color="#7c3aed" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "#7c3aed", margin: 0 }}>AI Content Generator</h3>
                  </div>
                  <textarea 
                    placeholder="e.g. Write a 500-word article about the benefits of organic fertilizers in urban farming..." 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.2)", background: "rgba(255,255,255,0.8)", fontSize: "12px", resize: "none", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <button style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
                    Generate Content ✨
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Quick Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#15803d", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Edit2 size={16} /> Create New Article</button>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Layout size={16} /> Edit Homepage</button>
                    <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(245,158,11,0.1)", color: "#b45309", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Megaphone size={16} /> Post Announcement</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Media Library */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}><Image size={18} color="#0ea5e9"/> Media Library</h3>
                <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                  <Plus size={14} /> Upload Media
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} style={{ aspectRatio: "1/1", borderRadius: "12px", background: "rgba(0,0,0,0.03)", border: "1px dashed rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    {i % 3 === 0 ? <Play size={24} color="rgba(0,0,0,0.2)" /> : <Image size={24} color="rgba(0,0,0,0.2)" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          activeTab === "Settings" ? (
            <div style={styles.dashboardContainer}>
              {/* Settings Stats Grid */}
              <div style={styles.statsGrid}>
                {mockSettingsStats.map((stat, idx) => (
                  <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={styles.statIconWrap}>{stat.icon}</div>
                      <span style={{ ...styles.trendBadge, color: stat.up ? "#15803d" : "#e11d48", background: stat.up ? "rgba(22, 163, 74, 0.1)" : "rgba(225, 29, 72, 0.1)" }}>
                        {stat.up ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {stat.trend}
                      </span>
                    </div>
                    <div style={styles.statValue}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
  
              <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px" }}>
                {/* Settings Sidebar */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { id: "General", icon: <Layout size={16} /> },
                    { id: "Security & Roles", icon: <ShieldCheck size={16} /> },
                    { id: "Payments", icon: <CreditCard size={16} /> },
                    { id: "AI & Models", icon: <Zap size={16} /> },
                    { id: "Appearance", icon: <Image size={16} /> },
                    { id: "Database & Backups", icon: <Database size={16} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                        background: activeSettingsTab === tab.id ? "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.05))" : "transparent",
                        color: activeSettingsTab === tab.id ? "#15803d" : "rgba(0,0,0,0.6)",
                        boxShadow: activeSettingsTab === tab.id ? "0 4px 12px rgba(22,163,74,0.05)" : "none"
                      }}
                    >
                      {tab.icon} {tab.id}
                    </button>
                  ))}
                </div>
  
                {/* Settings Content */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "32px", minHeight: "500px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "20px", margin: 0 }}>{activeSettingsTab}</h3>
                    <button style={{ padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                  
                  {activeSettingsTab === "General" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Platform Name</label>
                           <input type="text" defaultValue="EcoEquity" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Support Email</label>
                           <input type="email" defaultValue="support@ecoequity.ph" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Maintenance Mode</label>
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                           <div>
                             <div style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "4px" }}>Enable Maintenance Mode</div>
                             <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Restrict public access while updating the platform. Admins can still log in.</div>
                           </div>
                           <div style={{ width: "44px", height: "24px", background: "rgba(0,0,0,0.1)", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                             <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s" }} />
                           </div>
                         </div>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Security & Roles" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700 }}>Admin Accounts & Roles</h4>
                         <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                           <thead>
                             <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.5)" }}>
                               <th style={{ padding: "12px 8px" }}>Name</th>
                               <th style={{ padding: "12px 8px" }}>Role</th>
                               <th style={{ padding: "12px 8px" }}>2FA Status</th>
                               <th style={{ padding: "12px 8px" }}>Action</th>
                             </tr>
                           </thead>
                           <tbody>
                             <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                               <td style={{ padding: "12px 8px", fontWeight: 600 }}>Juan Dela Cruz (You)</td>
                               <td style={{ padding: "12px 8px", color: "#b45309", fontWeight: 700 }}>Super Admin</td>
                               <td style={{ padding: "12px 8px", color: "#16a34a", fontWeight: 600 }}>Enabled</td>
                               <td style={{ padding: "12px 8px" }}><button style={{ ...styles.actionBtn, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Edit</button></td>
                             </tr>
                           </tbody>
                         </table>
                         <button style={{ marginTop: "16px", padding: "10px 16px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", border: "1px dashed #16a34a", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%" }}>+ Add New Admin</button>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Payments" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                       <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                           <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "18px" }}>PM</div>
                           <div>
                             <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>PayMongo Integration</div>
                             <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Accept GCash, Maya, and Credit Cards</div>
                           </div>
                         </div>
                         <button style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(22,163,74,0.1)", color: "#15803d", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Configure API</button>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "AI & Models" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Plant Doctor Confidence Threshold</label>
                         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                           <input type="range" min="50" max="99" defaultValue="85" style={{ flex: 1, accentColor: "#16a34a" }} />
                           <span style={{ fontSize: "14px", fontWeight: 800, color: "#15803d", width: "40px", textAlign: "right" }}>85%</span>
                         </div>
                         <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "8px" }}>Diagnoses below this threshold will be flagged as "Under Review" for human agronomist verification.</p>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Active Neural Model</label>
                         <select style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}>
                           <option>Verde-Agri-V2.4 (Optimized for PH Climate)</option>
                           <option>Verde-Agri-V2.3 (Legacy)</option>
                         </select>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Appearance" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Theme Mode</label>
                         <div style={{ display: "flex", gap: "16px" }}>
                           <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid #16a34a", background: "rgba(255,255,255,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#0f172a" }}>Light Mode</div>
                           <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid transparent", background: "rgba(15,23,42,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#fff" }}>Dark Mode</div>
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Accent Color</label>
                         <div style={{ display: "flex", gap: "12px" }}>
                           {["#16a34a", "#0284c7", "#8b5cf6", "#f59e0b", "#e11d48"].map(color => (
                             <div key={color} style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, cursor: "pointer", border: color === "#16a34a" ? "3px solid #fff" : "none", boxShadow: color === "#16a34a" ? `0 0 0 2px ${color}` : "none" }} />
                           ))}
                         </div>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Database & Backups" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(22,163,74,0.05)" }}>
                         <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "#15803d" }}>Automated Backups</h4>
                         <p style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Your database is automatically backed up every day at 12:00 AM UTC. You can also trigger a manual backup below.</p>
                         <div style={{ display: "flex", gap: "12px" }}>
                           <button style={{ padding: "10px 16px", borderRadius: "10px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Backup Now</button>
                           <button style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Restore from Backup</button>
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Data Export</label>
                         <button style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Export Full System Data (CSV)</button>
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.placeholderContainer}>
              <div style={{ width: "64px", height: "64px", background: "rgba(22,163,74,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d", marginBottom: "16px" }}>
                <Settings size={32} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#000", margin: "0 0 8px" }}>{activeTab} Management</h2>
              <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "14px", maxWidth: "300px", textAlign: "center", margin: 0 }}>
                This module is currently in development. You will be able to manage {activeTab.toLowerCase()} settings here soon.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
    background: "#fee2e2", // light red
    border: "1px solid #ef4444", // red
    color: "#b91c1c", // dark red
    padding: "12px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 10px 25px rgba(220, 38, 38, 0.2)",
    animation: "fadeIn 0.3s ease-out",
  },
  container: {
    display: "flex",
    width: "100%",
    minWidth: "1200px", // Fixed width to prevent resizing
    height: "100%",
    background: "transparent", // relies on the parent shell's glass effect
    overflowX: "auto",
    overflowY: "hidden",
  },
  sidebar: {
    width: "220px",
    height: "calc(100% - 40px)",
    margin: "20px 0 20px 20px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    flexShrink: 0,
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  logoBadge: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "rgba(22, 163, 74, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  sidebarNav: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid transparent",
    color: "rgba(0,0,0,0.6)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(134,239,172,0.25), rgba(125,211,252,0.25))",
    color: "#064e3b",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(34,197,94,0.1)",
  },
  sidebarFooter: {
    padding: "20px",
    borderTop: "1px solid rgba(0,0,0,0.05)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(220, 38, 38, 0.08)",
    border: "1px solid rgba(220, 38, 38, 0.15)",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    margin: "20px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    overflowY: "auto",
    position: "relative",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "rgba(255,255,255,0.4)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  pageTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "6px 12px",
    borderRadius: "999px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "12px",
    width: "140px",
  },
  iconBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.08)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.7)",
    cursor: "pointer",
  },
  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#ef4444",
  },
  adminProfile: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #16a34a, #0284c7)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
    cursor: "pointer",
  },
  dashboardContainer: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
  },
  statCard: {
    padding: "16px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
  statIconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  trendBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 6px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
  },
  statValue: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#000",
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.5)",
    fontWeight: 600,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  chartCard: {
    padding: "16px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
  },
  cardHeading: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
  },
  chartWrapper: {
    width: "100%",
    height: "140px",
    marginTop: "16px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  textBtn: {
    background: "transparent",
    border: "none",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    marginTop: "12px",
  },
  tr: {
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  editInput: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.2)",
    fontSize: "12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  actionBtn: {
    padding: "6px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  },
  th: {
    padding: "10px",
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.5)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 10px",
    fontSize: "12px",
    color: "#000",
    borderBottom: "1px solid rgba(0,0,0,0.02)",
    whiteSpace: "nowrap",
  },
  placeholderContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  }
};
