import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// AGENT INVITATIONS data layer — the Admin Portal's Agents panel.
//
// Two different transports, and the split is not arbitrary:
//
//   * READING the roster is an RPC (admin_agent_roster). It joins the
//     invitation list to profiles and works out active/offline from the
//     heartbeat, which has to happen against the DATABASE's clock — a browser
//     computing "seen in the last two minutes" against its own gets it wrong
//     on every machine with a skewed one.
//
//   * SENDING an invitation is an Edge Function. Creating an auth user and
//     mailing a set-password link is `auth.admin`, which needs the service
//     role key, which must never exist in a browser bundle.
//
// Revoking goes through the function too, so every write to the roster passes
// the same admin check in the same place.
// ============================================================================

const FUNCTION = "invite-agent";

/**
 * The full staff list: pending invitations, working agents, and people who
 * were switched off. `state` is one of 'pending' | 'active' | 'offline' |
 * 'disabled' — see admin_agent_roster() in supabase/agent-invites.sql.
 */
export async function fetchAgentRoster() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase.rpc("admin_agent_roster");
  if (error) throw error;

  return (data || []).map((row) => ({
    email: row.email,
    name: row.full_name || "",
    state: row.state || "pending",
    agentStatus: row.agent_status || "offline",
    userId: row.user_id || null,
    openChats: Number(row.open_chats || 0),
    invitedAt: row.invited_at || null,
    lastSeenAt: row.last_seen_at || null,
  }));
}

/**
 * Invite somebody, resend their invitation, or withdraw it.
 *
 * `action` is 'invite' | 'resend' | 'revoke'. Invite and resend are the same
 * call to Supabase Auth — it mints a fresh single-use link either way, and
 * pretending they are different operations would mean storing a token of our
 * own to re-send, which is a token that can leak.
 *
 * Errors are thrown with the server's own message rather than a friendly
 * substitute. The common failure is email rate limiting on a project with no
 * SMTP configured, and "could not send invitation" would send an admin looking
 * at their agent list instead of their mail settings.
 */
export async function inviteAgent({ email, name = "", action = "invite" }) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured — invitations need the backend.");
  }

  const { data, error } = await supabase.functions.invoke(FUNCTION, {
    body: {
      action,
      email: String(email || "").trim().toLowerCase(),
      full_name: name.trim(),
      // Where the link drops them after they set a password. Their own origin,
      // so an invite sent from a staging site does not land them on production.
      redirect_to: typeof window !== "undefined" ? window.location.origin : "",
    },
  });

  // functions.invoke reports HTTP failures through `error` but keeps the body
  // out of it, and the body is where the reason is. Read both.
  if (error) {
    let detail = "";
    try { detail = (await error.context?.json())?.error || ""; } catch { /* not json */ }
    throw new Error(detail || error.message || "Could not send the invitation.");
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

/** Switch an accepted agent off, or back on, without touching their history. */
export async function setAgentEnabled(email, enabled) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.rpc("set_agent_enabled", {
    p_email: String(email || "").trim().toLowerCase(),
    p_enabled: enabled,
  });
  if (error) throw error;
  return true;
}
