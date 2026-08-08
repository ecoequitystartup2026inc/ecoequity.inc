import React, { useState } from "react";
import Reveal, { RevealStyles } from "./Reveal";
import { Mail, Phone, MapPin, Clock, ArrowRight, ArrowUp, Leaf, ShieldCheck, Sprout, Truck, MessageCircle, Send, Check, ChevronDown } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import ComingSoonBanner from "./ComingSoonBanner";

/* ── Site footer, closing the home page ──────────────────────────────────
   Unlike the landing sections above it this is NOT a glass container card:
   it's a solid dark-green slab that runs edge to edge of the content column
   and squares off at the bottom, so the page ends on a hard floor instead of
   fading out. Colours come from the dark end of the sage ramp (var(--eco-c15) →
   var(--eco-c19)) with light sage type on top. Every link points at a route that
   actually exists — no placeholder anchors. */

const CREAM = "var(--eco-c0)";
const CREAM_SOFT = "rgba(var(--eco-c0-rgb), 0.6)";
const SAGE = "var(--eco-c7)";
const SAGE_LIGHT = "var(--eco-c5)";
const HAIRLINE = "rgba(var(--eco-c0-rgb), 0.12)";

/* The inbox the Admin Portal reads. The Get in Touch page that used to write
   here is gone — this footer is now the site's only contact surface. */
const CONTACT_MESSAGES_STORAGE_KEY = "ecoequity_contact_messages";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Farm-Direct Shop", nav: "Shop All Products" },
      { label: "Starter Kits & Toolsets", nav: "Starter Kits & Toolsets" },
      { label: "AI Plant Doctor", nav: "AIPlantDoctor" },
      { label: "Surplus Exchange", nav: "SurplusExchangePage" },
      { label: "Farm Planner", nav: "Farm Planner" },
      { label: "Seasonal Harvest", nav: "Seasonal Harvest" },
    ],
  },
  {
    title: "Community & Learning",
    links: [
      { label: "Community Forum", nav: "Community" },
      { label: "Events & Workshops", nav: "EventsAndWorkshops" },
      { label: "Specialist Certification", nav: "Specialist Certification" },
      { label: "Native Seed Bank", nav: "NativeSeedBankPage" },
      { label: "Our Impact", nav: "OurImpactPage" },
      { label: "Learn More", nav: "Learn More" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", nav: "About Us" },
      { label: "Who We Serve", nav: "Target Market" },
      { label: "LGU Partnerships", nav: "LGUPartnershipPage" },
      { label: "Income Generation", nav: "IncomeGenerationPage" },
      { label: "AI Data Subscription", nav: "AI Data Subscription" },
      { label: "Get in Touch", nav: "Contact" },
    ],
  },
];

const SOCIALS = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaXTwitter, label: "X (Twitter)" },
  { Icon: FaThreads, label: "Threads" },
  { Icon: FaInstagram, label: "Instagram" },
];

/* The four questions support fields most often. They used to sit at the bottom
   of the Get in Touch page; answering them here means a visitor resolves them
   without leaving the landing scroll. */
const FAQS = [
  {
    q: "How soon will I get a response?",
    a: "Our team typically replies within 1–2 business days. Urgent product support requests are prioritized.",
  },
  {
    q: "Do you offer partnerships with farms and cooperatives?",
    a: "Yes! We actively partner with local farms, cooperatives, and agri-businesses. Send us a message and tell us about your goals.",
  },
  {
    q: "Where are you located?",
    a: "We're based on Gov. Pack Rd., Baguio City, Benguet. You can also reach us anytime by email or phone.",
  },
  {
    q: "Can I get help with an existing order?",
    a: "Absolutely. Message us with your order number so we can assist you faster.",
  },
];

/* The reassurance strip above the copyright line — the last thing a first-time
   visitor reads before deciding whether to trust the shop. */
const TRUST = [
  { Icon: ShieldCheck, title: "Verified growers", copy: "Every seller is vetted before listing." },
  { Icon: Truck, title: "Farm-direct delivery", copy: "Harvested to order, no middleman." },
  { Icon: Sprout, title: "Grown in PH soil", copy: "Native, climate-suited varieties." },
];

