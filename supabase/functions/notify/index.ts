// ============================================================================
// Edge Function: notify
// Sends one notification to one member, on the channels they have switched on
// in Account Settings → Notifications.
//
// Runs SERVER-SIDE for two reasons, both non-negotiable:
//   1. the provider API keys never reach the browser bundle
//   2. the preference is READ HERE. A client that decides for itself whether
//      to send has not implemented a preference, it has implemented a request.
//
// Providers are a config switch, not a rewrite:
//   supabase secrets set RESEND_API_KEY=re_...  NOTIFY_FROM="EcoEquity <onboarding@resend.dev>"
//   supabase secrets set SMS_PROVIDER=semaphore SEMAPHORE_API_KEY=...   (Philippines)
//   supabase secrets set SMS_PROVIDER=twilio    TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM=+1...
//
// With NO keys set the function still works: it resolves the recipient, honours
// the switches, and writes status='skipped' to notification_log with the reason.
// That is deliberate — the whole feature is testable before a single peso of
// provider spend, and turning it live later is a secret, not a deploy.
//
// Deploy:  supabase functions deploy notify
// Prereq:  run supabase/notifications.sql first
//
// Request body: { to: "member@example.com", event, subject, message, sms? }
//   to      — the recipient's email address; also how their account is found
//   event   — short slug for the log ('order_status', 'ticket_reply', 'test')
//   subject — email subject line
//   message — the body; used for email and, trimmed, for SMS
//   sms     — optional shorter text for the 160-char channel
//
// Response: { email: {status, detail}, sms: {status, detail} }
//   status is 'sent' | 'skipped' | 'failed' per channel. A 200 does NOT mean
//   both went out — read the per-channel status.
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Resend's shared sender works with no domain setup, so testing needs nothing
// but the API key. Swap for your own verified domain before production or the
// mail lands in spam.
const FROM = Deno.env.get("NOTIFY_FROM") ?? "EcoEquity <onboarding@resend.dev>";

const SMS_PROVIDER = (Deno.env.get("SMS_PROVIDER") ?? "").toLowerCase();

// Semaphore is the default suggestion because it is Philippine-domestic, sells
// credits without a subscription, and does not require the sender-ID paperwork
// Twilio does for PH numbers. Twilio is there for anyone already on it.
const SEMAPHORE_KEY = Deno.env.get("SEMAPHORE_API_KEY") ?? "";
const SEMAPHORE_SENDER = Deno.env.get("SEMAPHORE_SENDER_NAME") ?? "";
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_FROM = Deno.env.get("TWILIO_FROM") ?? "";

const SMS_MAX = 320; // two segments — past this the cost doubles again

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

type Outcome = { status: "sent" | "skipped" | "failed"; detail: string };

/**
 * PH mobile numbers are written four different ways by four different forms
 * ("0917…", "+63917…", "63917…", "917…"). Providers want E.164. Anything that
 * does not look like a PH mobile is passed through untouched, so an
 * international number a member typed in full still works.
 */
