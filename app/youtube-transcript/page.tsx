import React from 'react';
import YouTubeTranscriptFetcher from '../../components/YouTubeTranscriptFetcher';

export default function YouTubeTranscriptPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">YouTube Transcript Tool</h1>
      <YouTubeTranscriptFetcher />
    </div>
  );
} 