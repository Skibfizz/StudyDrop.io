# YouTube Transcript API Integration

## Overview

This document explains how StudyDrop fetches YouTube video transcripts using the Supadata API.

## Transcript Fetching Method

StudyDrop exclusively uses the **Supadata API** for fetching YouTube video transcripts. This provides:

- High-quality transcripts with accurate timestamps
- Support for multiple languages
- Caching for faster retrieval
- Reliable transcript access

## Implementation Details

### API Endpoint

The application uses the following endpoint to fetch transcripts:

```
https://api.supadata.ai/v1/youtube/transcript
```

### API Key

The Supadata API requires an API key for authentication. This key is stored securely in the application's environment variables.

### Response Format

The Supadata API returns transcript data in the following format:

```json
{
  "content": [
    {
      "text": "Transcript segment text",
      "offset": 1000, // milliseconds
      "duration": 2000 // milliseconds
    },
    // More segments...
  ],
  "text": "Full transcript text..."
}
```

### Data Processing

The application processes this data to:

1. Convert timestamps from milliseconds to seconds
2. Format the transcript into a consistent structure
3. Cache the results in Supabase for future use

## Usage in the Application

The transcript data is used for:

- Generating lecture summaries
- Creating flashcards
- Providing searchable content
- Enhancing the learning experience

## Troubleshooting

If you're having issues with YouTube transcript processing:

1. Verify that the video has captions available
2. Check that the Supadata API key is correctly configured
3. Ensure the video ID is correctly extracted from the URL
4. Check the network logs for any API errors

## Support

For any issues with transcript fetching, please contact the StudyDrop support team. 