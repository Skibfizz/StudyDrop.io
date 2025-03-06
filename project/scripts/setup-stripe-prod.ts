import Stripe from 'stripe';

// Initialize Stripe with your production secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

async function setupStripeProd() {
  console.log('🚀 Setting up Stripe for production...\n');

  try {
    // 1. Create products
    console.log('1️⃣ Creating products...');
    
    const basicProduct = await stripe.products.create({
      name: 'Basic Plan',
      description: 'Perfect for getting started',
    });
    console.log('✅ Basic product created:', basicProduct.id);

    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'For serious learners',
    });
    console.log('✅ Pro product created:', proProduct.id);

    // 2. Create prices
    console.log('\n2️⃣ Creating prices...');
    
    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'basic',
      },
    });
    console.log('✅ Basic price created:', basicPrice.id);

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'pro',
      },
    });
    console.log('✅ Pro price created:', proPrice.id);

    // 3. Configure webhook endpoints
    console.log('\n3️⃣ Creating webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'checkout.session.completed',
      ],
    });
    console.log('✅ Webhook endpoint created:', webhook.id);
    console.log('🔑 Webhook signing secret:', webhook.secret);

    // 4. Configure customer portal
    console.log('\n4️⃣ Configuring customer portal...');
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'StudyDrop Subscription Management',
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          proration_behavior: 'none',
        },
        subscription_update: {
          enabled: false,
        },
      },
    });
    console.log('✅ Customer portal configured');

    // Output configuration
    console.log('\n📝 Add these values to your production environment:');
    console.log(`STRIPE_BASIC_PRICE_ID=${basicPrice.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);

    console.log('\n✨ Stripe production setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    throw error;
  }
}

// Run the setup
setupStripeProd().catch(console.error); 