import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function middleware(req: NextRequest) {
  const startTime = Date.now();
  console.log('⏰ Middleware Start:', {
    path: req.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });

  // Create a response object that we can modify
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    // Create supabase client with response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    );

    // Log initial request state
    console.log('📝 Initial Request State:', {
      path: req.nextUrl.pathname,
      cookies: req.cookies.toString(),
      hasAuthCookie: req.cookies.has('sb-auth-token'),
      timeSinceStart: `${Date.now() - startTime}ms`
    });

    // Try to refresh the session first
    console.log('🔄 Attempting session refresh...');
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    
    console.log('📊 Post-refresh Session State:', {
      hasSession: !!refreshedSession,
      userId: refreshedSession?.user?.id,
      accessToken: !!refreshedSession?.access_token,
      timeSinceStart: `${Date.now() - startTime}ms`
    });

    // Check if the request is for a protected route
    const isProtectedRoute = req.nextUrl.pathname === '/dashboard' || 
                           req.nextUrl.pathname.startsWith('/api/stripe/') ||
                           (req.nextUrl.pathname === '/pricing' && req.method === 'POST');

    // If no session and trying to access protected routes, redirect to sign in
    if (!refreshedSession && isProtectedRoute) {
      console.log('⚠️ No session for protected route, redirecting to sign in');
      
      // Store the original URL to redirect back after sign in
      const redirectUrl = new URL('/auth/signin', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      
      return NextResponse.redirect(redirectUrl);
    }

    // Add session user to request context
    if (refreshedSession?.user) {
      console.log('✅ User authenticated:', {
        userId: refreshedSession.user.id,
        email: refreshedSession.user.email
      });
    }

  } catch (error) {
    console.error('❌ Error in middleware:', error);
    // Continue to next middleware/route handler despite error
  } finally {
    console.log('⏰ Middleware End:', {
      duration: `${Date.now() - startTime}ms`
    });
  }

  return res;
}

export default middleware;

export const config = {
  matcher: [
    '/dashboard',
    '/pricing',
    '/api/stripe/:path*'
  ]
}; 