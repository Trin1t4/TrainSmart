-- ============================================================================
-- MIGRATION: Feedback Loop + MEV/MRV Calculation
-- ============================================================================
-- Adds:
-- 1. user_volume_profile: MEV/MRV per muscle group per user
-- 2. mesocycle_retest: end-of-cycle retest results
-- 3. RPC functions for feedback history queries used by program generator
-- ============================================================================

-- ============================================================================
-- 1. USER VOLUME PROFILE (MEV/MRV per muscle group)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_volume_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muscle_group TEXT NOT NULL, -- 'chest', 'back', 'quads', 'hamstrings', 'shoulders', 'biceps', 'triceps', 'core', 'glutes', 'calves'

  -- Volume landmarks (sets per week)
  mev DECIMAL(4,1) NOT NULL DEFAULT 6.0,   -- Minimum Effective Volume
  mav DECIMAL(4,1) NOT NULL DEFAULT 12.0,  -- Maximum Adaptive Volume
  mrv DECIMAL(4,1) NOT NULL DEFAULT 18.0,  -- Maximum Recoverable Volume
  current_volume DECIMAL(4,1) DEFAULT 10.0, -- Current programmed sets/week

  -- Calibration data
  sessions_tracked INTEGER DEFAULT 0,
  last_calibrated_at TIMESTAMPTZ DEFAULT NOW(),
  calibration_confidence TEXT DEFAULT 'low' CHECK (calibration_confidence IN ('low', 'medium', 'high')),

  -- Trend data
  volume_trend TEXT DEFAULT 'stable' CHECK (volume_trend IN ('increasing', 'stable', 'decreasing', 'needs_deload')),
  avg_rpe_at_current_volume DECIMAL(3,1),
  recovery_score DECIMAL(3,1), -- 1-10 based on session-to-session performance

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_muscle UNIQUE(user_id, muscle_group)
);

-- RLS
ALTER TABLE public.user_volume_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own volume profile"
  ON public.user_volume_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own volume profile"
  ON public.user_volume_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own volume profile"
  ON public.user_volume_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_volume_profile_user ON public.user_volume_profile(user_id);

-- ============================================================================
-- 2. MESOCYCLE RETEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mesocycle_retest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID,

  -- Retest context
  mesocycle_number INTEGER NOT NULL DEFAULT 1,
  retest_date TIMESTAMPTZ DEFAULT NOW(),
  weeks_completed INTEGER NOT NULL,
  total_sessions_completed INTEGER NOT NULL,

  -- Performance data (max lifts or bodyweight test results)
  exercise_results JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Format: [{ "exercise": "Squat", "pattern": "lower_push", "old_max": 80, "new_max": 85, "change_percent": 6.25, "reps_tested": 5 }]

  -- Feedback aggregation from the mesocycle
  avg_session_rpe DECIMAL(3,1),
  avg_completion_rate DECIMAL(5,2), -- % of programmed exercises completed
  total_pain_reports INTEGER DEFAULT 0,

  -- Volume profile snapshot
  volume_profile_snapshot JSONB, -- snapshot of user_volume_profile at retest time

  -- Recommendations generated
  recommendations JSONB,
  -- Format: { "volume_change": "+10%", "exercise_swaps": [...], "deload_needed": false, "new_baselines": {...} }

  -- User decision
  user_accepted_recommendations BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mesocycle_retest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own retests"
  ON public.mesocycle_retest FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retests"
  ON public.mesocycle_retest FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_retest_user ON public.mesocycle_retest(user_id, retest_date DESC);

