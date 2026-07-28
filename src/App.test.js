import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  resendConfirmation: jest.fn(),
  onAuthChange: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserFromSession: jest.fn(),
  consumeAuthErrorFromUrl: jest.fn(),
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
  await waitFor(() => expect(menuToggle()).toBeInTheDocument());
};

const menuToggle = () => screen.getByRole("button", { name: /toggle navigation menu/i });

// The nav links live behind the hamburger drawer, so open it before clicking.
const navButton = (name) => {
  fireEvent.click(menuToggle());
  return screen.getByRole("button", { name });
};

const clickNav = (name) => fireEvent.click(navButton(name));

// The hero "Learn More" button plays a ~520ms swipe animation before it
// navigates, so wait for the destination page instead of asserting straight away.
const goToLearnMore = async () => {
  fireEvent.click(screen.getByRole("button", { name: /Learn More/i }));
  await screen.findByRole("button", { name: /Explore more/i }, { timeout: 3000 });
};

describe("App navigation", () => {
  test("renders home view by default", async () => {
    await renderApp();

    expect(screen.getByText("EcoEquity.Inc")).toBeInTheDocument();
    expect(screen.getByText(/Grow Food\./)).toBeInTheDocument();
    expect(screen.getByText(/Build Community\./)).toBeInTheDocument();
    expect(screen.getByText(/Earn Sustainably\./)).toBeInTheDocument();
    expect(screen.getByText("Agricultural Innovation · Philippines")).toBeInTheDocument();
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

  // jsdom silently drops a `background` shorthand holding a gradient, so the
  // active state is asserted through the properties it does keep.
  const expectActiveNavStyle = (button) => {
    expect(button.style.border).toBe("1px solid rgba(134,239,172,0.4)");
    expect(button.style.boxShadow).toBe(
      "0 8px 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
    );
    expect(button).toHaveStyle({ color: "#064e3b", fontWeight: 700 });
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

    fireEvent.click(screen.getByRole("button", { name: /Get in Touch/i }));

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

    // In the collapsed drawer the sub-menu opens on click, not hover.
    clickNav("Target Market");

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

    expect(chatButton).toHaveStyle({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      color: "#062018",
    });
    expect(chatButton.style.boxShadow).toBe(
      "0 18px 40px rgba(6,32,24,0.22), inset 0 1px 0 rgba(255,255,255,0.52)"
    );

    // The floating support cluster pins the button to the bottom-right corner.
    const wrapper = chatButton.parentElement;
    expect(wrapper).toHaveStyle("position: fixed");
    expect(wrapper).toHaveStyle("right: 28px");
    expect(wrapper).toHaveStyle("bottom: 48px");
    expect(wrapper).toHaveStyle("z-index: 2100");
  });
});
