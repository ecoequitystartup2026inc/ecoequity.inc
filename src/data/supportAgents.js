import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// SUPPORT AGENTS data layer — the admin half of the live chat.
//
// src/data/liveChat.js is the MEMBER's side: open a chat, send, subscribe.
// This file is the other end — who can take a chat, who is at their desk, and
// handing a waiting member to one of them. Both talk to the same two tables;
// see supabase/support-agents.sql for why the roster is a flag on `profiles`.
//
// Everything that changes rights or ownership goes through an RPC rather than
// an update() from here. `assign_ticket` is three writes that must not
// half-happen, and `set_agent` is a privilege change the client must not be
// trusted with — putting them in SQL means the rule holds even when the call
// comes from somewhere that isn't this file.
//
// Same two-mode contract as the rest of src/data: with Supabase configured
// these hit the database, without it they return empty and the portal shows
// its offline state instead of erroring.
// ============================================================================

const TICKETS = "support_tickets";

/**
 * The live queue: every chat on the 'live' channel, most recently spoken on
 * first. Admin-only in practice — RLS returns a member their own chats and
 * nothing else, which is harmless but not useful.
 *
 * Deliberately its own query rather than a filter over the `supportTickets`
 * prop. That list is seeded from localStorage and topped up with
 * fetchMyTickets(), which is scoped to `user_id = auth.uid()` — the admin's
 * OWN tickets. A live chat opened by a member has never been in it.
 */
export async function fetchLiveQueue() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from(TICKETS)
    .select(`
      id, ref, subject, status, agent_id, user_id,
      live_status, live_status_at, previous_agent_id,
      last_message_at, last_sender, created_at, data,
      agent:profiles!support_tickets_agent_id_fkey ( id, full_name ),
      previous_agent:profiles!support_tickets_previous_agent_id_fkey ( id, full_name )
    `)
    .eq("channel", "live")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) throw error;
  return (data || []).map(toQueueRow);
}

/**
 * An agent's own inbox: the chats assigned to them, the ones waiting on a
 * reply first. Served by support_tickets_agent_idx — the live queue's index
 * leads on `channel` and cannot help a scan filtered by agent.
 *
 * Closed and declined chats are left out. An agent's inbox is a to-do list,
 * and a to-do list that keeps everything ever finished is not one.
 */
export async function fetchMyAssignedChats() {
  if (!isSupabaseConfigured) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from(TICKETS)
    .select(`
      id, ref, subject, status, agent_id, user_id,
      live_status, live_status_at, previous_agent_id,
      last_message_at, last_sender, created_at, data
    `)
    .eq("channel", "live")
    .eq("agent_id", user.id)
    .not("live_status", "in", '("closed","rejected")')
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) throw error;

  return (data || [])
    .map(toQueueRow)
    // Waiting-on-us first, then oldest wait at the top of that group: the
    // person who has been ignored longest is the one to answer next.
    .sort((a, b) => {
      if (a.waitingOnUs !== b.waitingOnUs) return a.waitingOnUs ? -1 : 1;
      return new Date(a.lastMessageAt || 0) - new Date(b.lastMessageAt || 0);
    });
}

/**
 * The roster, for the assign picker. Reads the `available_agents` view, which
 * is where the "claimed status AND recent heartbeat" rule lives — a laptop
 * closed without clicking 'offline' has is_available false here even though
 * agent_status still says 'available'.
 *
 * Sorted so the admin's eye lands on somebody who can actually take the chat:
 * available first, then by how many they are already juggling.
 */
export async function fetchAgents() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("available_agents")
    .select("id, full_name, profile_pic, agent_status, agent_seen_at, is_available, open_chats");

  if (error) throw error;

  return (data || [])
    .map((row) => ({
      id: row.id,
      name: row.full_name || "Unnamed agent",
      avatar: row.profile_pic || null,
      status: row.agent_status || "offline",
      available: Boolean(row.is_available),
      openChats: Number(row.open_chats || 0),
    }))
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.openChats !== b.openChats) return a.openChats - b.openChats;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Hand this chat to this agent. Moves the ticket to 'In Review' and posts the
 * "… has joined the chat" line into the thread, both inside one transaction.
 *
 * That posted line is also how the MEMBER finds out: their panel is already
 * subscribed to this ticket's messages, so the handoff arrives on the socket
 * they already have. Nothing here needs to notify them separately.
 */
export async function assignTicket(ticketId, agentId) {
  if (!isSupabaseConfigured || !ticketId || !agentId) return null;
  const { error } = await supabase.rpc("assign_ticket", {
    p_ticket: ticketId,
    p_agent: agentId,
  });
  if (error) throw error;
  return true;
}

