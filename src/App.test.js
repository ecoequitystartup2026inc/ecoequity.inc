import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

// The app is auth-gated: without a session it parks on the login screen. Stub
// Supabase + the auth module so every test starts on the logged-in Home page.
jest.mock("./supabaseClient", () => {
  const makeQuery = () => {
    const q = {};
    ["select", "insert", "update", "delete", "upsert", "eq", "neq", "in",
      "order", "limit", "range", "single", "maybeSingle", "gte", "lte"].forEach((m) => {
      q[m] = () => q;
    });
    q.then = (resolve) => resolve({ data: null, error: null });
    return q;
  };
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: () => makeQuery(),
      channel: () => ({ on() { return this; }, subscribe: () => ({}) }),
      removeChannel: () => {},
    },
  };
});

// Spread the real module rather than listing its exports by hand. Hand-listing
// breaks every time auth.js grows a helper App.js calls at mount: the mock is
// missing it, the call returns undefined, and all 17 tests below die on
// "<name> is not a function" before rendering a single element. That has now
// happened twice (arrivedFromRecoveryLink, then arrivedFromInviteLink).
//
// Only the network-touching functions are stubbed. The pure helpers — password
// rules, email validation, the link-type sniffers that read window.location —
// are safe to run for real in jsdom and behave correctly there.
jest.mock("./data/auth", () => ({
  ...jest.requireActual("./data/auth"),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resendConfirmation: jest.fn(),
  onAuthChange: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserFromSession: jest.fn(),
  consumeAuthErrorFromUrl: jest.fn(),
  requestPasswordReset: jest.fn(),
  updatePassword: jest.fn(),
  verifyPassword: jest.fn(),
  saveProfilePic: jest.fn(),
}));

beforeEach(() => {
  // The app now mirrors the current page into the address bar, and reads a
  // deep link back out of it on mount. Jest gives the whole file one jsdom, so
  // without this reset each test starts on whatever page the previous one
  // navigated to — every test below assumes it begins on Home.
  window.history.replaceState(null, "", "/");

  const auth = require("./data/auth");
  auth.onAuthChange.mockReturnValue({ unsubscribe: jest.fn() });
  auth.consumeAuthErrorFromUrl.mockReturnValue(null);
  auth.getCurrentUser.mockResolvedValue({
    user: { email: "demo@user.com", user_metadata: { full_name: "Demo User" } },
    profile: { full_name: "Demo User", is_admin: false },
  });
});

// Renders the app and waits for the restored session to land on Home.
const renderApp = async () => {
  render(<App />);
  await waitFor(() => expect(navButton("About Us")).toBeInTheDocument());
};

// Every destination sits inline in the navbar row — the hamburger drawer was
// removed on 2026-08-02, so there is nothing to open before clicking. The
// query is scoped to that row because the footer repeats several of the same
// destinations ("About Us", "Learn More", "Get in Touch") as its own links.
const navRow = () => {
  const row = document.querySelector(".nav-inline-links");
  if (!row) throw new Error("navbar row (.nav-inline-links) is not rendered");
  return within(row);
};

const navButton = (name) => navRow().getByRole("button", { name });

const clickNav = (name) => fireEvent.click(navButton(name));

// The site footer carries its own "Learn More" link, so this name matches
// twice on Home. The hero's CTA is the one that comes first in the DOM.
const goToLearnMore = async () => {
  fireEvent.click(screen.getAllByRole("button", { name: /Learn More/i })[0]);
  await screen.findByText(/Sustainable Development Goals/i, {}, { timeout: 3000 });
};