-- ============================================================================
-- 3. RPC: Get exercise feedback history for program generation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_exercise_feedback_history(
  p_user_id UUID,
  p_sessions_limit INTEGER DEFAULT 4
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verify caller is the user or admin
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_agg(exercise_data ORDER BY exercise_data->>'exercise_name')
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'exercise_name', el.exercise_name,
      'pattern', el.pattern,
      'sessions_count', COUNT(DISTINCT wl.id),
      'avg_rpe', ROUND(AVG(el.exercise_rpe)::numeric, 1),
      'avg_rir', ROUND(AVG(el.reps_in_reserve)::numeric, 1),
      'avg_weight', ROUND(AVG(el.weight_used)::numeric, 1),
      'avg_reps', ROUND(AVG(el.reps_completed)::numeric, 0),
      'avg_sets', ROUND(AVG(el.sets_completed)::numeric, 0),
      'difficulty_distribution', jsonb_build_object(
        'easier', COUNT(*) FILTER (WHERE el.difficulty_vs_baseline = 'easier'),
        'as_expected', COUNT(*) FILTER (WHERE el.difficulty_vs_baseline = 'as_expected'),
        'harder', COUNT(*) FILTER (WHERE el.difficulty_vs_baseline = 'harder')
      ),
      'technique_distribution', jsonb_build_object(
        'excellent', COUNT(*) FILTER (WHERE el.technique_quality = 'excellent'),
        'good', COUNT(*) FILTER (WHERE el.technique_quality = 'good'),
        'fair', COUNT(*) FILTER (WHERE el.technique_quality = 'fair'),
        'poor', COUNT(*) FILTER (WHERE el.technique_quality = 'poor')
      ),
      'trend', CASE
        WHEN AVG(el.exercise_rpe) > 8.5 THEN 'too_hard'
        WHEN AVG(el.exercise_rpe) < 5.5 THEN 'too_easy'
        WHEN AVG(el.exercise_rpe) BETWEEN 6.5 AND 8.0 THEN 'optimal'
        ELSE 'acceptable'
      END,
      'last_weight_used', (
        SELECT el2.weight_used FROM exercise_logs el2
        JOIN workout_logs wl2 ON el2.workout_log_id = wl2.id
        WHERE wl2.user_id = p_user_id
          AND el2.exercise_name = el.exercise_name
        ORDER BY wl2.workout_date DESC LIMIT 1
      ),
      'weight_progression', (
        SELECT jsonb_agg(jsonb_build_object('date', wl3.workout_date, 'weight', el3.weight_used) ORDER BY wl3.workout_date)
        FROM exercise_logs el3
        JOIN workout_logs wl3 ON el3.workout_log_id = wl3.id
        WHERE wl3.user_id = p_user_id
          AND el3.exercise_name = el.exercise_name
          AND wl3.id IN (
            SELECT id FROM workout_logs WHERE user_id = p_user_id
            AND completed = true ORDER BY workout_date DESC LIMIT p_sessions_limit
          )
      )
    ) AS exercise_data
    FROM exercise_logs el
    JOIN workout_logs wl ON el.workout_log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wl.completed = true
      AND wl.exclude_from_progression IS NOT TRUE
      AND wl.id IN (
        SELECT id FROM workout_logs
        WHERE user_id = p_user_id AND completed = true
        ORDER BY workout_date DESC
        LIMIT p_sessions_limit
      )
    GROUP BY el.exercise_name, el.pattern
  ) sub;

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- ============================================================================
-- 4. RPC: Get session-level feedback summary for generator
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_session_feedback_summary(
  p_user_id UUID,
  p_sessions_limit INTEGER DEFAULT 4
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_sessions', COUNT(*),
    'avg_session_rpe', ROUND(AVG(session_rpe)::numeric, 1),
    'avg_completion_rate', ROUND(AVG(
      CASE WHEN total_exercises > 0
        THEN (exercises_completed::decimal / total_exercises) * 100
        ELSE 100
      END
    )::numeric, 1),
    'avg_duration_minutes', ROUND(AVG(session_duration_minutes)::numeric, 0),
    'avg_sleep_quality', ROUND(AVG(sleep_quality)::numeric, 1),
    'mood_distribution', jsonb_build_object(
      'energized', COUNT(*) FILTER (WHERE mood = 'energized'),
      'normal', COUNT(*) FILTER (WHERE mood = 'normal'),
      'tired', COUNT(*) FILTER (WHERE mood = 'tired'),
      'stressed', COUNT(*) FILTER (WHERE mood = 'stressed')
    ),
    'rpe_trend', CASE
      WHEN COUNT(*) < 2 THEN 'insufficient_data'
      WHEN (
        SELECT AVG(session_rpe) FROM (
          SELECT session_rpe FROM workout_logs
          WHERE user_id = p_user_id AND completed = true
          ORDER BY workout_date DESC LIMIT 2
        ) recent
      ) > (
        SELECT AVG(session_rpe) FROM workout_logs
        WHERE user_id = p_user_id AND completed = true
        ORDER BY workout_date DESC LIMIT p_sessions_limit
      ) + 0.5 THEN 'increasing'
      WHEN (
        SELECT AVG(session_rpe) FROM (
          SELECT session_rpe FROM workout_logs
          WHERE user_id = p_user_id AND completed = true
          ORDER BY workout_date DESC LIMIT 2
        ) recent
      ) < (
        SELECT AVG(session_rpe) FROM workout_logs
        WHERE user_id = p_user_id AND completed = true
        ORDER BY workout_date DESC LIMIT p_sessions_limit
      ) - 0.5 THEN 'decreasing'
      ELSE 'stable'
    END,
    'needs_deload', (
      AVG(session_rpe) > 8.5 AND COUNT(*) >= 3
    ),
    'sessions', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', workout_date,
        'rpe', session_rpe,
        'duration', session_duration_minutes,
        'completed_pct', CASE WHEN total_exercises > 0
          THEN ROUND((exercises_completed::decimal / total_exercises) * 100, 0)
          ELSE 100 END,
        'mood', mood,
        'sleep', sleep_quality
      ) ORDER BY workout_date DESC)
      FROM workout_logs
      WHERE user_id = p_user_id AND completed = true
      ORDER BY workout_date DESC
      LIMIT p_sessions_limit
    )
  )
  INTO result
  FROM workout_logs
  WHERE user_id = p_user_id
    AND completed = true
    AND exclude_from_progression IS NOT TRUE
    AND id IN (
      SELECT id FROM workout_logs
      WHERE user_id = p_user_id AND completed = true
      ORDER BY workout_date DESC
      LIMIT p_sessions_limit
    );

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$;

