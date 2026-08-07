// ============================================================================
// Edge Function: ai-chat
// Answers EcoEquity chat messages and plant-photo scans with a hosted LLM.
// Runs SERVER-SIDE so the provider API key is never exposed to the browser.
//
// Provider is a config switch, not a rewrite — the client and the database do
// not know or care which one is in use:
//   supabase secrets set AI_PROVIDER=gemini   GEMINI_API_KEY=...     (free tier)
//   supabase secrets set AI_PROVIDER=openai   OPENAI_API_KEY=sk-...  (prepaid)
//
// Gemini is the default because its free tier needs no card, so the assistant
// can go live before there is any subscription revenue to pay for it. It is
// rate-limited and not as sharp as a paid model — switch to openai once the
// spend is worth it.
//
// Set AI_FALLBACK_PROVIDER as well and BOTH run at once — the second one
// answers whenever the first errors out, which also covers Gemini's free-tier
// rate limits:
//   supabase secrets set AI_PROVIDER=gemini AI_FALLBACK_PROVIDER=openai \
//     GEMINI_API_KEY=... OPENAI_API_KEY=sk-...
//
// Deploy:  supabase functions deploy ai-chat
// Secrets: AI_PROVIDER (default "gemini"), AI_FALLBACK_PROVIDER (optional),
//          GEMINI_API_KEY and/or OPENAI_API_KEY, AI_MODEL and
//          AI_FALLBACK_MODEL (optional), AI_DAILY_LIMIT_FREE / _PAID (optional)
//          (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically)
//
// Request body: { bot, mode, messages: [{role, content}], image?: {mediaType, data} }
// Response:     { reply } for mode "chat", { diagnosis } for mode "scan"
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";
import { buildSystemPrompt } from "./knowledge.ts";

const PRIMARY = (Deno.env.get("AI_PROVIDER") ?? "gemini").toLowerCase();

// Optional second provider. Set it and both are live at once: if the primary
// errors — outage, rate limit, spent balance — the request retries on the other
// one instead of dropping the user to the keyword bot. Leave it unset to run a
// single provider.
const FALLBACK = (Deno.env.get("AI_FALLBACK_PROVIDER") ?? "").toLowerCase();

// Both defaults are the cheap, fast tier of their family — the right trade for
// site Q&A, where being quick matters more than being clever.
//
// "gemini-flash-latest" is an alias that always points at the current Flash
// release, so this does not rot the way a pinned version would. The trade is
// that answers can shift under you when Google promotes a new model; pin a
// specific version via AI_MODEL (e.g. gemini-3.6-flash) if you would rather
// have predictable behaviour than free upgrades.
const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-flash-latest",
  openai: "gpt-4o-mini",
};

function modelFor(provider: string): string {
  const override = provider === PRIMARY
    ? Deno.env.get("AI_MODEL")
    : Deno.env.get("AI_FALLBACK_MODEL");
  return override || DEFAULT_MODELS[provider] || DEFAULT_MODELS.gemini;
}

function hasKeyFor(provider: string): boolean {
  return provider === "openai"
    ? Boolean(Deno.env.get("OPENAI_API_KEY"))
    : Boolean(Deno.env.get("GEMINI_API_KEY"));
}

function callProvider(provider: string, system: string, messages: any[], image: any) {
  return provider === "openai"
    ? callOpenAI(system, messages, image, modelFor(provider))
    : callGemini(system, messages, image, modelFor(provider));
}

// Daily caps per user. Paid plans are parked until PayMongo is verified, so the
// assistant is currently a free trial for every signed-in member and the free
// cap is set generously — high enough that no honest user will meet it in a
// day's real use.
//
// It is deliberately not removed. The cap is not a paywall, it is the brake on
// a shared API key: one scripted account could otherwise burn the whole Gemini
// free-tier quota in minutes and take the assistant down for everybody. Lower
// AI_DAILY_LIMIT_FREE again when paid plans go live.
const LIMIT_FREE = Number(Deno.env.get("AI_DAILY_LIMIT_FREE") ?? 100);
const LIMIT_PAID = Number(Deno.env.get("AI_DAILY_LIMIT_PAID") ?? 300);

// Replies are meant to be short, but the current Flash models think before
// answering and those thinking tokens come out of the same budget — too low a
// cap truncates the visible reply to nothing, which the client then treats as a
// failure and falls back to the keyword bot.
const MAX_TOKENS = 2048;
const MAX_MESSAGES = 12;      // trim runaway histories before they cost anything

// When today's counter starts over. The quota is keyed on Postgres
// `current_date`, and Supabase runs its databases in UTC, so the rollover is
// UTC midnight — not the user's midnight. The client turns this into local time
// for display; keep the two in step if the database timezone ever changes.
function nextResetISO(): string {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )).toISOString();
}

