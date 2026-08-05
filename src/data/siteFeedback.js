import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { currentUserId, insertRecord } from "./userRecords";

// ============================================================================
// SITE FEEDBACK data layer — the star-rating panel beside the support and AI
// Chat buttons (SiteFeedbackWidget.js). This is feedback about the APP itself;
// product reviews are separate and live in data/products.js.
//
// One thing here is deliberately unlike orders/tickets/forum posts: a GUEST can
// send feedback. Those tables all bail out when currentUserId() returns null,
// because their RLS insert policies require the owner column to equal
// auth.uid(). site_feedback instead accepts a null user_id (see feedback_insert
// in schema.sql), so a signed-out visitor's rating still reaches the database.
// ============================================================================

const TABLE = "site_feedback";

// The widget's entry -> the typed columns. `data` keeps the whole record, so a
// new field on the form needs no schema change.
function feedbackColumns(entry, userId) {
  return {
    user_id: userId,                                   // null for a guest
    user_name: entry.user || "Guest",
    rating: Number(entry.rating) || 0,
    topics: Array.isArray(entry.topics) ? entry.topics : [],
    comment: entry.comment || "",
    page: entry.page || "",
  };
}

export async function saveFeedback(entry) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();               // null when signed out
  return insertRecord(TABLE, entry, feedbackColumns(entry, userId));
}

// Admin read: everyone's feedback, newest first. A non-admin gets only their
// own rows back — feedback_read in schema.sql decides that, not this query.
export async function fetchAllFeedback() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select("ref, data, rating, comment, page, user_name, topics, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!Array.isArray(data)) return null;
  // `data` is the app-shaped record; the typed columns are the fallback for a
  // row written by hand in the Supabase dashboard, which has no `data`.
  return data.map((row) => ({
    id: row.data?.id ?? row.ref,
    rating: row.rating,
    topics: row.topics || [],
    comment: row.comment || "",
    page: row.page || "",
    user: row.user_name || "Guest",
    date: row.created_at,
    ...(row.data || {}),
  }));
}
