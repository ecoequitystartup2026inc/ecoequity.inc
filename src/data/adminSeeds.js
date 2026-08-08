// Seed data for the Admin Portal.
//
// These lists live here rather than in pages/AdminPortal.js so that App.js can
// read them without importing the portal itself. AdminPortal is ~8,600 lines —
// by far the largest file in the project — and a named import from it pulls the
// entire module into the main bundle, which every visitor downloads whether or
// not they are an admin. With the data out here the portal can be code-split
// (see lazyPage in App.js) and only staff ever pay for it.
//
// They are placeholder rows: the real values come from Supabase, and these are
// what the UI falls back to before that data arrives (or when it is not
// configured at all). Pure data only — no JSX, or the icons would drag the
// portal back into the main bundle.

export const mockUsers = [
  { id: "USR-001", name: "Maria Clara", email: "maria@example.com", role: "Customer", lastLogin: "10 mins ago", status: "Online" },
  { id: "USR-002", name: "Juan Dela Cruz", email: "juan@example.com", role: "Farmer", lastLogin: "1 hour ago", status: "Offline" },
  { id: "USR-003", name: "Healthy Eats Cafe", email: "contact@healthyeats.com", role: "B2B Buyer", lastLogin: "2 hours ago", status: "Offline" },
  { id: "USR-004", name: "Urban Roots", email: "hello@urbanroots.ph", role: "Customer", lastLogin: "Just now", status: "Online" },
  { id: "USR-005", name: "Reyes Organic Farm", email: "admin@reyesorganic.com", role: "Farmer", lastLogin: "5 mins ago", status: "Online" },
];

export const mockDeliveriesList = [
  { id: "TRK-001", orderId: "ORD-9823", customer: "Maria Clara", rider: "Mike T.", status: "Out for Delivery", eta: "10 mins", type: "Eco-Bike", distance: "2.5 km" },
  { id: "TRK-002", orderId: "ORD-9822", customer: "Juan Dela Cruz", rider: "Sarah L.", status: "In Transit", eta: "25 mins", type: "EV-Van", distance: "5.1 km" },
  { id: "TRK-003", orderId: "ORD-9821", customer: "Healthy Eats", rider: "Unassigned", status: "Pending Pickup", eta: "N/A", type: "Standard", distance: "1.2 km" },
  { id: "TRK-004", orderId: "ORD-9820", customer: "Urban Roots", rider: "John D.", status: "Delivered", eta: "Delivered", type: "Eco-Bike", distance: "3.8 km" },
  { id: "TRK-005", orderId: "ORD-9819", customer: "Green Valley", rider: "Alex R.", status: "Delayed", eta: "45 mins", type: "EV-Van", distance: "8.4 km" },
];

export const mockRiders = [
  { id: "RDR-001", name: "Mike T.", status: "On Delivery", rating: 4.9, deliveries: 1245, phone: "0917 555 0101", area: "Baguio City", vehicle: "Eco-Bike", currentOrder: "ORD-9823" },
  { id: "RDR-002", name: "Sarah L.", status: "Available", rating: 4.8, deliveries: 890, phone: "0917 555 0102", area: "La Trinidad", vehicle: "EV-Van", currentOrder: null },
  { id: "RDR-003", name: "John D.", status: "Offline", rating: 4.7, deliveries: 654, phone: "0917 555 0103", area: "Itogon", vehicle: "Eco-Bike", currentOrder: null },
];

export const mockTransactions = [
  { id: "TXN-001", orderId: "ORD-9823", customer: "Maria Clara", method: "GCash", amount: "₱1,250", status: "Paid", date: "May 28, 2026, 10:30 AM", refNo: "8291038471" },
  { id: "TXN-002", orderId: "ORD-9822", customer: "Juan Dela Cruz", method: "Cash on Delivery", amount: "₱850", status: "Pending", date: "May 28, 2026, 11:15 AM", refNo: "N/A" },
  { id: "TXN-003", orderId: "ORD-9821", customer: "Healthy Eats", method: "Credit Card", amount: "₱5,400", status: "Paid", date: "May 27, 2026, 2:45 PM", refNo: "CH-992817" },
  { id: "TXN-004", orderId: "ORD-9820", customer: "Urban Roots", method: "Maya", amount: "₱3,200", status: "Refunded", date: "May 27, 2026, 4:20 PM", refNo: "MY-112349" },
  { id: "TXN-005", orderId: "ORD-9819", customer: "Green Valley", method: "Bank Transfer", amount: "₱12,000", status: "Failed", date: "May 26, 2026, 9:00 AM", refNo: "BT-88219" },
];

