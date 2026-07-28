import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// CHECKOUT data layer — creates an order row, then asks the create-payment
// Edge Function for a PayMongo checkout URL, then redirects the buyer there.
// The order only becomes "paid" when the webhook fires (see paymongo-webhook).
// ============================================================================

// items: [{ product_id, name, qty, price }]
export async function startCheckout({ items, total, promoCode, shippingAddress }) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in to check out");

  // 1) Create the order (status defaults to 'pending_payment').
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      total,
      promo_code: promoCode ?? null,
      shipping_address: shippingAddress ?? null,
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // 2) Save the line items.
  const { error: itemsErr } = await supabase.from("order_items").insert(
    items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id ?? null,
      name: it.name,
      qty: it.qty,
      price: it.price,
    })),
  );
  if (itemsErr) throw itemsErr;

  // 3) Ask the Edge Function for a PayMongo checkout URL.
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: {
      items,
      orderId: order.id,
      successUrl: `${window.location.origin}/?payment=success&order=${order.id}`,
      cancelUrl: `${window.location.origin}/?payment=cancelled&order=${order.id}`,
    },
  });
  if (error) throw error;

  // 4) Redirect the buyer to PayMongo's hosted checkout (GCash/Maya/card).
  window.location.href = data.checkoutUrl;
}

// Poll an order's status after returning from checkout (success page).
export async function getOrderStatus(orderId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data.status;
}
