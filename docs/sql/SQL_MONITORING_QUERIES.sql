-- ========================================
-- FITNESSFLOW - SQL MONITORING QUERIES
-- Database monitoring and analytics queries
-- Version: 1.0.0
-- ========================================

-- ===== HEALTH CHECKS =====

-- 1. Verify Table Structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'training_programs'
ORDER BY ordinal_position;

-- 2. Check RLS Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'training_programs';

-- 3. Verify Triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'training_programs';

-- 4. Check Indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'training_programs';

-- ===== USER STATISTICS =====

-- 5. Total Users with Programs
SELECT COUNT(DISTINCT user_id) as total_users_with_programs
FROM training_programs;

-- 6. Programs per User
SELECT
  user_id,
  COUNT(*) as program_count,
  MAX(created_at) as last_program_created
FROM training_programs
GROUP BY user_id
ORDER BY program_count DESC;

-- 7. Average Programs per User
SELECT
  AVG(program_count) as avg_programs_per_user,
  MIN(program_count) as min_programs,
  MAX(program_count) as max_programs
FROM (
  SELECT user_id, COUNT(*) as program_count
  FROM training_programs
  GROUP BY user_id
) subquery;

-- 8. Users with Multiple Programs
SELECT
  user_id,
  COUNT(*) as program_count
FROM training_programs
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY program_count DESC;

-- ===== PROGRAM ANALYTICS =====

-- 9. Programs by Level
SELECT
  level,
  COUNT(*) as program_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM training_programs
GROUP BY level
ORDER BY program_count DESC;

-- 10. Programs by Goal
SELECT
  goal,
  COUNT(*) as program_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM training_programs
GROUP BY goal
ORDER BY program_count DESC;

-- 11. Programs by Split Type
SELECT
  split,
  COUNT(*) as program_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM training_programs
GROUP BY split
ORDER BY program_count DESC;

-- 12. Programs by Frequency
SELECT
  frequency,
  COUNT(*) as program_count
FROM training_programs
GROUP BY frequency
ORDER BY frequency;

-- 13. Active vs Inactive Programs
SELECT
  CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status,
  COUNT(*) as program_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM training_programs
GROUP BY is_active;

-- ===== TEMPORAL ANALYSIS =====

