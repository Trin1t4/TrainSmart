-- ================================================================
-- RPE AUTO-REGULATION SYSTEM - SUPABASE MIGRATION
-- ================================================================
-- Sistema di tracking fatica percepita e auto-regolazione programmi
--
-- FEATURES:
-- 1. Workout logging con RPE per esercizio
-- 2. Analisi trend RPE (ultimi 2+ sessioni)
-- 3. Auto-adjustment automatico volume/intensità
-- 4. Deload weeks automatici
-- 5. Performance tracking
-- ================================================================

-- ================================================================
-- 1. WORKOUT LOGS (Sessioni di allenamento completate)
-- ================================================================
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,

  -- Workout Info
  workout_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  day_name VARCHAR(50), -- "Day A", "Day 1 - Push", etc.
  split_type VARCHAR(50), -- "Full Body 3x", "Upper/Lower", "PPL"

  -- Session RPE (calcolato come media degli exercise RPE)
  session_rpe DECIMAL(3,1), -- 1.0 to 10.0
  session_duration_minutes INTEGER, -- durata totale sessione

  -- Completion Status
  completed BOOLEAN DEFAULT true,
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,

  -- User Notes
  notes TEXT,
  mood VARCHAR(50), -- "energized", "tired", "normal", "stressed"
  sleep_quality INTEGER, -- 1-10 (opzionale, influenza RPE)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT workout_logs_session_rpe_check CHECK (session_rpe >= 1.0 AND session_rpe <= 10.0),
  CONSTRAINT workout_logs_sleep_quality_check CHECK (sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 10))
);

-- ================================================================
-- 2. EXERCISE LOGS (Singoli esercizi completati con RPE)
-- ================================================================
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,

  -- Exercise Info
  exercise_name VARCHAR(200) NOT NULL,
  pattern VARCHAR(50), -- "lower_push", "horizontal_push", etc.

  -- Performance Data
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL, -- reps per set (se variabile, media)
  weight_used DECIMAL(6,2), -- peso utilizzato (kg), NULL per bodyweight

  -- RPE per esercizio (1-10)
  exercise_rpe DECIMAL(3,1) NOT NULL, -- ⭐ Core metric for auto-regulation

  -- Perceived Difficulty (rispetto al baseline)
  difficulty_vs_baseline VARCHAR(20), -- "easier", "as_expected", "harder"

  -- Failure/Completion
  sets_to_failure INTEGER DEFAULT 0, -- quante serie a cedimento
  reps_in_reserve INTEGER, -- RIR (Reps In Reserve), complementare a RPE

  -- Notes
  notes TEXT,
  technique_quality VARCHAR(20), -- "excellent", "good", "fair", "poor"

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT exercise_logs_rpe_check CHECK (exercise_rpe >= 1.0 AND exercise_rpe <= 10.0),
  CONSTRAINT exercise_logs_sets_check CHECK (sets_completed > 0),
  CONSTRAINT exercise_logs_reps_check CHECK (reps_completed > 0),
  CONSTRAINT exercise_logs_rir_check CHECK (reps_in_reserve IS NULL OR reps_in_reserve >= 0)
);

-- ================================================================
-- 3. PROGRAM ADJUSTMENTS (History delle modifiche auto-regulation)
-- ================================================================
CREATE TABLE IF NOT EXISTS program_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,

  -- Trigger Info
  trigger_type VARCHAR(50) NOT NULL, -- "high_rpe", "low_rpe", "deload_needed", "manual"
  trigger_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- RPE Analysis
  avg_rpe_before DECIMAL(3,1), -- RPE medio prima dell'adjustment
  sessions_analyzed INTEGER, -- quante sessioni analizzate (es. 2-3)

  -- Adjustment Applied
  adjustment_type VARCHAR(50) NOT NULL, -- "decrease_volume", "increase_volume", "deload_week"
  volume_change_percent INTEGER, -- -10%, +10%, etc.

  -- Affected Exercises
  exercises_affected JSONB, -- Array di esercizi modificati
  -- Example: [{"name": "Squat", "old_sets": 5, "new_sets": 4, "old_reps": "3-5", "new_reps": "3-5"}]

  -- Status
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,

  -- User Feedback
  user_accepted BOOLEAN, -- se utente ha accettato/confermato
  user_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. INDEXES (Performance Optimization)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date
  ON workout_logs(user_id, workout_date DESC);

