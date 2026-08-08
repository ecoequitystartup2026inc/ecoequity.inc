import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Check, X, Sparkles, Smartphone } from "lucide-react";
import { MODAL_LAYER, modalOverlay } from "./styles/modal";
import { askAI, scanPlantImage, isLiveAIAvailable } from "./data/aiChat";
import {
  isLiveChatAvailable, openLiveChat, sendLiveMessage,
  fetchTicketMessages, subscribeToTicket,
  fetchMyLiveChat, setLiveStatus, ackHandover,
} from "./data/liveChat";
import { startSubscription } from "./data/checkout";

// ============================================================================
// What the member is told about their live conversation.
//
// Two separate facts, deliberately not merged into one line: whether an AGENT
// is at their desk, and where the CONVERSATION is in its lifecycle. A member
// whose agent has gone offline mid-chat is in a different situation from one
// whose request nobody has picked up, and a single blended status word — the
// tempting simplification — cannot tell them apart.
// ============================================================================

/**
 * The agent's presence, as a dot and a word.
 *
 * `online` is the heartbeat, `status` is what they last clicked. An agent who
 * shut their laptop still claims 'available', so presence is the AND of the
 * two — see my_live_chat() in supabase/live-agent-flow.sql. Claiming somebody
 * is online when they are not is the one lie this panel must never tell.
 */
function agentPresence(info) {
  if (!info?.agentName) return { label: "Not assigned yet", dot: "rgba(0,0,0,0.25)" };
  if (!info.agentOnline) return { label: "Offline", dot: "rgba(0,0,0,0.25)" };
  switch (info.agentStatus) {
    case "busy":  return { label: "Busy", dot: "#f59e0b" };
    case "away":  return { label: "Away", dot: "#f59e0b" };
    default:      return { label: "Online", dot: "#22c55e" };
  }
}

/**
 * The conversation's own state, in a sentence the member can act on.
 *
 * Every one of these says what happens next, because a status word on its own
 * ("Pending") answers a question nobody asked. What they want to know is
 * whether anyone is coming.
 */
function conversationStatusLine(info) {
  if (!info) return null;
  const agent = info.agentName || "an agent";
  switch (info.liveStatus) {
    case "pending":
      return { tone: "wait", text: "Your request is waiting for a human agent. We'll connect you as soon as someone is free." };
    case "accepted":
      return { tone: "good", text: `You're now connected with ${agent}. You can continue your conversation below.` };
    case "active":
      return { tone: "good", text: `You're chatting with ${agent}.` };
    case "reassigned":
      return { tone: "info", text: `Your conversation has been reassigned to ${agent}, who will continue assisting you.` };
    case "closed":
      return { tone: "muted", text: "This conversation has been closed. You can reopen it any time if you need more help." };
    case "rejected":
      return { tone: "bad", text: "We couldn't connect you with a human agent this time. You can send the request again whenever you're ready." };
    default:
      return null;
  }
}

const STATUS_TONES = {
  good:  { bg: "rgba(34,197,94,0.12)",  fg: "#15803d" },
  wait:  { bg: "rgba(245,158,11,0.14)", fg: "#92400e" },
  info:  { bg: "rgba(2,132,199,0.12)",  fg: "#0369a1" },
  muted: { bg: "rgba(0,0,0,0.06)",      fg: "rgba(0,0,0,0.55)" },
  bad:   { bg: "rgba(220,38,38,0.1)",   fg: "#b91c1c" },
};

// Core keywords for auto-correction logic
const CORE_KEYWORDS = [
  "human", "support", "agent", "connect", "person", "expert", "specialist",
  "hello", "doctor", "thanks", "thank", "goodbye", "help", "diagnose",
  "problem", "sick", "disease", "emergency", "dying", "urgent", "frustrated",
  "payment", "account", "billing", "technical", "error", "bug", "real-time",
  "detection", "symptoms", "yellow", "leaves", "wilting", "spots", "black",
  "curling", "stunted", "pests", "bugs", "insects", "fertilizer", "nutrients",
  "watering", "soil", "crop", "recommendations", "weather", "climate",
  "rain", "drought", "organic", "farming", "sustainable", "maintenance",
  "plant", "garden", "green", "agriculture", "healthy", "growth",
  "doesn't", "sentence", "that", "what", "how", "when", "where", "why",
  "information", "provide", "details", "identify", "suggestion", "advice",
  "consult", "correction", "words", "detected", "fix", "please", "assist",
  "assistant", "innovation", "platform", "marketplace", "urban", "traditional",
  "household", "community", "earn", "grow", "food", "build", "philippines",
  "beginner", "agritech", "local", "philippine", "ecoequity", "mission",
  "goals", "sustainability", "products", "services", "edibles",
  "hub", "market", "acquisition", "tactics", "growth", "partners", "customers",
  "history", "timeline", "contact"
];

// Paid plans are built end to end — startSubscription() hands off to PayMongo
// and paymongo-webhook writes the subscriptions row — but they stay parked
// until the PayMongo merchant account clears identity verification. Until then
// the AI chat is a free trial for every signed-in user, and the plan buttons
// advertise rather than sell.
//
// Flip this to true once PAYMONGO_SECRET_KEY is set and create-payment is
// deployed. Nothing else needs changing.
const SUBSCRIPTIONS_ENABLED = false;

// Openers offered on the empty chat, per bot — the Plant Doctor is a diagnostic
// tool now that it lives here rather than on its own page, so its prompts are
// all about getting a plant looked at.
const QUICK_PROMPTS = {
  general: [
    "What is EcoEquity's mission?",
    "What products do you offer?",
    "Who is EcoEquity for?",
    "How do I get in touch?",
  ],
  plantDoctor: [
    "How to fix yellowing leaves?",
    "My leaves have black spots",
    "How do I treat it?",
    "Recommend organic fertilizers",
  ],
};

// Sample diagnoses returned by the AI Plant Doctor image scanner.
// Simulates an on-device vision model trained on Philippine crops.
const PLANT_SCAN_DIAGNOSES = [
  {
    plantName: "Heirloom Tomato",
    condition: "Early Blight (Fungal)",
    confidence: "94.2%",
    severity: "Moderate",
    recommendations: [
      "Remove infected lower leaves to prevent spore splash.",
      "Apply an organic copper-based fungicide every 7–10 days.",
      "Improve air circulation by pruning excess foliage.",
      "Water at the base of the plant only, avoiding the leaves.",
    ],
  },
  {
    plantName: "Rice (Palay)",
    condition: "Bacterial Leaf Blight",
    confidence: "91.8%",
    severity: "High",
    recommendations: [
      "Drain the field to reduce standing water that spreads bacteria.",
      "Avoid excess nitrogen fertilizer, which worsens infection.",
      "Use certified disease-resistant seed varieties next planting.",
      "Remove and destroy infected stubble after harvest.",
    ],
  },
  {
    plantName: "Eggplant (Talong)",
    condition: "Spider Mite Infestation",
    confidence: "89.5%",
    severity: "Moderate",
    recommendations: [
      "Spray the underside of leaves with neem oil solution weekly.",
      "Rinse foliage with a strong jet of water to dislodge mites.",
      "Introduce predatory mites or ladybugs as natural control.",
      "Keep humidity up — mites thrive in hot, dry conditions.",
    ],
  },
  {
    plantName: "Pechay (Bok Choy)",
    condition: "Nitrogen Deficiency",
    confidence: "87.3%",
    severity: "Low",
    recommendations: [
      "Side-dress with compost or well-rotted chicken manure.",
      "Apply a diluted fish emulsion or vermicompost tea.",
      "Ensure soil pH is between 6.0–7.0 for nutrient uptake.",
      "Mulch to retain moisture and slow nutrient leaching.",
    ],
  },
  {
    plantName: "Calamansi",
    condition: "Healthy — No Disease Detected",
    confidence: "96.1%",
    severity: "None",
    recommendations: [
      "Your plant looks healthy! Maintain consistent watering.",
      "Feed with a balanced organic fertilizer monthly.",
      "Ensure at least 6 hours of direct sunlight daily.",
      "Inspect weekly for early signs of pests or leaf curl.",
    ],
  },
];

// Normalises an Admin Portal Disease Library row into the diagnosis shape the
// scanner formats. The library is the source of truth for what a scan can
// return; PLANT_SCAN_DIAGNOSES above is only the fallback when it is empty.
const diagnosisFromLibrary = (entry) => ({
  plantName: entry.plant || entry.crop || "Detected Plant",
  condition: entry.name,
  confidence: entry.confidence || "90%",
  severity: entry.severity || "Moderate",
  recommendations: (entry.recommendations && entry.recommendations.length > 0)
    ? entry.recommendations
    : ["Monitor the plant closely and consult a local agronomist."],
});

// Formats a diagnosis object into a readable chat message.
const formatScanResult = (d) => {
  const lines = [
    "🔬 Plant Scan Complete",
    "",
    `🌱 Plant: ${d.plantName}`,
    `🦠 Condition: ${d.condition}`,
    `📊 Confidence: ${d.confidence}`,
    `⚠️ Severity: ${d.severity}`,
    "",
    "✅ Recommended actions:",
    ...d.recommendations.map((r, i) => `${i + 1}. ${r}`),
    "",
    "Want me to explain any step in more detail, or connect you with a human specialist?",
  ];
  return lines.join("\n");
};

/**
 * Calculates the Levenshtein distance between two strings to detect typos.
 */
const getLevenshteinDistance = (a, b) => {
  if (!a || !b) return (a || b).length;
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
};

/**
 * Normalizes input by correcting words that are close to the system keywords.
 */
const autoCorrect = (input) => {
  if (!input) return "";
  const parts = input.split(/(\s+)/);
  let firstWordFound = false;
  
  return parts.map(part => {
    if (/^\s+$/.test(part) || !part) return part;
    
    const word = part;
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');

    const isCapitalized = /^[A-Z]/.test(word);
    const isExactMatch = CORE_KEYWORDS.some(kw => kw.toLowerCase().replace(/[^\w]/g, '') === cleanWord);
    
    if (isCapitalized && !isExactMatch && firstWordFound) {
      firstWordFound = true;
      return word;
    }
    
    firstWordFound = true;

    if (cleanWord.length < 3) return word; 
    
    let bestMatch = word;
    let minDistance = 3; 

    for (const kw of CORE_KEYWORDS) {
      const cleanKw = kw.toLowerCase().replace(/[^\w]/g, '');
      const distance = getLevenshteinDistance(cleanWord, cleanKw);
      if (distance < minDistance) { minDistance = distance; bestMatch = kw; }
    }
    return minDistance < 2 || (cleanWord.length > 5 && minDistance < 3) ? bestMatch : word;
  }).join("");
};

/**
 * Connects to a grammar correction engine (LanguageTool API).
 */
const performSentenceCorrection = async (text) => {
  if (!text || text.trim().length < 4) return text;

  try {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ text, language: "en-US" }),
    });

    if (!response.ok) return text;
    const data = await response.json();

    let corrected = text;
    const matches = (data.matches || []).sort((a, b) => b.offset - a.offset);

    for (const match of matches) {
      if (match.replacements && match.replacements.length > 0) {
        const bestSuggestion = match.replacements[0].value;
        corrected = 
          corrected.substring(0, match.offset) + 
          bestSuggestion + 
          corrected.substring(match.offset + match.length);
      }
    }
    return corrected;
  } catch (err) {
    console.error("Correction service unavailable:", err);
    return text;
  }
};

// ============================================================================
// DAILY AI LIMIT — the client half of the Edge Function's per-account quota.
//
// The server counts every AI message and answers 429 once the day's allowance
// is spent. The lock below is what the user actually sees: a notice inside the
// chat and a composer that stops accepting input, instead of a box that still
// looks live but can only produce the same refusal over and over.
//
// It is persisted because the quota is: a page reload does not give anybody
// more messages, so it must not give them back a working text box either.
// ============================================================================
const QUOTA_LOCK_KEY = "ecoequity:aiQuotaLock";

const quotaLockKeyFor = (user) => `${QUOTA_LOCK_KEY}:${user || "guest"}`;

// Mirrors the Edge Function's own rollover: the quota is keyed on Postgres
// `current_date` and Supabase runs in UTC, so the day turns over at UTC
// midnight. Only used when an older deployment omits `resetsAt`.
function nextQuotaResetISO() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )).toISOString();
}

function readQuotaLock(user) {
  try {
    const raw = window.localStorage.getItem(quotaLockKeyFor(user));
    if (!raw) return null;
    const lock = JSON.parse(raw);
    // An expired lock is stale storage, not a lockout — drop it on sight so a
    // user who comes back the next day is never held out by yesterday's cap.
    if (!lock?.resetsAt || Date.parse(lock.resetsAt) <= Date.now()) {
      window.localStorage.removeItem(quotaLockKeyFor(user));
      return null;
    }
    return lock;
  } catch {
    // Private mode, disabled storage, corrupt JSON. Never let any of that be
    // the reason the chat is unusable — the server still enforces the real cap.
    return null;
  }
}

