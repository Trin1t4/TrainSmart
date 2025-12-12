-- ========================================
-- FITNESSFLOW - TRAINING PROGRAMS MIGRATION
-- Version: 1.0.0
-- Date: 2025-11-17
-- Description: Complete schema for multi-device training programs with cloud sync
-- ========================================

-- PART 1: DROP EXISTING TABLE (if needed for clean migration)
-- UNCOMMENT ONLY IF YOU WANT TO START FRESH (WARNING: DELETES ALL DATA)
-- DROP TABLE IF EXISTS training_programs CASCADE;

-- PART 2: CREATE OR UPDATE training_programs TABLE
CREATE TABLE IF NOT EXISTS training_programs (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Program Metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Program Configuration
  level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  goal VARCHAR(100) NOT NULL,
  location VARCHAR(50) DEFAULT 'home',
  training_type VARCHAR(50) DEFAULT 'bodyweight',

  -- Frequency & Split
  frequency INTEGER NOT NULL CHECK (frequency >= 1 AND frequency <= 7),
  split VARCHAR(50) NOT NULL,
  days_per_week INTEGER DEFAULT 3,

  -- Weekly Structure (NEW - CRITICAL FOR MULTI-DAY PROGRAMS)
  weekly_split JSONB DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "day": 1,
  --     "name": "Upper Body",
  --     "focus": "horizontal_push, vertical_pull",
  --     "exercises": [...]
  --   }
  -- ]

  -- Complete Exercise List (for backward compatibility)
  exercises JSONB DEFAULT '[]'::jsonb,

  -- Program Timeline
  total_weeks INTEGER DEFAULT 8,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Activity Status (NEW - MULTI-PROGRAM SUPPORT)
  is_active BOOLEAN DEFAULT true,
  -- Only ONE program can be is_active=true per user at a time

  -- Program Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused', 'archived')),

  -- Assessment Link
  assessment_id UUID,

  -- Progression & Advanced Features
  progression JSONB DEFAULT '[]'::jsonb,
  includes_deload BOOLEAN DEFAULT false,
  deload_frequency INTEGER DEFAULT 4,

  -- Pain Management
  pain_areas JSONB DEFAULT '[]'::jsonb,
  corrective_exercises JSONB DEFAULT '[]'::jsonb,

  -- Equipment
  available_equipment JSONB DEFAULT '{}'::jsonb,

  -- Baselines from Screening
  pattern_baselines JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "lower_push": {"variantId": "pistol_squat", "reps": 8, "difficulty": 8},
  --   "horizontal_push": {"variantId": "archer_pushup", "reps": 10, "difficulty": 8}
  -- }

  -- Weekly Schedule (for calendar view)
  weekly_schedule JSONB DEFAULT '[]'::jsonb,

  -- Additional Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT valid_deload CHECK (deload_frequency >= 1)
);

-- PART 3: CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_training_programs_user_id ON training_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_is_active ON training_programs(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_training_programs_status ON training_programs(status);
CREATE INDEX IF NOT EXISTS idx_training_programs_created_at ON training_programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_programs_start_date ON training_programs(start_date DESC);

-- PART 4: ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can insert own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can update own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can delete own programs" ON training_programs;

-- Policy 1: Users can SELECT their own programs
CREATE POLICY "Users can view own programs"
  ON training_programs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own programs
CREATE POLICY "Users can insert own programs"
  ON training_programs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own programs
CREATE POLICY "Users can update own programs"
  ON training_programs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own programs
CREATE POLICY "Users can delete own programs"
  ON training_programs
  FOR DELETE
  USING (auth.uid() = user_id);

-- PART 5: TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_training_programs_updated_at ON training_programs;

CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON training_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PART 6: FUNCTION TO ENSURE ONLY ONE ACTIVE PROGRAM PER USER
CREATE OR REPLACE FUNCTION ensure_single_active_program()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this program to active, deactivate all other programs for this user
  IF NEW.is_active = true THEN
    UPDATE training_programs
    SET is_active = false, updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_active_program ON training_programs;

CREATE TRIGGER enforce_single_active_program
  BEFORE INSERT OR UPDATE OF is_active ON training_programs
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_program();

-- PART 7: UTILITY VIEWS FOR EASIER QUERIES

-- View for active programs only
CREATE OR REPLACE VIEW active_programs AS
SELECT * FROM training_programs
WHERE is_active = true
ORDER BY created_at DESC;

-- View for program history (inactive programs)
CREATE OR REPLACE VIEW program_history AS
SELECT * FROM training_programs
WHERE is_active = false
ORDER BY created_at DESC;

-- PART 8: HELPER FUNCTIONS

-- Function to get user's active program
CREATE OR REPLACE FUNCTION get_active_program(p_user_id UUID)
RETURNS SETOF training_programs AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM training_programs
  WHERE user_id = p_user_id
    AND is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old programs
CREATE OR REPLACE FUNCTION archive_old_programs(p_user_id UUID, days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE training_programs
  SET status = 'archived', updated_at = NOW()
  WHERE user_id = p_user_id
    AND is_active = false
    AND status = 'completed'
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 9: GRANT PERMISSIONS (if needed for service role)
-- These are typically handled by Supabase automatically, but included for completeness

GRANT ALL ON training_programs TO authenticated;
GRANT ALL ON training_programs TO service_role;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- VERIFICATION QUERIES (run these after migration to verify)
-- SELECT COUNT(*) FROM training_programs;
-- SELECT * FROM training_programs LIMIT 5;
-- SELECT * FROM active_programs LIMIT 5;
-- SELECT * FROM program_history LIMIT 5;

-- NOTES FOR DEPLOYMENT:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify RLS policies are active: SELECT * FROM pg_policies WHERE tablename = 'training_programs';
-- 3. Test with a user: INSERT a program and verify only that user can see it
-- 4. Monitor indexes: SELECT * FROM pg_indexes WHERE tablename = 'training_programs';
-- 5. For production: Consider adding backup before migration
