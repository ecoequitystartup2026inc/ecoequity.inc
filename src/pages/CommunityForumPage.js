import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { FaArrowLeft } from "react-icons/fa";
import Reveal, { RevealStyles } from "../components/Reveal";
import ComingSoonBanner from "../components/ComingSoonBanner";
import { MODAL_LAYER } from "../styles/modal";
import {
  MessageCircle, Heart, Send, Plus, Sprout, Bug, Droplet, Sun, TrendingUp, Users,
  Search, Bookmark, CheckCircle2, HelpCircle, Award, Flame, ShieldCheck, X,
  Calendar, Headphones, ArrowUpRight, MessagesSquare, Lock, Flag,
  MoreHorizontal, Pencil, Trash2,
} from "lucide-react";

const CATEGORIES = [
  { name: "All", icon: <Users size={14} /> },
  { name: "Growing Tips", icon: <Sprout size={14} /> },
  { name: "Pest & Disease", icon: <Bug size={14} /> },
  { name: "Irrigation", icon: <Droplet size={14} /> },
  { name: "Weather", icon: <Sun size={14} /> },
  { name: "Market & Prices", icon: <TrendingUp size={14} /> },
];

const SORTS = [
  { key: "latest", label: "Latest" },
  { key: "top", label: "Most liked" },
  { key: "active", label: "Most replies" },
  { key: "unanswered", label: "Unanswered" },
];

const GUIDELINES = [
  "Say where you farm — advice changes with soil and season.",
  "Photos help. Describe what you already tried.",
  "Prefer organic, low-cost fixes before chemicals.",
  "Be kind. Everyone here started with one plot.",
];

// Bookmarks are a per-device preference, so they live outside the shared post
// records that App.js persists and syncs to Supabase.
const BOOKMARKS_KEY = "ecoequity_forum_bookmarks";

// Moderators can hide a post or a single reply as spam. Hidden content leaves
// the public feed entirely — including every count derived from it — but stays
// in the Admin Portal, where hiding can be undone.
const visibleReplies = (p) => (p.replies || []).filter((r) => !r.hidden);
const replyCount = (p) => visibleReplies(p).length;
const isAnswered = (p) => replyCount(p) > 0;

const REPORT_REASONS = ["Spam or scam", "Harmful or abusive", "Misleading advice", "Off-topic"];

/* ── The ⋯ menu ───────────────────────────────────────────────────────────
   A small card pinned under the button that opened it, not a bar stretched
   across the post.

   It has to be portalled to <body> to manage that. The post card is
   `.inner-blur-glass`, which sets BOTH `overflow: hidden` (clips an absolute
   menu) and a `transform` (which makes even `position: fixed` resolve against
   the card, not the viewport). There is no positioning trick out of that box
   from inside — leaving the subtree is the whole fix.

   `anchor` is the trigger element itself, which gives us the rect to pin to
   and the node to exclude from the click-away test in one reference. */
const MENU_WIDTH = 194;
const MENU_ITEM_H = 40;

/* Where the card sits: right edge aligned to the ⋯ button, pulled back onto
   the screen near an edge, flipped above the button when there is no room
   below. Returns null once the button has scrolled out of sight, which is the
   signal to close — a menu pinned to something you can no longer see is just
   a card floating over unrelated posts. */
function placeMenu(anchor, itemCount) {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
  const height = itemCount * MENU_ITEM_H + 12;
  return {
    top: rect.bottom + 8 + height > window.innerHeight
      ? Math.max(12, rect.top - height - 8)
      : rect.bottom + 8,
    left: Math.min(
      Math.max(12, rect.right - MENU_WIDTH),
      Math.max(12, window.innerWidth - MENU_WIDTH - 12)
    ),
  };
}

function PostMenu({ anchor, itemCount, label, onClose, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(() => placeMenu(anchor, itemCount));

  useEffect(() => {
    // Clicking the trigger again must close the menu, not close-then-reopen —
    // so the trigger counts as "inside" for the purposes of clicking away.
    const away = (e) => {
      if (ref.current?.contains(e.target) || anchor?.contains(e.target)) return;
      onClose();
    };
    const key = (e) => { if (e.key === "Escape") onClose(); };

    // The feed scrolls inside its own container, so the menu has to follow its
    // button rather than sit at the coordinates it opened on. Following beats
    // closing on scroll: a tap that lands while the page is still gliding to a
    // stop would otherwise close the menu the moment it opened. Throttled to a
    // frame, because this page is already carrying a stack of glass layers.
    let frame = null;
    const follow = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const next = placeMenu(anchor, itemCount);
        if (next) setPos(next);
        else onClose();
      });
    };

    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    // Capture: scroll on an inner element does not bubble to window.
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [anchor, itemCount, onClose]);

  if (!pos) return null;

  return ReactDOM.createPortal(
    <div ref={ref} role="menu" aria-label={label} style={{ ...styles.menuPop, ...pos }}>
      {children}
    </div>,
    document.body
  );
}

const readBookmarks = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

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
  {
    id: 4,
    author: "Dado Villamor",
    category: "Irrigation",
    title: "Drip lines keep clogging with our well water",
    body: "We're on hard well water in Nueva Ecija and the emitters block up every few weeks. Is a mesh filter enough or do I need to flush with something?",
    likes: 6,
    likedByMe: false,
    time: "6 days ago",
    replies: [
      { author: "EcoEquity Agronomist", body: "A 120-mesh screen filter at the header solves most of it. Once a month, flush the lines open-ended for two minutes to push out sediment.", time: "5 days ago" },
    ],
  },
  {
    id: 5,
    author: "Liza Mendoza",
    category: "Weather",
    title: "How early do you harvest ahead of a typhoon signal?",
    body: "Signal No. 2 forecast for our area this weekend. Our pechay is about four days from ideal size — do we pull it early or stake and cover?",
    likes: 14,
    likedByMe: false,
    time: "1 week ago",
    replies: [],
  },
];

