-- Migration: add_pricing_tier_tracking
-- Description: Adds a pricing_tier_tracking table to track user pricing tiers over time
-- Created at: 2025-02-27

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pricing_tier_tracking table
CREATE TABLE IF NOT EXISTS public.pricing_tier_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    change_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pricing_tier_tracking_user_id ON public.pricing_tier_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tier_tracking_is_current ON public.pricing_tier_tracking(is_current);
CREATE INDEX IF NOT EXISTS idx_pricing_tier_tracking_tier ON public.pricing_tier_tracking(tier);

-- Enable row level security
ALTER TABLE public.pricing_tier_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view their own tier history
CREATE POLICY "Users can view their own tier history"
    ON public.pricing_tier_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Only allow service role to insert/update/delete
CREATE POLICY "Service role can manage tier history"
    ON public.pricing_tier_tracking FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to handle subscription tier changes
CREATE OR REPLACE FUNCTION public.handle_subscription_tier_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If tier has changed
    IF OLD.tier != NEW.tier THEN
        -- Update the end date of the current tier record
        UPDATE public.pricing_tier_tracking
        SET 
            end_date = timezone('utc'::text, now()),
            is_current = FALSE,
            updated_at = timezone('utc'::text, now())
        WHERE 
            user_id = NEW.user_id 
            AND is_current = TRUE;
            
        -- Insert a new record for the new tier
        INSERT INTO public.pricing_tier_tracking (
            user_id,
            tier,
            start_date,
            change_reason,
            metadata
        )
        VALUES (
            NEW.user_id,
            NEW.tier,
            timezone('utc'::text, now()),
            'subscription_update',
            jsonb_build_object(
                'previous_tier', OLD.tier,
                'new_tier', NEW.tier,
                'subscription_id', NEW.stripe_subscription_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription tier changes
CREATE TRIGGER on_subscription_tier_change
    AFTER UPDATE OF tier ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_subscription_tier_change();

-- Create function to initialize tier history for new users
CREATE OR REPLACE FUNCTION public.initialize_tier_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert initial tier record
    INSERT INTO public.pricing_tier_tracking (
        user_id,
        tier,
        start_date,
        change_reason
    )
    VALUES (
        NEW.user_id,
        NEW.tier,
        timezone('utc'::text, now()),
        'initial_subscription'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new subscriptions
CREATE TRIGGER on_subscription_created
    AFTER INSERT ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_tier_history();

-- Create function to get user's tier history
CREATE OR REPLACE FUNCTION public.get_user_tier_history(p_user_id UUID)
RETURNS TABLE (
    tier subscription_tier,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    is_current BOOLEAN,
    change_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.tier,
        pt.start_date,
        pt.end_date,
        CASE 
            WHEN pt.end_date IS NULL THEN 
                EXTRACT(DAY FROM (timezone('utc'::text, now()) - pt.start_date))::INTEGER
            ELSE 
                EXTRACT(DAY FROM (pt.end_date - pt.start_date))::INTEGER
        END AS duration_days,
        pt.is_current,
        pt.change_reason
    FROM 
        public.pricing_tier_tracking pt
    WHERE 
        pt.user_id = p_user_id
    ORDER BY 
        pt.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_current_tier(p_user_id UUID)
RETURNS TABLE (
    tier subscription_tier,
    start_date TIMESTAMP WITH TIME ZONE,
    days_on_tier INTEGER,
    change_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.tier,
        pt.start_date,
        EXTRACT(DAY FROM (timezone('utc'::text, now()) - pt.start_date))::INTEGER AS days_on_tier,
        pt.change_reason
    FROM 
        public.pricing_tier_tracking pt
    WHERE 
        pt.user_id = p_user_id
        AND pt.is_current = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize tier history for existing subscriptions
INSERT INTO public.pricing_tier_tracking (
    user_id,
    tier,
    start_date,
    change_reason
)
SELECT 
    user_id,
    tier,
    created_at,
    'migration_initialization'
FROM 
    public.subscriptions
ON CONFLICT (id) DO NOTHING; 