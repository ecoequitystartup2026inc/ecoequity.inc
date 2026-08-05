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

jest.mock("./data/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resendConfirmation: jest.fn(),
  onAuthChange: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserFromSession: jest.fn(),
  consumeAuthErrorFromUrl: jest.fn(),
  // The password-reset helpers App.js imports. Without them the module mock is
  // missing exports the component calls at mount, and every test here dies on
  // "arrivedFromRecoveryLink is not a function" before rendering anything.
  arrivedFromRecoveryLink: jest.fn(() => false),
  requestPasswordReset: jest.fn(),
  updatePassword: jest.fn(),
  verifyPassword: jest.fn(),
  passwordProblem: jest.fn(() => null),
  PASSWORD_MIN_LENGTH: 8,
}));

beforeEach(() => {
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
  await screen.findByRole("button", { name: /Explore more/i }, { timeout: 3000 });
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

    expect(screen.getByText("What We Offer")).toBeInTheDocument();
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

    expect(screen.getByText("Who We Serve")).toBeInTheDocument();
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

  // jsdom drops declarations it cannot resolve: a `background` shorthand
  // holding a gradient, and — since the palette moved into CSS variables so
  // Settings → Appearance can repaint it — anything whose value contains
  // `var()`. Browsers keep both. What survives is the shadow (unvalidated) and
  // the weight; the ramp's own colours are covered by theme.test.js.
  const expectActiveNavStyle = (button) => {
    expect(button.getAttribute("style")).toContain(
      "box-shadow: 0 8px 24px rgba(var(--eco-c7-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
    );
    expect(button).toHaveStyle({ fontWeight: 700 });
  };

  test("active navigation button has premium glowing active state for Home", async () => {
    await renderApp();

    // Home is active by default.
    expectActiveNavStyle(navButton("Home"));
  });

  test.each(["About Us", "Product & Services", "Target Market"])(
    "active navigation button has premium glowing active state for %s",
    async (name) => {
      await renderApp();

      const button = navButton(name);
      fireEvent.click(button);

      expectActiveNavStyle(button);
    }
  );

  test("switches to Contact page when Get in Touch button is clicked", async () => {
    await renderApp();

    // [0] is the navbar button; the logged-in mobile welcome card carries a
    // second "Get in Touch" CTA.
    fireEvent.click(screen.getAllByRole("button", { name: /Get in Touch/i })[0]);

    expect(screen.getByText(/We'd love to hear from you!/i)).toBeInTheDocument();
  });

  test("switches to Learn More page when Learn More button is clicked", async () => {
    await renderApp();

    await goToLearnMore();

    expect(screen.getByText(/Sustainable Development Goals/i)).toBeInTheDocument();
  });

  test("renders Explore more button on Learn More and hides it on Target Market pages", async () => {
    await renderApp();

    expect(screen.queryByRole("button", { name: /Explore more/i })).not.toBeInTheDocument();

    await goToLearnMore();
    expect(screen.getByRole("button", { name: /Explore more/i })).toBeInTheDocument();

    clickNav("Target Market");
    expect(screen.queryByRole("button", { name: /Explore more/i })).not.toBeInTheDocument();
  });

  test("switches to Explore More page when Explore more button is clicked", async () => {
    await renderApp();

    await goToLearnMore();
    fireEvent.click(screen.getByRole("button", { name: /Explore more/i }));

    expect(screen.getByText("1980")).toBeInTheDocument();
    expect(screen.getByText(/SHIFT FROM SELF-SUFFICIENCY TO IMPORT DEPENDENCY/i)).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText(/WTO ACCESSION & TRADE LIBERALIZATION/i)).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText(/GLOBAL PRICE SHOCKS & RAPID URBANIZATION/i)).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText(/PANDEMIC & SUPPLY-CHAIN FRAGILITY/i)).toBeInTheDocument();
  });

  test("renders timeline circles vertically on Explore More page", async () => {
    await renderApp();

    await goToLearnMore();
    fireEvent.click(screen.getByRole("button", { name: /Explore more/i }));

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

    expect(screen.getByText(/Sustainability App Market Sizing/i)).toBeInTheDocument();
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