function writeQuotaLock(user, lock) {
  try {
    window.localStorage.setItem(quotaLockKeyFor(user), JSON.stringify(lock));
  } catch {
    // Same reasoning: the in-memory lock still holds for this session.
  }
}

function clearQuotaLock(user) {
  try {
    window.localStorage.removeItem(quotaLockKeyFor(user));
  } catch {
    // Nothing to do; the caller clears the in-memory lock either way.
  }
}

// "tomorrow at 8:00 AM" — the reset is a UTC boundary, which lands at some
// arbitrary local hour, so showing the user's own clock beats saying "midnight"
// and being wrong for everyone outside UTC.
function formatQuotaReset(resetsAt) {
  const when = new Date(resetsAt);
  if (Number.isNaN(when.getTime())) return "tomorrow";
  const time = when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = when.toDateString() === new Date().toDateString();
  return `${today ? "later today" : "tomorrow"} at ${time}`;
}

// `initialBot` / `seedMessage` let another page hand a conversation over to the
// chat — the AI Plant Doctor passes its scan result so the user can keep asking
// about the same diagnosis. App.js remounts the panel (via `key`) whenever a new
// seed arrives, so the seed only ever needs to be read once, at mount.
function AIChatInterface({
  onClose,
  isMobile,
  initialBot = 'general',
  seedMessage = null,
  plantDiseases = [],   // the Admin Portal's Disease Library
  onScanComplete,       // reports a finished scan back to the Admin Portal
  loggedInUser,
}) { // Removed autoCorrect and performSentenceCorrection
  const [messages, setMessages] = useState(() =>
    seedMessage ? [{ id: Date.now(), text: seedMessage, sender: "ai" }] : []
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State for animation
  const [isTyping, setIsTyping] = useState(false); // State to show typing indicator
  // True when the ai-chat Edge Function is reachable AND someone is logged in.
  // False keeps every answer on the built-in keyword bot below, which is also
  // what happens if the backend, the API key, or the daily quota gives out.
  const [liveAI, setLiveAI] = useState(false);
  // { message, limit, resetsAt } once today's AI allowance is spent, null while
  // there is still quota left. Non-null locks the composer — see composerLocked.
  const [quotaLock, setQuotaLock] = useState(() => readQuotaLock(loggedInUser));
  const [currentBot, setCurrentBot] = useState(initialBot); // 'general' or 'plantDoctor'
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image file
  const [conversationStep, setConversationStep] = useState('initial'); // 'initial', 'awaitingName', 'awaitingContactAndConcern'
  // State for human support escalation
  const [isLiveAgentChat, setIsLiveAgentChat] = useState(false); // To indicate if a live agent is active
  // The support ticket this conversation is being written to: { id, ref }, or
  // null when no live chat is open. `id` is the database uuid every call in
  // data/liveChat needs; `ref` is the TKT-123456 the member is told to quote.
  const [liveTicket, setLiveTicket] = useState(null);
  // True only while the ticket is being created, so a second click cannot open
  // a second ticket for the same conversation.
  const [liveConnecting, setLiveConnecting] = useState(false);
  // Ids of messages already on screen. Our own subscription hears our own
  // inserts come back, so without this every message the member sends appears
  // twice — once optimistically, once from the database.
  const seenLiveIds = useRef(new Set());
  // The member's most recent live conversation as the database sees it: who is
  // on it, who was on it before, whether they are at their desk, and where it
  // is in its lifecycle. Refreshed on a timer while the chat is open, because
  // an agent going offline is not something that arrives as a message.
  const [liveInfo, setLiveInfo] = useState(null);
  // Shown when they have a conversation they have not resumed yet. Separate
  // from `liveInfo` because dismissing the offer must not lose the facts — the
  // header still needs them the moment they do continue.
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [showProModal, setShowProModal] = useState(false); // State for Upgrade to Pro modal
      const [activePlan, setActivePlan] = useState('Basic'); // Track the user's active plan
  const [billingCycle, setBillingCycle] = useState('Monthly'); // State for billing cycle in Pro modal
  const [selectedPlan, setSelectedPlan] = useState('Pro'); // State for selected subscription plan
  const [showPaymentModal, setShowPaymentModal] = useState(false); // State for Payment form modal
  const [paymentForm, setPaymentForm] = useState({ name: '', cardNumber: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false); // State for Payment Success pop-up
  const [paymentMethod, setPaymentMethod] = useState('Credit Card'); // State for selected payment method
  const [paymentError, setPaymentError] = useState(""); // Why a checkout could not be started
  const [mobilePaymentForm, setMobilePaymentForm] = useState({ mobileNumber: '', accountName: '' }); // State for mobile payments

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const getPlantDoctorAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase(); // Reverted to original

    // General greetings and conversational starters
    // Human Support & Escalation
    if (
        lowerInput.includes("human support") ||
        lowerInput.includes("talk to an agent") ||
        lowerInput.includes("connect me to support") ||
        lowerInput.includes("real person") ||
        lowerInput.includes("live chat") ||
        lowerInput.includes("expert help") ||
        lowerInput.includes("personal agent") ||
        lowerInput.includes("support team") || // Detect phrases for human support
        lowerInput.includes("agent") ||
        lowerInput.includes("human help")) {
      return { text: "Certainly! I can connect you with our human support team or agriculture specialist for further assistance. Please provide your name, contact information (email or phone), and a short description of your plant concern.", nextStep: 'awaitingContactAndConcern' }; // Professional, Helpful, Conversational
    }
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return { text: "Hello there! I'm your AI Plant Doctor, ready to help you cultivate a thriving garden. How can I assist with your plant health inquiries today?", nextStep: 'initial' }; // Helpful, Conversational
    }
    if (lowerInput.includes("how are you")) {
      return { text: "As an AI, I don't experience feelings, but I'm fully operational and dedicated to helping your plants thrive! What specific plant health concerns can I address for you today?", nextStep: 'initial' }; // Helpful, Conversational
    }
    if (lowerInput.includes("plant doctor")) {
      return { text: "I am the AI Plant Doctor, a 24/7 service offering localized care guides specifically tailored to the Philippine climate and native crops. I can help you diagnose plant issues and provide actionable advice to maintain healthy plants.", nextStep: 'initial' };
    } 
    if (lowerInput.includes("thank you") || lowerInput.includes("thanks")) {
      return { text: "You're most welcome! I'm here to assist further if you have more questions about your plants. Have a great day!", nextStep: 'initial' };
    }
    if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
      return { text: "Goodbye! May your garden be ever green and bountiful. Remember, I'm here whenever your plants need a little extra care!", nextStep: 'initial' }; // Conversational
    }
    if (lowerInput.includes("what can you do") || lowerInput.includes("help")) {
      return { text: "I'm here to be your comprehensive plant care guide! I can help you diagnose plant issues, suggest organic and sustainable treatments, recommend optimal growing conditions (watering, sunlight, soil, fertilizer), explain various farming techniques (from urban gardening to hydroponics), and provide essential preventive care tips. Just tell me about your plant or your specific question!", nextStep: 'initial' }; // Helpful, Educational
    }
    if (lowerInput.includes("what is your name") || lowerInput.includes("who are you") || lowerInput.includes("your name")) {
      return { text: "I am the AI Plant Doctor, a specialized assistant from EcoEquity, here to help you with all your plant health inquiries.", nextStep: 'initial' };
    }

    // Handling uncertain diagnoses or general plant problems before specific symptoms
    if (
        lowerInput.includes("what's wrong with my plant") ||
        lowerInput.includes("diagnose my plant") ||
        lowerInput.includes("problem with my") ||
        lowerInput.includes("my plant is sick") ||
        lowerInput.includes("what is this on my plant") ||
        lowerInput.includes("plant issue") ||
        lowerInput.includes("disease identification")
    ) {
        return {
            text: "I'd love to help diagnose! To give you the best advice, could you please provide more details? Specifically:\n\n1. What kind of plant is it?\n2. Can you describe the symptoms more clearly (e.g., color, location on the plant, texture, progression)?\n3. How long have you observed these symptoms?\n4. What are its growing conditions (watering, sunlight, soil, recent changes)?\n\nIf the issue seems severe or complex, or if I can't provide a confident diagnosis, consider taking a clear photo and consulting a local agriculture expert or plant pathology laboratory for a precise diagnosis.",
            nextStep: 'initial'
        };
    }
    // Escalation triggers for Plant Doctor
    if (lowerInput.includes("severe disease") || lowerInput.includes("dying plant") || lowerInput.includes("emergency crop") || lowerInput.includes("urgent plant issue") || lowerInput.includes("plant emergency")) {
      return { text: "This sounds like a serious concern for your plants. I can connect you with a human agriculture specialist who can provide expert consultation. Please provide your name.", nextStep: 'awaitingName' }; // Professional, Helpful
    }
    if (lowerInput.includes("frustrated") || lowerInput.includes("not helping") || lowerInput.includes("can't fix") || lowerInput.includes("still sick")) {
      return { text: "I understand your frustration, and I'm here to help as best as I can. If you feel you need more personalized assistance, I can connect you with a human agriculture specialist. Please provide your name.", nextStep: 'awaitingName' }; // Conversational, Helpful
    }
    // If the user mentions payment or account concerns in the Plant Doctor context, redirect to general support
    if (lowerInput.includes("payment") || lowerInput.includes("account") || lowerInput.includes("billing")) {
      return { text: "My apologies, I am specialized in plant health. For payment or account concerns, I recommend switching to the EcoEquityBot AI or connecting with our general support team. Would you like me to help you connect with a human support agent for these issues? If so, please provide your name.", nextStep: 'awaitingName' }; // Professional, Helpful
    }
    // If the user mentions technical website problems in the Plant Doctor context, redirect to general support
    if (lowerInput.includes("website error") || lowerInput.includes("technical issue") || lowerInput.includes("bug") || lowerInput.includes("app not working")) {
      return { text: "I'm designed to assist with plant-related queries. For technical website problems, I recommend connecting with our general support team. Would you like me to help you connect with a human support agent for these issues? If so, please provide your name.", nextStep: 'awaitingName' }; // Professional, Helpful
    }
    // Real-time plant health assistance
    if (lowerInput.includes("real-time assistance") || lowerInput.includes("immediate help")) {
      return { text: "I provide real-time plant health assistance by analyzing your descriptions and offering immediate advice. For very complex or urgent situations, I can help you connect with a human expert. What specific issue are you facing right now?", nextStep: 'initial' }; // Helpful, Professional
    }
    // AI-powered plant disease detection
    if (lowerInput.includes("ai detection") || lowerInput.includes("ai diagnosis") || lowerInput.includes("ai-powered disease")) {
      return { text: "My core function is AI-powered plant disease detection! Describe the symptoms you're observing, and I'll do my best to identify potential issues and suggest solutions. For complex cases, I might recommend consulting a local expert.", nextStep: 'initial' }; // Helpful, Professional, Educational
    }

    // Plant Doctor specific responses
    if (lowerInput.includes("symptoms")) {
      return { text: "To help me diagnose, please describe the symptoms in detail. For example, are the leaves yellowing, wilting, or do you see spots? What kind of plant is it?", nextStep: 'initial' };
    }
    if (lowerInput.includes("yellow leaves")) {
      return { text: "Yellow leaves can indicate several issues, such as nutrient deficiency (e.g., nitrogen, iron), overwatering, or underwatering. Could you tell me more about your watering schedule and the type of plant?", nextStep: 'initial' };
    }
    if (lowerInput.includes("wilting")) {
      return { text: "Wilting can be a sign of insufficient water, root rot from overwatering, or even extreme heat. What's your watering routine like, and what plant are we discussing?", nextStep: 'initial' };
    }
    if (lowerInput.includes("spots on leaves")) {
      return { text: "Leaf spots can be caused by fungal, bacterial, or viral infections, or even pest damage. Can you describe the spots (color, size, texture) and the plant type?", nextStep: 'initial' };
    }
    if (lowerInput.includes("disease") || lowerInput.includes("sick") || lowerInput.includes("unhealthy")) {
      return { text: "I can certainly help with that! Please describe the symptoms you're observing on your plant. For example, are there spots, discoloration, wilting, or unusual growths? Knowing the type of plant is also very helpful.", nextStep: 'initial' }; // Helpful, Conversational
    }
    if (lowerInput.includes("black spots")) {
      return { text: "Black spots could indicate a fungal infection like Black Spot disease, common in roses, or a bacterial leaf spot. To provide the best advice, can you tell me more about the plant and if the spots are raised or sunken?", nextStep: 'initial' }; // Educational, Helpful
    }
    if (lowerInput.includes("curling leaves")) {
      return { text: "Curling leaves can be a sign of pest infestation (like aphids or spider mites), heat stress, underwatering, or even viral infections. To help you further, what kind of plant is it, and have you checked for any tiny insects on the underside of the leaves?", nextStep: 'initial' }; // Educational, Helpful
    }
    if (lowerInput.includes("stunted growth")) {
      return { text: "Stunted growth can be caused by various factors such as nutrient deficiencies, improper watering, insufficient light, or root problems. Could you tell me about your plant's environment and feeding schedule so I can offer more tailored advice?", nextStep: 'initial' }; // Educational, Helpful
    }

    // Scan follow-ups. The AI Plant Doctor page hands its diagnosis over to this
    // bot and invites exactly these three questions, so they get real answers
    // rather than the catch-all fallback.
    if (lowerInput.includes("treat") || lowerInput.includes("cure") || lowerInput.includes("get rid of") || lowerInput.includes("how do i fix") || lowerInput.includes("how to fix")) {
      return { text: "Treatment works best in three passes: remove and bag the worst-affected leaves first, apply your chosen treatment early morning or late afternoon (never in midday heat), then repeat every 7-10 days until new growth comes in clean. Which condition are we treating, and do you prefer an organic or a conventional product?", nextStep: 'initial' };
    }
    if (lowerInput.includes("spread") || lowerInput.includes("contagious") || lowerInput.includes("other plants") || lowerInput.includes("nearby plants")) {
      return { text: "To stop it spreading: isolate the affected plant if you can, sanitise your pruning tools between cuts, water at the base rather than overhead, and clear fallen leaves from the soil surface — that's where most spores overwinter. Give neighbouring plants a quick check for early symptoms too.", nextStep: 'initial' };
    }
    if (lowerInput.includes("organic option") || lowerInput.includes("organic alternative") || lowerInput.includes("organic treatment") || lowerInput.includes("organic spray") || lowerInput.includes("natural remedy")) {
      return { text: "Good organic options are neem oil, a potassium bicarbonate spray, copper-based fungicide for fungal issues, and insecticidal soap for soft-bodied pests. All of them work on contact, so apply thoroughly to both leaf surfaces and reapply after heavy rain. What are you treating?", nextStep: 'initial' };
    }

    // Pest infestations
    if (lowerInput.includes("pests")) {
      return { text: "Pests can be a nuisance! Common ones include aphids, spider mites, and mealybugs. Can you describe the pests you're seeing or the damage they're causing?", nextStep: 'initial' };
    }
    if (lowerInput.includes("bugs") || lowerInput.includes("insects")) {
      return { text: "To help identify the bug, can you describe its size, color, and if it's flying or crawling? Also, what kind of plant is it affecting?", nextStep: 'initial' };
    }
    // Pest and nutrient deficiency analysis
    if (lowerInput.includes("pest analysis") || lowerInput.includes("nutrient deficiency analysis") || lowerInput.includes("analyze my plant")) {
      return { text: "I can help analyze potential pest infestations or nutrient deficiencies. Please describe any visible signs like discoloration, holes in leaves, sticky residue, or the presence of any small creatures. The more details, the better!", nextStep: 'initial' }; // Helpful, Professional
    }

    // Soil health
    if (lowerInput.includes("fertiliz") || lowerInput.includes("nutrient")) {
      return { text: "Fertilizers provide essential nutrients for plant growth. Organic options like compost, worm castings, or fish emulsion are excellent choices. The best type and frequency depend on your plant's growth stage and specific needs. What plant are you fertilizing, and what are its current symptoms?", nextStep: 'initial' }; // Educational, Helpful
    }
    // "how often should I water it" is the single most common follow-up after a
    // scan, and it never contains the word "watering".
    if (lowerInput.includes("watering") || lowerInput.includes("water it") || lowerInput.includes("water them") || lowerInput.includes("water my") || lowerInput.includes("overwater") || lowerInput.includes("underwater")) {
      return { text: "Watering is crucial for plant health! Most plants prefer consistent moisture but dislike being waterlogged. A good rule of thumb is to check the soil an inch or two deep; if it feels dry, it's likely time to water. What type of plant are you asking about, and what's your current watering routine?", nextStep: 'initial' }; // Educational, Helpful
    }
    if (lowerInput.includes("soil")) {
      return { text: "Healthy soil is indeed the foundation of a healthy plant! Are you curious about soil type (sandy, clay, loamy), pH levels, or how to improve soil structure and fertility? Knowing your plant type helps me give the best advice.", nextStep: 'initial' }; // Educational, Professional
    }
    if (lowerInput.includes("soil health") || lowerInput.includes("improve soil")) {
      return { text: "Improving soil health is absolutely key for robust and productive plants! I recommend enriching your soil with organic matter like compost, practicing crop rotation, and minimizing tillage. What kind of soil do you currently have, and what are you hoping to grow?", nextStep: 'initial' }; // Educational, Helpful, Professional
    }

    // Smart crop recommendations
    if (lowerInput.includes("crop recommendations") || lowerInput.includes("what to grow") || lowerInput.includes("best crops")) {
      return { text: "I can offer smart crop recommendations! To give you the best advice, please tell me about your local climate, soil type, available space, and what your goals are (e.g., personal consumption, market sales).", nextStep: 'initial' }; // Helpful, Professional
    }

    // Weather effects on crops
    if (lowerInput.includes("weather") || lowerInput.includes("climate") || lowerInput.includes("temperature")) {
      return { text: "Understanding your local climate is key, especially here in the Philippines! Most tropical plants thrive in warm, humid conditions. Extreme temperatures or sudden changes can stress plants. What plant are you growing, and where are you located?", nextStep: 'initial' }; // Educational, Professional
    }
    if (lowerInput.includes("rain") || lowerInput.includes("drought") || lowerInput.includes("storm")) {
      return { text: "Weather extremes can be challenging. For heavy rain or storms, ensure good drainage and consider temporary shelters. During drought, focus on water conservation techniques like mulching and efficient irrigation. What specific weather concern are you facing?", nextStep: 'initial' };
    }

    // Organic farming
    if (lowerInput.includes("organic farming") || lowerInput.includes("organic agriculture") || lowerInput.includes("sustainable farming") || lowerInput.includes("eco-friendly")) {
      return { text: "Organic agriculture focuses on ecological balance and biodiversity, avoiding synthetic pesticides and fertilizers. It builds healthy soil through compost, crop rotation, and natural pest control. It's a wonderful, sustainable approach that I fully support! What aspects are you curious about?", nextStep: 'initial' }; // Educational, Professional, Encourages eco-friendly
    }
    // Sustainable agriculture support
    if (lowerInput.includes("sustainable agriculture support") || lowerInput.includes("eco-friendly farming")) {
      return { text: "I'm here to support your sustainable agriculture journey! This involves practices like organic farming, water conservation, biodiversity promotion, and minimizing environmental impact. What specific sustainable practices are you interested in learning about or implementing?", nextStep: 'initial' }; // Helpful, Professional, Educational, Encourages eco-friendly
    }

    // Crop maintenance
    if (lowerInput.includes("crop maintenance") || lowerInput.includes("pruning") || lowerInput.includes("weeding") || lowerInput.includes("harvesting") || lowerInput.includes("plant care")) {
      return { text: "Good crop maintenance is essential for healthy yields and thriving plants! Are you looking for advice on pruning techniques, effective weeding strategies, optimal harvesting times, or general care for a specific crop?", nextStep: 'initial' }; // Helpful, Educational
    }
    // Beginner-friendly farming guidance
    if (lowerInput.includes("beginner farming") || lowerInput.includes("new to gardening") || lowerInput.includes("simple farming tips")) {
      return { text: "Welcome to the wonderful world of farming! I can provide beginner-friendly guidance on everything from choosing the right plants to basic care routines. What's your first question or what kind of plant are you starting with?", nextStep: 'initial' }; // Helpful, Educational, Conversational
    }

    // Smart agriculture technologies
    if (lowerInput.includes("smart agriculture") || lowerInput.includes("agritech") || lowerInput.includes("precision farming") || lowerInput.includes("sensors") || lowerInput.includes("drones") || lowerInput.includes("ai in farming")) {
      return { text: "Smart agriculture technologies, like sensors for soil moisture, automated irrigation, or drones for crop monitoring, can significantly boost efficiency and sustainability. They help optimize resource use and improve yields. Are you interested in a particular technology or how it can benefit your farm?", nextStep: 'initial' }; // Educational, Professional
    }

    // Local farming recommendations
    if (lowerInput.includes("local farming") || lowerInput.includes("philippine crops") || lowerInput.includes("native plants") || lowerInput.includes("regional advice")) {
      return { text: "I can provide recommendations tailored to local farming conditions, especially for Philippine crops and native plants. To give you the best advice, please tell me your region and the specific crops or plants you're interested in.", nextStep: 'initial' }; // Helpful, Professional
    }
    // 24/7 virtual agriculture assistant
    if (lowerInput.includes("24/7 assistant") || lowerInput.includes("always available")) {
      return { text: "That's right! I'm your 24/7 virtual agriculture assistant, always here to provide guidance and support for your plants, day or night. How can I help you right now?", nextStep: 'initial' }; // Helpful, Conversational
    }
    // Fallback for Plant Doctor
    return { text: `I'm your AI Plant Doctor, here to help your plants thrive! To give you the best advice, please provide specific details about their symptoms, the type of plant, or your care routine. For general EcoEquity questions, you can switch to EcoEquityBot AI.`, nextStep: 'initial' }; // Helpful, Conversational
  };

  const getGeneralAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase(); // Reverted to original

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return { text: "Hello there! I'm EcoEquityBot AI, your dedicated assistant from EcoEquity. How can I assist you with our agricultural innovations and platform today?", nextStep: 'initial' }; // Conversational
    }
    if (lowerInput.includes("how are you")) {
      return { text: "As an AI, I don't experience feelings, but I'm fully operational and ready to provide you with information about EcoEquity! What specific details are you looking for today?", nextStep: 'initial' }; // Conversational
    }
    if (lowerInput.includes("what can you do") || lowerInput.includes("help")) {
      return { text: "I can provide detailed information about EcoEquity's mission, our innovative products (like the AI Plant Doctor, Organic Edibles marketplace, and Community Hub), our target market, business goals, and even the historical context of Philippine agriculture. Just ask me a question about EcoEquity!", nextStep: 'initial' }; // Helpful, Educational
    }
    // Human Support & Escalation
    // Detect phrases for human support
    if (
        lowerInput.includes("human support") ||
        lowerInput.includes("talk to an agent") ||
        lowerInput.includes("connect me to support") ||
        lowerInput.includes("real person") ||
        lowerInput.includes("live chat") ||
        lowerInput.includes("expert help") ||
        lowerInput.includes("personal agent") ||
        lowerInput.includes("support team") || // Detect phrases for human support
        lowerInput.includes("agent") ||
        lowerInput.includes("human help")) {
      return { text: "Certainly! I can connect you with our human support team or agriculture specialist for further assistance. Please provide your name, contact information (email or phone), and a short description of your concern.", nextStep: 'awaitingContactAndConcern' }; // Professional, Helpful, Conversational
    }
    // Escalation triggers for General AI
    if (lowerInput.includes("payment") || lowerInput.includes("account") || lowerInput.includes("billing") || lowerInput.includes("subscription")) {
      return { text: "I can help you connect with our support team regarding payment or account concerns. Please provide your name.", nextStep: 'awaitingName' }; // Professional, Helpful
    }
    if (lowerInput.includes("website error") || lowerInput.includes("technical issue") || lowerInput.includes("bug") || lowerInput.includes("app not working")) {
      return { text: "I can help you connect with our support team for technical website problems. Please provide your name.", nextStep: 'awaitingName' }; // Professional, Helpful
    }
    if (
        lowerInput.includes("frustrated") ||
        lowerInput.includes("not helping") ||
        lowerInput.includes("live chat") ||
        lowerInput.includes("expert help") ||
        lowerInput.includes("personal agent") ||
        lowerInput.includes("support team") ||
        lowerInput.includes("agent") ||
        lowerInput.includes("human help")) {
      return { text: "I understand you'd like to connect with a human expert. Our dedicated support team is available to provide more detailed assistance for complex issues or personalized guidance. To help us connect you with the right specialist, please tell me your name.", nextStep: 'awaitingName' }; // Helpful, Professional, Conversational
    }
    if (lowerInput.includes("plant doctor")) {
      return { text: "The AI Plant Doctor is a 24/7 service offering localized care guides specifically tailored to the Philippine climate and native crops. It helps users diagnose plant issues and provides actionable advice to maintain healthy plants. You can switch to the AI Plant Doctor to ask specific questions about your plants.", nextStep: 'initial' };
    }
    if (lowerInput.includes("ecoequity")) {
      return { text: "EcoEquity is a pioneering digital-first platform dedicated to enhancing agricultural self-sufficiency in the Philippines. Our core mission is to 'Grow Food, Build Community, and Earn Sustainably' by empowering households and communities with innovative tools and resources. Would you like to know more about our specific offerings?", nextStep: 'initial' };
    }
    if (lowerInput.includes("mission") || lowerInput.includes("goals")) {
      return { text: "Our mission at EcoEquity is to 'Grow Food, Build Community, and Earn Sustainably.' We aim to achieve this by boosting agricultural self-sufficiency in the Philippines, starting at the household and community level, through high-engagement digital solutions.", nextStep: 'initial' };
    }
    if (lowerInput.includes("sustainability")) {
      return { text: "Sustainability is at the heart of EcoEquity. Our platform fosters sustainable agriculture by connecting local producers with consumers, providing eco-friendly farming guidance, and supporting community-driven initiatives. We align with global Sustainable Development Goals. Is there a particular aspect of our sustainability efforts you're interested in?", nextStep: 'initial' };
    }
    if (lowerInput.includes("products") || lowerInput.includes("services") || lowerInput.includes("offer")) {
      return { text: "EcoEquity offers a comprehensive suite of digital tools including the AI Plant Doctor, an Organic Edibles marketplace, and a Community Hub. These are designed to support various aspects of agricultural innovation. Which one would you like to explore further?", nextStep: 'initial' };
    }
    if (lowerInput.includes("organic edibles")) {
      return { text: "Our Organic Edibles marketplace connects users with local produce, fresh herbs, organic farming kits, floriculture products, and localized seeds. It's a vital component in fostering sustainable agriculture and supporting local economies.", nextStep: 'initial' };
    }
    if (lowerInput.includes("community hub")) {
      return { text: "The Community Hub provides essential digital tools and localized data to support both urban farming and traditional agricultural centers. It's designed to help farmers and enthusiasts connect, share knowledge, and manage resources, especially during periods of oversupply.", nextStep: 'initial' };
    }
    if (lowerInput.includes("target market") || lowerInput.includes("who do you serve")) {
      return { text: "EcoEquity serves a broad target market including individual households, urban gardeners, traditional farmers, and institutional buyers such as hotels and food processors. Our goal is to reach 150,000+ Active Monthly Users.", nextStep: 'initial' };
    }
    if (lowerInput.includes("acquisition tactics") || lowerInput.includes("channels")) {
      return { text: "Our acquisition tactics are multi-faceted, encompassing Digital Acquisition (Content Marketing, SEO/ASO, Monetization Strategy), Physical & Community Engagement (LGU Partnership Integration, Specialist Workshops, Word-of-Mouth), and B2B & Sector Integration (Direct Sales to Institutions, Farmer Outreach).", nextStep: 'initial' };
    }
    if (lowerInput.includes("growth") || lowerInput.includes("partners") || lowerInput.includes("customers")) {
      return { text: "EcoEquity is experiencing significant growth, with a 98% company growth rate, over 99 partners, and more than 1000 customers. These figures reflect our expanding impact and reach in the agricultural sector.", nextStep: 'initial' };
    }
    if (lowerInput.includes("history") || lowerInput.includes("timeline") || lowerInput.includes("agricultural challenges")) {
      return { text: "EcoEquity addresses historical challenges in Philippine agriculture. For instance, the 1980s saw a shift to import dependency due to Peso devaluation, the 2000s brought trade liberalization and cheap imports, and the 2010s faced global price shocks and rapid urbanization. The 2020s highlighted supply chain fragility during the pandemic. Our platform aims to mitigate these issues.", nextStep: 'initial' };
    }
    if (lowerInput.includes("1980s agriculture")) {
      return { text: "In the 1980s, Philippine agriculture shifted from self-sufficiency to import dependency, exacerbated by the Peso devaluation during the Debt Crisis, which made imported goods more expensive.", nextStep: 'initial' };
    }
    if (lowerInput.includes("2000s agriculture")) {
      return { text: "The 2000s marked the WTO Accession and trade liberalization, leading to cheap imports flooding the market and impacting local producers.", nextStep: 'initial' };
    }
    if (lowerInput.includes("2010s agriculture")) {
      return { text: "During the 2010s, global price shocks and rapid urbanization meant that import dependency caused high USD rates to translate directly into higher local prices for agricultural goods.", nextStep: 'initial' };
    }
    if (lowerInput.includes("2020s agriculture") || lowerInput.includes("pandemic impact")) {
      return { text: "The 2020s, particularly during the pandemic, exposed significant supply chain fragility, demonstrating the inability to meet local demand due to over-reliance on imports.", nextStep: 'initial' };
    }
    if (lowerInput.includes("contact") || lowerInput.includes("get in touch")) {
      return { text: "We'd love to hear from you! You can reach out to us through our 'Get in Touch' section on the website for any inquiries or collaborations.", nextStep: 'initial' };
    }
    if (lowerInput.includes("thank you") || lowerInput.includes("thanks")) {
      return { text: "You're most welcome! I'm here to assist further if you have more questions about EcoEquity. Have a great day!", nextStep: 'initial' };
    }
    if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
      return { text: "Goodbye! I hope you have a productive day. Feel free to chat again anytime!", nextStep: 'initial' };
    }
    if (lowerInput.includes("what is your name") || lowerInput.includes("who are you")) {
      return { text: "I am EcoEquityBot AI, your AI assistant from EcoEquity. I'm here to help you learn more about our platform and agricultural innovations.", nextStep: 'initial' };
    }

    // More intelligent fallback
    return { text: `I'm EcoEquityBot AI. I'm here to help you learn more about EcoEquity. Could you please rephrase your question or ask something more specific about our mission, products, target market, or the agricultural context we operate in? For example, you could ask: "What is the AI Plant Doctor?" or "Tell me about EcoEquity's mission."`, nextStep: 'initial' };
  };

  const handleToggleBot = () => {
    const newBot = currentBot === 'general' ? 'plantDoctor' : 'general';
    setCurrentBot(newBot);
    setMessages([]); // Clear messages when switching bots
    setInput(""); // Clear input field
    setIsTyping(true);
    setConversationStep('initial'); // Reset conversation step
    setIsLiveAgentChat(false); // Reset live agent status


    const welcomeMessage = newBot === 'general'
      ? "Hello there! I'm EcoEquityBot AI, your dedicated assistant from EcoEquity. How can I assist you with our agricultural innovations and platform today?" // Conversational
      : "Hello! I'm your AI Plant Doctor. Tap Scan Plant to send a photo of the affected leaves and I'll return a full diagnosis, or just describe the symptoms you're seeing."; // Professional, Helpful, Conversational

    setTimeout(() => {
      setMessages([{ id: Date.now(), text: welcomeMessage, sender: "ai" }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handlePaste = (e) => {
    if (composerLocked) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        setSelectedImage(blob);
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Dropping a photo onto a locked chat would stage something that can never
    // be sent — swallow it rather than leave a preview the user cannot clear by
    // sending.
    if (composerLocked) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // Opens a real support ticket and puts the panel into live mode. Shared by
  // the Human agent switch and the keyword bot's escalation path — two doors
  // into the same conversation must not mean two different behaviours, and the
  // escalation path used to open a chat that only LOOKED live.
  //
  // Returns { ok, text }: the caller decides how to render the line, because
  // one arrives as a toggle side effect and the other as a bot reply.
  const startLiveChat = async ({ subject, firstMessage, history } = {}) => {
    const availability = await isLiveChatAvailable();
    if (!availability.ok) {
      return {
        ok: false,
        text: availability.reason === "signed-out"
          // Not a technicality: without an account there is no address for the
          // team to answer, so this would be a conversation that can only
          // dead-end. Say what to do about it rather than just refusing.
          ? "To put you through to a person I need to know who you are — please sign in or create an account, then flip the Human agent switch again. That way the team can reply to you here and by email."
          : "I can't reach the support desk from here right now. Please use the support form and someone will get back to you by email.",
      };
    }

    try {
      // The bot conversation so far travels with the ticket. See openLiveChat:
      // it lands on the ticket, not in the thread, because the agent was not
      // there for it.
      const opened = await openLiveChat({ subject, history });
      if (!opened) {
        return { ok: false, text: "I couldn't open a support chat just now. Please try again in a moment, or use the support form." };
      }

      seenLiveIds.current = new Set();
      // Sent before the panel flips, so the first thing the admin sees is what
      // the member actually wants rather than an empty ticket.
      if (firstMessage) {
        const sent = await sendLiveMessage(opened.id, firstMessage);
        if (sent) seenLiveIds.current.add(sent.id);
      }

      setLiveTicket({ id: opened.id, ref: opened.ref });
      setIsLiveAgentChat(true);
      setConversationStep('liveAgentActive');

      return {
        ok: true,
        // Deliberately NOT "you are now connected with a specialist". Nobody is
        // connected until a person answers, and promising a human who may be
        // asleep is how a support chat loses someone's trust in one sentence.
        text: `You're through to the EcoEquity support desk — your reference is ${opened.ref}. Type your question here and a specialist will answer in this window. If the team is away, we'll pick it up and reply by email, so nothing gets lost.`,
      };
    } catch (err) {
      console.error("Could not open a live chat:", err);
      return { ok: false, text: "Something went wrong opening the support chat. Please try again, or use the support form and we'll reply by email." };
    }
  };

  // Pull the thread onto the screen as history. The subscription effect below
  // renders only agent messages — on a live chat the member's own are already
  // there from the moment they pressed send — but a conversation being RESUMED
  // has nothing on screen at all, so both sides have to be drawn here.
  //
  // Every id goes into seenLiveIds on the way past, so when the effect does its
  // own backfill a moment later it finds them all already accounted for and
  // draws nothing twice.
  const loadConversationHistory = async (ticketId) => {
    const rows = await fetchTicketMessages(ticketId);
    if (!rows) return;
    seenLiveIds.current = new Set(rows.map((row) => row.id));
    setMessages(rows.map((row) => ({
      id: row.id,
      text: row.text,
      sender: row.sender === "agent" ? "agent" : "user",
    })));
  };

  // "Continue where you left off." Puts the panel back into live mode on the
  // conversation that already exists, rather than opening a second one.
  const handleContinueConversation = async () => {
    if (!liveInfo || resumeBusy) return;
    setResumeBusy(true);
    try {
      // A conversation they closed — or that we declined — comes back as a
      // fresh request rather than silently resuming: the agent who was on it
      // has long since moved on, and resuming into an empty room is the exact
      // silence this feature exists to prevent.
      if (liveInfo.liveStatus === "closed" || liveInfo.liveStatus === "rejected") {
        await setLiveStatus(liveInfo.id, "pending");
      } else if (liveInfo.liveStatus === "reassigned") {
        // They are about to see the "your agent has changed" banner in context,
        // which is the acknowledgement. Stop it announcing itself tomorrow.
        await ackHandover(liveInfo.id);
      }

      await loadConversationHistory(liveInfo.id);
      setLiveTicket({ id: liveInfo.id, ref: liveInfo.ref });
      setIsLiveAgentChat(true);
      setConversationStep('liveAgentActive');
      setShowResumePrompt(false);
      refreshLiveInfo();
    } catch (err) {
      console.error("Could not reopen the live chat:", err);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: "I couldn't reopen that conversation just now. Please try again in a moment.",
        sender: "ai",
      }]);
      setShowResumePrompt(false);
    } finally {
      setResumeBusy(false);
    }
  };

  // "Start a new request." Closes the old conversation first, so the member
  // does not end up with two open chats and the admin with two rows for one
  // person — and so the transcript of the old one is kept rather than lost.
  const handleStartNewRequest = async () => {
    if (resumeBusy) return;
    setResumeBusy(true);
    try {
      if (liveInfo && liveInfo.liveStatus !== "closed" && liveInfo.liveStatus !== "rejected") {
        await setLiveStatus(liveInfo.id, "closed").catch(() => {});
      }
      setShowResumePrompt(false);
      setMessages([]);
      seenLiveIds.current = new Set();

      const lastAsked = [...messages].reverse().find((m) => m.sender === "user" && m.text);
      const result = await startLiveChat({ subject: lastAsked?.text, history: messages });
      setMessages([{ id: Date.now(), text: result.text, sender: result.ok ? "agent" : "ai" }]);
      refreshLiveInfo();
    } finally {
      setResumeBusy(false);
    }
  };

  const handleHumanAgentToggle = async () => {
    if (isLiveAgentChat) {
      // Clearing the ticket tears down the subscription (see the effect below).
      // The ticket itself stays open in the Admin Portal: the member closing
      // the panel is not the member's problem being solved.
      setIsLiveAgentChat(false);
      setLiveTicket(null);
      setConversationStep('initial');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Live chat closed — you're back with the AI assistant. Your conversation is saved: flip this switch again to pick it up where you left off, and any reply from the team will still reach you by email.",
          sender: "ai",
        },
      ]);
      return;
    }

    if (liveConnecting) return;
    setLiveConnecting(true);

    // Turning the switch back on resumes rather than starting again. Without
    // this, someone who closed the chat and changed their mind would open a
    // SECOND ticket — the admin gets two rows for one person, the agent
    // answers the one nobody is reading, and the history the member came back
    // for is sitting in the other.
    const existing = await fetchMyLiveChat().catch(() => null);
    const resumable = existing
      && existing.messageCount > 0
      && existing.liveStatus !== "closed"
      && existing.liveStatus !== "rejected";

    if (resumable) {
      setLiveInfo(existing);
      try {
        if (existing.liveStatus === "reassigned") await ackHandover(existing.id);
        await loadConversationHistory(existing.id);
        setLiveTicket({ id: existing.id, ref: existing.ref });
        setIsLiveAgentChat(true);
        setConversationStep('liveAgentActive');
        setShowResumePrompt(false);
        setLiveConnecting(false);
        return;
      } catch (err) {
        // Fall through and open a fresh one rather than stranding them: a
        // conversation they cannot reach is worse than a duplicate row.
        console.error("Could not resume the live chat:", err);
      }
    }

    // Whatever they last asked the bot becomes the ticket subject, so the admin
    // opens it already knowing what it is about.
    const lastAsked = [...messages].reverse().find((m) => m.sender === "user" && m.text);
    const result = await startLiveChat({ subject: lastAsked?.text, history: messages });

    setLiveConnecting(false);
    refreshLiveInfo();
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: result.text, sender: result.ok ? "agent" : "ai" },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Trigger the open animation after the component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 50); // Small delay to allow component to render before animating
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages change
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    isLiveAIAvailable().then((ok) => { if (!cancelled) setLiveAI(ok); });
    return () => { cancelled = true; };
  }, [loggedInUser]);

  // Listen to the open ticket's thread. Every message the database has, the
  // member gets — but only the agent's are drawn, because their own are already
  // on screen from the moment they pressed send.
  useEffect(() => {
    if (!liveTicket) return undefined;
    let cancelled = false;

    const absorb = (msg) => {
      if (seenLiveIds.current.has(msg.id)) return;
      seenLiveIds.current.add(msg.id);
      if (msg.sender !== "agent") return;
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: msg.id, text: msg.text, sender: "agent" },
      ]);
    };

    const unsubscribe = subscribeToTicket(liveTicket.id, (msg) => {
      if (cancelled) return;
      absorb(msg);
      // An agent speaking is the one moment the header is most likely to be
      // stale — it is usually the assignment itself, or a handover. Re-read
      // rather than waiting up to 30s for the timer to notice.
      if (msg.sender === "agent") refreshLiveInfo();
    });

    // Realtime delivers what happens while you are listening, not what already
    // happened — so anything said between the ticket opening and the socket
    // coming up is only ever found by reading it. Same call covers a reply that
    // landed during a dropped connection.
    fetchTicketMessages(liveTicket.id)
      .then((rows) => { if (!cancelled) (rows || []).forEach(absorb); })
      .catch((err) => console.warn("Could not load the live chat history:", err));

    return () => { cancelled = true; unsubscribe(); };
  }, [liveTicket]);

  // Who is on this conversation, and are they at their desk. One call, and the
  // only one that can answer it — a member cannot read an agent's profile row,
  // so my_live_chat() is the sole route from agent_id to a name.
  const refreshLiveInfo = async () => {
    try {
      const info = await fetchMyLiveChat();
      setLiveInfo(info);
      return info;
    } catch (err) {
      console.warn("Could not read the live chat state:", err);
      return null;
    }
  };

  // On open: do they already have a conversation? This is what makes the panel
  // survive a closed tab. Nothing is resumed automatically — an old chat
  // reopening itself under someone who came back for something else is worse
  // than one extra click.
  useEffect(() => {
    let cancelled = false;
    fetchMyLiveChat()
      .then((info) => {
        if (cancelled || !info) return;
        setLiveInfo(info);
        // An empty conversation is not worth offering back. It means they
        // flipped the switch, said nothing, and left — there is no "where you
        // left off" to return to.
        if (info.messageCount > 0) setShowResumePrompt(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loggedInUser]);

  // While the chat is open, keep the agent's presence honest. An agent going
  // offline, or being swapped for another, produces no message on the member's
  // socket — the header would otherwise keep showing a green dot beside
  // somebody who shut their laptop twenty minutes ago.
  useEffect(() => {
    if (!isLiveAgentChat || !liveTicket) return undefined;
    refreshLiveInfo();
    const timer = setInterval(refreshLiveInfo, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveAgentChat, liveTicket]);

  // The lock belongs to an account, so re-read it whenever the account changes,
  // and lift it on a timer at the reset. Without the timer a user who leaves
  // the panel open past the rollover stays locked out with no way to tell that
  // their messages are back.
  useEffect(() => {
    const lock = readQuotaLock(loggedInUser);
    setQuotaLock(lock);
    if (!lock) return undefined;

    const timer = setTimeout(() => {
      clearQuotaLock(loggedInUser);
      setQuotaLock(null);
    }, Math.max(Date.parse(lock.resetsAt) - Date.now(), 0));
    return () => clearTimeout(timer);
    // Keyed on the reset instant rather than the object so setting a fresh lock
    // re-arms the timer, but re-reading the same lock does not loop.
  }, [loggedInUser, quotaLock?.resetsAt]);

  // Called when the server answers 429. Records why, and until when, so the
  // notice and the composer agree on both.
  const applyQuotaLock = (err) => {
    const lock = {
      message: err?.message
        || "You have used all of today's AI messages. They reset tomorrow.",
      limit: typeof err?.limit === "number" ? err.limit : null,
      resetsAt: err?.resetsAt || nextQuotaResetISO(),
    };
    writeQuotaLock(loggedInUser, lock);
    setQuotaLock(lock);
  };

  // A conversation already handed to a human is not the AI's to cut off — the
  // live-agent path never calls the model, so it costs nothing and stays open.
  const composerLocked = Boolean(quotaLock) && !isLiveAgentChat;

  const handleSendMessage = async (textOverride) => {
    // Out of messages for today. The composer is disabled, but quick prompts
    // and a stray Enter can still land here, and every one of those would be a
    // request the server can only refuse.
    if (composerLocked) return;

    const rawInput = typeof textOverride === 'string' ? textOverride : input;
    const hasText = rawInput.trim().length > 0;
    // Allow sending an image on its own (image scan) or with a text caption.
    if (hasText || selectedImage) {
      if (typeof textOverride !== 'string') {
        setInput("");
      }

      let correctedText = "";
      if (hasText) {
        // Apply fuzzy keyword correction followed by LanguageTool grammar check
        const fuzzyText = autoCorrect(rawInput);
        correctedText = await performSentenceCorrection(fuzzyText);

        const userMessage = { id: Date.now(), text: correctedText, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // A live chat is not a request/response loop. The message goes to the
      // ticket, and a reply arrives over the subscription or not at all —
      // nothing is invented in the gap, and the typing dots stay off because
      // they would be a claim about a person who may not be at their desk.
      if (isLiveAgentChat) {
        if (!liveTicket) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), text: "That message didn't reach the support desk — the chat isn't connected. Turn the Human agent switch off and on again to reopen it.", sender: "ai" },
          ]);
          return;
        }
        if (selectedImage) {
          // Photos need a storage bucket the live path does not have yet.
          // Saying so beats a silent drop, or a fake "I can see it".
          setSelectedImage(null);
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), text: "Photos can't go to a live agent yet — describe what you're seeing and they'll ask for anything else they need. (The AI Plant Doctor can look at photos.)", sender: "ai" },
          ]);
        }
        if (!correctedText) return;
        try {
          const sent = await sendLiveMessage(liveTicket.id, correctedText);
          if (sent) seenLiveIds.current.add(sent.id);
        } catch (err) {
          console.error("Could not send the live chat message:", err);
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), text: "That message didn't send. Check your connection and try again — nothing was lost from what you typed above.", sender: "ai" },
          ]);
        }
        return;
      }

      setIsTyping(true);

      let aiResponseObject = { text: "", nextStep: 'initial' };
      // Slightly longer delay when scanning an image to simulate analysis.
      let responseDelay = 1000;
      // Set to the 429 when the daily AI allowance runs out. Held until the
      // reply has rendered so the composer locks and the upgrade modal opens
      // *after* the explanation is on screen — a box that dies and a modal that
      // appears with no visible reason both just read as the chat breaking.
      let quotaError = null;

      if (selectedImage) {
        const imageUrl = URL.createObjectURL(selectedImage);
        const imageMessage = { id: Date.now() + 0.5, imageUrl, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, imageMessage]);
        setSelectedImage(null); // Clear selected image after sending

        if (currentBot === 'plantDoctor') {
          // Ask the real vision model to look at the photo. If that is
          // unavailable — signed out, quota spent, key missing — fall back to
          // the admin-curated Disease Library so a scan still returns
          // something, exactly as it did before there was a live model.
          let diagnosis = null;
          if (liveAI) {
            try {
              diagnosis = await scanPlantImage({ file: selectedImage, note: correctedText });
              responseDelay = 300; // the round-trip already was the wait
            } catch (err) {
              if (err.quotaExceeded) {
                aiResponseObject.text = err.message;
                aiResponseObject.nextStep = 'initial';
                responseDelay = 300;
                quotaError = err;
              } else {
                console.warn("Live plant scan unavailable, using the offline library:", err);
              }
            }
          }
          // Out of quota is NOT a case for the offline library: handing back a
          // random diagnosis would bury the upgrade message and, worse, show a
          // fabricated result as if the photo had really been analysed.
          if (!diagnosis && !quotaError) {
            diagnosis = plantDiseases && plantDiseases.length > 0
              ? diagnosisFromLibrary(plantDiseases[Math.floor(Math.random() * plantDiseases.length)])
              : PLANT_SCAN_DIAGNOSES[Math.floor(Math.random() * PLANT_SCAN_DIAGNOSES.length)];
            responseDelay = 2200; // emulate scanning time
          }
          if (diagnosis) {
            aiResponseObject.text = formatScanResult(diagnosis);
            aiResponseObject.nextStep = 'initial';
          }

          // Every scan lands in the Admin Portal's AI Plant Doctor records.
          if (diagnosis && onScanComplete) {
            onScanComplete({
              id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
              plant: diagnosis.plantName,
              disease: diagnosis.condition,
              confidence: diagnosis.confidence,
              user: loggedInUser || "Website User",
              status: diagnosis.severity === "High" ? "Critical" : "Disease Detected",
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              recommendation: diagnosis.recommendations[0],
            });
          }
        } else {
          aiResponseObject.text = "Thanks for the image! I'm reviewing it. For a full plant scan and diagnosis, switch to the AI Plant Doctor. How else can I help with EcoEquity?";
          aiResponseObject.nextStep = 'initial';
        }
      } else {
        if (conversationStep === 'awaitingContactAndConcern') {
          // Assuming user provides name, contact, and concern in one message
          const fullDetails = correctedText;
          // A very basic attempt to extract name and contact for a more personalized message
          const nameMatch = fullDetails.match(/(my name is|i am)\s+([a-zA-Z\s]+?)(?:,|\.|$)/i);
          const extractedName = nameMatch && nameMatch[2] ? nameMatch[2].trim() : 'valued customer';

          // The same real hand-off as the Human agent switch. What they just
          // typed becomes both the ticket subject and its first message, so the
          // details they were asked for are not collected and then thrown away.
          const handoff = await startLiveChat({ subject: fullDetails, firstMessage: fullDetails, history: messages });

          aiResponseObject.text = handoff.ok
            ? `Thank you, ${extractedName}! ${handoff.text}`
            : handoff.text;
          aiResponseObject.nextStep = handoff.ok ? 'liveAgentActive' : 'initial';
          aiResponseObject.asAgent = handoff.ok;

          // Clear the input field after sending details to agent
          setInput("");

        } else {
          // The keyword bot answers first, and its escalation paths win
          // outright: anything that moves conversationStep off 'initial' is a
          // local handoff flow (collecting a name, opening a live agent chat),
          // and routing a user to a human must never depend on a model call.
          // Everything else is an ordinary question the live AI answers better.
          const offline = currentBot === 'plantDoctor'
            ? getPlantDoctorAIResponse(correctedText)
            : getGeneralAIResponse(correctedText);
          aiResponseObject = offline;

          if (liveAI && (offline.nextStep || 'initial') === 'initial') {
            try {
              // `messages` is the history before this turn; askAI appends the
              // new text itself.
              const reply = await askAI({ bot: currentBot, history: messages, text: correctedText });
              aiResponseObject = { text: reply, nextStep: 'initial' };
              responseDelay = 300;
            } catch (err) {
              if (err.quotaExceeded) {
                // Say why, in the bot's own voice, instead of silently
                // dropping to the keyword bot as if nothing happened.
                aiResponseObject = { text: err.message, nextStep: 'initial' };
                responseDelay = 300;
                quotaError = err;
              } else if (err.providerLimited) {
                // Shared allowance, not this user's. Say it, then let the
                // keyword bot carry on — no composer lock, since the quota is
                // site-wide and may come back before the user's next message.
                aiResponseObject = { text: err.message, nextStep: 'initial' };
                responseDelay = 300;
              } else {
                console.warn(
                  "Live AI unavailable, using the offline bot:",
                  err.detail || err.message,
                  err,
                );
              }
            }
          }
        }
      } 

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: aiResponseObject.text,
          // `asAgent` rather than isLiveAgentChat: the hand-off above sets that
          // state in this same tick, so the closure here still reads the old
          // false and would draw the welcome as an AI bubble.
          sender: aiResponseObject.asAgent ? "agent" : "ai",
        };
        // If an image was sent, the AI's response should follow the image message.
        // If only text was sent, the AI's response follows the text message.
        // The current logic correctly appends the AI response after the user's last message (text or image).
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setIsTyping(false);
        setConversationStep(aiResponseObject.nextStep || 'initial'); // Update conversation step

        // Lock the composer in the same frame the refusal appears, so the
        // notice above the input and the dead text box explain each other.
        if (quotaError) applyQuotaLock(quotaError);

        // Surface the plans once the user has read WHY they are being asked to
        // upgrade. The short beat lets the explanation land first. Pointless
        // while plans cannot be bought — a "coming soon" modal the user did not
        // ask for is just an interruption.
        if (quotaError && SUBSCRIPTIONS_ENABLED) {
          setTimeout(() => setShowProModal(true), 1200);
        }
      }, responseDelay);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Card and e-wallet details are collected by PayMongo's own hosted checkout,
  // never by this form — handling raw card numbers ourselves would drag the
  // whole site into PCI scope. So the fields below no longer gate anything and
  // the button waits only on the redirect being in flight.
  const isPayButtonDisabled = isProcessing;

  const planId = selectedPlan === 'Enterprise' ? 'PLAN-ENTERPRISE' : 'PLAN-PRO';
  const planPrice = selectedPlan === 'Enterprise'
    ? (billingCycle === 'Monthly' ? 1499 : 14390)
    : (billingCycle === 'Monthly' ? 499 : 4790);

  // Hands off to PayMongo. On success the browser leaves this page entirely, so
  // anything after the await only runs when the checkout could not be started.
  const handleSubscribe = async () => {
    setPaymentError("");
    setIsProcessing(true);
    try {
      await startSubscription({
        planId,
        planName: `EcoEquity ${selectedPlan} — ${billingCycle}`,
        price: planPrice,
      });
    } catch (err) {
      console.warn("Could not start checkout:", err);
      setPaymentError(err?.message || "Could not start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  // The composer can send when there's text typed or an image staged — and
  // when today's allowance has not run out.
  const canSend = (input.trim().length > 0 || !!selectedImage) && !composerLocked;

  // The chat docks to the corner like SiteFeedbackWidget rather than taking the
  // screen over — no scrim, so the page stays readable and usable behind it.
  return ReactDOM.createPortal(
    <>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          ...aiChatStyles.chatContainer,
          ...(isMobile ? aiChatStyles.chatContainerMobile : {}),
          opacity: isOpen ? 1 : 0,
        }}
      >
        <style>
          {`
            @keyframes typingBounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-6px); }
            }
            .typing-dot {
              width: 6px;
              height: 6px;
              background-color: var(--eco-c11);
              border-radius: 50%;
              animation: typingBounce 1.4s infinite ease-in-out both;
            }
            @keyframes rotateIn3D {
              0% { opacity: 0; transform: perspective(1200px) rotateX(25deg) translateY(30px) scale(0.9); }
              100% { opacity: 1; transform: perspective(1200px) rotateX(0) translateY(0) scale(1); }
            }
            @keyframes pulseBadge {
              0% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(var(--eco-c7-rgb), 0.3); }
              50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 6px 16px rgba(var(--eco-c7-rgb), 0.5); }
              100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(var(--eco-c7-rgb), 0.3); }
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
            @keyframes backgroundFadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes modalFadeIn {
              0% { opacity: 0; transform: scale(0.95) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes spinFade {
              0% { transform: rotate(0deg); opacity: 1; }
              50% { opacity: 0.5; }
              100% { transform: rotate(360deg); opacity: 1; }
            }
            .ring-spinner {
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: #ffffff;
              animation: spinFade 1s linear infinite;
            }
          `}
        </style>
        <div style={aiChatStyles.chatHeader}>
          <div style={aiChatStyles.headerTop}>
            <div style={aiChatStyles.headerText}>
              <span style={aiChatStyles.statusPill}>
                <span style={aiChatStyles.statusDot} />
                Online
              </span>
              <h3 style={aiChatStyles.chatTitle}>
                {currentBot === 'general' ? 'EcoEquityBot AI' : 'AI Plant Doctor'}
              </h3>
            </div>
            <button onClick={onClose} aria-label="Close chat" style={aiChatStyles.closeButton}>
              &times;
            </button>
          </div>

          {/* The panel is only ~370px wide, so the controls get their own row
              instead of competing with the title. */}
          <div style={aiChatStyles.headerActions}>
            <button onClick={handleToggleBot} style={aiChatStyles.toggleBotButton}>
              {currentBot === 'general' ? 'Plant Doctor' : 'General AI'}
            </button>

            <button
              type="button"
              onClick={handleHumanAgentToggle}
              disabled={liveConnecting}
              style={{
                ...aiChatStyles.agentSwitch,
                ...(isLiveAgentChat ? aiChatStyles.agentSwitchActive : {}),
                ...(liveConnecting ? { opacity: 0.6, cursor: "wait" } : {}),
              }}
              aria-pressed={isLiveAgentChat}
            >
              <span
                style={{
                  ...aiChatStyles.agentSwitchTrack,
                  ...(isLiveAgentChat ? aiChatStyles.agentSwitchTrackActive : {}),
                }}
              >
                <span
                  style={{
                    ...aiChatStyles.agentSwitchThumb,
                    ...(isLiveAgentChat ? aiChatStyles.agentSwitchThumbActive : {}),
                  }}
                />
              </span>
              {liveConnecting ? "Connecting…" : "Human agent"}
            </button>

            {activePlan === 'Basic' ? (
              <button
                type="button"
                style={aiChatStyles.upgradeProBtn}
                onClick={() => setShowProModal(true)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--eco-c7-rgb), 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--eco-c7-rgb), 0.2)'; }}
              >
                <Sparkles size={12} color="#ffffff" /> Go Pro
              </button>
            ) : (
              <span
                style={{
                  ...aiChatStyles.planBadge,
                  ...(activePlan === 'Enterprise' ? aiChatStyles.planBadgeEnterprise : aiChatStyles.planBadgePro),
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {activePlan}
              </span>
            )}
          </div>
        </div>
        {/* -------------------------------------------------------------
            Who you are talking to.

            Pinned under the header rather than posted into the thread: an
            agent's presence changes while you are typing, and a message that
            said "Online" ten minutes ago is a claim the panel can no longer
            stand behind. A strip can be corrected; a bubble cannot.
            ------------------------------------------------------------- */}
        {isLiveAgentChat && liveInfo && (
          <div style={aiChatStyles.agentStrip}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: agentPresence(liveInfo).dot }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c19)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {liveInfo.agentName || "Waiting for an agent"}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                    {agentPresence(liveInfo).label}
                  </span>
                </div>
                {/* Only once there is a change to describe. On a first
                    assignment "previous agent: none" is noise. */}
                {liveInfo.previousAgentName && liveInfo.previousAgentName !== liveInfo.agentName && (
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "rgba(0,0,0,0.42)", marginTop: "2px" }}>
                    Previously: {liveInfo.previousAgentName}
                  </div>
                )}
              </div>
              {liveInfo.ref && (
                <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(0,0,0,0.35)", flexShrink: 0 }}>{liveInfo.ref}</span>
              )}
            </div>
            {conversationStatusLine(liveInfo) && (
              <div style={{
                marginTop: "8px", padding: "7px 10px", borderRadius: "10px",
                fontSize: "11.5px", fontWeight: 700, lineHeight: 1.4,
                background: STATUS_TONES[conversationStatusLine(liveInfo).tone].bg,
                color: STATUS_TONES[conversationStatusLine(liveInfo).tone].fg,
              }}>
                {conversationStatusLine(liveInfo).text}
              </div>
            )}
          </div>
        )}

        <div style={aiChatStyles.messagesContainer} className="slim-scroll">
          {/* -------------------------------------------------------------
              Welcome back.

              Offered, never taken automatically. Someone who opens the panel
              to ask the AI a quick question should not find themselves back
              inside last week's support conversation — but someone who came
              back FOR that conversation should reach it in one tap.
              ------------------------------------------------------------- */}
          {showResumePrompt && !isLiveAgentChat && liveInfo && (
            <div style={aiChatStyles.resumeCard}>
              {liveInfo.previousAgentName && liveInfo.previousAgentName !== liveInfo.agentName ? (
                <>
                  <div style={aiChatStyles.resumeTitle}>👋 Your agent has changed.</div>
                  <div style={aiChatStyles.resumeBody}>
                    Your previous agent was {liveInfo.previousAgentName}. Your conversation is now
                    with {liveInfo.agentName || "another agent"}, who will continue assisting you.
                  </div>
                </>
              ) : liveInfo.liveStatus === "closed" || liveInfo.liveStatus === "rejected" ? (
                <>
                  <div style={aiChatStyles.resumeTitle}>💬 Welcome back!</div>
                  <div style={aiChatStyles.resumeBody}>
                    Your last conversation{liveInfo.agentName ? ` with ${liveInfo.agentName}` : ""} was closed.
                    You can reopen it and pick up where you left off.
                  </div>
                </>
              ) : (
                <>
                  <div style={aiChatStyles.resumeTitle}>💬 Welcome back!</div>
                  <div style={aiChatStyles.resumeBody}>
                    You have an existing conversation
                    {liveInfo.agentName ? ` with ${liveInfo.agentName}, your support agent` : " with our support team"}.
                    Would you like to continue where you left off?
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleContinueConversation}
                  disabled={resumeBusy}
                  style={{ ...aiChatStyles.resumePrimaryBtn, ...(resumeBusy ? { opacity: 0.6, cursor: "wait" } : {}) }}
                >
                  {resumeBusy ? "Opening…" : "Continue Conversation"}
                </button>
                <button
                  onClick={handleStartNewRequest}
                  disabled={resumeBusy}
                  style={{ ...aiChatStyles.resumeSecondaryBtn, ...(resumeBusy ? { opacity: 0.6, cursor: "wait" } : {}) }}
                >
                  Start New Request
                </button>
              </div>
              <button onClick={() => setShowResumePrompt(false)} style={aiChatStyles.resumeDismissBtn}>
                Not now
              </button>
            </div>
          )}
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto', gap: '20px' }}>
              <p style={aiChatStyles.welcomeMessage}>
                {currentBot === 'general'
                  ? "Hi there! I'm EcoEquityBot AI, your dedicated assistant from EcoEquity. How can I assist you with our agricultural innovations and platform today?"
                  : isLiveAgentChat
                    ? `You are connected with a Live Support Agent. Please continue your conversation.`
                    : "Hello! I'm your AI Plant Doctor. Tap Scan Plant to send a photo of the affected leaves and I'll return a full diagnosis, or just describe the symptoms you're seeing."
                }
              </p>
              <div style={aiChatStyles.quickPromptsContainer}>
                {(QUICK_PROMPTS[currentBot] || QUICK_PROMPTS.general).map((prompt, i) => (
                  <button
                    key={i}
                    disabled={composerLocked}
                    style={{ ...aiChatStyles.quickPromptBtn, ...(composerLocked ? aiChatStyles.controlDisabled : {}) }}
                    onClick={() => handleSendMessage(prompt)}
                    onMouseEnter={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'rgba(var(--eco-c11-rgb), 0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { if (composerLocked) return; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...aiChatStyles.messageBubble,
                ...(isMobile ? aiChatStyles.messageBubbleMobile : {}),
                ...(msg.sender === "user"
                  ? aiChatStyles.userMessage
                  : msg.sender === "agent" ? aiChatStyles.agentMessage : aiChatStyles.aiMessage), // Differentiate agent messages
              }}
            >
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="User uploaded" style={aiChatStyles.uploadedImage} />
              )}
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ ...aiChatStyles.messageBubble, ...aiChatStyles.aiMessage, display: 'flex', alignItems: 'center', gap: '4px', padding: '16px' }}>
              <div className="typing-dot"></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {composerLocked && (
          // Sits directly above the dead composer, because that is the thing it
          // explains. A message bubble alone would scroll away and leave the
          // user staring at an input that no longer takes anything.
          <div style={aiChatStyles.quotaNotice} role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <div>
              <strong style={aiChatStyles.quotaNoticeTitle}>
                {quotaLock.limit
                  ? `Daily limit reached — ${quotaLock.limit} AI messages`
                  : "Daily AI message limit reached"}
              </strong>
              <span style={aiChatStyles.quotaNoticeBody}>
                Chat is paused until your allowance resets {formatQuotaReset(quotaLock.resetsAt)}.
              </span>
            </div>
          </div>
        )}
        <div style={{ ...aiChatStyles.inputContainer, ...(isMobile ? aiChatStyles.inputContainerMobile : {}) }}>
          <button
            type="button"
            disabled={composerLocked}
            style={{ ...aiChatStyles.iconButton, ...(isMobile ? aiChatStyles.iconButtonMobile : {}), ...(composerLocked ? aiChatStyles.controlDisabled : {}) }}
            aria-label="Voice input"
            onMouseEnter={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--eco-c11)'; }}
            onMouseLeave={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          {currentBot === 'plantDoctor' ? (
            <button
              type="button"
              onClick={() => document.getElementById('imageUploadInput').click()}
              disabled={composerLocked}
              style={{ ...aiChatStyles.scanButton, ...(isMobile ? aiChatStyles.scanButtonMobile : {}), ...(composerLocked ? aiChatStyles.controlDisabled : {}) }}
              aria-label="Scan a plant photo"
              title={composerLocked ? "Daily AI limit reached" : "Scan a plant photo for instant diagnosis"}
              onMouseEnter={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'rgba(var(--eco-c11-rgb), 0.18)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'rgba(var(--eco-c11-rgb), 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              {isMobile ? "Scan" : "Scan Plant"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById('imageUploadInput').click()}
              disabled={composerLocked}
              style={{ ...aiChatStyles.iconButton, ...(isMobile ? aiChatStyles.iconButtonMobile : {}), ...(composerLocked ? aiChatStyles.controlDisabled : {}) }}
              aria-label="Upload image"
              title={composerLocked ? "Daily AI limit reached" : "Upload an image"}
              onMouseEnter={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--eco-c11)'; }}
              onMouseLeave={(e) => { if (composerLocked) return; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          )}
          <textarea
            ref={textareaRef}
            className="slim-scroll"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            disabled={composerLocked}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(var(--eco-c11-rgb), 0.55)";
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--eco-c11-rgb), 0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.boxShadow = "none";
            }}
            // Kept short deliberately: the box is one row tall, and anything
            // longer wraps and gets clipped. The reset time is in the notice
            // directly above.
            placeholder={composerLocked
              ? "Daily message limit reached"
              : (isLiveAgentChat
                ? "Type your message to the live agent..." : (currentBot === 'general' ? "Ask about EcoEquity..." : "Ask about your plants..."))}
            style={{ ...aiChatStyles.chatInput, ...(composerLocked ? aiChatStyles.chatInputLocked : {}) }}
          />
          <input
            type="file"
            id="imageUploadInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {selectedImage && (
            <div style={aiChatStyles.imagePreviewContainer}>
              <img src={URL.createObjectURL(selectedImage)} alt="Preview" style={aiChatStyles.imagePreview} />
              <button onClick={() => setSelectedImage(null)} style={aiChatStyles.clearImageButton}>&times;</button>
            </div>
          )}
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            style={{
              ...aiChatStyles.sendButton,
              ...(isMobile ? aiChatStyles.sendButtonMobile : {}),
              ...(canSend ? {} : aiChatStyles.sendButtonDisabled),
            }}
            aria-label="Send message"
            title={composerLocked ? "Daily AI limit reached" : undefined}
            onMouseEnter={(e) => { if (!canSend) return; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
            onMouseLeave={(e) => { if (!canSend) return; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

{showProModal && ReactDOM.createPortal(
        <div style={modalOverlay(MODAL_LAYER.nested)}
        onClick={() => setShowProModal(false)}>
          <div style={{ 
            background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))", 
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: "24px", 
            padding: isMobile ? "20px" : "32px 24px", 
            maxWidth: "720px", 
            width: "100%", 
            maxHeight: "90vh", 
            overflowY: "auto", 
            position: "relative", 
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)", 
            animation: "scaleUp 0.3s ease-out" 
          }}
          onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>&times;</button>

            {!SUBSCRIPTIONS_ENABLED && (
              <div style={{ margin: "8px 0 18px", padding: "12px 14px", borderRadius: "14px", background: "rgba(var(--eco-c7-rgb), 0.1)", border: "1px solid rgba(var(--eco-c7-rgb), 0.25)", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--eco-c13)", marginBottom: "2px" }}>Paid plans are coming soon</div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "#475569", lineHeight: 1.5 }}>
                  While we finish setting up payments, the AI assistant and Plant Doctor are free for every EcoEquity member. Here is what the plans will include.
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(var(--eco-c7-rgb), 0.2), rgba(var(--eco-c9-rgb), 0.1))", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px" }}><Sparkles size="1em" color="var(--eco-c7)" /></span>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: isMobile ? "18px" : "22px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Upgrade to Pro</h2>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)", maxWidth: "450px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Unlock advanced AI features, 24/7 Plant Doctor access, priority support, and specialized EcoEquity tools.</p>
              
              <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "999px" }}>
                <button onClick={() => setBillingCycle('Monthly')} style={{ padding: "6px 16px", borderRadius: "999px", border: "none", background: billingCycle === 'Monthly' ? "#ffffff" : "transparent", color: billingCycle === 'Monthly' ? "#000" : "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: billingCycle === 'Monthly' ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s ease" }}>Monthly</button>
                <button onClick={() => setBillingCycle('Yearly')} style={{ padding: "6px 16px", borderRadius: "999px", border: "none", background: billingCycle === 'Yearly' ? "#ffffff" : "transparent", color: billingCycle === 'Yearly' ? "#000" : "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: billingCycle === 'Yearly' ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s ease" }}>Yearly <span style={{ color: "var(--eco-c13)", fontSize: "10px", marginLeft: "4px", background: "rgba(var(--eco-c9-rgb), 0.1)", padding: "2px 6px", borderRadius: "999px" }}>Save 20%</span></button>
              </div>
            </div>

            <div className="slim-scroll" style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? "none" : "repeat(3, 1fr)", gap: "16px", overflowX: isMobile ? "auto" : "visible", scrollSnapType: isMobile ? "x mandatory" : "none", paddingBottom: isMobile ? "8px" : "0" }}>
              {/* Basic Plan */}
              <div onClick={() => setSelectedPlan('Basic')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: selectedPlan === 'Basic' ? "1px solid var(--eco-c9)" : "1px solid rgba(0,0,0,0.08)", background: selectedPlan === 'Basic' ? "rgba(var(--eco-c9-rgb), 0.03)" : "#ffffff", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Basic' ? "0 0 0 3px rgba(var(--eco-c9-rgb), 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Basic' ? "0 0 0 3px rgba(var(--eco-c9-rgb), 0.2), 0 16px 32px rgba(0,0,0,0.12)" : "0 12px 24px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Basic' ? "0 0 0 3px rgba(var(--eco-c9-rgb), 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none"; }}>
                {selectedPlan === 'Basic' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--eco-c9)", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(var(--eco-c9-rgb), 0.3)", animation: "scaleUp 0.2s ease-out" }}><Check size="1em" /></div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#000" }}>Basic</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For casual gardeners and beginners.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? 'Free' : 'Free'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>Forever</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> General AI Chat</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Community Access</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}><X size="1em" /></span> 24/7 Plant Doctor</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}><X size="1em" /></span> Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}><X size="1em" /></span> Priority Support</li>
                </ul>
                <button disabled style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c19)", fontWeight: 700, fontSize: "13px", cursor: "not-allowed", transition: "all 0.2s ease", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", opacity: 0.7 }}>Current Plan</button>
              </div>

              {/* Pro Plan */}
              <div onClick={() => setSelectedPlan('Pro')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: "2px solid var(--eco-c7)", background: selectedPlan === 'Pro' ? "linear-gradient(145deg, rgba(var(--eco-c7-rgb), 0.1), rgba(255,255,255,1))" : "linear-gradient(145deg, rgba(var(--eco-c7-rgb), 0.05), rgba(255,255,255,1))", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Pro' ? "0 0 0 4px rgba(var(--eco-c7-rgb), 0.3), 0 12px 24px rgba(var(--eco-c7-rgb), 0.2)" : "0 8px 16px rgba(var(--eco-c7-rgb), 0.15)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Pro' ? "0 0 0 4px rgba(var(--eco-c7-rgb), 0.3), 0 16px 32px rgba(var(--eco-c7-rgb), 0.3)" : "0 16px 32px rgba(var(--eco-c7-rgb), 0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Pro' ? "0 0 0 4px rgba(var(--eco-c7-rgb), 0.3), 0 12px 24px rgba(var(--eco-c7-rgb), 0.2)" : "0 8px 16px rgba(var(--eco-c7-rgb), 0.15)"; }}>
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", color: "#ffffff", padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.3)", animation: "pulseBadge 2s infinite ease-in-out" }}>Most Popular</div>
                {selectedPlan === 'Pro' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--eco-c9)", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(var(--eco-c9-rgb), 0.3)", animation: "scaleUp 0.2s ease-out" }}><Check size="1em" /></div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "var(--eco-c13)" }}>Pro</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.4 }}>For serious growers & urban farmers.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? '₱499' : '₱4,790'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>
                  per {billingCycle === 'Monthly' ? 'month' : 'year, billed annually'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Unlimited AI Chat</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> 24/7 AI Plant Doctor</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Advanced Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Priority Support</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}><X size="1em" /></span> API Access</li>
                </ul>
                <button disabled={!SUBSCRIPTIONS_ENABLED} onClick={(e) => { e.stopPropagation(); if (!SUBSCRIPTIONS_ENABLED) return; setShowProModal(false); setShowPaymentModal(true); }} style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: SUBSCRIPTIONS_ENABLED ? "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))" : "#94a3b8", color: SUBSCRIPTIONS_ENABLED ? "var(--eco-c19)" : "#ffffff", fontWeight: 800, fontSize: "13px", cursor: SUBSCRIPTIONS_ENABLED ? "pointer" : "not-allowed", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>{SUBSCRIPTIONS_ENABLED ? "Choose Pro" : "Coming Soon"}</button>
              </div>

              {/* Enterprise Plan */}
              <div onClick={() => setSelectedPlan('Enterprise')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: selectedPlan === 'Enterprise' ? "1px solid var(--eco-c7)" : "1px solid rgba(0,0,0,0.08)", background: selectedPlan === 'Enterprise' ? "rgba(var(--eco-c7-rgb), 0.03)" : "#ffffff", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(var(--eco-c7-rgb), 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(var(--eco-c7-rgb), 0.2), 0 16px 32px rgba(0,0,0,0.12)" : "0 12px 24px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(var(--eco-c7-rgb), 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none"; }}>
                {selectedPlan === 'Enterprise' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--eco-c7)", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(var(--eco-c7-rgb), 0.3)", animation: "scaleUp 0.2s ease-out" }}><Check size="1em" /></div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "var(--eco-c13)" }}>Enterprise</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For commercial farms & businesses.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? '₱1,499' : '₱14,390'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>
                  per {billingCycle === 'Monthly' ? 'month' : 'year, billed annually'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Everything in Pro</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Dedicated Human Agent</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> 24/7 VIP Phone Support</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Custom API Access</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "var(--eco-c13)", fontSize: "12px" }}><Check size="1em" /></span> Team Analytics Dashboard</li>
                </ul>
