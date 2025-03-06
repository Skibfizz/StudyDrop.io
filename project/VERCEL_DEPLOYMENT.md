# Vercel Deployment Guide

This guide will help you deploy the StudyDrop application to Vercel.

## Prerequisites

1. A Vercel account
2. A GitHub repository with your StudyDrop code
3. Supabase project with credentials
4. Stripe account with API keys
5. OpenAI API key

## Deployment Steps

1. Push your code to GitHub
2. Log in to Vercel and create a new project
3. Import your GitHub repository
4. Configure the following environment variables in the Vercel project settings:

### Required Environment Variables

```
# NextAuth configuration
NEXTAUTH_URL=https://your-production-url.vercel.app
NEXTAUTH_SECRET=studydrop-secret-key-2024-secure

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_BASIC_PRICE_ID=your-stripe-basic-price-id
STRIPE_PRO_PRICE_ID=your-stripe-pro-price-id
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

5. Deploy the project

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Make sure all environment variables are correctly set in Vercel
2. Check the Vercel deployment logs for any errors
3. Ensure your Supabase and Stripe configurations are correct
4. Verify that your Google OAuth credentials are set up for the correct domain

## Important Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is required for the Stripe webhook functionality
- The `STRIPE_WEBHOOK_SECRET` is needed for verifying Stripe webhook events
- Update the `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match your actual Vercel deployment URL 