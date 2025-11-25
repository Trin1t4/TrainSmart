/**
 * Supabase Edge Function: Create Stripe Checkout Session
 *
 * Creates a Stripe Checkout session for one-time payments (6-week programs)
 * No subscriptions - just single purchases
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Price IDs from Stripe Dashboard
const PRICE_IDS: Record<string, string> = {
  base: Deno.env.get('STRIPE_PRICE_BASE') || '',
  pro: Deno.env.get('STRIPE_PRICE_PRO') || '',
  premium: Deno.env.get('STRIPE_PRICE_PREMIUM') || '',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tier, userId, userEmail, successUrl, cancelUrl } = await req.json();

    // Validate input
    if (!tier || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tier, userId, userEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `Invalid tier: ${tier}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment, not subscription
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || 'https://fitnessflow.app/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://fitnessflow.app/dashboard',
      metadata: {
        userId,
        tier,
      },
      // PayPal support (if enabled in Stripe Dashboard)
      // payment_method_types: ['card', 'paypal'],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Italian localization
      locale: 'it',
    });

    console.log(`[STRIPE] Checkout session created: ${session.id} for user ${userId}, tier: ${tier}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[STRIPE] Error creating checkout session:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
