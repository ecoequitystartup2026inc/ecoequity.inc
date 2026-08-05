import { supabase, isSupabaseConfigured } from "../supabaseClient";
import {
  currentUserId, fetchOwnRecords, insertRecord, updateRecord,
} from "./userRecords";

// ============================================================================
// ORDERS data layer.
//
// An order is saved in two places at once: the `orders` row (typed columns the
// database reasons about + the full record in `data`) and one `order_items` row
// per line, which is what makes "what was actually bought" queryable in SQL
// instead of only readable as the display string the app shows.
// ============================================================================

const TABLE = "orders";

// The app's own order record -> the typed columns on the row.
function orderColumns(order, userId) {
  return {
    buyer_id: userId,
    status: order.status || "Pending Approval",
    total: Number(order.total) || 0,
    promo_code: order.promoCode ?? null,
    shipping_address: order.address ?? null,
  };
}

export async function fetchMyOrders(userId) {
  return fetchOwnRecords(TABLE, "buyer_id", userId);
}

// Saves the order, then its line items. `lineItems` is attached by the checkout
// screens; without it the order still saves and order_items simply stays empty
// for that order rather than the whole write failing.
export async function saveOrder(order) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null; // logged out — RLS would reject the insert anyway

  await insertRecord(TABLE, order, orderColumns(order, userId));

  const lines = Array.isArray(order.lineItems) ? order.lineItems : [];
  if (!lines.length) return true;

  // order_items is keyed by the orders.id uuid, not our human ref, so read the
  // generated id back before inserting the lines.
  const { data: row, error: findErr } = await supabase
    .from(TABLE).select("id").eq("ref", String(order.id)).maybeSingle();
  if (findErr) throw findErr;
  if (!row) return true;

  const { error } = await supabase.from("order_items").insert(
    lines.map((it) => ({
      order_id: row.id,
      product_id: typeof it.product_id === "string" ? it.product_id : null,
      name: it.name,
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
    })),
  );
  if (error) throw error;
  return true;
}

// Status changes, rider assignment, admin edits. The RLS policies added in
// user-data.sql are what let this through: the buyer for their own order, an
// admin for any of them.
export async function updateOrder(order) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return updateRecord(TABLE, order, {
    status: order.status || "Pending Approval",
    total: Number(order.total) || 0,
  });
}
