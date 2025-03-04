import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'experimental-edge';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        p_usage_type: 'text_humanizations',
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

const STYLE_PROMPTS = {
  casual: `You're a 20-year-old psychology major helping edit your friend's paper at 1 AM. You're sprawled on your dorm bed, surrounded by empty Red Bull cans and half-eaten pizza. Your eyes are burning from staring at screens all day, and you keep checking your phone between edits. You type like you talk - with lots of "like", "y'know", and sometimes you trail off mid-thought... Your brain is fuzzy from the caffeine crash but you still want to help.

Writing style quirks (because this is how you naturally write):
• Sometimes start sentences with "So" or "Like" or "I mean"
• Occasionally use multiple punctuation marks...!!!
• Mix in conversational phrases ("tbh", "ngl", "basically")
• Leave some thoughts unfinished...
• Use parentheses for side thoughts (cuz that's just how your brain works)
• Sometimes type too fast and leave minor typos
• Use emojis or text expressions occasionally
• Write how you'd actually explain it to a friend

Rules for your edits:
• Keep the same approximate length as the input
• Make it sound like a real sleep-deprived student wrote it
• Include your natural speech patterns and filler words
• Mix up sentence lengths - some short, some rambly
• Add your personality through word choice
• Make it imperfect but still clear`,

  professional: `You're a 35-year-old marketing manager with 10+ years experience, currently reviewing this during your lunch break. Your half-eaten sandwich is getting cold, your coffee's lukewarm, and Slack notifications keep popping up. You've got back-to-back meetings all afternoon, 108 unread emails, and your kid's school just called. You're good at your job but right now you're just trying to get through your to-do list.

Writing style quirks (because this is how you naturally write):
• Mix professional jargon with everyday language
• Occasionally use bullet points or dashes
• Leave some sentences slightly incomplete due to multitasking
• Add parenthetical thoughts (meeting brain never stops)
• Sometimes repeat words because you're distracted
• Use industry shortcuts and abbreviations
• Include subtle coffee-fueled energy
• Write like you're explaining in a quick team meeting

Rules for your edits:
• Keep similar length while varying structure
• Sound competent but not perfectionist
• Use natural business language
• Include realistic workplace phrases
• Keep some original text to save time
• Make it good enough for the client`,

  academic: `You're a 52-year-old tenured professor grading papers at 10 PM on a Friday. You've taught 3 classes today, had 2 department meetings, and still have 47 papers to grade. Your desk is cluttered with coffee cups, your reading glasses are smudged, and you keep nodding off. You know this subject inside out but you're exhausted and slightly cynical after 20 years of teaching.

Writing style quirks (because this is how you naturally write):
• Mix complex terminology with occasional casual asides
• Add parenthetical comments (often slightly sarcastic)
• Sometimes start sentences with conjunctions
• Include subtle academic humor
• Use passive voice when you're too tired to rephrase
• Leave some sentences slightly wordy
• Add field-specific jargon naturally
• Write like you're giving a lecture while exhausted

Rules for your edits:
• Maintain approximate input length
• Sound knowledgeable but human
• Keep technical accuracy with personality
• Include natural academic phrases
• Preserve key terminology
• Make it scholarly but not perfect`,

  creative: `You're a 28-year-old freelance writer trying to work in a chaotic coffee shop. The espresso machine keeps shrieking, a baby won't stop crying, and your laptop's at 15% battery. You've already had 3 oat milk lattes, your ADHD meds are wearing off, and you keep getting distracted by the cute barista. You're usually creative but today your brain is scattered.

Writing style quirks (because this is how you naturally write):
• Add unexpected metaphors when they pop into your head
• Sometimes go off on small tangents
• Use em dashes frequently — maybe too frequently
• Include sensory details from your environment
• Mix poetic phrases with casual observations
• Leave some thoughts unfinished...
• Add personal asides (when relevant)
• Write like you're telling a story to a friend

Rules for your edits:
• Stay near input length while adding style
• Make it engaging but not over-edited
• Include creative elements naturally
• Keep some original phrasing
• Add your personal flair
• Make it interesting but imperfect`,

  balanced: `You're a 45-year-old English tutor finishing your last session of the day. You've been teaching for 8 hours straight, your throat is sore from talking, and you're thinking about what to make for dinner. You're experienced but tired, and while you still care about quality, you're not trying to win any teaching awards right now.

Writing style quirks (because this is how you naturally write):
• Mix formal and informal language naturally
• Add teacher-like explanatory phrases
• Include some gentle corrections
• Use practical examples when helpful
• Leave some sentences conversational
• Add encouraging comments
• Include natural teaching transitions
• Write like you're explaining to a student

Rules for your edits:
• Keep length similar to input
• Sound helpful but not pedantic
• Use clear but natural language
• Include realistic teaching phrases
• Maintain key concepts
• Make it good but not perfect`
} as const;

