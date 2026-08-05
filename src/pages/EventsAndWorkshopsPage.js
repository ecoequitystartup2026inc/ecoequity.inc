import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { MODAL_LAYER, modalOverlay } from "../styles/modal";
import ReactDOM from "react-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaFilter, FaTimes, FaArrowLeft, FaSearch, FaUsers, FaTag } from "react-icons/fa";

const mockEvents = [
  {
    id: 1,
    type: "Training",
    date: "June 15, 2026",
    time: "9:00 AM - 12:00 PM",
    venue: "Baguio City Hall Grounds",
    speaker: { name: "Dr. Maria Santos", image: "" }, // Photo intentionally blank — set from Admin Portal
    title: "Urban Hydroponics for Beginners",
    description: "Learn the basics of hydroponic farming for small urban spaces. Hands-on training on setting up a simple system.",
    fullDescription: "This comprehensive workshop covers everything you need to start your own hydroponic garden. From nutrient solutions to plant selection, our expert Dr. Maria Santos will guide you through practical exercises. Ideal for city dwellers looking to grow fresh produce year-round.",
    rsvpLink: "#",
  },
  {
    id: 2,
    type: "Webinar",
    date: "July 10, 2026",
    time: "2:00 PM - 3:30 PM",
    venue: "Online (Zoom)",
    speaker: { name: "Engr. Ana Reyes", image: "" }, // Photo intentionally blank — set from Admin Portal
    title: "Sustainable Pest Management",
    description: "Discover eco-friendly methods to protect your crops from common pests without harmful chemicals.",
    fullDescription: "Join Engr. Ana Reyes for an insightful webinar on integrated pest management strategies. Learn about natural predators, organic sprays, and companion planting techniques to keep your garden healthy and productive. Q&A session included.",
    rsvpLink: "#",
  },
  {
    id: 3,
    type: "Community Gathering",
    date: "August 5, 2026",
    time: "4:00 PM - 6:00 PM",
    venue: "Local Community Garden",
    speaker: { name: "Mr. Juan Dela Cruz", image: "" }, // Photo intentionally blank — set from Admin Portal
    title: "Seed Exchange & Planting Day",
    description: "Connect with fellow gardeners, exchange heirloom seeds, and participate in a community planting activity.",
    fullDescription: "A wonderful opportunity to meet local gardening enthusiasts, share your favorite seeds, and contribute to our community garden. Mr. Juan Dela Cruz will lead a short session on seed saving and propagation. Refreshments will be served.",
    rsvpLink: "#",
  },
  {
    id: 4,
    type: "Training",
    date: "September 20, 2026",
    time: "10:00 AM - 1:00 PM",
    venue: "EcoEquity Training Center",
    speaker: { name: "Chef Elena Garcia", image: "" }, // Photo intentionally blank — set from Admin Portal
    title: "Farm-to-Table Cooking Workshop",
    description: "Learn to cook delicious and healthy meals using freshly harvested organic produce.",
    fullDescription: "Chef Elena Garcia will demonstrate how to transform fresh, seasonal ingredients into culinary masterpieces. This hands-on workshop emphasizes healthy eating and sustainable food practices. All ingredients provided.",
    rsvpLink: "#",
  },
  {
    id: 5,
    type: "Webinar",
    date: "October 12, 2026",
    time: "7:00 PM - 8:00 PM",
    venue: "Online (Google Meet)",
    speaker: { name: "Dr. Alex Lim", image: "" }, // Photo intentionally blank — set from Admin Portal
    title: "Advanced Soil Health & Composting",
    description: "Deep dive into improving soil fertility and effective composting techniques for sustainable gardening.",
    fullDescription: "Explore the science behind healthy soil with Dr. Alex Lim. This webinar covers advanced composting methods, soil testing, and strategies for long-term soil fertility. Perfect for experienced gardeners looking to optimize their growing conditions.",
    rsvpLink: "#",
  },
];

const filterTabs = ["All Events", "Trainings", "Webinars", "Community Gatherings"];

