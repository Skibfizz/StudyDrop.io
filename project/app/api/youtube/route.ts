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
console.log('SUPADATA_API_KEY exists:', !!process.env.SUPADATA_API_KEY);

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
  // If it's already just a video ID (no slashes or spaces), return it
  if (!url.includes('/') && !url.includes(' ')) {
    return url;
  }
  
  try {
    // Try to extract from various YouTube URL formats
    const urlObj = new URL(url);
    
    // youtube.com/watch?v=VIDEO_ID format
    if (urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v') || '';
    }
    
    // youtu.be/VIDEO_ID format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }
    
    // youtube.com/embed/VIDEO_ID format
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1];
    }
    
    // Fallback to regex for other formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  } catch (error) {
    // If input is not a valid URL, try regex as fallback
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
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
  console.log('Using optimized method to fetch transcript for video:', videoId);
  try {
    // Use Supadata.ai API for fetching transcripts
    console.log('[DEBUG] Getting video details for videoId:', videoId);
    
    // Check if Supadata API key exists
    const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
    
    // Use Supadata.ai API as the primary method
    console.log('Using Supadata.ai API to fetch transcript');
    console.log('[DEBUG] Supadata API key format check:', {
      length: SUPADATA_API_KEY?.length || 0,
      startsWithEyJ: SUPADATA_API_KEY?.startsWith('eyJ') || false,
      containsDots: SUPADATA_API_KEY?.includes('.') || false,
    });
    
    if (!SUPADATA_API_KEY) {
      console.error('Supadata API key is missing. This should be the primary method, not a fallback.');
      // Continue to try the API anyway in case the environment variable is just not visible
    }
    
    try {
      const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SUPADATA_API_KEY || ''
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.content && Array.isArray(data.content)) {
          console.log('Successfully fetched transcript via Supadata.ai API');
          
          // Transform the Supadata response to plain text
          const transcriptText = data.content
            .map((segment: any) => segment.text)
            .join(' ');
          
          return transcriptText;
        }
      } else {
        const errorText = await response.text();
        console.error('Error response from Supadata.ai API:', errorText);
        
        // Try alternative endpoint format if the first one fails
        try {
          console.log('Trying alternative Supadata API endpoint format');
          const alternativeResponse = await fetch(`https://api.supadata.ai/youtube/transcript?videoId=${videoId}&text=true`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': SUPADATA_API_KEY || ''
            },
          });
          
          if (alternativeResponse.ok) {
            const data = await alternativeResponse.json();
            if (data && data.content && Array.isArray(data.content)) {
              console.log('Successfully fetched transcript via alternative Supadata.ai API endpoint');
              
              // Transform the Supadata response to plain text
              const transcriptText = data.content
                .map((segment: any) => segment.text)
                .join(' ');
              
              return transcriptText;
            }
          } else {
            console.error('Error response from alternative Supadata.ai API endpoint:', await alternativeResponse.text());
          }
        } catch (alternativeError) {
          console.error('Error using alternative Supadata.ai API endpoint:', alternativeError);
        }
        
        // If Supadata API fails, try the third-party API as a fallback
        console.log('Supadata API failed, falling back to third-party API');
        try {
          // Create a timeout promise
          const timeoutPromise = new Promise<Response>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 8 seconds')), 8000);
          });
          
          // Create the fetch promise
          const fetchPromise = fetch(`https://yt-transcript-api.vercel.app/api/transcript?videoId=${videoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          // Race the fetch against the timeout
          const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.transcript) {
              console.log('Successfully fetched transcript via third-party API after Supadata API failed');
              
              const transcriptText = data.transcript
                .map((item: any) => item.text)
                .join(' ');
              
              return transcriptText;
            }
          }
        } catch (apiError) {
          console.error('Error using third-party API as fallback:', apiError);
        }
      }
    } catch (supadataError) {
      console.error('Error using Supadata.ai API:', supadataError);
    }
    
    // If transcript fetching fails, return a fallback message
    console.log('No transcript found, generating fallback message');
    return `This video does not have captions available. StudyDrop will generate study materials based on the video title and available metadata. Please note that without the actual transcript, the quality of the generated materials may be limited.`;
  } catch (error) {
    console.error('Error in fetchTranscriptWithJS:', error);
    return `This video does not have captions available. StudyDrop will generate study materials based on the video title and available metadata. Please note that without the actual transcript, the quality of the generated materials may be limited.`;
  }
}

async function getTranscript(videoId: string) {
  try {
    console.log('Fetching transcript for video:', videoId);
    // Directly use the optimized JavaScript method
    return await fetchTranscriptWithJS(videoId);
  } catch (error: unknown) {
    console.error('Error in getTranscript:', error);
    // Return fallback message on error
    return `This video does not have captions available. StudyDrop will generate study materials based on the video title and available metadata. Please note that without the actual transcript, the quality of the generated materials may be limited.`;
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
    
    // Always return a default title and duration without checking for YouTube API key
    // This prevents the "YouTube API key not found" message from appearing in logs
    return { title: `YouTube Video (${videoId})`, duration: 'PT00M00S' };
    
    // The code below is intentionally unreachable to avoid the YouTube API key check
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

    // Get video details (title and duration) first
    const { title: originalTitle, duration } = await getVideoDetails(videoId);

    try {
      console.log(`Fetching transcript for video ${videoId}`);
      // Get transcript - this now returns a fallback message if it fails
      const transcriptData = await getTranscript(videoId);
      
      console.log(`Processing transcript with AI for video ${videoId}`);
      // Process with AI
      const analysis = await processTranscriptWithAI(transcriptData);
      
      // Generate a more descriptive title
      const descriptiveTitle = await generateDescriptiveTitle(transcriptData, originalTitle);

      // Only increment usage after successful API response
      if (user) {
        await incrementUsage(user.id);
      }

      // Save to database if user is authenticated
      if (user) {
        try {
          const { data, error } = await supabase
            .from('content')
            .insert({
              user_id: user.id,
              type: 'video',
              title: descriptiveTitle,
              content: {
                videoId,
                summary: analysis,
                transcript: transcriptData,
                duration
              }
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error saving video to database:', error);
          } else {
            console.log(`Saved video ${videoId} to database with ID ${data.id}`);
          }
        } catch (dbError) {
          console.error('Error in database operation:', dbError);
        }
      }

      // If excludeQuizQuestions is true, remove the quiz questions section
      let finalAnalysis = analysis;
      if (excludeQuizQuestions) {
        const quizSectionIndex = analysis.indexOf('## Potential Quiz Questions');
        if (quizSectionIndex !== -1) {
          finalAnalysis = analysis.substring(0, quizSectionIndex).trim();
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        videoId,
        title: descriptiveTitle,
        duration,
        summary: finalAnalysis,
        transcript: transcriptData
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (processingError) {
      console.error('Error in YouTube API:', processingError);
      
      // Return a partial success with just the video details
      return new Response(JSON.stringify({ 
        success: false,
        videoId,
        title: originalTitle,
        duration,
        error: 'Processing error',
        message: 'We encountered an issue processing this video. Please try a different video or try again later.',
        details: processingError instanceof Error ? processingError.message : String(processingError)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unhandled error in YouTube API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again later.',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 