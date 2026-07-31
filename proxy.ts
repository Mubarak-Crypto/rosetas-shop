import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✨ RENAME: This function must now be called 'proxy' instead of 'middleware'
export async function proxy(request: NextRequest) {
  // 1. Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Setup the Supabase Client
  // ✨ UPDATE: The older get/set/remove methods cause redirect loops in Next.js 16.
  // ✨ UPDATE: We replaced them with getAll and setAll to properly synchronize 
  // ✨ UPDATE: the server and client cookies during the OAuth callback phase.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✨ UPDATE: Replaced 'get' with 'getAll' to grab all cookies securely at once
        getAll() {
          return request.cookies.getAll()
        },
        // ✨ UPDATE: Replaced 'set' and 'remove' with 'setAll' to handle both actions safely
        setAll(cookiesToSet) {
          // First loop: update the request cookies so subsequent checks see them immediately
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          // Re-create the response to apply the updated request headers
          response = NextResponse.next({
            request,
          })
          
          // Second loop: apply the final cookies to the outgoing response 
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. Check if the user is logged in
  // ✨ UPDATE: This getUser() call is what triggers the setAll block above to refresh the session!
  const { data: { user } } = await supabase.auth.getUser()

  // 4. SECURITY CHECK (The "Bouncer")
  // If the URL starts with "/admin"
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to the Login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If they are already logged in, send them to dashboard
      if (user) {
        // ✨ NOTE: Next.js 16 requires absolute URLs for redirects (which we are already doing here)
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return response
    }

    // For any other admin page, if NOT logged in -> Kick to login
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  // ✨ UPDATE: Added your auth callback route to the matcher so the proxy actually processes it.
  // ✨ UPDATE: Without this, the proxy ignores the Google login return, causing the loop.
  matcher: [
    '/admin/:path*',
    '/auth/callback'
  ],
}