import { render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

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

// Spread the real module rather than listing its exports by hand — see the
// same mock in App.test.js for why. Only the network-touching calls are stubbed.
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
  // Reset the address bar between tests — the app reads a deep link off it on
  // mount, and Jest shares one jsdom across this whole file. See App.test.js.
  window.history.replaceState(null, "", "/");

  const auth = require("./data/auth");
  auth.onAuthChange.mockReturnValue({ unsubscribe: jest.fn() });
  auth.consumeAuthErrorFromUrl.mockReturnValue(null);
  auth.getUserFromSession.mockResolvedValue(null);
  auth.getCurrentUser.mockResolvedValue({
    user: { email: "demo@user.com", user_metadata: { full_name: "Demo User" } },
    profile: { full_name: "Demo User", is_admin: false },
  });
});

test("restored session leaves the auth screen so the nav menu bar is visible", async () => {
  render(<App />);

  // applySession from the restored session should navigate off "Login", which
  // unhides the navbar — every item sits inline in it, so any one of them
  // standing in the document is the signal. Scoped to the navbar row: the home
  // footer repeats "About Us" as one of its own links.
  await waitFor(() =>
    expect(
      within(document.querySelector(".nav-inline-links")).getByRole("button", { name: "About Us" })
    ).toBeInTheDocument()
  );
});

test("restored admin session lands on the Admin Portal", async () => {
  const auth = require("./data/auth");
  auth.getCurrentUser.mockResolvedValue({
    user: { email: "admin@ecoequity.com", user_metadata: {} },
    profile: { full_name: "Admin", is_admin: true },
  });

  render(<App />);

  await waitFor(() =>
    expect(screen.queryByPlaceholderText("Email or Phone Number")).not.toBeInTheDocument()
  );
});
