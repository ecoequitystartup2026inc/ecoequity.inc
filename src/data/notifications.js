import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { MEMBER_NOTIFICATION_DEFAULTS } from "./platformUsers";

// ============================================================================
// NOTIFICATIONS data layer — the two switches in Account Settings, and the
// call that actually sends something.
//
// Same two-mode contract as the rest of src/data: with Supabase configured
// these hit the real database and the `notify` Edge Function; without it they
// return null and the caller keeps whatever it has in React state (the app
// still runs offline on its sample data, it just cannot send anything).
//
// The switches live on `profiles`, not in localStorage, because the thing that
// reads them is the Edge Function at send time — see supabase/notifications.sql.
// ============================================================================

/**
 * The signed-in member's channel switches, or null when there is no database
 * or nobody is signed in. Shape matches MEMBER_NOTIFICATION_DEFAULTS.
 */
export async function fetchNotificationPrefs() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("notify_email, notify_sms")
    .eq("id", user.id)
    .maybeSingle();
  // The columns arrive with supabase/notifications.sql. Before it is run the
  // select 404s on the column, which is a setup step outstanding rather than a
  // broken page — fall back to the defaults and let the app carry on.
  if (error || !data) return null;

  return {
    email: data.notify_email !== false,
    sms: data.notify_sms === true,
  };
}

/**
 * Persist the switches. Throws on failure so the caller can put the toggle
 * back where it was — a switch that springs back is honest, one that stays
 * flipped after a failed write is a lie.
 */
export async function saveNotificationPrefs(prefs) {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const next = { ...MEMBER_NOTIFICATION_DEFAULTS, ...(prefs || {}) };
  const { error } = await supabase
    .from("profiles")
    .update({ notify_email: next.email === true, notify_sms: next.sms === true })
    .eq("id", user.id);
  if (error) throw error;
  return true;
}

/**
 * Send one notification through the `notify` Edge Function.
 *
 * Deliberately fire-and-forget for callers who do not care: it resolves to null
 * when there is no backend, and the FUNCTION decides which channels actually
 * go out by reading the recipient's switches. Callers must not pre-filter on a
 * cached copy of the preference — that is how people get mail they turned off.
 *
 * Resolves to { email: {status, detail}, sms: {...} }. A resolved promise does
 * not mean anything was delivered; check the per-channel status.
 */
export async function notifyUser({ to, event = "message", subject, message, sms }) {
  if (!isSupabaseConfigured || !to || !subject || !message) return null;
  const { data, error } = await supabase.functions.invoke("notify", {
    body: { to, event, subject, message, sms },
  });
  if (error) throw error;
  return data;
}

/**
 * What was sent to the signed-in member, newest first. Powers nothing yet —
 * it is here so "did that order email actually go out?" is answerable from the
 * app rather than from the Supabase dashboard.
 */
export async function fetchMyNotificationLog(limit = 20) {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("notification_log")
    .select("channel, event, subject, status, detail, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return null;
  return data || [];
}

// ---------------------------------------------------------------------------
// Message builders. The wording lives here, next to the sender, so an order
// email and an order SMS cannot drift apart — and so changing the copy is one
// edit rather than a hunt through AdminPortal.
// ---------------------------------------------------------------------------

/** What the member is told when an admin moves their order. */
export function orderStatusMessage(order, status) {
  const ref = order?.id ?? "your order";
  const line = {
    "Approved": `Good news — order ${ref} has been approved and is being prepared for delivery.`,
    "Processing": `Order ${ref} is being packed now.`,
    "Out for Delivery": `Order ${ref} is out for delivery and on its way to you.`,
    "Delivered": `Order ${ref} has been delivered. Thank you for supporting local growers!`,
    "Disapproved": `Order ${ref} could not be approved. Reply to this message and we will sort it out.`,
    "Cancelled": `Order ${ref} has been cancelled. Any payment made will be returned.`,
  }[status] ?? `Order ${ref} is now marked "${status}".`;

  return {
    event: "order_status",
    subject: `Order ${ref} — ${status}`,
    message: `${line}\n\nYou can follow it any time under Order History in your EcoEquity account.`,
    sms: `EcoEquity: ${line}`,
  };
}

/** What the member is told when support answers their ticket. */
export function ticketReplyMessage(ticket, reply) {
  const ref = ticket?.id ?? "your ticket";
  const subjectLine = ticket?.subject ? ` (${ticket.subject})` : "";
  const body = String(reply ?? "").trim();
  return {
    event: "ticket_reply",
    subject: `Support replied to ${ref}${subjectLine}`,
    message: `Our support team has replied to your ticket ${ref}:\n\n${body}\n\nOpen Support Tickets in your EcoEquity account to reply.`,
    sms: `EcoEquity support replied to ticket ${ref}. Open the app to read it.`,
  };
}
