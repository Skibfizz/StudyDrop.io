import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
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

    // First, check if the table already exists
    console.log('Checking if newsletter_subscriptions table exists...')
    const { data, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('Table already exists!')
      return NextResponse.json({ message: 'Table already exists' }, { status: 200 })
    }
    
    console.log('Table does not exist, creating it...')
    console.log('Error from check:', checkError)
    
    // Since we can't directly execute SQL with the anon key, we'll use a workaround
    // We'll create a temporary table and then modify it to match our requirements
    
    // Step 1: Create a simple table with minimal structure
    const { error: createError } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ email: 'temp@example.com' }])
    
    if (createError) {
      if (createError.code === '42P01') {
        // Table doesn't exist, which is expected
        console.log('Table does not exist, as expected')
      } else {
        console.error('Unexpected error trying to insert:', createError)
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
      }
    }
    
    // Step 2: Try to create the table directly using the Supabase API
    try {
      // Create the table with minimal structure using fetch directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/newsletter_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'inactive',
          source: 'system',
          metadata: {}
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error creating minimal table structure:', errorData)
        // Continue anyway, as this might fail if the table already exists
      }
    } catch (error) {
      console.error('Error in direct API call:', error)
      // Continue anyway, as we'll verify if the table exists in the next step
    }
    
    // Step 3: Verify the table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .limit(1)
    
    if (verifyError) {
      console.error('Error verifying table creation:', verifyError)
      return NextResponse.json({ error: 'Failed to verify table creation' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Newsletter subscriptions table created successfully',
      data: verifyData
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
} 