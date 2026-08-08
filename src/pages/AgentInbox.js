import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, RefreshCcw, UserCheck, LogOut, X, Camera, KeyRound, Search } from "lucide-react";
import {
  fetchMyAssignedChats, fetchMyAgentState, agentHeartbeat, closeLiveChat,
  saveAgentProfile,
} from "../data/supportAgents";
import { updatePassword, passwordProblem, PASSWORD_MIN_LENGTH } from "../data/auth";
import { fetchTicketMessages, sendLiveMessage, subscribeToTicket } from "../data/liveChat";
import { MODAL_LAYER, modalOverlay } from "../styles/modal";

// ============================================================================
// AGENT INBOX — where a support agent answers the chats they were given.
//
// Deliberately NOT a mode inside the Admin Portal. `is_agent` is a support
// role, not a management one: an agent needs the conversations assigned to
// them and nothing else. Reusing the portal would mean every one of its tabs
// — members, orders, revenue, settings — became a gate that has to hold, and a
// gate that has to hold is a gate that eventually doesn't. This screen cannot
// leak what it never renders.
//
// The database agrees: tickets_own (supabase/support-agents.sql) lets an agent
// reach a ticket only where `agent_id = auth.uid()`, so even a bug here cannot
// widen what the queries below are allowed to return.
// ============================================================================

// How often we tell the database this agent is still here. The view treats a
// heartbeat older than two minutes as gone, so this has to stay comfortably
// inside half of that — one dropped request must not read as walking away.
const HEARTBEAT_MS = 60000;

const AGENT_STATUSES = [
  { value: "available", label: "Available", dot: "#22c55e" },
  { value: "busy",      label: "Busy",      dot: "#f59e0b" },
  { value: "away",      label: "Away",      dot: "#f59e0b" },
  { value: "offline",   label: "Offline",   dot: "rgba(0,0,0,0.28)" },
];

