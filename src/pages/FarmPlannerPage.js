import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Sun, Cloud, CloudRain, CloudSun, Droplet, Wind, Sprout, Calendar, MapPin, TrendingUp, Wheat } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REGIONS = ["All Regions", "Luzon", "Visayas", "Mindanao"];

// Lightweight, deterministic mock forecast so the planner feels live without an
// external weather API. Conditions are seeded per-region for variety. These are
// the defaults — App.js owns the live config (persisted to localStorage) and the
// Admin Portal lets admins edit the per-region weather and advisory text.
const DEFAULT_REGION_WEATHER = {
  Luzon: { base: 28, cond: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Sunny"], humidity: 72, wind: 14 },
  Visayas: { base: 30, cond: ["Sunny", "Sunny", "Partly Cloudy", "Thunderstorms", "Partly Cloudy"], humidity: 78, wind: 18 },
  Mindanao: { base: 29, cond: ["Partly Cloudy", "Light Rain", "Cloudy", "Light Rain", "Sunny"], humidity: 80, wind: 12 },
  "All Regions": { base: 29, cond: ["Partly Cloudy", "Sunny", "Light Rain", "Cloudy", "Sunny"], humidity: 76, wind: 15 },
};

const DEFAULT_ADVISORIES = {
  wet: "Frequent rain expected — hold off on spraying and ensure drainage to prevent root rot.",
  dry: "Hot, dry days ahead — water early morning or late afternoon and mulch to retain soil moisture.",
  mild: "Mild, mixed conditions — a good window for transplanting seedlings and light field work.",
};

export const defaultPlannerConfig = { regions: DEFAULT_REGION_WEATHER, advisories: DEFAULT_ADVISORIES };

const conditionIcon = (cond, size = 30) => {
  if (cond === "Sunny") return <Sun size={size} color="#f59e0b" />;
  if (cond === "Partly Cloudy") return <CloudSun size={size} color="#f59e0b" />;
  if (cond === "Cloudy") return <Cloud size={size} color="#64748b" />;
  if (cond === "Light Rain") return <CloudRain size={size} color="#0284c7" />;
  if (cond === "Thunderstorms") return <CloudRain size={size} color="#4338ca" />;
  return <CloudSun size={size} color="#f59e0b" />;
};

function FarmPlannerPage({ setActiveNav, harvests = [], planner = defaultPlannerConfig }) {
  const regionWeather = planner?.regions || DEFAULT_REGION_WEATHER;
  const advisories = planner?.advisories || DEFAULT_ADVISORIES;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [region, setRegion] = useState("All Regions");
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [hoveredCrop, setHoveredCrop] = useState(null);
  const [ctaHovered, setCtaHovered] = useState(false);

  const goToSeasonal = () => setActiveNav && setActiveNav("Seasonal Harvest");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const now = new Date();
  const currentMonth = MONTHS[now.getMonth()];

  // 5-day forecast derived from the seeded region profile + day-of-week labels.
  const forecast = useMemo(() => {
    const profile = regionWeather[region] || regionWeather["All Regions"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const cond = profile.cond[i % profile.cond.length];
      const wobble = (i % 2 === 0 ? 1 : -1) * (i % 3);
      const high = profile.base + 2 + wobble;
      return {
        label: i === 0 ? "Today" : dayNames[d.getDay()],
        date: `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`,
        cond,
        high,
        low: high - 6,
        rain: cond.includes("Rain") || cond.includes("Thunder") ? (cond.includes("Thunder") ? 80 : 60) : cond === "Cloudy" ? 30 : 10,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, regionWeather]);

  const regionHarvests = useMemo(
    () => harvests.filter((h) => region === "All Regions" || h.region === region || h.region === "All Regions"),
    [harvests, region]
  );

  const plantNow = regionHarvests.filter((h) => h.plantingMonth === currentMonth || h.plantingMonth === "Any");
  const harvestNow = regionHarvests.filter((h) => Array.isArray(h.months) && h.months.includes(currentMonth));

  const profile = regionWeather[region] || regionWeather["All Regions"];

  // Simple farming advisory based on the leading forecast condition.
  const rainyDays = forecast.filter((f) => f.rain >= 50).length;
  const advisory = rainyDays >= 2
    ? { text: advisories.wet, tone: "wet" }
    : forecast[0].cond === "Sunny"
    ? { text: advisories.dry, tone: "dry" }
    : { text: advisories.mild, tone: "mild" };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{ ...styles.backBtn, ...(isHoveredBack ? styles.backBtnHov : {}) }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span style={styles.glassContentLayer}>Weather & Farm Planner</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Plan Your <span style={styles.titleAccent}>Harvest</span>
      </h1>
      <div style={styles.titleUnderline} />
      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Localized weather outlook and a planting calendar tuned to Philippine growing seasons. Choose your region to see what to plant and harvest this {currentMonth}.
      </p>

      {/* Region selector */}
      <div style={styles.regionRow}>
        <MapPin size={16} color="#15803d" />
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            onMouseEnter={() => setHoveredRegion(r)}
            onMouseLeave={() => setHoveredRegion(null)}
            style={{ ...styles.regionChip, ...(hoveredRegion === r && region !== r ? styles.regionChipHov : {}), ...(region === r ? styles.regionChipActive : {}) }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Weather forecast */}
      <div className="inner-blur-glass" style={styles.card}>
        <div style={styles.cardHeader}>
          <Cloud style={styles.cardIcon} />
          <h3 style={styles.cardTitle}>5-Day Outlook — {region}</h3>
        </div>
        <div style={{ ...styles.forecastRow, ...(isMobile ? styles.forecastRowMobile : {}) }}>
          {forecast.map((f, i) => (
            <div key={i} style={{ ...styles.forecastCard, ...(i === 0 ? styles.forecastCardToday : {}) }}>
              <span style={styles.forecastDay}>{f.label}</span>
              <span style={styles.forecastDate}>{f.date}</span>
              <div style={{ margin: "8px 0" }}>{conditionIcon(f.cond)}</div>
              <span style={styles.forecastTemp}>{f.high}°<span style={styles.forecastLow}> / {f.low}°</span></span>
              <span style={styles.forecastCond}>{f.cond}</span>
              <span style={styles.forecastRain}><Droplet size={11} color="#0284c7" /> {f.rain}%</span>
            </div>
          ))}
        </div>
        <div style={styles.weatherMeta}>
          <span style={styles.metaItem}><Droplet size={13} color="#0284c7" /> Humidity {profile.humidity}%</span>
          <span style={styles.metaItem}><Wind size={13} color="#64748b" /> Wind {profile.wind} km/h</span>
        </div>
        <div style={{ ...styles.advisory, ...(advisory.tone === "wet" ? styles.advisoryWet : advisory.tone === "dry" ? styles.advisoryDry : styles.advisoryMild) }}>
          <strong>Advisory:</strong> {advisory.text}
        </div>
      </div>

      <div style={{ ...styles.twoCol, ...(isMobile ? styles.twoColMobile : {}) }}>
        {/* Plant now */}
        <div className="inner-blur-glass" style={styles.card}>
          <div style={styles.cardHeader}>
            <Sprout style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Plant in {currentMonth}</h3>
          </div>
          {plantNow.length === 0 ? (
            <p style={styles.emptyText}>No recommended planting for this region in {currentMonth}. Try another region or check the calendar below.</p>
          ) : (
            <div style={styles.cropList}>
              {plantNow.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={goToSeasonal}
                  onMouseEnter={() => setHoveredCrop(`plant-${h.id}`)}
                  onMouseLeave={() => setHoveredCrop(null)}
                  style={{ ...styles.cropItem, ...(hoveredCrop === `plant-${h.id}` ? styles.cropItemHov : {}) }}
                >
                  <span style={styles.cropIcon}>{h.icon || <Wheat size="1em" color="#16a34a" />}</span>
                  <div style={styles.cropText}>
                    <span style={styles.cropName}>{h.name}</span>
                    <span style={styles.cropMeta}>Harvest peaks {h.peak} · {h.location}</span>
                  </div>
                  <span style={styles.cropTag}>{h.water} water</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Harvest now */}
        <div className="inner-blur-glass" style={styles.card}>
          <div style={styles.cardHeader}>
            <TrendingUp style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>In Season Now</h3>
          </div>
          {harvestNow.length === 0 ? (
            <p style={styles.emptyText}>Nothing peaking in {currentMonth} for this region right now.</p>
          ) : (
            <div style={styles.cropList}>
              {harvestNow.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={goToSeasonal}
                  onMouseEnter={() => setHoveredCrop(`harvest-${h.id}`)}
                  onMouseLeave={() => setHoveredCrop(null)}
                  style={{ ...styles.cropItem, ...(hoveredCrop === `harvest-${h.id}` ? styles.cropItemHov : {}) }}
                >
                  <span style={styles.cropIcon}>{h.icon || <Wheat size="1em" color="#16a34a" />}</span>
                  <div style={styles.cropText}>
                    <span style={styles.cropName}>{h.name}</span>
                    <span style={styles.cropMeta}>{h.priceTrend} · {h.demand}</span>
                  </div>
                  {h.peak === currentMonth && <span style={{ ...styles.cropTag, ...styles.cropTagPeak }}>Peak</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Planting calendar */}
      <div className="inner-blur-glass" style={styles.card}>
        <div style={styles.cardHeader}>
          <Calendar style={styles.cardIcon} />
          <h3 style={styles.cardTitle}>Planting & Harvest Calendar</h3>
        </div>
        <div style={styles.legendRow}>
          <span style={styles.legendItem}><span style={{ ...styles.legendSwatch, background: "rgba(22,163,74,0.25)" }} /> Harvest season</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendSwatch, background: "#16a34a" }} /> Peak month</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendSwatch, background: "#f59e0b" }} /> Plant now</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.calTable}>
            <thead>
              <tr>
                <th style={{ ...styles.calTh, textAlign: "left", minWidth: "120px" }}>Crop</th>
                {SHORT_MONTHS.map((m, i) => (
                  <th key={m} style={{ ...styles.calTh, ...(MONTHS[i] === currentMonth ? styles.calThNow : {}) }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regionHarvests.map((h) => (
                <tr key={h.id}>
                  <td style={styles.calCropCell}>
                    <span style={{ marginRight: 6 }}>{h.icon || <Wheat size="1em" color="#16a34a" />}</span>
                    {h.name}
                  </td>
                  {MONTHS.map((m) => {
                    const inSeason = Array.isArray(h.months) && h.months.includes(m);
                    const isPeak = h.peak === m;
                    const isPlant = h.plantingMonth === m || (h.plantingMonth === "Any");
                    let bg = "transparent";
                    if (isPeak) bg = "#16a34a";
                    else if (inSeason) bg = "rgba(22,163,74,0.25)";
                    else if (isPlant) bg = "#f59e0b";
                    return <td key={m} style={{ ...styles.calCell, background: bg }} title={`${h.name} — ${m}`} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={goToSeasonal}
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
        style={{ ...styles.cta, ...(ctaHovered ? styles.ctaHov : {}) }}
      >
        <Wheat size={18} color="#fff" /> Explore Seasonal Harvests
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 16px 40px", maxWidth: "1100px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" },
  wrapMobile: { padding: "16px 8px 30px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", marginBottom: "12px" },
  backBtnWrap: { position: "absolute", left: 0, top: "-5px" },
  backBtn: { padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s ease" },
  backBtnHov: { transform: "scale(1.035)" },
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
    color: "#15803d",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)", display: "inline-block" },
  glassContentLayer: { position: "relative", zIndex: 1 },
  title: { fontSize: "clamp(24px, 3.2vw, 38px)", fontWeight: 300, color: "#000", margin: "0 0 10px", fontFamily: "'Poppins', sans-serif", lineHeight: 1.03, textShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  titleMobile: { fontSize: "clamp(20px, 7vw, 30px)" },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 18px",
    boxShadow: "0 0 18px rgba(134,239,172,0.75)",
    borderRadius: "999px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both, shimmerLine 2.5s linear infinite",
  },
  titleAccent: { background: "linear-gradient(90deg, #15803d, #16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  body: { color: "rgba(0,0,0,0.75)", marginBottom: "22px", maxWidth: "640px", fontSize: "15px", lineHeight: 1.55 },
  bodyMobile: { fontSize: "13.5px" },
  regionRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" },
  regionChip: { padding: "7px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", color: "#334155", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  regionChipHov: { background: "rgba(22,163,74,0.12)", borderColor: "rgba(22,163,74,0.3)", color: "#15803d", transform: "translateY(-1px)" },
  regionChipActive: { background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", borderColor: "transparent", boxShadow: "0 6px 16px rgba(22,163,74,0.3)" },
  card: { width: "100%", borderRadius: "20px", padding: "20px", marginBottom: "20px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", boxSizing: "border-box", textAlign: "left" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  cardIcon: { color: "#16a34a", width: "20px", height: "20px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 },
  forecastRow: { display: "flex", gap: "12px", justifyContent: "space-between" },
  forecastRowMobile: { overflowX: "auto", justifyContent: "flex-start" },
  forecastCard: { flex: 1, minWidth: "92px", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", borderRadius: "16px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)" },
  forecastCardToday: { background: "linear-gradient(160deg, rgba(134,239,172,0.4), rgba(255,255,255,0.7))", border: "1px solid rgba(22,163,74,0.3)" },
  forecastDay: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  forecastDate: { fontSize: "11px", color: "rgba(0,0,0,0.5)" },
  forecastTemp: { fontSize: "16px", fontWeight: 800, color: "#0f172a" },
  forecastLow: { fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.45)" },
  forecastCond: { fontSize: "11px", color: "rgba(0,0,0,0.6)", marginTop: "2px", textAlign: "center" },
  forecastRain: { display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 600, color: "#0284c7", marginTop: "4px" },
  weatherMeta: { display: "flex", gap: "18px", marginTop: "16px", flexWrap: "wrap" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "rgba(0,0,0,0.6)" },
  advisory: { marginTop: "14px", padding: "12px 14px", borderRadius: "12px", fontSize: "13px", lineHeight: 1.5, color: "#0f172a" },
  advisoryWet: { background: "rgba(2,132,199,0.1)", border: "1px solid rgba(2,132,199,0.25)" },
  advisoryDry: { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" },
  advisoryMild: { background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" },
  twoColMobile: { gridTemplateColumns: "1fr" },
  cropList: { display: "flex", flexDirection: "column", gap: "10px" },
  cropItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease" },
  cropItemHov: { transform: "translateY(-2px)", borderColor: "rgba(22,163,74,0.35)", boxShadow: "0 8px 20px rgba(22,163,74,0.12)" },
  cropIcon: { fontSize: "20px", display: "flex" },
  cropText: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
  cropName: { fontSize: "14px", fontWeight: 700, color: "#0f172a" },
  cropMeta: { fontSize: "12px", color: "rgba(0,0,0,0.55)" },
  cropTag: { fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "4px 9px", borderRadius: "999px", whiteSpace: "nowrap" },
  cropTagPeak: { color: "#fff", background: "linear-gradient(135deg, #16a34a, #15803d)" },
  emptyText: { fontSize: "13px", color: "rgba(0,0,0,0.55)", lineHeight: 1.5 },
  legendRow: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "14px" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" },
  legendSwatch: { width: "14px", height: "14px", borderRadius: "4px", display: "inline-block" },
  calTable: { borderCollapse: "separate", borderSpacing: "3px", width: "100%", minWidth: "560px" },
  calTh: { fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)", padding: "4px 2px", textAlign: "center" },
  calThNow: { color: "#15803d", textDecoration: "underline" },
  calCropCell: { fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", paddingRight: "8px", display: "flex", alignItems: "center" },
  calCell: { height: "22px", borderRadius: "5px", border: "1px solid rgba(0,0,0,0.04)" },
  cta: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px 26px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 12px 28px rgba(22,163,74,0.3), inset 0 1px 0 rgba(255,255,255,0.4)", transition: "transform 0.2s ease, box-shadow 0.2s ease", marginTop: "4px" },
  ctaHov: { transform: "translateY(-2px) scale(1.02)", boxShadow: "0 16px 34px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.4)" },
};

export default FarmPlannerPage;
