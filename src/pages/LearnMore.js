import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProblemTimeline from "../components/ProblemTimeline";

const sdgItems = [
  {
    number: "01",
    image: "/1.1.png",
    bgImage: "/No poverty.jpg", // Image for SDG 01
    color: "#d71932",
    expandedTitle: "No Poverty",
    expandedContent: [
      {
        heading: "Target 1.4",
        text: "Ensure poor and vulnerable communities have equal rights to economic resources, basic services, land control, and financial services including microfinance.",
      },
      {
        heading: "Global Indicator 1.4.1",
        text: "Proportion of population living in households with access to basic services.",
      },
      {
        heading: "Platform Alignment",
        text: "Onboarding 3,500+ vulnerable or low-income micro-vendors onto a zero-setup-cost digital marketplace.",
      },
    ],
  },
  {
    number: "02",
    image: "/1.2.png",
    bgImage: "/Rice.jpg", // Image for SDG 02
    color: "#dda63a",
    expandedTitle: "Zero Hunger",
    expandedContent: [
      {
        heading: "Target 2.1",
        text: "End hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, all year round to safe, nutritious and sufficient food.",
      },
      {
        heading: "Global Indicator 2.1.2",
        text: "Prevalence of moderate or severe food insecurity in the population.",
      },
      {
        heading: "Platform Alignment",
        text: "Supplementing 500,000+ localized organic meals annually to urban households to buffer against high food inflation.",
      },
    ],
  },
  {
    number: "08",
    image: "/1.3.png",
    bgImage: "/Decent.png", // Update this file name for SDG 08
    color: "#a21942",
    expandedTitle: "Decent Work and Economic Growth",
    expandedContent: [
      {
        heading: "Target 8.3",
        text: "Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation, and encourage the formalization and growth of micro-, small- and medium-sized enterprises, including through access to financial services.",
      },
      {
        heading: "Global Indicator 8.3.1",
        text: "Proportion of informal employment in non-agricultural employment, by sex.",
      },
      {
        heading: "Platform Alignment",
        text: "Providing an economic launchpad that generates ₱63 Million PHP in annual Gross Merchandise Value (GMV) for informal urban backyard growers.",
      },
    ],
  },
  {
    number: "09",
    image: "/1.4.png",
    bgImage: "/Establishment.jpg", // Update this file name for SDG 09
    color: "#ff6f2c",
    expandedTitle: "Industry, Innovation, and Infrastructure",
    expandedContent: [
      {
        heading: "Target 9.b",
        text: "Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities.",
      },
      {
        heading: "Global Indicator 9.b.1",
        text: "Proportion of medium and high-tech industry value added in total value added.",
      },
      {
        heading: "Platform Alignment",
        text: "Designing and deploying a locally trained, 24/7 AI Plant Doctor framework engineered specifically for Philippine native crops and micro-climates.",
      },
    ],
  },
  {
    number: "11",
    image: "/1.5.png",
    bgImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000", // Urban city street — SDG 11 Sustainable Cities
    color: "#fd9d24",
    expandedTitle: "Sustainable Cities and Communities",
    expandedContent: [
      {
        heading: "Target 11.a",
        text: "Support positive economic, social and environmental links between urban, peri-urban and rural areas by strengthening national and regional development planning.",
      },
      {
        heading: "Global Indicator 11.a.1",
        text: "Number of countries that have national urban policies or regional development plans that respond to population dynamics.",
      },
      {
        heading: "Platform Alignment",
        text: "Creating a physical-digital logistics link that allows regional rural farmers to efficiently offload surplus produce directly to urban institutional buyers (hotels, restaurants, and commissaries).",
      },
    ],
  },
  {
    number: "12",
    image: "/6.png",
    bgImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1000", // Fresh produce market — SDG 12 Responsible Consumption
    color: "#bf8b2e",
    expandedTitle: "Responsible Consumption and Production",
    expandedContent: [
      {
        heading: "Target 12.3",
        text: "Halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses.",
      },
      {
        heading: "Global Indicator 12.3.1",
        text: "(a) Food loss index and (b) food waste index.",
      },
      {
        heading: "Platform Alignment",
        text: "Mitigating a targeted 100+ tons of commercial agricultural waste by creating a direct, frictionless link for bulk oversupply clearance.",
      },
    ],
  },
  {
    number: "14",
    image: "/7.png",
    bgImage: "/species.jpg", // Update this file name for SDG 14
    color: "#0a97d9",
    expandedTitle: "Life Below Water",
    expandedContent: [
      {
        heading: "Target 14.1",
        text: "Prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution.",
      },
      {
        heading: "Global Indicator 14.1.1",
        text: "(a) Index of coastal eutrophication and (b) plastic debris density.",
      },
      {
        heading: "Platform Alignment",
        text: "Standardizing educational modules on organic urban farming and hydroponics, preventing toxic synthetic chemical and fertilizer runoff from leaking into urban waterways and marine systems.",
      },
    ],
  },
  {
    number: "15",
    image: "/8.png",
    bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000", // Forest / biodiversity — SDG 15 Life on Land
    color: "var(--eco-c13)",
    expandedTitle: "Life on Land",
    expandedContent: [
      {
        heading: "Target 15.5",
        text: "Take urgent and significant action to reduce the degradation of natural habitats, halt the loss of biodiversity and, by 2020, protect and prevent the extinction of threatened species.",
      },
      {
        heading: "Global Indicator 15.5.1",
        text: "Red List Index (Biodiversity tracking).",
      },
      {
        heading: "Platform Alignment",
        text: "Utilizing the platform's community network to track, distribute, and preserve local agricultural biodiversity through native and heirloom seed banking initiatives.",
      },
    ],
  },
  {
    number: "16",
    image: "/9.png",
    bgImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1000", // Handshake / fair trade — SDG 16 Peace, Justice, Strong Institutions
    color: "#00689d",
    expandedTitle: "Peace, Justice, and Strong Institutions",
    expandedContent: [
      {
        heading: "Target 16.6",
        text: "Develop effective, accountable and transparent institutions at all levels.",
      },
      {
        heading: "Global Indicator 16.6.2",
        text: "Proportion of population satisfied with their last experience of public services.",
      },
      {
        heading: "Platform Alignment",
        text: "Providing an open, auditable, and transparent transaction ledger that ensures fair trade and protects smallholder micro-vendors from predatory middlemen.",
      },
    ],
  },
  {
    number: "17",
    image: "/10.png",
    bgImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000", // Team collaboration / partnerships — SDG 17 Partnerships for the Goals
    color: "#19486a",
    expandedTitle: "Partnerships for the Goals",
    expandedContent: [
      {
        heading: "Target 17.17",
        text: "Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships.",
      },
      {
        heading: "Global Indicator 17.17.1",
        text: "Amount in US dollars committed to public-private partnerships for infrastructure.",
      },
      {
        heading: "Platform Alignment",
        text: "Standardizing the EcoEquity Learning Canvas to serve as the blueprint curriculum for Local Government Unit (LGU) and Barangay urban agriculture deployment programs.",
      },
    ],
  },
];

