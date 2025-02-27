declare module 'youtube-transcript-api' {
  interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
  }

  export function getTranscript(videoId: string): Promise<TranscriptResponse[]>;
} 