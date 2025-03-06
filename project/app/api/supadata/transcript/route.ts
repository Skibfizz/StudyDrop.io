import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set maximum duration to 60 seconds

// Supadata API key provided by the user
const SUPADATA_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzQxMzAyMDQ0IiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6ImNkODlmMzFlZjRhMTQ3ZjViN2MyZGJjNTc0Zjg2ODczIn0.xrE0BFyoFyJXByikbMfp35gCb8Ve6N6JkiLkiIuOMPY";

// Helper function to extract video ID from YouTube URL
function extractVideoId(input: string): string {
  // If it's already just a video ID (no slashes or spaces), return it
  if (!input.includes('/') && !input.includes(' ')) {
    return input;
  }
  
  try {
    // Try to extract from various YouTube URL formats
    const url = new URL(input);
    
    // youtube.com/watch?v=VIDEO_ID format
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v') || '';
    }
    
    // youtu.be/VIDEO_ID format
    if (url.hostname === 'youtu.be') {
      return url.pathname.substring(1);
    }
    
    // youtube.com/embed/VIDEO_ID format
    if (url.pathname.includes('/embed/')) {
      return url.pathname.split('/embed/')[1];
    }
    
    // If we can't extract, return the original input
    return input;
  } catch (error) {
    // If input is not a valid URL, return it as is
    return input;
  }
}

export async function GET(request: NextRequest) {
  console.log('=== SUPADATA TRANSCRIPT API CALLED ===');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawVideoId = searchParams.get('videoId');
    
    if (!rawVideoId) {
      console.log('Error: No video ID provided');
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    // Extract the actual video ID from the input
    const videoId = extractVideoId(rawVideoId);
    console.log(`Processing transcript for video ID: ${videoId}`);
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Check if transcript already exists in Supabase
    const { data: existingContent, error: fetchError } = await supabase
      .from('content')
      .select('content')
      .eq('type', 'video')
      .eq('metadata->videoId', videoId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching from Supabase:', fetchError);
    }
    
    // If transcript exists in Supabase, return it
    if (existingContent && existingContent.content && existingContent.content.transcript) {
      console.log('Transcript found in Supabase database');
      return NextResponse.json({ transcript: existingContent.content.transcript });
    }
    
    console.log('Transcript not found in database, fetching from Supadata API');
    
    // Fetch transcript from Supadata API
    const transcript = await fetchTranscriptFromSupadata(videoId);
    
    // Store transcript in Supabase if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          type: 'video',
          title: `YouTube Video: ${videoId}`,
          content: { transcript },
          metadata: { videoId, source: 'supadata' }
        });
      
      if (insertError) {
        console.error('Error storing transcript in Supabase:', insertError);
      } else {
        console.log('Transcript stored in Supabase database');
      }
    }
    
    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Error in transcript API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transcript', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Function to fetch transcript from Supadata API
async function fetchTranscriptFromSupadata(videoId: string) {
  try {
    console.log('Fetching transcript from Supadata API');
    
    // Call the Supadata API to get the transcript
    const response = await axios.get(
      `https://api.supadata.ai/v1/youtube/transcript`,
      {
        params: {
          videoId: videoId,
          text: false // Get the segmented transcript with timestamps
        },
        headers: {
          'x-api-key': SUPADATA_API_KEY
        },
        timeout: 30000 // 30 seconds timeout
      }
    );
    
    console.log('Supadata API response:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      // Transform the Supadata response to match our expected format
      return response.data.content.map((segment: any) => ({
        text: segment.text,
        start: segment.offset / 1000, // Convert from ms to seconds
        duration: segment.duration / 1000 // Convert from ms to seconds
      }));
    } else {
      throw new Error('Invalid response format from Supadata API');
    }
  } catch (error: any) {
    console.error('Error fetching from Supadata API:', error.message);
    throw new Error(`Failed to fetch transcript from Supadata API: ${error.message}`);
  }
} 