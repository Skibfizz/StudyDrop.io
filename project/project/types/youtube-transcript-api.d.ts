declare module 'youtube-transcript-api' {
  interface TranscriptResponse {
    text: string;
    start: number;
    duration: number;
  }

  export class YouTubeTranscriptApi {
    static getTranscript(videoId: string): Promise<TranscriptResponse[]>;
    static getTranscripts(videoIds: string[]): Promise<TranscriptResponse[][]>;
    static listTranscripts(videoId: string): Promise<any>;
  }
} 