-- ================================================================
-- FIX ALL 406/404/400 ERRORS - COMPLETE MIGRATION
-- Date: 2025-12-18
-- Fixes:
-- 1. Missing tables: body_scans, onboarding_data
-- 2. RLS policies causing 406 errors
-- 3. workout_logs 400 errors
-- ================================================================

-- ================================================================
-- 1. CREATE body_scans TABLE (404 error fix)
-- ================================================================
CREATE TABLE IF NOT EXISTS body_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Scan data
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  scan_type VARCHAR(50) DEFAULT 'photo', -- 'photo', 'measurements', 'dexa'

  -- Body composition
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),

  -- Measurements (cm)
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  biceps DECIMAL(5,2),
  thighs DECIMAL(5,2),

  -- Photo URLs (stored in Supabase Storage)
  front_photo_url TEXT,
  side_photo_url TEXT,
  back_photo_url TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_body_scans_user_id ON body_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_body_scans_date ON body_scans(scan_date DESC);

-- RLS
ALTER TABLE body_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own body scans" ON body_scans;
CREATE POLICY "Users can view own body scans"
  ON body_scans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own body scans" ON body_scans;
CREATE POLICY "Users can insert own body scans"
  ON body_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own body scans" ON body_scans;
CREATE POLICY "Users can update own body scans"
  ON body_scans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own body scans" ON body_scans;
CREATE POLICY "Users can delete own body scans"
  ON body_scans FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 2. CREATE onboarding_data TABLE (404 error fix)
-- ================================================================
CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Anagrafica
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  birth_date DATE,
  privacy_accepted BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,

  -- Personal Info
  gender VARCHAR(10),
  age INTEGER,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  bmi DECIMAL(4,2),

  -- Training
  training_location VARCHAR(50) DEFAULT 'home',
  training_type VARCHAR(50) DEFAULT 'bodyweight',
  equipment JSONB DEFAULT '{}'::jsonb,

  -- Activity
  weekly_frequency INTEGER DEFAULT 3,
  session_duration INTEGER DEFAULT 45,

  -- Goals
  goal VARCHAR(100),
  goals JSONB DEFAULT '[]'::jsonb,
  sport VARCHAR(100),
  sport_role VARCHAR(100),
  muscular_focus JSONB DEFAULT '[]'::jsonb,

  -- Pain
  pain_areas JSONB DEFAULT '[]'::jsonb,

  -- Complete onboarding data
  raw_data JSONB DEFAULT '{}'::jsonb,

  -- Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON onboarding_data(user_id);

-- RLS
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own onboarding" ON onboarding_data;
CREATE POLICY "Users can view own onboarding"
  ON onboarding_data FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding_data;
CREATE POLICY "Users can insert own onboarding"
  ON onboarding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding_data;
CREATE POLICY "Users can update own onboarding"
  ON onboarding_data FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding" ON onboarding_data;
CREATE POLICY "Users can delete own onboarding"
  ON onboarding_data FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 3. FIX workout_logs TABLE (400 error - missing/wrong columns)
-- ================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'workout_logs') THEN
    -- Add any missing columns
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS workout_date TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS day_name VARCHAR(100);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS split_type VARCHAR(100);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS session_rpe DECIMAL(3,1);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT true;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS exercises_completed INTEGER DEFAULT 0;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS total_exercises INTEGER DEFAULT 0;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS mood VARCHAR(50);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS sleep_quality INTEGER;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS stress_level INTEGER;
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS nutrition_quality VARCHAR(20);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS hydration VARCHAR(20);
    ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS context_adjustment DECIMAL(3,2);

    -- Ensure RLS is enabled
    ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

    -- Recreate policies
    DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
    CREATE POLICY "Users can view own workout logs"
      ON workout_logs FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own workout logs" ON workout_logs;
    CREATE POLICY "Users can create own workout logs"
      ON workout_logs FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
    CREATE POLICY "Users can update own workout logs"
      ON workout_logs FOR UPDATE
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;
    CREATE POLICY "Users can delete own workout logs"
      ON workout_logs FOR DELETE
      USING (auth.uid() = user_id);

    RAISE NOTICE 'workout_logs table updated';
  END IF;
END $$;

-- ================================================================
-- 4. FIX training_programs TABLE (406 error - RLS issues)
-- ================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'training_programs') THEN
    -- Ensure RLS is enabled
    ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

    -- Recreate policies (drop if exists, then create)
    DROP POLICY IF EXISTS "Users can view own programs" ON training_programs;
    CREATE POLICY "Users can view own programs"
      ON training_programs FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own programs" ON training_programs;
    CREATE POLICY "Users can insert own programs"
      ON training_programs FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own programs" ON training_programs;
    CREATE POLICY "Users can update own programs"
      ON training_programs FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own programs" ON training_programs;
    CREATE POLICY "Users can delete own programs"
      ON training_programs FOR DELETE
      USING (auth.uid() = user_id);

    RAISE NOTICE 'training_programs RLS policies recreated';
  END IF;
END $$;

-- ================================================================
-- 5. FIX pain_thresholds TABLE (406 error - RLS issues)
-- ================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'pain_thresholds') THEN
    -- Ensure RLS is enabled
    ALTER TABLE pain_thresholds ENABLE ROW LEVEL SECURITY;

    -- Recreate policies
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

    RAISE NOTICE 'pain_thresholds RLS policies recreated';
  END IF;
END $$;

-- ================================================================
-- 6. FIX user_profiles / users VIEW (406 error)
-- ================================================================
DO $$
BEGIN
  -- Check if users is a VIEW (not a table)
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'users') THEN
    -- Drop and recreate view with proper permissions
    DROP VIEW IF EXISTS users;

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

    -- Grant access to authenticated users
    GRANT SELECT ON users TO authenticated;
    GRANT SELECT ON users TO anon;

    RAISE NOTICE 'users VIEW recreated with proper permissions';
  END IF;

  -- Ensure user_profiles has proper RLS
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

    -- Add policy to view public profiles (for social features)
    DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
    CREATE POLICY "Anyone can view public profiles"
      ON user_profiles FOR SELECT
      USING (
        auth.uid() = user_id
        OR privacy_setting = 'public'
        OR privacy_setting IS NULL
      );

    RAISE NOTICE 'user_profiles RLS updated';
  END IF;
END $$;

-- ================================================================
-- 7. GRANT PERMISSIONS
-- ================================================================
GRANT ALL ON body_scans TO authenticated;
GRANT ALL ON onboarding_data TO authenticated;
GRANT SELECT ON body_scans TO anon;
GRANT SELECT ON onboarding_data TO anon;

-- ================================================================
-- VALIDATION
-- ================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'body_scans') THEN
    RAISE EXCEPTION 'body_scans table was not created';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'onboarding_data') THEN
    RAISE EXCEPTION 'onboarding_data table was not created';
  END IF;

  RAISE NOTICE '✅ All tables created and RLS policies applied successfully';
END $$;