const eventSuggestions = {
  Training: {
    tips: [
      "Wear comfortable clothing suitable for hands-on activities",
      "Bring a notebook to jot down important notes",
      "Arrive 15 minutes early to get settled",
      "Bring your own gardening gloves if you have them",
    ],
    relatedEvents: ["Webinar", "Community Gathering"],
  },
  Webinar: {
    tips: [
      "Test your internet connection before the session",
      "Prepare questions in advance for the Q&A",
      "Find a quiet space with minimal distractions",
      "Have a notepad ready for key takeaways",
    ],
    relatedEvents: ["Training", "Community Gathering"],
  },
  "Community Gathering": {
    tips: [
      "Bring a reusable bag for any seeds or plants",
      "Wearsun-safe clothing and bring sunscreen",
      "Bring a water bottle to stay hydrated",
      "Prepare to socialize and make new connections",
    ],
    relatedEvents: ["Training", "Webinar"],
  },
};

// Circular speaker avatar: shows the photo when one is set, otherwise a blank
// placeholder. Real photos are assigned from the Admin Portal.
const SpeakerAvatar = ({ speaker, style }) => {
  if (speaker?.image) {
    return <img src={speaker.image} alt={speaker.name} style={style} />;
  }
  return (
    <div
      aria-label={speaker?.name}
      style={{
        ...style,
        objectFit: undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12))",
        color: "rgba(0,0,0,0.35)",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <FaUser style={{ fontSize: "16px" }} />
    </div>
  );
};

