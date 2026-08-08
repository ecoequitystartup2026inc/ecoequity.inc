import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Leaf } from "lucide-react";
import Reveal, { RevealStyles } from "../components/Reveal";
import CropThumb, { cropImage } from "../components/CropThumb";
import { FaArrowLeft, FaFilter, FaCalendarAlt, FaSearch, FaLeaf, FaCalendarPlus, FaBell, FaBookmark, FaStore, FaThermometerHalf, FaTint, FaBug, FaSeedling, FaChartLine, FaMapMarkerAlt, FaBoxOpen, FaSun, FaTimes, FaChevronRight } from "react-icons/fa";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const categories = ["All", "Vegetables", "Fruits", "Herbs", "Grains"];
const viewModes = ["Monthly View", "Seasonal Timeline", "Full Year Calendar"];

/* Philippine growing seasons — used by the Seasonal Timeline view, which groups
   crops by the month they peak rather than by the month currently selected. */
const seasons = [
  { label: "Cool Dry", range: "December – February", months: ["December", "January", "February"] },
  { label: "Hot Dry", range: "March – May", months: ["March", "April", "May"] },
  { label: "Early Wet", range: "June – August", months: ["June", "July", "August"] },
  { label: "Late Wet", range: "September – November", months: ["September", "October", "November"] },
];

