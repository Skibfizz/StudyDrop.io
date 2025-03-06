from http.server import BaseHTTPRequestHandler
import json
import sys
import traceback

# Import the YouTube transcript API
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    YOUTUBE_API_AVAILABLE = True
except ImportError:
    YOUTUBE_API_AVAILABLE = False
    print("YouTube Transcript API not available", file=sys.stderr)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Extract video ID from query parameters
        # Path will be like /api/python/get_transcript?videoId=VIDEO_ID
        import urllib.parse
        query_components = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        video_id = query_components.get('videoId', [''])[0]
        
        if not video_id:
            self.wfile.write(json.dumps({
                'success': False,
                'error': 'No video ID provided'
            }).encode())
            return
        
        # Try to fetch the transcript
        try:
            if not YOUTUBE_API_AVAILABLE:
                raise ImportError("YouTube Transcript API not available")
                
            print(f"Attempting to fetch transcript for video ID: {video_id}", file=sys.stderr)
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            print(f"Successfully fetched transcript", file=sys.stderr)
            
            # Combine all transcript segments into a single paragraph
            full_text = ' '.join(segment['text'] for segment in transcript)
            
            self.wfile.write(json.dumps({
                'success': True,
                'transcript': full_text
            }).encode())
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error fetching transcript: {str(e)}\n{error_details}", file=sys.stderr)
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e),
                'details': error_details
            }).encode()) 