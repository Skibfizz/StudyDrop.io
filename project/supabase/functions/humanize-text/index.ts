import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.20.1'

serve(async (req) => {
  // Log request details
  console.log('Request Method:', req.method);
  console.log('Request Origin:', req.headers.get('origin'));
  console.log('Request Headers:', Object.fromEntries(req.headers.entries()));

  // Always include CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  }

  console.log('CORS Headers being applied:', corsHeaders);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Processing POST request');
    const { text, style } = await req.json()

    if (!text) {
      console.log('No text provided in request');
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Initializing OpenAI with config');
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    console.log('Making OpenAI request');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that rewrites text in a ${style || 'balanced'} style while maintaining the original meaning. Make the text more engaging and natural.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('OpenAI request successful');
    const improvedText = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ improvedText }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 