function FooterLink({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: 0, border: "none", background: "transparent",
        textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        fontSize: "13px", fontWeight: 550, lineHeight: 1.5,
        color: hov ? CREAM : CREAM_SOFT,
        transform: hov ? "translateX(3px)" : "none",
        transition: "color 0.22s ease, transform 0.22s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {label}
    </button>
  );
}

function SocialButton({ Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer",
        color: hov ? "var(--eco-c19)" : CREAM_SOFT,
        background: hov ? SAGE_LIGHT : "rgba(var(--eco-c0-rgb), 0.07)",
        border: `1px solid ${hov ? "transparent" : HAIRLINE}`,
        boxShadow: "none",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "transform 0.24s cubic-bezier(.22,1,.36,1), background 0.24s ease, color 0.24s ease, border-color 0.24s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon size={15} />
    </button>
  );
}

/* The compact message box that sits opposite the closing CTA — a small chat
   panel. Two fields and a send key: enough to start a conversation. Since the
   Contact page was removed this is where every "Get in Touch" click lands, and
   messages go straight to the localStorage inbox the Admin Portal reads. */
function FooterMessageBox({ isMobile }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const [sendHov, setSendHov] = useState(false);
  const [sent, setSent] = useState(false);

  const fieldStyle = (name) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    borderRadius: "11px",
    background: focused === name ? "rgba(var(--eco-c0-rgb), 0.12)" : "rgba(var(--eco-c0-rgb), 0.07)",
    border: `1px solid ${focused === name ? SAGE_LIGHT : HAIRLINE}`,
    color: CREAM,
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: 1.5,
    outline: "none",
    transition: "background 0.2s ease, border-color 0.2s ease",
  });

  const submit = (e) => {
    e.preventDefault();
    const mail = email.trim();
    const body = message.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setError("Enter a valid email so we can reply.");
      return;
    }
    if (!body) {
      setError("Add a short message.");
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY) || "[]");
      localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify([{
        id: `MSG-${Date.now()}`,
        name: "(From footer)",
        email: mail,
        category: "General Inquiry",
        subject: "(No subject)",
        message: body,
        date: new Date().toLocaleString(),
        status: "New",
      }, ...existing]));
    } catch (err) {
      // Non-fatal — the sender still gets their confirmation.
    }
    setEmail("");
    setMessage("");
    setError("");
    setSent(true);
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex", flexDirection: "column", gap: "9px",
        width: isMobile ? "100%" : "clamp(290px, 25vw, 340px)",
        flex: isMobile ? "1 1 auto" : "0 0 auto",
        boxSizing: "border-box",
        padding: "14px",
        borderRadius: "18px",
        background: "rgba(var(--eco-c0-rgb), 0.06)",
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "inset 0 1px 0 rgba(var(--eco-c0-rgb), 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "28px", height: "28px", borderRadius: "10px", flexShrink: 0,
          background: "rgba(var(--eco-c7-rgb), 0.22)",
        }}>
          <MessageCircle size={14} color={SAGE_LIGHT} strokeWidth={2.5} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 750, color: CREAM, lineHeight: 1.3 }}>
            Send us a message
          </span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: CREAM_SOFT, lineHeight: 1.4 }}>
            Usually answered in 1–2 days
          </span>
        </span>
      </div>

      {sent ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0 2px" }}>
          <Check size={15} color={SAGE_LIGHT} strokeWidth={3} />
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: CREAM }}>
            Sent — we'll be in touch.
          </span>
          <button
            type="button"
            onClick={() => setSent(false)}
            style={{
              marginLeft: "auto", padding: 0, border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "inherit", fontSize: "11.5px",
              fontWeight: 700, color: SAGE_LIGHT,
            }}
          >
            New
          </button>
        </div>
      ) : (
        <>
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            aria-label="Your email"
            onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            style={fieldStyle("email")}
          />
          <textarea
            rows={2}
            value={message}
            placeholder="How can we help?"
            aria-label="Your message"
            onChange={(e) => { setMessage(e.target.value.slice(0, 400)); if (error) setError(""); }}
            onFocus={() => setFocused("message")}
            onBlur={() => setFocused(null)}
            style={{ ...fieldStyle("message"), resize: "none", minHeight: "58px" }}
          />
          {error && (
            <span style={{ fontSize: "11px", fontWeight: 600, color: SAGE_LIGHT }}>{error}</span>
          )}
          <button
            type="submit"
            onMouseEnter={() => setSendHov(true)}
            onMouseLeave={() => setSendHov(false)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px",
              minHeight: "38px", padding: "0 16px", borderRadius: "11px", cursor: "pointer",
              fontFamily: "inherit", fontSize: "12.5px", fontWeight: 750,
              background: sendHov ? CREAM : SAGE_LIGHT,
              border: "1px solid transparent",
              color: "var(--eco-c19)",
              transform: sendHov ? "translateY(-2px)" : "none",
              transition: "transform 0.24s cubic-bezier(.22,1,.36,1), background 0.24s ease",
            }}
          >
            <Send size={14} strokeWidth={2.6} />
            Send
          </button>
        </>
      )}
    </form>
  );
}

