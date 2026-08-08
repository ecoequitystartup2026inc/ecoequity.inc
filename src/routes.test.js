import { PAGE_PATHS, PUBLIC_PAGES, pathForPage, pageForPath, canLandOn } from "./routes";

describe("route table", () => {
  test("every page maps to a distinct path", () => {
    const paths = Object.values(PAGE_PATHS);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test("every path is absolute", () => {
    // Listed rather than asserted one-by-one so a failure names the offender.
    const relative = Object.entries(PAGE_PATHS).filter(([, path]) => !path.startsWith("/"));
    expect(relative).toEqual([]);
  });

  test("page → path → page round-trips", () => {
    Object.keys(PAGE_PATHS).forEach((page) => {
      expect(pageForPath(pathForPage(page))).toBe(page);
    });
  });

  test("a page missing from the table still resolves to a usable path", () => {
    // It should not be linkable, but it must not throw either — an unregistered
    // page renders fine, it just has no URL of its own.
    expect(pathForPage("Some Page Nobody Registered")).toBe("/");
  });

  test("a trailing slash is the same page", () => {
    expect(pageForPath("/shop/")).toBe("Shop All Products");
    expect(pageForPath("/shop")).toBe("Shop All Products");
  });

  test("an unknown path resolves to nothing rather than guessing", () => {
    expect(pageForPath("/does-not-exist")).toBeNull();
    expect(pageForPath("")).toBeNull();
  });
});

describe("canLandOn", () => {
  const member = { isAdmin: false, isAgent: false };
  const agent = { isAdmin: false, isAgent: true };
  const admin = { isAdmin: true, isAgent: false };

  test("an ordinary member may deep-link to an ordinary page", () => {
    expect(canLandOn("Shop All Products", member)).toBe(true);
  });

  test("a member cannot deep-link into the admin portal or agent inbox", () => {
    expect(canLandOn("Admin Portal", member)).toBe(false);
    expect(canLandOn("Agent Inbox", member)).toBe(false);
  });

  test("staff pages open for the matching role", () => {
    expect(canLandOn("Admin Portal", admin)).toBe(true);
    expect(canLandOn("Agent Inbox", agent)).toBe(true);
    // An admin reaches the inbox too — the portal links straight to it.
    expect(canLandOn("Agent Inbox", admin)).toBe(true);
    // ...but an agent is not an admin.
    expect(canLandOn("Admin Portal", agent)).toBe(false);
  });

  test("a signed-in account is never landed on the auth screens", () => {
    // /login with a live session would strand them on a form with the navbar
    // hidden and nothing to do.
    expect(canLandOn("Login", member)).toBe(false);
    expect(canLandOn("Sign Up", member)).toBe(false);
  });

  test("nothing and nonsense are refused", () => {
    expect(canLandOn(null, member)).toBe(false);
    expect(canLandOn("Not A Page", member)).toBe(false);
  });
});

describe("PUBLIC_PAGES", () => {
  test("excludes auth, checkout and staff tooling", () => {
    ["Login", "Sign Up", "CheckoutPage", "Admin Portal", "Agent Inbox"].forEach((page) => {
      expect(PUBLIC_PAGES).not.toContain(page);
    });
  });

  test("includes the marketing pages worth indexing", () => {
    expect(PUBLIC_PAGES).toContain("Home");
    expect(PUBLIC_PAGES).toContain("About Us");
    expect(PUBLIC_PAGES).toContain("Shop All Products");
  });
});

// public/sitemap.xml is hand-written (it needs an absolute origin, which only
// the deploy knows). This is what stops it silently rotting: add a page to the
// route table without adding it to the sitemap and this fails.
describe("public/sitemap.xml", () => {
  const fs = require("fs");
  const path = require("path");
  const xml = fs.readFileSync(
    path.join(__dirname, "..", "public", "sitemap.xml"),
    "utf8"
  );
  // Compare paths, not full URLs — the origin is a placeholder until the site
  // has a domain, and swapping it in must not break this test.
  const sitemapPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""));

  test("lists exactly the public pages, no more and no fewer", () => {
    const expected = PUBLIC_PAGES.map(pathForPage).sort();
    expect([...sitemapPaths].sort()).toEqual(expected);
  });

  test("lists no private page", () => {
    ["/login", "/signup", "/checkout", "/admin", "/agent-inbox"].forEach((p) => {
      expect(sitemapPaths).not.toContain(p);
    });
  });
});
