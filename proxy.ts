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
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. Check if the user is logged in
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
  matcher: ['/admin/:path*'],
}