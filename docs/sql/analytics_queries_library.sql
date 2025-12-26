-- ================================================================
-- ANALYTICS QUERIES LIBRARY
-- ================================================================
-- Pre-built queries per dashboard analytics TrainSmart
-- Organizzate per priorità
--
-- PRIORITIES:
-- 1. Business Metrics (conversions, revenue, engagement)
-- 2. User Analytics (registrations, retention, churn)
-- 3. Program Popularity (splits, goals, levels)
-- 4. Workout Analytics (volume, frequency)
-- 5. RPE Trends (fatica, recovery, adjustments)
-- ================================================================

-- ================================================================
-- PRIORITY 1: BUSINESS METRICS
-- ================================================================

-- [1.1] Daily Business Metrics (Last 30 Days)
SELECT
  date_id as date,
  new_registrations,
  program_creations,
  daily_active_users as dau,
  workouts_logged,
  ROUND(100.0 * daily_active_users / NULLIF(new_registrations, 0), 1) as activation_rate
FROM analytics.agg_business_metrics_daily
WHERE date_id >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date_id DESC;

-- [1.2] Conversion Funnel (Current Month)
SELECT
  'Registration' as step,
  1 as step_number,
  registrations as users,
  100.0 as conversion_rate
FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
UNION ALL
SELECT
  'Onboarding',
  2,
  onboarding_completed,
  onboarding_rate
FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
UNION ALL
SELECT
  'Screening',
  3,
  screening_completed,
  screening_rate
FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
UNION ALL
SELECT
  'Program Created',
  4,
  program_created,
  program_rate
FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
UNION ALL
SELECT
  'First Workout',
  5,
  first_workout_logged,
  activation_rate
FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY step_number;

-- [1.3] Monthly Recurring Activity (MRR Proxy)
SELECT
  DATE_TRUNC('month', workout_date)::DATE as month,
  COUNT(DISTINCT user_id) as monthly_active_users,
  COUNT(*) as total_workouts,
  ROUND(AVG(exercises_completed), 1) as avg_exercises_per_workout,
  ROUND(AVG(session_rpe), 1) as avg_rpe
FROM analytics.fact_workouts
WHERE workout_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', workout_date)
ORDER BY month DESC;

-- [1.4] Week-over-Week Growth
WITH weekly_stats AS (
  SELECT
    DATE_TRUNC('week', workout_date)::DATE as week,
    COUNT(DISTINCT user_id) as weekly_active_users,
    COUNT(*) as workouts
  FROM analytics.fact_workouts
  WHERE workout_date >= CURRENT_DATE - INTERVAL '8 weeks'
  GROUP BY DATE_TRUNC('week', workout_date)
)
SELECT
  week,
  weekly_active_users as wau,
  workouts,
  LAG(weekly_active_users) OVER (ORDER BY week) as prev_week_wau,
  ROUND(100.0 * (weekly_active_users - LAG(weekly_active_users) OVER (ORDER BY week)) /
    NULLIF(LAG(weekly_active_users) OVER (ORDER BY week), 0), 1) as wau_growth_percent,
  ROUND(100.0 * (workouts - LAG(workouts) OVER (ORDER BY week)) /
    NULLIF(LAG(workouts) OVER (ORDER BY week), 0), 1) as workout_growth_percent
FROM weekly_stats
ORDER BY week DESC;

-- [1.5] User Engagement Score (Composite Metric)
SELECT
  user_id,
  total_workouts_logged as workouts,
  total_programs_created as programs,
  CASE
    WHEN last_activity_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'Highly Active'
    WHEN last_activity_at >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
    WHEN last_activity_at >= CURRENT_DATE - INTERVAL '90 days' THEN 'At Risk'
    ELSE 'Churned'
  END as engagement_status,
  last_activity_at,
  -- Engagement Score (0-100)
  LEAST(100, (
    (CASE WHEN total_workouts_logged > 0 THEN 40 ELSE 0 END) +
    (CASE WHEN total_programs_created > 0 THEN 20 ELSE 0 END) +
    (CASE WHEN last_activity_at >= CURRENT_DATE - INTERVAL '7 days' THEN 40 ELSE 0 END)
  )) as engagement_score
