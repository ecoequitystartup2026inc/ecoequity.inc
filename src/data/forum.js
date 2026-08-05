import { isSupabaseConfigured } from "../supabaseClient";
import {
  currentUserId, fetchAllRecords, insertRecord, updateRecord, deleteRecord,
} from "./userRecords";

// ============================================================================
// COMMUNITY FORUM data layer.
//
// The one entity here that is read PUBLICLY — forum_read in schema.sql is
// `using (true)`, because a forum nobody can read is not a forum. Writes are
// still owner-scoped: you may edit your own post, admins moderate any.
// ============================================================================

const TABLE = "forum_posts";

function postColumns(post, userId) {
  return {
    author_id: userId,
    author_name: post.author || "",
    title: post.title || "",
    body: post.body || "",
  };
}

// Everyone's posts, newest first.
export async function fetchForumPosts() {
  return fetchAllRecords(TABLE);
}

export async function saveForumPost(post) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return insertRecord(TABLE, post, postColumns(post, userId));
}

// Likes, replies, pinning — the whole record goes back into `data`.
export async function updateForumPost(post) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return updateRecord(TABLE, post, {
    title: post.title || "",
    body: post.body || "",
  });
}

export async function deleteForumPost(id) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return deleteRecord(TABLE, id);
}
