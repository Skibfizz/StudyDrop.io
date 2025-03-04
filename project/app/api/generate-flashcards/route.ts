import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

export const dynamic = 'force-dynamic';

// Create Supabase server client
async function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Function to check if user has reached their usage limit
async function checkUsageLimit(userId: string, usageType: string): Promise<boolean> {
  try {
    if (!userId) {
      console.log('No user ID provided for usage limit check');
      return false;
    }

    console.log('Checking usage limit for user:', {
      userId,
      usageType,
      timestamp: new Date().toISOString()
    });

    const supabase = await createSupabaseServerClient();
    
    // Get user's subscription tier
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
      
    if (subscriptionError) {
      console.error('Error fetching subscription:', {
        error: subscriptionError.message,
        details: subscriptionError.details,
        hint: subscriptionError.hint,
        code: subscriptionError.code,
        userId
      });
      
      // Create a default subscription for this user if it doesn't exist
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({ user_id: userId, tier: 'free' })
        .single();
        
      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating default subscription:', insertError);
        return true; // Allow usage if we can't check properly
      }
    }
    
    // Default to free tier if no subscription found
    const tier = subscription?.tier || 'free';
    console.log('User subscription tier:', { tier, userId });
    
    // Get current usage
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (usageError && usageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching usage:', {
        error: usageError.message,
        details: usageError.details,
        hint: usageError.hint,
        code: usageError.code,
        userId
      });
      
      // Create a default usage record for this user if it doesn't exist
      const { error: insertError } = await supabase
        .from('usage_tracking')
        .insert({ 
          user_id: userId, 
          video_summaries_count: 0,
          flashcard_sets_count: 0,
          text_humanizations_count: 0,
          reset_date: new Date().toISOString()
        })
        .single();
        
      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating default usage record:', insertError);
        return true; // Allow usage if we can't check properly
      }
    }
    
    // If no usage record found, user hasn't used any features yet
    if (!usage) {
      console.log('No usage record found, creating default record');
      return true;
    }
    
    // Define limits based on tier
    const limits = {
      free: {
        video_summaries: 5,
        flashcard_sets: 5,
        text_humanizations: 10
      },
      basic: {
        video_summaries: 20,
        flashcard_sets: 20,
        text_humanizations: 40
      },
      pro: {
        video_summaries: 1000,
        flashcard_sets: 1000,
        text_humanizations: 500
      }
    };
    
    // Get current usage count based on type
    let currentUsage = 0;
    if (usageType === 'text_humanizations') {
      currentUsage = usage.text_humanizations_count || 0;
    } else if (usageType === 'video_summaries') {
      currentUsage = usage.video_summaries_count || 0;
    } else if (usageType === 'flashcard_sets') {
      currentUsage = usage.flashcard_sets_count || 0;
    }
    
    // Get limit based on tier
    const limit = limits[tier as keyof typeof limits][usageType as keyof typeof limits.free];
    
    console.log('Usage check result:', {
      currentUsage,
      limit,
      hasRemainingUsage: currentUsage < limit,
      userId,
      usageType
    });
    
    // Check if user has reached their limit
    return currentUsage < limit;
  } catch (error) {
    console.error('Failed to check usage limit:', error);
    return true; // Allow usage if we can't check properly
  }
}

// Function to increment usage only after successful API response
async function incrementUsage(userId: string) {
  try {
    if (!userId) {
      console.log('No user ID provided for usage tracking');
      return;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc(
      'check_and_increment_usage',
      {
        p_user_id: userId,
        p_usage_type: 'flashcard_sets',
        p_increment: 1
      }
    );

    if (error) {
      console.error('Error incrementing usage:', error);
    } else {
      console.log('Usage incremented successfully:', data);
    }
  } catch (error) {
    console.error('Failed to increment usage:', error);
  }
}

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

    // Get the current user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check usage limits before processing
    if (user) {
      const hasRemainingUsage = await checkUsageLimit(user.id, 'flashcard_sets');
      if (!hasRemainingUsage) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Usage limit reached',
          message: 'You have reached your usage limit for flashcard sets. Please upgrade your plan for more access.'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
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

      // Only increment usage after successful API response
      if (user) {
        await incrementUsage(user.id);
      }

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