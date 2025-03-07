import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    supadata_api_key_exists: !!process.env.SUPADATA_API_KEY,
    openai_api_key_exists: !!process.env.OPENAI_API_KEY,
    supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
} 