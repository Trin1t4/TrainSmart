-- ================================================================
-- ADMIN RPC FUNCTIONS - ANALYTICS API
-- ================================================================
-- Funzioni server-side per esporre dati analytics agli admin
-- tramite API Supabase senza esporre direttamente lo schema analytics.
--
-- SECURITY: Tutte le funzioni controllano che l'utente sia admin
-- PERFORMANCE: Query ottimizzate server-side
-- MAINTAINABILITY: API stabile anche se cambia struttura interna
-- ================================================================

-- ================================================================
-- 1. BUSINESS METRICS
-- ================================================================

CREATE OR REPLACE FUNCTION get_business_metrics_admin(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date_id DATE,
  new_registrations INTEGER,
  onboarding_completions INTEGER,
  screening_completions INTEGER,
  program_creations INTEGER,
  daily_active_users INTEGER,
  workouts_logged INTEGER,
  avg_session_duration_minutes NUMERIC,
  registration_to_onboarding_rate NUMERIC,
  onboarding_to_screening_rate NUMERIC,
  screening_to_program_rate NUMERIC,
  program_to_workout_rate NUMERIC,
  returning_users INTEGER,
  churn_count INTEGER
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return business metrics
  RETURN QUERY
  SELECT
    abm.date_id,
    abm.new_registrations,
    abm.onboarding_completions,
    abm.screening_completions,
    abm.program_creations,
    abm.daily_active_users,
    abm.workouts_logged,
    abm.avg_session_duration_minutes,
    abm.registration_to_onboarding_rate,
    abm.onboarding_to_screening_rate,
    abm.screening_to_program_rate,
    abm.program_to_workout_rate,
    abm.returning_users,
    abm.churn_count
  FROM analytics.agg_business_metrics_daily abm
  WHERE abm.date_id >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  ORDER BY abm.date_id ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. AGGREGATED METRICS
-- ================================================================

CREATE OR REPLACE FUNCTION get_aggregated_metrics_admin()
RETURNS JSON AS $$
DECLARE
  total_users INTEGER;
  active_users INTEGER;
  total_programs INTEGER;
  total_workouts INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Count users
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_active)
  INTO total_users, active_users
  FROM analytics.dim_users;

  -- Count programs
  SELECT COUNT(*)
  INTO total_programs
  FROM analytics.fact_program_creations;

  -- Count workouts
  SELECT COUNT(*)
  INTO total_workouts
  FROM analytics.fact_workouts;

  -- Return as JSON
  RETURN json_build_object(
    'totalUsers', total_users,
    'activeUsers', active_users,
    'totalPrograms', total_programs,
    'totalWorkouts', total_workouts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. USER ANALYTICS
-- ================================================================

CREATE OR REPLACE FUNCTION get_users_analytics_admin(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  created_at TIMESTAMPTZ,
  total_programs_created INTEGER,
  total_workouts_logged INTEGER,
  is_active BOOLEAN,
  last_activity_at TIMESTAMPTZ,
  cohort_month VARCHAR
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return user analytics
  RETURN QUERY
  SELECT
    du.user_id,
    du.email,
    du.created_at,
    du.total_programs_created,
    du.total_workouts_logged,
    du.is_active,
    du.last_activity_at,
    du.cohort_month
  FROM analytics.dim_users du
  ORDER BY du.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. RPE TRENDS
-- ================================================================

CREATE OR REPLACE FUNCTION get_rpe_trends_admin(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month_start_date DATE,
  user_id UUID,
  avg_session_rpe NUMERIC,
  avg_exercise_rpe NUMERIC,
  total_workouts INTEGER,
  high_rpe_sessions INTEGER,
  low_rpe_sessions INTEGER,
  adjustments_count INTEGER
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return RPE trends
  RETURN QUERY
  SELECT
    art.month_start_date,
    art.user_id,
    art.avg_session_rpe,
    art.avg_exercise_rpe,
    art.total_workouts,
    art.high_rpe_sessions,
    art.low_rpe_sessions,
    art.adjustments_count
  FROM analytics.agg_rpe_trends_monthly art
  WHERE art.month_start_date >= CURRENT_DATE - (months_back || ' months')::INTERVAL
  ORDER BY art.month_start_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. PROGRAM POPULARITY
-- ================================================================

CREATE OR REPLACE FUNCTION get_program_popularity_admin()
RETURNS TABLE (
  level VARCHAR,
  goal VARCHAR,
  location VARCHAR,
  split VARCHAR,
  total_programs INTEGER,
  active_programs INTEGER,
  avg_frequency NUMERIC,
  total_users INTEGER
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return program popularity
  RETURN QUERY
  SELECT
    app.level,
    app.goal,
    app.location,
    app.split,
    app.total_programs,
    app.active_programs,
    app.avg_frequency,
    app.total_users
  FROM analytics.agg_program_popularity app
  ORDER BY app.total_programs DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 6. DASHBOARD DATA (ALL-IN-ONE)
-- ================================================================

CREATE OR REPLACE FUNCTION get_admin_dashboard_data()
RETURNS JSON AS $$
DECLARE
  business_metrics JSON;
  aggregated_metrics JSON;
  recent_users JSON;
  program_popularity JSON;
  rpe_trends JSON;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Get business metrics (last 30 days)
  SELECT json_agg(row_to_json(t))
  INTO business_metrics
  FROM (
    SELECT * FROM get_business_metrics_admin(30)
  ) t;

  -- Get aggregated metrics
  aggregated_metrics := get_aggregated_metrics_admin();

  -- Get recent users
  SELECT json_agg(row_to_json(t))
  INTO recent_users
  FROM (
    SELECT * FROM get_users_analytics_admin(20)
  ) t;

  -- Get program popularity
  SELECT json_agg(row_to_json(t))
  INTO program_popularity
  FROM (
    SELECT * FROM get_program_popularity_admin()
  ) t;

  -- Get RPE trends
  SELECT json_agg(row_to_json(t))
  INTO rpe_trends
  FROM (
    SELECT * FROM get_rpe_trends_admin(6)
  ) t;

  -- Return combined data
  RETURN json_build_object(
    'businessMetrics', COALESCE(business_metrics, '[]'::json),
    'aggregatedMetrics', aggregated_metrics,
    'recentUsers', COALESCE(recent_users, '[]'::json),
    'programPopularity', COALESCE(program_popularity, '[]'::json),
    'rpeTrends', COALESCE(rpe_trends, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. GRANT EXECUTE PERMISSIONS
-- ================================================================

-- Grant execute on all functions to authenticated users
-- (functions check admin role internally)
GRANT EXECUTE ON FUNCTION get_business_metrics_admin(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_aggregated_metrics_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_analytics_admin(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rpe_trends_admin(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_program_popularity_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_data() TO authenticated;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Admin RPC Functions Migration Complete!';
  RAISE NOTICE 'Created 6 RPC functions:';
  RAISE NOTICE '  - get_business_metrics_admin(days_back)';
  RAISE NOTICE '  - get_aggregated_metrics_admin()';
  RAISE NOTICE '  - get_users_analytics_admin(limit_count)';
  RAISE NOTICE '  - get_rpe_trends_admin(months_back)';
  RAISE NOTICE '  - get_program_popularity_admin()';
  RAISE NOTICE '  - get_admin_dashboard_data() [ALL-IN-ONE]';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security: All functions check admin role';
  RAISE NOTICE '⚡ Performance: Server-side optimized queries';
  RAISE NOTICE '📊 API: Stable interface, flexible implementation';
END $$;
