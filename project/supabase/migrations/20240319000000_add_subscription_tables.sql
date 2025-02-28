-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_summaries_count INTEGER DEFAULT 0,
    flashcard_sets_count INTEGER DEFAULT 0,
    text_humanizations_count INTEGER DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Create function to reset usage counts weekly
CREATE OR REPLACE FUNCTION reset_weekly_usage()
RETURNS void AS $$
BEGIN
    UPDATE usage_tracking
    SET 
        video_summaries_count = 0,
        flashcard_sets_count = 0,
        text_humanizations_count = 0,
        reset_date = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE reset_date IS NULL OR reset_date <= timezone('utc'::text, now()) - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to check and increment usage
CREATE OR REPLACE FUNCTION check_and_increment_usage(
    p_user_id UUID,
    p_usage_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier subscription_tier;
    v_current_usage INTEGER;
    v_usage_limit INTEGER;
    v_tracking_record usage_tracking%ROWTYPE;
BEGIN
    -- Get user's subscription tier
    SELECT tier INTO v_tier
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- If no subscription found, default to free tier
    IF v_tier IS NULL THEN
        v_tier := 'free';
        
        -- Create default subscription record
        INSERT INTO subscriptions (user_id, tier)
        VALUES (p_user_id, 'free')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Get or create usage tracking record
    SELECT * INTO v_tracking_record
    FROM usage_tracking
    WHERE user_id = p_user_id;

    IF v_tracking_record IS NULL THEN
        INSERT INTO usage_tracking (user_id, reset_date)
        VALUES (p_user_id, timezone('utc'::text, now()))
        RETURNING * INTO v_tracking_record;
    END IF;

    -- Get current usage based on type
    CASE p_usage_type
        WHEN 'video_summaries' THEN
            v_current_usage := v_tracking_record.video_summaries_count;
        WHEN 'flashcard_sets' THEN
            v_current_usage := v_tracking_record.flashcard_sets_count;
        WHEN 'text_humanizations' THEN
            v_current_usage := v_tracking_record.text_humanizations_count;
        ELSE
            RAISE EXCEPTION 'Invalid usage type: %', p_usage_type;
    END CASE;

    -- Set usage limit based on tier
    CASE v_tier
        WHEN 'free' THEN
            CASE p_usage_type
                WHEN 'video_summaries' THEN v_usage_limit := 5;
                WHEN 'flashcard_sets' THEN v_usage_limit := 5;
                WHEN 'text_humanizations' THEN v_usage_limit := 10;
            END CASE;
        WHEN 'basic' THEN
            CASE p_usage_type
                WHEN 'video_summaries' THEN v_usage_limit := 20;
                WHEN 'flashcard_sets' THEN v_usage_limit := 20;
                WHEN 'text_humanizations' THEN v_usage_limit := 40;
            END CASE;
        WHEN 'pro' THEN
            CASE p_usage_type
                WHEN 'video_summaries' THEN v_usage_limit := 1000;
                WHEN 'flashcard_sets' THEN v_usage_limit := 1000;
                WHEN 'text_humanizations' THEN v_usage_limit := 500;
            END CASE;
    END CASE;

    -- Check if increment would exceed limit
    IF v_current_usage + p_increment > v_usage_limit THEN
        RETURN FALSE;
    END IF;

    -- Increment usage
    CASE p_usage_type
        WHEN 'video_summaries' THEN
            UPDATE usage_tracking
            SET video_summaries_count = video_summaries_count + p_increment,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = p_user_id;
        WHEN 'flashcard_sets' THEN
            UPDATE usage_tracking
            SET flashcard_sets_count = flashcard_sets_count + p_increment,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = p_user_id;
        WHEN 'text_humanizations' THEN
            UPDATE usage_tracking
            SET text_humanizations_count = text_humanizations_count + p_increment,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = p_user_id;
    END CASE;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscription and usage data
CREATE POLICY "Users can view their own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to handle subscription updates from Stripe webhook
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger AS $$
BEGIN
    -- Reset usage when subscription tier changes
    IF OLD.tier != NEW.tier THEN
        UPDATE usage_tracking
        SET 
            video_summaries_count = 0,
            flashcard_sets_count = 0,
            text_humanizations_count = 0,
            reset_date = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription updates
CREATE TRIGGER on_subscription_update
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_update();

-- Insert default free subscription for existing users
INSERT INTO subscriptions (user_id, tier)
SELECT id, 'free'::subscription_tier
FROM auth.users
ON CONFLICT (user_id) DO NOTHING; 