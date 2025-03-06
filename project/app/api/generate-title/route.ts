import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate a descriptive title for the lecture using OpenAI
async function generateDescriptiveTitle(transcript: string, originalTitle: string) {
  try {
    console.log(`[API] Generating descriptive title for video with original title: "${originalTitle}"`);
    
    // Truncate transcript if it's too long
    const truncatedTranscript = transcript.substring(0, 1000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an expert at creating concise, descriptive titles for educational content. Create a short, informative title (maximum 60 characters) that accurately describes the content of the lecture based on the transcript excerpt and original title provided. Do not include quotation marks in your response."
        },
        {
          role: "user",
          content: `Original YouTube title: "${originalTitle}"\n\nTranscript excerpt:\n${truncatedTranscript}\n\nPlease generate a concise, descriptive title for this educational lecture (maximum 60 characters). Do not include quotation marks in your response.`
        }
      ]
    });

    let generatedTitle = completion.choices[0]?.message?.content?.trim() || originalTitle;
    
    // Remove any quotation marks from the title
    generatedTitle = generatedTitle.replace(/["']/g, '');
    
    console.log(`[API] Generated descriptive title: "${generatedTitle}"`);
    
    return generatedTitle;
  } catch (error) {
    console.error('[API] Error generating descriptive title:', error);
    return originalTitle; // Fallback to original title if generation fails
  }
}

export async function POST(req: Request) {
  try {
    const { transcript, originalTitle } = await req.json();

    if (!transcript || !originalTitle) {
      return new Response(JSON.stringify({ error: 'Transcript and original title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a descriptive title
    const title = await generateDescriptiveTitle(transcript, originalTitle);

    return new Response(JSON.stringify({ 
      success: true,
      title
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-title API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to generate title',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 