-- 14. Programs Created per Day (Last 30 Days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as programs_created
FROM training_programs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 15. Programs Created per Week (Last 12 Weeks)
SELECT
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as programs_created
FROM training_programs
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- 16. Programs Created per Month
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as programs_created
FROM training_programs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 17. Recently Created Programs
SELECT
  id,
  name,
  level,
  goal,
  user_id,
  created_at
FROM training_programs
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 18. Recently Accessed Programs
SELECT
  id,
  name,
  level,
  user_id,
  last_accessed_at
FROM training_programs
WHERE last_accessed_at >= NOW() - INTERVAL '7 days'
ORDER BY last_accessed_at DESC;

-- ===== PERFORMANCE MONITORING =====

-- 19. Table Size
SELECT
  pg_size_pretty(pg_total_relation_size('training_programs')) as total_size,
  pg_size_pretty(pg_relation_size('training_programs')) as table_size,
  pg_size_pretty(pg_total_relation_size('training_programs') - pg_relation_size('training_programs')) as indexes_size;

-- 20. Row Count by Status
SELECT
  status,
  COUNT(*) as row_count
FROM training_programs
GROUP BY status;

-- 21. Average Program Size (JSONB fields)
SELECT
  AVG(pg_column_size(weekly_split)) as avg_weekly_split_size_bytes,
  AVG(pg_column_size(exercises)) as avg_exercises_size_bytes,
  AVG(pg_column_size(metadata)) as avg_metadata_size_bytes
FROM training_programs;

-- 22. Large Programs (> 50KB)
SELECT
  id,
  name,
  user_id,
  pg_column_size(weekly_split) + pg_column_size(exercises) as total_size_bytes
FROM training_programs
WHERE pg_column_size(weekly_split) + pg_column_size(exercises) > 51200
ORDER BY total_size_bytes DESC;

-- ===== DATA QUALITY CHECKS =====

-- 23. Programs with NULL Required Fields
SELECT
  id,
  name,
  level,
  goal,
  frequency,
  split
FROM training_programs
WHERE name IS NULL
   OR level IS NULL
   OR goal IS NULL
   OR frequency IS NULL
   OR split IS NULL;

-- 24. Programs with Invalid Frequency
SELECT
  id,
  name,
  frequency,
  user_id
FROM training_programs
WHERE frequency < 1 OR frequency > 7;

-- 25. Users with Multiple Active Programs (SHOULD BE EMPTY)
SELECT
  user_id,
  COUNT(*) as active_program_count,
  ARRAY_AGG(id) as program_ids
FROM training_programs
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 26. Programs Missing Dates
SELECT
  id,
  name,
  created_at,
  start_date,
  end_date
FROM training_programs
WHERE created_at IS NULL
   OR (is_active = true AND start_date IS NULL);

-- ===== ADVANCED JSONB QUERIES =====

-- 27. Programs with Weekly Split
SELECT
  id,
  name,
  jsonb_array_length(weekly_split) as days_in_split
FROM training_programs
WHERE jsonb_array_length(weekly_split) > 0;

-- 28. Exercise Count per Program
SELECT
  id,
  name,
  jsonb_array_length(exercises) as exercise_count
FROM training_programs
WHERE jsonb_array_length(exercises) > 0
ORDER BY exercise_count DESC;

-- 29. Programs with Pain Areas
SELECT
  id,
  name,
  pain_areas
FROM training_programs
WHERE jsonb_array_length(pain_areas) > 0;

-- 30. Equipment Usage
SELECT
  jsonb_object_keys(available_equipment) as equipment_type,
  COUNT(*) as program_count
FROM training_programs
WHERE available_equipment IS NOT NULL
  AND available_equipment != '{}'::jsonb
GROUP BY jsonb_object_keys(available_equipment)
ORDER BY program_count DESC;

-- ===== USER BEHAVIOR ANALYSIS =====

-- 31. User Retention (Programs Created Over Time)
WITH user_program_timeline AS (
  SELECT
    user_id,
    MIN(created_at) as first_program_date,
    MAX(created_at) as last_program_date,
    COUNT(*) as total_programs
  FROM training_programs
  GROUP BY user_id
)
SELECT
  CASE
    WHEN total_programs = 1 THEN '1 program'
    WHEN total_programs <= 3 THEN '2-3 programs'
    WHEN total_programs <= 5 THEN '4-5 programs'
    ELSE '6+ programs'
  END as program_range,
  COUNT(*) as user_count
FROM user_program_timeline
GROUP BY program_range
ORDER BY user_count DESC;

-- 32. Time Between Programs (User Engagement)
WITH program_gaps AS (
  SELECT
    user_id,
    created_at,
    LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as prev_program_date,
    created_at - LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as gap
  FROM training_programs
)
SELECT
  user_id,
  COUNT(*) as program_count,
  AVG(gap) as avg_gap_between_programs,
  MAX(gap) as longest_gap
FROM program_gaps
WHERE gap IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY avg_gap_between_programs;

-- 33. Program Longevity (Active Programs by Age)
SELECT
  CASE
    WHEN created_at > NOW() - INTERVAL '1 week' THEN '< 1 week'
    WHEN created_at > NOW() - INTERVAL '1 month' THEN '1-4 weeks'
    WHEN created_at > NOW() - INTERVAL '3 months' THEN '1-3 months'
    ELSE '> 3 months'
  END as program_age,
  COUNT(*) as program_count
FROM training_programs
WHERE is_active = true
GROUP BY program_age
ORDER BY program_count DESC;

-- ===== TROUBLESHOOTING QUERIES =====

-- 34. Find Programs for Specific User
SELECT
  id,
  name,
  level,
  goal,
  is_active,
  created_at
FROM training_programs
WHERE user_id = 'USER_UUID_HERE'
ORDER BY created_at DESC;

-- 35. Find Program by ID
SELECT *
FROM training_programs
WHERE id = 'PROGRAM_UUID_HERE';

-- 36. Recent Updates
SELECT
  id,
  name,
  user_id,
  updated_at,
  created_at
FROM training_programs
WHERE updated_at > created_at + INTERVAL '1 minute'
ORDER BY updated_at DESC
LIMIT 20;

-- 37. Programs Never Accessed
SELECT
  id,
  name,
  created_at,
  last_accessed_at
FROM training_programs
WHERE last_accessed_at IS NULL
  OR last_accessed_at = created_at;

-- ===== MAINTENANCE QUERIES =====

-- 38. Archive Old Inactive Programs (DRY RUN)
SELECT
  id,
  name,
  user_id,
  created_at,
  status
FROM training_programs
WHERE is_active = false
  AND status = 'completed'
  AND created_at < NOW() - INTERVAL '90 days'
ORDER BY created_at;

-- 39. Actually Archive (RUN WITH CAUTION)
-- UPDATE training_programs
-- SET status = 'archived', updated_at = NOW()
-- WHERE is_active = false
--   AND status = 'completed'
--   AND created_at < NOW() - INTERVAL '90 days';

-- 40. Vacuum and Analyze
VACUUM ANALYZE training_programs;

-- ===== EXPORT QUERIES =====

-- 41. Export Program Summary (CSV Format)
SELECT
  tp.id,
  tp.user_id,
  tp.name,
  tp.level,
  tp.goal,
  tp.split,
  tp.frequency,
  tp.is_active,
  tp.status,
  tp.created_at::date as created_date,
  jsonb_array_length(tp.exercises) as exercise_count
FROM training_programs tp
ORDER BY tp.created_at DESC;

-- 42. Export User Statistics
SELECT
  user_id,
  COUNT(*) as total_programs,
  COUNT(*) FILTER (WHERE is_active = true) as active_programs,
  MIN(created_at)::date as first_program_date,
  MAX(created_at)::date as last_program_date,
  STRING_AGG(DISTINCT level, ', ') as levels_used,
  STRING_AGG(DISTINCT goal, ', ') as goals_used
FROM training_programs
GROUP BY user_id
ORDER BY total_programs DESC;

-- ===== ALERTS & WARNINGS =====

-- 43. Alert: Multiple Active Programs (Should be Empty)
SELECT
  'ALERT: Multiple Active Programs' as issue_type,
  user_id,
  COUNT(*) as active_count
FROM training_programs
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 44. Alert: Programs with Invalid Data
SELECT
  'ALERT: Invalid Program Data' as issue_type,
  id,
  name,
  CASE
    WHEN name IS NULL OR name = '' THEN 'Missing name'
    WHEN frequency < 1 OR frequency > 7 THEN 'Invalid frequency'
    WHEN level NOT IN ('beginner', 'intermediate', 'advanced') THEN 'Invalid level'
    ELSE 'Unknown issue'
  END as issue_description
FROM training_programs
WHERE name IS NULL OR name = ''
   OR frequency < 1 OR frequency > 7
   OR level NOT IN ('beginner', 'intermediate', 'advanced');

-- 45. Alert: Stale Active Programs (> 6 months old)
SELECT
  'ALERT: Stale Active Program' as issue_type,
  id,
  name,
  user_id,
  created_at,
  AGE(NOW(), created_at) as program_age
FROM training_programs
WHERE is_active = true
  AND created_at < NOW() - INTERVAL '6 months';

-- ========================================
-- USAGE NOTES:
--
-- 1. Run health checks (1-4) after deployment
-- 2. Monitor user statistics (5-8) weekly
-- 3. Review analytics (9-18) for insights
-- 4. Check performance (19-22) if app slows down
-- 5. Run data quality checks (23-26) daily
-- 6. Use troubleshooting (34-37) for support tickets
-- 7. Run alerts (43-45) daily via cron job
--
-- ========================================
