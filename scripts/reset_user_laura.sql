-- Script per resettare Laura Comolli
-- Deve rifare tutto: onboarding, quiz, screening, programma

-- 1. Trova l'utente per email o nome
-- Nota: modifica l'email se necessario
DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'comolli.laura@gmail.com'; -- Email esatta
BEGIN
  -- Cerca l'utente nella tabella auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email ILIKE target_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Utente non trovato con email pattern: %', target_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Trovato utente con ID: %', target_user_id;

  -- 2. Elimina tutti i dati correlati

  -- Training programs
  DELETE FROM training_programs WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati training_programs';

  -- Workout logs
  DELETE FROM workout_logs WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati workout_logs';

  -- Exercise logs
  DELETE FROM exercise_logs WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati exercise_logs';

  -- Program adjustments
  DELETE FROM program_adjustments WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati program_adjustments';

  -- Pain tracking
  DELETE FROM pain_tracking WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati pain_tracking';

  -- Rehabilitation programs
  DELETE FROM rehabilitation_programs WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati rehabilitation_programs';

  -- Recovery tracking
  DELETE FROM recovery_tracking WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati recovery_tracking';

  -- Streaks
  DELETE FROM user_streaks WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati user_streaks';

  -- Personal records
  DELETE FROM personal_records WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati personal_records';

  -- Achievements
  DELETE FROM user_achievements WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati user_achievements';

  -- Video corrections
  DELETE FROM video_corrections WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati video_corrections';

  -- Social posts
  DELETE FROM social_posts WHERE user_id = target_user_id;
  RAISE NOTICE 'Eliminati social_posts';

  -- Follows
  DELETE FROM user_follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  RAISE NOTICE 'Eliminati user_follows';

  -- 3. Resetta il profilo utente (mantiene l'account ma resetta onboarding)
  UPDATE user_profiles
  SET
    onboarding_completed = FALSE,
    onboarding_data = NULL,
    screening_data = NULL,
    quiz_data = NULL,
    level = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  RAISE NOTICE 'Resettato user_profile';

  RAISE NOTICE '=== RESET COMPLETATO per utente % ===', target_user_id;
  RAISE NOTICE 'Laura Comolli deve ora rifare: onboarding, quiz, screening, generazione programma';

END $$;
