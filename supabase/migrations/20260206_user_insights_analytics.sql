-- ================================================================
-- USER INSIGHTS ANALYTICS - Dashboard Click Tracking + Demographics
-- ================================================================
-- Aggiunge:
-- 1. Tabella fact_dashboard_clicks per tracciare le azioni nella dashboard utente
-- 2. RPC get_user_demographics_admin() - profilo demografico degli iscritti
-- 3. RPC get_onboarding_insights_admin() - tempi e completion onboarding
-- 4. RPC get_dashboard_clicks_admin() - engagement nella dashboard
-- ================================================================

-- ================================================================
-- 1. CLICK TRACKING TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS analytics.fact_dashboard_clicks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  click_target VARCHAR(50) NOT NULL,
  click_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_clicks_target
  ON analytics.fact_dashboard_clicks(click_target);
CREATE INDEX IF NOT EXISTS idx_dashboard_clicks_timestamp
  ON analytics.fact_dashboard_clicks(click_timestamp);
CREATE INDEX IF NOT EXISTS idx_dashboard_clicks_user
  ON analytics.fact_dashboard_clicks(user_id);

-- RLS: utenti possono solo inserire i propri click
ALTER TABLE analytics.fact_dashboard_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own clicks"
  ON analytics.fact_dashboard_clicks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all clicks"
  ON analytics.fact_dashboard_clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- 1b. INSERT CLICK RPC (per client-side tracking)
-- ================================================================

CREATE OR REPLACE FUNCTION track_dashboard_click(target VARCHAR)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics.fact_dashboard_clicks (user_id, click_target, click_timestamp)
  VALUES (auth.uid(), target, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_dashboard_click(VARCHAR) TO authenticated;

-- ================================================================
-- 2. USER DEMOGRAPHICS RPC
-- ================================================================

CREATE OR REPLACE FUNCTION get_user_demographics_admin()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM user_profiles WHERE onboarding_completed = true),

    'genderDistribution', COALESCE((
      SELECT json_agg(row_to_json(g))
      FROM (
        SELECT
          COALESCE(onboarding_data->'personalInfo'->>'gender', 'N/A') AS gender,
          COUNT(*) AS count
        FROM user_profiles
        WHERE onboarding_completed = true
        GROUP BY onboarding_data->'personalInfo'->>'gender'
        ORDER BY count DESC
      ) g
    ), '[]'::json),

    'ageDistribution', COALESCE((
      SELECT json_agg(row_to_json(a))
      FROM (
        SELECT
          CASE
            WHEN age BETWEEN 14 AND 24 THEN '14-24'
            WHEN age BETWEEN 25 AND 34 THEN '25-34'
            WHEN age BETWEEN 35 AND 44 THEN '35-44'
            WHEN age BETWEEN 45 AND 54 THEN '45-54'
            WHEN age >= 55 THEN '55+'
            ELSE 'N/A'
          END AS age_range,
          COUNT(*) AS count
        FROM (
          SELECT
            (onboarding_data->'personalInfo'->>'age')::int AS age
          FROM user_profiles
          WHERE onboarding_completed = true
            AND onboarding_data->'personalInfo'->>'age' IS NOT NULL
        ) ages
        GROUP BY age_range
        ORDER BY age_range
      ) a
    ), '[]'::json),

    'goalDistribution', COALESCE((
      SELECT json_agg(row_to_json(gl))
      FROM (
        SELECT
          COALESCE(onboarding_data->>'goal', 'N/A') AS goal,
          COUNT(*) AS count
        FROM user_profiles
        WHERE onboarding_completed = true
        GROUP BY onboarding_data->>'goal'
        ORDER BY count DESC
      ) gl
    ), '[]'::json),

    'locationDistribution', COALESCE((
      SELECT json_agg(row_to_json(l))
      FROM (
        SELECT
          COALESCE(onboarding_data->>'trainingLocation', 'N/A') AS location,
          COUNT(*) AS count
        FROM user_profiles
        WHERE onboarding_completed = true
        GROUP BY onboarding_data->>'trainingLocation'
        ORDER BY count DESC
      ) l
    ), '[]'::json),

    'frequencyDistribution', COALESCE((
      SELECT json_agg(row_to_json(f))
      FROM (
        SELECT
          COALESCE((onboarding_data->'activityLevel'->>'weeklyFrequency'), 'N/A') AS frequency,
          COUNT(*) AS count
        FROM user_profiles
        WHERE onboarding_completed = true
        GROUP BY onboarding_data->'activityLevel'->>'weeklyFrequency'
        ORDER BY frequency
      ) f
    ), '[]'::json)

  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. ONBOARDING INSIGHTS RPC
