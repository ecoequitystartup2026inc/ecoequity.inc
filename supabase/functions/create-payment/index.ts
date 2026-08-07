// ============================================================================
// Edge Function: create-payment
// Creates a PayMongo Checkout Session for a marketplace order and returns the
// hosted checkout URL. Runs SERVER-SIDE so the PayMongo SECRET key is never
// exposed to the browser.
//
// Deploy:  supabase functions deploy create-payment --no-verify-jwt=false
// Secrets: supabase secrets set PAYMONGO_SECRET_KEY=sk_test_xxx
//          (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically)
//
// Request body, one of:
//   ORDER:        { items: [{ name, qty, price }], orderId, successUrl, cancelUrl }
//   SUBSCRIPTION: { plan: { id, name, price }, successUrl, cancelUrl }
// Response:       { checkoutUrl, paymentRef }
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYMONGO_SECRET = Deno.env.get("PAYMONGO_SECRET_KEY")!;
const PAYMONGO_API = "https://api.paymongo.com/v1/checkout_sessions";

// supabase-js `functions.invoke` sends x-client-info and apikey alongside the
// auth header. Omit either and the browser fails the preflight, so the request
// never reaches the function — which looks exactly like the function being
// broken, except nothing appears in its logs.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { items, orderId, plan, successUrl, cancelUrl } = await req.json();

    // Verify the caller is a logged-in user (JWT forwarded by the client).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Two kinds of checkout share this function. A subscription has no order
    // row; the webhook tells them apart by which metadata key is present, so
    // exactly one of order_id / subscription_plan must be set.
    const isSubscription = Boolean(plan?.id);

    if (isSubscription && !(Number(plan.price) > 0)) {
      return json({ error: "Plan price must be a positive number" }, 400);
    }

    // Build PayMongo line items. Amounts are in CENTAVOS (price * 100).
    const line_items = isSubscription
      ? [{
        name: String(plan.name ?? plan.id),
        quantity: 1,
        amount: Math.round(Number(plan.price) * 100),
        currency: "PHP",
      }]
      : (items ?? []).map((it: any) => ({
        name: String(it.name),
        quantity: Number(it.qty) || 1,
        amount: Math.round(Number(it.price) * 100),
        currency: "PHP",
      }));

    if (line_items.length === 0) {
      return json({ error: "Nothing to charge" }, 400);
    }

    const metadata = isSubscription
      ? { subscription_plan: String(plan.id), user_id: user.id }
      : { order_id: orderId, user_id: user.id };

    const description = isSubscription
      ? `EcoEquity subscription — ${plan.name ?? plan.id}`
      : `EcoEquity order ${orderId}`;

    const res = await fetch(PAYMONGO_API, {
      method: "POST",
      headers: {
        // PayMongo uses HTTP Basic auth: base64(secretKey + ":")
        Authorization: `Basic ${btoa(PAYMONGO_SECRET + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items,
            payment_method_types: ["gcash", "paymaya", "grab_pay", "card"],
            success_url: successUrl,
            cancel_url: cancelUrl,
            // Echoed back on the webhook so we can match the payment to the
            // order (or to the subscriber).
            metadata,
            description,
          },
        },
      }),
    });

    const body = await res.json();
    if (!res.ok) return json({ error: "PayMongo error", details: body }, 502);

    const checkoutUrl = body.data?.attributes?.checkout_url;
    const paymentRef = body.data?.id;

    // Record the PayMongo reference on the order (status stays pending_payment
    // until the webhook confirms). Service role bypasses RLS. Subscriptions
    // have no row to stamp yet — the webhook creates it once payment lands, so
    // an abandoned checkout leaves nothing behind.
    if (!isSubscription) {
      await supabase.from("orders").update({ payment_ref: paymentRef }).eq("id", orderId);
    }

    return json({ checkoutUrl, paymentRef });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
