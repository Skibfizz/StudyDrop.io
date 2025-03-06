import { stripe, PLANS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testStripeFlow() {
  console.log('🧪 Starting Stripe subscription flow test...\n');

  try {
    // 1. Create a test customer
    console.log('1️⃣ Creating test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: {
        userId: 'test-user-id',
      },
    });
    console.log('✅ Test customer created:', customer.id);

    // 2. Create a test subscription
    console.log('\n2️⃣ Creating test subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PLANS.basic.priceId }],
      metadata: {
        userId: 'test-user-id',
      },
    });
    console.log('✅ Test subscription created:', subscription.id);

    // 3. Verify subscription in database
    console.log('\n3️⃣ Verifying subscription in database...');
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (dbError) {
      throw new Error(`Database verification failed: ${dbError.message}`);
    }
    console.log('✅ Subscription verified in database');

    // 4. Test subscription update
    console.log('\n4️⃣ Testing subscription update...');
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{ price: PLANS.pro.priceId }],
    });
    console.log('✅ Subscription updated to Pro plan');

    // 5. Test customer portal session
    console.log('\n5️⃣ Testing customer portal session...');
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://studydrop.io/dashboard',
    });
    console.log('✅ Customer portal session created');

    // 6. Test subscription cancellation
    console.log('\n6️⃣ Testing subscription cancellation...');
    const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });
    console.log('✅ Subscription scheduled for cancellation');

    // 7. Clean up test data
    console.log('\n7️⃣ Cleaning up test data...');
    await stripe.subscriptions.cancel(subscription.id);
    await stripe.customers.del(customer.id);
    console.log('✅ Test data cleaned up');

    console.log('\n✨ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testStripeFlow().catch(console.error); 