FROM analytics.dim_users
ORDER BY engagement_score DESC, last_activity_at DESC
LIMIT 100;

-- [1.6] Revenue Potential Score (Future: For Premium Features)
-- Placeholder: Basato su engagement + usage
SELECT
  user_id,
  total_workouts_logged,
  total_programs_created,
  EXTRACT(DAY FROM CURRENT_DATE - created_at) as days_since_registration,
  CASE
    WHEN total_workouts_logged >= 20 AND total_programs_created >= 2 THEN 'High Potential'
    WHEN total_workouts_logged >= 10 THEN 'Medium Potential'
    ELSE 'Low Potential'
  END as revenue_potential
FROM analytics.dim_users
WHERE is_active = true
ORDER BY total_workouts_logged DESC, total_programs_created DESC
LIMIT 50;

-- ================================================================
-- PRIORITY 2: USER ANALYTICS
-- ================================================================

-- [2.1] User Retention by Cohort (Week-over-Week)
SELECT
  cohort_month,
  cohort_size,
  week_0_active,
  week_1_active,
  week_2_active,
  week_4_active,
  ROUND(100.0 * week_0_active / cohort_size, 1) as week_0_retention,
  ROUND(100.0 * week_1_active / cohort_size, 1) as week_1_retention,
  ROUND(100.0 * week_2_active / cohort_size, 1) as week_2_retention,
  ROUND(100.0 * week_4_active / cohort_size, 1) as week_4_retention
FROM analytics.mv_user_retention_cohorts
WHERE cohort_month >= TO_CHAR(CURRENT_DATE - INTERVAL '6 months', 'YYYY-MM')
ORDER BY cohort_month DESC;

-- [2.2] New User Registrations Trend (Daily, Last 30 Days)
SELECT
  registration_date as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY registration_date) as cumulative_users
FROM analytics.fact_user_registrations
WHERE registration_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY registration_date
ORDER BY registration_date DESC;

-- [2.3] Churn Analysis (Users with no activity in 30+ days)
SELECT
  DATE_TRUNC('week', last_activity_at)::DATE as last_active_week,
  COUNT(*) as churned_users,
  ROUND(AVG(total_workouts_logged), 1) as avg_workouts_before_churn,
  ROUND(AVG(EXTRACT(DAY FROM last_activity_at - created_at)), 1) as avg_lifetime_days
FROM analytics.dim_users
WHERE last_activity_at < CURRENT_DATE - INTERVAL '30 days'
  AND last_activity_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', last_activity_at)
ORDER BY last_active_week DESC;

-- [2.4] User Lifetime Value (Proxy: Workout Count)
SELECT
  user_id,
  email,
  created_at::DATE as registration_date,
  total_workouts_logged as ltv_workouts,
  total_programs_created as ltv_programs,
  EXTRACT(DAY FROM CURRENT_DATE - created_at) as lifetime_days,
  ROUND(total_workouts_logged::NUMERIC / NULLIF(EXTRACT(DAY FROM CURRENT_DATE - created_at), 0), 2) as workouts_per_day,
  is_active,
  last_activity_at::DATE
FROM analytics.dim_users
WHERE total_workouts_logged > 0
ORDER BY total_workouts_logged DESC
LIMIT 100;

-- [2.5] Power Users (Top 10% Most Active)
WITH user_percentile AS (
  SELECT
    user_id,
    total_workouts_logged,
    NTILE(10) OVER (ORDER BY total_workouts_logged DESC) as percentile
  FROM analytics.dim_users
  WHERE total_workouts_logged > 0
)
SELECT
  du.user_id,
  du.email,
  du.total_workouts_logged,
  du.total_programs_created,
  du.last_activity_at::DATE,
  CASE WHEN du.is_active THEN 'Active' ELSE 'Inactive' END as status
