-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_recent_lectures;

-- Create or replace the function to use the content table
CREATE OR REPLACE FUNCTION public.get_recent_lectures(p_user_id UUID, p_limit INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    title TEXT,
    video_id TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.content->>'videoId' as video_id,
        c.content->>'duration' as duration,
        c.created_at
    FROM 
        public.content c
    WHERE 
        c.user_id = p_user_id
        AND c.type = 'video'
    ORDER BY 
        c.created_at DESC
    LIMIT 
        p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to the function
COMMENT ON FUNCTION public.get_recent_lectures IS 'Retrieves the most recent video lectures processed by a user';

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_recent_lectures TO authenticated;