// onEditPost/onDeletePost come from App.js, which owns the Supabase writes —
// the row sync there only ever INSERTS, so an edit or a delete that never
// reaches the database would be undone by the next fetch. Without them the page
// still works, it just edits the local state it was handed.
function CommunityForumPage({
  setActiveNav, loggedInUser, posts = forumSeedPosts, setPosts = () => {},
  onEditPost = null, onDeletePost = null,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 1080);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [savedOnly, setSavedOnly] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", category: "Growing Tips" });
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState([]);
  const [reportOpen, setReportOpen] = useState(null);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  // Controls behind the ⋯ button — edit/delete on your own posts, report on
  // everyone else's: which post's menu is open, which post is being edited, and
  // which one is asking to be confirmed for deletion.
  const [menuOpen, setMenuOpen] = useState(null);
  // The ⋯ button the open menu is pinned to. Held as the DOM node, not a rect:
  // a stale rect would place the menu wherever the page used to be.
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", body: "", category: "Growing Tips" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  // Sidebar CTAs point at services that aren't live yet, so instead of
  // navigating they raise the shared Coming Soon card and keep you in the
  // forum. Holds { title, message }; null means no banner.
  const [comingSoon, setComingSoon] = useState(null);

  const composeRef = useRef(null);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const searchRef = useRef(null);

  const authorName = loggedInUser && loggedInUser.trim() ? loggedInUser : "Guest Farmer";

  // Grow the details textarea to fit its content, up to a cap — past that it
  // scrolls instead of pushing the Post button off-screen.
  const autoGrow = (el) => {
    if (!el) return;
    const MAX = 260;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX)}px`;
    el.style.overflowY = el.scrollHeight > MAX ? "auto" : "hidden";
  };

  // When the composer opens, reveal it and focus the title field.
  useEffect(() => {
    if (!showCompose) return;
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    titleRef.current?.focus();
    autoGrow(bodyRef.current);
  }, [showCompose]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsNarrow(window.innerWidth < 1080);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Everything the page shows or counts runs off livePosts — posts a moderator
  // hid never reach the feed, the stats, the leaderboard or the search index.
  const livePosts = useMemo(() => posts.filter((p) => !p.hidden), [posts]);

  // Category counts drive the chip badges, so they ignore the category filter
  // but still respect the search box.
  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return livePosts;
    return livePosts.filter((p) =>
      [p.title, p.body, p.author, p.category, ...visibleReplies(p).map((r) => r.body)]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(q))
    );
  }, [livePosts, query]);

  const categoryCounts = useMemo(() => {
    const counts = { All: searchMatches.length };
    CATEGORIES.forEach((c) => { if (c.name !== "All") counts[c.name] = 0; });
    searchMatches.forEach((p) => {
      if (counts[p.category] !== undefined) counts[p.category] += 1;
    });
    return counts;
  }, [searchMatches]);

  // Pinned/official posts (curated by admins) always float to the top of the feed.
  const visiblePosts = useMemo(() => {
    let list = searchMatches.filter((p) => activeCategory === "All" || p.category === activeCategory);
    if (savedOnly) list = list.filter((p) => bookmarks.includes(p.id));
    if (sort === "unanswered") list = list.filter((p) => !isAnswered(p));

    const order = new Map(livePosts.map((p, i) => [p.id, i]));
    const rank = (p) => {
      if (sort === "top") return -(p.likes || 0);
      if (sort === "active") return -replyCount(p);
      return order.get(p.id) ?? 0;
    };

    return list
      .slice()
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || rank(a) - rank(b));
  }, [searchMatches, livePosts, activeCategory, savedOnly, bookmarks, sort]);

  const stats = useMemo(() => {
    const people = new Set();
    let replies = 0;
    livePosts.forEach((p) => {
      people.add(p.author);
      visibleReplies(p).forEach((r) => { people.add(r.author); replies += 1; });
    });
    const answered = livePosts.filter(isAnswered).length;
    return {
      discussions: livePosts.length,
      replies,
      growers: people.size,
      answeredPct: livePosts.length ? Math.round((answered / livePosts.length) * 100) : 0,
    };
  }, [livePosts]);

  // Contributors are ranked on posts + replies — the same signal the feed
  // already shows, so nothing here needs its own persisted score.
  const topContributors = useMemo(() => {
    const tally = new Map();
    const bump = (name, key) => {
      if (!name) return;
      const entry = tally.get(name) || { name, posts: 0, replies: 0 };
      entry[key] += 1;
      tally.set(name, entry);
    };
    livePosts.forEach((p) => {
      bump(p.author, "posts");
      visibleReplies(p).forEach((r) => bump(r.author, "replies"));
    });
    return [...tally.values()]
      .map((e) => ({ ...e, score: e.posts * 3 + e.replies * 2 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [livePosts]);

  const trending = useMemo(() => {
    const rows = CATEGORIES.filter((c) => c.name !== "All").map((c) => {
      const inCat = livePosts.filter((p) => p.category === c.name);
      return {
        name: c.name,
        icon: c.icon,
        count: inCat.length,
        engagement: inCat.reduce((s, p) => s + (p.likes || 0) + replyCount(p), 0),
      };
    });
    const max = Math.max(1, ...rows.map((r) => r.engagement));
    return rows
      .filter((r) => r.count > 0)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 4)
      .map((r) => ({ ...r, pct: Math.round((r.engagement / max) * 100) }));
  }, [livePosts]);

  const myStats = useMemo(() => {
    const mine = livePosts.filter((p) => p.author === authorName);
    const myReplies = livePosts.reduce(
      (s, p) => s + visibleReplies(p).filter((r) => r.author === authorName).length,
      0
    );
    return {
      posts: mine.length,
      replies: myReplies,
      likes: mine.reduce((s, p) => s + (p.likes || 0), 0),
    };
  }, [livePosts, authorName]);

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
    setActiveCategory("All");
    setQuery("");
    setSavedOnly(false);
    setSort("latest");
  };

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p
      )
    );
  };

  // Own-post editing. The author's name is the only identity this page has, so
  // it is also the ownership test — the same signal "Your activity" counts on.
  const ownsPost = (post) => post.author === authorName;

  const closeMenu = () => { setMenuOpen(null); setMenuAnchor(null); };

  const openMenu = (id, el) => {
    const closing = menuOpen === id;
    setMenuOpen(closing ? null : id);
    setMenuAnchor(closing ? null : el);
    setConfirmDelete(null);
    setReportOpen(null);
  };

  const startEdit = (post) => {
    setEditing(post.id);
    setEditDraft({
      title: post.title || "",
      body: post.body || "",
      category: post.category || "Growing Tips",
    });
    closeMenu();
    setConfirmDelete(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditDraft({ title: "", body: "", category: "Growing Tips" });
  };

  const saveEdit = (id) => {
    const title = editDraft.title.trim();
    const body = editDraft.body.trim();
    if (!title || !body) return;
    const patch = { title, body, category: editDraft.category, edited: true };
    if (onEditPost) onEditPost(id, patch);
    else setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    cancelEdit();
  };

  // Deleting takes the post's per-device leftovers with it, so a bookmark or an
  // open reply box can't point at a post that no longer exists.
  const removePost = (id) => {
    if (onDeletePost) onDeletePost(id);
    else setPosts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    closeMenu();
    if (editing === id) cancelEdit();
    if (replyOpen === id) setReplyOpen(null);
    setBookmarks((prev) => prev.filter((b) => b !== id));
    setExpandedReplies((prev) => prev.filter((x) => x !== id));
  };

  const toggleBookmark = (id) =>
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));

  const toggleReplies = (id) =>
    setExpandedReplies((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    // A moderator can lock a thread between the composer opening and this
    // firing, so the closed check belongs here too, not just in the markup.
    if (posts.find((p) => p.id === id)?.locked) {
      setReplyOpen(null);
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, replies: [...p.replies, { author: authorName, body: replyText.trim(), time: "Just now" }] }
          : p
      )
    );
    setReplyText("");
    setReplyOpen(null);
    setExpandedReplies((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  // Reports ride on the post record so the Admin Portal's moderation queue
  // picks them up. One report per person per item.
  const alreadyReported = (item) => (item?.reports || []).some((r) => r.by === authorName);

  const reportPost = (id, reason) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id && !alreadyReported(p)
          ? { ...p, reports: [...(p.reports || []), { by: authorName, reason, time: "Just now" }], reviewed: false }
          : p
      )
    );
    setReportOpen(null);
  };

  const reportReply = (postId, idx, reason) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: (p.replies || []).map((r, i) =>
                i === idx && !alreadyReported(r)
                  ? { ...r, reports: [...(r.reports || []), { by: authorName, reason, time: "Just now" }], reviewed: false }
                  : r
              ),
            }
          : p
      )
    );
    setReportOpen(null);
  };

  const catIcon = (name) => (CATEGORIES.find((c) => c.name === name) || {}).icon || <MessageCircle size={14} />;

  const clearFilters = () => {
    setQuery("");
    setActiveCategory("All");
    setSavedOnly(false);
    setSort("latest");
  };

  const filtersActive = Boolean(query.trim()) || activeCategory !== "All" || savedOnly || sort !== "latest";

  const statTiles = [
    { label: "Discussions", value: stats.discussions, icon: <MessagesSquare size={15} /> },
    { label: "Replies", value: stats.replies, icon: <MessageCircle size={15} /> },
    { label: "Growers", value: stats.growers, icon: <Users size={15} /> },
    { label: "Answered", value: `${stats.answeredPct}%`, icon: <CheckCircle2 size={15} /> },
  ];

  const renderSidebar = () => (
    <aside style={{ ...styles.sidebar, ...(isNarrow ? styles.sidebarStacked : {}) }}>
      <Reveal variant="up" delay={80} style={styles.panel}>
        <div style={styles.panelHead}>
          <Award size={15} color="var(--eco-c11)" />
          <h3 style={styles.panelTitle}>Top contributors</h3>
        </div>
        {topContributors.length === 0 && <p style={styles.panelEmpty}>No activity yet.</p>}
        {topContributors.map((c, i) => (
          <div key={c.name} style={styles.contribRow}>
            <span style={{ ...styles.contribRank, ...(i === 0 ? styles.contribRankTop : {}) }}>{i + 1}</span>
            <div style={styles.replyAvatar}>{(c.name || "?").charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={styles.contribName}>{c.name}</span>
              <span style={styles.contribMeta}>
                {c.posts} {c.posts === 1 ? "post" : "posts"} · {c.replies} {c.replies === 1 ? "reply" : "replies"}
              </span>
            </div>
          </div>
        ))}
      </Reveal>

      {trending.length > 0 && (
        <Reveal variant="up" delay={140} style={styles.panel}>
          <div style={styles.panelHead}>
            <Flame size={15} color="var(--eco-c11)" />
            <h3 style={styles.panelTitle}>Trending topics</h3>
          </div>
          {trending.map((t) => (
            <button
              key={t.name}
              type="button"
              className="cf-trend"
              style={styles.trendRow}
              onClick={() => { setActiveCategory(t.name); setSavedOnly(false); }}
            >
              <span style={styles.trendLabel}>{t.icon} {t.name}</span>
              <span style={styles.trendCount}>{t.count}</span>
              <span style={styles.trendTrack}>
                <span style={{ ...styles.trendFill, width: `${Math.max(8, t.pct)}%` }} />
              </span>
            </button>
          ))}
        </Reveal>
      )}

      <Reveal variant="up" delay={200} style={styles.panel}>
        <div style={styles.panelHead}>
          <ShieldCheck size={15} color="var(--eco-c11)" />
          <h3 style={styles.panelTitle}>How we post here</h3>
        </div>
        <ul style={styles.guideList}>
          {GUIDELINES.map((g) => (
            <li key={g} style={styles.guideItem}>
              <span style={styles.guideDot} />
              {g}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal variant="up" delay={250} style={{ ...styles.panel, ...styles.panelCta }}>
        <h3 style={{ ...styles.panelTitle, marginBottom: "6px" }}>Need more than a reply?</h3>
        <p style={styles.ctaText}>Book a one-on-one agronomist or join a hands-on workshop near you.</p>
        <button
          type="button"
          className="cf-cta-btn"
          style={styles.ctaBtn}
          onClick={() => setComingSoon({
            title: "Expert Support",
            message: "One-on-one agronomist bookings aren't open just yet. In the meantime, post your question here — the community answers fast.",
          })}
        >
          <Headphones size={14} /> Talk to an expert <ArrowUpRight size={13} />
        </button>
        <button
          type="button"
          className="cf-cta-btn"
          style={styles.ctaBtnGhost}
          onClick={() => setComingSoon({
            title: "Events & Workshops",
            message: "Hands-on workshop listings are still being scheduled. We'll open sign-ups here as soon as the first sessions are set.",
          })}
        >
          <Calendar size={14} /> Browse workshops
        </button>
      </Reveal>
    </aside>
  );

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      {comingSoon && (
        <ComingSoonBanner
          title={`${comingSoon.title} — Coming Soon`}
          message={comingSoon.message}
          closeLabel="Close announcement"
          // Mounted on demand, so every exit has to clear the flag — otherwise
          // the card can't be reopened from the same visit.
          onDismiss={() => setComingSoon(null)}
        />
      )}
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
          .forum-field {
            text-align: left;
            line-height: 1.5;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          }
          .forum-field::placeholder {
            color: rgba(15,23,42,0.42);
            opacity: 1;
          }
          .forum-field:focus {
            border-color: rgba(var(--eco-c9-rgb), 0.55);
            background: #fff;
            box-shadow: 0 0 0 3px rgba(var(--eco-c9-rgb), 0.14);
          }
          .forum-accent {
            background: linear-gradient(90deg, var(--eco-c11), var(--eco-c9), var(--eco-c9), var(--eco-c9), var(--eco-c11));
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: forumTextShimmer 4s linear infinite;
          }
          @keyframes cfDotPulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%      { transform: scale(1.5); opacity: 0.55; }
          }
          .cf-dot { animation: cfDotPulse 2.4s ease-in-out infinite; }
          .cf-hero img { transition: transform .8s cubic-bezier(.22,1,.36,1); }
          .cf-hero:hover img { transform: scale(1.04); }

          /* Cards lift on hover; .inner-blur-glass owns transform on the post
             cards, so the lift rides on box-shadow + border there. */
          .cf-card { transition: box-shadow .25s ease, border-color .25s ease; }
          .cf-card:hover {
            box-shadow: 0 14px 34px rgba(0,0,0,0.10);
            border-color: rgba(var(--eco-c9-rgb), 0.30);
          }
          .cf-chip { transition: transform .18s ease, background .2s ease, color .2s ease, border-color .2s ease; }
          .cf-chip:hover { transform: translateY(-1px); border-color: rgba(var(--eco-c9-rgb), 0.45); }
          .cf-icon-btn { transition: transform .18s ease, background .2s ease, color .2s ease; }
          .cf-icon-btn:hover { transform: translateY(-1px); background: rgba(var(--eco-c9-rgb), 0.10); }
          /* The ⋯ menu is portalled to <body>, so these live here as plain
             global rules rather than anything scoped to the page subtree. */
          .cf-menu-item { transition: background .16s ease; }
          .cf-menu-item:hover:not(:disabled) { background: rgba(var(--eco-c9-rgb), 0.10); }
          .cf-menu-item:disabled:hover { background: transparent; }
          .cf-trend { transition: background .2s ease; }
          .cf-trend:hover { background: rgba(var(--eco-c9-rgb), 0.08); }
          .cf-cta-btn { transition: transform .18s ease, box-shadow .2s ease; }
          .cf-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(var(--eco-c9-rgb), 0.28); }
          .cf-ask:hover { border-color: rgba(var(--eco-c9-rgb), 0.45); background: #fff; }
          .cf-link { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: var(--eco-c13); font-weight: 700; }
          .cf-link:hover { text-decoration: underline; }

          @media (prefers-reduced-motion: reduce) {
            .cf-dot { animation: none; }
            .forum-reveal { opacity: 1; animation: none; }
            .cf-hero img, .cf-hero:hover img { transition: none; transform: none; }
            .cf-card, .cf-chip, .cf-icon-btn, .cf-cta-btn { transition: none; }
            .cf-chip:hover, .cf-icon-btn:hover, .cf-cta-btn:hover { transform: none; }
          }
        `}
      </style>
      <RevealStyles />
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
          <span className="cf-dot" style={styles.badgeDot} />
          <span style={styles.glassContentLayer}>Farmer Community</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Grow <span className="forum-accent">Together</span>
      </h1>
      <p className="forum-reveal" style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Ask questions, share what's working in your fields, and learn from farmers across the Philippines. Posting as <strong>{authorName}</strong>.
      </p>

      <Reveal variant="scale" delay={160} className="cf-hero" style={{ ...styles.hero, ...(isMobile ? styles.heroMobile : {}) }}>
        <img
          src="/about-hero-harvest.webp"
          alt="Farmers working together over a shared harvest"
          loading="lazy"
          decoding="async"
          style={styles.heroImg}
        />
        <span aria-hidden="true" style={styles.heroScrim} />
        <div style={{ ...styles.heroOverlay, ...(isMobile ? styles.heroOverlayMobile : {}) }}>
          <span style={styles.heroCaption}>
            Growers helping growers — advice traded across the Philippines
          </span>
          {!isMobile && (
            <div style={styles.heroStats}>
              {statTiles.map((s) => (
                <div key={s.label} style={styles.heroStat}>
                  <span style={styles.heroStatValue}>{s.value}</span>
                  <span style={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {isMobile && (
        <div style={styles.statStripMobile}>
          {statTiles.map((s) => (
            <div key={s.label} style={styles.statTile}>
              <span style={styles.statIcon}>{s.icon}</span>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search, sort and categories ride in one sticky block so filters stay
          reachable in a long feed and nothing scrolls through the gap above it. */}
      <div style={{ ...styles.filterBar, ...(isMobile ? styles.filterBarMobile : {}) }}>
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={15} color="rgba(15,23,42,0.42)" style={styles.searchIcon} />
          <input
            ref={searchRef}
            className="forum-field"
            style={styles.searchInput}
            placeholder="Search discussions, crops, or growers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search discussions"
          />
          {query && (
            <button type="button" style={styles.searchClear} onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
        <div style={styles.toolbarActions}>
          <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort discussions">
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button
            type="button"
            className="cf-chip"
            style={{ ...styles.savedBtn, ...(savedOnly ? styles.savedBtnActive : {}) }}
            onClick={() => setSavedOnly((s) => !s)}
            aria-pressed={savedOnly}
          >
            <Bookmark size={14} fill={savedOnly ? "currentColor" : "none"} />
            {isMobile ? "" : " Saved"} {bookmarks.length > 0 ? `(${bookmarks.length})` : ""}
          </button>
          <button type="button" className="cf-cta-btn" style={styles.newPostBtn} onClick={() => setShowCompose((s) => !s)}>
            <Plus size={15} /> New Post
          </button>
        </div>
      </div>

      <div style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            type="button"
            className="cf-chip"
            onClick={() => setActiveCategory(c.name)}
            style={{ ...styles.catChip, ...(activeCategory === c.name ? styles.catChipActive : {}) }}
          >
            {c.icon} {c.name}
            <span style={{ ...styles.catChipCount, ...(activeCategory === c.name ? styles.catChipCountActive : {}) }}>
              {categoryCounts[c.name] ?? 0}
            </span>
          </button>
        ))}
      </div>
      </div>

      <div style={{ ...styles.columns, ...(isNarrow ? styles.columnsStacked : {}) }}>
        <div style={styles.main}>
          {/* Compose */}
          {showCompose ? (
            <div ref={composeRef} className="inner-blur-glass" style={styles.composeCard}>
              <div style={styles.composeHead}>
                <div style={styles.avatar}>{authorName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={styles.postAuthor}>{authorName}</span>
                  <span style={styles.postTime}>Your question reaches every grower on EcoEquity</span>
                </div>
                <button type="button" style={styles.composeClose} onClick={() => setShowCompose(false)} aria-label="Close composer">
                  <X size={16} />
                </button>
              </div>
              <input
                ref={titleRef}
                className="forum-field"
                style={styles.input}
                placeholder="Title — what do you want to ask or share?"
                maxLength={120}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); bodyRef.current?.focus(); } }}
              />
              <textarea
                ref={bodyRef}
                className="forum-field"
                rows={4}
                style={styles.textarea}
                placeholder="Add details so others can help — where you farm, what you've tried, how long it's been happening…"
                value={draft.body}
                onChange={(e) => { setDraft({ ...draft, body: e.target.value }); autoGrow(e.target); }}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
              />
              <div style={styles.composePills}>
                {CATEGORIES.filter((c) => c.name !== "All").map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className="cf-chip"
                    style={{ ...styles.composePill, ...(draft.category === c.name ? styles.composePillActive : {}) }}
                    onClick={() => setDraft({ ...draft, category: c.name })}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
              <div style={styles.composeFooter}>
                <span style={styles.composeHint}>
                  {draft.body.length}/1200 · ⌘/Ctrl + Enter to post
                </span>
                <button
                  type="button"
                  className="cf-cta-btn"
                  style={{ ...styles.postBtn, ...(draft.title.trim() && draft.body.trim() ? {} : styles.postBtnDisabled) }}
                  onClick={handlePost}
                  disabled={!draft.title.trim() || !draft.body.trim()}
                >
                  Post to Community
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="cf-ask" style={styles.askBar} onClick={() => setShowCompose(true)}>
              <span style={styles.avatarSm}>{authorName.charAt(0).toUpperCase()}</span>
              <span style={styles.askText}>Ask the community a question…</span>
              <span style={styles.askPlus}><Plus size={15} /></span>
            </button>
          )}

          {filtersActive && (
            <div style={styles.resultRow}>
              <span>
                {visiblePosts.length} {visiblePosts.length === 1 ? "discussion" : "discussions"}
                {query.trim() ? ` matching “${query.trim()}”` : ""}
              </span>
              <button type="button" className="cf-link" onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {/* Feed */}
          <div style={styles.feed}>
            {visiblePosts.length === 0 && (
              <div style={styles.emptyCard}>
                <div style={styles.emptyIcon}><MessagesSquare size={22} color="var(--eco-c11)" /></div>
                <h3 style={styles.emptyTitle}>Nothing here yet</h3>
                <p style={styles.emptyText}>
                  {savedOnly
                    ? "You haven't saved any discussions. Tap the bookmark on a post to keep it here."
                    : "No posts match these filters. Start the conversation and someone will pick it up."}
                </p>
                <button type="button" className="cf-cta-btn" style={styles.postBtn} onClick={() => { clearFilters(); setShowCompose(true); }}>
                  Start a discussion
                </button>
              </div>
            )}

            {visiblePosts.map((post, idx) => {
              // Keep each reply's index in the unfiltered array — reporting one
              // has to address the record a moderator sees, hidden ones included.
              const replies = (post.replies || [])
                .map((r, i) => ({ ...r, sourceIndex: i }))
                .filter((r) => !r.hidden);
              const expanded = expandedReplies.includes(post.id);
              const shownReplies = expanded ? replies : replies.slice(0, 2);
              const saved = bookmarks.includes(post.id);
              const reportedByMe = alreadyReported(post);
              const mine = ownsPost(post);
              const isEditing = editing === post.id;
              const canSaveEdit = Boolean(editDraft.title.trim() && editDraft.body.trim());
              return (
                <Reveal
                  key={post.id}
                  variant="up"
                  delay={Math.min(idx, 4) * 60}
                  className="inner-blur-glass cf-card"
                  style={{ ...styles.postCard, ...(post.official ? styles.postCardOfficial : {}) }}
                >
                  {post.pinned && <span style={styles.pinnedBadge}>📌 Pinned by EcoEquity</span>}
                  {post.locked && (
                    <span style={styles.lockedBadge}>
                      <Lock size={11} /> Closed by a moderator — no new replies
                    </span>
                  )}
                  <div style={styles.postHead}>
                    <div style={{ ...styles.avatar, ...(post.official ? styles.avatarOfficial : {}) }}>{(post.author || "?").charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={styles.postAuthor}>
                        {post.author}
                        {post.official && <span style={styles.officialBadge}>OFFICIAL</span>}
                      </span>
                      <span style={styles.postTime}>
                        {post.time}{post.edited ? " · edited" : ""}
                      </span>
                    </div>
                    <span style={styles.catTag}>{catIcon(post.category)} {post.category}</span>
                    <button
                      type="button"
                      className="cf-icon-btn"
                      style={{ ...styles.bookmarkBtn, ...(saved ? styles.bookmarkBtnActive : {}) }}
                      onClick={() => toggleBookmark(post.id)}
                      aria-pressed={saved}
                      aria-label={saved ? "Remove from saved" : "Save discussion"}
                      title={saved ? "Saved" : "Save for later"}
                    >
                      <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                    </button>
                    {/* Every post carries the ⋯ — what's behind it is what
                        changes: your own posts get edit/delete, everyone
                        else's gets report. */}
                    <button
                      type="button"
                      className="cf-icon-btn"
                      style={{ ...styles.bookmarkBtn, ...(menuOpen === post.id ? styles.bookmarkBtnActive : {}) }}
                      onClick={(e) => openMenu(post.id, e.currentTarget)}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen === post.id}
                      aria-label={mine ? "Options for your post" : `Options for ${post.author}'s post`}
                      title={mine ? "Edit or delete your post" : "Report this post"}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* No Cancel row: clicking away, Escape or scrolling all
                      close it, which is what a pinned menu is expected to do. */}
                  {menuOpen === post.id && (
                    <PostMenu
                      anchor={menuAnchor}
                      itemCount={mine ? 2 : 1}
                      label={mine ? "Options for your post" : `Options for ${post.author}'s post`}
                      onClose={closeMenu}
                    >
                      {mine ? (
                        <>
                          <button type="button" role="menuitem" className="cf-menu-item" style={styles.menuPopItem} onClick={() => startEdit(post)}>
                            <Pencil size={14} /> Edit post
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="cf-menu-item"
                            style={{ ...styles.menuPopItem, ...styles.menuPopDanger }}
                            onClick={() => { setConfirmDelete(post.id); closeMenu(); }}
                          >
                            <Trash2 size={14} /> Delete post
                          </button>
                        </>
                      ) : (
                        /* Reporting twice would just double-count the same
                           complaint, so a post you already flagged says so
                           rather than offering the reasons again. */
                        <button
                          type="button"
                          role="menuitem"
                          className="cf-menu-item"
                          style={{
                            ...styles.menuPopItem, ...styles.menuPopReport,
                            ...(reportedByMe ? styles.menuPopDone : {}),
                          }}
                          onClick={() => { setReportOpen(`post-${post.id}`); closeMenu(); }}
                          disabled={reportedByMe}
                          title={reportedByMe ? "You reported this — moderators are on it" : "Report this post"}
                        >
                          <Flag size={14} fill={reportedByMe ? "currentColor" : "none"} />
                          {reportedByMe ? "Already reported" : "Report post"}
                        </button>
                      )}
                    </PostMenu>
                  )}

                  {confirmDelete === post.id && (
                    <div style={styles.deletePanel}>
                      <span style={styles.deletePanelTitle}>Delete this discussion?</span>
                      <p style={styles.deleteText}>
                        It leaves the community for good, replies included. This can't be undone.
                      </p>
                      <div style={styles.reportOptions}>
                        <button type="button" className="cf-cta-btn" style={styles.deleteConfirmBtn} onClick={() => removePost(post.id)}>
                          <Trash2 size={13} /> Yes, delete it
                        </button>
                        <button type="button" className="cf-link" style={styles.reportCancel} onClick={() => setConfirmDelete(null)}>
                          Keep it
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div style={styles.editBox}>
                      <input
                        className="forum-field"
                        style={styles.input}
                        placeholder="Title — what do you want to ask or share?"
                        maxLength={120}
                        value={editDraft.title}
                        onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
                        aria-label="Edit title"
                        autoFocus
                      />
                      <textarea
                        className="forum-field"
                        rows={4}
                        style={styles.textarea}
                        ref={autoGrow}
                        placeholder="Add details so others can help…"
                        value={editDraft.body}
                        onChange={(e) => { setEditDraft({ ...editDraft, body: e.target.value }); autoGrow(e.target); }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelEdit();
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(post.id);
                        }}
                        aria-label="Edit details"
                      />
                      <div style={styles.composePills}>
                        {CATEGORIES.filter((c) => c.name !== "All").map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            className="cf-chip"
                            style={{ ...styles.composePill, ...(editDraft.category === c.name ? styles.composePillActive : {}) }}
                            onClick={() => setEditDraft({ ...editDraft, category: c.name })}
                          >
                            {c.icon} {c.name}
                          </button>
                        ))}
                      </div>
                      <div style={styles.composeFooter}>
                        <span style={styles.composeHint}>⌘/Ctrl + Enter to save · Esc to cancel</span>
                        <div style={styles.editActions}>
                          <button type="button" className="cf-link" style={styles.reportCancel} onClick={cancelEdit}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="cf-cta-btn"
                            style={{ ...styles.postBtn, ...(canSaveEdit ? {} : styles.postBtnDisabled) }}
                            onClick={() => saveEdit(post.id)}
                            disabled={!canSaveEdit}
                          >
                            Save changes
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 style={styles.postTitle}>{post.title}</h3>
                      <p style={styles.postBody}>{post.body}</p>
                    </>
                  )}

                  <div style={styles.postActions}>
                    <button type="button" className="cf-chip" style={{ ...styles.actionBtn, ...(post.likedByMe ? styles.actionBtnActive : {}) }} onClick={() => toggleLike(post.id)}>
                      <Heart size={15} fill={post.likedByMe ? "var(--eco-c9)" : "none"} color={post.likedByMe ? "var(--eco-c9)" : "currentColor"} /> {post.likes}
                    </button>
                    <button
                      type="button"
                      className="cf-chip"
                      style={{ ...styles.actionBtn, ...(post.locked ? styles.actionBtnDisabled : {}) }}
                      onClick={() => {
                        if (post.locked) { toggleReplies(post.id); return; }
                        setReplyOpen(replyOpen === post.id ? null : post.id);
                        setReplyText("");
                      }}
                    >
                      <MessageCircle size={15} /> {replies.length} {replies.length === 1 ? "reply" : "replies"}
                    </button>

                    {/* Reporting moved into the ⋯ menu — a moderation action
                        doesn't belong beside Like and Reply. A post you've
                        already flagged still says so here, so the state is
                        visible without opening the menu. */}
                    {!mine && reportedByMe && (
                      <span style={styles.reportedChip}>
                        <Flag size={13} fill="currentColor" /> Reported
                      </span>
                    )}

                    <span style={{ ...styles.statusChip, ...(isAnswered(post) ? styles.statusAnswered : styles.statusOpen) }}>
                      {isAnswered(post) ? <CheckCircle2 size={13} /> : <HelpCircle size={13} />}
                      {isAnswered(post) ? "Answered" : "Needs an answer"}
                    </span>
                  </div>

                  {/* Inline, not a popover: the card is .inner-blur-glass, which
                      sets overflow:hidden and would clip an absolute menu. */}
                  {reportOpen === `post-${post.id}` && (
                    <div style={styles.reportPanel}>
                      <span style={styles.reportPanelTitle}>Why are you reporting this post?</span>
                      <div style={styles.reportOptions}>
                        {REPORT_REASONS.map((reason) => (
                          <button key={reason} type="button" className="cf-chip" style={styles.reportOption} onClick={() => reportPost(post.id, reason)}>
                            {reason}
                          </button>
                        ))}
                        <button type="button" className="cf-link" style={styles.reportCancel} onClick={() => setReportOpen(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div style={styles.replyList}>
                      {shownReplies.map((r) => {
                        const replyKey = `reply-${post.id}-${r.sourceIndex}`;
                        const replyReported = alreadyReported(r);
                        return (
                          <div key={r.sourceIndex} style={styles.replyItem}>
                            <div style={styles.replyAvatar}>{(r.author || "?").charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={styles.replyAuthor}>
                                {r.author}
                                {String(r.author || "").toLowerCase().includes("ecoequity") && (
                                  <span style={styles.expertBadge}>EXPERT</span>
                                )}
                                <span style={styles.replyTime}> · {r.time}</span>
                              </span>
                              <p style={styles.replyBody}>{r.body}</p>
                              {reportOpen === replyKey && (
                                <div style={{ ...styles.reportPanel, marginTop: "8px" }}>
                                  <span style={styles.reportPanelTitle}>Why are you reporting this reply?</span>
                                  <div style={styles.reportOptions}>
                                    {REPORT_REASONS.map((reason) => (
                                      <button key={reason} type="button" className="cf-chip" style={styles.reportOption} onClick={() => reportReply(post.id, r.sourceIndex, reason)}>
                                        {reason}
                                      </button>
                                    ))}
                                    <button type="button" className="cf-link" style={styles.reportCancel} onClick={() => setReportOpen(null)}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="cf-icon-btn"
                              style={{ ...styles.replyFlagBtn, ...(replyReported ? styles.replyFlagBtnDone : {}) }}
                              onClick={() => setReportOpen(reportOpen === replyKey ? null : replyKey)}
                              disabled={replyReported}
                              aria-label={replyReported ? "Reply reported" : "Report reply"}
                              title={replyReported ? "You reported this reply" : "Report reply"}
                            >
                              <Flag size={12} fill={replyReported ? "currentColor" : "none"} />
                            </button>
                          </div>
                        );
                      })}
                      {replies.length > 2 && (
                        <button type="button" className="cf-link" style={styles.moreReplies} onClick={() => toggleReplies(post.id)}>
                          {expanded ? "Show fewer replies" : `Show all ${replies.length} replies`}
                        </button>
                      )}
                    </div>
                  )}

                  {replyOpen === post.id && !post.locked && (
                    <div style={styles.replyComposer}>
                      <input
                        className="forum-field"
                        style={{ ...styles.input, marginBottom: 0 }}
                        placeholder="Write a reply…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleReply(post.id); }}
                        autoFocus
                      />
                      <button type="button" className="cf-cta-btn" style={styles.replySendBtn} onClick={() => handleReply(post.id)} aria-label="Send reply">
                        <Send size={15} />
                      </button>
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>

        {renderSidebar()}
      </div>

      <div style={styles.myStrip}>
        <span style={styles.myStripLabel}>Your activity</span>
        <span style={styles.myStripStat}><strong>{myStats.posts}</strong> posts</span>
        <span style={styles.myStripStat}><strong>{myStats.replies}</strong> replies</span>
        <span style={styles.myStripStat}><strong>{myStats.likes}</strong> likes received</span>
        <span style={styles.myStripStat}><strong>{bookmarks.length}</strong> saved</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 16px 40px", maxWidth: "1140px", margin: "0 auto", animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both", fontFamily: "'Inter', sans-serif", overflowY: "auto", height: "100%", boxSizing: "border-box" },
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
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--eco-c6)", boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)", display: "inline-block" },
  hero: {
    position: "relative",
    width: "100%",
    /* wrap is a height-constrained flex column, so a fixed-aspect banner must
       opt out of shrinking or it collapses to its borders. */
    flexShrink: 0,
    borderRadius: "20px",
    overflow: "hidden",
    margin: "4px 0 20px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
  },
  heroMobile: { borderRadius: "16px", margin: "2px 0 14px" },
  heroImg: { display: "block", width: "100%", aspectRatio: "21 / 7", objectFit: "cover", objectPosition: "center 45%" },
  heroScrim: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: "78%",
    pointerEvents: "none",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.68) 100%)",
  },
  heroOverlay: {
    position: "absolute",
    left: "20px",
    right: "20px",
    bottom: "15px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "18px",
  },
  heroOverlayMobile: { left: "14px", right: "14px", bottom: "11px" },
  heroCaption: {
    color: "#fff",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: 1.5,
    textAlign: "left",
    maxWidth: "360px",
    textShadow: "0 1px 6px rgba(0,0,0,0.45)",
  },
  heroStats: { display: "flex", gap: "22px", flexShrink: 0 },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1 },
  heroStatValue: { color: "#fff", fontSize: "20px", fontWeight: 700, fontFamily: "'Poppins', sans-serif", textShadow: "0 2px 10px rgba(0,0,0,0.5)" },
  heroStatLabel: { color: "rgba(255,255,255,0.82)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.7px", textTransform: "uppercase", marginTop: "3px" },
  statStripMobile: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", width: "100%", flexShrink: 0, marginBottom: "14px" },
  statTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "10px 4px", borderRadius: "14px", background: "rgba(255,255,255,0.68)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 6px 16px rgba(0,0,0,0.05)" },
  statIcon: { color: "var(--eco-c11)", display: "flex" },
  statValue: { fontSize: "16px", fontWeight: 700, color: "#0f172a", fontFamily: "'Poppins', sans-serif" },
  statLabel: { fontSize: "9.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", letterSpacing: "0.4px", textTransform: "uppercase" },
  glassContentLayer: { position: "relative", zIndex: 1 },
  title: { fontSize: "clamp(24px, 3.2vw, 38px)", fontWeight: 300, color: "#000", margin: "0 0 10px", fontFamily: "'Poppins', sans-serif", lineHeight: 1.03, textShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  titleMobile: { fontSize: "clamp(20px, 7vw, 30px)" },
  titleAccent: { background: "linear-gradient(90deg, var(--eco-c11), var(--eco-c9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  body: { color: "rgba(0,0,0,0.75)", marginBottom: "20px", maxWidth: "560px", fontSize: "15px", lineHeight: 1.55 },
  bodyMobile: { fontSize: "13.5px" },

  filterBar: {
    position: "sticky",
    top: 0,
    zIndex: 6,
    width: "100%",
    flexShrink: 0,
    marginBottom: "18px",
    padding: "8px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxSizing: "border-box",
  },
  // On phones the bar stacks into three rows — taller than a sticky header
  // should ever be — so it scrolls away with the rest of the page instead.
  filterBarMobile: { position: "static", borderRadius: "22px", padding: "8px 8px 4px" },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: "10px",
    flexWrap: "wrap",
    boxSizing: "border-box",
  },
  searchWrap: { position: "relative", display: "flex", alignItems: "center", flex: "1 1 240px", minWidth: "180px" },
  searchIcon: { position: "absolute", left: "13px", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "10px 34px 10px 36px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.9)", fontSize: "13.5px", color: "#0f172a", boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
  searchClear: { position: "absolute", right: "10px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.06)", color: "#475569", cursor: "pointer" },
  toolbarActions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  savedBtn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "9px 13px", borderRadius: "999px", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.07)", color: "#475569", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  savedBtnActive: { background: "rgba(var(--eco-c9-rgb), 0.12)", borderColor: "rgba(var(--eco-c9-rgb), 0.35)", color: "var(--eco-c13)" },
  newPostBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "999px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(var(--eco-c9-rgb), 0.28)", whiteSpace: "nowrap" },

  catRow: { display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "center", width: "100%", flexShrink: 0, padding: "9px 4px 3px" },
  catChip: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 10px 6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", color: "#334155", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" },
  catChipActive: { background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", borderColor: "transparent", boxShadow: "0 6px 16px rgba(var(--eco-c9-rgb), 0.3)" },
  catChipCount: { marginLeft: "3px", padding: "1px 7px", borderRadius: "999px", background: "rgba(0,0,0,0.06)", fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.55)" },
  catChipCountActive: { background: "rgba(255,255,255,0.25)", color: "#fff" },

  columns: { display: "flex", alignItems: "flex-start", gap: "20px", width: "100%", flexShrink: 0, textAlign: "left" },
  columnsStacked: { flexDirection: "column" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", width: "100%" },
  sidebar: { width: "302px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px", position: "sticky", top: "132px" },
  sidebarStacked: { width: "100%", position: "static", flexDirection: "column" },

  askBar: { display: "flex", alignItems: "center", gap: "11px", width: "100%", padding: "11px 12px", marginBottom: "16px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px dashed rgba(0,0,0,0.14)", cursor: "pointer", textAlign: "left", transition: "border-color .2s ease, background .2s ease", boxSizing: "border-box" },
  askText: { flex: 1, fontSize: "13.5px", color: "rgba(15,23,42,0.5)", fontWeight: 500 },
  askPlus: { display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", flexShrink: 0 },
  avatarSm: { width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 },

  // flexShrink 0 is load-bearing: `wrap` is a column flex container and
  // .inner-blur-glass sets overflow:hidden, which zeroes this item's automatic
  // minimum size — without it the card is squashed to ~34px and clips the
  // title field and Post button instead of letting the page scroll.
  composeCard: { width: "100%", flexShrink: 0, borderRadius: "18px", padding: "16px", marginBottom: "18px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", boxSizing: "border-box", textAlign: "left" },
  composeHead: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  composeClose: { width: "28px", height: "28px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.05)", color: "#475569", cursor: "pointer" },
  input: { width: "100%", padding: "11px 13px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", fontSize: "14px", color: "#0f172a", marginBottom: "10px", boxSizing: "border-box", outline: "none", fontFamily: "inherit", textAlign: "left" },
  textarea: { width: "100%", padding: "11px 13px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", fontSize: "14px", color: "#0f172a", marginBottom: "10px", boxSizing: "border-box", outline: "none", fontFamily: "inherit", textAlign: "left", minHeight: "96px", maxHeight: "260px", resize: "none", overflowY: "hidden", display: "block" },
  composePills: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" },
  composePill: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 11px", borderRadius: "999px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", color: "#475569", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  composePillActive: { background: "rgba(var(--eco-c9-rgb), 0.13)", borderColor: "rgba(var(--eco-c9-rgb), 0.42)", color: "var(--eco-c13)" },
  composeFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" },
  composeHint: { fontSize: "11.5px", color: "rgba(0,0,0,0.45)", fontWeight: 500 },
  select: { padding: "9px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.9)", fontSize: "12.5px", fontWeight: 700, color: "#334155", cursor: "pointer", fontFamily: "inherit" },
  postBtn: { padding: "9px 18px", borderRadius: "999px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(var(--eco-c9-rgb), 0.25)" },
  postBtnDisabled: { opacity: 0.45, cursor: "not-allowed", boxShadow: "none" },

  resultRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", fontSize: "12.5px", color: "rgba(0,0,0,0.55)", fontWeight: 600, marginBottom: "10px" },

  feed: { display: "flex", flexDirection: "column", gap: "16px", width: "100%", flexShrink: 0 },
  emptyCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", padding: "34px 20px", borderRadius: "18px", background: "rgba(255,255,255,0.62)", border: "1px dashed rgba(0,0,0,0.12)" },
  emptyIcon: { width: "46px", height: "46px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(var(--eco-c9-rgb), 0.12)" },
  emptyTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 },
  emptyText: { fontSize: "13.5px", color: "rgba(0,0,0,0.55)", maxWidth: "380px", lineHeight: 1.55, margin: "0 0 6px" },

  postCard: { flexShrink: 0, borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", textAlign: "left", boxSizing: "border-box" },
  postCardOfficial: { border: "1px solid rgba(var(--eco-c9-rgb), 0.45)", background: "linear-gradient(180deg, rgba(var(--eco-c3-rgb), 0.65), rgba(255,255,255,0.6))", boxShadow: "0 10px 28px rgba(var(--eco-c9-rgb), 0.12)" },
  pinnedBadge: { display: "inline-block", fontSize: "10.5px", fontWeight: 800, color: "var(--eco-c13)", letterSpacing: "0.4px", marginBottom: "8px" },
  postHead: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 },
  avatarOfficial: { background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c11))" },
  officialBadge: { marginLeft: "7px", fontSize: "9.5px", fontWeight: 800, color: "#fff", background: "var(--eco-c9)", padding: "2px 7px", borderRadius: "999px", letterSpacing: "0.5px", verticalAlign: "middle" },
  expertBadge: { marginLeft: "6px", fontSize: "8.5px", fontWeight: 800, color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.18)", padding: "2px 6px", borderRadius: "999px", letterSpacing: "0.5px", verticalAlign: "middle" },
  postAuthor: { display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a" },
  postTime: { display: "block", fontSize: "11.5px", color: "rgba(0,0,0,0.45)" },
  catTag: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: "var(--eco-c13)", background: "var(--eco-c3)", padding: "5px 10px", borderRadius: "999px", whiteSpace: "nowrap" },
  bookmarkBtn: { width: "32px", height: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.7)", color: "#64748b", cursor: "pointer" },
  bookmarkBtnActive: { color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.14)", borderColor: "rgba(var(--eco-c9-rgb), 0.3)" },
  postTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  postBody: { fontSize: "14px", color: "rgba(0,0,0,0.7)", lineHeight: 1.55, margin: "0 0 12px" },
  postActions: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  actionBtnActive: { color: "var(--eco-c13)", background: "rgba(var(--eco-c9-rgb), 0.08)", borderColor: "rgba(var(--eco-c9-rgb), 0.2)" },
  actionBtnDisabled: { opacity: 0.6, cursor: "default" },
  lockedBadge: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10.5px", fontWeight: 800, color: "rgba(0,0,0,0.55)", background: "rgba(0,0,0,0.06)", padding: "4px 9px", borderRadius: "999px", letterSpacing: "0.3px", marginBottom: "9px" },
  /* Read-only marker left in the action row once you've reported a post — the
     button itself now lives in the ⋯ menu. */
  reportedChip: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", color: "#b45309", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", fontSize: "12.5px", fontWeight: 600 },
  replyFlagBtn: { width: "24px", height: "24px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "transparent", color: "rgba(0,0,0,0.3)", cursor: "pointer" },
  replyFlagBtnDone: { color: "#b45309", background: "rgba(245, 158, 11, 0.14)", cursor: "default" },
  reportPanel: { marginTop: "12px", padding: "12px", borderRadius: "14px", background: "rgba(245, 158, 11, 0.07)", border: "1px solid rgba(245, 158, 11, 0.25)" },
  reportPanelTitle: { display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.4px", textTransform: "uppercase", color: "#92400e", marginBottom: "9px" },
  reportOptions: { display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" },
  reportOption: { padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)", color: "#334155", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  reportCancel: { fontSize: "12px", marginLeft: "2px" },

  // Author-only controls. Sage throughout — the destructive step reads as
  // heavier ink rather than a new hue (see the five-tone palette rule).
  /* The ⋯ menu card. Portalled to <body>, so `top`/`left` are supplied per
     post and a real drop shadow is right here — it floats over the feed rather
     than sitting on the pale card ground where a shadow greys out. */
  menuPop: {
    position: "fixed", zIndex: MODAL_LAYER.popover, width: `${MENU_WIDTH}px`,
    display: "flex", flexDirection: "column", gap: "2px",
    padding: "6px", borderRadius: "14px",
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(18px) saturate(180%)",
    WebkitBackdropFilter: "blur(18px) saturate(180%)",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 18px 44px rgba(15,23,42,0.18)",
    animation: "fadeIn 0.16s ease",
  },
  menuPopItem: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 11px", borderRadius: "10px", border: "none", background: "transparent", color: "#334155", fontSize: "13px", fontWeight: 650, textAlign: "left", cursor: "pointer", fontFamily: "inherit" },
  menuPopDanger: { color: "var(--eco-c15)" },
  /* Amber, like every other report affordance on the page — the one place the
     sage ramp is deliberately left for a status colour. */
  menuPopReport: { color: "#b45309" },
  menuPopDone: { opacity: 0.6, cursor: "default" },
  deletePanel: { marginBottom: "12px", padding: "12px", borderRadius: "14px", background: "rgba(var(--eco-c15-rgb), 0.06)", border: "1px solid rgba(var(--eco-c15-rgb), 0.24)" },
  deletePanelTitle: { display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--eco-c15)", marginBottom: "6px" },
  deleteText: { fontSize: "12.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: "0 0 10px" },
  deleteConfirmBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 15px", borderRadius: "999px", background: "var(--eco-c15)", border: "none", color: "#fff", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(var(--eco-c15-rgb), 0.22)" },
  editBox: { marginBottom: "4px" },
  editActions: { display: "flex", alignItems: "center", gap: "10px" },

  statusChip: { display: "inline-flex", alignItems: "center", gap: "5px", marginLeft: "auto", padding: "5px 11px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap" },
  statusAnswered: { color: "var(--eco-c13)", background: "rgba(var(--eco-c5-rgb), 0.55)" },
  statusOpen: { color: "#92400e", background: "rgba(245, 158, 11, 0.14)" },

  replyList: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px", paddingLeft: "8px", borderLeft: "2px solid rgba(var(--eco-c9-rgb), 0.15)" },
  replyItem: { display: "flex", gap: "10px", paddingLeft: "8px" },
  replyAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(var(--eco-c9-rgb), 0.15)", color: "var(--eco-c13)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  replyAuthor: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  replyTime: { fontSize: "11px", fontWeight: 500, color: "rgba(0,0,0,0.4)" },
  replyBody: { fontSize: "13.5px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5, margin: "2px 0 0" },
  moreReplies: { alignSelf: "flex-start", paddingLeft: "8px", fontSize: "12.5px" },
  replyComposer: { display: "flex", gap: "8px", alignItems: "center", marginTop: "14px" },
  replySendBtn: { width: "40px", height: "40px", flexShrink: 0, borderRadius: "12px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(var(--eco-c9-rgb), 0.25)" },

  panel: { borderRadius: "18px", padding: "16px", background: "rgba(255,255,255,0.66)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", boxSizing: "border-box" },
  panelCta: { background: "linear-gradient(160deg, rgba(var(--eco-c3-rgb), 0.85), rgba(255,255,255,0.7))", border: "1px solid rgba(var(--eco-c9-rgb), 0.28)" },
  panelHead: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" },
  panelTitle: { fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.3px", margin: 0, textTransform: "uppercase" },
  panelEmpty: { fontSize: "12.5px", color: "rgba(0,0,0,0.45)", margin: 0 },
  contribRow: { display: "flex", alignItems: "center", gap: "9px", padding: "6px 0" },
  contribRank: { width: "18px", fontSize: "11.5px", fontWeight: 800, color: "rgba(0,0,0,0.35)", flexShrink: 0 },
  contribRankTop: { color: "var(--eco-c11)" },
  contribName: { display: "block", fontSize: "13px", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  contribMeta: { display: "block", fontSize: "11px", color: "rgba(0,0,0,0.45)", fontWeight: 500 },
  trendRow: { display: "grid", gridTemplateColumns: "1fr auto", gap: "4px 8px", width: "100%", padding: "8px", marginBottom: "2px", borderRadius: "12px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" },
  trendLabel: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 600, color: "#334155" },
  trendCount: { fontSize: "11.5px", fontWeight: 700, color: "rgba(0,0,0,0.45)" },
  trendTrack: { gridColumn: "1 / -1", height: "5px", borderRadius: "999px", background: "rgba(0,0,0,0.07)", overflow: "hidden" },
  trendFill: { display: "block", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c11))" },
  guideList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "9px" },
  guideItem: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 },
  guideDot: { width: "5px", height: "5px", borderRadius: "50%", background: "var(--eco-c9)", marginTop: "7px", flexShrink: 0 },
  ctaText: { fontSize: "12.5px", color: "rgba(0,0,0,0.62)", lineHeight: 1.55, margin: "0 0 12px" },
  ctaBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px 14px", borderRadius: "999px", background: "linear-gradient(135deg, var(--eco-c9), var(--eco-c11))", border: "none", color: "#fff", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", marginBottom: "8px", boxShadow: "0 6px 16px rgba(var(--eco-c9-rgb), 0.22)" },
  ctaBtnGhost: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.75)", border: "1px solid rgba(var(--eco-c9-rgb), 0.3)", color: "var(--eco-c13)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" },

  myStrip: { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", width: "100%", flexShrink: 0, marginTop: "22px", padding: "12px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.85)", boxSizing: "border-box" },
  myStripLabel: { fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.7px", textTransform: "uppercase", color: "var(--eco-c13)" },
  myStripStat: { fontSize: "12.5px", color: "rgba(0,0,0,0.6)", fontWeight: 500 },
};

export default CommunityForumPage;
