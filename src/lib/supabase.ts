import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a real client if configured, otherwise a dummy placeholder
// that won't crash the app — auth calls will just fail gracefully
export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder-key");

const PLACEHOLDER_URLS = [
  "https://placeholder.supabase.co",
  "https://your-project.supabase.co",
  "placeholder.supabase.co",
];
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder_key" &&
  !PLACEHOLDER_URLS.some(p => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes(p))
);
