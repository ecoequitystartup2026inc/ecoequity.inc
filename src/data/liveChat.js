import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// LIVE CHAT data layer — what the "Human agent" switch in AIChatInterface
// actually does, once it stops pretending.
//
// A live chat IS a support ticket. It lands in the same table the support form
// writes to, shows up in the same Admin Portal tab, and obeys the same RLS —
// the only difference is `channel = 'live'`, which tells the admin someone is
// sitting there with the window open rather than waiting on an email.
//
// The thread itself lives in `ticket_messages`, one row per message, and the
// browser watches it over Realtime. See supabase/live-chat.sql for why the
// thread is not appended into support_tickets.messages (both sides write
// within the same second, and a jsonb read-modify-write loses that race).
//
// Same two-mode contract as the rest of src/data: with Supabase configured
// these hit the database; without it every function returns null and the panel
// stays on its offline behaviour.
// ============================================================================

const TICKETS = "support_tickets";
const MESSAGES = "ticket_messages";

/**
 * Can we actually put this person through to a human?
 *
 * Signed in is not a nicety here. A guest has no row in `profiles`, so RLS has
 * no way to scope a ticket to them, and — more to the point — the admin would
 * have nobody to reply TO. Better to ask them to sign in than to open a
 * conversation that can only dead-end.
 *
 * Returns { ok } on success, or { ok: false, reason } the panel can say out
 * loud: 'offline' (no backend at all) or 'signed-out'.
 */
export async function isLiveChatAvailable() {
  if (!isSupabaseConfigured) return { ok: false, reason: "offline" };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "signed-out" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "offline" };
  }
}

/**
 * Start a conversation. Returns { id, ref, ticket } — `id` is the database
 * uuid every other call in this file needs, `ref` is the human-facing
 * 'TKT-123456', and `ticket` is the app-shaped record for React state.
 *
 * The `data` payload deliberately mirrors handleSupportTicketSubmit in App.js.
 * The Admin Portal renders tickets from those fields, and a live chat that
 * arrives with a blank name, category and priority looks broken next to a
 * form-filed one sitting beside it in the list.
 */
export async function openLiveChat({ subject, history = [] } = {}) {
  if (!isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // full_name is the display name the admin sees. It can legitimately be
  // missing on an account that never filled in a profile, so fall back to the
  // email rather than showing the admin an empty chip.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const ref = `TKT-${Date.now().toString().slice(-6)}`;
  const line = subject && subject.trim() ? subject.trim() : "Live chat request";

  const ticket = {
    id: ref,
    name: profile?.full_name || user.email || "Member",
    email: user.email || "",
    subject: line,
    category: "Live Chat",
    description: line,
    attachmentName: "No attachment",
    status: "Open",
    // Someone waiting in a chat window is not a normal-priority email. This is
    // what floats it to the top of the admin's queue.
    priority: "High",
    createdAt: new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    }),
    lastUpdate: "Just now",
    // What the member already said to the bot, so the agent opens the chat
    // knowing what has been tried instead of asking them to start again — the
    // single most irritating thing about being handed from a bot to a human.
    //
    // Stored on the ticket rather than as ticket_messages rows: these are not
    // messages in THIS conversation, nobody sent them to an agent, and mixing
    // them into the thread would make the transcript claim the agent was
    // present for a conversation they never saw. The agent portal renders them
    // as a separate, collapsed panel.
    //
    // Capped at the last 40 turns. A ticket row is not a log store, and an
    // afternoon of small talk with the bot is not context.
    aiHistory: (history || []).slice(-40).map((entry) => ({
      sender: entry.sender === "user" ? "member" : "ai",
      text: String(entry.text || "").slice(0, 2000),
    })).filter((entry) => entry.text),
  };

  const { data, error } = await supabase
    .from(TICKETS)
    .insert({
      user_id: user.id,
      subject: line,
      status: "Open",
      channel: "live",
      ref,
      data: ticket,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id, ref, ticket };
}

/**
 * "Do I already have a conversation?" — asked every time the panel opens.
 *
 * Returns null when there is nothing to resume, or the shape below, which is
 * everything the reopen prompt and the agent header need in one round trip:
 * who is on it now, who was on it before, whether they are at their desk, and
 * how far along the conversation is.
 *
 * Deliberately a single RPC and not a select. A member cannot read `profiles`
 * rows other than their own, so no query the browser is allowed to make can
 * turn agent_id into a name — see my_live_chat() in live-agent-flow.sql.
 */
