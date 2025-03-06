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
  const [useDataApi, setUseDataApi] = useState(true);

  const fetchTranscript = async () => {
    if (!videoInput.trim()) {
      setError('Please enter a YouTube video URL or ID');
      return;
    }

    setLoading(true);
    setError(null);
    setTranscript([]);

    try {
      // Choose which API endpoint to use based on the toggle
      const apiEndpoint = useDataApi 
        ? '/api/youtube/transcript-api' 
        : '/api/youtube/transcript';
      
      const response = await fetch(`${apiEndpoint}?videoId=${encodeURIComponent(videoInput)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch transcript');
      }

      if (data.transcript && Array.isArray(data.transcript)) {
        setTranscript(data.transcript);
      } else {
        throw new Error('Invalid transcript data received');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the transcript');
      console.error('Transcript fetch error:', err);
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
      <h2 className="text-2xl font-bold mb-6">YouTube Transcript Fetcher</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={useDataApi}
                onChange={() => setUseDataApi(!useDataApi)}
              />
              <div className={`block w-14 h-8 rounded-full ${useDataApi ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${useDataApi ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              {useDataApi ? 'Using YouTube Data API' : 'Using Legacy Method'}
            </div>
          </label>
        </div>
        
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
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
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