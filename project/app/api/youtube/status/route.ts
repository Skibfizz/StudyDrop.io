import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Create Supabase server client
async function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Video ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the current user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if this video exists in the database for this user
    const { data: existingVideo, error } = await supabase
      .from('content')
      .select('id, title, content')
      .eq('user_id', user.id)
      .eq('type', 'video')
      .eq('content->>videoId', videoId)
      .single();
    
    if (error) {
      // Video is still processing or doesn't exist
      return new Response(JSON.stringify({ 
        status: 'processing',
        message: 'Your video is still being processed. Please check back in a few moments.'
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Video exists, return the data
    return new Response(JSON.stringify({ 
      status: 'completed',
      videoId,
      title: existingVideo.title,
      duration: existingVideo.content.duration || 'PT00M00S',
      summary: existingVideo.content.summary,
      transcript: existingVideo.content.transcript
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in status check API:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 