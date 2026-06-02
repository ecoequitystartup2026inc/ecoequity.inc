import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaFilter, FaCalendarAlt, FaSearch, FaLeaf, FaCalendarPlus, FaBell, FaBookmark, FaStore, FaThermometerHalf, FaTint, FaBug, FaSeedling, FaChartLine, FaMapMarkerAlt, FaBoxOpen } from "react-icons/fa";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const categories = ["All", "Vegetables", "Fruits", "Herbs", "Grains"];
const viewModes = ["Monthly View", "Seasonal Timeline", "Full Year Calendar"];

export default function SeasonalHarvestPage({ setActiveNav, onNotify, harvests }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeViewMode, setActiveViewMode] = useState("Monthly View");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredHarvests = (harvests || []).filter(item => {
    const matchesMonth = item.months.includes(selectedMonth);
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesCategory && matchesSearch;
  });

  const totalCrops = (harvests || []).length;
  const peakingThisMonth = (harvests || []).filter(h => h.peak === selectedMonth).length;
  const highDemandCrops = (harvests || []).filter(h => h.demand === "High Demand").length;
  const estRevenue = `₱${((harvests || []).length * 150000).toLocaleString()}`;

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

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes tooltipFadeIn {
          from { opacity: 0; margin-bottom: 4px; }
          to { opacity: 1; margin-bottom: 8px; }
        }
      `}</style>
      
      <div style={{ ...styles.headerRow, ...(isMobile ? styles.headerRowMobile : {}) }}>
        <div style={{ ...styles.backBtnWrap, ...(isMobile ? styles.backBtnWrapMobile : {}) }}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{ ...styles.backBtn, ...(isMobile ? styles.backBtnMobile : {}), ...(isHoveredBack ? styles.backBtnHov : {}) }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          > 
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
          <span style={styles.badgeDot} />
          <span>Seasonal Harvest</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Seasonal Harvest & <span style={styles.accent}>Crop Calendar</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Explore the best times to grow and harvest native crops. Stay in sync with nature's rhythm and optimize your yield throughout the year.
      </p>

      {/* Dashboard Analytics */}
      <div style={{...styles.analyticsGrid, ...(isMobile ? styles.analyticsGridMobile : {})}}>
         <div className="inner-blur-glass" style={styles.analyticsCard}>
            <div style={{ ...styles.analyticsIconWrap, ...(isMobile ? styles.analyticsIconWrapMobile : {}) }}><FaLeaf /></div>
            <div>
               <div style={{ ...styles.analyticsValue, ...(isMobile ? styles.analyticsValueMobile : {}) }}>{totalCrops}</div>
               <div style={{ ...styles.analyticsLabel, ...(isMobile ? styles.analyticsLabelMobile : {}) }}>Total Crops</div>
            </div>
         </div>
         <div className="inner-blur-glass" style={styles.analyticsCard}>
            <div style={{...styles.analyticsIconWrap, ...(isMobile ? styles.analyticsIconWrapMobile : {}), color: '#f59e0b', background: 'rgba(245,158,11,0.1)'}}><FaCalendarAlt /></div>
            <div>
               <div style={{ ...styles.analyticsValue, ...(isMobile ? styles.analyticsValueMobile : {}) }}>{peakingThisMonth}</div>
               <div style={{ ...styles.analyticsLabel, ...(isMobile ? styles.analyticsLabelMobile : {}) }}>Peak This Month</div>
            </div>
         </div>
         <div className="inner-blur-glass" style={styles.analyticsCard}>
            <div style={{...styles.analyticsIconWrap, ...(isMobile ? styles.analyticsIconWrapMobile : {}), color: '#e11d48', background: 'rgba(225,29,72,0.1)'}}><FaChartLine /></div>
            <div>
               <div style={{ ...styles.analyticsValue, ...(isMobile ? styles.analyticsValueMobile : {}) }}>{highDemandCrops}</div>
               <div style={{ ...styles.analyticsLabel, ...(isMobile ? styles.analyticsLabelMobile : {}) }}>High Demand Products</div>
            </div>
         </div>
         <div className="inner-blur-glass" style={styles.analyticsCard}>
            <div style={{...styles.analyticsIconWrap, ...(isMobile ? styles.analyticsIconWrapMobile : {}), color: '#0284c7', background: 'rgba(2,132,199,0.1)'}}><FaStore /></div>
            <div>
               <div style={{ ...styles.analyticsValue, ...(isMobile ? styles.analyticsValueMobile : {}) }}>{estRevenue}</div>
               <div style={{ ...styles.analyticsLabel, ...(isMobile ? styles.analyticsLabelMobile : {}) }}>Est. Revenue Opportunities</div>
            </div>
         </div>
      </div>

      {/* View Modes */}
      <div className="hide-scroll" style={{ ...styles.viewModeContainer, ...(isMobile ? styles.viewModeContainerMobile : {}) }}>
         {viewModes.map(mode => (
            <button key={mode} onClick={() => setActiveViewMode(mode)} style={{...styles.viewModeBtn, ...(isMobile ? styles.viewModeBtnMobile : {}), ...(activeViewMode === mode ? styles.viewModeBtnActive : {})}}>
               {mode}
            </button>
         ))}
      </div>

      {/* Month Selector Dashboard */}
      <div className="hide-scroll" style={{ ...styles.monthSelector, ...(isMobile ? styles.monthSelectorMobile : {}) }}>
        {months.map(month => {
          const count = (harvests || []).filter(item => item.months.includes(month)).length;
          return (
            <div key={month} style={{ position: 'relative', display: 'flex', scrollSnapAlign: "center" }}>
              <button
                onClick={() => setSelectedMonth(month)}
                onMouseEnter={() => setHoveredMonth(month)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{
                  ...styles.monthBtn,
                  ...(isMobile ? styles.monthBtnMobile : {}),
                  ...(selectedMonth === month ? styles.monthBtnActive : {})
                }}
              >
                {month}
              </button>
              {hoveredMonth === month && (
                <div style={styles.monthTooltip}>
                  {count} {count === 1 ? 'crop' : 'crops'} available
                  <div style={styles.monthTooltipArrow} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div style={{ ...styles.filtersContainer, ...(isMobile ? styles.filtersContainerMobile : {}) }}>
        <div style={{ ...styles.categoryFilters, ...(isMobile ? styles.categoryFiltersMobile : {}) }}>
          <FaFilter style={{ color: "rgba(0,0,0,0.5)" }} />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryBtn,
                ...(isMobile ? styles.categoryBtnMobile : {}),
                ...(selectedCategory === cat ? styles.categoryBtnActive : {})
              }}
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
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...styles.searchInput, ...(isMobile ? styles.searchInputMobile : {}) }}
          />
        </div>
      </div>

      {/* Harvest Grid */}
      {filteredHarvests.length > 0 ? (
        <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : {}) }}>
          {filteredHarvests.map(item => (
            <div 
              key={item.id}
              className="inner-blur-glass"
              style={{
                ...styles.card,
                ...(isMobile ? styles.cardMobile : {}),
                ...(hoveredCard === item.id ? styles.cardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ ...styles.cardHeader, ...(isMobile ? styles.cardHeaderMobile : {}) }}>
                <div style={{ ...styles.iconWrap, ...(isMobile ? styles.iconWrapMobile : {}) }}>
                  <span style={{ ...styles.icon, ...(isMobile ? styles.iconMobile : {}) }} className="floating-icon">{item.icon}</span>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                  {item.peak === selectedMonth && (
                    <span style={{ ...styles.peakBadge, ...(isMobile ? styles.peakBadgeMobile : {}) }}>
                      <FaLeaf style={{ marginRight: '4px' }}/> Peak Season
                    </span>
                  )}
                  <span style={{ fontSize: isMobile ? '8.5px' : '11px', fontWeight: 600, color: '#e11d48', background: 'rgba(225,29,72,0.1)', padding: isMobile ? '2px 5px' : '2px 8px', borderRadius: '4px' }}>
                    {item.demand}
                  </span>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ ...styles.itemCategory, ...(isMobile ? styles.itemCategoryMobile : {}) }}>{item.category} • {item.region}</span>
                  <span style={{ fontSize: isMobile ? '8.5px' : '11px', fontWeight: 700, color: '#15803d', whiteSpace: "nowrap" }}>{item.weather}</span>
                </div>
                <h3 style={{ ...styles.itemName, ...(isMobile ? styles.itemNameMobile : {}) }}>{item.name}</h3>
                
                {/* Growth Progress */}
                <div style={{ marginBottom: isMobile ? '8px' : '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '9px' : '11px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginBottom: isMobile ? '3px' : '4px' }}>
                    <span>Growth Progress</span>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>{item.growthProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: isMobile ? '4px' : '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.growthProgress}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80, #16a34a)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ ...styles.itemDetails, ...(isMobile ? styles.itemDetailsMobile : {}) }}>
                  <div style={{ ...styles.detailRow, ...(isMobile ? styles.detailRowMobile : {}) }}>
                    <span style={{ ...styles.detailLabel, ...(isMobile ? styles.detailLabelMobile : {}) }}><FaCalendarAlt style={{ marginRight: '4px' }}/> Est. Harvest:</span>
                    <span style={{ ...styles.detailValue, ...(isMobile ? styles.detailValueMobile : {}) }}>{item.estDate} <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.4)', marginLeft: '4px' }}>({item.countdown})</span></span>
                  </div>
                  <div style={{ ...styles.detailRow, ...(isMobile ? styles.detailRowMobile : {}) }}>
                    <span style={{ ...styles.detailLabel, ...(isMobile ? styles.detailLabelMobile : {}) }}><FaChartLine style={{ marginRight: '4px' }}/> Price Trend:</span>
                    <span style={{...styles.detailValue, ...(isMobile ? styles.detailValueMobile : {}), color: '#0284c7'}}>{item.priceTrend}</span>
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: isMobile ? '2px 0' : '4px 0' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '5px' : '8px', marginTop: isMobile ? '2px' : '4px' }}>
                    <div style={{ ...styles.miniStat, ...(isMobile ? styles.miniStatMobile : {}) }} title="Water Requirement"><FaTint color="#0ea5e9"/> {item.water}</div>
                    <div style={{ ...styles.miniStat, ...(isMobile ? styles.miniStatMobile : {}) }} title="Temperature"><FaThermometerHalf color="#f59e0b"/> {item.temp}</div>
                    <div style={{ ...styles.miniStat, ...(isMobile ? styles.miniStatMobile : {}) }} title="Soil Type"><FaSeedling color="#8b5cf6"/> {item.soil}</div>
                    <div style={{ ...styles.miniStat, ...(isMobile ? styles.miniStatMobile : {}) }} title="Pest Risk"><FaBug color={item.pestRisk === 'High' ? '#ef4444' : '#16a34a'}/> {item.pestRisk} Risk</div>
                  </div>
                </div>

                {/* Marketplace Integration */}
                <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', padding: isMobile ? '7px' : '10px', background: 'rgba(22, 163, 74, 0.05)', borderRadius: isMobile ? '9px' : '12px', marginTop: isMobile ? '8px' : '12px', border: '1px solid rgba(22, 163, 74, 0.1)', gap: isMobile ? '6px' : 0 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                     <span style={{ fontSize: isMobile ? '8.8px' : '11px', fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}><FaBoxOpen /> {item.suppliers} Suppliers</span>
                     <span style={{ fontSize: isMobile ? '8.8px' : '11px', fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}><FaStore /> {item.restaurantMatches} Demand Matches</span>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setActiveNav && setActiveNav("Shop All Products"); }}
                     style={{ padding: isMobile ? '5px 8px' : '6px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))', color: '#062018', border: '1px solid rgba(255,255,255,0.4)', fontSize: isMobile ? '9px' : '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(34,197,94,0.2)', whiteSpace: "nowrap" }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                     onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                   >
                     Buy Now
                   </button>
                </div>

                {/* Reminders / Actions */}
                <div style={{ display: 'flex', gap: isMobile ? '5px' : '8px', marginTop: isMobile ? '8px' : '12px' }}>
                  <button 
                    style={{...styles.calendarBtn, ...(isMobile ? styles.calendarBtnMobile : {}), flex: 1}} 
                    onClick={(e) => handleAddToCalendar(e, item)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.035)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <FaCalendarPlus /> Remind Me
                  </button>
                  <button 
                    style={{...styles.calendarBtn, ...(isMobile ? styles.calendarBtnMobile : {}), flex: 1, background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.2)', color: '#0284c7', boxShadow: 'none'}} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onNotify) {
                        onNotify(item.name);
                      } else {
                        alert(`Notifications enabled for ${item.name}`); 
                      }
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(2, 132, 199, 0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(2, 132, 199, 0.1)"}
                    title="Notify When Available / Peak"
                  >
                    <FaBell /> Notify
                  </button>
                  <button 
                    style={{...styles.calendarBtn, ...(isMobile ? styles.calendarBtnMobile : {}), width: isMobile ? '32px' : '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.6)', boxShadow: 'none', flex: "0 0 auto"}} 
                    onClick={(e) => { e.stopPropagation(); e.currentTarget.style.color = '#e11d48'; }}
                    title="Save Crop"
                  >
                    <FaBookmark />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="inner-blur-glass" style={styles.emptyState}>
          <div style={styles.emptyIcon}>🍂</div>
          <h3 style={styles.emptyTitle}>No Seasonal Harvest Available</h3>
          <p style={styles.emptyDesc}>There are no crops matching your filters for {selectedMonth}. Try selecting a different month or category.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 16px 60px", maxWidth: "1200px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  wrapMobile: { padding: "18px 10px 96px", width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", marginBottom: "20px" },
  headerRowMobile: { marginBottom: "14px", minHeight: "36px" },
  backBtnWrap: { position: "absolute", left: 0, top: "-5px" },
  backBtnWrapMobile: { top: 0 },
  backBtn: { padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", color: "#000", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s ease" },
  backBtnMobile: { width: "34px", height: "34px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" },
  backBtnHov: { transform: "scale(1.035)" },
  badge: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: 600, color: "#15803d", letterSpacing: "0.6px", textTransform: "uppercase", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)" },
  badgeMobile: { padding: "5px 11px", fontSize: "9.5px", maxWidth: "calc(100% - 82px)", justifyContent: "center" },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)", display: "inline-block" },
  title: { fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, color: "#000", margin: "0 auto 16px", lineHeight: 1.15, letterSpacing: "-0.8px", textShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  titleMobile: { fontSize: "clamp(20px, 6.5vw, 28px)", marginBottom: "10px", letterSpacing: "0" },
  titleUnderline: { width: "118px", height: "4px", background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)", backgroundSize: "200% 100%", margin: "0 auto 18px", boxShadow: "0 0 18px rgba(134,239,172,0.75)", borderRadius: "999px" },
  accent: { background: "linear-gradient(90deg, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  body: { color: "#000", marginBottom: "30px", fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, lineHeight: 1.6, maxWidth: "700px" },
  bodyMobile: { marginBottom: "18px", fontSize: "12px", lineHeight: 1.55, maxWidth: "94%" },
  
  analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", width: "100%", marginBottom: "24px" },
  analyticsGridMobile: { gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" },
  analyticsCard: { padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  analyticsIconWrap: { width: "40px", height: "40px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  analyticsIconWrapMobile: { width: "30px", height: "30px", borderRadius: "8px", fontSize: "13px", flexShrink: 0 },
  analyticsValue: { fontSize: "20px", fontWeight: 800, color: "#000", lineHeight: 1.2 },
  analyticsValueMobile: { fontSize: "13px", lineHeight: 1.1, overflowWrap: "anywhere" },
  analyticsLabel: { fontSize: "11px", color: "rgba(0,0,0,0.6)", fontWeight: 600, textTransform: "uppercase" },
  analyticsLabelMobile: { fontSize: "8px", lineHeight: 1.15 },

  viewModeContainer: { display: "flex", gap: "8px", background: "rgba(255,255,255,0.4)", padding: "6px", borderRadius: "999px", marginBottom: "24px", overflowX: "auto" },
  viewModeContainerMobile: { width: "100%", maxWidth: "100%", boxSizing: "border-box", marginBottom: "14px", borderRadius: "16px", scrollSnapType: "x mandatory" },
  viewModeBtn: { padding: "8px 16px", borderRadius: "999px", border: "none", background: "transparent", fontSize: "13px", fontWeight: 600, color: "rgba(0,0,0,0.6)", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" },
  viewModeBtnMobile: { flex: "0 0 auto", padding: "7px 12px", fontSize: "11px", scrollSnapAlign: "start" },
  viewModeBtnActive: { background: "#fff", color: "#15803d", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  
  monthSelector: { display: "flex", gap: "10px", width: "100%", overflowX: "auto", padding: "10px 4px", marginBottom: "24px", scrollSnapType: "x mandatory", background: "rgba(255,255,255,0.4)", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" },
  monthBtn: { padding: "12px 24px", borderRadius: "12px", border: "none", background: "transparent", color: "rgba(0,0,0,0.6)", fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  monthSelectorMobile: { gap: "6px", padding: "7px", marginBottom: "14px", boxSizing: "border-box" },
  monthBtnMobile: { padding: "9px 14px", fontSize: "12px", borderRadius: "10px" },
  monthBtnActive: { background: "linear-gradient(135deg, rgba(134,239,172,0.9), rgba(125,211,252,0.9))", color: "#064e3b", boxShadow: "0 4px 12px rgba(34,197,94,0.15)" },
  monthTooltip: { position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "8px", background: "#062018", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", pointerEvents: "none", animation: "tooltipFadeIn 0.2s ease-out" },
  monthTooltipArrow: { position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", borderWidth: "5px", borderStyle: "solid", borderColor: "#062018 transparent transparent transparent" },
  
  filtersContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "24px", gap: "16px", flexWrap: "wrap" },
  filtersContainerMobile: { flexDirection: "column", alignItems: "stretch", gap: "10px", marginBottom: "14px" },
  categoryFilters: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", background: "rgba(255,255,255,0.6)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.05)" },
  categoryFiltersMobile: { flexWrap: "nowrap", overflowX: "auto", borderRadius: "16px", padding: "7px", gap: "6px" },
  categoryBtn: { padding: "6px 16px", borderRadius: "999px", border: "none", background: "transparent", color: "rgba(0,0,0,0.6)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  categoryBtnMobile: { flex: "0 0 auto", padding: "7px 12px", fontSize: "11px" },
  categoryBtnActive: { background: "#fff", color: "#15803d", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  
  searchWrap: { position: "relative", width: "260px", maxWidth: "100%" },
  searchWrapMobile: { width: "100%" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(0,0,0,0.4)" },
  searchInput: { width: "100%", padding: "10px 16px 10px 40px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  searchInputMobile: { padding: "10px 14px 10px 38px", fontSize: "12px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", width: "100%" },
  gridMobile: { gridTemplateColumns: "1fr", gap: "12px" },
  card: { background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(240,253,244,0.6))", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", transition: "transform 0.2s ease, box-shadow 0.2s ease" },
  cardMobile: { padding: "9px", borderRadius: "14px" },
  cardHover: { transform: "translateY(-4px)", boxShadow: "0 14px 40px rgba(21,128,61,0.12)" },
  
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  cardHeaderMobile: { marginBottom: "7px", gap: "8px" },
  iconWrap: { width: "56px", height: "56px", borderRadius: "16px", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(22, 163, 74, 0.2)" },
  iconWrapMobile: { width: "36px", height: "36px", borderRadius: "11px", flexShrink: 0 },
  icon: { fontSize: "28px" },
  iconMobile: { fontSize: "19px" },
  peakBadge: { background: "linear-gradient(135deg, #4ade80, #16a34a)", color: "#fff", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" },
  peakBadgeMobile: { padding: "3px 6px", fontSize: "8.5px" },
  
  cardContent: { display: "flex", flexDirection: "column", flex: 1 },
  itemCategory: { fontSize: "11px", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700, marginBottom: "4px" },
  itemCategoryMobile: { fontSize: "8px", letterSpacing: "0.2px", lineHeight: 1.15, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemName: { fontSize: "18px", fontWeight: 800, color: "#000", margin: "0 0 16px", lineHeight: 1.2 },
  itemNameMobile: { fontSize: "13px", margin: "0 0 7px", lineHeight: 1.15 },
  
  itemDetails: { display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", marginTop: "auto" },
  itemDetailsMobile: { gap: "5px", padding: "8px", borderRadius: "9px" },
  detailRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  detailRowMobile: { alignItems: "flex-start", gap: "8px" },
  detailLabel: { fontSize: "12px", color: "rgba(0,0,0,0.6)", fontWeight: 600 },
  detailLabelMobile: { fontSize: "9px", flexShrink: 0 },
  detailValue: { fontSize: "12px", color: "#15803d", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" },
  detailValueMobile: { fontSize: "9px", justifyContent: "flex-end", textAlign: "right", minWidth: 0 },

  miniStat: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.7)", background: "rgba(255,255,255,0.5)", padding: "4px 8px", borderRadius: "6px" },
  miniStatMobile: { fontSize: "8.5px", gap: "3px", padding: "4px 5px", minWidth: 0, overflow: "hidden" },

  calendarBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
  },
  calendarBtnMobile: { gap: "3px", padding: "6px 5px", borderRadius: "8px", fontSize: "9px", marginTop: "6px", minHeight: "28px", whiteSpace: "nowrap" },
  emptyState: { width: "100%", padding: "60px 20px", background: "rgba(255,255,255,0.5)", borderRadius: "24px", border: "1px dashed rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.8 },
  emptyIcon: { fontSize: "48px", marginBottom: "16px", filter: "grayscale(1)" },
  emptyTitle: { fontSize: "18px", fontWeight: 700, color: "#000", margin: "0 0 8px" },
  emptyDesc: { fontSize: "14px", color: "rgba(0,0,0,0.6)", margin: 0, maxWidth: "400px" }
};
