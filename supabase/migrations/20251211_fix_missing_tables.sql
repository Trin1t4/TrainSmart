-- ================================================================
-- FIX MISSING TABLES & VIEWS - MIGRATION
-- Date: 2025-12-11
-- Fixes 406/400/404 errors from console logs
-- ================================================================

-- ================================================================
-- 1. CREATE user_profiles TABLE (if not exists)
-- ================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 1B. ADD MISSING COLUMNS TO user_profiles (if table already exists)
-- ================================================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS privacy_setting VARCHAR(20) DEFAULT 'public';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_volume DECIMAL(12,2) DEFAULT 0;

-- Create indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_tier);

-- Username unique index (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_username') THEN
    CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
  END IF;
END $$;

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- 2. HANDLE 'users' TABLE/VIEW
-- If 'users' is a table, add missing columns
-- If it doesn't exist, create as view
-- ================================================================
DO $$
BEGIN
  -- Check if 'users' exists as a TABLE
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- It's a table - add missing columns
    RAISE NOTICE 'users exists as TABLE - adding missing columns';

    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

    -- Enable RLS on users table
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    DROP POLICY IF EXISTS "Users can view own data" ON users;
    CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own data" ON users;
    CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

  ELSIF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'users') THEN
    -- It's already a view - drop and recreate
    RAISE NOTICE 'users exists as VIEW - recreating';
    DROP VIEW users;

    CREATE VIEW users AS
    SELECT
      au.id,
      au.email,
      au.created_at,
      COALESCE(up.subscription_tier, 'free') as subscription_tier,
      COALESCE(up.subscription_status, 'active') as subscription_status,
      up.first_name,
      up.last_name,
      up.avatar_url,
      up.username
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.user_id;

    GRANT SELECT ON users TO authenticated;

  ELSE
    -- Doesn't exist - create as view
    RAISE NOTICE 'users does not exist - creating as VIEW';

    CREATE VIEW users AS
    SELECT
      au.id,
      au.email,
      au.created_at,
      COALESCE(up.subscription_tier, 'free') as subscription_tier,
      COALESCE(up.subscription_status, 'active') as subscription_status,
      up.first_name,
      up.last_name,
      up.avatar_url,
      up.username
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.user_id;

    GRANT SELECT ON users TO authenticated;
  END IF;
END $$;

-- ================================================================
-- 3. CREATE pain_thresholds TABLE
-- Used by painManagementService.ts
-- ================================================================
CREATE TABLE IF NOT EXISTS pain_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name VARCHAR(200) NOT NULL,

  -- Pain threshold data
  max_pain_level INTEGER DEFAULT 5 CHECK (max_pain_level >= 0 AND max_pain_level <= 10),
  current_pain_level INTEGER DEFAULT 0 CHECK (current_pain_level >= 0 AND current_pain_level <= 10),
  pain_history JSONB DEFAULT '[]'::jsonb,

  -- Restrictions
  is_restricted BOOLEAN DEFAULT false,
  restriction_reason TEXT,
  alternative_exercise VARCHAR(200),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique per user per exercise
  CONSTRAINT unique_user_exercise_pain UNIQUE (user_id, exercise_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pain_thresholds_user ON pain_thresholds(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_thresholds_exercise ON pain_thresholds(exercise_name);

-- RLS
ALTER TABLE pain_thresholds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pain thresholds" ON pain_thresholds;
CREATE POLICY "Users can view own pain thresholds"
  ON pain_thresholds FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pain thresholds" ON pain_thresholds;
CREATE POLICY "Users can insert own pain thresholds"
  ON pain_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pain thresholds" ON pain_thresholds;
CREATE POLICY "Users can update own pain thresholds"
  ON pain_thresholds FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pain thresholds" ON pain_thresholds;
CREATE POLICY "Users can delete own pain thresholds"
  ON pain_thresholds FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 4. ADD MISSING COLUMNS TO workout_logs (if table exists)
-- The autoRegulationService.ts uses these columns
-- ================================================================
DO $$
BEGIN
  -- Check if workout_logs exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'workout_logs') THEN
    -- Add new contextual columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_logs' AND column_name = 'stress_level') THEN
      ALTER TABLE workout_logs ADD COLUMN stress_level INTEGER CHECK (stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 10));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_logs' AND column_name = 'nutrition_quality') THEN
      ALTER TABLE workout_logs ADD COLUMN nutrition_quality VARCHAR(20) CHECK (nutrition_quality IS NULL OR nutrition_quality IN ('good', 'normal', 'poor'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_logs' AND column_name = 'hydration') THEN
      ALTER TABLE workout_logs ADD COLUMN hydration VARCHAR(20) CHECK (hydration IS NULL OR hydration IN ('good', 'normal', 'poor'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_logs' AND column_name = 'context_adjustment') THEN
      ALTER TABLE workout_logs ADD COLUMN context_adjustment DECIMAL(3,2);
    END IF;

    RAISE NOTICE 'workout_logs columns updated';
  ELSE
    RAISE NOTICE 'workout_logs table does not exist - run rpe_autoregulation_migration.sql first';
  END IF;
END $$;

-- ================================================================
-- 5. CREATE user_programs VIEW (for backward compatibility)
-- This is what some code tries to query
-- ================================================================
DROP VIEW IF EXISTS user_programs;
CREATE VIEW user_programs AS
SELECT
  tp.id,
  tp.user_id,
  tp.name as program_name,
  tp.level,
  tp.goal,
  tp.frequency,
  tp.split,
  tp.status,
  tp.is_active,
  tp.exercises,
  tp.weekly_split,
  tp.pattern_baselines as screening_data,
  tp.created_at,
  tp.updated_at
FROM training_programs tp;

-- Grant access
GRANT SELECT ON user_programs TO authenticated;

-- ================================================================
-- 6. TRIGGER to auto-create user_profile on signup
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();

-- ================================================================
-- 7. BACKFILL existing users into user_profiles
-- ================================================================
INSERT INTO user_profiles (user_id, email, created_at)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================================
-- VALIDATION
-- ================================================================
DO $$
BEGIN
  -- Verify tables
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_profiles') THEN
    RAISE EXCEPTION 'user_profiles table was not created';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'pain_thresholds') THEN
    RAISE EXCEPTION 'pain_thresholds table was not created';
  END IF;

  RAISE NOTICE 'All missing tables created successfully';
END $$;