export const mockSubscribers = [
  { id: "SUB-001", user: "Maria Clara", email: "maria@example.com", plan: "Pro", status: "Active", renewal: "Jun 15, 2026", payment: "GCash", joined: "Jan 10, 2026", aiScans: 85, aiLimit: 100 },
  { id: "SUB-002", user: "Juan Dela Cruz", email: "juan@example.com", plan: "Basic", status: "Active", renewal: "N/A", payment: "Free", joined: "Feb 05, 2026", aiScans: 8, aiLimit: 10 },
  { id: "SUB-003", user: "Healthy Eats Cafe", email: "contact@healthyeats.com", plan: "Enterprise", status: "Active", renewal: "Dec 01, 2026", payment: "Bank Transfer", joined: "Dec 01, 2025", aiScans: 1250, aiLimit: 5000 },
  { id: "SUB-004", user: "Urban Roots", email: "hello@urbanroots.ph", plan: "Pro", status: "Pending Renewal", renewal: "May 30, 2026", payment: "Credit Card", joined: "May 30, 2025", aiScans: 100, aiLimit: 100 },
  { id: "SUB-005", user: "Reyes Organic", email: "admin@reyesorganic.com", plan: "Pro", status: "Cancelled", renewal: "May 15, 2026", payment: "Maya", joined: "Oct 12, 2025", aiScans: 20, aiLimit: 100 },
];

// The one seed list behind BOTH the admin Events & Workshops tab and the public
// Events & Workshops page. The website used to keep its own hard-coded copy of
// these five, so an admin could neither edit nor delete them; the narrative
// fields the site needs (speaker, short + full description) therefore live here
// on the admin record, and the site now renders this list and nothing else.
export const mockEventsList = [
  { id: "EVT-001", title: "Urban Hydroponics for Beginners", date: "Jun 15, 2026", time: "09:00 AM - 12:00 PM", type: "Workshop", attendees: 45, maxAttendees: 50, status: "Upcoming", price: "₱1,200", location: "Baguio City Hall Grounds", speaker: "Dr. Maria Santos", speakerImage: "", description: "Learn the basics of hydroponic farming for small urban spaces. Hands-on training on setting up a simple system.", fullDescription: "This comprehensive workshop covers everything you need to start your own hydroponic garden. From nutrient solutions to plant selection, our expert Dr. Maria Santos will guide you through practical exercises. Ideal for city dwellers looking to grow fresh produce year-round." },
  { id: "EVT-002", title: "Sustainable Pest Management", date: "Jul 10, 2026", time: "02:00 PM - 03:30 PM", type: "Webinar", attendees: 120, maxAttendees: 500, status: "Upcoming", price: "Free", location: "Online (Zoom)", speaker: "Engr. Ana Reyes", speakerImage: "", description: "Discover eco-friendly methods to protect your crops from common pests without harmful chemicals.", fullDescription: "Join Engr. Ana Reyes for an insightful webinar on integrated pest management strategies. Learn about natural predators, organic sprays, and companion planting techniques to keep your garden healthy and productive. Q&A session included." },
  { id: "EVT-003", title: "Seed Exchange & Planting Day", date: "Aug 05, 2026", time: "04:00 PM - 06:00 PM", type: "Community", attendees: 85, maxAttendees: 100, status: "Upcoming", price: "Free", location: "Local Community Garden", speaker: "Mr. Juan Dela Cruz", speakerImage: "", description: "Connect with fellow gardeners, exchange heirloom seeds, and participate in a community planting activity.", fullDescription: "A wonderful opportunity to meet local gardening enthusiasts, share your favorite seeds, and contribute to our community garden. Mr. Juan Dela Cruz will lead a short session on seed saving and propagation. Refreshments will be served." },
  { id: "EVT-004", title: "Farm-to-Table Cooking Workshop", date: "Sep 20, 2026", time: "10:00 AM - 01:00 PM", type: "Workshop", attendees: 18, maxAttendees: 30, status: "Upcoming", price: "₱2,500", location: "EcoEquity Training Center", speaker: "Chef Elena Garcia", speakerImage: "", description: "Learn to cook delicious and healthy meals using freshly harvested organic produce.", fullDescription: "Chef Elena Garcia will demonstrate how to transform fresh, seasonal ingredients into culinary masterpieces. This hands-on workshop emphasizes healthy eating and sustainable food practices. All ingredients provided." },
  { id: "EVT-005", title: "Advanced Soil Health & Composting", date: "Oct 12, 2026", time: "07:00 PM - 08:00 PM", type: "Webinar", attendees: 250, maxAttendees: 300, status: "Upcoming", price: "Free", location: "Online (Google Meet)", speaker: "Dr. Alex Lim", speakerImage: "", description: "Deep dive into improving soil fertility and effective composting techniques for sustainable gardening.", fullDescription: "Explore the science behind healthy soil with Dr. Alex Lim. This webinar covers advanced composting methods, soil testing, and strategies for long-term soil fertility. Perfect for experienced gardeners looking to optimize their growing conditions." },
];

