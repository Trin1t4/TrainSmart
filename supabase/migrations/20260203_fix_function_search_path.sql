-- ============================================================================
-- Migration: Fix mutable search_path on all public functions
-- Date: 2026-02-03
-- Description: Sets search_path = '' on all 33 functions flagged by the
--              Supabase Database Linter (lint 0011_function_search_path_mutable).
--              This prevents search_path manipulation attacks.
-- ============================================================================

-- 1. update_discomfort_timestamp()
ALTER FUNCTION public.update_discomfort_timestamp() SET search_path = '';

-- 2. report_discomfort(UUID, TEXT[])
ALTER FUNCTION public.report_discomfort(UUID, TEXT[]) SET search_path = '';

-- 3. get_discomfort_status(UUID)
ALTER FUNCTION public.get_discomfort_status(UUID) SET search_path = '';

-- 4. clear_discomfort(UUID, TEXT)
ALTER FUNCTION public.clear_discomfort(UUID, TEXT) SET search_path = '';

-- 5. get_avg_rpe_last_sessions(UUID, UUID, INTEGER)
ALTER FUNCTION public.get_avg_rpe_last_sessions(UUID, UUID, INTEGER) SET search_path = '';

-- 6. check_consecutive_skips(UUID, VARCHAR, INTEGER)
ALTER FUNCTION public.check_consecutive_skips(UUID, VARCHAR, INTEGER) SET search_path = '';

-- 7. get_active_skip_alerts(UUID)
ALTER FUNCTION public.get_active_skip_alerts(UUID) SET search_path = '';

-- 8. get_skip_stats_by_muscle_group(UUID, INTEGER)
ALTER FUNCTION public.get_skip_stats_by_muscle_group(UUID, INTEGER) SET search_path = '';

-- 9. update_user_consents_updated_at()
ALTER FUNCTION public.update_user_consents_updated_at() SET search_path = '';

-- 10. check_and_create_skip_alert()
ALTER FUNCTION public.check_and_create_skip_alert() SET search_path = '';

-- 11. remove_health_fields_from_jsonb(UUID)
ALTER FUNCTION public.remove_health_fields_from_jsonb(UUID) SET search_path = '';

-- 12. check_feature_access(UUID, VARCHAR)
ALTER FUNCTION public.check_feature_access(UUID, VARCHAR) SET search_path = '';

-- 13. get_user_features(UUID)
ALTER FUNCTION public.get_user_features(UUID) SET search_path = '';

-- 14. admin_list_features()
ALTER FUNCTION public.admin_list_features() SET search_path = '';

-- 15. get_in_progress_workout(UUID)
ALTER FUNCTION public.get_in_progress_workout(UUID) SET search_path = '';

-- 16. get_workout_sets(UUID)
ALTER FUNCTION public.get_workout_sets(UUID) SET search_path = '';

-- 17. cleanup_abandoned_workouts()
ALTER FUNCTION public.cleanup_abandoned_workouts() SET search_path = '';

-- 18. admin_toggle_feature(VARCHAR, BOOLEAN)
ALTER FUNCTION public.admin_toggle_feature(VARCHAR, BOOLEAN) SET search_path = '';

-- 19. admin_set_feature_tier(VARCHAR, VARCHAR)
ALTER FUNCTION public.admin_set_feature_tier(VARCHAR, VARCHAR) SET search_path = '';

-- 20. admin_set_feature_override(UUID, VARCHAR, VARCHAR, TIMESTAMPTZ, TEXT)
ALTER FUNCTION public.admin_set_feature_override(UUID, VARCHAR, VARCHAR, TIMESTAMPTZ, TEXT) SET search_path = '';

-- 21. admin_create_feature(VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, JSONB)
ALTER FUNCTION public.admin_create_feature(VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, JSONB) SET search_path = '';

-- 22. run_data_retention_cleanup()
ALTER FUNCTION public.run_data_retention_cleanup() SET search_path = '';

-- 23. process_scheduled_deletions()
ALTER FUNCTION public.process_scheduled_deletions() SET search_path = '';

-- 24. get_exercises_needing_adjustment(UUID, UUID, INTEGER)
ALTER FUNCTION public.get_exercises_needing_adjustment(UUID, UUID, INTEGER) SET search_path = '';

-- 25. get_rir_alert_stats(UUID, INTEGER)
ALTER FUNCTION public.get_rir_alert_stats(UUID, INTEGER) SET search_path = '';

-- 26. check_rir_safety_pattern(UUID, TEXT)
ALTER FUNCTION public.check_rir_safety_pattern(UUID, TEXT) SET search_path = '';

-- 27. get_average_readiness(UUID, INTEGER)
ALTER FUNCTION public.get_average_readiness(UUID, INTEGER) SET search_path = '';

-- 28. get_frequent_pain_areas(UUID, INTEGER, INTEGER)
ALTER FUNCTION public.get_frequent_pain_areas(UUID, INTEGER, INTEGER) SET search_path = '';

-- 29. get_exercise_tempo_stats(UUID, TEXT, INTEGER)
ALTER FUNCTION public.get_exercise_tempo_stats(UUID, TEXT, INTEGER) SET search_path = '';

-- 30. get_workout_modifications(UUID, UUID)
ALTER FUNCTION public.get_workout_modifications(UUID, UUID) SET search_path = '';

-- 31. count_active_modifications(UUID, UUID)
ALTER FUNCTION public.count_active_modifications(UUID, UUID) SET search_path = '';

-- 32. update_exercise_modification_timestamp()
ALTER FUNCTION public.update_exercise_modification_timestamp() SET search_path = '';

-- 33. debug_admin_check - created outside migrations, find and fix dynamically
DO $$
DECLARE
  v_func_oid oid;
  v_arg_types text;
BEGIN
  SELECT p.oid,
         pg_catalog.pg_get_function_identity_arguments(p.oid)
  INTO v_func_oid, v_arg_types
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'debug_admin_check'
  LIMIT 1;

  IF v_func_oid IS NOT NULL THEN
    EXECUTE format(
      'ALTER FUNCTION public.debug_admin_check(%s) SET search_path = %L',
      v_arg_types, ''
    );
    RAISE NOTICE 'Fixed search_path for debug_admin_check(%)', v_arg_types;
  ELSE
    RAISE NOTICE 'debug_admin_check not found — skipping';
  END IF;
END;
$$;
