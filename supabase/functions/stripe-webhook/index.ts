/**
 * Supabase Edge Function: Stripe Webhook Handler
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed: Payment successful, activate subscription
 * - payment_intent.payment_failed: Payment failed
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Video limits per tier
const VIDEO_LIMITS: Record<string, number> = {
  base: 0,
  pro: 12,
  premium: -1, // Unlimited
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);

    console.log(`[WEBHOOK] Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId || session.client_reference_id;
        const tier = session.metadata?.tier || 'base';
        const customerEmail = session.customer_email;

        if (!userId) {
          console.error('[WEBHOOK] No userId in session metadata');
          break;
        }

        // Calculate expiration (6 weeks from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 42); // 6 weeks = 42 days

        // Upsert subscription record
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            tier,
            status: 'active',
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'eur',
            customer_email: customerEmail,
            videos_remaining: VIDEO_LIMITS[tier] ?? 0,
            videos_used: 0,
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subscriptionError) {
          console.error('[WEBHOOK] Error saving subscription:', subscriptionError);
        } else {
          console.log(`[WEBHOOK] Subscription activated for user ${userId}, tier: ${tier}`);
        }

        // Update user_profiles to mark as paid user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            subscription_tier: tier,
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error('[WEBHOOK] Error updating user_profiles:', profileError);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[WEBHOOK] Payment failed: ${paymentIntent.id}`);
        // Could send email notification here
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
