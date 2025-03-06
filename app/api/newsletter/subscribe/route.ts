import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, source = 'website' } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client...')
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
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
        },
      }
    )
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Try to query a few known tables to check database connectivity
    console.log('Checking database connectivity...')
    try {
      // Try to query the newsletter_subscriptions table first (which we expect to fail)
      const { data: newsletterData, error: newsletterError } = await supabase
        .from('newsletter_subscriptions')
        .select('count(*)', { count: 'exact', head: true })
      
      if (newsletterError) {
        console.log('Newsletter table check result:', newsletterError.message)
      } else {
        console.log('Newsletter table exists with count:', newsletterData)
      }
      
      // Try to query another table that should exist (users)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true })
      
      if (usersError) {
        console.log('Users table check result:', usersError.message)
      } else {
        console.log('Users table exists with count:', usersData)
      }
    } catch (dbCheckError) {
      console.error('Error checking database tables:', dbCheckError)
    }

    // Check if email already exists
    console.log('Attempting to check for existing subscription with email:', email.toLowerCase().trim())
    const { data: existingSubscription, error: lookupError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (lookupError) {
      console.error('Error checking for existing subscription:', lookupError)
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      )
    }

    // If already subscribed and active, return success
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { 
          message: 'You are already subscribed to our newsletter',
          alreadySubscribed: true
        },
        { status: 200 }
      )
    }

    // If exists but not active, update status
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString(),
          source
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          message: 'Your subscription has been reactivated',
          reactivated: true
        },
        { status: 200 }
      )
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert([
        { 
          email: email.toLowerCase().trim(),
          source
        }
      ])

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in newsletter subscription:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 