-- ============================================================================
-- 5. RPC: Get pending program adjustments for generator
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pending_adjustments_for_generation(
  p_user_id UUID,
  p_program_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'trigger_type', trigger_type,
    'avg_rpe_before', avg_rpe_before,
    'adjustment_type', adjustment_type,
    'volume_change_percent', volume_change_percent,
    'exercises_affected', exercises_affected,
    'trigger_date', trigger_date
  ) ORDER BY trigger_date DESC)
  INTO result
  FROM program_adjustments
  WHERE user_id = p_user_id
    AND applied = false
    AND (p_program_id IS NULL OR program_id = p_program_id);

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- ============================================================================
-- 6. RPC: Initialize volume profile with research defaults
-- ============================================================================

CREATE OR REPLACE FUNCTION public.initialize_volume_profile(
  p_user_id UUID,
  p_level TEXT DEFAULT 'beginner'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  muscle_groups TEXT[] := ARRAY[
    'chest', 'back', 'quads', 'hamstrings', 'shoulders',
    'biceps', 'triceps', 'core', 'glutes', 'calves'
  ];
  mg TEXT;
  mev_val DECIMAL;
  mav_val DECIMAL;
  mrv_val DECIMAL;
  current_val DECIMAL;
  inserted INTEGER := 0;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH mg IN ARRAY muscle_groups LOOP
    -- Research-based defaults (Israetel/RP guidelines)
    CASE mg
      WHEN 'chest' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 6 WHEN 'intermediate' THEN 8 ELSE 10 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 16 ELSE 20 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 16 WHEN 'intermediate' THEN 20 ELSE 24 END;
      WHEN 'back' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 8 WHEN 'intermediate' THEN 10 ELSE 12 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 14 WHEN 'intermediate' THEN 18 ELSE 22 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 18 WHEN 'intermediate' THEN 22 ELSE 26 END;
      WHEN 'quads' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 6 WHEN 'intermediate' THEN 8 ELSE 10 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 16 ELSE 20 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 16 WHEN 'intermediate' THEN 22 ELSE 26 END;
      WHEN 'hamstrings' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 4 WHEN 'intermediate' THEN 6 ELSE 8 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 10 WHEN 'intermediate' THEN 12 ELSE 16 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 14 WHEN 'intermediate' THEN 16 ELSE 20 END;
      WHEN 'shoulders' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 6 WHEN 'intermediate' THEN 8 ELSE 10 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 16 ELSE 20 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 16 WHEN 'intermediate' THEN 20 ELSE 24 END;
      WHEN 'biceps' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 4 WHEN 'intermediate' THEN 6 ELSE 8 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 10 WHEN 'intermediate' THEN 14 ELSE 18 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 14 WHEN 'intermediate' THEN 18 ELSE 22 END;
      WHEN 'triceps' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 4 WHEN 'intermediate' THEN 6 ELSE 8 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 10 WHEN 'intermediate' THEN 12 ELSE 16 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 16 ELSE 20 END;
      WHEN 'core' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 0 WHEN 'intermediate' THEN 0 ELSE 4 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 8 WHEN 'intermediate' THEN 12 ELSE 16 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 16 ELSE 20 END;
      WHEN 'glutes' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 0 WHEN 'intermediate' THEN 4 ELSE 6 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 8 WHEN 'intermediate' THEN 12 ELSE 16 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 18 ELSE 22 END;
      WHEN 'calves' THEN
        mev_val := CASE p_level WHEN 'beginner' THEN 4 WHEN 'intermediate' THEN 6 ELSE 8 END;
        mav_val := CASE p_level WHEN 'beginner' THEN 8 WHEN 'intermediate' THEN 12 ELSE 14 END;
        mrv_val := CASE p_level WHEN 'beginner' THEN 12 WHEN 'intermediate' THEN 14 ELSE 18 END;
      ELSE
        mev_val := 6; mav_val := 12; mrv_val := 18;
    END CASE;

    -- Start at MEV + 30% of range (conservative start)
    current_val := mev_val + (mav_val - mev_val) * 0.3;

    INSERT INTO public.user_volume_profile (user_id, muscle_group, mev, mav, mrv, current_volume, calibration_confidence)
    VALUES (p_user_id, mg, mev_val, mav_val, mrv_val, current_val, 'low')
    ON CONFLICT (user_id, muscle_group) DO NOTHING;

    inserted := inserted + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'muscle_groups_initialized', inserted);
