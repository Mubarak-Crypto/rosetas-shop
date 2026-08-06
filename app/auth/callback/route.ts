import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Safely handle production load balancers and domain proxies
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  
  let origin = requestUrl.origin;
  if (!isLocalEnv && forwardedHost) {
    origin = `https://${forwardedHost}`;
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handled via middleware
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- NEW CODE ADDED TO HANDLE REDIRECT PARAMETER ---
      // Extract the 'next' parameter from the URL to know where to send the user
      const next = requestUrl.searchParams.get('next');
      
      // ⚠️ Make sure '/dashboard' actually exists in your app!
      // UPDATED: If there is a 'next' parameter (like /update-password), go there.
      // Otherwise, fall back to the default /dashboard route.
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      console.error("Supabase Session Exchange Error:", error.message);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}