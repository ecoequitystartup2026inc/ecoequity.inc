import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, Users, ShieldCheck, Box, ShoppingCart, 
  Truck, CreditCard, Repeat, CalendarDays, Stethoscope, 
  BarChart2, FileText, Settings, LogOut, 
  Search, Bell, TrendingUp, TrendingDown, CheckCircle, XCircle, Edit2, Save, X, Image, AlertCircle, Trash2, Eye, Clock, MapPin, Phone, Package, Filter, Navigation, UserCheck, MessageSquare, Route, Leaf, RefreshCcw, Download, Zap, Crown, Activity, Tag, Ticket, Video, Scan, Target, Bug, Thermometer, PieChart, Globe, Lightbulb, Megaphone, Wand2, Layout, Plus, Play, Database, Wheat, Send, ChevronsLeft, ChevronsRight
  , Sprout, Cherry, PartyPopper, Star, GraduationCap, Gift, Award, Trophy, Menu
  , Flag, EyeOff, Lock, Unlock, ShieldAlert
} from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "../data/products";
import { defaultEcoProgram, ecoIcon, ecoIconOptions, tierRangeLabel } from "../data/ecoProgram";
import { normalizeMember, memberEarnEntry, memberCertificate } from "../data/platformUsers";
import { fetchAllRedemptions, updateRedemptionStatus, cancelRedemption, fetchMemberBalances, adjustMemberPoints, fetchEcoEconomy, REDEMPTION_STATUSES, REDEMPTION_FILTERS } from "../data/ecoPoints";
import { notifyUser, orderStatusMessage, ticketReplyMessage } from "../data/notifications";
import { fetchLiveQueue, fetchAgents, assignTicket, acceptTicket, rejectTicket, closeLiveChat } from "../data/supportAgents";
import { fetchAgentRoster, inviteAgent, setAgentEnabled } from "../data/agentInvites";
import { fetchTicketMessages, sendLiveMessage, subscribeToTicket } from "../data/liveChat";
import { MODAL_LAYER, MODAL_CLOSE_BTN, modalOverlay, modalPanel } from "../styles/modal";
import ColorThemePicker from "../components/ColorThemePicker";
// Placeholder rows used as default props below. They live in data/ rather than
// here so App.js can read them without importing this 8,600-line module — that
// is what lets the portal be code-split away from the main bundle.
import {
  mockUsers, mockDeliveriesList, mockRiders, mockTransactions, mockSubscribers,
  mockEventsList, mockScansList, mockDiseaseLibrary, mockContentList,
} from "../data/adminSeeds";

/**
 * Portal design tokens.
 *
 * The portal grew a second visual vocabulary alongside the member dashboard's
 * (DashboardUI.js): pure `#000` text where the dashboard uses a green-black
 * ink, four different card radii, and shadows tuned per-section. `AD` is that
 * vocabulary written down once and matched to DASH, so a table on Orders and a
 * panel on Settings read as the same product.
 *
 * Anything shell-level or shared across tabs should reach for these instead of
 * inlining another `rgba(0,0,0,0.05)`.
 */
const AD = {
  ink: "var(--eco-c19)",
  inkSoft: "rgba(var(--eco-c19-rgb), 0.60)",
  inkFaint: "rgba(var(--eco-c19-rgb), 0.40)",
  line: "rgba(var(--eco-c19-rgb), 0.08)",
  lineSoft: "rgba(var(--eco-c19-rgb), 0.05)",
  green: "var(--eco-c11)",
  greenBright: "var(--eco-c9)",
  sky: "var(--eco-c9)",
  rose: "var(--eco-c9)",
  amber: "var(--eco-c11)",
  /** Card / panel surface, matched to DashboardUI's dashCard. */
  surface: "rgba(255,255,255,0.74)",
  surfaceSolid: "rgba(255,255,255,0.92)",
  radius: 18,
  radiusSm: 12,
  shadow: "0 8px 22px rgba(var(--eco-c19-rgb), 0.05), inset 0 1px 0 rgba(255,255,255,0.75)",
  shadowLift: "0 16px 34px rgba(var(--eco-c19-rgb), 0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
  /** Sidebar width in each of its two states. */
  navWidth: 244,
  navWidthCollapsed: 74,
};

/**
 * Layout breakpoints for the portal shell.
 *
 * The portal used to declare `minWidth: 1200px` and let anything narrower
 * scroll sideways, which put the sidebar off-screen on a laptop with a split
 * window. Three states instead: `wide` shows the full sidebar, `compact`
 * collapses it to icons to buy back ~170px, and `mobile` moves it off-canvas
 * behind a menu button in the header.
 */
const ADMIN_COMPACT_QUERY = "(max-width: 1180px)";
const ADMIN_MOBILE_QUERY = "(max-width: 860px)";

function readAdminViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "wide";
  if (window.matchMedia(ADMIN_MOBILE_QUERY).matches) return "mobile";
  if (window.matchMedia(ADMIN_COMPACT_QUERY).matches) return "compact";
  return "wide";
}

const mockStats = [
  { label: "Total Users", value: "15,243", trend: "+12%", up: true, icon: <Users size={16} color="var(--eco-c11)" /> },
  { label: "Total Orders", value: "3,492", trend: "+8%", up: true, icon: <ShoppingCart size={16} color="#0284c7" /> },
  { label: "Total Revenue", value: "₱2.4M", trend: "+15%", up: true, icon: <CreditCard size={16} color="#b45309" /> },
  { label: "Pending Deliveries", value: "142", trend: "-3%", up: false, icon: <Truck size={16} color="#be123c" /> },
  { label: "Active Farmers", value: "3,500+", trend: "+5%", up: true, icon: <ShieldCheck size={16} color="var(--eco-c11)" /> },
  { label: "AI Diagnoses", value: "12,845", trend: "+22%", up: true, icon: <Stethoscope size={16} color="#0369a1" /> },
];

const ORDERS_STORAGE_KEY = "ecoequity_orders";
const SUPPORT_TICKETS_STORAGE_KEY = "ecoequity_support_tickets";

const mockTopProducts = [
  { name: "Heirloom Tomatoes", sales: "1,240", rev: "₱186K", stock: "In Stock", emoji: <Cherry size="1em" color="#dc2626" /> },
  { name: "Premium Potting Mix", sales: "985", rev: "₱275K", stock: "Low Stock", emoji: <Sprout size="1em" color="var(--eco-c9)" /> },
  { name: "Basil Grow Kit", sales: "842", rev: "₱294K", stock: "In Stock", emoji: <Leaf size="1em" color="var(--eco-c9)" /> },
];

const mockVerifications = [
  { name: "Reyes Organic Farm", location: "Benguet", date: "2 hrs ago", type: "Commercial" },
  { name: "Isabella Cruz", location: "Quezon City", date: "5 hrs ago", type: "Micro-Vendor" },
  { name: "Green Valley Co.", location: "Davao", date: "1 day ago", type: "Commercial" },
];

const mockActivityFeed = [
  { text: "New commercial farm registered from Benguet.", time: "10 mins ago", color: "var(--eco-c13)" },
  { text: "High volume of AI diagnoses detected for 'Tomato Blight'.", time: "1 hr ago", color: "var(--eco-c13)" },
  { text: "LGU Partnership completed for Baguio City.", time: "3 hrs ago", color: "var(--eco-c13)" },
  { text: "Payouts successfully disbursed to 450 micro-vendors.", time: "5 hrs ago", color: "var(--eco-c13)" },
];

const mockDeliveryStats = [
  { label: "Total Deliveries", value: "124", trend: "+12%", up: true, icon: <Truck size={16} color="#0284c7" /> },
  { label: "Out for Delivery", value: "18", trend: "+5%", up: true, icon: <Navigation size={16} color="#f59e0b" /> },
  { label: "Delivered Today", value: "92", trend: "+8%", up: true, icon: <CheckCircle size={16} color="var(--eco-c9)" /> },
  { label: "Delayed Orders", value: "4", trend: "-2%", up: false, icon: <AlertCircle size={16} color="#dc2626" /> },
  { label: "Active Riders", value: "24", trend: "+10%", up: true, icon: <UserCheck size={16} color="#8b5cf6" /> },
  { label: "Avg Time", value: "35m", trend: "-5m", up: true, icon: <Clock size={16} color="var(--eco-c9)" /> },
];

const RIDER_STATUS_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "On Delivery", label: "On Delivery" },
  { value: "Offline", label: "Offline" },
];

const riderStatusColor = (status) => status === "Available" ? "var(--eco-c9)" : status === "On Delivery" ? "var(--eco-c7)" : "#94a3b8";

const BROADCASTS_STORAGE_KEY = "ecoequity_broadcasts";

const mockBroadcasts = [
  { id: "BC-1003", title: "Fresh Harvest Just Landed", message: "New heirloom tomatoes and basil kits are now in stock. Order before noon for same-day eco-delivery.", audience: "All", type: "Announcement", channel: "Push", time: "2 hrs ago", reach: 15243 },
  { id: "BC-1002", title: "Weekend Pro Discount", message: "Pro subscribers get 15% off all grow kits this weekend. Use code GROW15.", audience: "Pro", type: "Promo", channel: "Email", time: "Yesterday", reach: 2480 },
  { id: "BC-1001", title: "Scheduled Maintenance", message: "The Farm Planner will be briefly offline tonight from 11PM–12AM for upgrades.", audience: "All", type: "Alert", channel: "In-App", time: "2 days ago", reach: 15243 },
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
  background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
  color: "var(--eco-c19)",
  boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
  backdropFilter: "blur(18px) saturate(165%)",
  WebkitBackdropFilter: "blur(18px) saturate(165%)",
};

const ecoPrimaryInnerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  borderRadius: "inherit",
  background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.36), rgba(var(--eco-c5-rgb), 0.32))",
  backdropFilter: "blur(34px) saturate(185%)",
  WebkitBackdropFilter: "blur(34px) saturate(185%)",
};

const ecoGlassPanelStyle = {
  background: "linear-gradient(150deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))",
  border: "1px solid rgba(255,255,255,0.78)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 34px rgba(var(--eco-c9-rgb), 0.08)",
  backdropFilter: "blur(18px) saturate(165%)",
  WebkitBackdropFilter: "blur(18px) saturate(165%)",
};

const ecoGlassInputStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(var(--eco-c5-rgb), 0.42)",
  background: "rgba(255,255,255,0.72)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 18px rgba(15,23,42,0.04)",
  color: "var(--eco-c19)",
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
          color: "var(--eco-c19)",
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
                  background: isSelected ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))" : isHovered ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))" : "transparent",
                  border: isSelected ? "1px solid rgba(var(--eco-c5-rgb), 0.4)" : "1px solid transparent",
                  color: isSelected || isHovered ? "var(--eco-c15)" : "#000",
                  fontSize: compact ? "12px" : "13px",
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected ? "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : isHovered ? "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)" : "none",
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

const StaticEcoDropdown = ({ options, compact = false, align = "left" }) => {
  const [value, setValue] = useState(options[0]?.value);
  return <AdminEcoDropdown value={value} options={options} onChange={setValue} compact={compact} align={align} />;
};

const mockPaymentStats = [
  { label: "Total Revenue", value: "₱124,500", trend: "+18%", up: true, icon: <CreditCard size={16} color="var(--eco-c11)" /> },
  { label: "Successful", value: "98", trend: "+5%", up: true, icon: <CheckCircle size={16} color="#0284c7" /> },
  { label: "Pending", value: "12", trend: "-2%", up: false, icon: <Clock size={16} color="#eab308" /> },
  { label: "Refunds", value: "3", trend: "+1%", up: false, icon: <RefreshCcw size={16} color="#dc2626" /> },
];

const mockSubscriptionStats = [
  { label: "Total Subscribers", value: "1,245", trend: "+12%", up: true, icon: <Users size={16} color="#0284c7" /> },
  { label: "Monthly Revenue", value: "₱58,400", trend: "+8%", up: true, icon: <CreditCard size={16} color="var(--eco-c11)" /> },
  { label: "Renewal Rate", value: "82%", trend: "+5%", up: true, icon: <Repeat size={16} color="#8b5cf6" /> },
  { label: "Active Pro Users", value: "148", trend: "+15%", up: true, icon: <Crown size={16} color="#f59e0b" /> },
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

const mockAIStats = [
  { label: "Total AI Scans", value: "12,450", trend: "+18%", up: true, icon: <Scan size={16} color="#0284c7" /> },
  { label: "AI Accuracy Rate", value: "98.4%", trend: "+1.2%", up: true, icon: <Target size={16} color="var(--eco-c9)" /> },
  { label: "Diseases Detected", value: "3,248", trend: "-5%", up: false, icon: <Bug size={16} color="#eab308" /> },
  { label: "Reports Generated", value: "2,400", trend: "+22%", up: true, icon: <FileText size={16} color="#8b5cf6" /> },
];

// Disease Library — authored here in the Admin Portal and consumed by the
// user-facing AI Plant Doctor so every diagnosis is drawn from admin content.
const mockAnalyticsStats = [
  { label: "Total Revenue", value: "₱245,000", trend: "+18%", up: true, icon: <CreditCard size={16} color="var(--eco-c11)" /> },
  { label: "Active Users", value: "4,200", trend: "+12%", up: true, icon: <Users size={16} color="#0284c7" /> },
  { label: "AI Diagnoses", value: "12,400", trend: "+24%", up: true, icon: <Scan size={16} color="#8b5cf6" /> },
  { label: "CO₂ Reduced", value: "3.2 Tons", trend: "+8%", up: true, icon: <Leaf size={16} color="var(--eco-c9)" /> },
];

const mockAIInsights = [
  { text: "Orders increased 18% this month, primarily from Metro Manila.", type: "positive", color: "var(--eco-c13)", bg: "rgba(var(--eco-c9-rgb), 0.1)" },
  { text: "Palawan has the highest AI scan activity this week.", type: "neutral", color: "var(--eco-c13)", bg: "rgba(var(--eco-c7-rgb), 0.1)" },
  { text: "High disease outbreak ('Tomato Blight') detected in Region IV-B.", type: "warning", color: "var(--eco-c13)", bg: "rgba(var(--eco-c9-rgb), 0.1)" },
  { text: "Organic Edibles generated the most revenue in the past 30 days.", type: "positive", color: "var(--eco-c13)", bg: "rgba(var(--eco-c9-rgb), 0.1)" },
];

const mockRegionalData = [
  { region: "Metro Manila", pct: "45%", color: "var(--eco-c13)" },
  { region: "Cordillera (CAR)", pct: "25%", color: "var(--eco-c13)" },
  { region: "Central Visayas", pct: "15%", color: "var(--eco-c13)" },
  { region: "Davao Region", pct: "10%", color: "var(--eco-c13)" },
  { region: "Others", pct: "5%", color: "#64748b" },
];

const mockContentStats = [
  { label: "Total Articles", value: "245", trend: "+12", up: true, icon: <FileText size={16} color="#0284c7" /> },
  { label: "Total Views", value: "18.4K", trend: "+15%", up: true, icon: <Eye size={16} color="var(--eco-c11)" /> },
  { label: "Active Listings", value: "120", trend: "+5", up: true, icon: <ShoppingCart size={16} color="#f59e0b" /> },
  { label: "Announcements", value: "45", trend: "+2", up: true, icon: <Megaphone size={16} color="#8b5cf6" /> },
];

const mockSettingsStats = [
  { label: "System Status", value: "Online", trend: "99.9% Uptime", up: true, icon: <Activity size={16} color="var(--eco-c11)" /> },
  { label: "Active Admins", value: "5", trend: "Secure", up: true, icon: <ShieldCheck size={16} color="#0284c7" /> },
  { label: "Database Load", value: "42%", trend: "Healthy", up: true, icon: <Database size={16} color="#f59e0b" /> },
  { label: "API Health", value: "Stable", trend: "< 200ms ping", up: true, icon: <Globe size={16} color="#8b5cf6" /> },
];

const supportStatusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "Open", label: "Open" },
  { value: "In Review", label: "In Review" },
  { value: "Waiting for Customer", label: "Waiting for Customer" },
  { value: "Resolved", label: "Resolved" },
];

