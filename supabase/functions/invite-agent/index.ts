// ============================================================================
// Edge Function: invite-agent
// Invites somebody to become a support agent, resends that invitation, or
// withdraws it. Called from the Admin Portal → Support Tickets → Agents.
//
// Runs SERVER-SIDE because it has to: creating an auth user and sending the
// set-your-password link is `auth.admin`, which needs the SERVICE ROLE key.
// That key must never reach the browser bundle — with it, anyone reading your
// JavaScript owns every row in the database.
//
// The invitation link Supabase mails is single-use and expiring. We never see
// it, never store it, and never email it ourselves: handing that job to
// Supabase Auth means there is no token of ours sitting in a table waiting to
// leak.
//
// Deploy:  supabase functions deploy invite-agent
// Prereq:  run supabase/agent-invites.sql first
//
// Request body: { action, email, full_name?, redirect_to? }
//   action    — 'invite' | 'resend' | 'revoke'
//   email     — who
//   full_name — shown to members as "Maria has joined the chat"
//
// Response: { ok: true, status } or { error }
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

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

// Where the invited agent lands after setting their password. Set this to your
// deployed origin; the fallback is only useful in local development.
//   supabase secrets set SITE_URL=https://your-site.example
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { action = "invite", email = "", full_name = "", redirect_to = "" } =
      await req.json();

    const address = String(email).trim().toLowerCase();
    if (!address || !address.includes("@")) {
      return json({ error: "A valid email address is required." }, 400);
    }
    if (!["invite", "resend", "revoke"].includes(action)) {
      return json({ error: `Unknown action: ${action}` }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Who is asking -------------------------------------------------------
    // An open endpoint that mints staff accounts is a way to hand somebody the
    // support inbox, so this is checked before anything else happens. The
    // service-role client above bypasses RLS entirely; the is_admin read below
    // is therefore the ONLY thing standing in the way.
    const authHeader = req.headers.get("Authorization") ?? "";
    let caller = null;
    try {
      const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      caller = data?.user ?? null;
    } catch (authErr) {
      console.warn("Rejected token:", authErr);
    }
    if (!caller) return json({ error: "Not signed in." }, 401);

    const { data: callerProfile } = await admin
      .from("profiles").select("is_admin").eq("id", caller.id).maybeSingle();
    if (!callerProfile?.is_admin) {
      return json({ error: "Only an admin can invite agents." }, 403);
    }

    // ------------------------------------------------------------------------
    // Revoke.
    //
    // Deliberately does not delete the account. If they already accepted, they
    // have answered conversations and their name has to keep rendering on
    // those transcripts — deleting the user would blank the agent on every
    // message they ever sent. set_agent_enabled(false) switches them off and
    // leaves the history intact.
    // ------------------------------------------------------------------------
    if (action === "revoke") {
      const { error } = await admin.rpc("set_agent_enabled", {
        p_email: address,
        p_enabled: false,
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, status: "revoked" });
    }

    // ------------------------------------------------------------------------
    // Invite / resend.
    //
    // inviteUserByEmail both creates the auth user and mails the link. If the
    // address already has an account it errors, which is the useful case to
    // handle rather than hide: somebody who already signed up as a member does
    // not need an invitation, they need promoting. So fall back to writing the
    // roster row and flipping the flag — they will find "My Chats" waiting the
    // next time they sign in.
    // ------------------------------------------------------------------------
    const redirect = redirect_to || SITE_URL;

    // ORDER MATTERS, and not in the obvious way.
    //
    // inviteUserByEmail creates the auth.users row immediately — at INVITE
    // time, not when they accept. That insert fires accept_agent_invitation(),
    // which looks for a pending invitation and grants the agent role. Write
    // the roster row afterwards and the trigger finds nothing: the account is
    // created, the email goes out, and the person who accepts is an ordinary
    // member wondering where their chats are.
    //
    // So the invitation is recorded FIRST, and the user id patched in after.
    const { error: rosterError } = await admin
      .from("agent_invitations")
      .upsert({
        email: address,
        full_name: full_name || null,
        status: "pending",
        invited_by: caller.id,
        last_sent_at: new Date().toISOString(),
        revoked_at: null,
      }, { onConflict: "email" });

    if (rosterError) return json({ error: rosterError.message }, 400);

    const { data: invited, error: inviteError } = await admin.auth.admin
      .inviteUserByEmail(address, {
        data: { full_name, invited_as: "agent" },
        redirectTo: redirect,
      });

    const alreadyRegistered = inviteError && (
      /already.*registered|already been registered|User already/i.test(inviteError.message ?? "")
    );

    if (inviteError && !alreadyRegistered) {
      // Most often this is email rate limiting on a project with no SMTP
      // configured. Pass the real message through — a generic "could not
      // invite" would send the admin looking in the wrong place.
      return json({ error: inviteError.message }, 400);
    }

    // Patch the id in now that there is one. The trigger has already set it on
    // a fresh invite; this covers a resend, where the row predates the account.
    if (invited?.user?.id) {
      await admin
        .from("agent_invitations")
        .update({ user_id: invited.user.id })
        .eq("email", address);
    }

    // An existing account never fires the signup trigger that grants the role,
    // so promote them here. A brand-new invitee is promoted by that trigger
    // when they accept — see accept_agent_invitation() in agent-invites.sql.
    if (alreadyRegistered) {
      const { error: promoteError } = await admin.rpc("set_agent", {
        p_email: address,
        p_is_agent: true,
      });
      if (promoteError) return json({ error: promoteError.message }, 400);
      return json({ ok: true, status: "promoted" });
    }

    return json({ ok: true, status: action === "resend" ? "resent" : "invited" });
  } catch (err) {
    console.error("invite-agent failed:", err);
    return json({ error: String((err as Error)?.message ?? err) }, 500);
  }
});