FROM user_percentile up
JOIN analytics.dim_users du ON up.user_id = du.user_id
WHERE up.percentile = 1 -- Top 10%
ORDER BY du.total_workouts_logged DESC;

-- ================================================================
-- PRIORITY 3: PROGRAM POPULARITY
-- ================================================================

-- [3.1] Most Popular Programs (By Combination)
SELECT
  level,
  goal,
  location,
  split,
  total_programs,
  active_programs,
  total_users,
  ROUND(avg_frequency, 1) as avg_frequency,
  ROUND(100.0 * active_programs / NULLIF(total_programs, 0), 1) as activation_rate
FROM analytics.agg_program_popularity
ORDER BY total_programs DESC
LIMIT 20;

-- [3.2] Program Popularity by Goal
SELECT
  goal,
  COUNT(*) as programs_created,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(frequency), 1) as avg_frequency,
  COUNT(DISTINCT CASE WHEN (
    SELECT COUNT(*) FROM analytics.fact_workouts
    WHERE program_id = fp.program_id
  ) > 0 THEN fp.program_id END) as programs_with_workouts,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN (
    SELECT COUNT(*) FROM analytics.fact_workouts
    WHERE program_id = fp.program_id
  ) > 0 THEN fp.program_id END) / COUNT(*), 1) as usage_rate
FROM analytics.fact_program_creations fp
GROUP BY goal
ORDER BY programs_created DESC;

-- [3.3] Program Popularity by Level
SELECT
  level,
  COUNT(*) as programs_created,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(total_exercises), 1) as avg_exercises,
  ROUND(AVG(frequency), 1) as avg_frequency
FROM analytics.fact_program_creations
GROUP BY level
ORDER BY
  CASE level
    WHEN 'beginner' THEN 1
    WHEN 'intermediate' THEN 2
    WHEN 'advanced' THEN 3
  END;

-- [3.4] Program Popularity by Split Type
SELECT
  split,
  COUNT(*) as programs_created,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(frequency), 1) as avg_frequency,
  ROUND(AVG(total_exercises), 1) as avg_exercises
FROM analytics.fact_program_creations
GROUP BY split
ORDER BY programs_created DESC;

-- [3.5] Location Preference (Gym vs Home)
SELECT
  location,
  COUNT(*) as programs_created,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM analytics.fact_program_creations
GROUP BY location;

-- ================================================================
-- PRIORITY 4: WORKOUT ANALYTICS
-- ================================================================

-- [4.1] Weekly Workout Volume Trends
SELECT
  week_start_date as week,
  COUNT(DISTINCT user_id) as active_users,
  SUM(workouts_count) as total_workouts,
  SUM(total_sets) as total_sets,
  SUM(total_reps) as total_reps,
  ROUND(AVG(avg_rpe), 1) as avg_rpe,
  ROUND(AVG(avg_completion_rate), 1) as avg_completion_rate
FROM analytics.agg_workout_volume_weekly
WHERE week_start_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY week_start_date
ORDER BY week_start_date DESC;

-- [4.2] Workout Frequency Distribution
SELECT
  CASE
    WHEN workouts_per_week < 2 THEN '< 2x/week'
    WHEN workouts_per_week < 3 THEN '2-3x/week'
    WHEN workouts_per_week < 4 THEN '3-4x/week'
    WHEN workouts_per_week < 5 THEN '4-5x/week'
    ELSE '5+x/week'
  END as frequency_bucket,
  COUNT(*) as users_count,
  ROUND(AVG(total_workouts), 1) as avg_total_workouts,
  ROUND(AVG(avg_rpe), 1) as avg_rpe,
  ROUND(AVG(avg_completion_rate), 1) as avg_completion_rate