END;
$$;

-- ============================================================================
-- 7. RPC: Update volume profile from workout feedback
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_volume_profile_from_feedback(
  p_user_id UUID,
  p_sessions_to_analyze INTEGER DEFAULT 4
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
  updates JSONB := '[]'::JSONB;
  new_trend TEXT;
  avg_rpe DECIMAL;
  sessions_count INTEGER;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- For each muscle group with exercise data
  FOR rec IN
    SELECT
      CASE
        WHEN el.pattern IN ('horizontal_push') THEN 'chest'
        WHEN el.pattern IN ('horizontal_pull', 'vertical_pull') THEN 'back'
        WHEN el.pattern IN ('lower_push') THEN 'quads'
        WHEN el.pattern IN ('lower_pull') THEN 'hamstrings'
        WHEN el.pattern IN ('vertical_push') THEN 'shoulders'
        WHEN el.pattern = 'core' THEN 'core'
        ELSE 'other'
      END AS muscle_group,
      ROUND(AVG(el.exercise_rpe)::numeric, 1) AS avg_rpe,
      ROUND(AVG(el.sets_completed)::numeric, 1) AS avg_sets,
      COUNT(DISTINCT wl.id) AS session_count,
      ROUND(AVG(el.reps_in_reserve)::numeric, 1) AS avg_rir
    FROM exercise_logs el
    JOIN workout_logs wl ON el.workout_log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wl.completed = true
      AND wl.exclude_from_progression IS NOT TRUE
      AND wl.id IN (
        SELECT id FROM workout_logs
        WHERE user_id = p_user_id AND completed = true
        ORDER BY workout_date DESC
        LIMIT p_sessions_to_analyze
      )
    GROUP BY
      CASE
        WHEN el.pattern IN ('horizontal_push') THEN 'chest'
        WHEN el.pattern IN ('horizontal_pull', 'vertical_pull') THEN 'back'
        WHEN el.pattern IN ('lower_push') THEN 'quads'
        WHEN el.pattern IN ('lower_pull') THEN 'hamstrings'
        WHEN el.pattern IN ('vertical_push') THEN 'shoulders'
        WHEN el.pattern = 'core' THEN 'core'
        ELSE 'other'
      END
    HAVING COUNT(DISTINCT wl.id) >= 2
  LOOP
    IF rec.muscle_group = 'other' THEN CONTINUE; END IF;

    -- Determine trend based on RPE
    IF rec.avg_rpe > 8.5 THEN
      new_trend := 'needs_deload';
    ELSIF rec.avg_rpe > 7.5 THEN
      new_trend := 'increasing'; -- approaching MRV
    ELSIF rec.avg_rpe < 5.5 THEN
      new_trend := 'decreasing'; -- below MEV stimulus
    ELSE
      new_trend := 'stable'; -- in productive range
    END IF;

    -- Update the volume profile
    UPDATE public.user_volume_profile
    SET
      avg_rpe_at_current_volume = rec.avg_rpe,
      volume_trend = new_trend,
      sessions_tracked = sessions_tracked + rec.session_count,
      calibration_confidence = CASE
        WHEN sessions_tracked + rec.session_count >= 12 THEN 'high'
        WHEN sessions_tracked + rec.session_count >= 6 THEN 'medium'
        ELSE 'low'
      END,
      -- Adjust MEV/MRV based on actual performance
      mev = CASE
        WHEN rec.avg_rpe < 5.0 AND rec.avg_sets < mev THEN GREATEST(mev - 1, 2)
        ELSE mev
      END,
      mrv = CASE
        WHEN rec.avg_rpe > 9.0 THEN GREATEST(mrv - 1, mav + 2)
        WHEN rec.avg_rpe < 6.5 AND calibration_confidence = 'high' THEN mrv + 1
        ELSE mrv
      END,
      last_calibrated_at = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id AND muscle_group = rec.muscle_group;

    updates := updates || jsonb_build_object(
      'muscle_group', rec.muscle_group,
      'avg_rpe', rec.avg_rpe,
      'trend', new_trend,
      'sessions_analyzed', rec.session_count
    );
  END LOOP;

  RETURN jsonb_build_object('success', true, 'updates', updates);
END;
$$;

-- ============================================================================
-- 8. RPC: Get volume profile for program generation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_volume_profile(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'muscle_group', muscle_group,
    'mev', mev,
    'mav', mav,
    'mrv', mrv,
    'current_volume', current_volume,
    'volume_trend', volume_trend,
    'avg_rpe_at_current_volume', avg_rpe_at_current_volume,
    'calibration_confidence', calibration_confidence,
    'sessions_tracked', sessions_tracked
  ))
  INTO result
  FROM public.user_volume_profile
  WHERE user_id = p_user_id;

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;