export async function fetchMyLiveChat() {
  if (!isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("my_live_chat");
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    id: row.ticket_id,
    ref: row.ref || "",
    subject: row.subject || "",
    // pending | accepted | active | reassigned | closed | rejected
    liveStatus: row.live_status || "pending",
    statusAt: row.live_status_at || null,
    agentId: row.agent_id || null,
    agentName: row.agent_name || null,
    agentStatus: row.agent_status || "offline",
    // The claim AND the heartbeat. An agent who closed their laptop without
    // signing out reads offline here however 'available' their profile says.
    agentOnline: Boolean(row.agent_online),
    previousAgentId: row.previous_agent_id || null,
    previousAgentName: row.previous_agent_name || null,
    lastMessageAt: row.last_message_at || null,
    messageCount: Number(row.message_count || 0),
  };
}

/**
 * Close a conversation, or ask for it back. `status` is one of the lifecycle
 * words: a member may use 'closed' and 'pending' on their own chat; accepting,
 * rejecting and reassigning are the admin's, and the database refuses them
 * here rather than trusting this file to remember.
 *
 * Reopening goes back to 'pending' rather than straight to 'active': the agent
 * who was on it may be long gone, and quietly resuming a chat with somebody
 * who is not there is exactly the silence this feature exists to prevent.
 */
export async function setLiveStatus(ticketId, status) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { error } = await supabase.rpc("set_live_status", {
    p_ticket: ticketId,
    p_status: status,
  });
  if (error) throw error;
  return true;
}

/** The member has seen "your agent has changed". Stops the banner repeating. */
export async function ackHandover(ticketId) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { error } = await supabase.rpc("ack_live_handover", { p_ticket: ticketId });
  if (error) throw error;
  return true;
}

/**
 * The thread so far, oldest first. Called when the panel opens and again after
 * a reconnect — Realtime guarantees delivery only while the socket is up, so
 * anything said during a dropped connection is found by re-reading, not by
 * waiting for an event that already went past.
 */
export async function fetchTicketMessages(ticketId) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { data, error } = await supabase
    .from(MESSAGES)
    .select("id, sender, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(toMessage);
}

/**
 * Say something. `sender` is the role: 'member' from the chat panel, 'agent'
 * from the Admin Portal.
 *
 * Returns the stored message INCLUDING its id, and the caller should remember
 * that id. The sender's own Realtime subscription will hear this insert come
 * back a moment later, and matching on id is what stops the message appearing
 * twice in the window that sent it.
 */
export async function sendLiveMessage(ticketId, body, sender = "member") {
  if (!isSupabaseConfigured || !ticketId) return null;
  const text = (body || "").trim();
  if (!text) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from(MESSAGES)
    .insert({ ticket_id: ticketId, sender, sender_id: user.id, body: text })
    .select("id, sender, body, created_at")
    .single();

  if (error) throw error;
  // The ticket's status and last_sender are updated by the trigger in
  // supabase/live-chat.sql, not here — both ends of the conversation insert
  // messages, and a rule enforced in two places is enforced in neither.
  return toMessage(data);
}

/**
 * Watch a ticket's thread. `onMessage` fires for every INSERT, including the
 * caller's own — dedupe on `message.id` against what sendLiveMessage returned.
 *
 * Returns an unsubscribe function; call it from the effect's cleanup or the
 * socket stays open for a conversation nobody is looking at.
 */
export function subscribeToTicket(ticketId, onMessage) {
  if (!isSupabaseConfigured || !ticketId) return () => {};

  // Realtime applies the RLS policy from supabase/live-chat.sql to every row
  // before sending it, which it can only do if the socket is carrying the
  // user's token. supabase-js normally pushes it on sign-in, but a channel
  // opened in the same tick as a session restore can miss it and then sit
  // there silently receiving nothing — the worst failure mode there is,
  // because it looks exactly like "the agent has not replied yet".
  supabase.auth.getSession().then(({ data }) => {
    const token = data?.session?.access_token;
    if (token) supabase.realtime.setAuth(token);
  });

  const channel = supabase
    .channel(`ticket:${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: MESSAGES,
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => onMessage(toMessage(payload.new))
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// A database row as the chat panel wants it. `sender` stays the role rather
// than being mapped to the panel's 'user'/'agent' bubble names here, so the
// Admin Portal — where 'member' is the OTHER person — can use the same shape.
function toMessage(row) {
  return {
    id: row.id,
    sender: row.sender,
    text: row.body,
    createdAt: row.created_at,
  };
}