<button disabled={!SUBSCRIPTIONS_ENABLED} onClick={(e) => { e.stopPropagation(); if (!SUBSCRIPTIONS_ENABLED) return; setShowProModal(false); setShowPaymentModal(true); }} style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: SUBSCRIPTIONS_ENABLED ? "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))" : "#94a3b8", color: "#ffffff", fontWeight: 800, fontSize: "13px", cursor: SUBSCRIPTIONS_ENABLED ? "pointer" : "not-allowed", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>{SUBSCRIPTIONS_ENABLED ? "Choose Enterprise" : "Coming Soon"}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showPaymentModal && ReactDOM.createPortal(
        <div style={modalOverlay(MODAL_LAYER.nested)}
        onClick={() => setShowPaymentModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "24px" : "40px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out" }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>&times;</button>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: "32px" }}>
              {/* Left Column: Order Summary */}
              <div style={{ display: "flex", flexDirection: "column", order: isMobile ? 1 : 1 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Order Summary</h3>
                <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", boxShadow: "0 4px 12px rgba(var(--eco-c9-rgb), 0.3)" }}><Sparkles size="1em" color="var(--eco-c7)" /></div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{selectedPlan} Plan</div>
                      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{billingCycle} Billing</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#475569" }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{selectedPlan === 'Enterprise' ? (billingCycle === 'Monthly' ? '₱1,499.00' : '₱17,988.00') : (billingCycle === 'Monthly' ? '₱499.00' : '₱5,988.00')}</span>
                  </div>
                  {billingCycle === 'Yearly' && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "var(--eco-c13)" }}>
                      <span>Annual Discount (20%)</span>
                      <span style={{ fontWeight: 600 }}>-{selectedPlan === 'Enterprise' ? '₱3,598.00' : '₱1,198.00'}</span>
                    </div>
                  )}
                  <div style={{ height: "1px", background: "#e2e8f0", margin: "20px 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#000" }}>Total Due</span>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--eco-c13)" }}>{selectedPlan === 'Enterprise' ? (billingCycle === 'Monthly' ? '₱1,499.00' : '₱14,390.00') : (billingCycle === 'Monthly' ? '₱499.00' : '₱4,790.00')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", order: isMobile ? 2 : 2 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Payment Method</h3>
                
                <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
                  {['Credit Card', 'GCash', 'Maya'].map(method => (
                    <button 
                      key={method} 
                      type="button" 
                      onClick={() => setPaymentMethod(method)}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: "8px", border: "none", background: paymentMethod === method ? "#ffffff" : "transparent", color: paymentMethod === method ? "var(--eco-c13)" : "#64748b", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: paymentMethod === method ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Credit Card' ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cardholder Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" value={paymentForm.name} onChange={e => setPaymentForm({...paymentForm, name: e.target.value})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "var(--eco-c9)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Card Number</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()})} style={{ width: "100%", padding: "14px 16px", paddingRight: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "var(--eco-c9)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                        <svg style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" maxLength="5" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value.replace(/\W/gi, '').replace(/(.{2})/, '$1/').trim()})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "var(--eco-c9)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>CVC</label>
                        <input type="text" placeholder="123" maxLength="4" value={paymentForm.cvc} onChange={e => setPaymentForm({...paymentForm, cvc: e.target.value.replace(/\W/gi, '')})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "var(--eco-c9)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ padding: "16px", background: paymentMethod === 'GCash' ? "var(--eco-c0)" : "var(--eco-c1)", borderRadius: "12px", border: paymentMethod === 'GCash' ? "1px solid var(--eco-c5)" : "1px solid var(--eco-c4)", display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}><Smartphone size="1em" /></div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: paymentMethod === 'GCash' ? "var(--eco-c13)" : "var(--eco-c13)" }}>Pay with {paymentMethod}</div>
                        <div style={{ fontSize: "12px", color: paymentMethod === 'GCash' ? "var(--eco-c13)" : "var(--eco-c13)", fontWeight: 500, marginTop: "2px" }}>Enter your {paymentMethod} account details below.</div>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Number</label>
                      <input type="text" placeholder="e.g. 0912 345 6789" maxLength="13" value={mobilePaymentForm.mobileNumber} onChange={e => setMobilePaymentForm({...mobilePaymentForm, mobileNumber: e.target.value.replace(/\W/gi, '').replace(/(.{4})/, '$1 ').replace(/(.{8})/, '$1 ').trim()})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = paymentMethod === 'GCash' ? "var(--eco-c7)" : "var(--eco-c8)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Account Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" value={mobilePaymentForm.accountName} onChange={e => setMobilePaymentForm({...mobilePaymentForm, accountName: e.target.value})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = paymentMethod === 'GCash' ? "var(--eco-c7)" : "var(--eco-c8)"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleSubscribe}
                  disabled={isPayButtonDisabled}
                  style={{ width: "100%", padding: "16px", marginTop: "12px", borderRadius: "12px", border: isPayButtonDisabled ? "none" : "1px solid rgba(255,255,255,0.35)", background: isPayButtonDisabled ? "#94a3b8" : "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: isPayButtonDisabled ? "#ffffff" : "var(--eco-c19)", fontWeight: 800, fontSize: "15px", cursor: isPayButtonDisabled ? "not-allowed" : "pointer", boxShadow: isPayButtonDisabled ? "none" : "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onMouseEnter={(e) => { if(!isPayButtonDisabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; } }}
                  onMouseLeave={(e) => { if(!isPayButtonDisabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; } }}
                >
                  {isProcessing ? (
                    <>
                      <div className="ring-spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Pay ₱{planPrice.toLocaleString()}
                    </>
                  )}
                </button>
                {paymentError && (
                  <div role="alert" style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(220,38,38,0.08)", color: "#b91c1c", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
                    {paymentError}
                  </div>
                )}
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Payments are secure and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showPaymentSuccess && ReactDOM.createPortal(
        <div style={modalOverlay(MODAL_LAYER.nestedConfirm)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "32px 24px" : "40px", maxWidth: "380px", width: "100%", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: selectedPlan === 'Enterprise' ? "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))" : "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: selectedPlan === 'Enterprise' ? "0 8px 16px rgba(var(--eco-c7-rgb), 0.3)" : "0 8px 16px rgba(var(--eco-c7-rgb), 0.3)", animation: "checkmarkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "successDraw 0.6s ease-out 0.2s both" }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Payment Successful!</h2>
            <p style={{ margin: "0 0 32px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>You are now successfully subscribed to the <strong style={{ color: selectedPlan === 'Enterprise' ? "var(--eco-c13)" : "var(--eco-c13)" }}>{selectedPlan}</strong> plan.</p>
            <button 
              onClick={() => {
                setActivePlan(selectedPlan);
                setShowPaymentSuccess(false);
              }}
              style={{ width: "100%", padding: "14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", color: "var(--eco-c19)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
            >
              Start Using {selectedPlan}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>,
    document.body
  );
}

const aiChatStyles = {
  // Docked corner panel, deliberately matching SiteFeedbackWidget's `panel` —
  // same anchor, width, radius, glass and shadow — so the two widgets read as
  // one family. The FAB handlers in App.js keep only one of them open at a time.
  chatContainer: {
    position: "fixed",
    right: "28px",
    bottom: "112px",
    zIndex: 2200,
    width: "370px",
    height: "min(72vh, 600px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.97), rgba(var(--eco-c0-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "20px",
    boxShadow: "0 24px 50px rgba(var(--eco-c19-rgb), 0.22)",
    backdropFilter: "blur(20px) saturate(170%)",
    WebkitBackdropFilter: "blur(20px) saturate(170%)",
    animation: "scaleUp 0.25s ease",
    color: "#000",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: "opacity 0.25s ease-out",
  },
  chatContainerMobile: {
    right: "clamp(12px, 4vw, 20px)",
    left: "clamp(12px, 4vw, 20px)",
    width: "auto",
    bottom: "calc(clamp(16px, 3dvh, 24px) + 152px)",
    height: "70dvh",
  },
  toggleBotButton: {
    background: "rgba(var(--eco-c11-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c11-rgb), 0.2)",
    color: "var(--eco-c13)",
    fontSize: "10.5px",
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "999px",
    lineHeight: 1,
    flexShrink: 0,
    transition: "background 0.16s ease, transform 0.16s ease",
  },
  chatHeader: {
    padding: "14px 16px 10px",
    borderBottom: "1px solid rgba(var(--eco-c19-rgb), 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flexShrink: 0,
  },
  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    minWidth: 0,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
  },
  upgradeProBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))",
    color: "#ffffff",
    fontSize: "10.5px",
    fontWeight: 800,
    lineHeight: 1,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 8px rgba(var(--eco-c7-rgb), 0.2)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  planBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "10.5px",
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  planBadgePro: {
    background: "rgba(var(--eco-c7-rgb), 0.1)",
    color: "var(--eco-c13)",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.2)",
  },
  planBadgeEnterprise: {
    background: "rgba(var(--eco-c7-rgb), 0.1)",
    color: "var(--eco-c13)",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.2)",
  },
  agentSwitch: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "999px",
    border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
    background: "rgba(255,255,255,0.8)",
    color: "#374151",
    fontSize: "10px",
    fontWeight: 800,
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    lineHeight: 1,
    flexShrink: 0,
    cursor: "pointer",
  },
  agentSwitchActive: {
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.3)",
    color: "var(--eco-c13)",
  },
  agentSwitchTrack: {
    width: "24px",
    height: "14px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.2)",
    position: "relative",
    flexShrink: 0,
    transition: "background 0.16s ease",
  },
  agentSwitchTrackActive: {
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c9))",
  },
  agentSwitchThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
    transition: "transform 0.16s ease",
  },
  agentSwitchThumbActive: {
    transform: "translateX(10px)",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--eco-c13)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "var(--eco-c5)",
    boxShadow: "0 0 12px rgba(var(--eco-c5-rgb), 0.95)",
    display: "inline-block",
  },
  chatTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "0",
    fontFamily: "'Poppins', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "var(--eco-c13)",
  },
  closeButton: {
    flexShrink: 0,
    background: "rgba(var(--eco-c19-rgb), 0.06)",
    border: "none",
    borderRadius: "50%",
    color: "var(--eco-c19)",
    fontSize: "20px",
    lineHeight: 1,
    cursor: "pointer",
    width: "28px",
    height: "28px",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  // Sits between the header and the thread, outside the scroll area on
  // purpose: who you are talking to must not scroll away mid-conversation.
  agentStrip: {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.55)",
    flexShrink: 0,
  },
  resumeCard: {
    padding: "14px",
    borderRadius: "16px",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.25)",
    background: "rgba(var(--eco-c9-rgb), 0.07)",
    marginBottom: "12px",
  },
  resumeTitle: {
    fontSize: "13px",
    fontWeight: 850,
    color: "var(--eco-c19)",
    marginBottom: "5px",
  },
  resumeBody: {
    fontSize: "12px",
    fontWeight: 650,
    lineHeight: 1.5,
    color: "rgba(0,0,0,0.62)",
  },
  resumePrimaryBtn: {
    flex: 1,
    minWidth: "140px",
    padding: "9px 12px",
    borderRadius: "11px",
    border: "none",
    background: "var(--eco-c9)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  resumeSecondaryBtn: {
    flex: 1,
    minWidth: "120px",
    padding: "9px 12px",
    borderRadius: "11px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.85)",
    color: "var(--eco-c19)",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // Deliberately quiet. Dismissing is always available but never the thing the
  // eye lands on — the two real choices are the ones above it.
  resumeDismissBtn: {
    marginTop: "8px",
    padding: 0,
    border: "none",
    background: "none",
    color: "rgba(0,0,0,0.4)",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "underline",
  },
  messagesContainer: {
    flexGrow: 1,
    minHeight: 0,
    padding: "14px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "transparent",
  },
  welcomeMessage: {
    textAlign: "center",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.6,
    maxWidth: "100%",
  },
  quickPromptsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "6px",
    maxWidth: "100%",
  },
  quickPromptBtn: {
    background: "#ffffff",
    border: "1px solid rgba(var(--eco-c11-rgb), 0.2)",
    borderRadius: "999px",
    padding: "7px 12px",
    color: "var(--eco-c13)",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  messageBubble: {
    maxWidth: "88%",
    padding: "10px 13px",
    borderRadius: "16px",
    wordWrap: "break-word",
    fontSize: "13px",
    lineHeight: 1.5,
    whiteSpace: "pre-line",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    color: "var(--eco-c19)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderBottomRightRadius: "4px",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
  },
aiMessage: {
    alignSelf: "flex-start",
    background: "linear-gradient(135deg, rgba(var(--eco-c6-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.15))",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.3)",
    color: "#111827",
    borderBottomLeftRadius: "5px",
    boxShadow: "0 0 18px rgba(var(--eco-c5-rgb), 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
  },
  agentMessage: {
    alignSelf: "flex-start",
    background: "var(--eco-c0)",
    color: "var(--eco-c13)",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.3)",
    borderBottomLeftRadius: "4px",
  },
  messageBubbleMobile: { maxWidth: "92%" },
  inputContainer: {
    padding: "10px 12px 12px",
    borderTop: "1px solid rgba(var(--eco-c19-rgb), 0.08)",
    display: "flex",
    gap: "6px",
    background: "transparent",
    alignItems: "flex-end",
    flexShrink: 0,
  },
  chatInput: {
    flexGrow: 1,
    minWidth: 0,
    padding: "10px 12px",
    borderRadius: "16px",
    border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
    background: "rgba(255,255,255,0.85)",
    color: "#111827",
    fontSize: "13px",
    outline: "none",
    resize: "none",
    maxHeight: "110px",
    overflowY: "auto",
    lineHeight: "1.5",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, background 0.2s",
  },
  sendButton: {
    padding: "10px",
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    color: "var(--eco-c19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    flexShrink: 0,
  },
  sendButtonMobile: { width: "36px", height: "36px" },
  sendButtonDisabled: {
    background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
    color: "#9ca3af",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  // Amber, not red: running out of a daily allowance is a limit being enforced,
  // not something the user got wrong.
  quotaNotice: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    margin: "0 12px",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    color: "#92400e",
    flexShrink: 0,
  },
  quotaNoticeTitle: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  quotaNoticeBody: {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.45,
    opacity: 0.9,
  },
  chatInputLocked: {
    background: "#f3f4f6",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
  // Shared by every composer control the quota lock switches off.
  controlDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "20px",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.2s, color 0.2s",
  },
  iconButtonMobile: { width: "32px", height: "32px" },
  scanButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "0 10px",
    height: "34px",
    width: "auto",
    borderRadius: "999px",
    border: "1px solid rgba(var(--eco-c11-rgb), 0.25)",
    background: "rgba(var(--eco-c11-rgb), 0.1)",
    color: "var(--eco-c13)",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: "background 0.2s, transform 0.2s",
  },
  scanButtonMobile: { height: "32px", padding: "0 9px" },
  uploadedImage: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "10px",
    marginBottom: "8px",
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: "10px",
  },
  imagePreview: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  clearImageButton: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "var(--eco-c7)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
};

export default AIChatInterface;