function waitLabel(timestamp) {
  if (!timestamp) return "just now";
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AgentInbox({ agentName = "", onLogout, supabaseReady = false }) {
  const [status, setStatus] = useState("offline");
  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showAiHistory, setShowAiHistory] = useState(false);
  const [search, setSearch] = useState("");
  // The agent's own record. Loaded once on arrival and kept here so the header
  // can show who is signed in without another round trip on every render.
  const [me, setMe] = useState({ name: "", photo: null, email: "" });
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountDraft, setAccountDraft] = useState({ name: "", password: "", confirm: "" });
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountNote, setAccountNote] = useState(null);   // { text, bad }
  const threadEndRef = useRef(null);

  const selected = chats.find(chat => chat.id === selectedId) || null;

  // Two lanes, because they are two different jobs. 'Pending' is a member who
  // was told an agent is coming and has not heard from one yet — the promise
  // outstanding. 'Active' is a conversation already underway. Sorting them into
  // one list buries the person who has been waiting longest under whoever
  // happened to type most recently.
  const query = search.trim().toLowerCase();
  const visibleChats = query
    ? chats.filter(chat => (
        `${chat.memberName} ${chat.memberEmail} ${chat.subject} ${chat.ref}`
          .toLowerCase().includes(query)
      ))
    : chats;
  const pendingChats = visibleChats.filter(chat => chat.liveStatus !== "active");
  const activeChats = visibleChats.filter(chat => chat.liveStatus === "active");
  // Counted off the UNFILTERED list on purpose: these are the shift's workload,
  // and a number that drops because somebody typed in a search box is not one.
  const waitingCount = chats.filter(chat => chat.waitingOnUs).length;

  const reload = useCallback(async () => {
    if (!supabaseReady) return;
    try {
      const rows = await fetchMyAssignedChats();
      setChats(rows);
      setError("");
    } catch (err) {
      setError(
        /live_status|agent_id/i.test(err?.message || "")
          ? "This needs supabase/live-agent-flow.sql to be run first."
          : "Could not load your chats."
      );
    }
  }, [supabaseReady]);

  // What this agent last said they were. Read once on arrival so the switch
  // opens showing the truth rather than defaulting to 'offline' and quietly
  // reporting them away the moment they touch it.
  useEffect(() => {
    if (!supabaseReady) return;
    fetchMyAgentState()
      .then((state) => {
        if (!state?.isAgent) return;
        setStatus(state.status);
        setMe({ name: state.name, photo: state.photo, email: state.email });
      })
      .catch(() => {});
  }, [supabaseReady]);

  // Presence, and the queue. Both on the same timer because both answer the
  // same question — is this person working — and a screen that says "you are
  // available" while showing a stale list is worse than one that says nothing.
  useEffect(() => {
    if (!supabaseReady) return undefined;
    agentHeartbeat();
    reload();
    const timer = setInterval(() => { agentHeartbeat(); reload(); }, HEARTBEAT_MS);

    // Leaving the screen ends the shift. Without this an agent who navigates
    // away stays 'available' for two minutes and collects chats they will
    // never see — the exact promise this feature must not break.
    return () => {
      clearInterval(timer);
      agentHeartbeat("offline");
    };
  }, [supabaseReady, reload]);

  // The open conversation. Backfill, then subscribe, then dedupe on id —
  // our own insert comes back down the same subscription.
  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;
    setMessages([]);
    setShowAiHistory(false);   // a new member, a new question — start collapsed

    fetchTicketMessages(selectedId)
      .then((rows) => { if (!cancelled) setMessages(rows || []); })
      .catch(() => { if (!cancelled) setMessages([]); });

    const unsubscribe = subscribeToTicket(selectedId, (message) => {
      if (cancelled) return;
      setMessages(prev => (prev.some(m => m.id === message.id) ? prev : [...prev, message]));
      // A member replying changes where this chat belongs in the list.
      if (message.sender === "member") reload();
    });

    return () => { cancelled = true; unsubscribe(); };
  }, [selectedId, reload]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusChange = async (next) => {
    setStatus(next);           // optimistic: the switch must feel instant
    await agentHeartbeat(next);
  };

  const handleSend = async () => {
    const text = reply.trim();
    if (!selectedId || !text || sending) return;
    setSending(true);
    try {
      const sent = await sendLiveMessage(selectedId, text, "agent");
      if (sent) {
        setMessages(prev => (prev.some(m => m.id === sent.id) ? prev : [...prev, sent]));
      }
      setReply("");
      reload();
    } catch {
      setError("That message didn't send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const openAccount = () => {
    setAccountDraft({ name: me.name || agentName || "", password: "", confirm: "" });
    setAccountNote(null);
    setAccountOpen(true);
  };

  /**
   * Photo, downscaled in the browser before it ever leaves it.
   *
   * profile_pic is a data URL in a text column, so an untouched 4MB phone photo
   * would be ~5.5MB of base64 on every profile read — including the one the
   * admin's agent picker makes for every agent at once. 256px is larger than
   * anywhere it is ever drawn.
   */
  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        // Cover, not stretch: crop the long side so faces stay round in a
        // round frame instead of being squashed to fit it.
        const side = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(
          img,
          (img.width - side) / 2, (img.height - side) / 2, side, side,
          0, 0, size, size,
        );
        setMe(prev => ({ ...prev, photo: canvas.toDataURL("image/jpeg", 0.82) }));
        setAccountNote({ text: "Photo ready — press Save to keep it.", bad: false });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = async () => {
    if (accountBusy) return;
    const wantsPassword = Boolean(accountDraft.password || accountDraft.confirm);

    if (wantsPassword) {
      const problem = passwordProblem(accountDraft.password, accountDraft.confirm);
      if (problem) { setAccountNote({ text: problem, bad: true }); return; }
    }
    if (!accountDraft.name.trim()) {
      setAccountNote({ text: "Members see this name when you join a chat — it can't be blank.", bad: true });
      return;
    }

    setAccountBusy(true);
    try {
      await saveAgentProfile({ name: accountDraft.name, photo: me.photo });
      // Password second: if it succeeds the session is re-issued, and a
      // failure after that would leave the name unsaved for no reason.
      if (wantsPassword) await updatePassword(accountDraft.password);

      setMe(prev => ({ ...prev, name: accountDraft.name.trim() }));
      setAccountDraft(prev => ({ ...prev, password: "", confirm: "" }));
      setAccountNote({ text: wantsPassword ? "Saved. Use the new password next time." : "Saved.", bad: false });
    } catch (err) {
      setAccountNote({ text: err?.message || "Could not save that.", bad: true });
    } finally {
      setAccountBusy(false);
    }
  };

  const handleClose = async () => {
    if (!selectedId) return;
    try {
      await closeLiveChat(selectedId);
      setSelectedId(null);
      reload();
    } catch {
      setError("Could not close that chat.");
    }
  };

  return (
    <div style={styles.page}>
      <header className="inner-blur-glass" style={styles.header}>
        {/* No way back to the site. This is the agent's whole application, and a
            back arrow on it invites a support screen to be treated as a detour
            from browsing — leaving a shift open in a tab behind a shop page.
            Sign out is the deliberate exit. */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          {/* The identity button is the account entry point. A dropdown would
              be clipped — this header is a glass card, and those hide overflow
              — so it opens a panel instead of a menu. */}
          <button onClick={openAccount} style={styles.identityBtn} title="Account & profile">
            <span style={styles.avatar}>
              {me.photo
                ? <img src={me.photo} alt="" style={styles.avatarImg} />
                : (me.name || agentName || "A").trim().charAt(0).toUpperCase()}
            </span>
            <span style={{ minWidth: 0, textAlign: "left" }}>
              <span style={styles.title}>My Chats</span>
              <span style={styles.subtitle}>{me.name || agentName || "Support agent"}</span>
            </span>
          </button>
          {/* The portal hides the site's account menu, which is where signing
              out used to live. Carrying its own is not optional — and with no
              back arrow it is now the only way out, which is the point: a
              support screen somebody cannot leave is a shared machine left
              logged in. */}
          {onLogout && (
            <button onClick={onLogout} style={styles.logoutBtn}>
              <LogOut size={13} /> Sign out
            </button>
          )}
        </div>

        {/* A segmented control, not a dropdown. Glass cards clip absolutely
            positioned menus, and availability is the one control on this screen
            that must never be fiddly — an agent who cannot go 'away' in one tap
            simply stays 'available' and lets someone wait.

            One track holding four segments, and it never wraps: four options
            that reflow into a column stop reading as one control and start
            reading as a menu, and a menu implies the current value is somewhere
            else on the screen. On a narrow phone the track scrolls sideways
            instead — the shape survives, which is the part that carries the
            meaning. */}
        <div style={styles.statusWrap}>
          <span style={styles.statusCaption}>You are</span>
          <div style={styles.statusTrack} className="slim-scroll">
            {AGENT_STATUSES.map(option => {
              const isOn = status === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  aria-pressed={isOn}
                  style={{ ...styles.statusBtn, ...(isOn ? styles.statusBtnActive : {}) }}
                >
                  <span style={{
                    ...styles.statusDot,
                    // The unselected dots are drained rather than coloured. Four
                    // lit dots at once would say the agent is four things.
                    background: isOn ? option.dot : "rgba(0,0,0,0.18)",
                  }} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.body}>
        <aside className="inner-blur-glass" style={styles.list}>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>
              <MessageSquare size={14} /> Assigned to me
            </span>
            <button onClick={reload} style={styles.refreshBtn}><RefreshCcw size={12} /></button>
          </div>

          {/* The shift at a glance. Waiting first because it is the only one of
              the three that is a request for action. */}
          <div style={styles.statsRow}>
            {[
              { label: "Waiting", value: waitingCount, lit: waitingCount > 0 },
              { label: "Active", value: activeChats.length, lit: false },
              { label: "Assigned", value: chats.length, lit: false },
            ].map(stat => (
              <div key={stat.label} style={{ ...styles.statCell, ...(stat.lit ? styles.statCellLit : {}) }}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {chats.length > 4 && (
            <div style={styles.searchWrap}>
              <Search size={13} color="rgba(0,0,0,0.35)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or subject"
                style={styles.searchInput}
              />
            </div>
          )}

          {!supabaseReady ? (
            <div style={styles.empty}>Connect Supabase to receive chats.</div>
          ) : chats.length === 0 ? (
            <div style={styles.empty}>
              Nothing assigned to you yet. Chats appear here when an admin puts you on one.
            </div>
          ) : visibleChats.length === 0 ? (
            <div style={styles.empty}>No chat matches “{search.trim()}”.</div>
          ) : (
            <>
              {[
                { key: "pending", label: "Pending", rows: pendingChats },
                { key: "active",  label: "Active",  rows: activeChats },
              ].filter(lane => lane.rows.length > 0).map(lane => (
                <div key={lane.key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={styles.laneLabel}>{lane.label} · {lane.rows.length}</div>
                  {lane.rows.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedId(chat.id)}
                      style={{
                        ...styles.listItem,
                        ...(chat.id === selectedId ? styles.listItemActive : {}),
                      }}
                    >
                      <div style={styles.listItemTop}>
                        <span style={styles.listItemName}>{chat.memberName}</span>
                        {chat.waitingOnUs && <span style={styles.waitingPip} />}
                      </div>
                      <div style={styles.listItemMeta}>{chat.subject}</div>
                      <div style={styles.listItemTime}>{waitLabel(chat.lastMessageAt)}</div>
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </aside>

        <section className="inner-blur-glass" style={styles.thread}>
          {!selected ? (
            <div style={styles.empty}>Pick a conversation on the left.</div>
          ) : (
            <>
              <div style={styles.threadHeader}>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.threadName}>{selected.memberName}</div>
                  <div style={styles.threadMeta}>
                    {selected.ref} • {selected.memberEmail}
                    {selected.previousAgentName && selected.previousAgentName !== agentName
                      ? ` • taken over from ${selected.previousAgentName}`
                      : ""}
                  </div>
                </div>
                <button onClick={handleClose} style={styles.closeChatBtn}>Close chat</button>
              </div>

              {/* What they told the bot before asking for a person. Collapsed by
                  default and kept out of the thread: it is context, not
                  conversation, and rendering it inline would make the transcript
                  claim this agent was present for it. */}
              {selected.aiHistory?.length > 0 && (
                <div style={styles.aiHistory}>
                  <button
                    onClick={() => setShowAiHistory(v => !v)}
                    style={styles.aiHistoryToggle}
                  >
                    {showAiHistory ? "Hide" : "Show"} AI conversation before this ({selected.aiHistory.length})
                  </button>
                  {showAiHistory && (
                    <div style={styles.aiHistoryBody} className="slim-scroll">
                      {selected.aiHistory.map((entry, index) => (
                        <div key={index} style={styles.aiHistoryLine}>
                          <span style={styles.aiHistoryWho}>
                            {entry.sender === "member" ? selected.memberName : "AI"}
                          </span>
                          <span>{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={styles.messages} className="slim-scroll">
                {messages.length === 0 ? (
                  <div style={styles.empty}>No messages yet.</div>
                ) : messages.map(message => {
                  const mine = message.sender === "agent";
                  return (
                    <div key={message.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                      <div style={{ ...styles.bubble, ...(mine ? styles.bubbleMine : styles.bubbleTheirs) }}>
                        {message.text}
                      </div>
                      <div style={{ ...styles.bubbleMeta, textAlign: mine ? "right" : "left" }}>
                        {mine ? <><UserCheck size={10} /> You</> : selected.memberName} • {waitLabel(message.createdAt)}
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              <div style={styles.composer}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Reply to the member..."
                  rows={2}
                  style={styles.input}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !reply.trim()}
                  style={{ ...styles.sendBtn, ...(sending || !reply.trim() ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* -------------------------------------------------------------------
          Account & profile.

          Scoped to what a support agent's account actually is: the name and
          face customers are introduced to, and the password that gets them in.
          Deliberately NOT the member account screen — no orders, no EcoPoints,
          no addresses. This portal is a workplace, not a shop.
          ------------------------------------------------------------------- */}
      {accountOpen && (
        <div style={modalOverlay(MODAL_LAYER.base)} onClick={() => setAccountOpen(false)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAccountOpen(false)} aria-label="Close" style={styles.sheetClose}>
              <X size={16} />
            </button>
            <h2 style={styles.sheetTitle}>Account &amp; profile</h2>
            <p style={styles.sheetHint}>{me.email}</p>

            <div style={styles.photoRow}>
              <span style={{ ...styles.avatar, width: "56px", height: "56px", fontSize: "20px" }}>
                {me.photo
                  ? <img src={me.photo} alt="" style={styles.avatarImg} />
                  : (accountDraft.name || "A").trim().charAt(0).toUpperCase()}
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <label style={styles.ghostBtn}>
                  <Camera size={13} /> Change photo
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                </label>
                {me.photo && (
                  <button onClick={() => setMe(prev => ({ ...prev, photo: null }))} style={styles.ghostBtn}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <label style={styles.fieldLabel}>Display name</label>
            <input
              value={accountDraft.name}
              onChange={(e) => setAccountDraft({ ...accountDraft, name: e.target.value })}
              placeholder="e.g. Maria Santos"
              style={styles.field}
            />
            <p style={styles.fieldNote}>
              Customers see this when you join a chat — “{(accountDraft.name || "Your name").trim()} has joined the chat.”
            </p>

            <label style={{ ...styles.fieldLabel, display: "flex", alignItems: "center", gap: "6px" }}>
              <KeyRound size={12} /> New password
            </label>
            <input
              type="password"
              value={accountDraft.password}
              onChange={(e) => setAccountDraft({ ...accountDraft, password: e.target.value })}
              placeholder={`At least ${PASSWORD_MIN_LENGTH} characters — leave blank to keep it`}
              style={styles.field}
            />
            <input
              type="password"
              value={accountDraft.confirm}
              onChange={(e) => setAccountDraft({ ...accountDraft, confirm: e.target.value })}
              placeholder="Confirm new password"
              style={{ ...styles.field, marginTop: "8px" }}
            />

            {accountNote && (
              <div style={{ ...styles.note, ...(accountNote.bad ? styles.noteBad : styles.noteGood) }}>
                {accountNote.text}
              </div>
            )}

            <div style={{ display: "flex", gap: "9px", marginTop: "16px", flexWrap: "wrap" }}>
              <button onClick={handleSaveAccount} disabled={accountBusy} style={{ ...styles.saveBtn, ...(accountBusy ? { opacity: 0.6, cursor: "wait" } : {}) }}>
                {accountBusy ? "Saving…" : "Save changes"}
              </button>
              {onLogout && (
                <button onClick={onLogout} style={styles.ghostBtn}><LogOut size={13} /> Sign out</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Portal design tokens, matched to `AD` in src/pages/AdminPortal.js.
 *
 * Copied rather than imported because AdminPortal does not export them, and
 * importing that 8000-line module for four colours would pull its whole
 * dependency graph into the agent bundle. The values are the contract — if the
 * admin console's surface or radius changes, change it here too.
 */
const AD = {
  ink: "var(--eco-c19)",
  inkSoft: "rgba(var(--eco-c19-rgb), 0.60)",
  inkFaint: "rgba(var(--eco-c19-rgb), 0.40)",
  line: "rgba(var(--eco-c19-rgb), 0.08)",
  lineSoft: "rgba(var(--eco-c19-rgb), 0.05)",
  surface: "rgba(255,255,255,0.74)",
  surfaceSolid: "rgba(255,255,255,0.92)",
  radius: 18,
  radiusSm: 12,
  shadow: "0 8px 22px rgba(var(--eco-c19-rgb), 0.05), inset 0 1px 0 rgba(255,255,255,0.75)",
  shadowLift: "0 16px 34px rgba(var(--eco-c19-rgb), 0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
};

/** One card. Every panel in this portal is this shape, as in the admin console. */
const card = {
  background: AD.surface,
  border: `1px solid ${AD.line}`,
  borderRadius: `${AD.radius}px`,
  boxShadow: AD.shadow,
  boxSizing: "border-box",
  minWidth: 0,
};

const styles = {
  // Matches AdminPortal's dashboardContainer: the same clamped gutter, so the
  // two consoles line up when you move between them.
  page: {
    padding: "clamp(14px, 2vw, 22px) clamp(14px, 2.2vw, 24px) clamp(18px, 2.5vw, 28px)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "100%",
    minHeight: 0,
    boxSizing: "border-box",
  },
  header: {
    ...card,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    rowGap: "12px",
    flexWrap: "wrap",
    padding: "14px 18px",
  },
  identityBtn: {
    display: "flex", alignItems: "center", gap: "11px", minWidth: 0,
    padding: "4px 10px 4px 4px", borderRadius: "999px", cursor: "pointer",
    border: "1px solid transparent", background: "transparent", fontFamily: "inherit",
    transition: "background 0.18s ease",
  },
  avatar: {
    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(var(--eco-c9-rgb), 0.16)", color: "var(--eco-c13)",
    fontWeight: 850, fontSize: "15px", overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  title: {
    display: "block", margin: 0, fontSize: "15px", fontWeight: 850,
    color: AD.ink, letterSpacing: "-0.2px", lineHeight: 1.25,
  },
  subtitle: {
    display: "block", fontSize: "12px", fontWeight: 600, color: AD.inkSoft,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
    padding: "8px 13px", borderRadius: `${AD.radiusSm}px`,
    border: `1px solid ${AD.line}`, background: AD.surfaceSolid,
    fontSize: "12px", fontWeight: 800, color: AD.inkSoft,
    cursor: "pointer", fontFamily: "inherit",
  },

  // --- availability -------------------------------------------------------
  statusWrap: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0, maxWidth: "100%" },
  statusCaption: {
    fontSize: "11px", fontWeight: 850, letterSpacing: "0.4px",
    textTransform: "uppercase", color: AD.inkFaint, flexShrink: 0,
  },
  statusTrack: {
    display: "flex", flexWrap: "nowrap", gap: "3px", minWidth: 0,
    padding: "3px", borderRadius: "999px", overflowX: "auto",
    background: "rgba(var(--eco-c19-rgb), 0.05)", border: `1px solid ${AD.lineSoft}`,
  },
  statusBtn: {
    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
    padding: "7px 13px", borderRadius: "999px", cursor: "pointer",
    border: "none", background: "transparent", whiteSpace: "nowrap",
    fontSize: "12px", fontWeight: 800, color: AD.inkSoft,
    fontFamily: "inherit", transition: "background 0.15s ease, color 0.15s ease",
  },
  statusBtnActive: {
    background: AD.surfaceSolid, color: "var(--eco-c13)",
    boxShadow: "0 1px 3px rgba(var(--eco-c19-rgb), 0.14)",
  },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },

  error: {
    padding: "11px 14px", borderRadius: `${AD.radiusSm}px`,
    fontSize: "12px", fontWeight: 750,
    background: "rgba(220,38,38,0.1)", color: "#b91c1c",
  },

  // --- two panes ----------------------------------------------------------
  body: {
    display: "grid", gridTemplateColumns: "minmax(230px, 320px) 1fr",
    gap: "16px", flex: 1, minHeight: 0,
  },
  list: {
    ...card,
    padding: "16px", display: "flex", flexDirection: "column",
    gap: "10px", overflowY: "auto",
  },
  listHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  listTitle: {
    display: "flex", alignItems: "center", gap: "7px",
    fontSize: "13px", fontWeight: 850, color: AD.ink, letterSpacing: "-0.2px",
  },
  refreshBtn: {
    border: "none", background: "rgba(var(--eco-c19-rgb), 0.06)",
    borderRadius: "9px", padding: "6px", cursor: "pointer",
    display: "flex", color: "var(--eco-c13)",
  },

  statsRow: { display: "flex", gap: "8px" },
  statCell: {
    flex: 1, padding: "10px 6px", textAlign: "center",
    background: AD.surfaceSolid, border: `1px solid ${AD.line}`,
    borderRadius: `${AD.radiusSm}px`, boxSizing: "border-box",
  },
  statCellLit: {
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.28)",
  },
  statValue: {
    fontSize: "19px", fontWeight: 850, color: AD.ink,
    letterSpacing: "-0.6px", lineHeight: 1.15,
  },
  statLabel: {
    fontSize: "10px", fontWeight: 800, letterSpacing: "0.4px",
    textTransform: "uppercase", color: AD.inkSoft, marginTop: "2px",
  },

  searchWrap: {
    display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px",
    borderRadius: `${AD.radiusSm}px`, background: AD.surfaceSolid,
    border: `1px solid ${AD.line}`,
  },
  searchInput: {
    flex: 1, minWidth: 0, border: "none", background: "transparent",
    outline: "none", fontSize: "12px", fontWeight: 650,
    color: AD.ink, fontFamily: "inherit",
  },

  laneLabel: {
    fontSize: "10px", fontWeight: 850, letterSpacing: "0.6px",
    textTransform: "uppercase", color: AD.inkFaint, marginTop: "4px",
  },
  listItem: {
    textAlign: "left", padding: "12px 13px", borderRadius: `${AD.radiusSm}px`,
    cursor: "pointer", border: `1px solid ${AD.line}`, background: AD.surfaceSolid,
    fontFamily: "inherit", display: "flex", flexDirection: "column", gap: "3px",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },
  listItemActive: {
    border: "1px solid var(--eco-c9)",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
  },
  listItemTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  listItemName: { fontSize: "13px", fontWeight: 850, color: AD.ink },
  waitingPip: { width: "8px", height: "8px", borderRadius: "50%", background: "var(--eco-c9)", flexShrink: 0 },
  listItemMeta: {
    fontSize: "11.5px", fontWeight: 600, color: AD.inkSoft,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  listItemTime: { fontSize: "10.5px", fontWeight: 700, color: AD.inkFaint },

  // --- thread -------------------------------------------------------------
  thread: { ...card, padding: "18px 20px", display: "flex", flexDirection: "column" },
  threadHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: "12px", paddingBottom: "14px", borderBottom: `1px solid ${AD.line}`,
  },
  threadName: { fontSize: "16px", fontWeight: 850, color: AD.ink, letterSpacing: "-0.2px" },
  threadMeta: { fontSize: "11.5px", fontWeight: 600, color: AD.inkSoft, marginTop: "3px" },
  closeChatBtn: {
    padding: "8px 14px", borderRadius: `${AD.radiusSm}px`, flexShrink: 0,
    border: `1px solid ${AD.line}`, background: AD.surfaceSolid, color: AD.inkSoft,
    fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  },

  aiHistory: {
    marginTop: "14px", borderRadius: `${AD.radiusSm}px`,
    border: `1px dashed ${AD.line}`, padding: "11px 13px",
  },
  aiHistoryToggle: {
    border: "none", background: "none", padding: 0, cursor: "pointer",
    fontSize: "11.5px", fontWeight: 800, color: "var(--eco-c13)",
    fontFamily: "inherit", textDecoration: "underline",
  },
  aiHistoryBody: {
    marginTop: "10px", maxHeight: "190px", overflowY: "auto",
    display: "flex", flexDirection: "column", gap: "7px",
  },
  aiHistoryLine: { display: "flex", gap: "8px", fontSize: "12px", lineHeight: 1.45, color: AD.inkSoft },
  aiHistoryWho: {
    flexShrink: 0, minWidth: "62px", fontWeight: 850,
    color: AD.inkFaint, fontSize: "10.5px", paddingTop: "1px",
  },

  messages: {
    flex: 1, minHeight: "160px", overflowY: "auto", padding: "16px 2px",
    display: "flex", flexDirection: "column", gap: "10px",
  },
  bubble: {
    padding: "10px 13px", fontSize: "13px", lineHeight: 1.45,
    color: "rgba(var(--eco-c19-rgb), 0.82)", whiteSpace: "pre-wrap",
    wordBreak: "break-word", border: `1px solid ${AD.line}`,
  },
  bubbleMine: { borderRadius: "16px 16px 4px 16px", background: "rgba(var(--eco-c9-rgb), 0.14)" },
  bubbleTheirs: { borderRadius: "16px 16px 16px 4px", background: AD.surfaceSolid },
  bubbleMeta: {
    display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end",
    fontSize: "10px", fontWeight: 700, color: AD.inkFaint, marginTop: "3px",
  },

  composer: { display: "flex", gap: "10px", alignItems: "flex-start" },
  input: {
    flex: 1, padding: "11px 13px", borderRadius: `${AD.radiusSm}px`, resize: "vertical",
    border: `1px solid ${AD.line}`, background: AD.surfaceSolid,
    fontSize: "13px", fontFamily: "inherit", lineHeight: 1.4, color: AD.ink,
  },
  sendBtn: {
    padding: "12px 15px", borderRadius: `${AD.radiusSm}px`, border: "none", flexShrink: 0,
    background: "var(--eco-c9)", color: "#fff", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  empty: {
    margin: "auto", padding: "26px", textAlign: "center", lineHeight: 1.55,
    fontSize: "12.5px", fontWeight: 700, color: AD.inkFaint,
  },

  // --- account sheet ------------------------------------------------------
  sheet: {
    position: "relative", width: "min(440px, 94vw)", maxHeight: "88vh",
    overflowY: "auto", borderRadius: "22px", padding: "26px",
    background: AD.surfaceSolid, border: `1px solid ${AD.line}`,
    boxShadow: AD.shadowLift, boxSizing: "border-box",
  },
  sheetClose: {
    position: "absolute", top: "16px", right: "16px", width: "34px", height: "34px",
    borderRadius: "50%", border: "none", background: "rgba(var(--eco-c19-rgb), 0.06)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  sheetTitle: {
    margin: "0 0 3px", fontSize: "19px", fontWeight: 850,
    color: AD.ink, letterSpacing: "-0.3px",
  },
  sheetHint: { margin: "0 0 20px", fontSize: "12px", fontWeight: 600, color: AD.inkSoft },
  photoRow: {
    display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
    padding: "14px", borderRadius: `${AD.radiusSm}px`,
    background: "rgba(var(--eco-c19-rgb), 0.04)", border: `1px solid ${AD.lineSoft}`,
  },
  fieldLabel: {
    display: "block", fontSize: "11px", fontWeight: 850, letterSpacing: "0.3px",
    textTransform: "uppercase", color: AD.inkSoft, marginBottom: "7px", marginTop: "18px",
  },
  field: {
    width: "100%", boxSizing: "border-box", padding: "11px 13px",
    borderRadius: `${AD.radiusSm}px`, border: `1px solid ${AD.line}`,
    background: "rgba(255,255,255,0.9)", fontSize: "13px",
    fontFamily: "inherit", color: AD.ink, outline: "none",
  },
  fieldNote: { margin: "8px 0 0", fontSize: "11px", fontWeight: 600, color: AD.inkFaint, lineHeight: 1.5 },
  note: {
    marginTop: "16px", padding: "10px 12px", borderRadius: `${AD.radiusSm}px`,
    fontSize: "12px", fontWeight: 750, lineHeight: 1.45,
  },
  noteGood: { background: "rgba(34,197,94,0.12)", color: "#15803d" },
  noteBad: { background: "rgba(220,38,38,0.1)", color: "#b91c1c" },
  saveBtn: {
    flex: 1, minWidth: "150px", padding: "12px 16px", borderRadius: `${AD.radiusSm}px`,
    border: "none", background: "var(--eco-c9)", color: "#fff",
    fontSize: "13px", fontWeight: 850, cursor: "pointer", fontFamily: "inherit",
  },
  ghostBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "10px 14px", borderRadius: `${AD.radiusSm}px`, cursor: "pointer",
    border: `1px solid ${AD.line}`, background: AD.surfaceSolid,
    fontSize: "12px", fontWeight: 800, color: AD.inkSoft, fontFamily: "inherit",
  },
};
