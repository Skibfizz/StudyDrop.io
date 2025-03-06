import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';
import { saveVideoSummary } from '@/lib/video-helpers';

// Add logging to help diagnose deployment issues
console.log('YouTube API route loaded');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

// JavaScript fallback for fetching YouTube transcripts
async function fetchTranscriptWithJS(videoId: string) {
  console.log('Using JavaScript fallback to fetch transcript for video:', videoId);
  try {
    // Try multiple methods to get the transcript
    // Method 1: Using the standard YouTube page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();
    
    // Try different patterns to find caption tracks
    const patterns = [
      /"captionTracks":\[.*?"baseUrl":"(.*?)"/,
      /"captionTracks":\s*\[\s*\{\s*"baseUrl":\s*"([^"]+)"/,
      /{"captionTracks":.*?"baseUrl":"([^"]+)"/
    ];
    
    let captionUrl = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        captionUrl = match[1].replace(/\\u0026/g, '&');
        console.log('Found caption URL with pattern:', pattern);
        break;
      }
    }
    
    // Method 2: Try using the embed page if the main page didn't work
    if (!captionUrl) {
      console.log('Trying embed page for captions');
      const embedResponse = await fetch(`https://www.youtube.com/embed/${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const embedHtml = await embedResponse.text();
      
      for (const pattern of patterns) {
        const match = embedHtml.match(pattern);
        if (match && match[1]) {
          captionUrl = match[1].replace(/\\u0026/g, '&');
          console.log('Found caption URL in embed page');
          break;
        }
      }
    }
    
    if (!captionUrl) {
      console.log('No caption tracks found in YouTube page');
      throw new Error('No captions available for this video');
    }
    
    console.log('Found caption URL:', captionUrl);
    
    // Fetch the actual transcript
    const transcriptResponse = await fetch(captionUrl);
    const transcriptXml = await transcriptResponse.text();
    
    // Parse the XML to extract text
    const textSegments = transcriptXml.match(/<text[^>]*>(.*?)<\/text>/g) || [];
    if (textSegments.length === 0) {
      console.log('No text segments found in transcript XML');
      throw new Error('Failed to parse transcript data');
    }
    
    const transcript = textSegments
      .map(segment => {
        // Extract the text content and decode HTML entities
        const text = segment.replace(/<text[^>]*>(.*?)<\/text>/, '$1')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        return text;
      })
      .join(' ');
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Empty transcript returned');
    }
    
    console.log('Successfully fetched transcript with JS fallback');
    return transcript;
  } catch (error) {
    console.error('Error in JS transcript fallback:', error);
    throw new Error('Failed to fetch transcript with JavaScript fallback');
  }
}

async function getTranscript(videoId: string) {
  try {
    // Get the absolute path to the script and log relevant paths
    const scriptPath = path.join(process.cwd(), 'scripts', 'get_transcript.py');
    
    // Enhanced debugging information
    console.log('Environment Debug Info:', {
      currentWorkingDir: process.cwd(),
      scriptPath,
      scriptExists: require('fs').existsSync(scriptPath),
      nodeVersion: process.version,
      platform: process.platform,
      env: {
        PATH: process.env.PATH,
        PYTHONPATH: process.env.PYTHONPATH,
        VERCEL_REGION: process.env.VERCEL_REGION,
        VERCEL_ENV: process.env.VERCEL_ENV,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
    console.log(`Attempting to execute Python script: python ${scriptPath} ${videoId}`);
    
    try {
      // First try using the Python script
      const { stdout, stderr } = await execAsync(`python ${scriptPath} ${videoId}`);
      
      if (stderr) {
        console.warn('Python script stderr:', stderr);
      }
      
      console.log('Python script stdout length:', stdout.length);
      
      try {
        const result = JSON.parse(stdout);
        if (result.success) {
          console.log('Successfully fetched transcript with Python');
          return result.transcript;
        } else {
          console.error('Python script error:', result.error, result.details);
          throw new Error(result.error);
        }
      } catch (parseError) {
        console.error('Error parsing Python script output:', parseError);
        console.log('Raw stdout:', stdout.substring(0, 500) + '...');
        throw new Error('Failed to parse Python script output');
      }
    } catch (pythonError) {
      console.error('Error executing Python script:', pythonError);
      console.log('Falling back to JavaScript implementation');
      return await fetchTranscriptWithJS(videoId);
    }
  } catch (error: unknown) {
    console.error('Error in getTranscript:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get transcript: ${errorMessage}`);
  }
}

