import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

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

const QUICK_PROMPTS = [
  "How to fix yellowing leaves?",
  "What is EcoEquity's mission?",
  "Diagnose my plant",
  "Recommend organic fertilizers"
];

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

function AIChatInterface({ onClose, isMobile }) { // Removed autoCorrect and performSentenceCorrection
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State for animation
  const [isTyping, setIsTyping] = useState(false); // State to show typing indicator
  const [currentBot, setCurrentBot] = useState('general'); // 'general' or 'plantDoctor'
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image file
  const [conversationStep, setConversationStep] = useState('initial'); // 'initial', 'awaitingName', 'awaitingContactAndConcern'
  // State for human support escalation
  const [isLiveAgentChat, setIsLiveAgentChat] = useState(false); // To indicate if a live agent is active
  const [showProModal, setShowProModal] = useState(false); // State for Upgrade to Pro modal
      const [activePlan, setActivePlan] = useState('Basic'); // Track the user's active plan
  const [billingCycle, setBillingCycle] = useState('Monthly'); // State for billing cycle in Pro modal
  const [selectedPlan, setSelectedPlan] = useState('Pro'); // State for selected subscription plan
  const [showPaymentModal, setShowPaymentModal] = useState(false); // State for Payment form modal
  const [paymentForm, setPaymentForm] = useState({ name: '', cardNumber: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false); // State for Payment Success pop-up
  const [paymentMethod, setPaymentMethod] = useState('Credit Card'); // State for selected payment method
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
    if (lowerInput.includes("fertilizer") || lowerInput.includes("nutrients")) {
      return { text: "Fertilizers provide essential nutrients for plant growth. Organic options like compost, worm castings, or fish emulsion are excellent choices. The best type and frequency depend on your plant's growth stage and specific needs. What plant are you fertilizing, and what are its current symptoms?", nextStep: 'initial' }; // Educational, Helpful
    }
    if (lowerInput.includes("watering")) {
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
      : "Hello! I'm your AI Plant Doctor, ready to assist you in cultivating healthy plants. Please describe any observations or signs of distress your plants are exhibiting, or tell me what you're growing!"; // Professional, Helpful, Conversational

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

  const handleHumanAgentToggle = () => {
    if (isLiveAgentChat) {
      setIsLiveAgentChat(false);
      setConversationStep('initial');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Live agent connection ended. You are back with the AI assistant.",
          sender: "ai",
        },
      ]);
      return;
    }

    setIsLiveAgentChat(true);
    setConversationStep('liveAgentActive');
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text:
          "You are now connected with a human agriculture specialist. Please type your concern, photos/details you can describe, and your preferred contact information.",
        sender: "agent",
      },
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

  const handleSendMessage = async (textOverride) => {
    const rawInput = typeof textOverride === 'string' ? textOverride : input;
    if (rawInput.trim()) {
      if (typeof textOverride !== 'string') {
        setInput("");
      }
      // Apply fuzzy keyword correction followed by LanguageTool grammar check
      const fuzzyText = autoCorrect(rawInput);
      const correctedText = await performSentenceCorrection(fuzzyText);
      
      const userMessage = { id: Date.now(), text: correctedText, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      setIsTyping(true);

      let aiResponseObject = { text: "", nextStep: 'initial' };

      if (selectedImage) {
        const imageUrl = URL.createObjectURL(selectedImage);
        const imageMessage = { id: Date.now() + 0.5, imageUrl, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, imageMessage]);
        setSelectedImage(null); // Clear selected image after sending

        // Simulate AI response to image
        aiResponseObject.text = currentBot === 'plantDoctor'
          ? "Thank you for sharing the image! I'm analyzing it now to provide the best possible diagnosis for your plant. What symptoms are you observing?"
          : "Thank you for the image! I'm reviewing it. How can I help you with this regarding EcoEquity?";
        aiResponseObject.nextStep = 'initial';
      } else {
        if (isLiveAgentChat) {
          // If already in live agent chat, just simulate agent receiving message
          aiResponseObject.text = `Live Agent: Thank you for your message. I'm reviewing your query now.`;
          aiResponseObject.nextStep = 'liveAgentActive'; // Stay in live agent mode
        } else if (conversationStep === 'awaitingContactAndConcern') {
          // Assuming user provides name, contact, and concern in one message
          const fullDetails = correctedText;
          // A very basic attempt to extract name and contact for a more personalized message
          const nameMatch = fullDetails.match(/(my name is|i am)\s+([a-zA-Z\s]+?)(?:,|\.|$)/i);
          const extractedName = nameMatch && nameMatch[2] ? nameMatch[2].trim() : 'valued customer';

          setIsLiveAgentChat(true); // Activate live agent mode

          aiResponseObject.text = `Thank you, ${extractedName}! We have your details and are now connecting you. Please wait a moment.
          \n\n**You are now connected with a Live Support Agent.**
          \nLive Agent: Hello ${extractedName}, I've received your request regarding "${fullDetails}". How can I further assist you?`;
          aiResponseObject.nextStep = 'liveAgentActive'; // Set a new step for active live agent chat

          // Clear the input field after sending details to agent
          setInput("");

        } else {
          // Simulate AI response
          aiResponseObject = currentBot === 'plantDoctor' ? getPlantDoctorAIResponse(correctedText) : getGeneralAIResponse(correctedText);
        }
      } 

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: aiResponseObject.text,
          sender: isLiveAgentChat ? "agent" : "ai", // Differentiate AI from simulated agent
        };
        // If an image was sent, the AI's response should follow the image message.
        // If only text was sent, the AI's response follows the text message.
        // The current logic correctly appends the AI response after the user's last message (text or image).
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setIsTyping(false);
        setConversationStep(aiResponseObject.nextStep || 'initial'); // Update conversation step
      }, 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isFormValid = paymentMethod === 'Credit Card' 
    ? paymentForm.name.trim() !== '' && paymentForm.cardNumber.trim() !== '' && paymentForm.expiry.trim() !== '' && paymentForm.cvc.trim() !== ''
    : mobilePaymentForm.mobileNumber.trim() !== '' && mobilePaymentForm.accountName.trim() !== '';
    
  const isPayButtonDisabled = isProcessing || !isFormValid;

  return (
    <div style={{ ...aiChatStyles.overlay, ...(isMobile ? aiChatStyles.overlayMobile : {}) }}> {/* Removed onClick={onClose} to prevent closing on overlay click */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          ...aiChatStyles.chatContainer,
          // The chatContainer itself should not close the chat when clicked
          ...(isMobile ? aiChatStyles.chatContainerMobile : {}), // Apply mobile styles
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.95)",
        }}
      >
        <style>
          {`
            .slim-scroll::-webkit-scrollbar {
              width: 5px;
            }
            .slim-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .slim-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.15);
              border-radius: 10px;
            }
            .slim-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.25);
            }
            .slim-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
            }
            @keyframes typingBounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-6px); }
            }
            .typing-dot {
              width: 6px;
              height: 6px;
              background-color: #15803d;
              border-radius: 50%;
              animation: typingBounce 1.4s infinite ease-in-out both;
            }
            @keyframes rotateIn3D {
              0% { opacity: 0; transform: perspective(1200px) rotateX(25deg) translateY(30px) scale(0.9); }
              100% { opacity: 1; transform: perspective(1200px) rotateX(0) translateY(0) scale(1); }
            }
            @keyframes pulseBadge {
              0% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }
              50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 6px 16px rgba(234, 179, 8, 0.5); }
              100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }
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
        {/* Prevent clicks inside the chat container from closing the chat */}
        <div style={{ ...aiChatStyles.chatHeader, ...(isMobile ? aiChatStyles.chatHeaderMobile : {}) }}>
          <div style={aiChatStyles.headerText}>
            <span style={aiChatStyles.statusPill}>
              <span style={aiChatStyles.statusDot} />
              Online
            </span>
            <h3 style={aiChatStyles.chatTitle}>
              {currentBot === 'general' ? 'EcoEquityBot AI' : 'AI Plant Doctor'}
            </h3>
          </div>
          <div style={aiChatStyles.headerActions}>
            {activePlan === 'Basic' && !isMobile ? (
              <button
                type="button"
                style={{ ...aiChatStyles.upgradeProBtn, ...(isMobile ? aiChatStyles.upgradeProBtnMobile : {}) }}
                onClick={() => setShowProModal(true)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 179, 8, 0.2)'; }}
              >
                <span style={{ fontSize: isMobile ? "12px" : "14px", marginTop: "-1px" }}>✨</span> Upgrade to Pro
              </button>
            ) : !isMobile ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: isMobile ? "6px 10px" : "8px 14px", borderRadius: "999px", background: activePlan === 'Enterprise' ? "rgba(14, 165, 233, 0.1)" : "rgba(234, 179, 8, 0.1)", color: activePlan === 'Enterprise' ? "#0284c7" : "#ca8a04", fontSize: isMobile ? "11px" : "12px", fontWeight: 800, border: activePlan === 'Enterprise' ? "1px solid rgba(14, 165, 233, 0.2)" : "1px solid rgba(234, 179, 8, 0.2)", cursor: "default", whiteSpace: "nowrap" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {activePlan} Active
              </div>
            ) : null}
            <div style={{ ...aiChatStyles.switcherStack, ...(isMobile ? aiChatStyles.switcherStackMobile : {}) }}>
              <button onClick={handleToggleBot} style={{ ...aiChatStyles.toggleBotButton, ...(isMobile ? aiChatStyles.toggleBotButtonMobile : {}) }}>
                {currentBot === 'general' ? 'Plant Doctor' : 'General AI'}
              </button>
              {isMobile && activePlan === 'Basic' && (
                <button
                  type="button"
                  style={{ ...aiChatStyles.upgradeProBtn, ...aiChatStyles.upgradeProBtnMobile, width: "100%", justifyContent: "center" }}
                  onClick={() => setShowProModal(true)}
                >
                  <span style={{ fontSize: "12px", marginTop: "-1px" }}>✨</span> Upgrade to Pro
                </button>
              )}
              {isMobile && activePlan !== 'Basic' && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", background: activePlan === 'Enterprise' ? "rgba(14, 165, 233, 0.1)" : "rgba(234, 179, 8, 0.1)", color: activePlan === 'Enterprise' ? "#0284c7" : "#ca8a04", fontSize: "11px", fontWeight: 800, border: activePlan === 'Enterprise' ? "1px solid rgba(14, 165, 233, 0.2)" : "1px solid rgba(234, 179, 8, 0.2)", cursor: "default", whiteSpace: "nowrap" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {activePlan} Active
                </div>
              )}
              {!isMobile && (
                <button
                  type="button"
                  onClick={handleHumanAgentToggle}
                  style={{
                    ...aiChatStyles.agentSwitch,
                    ...(isLiveAgentChat ? aiChatStyles.agentSwitchActive : {}),
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
                  Human agent
                </button>
              )}
            </div>
            <button onClick={onClose} style={{ ...aiChatStyles.closeButton, ...(isMobile ? aiChatStyles.closeButtonMobile : {}) }}>
              &times;
            </button>
          </div>
        </div>
        <div style={{ ...aiChatStyles.messagesContainer, ...(isMobile ? aiChatStyles.messagesContainerMobile : {}) }} className="slim-scroll">
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto', gap: '20px' }}>
              <p style={aiChatStyles.welcomeMessage}>
                {currentBot === 'general'
                  ? "Hi there! I'm EcoEquityBot AI, your dedicated assistant from EcoEquity. How can I assist you with our agricultural innovations and platform today?"
                  : isLiveAgentChat
                    ? `You are connected with a Live Support Agent. Please continue your conversation.`
                    : "Hello! I'm your AI Plant Doctor, ready to assist you in cultivating healthy plants. Please describe any observations or signs of distress your plants are exhibiting, or tell me what you're growing!"
                }
              </p>
              <div style={aiChatStyles.quickPromptsContainer}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i} 
                    style={aiChatStyles.quickPromptBtn} 
                    onClick={() => handleSendMessage(prompt)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(21, 128, 61, 0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
        <div style={{ ...aiChatStyles.inputContainer, ...(isMobile ? aiChatStyles.inputContainerMobile : {}) }}>
          <button
            type="button"
            style={{ ...aiChatStyles.iconButton, ...(isMobile ? aiChatStyles.iconButtonMobile : {}) }}
            aria-label="Voice input"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#15803d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('imageUploadInput').click()}
            style={{ ...aiChatStyles.iconButton, ...(isMobile ? aiChatStyles.iconButtonMobile : {}) }}
            aria-label="Upload image"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#15803d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          <textarea
            ref={textareaRef}
            className="slim-scroll"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={isLiveAgentChat
              ? "Type your message to the live agent..." : (currentBot === 'general' ? "Ask about EcoEquity..." : "Ask about your plants...")}
            style={{ ...aiChatStyles.chatInput, ...(isMobile ? aiChatStyles.chatInputMobile : {}) }}
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
            style={{ ...aiChatStyles.sendButton, ...(isMobile ? aiChatStyles.sendButtonMobile : {}) }}
            aria-label="Send message"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

{showProModal && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.3s ease",
        }}
        onClick={() => setShowProModal(false)}>
          <div style={{ 
            background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))", 
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
            
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1))", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px" }}>✨</span>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: isMobile ? "18px" : "22px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Upgrade to Pro</h2>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(0,0,0,0.6)", maxWidth: "450px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Unlock advanced AI features, 24/7 Plant Doctor access, priority support, and specialized EcoEquity tools.</p>
              
              <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "999px" }}>
                <button onClick={() => setBillingCycle('Monthly')} style={{ padding: "6px 16px", borderRadius: "999px", border: "none", background: billingCycle === 'Monthly' ? "#ffffff" : "transparent", color: billingCycle === 'Monthly' ? "#000" : "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: billingCycle === 'Monthly' ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s ease" }}>Monthly</button>
                <button onClick={() => setBillingCycle('Yearly')} style={{ padding: "6px 16px", borderRadius: "999px", border: "none", background: billingCycle === 'Yearly' ? "#ffffff" : "transparent", color: billingCycle === 'Yearly' ? "#000" : "rgba(0,0,0,0.6)", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: billingCycle === 'Yearly' ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s ease" }}>Yearly <span style={{ color: "#16a34a", fontSize: "10px", marginLeft: "4px", background: "rgba(22, 163, 74, 0.1)", padding: "2px 6px", borderRadius: "999px" }}>Save 20%</span></button>
              </div>
            </div>

            <div className="slim-scroll" style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? "none" : "repeat(3, 1fr)", gap: "16px", overflowX: isMobile ? "auto" : "visible", scrollSnapType: isMobile ? "x mandatory" : "none", paddingBottom: isMobile ? "8px" : "0" }}>
              {/* Basic Plan */}
              <div onClick={() => setSelectedPlan('Basic')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: selectedPlan === 'Basic' ? "1px solid #16a34a" : "1px solid rgba(0,0,0,0.08)", background: selectedPlan === 'Basic' ? "rgba(22, 163, 74, 0.03)" : "#ffffff", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Basic' ? "0 0 0 3px rgba(22, 163, 74, 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Basic' ? "0 0 0 3px rgba(22, 163, 74, 0.2), 0 16px 32px rgba(0,0,0,0.12)" : "0 12px 24px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Basic' ? "0 0 0 3px rgba(22, 163, 74, 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none"; }}>
                {selectedPlan === 'Basic' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "#16a34a", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(22, 163, 74, 0.3)", animation: "scaleUp 0.2s ease-out" }}>✓</div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#000" }}>Basic</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For casual gardeners and beginners.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? 'Free' : 'Free'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>Forever</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#16a34a", fontSize: "12px" }}>✓</span> General AI Chat</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#16a34a", fontSize: "12px" }}>✓</span> Community Access</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}>✗</span> 24/7 Plant Doctor</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}>✗</span> Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}>✗</span> Priority Support</li>
                </ul>
                <button disabled style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 700, fontSize: "13px", cursor: "not-allowed", transition: "all 0.2s ease", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", opacity: 0.7 }}>Current Plan</button>
              </div>

              {/* Pro Plan */}
              <div onClick={() => setSelectedPlan('Pro')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: "2px solid #eab308", background: selectedPlan === 'Pro' ? "linear-gradient(145deg, rgba(234,179,8,0.1), rgba(255,255,255,1))" : "linear-gradient(145deg, rgba(234,179,8,0.05), rgba(255,255,255,1))", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Pro' ? "0 0 0 4px rgba(234, 179, 8, 0.3), 0 12px 24px rgba(234, 179, 8, 0.2)" : "0 8px 16px rgba(234, 179, 8, 0.15)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Pro' ? "0 0 0 4px rgba(234, 179, 8, 0.3), 0 16px 32px rgba(234, 179, 8, 0.3)" : "0 16px 32px rgba(234, 179, 8, 0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Pro' ? "0 0 0 4px rgba(234, 179, 8, 0.3), 0 12px 24px rgba(234, 179, 8, 0.2)" : "0 8px 16px rgba(234, 179, 8, 0.15)"; }}>
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "#ffffff", padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)", animation: "pulseBadge 2s infinite ease-in-out" }}>Most Popular</div>
                {selectedPlan === 'Pro' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "#ca8a04", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(202, 138, 4, 0.3)", animation: "scaleUp 0.2s ease-out" }}>✓</div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#ca8a04" }}>Pro</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.4 }}>For serious growers & urban farmers.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? '₱499' : '₱4,790'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>
                  per {billingCycle === 'Monthly' ? 'month' : 'year, billed annually'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "12px" }}>✓</span> Unlimited AI Chat</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "12px" }}>✓</span> 24/7 AI Plant Doctor</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "12px" }}>✓</span> Advanced Photo Diagnostics</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 600 }}><span style={{ color: "#eab308", fontSize: "12px" }}>✓</span> Priority Support</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", color: "rgba(0,0,0,0.4)", alignItems: "center", fontWeight: 500 }}><span style={{ fontSize: "12px" }}>✗</span> API Access</li>
                </ul>
                <button onClick={(e) => { e.stopPropagation(); setShowProModal(false); setShowPaymentModal(true); }} style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 800, fontSize: "13px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>Choose Pro</button>
              </div>

              {/* Enterprise Plan */}
              <div onClick={() => setSelectedPlan('Enterprise')} style={{ flex: isMobile ? "0 0 85%" : "none", scrollSnapAlign: "center", padding: "16px", borderRadius: "16px", border: selectedPlan === 'Enterprise' ? "1px solid #0ea5e9" : "1px solid rgba(0,0,0,0.08)", background: selectedPlan === 'Enterprise' ? "rgba(14, 165, 233, 0.03)" : "#ffffff", display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", transition: "all 0.2s ease", boxShadow: selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(14, 165, 233, 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(14, 165, 233, 0.2), 0 16px 32px rgba(0,0,0,0.12)" : "0 12px 24px rgba(0,0,0,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = selectedPlan === 'Enterprise' ? "0 0 0 3px rgba(14, 165, 233, 0.2), 0 12px 24px rgba(0,0,0,0.08)" : "none"; }}>
                {selectedPlan === 'Enterprise' && <div style={{ position: "absolute", top: "12px", right: "12px", background: "#0ea5e9", color: "#ffffff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, boxShadow: "0 2px 4px rgba(14, 165, 233, 0.3)", animation: "scaleUp 0.2s ease-out" }}>✓</div>}
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0284c7" }}>Enterprise</h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>For commercial farms & businesses.</p>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", marginBottom: "6px", letterSpacing: "-1px" }}>
                  {billingCycle === 'Monthly' ? '₱1,499' : '₱14,390'}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", marginBottom: "16px", fontWeight: 500 }}>
                  per {billingCycle === 'Monthly' ? 'month' : 'year, billed annually'}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "12px" }}>✓</span> Everything in Pro</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "12px" }}>✓</span> Dedicated Human Agent</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "12px" }}>✓</span> 24/7 VIP Phone Support</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "12px" }}>✓</span> Custom API Access</li>
                  <li style={{ display: "flex", gap: "8px", fontSize: "12px", alignItems: "center", color: "#000", fontWeight: 500 }}><span style={{ color: "#0ea5e9", fontSize: "12px" }}>✓</span> Team Analytics Dashboard</li>
                </ul>
<button onClick={(e) => { e.stopPropagation(); setShowProModal(false); setShowPaymentModal(true); }} style={{ width: "100%", padding: "10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#ffffff", fontWeight: 800, fontSize: "13px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(14,165,233,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(14,165,233,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}>Choose Enterprise</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showPaymentModal && ReactDOM.createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "24px" : "40px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out" }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>&times;</button>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: "32px" }}>
              {/* Left Column: Order Summary */}
              <div style={{ display: "flex", flexDirection: "column", order: isMobile ? 1 : 1 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#000" }}>Order Summary</h3>
                <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>✨</div>
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#16a34a" }}>
                      <span>Annual Discount (20%)</span>
                      <span style={{ fontWeight: 600 }}>-{selectedPlan === 'Enterprise' ? '₱3,598.00' : '₱1,198.00'}</span>
                    </div>
                  )}
                  <div style={{ height: "1px", background: "#e2e8f0", margin: "20px 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#000" }}>Total Due</span>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "#15803d" }}>{selectedPlan === 'Enterprise' ? (billingCycle === 'Monthly' ? '₱1,499.00' : '₱14,390.00') : (billingCycle === 'Monthly' ? '₱499.00' : '₱4,790.00')}</span>
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
                      style={{ flex: 1, padding: "10px 8px", borderRadius: "8px", border: "none", background: paymentMethod === method ? "#ffffff" : "transparent", color: paymentMethod === method ? "#15803d" : "#64748b", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: paymentMethod === method ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Credit Card' ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cardholder Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" value={paymentForm.name} onChange={e => setPaymentForm({...paymentForm, name: e.target.value})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Card Number</label>
                      <div style={{ position: "relative" }}>
                        <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()})} style={{ width: "100%", padding: "14px 16px", paddingRight: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                        <svg style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" maxLength="5" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value.replace(/\W/gi, '').replace(/(.{2})/, '$1/').trim()})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>CVC</label>
                        <input type="text" placeholder="123" maxLength="4" value={paymentForm.cvc} onChange={e => setPaymentForm({...paymentForm, cvc: e.target.value.replace(/\W/gi, '')})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ padding: "16px", background: paymentMethod === 'GCash' ? "#eff6ff" : "#ecfdf5", borderRadius: "12px", border: paymentMethod === 'GCash' ? "1px solid #bfdbfe" : "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>📱</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: paymentMethod === 'GCash' ? "#1d4ed8" : "#047857" }}>Pay with {paymentMethod}</div>
                        <div style={{ fontSize: "12px", color: paymentMethod === 'GCash' ? "#3b82f6" : "#059669", fontWeight: 500, marginTop: "2px" }}>Enter your {paymentMethod} account details below.</div>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Number</label>
                      <input type="text" placeholder="e.g. 0912 345 6789" maxLength="13" value={mobilePaymentForm.mobileNumber} onChange={e => setMobilePaymentForm({...mobilePaymentForm, mobileNumber: e.target.value.replace(/\W/gi, '').replace(/(.{4})/, '$1 ').replace(/(.{8})/, '$1 ').trim()})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = paymentMethod === 'GCash' ? "#3b82f6" : "#10b981"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Account Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" value={mobilePaymentForm.accountName} onChange={e => setMobilePaymentForm({...mobilePaymentForm, accountName: e.target.value})} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onFocus={e => e.target.style.borderColor = paymentMethod === 'GCash' ? "#3b82f6" : "#10b981"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      setShowPaymentModal(false);
                      setShowPaymentSuccess(true);
                      setPaymentForm({ name: '', cardNumber: '', expiry: '', cvc: '' });
                      setMobilePaymentForm({ mobileNumber: '', accountName: '' });
                    }, 1500);
                  }}
                  disabled={isPayButtonDisabled}
                  style={{ width: "100%", padding: "16px", marginTop: "12px", borderRadius: "12px", border: isPayButtonDisabled ? "none" : "1px solid rgba(255,255,255,0.35)", background: isPayButtonDisabled ? "#94a3b8" : "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: isPayButtonDisabled ? "#ffffff" : "#062018", fontWeight: 800, fontSize: "15px", cursor: isPayButtonDisabled ? "not-allowed" : "pointer", boxShadow: isPayButtonDisabled ? "none" : "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onMouseEnter={(e) => { if(!isPayButtonDisabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; } }}
                  onMouseLeave={(e) => { if(!isPayButtonDisabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; } }}
                >
                  {isProcessing ? (
                    <>
                      <div className="ring-spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Pay {selectedPlan === 'Enterprise' ? (billingCycle === 'Monthly' ? '₱1,499' : '₱14,390') : (billingCycle === 'Monthly' ? '₱499' : '₱4,790')}
                    </>
                  )}
                </button>
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
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: isMobile ? "32px 24px" : "40px", maxWidth: "380px", width: "100%", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", animation: "scaleUp 0.3s ease-out", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: selectedPlan === 'Enterprise' ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "linear-gradient(135deg, #eab308, #ca8a04)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: selectedPlan === 'Enterprise' ? "0 8px 16px rgba(14, 165, 233, 0.3)" : "0 8px 16px rgba(234, 179, 8, 0.3)", animation: "checkmarkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "successDraw 0.6s ease-out 0.2s both" }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>Payment Successful!</h2>
            <p style={{ margin: "0 0 32px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>You are now successfully subscribed to the <strong style={{ color: selectedPlan === 'Enterprise' ? "#0284c7" : "#ca8a04" }}>{selectedPlan}</strong> plan.</p>
            <button 
              onClick={() => {
                setActivePlan(selectedPlan);
                setShowPaymentSuccess(false);
              }}
              style={{ width: "100%", padding: "14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = '0 22px 42px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)'; }}
            >
              Start Using {selectedPlan}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const aiChatStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",
    zIndex: 9999,
    transition: "opacity 0.3s ease-out",
    boxSizing: "border-box",
  },
  overlayMobile: {
    background: "rgba(0, 0, 0, 0.42)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  chatContainer: {
    background: "#ffffff",
    borderRadius: "0px",
    border: "none",
    boxShadow: "none",
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: "#000",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: "opacity 0.3s ease-out, transform 0.3s ease-out", // Animation transition
  },
  chatContainerMobile: {
    width: "100vw",
    maxWidth: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    margin: 0,
    borderRadius: 0,
    background: "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(240,253,244,0.82))",
    border: "none",
    boxShadow: "none",
    backdropFilter: "blur(24px) saturate(155%)",
    WebkitBackdropFilter: "blur(24px) saturate(155%)",
    boxSizing: "border-box",
    transformOrigin: "top center",
  },
  toggleBotButton: {
    background: "rgba(21, 128, 61, 0.1)",
    border: "1px solid rgba(21, 128, 61, 0.2)",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "999px",
    transition: "background 0.16s ease, transform 0.16s ease",
  },
  toggleBotButtonMobile: { // New mobile style
    fontSize: "11px",
    padding: "7px 10px",
  },
  chatHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
  },
  chatHeaderMobile: {
    padding: "calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px",
    alignItems: "flex-start",
    gap: "8px",
    flexShrink: 0,
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
    gap: "8px",
    flexShrink: 0,
  },
  upgradeProBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #eab308, #ca8a04)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 8px rgba(234, 179, 8, 0.2)",
    whiteSpace: "nowrap",
  },
  upgradeProBtnMobile: {
    padding: "6px 10px",
    fontSize: "11px",
  },
  switcherStack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "6px",
  },
  switcherStackMobile: {
    minWidth: "118px",
    gap: "5px",
  },
  agentSwitch: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#f9fafb",
    color: "#374151",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.2px",
    cursor: "pointer",
  },
  agentSwitchActive: {
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    color: "#dc2626",
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
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
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
    color: "#059669",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#86efac",
    boxShadow: "0 0 12px rgba(134,239,172,0.95)",
    display: "inline-block",
  },
  chatTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "0",
    fontFamily: "'Poppins', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#15803d",
  },
  closeButton: {
    background: "rgba(0,0,0,0.05)",
    border: "none",
    borderRadius: "50%",
    color: "#111827",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    width: "36px",
    height: "36px",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  closeButtonMobile: { // New mobile style
    fontSize: "18px",
    width: "32px",
    height: "32px",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: "#f9fafb",
  },
  messagesContainerMobile: {
    padding: "14px 12px",
    gap: "12px",
    minHeight: 0,
  },
  welcomeMessage: {
    textAlign: "center",
    color: "#374151",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: 1.65,
    maxWidth: "80%",
  },
  quickPromptsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "500px",
  },
  quickPromptBtn: {
    background: "#ffffff",
    border: "1px solid rgba(21, 128, 61, 0.2)",
    borderRadius: "999px",
    padding: "8px 16px",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  messageBubble: {
    maxWidth: "82%",
    padding: "12px 16px",
    borderRadius: "18px",
    wordWrap: "break-word",
    fontSize: "14px",
    lineHeight: 1.5,
    whiteSpace: "pre-line",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    border: "1px solid rgba(255,255,255,0.35)",
    borderBottomRightRadius: "4px",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
  },
aiMessage: {
    alignSelf: "flex-start",
    background: "linear-gradient(135deg, rgba(74,222,128,0.25), rgba(134,239,172,0.15))",
    border: "1px solid rgba(134,239,172,0.3)",
    color: "#111827",
    borderBottomLeftRadius: "5px",
    boxShadow: "0 0 18px rgba(134, 239, 172, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
  },
  agentMessage: {
    alignSelf: "flex-start",
    background: "#fffbeb",
    color: "#b45309",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderBottomLeftRadius: "4px",
  },
  messageBubbleMobile: { maxWidth: "90%" },
  inputContainer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
    display: "flex",
    gap: "12px",
    background: "#ffffff",
    alignItems: "flex-end",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
  },
  inputContainerMobile: {
    padding: "10px 10px calc(env(safe-area-inset-bottom, 0px) + 10px)",
    gap: "8px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexShrink: 0,
  },
  chatInput: {
    flexGrow: 1,
    minWidth: 0,
    padding: "14px 16px",
    borderRadius: "24px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    background: "#f3f4f6",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
    resize: "none",
    maxHeight: "150px",
    overflowY: "auto",
    lineHeight: "1.5",
    fontFamily: "inherit",
    transition: "border-color 0.2s, background 0.2s",
  },
  chatInputMobile: { // New mobile style
    fontSize: "13px",
    padding: "10px 12px",
  },
  sendButton: {
    padding: "10px",
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    flexShrink: 0,
  },
  sendButtonMobile: { // New mobile style
    width: "40px",
    height: "40px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "20px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.2s, color 0.2s",
  },
  iconButtonMobile: {
    width: "36px",
    height: "36px",
  },
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
    background: "#ef4444",
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
