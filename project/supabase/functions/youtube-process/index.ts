import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.20.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://studydrop.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    const { url, transcript, isRegenerating, userId } = await req.json()
    console.log('Request payload:', { url, isRegenerating, hasTranscript: !!transcript, userId })

    if (!userId) {
      console.log('Error: No userId provided')
      return new Response(
        JSON.stringify({ error: 'No userId provided' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Check usage limits
    const { data: usageAllowed, error: usageError } = await supabase.rpc(
      'check_and_increment_usage',
      {
        p_user_id: userId,
        p_usage_type: 'video_summaries',
        p_increment: 1
      }
    )

    if (usageError || !usageAllowed) {
      console.log('Usage limit exceeded or error:', usageError)
      return new Response(
        JSON.stringify({ 
          error: 'You have reached your usage limit for video summaries. Please upgrade your plan for more access.' 
        }),
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // If regenerating, use the provided transcript
    if (isRegenerating && transcript) {
      console.log('Regenerating summary from existing transcript')
      const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
      
      // Generate new summary from existing transcript
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise but comprehensive summaries of educational content. Break down the main points into clear sections with headings. Provide a fresh perspective and organization of the content."
          },
          {
            role: "user",
            content: `Please provide a fresh summary of this lecture transcript, organizing it into clear sections with headings. Focus on key insights and main takeaways:\n\n${transcript}`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })

      console.log('Successfully generated new summary')
      return new Response(
        JSON.stringify({
          summary: summaryCompletion.choices[0].message.content
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          } 
        }
      )
    }

    // Original video processing logic
    if (!url) {
      console.log('Error: No URL provided')
      return new Response(
        JSON.stringify({ error: 'No URL provided' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Processing URL:', url)

    // Extract video ID from URL
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    
    if (!videoId) {
      console.log('Error: Invalid YouTube URL')
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Extracted video ID:', videoId)

    // Get video transcript using YouTube's captions API
    const captionsResponse = await fetch(`https://youtube.com/watch?v=${videoId}`)
    const html = await captionsResponse.text()
    
    // Extract captions track URL from video page
    const captionsMatch = html.match(/"captionTracks":\[\{"baseUrl":"([^"]+)"/);
    if (!captionsMatch) {
      console.log('Error: No captions available')
      throw new Error('No captions available for this video')
    }
    
    const captionsUrl = decodeURIComponent(captionsMatch[1])
    console.log('Fetching captions from:', captionsUrl)
    const transcriptResponse = await fetch(captionsUrl)
    const transcriptXml = await transcriptResponse.text()
    
    // Parse transcript XML
    const textSegments = transcriptXml.match(/<text[^>]*>([^<]*)<\/text>/g) || []
    const fullText = textSegments
      .map(segment => segment.replace(/<[^>]*>/g, ''))
      .join(' ')

    console.log('Successfully extracted transcript')

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

    // Generate summary
    console.log('Generating summary with OpenAI')
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise but comprehensive summaries of educational content. Break down the main points into clear sections with headings."
        },
        {
          role: "user",
          content: `Please summarize the following lecture transcript and organize it into clear sections with headings:\n\n${fullText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const summary = summaryCompletion.choices[0].message.content
    console.log('Successfully generated summary')

    // Get video metadata using YouTube Data API
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    console.log('Fetching video metadata')
    const metadataResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    )
    const metadata = await metadataResponse.json()
    
    const videoData = metadata.items[0]
    const title = videoData?.snippet?.title || 'Untitled Video'
    const duration = videoData?.contentDetails?.duration || 'Unknown Duration'

    console.log('Successfully processed video:', title)

    return new Response(
      JSON.stringify({
        videoId,
        title,
        duration,
        summary,
        transcript: fullText
      }),
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
    })
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
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