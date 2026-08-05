import { isSupabaseConfigured } from "../supabaseClient";
import {
  currentUserId, fetchOwnRecords, insertRecord, updateRecord,
} from "./userRecords";

// ============================================================================
// SUPPORT TICKETS data layer.
//
// `messages` in schema.sql is the reply thread; the ticket's own fields
// (category, priority, attachment name) live in `data`. RLS gives a member
// their own tickets and an admin all of them, so the same read works for both.
// ============================================================================

const TABLE = "support_tickets";

function ticketColumns(ticket, userId) {
  return {
    user_id: userId,
    subject: ticket.subject || "",
    status: ticket.status || "Open",
    messages: Array.isArray(ticket.messages) ? ticket.messages : [],
  };
}

export async function fetchMyTickets(userId) {
  return fetchOwnRecords(TABLE, "user_id", userId);
}

export async function saveTicket(ticket) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return insertRecord(TABLE, ticket, ticketColumns(ticket, userId));
}

// Admin replies and status moves (Open -> In Progress -> Resolved).
export async function updateTicket(ticket) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return updateRecord(TABLE, ticket, {
    status: ticket.status || "Open",
    messages: Array.isArray(ticket.messages) ? ticket.messages : [],
  });
}