CREATE INDEX IF NOT EXISTS idx_workout_logs_program
  ON workout_logs(program_id, workout_date DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout
  ON exercise_logs(workout_log_id);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_pattern
  ON exercise_logs(pattern);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_rpe
  ON exercise_logs(exercise_rpe);

CREATE INDEX IF NOT EXISTS idx_program_adjustments_user
  ON program_adjustments(user_id, trigger_date DESC);

CREATE INDEX IF NOT EXISTS idx_program_adjustments_program
  ON program_adjustments(program_id, trigger_date DESC);

-- ================================================================
-- 4B. ALTER TABLE - Ensure all columns exist (Idempotency)
-- ================================================================
-- In caso la tabella esistesse già, aggiungiamo le colonne mancanti

-- Workout Logs: Aggiungi colonne se non esistono
ALTER TABLE workout_logs
  ADD COLUMN IF NOT EXISTS workout_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS day_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS split_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS session_rpe DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS exercises_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_exercises INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS mood VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sleep_quality INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Exercise Logs: Aggiungi colonne se non esistono
ALTER TABLE exercise_logs
  ADD COLUMN IF NOT EXISTS exercise_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS pattern VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sets_completed INTEGER,
  ADD COLUMN IF NOT EXISTS reps_completed INTEGER,
  ADD COLUMN IF NOT EXISTS weight_used DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS exercise_rpe DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS difficulty_vs_baseline VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sets_to_failure INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reps_in_reserve INTEGER,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS technique_quality VARCHAR(20);

-- Program Adjustments: Aggiungi colonne se non esistono
ALTER TABLE program_adjustments
  ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS trigger_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS avg_rpe_before DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS sessions_analyzed INTEGER,
  ADD COLUMN IF NOT EXISTS adjustment_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS volume_change_percent INTEGER,
  ADD COLUMN IF NOT EXISTS exercises_affected JSONB,
  ADD COLUMN IF NOT EXISTS applied BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_accepted BOOLEAN,
  ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- ================================================================
-- 5. RLS POLICIES (Row Level Security)
-- ================================================================

-- Enable RLS
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_adjustments ENABLE ROW LEVEL SECURITY;

-- Workout Logs Policies (Drop existing first for idempotency)
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

-- Exercise Logs Policies (via workout_logs ownership)
DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own exercise logs" ON exercise_logs;
CREATE POLICY "Users can create own exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;
CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- Program Adjustments Policies
DROP POLICY IF EXISTS "Users can view own adjustments" ON program_adjustments;
CREATE POLICY "Users can view own adjustments"
  ON program_adjustments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own adjustments" ON program_adjustments;
CREATE POLICY "Users can create own adjustments"
  ON program_adjustments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own adjustments" ON program_adjustments;
CREATE POLICY "Users can update own adjustments"
  ON program_adjustments FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- 6. HELPER FUNCTIONS (RPE Analysis & Auto-Regulation)
-- ================================================================

-- Function: Calculate average RPE for last N sessions
CREATE OR REPLACE FUNCTION get_avg_rpe_last_sessions(
  p_user_id UUID,
  p_program_id UUID,
  p_sessions_count INTEGER DEFAULT 2
)
RETURNS TABLE (
  avg_session_rpe DECIMAL(3,1),
  avg_exercise_rpe DECIMAL(3,1),
  sessions_analyzed INTEGER,
  trend VARCHAR(20) -- "increasing", "decreasing", "stable"
) AS $$
DECLARE
  v_avg_session_rpe DECIMAL(3,1);
  v_avg_exercise_rpe DECIMAL(3,1);
  v_sessions_count INTEGER;
  v_trend VARCHAR(20);
  v_first_rpe DECIMAL(3,1);
  v_last_rpe DECIMAL(3,1);
BEGIN
  -- Get average session RPE
  SELECT
    AVG(wl.session_rpe),
    COUNT(*)
  INTO
    v_avg_session_rpe,
    v_sessions_count
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND wl.session_rpe IS NOT NULL
  ORDER BY wl.workout_date DESC
  LIMIT p_sessions_count;

  -- Get average exercise RPE across same sessions
  SELECT AVG(el.exercise_rpe)
  INTO v_avg_exercise_rpe
  FROM exercise_logs el
  JOIN workout_logs wl ON el.workout_log_id = wl.id
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
  ORDER BY wl.workout_date DESC
  LIMIT p_sessions_count * 7; -- Assumendo ~7 esercizi per sessione

  -- Determine trend (compare first vs last session)
  SELECT wl.session_rpe
  INTO v_first_rpe
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND wl.session_rpe IS NOT NULL
  ORDER BY wl.workout_date ASC
  LIMIT 1 OFFSET (p_sessions_count - 1);

  SELECT wl.session_rpe
  INTO v_last_rpe
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND wl.session_rpe IS NOT NULL
  ORDER BY wl.workout_date DESC
  LIMIT 1;

  -- Calculate trend
  IF v_last_rpe IS NULL OR v_first_rpe IS NULL THEN
    v_trend := 'insufficient_data';
  ELSIF v_last_rpe > v_first_rpe + 0.5 THEN
    v_trend := 'increasing';
  ELSIF v_last_rpe < v_first_rpe - 0.5 THEN
    v_trend := 'decreasing';
  ELSE
    v_trend := 'stable';
  END IF;

  RETURN QUERY SELECT
    v_avg_session_rpe,
    v_avg_exercise_rpe,
    v_sessions_count,
    v_trend;
END;
$$ LANGUAGE plpgsql;

-- Function: Get exercises that need adjustment (RPE consistently too high/low)
CREATE OR REPLACE FUNCTION get_exercises_needing_adjustment(
  p_user_id UUID,
  p_program_id UUID,
  p_sessions_count INTEGER DEFAULT 2
)
RETURNS TABLE (
  exercise_name VARCHAR(200),
  pattern VARCHAR(50),
  avg_rpe DECIMAL(3,1),
  occurrences INTEGER,
  adjustment_needed VARCHAR(20) -- "decrease_volume", "increase_volume", "none"
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.exercise_name,
    el.pattern,
    AVG(el.exercise_rpe)::DECIMAL(3,1) as avg_rpe,
    COUNT(*)::INTEGER as occurrences,
    CASE
      WHEN AVG(el.exercise_rpe) > 8.5 THEN 'decrease_volume'::VARCHAR(20)
      WHEN AVG(el.exercise_rpe) < 6.0 THEN 'increase_volume'::VARCHAR(20)
      ELSE 'none'::VARCHAR(20)
    END as adjustment_needed
  FROM exercise_logs el
  JOIN workout_logs wl ON el.workout_log_id = wl.id
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
  GROUP BY el.exercise_name, el.pattern
  HAVING COUNT(*) >= p_sessions_count
    AND (AVG(el.exercise_rpe) > 8.5 OR AVG(el.exercise_rpe) < 6.0)
  ORDER BY AVG(el.exercise_rpe) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Update session RPE (auto-calculate from exercise logs)
CREATE OR REPLACE FUNCTION update_session_rpe()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workout_logs
  SET session_rpe = (
    SELECT AVG(exercise_rpe)
    FROM exercise_logs
    WHERE workout_log_id = NEW.workout_log_id
  ),
  updated_at = NOW()
  WHERE id = NEW.workout_log_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update session RPE when exercise log is added/updated
DROP TRIGGER IF EXISTS trigger_update_session_rpe ON exercise_logs;
CREATE TRIGGER trigger_update_session_rpe
AFTER INSERT OR UPDATE ON exercise_logs
FOR EACH ROW
EXECUTE FUNCTION update_session_rpe();

-- ================================================================
-- 7. SAMPLE QUERIES (For Testing & Monitoring)
-- ================================================================

-- Query: Get user's last 5 workouts with RPE
-- SELECT
--   workout_date,
--   day_name,
--   session_rpe,
--   exercises_completed,
--   mood,
--   notes
-- FROM workout_logs
-- WHERE user_id = '<user_id>'
-- ORDER BY workout_date DESC
-- LIMIT 5;

-- Query: Get exercises with highest RPE in last 7 days
-- SELECT
--   el.exercise_name,
--   el.pattern,
--   el.exercise_rpe,
--   el.sets_completed,
--   el.reps_completed,
--   wl.workout_date
-- FROM exercise_logs el
-- JOIN workout_logs wl ON el.workout_log_id = wl.id
-- WHERE wl.user_id = '<user_id>'
--   AND wl.workout_date >= NOW() - INTERVAL '7 days'
-- ORDER BY el.exercise_rpe DESC
-- LIMIT 10;

-- Query: Analyze if user needs auto-regulation
-- SELECT * FROM get_avg_rpe_last_sessions('<user_id>', '<program_id>', 2);
-- SELECT * FROM get_exercises_needing_adjustment('<user_id>', '<program_id>', 2);

-- ================================================================
-- 8. INITIAL DATA VALIDATION
-- ================================================================

-- Verify tables created
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'workout_logs') THEN
    RAISE EXCEPTION 'Table workout_logs was not created';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'exercise_logs') THEN
    RAISE EXCEPTION 'Table exercise_logs was not created';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'program_adjustments') THEN
    RAISE EXCEPTION 'Table program_adjustments was not created';
  END IF;

  RAISE NOTICE '✅ All RPE auto-regulation tables created successfully';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Implement workout logging UI (React)
-- 3. Build auto-regulation service (TypeScript)
-- 4. Create RPE trend dashboard
-- 5. Test with real user data
-- ================================================================