function EventsAndWorkshopsPage({ setActiveNav, adminEvents = [], onRegister }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [hoveredEventCard, setHoveredEventCard] = useState(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // State for scroll indicator
  const [isHoveredBack, setIsHoveredBack] = useState(false);
const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedEvent, setConfirmedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    const ratio = scrollLeft / (scrollWidth - clientWidth);
    setActiveIndex(Math.round(ratio * (filteredEvents.length - 1)));
  };

  // Map an Admin Portal event record to the website's event-card shape.
  // Speaker, capacity, price and status all flow through so admin edits
  // are reflected on the site immediately.
  const mapAdminEventToCard = (ae) => {
    const typeMap = { Workshop: "Training", Community: "Community Gathering", Webinar: "Webinar" };
    return {
      id: ae.id,
      type: typeMap[ae.type] || ae.type || "Training",
      date: ae.date,
      time: ae.time,
      venue: ae.location || "TBA",
      speaker: { name: ae.speaker || "EcoEquity Team", image: ae.speakerImage || "" },
      title: ae.title,
      description: ae.description || `${ae.type || "Event"}${ae.price ? " • " + ae.price : ""}${ae.location ? " • " + ae.location : ""}`,
      fullDescription: ae.description || `Join us for ${ae.title} on ${ae.date}${ae.time ? " at " + ae.time : ""}.`,
      price: ae.price,
      status: ae.status,
      attendees: Number(ae.attendees) || 0,
      maxAttendees: Number(ae.maxAttendees) || 0,
      rsvpLink: "#",
    };
  };

  // Curated events + admin-created events (deduped by title) for a single,
  // synced list. Cancelled admin events are hidden from the website.
  const allEvents = [
    ...mockEvents,
    ...adminEvents
      .filter(ae => ae.title && ae.status !== "Cancelled" && !mockEvents.some(me => me.title === ae.title))
      .map(mapAdminEventToCard),
  ];

  const filteredEvents = allEvents.filter(event => {
    const tabMapping = {
      "Trainings": "Training",
      "Webinars": "Webinar",
      "Community Gatherings": "Community Gathering"
    };
    const matchesTab = activeFilter === "All Events" || event.type === tabMapping[activeFilter];
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      event.title.toLowerCase().includes(query) ||
      (event.venue || "").toLowerCase().includes(query) ||
      (event.speaker?.name || "").toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const isEventFull = (event) =>
    event.maxAttendees > 0 && event.attendees >= event.maxAttendees;
  const spotsLeft = (event) =>
    event.maxAttendees > 0 ? Math.max(event.maxAttendees - event.attendees, 0) : null;

const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleJoinNowClick = (e, event) => {
    e.stopPropagation();
    if (isEventFull(event)) return;
    setJoiningEvent(event);
    setShowIdeasModal(true);
  };

const handleConfirmJoin = () => {
    // Sync the registration back to the Admin Portal (increments attendee count)
    if (onRegister && joiningEvent) onRegister(joiningEvent);
    setConfirmedEvent(joiningEvent);
    setShowIdeasModal(false);
    setShowSuccessModal(true);
  };

const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setConfirmedEvent(null);
    setJoiningEvent(null);
  };

const handleCancelJoin = () => {
    setShowIdeasModal(false);
    setJoiningEvent(null);
  };

  const getSuggestionsForEvent = (eventType) => {
    return eventSuggestions[eventType] || eventSuggestions["Training"];
  };

// Add to Calendar function - opens native calendar app directly
  const addToCalendar = (event) => {
    // Parse the date and time
    const parseEventDate = (dateStr, timeStr) => {
      const months = {
        January: "01", February: "02", March: "03", April: "04",
        May: "05", June: "06", July: "07", August: "08",
        September: "09", October: "10", November: "11", December: "12",
        // Admin Portal events often use abbreviated month names
        Jan: "01", Feb: "02", Mar: "03", Apr: "04", Jun: "06",
        Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
      };
      const dateParts = dateStr.split(" ");
      const month = months[dateParts[0]];
      const day = dateParts[1].replace(",", "").padStart(2, "0");
      const year = dateParts[2];
      
      // Parse time - handle both start and end times. Admin-created events may
      // have a single time (e.g. "09:00 AM") instead of a range, so fall back
      // to a one-hour slot when there's no end time.
      let timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        const single = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (single) {
          const endH = (parseInt(single[1]) % 12) + 1;
          timeMatch = [null, single[1], single[2], single[3], String(endH), single[2], single[3]];
        } else {
          // No parsable time at all: schedule as a 9-10 AM block on the date.
          timeMatch = [null, "9", "00", "AM", "10", "00", "AM"];
        }
      }
      let startHour = parseInt(timeMatch[1]);
      const startMin = timeMatch[2];
      let endHour = parseInt(timeMatch[4]);
      const endMin = timeMatch[5];
      
      if (timeMatch[3].toUpperCase() === "PM" && startHour !== 12) startHour += 12;
      if (timeMatch[3].toUpperCase() === "AM" && startHour === 12) startHour = 0;
      if (timeMatch[6].toUpperCase() === "PM" && endHour !== 12) endHour += 12;
      if (timeMatch[6].toUpperCase() === "AM" && endHour === 12) endHour = 0;
      
      return {
        start: `${year}${month}${day}T${startHour.toString().padStart(2, "0")}${startMin}00`,
        end: `${year}${month}${day}T${endHour.toString().padStart(2, "0")}${endMin}00`
      };
    };

    const { start, end } = parseEventDate(event.date, event.time);
    
    // Create ICS format with proper escaping
    const escapeICS = (text) => {
      return text?.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n") || "";
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EcoEquity//Events//EN
BEGIN:VEVENT
UID:${Date.now()}@ecoequity
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.fullDescription)}
LOCATION:${escapeICS(event.venue)}
END:VEVENT
END:VCALENDAR`;

    // Use data URI to open in calendar app without downloading
    const encodedICS = encodeURIComponent(icsContent);
    window.open(`data:text/calendar;charset=utf-8,${encodedICS}`, "_blank");
  };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
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
            onClick={() => setActiveNav && setActiveNav("ServicesPage")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          > 
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Community & Learning</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Events & <span style={styles.accent}>Workshops</span>
      </h1>

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Join our upcoming farming workshops, seminars, webinars, trainings, and community events to grow your skills and connect with fellow enthusiasts.
      </p>

      {/* Search Bar */}
      <div className="inner-blur-glass" style={styles.searchBarWrap}>
        <FaSearch style={{ color: "rgba(0,0,0,0.35)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search events by title, venue, or speaker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button type="button" style={styles.searchClearBtn} onClick={() => setSearchQuery("")}>
            <FaTimes />
          </button>
        )}
      </div>

      <div style={{ ...styles.filterTabs, ...(isMobile ? styles.filterTabsMobile : {}) }}>
        {filterTabs.map(tab => (
          <button
            key={tab}
            style={{
              ...styles.filterBtn,
              ...(activeFilter === tab ? styles.filterBtnActive : {}),
              ...(hoveredFilter === tab && activeFilter !== tab ? styles.filterBtnHover : {}),
            }}
            onMouseEnter={() => setHoveredFilter(tab)}
            onMouseLeave={() => setHoveredFilter(null)}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="hide-scroll"
        style={{ ...styles.eventGrid, ...(isMobile ? styles.eventGridMobile : {}) }}
        onScroll={handleScroll}
      >
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="inner-blur-glass"
            style={{
              ...styles.eventCard,
              ...(isMobile ? styles.eventCardMobile : {}),
              ...(hoveredEventCard === event.id ? styles.eventCardHov : {}),
            }}
            onMouseEnter={() => setHoveredEventCard(event.id)}
            onMouseLeave={() => setHoveredEventCard(null)}
            onClick={() => openEventDetails(event)}
          >
            <span aria-hidden="true" style={styles.eventCardInnerBlur} />
            <div style={styles.eventCardHeader}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={styles.eventTypeBadge}>{event.type}</span>
                {event.price && <span style={styles.eventPriceBadge}><FaTag /> {event.price}</span>}
                {isEventFull(event) && <span style={styles.eventFullBadge}>Full</span>}
              </div>
              <h3 style={styles.eventTitle}>{event.title}</h3>
            </div>
            <div style={styles.eventMeta}>
              <p style={styles.eventMetaItem}><FaCalendarAlt /> {event.date}</p>
              <p style={styles.eventMetaItem}><FaClock /> {event.time}</p>
              <p style={styles.eventMetaItem}><FaMapMarkerAlt /> {event.venue}</p>
            </div>
            <p style={styles.eventDescription}>{event.description}</p>
            {event.maxAttendees > 0 && (
              <div style={styles.capacityWrap}>
                <div style={styles.capacityLabelRow}>
                  <span style={styles.capacityLabel}><FaUsers /> {event.attendees} / {event.maxAttendees} joined</span>
                  <span style={{ ...styles.capacityLabel, color: isEventFull(event) ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                    {isEventFull(event) ? "No spots left" : `${spotsLeft(event)} spots left`}
                  </span>
                </div>
                <div style={styles.capacityBarBg}>
                  <div style={{ ...styles.capacityBarFill, width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%`, background: isEventFull(event) ? "var(--eco-c7)" : "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))" }} />
                </div>
              </div>
            )}
            <div style={styles.speakerInfo}>
              <SpeakerAvatar speaker={event.speaker} style={styles.speakerImage} />
              <span style={styles.speakerName}>{event.speaker.name}</span>
            </div>
