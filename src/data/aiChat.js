import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// AI CHAT data layer — talks to the `ai-chat` Edge Function, which holds the
// provider API key server-side. Same shape as checkout.js: the browser never
// sees a secret.
//
// Every function here THROWS on failure by design. AIChatInterface catches and
// falls back to the built-in keyword bot, so a missing key, a dead function, or
// an exhausted quota degrades the chat instead of breaking it.
// ============================================================================

// True only when there is a configured backend AND someone is logged in.
// Anonymous visitors stay on the keyword bot: an open, unauthenticated endpoint
// that costs money per request is the one thing we must not ship.
export async function isLiveAIAvailable() {
  if (!isSupabaseConfigured) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

// history: [{ sender: 'user' | 'ai' | 'agent', text }] — the on-screen messages.
// Only the last few turns are sent; older context is not worth the tokens.
function toApiMessages(history, latestText) {
  const turns = history
    .filter((m) => m.text && (m.sender === "user" || m.sender === "ai"))
    .slice(-8)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  // The provider APIs require the conversation to start with a user turn.
  while (turns.length > 0 && turns[0].role !== "user") turns.shift();

  if (latestText) turns.push({ role: "user", content: latestText });
  return turns;
}

async function invoke(body) {
  const { data, error } = await supabase.functions.invoke("ai-chat", { body });

  if (error) {
    // On a non-2xx, supabase-js gives a generic "Edge Function returned a
    // non-2xx status code" and buries the real body in error.context (a raw
    // Response). Dig it out — running out of quota needs a totally different
    // reaction from the app than the service being broken.
    const status = error.context?.status;
    let message = error.message;
    let details = null;
    try {
      details = await error.context.json();
      if (details?.error) message = details.error;
    } catch {
      // Body was not JSON; the generic message is the best we have.
    }
    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.quotaExceeded = status === 429;
    // Carried through so the chat can lock its composer until the counter
    // rolls over instead of letting the user keep firing doomed requests.
    wrapped.limit = details?.limit ?? null;
    wrapped.resetsAt = details?.resetsAt ?? null;
    throw wrapped;
  }

  if (!data) throw new Error("Empty response from ai-chat");
  if (data.error) throw new Error(data.error);
  return data;
}

// Returns the assistant's reply as a string.
export async function askAI({ bot, history, text }) {
  const { reply } = await invoke({
    bot,
    mode: "chat",
    messages: toApiMessages(history, text),
  });
  if (!reply) throw new Error("No reply returned");
  return reply;
}

// Sends a photo for diagnosis. Returns the same shape the Admin Portal's
// Disease Library uses, so the existing formatter and records path still work.
export async function scanPlantImage({ file, note }) {
  const image = await fileToBase64(file);
  const { diagnosis } = await invoke({
    bot: "plantDoctor",
    mode: "scan",
    image,
    messages: [{
      role: "user",
      content: note?.trim()
        ? `Diagnose the plant in this photo. The user adds: ${note.trim()}`
        : "Diagnose the plant in this photo.",
    }],
  });

  // Guard every field — a model can always return something unexpected, and the
  // caller writes this straight into the admin records.
  if (!diagnosis || typeof diagnosis !== "object") {
    throw new Error("Malformed diagnosis");
  }
  const recommendations = Array.isArray(diagnosis.recommendations)
    ? diagnosis.recommendations.filter((r) => typeof r === "string" && r.trim())
    : [];
  if (!diagnosis.condition || recommendations.length === 0) {
    throw new Error("Incomplete diagnosis");
  }

  return {
    plantName: String(diagnosis.plantName || "Detected Plant"),
    condition: String(diagnosis.condition),
    confidence: String(diagnosis.confidence || "—"),
    severity: ["None", "Low", "Moderate", "High"].includes(diagnosis.severity)
      ? diagnosis.severity
      : "Moderate",
    recommendations,
  };
}

// Reads a File into the { mediaType, data } pair the Edge Function expects.
// Rejects oversized or non-image files here so we never pay to upload junk.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB — comfortably under provider caps

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file.type?.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("Image is larger than 4MB"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.onload = () => {
      // result is "data:image/png;base64,AAAA..." — the APIs want the tail only.
      const result = String(reader.result);
      const comma = result.indexOf(",");
      if (comma === -1) {
        reject(new Error("Could not encode the image"));
        return;
      }
      resolve({ mediaType: file.type, data: result.slice(comma + 1) });
    };
    reader.readAsDataURL(file);
  });
}
