'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TranscriptTest() {
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchTranscript = async () => {
    if (!videoId) {
      setError('Please enter a YouTube video ID or URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setTranscript([]);
    
    try {
      const response = await axios.get(`/api/youtube/transcript?videoId=${encodeURIComponent(videoId)}`);
      if (response.data.transcript && response.data.transcript.length > 0) {
        setTranscript(response.data.transcript);
        setSuccess(true);
      } else {
        setError('No transcript data found for this video');
      }
    } catch (error: any) {
      console.error('Error fetching transcript:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch transcript';
      const errorDetails = error.response?.data?.details || '';
      setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchTranscript();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Transcript Test</h1>
      
      <div className="mb-4">
        <label htmlFor="videoId" className="block mb-2">
          YouTube Video URL or ID:
        </label>
        <div className="flex">
          <input
            id="videoId"
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter YouTube URL or video ID"
            className="border p-2 rounded-l w-full"
          />
          <button
            onClick={fetchTranscript}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Loading...' : 'Get Transcript'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Examples: <br />
          • Full URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ <br />
          • Video ID only: dQw4w9WgXcQ
        </p>
      </div>

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Fetching transcript... This may take a few seconds.
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Note: Not all YouTube videos have transcripts available. Try another video if this one doesn't work.
          </p>
        </div>
      )}

      {success && transcript.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Transcript:</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {transcript.map((item, index) => (
              <div key={index} className="mb-2 p-2 hover:bg-gray-200 rounded">
                <span className="text-gray-500 mr-2">[{formatTime(item.start)}]</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 