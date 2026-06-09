import React, { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { initialSubscriptionPlans } from "../subscriptionPlans";
import { 
  LayoutDashboard, Users, ShieldCheck, Box, ShoppingCart, 
  Truck, CreditCard, Repeat, CalendarDays, 
  BarChart2, FileText, Settings, LogOut, 
  Search, Bell, TrendingUp, TrendingDown, CheckCircle, XCircle, Edit2, Save, X, Image, AlertCircle, Trash2, Eye, Clock, MapPin, Phone, Package, Filter, Navigation, UserCheck, MessageSquare, Leaf, RefreshCcw, Download, Zap, Crown, Activity, Tag, Ticket, Video, Globe, Megaphone, Layout, Database, Wheat, Send
=======
import { 
  LayoutDashboard, Users, ShieldCheck, Box, ShoppingCart, 
  Truck, CreditCard, Repeat, CalendarDays, Stethoscope, 
  BarChart2, FileText, Settings, LogOut, 
  Search, Bell, TrendingUp, TrendingDown, CheckCircle, XCircle, Edit2, Save, X, Image, AlertCircle, Trash2, Eye, Clock, MapPin, Phone, Package, Filter, Navigation, UserCheck, MessageSquare, Route, Leaf, RefreshCcw, Download, Zap, Crown, Activity, Tag, Ticket, Video, Scan, Target, Bug, Thermometer, PieChart, Globe, Lightbulb, Megaphone, Wand2, Layout, Plus, Play, Database, Wheat, Send
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
} from "lucide-react";

const mockStats = [
  { label: "Total Users", value: "15,243", trend: "+12%", up: true, icon: <Users size={16} color="#15803d" /> },
  { label: "Total Orders", value: "3,492", trend: "+8%", up: true, icon: <ShoppingCart size={16} color="#0284c7" /> },
  { label: "Total Revenue", value: "₱2.4M", trend: "+15%", up: true, icon: <CreditCard size={16} color="#b45309" /> },
  { label: "Pending Deliveries", value: "142", trend: "-3%", up: false, icon: <Truck size={16} color="#be123c" /> },
  { label: "Active Farmers", value: "3,500+", trend: "+5%", up: true, icon: <ShieldCheck size={16} color="#15803d" /> },
<<<<<<< HEAD
  { label: "Upcoming Events", value: "12", trend: "+2", up: true, icon: <CalendarDays size={16} color="#0369a1" /> },
];

const ORDERS_STORAGE_KEY = "verdeversity_orders";
const ADMIN_SETTINGS_STORAGE_KEY = "verdeversity_admin_settings";
const SUPPLIER_ITEMS_STORAGE_KEY = "verdeversity_supplier_items";

const DEFAULT_ADMIN_SETTINGS = {
  general: {
    platformName: "EcoEquity",
    supportEmail: "support@ecoequity.ph",
    maintenanceMode: false,
  },
  admins: [
    { id: "ADM-001", name: "Juan Dela Cruz", email: "admin@ecoequity.com", role: "Super Admin", twoFactor: true, status: "Active" },
  ],
  payments: {
    payMongoEnabled: true,
    publicKey: "pk_test_ecoequity",
    webhookUrl: "https://ecoequity.ph/api/paymongo/webhook",
    settlementAccount: "EcoEquity Operations",
  },
  appearance: {
    themeMode: "Light",
    accentColor: "#16a34a",
  },
  backups: {
    lastBackup: "",
    lastRestore: "",
    history: [],
  },
};

const mergeAdminSettings = (savedSettings = {}) => ({
  general: { ...DEFAULT_ADMIN_SETTINGS.general, ...(savedSettings.general || {}) },
  admins: Array.isArray(savedSettings.admins) && savedSettings.admins.length > 0 ? savedSettings.admins : DEFAULT_ADMIN_SETTINGS.admins,
  payments: { ...DEFAULT_ADMIN_SETTINGS.payments, ...(savedSettings.payments || {}) },
  appearance: { ...DEFAULT_ADMIN_SETTINGS.appearance, ...(savedSettings.appearance || {}) },
  backups: {
    ...DEFAULT_ADMIN_SETTINGS.backups,
    ...(savedSettings.backups || {}),
    history: Array.isArray(savedSettings.backups?.history) ? savedSettings.backups.history : DEFAULT_ADMIN_SETTINGS.backups.history,
  },
});
=======
  { label: "AI Diagnoses", value: "12,845", trend: "+22%", up: true, icon: <Stethoscope size={16} color="#0369a1" /> },
];

const ORDERS_STORAGE_KEY = "verdeversity_orders";
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

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
<<<<<<< HEAD
  { text: "Seasonal harvest demand increased for tomatoes and leafy greens.", time: "1 hr ago", color: "#eab308" },
=======
  { text: "High volume of AI diagnoses detected for 'Tomato Blight'.", time: "1 hr ago", color: "#eab308" },
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
const mockSubscribers = [
  { id: "SUB-001", user: "Maria Clara", email: "maria@example.com", plan: "Pro", status: "Active", renewal: "Jun 15, 2026", payment: "GCash", joined: "Jan 10, 2026", monthlyUsage: 85, usageLimit: 100 },
  { id: "SUB-002", user: "Juan Dela Cruz", email: "juan@example.com", plan: "Basic", status: "Active", renewal: "N/A", payment: "Free", joined: "Feb 05, 2026", monthlyUsage: 8, usageLimit: 10 },
  { id: "SUB-003", user: "Healthy Eats Cafe", email: "contact@healthyeats.com", plan: "Enterprise", status: "Active", renewal: "Dec 01, 2026", payment: "Bank Transfer", joined: "Dec 01, 2025", monthlyUsage: 1250, usageLimit: 5000 },
  { id: "SUB-004", user: "Urban Roots", email: "hello@urbanroots.ph", plan: "Pro", status: "Pending Renewal", renewal: "May 30, 2026", payment: "Credit Card", joined: "May 30, 2025", monthlyUsage: 100, usageLimit: 100 },
  { id: "SUB-005", user: "Reyes Organic", email: "admin@reyesorganic.com", plan: "Pro", status: "Cancelled", renewal: "May 15, 2026", payment: "Maya", joined: "Oct 12, 2025", monthlyUsage: 20, usageLimit: 100 },
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
const mockEventAttendees = {
  "EVT-001": [
    { id: "ATT-1001", name: "Maria Clara", email: "maria@example.com", ticket: "Workshop Pass", status: "Checked In", payment: "Paid", registeredAt: "Jun 01, 2026" },
    { id: "ATT-1002", name: "Juan Dela Cruz", email: "juan@example.com", ticket: "Workshop Pass", status: "Registered", payment: "Paid", registeredAt: "Jun 02, 2026" },
    { id: "ATT-1003", name: "Urban Roots", email: "hello@urbanroots.ph", ticket: "Group Seat", status: "Registered", payment: "Paid", registeredAt: "Jun 03, 2026" },
    { id: "ATT-1004", name: "Isabella Cruz", email: "isabella@example.com", ticket: "Student Seat", status: "Pending", payment: "Pending", registeredAt: "Jun 03, 2026" },
  ],
  "EVT-002": [
    { id: "ATT-2001", name: "Healthy Eats Cafe", email: "contact@healthyeats.com", ticket: "Webinar Access", status: "Registered", payment: "Free", registeredAt: "Jun 12, 2026" },
    { id: "ATT-2002", name: "Reyes Organic Farm", email: "admin@reyesorganic.com", ticket: "Webinar Access", status: "Registered", payment: "Free", registeredAt: "Jun 14, 2026" },
    { id: "ATT-2003", name: "Green Valley Co.", email: "hello@greenvalley.co", ticket: "Webinar Access", status: "Checked In", payment: "Free", registeredAt: "Jun 15, 2026" },
  ],
  "EVT-003": [
    { id: "ATT-3001", name: "Ana Santos", email: "ana@example.com", ticket: "Community Seat", status: "Registered", payment: "Free", registeredAt: "Jun 20, 2026" },
    { id: "ATT-3002", name: "Mark Tan", email: "mark@example.com", ticket: "Seed Swap Table", status: "Registered", payment: "Free", registeredAt: "Jun 21, 2026" },
    { id: "ATT-3003", name: "Luz Villanueva", email: "luz@example.com", ticket: "Community Seat", status: "Cancelled", payment: "Free", registeredAt: "Jun 22, 2026" },
  ],
  "EVT-004": [
    { id: "ATT-4001", name: "Chef Carlo Reyes", email: "carlo@example.com", ticket: "Workshop Pass", status: "Checked In", payment: "Paid", registeredAt: "May 01, 2026" },
    { id: "ATT-4002", name: "Mina Garcia", email: "mina@example.com", ticket: "Workshop Pass", status: "Checked In", payment: "Paid", registeredAt: "May 03, 2026" },
    { id: "ATT-4003", name: "Paolo Lim", email: "paolo@example.com", ticket: "Workshop Pass", status: "No Show", payment: "Paid", registeredAt: "May 04, 2026" },
  ],
  "EVT-005": [
    { id: "ATT-5001", name: "Rene Cruz", email: "rene@example.com", ticket: "Webinar Access", status: "Checked In", payment: "Free", registeredAt: "Apr 28, 2026" },
    { id: "ATT-5002", name: "Gina Ramos", email: "gina@example.com", ticket: "Webinar Access", status: "Checked In", payment: "Free", registeredAt: "Apr 29, 2026" },
  ],
};
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

const mockAnalyticsStats = [
  { label: "Total Revenue", value: "₱245,000", trend: "+18%", up: true, icon: <CreditCard size={16} color="#15803d" /> },
  { label: "Active Users", value: "4,200", trend: "+12%", up: true, icon: <Users size={16} color="#0284c7" /> },
<<<<<<< HEAD
  { label: "Event Signups", value: "1,284", trend: "+24%", up: true, icon: <CalendarDays size={16} color="#8b5cf6" /> },
=======
  { label: "AI Diagnoses", value: "12,400", trend: "+24%", up: true, icon: <Scan size={16} color="#8b5cf6" /> },
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  { label: "CO₂ Reduced", value: "3.2 Tons", trend: "+8%", up: true, icon: <Leaf size={16} color="#16a34a" /> },
];

const mockAIInsights = [
  { text: "Orders increased 18% this month, primarily from Metro Manila.", type: "positive", color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
<<<<<<< HEAD
  { text: "Palawan has the highest workshop registration activity this week.", type: "neutral", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  { text: "Seasonal harvest listings from Region IV-B need buyer outreach.", type: "warning", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
=======
  { text: "Palawan has the highest AI scan activity this week.", type: "neutral", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  { text: "High disease outbreak ('Tomato Blight') detected in Region IV-B.", type: "warning", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  { text: "Organic Edibles generated the most revenue in the past 30 days.", type: "positive", color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
];

const mockRegionalData = [
  { region: "Metro Manila", pct: "45%", color: "#0ea5e9" },
  { region: "Cordillera (CAR)", pct: "25%", color: "#16a34a" },
  { region: "Central Visayas", pct: "15%", color: "#f59e0b" },
  { region: "Davao Region", pct: "10%", color: "#8b5cf6" },
  { region: "Others", pct: "5%", color: "#64748b" },
];

<<<<<<< HEAD
const initialSupplierItems = [
  { id: "SUP-001", item: "Balcony Herb Garden Kit", category: "Starter Kit", supplier: "Urban Roots Supply", stock: 84, unit: "units", status: "In Stock", reorderPoint: 24, contact: "supply@urbanroots.ph", leadTime: "3 days", notes: "Fast-moving starter kit for condo growers.", updatedAt: "May 28, 2026" },
  { id: "SUP-002", item: "Tomato Success Kit", category: "Seed Kit", supplier: "Benguet Growers Coop", stock: 18, unit: "units", status: "Low Stock", reorderPoint: 30, contact: "orders@benguetgrowers.ph", leadTime: "5 days", notes: "Prioritize before weekend campaign bundles.", updatedAt: "May 27, 2026" },
  { id: "SUP-003", item: "Premium Potting Mix", category: "Soil", supplier: "Green Valley Co.", stock: 240, unit: "sacks", status: "In Stock", reorderPoint: 80, contact: "hello@greenvalley.co", leadTime: "4 days", notes: "Bulk item for starter kits and direct shop orders.", updatedAt: "May 26, 2026" },
  { id: "SUP-004", item: "Native Seed Preservation Pack", category: "Seeds", supplier: "Community Seed Bank", stock: 9, unit: "packs", status: "Reorder", reorderPoint: 20, contact: "seedbank@verdeversity.ph", leadTime: "7 days", notes: "Coordinate with native seed bank partners.", updatedAt: "May 25, 2026" },
];

const adminManagedSections = {
  "Announcements": {
    title: "Announcements",
    description: "Publish platform updates, maintenance notices, and workshop alerts shown across the website.",
    actionLabel: "Publish Announcement",
    stats: [
      { label: "Published", value: "18", trend: "+3", up: true, icon: <Megaphone size={16} color="#0284c7" /> },
      { label: "Scheduled", value: "6", trend: "+2", up: true, icon: <Clock size={16} color="#f59e0b" /> },
      { label: "Workshop Alerts", value: "9", trend: "+4", up: true, icon: <CalendarDays size={16} color="#16a34a" /> },
      { label: "Open Rate", value: "72%", trend: "+8%", up: true, icon: <TrendingUp size={16} color="#8b5cf6" /> },
    ],
    columns: ["Title", "Type", "Audience", "Status", "Placement"],
    items: [
      { title: "June Urban Hydroponics Masterclass seats are open", type: "Workshop Alert", audience: "All learners", status: "Published", placement: "Events & Workshops" },
      { title: "PayMongo maintenance window for GCash and Maya", type: "Maintenance", audience: "All buyers", status: "Scheduled", placement: "Checkout + Payments" },
      { title: "Native seed preservation donation tracker updated", type: "Platform Update", audience: "Shop customers", status: "Draft", placement: "Shop checkout" },
      { title: "Seasonal harvest demand spike in Metro Manila", type: "Marketplace Alert", audience: "Farmers", status: "Published", placement: "Seasonal Harvests" },
    ],
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Home notification bell",
      "Events & Workshops cards",
      "Checkout maintenance banner",
      "Subscriber campaign alerts",
    ],
  },
  "Learning Materials": {
    title: "Learning Materials",
    description: "Manage certification courses, modules, quizzes, and certificates used by the Specialist Certification page.",
    actionLabel: "Add Course Module",
    stats: [
      { label: "Courses", value: "8", trend: "+1", up: true, icon: <FileText size={16} color="#0284c7" /> },
      { label: "Modules", value: "46", trend: "+5", up: true, icon: <Layout size={16} color="#16a34a" /> },
      { label: "Certificates", value: "1,284", trend: "+14%", up: true, icon: <Ticket size={16} color="#f59e0b" /> },
      { label: "Quiz Pass Rate", value: "86%", trend: "+6%", up: true, icon: <CheckCircle size={16} color="#8b5cf6" /> },
    ],
    columns: ["Course", "Modules", "Certificate", "Quiz", "Status"],
    items: [
      { course: "Urban Farming Foundations", modules: "8 lessons", certificate: "Starter Grower", quiz: "12 questions", status: "Live" },
      { course: "Advanced Soil Health", modules: "6 lessons", certificate: "Soil Steward", quiz: "Practical rubric", status: "Live" },
      { course: "Hydroponics Masterclass", modules: "10 lessons", certificate: "Hydroponics Specialist", quiz: "20 questions", status: "Review" },
      { course: "Organic Pest Management", modules: "7 lessons", certificate: "Pest-Safe Grower", quiz: "15 questions", status: "Draft" },
    ],
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Specialist Certification catalog",
      "Course detail modal",
      "Certificate generator",
      "Learner progress cards",
    ],
  },
  "Support Tickets": {
    title: "Support Tickets",
    description: "Handle customer, farmer, workshop, and order issues while assigning the right support owner.",
    actionLabel: "Create Ticket",
    stats: [
      { label: "Open Tickets", value: "31", trend: "-4", up: true, icon: <MessageSquare size={16} color="#0284c7" /> },
      { label: "Farm Issues", value: "12", trend: "+3", up: false, icon: <Wheat size={16} color="#f59e0b" /> },
      { label: "Avg Response", value: "1h 42m", trend: "-18m", up: true, icon: <Clock size={16} color="#16a34a" /> },
      { label: "Resolved", value: "148", trend: "+22%", up: true, icon: <CheckCircle size={16} color="#8b5cf6" /> },
    ],
    columns: ["Ticket", "Requester", "Category", "Owner", "Priority"],
    items: [
      { ticket: "GCash payment marked pending after checkout", requester: "Maria Clara", category: "Payments", owner: "Billing Team", priority: "High" },
      { ticket: "Farmer verification document needs review", requester: "Reyes Organic Farm", category: "Verification", owner: "Ops Admin", priority: "Medium" },
      { ticket: "Workshop certificate name correction", requester: "Juan Dela Cruz", category: "Learning", owner: "Education Team", priority: "Low" },
      { ticket: "Seed kit delivery rider ETA mismatch", requester: "Urban Roots", category: "Deliveries", owner: "Logistics", priority: "High" },
    ],
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Get In Touch form",
      "Checkout support notes",
      "Delivery chat workflow",
      "Farmer verification queue",
    ],
  },
  "Community Posts": {
    title: "Community Posts",
    description: "Moderate garden stories, seed swaps, comments, reports, and featured community posts.",
    actionLabel: "Feature Post",
    stats: [
      { label: "Pending Review", value: "17", trend: "+5", up: false, icon: <AlertCircle size={16} color="#dc2626" /> },
      { label: "Featured", value: "24", trend: "+4", up: true, icon: <Crown size={16} color="#f59e0b" /> },
      { label: "Comments", value: "684", trend: "+18%", up: true, icon: <MessageSquare size={16} color="#0284c7" /> },
      { label: "Reports", value: "5", trend: "-2", up: true, icon: <ShieldCheck size={16} color="#16a34a" /> },
    ],
    columns: ["Post", "Author", "Topic", "Reports", "Status"],
    items: [
      { post: "Balcony herb garden progress after 30 days", author: "Urban Roots", topic: "Starter Kits", reports: "0", status: "Featured" },
      { post: "Baguio seed exchange meetup recap", author: "Isabella Cruz", topic: "Community Event", reports: "1", status: "Review" },
      { post: "Composting setup for condo growers", author: "Maria Clara", topic: "Sustainability", reports: "0", status: "Published" },
      { post: "Bulk lettuce buyers needed this week", author: "Green Valley Co.", topic: "Surplus", reports: "3", status: "Flagged" },
    ],
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Community event pages",
      "Seed exchange content",
      "Featured user stories",
      "Reported comments queue",
    ],
  },
  "Inventory & Suppliers": {
    title: "Inventory & Suppliers",
    description: "Manage seed kits, farm supplies, stock levels, reorder alerts, and supplier records.",
    actionLabel: "Add Supplier Item",
    stats: [
      { label: "Active SKUs", value: "142", trend: "+9", up: true, icon: <Package size={16} color="#0284c7" /> },
      { label: "Low Stock", value: "11", trend: "+3", up: false, icon: <AlertCircle size={16} color="#dc2626" /> },
      { label: "Suppliers", value: "28", trend: "+2", up: true, icon: <Truck size={16} color="#16a34a" /> },
      { label: "Seed Kits", value: "36", trend: "+6", up: true, icon: <Leaf size={16} color="#f59e0b" /> },
    ],
    columns: ["Item", "Category", "Supplier", "Stock", "Status"],
    items: initialSupplierItems,
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Shop All Products inventory",
      "Starter Kits product cards",
      "Checkout stock validation",
      "Supplier reorder workflow",
    ],
  },
  "Impact Metrics": {
    title: "Impact Metrics",
    description: "Update sustainability, farmer reach, waste reduction, seed preservation, and CO2 savings metrics.",
    actionLabel: "Update Impact Metric",
    stats: [
      { label: "Farmers Reached", value: "3,500+", trend: "+5%", up: true, icon: <Users size={16} color="#0284c7" /> },
      { label: "Waste Reduced", value: "1.5 Tons", trend: "+12%", up: true, icon: <RefreshCcw size={16} color="#16a34a" /> },
      { label: "CO2 Saved", value: "3.2 Tons", trend: "+8%", up: true, icon: <Leaf size={16} color="#15803d" /> },
      { label: "LGU Gardens", value: "15", trend: "+2", up: true, icon: <Globe size={16} color="#f59e0b" /> },
    ],
    columns: ["Metric", "Current Value", "Source", "Website Page", "Status"],
    items: [
      { metric: "Micro-vendors empowered", currentValue: "3,500+", source: "Income Generation dashboard", websitePage: "Benefits / Dashboard", status: "Published" },
      { metric: "Native seed packs supported", currentValue: "2,840", source: "Checkout donations", websitePage: "Native Seed Bank", status: "Review" },
      { metric: "Food waste reduced", currentValue: "1.5 Tons", source: "Surplus Exchange reports", websitePage: "Our Impact", status: "Published" },
      { metric: "CO2 reduced", currentValue: "3.2 Tons", source: "Delivery + local sourcing", websitePage: "Impact Tracking", status: "Published" },
    ],
    sideTitle: "Website Touchpoints",
    sideItems: [
      "Our Impact statistics",
      "Impact Tracking dashboard",
      "LGU Partnership outcomes",
      "Sustainability App Market data",
    ],
  },
};

const homeGlassChartTabs = [
  { id: "crop", label: "Crop Growth", icon: Leaf, color: "#15803d" },
  { id: "users", label: "Active Users", icon: Users, color: "#0284c7" },
  { id: "harvests", label: "Harvests", icon: Wheat, color: "#b45309" },
  { id: "subs", label: "Subscribers", icon: Activity, color: "#be123c" },
];

export default function AdminPortal({ setActiveNav, handleLogout, products, setProducts, harvests, setHarvests, promoCodes, setPromoCodes, orders, setOrders, supportTickets = [], homeGlassChart = {}, setHomeGlassChart, surplusListings = [], setSurplusListings, expertSupportConfig = {}, setExpertSupportConfig, impactSectorsConfig = {}, setImpactSectorsConfig, subscriptionPlans = initialSubscriptionPlans, setSubscriptionPlans }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dashboardDateRange, setDashboardDateRange] = useState("Today");
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  const [hoveredStat, setHoveredStat] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
<<<<<<< HEAD
  const [supplierItems, setSupplierItems] = useState(() => {
    try {
      const savedSupplierItems = localStorage.getItem(SUPPLIER_ITEMS_STORAGE_KEY);
      const parsedSupplierItems = savedSupplierItems ? JSON.parse(savedSupplierItems) : null;
      return Array.isArray(parsedSupplierItems) && parsedSupplierItems.length > 0 ? parsedSupplierItems : initialSupplierItems;
    } catch (error) {
      return initialSupplierItems;
    }
  });
  const [editingSupplierItem, setEditingSupplierItem] = useState(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierStatusFilter, setSupplierStatusFilter] = useState("All");
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

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
<<<<<<< HEAD
  const [editingSubscriptionPlan, setEditingSubscriptionPlan] = useState(null);
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const [eventsList, setEventsList] = useState(mockEventsList);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState(null);
<<<<<<< HEAD
  const [isViewingEventAttendees, setIsViewingEventAttendees] = useState(false);
  const [eventAttendeeSearchTerm, setEventAttendeeSearchTerm] = useState("");
  const [eventAttendeeStatusFilter, setEventAttendeeStatusFilter] = useState("All");
=======

  const [selectedScan, setSelectedScan] = useState(null);
  const [scanSearchTerm, setScanSearchTerm] = useState("");
  const [scanStatusFilter, setScanStatusFilter] = useState("All");

  const [contentSearchTerm, setContentSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("All");
  const [aiPrompt, setAiPrompt] = useState("");
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

  const [editingHarvest, setEditingHarvest] = useState(null);
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [harvestCategoryFilter, setHarvestCategoryFilter] = useState("All");
  const [harvestToDelete, setHarvestToDelete] = useState(null);

  const [activeSettingsTab, setActiveSettingsTab] = useState("General");
<<<<<<< HEAD
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
      return savedSettings ? mergeAdminSettings(JSON.parse(savedSettings)) : mergeAdminSettings();
    } catch (error) {
      return mergeAdminSettings();
    }
  });
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminAccountDraft, setAdminAccountDraft] = useState(null);
  const [paymentConfigOpen, setPaymentConfigOpen] = useState(false);
  const [activeHomeChartTab, setActiveHomeChartTab] = useState("crop");
  const [homeGlassChartDraft, setHomeGlassChartDraft] = useState(homeGlassChart);
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

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