<button
              type="button"
              style={{ ...styles.rsvpButton, ...(isEventFull(event) ? styles.rsvpButtonDisabled : {}) }}
              disabled={isEventFull(event)}
              onClick={(e) => handleJoinNowClick(e, event)}
              onMouseEnter={(e) => { if (!isEventFull(event)) e.currentTarget.style.transform = 'scale(1.035)'; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isEventFull(event) ? "Event Full" : "Join Now"}
            </button>
          </div>
        ))}
      </div>

      {showEventDetailsModal && selectedEvent && ReactDOM.createPortal(
        <div style={styles.modalOverlay} onClick={() => setShowEventDetailsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalCloseBtn} onClick={() => setShowEventDetailsModal(false)}><FaTimes /></button>
            <h2 style={styles.modalTitle}>{selectedEvent.title}</h2>
            <div style={styles.modalMeta}>
              <p style={styles.eventMetaItem}><FaCalendarAlt /> {selectedEvent.date}</p>
              <p style={styles.eventMetaItem}><FaClock /> {selectedEvent.time}</p>
              <p style={styles.eventMetaItem}><FaMapMarkerAlt /> {selectedEvent.venue}</p>
            </div>
            <p style={styles.modalFullDescription}>{selectedEvent.fullDescription}</p>
            {selectedEvent.maxAttendees > 0 && (
              <div style={styles.capacityWrap}>
                <div style={styles.capacityLabelRow}>
                  <span style={styles.capacityLabel}><FaUsers /> {selectedEvent.attendees} / {selectedEvent.maxAttendees} joined</span>
                  <span style={{ ...styles.capacityLabel, color: isEventFull(selectedEvent) ? "var(--eco-c13)" : "var(--eco-c13)" }}>
                    {isEventFull(selectedEvent) ? "No spots left" : `${spotsLeft(selectedEvent)} spots left`}
                  </span>
                </div>
                <div style={styles.capacityBarBg}>
                  <div style={{ ...styles.capacityBarFill, width: `${Math.min((selectedEvent.attendees / selectedEvent.maxAttendees) * 100, 100)}%`, background: isEventFull(selectedEvent) ? "var(--eco-c7)" : "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))" }} />
                </div>
              </div>
            )}
            <div style={styles.speakerInfoModal}>
              <SpeakerAvatar speaker={selectedEvent.speaker} style={styles.speakerImage} />
              <span style={styles.speakerName}>Speaker: {selectedEvent.speaker.name}</span>
            </div>
<button
              type="button"
              style={{ ...styles.rsvpButtonModal, ...(isEventFull(selectedEvent) ? styles.rsvpButtonDisabled : {}) }}
              disabled={isEventFull(selectedEvent)}
              onClick={(e) => handleJoinNowClick(e, selectedEvent)}
              onMouseEnter={(e) => { if (!isEventFull(selectedEvent)) e.currentTarget.style.transform = 'scale(1.035)'; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isEventFull(selectedEvent) ? "Event Full" : "Join Now"}
            </button>
          </div>
        </div>,
        document.body
      )}

{/* Scroll Indicator Dots - Mobile Only */}
      {isMobile && (
        <div style={styles.indicatorRow}>
          {filteredEvents.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(activeIndex === i ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>
      )}

{/* Ideas Suggestion Modal */}
      {showIdeasModal && joiningEvent && ReactDOM.createPortal(
        <div style={styles.ideasModalOverlay} onClick={handleCancelJoin}>
          <div style={styles.ideasModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.ideasModalCloseBtn} onClick={handleCancelJoin}><FaTimes /></button>
            <h2 style={styles.ideasModalTitle}>You're joining:</h2>
            <div style={styles.ideasEventInfo}>
              <span style={styles.ideasEventTypeBadge}>{joiningEvent.type}</span>
              <h3 style={styles.ideasEventTitle}>{joiningEvent.title}</h3>
              <p style={styles.ideasEventDate}><FaCalendarAlt /> {joiningEvent.date} • {joiningEvent.time}</p>
            </div>
            
            <div style={styles.ideasSection}>
              <h4 style={styles.ideasSectionTitle}>Preparation Tips</h4>
              <ul style={styles.ideasTipsList}>
                {getSuggestionsForEvent(joiningEvent.type).tips.map((tip, index) => (
                  <li key={index} style={styles.ideasTipItem}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div style={styles.ideasSection}>
              <h4 style={styles.ideasSectionTitle}>Related Events</h4>
              <p style={styles.ideasRelatedText}>
                Check out our {getSuggestionsForEvent(joiningEvent.type).relatedEvents.join(" and ")} events for more learning opportunities!
              </p>
            </div>
            
            <div style={styles.ideasButtonRow}>
              <button type="button" style={styles.ideasCancelBtn} onClick={handleCancelJoin}>
                Cancel
              </button>
              <button type="button" style={styles.ideasConfirmBtn} onClick={handleConfirmJoin}>
                Confirm Join
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccessModal && confirmedEvent && ReactDOM.createPortal(
        <div style={styles.successModalOverlay} onClick={handleCloseSuccess}>
          <div style={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successCheckmark}><Check size={28} color="var(--eco-c9)" /></div>
            <h2 style={styles.successTitle}>You're Confirmed!</h2>
            <p style={styles.successSubtitle}>You've successfully joined:</p>
            <div style={styles.successEventCard}>
              <span style={styles.successEventType}>{confirmedEvent.type}</span>
              <h3 style={styles.successEventTitle}>{confirmedEvent.title}</h3>
              <p style={styles.successEventDate}><FaCalendarAlt /> {confirmedEvent.date} • {confirmedEvent.time}</p>
            </div>
<p style={styles.successMessage}>
              Check your email for confirmation details and event updates. We can't wait to see you there!
            </p>
            <div style={styles.calendarButtonsRow}>
              <button type="button" style={styles.addToCalendarBtn} onClick={() => addToCalendar(confirmedEvent)} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Add to Calendar
              </button>
              <button type="button" style={styles.successButton} onClick={handleCloseSuccess}>
                Awesome, Thanks!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
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
    maxWidth: "1100px",
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
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
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
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 auto 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  titleMobile: {
    fontSize: "clamp(26px, 7.5vw, 36px)",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    marginBottom: "40px",
    fontSize: "clamp(14px, 1.6vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: "700px",
  },
  bodyMobile: {
    marginBottom: "24px",
  },
  searchBarWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "520px",
    padding: "10px 18px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    color: "#000",
    fontFamily: "inherit",
  },
  searchClearBtn: {
    border: "none",
    background: "rgba(0,0,0,0.06)",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    color: "rgba(0,0,0,0.5)",
    cursor: "pointer",
    flexShrink: 0,
  },
  filterTabs: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px) saturate(150%)",
    WebkitBackdropFilter: "blur(10px) saturate(150%)",
  },
  filterTabsMobile: {
    padding: "8px",
    gap: "8px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid transparent",
    color: "rgba(0,0,0,0.7)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.25), rgba(var(--eco-c5-rgb), 0.25))",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.4)",
    color: "var(--eco-c15)",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
  },
  filterBtnHover: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.12), rgba(var(--eco-c5-rgb), 0.12))",
    color: "var(--eco-c15)",
    boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.08)",
  },
  eventGrid: {
    display: "flex", // Changed to flex for horizontal scrolling
    flexWrap: "nowrap", // Prevent wrapping
    gap: "24px",
    width: "100%",
    overflowX: "auto", // Enable horizontal scrolling
    scrollSnapType: "x mandatory", // For smooth snapping
    WebkitOverflowScrolling: "touch", // For iOS smooth scrolling
    paddingBottom: "16px", // Add padding to show scrollbar and bottom shadow
  },
  eventGridMobile: {
    width: "100%",
    padding: "0 16px 16px", // Adjust padding for mobile
    scrollPadding: "0 16px", // For scroll snapping
    gap: "16px",
    justifyContent: "flex-start", // Align items to the start
  },
  eventCard: {
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
    gap: "10px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    flexShrink: 0, // Prevent cards from shrinking
    width: "300px", // Fixed width for horizontal scrolling
    cursor: "pointer",
  },
  eventCardInnerBlur: {
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
  eventCardHov: {
    transform: "scale(1.025)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  eventCardMobile: { // Ensure mobile cards also have a fixed width for scrolling
    transform: "scale(1.025)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  eventCardHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    position: "relative",
    zIndex: 1,
  },
  eventTypeBadge: {
    background: "var(--eco-c11)",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 2px 8px rgba(var(--eco-c11-rgb), 0.2)",
  },
  eventPriceBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    color: "var(--eco-c13)",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  eventFullBadge: {
    background: "rgba(var(--eco-c7-rgb), 0.15)",
    color: "var(--eco-c13)",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  capacityWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
    position: "relative",
    zIndex: 1,
  },
  capacityLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  capacityLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.6)",
  },
  capacityBarBg: {
    width: "100%",
    height: "6px",
    background: "rgba(0,0,0,0.06)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  capacityBarFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease-out",
  },
  rsvpButtonDisabled: {
    background: "rgba(0,0,0,0.08)",
    color: "rgba(0,0,0,0.45)",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  eventTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
    lineHeight: 1.3,
  },
  eventMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    width: "100%",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    padding: "10px 0",
    margin: "10px 0",
    position: "relative",
    zIndex: 1,
  },
  eventMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    margin: 0,
  },
  eventDescription: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.8)",
    lineHeight: 1.5,
    margin: "0 0 15px",
    flexGrow: 1,
    position: "relative",
    zIndex: 1,
  },
  speakerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "auto",
    position: "relative",
    zIndex: 1,
  },
  speakerImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--eco-c11)",
  },
  speakerName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--eco-c13)",
  },
  rsvpButton: {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "var(--eco-c19)",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "15px",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
    position: "relative",
    zIndex: 1,
  },
  modalOverlay: modalOverlay(MODAL_LAYER.base),
  modalContent: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.95), rgba(var(--eco-c0-rgb), 0.9))",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "24px",
    padding: "30px",
    maxWidth: "600px",
    width: "100%",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    textAlign: "left",
  },
  modalCloseBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "rgba(0,0,0,0.05)",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "rgba(0,0,0,0.6)",
    cursor: "pointer",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#000",
    margin: 0,
    lineHeight: 1.3,
  },
  modalMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    padding: "12px 0",
    margin: "10px 0",
  },
  modalFullDescription: {
    fontSize: "15px",
    color: "rgba(0,0,0,0.85)",
    lineHeight: 1.6,
    margin: 0,
  },
  speakerInfoModal: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "10px",
  },
  rsvpButtonModal: {
    display: "block",
    width: "100%",
    padding: "12px 15px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "var(--eco-c19)",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
    textDecoration: "none",
    textAlign: "center",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "16px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
  },
