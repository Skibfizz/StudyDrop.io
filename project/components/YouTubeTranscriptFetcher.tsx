'use client';

import React, { useState } from 'react';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export default function YouTubeTranscriptFetcher() {
  const [videoInput, setVideoInput] = useState('');
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchTranscript = async () => {
    if (!videoInput.trim()) {
      setError('Please enter a YouTube video URL or ID');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Initializing transcript fetch...');
    setTranscript([]);

    try {
      // Use the Supadata API endpoint
      const apiEndpoint = '/api/supadata/transcript';
      
      setStatusMessage('Fetching transcript using Supadata API...');
      
      const response = await fetch(`${apiEndpoint}?videoId=${encodeURIComponent(videoInput)}`, {
        // Add a longer timeout for the fetch request
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch transcript');
      }

      if (data.transcript && Array.isArray(data.transcript)) {
        setStatusMessage('Successfully retrieved transcript! Data is stored in Supabase for future use.');
        setTranscript(data.transcript);
      } else {
        throw new Error('Invalid transcript data received');
      }
    } catch (err: any) {
      // Check if it's a timeout error
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Request timed out. The server took too long to respond.');
      } else {
        setError(err.message || 'An error occurred while fetching the transcript');
      }
      
      console.error('Transcript fetch error:', err);
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">YouTube Transcript Fetcher (Supadata API)</h2>
      
      <div className="p-4 mb-6 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Supadata API</h3>
        <p className="text-blue-700 mb-2">
          This component uses the Supadata API to fetch YouTube video transcripts. The API provides:
        </p>
        <ul className="list-disc pl-5 text-blue-700 mb-2">
          <li>High-quality transcripts with accurate timestamps</li>
          <li>Support for multiple languages</li>
          <li>Caching for faster retrieval</li>
        </ul>
        <p className="text-blue-700 text-sm">
          Your Supadata API key has been configured and is ready to use.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="Enter YouTube URL or video ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchTranscript}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : 'Fetch Transcript'}
          </button>
        </div>
        
        {statusMessage && !error && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            {statusMessage}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-2">
              Note: This application now exclusively uses the Supadata API for transcript fetching.
              If you're experiencing issues, please check that the video has captions available.
            </p>
          </div>
        )}
      </div>

      {transcript.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Transcript</h3>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
            {transcript.map((segment, index) => (
              <div key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="text-sm text-gray-500 mb-1">
                  {formatTime(segment.start)} - {formatTime(segment.start + segment.duration)}
                </div>
                <div>{segment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 