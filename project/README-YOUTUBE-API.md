# YouTube API Setup Instructions

To properly process YouTube videos in StudyDrop, you need to set up a YouTube Data API key. Follow these steps:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your project ID

## 2. Enable the YouTube Data API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

## 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## 4. Add the API Key to Your Environment

1. Add the following to your `.env.local` file:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```
2. If deploying to Vercel, add the `YOUTUBE_API_KEY` environment variable in your project settings

## 5. Set API Restrictions (Optional but Recommended)

1. Go back to the Google Cloud Console > "APIs & Services" > "Credentials"
2. Find your API key and click "Edit"
3. Under "API restrictions", select "Restrict key"
4. Add the "YouTube Data API v3" to the list of restricted APIs
5. Save your changes

## Troubleshooting

If you're still having issues with YouTube transcript processing:

1. Make sure your API key is correctly set in the environment variables
2. Check that the YouTube Data API is enabled in your Google Cloud project
3. Verify that the video you're trying to process has captions available
4. Check your API quota usage in the Google Cloud Console

For more information, see the [YouTube Data API documentation](https://developers.google.com/youtube/v3/getting-started). 