dotActive: {
    background: "var(--eco-c11)",
    transform: "scale(1.2)",
  },
  ideasModalOverlay: modalOverlay(MODAL_LAYER.nested),
  ideasModalContent: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.98), rgba(var(--eco-c0-rgb), 0.95))",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.3)",
    borderRadius: "24px",
    padding: "28px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25), 0 0 30px rgba(var(--eco-c5-rgb), 0.15)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left",
    animation: "fadeInUp 0.3s cubic-bezier(.22,1,.36,1) both",
  },
  ideasModalCloseBtn: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "rgba(0,0,0,0.06)",
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
    transition: "all 0.2s ease",
  },
  ideasModalTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--eco-c13)",
    margin: 0,
    paddingBottom: "8px",
    borderBottom: "2px solid rgba(var(--eco-c5-rgb), 0.3)",
  },
  ideasEventInfo: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.1), rgba(var(--eco-c5-rgb), 0.1))",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.2)",
  },
  ideasEventTypeBadge: {
    background: "var(--eco-c11)",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  ideasEventTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    margin: "8px 0 6px",
    lineHeight: 1.3,
  },
  ideasEventDate: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    margin: 0,
  },
  ideasSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  ideasSectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  ideasTipsList: {
    margin: 0,
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ideasTipItem: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.8)",
    lineHeight: 1.5,
  },
  ideasRelatedText: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.5,
    margin: 0,
    fontStyle: "italic",
  },
  ideasButtonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  ideasCancelBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "rgba(0,0,0,0.7)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
