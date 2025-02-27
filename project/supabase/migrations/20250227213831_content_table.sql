-- Create content table for storing video summaries and other content
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('video', 'document', 'note')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS content_user_id_idx ON public.content(user_id);
CREATE INDEX IF NOT EXISTS content_type_idx ON public.content(type);
CREATE INDEX IF NOT EXISTS content_created_at_idx ON public.content(created_at DESC);

-- Add RLS policies
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own content
CREATE POLICY "Users can view their own content"
ON public.content
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own content
CREATE POLICY "Users can insert their own content"
ON public.content
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own content
CREATE POLICY "Users can update their own content"
ON public.content
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own content
CREATE POLICY "Users can delete their own content"
ON public.content
FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO authenticated;

-- Add comment to the table
COMMENT ON TABLE public.content IS 'Stores user content including video summaries, documents, and notes';
