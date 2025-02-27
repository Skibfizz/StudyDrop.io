from youtube_transcript_api import YouTubeTranscriptApi
import json
import sys
import traceback

def get_transcript(video_id):
    try:
        print(f"Attempting to fetch transcript for video ID: {video_id}", file=sys.stderr)
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        print(f"Successfully fetched transcript", file=sys.stderr)
        return json.dumps({
            'success': True,
            'transcript': transcript
        })
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error fetching transcript: {str(e)}\n{error_details}", file=sys.stderr)
        return json.dumps({
            'success': False,
            'error': str(e),
            'details': error_details
        })

if __name__ == "__main__":
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        print(get_transcript(video_id))
    else:
        print(json.dumps({
            'success': False,
            'error': 'No video ID provided'
        })) 