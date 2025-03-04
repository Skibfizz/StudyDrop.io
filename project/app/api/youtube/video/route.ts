import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const execAsync = promisify(exec);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export const dynamic = 'force-dynamic';

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

async function processTranscriptWithAI(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing educational content. Create a comprehensive summary of the provided transcript that captures the key points, concepts, and insights. Format your response in markdown with clear sections and bullet points where appropriate."
        },
        {
          role: "user",
          content: `Please summarize the following transcript from an educational video:\n\n${transcript}`
        }
      ]
    });

    return completion.choices[0]?.message?.content || "Failed to generate analysis";
  } catch (error) {
    console.error('Error processing with AI:', error);
    throw new Error('Failed to process transcript with AI');
  }
}

async function getTranscript(videoId: string) {
  try {
    // Get the absolute path to the script and log relevant paths
    const scriptPath = path.join(process.cwd(), 'scripts', 'get_transcript.py');
    console.log('Debug Info:', {
      currentWorkingDir: process.cwd(),
      scriptPath,
      scriptExists: require('fs').existsSync(scriptPath),
      pythonPath: process.env.PATH
    });
    
    // Run the Python script with absolute path and capture all output
    console.log('Executing command:', `python "${scriptPath}" ${videoId}`);
    const { stdout, stderr } = await execAsync(`python "${scriptPath}" ${videoId}`);
    
    console.log('Python stdout:', stdout);
    console.log('Python stderr:', stderr);

    // Only treat stderr as error if it doesn't contain our success message
    if (stderr && !stderr.includes('Successfully fetched transcript')) {
      console.error('Python script error:', stderr);
      throw new Error('Failed to fetch video transcript');
    }

    try {
      const result = JSON.parse(stdout);
      console.log('Parsed result:', result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transcript');
      }
      return result.transcript;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw stdout:', stdout);
      throw new Error('Failed to parse transcript data');
    }
  } catch (error) {
    console.error('Detailed error in getTranscript:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Failed to get transcript: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Check if the video data exists in the database
async function getVideoDataFromDB(videoId: string, userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('content')
      .select('id, title, content')
      .eq('user_id', userId)
      .eq('type', 'video')
      .eq('content->>videoId', videoId)
      .single();
    
    if (error) {
      console.error('Error fetching video data from DB:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get video data from DB:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

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

    // First, check if we already have this video in the database
    const existingData = await getVideoDataFromDB(videoId, user.id);
    
    if (existingData && existingData.content) {
      return new Response(JSON.stringify({
        videoId,
        title: existingData.title,
        summary: existingData.content.summary,
        transcript: existingData.content.transcript,
        duration: existingData.content.duration || 'PT00M00S'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If not in database, fetch and process the video
    const transcript = await getTranscript(videoId);
    const summary = await processTranscriptWithAI(transcript);

    // Get video details using YouTube API (title, duration, etc.)
    // This would typically be part of the getTranscript function or a separate function

    return new Response(JSON.stringify({
      videoId,
      title: 'Video ' + videoId, // This would be replaced with actual title
      summary,
      transcript,
      duration: 'PT00M00S' // This would be replaced with actual duration
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 