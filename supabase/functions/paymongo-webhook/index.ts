// ============================================================================
// Edge Function: paymongo-webhook
// PayMongo calls this when a payment succeeds/fails. This is the SOURCE OF
// TRUTH that flips an order to "paid" — never trust the browser for that.
//
// Deploy:  supabase functions deploy paymongo-webhook --no-verify-jwt
//          (PayMongo can't send a Supabase JWT, so JWT verification is OFF;
//           we verify authenticity with the PayMongo signature below.)
// Secrets: supabase secrets set PAYMONGO_WEBHOOK_SECRET=whsk_xxx
//
// Register the webhook URL once in the PayMongo dashboard (or via API):
//   https://YOUR-PROJECT.supabase.co/functions/v1/paymongo-webhook
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("PAYMONGO_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const raw = await req.text();

  // --- Verify the signature so only PayMongo can flip orders to paid. ---
  const sigHeader = req.headers.get("Paymongo-Signature") ?? "";
  const valid = await verifySignature(raw, sigHeader, WEBHOOK_SECRET);
  if (!valid) return new Response("Invalid signature", { status: 401 });

  const event = JSON.parse(raw);
  const type = event?.data?.attributes?.type; // e.g. "payment.paid"
  const payment = event?.data?.attributes?.data;
  const metadata = payment?.attributes?.metadata ?? {};

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // bypasses RLS
  );

  if (type === "payment.paid") {
    if (metadata.order_id) {
      await supabase.from("orders")
        .update({ status: "paid" })
        .eq("id", metadata.order_id);
    }
    // Subscription payments carry a plan in metadata instead of an order.
    if (metadata.subscription_plan && metadata.user_id) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await supabase.from("subscriptions").upsert({
        user_id: metadata.user_id,
        plan: metadata.subscription_plan,
        status: "active",
        payment_ref: payment?.id,
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: "user_id,plan" });
    }
  } else if (type === "payment.failed" && metadata.order_id) {
    await supabase.from("orders")
      .update({ status: "payment_failed" })
      .eq("id", metadata.order_id);
  }

  return new Response("ok", { status: 200 });
});

// PayMongo signature header: "t=<timestamp>,te=<sig>" (test) / "li=<sig>" (live).
// Signed value is HMAC-SHA256 of `${t}.${rawBody}` using the webhook secret.
async function verifySignature(payload: string, header: string, secret: string) {
  try {
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
    const t = parts["t"];
    const sig = parts["te"] || parts["li"];
    if (!t || !sig) return false;

    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const mac = await crypto.subtle.sign(
      "HMAC", key, new TextEncoder().encode(`${t}.${payload}`),
    );
    const expected = [...new Uint8Array(mac)]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
    return expected === sig;
  } catch {
    return false;
  }
}