export default function SeasonalHarvestPage({ setActiveNav, onNotify, harvests }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeViewMode, setActiveViewMode] = useState("Monthly View");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [openCrop, setOpenCrop] = useState(null);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const all = harvests || [];

  /* Category + search apply in every view; the month filter only narrows the
     Monthly View, so the timeline and year grid can show the whole catalogue. */
  const matchesFilters = (item) =>
    (selectedCategory === "All" || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase());

  const catalogue = all.filter(matchesFilters);
  const filteredHarvests = catalogue.filter(item => item.months.includes(selectedMonth));
  const visible = activeViewMode === "Monthly View" ? filteredHarvests : catalogue;

  const totalCrops = all.length;
  const peakingThisMonth = all.filter(h => h.peak === selectedMonth);
  const highDemandCrops = all.filter(h => h.demand === "High Demand").length;
  const estRevenue = `₱${(all.length * 150000).toLocaleString()}`;

  const handleAddToCalendar = (e, item) => {
    e.stopPropagation();
    const currentYear = new Date().getFullYear();
    let dateStr = "";

    if (item.estDate === "Year-round") {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      dateStr = `${y}${m}${d}/${y}${m}${d}`;
    } else {
      const dateParts = item.estDate.split(" ");
      if (dateParts.length >= 2) {
        const monthStr = dateParts[0];
        const dayStr = dateParts[1].replace(/,/g, '');
        const monthMap = {
          Jan: "01", January: "01", Feb: "02", February: "02", Mar: "03", March: "03",
          Apr: "04", April: "04", May: "05", Jun: "06", June: "06", Jul: "07", July: "07",
          Aug: "08", August: "08", Sep: "09", September: "09", Oct: "10", October: "10",
          Nov: "11", November: "11", Dec: "12", December: "12"
        };
        const month = monthMap[monthStr];
        const day = dayStr.padStart(2, "0");
        if (month && day) {
          dateStr = `${currentYear}${month}${day}/${currentYear}${month}${day}`;
        }
      }
    }

    const title = encodeURIComponent(`Harvest Reminder: ${item.name}`);
    const details = encodeURIComponent(`Estimated harvest time for ${item.name} in ${item.location}.`);

    let calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    if (dateStr) {
        calendarUrl += `&dates=${dateStr}`;
    }
    window.open(calendarUrl, '_blank');
  };

  const handleNotify = (e, item) => {
    e.stopPropagation();
    if (onNotify) onNotify(item.name);
    else alert(`Notifications enabled for ${item.name}`);
  };

  const toggleSave = (e, item) => {
    e.stopPropagation();
    setSaved(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
  };

  const closeModal = useCallback(() => setOpenCrop(null), []);

  const cropTile = (item, ci) => (
    <Reveal
      as="button"
      type="button"
      key={item.id}
      delay={Math.min(ci, 7) * 60}
      className="inner-blur-glass sh-card"
      onClick={() => setOpenCrop(item)}
      onMouseEnter={() => setHoveredCard(item.id)}
      onMouseLeave={() => setHoveredCard(null)}
      aria-label={`View details for ${item.name}`}
      style={{
        ...styles.tile,
        ...(isMobile ? styles.tileMobile : {}),
        ...(hoveredCard === item.id ? styles.tileHover : {}),
      }}
    >
      <span style={{ ...styles.tileMedia, ...(isMobile ? styles.tileMediaMobile : {}), ...(cropImage(item.name) ? {} : styles.tileMediaPlain) }}>
        <CropThumb
          name={item.name}
          fallback={<span style={styles.tileFallback} className="floating-icon">{item.icon}</span>}
        />
        {item.peak === selectedMonth && (
          <span style={styles.tilePeak}><FaLeaf style={{ marginRight: 4 }} />Peak</span>
        )}
        {saved.includes(item.id) && (
          <span style={styles.tileSaved} title="Saved"><FaBookmark /></span>
        )}
      </span>

      <span style={{ ...styles.tileBody, ...(isMobile ? styles.tileBodyMobile : {}) }}>
        <span style={styles.tileMeta}>{item.category} • {item.region}</span>
        <span style={{ ...styles.tileName, ...(isMobile ? styles.tileNameMobile : {}) }}>{item.name}</span>

        <span style={styles.tileTrack}>
          <span style={{ ...styles.tileTrackFill, width: `${item.growthProgress}%` }} />
        </span>

        <span style={styles.tileFoot}>
          <span style={styles.tileDate}><FaCalendarAlt style={{ marginRight: 5, opacity: 0.6 }} />{item.estDate}</span>
          <span style={styles.tileMore}>Details <FaChevronRight size={9} /></span>
        </span>
      </span>
    </Reveal>
  );

  const emptyState = (
    <div className="inner-blur-glass" style={styles.emptyState}>
      <div style={styles.emptyIcon}><Leaf size="1em" color="var(--eco-c9)" /></div>
      <h3 style={styles.emptyTitle}>No Seasonal Harvest Available</h3>
      <p style={styles.emptyDesc}>
        There are no crops matching your filters{activeViewMode === "Monthly View" ? ` for ${selectedMonth}` : ""}. Try another month, category, or search term.
      </p>
    </div>
  );

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .floating-icon { animation: float 3s ease-in-out infinite; }
        @keyframes shDotPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.55; }
        }
        @keyframes shModalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shScrimIn { from { opacity: 0; } to { opacity: 1; } }
        .sh-dot { animation: shDotPulse 2.4s ease-in-out infinite; }
        .sh-hero img { transition: transform .8s cubic-bezier(.22,1,.36,1); }
        .sh-hero:hover img { transform: scale(1.05); }
        .sh-card img { transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .sh-card:hover img { transform: scale(1.07); }
        .sh-card:focus-visible, .sh-month:focus-visible, .sh-row:focus-visible {
          outline: 2px solid var(--eco-c5); outline-offset: 2px;
        }
        .sh-modal { animation: shModalIn .32s cubic-bezier(.22,1,.36,1) both; }
        .sh-scrim { animation: shScrimIn .22s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .sh-dot, .floating-icon { animation: none; }
          .sh-modal, .sh-scrim { animation: none; }
          .sh-hero img, .sh-hero:hover img,
          .sh-card img, .sh-card:hover img { transition: none; transform: none; }
        }
      `}</style>
      <RevealStyles />

      <div style={{ ...styles.headerRow, ...(isMobile ? styles.headerRowMobile : {}) }}>
        <div style={{ ...styles.backBtnWrap, ...(isMobile ? styles.backBtnWrapMobile : {}) }}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{ ...styles.backBtn, ...(isMobile ? styles.backBtnMobile : {}), ...(isHoveredBack ? styles.backBtnHov : {}) }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
            aria-label="Back to Home"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
          <span className="sh-dot" style={styles.badgeDot} />
          <span>Seasonal Harvest</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Seasonal Harvest & <span style={styles.accent}>Crop Calendar</span>
      </h1>

      <Reveal as="p" delay={120} style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Explore the best times to grow and harvest native crops. Pick a month, then open any crop for its full growing profile.
      </Reveal>

      {/* Two-column split: season imagery on the left, the calendar on the right */}
      <div style={{ ...styles.split, ...(isMobile ? styles.splitMobile : {}) }}>

        {/* ── Left: image + season summary ─────────────────────────── */}
        <aside style={{ ...styles.leftCol, ...(isMobile ? styles.leftColMobile : {}) }}>
          <Reveal variant="scale" delay={160} className="sh-hero" style={{ ...styles.hero, ...(isMobile ? styles.heroMobile : {}) }}>
            <img
              src="/Planting.webp"
              alt="Hands harvesting fresh produce from a garden bed"
              loading="lazy"
              decoding="async"
              style={{ ...styles.heroImg, ...(isMobile ? styles.heroImgMobile : {}) }}
            />
            <span aria-hidden="true" style={styles.heroScrim} />
            <span style={styles.heroTag}>
              {activeViewMode === "Monthly View" ? "In season" : "Full catalogue"}
            </span>
            <span style={styles.heroText}>
              <span style={styles.heroMonth}>
                {activeViewMode === "Monthly View" ? selectedMonth : "All year round"}
              </span>
              <span style={styles.heroCaption}>
                {visible.length} {visible.length === 1 ? "crop" : "crops"} · timed to the Philippine growing season
              </span>
            </span>
          </Reveal>

          <div style={styles.statGrid}>
            {[
              { icon: <FaLeaf />, value: totalCrops, label: "Total Crops" },
              { icon: <FaCalendarAlt />, value: peakingThisMonth.length, label: "Peak This Month" },
              { icon: <FaChartLine />, value: highDemandCrops, label: "High Demand" },
              { icon: <FaStore />, value: estRevenue, label: "Est. Revenue" },
            ].map(stat => (
              <div key={stat.label} className="inner-blur-glass" style={styles.statCard}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {peakingThisMonth.length > 0 && (
            <div className="inner-blur-glass" style={styles.peakPanel}>
              <div style={styles.peakPanelTitle}>
                <FaLeaf style={{ color: "var(--eco-c9)" }} /> Peaking in {selectedMonth}
              </div>
              <div style={styles.peakChips}>
                {peakingThisMonth.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOpenCrop(item)}
                    style={styles.peakChip}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.08)"; }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Right: calendar + crop grid ──────────────────────────── */}
        <section style={styles.rightCol}>

          <div className="hide-scroll" style={{ ...styles.viewModeContainer, ...(isMobile ? styles.viewModeContainerMobile : {}) }}>
            {viewModes.map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveViewMode(mode)}
                aria-pressed={activeViewMode === mode}
                style={{ ...styles.viewModeBtn, ...(isMobile ? styles.viewModeBtnMobile : {}), ...(activeViewMode === mode ? styles.viewModeBtnActive : {}) }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month grid — the calendar proper */}
          <div className="inner-blur-glass" style={{ ...styles.monthPanel, ...(isMobile ? styles.monthPanelMobile : {}) }}>
            <div style={{ ...styles.monthGrid, ...(isMobile ? styles.monthGridMobile : {}) }}>
              {months.map((month, mi) => {
                const count = catalogue.filter(item => item.months.includes(month)).length;
                const peaks = catalogue.filter(item => item.peak === month).length;
                const isActive = selectedMonth === month;
                const isNow = mi === new Date().getMonth();
                return (
                  <button
                    key={month}
                    type="button"
                    className="sh-month"
                    onClick={() => setSelectedMonth(month)}
                    aria-pressed={isActive}
                    title={`${month} — ${count} ${count === 1 ? "crop" : "crops"}${peaks ? `, ${peaks} peaking` : ""}`}
                    style={{
                      ...styles.monthCell,
                      ...(isMobile ? styles.monthCellMobile : {}),
                      ...(isActive ? styles.monthCellActive : {}),
                      ...(!isActive && isNow ? styles.monthCellNow : {}),
                      ...(count === 0 && !isActive ? styles.monthCellEmpty : {}),
                    }}
                  >
                    <span style={{ ...styles.monthName, ...(isActive ? { color: "var(--eco-c15)" } : {}) }}>
                      {isMobile ? monthShort[mi] : month.slice(0, 3)}
                    </span>
                    <span style={{ ...styles.monthCount, ...(isActive ? { color: "var(--eco-c15)", opacity: 0.95 } : {}) }}>
                      {count}
                    </span>
                    <span style={styles.monthBar}>
                      <span
                        style={{
                          ...styles.monthBarFill,
                          width: totalCrops ? `${Math.round((count / totalCrops) * 100)}%` : "0%",
                          background: isActive ? "rgba(255,255,255,0.85)" : "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))",
                        }}
                      />
                    </span>
                    {peaks > 0 && <span style={{ ...styles.monthPeakDot, ...(isActive ? { background: "var(--eco-c15)" } : {}) }} />}
                  </button>
                );
              })}
            </div>
            <div style={styles.legend}>
              <span style={styles.legendItem}><span style={styles.legendDot} /> peak month</span>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: "rgba(0,0,0,0.18)" }} /> number = crops in season</span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ ...styles.filtersContainer, ...(isMobile ? styles.filtersContainerMobile : {}) }}>
            <div className="hide-scroll" style={{ ...styles.categoryFilters, ...(isMobile ? styles.categoryFiltersMobile : {}) }}>
              <FaFilter style={{ color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={selectedCategory === cat}
                  style={{ ...styles.categoryBtn, ...(isMobile ? styles.categoryBtnMobile : {}), ...(selectedCategory === cat ? styles.categoryBtnActive : {}) }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ ...styles.searchWrap, ...(isMobile ? styles.searchWrapMobile : {}) }}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search crops..."
                aria-label="Search crops"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ ...styles.searchInput, ...(isMobile ? styles.searchInputMobile : {}) }}
              />
            </div>
          </div>

          {/* Results */}
          {activeViewMode === "Monthly View" && (
            filteredHarvests.length > 0 ? (
              <>
                <div style={styles.resultLine}>
                  <span><strong style={{ color: "var(--eco-c13)" }}>{filteredHarvests.length}</strong> in season · {selectedMonth}</span>
                  <span style={styles.resultHint}>Tap a crop for full details</span>
                </div>
                <div style={{ ...styles.tileGrid, ...(isMobile ? styles.tileGridMobile : {}) }}>
                  {filteredHarvests.map(cropTile)}
                </div>
              </>
            ) : emptyState
          )}

          {activeViewMode === "Seasonal Timeline" && (
            catalogue.length > 0 ? (
              <div style={styles.timeline}>
                {seasons.map(season => {
                  const group = catalogue.filter(item => season.months.includes(item.peak));
                  const isCurrent = season.months.includes(selectedMonth);
                  return (
                    <div key={season.label} style={{ ...styles.seasonBlock, ...(isCurrent ? styles.seasonBlockActive : {}) }}>
                      <div style={styles.seasonHead}>
                        <span style={styles.seasonLabel}>
                          <FaSun style={{ color: "var(--eco-c9)" }} /> {season.label}
                        </span>
                        <span style={styles.seasonRange}>{season.range} · {group.length} peaking</span>
                      </div>
                      {group.length > 0 ? (
                        <div style={{ ...styles.tileGrid, ...(isMobile ? styles.tileGridMobile : {}) }}>
                          {group.map(cropTile)}
                        </div>
                      ) : (
                        <div style={styles.seasonEmpty}>No crops peak in this window.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : emptyState
          )}

          {activeViewMode === "Full Year Calendar" && (
            catalogue.length > 0 ? (
              <div className="inner-blur-glass" style={styles.yearPanel}>
                <div className="hide-scroll" style={styles.yearScroll}>
                  <div style={styles.yearInner}>
                    <div style={styles.yearHeadRow}>
                      <span style={styles.yearCropHead}>Crop</span>
                      {monthShort.map((m, i) => (
                        <span key={m} style={{ ...styles.yearMonthHead, ...(months[i] === selectedMonth ? styles.yearMonthHeadActive : {}) }}>
                          {m[0]}
                        </span>
                      ))}
                    </div>
                    {catalogue.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className="sh-row"
                        onClick={() => setOpenCrop(item)}
                        style={styles.yearRow}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--eco-c9-rgb), 0.07)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        aria-label={`View details for ${item.name}`}
                      >
                        <span style={styles.yearCropCell}>
                          <span style={styles.yearThumb}>
                            <CropThumb name={item.name} fallback={<span style={{ fontSize: 13 }}>{item.icon}</span>} />
                          </span>
                          <span style={styles.yearCropName}>{item.name}</span>
                        </span>
                        {months.map(m => {
                          const inSeason = item.months.includes(m);
                          const isPeak = item.peak === m;
                          return (
                            <span
                              key={m}
                              title={`${item.name} — ${m}${isPeak ? " (peak)" : inSeason ? " (in season)" : " (off season)"}`}
                              style={{
                                ...styles.yearCell,
                                ...(inSeason ? styles.yearCellOn : {}),
                                ...(isPeak ? styles.yearCellPeak : {}),
                                ...(m === selectedMonth ? styles.yearCellColumn : {}),
                              }}
                            />
                          );
                        })}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.legend}>
                  <span style={styles.legendItem}><span style={{ ...styles.legendSwatch, background: "rgba(var(--eco-c9-rgb), 0.28)" }} /> in season</span>
                  <span style={styles.legendItem}><span style={{ ...styles.legendSwatch, background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))" }} /> peak</span>
                </div>
              </div>
            ) : emptyState
          )}
        </section>
      </div>

      {openCrop && (
        <CropDetailModal
          item={openCrop}
          isMobile={isMobile}
          selectedMonth={selectedMonth}
          isSaved={saved.includes(openCrop.id)}
          onClose={closeModal}
          onAddToCalendar={handleAddToCalendar}
          onNotify={handleNotify}
          onToggleSave={toggleSave}
          onShop={() => { closeModal(); setActiveNav && setActiveNav("Shop All Products"); }}
        />
      )}
    </div>
  );
}

/* ── Crop detail popup ───────────────────────────────────────────────────────
   Portalled to <body> so it clears the mobile Seasonal Harvest overlay, whose
   backdrop-filter would otherwise become the containing block for position:fixed. */
function CropDetailModal({ item, isMobile, selectedMonth, isSaved, onClose, onAddToCalendar, onNotify, onToggleSave, onShop }) {
  const panelRef = React.useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const facts = [
    { icon: <FaCalendarAlt />, label: "Est. harvest", value: item.estDate, sub: item.countdown },
    { icon: <FaChartLine />, label: "Price trend", value: item.priceTrend, sub: item.demand },
    { icon: <FaSeedling />, label: "Plant in", value: item.plantingMonth, sub: `${item.yield} yield` },
    { icon: <FaMapMarkerAlt />, label: "Grown in", value: item.location, sub: item.region },
    { icon: <FaTint />, label: "Water", value: item.water, sub: `${item.soil} soil` },
    { icon: <FaThermometerHalf />, label: "Temperature", value: item.temp, sub: item.weather },
    { icon: <FaBug />, label: "Pest risk", value: item.pestRisk, sub: `${item.risk} overall risk` },
    { icon: <FaBoxOpen />, label: "Supply", value: `${item.suppliers} suppliers`, sub: `${item.restaurantMatches} demand matches` },
  ];

  return createPortal(
    <div
      className="sh-scrim"
      style={modal.scrim}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="sh-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} growing profile`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ ...modal.panel, ...(isMobile ? modal.panelMobile : {}) }}
      >
        <button type="button" onClick={onClose} aria-label="Close details" style={modal.close}>
          <FaTimes />
        </button>

        <div style={{ ...modal.header, ...(isMobile ? modal.headerMobile : {}) }}>
          <div style={{ ...modal.media, ...(isMobile ? modal.mediaMobile : {}), ...(cropImage(item.name) ? {} : modal.mediaPlain) }}>
            <CropThumb name={item.name} fallback={<span style={{ fontSize: isMobile ? 34 : 46 }}>{item.icon}</span>} />
          </div>
          <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
            <div style={modal.eyebrow}>{item.category} • {item.region}</div>
            <h2 style={{ ...modal.title, ...(isMobile ? modal.titleMobile : {}) }}>{item.name}</h2>
            <div style={modal.chipRow}>
              {item.peak === selectedMonth && (
                <span style={modal.peakChip}><FaLeaf style={{ marginRight: 4 }} />Peak in {selectedMonth}</span>
              )}
              <span style={modal.chip}>{item.demand}</span>
              <span style={modal.chip}>{item.countdown}</span>
            </div>
          </div>
        </div>

        <div style={modal.progressWrap}>
          <div style={modal.progressHead}>
            <span>Growth progress</span>
            <span style={{ color: "var(--eco-c13)", fontWeight: 800 }}>{item.growthProgress}%</span>
          </div>
          <div style={modal.progressTrack}>
            <div style={{ ...modal.progressFill, width: `${item.growthProgress}%` }} />
          </div>
        </div>

        <div style={modal.sectionLabel}>Season</div>
        <div style={modal.monthStrip}>
          {months.map((m, i) => {
            const inSeason = item.months.includes(m);
            const isPeak = item.peak === m;
            return (
              <span
                key={m}
                title={`${m}${isPeak ? " — peak" : inSeason ? " — in season" : ""}`}
                style={{
                  ...modal.monthPip,
                  ...(inSeason ? modal.monthPipOn : {}),
                  ...(isPeak ? modal.monthPipPeak : {}),
                }}
              >
                {monthShort[i][0]}
              </span>
            );
          })}
        </div>

        <div style={modal.sectionLabel}>Growing profile</div>
        <div style={{ ...modal.factGrid, ...(isMobile ? modal.factGridMobile : {}) }}>
          {facts.map(f => (
            <div key={f.label} style={{ ...modal.fact, ...(isMobile ? modal.factMobile : {}) }}>
              <span style={modal.factIcon}>{f.icon}</span>
              <span style={{ minWidth: 0 }}>
                <span style={modal.factLabel}>{f.label}</span>
                <span style={modal.factValue}>{f.value}</span>
                {f.sub && <span style={modal.factSub}>{f.sub}</span>}
              </span>
            </div>
          ))}
        </div>

        <div style={modal.actions}>
          <button
            type="button"
            style={{ ...modal.btnPrimary, ...(isMobile ? modal.btnMobile : {}) }}
            onClick={(e) => onAddToCalendar(e, item)}
          >
            <FaCalendarPlus /> Remind Me
          </button>
          <button
            type="button"
            style={{ ...modal.btnGhost, ...(isMobile ? modal.btnMobile : {}) }}
            onClick={(e) => onNotify(e, item)}
          >
            <FaBell /> Notify
          </button>
          <button
            type="button"
            style={{ ...modal.btnGhost, ...(isMobile ? modal.btnMobile : {}), ...(isSaved ? modal.btnGhostOn : {}) }}
            onClick={(e) => onToggleSave(e, item)}
            aria-pressed={isSaved}
          >
            <FaBookmark /> {isSaved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            style={{ ...modal.btnPrimary, ...(isMobile ? modal.btnMobile : {}) }}
            onClick={onShop}
          >
            <FaStore /> Buy Now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  wrap: {
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 16px 60px", maxWidth: "1240px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  wrapMobile: { padding: "18px 10px 96px", width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", marginBottom: "20px" },
  headerRowMobile: { marginBottom: "14px", minHeight: "36px" },
  backBtnWrap: { position: "absolute", left: 0, top: "-5px" },
  backBtnWrapMobile: { top: 0 },
  backBtn: { padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s ease" },
  backBtnMobile: { width: "34px", height: "34px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" },
  backBtnHov: { transform: "scale(1.035)" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "999px",
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: 600,
    color: "var(--eco-c13)", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeMobile: { padding: "5px 11px", fontSize: "9.5px", maxWidth: "calc(100% - 82px)", justifyContent: "center" },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--eco-c6)", boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)", display: "inline-block" },
  title: { fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 300, color: "#000", margin: "0 auto 16px", lineHeight: 1.15, letterSpacing: "-0.8px", textShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  titleMobile: { fontSize: "clamp(20px, 6.5vw, 28px)", marginBottom: "10px", letterSpacing: "0" },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  body: { color: "#000", marginBottom: "28px", fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, lineHeight: 1.6, maxWidth: "700px" },
  bodyMobile: { marginBottom: "16px", fontSize: "12px", lineHeight: 1.55, maxWidth: "94%" },

  /* Two-column shell */
  split: { display: "grid", gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)", gap: "24px", width: "100%", alignItems: "start", textAlign: "left" },
  splitMobile: { gridTemplateColumns: "1fr", gap: "14px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "12px" },
  leftColMobile: { position: "static", gap: "10px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 },

  hero: {
    position: "relative", width: "100%", flexShrink: 0, borderRadius: "20px", overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
  },
  heroMobile: { borderRadius: "16px" },
  heroImg: { display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover" },
  heroImgMobile: { aspectRatio: "16 / 9" },
  heroScrim: { position: "absolute", inset: "auto 0 0 0", height: "70%", pointerEvents: "none", background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 100%)" },
  heroTag: {
    position: "absolute", top: "14px", left: "14px", padding: "5px 11px", borderRadius: "999px",
    background: "rgba(255,255,255,0.86)", color: "var(--eco-c13)", fontSize: "10px", fontWeight: 800,
    letterSpacing: "0.7px", textTransform: "uppercase", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  },
  heroText: { position: "absolute", left: "18px", right: "18px", bottom: "16px", display: "flex", flexDirection: "column", gap: "4px" },
  heroMonth: { color: "#fff", fontSize: "26px", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.4px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" },
  heroCaption: { color: "rgba(255,255,255,0.9)", fontSize: "12px", fontWeight: 500, lineHeight: 1.45, textShadow: "0 1px 6px rgba(0,0,0,0.45)" },

  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" },
  statCard: { padding: "12px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", minWidth: 0 },
  statIcon: { width: "32px", height: "32px", flexShrink: 0, borderRadius: "9px", background: "rgba(var(--eco-c9-rgb), 0.12)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" },
  statValue: { fontSize: "16px", fontWeight: 800, color: "#000", lineHeight: 1.2, overflowWrap: "anywhere" },
  statLabel: { fontSize: "9.5px", color: "rgba(0,0,0,0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", lineHeight: 1.3 },

  peakPanel: { padding: "12px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.62)", border: "1px solid rgba(0,0,0,0.05)" },
  peakPanelTitle: { display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "9px" },
  peakChips: { display: "flex", flexWrap: "wrap", gap: "6px" },
  peakChip: { padding: "5px 11px", borderRadius: "999px", border: "1px solid rgba(var(--eco-c9-rgb), 0.22)", background: "rgba(var(--eco-c9-rgb), 0.08)", color: "var(--eco-c13)", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s ease" },

  viewModeContainer: { display: "flex", gap: "6px", background: "rgba(255,255,255,0.45)", padding: "5px", borderRadius: "999px", overflowX: "auto", border: "1px solid rgba(0,0,0,0.04)" },
  viewModeContainerMobile: { width: "100%", maxWidth: "100%", boxSizing: "border-box", borderRadius: "14px", scrollSnapType: "x mandatory" },
  viewModeBtn: { flex: 1, padding: "8px 14px", borderRadius: "999px", border: "none", background: "transparent", fontSize: "12.5px", fontWeight: 700, color: "rgba(0,0,0,0.55)", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", fontFamily: "inherit" },
  viewModeBtnMobile: { flex: "0 0 auto", padding: "7px 12px", fontSize: "11px", scrollSnapAlign: "start" },
  viewModeBtnActive: { background: "#fff", color: "var(--eco-c13)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },

  monthPanel: { padding: "12px", borderRadius: "18px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" },
  monthPanelMobile: { padding: "9px", borderRadius: "14px" },
  monthGrid: { display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "7px" },
  monthGridMobile: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "5px" },
  monthCell: {
    position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3px",
    padding: "9px 9px 8px", borderRadius: "11px", border: "1px solid rgba(0,0,0,0.05)",
    background: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
    fontFamily: "inherit", textAlign: "left", minWidth: 0,
  },
  monthCellMobile: { padding: "7px 7px 6px", borderRadius: "9px", gap: "2px" },
  monthCellActive: { background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 6px 16px rgba(var(--eco-c7-rgb), 0.28)", transform: "translateY(-1px)" },
  monthCellNow: { border: "1px solid rgba(var(--eco-c9-rgb), 0.4)", boxShadow: "inset 0 0 0 1px rgba(var(--eco-c9-rgb), 0.15)" },
  monthCellEmpty: { opacity: 0.55 },
  monthName: { fontSize: "11px", fontWeight: 800, color: "rgba(0,0,0,0.7)", letterSpacing: "0.3px", textTransform: "uppercase" },
  monthCount: { fontSize: "15px", fontWeight: 800, color: "#000", lineHeight: 1 },
  monthBar: { width: "100%", height: "3px", borderRadius: "999px", background: "rgba(0,0,0,0.08)", overflow: "hidden", marginTop: "2px" },
  monthBarFill: { display: "block", height: "100%", borderRadius: "999px" },
  monthPeakDot: { position: "absolute", top: "7px", right: "7px", width: "5px", height: "5px", borderRadius: "50%", background: "var(--eco-c9)" },

  legend: { display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px", paddingTop: "9px", borderTop: "1px solid rgba(0,0,0,0.05)" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)" },
  legendDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--eco-c9)", display: "inline-block" },
  legendSwatch: { width: "12px", height: "8px", borderRadius: "3px", display: "inline-block" },

  filtersContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "12px", flexWrap: "wrap" },
  filtersContainerMobile: { flexDirection: "column", alignItems: "stretch", gap: "9px" },
  categoryFilters: { display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.6)", padding: "5px 11px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.05)", overflowX: "auto", minWidth: 0 },
  categoryFiltersMobile: { borderRadius: "14px", padding: "6px 8px" },
  categoryBtn: { padding: "6px 14px", borderRadius: "999px", border: "none", background: "transparent", color: "rgba(0,0,0,0.55)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", fontFamily: "inherit" },
  categoryBtnMobile: { flex: "0 0 auto", padding: "7px 12px", fontSize: "11px" },
  categoryBtnActive: { background: "#fff", color: "var(--eco-c13)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },

  searchWrap: { position: "relative", width: "240px", maxWidth: "100%" },
  searchWrapMobile: { width: "100%" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(0,0,0,0.35)" },
  searchInput: { width: "100%", padding: "10px 16px 10px 38px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  searchInputMobile: { padding: "10px 14px 10px 36px", fontSize: "12px" },

  resultLine: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.55)", flexWrap: "wrap" },
  resultHint: { fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.38)" },

  /* Crop tiles */
  tileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(178px, 1fr))", gap: "12px", width: "100%" },
  tileGridMobile: { gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "9px" },
  tile: {
    display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer",
    background: "linear-gradient(150deg, rgba(255,255,255,0.85), rgba(var(--eco-c0-rgb), 0.6))",
    border: "1px solid rgba(255,255,255,0.9)", borderRadius: "16px", boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease", fontFamily: "inherit",
  },
  tileMobile: { borderRadius: "13px" },
  tileHover: { transform: "translateY(-3px)", boxShadow: "0 14px 34px rgba(var(--eco-c11-rgb), 0.14)" },
  tileMedia: { position: "relative", display: "block", width: "100%", aspectRatio: "4 / 3", overflow: "hidden", background: "rgba(var(--eco-c9-rgb), 0.08)" },
  tileMediaMobile: { aspectRatio: "5 / 4" },
  /* No photo for this crop yet — a soft sage wash keeps the tile from reading
     as a hole in the grid next to the photographed ones. */
  tileMediaPlain: { background: "radial-gradient(120% 100% at 30% 20%, rgba(var(--eco-c9-rgb), 0.20), rgba(var(--eco-c0-rgb), 0.75))" },
  tileFallback: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "38px", opacity: 0.9 },
  tilePeak: {
    position: "absolute", top: "8px", left: "8px", display: "inline-flex", alignItems: "center",
    padding: "4px 9px", borderRadius: "999px", fontSize: "9.5px", fontWeight: 800, color: "#fff",
    background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))", boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.35)",
    letterSpacing: "0.3px", textTransform: "uppercase",
  },
  tileSaved: {
    position: "absolute", top: "8px", right: "8px", width: "22px", height: "22px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px",
    background: "rgba(255,255,255,0.9)", color: "var(--eco-c13)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  tileBody: { display: "flex", flexDirection: "column", gap: "5px", padding: "11px 12px 12px", minWidth: 0 },
  tileBodyMobile: { padding: "9px 9px 10px", gap: "4px" },
  tileMeta: { fontSize: "9px", fontWeight: 800, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tileName: { fontSize: "14.5px", fontWeight: 800, color: "#000", lineHeight: 1.25 },
  tileNameMobile: { fontSize: "12.5px" },
  tileTrack: { display: "block", width: "100%", height: "4px", borderRadius: "999px", background: "rgba(0,0,0,0.07)", overflow: "hidden", marginTop: "2px" },
  tileTrackFill: { display: "block", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))" },
  tileFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginTop: "3px" },
  tileDate: { display: "inline-flex", alignItems: "center", fontSize: "10.5px", fontWeight: 700, color: "rgba(0,0,0,0.6)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tileMore: { display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 800, color: "var(--eco-c13)", whiteSpace: "nowrap" },

  /* Seasonal timeline */
  timeline: { display: "flex", flexDirection: "column", gap: "14px" },
  seasonBlock: { padding: "13px", borderRadius: "16px", background: "rgba(255,255,255,0.42)", border: "1px solid rgba(0,0,0,0.05)" },
  seasonBlockActive: { border: "1px solid rgba(var(--eco-c9-rgb), 0.35)", background: "rgba(var(--eco-c9-rgb), 0.06)" },
  seasonHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "10px" },
  seasonLabel: { display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 800, color: "#000" },
  seasonRange: { fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.45)" },
  seasonEmpty: { fontSize: "11.5px", fontWeight: 600, color: "rgba(0,0,0,0.4)", padding: "6px 2px" },

  /* Full-year matrix */
  yearPanel: { padding: "12px", borderRadius: "18px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" },
  yearScroll: { width: "100%", overflowX: "auto" },
  yearInner: { minWidth: "330px" },
  yearHeadRow: { display: "grid", gridTemplateColumns: "minmax(146px, 1.5fr) repeat(12, minmax(0, 1fr))", gap: "3px", alignItems: "center", padding: "0 4px 7px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "4px" },
  yearCropHead: { fontSize: "9.5px", fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" },
  yearMonthHead: { fontSize: "9.5px", fontWeight: 800, color: "rgba(0,0,0,0.35)", textAlign: "center" },
  yearMonthHeadActive: { color: "var(--eco-c13)" },
  yearRow: { display: "grid", gridTemplateColumns: "minmax(146px, 1.5fr) repeat(12, minmax(0, 1fr))", gap: "3px", alignItems: "center", width: "100%", padding: "5px 4px", border: "none", background: "transparent", borderRadius: "9px", cursor: "pointer", transition: "background 0.18s ease", fontFamily: "inherit" },
  yearCropCell: { display: "flex", alignItems: "center", gap: "7px", minWidth: 0, textAlign: "left" },
  yearThumb: { width: "22px", height: "22px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", background: "rgba(var(--eco-c9-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  yearCropName: { fontSize: "11.5px", fontWeight: 700, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  yearCell: { height: "18px", borderRadius: "5px", background: "rgba(0,0,0,0.05)" },
  yearCellOn: { background: "rgba(var(--eco-c9-rgb), 0.28)" },
  yearCellPeak: { background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))", boxShadow: "0 2px 8px rgba(var(--eco-c7-rgb), 0.25)" },
  yearCellColumn: { outline: "1.5px solid rgba(var(--eco-c5-rgb), 0.55)", outlineOffset: "-1.5px" },

  emptyState: { width: "100%", padding: "48px 20px", background: "rgba(255,255,255,0.5)", borderRadius: "20px", border: "1px dashed rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: 0.85 },
  emptyIcon: { fontSize: "44px", marginBottom: "14px", filter: "grayscale(1)" },
  emptyTitle: { fontSize: "17px", fontWeight: 700, color: "#000", margin: "0 0 8px" },
  emptyDesc: { fontSize: "13px", color: "rgba(0,0,0,0.6)", margin: 0, maxWidth: "400px" },
};

const modal = {
  scrim: {
    position: "fixed", inset: 0, zIndex: 10050, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px", background: "rgba(15, 23, 20, 0.42)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    overflowY: "auto",
  },
  panel: {
    position: "relative", width: "100%", maxWidth: "600px", maxHeight: "88vh", overflowY: "auto",
    padding: "22px", borderRadius: "22px", textAlign: "left", outline: "none",
    background: "linear-gradient(160deg, rgba(255,255,255,0.97), rgba(var(--eco-c0-rgb), 0.95))",
    border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  panelMobile: { padding: "16px", borderRadius: "18px", maxHeight: "92vh" },
  close: {
    position: "absolute", top: "14px", right: "14px", width: "32px", height: "32px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.9)", color: "rgba(0,0,0,0.55)", cursor: "pointer", fontSize: "13px", zIndex: 2,
  },
  header: { display: "flex", alignItems: "center", gap: "16px", paddingRight: "34px" },
  headerMobile: { gap: "11px" },
  media: { width: "112px", height: "112px", flexShrink: 0, borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,0,0,0.14)" },
  mediaMobile: { width: "78px", height: "78px", borderRadius: "13px" },
  mediaPlain: { background: "rgba(var(--eco-c9-rgb), 0.1)", border: "1px solid rgba(var(--eco-c9-rgb), 0.2)", boxShadow: "none" },
  eyebrow: { fontSize: "10px", fontWeight: 800, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.6px" },
  title: { fontSize: "24px", fontWeight: 800, color: "#000", margin: "4px 0 9px", lineHeight: 1.15, letterSpacing: "-0.4px" },
  titleMobile: { fontSize: "18px", margin: "3px 0 7px" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: { padding: "4px 10px", borderRadius: "999px", background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", fontSize: "10.5px", fontWeight: 700 },
  peakChip: { display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "999px", background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))", color: "#fff", fontSize: "10.5px", fontWeight: 800, boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.3)" },

  progressWrap: { marginTop: "18px" },
  progressHead: { display: "flex", justifyContent: "space-between", fontSize: "11.5px", fontWeight: 700, color: "rgba(0,0,0,0.6)", marginBottom: "6px" },
  progressTrack: { width: "100%", height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.07)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))" },

  sectionLabel: { fontSize: "10px", fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.7px", margin: "20px 0 9px" },
  monthStrip: { display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "4px" },
  monthPip: { display: "flex", alignItems: "center", justifyContent: "center", height: "26px", borderRadius: "7px", background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.35)", fontSize: "10px", fontWeight: 800 },
  monthPipOn: { background: "rgba(var(--eco-c9-rgb), 0.22)", color: "var(--eco-c13)" },
  monthPipPeak: { background: "linear-gradient(135deg, var(--eco-c6), var(--eco-c9))", color: "#fff", boxShadow: "0 3px 10px rgba(var(--eco-c7-rgb), 0.28)" },

  factGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  factGridMobile: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" },
  fact: { display: "flex", alignItems: "flex-start", gap: "9px", padding: "10px 11px", borderRadius: "12px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.05)" },
  factMobile: { padding: "8px 9px", gap: "7px" },
  factIcon: { width: "26px", height: "26px", flexShrink: 0, borderRadius: "8px", background: "rgba(var(--eco-c9-rgb), 0.12)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" },
  factLabel: { display: "block", fontSize: "9.5px", fontWeight: 800, color: "rgba(0,0,0,0.42)", textTransform: "uppercase", letterSpacing: "0.4px" },
  factValue: { display: "block", fontSize: "12.5px", fontWeight: 800, color: "#000", lineHeight: 1.3, marginTop: "2px", overflowWrap: "anywhere" },
  factSub: { display: "block", fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginTop: "1px" },

  actions: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" },
  btnPrimary: {
    flex: "1 1 130px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px",
    padding: "11px 14px", borderRadius: "12px", cursor: "pointer", fontSize: "12.5px", fontWeight: 800,
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    color: "var(--eco-c19)", border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 6px 16px rgba(var(--eco-c7-rgb), 0.25)", fontFamily: "inherit", transition: "transform 0.18s ease",
  },
  btnGhost: {
    flex: "1 1 110px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px",
    padding: "11px 14px", borderRadius: "12px", cursor: "pointer", fontSize: "12.5px", fontWeight: 800,
    background: "rgba(var(--eco-c9-rgb), 0.1)", color: "var(--eco-c13)", border: "1px solid rgba(var(--eco-c9-rgb), 0.22)",
    fontFamily: "inherit", transition: "background 0.18s ease",
  },
  btnGhostOn: { background: "rgba(var(--eco-c9-rgb), 0.25)" },
  btnMobile: { flex: "1 1 46%", padding: "10px 10px", fontSize: "11.5px" },
};
