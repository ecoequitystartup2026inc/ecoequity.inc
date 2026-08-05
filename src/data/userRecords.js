import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// Shared plumbing for USER-GENERATED records (orders, support tickets, forum
// posts, plant scans).
//
// These differ from products.js in one important way. A product is admin-owned
// and fully typed, so it maps column-for-column. A user record is produced by a
// React form that grows fields over time, so each table carries:
//   ref   -> the app's own id ("ORD-2026-1234"), used to dedupe on reload
//   data  -> the whole app record as jsonb, so no field is ever dropped
// plus the typed columns the DATABASE needs: the owner id (every RLS policy
// reads it), status, total, created_at. See supabase/user-data.sql.
//
// Same two-mode contract as the rest of the data layer: with Supabase
// configured these hit the real database; without it they return null and the
// caller keeps whatever it already has in React state.
// ============================================================================

// The signed-in user's id, or null. Every write needs it — the insert policies
// all require the owner column to equal auth.uid(), so a write attempted while
// logged out would be rejected by RLS rather than saved.
export async function currentUserId() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user ? user.id : null;
}

// Read back the rows this user owns, newest first, as the app-shaped records
// that were stored in `data`. Rows written before `data` existed fall back to
// an empty object so a legacy row can never crash the page.
export async function fetchOwnRecords(table, ownerColumn, userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from(table)
    .select("ref, data, created_at")
    .eq(ownerColumn, userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!Array.isArray(data)) return null;
  return data.map((row) => ({ ...(row.data || {}), id: row.data?.id ?? row.ref }));
}

// Public reads (forum): everyone's rows, not just the caller's.
export async function fetchAllRecords(table) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from(table)
    .select("ref, data, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!Array.isArray(data)) return null;
  return data.map((row) => ({ ...(row.data || {}), id: row.data?.id ?? row.ref }));
}

// Insert one record. `columns` is whatever typed columns this table needs
// beyond ref/data (owner id, status, total…). Returns null when not configured
// or not signed in, so callers can fire-and-forget without branching.
export async function insertRecord(table, record, columns) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase
    .from(table)
    .insert({ ...columns, ref: String(record.id), data: record });
  if (error) throw error;
  return true;
}

// Update the stored copy of a record the app has already changed in state
// (an admin approving an order, a user liking a forum post). Matched on `ref`
// because that is the id the React code carries around.
export async function updateRecord(table, record, columns) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase
    .from(table)
    .update({ ...columns, data: record })
    .eq("ref", String(record.id));
  if (error) throw error;
  return true;
}

export async function deleteRecord(table, id) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.from(table).delete().eq("ref", String(id));
  if (error) throw error;
  return true;
}
