import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.session?.user) {
      console.log("User authenticated:", data.session.user.id);
      
      // Check for pending subscription
      const pendingSubscriptionCookie = cookieStore.get('studydrop_pending_subscription');
      const anonymousIdCookie = cookieStore.get('studydrop_anonymous_id');
      
      if (pendingSubscriptionCookie || anonymousIdCookie) {
        console.log("Found pending subscription data");
        
        let pendingData = null;
        let anonymousId = null;
        
        // Parse the pending subscription data
        if (pendingSubscriptionCookie) {
          try {
            pendingData = JSON.parse(pendingSubscriptionCookie.value);
            anonymousId = pendingData.anonymous_id;
            console.log("Parsed pending subscription data:", pendingData);
          } catch (e) {
            console.error("Error parsing pending subscription cookie:", e);
          }
        }
        
        // If no anonymous ID from pending data, try the anonymous ID cookie
        if (!anonymousId && anonymousIdCookie) {
          anonymousId = anonymousIdCookie.value;
          console.log("Using anonymous ID from cookie:", anonymousId);
        }
        
        if (anonymousId) {
          // Look up the pending subscription in the database
          const { data: pendingSubscription } = await supabase
            .from('pending_subscriptions')
            .select('*')
            .eq('anonymous_id', anonymousId)
            .eq('status', 'paid')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          console.log("Found pending subscription in database:", pendingSubscription);
          
          if (pendingSubscription) {
            // Calculate subscription period (1 week from now)
            const now = new Date();
            const oneWeekLater = new Date(now);
            oneWeekLater.setDate(oneWeekLater.getDate() + 7);
            
            // Create a subscription for the user
            const { error: subscriptionError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: data.session.user.id,
                tier: pendingSubscription.intended_plan,
                status: 'active',
                stripe_customer_id: pendingSubscription.stripe_customer_id,
                current_period_start: now.toISOString(),
                current_period_end: oneWeekLater.toISOString(),
                updated_at: now.toISOString()
              });
              
            if (subscriptionError) {
              console.error("Error creating subscription from pending data:", subscriptionError);
            } else {
              console.log("Successfully created subscription from pending data");
              
              // Update the pending subscription to mark it as claimed
              await supabase
                .from('pending_subscriptions')
                .update({
                  status: 'claimed',
                  claimed_by_user_id: data.session.user.id,
                  updated_at: now.toISOString()
                })
                .eq('id', pendingSubscription.id);
            }
          }
        }
        
        // Clear the cookies
        const response = NextResponse.redirect(requestUrl.origin + next);
        response.cookies.set('studydrop_pending_subscription', '', { 
          path: '/',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax'
        });
        response.cookies.set('studydrop_anonymous_id', '', { 
          path: '/',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax'
        });
        response.cookies.set('studydrop_payment_intent', '', { 
          path: '/',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax'
        });
        
        return response;
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + next);
} 