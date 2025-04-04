import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export const dynamic = 'force-dynamic';

// Helper function to clean GPT's response and extract JSON
function extractJsonFromResponse(text: string): string {
  // Remove markdown code blocks if present
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any leading/trailing whitespace
  text = text.trim();
  
  // If the text starts with a newline, remove it
  text = text.replace(/^\n+/, '');
  
  return text;
}

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: 'Transcript is required' }), {
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
          content: `You are an expert at creating educational flashcards. Your task is to analyze the provided transcript and create a comprehensive set of study flashcards. Follow these rules:

1. Create 10-15 flashcards that test key concepts, definitions, and important facts
2. Each flashcard should have a clear, specific question and a concise but complete answer
3. Avoid yes/no questions
4. Include a mix of factual recall and conceptual understanding questions
5. Format your response as a JSON array of objects, each with "question" and "answer" fields
6. Return ONLY the JSON array - no markdown formatting, no explanations

Example of expected format (return exactly like this):
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris - the largest city and administrative capital of France"
  },
  {
    "question": "How does photosynthesis work?",
    "answer": "A process where plants convert sunlight, water, and CO2 into glucose and oxygen using chlorophyll"
  }
]`
        },
        {
          role: "user",
          content: `Generate study flashcards from this transcript:\n\n${transcript}`
        }
      ]
    });

    const flashcardsText = completion.choices[0]?.message?.content;
    if (!flashcardsText) {
      throw new Error('Failed to generate flashcards');
    }

    // Clean and parse the response
    const cleanedText = extractJsonFromResponse(flashcardsText);
    
    try {
      const flashcards = JSON.parse(cleanedText);

      return new Response(JSON.stringify({ 
        success: true,
        flashcards
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Cleaned Text:', cleanedText);
      throw new Error('Failed to parse flashcards data');
    }
  } catch (error) {
    console.error('Error in generate-flashcards API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to generate flashcards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 