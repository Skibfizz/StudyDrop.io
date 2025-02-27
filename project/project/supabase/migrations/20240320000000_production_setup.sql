-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');
CREATE TYPE content_type AS ENUM ('video', 'text', 'flashcard');

-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
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

-- Create content table
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type content_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        LOWER(COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
    );

    -- Create subscription (free tier)
    INSERT INTO public.subscriptions (user_id, tier)
    VALUES (NEW.id, 'free');

    -- Initialize usage tracking
    INSERT INTO public.usage_tracking (user_id, reset_date)
    VALUES (NEW.id, timezone('utc'::text, now()));

    -- Log activity
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (
        NEW.id,
        'user_created',
        jsonb_build_object(
            'provider', NEW.raw_user_meta_data->>'provider',
            'email', NEW.email
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER on_profile_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- Create function to reset weekly usage
CREATE OR REPLACE FUNCTION public.reset_weekly_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
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
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
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

    -- Log activity
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (
        p_user_id,
        'usage_incremented',
        jsonb_build_object(
            'type', p_usage_type,
            'amount', p_increment,
            'new_total', v_current_usage + p_increment
        )
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Content policies
CREATE POLICY "Users can view own content"
    ON public.content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content"
    ON public.content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
    ON public.content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
    ON public.content FOR DELETE
    USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Set up database functions for analytics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE (
    total_videos INTEGER,
    total_flashcards INTEGER,
    total_humanizations INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(CASE WHEN c.type = 'video' THEN 1 END)::INTEGER as total_videos,
        COUNT(CASE WHEN c.type = 'flashcard' THEN 1 END)::INTEGER as total_flashcards,
        COUNT(CASE WHEN c.type = 'text' THEN 1 END)::INTEGER as total_humanizations,
        MAX(c.created_at) as last_activity
    FROM public.content c
    WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 