describe("App navigation", () => {
  test("renders home view by default", async () => {
    await renderApp();

    expect(screen.getByText("EcoEquity.Inc")).toBeInTheDocument();
    // The hero sets these in sentence case; the eyebrow is uppercased in CSS,
    // so the DOM text stays as authored.
    expect(screen.getByText(/Grow food\./)).toBeInTheDocument();
    expect(screen.getByText(/Build community\./)).toBeInTheDocument();
    expect(screen.getByText(/Earn sustainably\./)).toBeInTheDocument();
    expect(screen.getByText(/Agricultural innovation · Philippines/)).toBeInTheDocument();
  });

  test("switches to Product & Services page when nav button is clicked", async () => {
    await renderApp();

    clickNav("Product & Services");

    // Code-split page — await the chunk before asserting on its content.
    expect(await screen.findByText("What We Offer")).toBeInTheDocument();
    expect(screen.getByText(/EcoEquity offers a comprehensive suite of digital tools/)).toBeInTheDocument();
  });

  test("switches to About Us page when nav button is clicked", async () => {
    await renderApp();

    clickNav("About Us");

    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  test("switches to Target Market page and shows goal text when nav button is clicked", async () => {
    await renderApp();

    clickNav("Target Market");

    // findBy, not getBy: pages are code-split, so the module is fetched on
    // first navigation and the content lands a tick later.
    expect(await screen.findByText("Who We Serve")).toBeInTheDocument();
    expect(screen.getByText("Our Goal")).toBeInTheDocument();
  });

  test("does not render Verde logo in the navigation bar", async () => {
    await renderApp();

    expect(screen.queryByAltText("Verde Logo")).not.toBeInTheDocument();
  });

  test("Home page no longer renders the old AI Farming System block", async () => {
    await renderApp();

    expect(screen.queryByText("AI Farming System")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Empower communities through accessible agricultural innovation.")
    ).not.toBeInTheDocument();
  });

  // The navbar labels are plain text — see styles.linkBtn in App.js: "no pill,
  // border or shadow. Active and hover read through weight and colour alone."
  // So the active state is a weight step, 600 → 800, and nothing else. An
  // earlier glowing-pill design is what the shadow assertion here used to
  // check; asserting it again would re-pin a look that was deliberately dropped.
  //
  // Colour is not asserted: jsdom discards any declaration whose value contains
  // `var()`, and the whole palette moved into CSS variables so Settings →
  // Appearance can repaint it. theme.test.js covers the ramp itself.
  const expectActiveNavStyle = (button) => {
    expect(button).toHaveStyle({ fontWeight: 800 });
    // The chip really is gone, not merely unasserted.
    expect(button).toHaveStyle({ boxShadow: "none", background: "transparent" });
  };

  test("active navigation button reads as active through weight for Home", async () => {
    await renderApp();

    // Home is active by default.
    expectActiveNavStyle(navButton("Home"));
  });

  test.each(["About Us", "Product & Services", "Target Market"])(
    "active navigation button reads as active through weight for %s",
    async (name) => {
      await renderApp();

      const button = navButton(name);
      // Inactive first — otherwise a button hard-coded to 800 would pass.
      expect(button).toHaveStyle({ fontWeight: 600 });

      fireEvent.click(button);

      expectActiveNavStyle(button);
    }
  );

  // The Get in Touch page was removed: the footer is the contact section, so
  // the CTA keeps you on Home and scrolls there instead of routing away.
  test("Get in Touch stays on Home and reaches the footer contact box", async () => {
    await renderApp();

    // [0] is the hero CTA; the landing sections and the footer repeat it.
    fireEvent.click(screen.getAllByRole("button", { name: /Get in Touch/i })[0]);

    // The footer renders on Home only, so finding its message box proves both
    // that we stayed put and that the contact surface is on screen.
    expect(screen.getAllByText(/Send us a message/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/We'd love to hear from you!/i)).not.toBeInTheDocument();
  });

  test("switches to Learn More page when Learn More button is clicked", async () => {
    await renderApp();

    await goToLearnMore();

    expect(screen.getByText(/Sustainable Development Goals/i)).toBeInTheDocument();
  });

  // The timeline used to sit behind an "Explore more" button on its own page;
  // it now lives in the Problem Addressed band at the foot of Learn More, and
  // nowhere else.
  test("renders the Problem Addressed band on Learn More and nowhere else", async () => {
    await renderApp();

    expect(screen.queryByText(/How the dependency was/i)).not.toBeInTheDocument();

    await goToLearnMore();
    expect(screen.getByText(/How the dependency was/i)).toBeInTheDocument();
    expect(screen.getByText(/Where EcoEquity intervenes/i)).toBeInTheDocument();

    clickNav("Target Market");
    expect(screen.queryByText(/How the dependency was/i)).not.toBeInTheDocument();
  });

  test("Learn More carries the full problem timeline", async () => {
    await renderApp();

    await goToLearnMore();

    expect(screen.getByText("1980")).toBeInTheDocument();
    expect(screen.getByText(/SHIFT FROM SELF-SUFFICIENCY TO IMPORT DEPENDENCY/i)).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText(/WTO ACCESSION & TRADE LIBERALIZATION/i)).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText(/GLOBAL PRICE SHOCKS & RAPID URBANIZATION/i)).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText(/PANDEMIC & SUPPLY-CHAIN FRAGILITY/i)).toBeInTheDocument();
  });

  test("renders timeline circles vertically in the Problem Addressed band", async () => {
    await renderApp();

    await goToLearnMore();

    const timelineContainer = screen.getByTestId("timeline-container");
    expect(timelineContainer).toHaveStyle("flex-direction: column");
    expect(timelineContainer).toHaveStyle("align-self: center");
  });

  test("shows Sustainability App Market in the Target Market dropdown and navigates to it", async () => {
    await renderApp();

    // Inline in the navbar the sub-menu opens on hover of the item's wrapper,
    // not on click — clicking the item itself just navigates to the overview.
    fireEvent.mouseEnter(navButton("Target Market").parentElement);

    const sustainabilityBtn = screen.getByRole("button", { name: "Sustainability App Market" });
    fireEvent.click(sustainabilityBtn);

    // Code-split page — await the chunk before asserting on its content.
    expect(await screen.findByText(/Sustainability App Market Sizing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Grow Food\./)).not.toBeInTheDocument();
  });
});

describe("Background styling and Chat button", () => {
  test("renders Chat with AI button on Home page with glass effect and correct position", async () => {
    await renderApp();

    const chatButton = screen.getByRole("button", { name: "Chat with AI" });

    expect(chatButton).toHaveStyle({ width: "48px", height: "48px" });
    // Shape and themed ink live in the style attribute — see the note on
    // expectActiveNavStyle for why jsdom cannot compute them.
    expect(chatButton.getAttribute("style")).toContain("border-radius: 50%");
    expect(chatButton.getAttribute("style")).toContain(
      "box-shadow: 0 18px 40px rgba(var(--eco-c19-rgb), 0.22), inset 0 1px 0 rgba(255,255,255,0.52)"
    );

    // The floating support cluster pins the button to the bottom-right corner.
    const wrapper = chatButton.parentElement;
    expect(wrapper).toHaveStyle("position: fixed");
    expect(wrapper).toHaveStyle("right: 28px");
    expect(wrapper).toHaveStyle("bottom: 48px");
    expect(wrapper).toHaveStyle("z-index: 2100");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// URL ↔ page. Before this the whole site lived at one URL: nothing could be
// linked to, Back left the site, and a reload dropped you on the landing page.
// ─────────────────────────────────────────────────────────────────────────────
describe("addressable pages", () => {
  test("navigating moves the address bar", async () => {
    await renderApp();
    expect(window.location.pathname).toBe("/");

    clickNav("About Us");

    await waitFor(() => expect(window.location.pathname).toBe("/about-us"));
  });

  test("each navigation is a Back step rather than replacing history", async () => {
    await renderApp();

    clickNav("About Us");
    await waitFor(() => expect(window.location.pathname).toBe("/about-us"));
    clickNav("Target Market");
    await waitFor(() => expect(window.location.pathname).toBe("/target-market"));

    // Back should return to About Us, not exit the site.
    window.history.back();
    await waitFor(() => expect(window.location.pathname).toBe("/about-us"));
  });

  test("a deep link lands on that page instead of Home", async () => {
    window.history.replaceState(null, "", "/about-us");

    render(<App />);

    // The restored session lands on About Us, not the role's usual Home: the
    // navbar marks it active, and the URL is left as the visitor typed it.
    await waitFor(() => expect(navButton("About Us")).toHaveStyle({ fontWeight: 800 }));
    expect(navButton("Home")).toHaveStyle({ fontWeight: 600 });
    expect(window.location.pathname).toBe("/about-us");
  });

  test("a member deep-linking to the admin portal is sent to Home instead", async () => {
    window.history.replaceState(null, "", "/admin");

    render(<App />);

    // Lands on Home — the navbar row appears and the URL is corrected.
    await waitFor(() => expect(navButton("About Us")).toBeInTheDocument());
    await waitFor(() => expect(window.location.pathname).toBe("/"));
  });

  test("an unknown path falls back to Home rather than a blank page", async () => {
    window.history.replaceState(null, "", "/no-such-page");

    render(<App />);

    await waitFor(() => expect(navButton("About Us")).toBeInTheDocument());
  });
});
