-- Create the pending_subscriptions table
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  payment_intent_id TEXT,
  intended_plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  claimed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on anonymous_id for faster lookups
CREATE INDEX IF NOT EXISTS pending_subscriptions_anonymous_id_idx ON pending_subscriptions(anonymous_id);

-- Create an index on status for faster lookups
CREATE INDEX IF NOT EXISTS pending_subscriptions_status_idx ON pending_subscriptions(status);

-- Create an index on payment_intent_id for faster lookups
CREATE INDEX IF NOT EXISTS pending_subscriptions_payment_intent_id_idx ON pending_subscriptions(payment_intent_id);

-- Add RLS policies
ALTER TABLE pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to do anything
CREATE POLICY "Service role can do anything" ON pending_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own claimed subscriptions
CREATE POLICY "Users can view their own claimed subscriptions" ON pending_subscriptions
  FOR SELECT
  TO authenticated
  USING (claimed_by_user_id = auth.uid());

-- Allow anon users to create pending subscriptions
CREATE POLICY "Anon can create pending subscriptions" ON pending_subscriptions
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending'); 