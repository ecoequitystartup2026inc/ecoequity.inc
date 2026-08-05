import { isSupabaseConfigured } from "../supabaseClient";
import { currentUserId, fetchOwnRecords, insertRecord } from "./userRecords";

// ============================================================================
// PLANT SCANS data layer (AI Plant Doctor history).
//
// `confidence` is widened to text in user-data.sql because the app produces
// "94%", not 94 — a scan should never fail to save over a percent sign.
// ============================================================================

const TABLE = "plant_scans";

function scanColumns(scan, userId) {
  return {
    user_id: userId,
    image: scan.image ?? null,
    disease: scan.disease || "",
    confidence: scan.confidence != null ? String(scan.confidence) : null,
  };
}

export async function fetchMyScans(userId) {
  return fetchOwnRecords(TABLE, "user_id", userId);
}

export async function saveScan(scan) {
  if (!isSupabaseConfigured) return null;
  const userId = await currentUserId();
  if (!userId) return null;
  return insertRecord(TABLE, scan, scanColumns(scan, userId));
}