-- ================================================================

CREATE OR REPLACE FUNCTION get_onboarding_insights_admin()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'totalCompleted', (
      SELECT COUNT(*) FROM user_profiles WHERE onboarding_completed = true
    ),
    'totalStarted', (
      SELECT COUNT(*) FROM user_profiles
    ),
    'completionRate', (
      SELECT
        CASE WHEN COUNT(*) > 0
          THEN ROUND(COUNT(*) FILTER (WHERE onboarding_completed = true) * 100.0 / COUNT(*), 1)
          ELSE 0
        END
      FROM user_profiles
    ),

    'avgTimeMinutes', COALESCE((
      SELECT ROUND(AVG(time_to_complete_minutes)::numeric, 1)
      FROM analytics.fact_onboarding_completions
      WHERE time_to_complete_minutes IS NOT NULL
        AND time_to_complete_minutes > 0
    ), 0),

    'timeDistribution', COALESCE((
      SELECT json_agg(row_to_json(td))
      FROM (
        SELECT
          CASE
            WHEN time_to_complete_minutes < 1 THEN '<1 min'
            WHEN time_to_complete_minutes BETWEEN 1 AND 2 THEN '1-2 min'
            WHEN time_to_complete_minutes BETWEEN 2 AND 5 THEN '2-5 min'
            WHEN time_to_complete_minutes BETWEEN 5 AND 10 THEN '5-10 min'
            WHEN time_to_complete_minutes > 10 THEN '>10 min'
            ELSE 'N/A'
          END AS time_bucket,
          COUNT(*) AS count
        FROM analytics.fact_onboarding_completions
        WHERE time_to_complete_minutes IS NOT NULL
          AND time_to_complete_minutes > 0
        GROUP BY time_bucket
        ORDER BY MIN(time_to_complete_minutes)
      ) td
    ), '[]'::json),

    'recentCompletions', COALESCE((
      SELECT json_agg(row_to_json(rc))
      FROM (
        SELECT
          completed_date,
          COUNT(*) AS completions,
          ROUND(AVG(time_to_complete_minutes)::numeric, 1) AS avg_time
        FROM analytics.fact_onboarding_completions
        WHERE completed_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY completed_date
        ORDER BY completed_date ASC
      ) rc
    ), '[]'::json)

  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. DASHBOARD CLICKS RPC
-- ================================================================

CREATE OR REPLACE FUNCTION get_dashboard_clicks_admin(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'totalClicks', (
      SELECT COUNT(*)
      FROM analytics.fact_dashboard_clicks
      WHERE click_timestamp >= NOW() - (days_back || ' days')::INTERVAL
    ),

    'uniqueUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM analytics.fact_dashboard_clicks
      WHERE click_timestamp >= NOW() - (days_back || ' days')::INTERVAL
    ),

    'clicksByTarget', COALESCE((
      SELECT json_agg(row_to_json(ct))
      FROM (
        SELECT
          click_target,
          COUNT(*) AS clicks,
          COUNT(DISTINCT user_id) AS unique_users
        FROM analytics.fact_dashboard_clicks
        WHERE click_timestamp >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY click_target
        ORDER BY clicks DESC
      ) ct
    ), '[]'::json),

    'dailyTrend', COALESCE((
      SELECT json_agg(row_to_json(dt))
      FROM (
        SELECT
          click_timestamp::date AS date,
          COUNT(*) AS clicks,
          COUNT(DISTINCT user_id) AS unique_users
        FROM analytics.fact_dashboard_clicks
        WHERE click_timestamp >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY click_timestamp::date
        ORDER BY date ASC
      ) dt
    ), '[]'::json)

  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. GRANT PERMISSIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION get_user_demographics_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_onboarding_insights_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_clicks_admin(INTEGER) TO authenticated;

-- ================================================================
-- SUCCESS
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '== User Insights Analytics Migration Complete ==';
  RAISE NOTICE 'Created: analytics.fact_dashboard_clicks table';
  RAISE NOTICE 'Created: get_user_demographics_admin() RPC';
  RAISE NOTICE 'Created: get_onboarding_insights_admin() RPC';
  RAISE NOTICE 'Created: get_dashboard_clicks_admin() RPC';
END $$;