const supportPriorityOptions = [
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

// Shared by every "nothing here" state in the Live Chats card, so an empty
// queue, a missing backend and a failed load all sit in the same box.
const liveEmptyStyle = {
  padding: "26px",
  borderRadius: "16px",
  border: "1px dashed rgba(0,0,0,0.12)",
  fontSize: "13px",
  fontWeight: 700,
  color: "rgba(0,0,0,0.5)",
  textAlign: "center",
  lineHeight: 1.5,
};

// The member-facing lifecycle, as the admin sees it. Kept apart from
// getStatusStyle() — that one colours the ticket statuses (Open, Resolved …),
// and these are a different axis entirely: whether a person is being answered.
const LIVE_STATUS_LABELS = {
  pending:    { label: "Pending",    tint: "rgba(234,179,8,0.16)",  ink: "#854d0e" },
  accepted:   { label: "Accepted",   tint: "rgba(var(--eco-c9-rgb), 0.16)", ink: "var(--eco-c13)" },
  active:     { label: "Active",     tint: "rgba(var(--eco-c9-rgb), 0.16)", ink: "var(--eco-c13)" },
  reassigned: { label: "Reassigned", tint: "rgba(2,132,199,0.14)",  ink: "#0369a1" },
  closed:     { label: "Closed",     tint: "rgba(0,0,0,0.07)",      ink: "rgba(0,0,0,0.5)" },
  rejected:   { label: "Declined",   tint: "rgba(220,38,38,0.12)",  ink: "#b91c1c" },
};

const liveStatusChip = (status) => LIVE_STATUS_LABELS[status] || LIVE_STATUS_LABELS.pending;

// A person's standing on the team, which is a third axis again: not the
// ticket's status, not the conversation's, but whether this human can be given
// work right now. 'offline' is not a problem to fix — it is most of the day.
const AGENT_STATE_CHIPS = {
  pending:  { label: "Pending Invitation", tint: "rgba(234,179,8,0.16)", ink: "#854d0e", dot: "#eab308" },
  active:   { label: "Active",   tint: "rgba(34,197,94,0.14)", ink: "#15803d", dot: "#22c55e" },
  offline:  { label: "Offline",  tint: "rgba(0,0,0,0.07)",     ink: "rgba(0,0,0,0.5)", dot: "rgba(0,0,0,0.25)" },
  disabled: { label: "Disabled", tint: "rgba(220,38,38,0.1)",  ink: "#b91c1c", dot: "rgba(0,0,0,0.25)" },
};

/**
 * How long this chat has been sitting there.
 *
 * Coarse on purpose: an admin triaging a queue needs "is this person still
 * here", not a stopwatch. Anything past an hour is already a failure, so the
 * exact number stops being the useful part.
 */
function liveWaitLabel(timestamp) {
  if (!timestamp) return "just now";
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const supportAssigneeOptions = [
  { value: "Unassigned", label: "Unassigned" },
  { value: "Admin Support", label: "Admin Support" },
  { value: "Technical Team", label: "Technical Team" },
  { value: "Billing Team", label: "Billing Team" },
  { value: "Product Specialist", label: "Product Specialist" },
];

export default function AdminPortal({
  setActiveNav, handleLogout,
  // The signed-in admin, straight from the Supabase session (App.js). Shown in
  // the header on every tab and in Settings → Security & Roles, so the portal
  // names whoever is actually logged in instead of a placeholder.
  adminName = "", adminEmail = "", adminAvatar = null,
  products, setProducts,
  harvests, setHarvests,
  promoCodes, setPromoCodes,
  orders, setOrders,
  supportTickets = [], setSupportTickets,
  plantScans = mockScansList, setPlantScans = () => {},
  plantDiseases = mockDiseaseLibrary, setPlantDiseases = () => {},
  subscribers = mockSubscribers, setSubscribers = () => {},
  events = mockEventsList, setEvents = () => {},
  content = mockContentList, setContent = () => {},
  forumPosts = [], setForumPosts = () => {},
  farmPlanner = {}, setFarmPlanner = () => {},
  advisors = [], setAdvisors = () => {},
  surplusListings = [], setSurplusListings = () => {},
  surplusDemands = [], setSurplusDemands = () => {},
  certCourses = [], setCertCourses = () => {},
  adminSettings = {}, setAdminSettings = () => {},
  // Lifted to App.js so admin edits persist and reach the user-facing screens.
  deliveries = mockDeliveriesList, setDeliveries = () => {},
  riders: ridersProp = mockRiders, setRiders: setRidersProp = () => {},
  platformUsers = mockUsers, setPlatformUsers = () => {},
  transactions = mockTransactions, setTransactions = () => {},
  subscriptionPlans = [], setSubscriptionPlans = () => {},
  // Rewards, earn rules, tiers, badges and impact stats rendered by the user's
  // EcoPoints & Rewards dashboard.
  ecoProgram = defaultEcoProgram, setEcoProgram = () => {},
  // Database status + the one-time "push everything to Supabase" bootstrap.
  supabaseReady = false, contentSeeded = false, publishingContent = false,
  onPublishContent = async () => ({ ok: false }),
}) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);

  // --- Shell layout ---------------------------------------------------------
  // Which of the three shell layouts is in play right now (see readAdminViewport).
  const [viewport, setViewport] = useState(readAdminViewport);
  const isMobile = viewport === "mobile";
  const isCompact = viewport === "compact";
  // On phones the sidebar is a drawer over the content rather than a column.
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  // Filters the 23-item nav down to what you typed. With five groups and a
  // scrolling list, hunting for "Specialist Certification" by eye was the
  // slowest part of using the portal.
  const [navQuery, setNavQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const compact = window.matchMedia(ADMIN_COMPACT_QUERY);
    const mobile = window.matchMedia(ADMIN_MOBILE_QUERY);
    const sync = () => setViewport(readAdminViewport());
    // Safari < 14 only has the deprecated addListener.
    const attach = (mq) => (mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync));
    const detach = (mq) => (mq.removeEventListener ? mq.removeEventListener("change", sync) : mq.removeListener(sync));
    attach(compact);
    attach(mobile);
    return () => { detach(compact); detach(mobile); };
  }, []);

  // Entering a narrow window collapses the sidebar to icons; widening restores
  // it. Between those crossings the collapse button stays the user's to press.
  useEffect(() => {
    if (viewport === "compact") setSidebarCollapsed(true);
    if (viewport === "wide") setSidebarCollapsed(false);
    if (viewport !== "mobile") setNavDrawerOpen(false);
  }, [viewport]);

  // The drawer is a modal layer on phones, so Escape closes it and the page
  // behind it doesn't scroll while it's open.
  useEffect(() => {
    if (!navDrawerOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setNavDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navDrawerOpen]);

  /** Switch tabs and clean up the shell state that shouldn't survive the move. */
  const goToTab = React.useCallback((name) => {
    setActiveTab(name);
    setNavDrawerOpen(false);
    setNavQuery("");
  }, []);

  // The drawer always shows full labels — there's no room to trade away on a
  // phone, and an icon-only overlay would be a worse target than the menu
  // button that opened it.
  const railCollapsed = !isMobile && sidebarCollapsed;
  const railWidth = isMobile ? 272 : (sidebarCollapsed ? AD.navWidthCollapsed : AD.navWidth);

  // Signed-in admin, with sensible fallbacks: the profile name, else the local
  // part of the email, else a generic label while the session is still loading.
  const displayAdminName =
    (adminName || "").trim() ||
    (adminEmail ? adminEmail.split("@")[0] : "") ||
    "Admin User";
  const adminInitial = displayAdminName.charAt(0).toUpperCase() || "A";

  // --- Community Forum admin (moderate + author official posts) ---
  const forumCategories = ["Growing Tips", "Pest & Disease", "Irrigation", "Weather", "Market & Prices"];
  const [forumDraft, setForumDraft] = useState({ title: "", body: "", category: "Growing Tips" });
  const handlePublishOfficialPost = () => {
    if (!forumDraft.title.trim() || !forumDraft.body.trim()) return;
    const post = {
      id: Date.now(),
      author: "EcoEquity Team",
      category: forumDraft.category,
      title: forumDraft.title.trim(),
      body: forumDraft.body.trim(),
      likes: 0,
      likedByMe: false,
      time: "Just now",
      official: true,
      pinned: true,
      replies: [],
    };
    setForumPosts((prev) => [post, ...prev]);
    setForumDraft({ title: "", body: "", category: "Growing Tips" });
    setToastMessage("Official post published to the community forum");
  };
  const [forumFilter, setForumFilter] = useState("All");
  const [forumSearch, setForumSearch] = useState("");

  const updateForumPost = (id, fn) =>
    setForumPosts((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  const updateForumReply = (postId, idx, fn) =>
    updateForumPost(postId, (p) => ({
      ...p,
      replies: (p.replies || []).map((r, i) => (i === idx ? fn(r) : r)),
    }));

  const handleDeleteForumPost = (id) => {
    setForumPosts((prev) => prev.filter((p) => p.id !== id));
    setToastMessage("Post deleted");
  };
  const handleTogglePinPost = (id) => {
    const pinned = Boolean(forumPosts.find((p) => p.id === id)?.pinned);
    updateForumPost(id, (p) => ({ ...p, pinned: !p.pinned }));
    setToastMessage(pinned ? "Post unpinned" : "Post pinned to the top of the feed");
  };
  const handleToggleLockPost = (id) => {
    const locked = Boolean(forumPosts.find((p) => p.id === id)?.locked);
    updateForumPost(id, (p) => ({ ...p, locked: !p.locked }));
    setToastMessage(locked ? "Thread reopened for replies" : "Thread locked — no new replies");
  };
  // Hiding is the reversible alternative to deleting: the post leaves the
  // public feed and every count on it, but stays here for review.
  const handleToggleHidePost = (id, reason = "Spam") => {
    const hidden = Boolean(forumPosts.find((p) => p.id === id)?.hidden);
    updateForumPost(id, (p) =>
      p.hidden
        ? { ...p, hidden: false, hiddenReason: "" }
        : { ...p, hidden: true, hiddenReason: reason, pinned: false, reports: [] }
    );
    setToastMessage(hidden ? "Post restored to the community feed" : `Post hidden as ${reason.toLowerCase()}`);
  };
  const handleDismissPostReports = (id) => {
    updateForumPost(id, (p) => ({ ...p, reports: [], reviewed: true }));
    setToastMessage("Reports cleared — post kept as is");
  };

  const handleDeleteForumReply = (postId, idx) => {
    updateForumPost(postId, (p) => ({ ...p, replies: (p.replies || []).filter((_, i) => i !== idx) }));
    setToastMessage("Reply deleted");
  };
  const handleToggleHideReply = (postId, idx, reason = "Spam") => {
    const hidden = Boolean(forumPosts.find((p) => p.id === postId)?.replies?.[idx]?.hidden);
    updateForumReply(postId, idx, (r) =>
      r.hidden
        ? { ...r, hidden: false, hiddenReason: "" }
        : { ...r, hidden: true, hiddenReason: reason, reports: [] }
    );
    setToastMessage(hidden ? "Reply restored" : `Reply hidden as ${reason.toLowerCase()}`);
  };
  const handleDismissReplyReports = (postId, idx) => {
    updateForumReply(postId, idx, (r) => ({ ...r, reports: [], reviewed: true }));
    setToastMessage("Reports cleared — reply kept as is");
  };

  const reportCount = (item) => (item?.reports || []).length;
  const forumReplies = forumPosts.flatMap((p) => (p.replies || []).map((r, i) => ({ post: p, reply: r, idx: i })));
  // Everything a moderator still has to look at: reported posts first, then
  // reported replies, newest reports carrying the most weight.
  const moderationQueue = [
    ...forumPosts.filter((p) => reportCount(p) > 0 && !p.hidden).map((p) => ({ kind: "post", post: p })),
    ...forumReplies.filter(({ reply }) => reportCount(reply) > 0 && !reply.hidden).map((x) => ({ kind: "reply", ...x })),
  ].sort((a, b) => reportCount(b.kind === "post" ? b.post : b.reply) - reportCount(a.kind === "post" ? a.post : a.reply));

  const hiddenForumCount =
    forumPosts.filter((p) => p.hidden).length + forumReplies.filter(({ reply }) => reply.hidden).length;

  const filteredForumPosts = forumPosts.filter((p) => {
    const q = forumSearch.trim().toLowerCase();
    if (q && ![p.title, p.body, p.author, p.category, ...(p.replies || []).map((r) => r.body)]
      .filter(Boolean)
      .some((t) => String(t).toLowerCase().includes(q))) return false;
    if (forumFilter === "Reported") return reportCount(p) > 0 || (p.replies || []).some((r) => reportCount(r) > 0);
    if (forumFilter === "Hidden") return p.hidden || (p.replies || []).some((r) => r.hidden);
    if (forumFilter === "Official") return Boolean(p.official || p.pinned);
    if (forumFilter === "Locked") return Boolean(p.locked);
    return true;
  });

  // --- Farm Planner admin (region weather + advisories) ---
  const forecastConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorms"];
  const [plannerDraft, setPlannerDraft] = useState(() => ({
    regions: { ...(farmPlanner?.regions || {}) },
    advisories: { wet: "", dry: "", mild: "", ...(farmPlanner?.advisories || {}) },
  }));
  const updatePlannerRegion = (region, field, value) =>
    setPlannerDraft((prev) => ({
      ...prev,
      regions: { ...prev.regions, [region]: { ...prev.regions[region], [field]: value } },
    }));
  const updatePlannerCondition = (region, dayIdx, value) =>
    setPlannerDraft((prev) => {
      const cond = [...(prev.regions[region]?.cond || [])];
      cond[dayIdx] = value;
      return { ...prev, regions: { ...prev.regions, [region]: { ...prev.regions[region], cond } } };
    });
  const handleSavePlanner = () => {
    setFarmPlanner({
      regions: plannerDraft.regions,
      advisories: plannerDraft.advisories,
    });
    setToastMessage("Farm Planner settings saved");
  };

  // --- EcoPoints & Rewards admin ---
  // Each list below is what the user dashboard renders, so an edit here is live
  // on the customer side as soon as it is saved.
  const ecoCollections = {
    rewards: { label: "reward", prefix: "RWD" },
    earnRules: { label: "earn rule", prefix: "ERN" },
    tiers: { label: "tier", prefix: "TIER" },
    badges: { label: "badge", prefix: "BDG" },
    impactStats: { label: "impact stat", prefix: "IMP" },
  };
  const ecoList = (key) => ecoProgram[key] || [];
  const updateEcoItem = (key, id, patch) =>
    setEcoProgram((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  const addEcoItem = (key, item) => {
    const { prefix, label } = ecoCollections[key];
    setEcoProgram((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { ...item, id: `${prefix}-${Date.now()}` }],
    }));
    setToastMessage(`New ${label} added — it is live on the user dashboard`);
  };
  const removeEcoItem = (key, id) => {
    setEcoProgram((prev) => ({ ...prev, [key]: (prev[key] || []).filter((item) => item.id !== id) }));
    setToastMessage(`${ecoCollections[key].label.replace(/^./, (c) => c.toUpperCase())} removed`);
  };
  const updateEcoReferral = (patch) =>
    setEcoProgram((prev) => ({ ...prev, referral: { ...(prev.referral || {}), ...patch } }));

  // --- Redemption fulfilment queue -----------------------------------------
  // Unlike everything else on this tab, these are user records rather than
  // admin-authored content: rows land here when someone spends their points,
  // so they come straight from the database (RLS returns all rows to admins)
  // and there is nothing to show when Supabase isn't configured.
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsError, setRedemptionsError] = useState(null);
  const [redemptionFilter, setRedemptionFilter] = useState("All");

  // Member balances and the economy roll-up sit alongside the queue: all three
  // are live user data rather than admin-authored content, so they load
  // together when the tab opens.
  const [memberBalances, setMemberBalances] = useState([]);
  const [economy, setEconomy] = useState(null);
  const [balanceSearch, setBalanceSearch] = useState("");
  // The member currently being credited/debited, and the form beside them.
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("100");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustBusy, setAdjustBusy] = useState(false);

  const loadRedemptions = React.useCallback(() => {
    if (!supabaseReady) return;
    setRedemptionsLoading(true);
    setRedemptionsError(null);
    Promise.all([
      fetchAllRedemptions(),
      fetchMemberBalances().catch(() => null),
      fetchEcoEconomy().catch(() => null),
    ])
      .then(([rows, balances, stats]) => {
        setRedemptions(rows || []);
        if (balances) setMemberBalances(balances);
        if (stats) setEconomy(stats);
      })
      .catch((err) => setRedemptionsError(err.message || "Could not load redemptions."))
      .finally(() => setRedemptionsLoading(false));
  }, [supabaseReady]);

  // Only fetch when the admin actually opens the tab.
  useEffect(() => {
    if (activeTab === "EcoPoints & Rewards") loadRedemptions();
  }, [activeTab, loadRedemptions]);

  const setRedemptionStatus = async (id, status) => {
    const previous = redemptions;
    setRedemptions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateRedemptionStatus(id, status);
      setToastMessage(`Redemption marked ${status}`);
    } catch (err) {
      setRedemptions(previous); // put the row back if the write was rejected
      setToastMessage(err.message || "Could not update that redemption");
    }
  };

  // Cancelling is not just another status: the member gets their points back,
  // so it goes through the RPC and then re-reads the balances it changed.
  const handleCancelRedemption = async (row) => {
    if (!window.confirm(`Cancel "${row.reward}" and refund ${row.points.toLocaleString()} pts to ${row.userName}?`)) return;
    const previous = redemptions;
    setRedemptions((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "Cancelled" } : r)));
    try {
      const { refunded } = await cancelRedemption(row.id);
      setToastMessage(`Cancelled — ${Number(refunded).toLocaleString()} pts refunded`);
      fetchMemberBalances().then((rows) => rows && setMemberBalances(rows)).catch(() => {});
      fetchEcoEconomy().then((stats) => stats && setEconomy(stats)).catch(() => {});
    } catch (err) {
      setRedemptions(previous);
      setToastMessage(err.message || "Could not cancel that redemption");
    }
  };

  // Hand-credit or debit one member. The amount and the ledger entry are both
  // written server-side by eco_adjust, so the correction appears in that
  // member's Earn History exactly like a points award they triggered.
  const handleAdjustPoints = async (direction) => {
    if (!adjustTarget) return;
    const magnitude = Math.abs(Math.trunc(Number(adjustAmount) || 0));
    if (magnitude === 0) {
      setToastMessage("Enter how many points to move");
      return;
    }
    const delta = direction === "debit" ? -magnitude : magnitude;
    setAdjustBusy(true);
    try {
      const { balance } = await adjustMemberPoints(adjustTarget.id, delta, adjustReason.trim() || undefined);
      setMemberBalances((prev) => prev.map((m) => (m.id === adjustTarget.id ? { ...m, points: balance } : m)));
      setToastMessage(`${delta > 0 ? "Credited" : "Debited"} ${magnitude.toLocaleString()} pts — ${adjustTarget.name} now has ${balance.toLocaleString()}`);
      setAdjustTarget(null);
      setAdjustReason("");
      fetchEcoEconomy().then((stats) => stats && setEconomy(stats)).catch(() => {});
    } catch (err) {
      setToastMessage(err.message || "Could not adjust that balance");
    } finally {
      setAdjustBusy(false);
    }
  };

  const visibleRedemptions = redemptions.filter(
    (r) => redemptionFilter === "All" || r.status === redemptionFilter
  );
  const pendingRedemptionCount = redemptions.filter((r) => r.status === "Active").length;
  // How many times each reward has been claimed, so the catalog editor can show
  // what is actually popular and how much stock is left.
  const rewardClaimCounts = redemptions.reduce((acc, r) => {
    if (r.status === "Cancelled") return acc;
    acc[r.rewardId] = (acc[r.rewardId] || 0) + 1;
    return acc;
  }, {});
  const visibleBalances = memberBalances.filter((m) => {
    const q = balanceSearch.trim().toLowerCase();
    return !q || m.name.toLowerCase().includes(q);
  });
  // Benefits are edited as one-per-line text and stored as an array.
  const updateTierBenefits = (id, text) =>
    updateEcoItem("tiers", id, { benefits: text.split("\n").map((s) => s.trim()).filter(Boolean) });

  // --- Expert Support admin (manage the specialists shown on the website) ---
  // Expertise is edited as a comma-separated string and stored as an array.
  const emptyAdvisorDraft = { name: "", image: "", expertiseText: "", rating: "4.5", availability: "Available", availableDays: "", availableTime: "", bio: "", verified: true, isNew: true };
  const [advisorSearchTerm, setAdvisorSearchTerm] = useState("");
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const advisorAvailabilityOptions = [
    { value: "Available", label: "Available" },
    { value: "Not Available", label: "Not Available" },
  ];
  const filteredAdvisorsList = (advisors || []).filter((a) => {
    const q = advisorSearchTerm.trim().toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || (a.expertise || []).join(" ").toLowerCase().includes(q);
  });
  const handleEditAdvisor = (advisor) =>
    setEditingAdvisor({ ...advisor, expertiseText: (advisor.expertise || []).join(", "), rating: String(advisor.rating ?? "4.5"), isNew: false });
  const handleSaveAdvisor = () => {
    if (!editingAdvisor.name || !editingAdvisor.name.trim()) {
      setToastMessage("Please provide the specialist's name.");
      return;
    }
    const record = {
      id: editingAdvisor.isNew ? Date.now() : editingAdvisor.id,
      name: editingAdvisor.name.trim(),
      image: (editingAdvisor.image || "").trim(),
      verified: !!editingAdvisor.verified,
      rating: Math.min(Math.max(parseFloat(editingAdvisor.rating) || 0, 0), 5),
      expertise: (editingAdvisor.expertiseText || "").split(",").map((s) => s.trim()).filter(Boolean),
      availability: editingAdvisor.availability || "Available",
      availableDays: editingAdvisor.availableDays || "",
      availableTime: editingAdvisor.availableTime || "",
      bio: editingAdvisor.bio || "",
    };
    if (record.expertise.length === 0) record.expertise = ["General Farming"];
    setAdvisors((prev) => editingAdvisor.isNew ? [record, ...prev] : prev.map((a) => (a.id === record.id ? record : a)));
    setEditingAdvisor(null);
    setToastMessage(editingAdvisor.isNew ? "Specialist added to Expert Support." : "Specialist details updated.");
  };
  const handleDeleteAdvisor = (id) => {
    setAdvisors((prev) => prev.filter((a) => a.id !== id));
    setToastMessage("Specialist removed from Expert Support.");
  };
  const handleToggleAdvisorAvailability = (id) =>
    setAdvisors((prev) => prev.map((a) => (a.id === id ? { ...a, availability: a.availability === "Available" ? "Not Available" : "Available" } : a)));
  const handleToggleAdvisorVerified = (id) =>
    setAdvisors((prev) => prev.map((a) => (a.id === id ? { ...a, verified: !a.verified } : a)));

  // --- Surplus Exchange admin (moderate the B2B marketplace) ---
  const [surplusSearchTerm, setSurplusSearchTerm] = useState("");
  const listingStatusOptions = [
    { value: "Available", label: "Available" },
    { value: "Reserved", label: "Reserved" },
    { value: "Sold", label: "Sold" },
  ];
  const filteredSurplusListings = (surplusListings || []).filter((l) => {
    const q = surplusSearchTerm.trim().toLowerCase();
    return !q || (l.product || "").toLowerCase().includes(q) || (l.farmer || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q);
  });
  const filteredSurplusDemands = (surplusDemands || []).filter((d) => {
    const q = surplusSearchTerm.trim().toLowerCase();
    return !q || (d.product || "").toLowerCase().includes(q) || (d.restaurant || "").toLowerCase().includes(q) || (d.location || "").toLowerCase().includes(q);
  });
  const handleSetListingStatus = (id, status) => {
    setSurplusListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setToastMessage(`Listing marked as ${status}.`);
  };
  const handleDeleteListing = (id) => {
    setSurplusListings((prev) => prev.filter((l) => l.id !== id));
    setToastMessage("Surplus listing removed.");
  };
  const handleToggleDemandStatus = (id) => {
    setSurplusDemands((prev) => prev.map((d) => (d.id === id ? { ...d, status: d.status === "Closed" ? "Open" : "Closed" } : d)));
  };
  const handleToggleDemandUrgent = (id) =>
    setSurplusDemands((prev) => prev.map((d) => (d.id === id ? { ...d, urgent: !d.urgent } : d)));
  const handleDeleteDemand = (id) => {
    setSurplusDemands((prev) => prev.filter((d) => d.id !== id));
    setToastMessage("Demand post removed.");
  };

  // --- Specialist Certification admin (manage the courses shown on the website) ---
  // `lessons`/`rating` are edited as strings and parsed on save; enrollment
  // progress and the JSX icon are carried over from the existing record.
  const emptyCourseDraft = { title: "", desc: "", instructor: "", duration: "4 Weeks", lessons: "10", price: "", image: "", badge: "", rating: "4.8", isNew: true };
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const filteredCoursesList = (certCourses || []).filter((c) => {
    const q = courseSearchTerm.trim().toLowerCase();
    return !q || (c.title || "").toLowerCase().includes(q) || (c.instructor || "").toLowerCase().includes(q) || (c.badge || "").toLowerCase().includes(q);
  });
  const handleEditCourse = (course) =>
    setEditingCourse({ ...course, lessons: String(course.lessons ?? "10"), rating: String(course.rating ?? "4.8"), isNew: false });
  const handleSaveCourse = () => {
    if (!editingCourse.title || !editingCourse.title.trim()) {
      setToastMessage("Please provide the course title.");
      return;
    }
    const record = {
      ...editingCourse,
      id: editingCourse.isNew ? Date.now() : editingCourse.id,
      title: editingCourse.title.trim(),
      desc: editingCourse.desc || "",
      instructor: (editingCourse.instructor || "").trim() || "To be announced",
      duration: (editingCourse.duration || "").trim() || "4 Weeks",
      lessons: Math.max(parseInt(editingCourse.lessons, 10) || 1, 1),
      price: (editingCourse.price || "").trim() || "₱0",
      image: (editingCourse.image || "").trim(),
      badge: (editingCourse.badge || "").trim(),
      rating: Math.min(Math.max(parseFloat(editingCourse.rating) || 0, 0), 5),
      progress: editingCourse.isNew ? 0 : (editingCourse.progress ?? 0),
    };
    delete record.isNew;
    setCertCourses((prev) => (editingCourse.isNew ? [record, ...prev] : prev.map((c) => (c.id === record.id ? record : c))));
    setEditingCourse(null);
    setToastMessage(editingCourse.isNew ? "Course added to Specialist Certification." : "Course details updated.");
  };
  const handleDeleteCourse = (id) => {
    setCertCourses((prev) => prev.filter((c) => c.id !== id));
    setToastMessage("Course removed from Specialist Certification.");
  };

  // --- Settings module (portal-wide configuration) ---
  const settingsDefaults = {
    platformName: "EcoEquity",
    supportEmail: "ecoequity.inc2026@gmail.com",
    maintenanceMode: false,
    admins: [{ id: "ADM-001", name: displayAdminName, email: adminEmail, role: "Super Admin", twoFactor: true, isYou: true }],
    paymongoEnabled: true,
    paymongoKey: "",
    aiConfidenceThreshold: 85,
    activeModel: "Verde-Agri-V2.4 (Optimized for PH Climate)",
    themeMode: "Light",
    accentColor: "#738a6e",
    secondaryColor: "#f3f7f2",
    buttonColor: "", // blank = filled buttons follow accentColor
    lastBackup: null,
  };
  // Editable draft seeded from the persisted settings; committed on "Save Changes".
  const [settingsDraft, setSettingsDraft] = useState(() => ({
    ...settingsDefaults,
    ...adminSettings,
    admins: (adminSettings.admins || settingsDefaults.admins).map((a) => ({ ...a })),
  }));
  const updateSetting = (field, value) => setSettingsDraft((prev) => ({ ...prev, [field]: value }));
  // The "(You)" row always names the signed-in account, even when an older name
  // was saved into adminSettings before this admin logged in.
  useEffect(() => {
    setSettingsDraft((prev) => {
      const stale = prev.admins.some(
        (a) => a.isYou && (a.name !== displayAdminName || (a.email || "") !== adminEmail)
      );
      if (!stale) return prev;
      return {
        ...prev,
        admins: prev.admins.map((a) =>
          a.isYou ? { ...a, name: displayAdminName, email: adminEmail } : a
        ),
      };
    });
  }, [displayAdminName, adminEmail]);
  const [editingAdmin, setEditingAdmin] = useState(null); // { id?, name, email, role, twoFactor }
  const adminRoleOptions = [
    { value: "Super Admin", label: "Super Admin" },
    { value: "Admin", label: "Admin" },
    { value: "Editor", label: "Editor" },
    { value: "Support Agent", label: "Support Agent" },
  ];
  const handleSaveAdmin = () => {
    if (!editingAdmin || !editingAdmin.name.trim()) return;
    setSettingsDraft((prev) => {
      const exists = prev.admins.some((a) => a.id === editingAdmin.id);
      const admins = exists
        ? prev.admins.map((a) => (a.id === editingAdmin.id ? { ...a, ...editingAdmin, name: editingAdmin.name.trim(), email: (editingAdmin.email || "").trim() } : a))
        : [...prev.admins, { ...editingAdmin, id: `ADM-${Date.now()}`, name: editingAdmin.name.trim(), email: (editingAdmin.email || "").trim() }];
      return { ...prev, admins };
    });
    setEditingAdmin(null);
  };
  const handleRemoveAdmin = (id) =>
    setSettingsDraft((prev) => ({ ...prev, admins: prev.admins.filter((a) => a.id !== id) }));
  const handleSaveSettings = () => {
    setAdminSettings({ ...settingsDraft });
    setToastMessage("Settings saved");
  };
  const handleBackupNow = () => {
    const stamp = new Date().toISOString();
    setSettingsDraft((prev) => ({ ...prev, lastBackup: stamp }));
    setAdminSettings((prev) => ({ ...prev, lastBackup: stamp }));
    setToastMessage("Manual backup completed");
  };
  const handleExportData = () => {
    const payload = { products, harvests, orders, supportTickets, subscribers, events, content, settings: settingsDraft };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecoequity-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage("System data exported");
  };

  const [editingProduct, setEditingProduct] = useState(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  // Auto-dismiss toast notifications so they don't linger on screen forever.
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);
  // Trigger a real client-side CSV download from an array of row objects.
  const downloadCSV = (filename, rows) => {
    if (!rows || rows.length === 0) { setToastMessage("No data available to export."); return; }
    const headers = Object.keys(rows[0]);
    const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(`Exported ${rows.length} row(s) to ${filename}`);
  };
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
  // Deliveries live in App.js: the user's Track Order view reads the same list.
  const deliveriesList = deliveries;
  const setDeliveriesList = setDeliveries;
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
  const subscribersList = subscribers;
  const setSubscribersList = setSubscribers;
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
  // Plan editing — feature lists are edited as newline-separated text, then split on save.
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planDraft, setPlanDraft] = useState({ description: "", priceMonthly: "", priceYearly: "", badge: "", features: "", excludedFeatures: "", clientVisible: true });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const eventsList = events;
  const setEventsList = setEvents;
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [selectedScan, setSelectedScan] = useState(null);
  const [scanSearchTerm, setScanSearchTerm] = useState("");
  const [scanStatusFilter, setScanStatusFilter] = useState("All");

  // --- Disease Library admin (authors what the user-facing AI Plant Doctor diagnoses) ---
  const [diseaseForm, setDiseaseForm] = useState({ name: "", plant: "", severity: "Medium", confidence: "90%", recommendation: "" });
  const handleAddDisease = () => {
    if (!diseaseForm.name.trim() || !diseaseForm.plant.trim()) return;
    const newDisease = {
      id: `DIS-${String(Date.now()).slice(-6)}`,
      name: diseaseForm.name.trim(),
      plant: diseaseForm.plant.trim(),
      crop: diseaseForm.plant.trim(),
      severity: diseaseForm.severity,
      confidence: /%$/.test(diseaseForm.confidence.trim()) ? diseaseForm.confidence.trim() : `${diseaseForm.confidence.trim() || "90"}%`,
      recommendations: diseaseForm.recommendation.split("\n").map(r => r.trim()).filter(Boolean),
    };
    if (newDisease.recommendations.length === 0) newDisease.recommendations = ["Monitor the plant and consult a local agronomist."];
    setPlantDiseases([newDisease, ...plantDiseases]);
    setDiseaseForm({ name: "", plant: "", severity: "Medium", confidence: "90%", recommendation: "" });
  };
  const handleDeleteDisease = (id) => setPlantDiseases(plantDiseases.filter(d => d.id !== id));

  const [contentSearchTerm, setContentSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("All");
  const [editingContent, setEditingContent] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userDraft, setUserDraft] = useState({ name: "", role: "Customer", status: "Offline" });
  // "Manage" opens the full member record — the same one their profile dashboard
  // renders. memberDraft is the working copy until Save.
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDraft, setMemberDraft] = useState(null);
  const [pointsAdjust, setPointsAdjust] = useState({ amount: "", reason: "" });
  const [certToIssue, setCertToIssue] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const [editingHarvest, setEditingHarvest] = useState(null);
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [harvestCategoryFilter, setHarvestCategoryFilter] = useState("All");
  const [harvestToDelete, setHarvestToDelete] = useState(null);

  const [activeSettingsTab, setActiveSettingsTab] = useState("General");

  const [editingPromo, setEditingPromo] = useState(null);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportSearchTerm, setSupportSearchTerm] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState("All");
  const [supportReplyText, setSupportReplyText] = useState("");

  // --- Live chats -----------------------------------------------------------
  // Their own state, not a slice of `supportTickets`. That prop is seeded from
  // localStorage and topped up by fetchMyTickets(), which is scoped to the
  // signed-in admin's OWN tickets — a chat opened by a member has never been in
  // it. See fetchLiveQueue() in src/data/supportAgents.js.
  const [liveQueue, setLiveQueue] = useState([]);
  const [liveAgents, setLiveAgents] = useState([]);
  const [liveQueueError, setLiveQueueError] = useState("");
  const [assigningTicketId, setAssigningTicketId] = useState(null);   // row with its picker open
  const [selectedLiveChat, setSelectedLiveChat] = useState(null);
  const [liveMessages, setLiveMessages] = useState([]);
  const [liveReplyText, setLiveReplyText] = useState("");
  const [liveSending, setLiveSending] = useState(false);
  const [agentRoster, setAgentRoster] = useState([]);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteBusy, setInviteBusy] = useState(false);

  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState([
    { id: 1, title: "New Enterprise Request", message: "Healthy Eats Cafe requested Enterprise plan.", time: "10 mins ago", type: "info", unread: true },
    { id: 2, title: "Server Load High", message: "Database usage spiked to 85%.", time: "1 hr ago", type: "warning", unread: true },
    { id: 3, title: "Payment Failed", message: "Transaction TXN-005 failed.", time: "2 hrs ago", type: "error", unread: false },
  ]);
  const unreadCount = adminNotifications.filter(n => n.unread).length;
  const [sendNotifForm, setSendNotifForm] = useState({ title: "", message: "", audience: "All", type: "Announcement", channel: "Push" });
  const [broadcasts, setBroadcasts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(BROADCASTS_STORAGE_KEY));
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) { /* ignore */ }
    return mockBroadcasts;
  });

  const riders = ridersProp;
  const setRiders = setRidersProp;
  const [showAllRiders, setShowAllRiders] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [editableRider, setEditableRider] = useState(null);
  const [riderMessageText, setRiderMessageText] = useState("");

  const audienceReach = { All: 15243, Basic: 9120, Pro: 2480, Enterprise: 640 };

  const handleSendBroadcast = () => {
    if (!sendNotifForm.title.trim() || !sendNotifForm.message.trim()) {
      setToastMessage("Please provide a notification title and message.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const reach = audienceReach[sendNotifForm.audience] || 0;
    const newBroadcast = {
      id: `BC-${Date.now()}`,
      title: sendNotifForm.title.trim(),
      message: sendNotifForm.message.trim(),
      audience: sendNotifForm.audience,
      type: sendNotifForm.type,
      channel: sendNotifForm.channel,
      time: "Just now",
      reach,
    };
    const updated = [newBroadcast, ...broadcasts];
    setBroadcasts(updated);
    try {
      localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(updated));
      // Notify any open customer website tabs so the broadcast reaches the user bell.
      window.dispatchEvent(new StorageEvent("storage", { key: BROADCASTS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
    } catch (e) { /* ignore */ }
    setSendNotifForm({ title: "", message: "", audience: "All", type: "Announcement", channel: "Push" });
    setToastMessage(`Broadcast sent to ${reach.toLocaleString()} ${newBroadcast.audience} user(s) via ${newBroadcast.channel}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteBroadcast = (id) => {
    const updated = broadcasts.filter(b => b.id !== id);
    setBroadcasts(updated);
    try { localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(updated)); } catch (e) { /* ignore */ }
    setToastMessage("Broadcast removed from history.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateRiderStatus = (riderId, status) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status, currentOrder: status === "On Delivery" ? r.currentOrder : null } : r));
    setSelectedRider(prev => prev && prev.id === riderId ? { ...prev, status } : prev);
  };

  const handleSaveRider = () => {
    if (!editableRider || !editableRider.name || !editableRider.name.trim()) {
      setToastMessage("Please provide a rider name.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setRiders(prev => {
      const exists = prev.some(r => r.id === editableRider.id);
      return exists ? prev.map(r => r.id === editableRider.id ? { ...editableRider } : r) : [...prev, { ...editableRider }];
    });
    setToastMessage(editableRider.isNew ? "New rider added to the fleet." : "Rider details updated.");
    setTimeout(() => setToastMessage(null), 3000);
    setEditableRider(null);
  };

  const handleRemoveRider = (riderId) => {
    setRiders(prev => prev.filter(r => r.id !== riderId));
    setSelectedRider(prev => prev && prev.id === riderId ? null : prev);
    setToastMessage("Rider removed from the fleet.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendRiderMessage = () => {
    if (!riderMessageText.trim()) return;
    setToastMessage(`Message sent to ${selectedRider?.name}.`);
    setRiderMessageText("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const notifRef = useRef(null);
  const [simulatedRiderDelivery, setSimulatedRiderDelivery] = useState(null);

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.name || !editingProduct.name.trim() || !editingProduct.price || editingProduct.price <= 0) {
      setToastMessage("Please provide a valid product name and a price greater than 0 before saving.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      if (editingProduct.isNew) {
        const productToSave = { ...editingProduct };
        delete productToSave.isNew;
        // Persist to Supabase so the new product survives reloads and is visible
        // to every visitor of the main website. Returns null when Supabase isn't
        // configured, in which case we keep the local-state-only behavior.
        const saved = await createProduct(productToSave);
        setProducts([saved || productToSave, ...products]);
      } else {
        const saved = await updateProduct(editingProduct.id, editingProduct);
        setProducts(products.map(p => p.id === editingProduct.id ? (saved || editingProduct) : p));
      }
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to save product to Supabase:", err);
      setToastMessage("Could not save the product. Please try again.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleManageOrder = (order) => {
    setSelectedOrder(order);
    setEditableOrderDetails({ ...order });
    setIsEditingOrderDetails(false);
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = async () => {
    try {
      // Remove from Supabase too, so the deletion is reflected on the main
      // website and persists across reloads (no-op when Supabase isn't configured).
      await deleteProduct(productToDelete);
      setProducts(products.filter(p => p.id !== productToDelete));
      setProductToDelete(null);
      setToastMessage("Product deleted.");
    } catch (err) {
      console.error("Failed to delete product from Supabase:", err);
      setToastMessage("Could not delete the product. Please try again.");
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddContent = (type, status) => {
    const num = String(content.length + 1).padStart(3, "0");
    const newItem = {
      id: `CNT-${num}`,
      title: type === "Announcement" ? "New Announcement" : "Untitled Article",
      type,
      status,
      body: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      author: "Admin",
    };
    setContent([newItem, ...content]);
    // Open it straight away — a Published item with no body shows up empty for users.
    setEditingContent(newItem);
    setToastMessage(`${type} created. Add the details clients will read.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Verifying a payment writes back to the order (and its delivery record), so the
  // customer sees "Paid" in their order tracking.
  const handleVerifyPayment = (txn) => {
    const linkedOrder = (orders || []).find(order => order.id === txn.orderId);
    if (linkedOrder) {
      setOrders((orders || []).map(order => (
        order.id === txn.orderId ? { ...order, paymentStatus: "Paid" } : order
      )));
      setDeliveriesList(prev => prev.map(d => (
        d.orderId === txn.orderId ? { ...d, paymentStatus: "Paid" } : d
      )));
    } else {
      setTransactions((transactions || []).map(t => (
        t.id === txn.id ? { ...t, status: "Paid" } : t
      )));
    }
    setSelectedPaymentTxn(prev => (prev && prev.id === txn.id ? { ...prev, status: "Paid" } : prev));
    setToastMessage(`Payment ${txn.id} verified.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setUserDraft({ name: user.name || "", role: user.role || "Customer", status: user.status || "Offline" });
  };

  const handleSaveUser = () => {
    setPlatformUsers((platformUsers || []).map(user => (
      user.id === editingUserId ? { ...normalizeMember(user), ...userDraft } : user
    )));
    setEditingUserId(null);
    setToastMessage("User updated — the change shows on their profile.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Member record: the shared copy behind the user's profile dashboard -----
  // Profile Settings, Earn History, My Certificate, EcoPoints, Wishlist and
  // Settings on the customer side all read this row, so an edit here lands on
  // the signed-in member's dashboard as soon as it is saved.
  const selectedMember = selectedMemberId
    ? normalizeMember((platformUsers || []).find(u => u.id === selectedMemberId))
    : null;

  const handleManageMember = (user) => {
    const member = normalizeMember(user);
    setSelectedMemberId(member.id);
    setMemberDraft(member);
    setPointsAdjust({ amount: "", reason: "" });
    setCertToIssue("");
  };

  const handleCloseMember = () => {
    setSelectedMemberId(null);
    setMemberDraft(null);
  };

  // Writes straight through to platformUsers rather than waiting for Save, so
  // points adjustments and certificates take effect the moment they're applied
  // — and the open draft is kept in step with them.
  const patchMember = (patch) => {
    if (!selectedMemberId) return;
    setPlatformUsers((platformUsers || []).map(user => (
      user.id === selectedMemberId ? { ...normalizeMember(user), ...patch } : user
    )));
    setMemberDraft(prev => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSaveMember = () => {
    if (!memberDraft) return;
    if (!String(memberDraft.name || "").trim()) {
      setToastMessage("Please provide a member name.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setPlatformUsers((platformUsers || []).map(user => (
      user.id === selectedMemberId ? { ...normalizeMember(user), ...memberDraft } : user
    )));
    setToastMessage(`${memberDraft.name}'s profile updated — the changes show on their dashboard.`);
    setTimeout(() => setToastMessage(null), 3000);
    handleCloseMember();
  };

  // Credits or debits the member's balance and writes the matching row into the
  // Earn History tab they see. A negative amount is a correction, not an earn,
  // so it is logged with its own icon.
  const handleAdjustMemberPoints = () => {
    const amount = parseInt(pointsAdjust.amount, 10);
    if (!selectedMember || !Number.isFinite(amount) || amount === 0) {
      setToastMessage("Enter a non-zero number of EcoPoints to apply.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const reason = String(pointsAdjust.reason || "").trim()
      || (amount > 0 ? "Points awarded by the team" : "Points adjustment by the team");
    const balance = Math.max(0, Number(selectedMember.ecoPoints || 0) + amount);
    patchMember({
      ecoPoints: balance,
      earnHistory: [memberEarnEntry(reason, amount, amount > 0 ? "Award" : "ShieldCheck"), ...selectedMember.earnHistory],
    });
    setPointsAdjust({ amount: "", reason: "" });
    setToastMessage(`${amount > 0 ? "+" : ""}${amount.toLocaleString()} EcoPoints applied — balance is now ${balance.toLocaleString()}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleIssueCertificate = () => {
    if (!selectedMember || !certToIssue) return;
    if (selectedMember.certificates.some(c => c.course === certToIssue)) {
      setToastMessage("That certificate has already been issued to this member.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    patchMember({
      certificates: [memberCertificate(certToIssue, adminSettings.platformName || "EcoEquity"), ...selectedMember.certificates],
    });
    setCertToIssue("");
    setToastMessage("Certificate issued — it now appears under My Certificate.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRevokeCertificate = (certId) => {
    if (!selectedMember) return;
    patchMember({ certificates: selectedMember.certificates.filter(c => c.id !== certId) });
    setToastMessage("Certificate revoked.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveContent = () => {
    if (!editingContent) return;
    const updated = {
      ...editingContent,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setContent((content || []).map(item => (item.id === updated.id ? updated : item)));
    setEditingContent(null);
    setToastMessage(
      updated.status === "Published"
        ? "Published — clients can now read this in their Updates tab."
        : "Content saved as " + updated.status + "."
    );
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
      emoji: <Sprout size="1em" color="var(--eco-c9)" />,
      image: "/tomato.webp",
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

  // Tell a member something happened, on whichever channels THEY switched on.
  //
  // Fire-and-forget on purpose: the admin's action has already succeeded by the
  // time this runs, so a provider outage must not roll it back or block the UI.
  // Failures land in the console and in notification_log, never in the admin's
  // way. Note we do not consult any cached copy of the member's preference —
  // the Edge Function reads the live one, which is the only copy that counts.
  const notifyMember = (email, built) => {
    if (!email || !built) return;
    notifyUser({ to: email, ...built }).catch((err) => {
      console.error("Notification not sent:", err);
    });
  };

  const handleSaveOrderStatus = (id) => {
    const order = (orders || []).find(o => o.id === id);
    setOrders((orders || []).map(o => o.id === id ? { ...o, status: newOrderStatus } : o));
    // Only when it actually moved — re-saving the same status is an admin
    // fixing a typo elsewhere on the row, not news worth a text message.
    if (order && order.status !== newOrderStatus) {
      notifyMember(order.email, orderStatusMessage(order, newOrderStatus));
    }

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

  const handleRefreshSupportTickets = () => {
    try {
      const savedTickets = localStorage.getItem(SUPPORT_TICKETS_STORAGE_KEY);
      if (!savedTickets) {
        setToastMessage("No saved support tickets to refresh.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const parsedTickets = JSON.parse(savedTickets);
      if (!Array.isArray(parsedTickets)) {
        throw new Error("Invalid support tickets payload");
      }

      if (setSupportTickets) {
        setSupportTickets(parsedTickets);
      }
      setSelectedSupportTicket(null);
      setToastMessage("Support tickets refreshed.");
    } catch (error) {
      setToastMessage("Could not refresh support tickets.");
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateSupportTicket = (ticketId, updates) => {
    if (!setSupportTickets) return;
    const updatedAt = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setSupportTickets((supportTickets || []).map(ticket => (
      ticket.id === ticketId ? { ...ticket, ...updates, lastUpdate: updatedAt } : ticket
    )));
    setSelectedSupportTicket(prev => (
      prev && prev.id === ticketId ? { ...prev, ...updates, lastUpdate: updatedAt } : prev
    ));
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanDraft({
      description: plan.description || "",
      priceMonthly: plan.priceMonthly || "",
      priceYearly: plan.priceYearly || "",
      badge: plan.badge || "",
      features: (plan.features || []).join("\n"),
      excludedFeatures: (plan.excludedFeatures || []).join("\n"),
      clientVisible: plan.clientVisible !== false,
    });
  };

  const handleSavePlan = () => {
    const toList = (text) => text.split("\n").map(line => line.trim()).filter(Boolean);
    setSubscriptionPlans((subscriptionPlans || []).map(plan => (
      plan.id === editingPlanId
        ? {
            ...plan,
            description: planDraft.description,
            priceMonthly: planDraft.priceMonthly,
            priceYearly: planDraft.priceYearly,
            badge: planDraft.badge,
            features: toList(planDraft.features),
            excludedFeatures: toList(planDraft.excludedFeatures),
            clientVisible: planDraft.clientVisible,
          }
        : plan
    )));
    setEditingPlanId(null);
    setToastMessage("Plan updated — clients now see the new details.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendSupportReply = () => {
    if (!selectedSupportTicket || !supportReplyText.trim()) return;
    const reply = {
      sender: "Admin",
      message: supportReplyText.trim(),
      time: "Just now",
    };
    const replies = [...(selectedSupportTicket.replies || []), reply];
    handleUpdateSupportTicket(selectedSupportTicket.id, {
      replies,
      status: selectedSupportTicket.status === "Resolved" ? "Resolved" : "Waiting for Customer",
      assignee: selectedSupportTicket.assignee || "Admin Support",
    });
    notifyMember(selectedSupportTicket.email, ticketReplyMessage(selectedSupportTicket, reply.message));
    setSupportReplyText("");
    setToastMessage("Support reply added.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --------------------------------------------------------------------------
  // Live chats: queue, assignment, transcript.
  //
  // The queue polls rather than subscribing. Only `ticket_messages` is
  // published to Realtime (supabase/live-chat.sql section 4), so there is no
  // event for "a new chat was opened" — and adding one would mean publishing
  // support_tickets, which pushes every ticket UPDATE to every member's socket
  // for the sake of a list only an admin ever looks at. A 15s poll while the
  // tab is open is the cheaper trade. The open TRANSCRIPT does subscribe: that
  // is a conversation, and 15s late is not a conversation.
  // --------------------------------------------------------------------------
  const reloadLiveQueue = React.useCallback(async () => {
    if (!supabaseReady) return;
    try {
      const [queue, agents, roster] = await Promise.all([
        fetchLiveQueue(),
        fetchAgents(),
        // Tolerated separately: the roster needs agent-invites.sql, which is a
        // later file than the queue's. A database stopped one file short should
        // still show its live chats rather than one missing table blanking the
        // whole tab.
        fetchAgentRoster().catch(() => []),
      ]);
      setLiveQueue(queue);
      setLiveAgents(agents);
      setAgentRoster(roster);
      setLiveQueueError("");
    } catch (err) {
      // Almost always the SQL not having been run yet. Say which file, because
      // the raw PostgREST message ("relation does not exist") does not.
      setLiveQueueError(
        /available_agents|agent_id|assign_ticket/i.test(err?.message || "")
          ? "Live chat needs supabase/support-agents.sql to be run first."
          : "Could not load live chats."
      );
    }
  }, [supabaseReady]);

  useEffect(() => {
    if (activeTab !== "Support Tickets" || !supabaseReady) return undefined;
    reloadLiveQueue();
    const timer = setInterval(reloadLiveQueue, 15000);
    return () => clearInterval(timer);
  }, [activeTab, supabaseReady, reloadLiveQueue]);

  // The open transcript. Backfill first, then subscribe — and dedupe on id,
  // because our own insert comes back down the same subscription.
  useEffect(() => {
    const ticketId = selectedLiveChat?.id;
    if (!ticketId) return undefined;

    let cancelled = false;
    setLiveMessages([]);
    fetchTicketMessages(ticketId)
      .then((rows) => { if (!cancelled) setLiveMessages(rows || []); })
      .catch(() => { if (!cancelled) setLiveMessages([]); });

    const unsubscribe = subscribeToTicket(ticketId, (message) => {
      setLiveMessages(prev => (
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      ));
    });

    return () => { cancelled = true; unsubscribe(); };
  }, [selectedLiveChat?.id]);

  const handleAssignAgent = async (ticket, agent) => {
    try {
      await assignTicket(ticket.id, agent.id);
      setAssigningTicketId(null);
      setToastMessage(`${ticket.memberName} is now with ${agent.name}.`);
      setTimeout(() => setToastMessage(null), 3000);
      reloadLiveQueue();
    } catch (err) {
      setToastMessage(err?.message || "Could not assign that chat.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSendLiveReply = async () => {
    const text = liveReplyText.trim();
    if (!selectedLiveChat || !text || liveSending) return;
    setLiveSending(true);
    try {
      const sent = await sendLiveMessage(selectedLiveChat.id, text, "agent");
      // Show it now rather than waiting for the round trip back over the
      // socket. The effect above dedupes on id when the echo arrives.
      if (sent) {
        setLiveMessages(prev => (
          prev.some(m => m.id === sent.id) ? prev : [...prev, sent]
        ));
      }
      setLiveReplyText("");
      reloadLiveQueue();
    } catch {
      setToastMessage("Message not sent — check the connection.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLiveSending(false);
    }
  };

  const handleResolveLiveChat = async () => {
    if (!selectedLiveChat) return;
    try {
      await closeLiveChat(selectedLiveChat.id);
      setSelectedLiveChat(null);
      setToastMessage("Chat closed. The member can reopen it any time.");
      setTimeout(() => setToastMessage(null), 3000);
      reloadLiveQueue();
    } catch {
      setToastMessage("Could not close that chat.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleInviteAgent = async (event) => {
    event?.preventDefault?.();
    const email = inviteForm.email.trim();
    if (!email || inviteBusy) return;
    setInviteBusy(true);
    try {
      const result = await inviteAgent({ email, name: inviteForm.name });
      setInviteForm({ name: "", email: "" });
      // 'promoted' means the address already had an account, so no email was
      // sent — saying "invitation sent" there would have the admin waiting for
      // a message that is never coming.
      setToastMessage(result?.status === "promoted"
        ? `${email} already had an account and is now an agent.`
        : `Invitation sent to ${email}.`);
      setTimeout(() => setToastMessage(null), 4000);
      reloadLiveQueue();
    } catch (err) {
      setToastMessage(err?.message || "Could not send that invitation.");
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setInviteBusy(false);
    }
  };

  const handleAgentRosterAction = async (agent, action) => {
    setInviteBusy(true);
    try {
      if (action === "resend") {
        await inviteAgent({ email: agent.email, name: agent.name, action: "resend" });
        setToastMessage(`Invitation resent to ${agent.email}.`);
      } else {
        await setAgentEnabled(agent.email, action === "enable");
        setToastMessage(action === "enable"
          ? `${agent.name || agent.email} can take chats again.`
          : `${agent.name || agent.email} has been switched off.`);
      }
      setTimeout(() => setToastMessage(null), 4000);
      reloadLiveQueue();
    } catch (err) {
      setToastMessage(err?.message || "That didn't work.");
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setInviteBusy(false);
    }
  };

  // Accept / reject a pending request. Both are one click and both are visible
  // to the member immediately — accepting stops the "waiting for an agent"
  // message even before anyone is named, which is most of the value.
  const handleReviewLiveChat = async (chat, decision) => {
    try {
      if (decision === "accept") await acceptTicket(chat.id);
      else await rejectTicket(chat.id);
      setToastMessage(decision === "accept"
        ? `Request from ${chat.memberName} accepted.`
        : `Request from ${chat.memberName} declined.`);
      setTimeout(() => setToastMessage(null), 3000);
      reloadLiveQueue();
    } catch (err) {
      setToastMessage(err?.message || "Could not update that request.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleApproveOrder = (order) => {
    setOrders((orders || []).map(o => o.id === order.id ? { ...o, status: "Approved" } : o));
    notifyMember(order.email, orderStatusMessage(order, "Approved"));
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
    notifyMember(order.email, orderStatusMessage(order, "Disapproved"));
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
    // Numbering from the highest existing id, not the list length — after a
    // delete the length repeats an id that is still in use, and the website
    // keys its event cards on it.
    const highest = eventsList.reduce((max, ev) => {
      const n = parseInt(String(ev.id).replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const newId = `EVT-${String(highest + 1).padStart(3, "0")}`;
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
      speaker: "",
      speakerImage: "",
      description: "",
      fullDescription: "",
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

  // Events live in App.js state, which is both what the public Events &
  // Workshops page renders and what useSupabaseSync writes back to the
  // `events` table — so removing one here removes it from the website too.
  const confirmDeleteEvent = () => {
    const removed = eventsList.find(ev => ev.id === eventToDelete);
    setEventsList(eventsList.filter(ev => ev.id !== eventToDelete));
    if (selectedEvent && selectedEvent.id === eventToDelete) {
      setSelectedEvent(null);
      setIsEditingEvent(false);
      setEditableEvent(null);
    }
    setEventToDelete(null);
    setToastMessage(`"${removed?.title || "Event"}" deleted — it is now off the website too.`);
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
      icon: <Sprout size="1em" color="var(--eco-c9)" />,
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

  /**
   * The nav, grouped by what you came to do.
   *
   * "Community" used to hold ten of the portal's twenty-three sections — half
   * the nav under one heading, well past the point where a group label helps
   * you find anything. It's split three ways here (People / Programs /
   * Content), so no group runs longer than five rows and the whole nav fits
   * without scrolling on a normal laptop.
   */
  const sidebarGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Reports & Analytics", icon: BarChart2 },
      ],
    },
    {
      label: "Commerce",
      items: [
        { name: "Products", icon: Box },
        { name: "Orders", icon: ShoppingCart },
        { name: "Payments", icon: CreditCard },
        { name: "Subscriptions", icon: Repeat },
        { name: "Surplus Exchange", icon: Package },
      ],
    },
    {
      label: "Operations",
      items: [
        { name: "Deliveries", icon: Truck },
        { name: "Delivered Reports", icon: CheckCircle },
        { name: "Support Tickets", icon: Ticket },
        { name: "Seasonal Harvests", icon: Wheat },
      ],
    },
    {
      label: "People",
      items: [
        { name: "Users", icon: Users },
        { name: "Farmers Verification", icon: ShieldCheck },
        { name: "Expert Support", icon: UserCheck },
      ],
    },
    {
      label: "Programs",
      items: [
        { name: "Events & Workshops", icon: CalendarDays },
        { name: "Specialist Certification", icon: GraduationCap },
        { name: "AI Plant Doctor", icon: Stethoscope },
        { name: "Farm Planner", icon: Thermometer },
        { name: "EcoPoints & Rewards", icon: Gift },
      ],
    },
    {
      label: "Content",
      items: [
        { name: "Community Forum", icon: MessageSquare },
        { name: "Content Management", icon: FileText },
      ],
    },
    {
      label: "System",
      items: [
        { name: "Settings", icon: Settings },
      ],
    },
  ];
  const groupForTab = (name) => (sidebarGroups.find(g => g.items.some(i => i.name === name)) || {}).label || "";

  // Short context line shown under each page title (breadcrumb subtitle).
  const tabSubtitles = {
    "Dashboard": `Welcome back, ${displayAdminName} — key metrics and activity at a glance`,
    "Reports & Analytics": "Performance trends and exportable reports",
    "Products": "Manage catalog items, pricing and stock",
    "Orders": "Review and approve incoming orders",
    "Payments": "Track transactions and settlements",
    "Subscriptions": "Manage subscribers and plan campaigns",
    "Deliveries": "Monitor active deliveries and riders",
    "Delivered Reports": "Completed delivery history",
    "Support Tickets": "Respond to customer support requests",
    "Seasonal Harvests": "Manage seasonal harvest listings",
    "Users": "Browse and manage platform accounts",
    "Farmers Verification": "Review and verify farmer applications",
    "Events & Workshops": "Schedule and manage community events",
    "Expert Support": "Manage the specialists shown on the website",
    "Specialist Certification": "Manage certification courses, pricing and photos",
    "Surplus Exchange": "Moderate B2B surplus listings and demands",
    "AI Plant Doctor": "Review plant disease scan submissions",
    "Community Forum": "Moderate posts and publish official content",
    "Farm Planner": "Manage weather outlook and planting advisories",
    "EcoPoints & Rewards": "Manage the rewards, tiers and badges users see",
    "Content Management": "Publish and manage site content",
    "Settings": "Configure portal preferences",
  };

  /**
   * Routes the one header search box to the active tab's search state.
   *
   * Nine tabs used to render a *second* box inside their filter row, bound to
   * this same state — two identical fields on screen, both typing into the
   * same filter. The in-panel copies are gone; search now lives in one place,
   * the same place on every tab, next to the filters' own controls in the
   * header. Placeholders here keep the wording the in-panel boxes used where
   * it was more specific ("Search crops...", not "Search harvests...").
   */
  const searchConfigByTab = {
    "Products": { value: productSearchTerm, setValue: setProductSearchTerm, placeholder: "Search products..." },
    "Orders": { value: orderSearchTerm, setValue: setOrderSearchTerm, placeholder: "Search orders..." },
    "Payments": { value: paymentSearchTerm, setValue: setPaymentSearchTerm, placeholder: "Search transactions..." },
    "Subscriptions": { value: subSearchTerm, setValue: setSubSearchTerm, placeholder: "Search subscribers..." },
    "Deliveries": { value: deliverySearchTerm, setValue: setDeliverySearchTerm, placeholder: "Search deliveries..." },
    "Delivered Reports": { value: deliverySearchTerm, setValue: setDeliverySearchTerm, placeholder: "Search delivered..." },
    "Support Tickets": { value: supportSearchTerm, setValue: setSupportSearchTerm, placeholder: "Search tickets..." },
    "Seasonal Harvests": { value: harvestSearchTerm, setValue: setHarvestSearchTerm, placeholder: "Search crops..." },
    "Events & Workshops": { value: eventSearchTerm, setValue: setEventSearchTerm, placeholder: "Search events..." },
    "Expert Support": { value: advisorSearchTerm, setValue: setAdvisorSearchTerm, placeholder: "Search specialists..." },
    "Specialist Certification": { value: courseSearchTerm, setValue: setCourseSearchTerm, placeholder: "Search courses..." },
    "Surplus Exchange": { value: surplusSearchTerm, setValue: setSurplusSearchTerm, placeholder: "Search listings & demands..." },
    "AI Plant Doctor": { value: scanSearchTerm, setValue: setScanSearchTerm, placeholder: "Search plant or disease..." },
    "Content Management": { value: contentSearchTerm, setValue: setContentSearchTerm, placeholder: "Search content..." },
  };
  const activeSearch = searchConfigByTab[activeTab];

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

  const deliveredReportsList = deliveriesList.filter(delivery => {
    if (delivery.status !== "Delivered") return false;
    const query = deliverySearchTerm.trim().toLowerCase();
    return !query ||
      delivery.id.toLowerCase().includes(query) ||
      delivery.customer.toLowerCase().includes(query);
  });

  const openSupportTicketsCount = (supportTickets || []).filter(ticket => ticket.status !== "Resolved").length;
  // The badge number: someone asked for a human and nobody has answered them.
  // A pending request counts even if they have said nothing since — the silence
  // IS the problem — and a closed or declined chat never does.
  const liveWaitingCount = liveQueue.filter(chat => (
    chat.liveStatus === "pending" ||
    (chat.waitingOnUs && chat.liveStatus !== "closed" && chat.liveStatus !== "rejected")
  )).length;
  const urgentSupportTicketsCount = (supportTickets || []).filter(ticket => ticket.priority === "Urgent" || ticket.priority === "High").length;

  /**
   * Counts of "needs a human" work, shown as a badge on the nav row that
   * handles it. Only Support Tickets carried one before, so an order sitting
   * unapproved was invisible until you happened to open the tab.
   */
  const navBadgeCounts = {
    "Orders": pendingOrdersCount,
    "Support Tickets": openSupportTicketsCount,
    "Farmers Verification": mockVerifications.length,
    "AI Plant Doctor": (plantScans || []).filter(s => s.status === "Under Review" || s.status === "Critical").length,
    "Surplus Exchange": (surplusListings || []).filter(l => l.status === "Pending").length,
  };
  const totalActionCount = Object.values(navBadgeCounts).reduce((sum, n) => sum + (n || 0), 0);

  // The nav filter matches on the section name and its group, so typing
  // "commerce" surfaces the whole Commerce group and "cert" finds Specialist
  // Certification without knowing which heading it lives under.
  const navQueryText = navQuery.trim().toLowerCase();
  const visibleSidebarGroups = navQueryText
    ? sidebarGroups
        .map(group => ({
          ...group,
          items: group.label.toLowerCase().includes(navQueryText)
            ? group.items
            : group.items.filter(item => item.name.toLowerCase().includes(navQueryText)),
        }))
        .filter(group => group.items.length > 0)
    : sidebarGroups;
  const dashboardStats = [
    ...mockStats,
    {
      label: "Open Tickets",
      value: String(openSupportTicketsCount),
      trend: urgentSupportTicketsCount > 0 ? `${urgentSupportTicketsCount} priority` : "Clear",
      up: urgentSupportTicketsCount === 0,
      icon: <Ticket size={16} color="#7c3aed" />,
    },
  ];
  const filteredSupportTickets = (supportTickets || []).filter(ticket => {
    const query = supportSearchTerm.toLowerCase();
    const matchesSearch = !query ||
      ticket.id.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.name.toLowerCase().includes(query) ||
      ticket.email.toLowerCase().includes(query);
    const matchesStatus = supportStatusFilter === "All" || ticket.status === supportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Every real order is a payment record, so the Payments tab reflects live checkouts
  // rather than a frozen list. Seeded transactions with no matching order are kept.
  const orderTransactions = (orders || []).map(order => ({
    id: `TXN-${order.id}`,
    orderId: order.id,
    customer: order.customer,
    method: order.payment || "Cash on Delivery",
    amount: typeof order.total === "number" ? `₱${order.total.toFixed(2)}` : (order.total || "₱0.00"),
    status: order.paymentStatus || "Pending",
    date: order.date,
    refNo: order.refNo || "N/A",
  }));
  const combinedTransactions = [
    ...orderTransactions,
    ...(transactions || []).filter(txn => !(orders || []).some(order => order.id === txn.orderId)),
  ];

  const filteredTransactionsList = combinedTransactions.filter(txn => {
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

  // Live event stats computed from the shared events list (replaces static mocks)
  const upcomingEventsCount = eventsList.filter(ev => ev.status === "Upcoming").length;
  const totalEventAttendees = eventsList.reduce((sum, ev) => sum + (Number(ev.attendees) || 0), 0);
  const totalEventCapacity = eventsList.reduce((sum, ev) => sum + (Number(ev.maxAttendees) || 0), 0);
  const eventFillRate = totalEventCapacity > 0 ? Math.round((totalEventAttendees / totalEventCapacity) * 100) : 0;
  const eventStatsLive = [
    { label: "Total Events", value: String(eventsList.length), trend: `${upcomingEventsCount} upcoming`, up: true, icon: <CalendarDays size={16} color="#0284c7" /> },
    { label: "Total Attendees", value: totalEventAttendees.toLocaleString(), trend: "registered", up: true, icon: <Users size={16} color="var(--eco-c11)" /> },
    { label: "Upcoming Workshops", value: String(eventsList.filter(ev => ev.type === "Workshop" && ev.status === "Upcoming").length), trend: "scheduled", up: true, icon: <Ticket size={16} color="#f59e0b" /> },
    { label: "Seats Filled", value: `${eventFillRate}%`, trend: "avg fill rate", up: eventFillRate >= 50, icon: <PieChart size={16} color="#8b5cf6" /> },
  ];
  const upcomingScheduleEvents = eventsList.filter(ev => ev.status === "Upcoming").slice(0, 3);

  const filteredScansList = plantScans.filter(scan => {
    const matchesSearch = scan.plant.toLowerCase().includes(scanSearchTerm.toLowerCase()) || 
                          scan.disease.toLowerCase().includes(scanSearchTerm.toLowerCase()) ||
                          scan.user.toLowerCase().includes(scanSearchTerm.toLowerCase());
    const matchesStatus = scanStatusFilter === "All" || scan.status === scanStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContentList = content.filter(cnt => {
    const matchesSearch = cnt.title.toLowerCase().includes(contentSearchTerm.toLowerCase()) || 
                          cnt.id.toLowerCase().includes(contentSearchTerm.toLowerCase());
    const matchesType = contentTypeFilter === "All" || cnt.type === contentTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredAdminProducts = products.filter(p => {
    const matchesCategory = productCategoryFilter === "All" || p.category === productCategoryFilter;
    const query = productSearchTerm.trim().toLowerCase();
    const matchesSearch = !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const getStatusStyle = (status) => {
    if (status === "Pending Approval") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Approved") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Delivered") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Processing") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Packed") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Shipped") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Out for Delivery" || status === "In Transit") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Cancelled" || status === "Delayed" || status === "Disapproved") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Pending Pickup") return { background: "rgba(107,114,128,0.1)", color: "#4b5563" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getPaymentStatusStyle = (status) => {
    if (status === "Paid") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Pending") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Failed") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Refunded") return { background: "rgba(107,114,128,0.1)", color: "#4b5563" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getSubStatusStyle = (status) => {
    if (status === "Active") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Trial") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Pending Renewal") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Cancelled" || status === "Expired") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getEventStatusStyle = (status) => {
    if (status === "Upcoming") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Ongoing") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Completed") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Cancelled") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getScanStatusStyle = (status) => {
    if (status === "Healthy" || status === "Resolved") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Disease Detected") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Critical") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Under Review") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
    return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
  };

  const getContentStatusStyle = (status) => {
    if (status === "Published") return { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
    if (status === "Draft") return { background: "rgba(107,114,128,0.1)", color: "#6b7280" };
    if (status === "Scheduled") return { background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" };
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
            0% { box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0.6); }
            70% { box-shadow: 0 0 0 8px rgba(var(--eco-c7-rgb), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0); }
          }
          @keyframes pulseBadge {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0.6); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(var(--eco-c7-rgb), 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--eco-c7-rgb), 0); }
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
        <div style={modalOverlay(MODAL_LAYER.base)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
              <Trash2 size={24} color="var(--eco-c9)" />
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
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {harvestToDelete && (
        <div style={modalOverlay(MODAL_LAYER.base)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
              <Trash2 size={24} color="var(--eco-c9)" />
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
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Nested tier: this confirmation can be raised from inside the event
          detail modal, which already sits on the base tier. */}
      {eventToDelete && (
        <div style={modalOverlay(MODAL_LAYER.nested)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "85%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" }}>
              <Trash2 size={24} color="var(--eco-c9)" />
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Delete Event?</h3>
            <p style={{ margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
              “{eventsList.find(ev => ev.id === eventToDelete)?.title || "This event"}” will disappear from the public Events &amp; Workshops page as well. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                onClick={() => setEventToDelete(null)}
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
              >Cancel</button>
              <button
                onClick={confirmDeleteEvent}
                style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800 }}>Order {selectedOrder.id}</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                 <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(selectedOrder.status) }}>{selectedOrder.status}</span>
                 <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{selectedOrder.date}</span>
               </div>
               {!isEditingOrderDetails && selectedOrder.status === "Pending Approval" && (
                 <button onClick={() => setIsEditingOrderDetails(true)} style={{ background: "rgba(var(--eco-c7-rgb), 0.1)", border: "none", color: "var(--eco-c13)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><Edit2 size={12}/> Edit Details</button>
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
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><Users size={14} color="var(--eco-c11)" /> {selectedOrder.customer}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px" }}><Phone size={14} color="var(--eco-c11)" /> {selectedOrder.phone}</div>
                     {selectedOrder.email && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px" }}><FileText size={14} color="var(--eco-c11)" /> {selectedOrder.email}</div>}
                     <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.4 }}><MapPin size={14} color="var(--eco-c11)" style={{ flexShrink: 0, marginTop: "2px" }} /> {selectedOrder.address}</div>
                     {selectedOrder.instructions && <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.4, marginTop: "8px", color: "var(--eco-c13)", padding: "8px", background: "rgba(var(--eco-c7-rgb), 0.1)", borderRadius: "8px", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)" }}><MessageSquare size={14} color="var(--eco-c9)" style={{ flexShrink: 0, marginTop: "2px" }} /> Note: {selectedOrder.instructions}</div>}
                   </>
                 )}
               </div>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Order Details</h4>
                 {isEditingOrderDetails ? (
                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                     <input type="text" value={editableOrderDetails.amount || `₱${editableOrderDetails.total?.toFixed(2)}`} onChange={e => setEditableOrderDetails({...editableOrderDetails, amount: e.target.value})} style={styles.editInput} placeholder="Amount (e.g. ₱2,100)" />
                     <AdminEcoDropdown value={editableOrderDetails.payment} options={[{ value: "Credit Card", label: "Credit Card" }, { value: "GCash", label: "GCash" }, { value: "Maya", label: "Maya" }, { value: "Bank Transfer", label: "Bank Transfer" }, { value: "Cash on Delivery", label: "Cash on Delivery" }]} onChange={value => setEditableOrderDetails({...editableOrderDetails, payment: value})} />
                     <AdminEcoDropdown value={editableOrderDetails.paymentStatus} options={[{ value: "Paid", label: "Paid" }, { value: "Pending", label: "Pending" }]} onChange={value => setEditableOrderDetails({...editableOrderDetails, paymentStatus: value})} />
                     <textarea value={editableOrderDetails.products || editableOrderDetails.items} onChange={e => setEditableOrderDetails({...editableOrderDetails, products: e.target.value})} style={{...styles.editInput, resize: "vertical"}} placeholder="Products" rows={3} />
                   </div>
                 ) : (
                   <>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 700 }}><CreditCard size={14} color="var(--eco-c11)" /> {selectedOrder.amount || `₱${selectedOrder.total?.toFixed(2)}`} ({selectedOrder.payment}) <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10px", background: selectedOrder.paymentStatus === "Paid" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c7-rgb), 0.1)", color: selectedOrder.paymentStatus === "Paid" ? "var(--eco-c13)" : "var(--eco-c13)" }}>{selectedOrder.paymentStatus || "Pending"}</span></div>
                     <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px", fontSize: "13px", lineHeight: 1.4 }}><Package size={14} color="var(--eco-c11)" style={{ flexShrink: 0, marginTop: "2px" }} /> {selectedOrder.products || selectedOrder.items}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><Truck size={14} color="var(--eco-c11)" /> Rider: {selectedOrder.rider}</div>
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
                }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}><Save size={16}/> Save Details</button>
                <button onClick={() => setIsEditingOrderDetails(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Cancel</button>
              </div>
            ) : selectedOrder.status === "Pending Approval" ? (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => handleApproveOrder(selectedOrder)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}><CheckCircle size={16}/> Approve Order</button>
                <button onClick={() => handleCancelOrder(selectedOrder)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Disapprove Order</button>
              </div>
            ) : null}

            <button onClick={() => { setSelectedOrder(null); setIsEditingOrderDetails(false); }} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" }}>Close Details</button>
          </div>
        </div>
      )}
      {selectedDelivery && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setSelectedDelivery(null)}>
          <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(var(--eco-c0-rgb), 0.92))", padding: "32px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.82)", boxShadow: "0 24px 70px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.9)", width: "90%", maxWidth: "500px", position: "relative", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: "4px", background: "linear-gradient(90deg, var(--eco-c5), var(--eco-c5), var(--eco-c5))" }} />
            <button onClick={() => setSelectedDelivery(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--eco-c15)", boxShadow: "0 10px 22px rgba(15,23,42,0.08)" }}><X size={16} /></button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", paddingRight: "38px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 14px 30px rgba(var(--eco-c7-rgb), 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--eco-c15)", flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "var(--eco-c19)", letterSpacing: "-0.2px" }}>Delivery {selectedDelivery.id}</h2>
                <div style={{ fontSize: "12px", color: "rgba(var(--eco-c19-rgb), 0.58)", fontWeight: 700 }}>Manage rider assignment and rider-only updates</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(editableDelivery.status) }}>{editableDelivery.status}</span>
                <span style={{ fontSize: "12px", color: "rgba(var(--eco-c19-rgb), 0.55)", alignSelf: "center", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.7)" }}>Order: {editableDelivery.orderId}</span>
            </div>

            <div style={{ ...ecoGlassPanelStyle, padding: "20px", borderRadius: "20px", marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(var(--eco-c19-rgb), 0.58)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><Settings size={14} color="var(--eco-c11)" /> Manage Delivery</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                 <div>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Assign Rider</label>
                   <AdminEcoDropdown value={editableDelivery.rider} options={[{ value: "Unassigned", label: "Unassigned" }, ...riders.map(r => ({ value: r.name, label: r.name }))]} onChange={value => setEditableDelivery({...editableDelivery, rider: value})} />
                 </div>
                 <div>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Rider Status</label>
                   <AdminEcoDropdown value={editableDelivery.riderStatus || "Preparing Order"} options={riderNotificationStatuses.map(status => ({ value: status, label: status }))} onChange={value => setEditableDelivery({...editableDelivery, riderStatus: value})} />
                 </div>
                 <div style={{ gridColumn: "1 / -1" }}>
                   <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Estimated Time of Arrival (ETA)</label>
                   <input type="text" value={editableDelivery.eta} onChange={(e) => setEditableDelivery({...editableDelivery, eta: e.target.value})} placeholder="e.g. 15 mins or 2:00 PM" style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                 </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <button onClick={handleNotifyRider} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "14px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c7-rgb), 0.18)", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 10px 22px rgba(var(--eco-c7-rgb), 0.08)" }}><Truck size={16} /> Notify Rider</button>
              <button onClick={() => { setToastMessage(`Notified ${editableDelivery.customer} of delivery update!`); setTimeout(() => setToastMessage(null), 3000); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "14px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c7-rgb), 0.16)", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 10px 22px rgba(var(--eco-c7-rgb), 0.08)" }}><Bell size={16} /> Notify Customer</button>
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
        <div style={modalOverlay(MODAL_LAYER.nested)} onClick={() => { setSimulatedRiderDelivery(null); setIsRiderChatOpen(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "500px", position: "relative", color: "#000" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", color: "#000" }}><Truck color="var(--eco-c11)" /> Rider Logistics App</h2>
              <button onClick={() => { setSimulatedRiderDelivery(null); setIsRiderChatOpen(false); }} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#000" }}><X size={16} /></button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700 }}>ORDER ID</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--eco-c13)" }}>{simulatedRiderDelivery.orderId}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <MapPin size={16} color="var(--eco-c7)" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 700, marginBottom: "2px" }}>PICKUP LOCATION</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>EcoEquity Main Hub, Baguio</div>
                  </div>
                </div>
                <div style={{ width: "2px", height: "16px", background: "rgba(var(--eco-c9-rgb), 0.16)", marginLeft: "7px" }} />
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <MapPin size={16} color="var(--eco-c8)" style={{ marginTop: "2px" }} />
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
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>{simulatedRiderDelivery.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", marginBottom: "20px" }}>
              <button onClick={() => setIsRiderChatOpen(true)} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><MessageSquare size={16} /> Chat Rider</button>
            </div>

            {isRiderChatOpen && (
              <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)", borderRadius: "24px", display: "flex", alignItems: "stretch", justifyContent: "stretch" }} onClick={() => setIsRiderChatOpen(false)}>
                <div style={{ width: "100%", minHeight: "100%", background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", color: "#000", boxSizing: "border-box", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#000", display: "flex", alignItems: "center", gap: "7px" }}><MessageSquare size={18} color="var(--eco-c11)" /> Chat Rider</div>
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
                        <button key={message} onClick={() => handleSendRiderChatMessage(message)} style={{ minHeight: "42px", padding: "8px 10px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.18)", fontSize: "10px", fontWeight: 700, cursor: "pointer", textAlign: "left", lineHeight: 1.25 }}>
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
                          <div style={{ maxWidth: "84%", padding: "9px 11px", borderRadius: "14px", borderBottomRightRadius: isAdmin ? "4px" : "14px", borderBottomLeftRadius: isAdmin ? "14px" : "4px", background: isAdmin ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))" : "linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.15))", color: isAdmin ? "var(--eco-c19)" : "#111827", border: isAdmin ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(var(--eco-c5-rgb), 0.3)", boxShadow: isAdmin ? "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)" : "0 0 18px rgba(var(--eco-c5-rgb), 0.25), inset 0 1px 0 rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, lineHeight: 1.35 }}>
                            <div>{message.text}</div>
                            <div style={{ marginTop: "4px", fontSize: "9px", color: isAdmin ? "rgba(var(--eco-c19-rgb), 0.62)" : "rgba(17,24,39,0.55)", fontWeight: 700 }}>{message.time}</div>
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
                style={{ padding: "14px", borderRadius: "12px", background: simulatedRiderDelivery.status === "Pending Pickup" ? "var(--eco-c7)" : "rgba(0,0,0,0.05)", color: simulatedRiderDelivery.status === "Pending Pickup" ? "#fff" : "rgba(0,0,0,0.3)", border: "none", fontWeight: 700, fontSize: "14px", cursor: simulatedRiderDelivery.status === "Pending Pickup" ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                Accept & Start Delivery
              </button>
              <button 
                onClick={() => updateRiderStatus("Delivered")}
                disabled={simulatedRiderDelivery.status !== "In Transit" && simulatedRiderDelivery.status !== "Out for Delivery"}
                style={{ padding: "14px", borderRadius: "12px", background: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "var(--eco-c9)" : "rgba(0,0,0,0.05)", color: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "#fff" : "rgba(0,0,0,0.3)", border: "none", fontWeight: 700, fontSize: "14px", cursor: (simulatedRiderDelivery.status === "In Transit" || simulatedRiderDelivery.status === "Out for Delivery") ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedRider && (
        <div style={modalOverlay(MODAL_LAYER.nestedConfirm)} onClick={() => setSelectedRider(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "28px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "100%", maxWidth: "440px", position: "relative", color: "#000", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedRider(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#000" }}><X size={16} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", color: "#475569" }}>{selectedRider.name.charAt(0)}</div>
                <div style={{ position: "absolute", bottom: "0", right: "0", width: "13px", height: "13px", borderRadius: "50%", background: riderStatusColor(selectedRider.status), border: "2px solid #fff" }} />
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{selectedRider.name}</div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{selectedRider.id} • <Star size={11} fill="var(--eco-c7)" color="var(--eco-c7)" style={{ verticalAlign: "middle" }} /> {selectedRider.rating}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase" }}>Phone</div>
                <div style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}><Phone size={13} color="var(--eco-c7)" /> {selectedRider.phone}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase" }}>Area</div>
                <div style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}><MapPin size={13} color="var(--eco-c9)" /> {selectedRider.area}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase" }}>Vehicle</div>
                <div style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}><Truck size={13} color="var(--eco-c7)" /> {selectedRider.vehicle}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase" }}>Total Trips</div>
                <div style={{ fontSize: "13px", fontWeight: 700, marginTop: "4px" }}>{selectedRider.deliveries.toLocaleString()}</div>
              </div>
            </div>

            {selectedRider.currentOrder && (
              <div style={{ background: "rgba(var(--eco-c7-rgb), 0.1)", borderRadius: "12px", padding: "12px", marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--eco-c13)" }}>Currently delivering</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--eco-c13)" }}>{selectedRider.currentOrder}</span>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Update Status</div>
              <AdminEcoDropdown value={selectedRider.status} options={RIDER_STATUS_OPTIONS} onChange={value => handleUpdateRiderStatus(selectedRider.id, value)} />
            </div>

            <div>
              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Send Message</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={riderMessageText} onChange={e => setRiderMessageText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSendRiderMessage(); }} placeholder={`Message ${selectedRider.name}...`} style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "#000", outline: "none", fontSize: "12px", fontFamily: "inherit" }} />
                <button onClick={handleSendRiderMessage} disabled={!riderMessageText.trim()} style={{ width: "42px", height: "42px", borderRadius: "12px", background: riderMessageText.trim() ? "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))" : "rgba(0,0,0,0.05)", color: riderMessageText.trim() ? "#fff" : "rgba(0,0,0,0.35)", border: "none", cursor: riderMessageText.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Send size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAllRiders && (
        <div style={modalOverlay(MODAL_LAYER.nestedConfirm)} onClick={() => { setShowAllRiders(false); setEditableRider(null); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "28px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "100%", maxWidth: "640px", position: "relative", color: "#000", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><UserCheck color="var(--eco-c11)" size={22} /> Rider Fleet Management</h2>
              <button onClick={() => { setShowAllRiders(false); setEditableRider(null); }} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#000" }}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", fontSize: "12px", fontWeight: 700, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 12px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" }}>{riders.filter(r => r.status === "Available").length} Available</span>
              <span style={{ padding: "5px 12px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.12)", color: "var(--eco-c13)" }}>{riders.filter(r => r.status === "On Delivery").length} On Delivery</span>
              <span style={{ padding: "5px 12px", borderRadius: "999px", background: "rgba(148,163,184,0.18)", color: "#475569" }}>{riders.filter(r => r.status === "Offline").length} Offline</span>
            </div>

            {editableRider ? (
              <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: "16px", padding: "18px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "12px" }}>{editableRider.isNew ? "Add New Rider" : `Edit ${editableRider.name}`}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <input value={editableRider.name} onChange={e => setEditableRider({ ...editableRider, name: e.target.value })} placeholder="Full name" style={{ ...styles.editInput, background: "rgba(255,255,255,0.8)" }} />
                  <input value={editableRider.phone} onChange={e => setEditableRider({ ...editableRider, phone: e.target.value })} placeholder="Phone" style={{ ...styles.editInput, background: "rgba(255,255,255,0.8)" }} />
                  <input value={editableRider.area} onChange={e => setEditableRider({ ...editableRider, area: e.target.value })} placeholder="Service area" style={{ ...styles.editInput, background: "rgba(255,255,255,0.8)" }} />
                  <input value={editableRider.vehicle} onChange={e => setEditableRider({ ...editableRider, vehicle: e.target.value })} placeholder="Vehicle" style={{ ...styles.editInput, background: "rgba(255,255,255,0.8)" }} />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <AdminEcoDropdown value={editableRider.status} options={RIDER_STATUS_OPTIONS} onChange={value => setEditableRider({ ...editableRider, status: value })} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleSaveRider} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Save size={14} /> Save Rider</button>
                  <button onClick={() => setEditableRider(null)} style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditableRider({ id: `RDR-${Date.now()}`, name: "", status: "Available", rating: 5.0, deliveries: 0, phone: "", area: "", vehicle: "Eco-Bike", currentOrder: null, isNew: true })} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px dashed rgba(var(--eco-c9-rgb), 0.4)", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}><Plus size={16} /> Add New Rider</button>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {riders.map((rider) => (
                <div key={rider.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.55)", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569" }}>{rider.name.charAt(0)}</div>
                    <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "11px", height: "11px", borderRadius: "50%", background: riderStatusColor(rider.status), border: "2px solid #fff" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>{rider.name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{rider.area} • {rider.vehicle} • {rider.deliveries.toLocaleString()} trips</div>
                  </div>
                  <div style={{ width: "130px", flexShrink: 0 }}>
                    <AdminEcoDropdown compact value={rider.status} options={RIDER_STATUS_OPTIONS} onChange={value => handleUpdateRiderStatus(rider.id, value)} />
                  </div>
                  <button onClick={() => setEditableRider({ ...rider })} title="Edit rider" style={{ background: "rgba(var(--eco-c7-rgb), 0.1)", border: "none", color: "var(--eco-c13)", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Edit2 size={14} /></button>
                  <button onClick={() => handleRemoveRider(rider.id)} title="Remove rider" style={{ background: "rgba(var(--eco-c9-rgb), 0.08)", border: "none", color: "var(--eco-c13)", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedPaymentTxn && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setSelectedPaymentTxn(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "450px", position: "relative" }} onClick={e => e.stopPropagation()}>
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
                 <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--eco-c13)" }}>{selectedPaymentTxn.orderId}</span>
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
                 <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--eco-c13)" }}>{selectedPaymentTxn.amount}</span>
               </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
              <button onClick={() => handleVerifyPayment(selectedPaymentTxn)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><CheckCircle size={16} /> Verify</button>
              <button onClick={() => downloadCSV(`receipt-${selectedPaymentTxn.id}.csv`, [selectedPaymentTxn])} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "rgba(107,114,128,0.1)", color: "#4b5563", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Download size={16} /> Receipt</button>
            </div>

            {selectedPaymentTxn.status === "Paid" && (
              <button onClick={() => setToastMessage(`Refund initiated for ${selectedPaymentTxn.id} (${selectedPaymentTxn.amount})`)} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginBottom: "16px" }}>Refund Payment</button>
            )}

            <button onClick={() => setSelectedPaymentTxn(null)} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
      {editingPromo && (
        <div style={modalOverlay(MODAL_LAYER.base)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "400px", position: "relative" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 800 }}>{editingPromo.isNew ? "Add Promo Code" : "Edit Promo Code"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <input type="text" placeholder="Promo Code (e.g. SUMMER20)" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase().replace(/\s+/g, '')})} style={styles.editInput} />
              <input type="text" placeholder="Description" value={editingPromo.desc} onChange={e => setEditingPromo({...editingPromo, desc: e.target.value})} style={styles.editInput} />
              <AdminEcoDropdown value={editingPromo.type} options={[{ value: "percent", label: "Percentage Discount (%)" }, { value: "fixed", label: "Fixed Amount Discount (₱)" }, { value: "shipping", label: "Free Shipping" }]} onChange={value => setEditingPromo({...editingPromo, type: value})} />
              {editingPromo.type !== "shipping" && (
                <input type="number" placeholder="Discount Value" value={editingPromo.value || ""} onChange={e => setEditingPromo({...editingPromo, value: parseFloat(e.target.value) || 0})} style={styles.editInput} />
              )}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEditingPromo(null)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSavePromo} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "var(--eco-c9)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Member record — mirrors the customer's profile dashboard one-for-one:
          Profile Settings, EcoPoints & Earn History, My Certificate, Settings,
          Wishlist, Orders and Support Tickets. */}
      {selectedMember && memberDraft && (() => {
        const memberOrders = (orders || []).filter(o =>
          String(o.email || "").toLowerCase() === selectedMember.email.toLowerCase() ||
          String(o.customer || "").toLowerCase() === selectedMember.name.toLowerCase()
        );
        const memberTickets = (supportTickets || []).filter(t =>
          String(t.email || "").toLowerCase() === selectedMember.email.toLowerCase()
        );
        const wishlistNames = selectedMember.wishlist
          .map(id => (products || []).find(p => p.id === id))
          .filter(Boolean);
        const issuableCourses = (certCourses || [])
          .filter(c => !selectedMember.certificates.some(cert => cert.course === c.title))
          .map(c => ({ value: c.title, label: c.title }));
        const sectionCard = { background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" };
        const sectionHeading = (n, label) => (
          <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>{n}</span> {label}
          </h4>
        );
        return (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={handleCloseMember}>
          <div className="custom-scrollbar inner-blur-glass" style={{ maxWidth: "820px", width: "100%", maxHeight: "86vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseMember} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--eco-c15)", boxShadow: "0 10px 22px rgba(15,23,42,0.08)" }}><X size={15} /></button>

            <div style={{ textAlign: "center", marginBottom: "14px", padding: "0 36px" }}>
              <h1 style={{ margin: "0 0 3px", fontSize: "23px", fontWeight: 800, color: "#111827" }}>Manage Member</h1>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>Everything here is what this member sees on their profile dashboard.</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", padding: "10px 12px", borderRadius: "18px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 10px 22px rgba(var(--eco-c7-rgb), 0.16)", flexShrink: 0 }}>
                {(selectedMember.name || "?").charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: "0 0 1px", fontSize: "18px", fontWeight: 800, color: "var(--eco-c19)", letterSpacing: "-0.2px" }}>{selectedMember.name}</h2>
                <div style={{ fontSize: "12px", color: "rgba(var(--eco-c19-rgb), 0.58)", fontWeight: 700 }}>{selectedMember.email} · {selectedMember.id}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px", width: "100%", alignItems: "start", marginBottom: "14px" }}>

              {/* 1 — Profile Settings */}
              <div style={sectionCard}>
                {sectionHeading(1, "Profile Settings")}
                <label style={ecoFieldLabel}>Full Name
                  <input value={memberDraft.name} onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })} style={ecoFieldInput} />
                </label>
                <label style={{ ...ecoFieldLabel, marginTop: "8px", display: "block" }}>Phone Number
                  <input value={memberDraft.phone} onChange={(e) => setMemberDraft({ ...memberDraft, phone: e.target.value })} placeholder="0917 000 0000" style={ecoFieldInput} />
                </label>
                <label style={{ ...ecoFieldLabel, marginTop: "8px", display: "block" }}>Delivery Address
                  <textarea value={memberDraft.address} onChange={(e) => setMemberDraft({ ...memberDraft, address: e.target.value })} placeholder="Street, barangay, city" style={{ ...ecoFieldInput, height: "62px", resize: "none", fontFamily: "inherit" }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                  <div>
                    <label style={ecoFieldLabel}>Account Type</label>
                    <div style={{ marginTop: "4px" }}>
                      <AdminEcoDropdown value={memberDraft.role} options={[{ value: "Customer", label: "Customer" }, { value: "Farmer", label: "Farmer" }, { value: "B2B Buyer", label: "B2B Buyer" }, { value: "Specialist", label: "Specialist" }]} onChange={(value) => setMemberDraft({ ...memberDraft, role: value })} compact />
                    </div>
                  </div>
                  <div>
                    <label style={ecoFieldLabel}>Account Status</label>
                    <div style={{ marginTop: "4px" }}>
                      <AdminEcoDropdown value={memberDraft.status} options={[{ value: "Online", label: "Online" }, { value: "Offline", label: "Offline" }, { value: "Suspended", label: "Suspended" }]} onChange={(value) => setMemberDraft({ ...memberDraft, status: value })} compact />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 — EcoPoints & Earn History */}
              <div style={sectionCard}>
                {sectionHeading(2, "EcoPoints & Earn History")}
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "26px", fontWeight: 850, color: "var(--eco-c13)", lineHeight: 1 }}>{Number(selectedMember.ecoPoints || 0).toLocaleString()}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>points on this account</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "8px" }}>
                  <label style={ecoFieldLabel}>Adjust by
                    <input type="number" value={pointsAdjust.amount} onChange={(e) => setPointsAdjust({ ...pointsAdjust, amount: e.target.value })} placeholder="250" style={ecoFieldInput} />
                  </label>
                  <label style={ecoFieldLabel}>Reason (shown to the member)
                    <input value={pointsAdjust.reason} onChange={(e) => setPointsAdjust({ ...pointsAdjust, reason: e.target.value })} placeholder="Workshop attendance bonus" style={ecoFieldInput} />
                  </label>
                </div>
                <button onClick={handleAdjustMemberPoints} style={{ marginTop: "8px", width: "100%", padding: "9px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", color: "var(--eco-c13)", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}>
                  Apply to balance &amp; log in Earn History
                </button>
                <p style={{ margin: "6px 0 8px", fontSize: "11px", color: "rgba(0,0,0,0.5)" }}>Use a negative number to correct an over-award.</p>
                <div style={{ maxHeight: "132px", overflowY: "auto" }} className="custom-scrollbar">
                  {selectedMember.earnHistory.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}>No points earned yet.</div>
                  ) : selectedMember.earnHistory.slice(0, 8).map((entry, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--eco-c19)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.action}</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)" }}>{entry.date}</div>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: Number(entry.points || 0) < 0 ? "var(--eco-c13)" : "var(--eco-c13)", flexShrink: 0 }}>
                        {Number(entry.points || 0) < 0 ? "" : "+"}{Number(entry.points || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 — My Certificate */}
              <div style={sectionCard}>
                {sectionHeading(3, "My Certificate")}
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={ecoFieldLabel}>Issue from the course catalog</label>
                    <div style={{ marginTop: "4px" }}>
                      <AdminEcoDropdown value={certToIssue} options={issuableCourses} onChange={setCertToIssue} placeholder={issuableCourses.length ? "Select a course" : "All courses issued"} compact />
                    </div>
                  </div>
                  <button onClick={handleIssueCertificate} disabled={!certToIssue} style={{ padding: "9px 14px", borderRadius: "10px", background: certToIssue ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(0,0,0,0.04)", border: `1px solid ${certToIssue ? "rgba(var(--eco-c9-rgb), 0.2)" : "rgba(0,0,0,0.06)"}`, color: certToIssue ? "var(--eco-c13)" : "rgba(0,0,0,0.35)", fontWeight: 800, fontSize: "12px", cursor: certToIssue ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>Issue</button>
                </div>
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedMember.certificates.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}>No certificates issued by hand. Courses they finish at 100% still appear on their dashboard.</div>
                  ) : selectedMember.certificates.map(cert => (
                    <div key={cert.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "8px 10px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.06)", border: "1px solid rgba(var(--eco-c9-rgb), 0.14)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--eco-c19)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cert.course}</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)" }}>{cert.id} · {cert.date}</div>
                      </div>
                      <button onClick={() => handleRevokeCertificate(cert.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontWeight: 800, fontSize: "11px", flexShrink: 0 }}>Revoke</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 — Settings */}
              <div style={sectionCard}>
                {sectionHeading(4, "Settings")}
                <p style={{ margin: "0 0 10px", fontSize: "11px", color: "rgba(0,0,0,0.5)" }}>Channels this member agreed to be contacted on.</p>
                {[
                  { key: "email", label: "Email Notifications" },
                  { key: "sms", label: "SMS Updates" },
                ].map(row => (
                  <label key={row.key} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", fontSize: "13px", fontWeight: 700, color: "var(--eco-c19)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(memberDraft.notifications[row.key])}
                      onChange={() => setMemberDraft({ ...memberDraft, notifications: { ...memberDraft.notifications, [row.key]: !memberDraft.notifications[row.key] } })}
                      style={{ width: "17px", height: "17px", accentColor: "var(--eco-c9)", cursor: "pointer" }}
                    />
                    {row.label}
                  </label>
                ))}
                <div style={{ marginTop: "8px", padding: "8px 10px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", fontSize: "11px", color: "rgba(0,0,0,0.55)", fontWeight: 600 }}>
                  Last seen: {selectedMember.lastLogin}
                </div>
              </div>

              {/* 5 — Activity the member sees on their own dashboard */}
              <div style={{ ...sectionCard, gridColumn: "1 / -1" }}>
                {sectionHeading(5, "Their Dashboard at a Glance")}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                  {[
                    { label: "Order History", value: memberOrders.length, hint: memberOrders.length ? `latest ${memberOrders[0].status}` : "no orders yet" },
                    { label: "Support Tickets", value: memberTickets.length, hint: `${memberTickets.filter(t => t.status === "Open").length} open` },
                    { label: "Wishlist", value: wishlistNames.length, hint: wishlistNames.length ? wishlistNames[0].name : "empty" },
                    { label: "Certificates", value: selectedMember.certificates.length, hint: "hand-issued" },
                  ].map(tile => (
                    <div key={tile.label} style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{tile.label}</div>
                      <div style={{ fontSize: "22px", fontWeight: 850, color: "var(--eco-c19)", lineHeight: 1.2 }}>{tile.value}</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tile.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCloseMember} style={{ flex: 1, padding: "12px", borderRadius: "14px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "var(--eco-c19)", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>Close</button>
              <button onClick={handleSaveMember} style={{ flex: 2, padding: "12px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "var(--eco-c19)", fontWeight: 800, fontSize: "13px", cursor: "pointer", boxShadow: "0 14px 30px rgba(var(--eco-c7-rgb), 0.24)" }}>
                <Save size={14} style={{ verticalAlign: "-2px", marginRight: "6px" }} /> Save to their dashboard
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {selectedSubscriber && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={handleCloseSubscriber}>
          <div className="custom-scrollbar inner-blur-glass" style={{ maxWidth: "740px", width: "100%", maxHeight: "82vh", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative", animation: "scaleUp 0.3s ease", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseSubscriber} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--eco-c15)", boxShadow: "0 10px 22px rgba(15,23,42,0.08)" }}><X size={15} /></button>
            
            <div style={{ textAlign: "center", marginBottom: "14px", padding: "0 36px" }}>
              <h1 style={{ margin: "0 0 3px", fontSize: "23px", fontWeight: 800, color: "#111827" }}>
                Manage Subscription
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>Update plan details, usage, billing, and subscriber messaging.</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", padding: "10px 12px", borderRadius: "18px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 10px 22px rgba(var(--eco-c7-rgb), 0.16)", flexShrink: 0 }}>
                {selectedSubscriber.user.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: "0 0 1px", fontSize: "18px", fontWeight: 800, color: "var(--eco-c19)", letterSpacing: "-0.2px" }}>{selectedSubscriber.user}</h2>
                <div style={{ fontSize: "12px", color: "rgba(var(--eco-c19-rgb), 0.58)", fontWeight: 700 }}>{selectedSubscriber.email}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", width: "100%", alignItems: "stretch", marginBottom: "14px" }}>
               <div style={{ background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>1</span> Subscription Info</h4>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Plan:</span> <span style={{ fontSize: "13px", fontWeight: 800, color: selectedSubscriber.plan === "Pro" ? "var(--eco-c13)" : selectedSubscriber.plan === "Enterprise" ? "var(--eco-c13)" : "#64748b" }}>{selectedSubscriber.plan}</span></div>
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
                     <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>2</span> AI Usage</h4>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                       <span>Plant Scans</span>
                       <span style={{ color: isAtLimit ? "var(--eco-c13)" : isNearLimit ? "var(--eco-c13)" : "var(--eco-c13)" }}>{selectedSubscriber.aiScans} / {selectedSubscriber.aiLimit}</span>
                     </div>
                     <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                       <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: isAtLimit ? "var(--eco-c9)" : isNearLimit ? "var(--eco-c7)" : "linear-gradient(90deg, var(--eco-c9), var(--eco-c6))", borderRadius: "999px", animation: isNearLimit ? "warningPulse 1.5s infinite" : "none" }} />
                     </div>
                     {isNearLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> Only {selectedSubscriber.aiLimit - selectedSubscriber.aiScans} scans remaining this month</p>
                     )}
                     {isAtLimit && (
                       <p style={{ margin: "8px 0 0", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 700 }}><AlertCircle size={10} style={{ verticalAlign: "middle" }}/> Limit reached. Upgrade to unlock unlimited diagnostics.</p>
                     )}
                   </div>
                 );
               })()}
               
               <div style={{ background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>3</span> Manage Plan</h4>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Plan</label>
                     <AdminEcoDropdown value={editableSubscriber?.plan || selectedSubscriber.plan} options={subscriptionPlanOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), plan: value, aiLimit: value === "Basic" ? 10 : value === "Pro" ? 100 : 5000 })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Status</label>
                     <AdminEcoDropdown value={editableSubscriber?.status || selectedSubscriber.status} options={subscriptionStatusOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), status: value })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Payment Method</label>
                     <AdminEcoDropdown value={editableSubscriber?.payment || selectedSubscriber.payment} options={subscriptionPaymentOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), payment: value })} />
                   </div>
                   <div>
                     <label style={{ fontSize: "11px", fontWeight: 800, color: "rgba(var(--eco-c19-rgb), 0.62)", display: "block", marginBottom: "6px" }}>Renewal Date</label>
                     <AdminEcoDropdown value={editableSubscriber?.renewal || selectedSubscriber.renewal} options={subscriptionRenewalOptions} onChange={value => setEditableSubscriber({ ...(editableSubscriber || selectedSubscriber), renewal: value })} />
                   </div>
                 </div>
               </div>

               <div style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "12px", boxShadow: "0 8px 22px rgba(0,0,0,0.06)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>4</span> Notifications</h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "142px", overflowY: "auto", paddingRight: "2px" }} className="custom-scrollbar">
                   <div style={{ padding: "7px 9px", background: "rgba(var(--eco-c9-rgb), 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 600 }}><CheckCircle size={13} /> Subscription renewed successfully</div>
                   <div style={{ padding: "7px 9px", background: "rgba(var(--eco-c7-rgb), 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 600 }}><AlertCircle size={13} /> AI Scan limit almost reached</div>
                   <div style={{ padding: "7px 9px", background: "rgba(var(--eco-c7-rgb), 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 600 }}><CalendarDays size={13} /> New eco workshop available</div>
                   <div style={{ padding: "7px 9px", background: "rgba(var(--eco-c7-rgb), 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 600 }}><Tag size={13} /> Promo: 20% off yearly plan</div>
                   <div style={{ padding: "7px 9px", background: "rgba(var(--eco-c9-rgb), 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--eco-c13)", fontWeight: 600 }}><span style={{fontSize: "13px"}}><PartyPopper size={13} color="var(--eco-c9)" /></span> You earned 120 EcoPoints this month</div>
                 </div>
               </div>
               <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.66)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", padding: "14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.03)" }}>
                 <h4 style={{ margin: "0 0 9px", fontSize: "14px", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>5</span> Alert & Campaign</h4>
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
              <button onClick={() => setToastMessage(`Billing portal opened for ${selectedSubscriber?.user || "subscriber"}`)} style={{ minWidth: 0, padding: "8px 9px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.18)", fontWeight: 800, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", boxShadow: "0 10px 22px rgba(var(--eco-c9-rgb), 0.08)", whiteSpace: "nowrap" }}><CreditCard size={13} style={{ flexShrink: 0 }}/> Manage Billing</button>
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
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              {isEditingEvent ? (
                <AdminEcoDropdown value={editableEvent.type} options={[{ value: "Workshop", label: "Workshop" }, { value: "Webinar", label: "Webinar" }, { value: "Community", label: "Community" }]} onChange={value => setEditableEvent({...editableEvent, type: value})} />
              ) : (
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: selectedEvent.type === "Workshop" ? "rgba(var(--eco-c7-rgb), 0.1)" : selectedEvent.type === "Webinar" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: selectedEvent.type === "Workshop" ? "var(--eco-c13)" : selectedEvent.type === "Webinar" ? "var(--eco-c13)" : "var(--eco-c13)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{selectedEvent.type}</span>
              )}
              {isEditingEvent ? (
                <AdminEcoDropdown value={editableEvent.status} options={[{ value: "Upcoming", label: "Upcoming" }, { value: "Ongoing", label: "Ongoing" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }]} onChange={value => setEditableEvent({...editableEvent, status: value})} />
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
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><CalendarDays size={14} color="var(--eco-c11)" /> {isEditingEvent ? <input type="text" value={editableEvent.date} onChange={e => setEditableEvent({...editableEvent, date: e.target.value})} style={styles.editInput} placeholder="Date (e.g. Jun 15, 2026)" /> : selectedEvent.date}</div>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}><Clock size={14} color="var(--eco-c11)" /> {isEditingEvent ? <input type="text" value={editableEvent.time} onChange={e => setEditableEvent({...editableEvent, time: e.target.value})} style={styles.editInput} placeholder="Time (e.g. 09:00 AM)" /> : selectedEvent.time}</div>
                 <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}><MapPin size={14} color="var(--eco-c11)" style={{ flexShrink: 0, marginTop: "2px" }} /> {isEditingEvent ? <input type="text" value={editableEvent.location} onChange={e => setEditableEvent({...editableEvent, location: e.target.value})} style={styles.editInput} placeholder="Location" /> : selectedEvent.location}</div>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "13px", fontWeight: 600 }}><UserCheck size={14} color="var(--eco-c11)" /> {isEditingEvent ? <input type="text" value={editableEvent.speaker || ""} onChange={e => setEditableEvent({...editableEvent, speaker: e.target.value})} style={styles.editInput} placeholder="Speaker name" /> : (selectedEvent.speaker || "EcoEquity Team")}</div>
               </div>
               <div style={{ background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                 <h4 style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Event Info</h4>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", alignItems: "center" }}><span style={{ fontWeight: 600 }}>Price:</span> {isEditingEvent ? <input type="text" value={editableEvent.price} onChange={e => setEditableEvent({...editableEvent, price: e.target.value})} style={{...styles.editInput, width: "80px"}} /> : <span style={{ fontWeight: 800, color: "var(--eco-c13)" }}>{selectedEvent.price}</span>}</div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: 600, alignItems: "center" }}><span>Attendees:</span> {isEditingEvent ? (<div style={{display: "flex", gap: "4px", alignItems: "center"}}><input type="number" value={editableEvent.attendees} onChange={e => setEditableEvent({...editableEvent, attendees: parseInt(e.target.value) || 0})} style={{...styles.editInput, width: "50px", padding: "4px"}} /> / <input type="number" value={editableEvent.maxAttendees} onChange={e => setEditableEvent({...editableEvent, maxAttendees: parseInt(e.target.value) || 0})} style={{...styles.editInput, width: "50px", padding: "4px"}} /></div>) : (<span>{selectedEvent.attendees} / {selectedEvent.maxAttendees}</span>)}</div>
                 {!isEditingEvent && (
                   <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", marginTop: "4px" }}>
                     <div style={{ width: `${Math.min((selectedEvent.attendees / selectedEvent.maxAttendees) * 100, 100)}%`, height: "100%", background: selectedEvent.attendees >= selectedEvent.maxAttendees ? "var(--eco-c7)" : "linear-gradient(90deg, var(--eco-c9), var(--eco-c6))", borderRadius: "999px" }} />
                   </div>
                 )}
               </div>
            </div>

            {/* Speaker photo + description flow to the website event cards */}
            {isEditingEvent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <input type="text" value={editableEvent.speakerImage || ""} onChange={e => setEditableEvent({...editableEvent, speakerImage: e.target.value})} style={styles.editInput} placeholder="Speaker photo URL (leave blank for placeholder)" />
                <textarea value={editableEvent.description || ""} onChange={e => setEditableEvent({...editableEvent, description: e.target.value})} style={{ ...styles.editInput, height: "70px", resize: "none", fontFamily: "inherit" }} placeholder="Short description — shown on the website event card…" />
                <textarea value={editableEvent.fullDescription || ""} onChange={e => setEditableEvent({...editableEvent, fullDescription: e.target.value})} style={{ ...styles.editInput, height: "90px", resize: "none", fontFamily: "inherit" }} placeholder="Full description — shown when a visitor opens the event (falls back to the short one)…" />
              </div>
            ) : (
              selectedEvent.description ? (
                <p style={{ margin: "0 0 20px", fontSize: "13px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5, background: "rgba(255,255,255,0.6)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>{selectedEvent.description}</p>
              ) : null
            )}

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {isEditingEvent ? (
                <>
                  <button onClick={handleSaveEvent} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}><Save size={16}/> Save Changes</button>
                  <button onClick={() => { setIsEditingEvent(false); if (editableEvent.isNew) setSelectedEvent(null); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><XCircle size={16}/> Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setToastMessage(`Attendee list opened for "${selectedEvent?.title || selectedEvent?.name || "event"}"`)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Users size={16}/> View Attendees</button>
                  <button onClick={() => { setIsEditingEvent(true); setEditableEvent({ ...selectedEvent }); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Edit2 size={16}/> Edit Event</button>
                  <button onClick={() => setEventToDelete(selectedEvent.id)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.16)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Trash2 size={16}/> Delete</button>
                </>
              )}
            </div>

            <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", color: "#000", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Close Details</button>
          </div>
        </div>
      )}
      {selectedScan && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setSelectedScan(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px", borderRadius: "24px", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", width: "90%", maxWidth: "550px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedScan(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: "0", fontSize: "22px", fontWeight: 800 }}>AI Scan: {selectedScan.id}</h2>
              <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getScanStatusStyle(selectedScan.status) }}>{selectedScan.status}</span>
            </div>

            {/* Image Preview & Holographic Scan Line.
                `image` is the photo the member uploaded, downscaled by the AI
                Plant Doctor before it was attached to the scan. Seed rows and
                any scan recorded before photo sync existed have none, so the
                leaf placeholder stays for those. */}
            <div style={{ position: "relative", height: "260px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.05))", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "inset 0 4px 20px rgba(0,0,0,0.05)" }}>
              {selectedScan.image ? (
                <img
                  src={selectedScan.image}
                  alt={`Uploaded photo for scan ${selectedScan.id} — ${selectedScan.plant}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain", background: "rgba(0,0,0,0.03)" }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}>
                  <Leaf size={28} color="var(--eco-c9)" />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>No photo attached</span>
                </div>
              )}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "rgba(var(--eco-c6-rgb), 0.8)", boxShadow: "0 0 15px 2px var(--eco-c6)", animation: "scanLine 2.5s ease-in-out infinite" }} />
            </div>

            {/* Confidence Meter & Details */}
            <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", marginBottom: "20px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                 <span style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}><Stethoscope size={14} color="var(--eco-c11)" /> Detected: {selectedScan.disease}</span>
                 <span style={{ fontSize: "13px", fontWeight: 800, color: parseInt(selectedScan.confidence) > 90 ? "var(--eco-c13)" : "var(--eco-c13)" }}>{selectedScan.confidence} Confidence</span>
               </div>
               <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", marginBottom: "16px" }}>
                 <div style={{ width: selectedScan.confidence, height: "100%", background: parseInt(selectedScan.confidence) > 90 ? "linear-gradient(90deg, var(--eco-c9), var(--eco-c6))" : "linear-gradient(90deg, var(--eco-c7), var(--eco-c6))", borderRadius: "999px", boxShadow: `0 0 10px ${parseInt(selectedScan.confidence) > 90 ? "rgba(var(--eco-c6-rgb), 0.5)" : "rgba(var(--eco-c6-rgb), 0.5)"}` }} />
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", fontSize: "13px" }}>
                 <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600, fontSize: "11px" }}>PLANT</span> <span style={{ fontWeight: 700 }}>{selectedScan.plant}</span></div>
                 <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600, fontSize: "11px" }}>SCANNED BY</span> <span style={{ fontWeight: 700 }}>{selectedScan.user}</span></div>
               </div>
               
               <h4 style={{ margin: "0 0 6px", fontSize: "11px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>AI Recommendation</h4>
               <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(0,0,0,0.8)", background: "rgba(var(--eco-c7-rgb), 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(var(--eco-c7-rgb), 0.1)" }}>{selectedScan.recommendation}</p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {/* The photo is a base64 data URL — it would land in the CSV as
                  one unreadable 50KB cell, so the report records whether there
                  was one, the same way the course export does. */}
              <button onClick={() => downloadCSV(`scan-report-${selectedScan.id}.csv`, [{ ...selectedScan, image: selectedScan.image ? "Yes" : "No" }])} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Download size={16}/> Download Report</button>
              <button onClick={() => setToastMessage(`Expert consultation requested for scan ${selectedScan.id}`)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}><MessageSquare size={16}/> Consult Expert</button>
            </div>
          </div>
        </div>
      )}
      {/* Content editor — Published items appear in the client's Updates tab */}
      {editingContent && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setEditingContent(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "30px", borderRadius: "26px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 24px 70px rgba(15,23,42,0.2)", width: "min(720px, 100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditingContent(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>

            <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 850, color: "#000", paddingRight: "36px" }}>Edit Content</h2>
            <p style={{ margin: "0 0 22px", fontSize: "13px", color: "rgba(0,0,0,0.55)" }}>
              Set the status to <strong>Published</strong> and clients will see this in the Updates tab of their dashboard.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)" }}>
                TITLE
                <input value={editingContent.title} onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })} style={ecoGlassInputStyle} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)" }}>
                  TYPE
                  <AdminEcoDropdown
                    value={editingContent.type}
                    options={[{ value: "Article", label: "Article" }, { value: "Page", label: "Page" }, { value: "Announcement", label: "Announcement" }, { value: "Tutorial", label: "Tutorial" }, { value: "Component", label: "Component" }]}
                    onChange={(value) => setEditingContent({ ...editingContent, type: value })}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)" }}>
                  STATUS
                  <AdminEcoDropdown
                    value={editingContent.status}
                    options={[{ value: "Published", label: "Published" }, { value: "Draft", label: "Draft" }, { value: "Scheduled", label: "Scheduled" }]}
                    onChange={(value) => setEditingContent({ ...editingContent, status: value })}
                  />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)" }}>
                BODY
                <textarea
                  value={editingContent.body || ""}
                  onChange={(e) => setEditingContent({ ...editingContent, body: e.target.value })}
                  rows={8}
                  placeholder="Write what clients will read…"
                  style={{ ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)" }}>
                AUTHOR
                <input value={editingContent.author || ""} onChange={(e) => setEditingContent({ ...editingContent, author: e.target.value })} style={ecoGlassInputStyle} />
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                <button onClick={handleSaveContent} style={{ ...ecoPrimaryButtonStyle, flex: 1 }}>
                  <span style={ecoPrimaryInnerStyle}>Save Content</span>
                </button>
                <button onClick={() => setEditingContent(null)} style={{ flex: 1, padding: "12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSupportTicket && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setSelectedSupportTicket(null)}>
          <div style={{ background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "30px", borderRadius: "26px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "0 24px 70px rgba(15,23,42,0.2)", width: "min(820px, 100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedSupportTicket(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "22px", paddingRight: "36px" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>{selectedSupportTicket.id}</span>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", background: selectedSupportTicket.priority === "Urgent" || selectedSupportTicket.priority === "High" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: selectedSupportTicket.priority === "Urgent" || selectedSupportTicket.priority === "High" ? "var(--eco-c13)" : "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>{selectedSupportTicket.priority || "Normal"}</span>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", ...getStatusStyle(selectedSupportTicket.status), fontSize: "11px", fontWeight: 800 }}>{selectedSupportTicket.status}</span>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 850, color: "#000", lineHeight: 1.2 }}>{selectedSupportTicket.subject}</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(0,0,0,0.58)", fontWeight: 600 }}>{selectedSupportTicket.name} • {selectedSupportTicket.email} • {selectedSupportTicket.createdAt}</p>
              </div>
              <div style={{ width: "180px", flexShrink: 0 }}>
                <AdminEcoDropdown
                  value={selectedSupportTicket.status}
                  options={supportStatusOptions.filter(option => option.value !== "All")}
                  onChange={(value) => handleUpdateSupportTicket(selectedSupportTicket.id, { status: value })}
                  compact
                  align="right"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "18px", marginBottom: "18px" }}>
              <div style={{ ...ecoGlassPanelStyle, borderRadius: "18px", padding: "18px" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 850, color: "var(--eco-c15)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Customer Description</h3>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: "rgba(0,0,0,0.72)" }}>{selectedSupportTicket.description}</p>
              </div>
              <div style={{ ...ecoGlassPanelStyle, borderRadius: "18px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 850, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "6px" }}>Category</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#000" }}>{selectedSupportTicket.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 850, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "6px" }}>Attachment</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(0,0,0,0.68)" }}>{selectedSupportTicket.attachmentName || "No attachment"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 850, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "6px" }}>Assignee</div>
                  <AdminEcoDropdown
                    value={selectedSupportTicket.assignee || "Unassigned"}
                    options={supportAssigneeOptions}
                    onChange={(value) => handleUpdateSupportTicket(selectedSupportTicket.id, { assignee: value })}
                    compact
                  />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 850, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "6px" }}>Priority</div>
                  <AdminEcoDropdown
                    value={selectedSupportTicket.priority || "Normal"}
                    options={supportPriorityOptions}
                    onChange={(value) => handleUpdateSupportTicket(selectedSupportTicket.id, { priority: value })}
                    compact
                  />
                </div>
              </div>
            </div>

            <div style={{ ...ecoGlassPanelStyle, borderRadius: "18px", padding: "18px", marginBottom: "18px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 850, color: "var(--eco-c15)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Admin Replies</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                {(selectedSupportTicket.replies || []).length > 0 ? (
                  selectedSupportTicket.replies.map((reply, idx) => (
                    <div key={`${reply.time}-${idx}`} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 850, color: "var(--eco-c13)" }}>{reply.sender}</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>{reply.time}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.72)", lineHeight: 1.45 }}>{reply.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)", padding: "12px", borderRadius: "14px", border: "1px dashed rgba(0,0,0,0.12)" }}>No admin replies yet.</div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <textarea
                  value={supportReplyText}
                  onChange={(e) => setSupportReplyText(e.target.value)}
                  placeholder="Write an internal/admin reply for this ticket..."
                  rows={3}
                  style={{ ...ecoGlassInputStyle, flex: 1, resize: "vertical", fontFamily: "inherit", lineHeight: 1.4 }}
                />
                <button onClick={handleSendSupportReply} style={{ ...ecoPrimaryButtonStyle, padding: "12px 16px", borderRadius: "14px", fontSize: "13px", fontWeight: 850, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                  <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}><Send size={15} /> Reply</span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => handleUpdateSupportTicket(selectedSupportTicket.id, { status: "In Review", assignee: selectedSupportTicket.assignee || "Admin Support" })} style={{ padding: "11px 16px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontWeight: 850, fontSize: "13px", cursor: "pointer" }}>Mark In Review</button>
              <button onClick={() => handleUpdateSupportTicket(selectedSupportTicket.id, { status: "Resolved" })} style={{ padding: "11px 16px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.12)", color: "var(--eco-c13)", fontWeight: 850, fontSize: "13px", cursor: "pointer" }}>Resolve Ticket</button>
            </div>
          </div>
        </div>
      )}
      {/* -----------------------------------------------------------------
          Live chat transcript.

          Separate from the ticket modal above rather than a mode inside it.
          That one edits a record — status, priority, assignee, a reply that is
          really an email. This is a conversation happening now: it subscribes,
          it scrolls, and its only two actions are "say something" and "we're
          done". Folding them together would mean a modal where half the
          controls are inert depending on which kind of ticket you opened.
          ----------------------------------------------------------------- */}
      {selectedLiveChat && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setSelectedLiveChat(null)}>
          {/* A real panel surface, not a bare `.inner-blur-glass` box. That
              class only paints a blur — with the scrim already blurring the
              page behind it, the chat had no edge of its own and read as text
              floating over the console. It also promotes every direct child to
              `position: relative; z-index: 1`, which let the header block cover
              the absolutely-positioned close button and swallow its clicks. */}
          <div style={modalPanel({ width: "min(620px, 94vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", padding: "26px" })} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedLiveChat(null)} aria-label="Close chat" style={{ ...MODAL_CLOSE_BTN, top: "14px", right: "14px" }}><X size={16} /></button>

            <div style={{ marginBottom: "16px", paddingRight: "52px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>{selectedLiveChat.ref}</span>
                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 850, background: liveStatusChip(selectedLiveChat.liveStatus).tint, color: liveStatusChip(selectedLiveChat.liveStatus).ink }}>
                  {liveStatusChip(selectedLiveChat.liveStatus).label}
                </span>
                {selectedLiveChat.agentName && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>
                    <UserCheck size={12} /> {selectedLiveChat.agentName}
                  </span>
                )}
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: "21px", fontWeight: 850, color: "#000", lineHeight: 1.2 }}>{selectedLiveChat.memberName}</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600 }}>
                {selectedLiveChat.memberEmail}
                {selectedLiveChat.previousAgentName && selectedLiveChat.previousAgentName !== selectedLiveChat.agentName
                  ? ` • previously with ${selectedLiveChat.previousAgentName}`
                  : ""}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", padding: "16px", borderRadius: "18px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)", minHeight: "180px" }}>
              {liveMessages.length === 0 ? (
                <div style={{ margin: "auto", fontSize: "13px", fontWeight: 700, color: "rgba(0,0,0,0.42)" }}>No messages yet.</div>
              ) : liveMessages.map(message => {
                const fromAgent = message.sender === "agent";
                return (
                  <div key={message.id} style={{ alignSelf: fromAgent ? "flex-end" : "flex-start", maxWidth: "82%" }}>
                    <div style={{ padding: "10px 13px", borderRadius: fromAgent ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: fromAgent ? "rgba(var(--eco-c9-rgb), 0.14)" : "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "13px", lineHeight: 1.45, color: "rgba(0,0,0,0.78)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {message.text}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.38)", marginTop: "3px", textAlign: fromAgent ? "right" : "left" }}>
                      {fromAgent ? "Agent" : selectedLiveChat.memberName} • {liveWaitLabel(message.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "14px" }}>
              <textarea
                value={liveReplyText}
                onChange={(e) => setLiveReplyText(e.target.value)}
                // Enter sends, Shift+Enter breaks the line — the shape every
                // chat box has. The ticket modal's textarea is a different
                // thing: that one is composing an email, where Enter is a
                // paragraph, not a send.
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendLiveReply(); }
                }}
                placeholder={selectedLiveChat.agentId ? "Reply to the member..." : "Assign an agent first, or reply as admin..."}
                rows={2}
                style={{ ...ecoGlassInputStyle, flex: 1, resize: "vertical", fontFamily: "inherit", lineHeight: 1.4 }}
              />
              <button onClick={handleSendLiveReply} disabled={liveSending || !liveReplyText.trim()} style={{ ...ecoPrimaryButtonStyle, padding: "12px 16px", borderRadius: "14px", fontSize: "13px", fontWeight: 850, cursor: liveSending || !liveReplyText.trim() ? "not-allowed" : "pointer", opacity: liveSending || !liveReplyText.trim() ? 0.55 : 1, display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}><Send size={15} /> Send</span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <button onClick={handleResolveLiveChat} style={{ padding: "10px 16px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.12)", color: "var(--eco-c13)", fontWeight: 850, fontSize: "13px", cursor: "pointer" }}>Resolve Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* Scrim behind the mobile nav drawer — tapping it closes the drawer. */}
      {isMobile && navDrawerOpen && (
        <div
          onClick={() => setNavDrawerOpen(false)}
          aria-hidden="true"
          style={styles.navScrim}
        />
      )}

      {/* Sidebar */}
      <aside
        className="inner-blur-glass"
        aria-label="Admin sections"
        style={{
          ...styles.sidebar,
          width: `${railWidth}px`,
          // On phones the sidebar leaves the flow and slides in from the edge.
          // It runs the full height: the console is full-screen and hides the
          // site's floating tab bar, so there is nothing at the foot to clear.
          ...(isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                height: "100%",
                margin: 0,
                borderRadius: "0 24px 24px 0",
                transform: navDrawerOpen ? "translateX(0)" : "translateX(-104%)",
                transition: "transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 1200,
              }
            : null),
        }}
      >
        <div style={{ ...styles.sidebarHeader, justifyContent: railCollapsed ? "center" : "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", minWidth: 0 }}>
            <div style={styles.logoBadge}>
              <ShieldCheck size={16} color={AD.green} />
            </div>
            {!railCollapsed && (
              <div style={{ minWidth: 0 }}>
                <h2 style={styles.sidebarTitle}>Admin Portal</h2>
                <span style={styles.sidebarSubtitle}>EcoEquity</span>
              </div>
            )}
          </div>
          {!railCollapsed && (
            <button
              onClick={() => (isMobile ? setNavDrawerOpen(false) : setSidebarCollapsed(true))}
              title={isMobile ? "Close menu" : "Collapse sidebar"}
              aria-label={isMobile ? "Close menu" : "Collapse sidebar"}
              style={styles.collapseBtn}
            >
              {isMobile ? <X size={16} /> : <ChevronsLeft size={16} />}
            </button>
          )}
        </div>

        {railCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            style={{ ...styles.collapseBtn, alignSelf: "center", marginTop: "14px" }}
          >
            <ChevronsRight size={16} />
          </button>
        )}

        {/* Type-to-jump. Twenty-three sections is more than you can scan. */}
        {!railCollapsed && (
          <div style={styles.navSearchWrap}>
            <Search size={13} style={{ color: AD.inkFaint, flexShrink: 0 }} />
            <input
              type="text"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setNavQuery("");
                // Enter opens the first match, so filter-then-Enter is one gesture.
                if (e.key === "Enter" && visibleSidebarGroups[0]) goToTab(visibleSidebarGroups[0].items[0].name);
              }}
              placeholder="Jump to section..."
              aria-label="Filter sections"
              style={styles.navSearchInput}
            />
            {navQuery && (
              <button
                onClick={() => setNavQuery("")}
                title="Clear"
                aria-label="Clear section filter"
                style={styles.navSearchClear}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        <nav className="custom-scrollbar" style={styles.sidebarNav}>
          {visibleSidebarGroups.map((group) => (
            <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "10px" }}>
              {!railCollapsed ? (
                <div style={styles.navGroupLabel}>{group.label}</div>
              ) : (
                <div style={styles.navGroupDivider} />
              )}
              {group.items.map((item) => {
                const isActive = activeTab === item.name;
                const isHovered = hoveredNav === item.name;
                const badge = navBadgeCounts[item.name] > 0 ? navBadgeCounts[item.name] : null;
                return (
                  <button
                    key={item.name}
                    onClick={() => goToTab(item.name)}
                    onMouseEnter={() => setHoveredNav(item.name)}
                    onMouseLeave={() => setHoveredNav(null)}
                    title={railCollapsed ? item.name : undefined}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      ...styles.navItem,
                      justifyContent: railCollapsed ? "center" : "flex-start",
                      padding: railCollapsed ? "11px 0" : "9px 12px",
                      ...(isActive ? styles.navItemActive : (isHovered ? styles.navItemHover : {})),
                    }}
                  >
                    {isActive && <span style={railCollapsed ? styles.navActiveBarCollapsed : styles.navActiveBar} />}
                    <item.icon size={16} strokeWidth={isActive ? 2.4 : 2} style={{ flexShrink: 0 }} />
                    {!railCollapsed && (
                      <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </span>
                    )}
                    {badge != null && (
                      <span
                        style={railCollapsed ? styles.navBadgeDot : styles.navBadge}
                        title={railCollapsed ? `${badge} awaiting action` : undefined}
                      >
                        {railCollapsed ? "" : badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {navQueryText && visibleSidebarGroups.length === 0 && (
            <p style={styles.navNoMatch}>No section matches “{navQuery}”.</p>
          )}
        </nav>

        <div style={{ ...styles.sidebarFooter, padding: railCollapsed ? "14px 12px" : "14px 16px" }}>
          {/* The console covers the whole viewport, so the site navbar isn't
              there to go back to. Without this the only way out is Logout. */}
          <button
            onClick={() => setActiveNav && setActiveNav("Home")}
            style={{ ...styles.viewSiteBtn, padding: railCollapsed ? "10px 0" : "10px" }}
            title={railCollapsed ? "View site" : undefined}
          >
            <Globe size={16} />
            {!railCollapsed && "View site"}
          </button>
          <button
            onClick={handleLogout}
            style={{ ...styles.logoutBtn, padding: railCollapsed ? "10px 0" : "10px" }}
            title={railCollapsed ? "Logout" : undefined}
          >
            <LogOut size={16} />
            {!railCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {/* On phones the console is the whole screen, so a 20px frame on all
          four sides costs 40px of the ~390px available — enough to drop the
          stat grid from two columns to one. Halve it. */}
      <main
        className="inner-blur-glass custom-scrollbar"
        style={{ ...styles.mainContent, ...(isMobile ? { margin: "10px" } : null) }}
      >
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: "1 1 260px" }}>
            {isMobile && (
              <button
                onClick={() => setNavDrawerOpen(true)}
                title="Open sections menu"
                aria-label="Open sections menu"
                aria-expanded={navDrawerOpen}
                style={styles.menuBtn}
              >
                <Menu size={18} />
                {totalActionCount > 0 && <span style={styles.menuBtnDot} />}
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={styles.breadcrumb}>
                <span>Admin</span>
                <span aria-hidden="true" style={{ opacity: 0.45 }}>/</span>
                <span>{groupForTab(activeTab)}</span>
              </div>
              <h1 style={styles.pageTitle}>{activeTab}</h1>
              {!isMobile && <p style={styles.pageSubtitle}>{tabSubtitles[activeTab] || ""}</p>}
            </div>
          </div>
          <div style={styles.headerActions}>
            {activeSearch && (
              <div
                style={{
                  ...styles.searchBar,
                  ...(searchFocused ? styles.searchBarFocused : null),
                }}
              >
                <Search size={14} style={{ color: searchFocused ? AD.green : AD.inkFaint, flexShrink: 0 }} />
                <input
                  type="text"
                  value={activeSearch.value}
                  onChange={(e) => activeSearch.setValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Escape") activeSearch.setValue(""); }}
                  placeholder={activeSearch.placeholder}
                  aria-label={activeSearch.placeholder}
                  style={styles.searchInput}
                />
                {activeSearch.value && (
                  <button
                    onClick={() => activeSearch.setValue("")}
                    title="Clear search"
                    aria-label="Clear search"
                    style={styles.navSearchClear}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                onClick={() => setIsAdminNotifOpen(!isAdminNotifOpen)}
                title="Notifications"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                aria-expanded={isAdminNotifOpen}
                style={{ ...styles.iconBtn, ...(isAdminNotifOpen ? styles.iconBtnActive : null) }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={styles.headerBadge}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {isAdminNotifOpen && (
                 <div style={styles.notifPanel}>
                    <div style={styles.notifHead}>
                       <span style={{ fontSize: "13.5px", fontWeight: 850, color: AD.ink }}>Notifications</span>
                       <button
                         onClick={() => setAdminNotifications(adminNotifications.map(n => ({ ...n, unread: false })))}
                         style={styles.textBtn}
                       >
                         Mark all as read
                       </button>
                    </div>
                    <div className="custom-scrollbar" style={{ maxHeight: "320px", overflowY: "auto" }}>
                       {adminNotifications.length === 0 ? (
                         <p style={{ margin: 0, padding: "26px 16px", textAlign: "center", fontSize: "12.5px", color: AD.inkSoft }}>
                           You're all caught up.
                         </p>
                       ) : adminNotifications.map(n => {
                          const accent = n.type === "error" ? AD.rose : n.type === "warning" ? AD.amber : AD.sky;
                          return (
                            <div key={n.id} style={{ ...styles.notifRow, background: n.unread ? "rgba(var(--eco-c9-rgb), 0.05)" : "transparent" }}>
                               {/* Unread reads as a dot rather than a tint alone, which
                                   disappears against the panel's own translucency. */}
                               <span style={{ ...styles.notifDot, background: n.unread ? accent : "transparent" }} />
                               <div style={{ minWidth: 0, flex: 1 }}>
                                 <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: accent }}>{n.title}</span>
                                    <span style={{ fontSize: "10.5px", fontWeight: 600, color: AD.inkFaint, whiteSpace: "nowrap" }}>{n.time}</span>
                                 </div>
                                 <div style={{ fontSize: "11.5px", color: AD.inkSoft, lineHeight: 1.45 }}>{n.message}</div>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              )}
            </div>
            <div style={styles.adminIdentity} title={adminEmail || undefined}>
              {adminAvatar ? (
                <img src={adminAvatar} alt={displayAdminName} style={styles.adminProfilePhoto} />
              ) : (
                <div style={styles.adminProfile}>{adminInitial}</div>
              )}
              {/* Name and email cost ~190px; below the compact breakpoint the
                  avatar alone carries the identity and keeps the title readable. */}
              {!isCompact && !isMobile && (
                <div style={styles.adminMeta}>
                  <span style={styles.adminName}>{displayAdminName}</span>
                  <span style={styles.adminRole}>{adminEmail || "Administrator"}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Rendering */}
        {activeTab === "Dashboard" ? (
          <div style={styles.dashboardContainer}>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {dashboardStats.map((stat, idx) => (
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
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
                        <stop offset="0%" stopColor="rgba(var(--eco-c7-rgb), 0.3)" />
                        <stop offset="100%" stopColor="rgba(var(--eco-c7-rgb), 0)" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 120 L 0 90 C 50 80, 100 100, 150 60 S 250 80, 300 40 S 350 50, 400 20 L 400 120 Z" fill="url(#adminRevGrad)" />
                    <path d="M 0 90 C 50 80, 100 100, 150 60 S 250 80, 300 40 S 350 50, 400 20" fill="none" stroke="var(--eco-c9)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="400" cy="20" r="5" fill="#fff" stroke="var(--eco-c9)" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Order Status Bars */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={styles.cardHeading}>Order Status</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  {[
                    { label: "Delivered", pct: "65%", color: "var(--eco-c13)" },
                    { label: "Processing", pct: "20%", color: "var(--eco-c13)" },
                    { label: "Out for Delivery", pct: "10%", color: "var(--eco-c13)" },
                    { label: "Cancelled", pct: "5%", color: "var(--eco-c13)" },
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
                  <button onClick={() => setToastMessage("Showing all recent activity")} style={styles.textBtn}>View All</button>
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
                          <td style={{ ...styles.td, fontWeight: 600, color: "var(--eco-c13)" }}>{order.amount}</td>
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

              {/* Support Queue */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ ...styles.cardHeading, display: "flex", alignItems: "center", gap: "8px" }}><Ticket size={16} color="var(--eco-c9)" /> Support Queue</h3>
                  <button onClick={() => setActiveTab("Support Tickets")} style={styles.textBtn}>Manage</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(supportTickets || []).slice(0, 4).map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedSupportTicket(ticket)}
                      style={{ padding: "10px", background: "rgba(255,255,255,0.56)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 850, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.subject}</span>
                        <span style={{ padding: "3px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, flexShrink: 0, ...getStatusStyle(ticket.status) }}>{ticket.status}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "11px", color: "rgba(0,0,0,0.52)", fontWeight: 700 }}>
                        <span>{ticket.id} • {ticket.category}</span>
                        <span>{ticket.priority || "Normal"}</span>
                      </div>
                    </button>
                  ))}
                  {(supportTickets || []).length === 0 && (
                    <div style={{ padding: "18px", borderRadius: "12px", border: "1px dashed rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.5)", fontSize: "12px", textAlign: "center", fontWeight: 700 }}>
                      No support tickets yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="inner-blur-glass" style={styles.chartCard}>
                <h3 style={{ ...styles.cardHeading, marginBottom: "12px" }}>Top Products</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mockTopProducts.map(prod => (
                    <div key={prod.name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{prod.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{prod.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>{prod.sales} sold</div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>{prod.rev}</div>
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
                        <button onClick={() => setToastMessage(`${ver.name} approved`)} style={{ flex: 1, padding: "4px", borderRadius: "6px", background: "var(--eco-c9)", color: "#fff", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><CheckCircle size={12} /> Approve</button>
                        <button onClick={() => setToastMessage(`${ver.name} rejected`)} style={{ flex: 1, padding: "4px", borderRadius: "6px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><XCircle size={12} /> Reject</button>
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
                <button onClick={handleAddProduct} style={{ ...styles.textBtn, background: "var(--eco-c9)", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Add Product</button>
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
                            background: productCategoryFilter === cat ? "var(--eco-c9)" : "rgba(255,255,255,0.7)",
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
                            <label style={{ cursor: "pointer", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Upload Image">
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
                          <AdminEcoDropdown value={editingProduct.stock} options={[{ value: "In Stock", label: "In Stock" }, { value: "Low Stock", label: "Low Stock" }, { value: "Out of Stock", label: "Out of Stock" }]} onChange={value => setEditingProduct({...editingProduct, stock: value})} />
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={handleSaveProduct} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px 12px", fontWeight: "bold" }}>Post</button>
                            <button onClick={() => setEditingProduct(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
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
                              <label style={{ cursor: "pointer", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Upload Image">
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
                            <AdminEcoDropdown value={editingProduct.stock} options={[{ value: "In Stock", label: "In Stock" }, { value: "Low Stock", label: "Low Stock" }, { value: "Out of Stock", label: "Out of Stock" }]} onChange={value => setEditingProduct({...editingProduct, stock: value})} />
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: product.stock === "In Stock" ? "rgba(var(--eco-c9-rgb), 0.1)" : product.stock === "Low Stock" ? "rgba(var(--eco-c7-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: product.stock === "In Stock" ? "var(--eco-c13)" : product.stock === "Low Stock" ? "var(--eco-c13)" : "var(--eco-c13)" }}>{product.stock}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingProduct?.id === product.id && !editingProduct.isNew ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={handleSaveProduct} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px 12px", fontWeight: "bold" }}>Update</button>
                              <button onClick={() => setEditingProduct(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleEditClick(product)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)" }}><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><XCircle size={14} /></button>
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
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(platformUsers || []).map((user) => {
                      const isEditing = editingUserId === user.id;
                      return (
                      <tr key={user.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{user.id}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c9))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", flexShrink: 0 }}>
                              {(user.name || "?").charAt(0)}
                            </div>
                            {isEditing ? (
                              <input value={userDraft.name} onChange={(e) => setUserDraft({ ...userDraft, name: e.target.value })} style={{ ...ecoGlassInputStyle, padding: "6px 10px", fontSize: "12px", width: "140px" }} />
                            ) : (
                              <span style={{ fontWeight: 600 }}>{user.name}</span>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <div style={{ width: "140px" }}>
                              <AdminEcoDropdown
                                value={userDraft.role}
                                options={[{ value: "Customer", label: "Customer" }, { value: "Farmer", label: "Farmer" }, { value: "B2B Buyer", label: "B2B Buyer" }, { value: "Specialist", label: "Specialist" }]}
                                onChange={(value) => setUserDraft({ ...userDraft, role: value })}
                                compact
                              />
                            </div>
                          ) : user.role}
                        </td>
                        <td style={{ ...styles.td, color: "rgba(0,0,0,0.5)", fontSize: "11px" }}>{user.lastLogin}</td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <div style={{ width: "120px" }}>
                              <AdminEcoDropdown
                                value={userDraft.status}
                                options={[{ value: "Online", label: "Online" }, { value: "Offline", label: "Offline" }, { value: "Suspended", label: "Suspended" }]}
                                onChange={(value) => setUserDraft({ ...userDraft, status: value })}
                                compact
                              />
                            </div>
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: user.status === "Online" ? "rgba(var(--eco-c9-rgb), 0.1)" : user.status === "Suspended" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(107,114,128,0.1)", color: user.status === "Online" ? "var(--eco-c13)" : user.status === "Suspended" ? "var(--eco-c13)" : "#6b7280" }}>{user.status}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={handleSaveUser} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Save</button>
                              <button onClick={() => setEditingUserId(null)} style={{ ...styles.actionBtn, color: "#6b7280", background: "rgba(107,114,128,0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              <button onClick={() => handleEditUser(user)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><Edit2 size={12} style={{ marginRight: "4px" }} /> Edit</button>
                              <button onClick={() => handleManageMember(user)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><UserCheck size={12} style={{ marginRight: "4px" }} /> Manage</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                    })}
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
                  <div style={styles.statIconWrap}><CreditCard size={16} color="var(--eco-c11)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><TrendingUp size={10} /> +12%</span>
                </div>
                <div style={styles.statValue}>₱{revenueToday.toLocaleString()}</div>
                <div style={styles.statLabel}>Revenue Today</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><ShoppingCart size={16} color="var(--eco-c9)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><TrendingUp size={10} /> +5%</span>
                </div>
                <div style={styles.statValue}>{(orders || []).length}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Clock size={16} color="var(--eco-c7)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><TrendingDown size={10} /> -2%</span>
                </div>
                <div style={styles.statValue}>{pendingOrdersCount}</div>
                <div style={styles.statLabel}>Pending Orders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><CheckCircle size={16} color="var(--eco-c9)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><TrendingUp size={10} /> +8%</span>
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
                      background: "rgba(var(--eco-c9-rgb), 0.1)",
                      color: "var(--eco-c13)",
                      border: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--eco-c11)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.1)";
                      e.currentTarget.style.color = "var(--eco-c11)";
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
                      background: orderStatusFilter === "Out for Delivery" ? "var(--eco-c7)" : "rgba(var(--eco-c7-rgb), 0.1)",
                      color: orderStatusFilter === "Out for Delivery" ? "#fff" : "var(--eco-c13)",
                      border: orderStatusFilter === "Out for Delivery" ? "1px solid var(--eco-c7)" : "1px solid rgba(var(--eco-c7-rgb), 0.2)",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Navigation size={14} />
                    Out for Delivery Only
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                    <div style={{ width: "160px" }}><AdminEcoDropdown value={orderStatusFilter} options={[{ value: "All", label: "All Statuses" }, { value: "Pending Approval", label: "Pending Approval" }, { value: "Disapproved", label: "Disapproved" }]} onChange={setOrderStatusFilter} compact align="right" /></div>
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
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                              {order.customer.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{order.customer}</span>
                          </div>
                        </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: "12px", color: "#000", fontWeight: 500 }}>{order.phone}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: "var(--eco-c13)", fontSize: "13px" }}>{order.amount || `₱${order.total?.toFixed(2)}`}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.6)", marginTop: "2px" }}>{order.payment} • <span style={{ color: order.paymentStatus === "Paid" ? "var(--eco-c13)" : "var(--eco-c13)" }}>{order.paymentStatus || "Pending"}</span></div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.7)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={order.address}>{order.address}</div>
                          </td>
                        <td style={styles.td}>
                          {editingOrderId === order.id ? (
                            <AdminEcoDropdown value={newOrderStatus} options={[{ value: "Pending Approval", label: "Pending Approval" }, { value: "Approved", label: "Approved" }, { value: "Disapproved", label: "Disapproved" }]} onChange={setNewOrderStatus} />
                          ) : (
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(order.status) }}>{order.status}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingOrderId === order.id ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleSaveOrderStatus(order.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                              <button onClick={() => setEditingOrderId(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleManageOrder(order)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><Eye size={14} /></button>
                                {order.status === "Pending Approval" && (
                                  <button onClick={() => handleEditOrder(order)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)" }}><Edit2 size={14} /></button>
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Delivery Queue - expanded full width */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Delivery Queue</h3>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setDeliveryStatusFilter(deliveryStatusFilter === "Out for Delivery" ? "All" : "Out for Delivery")}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 16px", borderRadius: "999px",
                        background: deliveryStatusFilter === "Out for Delivery" ? "var(--eco-c7)" : "rgba(var(--eco-c7-rgb), 0.1)",
                        color: deliveryStatusFilter === "Out for Delivery" ? "#fff" : "var(--eco-c13)",
                        border: deliveryStatusFilter === "Out for Delivery" ? "1px solid var(--eco-c7)" : "1px solid rgba(var(--eco-c7-rgb), 0.2)",
                        fontWeight: 700, fontSize: "12px", cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <Navigation size={14} />
                      Out for Delivery Only
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "170px" }}><AdminEcoDropdown value={deliveryStatusFilter} options={[{ value: "All", label: "All Statuses" }, { value: "Pending Pickup", label: "Pending Pickup" }, { value: "Packed", label: "Packed" }, { value: "In Transit", label: "In Transit" }, { value: "Out for Delivery", label: "Out for Delivery" }, { value: "Delayed", label: "Delayed" }, { value: "Cancelled", label: "Cancelled" }]} onChange={setDeliveryStatusFilter} compact align="right" /></div>
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
                              <AdminEcoDropdown value={newDeliveryStatus} options={[{ value: "Pending Pickup", label: "Pending Pickup" }, { value: "Packed", label: "Packed" }, { value: "In Transit", label: "In Transit" }, { value: "Out for Delivery", label: "Out for Delivery" }, { value: "Delivered", label: "Delivered" }, { value: "Delayed", label: "Delayed" }, { value: "Cancelled", label: "Cancelled" }]} onChange={setNewDeliveryStatus} />
                            ) : (
                              <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getStatusStyle(delivery.status) }}>{delivery.status}</span>
                            )}
                          </td>
                          <td style={{ ...styles.td, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{delivery.eta}</td>
                          <td style={styles.td}>
                            {editingDeliveryId === delivery.id ? (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleSaveDeliveryStatus(delivery.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                                <button onClick={() => setEditingDeliveryId(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "8px" }}>
                                {delivery.status === "Delivered" ? (
                                  <button disabled title="Delivered orders cannot be managed." style={{ ...styles.actionBtn, color: "#6b7280", background: "rgba(107,114,128,0.1)", padding: "4px 8px", fontWeight: "bold", fontSize: "11px", cursor: "not-allowed", opacity: 0.65 }}>Delivered</button>
                                ) : (
                                  <button onClick={() => { setSelectedDelivery(delivery); setEditableDelivery({...delivery, riderStatus: delivery.riderStatus || "Preparing Order"}); }} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 8px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
                                )}
                                <button onClick={() => handleEditDeliveryInline(delivery)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)" }}><Edit2 size={14} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lower Section - Live Tracking, Chat & Riders */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
                {/* Live Tracking Map Preview */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: 0, overflow: "hidden", position: "relative", height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
                    <path d="M 50 150 Q 150 50 250 120 T 380 60" fill="none" stroke="var(--eco-c9)" strokeWidth="4" strokeDasharray="8 8" />
                    <circle cx="50" cy="150" r="8" fill="var(--eco-c11)" />
                    <circle cx="250" cy="120" r="8" fill="var(--eco-c7)" />
                    <circle cx="380" cy="60" r="8" fill="var(--eco-c7)" />
                    
                    {/* Live Rider Node */}
                    <g transform="translate(150, 100)">
                      <circle cx="0" cy="0" r="16" fill="rgba(var(--eco-c9-rgb), 0.2)">
                        <animate attributeName="r" values="16; 24; 16" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="8" fill="var(--eco-c9)" />
                    </g>
                  </svg>
                  <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "6px", color: "var(--eco-c13)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--eco-c9)" }}></span> Live Tracking
                  </div>
                </div>

                {/* Rider Management */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px" }}>Active Riders</h3>
                    <button style={styles.textBtn} onClick={() => setShowAllRiders(true)}>View All</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "14px", fontSize: "11px", fontWeight: 700 }}>
                    <span style={{ padding: "3px 9px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" }}>{riders.filter(r => r.status === "Available").length} Available</span>
                    <span style={{ padding: "3px 9px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.12)", color: "var(--eco-c13)" }}>{riders.filter(r => r.status === "On Delivery").length} On Delivery</span>
                    <span style={{ padding: "3px 9px", borderRadius: "999px", background: "rgba(148,163,184,0.18)", color: "#475569" }}>{riders.filter(r => r.status === "Offline").length} Offline</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {riders.length === 0 && (
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", textAlign: "center", padding: "16px 0", fontWeight: 600 }}>No riders in the fleet yet.</div>
                    )}
                    {riders.map((rider) => (
                      <div key={rider.id} onClick={() => { setSelectedRider(rider); setRiderMessageText(""); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "rgba(255,255,255,0.5)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ position: "relative" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569" }}>
                              {rider.name.charAt(0)}
                            </div>
                            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: riderStatusColor(rider.status), border: "2px solid #fff" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{rider.name}</div>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}><Star size={11} fill="var(--eco-c7)" color="var(--eco-c7)" style={{ verticalAlign: "middle" }} /> {rider.rating} • {rider.deliveries} trips • {rider.area}</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedRider(rider); setRiderMessageText(""); }} style={{ background: "rgba(var(--eco-c7-rgb), 0.1)", border: "none", color: "var(--eco-c13)", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eco Metrics Box */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Leaf size={18} color="var(--eco-c11)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "var(--eco-c13)" }}>Eco-Delivery Impact</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--eco-c13)" }}>45%</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>Eco-Bike Usage</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--eco-c13)" }}>120kg</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>CO₂ Saved Today</div>
                    </div>
                  </div>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Megaphone size={18} color="var(--eco-c7)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)" }}>Broadcast Notifications</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <AdminEcoDropdown value={sendNotifForm.audience} options={[{ value: "All", label: "All Users" }, { value: "Basic", label: "Basic Plan Users" }, { value: "Pro", label: "Pro Plan Users" }, { value: "Enterprise", label: "Enterprise Users" }]} onChange={value => setSendNotifForm({...sendNotifForm, audience: value})} />
                      <AdminEcoDropdown value={sendNotifForm.type} options={[{ value: "Announcement", label: "Feature Announcement" }, { value: "Promo", label: "Promo / Discount" }, { value: "Alert", label: "Maintenance Alert" }, { value: "Reminder", label: "Subscription Reminder" }]} onChange={value => setSendNotifForm({...sendNotifForm, type: value})} />
                    </div>
                    <AdminEcoDropdown value={sendNotifForm.channel} options={[{ value: "Push", label: "Push Notification" }, { value: "Email", label: "Email" }, { value: "SMS", label: "SMS" }, { value: "In-App", label: "In-App Banner" }]} onChange={value => setSendNotifForm({...sendNotifForm, channel: value})} />
                    <input type="text" placeholder="Notification Title" value={sendNotifForm.title} onChange={e => setSendNotifForm({...sendNotifForm, title: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)" }} />
                    <textarea placeholder="Type your message here..." value={sendNotifForm.message} onChange={e => setSendNotifForm({...sendNotifForm, message: e.target.value})} style={{ ...styles.editInput, background: "rgba(255,255,255,0.6)", height: "80px", resize: "none", fontFamily: "inherit" }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)" }}>
                      <span>Estimated reach</span>
                      <span style={{ color: "var(--eco-c13)" }}>{(audienceReach[sendNotifForm.audience] || 0).toLocaleString()} users • {sendNotifForm.channel}</span>
                    </div>
                    <button
                      onClick={handleSendBroadcast}
                      style={{ padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.3)" }}
                    >
                      <Send size={14} /> Send Broadcast
                    </button>

                    {broadcasts.length > 0 && (
                      <div style={{ marginTop: "4px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recent Broadcasts</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>{broadcasts.length} sent</span>
                        </div>
                        <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto" }}>
                          {broadcasts.map((b) => (
                            <div key={b.id} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.55)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{b.title}</div>
                                <button onClick={() => handleDeleteBroadcast(b.id)} title="Remove from history" style={{ background: "rgba(var(--eco-c9-rgb), 0.08)", border: "none", color: "var(--eco-c13)", width: "24px", height: "24px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", margin: "4px 0 8px", lineHeight: 1.4 }}>{b.message}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)" }}>{b.type}</span>
                                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" }}>{b.audience}</span>
                                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(148,163,184,0.18)", color: "#475569" }}>{b.channel}</span>
                                <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", marginLeft: "auto" }}>{(b.reach || 0).toLocaleString()} reach • {b.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <div style={styles.statIconWrap}><CheckCircle size={16} color="var(--eco-c9)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>Complete</span>
                </div>
                <div style={styles.statValue}>{deliveredReportsList.length}</div>
                <div style={styles.statLabel}>Delivered Items</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Truck size={16} color="var(--eco-c9)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)" }}>Archived</span>
                </div>
                <div style={styles.statValue}>{deliveredReportsList.filter(delivery => delivery.rider !== "Unassigned").length}</div>
                <div style={styles.statLabel}>Assigned Riders</div>
              </div>
              <div className="inner-blur-glass" style={styles.statCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={styles.statIconWrap}><Leaf size={16} color="var(--eco-c11)" /></div>
                  <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>Eco</span>
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
                <span style={{ padding: "6px 12px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "12px", fontWeight: 800 }}>
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
                          <td style={{ ...styles.td, color: "var(--eco-c13)", fontWeight: 700 }}>{delivery.orderId}</td>
                          <td style={styles.td}>{delivery.customer}</td>
                          <td style={styles.td}>{delivery.rider}</td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: "210px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={orderDetails?.products || delivery.products || "N/A"}>
                              {orderDetails?.products || delivery.products || "N/A"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, color: "var(--eco-c13)" }}>{orderDetails?.amount || "N/A"}</div>
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
        ) : activeTab === "Support Tickets" ? (
          <div style={styles.dashboardContainer}>
            <div style={{ ...styles.statsGrid, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              {[
                { label: "Open Tickets", value: openSupportTicketsCount, trend: "Needs action", icon: <Ticket size={16} color="#7c3aed" />, color: "#7c3aed" },
                { label: "Priority Cases", value: urgentSupportTicketsCount, trend: "High/Urgent", icon: <AlertCircle size={16} color="#dc2626" />, color: "#dc2626" },
                { label: "Resolved", value: (supportTickets || []).filter(ticket => ticket.status === "Resolved").length, trend: "Closed", icon: <CheckCircle size={16} color="var(--eco-c11)" />, color: "var(--eco-c13)" },
                { label: "Total Tickets", value: (supportTickets || []).length, trend: "All time", icon: <MessageSquare size={16} color="#0284c7" />, color: "#0284c7" },
              ].map((stat) => (
                <div key={stat.label} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.color, background: `${stat.color}18` }}>{stat.trend}</span>
                  </div>
                  <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* ---------------------------------------------------------------
                Live Chats — people sitting in the chat panel right now.

                A card list, not a <table>. The agent picker below is an
                absolutely-positioned menu, and the ticket table lives inside an
                `overflow-x: auto` wrapper on a .inner-blur-glass card — either
                one would clip the menu to a sliver. Rows in flow, picker
                expanding inline beneath its row, nothing to clip.
                --------------------------------------------------------------- */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "14px" }}>
                <div>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MessageSquare size={18} color="var(--eco-c9)" /> Live Chats
                    {liveWaitingCount > 0 && (
                      <span style={{ padding: "3px 9px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.14)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 850 }}>
                        {liveWaitingCount} waiting
                      </span>
                    )}
                  </h3>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600, marginTop: "4px" }}>
                    Requests from the AI Chat panel's "Human agent" switch. Assign one to an agent to start replying.
                  </div>
                </div>
                <button onClick={reloadLiveQueue} style={{ ...styles.textBtn, display: "flex", alignItems: "center", gap: "6px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", padding: "8px 12px", borderRadius: "999px" }}>
                  <RefreshCcw size={13} /> Refresh
                </button>
              </div>

              {!supabaseReady ? (
                <div style={liveEmptyStyle}>Connect Supabase to receive live chats.</div>
              ) : liveQueueError ? (
                <div style={liveEmptyStyle}>{liveQueueError}</div>
              ) : liveQueue.length === 0 ? (
                <div style={liveEmptyStyle}>No live chats right now. They appear here the moment a member asks for a human.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {liveQueue.map(chat => {
                    const isPicking = assigningTicketId === chat.id;
                    return (
                      <div key={chat.id} style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", background: chat.waitingOnUs ? "rgba(var(--eco-c9-rgb), 0.06)" : "rgba(255,255,255,0.72)", padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
                          <div style={{ minWidth: "200px", flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                              <span style={{ fontWeight: 850, color: "#000" }}>{chat.memberName}</span>
                              <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 850, background: liveStatusChip(chat.liveStatus).tint, color: liveStatusChip(chat.liveStatus).ink }}>
                                {liveStatusChip(chat.liveStatus).label}
                              </span>
                              {chat.waitingOnUs && chat.liveStatus !== "closed" && chat.liveStatus !== "rejected" && (
                                <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 850, background: "rgba(var(--eco-c9-rgb), 0.16)", color: "var(--eco-c13)" }}>Waiting on us</span>
                              )}
                            </div>
                            <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600 }}>
                              {chat.ref} • {chat.subject} • {liveWaitLabel(chat.lastMessageAt)}
                            </div>
                            {/* Only worth saying once there is a handover to describe.
                                On a first assignment the "previous agent" is nobody. */}
                            {chat.previousAgentName && chat.previousAgentName !== chat.agentName && (
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", fontWeight: 700, marginTop: "3px" }}>
                                Previously with {chat.previousAgentName}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {chat.agentName ? (
                              <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 11px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "12px", fontWeight: 800 }}>
                                <UserCheck size={13} /> {chat.agentName}
                              </span>
                            ) : (
                              <span style={{ fontSize: "12px", fontWeight: 750, color: "rgba(0,0,0,0.45)" }}>Unassigned</span>
                            )}
                            {/* Accept/Decline only while the request is still
                                unanswered. Once it is accepted the decision has
                                been made, and re-offering it invites an admin to
                                decline somebody they are already talking to. */}
                            {chat.liveStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => handleReviewLiveChat(chat, "accept")}
                                  style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.16)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReviewLiveChat(chat, "reject")}
                                  style={{ ...styles.actionBtn, color: "#b91c1c", background: "rgba(220,38,38,0.1)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setAssigningTicketId(isPicking ? null : chat.id)}
                              style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}
                            >
                              {chat.agentName ? "Reassign" : "Assign"}
                            </button>
                            <button
                              onClick={() => setSelectedLiveChat(chat)}
                              style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}
                            >
                              Open chat
                            </button>
                          </div>
                        </div>

                        {isPicking && (
                          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
                            {liveAgents.length === 0 ? (
                              <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 650, lineHeight: 1.5 }}>
                                No support agents yet. Add one in the Supabase SQL editor:
                                <code style={{ display: "block", marginTop: "6px", fontSize: "11px", color: "var(--eco-c13)" }}>
                                  select * from public.set_agent('them@example.com', true);
                                </code>
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {/* Offline agents stay clickable on purpose. An agent
                                    only counts as available once their browser has sent
                                    a heartbeat, so before the agent-side screen exists
                                    everyone reads offline — disabling them would make
                                    assignment impossible. The dot tells the truth. */}
                                {liveAgents.map(agent => (
                                  <button
                                    key={agent.id}
                                    onClick={() => handleAssignAgent(chat, agent)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "8px",
                                      padding: "9px 13px", borderRadius: "12px", cursor: "pointer",
                                      border: agent.id === chat.agentId ? "1px solid var(--eco-c9)" : "1px solid rgba(0,0,0,0.08)",
                                      background: "rgba(255,255,255,0.85)",
                                      fontSize: "12px", fontWeight: 800, color: "var(--eco-c19)",
                                      fontFamily: "inherit",
                                    }}
                                  >
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: agent.available ? "var(--eco-c11)" : "rgba(0,0,0,0.22)" }} />
                                    {agent.name}
                                    <span style={{ fontSize: "10px", fontWeight: 750, color: "rgba(0,0,0,0.45)" }}>
                                      {agent.available ? `${agent.openChats} open` : agent.status}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---------------------------------------------------------------
                Support Agents — the staff list, and the invite form.

                Sits under Live Chats rather than in Settings because the two
                questions are asked in the same breath: nobody wonders "who are
                my agents" except while looking at a queue that needs one.
                --------------------------------------------------------------- */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <UserCheck size={18} color="var(--eco-c9)" /> Support Agents
                </h3>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600, marginTop: "4px" }}>
                  Invite someone by email. They set their own password, and land straight in the Agent Portal.
                </div>
              </div>

              <form onSubmit={handleInviteAgent} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="Full name"
                  style={{ ...ecoGlassInputStyle, flex: "1 1 160px", minWidth: 0 }}
                />
                <input
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="agent@example.com"
                  type="email"
                  required
                  style={{ ...ecoGlassInputStyle, flex: "1 1 200px", minWidth: 0 }}
                />
                <button
                  type="submit"
                  disabled={inviteBusy || !inviteForm.email.trim()}
                  style={{ ...ecoPrimaryButtonStyle, padding: "12px 18px", borderRadius: "14px", fontSize: "13px", fontWeight: 850, flexShrink: 0, cursor: inviteBusy || !inviteForm.email.trim() ? "not-allowed" : "pointer", opacity: inviteBusy || !inviteForm.email.trim() ? 0.55 : 1 }}
                >
                  <span aria-hidden="true" style={ecoPrimaryInnerStyle} />
                  <span style={{ position: "relative", zIndex: 1 }}>{inviteBusy ? "Working…" : "Send invite"}</span>
                </button>
              </form>

              {agentRoster.length === 0 ? (
                <div style={liveEmptyStyle}>
                  No agents yet. Invite one above — or run <code>supabase/agent-invites.sql</code> if you haven't.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {agentRoster.map(agent => {
                    const chip = AGENT_STATE_CHIPS[agent.state] || AGENT_STATE_CHIPS.pending;
                    return (
                      <div key={agent.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "12px 14px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.7)" }}>
                        <div style={{ minWidth: "180px", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: chip.dot }} />
                            <span style={{ fontWeight: 850, color: "#000", fontSize: "13px" }}>{agent.name || agent.email}</span>
                            <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 850, background: chip.tint, color: chip.ink }}>{chip.label}</span>
                          </div>
                          <div style={{ fontSize: "11.5px", color: "rgba(0,0,0,0.5)", fontWeight: 650, marginTop: "3px" }}>
                            {agent.email}
                            {agent.state !== "pending" && ` • ${agent.openChats} open chat${agent.openChats === 1 ? "" : "s"}`}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {/* Resend only means something while they have not
                              signed up. Offering it to a working agent would
                              mail them a set-password link out of nowhere. */}
                          {agent.state === "pending" && (
                            <button disabled={inviteBusy} onClick={() => handleAgentRosterAction(agent, "resend")} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}>Resend</button>
                          )}
                          {agent.state === "disabled" ? (
                            <button disabled={inviteBusy} onClick={() => handleAgentRosterAction(agent, "enable")} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.16)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}>Re-enable</button>
                          ) : (
                            <button disabled={inviteBusy} onClick={() => handleAgentRosterAction(agent, "disable")} style={{ ...styles.actionBtn, color: "#b91c1c", background: "rgba(220,38,38,0.1)", padding: "7px 13px", fontWeight: 850, fontSize: "11px" }}>
                              {agent.state === "pending" ? "Revoke" : "Disable"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
                  <div>
                    <h3 style={{ ...styles.cardHeading, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}><Ticket size={18} color="var(--eco-c9)" /> Ticket Inbox</h3>
                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", fontWeight: 600, marginTop: "4px" }}>Support requests submitted from the website ticket button.</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={handleRefreshSupportTickets} style={{ ...styles.textBtn, display: "flex", alignItems: "center", gap: "6px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", padding: "8px 12px", borderRadius: "999px" }}><RefreshCcw size={13} /> Refresh</button>
                    <div style={{ width: "170px" }}>
                      <AdminEcoDropdown
                        value={supportStatusFilter}
                        options={supportStatusOptions}
                        onChange={setSupportStatusFilter}
                        compact
                        align="right"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "820px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Ticket</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Priority</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Assignee</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSupportTickets.length > 0 ? filteredSupportTickets.map(ticket => (
                        <tr key={ticket.id} style={styles.tr}>
                          <td style={{ ...styles.td, whiteSpace: "normal", minWidth: "230px" }}>
                            <div style={{ fontWeight: 850, color: "#000", marginBottom: "3px" }}>{ticket.subject}</div>
                            <div style={{ fontSize: "11px", color: "var(--eco-c13)", fontWeight: 800 }}>{ticket.id}</div>
                          </td>
                          <td style={{ ...styles.td, whiteSpace: "normal", minWidth: "160px" }}>
                            <div style={{ fontWeight: 750 }}>{ticket.name}</div>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.52)", marginTop: "2px" }}>{ticket.email}</div>
                          </td>
                          <td style={styles.td}>{ticket.category}</td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: ticket.priority === "Urgent" || ticket.priority === "High" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: ticket.priority === "Urgent" || ticket.priority === "High" ? "var(--eco-c13)" : "var(--eco-c13)" }}>{ticket.priority || "Normal"}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, ...getStatusStyle(ticket.status) }}>{ticket.status}</span>
                          </td>
                          <td style={styles.td}>{ticket.assignee || "Unassigned"}</td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedSupportTicket(ticket)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px 12px", fontWeight: 850, fontSize: "11px" }}>Open</button>
                          </td>
                        </tr>
                      )) : (
                        <tr style={styles.tr}>
                          <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: "30px", color: "rgba(0,0,0,0.55)", fontWeight: 750 }}>
                            No support tickets match this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "22px" }}>
                  <h3 style={{ ...styles.cardHeading, marginBottom: "14px" }}>Queue Health</h3>
                  {[
                    { label: "Open", count: openSupportTicketsCount, color: "var(--eco-c13)", pct: (supportTickets || []).length ? `${Math.min((openSupportTicketsCount / (supportTickets || []).length) * 100, 100)}%` : "0%" },
                    { label: "Priority", count: urgentSupportTicketsCount, color: "var(--eco-c13)", pct: (supportTickets || []).length ? `${Math.min((urgentSupportTicketsCount / (supportTickets || []).length) * 100, 100)}%` : "0%" },
                    { label: "Resolved", count: (supportTickets || []).filter(ticket => ticket.status === "Resolved").length, color: "var(--eco-c13)", pct: (supportTickets || []).length ? `${Math.min(((supportTickets || []).filter(ticket => ticket.status === "Resolved").length / (supportTickets || []).length) * 100, 100)}%` : "0%" },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.68)", marginBottom: "5px" }}>
                        <span>{item.label}</span>
                        <span>{item.count}</span>
                      </div>
                      <div style={{ height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                        <div style={{ width: item.pct, height: "100%", borderRadius: "999px", background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "22px" }}>
                  <h3 style={{ ...styles.cardHeading, marginBottom: "14px" }}>Quick Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setSupportStatusFilter("Open")} style={{ padding: "11px 12px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontWeight: 850, cursor: "pointer", textAlign: "left" }}>View Open Tickets</button>
                    <button onClick={() => setSupportStatusFilter("In Review")} style={{ padding: "11px 12px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontWeight: 850, cursor: "pointer", textAlign: "left" }}>View In Review</button>
                    <button onClick={() => setSupportStatusFilter("Resolved")} style={{ padding: "11px 12px", borderRadius: "12px", border: "none", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontWeight: 850, cursor: "pointer", textAlign: "left" }}>View Resolved</button>
                  </div>
                </div>
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "150px" }}><AdminEcoDropdown value={paymentStatusFilter} options={[{ value: "All", label: "All Statuses" }, { value: "Paid", label: "Paid" }, { value: "Pending", label: "Pending" }, { value: "Failed", label: "Failed" }, { value: "Refunded", label: "Refunded" }]} onChange={setPaymentStatusFilter} compact align="right" /></div>
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
                              {txn.method === "GCash" ? <span style={{ color: "var(--eco-c13)" }}>GCash</span> : txn.method === "Maya" ? <span style={{ color: "var(--eco-c13)" }}>Maya</span> : txn.method}
                            </div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: "var(--eco-c13)" }}>{txn.amount}</td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getPaymentStatusStyle(txn.status) }}>{txn.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedPaymentTxn(txn)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Details</button>
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
                    <button onClick={() => downloadCSV("financial-report.csv", orders)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <FileText size={16} /> Export CSV Report
                    </button>
                    <button onClick={() => setToastMessage("Preparing invoices PDF for download…")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <Download size={16} /> Download Invoices (PDF)
                    </button>
                  </div>
                </div>

                {/* AI Financial Insights */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.1), rgba(var(--eco-c7-rgb), 0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <BarChart2 size={18} color="var(--eco-c11)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "var(--eco-c13)" }}>AI Financial Insights</h3>
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
                      { label: "GCash", pct: "45%", color: "var(--eco-c13)" },
                      { label: "Credit Card", pct: "30%", color: "var(--eco-c13)" },
                      { label: "Cash on Delivery", pct: "15%", color: "var(--eco-c13)" },
                      { label: "Maya", pct: "10%", color: "var(--eco-c13)" },
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Plans Management Cards — edits here render on the client AI Data Subscription page */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "8px" }}>
              {(subscriptionPlans || []).map(plan => {
                const isEditing = editingPlanId === plan.id;
                return (
                <div key={plan.id} className="inner-blur-glass" style={{ ...styles.chartCard, background: plan.bg, padding: "20px", border: `1px solid ${plan.color}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: plan.color, margin: 0 }}>{plan.name}</h3>
                    {isEditing ? (
                      <input
                        value={planDraft.priceMonthly}
                        onChange={(e) => setPlanDraft({ ...planDraft, priceMonthly: e.target.value })}
                        style={{ ...ecoGlassInputStyle, width: "90px", padding: "6px 10px", fontSize: "13px", textAlign: "right" }}
                      />
                    ) : (
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#000" }}>{plan.priceMonthly}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input
                        value={planDraft.description}
                        onChange={(e) => setPlanDraft({ ...planDraft, description: e.target.value })}
                        placeholder="Short description shown to clients"
                        style={{ ...ecoGlassInputStyle, fontSize: "12px" }}
                      />
                      <input
                        value={planDraft.priceYearly}
                        onChange={(e) => setPlanDraft({ ...planDraft, priceYearly: e.target.value })}
                        placeholder="Yearly price"
                        style={{ ...ecoGlassInputStyle, fontSize: "12px" }}
                      />
                      <input
                        value={planDraft.badge}
                        onChange={(e) => setPlanDraft({ ...planDraft, badge: e.target.value })}
                        placeholder="Badge (e.g. Most Popular)"
                        style={{ ...ecoGlassInputStyle, fontSize: "12px" }}
                      />
                      <textarea
                        value={planDraft.features}
                        onChange={(e) => setPlanDraft({ ...planDraft, features: e.target.value })}
                        placeholder="Included features, one per line"
                        rows={4}
                        style={{ ...ecoGlassInputStyle, fontSize: "12px", resize: "vertical", fontFamily: "inherit" }}
                      />
                      <textarea
                        value={planDraft.excludedFeatures}
                        onChange={(e) => setPlanDraft({ ...planDraft, excludedFeatures: e.target.value })}
                        placeholder="Excluded features, one per line"
                        rows={2}
                        style={{ ...ecoGlassInputStyle, fontSize: "12px", resize: "vertical", fontFamily: "inherit" }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
                        <input
                          type="checkbox"
                          checked={planDraft.clientVisible}
                          onChange={(e) => setPlanDraft({ ...planDraft, clientVisible: e.target.checked })}
                        />
                        Visible to clients
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleSavePlan} style={{ ...ecoPrimaryButtonStyle, flex: 1, padding: "9px 12px", fontSize: "12px" }}>
                          <span style={ecoPrimaryInnerStyle}>Save</span>
                        </button>
                        <button onClick={() => setEditingPlanId(null)} style={{ flex: 1, padding: "9px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {(plan.features || []).map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>
                            <CheckCircle size={14} color={plan.color} /> {f}
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                        <div><strong style={{ fontSize: "15px", color: "#000" }}>{plan.users}</strong> <span style={{ color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Users</span></div>
                        <div style={{ color: "var(--eco-c13)", fontWeight: 800 }}>{plan.revenue} MRR</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                        <button onClick={() => handleEditPlan(plan)} style={{ ...ecoPrimaryButtonStyle, flex: 1, padding: "9px 12px", fontSize: "12px" }}>
                          <span style={ecoPrimaryInnerStyle}>Edit Plan</span>
                        </button>
                        <span style={{ padding: "5px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: plan.clientVisible ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(107,114,128,0.12)", color: plan.clientVisible ? "var(--eco-c13)" : "#6b7280" }}>
                          {plan.clientVisible ? "Live" : "Hidden"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Left Column - Subscribers Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Subscribers</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
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
                          <td style={{ ...styles.td, fontWeight: 700, color: sub.plan === "Pro" ? "var(--eco-c13)" : sub.plan === "Enterprise" ? "var(--eco-c13)" : "#475569" }}>{sub.plan}</td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getSubStatusStyle(sub.status) }}>{sub.status}</span>
                          </td>
                          <td style={{ ...styles.td, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{sub.renewal}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleOpenSubscriber(sub)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
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
                          <stop offset="0%" stopColor="rgba(var(--eco-c7-rgb), 0.3)" />
                          <stop offset="100%" stopColor="rgba(var(--eco-c7-rgb), 0)" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 120 L 0 100 C 50 90, 100 110, 150 70 S 250 80, 300 30 S 350 40, 400 10 L 400 120 Z" fill="url(#subRevGrad)" />
                      <path d="M 0 100 C 50 90, 100 110, 150 70 S 250 80, 300 30 S 350 40, 400 10" fill="none" stroke="var(--eco-c7)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="400" cy="10" r="5" fill="#fff" stroke="var(--eco-c7)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c8-rgb), 0.1), rgba(var(--eco-c8-rgb), 0.05))" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Tag size={18} color="var(--eco-c10)" />
                      <h3 style={{ ...styles.cardHeading, fontSize: "15px", color: "var(--eco-c13)" }}>Active Promo Campaigns</h3>
                    </div>
                    <button onClick={() => setEditingPromo({ isNew: true, code: "", type: "percent", value: 0, desc: "" })} style={{ background: "var(--eco-c10)", color: "#fff", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>+ Add</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
                    {(promoCodes || []).map(promo => (
                      <div key={promo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.6)", padding: "10px", borderRadius: "10px", border: "1px dashed var(--eco-c8)" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>{promo.code} {promo.type !== 'shipping' && <span style={{fontSize: "10px", color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px"}}>{promo.type === 'percent' ? `${promo.value}%` : `₱${promo.value}`}</span>}</div>
                          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{promo.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--eco-c13)" }}>{promo.uses || 0} Uses</span>
                          <button onClick={() => setEditingPromo(promo)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--eco-c13)" }}><Edit2 size={14}/></button>
                          <button onClick={() => setPromoCodes((promoCodes || []).filter(p => p.id !== promo.id))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--eco-c13)" }}><Trash2 size={14}/></button>
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
            {/* Events Stats Grid — live values from the shared events list */}
            <div style={styles.statsGrid}>
              {eventStatsLive.map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
                      {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Wider than the usual 2fr/1fr split: at 2fr the Action column
                fell off the end of the table and the row's buttons could only
                be reached by scrolling it sideways. */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.7fr) minmax(240px, 1fr)", gap: "24px" }}>
              {/* Left Column - Events Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Event Management</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "150px" }}><AdminEcoDropdown value={eventTypeFilter} options={[{ value: "All", label: "All Types" }, { value: "Workshop", label: "Workshop" }, { value: "Webinar", label: "Webinar" }, { value: "Community", label: "Community" }]} onChange={setEventTypeFilter} compact align="right" /></div>
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
                              {ev.type === "Workshop" ? <Ticket size={14} color="var(--eco-c7)" /> : ev.type === "Webinar" ? <Video size={14} color="var(--eco-c9)" /> : <Users size={14} color="var(--eco-c9)" />}
                              <span style={{ color: ev.type === "Workshop" ? "var(--eco-c13)" : ev.type === "Webinar" ? "var(--eco-c13)" : "var(--eco-c13)" }}>{ev.type}</span>
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
                                <div style={{ width: `${Math.min((ev.attendees / ev.maxAttendees) * 100, 100)}%`, height: "100%", background: ev.attendees >= ev.maxAttendees ? "var(--eco-c7)" : "var(--eco-c9)", borderRadius: "999px" }} />
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getEventStatusStyle(ev.status) }}>{ev.status}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button onClick={() => setSelectedEvent(ev)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}>Manage</button>
                              {/* Icon-only: the Action column is already the
                                  first thing to fall off the narrow end of
                                  this table, and a second labelled button
                                  would push Manage out of reach. */}
                              <button onClick={() => setEventToDelete(ev.id)} title="Delete event" aria-label={`Delete ${ev.title}`} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.12)", padding: "5px 8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - Event Tools */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", marginBottom: "16px" }}>Event Tools</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={handleCreateNewEvent} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}>
                      <CalendarDays size={16} /> Create New Event
                    </button>
                    <button onClick={handleGenerateCertificates} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <FileText size={16} /> Generate Certificates
                    </button>
                    <button onClick={handleExportAttendees} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                      <Users size={16} /> Export Attendee List
                    </button>
                  </div>
                </div>

                {/* Upcoming Schedule — derived from the shared events list */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Upcoming Schedule</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {upcomingScheduleEvents.length === 0 && (
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>No upcoming events scheduled.</div>
                    )}
                    {upcomingScheduleEvents.map((ev, idx) => {
                      const dateParts = (ev.date || "").replace(",", "").split(" ");
                      const month = (dateParts[0] || "").slice(0, 3);
                      const day = dateParts[1] || "—";
                      const palette = idx % 2 === 0
                        ? { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" }
                        : { background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)" };
                      return (
                        <div key={ev.id} style={{ display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }} onClick={() => setSelectedEvent(ev)}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", ...palette, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>{month}</span>
                            <span style={{ fontSize: "16px", fontWeight: 800 }}>{day}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{ev.time}{ev.location ? ` • ${ev.location}` : ""}</div>
                          </div>
                        </div>
                      );
                    })}
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
                  <button onClick={handleAddHarvest} style={{ ...styles.textBtn, background: "var(--eco-c9)", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Add Crop</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>Total Crops</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--eco-c13)" }}>{harvests?.length || 0}</div>
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>High Demand</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--eco-c13)" }}>{harvests?.filter(h => h.demand === "High Demand").length || 0}</div>
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.6)", borderRadius: "12px", flex: 1, border: "1px solid rgba(0,0,0,0.05)", minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase" }}>Est. Revenue Opps</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--eco-c13)" }}>₱{((harvests?.length || 0) * 150000).toLocaleString()}</div>
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
                            <AdminEcoDropdown value={editingHarvest.demand} options={[{ value: "High Demand", label: "High Demand" }, { value: "Medium Demand", label: "Medium Demand" }, { value: "Low Demand", label: "Low Demand" }]} onChange={value => setEditingHarvest({...editingHarvest, demand: value})} />
                            <input type="text" value={editingHarvest.priceTrend} onChange={(e) => setEditingHarvest({...editingHarvest, priceTrend: e.target.value})} style={styles.editInput} placeholder="Price Trend" />
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <input type="text" value={editingHarvest.weather} onChange={(e) => setEditingHarvest({...editingHarvest, weather: e.target.value})} style={styles.editInput} placeholder="Weather (e.g. Sunny)" />
                            <input type="text" value={editingHarvest.temp} onChange={(e) => setEditingHarvest({...editingHarvest, temp: e.target.value})} style={styles.editInput} placeholder="Temp (e.g. 20-28°C)" />
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <AdminEcoDropdown value={editingHarvest.water} options={[{ value: "High", label: "High Water" }, { value: "Medium", label: "Medium Water" }, { value: "Low", label: "Low Water" }]} onChange={value => setEditingHarvest({...editingHarvest, water: value})} />
                            <input type="text" value={editingHarvest.soil} onChange={(e) => setEditingHarvest({...editingHarvest, soil: e.target.value})} style={styles.editInput} placeholder="Soil (e.g. Loamy)" />
                            <AdminEcoDropdown value={editingHarvest.pestRisk} options={[{ value: "High", label: "High Pest Risk" }, { value: "Medium", label: "Medium Pest Risk" }, { value: "Low", label: "Low Pest Risk" }]} onChange={value => setEditingHarvest({...editingHarvest, pestRisk: value})} />
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
                            <button onClick={handleSaveHarvest} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px 12px", fontWeight: "bold" }}>Save</button>
                            <button onClick={() => setEditingHarvest(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
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
                            <span style={{ padding: "4px 8px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 700 }}>{h.peak}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <AdminEcoDropdown value={editingHarvest.demand} options={[{ value: "High Demand", label: "High Demand" }, { value: "Medium Demand", label: "Medium Demand" }, { value: "Low Demand", label: "Low Demand" }]} onChange={value => setEditingHarvest({...editingHarvest, demand: value})} />
                              <input type="text" value={editingHarvest.priceTrend} onChange={(e) => setEditingHarvest({...editingHarvest, priceTrend: e.target.value})} style={styles.editInput} placeholder="Price Trend" />
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ padding: "4px 8px", borderRadius: "999px", background: h.demand === "High Demand" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c7-rgb), 0.1)", color: h.demand === "High Demand" ? "var(--eco-c13)" : "var(--eco-c13)", fontSize: "11px", fontWeight: 700, width: "fit-content" }}>{h.demand}</span>
                              <span style={{ color: "var(--eco-c13)", fontWeight: 600, fontSize: "12px" }}>{h.priceTrend}</span>
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingHarvest?.id === h.id && !editingHarvest.isNew ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <input type="text" value={editingHarvest.weather} onChange={(e) => setEditingHarvest({...editingHarvest, weather: e.target.value})} style={styles.editInput} placeholder="Weather (e.g. Sunny)" />
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
                              <AdminEcoDropdown value={editingHarvest.water} options={[{ value: "High", label: "High Water" }, { value: "Medium", label: "Medium Water" }, { value: "Low", label: "Low Water" }]} onChange={value => setEditingHarvest({...editingHarvest, water: value})} />
                              <input type="text" value={editingHarvest.soil} onChange={(e) => setEditingHarvest({...editingHarvest, soil: e.target.value})} style={styles.editInput} placeholder="Soil (e.g. Loamy)" />
                              <AdminEcoDropdown value={editingHarvest.pestRisk} options={[{ value: "High", label: "High Pest Risk" }, { value: "Medium", label: "Medium Pest Risk" }, { value: "Low", label: "Low Pest Risk" }]} onChange={value => setEditingHarvest({...editingHarvest, pestRisk: value})} />
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{h.water} | {h.soil}</div>
                              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}><Bug size={11} style={{ verticalAlign: "middle" }} /> Pest: <span style={{ color: h.pestRisk === 'High' ? 'var(--eco-c13)' : h.pestRisk === 'Medium' ? 'var(--eco-c13)' : 'var(--eco-c13)' }}>{h.pestRisk}</span></div>
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
                                  <div style={{ width: `${h.growthProgress}%`, height: "100%", background: "var(--eco-c9)", borderRadius: "999px" }} />
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
                              <button onClick={handleSaveHarvest} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontWeight: "bold" }}>Save</button>
                              <button onClick={() => setEditingHarvest(null)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><X size={14} /></button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleEditHarvest(h)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)" }}><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteHarvest(h.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><Trash2 size={14} /></button>
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "160px" }}><AdminEcoDropdown value={scanStatusFilter} options={[{ value: "All", label: "All Statuses" }, { value: "Healthy", label: "Healthy" }, { value: "Disease Detected", label: "Disease Detected" }, { value: "Critical", label: "Critical" }, { value: "Under Review", label: "Under Review" }, { value: "Resolved", label: "Resolved" }]} onChange={setScanStatusFilter} compact align="right" /></div>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "720px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Scan ID</th>
                        <th style={styles.th}>Photo</th>
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
                          {/* The member's uploaded photo, so the queue is
                              scannable by eye before anyone opens a row. Seed
                              rows carry no photo and show the leaf mark. */}
                          <td style={styles.td}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", background: "rgba(var(--eco-c9-rgb), 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {scan.image
                                ? <img src={scan.image} alt={`Scan ${scan.id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <Leaf size={16} color="var(--eco-c9)" />}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 700, fontSize: "13px" }}>{scan.plant}</span>
                              <span style={{ fontSize: "11px", color: scan.disease === "None" ? "var(--eco-c13)" : "var(--eco-c13)", fontWeight: 600 }}>{scan.disease}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 800 }}>{scan.confidence}</span>
                              <div style={{ width: "40px", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}>
                                <div style={{ width: scan.confidence, height: "100%", background: parseInt(scan.confidence) > 90 ? "var(--eco-c9)" : "var(--eco-c7)", borderRadius: "999px" }} />
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, ...getScanStatusStyle(scan.status) }}>{scan.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedScan(scan)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><Eye size={12} style={{ marginRight: "4px" }} /> View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column - AI Insights & Database */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.1), rgba(var(--eco-c7-rgb), 0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", marginBottom: "16px" }}>AI System Status</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.3)" }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>Neural Engine Active</div>
                      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>V.2.4 (Philippine Climate Model)</div>
                    </div>
                  </div>
                  <button onClick={() => setToastMessage("AI models are up to date (v2.4 — Philippine Climate Model)")} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#fff", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", color: "var(--eco-c13)", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><RefreshCcw size={14} /> Update AI Models</button>
                </div>

                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "4px" }}>Disease Library</h3>
                  <p style={{ margin: "0 0 14px", fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Entries here power every diagnosis users receive in the AI Plant Doctor.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plantDiseases.length === 0 && (
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)", textAlign: "center", padding: "12px" }}>No diseases yet. Add one below.</div>
                    )}
                    {plantDiseases.map((disease) => (
                      <div key={disease.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ minWidth: 0 }}><div style={{ fontSize: "13px", fontWeight: 700 }}>{disease.name}</div><div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>{disease.crop} · {disease.confidence}</div></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: disease.severity === "High" ? "var(--eco-c13)" : disease.severity === "Low" ? "var(--eco-c13)" : "var(--eco-c13)", padding: "2px 6px", borderRadius: "4px", background: disease.severity === "High" ? "rgba(var(--eco-c9-rgb), 0.1)" : disease.severity === "Low" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c7-rgb), 0.1)" }}>{disease.severity}</span>
                          <button onClick={() => handleDeleteDisease(disease.id)} title="Delete disease" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Add Disease</div>
                    <input type="text" placeholder="Condition name (e.g. Leaf Spot)" value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    <input type="text" placeholder="Affected plant (e.g. Tomato)" value={diseaseForm.plant} onChange={e => setDiseaseForm({ ...diseaseForm, plant: e.target.value })} style={{ ...styles.editInput, ...ecoGlassInputStyle }} />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}><AdminEcoDropdown value={diseaseForm.severity} options={[{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }]} onChange={(v) => setDiseaseForm({ ...diseaseForm, severity: v })} compact /></div>
                      <input type="text" placeholder="Confidence" value={diseaseForm.confidence} onChange={e => setDiseaseForm({ ...diseaseForm, confidence: e.target.value })} style={{ ...styles.editInput, ...ecoGlassInputStyle, width: "90px", flexShrink: 0 }} />
                    </div>
                    <textarea placeholder="Care recommendations (one per line)" rows={3} value={diseaseForm.recommendation} onChange={e => setDiseaseForm({ ...diseaseForm, recommendation: e.target.value })} style={{ ...styles.editInput, ...ecoGlassInputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.4 }} />
                    <button onClick={handleAddDisease} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "var(--eco-c9)", border: "none", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Plus size={14} /> Add to Library</button>
                  </div>
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
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
                    <div style={{ width: "150px" }}><StaticEcoDropdown options={[{ value: "Last 30 Days", label: "Last 30 Days" }, { value: "Last Quarter", label: "Last Quarter" }, { value: "Year to Date", label: "Year to Date" }]} compact align="right" /></div>
                  </div>
                  <div style={{ width: "100%", height: "220px", overflow: "visible" }}>
                    <svg viewBox="0 0 600 220" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="mainRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(var(--eco-c7-rgb), 0.3)" />
                          <stop offset="100%" stopColor="rgba(var(--eco-c7-rgb), 0)" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      {[0, 50, 100, 150, 200].map(y => (
                        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      ))}
                      {/* Data Path */}
                      <path d="M 0 200 L 0 150 C 50 140, 100 180, 150 120 S 250 130, 300 80 S 400 90, 450 40 S 550 50, 600 10 L 600 200 Z" fill="url(#mainRevGrad)" />
                      <path d="M 0 150 C 50 140, 100 180, 150 120 S 250 130, 300 80 S 400 90, 450 40 S 550 50, 600 10" fill="none" stroke="var(--eco-c7)" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="600" cy="10" r="6" fill="#fff" stroke="var(--eco-c7)" strokeWidth="3" />
                    </svg>
                  </div>
                </div>

                {/* Smart AI Insights */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.08), rgba(var(--eco-c7-rgb), 0.02))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <Zap size={20} color="var(--eco-c7)" fill="rgba(var(--eco-c7-rgb), 0.2)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)" }}>Smart AI Insights</h3>
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
                          <div style={{ width: "100%", height: h, background: "linear-gradient(0deg, var(--eco-c7), var(--eco-c6))", borderRadius: "6px" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                    <h3 style={{ ...styles.cardHeading, fontSize: "15px", marginBottom: "16px" }}>Delivery Success</h3>
                    <div style={{ position: "relative", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "conic-gradient(var(--eco-c9) 0% 92%, #e2e8f0 92% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "var(--eco-c13)" }}>92%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Eco Impact Dashboard */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.08), rgba(var(--eco-c9-rgb), 0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><Leaf size={18} /> Eco Impact Tracking</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Organic Products Sold</span> <span style={{ color: "var(--eco-c13)" }}>15,240</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "85%", height: "100%", background: "var(--eco-c9)", borderRadius: "999px" }} /></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Farmers Supported</span> <span style={{ color: "var(--eco-c13)" }}>3,500</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "70%", height: "100%", background: "var(--eco-c9)", borderRadius: "999px" }} /></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}><span>Waste Reduced</span> <span style={{ color: "var(--eco-c13)" }}>1.5 Tons</span></div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "999px" }}><div style={{ width: "45%", height: "100%", background: "var(--eco-c9)", borderRadius: "999px" }} /></div>
                    </div>
                  </div>
                </div>

                {/* Regional Performance */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><Globe size={18} color="var(--eco-c9)" /> Regional Performance</h3>
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
                    <button onClick={() => setToastMessage("Generating full PDF report…")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}><Download size={16}/> Export Full PDF</button>
                    <button onClick={() => downloadCSV("analytics-raw.csv", orders)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}><FileText size={16}/> Download Raw CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "EcoPoints & Rewards" ? (
          <div style={styles.dashboardContainer}>
            <div style={styles.statsGrid}>
              {/* Catalog size on its own says nothing about whether the program
                  is working. With Supabase connected these flip to the real
                  economy: what members hold, what they have actually spent, and
                  what is waiting to be fulfilled. */}
              {(economy ? [
                { label: "Points in Circulation", value: economy.circulating.toLocaleString(), trend: "held by members", up: true, icon: <Gift size={16} color="var(--eco-c11)" /> },
                { label: "Issued (30 days)", value: economy.issued30d.toLocaleString(), trend: `${economy.issued.toLocaleString()} all time`, up: true, icon: <Zap size={16} color="#f59e0b" /> },
                { label: "Redeemed (30 days)", value: economy.spent30d.toLocaleString(), trend: `${economy.burnRate}% of all issued`, up: true, icon: <Trophy size={16} color="#0284c7" /> },
                { label: "Awaiting Fulfilment", value: String(pendingRedemptionCount), trend: `${redemptions.length} redemptions total`, up: true, icon: <Package size={16} color="#8b5cf6" /> },
              ] : [
                { label: "Active Rewards", value: String(ecoList("rewards").filter(r => r.active !== false).length), trend: "in the marketplace", up: true, icon: <Gift size={16} color="var(--eco-c11)" /> },
                { label: "Earn Rules", value: String(ecoList("earnRules").length), trend: "ways to collect", up: true, icon: <Zap size={16} color="#f59e0b" /> },
                { label: "Eco Tiers", value: String(ecoList("tiers").length), trend: "membership levels", up: true, icon: <Trophy size={16} color="#0284c7" /> },
                { label: "Badges", value: String(ecoList("badges").length), trend: "achievements", up: true, icon: <Award size={16} color="#8b5cf6" /> },
              ]).map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>
                      <TrendingUp size={10} /> {stat.trend}
                    </span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Rewards Marketplace */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "6px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Gift size={18} color="var(--eco-c9)" /> Rewards Marketplace</h3>
                <button onClick={() => addEcoItem("rewards", { title: "New Reward", shortTitle: "New Reward", description: "", points: 500, badge: "", icon: "Gift", active: true, featured: false, stock: null, limitPerUser: 0 })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                  <Plus size={14} /> Add Reward
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>These cards are what users redeem their EcoPoints for. Deactivate a reward to hide it without deleting it. Stock and per-member limits are enforced when someone redeems, not just displayed.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                {ecoList("rewards").map((reward) => {
                  const claimed = rewardClaimCounts[reward.id] || 0;
                  const stock = reward.stock === null || reward.stock === undefined || reward.stock === "" ? null : Number(reward.stock);
                  const soldOut = stock !== null && stock > 0 && claimed >= stock;
                  return (
                  <div key={reward.id} style={{ padding: "16px", borderRadius: "14px", border: `1px solid ${soldOut ? "rgba(var(--eco-c9-rgb), 0.35)" : "rgba(0,0,0,0.08)"}`, background: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: "10px", opacity: reward.active === false ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>{ecoIcon(reward.icon, 20)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* What this reward has actually done, next to the
                            fields that control it. */}
                        <span style={{ fontSize: "11px", fontWeight: 700, color: soldOut ? "var(--eco-c13)" : "rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>
                          {claimed.toLocaleString()} claimed{stock !== null && stock > 0 ? ` / ${stock.toLocaleString()}` : ""}
                        </span>
                        <button onClick={() => removeEcoItem("rewards", reward.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontSize: "11px", fontWeight: 700 }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <label style={ecoFieldLabel}>Title
                      <input value={reward.title || ""} onChange={(e) => updateEcoItem("rewards", reward.id, { title: e.target.value })} style={ecoFieldInput} />
                    </label>
                    <label style={ecoFieldLabel}>Short title (mobile)
                      <input value={reward.shortTitle || ""} onChange={(e) => updateEcoItem("rewards", reward.id, { shortTitle: e.target.value })} style={ecoFieldInput} />
                    </label>
                    <label style={ecoFieldLabel}>Description
                      <textarea value={reward.description || ""} placeholder="What the member actually gets" onChange={(e) => updateEcoItem("rewards", reward.id, { description: e.target.value })} style={{ ...ecoFieldInput, height: "56px", resize: "none", fontFamily: "inherit" }} />
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label style={ecoFieldLabel}>Cost (pts)
                        <input type="number" value={reward.points ?? 0} onChange={(e) => updateEcoItem("rewards", reward.id, { points: Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                      <label style={ecoFieldLabel}>Tag
                        <input value={reward.badge || ""} onChange={(e) => updateEcoItem("rewards", reward.id, { badge: e.target.value })} style={ecoFieldInput} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label style={ecoFieldLabel}>Total stock
                        <input type="number" min="0" value={reward.stock ?? ""} placeholder="Unlimited" onChange={(e) => updateEcoItem("rewards", reward.id, { stock: e.target.value === "" ? null : Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                      <label style={ecoFieldLabel}>Limit per member
                        <input type="number" min="0" value={reward.limitPerUser || ""} placeholder="No limit" onChange={(e) => updateEcoItem("rewards", reward.id, { limitPerUser: e.target.value === "" ? 0 : Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                    </div>
                    <label style={ecoFieldLabel}>Icon
                      <div style={{ marginTop: "4px" }}><AdminEcoDropdown value={reward.icon || "Gift"} options={ecoIconOptions} onChange={(val) => updateEcoItem("rewards", reward.id, { icon: val })} compact /></div>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.65)" }}>
                      <input type="checkbox" checked={reward.active !== false} onChange={(e) => updateEcoItem("rewards", reward.id, { active: e.target.checked })} />
                      Visible on the user dashboard
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.65)" }}>
                      <input type="checkbox" checked={Boolean(reward.featured)} onChange={(e) => updateEcoItem("rewards", reward.id, { featured: e.target.checked })} />
                      Feature it first in the marketplace
                    </label>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Member balances — the only place the team can correct someone's
                points. Every change is written by eco_adjust() and lands in
                that member's Earn History, so nothing moves untraceably. */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "6px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Users size={18} color="var(--eco-c9)" /> Member Balances</h3>
                <input
                  value={balanceSearch}
                  onChange={(e) => setBalanceSearch(e.target.value)}
                  placeholder="Search members…"
                  style={{ ...ecoFieldInput, maxWidth: "220px" }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>Credit a member for something the site couldn't award automatically, or claw back points issued in error. Every adjustment is logged with your reason and shows on their Earn History.</p>

              {!supabaseReady ? (
                <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.08)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", fontSize: "13px", color: "var(--eco-c12)" }}>
                  Connect Supabase to see and adjust member balances (see BACKEND_SETUP.md).
                </div>
              ) : visibleBalances.length === 0 ? (
                <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.03)", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  {redemptionsLoading ? "Loading members…" : balanceSearch ? "No member matches that search." : "No members yet."}
                </div>
              ) : (
                <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px", overflowY: "auto", paddingRight: "6px" }}>
                  {visibleBalances.map((member) => (
                    <div key={member.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                        <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>{member.name}</div>
                          <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)" }}>{member.role} · {member.tier}</div>
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--eco-c13)", whiteSpace: "nowrap" }}>{member.points.toLocaleString()} pts</span>
                        <button
                          onClick={() => {
                            setAdjustTarget(adjustTarget?.id === member.id ? null : member);
                            setAdjustReason("");
                          }}
                          style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px 14px", fontSize: "11px", fontWeight: 700 }}
                        >
                          {adjustTarget?.id === member.id ? "Close" : "Adjust"}
                        </button>
                      </div>

                      {adjustTarget?.id === member.id && (
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          <label style={{ ...ecoFieldLabel, width: "110px" }}>Points
                            <input type="number" min="0" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} style={ecoFieldInput} />
                          </label>
                          <label style={{ ...ecoFieldLabel, flex: "1 1 200px" }}>Reason (shown to the member)
                            <input value={adjustReason} placeholder="e.g. Workshop attendance credited manually" onChange={(e) => setAdjustReason(e.target.value)} style={ecoFieldInput} />
                          </label>
                          <button
                            onClick={() => handleAdjustPoints("credit")}
                            disabled={adjustBusy}
                            style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.14)", padding: "9px 16px", fontSize: "12px", fontWeight: 700, cursor: adjustBusy ? "not-allowed" : "pointer", opacity: adjustBusy ? 0.5 : 1 }}
                          >
                            <Plus size={12} /> Credit
                          </button>
                          <button
                            onClick={() => handleAdjustPoints("debit")}
                            disabled={adjustBusy}
                            style={{ ...styles.actionBtn, color: "rgba(0,0,0,0.6)", background: "rgba(0,0,0,0.05)", padding: "9px 16px", fontSize: "12px", fontWeight: 700, cursor: adjustBusy ? "not-allowed" : "pointer", opacity: adjustBusy ? 0.5 : 1 }}
                          >
                            <TrendingDown size={12} /> Debit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redemption fulfilment queue — real user records, not admin content */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "6px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Package size={18} color="var(--eco-c9)" /> Redemptions</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "150px" }}>
                    <AdminEcoDropdown
                      value={redemptionFilter}
                      options={["All", ...REDEMPTION_FILTERS].map((s) => ({ value: s, label: s === "All" ? "All statuses" : s }))}
                      onChange={setRedemptionFilter}
                      compact
                      align="right"
                    />
                  </div>
                  <button onClick={loadRedemptions} disabled={!supabaseReady || redemptionsLoading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: supabaseReady && !redemptionsLoading ? "pointer" : "not-allowed", opacity: supabaseReady && !redemptionsLoading ? 1 : 0.5 }}>
                    <RefreshCcw size={14} /> {redemptionsLoading ? "Loading…" : "Refresh"}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>Rewards users have actually spent their EcoPoints on. Move each one along as you fulfil it — the status shows on the member's Redeem History.</p>

              {!supabaseReady ? (
                <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.08)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", fontSize: "13px", color: "var(--eco-c12)" }}>
                  Connect Supabase to see redemptions. Until then EcoPoints run per-browser and nothing is recorded centrally (see BACKEND_SETUP.md).
                </div>
              ) : redemptionsError ? (
                <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.08)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontSize: "13px", color: "var(--eco-c12)" }}>{redemptionsError}</div>
              ) : visibleRedemptions.length === 0 ? (
                <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.03)", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  {redemptionsLoading ? "Loading redemptions…" : "No redemptions yet."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {visibleRedemptions.map((row) => {
                    // A cancelled row is settled: the points went back, so the
                    // status dropdown would only let someone un-refund it.
                    const cancelled = row.status === "Cancelled";
                    return (
                    <div key={row.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", opacity: cancelled ? 0.6 : 1 }}>
                      <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Gift size={18} color="var(--eco-c9)" /></span>
                      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(0,0,0,0.8)", textDecoration: cancelled ? "line-through" : "none" }}>{row.reward}</div>
                        <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)" }}>{row.userName} · {row.date}</div>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--eco-c13)", whiteSpace: "nowrap" }}>
                        {cancelled ? `+${row.points.toLocaleString()} refunded` : `-${row.points.toLocaleString()} pts`}
                      </span>
                      {cancelled ? (
                        <span style={{ width: "130px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>Cancelled</span>
                      ) : (
                        <>
                          <div style={{ width: "130px" }}>
                            <AdminEcoDropdown
                              value={row.status}
                              options={REDEMPTION_STATUSES.map((s) => ({ value: s, label: s }))}
                              onChange={(val) => setRedemptionStatus(row.id, val)}
                              compact
                              align="right"
                            />
                          </div>
                          <button
                            onClick={() => handleCancelRedemption(row)}
                            title="Cancel this redemption and refund the points"
                            style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "8px 12px", fontSize: "11px", fontWeight: 700 }}
                          >
                            <XCircle size={12} /> Refund
                          </button>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
              {/* How to Earn */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Zap size={16} color="var(--eco-c7)" /> How to Earn</h3>
                  <button onClick={() => addEcoItem("earnRules", { action: "New Action", shortAction: "New Action", points: 25, icon: "Leaf" })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    <Plus size={13} /> Add Rule
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 12px" }}>The action name is the key the website sends when the activity happens — an action with no rule here earns nothing, so rename with care.</p>
                <label style={{ ...ecoFieldLabel, display: "block", marginBottom: "16px" }}>Checkout rate (points per ₱1 spent)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ecoProgram.earnRate ?? defaultEcoProgram.earnRate}
                    onChange={(e) => setEcoProgram((prev) => ({ ...prev, earnRate: Number(e.target.value) }))}
                    style={{ ...ecoFieldInput, maxWidth: "160px" }}
                  />
                  <span style={{ display: "block", marginTop: "4px", fontSize: "11px", fontWeight: 500, color: "rgba(0,0,0,0.45)" }}>
                    0.1 = 1 point per ₱10. A ₱{(1000).toLocaleString()} order earns {Math.floor(1000 * Number(ecoProgram.earnRate ?? defaultEcoProgram.earnRate))} pts.
                  </span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ecoList("earnRules").map((rule) => (
                    <div key={rule.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-end", gap: "10px" }}>
                      <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(var(--eco-c7-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ecoIcon(rule.icon, 18, "var(--eco-c11)")}</span>
                      <label style={{ ...ecoFieldLabel, flex: 2 }}>Action
                        <input value={rule.action || ""} onChange={(e) => updateEcoItem("earnRules", rule.id, { action: e.target.value })} style={ecoFieldInput} />
                      </label>
                      <label style={{ ...ecoFieldLabel, width: "80px" }}>Points
                        <input type="number" value={rule.points ?? 0} onChange={(e) => updateEcoItem("earnRules", rule.id, { points: Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                      <div style={{ width: "120px" }}><AdminEcoDropdown value={rule.icon || "Leaf"} options={ecoIconOptions} onChange={(val) => updateEcoItem("earnRules", rule.id, { icon: val })} compact align="right" /></div>
                      <button onClick={() => removeEcoItem("earnRules", rule.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "8px 10px", fontSize: "11px", fontWeight: 700 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Award size={16} color="var(--eco-c7)" /> Achievement Badges</h3>
                  <button onClick={() => addEcoItem("badges", { name: "New Badge", icon: "Star", threshold: 1000 })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    <Plus size={13} /> Add Badge
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>A badge unlocks once the user's balance reaches its threshold.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ecoList("badges").map((badge) => (
                    <div key={badge.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-end", gap: "10px" }}>
                      <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(var(--eco-c7-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ecoIcon(badge.icon, 18, "var(--eco-c9)")}</span>
                      <label style={{ ...ecoFieldLabel, flex: 2 }}>Name
                        <input value={badge.name || ""} onChange={(e) => updateEcoItem("badges", badge.id, { name: e.target.value })} style={ecoFieldInput} />
                      </label>
                      <label style={{ ...ecoFieldLabel, width: "90px" }}>Unlock at
                        <input type="number" value={badge.threshold ?? 0} onChange={(e) => updateEcoItem("badges", badge.id, { threshold: Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                      <div style={{ width: "120px" }}><AdminEcoDropdown value={badge.icon || "Star"} options={ecoIconOptions} onChange={(val) => updateEcoItem("badges", badge.id, { icon: val })} compact align="right" /></div>
                      <button onClick={() => removeEcoItem("badges", badge.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "8px 10px", fontSize: "11px", fontWeight: 700 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Eco Tiers */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Trophy size={18} color="var(--eco-c9)" /> Eco Tier Levels</h3>
                <button onClick={() => addEcoItem("tiers", { title: "New Tier", min: 0, max: 999, benefits: [] })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                  <Plus size={14} /> Add Tier
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>Drives the "Eco Level" badge and progress bar on the user dashboard. Leave the max blank for the top tier.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                {[...ecoList("tiers")].sort((a, b) => (a.min || 0) - (b.min || 0)).map((tier) => (
                  <div key={tier.id} style={{ padding: "16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--eco-c13)" }}>{tierRangeLabel(tier)}</span>
                      <button onClick={() => removeEcoItem("tiers", tier.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "4px 10px", fontSize: "11px", fontWeight: 700 }}><Trash2 size={12} /></button>
                    </div>
                    <label style={ecoFieldLabel}>Tier name
                      <input value={tier.title || ""} onChange={(e) => updateEcoItem("tiers", tier.id, { title: e.target.value })} style={ecoFieldInput} />
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label style={ecoFieldLabel}>From (pts)
                        <input type="number" value={tier.min ?? 0} onChange={(e) => updateEcoItem("tiers", tier.id, { min: Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                      <label style={ecoFieldLabel}>To (pts)
                        <input type="number" value={tier.max ?? ""} placeholder="No limit" onChange={(e) => updateEcoItem("tiers", tier.id, { max: e.target.value === "" ? null : Number(e.target.value) })} style={ecoFieldInput} />
                      </label>
                    </div>
                    <label style={ecoFieldLabel}>Benefits (one per line)
                      <textarea value={(tier.benefits || []).join("\n")} onChange={(e) => updateTierBenefits(tier.id, e.target.value)} style={{ ...ecoFieldInput, height: "70px", resize: "none", fontFamily: "inherit" }} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
              {/* Community Impact */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Globe size={16} color="var(--eco-c9)" /> Community Impact</h3>
                  <button onClick={() => addEcoItem("impactStats", { label: "New Stat", shortLabel: "New Stat", value: "0", icon: "Leaf" })} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    <Plus size={13} /> Add Stat
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>The impact figures shown on the user's EcoPoints dashboard.</p>
                <label style={{ ...ecoFieldLabel, display: "block", marginBottom: "16px" }}>Impact headline
                  <input
                    value={ecoProgram.impactQuote ?? defaultEcoProgram.impactQuote}
                    onChange={(e) => setEcoProgram((prev) => ({ ...prev, impactQuote: e.target.value }))}
                    style={ecoFieldInput}
                  />
                  <span style={{ display: "block", marginTop: "4px", fontSize: "11px", fontWeight: 500, color: "rgba(0,0,0,0.45)" }}>
                    The quoted line under the figures, and what members share when they tap Share.
                  </span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ecoList("impactStats").map((stat) => (
                    <div key={stat.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-end", gap: "10px" }}>
                      <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ecoIcon(stat.icon, 18)}</span>
                      <label style={{ ...ecoFieldLabel, flex: 2 }}>Label
                        <input value={stat.label || ""} onChange={(e) => updateEcoItem("impactStats", stat.id, { label: e.target.value })} style={ecoFieldInput} />
                      </label>
                      <label style={{ ...ecoFieldLabel, width: "80px" }}>Value
                        <input value={stat.value || ""} onChange={(e) => updateEcoItem("impactStats", stat.id, { value: e.target.value })} style={ecoFieldInput} />
                      </label>
                      <div style={{ width: "120px" }}><AdminEcoDropdown value={stat.icon || "Leaf"} options={ecoIconOptions} onChange={(val) => updateEcoItem("impactStats", stat.id, { icon: val })} compact align="right" /></div>
                      <button onClick={() => removeEcoItem("impactStats", stat.id)} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "8px 10px", fontSize: "11px", fontWeight: 700 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral Program */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "8px" }}><Megaphone size={16} color="var(--eco-c9)" /> Referral Program</h3>
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>The code and copy shown in the user's Referral Program card and share links.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={ecoFieldLabel}>Referral code
                      <input value={(ecoProgram.referral || {}).code || ""} onChange={(e) => updateEcoReferral({ code: e.target.value })} style={ecoFieldInput} />
                    </label>
                    <label style={ecoFieldLabel}>Bonus points
                      <input type="number" value={(ecoProgram.referral || {}).points ?? 0} onChange={(e) => updateEcoReferral({ points: Number(e.target.value) })} style={ecoFieldInput} />
                    </label>
                  </div>
                  <label style={ecoFieldLabel}>Headline
                    <input value={(ecoProgram.referral || {}).headline || ""} onChange={(e) => updateEcoReferral({ headline: e.target.value })} style={ecoFieldInput} />
                  </label>
                  <label style={ecoFieldLabel}>Description
                    <textarea value={(ecoProgram.referral || {}).blurb || ""} onChange={(e) => updateEcoReferral({ blurb: e.target.value })} style={{ ...ecoFieldInput, height: "80px", resize: "none", fontFamily: "inherit" }} />
                  </label>
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
                    <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <Filter size={14} style={{ color: "rgba(0,0,0,0.4)" }} />
                      <div style={{ width: "150px" }}><AdminEcoDropdown value={contentTypeFilter} options={[{ value: "All", label: "All Types" }, { value: "Article", label: "Article" }, { value: "Page", label: "Page" }, { value: "Announcement", label: "Announcement" }, { value: "Tutorial", label: "Tutorial" }, { value: "Component", label: "Component" }]} onChange={setContentTypeFilter} compact align="right" /></div>
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
                            <button onClick={() => setEditingContent({ ...cnt, body: cnt.body || "" })} style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "4px 12px", fontWeight: "bold", fontSize: "11px" }}><Edit2 size={12} style={{ marginRight: "4px" }} /> Edit</button>
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
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.1), rgba(var(--eco-c7-rgb), 0.02))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Wand2 size={18} color="var(--eco-c9)" />
                    <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", margin: 0 }}>AI Content Generator</h3>
                  </div>
                  <textarea 
                    placeholder="e.g. Write a 500-word article about the benefits of organic fertilizers in urban farming..." 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "12px", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", background: "rgba(255,255,255,0.8)", fontSize: "12px", resize: "none", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <button onClick={() => setToastMessage(aiPrompt.trim() ? "Generating content from your prompt…" : "Enter a prompt above to generate content.")} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.3)" }}>
                    Generate Content
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "16px" }}>Quick Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => handleAddContent("Article", "Draft")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Edit2 size={16} /> Create New Article</button>
                    <button onClick={() => setToastMessage("Opening homepage editor…")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Layout size={16} /> Edit Homepage</button>
                    <button onClick={() => handleAddContent("Announcement", "Published")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}><Megaphone size={16} /> Post Announcement</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Media Library */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}><Image size={18} color="var(--eco-c7)"/> Media Library</h3>
                <button onClick={() => setToastMessage("Media upload dialog opened")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
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
        ) : activeTab === "Community Forum" ? (
          <div style={styles.dashboardContainer}>
            {/* Forum Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total Posts", value: forumPosts.length, icon: <MessageSquare size={18} color="var(--eco-c9)" /> },
                { label: "Total Replies", value: forumReplies.length, icon: <MessageSquare size={18} color="#0ea5e9" /> },
                { label: "Pinned / Official", value: forumPosts.filter((p) => p.pinned || p.official).length, icon: <Star size={18} color="#f59e0b" /> },
                { label: "Awaiting Review", value: moderationQueue.length, icon: <Flag size={18} color="#dc2626" /> },
                { label: "Hidden as Spam", value: hiddenForumCount, icon: <EyeOff size={18} color="rgba(0,0,0,0.45)" /> },
              ].map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Reports raised by members. Acting on an item clears it from here. */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px", border: moderationQueue.length ? "1px solid rgba(220,38,38,0.28)" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <ShieldAlert size={18} color={moderationQueue.length ? "#dc2626" : "var(--eco-c9)"} />
                <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0 }}>Moderation Queue</h3>
                {moderationQueue.length > 0 && (
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#fff", background: "#dc2626", padding: "3px 8px", borderRadius: "999px" }}>
                    {moderationQueue.length} NEED{moderationQueue.length === 1 ? "S" : ""} REVIEW
                  </span>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>
                Content members flagged as spam, abusive, or misleading. Hiding removes it from the public feed but keeps it here; deleting is permanent.
              </p>

              {moderationQueue.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.06)", color: "var(--eco-c13)", fontSize: "13px", fontWeight: 600 }}>
                  <CheckCircle size={16} /> Nothing reported — the community feed is clear.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" }}>
                  {moderationQueue.map((item) => {
                    const target = item.kind === "post" ? item.post : item.reply;
                    const reasons = [...new Set((target.reports || []).map((r) => r.reason))].join(", ");
                    return (
                      <div key={`${item.kind}-${item.post.id}-${item.idx ?? "p"}`} style={{ borderRadius: "12px", border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)", padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px", color: "#fff", background: "#dc2626", padding: "2px 7px", borderRadius: "999px" }}>
                            {reportCount(target)} REPORT{reportCount(target) === 1 ? "" : "S"}
                          </span>
                          <span style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px", color: "rgba(0,0,0,0.55)", background: "rgba(0,0,0,0.06)", padding: "2px 7px", borderRadius: "999px" }}>
                            {item.kind === "post" ? "POST" : "REPLY"}
                          </span>
                          <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.55)" }}>{reasons}</span>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                          {item.kind === "post" ? item.post.title : `Reply by ${item.reply.author}`}
                        </div>
                        <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.65)", margin: "4px 0 10px", lineHeight: 1.5 }}>
                          {(item.kind === "post" ? item.post.body : item.reply.body).slice(0, 220)}
                        </p>
                        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", marginBottom: "10px" }}>
                          {item.kind === "post"
                            ? `${item.post.author} · ${item.post.category}`
                            : `on “${item.post.title}”`}
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => (item.kind === "post" ? handleDismissPostReports(item.post.id) : handleDismissReplyReports(item.post.id, item.idx))}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "rgba(0,0,0,0.65)", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                          >
                            <CheckCircle size={13} /> Keep
                          </button>
                          <button
                            onClick={() => (item.kind === "post" ? handleToggleHidePost(item.post.id, "Spam") : handleToggleHideReply(item.post.id, item.idx, "Spam"))}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.05)", color: "#0f172a", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                          >
                            <EyeOff size={13} /> Mark spam
                          </button>
                          <button
                            onClick={() => (item.kind === "post" ? handleDeleteForumPost(item.post.id) : handleDeleteForumReply(item.post.id, item.idx))}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "999px", border: "none", background: "#dc2626", color: "#fff", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px", alignItems: "start" }}>
              {/* Publish official post */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Megaphone size={18} color="var(--eco-c9)" />
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0 }}>Publish Official Post</h3>
                </div>
                <input
                  type="text"
                  placeholder="Post title"
                  value={forumDraft.title}
                  onChange={(e) => setForumDraft({ ...forumDraft, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "13px", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                <textarea
                  placeholder="Write an announcement or guidance for the community..."
                  value={forumDraft.body}
                  onChange={(e) => setForumDraft({ ...forumDraft, body: e.target.value })}
                  style={{ width: "100%", height: "110px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "13px", resize: "none", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                <div style={{ marginBottom: "14px" }}><AdminEcoDropdown value={forumDraft.category} options={forumCategories.map(c => ({ value: c, label: c }))} onChange={value => setForumDraft({ ...forumDraft, category: value })} /></div>
                <button
                  onClick={handlePublishOfficialPost}
                  style={{ width: "100%", padding: "11px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.3)" }}
                >
                  <Send size={15} /> Publish to Community
                </button>
              </div>

              {/* Moderation list */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", margin: 0 }}>Community Posts ({filteredForumPosts.length})</h3>
                  <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "280px" }}>
                    <Search size={14} color="rgba(0,0,0,0.35)" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      placeholder="Search posts, authors, replies…"
                      value={forumSearch}
                      onChange={(e) => setForumSearch(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.85)", fontSize: "12.5px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {[
                    { key: "All", count: forumPosts.length },
                    { key: "Reported", count: forumPosts.filter((p) => reportCount(p) > 0 || (p.replies || []).some((r) => reportCount(r) > 0)).length },
                    { key: "Hidden", count: forumPosts.filter((p) => p.hidden || (p.replies || []).some((r) => r.hidden)).length },
                    { key: "Official", count: forumPosts.filter((p) => p.official || p.pinned).length },
                    { key: "Locked", count: forumPosts.filter((p) => p.locked).length },
                  ].map(({ key, count }) => (
                    <button
                      key={key}
                      onClick={() => setForumFilter(key)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px",
                        border: forumFilter === key ? "1px solid transparent" : "1px solid rgba(0,0,0,0.1)",
                        background: forumFilter === key ? "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))" : "rgba(255,255,255,0.7)",
                        color: forumFilter === key ? "#fff" : "rgba(0,0,0,0.6)",
                        fontSize: "11.5px", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {key}
                      <span style={{ padding: "1px 6px", borderRadius: "999px", background: forumFilter === key ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)", fontSize: "10.5px" }}>{count}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "620px", overflowY: "auto" }}>
                  {filteredForumPosts.length === 0 && <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "13px" }}>No posts match this filter.</p>}
                  {filteredForumPosts.map((post) => (
                    <div key={post.id} style={{ borderRadius: "12px", border: post.hidden ? "1px dashed rgba(0,0,0,0.22)" : reportCount(post) > 0 ? "1px solid rgba(220,38,38,0.28)" : "1px solid rgba(0,0,0,0.08)", background: post.hidden ? "rgba(0,0,0,0.05)" : post.official ? "rgba(var(--eco-c9-rgb), 0.06)" : "rgba(0,0,0,0.02)", padding: "14px", opacity: post.hidden ? 0.72 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
                            {post.title}
                            {post.official && <span style={{ marginLeft: "7px", fontSize: "9px", fontWeight: 800, color: "#fff", background: "var(--eco-c9)", padding: "2px 6px", borderRadius: "999px" }}>OFFICIAL</span>}
                            {post.pinned && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.15)", padding: "2px 6px", borderRadius: "999px" }}>PINNED</span>}
                            {post.locked && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "rgba(0,0,0,0.6)", background: "rgba(0,0,0,0.08)", padding: "2px 6px", borderRadius: "999px" }}>LOCKED</span>}
                            {post.hidden && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "2px 6px", borderRadius: "999px" }}>HIDDEN · {(post.hiddenReason || "SPAM").toUpperCase()}</span>}
                            {reportCount(post) > 0 && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "#fff", background: "#dc2626", padding: "2px 6px", borderRadius: "999px" }}>{reportCount(post)} REPORTED</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{post.author} · {post.category} · {post.time} · {post.likes || 0} likes</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => handleTogglePinPost(post.id)} title={post.pinned ? "Unpin" : "Pin to top"} style={{ ...styles.actionBtn, color: post.pinned ? "var(--eco-c13)" : "rgba(0,0,0,0.5)", background: post.pinned ? "rgba(var(--eco-c7-rgb), 0.12)" : "rgba(0,0,0,0.04)", padding: "5px 8px" }}><Star size={13} /></button>
                          <button onClick={() => handleToggleLockPost(post.id)} title={post.locked ? "Reopen replies" : "Lock thread"} style={{ ...styles.actionBtn, color: post.locked ? "#0f172a" : "rgba(0,0,0,0.5)", background: post.locked ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.04)", padding: "5px 8px" }}>{post.locked ? <Lock size={13} /> : <Unlock size={13} />}</button>
                          <button onClick={() => handleToggleHidePost(post.id)} title={post.hidden ? "Restore to feed" : "Hide as spam"} style={{ ...styles.actionBtn, color: post.hidden ? "var(--eco-c13)" : "rgba(0,0,0,0.5)", background: post.hidden ? "rgba(var(--eco-c9-rgb), 0.12)" : "rgba(0,0,0,0.04)", padding: "5px 8px" }}>{post.hidden ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                          <button onClick={() => handleDeleteForumPost(post.id)} title="Delete permanently" style={{ ...styles.actionBtn, color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "5px 8px" }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "rgba(0,0,0,0.7)", margin: "8px 0 0" }}>{post.body}</p>
                      {reportCount(post) > 0 && (
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11px", color: "#b91c1c" }}>
                          <Flag size={12} /> Reported for {[...new Set(post.reports.map((r) => r.reason))].join(", ")}
                          <button onClick={() => handleDismissPostReports(post.id)} style={{ border: "none", background: "none", padding: 0, color: "var(--eco-c13)", fontWeight: 700, fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}>Clear reports</button>
                        </div>
                      )}
                      {(post.replies || []).length > 0 && (
                        <div style={{ marginTop: "10px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(post.replies || []).map((r, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", opacity: r.hidden ? 0.6 : 1 }}>
                              <div style={{ fontSize: "11.5px", color: "rgba(0,0,0,0.65)", minWidth: 0 }}>
                                <strong>{r.author}:</strong> {r.body}
                                {r.hidden && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "2px 6px", borderRadius: "999px" }}>HIDDEN</span>}
                                {reportCount(r) > 0 && (
                                  <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 800, color: "#fff", background: "#dc2626", padding: "2px 6px", borderRadius: "999px" }}>{reportCount(r)} REPORTED</span>
                                )}
                                {reportCount(r) > 0 && (
                                  <button onClick={() => handleDismissReplyReports(post.id, i)} style={{ marginLeft: "8px", border: "none", background: "none", padding: 0, color: "var(--eco-c13)", fontWeight: 700, fontSize: "10.5px", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                <button onClick={() => handleToggleHideReply(post.id, i)} title={r.hidden ? "Restore reply" : "Hide reply as spam"} style={{ ...styles.actionBtn, color: "rgba(0,0,0,0.5)", background: "transparent", padding: "2px 4px" }}>{r.hidden ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                                <button onClick={() => handleDeleteForumReply(post.id, i)} title="Delete reply" style={{ ...styles.actionBtn, color: "#dc2626", background: "transparent", padding: "2px 4px" }}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Farm Planner" ? (
          <div style={styles.dashboardContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Thermometer size={18} color="var(--eco-c7)" /> Weather Outlook by Region</h3>
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "4px 0 0" }}>Drives the 5-day forecast shown on the user Farm Planner.</p>
              </div>
              <button onClick={handleSavePlanner} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.3)" }}>
                <Save size={15} /> Save Changes
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "20px" }}>
              {Object.keys(plannerDraft.regions || {}).map((region) => {
                const r = plannerDraft.regions[region] || {};
                return (
                  <div key={region} className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>{region}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                      {[
                        { field: "base", label: "Base °C" },
                        { field: "humidity", label: "Humidity %" },
                        { field: "wind", label: "Wind km/h" },
                      ].map(({ field, label }) => (
                        <label key={field} style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>
                          {label}
                          <input
                            type="number"
                            value={r[field] ?? 0}
                            onChange={(e) => updatePlannerRegion(region, field, Number(e.target.value))}
                            style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.85)", fontSize: "13px", outline: "none", marginTop: "4px", boxSizing: "border-box" }}
                          />
                        </label>
                      ))}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.6)", marginBottom: "6px" }}>5-Day Conditions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {Array.from({ length: 5 }).map((_, dayIdx) => (
                        <AdminEcoDropdown
                          key={dayIdx}
                          value={(r.cond || [])[dayIdx] || "Sunny"}
                          options={forecastConditions.map(c => ({ value: c, label: `Day ${dayIdx + 1}: ${c}` }))}
                          onChange={(val) => updatePlannerCondition(region, dayIdx, val)}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <h3 style={{ ...styles.cardHeading, fontSize: "16px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}><Megaphone size={16} color="var(--eco-c9)" /> Planting Advisories</h3>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>Shown based on the forecast — wet (rainy), dry (sunny), or mild (mixed) conditions.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {[
                  { key: "wet", label: "Wet / Rainy advisory" },
                  { key: "dry", label: "Dry / Sunny advisory" },
                  { key: "mild", label: "Mild / Mixed advisory" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>
                    {label}
                    <textarea
                      value={plannerDraft.advisories[key] || ""}
                      onChange={(e) => setPlannerDraft((prev) => ({ ...prev, advisories: { ...prev.advisories, [key]: e.target.value } }))}
                      style={{ width: "100%", height: "90px", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.85)", fontSize: "12.5px", resize: "none", outline: "none", marginTop: "6px", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "Expert Support" ? (
          <div style={styles.dashboardContainer}>
            {/* Specialist Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total Specialists", value: String((advisors || []).length), trend: "on the website", up: true, icon: <UserCheck size={16} color="var(--eco-c11)" /> },
                { label: "Verified", value: String((advisors || []).filter(a => a.verified).length), trend: "badge shown", up: true, icon: <ShieldCheck size={16} color="#0284c7" /> },
                { label: "Available Now", value: String((advisors || []).filter(a => a.availability === "Available").length), trend: "accepting bookings", up: true, icon: <CheckCircle size={16} color="var(--eco-c9)" /> },
                { label: "Expertise Areas", value: String([...new Set((advisors || []).flatMap(a => a.expertise || []))].length), trend: "filter categories", up: true, icon: <Star size={16} color="#f59e0b" /> },
              ].map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>{stat.trend}</span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
              {/* Specialists Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Specialist Management</h3>
                  <button onClick={() => downloadCSV("Expert_Specialists.csv", (advisors || []).map(a => ({ ID: a.id, Name: a.name, Verified: a.verified ? "Yes" : "No", Rating: a.rating, Expertise: (a.expertise || []).join("; "), Availability: a.availability, Days: a.availableDays, Time: a.availableTime })))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "640px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Specialist</th>
                        <th style={styles.th}>Expertise</th>
                        <th style={styles.th}>Schedule</th>
                        <th style={styles.th}>Rating</th>
                        <th style={styles.th}>Availability</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdvisorsList.map((advisor) => (
                        <tr key={advisor.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {advisor.image ? (
                                <img src={advisor.image} alt={advisor.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--eco-c6)", flexShrink: 0 }} />
                              ) : (
                                <div title="No photo set — blank placeholder shown on the website" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12))", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.35)", flexShrink: 0 }}>
                                  <UserCheck size={16} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                                  {advisor.name}
                                  {advisor.verified && <ShieldCheck size={13} color="var(--eco-c9)" />}
                                </div>
                                <div style={{ fontSize: "10px", color: advisor.image ? "rgba(0,0,0,0.5)" : "var(--eco-c11)", fontWeight: 600 }}>
                                  {advisor.image ? "Photo set" : "No photo (blank)"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...styles.td, maxWidth: "180px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {(advisor.expertise || []).map((exp) => (
                                <span key={exp} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: "rgba(var(--eco-c9-rgb), 0.08)", color: "var(--eco-c13)" }}>{exp}</span>
                              ))}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: "12px", fontWeight: 600 }}>{advisor.availableDays || "—"}</div>
                            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>{advisor.availableTime || "—"}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 700 }}><Star size={12} color="var(--eco-c7)" fill="var(--eco-c7)" /> {advisor.rating}</span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => handleToggleAdvisorAvailability(advisor.id)} style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", background: advisor.availability === "Available" ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: advisor.availability === "Available" ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                              {advisor.availability}
                            </button>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleEditAdvisor(advisor)} title="Edit" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "6px" }}><Edit2 size={13} /></button>
                              <button onClick={() => handleToggleAdvisorVerified(advisor.id)} title={advisor.verified ? "Unverify" : "Verify"} style={{ ...styles.actionBtn, color: advisor.verified ? "var(--eco-c13)" : "#6b7280", background: advisor.verified ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(107,114,128,0.1)", padding: "6px" }}><ShieldCheck size={13} /></button>
                              <button onClick={() => handleDeleteAdvisor(advisor.id)} title="Remove" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px" }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredAdvisorsList.length === 0 && (
                        <tr><td style={{ ...styles.td, textAlign: "center", color: "rgba(0,0,0,0.45)" }} colSpan={6}>No specialists found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add / Edit form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", marginBottom: "14px" }}>
                    {editingAdvisor ? (editingAdvisor.isNew ? "Add Specialist" : "Edit Specialist") : "Specialist Tools"}
                  </h3>
                  {editingAdvisor ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" value={editingAdvisor.name} onChange={e => setEditingAdvisor({ ...editingAdvisor, name: e.target.value })} style={styles.editInput} placeholder="Full name (e.g. Dr. Maria Santos)" />
                      <input type="text" value={editingAdvisor.image} onChange={e => setEditingAdvisor({ ...editingAdvisor, image: e.target.value })} style={styles.editInput} placeholder="Photo URL (leave blank for placeholder)" />
                      <input type="text" value={editingAdvisor.expertiseText} onChange={e => setEditingAdvisor({ ...editingAdvisor, expertiseText: e.target.value })} style={styles.editInput} placeholder="Expertise (comma separated)" />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="number" step="0.1" min="0" max="5" value={editingAdvisor.rating} onChange={e => setEditingAdvisor({ ...editingAdvisor, rating: e.target.value })} style={{ ...styles.editInput, flex: 1 }} placeholder="Rating" />
                        <div style={{ flex: 2 }}>
                          <AdminEcoDropdown value={editingAdvisor.availability} options={advisorAvailabilityOptions} onChange={value => setEditingAdvisor({ ...editingAdvisor, availability: value })} compact />
                        </div>
                      </div>
                      <input type="text" value={editingAdvisor.availableDays} onChange={e => setEditingAdvisor({ ...editingAdvisor, availableDays: e.target.value })} style={styles.editInput} placeholder="Available days (e.g. Mon - Fri)" />
                      <input type="text" value={editingAdvisor.availableTime} onChange={e => setEditingAdvisor({ ...editingAdvisor, availableTime: e.target.value })} style={styles.editInput} placeholder="Available time (e.g. 9:00 AM - 5:00 PM)" />
                      <textarea value={editingAdvisor.bio} onChange={e => setEditingAdvisor({ ...editingAdvisor, bio: e.target.value })} style={{ ...styles.editInput, height: "70px", resize: "none", fontFamily: "inherit" }} placeholder="Short bio shown on the website..." />
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.7)", cursor: "pointer" }}>
                        <input type="checkbox" checked={!!editingAdvisor.verified} onChange={e => setEditingAdvisor({ ...editingAdvisor, verified: e.target.checked })} style={{ accentColor: "var(--eco-c9)" }} />
                        Verified specialist (shows badge)
                      </label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button onClick={handleSaveAdvisor} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}><Save size={14} /> Save</button>
                        <button onClick={() => setEditingAdvisor(null)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <button onClick={() => setEditingAdvisor({ ...emptyAdvisorDraft })} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}>
                        <Plus size={16} /> Add New Specialist
                      </button>
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", lineHeight: 1.5, background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        Specialist photos are intentionally blank for now — the website shows a placeholder until you paste a real photo URL here.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Specialist Certification" ? (
          <div style={styles.dashboardContainer}>
            {/* Course Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total Courses", value: String((certCourses || []).length), trend: "on the website", icon: <GraduationCap size={16} color="var(--eco-c11)" /> },
                { label: "With Real Photo", value: String((certCourses || []).filter(c => c.image).length), trend: "photo cards", icon: <Image size={16} color="#0284c7" /> },
                { label: "Total Lessons", value: String((certCourses || []).reduce((sum, c) => sum + (parseInt(c.lessons, 10) || 0), 0)), trend: "across all courses", icon: <Play size={16} color="#b45309" /> },
                { label: "Avg Rating", value: (certCourses || []).length ? ((certCourses.reduce((sum, c) => sum + (parseFloat(c.rating) || 0), 0) / certCourses.length).toFixed(1)) : "—", trend: "learner reviews", icon: <Star size={16} color="#f59e0b" /> },
              ].map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>{stat.trend}</span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
              {/* Courses Table */}
              <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Course Management</h3>
                  <button onClick={() => downloadCSV("Certification_Courses.csv", (certCourses || []).map(c => ({ ID: c.id, Title: c.title, Instructor: c.instructor, Duration: c.duration, Lessons: c.lessons, Price: c.price, Badge: c.badge || "", Rating: c.rating, Photo: c.image ? "Yes" : "No" })))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...styles.table, width: "100%", minWidth: "640px" }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Course</th>
                        <th style={styles.th}>Instructor</th>
                        <th style={styles.th}>Duration</th>
                        <th style={styles.th}>Lessons</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Rating</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoursesList.map((course) => (
                        <tr key={course.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {course.image ? (
                                <img src={course.image} alt={course.title} style={{ width: "48px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
                              ) : (
                                <div title="No photo set — icon placeholder shown on the website" style={{ width: "48px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.15), rgba(var(--eco-c7-rgb), 0.15))", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.35)", flexShrink: 0 }}>
                                  <GraduationCap size={16} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                                  {course.title}
                                  {course.badge && <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "9px", fontWeight: 700, background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", textTransform: "uppercase" }}>{course.badge}</span>}
                                </div>
                                <div style={{ fontSize: "10px", color: course.image ? "rgba(0,0,0,0.5)" : "var(--eco-c11)", fontWeight: 600 }}>
                                  {course.image ? "Photo set" : "No photo (icon shown)"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>{course.instructor}</td>
                          <td style={styles.td}>{course.duration}</td>
                          <td style={styles.td}>{course.lessons}</td>
                          <td style={{ ...styles.td, fontWeight: 700, color: "var(--eco-c13)" }}>{course.price}</td>
                          <td style={styles.td}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 700 }}><Star size={12} color="var(--eco-c7)" fill="var(--eco-c7)" /> {course.rating}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleEditCourse(course)} title="Edit" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c7-rgb), 0.1)", padding: "6px" }}><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteCourse(course.id)} title="Remove" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px" }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCoursesList.length === 0 && (
                        <tr><td style={{ ...styles.td, textAlign: "center", color: "rgba(0,0,0,0.45)" }} colSpan={7}>No courses found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add / Edit form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "20px", background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.02))" }}>
                  <h3 style={{ ...styles.cardHeading, fontSize: "16px", color: "var(--eco-c13)", marginBottom: "14px" }}>
                    {editingCourse ? (editingCourse.isNew ? "Add Course" : "Edit Course") : "Course Tools"}
                  </h3>
                  {editingCourse ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" value={editingCourse.title} onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })} style={styles.editInput} placeholder="Course title" />
                      <input type="text" value={editingCourse.image} onChange={e => setEditingCourse({ ...editingCourse, image: e.target.value })} style={styles.editInput} placeholder="Photo URL (blank = icon placeholder)" />
                      {editingCourse.image && (
                        <img src={editingCourse.image} alt="Course preview" style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)" }} />
                      )}
                      <input type="text" value={editingCourse.instructor} onChange={e => setEditingCourse({ ...editingCourse, instructor: e.target.value })} style={styles.editInput} placeholder="Instructor (e.g. Dr. Maria Santos)" />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" value={editingCourse.duration} onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })} style={{ ...styles.editInput, flex: 1 }} placeholder="Duration" />
                        <input type="number" min="1" value={editingCourse.lessons} onChange={e => setEditingCourse({ ...editingCourse, lessons: e.target.value })} style={{ ...styles.editInput, flex: 1 }} placeholder="Lessons" />
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" value={editingCourse.price} onChange={e => setEditingCourse({ ...editingCourse, price: e.target.value })} style={{ ...styles.editInput, flex: 1 }} placeholder="Price (e.g. ₱1,500)" />
                        <input type="number" step="0.1" min="0" max="5" value={editingCourse.rating} onChange={e => setEditingCourse({ ...editingCourse, rating: e.target.value })} style={{ ...styles.editInput, flex: 1 }} placeholder="Rating" />
                      </div>
                      <input type="text" value={editingCourse.badge} onChange={e => setEditingCourse({ ...editingCourse, badge: e.target.value })} style={styles.editInput} placeholder="Badge label (e.g. Best Seller)" />
                      <textarea value={editingCourse.desc} onChange={e => setEditingCourse({ ...editingCourse, desc: e.target.value })} style={{ ...styles.editInput, height: "70px", resize: "none", fontFamily: "inherit" }} placeholder="Short description shown on the course card..." />
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button onClick={handleSaveCourse} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}><Save size={14} /> Save</button>
                        <button onClick={() => setEditingCourse(null)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <button onClick={() => setEditingCourse({ ...emptyCourseDraft })} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}>
                        <Plus size={16} /> Add New Course
                      </button>
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.55)", lineHeight: 1.5, background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        Courses appear on the website's Specialist Certification page. Paste a real photo URL to replace the icon placeholder on the course card.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Surplus Exchange" ? (
          <div style={styles.dashboardContainer}>
            {/* Marketplace Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Active Listings", value: String((surplusListings || []).filter(l => l.status === "Available").length), trend: "on the market", icon: <Package size={16} color="var(--eco-c11)" /> },
                { label: "Total Listings", value: String((surplusListings || []).length), trend: "all statuses", icon: <Box size={16} color="#0284c7" /> },
                { label: "Open Demands", value: String((surplusDemands || []).filter(d => d.status !== "Closed").length), trend: "buyer requests", icon: <ShoppingCart size={16} color="#f59e0b" /> },
                { label: "Est. Listing Value", value: `₱${((surplusListings || []).reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0)).toLocaleString()}`, trend: "gross volume", icon: <CreditCard size={16} color="#8b5cf6" /> },
              ].map((stat, idx) => (
                <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={styles.statIconWrap}>{stat.icon}</div>
                    <span style={{ ...styles.trendBadge, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)" }}>{stat.trend}</span>
                  </div>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Farmer Listings */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Surplus Listings</h3>
                <button onClick={() => downloadCSV("Surplus_Listings.csv", (surplusListings || []).map(l => ({ ID: l.id, Product: l.product, Quantity: `${l.quantity}${l.unit}`, Price: l.price, Location: l.location, Farmer: l.farmer, Status: l.status, Category: l.category || "", BestBefore: l.bestBefore || "" })))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "700px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Farmer</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSurplusListings.map((listing) => (
                      <tr key={listing.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{listing.product}</td>
                        <td style={styles.td}>{listing.quantity}{listing.unit}</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: "var(--eco-c13)" }}>₱{listing.price}/{listing.unit}</td>
                        <td style={styles.td}>{listing.location || "—"}</td>
                        <td style={styles.td}>{listing.farmer || "—"}</td>
                        <td style={{ ...styles.td, minWidth: "130px" }}>
                          <AdminEcoDropdown value={listing.status || "Available"} options={listingStatusOptions} onChange={(value) => handleSetListingStatus(listing.id, value)} compact />
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteListing(listing.id)} title="Remove listing" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px" }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredSurplusListings.length === 0 && (
                      <tr><td style={{ ...styles.td, textAlign: "center", color: "rgba(0,0,0,0.45)" }} colSpan={7}>No surplus listings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Buyer Demands */}
            <div className="inner-blur-glass" style={{ ...styles.chartCard, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ ...styles.cardHeading, fontSize: "18px" }}>Establishment Demands</h3>
                <button onClick={() => downloadCSV("Surplus_Demands.csv", (surplusDemands || []).map(d => ({ ID: d.id, Buyer: d.restaurant, Product: d.product, Quantity: `${d.quantity}${d.unit}`, TargetPrice: d.targetPrice, Location: d.location, NeededBy: d.neededDate, Urgent: d.urgent ? "Yes" : "No", Status: d.status || "Open" })))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%", minWidth: "700px" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Buyer</th>
                      <th style={styles.th}>Needs</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Target Price</th>
                      <th style={styles.th}>Needed By</th>
                      <th style={styles.th}>Urgent</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSurplusDemands.map((demand) => (
                      <tr key={demand.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {demand.restaurant}
                            {demand.verified && <ShieldCheck size={13} color="var(--eco-c9)" />}
                          </span>
                        </td>
                        <td style={styles.td}>{demand.product}</td>
                        <td style={styles.td}>{demand.quantity} {demand.unit}</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: "var(--eco-c13)" }}>₱{demand.targetPrice}/{demand.unit}</td>
                        <td style={styles.td}>{demand.neededDate || "—"}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleToggleDemandUrgent(demand.id)} style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, border: "none", cursor: "pointer", textTransform: "uppercase", background: demand.urgent ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(107,114,128,0.1)", color: demand.urgent ? "var(--eco-c13)" : "#6b7280" }}>
                            {demand.urgent ? "Urgent" : "Normal"}
                          </button>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleToggleDemandStatus(demand.id)} style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", background: demand.status === "Closed" ? "rgba(107,114,128,0.1)" : "rgba(var(--eco-c9-rgb), 0.1)", color: demand.status === "Closed" ? "#6b7280" : "var(--eco-c13)" }}>
                            {demand.status === "Closed" ? "Closed" : "Open"}
                          </button>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteDemand(demand.id)} title="Remove demand" style={{ ...styles.actionBtn, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "6px" }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredSurplusDemands.length === 0 && (
                      <tr><td style={{ ...styles.td, textAlign: "center", color: "rgba(0,0,0,0.45)" }} colSpan={8}>No demand posts found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          activeTab === "Settings" ? (
            <div style={styles.dashboardContainer}>
              {/* Settings Stats Grid */}
              <div style={styles.statsGrid}>
                {mockSettingsStats.map((base, idx) => {
                  const stat =
                    base.label === "Active Admins" ? { ...base, value: String(settingsDraft.admins.length) }
                    : base.label === "System Status" ? { ...base, value: settingsDraft.maintenanceMode ? "Maintenance" : "Online", trend: settingsDraft.maintenanceMode ? "Public access off" : "99.9% Uptime", up: !settingsDraft.maintenanceMode }
                    : base;
                  return (
                  <div key={idx} className="inner-blur-glass" style={styles.statCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={styles.statIconWrap}>{stat.icon}</div>
                      <span style={{ ...styles.trendBadge, color: stat.up ? "var(--eco-c13)" : "var(--eco-c13)", background: stat.up ? "rgba(var(--eco-c9-rgb), 0.1)" : "rgba(var(--eco-c9-rgb), 0.1)" }}>
                        {stat.up ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {stat.trend}
                      </span>
                    </div>
                    <div style={styles.statValue}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                  );
                })}
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
                        background: activeSettingsTab === tab.id ? "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.1), rgba(var(--eco-c9-rgb), 0.05))" : "transparent",
                        color: activeSettingsTab === tab.id ? "var(--eco-c13)" : "rgba(0,0,0,0.6)",
                        boxShadow: activeSettingsTab === tab.id ? "0 4px 12px rgba(var(--eco-c9-rgb), 0.05)" : "none"
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
                    <button onClick={handleSaveSettings} style={{ padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.2)" }}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                  
                  {activeSettingsTab === "General" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       {/* Who is signed in — read-only, straight from the login session. */}
                       <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", borderRadius: "14px", background: "rgba(var(--eco-c9-rgb), 0.06)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)" }}>
                         {adminAvatar ? (
                           <img src={adminAvatar} alt={displayAdminName} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                         ) : (
                           <div style={{ ...styles.adminProfile, width: "48px", height: "48px", fontSize: "18px", cursor: "default" }}>{adminInitial}</div>
                         )}
                         <div style={{ minWidth: 0 }}>
                           <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Signed in as</div>
                           <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{displayAdminName}</div>
                           <div style={{ fontSize: "13px", fontWeight: 500, color: "rgba(0,0,0,0.6)", overflow: "hidden", textOverflow: "ellipsis" }}>{adminEmail || "No email on this account"}</div>
                         </div>
                         <span style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.15)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800 }}>Administrator</span>
                       </div>
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Platform Name</label>
                           <input type="text" value={settingsDraft.platformName} onChange={(e) => updateSetting("platformName", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                         <div>
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Support Email</label>
                           <input type="email" value={settingsDraft.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Maintenance Mode</label>
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                           <div>
                             <div style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "4px" }}>Enable Maintenance Mode</div>
                             <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Restrict public access while updating the platform. Admins can still log in.</div>
                           </div>
                           <div onClick={() => updateSetting("maintenanceMode", !settingsDraft.maintenanceMode)} style={{ width: "44px", height: "24px", background: settingsDraft.maintenanceMode ? "var(--eco-c9)" : "rgba(0,0,0,0.1)", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0 }}>
                             <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s", transform: settingsDraft.maintenanceMode ? "translateX(20px)" : "translateX(0)" }} />
                           </div>
                         </div>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Security & Roles" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700 }}>Admin Accounts & Roles</h4>
                         <div style={{ overflowX: "auto" }}>
                         <table style={{ width: "100%", minWidth: "620px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                           <thead>
                             <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.5)" }}>
                               <th style={{ padding: "12px 8px" }}>Name</th>
                               <th style={{ padding: "12px 8px" }}>Email</th>
                               <th style={{ padding: "12px 8px" }}>Role</th>
                               <th style={{ padding: "12px 8px" }}>2FA Status</th>
                               <th style={{ padding: "12px 8px" }}>Action</th>
                             </tr>
                           </thead>
                           <tbody>
                             {settingsDraft.admins.map((adm) => (
                               <tr key={adm.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                 <td style={{ padding: "12px 8px", fontWeight: 600 }}>{adm.name}{adm.isYou ? " (You)" : ""}</td>
                                 <td style={{ padding: "12px 8px", color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{adm.email || "—"}</td>
                                 <td style={{ padding: "12px 8px", color: adm.role === "Super Admin" ? "var(--eco-c13)" : "#0f172a", fontWeight: 700 }}>{adm.role}</td>
                                 <td style={{ padding: "12px 8px", color: adm.twoFactor ? "var(--eco-c13)" : "var(--eco-c13)", fontWeight: 600 }}>{adm.twoFactor ? "Enabled" : "Disabled"}</td>
                                 <td style={{ padding: "12px 8px", display: "flex", gap: "8px" }}>
                                   <button onClick={() => setEditingAdmin({ ...adm })} style={{ ...styles.actionBtn, background: "rgba(var(--eco-c7-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Edit</button>
                                   {!adm.isYou && <button onClick={() => handleRemoveAdmin(adm.id)} style={{ ...styles.actionBtn, background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 700, padding: "6px 12px" }}>Remove</button>}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                         </div>

                         {editingAdmin && (
                           <div style={{ marginTop: "16px", padding: "20px", borderRadius: "14px", border: "1px solid rgba(var(--eco-c9-rgb), 0.25)", background: "rgba(var(--eco-c9-rgb), 0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
                             <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>{settingsDraft.admins.some((a) => a.id === editingAdmin.id) ? "Edit Admin" : "Add New Admin"}</div>
                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                               <div>
                                 <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)", marginBottom: "6px", textTransform: "uppercase" }}>Name</label>
                                 <input type="text" value={editingAdmin.name} onChange={(e) => setEditingAdmin((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                               </div>
                               <div>
                                 <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)", marginBottom: "6px", textTransform: "uppercase" }}>Email</label>
                                 {/* Your own address comes from the login session, so it is read-only here. */}
                                 <input type="email" value={editingAdmin.email || ""} disabled={!!editingAdmin.isYou} onChange={(e) => setEditingAdmin((p) => ({ ...p, email: e.target.value }))} placeholder="name@example.com" style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: editingAdmin.isYou ? "rgba(0,0,0,0.04)" : "#fff", color: editingAdmin.isYou ? "rgba(0,0,0,0.55)" : "#000", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                               </div>
                               <div>
                                 <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)", marginBottom: "6px", textTransform: "uppercase" }}>Role</label>
                                 <AdminEcoDropdown value={editingAdmin.role} options={adminRoleOptions} onChange={(v) => setEditingAdmin((p) => ({ ...p, role: v }))} />
                               </div>
                             </div>
                             <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                               <input type="checkbox" checked={!!editingAdmin.twoFactor} onChange={(e) => setEditingAdmin((p) => ({ ...p, twoFactor: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "var(--eco-c9)" }} />
                               Two-Factor Authentication enabled
                             </label>
                             <div style={{ display: "flex", gap: "12px" }}>
                               <button onClick={handleSaveAdmin} style={{ padding: "10px 18px", borderRadius: "10px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Save Admin</button>
                               <button onClick={() => setEditingAdmin(null)} style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                             </div>
                           </div>
                         )}

                         {!editingAdmin && (
                           <button onClick={() => setEditingAdmin({ name: "", email: "", role: "Admin", twoFactor: false })} style={{ marginTop: "16px", padding: "10px 16px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", border: "1px dashed var(--eco-c9)", color: "var(--eco-c13)", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%" }}>+ Add New Admin</button>
                         )}
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Payments" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                       <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                           <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c8), var(--eco-c10))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "18px" }}>PM</div>
                           <div>
                             <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>PayMongo Integration</div>
                             <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>Accept GCash, Maya, and Credit Cards</div>
                           </div>
                         </div>
                         <div onClick={() => updateSetting("paymongoEnabled", !settingsDraft.paymongoEnabled)} style={{ width: "44px", height: "24px", background: settingsDraft.paymongoEnabled ? "var(--eco-c9)" : "rgba(0,0,0,0.1)", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0 }}>
                           <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s", transform: settingsDraft.paymongoEnabled ? "translateX(20px)" : "translateX(0)" }} />
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Secret API Key</label>
                         <input type="password" value={settingsDraft.paymongoKey} onChange={(e) => updateSetting("paymongoKey", e.target.value)} placeholder="sk_live_••••••••••••••••" disabled={!settingsDraft.paymongoEnabled} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: settingsDraft.paymongoEnabled ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.04)", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box", opacity: settingsDraft.paymongoEnabled ? 1 : 0.6 }} />
                         <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "8px" }}>Stored locally for this demo. Used to authenticate PayMongo charge requests.</p>
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "AI & Models" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Plant Doctor Confidence Threshold</label>
                         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                           <input type="range" min="50" max="99" value={settingsDraft.aiConfidenceThreshold} onChange={(e) => updateSetting("aiConfidenceThreshold", Number(e.target.value))} style={{ flex: 1, accentColor: "var(--eco-c9)" }} />
                           <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--eco-c13)", width: "40px", textAlign: "right" }}>{settingsDraft.aiConfidenceThreshold}%</span>
                         </div>
                         <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "8px" }}>Diagnoses below this threshold will be flagged as "Under Review" for human agronomist verification.</p>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Active Neural Model</label>
                         <AdminEcoDropdown value={settingsDraft.activeModel} onChange={(v) => updateSetting("activeModel", v)} options={[{ value: "Verde-Agri-V2.4 (Optimized for PH Climate)", label: "Verde-Agri-V2.4 (Optimized for PH Climate)" }, { value: "Verde-Agri-V2.3 (Legacy)", label: "Verde-Agri-V2.3 (Legacy)" }]} />
                       </div>
                     </div>
                  )}
  
                  {activeSettingsTab === "Appearance" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Theme Mode</label>
                         <div style={{ display: "flex", gap: "16px" }}>
                           <div onClick={() => updateSetting("themeMode", "Light")} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: settingsDraft.themeMode === "Light" ? "2px solid var(--eco-c9)" : "2px solid transparent", background: "rgba(255,255,255,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#0f172a" }}>Light Mode</div>
                           <div onClick={() => updateSetting("themeMode", "Dark")} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: settingsDraft.themeMode === "Dark" ? "2px solid var(--eco-c9)" : "2px solid transparent", background: "rgba(15,23,42,0.8)", textAlign: "center", fontWeight: 700, cursor: "pointer", color: "#fff" }}>Dark Mode</div>
                         </div>
                       </div>
                       <ColorThemePicker
                         primary={settingsDraft.accentColor}
                         secondary={settingsDraft.secondaryColor}
                         button={settingsDraft.buttonColor}
                         onChangePrimary={(v) => updateSetting("accentColor", v)}
                         onChangeSecondary={(v) => updateSetting("secondaryColor", v)}
                         onChangeButton={(v) => updateSetting("buttonColor", v)}
                         previewTitle={settingsDraft.platformName || "EcoEquity"}
                         previewNote="Save Changes to apply these colours site-wide. Members can override them for themselves in Account Settings."
                       />
                     </div>
                  )}
  
                  {activeSettingsTab === "Database & Backups" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                       {/* Live database status + the one-time content bootstrap. */}
                       <div style={{ padding: "20px", borderRadius: "16px", border: `1px solid ${supabaseReady ? "rgba(var(--eco-c9-rgb), 0.2)" : "rgba(var(--eco-c7-rgb), 0.25)"}`, background: supabaseReady ? "rgba(var(--eco-c9-rgb), 0.05)" : "rgba(var(--eco-c7-rgb), 0.06)" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                           <Database size={16} color={supabaseReady ? "var(--eco-c11)" : "var(--eco-c11)"} />
                           <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: supabaseReady ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                             {supabaseReady ? "Connected to Supabase" : "Not connected — running on local sample data"}
                           </h4>
                         </div>
                         {supabaseReady ? (
                           <>
                             <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                               Admin content (rewards, specialists, courses, events, harvests, deliveries, plans, announcements) is saved to the database as you edit it, so every visitor sees the same thing on any device.
                             </p>
                             <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: 700, color: contentSeeded ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                               {contentSeeded
                                 ? "Content has been published to the database."
                                 : "Nothing published yet — visitors are still seeing the built-in sample content."}
                             </p>
                             <button
                               onClick={async () => {
                                 const result = await onPublishContent();
                                 setToastMessage(result && result.ok
                                   ? "All admin content published to the database"
                                   : `Publish failed: ${(result && result.error) || "check the console"}`);
                               }}
                               disabled={publishingContent}
                               style={{ padding: "10px 16px", borderRadius: "10px", background: publishingContent ? "rgba(0,0,0,0.15)" : "var(--eco-c9)", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: publishingContent ? "default" : "pointer" }}
                             >
                               {publishingContent ? "Publishing…" : contentSeeded ? "Re-publish all content" : "Publish content to database"}
                             </button>
                           </>
                         ) : (
                           <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                             Add <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code> to <code>.env.local</code> and run <code>supabase/schema.sql</code>. Until then every edit stays in this browser only — other people will not see it.
                           </p>
                         )}
                       </div>
                       <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(var(--eco-c9-rgb), 0.05)" }}>
                         <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "var(--eco-c13)" }}>Automated Backups</h4>
                         <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Your database is automatically backed up every day at 12:00 AM UTC. You can also trigger a manual backup below.</p>
                         <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: 700, color: "var(--eco-c13)" }}>Last backup: {settingsDraft.lastBackup ? new Date(settingsDraft.lastBackup).toLocaleString() : "No manual backup yet"}</p>
                         <div style={{ display: "flex", gap: "12px" }}>
                           <button onClick={handleBackupNow} style={{ padding: "10px 16px", borderRadius: "10px", background: "var(--eco-c9)", color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Backup Now</button>
                           <button onClick={() => setToastMessage(settingsDraft.lastBackup ? "Restored from last backup" : "No backup available to restore")} style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.05)", color: "#000", border: "1px solid rgba(0,0,0,0.1)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Restore from Backup</button>
                         </div>
                       </div>
                       <div>
                         <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Data Export</label>
                         <button onClick={handleExportData} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Export Full System Data (JSON)</button>
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.placeholderContainer}>
              <div style={{ width: "64px", height: "64px", background: "rgba(var(--eco-c9-rgb), 0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--eco-c13)", marginBottom: "16px" }}>
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

// Shared field chrome for the EcoPoints & Rewards editors.
const ecoFieldLabel = { display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.6)" };
const ecoFieldInput = { width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.85)", fontSize: "13px", outline: "none", marginTop: "4px", boxSizing: "border-box" };

const styles = {
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
    background: "var(--eco-c3)", // light red
    border: "1px solid var(--eco-c7)", // red
    color: "var(--eco-c13)", // dark red
    padding: "12px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 10px 25px rgba(var(--eco-c9-rgb), 0.2)",
    animation: "fadeIn 0.3s ease-out",
  },
  container: {
    display: "flex",
    width: "100%",
    // No min-width: the shell adapts (see readAdminViewport) instead of pushing
    // the sidebar off-screen behind a horizontal scrollbar on narrow windows.
    height: "100%",
    background: "transparent", // relies on the parent shell's glass effect
    overflowX: "hidden",
    overflowY: "hidden",
    position: "relative",
  },
  navScrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(var(--eco-c19-rgb), 0.34)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    zIndex: 1150,
  },
  sidebar: {
    height: "calc(100% - 40px)",
    margin: "20px 0 20px 20px",
    background: "linear-gradient(160deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: "24px",
    boxShadow: "0 12px 40px rgba(var(--eco-c19-rgb), 0.09)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    flexShrink: 0,
    overflow: "hidden",
    transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  sidebarHeader: {
    padding: "16px 16px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: `1px solid ${AD.lineSoft}`,
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "rgba(var(--eco-c9-rgb), 0.13)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.20)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: 850,
    color: AD.ink,
    margin: 0,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },
  sidebarSubtitle: {
    display: "block",
    fontSize: "10.5px",
    fontWeight: 700,
    color: AD.inkFaint,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginTop: "1px",
  },
  navSearchWrap: {
    margin: "12px 12px 4px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.72)",
    border: `1px solid ${AD.line}`,
  },
  navSearchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "12.5px",
    fontFamily: "inherit",
    color: AD.ink,
  },
  navSearchClear: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    color: AD.inkFaint,
    flexShrink: 0,
  },
  navNoMatch: {
    margin: "10px 14px",
    fontSize: "12px",
    color: AD.inkSoft,
    lineHeight: 1.5,
  },
  sidebarNav: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 12px 18px",
    display: "flex",
    flexDirection: "column",
  },
  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "9px 12px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid transparent",
    color: AD.inkSoft,
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.16s ease, color 0.16s ease",
  },
  /* One treatment for "you are here": a tinted surface and a left marker. The
     previous version stacked a gradient, a shadow and a bar, which read as a
     button that could be pressed again rather than as current state. */
  navItemActive: {
    background: "rgba(var(--eco-c9-rgb), 0.11)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.18)",
    color: "var(--eco-c13)",
    fontWeight: 800,
  },
  navItemHover: {
    background: "rgba(var(--eco-c19-rgb), 0.045)",
    color: AD.ink,
  },
  navActiveBar: {
    position: "absolute",
    left: "-12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "18px",
    borderRadius: "0 3px 3px 0",
    background: AD.greenBright,
  },
  navActiveBarCollapsed: {
    position: "absolute",
    left: "-12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "22px",
    borderRadius: "0 3px 3px 0",
    background: AD.greenBright,
  },
  navGroupLabel: {
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: "0.9px",
    textTransform: "uppercase",
    color: AD.inkFaint,
    padding: "8px 12px 5px",
  },
  navGroupDivider: {
    height: "1px",
    background: AD.lineSoft,
    margin: "8px 10px",
  },
  navBadge: {
    minWidth: "19px",
    height: "19px",
    padding: "0 6px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.22)",
    color: AD.rose,
    fontSize: "10px",
    fontWeight: 850,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navBadgeDot: {
    position: "absolute",
    top: "7px",
    right: "14px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: AD.rose,
    border: "1.5px solid #fff",
  },
  collapseBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "9px",
    border: `1px solid ${AD.line}`,
    background: "rgba(255,255,255,0.7)",
    color: AD.inkSoft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.18s ease, color 0.18s ease",
  },
  menuBtn: {
    position: "relative",
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "12px",
    border: `1px solid ${AD.line}`,
    background: "rgba(255,255,255,0.82)",
    color: AD.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  menuBtnDot: {
    position: "absolute",
    top: "7px",
    right: "7px",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: AD.rose,
    border: "1.5px solid #fff",
  },
  sidebarFooter: {
    padding: "14px 16px",
    borderTop: `1px solid ${AD.lineSoft}`,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  /* Quieter than Logout on purpose — leaving the console is routine, ending
     the session is not, so they must not read as the same weight of action. */
  viewSiteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.72)",
    border: `1px solid ${AD.line}`,
    color: AD.inkSoft,
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "background 0.18s ease, color 0.18s ease",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(var(--eco-c9-rgb), 0.07)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
    color: AD.rose,
    fontSize: "13px",
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "background 0.18s ease",
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    margin: "20px",
    background: "linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,255,255,0.44))",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: "24px",
    boxShadow: "0 12px 40px rgba(var(--eco-c19-rgb), 0.09)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    padding: "16px 24px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.48) 100%)",
    borderBottom: `1px solid ${AD.line}`,
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 16px rgba(var(--eco-c19-rgb), 0.04)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginLeft: "auto",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "10.5px",
    fontWeight: 800,
    color: AD.inkFaint,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "4px",
  },
  pageTitle: {
    fontSize: "23px",
    fontWeight: 850,
    color: AD.ink,
    margin: 0,
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pageSubtitle: {
    fontSize: "12.5px",
    fontWeight: 500,
    color: AD.inkSoft,
    margin: "4px 0 0",
    lineHeight: 1.4,
  },
  adminIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingLeft: "12px",
    borderLeft: `1px solid ${AD.line}`,
  },
  adminMeta: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
    minWidth: 0,
  },
  adminName: {
    fontSize: "13px",
    fontWeight: 800,
    color: AD.ink,
  },
  adminRole: {
    fontSize: "11px",
    fontWeight: 500,
    color: AD.inkFaint,
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "rgba(255,255,255,0.85)",
    border: `1px solid ${AD.line}`,
    padding: "8px 13px",
    borderRadius: "999px",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
  },
  /* Overrides must repeat the `border` shorthand rather than set borderColor —
     React warns (and can mis-apply) when a rerender mixes the two forms. */
  searchBarFocused: {
    border: "1px solid rgba(var(--eco-c9-rgb), 0.40)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c9-rgb), 0.12)",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "12.5px",
    fontFamily: "inherit",
    color: AD.ink,
    width: "170px",
    maxWidth: "36vw",
  },
  iconBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.85)",
    border: `1px solid ${AD.line}`,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: AD.inkSoft,
    cursor: "pointer",
    transition: "background 0.18s ease, color 0.18s ease",
  },
  iconBtnActive: {
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.22)",
    color: AD.green,
  },
  headerBadge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    minWidth: "17px",
    height: "17px",
    padding: "0 4px",
    borderRadius: "999px",
    background: AD.rose,
    color: "#fff",
    fontSize: "9.5px",
    fontWeight: 850,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #fff",
  },
  notifPanel: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "10px",
    width: "320px",
    maxWidth: "calc(100vw - 40px)",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: `1px solid ${AD.line}`,
    borderRadius: `${AD.radius}px`,
    boxShadow: "0 18px 44px rgba(var(--eco-c19-rgb), 0.14)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  notifHead: {
    padding: "13px 16px",
    borderBottom: `1px solid ${AD.lineSoft}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  notifRow: {
    padding: "12px 16px",
    borderBottom: `1px solid ${AD.lineSoft}`,
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  notifDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "6px",
  },
  adminProfile: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c9))",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 850,
    fontSize: "15px",
    boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.28)",
    cursor: "default",
  },
  // Profile photo variant of adminProfile.
  adminProfilePhoto: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1.5px solid rgba(255,255,255,0.9)",
    boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.28)",
  },
  /* Every tab body uses this, so its padding is the console's content gutter.
     It scales with the viewport rather than sitting at a flat 24px: on a phone
     that flat value plus the panel's own frame ate enough width to force the
     stat grid down to a single column. */
  dashboardContainer: {
    padding: "clamp(14px, 2vw, 22px) clamp(14px, 2.2vw, 24px) clamp(18px, 2.5vw, 28px)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  /* 158px, not 178px: the dashboard has exactly seven tiles, and at the
     full-screen console's width 178px only fits six of them — leaving the
     seventh alone on a second row. The lower floor keeps the row intact. */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(158px, 1fr))",
    gap: "14px",
  },
  statCard: {
    padding: "16px 17px",
    background: AD.surface,
    border: `1px solid ${AD.line}`,
    borderRadius: `${AD.radius}px`,
    boxShadow: AD.shadow,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  },
  statCardHover: {
    transform: "translateY(-3px)",
    boxShadow: AD.shadowLift,
  },
  statIconWrap: {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    background: "rgba(255,255,255,0.92)",
    border: `1px solid ${AD.line}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(var(--eco-c19-rgb), 0.03)",
  },
  trendBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 7px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 850,
    color: AD.ink,
    letterSpacing: "-0.6px",
    lineHeight: 1.15,
  },
  statLabel: {
    fontSize: "12px",
    color: AD.inkSoft,
    fontWeight: 600,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  chartCard: {
    padding: "18px 20px",
    background: AD.surface,
    border: `1px solid ${AD.line}`,
    borderRadius: `${AD.radius}px`,
    boxShadow: AD.shadow,
    boxSizing: "border-box",
    minWidth: 0,
  },
  cardHeading: {
    fontSize: "15px",
    fontWeight: 850,
    color: AD.ink,
    letterSpacing: "-0.2px",
    margin: 0,
  },
  chartWrapper: {
    width: "100%",
    height: "140px",
    marginTop: "16px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  textBtn: {
    background: "transparent",
    border: "none",
    color: AD.green,
    fontSize: "12px",
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
    padding: 0,
  },
  /* Wide tables get their own horizontal scroller so a 12-column Orders table
     never widens the whole page. Wrap `<table style={styles.table}>` in a
     `<div style={styles.tableScroll}>`. */
  tableScroll: {
    width: "100%",
    overflowX: "auto",
    marginTop: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    marginTop: "12px",
  },
  tr: {
    borderBottom: `1px solid ${AD.lineSoft}`,
  },
  editInput: {
    padding: "7px 10px",
    borderRadius: "9px",
    border: `1px solid ${AD.line}`,
    background: "rgba(255,255,255,0.9)",
    fontSize: "12px",
    fontFamily: "inherit",
    color: AD.ink,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  actionBtn: {
    padding: "6px",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  },
  th: {
    padding: "11px 10px",
    fontSize: "10.5px",
    fontWeight: 800,
    color: AD.inkFaint,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: `1px solid ${AD.line}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 10px",
    fontSize: "12.5px",
    color: "rgba(var(--eco-c19-rgb), 0.86)",
    borderBottom: `1px solid ${AD.lineSoft}`,
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
