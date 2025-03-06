import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export const dynamic = 'force-dynamic';

// Helper function to clean GPT's response
function cleanResponse(text: string): string {
  // Remove quotes if present
  text = text.replace(/^["'](.*)["']$/, '$1');
  
  // Remove any leading/trailing whitespace
  text = text.trim();
  
  return text;
}

export async function POST(req: Request) {
  try {
    const { questions } = await req.json();

    if (!questions) {
      return new Response(JSON.stringify({ error: 'Questions are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Limit the number of questions to avoid token limits
    const limitedQuestions = questions.split('\n').slice(0, 10).join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, descriptive titles for flashcard decks based on the content of the flashcards. Create a title that is 2-6 words long and accurately represents the subject matter of the flashcards. Return only the title, with no additional text or explanation."
        },
        {
          role: "user",
          content: `Create a concise, descriptive title for a flashcard deck containing the following questions:\n\n${limitedQuestions}`
        }
      ],
    });

    const title = cleanResponse(completion.choices[0].message.content || 'Untitled Deck');

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating deck title:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate deck title' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 