FROM analytics.mv_workout_frequency_stats
WHERE total_workouts >= 3 -- At least 3 workouts
GROUP BY frequency_bucket
ORDER BY
  CASE frequency_bucket
    WHEN '< 2x/week' THEN 1
    WHEN '2-3x/week' THEN 2
    WHEN '3-4x/week' THEN 3
    WHEN '4-5x/week' THEN 4
    ELSE 5
  END;

-- [4.3] Daily Workout Completion Rates
SELECT
  workout_date as date,
  COUNT(*) as workouts,
  ROUND(AVG(completion_rate), 1) as avg_completion_rate,
  COUNT(CASE WHEN completion_rate >= 90 THEN 1 END) as high_completion,
  COUNT(CASE WHEN completion_rate < 50 THEN 1 END) as low_completion,
  ROUND(100.0 * COUNT(CASE WHEN completion_rate >= 90 THEN 1 END) / COUNT(*), 1) as high_completion_percent
FROM analytics.fact_workouts
WHERE workout_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY workout_date
ORDER BY workout_date DESC;

-- [4.4] Most Popular Exercises
SELECT
  exercise_name,
  pattern,
  COUNT(*) as times_performed,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(sets_completed), 1) as avg_sets,
  ROUND(AVG(reps_completed), 1) as avg_reps,
  ROUND(AVG(exercise_rpe), 1) as avg_rpe
FROM analytics.fact_exercises
GROUP BY exercise_name, pattern
ORDER BY times_performed DESC
LIMIT 30;

-- [4.5] Workout Duration Analysis
SELECT
  CASE
    WHEN session_duration_minutes < 30 THEN '< 30 min'
    WHEN session_duration_minutes < 45 THEN '30-45 min'
    WHEN session_duration_minutes < 60 THEN '45-60 min'
    WHEN session_duration_minutes < 90 THEN '60-90 min'
    ELSE '90+ min'
  END as duration_bucket,
  COUNT(*) as workout_count,
  ROUND(AVG(exercises_completed), 1) as avg_exercises,
  ROUND(AVG(completion_rate), 1) as avg_completion_rate,
  ROUND(AVG(session_rpe), 1) as avg_rpe
FROM analytics.fact_workouts
WHERE session_duration_minutes IS NOT NULL
  AND session_duration_minutes > 0
GROUP BY duration_bucket
ORDER BY
  CASE duration_bucket
    WHEN '< 30 min' THEN 1
    WHEN '30-45 min' THEN 2
    WHEN '45-60 min' THEN 3
    WHEN '60-90 min' THEN 4
    ELSE 5
  END;

-- ================================================================
-- PRIORITY 5: RPE TRENDS
-- ================================================================

-- [5.1] RPE Distribution (Global)
SELECT
  rpe_bucket,
  workout_count,
  user_count,
  ROUND(avg_completion_rate, 1) as avg_completion_rate,
  ROUND(avg_duration, 1) as avg_duration_minutes,
  ROUND(100.0 * workout_count / SUM(workout_count) OVER (), 1) as percentage
FROM analytics.mv_rpe_distribution
ORDER BY rpe_bucket;

-- [5.2] Monthly RPE Trends (Users with High RPE)
SELECT
  month_start_date as month,
  COUNT(DISTINCT user_id) as users,
  ROUND(AVG(avg_session_rpe), 1) as avg_rpe,
  SUM(high_rpe_sessions) as total_high_rpe_sessions,
  SUM(adjustments_count) as total_adjustments,
  ROUND(100.0 * SUM(high_rpe_sessions) / NULLIF(SUM(total_workouts), 0), 1) as high_rpe_rate
FROM analytics.agg_rpe_trends_monthly
WHERE month_start_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month_start_date
ORDER BY month_start_date DESC;