/**
 * Take a pending request, or turn it away. Both are the admin's decision and
 * both are refused by the database for anyone else — see set_live_status().
 *
 * Accepting without naming an agent is allowed on purpose: it is the admin
 * saying "we have got this" to somebody who has been staring at a queue
 * message, which is worth being able to do in one click before working out who
 * is free. Assigning implies acceptance, so the two-step is optional.
 */
export async function acceptTicket(ticketId) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { error } = await supabase.rpc("set_live_status", {
    p_ticket: ticketId, p_status: "accepted",
  });
  if (error) throw error;
  return true;
}

export async function rejectTicket(ticketId) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { error } = await supabase.rpc("set_live_status", {
    p_ticket: ticketId, p_status: "rejected",
  });
  if (error) throw error;
  return true;
}

/**
 * End a chat. Goes through set_live_status rather than updating `status`
 * directly, because a live chat has two of them — the admin's ticket status
 * and the member-facing lifecycle — and moving one without the other leaves a
 * conversation that reads as Resolved on one screen and still open on the
 * other. The RPC moves both.
 *
 * A live chat with no way to end it clogs the queue forever, which is why this
 * exists before any of the nicer ticket-management ideas.
 */
export async function closeLiveChat(ticketId) {
  if (!isSupabaseConfigured || !ticketId) return null;
  const { error } = await supabase.rpc("set_live_status", {
    p_ticket: ticketId, p_status: "closed",
  });
  if (error) throw error;
  return true;
}

/**
 * "I am here." Called on a timer by whatever screen an agent is sitting on.
 *
 * Pass a status to change it, or nothing to just re-assert presence. The
 * two-minute grace in the view means this must fire well inside that — every
 * 60s — or one dropped request reads as the agent walking away.
 *
 * Returns false rather than throwing when the account is not an agent: every
 * signed-in admin screen may call this on a timer, and a member's console
 * should not fill with errors for a heartbeat that was never theirs to send.
 */
export async function agentHeartbeat(status) {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.rpc("agent_heartbeat", {
    p_status: status || null,
  });
  return !error;
}

/** Am I an agent, and what did I last say I was? For the availability switch. */
export async function fetchMyAgentState() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("is_agent, agent_status, full_name, profile_pic")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return {
    id: user.id,
    isAgent: Boolean(data?.is_agent),
    status: data?.agent_status || "offline",
    name: data?.full_name || "",
    photo: data?.profile_pic || null,
    email: user.email || "",
  };
}

/**
 * The agent's own name and photo.
 *
 * Not a vanity setting: `full_name` is what assign_ticket stamps into "Maria
 * has joined the chat" and what the member's panel shows in its header for the
 * rest of the conversation. An agent editing this is editing how they are
 * introduced to customers, which is why it belongs in their portal rather than
 * being something they have to ask an admin to change.
 *
 * A plain update — profiles_update in schema.sql already scopes writes to
 * `id = auth.uid()`, and neither column is guarded, so no RPC is needed.
 */
export async function saveAgentProfile({ name, photo } = {}) {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const patch = {};
  if (typeof name === "string") patch.full_name = name.trim();
  // `undefined` means "leave it alone"; `null` means "remove the photo". A
  // single falsy check would conflate the two and silently clear the avatar
  // every time somebody renamed themselves.
  if (photo !== undefined) patch.profile_pic = photo;
  if (Object.keys(patch).length === 0) return null;

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
  return true;
}

// A queue row as the portal wants it. `data` is the app-shaped ticket written
// by openLiveChat() — the member's name and email live there, so the queue
// needs no join to `profiles` for the customer side.
function toQueueRow(row) {
  const shape = row.data || {};
  return {
    id: row.id,                       // uuid — what assignTicket and the thread need
    ref: row.ref || shape.id || "",   // 'TKT-123456' — what a human quotes
    subject: row.subject || shape.subject || "Live chat",
    status: row.status || "Open",
    // The member-facing lifecycle, which is not the same question as `status`:
    // pending | accepted | active | reassigned | closed | rejected.
    liveStatus: row.live_status || "pending",
    statusAt: row.live_status_at || null,
    memberName: shape.name || "Member",
    memberEmail: shape.email || "",
    agentId: row.agent_id || null,
    agentName: row.agent?.full_name || null,
    previousAgentName: row.previous_agent?.full_name || null,
    // What the member said to the bot before asking for a person. Written by
    // openLiveChat at escalation; empty for a chat opened any other way.
    aiHistory: Array.isArray(shape.aiHistory) ? shape.aiHistory : [],
    lastMessageAt: row.last_message_at || row.created_at || null,
    // 'member' means they spoke last and are waiting on us. This is the whole
    // reason the column is denormalised onto the ticket — see live-chat.sql.
    waitingOnUs: row.last_sender === "member" || row.last_sender == null,
  };
}