export const mockScansList = [
  { id: "SCN-8821", plant: "Tomato", disease: "Early Blight", confidence: "94%", user: "Maria Clara", status: "Critical", date: "May 28, 2026", recommendation: "Apply copper-based fungicide and remove affected lower leaves to prevent spore spread." },
  { id: "SCN-8820", plant: "Lettuce", disease: "None", confidence: "99%", user: "Urban Roots", status: "Healthy", date: "May 28, 2026", recommendation: "Plant is healthy. Continue current watering and nutrient schedule." },
  { id: "SCN-8819", plant: "Mango", disease: "Anthracnose", confidence: "87%", user: "Juan Dela Cruz", status: "Disease Detected", date: "May 27, 2026", recommendation: "Prune infected branches and apply organic fungicide during dry weather." },
  { id: "SCN-8818", plant: "Banana", disease: "Stem Weevil", confidence: "76%", user: "Green Valley", status: "Under Review", date: "May 27, 2026", recommendation: "Requires agronomist confirmation. Temporarily isolate affected crops." },
  { id: "SCN-8817", plant: "Eggplant", disease: "Downy Mildew", confidence: "91%", user: "Healthy Eats", status: "Resolved", date: "May 26, 2026", recommendation: "Previous treatment successful. Monitor for 7 more days." },
];

export const mockDiseaseLibrary = [
  { id: "DIS-001", name: "Early Blight (Fungal)", plant: "Tomato", crop: "Tomato, Potato", severity: "High", confidence: "94%", recommendations: [
    "Remove infected lower leaves to prevent spore splash.",
    "Apply organic copper-based fungicide every 7-10 days.",
    "Improve air circulation by pruning excess foliage.",
    "Water at the base of the plant only, avoiding the leaves.",
  ] },
  { id: "DIS-002", name: "Downy Mildew", plant: "Eggplant", crop: "Eggplant, Cucumber", severity: "Medium", confidence: "91%", recommendations: [
    "Avoid overhead watering to keep foliage dry.",
    "Apply a potassium bicarbonate spray on affected areas.",
    "Increase spacing between plants for better airflow.",
  ] },
  { id: "DIS-003", name: "Anthracnose", plant: "Mango", crop: "Mango, Papaya", severity: "High", confidence: "87%", recommendations: [
    "Prune infected branches and dispose of them away from crops.",
    "Apply organic fungicide during dry weather windows.",
    "Harvest fruit promptly to reduce infection spread.",
  ] },
  { id: "DIS-004", name: "Powdery Mildew", plant: "Squash", crop: "Squash, Melon", severity: "Medium", confidence: "89%", recommendations: [
    "Spray a diluted neem oil solution weekly.",
    "Remove and destroy heavily infected leaves.",
    "Plant in full sun to discourage fungal growth.",
  ] },
];

export const mockContentList = [
  { id: "CNT-001", title: "10 Benefits of Urban Farming", type: "Article", status: "Published", date: "May 28, 2026", author: "Admin" },
  { id: "CNT-002", title: "Summer Workshop Registration", type: "Page", status: "Draft", date: "May 27, 2026", author: "Editor" },
  { id: "CNT-003", title: "Platform Maintenance Notice", type: "Announcement", status: "Scheduled", date: "May 26, 2026", author: "Admin" },
  { id: "CNT-004", title: "How to use the AI Plant Doctor", type: "Tutorial", status: "Published", date: "May 25, 2026", author: "Admin" },
  { id: "CNT-005", title: "Homepage Hero Banner", type: "Component", status: "Published", date: "May 24, 2026", author: "Designer" },
];