// The three platform answers the timeline closes on — each one is a programme
// that already has its own page, so the wording here mirrors those.
const problemAnswers = [
  "Zero-setup local marketplace",
  "24/7 AI Plant Doctor",
  "Native & heirloom seed banking",
];

// Only pull a card open on keyboard focus — on touch the tap already toggles it.
const isKeyboardFocus = (el) => {
  try {
    return el.matches(":focus-visible");
  } catch {
    return false;
  }
};

function LearnMore({ setActiveNav }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSdg, setActiveSdg] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const sliderRef = useRef(null);
  // Pointer capability, not width, decides how cards open: hover on a mouse,
  // tap-to-toggle on touch. A wide tablet is still a touch device.
  const [canHover, setCanHover] = useState(
    () => window.matchMedia?.("(hover: hover)").matches ?? true
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.("(hover: hover)");
    if (!mq) return undefined;
    const onChange = (e) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // An arrow that can't move anything should say so rather than look live, so
  // both ends of the scroll range are tracked and mirrored onto the buttons.
  const syncEdges = useCallback((el) => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      atStart: el.scrollLeft <= 1,
      atEnd: max <= 1 || el.scrollLeft >= max - 1,
    });
  }, []);

  useEffect(() => {
    syncEdges(sliderRef.current);
    const onResize = () => syncEdges(sliderRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncEdges]);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    syncEdges(e.target);
    if (scrollWidth <= clientWidth) return;

    const ratio = scrollLeft / (scrollWidth - clientWidth);
    const nextIndex = Math.round(ratio * (sdgItems.length - 1));

    if (!Number.isNaN(nextIndex) && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const scrollDistance = slider.clientWidth * 0.7;
    slider.scrollTo({
      left: slider.scrollLeft + scrollDistance * direction,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes sdgBlockIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── SDG card ───────────────────────────────────────── */
          .sdg-card {
            position: relative;
            display: flex;
            flex-direction: column;
            flex: 0 0 290px;
            width: 290px;
            min-height: 440px;
            padding: 0;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 20px;
            overflow: hidden;
            isolation: isolate;
            background-color: var(--eco-c13);
            scroll-snap-align: start;
            scroll-snap-stop: always;
            text-align: left;
            font-family: inherit;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 10px 28px rgba(0,0,0,0.10);
            transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease;
          }
          @media (min-width: 768px) {
            .sdg-card {
              flex: 0 0 calc((100% - 68px) / 3);
              width: calc((100% - 68px) / 3);
              min-height: 402px;
            }
          }
          .sdg-card:hover,
          .sdg-card.is-active {
            transform: translateY(-6px);
            box-shadow: 0 22px 46px rgba(0,0,0,0.20);
          }
          .sdg-card:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 3px;
          }

          /* The SDG photo, on its own layer under every other one (the scrim
             is z-index 1). Separating it from the card is what lets dark mode
             re-invert the photograph on its own — see the rule further down. */
          .sdg-card::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            background-image: var(--sdg-bg, none);
            background-size: cover;
            background-position: center;
            pointer-events: none;
          }
          /* Dark mode inverts the whole page; this puts the photo back to its
             true colours, the same way index.css treats <img> and <video>.
             The scrim comes with it: it is the photo's own darkening gradient,
             and left inverted it turns into a white wash that lifts the
             picture right out of its light-mode look. */
          html[data-theme="dark"] .sdg-card::before,
          html[data-theme="dark"] .sdg-card__scrim {
            filter: var(--undo-dark);
          }

          /* Layers: photo scrim → solid SDG colour → top accent */
          .sdg-card__scrim,
          .sdg-card__fill {
            position: absolute;
            inset: 0;
            pointer-events: none;
            transition: opacity .45s cubic-bezier(.22,1,.36,1);
          }
          .sdg-card__scrim {
            z-index: 1;
            background: linear-gradient(
              180deg,
              rgba(0,0,0,0.45) 0%,
              rgba(0,0,0,0.08) 32%,
              rgba(0,0,0,0.58) 70%,
              rgba(0,0,0,0.86) 100%
            );
          }
          .sdg-card__fill {
            z-index: 2;
            opacity: 0;
            background:
              radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.24), transparent 58%),
              var(--sdg-color);
          }
          .sdg-card.is-active .sdg-card__fill { opacity: 1; }
          .sdg-card.is-active .sdg-card__scrim { opacity: 0; }
          .sdg-card__accent {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            z-index: 5;
            background: var(--sdg-color);
            pointer-events: none;
            transition: opacity .3s ease;
          }
          .sdg-card.is-active .sdg-card__accent { opacity: 0; }

          /* Resting face */
          .sdg-card__rest {
            position: relative;
            z-index: 3;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 12px;
            padding: 20px;
            transition: opacity .3s ease, transform .45s cubic-bezier(.22,1,.36,1);
          }
          .sdg-card.is-active .sdg-card__rest {
            opacity: 0;
            transform: translateY(-12px);
          }
          .sdg-card__tag {
            align-self: flex-start;
            display: inline-block;
            padding: 5px 11px;
            border-radius: 999px;
            background: rgba(255,255,255,0.16);
            border: 1px solid rgba(255,255,255,0.28);
            backdrop-filter: blur(12px) saturate(160%);
            -webkit-backdrop-filter: blur(12px) saturate(160%);
            color: #fff;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .sdg-card__foot {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .sdg-card__icon {
            width: 76px;
            height: 76px;
            border-radius: 16px;
            object-fit: cover;
            box-shadow: 0 8px 20px rgba(0,0,0,0.28);
            transition: transform .4s cubic-bezier(.34,1.56,.64,1);
          }
          .sdg-card:hover .sdg-card__icon { transform: scale(1.05) rotate(-2deg); }
          .sdg-card__name {
            display: block;
            color: #fff;
            font-size: 19px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.3px;
            text-shadow: 0 2px 12px rgba(0,0,0,0.45);
          }
          .sdg-card__cue {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: rgba(255,255,255,0.78);
            font-size: 10.5px;
            font-weight: 600;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }
          .sdg-card__arrow { transition: transform .3s ease; }
          .sdg-card:hover .sdg-card__arrow { transform: translateX(4px); }

          /* Revealed face */
          .sdg-card__detail {
            position: absolute;
            inset: 0;
            z-index: 4;
            display: flex;
            flex-direction: column;
            padding: 20px;
            color: #fff;
            opacity: 0;
            transform: translateY(14px);
            pointer-events: none;
            transition: opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1);
          }
          .sdg-card.is-active .sdg-card__detail {
            opacity: 1;
            transform: translateY(0);
          }
          .sdg-card__ghost {
            position: absolute;
            top: 10px;
            right: 16px;
            color: rgba(255,255,255,0.18);
            font-size: 62px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -2px;
            pointer-events: none;
          }
          .sdg-card__detailTitle {
            display: block;
            margin-top: 10px;
            max-width: 82%;
            font-size: 20px;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.3px;
          }
          .sdg-card__rule {
            width: 46px;
            height: 3px;
            margin: 10px 0 12px;
            border-radius: 999px;
            background: rgba(255,255,255,0.9);
          }
          .sdg-card__blocks {
            display: flex;
            flex-direction: column;
            gap: 11px;
            overflow-y: auto;
          }
          .sdg-card.is-active .sdg-card__block {
            animation: sdgBlockIn .45s cubic-bezier(.22,1,.36,1) var(--d) both;
          }
          .sdg-card__blockHead {
            display: block;
            margin-bottom: 3px;
            color: rgba(255,255,255,0.72);
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: 0.9px;
            text-transform: uppercase;
          }
          .sdg-card__blockText {
            display: block;
            font-size: 11.5px;
            font-weight: 500;
            line-height: 1.5;
            color: rgba(255,255,255,0.96);
          }

          /* ── Slider arrows ──────────────────────────────────── */
          .sdg-nav {
            width: 44px;
            height: 44px;
            padding: 0;
            border-radius: 999px;
            border: 1px solid rgba(var(--eco-c9-rgb), 0.28);
            background: rgba(var(--eco-c0-rgb), 0.9);
            color: var(--eco-c13);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 16px rgba(var(--eco-c15-rgb), 0.12);
            transition: background .2s ease, border-color .2s ease,
                        color .2s ease, box-shadow .2s ease, transform .2s ease;
          }
          .sdg-nav--right { justify-self: end; }
          .sdg-nav svg { display: block; }
          .sdg-nav:hover:not(:disabled) {
            background: var(--eco-c11);
            border-color: var(--eco-c11);
            color: var(--eco-c0);
            box-shadow: 0 10px 22px rgba(var(--eco-c15-rgb), 0.2);
            transform: translateY(-1px);
          }
          .sdg-nav:active:not(:disabled) {
            transform: translateY(0) scale(0.94);
            box-shadow: 0 4px 10px rgba(var(--eco-c15-rgb), 0.16);
          }
          .sdg-nav:focus-visible {
            outline: 2px solid var(--eco-c11);
            outline-offset: 3px;
          }
          .sdg-nav:disabled {
            opacity: 0.35;
            cursor: default;
            box-shadow: none;
          }

          /* ── Problem Addressed band ─────────────────────────── */
          /* Deliberately no backdrop-filter: the timeline's own panels and
             nodes are already glass, and stacking another blurred layer behind
             them costs the whole page frames for no visible gain. */
          .lm-problem {
            position: relative;
            isolation: isolate;
            width: 100%;
            margin-top: 54px;
            padding: 46px 34px 42px;
            border-radius: 30px;
            border: 1px solid rgba(var(--eco-c7-rgb), 0.16);
            background:
              radial-gradient(110% 78% at 50% 0%, rgba(var(--eco-c3-rgb), 0.5), transparent 62%),
              linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.26));
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.8),
              0 20px 48px rgba(var(--eco-c11-rgb), 0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          @media (max-width: 767px) {
            .lm-problem {
              margin-top: 34px;
              padding: 32px 16px 30px;
              border-radius: 22px;
            }
          }
          /* Seam: the hairline that hands the eye off from the SDG slider to
             the timeline, with the section's own marker sitting on it. */
          .lm-problem__seam {
            position: absolute;
            top: -1px;
            left: 12%;
            right: 12%;
            height: 1px;
            background: linear-gradient(
              90deg,
              rgba(var(--eco-c7-rgb), 0) 0%,
              rgba(var(--eco-c7-rgb), 0.42) 50%,
              rgba(var(--eco-c7-rgb), 0) 100%
            );
            pointer-events: none;
          }
          .lm-problem__seam::after {
            content: "";
            position: absolute;
            top: -3px;
            left: 50%;
            width: 7px;
            height: 7px;
            margin-left: -3.5px;
            border-radius: 2px;
            transform: rotate(45deg);
            background: linear-gradient(135deg, var(--eco-c6), var(--eco-c7));
            box-shadow: 0 0 0 4px rgba(var(--eco-c0-rgb), 0.9);
          }

          .lm-problem__eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 5px 14px;
            border-radius: 999px;
            background: rgba(var(--eco-c6-rgb), 0.28);
            border: 1px solid rgba(var(--eco-c7-rgb), 0.24);
            color: var(--eco-c13);
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .lm-problem__eyebrowDot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--eco-c7);
          }

          .lm-problem__title {
            margin: 16px 0 0;
            font-size: clamp(25px, 3.2vw, 38px);
            font-weight: 300;
            line-height: 1.14;
            letter-spacing: -0.5px;
            color: #000;
          }
          /* The page's usual pale-sage accent disappears against this band's
             light fill, so the emphasised word takes the deep end of the ramp. */
          .lm-problem__accent {
            background: linear-gradient(90deg, var(--eco-c7), var(--eco-c11));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .lm-problem__lead {
            margin: 12px 0 0;
            max-width: 540px;
            font-size: clamp(13px, 1.4vw, 15.5px);
            font-weight: 400;
            line-height: 1.62;
            color: rgba(0,0,0,0.66);
          }
          @media (max-width: 767px) {
            .lm-problem__lead { font-size: 12.5px; line-height: 1.5; }
          }

          /* Span label: names the stretch the timeline covers before the
             years themselves appear. */
          .lm-problem__span {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 26px 0 6px;
            color: rgba(var(--eco-c11-rgb), 0.7);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
          }
          .lm-problem__span::before,
          .lm-problem__span::after {
            content: "";
            width: clamp(24px, 6vw, 56px);
            height: 1px;
            background: rgba(var(--eco-c7-rgb), 0.32);
          }
          @media (max-width: 767px) {
            .lm-problem__span { margin: 20px 0 2px; font-size: 9px; letter-spacing: 1.2px; }
          }

          /* Closing strip: the timeline ends on the problem, so the section
             closes by naming the three answers that live elsewhere on the site. */
          .lm-problem__answers {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-top: 30px;
            padding-top: 24px;
            width: 100%;
            border-top: 1px solid rgba(var(--eco-c7-rgb), 0.16);
          }
          .lm-problem__answersLabel {
            color: rgba(var(--eco-c11-rgb), 0.72);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
          }
          .lm-problem__chips {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 9px;
          }
          .lm-problem__chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 15px;
            border-radius: 999px;
            border: 1px solid rgba(var(--eco-c7-rgb), 0.2);
            background: rgba(255,255,255,0.6);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
            color: var(--eco-c13);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: -0.1px;
          }
          /* Wrapped chips of three different widths stagger badly on a phone,
             so there they become a stacked list instead. */
          @media (max-width: 767px) {
            .lm-problem__chips {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
              max-width: 320px;
            }
            .lm-problem__chip {
              justify-content: flex-start;
              padding: 9px 14px;
              font-size: 11.5px;
            }
          }
          .lm-problem__chipNum {
            color: rgba(var(--eco-c11-rgb), 0.5);
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: 0.6px;
          }

          @media (prefers-reduced-motion: reduce) {
            .sdg-nav,
            .sdg-card,
            .sdg-card__rest,
            .sdg-card__detail,
            .sdg-card__icon,
            .sdg-card__arrow {
              transition: none;
              transform: none;
            }
            .sdg-card.is-active .sdg-card__block { animation: none; }
          }
        `}
      </style>

      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHovered ? styles.backBtnHov : {}),
            }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          > 
            <span>←</span>
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Learn More</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Sustainable Development Goals Aligned with <span style={styles.accent}>EcoEquity</span>
      </h1>

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity is a comprehensive platform built to transform agricultural practices and empower local communities. Find out more about our initiatives, our technology, and how you can get involved.
      </p>

      <div style={{ ...styles.sliderWrapper, ...(isMobile ? styles.sliderWrapperMobile : {}) }}>
        {!isMobile && (
          <button
            type="button"
            className="sdg-nav"
            aria-label="Scroll SDG cards left"
            onClick={() => scrollSlider(-1)}
            disabled={edges.atStart}
          >
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}

        <div
          ref={sliderRef}
          className="hide-scroll"
          style={{ ...styles.sdgSlider, ...(isMobile ? styles.sdgSliderMobile : {}) }}
          onScroll={handleScroll}
          aria-label="Horizontal SDG slider"
        >
          {sdgItems.map((sdg, index) => {
          const isActive = activeSdg === index;
          return (
            <button
              type="button"
              key={sdg.number}
              className={`sdg-card${isActive ? " is-active" : ""}`}
              style={{
                "--sdg-color": sdg.color || "#e5243b",
                /* The photo is painted by .sdg-card::before, not by the card
                   itself, so dark mode can un-invert that one layer without
                   touching the card's text and colour fills. */
                "--sdg-bg": sdg.bgImage ? `url('${sdg.bgImage}')` : "none",
              }}
              aria-expanded={isActive}
              aria-label={`Goal ${sdg.number}: ${sdg.expandedTitle}`}
              onClick={canHover ? undefined : () => setActiveSdg(isActive ? null : index)}
              onMouseEnter={canHover ? () => setActiveSdg(index) : undefined}
              onMouseLeave={canHover ? () => setActiveSdg(null) : undefined}
              onFocus={(e) => isKeyboardFocus(e.currentTarget) && setActiveSdg(index)}
              onBlur={() => setActiveSdg((cur) => (cur === index ? null : cur))}
            >
              <span className="sdg-card__scrim" aria-hidden="true" />
              <span className="sdg-card__fill" aria-hidden="true" />
              <span className="sdg-card__accent" aria-hidden="true" />

              <span className="sdg-card__rest">
                <span className="sdg-card__tag">Goal {sdg.number}</span>
                <span className="sdg-card__foot">
                  {sdg.image && (
                    <img className="sdg-card__icon" src={sdg.image} alt="" aria-hidden="true" />
                  )}
                  <span className="sdg-card__name">{sdg.expandedTitle}</span>
                  <span className="sdg-card__cue">
                    Targets &amp; alignment
                    <span className="sdg-card__arrow" aria-hidden="true">→</span>
                  </span>
                </span>
              </span>

              <span className="sdg-card__detail">
                <span className="sdg-card__ghost" aria-hidden="true">{sdg.number}</span>
                <span className="sdg-card__tag">Goal {sdg.number}</span>
                <span className="sdg-card__detailTitle">{sdg.expandedTitle}</span>
                <span className="sdg-card__rule" aria-hidden="true" />
                <span className="sdg-card__blocks hide-scroll">
                  {sdg.expandedContent.map((item, i) => (
                    <span
                      key={item.heading}
                      className="sdg-card__block"
                      style={{ "--d": `${0.08 + i * 0.06}s` }}
                    >
                      <span className="sdg-card__blockHead">{item.heading}</span>
                      <span className="sdg-card__blockText">{item.text}</span>
                    </span>
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {!isMobile && (
        <button
          type="button"
          className="sdg-nav sdg-nav--right"
          aria-label="Scroll SDG cards right"
          onClick={() => scrollSlider(1)}
          disabled={edges.atEnd}
        >
          <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}

      </div>

      <div style={styles.indicatorRow} aria-hidden="true">
        {sdgItems.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              ...(activeIndex === i ? styles.dotActive : {}),
            }}
          />
        ))}
      </div>

      <section className="lm-problem" aria-labelledby="lm-problem-title">
        <span className="lm-problem__seam" aria-hidden="true" />

        <span className="lm-problem__eyebrow">
          <span className="lm-problem__eyebrowDot" aria-hidden="true" />
          <span>Problem Addressed</span>
        </span>

        <h2 id="lm-problem-title" className="lm-problem__title">
          How the dependency was <span className="lm-problem__accent">built</span>
        </h2>

        <p className="lm-problem__lead">
          Four decades of policy and market shifts eroded Philippine food
          self-sufficiency. {isMobile ? "Tap" : "Select"} a year to see the
          decision that moved the country further from feeding itself.
        </p>

        <span className="lm-problem__span" aria-hidden="true">
          1980 — 2020 · Four decades
        </span>

        <ProblemTimeline isMobile={isMobile} maxWidth={isMobile ? 660 : 780} />

        <div className="lm-problem__answers">
          <span className="lm-problem__answersLabel">Where EcoEquity intervenes</span>
          <div className="lm-problem__chips">
            {problemAnswers.map((answer, i) => (
              <span key={answer} className="lm-problem__chip">
                <span className="lm-problem__chipNum" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {answer}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "18px 16px 18px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "16px 8px 20px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "12px",
  },
  backBtnWrap: {
    position: "absolute",
    left: 0,
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
    fontSize: "clamp(24px, 3.4vw, 40px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 0 10px",
    lineHeight: 1.12,
    letterSpacing: "-0.4px",
    maxWidth: "760px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(22px, 6vw, 30px)",
    maxWidth: "330px",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.58,
    maxWidth: "580px",
    marginBottom: "12px",
  },
  bodyMobile: {
    fontSize: "12px",
    lineHeight: 1.45,
    maxWidth: "330px",
    marginBottom: "8px",
  },
  sdgSlider: {
    display: "flex",
    gap: "22px",
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "none",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 12px",
    WebkitOverflowScrolling: "touch",
    padding: "18px 12px 26px",
    marginTop: "2px",
    overscrollBehaviorX: "contain",
  },
  sdgSliderMobile: {
    alignSelf: "center",
    width: "min(100%, 314px)",
    maxWidth: "100%",
    gap: "18px",
    padding: "16px 12px 24px",
    scrollPadding: "0 12px",
  },
  sliderWrapper: {
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr) 44px",
    gap: "10px",
    alignItems: "center",
    width: "100%",
    marginTop: "24px",
  },
  // Touch swipes the cards, so mobile gives the 44px gutters back to them.
  sliderWrapperMobile: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 0,
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    margin: "0 auto",
    paddingBottom: "6px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "999px",
    background: "rgba(0, 0, 0, 0.18)",
    flex: "0 0 auto",
    transition: "width 0.3s cubic-bezier(.22,1,.36,1), background 0.25s ease, box-shadow 0.25s ease",
  },
  dotActive: {
    width: "22px",
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    boxShadow: "0 0 10px rgba(var(--eco-c6-rgb), 0.6)",
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
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
};

export default LearnMore;
