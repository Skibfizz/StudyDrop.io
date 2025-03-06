import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    
    console.log(`Processing transcript for video ID: ${videoId}`);
    
    // Try multiple methods to get the transcript
    try {
      // Method 1: Try using YouTube's timedtext API
      const transcript = await getTranscriptUsingTimedTextApi(videoId);
      return res.status(200).json({ transcript });
    } catch (error1) {
      console.log(`Method 1 failed: ${error1.message}`);
      
      try {
        // Method 2: Try extracting from YouTube page HTML
        const transcript = await getTranscriptFromHtml(videoId);
        return res.status(200).json({ transcript });
      } catch (error2) {
        console.log(`Method 2 failed: ${error2.message}`);
        
        try {
          // Method 3: Try using a third-party API
          const transcript = await getTranscriptUsingThirdPartyApi(videoId);
          return res.status(200).json({ transcript });
        } catch (error3) {
          console.log(`Method 3 failed: ${error3.message}`);
          return res.status(404).json({ 
            error: 'No transcript available for this video',
            details: 'All transcript retrieval methods failed'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transcript', 
      details: error.message 
    });
  }
}

// Method 1: Using YouTube's timedtext API
async function getTranscriptUsingTimedTextApi(videoId) {
  const response = await axios.get(
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`
  );
  
  if (!response.data || !response.data.events) {
    throw new Error('No transcript data found in timedtext API response');
  }
  
  return response.data.events
    .filter(event => event.segs && event.segs.length > 0)
    .map(event => {
      const text = event.segs.map(seg => seg.utf8).join(' ');
      return {
        text: text,
        start: event.tStartMs / 1000,
        duration: (event.dDurationMs || 0) / 1000
      };
    });
}

// Method 2: Extracting from YouTube page HTML
async function getTranscriptFromHtml(videoId) {
  const htmlResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
  const html = htmlResponse.data;
  
  // Extract the captionTracks from the YouTube page
  const captionTracksMatch = html.match(/"captionTracks":(\[.*?\])(?=,)/);
  
  if (!captionTracksMatch || captionTracksMatch.length < 2) {
    throw new Error('No caption tracks found in YouTube page HTML');
  }
  
  const captionTracks = JSON.parse(captionTracksMatch[1]);
  const englishTrack = captionTracks.find(track => 
    track.languageCode === 'en' || 
    (track.vssId && track.vssId.indexOf('.en') > 0) ||
    (track.name && track.name.simpleText && track.name.simpleText.includes('English'))
  );
  
  if (!englishTrack || !englishTrack.baseUrl) {
    throw new Error('No English transcript found in caption tracks');
  }
  
  // Fetch the actual transcript
  const transcriptResponse = await axios.get(englishTrack.baseUrl);
  const transcript = transcriptResponse.data;
  
  // Process the XML transcript
  return await processXmlTranscript(transcript);
}

// Method 3: Using a third-party API as fallback
async function getTranscriptUsingThirdPartyApi(videoId) {
  // This is a fallback method using a public API
  const response = await axios.get(
    `https://yt-transcript-api.vercel.app/api/transcript?videoId=${videoId}`
  );
  
  if (!response.data || !response.data.transcript) {
    throw new Error('No transcript found using third-party API');
  }
  
  return response.data.transcript.map(item => ({
    text: item.text,
    start: item.offset / 1000,
    duration: item.duration / 1000
  }));
}

// Helper function to process XML transcript
async function processXmlTranscript(xmlString) {
  try {
    const result = await parseStringPromise(xmlString, { explicitArray: false });
    
    if (!result.transcript || !result.transcript.text) {
      return [];
    }
    
    const textElements = Array.isArray(result.transcript.text) 
      ? result.transcript.text 
      : [result.transcript.text];
    
    return textElements.map(element => {
      const start = parseFloat(element.$ && element.$.start || 0);
      const duration = parseFloat(element.$ && element.$.dur || 0);
      const text = element._ || element;
      
      return {
        text: typeof text === 'string' ? text.trim() : '',
        start,
        duration
      };
    }).filter(item => item.text);
  } catch (error) {
    console.error('Error parsing XML transcript:', error);
    throw new Error('Failed to parse XML transcript');
  }
} 