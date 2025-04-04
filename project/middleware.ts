import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CookieOptions } from '@supabase/ssr'

type CookieValue = {
  name: string
  value: string
  options?: CookieOptions
}

export async function middleware(request: NextRequest) {
  console.log("Middleware called for path:", request.nextUrl.pathname);
  console.log("Request URL:", request.nextUrl.toString());
  console.log("Request referrer:", request.headers.get('referer'));
  
  // Create a response object that we'll modify and return
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieValue[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Get the user from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log("Middleware auth check result:", {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    path: request.nextUrl.pathname
  });

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/lecture',
    '/flashcards',
    '/chat',
    '/settings',
  ]

  // Check if the current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  console.log("Route protection check:", {
    isProtectedRoute,
    path: request.nextUrl.pathname
  });

  if (!user && isProtectedRoute) {
    // no user, redirect to the login page
    console.log("No user detected for protected route, redirecting to login");
    console.log("ISSUE DETECTED: Redirecting to '/login' which doesn't exist, should be '/auth/signin'");
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    console.log("Redirecting to:", url.toString());
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You must return the supabaseResponse object as it is
  console.log("Middleware completed for path:", request.nextUrl.pathname);
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 