/* One collapsed FAQ row. Closed rows sit flush with the slab; opening one lifts
   it onto the same faint panel the support card uses. */
function FooterFaqItem({ item, isOpen, onToggle }) {
  const [hov, setHov] = useState(false);
  const lit = isOpen || hov;
  return (
    <div style={{
      overflow: "hidden",
      borderRadius: "14px",
      background: isOpen ? "rgba(var(--eco-c0-rgb), 0.07)" : "rgba(var(--eco-c0-rgb), 0.035)",
      border: `1px solid ${lit ? "rgba(var(--eco-c0-rgb), 0.22)" : HAIRLINE}`,
      transition: "background 0.24s ease, border-color 0.24s ease",
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          width: "100%", padding: "13px 15px",
          border: "none", background: "transparent", cursor: "pointer",
          fontFamily: "inherit", textAlign: "left",
          fontSize: "13.5px", fontWeight: 650, lineHeight: 1.45,
          color: lit ? CREAM : CREAM_SOFT,
          transition: "color 0.22s ease",
        }}
      >
        <span>{item.q}</span>
        <ChevronDown
          size={15}
          strokeWidth={2.6}
          aria-hidden="true"
          style={{
            flexShrink: 0, color: SAGE_LIGHT,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.3s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </button>
      <div style={{
        overflow: "hidden",
        maxHeight: isOpen ? "190px" : "0px",
        opacity: isOpen ? 1 : 0,
        transition: "max-height 0.32s cubic-bezier(.4,0,.2,1), opacity 0.28s ease",
      }}>
        <p style={{
          margin: 0, padding: "0 15px 14px",
          fontSize: "12.5px", fontWeight: 500, lineHeight: 1.62, color: CREAM_SOFT,
        }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

/* The support card — the one lit panel in an otherwise flat slab, so the eye
   lands on how to reach a human before it reaches the legal line. */
function SupportCard({ isMobile, supportEmail }) {
  const [linkHov, setLinkHov] = useState(false);
  /* Advisor booking isn't live yet, so the CTA raises the shared Coming Soon
     card instead of navigating to a page that can't take a booking. The banner
     portals to document.body, so this card's overflow:hidden can't clip it. */
  const [comingSoon, setComingSoon] = useState(false);
  const rows = [
    { Icon: Mail, label: supportEmail, href: `mailto:${supportEmail}` },
    { Icon: Phone, label: "0927-427-9760", href: "tel:+639274279760" },
    { Icon: Clock, label: "Mon–Sat, 8:00am–6:00pm PHT" },
    { Icon: MapPin, label: "Gov Pack Rd. Baguio City, Benguet, Philippines" },
  ];
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", gap: "12px",
      padding: isMobile ? "16px 15px" : "22px 20px",
      borderRadius: "20px",
      background: "rgba(var(--eco-c0-rgb), 0.06)",
      border: `1px solid ${HAIRLINE}`,
      boxShadow: "inset 0 1px 0 rgba(var(--eco-c0-rgb), 0.08)",
    }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "flex-start",
          padding: "5px 11px", borderRadius: "999px",
          background: "rgba(var(--eco-c0-rgb), 0.08)", border: `1px solid ${HAIRLINE}`,
          fontSize: "10px", fontWeight: 700, letterSpacing: "1.1px",
          textTransform: "uppercase", color: SAGE_LIGHT,
        }}>
          <ShieldCheck size={11} strokeWidth={2.6} /> Support
        </span>
        <span style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 800, color: CREAM, lineHeight: 1.3 }}>
          Talk to a real person — we reply within 1–2 business days.
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {rows.map(({ Icon, label, href }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <span aria-hidden="true" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "26px", height: "26px", borderRadius: "9px", flexShrink: 0,
                background: "rgba(var(--eco-c7-rgb), 0.22)",
              }}>
                <Icon size={13} color={SAGE_LIGHT} strokeWidth={2.5} />
              </span>
              {href ? (
                <a href={href} style={{ fontSize: "12.5px", fontWeight: 600, color: CREAM, textDecoration: "none", overflowWrap: "anywhere" }}>
                  {label}
                </a>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: 550, color: CREAM_SOFT }}>{label}</span>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setComingSoon(true)}
          onMouseEnter={() => setLinkHov(true)}
          onMouseLeave={() => setLinkHov(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "flex-start",
            padding: 0, border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontSize: "12.5px", fontWeight: 750, color: SAGE_LIGHT,
          }}
        >
          Talk to an advisor
          <ArrowRight size={14} strokeWidth={2.6} style={{
            transform: linkHov ? "translateX(4px)" : "none",
            transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
          }} />
        </button>
      </div>
      {comingSoon && (
        <ComingSoonBanner
          title="Talk to an Advisor — Coming Soon"
          message="Our advisors aren't taking bookings through the site just yet. In the meantime, email or call us using the details above — a real person replies within 1–2 business days."
          closeLabel="Close announcement"
          /* Mounted on demand, so every exit has to clear the flag —
             otherwise the card can't be reopened from the same visit. */
          onDismiss={() => setComingSoon(false)}
        />
      )}
    </div>
  );
}

