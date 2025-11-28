/**
 * Stripe Client - Frontend integration
 *
 * Uses Stripe Checkout (hosted) for simplicity and security.
 * No credit card data touches our servers.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key (safe to expose in frontend)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (singleton)
 */
export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Product/Price IDs from Stripe Dashboard
 * These are created in Stripe Dashboard > Products
 */
export const STRIPE_PRICES = {
  base: import.meta.env.VITE_STRIPE_PRICE_BASE || '',
  pro: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
  premium: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || '',
} as const;

export type PlanTier = keyof typeof STRIPE_PRICES;

/**
 * Plan details for display
 */
export const PLAN_DETAILS = {
  base: {
    name: 'BASE',
    price: 19.90,
    duration: '6 weeks',
    features: ['Complete program', 'Progressive overload', 'Pain management', 'Workout logger']
  },
  pro: {
    name: 'PRO',
    price: 29.90,
    duration: '6 weeks',
    features: ['All BASE features', '12 video corrections', 'Technique history', 'HD tutorials']
  },
  premium: {
    name: 'PREMIUM',
    price: 44.90,
    duration: '6 weeks',
    features: ['All PRO features', 'Unlimited videos', 'PDF export', 'Priority support']
  }
} as const;

/**
 * Create Stripe Checkout session via Supabase Edge Function
 */
export async function createCheckoutSession(
  tier: PlanTier,
  userId: string,
  userEmail: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ sessionId: string; url: string } | { error: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        tier,
        userId,
        userEmail,
        successUrl: successUrl || `${window.location.origin}/payment-success`,
        cancelUrl: cancelUrl || `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create checkout session' };
    }

    const data = await response.json();
    return { sessionId: data.sessionId, url: data.url };
  } catch (error) {
    console.error('[STRIPE] Error creating checkout session:', error);
    return { error: 'Network error. Please try again.' };
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(tier: PlanTier, userId: string, userEmail: string): Promise<void> {
  const result = await createCheckoutSession(tier, userId, userEmail);

  if ('error' in result) {
    throw new Error(result.error);
  }

  // Redirect to Stripe hosted checkout page
  window.location.href = result.url;
}

/**
 * Get user subscription status
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  tier: PlanTier | null;
  expiresAt: Date | null;
  videosRemaining: number;
} | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/get-subscription-status?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[STRIPE] Error getting subscription status:', error);
    return null;
  }
}
