import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const startTime = Date.now()
  console.log('🎯 Auth callback triggered:', {
    timestamp: new Date().toISOString(),
  })

  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    console.log('📝 Callback details:', {
      hasCode: !!code,
      url: requestUrl.toString(),
      searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
      timeSinceStart: `${Date.now() - startTime}ms`,
    })

    if (code) {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          } as any,
        }
      )

      // Check initial session state
      const initialSession = await supabase.auth.getSession()
      console.log('📊 Initial session state:', {
        hasSession: !!initialSession.data.session,
        timeSinceStart: `${Date.now() - startTime}ms`,
      })

      console.log('🔄 Exchanging code for session...')
      const {
        data: { session },
        error,
      } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Session exchange error:', error)
        throw error
      }

      console.log('✅ Session established:', {
        hasSession: !!session,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        timeSinceStart: `${Date.now() - startTime}ms`,
      })

      // Create default subscription for new user
      if (session?.user) {
        console.log('👥 Creating default subscription for user:', session.user.id)
        const { error: subscriptionError } = await supabase.from('subscriptions').upsert(
          {
            user_id: session.user.id,
            tier: 'free',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )

        if (subscriptionError) {
          console.error('❌ Error creating subscription:', subscriptionError)
        } else {
          console.log('✅ Default subscription created')
        }

        // Create initial usage tracking record
        console.log('📊 Creating usage tracking record')
        const { error: usageError } = await supabase.from('usage_tracking').upsert(
          {
            user_id: session.user.id,
            video_summaries_count: 0,
            flashcard_sets_count: 0,
            text_humanizations_count: 0,
            reset_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )

        if (usageError) {
          console.error('❌ Error creating usage tracking:', usageError)
        } else {
          console.log('✅ Usage tracking record created')
        }
      }

      // Verify session was properly stored
      const verifySession = await supabase.auth.getSession()
      console.log('🔍 Session verification:', {
        sessionExists: !!verifySession.data.session,
        sessionMatches: verifySession.data.session?.user?.id === session?.user?.id,
        timeSinceStart: `${Date.now() - startTime}ms`,
      })

      // Check cookies after session exchange
      const allCookies = cookieStore.getAll()
      console.log('🍪 Cookies after session exchange:', {
        cookieCount: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
        hasSupabaseCookie: allCookies.some(c => c.name.startsWith('sb-')),
        timeSinceStart: `${Date.now() - startTime}ms`,
      })
    }

    // URL to redirect to after sign in process completes
    console.log('➡️ Redirecting to dashboard...')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('❌ Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', request.url))
  } finally {
    console.log('⏰ Auth callback completed:', {
      duration: `${Date.now() - startTime}ms`,
    })
  }
}