<<<<<<< HEAD
  useEffect(() => {
    setHomeGlassChartDraft(homeGlassChart);
  }, [homeGlassChart]);

  useEffect(() => {
    localStorage.setItem(SUPPLIER_ITEMS_STORAGE_KEY, JSON.stringify(supplierItems));
  }, [supplierItems]);

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const getSupplierItemStockText = (item) => `${Number(item.stock) || 0} ${item.unit || "units"}`;

  const getSupplierItemUpdatedAt = () => new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAddSupplierItem = () => {
    setEditingSupplierItem({
      id: `SUP-${Date.now()}`,
      item: "",
      category: "Seed Kit",
      supplier: "",
      stock: 0,
      unit: "units",
      status: "In Stock",
      reorderPoint: 10,
      contact: "",
      leadTime: "3 days",
      notes: "",
      updatedAt: getSupplierItemUpdatedAt(),
      isNew: true,
    });
  };

  const handleEditSupplierItem = (supplierItem) => {
    setEditingSupplierItem({ ...supplierItem });
  };

  const handleCancelSupplierItemEdit = () => {
    setEditingSupplierItem(null);
  };

  const handleSupplierDraftChange = (field, value) => {
    setEditingSupplierItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSupplierItem = () => {
    if (!editingSupplierItem?.item.trim() || !editingSupplierItem?.supplier.trim()) {
      showAdminToast("Please add an item name and supplier before saving.");
      return;
    }

    const supplierItemToSave = {
      ...editingSupplierItem,
      stock: Math.max(0, Number(editingSupplierItem.stock) || 0),
      reorderPoint: Math.max(0, Number(editingSupplierItem.reorderPoint) || 0),
      updatedAt: getSupplierItemUpdatedAt(),
    };
    delete supplierItemToSave.isNew;

    if (editingSupplierItem.isNew) {
      setSupplierItems(prev => [supplierItemToSave, ...prev]);
      showAdminToast("Supplier item added.");
    } else {
      setSupplierItems(prev => prev.map(item => item.id === supplierItemToSave.id ? supplierItemToSave : item));
      showAdminToast("Supplier item updated.");
    }

    setEditingSupplierItem(null);
  };

  const handleDeleteSupplierItem = (supplierItemId) => {
    setSupplierItems(prev => prev.filter(item => item.id !== supplierItemId));
    if (editingSupplierItem?.id === supplierItemId) {
      setEditingSupplierItem(null);
    }
    showAdminToast("Supplier item removed.");
  };

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const getPlanDraftFromPlan = (plan = {}) => ({
    ...plan,
    name: plan.name || "",
    description: plan.description || "",
    priceMonthly: plan.priceMonthly || "₱0",
    priceYearly: plan.priceYearly || "₱0",
    billingNoteMonthly: plan.billingNoteMonthly || "per month",
    billingNoteYearly: plan.billingNoteYearly || "per year, billed annually",
    color: plan.color || "#15803d",
    accentColor: plan.accentColor || plan.color || "#16a34a",
    bg: plan.bg || "rgba(22,163,74,0.04)",
    badge: plan.badge || "",
    ctaLabel: plan.ctaLabel || "Subscribe Now",
    billingType: plan.billingType || "paid",
    clientVisible: plan.clientVisible !== false,
    users: plan.users || "0",
    revenue: plan.revenue || "₱0",
    featuresText: (plan.features || []).join("\n"),
    excludedFeaturesText: (plan.excludedFeatures || []).join("\n"),
  });

  const handleAddSubscriptionPlan = () => {
    setEditingSubscriptionPlan(getPlanDraftFromPlan({
      id: `PLAN-${Date.now()}`,
      name: "",
      description: "Describe who this plan is for.",
      priceMonthly: "₱999",
      priceYearly: "₱9,590",
      badge: "New",
      users: "0",
      revenue: "₱0",
      features: ["AI advisory access", "Priority support"],
      excludedFeatures: [],
      isNew: true,
    }));
  };

  const handleEditSubscriptionPlan = (plan) => {
    setEditingSubscriptionPlan(getPlanDraftFromPlan(plan));
  };

  const handleSubscriptionPlanDraftChange = (field, value) => {
    setEditingSubscriptionPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSubscriptionPlan = () => {
    if (!editingSubscriptionPlan?.name.trim()) {
      setToastMessage("Please add a subscription plan name.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (!setSubscriptionPlans) {
      setToastMessage("Subscription plan manager is not connected.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const planToSave = {
      ...editingSubscriptionPlan,
      name: editingSubscriptionPlan.name.trim(),
      description: editingSubscriptionPlan.description.trim(),
      features: editingSubscriptionPlan.featuresText.split("\n").map(feature => feature.trim()).filter(Boolean),
      excludedFeatures: editingSubscriptionPlan.excludedFeaturesText.split("\n").map(feature => feature.trim()).filter(Boolean),
      clientVisible: Boolean(editingSubscriptionPlan.clientVisible),
    };
    delete planToSave.featuresText;
    delete planToSave.excludedFeaturesText;
    delete planToSave.isNew;

    setSubscriptionPlans(prev => {
      const plans = Array.isArray(prev) && prev.length > 0 ? prev : initialSubscriptionPlans;
      if (editingSubscriptionPlan.isNew) return [planToSave, ...plans];
      return plans.map(plan => plan.id === planToSave.id ? planToSave : plan);
    });

    setEditingSubscriptionPlan(null);
    setToastMessage("Subscription plan saved and published to the client pricing page.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSubscriptionPlan = (planId) => {
    if (!setSubscriptionPlans) return;
    setSubscriptionPlans(prev => (prev || []).filter(plan => plan.id !== planId));
    if (editingSubscriptionPlan?.id === planId) setEditingSubscriptionPlan(null);
    setToastMessage("Subscription plan removed.");
    setTimeout(() => setToastMessage(null), 3000);
  };

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
    setIsViewingEventAttendees(false);
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const getEventAttendees = (eventId) => mockEventAttendees[eventId] || [];

  const getFilteredEventAttendees = (eventId) => {
    const searchValue = eventAttendeeSearchTerm.toLowerCase();
    return getEventAttendees(eventId).filter(attendee => {
      const matchesSearch = [attendee.id, attendee.name, attendee.email, attendee.ticket]
        .some(value => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = eventAttendeeStatusFilter === "All" || attendee.status === eventAttendeeStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getEventAttendeeStatusStyle = (status) => {
    if (status === "Checked In") return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (status === "Registered") return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (status === "Pending") return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (status === "Cancelled" || status === "No Show") return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const handleViewEventAttendees = () => {
    setIsEditingEvent(false);
    setIsViewingEventAttendees(true);
    setEventAttendeeSearchTerm("");
    setEventAttendeeStatusFilter("All");
  };

  const handleExportSelectedEventAttendees = (event) => {
    const attendees = getFilteredEventAttendees(event.id);
    const quoteCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Event ID", "Event Title", "Attendee ID", "Name", "Email", "Ticket", "Status", "Payment", "Registered At"],
      ...attendees.map(attendee => [event.id, event.title, attendee.id, attendee.name, attendee.email, attendee.ticket, attendee.status, attendee.payment, attendee.registeredAt]),
    ];
    const csvContent = rows.map(row => row.map(quoteCsv).join(",")).join("\n");
    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: "text/csv" });
    const fileUrl = URL.createObjectURL(file);
    element.href = fileUrl;
    element.download = `${event.id}_Attendees.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(fileUrl);
    setToastMessage("Selected event attendees exported.");
    setTimeout(() => setToastMessage(null), 3000);
  };

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
    setIsViewingEventAttendees(false);
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const showAdminToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateSurplusStatus = (listingId, status) => {
    if (!setSurplusListings) {
      showAdminToast("Surplus listing manager is not connected.");
      return;
    }

    setSurplusListings(prev => (prev || []).map(listing => listing.id === listingId ? {
      ...listing,
      status,
      reviewedAt: new Date().toLocaleString(),
    } : listing));
    showAdminToast(`Surplus listing marked as ${status}.`);
  };

  const updateExpertSupportConfig = (updater, message = null) => {
    if (!setExpertSupportConfig) {
      showAdminToast("Expert Support manager is not connected.");
      return;
    }
    setExpertSupportConfig(prev => updater(prev || {}));
    if (message) showAdminToast(message);
  };

  const updateExpertSupportSection = (section, value, message) => {
    updateExpertSupportConfig(prev => ({ ...prev, [section]: value }), message);
  };

  const updateExpertSupportInfo = (field, value) => {
    updateExpertSupportConfig(prev => ({
      ...prev,
      supportInfo: {
        ...(prev.supportInfo || {}),
        [field]: value,
      },
    }));
  };

  const updateExpertAdvisor = (advisorId, field, value) => {
    updateExpertSupportConfig(prev => ({
      ...prev,
      advisors: (prev.advisors || []).map(advisor => advisor.id === advisorId ? { ...advisor, [field]: value } : advisor),
    }));
  };

  const addExpertAdvisor = () => {
    const newAdvisor = {
      id: `ADV-${Date.now()}`,
      name: "New Specialist",
      image: "/rus3.jpeg",
      verified: false,
      rating: 4.5,
      expertise: ["Urban Farming"],
      availability: "Available",
      availableDays: "Mon - Fri",
      availableTime: "9:00 AM - 5:00 PM",
      bio: "Add this specialist's client-facing bio here.",
    };
    updateExpertSupportConfig(prev => ({ ...prev, advisors: [newAdvisor, ...(prev.advisors || [])] }), "New advisor added.");
  };

  const removeExpertAdvisor = (advisorId) => {
    updateExpertSupportConfig(prev => ({ ...prev, advisors: (prev.advisors || []).filter(advisor => advisor.id !== advisorId) }), "Advisor removed.");
  };

  const updateExpertService = (serviceId, field, value) => {
    updateExpertSupportConfig(prev => ({
      ...prev,
      consultationTypes: (prev.consultationTypes || []).map(service => service.id === serviceId ? { ...service, [field]: value } : service),
    }));
  };

  const addExpertService = () => {
    const newService = {
      id: `service-${Date.now()}`,
      name: "New Service",
      duration: "1 hour",
      price: 500,
      description: "Describe what this support service includes.",
    };
    updateExpertSupportConfig(prev => ({ ...prev, consultationTypes: [...(prev.consultationTypes || []), newService] }), "Consultation service added.");
  };

  const removeExpertService = (serviceId) => {
    updateExpertSupportConfig(prev => ({ ...prev, consultationTypes: (prev.consultationTypes || []).filter(service => service.id !== serviceId) }), "Consultation service removed.");
  };

  const updateExpertFaq = (faqIndex, field, value) => {
    updateExpertSupportConfig(prev => ({
      ...prev,
      faqs: (prev.faqs || []).map((faq, idx) => idx === faqIndex ? { ...faq, [field]: value } : faq),
    }));
  };

  const addExpertFaq = () => {
    updateExpertSupportConfig(prev => ({ ...prev, faqs: [...(prev.faqs || []), { question: "New question", answer: "Add the client-facing answer here." }] }), "FAQ added.");
  };

  const removeExpertFaq = (faqIndex) => {
    updateExpertSupportConfig(prev => ({ ...prev, faqs: (prev.faqs || []).filter((_, idx) => idx !== faqIndex) }), "FAQ removed.");
  };

  const updateImpactSectorsConfig = (updater, message = null) => {
    if (!setImpactSectorsConfig) {
      showAdminToast("Impact Sectors manager is not connected.");
      return;
    }
    setImpactSectorsConfig(prev => updater(prev || {}));
    if (message) showAdminToast(message);
  };

  const updateImpactSectorPageInfo = (field, value) => {
    updateImpactSectorsConfig(prev => ({
      ...prev,
      pageInfo: {
        ...(prev.pageInfo || {}),
        [field]: value,
      },
    }));
  };

  const updateImpactSector = (sectorId, field, value) => {
    updateImpactSectorsConfig(prev => ({
      ...prev,
      sectors: (prev.sectors || []).map(sector => sector.id === sectorId ? { ...sector, [field]: value } : sector),
    }));
  };

  const updateImpactSectorDetail = (sectorId, field, value) => {
    updateImpactSectorsConfig(prev => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        [sectorId]: {
          ...((prev.details || {})[sectorId] || {}),
          [field]: value,
        },
      },
    }));
  };

  const updateImpactSectorDetailListItem = (sectorId, listKey, itemIndex, field, value) => {
    updateImpactSectorsConfig(prev => {
      const detail = ((prev.details || {})[sectorId] || {});
      const list = Array.isArray(detail[listKey]) ? detail[listKey] : [];
      return {
        ...prev,
        details: {
          ...(prev.details || {}),
          [sectorId]: {
            ...detail,
            [listKey]: list.map((item, index) => index === itemIndex ? { ...item, [field]: value } : item),
          },
        },
      };
    });
  };

  const addImpactSectorDetailListItem = (sectorId, listKey, newItem, message) => {
    updateImpactSectorsConfig(prev => {
      const detail = ((prev.details || {})[sectorId] || {});
      const list = Array.isArray(detail[listKey]) ? detail[listKey] : [];
      return {
        ...prev,
        details: {
          ...(prev.details || {}),
          [sectorId]: {
            ...detail,
            [listKey]: [...list, { ...newItem, id: `${listKey}-${Date.now()}` }],
          },
        },
      };
    }, message);
  };

  const removeImpactSectorDetailListItem = (sectorId, listKey, itemIndex, message) => {
    updateImpactSectorsConfig(prev => {
      const detail = ((prev.details || {})[sectorId] || {});
      const list = Array.isArray(detail[listKey]) ? detail[listKey] : [];
      return {
        ...prev,
        details: {
          ...(prev.details || {}),
          [sectorId]: {
            ...detail,
            [listKey]: list.filter((_, index) => index !== itemIndex),
          },
        },
      };
    }, message);
  };

  const parsePipeRows = (value) => value.split("\n").map(row => row.split("|").map(part => part.trim())).filter(parts => parts.some(Boolean));
  const serializeChartRows = (rows = []) => rows.map(item => `${item.label || item.area || ""} | ${item.value ?? item.progress ?? ""} | ${item.color || "#16a34a"}`).join("\n");
  const parseChartRows = (value) => parsePipeRows(value).map(([label, rowValue, color]) => ({ label, value: Number(rowValue) || 0, color: color || "#16a34a" }));
  const serializeProgramsRows = (rows = []) => rows.map(item => `${item.title || ""} | ${item.desc || ""} | ${item.impact || item.icon || ""}`).join("\n");
  const parseProgramsRows = (value, thirdField = "impact") => parsePipeRows(value).map(([title, desc, third]) => ({ title, desc, [thirdField]: third || "" }));
  const serializeMetricsRows = (rows = []) => rows.map(item => `${item.value || ""} | ${item.label || ""} | ${item.iconKey || ""}`).join("\n");
  const parseMetricsRows = (value) => parsePipeRows(value).map(([rowValue, label, iconKey]) => ({ value: rowValue, label, iconKey }));
  const serializeDistributionRows = (rows = []) => rows.map(item => `${item.program || ""} | ${item.status || ""} | ${item.count || ""} | ${item.iconKey || ""}`).join("\n");
  const parseDistributionRows = (value) => parsePipeRows(value).map(([program, status, count, iconKey], index) => ({ id: index + 1, program, status, count, iconKey }));

  const updateAdminSetting = (section, key, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const saveAdminSettingsToStorage = (settingsToSave) => {
    localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
  };

  const handleSaveAdminSettings = () => {
    if (!adminSettings.general.platformName.trim()) {
      showAdminToast("Please provide a platform name.");
      return;
    }
    if (!adminSettings.general.supportEmail.includes("@")) {
      showAdminToast("Please provide a valid support email.");
      return;
    }

    saveAdminSettingsToStorage(adminSettings);
    showAdminToast("Admin settings saved successfully.");
  };

  const handleEditAdminAccount = (adminAccount) => {
    setEditingAdminId(adminAccount.id);
    setAdminAccountDraft({ ...adminAccount });
  };

  const handleAddAdminAccount = () => {
    const newAdmin = {
      id: `ADM-${Date.now()}`,
      name: "New Admin",
      email: "new.admin@ecoequity.ph",
      role: "Ops Admin",
      twoFactor: false,
      status: "Active",
    };

    setAdminSettings(prev => ({ ...prev, admins: [...prev.admins, newAdmin] }));
    setEditingAdminId(newAdmin.id);
    setAdminAccountDraft(newAdmin);
  };

  const handleCancelAdminEdit = () => {
    const wasNewBlankAdmin = adminAccountDraft?.name === "New Admin" && adminAccountDraft?.email === "new.admin@ecoequity.ph";
    if (wasNewBlankAdmin) {
      setAdminSettings(prev => ({ ...prev, admins: prev.admins.filter(admin => admin.id !== adminAccountDraft.id) }));
    }
    setEditingAdminId(null);
    setAdminAccountDraft(null);
  };

  const handleSaveAdminAccount = () => {
    if (!adminAccountDraft?.name.trim() || !adminAccountDraft?.email.includes("@")) {
      showAdminToast("Please provide a valid admin name and email.");
      return;
    }

    setAdminSettings(prev => ({
      ...prev,
      admins: prev.admins.map(admin => admin.id === adminAccountDraft.id ? adminAccountDraft : admin),
    }));
    setEditingAdminId(null);
    setAdminAccountDraft(null);
    showAdminToast("Admin account updated.");
  };

  const handleDeleteAdminAccount = (adminId) => {
    const adminAccount = adminSettings.admins.find(admin => admin.id === adminId);
    if (adminAccount?.role === "Super Admin") {
      showAdminToast("Super Admin accounts cannot be removed here.");
      return;
    }

    setAdminSettings(prev => ({ ...prev, admins: prev.admins.filter(admin => admin.id !== adminId) }));
    if (editingAdminId === adminId) {
      setEditingAdminId(null);
      setAdminAccountDraft(null);
    }
    showAdminToast("Admin account removed.");
  };

  const handleTestPaymentConnection = () => {
    if (!adminSettings.payments.publicKey.trim()) {
      showAdminToast("Add a PayMongo public key before testing.");
      return;
    }

    showAdminToast(adminSettings.payments.payMongoEnabled ? "PayMongo connection looks ready." : "Enable PayMongo before accepting payments.");
  };

  const handleCreateBackup = () => {
    const timestamp = new Date().toLocaleString();
    const backup = {
      id: `BKP-${Date.now()}`,
      createdAt: timestamp,
      summary: `${(products || []).length} products, ${(orders || []).length} orders, ${(harvests || []).length} harvests`,
    };

    setAdminSettings(prev => {
      const updatedSettings = {
        ...prev,
        backups: {
          ...prev.backups,
          lastBackup: timestamp,
          history: [backup, ...(prev.backups.history || [])].slice(0, 5),
        },
      };
      saveAdminSettingsToStorage(updatedSettings);
      return updatedSettings;
    });
    showAdminToast("Manual backup created.");
  };

  const handleRestoreBackup = () => {
    const latestBackup = adminSettings.backups.history?.[0];
    if (!latestBackup) {
      showAdminToast("Create a backup before restoring.");
      return;
    }

    const timestamp = new Date().toLocaleString();
    setAdminSettings(prev => {
      const updatedSettings = {
        ...prev,
        backups: {
          ...prev.backups,
          lastRestore: timestamp,
        },
      };
      saveAdminSettingsToStorage(updatedSettings);
      return updatedSettings;
    });
    showAdminToast(`Restored from ${latestBackup.id}.`);
  };

  const handleExportSystemData = () => {
    const quoteCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Section", "ID", "Name", "Status", "Details"],
      ...mockUsers.map(user => ["Users", user.id, user.name, user.status, user.role]),
      ...(products || []).map(product => ["Products", product.id, product.name, product.stock || product.status || "", product.category || ""]),
      ...(orders || []).map(order => ["Orders", order.id, order.customer, order.status, order.total || ""]),
      ...(harvests || []).map(harvest => ["Harvests", harvest.id, harvest.name, harvest.risk || "", harvest.category || ""]),
      ...supplierItems.map(item => ["Supplier Inventory", item.id, item.item, item.status || "", `${item.supplier || ""} | ${getSupplierItemStockText(item)}`]),
      ...managedSubscriptionPlans.map(plan => ["Subscription Plans", plan.id, plan.name, plan.clientVisible === false ? "Hidden" : "Visible", `${plan.priceMonthly} monthly | ${plan.priceYearly} yearly`]),
      ...(surplusListings || []).map(listing => ["Surplus", listing.id, listing.product, listing.status || "Pending Review", `${listing.quantity}${listing.unit} at ₱${listing.price}/${listing.unit}`]),
      ...(promoCodes || []).map(promo => ["Promos", promo.id, promo.code, promo.status || "", promo.type || ""]),
      ...eventsList.map(event => ["Events", event.id, event.title, event.status, event.date]),
      ...deliveriesList.map(delivery => ["Deliveries", delivery.id, delivery.customer, delivery.status, delivery.orderId]),
    ];
    const csvContent = rows.map(row => row.map(quoteCsv).join(",")).join("\n");
    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: "text/csv" });
    const fileUrl = URL.createObjectURL(file);
    element.href = fileUrl;
    element.download = "VerdeVersity_Admin_System_Data.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(fileUrl);
    showAdminToast("System data exported as CSV.");
  };

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
    { name: "Surplus Exchange", icon: RefreshCcw },
    { name: "Home Glass Chart", icon: BarChart2 },
    { name: "Announcements", icon: Megaphone },
    { name: "Learning Materials", icon: FileText },
    { name: "Expert Support", icon: UserCheck },
    { name: "Support Tickets", icon: MessageSquare },
    { name: "Community Posts", icon: Users },
    { name: "Inventory & Suppliers", icon: Package },
    { name: "Impact Sectors", icon: Globe },
    { name: "Impact Metrics", icon: Leaf },
    { name: "Reports & Analytics", icon: BarChart2 },
=======
    { name: "AI Plant Doctor", icon: Stethoscope },
    { name: "Reports & Analytics", icon: BarChart2 },
    { name: "Content Management", icon: FileText },
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
  const settingsTabs = [
    { id: "General", icon: <Layout size={16} /> },
    { id: "Security & Roles", icon: <ShieldCheck size={16} /> },
    { id: "Payments", icon: <CreditCard size={16} /> },
    { id: "Appearance", icon: <Image size={16} /> },
    { id: "Database & Backups", icon: <Database size={16} /> },
  ];
  const adminRoleOptions = ["Super Admin", "Ops Admin", "Support Admin", "Finance Admin", "Content Admin"];
  const settingsStats = [
    {
      label: "System Status",
      value: adminSettings.general.maintenanceMode ? "Maintenance" : "Online",
      trend: adminSettings.general.maintenanceMode ? "Restricted" : "99.9% Uptime",
      up: !adminSettings.general.maintenanceMode,
      icon: <Activity size={16} color={adminSettings.general.maintenanceMode ? "#e11d48" : "#15803d"} />,
    },
    { label: "Active Admins", value: String(adminSettings.admins.length), trend: "Role Managed", up: true, icon: <ShieldCheck size={16} color="#0284c7" /> },
    { label: "Last Backup", value: adminSettings.backups.lastBackup ? "Saved" : "None", trend: adminSettings.backups.lastBackup || "Create one", up: Boolean(adminSettings.backups.lastBackup), icon: <Database size={16} color="#f59e0b" /> },
    { label: "Payment API", value: adminSettings.payments.payMongoEnabled ? "Enabled" : "Paused", trend: adminSettings.payments.publicKey ? "Configured" : "Missing Key", up: adminSettings.payments.payMongoEnabled && Boolean(adminSettings.payments.publicKey), icon: <Globe size={16} color="#8b5cf6" /> },
  ];
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d

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

<<<<<<< HEAD
  const managedSubscriptionPlans = Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 ? subscriptionPlans : initialSubscriptionPlans;
  const managedSubscriptionPlanOptions = managedSubscriptionPlans.map(plan => ({ value: plan.name, label: plan.name }));
  const getManagedPlanColor = (planName) => managedSubscriptionPlans.find(plan => plan.name === planName)?.color || "#475569";
  const getManagedPlanLimit = (planName) => {
    const plan = managedSubscriptionPlans.find(item => item.name === planName);
    if (!plan) return 100;
    if (plan.billingType === "free") return 10;
    if (plan.billingType === "contact") return 5000;
    return 100;
  };

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const filteredAdminProducts = products.filter(p => 
    productCategoryFilter === "All" || p.category === productCategoryFilter
  );

  const filteredSupplierItems = supplierItems.filter(item => {
    const searchValue = supplierSearchTerm.toLowerCase();
    const matchesSearch = [item.item, item.category, item.supplier, item.contact, item.notes]
      .some(value => String(value || "").toLowerCase().includes(searchValue));
    const matchesStatus = supplierStatusFilter === "All" || item.status === supplierStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const supplierStatusOptions = ["All", "In Stock", "Low Stock", "Reorder", "Out of Stock", "Paused"];
  const supplierCategoryCount = new Set(supplierItems.map(item => item.category).filter(Boolean)).size;
  const supplierCount = new Set(supplierItems.map(item => item.supplier).filter(Boolean)).size;
  const lowSupplierStockCount = supplierItems.filter(item => ["Low Stock", "Reorder", "Out of Stock"].includes(item.status)).length;
  const seedKitCount = supplierItems.filter(item => `${item.category || ""} ${item.item || ""}`.toLowerCase().includes("seed")).length;
  const supplierInventoryStats = adminManagedSections["Inventory & Suppliers"].stats.map(stat => {
    if (stat.label === "Active SKUs") return { ...stat, value: String(supplierItems.length), trend: `${supplierCategoryCount} categories`, up: true };
    if (stat.label === "Low Stock") return { ...stat, value: String(lowSupplierStockCount), trend: lowSupplierStockCount ? "Needs action" : "Clear", up: lowSupplierStockCount === 0 };
    if (stat.label === "Suppliers") return { ...stat, value: String(supplierCount), trend: "Managed", up: true };
    if (stat.label === "Seed Kits") return { ...stat, value: String(seedKitCount), trend: "Tracked", up: true };
    return stat;
  });

=======
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

>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
  const getManagedStatusStyle = (status) => {
    if (["Published", "Live", "In Stock", "Featured", "Approved", "Available"].includes(status)) return { background: "rgba(22,163,74,0.1)", color: "#16a34a" };
    if (["Scheduled", "Review", "Low Stock", "Reorder", "Draft", "Pending Review"].includes(status)) return { background: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    if (["Flagged", "High", "Removed"].includes(status)) return { background: "rgba(220,38,38,0.1)", color: "#dc2626" };
    if (["Medium", "Paused"].includes(status)) return { background: "rgba(14,165,233,0.1)", color: "#0ea5e9" };
    if (["Sold"].includes(status)) return { background: "rgba(107,114,128,0.1)", color: "#4b5563" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getManagedCellValue = (item, column) => {
    const key = column.charAt(0).toLowerCase() + column.slice(1).replace(/\s+/g, "");
    return item[key] || item[column.toLowerCase()] || "";
  };

  const getSupportTicketOwner = (category = "") => {
    const normalizedCategory = category.toLowerCase();
    if (normalizedCategory.includes("payment") || normalizedCategory.includes("checkout")) return "Billing Team";
    if (normalizedCategory.includes("order") || normalizedCategory.includes("delivery")) return "Logistics";
    if (normalizedCategory.includes("learning") || normalizedCategory.includes("workshop") || normalizedCategory.includes("certificate")) return "Education Team";
    if (normalizedCategory.includes("farm") || normalizedCategory.includes("seed") || normalizedCategory.includes("inventory")) return "Ops Admin";
    if (normalizedCategory.includes("impact") || normalizedCategory.includes("partnership")) return "Impact Team";
    return "Support Queue";
  };

  const submittedSupportItems = (supportTickets || []).map(ticket => ({
    ticket: `${ticket.id}: ${ticket.subject}`,
    requester: ticket.requester || ticket.contact || "Portal User",
    category: ticket.category || ticket.page || "General Support",
    owner: getSupportTicketOwner(ticket.category || ticket.page),
    priority: ticket.priority || "Medium",
  }));

  const getManagedSectionItems = (section) => {
    if (section.title === "Support Tickets" && submittedSupportItems.length > 0) {
      return [...submittedSupportItems, ...section.items];
    }
    return section.items;
  };

  const getManagedSectionStats = (section) => {
    if (section.title !== "Support Tickets" || !supportTickets?.length) return section.stats;

    const farmIssueCount = supportTickets.filter(ticket => {
      const category = `${ticket.category || ""} ${ticket.page || ""}`.toLowerCase();
      return category.includes("farm") || category.includes("seed") || category.includes("inventory") || category.includes("plant");
    }).length;

    return section.stats.map(stat => {
      if (stat.label === "Open Tickets") {
        return { ...stat, value: String(31 + supportTickets.length), trend: `+${supportTickets.length}`, up: false };
      }
      if (stat.label === "Farm Issues") {
        return { ...stat, value: String(12 + farmIssueCount), trend: farmIssueCount ? `+${farmIssueCount}` : stat.trend, up: farmIssueCount ? false : stat.up };
      }
      return stat;
    });
  };

  const updateHomeGlassChartDraft = (tabId, updater) => {
    setHomeGlassChartDraft(prev => {
      const currentTab = prev[tabId] || { points: [], stats: [] };
      return {
        ...prev,
        [tabId]: updater(currentTab),
      };
    });
  };

  const updateHomeChartField = (field, value) => {
    updateHomeGlassChartDraft(activeHomeChartTab, currentTab => ({
      ...currentTab,
      [field]: value,
    }));
  };

  const updateHomeChartPoint = (index, field, value) => {
    updateHomeGlassChartDraft(activeHomeChartTab, currentTab => ({
      ...currentTab,
      points: (currentTab.points || []).map((point, idx) => idx === index ? { ...point, [field]: value } : point),
    }));
  };

  const updateHomeChartStat = (index, field, value) => {
    updateHomeGlassChartDraft(activeHomeChartTab, currentTab => ({
      ...currentTab,
      stats: (currentTab.stats || []).map((stat, idx) => idx === index ? { ...stat, [field]: value } : stat),
    }));
  };

  const handleSaveHomeGlassChart = () => {
    if (!setHomeGlassChart) {
      setToastMessage("Home glass chart manager is not connected.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setHomeGlassChart(homeGlassChartDraft);
    setToastMessage("Home glass chart updated successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderHomeGlassChartManagement = () => {
    const activeDraft = homeGlassChartDraft[activeHomeChartTab] || { points: [], stats: [] };
    const activeMeta = homeGlassChartTabs.find(tab => tab.id === activeHomeChartTab) || homeGlassChartTabs[0];
    const ActiveIcon = activeMeta.icon;

    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.statsGrid}>
          {homeGlassChartTabs.map(tab => {
            const tabData = homeGlassChartDraft[tab.id] || {};
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className="inner-blur-glass"
                onClick={() => setActiveHomeChartTab(tab.id)}
                style={{
                  ...styles.statCard,
                  textAlign: "left",
                  cursor: "pointer",
                  border: activeHomeChartTab === tab.id ? `1px solid ${tab.color}55` : styles.statCard.border,
                  background: activeHomeChartTab === tab.id ? `linear-gradient(135deg, ${tab.color}18, rgba(255,255,255,0.72))` : styles.statCard.background,
                  fontFamily: "inherit",
                }}
              >
                <div style={styles.statIconWrap}><TabIcon size={16} color={tab.color} /></div>
                <div style={{ ...styles.statValue, fontSize: "20px", marginTop: "10px" }}>{tabData.tabLabel || tab.label}</div>
                <div style={styles.statLabel}>{tabData.title || tab.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr", gap: "24px" }}>
          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Home Glass Chart Management</h3>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.58)", fontWeight: 600, maxWidth: "620px" }}>
                  Edit the Home page hero glass chart tabs, chart point labels, and metric badges.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveHomeGlassChart}
                style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <Save size={14} style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Save Home Chart</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "18px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Tab Label</span>
                <input value={activeDraft.tabLabel || ""} onChange={(e) => updateHomeChartField("tabLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Status Badge</span>
                <input value={activeDraft.status || ""} onChange={(e) => updateHomeChartField("status", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Chart Title</span>
                <input value={activeDraft.title || ""} onChange={(e) => updateHomeChartField("title", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Subtitle</span>
                <input value={activeDraft.subtitle || ""} onChange={(e) => updateHomeChartField("subtitle", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
              </label>
            </div>

            <h4 style={{ margin: "0 0 12px", fontSize: "13px", color: "#062018", fontWeight: 850 }}>Chart Points</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {(activeDraft.points || []).map((point, idx) => (
                <div key={point.id || idx} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.72)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input value={point.label || ""} onChange={(e) => updateHomeChartPoint(idx, "label", e.target.value)} placeholder="Point label" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  <input value={point.value || ""} onChange={(e) => updateHomeChartPoint(idx, "value", e.target.value)} placeholder="Point value" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </div>
              ))}
            </div>

            <h4 style={{ margin: "0 0 12px", fontSize: "13px", color: "#062018", fontWeight: 850 }}>Metric Badges</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
              {(activeDraft.stats || []).map((stat, idx) => (
                <div key={`${stat.label}-${idx}`} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.72)", display: "grid", gridTemplateColumns: "1fr 0.75fr 0.75fr", gap: "10px" }}>
                  <input value={stat.label || ""} onChange={(e) => updateHomeChartStat(idx, "label", e.target.value)} placeholder="Label" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  <input value={stat.value || ""} onChange={(e) => updateHomeChartStat(idx, "value", e.target.value)} placeholder="Value" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  <input value={stat.progress || ""} onChange={(e) => updateHomeChartStat(idx, "progress", e.target.value)} placeholder="Progress" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </div>
              ))}
            </div>
          </div>

          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "22px", background: "linear-gradient(150deg, rgba(255,255,255,0.78), rgba(240,253,244,0.46))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: `${activeMeta.color}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ActiveIcon size={20} color={activeMeta.color} />
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 850, color: activeMeta.color, textTransform: "uppercase" }}>{activeDraft.status || "Status"}</div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 850, color: "#062018" }}>{activeDraft.title || activeMeta.label}</h3>
                <p style={{ margin: "3px 0 0", fontSize: "12px", fontWeight: 650, color: "rgba(0,0,0,0.56)" }}>{activeDraft.subtitle || "Home page hero"}</p>
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.78)", marginBottom: "16px" }}>
              <svg viewBox="0 0 300 120" style={{ width: "100%", height: "150px", overflow: "visible" }}>
                <path d={(activeDraft.points || []).map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.cx || 0} ${point.cy || 60}`).join(" ")} fill="none" stroke={activeMeta.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {(activeDraft.points || []).map((point, idx) => (
                  <g key={point.id || idx}>
                    <text x={point.cx || 0} y={(point.cy || 60) - 12} fontSize="10" fill={activeMeta.color} textAnchor="middle" fontWeight="800">{point.value}</text>
                    <circle cx={point.cx || 0} cy={point.cy || 60} r={idx === (activeDraft.points || []).length - 1 ? 6 : 5} fill="#fff" stroke={activeMeta.color} strokeWidth="2.5" />
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {(activeDraft.stats || []).map((stat, idx) => (
                <div key={`${stat.label}-${idx}`} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.78)" }}>
                  <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.52)", fontWeight: 800, textTransform: "uppercase" }}>{stat.label}</div>
                  <div style={{ fontSize: "18px", fontWeight: 850, color: "#062018", margin: "5px 0" }}>{stat.value}</div>
                  <div style={{ height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: stat.progress || "0%", height: "100%", background: activeMeta.color, borderRadius: "999px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSurplusExchangeManagement = () => {
    const listings = Array.isArray(surplusListings) ? surplusListings : [];
    const visibleListings = listings.filter(listing => listing.status !== "Removed");
    const pendingCount = listings.filter(listing => listing.status === "Pending Review").length;
    const approvedCount = listings.filter(listing => listing.status === "Approved").length;
    const soldCount = listings.filter(listing => listing.status === "Sold").length;
    const totalValue = visibleListings.reduce((sum, listing) => sum + ((Number(listing.quantity) || 0) * (Number(listing.price) || 0)), 0);
    const surplusStats = [
      { label: "Pending Review", value: String(pendingCount), trend: pendingCount ? `+${pendingCount}` : "Clear", up: pendingCount === 0, icon: <Clock size={16} color="#f59e0b" /> },
      { label: "Approved Listings", value: String(approvedCount), trend: "Client visible", up: true, icon: <CheckCircle size={16} color="#16a34a" /> },
      { label: "Sold Listings", value: String(soldCount), trend: "Closed", up: true, icon: <ShoppingCart size={16} color="#0284c7" /> },
      { label: "Listing Value", value: `₱${totalValue.toLocaleString()}`, trend: "Gross", up: true, icon: <CreditCard size={16} color="#8b5cf6" /> },
    ];

    const surplusActions = (listing) => {
      if (listing.status === "Removed") {
        return [{ label: "Restore", status: "Pending Review", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" }];
      }
      if (listing.status === "Pending Review") {
        return [
          { label: "Approve", status: "Approved", color: "#15803d", bg: "rgba(22,163,74,0.1)" },
          { label: "Pause", status: "Paused", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
          { label: "Remove", status: "Removed", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
        ];
      }
      if (listing.status === "Approved") {
        return [
          { label: "Pause", status: "Paused", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
          { label: "Sold", status: "Sold", color: "#4b5563", bg: "rgba(107,114,128,0.1)" },
          { label: "Remove", status: "Removed", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
        ];
      }
      if (listing.status === "Sold") {
        return [
          { label: "Reopen", status: "Approved", color: "#15803d", bg: "rgba(22,163,74,0.1)" },
          { label: "Remove", status: "Removed", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
        ];
      }
      return [
        { label: "Approve", status: "Approved", color: "#15803d", bg: "rgba(22,163,74,0.1)" },
        { label: "Remove", status: "Removed", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
      ];
    };

    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.statsGrid}>
          {surplusStats.map((stat, idx) => (
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

        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Surplus Exchange Management</h3>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.58)", fontWeight: 600, maxWidth: "680px" }}>
                Review client-submitted surplus items, approve marketplace visibility, pause listings, mark sold items, or remove entries from the client-facing exchange.
              </p>
            </div>
            <button onClick={() => showAdminToast(`${listings.length} surplus listings synced from the client website.`)} style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
              <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
              <RefreshCcw size={14} style={{ position: "relative", zIndex: 1 }} />
              <span style={{ position: "relative", zIndex: 1 }}>Sync Listings</span>
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ ...styles.table, width: "100%", minWidth: "860px" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Seller</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr style={styles.tr}>
                    <td colSpan="8" style={{ ...styles.td, textAlign: "center", color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>No surplus listings submitted yet.</td>
                  </tr>
                ) : listings.map(listing => (
                  <tr key={listing.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 800, maxWidth: "220px" }}>
                      <div>{listing.product}</div>
                      <div style={{ marginTop: "4px", color: "rgba(0,0,0,0.5)", fontSize: "11px", fontWeight: 600, whiteSpace: "normal" }}>{listing.description || "No description provided."}</div>
                    </td>
                    <td style={styles.td}>{listing.farmer || listing.clientName || "Client Seller"}</td>
                    <td style={styles.td}>{listing.quantity}{listing.unit}</td>
                    <td style={styles.td}>₱{listing.price}/{listing.unit}</td>
                    <td style={styles.td}>{listing.location}</td>
                    <td style={styles.td}>{listing.submittedAt || "Website form"}</td>
                    <td style={styles.td}>
                      <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getManagedStatusStyle(listing.status || "Pending Review") }}>{listing.status || "Pending Review"}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {surplusActions(listing).map(action => (
                          <button key={`${listing.id}-${action.status}`} onClick={() => handleUpdateSurplusStatus(listing.id, action.status)} style={{ ...styles.actionBtn, color: action.color, background: action.bg, padding: "6px 10px", fontSize: "11px", fontWeight: 800 }}>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderExpertSupportManagement = () => {
    const config = {
      supportInfo: {
        badge: "Expert Support",
        titleLead: "Verified",
        titleAccent: "Agriculture Specialists",
        description: "Connect with our network of verified agriculture specialists and advisors for personalized guidance and support.",
        emergencyNote: "Emergency consultations prioritize urgent agricultural issues and are charged a premium rate.",
      },
      advisors: [],
      consultationTypes: [],
      faqs: [],
      timeSlots: [],
      defaultSuggestions: [],
      quickSuggestions: {},
      ...expertSupportConfig,
    };
    const coreServiceIds = ["video", "phone", "chat", "emergency"];
    const activeAdvisorCount = (config.advisors || []).filter(advisor => advisor.availability === "Available").length;
    const verifiedAdvisorCount = (config.advisors || []).filter(advisor => advisor.verified).length;
    const expertStats = [
      { label: "Specialists", value: String((config.advisors || []).length), trend: `${activeAdvisorCount} available`, up: activeAdvisorCount > 0, icon: <UserCheck size={16} color="#15803d" /> },
      { label: "Verified", value: String(verifiedAdvisorCount), trend: "Trust badge", up: true, icon: <ShieldCheck size={16} color="#0284c7" /> },
      { label: "Services", value: String((config.consultationTypes || []).length), trend: "Bookable", up: true, icon: <CalendarDays size={16} color="#f59e0b" /> },
      { label: "FAQ Items", value: String((config.faqs || []).length), trend: "Client help", up: true, icon: <MessageSquare size={16} color="#8b5cf6" /> },
    ];

    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.statsGrid}>
          {expertStats.map((stat, idx) => (
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

        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "20px" }}>
            <div>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Expert Support Page Info</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.58)", fontWeight: 600 }}>Control the client-facing heading, description, emergency notice, available times, and quick chat prompts.</p>
            </div>
            <button onClick={() => showAdminToast("Expert Support content synced to the client website.")} style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
              <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
              <Save size={14} style={{ position: "relative", zIndex: 1 }} />
              <span style={{ position: "relative", zIndex: 1 }}>Save Expert Support</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Badge Label</span>
              <input value={config.supportInfo.badge || ""} onChange={e => updateExpertSupportInfo("badge", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Title Lead</span>
              <input value={config.supportInfo.titleLead || ""} onChange={e => updateExpertSupportInfo("titleLead", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Accent Title</span>
              <input value={config.supportInfo.titleAccent || ""} onChange={e => updateExpertSupportInfo("titleAccent", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Time Slots</span>
              <input value={(config.timeSlots || []).join(", ")} onChange={e => updateExpertSupportSection("timeSlots", e.target.value.split(",").map(slot => slot.trim()).filter(Boolean))} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Page Description</span>
              <textarea value={config.supportInfo.description || ""} onChange={e => updateExpertSupportInfo("description", e.target.value)} rows={2} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </label>
            <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Emergency Note</span>
              <textarea value={config.supportInfo.emergencyNote || ""} onChange={e => updateExpertSupportInfo("emergencyNote", e.target.value)} rows={2} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </label>
            <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Default Quick Questions</span>
              <textarea value={(config.defaultSuggestions || []).join("\n")} onChange={e => updateExpertSupportSection("defaultSuggestions", e.target.value.split("\n").map(item => item.trim()).filter(Boolean))} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </label>
          </div>
        </div>

        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
            <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Specialists</h3>
            <button onClick={addExpertAdvisor} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "8px 14px", fontWeight: 800 }}>+ Add Specialist</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...styles.table, width: "100%", minWidth: "980px" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Expertise</th>
                  <th style={styles.th}>Availability</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>Verified</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(config.advisors || []).map(advisor => (
                  <tr key={advisor.id} style={styles.tr}>
                    <td style={styles.td}><input value={advisor.name || ""} onChange={e => updateExpertAdvisor(advisor.id, "name", e.target.value)} style={styles.editInput} /></td>
                    <td style={styles.td}><input value={advisor.image || ""} onChange={e => updateExpertAdvisor(advisor.id, "image", e.target.value)} style={styles.editInput} /></td>
                    <td style={styles.td}><input value={(advisor.expertise || []).join(", ")} onChange={e => updateExpertAdvisor(advisor.id, "expertise", e.target.value.split(",").map(item => item.trim()).filter(Boolean))} style={styles.editInput} /></td>
                    <td style={styles.td}>
                      <select value={advisor.availability || "Available"} onChange={e => updateExpertAdvisor(advisor.id, "availability", e.target.value)} style={styles.editInput}>
                        <option>Available</option>
                        <option>Not Available</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "grid", gap: "6px" }}>
                        <input value={advisor.availableDays || ""} onChange={e => updateExpertAdvisor(advisor.id, "availableDays", e.target.value)} style={styles.editInput} />
                        <input value={advisor.availableTime || ""} onChange={e => updateExpertAdvisor(advisor.id, "availableTime", e.target.value)} style={styles.editInput} />
                      </div>
                    </td>
                    <td style={styles.td}><input type="number" step="0.1" min="0" max="5" value={advisor.rating || 0} onChange={e => updateExpertAdvisor(advisor.id, "rating", Number(e.target.value))} style={styles.editInput} /></td>
                    <td style={styles.td}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700 }}>
                        <input type="checkbox" checked={Boolean(advisor.verified)} onChange={e => updateExpertAdvisor(advisor.id, "verified", e.target.checked)} />
                        Verified
                      </label>
                    </td>
                    <td style={styles.td}><button onClick={() => removeExpertAdvisor(advisor.id)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "6px 10px", fontWeight: 800 }}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
            {(config.advisors || []).map(advisor => (
              <label key={`${advisor.id}-bio`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>{advisor.name || "Specialist"} Bio</span>
                <textarea value={advisor.bio || ""} onChange={e => updateExpertAdvisor(advisor.id, "bio", e.target.value)} rows={2} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Consultation Services</h3>
              <button onClick={addExpertService} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "8px 14px", fontWeight: 800 }}>+ Add Service</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(config.consultationTypes || []).map(service => (
                <div key={service.id} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.05)", display: "grid", gap: "8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "8px" }}>
                    <input value={service.name || ""} onChange={e => updateExpertService(service.id, "name", e.target.value)} style={styles.editInput} />
                    <input type="number" value={service.price || 0} onChange={e => updateExpertService(service.id, "price", Number(e.target.value))} style={styles.editInput} />
                  </div>
                  <input value={service.duration || ""} onChange={e => updateExpertService(service.id, "duration", e.target.value)} style={styles.editInput} />
                  <textarea value={service.description || ""} onChange={e => updateExpertService(service.id, "description", e.target.value)} rows={2} style={{ ...styles.editInput, resize: "vertical", fontFamily: "inherit" }} />
                  <button disabled={coreServiceIds.includes(service.id)} onClick={() => removeExpertService(service.id)} style={{ ...styles.actionBtn, justifySelf: "start", color: coreServiceIds.includes(service.id) ? "#6b7280" : "#dc2626", background: coreServiceIds.includes(service.id) ? "rgba(107,114,128,0.1)" : "rgba(220,38,38,0.1)", padding: "6px 10px", fontWeight: 800, cursor: coreServiceIds.includes(service.id) ? "not-allowed" : "pointer" }}>{coreServiceIds.includes(service.id) ? "Core Service" : "Remove"}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>FAQs</h3>
              <button onClick={addExpertFaq} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "8px 14px", fontWeight: 800 }}>+ Add FAQ</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(config.faqs || []).map((faq, idx) => (
                <div key={`faq-${idx}`} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.05)", display: "grid", gap: "8px" }}>
                  <input value={faq.question || ""} onChange={e => updateExpertFaq(idx, "question", e.target.value)} style={styles.editInput} />
                  <textarea value={faq.answer || ""} onChange={e => updateExpertFaq(idx, "answer", e.target.value)} rows={2} style={{ ...styles.editInput, resize: "vertical", fontFamily: "inherit" }} />
                  <button onClick={() => removeExpertFaq(idx)} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "6px 10px", fontWeight: 800 }}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "18px" }}>Topic Quick Questions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
            {Object.entries(config.quickSuggestions || {}).map(([topic, suggestions]) => (
              <label key={topic} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>{topic}</span>
                <textarea value={(suggestions || []).join("\n")} onChange={e => updateExpertSupportSection("quickSuggestions", { ...(config.quickSuggestions || {}), [topic]: e.target.value.split("\n").map(item => item.trim()).filter(Boolean) })} rows={4} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderImpactSectorsManagement = () => {
    const defaultConfig = {
      pageInfo: {
        badge: "Our Impact",
        titleLead: "Driving Sustainable",
        titleAccent: "Change",
        description: "EcoEquity is committed to creating tangible positive change, from empowering local communities to fostering food security and environmental stewardship.",
        ctaLabel: "Explore More Impact",
        ctaNavTarget: "Learn More",
      },
      sectors: [
        { id: "lgu-partnerships", category: "LGU Partnerships", label: "LGU Partnerships", name: "LGU Partnerships Dashboard", metric: "42 Active LGUs", description: "Collaborating with local government units to implement sustainable agricultural programs and community initiatives.", status: "Expanding Network", badge: "Community Impact", navTarget: "LGUPartnershipPage", visible: true },
        { id: "income-generation", category: "Income Generation", label: "Income Generation", name: "Income Generation Impact", metric: "₱63M+ Annual GMV", description: "Empowering micro-vendors and farmers through direct market access and sustainable income streams.", status: "Continuous Growth", badge: "Economic Empowerment", navTarget: "IncomeGenerationPage", visible: true },
        { id: "native-seed-bank", category: "Native Seed Bank Program", label: "Native Seed Bank Program", name: "Native Seed Bank Management", metric: "250+ Varieties", description: "Preserving indigenous crop varieties and promoting biodiversity through community-managed seed banks.", status: "Growing Collection", badge: "Biodiversity", navTarget: "NativeSeedBankPage", visible: true },
        { id: "impact-tracking", category: "Impact Tracking", label: "Impact Tracking", name: "Environmental Impact Tracking", metric: "100+ Tons CO2 Reduced", description: "Monitoring and reporting key environmental metrics to ensure transparency and drive sustainable practices.", status: "Real-time Data", badge: "Climate Action", navTarget: "ImpactTrackingPage", visible: true },
      ],
      details: {
        "lgu-partnerships": {
          programs: [
            { id: "prog-1", program: "Urban Green Initiative", address: "Baguio City", status: "Active", startDate: "2023-01-15", description: "15 community gardens established, 500+ participants" },
            { id: "prog-2", program: "Sustainable Food Hub", address: "Davao City", status: "Active", startDate: "2023-03-01", description: "3 food hubs operational, 200+ local farmers supported" },
            { id: "prog-3", program: "Barangay Agri-Tech Program", address: "Quezon City", status: "Planning", startDate: "2024-06-01", description: "Awaiting implementation" },
            { id: "prog-4", program: "Coastal Farm Restoration", address: "Cebu City", status: "Completed", startDate: "2022-09-10", description: "10 hectares of coastal farms restored, 100+ families benefited" },
          ],
          managementItems: [
            { id: "mgmt-1", label: "Policy Integration", text: "Facilitating policy alignment for sustainable agriculture.", iconKey: "lightbulb" },
            { id: "mgmt-2", label: "Capacity Building", text: "Training programs for LGU personnel and community leaders.", iconKey: "users" },
          ]
        },
        "native-seed-bank": {
          programs: [
            { id: "nsb-prog-1", title: "Heirloom Seed Collection", desc: "Identifying, collecting, and cataloging rare and endangered native seed varieties across the Philippines.", icon: "🌾" },
            { id: "nsb-prog-2", title: "Community Seed Guardians", desc: "Training local farmers and community members to become stewards of native seeds, ensuring their long-term viability.", icon: "🧑‍🌾" },
            { id: "nsb-prog-3", title: "Digital Seed Registry", desc: "A comprehensive online database tracking all preserved seeds, their origins, and genetic information.", icon: "💻" },
          ],
          distribution: [
            { id: "dist-1", program: "LGU Seed Distribution", status: "Ongoing", count: "50+ LGUs" },
            { id: "dist-2", program: "Farmer Outreach Kits", status: "Active", count: "800+ Kits" },
            { id: "dist-3", program: "Research & Development", status: "Planned", count: "10+ Projects" }
          ],
          metrics: [
            { id: "met-1", label: "Biodiversity Index", value: 30, iconKey: "award" },
            { id: "met-2", label: "Retention Rate", value: 95, iconKey: "users" }
          ]
        }
      }
    };
    const config = {
      pageInfo: { ...defaultConfig.pageInfo, ...(impactSectorsConfig.pageInfo || {}) },
      sectors: defaultConfig.sectors.map(defaultSector => ({
        ...defaultSector,
        ...((Array.isArray(impactSectorsConfig.sectors) ? impactSectorsConfig.sectors : []).find(sector => sector.id === defaultSector.id) || {}),
      })),
      details: {
        ...defaultConfig.details,
        ...(impactSectorsConfig.details || {}),
        "lgu-partnerships": {
          ...(defaultConfig.details?.["lgu-partnerships"] || {}),
          ...(impactSectorsConfig.details?.["lgu-partnerships"] || {})
        },
        "native-seed-bank": {
          ...(defaultConfig.details?.["native-seed-bank"] || {}),
          ...(impactSectorsConfig.details?.["native-seed-bank"] || {})
        },
        "income-generation": {
          ...(defaultConfig.details?.["income-generation"] || {}),
          ...(impactSectorsConfig.details?.["income-generation"] || {})
        },
        "impact-tracking": {
          ...(defaultConfig.details?.["impact-tracking"] || {}),
          ...(impactSectorsConfig.details?.["impact-tracking"] || {})
        }
      },
    };
    const visibleCount = config.sectors.filter(sector => sector.visible !== false).length;
    const routeLabels = {
      LGUPartnershipPage: "LGU Partnership",
      IncomeGenerationPage: "Income Generation",
      NativeSeedBankPage: "Native Seed Bank",
      ImpactTrackingPage: "Impact Tracking",
    };
    const impactSectorStats = [
      { label: "Visible Buttons", value: String(visibleCount), trend: `${config.sectors.length} total`, up: visibleCount > 0, icon: <Globe size={16} color="#15803d" /> },
      { label: "Client Cards", value: String(config.sectors.length), trend: "Our Impact", up: true, icon: <Layout size={16} color="#0284c7" /> },
      { label: "Routes", value: "4", trend: "Locked", up: true, icon: <Navigation size={16} color="#f59e0b" /> },
      { label: "Content", value: "Live", trend: "Local Sync", up: true, icon: <CheckCircle size={16} color="#16a34a" /> },
    ];
    const fieldLabelStyle = { fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" };
    const pipeHintStyle = { margin: "2px 0 0", fontSize: "10px", color: "rgba(0,0,0,0.46)", fontWeight: 700 };
    const renderDetailEditor = (sector) => {
      const detail = config.details[sector.id] || {};
      const impactSectionTitleStyle = {
        margin: 0,
        fontSize: "14px",
        fontWeight: 900,
        background: "linear-gradient(90deg, #15803d, #4ade80)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      };

      const statValueInputStyle = { ...styles.editInput, ...ecoGlassInputStyle, fontSize: "16px", fontWeight: 800, textAlign: "center" };
      const statLabelInputStyle = { ...styles.editInput, ...ecoGlassInputStyle, fontSize: "13px", fontWeight: 800, textAlign: "center" };

      const statIconOptions = {
        handshake: <Globe size={16} color="#15803d" />,
        chart: <BarChart2 size={16} color="#0284c7" />,
        users: <Users size={16} color="#f59e0b" />,
        trend: <TrendingUp size={16} color="#15803d" />,
        store: <Package size={16} color="#0284c7" />,
        seed: <Wheat size={16} color="#15803d" />,
        globe: <Globe size={16} color="#0284c7" />,
        leaf: <Leaf size={16} color="#15803d" />,
        cloud: <Activity size={16} color="#0284c7" />,
      };
      const statIconChoices = [
        { value: "handshake", label: "Partnership" },
        { value: "chart", label: "Chart" },
        { value: "users", label: "Users" },
        { value: "trend", label: "Growth" },
        { value: "store", label: "Store" },
        { value: "seed", label: "Seed" },
        { value: "globe", label: "Globe" },
        { value: "leaf", label: "Leaf" },
        { value: "cloud", label: "Impact" },
      ];
      const defaultStatIconBySector = {
        "lgu-partnerships": "handshake",
        "income-generation": "trend",
        "native-seed-bank": "seed",
        "impact-tracking": "leaf",
      };

      const statFieldCaptionStyle = {
        fontSize: "10px",
        fontWeight: 900,
        color: "rgba(0,0,0,0.42)",
        textTransform: "uppercase",
        textAlign: "center",
      };
      const statFieldCaptionLeftStyle = {
        fontSize: "11px",
        fontWeight: 800,
        color: "rgba(0,0,0,0.58)",
        textTransform: "uppercase",
      };

      const renderTopStatCardsEditor = (title, stats = [], showProgress = false) => (
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
            <h4 style={impactSectionTitleStyle}>{title}</h4>
            <button
              onClick={() => addImpactSectorDetailListItem(sector.id, "stats", {
                label: "New Top Card",
                value: "0",
                iconKey: defaultStatIconBySector[sector.id] || "chart",
                ...(showProgress ? { progress: 50 } : {}),
              }, "Top card added.")}
              style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}
            >
              + Add Card
            </button>
          </div>
          <div style={{ ...styles.statsGrid, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            {stats.map((stat, index) => (
              <div key={`${stat.label}-${index}`} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", textAlign: "center", minHeight: "172px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={styles.statIconWrap}>{statIconOptions[stat.iconKey] || <Activity size={16} color="#15803d" />}</div>
                  {showProgress && (
                    <span style={{ ...styles.trendBadge, color: "#15803d", background: "rgba(22,163,74,0.1)" }}>
                      {Math.max(0, Math.min(100, Number(stat.progress) || 0))}%
                    </span>
                  )}
                </div>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionStyle}>Icon</span>
                  <AdminEcoDropdown 
                    value={stat.iconKey || defaultStatIconBySector[sector.id] || "chart"} 
                    options={statIconChoices} 
                    onChange={val => updateImpactSectorDetailListItem(sector.id, "stats", index, "iconKey", val)} 
                    compact 
                  />
                </label>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionStyle}>Title</span>
                  <input aria-label={`${stat.label || "Stat"} title`} value={stat.label || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "stats", index, "label", e.target.value)} style={statLabelInputStyle} />
                </label>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionStyle}>Value</span>
                  <input aria-label={`${stat.label || "Stat"} value`} value={stat.value || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "stats", index, "value", e.target.value)} style={statValueInputStyle} />
                </label>
                {showProgress && (
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionStyle}>Progress: {Math.max(0, Math.min(100, Number(stat.progress) || 0))}%</span>
                    <div style={{ ...styles.editInput, ...ecoGlassInputStyle, display: "flex", alignItems: "center", padding: "0 14px", height: "42px" }}>
                      <input type="range" min="0" max="100" value={Math.max(0, Math.min(100, Number(stat.progress) || 0))} onChange={e => updateImpactSectorDetailListItem(sector.id, "stats", index, "progress", Number(e.target.value))} style={{ width: "100%", accentColor: "#15803d", cursor: "pointer" }} />
                    </div>
                  </label>
                )}
                <button
                  onClick={() => removeImpactSectorDetailListItem(sector.id, "stats", index, "Top card removed.")}
                  style={{ ...styles.actionBtn, justifySelf: "center", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "6px 10px", fontWeight: 800 }}
                >
                  Remove Card
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      const commonHeader = renderTopStatCardsEditor("Top Stat Cards", detail.stats || []);

      if (sector.id === "lgu-partnerships") {
        const lguStats = detail.stats || [];
        const lguPrograms = detail.programs || [];
        const managementItems = detail.managementItems || [];
        return (
          <div style={{ display: "grid", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginTop: "8px" }}>
            {renderTopStatCardsEditor("LGU Top Cards", lguStats)}

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Collaboration Programs</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "programs", { program: "New Collaboration Program", address: "LGU / Address", status: "Planning", startDate: new Date().toISOString().slice(0, 10), description: "Describe this LGU collaboration program." }, "LGU collaboration program added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Program</button>
              </div>
              {lguPrograms.map((program, index) => (
                <div key={program.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><MapPin size={16} color="#15803d" /></div>
                    <div style={{ width: "130px" }}>
                      <AdminEcoDropdown 
                        value={program.status || "Planning"} 
                        options={[{value:"Active",label:"Active"},{value:"Planning",label:"Planning"},{value:"Completed",label:"Completed"},{value:"Paused",label:"Paused"}]} 
                        onChange={val => updateImpactSectorDetailListItem(sector.id, "programs", index, "status", val)} 
                        compact align="right" 
                      />
                    </div>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Title</span>
                    <input value={program.program || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "program", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "10px" }}>
                    <label style={{ display: "grid", gap: "4px" }}>
                      <span style={statFieldCaptionLeftStyle}>Address</span>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <MapPin size={14} color="#15803d" style={{ position: "absolute", left: "12px" }} />
                        <input value={program.address || program.lgu || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "address", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle, paddingLeft: "34px" }} />
                      </div>
                    </label>
                    <label style={{ display: "grid", gap: "4px" }}>
                      <span style={statFieldCaptionLeftStyle}>Date</span>
                      <input type="date" value={program.startDate || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "startDate", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "8px 12px", height: "42px" }} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Description</span>
                    <textarea value={program.description || program.impact || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "description", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "programs", index, "LGU collaboration program removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Program</button>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Institutional Management Forms</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "managementItems", { label: "New Management Feature", text: "Add a description for this institutional management feature.", iconKey: "lightbulb" }, "Institutional management item added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Feature</button>
              </div>
              {managementItems.map((item, index) => (
                <div key={`${item.label}-${index}`} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={styles.statIconWrap}><CheckCircle size={16} color="#15803d" /></div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Title</span>
                    <input value={item.label || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "managementItems", index, "label", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Description</span>
                    <textarea value={item.text || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "managementItems", index, "text", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "managementItems", index, "Institutional management item removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Feature</button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (sector.id === "income-generation") {
        const incomeStats = detail.stats || [];
        const supportPrograms = detail.programs || [];
        return (
          <div style={{ display: "grid", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginTop: "8px" }}>
            {renderTopStatCardsEditor("Income Generation Top Cards", incomeStats, true)}
            <div style={{ display: "grid", gap: "12px" }}>
              <h4 style={impactSectionTitleStyle}>Chart Configuration</h4>
              <div className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Chart Title</span>
                  <input value={detail.chartTitle || ""} onChange={e => updateImpactSectorDetail(sector.id, "chartTitle", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </label>
              </div>
            </div>
            
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Community Adoption Growth</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "chartBars", { label: "New Group", value: 50, color: "#16a34a" }, "Chart bar added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Bar</button>
              </div>
              {(detail.chartBars || []).map((bar, index) => (
                <div key={bar.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><BarChart2 size={16} color="#15803d" /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Color</span>
                      <input type="color" value={bar.color || "#16a34a"} onChange={e => updateImpactSectorDetailListItem(sector.id, "chartBars", index, "color", e.target.value)} style={{...styles.editInput, ...ecoGlassInputStyle, padding: "2px", height: "32px", width: "40px"}} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Label</span>
                    <input value={bar.label || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "chartBars", index, "label", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Progress: {Math.max(0, Math.min(100, Number(bar.value) || 0))}%</span>
                    <div style={{ ...styles.editInput, ...ecoGlassInputStyle, display: "flex", alignItems: "center", padding: "0 14px", height: "42px" }}>
                      <input type="range" min="0" max="100" value={Math.max(0, Math.min(100, Number(bar.value) || 0))} onChange={e => updateImpactSectorDetailListItem(sector.id, "chartBars", index, "value", Number(e.target.value))} style={{ width: "100%", accentColor: "#15803d", cursor: "pointer" }} />
                    </div>
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "chartBars", index, "Chart bar removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Bar</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Support Programs</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "programs", { title: "New Support Program", desc: "Describe this income support program.", status: "50% Progress", impact: "50% Progress", progress: 50 }, "Income support program added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Program</button>
              </div>
              {supportPrograms.map((program, index) => (
                <div key={program.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><CheckCircle size={16} color="#15803d" /></div>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Title</span>
                    <input value={program.title || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "title", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Impact Badge Text</span>
                    <input value={program.impact || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "impact", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Description</span>
                    <textarea value={program.desc || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "desc", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "programs", index, "Income support program removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Program</button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (sector.id === "native-seed-bank") {
        const preservationPrograms = detail.programs || [];
        return (
          <div style={{ display: "grid", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginTop: "8px" }}>
            {commonHeader}
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Preservation Programs</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "programs", { title: "New Program", desc: "Describe this program.", icon: "🌱" }, "Preservation program added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Program</button>
              </div>
              {preservationPrograms.map((program, index) => (
                <div key={program.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><Leaf size={16} color="#15803d" /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Icon</span>
                      <input value={program.icon || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "icon", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "2px", height: "32px", width: "40px", textAlign: "center" }} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Title</span>
                    <input value={program.title || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "title", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Description</span>
                    <textarea value={program.desc || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "programs", index, "desc", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "programs", index, "Preservation program removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Program</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <h4 style={impactSectionTitleStyle}>Section Labels</h4>
              <div className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "16px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Distribution Title</span>
                  <input value={detail.distributionTitle || ""} onChange={e => updateImpactSectorDetail(sector.id, "distributionTitle", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </label>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Distribution CTA</span>
                  <input value={detail.distributionCtaLabel || ""} onChange={e => updateImpactSectorDetail(sector.id, "distributionCtaLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </label>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Metrics Title</span>
                  <input value={detail.metricsTitle || ""} onChange={e => updateImpactSectorDetail(sector.id, "metricsTitle", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </label>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Metrics CTA</span>
                  <input value={detail.metricsCtaLabel || ""} onChange={e => updateImpactSectorDetail(sector.id, "metricsCtaLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                </label>
              </div>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Distribution Tracking</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "distribution", { program: "New Program", count: "0", status: "Planned" }, "Distribution tracking item added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Tracking</button>
              </div>
              {(detail.distribution || []).map((item, index) => (
                <div key={item.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><Truck size={16} color="#15803d" /></div>
                    <div style={{ width: "130px" }}>
                      <AdminEcoDropdown 
                        value={item.status || "Planned"} 
                        options={[{value:"Ongoing",label:"Ongoing"},{value:"Active",label:"Active"},{value:"Planned",label:"Planned"}]} 
                        onChange={val => updateImpactSectorDetailListItem(sector.id, "distribution", index, "status", val)} 
                        compact align="right" 
                      />
                    </div>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Title</span>
                    <input value={item.program || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "distribution", index, "program", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Value</span>
                    <input value={item.count || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "distribution", index, "count", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "distribution", index, "Distribution tracking item removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Tracking</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Metric Tiles</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "metrics", { label: "New Metric", value: 50, iconKey: "leaf" }, "Metric tile added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Metric</button>
              </div>
              {(detail.metrics || []).map((item, index) => (
                <div key={item.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><Activity size={16} color="#15803d" /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Icon Key</span>
                      <input value={item.iconKey || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "iconKey", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle, width: "80px", padding: "4px 8px" }} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Label</span>
                    <input value={item.label || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "label", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Progress: {Math.max(0, Math.min(100, Number(item.value) || 0))}%</span>
                    <div style={{ ...styles.editInput, ...ecoGlassInputStyle, display: "flex", alignItems: "center", padding: "0 14px", height: "42px" }}>
                      <input type="range" min="0" max="100" value={Math.max(0, Math.min(100, Number(item.value) || 0))} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "value", Number(e.target.value))} style={{ width: "100%", accentColor: "#15803d", cursor: "pointer" }} />
                    </div>
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "metrics", index, "Sustainability metric removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Metric</button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (sector.id === "impact-tracking") {
        const impactStats = detail.stats || [];
        return (
          <div style={{ display: "grid", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginTop: "8px" }}>
            {renderTopStatCardsEditor("Impact Tracking Top Cards", impactStats)}
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Community Impact Areas</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "chartBars", { label: "New Area", value: 50, color: "#16a34a" }, "Impact area added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Area</button>
              </div>
              {(detail.chartBars || []).map((bar, index) => (
                <div key={bar.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><BarChart2 size={16} color="#15803d" /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Color</span>
                      <input type="color" value={bar.color || "#16a34a"} onChange={e => updateImpactSectorDetailListItem(sector.id, "chartBars", index, "color", e.target.value)} style={{...styles.editInput, ...ecoGlassInputStyle, padding: "2px", height: "32px", width: "40px"}} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Area Label</span>
                    <input value={bar.label || bar.area || ""} onChange={e => {
                      updateImpactSectorDetailListItem(sector.id, "chartBars", index, "label", e.target.value);
                      updateImpactSectorDetailListItem(sector.id, "chartBars", index, "area", e.target.value);
                    }} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Progress: {Math.max(0, Math.min(100, Number(bar.value || bar.progress) || 0))}%</span>
                    <div style={{ ...styles.editInput, ...ecoGlassInputStyle, display: "flex", alignItems: "center", padding: "0 14px", height: "42px" }}>
                      <input type="range" min="0" max="100" value={Math.max(0, Math.min(100, Number(bar.value || bar.progress) || 0))} onChange={e => {
                        updateImpactSectorDetailListItem(sector.id, "chartBars", index, "value", Number(e.target.value));
                        updateImpactSectorDetailListItem(sector.id, "chartBars", index, "progress", Number(e.target.value));
                      }} style={{ width: "100%", accentColor: "#15803d", cursor: "pointer" }} />
                    </div>
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "chartBars", index, "Impact area removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Area</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h4 style={impactSectionTitleStyle}>Environmental Metrics</h4>
                <button onClick={() => addImpactSectorDetailListItem(sector.id, "metrics", { label: "New Metric", value: "50 Tons", iconKey: "leaf" }, "Metric tile added.")} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "7px 11px", fontWeight: 800 }}>+ Add Metric</button>
              </div>
              {(detail.metrics || []).map((item, index) => (
                <div key={item.id || index} className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={styles.statIconWrap}><Activity size={16} color="#15803d" /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Icon Key</span>
                      <input value={item.iconKey || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "iconKey", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle, width: "80px", padding: "4px 8px" }} />
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Label</span>
                    <input value={item.label || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "label", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Value</span>
                    <input value={item.value || ""} onChange={e => updateImpactSectorDetailListItem(sector.id, "metrics", index, "value", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <button onClick={() => removeImpactSectorDetailListItem(sector.id, "metrics", index, "Metric removed.")} style={{ ...styles.actionBtn, justifySelf: "start", color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}>Remove Metric</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <h4 style={impactSectionTitleStyle}>People Reached</h4>
              <div className="inner-blur-glass" style={{ ...styles.statCard, display: "grid", gap: "12px", padding: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Value</span>
                    <input value={detail.peopleValue || ""} onChange={e => updateImpactSectorDetail(sector.id, "peopleValue", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={statFieldCaptionLeftStyle}>Label</span>
                    <input value={detail.peopleLabel || ""} onChange={e => updateImpactSectorDetail(sector.id, "peopleLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                </div>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={statFieldCaptionLeftStyle}>Description</span>
                  <textarea value={detail.peopleDescription || ""} onChange={e => updateImpactSectorDetail(sector.id, "peopleDescription", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }} />
                </label>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.statsGrid}>
          {impactSectorStats.map((stat, idx) => (
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

        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Impact Sector Page Info</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.58)", fontWeight: 600 }}>Manage the heading and call-to-action above the four client sector buttons.</p>
            </div>
            <button onClick={() => showAdminToast("Impact sectors synced to the client website.")} style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
              <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
              <Save size={14} style={{ position: "relative", zIndex: 1 }} />
              <span style={{ position: "relative", zIndex: 1 }}>Save Impact Sectors</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Badge Label</span>
              <input value={config.pageInfo.badge || ""} onChange={e => updateImpactSectorPageInfo("badge", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>CTA Label</span>
              <input value={config.pageInfo.ctaLabel || ""} onChange={e => updateImpactSectorPageInfo("ctaLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Title Lead</span>
              <input value={config.pageInfo.titleLead || ""} onChange={e => updateImpactSectorPageInfo("titleLead", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Accent Title</span>
              <input value={config.pageInfo.titleAccent || ""} onChange={e => updateImpactSectorPageInfo("titleAccent", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
            </label>
            <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Page Description</span>
              <textarea value={config.pageInfo.description || ""} onChange={e => updateImpactSectorPageInfo("description", e.target.value)} rows={3} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
          {config.sectors.map(sector => {
            const sectorBgs = {
              "lgu-partnerships": "linear-gradient(150deg, rgba(14,165,233,0.12), rgba(255,255,255,0.6))",
              "income-generation": "linear-gradient(150deg, rgba(245,158,11,0.12), rgba(255,255,255,0.6))",
              "native-seed-bank": "linear-gradient(150deg, rgba(34,197,94,0.12), rgba(255,255,255,0.6))",
              "impact-tracking": "linear-gradient(150deg, rgba(168,85,247,0.12), rgba(255,255,255,0.6))",
            };
            const sectorBorders = {
              "lgu-partnerships": "1px solid rgba(14,165,233,0.25)",
              "income-generation": "1px solid rgba(245,158,11,0.25)",
              "native-seed-bank": "1px solid rgba(34,197,94,0.25)",
              "impact-tracking": "1px solid rgba(168,85,247,0.25)",
            };
            return (
            <div key={sector.id} className="inner-blur-glass" style={{ ...styles.chartCard, padding: "22px", display: "grid", gap: "12px", background: sectorBgs[sector.id] || styles.chartCard.background, border: sectorBorders[sector.id] || styles.chartCard.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <h3 style={{ ...styles.cardHeading, fontSize: "17px", marginBottom: "4px" }}>{sector.category}</h3>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.48)", textTransform: "uppercase" }}>{routeLabels[sector.navTarget] || sector.navTarget}</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800, color: "#15803d" }}>
                  <input type="checkbox" checked={sector.visible !== false} onChange={e => updateImpactSector(sector.id, "visible", e.target.checked)} />
                  Visible
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Button Label</span>
                  <input value={sector.label || ""} onChange={e => updateImpactSector(sector.id, "label", e.target.value)} style={styles.editInput} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Card Badge</span>
                  <input value={sector.badge || ""} onChange={e => updateImpactSector(sector.id, "badge", e.target.value)} style={styles.editInput} />
                </label>
                <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Card Title</span>
                  <input value={sector.name || ""} onChange={e => updateImpactSector(sector.id, "name", e.target.value)} style={styles.editInput} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Main Metric</span>
                  <input value={sector.metric || ""} onChange={e => updateImpactSector(sector.id, "metric", e.target.value)} style={styles.editInput} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Status Text</span>
                  <input value={sector.status || ""} onChange={e => updateImpactSector(sector.id, "status", e.target.value)} style={styles.editInput} />
                </label>
                <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Description</span>
                  <textarea value={sector.description || ""} onChange={e => updateImpactSector(sector.id, "description", e.target.value)} rows={3} style={{ ...styles.editInput, resize: "vertical", fontFamily: "inherit" }} />
                </label>
              </div>
              {renderDetailEditor(sector)}
            </div>
          )})}
        </div>
      </div>
    );
  };

  const renderSupplierInventoryManagement = () => {
    const lowStockItems = supplierItems.filter(item => ["Low Stock", "Reorder", "Out of Stock"].includes(item.status));
    const supplierContacts = [...new Map(supplierItems
      .filter(item => item.supplier)
      .map(item => [item.supplier, item]))
      .values()
    ];

    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.statsGrid}>
          {supplierInventoryStats.map((stat, idx) => (
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

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Supplier Item Management</h3>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.58)", fontWeight: 600, maxWidth: "680px" }}>
                  Add supplier items, update stock levels, track reorder points, and manage supplier contacts from one admin workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSupplierItem}
                style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <Package size={14} style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Add Supplier Item</span>
              </button>
            </div>

            {editingSupplierItem && (
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "18px", marginBottom: "20px", background: "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(14,165,233,0.04))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>
                    {editingSupplierItem.isNew ? "New Supplier Item" : `Manage ${editingSupplierItem.item}`}
                  </h4>
                  <span style={{ padding: "5px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getManagedStatusStyle(editingSupplierItem.status) }}>{editingSupplierItem.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Item Name</span>
                    <input value={editingSupplierItem.item} onChange={e => handleSupplierDraftChange("item", e.target.value)} placeholder="e.g. Tomato Success Kit" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Category</span>
                    <input value={editingSupplierItem.category} onChange={e => handleSupplierDraftChange("category", e.target.value)} placeholder="Seed Kit, Soil, Tools" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Supplier</span>
                    <input value={editingSupplierItem.supplier} onChange={e => handleSupplierDraftChange("supplier", e.target.value)} placeholder="Supplier name" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Stock</span>
                    <input type="number" min="0" value={editingSupplierItem.stock} onChange={e => handleSupplierDraftChange("stock", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Unit</span>
                    <input value={editingSupplierItem.unit} onChange={e => handleSupplierDraftChange("unit", e.target.value)} placeholder="units, packs, sacks" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Reorder Point</span>
                    <input type="number" min="0" value={editingSupplierItem.reorderPoint} onChange={e => handleSupplierDraftChange("reorderPoint", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Status</span>
                    <select value={editingSupplierItem.status} onChange={e => handleSupplierDraftChange("status", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                      {supplierStatusOptions.filter(status => status !== "All").map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Lead Time</span>
                    <input value={editingSupplierItem.leadTime} onChange={e => handleSupplierDraftChange("leadTime", e.target.value)} placeholder="e.g. 3 days" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Contact</span>
                    <input type="email" value={editingSupplierItem.contact} onChange={e => handleSupplierDraftChange("contact", e.target.value)} placeholder="orders@supplier.ph" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                  </label>
                  <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Notes</span>
                    <textarea value={editingSupplierItem.notes} onChange={e => handleSupplierDraftChange("notes", e.target.value)} rows={3} placeholder="Internal supplier notes..." style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                  <button type="button" onClick={handleCancelSupplierItemEdit} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "9px 14px", fontWeight: 800 }}><X size={14} /> Cancel</button>
                  <button type="button" onClick={handleSaveSupplierItem} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "9px 14px", fontWeight: 800 }}><Save size={14} /> Save Supplier Item</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "16px" }}>
              <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)", minWidth: "260px" }}>
                <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                <input type="text" placeholder="Search supplier items..." value={supplierSearchTerm} onChange={(e) => setSupplierSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                <select value={supplierStatusFilter} onChange={(e) => setSupplierStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 700 }}>
                  {supplierStatusOptions.map(status => <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ ...styles.table, width: "100%", minWidth: "880px" }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Item</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Supplier</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Reorder</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Updated</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplierItems.length > 0 ? filteredSupplierItems.map(item => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 800 }}>
                        <div>{item.item}</div>
                        <div style={{ marginTop: "4px", color: "rgba(0,0,0,0.52)", fontSize: "11px", fontWeight: 600, maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.notes || "No notes"}</div>
                      </td>
                      <td style={styles.td}>{item.category}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700 }}>{item.supplier}</div>
                        <div style={{ marginTop: "3px", color: "rgba(0,0,0,0.52)", fontSize: "10px", fontWeight: 650 }}>{item.contact || "No contact"}</div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 800, color: Number(item.stock) <= Number(item.reorderPoint) ? "#e11d48" : "#15803d" }}>{getSupplierItemStockText(item)}</td>
                      <td style={styles.td}>{item.reorderPoint} {item.unit}</td>
                      <td style={styles.td}><span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getManagedStatusStyle(item.status) }}>{item.status}</span></td>
                      <td style={styles.td}>{item.updatedAt}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button type="button" onClick={() => handleEditSupplierItem(item)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }} title="Manage supplier item"><Edit2 size={14} /></button>
                          <button type="button" onClick={() => handleDeleteSupplierItem(item.id)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)" }} title="Remove supplier item"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr style={styles.tr}>
                      <td colSpan="8" style={{ ...styles.td, textAlign: "center", padding: "30px", color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>No supplier items match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(255,255,255,0.62))" }}>
              <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "14px", color: "#b45309" }}>Reorder Watch</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {lowStockItems.length > 0 ? lowStockItems.slice(0, 5).map(item => (
                  <button key={`${item.id}-watch`} type="button" onClick={() => handleEditSupplierItem(item)} style={{ textAlign: "left", padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.68)", border: "1px solid rgba(245,158,11,0.18)", cursor: "pointer", fontFamily: "inherit" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 850, color: "#062018" }}>{item.item}</span>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#b45309" }}>{item.status}</span>
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>{getSupplierItemStockText(item)} available, reorder at {item.reorderPoint} {item.unit}</div>
                  </button>
                )) : (
                  <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.68)", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>All tracked supplier items are above reorder thresholds.</div>
                )}
              </div>
            </div>

            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
              <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "14px" }}>Supplier Contacts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {supplierContacts.slice(0, 6).map(item => (
                  <button key={`${item.supplier}-contact`} type="button" onClick={() => setSupplierSearchTerm(item.supplier)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.64)", border: "1px solid rgba(255,255,255,0.72)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <Truck size={14} color="#16a34a" />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#062018", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.supplier}</span>
                      <span style={{ display: "block", fontSize: "10px", fontWeight: 650, color: "rgba(0,0,0,0.52)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.contact || item.leadTime || "No contact listed"}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManagedSection = (section) => {
    if (section.title === "Inventory & Suppliers") {
      return renderSupplierInventoryManagement();
    }

    const managedItems = getManagedSectionItems(section);
    const managedStats = getManagedSectionStats(section);

    return (
    <div style={styles.dashboardContainer}>
      <div style={styles.statsGrid}>
        {managedStats.map((stat, idx) => (
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
        <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>{section.title}</h3>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.58)", fontWeight: 600, maxWidth: "620px" }}>{section.description}</p>
            </div>
            <button
              onClick={() => {
                setToastMessage(`${section.actionLabel} saved for review.`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
              <Save size={14} style={{ position: "relative", zIndex: 1 }} />
              <span style={{ position: "relative", zIndex: 1 }}>{section.actionLabel}</span>
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ ...styles.table, width: "100%", minWidth: "720px" }}>
              <thead>
                <tr>
                  {section.columns.map(column => (
                    <th key={column} style={styles.th}>{column}</th>
                  ))}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managedItems.map((item, idx) => (
                  <tr key={`${section.title}-${idx}`} style={styles.tr}>
                    {section.columns.map((column, colIdx) => {
                      const value = getManagedCellValue(item, column);
                      const isStatus = column === "Status" || column === "Priority";
                      return (
                        <td key={column} style={{ ...styles.td, fontWeight: colIdx === 0 ? 700 : 600, maxWidth: colIdx === 0 ? "260px" : "180px" }}>
                          {isStatus ? (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getManagedStatusStyle(value) }}>{value}</span>
                          ) : (
                            <span style={{ color: colIdx === 0 ? "#000" : "rgba(0,0,0,0.68)" }}>{value}</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)" }}><Edit2 size={14} /></button>
                        <button style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)" }}><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
            <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Quick Editor</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder={`${section.title} title`} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
              <textarea placeholder="Short website-facing note" rows={4} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit", minHeight: "92px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select defaultValue="Published" style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                  <option>Published</option>
                  <option>Scheduled</option>
                  <option>Review</option>
                  <option>Draft</option>
                </select>
                <select defaultValue="Homepage" style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                  <option>Homepage</option>
                  <option>Marketplace</option>
                  <option>Events</option>
                  <option>Learning</option>
                  <option>Impact</option>
                </select>
              </div>
            </div>
          </div>

          <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(14,165,233,0.04))" }}>
            <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px", color: "#15803d" }}>{section.sideTitle}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {section.sideItems.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.64)", border: "1px solid rgba(255,255,255,0.72)" }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.72)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setProductToDelete(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button type="button" aria-label="Close delete product modal" onClick={() => setProductToDelete(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111827" }}><X size={15} /></button>
=======
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setHarvestToDelete(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button type="button" aria-label="Close delete crop modal" onClick={() => setHarvestToDelete(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111827" }}><X size={15} /></button>
=======
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #fff1f2)", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(225, 29, 72, 0.1)", boxShadow: "0 20px 40px rgba(225, 29, 72, 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => setEditingPromo(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "400px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button type="button" aria-label="Close promo modal" onClick={() => setEditingPromo(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
=======
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "400px", position: "relative" }}>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Plan:</span> <span style={{ fontSize: "13px", fontWeight: 800, color: getManagedPlanColor(selectedSubscriber.plan) }}>{selectedSubscriber.plan}</span></div>
=======
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Plan:</span> <span style={{ fontSize: "13px", fontWeight: 800, color: selectedSubscriber.plan === "Pro" ? "#f59e0b" : selectedSubscriber.plan === "Enterprise" ? "#0ea5e9" : "#64748b" }}>{selectedSubscriber.plan}</span></div>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Status:</span> <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, ...getSubStatusStyle(selectedSubscriber.status) }}>{selectedSubscriber.status}</span></div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Payment:</span> <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.7)" }}>{selectedSubscriber.payment}</span></div>
                 <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Renewal:</span> <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.7)" }}>{selectedSubscriber.renewal}</span></div>
               </div>
               {(() => {
<<<<<<< HEAD
                 const pct = (selectedSubscriber.monthlyUsage / selectedSubscriber.usageLimit) * 100;
=======
                 const pct = (selectedSubscriber.aiScans / selectedSubscriber.aiLimit) * 100;
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                 const isNearLimit = pct >= 80 && pct < 100;
                 const isAtLimit = pct >= 100;
                 return (
                   <div style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "0 8px 22px rgba(0,0,0,0.06)" }}>
<<<<<<< HEAD
                     <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>2</span> Monthly Usage</h4>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                       <span>Plan Uses</span>
                       <span style={{ color: isAtLimit ? "#dc2626" : isNearLimit ? "#f97316" : "#15803d" }}>{selectedSubscriber.monthlyUsage} / {selectedSubscriber.usageLimit}</span>
=======
                     <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>2</span> AI Usage</h4>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                       <span>Plant Scans</span>
                       <span style={{ color: isAtLimit ? "#dc2626" : isNearLimit ? "#f97316" : "#15803d" }}>{selectedSubscriber.aiScans} / {selectedSubscriber.aiLimit}</span>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                     </div>
                     <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                       <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: isAtLimit ? "#dc2626" : isNearLimit ? "#f97316" : "linear-gradient(90deg, #16a34a, #4ade80)", borderRadius: "999px", animation: isNearLimit ? "warningPulse 1.5s infinite" : "none" }} />
                     </div>
                     {isNearLimit && (
<<<<<<< HEAD
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#f97316", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> Only {selectedSubscriber.usageLimit - selectedSubscriber.monthlyUsage} uses remaining this month</p>
                     )}
                     {isAtLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#dc2626", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> Limit reached. Upgrade to unlock higher monthly usage.</p>
=======
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#f97316", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> ⚠️ Only {selectedSubscriber.aiLimit - selectedSubscriber.aiScans} scans remaining this month</p>
                     )}
                     {isAtLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#dc2626", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> 🔒 Limit reached. Upgrade to unlock unlimited diagnostics.</p>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                     )}
                   </div>
                 );
               })()}
               
               <div style={{ background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>3</span> Manage Plan</h4>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(6,32,24,0.62)", display: "block", marginBottom: "6px" }}>Plan</label>
<<<<<<< HEAD
                     <AdminEcoDropdown value={editableSubscriber?.plan || selectedSubscriber.plan} options={managedSubscriptionPlanOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), plan: value, usageLimit: getManagedPlanLimit(value) })} />
=======
                     <AdminEcoDropdown value={editableSubscriber?.plan || selectedSubscriber.plan} options={subscriptionPlanOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), plan: value, aiLimit: value === "Basic" ? 10 : value === "Pro" ? 100 : 5000 })} />
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                   <div style={{ padding: "7px 9px", background: "rgba(249,115,22,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#c2410c", fontWeight: 600 }}><AlertCircle size={13} /> Subscription usage limit almost reached</div>
=======
                   <div style={{ padding: "7px 9px", background: "rgba(249,115,22,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#c2410c", fontWeight: 600 }}><AlertCircle size={13} /> AI Scan limit almost reached</div>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                   <input type="text" placeholder="Title (e.g. New workshop schedule available)" value={subscriberCampaignForm.title} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, title: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px" }} />
                   <textarea placeholder="Message body (e.g. Seats are open for the new composting workshop...)" rows={2} value={subscriberCampaignForm.message} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, message: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px", resize: "none", fontFamily: "inherit", minHeight: "56px" }} />
=======
                   <input type="text" placeholder="Title (e.g. New AI Plant Doctor update available)" value={subscriberCampaignForm.title} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, title: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px" }} />
                   <textarea placeholder="Message body (e.g. You can now detect 20+ new crop diseases...)" rows={2} value={subscriberCampaignForm.message} onChange={e => setSubscriberCampaignForm({...subscriberCampaignForm, message: e.target.value})} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "9px 11px", fontSize: "12px", borderRadius: "12px", resize: "none", fontFamily: "inherit", minHeight: "56px" }} />
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); setIsViewingEventAttendees(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: isViewingEventAttendees ? "860px" : "550px", maxHeight: "86vh", overflowY: "auto", position: "relative" }} className="custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); setIsViewingEventAttendees(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
=======
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }} onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, #f0fdf4)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(22, 163, 74, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
            
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
            
<<<<<<< HEAD
            {isViewingEventAttendees ? (
              (() => {
                const attendees = getFilteredEventAttendees(selectedEvent.id);
                const allAttendees = getEventAttendees(selectedEvent.id);
                const checkedInCount = allAttendees.filter(attendee => attendee.status === "Checked In").length;
                const pendingCount = allAttendees.filter(attendee => attendee.status === "Pending").length;
                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.14)" }}>
                        <div style={{ fontSize: "20px", fontWeight: 850, color: "#15803d" }}>{allAttendees.length}</div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Registered</div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.14)" }}>
                        <div style={{ fontSize: "20px", fontWeight: 850, color: "#0ea5e9" }}>{checkedInCount}</div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Checked In</div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.14)" }}>
                        <div style={{ fontSize: "20px", fontWeight: 850, color: "#b45309" }}>{pendingCount}</div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Pending</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                      <div style={{ ...styles.searchBar, background: "rgba(0,0,0,0.03)", minWidth: "260px" }}>
                        <Search size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                        <input type="text" placeholder="Search attendees..." value={eventAttendeeSearchTerm} onChange={(e) => setEventAttendeeSearchTerm(e.target.value)} style={styles.searchInput} />
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                          <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                          <select value={eventAttendeeStatusFilter} onChange={(e) => setEventAttendeeStatusFilter(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "#000", fontWeight: 700 }}>
                            {["All", "Registered", "Checked In", "Pending", "Cancelled", "No Show"].map(status => <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>)}
                          </select>
                        </div>
                        <button onClick={() => handleExportSelectedEventAttendees(selectedEvent)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", borderRadius: "999px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "1px solid rgba(2,132,199,0.14)", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}><Download size={14} /> Export</button>
                      </div>
                    </div>

                    <div style={{ overflowX: "auto", marginBottom: "18px" }}>
                      <table style={{ ...styles.table, width: "100%", minWidth: "760px" }}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Attendee</th>
                            <th style={styles.th}>Ticket</th>
                            <th style={styles.th}>Registered</th>
                            <th style={styles.th}>Payment</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendees.length > 0 ? attendees.map(attendee => (
                            <tr key={attendee.id} style={styles.tr}>
                              <td style={{ ...styles.td, fontWeight: 800 }}>
                                <div>{attendee.name}</div>
                                <div style={{ marginTop: "3px", color: "rgba(0,0,0,0.52)", fontSize: "10px", fontWeight: 650 }}>{attendee.id} • {attendee.email}</div>
                              </td>
                              <td style={styles.td}>{attendee.ticket}</td>
                              <td style={styles.td}>{attendee.registeredAt}</td>
                              <td style={{ ...styles.td, color: attendee.payment === "Paid" ? "#15803d" : attendee.payment === "Pending" ? "#b45309" : "rgba(0,0,0,0.65)", fontWeight: 800 }}>{attendee.payment}</td>
                              <td style={styles.td}><span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getEventAttendeeStatusStyle(attendee.status) }}>{attendee.status}</span></td>
                            </tr>
                          )) : (
                            <tr style={styles.tr}>
                              <td colSpan="5" style={{ ...styles.td, textAlign: "center", padding: "28px", color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>No attendees match the current filters.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                      <button onClick={() => setIsViewingEventAttendees(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Back to Event Details</button>
                      <button onClick={() => { setIsViewingEventAttendees(false); setIsEditingEvent(true); setEditableEvent({ ...selectedEvent }); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Edit2 size={16}/> Edit Event</button>
                    </div>
                  </>
                );
              })()
            ) : (
              <>
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                  <button onClick={handleViewEventAttendees} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Users size={16}/> View Attendees</button>
                  <button onClick={() => { setIsViewingEventAttendees(false); setIsEditingEvent(true); setEditableEvent({ ...selectedEvent }); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Edit2 size={16}/> Edit Event</button>
                </>
              )}
            </div>
              </>
            )}

            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); setIsViewingEventAttendees(false); }} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Close Details</button>
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
          <div style={styles.topBrandGroup}>
            <div style={styles.topLogoBadge}>
              <Leaf size={17} color="#064e3b" />
            </div>
            <div>
              <h1 style={styles.pageTitle}>{activeTab === "Dashboard" ? "Welcome Back, Admin!" : "EcoEquity.Inc"}</h1>
              <div style={styles.pageSubtitle}>{activeTab === "Dashboard" ? "Here's what's happening with EcoEquity.Inc today." : `${activeTab} Admin Portal`}</div>
            </div>
          </div>
          <div style={styles.headerActions}>
=======
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={styles.pageTitle}>{activeTab}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
            <div style={{ ...styles.dashboardIntro, justifyContent: "flex-end", paddingTop: 0 }}>
              <div style={styles.dashboardDateControl}>
                <CalendarDays size={14} color="#15803d" />
                <select value={dashboardDateRange} onChange={(e) => setDashboardDateRange(e.target.value)} style={styles.dashboardDateSelect}>
                  <option value="Today">Today</option>
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="This month">This month</option>
                  <option value="This quarter">This quarter</option>
                </select>
              </div>
            </div>

=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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

<<<<<<< HEAD
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px", marginBottom: "6px" }}>Subscription Plan Manager</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.58)", fontWeight: 600, lineHeight: 1.5 }}>Create and publish client-facing subscription cards for the AI Data Subscription page.</p>
                </div>
                <button onClick={handleAddSubscriptionPlan} style={{ ...ecoPrimaryButtonStyle, padding: "10px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                  <Repeat size={14} style={{ position: "relative", zIndex: 1 }} />
                  <span style={{ position: "relative", zIndex: 1 }}>Add Subscription Plan</span>
                </button>
              </div>

              {editingSubscriptionPlan && (
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "18px", marginBottom: "18px", background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(22,163,74,0.04))" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" }}>{editingSubscriptionPlan.isNew ? "New Subscription Plan" : `Edit ${editingSubscriptionPlan.name}`}</h4>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800, color: "#15803d" }}>
                      <input type="checkbox" checked={editingSubscriptionPlan.clientVisible} onChange={e => handleSubscriptionPlanDraftChange("clientVisible", e.target.checked)} />
                      Show on client page
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Plan Name</span>
                      <input value={editingSubscriptionPlan.name} onChange={e => handleSubscriptionPlanDraftChange("name", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Monthly Price</span>
                      <input value={editingSubscriptionPlan.priceMonthly} onChange={e => handleSubscriptionPlanDraftChange("priceMonthly", e.target.value)} placeholder="₱999, Free, or Custom" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Yearly Price</span>
                      <input value={editingSubscriptionPlan.priceYearly} onChange={e => handleSubscriptionPlanDraftChange("priceYearly", e.target.value)} placeholder="₱9,590, Free, or Custom" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Description</span>
                      <input value={editingSubscriptionPlan.description} onChange={e => handleSubscriptionPlanDraftChange("description", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Monthly Note</span>
                      <input value={editingSubscriptionPlan.billingNoteMonthly} onChange={e => handleSubscriptionPlanDraftChange("billingNoteMonthly", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Yearly Note</span>
                      <input value={editingSubscriptionPlan.billingNoteYearly} onChange={e => handleSubscriptionPlanDraftChange("billingNoteYearly", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Billing Type</span>
                      <select value={editingSubscriptionPlan.billingType} onChange={e => handleSubscriptionPlanDraftChange("billingType", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }}>
                        <option value="free">Free</option>
                        <option value="paid">Paid Checkout</option>
                        <option value="contact">Contact Sales</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Badge</span>
                      <input value={editingSubscriptionPlan.badge} onChange={e => handleSubscriptionPlanDraftChange("badge", e.target.value)} placeholder="Most Popular, New, Best Value" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>CTA Label</span>
                      <input value={editingSubscriptionPlan.ctaLabel} onChange={e => handleSubscriptionPlanDraftChange("ctaLabel", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Accent Color</span>
                      <input type="color" value={editingSubscriptionPlan.color} onChange={e => { handleSubscriptionPlanDraftChange("color", e.target.value); handleSubscriptionPlanDraftChange("accentColor", e.target.value); }} style={{ ...styles.editInput, ...ecoGlassInputStyle, padding: "6px 10px", minHeight: "44px" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Users</span>
                      <input value={editingSubscriptionPlan.users} onChange={e => handleSubscriptionPlanDraftChange("users", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>MRR</span>
                      <input value={editingSubscriptionPlan.revenue} onChange={e => handleSubscriptionPlanDraftChange("revenue", e.target.value)} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Included Features</span>
                      <textarea value={editingSubscriptionPlan.featuresText} onChange={e => handleSubscriptionPlanDraftChange("featuresText", e.target.value)} rows={5} placeholder="One feature per line" style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.58)", textTransform: "uppercase" }}>Unavailable Features</span>
                      <textarea value={editingSubscriptionPlan.excludedFeaturesText} onChange={e => handleSubscriptionPlanDraftChange("excludedFeaturesText", e.target.value)} rows={5} placeholder="Optional, one per line" style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit" }} />
                    </label>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                    <button onClick={() => setEditingSubscriptionPlan(null)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "9px 14px", fontWeight: 800 }}><X size={14} /> Cancel</button>
                    <button onClick={handleSaveSubscriptionPlan} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "9px 14px", fontWeight: 800 }}><Save size={14} /> Save Plan</button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                {managedSubscriptionPlans.map(plan => {
                  const isCorePlan = ["PLAN-BASIC", "PLAN-PRO", "PLAN-ENTERPRISE"].includes(plan.id);
                  return (
                    <div key={plan.id || plan.name} className="inner-blur-glass" style={{ ...styles.chartCard, background: plan.bg || "rgba(255,255,255,0.68)", padding: "20px", border: `1px solid ${(plan.color || "#16a34a")}30` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: 800, color: plan.color || "#15803d", margin: 0 }}>{plan.name}</h3>
                          <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: 800, color: plan.clientVisible === false ? "#dc2626" : "#15803d" }}>{plan.clientVisible === false ? "Hidden from client" : "Client visible"}</div>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#000", whiteSpace: "nowrap" }}>{plan.priceMonthly}</span>
                      </div>
                      <p style={{ margin: "12px 0 14px", fontSize: "12px", lineHeight: 1.45, color: "rgba(0,0,0,0.58)", fontWeight: 600 }}>{plan.description}</p>
                      <div style={{ margin: "0 0 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
                        {(plan.features || []).slice(0, 4).map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.7)", fontWeight: 650 }}>
                            <CheckCircle size={14} color={plan.color || "#16a34a"} /> {f}
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", fontSize: "13px", marginBottom: "14px" }}>
                        <div><strong style={{ fontSize: "15px", color: "#000" }}>{plan.users}</strong> <span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Users</span></div>
                        <div style={{ color: "#15803d", fontWeight: 800 }}>{plan.revenue} MRR</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button onClick={() => handleEditSubscriptionPlan(plan)} style={{ ...styles.actionBtn, color: "#0ea5e9", background: "rgba(14,165,233,0.1)", padding: "7px 11px", fontWeight: 800 }}><Edit2 size={13} /> Edit</button>
                        {!isCorePlan && (
                          <button onClick={() => handleDeleteSubscriptionPlan(plan.id)} style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "7px 11px", fontWeight: 800 }}><Trash2 size={13} /> Delete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                        <AdminEcoDropdown value={subPlanFilter} options={[{ value: "All", label: "All Plans" }, ...managedSubscriptionPlanOptions]} onChange={setSubPlanFilter} compact align="right" />
=======
                        <AdminEcoDropdown value={subPlanFilter} options={[{ value: "All", label: "All Plans" }, ...subscriptionPlanOptions]} onChange={setSubPlanFilter} compact align="right" />
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                          <td style={{ ...styles.td, fontWeight: 700, color: getManagedPlanColor(sub.plan) }}>{sub.plan}</td>
=======
                          <td style={{ ...styles.td, fontWeight: 700, color: sub.plan === "Pro" ? "#b45309" : sub.plan === "Enterprise" ? "#0284c7" : "#475569" }}>{sub.plan}</td>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                            <button onClick={() => { setSelectedEvent(ev); setIsEditingEvent(false); setIsViewingEventAttendees(false); }} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
=======
                            <button onClick={() => setSelectedEvent(ev)} style={{ ...styles.actionBtn, color: "#15803d", background: "rgba(22,163,74,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
        ) : activeTab === "Home Glass Chart" ? (
          renderHomeGlassChartManagement()
        ) : activeTab === "Surplus Exchange" ? (
          renderSurplusExchangeManagement()
        ) : activeTab === "Expert Support" ? (
          renderExpertSupportManagement()
        ) : activeTab === "Impact Sectors" ? (
          renderImpactSectorsManagement()
        ) : adminManagedSections[activeTab] ? (
          renderManagedSection(adminManagedSections[activeTab])
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
        ) : (
          activeTab === "Settings" ? (
            <div style={styles.dashboardContainer}>
              {/* Settings Stats Grid */}
              <div style={styles.statsGrid}>
<<<<<<< HEAD
                {settingsStats.map((stat, idx) => (
=======
                {mockSettingsStats.map((stat, idx) => (
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                  {settingsTabs.map(tab => (
=======
                  {[
                    { id: "General", icon: <Layout size={16} /> },
                    { id: "Security & Roles", icon: <ShieldCheck size={16} /> },
                    { id: "Payments", icon: <CreditCard size={16} /> },
                    { id: "AI & Models", icon: <Zap size={16} /> },
                    { id: "Appearance", icon: <Image size={16} /> },
                    { id: "Database & Backups", icon: <Database size={16} /> },
                  ].map(tab => (
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                    <button onClick={handleSaveAdminSettings} style={{ padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}>
=======
                    <button style={{ padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 16px rgba(22,163,74,0.2)" }}>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                  
                  {activeSettingsTab === "General" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Platform Name</label>
<<<<<<< HEAD
                           <input type="text" value={adminSettings.general.platformName} onChange={(e) => updateAdminSetting("general", "platformName", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Support Email</label>
                           <input type="email" value={adminSettings.general.supportEmail} onChange={(e) => updateAdminSetting("general", "supportEmail", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
=======
                           <input type="text" defaultValue="EcoEquity" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Support Email</label>
                           <input type="email" defaultValue="support@ecoequity.ph" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Maintenance Mode</label>
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                           <div>
                             <div style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "4px" }}>Enable Maintenance Mode</div>
                             <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Restrict public access while updating the platform. Admins can still log in.</div>
                           </div>
<<<<<<< HEAD
                           <button
                             type="button"
                             aria-pressed={adminSettings.general.maintenanceMode}
                             onClick={() => updateAdminSetting("general", "maintenanceMode", !adminSettings.general.maintenanceMode)}
                             style={{ width: "44px", height: "24px", background: adminSettings.general.maintenanceMode ? "#16a34a" : "rgba(0,0,0,0.1)", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.3s", border: "none", flexShrink: 0 }}
                           >
                             <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: adminSettings.general.maintenanceMode ? "translateX(20px)" : "translateX(0)", transition: "transform 0.3s" }} />
                           </button>
=======
                           <div style={{ width: "44px", height: "24px", background: "rgba(0,0,0,0.1)", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
                             <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s" }} />
                           </div>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                               <th style={{ padding: "12px 8px" }}>Email</th>
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                               <th style={{ padding: "12px 8px" }}>Role</th>
                               <th style={{ padding: "12px 8px" }}>2FA Status</th>
                               <th style={{ padding: "12px 8px" }}>Action</th>
                             </tr>
                           </thead>
                           <tbody>
<<<<<<< HEAD
                             {adminSettings.admins.map(admin => {
                               const isEditingAdmin = editingAdminId === admin.id;
                               const adminRow = isEditingAdmin ? adminAccountDraft : admin;
                               return (
                                 <tr key={admin.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                   <td style={{ padding: "12px 8px", fontWeight: 600 }}>
                                     {isEditingAdmin ? (
                                       <input value={adminRow.name} onChange={(e) => setAdminAccountDraft({ ...adminRow, name: e.target.value })} style={styles.editInput} />
                                     ) : admin.name}
                                   </td>
                                   <td style={{ padding: "12px 8px", color: "rgba(0,0,0,0.65)", fontWeight: 600 }}>
                                     {isEditingAdmin ? (
                                       <input type="email" value={adminRow.email} onChange={(e) => setAdminAccountDraft({ ...adminRow, email: e.target.value })} style={styles.editInput} />
                                     ) : admin.email}
                                   </td>
                                   <td style={{ padding: "12px 8px", color: admin.role === "Super Admin" ? "#b45309" : "#15803d", fontWeight: 700 }}>
                                     {isEditingAdmin ? (
                                       <select value={adminRow.role} onChange={(e) => setAdminAccountDraft({ ...adminRow, role: e.target.value })} style={styles.editInput}>
                                         {adminRoleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                                       </select>
                                     ) : admin.role}
                                   </td>
                                   <td style={{ padding: "12px 8px", color: admin.twoFactor ? "#16a34a" : "#e11d48", fontWeight: 600 }}>
                                     {isEditingAdmin ? (
                                       <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                         <input type="checkbox" checked={adminRow.twoFactor} onChange={(e) => setAdminAccountDraft({ ...adminRow, twoFactor: e.target.checked })} />
                                         {adminRow.twoFactor ? "Enabled" : "Disabled"}
                                       </label>
                                     ) : admin.twoFactor ? "Enabled" : "Disabled"}
                                   </td>
                                   <td style={{ padding: "12px 8px" }}>
                                     <div style={{ display: "flex", gap: "8px" }}>
                                       {isEditingAdmin ? (
                                         <>
                                           <button onClick={handleSaveAdminAccount} style={{ ...styles.actionBtn, background: "rgba(22,163,74,0.1)", color: "#15803d", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Save</button>
                                           <button onClick={handleCancelAdminEdit} style={{ ...styles.actionBtn, background: "rgba(220,38,38,0.1)", color: "#dc2626", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Cancel</button>
                                         </>
                                       ) : (
                                         <>
                                           <button onClick={() => handleEditAdminAccount(admin)} style={{ ...styles.actionBtn, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Edit</button>
                                           <button onClick={() => handleDeleteAdminAccount(admin.id)} style={{ ...styles.actionBtn, background: "rgba(220,38,38,0.1)", color: "#dc2626", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Delete</button>
                                         </>
                                       )}
                                     </div>
                                   </td>
                                 </tr>
                               );
                             })}
                           </tbody>
                         </table>
                         <button onClick={handleAddAdminAccount} style={{ marginTop: "16px", padding: "10px 16px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", border: "1px dashed #16a34a", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%" }}>+ Add New Admin</button>
=======
                             <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                               <td style={{ padding: "12px 8px", fontWeight: 600 }}>Juan Dela Cruz (You)</td>
                               <td style={{ padding: "12px 8px", color: "#b45309", fontWeight: 700 }}>Super Admin</td>
                               <td style={{ padding: "12px 8px", color: "#16a34a", fontWeight: 600 }}>Enabled</td>
                               <td style={{ padding: "12px 8px" }}><button style={{ ...styles.actionBtn, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Edit</button></td>
                             </tr>
                           </tbody>
                         </table>
                         <button style={{ marginTop: "16px", padding: "10px 16px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", border: "1px dashed #16a34a", color: "#15803d", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%" }}>+ Add New Admin</button>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
                         <div style={{ display: "flex", gap: "8px" }}>
                           <button onClick={() => updateAdminSetting("payments", "payMongoEnabled", !adminSettings.payments.payMongoEnabled)} style={{ padding: "8px 16px", borderRadius: "8px", background: adminSettings.payments.payMongoEnabled ? "rgba(22,163,74,0.1)" : "rgba(225,29,72,0.1)", color: adminSettings.payments.payMongoEnabled ? "#15803d" : "#e11d48", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>{adminSettings.payments.payMongoEnabled ? "Enabled" : "Paused"}</button>
                           <button onClick={() => setPaymentConfigOpen(prev => !prev)} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>{paymentConfigOpen ? "Hide API" : "Configure API"}</button>
                         </div>
                       </div>
                       {paymentConfigOpen && (
                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "20px", borderRadius: "16px", border: "1px solid rgba(14,165,233,0.12)", background: "rgba(14,165,233,0.05)" }}>
                           <div>
                             <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Public Key</label>
                             <input type="text" value={adminSettings.payments.publicKey} onChange={(e) => updateAdminSetting("payments", "publicKey", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                           </div>
                           <div>
                             <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Settlement Account</label>
                             <input type="text" value={adminSettings.payments.settlementAccount} onChange={(e) => updateAdminSetting("payments", "settlementAccount", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                           </div>
                           <div style={{ gridColumn: "1 / -1" }}>
                             <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Webhook URL</label>
                             <input type="url" value={adminSettings.payments.webhookUrl} onChange={(e) => updateAdminSetting("payments", "webhookUrl", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                           </div>
                           <button onClick={handleTestPaymentConnection} style={{ gridColumn: "1 / -1", justifySelf: "flex-start", padding: "10px 16px", borderRadius: "10px", background: "#0284c7", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Test Connection</button>
                         </div>
                       )}
=======
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
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                     </div>
                  )}
  
                  {activeSettingsTab === "Appearance" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Theme Mode</label>
                         <div style={{ display: "flex", gap: "16px" }}>
<<<<<<< HEAD
                           {["Light", "Dark"].map(mode => {
                             const isSelected = adminSettings.appearance.themeMode === mode;
                             return (
                               <button key={mode} onClick={() => updateAdminSetting("appearance", "themeMode", mode)} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: `2px solid ${isSelected ? adminSettings.appearance.accentColor : "transparent"}`, background: mode === "Light" ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: mode === "Light" ? "#0f172a" : "#fff" }}>{mode} Mode</button>
                             );
                           })}
=======
                           <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid #16a34a", background: "rgba(255,255,255,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#0f172a" }}>Light Mode</div>
                           <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid transparent", background: "rgba(15,23,42,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#fff" }}>Dark Mode</div>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Accent Color</label>
                         <div style={{ display: "flex", gap: "12px" }}>
                           {["#16a34a", "#0284c7", "#8b5cf6", "#f59e0b", "#e11d48"].map(color => (
<<<<<<< HEAD
                             <button key={color} type="button" aria-label={`Use accent color ${color}`} onClick={() => updateAdminSetting("appearance", "accentColor", color)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, cursor: "pointer", border: adminSettings.appearance.accentColor === color ? "3px solid #fff" : "none", boxShadow: adminSettings.appearance.accentColor === color ? `0 0 0 2px ${color}` : "none" }} />
                           ))}
                         </div>
                       </div>
                       <div style={{ padding: "18px", borderRadius: "14px", border: `1px solid ${adminSettings.appearance.accentColor}`, background: adminSettings.appearance.themeMode === "Dark" ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.75)", color: adminSettings.appearance.themeMode === "Dark" ? "#fff" : "#0f172a" }}>
                         <div style={{ fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Theme Preview</div>
                         <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.75 }}>This preview updates immediately. Save changes to keep it after refresh.</div>
                       </div>
=======
                             <div key={color} style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, cursor: "pointer", border: color === "#16a34a" ? "3px solid #fff" : "none", boxShadow: color === "#16a34a" ? `0 0 0 2px ${color}` : "none" }} />
                           ))}
                         </div>
                       </div>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
                     </div>
                  )}
  
                  {activeSettingsTab === "Database & Backups" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(22,163,74,0.05)" }}>
                         <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "#15803d" }}>Automated Backups</h4>
<<<<<<< HEAD
                         <p style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Your database is automatically backed up every day at 12:00 AM UTC. Last manual backup: {adminSettings.backups.lastBackup || "Not created yet"}.</p>
                         <div style={{ display: "flex", gap: "12px" }}>
                           <button onClick={handleCreateBackup} style={{ padding: "10px 16px", borderRadius: "10px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><Database size={14} /> Backup Now</button>
                           <button onClick={handleRestoreBackup} style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><RefreshCcw size={14} /> Restore from Backup</button>
                         </div>
                       </div>
                       {adminSettings.backups.history.length > 0 && (
                         <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", textTransform: "uppercase" }}>Recent Backups</label>
                           {adminSettings.backups.history.map(backup => (
                             <div key={backup.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "12px", fontWeight: 700 }}>
                               <span>{backup.id}</span>
                               <span style={{ color: "rgba(0,0,0,0.55)" }}>{backup.createdAt}</span>
                               <span style={{ color: "#15803d" }}>{backup.summary}</span>
                             </div>
                           ))}
                         </div>
                       )}
                       {adminSettings.backups.lastRestore && (
                         <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(2,132,199,0.08)", color: "#0369a1", fontSize: "12px", fontWeight: 700 }}>
                           Last restore completed: {adminSettings.backups.lastRestore}
                         </div>
                       )}
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Data Export</label>
                         <button onClick={handleExportSystemData} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Download size={15} /> Export Full System Data (CSV)</button>
=======
                         <p style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Your database is automatically backed up every day at 12:00 AM UTC. You can also trigger a manual backup below.</p>
                         <div style={{ display: "flex", gap: "12px" }}>
                           <button style={{ padding: "10px 16px", borderRadius: "10px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Backup Now</button>
                           <button style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Restore from Backup</button>
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Data Export</label>
                         <button style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(2,132,199,0.1)", color: "#0284c7", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Export Full System Data (CSV)</button>
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
    gap: "16px",
    flexWrap: "nowrap",
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
  topBrandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    flex: "1 1 auto",
  },
  topLogoBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 26px rgba(34,197,94,0.16)",
    flexShrink: 0,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
    marginLeft: "auto",
    flex: "0 0 auto",
  },
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  pageTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
<<<<<<< HEAD
    letterSpacing: 0,
    whiteSpace: "nowrap",
  },
  pageSubtitle: {
    marginTop: "2px",
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(6,32,24,0.52)",
=======
    letterSpacing: "-0.5px",
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "6px 12px",
    borderRadius: "999px",
<<<<<<< HEAD
    flexShrink: 0,
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "12px",
<<<<<<< HEAD
    width: "clamp(96px, 12vw, 160px)",
=======
    width: "140px",
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
<<<<<<< HEAD
  dashboardIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    padding: "2px 0 4px",
  },
  dashboardIntroTitle: {
    margin: "0 0 6px",
    fontSize: "26px",
    fontWeight: 850,
    color: "#062018",
    letterSpacing: 0,
  },
  dashboardIntroText: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(6,32,24,0.58)",
  },
  dashboardDateControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(22,163,74,0.14)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
  },
  dashboardDateSelect: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#064e3b",
    fontSize: "12px",
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
  },
=======
>>>>>>> 3301e12094f6b1e0be4555d6b4e832fd0a5b230d
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