// supabase-js `functions.invoke` sends x-client-info and apikey alongside the
// auth header. Omit either from this list and the browser fails the preflight,
// so the request never reaches the function at all — which looks exactly like
// the function being broken, except nothing shows up in its logs.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { bot = "general", mode = "chat", messages = [], image = null } =
      await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "No messages provided" }, 400);
    }

    // --- Who is asking -------------------------------------------------------
    // Login is required. An anonymous endpoint that spends money per request is
    // the one thing we must not ship; signed-out visitors stay on the built-in
    // keyword bot, which costs nothing.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // An expired or malformed JWT can make getUser reject outright rather than
    // return a null user. Left unguarded that lands in the catch-all below and
    // surfaces as a 500 "assistant is unavailable", which sends you hunting for
    // a broken backend when the real answer is "log in again".
    const authHeader = req.headers.get("Authorization") ?? "";
    let user = null;
    try {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      user = data?.user ?? null;
    } catch (authErr) {
      console.warn("Rejected token:", authErr);
    }
    if (!user) {
      return json({
        error: "Your session has expired. Please log in again to use the AI assistant.",
      }, 401);
    }

    // --- Quota ---------------------------------------------------------------
    // An active subscription of any kind counts as paid.
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);
    const limit = subs && subs.length > 0 ? LIMIT_PAID : LIMIT_FREE;

    // Counted BEFORE the provider call, so a crash mid-request cannot be used
    // to spend without being charged against the quota.
    const { data: used, error: usageErr } = await supabase
      .rpc("bump_ai_chat_usage", { p_user: user.id });
    if (usageErr) throw usageErr;
    if (typeof used === "number" && used > limit) {
      // No upsell here: the assistant is a free trial and the plans cannot be
      // bought yet, so promising an upgrade would be selling vapour.
      //
      // `limit` and `resetsAt` ride along as data, not just prose, because the
      // client locks its composer on this response and has to know when to
      // unlock it again — parsing that out of the sentence would be fragile.
      return json({
        error: `That is ${limit} AI messages for today — the daily free-trial ` +
          `allowance. It resets tomorrow. Thanks for helping us test EcoEquity!`,
        limitReached: true,
        limit,
        used,
        resetsAt: nextResetISO(),
      }, 429);
    }

    // --- Build the request ---------------------------------------------------
    const system = buildSystemPrompt(bot, mode);
    const trimmed = messages.slice(-MAX_MESSAGES).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 4000),
    }));

    // The quota was already counted above, so a failover retry is one billed
    // message to the user no matter how many providers it took to answer.
    let text: string;
    try {
      text = await callProvider(PRIMARY, system, trimmed, image);
    } catch (primaryErr) {
      if (!FALLBACK || FALLBACK === PRIMARY || !hasKeyFor(FALLBACK)) throw primaryErr;
      console.warn(`${PRIMARY} failed, retrying on ${FALLBACK}:`, primaryErr);
      text = await callProvider(FALLBACK, system, trimmed, image);
    }

    if (mode === "scan") {
      const diagnosis = parseDiagnosis(text);
      if (!diagnosis) return json({ error: "Could not read the diagnosis" }, 502);
      return json({ diagnosis });
    }
    return json({ reply: text });
  } catch (err) {
    // Log the real error for `supabase functions logs`, return a safe one.
    console.error("ai-chat failed:", err);
    return json({ error: "The AI assistant is unavailable right now." }, 500);
  }
});

// --- Providers ---------------------------------------------------------------

// Called over plain REST rather than through @google/genai on purpose. That SDK
// drags in Node-only dependencies (google-auth-library, node-fetch,
// https-proxy-agent) that are unreliable inside Supabase's Deno edge runtime.
// The REST shape below is small, has zero dependencies, and is verified working.
async function callGemini(system: string, messages: any[], image: any, model: string) {
  const key = Deno.env.get("GEMINI_API_KEY")!;

  // Gemini calls the assistant role "model", not "assistant".
  const contents = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }] as any[],
  }));

  // The photo rides along with the newest user turn.
  if (image?.data) {
    const last = contents[contents.length - 1];
    last.parts = [
      { inlineData: { mimeType: image.mediaType, data: image.data } },
      ...last.parts,
    ];
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_TOKENS },
      }),
    },
  );

  if (!res.ok) {
    // Surface Google's own message in the logs — "API key not valid" and
    // "quota exceeded" need very different fixes.
    throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p.text ?? "")
    .join("")
    .trim();
}

async function callOpenAI(system: string, messages: any[], image: any, model: string) {
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

  const payload: any[] = [{ role: "system", content: system }, ...messages];
  if (image?.data) {
    const last = payload[payload.length - 1];
    payload[payload.length - 1] = {
      role: "user",
      content: [
        { type: "text", text: last.content },
        {
          type: "image_url",
          image_url: { url: `data:${image.mediaType};base64,${image.data}` },
        },
      ],
    };
  }

  const res = await openai.chat.completions.create({
    model,
    max_tokens: MAX_TOKENS,
    messages: payload,
  });

  return (res.choices[0]?.message?.content ?? "").trim();
}

// --- Helpers -----------------------------------------------------------------

// Models sometimes wrap JSON in prose or code fences despite being told not to.
// Pull out the first balanced object rather than trusting the whole string.
function parseDiagnosis(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
