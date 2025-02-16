import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Generate summary with OpenAI
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor. Create a concise summary of the following text."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    // Generate flashcards with OpenAI
    const flashcardsResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Create 5-10 study flashcards from the following text. Format as JSON array with 'question' and 'answer' fields."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const summary = summaryResponse.choices[0]?.message?.content || '';
    const flashcardsText = flashcardsResponse.choices[0]?.message?.content || '[]';
    const flashcards = JSON.parse(flashcardsText);

    return NextResponse.json({
      summary,
      flashcards: flashcards.map((card: any, index: number) => ({
        id: index.toString(),
        question: card.question,
        answer: card.answer,
        isFlipped: false
      }))
    });

  } catch (error: any) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
} 