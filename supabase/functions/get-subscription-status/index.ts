/**
 * Supabase Edge Function: Get Subscription Status
 *
 * Returns the current subscription status for a user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

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
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription from database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      // No active subscription
      return new Response(
        JSON.stringify({
          isActive: false,
          tier: null,
          expiresAt: null,
          videosRemaining: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if subscription has expired
    const expiresAt = new Date(subscription.expires_at);
    const isExpired = expiresAt < new Date();

    if (isExpired) {
      // Mark as expired in database
      await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({
          isActive: false,
          tier: subscription.tier,
          expiresAt: subscription.expires_at,
          videosRemaining: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate videos remaining
    let videosRemaining = subscription.videos_remaining;
    if (subscription.tier === 'premium') {
      videosRemaining = -1; // Unlimited
    }

    return new Response(
      JSON.stringify({
        isActive: true,
        tier: subscription.tier,
        expiresAt: subscription.expires_at,
        videosRemaining,
        videosUsed: subscription.videos_used || 0,
        startsAt: subscription.starts_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[SUBSCRIPTION] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