ideasConfirmBtn: {
    flex: 2,
    padding: "12px 16px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "var(--eco-c19)",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.3), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "all 0.2s ease",
  },
  successModalOverlay: modalOverlay(MODAL_LAYER.nestedConfirm),
  successModalContent: {
    background: "linear-gradient(160deg, rgba(255,255,255,0.99), rgba(var(--eco-c3-rgb), 0.97))",
    border: "2px solid rgba(var(--eco-c5-rgb), 0.5)",
    borderRadius: "28px",
    padding: "32px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 50px rgba(var(--eco-c5-rgb), 0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "16px",
    animation: "fadeInUp 0.4s cubic-bezier(.22,1,.36,1) both",
  },
  successCheckmark: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c7))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(var(--eco-c7-rgb), 0.4)",
    marginBottom: "8px",
  },
  successTitle: {
    fontSize: "26px",
    fontWeight: 800,
    color: "var(--eco-c13)",
    margin: 0,
  },
  successSubtitle: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.6)",
    margin: 0,
  },
  successEventCard: {
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.15), rgba(var(--eco-c5-rgb), 0.15))",
    borderRadius: "16px",
    padding: "16px 20px",
    border: "1px solid rgba(var(--eco-c5-rgb), 0.3)",
    width: "100%",
    textAlign: "left",
  },
  successEventType: {
    background: "var(--eco-c11)",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  successEventTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#000",
    margin: "8px 0 6px",
    lineHeight: 1.3,
  },
  successEventDate: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "rgba(0,0,0,0.7)",
    margin: 0,
  },
  successMessage: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.5,
    margin: 0,
  },
successButton: {
    width: "100%",
    padding: "14px 20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--eco-c11), var(--eco-c7))",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(var(--eco-c11-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    transition: "all 0.2s ease",
  },
  calendarButtonsRow: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  addToCalendarBtn: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(var(--eco-c11-rgb), 0.3)",
    color: "var(--eco-c13)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  calendarButton: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "var(--eco-c13)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default EventsAndWorkshopsPage;