import React, { useState, useEffect } from "react";
import { GraduationCap, Handshake, ShoppingCart, Link2, Mail } from "lucide-react";
import Reveal, { RevealStyles, useInView } from "../components/Reveal";

/* `photo` accepts a path under /public; leave it null to fall back to the
   monogram tile. `links` takes an optional `profile` URL and `email` address —
   the matching chip appears on the card automatically. */
const team = [
  {
    name: "Name Surname",
    role: "Founder & Lead",
    focus: "Strategy & Partnerships",
    bio: "Sets the direction of the platform and keeps every release measured against a real household outcome.",
    photo: null,
    links: {},
  },
  {
    name: "Name Surname",
    role: "Operations",
    focus: "Logistics & Programs",
    bio: "Runs day-to-day delivery — starter kits, supplier coordination, and the workshop calendar across partner barangays.",
    photo: null,
    links: {},
  },
  {
    name: "Name Surname",
    role: "Technology",
    focus: "Platform & AI",
    bio: "Builds the plant doctor, the farm planner, and the data layer behind every growing recommendation.",
    photo: null,
    links: {},
  },
  {
    name: "Name Surname",
    role: "Community",
    focus: "Growers & Support",
    bio: "Grows the network of local growers and carries their feedback straight back into the product.",
    photo: null,
    links: {},
  },
];

/* "Juan Dela Cruz" → "JD"; single-word names keep their first two letters. */
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const highlights = [
  {
    Icon: GraduationCap,
    heading: "AI-Guided Education",
    text: "Personalized growing instruction tailored to each household's space, climate, and crops.",
  },
  {
    Icon: Handshake,
    heading: "Community Hub",
    text: "Real-world learning and connection between urban and traditional Filipino farmers.",
  },
  {
    Icon: ShoppingCart,
    heading: "Micro-Commerce Engine",
    text: "A simple marketplace for users to sell local produce and earn supplementary income.",
  },
];

/* Rounded, glass-framed image with an optional caption strip. */
function MediaFrame({ src, alt, caption, ratio = "4 / 3", style }) {
  return (
    <figure style={{ ...styles.mediaFrame, ...style }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ ...styles.mediaImg, aspectRatio: ratio }}
      />
      {caption && (
        <>
          <span aria-hidden="true" style={styles.mediaScrim} />
          <figcaption style={styles.mediaCaption}>{caption}</figcaption>
        </>
      )}
    </figure>
  );
}

