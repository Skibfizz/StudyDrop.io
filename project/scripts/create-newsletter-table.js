// Script to create the newsletter_subscriptions table
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

// Parse environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const [, key, value] = match
    envVars[key.trim()] = value.trim()
  }
})

// Initialize Supabase client
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function createNewsletterTable() {
  console.log('Creating newsletter_subscriptions table...')
  
  try {
    // First, check if the table already exists
    const { data, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('Table already exists!')
      return true
    }
    
    console.log('Table does not exist, creating it...')
    
    // Execute SQL query to create the table
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Create newsletter_subscriptions table
        CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          status TEXT DEFAULT 'active' NOT NULL,
          source TEXT DEFAULT 'website' NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb
        );

        -- Add comment to the table
        COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores email addresses of users who have subscribed to the newsletter';

        -- Create index on email for faster lookups
        CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);

        -- Create index on status for filtering
        CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON public.newsletter_subscriptions(status);

        -- Enable Row Level Security
        ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

        -- Create policy for service role to manage all subscriptions
        CREATE POLICY "Service role can manage all newsletter subscriptions" 
        ON public.newsletter_subscriptions 
        FOR ALL 
        TO service_role 
        USING (true);

        -- Create policy to allow anyone to insert (subscribe)
        CREATE POLICY "Anyone can subscribe to newsletter" 
        ON public.newsletter_subscriptions 
        FOR INSERT 
        TO anon, authenticated 
        WITH CHECK (true);

        -- Create function to update the updated_at timestamp
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger to automatically update the updated_at column
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.newsletter_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
      `
    })
    
    if (error) {
      console.error('Error creating table:', error)
      return false
    }
    
    console.log('Newsletter subscriptions table created successfully!')
    return true
  } catch (err) {
    console.error('Unexpected error:', err)
    return false
  }
}

// Run the function
createNewsletterTable()
  .then(success => {
    console.log('Operation completed with status:', success ? 'SUCCESS' : 'FAILED')
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  }) 