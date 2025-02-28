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

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

async function processTranscriptWithAI(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert at creating educational summaries. Your task is to analyze video transcripts and create comprehensive, well-structured study materials. Format your response in markdown using the following structure:

# Study Materials for "[Video Title]"

## Executive Summary
A concise 2-3 sentence overview of the main topic and key takeaways.

## Main Topics & Key Points
* Point 1 with brief explanation
* Point 2 with brief explanation
* ...

## Important Concepts & Definitions
* **Term 1**: Clear, concise definition
* **Term 2**: Clear, concise definition
* ...

## Study Notes & Explanations
* Detailed explanation of concept 1
  * Supporting details
  * Examples
* Detailed explanation of concept 2
  * Supporting details
  * Examples

## Potential Quiz Questions
1. Question 1?
   * Answer with explanation
2. Question 2?
   * Answer with explanation
3. Question 3?
   * Answer with explanation

Use **bold** for emphasis on key terms.
Use *italics* for important concepts.
Use > blockquotes for memorable quotes or key takeaways.`
        },
        {
          role: "user",
          content: `Please analyze this video transcript and create study materials:

${transcript}`
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
    throw error;
  }
}

// Function to increment usage only after successful API response
async function incrementUsage(userId: string) {
  try {
    if (!userId) {
      console.log('No user ID provided for usage tracking');
      return;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc(
      'check_and_increment_usage',
      {
        p_user_id: userId,
        p_usage_type: 'video_summaries',
        p_increment: 1
      }
    );

    if (error) {
      console.error('Error incrementing usage:', error);
    } else {
      console.log('Usage incremented successfully:', data);
    }
  } catch (error) {
    console.error('Failed to increment usage:', error);
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'YouTube URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get transcript
    const transcriptData = await getTranscript(videoId);
    
    // Process with AI
    const analysis = await processTranscriptWithAI(transcriptData);

    // Get the current user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only increment usage after successful API response
    if (user) {
      await incrementUsage(user.id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      videoId,
      summary: analysis,
      transcript: transcriptData // Include the transcript in the response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in YouTube API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to process YouTube video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 