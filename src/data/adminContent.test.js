// Covers the admin-content data layer against a mocked Supabase client — the
// real database can't be reached from CI, and these are the parts most likely
// to silently corrupt shared content (ordering, whole-collection replace, and
// the "not configured" contract every data module here follows).

jest.mock("../supabaseClient", () => ({
  supabase: {},
  isSupabaseConfigured: true,
}));

const { supabase } = require("../supabaseClient");
const { fetchConfig, saveConfig, fetchCollection, saveCollection } = require("./adminContent");

// Minimal chainable stub matching the calls adminContent.js makes. `tables`
// collects every table name passed to .from(), which is how the per-collection
// routing is asserted.
let tables = [];

function mockTable(handlers) {
  tables = [];
  supabase.from = jest.fn((table) => {
    tables.push(table);
    const chain = {
      select: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      order: jest.fn(() => Promise.resolve(handlers.select || { data: [], error: null })),
      maybeSingle: jest.fn(() => Promise.resolve(handlers.maybeSingle || { data: null, error: null })),
      upsert: jest.fn((rows, opts) => {
        handlers.onUpsert && handlers.onUpsert(rows, opts);
        return Promise.resolve({ error: null });
      }),
      delete: jest.fn(() => ({
        not: jest.fn((col, op, val) => {
          handlers.onDelete && handlers.onDelete(col, op, val);
          return Promise.resolve({ error: null });
        }),
      })),
      insert: jest.fn((rows) => {
        handlers.onInsert && handlers.onInsert(rows);
        return Promise.resolve({ error: null });
      }),
    };
    return chain;
  });
}

describe("fetchCollection", () => {
  it("returns rows in stored order, unwrapped from the jsonb column", async () => {
    mockTable({
      select: {
        data: [
          { data: { id: "A", name: "first" }, sort_order: 0 },
          { data: { id: "B", name: "second" }, sort_order: 1 },
        ],
        error: null,
      },
    });
    await expect(fetchCollection("advisors")).resolves.toEqual([
      { id: "A", name: "first" },
      { id: "B", name: "second" },
    ]);
  });

  it("returns [] (not null) for a collection with no rows, so callers can tell it apart from 'not configured'", async () => {
    mockTable({ select: { data: [], error: null } });
    await expect(fetchCollection("advisors")).resolves.toEqual([]);
  });

  it("surfaces database errors instead of silently returning empty content", async () => {
    mockTable({ select: { data: null, error: new Error("permission denied") } });
    await expect(fetchCollection("advisors")).rejects.toThrow("permission denied");
  });

  it("treats a null payload as 'not configured' rather than crashing or blanking the site", async () => {
    mockTable({ select: { data: null, error: null } });
    await expect(fetchCollection("advisors")).resolves.toBeNull();
  });

  it("reads each collection from its own table, including the renamed ones", async () => {
    mockTable({ select: { data: [], error: null } });
    await fetchCollection("advisors");
    await fetchCollection("admin_events");
    await fetchCollection("admin_harvests");
    await fetchCollection("admin_promo_codes");
    await fetchCollection("platform_users");
    expect(tables).toEqual([
      "advisors", "events", "harvests", "promo_codes", "platform_members",
    ]);
  });

  it("fails loudly on an unknown collection rather than querying a table that isn't there", async () => {
    mockTable({ select: { data: [], error: null } });
    await expect(fetchCollection("not_a_collection")).rejects.toThrow(
      "Unknown admin collection: not_a_collection",
    );
  });
});

describe("saveCollection", () => {
  it("replaces the whole collection and stamps sort_order from array position", async () => {
    let deleted = null;
    let inserted = null;
    mockTable({
      onDelete: (...args) => { deleted = args; },
      onInsert: (rows) => { inserted = rows; },
    });

    await saveCollection("riders", [{ id: "R1" }, { id: "R2" }, { id: "R3" }]);

    // The table is the collection now, so the delete is scoped by which table
    // it runs against — the filter only exists because PostgREST refuses an
    // unfiltered delete.
    expect(tables).toEqual(["riders", "riders"]);
    expect(deleted).toEqual(["id", "is", null]);
    expect(inserted).toHaveLength(3);
    expect(inserted.map((r) => r.sort_order)).toEqual([0, 1, 2]);
    expect(inserted.map((r) => r.data.id)).toEqual(["R1", "R2", "R3"]);
  });

  it("writes a renamed collection to its real table", async () => {
    mockTable({ onInsert: () => {} });
    await saveCollection("admin_promo_codes", [{ id: 1, code: "ECO20" }]);
    expect(tables).toEqual(["promo_codes", "promo_codes"]);
  });

  it("clears the collection without inserting when handed an empty array", async () => {
    let deleted = null;
    let inserted = null;
    mockTable({
      onDelete: (...args) => { deleted = args; },
      onInsert: (rows) => { inserted = rows; },
    });

    await saveCollection("riders", []);

    expect(deleted).toEqual(["id", "is", null]);
    expect(inserted).toBeNull();
  });
});

describe("site config", () => {
  it("returns null when the key was never saved, so the caller keeps its default", async () => {
    mockTable({ maybeSingle: { data: null, error: null } });
    await expect(fetchConfig("eco_program")).resolves.toBeNull();
  });

  it("returns the stored value object", async () => {
    mockTable({ maybeSingle: { data: { value: { rewards: [{ id: "RWD-1" }] } }, error: null } });
    await expect(fetchConfig("eco_program")).resolves.toEqual({ rewards: [{ id: "RWD-1" }] });
  });

  it("upserts on the key so a second save updates rather than duplicating", async () => {
    let upserted = null;
    let opts = null;
    mockTable({ onUpsert: (rows, o) => { upserted = rows; opts = o; } });

    await saveConfig("farm_planner", { regions: {} });

    expect(upserted.key).toBe("farm_planner");
    expect(upserted.value).toEqual({ regions: {} });
    expect(opts).toEqual({ onConflict: "key" });
  });
});
