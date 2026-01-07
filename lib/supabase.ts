import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✨ This version saves the session in Cookies so your middleware works
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)