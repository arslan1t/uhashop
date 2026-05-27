import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ users: [], message: "Supabase not configured" }, { status: 200 });
  }
  try {
    // Try with last_sign_in first, fall back without it
    let data = null;
    let error = null;

    const res1 = await supabase
      .from("profiles")
      .select("id, name, email, telegram, avatar_url, created_at, last_sign_in")
      .order("created_at", { ascending: false });

    if (res1.error?.message?.includes("last_sign_in")) {
      // Column doesn't exist yet — query without it
      const res2 = await supabase
        .from("profiles")
        .select("id, name, email, telegram, avatar_url, created_at")
        .order("created_at", { ascending: false });
      data = res2.data;
      error = res2.error;
    } else {
      data = res1.data;
      error = res1.error;
    }

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ users: [], error: "table_not_found" });
      }
      return NextResponse.json({ users: [], error: error.message });
    }

    return NextResponse.json({ users: data || [] });
  } catch (e) {
    return NextResponse.json({ users: [], error: String(e) });
  }
}
