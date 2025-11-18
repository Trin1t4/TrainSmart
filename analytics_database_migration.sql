-- ================================================================
-- ANALYTICS DATABASE SYSTEM - SUPABASE MIGRATION
-- ================================================================
-- Sistema di analytics separato per FitnessFlow
--
-- ARCHITECTURE:
-- - Schema separato 'analytics'
-- - Fact tables per eventi
-- - Dimension tables per lookup
-- - Aggregated tables per performance
-- - Materialized views per dashboards
-- - ETL functions per refresh daily
--
-- PRIORITIES:
-- 1. Business Metrics (conversions, revenue, engagement)
-- 2. User Analytics (registrations, retention, churn)
-- 3. Program Popularity (splits, goals, levels)
-- 4. Workout Analytics (volume, frequency)
-- 5. RPE Trends (fatica, recovery, adjustments)
-- ================================================================

-- ================================================================
-- 1. CREATE ANALYTICS SCHEMA
-- ================================================================
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA analytics TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA analytics TO authenticated;

-- ================================================================
-- 2. DIMENSION TABLES (Lookup tables)
-- ================================================================

-- Dimension: Users
CREATE TABLE IF NOT EXISTS analytics.dim_users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255),
  created_at TIMESTAMPTZ,
  first_program_created_at TIMESTAMPTZ,
  first_workout_logged_at TIMESTAMPTZ,
  total_programs_created INTEGER DEFAULT 0,
  total_workouts_logged INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ,
  -- Cohort info
  cohort_month VARCHAR(7), -- YYYY-MM
  cohort_week VARCHAR(8), -- YYYY-WW
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dimension: Date (for time-based analysis)
CREATE TABLE IF NOT EXISTS analytics.dim_date (
  date_id DATE PRIMARY KEY,
  year INTEGER,
  quarter INTEGER,
  month INTEGER,
  week INTEGER,
  day_of_week INTEGER,
  day_of_month INTEGER,
  day_of_year INTEGER,
  is_weekend BOOLEAN,
  month_name VARCHAR(20),
  day_name VARCHAR(20)
);

