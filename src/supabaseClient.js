import { createClient } from "@supabase/supabase-js";

// Reads from .env.local (see .env.example). In Create React App, only vars
// prefixed with REACT_APP_ are exposed to the browser bundle.
export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Until you add real keys, `supabase` is null and the data layer falls back to
// the existing in-app sample data — so the app keeps running unchanged.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
