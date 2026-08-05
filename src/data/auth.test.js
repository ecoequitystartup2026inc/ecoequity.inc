// The password-reset helpers that are pure enough to test without a backend.
// arrivedFromRecoveryLink() reads the URL at *module load*, so every case here
// sets the URL first and then re-imports the module.

const loadAuth = () => {
  let mod;
  jest.isolateModules(() => { mod = require("./auth"); });
  return mod;
};

const setUrl = (path) => window.history.replaceState({}, "", path);

describe("passwordProblem", () => {
  const { passwordProblem, PASSWORD_MIN_LENGTH } = loadAuth();

  it("rejects a password shorter than the minimum", () => {
    expect(passwordProblem("short")).toMatch(new RegExp(`${PASSWORD_MIN_LENGTH} characters`));
  });

  it("rejects an empty password", () => {
    expect(passwordProblem("")).toBeTruthy();
    expect(passwordProblem(undefined)).toBeTruthy();
  });

  it("rejects a confirmation that doesn't match", () => {
    expect(passwordProblem("GreenLeaf123", "GreenLeaf124")).toBe("Passwords do not match.");
  });

  it("accepts a long enough password, with or without a confirmation field", () => {
    expect(passwordProblem("GreenLeaf123")).toBeNull();
    expect(passwordProblem("GreenLeaf123", "GreenLeaf123")).toBeNull();
  });
});

describe("describeAuthError", () => {
  const { describeAuthError, PASSWORD_MIN_LENGTH } = loadAuth();
  // Supabase reports the same failure by code on newer clients and by message
  // on older ones, so both spellings are checked for the common cases.

  it("names the address as taken, by code or by message", () => {
    expect(describeAuthError({ code: "user_already_exists" }, "signup").kind).toBe("already-registered");
    expect(describeAuthError({ message: "User already registered" }, "signup").kind).toBe("already-registered");
  });

  it("turns 'Invalid login credentials' into something a member can act on", () => {
    const { text, kind } = describeAuthError({ message: "Invalid login credentials" }, "login");
    expect(kind).toBe("wrong-password");
    expect(text).toMatch(/Forgot Password/);
    expect(text).not.toMatch(/credentials/i);
  });

  it("flags an unconfirmed email separately from a wrong password", () => {
    expect(describeAuthError({ code: "email_not_confirmed" }, "login").kind).toBe("unconfirmed");
  });

  it("quotes the wait Supabase gives for a throttled request", () => {
    const { text, kind } = describeAuthError(
      { message: "For security purposes, you can only request this after 47 seconds." },
      "signup",
    );
    expect(kind).toBe("rate-limit");
    expect(text).toMatch(/47 seconds/);
  });

  it("states the app's own minimum for a weak password", () => {
    const { text } = describeAuthError({ message: "Password should be at least 6 characters" }, "signup");
    expect(text).toMatch(new RegExp(`${PASSWORD_MIN_LENGTH} characters`));
  });

  it("reads a failed fetch as being offline", () => {
    expect(describeAuthError(new TypeError("Failed to fetch"), "login").kind).toBe("offline");
  });

  it("falls back to the raw message, then to a generic line", () => {
    expect(describeAuthError({ message: "Database timeout" }, "login").text).toBe("Database timeout");
    expect(describeAuthError({}, "signup").text).toMatch(/Could not create your account/);
  });
});

describe("isExistingAccount", () => {
  const { isExistingAccount } = loadAuth();

  it("spots the decoy user returned for an address that already has an account", () => {
    expect(isExistingAccount({ user: { id: "u1", identities: [] }, session: null })).toBe(true);
  });

  it("passes a genuine new signup through", () => {
    expect(isExistingAccount({ user: { id: "u1", identities: [{ id: "i1" }] }, session: null })).toBe(false);
    expect(isExistingAccount({ user: null })).toBe(false);
    expect(isExistingAccount(undefined)).toBe(false);
  });
});

describe("isValidEmail", () => {
  const { isValidEmail } = loadAuth();

  it("accepts an ordinary address, ignoring surrounding spaces", () => {
    expect(isValidEmail("  member@ecoequity.ph ")).toBe(true);
  });

  it("rejects a phone number and other non-addresses", () => {
    expect(isValidEmail("0917 555 1234")).toBe(false);
    expect(isValidEmail("member@ecoequity")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("arrivedFromRecoveryLink", () => {
  afterEach(() => setUrl("/"));

  it("is false on a normal page load", () => {
    setUrl("/");
    expect(loadAuth().arrivedFromRecoveryLink()).toBe(false);
  });

  it("detects the implicit flow, which puts type=recovery in the hash", () => {
    setUrl("/#access_token=abc&refresh_token=def&type=recovery");
    expect(loadAuth().arrivedFromRecoveryLink()).toBe(true);
  });

  it("detects the PKCE flow, which puts it in the query string", () => {
    setUrl("/?code=abc&type=recovery");
    expect(loadAuth().arrivedFromRecoveryLink()).toBe(true);
  });

  it("ignores the signup confirmation link, which is not a recovery", () => {
    setUrl("/#access_token=abc&type=signup");
    expect(loadAuth().arrivedFromRecoveryLink()).toBe(false);
  });
});
