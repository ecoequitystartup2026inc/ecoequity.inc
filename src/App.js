import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { fetchProducts } from "./data/products";
import { fetchConfig, saveConfig, fetchCollection, saveCollection } from "./data/adminContent";
import { isSupabaseConfigured } from "./supabaseClient";
import { MODAL_LAYER, modalOverlay, nestedConfirmOverlay } from "./styles/modal";
import { signIn, signUp, signOut, getCurrentUser, getUserFromSession, onAuthChange, resendConfirmation, consumeAuthErrorFromUrl, saveProfilePic, requestPasswordReset, updatePassword, verifyPassword, passwordProblem, PASSWORD_MIN_LENGTH, arrivedFromRecoveryLink, describeAuthError, isValidEmail, isExistingAccount } from "./data/auth";
import AuthPanels from "./components/AuthPanels";
import AboutUs from "./pages/AboutUs";
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
import SpecialistCertification, { defaultCourses as defaultCertCourses } from "./pages/SpecialistCertification"; // Page + course seed data (managed via Admin Portal)
import AIChatInterface from "./AIChatInterface";
import SustainabilityAppMarket from "./pages/SustainabilityAppMarket";
import ExpertSupportPage, { defaultAdvisors } from "./pages/ExpertSupportPage"; // Import the new ExpertSupportPage + specialist seed data
import ImpactTrackingPage from "./pages/ImpactTrackingPage"; // Import the new ImpactTrackingPage
import NativeSeedBankPage from "./pages/NativeSeedBankPage"; // Import the new NativeSeedBankPage
import LGUPartnershipPage from "./pages/LGUPartnershipPage"; // Import the new LGU Partnership Page
import OurImpactPage from "./pages/OurImpactPage"; // Import the new OurImpactPage
import SurplusExchangePage, { defaultSurplusListings, defaultRestaurantDemands } from "./pages/SurplusExchangePage"; // Corrected path + marketplace seed data
/* pages/CheckoutPage.js is deliberately not imported: it is a second checkout
   written entirely in Tailwind classes, and this project has no Tailwind build,
   so it rendered as unstyled HTML. The "CheckoutPage" nav target now opens the
   shop's checkout instead — see the ShopAllProducts render below. */
import AdminPortal, { mockSubscribers, mockEventsList, mockScansList, mockContentList, mockDiseaseLibrary, mockDeliveriesList, mockRiders, mockUsers, mockTransactions } from "./pages/AdminPortal"; // Import the AdminPortal + shared seed data
import { SUBSCRIPTION_PLANS_STORAGE_KEY, initialSubscriptionPlans } from "./subscriptionPlans";
import { ECO_PROGRAM_STORAGE_KEY, defaultEcoProgram, ecoIcon, tierProgress, tierRangeLabel, rewardAvailability, pointsSummary, nextBadgeProgress, earnRuleStats } from "./data/ecoProgram"; // EcoPoints program authored in the Admin Portal
import { normalizeMember, nextMemberId } from "./data/platformUsers"; // Shared member record behind the profile dashboard
import { fetchEcoState, earnPoints, earnOrderPoints, redeemRewardRemote, fetchRewardClaims, REDEMPTION_FILTERS } from "./data/ecoPoints"; // Per-user EcoPoints balance + ledger
// User-generated records. Unlike the admin collections above these are owned by
// a person, so they load per-user on sign-in and save one row at a time.
import { fetchMyOrders, saveOrder } from "./data/orders";
import { fetchMyTickets, saveTicket } from "./data/supportTickets";
import { fetchForumPosts, saveForumPost } from "./data/forum";
import { fetchMyScans, saveScan } from "./data/plantScans";
import { saveFeedback, fetchAllFeedback } from "./data/siteFeedback";
import SeasonalHarvestPage from "./pages/SeasonalHarvestPage";
import FarmPlannerPage, { defaultPlannerConfig } from "./pages/FarmPlannerPage";
import CommunityForumPage, { forumSeedPosts } from "./pages/CommunityForumPage";
import SupportTicketModal from "./SupportTicketModal";
import SiteFeedbackWidget from "./SiteFeedbackWidget";

import EventsAndWorkshopsPage from "./pages/EventsAndWorkshopsPage"; // Import the new EventsAndWorkshopsPage
import { FaRobot, FaTrash, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaChevronDown, FaBell } from "react-icons/fa";
import { Leaf, Users, Sprout, Sun, Activity, HeartPulse, Globe, MessageCircle, Droplet, Wheat, Microscope, Bug, Share2, Store, TrendingUp, Handshake, Sparkles, Home, Headset, Award, GraduationCap, Wrench, Calendar, CircleUserRound, Gift, Trees, Building2, Star, PartyPopper, CheckCircle2, Check, Flower2, MapPin, Bike, Recycle, Package, Shovel, Carrot, Cherry, Citrus, Salad, X, Moon, Mail, CheckCircle, Scissors, Flame, Megaphone, Heart, Settings as SettingsIcon, UserCog, Ticket, ShoppingBag, Trash2, Camera, ImagePlus, BadgeCheck, FileText as FileTextIcon, ShieldOff, KeyRound, LogOut, Monitor } from "lucide-react";
import { SectionHead, StatStrip, EmptyState, Toggle, Pill, IconChip, Panel, Field, ProductThumb, MeterBar, RewardCard, dashCard, dashInput, dashPrimaryBtn, dashGhostBtn, dashToneBtn, dashLabel, DASH, tone as dashTone } from "./components/DashboardUI"; // Shared profile-dashboard design system
import ColorThemePicker, { PRIMARY_COLOR_PRESETS, ACCENT_ALT_COLOR_PRESETS, SECONDARY_COLOR_PRESETS, BUTTON_COLOR_PRESETS, BUTTON_GRADIENT_PRESETS, suggestedPairFor } from "./components/ColorThemePicker"; // Primary/secondary brand colour chooser
import { applyThemeRamp, readableInk, DEFAULT_PRIMARY, DEFAULT_SECONDARY, parseButtonGradient, buttonBackground, buttonInk } from "./theme"; // Regenerates the sage ramp from the chosen pair
import { BiCalendarEvent } from "react-icons/bi";
import { isMobileViewport } from "./mobile";
import LandingSections from "./components/LandingSections"; // Below-the-fold landing content
import HomeHero from "./components/HomeHero"; // Desktop landing screen (split-panel)
import SiteFooter from "./components/SiteFooter"; // Home page footer

// Maps an email address to its provider's web inbox, so the "Open Email" button
// can jump the user straight to where the confirmation email landed.
const emailInboxUrl = (email) => {
  const domain = (String(email).split("@")[1] || "").toLowerCase();
  const map = {
    "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
    "googlemail.com": "https://mail.google.com/mail/u/0/#inbox",
    "yahoo.com": "https://mail.yahoo.com",
    "outlook.com": "https://outlook.live.com/mail/0/",
    "hotmail.com": "https://outlook.live.com/mail/0/",
    "live.com": "https://outlook.live.com/mail/0/",
    "icloud.com": "https://www.icloud.com/mail",
    "proton.me": "https://mail.proton.me/u/0/inbox",
    "protonmail.com": "https://mail.proton.me/u/0/inbox",
  };
  return map[domain] || null;
};

// Chrome shared by the small centred auth dialogs (signup confirmation, the
// three password-reset steps) — one card look, one field look, so the flow
// doesn't change appearance halfway through.
const authModalCard = {
  width: "100%",
  maxWidth: "420px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(var(--eco-c0-rgb), 0.96))",
  borderRadius: "24px",
  padding: "32px 28px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
  textAlign: "center",
  animation: "scaleUp 0.3s ease",
};

