import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MessageCircle, Heart, Send, Plus, Sprout, Bug, Droplet, Sun, TrendingUp, Users } from "lucide-react";

const CATEGORIES = [
  { name: "All", icon: <Users size={14} /> },
  { name: "Growing Tips", icon: <Sprout size={14} /> },
  { name: "Pest & Disease", icon: <Bug size={14} /> },
  { name: "Irrigation", icon: <Droplet size={14} /> },
  { name: "Weather", icon: <Sun size={14} /> },
  { name: "Market & Prices", icon: <TrendingUp size={14} /> },
];

// Seed posts used when no saved forum data exists. App.js owns the live posts
// state (persisted to localStorage) and shares it with the Admin Portal so
// admins can moderate posts/replies and publish official content.
export const forumSeedPosts = [
  {
    id: 1,
    author: "Mang Tonio",
    category: "Pest & Disease",
    title: "Yellow spots spreading on my tomato leaves — what is this?",
    body: "Noticed yellowing with brown spots on the lower leaves of my heirloom tomatoes in Benguet. It's been rainy all week. Should I remove the affected leaves?",
    likes: 12,
    likedByMe: false,
    time: "2 days ago",
    replies: [
      { author: "Aling Rosa", body: "Looks like early blight, common in wet weather. Remove affected leaves, avoid overhead watering, and space plants for airflow.", time: "1 day ago" },
      { author: "EcoEquity Agronomist", body: "Agree with Rosa. A copper-based organic fungicide can help if it spreads. Don't compost the infected leaves.", time: "22 hours ago" },
    ],
  },
  {
    id: 2,
    author: "Jenny Cruz",
    category: "Growing Tips",
    title: "Best companion plants for native adlai?",
    body: "Starting an adlai plot in Bukidnon and want to intercrop. Anyone tried legumes alongside it for soil nitrogen?",
    likes: 8,
    likedByMe: false,
    time: "4 days ago",
    replies: [
      { author: "Farmer Ben", body: "Mung beans worked great for me — fixes nitrogen and you get an extra harvest.", time: "3 days ago" },
    ],
  },
  {
    id: 3,
    author: "Aling Rosa",
    category: "Market & Prices",
    title: "Tomato prices climbing in Metro Manila markets",
    body: "Seeing ₱150/kg this week, up from ₱120. Good time to harvest if your crop is ready. What are you seeing in your area?",
    likes: 19,
    likedByMe: false,
    time: "5 days ago",
    replies: [],
  },
];