-- [5.3] Auto-Regulation Adjustments Summary
SELECT
  adjustment_type,
  trigger_type,
  COUNT(*) as adjustments_count,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(avg_rpe_before), 1) as avg_rpe_trigger,
  ROUND(AVG(volume_change_percent), 1) as avg_volume_change,
  ROUND(AVG(exercises_affected), 1) as avg_exercises_affected,
  SUM(CASE WHEN applied THEN 1 ELSE 0 END) as applied_count,
  ROUND(100.0 * SUM(CASE WHEN applied THEN 1 ELSE 0 END) / COUNT(*), 1) as application_rate
FROM analytics.fact_program_adjustments
GROUP BY adjustment_type, trigger_type
ORDER BY adjustments_count DESC;

-- [5.4] Users Needing Intervention (High RPE Consistently)
SELECT
  user_id,
  month_start_date as month,
  avg_session_rpe as avg_rpe,
  total_workouts,
  high_rpe_sessions,
  adjustments_count,
  ROUND(100.0 * high_rpe_sessions / total_workouts, 1) as high_rpe_rate
FROM analytics.agg_rpe_trends_monthly
WHERE month_start_date >= CURRENT_DATE - INTERVAL '1 month'
  AND avg_session_rpe > 8.5
  AND total_workouts >= 3
ORDER BY avg_session_rpe DESC, high_rpe_rate DESC
LIMIT 50;

-- [5.5] Recovery Quality Analysis (RPE + Sleep + Mood)
SELECT
  workout_date as date,
  COUNT(*) as workouts,
  ROUND(AVG(session_rpe), 1) as avg_rpe,
  ROUND(AVG(sleep_quality), 1) as avg_sleep,
  COUNT(CASE WHEN mood IN ('stressed', 'tired') THEN 1 END) as poor_mood_count,
  COUNT(CASE WHEN sleep_quality <= 5 THEN 1 END) as poor_sleep_count,
  -- Recovery Quality Score
  ROUND(100 - (AVG(session_rpe) * 10 + (10 - AVG(sleep_quality)) * 5), 1) as recovery_score
FROM analytics.fact_workouts
WHERE workout_date >= CURRENT_DATE - INTERVAL '30 days'
  AND sleep_quality IS NOT NULL
GROUP BY workout_date
ORDER BY workout_date DESC;

-- ================================================================
-- ADVANCED QUERIES
-- ================================================================

-- [A1] User Journey Analysis (Full Funnel with Time)
WITH journey AS (
  SELECT
    r.user_id,
    r.registration_timestamp,
    o.completed_timestamp as onboarding_completed,
    s.completed_timestamp as screening_completed,
    p.created_timestamp as program_created,
    w.workout_timestamp as first_workout,
    -- Time deltas (in hours)
    EXTRACT(EPOCH FROM (o.completed_timestamp - r.registration_timestamp)) / 3600 as hours_to_onboarding,
    EXTRACT(EPOCH FROM (s.completed_timestamp - o.completed_timestamp)) / 3600 as hours_to_screening,
    EXTRACT(EPOCH FROM (p.created_timestamp - s.completed_timestamp)) / 3600 as hours_to_program,
    EXTRACT(EPOCH FROM (w.workout_timestamp - p.created_timestamp)) / 3600 as hours_to_first_workout
  FROM analytics.fact_user_registrations r
  LEFT JOIN analytics.fact_onboarding_completions o ON r.user_id = o.user_id
  LEFT JOIN analytics.fact_screening_completions s ON r.user_id = s.user_id
  LEFT JOIN analytics.fact_program_creations p ON r.user_id = p.user_id AND p.is_first_program
  LEFT JOIN LATERAL (
    SELECT workout_timestamp, user_id
    FROM analytics.fact_workouts
    WHERE user_id = r.user_id
    ORDER BY workout_timestamp
    LIMIT 1
  ) w ON w.user_id = r.user_id
  WHERE r.registration_date >= CURRENT_DATE - INTERVAL '90 days'
)
SELECT
  COUNT(*) as total_registrations,
  COUNT(onboarding_completed) as completed_onboarding,
  COUNT(screening_completed) as completed_screening,
  COUNT(program_created) as created_program,
  COUNT(first_workout) as logged_first_workout,
  ROUND(AVG(hours_to_onboarding), 1) as avg_hours_to_onboarding,
  ROUND(AVG(hours_to_screening), 1) as avg_hours_to_screening,
  ROUND(AVG(hours_to_program), 1) as avg_hours_to_program,
  ROUND(AVG(hours_to_first_workout), 1) as avg_hours_to_first_workout