const authModalIconWrap = {
  width: "72px",
  height: "72px",
  margin: "0 auto 18px",
  borderRadius: "50%",
  background: "rgba(var(--eco-c7-rgb), 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const authModalInput = {
  width: "100%",
  padding: "13px 15px",
  fontSize: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(var(--eco-c9-rgb), 0.28)",
  background: "rgba(255,255,255,0.9)",
  outline: "none",
  color: "var(--eco-c19)",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const authModalError = { fontSize: "12.5px", color: "var(--eco-c13)", fontWeight: 600, textAlign: "left", lineHeight: 1.45 };

const authModalGhostBtn = {
  width: "100%",
  padding: "10px",
  fontSize: "13px",
  fontWeight: 600,
  border: "none",
  background: "transparent",
  color: "rgba(0,0,0,0.55)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const navItems = ["Home", "About Us", "Product & Services", "Target Market", "Seasonal Harvest", "Community"];

// Every destination sits in the navbar itself — there is no hamburger panel to
// fall back to, so this has to stay in step with navItems or a page becomes
// unreachable. Target Market and Seasonal Harvest carry their own dropdowns,
// which open on hover in the bar (see renderNavItem's `collapsed=false` form).
const inlineNavItems = navItems;

const initialProducts = [
  { id: 1, name: "Heirloom Tomatoes", category: "Organic Edibles", price: 150, image: "/tomato.png", badge: "Best Seller", stock: "In Stock", emoji: <Cherry size="1em" color="#dc2626" />, description: "Freshly harvested, pesticide-free organic tomatoes, perfect for salads and cooking.", sustainabilityBadge: "Eco-Friendly", rating: 4.8, reviewCount: 124, reviews: [{user: "Maria G.", rating: 5, comment: "Very fresh and juicy!"}, {user: "Jose P.", rating: 4, comment: "Good quality."}] },
  { id: 2, name: "Basil Grow Kit", category: "Herbs", price: 350, image: "/basil.png", badge: "New", stock: "Low Stock", emoji: <Leaf size="1em" color="var(--eco-c9)" />, description: "Everything you need to grow your own aromatic basil at home. Includes seeds, soil, and pot.", sustainabilityBadge: "Sustainable", rating: 4.5, reviewCount: 89, reviews: [{user: "Ana D.", rating: 5, comment: "Sprouted in just a few days. Love it!"}] },
  { id: 3, name: "Sampaguita Starter", category: "Floriculture", price: 200, image: "/sampaguita.png", stock: "In Stock", emoji: <Flower2 size="1em" color="#db2777" />, description: "Smells wonderful, arrived healthy.", sustainabilityBadge: "Local & Organic", rating: 4.9, reviewCount: 210, reviews: [{user: "Luz V.", rating: 5, comment: "Smells wonderful, arrived healthy."}] },
  { id: 4, name: "Native Adlai Seeds", category: "Native Seeds", price: 250, image: "/adlai.png", badge: "Organic", stock: "In Stock", emoji: <Wheat size="1em" color="#d97706" />, description: "High-quality native Adlai seeds, a healthy and sustainable alternative to rice.", sustainabilityBadge: "Local & Organic", rating: 4.7, reviewCount: 56, reviews: [{user: "Mark T.", rating: 4, comment: "Great alternative to rice, high yield."}] },
  { id: 5, name: "Premium Potting Mix", category: "Soil Mixes", price: 280, image: "/potting_mix.png", stock: "Low Stock", emoji: <Sprout size="1em" color="var(--eco-c9)" />, description: "Nutrient-rich organic potting mix, ideal for all types of plants and urban gardens.", sustainabilityBadge: "Recycled Content", rating: 4.6, reviewCount: 340, reviews: [{user: "Rene C.", rating: 5, comment: "My plants are thriving with this mix."}] },
  { id: 6, name: "Ergonomic Hand Trowel", category: "Gardening Tools", price: 450, image: "/trowel.png", stock: "In Stock", emoji: <Shovel size="1em" color="var(--eco-c11)" />, description: "Sturdy and comfortable to hold.", sustainabilityBadge: "Essential", rating: 4.8, reviewCount: 112, reviews: [{user: "Sam L.", rating: 5, comment: "Sturdy and comfortable to hold."}] },
  { id: 7, name: "Organic Eggplant", category: "Organic Edibles", price: 120, image: "/eggplant.png", stock: "In Stock", emoji: <Salad size="1em" color="#7c3aed" />, description: "Fresh, but a bit smaller than expected.", sustainabilityBadge: "Eco-Friendly", rating: 4.3, reviewCount: 45, reviews: [{user: "Karen B.", rating: 4, comment: "Fresh, but a bit smaller than expected."}] },
  { id: 8, name: "Peppermint Seeds", category: "Herbs", price: 90, image: "/mint.png", stock: "In Stock", emoji: <Sprout size="1em" color="var(--eco-c9)" />, description: "Grows very fast!", sustainabilityBadge: "Sustainable", rating: 4.5, reviewCount: 78, reviews: [{user: "Leo M.", rating: 5, comment: "Grows very fast!"}] },
  { id: 9, name: "Compost Booster", category: "Soil Mixes", price: 320, image: "/compost.png", badge: "Eco", stock: "In Stock", emoji: <Recycle size="1em" color="var(--eco-c9)" />, description: "Speeds up composting significantly.", sustainabilityBadge: "Eco-Friendly", rating: 4.9, reviewCount: 150, reviews: [{user: "Gina R.", rating: 5, comment: "Speeds up composting significantly."}] },
  { id: 10, name: "Urban Farming Starter Kit", category: "Starter Kits", price: 1200, image: "/starter_kit.png", badge: "Popular", stock: "In Stock", emoji: <Package size="1em" color="var(--eco-c11)" />, description: "Everything you need to start your urban farm. Includes varied seeds, tools, and premium soil.", sustainabilityBadge: "Eco-Friendly", rating: 4.9, reviewCount: 88, reviews: [{user: "Sarah L.", rating: 5, comment: "Amazing kit to get started!"}] },
  { id: 11, name: "Calamansi Seedling", category: "Organic Edibles", price: 180, image: "/calamansi.png", badge: "New", stock: "In Stock", emoji: <Citrus size="1em" color="#f59e0b" />, description: "Healthy grafted calamansi seedling, ready to transplant. Bears fruit within 2-3 years.", sustainabilityBadge: "Local & Organic", rating: 4.7, reviewCount: 63, reviews: [{user: "Ramon D.", rating: 5, comment: "Arrived healthy with lots of leaves!"}] },
  { id: 12, name: "Organic Carrots", category: "Organic Edibles", price: 140, image: "/carrot.png", stock: "In Stock", emoji: <Carrot size="1em" color="#ea580c" />, description: "Sweet, crunchy carrots grown without synthetic pesticides in the Benguet highlands.", sustainabilityBadge: "Eco-Friendly", rating: 4.6, reviewCount: 97, reviews: [{user: "Ella S.", rating: 5, comment: "So sweet and crunchy, kids love them."}] },
  { id: 13, name: "Lemongrass (Tanglad) Bundle", category: "Herbs", price: 110, image: "/lemongrass.png", stock: "In Stock", emoji: <Leaf size="1em" color="#65a30d" />, description: "Fresh tanglad stalks with roots intact — cook with them or replant in your garden.", sustainabilityBadge: "Local & Organic", rating: 4.8, reviewCount: 132, reviews: [{user: "Nora F.", rating: 5, comment: "Very fragrant, replanted two stalks and they took root."}] },
  { id: 14, name: "Sunflower Seed Pack", category: "Floriculture", price: 130, image: "/sunflower.png", badge: "New", stock: "In Stock", emoji: <Sun size="1em" color="#f59e0b" />, description: "Giant sunflower variety, easy to grow and pollinator-friendly. About 20 seeds per pack.", sustainabilityBadge: "Sustainable", rating: 4.6, reviewCount: 71, reviews: [{user: "Bea C.", rating: 4, comment: "Most seeds germinated within a week."}] },
  { id: 15, name: "Heirloom Black Rice Seeds", category: "Native Seeds", price: 300, image: "/black_rice.png", badge: "Organic", stock: "Low Stock", emoji: <Wheat size="1em" color="#7c2d12" />, description: "Traditional pigmented rice seeds from Cordillera farmers, rich in antioxidants.", sustainabilityBadge: "Local & Organic", rating: 4.9, reviewCount: 41, reviews: [{user: "Igor A.", rating: 5, comment: "Rare find, great germination rate."}] },
  { id: 16, name: "Vermicast Organic Fertilizer", category: "Soil Mixes", price: 260, image: "/vermicast.png", badge: "Eco", stock: "In Stock", emoji: <Recycle size="1em" color="var(--eco-c9)" />, description: "Pure worm castings that enrich soil naturally — gentle enough for seedlings.", sustainabilityBadge: "Eco-Friendly", rating: 4.8, reviewCount: 118, reviews: [{user: "Paolo V.", rating: 5, comment: "My seedlings grew noticeably faster."}] },
  { id: 17, name: "Garden Pruning Shears", category: "Gardening Tools", price: 390, image: "/pruning_shears.png", stock: "In Stock", emoji: <Scissors size="1em" color="#475569" />, description: "Sharp stainless-steel bypass shears with a comfortable non-slip grip and safety lock.", sustainabilityBadge: "Essential", rating: 4.7, reviewCount: 84, reviews: [{user: "Dan R.", rating: 5, comment: "Clean cuts, feels solid in hand."}] },
  { id: 18, name: "Okra Seeds", category: "Organic Edibles", price: 95, image: "/okra.png", stock: "In Stock", emoji: <Sprout size="1em" color="var(--eco-c9)" />, description: "Fast-growing native okra variety that thrives in warm Philippine weather. About 30 seeds per pack.", sustainabilityBadge: "Local & Organic", rating: 4.5, reviewCount: 52, reviews: [{user: "Tess M.", rating: 5, comment: "Sprouted in 5 days, very reliable seeds."}] },
  { id: 19, name: "Malunggay Seedling", category: "Organic Edibles", price: 150, image: "/malunggay.png", badge: "Best Seller", stock: "In Stock", emoji: <Trees size="1em" color="var(--eco-c11)" />, description: "Hardy moringa seedling packed with nutrients — a low-maintenance superfood tree for any backyard.", sustainabilityBadge: "Local & Organic", rating: 4.9, reviewCount: 143, reviews: [{user: "Lito B.", rating: 5, comment: "Grew fast, harvesting leaves within months."}] },
  { id: 20, name: "Oregano Plant", category: "Herbs", price: 160, image: "/oregano.png", stock: "In Stock", emoji: <Leaf size="1em" color="var(--eco-c9)" />, description: "Established Filipino oregano in a nursery pot — aromatic, medicinal, and nearly impossible to kill.", sustainabilityBadge: "Sustainable", rating: 4.7, reviewCount: 66, reviews: [{user: "Cely N.", rating: 5, comment: "Thick healthy leaves, arrived well-packed."}] },
  { id: 21, name: "Gumamela Cutting", category: "Floriculture", price: 170, image: "/gumamela.png", stock: "In Stock", emoji: <Flower2 size="1em" color="#dc2626" />, description: "Rooted hibiscus cutting in classic red — blooms year-round and attracts butterflies.", sustainabilityBadge: "Local & Organic", rating: 4.6, reviewCount: 58, reviews: [{user: "Vina O.", rating: 4, comment: "Rooted well, first bloom after a month."}] },
  { id: 22, name: "Native Mung Bean Seeds", category: "Native Seeds", price: 120, image: "/mungbean.png", badge: "Organic", stock: "In Stock", emoji: <Sprout size="1em" color="#ca8a04" />, description: "Locally sourced munggo seeds for sprouting or field planting — a natural soil nitrogen fixer.", sustainabilityBadge: "Local & Organic", rating: 4.6, reviewCount: 74, reviews: [{user: "Jun P.", rating: 5, comment: "Great germination, made fresh togue in 4 days."}] },
  { id: 23, name: "Cocopeat Grow Blocks", category: "Soil Mixes", price: 190, image: "/cocopeat.png", badge: "Eco", stock: "In Stock", emoji: <Recycle size="1em" color="#92400e" />, description: "Compressed coconut coir blocks that expand into a light, water-retaining growing medium.", sustainabilityBadge: "Recycled Content", rating: 4.7, reviewCount: 105, reviews: [{user: "Mika T.", rating: 5, comment: "One block expanded so much, great value."}] },
  { id: 24, name: "Drip Irrigation Kit", category: "Gardening Tools", price: 650, image: "/drip_kit.png", badge: "New", stock: "Low Stock", emoji: <Droplet size="1em" color="#0ea5e9" />, description: "Water-saving drip kit for up to 20 plants — timers, tubing, and drippers included.", sustainabilityBadge: "Eco-Friendly", rating: 4.8, reviewCount: 39, reviews: [{user: "Arlo G.", rating: 5, comment: "Cut my watering time to zero, plants love it."}] },
  { id: 25, name: "Herb Garden Starter Kit", category: "Starter Kits", price: 850, image: "/herb_kit.png", badge: "Popular", stock: "In Stock", emoji: <Package size="1em" color="var(--eco-c11)" />, description: "Grow basil, mint, and oregano from one box — pots, soil discs, seeds, and a care guide included.", sustainabilityBadge: "Sustainable", rating: 4.8, reviewCount: 92, reviews: [{user: "Faye R.", rating: 5, comment: "Perfect gift, everything you need is inside."}] },
  { id: 26, name: "Pechay Seeds", category: "Organic Edibles", price: 85, image: "/pechay.png", stock: "In Stock", emoji: <Salad size="1em" color="var(--eco-c9)" />, description: "Quick-harvest native pechay — ready to eat in just 30 days, perfect for container gardens.", sustainabilityBadge: "Local & Organic", rating: 4.6, reviewCount: 88, reviews: [{user: "Rosa E.", rating: 5, comment: "Harvested in a month, super easy to grow."}] },
  { id: 27, name: "Sili Labuyo Seedling", category: "Organic Edibles", price: 135, image: "/labuyo.png", badge: "Hot", stock: "In Stock", emoji: <Flame size="1em" color="#dc2626" />, description: "Fiery native bird's eye chili seedling — compact, productive, and thrives in pots.", sustainabilityBadge: "Local & Organic", rating: 4.8, reviewCount: 67, reviews: [{user: "Ben K.", rating: 5, comment: "Loaded with chilis after two months!"}] },
  { id: 28, name: "Pandan Plant", category: "Herbs", price: 145, image: "/pandan.png", stock: "In Stock", emoji: <Leaf size="1em" color="var(--eco-c11)" />, description: "Fragrant pandan in a nursery pot — fresh leaves on demand for rice, drinks, and desserts.", sustainabilityBadge: "Local & Organic", rating: 4.7, reviewCount: 79, reviews: [{user: "Ina C.", rating: 5, comment: "So fragrant, my kitchen staple now."}] },
  { id: 29, name: "Waling-Waling Orchid Seedling", category: "Floriculture", price: 450, image: "/walingwaling.png", badge: "Rare", stock: "Low Stock", emoji: <Flower2 size="1em" color="#7c3aed" />, description: "The queen of Philippine orchids — nursery-propagated seedling with care instructions included.", sustainabilityBadge: "Local & Organic", rating: 4.9, reviewCount: 34, reviews: [{user: "Cora H.", rating: 5, comment: "Healthy roots, a dream to finally own one."}] },
  { id: 30, name: "Native Ube Tubers", category: "Native Seeds", price: 220, image: "/ube.png", badge: "Organic", stock: "In Stock", emoji: <Sprout size="1em" color="#7c3aed" />, description: "Planting-grade purple yam tubers from local growers — grow your own ube at home.", sustainabilityBadge: "Local & Organic", rating: 4.7, reviewCount: 48, reviews: [{user: "Manny Q.", rating: 5, comment: "Sprouted quickly, excited for harvest."}] },
  { id: 31, name: "Carbonized Rice Hull", category: "Soil Mixes", price: 150, image: "/rice_hull.png", badge: "Eco", stock: "In Stock", emoji: <Wheat size="1em" color="#57534e" />, description: "Upcycled rice hulls that improve drainage and aeration — a Filipino farming classic.", sustainabilityBadge: "Recycled Content", rating: 4.6, reviewCount: 93, reviews: [{user: "Oscar D.", rating: 5, comment: "My potting mix drains so much better now."}] },
  { id: 32, name: "Bamboo Garden Stakes (10 pcs)", category: "Gardening Tools", price: 120, image: "/bamboo_stakes.png", stock: "In Stock", emoji: <Trees size="1em" color="#92400e" />, description: "Sturdy locally sourced bamboo stakes for supporting tomatoes, beans, and climbing vines.", sustainabilityBadge: "Sustainable", rating: 4.5, reviewCount: 61, reviews: [{user: "Pia W.", rating: 4, comment: "Strong stakes, good length for tomatoes."}] },
  { id: 33, name: "Kids Gardening Kit", category: "Starter Kits", price: 950, image: "/kids_kit.png", badge: "New", stock: "In Stock", emoji: <Gift size="1em" color="#db2777" />, description: "Child-friendly tools, fast-sprouting seeds, and activity cards to get little hands growing.", sustainabilityBadge: "Sustainable", rating: 4.9, reviewCount: 45, reviews: [{user: "Joy A.", rating: 5, comment: "My daughter checks her sprouts every morning!"}] },
];

const initialHarvests = [
  { id: 1, name: "Heirloom Tomatoes", category: "Vegetables", months: ["March", "April", "May", "June"], peak: "May", icon: <Cherry size="1em" color="#dc2626" />, estDate: "May 15", location: "Benguet", region: "Luzon", countdown: "Starts in 12 days", weather: "Sunny", risk: "Low", demand: "High Demand", priceTrend: "₱120-150/kg", plantingMonth: "January", yield: "High", water: "Medium", soil: "Loamy", temp: "20-28°C", pestRisk: "Medium", suppliers: 5, restaurantMatches: 3, growthProgress: 85 },
  { id: 2, name: "Sweet Mangoes", category: "Fruits", months: ["March", "April", "May", "June"], peak: "April", icon: <Citrus size="1em" color="#f59e0b" />, estDate: "April 20", location: "Guimaras", region: "Visayas", countdown: "Active", weather: "Sunny", risk: "Low", demand: "High Demand", priceTrend: "₱180-220/kg", plantingMonth: "June", yield: "Medium", water: "Low", soil: "Well-drained", temp: "25-35°C", pestRisk: "High", suppliers: 12, restaurantMatches: 8, growthProgress: 95 },
  { id: 3, name: "Basil Genovese", category: "Herbs", months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], peak: "June", icon: <Leaf size="1em" color="var(--eco-c9)" />, estDate: "Year-round", location: "Urban Farms", region: "All Regions", countdown: "Ongoing", weather: "Partial Sun", risk: "Low", demand: "Medium Demand", priceTrend: "₱300-400/kg", plantingMonth: "Any", yield: "High", water: "High", soil: "Moist", temp: "20-30°C", pestRisk: "Low", suppliers: 8, restaurantMatches: 15, growthProgress: 60 },
  { id: 4, name: "Native Adlai", category: "Grains", months: ["October", "November", "December", "January"], peak: "November", icon: <Wheat size="1em" color="#d97706" />, estDate: "Nov 10", location: "Bukidnon", region: "Mindanao", countdown: "150 days", weather: "Rainy", risk: "Medium", demand: "High Demand", priceTrend: "₱250-280/kg", plantingMonth: "May", yield: "Medium", water: "Medium", soil: "Adaptable", temp: "22-30°C", pestRisk: "Low", suppliers: 3, restaurantMatches: 5, growthProgress: 40 },
  { id: 5, name: "Baguio Strawberries", category: "Fruits", months: ["December", "January", "February", "March", "April"], peak: "February", icon: <Cherry size="1em" color="#e11d48" />, estDate: "Feb 14", location: "La Trinidad", region: "Luzon", countdown: "200 days", weather: "Cool", risk: "Medium", demand: "High Demand", priceTrend: "₱300-450/kg", plantingMonth: "September", yield: "Medium", water: "High", soil: "Acidic", temp: "15-22°C", pestRisk: "High", suppliers: 2, restaurantMatches: 10, growthProgress: 25 },
  { id: 6, name: "Organic Eggplant", category: "Vegetables", months: ["June", "July", "August", "September"], peak: "July", icon: <Salad size="1em" color="#7c3aed" />, estDate: "July 05", location: "Pangasinan", region: "Luzon", countdown: "45 days", weather: "Sunny", risk: "Low", demand: "Medium Demand", priceTrend: "₱80-120/kg", plantingMonth: "March", yield: "High", water: "Medium", soil: "Loamy", temp: "25-32°C", pestRisk: "Medium", suppliers: 6, restaurantMatches: 2, growthProgress: 75 },
  { id: 7, name: "Sweet Corn", category: "Vegetables", months: ["April", "May", "June", "July"], peak: "May", icon: <Wheat size="1em" color="#ca8a04" />, estDate: "May 25", location: "Isabela", region: "Luzon", countdown: "22 days", weather: "Sunny", risk: "Low", demand: "High Demand", priceTrend: "₱50-80/kg", plantingMonth: "February", yield: "High", water: "High", soil: "Well-drained", temp: "20-30°C", pestRisk: "Medium", suppliers: 10, restaurantMatches: 6, growthProgress: 80 },
  { id: 8, name: "Watermelon", category: "Fruits", months: ["March", "April", "May"], peak: "April", icon: <Citrus size="1em" color="var(--eco-c9)" />, estDate: "April 10", location: "Ilocos", region: "Luzon", countdown: "Active", weather: "Hot", risk: "Low", demand: "High Demand", priceTrend: "₱40-60/kg", plantingMonth: "January", yield: "High", water: "Low", soil: "Sandy", temp: "25-35°C", pestRisk: "Low", suppliers: 8, restaurantMatches: 4, growthProgress: 100 },
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

const ORDERS_STORAGE_KEY = "ecoequity_orders";
const SUPPORT_TICKETS_STORAGE_KEY = "ecoequity_support_tickets";
const PRODUCTS_STORAGE_KEY = "ecoequity_products";
const HARVESTS_STORAGE_KEY = "ecoequity_harvests";
const PROMOCODES_STORAGE_KEY = "ecoequity_promocodes";
const PLANT_SCANS_STORAGE_KEY = "ecoequity_plant_scans";
const PLANT_DISEASES_STORAGE_KEY = "ecoequity_plant_diseases";
const SUBSCRIBERS_STORAGE_KEY = "ecoequity_subscribers";
const EVENTS_STORAGE_KEY = "ecoequity_events";
const CONTENT_STORAGE_KEY = "ecoequity_content";
const FORUM_POSTS_STORAGE_KEY = "ecoequity_forum_posts";
const FARM_PLANNER_STORAGE_KEY = "ecoequity_farm_planner";
const ADMIN_SETTINGS_STORAGE_KEY = "ecoequity_admin_settings";
const BROADCASTS_STORAGE_KEY = "ecoequity_broadcasts";
const ADVISORS_STORAGE_KEY = "ecoequity_advisors";
const SURPLUS_LISTINGS_STORAGE_KEY = "ecoequity_surplus_listings";
const SURPLUS_DEMANDS_STORAGE_KEY = "ecoequity_surplus_demands";
const CERT_COURSES_STORAGE_KEY = "ecoequity_cert_courses";
const SITE_FEEDBACK_STORAGE_KEY = "ecoequity_site_feedback";
const DELIVERIES_STORAGE_KEY = "ecoequity_deliveries";
const RIDERS_STORAGE_KEY = "ecoequity_riders";
const PLATFORM_USERS_STORAGE_KEY = "ecoequity_platform_users";
const TRANSACTIONS_STORAGE_KEY = "ecoequity_transactions";
const NEW_SIGNUP_STORAGE_KEY = "ecoequity_new_signup";
// Profile photos, keyed by lowercased email rather than stored as one value —
// two people signing in from the same browser must not inherit each other's
// face. With Supabase configured this is only a local mirror of profiles.profile_pic.
const AVATARS_STORAGE_KEY = "ecoequity_avatars";
// One member's own colour override. Empty strings mean "follow the site
// default the admin set" — this browser only, never pushed back to the admin.
const USER_THEME_STORAGE_KEY = "ecoequity_user_theme";
// light | dark | system. "system" follows the OS setting, so it is stored as
// the intent rather than as the light/dark it happens to resolve to today.
const THEME_MODE_STORAGE_KEY = "themeMode";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
/** Whether the OS asks for a dark UI. False wherever matchMedia is missing. */
const prefersDarkScheme = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(DARK_SCHEME_QUERY).matches
    : false;

/**
 * One labelled strip of colour circles for the appearance popover — the same
 * presets Settings → Appearance offers, shrunk to swatches.
 *
 * A preset whose value is the empty string means "follow the theme" (the
 * Automatic entry in the button list); it paints `fallback` behind a dashed
 * edge so it reads as inherited rather than as a colour of its own.
 *
 * `data-no-invert` keeps the swatches showing their true colour in dark mode,
 * and the tick is a plain div rather than an icon because the dark-mode rules
 * flatten icons inside un-inverted islands to white — invisible on the pale
 * surface swatches.
 */
function AppearanceSwatchRow({ label, presets, selected, onSelect, fallback }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {presets.map((preset) => {
          const isSelected = preset.value.toLowerCase() === String(selected || "").toLowerCase();
          const base = preset.value || fallback || DEFAULT_PRIMARY;
          // Button picks may be a two-stop gradient; the swatch shows the sweep
          // while the selection ring, which can't take one, uses its first stop.
          const gradient = parseButtonGradient(base);
          const swatch = buttonBackground(base);
          const ring = gradient ? gradient.from : base;
          return (
            <button
              key={preset.value || "inherit"}
              type="button"
              data-no-invert
              aria-label={preset.name}
              aria-pressed={isSelected}
              title={preset.note ? `${preset.name} — ${preset.note}` : preset.name}
              onClick={() => onSelect(preset.value)}
              style={{
                width: "24px",
                height: "24px",
                padding: 0,
                borderRadius: "999px",
                background: swatch,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: preset.value ? "1px solid rgba(0,0,0,0.16)" : "2px dashed rgba(0,0,0,0.4)",
                boxShadow: isSelected ? `0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px ${ring}` : "none",
                transition: "box-shadow 0.2s ease",
              }}
            >
              {isSelected && (
                <div style={{ width: "8px", height: "8px", borderRadius: "999px", background: buttonInk(base) }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// A fresh account should land on its own dashboard, not the marketing home.
// The flag lives in localStorage because email confirmation takes the user out
// of the app and back in on a brand-new page load, where React state is gone.
const markNewSignup = () => {
  try { localStorage.setItem(NEW_SIGNUP_STORAGE_KEY, "1"); } catch { /* private mode */ }
};
const consumeNewSignup = () => {
  try {
    if (localStorage.getItem(NEW_SIGNUP_STORAGE_KEY) !== "1") return false;
    localStorage.removeItem(NEW_SIGNUP_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

// Convert the admin Broadcast Notifications feed into the shape the customer
// notification bell expects ({ id, title, message, time, read }). Keeps the
// read flag from any prior copy so refreshes don't re-mark items unread.
const broadcastsToNotifications = (broadcasts, prev = []) =>
  (Array.isArray(broadcasts) ? broadcasts : []).map((b) => {
    const existing = prev.find((n) => n.id === b.id);
    return {
      id: b.id,
      title: b.title,
      message: b.title ? `${b.title} — ${b.message}` : b.message,
      time: b.time || "Just now",
      read: existing ? existing.read : false,
    };
  });

// Portal-wide configuration authored from the Admin Portal > Settings module.
const defaultAdminSettings = {
  platformName: "EcoEquity",
  supportEmail: "ecoequity.inc2026@gmail.com",
  maintenanceMode: false,
  admins: [
    { id: "ADM-001", name: "Juan Dela Cruz", role: "Super Admin", twoFactor: true, isYou: true },
  ],
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

// Generic localStorage-backed initializer: returns the saved array if valid,
// otherwise falls back to the provided seed data.
const getStoredArray = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

// Same as getStoredArray but for a plain config object (e.g. Farm Planner
// settings). Shallow-merges over the fallback so newly added default keys
// survive an older saved blob.
const getStoredObject = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...fallback, ...parsed } : fallback;
  } catch (error) {
    return fallback;
  }
};

// --- Profile photo -----------------------------------------------------------
// The largest square that gets stored. A 320px source still looks sharp in the
// 86px circle on a 3x screen, and keeps the encoded string small enough that a
// handful of accounts fit inside localStorage's ~5MB.
const AVATAR_MAX_PX = 320;
const AVATAR_MAX_FILE_BYTES = 8 * 1024 * 1024;

const storedAvatar = (email) =>
  (email && getStoredObject(AVATARS_STORAGE_KEY, {})[email.toLowerCase()]) || null;

const storeAvatar = (email, dataUrl) => {
  if (!email) return;
  try {
    const all = getStoredObject(AVATARS_STORAGE_KEY, {});
    const key = email.toLowerCase();
    if (dataUrl) all[key] = dataUrl;
    else delete all[key];
    localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    /* private mode, or the photo pushed the store over quota */
  }
};

// Turns a picked file into something storable. A photo straight off a phone is
// several megabytes and mostly wasted on a 64px circle, so it is centre-cropped
// to a square and re-encoded at AVATAR_MAX_PX. The result is a data URL on
// purpose: an object URL is only valid for the life of the document, so a saved
// one comes back broken after a reload.
const readAvatarFile = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("That file isn't an image."));
      return;
    }
    if (file.size > AVATAR_MAX_FILE_BYTES) {
      reject(new Error("That image is over 8MB — pick a smaller one."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = Math.min(side, AVATAR_MAX_PX);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image couldn't be read."));
    };
    img.src = url;
  });

// React elements (a product's `emoji`, a harvest's `icon`) don't survive
// JSON serialization to localStorage — after a reload they come back as plain
// objects that are truthy but invalid React children, which crashes rendering
// ("Objects are not valid as a React child"). Re-attach a real element by
// matching each saved item to its seed by id, falling back to a default icon.
// Created at module scope on purpose. JSX built during a component's render
// carries a `_owner` pointer back into the React fiber tree, and these fallbacks
// end up inside `products` / `harvests`, which are written to localStorage with
// JSON.stringify — stringifying an owner-bearing element walks fiber -> DOM node
// -> container -> fiber and throws "Converting circular structure to JSON".
// Module-scope elements have a null owner, so they serialize harmlessly.
const SPROUT_ICON_FALLBACK = <Sprout size="1em" color="var(--eco-c9)" />;
const WHEAT_ICON_FALLBACK = <Wheat size="1em" color="var(--eco-c9)" />;

const hydrateIcons = (items, seed, field, fallback) =>
  items.map((it) => {
    if (React.isValidElement(it[field])) return it;
    const match = seed.find((s) => s.id === it.id);
    return { ...it, [field]: match && React.isValidElement(match[field]) ? match[field] : fallback };
  });

// Mirrors an admin-managed collection to Supabase whenever it changes, so an
// admin edit reaches every other user's browser instead of only this one.
// `enabled` gates on admin + configured + initial load done: the first render
// after it flips true just adopts whatever was loaded, so opening the app never
// writes the database back to itself. Writes are debounced because the Admin
// Portal edits these arrays on every keystroke.
const useSupabaseSync = (enabled, value, save, label) => {
  const lastSynced = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const json = JSON.stringify(value);
    if (lastSynced.current === null) { lastSynced.current = json; return; }
    if (lastSynced.current === json) return;
    lastSynced.current = json;
    const timer = setTimeout(() => {
      Promise.resolve(save(value)).catch((err) =>
        console.error(`Failed to save ${label} to Supabase:`, err)
      );
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, value]);
};

// Persists rows the signed-in user CREATES, for the per-row entities (orders,
// support tickets, forum posts, plant scans). Deliberately different from
// useSupabaseSync above: those are admin collections replaced wholesale, these
// grow one row at a time and each row belongs to a person.
//
// The first run after `enabled` flips true adopts whatever is already on screen
// as the baseline and writes nothing. That is what keeps the built-in sample
// records (ORD-9824, SCN-8821 …) out of the database — they belong to nobody,
// and the insert policies require the owner column to equal auth.uid(), so
// pushing them would just collect RLS errors. Only rows added afterwards, by
// this user, in this session, are new.
const useSupabaseRowSync = (enabled, list, save, label) => {
  const known = useRef(null);
  useEffect(() => {
    if (!enabled) { known.current = null; return; }
    const items = list || [];
    if (known.current === null) {
      known.current = new Set(items.map((r) => String(r.id)));
      return;
    }
    const fresh = items.filter((r) => !known.current.has(String(r.id)));
    if (!fresh.length) return;
    // Mark before awaiting so a re-render mid-flight can't queue a duplicate.
    fresh.forEach((r) => known.current.add(String(r.id)));
    fresh.forEach((r) =>
      Promise.resolve(save(r)).catch((err) =>
        console.error(`Failed to save ${label} to Supabase:`, err)
      )
    );
  }, [enabled, list]); // eslint-disable-line react-hooks/exhaustive-deps
};

// Database rows first, then anything local the database doesn't have. Used when
// a user signs in on a new device: their real records lead, the built-in sample
// rows stay behind them so the screens are never empty.
const mergeById = (local, incoming) => {
  const seen = new Set((incoming || []).map((r) => String(r.id)));
  return [...(incoming || []), ...(local || []).filter((r) => !seen.has(String(r.id)))];
};

const getInitialOrders = () => getStoredArray(ORDERS_STORAGE_KEY, initialOrders);

const getInitialSupportTickets = () => getStoredArray(SUPPORT_TICKETS_STORAGE_KEY, []);

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
            color: 'var(--eco-c13)'
          }} 
          size={12} 
        />
      </button>
      {isOpen && (
        <div className="inner-blur-glass custom-scrollbar" style={styles.customDropdownList}>
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} style={{ ...styles.customDropdownItem, ...(value === opt ? styles.customDropdownItemActive : {}) }}>
              <span>{opt}</span>
              {value === opt && <FaCheckCircle size={14} style={{ color: 'var(--eco-c13)' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Just the photo — the sidebar's copy, which identifies the account and nothing
// more. Everything that changes the photo lives on the My Profile page.
const AvatarCircle = ({ src, name, size = 64, busy }) => (
  <div style={{
    width: `${size}px`, height: `${size}px`, borderRadius: "50%",
    background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex",
    alignItems: "center", justifyContent: "center",
    border: "2px solid var(--eco-c11)", overflow: "hidden", flexShrink: 0,
    opacity: busy ? 0.55 : 1, transition: "opacity 0.2s ease",
    boxShadow: size >= 80 ? "0 12px 26px rgba(var(--eco-c9-rgb), 0.16)" : "none",
  }}>
    {src ? (
      <img src={src} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <span style={{ fontSize: `${Math.round(size * 0.37)}px`, fontWeight: 800, color: "var(--eco-c13)" }}>
        {name ? name.charAt(0).toUpperCase() : "U"}
      </span>
    )}
  </div>
);

// The same circle, plus the controls that change it — one instance, at the head
// of the My Profile page. It was a bare circle wired straight to a hidden file
// input: nothing said it could be clicked, and once a photo was set there was no
// way to take it off again. The camera badge now opens a menu, so both actions
// are visible and the upload is a deliberate choice rather than a mis-click.
const AvatarEditor = ({ src, name, size = 64, align = "left", busy, error, onFile, onRemove }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const badge = Math.round(size * 0.33);
  // Centred under a centred avatar (mobile), left-aligned under the sidebar's
  // row layout, where the name sits to the right of the circle.
  const popoverX = align === "center"
    ? { left: "50%", transform: "translateX(-50%)" }
    : { left: 0 };
  const menuItem = (key, danger) => ({
    display: "flex", alignItems: "center", gap: "10px", width: "100%",
    padding: "10px 12px", borderRadius: "12px", border: "none",
    background: hovered === key ? "rgba(var(--eco-c9-rgb), 0.09)" : "transparent",
    color: danger ? DASH.rose : "var(--eco-c15)",
    fontSize: "13.5px", fontWeight: 700, fontFamily: "inherit",
    textAlign: "left", cursor: "pointer", transition: "background 0.15s ease",
  });

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change profile photo"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          position: "relative", display: "block", lineHeight: 0, padding: 0,
          border: "none", background: "transparent", borderRadius: "50%",
          cursor: busy ? "progress" : "pointer",
        }}
      >
        <AvatarCircle src={src} name={name} size={size} busy={busy} />
        <div style={{
          position: "absolute", bottom: 0, right: 0, background: "var(--eco-c11)",
          borderRadius: "50%", width: `${badge}px`, height: `${badge}px`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #fff",
        }}>
          <Camera size={Math.round(badge * 0.52)} color="#fff" strokeWidth={2.6} />
        </div>
      </button>

      {/* The message below takes this same spot, so a rejected file replaces
          the menu rather than hiding behind it. */}
      {open && !error && (
        <div
          role="menu"
          style={{
            position: "absolute", top: `${size + 12}px`, ...popoverX, zIndex: 20,
            width: "224px", padding: "6px", borderRadius: "16px",
            // Solid, not the usual translucent glass: at 0.95 the name and
            // email underneath ghost through the menu, and another
            // backdrop-filter layer is not worth paying for here.
            background: "#fff",
            border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
            boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.18)",
            display: "flex", flexDirection: "column", gap: "2px",
          }}
        >
          <button
            type="button" role="menuitem" style={menuItem("upload")}
            onMouseEnter={() => setHovered("upload")} onMouseLeave={() => setHovered(null)}
            onClick={() => { setOpen(false); inputRef.current?.click(); }}
          >
            <ImagePlus size={16} strokeWidth={2.2} />
            {src ? "Change photo" : "Upload a photo"}
          </button>
          {src && (
            <button
              type="button" role="menuitem" style={menuItem("remove", true)}
              onMouseEnter={() => setHovered("remove")} onMouseLeave={() => setHovered(null)}
              onClick={() => { setOpen(false); onRemove(); }}
            >
              <Trash2 size={16} strokeWidth={2.2} />
              Remove photo
            </button>
          )}
          <div style={{ padding: "4px 12px 8px", fontSize: "11px", lineHeight: 1.5, color: DASH.inkFaint, fontWeight: 600 }}>
            JPG or PNG, up to 8MB. It's cropped to a square for you.
          </div>
        </div>
      )}

      {/* Cleared after every pick so choosing the same file twice still fires. */}
      <input
        ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onFile(file); }}
      />

      {error && (
        <div style={{
          position: "absolute", top: `${size + 12}px`, ...popoverX, zIndex: 21,
          width: "224px", padding: "9px 12px", borderRadius: "12px",
          // Tint over solid white, for the same reason the menu is opaque —
          // the sidebar's own labels sit directly behind this.
          background: "linear-gradient(rgba(var(--eco-c9-rgb), 0.10), rgba(var(--eco-c9-rgb), 0.10)), #fff",
          border: "1px solid rgba(var(--eco-c9-rgb), 0.22)",
          boxShadow: "0 12px 26px rgba(var(--eco-c7-rgb), 0.14)",
          color: DASH.rose, fontSize: "11.5px", fontWeight: 700, lineHeight: 1.45,
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// The profile dashboard's sidebar, grouped rather than one flat list of nine.
// "Account" is deliberately first and on its own — who you are and the controls
// for the account itself, kept apart from the things you've done (Activity) and
// earned (Rewards). `desktopOnly` keeps the two EcoPoints tabs off the mobile
// strip, where they live under the EcoPoints menu instead.
const DASHBOARD_SECTIONS = [
  {
    section: "Account",
    items: [
      { key: "profile", label: "My Profile", Icon: CircleUserRound },
      { key: "settings", label: "Account Settings", Icon: SettingsIcon },
    ],
  },
  {
    section: "Activity",
    items: [
      { key: "orders", label: "Order History", Icon: Package },
      { key: "updates", label: "Updates", Icon: Megaphone },
      { key: "wishlist", label: "Wishlist", Icon: Heart },
      { key: "support", label: "Support Tickets", Icon: Headset },
    ],
  },
  {
    section: "Rewards",
    items: [
      { key: "ecopoints", label: "EcoPoints & Rewards", Icon: Gift, desktopOnly: true },
      { key: "earnHistory", label: "Earn History", Icon: Activity, desktopOnly: true },
      { key: "certificate", label: "My Certificate", Icon: Award },
    ],
  },
];

function App() {
  const [activeNav, setActiveNavPage] = useState("Login");
  const [isMobile, setIsMobile] = useState(isMobileViewport);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null); // State for navigation buttons
  const [activeHeroTab, setActiveHeroTab] = useState("crop"); // State for right card tabs
  const [rightCardHovered, setRightCardHovered] = useState(false); // State for the right card
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null); // State for line chart tooltips
  const [hoveredStatBadge, setHoveredStatBadge] = useState(null); // State for stat badges
  const [chatHovered, setChatHovered] = useState(false); // State for 'Chat with AI' button
  const [showAIChat, setShowAIChat] = useState(false); // State for showing AI chat interface
  // A conversation handed over from another page (currently the AI Plant Doctor
  // passing its scan result). `id` bumps on every handover so the chat panel is
  // remounted and picks the seed up even when it is already open.
  const [aiChatSeed, setAIChatSeed] = useState(null);
  const [statsStripHovered, setStatsStripHovered] = useState(false); // State for the stats strip panel
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false); // State for Target Market dropdown
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // State for hovering dropdown items
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false); // New state for Product & Services dropdown
  const [hoveredProductDropdown, setHoveredProductDropdown] = useState(null); // New state for Product & Services dropdown items
  const [isSeasonalDropdownOpen, setIsSeasonalDropdownOpen] = useState(false); // State for Seasonal Harvest dropdown
  const [hoveredSeasonalDropdown, setHoveredSeasonalDropdown] = useState(null); // State for Seasonal Harvest dropdown items
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false); // Separated terms from rememberMe
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for logged-in status
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const [signupModal, setSignupModal] = useState(null); // { email } -> "check your email" modal after signup
  const [welcomeModal, setWelcomeModal] = useState(false); // shown after the email confirmation link returns
  const [resendState, setResendState] = useState("idle"); // idle | sending | sent
  // The three steps of the password-reset flow, each its own modal:
  //   forgotModal   — "email me a link", from the login screen
  //   recoveryModal — "set a new password", after that emailed link returns
  //   changePasswordModal — the same, started from Settings → Security
  const [forgotModal, setForgotModal] = useState(null); // { email, status: idle|sending|sent, error }
  const [recoveryModal, setRecoveryModal] = useState(null); // { password, confirm, status: idle|saving|done, error }
  const [changePasswordModal, setChangePasswordModal] = useState(null); // { current, password, confirm, status, error }
  const [loggedInUser, setLoggedInUser] = useState(""); // State for user name
  const [profilePic, setProfilePic] = useState(null); // State for user profile picture
  const [avatarBusy, setAvatarBusy] = useState(false); // decoding/downscaling a picked photo
  const [avatarError, setAvatarError] = useState(null); // why the last pick was rejected
  const [hoveredSettingsTab, setHoveredSettingsTab] = useState(null); // State for settings sidebar hover
  const [showSettingsModal, setShowSettingsModal] = useState(false); // State for Settings modal
  // Appearance mode, picked in the dark-mode button's popover. Builds before
  // "System" existed stored a plain `darkMode` boolean, so fall back to that
  // once instead of resetting anyone to light.
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return localStorage.getItem("darkMode") === "true" ? "dark" : "light";
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(prefersDarkScheme);
  const darkMode = themeMode === "system" ? systemPrefersDark : themeMode === "dark";
  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);
  const [showRewardSuccessModal, setShowRewardSuccessModal] = useState(false); // State for reward redemption success modal
  const [settingsTab, setSettingsTab] = useState("profile"); // State for Settings Modal Tabs
  // Member's personal primary/secondary override, chosen in Account Settings →
  // Appearance. Blank fields fall through to the admin's site-wide pair.
  const [userTheme, setUserTheme] = useState(() => getStoredObject(USER_THEME_STORAGE_KEY, { primary: "", secondary: "", button: "" }));
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success popup
  const [authMessage, setAuthMessage] = useState(null); // State for auth feedback messages (text and type)
  const [formErrorShake, setFormErrorShake] = useState(false); // State for shake error animation
  // EcoPoints balance + ledger. With Supabase configured these belong to the
  // signed-in user and are loaded from the database on login (see loadEcoState
  // below); the seeds are the offline demo, so a real project starts at zero
  // rather than flashing someone else's sample balance.
  const [ecoPoints, setEcoPoints] = useState(isSupabaseConfigured ? 0 : 1250);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [redeemHistory, setRedeemHistory] = useState(isSupabaseConfigured ? [] : [
    { reward: "Free Delivery Voucher", points: "-500", date: "May 20, 2026", status: "Active" },
    { reward: "Native Seed Kit", points: "-1,200", date: "Apr 15, 2026", status: "Shipped" }
  ]);
  // The user's own points ledger. `icon` is an EcoPoints icon name (see data/ecoProgram).
  const [earnHistory, setEarnHistory] = useState(isSupabaseConfigured ? [] : [
    { action: "Buy Organic Products", points: 50, date: "May 27, 2026", icon: "ShoppingCart" },
    { action: "Complete AI Diagnosis", points: 30, date: "May 25, 2026", icon: "Bot" },
    { action: "Invite Friend", points: 200, date: "May 20, 2026", icon: "UserPlus" },
  ]);
  // Whose EcoPoints are currently loaded — the Supabase auth id, or null when
  // signed out / running offline. Gates every points write.
  const [ecoUserId, setEcoUserId] = useState(null);
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
  // Marketplace controls: search text, sort order and the "only what I can
  // afford right now" toggle.
  const [rewardSearch, setRewardSearch] = useState("");
  const [rewardSort, setRewardSort] = useState("Recommended");
  const [affordableOnly, setAffordableOnly] = useState(false);
  // { [rewardId]: how many the whole community has claimed } — only known with
  // Supabase configured, so a limited reward reads "unlimited" offline.
  const [rewardClaims, setRewardClaims] = useState({});
  const ecoPointsDropdownRef = useRef(null);
  const redeemFilterDropdownRef = useRef(null);
  // Badges the user unlocked by tapping a locked one. The badge catalog itself
  // lives in the admin-managed EcoPoints program; `earned` is derived below.
  const [unlockedBadgeNames, setUnlockedBadgeNames] = useState([]);
  const [justUnlockedBadge, setJustUnlockedBadge] = useState(null);
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
  const [products, setProducts] = useState(() => hydrateIcons(getStoredArray(PRODUCTS_STORAGE_KEY, initialProducts), initialProducts, "emoji", SPROUT_ICON_FALLBACK)); // Global product state
  const [harvests, setHarvests] = useState(() => hydrateIcons(getStoredArray(HARVESTS_STORAGE_KEY, initialHarvests), initialHarvests, "icon", WHEAT_ICON_FALLBACK)); // Global harvests state
  const [promoCodes, setPromoCodes] = useState(() => getStoredArray(PROMOCODES_STORAGE_KEY, initialPromoCodes)); // Global promo codes state
  const [supportTickets, setSupportTickets] = useState(getInitialSupportTickets);
  // Shared domain data synced between the main website and the Admin Portal
  const [plantScans, setPlantScans] = useState(() => getStoredArray(PLANT_SCANS_STORAGE_KEY, mockScansList));
  const [plantDiseases, setPlantDiseases] = useState(() => getStoredArray(PLANT_DISEASES_STORAGE_KEY, mockDiseaseLibrary));
  const [subscribers, setSubscribers] = useState(() => getStoredArray(SUBSCRIBERS_STORAGE_KEY, mockSubscribers));
  const [events, setEvents] = useState(() => getStoredArray(EVENTS_STORAGE_KEY, mockEventsList));
  const [contentItems, setContentItems] = useState(() => getStoredArray(CONTENT_STORAGE_KEY, mockContentList));
  const [forumPosts, setForumPosts] = useState(() => getStoredArray(FORUM_POSTS_STORAGE_KEY, forumSeedPosts));
  const [farmPlanner, setFarmPlanner] = useState(() => getStoredObject(FARM_PLANNER_STORAGE_KEY, defaultPlannerConfig));
  const [advisors, setAdvisors] = useState(() => getStoredArray(ADVISORS_STORAGE_KEY, defaultAdvisors));
  const [surplusListings, setSurplusListings] = useState(() => getStoredArray(SURPLUS_LISTINGS_STORAGE_KEY, defaultSurplusListings));
  const [surplusDemands, setSurplusDemands] = useState(() => getStoredArray(SURPLUS_DEMANDS_STORAGE_KEY, defaultRestaurantDemands));
  // Course `icon` fields are React elements, so run the saved copy through
  // hydrateIcons (see the products/harvests note above) to avoid reload crashes.
  const [certCourses, setCertCourses] = useState(() => hydrateIcons(getStoredArray(CERT_COURSES_STORAGE_KEY, defaultCertCourses), defaultCertCourses, "icon", SPROUT_ICON_FALLBACK));
  const [adminSettings, setAdminSettings] = useState(() => getStoredObject(ADMIN_SETTINGS_STORAGE_KEY, defaultAdminSettings));
  const [showSupportTicketModal, setShowSupportTicketModal] = useState(false);
  const [supportFabHovered, setSupportFabHovered] = useState(false);
  // Mobile only: whether the floating support actions are expanded.
  const [isSupportClusterOpen, setIsSupportClusterOpen] = useState(false);
  // The app shell — on mobile it is the page's scroll container.
  const shellRef = useRef(null);
  // Desktop Home scroller: the hero fills the first screen, the landing
  // sections live below it. Used by the "scroll to explore" cue.
  const homeScrollRef = useRef(null);
  // Site-experience feedback (how the app feels to use) — distinct from product reviews.
  const [siteFeedback, setSiteFeedback] = useState(() => getStoredArray(SITE_FEEDBACK_STORAGE_KEY, []));
  // Admin-owned records that the client screens also read (deliveries drive Track Order,
  // plans drive the AI Data Subscription pricing cards).
  const [deliveries, setDeliveries] = useState(() => getStoredArray(DELIVERIES_STORAGE_KEY, mockDeliveriesList));
  const [riders, setRiders] = useState(() => getStoredArray(RIDERS_STORAGE_KEY, mockRiders));
  const [platformUsers, setPlatformUsers] = useState(() => getStoredArray(PLATFORM_USERS_STORAGE_KEY, mockUsers));
  const [transactions, setTransactions] = useState(() => getStoredArray(TRANSACTIONS_STORAGE_KEY, mockTransactions));
  const [subscriptionPlans, setSubscriptionPlans] = useState(() => getStoredArray(SUBSCRIPTION_PLANS_STORAGE_KEY, initialSubscriptionPlans));
  // Rewards, earn rules, tiers, badges, impact stats and the referral offer that
  // the EcoPoints dashboard renders — all authored in the Admin Portal.
  const [ecoProgram, setEcoProgram] = useState(() => getStoredObject(ECO_PROGRAM_STORAGE_KEY, defaultEcoProgram));
  // Flips true once the initial Supabase load settles, so the sync effects below
  // don't write the seed data back over the database on startup.
  const [adminContentLoaded, setAdminContentLoaded] = useState(false);
  // Same idea for the signed-in user's own records. Gating the row-sync on this
  // is what stops rows just fetched from the database being written straight
  // back as if the user had created them.
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  // Whether an admin has ever published content to the database (see the
  // "Publish to database" action in Admin Portal → Settings).
  const [contentSeeded, setContentSeeded] = useState(false);
  const [publishingContent, setPublishingContent] = useState(false);
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [feedbackFabHovered, setFeedbackFabHovered] = useState(false);

  const [notifications, setNotifications] = useState(() => broadcastsToNotifications(getStoredArray(BROADCASTS_STORAGE_KEY, [])));
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifBadgeAnim, setNotifBadgeAnim] = useState(false);

  // The account button that sits beside the bell in the header. It is its own
  // menu (not the fuller profile accordion inside the hamburger panel), so it
  // gets its own open + hover state.
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [hoveredAccountMenu, setHoveredAccountMenu] = useState(null);
  const accountMenuRef = useRef(null);

  // The appearance popover that hangs off the dark-mode button: light/dark/
  // system plus the accent swatches, so the whole look lives behind one glyph.
  const [isAppearanceMenuOpen, setIsAppearanceMenuOpen] = useState(false);
  const appearanceMenuRef = useRef(null);

  // Open a single header menu exclusively: toggles the requested one and force-closes
  // all the others so dropdowns never stack open at the same time.
  const toggleMenu = (target) => {
    setIsNotificationOpen(target === "notification" ? (v) => !v : false);
    setIsAccountMenuOpen(target === "account" ? (v) => !v : false);
    setIsAppearanceMenuOpen(target === "appearance" ? (v) => !v : false);
    setIsTargetDropdownOpen(target === "target" ? (v) => !v : false);
    setIsProductDropdownOpen(target === "product" ? (v) => !v : false);
    setIsSeasonalDropdownOpen(target === "seasonal" ? (v) => !v : false);
  };

  // Force exactly one menu open (closes every other one).
  const openMenu = (target) => {
    setIsNotificationOpen(target === "notification");
    setIsAccountMenuOpen(target === "account");
    setIsAppearanceMenuOpen(target === "appearance");
    setIsTargetDropdownOpen(target === "target");
    setIsProductDropdownOpen(target === "product");
    setIsSeasonalDropdownOpen(target === "seasonal");
  };

  // The account menu overlays the page, so a click anywhere else — or Escape —
  // dismisses it rather than leaving it hanging over the content.
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onPointerDown = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) setIsAccountMenuOpen(false);
    };
    const onKeyDown = (e) => { if (e.key === "Escape") setIsAccountMenuOpen(false); };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen]);

  // Same dismissal contract for the appearance popover.
  useEffect(() => {
    if (!isAppearanceMenuOpen) return;
    const onPointerDown = (e) => {
      if (appearanceMenuRef.current && !appearanceMenuRef.current.contains(e.target)) setIsAppearanceMenuOpen(false);
    };
    const onKeyDown = (e) => { if (e.key === "Escape") setIsAppearanceMenuOpen(false); };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAppearanceMenuOpen]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      setNotifBadgeAnim(true);
      const t = setTimeout(() => setNotifBadgeAnim(false), 500);
      return () => clearTimeout(t);
    }
  }, [notifications.filter(n => !n.read).length]);

  // Load products from Supabase on mount. Falls back to the existing sample
  // data if Supabase isn't configured or returns nothing, so the app always
  // renders something. This is the first entity migrated off React state.
  useEffect(() => {
    fetchProducts()
      .then((rows) => { if (rows && rows.length) setProducts(rows); })
      .catch((err) => console.error("Failed to load products from Supabase:", err));
  }, []);

  // Load every admin-authored entity from Supabase on mount. These used to live
  // only in localStorage, which meant an admin's edits were invisible to anyone
  // on another browser; now the database is the source of truth and the
  // localStorage copy is just an offline cache.
  //
  // A null result means "not configured / never saved" — the seed data stays.
  // The two collections whose records carry JSX icons go back through
  // hydrateIcons for the same reason they do when read from localStorage.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const warn = (label) => (err) => console.error(`Failed to load ${label} from Supabase:`, err);

    // Until an admin has published once, an empty table means "nothing seeded
    // yet", not "the admin deleted everything" — so keep the sample data rather
    // than blanking the site. After the first publish, empty means empty.
    fetchConfig("content_seeded").catch(() => null).then((seeded) => {
      if (!active) return;
      setContentSeeded(Boolean(seeded));
      const apply = (setter, transform) => (rows) => {
        if (!active || rows === null) return;
        if (Array.isArray(rows) && rows.length === 0 && !seeded) return;
        setter(transform ? transform(rows) : rows);
      };

      return Promise.allSettled([
        fetchConfig("eco_program").then(apply(setEcoProgram, (v) => ({ ...defaultEcoProgram, ...v }))).catch(warn("eco program")),
        fetchConfig("farm_planner").then(apply(setFarmPlanner, (v) => ({ ...defaultPlannerConfig, ...v }))).catch(warn("farm planner")),
        fetchConfig("admin_settings").then(apply(setAdminSettings, (v) => ({ ...defaultAdminSettings, ...v }))).catch(warn("admin settings")),
        fetchCollection("advisors").then(apply(setAdvisors)).catch(warn("advisors")),
        fetchCollection("content_items").then(apply(setContentItems)).catch(warn("content")),
        fetchCollection("deliveries").then(apply(setDeliveries)).catch(warn("deliveries")),
        fetchCollection("riders").then(apply(setRiders)).catch(warn("riders")),
        fetchCollection("subscription_plans").then(apply(setSubscriptionPlans)).catch(warn("subscription plans")),
        fetchCollection("plant_diseases").then(apply(setPlantDiseases)).catch(warn("plant diseases")),
        fetchCollection("admin_events").then(apply(setEvents)).catch(warn("events")),
        fetchCollection("admin_promo_codes").then(apply(setPromoCodes)).catch(warn("promo codes")),
        fetchCollection("cert_courses")
          .then(apply(setCertCourses, (rows) => hydrateIcons(rows, defaultCertCourses, "icon", SPROUT_ICON_FALLBACK)))
          .catch(warn("courses")),
        fetchCollection("admin_harvests")
          .then(apply(setHarvests, (rows) => hydrateIcons(rows, initialHarvests, "icon", WHEAT_ICON_FALLBACK)))
          .catch(warn("harvests")),
        fetchCollection("surplus_listings").then(apply(setSurplusListings)).catch(warn("surplus listings")),
        fetchCollection("surplus_demands").then(apply(setSurplusDemands)).catch(warn("surplus demands")),
      ]);
    }).then(() => { if (active) setAdminContentLoaded(true); });

    return () => { active = false; };
  }, []);

  // The three collections that hold personal data — members, payments and the
  // subscriber list. RLS restricts them to admins, so a customer's session
  // reads back an empty array; loading them on mount would then blank the
  // sample data every customer's profile dashboard reads. So they wait until
  // we know the session is an admin, which is also the only session that can
  // write them back.
  useEffect(() => {
    if (!isSupabaseConfigured || !isAdmin) return;
    let active = true;
    const warn = (label) => (err) => console.error(`Failed to load ${label} from Supabase:`, err);
    const apply = (setter) => (rows) => {
      if (!active || rows === null || (Array.isArray(rows) && rows.length === 0)) return;
      setter(rows);
    };

    Promise.allSettled([
      fetchCollection("platform_users").then(apply(setPlatformUsers)).catch(warn("members")),
      fetchCollection("transactions").then(apply(setTransactions)).catch(warn("transactions")),
      fetchCollection("subscribers").then(apply(setSubscribers)).catch(warn("subscribers")),
      // The star-rating panel by the AI Chat button writes to site_feedback from
      // every visitor's browser, guests included. feedback_read only lets an
      // admin see everyone's, which is why this read lives here rather than on
      // mount — a member would just get their own rows back.
      fetchAllFeedback().then(apply(setSiteFeedback)).catch(warn("site feedback")),
    ]);

    return () => { active = false; };
  }, [isAdmin]);

  // Push admin edits back. Gated on isAdmin because RLS only accepts writes
  // from an admin session — a customer's browser would just collect errors.
  const canSyncAdminContent = isSupabaseConfigured && isAdmin && adminContentLoaded;
  useSupabaseSync(canSyncAdminContent, ecoProgram, (v) => saveConfig("eco_program", v), "eco program");
  useSupabaseSync(canSyncAdminContent, farmPlanner, (v) => saveConfig("farm_planner", v), "farm planner");
  useSupabaseSync(canSyncAdminContent, adminSettings, (v) => saveConfig("admin_settings", v), "admin settings");
  useSupabaseSync(canSyncAdminContent, advisors, (v) => saveCollection("advisors", v), "advisors");
  useSupabaseSync(canSyncAdminContent, certCourses, (v) => saveCollection("cert_courses", v), "courses");
  useSupabaseSync(canSyncAdminContent, contentItems, (v) => saveCollection("content_items", v), "content");
  useSupabaseSync(canSyncAdminContent, deliveries, (v) => saveCollection("deliveries", v), "deliveries");
  useSupabaseSync(canSyncAdminContent, riders, (v) => saveCollection("riders", v), "riders");
  useSupabaseSync(canSyncAdminContent, subscriptionPlans, (v) => saveCollection("subscription_plans", v), "subscription plans");
  useSupabaseSync(canSyncAdminContent, plantDiseases, (v) => saveCollection("plant_diseases", v), "plant diseases");
  useSupabaseSync(canSyncAdminContent, events, (v) => saveCollection("admin_events", v), "events");
  useSupabaseSync(canSyncAdminContent, harvests, (v) => saveCollection("admin_harvests", v), "harvests");
  useSupabaseSync(canSyncAdminContent, promoCodes, (v) => saveCollection("admin_promo_codes", v), "promo codes");
  useSupabaseSync(canSyncAdminContent, surplusListings, (v) => saveCollection("surplus_listings", v), "surplus listings");
  useSupabaseSync(canSyncAdminContent, surplusDemands, (v) => saveCollection("surplus_demands", v), "surplus demands");
  useSupabaseSync(canSyncAdminContent, platformUsers, (v) => saveCollection("platform_users", v), "members");
  useSupabaseSync(canSyncAdminContent, transactions, (v) => saveCollection("transactions", v), "transactions");
  useSupabaseSync(canSyncAdminContent, subscribers, (v) => saveCollection("subscribers", v), "subscribers");

  // Per-row entities the signed-in user creates. Gated on the user's own data
  // having loaded first, so a row that came FROM the database is never written
  // back to it as a new row.
  const canSyncUserData = isSupabaseConfigured && isLoggedIn && userDataLoaded;
  useSupabaseRowSync(canSyncUserData, orders, saveOrder, "order");
  useSupabaseRowSync(canSyncUserData, supportTickets, saveTicket, "support ticket");
  useSupabaseRowSync(canSyncUserData, forumPosts, saveForumPost, "forum post");
  useSupabaseRowSync(canSyncUserData, plantScans, saveScan, "plant scan");

  // One-time bootstrap: pushes everything currently on screen into the database
  // and marks it seeded, so a brand-new Supabase project starts out matching the
  // sample content instead of blank. Also usable later as "force re-publish".
  const handlePublishContent = async () => {
    if (!isSupabaseConfigured || !isAdmin || publishingContent) return;
    setPublishingContent(true);
    try {
      await Promise.all([
        saveConfig("eco_program", ecoProgram),
        saveConfig("farm_planner", farmPlanner),
        saveConfig("admin_settings", adminSettings),
        saveCollection("advisors", advisors),
        saveCollection("cert_courses", certCourses),
        saveCollection("content_items", contentItems),
        saveCollection("deliveries", deliveries),
        saveCollection("riders", riders),
        saveCollection("subscription_plans", subscriptionPlans),
        saveCollection("plant_diseases", plantDiseases),
        saveCollection("admin_events", events),
        saveCollection("admin_harvests", harvests),
        saveCollection("admin_promo_codes", promoCodes),
        saveCollection("surplus_listings", surplusListings),
        saveCollection("surplus_demands", surplusDemands),
        saveCollection("platform_users", platformUsers),
        saveCollection("transactions", transactions),
        saveCollection("subscribers", subscribers),
      ]);
      await saveConfig("content_seeded", true);
      setContentSeeded(true);
      return { ok: true };
    } catch (err) {
      console.error("Failed to publish content to Supabase:", err);
      return { ok: false, error: err.message || String(err) };
    } finally {
      setPublishingContent(false);
    }
  };

  // Restore an existing Supabase session on load (page refresh, or return from
  // an emailed link), and keep app state in sync with login/logout.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    // Returning from the email confirmation link: Supabase appends
    // #access_token=...&type=signup. Show the welcome modal and clean the URL.
    const hash = window.location.hash || "";
    if (hash.includes("type=signup")) {
      setWelcomeModal(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // Returning from a password-reset link. Supabase has already exchanged it
    // for a short-lived recovery session, so the only thing left is to collect
    // the new password — open that modal over whatever page we land on.
    if (arrivedFromRecoveryLink()) {
      setRecoveryModal({ password: "", confirm: "", status: "idle", error: null });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // Returning from a *failed* email link (expired confirmation / reset link,
    // redirect URL not allowlisted). Surface it on the login screen instead of
    // silently landing on the app as a logged-out user.
    const linkError = consumeAuthErrorFromUrl();
    if (linkError) {
      setAuthMessage({ text: linkError, type: "error" });
      setActiveNav("Login");
    }

    getCurrentUser().then((current) => {
      if (!active || !current?.user) return;
      applySession(current);
    });
    const sub = onAuthChange((session, event) => {
      if (!session) { setIsLoggedIn(false); setIsAdmin(false); clearEcoState(); setUserDataLoaded(false); return; }
      // Token refreshes fire with a valid session but shouldn't re-run the
      // navigation side effects in applySession.
      if (event === "TOKEN_REFRESHED") return;
      // Second signal for the reset link, in case supabase-js had already
      // consumed the URL before the check above ran. Never re-opens a modal the
      // user has finished with — this event also fires on session restore.
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryModal((prev) => prev || { password: "", confirm: "", status: "idle", error: null });
      }
      // SIGNED_IN — e.g. returning from a confirmation link. The initial
      // getCurrentUser() above can run before Supabase has parsed the session
      // from the URL, so hydrate from this session to populate name/avatar/email.
      getUserFromSession(session).then((current) => {
        if (active && current?.user) applySession(current);
      });
    });
    return () => { active = false; sub?.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the customer notification bell in sync with admin broadcasts. Admin
  // dispatches a storage event when a broadcast is sent (same-tab and across
  // tabs), so we re-read the feed and merge while preserving read flags.
  useEffect(() => {
    const syncBroadcasts = (e) => {
      if (e && e.key && e.key !== BROADCASTS_STORAGE_KEY) return;
      setNotifications(prev => broadcastsToNotifications(getStoredArray(BROADCASTS_STORAGE_KEY, []), prev));
    };
    window.addEventListener("storage", syncBroadcasts);
    return () => window.removeEventListener("storage", syncBroadcasts);
  }, []);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(SUPPORT_TICKETS_STORAGE_KEY, JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Persist shared data so admin edits and website inputs survive refresh/navigation
  useEffect(() => { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(harvests)); }, [harvests]);
  useEffect(() => { localStorage.setItem(PROMOCODES_STORAGE_KEY, JSON.stringify(promoCodes)); }, [promoCodes]);
  useEffect(() => { localStorage.setItem(PLANT_SCANS_STORAGE_KEY, JSON.stringify(plantScans)); }, [plantScans]);
  useEffect(() => { localStorage.setItem(PLANT_DISEASES_STORAGE_KEY, JSON.stringify(plantDiseases)); }, [plantDiseases]);
  useEffect(() => { localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers)); }, [subscribers]);
  useEffect(() => { localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentItems)); }, [contentItems]);
  useEffect(() => { localStorage.setItem(FORUM_POSTS_STORAGE_KEY, JSON.stringify(forumPosts)); }, [forumPosts]);
  useEffect(() => { localStorage.setItem(FARM_PLANNER_STORAGE_KEY, JSON.stringify(farmPlanner)); }, [farmPlanner]);
  useEffect(() => { localStorage.setItem(ADVISORS_STORAGE_KEY, JSON.stringify(advisors)); }, [advisors]);
  useEffect(() => { localStorage.setItem(SURPLUS_LISTINGS_STORAGE_KEY, JSON.stringify(surplusListings)); }, [surplusListings]);
  useEffect(() => { localStorage.setItem(SURPLUS_DEMANDS_STORAGE_KEY, JSON.stringify(surplusDemands)); }, [surplusDemands]);
  useEffect(() => { localStorage.setItem(CERT_COURSES_STORAGE_KEY, JSON.stringify(certCourses)); }, [certCourses]);
  useEffect(() => { localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(adminSettings)); }, [adminSettings]);
  useEffect(() => { localStorage.setItem(SITE_FEEDBACK_STORAGE_KEY, JSON.stringify(siteFeedback)); }, [siteFeedback]);
  useEffect(() => { localStorage.setItem(DELIVERIES_STORAGE_KEY, JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem(RIDERS_STORAGE_KEY, JSON.stringify(riders)); }, [riders]);
  useEffect(() => { localStorage.setItem(PLATFORM_USERS_STORAGE_KEY, JSON.stringify(platformUsers)); }, [platformUsers]);
  useEffect(() => { localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(subscriptionPlans)); }, [subscriptionPlans]);
  useEffect(() => { localStorage.setItem(ECO_PROGRAM_STORAGE_KEY, JSON.stringify(ecoProgram)); }, [ecoProgram]);

  // A user-submitted AI Plant Doctor scan flows into the Admin Portal
  const handleNewPlantScan = (scan) => setPlantScans(prev => [scan, ...prev]);

  // Opens the docked chat panel. Pass a seed ({ bot, message }) to hand a
  // conversation over from a page; omit it for a plain "chat with AI" open.
  const openAIChat = (seed = null) => {
    // Tolerates being wired straight to an onClick (which hands us an event) or
    // to a legacy `setShowAIChat(true)` call — anything that isn't a seed object
    // just opens a fresh general conversation.
    const isSeed = seed && typeof seed === "object" && typeof seed.bot === "string";
    setAIChatSeed(isSeed ? { ...seed, id: Date.now() } : null);
    setShowAIChat(true);
    setShowFeedbackWidget(false);
    setShowSupportTicketModal(false);
    setIsSupportClusterOpen(false);
  };

  // The AI Plant Doctor is not a page — it is a mode of the docked chat popup,
  // so the page stays visible behind it instead of being taken over by a
  // full-screen section. Anything that still navigates to "AIPlantDoctor"
  // (footer link, landing cards) opens that popup instead of changing pages.
  const setActiveNav = (next) => {
    if (next === "AIPlantDoctor") {
      openAIChat({ bot: "plantDoctor" });
      return;
    }
    setActiveNavPage(next);
  };

  // A user subscribing on the website appears in the Admin Portal subscribers list
  const handleNewSubscriber = (sub) => setSubscribers(prev => [sub, ...prev]);

  // A website event registration syncs the attendee count back to the Admin Portal.
  // Curated events that don't exist in admin yet are surfaced there on first signup.
  const handleEventRegister = (websiteEvent) => {
    if (!websiteEvent || !websiteEvent.title) return;
    setEvents(prev => {
      const idx = prev.findIndex(e => e.title === websiteEvent.title);
      if (idx >= 0) {
        const ev = prev[idx];
        const max = Number(ev.maxAttendees) || Infinity;
        const updated = [...prev];
        updated[idx] = { ...ev, attendees: Math.min((Number(ev.attendees) || 0) + 1, max) };
        return updated;
      }
      const mappedType = websiteEvent.type === "Community Gathering" ? "Community"
        : websiteEvent.type === "Training" ? "Workshop"
        : websiteEvent.type || "Workshop";
      const newId = `EVT-${String(prev.length + 1).padStart(3, "0")}`;
      return [{
        id: newId,
        title: websiteEvent.title,
        date: websiteEvent.date || "",
        time: websiteEvent.time || "",
        type: mappedType,
        attendees: 1,
        maxAttendees: 50,
        status: "Upcoming",
        price: websiteEvent.price || "Free",
        location: websiteEvent.venue || "",
      }, ...prev];
    });
  };

  const handleNotify = (cropName) => {
    setNotifications(prev => [
      { message: `You will be notified when ${cropName} is available or in peak season!`, time: "Just now", read: false },
      ...prev
    ]);
  };

  // Apply a logged-in Supabase user/profile to the app's session state.
  // Takes the whole { user, profile } from getCurrentUser(). Prefers the DB
  // profile, then falls back to the auth user's metadata (name/full_name +
  // email) so the name and email still show even before the profiles row has
  // synced.
  const applySession = (current, fallbackEmail) => {
    const profile = current?.profile;
    const user = current?.user;
    const meta = user?.user_metadata || {};
    const email = user?.email || fallbackEmail || meta.email || "";
    const isAdminUser = Boolean(profile?.is_admin);
    setIsLoggedIn(true);
    setIsAdmin(isAdminUser);
    // A restored session (page reload, or return from an emailed link) leaves the app
    // parked on the auth screen, which hides the whole navbar — move to the
    // landing page. Explicit login/signup flows navigate right after this
    // anyway, so the guard keeps this from touching any other page.
    setActiveNav((prev) =>
      prev === "Login" || prev === "Sign Up"
        ? (isAdminUser ? "Admin Portal" : "Home")
        : prev
    );
    // First arrival after signing up (straight through, or back from the
    // confirmation email) — open the member dashboard over the landing page.
    // An admin account keeps going to the portal instead.
    if (consumeNewSignup() && !isAdminUser) {
      setSettingsTab("profile");
      setShowSettingsModal(true);
    }
    setLoggedInUser(
      profile?.full_name || meta.full_name ||
      (email ? email.split("@")[0] : "User")
    );
    setLoggedInEmail(email);
    const pic = profile?.profile_pic;
    if (pic) setProfilePic(pic);
    // EcoPoints belong to the account, not the browser — pull this user's
    // balance and ledger now that we know who they are.
    if (isSupabaseConfigured && user?.id) {
      loadEcoState(user.id);
      loadUserData(user.id);
    }
    return isAdminUser;
  };

  // Replace the in-memory balance/ledger with this user's database rows.
  const loadEcoState = async (userId) => {
    try {
      const state = await fetchEcoState(userId);
      if (!state) return;
      setEcoUserId(userId);
      setEcoPoints(state.points);
      setEarnHistory(state.earnHistory);
      setRedeemHistory(state.redeemHistory);
      setRedeemedRewards(state.redeemedRewards);
      // Community-wide claim counts drive the "N left" badge on limited
      // rewards. Non-critical: if it fails the cards just show no stock line.
      loadRewardClaims();
    } catch (err) {
      console.error("Failed to load EcoPoints:", err);
    }
  };

  const loadRewardClaims = async () => {
    try {
      const claims = await fetchRewardClaims();
      if (claims) setRewardClaims(claims);
    } catch (err) {
      console.error("Failed to load reward stock:", err);
    }
  };

  // Pull this user's own orders, tickets and scans, plus the shared forum, and
  // merge them ahead of whatever is already on screen. Each read is settled
  // independently: one failing entity must not stop the other three loading,
  // and `userDataLoaded` flips regardless so the row-sync below can start.
  const loadUserData = async (userId) => {
    const warn = (label) => (err) => {
      console.error(`Failed to load ${label} from Supabase:`, err);
      return null;
    };
    const [dbOrders, dbTickets, dbScans, dbPosts] = await Promise.all([
      fetchMyOrders(userId).catch(warn("orders")),
      fetchMyTickets(userId).catch(warn("support tickets")),
      fetchMyScans(userId).catch(warn("plant scans")),
      fetchForumPosts().catch(warn("forum posts")),
    ]);
    if (dbOrders) setOrders((prev) => mergeById(prev, dbOrders));
    if (dbTickets) setSupportTickets((prev) => mergeById(prev, dbTickets));
    if (dbScans) setPlantScans((prev) => mergeById(prev, dbScans));
    if (dbPosts) setForumPosts((prev) => mergeById(prev, dbPosts));
    setUserDataLoaded(true);
  };

  // Every rejected login/signup goes through here: the banner above the form
  // says what went wrong, the card shakes, and `kind` lets the banner offer the
  // next step (jump to Login, reset the password) and lets the form highlight
  // the field at fault — see termsInvalid below.
  const rejectAuth = (text, extra = {}) => {
    setAuthMessage({ text, type: "error", ...extra });
    setFormErrorShake(true);
    setTimeout(() => setFormErrorShake(false), 400);
  };

  // Shown when someone with a live session lands back on Login / Sign Up —
  // without it the form just fails or silently signs them in again.
  const noticeAlreadySignedIn = () => {
    setAuthMessage({
      text: `You're already signed in as ${loggedInUser || loggedInEmail || "a member"}.`,
      type: "info",
      kind: "already-signed-in",
      action: { label: "Go to Home", onClick: () => { setAuthMessage(null); handleNavChange("Home"); } },
    });
  };

  // Hand-off from the Sign Up form when the address already has an account.
  // The password is dropped (it was a new one, not theirs) and the login form
  // opens explaining why it moved, instead of appearing blank for no reason.
  const goToLoginForm = () => {
    setPassword("");
    handleNavChange("Login");
    setAuthMessage({
      text: "You already have an account with this email — log in below, or use \"Forgot Password?\".",
      type: "info",
      kind: "already-registered",
    });
  };

  const handleLogin = async () => {
    if (isLoggedIn) { noticeAlreadySignedIn(); return; }
    if (!email || !password) {
      rejectAuth(
        !email && !password ? "Please enter your email and password."
          : !email ? "Please enter your email address."
          : "Please enter your password.",
        { kind: "missing-fields" },
      );
      return;
    }
    // The field accepts "Email or Phone Number", but Supabase Auth only signs
    // in by email — say so here rather than letting it fail as bad credentials.
    if (isSupabaseConfigured && !isValidEmail(email)) {
      rejectAuth(
        /^[\d\s+()-]+$/.test(email.trim())
          ? "Please log in with the email address you registered with."
          : "That doesn't look like a valid email address. Check it for typos.",
        { kind: "invalid-email" },
      );
      return;
    }

    // Fallback to the original simulated login if Supabase isn't configured.
    if (!isSupabaseConfigured) {
      const adminLogin = email.toLowerCase() === "admin@ecoequity.com" && password === "Ecoequity";
      setAuthMessage({ text: adminLogin ? "Welcome back, Admin!" : `Welcome back! Logged in as ${email}`, type: "success" });
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsAdmin(adminLogin);
        setLoggedInUser(adminLogin ? "Admin" : email.split("@")[0] || "User");
        setLoggedInEmail(email);
        handleNavChange(adminLogin ? "Admin Portal" : "Home");
        setEmail(""); setPassword(""); setAuthMessage(null);
      }, 1500);
      return;
    }

    try {
      setAuthMessage({ text: "Signing you in…", type: "info", kind: "pending" });
      await signIn({ email, password });
      const current = await getCurrentUser();
      const isAdminUser = applySession(current, email);
      setAuthMessage({ text: isAdminUser ? "Welcome back, Admin!" : "Welcome back!", type: "success" });
      // An admin lands in the portal; a member lands on Home. Returning members
      // don't get the profile dashboard thrown at them — it's one tap away in
      // the account menu, and only a brand-new signup opens it automatically
      // (see applySession).
      handleNavChange(isAdminUser ? "Admin Portal" : "Home");
      setEmail(""); setPassword("");
      setTimeout(() => setAuthMessage(null), 1500);
    } catch (err) {
      const { text, kind } = describeAuthError(err, "login");
      // Each failure carries its own way out: a bad password gets the reset
      // link, an unconfirmed address gets the email re-sent.
      const action =
        kind === "wrong-password" ? { label: "Reset my password", onClick: handleForgotPassword }
        : kind === "unconfirmed" ? {
            label: "Re-send the confirmation email",
            onClick: () => { setResendState("idle"); setSignupModal({ email }); setAuthMessage(null); },
          }
        : kind === "already-registered" ? { label: "Go to Sign Up", onClick: () => handleNavChange("Sign Up") }
        : null;
      rejectAuth(text, { kind, ...(action ? { action } : {}) });
    }
  };

  const handleSignUp = async () => {
    if (isLoggedIn) { noticeAlreadySignedIn(); return; }
    if (!fullName || !email || !password) {
      const missing = [!fullName && "your full name", !email && "your email", !password && "a password"].filter(Boolean);
      rejectAuth(`Please enter ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`, { kind: "missing-fields" });
      return;
    }
    if (isSupabaseConfigured && !isValidEmail(email)) {
      rejectAuth(
        /^[\d\s+()-]+$/.test(email.trim())
          ? "Please sign up with an email address — a phone number can't be used to create an account."
          : "That doesn't look like a valid email address. Check it for typos.",
        { kind: "invalid-email" },
      );
      return;
    }
    // Same rule as the reset-password screens, so a password accepted here
    // can't be rejected the next time it's typed.
    const weak = passwordProblem(password);
    if (weak) {
      rejectAuth(weak, { kind: "weak-password" });
      return;
    }
    if (!agreeTerms) {
      rejectAuth("Please tick \"I agree to the Terms & Conditions\" to create your account.", { kind: "terms" });
      return;
    }

    // Fallback to the original simulated signup if Supabase isn't configured.
    if (!isSupabaseConfigured) {
      setAuthMessage({ text: `Account created successfully for ${fullName}!`, type: "success" });
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsAdmin(false); // a self-service signup is never an admin
        setLoggedInUser(fullName.split(" ")[0] || "User");
        setLoggedInEmail(email);
        handleNavChange("Home");
        setSettingsTab("profile");
        setShowSettingsModal(true);
        setFullName(""); setEmail(""); setPassword(""); setAgreeTerms(false); setAuthMessage(null);
      }, 1500);
      return;
    }

    try {
      setAuthMessage({ text: "Creating your account…", type: "info", kind: "pending" });
      // Set before the round trip: with email confirmation on, the user leaves
      // the app here and comes back through the link in a fresh page load.
      markNewSignup();
      const data = await signUp({ email, password, fullName });
      // With email confirmation on, signing up with an address that already
      // exists succeeds quietly (see isExistingAccount) — catching it here is
      // the only way the form can say "that email is already registered"
      // instead of sending the user to an inbox that gets nothing.
      if (isExistingAccount(data)) {
        consumeNewSignup();
        rejectAuth("That email is already registered. Log in instead — or reset the password if you've forgotten it.", {
          kind: "already-registered",
          action: { label: "Go to Login", onClick: goToLoginForm },
        });
        return;
      }
      // If the project requires email confirmation, there's no session yet.
      // Show the "check your email" modal instead of just a banner.
      if (!data.session) {
        setAuthMessage(null);
        setResendState("idle");
        setSignupModal({ email });
        setFullName(""); setPassword(""); setAgreeTerms(false);
        return;
      }
      const current = await getCurrentUser();
      applySession(current, email);
      setAuthMessage({ text: `Welcome, ${fullName}!`, type: "success" });
      handleNavChange("Home");
      setFullName(""); setEmail(""); setPassword(""); setAgreeTerms(false);
      setTimeout(() => setAuthMessage(null), 1500);
    } catch (err) {
      consumeNewSignup(); // no account was created — don't greet the next login with it
      const { text, kind } = describeAuthError(err, "signup");
      rejectAuth(text, {
        kind,
        ...(kind === "already-registered" ? { action: { label: "Go to Login", onClick: goToLoginForm } } : {}),
      });
    }
  };

  const handleResendConfirmation = async () => {
    if (!signupModal?.email || resendState === "sending") return;
    try {
      setResendState("sending");
      await resendConfirmation(signupModal.email);
      setResendState("sent");
    } catch (err) {
      setResendState("idle");
      // Re-sending too soon is the common failure here, and Supabase says how
      // many seconds are left — describeAuthError turns that into plain words.
      window.alert(describeAuthError(err, "signup").text);
    }
  };

  // ── Password reset ──────────────────────────────────────────────────────
  // Step 1: ask where to send the link, prefilled with whatever is already in
  // the login form. The banner sits behind the modal, so errors are inline.
  const handleForgotPassword = () => {
    setAuthMessage(null);
    setForgotModal({ email: email || "", status: "idle", error: null });
  };

  const handleSendResetLink = async () => {
    if (forgotModal?.status === "sending") return;
    const address = (forgotModal?.email || "").trim();
    if (!isValidEmail(address)) {
      setForgotModal((m) => ({ ...m, error: "Enter a valid email address." }));
      return;
    }
    // No backend configured — keep the original simulated confirmation.
    if (!isSupabaseConfigured) {
      setForgotModal((m) => ({ ...m, email: address, status: "sent", error: null }));
      return;
    }
    try {
      setForgotModal((m) => ({ ...m, email: address, status: "sending", error: null }));
      await requestPasswordReset(address);
      setForgotModal((m) => ({ ...m, status: "sent" }));
    } catch (err) {
      setForgotModal((m) => ({ ...m, status: "idle", error: describeAuthError(err, "login").text }));
    }
  };

  // Step 2: the emailed link came back and Supabase handed us a recovery
  // session — save the new password against it.
  const handleSetNewPassword = async () => {
    if (recoveryModal?.status === "saving") return;
    const problem = passwordProblem(recoveryModal?.password, recoveryModal?.confirm);
    if (problem) {
      setRecoveryModal((m) => ({ ...m, error: problem }));
      return;
    }
    // No demo fallback here on purpose: this modal only ever opens off a real
    // recovery link, which can't exist without a configured backend.
    try {
      setRecoveryModal((m) => ({ ...m, status: "saving", error: null }));
      await updatePassword(recoveryModal.password);
      // Drop any leftover recovery params so a refresh doesn't replay a link
      // that has now been spent.
      window.history.replaceState(null, "", window.location.pathname);
      setRecoveryModal((m) => ({ ...m, status: "done", password: "", confirm: "" }));
    } catch (err) {
      setRecoveryModal((m) => ({ ...m, status: "idle", error: err.message || "Could not update your password." }));
    }
  };

  // Settings → Security. Same update, but the user is already signed in, so the
  // current password is checked first (Supabase's updateUser never asks for it).
  const handleChangePassword = async () => {
    if (changePasswordModal?.status === "saving") return;
    const { current, password: next, confirm } = changePasswordModal || {};
    if (!current) {
      setChangePasswordModal((m) => ({ ...m, error: "Enter your current password." }));
      return;
    }
    const problem = passwordProblem(next, confirm);
    if (problem) {
      setChangePasswordModal((m) => ({ ...m, error: problem }));
      return;
    }
    if (next === current) {
      setChangePasswordModal((m) => ({ ...m, error: "Your new password must be different from the current one." }));
      return;
    }
    if (!isSupabaseConfigured) {
      setChangePasswordModal((m) => ({ ...m, status: "done", error: null }));
      return;
    }
    try {
      setChangePasswordModal((m) => ({ ...m, status: "saving", error: null }));
      const ok = await verifyPassword(loggedInEmail, current);
      if (!ok) {
        setChangePasswordModal((m) => ({ ...m, status: "idle", error: "That current password is incorrect." }));
        return;
      }
      await updatePassword(next);
      setChangePasswordModal((m) => ({ ...m, status: "done", current: "", password: "", confirm: "" }));
    } catch (err) {
      setChangePasswordModal((m) => ({ ...m, status: "idle", error: err.message || "Could not change your password." }));
    }
  };

  const handleLogout = (e) => {
    if (e) e.stopPropagation();
    if (isSupabaseConfigured) signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserDataLoaded(false); // next sign-in reloads from the database
    setLoggedInUser("");
    setLoggedInEmail("");
    setProfilePic(null);
    setIsAccountMenuOpen(false);
    setShowSettingsModal(false);
    clearEcoState();
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

  // Offline mirror only. Once Supabase is configured the database is the record
  // and these keys are ignored — see the guarded restore effect further down.
  const saveEcoPointsData = (newPoints, newHistory, newRedeemed, newEarned) => {
    if (isSupabaseConfigured) return;
    if (newPoints !== undefined) localStorage.setItem("ecoPoints", newPoints);
    if (newHistory !== undefined) localStorage.setItem("redeemHistory", JSON.stringify(newHistory));
    if (newRedeemed !== undefined) localStorage.setItem("redeemedRewards", JSON.stringify(newRedeemed));
    if (newEarned !== undefined) localStorage.setItem("earnHistory", JSON.stringify(newEarned));
  };

  const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // True once we have a real database-backed account to post points against.
  const ecoIsRemote = isSupabaseConfigured && Boolean(ecoUserId);

  // Prepend a ledger entry the server just wrote and adopt the balance it
  // returned, so the dashboard matches the database without a re-fetch.
  const applyEarnResult = ({ balance, entry }) => {
    setEcoPoints(balance);
    const nextHistory = entry ? [entry, ...earnHistory] : earnHistory;
    if (entry) setEarnHistory(nextHistory);
    // Mirror onto the admin's member record so Admin Portal → Users shows the
    // same balance and ledger the member sees. Write-only in this direction:
    // with a database account the eco_* tables stay the source of truth.
    updateMyUserRecord({ ecoPoints: balance, earnHistory: nextHistory });
  };

  // A points write the server rejected — a missing earn rule, an unpublished
  // catalog, an expired session. Surface it rather than failing silently.
  const reportEcoError = (err, fallback) => {
    console.error("EcoPoints:", err);
    setErrorMessage(err?.message || fallback);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Earning credits the Earn History tab; redeeming credits Redeem History. They
  // used to share one list, which made every purchase look like a redemption.
  //
  // `amount` is only honoured offline: against the database the amount comes
  // from the admin's earn rule for `reason`, because a browser-supplied number
  // would let anyone mint points (see eco_earn in supabase/schema.sql).
  const addEcoPoints = async (amount, reason) => {
    if (ecoIsRemote) {
      try {
        applyEarnResult(await earnPoints(reason));
      } catch (err) {
        reportEcoError(err, "Could not award EcoPoints.");
      }
      return;
    }
    const newPoints = ecoPoints + amount;
    setEcoPoints(newPoints);
    // Match the reason to an admin-configured earn rule so the log picks up the
    // same icon the "How to Earn" cards use.
    const rule = (ecoProgram.earnRules || []).find(r => r.action === reason);
    const newEntry = { action: reason, points: amount, date: todayLabel(), icon: rule ? rule.icon : "Gift" };
    const newEarned = [newEntry, ...earnHistory];
    setEarnHistory(newEarned);
    saveEcoPointsData(newPoints, undefined, undefined, newEarned);
    updateMyUserRecord({ ecoPoints: newPoints, earnHistory: newEarned });
  };

  // Checkout scales with the order total, so the server applies the admin's
  // rate to the total instead of looking up a flat rule.
  const addOrderEcoPoints = async (orderTotal) => {
    if (ecoIsRemote) {
      try {
        applyEarnResult(await earnOrderPoints(orderTotal));
      } catch (err) {
        reportEcoError(err, "Could not award EcoPoints for this order.");
      }
      return;
    }
    const amount = Math.floor(Number(orderTotal || 0) * ecoEarnRate);
    if (amount > 0) addEcoPoints(amount, "Buy Organic Products");
  };

  const redeemReward = async (reward) => {
    // Stock and per-member limits are enforced in eco_redeem(), but checking
    // here too means a blocked card explains itself instead of round-tripping
    // to a database error.
    const availability = rewardAvailability(reward, ecoPoints, {
      claimed: rewardClaims[reward.id] ?? null,
      myClaims: myRewardClaims[reward.id] || 0,
    });
    if (availability.soldOut || availability.limitReached) {
      setErrorMessage(availability.soldOut
        ? "That reward has been fully claimed."
        : `You have already claimed this reward the maximum ${availability.perUser} time(s).`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (ecoIsRemote) {
      // The cost, the affordability check and the deduction all happen inside
      // one transaction server-side; we only name the reward.
      try {
        const { balance, entry } = await redeemRewardRemote(reward.id);
        setEcoPoints(balance);
        setRedeemHistory(prev => [entry, ...prev]);
        setRedeemedRewards(prev => [reward, ...prev]);
        updateMyUserRecord({ ecoPoints: balance });
        setShowRewardSuccessModal(true);
        setErrorMessage(null);
        loadRewardClaims(); // the "N left" counter just moved for everyone
      } catch (err) {
        reportEcoError(err, "Could not redeem this reward.");
      }
      return;
    }

    // Admin-authored rewards store points as a number; tolerate the old
    // "1,200 pts" string shape so saved redemptions keep working.
    const cost = typeof reward.points === "number"
      ? reward.points
      : parseInt(String(reward.points).replace(/,/g, '').replace(' pts', ''), 10);
    if (ecoPoints >= cost) {
      const newPoints = ecoPoints - cost;
      setEcoPoints(newPoints);

      const newRedeemed = [reward, ...redeemedRewards];
      setRedeemedRewards(newRedeemed);

      const newHistoryEntry = { reward: reward.title, points: `-${cost.toLocaleString()}`, date: todayLabel(), status: "Active" };
      const newHistory = [newHistoryEntry, ...redeemHistory];
      setRedeemHistory(newHistory);

      saveEcoPointsData(newPoints, newHistory, newRedeemed, undefined);
      updateMyUserRecord({ ecoPoints: newPoints });

      setShowRewardSuccessModal(true);
      setErrorMessage(null);
    } else {
      setErrorMessage("Not enough EcoPoints to redeem this reward.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Signed out: drop the previous account's balance so the next user never
  // inherits it (the whole reason points moved out of localStorage).
  const clearEcoState = () => {
    if (!isSupabaseConfigured) return;
    setEcoUserId(null);
    setEcoPoints(0);
    setEarnHistory([]);
    setRedeemHistory([]);
    setRedeemedRewards([]);
  };

  const handleSendRiderMessage = () => {
    if (!riderChatInput.trim()) return;
    setRiderChatMessages(prev => [...prev, { text: riderChatInput, sender: "user" }]);
    setRiderChatInput("");
    setTimeout(() => {
      setRiderChatMessages(prev => [...prev, { text: "Got it, thanks!", sender: "rider" }]);
    }, 1500);
  };

  const handleSupportTicketSubmit = (ticketData) => {
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
    const newTicket = {
      id: ticketId,
      name: ticketData.name,
      email: ticketData.email,
      subject: ticketData.subject,
      category: ticketData.category,
      description: ticketData.description,
      attachmentName: ticketData.attachment?.name || "No attachment",
      status: "Open",
      priority: ticketData.category === "Technical Issue" || ticketData.category === "Bug Report" ? "High" : "Normal",
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      lastUpdate: "Just now",
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    setNotifications(prev => [
      {
        message: `Support ticket ${ticketId} submitted: ${ticketData.subject}`,
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  // Site-experience feedback (the star panel above the support / AI Chat FABs).
  // Unlike a support ticket, this is open to guests, so the database write is
  // not gated on being signed in — site_feedback accepts a null user_id. The
  // write is fire-and-forget: the widget has already thanked the person, and a
  // dropped rating should never turn into an error in their face.
  const handleSiteFeedbackSubmit = (entry) => {
    setSiteFeedback((prev) => [entry, ...prev]);
    addEcoPoints(10, "Experience Feedback");
    saveFeedback(entry).catch((err) =>
      console.error("Failed to save site feedback to Supabase:", err)
    );
  };

  const copyReferralCode = (e) => {
    navigator.clipboard.writeText((ecoProgram.referral || {}).code || "");
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i + 'copy',
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        emoji: [<Sparkles size={16} color="var(--eco-c9)" />, <CheckCircle2 size={16} color="var(--eco-c9)" />, <Star size={16} color="var(--eco-c7)" />, <Leaf size={16} color="var(--eco-c9)" />][Math.floor(Math.random() * 4)],
        angle: Math.random() * Math.PI * 2,
        velocity: 30 + Math.random() * 60
      }));
      setRewardParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => setRewardParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);
    }
  };

  const shareReferral = (platform) => {
    const referral = ecoProgram.referral || {};
    const url = encodeURIComponent(`https://ecoequity.com?ref=${referral.code || ""}`);
    const text = encodeURIComponent(`Join ${adminSettings.platformName || "EcoEquity"} and earn ${Number(referral.points || 0).toLocaleString()} EcoPoints!`);
    let shareUrl = "";
    if (platform === "Facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === "Twitter" || platform === "Twitter / X") shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    if (platform === "WhatsApp") shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    if (shareUrl) window.open(shareUrl, "_blank");
  };

  // Share the admin-authored impact line plus the user's own totals. Uses the
  // native share sheet where there is one (mobile), and falls back to copying
  // the text so the button still does something useful on desktop.
  const shareImpact = async () => {
    const text = `${ecoImpactQuote} — I've earned ${ecoSummary.earned.toLocaleString()} EcoPoints with ${adminSettings.platformName || "EcoEquity"}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My EcoPoints impact", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setSuccessMessage("Impact summary copied to your clipboard.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // AbortError just means the user dismissed the share sheet.
      if (err?.name !== "AbortError") console.error("Share failed:", err);
    }
  };

  const openAccordion = (sectionName) => {
    setEcoPointsSection(sectionName);
  };

  // Notification preferences live on the member's admin record too, so support
  // can see (and set) which channels someone opted into.
  const handleNotificationChange = (key) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    updateMyUserRecord({ notifications: newSettings });
  };


  const unlockBadge = (badgeName, e) => {
    setUnlockedBadgeNames(prev => (prev.includes(badgeName) ? prev : [...prev, badgeName]));
    setJustUnlockedBadge(badgeName);
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i + 'b',
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      emoji: [<Star size={16} color="var(--eco-c7)" />, <Sparkles size={16} color="var(--eco-c9)" />, <Star size={16} color="var(--eco-c7)" />, <Sparkles size={16} color="var(--eco-c9)" />][Math.floor(Math.random() * 4)],
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

  // The admin's directory record for whoever is signed in — role and account status
  // are set in Admin Portal → Users and shown back on the user's own profile.
  const myUserRecord = loggedInEmail
    ? platformUsers.find(u => (u.email || "").toLowerCase() === loggedInEmail.toLowerCase()) || null
    : null;

  // That same record is the shared copy of everything the profile dashboard
  // shows: contact details, EcoPoints balance and ledger, issued certificates,
  // notification preferences and the wishlist. normalizeMember() fills in the
  // fields the older seed rows never had, so both sides can read it blind.
  const myMember = myUserRecord ? normalizeMember(myUserRecord) : null;
  // Effects can't depend on `myMember` — .find() hands back a fresh object every
  // render. This is the stable "has the admin actually changed anything?" key.
  const myMemberKey = myMember
    ? JSON.stringify([
        myMember.name, myMember.phone, myMember.address, myMember.role, myMember.status,
        myMember.ecoPoints, myMember.earnHistory, myMember.certificates, myMember.notifications,
      ])
    : "";

  // --- Profile photo -------------------------------------------------------
  // Signing in against Supabase already brings the photo down from the profiles
  // row; this covers the offline case, where the copy this browser saved is the
  // only one there is. Never overwrites a photo the session already has.
  useEffect(() => {
    if (!loggedInEmail) return;
    setProfilePic((prev) => prev || storedAvatar(loggedInEmail));
  }, [loggedInEmail]);

  // `dataUrl` is a downscaled square, or null to go back to the initial.
  const applyAvatar = async (dataUrl) => {
    setProfilePic(dataUrl);
    storeAvatar(loggedInEmail, dataUrl);
    // Best effort: the local copy above is what the UI reads, so a failed write
    // costs the member their photo on the next device, not on this one.
    try {
      await saveProfilePic(dataUrl);
    } catch (err) {
      console.error("Avatar:", err);
    }
  };

  const handleAvatarFile = async (file) => {
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      await applyAvatar(await readAvatarFile(file));
    } catch (err) {
      setAvatarError(err.message || "That photo couldn't be used.");
      setTimeout(() => setAvatarError(null), 5000);
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarError(null);
    applyAvatar(null);
  };

  // The one place the user's side of the dashboard writes back to the admin
  // directory. Returns the list untouched when nothing actually differs, so a
  // repeated save can't churn state (and with it localStorage) forever.
  const updateMyUserRecord = (patch) => {
    if (!loggedInEmail) return;
    const key = loggedInEmail.toLowerCase();
    setPlatformUsers((prev) => {
      const list = prev || [];
      const idx = list.findIndex(u => (u.email || "").toLowerCase() === key);
      if (idx < 0) return list;
      const current = normalizeMember(list[idx]);
      const next = { ...current, ...patch };
      if (JSON.stringify(current) === JSON.stringify(next)) return list;
      const updated = [...list];
      updated[idx] = next;
      return updated;
    });
  };

  // Signing in adds the account to Admin Portal → Users if it isn't there yet.
  // Without this a real signup would never appear in the directory, and the
  // whole profile sync below would have nothing to hang off.
  useEffect(() => {
    if (!isLoggedIn || !loggedInEmail || isAdmin) return;
    const key = loggedInEmail.toLowerCase();
    setPlatformUsers((prev) => {
      const list = prev || [];
      const idx = list.findIndex(u => (u.email || "").toLowerCase() === key);
      if (idx >= 0) {
        // Known member — just refresh the presence columns the admin reads.
        const current = normalizeMember(list[idx]);
        const next = { ...current, lastLogin: "Just now", status: current.status === "Suspended" ? "Suspended" : "Online" };
        if (JSON.stringify(current) === JSON.stringify(next)) return list;
        const updated = [...list];
        updated[idx] = next;
        return updated;
      }
      return [...list, normalizeMember({
        id: nextMemberId(list),
        name: loggedInUser || loggedInEmail.split("@")[0],
        email: loggedInEmail,
        role: "Customer",
        lastLogin: "Just now",
        status: "Online",
        phone: phoneNumber,
        address,
        ecoPoints,
        earnHistory,
        notifications: notificationSettings,
        wishlist: savedProducts,
      })];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loggedInEmail, isAdmin]);

  // Admin → dashboard. Anything the team edits on the member's record in the
  // Admin Portal lands on their dashboard the moment it is saved. Each write is
  // equality-guarded so this never fights the user's own edits: by the time it
  // runs after a local save the record already matches, and it no-ops.
  useEffect(() => {
    if (!myMember) return;
    if (myMember.name) setLoggedInUser((prev) => (prev === myMember.name ? prev : myMember.name));
    setPhoneNumber((prev) => (prev === myMember.phone ? prev : myMember.phone));
    setAddress((prev) => (prev === myMember.address ? prev : myMember.address));
    setNotificationSettings((prev) => (
      prev.email === myMember.notifications.email && prev.sms === myMember.notifications.sms
        ? prev
        : { ...prev, ...myMember.notifications }
    ));
    // With Supabase configured the eco_* tables own the balance and ledger, so
    // the record is a mirror there rather than the source — see loadEcoState.
    if (!ecoIsRemote) {
      setEcoPoints((prev) => (prev === myMember.ecoPoints ? prev : myMember.ecoPoints));
      setEarnHistory((prev) => (
        JSON.stringify(prev) === JSON.stringify(myMember.earnHistory) ? prev : myMember.earnHistory
      ));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myMemberKey, ecoIsRemote]);

  // Dashboard → admin, for the wishlist only. The other user-owned fields write
  // back at the point of the action (Save Changes, a notification toggle, an
  // EcoPoints earn/redeem); the wishlist is toggled from half a dozen screens,
  // so it mirrors from state instead. Nothing down-syncs it, so there's no loop.
  useEffect(() => {
    if (!isLoggedIn || !loggedInEmail) return;
    updateMyUserRecord({ wishlist: savedProducts });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedProducts, isLoggedIn, loggedInEmail]);

  // Only content the admin has actually published is client-visible. "Component" is
  // an internal building block, so it stays out of the user's Updates feed.
  const publishedContent = contentItems.filter(
    item => item.status === "Published" && item.type !== "Component"
  );

  // The delivery record the admin manages in the Deliveries tab, matched to the
  // order the user is currently tracking — plus the assigned rider's profile.
  const trackedDelivery = selectedOrderForTracking
    ? deliveries.find(d => d.orderId === selectedOrderForTracking.id) || null
    : null;
  const trackedRider = trackedDelivery && trackedDelivery.rider && trackedDelivery.rider !== "Unassigned"
    ? riders.find(r => r.name === trackedDelivery.rider) || null
    : null;

  // --- EcoPoints program, as authored in Admin Portal → EcoPoints & Rewards ---
  // Every list below is admin data; only "earned"/"active" flags are derived from
  // the signed-in user's balance, so an admin edit shows up here immediately.
  const ecoRewards = (ecoProgram.rewards || []).filter(r => r.active !== false);
  const ecoEarnRules = ecoProgram.earnRules || [];
  const ecoTiers = [...(ecoProgram.tiers || [])].sort((a, b) => (a.min || 0) - (b.min || 0));
  const ecoImpactStats = ecoProgram.impactStats || [];
  const ecoImpactQuote = ecoProgram.impactQuote || defaultEcoProgram.impactQuote;
  const ecoReferral = ecoProgram.referral || {};
  // Points per peso spent. The checkout preview and the offline path use this;
  // the real award is computed from the same field server-side.
  const ecoEarnRate = Number(ecoProgram.earnRate ?? defaultEcoProgram.earnRate);
  const { current: currentTierRecord, next: nextTierRecord, percent: progressToNextTier } = tierProgress(ecoPoints, ecoTiers);
  const currentTier = currentTierRecord ? currentTierRecord.title : "Seedling";
  const nextTierLabel = nextTierRecord
    ? `${ecoPoints.toLocaleString()} / ${Number(nextTierRecord.min || 0).toLocaleString()} pts to next tier`
    : "Top tier reached";
  const badges = (ecoProgram.badges || []).map(b => ({
    ...b,
    earned: ecoPoints >= Number(b.threshold || 0) || unlockedBadgeNames.includes(b.name),
    justUnlocked: justUnlockedBadge === b.name,
  }));
  // Lifetime totals and the nearest locked badge, so the dashboard can show
  // where the points went rather than only what is left.
  const ecoSummary = pointsSummary(earnHistory, redeemHistory);
  const nextBadge = nextBadgeProgress(ecoProgram.badges || [], ecoPoints);

  // How many of each reward THIS member has already taken, for per-member
  // limits. Cancelled redemptions were refunded, so they don't count.
  const myRewardClaims = redeemHistory.reduce((acc, entry) => {
    if (entry.status === "Cancelled") return acc;
    // Database rows carry the catalog id; the offline path only has the title.
    const match = (ecoProgram.rewards || []).find(r => r.id === entry.rewardId || r.title === entry.reward);
    if (match) acc[match.id] = (acc[match.id] || 0) + 1;
    return acc;
  }, {});

  // Every visible reward with its claimability worked out once, then the
  // marketplace's search / sort / "affordable only" controls applied on top.
  const rewardCards = ecoRewards.map(reward => ({
    reward,
    state: rewardAvailability(reward, ecoPoints, {
      claimed: rewardClaims[reward.id] ?? null,
      myClaims: myRewardClaims[reward.id] || 0,
    }),
  }));
  const rewardSortOptions = ["Recommended", "Lowest cost", "Highest cost", "Nearly there"];
  const visibleRewardCards = rewardCards
    .filter(({ reward, state }) => {
      const q = rewardSearch.trim().toLowerCase();
      const matches = !q
        || String(reward.title || "").toLowerCase().includes(q)
        || String(reward.badge || "").toLowerCase().includes(q)
        || String(reward.description || "").toLowerCase().includes(q);
      return matches && (!affordableOnly || state.canRedeem);
    })
    .sort((a, b) => {
      if (rewardSort === "Lowest cost") return a.state.cost - b.state.cost;
      if (rewardSort === "Highest cost") return b.state.cost - a.state.cost;
      // "Nearly there" ranks what the balance is closest to unlocking first,
      // with anything already affordable ahead of it.
      if (rewardSort === "Nearly there") return a.state.missing - b.state.missing;
      // Recommended: featured first, then affordable, then cheapest.
      const featured = Number(Boolean(b.reward.featured)) - Number(Boolean(a.reward.featured));
      if (featured !== 0) return featured;
      const claimable = Number(b.state.canRedeem) - Number(a.state.canRedeem);
      if (claimable !== 0) return claimable;
      return a.state.cost - b.state.cost;
    });
  const affordableRewardCount = rewardCards.filter(c => c.state.canRedeem).length;

  // The activity timeline is the user's own ledger — points earned on the site
  // plus rewards redeemed from the admin's catalog — newest first.
  const ecoTimeline = [
    ...earnHistory.map(entry => {
      const amount = Number(entry.points || 0);
      const isDebit = amount < 0; // an admin correction, not an earn
      return {
        title: entry.action,
        time: entry.date,
        points: `${isDebit ? "" : "+"}${amount.toLocaleString()}`,
        icon: ecoIcon(entry.icon, 15, isDebit ? "var(--eco-c9)" : "var(--eco-c9)"),
        color: isDebit ? "var(--eco-c13)" : "var(--eco-c13)",
        glow: isDebit ? "rgba(var(--eco-c9-rgb), 0.3)" : "rgba(var(--eco-c7-rgb), 0.4)",
        sortKey: Date.parse(entry.date) || 0,
      };
    }),
    ...redeemHistory.map(entry => ({
      title: entry.reward,
      time: entry.date,
      points: entry.points,
      icon: ecoIcon("Gift", 15, "var(--eco-c9)"),
      color: "var(--eco-c13)",
      glow: "rgba(var(--eco-c9-rgb), 0.3)",
      sortKey: Date.parse(entry.date) || 0,
    })),
  ].sort((a, b) => b.sortKey - a.sortKey);

  // Certificates come from two places, both admin-controlled: a course the user
  // finished (100% progress) in the Specialist Certification catalog, and any
  // certificate the team issued to them by hand in Admin Portal → Users. A
  // hand-issued one wins, since it carries the real issue date and issuer.
  const earnedCertificates = (certCourses || [])
    .filter(course => Number(course.progress || 0) >= 100)
    .map(course => ({
      id: `CERT-${String(course.id).padStart(4, "0")}`,
      course: course.title,
      date: course.completedOn || "Recently completed",
      status: "Verified",
    }));
  const issuedCertificates = myMember ? myMember.certificates : [];
  const issuedCourseNames = new Set(issuedCertificates.map(c => String(c.course || "").toLowerCase()));
  const myCertificates = [
    ...issuedCertificates,
    ...earnedCertificates.filter(c => !issuedCourseNames.has(String(c.course || "").toLowerCase())),
  ];

  // Counts shown as badges on the dashboard's sidebar, so the tabs worth
  // opening are visible without clicking through them. Only "there is something
  // here" counts — a zero renders no badge at all.
  const openTicketCount = supportTickets.filter(t => t.status !== "Resolved" && t.status !== "Closed").length;
  const activeOrderCount = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const dashboardTabCounts = {
    certificate: myCertificates.length,
    orders: activeOrderCount,
    updates: publishedContent.length,
    wishlist: (savedProducts || []).length,
    support: openTicketCount,
  };

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
    // EcoPoints only come out of localStorage in offline demo mode. With
    // Supabase configured the balance belongs to the account and is loaded by
    // loadEcoState() on login — restoring here would let a signed-out visitor
    // (or the next person to use this browser) inherit the last user's points.
    if (!isSupabaseConfigured) {
      const savedPoints = localStorage.getItem("ecoPoints");
      if (savedPoints !== null) setEcoPoints(parseInt(savedPoints));

      const savedHistory = localStorage.getItem("redeemHistory");
      if (savedHistory) setRedeemHistory(JSON.parse(savedHistory));

      const savedRedeemed = localStorage.getItem("redeemedRewards");
      if (savedRedeemed) setRedeemedRewards(JSON.parse(savedRedeemed));

      const savedEarned = localStorage.getItem("earnHistory");
      if (savedEarned) setEarnHistory(JSON.parse(savedEarned));
    }

    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  // Apply & persist dark mode theme on the root element. `darkMode` is kept in
  // localStorage too so the legacy key stays truthful for anything reading it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode, themeMode]);

  // On "System" the page has to repaint when the OS flips at sunset, so track
  // the media query rather than only reading it at mount.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (e) => setSystemPrefersDark(e.matches);
    setSystemPrefersDark(mq.matches);
    // Safari below 14 only has the deprecated listener API.
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);


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

    // orientationchange fires before resize on iOS, so listen for both.
    const handleResize = () => setIsMobile(isMobileViewport());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Branding the admin sets in Settings → General drives the tab title and accent.
  useEffect(() => {
    document.title = `${adminSettings.platformName || "EcoEquity"}.Inc`;
  }, [adminSettings.platformName]);

  // Regenerate the whole sage ramp from the active pair and write it onto
  // :root — every inline style in src/** reads those variables, so this is
  // what actually repaints the site. A member's own pick wins over the
  // site-wide pair for their browser.
  useEffect(() => {
    applyThemeRamp(
      userTheme.primary || adminSettings.accentColor || DEFAULT_PRIMARY,
      userTheme.secondary || adminSettings.secondaryColor || DEFAULT_SECONDARY,
      // Buttons are optional and sit outside the ramp — blank means they
      // follow the primary, which is how the site behaved before the setting.
      userTheme.button || adminSettings.buttonColor || "",
    );
  }, [adminSettings.accentColor, adminSettings.secondaryColor, adminSettings.buttonColor, userTheme.primary, userTheme.secondary, userTheme.button]);

  useEffect(() => { localStorage.setItem(USER_THEME_STORAGE_KEY, JSON.stringify(userTheme)); }, [userTheme]);

  // Any one of the three overrides means this browser is off the site default.
  const hasCustomTheme = Boolean(userTheme.primary || userTheme.secondary || userTheme.button);
  // The pair actually in force — this browser's pick, else the admin's.
  const activeAccent = userTheme.primary || adminSettings.accentColor || DEFAULT_PRIMARY;
  const activeSurface = userTheme.secondary || adminSettings.secondaryColor || DEFAULT_SECONDARY;

  useEffect(() => {
    // Clear any auth messages when navigating between login and signup
    setAuthMessage(null);
  }, [activeNav]);

  // The hamburger button hides/unhides the nav menu at every viewport width;
  // on wide screens the open menu docks as a right-anchored dropdown card.
  const navCollapsed = true;

  // The inline navbar row and the hamburger panel split navItems between them,
  // so this gates both: whatever the row shows, the panel must not repeat, and
  // whatever it hides, the panel has to carry — otherwise those pages become
  // unreachable. The Admin Portal has its own sidebar and hides the row.
  const showInlineNav = activeNav !== "Admin Portal";

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  /* The mobile shell is the scroll container, and it keeps its offset
     across a view change — so arriving on a new page (or landing on Home
     after login) could start part-way down, with the first heading tucked
     under the sticky header. Assigning scrollTop rather than calling
     scrollTo keeps this a plain jump (not the document's smooth behavior)
     and works under jsdom, which does not implement Element.scrollTo. */
  useEffect(() => {
    if (shellRef.current) shellRef.current.scrollTop = 0;
    // Home has its own scroller on desktop, so it needs the same reset —
    // otherwise coming back to Home lands you mid-way down the sections.
    if (homeScrollRef.current) homeScrollRef.current.scrollTop = 0;
  }, [activeNav]);

  const handleNavChange = (navName) => {
    // A complaint about one form ("wrong password") makes no sense on the
    // other, so switching between Login and Sign Up starts clean. Anything
    // meant to survive the move is set by the caller after this returns.
    if ((navName === "Login" || navName === "Sign Up") && navName !== activeNav) setAuthMessage(null);
    setActiveNav(navName);
    if (navCollapsed) {
      setIsMobileMenuOpen(false);
      setIsProductDropdownOpen(false);
      setIsTargetDropdownOpen(false);
      setIsSeasonalDropdownOpen(false);
    }
  };

  const isAuthPage = activeNav === "Login" || activeNav === "Sign Up";

  /* The Admin Portal is a console, not a page of the marketing site: it takes
     the whole viewport rather than sitting inside the 1400px shell card under
     the site logo. Boxed in the shell it rendered ~1296×724 of a 1600×900
     window — a quarter of the screen lost to chrome the admin cannot use, on
     the one view that is all tables and dashboards. This flag strips the
     shell's cap, padding, radius, navbar and mobile tab bar for that view.
     AdminPortal carries its own way back to the site and its own logout. */
  const isAdminPortal = activeNav === "Admin Portal" && isAdmin;

  // The Terms checkbox turns red only while that's the outstanding complaint.
  const termsInvalid = authMessage?.kind === "terms" && !agreeTerms;
  const toggleAgreeTerms = () => {
    setAgreeTerms((prev) => !prev);
    if (authMessage?.kind === "terms") setAuthMessage(null);
  };

  const activeTabData = {
    crop: {
      points: [
        { id: 1, cx: 80, cy: 70, label: "Day 3", value: "+5%" },
        { id: 2, cx: 160, cy: 60, label: "Day 7", value: "+12%" },
        { id: 3, cx: 240, cy: 30, label: "Day 10", value: "+18%" },
        { id: 4, cx: 300, cy: 15, label: "Day 14", value: "+24%" },
      ],
      strokeColor: "var(--eco-c9)",
      gradientStart: "rgba(var(--eco-c7-rgb), 0.3)",
      gradientEnd: "rgba(var(--eco-c7-rgb), 0)",
      title: "Crop Growth",
      subtitle: "Heirloom Tomatoes",
      icon: <Leaf color="var(--eco-c11)" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.2), rgba(var(--eco-c11-rgb), 0.1))",
      iconBorder: "1px solid rgba(var(--eco-c7-rgb), 0.3)",
      status: "Healthy",
      statusIcon: <Activity size={12} strokeWidth={3} />,
      statusBg: "rgba(var(--eco-c9-rgb), 0.1)",
      statusColor: "var(--eco-c11)",
      statusBorder: "1px solid rgba(var(--eco-c7-rgb), 0.2)",
      stats: [
        { label: "Growth Rate", value: "+24%", progress: "24%", icon: <TrendingUp size={14} color="var(--eco-c9)" />, color: "var(--eco-c13)" },
        { label: "Soil Moisture", value: "68%", progress: "68%", icon: <Droplet size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Est. Harvest", value: "14 Days", progress: "85%", icon: <Sun size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Crop Health", value: "92%", progress: "92%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
      ],
      topListTitle: "Top Crops",
      topList: [
        { name: "Heirloom Tomatoes", progress: "85%", icon: <Cherry size={16} color="var(--eco-c9)" />, color: "var(--eco-c13)" },
        { name: "Basil Genovese", progress: "65%", icon: <Leaf size={16} color="#0284c7" />, color: "#0284c7" },
        { name: "Native Adlai", progress: "45%", icon: <Wheat size={16} color="#f59e0b" />, color: "#f59e0b" }
      ]
    },
    users: {
      points: [
        { id: 1, cx: 80, cy: 80, label: "Week 1", value: "10k" },
        { id: 2, cx: 160, cy: 60, label: "Week 2", value: "25k" },
        { id: 3, cx: 240, cy: 40, label: "Week 3", value: "85k" },
        { id: 4, cx: 300, cy: 20, label: "Week 4", value: "150k" },
      ],
      strokeColor: "var(--eco-c9)",
      gradientStart: "rgba(var(--eco-c9-rgb), 0.3)",
      gradientEnd: "rgba(var(--eco-c9-rgb), 0)",
      title: "Active Users",
      subtitle: "Monthly Active",
      icon: <Users color="#0369a1" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.2), rgba(var(--eco-c11-rgb), 0.1))",
      iconBorder: "1px solid rgba(var(--eco-c9-rgb), 0.3)",
      status: "Growing",
      statusIcon: <TrendingUp size={12} strokeWidth={3} />,
      statusBg: "rgba(var(--eco-c9-rgb), 0.1)",
      statusColor: "var(--eco-c11)",
      statusBorder: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
      stats: [
        { label: "Retention", value: "85%", progress: "85%", icon: <Users size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Engagement", value: "4.2hrs", progress: "70%", icon: <Activity size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "New Signups", value: "12k", progress: "60%", icon: <Globe size={14} color="var(--eco-c9)" />, color: "var(--eco-c13)" },
        { label: "Active Rate", value: "94%", progress: "94%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
      ],
      topListTitle: "Top Demographics",
      topList: [
        { name: "Urban Farmers", progress: "92%", icon: <Users size={16} color="#0284c7" />, color: "#0284c7" },
        { name: "Micro-Vendors", progress: "78%", icon: <Store size={16} color="#f59e0b" />, color: "#f59e0b" },
        { name: "Institutions", progress: "45%", icon: <Building2 size={16} color="var(--eco-c9)" />, color: "var(--eco-c13)" }
      ]
    },
    harvests: {
      points: [
        { id: 1, cx: 80, cy: 90, label: "Jan", value: "2T" },
        { id: 2, cx: 160, cy: 70, label: "Feb", value: "5T" },
        { id: 3, cx: 240, cy: 50, label: "Mar", value: "12T" },
        { id: 4, cx: 300, cy: 25, label: "Apr", value: "28T" },
      ],
      strokeColor: "var(--eco-c7)",
      gradientStart: "rgba(var(--eco-c7-rgb), 0.3)",
      gradientEnd: "rgba(var(--eco-c7-rgb), 0)",
      title: "Total Harvests",
      subtitle: "This Season",
      icon: <Wheat color="#b45309" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.2), rgba(var(--eco-c11-rgb), 0.1))",
      iconBorder: "1px solid rgba(var(--eco-c7-rgb), 0.3)",
      status: "High Yield",
      statusIcon: <Sun size={12} strokeWidth={3} />,
      statusBg: "rgba(var(--eco-c7-rgb), 0.1)",
      statusColor: "var(--eco-c11)",
      statusBorder: "1px solid rgba(var(--eco-c7-rgb), 0.2)",
      stats: [
        { label: "Volume", value: "28T", progress: "80%", icon: <Wheat size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Quality", value: "A+", progress: "95%", icon: <Sun size={14} color="#e11d48" />, color: "#e11d48" },
        { label: "Distribution", value: "18T", progress: "65%", icon: <Globe size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Profit", value: "₱1.2M", progress: "75%", icon: <TrendingUp size={14} color="var(--eco-c9)" />, color: "var(--eco-c13)" },
      ],
      topListTitle: "Top Harvests",
      topList: [
        { name: "Cabbage", progress: "95%", icon: <Salad size={16} color="#f59e0b" />, color: "#f59e0b" },
        { name: "Carrots", progress: "82%", icon: <Carrot size={16} color="#e11d48" />, color: "#e11d48" },
        { name: "Potatoes", progress: "64%", icon: <Sprout size={16} color="#0284c7" />, color: "#0284c7" }
      ]
    },
    subs: {
      points: [
        { id: 1, cx: 80, cy: 60, label: "Q1", value: "1.2k" },
        { id: 2, cx: 160, cy: 50, label: "Q2", value: "2.8k" },
        { id: 3, cx: 240, cy: 30, label: "Q3", value: "4.5k" },
        { id: 4, cx: 300, cy: 10, label: "Q4", value: "8.9k" },
      ],
      strokeColor: "var(--eco-c9)",
      gradientStart: "rgba(var(--eco-c9-rgb), 0.3)",
      gradientEnd: "rgba(var(--eco-c9-rgb), 0)",
      title: "Subscribers",
      subtitle: "Pro & Enterprise",
      icon: <Activity color="#be123c" size={22} />,
      iconBg: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.2), rgba(var(--eco-c11-rgb), 0.1))",
      iconBorder: "1px solid rgba(var(--eco-c9-rgb), 0.3)",
      status: "On Track",
      statusIcon: <HeartPulse size={12} strokeWidth={3} />,
      statusBg: "rgba(var(--eco-c9-rgb), 0.1)",
      statusColor: "var(--eco-c11)",
      statusBorder: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
      stats: [
        { label: "Pro Plan", value: "5.4k", progress: "60%", icon: <Activity size={14} color="#0284c7" />, color: "#0284c7" },
        { label: "Enterprise", value: "3.5k", progress: "40%", icon: <Users size={14} color="#f59e0b" />, color: "#f59e0b" },
        { label: "Churn Rate", value: "2.1%", progress: "10%", icon: <HeartPulse size={14} color="#e11d48" />, color: "#e11d48" },
        { label: "Growth", value: "+18%", progress: "75%", icon: <TrendingUp size={14} color="var(--eco-c9)" />, color: "var(--eco-c13)" },
      ],
      topListTitle: "Top Plans",
      topList: [
        { name: "Pro Plan", progress: "88%", icon: <Star size={16} color="#0284c7" />, color: "#0284c7" },
        { name: "Enterprise", progress: "56%", icon: <Building2 size={16} color="#f59e0b" />, color: "#f59e0b" },
        { name: "Basic", progress: "34%", icon: <Sprout size={16} color="var(--eco-c9)" />, color: "var(--eco-c13)" }
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

  // One renderer for both nav surfaces. `collapsed` is what used to be read
  // straight off navCollapsed: true gives the stacked hamburger-panel form
  // (accordion sub-menus, tap to open), false the inline navbar form (hover
  // dropdowns). Home / About Us / Product & Services now render inline in the
  // navbar and the rest stay in the panel, so both call this.
  const renderNavItem = (item, collapsed) => {
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
            ...(collapsed ? styles.navDropdownWrapMobile : {}),
          }}
          onMouseEnter={() => !collapsed && setIsTargetDropdownOpen(true)}
          onMouseLeave={() => !collapsed && setIsTargetDropdownOpen(false)} // Close dropdown on mouse leave for desktop
        >
          <button
            type="button"
            style={{
              ...styles.linkBtn,
              ...(collapsed ? styles.linkBtnMobile : {}),
              ...(isTargetMarketActive ? styles.linkBtnActive : {}),
              ...(hoveredNav === item && !isTargetMarketActive ? styles.linkBtnHover : {}),
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "4px 6px 4px 14px"
            }}
            onClick={() => {
              setActiveNav(item);
              if (collapsed) { // Toggle dropdown on click for mobile
                openMenu("target");
              }
            }}
            onMouseEnter={() => setHoveredNav(item)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            {targetMarketLabel}
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu("target");
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
              position: collapsed ? "relative" : "absolute", 
              top: collapsed ? "auto" : "100%", 
              left: collapsed ? "auto" : "50%", 
              transform: collapsed ? "none" : "translateX(-50%)", 
              paddingTop: collapsed ? "0px" : "8px", 
              zIndex: 100, 
              width: collapsed ? "100%" : "auto" 
            }}>
              <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(collapsed ? styles.dropdownMenuMobile : {}) }}>
              <button
                type="button"
                style={{
                  ...styles.dropdownItem,
                  ...(collapsed ? styles.dropdownItemMobile : {}),
                  ...(activeNav === "Target Market" ? styles.dropdownItemActive : {}),
                  ...(hoveredDropdown === "Overview" && activeNav !== "Target Market" ? styles.dropdownItemHover : {})
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNav("Target Market");
                  setIsTargetDropdownOpen(false);
                  if (collapsed) setIsMobileMenuOpen(false);
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
                  ...(collapsed ? styles.dropdownItemMobile : {}),
                  ...(activeNav === "Target Market Explore" ? styles.dropdownItemActive : {}),
                  ...(hoveredDropdown === "Distribution Channels and Acquisition Tactics" && activeNav !== "Target Market Explore" ? styles.dropdownItemHover : {})
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNav("Target Market Explore");
                  setIsTargetDropdownOpen(false);
                  if (collapsed) setIsMobileMenuOpen(false);
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
                  ...(collapsed ? styles.dropdownItemMobile : {}),
                  ...(activeNav === "Sustainability App Market" ? styles.dropdownItemActive : {}),
                  ...(hoveredDropdown === "Sustainability" && activeNav !== "Sustainability App Market" ? styles.dropdownItemHover : {})
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNav("Sustainability App Market");
                  setIsTargetDropdownOpen(false);
                  if (collapsed) setIsMobileMenuOpen(false);
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
            ...(collapsed ? styles.navDropdownWrapMobile : {}),
          }}
          onMouseEnter={() => !collapsed && setIsProductDropdownOpen(true)}
          onMouseLeave={() => !collapsed && setIsProductDropdownOpen(false)} // Close dropdown on mouse leave for desktop
        >
          <button
            type="button"
            style={{
              ...styles.linkBtn,
              ...(collapsed ? styles.linkBtnMobile : {}),
              ...(isProductServicesActive ? styles.linkBtnActive : {}),
              ...(hoveredNav === item && !isProductServicesActive ? styles.linkBtnHover : {}),
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "4px 6px 4px 14px"
            }}
            onClick={() => {
              setActiveNav(item); // Default to the main Product & Services page
              if (collapsed) { // Toggle dropdown on click for mobile
                openMenu("product");
              }
            }}
            onMouseEnter={() => setHoveredNav(item)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            {productServicesLabel} {/* Display "Benefits of the Project" if active, otherwise "Product & Services" */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu("product");
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
              position: collapsed ? "relative" : "absolute", 
              top: collapsed ? "auto" : "100%", 
              left: collapsed ? "auto" : "50%", 
              transform: collapsed ? "none" : "translateX(-50%)", 
              paddingTop: collapsed ? "0px" : "8px", 
              zIndex: 100, 
              width: collapsed ? "100%" : "auto" 
            }}>
              <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(collapsed ? styles.dropdownMenuMobile : {}) }}>
                <button
                  type="button"
                  style={{
                    ...styles.dropdownItem,
                    ...(collapsed ? styles.dropdownItemMobile : {}),
                    ...(activeNav === "Product & Services" ? styles.dropdownItemActive : {}),
                    ...(hoveredProductDropdown === "Overview" && activeNav !== "Product & Services" ? styles.dropdownItemHover : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNav("Product & Services");
                    setIsProductDropdownOpen(false);
                    if (collapsed) setIsMobileMenuOpen(false);
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
                    ...(collapsed ? styles.dropdownItemMobile : {}),
                    ...(activeNav === "Benefits of the Project" ? styles.dropdownItemActive : {}),
                    ...(hoveredProductDropdown === "Benefits of the Project" && activeNav !== "Benefits of the Project" ? styles.dropdownItemHover : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNav("Benefits of the Project");
                    setIsProductDropdownOpen(false);
                    if (collapsed) setIsMobileMenuOpen(false);
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
    } else if (item === "Seasonal Harvest") { // Seasonal Harvest Dropdown
      const isSeasonalActive = activeNav === "Seasonal Harvest" || activeNav === "Farm Planner";

      let seasonalLabel = item;
      if (activeNav === "Farm Planner") seasonalLabel = "Farm Planner";

      return (
        <div
          key={item}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...(collapsed ? styles.navDropdownWrapMobile : {}),
          }}
          onMouseEnter={() => !collapsed && setIsSeasonalDropdownOpen(true)}
          onMouseLeave={() => !collapsed && setIsSeasonalDropdownOpen(false)}
        >
          <button
            type="button"
            style={{
              ...styles.linkBtn,
              ...(collapsed ? styles.linkBtnMobile : {}),
              ...(isSeasonalActive ? styles.linkBtnActive : {}),
              ...(hoveredNav === item && !isSeasonalActive ? styles.linkBtnHover : {}),
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "4px 6px 4px 14px"
            }}
            onClick={() => {
              setActiveNav(item);
              if (collapsed) {
                openMenu("seasonal");
              }
            }}
            onMouseEnter={() => setHoveredNav(item)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            {seasonalLabel}
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu("seasonal");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                marginLeft: "2px",
                borderRadius: "50%",
                background: isSeasonalDropdownOpen ? "rgba(255, 255, 255, 0.15)" : "transparent",
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
                  transform: isSeasonalDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease"
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </button>

          {isSeasonalDropdownOpen && (
            <div style={{
              position: collapsed ? "relative" : "absolute",
              top: collapsed ? "auto" : "100%",
              left: collapsed ? "auto" : "50%",
              transform: collapsed ? "none" : "translateX(-50%)",
              paddingTop: collapsed ? "0px" : "8px",
              zIndex: 100,
              width: collapsed ? "100%" : "auto"
            }}>
              <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, ...(collapsed ? styles.dropdownMenuMobile : {}) }}>
                <button
                  type="button"
                  style={{
                    ...styles.dropdownItem,
                    ...(collapsed ? styles.dropdownItemMobile : {}),
                    ...(activeNav === "Seasonal Harvest" ? styles.dropdownItemActive : {}),
                    ...(hoveredSeasonalDropdown === "Seasonal Harvest" && activeNav !== "Seasonal Harvest" ? styles.dropdownItemHover : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNav("Seasonal Harvest");
                    setIsSeasonalDropdownOpen(false);
                    if (collapsed) setIsMobileMenuOpen(false);
                  }}
                  onMouseEnter={() => setHoveredSeasonalDropdown("Seasonal Harvest")}
                  onMouseLeave={() => setHoveredSeasonalDropdown(null)}
                >
                  Seasonal Harvest
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.dropdownItem,
                    ...(collapsed ? styles.dropdownItemMobile : {}),
                    ...(activeNav === "Farm Planner" ? styles.dropdownItemActive : {}),
                    ...(hoveredSeasonalDropdown === "Farm Planner" && activeNav !== "Farm Planner" ? styles.dropdownItemHover : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNav("Farm Planner");
                    setIsSeasonalDropdownOpen(false);
                    if (collapsed) setIsMobileMenuOpen(false);
                  }}
                  onMouseEnter={() => setHoveredSeasonalDropdown("Farm Planner")}
                  onMouseLeave={() => setHoveredSeasonalDropdown(null)}
                >
                  Farm Planner
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
          ...(collapsed ? styles.linkBtnMobile : {}),
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
  };

  return (
    <div style={{ 
      ...styles.page,
      ...(isMobile ? styles.pageMobile : {}),
      ...(isAdminPortal ? styles.pageAdminPortal : {}),
      '--text-primary': '#000000',
      '--text-secondary': 'rgba(0, 0, 0, 0.7)',
      '--shell-bg': 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))',
      '--border-subtle': 'rgba(0, 0, 0, 0.05)',
      '--accent': 'var(--eco-c11)',
    }}>
      <style>
        {`
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
                  html[data-theme="dark"] .glow-card {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
                  }
                  @keyframes cardPulseGlow {
                    0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05), 0 0 0px rgba(var(--eco-c7-rgb), 0); }
                    50% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05), 0 0 25px rgba(var(--eco-c9-rgb), 0.4); }
                  }
                  html[data-theme="dark"] .animate-cardPulseGlow {
                    animation: cardPulseGlowDark 3.5s infinite ease-in-out;
                  }
                  @keyframes cardPulseGlowDark {
                    0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.05), 0 0 0px rgba(var(--eco-c7-rgb), 0); }
                    50% { box-shadow: 0 8px 24px rgba(0,0,0,0.05), 0 0 25px rgba(var(--eco-c9-rgb), 0.4); }
                  }
                  .animate-cardPulseGlow {
                    animation: cardPulseGlow 3.5s infinite ease-in-out;
                  }
                  @keyframes heroRightCardPulseGlow {
                    0%, 100% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0px rgba(var(--eco-c7-rgb), 0); }
                    50% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 35px rgba(var(--eco-c7-rgb), 0.4); }
                  }
                  html[data-theme="dark"] .animate-heroRightCardPulseGlow {
                    animation: heroRightCardPulseGlowDark 4s infinite ease-in-out;
                  }
                  @keyframes heroRightCardPulseGlowDark {
                    0%, 100% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), 0 0 0px rgba(var(--eco-c7-rgb), 0); }
                    50% { box-shadow: 0 20px 40px rgba(0,0,0,0.06), 0 0 35px rgba(var(--eco-c7-rgb), 0.4); }
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
          html[data-theme="dark"] .orbit-container::before {
            background: conic-gradient(from 0deg, transparent 100%, transparent 100%);
            opacity: 0;
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
            background: conic-gradient(from 0deg, transparent 70%, rgba(var(--eco-c5-rgb), 0.8) 90%, rgba(var(--eco-c5-rgb), 1) 100%);
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
            background: linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.8), rgba(var(--eco-c6-rgb), 0.8));
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
          /* The orbs are painted once and left alone — they used to drift on an
             infinite bgOrbFloat transform, which cost the whole app its frame
             rate. They sit underneath every glass surface, and a backdrop-filter
             cannot cache its blur across frames when the backdrop moves: one
             drifting orb re-rasterised all ~18 blurred layers above it on every
             frame. Measured idle: 13fps inside the settings modal, 18-50fps on
             the rest of the app; static, the same screens hold 120fps. A 30s
             drift nobody can perceive is not worth an app that stutters on
             every click. Keep them still — will-change goes too, since there is
             no longer a transform to prepare for and it only pins a large
             blurred layer in memory. */
          .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.35;
            pointer-events: none;
            z-index: 1;
          }
          @keyframes learnSwipeShine {
            0%   { transform: translateX(-140%) skewX(-18deg); }
            100% { transform: translateX(320%) skewX(-18deg); }
          }
        `}
      </style>
      {/* Background Scrim — `page-bg-scrim` is dark mode's only repaint target */}
      <div className="page-bg-scrim" style={{
        ...styles.bgScrim,
        // Ensure the scrim is above the video but below other content
        zIndex: 1,
        // Login / Sign Up drop the two corner glows and keep only the flat
        // wash: with nothing else on the ground they read as a haze around
        // the framed panel instead of as atmosphere behind a whole page.
        ...(isAuthPage ? { background: styles.bgScrimFlat } : {}),
      }} />
      {/* Both the vignette and the blurred orbs below are off on Login / Sign
         Up. Those screens are a single framed panel on an otherwise empty
         ground, so the blur has nothing to sit behind and reads as a smudged
         overlay around the frame rather than as depth. */}
      {!isAuthPage && <div style={{ ...styles.bgScrimGrain, zIndex: 1 }} />}

      {/* Decorative floating orbs — two soft brand-colored blobs for quiet depth */}
      {!isAuthPage && (
        <>
          <span aria-hidden="true" className="bg-orb" style={{ top: "-8%", left: "-6%", width: "clamp(260px, 30vw, 520px)", height: "clamp(260px, 30vw, 520px)", background: "radial-gradient(circle at 30% 30%, rgba(var(--eco-c5-rgb), 0.7), rgba(var(--eco-c7-rgb), 0.18))" }} />
          <span aria-hidden="true" className="bg-orb" style={{ bottom: "-10%", right: "-6%", width: "clamp(240px, 28vw, 480px)", height: "clamp(240px, 28vw, 480px)", background: "radial-gradient(circle at 70% 70%, rgba(var(--eco-c4-rgb), 0.65), rgba(var(--eco-c6-rgb), 0.16))" }} />
        </>
      )}
      
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="appIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(var(--eco-c5-rgb), 0.95)" />
            <stop offset="100%" stopColor="rgba(var(--eco-c5-rgb), 0.95)" />
          </linearGradient>
        </defs>
      </svg>

      {/* The shell clips its children so nothing escapes the app card — except
          on the desktop Home view, where the scroller is deliberately 100vw
          wide so its footer can bleed to the window edges. Nothing else in
          there overflows: the scroller is height-bound by the flex column. */}
      <div ref={shellRef} className={isMobile && !isAdminPortal ? "mobile-scroll-area" : undefined} style={{ ...styles.shell, ...(isMobile ? styles.shellMobile : {}), ...(!isMobile && activeNav === "Home" ? { overflow: "visible" } : {}), ...(isAdminPortal ? styles.shellAdminPortal : {}) }}>

        {/* Maintenance mode is toggled in Admin Portal → Settings; admins keep full access */}
        {adminSettings.maintenanceMode && !isAdmin && (
          <div style={{ padding: isMobile ? "10px 16px" : "12px 24px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.18), rgba(var(--eco-c7-rgb), 0.12))", border: "1px solid rgba(var(--eco-c7-rgb), 0.35)", borderRadius: "14px", margin: isMobile ? "0 12px 12px" : "0 24px 16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)" }}>Scheduled Maintenance</span>
            <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.65)", fontWeight: 500 }}>
              {adminSettings.platformName || "EcoEquity"} is undergoing maintenance. Some features may be temporarily unavailable — thanks for your patience.
            </span>
          </div>
        )}

        {/* ── NAVBAR ──
           Hidden on Login / Sign Up: those pages are a single framed panel on
           a dark ground and carry their own brand mark, so the shell logo
           would sit outside the composition and read as a second header.
           Hidden on the Admin Portal for the same reason: the console has its
           own header and brand mark, so the site logo above it is a second
           one stealing a band of the working area. */}
        {!isAuthPage && !isAdminPortal && (
          <nav style={{ ...styles.navbar, ...(isMobile ? styles.navbarMobile : {}) }}>
            <div style={styles.logoWrap}>
              <img src="/Eco.png" alt={`${adminSettings.platformName || "EcoEquity"} Inc Logo`} style={{ ...styles.ecoLogo, ...(isMobile ? styles.ecoLogoMobile : {}) }} />
              <span style={{ ...styles.logoText, ...(isMobile ? styles.logoTextMobile : {}) }}>{adminSettings.platformName || "EcoEquity"}.Inc</span>
            </div> {/* End of logoWrap */}

            {/* Home / About Us / Product & Services sit in the bar itself,
               never behind the hamburger. They render in the inline form
               (collapsed=false), so Product & Services opens its sub-menu on
               hover rather than as an accordion. On phones there is no room
               beside the logo, so the row drops to its own scrollable line
               under it — still the navbar, still not the hamburger. */}
            {showInlineNav && (
              <div className="nav-inline-links" style={{ ...styles.navInlineLinks, ...(isMobile ? styles.navInlineLinksMobile : {}) }}>
                {inlineNavItems.map((item) => renderNavItem(item, false))}
              </div>
            )}
          </nav>
        )}

        {/* ── FLOATING NAV ACTIONS ──
           Out of the navbar and pinned to the top-right corner as round
           glass buttons, so they read as one family with the AI chat /
           feedback / support FABs in the opposite corner. The open menu
           hangs off this cluster, which is why it lives in here too. */}
        {!isAuthPage && activeNav !== "Admin Portal" && (
          <>
            <div className="nav-actions" style={styles.navActionsCluster}>
              {/* ── APPEARANCE ──
                 The sun/moon glyph is no longer a straight toggle: it opens a
                 small popover holding the whole look of the app — light / dark
                 / system, and the accent swatches that used to be reachable
                 only from Settings → Appearance. */}
              {navCollapsed && isLoggedIn && (
                <div ref={appearanceMenuRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isAppearanceMenuOpen}
                    aria-label="Appearance"
                    title="Appearance — light, dark or system, and accent colour"
                    className="nav-icon-btn"
                    style={{
                      ...styles.navIconBtn,
                      // No disc to tint, so the open state deepens the glyph.
                      ...(isAppearanceMenuOpen ? { color: "var(--eco-c19)" } : {}),
                    }}
                    onClick={() => toggleMenu("appearance")}
                  >
                    {/* No `color` prop — lucide defaults to currentColor, so the
                        button's hover deepening reaches the glyph. */}
                    {darkMode
                      ? <Moon size={isMobile ? 19 : 21} strokeWidth={2.4} />
                      : <Sun size={isMobile ? 19 : 21} strokeWidth={2.4} />}
                  </button>
                  {isAppearanceMenuOpen && (
                    <div style={{ position: "absolute", top: "100%", right: 0, paddingTop: "8px", zIndex: 100, width: "268px" }}>
                      <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, width: "100%", maxWidth: "100%", padding: "12px", gap: "10px", maxHeight: "70vh", overflowY: "auto" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)" }}>Appearance</div>

                        {/* Mode. "System" tracks the OS, so it stays selected
                            even as the resolved light/dark flips underneath. */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                          {[
                            { mode: "light", label: "Light", Icon: Sun },
                            { mode: "dark", label: "Dark", Icon: Moon },
                            { mode: "system", label: "System", Icon: Monitor },
                          ].map(({ mode, label, Icon }) => {
                            const active = themeMode === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setThemeMode(mode)}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "9px 4px",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: active ? "var(--eco-c13)" : "rgba(0,0,0,0.6)",
                                  background: active ? "rgba(var(--eco-c9-rgb), 0.18)" : "rgba(255,255,255,0.45)",
                                  border: active ? "1px solid rgba(var(--eco-c9-rgb), 0.55)" : "1px solid rgba(0,0,0,0.06)",
                                  transition: "background 0.18s ease, border-color 0.18s ease",
                                }}
                              >
                                <Icon size={16} strokeWidth={2.2} />
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)" }}>Colours</span>
                          {hasCustomTheme && (
                            <button
                              type="button"
                              onClick={() => setUserTheme({ primary: "", secondary: "", button: "" })}
                              style={{ background: "transparent", border: "none", padding: 0, fontSize: "11px", fontWeight: 700, color: "var(--eco-c13)", cursor: "pointer" }}
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Every preset Settings → Appearance offers, all three
                            groups, shrunk to swatch strips. Picking an accent
                            also takes its suggested light partner so the ramp
                            stays a matched pair; the surface row can then
                            override that partner on its own. */}
                        <AppearanceSwatchRow
                          label="Accent — green family"
                          presets={PRIMARY_COLOR_PRESETS}
                          selected={activeAccent}
                          onSelect={(v) => setUserTheme((prev) => ({ ...prev, primary: v, secondary: suggestedPairFor(v) }))}
                        />
                        {/* The off-sage accents, kept on their own line so the
                            greens above stay the obvious default. Same handler:
                            each brings its own neutral surface. */}
                        <AppearanceSwatchRow
                          label="Accent — beyond green"
                          presets={ACCENT_ALT_COLOR_PRESETS}
                          selected={activeAccent}
                          onSelect={(v) => setUserTheme((prev) => ({ ...prev, primary: v, secondary: suggestedPairFor(v) }))}
                        />
                        <AppearanceSwatchRow
                          label="Surface"
                          presets={SECONDARY_COLOR_PRESETS}
                          selected={activeSurface}
                          onSelect={(v) => setUserTheme((prev) => ({ ...prev, secondary: v }))}
                        />
                        <AppearanceSwatchRow
                          label="Buttons"
                          presets={BUTTON_COLOR_PRESETS}
                          selected={userTheme.button || adminSettings.buttonColor || ""}
                          onSelect={(v) => setUserTheme((prev) => ({ ...prev, button: v }))}
                          fallback={activeAccent}
                        />
                        {/* Split out from the row above so the gradients read as
                            their own kind of choice, same as in full Settings. */}
                        <AppearanceSwatchRow
                          label="Button gradients"
                          presets={BUTTON_GRADIENT_PRESETS}
                          selected={userTheme.button || adminSettings.buttonColor || ""}
                          onSelect={(v) => setUserTheme((prev) => ({ ...prev, button: v }))}
                        />

                        <p style={{ margin: 0, fontSize: "10.5px", lineHeight: 1.45, color: "rgba(0,0,0,0.5)" }}>
                          Saved on this device only. Full controls live in Settings → Appearance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {navCollapsed && isLoggedIn && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="nav-icon-btn"
                    style={{
                      ...styles.navIconBtn,
                      // No disc left to tint, so the open state deepens the
                      // glyph itself instead of drawing a ring around it.
                      ...(isNotificationOpen ? { color: "var(--eco-c19)" } : {}),
                    }}
                    onClick={() => toggleMenu("notification")}
                  >
                    <FaBell size={isMobile ? 18 : 20} color="currentColor" style={{ animation: notifBadgeAnim ? "shakeIcon 0.5s ease-in-out" : "none" }} />
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
                                style={{ background: "transparent", border: "none", fontSize: "11px", fontWeight: 600, color: "var(--eco-c13)", cursor: "pointer", padding: 0 }}
                              >
                                Mark all as read
                              </button>
                            </div>
                            {notifications.map((notif, idx) => (
                              <div key={idx} style={{ padding: "10px 12px", borderBottom: idx === notifications.length - 1 ? "none" : "1px solid rgba(0,0,0,0.05)", background: notif.read ? "transparent" : "rgba(var(--eco-c7-rgb), 0.05)", fontSize: "13px", color: "#000", textAlign: "left", lineHeight: 1.4, width: "100%", boxSizing: "border-box", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                 {!notif.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--eco-c11)", marginTop: "6px", flexShrink: 0 }} />}
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

              {/* Account menu — sits beside the bell so signing out, viewing the
                  profile or opening account settings is one tap from anywhere,
                  without going through the hamburger panel. */}
              {navCollapsed && isLoggedIn && (
                <div ref={accountMenuRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isAccountMenuOpen}
                    aria-label="Account menu"
                    title={loggedInUser ? `${loggedInUser} — account` : "Account"}
                    className="nav-fab"
                    style={{
                      ...styles.navFab,
                      ...(isAccountMenuOpen ? styles.navFabActive : {}),
                    }}
                    onClick={() => toggleMenu("account")}
                  >
                    {/* The avatar fills the whole circle — in a row of glass
                        FABs a smaller disc inset in one of them read as a
                        misaligned button rather than a portrait. */}
                    <span style={{
                      width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
                      background: "var(--eco-c11)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isMobile ? "15px" : "17px", fontWeight: 800, lineHeight: 1,
                      border: "2px solid rgba(255,255,255,0.75)",
                      boxSizing: "border-box",
                    }}>
                      {profilePic ? (
                        <img src={profilePic} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "U"
                      )}
                    </span>
                  </button>

                  {isAccountMenuOpen && (
                    <div role="menu" style={{ position: "absolute", top: "100%", right: 0, paddingTop: "8px", zIndex: 100, width: "252px" }}>
                      <div className="inner-blur-glass" style={{ ...styles.dropdownMenu, width: "100%", maxWidth: "100%", padding: "8px" }}>
                        {/* Who you are signed in as — the first thing this menu
                            has to answer on a shared device. */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "6px" }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--eco-c11)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800 }}>
                            {profilePic ? (
                              <img src={profilePic} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "U"
                            )}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--eco-c19)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {loggedInUser || "User"}
                            </div>
                            <div style={{ fontSize: "11.5px", fontWeight: 600, color: "rgba(0,0,0,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {loggedInEmail || "Signed in"}
                            </div>
                          </div>
                        </div>

                        {[
                          { key: "view", label: "View Profile", Icon: CircleUserRound, onSelect: () => { setSettingsTab("profile"); setShowSettingsModal(true); } },
                          { key: "manage", label: "Manage Account", Icon: UserCog, onSelect: () => { setSettingsTab("settings"); setShowSettingsModal(true); } },
                          { key: "settings", label: "Settings", Icon: SettingsIcon, onSelect: () => { setSettingsTab("settings"); setShowSettingsModal(true); } },
                          ...(isAdmin ? [{ key: "admin", label: "Admin Portal", Icon: BadgeCheck, onSelect: () => handleNavChange("Admin Portal") }] : []),
                        ].map(({ key, label, Icon, onSelect }) => (
                          <button
                            key={key}
                            type="button"
                            role="menuitem"
                            style={{
                              ...styles.dropdownItem,
                              display: "flex", alignItems: "center", gap: "10px",
                              ...(hoveredAccountMenu === key ? styles.dropdownItemHover : {}),
                            }}
                            onClick={(e) => { e.stopPropagation(); setIsAccountMenuOpen(false); onSelect(); }}
                            onMouseEnter={() => setHoveredAccountMenu(key)}
                            onMouseLeave={() => setHoveredAccountMenu(null)}
                          >
                            <Icon size={15} strokeWidth={2.1} style={{ flexShrink: 0, opacity: 0.8 }} />
                            {label}
                          </button>
                        ))}

                        <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "6px 0" }} />

                        <button
                          type="button"
                          role="menuitem"
                          style={{
                            ...styles.dropdownItem,
                            display: "flex", alignItems: "center", gap: "10px",
                            color: "var(--eco-c13)", fontWeight: 700,
                            ...(hoveredAccountMenu === "logout" ? { background: "rgba(var(--eco-c9-rgb), 0.08)", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.08)" } : {}),
                          }}
                          onClick={handleLogout}
                          onMouseEnter={() => setHoveredAccountMenu("logout")}
                          onMouseLeave={() => setHoveredAccountMenu(null)}
                        >
                          <LogOut size={15} strokeWidth={2.1} style={{ flexShrink: 0 }} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* Support actions — a floating FAB cluster pinned to the bottom-right
           of the viewport on every breakpoint. On phones it sits above the tab
           bar and collapses behind a single toggle. */}
        {activeNav !== "Admin Portal" && !isAuthPage && (
          <div style={{ ...styles.supportActionsCluster, ...(isMobile ? styles.supportActionsClusterMobile : {}) }}>
            {/* On phones the three buttons collapse behind a single toggle.
                Laid out permanently they formed a 160px column pinned over
                the page content — on a 320px screen that covered a third of
                the height, including whatever CTA happened to be there. */}
            {isMobile && (
              <button
                type="button"
                aria-label={isSupportClusterOpen ? "Hide support actions" : "Show support actions"}
                aria-expanded={isSupportClusterOpen}
                onClick={() => setIsSupportClusterOpen((v) => !v)}
                style={{ ...styles.aiChatFab, ...styles.aiChatFabMobile }}
              >
                {isSupportClusterOpen
                  ? <X size={21} color="#fff" strokeWidth={2.7} />
                  : <Headset size={21} color="#fff" strokeWidth={2.7} />}
                {!isSupportClusterOpen && supportTickets.filter(ticket => ticket.status === "Open").length > 0 && (
                  <span style={styles.supportTicketBadge}>{supportTickets.filter(ticket => ticket.status === "Open").length}</span>
                )}
              </button>
            )}
            {(!isMobile || isSupportClusterOpen) && (
              <>
            <button
              type="button"
              aria-label="Rate your experience"
              title="Rate your experience"
              onClick={() => { setShowFeedbackWidget((v) => !v); setShowAIChat(false); setShowSupportTicketModal(false); setIsSupportClusterOpen(false); }}
              onMouseEnter={() => setFeedbackFabHovered(true)}
              onMouseLeave={() => setFeedbackFabHovered(false)}
              style={{
                ...styles.aiChatFab,
                ...(isMobile ? styles.aiChatFabMobile : {}),
                ...(feedbackFabHovered ? styles.aiChatFabHover : {}),
              }}
            >
              <Star size={isMobile ? 21 : 20} color="#fff" fill={showFeedbackWidget ? "#fff" : "none"} strokeWidth={2.7} />
            </button>
            <button
              type="button"
              aria-label="Chat with AI"
              title="Chat with AI"
              onClick={() => openAIChat()}
              onMouseEnter={() => setChatHovered(true)}
              onMouseLeave={() => setChatHovered(false)}
              style={{
                ...styles.aiChatFab,
                ...(isMobile ? styles.aiChatFabMobile : {}),
                ...(chatHovered ? styles.aiChatFabHover : {}),
              }}
            >
              <MessageCircle size={isMobile ? 21 : 20} color="#fff" strokeWidth={2.7} />
            </button>
            <button
              type="button"
              aria-label="Open support ticket form"
              onClick={() => { setShowSupportTicketModal(true); setShowAIChat(false); setShowFeedbackWidget(false); setIsSupportClusterOpen(false); }}
              onMouseEnter={() => setSupportFabHovered(true)}
              onMouseLeave={() => setSupportFabHovered(false)}
              style={{
                ...styles.supportTicketFab,
                ...(isMobile ? styles.supportTicketFabMobile : {}),
                ...(supportFabHovered ? styles.supportTicketFabHover : {}),
              }}
            >
              <Headset size={isMobile ? 21 : 20} color="#fff" strokeWidth={2.7} />
              {supportTickets.filter(ticket => ticket.status === "Open").length > 0 && (
                <span style={styles.supportTicketBadge}>{supportTickets.filter(ticket => ticket.status === "Open").length}</span>
              )}
            </button>
              </>
            )}
          </div>
        )}

        {/* ── PAGE CONTENT ── */}
        {activeNav === "Home" && (
          /* On desktop this box is the Home scroller: the hero still fills
             exactly one screen (minHeight: 100% on the hero block below),
             and the landing sections sit under the fold. Scrolling here
             rather than on the shell keeps the navbar parked in place.

             It runs the full width of the *window* — out through the shell's
             padding, the card's own inset and the page frame — rather than
             being capped at 1240px, because the footer is a full-bleed slab
             and this box clips its children (overflowX: hidden), so the slab
             can only be as wide as the box is. Being exactly 100vw also means
             nothing actually overflows, so no sideways scrolling appears. The
             1240px reading measure moved to the blocks that need it: HomeHero
             and LandingSections cap and centre themselves at HOME_MEASURE. */
          <div ref={homeScrollRef} className="hide-scroll" style={{ ...styles.hero, flexDirection: "column", alignItems: isMobile ? "center" : "stretch", justifyContent: isMobile ? "space-between" : "flex-start", gap: isMobile ? "clamp(24px, 4vw, 60px)" : "0", maxWidth: isMobile ? "1200px" : "1240px", textAlign: "left", ...(isMobile ? styles.heroMobile : { flex: 1, height: "100%", minHeight: 0, maxWidth: "none", width: "100vw", marginTop: 0, marginLeft: `calc(-1 * (${SHELL_GUTTER} + ${CARD_OFFSET}))`, marginRight: `calc(-1 * (${SHELL_GUTTER} + ${CARD_OFFSET}))`, marginBottom: `calc(-1 * (${SHELL_PAD_Y} + ${PAGE_PAD}))`, overflowY: "auto", overflowX: "hidden", scrollBehavior: "smooth" }) }}>

            <div style={{ flex: isMobile ? 1 : "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: isMobile ? "100%" : "680px", width: isMobile ? undefined : "100%" }}>
              
              {isMobile && (
                <div className="inner-blur-glass" style={{
                  ...styles.mobileWelcomeCard,
                  ...styles.mobileCard,
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "14px",
                  padding: "18px 16px",
                }}>
                  {/* Avatar sits inline with the greeting; the tagline and
                      blurb run full width beneath so neither column is
                      squeezed on a 320px screen. */}
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", width: "100%" }}>
                    <div style={styles.mobileWelcomeAvatar}>
                      {profilePic ? (
                        <img src={profilePic} alt="User Avatar" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        loggedInUser ? loggedInUser.charAt(0).toUpperCase() : "G"
                      )}
                    </div>
                    <div style={{ ...styles.mobileWelcomeText, display: "flex", flexDirection: "column", gap: "3px", whiteSpace: "normal", textAlign: "left", width: "auto", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(var(--eco-c19-rgb), 0.72)", lineHeight: 1.2 }}>Welcome back,</span>
                      <span style={{ fontSize: "clamp(19px, 5.6vw, 24px)", fontWeight: 800, color: "var(--eco-c19)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{loggedInUser || "User"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--eco-c13)", lineHeight: 1.3 }}>
                      Grow Food. Build Community. Earn Sustainably.
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(0,0,0,0.68)", lineHeight: 1.5 }}>
                      EcoEquity is a digital-first, high-engagement platform designed to boost agricultural self-sufficiency in the Philippines, starting at the household and community level.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                    <button type="button" onClick={() => handleNavChange("Contact")} style={{ ...styles.primaryBtn, padding: "0 12px", minHeight: "46px", fontSize: "14px", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span aria-hidden="true" style={styles.primaryInnerBlur} />
                      <span style={styles.glassContentLayer}>Get in Touch</span>
                    </button>
                    <button type="button" onClick={() => handleNavChange("Learn More")} style={{ ...styles.glassBtn, padding: "0 12px", minHeight: "46px", fontSize: "14px", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span aria-hidden="true" style={styles.glassInnerBlur} />
                      <span style={styles.glassContentLayer}>Learn More</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions Grid for Mobile */}
              {isMobile && (
                <div className="inner-blur-glass" style={{
                  ...styles.mobileCard,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "16px 14px",
                  borderRadius: "20px",
                  background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}>
                  <h3 style={{ margin: 0, textAlign: "left", fontSize: "16px", fontWeight: 800, color: "var(--eco-c19)", lineHeight: 1.2 }}>
                    Product &amp; Services
                  </h3>
                  {/* Four labelled tiles per row: the icons alone gave no clue
                      what each shortcut did, and a bare 36px glyph is under
                      the comfortable touch minimum. */}
                  <div style={styles.mobileTileGrid}>
                    {[
                      { nav: "Shop All Products", label: "Shop", icon: <Store size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                      { nav: "Starter Kits & Toolsets", label: "Kits", icon: <Wrench size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                      { nav: "AI Data Subscription", label: "AI Data", icon: <Headset size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                      { nav: "Specialist Certification", label: "Certify", icon: <GraduationCap size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                      { action: () => openAIChat(), nav: "ChatWithAI", label: "AI Chat", icon: <FaRobot size={24} style={{ fill: "url(#appIconGradient)" }} /> },
                      { nav: "SurplusExchangePage", label: "Surplus", icon: <Handshake size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                      // "Tracking", not "Impact": the sector row below has its
                      // own Impact tile pointing at a different page.
                      { nav: "ImpactTrackingPage", label: "Tracking", icon: <Activity size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => item.action ? item.action() : handleNavChange(item.nav)}
                        style={styles.mobileTile}
                      >
                        <span aria-hidden="true" style={styles.mobileTileIcon}>{item.icon}</span>
                        <span style={styles.mobileTileLabel}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectorActionsMobile(!showSectorActionsMobile)}
                    aria-expanded={showSectorActionsMobile}
                    style={{
                      width: "100%",
                      minHeight: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      padding: "0 14px",
                      background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.28), rgba(var(--eco-c5-rgb), 0.24))",
                      border: "1px solid rgba(255,255,255,0.72)",
                      borderRadius: "14px",
                      color: "var(--eco-c13)",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(var(--eco-c7-rgb), 0.12), inset 0 1px 0 rgba(255,255,255,0.62)",
                      backdropFilter: "blur(14px) saturate(170%)",
                      WebkitBackdropFilter: "blur(14px) saturate(170%)",
                      transition: "transform 0.22s ease, box-shadow 0.22s ease"
                    }}
                  >
                    {showSectorActionsMobile ? "Show less" : "More sectors"}
                    <FaChevronDown size={10} style={{ transform: showSectorActionsMobile ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.24s ease" }} />
                  </button>
                  {showSectorActionsMobile && (
                    <div
                      style={{
                        ...styles.mobileTileGrid,
                        paddingTop: "2px",
                        animation: "fadeInUp 0.28s cubic-bezier(.22,1,.36,1) both"
                      }}
                    >
                      {[
                        { nav: "OurImpactPage", label: "Impact", icon: <Globe size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                        { nav: "LGUPartnershipPage", label: "LGU", icon: <Handshake size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                        { nav: "IncomeGenerationPage", label: "Income", icon: <TrendingUp size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> },
                        { nav: "NativeSeedBankPage", label: "Seeds", icon: <Sprout size={24} color="url(#appIconGradient)" strokeWidth={2.4} /> }
                      ].map((item) => (
                        <button
                          key={item.nav}
                          type="button"
                          onClick={() => handleNavChange(item.nav)}
                          style={styles.mobileTile}
                        >
                          <span aria-hidden="true" style={styles.mobileTileIcon}>{item.icon}</span>
                          <span style={styles.mobileTileLabel}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EcoPoints & Rewards Dropdown + Lower Mobile Home Section */}
              {isMobile && (
                <div style={{ ...styles.mobileCard, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ position: "relative", zIndex: 35 }} ref={ecoPointsDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsEcoPointsDropdownOpen(!isEcoPointsDropdownOpen)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.66)",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.74), rgba(var(--eco-c0-rgb), 0.56))",
                        color: "var(--eco-c19)",
                        boxShadow: "0 10px 24px rgba(var(--eco-c7-rgb), 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
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
                      <FaChevronDown size={12} style={{ color: "var(--eco-c13)", transform: isEcoPointsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                    </button>

                    {isEcoPointsDropdownOpen && (
                      <div className="inner-blur-glass custom-scrollbar" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", padding: "8px", borderRadius: "16px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.66)", boxShadow: "0 18px 36px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", gap: "4px", maxHeight: "260px", overflowY: "auto", zIndex: 60, backdropFilter: "blur(22px) saturate(170%)", WebkitBackdropFilter: "blur(22px) saturate(170%)" }}>
                        {["All", "Dashboard", "Rewards Marketplace", "How to Earn", "Eco Tiers", "Community Impact", "Referral Program", "Achievement Badges", "Redeem History"].map((section) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => { setEcoPointsSection(section); setIsEcoPointsDropdownOpen(false); }}
                            style={{ padding: "10px 12px", borderRadius: "12px", border: ecoPointsSection === section ? "1px solid rgba(var(--eco-c5-rgb), 0.42)" : "1px solid transparent", background: ecoPointsSection === section ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.28), rgba(var(--eco-c5-rgb), 0.28))" : "transparent", color: ecoPointsSection === section ? "var(--eco-c15)" : "var(--eco-c19)", fontSize: "12px", fontWeight: ecoPointsSection === section ? 800 : 650, textAlign: "left", cursor: "pointer" }}
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
                            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--eco-c13)", marginTop: "4px", lineHeight: 1 }}>{ecoPoints.toLocaleString()} <span style={{ fontSize: "13px", fontWeight: 800 }}>pts</span></div>
                          </div>
                          <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "21px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.28)" }}><Gift size={21} color="#fff" /></div>
                        </div>
                        {/* Lifetime totals — the balance alone hides everything
                            already spent. Same numbers as the desktop strip. */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                          {[
                            { label: "Earned", value: ecoSummary.earned.toLocaleString() },
                            { label: "Redeemed", value: ecoSummary.spent.toLocaleString() },
                            { label: "Badges", value: `${badges.filter(b => b.earned).length}/${badges.length}` },
                          ].map((item) => (
                            <div key={item.label} style={{ padding: "9px 10px", borderRadius: "12px", background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.6)", textAlign: "center" }}>
                              <div style={{ fontSize: "14px", fontWeight: 850, color: "var(--eco-c13)", lineHeight: 1.1 }}>{item.value}</div>
                              <div style={{ fontSize: "9.5px", fontWeight: 750, color: "rgba(0,0,0,0.55)", marginTop: "2px" }}>{item.label}</div>
                            </div>
                          ))}
                        </div>
	                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
	                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
	                            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--eco-c13)" }}>Eco Level: {currentTier}</span>
	                            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>{nextTierLabel}</span>
	                          </div>
	                          <div style={{ width: "100%", height: "6px", background: "rgba(var(--eco-c9-rgb), 0.18)", borderRadius: "999px", overflow: "hidden" }}>
	                            <div style={{ height: "100%", width: `${progressToNextTier}%`, background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))", borderRadius: "999px" }} />
	                          </div>
	                        </div>
	                        <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
	                          <button
	                            type="button"
	                            onClick={() => setEcoPointsSection("Rewards Marketplace")}
	                            style={{ flex: 1, minHeight: "44px", padding: "8px 10px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "var(--eco-c19)", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(var(--eco-c7-rgb), 0.2)" }}
	                          >
	                            Redeem Rewards
	                          </button>
	                          <button
	                            type="button"
	                            onClick={() => setEcoPointsSection("How to Earn")}
	                            style={{ flex: 1, minHeight: "44px", padding: "8px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
	                          >
	                            Earn More Points
	                          </button>
	                        </div>
                          {isEcoAllMobile && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px" }}>
                              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Eco Activity Timeline</h3>
                              <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", maxHeight: "210px", overflowY: "auto", paddingRight: "6px" }}>
                                <div style={{ position: "absolute", left: "15px", top: "15px", bottom: "15px", width: "2px", background: "linear-gradient(to bottom, rgba(var(--eco-c7-rgb), 0.4), rgba(var(--eco-c7-rgb), 0.1))", borderRadius: "999px" }} />
                                {ecoTimeline.slice(0, 5).map((activity, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "11px", position: "relative", zIndex: 1 }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, boxShadow: `0 0 10px ${activity.glow}` }}>{activity.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0, padding: "10px 11px", borderRadius: "13px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--eco-c19)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activity.title}</span>
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Rewards Marketplace</h3>
                          <Pill tone={affordableRewardCount > 0 ? "green" : "slate"}>{affordableRewardCount} in reach</Pill>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAffordableOnly(v => !v)}
                          style={{ ...dashGhostBtn, minHeight: "40px", fontSize: "12px", ...(affordableOnly ? { background: dashTone("amber").bg, border: `1px solid ${dashTone("amber").edge}`, color: dashTone("amber").fg } : null) }}
                        >
                          {affordableOnly ? "✓ Showing what I can afford" : "Only show what I can afford"}
                        </button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {visibleRewardCards.map(({ reward, state }) => (
                            <RewardCard
                              key={reward.id}
                              reward={reward}
                              state={state}
                              icon={ecoIcon(reward.icon, 24)}
                              onRedeem={redeemReward}
                              compact
                            />
                          ))}
                          {visibleRewardCards.length === 0 && (
                            <span style={{ gridColumn: "1 / -1", fontSize: "11px", fontWeight: 650, color: "rgba(0,0,0,0.5)" }}>
                              {ecoRewards.length === 0 ? "No rewards available right now — check back soon." : "Nothing you can afford yet — keep earning."}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "How to Earn") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>How to Earn EcoPoints</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {ecoEarnRules.map((item) => {
                            const stats = earnRuleStats(item, earnHistory);
                            return (
                            <div key={item.id} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", flexDirection: "column", gap: "7px" }}>
                              {ecoIcon(item.icon, 16)}
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--eco-c19)", lineHeight: 1.15 }}>{item.shortAction || item.action}</span>
                              <span style={{ fontSize: "11px", fontWeight: 850, color: "var(--eco-c13)" }}>+{Number(item.points || 0).toLocaleString()} pts</span>
                              <span style={{ fontSize: "9.5px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                                {stats.times === 0 ? "Not done yet" : `Done ${stats.times}×`}
                              </span>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Eco Tiers") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Eco Tier Levels</h3>
                        {ecoTiers.map((tier) => {
                          const active = currentTierRecord && tier.id === currentTierRecord.id;
                          return (
                            <div key={tier.id} style={{ padding: "11px 12px", borderRadius: "14px", background: active ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.24), rgba(var(--eco-c5-rgb), 0.2))" : "rgba(255,255,255,0.56)", border: active ? "1px solid rgba(var(--eco-c9-rgb), 0.3)" : "1px solid rgba(255,255,255,0.58)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 850, color: "var(--eco-c19)" }}>{tier.title}</span>
                              <span style={{ fontSize: "10.5px", fontWeight: 750, color: active ? "var(--eco-c13)" : "rgba(0,0,0,0.55)" }}>{tierRangeLabel(tier)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Community Impact") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Community Impact</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {ecoImpactStats.map((stat) => (
                            <div key={stat.id} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.6)", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "20px" }}>{ecoIcon(stat.icon, 22)}</span>
                              <span style={{ fontSize: "17px", fontWeight: 850, color: "var(--eco-c13)", lineHeight: 1 }}>{stat.value}</span>
                              <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.58)" }}>{stat.shortLabel || stat.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Referral Program") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Referral Program</h3>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 650, color: "rgba(0,0,0,0.62)", lineHeight: 1.35 }}>Invite friends and earn {Number(ecoReferral.points || 0).toLocaleString()} EcoPoints when they join {adminSettings.platformName || "EcoEquity"}.</p>
                        <div style={{ padding: "10px 12px", borderRadius: "14px", border: "1px dashed var(--eco-c11)", background: "rgba(var(--eco-c9-rgb), 0.08)", color: "var(--eco-c13)", fontSize: "14px", fontWeight: 850, letterSpacing: "1px" }}>{ecoReferral.code}</div>
                        <button type="button" onClick={copyReferralCode} style={{ minHeight: "44px", padding: "10px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.42)", background: "rgba(255,255,255,0.82)", color: "var(--eco-c15)", fontSize: "13px", fontWeight: 850, cursor: "pointer" }}>{copiedReferral ? "Copied!" : "Copy Link"}</button>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Achievement Badges") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Achievement Badges</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                          {badges.map((badge) => (
                            <div key={badge.id || badge.name} style={{ padding: "12px", borderRadius: "14px", background: badge.earned ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.34)", border: badge.earned ? "1px solid rgba(var(--eco-c9-rgb), 0.24)" : "1px dashed rgba(0,0,0,0.12)", opacity: badge.earned ? 1 : 0.62, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
                              <span style={{ fontSize: "25px", filter: badge.earned ? "none" : "grayscale(100%)" }}>{ecoIcon(badge.icon, 25)}</span>
                              <span style={{ fontSize: "10.5px", fontWeight: 800, color: badge.earned ? "var(--eco-c13)" : "rgba(0,0,0,0.52)" }}>{badge.name}</span>
                              {!badge.earned && (
                                <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(0,0,0,0.42)" }}>
                                  at {Number(badge.threshold || 0).toLocaleString()} pts
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ecoPointsSection === "All" || ecoPointsSection === "Redeem History") && (
                      <div className={isEcoAllMobile ? "inner-blur-glass" : undefined} style={{ ...(isEcoAllMobile ? mobileEcoGlassCardStyle : {}), display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Redeem History</h3>
                        {redeemHistory.length === 0 && (
                          <span style={{ fontSize: "11px", fontWeight: 650, color: "rgba(0,0,0,0.5)" }}>Nothing redeemed yet.</span>
                        )}
                        {redeemHistory.slice(0, 4).map((item, idx) => (
                          <div key={`${item.reward}-${idx}`} style={{ padding: "11px 12px", borderRadius: "14px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.58)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                              <span style={{ fontSize: "11.5px", fontWeight: 850, color: "var(--eco-c19)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.reward}</span>
                              <span style={{ fontSize: "10px", fontWeight: 650, color: "rgba(0,0,0,0.52)" }}>{item.date}</span>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 850, color: "var(--eco-c13)", flexShrink: 0 }}>{item.points} pts</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                  {ecoPointsSection === "Dashboard" && (
                    <div className="inner-blur-glass" style={{ padding: "18px", borderRadius: "18px", background: "linear-gradient(150deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42))", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 850, color: "var(--eco-c19)" }}>Eco Activity Timeline</h3>
                      <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", maxHeight: "210px", overflowY: "auto", paddingRight: "6px" }}>
                        <div style={{ position: "absolute", left: "15px", top: "15px", bottom: "15px", width: "2px", background: "linear-gradient(to bottom, rgba(var(--eco-c7-rgb), 0.4), rgba(var(--eco-c7-rgb), 0.1))", borderRadius: "999px" }} />
                        {ecoTimeline.slice(0, 5).map((activity, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "11px", position: "relative", zIndex: 1 }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, boxShadow: `0 0 10px ${activity.glow}` }}>{activity.icon}</div>
                            <div style={{ flex: 1, minWidth: 0, padding: "10px 11px", borderRadius: "13px", background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.62)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--eco-c19)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activity.title}</span>
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

              {/* Desktop hero redesign lives below as a full-width sibling */}
            </div>
            
            {/* Desktop hero — the two-panel landing screen, see
                components/HomeHero.js. */}
            {!isMobile && (
              <HomeHero
                measure={HOME_MEASURE}
                onNavigate={handleNavChange}
                onScrollDown={() => {
                  const el = homeScrollRef.current;
                  if (el) el.scrollTo({ top: el.clientHeight - 40, behavior: "smooth" });
                }}
              />
            )}

            {/* Below-the-fold landing content — feature cards, the three-step
                walkthrough, the 2026 targets band and the closing CTA. */}
            <LandingSections isMobile={isMobile} measure={HOME_MEASURE} onNavigate={handleNavChange} />

            {/* Site footer — closes the home scroller. On desktop the scroll
                lives on this container, so "back to top" has to rewind it
                rather than the window. */}
            <SiteFooter
              isMobile={isMobile}
              onNavigate={handleNavChange}
              platformName={adminSettings.platformName || "EcoEquity"}
              supportEmail={adminSettings.supportEmail || "ecoequity.inc2026@gmail.com"}
              onScrollTop={() => {
                // Mobile scrolls the shell; desktop scrolls the Home box.
                const el = isMobile ? shellRef.current : homeScrollRef.current;
                if (el?.scrollTo) el.scrollTo({ top: 0, behavior: "smooth" });
                else if (el) el.scrollTop = 0;
              }}
            />

          </div>
        )}
        {activeNav !== "Home" && (
          <div
            style={{
              ...styles.pageContent, // Fixed: Removed overflowY: "hidden" override to allow scrolling on all pages
              ...(isMobile ? styles.pageContentMobile : {}),
              /* Last so it wins over pageContentMobile: the console owns the
                 full height and scrolls inside its own main column, rather
                 than growing the shell scroller like the site's pages do. */
              ...(isAdminPortal ? styles.pageContentAdminPortal : {}),
            }}
          >
            {activeNav === "About Us" && !isMobile && <AboutUs />}
            {activeNav === "Product & Services" && <ProductServices setActiveNav={setActiveNav} />}
            {activeNav === "ProductsPage" && <ProductsPage setActiveNav={setActiveNav} setCartItems={setCartItems} products={products} setProducts={setProducts} />}
{activeNav === "ServicesPage" && <ServicesPage setActiveNav={setActiveNav} showAIChat={showAIChat} setShowAIChat={openAIChat} />}
            {activeNav === "Target Market" && <TargetMarket />}
            {activeNav === "Contact" && <GetInTouch setActiveNav={setActiveNav} />}
            {activeNav === "Learn More" && <LearnMore setActiveNav={setActiveNav} />}
            {activeNav === "Explore More" && <ExploreMore setActiveNav={setActiveNav} />}
            {activeNav === "Target Market Explore" && <TargetMarketExplore />}
            {activeNav === "Sustainability App Market" && <SustainabilityAppMarket />}
            {activeNav === "Benefits of the Project" && <BenefitsOfTheProject />}
            {activeNav === "Seasonal Harvest" && !isMobile && <SeasonalHarvestPage setActiveNav={setActiveNav} onNotify={handleNotify} harvests={harvests} />}
            {activeNav === "Farm Planner" && <FarmPlannerPage setActiveNav={setActiveNav} harvests={harvests} planner={farmPlanner} />}
            {activeNav === "Community" && <CommunityForumPage setActiveNav={setActiveNav} loggedInUser={loggedInUser} posts={forumPosts} setPosts={setForumPosts} />}
            {/* "CheckoutPage" is the Quick View "Buy Now" destination on
                ProductsPage. It lands on the shop with the checkout already
                open, so there is one checkout in the app rather than a second
                copy to keep in step. */}
            {(activeNav === "Shop All Products" || activeNav === "CheckoutPage") && (
              <ShopAllProducts
                setActiveNav={setActiveNav}
                cartItems={cartItems}
                setCartItems={setCartItems}
                savedProducts={savedProducts}
                setSavedProducts={setSavedProducts}
                setOrders={setOrders}
                onTrackOrder={handleTrackOrder}
                products={products}
                setProducts={setProducts}
                promoCodes={promoCodes}
                addOrderEcoPoints={addOrderEcoPoints}
                ecoEarnRate={ecoEarnRate}
                initialCheckoutOpen={activeNav === "CheckoutPage"}
              />
            )}
            {activeNav === "Admin Portal" && isAdmin && <AdminPortal setActiveNav={setActiveNav} handleLogout={handleLogout} adminName={loggedInUser} adminEmail={loggedInEmail} adminAvatar={profilePic} products={products} setProducts={setProducts} harvests={harvests} setHarvests={setHarvests} promoCodes={promoCodes} setPromoCodes={setPromoCodes} orders={orders} setOrders={setOrders} supportTickets={supportTickets} setSupportTickets={setSupportTickets} plantScans={plantScans} setPlantScans={setPlantScans} plantDiseases={plantDiseases} setPlantDiseases={setPlantDiseases} subscribers={subscribers} setSubscribers={setSubscribers} events={events} setEvents={setEvents} content={contentItems} setContent={setContentItems} forumPosts={forumPosts} setForumPosts={setForumPosts} farmPlanner={farmPlanner} setFarmPlanner={setFarmPlanner} advisors={advisors} setAdvisors={setAdvisors} surplusListings={surplusListings} setSurplusListings={setSurplusListings} surplusDemands={surplusDemands} setSurplusDemands={setSurplusDemands} certCourses={certCourses} setCertCourses={setCertCourses} adminSettings={adminSettings} setAdminSettings={setAdminSettings} deliveries={deliveries} setDeliveries={setDeliveries} riders={riders} setRiders={setRiders} platformUsers={platformUsers} setPlatformUsers={setPlatformUsers} transactions={transactions} setTransactions={setTransactions} subscriptionPlans={subscriptionPlans} setSubscriptionPlans={setSubscriptionPlans} ecoProgram={ecoProgram} setEcoProgram={setEcoProgram} supabaseReady={isSupabaseConfigured} contentSeeded={contentSeeded} publishingContent={publishingContent} onPublishContent={handlePublishContent} />}
            {activeNav === "EventsAndWorkshops" && <EventsAndWorkshopsPage setActiveNav={setActiveNav} adminEvents={events} onRegister={handleEventRegister} />}
            {activeNav === "Starter Kits & Toolsets" && <StarterKits setActiveNav={setActiveNav} />}
            {activeNav === "AI Data Subscription" && <AIDataSubscription setActiveNav={setActiveNav} promoCodes={promoCodes} onNewSubscriber={handleNewSubscriber} loggedInUser={loggedInUser} loggedInEmail={loggedInEmail} plans={subscriptionPlans} />}
            {activeNav === "Specialist Certification" && <SpecialistCertification setActiveNav={setActiveNav} courses={certCourses} setCourses={setCertCourses} />}
            {activeNav === "ExpertSupportPage" && <ExpertSupportPage setActiveNav={setActiveNav} advisors={advisors} />} {/* Add routing for ExpertSupportPage */}
            {activeNav === "LGUPartnershipPage" && <LGUPartnershipPage setActiveNav={setActiveNav} />}
            {activeNav === "ImpactTrackingPage" && <ImpactTrackingPage setActiveNav={setActiveNav} />}
            {activeNav === "NativeSeedBankPage" && <NativeSeedBankPage setActiveNav={setActiveNav} />}
            {activeNav === "OurImpactPage" && <OurImpactPage setActiveNav={setActiveNav} />}
            {activeNav === "IncomeGenerationPage" && <IncomeGenerationPage setActiveNav={setActiveNav} />}
            {activeNav === "SurplusExchangePage" && <SurplusExchangePage setActiveNav={setActiveNav} listings={surplusListings} setListings={setSurplusListings} demands={surplusDemands} setDemands={setSurplusDemands} />}

            {/* Login / Sign Up — one component for both, see components/AuthPanels.js */}
            {isAuthPage && (
              <AuthPanels
                mode={activeNav === "Login" ? "login" : "signup"}
                isMobile={isMobile}
                brandName={`${adminSettings.platformName || "EcoEquity"}.Inc`}
                shake={formErrorShake}
                notice={authMessage}
                onDismissNotice={() => setAuthMessage(null)}
                busy={authMessage?.kind === "pending"}
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                agreeTerms={agreeTerms}
                toggleAgreeTerms={toggleAgreeTerms}
                termsInvalid={termsInvalid}
                onSubmit={activeNav === "Login" ? handleLogin : handleSignUp}
                onForgotPassword={handleForgotPassword}
                onSwitchMode={(next) => handleNavChange(next === "login" ? "Login" : "Sign Up")}
              />
            )}
          </div>
        )}
        
        {/* Settings Modal */}
        {showSettingsModal && (
          <div style={modalOverlay(MODAL_LAYER.base, { padding: 0 })}>
            {/* Full-bleed: the settings shell fills the viewport edge to edge on
               every breakpoint, so no frame, radius or drop shadow. */}
            <div className="inner-blur-glass" style={{ maxWidth: "none", width: "100%", height: "100%", maxHeight: "none", background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", border: "none", borderRadius: 0, display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", position: "relative", boxSizing: "border-box" }}>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer", color: "rgba(0,0,0,0.6)", zIndex: 10, transition: "background 0.2s" }}
              >
                &times;
              </button>

              {/* Sidebar */}
              <div style={{ width: isMobile ? "100%" : "320px", background: "rgba(var(--eco-c9-rgb), 0.05)", borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,0.05)", borderBottom: isMobile ? "1px solid rgba(0,0,0,0.05)" : "none", /* On mobile the tab strip runs the full width, straight under the
                  floating close button — the extra top inset keeps it clear. */
              padding: isMobile ? "72px 20px 18px" : "40px 32px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0, overflowY: isMobile ? "visible" : "auto" }}>
                {!isMobile && (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Display only. Changing the photo is a My Profile job, so
                        no camera badge or menu hangs off this one. */}
                    <AvatarCircle src={profilePic} name={loggedInUser} size={64} busy={avatarBusy} />
                    <div style={{ overflow: "hidden" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#000", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInUser || "User"}</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "rgba(0,0,0,0.6)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInEmail || "hello@ecoequity.com"}</p>
                    </div>
                  </div>
                )}

                {/* One data-driven nav instead of nine hand-written buttons —
                    every item picked up its own drifting copy of the same
                    styles. Desktop shows the section headings from
                    DASHBOARD_SECTIONS; the mobile strip is one scrolling row,
                    where headings would only eat horizontal space. */}
                <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: isMobile ? "8px" : "4px", overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? "4px" : 0 }}>
                  {DASHBOARD_SECTIONS.map(({ section, items }) => {
                    const visible = items.filter(item => !(item.desktopOnly && isMobile));
                    if (visible.length === 0) return null;
                    return (
                      <React.Fragment key={section}>
                        {!isMobile && (
                          <div style={{
                            padding: "14px 14px 6px", fontSize: "10.5px", fontWeight: 800,
                            letterSpacing: "0.09em", textTransform: "uppercase",
                            color: "rgba(var(--eco-c19-rgb), 0.42)",
                          }}>
                            {section}
                          </div>
                        )}
                        {visible.map(({ key, label, Icon }) => {
                          const active = settingsTab === key;
                          const hot = hoveredSettingsTab === key;
                          const count = dashboardTabCounts[key];
                          return (
                            <button
                              key={key}
                              onClick={() => setSettingsTab(key)}
                              onMouseEnter={() => setHoveredSettingsTab(key)}
                              onMouseLeave={() => setHoveredSettingsTab(null)}
                              style={{
                                display: "flex", alignItems: "center", gap: "11px",
                                padding: isMobile ? "10px 14px" : "11px 14px",
                                borderRadius: "14px",
                                border: `1px solid ${active ? "rgba(var(--eco-c5-rgb), 0.45)" : "transparent"}`,
                                background: active
                                  ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.28), rgba(var(--eco-c5-rgb), 0.28))"
                                  : hot ? "rgba(var(--eco-c9-rgb), 0.07)" : "transparent",
                                color: active ? "var(--eco-c15)" : hot ? "var(--eco-c15)" : "rgba(var(--eco-c19-rgb), 0.66)",
                                fontSize: "14px", fontWeight: active ? 800 : 650,
                                textAlign: "left", cursor: "pointer", whiteSpace: "nowrap",
                                fontFamily: "inherit", width: isMobile ? "auto" : "100%",
                                flexShrink: 0,
                                boxShadow: active ? "0 8px 20px rgba(var(--eco-c7-rgb), 0.16), inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
                                transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                              }}
                            >
                              <Icon size={17} strokeWidth={active ? 2.5 : 2.1} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
                              <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
                              {count > 0 && (
                                <span style={{
                                  flexShrink: 0, minWidth: "20px", height: "20px", padding: "0 6px",
                                  borderRadius: "999px", background: active ? "rgba(var(--eco-c15-rgb), 0.14)" : "rgba(var(--eco-c9-rgb), 0.12)",
                                  color: "var(--eco-c13)", fontSize: "11px", fontWeight: 800,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>{count}</span>
                              )}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Signing out belongs with the account, not with a tab —
                    it sits at the foot of the sidebar on desktop. */}
                {!isMobile && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredSettingsTab("logout")}
                    onMouseLeave={() => setHoveredSettingsTab(null)}
                    style={{
                      marginTop: "auto", display: "flex", alignItems: "center", gap: "11px",
                      padding: "11px 14px", borderRadius: "14px",
                      border: "1px solid rgba(var(--eco-c9-rgb), 0.18)",
                      background: hoveredSettingsTab === "logout" ? "rgba(var(--eco-c9-rgb), 0.10)" : "rgba(var(--eco-c9-rgb), 0.05)",
                      color: "var(--eco-c13)", fontSize: "14px", fontWeight: 750,
                      textAlign: "left", cursor: "pointer", fontFamily: "inherit", width: "100%",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <LogOut size={17} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                    Log Out
                  </button>
                )}
              </div>

              {/* Main Content Area */}
              <div style={{ flex: 1, padding: isMobile ? "24px" : "48px 56px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                
                {settingsTab === "profile" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="My Profile"
                      subtitle="Update your personal information and delivery details."
                    />

                    {/* Suspended is set in Admin Portal → Users; say so plainly
                        rather than letting the form look normal. */}
                    {myMember && myMember.status === "Suspended" && (
                      <div style={{ padding: "16px 18px", borderRadius: "16px", background: dashTone("rose").bg, border: `1px solid ${dashTone("rose").edge}`, display: "flex", alignItems: "flex-start", gap: "13px" }}>
                        <IconChip tone="rose" size={38}><FaExclamationTriangle size={16} /></IconChip>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 850, color: DASH.rose }}>Account suspended</div>
                          <div style={{ fontSize: "13px", color: DASH.inkSoft, marginTop: "3px", lineHeight: 1.55 }}>
                            The {adminSettings.platformName || "EcoEquity"} team has put this account on hold. Contact{" "}
                            <a href={`mailto:${adminSettings.supportEmail || "ecoequity.inc2026@gmail.com"}`} style={{ color: DASH.green, fontWeight: 700 }}>{adminSettings.supportEmail || "ecoequity.inc2026@gmail.com"}</a> to restore access.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile photo — the only place it can be changed. It
                        leads the page, above the account's own record, because
                        it is the one thing here that is the member's to set. */}
                    <div style={{
                      ...dashCard,
                      padding: isMobile ? "24px 18px" : "24px 26px",
                      display: "flex", flexDirection: isMobile ? "column" : "row",
                      alignItems: "center", gap: isMobile ? "12px" : "20px",
                      textAlign: isMobile ? "center" : "left",
                    }}>
                      <AvatarEditor
                        src={profilePic}
                        name={loggedInUser}
                        size={isMobile ? 86 : 78}
                        align={isMobile ? "center" : "left"}
                        busy={avatarBusy}
                        error={avatarError}
                        onFile={handleAvatarFile}
                        onRemove={handleAvatarRemove}
                      />
                      <div style={{ minWidth: 0, maxWidth: "100%" }}>
                        <h3 style={{ margin: 0, fontSize: isMobile ? "18px" : "19px", fontWeight: 850, color: DASH.ink, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInUser || "User"}</h3>
                        <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: DASH.inkSoft, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{loggedInEmail || "hello@ecoequity.com"}</p>
                        <p style={{ margin: "8px 0 0", fontSize: "12px", color: DASH.inkFaint, fontWeight: 650, lineHeight: 1.5 }}>
                          Tap the photo to upload a new one or remove it.
                        </p>
                      </div>
                    </div>

                    {/* Account record as maintained by the team in the Admin Portal */}
                    {myMember && (
                      <Panel
                        title="Account record"
                        subtitle={`Maintained by the ${adminSettings.platformName || "EcoEquity"} team.`}
                        right={<Pill tone={myMember.status === "Suspended" ? "rose" : myMember.status === "Online" ? "green" : "slate"}>{myMember.status}</Pill>}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "16px" }}>
                          <Field label="Member ID" value={myMember.id} />
                          <Field label="Account Type" value={myMember.role} />
                          <Field label="EcoPoints" value={`${Number(myMember.ecoPoints || 0).toLocaleString()} pts`} tone="green" />
                        </div>
                      </Panel>
                    )}

                    <Panel title="Your details" subtitle="Your name and address travel with every order you place.">
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", width: "100%" }}>
                        <div style={{ width: "100%" }}>
                          <label style={{ ...dashLabel, display: "block", marginBottom: "7px" }}>Full Name</label>
                          <input type="text" placeholder="Full Name" value={loggedInUser} onChange={(e) => setLoggedInUser(e.target.value)} style={dashInput} />
                        </div>

                        <div style={{ width: "100%" }}>
                          <label style={{ ...dashLabel, display: "block", marginBottom: "7px" }}>Phone Number</label>
                          <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={dashInput} />
                        </div>

                        <div style={{ width: "100%", gridColumn: isMobile ? "auto" : "1 / -1" }}>
                          <label style={{ ...dashLabel, display: "block", marginBottom: "7px" }}>Email Address</label>
                          {/* The account email identifies the login, so it is shown but not editable. */}
                          <input type="email" placeholder="Email" value={loggedInEmail || "hello@ecoequity.com"} readOnly style={{ ...dashInput, background: "rgba(var(--eco-c19-rgb), 0.03)", color: DASH.inkFaint, cursor: "not-allowed" }} />
                          <span style={{ display: "block", marginTop: "6px", fontSize: "11.5px", color: DASH.inkFaint, fontWeight: 600 }}>Your email is tied to your sign-in and can't be changed here.</span>
                        </div>

                        <div style={{ width: "100%", gridColumn: isMobile ? "auto" : "1 / -1" }}>
                          <label style={{ ...dashLabel, display: "block", marginBottom: "7px" }}>Delivery Address</label>
                          <textarea placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...dashInput, resize: "none", height: "96px", lineHeight: 1.55 }} />
                        </div>
                      </div>
                    </Panel>

                    <button
                      onClick={() => {
                        // Saving here updates the same record the team sees in
                        // Admin Portal → Users.
                        updateMyUserRecord({ name: loggedInUser, phone: phoneNumber, address });
                        setShowSuccessModal(true);
                        setShowSettingsModal(false);
                      }}
                      style={{ ...dashPrimaryBtn, padding: "14px", fontSize: "15px", alignSelf: isMobile ? "stretch" : "flex-start", minWidth: isMobile ? "auto" : "220px" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {settingsTab === "earnHistory" && (() => {
                  // Credits and admin corrections are summarised separately —
                  // a running total that silently nets off a clawback reads as
                  // if the points were never awarded.
                  const credits = earnHistory.filter(e => Number(e.points || 0) > 0);
                  const debits = earnHistory.filter(e => Number(e.points || 0) < 0);
                  const totalEarned = credits.reduce((sum, e) => sum + Number(e.points || 0), 0);
                  const totalAdjusted = debits.reduce((sum, e) => sum + Number(e.points || 0), 0);
                  return (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="Earn History"
                      subtitle="Every EcoPoint credited to this account, newest first."
                    />

                    {earnHistory.length > 0 && (
                      <StatStrip
                        isMobile={isMobile}
                        items={[
                          { label: "Total Earned", value: `+${totalEarned.toLocaleString()}`, tone: "green", hint: `across ${credits.length} ${credits.length === 1 ? "entry" : "entries"}` },
                          { label: "Current Balance", value: Number(ecoPoints || 0).toLocaleString(), hint: currentTier },
                          ...(debits.length ? [{ label: "Adjustments", value: totalAdjusted.toLocaleString(), tone: "rose", hint: `${debits.length} correction${debits.length === 1 ? "" : "s"}` }] : []),
                        ]}
                      />
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px", paddingRight: "8px" }}>
                      {earnHistory.length === 0 ? (
                        <EmptyState
                          icon={<Activity size={24} strokeWidth={2.2} />}
                          title="No points earned yet"
                          body={'Check "How to Earn" under EcoPoints & Rewards for the ways to start collecting.'}
                          action={
                            <button onClick={() => setSettingsTab("ecopoints")} style={dashToneBtn("green")}>
                              See how to earn
                            </button>
                          }
                        />
                      ) : earnHistory.map((log, idx) => {
                        const amount = Number(log.points || 0);
                        const isDebit = amount < 0;
                        return (
                          <div
                            key={idx}
                            style={{ ...dashCard, padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}
                          >
                            <IconChip tone={isDebit ? "rose" : "green"} size={40}>{ecoIcon(log.icon, 17, isDebit ? DASH.rose : DASH.green)}</IconChip>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 750, color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.action}</h4>
                              <span style={{ fontSize: "12px", color: DASH.inkFaint, fontWeight: 600 }}>{log.date}</span>
                            </div>
                            {/* An admin correction in Admin Portal → Users can be
                                negative, so the sign comes from the entry. */}
                            <div style={{ flexShrink: 0, fontSize: "15px", fontWeight: 850, color: isDebit ? DASH.rose : DASH.greenBright }}>
                              {isDebit ? "" : "+"}{amount.toLocaleString()} pts
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })()}

                {settingsTab === "orders" && !selectedOrderForTracking && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="Order History"
                      subtitle="Every order you have placed, and where each one has got to."
                      action={
                        <CustomDropdown
                          options={["All Orders", "Pending Approval", "Approved", "Disapproved", "Processing", "Out for Delivery", "Delivered", "Cancelled"]}
                          value={orderFilter}
                          onChange={setOrderFilter}
                        />
                      }
                    />

                    {orders.length > 0 && (
                      <StatStrip
                        isMobile={isMobile}
                        items={[
                          { label: "In Progress", value: activeOrderCount, tone: activeOrderCount ? "amber" : "slate" },
                          { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, tone: "green" },
                          { label: "Total Spent", value: `₱${orders.reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                        ]}
                      />
                    )}
                    
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => {
                          // One colour per lifecycle stage, so a list of orders
                          // can be triaged at a glance.
                          const statusTone = order.status === "Delivered" ? "green"
                            : order.status === "Cancelled" || order.status === "Disapproved" ? "rose"
                            : order.status === "Out for Delivery" || order.status === "Pending Approval" ? "amber"
                            : "sky";
                          return (
                          <div key={order.id} style={{ ...dashCard, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", borderBottom: `1px solid ${DASH.line}`, paddingBottom: "12px" }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={dashLabel}>Order ID</div>
                                <div style={{ fontSize: "14.5px", fontWeight: 850, color: DASH.ink, marginTop: "2px" }}>{order.id}</div>
                              </div>
                              <Pill tone={statusTone}>{order.status}</Pill>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13.5px", color: "rgba(var(--eco-c19-rgb), 0.82)", marginBottom: "4px", fontWeight: 650, lineHeight: 1.45 }}>{order.items}</div>
                                <div style={{ fontSize: "12px", color: DASH.inkFaint, fontWeight: 600 }}>Placed on {order.date}</div>
                              </div>
                              <div style={{ flexShrink: 0, fontSize: "17px", fontWeight: 850, color: DASH.green }}>
                                ₱{Number(order.total || 0).toFixed(2)}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px", borderTop: `1px solid ${DASH.line}`, paddingTop: "13px" }}>
                              <button onClick={() => setSelectedOrderForTracking(order)} style={{ ...dashToneBtn("green"), flex: 1 }}>Track Order</button>
                              <button
                                onClick={() => setSelectedOrderForTracking(order)}
                                style={{ ...dashPrimaryBtn, flex: 1, padding: "11px 16px", fontSize: "13px" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >View Details</button>
                            </div>
                          </div>
                          );
                        })
                      ) : (
                        <EmptyState
                          icon={<Package size={24} strokeWidth={2.2} />}
                          title={orderFilter === "All Orders" ? "No orders yet" : `No ${orderFilter.toLowerCase()} orders`}
                          body={orderFilter === "All Orders"
                            ? "When you place an order it will appear here, with live delivery tracking."
                            : "Try a different status filter to see your other orders."}
                          action={orderFilter === "All Orders" ? (
                            <button onClick={() => { setShowSettingsModal(false); setActiveNav("Shop All Products"); }} style={dashToneBtn("green")}>
                              Start shopping
                            </button>
                          ) : (
                            <button onClick={() => setOrderFilter("All Orders")} style={dashToneBtn("green")}>
                              Show all orders
                            </button>
                          )}
                        />
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
                            padding: "10px 16px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", color: "var(--eco-c13)", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.15)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.1)"}
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
                          <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", justifySelf: "start", background: selectedOrderForTracking.status === "Delivered" ? "rgba(var(--eco-c7-rgb), 0.1)" : selectedOrderForTracking.status === "Cancelled" ? "rgba(var(--eco-c9-rgb), 0.1)" : selectedOrderForTracking.status === "Out for Delivery" ? "rgba(var(--eco-c7-rgb), 0.1)" : "rgba(var(--eco-c7-rgb), 0.1)", color: selectedOrderForTracking.status === "Delivered" ? "var(--eco-c13)" : selectedOrderForTracking.status === "Cancelled" ? "var(--eco-c13)" : selectedOrderForTracking.status === "Out for Delivery" ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                            {selectedOrderForTracking.status}
                          </span>
                          
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>PAYMENT</span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: selectedOrderForTracking.paymentStatus === "Paid" ? "var(--eco-c13)" : "rgba(0,0,0,0.8)" }}>
                            {[selectedOrderForTracking.payment, selectedOrderForTracking.paymentStatus].filter(Boolean).join(" • ") || "Pending confirmation"}
                          </span>

                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600, textAlign: "right" }}>TOTAL</span>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--eco-c13)" }}>₱{selectedOrderForTracking.total.toFixed(2)}</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>ITEMS</span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.8)", lineHeight: 1.5 }}>{selectedOrderForTracking.items}</span>
                        </div>
                      </div>

                      {/* Dispatch record — mirrors what the admin sets in the Deliveries tab */}
                      {trackedDelivery && (
                        <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Delivery Details</h3>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "14px" }}>
                            {[
                              { label: "Tracking No.", value: trackedDelivery.id },
                              { label: "Delivery Status", value: trackedDelivery.status },
                              { label: "Rider", value: trackedDelivery.rider && trackedDelivery.rider !== "Unassigned" ? trackedDelivery.rider : "Being assigned" },
                              { label: "Rider Update", value: trackedDelivery.riderStatus || "Awaiting rider update" },
                              { label: "ETA", value: trackedDelivery.eta && trackedDelivery.eta !== "N/A" ? trackedDelivery.eta : "To be confirmed" },
                              { label: "Vehicle", value: trackedRider?.vehicle || trackedDelivery.type || "Standard" },
                              { label: "Distance", value: trackedDelivery.distance || "TBD" },
                              { label: "Rider Contact", value: trackedRider?.phone || "Available once assigned" },
                              { label: "Delivery Address", value: trackedDelivery.address || selectedOrderForTracking.address || "As provided at checkout" },
                              { label: "Payment", value: [trackedDelivery.payment, trackedDelivery.paymentStatus].filter(Boolean).join(" • ") || "As provided at checkout" },
                            ].map(row => (
                              <div key={row.label} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{row.label}</span>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: "rgba(0,0,0,0.82)" }}>{row.value}</span>
                              </div>
                            ))}
                          </div>
                          {trackedDelivery.instructions && trackedDelivery.instructions !== "N/A" && (
                            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Delivery Instructions</span>
                              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>{trackedDelivery.instructions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tracking Timeline */}
                      <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(var(--eco-c0-rgb), 0.6))", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                        <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Tracking Timeline</h3>
                        
                        {selectedOrderForTracking.status === "Out for Delivery" && (
                          <>
                          <div style={{ marginBottom: "20px", borderRadius: "16px", overflow: "hidden", position: "relative", height: "180px", background: "var(--eco-c0)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
                            <div style={{ position: "absolute", inset: 0, backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%230ea5e9\\' fill-opacity=\\'0.1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
                            <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                              <path d="M 40 140 Q 200 140 200 90 T 360 40" fill="none" stroke="var(--eco-c6)" strokeWidth="4" strokeDasharray="8 8" style={{ animation: "dashMove 2s linear infinite" }} />
                            </svg>
                            <div style={{ position: "absolute", top: "140px", left: "10%", transform: "translate(-50%, -50%)", fontSize: "28px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))", zIndex: 5 }}><Store size={26} color="var(--eco-c9)" /></div>
                            <div style={{ position: "absolute", top: "40px", left: "90%", transform: "translate(-50%, -50%)", fontSize: "28px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))", zIndex: 5 }}><MapPin size={26} color="var(--eco-c9)" /></div>
                            <div style={{ position: "absolute", top: "90px", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                              <div style={{ fontSize: "32px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", animation: "riderFloat 3s infinite ease-in-out" }}><Bike size={30} color="var(--eco-c9)" /></div>
                            </div>
                            <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "var(--eco-c13)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--eco-c8)", display: "inline-block" }} className="animate-progressPulse" /> Live Update
                            </div>
                          </div>
                          <div style={{ marginBottom: "28px", padding: "20px", background: "rgba(255,255,255,0.9)", borderRadius: "16px", border: "1px solid rgba(var(--eco-c7-rgb), 0.3)", boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.1)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(var(--eco-c7-rgb), 0.15)", border: "2px solid var(--eco-c9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                                <Bike size={26} color="var(--eco-c9)" />
                              </div>
                              <div style={{ flex: 1, minWidth: "120px" }}>
                                <div style={{ fontSize: "15px", fontWeight: 800, color: "#000" }}>
                                  Rider: {trackedDelivery?.rider && trackedDelivery.rider !== "Unassigned" ? trackedDelivery.rider : "Being assigned"}
                                </div>
                                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
                                  {[trackedRider?.vehicle || trackedDelivery?.type, trackedRider?.phone, trackedRider?.area].filter(Boolean).join(" • ") || "Vehicle details pending"}
                                </div>
                              </div>
                              <button onClick={() => setShowRiderChat(true)} style={{ padding: "8px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c6-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.4)", color: "var(--eco-c15)", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.2)" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                Contact Rider
                              </button>
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
                              <div className="animate-progressPulse" style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))", borderRadius: "999px", boxShadow: "0 0 10px rgba(var(--eco-c7-rgb), 0.5)" }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", fontWeight: 700, color: "var(--eco-c13)" }}>
                              <span>{trackedDelivery?.riderStatus || trackedDelivery?.status || "On the way"}</span>
                              <span>{trackedDelivery?.eta && trackedDelivery.eta !== "N/A" ? `Arriving in ~${trackedDelivery.eta}` : "ETA being confirmed"}</span>
                            </div>
                          </div>
                          </>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                          
                          <div style={{ position: "absolute", left: "15px", top: "16px", bottom: "16px", width: "2px", background: selectedOrderForTracking.status === "Delivered" ? "var(--eco-c9)" : "rgba(0,0,0,0.05)", transition: "background 0.5s ease" }}>
                             <div style={{ 
                               width: "100%", 
                               background: "var(--eco-c9)", 
                               height: selectedOrderForTracking.status === "Delivered" ? "100%" : 
                                       selectedOrderForTracking.status === "Out for Delivery" ? "75%" : 
                                       selectedOrderForTracking.status === "Shipped" ? "50%" : "25%",
                               transition: "height 1s ease-in-out",
                               boxShadow: selectedOrderForTracking.status === "Delivered" ? "0 0 12px rgba(var(--eco-c9-rgb), 0.6)" : "none"
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
                                  background: isCompleted ? "var(--eco-c9)" : "#fff", 
                                  border: isCompleted ? "none" : "2px solid rgba(0,0,0,0.1)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "12px", flexShrink: 0,
                                  boxShadow: isCurrent ? "0 0 0 4px rgba(var(--eco-c7-rgb), 0.2)" : "none",
                                  transition: "all 0.3s ease"
                                }}>
                                  {isCompleted ? <span style={{ color: "#fff", fontWeight: 800 }}><Check size={12} color="#fff" /></span> : <span style={{ color: "rgba(0,0,0,0.2)", fontWeight: 800 }}>{idx + 1}</span>}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "6px", flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 700, color: isCompleted ? "var(--eco-c13)" : "#000" }}>{step.label}</span>
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
                            <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(var(--eco-c0-rgb), 0.6))", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                              <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#000" }}>How was your order?</h3>
                              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Rate your experience to help us improve and earn 10 EcoPoints!</p>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} onClick={() => setOrderReviewRating(star)} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} width="28" height="28" viewBox="0 0 24 24" fill={star <= orderReviewRating ? "var(--eco-c6)" : "none"} stroke={star <= orderReviewRating ? "var(--eco-c6)" : "rgba(0,0,0,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
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
                                    emoji: [<Star size={16} color="var(--eco-c7)" />, <Sparkles size={16} color="var(--eco-c9)" />, <PartyPopper size={16} color="var(--eco-c9)" />, <Leaf size={16} color="var(--eco-c9)" />][Math.floor(Math.random() * 4)],
                                    angle: Math.random() * Math.PI * 2,
                                    velocity: 40 + Math.random() * 80
                                  }));
                                  setRewardParticles(prev => [...prev, ...newParticles]);
                                  setTimeout(() => setRewardParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);
                                }} 
                                style={{ width: "100%", padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c19)", fontWeight: 700, fontSize: "13px", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.2s ease", marginTop: "auto" }} 
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                Submit Review
                              </button>
                            </div>
                          ) : (
                            <div style={{ padding: "20px 24px", borderRadius: "16px", background: "rgba(var(--eco-c7-rgb), 0.1)", border: "1px solid rgba(var(--eco-c7-rgb), 0.2)", display: "flex", alignItems: "center", gap: "16px", animation: "scaleUp 0.3s ease-out" }}>
                              <div style={{ fontSize: "28px" }}><PartyPopper size={28} color="var(--eco-c9)" /></div>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 800, color: "var(--eco-c13)" }}>Review Submitted!</h3>
                                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= orderReviewRating ? "var(--eco-c6)" : "none"} stroke={star <= orderReviewRating ? "var(--eco-c6)" : "rgba(var(--eco-c11-rgb), 0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                  ))}
                                </div>
                                <p style={{ margin: 0, fontSize: "13px", color: "rgba(var(--eco-c11-rgb), 0.8)", fontWeight: 500 }}>Thank you for your feedback. You earned 10 EcoPoints.</p>
                              </div>
                            </div>
                          )}

                          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#000" }}>Need Help?</h3>
                            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>Report missing items, damages, or request a return within our 7-day guarantee period.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                              <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(var(--eco-c9-rgb), 0.08)", color: "var(--eco-c13)", fontWeight: 700, fontSize: "13px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--eco-c9-rgb), 0.15)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(var(--eco-c9-rgb), 0.08)'}>Report an Issue</button>
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
                    <SectionHead
                      isMobile={isMobile}
                      title="My Certificates"
                      subtitle="Courses you have completed, plus any certificate issued to you by the team."
                      action={myCertificates.length > 0 && <Pill tone="green">{myCertificates.length} earned</Pill>}
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "14px", paddingRight: "8px" }}>
                      {myCertificates.length === 0 ? (
                        <EmptyState
                          icon={<GraduationCap size={26} strokeWidth={2.1} />}
                          title="No certificates yet"
                          body="Finish a course in Specialist Certification and your certificate will appear here, ready to preview, share or download."
                          action={
                            <button
                              onClick={() => { setShowSettingsModal(false); setActiveNav("Specialist Certification"); }}
                              style={dashToneBtn("green")}
                            >
                              Browse courses
                            </button>
                          }
                        />
                      ) : myCertificates.map((cert, idx) => (
                        <div
                          key={cert.id || idx}
                          style={{
                            ...dashCard,
                            padding: "20px 22px",
                            background: "linear-gradient(140deg, rgba(255,255,255,0.85), rgba(var(--eco-c0-rgb), 0.7))",
                            border: `1px solid ${dashTone("green").edge}`,
                            display: "flex", flexDirection: "column", gap: "16px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                            <IconChip tone="green" size={48}><GraduationCap size={24} strokeWidth={2.1} /></IconChip>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "16.5px", fontWeight: 850, color: DASH.ink, lineHeight: 1.3 }}>{cert.course}</div>
                              <div style={{ fontSize: "12.5px", color: DASH.inkSoft, fontWeight: 600, marginTop: "4px" }}>
                                Completed {cert.date}
                                {/* Hand-issued from Admin Portal → Users */}
                                {cert.issuedBy && <> · Issued by {cert.issuedBy}</>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                                <Pill tone="green"><BadgeCheck size={11} style={{ verticalAlign: "-1.5px", marginRight: "3px" }} />{cert.status}</Pill>
                                <span style={{ fontSize: "11.5px", fontWeight: 700, color: DASH.inkFaint, letterSpacing: "0.3px" }}>{cert.id}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "10px", borderTop: `1px solid ${DASH.line}`, paddingTop: "14px", flexWrap: "wrap" }}>
                            <button
                              style={{ ...dashToneBtn("green"), flex: 1, minWidth: "104px" }}
                              onClick={() => alert(`Previewing ${cert.course} Certificate`)}
                            >
                              Preview
                            </button>
                            <button
                              style={{ ...dashToneBtn("sky"), flex: 1, minWidth: "104px" }}
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
                              style={{ ...dashPrimaryBtn, flex: 1, minWidth: "104px", padding: "11px 16px", fontSize: "13px" }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              onClick={() => alert(`Downloading ${cert.course} Certificate`)}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === "wishlist" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%", position: 'relative' }}>
                    {showClearWishlistConfirm && (
                      <div style={nestedConfirmOverlay(10)}>
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
                    {(() => {
                      const saved = (savedProducts || []).map(id => products.find(p => p.id === id)).filter(Boolean);
                      const totalValue = saved.reduce((sum, p) => sum + Number(p.price || 0), 0);
                      const inStock = saved.filter(p => p.stock === "In Stock").length;
                      return (
                        <>
                          <SectionHead
                            isMobile={isMobile}
                            title="Wishlist"
                            subtitle="Products you saved. Prices and stock update live from the catalog."
                            action={saved.length > 0 && (
                              <button
                                onClick={() => setShowClearWishlistConfirm(true)}
                                style={dashGhostBtn}
                                onMouseEnter={(e) => { e.currentTarget.style.background = dashTone("rose").bg; e.currentTarget.style.borderColor = dashTone("rose").edge; e.currentTarget.style.color = DASH.rose; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = DASH.line; e.currentTarget.style.color = "rgba(var(--eco-c19-rgb), 0.72)"; }}
                              >
                                <Trash2 size={13} style={{ verticalAlign: "-2px", marginRight: "6px" }} />Empty Wishlist
                              </button>
                            )}
                          />

                          {saved.length > 0 && (
                            <StatStrip
                              isMobile={isMobile}
                              items={[
                                { label: "Saved Items", value: saved.length },
                                { label: "Total Value", value: `₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                                { label: "Ready to Ship", value: inStock, tone: inStock ? "green" : "slate", hint: `of ${saved.length} in stock` },
                              ]}
                            />
                          )}

                          {successMessage && (
                            <div style={{ padding: "12px 16px", borderRadius: "14px", background: dashTone("green").bg, border: `1px solid ${dashTone("green").edge}`, color: DASH.green, fontSize: "13.5px", fontWeight: 700, marginBottom: "14px", animation: "fadeIn 0.3s ease", display: "flex", alignItems: "center", gap: "9px" }}>
                              <CheckCircle2 size={16} color={DASH.greenBright} /> {successMessage}
                            </div>
                          )}

                          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px", paddingRight: "8px" }}>
                            {saved.length === 0 ? (
                              <EmptyState
                                icon={<Heart size={24} strokeWidth={2.2} />}
                                title="Your wishlist is empty"
                                body="Tap the heart on any product to save it here for later."
                                action={
                                  <button
                                    onClick={() => { setShowSettingsModal(false); setActiveNav("Shop All Products"); }}
                                    style={dashToneBtn("green")}
                                  >
                                    Browse products
                                  </button>
                                }
                              />
                            ) : saved.map(product => {
                              // Price and stock are read live off the admin's catalog, so a
                              // repricing or a stock change lands here immediately.
                              const stockTone = product.stock === "In Stock" ? "green" : product.stock === "Low Stock" ? "amber" : "rose";
                              const soldOut = product.stock && product.stock !== "In Stock" && product.stock !== "Low Stock";
                              return (
                                <div key={product.id} style={{ ...dashCard, padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                                  <ProductThumb src={product.image} alt={product.name} emoji={product.emoji} />
                                  <div style={{ flex: 1, minWidth: isMobile ? "140px" : 0 }}>
                                    <div style={{ fontSize: "14.5px", fontWeight: 750, color: DASH.ink, lineHeight: 1.3 }}>{product.name}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "14px", fontWeight: 850, color: DASH.green }}>₱{Number(product.price || 0).toFixed(2)}</span>
                                      {product.stock && <Pill tone={stockTone}>{product.stock}</Pill>}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                                    <button
                                      disabled={soldOut}
                                      onClick={() => {
                                        setCartItems(prev => [...prev, product.id]);
                                        setSuccessMessage(`${product.name} successfully added to cart!`);
                                        setTimeout(() => setSuccessMessage(null), 3000);
                                      }}
                                      style={{ ...dashToneBtn("green"), opacity: soldOut ? 0.45 : 1, cursor: soldOut ? "not-allowed" : "pointer" }}
                                    >
                                      <ShoppingBag size={13} style={{ verticalAlign: "-2px", marginRight: "6px" }} />Add to Cart
                                    </button>
                                    <button
                                      onClick={() => { setShowSettingsModal(false); setActiveNav("Shop All Products"); }}
                                      style={dashGhostBtn}
                                    >
                                      View
                                    </button>
                                    <button
                                      title={`Remove ${product.name} from wishlist`}
                                      onClick={() => setSavedProducts(prev => prev.filter(pId => pId !== product.id))}
                                      style={{ ...dashToneBtn("rose"), padding: "9px 11px", display: "flex", alignItems: "center" }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {settingsTab === "ecopoints" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", marginBottom: "20px", paddingBottom: "16px", borderBottom: `1px solid ${DASH.line}`, flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={{ margin: 0, fontSize: "23px", fontWeight: 850, color: DASH.ink, letterSpacing: "-0.4px" }}>EcoPoints &amp; Rewards</h2>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: DASH.inkSoft, lineHeight: 1.5 }}>Your balance, tier and everything you can redeem.</p>
                      </div>
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
                              style={{ padding: "10px 14px", borderRadius: "10px", background: ecoPointsSection === section ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))" : hoveredEcoPointsOption === section ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))" : "transparent", border: ecoPointsSection === section ? "1px solid rgba(var(--eco-c5-rgb), 0.4)" : "1px solid transparent", color: ecoPointsSection === section || hoveredEcoPointsOption === section ? "var(--eco-c15)" : "#000", fontSize: "13px", fontWeight: ecoPointsSection === section ? 700 : 500, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", boxShadow: ecoPointsSection === section ? "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredEcoPointsOption === section ? "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)" : "none", backdropFilter: ecoPointsSection === section ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: ecoPointsSection === section ? "blur(12px) saturate(180%)" : "none" }}
                              >
                                {section === "All" ? "All Sections" : section}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {successMessage && (
                      <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(var(--eco-c7-rgb), 0.1)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "14px", fontWeight: 700, marginBottom: "16px", animation: "fadeIn 0.3s ease" }}>
                        {successMessage}
                      </div>
                    )}
                    {errorMessage && (
                      <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(var(--eco-c9-rgb), 0.1)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "14px", fontWeight: 700, marginBottom: "16px", animation: "fadeIn 0.3s ease" }}>
                        {errorMessage}
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                      {(ecoPointsSection === "All" || ecoPointsSection === "Dashboard") && (
                        <>
                          <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.1), rgba(var(--eco-c11-rgb), 0.1))", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>Current Balance</span>
                              <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--eco-c13)", marginTop: "4px", lineHeight: 1 }}>{ecoPoints.toLocaleString()} <span style={{ fontSize: "16px", fontWeight: 700 }}>pts</span></div>
                          </div>
                          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 8px 16px rgba(var(--eco-c9-rgb), 0.3)" }}>
                            <Gift size={30} color="#fff" />
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--eco-c13)" }}>Eco Level: {currentTier}</span>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>{nextTierLabel}</span>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "rgba(var(--eco-c9-rgb), 0.2)", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressToNextTier}%`, background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))", borderRadius: "999px" }}></div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                          <button 
                            onClick={() => openAccordion("Rewards Marketplace")}
                            style={{ flex: 1, padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "var(--eco-c19)", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >Redeem Rewards</button>
                          <button onClick={() => openAccordion("How to Earn")} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Earn More Points</button>
                        </div>
                          </div>

                          {/* Where the points came from and went — the balance
                              alone hides everything already spent. */}
                          <StatStrip
                            isMobile={isMobile}
                            items={[
                              { label: "Lifetime earned", value: ecoSummary.earned.toLocaleString(), tone: "green", hint: `${earnHistory.length} activities` },
                              { label: "Points redeemed", value: ecoSummary.spent.toLocaleString(), tone: "amber", hint: `${ecoSummary.claims} reward${ecoSummary.claims === 1 ? "" : "s"} claimed` },
                              { label: "Badges earned", value: `${badges.filter(b => b.earned).length}/${badges.length}`, tone: "sky", hint: currentTier },
                              { label: "Can redeem now", value: String(affordableRewardCount), tone: "violet", hint: `of ${ecoRewards.length} rewards` },
                            ]}
                          />

                          {nextBadge && (
                            <Panel
                              title="Next badge"
                              subtitle={`${nextBadge.remaining.toLocaleString()} more EcoPoints unlocks ${nextBadge.badge.name}.`}
                              right={<Pill tone="amber">{Number(nextBadge.badge.threshold || 0).toLocaleString()} pts</Pill>}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <IconChip size={48} tone="amber">{ecoIcon(nextBadge.badge.icon, 24)}</IconChip>
                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
                                  <MeterBar percent={nextBadge.percent} tone="amber" />
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: DASH.inkFaint }}>
                                    {ecoPoints.toLocaleString()} / {Number(nextBadge.badge.threshold || 0).toLocaleString()} pts
                                  </span>
                                </div>
                              </div>
                            </Panel>
                          )}

                          {/* Eco Activity Timeline */}
                          <div style={{ marginTop: "16px", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }}>
                            <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Eco Activity Timeline</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
                              <div style={{ position: "absolute", left: "20px", top: "20px", bottom: "20px", width: "2px", background: "linear-gradient(to bottom, rgba(var(--eco-c7-rgb), 0.4), rgba(var(--eco-c7-rgb), 0.1))", borderRadius: "999px" }}></div>
                              
                              {ecoTimeline.slice(0, visibleTimelineItems).map((activity, idx) => (
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
                            {visibleTimelineItems < ecoTimeline.length && (
                              <button 
                                onClick={() => setVisibleTimelineItems(prev => prev + 4)}
                                style={{ width: "100%", marginTop: "24px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--eco-c9-rgb), 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}>
                                Load More
                              </button>
                            )}
                          </div>
                        </>
                      )}
                      
                      {(ecoPointsSection === "All" || ecoPointsSection === "Rewards Marketplace") && (
                        <>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", margin: "16px 0 4px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#000" }}>REWARDS MARKETPLACE</h3>
                            <Pill tone={affordableRewardCount > 0 ? "green" : "slate"}>
                              {affordableRewardCount} within reach
                            </Pill>
                          </div>

                          {/* Search / sort / affordability, so a long catalog is
                              navigable instead of a wall of cards. */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "4px" }}>
                            <input
                              value={rewardSearch}
                              onChange={(e) => setRewardSearch(e.target.value)}
                              placeholder="Search rewards…"
                              style={{ ...dashInput, flex: "1 1 200px", width: "auto", padding: "10px 14px", fontSize: "13px" }}
                            />
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {rewardSortOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setRewardSort(option)}
                                  style={{
                                    ...dashGhostBtn,
                                    padding: "9px 14px",
                                    fontSize: "12px",
                                    ...(rewardSort === option
                                      ? { background: dashTone("green").bg, border: `1px solid ${dashTone("green").edge}`, color: dashTone("green").fg }
                                      : null),
                                  }}
                                >
                                  {option}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setAffordableOnly(v => !v)}
                                style={{
                                  ...dashGhostBtn,
                                  padding: "9px 14px",
                                  fontSize: "12px",
                                  ...(affordableOnly
                                    ? { background: dashTone("amber").bg, border: `1px solid ${dashTone("amber").edge}`, color: dashTone("amber").fg }
                                    : null),
                                }}
                              >
                                {affordableOnly ? "✓ " : ""}I can afford
                              </button>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                            {visibleRewardCards.map(({ reward, state }) => (
                              <RewardCard
                                key={reward.id}
                                reward={reward}
                                state={state}
                                icon={ecoIcon(reward.icon, 44)}
                                onRedeem={redeemReward}
                              />
                            ))}
                            {visibleRewardCards.length === 0 && (
                              <div style={{ gridColumn: "1 / -1" }}>
                                <EmptyState
                                  icon={<Gift size={22} />}
                                  title={ecoRewards.length === 0 ? "No rewards available yet" : "Nothing matches those filters"}
                                  body={ecoRewards.length === 0
                                    ? "The team hasn't published any rewards — check back soon."
                                    : "Try a different search, or turn off the affordability filter to see everything you're working towards."}
                                  action={ecoRewards.length > 0 && (
                                    <button onClick={() => { setRewardSearch(""); setAffordableOnly(false); setRewardSort("Recommended"); }} style={dashToneBtn("green")}>
                                      Clear filters
                                    </button>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "How to Earn") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>HOW TO EARN ECOPOINTS</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                            {/* Checkout is the one rule that scales with the
                                order, so it earns its own card rather than a
                                flat "+N pts" that would be wrong. */}
                            <div style={{ ...dashCard, padding: "16px", display: "flex", flexDirection: "column", gap: "8px", borderColor: dashTone("amber").edge }}>
                              <IconChip size={36} tone="amber">{ecoIcon("ShoppingCart", 18)}</IconChip>
                              <span style={{ fontSize: "14px", fontWeight: 800, color: DASH.ink }}>Every order you place</span>
                              <span style={{ fontSize: "13px", fontWeight: 800, color: DASH.green }}>
                                +{Math.floor(1000 * ecoEarnRate).toLocaleString()} pts per ₱1,000
                              </span>
                              <span style={{ fontSize: "11.5px", fontWeight: 600, color: DASH.inkFaint }}>
                                Awarded automatically at checkout.
                              </span>
                            </div>
                            {ecoEarnRules.map((rule) => {
                              const stats = earnRuleStats(rule, earnHistory);
                              return (
                                <div key={rule.id} style={{ ...dashCard, padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <IconChip size={36} tone="green">{ecoIcon(rule.icon, 18)}</IconChip>
                                  <span style={{ fontSize: "14px", fontWeight: 800, color: DASH.ink }}>{rule.action}</span>
                                  <span style={{ fontSize: "13px", fontWeight: 800, color: DASH.green }}>+{Number(rule.points || 0).toLocaleString()} pts</span>
                                  {/* Your own history against this rule — the
                                      list was previously identical for everyone. */}
                                  <span style={{ fontSize: "11.5px", fontWeight: 600, color: DASH.inkFaint }}>
                                    {stats.times === 0
                                      ? "You haven't done this yet"
                                      : `Done ${stats.times}× · +${stats.total.toLocaleString()} pts earned`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Eco Tiers") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>ECO TIER LEVELS</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        {ecoTiers.map((tier) => {
                          const active = currentTierRecord && tier.id === currentTierRecord.id;
                          // A tier below the current one is already banked; one
                          // above it is still locked, and worth saying how far.
                          const reached = ecoPoints >= Number(tier.min || 0);
                          const away = Math.max(0, Number(tier.min || 0) - ecoPoints);
                          return (
                          <div key={tier.id} style={{ background: active ? "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.1), rgba(var(--eco-c11-rgb), 0.1))" : "rgba(255,255,255,0.6)", border: active ? "1px solid rgba(var(--eco-c9-rgb), 0.4)" : "1px solid rgba(0,0,0,0.05)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", position: "relative", opacity: reached ? 1 : 0.8 }}>
                            {active && <span style={{ position: "absolute", top: "-10px", right: "16px", background: "var(--eco-c11)", color: "#fff", padding: "4px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700 }}>Current Level</span>}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#000" }}>{tier.title}</h4>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>{tierRangeLabel(tier)}</span>
                            </div>
                            <div>
                              <Pill tone={active ? "green" : reached ? "sky" : "slate"}>
                                {active ? "You are here" : reached ? "Unlocked" : `${away.toLocaleString()} pts away`}
                              </Pill>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", gap: "6px" }}>
                              {(tier.benefits || []).map((b, i) => <li key={i} style={{ fontWeight: 500 }}>{b}</li>)}
                            </ul>
                          </div>
                          );
                        })}
                      </div>
                        </>
                      )}

                      {(ecoPointsSection === "All" || ecoPointsSection === "Community Impact") && (
                        <>
                          <h3 style={{ margin: "16px 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>COMMUNITY IMPACT</h3>
                          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                          {ecoImpactStats.map((stat) => (
                             <div key={stat.id} style={{ background: "rgba(var(--eco-c9-rgb), 0.05)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                               <span style={{ fontSize: "24px" }}>{ecoIcon(stat.icon, 22)}</span>
                               <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--eco-c13)", lineHeight: 1 }}>{stat.value}</span>
                               <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>{stat.label}</span>
                             </div>
                          ))}
                        </div>
                        <div style={{ background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.15), rgba(var(--eco-c11-rgb), 0.15))", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", marginTop: "8px" }}>
                          <span style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--eco-c13)", flex: 1 }}>“{ecoImpactQuote}”</span>
                          <button
                            onClick={() => shareImpact()}
                            style={{ padding: "8px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c19)", border: "1px solid rgba(255,255,255,0.35)", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
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
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{ecoReferral.headline}</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>{ecoReferral.blurb}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "12px 16px", borderRadius: "12px", border: "1px dashed var(--eco-c11)" }}>
                          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--eco-c13)", letterSpacing: "2px" }}>{ecoReferral.code}</span>
                          <button 
                            onClick={copyReferralCode}
                            className={copiedReferral ? "animate-copy" : ""}
                            style={{ background: copiedReferral ? "var(--eco-c11)" : "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: copiedReferral ? "#fff" : "var(--eco-c19)", border: "1px solid rgba(255,255,255,0.35)", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "all 0.3s ease" }}
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
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", margin: "16px 0 4px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#000" }}>ACHIEVEMENT BADGES</h3>
                            <Pill tone="sky">{badges.filter(b => b.earned).length} of {badges.length} unlocked</Pill>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                        {badges.map((badge) => (
                               <div key={badge.id || badge.name} onClick={(e) => {
                                 if (badge.earned) {
                                   window.alert(`Badge Details:\n\n${badge.name}\n\nYou've unlocked this badge!`);
                                 } else {
                                   unlockBadge(badge.name, e);
                                 }
                               }} className={badge.justUnlocked ? "animate-unlock" : ""} style={{ background: badge.earned ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.02)", border: badge.earned ? "1px solid rgba(var(--eco-c9-rgb), 0.3)" : "1px dashed rgba(0,0,0,0.1)", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", opacity: badge.earned ? 1 : 0.6, cursor: badge.earned ? "default" : "pointer", transition: "all 0.3s ease" }}>
                             <span style={{ fontSize: "32px", filter: badge.earned ? "none" : "grayscale(100%)", transition: "filter 0.3s ease" }}>{ecoIcon(badge.icon, 30)}</span>
                             <span style={{ fontSize: "13px", fontWeight: 700, color: badge.earned ? "var(--eco-c13)" : "rgba(0,0,0,0.5)" }}>{badge.name}</span>
                             {!badge.earned && (
                               <>
                                 <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)", marginTop: "-4px" }}>Unlocks at {Number(badge.threshold || 0).toLocaleString()} pts</span>
                                 {/* How close the balance is, so a locked badge
                                     reads as a goal rather than a dead tile. */}
                                 <MeterBar
                                   percent={Number(badge.threshold || 0) > 0 ? (ecoPoints / Number(badge.threshold)) * 100 : 100}
                                   height={4}
                                   tone="amber"
                                 />
                               </>
                             )}
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
                                  {/* "Used" and "Cancelled" are real fulfilment
                                      states the admin can set, so they belong
                                      here — filtering by them used to be
                                      impossible even though rows existed. */}
                                  {["All", ...REDEMPTION_FILTERS].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => { setRedeemHistoryFilter(status); setIsRedeemFilterDropdownOpen(false); }}
                                      onMouseEnter={() => setHoveredRedeemFilterOption(status)}
                                      onMouseLeave={() => setHoveredRedeemFilterOption(null)}
                                      style={{ padding: "8px 12px", borderRadius: "8px", background: redeemHistoryFilter === status ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))" : hoveredRedeemFilterOption === status ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))" : "transparent", border: redeemHistoryFilter === status ? "1px solid rgba(var(--eco-c5-rgb), 0.4)" : "1px solid transparent", color: redeemHistoryFilter === status || hoveredRedeemFilterOption === status ? "var(--eco-c15)" : "#000", fontSize: "12px", fontWeight: redeemHistoryFilter === status ? 700 : 500, textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", boxShadow: redeemHistoryFilter === status ? "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)" : hoveredRedeemFilterOption === status ? "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)" : "none", backdropFilter: redeemHistoryFilter === status ? "blur(12px) saturate(180%)" : "none", WebkitBackdropFilter: redeemHistoryFilter === status ? "blur(12px) saturate(180%)" : "none" }}
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
                              const history = redeemHistory.filter(item => redeemHistoryFilter === "All" || item.status === redeemHistoryFilter);

                              if (history.length === 0) {
                                return <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center", color: "rgba(0,0,0,0.5)", fontSize: "13px" }}>No records found for this status.</td></tr>;
                              }
                              
                              return history.map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 600 }}>{item.reward}</td>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 700, color: "var(--eco-c13)" }}>{item.points} pts</td>
                                  <td style={{ padding: "12px 8px", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>{item.date}</td>
                                  <td style={{ padding: "12px 8px" }}>
                                    <Pill tone={item.status === "Active" ? "green" : item.status === "Shipped" ? "sky" : item.status === "Cancelled" ? "rose" : "slate"}>
                                      {item.status}{item.status === "Cancelled" ? " · refunded" : ""}
                                    </Pill>
                                  </td>
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

                {/* Updates — everything the admin publishes in Content Management */}
                {settingsTab === "updates" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="Updates"
                      subtitle={`Announcements, articles and guides published by the ${adminSettings.platformName || "EcoEquity"} team.`}
                      action={publishedContent.length > 0 && <Pill tone="sky">{publishedContent.length} published</Pill>}
                    />

                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
                      {publishedContent.length > 0 ? (
                        publishedContent.map((item) => {
                          // Announcements are time-sensitive; guides and articles are
                          // reference material. Colour-code so the feed scans.
                          const typeTone = item.type === "Announcement" ? "amber" : item.type === "Guide" ? "violet" : "sky";
                          return (
                            <article key={item.id} style={{ ...dashCard, padding: "18px 20px", display: "flex", gap: "14px" }}>
                              <IconChip tone={typeTone} size={40}>
                                {item.type === "Announcement" ? <Megaphone size={18} strokeWidth={2.2} /> : <FileTextIcon size={18} strokeWidth={2.2} />}
                              </IconChip>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "7px" }}>
                                  <Pill tone={typeTone}>{item.type}</Pill>
                                  <span style={{ fontSize: "12px", fontWeight: 650, color: DASH.inkFaint }}>{item.date}</span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 850, color: DASH.ink, lineHeight: 1.35 }}>{item.title}</h3>
                                {item.body && (
                                  <p style={{ margin: "7px 0 0", fontSize: "13.5px", color: DASH.inkSoft, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{item.body}</p>
                                )}
                                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${DASH.line}`, fontSize: "12px", fontWeight: 650, color: DASH.inkFaint }}>
                                  by {item.author}
                                </div>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <EmptyState
                          icon={<Megaphone size={24} strokeWidth={2.2} />}
                          title="No updates yet"
                          body="New announcements and guides will appear here as soon as the team publishes them."
                        />
                      )}
                    </div>
                  </div>
                )}

                {settingsTab === "support" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="Support Tickets"
                      subtitle={<>Track submitted issues, questions and requests in one place. You can also reach us at{" "}
                        <a href={`mailto:${adminSettings.supportEmail || "ecoequity.inc2026@gmail.com"}`} style={{ color: DASH.green, fontWeight: 700 }}>
                          {adminSettings.supportEmail || "ecoequity.inc2026@gmail.com"}
                        </a>.</>}
                      action={
                        <button
                          type="button"
                          onClick={() => setShowSupportTicketModal(true)}
                          style={{ ...dashPrimaryBtn, display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Headset size={16} strokeWidth={2.5} />
                          New Ticket
                        </button>
                      }
                    />

                    {supportTickets.length > 0 && (
                      <StatStrip
                        isMobile={isMobile}
                        items={[
                          { label: "Open", value: supportTickets.filter(t => t.status === "Open").length, tone: "green" },
                          { label: "High Priority", value: supportTickets.filter(t => t.priority === "High" || t.priority === "Urgent").length, tone: "rose" },
                          { label: "Total Submitted", value: supportTickets.length, tone: "sky" },
                        ]}
                      />
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
                      {supportTickets.length > 0 ? (
                        supportTickets.map((ticket) => {
                          const urgent = ticket.priority === "High" || ticket.priority === "Urgent";
                          const resolved = ticket.status === "Resolved" || ticket.status === "Closed";
                          return (
                          <div key={ticket.id} style={{ ...dashCard, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "12px", fontWeight: 850, color: DASH.green, letterSpacing: "0.3px" }}>{ticket.id}</span>
                                  <Pill tone={urgent ? "rose" : "sky"}>{ticket.priority}</Pill>
                                  <Pill tone={resolved ? "green" : "amber"}>{ticket.status}</Pill>
                                </div>
                                <h3 style={{ margin: "9px 0 5px", fontSize: "16px", fontWeight: 850, color: DASH.ink, lineHeight: 1.3 }}>{ticket.subject}</h3>
                                <p style={{ margin: 0, fontSize: "13.5px", color: DASH.inkSoft, lineHeight: 1.55 }}>{ticket.description}</p>
                              </div>
                              <div style={{ textAlign: isMobile ? "left" : "right", flexShrink: 0 }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: DASH.inkFaint }}>{ticket.createdAt}</div>
                                <div style={{ marginTop: "5px" }}><Pill tone="slate">{ticket.category}</Pill></div>
                              </div>
                            </div>

                            {/* Replies the admin adds in the Admin Portal show up here */}
                            {(ticket.replies || []).length > 0 && (
                              <div style={{ paddingTop: "13px", borderTop: `1px solid ${DASH.line}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={dashLabel}>Support Replies ({ticket.replies.length})</div>
                                {ticket.replies.map((reply, idx) => (
                                  <div key={idx} style={{ padding: "12px 14px", borderRadius: "14px", background: dashTone("green").bg, border: `1px solid ${dashTone("green").edge}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: 850, color: DASH.green }}>{reply.sender || "Admin"}</span>
                                      <span style={{ fontSize: "11px", fontWeight: 650, color: DASH.inkFaint }}>{reply.time}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "13px", color: "rgba(var(--eco-c19-rgb), 0.78)", lineHeight: 1.55 }}>{reply.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingTop: "11px", borderTop: `1px solid ${DASH.line}`, flexWrap: "wrap", fontSize: "12px", fontWeight: 650, color: DASH.inkFaint }}>
                              <span>Attachment: {ticket.attachmentName}</span>
                              {ticket.assignee && <span>Assigned to: {ticket.assignee}</span>}
                              <span style={{ marginLeft: "auto" }}>Last update: {ticket.lastUpdate}</span>
                            </div>
                          </div>
                          );
                        })
                      ) : (
                        <EmptyState
                          icon={<Headset size={24} strokeWidth={2.2} />}
                          title="No support tickets yet"
                          body="Create a ticket for product help, technical issues, billing, bugs, or feature requests."
                          action={
                            <button
                              type="button"
                              onClick={() => setShowSupportTicketModal(true)}
                              style={dashToneBtn("green")}
                            >
                              Submit your first ticket
                            </button>
                          }
                        />
                      )}
                    </div>
                  </div>
                )}

                {settingsTab === "settings" && (
                  <div className="w-full h-full flex-1" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <SectionHead
                      isMobile={isMobile}
                      title="Account Settings"
                      subtitle="How we reach you, and the controls for your account."
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "14px", paddingRight: "8px" }}>
                      {/* Everything here is the admin's copy of the account, kept
                          in step with Admin Portal → Users. */}
                      {myMember && (
                        <Panel
                          title="Account"
                          subtitle={`Maintained with the ${adminSettings.platformName || "EcoEquity"} team — changes they make appear here.`}
                          right={<Pill tone={myMember.status === "Suspended" ? "rose" : myMember.status === "Online" ? "green" : "slate"}>{myMember.status}</Pill>}
                        >
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
                            <Field label="Member ID" value={myMember.id} />
                            <Field label="Account Type" value={myMember.role} />
                            <Field label="Registered Phone" value={myMember.phone || "Not set"} />
                            <Field label="EcoPoints Balance" value={`${Number(myMember.ecoPoints || 0).toLocaleString()} pts`} tone="green" />
                            <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                              <Field label="Delivery Address" value={myMember.address || "Not set"} />
                            </div>
                          </div>
                        </Panel>
                      )}

                      <Panel
                        title="Notifications"
                        subtitle={`Which channels support may reach you on. Shared with the ${adminSettings.platformName || "EcoEquity"} team.`}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <Toggle
                            checked={notificationSettings.email}
                            onChange={() => handleNotificationChange('email')}
                            label="Email Notifications"
                            hint="Order updates, ticket replies and announcements."
                          />
                          <div style={{ height: "1px", background: DASH.line }} />
                          <Toggle
                            checked={notificationSettings.sms}
                            onChange={() => handleNotificationChange('sms')}
                            label="SMS Updates"
                            hint="Delivery alerts sent to your registered phone."
                          />
                        </div>
                      </Panel>

                      {/* The same picker the admin uses, but saved to this
                          browser only — it never changes the site-wide brand. */}
                      <Panel
                        title="Appearance"
                        subtitle="Pick the colours you want to see. Leave them alone to follow the site default."
                        right={
                          hasCustomTheme
                            ? <Pill tone="green">Custom</Pill>
                            : <Pill tone="slate">Site default</Pill>
                        }
                      >
                        <ColorThemePicker
                          primary={userTheme.primary || adminSettings.accentColor || DEFAULT_PRIMARY}
                          secondary={userTheme.secondary || adminSettings.secondaryColor || DEFAULT_SECONDARY}
                          button={userTheme.button || adminSettings.buttonColor || ""}
                          onChangePrimary={(v) => setUserTheme((prev) => ({ ...prev, primary: v }))}
                          onChangeSecondary={(v) => setUserTheme((prev) => ({ ...prev, secondary: v }))}
                          onChangeButton={(v) => setUserTheme((prev) => ({ ...prev, button: v }))}
                          previewTitle={adminSettings.platformName || "EcoEquity"}
                          previewNote="Applies straight away and only on this device."
                          footer={
                            <div>
                              <button
                                onClick={() => setUserTheme({ primary: "", secondary: "", button: "" })}
                                disabled={!hasCustomTheme}
                                style={{ ...dashGhostBtn, opacity: hasCustomTheme ? 1 : 0.5, cursor: hasCustomTheme ? "pointer" : "default" }}
                              >
                                Reset to site default
                              </button>
                            </div>
                          }
                        />
                      </Panel>

                      <Panel title="Security" subtitle="Protect your account or close it for good.">
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => setChangePasswordModal({ current: "", password: "", confirm: "", status: "idle", error: null })}
                            style={{ ...dashGhostBtn, display: "flex", alignItems: "center", gap: "8px" }}
                          >
                            <KeyRound size={14} /> Change Password
                          </button>
                          <button
                            onClick={() => { if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) window.alert("Your account deactivation request has been submitted."); }}
                            style={{ ...dashToneBtn("rose"), display: "flex", alignItems: "center", gap: "8px" }}
                          >
                            <ShieldOff size={14} /> Deactivate Account
                          </button>
                        </div>
                      </Panel>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* SECTION 9 — SUCCESS MODAL */}
        {showRewardSuccessModal && (
          <div style={modalOverlay(MODAL_LAYER.base)}>
            <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", padding: "40px", borderRadius: "24px", textAlign: "center", maxWidth: "400px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div style={{ marginBottom: "16px" }}><PartyPopper size={56} color="var(--eco-c9)" /></div>
              <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 800, color: "#000" }}>Reward Successfully Redeemed!</h2>
              <p style={{ margin: "0 0 32px", fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>Your EcoPoints have been deducted and your reward is now active.</p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { setShowRewardSuccessModal(false); setShowSettingsModal(false); setActiveNav("Shop All Products"); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Continue Shopping</button>
                <button 
                  onClick={() => setShowRewardSuccessModal(false)} 
                  style={{ flex: 1, padding: "12px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "var(--eco-c19)", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" }}
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
                <FaExclamationTriangle size={24} style={{ color: "var(--eco-c13)" }} />
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
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(var(--eco-c9-rgb), 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--eco-c9-rgb), 0.3)'; }}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {showRiderChat && (
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 4000, width: "320px", background: "#fff", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid rgba(var(--eco-c7-rgb), 0.3)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "scaleUp 0.3s ease" }}>
             <div style={{ background: "linear-gradient(135deg, var(--eco-c5), var(--eco-c6))", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--eco-c15)" }}>
               <div style={{ fontWeight: 800, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                 <span style={{ fontSize: "18px" }}><Bike size={18} color="var(--eco-c9)" /></span> Juan Perez
               </div>
               <button onClick={() => setShowRiderChat(false)} style={{ background: "rgba(255,255,255,0.3)", border: "none", color: "var(--eco-c15)", cursor: "pointer", fontSize: "16px", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>&times;</button>
             </div>
             <div className="custom-scrollbar" style={{ height: "240px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--eco-c0)" }}>
               {riderChatMessages.map((msg, i) => (
                 <div key={i} style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", background: msg.sender === "user" ? "var(--eco-c7)" : "#fff", color: msg.sender === "user" ? "#fff" : "#0f172a", padding: "10px 14px", borderRadius: "14px", borderBottomRightRadius: msg.sender === "user" ? "4px" : "14px", borderBottomLeftRadius: msg.sender === "rider" ? "4px" : "14px", fontSize: "13px", maxWidth: "85%", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: msg.sender === "rider" ? "1px solid rgba(var(--eco-c7-rgb), 0.15)" : "none", lineHeight: 1.4 }}>
                   {msg.text}
                 </div>
               ))}
             </div>
             <div style={{ padding: "12px", background: "#fff", borderTop: "1px solid rgba(var(--eco-c7-rgb), 0.1)", display: "flex", gap: "8px" }}>
               <input value={riderChatInput} onChange={e => setRiderChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendRiderMessage()} placeholder="Type your message..." style={{ flex: 1, padding: "10px 14px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", outline: "none", fontSize: "13px", background: "#f8fafc", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--eco-c6)"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"} />
               <button onClick={handleSendRiderMessage} style={{ background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c7))", color: "#fff", border: "none", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s ease", boxShadow: "0 2px 8px rgba(var(--eco-c7-rgb), 0.3)", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "-2px" }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
               </button>
             </div>
          </div>
        )}

        {showAIChat && (
          <AIChatInterface
            key={aiChatSeed ? aiChatSeed.id : "ai-chat"}
            onClose={() => { setShowAIChat(false); setAIChatSeed(null); }}
            isMobile={isMobile}
            initialBot={aiChatSeed?.bot || "general"}
            seedMessage={aiChatSeed?.message || null}
            plantDiseases={plantDiseases}
            onScanComplete={handleNewPlantScan}
            loggedInUser={loggedInUser}
          />
        )}

        <SiteFeedbackWidget
          isOpen={showFeedbackWidget}
          onClose={() => setShowFeedbackWidget(false)}
          isMobile={isMobile}
          currentPage={activeNav}
          userName={loggedInUser}
          onSubmit={handleSiteFeedbackSubmit}
        />

        <SupportTicketModal
          isOpen={showSupportTicketModal}
          onClose={() => setShowSupportTicketModal(false)}
          loggedInUser={loggedInUser}
          userEmail={loggedInEmail || email}
          onSubmit={handleSupportTicketSubmit}
          isMobile={isMobile}
        />

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

        {/* Bottom Mobile Glass Container.
           Off in the Admin Portal: it floats over the console's own content
           and duplicates navigation the portal's drawer already carries. The
           portal's "View site" button is the way back out. */}
        {isMobile && !isAuthPage && !isAdminPortal && (
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
                <button onClick={() => openAIChat()} style={{ ...styles.bottomNavBtnCenter, transform: "none", position: "relative", overflow: "hidden" }}>
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
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", overflowY: "auto", display: "flex", flexDirection: "column", animation: "scaleUp 0.3s ease" }}>
            <button onClick={() => handleNavChange("Home")} aria-label="Close Seasonal Harvest" style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ padding: "40px 0" }}>
              <SeasonalHarvestPage setActiveNav={setActiveNav} onNotify={handleNotify} harvests={harvests} />
            </div>
          </div>
        )}

        {/* Mobile About Us Modal */}
        {activeNav === "About Us" && isMobile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", overflowY: "auto", display: "flex", flexDirection: "column", animation: "scaleUp 0.3s ease" }}>
            <button onClick={() => handleNavChange("Home")} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ padding: "40px 0" }}>
              <AboutUs />
            </div>
          </div>
        )}

        {/* ── Post-signup "Check your email" modal ─────────────────────── */}
        {signupModal && (
          <div style={modalOverlay(MODAL_LAYER.top)}>
            <div style={{ width: "100%", maxWidth: "420px", background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(var(--eco-c0-rgb), 0.96))", borderRadius: "24px", padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", textAlign: "center", animation: "scaleUp 0.3s ease" }}>
              <div style={{ width: "72px", height: "72px", margin: "0 auto 18px", borderRadius: "50%", background: "rgba(var(--eco-c7-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={34} color="var(--eco-c9)" />
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Account created!</h2>
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>
                We sent a confirmation link to
              </p>
              <p style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: 600, color: "var(--eco-c13)", wordBreak: "break-all" }}>{signupModal.email}</p>
              <p style={{ margin: "0 0 22px", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.5 }}>
                Click the link in that email to confirm your account, then log in. Don't forget to check your spam folder.
              </p>
              {emailInboxUrl(signupModal.email) ? (
                <a href={emailInboxUrl(signupModal.email)} target="_blank" rel="noopener noreferrer"
                  style={{ ...styles.primaryBtn, display: "block", width: "100%", padding: "14px", fontSize: "15px", textDecoration: "none", boxSizing: "border-box", marginBottom: "10px" }}>
                  Open Email
                </a>
              ) : null}
              <button
                onClick={handleResendConfirmation}
                disabled={resendState !== "idle"}
                style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 600, borderRadius: "12px", border: "1px solid rgba(var(--eco-c9-rgb), 0.4)", background: "transparent", color: resendState === "sent" ? "var(--eco-c13)" : "var(--eco-c13)", cursor: resendState === "idle" ? "pointer" : "default", marginBottom: "10px" }}>
                {resendState === "sending" ? "Sending…" : resendState === "sent" ? "✓ Email re-sent" : "Resend email"}
              </button>
              <button
                onClick={() => { setSignupModal(null); handleNavChange("Login"); }}
                style={{ width: "100%", padding: "10px", fontSize: "13px", fontWeight: 600, border: "none", background: "transparent", color: "rgba(0,0,0,0.55)", cursor: "pointer" }}>
                Back to login
              </button>
            </div>
          </div>
        )}

        {/* ── Post-confirmation welcome modal (returned from email link) ─── */}
        {welcomeModal && (
          <div style={modalOverlay(MODAL_LAYER.top)}>
            <div style={{ width: "100%", maxWidth: "420px", background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(var(--eco-c0-rgb), 0.96))", borderRadius: "24px", padding: "34px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", textAlign: "center", animation: "scaleUp 0.3s ease" }}>
              <div style={{ width: "76px", height: "76px", margin: "0 auto 18px", borderRadius: "50%", background: "rgba(var(--eco-c7-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={40} color="var(--eco-c9)" />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "22px", fontWeight: 700, color: "var(--eco-c13)" }}>Email confirmed! 🎉</h2>
              <p style={{ margin: "0 0 24px", fontSize: "14px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>
                Welcome to EcoEquity{loggedInUser ? `, ${loggedInUser}` : ""}! Your account is verified and ready to go.
              </p>
              <button
                onClick={() => { setWelcomeModal(false); handleNavChange(isLoggedIn ? "Home" : "Login"); }}
                style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px" }}>
                {isLoggedIn ? "Start exploring" : "Continue to login"}
              </button>
            </div>
          </div>
        )}

        {/* ── Password reset, step 1: where do we send the link? ─────────── */}
        {forgotModal && (
          <div style={modalOverlay(MODAL_LAYER.top)}>
            <div style={authModalCard}>
              <div style={authModalIconWrap}>
                {forgotModal.status === "sent" ? <Mail size={34} color="var(--eco-c9)" /> : <KeyRound size={32} color="var(--eco-c9)" />}
              </div>

              {forgotModal.status === "sent" ? (
                <>
                  <h2 style={{ margin: "0 0 8px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Check your email</h2>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>
                    If there's an account for
                  </p>
                  <p style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: 600, color: "var(--eco-c13)", wordBreak: "break-all" }}>{forgotModal.email}</p>
                  <p style={{ margin: "0 0 22px", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.5 }}>
                    a reset link is on its way. Open it on this device to choose a new password — links expire after about an hour, so check your spam folder if it doesn't arrive.
                  </p>
                  {emailInboxUrl(forgotModal.email) ? (
                    <a href={emailInboxUrl(forgotModal.email)} target="_blank" rel="noopener noreferrer"
                      style={{ ...styles.primaryBtn, display: "block", width: "100%", padding: "14px", fontSize: "15px", textDecoration: "none", boxSizing: "border-box", marginBottom: "10px" }}>
                      Open Email
                    </a>
                  ) : null}
                  <button
                    onClick={() => setForgotModal({ ...forgotModal, status: "idle", error: null })}
                    style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 600, borderRadius: "12px", border: "1px solid rgba(var(--eco-c9-rgb), 0.4)", background: "transparent", color: "var(--eco-c13)", cursor: "pointer", marginBottom: "10px", fontFamily: "inherit" }}>
                    Use a different email
                  </button>
                  <button onClick={() => setForgotModal(null)} style={authModalGhostBtn}>Back to login</button>
                </>
              ) : (
                <>
                  <h2 style={{ margin: "0 0 8px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Reset your password</h2>
                  <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                    Enter the email you signed up with and we'll send you a link to set a new password.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                    <input
                      type="email"
                      autoFocus
                      value={forgotModal.email}
                      onChange={(e) => setForgotModal({ ...forgotModal, email: e.target.value, error: null })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendResetLink(); }}
                      placeholder="you@example.com"
                      style={{ ...authModalInput, border: `1px solid ${forgotModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    {forgotModal.error && <span style={authModalError}>{forgotModal.error}</span>}
                  </div>
                  <button
                    onClick={handleSendResetLink}
                    disabled={forgotModal.status === "sending"}
                    style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px", marginBottom: "10px", opacity: forgotModal.status === "sending" ? 0.7 : 1 }}>
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>{forgotModal.status === "sending" ? "Sending…" : "Send reset link"}</span>
                  </button>
                  <button onClick={() => setForgotModal(null)} style={authModalGhostBtn}>Back to login</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Password reset, step 2: returned from the emailed link ─────── */}
        {recoveryModal && (
          <div style={modalOverlay(MODAL_LAYER.top)}>
            <div style={authModalCard}>
              <div style={authModalIconWrap}>
                {recoveryModal.status === "done" ? <CheckCircle size={38} color="var(--eco-c9)" /> : <KeyRound size={32} color="var(--eco-c9)" />}
              </div>

              {recoveryModal.status === "done" ? (
                <>
                  <h2 style={{ margin: "0 0 10px", fontSize: "22px", fontWeight: 700, color: "var(--eco-c13)" }}>Password updated 🎉</h2>
                  <p style={{ margin: "0 0 24px", fontSize: "14px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>
                    You're signed in with your new password. Use it the next time you log in.
                  </p>
                  <button
                    onClick={() => { setRecoveryModal(null); setPassword(""); handleNavChange(isLoggedIn ? "Home" : "Login"); }}
                    style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px" }}>
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>{isLoggedIn ? "Start exploring" : "Continue to login"}</span>
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ margin: "0 0 8px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Set a new password</h2>
                  <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                    Choose a password of at least {PASSWORD_MIN_LENGTH} characters. You'll stay signed in on this device.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                    <input
                      type="password"
                      autoFocus
                      value={recoveryModal.password}
                      onChange={(e) => setRecoveryModal({ ...recoveryModal, password: e.target.value, error: null })}
                      placeholder="New password"
                      style={{ ...authModalInput, border: `1px solid ${recoveryModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    <input
                      type="password"
                      value={recoveryModal.confirm}
                      onChange={(e) => setRecoveryModal({ ...recoveryModal, confirm: e.target.value, error: null })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSetNewPassword(); }}
                      placeholder="Confirm new password"
                      style={{ ...authModalInput, border: `1px solid ${recoveryModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    {recoveryModal.error && <span style={authModalError}>{recoveryModal.error}</span>}
                  </div>
                  <button
                    onClick={handleSetNewPassword}
                    disabled={recoveryModal.status === "saving"}
                    style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px", marginBottom: "10px", opacity: recoveryModal.status === "saving" ? 0.7 : 1 }}>
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>{recoveryModal.status === "saving" ? "Saving…" : "Save new password"}</span>
                  </button>
                  <button onClick={() => setRecoveryModal(null)} style={authModalGhostBtn}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Change password from Settings → Security ───────────────────── */}
        {changePasswordModal && (
          <div style={modalOverlay(MODAL_LAYER.nested)}>
            <div style={authModalCard}>
              <div style={authModalIconWrap}>
                {changePasswordModal.status === "done" ? <CheckCircle size={38} color="var(--eco-c9)" /> : <KeyRound size={32} color="var(--eco-c9)" />}
              </div>

              {changePasswordModal.status === "done" ? (
                <>
                  <h2 style={{ margin: "0 0 10px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Password changed</h2>
                  <p style={{ margin: "0 0 24px", fontSize: "14px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>
                    Your new password is active. Use it the next time you sign in.
                  </p>
                  <button
                    onClick={() => setChangePasswordModal(null)}
                    style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px" }}>
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>Done</span>
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ margin: "0 0 8px", fontSize: "21px", fontWeight: 700, color: "var(--eco-c13)" }}>Change password</h2>
                  <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                    Confirm your current password, then pick a new one of at least {PASSWORD_MIN_LENGTH} characters.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                    <input
                      type="password"
                      autoFocus
                      value={changePasswordModal.current}
                      onChange={(e) => setChangePasswordModal({ ...changePasswordModal, current: e.target.value, error: null })}
                      placeholder="Current password"
                      style={{ ...authModalInput, border: `1px solid ${changePasswordModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    <input
                      type="password"
                      value={changePasswordModal.password}
                      onChange={(e) => setChangePasswordModal({ ...changePasswordModal, password: e.target.value, error: null })}
                      placeholder="New password"
                      style={{ ...authModalInput, border: `1px solid ${changePasswordModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    <input
                      type="password"
                      value={changePasswordModal.confirm}
                      onChange={(e) => setChangePasswordModal({ ...changePasswordModal, confirm: e.target.value, error: null })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                      placeholder="Confirm new password"
                      style={{ ...authModalInput, border: `1px solid ${changePasswordModal.error ? "var(--eco-c9)" : "rgba(var(--eco-c9-rgb), 0.28)"}` }}
                    />
                    {changePasswordModal.error && <span style={authModalError}>{changePasswordModal.error}</span>}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={changePasswordModal.status === "saving"}
                    style={{ ...styles.primaryBtn, width: "100%", padding: "14px", fontSize: "15px", marginBottom: "10px", opacity: changePasswordModal.status === "saving" ? 0.7 : 1 }}>
                    <span aria-hidden="true" style={styles.primaryInnerBlur} />
                    <span style={styles.glassContentLayer}>{changePasswordModal.status === "saving" ? "Saving…" : "Update password"}</span>
                  </button>
                  <button onClick={() => setChangePasswordModal(null)} style={authModalGhostBtn}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Every inset between the window and the Home scroller's content, as
   constants: the page's frame around the app card, the card's own max width,
   and the shell's padding. The Home scroller cancels all of them out with
   negative margins so its footer can bleed to the window edges — if any of
   these drift apart from the styles below, the footer stops lining up. */
const PAGE_PAD = "20px";
const CARD_MAX = "1400px";
const SHELL_GUTTER = "clamp(20px, 4vw, 52px)";
const SHELL_PAD_Y = "28px";

/* Distance from the window's left edge to the shell's own left edge: the page
   frame, or half the slack once the card stops growing at CARD_MAX. */
const CARD_OFFSET = `max(${PAGE_PAD}, (100vw - ${CARD_MAX}) / 2)`;

/* The reading measure inside the Home scroller. The scroller itself is now the
   full width of the window, so the hero and the landing sections hold the
   width the card used to give them: 1240px, or the card's inner width once
   the window is narrower than that. Shared with HomeHero and LandingSections
   — keep the three in step. */
const HOME_MEASURE = `min(1240px, calc(min(100vw - 2 * ${PAGE_PAD}, ${CARD_MAX}) - 2 * ${SHELL_GUTTER}))`;

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

  /* ── Admin Portal full-bleed overrides ──
     Three layers frame every other view — the page's 20px inset, the shell's
     1400px cap, and the navbar band. The console drops all three and runs
     edge to edge; see `isAdminPortal` in the component. */
  pageAdminPortal: {
    padding: 0,
    alignItems: "stretch",
    justifyContent: "stretch",
    height: "100dvh",
    minHeight: "100dvh",
  },

  shellAdminPortal: {
    maxWidth: "100%",
    width: "100%",
    height: "100dvh",
    margin: 0,
    padding: 0,
    borderRadius: 0,
    // The console's main column is the scroller; the shell must not become a
    // second one around it (which on mobile would double-scroll the drawer).
    overflow: "hidden",
  },

  pageContentAdminPortal: {
    flex: 1,
    minHeight: 0,
    height: "100%",
    margin: 0,
    borderRadius: 0,
    overflow: "hidden",
  },


  bgScrim: {
    position: "absolute",
    inset: 0,
    // Soft, restrained mesh — two gentle corner glows over a clean wash.
    background:
      "radial-gradient(55% 50% at 10% 6%, rgba(var(--eco-c4-rgb), 0.32) 0%, transparent 60%), " +
      "radial-gradient(55% 50% at 92% 96%, rgba(var(--eco-c4-rgb), 0.26) 0%, transparent 62%), " +
      "linear-gradient(150deg, #ffffff 0%, var(--eco-c0) 100%)",
    pointerEvents: "none",
    // zIndex is set inline in the component to ensure it's above the video
    // but below the shell content.
  },

  // The wash on its own, with the two corner glows dropped — used by the auth
  // screens, which float a single framed panel on an otherwise empty ground.
  bgScrimFlat: "linear-gradient(150deg, #ffffff 0%, var(--eco-c0) 100%)",

  bgScrimGrain: {
    position: "absolute",
    inset: 0,
    // Subtle vignette only — adds quiet depth without visual noise.
    background:
      "radial-gradient(125% 125% at 50% 45%, transparent 68%, rgba(var(--eco-c19-rgb), 0.04) 100%)",
    pointerEvents: "none",
  },

  shell: {
    background: "transparent",
    border: "none",
    boxShadow: "none",
    maxWidth: "1400px",
    width: "100%",
    height: "calc(100vh - 40px)",
    margin: "0 auto",
    borderRadius: "30px",
    padding: `${SHELL_PAD_Y} ${SHELL_GUTTER}`,
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  /* The mobile shell is the app's scroll container (the document itself is
     locked at ≤768px). It runs edge to edge so the gutter is owned by one
     token instead of being split between the shell inset and every card's
     own margin, and it reserves room at the bottom for the floating tab
     bar plus the home indicator. */
  shellMobile: {
    height: "100dvh",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    margin: 0,
    borderRadius: 0,
    paddingTop: "calc(var(--safe-top) + 6px)",
    paddingLeft: "calc(var(--mobile-gutter) + var(--safe-left))",
    paddingRight: "calc(var(--mobile-gutter) + var(--safe-right))",
    paddingBottom: "calc(var(--bottom-nav-space) + 20px)",
    overflowY: "auto",
    overflowX: "hidden",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "10px 16px 10px 14px",
    borderRadius: "999px",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    marginBottom: "0",
    position: "relative",
    zIndex: 50,
  },

  /* Sticky header. It needs its own backdrop: transparent, the page
     content scrolled up underneath it and stayed visible behind the logo.
     The negative side margins + matching padding let the blur run to the
     screen edges while the row itself stays on the content grid. */
  navbarMobile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(6px, 2vw, 10px)",
    borderRadius: 0,
    marginLeft: "calc((var(--mobile-gutter) + var(--safe-left)) * -1)",
    marginRight: "calc((var(--mobile-gutter) + var(--safe-right)) * -1)",
    marginBottom: "6px",
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "calc(var(--mobile-gutter) + var(--safe-left))",
    paddingRight: "calc(var(--mobile-gutter) + var(--safe-right))",
    /* wrap so the inline links row can take its own second line under the
       logo; the logo row itself still has only one item beside the fixed
       action cluster, so nothing else moves. */
    flexWrap: "wrap",
    width: "auto",
    maxWidth: "none",
    boxSizing: "border-box",
    position: "sticky",
    top: "calc((var(--safe-top) + 6px) * -1)",
    background: "rgba(246, 253, 249, 0.82)",
    backdropFilter: "blur(18px) saturate(170%)",
    WebkitBackdropFilter: "blur(18px) saturate(170%)",
    borderBottom: "1px solid rgba(var(--eco-c19-rgb), 0.06)",
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
    color: "var(--eco-c14)",
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

  /* Every top-level block on the mobile home stacks to the same width and
     rhythm. The shell already owns the side gutter, so these fill it
     rather than re-deriving their own inset from 100vw. */
  mobileCard: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    margin: "0 0 16px",
    boxSizing: "border-box",
  },

  /* Shortcut tile: a tappable card with the icon over its label. Sized so
     four fit across a 320px screen while each stays above the 44px touch
     minimum. */
  mobileTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "6px",
    minWidth: 0,
    minHeight: "72px",
    padding: "10px 2px 8px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 4px 12px rgba(var(--eco-c19-rgb), 0.05)",
    color: "var(--eco-c19)",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease",
  },

  /* auto-fit rather than a fixed 4 columns: the clamped track keeps four
     across on a 320px phone and lets a landscape phone lay out more
     instead of stretching four tiles across 844px. */
  mobileTileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(58px, 18vw, 96px), 1fr))",
    gap: "8px",
    width: "100%",
  },

  mobileTileIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "26px",
    filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.12))",
  },

  mobileTileLabel: {
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.1px",
    color: "rgba(var(--eco-c19-rgb), 0.82)",
    textAlign: "center",
    /* Long labels shrink the glyph rather than overflowing the tile. */
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  mobileWelcomeCard: {
    width: "100%",
    minHeight: "100px",
    padding: "14px 13px 14px 18px",
    borderRadius: "18px",
    background: "linear-gradient(-45deg, rgba(var(--eco-c5-rgb), 0.5), rgba(var(--eco-c5-rgb), 0.5), rgba(var(--eco-c4-rgb), 0.5), rgba(167,243,208,0.5))",
    backgroundSize: "300% 300%",
    animation: "mobileWelcomeGradient 8s ease infinite",
    border: "1px solid rgba(255,255,255,0.42)",
    boxShadow: "0 12px 28px rgba(var(--eco-c7-rgb), 0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
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
    color: "var(--eco-c19)",
    fontSize: "clamp(12px, 3.5vw, 14px)",
    fontWeight: 800,
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /* Sized to sit beside the greeting rather than dominate it — a 150px
     circle left the name and tagline about half the card width on a
     360px phone. */
  mobileWelcomeAvatar: {
    width: "clamp(52px, 15vw, 64px)",
    height: "clamp(52px, 15vw, 64px)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(255,255,255,0.7)",
    color: "var(--eco-c13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    fontSize: "clamp(22px, 6.5vw, 27px)",
    fontWeight: 800,
    lineHeight: 1,
    boxShadow: "0 8px 24px rgba(var(--eco-c19-rgb), 0.12)",
  },

  navLinks: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  /* The inline navbar row. marginRight: auto parks it beside the logo instead
     of letting the navbar's space-between fling it to the right edge, where it
     would run under the fixed action cluster. */
  navInlineLinks: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "clamp(14px, 3vw, 38px)",
    marginRight: "auto",
  },

  /* On phones the logo plus the fixed action cluster already fill the row, so
     the links take a full-width second line and scroll sideways if they run
     past the screen. The scrollbar is hidden via .nav-inline-scroll. */
  navInlineLinksMobile: {
    width: "100%",
    marginLeft: 0,
    marginRight: 0,
    marginTop: "8px",
    paddingBottom: "2px",
    overflowX: "auto",
    flexWrap: "nowrap",
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

  /* Floating tab bar. It is pinned to the viewport (not the scroll
     container), so it sits above the home indicator via the safe-area
     inset and spans the same gutter as the content behind it. The shell
     reserves --bottom-nav-space at its foot so nothing hides under it. */
  bottomGlassContainerMobile: {
    position: "fixed",
    bottom: "calc(var(--bottom-nav-lift) + var(--safe-bottom))",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - (var(--mobile-gutter) * 2) - var(--safe-left) - var(--safe-right))",
    maxWidth: "420px",
    height: "var(--bottom-nav-height)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "clamp(18px, 5vw, 24px)",
    zIndex: 2000,
    boxSizing: "border-box",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },
  bottomNavBtn: {
    background: "transparent",
    border: "none",
    padding: "8px 4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--eco-c19)",
    flex: 1,
    /* Fills the bar's height so the tap area matches the visual slot
       rather than just the glyph. */
    minWidth: 0,
    alignSelf: "stretch",
    WebkitTapHighlightColor: "transparent",
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
  /* The navbar's actions — dark mode, notifications, account and the menu
     — float in their own cluster at the top-right of the viewport, the
     mirror image of `supportActionsCluster` below. Fixed, so the shell
     scrolls under it and the navbar row is left holding only the logo.
     The offsets are CSS tokens because the open menu panel (index.css)
     hangs off this cluster and has to share its geometry. */
  navActionsCluster: {
    position: "fixed",
    top: "var(--nav-cluster-top)",
    right: "var(--nav-cluster-right)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "var(--nav-cluster-gap)",
    zIndex: 2100,
  },
  /* Same glass circle as `aiChatFab`. The gradient is authored here rather
     than in a class on purpose: dark mode un-inverts brand buttons by
     matching this exact rgba literal in the style attribute, and that also
     keeps the white icons inside from being flattened to black. */
  navFab: {
    position: "relative",
    width: "var(--nav-fab-size)",
    height: "var(--nav-fab-size)",
    flexShrink: 0,
    padding: 0,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.45)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.96), rgba(var(--eco-c5-rgb), 0.96))",
    color: "var(--eco-c19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(var(--eco-c19-rgb), 0.22), inset 0 1px 0 rgba(255,255,255,0.52)",
    backdropFilter: "blur(20px) saturate(170%)",
    WebkitBackdropFilter: "blur(20px) saturate(170%)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  /* Open dropdown: a ring, since the button has no background left to tint */
  navFabActive: {
    boxShadow: "0 0 0 2px rgba(var(--eco-c11-rgb), 0.6), 0 18px 40px rgba(var(--eco-c19-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.52)",
  },

  /* Bare icon action — dark mode and notifications, which the user asked to
     show as icons only. Same 48px hit area as the FABs so the cluster stays
     aligned, but no disc, no border and no shadow behind the glyph. */
  navIconBtn: {
    position: "relative",
    width: "var(--nav-fab-size)",
    height: "var(--nav-fab-size)",
    flexShrink: 0,
    padding: 0,
    border: "none",
    background: "transparent",
    color: "var(--eco-c15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.18s ease, color 0.18s ease",
  },

  /* Floating cluster pinned to the bottom-right of the viewport, out of the
     shell's flow so it never pushes page content down. Laid out as a single
     horizontal row, one 48px strip tall. */
  supportActionsCluster: {
    position: "fixed",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    right: "28px",
    bottom: "48px",
    zIndex: 2100,
  },
  /* Same row, but tucked inside the phone gutter and lifted clear of the
     bottom tab bar. Reversed so the collapse toggle stays on the right edge
     and the buttons unfold leftwards from it. */
  supportActionsClusterMobile: {
    flexDirection: "row-reverse",
    right: "calc(var(--mobile-gutter) + var(--safe-right))",
    bottom: "calc(var(--bottom-nav-space) + 14px)",
  },
  aiChatFab: {
    position: "relative",
    width: "48px",
    height: "48px",
    padding: 0,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.45)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.96), rgba(var(--eco-c5-rgb), 0.96))",
    color: "var(--eco-c19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(var(--eco-c19-rgb), 0.22), inset 0 1px 0 rgba(255,255,255,0.52)",
    backdropFilter: "blur(20px) saturate(170%)",
    WebkitBackdropFilter: "blur(20px) saturate(170%)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  aiChatFabMobile: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
  },
  aiChatFabHover: {
    transform: "translateY(-2px) scale(1.06)",
    boxShadow: "0 22px 46px rgba(var(--eco-c19-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.58)",
  },
  supportTicketFab: {
    position: "relative",
    width: "48px",
    height: "48px",
    padding: 0,
    /* Circle, not a pill: in the floating column a wider pill sat out of line
       with the two 48px round FABs above it. */
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.45)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.96), rgba(var(--eco-c5-rgb), 0.96))",
    color: "var(--eco-c19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 850,
    boxShadow: "0 18px 40px rgba(var(--eco-c19-rgb), 0.22), inset 0 1px 0 rgba(255,255,255,0.52)",
    backdropFilter: "blur(20px) saturate(170%)",
    WebkitBackdropFilter: "blur(20px) saturate(170%)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  supportTicketFabMobile: {
    minWidth: "48px",
    width: "48px",
    height: "48px",
    padding: 0,
    borderRadius: "18px",
  },
  supportTicketFabHover: {
    transform: "translateY(-2px) scale(1.03)",
    boxShadow: "0 22px 46px rgba(var(--eco-c19-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.58)",
  },
  supportTicketFabText: {
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  supportTicketBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "999px",
    background: "var(--eco-c9)",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.8)",
    fontSize: "10px",
    fontWeight: 850,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(var(--eco-c9-rgb), 0.28)",
  },
  navDropdownWrapMobile: {
    width: "100%",
    alignItems: "stretch",
  },

  linkBtn: {
    /* The panel gets its icon/label gap from .nav-links-panel in index.css;
       the inline navbar row is outside that scope, so the gap lives here. */
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--eco-c15)",
    padding: "8px 14px",
    /* Plain text labels — no pill, border or shadow. Active and hover read
       through weight and colour alone, so nothing draws a chip around them. */
    borderRadius: "999px",
    background: "transparent",
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
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--eco-c15)",
    fontWeight: 800,
    boxShadow: "none",
  },

  linkBtnHover: {
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--eco-c11)",
    boxShadow: "none",
  },

  pageContent: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    marginTop: "6px",
    borderRadius: "20px",
  },

  /* On phones the shell scrolls, so this region grows to its content
     instead of becoming a second, short scroll box nested inside it.
     Nested scrollers on touch are easy to trap a drag in and made every
     inner page feel like a ~400px window onto the content. */
  pageContentMobile: {
    flex: "0 0 auto",
    flexShrink: 0,
    minHeight: 0,
    overflow: "visible",
    marginTop: "4px",
    borderRadius: 0,
  },

  hero: {
    width: "100%",
    maxWidth: "820px",
    margin: "clamp(20px, 5vh, 50px) auto 0", // Centered horizontally within the content area
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    animation: "fadeInUp 0.85s cubic-bezier(.22,1,.36,1) both",
  },

  /* The shell is the only scroll container on mobile. This block must not
     shrink inside it and must not create a scroller of its own — note that
     `overflow-x: hidden` alone would compute `overflow-y` to `auto`, which
     is what previously trapped the whole home page in a ~400px nested
     scroll region. */
  heroMobile: {
    maxWidth: "100%",
    width: "100%",
    minWidth: 0,
    margin: "14px 0 0",
    padding: "0",
    flex: "0 0 auto",
    flexShrink: 0,
    minHeight: 0,
    overflow: "visible",
  },

  heroRightCard: {
    flex: "0 1 440px",
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
    boxShadow: "0 24px 48px rgba(var(--eco-c7-rgb), 0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
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
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "22px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
  },

  /* Sized off width only. The previous dvh-based clamps shrank this to 8px
     on short viewports (landscape phones, split-screen), which is below
     the legible floor for uppercase tracked-out type. Wrapping is allowed
     so the badge stays inside the gutter at 320px instead of overflowing. */
  badgeMobile: {
    maxWidth: "100%",
    padding: "7px 13px",
    fontSize: "clamp(10.5px, 3vw, 11.5px)",
    letterSpacing: "0.5px",
    lineHeight: 1.25,
    whiteSpace: "normal",
    textAlign: "center",
    marginBottom: "14px",
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
    fontSize: "clamp(24px, 3.2vw, 38px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 0 10px",
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.08,
    letterSpacing: "-0.5px",
    whiteSpace: "pre-line",
    textShadow: "none",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },



  titleMobile: {
    fontSize: "clamp(26px, 7.5vw, 34px)",
    lineHeight: 1.12,
    maxWidth: "100%",
    overflowWrap: "break-word",
    marginBottom: "10px",
  },

  titleAccent: {
    background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c7))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  body: {
    color: "rgba(0,0,0,0.7)",
    marginBottom: "30px",
    fontSize: "clamp(14px, 1.6vw, 17px)",
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: "640px",
    textShadow: "none",
  },

  /* 14px floor with a 1.55 leading — the readable minimum for a paragraph
     of body copy. Width is no longer capped at 320px: the shell gutter
     already sets the measure, and the cap left a ragged column on wider
     phones. */
  bodyMobile: {
    fontSize: "clamp(14px, 3.8vw, 15.5px)",
    lineHeight: 1.55,
    marginBottom: "14px",
    width: "100%",
    maxWidth: "100%",
    padding: 0,
    overflowWrap: "break-word",
  },

  ctaRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: "28px",
  },

  ctaRowMobile: {
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    maxWidth: "100%",
    marginBottom: "18px",
  },

  primaryBtn: { 
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    padding: "13px 30px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    color: "var(--eco-c19)",
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
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
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
    borderColor: "var(--eco-c9)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c7-rgb), 0.2)",
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
    background: "rgba(var(--eco-c7-rgb), 0.12)",
    color: "var(--eco-c13)",
    fontWeight: 700,
  },
  cancelModalOverlay: modalOverlay(MODAL_LAYER.nested),
  orderDetailsCard: { padding: "24px", borderRadius: "20px", background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)", backdropFilter: "blur(20px) saturate(165%)", WebkitBackdropFilter: "blur(20px) saturate(165%)", display: "flex", flexDirection: "column", gap: "16px" },
  cancelConfirmModal: { background: "linear-gradient(145deg, #ffffff, var(--eco-c0))", padding: "32px 24px", borderRadius: "28px", border: "1px solid rgba(var(--eco-c9-rgb), 0.1)", boxShadow: "0 20px 40px rgba(var(--eco-c9-rgb), 0.15)", textAlign: "center", width: "90%", maxWidth: "380px", display: "flex", flexDirection: "column", alignItems: "center", animation: "scaleUp 0.3s ease-out" },
  cancelIconWrap: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", animation: "shakeIcon 0.6s ease-in-out" },
  cancelModalTitle: { margin: "0 0 12px", fontSize: "22px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" },
  cancelModalText: { margin: "0 0 28px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 },
  cancelModalKeepBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" },
  cancelModalConfirmBtn: { flex: 1, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.3)" },
  primaryInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), " +
      "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.36), rgba(var(--eco-c5-rgb), 0.32))",
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
    padding: "0 16px",
    fontSize: "15px",
    /* 48px is the comfortable touch target; the old dvh clamp could
       collapse a primary CTA to 30px on a landscape phone. */
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  chatWithAiBtnWrap: {
    position: "absolute",
    bottom: "28px",
    right: "clamp(20px, 4vw, 52px)",
    zIndex: 10,
  },

  chatWithAiBtnWrapMobile: {
    position: "relative",
    margin: "16px 0 0",
    display: "flex",
    justifyContent: "flex-start",
    width: "fit-content",
  },

  chatWithAiBtnMobile: {
    minHeight: "46px",
    padding: "0 18px",
    fontSize: "14px",
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
    padding: "12px 8px",
    flexDirection: "row",
    gap: "2px",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginTop: "16px",
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
    fontSize: "clamp(15px, 4.2vw, 18px)",
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
    marginTop: "0",
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
    padding: "0 0 6px",
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
    flex: "1 1 0",
    maxWidth: "none",
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
    padding: "10px 8px",
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
      color: "var(--eco-c15)",
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
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.15), rgba(var(--eco-c5-rgb), 0.15))",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 16px rgba(var(--eco-c7-rgb), 0.1), inset 0 2px 4px rgba(255,255,255,0.5)",
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
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.15), rgba(var(--eco-c5-rgb), 0.15))",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 4px 8px rgba(var(--eco-c7-rgb), 0.1), inset 0 1px 2px rgba(255,255,255,0.5)",
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
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.4)",
    color: "var(--eco-c15)",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },
  dropdownItemHover: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))",
    color: "var(--eco-c15)",
    boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)",
  },
  // The login/signup banner now lives in components/AuthNotice.js, which owns
  // its own colours (it has four tones, not two).
};

export default App;