function SectionHeading({ eyebrow, children, align = "left" }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{ ...styles.headingBlock, alignItems: align === "center" ? "center" : "flex-start" }}
    >
      <span
        style={{
          ...styles.eyebrow,
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translate3d(0, 10px, 0)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {eyebrow}
      </span>
      <h2
        className="about-heading"
        data-in={inView ? "true" : "false"}
        style={{
          ...styles.subtitle,
          textAlign: align,
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translate3d(0, 16px, 0)",
          transition:
            "opacity 0.7s ease 90ms, transform 0.7s cubic-bezier(.22,1,.36,1) 90ms",
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function AboutUs() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  /* Four portrait cards get too narrow before the desktop breakpoint. */
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth < 1024
  );
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const split = { ...styles.split, ...(isMobile ? styles.splitMobile : {}) };
  const hasPhotos = team.some((m) => m.photo);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <RevealStyles />
      <style>
        {`
          @keyframes aboutDotPulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%      { transform: scale(1.5); opacity: 0.55; }
          }
          .about-dot { animation: aboutDotPulse 2.4s ease-in-out infinite; }

          .about-heading {
            position: relative;
            display: inline-block;
          }

          /* Media: slow zoom on hover */
          .about-media img {
            transition: transform 0.7s cubic-bezier(.22,1,.36,1);
          }
          .about-media:hover img { transform: scale(1.045); }

          /* Feature cards: icon lifts and tints as the card is hovered */
          .about-feature .about-feature-icon {
            transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease;
          }
          .about-feature:hover .about-feature-icon {
            transform: translateY(-3px) scale(1.08);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 16px rgba(var(--eco-c6-rgb), 0.32);
          }

          /* .inner-blur-glass declares its transition with !important, so the
             card's shadow/border easing has to be re-declared at higher
             specificity to survive alongside the glass zoom. */
          .about-member.about-member {
            transition:
              transform 0.28s cubic-bezier(.22,1,.36,1),
              box-shadow 0.35s ease,
              border-color 0.35s ease !important;
          }

          /* Team: portrait tile drifts in as the card is hovered */
          .about-member-portrait {
            transition: transform 0.6s cubic-bezier(.22,1,.36,1);
          }
          .about-member:hover .about-member-portrait { transform: scale(1.055); }

          /* Rule under the name grows across the card on hover */
          .about-member-rule {
            display: block;
            width: 26px;
            height: 2px;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--eco-c6), var(--eco-c5));
            transition: width 0.45s cubic-bezier(.22,1,.36,1);
          }
          .about-member:hover .about-member-rule { width: 56px; }

          /* Contact chips stay quiet until the card is hovered or focused */
          .about-member-links {
            opacity: 0;
            transform: translate3d(0, 6px, 0);
            transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.22,1,.36,1);
          }
          .about-member:hover .about-member-links,
          .about-member:focus-within .about-member-links {
            opacity: 1;
            transform: none;
          }
          .about-member-link {
            transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
          }
          .about-member-link:hover {
            color: var(--eco-c13);
            background: rgba(var(--eco-c5-rgb), 0.5);
            border-color: rgba(var(--eco-c6-rgb), 0.5);
          }

          @media (hover: none) {
            .about-member-links { opacity: 1; transform: none; }
          }

          @media (prefers-reduced-motion: reduce) {
            .about-dot { animation: none; }
            .about-media img,
            .about-media:hover img,
            .about-feature .about-feature-icon,
            .about-feature:hover .about-feature-icon,
            .about-member .about-member-portrait,
            .about-member:hover .about-member-portrait,
            .about-member-links {
              transition: none;
              transform: none;
            }
            .about-member-links { opacity: 1; }
            .about-member.about-member {
              transition: box-shadow 0.35s ease, border-color 0.35s ease !important;
              transform: none !important;
            }
            .about-member-rule,
            .about-member:hover .about-member-rule { transition: none; width: 26px; }
          }
        `}
      </style>

      {/* ── Intro: image left, copy right ───────── */}
      <div style={{ ...styles.heroSplit, ...(isMobile ? styles.heroSplitMobile : {}) }}>
        <Reveal
          variant={isMobile ? "scale" : "left"}
          delay={220}
          className="about-media"
          style={isMobile ? styles.heroMediaMobile : undefined}
        >
          <MediaFrame
            src="/about-hero-harvest.jpg"
            alt="A grower picking ripe cherry tomatoes from a raised garden bed"
            caption="Turning everyday spaces into productive, sustainable gardens"
            ratio={isMobile ? "16 / 10" : "4 / 3"}
          />
        </Reveal>

        <header
          style={{ ...styles.headerBlock, ...(isMobile ? {} : styles.headerBlockSplit) }}
        >
          <Reveal
            className="inner-blur-glass glass-hover-zoom-sm"
            style={{ ...styles.badge, ...(isMobile ? {} : styles.badgeSplit) }}
          >
            <span className="about-dot" style={styles.badgeDot} />
            <span>Who We Are</span>
          </Reveal>

          <h1 style={styles.title}>
            About <span style={styles.accent}>EcoEquity</span>
          </h1>

          <Reveal
            as="p"
            delay={120}
            style={{ ...styles.lead, ...(isMobile ? {} : styles.leadSplit) }}
          >
            A digital-first platform built to boost agricultural self-sufficiency in
            the Philippines — starting at the household and community level.
          </Reveal>
        </header>
      </div>

      {/* ── Business Concept ────────────────────── */}
      <section style={styles.section}>
        <SectionHeading eyebrow="What We Build">Business Concept</SectionHeading>

        <div style={split}>
          <div>
            <Reveal as="p" style={styles.body}>
              EcoEquity is a digital-first, high-engagement platform designed to boost
              agricultural self-sufficiency in the Philippines by starting at the
              household and community level. It acts as the “Canvas for Green Skills”
              through a hybrid model that empowers citizens to grow their own food,
              reduce reliance on imports, foster a greener environment, and create
              supplementary income.
            </Reveal>
            <Reveal as="p" delay={110} style={{ ...styles.body, ...styles.bodyLast }}>
              Rather than treating farming as a specialized profession reserved for
              a few, EcoEquity reframes it as an everyday skill that anyone can learn.
              We combine personalized AI guidance, a supportive community, and an
              accessible marketplace so that families in cities, towns, and provinces
              alike can confidently turn unused spaces — balconies, backyards, rooftops,
              and vacant lots — into productive, sustainable gardens.
            </Reveal>
          </div>

          <Reveal variant="right" delay={140} className="about-media">
            <MediaFrame
              src="/about-raised-bed.jpg"
              alt="Overhead view of someone planting seedlings in a backyard raised bed"
              caption="Hands-on learning with local growers"
              ratio={isMobile ? "16 / 10" : "4 / 3"}
            />
          </Reveal>
        </div>

        <div style={{ ...styles.featureRow, ...(isMobile ? styles.featureRowMobile : {}) }}>
          {highlights.map((h, i) => (
            <Reveal
              key={i}
              delay={i * 110}
              className="inner-blur-glass about-feature"
              style={{
                ...styles.featureCard,
                ...(hoveredCard === i ? styles.featureCardHov : {}),
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span className="about-feature-icon" style={styles.featureIcon}>
                <h.Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 style={styles.featureHeading}>{h.heading}</h3>
              <p style={styles.featureText}>{h.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Our Story ───────────────────────────── */}
      <section style={styles.section}>
        <SectionHeading eyebrow="How It Started">Our Story</SectionHeading>

        <div style={split}>
          <Reveal
            variant="left"
            className="about-media"
            style={isMobile ? undefined : styles.mediaFirst}
          >
            <MediaFrame
              src="/about-rice-planting.jpg"
              alt="Farmers transplanting rice seedlings in a flooded paddy below green mountains"
              caption="Rooted in generations of rice-growing tradition"
              ratio={isMobile ? "16 / 10" : "4 / 3"}
            />
          </Reveal>

          <div>
            <Reveal as="p" delay={140} style={styles.body}>
              EcoEquity was born from a simple observation: the Philippines imports a
              large share of the food it eats, yet millions of households have the
              space, time, and willingness to grow at least some of their own. What
              they often lack is reliable guidance, encouragement, and a way to make
              their effort pay off. We set out to close that gap with technology that
              meets people exactly where they are.
            </Reveal>
            <Reveal as="p" delay={250} style={{ ...styles.body, ...styles.bodyLast }}>
              By blending modern tools with grassroots community knowledge, we are
              building a movement where growing food is approachable, rewarding, and
              shared. Every garden started, every lesson learned, and every harvest
              sold is a step toward a more resilient, food-secure nation — one
              household at a time.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ────────────────────── */}
      <section style={styles.section}>
        <SectionHeading eyebrow="Where We're Headed">Mission &amp; Vision</SectionHeading>

        <div style={{ ...styles.mvRow, ...(isMobile ? styles.mvRowMobile : {}) }}>
          <Reveal as="article" className="inner-blur-glass about-media" style={styles.mvCard}>
            <img
              src="/about-garden-rows.jpg"
              alt="Rows of leafy vegetables and flowers growing in a home garden plot"
              loading="lazy"
              decoding="async"
              style={styles.mvImage}
            />
            <div style={styles.mvBody}>
              <span style={styles.mvLabel}>Mission</span>
              <p style={styles.mvText}>
                To empower every household in the Philippines to achieve agricultural
                self-sufficiency through innovative digital tools and community-driven
                learning.
              </p>
            </div>
          </Reveal>

          <Reveal as="article" delay={150} className="inner-blur-glass about-media" style={styles.mvCard}>
            <img
              src="/about-rooftop-city.jpg"
              alt="Herbs growing on a rooftop garden overlooking a city at sunset"
              loading="lazy"
              decoding="async"
              style={styles.mvImage}
            />
            <div style={styles.mvBody}>
              <span style={styles.mvLabel}>Vision</span>
              <p style={styles.mvText}>
                A greener, more sustainable Philippines where every family has the
                skills and confidence to grow their own food.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Team ────────────────────────────────── */}
      <section style={{ ...styles.section, ...styles.teamSection }}>
        <Reveal style={styles.divider} />

        <Reveal className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span className="about-dot" style={styles.badgeDot} />
          <span>The People</span>
        </Reveal>

        <Reveal as="h2" delay={90} style={{ ...styles.subtitle, textAlign: "center" }}>
          Meet the <span style={styles.accent}>Team</span>
        </Reveal>
        <Reveal
          as="p"
          delay={180}
          style={{ ...styles.body, ...styles.bodyLast, textAlign: "center", maxWidth: "560px" }}
        >
          A small, cross-disciplinary team — strategy, operations, engineering, and
          community — building EcoEquity alongside the households and growers it
          serves.
        </Reveal>

        <div
          style={{
            ...styles.teamGrid,
            ...(isTablet ? styles.teamGridTablet : {}),
            ...(isMobile ? styles.teamGridMobile : {}),
          }}
        >
          {team.map((member, i) => (
            <Reveal
              as="article"
              key={i}
              delay={i * 90}
              className="inner-blur-glass about-member"
              style={{
                ...styles.memberCard,
                ...(isMobile ? styles.memberCardMobile : {}),
                ...(hoveredMember === i ? styles.memberCardHov : {}),
              }}
              onMouseEnter={() => setHoveredMember(i)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div
                style={{
                  ...styles.memberMedia,
                  /* Portrait crop reads well with real photos; the monogram
                     placeholder would just be a tall empty panel, so it sits
                     closer to square. */
                  aspectRatio: hasPhotos ? "4 / 5" : "1 / 1",
                  maxHeight: hasPhotos ? "340px" : "232px",
                  ...(isMobile ? styles.memberMediaMobile : {}),
                }}
              >
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="about-member-portrait"
                    style={styles.memberPhoto}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="about-member-portrait"
                    style={styles.memberMonogram}
                  >
                    {initials(member.name)}
                  </span>
                )}
                <span aria-hidden="true" style={styles.memberIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div style={styles.memberBody}>
                <p style={styles.memberRole}>{member.role}</p>
                <h3 style={styles.memberName}>{member.name}</h3>
                <span aria-hidden="true" className="about-member-rule" />
                <p style={styles.memberBio}>{member.bio}</p>

                <div style={styles.memberFooter}>
                  <span style={styles.memberFocus}>
                    <span aria-hidden="true" style={styles.memberFocusDot} />
                    {member.focus}
                  </span>

                  {(member.links?.profile || member.links?.email) && (
                    <span className="about-member-links" style={styles.memberLinks}>
                      {member.links.profile && (
                        <a
                          href={member.links.profile}
                          target="_blank"
                          rel="noreferrer"
                          className="about-member-link"
                          style={styles.memberLink}
                          aria-label={`${member.name}'s profile`}
                        >
                          <Link2 size={13} strokeWidth={1.9} aria-hidden="true" />
                        </a>
                      )}
                      {member.links.email && (
                        <a
                          href={`mailto:${member.links.email}`}
                          className="about-member-link"
                          style={styles.memberLink}
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail size={13} strokeWidth={1.9} aria-hidden="true" />
                        </a>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="p" delay={240} style={styles.teamNote}>
          Backed by partner LGUs, agricultural extension workers, and the local
          growers who test everything we ship.
        </Reveal>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    textAlign: "left",
    padding: "32px 20px 64px",
    maxWidth: "1080px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "24px 16px 48px",
  },
  heroSplit: {
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: "48px",
    alignItems: "center",
  },
  heroSplitMobile: {
    gridTemplateColumns: "1fr",
    gap: "28px",
  },
  /* Copy reads first on a phone; the photo follows it. */
  heroMediaMobile: {
    order: 1,
  },
  headerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  headerBlockSplit: {
    alignItems: "flex-start",
    textAlign: "left",
  },
  badge: {
    display: "inline-flex",
    alignSelf: "center",
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
  badgeSplit: {
    alignSelf: "flex-start",
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
    color: "var(--text-primary)",
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  lead: {
    color: "var(--text-primary)",
    fontSize: "clamp(15px, 1.7vw, 18px)",
    fontWeight: 400,
    lineHeight: 1.65,
    maxWidth: "640px",
    margin: "0 auto",
    opacity: 0.82,
  },
  leadSplit: {
    maxWidth: "46ch",
    margin: 0,
  },

  /* ── Sections ── */
  section: {
    marginTop: "64px",
  },
  headingBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "28px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--eco-c13)",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: "clamp(22px, 2.6vw, 30px)",
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: 1.25,
    letterSpacing: "-0.5px",
  },
  body: {
    color: "var(--text-primary)",
    fontSize: "clamp(14.5px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.75,
    margin: "0 0 18px",
    opacity: 0.82,
    maxWidth: "62ch",
  },
  bodyLast: {
    marginBottom: 0,
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "40px",
    alignItems: "center",
  },
  splitMobile: {
    gridTemplateColumns: "1fr",
    gap: "24px",
  },
  mediaFirst: {
    order: -1,
  },

  /* ── Media ── */
  mediaFrame: {
    position: "relative",
    display: "block",
    margin: 0,
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
  },
  mediaImg: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mediaScrim: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: "58%",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 100%)",
    pointerEvents: "none",
  },
  mediaCaption: {
    position: "absolute",
    left: "18px",
    right: "18px",
    bottom: "14px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: "0.1px",
    textShadow: "0 1px 6px rgba(0,0,0,0.45)",
  },

  /* ── Feature cards ── */
  featureRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginTop: "40px",
  },
  featureRowMobile: {
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginTop: "28px",
  },
  featureCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "24px 22px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    transition: "transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease",
  },
  featureCardHov: {
    transform: "translateY(-4px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 16px 32px rgba(0,0,0,0.10)",
  },
  featureIcon: {
    width: "42px",
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    color: "var(--eco-c13)",
    background: "linear-gradient(150deg, rgba(var(--eco-c5-rgb), 0.45), rgba(var(--eco-c5-rgb), 0.3))",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
    marginBottom: "2px",
  },
  featureHeading: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  featureText: {
    fontSize: "13.5px",
    color: "var(--text-primary)",
    opacity: 0.75,
    lineHeight: 1.65,
    margin: 0,
  },

  /* ── Mission & Vision ── */
  mvRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  mvRowMobile: {
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  mvCard: {
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(var(--eco-c0-rgb), 0.45))",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.18)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
  },
  mvImage: {
    display: "block",
    width: "100%",
    aspectRatio: "16 / 7",
    objectFit: "cover",
  },
  mvBody: {
    padding: "22px",
  },
  mvLabel: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--eco-c13)",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  mvText: {
    color: "var(--text-primary)",
    fontSize: "15px",
    lineHeight: 1.7,
    margin: 0,
    opacity: 0.85,
  },

  /* ── Team ── */
  teamSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  divider: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)",
    margin: "0 0 40px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    width: "100%",
    marginTop: "36px",
  },
  teamGridTablet: {
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  teamGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginTop: "28px",
  },
  memberCard: {
    background: "linear-gradient(155deg, rgba(255,255,255,0.74), rgba(var(--eco-c0-rgb), 0.42))",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.18)",
    borderRadius: "22px",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
  },
  memberCardMobile: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: "18px",
  },
  memberCardHov: {
    transform: "translateY(-5px)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 36px rgba(var(--eco-c13-rgb), 0.14)",
    borderColor: "rgba(var(--eco-c6-rgb), 0.4)",
  },
  /* Portrait tile: photo when supplied, monogram otherwise. */
  memberMedia: {
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(120% 90% at 28% 12%, rgba(255,255,255,0.5), transparent 60%), linear-gradient(155deg, rgba(var(--eco-c5-rgb), 0.55), rgba(var(--eco-c6-rgb), 0.34))",
    borderBottom: "1px solid rgba(var(--eco-c6-rgb), 0.2)",
  },
  memberMediaMobile: {
    aspectRatio: "auto",
    maxHeight: "none",
    flex: "0 0 104px",
    width: "104px",
    borderBottom: "none",
    borderRight: "1px solid rgba(var(--eco-c6-rgb), 0.2)",
  },
  memberPhoto: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  memberMonogram: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(28px, 3.4vw, 36px)",
    fontWeight: 300,
    letterSpacing: "2px",
    color: "rgba(var(--eco-c13-rgb), 0.62)",
    textShadow: "0 1px 0 rgba(255,255,255,0.55)",
  },
  memberIndex: {
    position: "absolute",
    top: "12px",
    left: "13px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.4px",
    color: "rgba(var(--eco-c13-rgb), 0.5)",
  },
  memberBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    padding: "18px 18px 16px",
  },
  memberRole: {
    fontSize: "10.5px",
    fontWeight: 700,
    color: "var(--eco-c13)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "1.1px",
  },
  memberName: {
    fontSize: "16px",
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "-2px 0 0",
    letterSpacing: "-0.3px",
    lineHeight: 1.3,
  },
  memberBio: {
    fontSize: "12.75px",
    color: "var(--text-primary)",
    opacity: 0.72,
    lineHeight: 1.62,
    margin: "2px 0 0",
  },
  memberFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "auto",
    paddingTop: "12px",
  },
  memberFocus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10.5px",
    fontWeight: 600,
    color: "var(--eco-c13)",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    opacity: 0.85,
  },
  memberFocusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "var(--eco-c6)",
    flexShrink: 0,
  },
  memberLinks: {
    display: "inline-flex",
    gap: "6px",
    flexShrink: 0,
  },
  memberLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "9px",
    color: "rgba(var(--eco-c13-rgb), 0.8)",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.25)",
    textDecoration: "none",
  },
  teamNote: {
    marginTop: "26px",
    maxWidth: "520px",
    textAlign: "center",
    fontSize: "12.5px",
    lineHeight: 1.7,
    color: "var(--text-primary)",
    opacity: 0.6,
  },
};

export default AboutUs;
