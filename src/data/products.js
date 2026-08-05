import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { iconElement, iconName } from "./icons";

// ============================================================================
// PRODUCTS data layer — the REFERENCE PATTERN for migrating an entity off
// React state and onto Supabase. Copy this file's shape for orders, events,
// forum posts, etc.
//
// Every function works in two modes:
//   - Supabase configured  -> reads/writes the real database
//   - Not configured        -> returns null so callers keep their sample data
// This lets you wire the DB in gradually without breaking the running app.
// ============================================================================

// Convert a database row into the shape App.js components expect.
// The DB stores `emoji` as a NAME string; we rebuild the <Icon/> here at render.
function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    badge: row.badge,
    stock: row.stock,
    description: row.description,
    sustainabilityBadge: row.sustainability_badge,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    emoji: iconElement(row.emoji), // name string -> React element
    reviews: [], // load separately via fetchProductReviews if needed
  };
}

// Convert an in-app product into a DB row for insert/update.
function productToRow(p) {
  return {
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    // store the icon NAME (string), never a React element. Accept a raw name,
    // an explicit emojiName, or recover the name from a <Icon/> element.
    emoji: typeof p.emoji === "string" ? p.emoji : (p.emojiName || iconName(p.emoji)),
    badge: p.badge,
    stock: p.stock,
    description: p.description,
    sustainability_badge: p.sustainabilityBadge,
    rating: p.rating,
    review_count: p.reviewCount,
  };
}

export async function fetchProducts() {
  if (!isSupabaseConfigured) return null; // caller keeps sample data
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  // A null payload with no error isn't a usable result — report it the same way
  // as "not configured" so the caller keeps its sample data instead of crashing.
  if (!Array.isArray(data)) return null;
  return data.map(rowToProduct);
}

export async function createProduct(product) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("products")
    .insert(productToRow(product))
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProduct(id, patch) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("products")
    .update(productToRow(patch))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function fetchProductReviews(productId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("product_reviews")
    .select("user_name, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ user: r.user_name, rating: r.rating, comment: r.comment }));
}

// Write a review. `product_id` is a real FK, so this only works for products
// that came from the database — a review left on a sample product (numeric id)
// is kept in local state instead of being forced into a column that expects a
// uuid. reviews_insert in schema.sql requires author_id = auth.uid(), so the
// review is attributed to whoever is signed in.
export async function createReview(productId, { rating, comment, userName }) {
  if (!isSupabaseConfigured) return null;
  if (typeof productId !== "string") return null; // sample product, not a DB row

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    author_id: user.id,
    user_name: userName || user.email || "Customer",
    rating: Number(rating) || 5,
    comment: comment || "",
  });
  if (error) throw error;
  return true;
}