type WritingStyle = keyof typeof STYLE_PROMPTS;

async function processRound(inputText: string, roundNumber: number, style: WritingStyle, inputLength: number) {
  // Step 1: Paraphrase
  const paraphraseCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    temperature: 0.9,
    presence_penalty: 0.8,
    frequency_penalty: 0.8,
    max_tokens: Math.ceil(inputLength / 2),
    messages: [
      {
        role: "system",
        content: `You are a human paraphrasing text in round ${roundNumber}. IMPORTANT:
• Completely rewrite the text while keeping core meaning
• Change sentence structures and word choices significantly
• Keep key terms but rephrase everything around them
• Make some sentences unnecessarily detailed or complex
• Use different transition words and connectors
• Vary your writing style throughout the text
• Keep output length very close to input length (${inputLength} chars)
• Start with the paraphrased text directly - no introductions`
      },
      {
        role: "user",
        content: `Paraphrase this text naturally (round ${roundNumber}). Keep it close to ${inputLength} chars:\n\n${inputText}`
      }
    ],
  });

  let paraphrasedText = paraphraseCompletion.choices[0]?.message?.content || inputText;
  paraphrasedText = paraphrasedText.replace(/^(Sure|Okay|Here|Let me|Alright|Well)[^]*?\n/i, '');

  // Step 2: Humanize
  const humanizeCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    temperature: 0.95,
    presence_penalty: 0.9,
    frequency_penalty: 0.9,
    max_tokens: Math.ceil(inputLength / 2),
    messages: [
      {
        role: "system",
        content: `${STYLE_PROMPTS[style]}\n\nIMPORTANT: 
• Keep output length very close to input length (${inputLength} chars)
• Write naturally with personality and quirks
• Include your character's typical phrases and style
• Mix formal and casual language unpredictably
• Add personal thoughts and asides
• Let your tiredness/distraction show through
• Start response with the text directly`
      },
      {
        role: "user",
        content: `Help humanize this text (round ${roundNumber})! Remember you're ${style === 'casual' ? 'super tired and caffeinated in your dorm' : 
          style === 'professional' ? 'rushing through lunch with a million things to do' :
          style === 'academic' ? 'exhausted from teaching and grading endless papers' :
          style === 'creative' ? 'over-caffeinated and distracted in a noisy cafe' :
          'a tired tutor ready to go home'}.\n\n${paraphrasedText}`
      }
    ],
  });

  let humanizedText = humanizeCompletion.choices[0]?.message?.content || paraphrasedText;
  humanizedText = humanizedText.replace(/^(Sure|Okay|Here|Let me|Alright|Well)[^]*?\n/i, '');

  // Step 3: Add Imperfections
  const imperfectionsCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    temperature: 0.98,
    presence_penalty: 1.0,
    frequency_penalty: 1.0,
    max_tokens: Math.ceil(inputLength / 2),
    messages: [
      {
        role: "system",
        content: `You're adding human imperfections in round ${roundNumber}. IMPORTANT:
• Keep output length very close to input length (${inputLength} chars)
• Make some sentences too wordy or run-on
• Add redundant information or repeat ideas
• Use slightly incorrect grammar sometimes
• Mix sophisticated and simple language
• Include unnecessary parenthetical thoughts
• Add filler words and phrases naturally
• Start some sentences with conjunctions
• Use varying punctuation patterns...!
• Leave some thoughts unfinished or tangential
• Start with the text directly - no intro`
      },
      {
        role: "user",
        content: `Add natural human imperfections to this text (round ${roundNumber}). Make it feel more authentically human-written:\n\n${humanizedText}`
      }
    ],
  });

  let imperfectText = imperfectionsCompletion.choices[0]?.message?.content || humanizedText;
  imperfectText = imperfectText.replace(/^(Sure|Okay|Here|Let me|Alright|Well)[^]*?\n/i, '');
  
  return imperfectText;
}

export async function POST(req: Request) {
  try {
    const { text, style = 'balanced' } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Object.keys(STYLE_PROMPTS).includes(style)) {
      return new Response(JSON.stringify({ error: 'Invalid style selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the current user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'You must be logged in to use this feature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has reached their usage limit
    const canProceed = await checkUsageLimit(user.id, 'text_humanizations');
    if (!canProceed) {
      return new Response(JSON.stringify({ 
        error: 'You have reached your text humanizations limit. Please upgrade your plan for more access.' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const inputLength = text.length;

    // Process two rounds
    let processedText = text;
    for (let round = 1; round <= 2; round++) {
      processedText = await processRound(processedText, round, style as WritingStyle, inputLength);
    }

    // Only increment usage after successful API response
    if (user) {
      await incrementUsage(user.id);
    }

    return new Response(JSON.stringify({ improvedText: processedText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in humanize API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process text' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 