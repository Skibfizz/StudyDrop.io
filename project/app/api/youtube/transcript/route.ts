import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawVideoId = searchParams.get('videoId');
    
    if (!rawVideoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    // Extract the actual video ID from the input
    const videoId = extractVideoId(rawVideoId);
    
    console.log(`Processing transcript for video ID: ${rawVideoId}`);
    console.log(`Extracted video ID: ${videoId}`);
    
    // Try multiple methods to get the transcript
    try {
      // Method 1: Try using YouTube's timedtext API
      const transcript = await getTranscriptUsingTimedTextApi(videoId);
      return NextResponse.json({ transcript });
    } catch (error1: any) {
      console.log(`Method 1 failed: ${error1.message}`);
      
      try {
        // Method 2: Try extracting from YouTube page HTML
        const transcript = await getTranscriptFromHtml(videoId);
        return NextResponse.json({ transcript });
      } catch (error2: any) {
        console.log(`Method 2 failed: ${error2.message}`);
        
        try {
          // Method 3: Try using a third-party API
          const transcript = await getTranscriptUsingThirdPartyApi(videoId);
          return NextResponse.json({ transcript });
        } catch (error3: any) {
          console.log(`Method 3 failed: ${error3.message}`);
          return NextResponse.json(
            { 
              error: 'No transcript available for this video',
              details: 'All transcript retrieval methods failed'
            },
            { status: 404 }
          );
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transcript', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Method 1: Using YouTube's timedtext API
async function getTranscriptUsingTimedTextApi(videoId: string) {
  // Try the JSON format first
  try {
    const response = await axios.get(
      `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`,
      { timeout: 5000 }
    );
    
    if (response.data && response.data.events) {
      return response.data.events
        .filter((event: any) => event.segs && event.segs.length > 0)
        .map((event: any) => {
          const text = event.segs.map((seg: any) => seg.utf8).join(' ');
          return {
            text: text,
            start: event.tStartMs / 1000,
            duration: (event.dDurationMs || 0) / 1000
          };
        });
    }
  } catch (error: any) {
    console.log('JSON format timedtext API failed:', error.message);
  }
  
  // Try the XML format as fallback
  try {
    const response = await axios.get(
      `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
      { timeout: 5000 }
    );
    
    if (response.data) {
      return await processXmlTranscript(response.data);
    }
  } catch (error: any) {
    console.log('XML format timedtext API failed:', error.message);
  }
  
  // If both formats fail, throw an error
  throw new Error('Request failed with status code 404');
}

// Method 2: Extracting from YouTube page HTML
async function getTranscriptFromHtml(videoId: string) {
  try {
    const htmlResponse = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    const html = htmlResponse.data;
    
    // Try multiple regex patterns to extract caption tracks
    let captionTracks;
    
    // Pattern 1: Standard format
    const pattern1 = /"captionTracks":(\[.*?\])(?=,)/;
    const match1 = html.match(pattern1);
    if (match1 && match1.length >= 2) {
      try {
        captionTracks = JSON.parse(match1[1]);
      } catch (e) {
        console.log('Failed to parse caption tracks from pattern 1');
      }
    }
    
    // Pattern 2: Alternative format
    if (!captionTracks) {
      const pattern2 = /\\"captionTracks\\":(\[.*?\])(?=,)/;
      const match2 = html.match(pattern2);
      if (match2 && match2.length >= 2) {
        try {
          // Replace escaped quotes
          const jsonStr = match2[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          captionTracks = JSON.parse(jsonStr);
        } catch (e) {
          console.log('Failed to parse caption tracks from pattern 2');
        }
      }
    }
    
    if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new Error('No caption tracks found in YouTube page HTML');
    }
    
    // Try to find English captions, with fallbacks to other languages if needed
    const trackPriorities = [
      // First try to find English tracks
      (track: any) => track.languageCode === 'en',
      (track: any) => track.vssId && track.vssId.indexOf('.en') > 0,
      (track: any) => track.name && track.name.simpleText && track.name.simpleText.toLowerCase().includes('english'),
      
      // Then try auto-generated English
      (track: any) => track.vssId && track.vssId.indexOf('a.en') > 0,
      
      // Then try any track as last resort
      (track: any) => true
    ];
    
    let selectedTrack = null;
    for (const priorityCheck of trackPriorities) {
      selectedTrack = captionTracks.find(priorityCheck);
      if (selectedTrack && selectedTrack.baseUrl) break;
    }
    
    if (!selectedTrack || !selectedTrack.baseUrl) {
      throw new Error('No suitable transcript found in caption tracks');
    }
    
    // Fetch the actual transcript
    const transcriptResponse = await axios.get(selectedTrack.baseUrl, { timeout: 5000 });
    const transcript = transcriptResponse.data;
    
    // Process the XML transcript
    return await processXmlTranscript(transcript);
  } catch (error: any) {
    console.error('Error in getTranscriptFromHtml:', error.message);
    throw error;
  }
}

// Method 3: Using a third-party API as fallback
async function getTranscriptUsingThirdPartyApi(videoId: string) {
  // Try using the YouTube Transcript API (ytdl-core approach)
  try {
    const response = await axios.get(
      `https://yt-transcript-api.vercel.app/api/transcript?videoId=${videoId}`,
      { timeout: 5000 } // Add timeout to prevent long waits
    );
    
    if (response.data && response.data.transcript) {
      return response.data.transcript.map((item: any) => ({
        text: item.text,
        start: item.offset / 1000,
        duration: item.duration / 1000
      }));
    }
  } catch (error: any) {
    console.log('First third-party API failed:', error.message);
  }
  
  // Try another third-party API as backup
  try {
    const response = await axios.get(
      `https://youtubetranscript.com/?server_vid=${videoId}`,
      { timeout: 5000 }
    );
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        text: item.text,
        start: parseFloat(item.start),
        duration: parseFloat(item.dur || 0)
      }));
    }
  } catch (error: any) {
    console.log('Second third-party API failed:', error.message);
  }
  
  // If all third-party APIs fail, throw an error
  throw new Error('Request failed with status code 404');
}

// Helper function to process XML transcript
async function processXmlTranscript(xmlString: string) {
  try {
    const result = await parseStringPromise(xmlString, { explicitArray: false });
    
    if (!result.transcript || !result.transcript.text) {
      return [];
    }
    
    const textElements = Array.isArray(result.transcript.text) 
      ? result.transcript.text 
      : [result.transcript.text];
    
    return textElements.map((element: any) => {
      const start = parseFloat(element.$ && element.$.start || 0);
      const duration = parseFloat(element.$ && element.$.dur || 0);
      const text = element._ || element;
      
      return {
        text: typeof text === 'string' ? text.trim() : '',
        start,
        duration
      };
    }).filter((item: any) => item.text);
  } catch (error) {
    console.error('Error parsing XML transcript:', error);
    throw new Error('Failed to parse XML transcript');
  }
} 