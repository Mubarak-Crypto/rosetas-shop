"use server";

import { createClient } from "@supabase/supabase-js";

// ✨ SERVER ACTION: This runs securely on the backend, invisible to the browser.
export async function updateExpressProfile(profilePayload: any) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  // 1. Create a server-side admin client that securely bypasses RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );

  // 2. Execute the write operation securely behind the scenes
  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}