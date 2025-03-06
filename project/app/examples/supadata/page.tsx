'use client';

import React from 'react';
import YouTubeTranscriptFetcher from '@/components/YouTubeTranscriptFetcher';
import Link from 'next/link';

export default function SupadataExamplePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link 
          href="/examples" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Examples
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Supadata API Integration Example</h1>
        <p className="text-gray-600 mb-8">
          This example demonstrates how to use the Supadata API to fetch YouTube video transcripts.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Try It Out</h2>
          <p className="mb-4">
            Enter a YouTube video URL or ID below to fetch its transcript using the Supadata API.
          </p>
          
          <YouTubeTranscriptFetcher />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Input Processing:</strong> The component accepts a YouTube URL or video ID.
            </li>
            <li>
              <strong>API Request:</strong> The input is sent to our backend API endpoint.
            </li>
            <li>
              <strong>Supadata Integration:</strong> Our backend uses the Supadata API to fetch the transcript.
            </li>
            <li>
              <strong>Caching:</strong> The transcript is stored in Supabase for future use.
            </li>
            <li>
              <strong>Fallback Mechanism:</strong> If Supadata fails, we fall back to direct YouTube methods.
            </li>
            <li>
              <strong>Display:</strong> The transcript is displayed with timestamps.
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Documentation</h3>
            <p>
              For more details on how to use the Supadata API integration, check out the 
              <Link href="/docs/supadata-integration.md" className="text-blue-600 hover:text-blue-800 ml-1">
                documentation
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 