function CommunityForumPage({ setActiveNav, loggedInUser, posts = forumSeedPosts, setPosts = () => {} }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", category: "Growing Tips" });
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");

  const composeRef = useRef(null);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const authorName = loggedInUser && loggedInUser.trim() ? loggedInUser : "Guest Farmer";

  // Grow the details textarea to fit its content.
  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // When the composer opens, reveal it and focus the title field.
  useEffect(() => {
    if (!showCompose) return;
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    titleRef.current?.focus();
    autoGrow(bodyRef.current);
  }, [showCompose]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pinned/official posts (curated by admins) always float to the top of the feed.
  const visiblePosts = posts
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .slice()
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handlePost = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    const newPost = {
      id: Date.now(),
      author: authorName,
      category: draft.category,
      title: draft.title.trim(),
      body: draft.body.trim(),
      likes: 0,
      likedByMe: false,
      time: "Just now",
      replies: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft({ title: "", body: "", category: "Growing Tips" });
    setShowCompose(false);
  };

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p
      )
    );
  };

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, replies: [...p.replies, { author: authorName, body: replyText.trim(), time: "Just now" }] }
          : p
      )
    );
    setReplyText("");
    setReplyOpen(null);
  };

  const catIcon = (name) => (CATEGORIES.find((c) => c.name === name) || {}).icon || <MessageCircle size={14} />;

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          @keyframes forumTextShimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes forumFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .forum-reveal {
            opacity: 0;
            animation: forumFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.15s forwards;
          }
          .forum-accent {
            background: linear-gradient(90deg, #15803d, #16a34a, #0284c7, #16a34a, #15803d);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: forumTextShimmer 4s linear infinite;
          }
        `}
      </style>
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
          <span style={styles.glassContentLayer}>Farmer Community</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Grow <span className="forum-accent">Together</span>
      </h1>
      <div style={styles.titleUnderline} />
      <p className="forum-reveal" style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Ask questions, share what's working in your fields, and learn from farmers across the Philippines. Posting as <strong>{authorName}</strong>.
      </p>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setActiveCategory(c.name)}
              style={{ ...styles.catChip, ...(activeCategory === c.name ? styles.catChipActive : {}) }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        <button type="button" style={styles.newPostBtn} onClick={() => setShowCompose((s) => !s)}>
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div ref={composeRef} className="inner-blur-glass" style={styles.composeCard}>
          <input
            ref={titleRef}
            style={styles.input}
            placeholder="Title — what do you want to ask or share?"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <textarea
            ref={bodyRef}
            style={{ ...styles.input, minHeight: "90px", resize: "none", overflow: "hidden", fontFamily: "inherit" }}
            placeholder="Add details so others can help…"
            value={draft.body}
            onChange={(e) => { setDraft({ ...draft, body: e.target.value }); autoGrow(e.target); }}
          />
          <div style={styles.composeFooter}>
            <select style={styles.select} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {CATEGORIES.filter((c) => c.name !== "All").map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button type="button" style={styles.postBtn} onClick={handlePost}>Post to Community</button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div style={styles.feed}>
        {visiblePosts.length === 0 && <p style={styles.emptyText}>No posts in this category yet. Be the first to start a discussion!</p>}
        {visiblePosts.map((post) => (
          <div key={post.id} className="inner-blur-glass" style={{ ...styles.postCard, ...(post.official ? styles.postCardOfficial : {}) }}>
            {post.pinned && <span style={styles.pinnedBadge}>📌 Pinned by EcoEquity</span>}
            <div style={styles.postHead}>
              <div style={{ ...styles.avatar, ...(post.official ? styles.avatarOfficial : {}) }}>{(post.author || "?").charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={styles.postAuthor}>
                  {post.author}
                  {post.official && <span style={styles.officialBadge}>OFFICIAL</span>}
                </span>
                <span style={styles.postTime}>{post.time}</span>
              </div>
              <span style={styles.catTag}>{catIcon(post.category)} {post.category}</span>
            </div>
            <h3 style={styles.postTitle}>{post.title}</h3>
            <p style={styles.postBody}>{post.body}</p>

            <div style={styles.postActions}>
              <button type="button" style={{ ...styles.actionBtn, ...(post.likedByMe ? styles.actionBtnActive : {}) }} onClick={() => toggleLike(post.id)}>
                <Heart size={15} fill={post.likedByMe ? "#e11d48" : "none"} color={post.likedByMe ? "#e11d48" : "currentColor"} /> {post.likes}
              </button>
              <button type="button" style={styles.actionBtn} onClick={() => { setReplyOpen(replyOpen === post.id ? null : post.id); setReplyText(""); }}>
                <MessageCircle size={15} /> {(post.replies || []).length} {(post.replies || []).length === 1 ? "reply" : "replies"}
              </button>
            </div>

            {(post.replies || []).length > 0 && (
              <div style={styles.replyList}>
                {(post.replies || []).map((r, i) => (
                  <div key={i} style={styles.replyItem}>
                    <div style={styles.replyAvatar}>{(r.author || "?").charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <span style={styles.replyAuthor}>{r.author} <span style={styles.replyTime}>· {r.time}</span></span>
                      <p style={styles.replyBody}>{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {replyOpen === post.id && (
              <div style={styles.replyComposer}>
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Write a reply…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleReply(post.id); }}
                  autoFocus
                />
                <button type="button" style={styles.replySendBtn} onClick={() => handleReply(post.id)}>
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 16px 40px", maxWidth: "820px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', sans-serif", overflowY: "auto", height: "100%", boxSizing: "border-box" },
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
  body: { color: "rgba(0,0,0,0.75)", marginBottom: "20px", maxWidth: "560px", fontSize: "15px", lineHeight: 1.55 },
  bodyMobile: { fontSize: "13.5px" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "10px", flexWrap: "wrap", marginBottom: "18px" },
  catRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-start" },
  catChip: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", color: "#334155", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  catChipActive: { background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", borderColor: "transparent", boxShadow: "0 6px 16px rgba(22,163,74,0.3)" },
  newPostBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.4)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(34,197,94,0.2)", whiteSpace: "nowrap" },
  composeCard: { width: "100%", borderRadius: "18px", padding: "16px", marginBottom: "18px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", boxSizing: "border-box" },
  input: { width: "100%", padding: "11px 13px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", fontSize: "14px", color: "#0f172a", marginBottom: "10px", boxSizing: "border-box", outline: "none" },
  composeFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" },
  select: { padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 600, color: "#334155", cursor: "pointer" },
  postBtn: { padding: "9px 18px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(22,163,74,0.25)" },
  feed: { display: "flex", flexDirection: "column", gap: "16px", width: "100%" },
  emptyText: { fontSize: "14px", color: "rgba(0,0,0,0.55)", padding: "20px" },
  postCard: { borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", textAlign: "left", boxSizing: "border-box" },
  postCardOfficial: { border: "1px solid rgba(22,163,74,0.45)", background: "linear-gradient(180deg, rgba(220,252,231,0.65), rgba(255,255,255,0.6))", boxShadow: "0 10px 28px rgba(22,163,74,0.12)" },
  pinnedBadge: { display: "inline-block", fontSize: "10.5px", fontWeight: 800, color: "#15803d", letterSpacing: "0.4px", marginBottom: "8px" },
  postHead: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 },
  avatarOfficial: { background: "linear-gradient(135deg, #0ea5e9, #15803d)" },
  officialBadge: { marginLeft: "7px", fontSize: "9.5px", fontWeight: 800, color: "#fff", background: "#16a34a", padding: "2px 7px", borderRadius: "999px", letterSpacing: "0.5px", verticalAlign: "middle" },
  postAuthor: { display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a" },
  postTime: { display: "block", fontSize: "11.5px", color: "rgba(0,0,0,0.45)" },
  catTag: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "5px 10px", borderRadius: "999px", whiteSpace: "nowrap" },
  postTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  postBody: { fontSize: "14px", color: "rgba(0,0,0,0.7)", lineHeight: 1.55, margin: "0 0 12px" },
  postActions: { display: "flex", gap: "10px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  actionBtnActive: { color: "#e11d48", background: "rgba(225,29,72,0.08)", borderColor: "rgba(225,29,72,0.2)" },
  replyList: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px", paddingLeft: "8px", borderLeft: "2px solid rgba(22,163,74,0.15)" },
  replyItem: { display: "flex", gap: "10px", paddingLeft: "8px" },
  replyAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(22,163,74,0.15)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  replyAuthor: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  replyTime: { fontSize: "11px", fontWeight: 500, color: "rgba(0,0,0,0.4)" },
  replyBody: { fontSize: "13.5px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5, margin: "2px 0 0" },
  replyComposer: { display: "flex", gap: "8px", alignItems: "center", marginTop: "14px" },
  replySendBtn: { width: "40px", height: "40px", flexShrink: 0, borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(22,163,74,0.25)" },
};

export default CommunityForumPage;
