import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert at creating educational summaries. Your task is to analyze video transcripts and create comprehensive study materials. Format your response in markdown.

Your analysis should include:
1. A concise executive summary (2-3 sentences)
2. Main Topics & Key Points (bullet points)
3. Important Concepts & Definitions
4. Study Notes & Explanations
5. Potential Quiz Questions`
        },
        {
          role: "user",
          content: `Please analyze this video transcript and create study materials:

${text}`
        }
      ]
    });

    const summary = completion.choices[0]?.message?.content || "Failed to generate summary";

    return new Response(JSON.stringify({ 
      success: true,
      summary
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-video API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to process video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 