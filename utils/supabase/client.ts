import { createBrowserClient } from '@supabase/ssr'

// We maintain the exact function signature to avoid breaking existing imports.
// This client automatically manages browser cookies and auth sessions, 
// which is required for our Realtime RLS policies to identify Askhab and Madina.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}