export default function SiteFooter({
  isMobile = false,
  onNavigate = () => {},
  platformName = "EcoEquity",
  supportEmail = "ecoequity.inc2026@gmail.com",
  onScrollTop,
}) {
  const [topHov, setTopHov] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const year = new Date().getFullYear();

  return (
    <Reveal
      as="footer"
      /* The slab is authored dark already, so the page-wide inversion dark
         mode applies would turn it into a pale sage panel — the one block on
         the page that got *lighter*. Opting out keeps it the dark floor the
         page ends on in both themes; the cream type and light icons on top
         are already correct against it. */
      data-no-invert
      style={{
        position: "relative", overflow: "hidden",
        /* Edge to edge. On mobile the shell owns the page gutter, so the slab
           pulls back out through it (the shell clips at its *padding* box, so
           the gutter area is fair game) and touches both screen edges. On
           desktop the home scroller clips at its own border box, so there the
           slab fills the content column instead. */
        width: isMobile ? "auto" : "100%",
        marginLeft: isMobile ? "calc(-1 * (var(--mobile-gutter) + var(--safe-left)))" : 0,
        marginRight: isMobile ? "calc(-1 * (var(--mobile-gutter) + var(--safe-right)))" : 0,
        /* …and on mobile down through the shell's reserved tab-bar space, so
           the slab runs to the bottom of the screen and the floating tab bar
           sits on top of it. The extra bottom padding below re-reserves that
           room, so the last row is never trapped under the bar. */
        marginBottom: isMobile ? "calc(-1 * (var(--bottom-nav-space) + 20px))" : 0,
        /* The desktop home scroller is a column flexbox, so this footer is a
           flex item — and `overflow: hidden` zeroes its automatic minimum
           size. Without this it gets crushed to its padding (~70px) and the
           whole lower half of the footer becomes unreachable. */
        flexShrink: 0,
        marginTop: isMobile ? "30px" : "clamp(40px, 6vh, 72px)",
        /* Square box, no container card: the slab runs the full width of the
           content column and ends flat at the bottom of the scroller. */
        borderRadius: 0,
        border: "none",
        borderTop: `1px solid ${HAIRLINE}`,
        /* The slab ends just under the copyright line — no dead space below
           it. On mobile the tab-bar reserve stays (the floating bar would
           otherwise sit on top of the last row); the FAB column overlaps the
           back-to-top button's right edge, not the copyright text. */
        padding: isMobile
          ? "30px calc(20px + var(--safe-right)) calc(26px + var(--bottom-nav-space)) calc(20px + var(--safe-left))"
          : "clamp(44px, 5vw, 64px) clamp(28px, 4vw, 56px) 28px",
        background: "linear-gradient(165deg, var(--eco-c15) 0%, var(--eco-c17) 55%, var(--eco-c19) 100%)",
        boxShadow: "inset 0 1px 0 rgba(var(--eco-c0-rgb), 0.06)",
        color: CREAM,
      }}
    >
      <RevealStyles />

      {/* Top wash — one soft light source in the upper-left, so the slab reads
          as lit rather than printed. */}
      <span aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(70% 60% at 15% 0%, rgba(var(--eco-c7-rgb), 0.2), transparent 70%)",
      }} />

      {/* ── Closing CTA band ── the headline claims the left, the small message
          box sits opposite it and fills what was dead space on the right. They
          share a baseline on desktop so the box's bottom edge lines up with the
          band's rule rather than floating mid-band. */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "flex-end",
        justifyContent: "space-between",
        gap: isMobile ? "22px" : "clamp(24px, 4vw, 56px)",
        paddingBottom: isMobile ? "28px" : "clamp(32px, 4vw, 44px)",
        marginBottom: isMobile ? "28px" : "clamp(32px, 4vw, 44px)",
        borderBottom: `1px solid ${HAIRLINE}`,
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: "9px",
          maxWidth: "560px", minWidth: 0, flex: "1 1 auto",
        }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: isMobile ? "22px" : "clamp(26px, 2.6vw, 34px)",
            fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.2, color: CREAM,
          }}>
            Start your backyard farm this season.
          </span>
          <span style={{ fontSize: isMobile ? "13px" : "14px", fontWeight: 500, lineHeight: 1.65, color: CREAM_SOFT }}>
            Kits, seeds, planning tools and a community of growers — everything you
            need to turn a few square metres into food on the table.
          </span>
        </div>

        <FooterMessageBox isMobile={isMobile} />
      </div>

      {/* ── Upper block: brand · link columns · support card ── */}
      <div style={{
        position: "relative", display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          /* The support card holds a full email address on one line, so it
             gets the widest track; the link columns only need their longest
             label ("Specialist Certification"). */
          : "minmax(0,1.35fr) minmax(0,0.92fr) minmax(0,1.05fr) minmax(0,0.92fr) minmax(0,1.65fr)",
        gap: isMobile ? "28px" : "clamp(20px, 2.4vw, 40px)",
        alignItems: "start",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/Eco.png" alt={`${platformName} Inc logo`} style={{ width: "36px", height: "36px", objectFit: "contain" }} />
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontSize: "18px",
              fontWeight: 700, letterSpacing: "-0.5px", color: CREAM,
            }}>
              {platformName}<span style={{ color: SAGE }}>.Inc</span>
            </span>
          </div>
          <p style={{
            margin: 0, maxWidth: "300px", fontSize: "13px",
            fontWeight: 500, lineHeight: 1.7, color: CREAM_SOFT,
          }}>
            A digital-first platform helping Filipino households grow food, trade
            surplus and earn sustainably — starting one backyard at a time.
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "7px", alignSelf: "flex-start",
            padding: "6px 13px", borderRadius: "999px",
            background: "rgba(var(--eco-c0-rgb), 0.07)", border: `1px solid ${HAIRLINE}`,
            fontSize: "10.5px", fontWeight: 700, letterSpacing: "1px",
            textTransform: "uppercase", color: SAGE_LIGHT,
          }}>
            <Leaf size={12} strokeWidth={2.6} /> Built in the Philippines
          </span>
          <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
            {SOCIALS.map(({ Icon, label }) => (
              <SocialButton key={label} Icon={Icon} label={label} />
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 750, letterSpacing: "1.2px",
              textTransform: "uppercase", color: SAGE_LIGHT,
            }}>
              {col.title}
            </span>
            {col.links.map((link) => (
              <FooterLink key={link.nav} label={link.label} onClick={() => onNavigate(link.nav)} />
            ))}
          </div>
        ))}

        <SupportCard isMobile={isMobile} supportEmail={supportEmail} />
      </div>

      {/* ── FAQ ── moved here from the Get in Touch page. One row open at a
          time, so the slab's height only ever grows by a single answer. */}
      <div style={{
        position: "relative",
        marginTop: isMobile ? "28px" : "clamp(34px, 4vw, 48px)",
        paddingTop: isMobile ? "22px" : "28px",
        borderTop: `1px solid ${HAIRLINE}`,
      }}>
        <span style={{
          display: "block", marginBottom: "14px",
          fontSize: "11px", fontWeight: 750, letterSpacing: "1.2px",
          textTransform: "uppercase", color: SAGE_LIGHT,
        }}>
          Frequently asked
        </span>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
          gap: "10px",
          alignItems: "start",
        }}>
          {FAQS.map((item, i) => (
            <FooterFaqItem
              key={item.q}
              item={item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* ── Trust strip ── */}
      <div style={{
        position: "relative", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))",
        gap: isMobile ? "14px" : "clamp(18px, 2.4vw, 38px)",
        marginTop: isMobile ? "28px" : "clamp(34px, 4vw, 48px)",
        paddingTop: isMobile ? "22px" : "28px",
        borderTop: `1px solid ${HAIRLINE}`,
      }}>
        {TRUST.map(({ Icon, title, copy }) => (
          <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
            <span aria-hidden="true" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "40px", height: "40px", borderRadius: "13px", flexShrink: 0,
              background: "rgba(var(--eco-c7-rgb), 0.18)", border: `1px solid ${HAIRLINE}`,
            }}>
              <Icon size={19} color="#ffffff" strokeWidth={2.4} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
              <span style={{ fontSize: "15px", fontWeight: 750, color: CREAM }}>{title}</span>
              <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.55, color: CREAM_SOFT }}>{copy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lower bar: copyright and back-to-top ── */}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? "16px" : "20px",
        marginTop: isMobile ? "24px" : "clamp(28px, 3.5vw, 40px)",
        paddingTop: isMobile ? "18px" : "22px",
        borderTop: `1px solid ${HAIRLINE}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: isMobile ? "8px 12px" : "14px",
          fontSize: "12px", fontWeight: 500, color: "rgba(var(--eco-c0-rgb), 0.45)",
        }}>
          <span>© {year} {platformName} Inc. All rights reserved.</span>
          <span aria-hidden="true" style={{ opacity: isMobile ? 0 : 0.4 }}>•</span>
          <span>Growing food security, one household at a time.</span>
        </div>

        {/* Back to top — the home page is one long scroller, so the trip back
            up is otherwise a long drag. */}
        {onScrollTop && (
          <button
            type="button"
            aria-label="Back to top"
            title="Back to top"
            onClick={onScrollTop}
            onMouseEnter={() => setTopHov(true)}
            onMouseLeave={() => setTopHov(false)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
              alignSelf: isMobile ? "stretch" : "auto",
              /* The slab now runs to the bottom of the window, so this row sits
                 inside the band the fixed support FABs occupy — they are 164px
                 of buttons ending 28px from the right edge (App.js,
                 supportActionsCluster), and they would sit right on top of
                 this button. Step left of the whole cluster; the gap it leaves
                 is where the FABs float. */
              marginRight: isMobile ? 0 : "calc(192px + 14px - clamp(28px, 4vw, 56px))",
              minHeight: "44px", padding: "0 18px", borderRadius: "999px", cursor: "pointer",
              fontFamily: "inherit", fontSize: "12.5px", fontWeight: 700,
              background: topHov ? "rgba(var(--eco-c0-rgb), 0.12)" : "rgba(var(--eco-c0-rgb), 0.06)",
              border: `1px solid ${topHov ? "rgba(var(--eco-c0-rgb), 0.3)" : HAIRLINE}`,
              color: CREAM,
              transform: topHov ? "translateY(-3px)" : "none",
              transition: "transform 0.26s cubic-bezier(.22,1,.36,1), background 0.26s ease, border-color 0.26s ease",
            }}
          >
            <ArrowUp size={16} strokeWidth={2.6} />
            Back to top
          </button>
        )}
      </div>
    </Reveal>
  );
}