function toE164(raw: string): string {
  const digits = String(raw ?? "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("09") && digits.length === 11) return `+63${digits.slice(1)}`;
  if (digits.startsWith("639") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("9") && digits.length === 10) return `+63${digits}`;
  return digits ? `+${digits}` : "";
}

/** Minimal HTML wrapper — plain enough that it renders the same everywhere. */
function emailHtml(subject: string, message: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = escape(message)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f6f4;padding:28px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px 28px;border:1px solid #e2e8e2">
    <div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#4d7c4d;margin-bottom:18px">EcoEquity</div>
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${escape(subject)}</h1>
    <div style="font-size:15px;color:#334155">${paragraphs}</div>
    <p style="margin:26px 0 0;font-size:12px;color:#94a3b8;line-height:1.6">
      You are getting this because Email Notifications are switched on for your
      EcoEquity account. Turn them off any time in Account Settings &rarr; Notifications.
    </p>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, message: string): Promise<Outcome> {
  if (!RESEND_KEY) {
    return { status: "skipped", detail: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html: emailHtml(subject, message),
        text: message,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { status: "failed", detail: body?.message || `HTTP ${res.status}` };
    }
    return { status: "sent", detail: body?.id || "ok" };
  } catch (err) {
    return { status: "failed", detail: String((err as Error)?.message ?? err) };
  }
}

async function sendSms(to: string, text: string): Promise<Outcome> {
  const number = toE164(to);
  if (!number) return { status: "skipped", detail: "no phone number on file" };
  const body = text.slice(0, SMS_MAX);

  if (SMS_PROVIDER === "semaphore") {
    if (!SEMAPHORE_KEY) return { status: "skipped", detail: "SEMAPHORE_API_KEY not set" };
    try {
      const form = new URLSearchParams({
        apikey: SEMAPHORE_KEY,
        number,
        message: body,
      });
      // An unset sender name means Semaphore uses the account default, which is
      // what a new account has — sending a blank one is rejected outright.
      if (SEMAPHORE_SENDER) form.set("sendername", SEMAPHORE_SENDER);
      const res = await fetch("https://api.semaphore.co/api/v4/messages", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const out = await res.json().catch(() => null);
      if (!res.ok) return { status: "failed", detail: `HTTP ${res.status}` };
      // Semaphore answers 200 with an array; an empty one means it accepted
      // nothing, which is a failure however encouraging the status code was.
      const first = Array.isArray(out) ? out[0] : out;
      if (!first) return { status: "failed", detail: "provider accepted no messages" };
      return { status: "sent", detail: String(first.message_id ?? "ok") };
    } catch (err) {
      return { status: "failed", detail: String((err as Error)?.message ?? err) };
    }
  }

  if (SMS_PROVIDER === "twilio") {
    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
      return { status: "skipped", detail: "Twilio secrets incomplete" };
    }
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: number, From: TWILIO_FROM, Body: body }),
        },
      );
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return { status: "failed", detail: out?.message || `HTTP ${res.status}` };
      return { status: "sent", detail: out?.sid || "ok" };
    } catch (err) {
      return { status: "failed", detail: String((err as Error)?.message ?? err) };
    }
  }

  return { status: "skipped", detail: "SMS_PROVIDER not set" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { to = "", event = "message", subject = "", message = "", sms = "" } =
      await req.json();

    if (!to || !subject || !message) {
      return json({ error: "to, subject and message are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Who is asking -------------------------------------------------------
    // An open endpoint that sends mail from our domain is a spam relay, so the
    // caller must be signed in. Beyond that: an admin may notify anybody (that
    // is the whole point — order updates, ticket replies), a member may only
    // notify themselves (the "Send a test" button in their own settings).
    const authHeader = req.headers.get("Authorization") ?? "";
    let caller = null;
    try {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      caller = data?.user ?? null;
    } catch (authErr) {
      console.warn("Rejected token:", authErr);
    }
    if (!caller) return json({ error: "Not signed in." }, 401);

    const { data: callerProfile } = await supabase
      .from("profiles").select("is_admin").eq("id", caller.id).maybeSingle();
    const callerIsAdmin = Boolean(callerProfile?.is_admin);
    const isSelf = (caller.email ?? "").toLowerCase() === String(to).toLowerCase();
    if (!callerIsAdmin && !isSelf) {
      return json({ error: "You can only send notifications to yourself." }, 403);
    }

    // --- What has this person asked for? -------------------------------------
    // No account behind the address (a guest checkout) means no stored
    // preference. Email them — they gave us the address for this order — and
    // never SMS, because nobody opted in.
    const { data: targets } = await supabase.rpc("notification_target", { p_email: to });
    const target = Array.isArray(targets) ? targets[0] : targets;
    const wantsEmail = target ? target.notify_email !== false : true;
    const wantsSms = target ? target.notify_sms === true : false;
    const phone = target?.phone ?? "";

    const result: Record<string, Outcome> = {
      email: wantsEmail
        ? await sendEmail(to, subject, message)
        : { status: "skipped", detail: "email notifications switched off" },
      sms: wantsSms
        ? await sendSms(phone, sms || `${subject} — ${message}`)
        : { status: "skipped", detail: "SMS updates switched off" },
    };

    // Logged whatever happened. A skip is as worth recording as a send: it is
    // the evidence that the switch was honoured.
    await supabase.from("notification_log").insert(
      (["email", "sms"] as const).map((channel) => ({
        user_id: target?.user_id ?? null,
        channel,
        event,
        recipient: channel === "email" ? to : toE164(phone),
        subject,
        body: channel === "sms" ? (sms || message).slice(0, SMS_MAX) : message,
        status: result[channel].status,
        detail: result[channel].detail,
      })),
    );

    return json(result);
  } catch (err) {
    console.error("notify:", err);
    return json({ error: "Could not send the notification." }, 500);
  }
});