-- Dimension: Programs
CREATE TABLE IF NOT EXISTS analytics.dim_programs (
  program_id UUID PRIMARY KEY,
  user_id UUID,
  program_name VARCHAR(255),
  level VARCHAR(50),
  goal VARCHAR(50),
  location VARCHAR(50),
  split VARCHAR(100),
  frequency INTEGER,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

-- ================================================================
-- 3. FACT TABLES (Events/Transactions)
-- ================================================================

-- Fact: User Registrations
CREATE TABLE IF NOT EXISTS analytics.fact_user_registrations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  registration_date DATE NOT NULL,
  registration_timestamp TIMESTAMPTZ NOT NULL,
  source VARCHAR(100), -- 'organic', 'referral', 'social', etc.
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Onboarding Completions
CREATE TABLE IF NOT EXISTS analytics.fact_onboarding_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  completed_date DATE NOT NULL,
  completed_timestamp TIMESTAMPTZ NOT NULL,
  goal VARCHAR(50),
  training_location VARCHAR(50),
  training_type VARCHAR(50),
  frequency INTEGER,
  time_to_complete_minutes INTEGER, -- tempo per completare onboarding
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Screening Completions
CREATE TABLE IF NOT EXISTS analytics.fact_screening_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  completed_date DATE NOT NULL,
  completed_timestamp TIMESTAMPTZ NOT NULL,
  final_score DECIMAL(5,2),
  level VARCHAR(50),
  quiz_score INTEGER,
  practical_score DECIMAL(5,2),
  physical_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Program Creations
CREATE TABLE IF NOT EXISTS analytics.fact_program_creations (
  id SERIAL PRIMARY KEY,
  program_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_date DATE NOT NULL,
  created_timestamp TIMESTAMPTZ NOT NULL,
  level VARCHAR(50),
  goal VARCHAR(50),
  location VARCHAR(50),
  split VARCHAR(100),
  frequency INTEGER,
  total_exercises INTEGER,
  is_first_program BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Workouts
CREATE TABLE IF NOT EXISTS analytics.fact_workouts (
  id SERIAL PRIMARY KEY,
  workout_id UUID NOT NULL,
  user_id UUID NOT NULL,
  program_id UUID,
  workout_date DATE NOT NULL,
  workout_timestamp TIMESTAMPTZ NOT NULL,
  day_name VARCHAR(50),
  split_type VARCHAR(50),
  exercises_completed INTEGER,
  total_exercises INTEGER,
  completion_rate DECIMAL(5,2), -- % completamento
  session_rpe DECIMAL(3,1),
  session_duration_minutes INTEGER,
  mood VARCHAR(50),
  sleep_quality INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Exercises (granular)
CREATE TABLE IF NOT EXISTS analytics.fact_exercises (
  id SERIAL PRIMARY KEY,
  exercise_id UUID NOT NULL,
  workout_id UUID NOT NULL,
  user_id UUID NOT NULL,
  workout_date DATE NOT NULL,
  exercise_name VARCHAR(200),
  pattern VARCHAR(50),
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL(6,2),
  exercise_rpe DECIMAL(3,1),
  difficulty_vs_baseline VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fact: Program Adjustments (RPE-based)
CREATE TABLE IF NOT EXISTS analytics.fact_program_adjustments (
  id SERIAL PRIMARY KEY,
  adjustment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL,
  adjustment_date DATE NOT NULL,
  adjustment_timestamp TIMESTAMPTZ NOT NULL,
  trigger_type VARCHAR(50),
  avg_rpe_before DECIMAL(3,1),
  sessions_analyzed INTEGER,
  adjustment_type VARCHAR(50),
  volume_change_percent INTEGER,
  exercises_affected INTEGER,
  applied BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. AGGREGATED TABLES (Pre-computed metrics for performance)
-- ================================================================

-- Daily User Activity
CREATE TABLE IF NOT EXISTS analytics.agg_user_activity_daily (
  date_id DATE NOT NULL,
  user_id UUID NOT NULL,
  workouts_logged INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  total_volume INTEGER DEFAULT 0, -- sets * reps
  avg_rpe DECIMAL(3,1),
  active_minutes INTEGER DEFAULT 0,
  PRIMARY KEY (date_id, user_id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Workout Volume
CREATE TABLE IF NOT EXISTS analytics.agg_workout_volume_weekly (
  week_start_date DATE NOT NULL,
  user_id UUID NOT NULL,
  workouts_count INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  avg_rpe DECIMAL(3,1),
  avg_completion_rate DECIMAL(5,2),
  PRIMARY KEY (week_start_date, user_id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly RPE Trends
CREATE TABLE IF NOT EXISTS analytics.agg_rpe_trends_monthly (
  month_start_date DATE NOT NULL,
  user_id UUID NOT NULL,
  avg_session_rpe DECIMAL(3,1),
  avg_exercise_rpe DECIMAL(3,1),
  total_workouts INTEGER,
  high_rpe_sessions INTEGER, -- RPE > 8.5
  low_rpe_sessions INTEGER, -- RPE < 6
  adjustments_count INTEGER,
  PRIMARY KEY (month_start_date, user_id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Popularity (global stats)
CREATE TABLE IF NOT EXISTS analytics.agg_program_popularity (
  level VARCHAR(50),
  goal VARCHAR(50),
  location VARCHAR(50),
  split VARCHAR(100),
  total_programs INTEGER DEFAULT 0,
  active_programs INTEGER DEFAULT 0,
  avg_frequency DECIMAL(3,1),
  total_users INTEGER DEFAULT 0,
  PRIMARY KEY (level, goal, location, split),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Business Metrics
CREATE TABLE IF NOT EXISTS analytics.agg_business_metrics_daily (
  date_id DATE PRIMARY KEY,
  -- User metrics
  new_registrations INTEGER DEFAULT 0,
  onboarding_completions INTEGER DEFAULT 0,
  screening_completions INTEGER DEFAULT 0,
  program_creations INTEGER DEFAULT 0,
  -- Engagement metrics
  daily_active_users INTEGER DEFAULT 0,
  workouts_logged INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(5,1),
  -- Conversion funnel
  registration_to_onboarding_rate DECIMAL(5,2),
  onboarding_to_screening_rate DECIMAL(5,2),
  screening_to_program_rate DECIMAL(5,2),
  program_to_workout_rate DECIMAL(5,2),
  -- Retention
  returning_users INTEGER DEFAULT 0,
  churn_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 5. MATERIALIZED VIEWS (For complex analytics)
-- ================================================================

-- User Retention Cohorts
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_user_retention_cohorts AS
SELECT
  du.cohort_month,
  COUNT(DISTINCT du.user_id) as cohort_size,
  -- Week 0 (registration week)
  COUNT(DISTINCT CASE WHEN fw.workout_date >= du.created_at::DATE
    AND fw.workout_date < du.created_at::DATE + INTERVAL '7 days'
    THEN fw.user_id END) as week_0_active,
  -- Week 1
  COUNT(DISTINCT CASE WHEN fw.workout_date >= du.created_at::DATE + INTERVAL '7 days'
    AND fw.workout_date < du.created_at::DATE + INTERVAL '14 days'
    THEN fw.user_id END) as week_1_active,
  -- Week 2
  COUNT(DISTINCT CASE WHEN fw.workout_date >= du.created_at::DATE + INTERVAL '14 days'
    AND fw.workout_date < du.created_at::DATE + INTERVAL '21 days'
    THEN fw.user_id END) as week_2_active,
  -- Week 4
  COUNT(DISTINCT CASE WHEN fw.workout_date >= du.created_at::DATE + INTERVAL '28 days'
    AND fw.workout_date < du.created_at::DATE + INTERVAL '35 days'
    THEN fw.user_id END) as week_4_active
FROM analytics.dim_users du
LEFT JOIN analytics.fact_workouts fw ON du.user_id = fw.user_id
GROUP BY du.cohort_month
ORDER BY du.cohort_month DESC;

-- Workout Frequency Distribution
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_workout_frequency_stats AS
SELECT
  user_id,
  COUNT(*) as total_workouts,
  MIN(workout_date) as first_workout,
  MAX(workout_date) as last_workout,
  MAX(workout_date) - MIN(workout_date) as days_span,
  ROUND(COUNT(*)::NUMERIC / NULLIF((MAX(workout_date) - MIN(workout_date) + 1), 0), 2) as workouts_per_day,
  ROUND(COUNT(*)::NUMERIC * 7.0 / NULLIF((MAX(workout_date) - MIN(workout_date) + 1), 0), 1) as workouts_per_week,
  AVG(session_rpe) as avg_rpe,
  AVG(completion_rate) as avg_completion_rate
FROM analytics.fact_workouts
GROUP BY user_id;

-- RPE Distribution (Global)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_rpe_distribution AS
SELECT
  FLOOR(session_rpe) as rpe_bucket,
  COUNT(*) as workout_count,
  COUNT(DISTINCT user_id) as user_count,
  AVG(completion_rate) as avg_completion_rate,
  AVG(session_duration_minutes) as avg_duration
FROM analytics.fact_workouts
WHERE session_rpe IS NOT NULL
GROUP BY FLOOR(session_rpe)
ORDER BY rpe_bucket;

-- Conversion Funnel
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_conversion_funnel AS
WITH funnel AS (
  SELECT
    DATE_TRUNC('month', registration_date) as month,
    COUNT(DISTINCT r.user_id) as registrations,
    COUNT(DISTINCT o.user_id) as onboarding_completed,
    COUNT(DISTINCT s.user_id) as screening_completed,
    COUNT(DISTINCT p.user_id) as program_created,
    COUNT(DISTINCT w.user_id) as first_workout_logged
  FROM analytics.fact_user_registrations r
  LEFT JOIN analytics.fact_onboarding_completions o ON r.user_id = o.user_id
  LEFT JOIN analytics.fact_screening_completions s ON r.user_id = s.user_id
  LEFT JOIN analytics.fact_program_creations p ON r.user_id = p.user_id
  LEFT JOIN analytics.fact_workouts w ON r.user_id = w.user_id
  GROUP BY DATE_TRUNC('month', registration_date)
)
SELECT
  month,
  registrations,
  onboarding_completed,
  screening_completed,
  program_created,
  first_workout_logged,
  ROUND(100.0 * onboarding_completed / NULLIF(registrations, 0), 1) as onboarding_rate,
  ROUND(100.0 * screening_completed / NULLIF(onboarding_completed, 0), 1) as screening_rate,
  ROUND(100.0 * program_created / NULLIF(screening_completed, 0), 1) as program_rate,
  ROUND(100.0 * first_workout_logged / NULLIF(program_created, 0), 1) as activation_rate
FROM funnel
ORDER BY month DESC;

-- ================================================================
-- 6. ETL FUNCTIONS (Data transformation and loading)
-- ================================================================

-- Function: Refresh Dimension Users
CREATE OR REPLACE FUNCTION analytics.refresh_dim_users()
RETURNS void AS $$
BEGIN
  -- Truncate and reload
  TRUNCATE TABLE analytics.dim_users;

  INSERT INTO analytics.dim_users (
    user_id,
    email,
    created_at,
    first_program_created_at,
    first_workout_logged_at,
    total_programs_created,
    total_workouts_logged,
    is_active,
    last_activity_at,
    cohort_month,
    cohort_week,
    updated_at
  )
  SELECT
    u.id as user_id,
    u.email,
    u.created_at,
    (SELECT MIN(created_at) FROM public.training_programs WHERE user_id = u.id) as first_program_created_at,
    (SELECT MIN(workout_date) FROM public.workout_logs WHERE user_id = u.id AND completed = true) as first_workout_logged_at,
    (SELECT COUNT(*) FROM public.training_programs WHERE user_id = u.id) as total_programs_created,
    (SELECT COUNT(*) FROM public.workout_logs WHERE user_id = u.id AND completed = true) as total_workouts_logged,
    COALESCE((SELECT MAX(workout_date) FROM public.workout_logs WHERE user_id = u.id) >= CURRENT_DATE - INTERVAL '30 days', false) as is_active,
    GREATEST(
      u.created_at,
      COALESCE((SELECT MAX(created_at) FROM public.training_programs WHERE user_id = u.id), u.created_at),
      COALESCE((SELECT MAX(workout_date) FROM public.workout_logs WHERE user_id = u.id), u.created_at)
    ) as last_activity_at,
    TO_CHAR(u.created_at, 'YYYY-MM') as cohort_month,
    TO_CHAR(u.created_at, 'IYYY-IW') as cohort_week,
    NOW() as updated_at
  FROM auth.users u;

  RAISE NOTICE 'Refreshed dim_users: % rows', (SELECT COUNT(*) FROM analytics.dim_users);
END;
$$ LANGUAGE plpgsql;

-- Function: Populate Date Dimension (one-time, 10 years)
CREATE OR REPLACE FUNCTION analytics.populate_dim_date()
RETURNS void AS $$
DECLARE
  start_date DATE := '2024-01-01';
  end_date DATE := '2034-12-31';
  loop_date DATE;
BEGIN
  TRUNCATE TABLE analytics.dim_date;

  loop_date := start_date;
  WHILE loop_date <= end_date LOOP
    INSERT INTO analytics.dim_date VALUES (
      loop_date,
      EXTRACT(YEAR FROM loop_date)::INTEGER,
      EXTRACT(QUARTER FROM loop_date)::INTEGER,
      EXTRACT(MONTH FROM loop_date)::INTEGER,
      EXTRACT(WEEK FROM loop_date)::INTEGER,
      EXTRACT(DOW FROM loop_date)::INTEGER,
      EXTRACT(DAY FROM loop_date)::INTEGER,
      EXTRACT(DOY FROM loop_date)::INTEGER,
      EXTRACT(DOW FROM loop_date) IN (0, 6),
      TO_CHAR(loop_date, 'Month'),
      TO_CHAR(loop_date, 'Day')
    );
    loop_date := loop_date + INTERVAL '1 day';
  END LOOP;

  RAISE NOTICE 'Populated dim_date: % rows', (SELECT COUNT(*) FROM analytics.dim_date);
END;
$$ LANGUAGE plpgsql;

-- Function: Refresh Fact Tables (Incremental or Full)
CREATE OR REPLACE FUNCTION analytics.refresh_fact_tables(full_refresh BOOLEAN DEFAULT false)
RETURNS void AS $$
DECLARE
  cutoff_date DATE;
BEGIN
  IF full_refresh THEN
    cutoff_date := '2000-01-01';
    RAISE NOTICE 'Full refresh mode';
  ELSE
    cutoff_date := CURRENT_DATE - INTERVAL '7 days';
    RAISE NOTICE 'Incremental refresh from: %', cutoff_date;
  END IF;

  -- Fact: User Registrations
  DELETE FROM analytics.fact_user_registrations WHERE registration_date >= cutoff_date;
  INSERT INTO analytics.fact_user_registrations (user_id, registration_date, registration_timestamp, created_at)
  SELECT
    id,
    created_at::DATE,
    created_at,
    NOW()
  FROM auth.users
  WHERE created_at::DATE >= cutoff_date;

  -- Fact: Program Creations
  DELETE FROM analytics.fact_program_creations WHERE created_date >= cutoff_date;
  INSERT INTO analytics.fact_program_creations (
    program_id, user_id, created_date, created_timestamp, level, goal, location, split, frequency, total_exercises, created_at
  )
  SELECT
    id,
    user_id,
    created_at::DATE,
    created_at,
    level,
    goal,
    location,
    split,
    days_per_week,
    COALESCE(jsonb_array_length(exercises), 0),
    NOW()
  FROM public.training_programs
  WHERE created_at::DATE >= cutoff_date;

  -- Fact: Workouts
  DELETE FROM analytics.fact_workouts WHERE workout_date >= cutoff_date;
  INSERT INTO analytics.fact_workouts (
    workout_id, user_id, program_id, workout_date, workout_timestamp, day_name, split_type,
    exercises_completed, total_exercises, completion_rate, session_rpe, session_duration_minutes, mood, sleep_quality, created_at
  )
  SELECT
    id,
    user_id,
    program_id,
    workout_date::DATE,
    workout_date,
    day_name,
    split_type,
    exercises_completed,
    total_exercises,
    CASE WHEN total_exercises > 0 THEN ROUND(100.0 * exercises_completed / total_exercises, 2) ELSE 0 END,
    session_rpe,
    session_duration_minutes,
    mood,
    sleep_quality,
    NOW()
  FROM public.workout_logs
  WHERE workout_date::DATE >= cutoff_date AND completed = true;

  -- Fact: Exercises
  DELETE FROM analytics.fact_exercises
  WHERE workout_id IN (SELECT id FROM public.workout_logs WHERE workout_date::DATE >= cutoff_date);

  INSERT INTO analytics.fact_exercises (
    exercise_id, workout_id, user_id, workout_date, exercise_name, pattern,
    sets_completed, reps_completed, weight_used, exercise_rpe, difficulty_vs_baseline, created_at
  )
  SELECT
    el.id,
    el.workout_log_id,
    wl.user_id,
    wl.workout_date::DATE,
    el.exercise_name,
    el.pattern,
    el.sets_completed,
    el.reps_completed,
    el.weight_used,
    el.exercise_rpe,
    el.difficulty_vs_baseline,
    NOW()
  FROM public.exercise_logs el
  JOIN public.workout_logs wl ON el.workout_log_id = wl.id
  WHERE wl.workout_date::DATE >= cutoff_date;

  -- Fact: Program Adjustments
  DELETE FROM analytics.fact_program_adjustments WHERE adjustment_date >= cutoff_date;
  INSERT INTO analytics.fact_program_adjustments (
    adjustment_id, user_id, program_id, adjustment_date, adjustment_timestamp, trigger_type,
    avg_rpe_before, sessions_analyzed, adjustment_type, volume_change_percent,
    exercises_affected, applied, created_at
  )
  SELECT
    id,
    user_id,
    program_id,
    trigger_date::DATE,
    trigger_date,
    trigger_type,
    avg_rpe_before,
    sessions_analyzed,
    adjustment_type,
    volume_change_percent,
    jsonb_array_length(exercises_affected),
    applied,
    NOW()
  FROM public.program_adjustments
  WHERE trigger_date::DATE >= cutoff_date;

  RAISE NOTICE 'Fact tables refreshed';
END;
$$ LANGUAGE plpgsql;

-- Function: Refresh Aggregated Tables
CREATE OR REPLACE FUNCTION analytics.refresh_aggregated_tables()
RETURNS void AS $$
BEGIN
  -- Daily User Activity
  TRUNCATE TABLE analytics.agg_user_activity_daily;
  INSERT INTO analytics.agg_user_activity_daily (date_id, user_id, workouts_logged, exercises_completed, avg_rpe, updated_at)
  SELECT
    workout_date,
    user_id,
    COUNT(*) as workouts_logged,
    SUM(exercises_completed) as exercises_completed,
    AVG(session_rpe) as avg_rpe,
    NOW()
  FROM analytics.fact_workouts
  GROUP BY workout_date, user_id;

  -- Weekly Workout Volume
  TRUNCATE TABLE analytics.agg_workout_volume_weekly;
  INSERT INTO analytics.agg_workout_volume_weekly (
    week_start_date, user_id, workouts_count, total_exercises, total_sets, total_reps, avg_rpe, avg_completion_rate, updated_at
  )
  SELECT
    DATE_TRUNC('week', fe.workout_date)::DATE as week_start,
    fe.user_id,
    COUNT(DISTINCT fe.workout_id) as workouts_count,
    COUNT(*) as total_exercises,
    SUM(fe.sets_completed) as total_sets,
    SUM(fe.sets_completed * fe.reps_completed) as total_reps,
    AVG(fe.exercise_rpe) as avg_rpe,
    AVG(fw.completion_rate) as avg_completion_rate,
    NOW()
  FROM analytics.fact_exercises fe
  JOIN analytics.fact_workouts fw ON fe.workout_id = fw.workout_id
  GROUP BY DATE_TRUNC('week', fe.workout_date)::DATE, fe.user_id;

  -- Monthly RPE Trends
  TRUNCATE TABLE analytics.agg_rpe_trends_monthly;
  INSERT INTO analytics.agg_rpe_trends_monthly (
    month_start_date, user_id, avg_session_rpe, avg_exercise_rpe, total_workouts,
    high_rpe_sessions, low_rpe_sessions, adjustments_count, updated_at
  )
  SELECT
    fw_agg.month_start_date,
    fw_agg.user_id,
    fw_agg.avg_session_rpe,
    COALESCE(ex_agg.avg_exercise_rpe, 0),
    fw_agg.total_workouts,
    fw_agg.high_rpe_sessions,
    fw_agg.low_rpe_sessions,
    COALESCE(adj_agg.adjustments_count, 0),
    NOW()
  FROM (
    SELECT
      DATE_TRUNC('month', workout_date)::DATE as month_start_date,
      user_id,
      AVG(session_rpe) as avg_session_rpe,
      COUNT(*) as total_workouts,
      SUM(CASE WHEN session_rpe > 8.5 THEN 1 ELSE 0 END) as high_rpe_sessions,
      SUM(CASE WHEN session_rpe < 6.0 THEN 1 ELSE 0 END) as low_rpe_sessions
    FROM analytics.fact_workouts
    GROUP BY DATE_TRUNC('month', workout_date)::DATE, user_id
  ) fw_agg
  LEFT JOIN (
    SELECT
      DATE_TRUNC('month', workout_date)::DATE as month_start_date,
      user_id,
      AVG(exercise_rpe) as avg_exercise_rpe
    FROM analytics.fact_exercises
    GROUP BY DATE_TRUNC('month', workout_date)::DATE, user_id
  ) ex_agg ON fw_agg.month_start_date = ex_agg.month_start_date AND fw_agg.user_id = ex_agg.user_id
  LEFT JOIN (
    SELECT
      DATE_TRUNC('month', adjustment_date)::DATE as month_start_date,
      user_id,
      COUNT(*) as adjustments_count
    FROM analytics.fact_program_adjustments
    GROUP BY DATE_TRUNC('month', adjustment_date)::DATE, user_id
  ) adj_agg ON fw_agg.month_start_date = adj_agg.month_start_date AND fw_agg.user_id = adj_agg.user_id;

  -- Program Popularity
  TRUNCATE TABLE analytics.agg_program_popularity;
  INSERT INTO analytics.agg_program_popularity (level, goal, location, split, total_programs, active_programs, avg_frequency, total_users, updated_at)
  SELECT
    level,
    goal,
    location,
    split,
    COUNT(*) as total_programs,
    SUM(CASE WHEN (SELECT COUNT(*) FROM analytics.fact_workouts WHERE program_id = fp.program_id) > 0 THEN 1 ELSE 0 END) as active_programs,
    AVG(frequency) as avg_frequency,
    COUNT(DISTINCT user_id) as total_users,
    NOW()
  FROM analytics.fact_program_creations fp
  GROUP BY level, goal, location, split;

  -- Daily Business Metrics
  TRUNCATE TABLE analytics.agg_business_metrics_daily;
  INSERT INTO analytics.agg_business_metrics_daily (
    date_id, new_registrations, program_creations, daily_active_users, workouts_logged, updated_at
  )
  SELECT
    d.date_id,
    COALESCE((SELECT COUNT(*) FROM analytics.fact_user_registrations WHERE registration_date = d.date_id), 0),
    COALESCE((SELECT COUNT(*) FROM analytics.fact_program_creations WHERE created_date = d.date_id), 0),
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM analytics.fact_workouts WHERE workout_date = d.date_id), 0),
    COALESCE((SELECT COUNT(*) FROM analytics.fact_workouts WHERE workout_date = d.date_id), 0),
    NOW()
  FROM analytics.dim_date d
  WHERE d.date_id >= CURRENT_DATE - INTERVAL '90 days' AND d.date_id <= CURRENT_DATE;

  RAISE NOTICE 'Aggregated tables refreshed';
END;
$$ LANGUAGE plpgsql;

-- Function: Refresh Materialized Views
CREATE OR REPLACE FUNCTION analytics.refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW analytics.mv_user_retention_cohorts;
  REFRESH MATERIALIZED VIEW analytics.mv_workout_frequency_stats;
  REFRESH MATERIALIZED VIEW analytics.mv_rpe_distribution;
  REFRESH MATERIALIZED VIEW analytics.mv_conversion_funnel;

  RAISE NOTICE 'Materialized views refreshed';
END;
$$ LANGUAGE plpgsql;

-- Master ETL Function (Run Daily)
CREATE OR REPLACE FUNCTION analytics.daily_etl_refresh()
RETURNS void AS $$
BEGIN
  RAISE NOTICE '=== Starting Daily Analytics ETL ===';

  -- Step 1: Refresh dimensions
  PERFORM analytics.refresh_dim_users();

  -- Step 2: Refresh fact tables (incremental)
  PERFORM analytics.refresh_fact_tables(false);

  -- Step 3: Refresh aggregated tables
  PERFORM analytics.refresh_aggregated_tables();

  -- Step 4: Refresh materialized views
  PERFORM analytics.refresh_materialized_views();

  RAISE NOTICE '=== Daily Analytics ETL Complete ===';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 7. INDEXES (Performance Optimization)
-- ================================================================

-- Fact tables
CREATE INDEX IF NOT EXISTS idx_fact_workouts_user_date ON analytics.fact_workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_workouts_program ON analytics.fact_workouts(program_id);
CREATE INDEX IF NOT EXISTS idx_fact_exercises_user_date ON analytics.fact_exercises(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_exercises_workout ON analytics.fact_exercises(workout_id);

-- Aggregated tables
CREATE INDEX IF NOT EXISTS idx_agg_user_activity_date ON analytics.agg_user_activity_daily(date_id DESC);
CREATE INDEX IF NOT EXISTS idx_agg_workout_volume_week ON analytics.agg_workout_volume_weekly(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_agg_business_metrics_date ON analytics.agg_business_metrics_daily(date_id DESC);

-- ================================================================
-- 8. INITIAL DATA LOAD
-- ================================================================

-- Populate date dimension (one-time)
SELECT analytics.populate_dim_date();

-- Initial full refresh
SELECT analytics.refresh_dim_users();
SELECT analytics.refresh_fact_tables(true); -- Full refresh
SELECT analytics.refresh_aggregated_tables();
SELECT analytics.refresh_materialized_views();

-- ================================================================
-- 9. SETUP CRON JOB (Daily Refresh at 00:00 UTC)
-- ================================================================
-- NOTE: Requires pg_cron extension
-- Enable in Supabase: Database → Extensions → Enable pg_cron

-- Schedule daily ETL at midnight
-- SELECT cron.schedule(
--   'daily-analytics-etl',
--   '0 0 * * *', -- Every day at 00:00 UTC
--   'SELECT analytics.daily_etl_refresh();'
-- );

-- Manual trigger (for testing):
-- SELECT analytics.daily_etl_refresh();

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check row counts
DO $$
DECLARE
  table_name TEXT;
  row_count BIGINT;
BEGIN
  RAISE NOTICE '=== Analytics Database Row Counts ===';

  FOR table_name IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'analytics' ORDER BY tablename
  LOOP
    EXECUTE 'SELECT COUNT(*) FROM analytics.' || table_name INTO row_count;
    RAISE NOTICE '% : % rows', RPAD(table_name, 40), row_count;
  END LOOP;
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics Database Migration Complete!';
  RAISE NOTICE 'Schema: analytics';
  RAISE NOTICE 'Dimension Tables: 3';
  RAISE NOTICE 'Fact Tables: 7';
  RAISE NOTICE 'Aggregated Tables: 5';
  RAISE NOTICE 'Materialized Views: 4';
  RAISE NOTICE 'ETL Functions: 6';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Enable pg_cron extension in Supabase';
  RAISE NOTICE '2. Schedule daily ETL job';
  RAISE NOTICE '3. Build analytics dashboards';
END $$;
