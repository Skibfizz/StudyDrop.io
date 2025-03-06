# Supadata API Integration

This document explains how to use the Supadata API integration for fetching YouTube video transcripts in the StudyDrop application.

## Overview

The Supadata API provides a reliable way to fetch transcripts from YouTube videos. Our integration:

1. Fetches transcripts using the Supadata API
2. Stores them in Supabase for future use
3. Falls back to direct YouTube methods if needed

## Setup

### 1. Supadata API Key

The Supadata API key has been configured in the application:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzQxMzAyMDQ0IiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6ImNkODlmMzFlZjRhMTQ3ZjViN2MyZGJjNTc0Zjg2ODczIn0.xrE0BFyoFyJXByikbMfp35gCb8Ve6N6JkiLkiIuOMPY
```

This key is used to authenticate requests to the Supadata API.

### 2. Using the Component

The `YouTubeTranscriptFetcher` component provides a simple interface for fetching transcripts:

```jsx
import YouTubeTranscriptFetcher from '@/components/YouTubeTranscriptFetcher';

export default function TranscriptPage() {
  return (
    <div>
      <h1>Get YouTube Transcript</h1>
      <YouTubeTranscriptFetcher />
    </div>
  );
}
```

## API Endpoint

The Supadata API integration is available at:

```
/api/supadata/transcript?videoId=VIDEO_ID
```

### Parameters

- `videoId`: YouTube video ID or URL

### Response Format

```json
{
  "transcript": [
    {
      "text": "Transcript segment text",
      "start": 0.0,
      "duration": 5.0
    },
    ...
  ]
}
```

## Fallback Mechanism

If the Supadata API fails to retrieve a transcript, the system will automatically fall back to direct YouTube methods:

1. YouTube timedtext API with JSON format
2. YouTube timedtext API with XML format
3. HTML extraction method

## Caching

Transcripts are automatically cached in the Supabase `content` table for authenticated users. This improves performance for repeated requests and reduces API usage.

## Supported URL Formats

The integration supports various YouTube URL formats:

- `http://youtu.be/NLqAF9hrVbY`
- `https://youtube.com/shorts/xbGCdZ2Ei7g`
- `http://www.youtube.com/embed/NLqAF9hrVbY`
- `https://www.youtube.com/embed/NLqAF9hrVbY`
- `http://www.youtube.com/v/NLqAF9hrVbY?fs=1&hl=en_US`
- `http://www.youtube.com/watch?v=NLqAF9hrVbY`
- `http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I`
- `http://www.youtube.com/watch?v=JYArUl0TzhA&feature=featured`

## Limitations

- Live videos are not supported
- User profile links are not supported
- Playlists are not supported

## Example Usage

You can see a working example of the Supadata API integration at:

```
/examples/supadata
```

This example demonstrates how to use the component and explains how the integration works.

## Troubleshooting

If you encounter issues:

1. Check if the video has available transcripts
2. Ensure the video is not a live stream
3. Check the server logs for detailed error messages 