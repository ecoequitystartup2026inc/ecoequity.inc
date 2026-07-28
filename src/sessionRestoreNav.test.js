import { render, screen, waitFor } from "@testing-library/react";
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
  auth.getUserFromSession.mockResolvedValue(null);
  auth.getCurrentUser.mockResolvedValue({
    user: { email: "demo@user.com", user_metadata: { full_name: "Demo User" } },
    profile: { full_name: "Demo User", is_admin: false },
  });
});

test("restored session leaves the auth screen so the nav menu bar is visible", async () => {
  render(<App />);

  // applySession from the restored session should navigate off "Login",
  // which unhides the navbar (hamburger toggle button).
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: /toggle navigation menu/i })
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
