-- ============================================
-- SUBSCRIPTIONS TABLE FOR STRIPE PAYMENTS
-- ============================================
-- Run this migration in Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription details
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('base', 'pro', 'premium')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),

  -- Stripe references
  stripe_session_id VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  stripe_customer_id VARCHAR(255),

  -- Payment details
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'eur',
  customer_email VARCHAR(255),

  -- Video corrections tracking (PRO: 12, PREMIUM: unlimited)
  videos_remaining INTEGER DEFAULT 0,  -- -1 = unlimited
  videos_used INTEGER DEFAULT 0,

  -- Dates
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- 6 weeks from start

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active subscription per user
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_session ON subscriptions(stripe_session_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhook)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Add subscription fields to user_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_tier VARCHAR(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- VIDEO CORRECTION LOGS (for tracking usage)
-- ============================================

CREATE TABLE IF NOT EXISTS video_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Video details
  exercise_name VARCHAR(255) NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,

  -- AI Analysis results
  analysis_status VARCHAR(20) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  corrections JSONB,  -- Array of corrections with timestamps
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,

  -- Index for user lookups
  CONSTRAINT fk_video_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_video_corrections_user ON video_corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_video_corrections_created ON video_corrections(created_at DESC);

-- RLS for video_corrections
ALTER TABLE video_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video corrections"
  ON video_corrections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video corrections"
  ON video_corrections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Decrement video count
-- ============================================

CREATE OR REPLACE FUNCTION decrement_video_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_videos_remaining INTEGER;
  v_tier VARCHAR(20);
BEGIN
  -- Get current subscription
  SELECT videos_remaining, tier INTO v_videos_remaining, v_tier
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN FALSE;  -- No active subscription
  END IF;

  -- Premium has unlimited videos
  IF v_tier = 'premium' THEN
    UPDATE subscriptions
    SET videos_used = videos_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Check if videos remaining
  IF v_videos_remaining <= 0 THEN
    RETURN FALSE;  -- No videos left
  END IF;

  -- Decrement count
  UPDATE subscriptions
  SET
    videos_remaining = videos_remaining - 1,
    videos_used = videos_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table created
-- SELECT * FROM subscriptions LIMIT 1;

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions';

-- Check RLS policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions';