// Function to check if user has reached their usage limit
async function checkUsageLimit(userId: string, usageType: string): Promise<boolean> {
  try {
    if (!userId) {
      console.log('No user ID provided for usage limit check');
      return false;
    }

    console.log('Checking usage limit for user:', {
      userId,
      usageType,
      timestamp: new Date().toISOString()
    });

    const supabase = await createSupabaseServerClient();
    
    // Get user's subscription tier
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
      
    if (subscriptionError) {
      console.error('Error fetching subscription:', {
        error: subscriptionError.message,
        details: subscriptionError.details,
        hint: subscriptionError.hint,
        code: subscriptionError.code,
        userId
      });
      
      // Create a default subscription for this user if it doesn't exist
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({ user_id: userId, tier: 'free' })
        .single();
        
      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating default subscription:', insertError);
        return true; // Allow usage if we can't check properly
      }
    }
    
    // Default to free tier if no subscription found
    const tier = subscription?.tier || 'free';
    console.log('User subscription tier:', { tier, userId });
    
    // Get current usage
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (usageError && usageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching usage:', {
        error: usageError.message,
        details: usageError.details,
        hint: usageError.hint,
        code: usageError.code,
        userId
      });
      
      // Create a default usage record for this user if it doesn't exist
      const { error: insertError } = await supabase
        .from('usage_tracking')
        .insert({ 
          user_id: userId, 
          video_summaries_count: 0,
          flashcard_sets_count: 0,
          text_humanizations_count: 0,
          reset_date: new Date().toISOString()
        })
        .single();
        
      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating default usage record:', insertError);
        return true; // Allow usage if we can't check properly
      }
    }
    
    // If no usage record found, user hasn't used any features yet
    if (!usage) {
      console.log('No usage record found, creating default record');
      return true;
    }
    
    // Define limits based on tier
    const limits = {
      free: {
        video_summaries: 5,
        flashcard_sets: 5,
        text_humanizations: 10
      },
      basic: {
        video_summaries: 20,
        flashcard_sets: 20,
        text_humanizations: 40
      },
      pro: {
        video_summaries: 1000,
        flashcard_sets: 1000,
        text_humanizations: 500
      }
    };
    
    // Get current usage count based on type
    let currentUsage = 0;
    if (usageType === 'text_humanizations') {
      currentUsage = usage.text_humanizations_count || 0;
    } else if (usageType === 'video_summaries') {
      currentUsage = usage.video_summaries_count || 0;
    } else if (usageType === 'flashcard_sets') {
      currentUsage = usage.flashcard_sets_count || 0;
    }
    
    // Get limit based on tier
    const limit = limits[tier as keyof typeof limits][usageType as keyof typeof limits.free];
    
    console.log('Usage check result:', {
      currentUsage,
      limit,
      hasRemainingUsage: currentUsage < limit,
      userId,
      usageType
    });
    
    // Check if user has reached their limit
    return currentUsage < limit;
  } catch (error) {
    console.error('Failed to check usage limit:', error);
    return true; // Allow usage if we can't check properly
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

// Function to get video details from YouTube
async function getVideoDetails(videoId: string) {
  try {
    console.log(`[DEBUG] Getting video details for videoId: ${videoId}`);
    // Use YouTube Data API to get video details
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('[DEBUG] YouTube API key not found, using fallback method');
      return { title: `YouTube Video (${videoId})`, duration: 'PT00M00S' };
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );
    
    const data = await response.json();
    console.log(`[DEBUG] YouTube API response for ${videoId}:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    if (!data.items || data.items.length === 0) {
      console.warn('[DEBUG] No video details found from YouTube API');
      return { title: `YouTube Video (${videoId})`, duration: 'PT00M00S' };
    }
    
    const videoDetails = data.items[0];
    const title = videoDetails.snippet?.title || `YouTube Video (${videoId})`;
    const duration = videoDetails.contentDetails?.duration || 'PT00M00S';
    
    console.log(`[DEBUG] Retrieved video title: "${title}" and duration: ${duration}`);
    return { title, duration };
  } catch (error) {
    console.error('[DEBUG] Error fetching video details:', error);
    return { title: `YouTube Video (${videoId})`, duration: 'PT00M00S' };
  }
}

// Function to generate a descriptive title for the lecture using OpenAI
async function generateDescriptiveTitle(transcript: string, originalTitle: string) {
  try {
    console.log(`[DEBUG] Generating descriptive title for video with original title: "${originalTitle}"`);
    
    // Truncate transcript to first 1000 characters for title generation
    const truncatedTranscript = transcript.substring(0, 1000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an expert at creating concise, descriptive titles for educational content. Create a short, informative title (maximum 60 characters) that accurately describes the content of the lecture based on the transcript excerpt and original title provided. Do not include quotation marks in your response."
        },
        {
          role: "user",
          content: `Original YouTube title: "${originalTitle}"\n\nTranscript excerpt:\n${truncatedTranscript}\n\nPlease generate a concise, descriptive title for this educational lecture (maximum 60 characters). Do not include quotation marks in your response.`
        }
      ]
    });

    let generatedTitle = completion.choices[0]?.message?.content?.trim() || originalTitle;
    
    // Remove any quotation marks from the title
    generatedTitle = generatedTitle.replace(/["']/g, '');
    
    console.log(`[DEBUG] Generated descriptive title: "${generatedTitle}"`);
    
    return generatedTitle;
  } catch (error) {
    console.error('[DEBUG] Error generating descriptive title:', error);
    return originalTitle; // Fallback to original title if generation fails
  }
}

export async function POST(req: Request) {
  try {
    const { url, excludeQuizQuestions } = await req.json();

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

    console.log(`Processing YouTube video with ID: ${videoId}`);

    // Get the current user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user found for this request');
    } else {
      console.log(`Request from authenticated user: ${user.id}`);
    }

    // Check if this video already exists in the database for this user
    if (user) {
      console.log(`Checking if video ${videoId} already exists for user ${user.id}`);
      const { data: existingVideo, error } = await supabase
        .from('content')
        .select('id, title, content')
        .eq('user_id', user.id)
        .eq('type', 'video')
        .eq('content->>videoId', videoId)
        .single();
      
      if (!error && existingVideo) {
        console.log(`Video ${videoId} already exists, returning existing data`);
        let summary = existingVideo.content.summary;
        
        // If excludeQuizQuestions is true, remove the quiz questions section from existing summary
        if (excludeQuizQuestions && summary) {
          const quizSectionIndex = summary.indexOf('## Potential Quiz Questions');
          if (quizSectionIndex !== -1) {
            summary = summary.substring(0, quizSectionIndex).trim();
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          videoId,
          title: existingVideo.title,
          duration: existingVideo.content.duration || 'PT00M00S',
          summary: summary,
          transcript: existingVideo.content.transcript
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`Video ${videoId} does not exist for user ${user.id}, will process and save`);
      }
    }

    // Check usage limits before processing
    if (user) {
      const hasRemainingUsage = await checkUsageLimit(user.id, 'video_summaries');
      if (!hasRemainingUsage) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Usage limit reached',
          message: 'You have reached your usage limit for video summaries. Please upgrade your plan for more access.'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`Fetching transcript for video ${videoId}`);
    // Get transcript
    const transcriptData = await getTranscript(videoId);
    
    console.log(`Processing transcript with AI for video ${videoId}`);
    // Process with AI
    const analysis = await processTranscriptWithAI(transcriptData);
    
    // Get video details (title and duration)
    const { title: originalTitle, duration } = await getVideoDetails(videoId);
    
    // Generate a more descriptive title
    const descriptiveTitle = await generateDescriptiveTitle(transcriptData, originalTitle);

    // Only increment usage after successful API response
    if (user) {
      await incrementUsage(user.id);
      
      // Save the video summary to the database
      try {
        console.log(`Saving video summary to database for user ${user.id}, video ${videoId}`);
        const savedData = await saveVideoSummary(user.id, {
          videoId,
          title: descriptiveTitle, // Use the descriptive title
          duration,
          summary: analysis,
          transcript: transcriptData
        });
        console.log(`Successfully saved video with ID: ${savedData?.id}`);
      } catch (saveError) {
        console.error('Error saving video summary:', saveError);
        // Continue even if saving fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      videoId,
      title: descriptiveTitle, // Return the descriptive title
      duration,
      summary: analysis,
      transcript: transcriptData
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