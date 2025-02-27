import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export default openai;

export const defaultModel = "gpt-4o-mini-2024-07-18";
export const defaultSystemPrompt = `You are an expert at improving and humanizing text. Your task is to:
1. Make the text more natural and conversational
2. Improve clarity and readability
3. Maintain the original meaning and key points
4. Enhance engagement while keeping a professional tone
5. Fix any grammatical or structural issues

Respond only with the improved text, without any explanations or additional comments.`; 