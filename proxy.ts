import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✨ RENAMED BACK TO PROXY: The terminal has spoken! Your setup requires this.
// 🐛 NEW FIX: Next.js completely ignores this file if it is not named proxy.ts!
// 🐛 NEW FIX: The function MUST be named 'proxy' to avoid that deprecation warning.
// 🐛 NEW FIX: Keeping all the VIP admin checks and background session refreshing!
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

  // 👑 NEW FIX: Define our exact authorized admins using the specific emails you provided!
  const adminEmails = ['madina.albukaeva@icloud.com', 'rosetasbouquetde@gmail.com']
  const isAdmin = user && adminEmails.includes(user.email ?? '')

  // 4. SECURITY CHECK (The "Bouncer")
  // If the URL starts with "/admin"
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to the Login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If they are already logged in, send them to dashboard
      if (user) {
        // 👑 NEW FIX: If they are a verified admin, send to admin dashboard.
        if (isAdmin) {
          // ✨ NOTE: Next.js 16 requires absolute URLs for redirects (which we are already doing here)
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else {
          // 👑 NEW FIX: If a regular customer tries to hit the admin login, bounce them to the regular store!
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
      return response
    }

    // For any other admin page, if NOT logged in -> Kick to login
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // 👑 NEW FIX: If they ARE logged in, but their email is NOT one of the 2 admin emails, kick them out!
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ✨ PUBLIC LOGIN CHECK: If an already authenticated user visits the client /login page,
  // ✨ redirect them back to the home page so they don't get stuck looking at the login form.
  // 👑 NEW FIX: Also checking /dashboard here so VIP admins go straight back to their admin portal!
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/dashboard') {
    if (user) {
      // 👑 VIP Admin check: Teleport admins back to their portal!
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      // 🧑‍🤝‍🧑 Normal customer check: Send them to customer dashboard!
      if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  // ✨ UPDATE: Added your auth callback route to the matcher so the proxy actually processes it.
  // ✨ UPDATE: Without this, the proxy ignores the Google login return, causing the loop.
  // 🐛 NEW FIX: Added a global matcher below so the session refreshes no matter what page she visits!
  matcher: [
    '/admin/:path*',
    '/auth/callback',
    // 🐛 NEW FIX: This ensures the proxy runs across the whole site to constantly keep her logged in.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}