FROM journey;

-- [A2] Correlation: RPE vs Completion Rate
SELECT
  FLOOR(session_rpe) as rpe_bucket,
  COUNT(*) as workouts,
  ROUND(AVG(completion_rate), 1) as avg_completion_rate,
  -- Correlation coefficient placeholder (requires more complex calculation)
  ROUND(CORR(session_rpe, completion_rate), 3) as correlation_coefficient
FROM analytics.fact_workouts
WHERE session_rpe IS NOT NULL
  AND completion_rate IS NOT NULL
GROUP BY FLOOR(session_rpe)
ORDER BY rpe_bucket;

-- [A3] Predictive Churn Score (Simple Heuristic)
SELECT
  user_id,
  email,
  total_workouts_logged,
  last_activity_at::DATE,
  EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) as days_inactive,
  -- Churn Risk Score (0-100, higher = more risk)
  LEAST(100, GREATEST(0,
    (EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) * 2) +
    (CASE WHEN total_workouts_logged < 5 THEN 30 ELSE 0 END) +
    (CASE WHEN total_programs_created = 0 THEN 40 ELSE 0 END)
  )) as churn_risk_score,
  CASE
    WHEN EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) > 60 THEN 'Critical'
    WHEN EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) > 30 THEN 'High'
    WHEN EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) > 14 THEN 'Medium'
    ELSE 'Low'
  END as churn_risk_level
FROM analytics.dim_users
WHERE total_workouts_logged > 0
  AND EXTRACT(DAY FROM CURRENT_DATE - last_activity_at) > 7
ORDER BY churn_risk_score DESC
LIMIT 100;

-- ================================================================
-- EXPORT QUERIES (For External BI Tools)
-- ================================================================

-- [E1] Daily Snapshot (For BI Dashboard)
SELECT
  d.date_id as date,
  d.day_name,
  d.is_weekend,
  COALESCE(bm.new_registrations, 0) as new_users,
  COALESCE(bm.program_creations, 0) as new_programs,
  COALESCE(bm.daily_active_users, 0) as dau,
  COALESCE(bm.workouts_logged, 0) as workouts,
  COALESCE((SELECT AVG(session_rpe) FROM analytics.fact_workouts WHERE workout_date = d.date_id), 0) as avg_rpe
FROM analytics.dim_date d
LEFT JOIN analytics.agg_business_metrics_daily bm ON d.date_id = bm.date_id
WHERE d.date_id >= CURRENT_DATE - INTERVAL '90 days'
  AND d.date_id <= CURRENT_DATE
ORDER BY d.date_id DESC;

-- [E2] User Master Table (For ML/Analytics)
SELECT
  du.user_id,
  du.created_at::DATE as registration_date,
  du.cohort_month,
  du.total_programs_created,
  du.total_workouts_logged,
  du.is_active,
  du.last_activity_at::DATE,
  EXTRACT(DAY FROM CURRENT_DATE - du.created_at) as user_lifetime_days,
  COALESCE((SELECT AVG(session_rpe) FROM analytics.fact_workouts WHERE user_id = du.user_id), 0) as avg_rpe,
  COALESCE((SELECT AVG(completion_rate) FROM analytics.fact_workouts WHERE user_id = du.user_id), 0) as avg_completion_rate,
  COALESCE((SELECT COUNT(*) FROM analytics.fact_program_adjustments WHERE user_id = du.user_id), 0) as total_adjustments
FROM analytics.dim_users du;

-- ================================================================
-- END OF QUERY LIBRARY
-- ================================================================
