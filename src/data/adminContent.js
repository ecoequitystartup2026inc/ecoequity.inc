import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// ADMIN-AUTHORED CONTENT data layer.
//
// Follows the same two-mode contract as data/products.js — the reference
// pattern: with Supabase configured these hit the real database, without it
// they return null and the caller keeps its existing sample data. That is what
// lets the app keep running before any keys are set.
//
// The difference from products.js is granularity. App.js holds each of these
// entities as one whole array/object in state and replaces it wholesale on
// every edit, so the DB writes are whole-collection saves rather than per-row
// create/update/delete. Writes are admin-only at the RLS layer (see
// schema.sql); a non-admin session simply gets nothing back.
// ============================================================================

// --- Singleton config objects (site_config) --------------------------------

export async function fetchConfig(key) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null; // null = never saved; caller keeps its default
}

export async function saveConfig(key, value) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase
    .from("site_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
  return true;
}

// --- Admin-managed lists (one real table each) ------------------------------
//
// These used to share a single `admin_content` table, discriminated by a
// `collection` text column, which made every feature look identical in the
// Supabase dashboard — a wall of anonymous jsonb. Each collection is now its
// own table with real, typed, browsable columns.
//
// The app still writes the whole React record into `data`; a trigger on each
// table projects the interesting fields out of that jsonb into the typed
// columns (see supabase/schema.sql). So `data` stays the source of truth — a
// form can gain a field without a migration — and the typed columns are the
// queryable view of it.
//
// The collection NAME stays the app's vocabulary so callers don't change; this
// map is the only place that knows the table it lives in.
const COLLECTION_TABLES = {
  advisors: "advisors",
  cert_courses: "cert_courses",
  content_items: "content_items",
  deliveries: "deliveries",
  riders: "riders",
  subscription_plans: "subscription_plans",
  plant_diseases: "plant_diseases",
  admin_events: "events",
  admin_harvests: "harvests",
  admin_promo_codes: "promo_codes",
  broadcasts: "broadcasts",
  platform_users: "platform_members",
  transactions: "transactions",
  subscribers: "subscribers",
  surplus_listings: "surplus_listings",
  surplus_demands: "surplus_demands",
};

// The collections whose rows carry personal data (emails, addresses, payment
// references). RLS restricts these to admins, so a customer's session reads
// back nothing — which must not be mistaken for "the admin cleared this list".
// App.js only loads them from an admin session; exported so it can tell.
export const ADMIN_ONLY_COLLECTIONS = [
  "platform_users",
  "transactions",
  "subscribers",
];

function tableFor(collection) {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown admin collection: ${collection}`);
  return table;
}

// Returns the collection in its stored order, or null when Supabase is off.
// An empty array means "the admin has saved this collection and it is empty" —
// distinct from null, so callers can tell "not configured" from "deliberately
// cleared" and only fall back to seed data for the former.
export async function fetchCollection(collection) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from(tableFor(collection))
    .select("data, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  // A null payload with no error means the query returned nothing usable —
  // treat it as "not configured" rather than an empty (site-blanking) result.
  if (!Array.isArray(data)) return null;
  return data.map((row) => row.data);
}

// Whole-collection replace, matching how App.js manages these in state.
// Delete-then-insert inside one call keeps ordering authoritative and avoids
// having to diff the array. Collections here are small (tens of rows).
export async function saveCollection(collection, items) {
  if (!isSupabaseConfigured) return null;
  const table = tableFor(collection);

  // No `.eq()` to scope the delete any more — the table IS the collection.
  // PostgREST refuses an unfiltered delete, so match on a column every row has.
  const { error: delError } = await supabase
    .from(table)
    .delete()
    .not("id", "is", null);
  if (delError) throw delError;

  if (!items || items.length === 0) return true;

  const rows = items.map((item, idx) => ({
    data: item,
    sort_order: idx,
    updated_at: new Date().toISOString(),
  }));
  const { error: insError } = await supabase.from(table).insert(rows);
  if (insError) throw insError;
  return true;
}
