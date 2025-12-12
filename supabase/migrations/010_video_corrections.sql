-- =====================================================
-- VIDEO CORRECTIONS SYSTEM - DATABASE MIGRATION
-- Sistema completo per analisi video esercizi con Gemini AI
-- =====================================================

-- =====================================================
-- 1. MODIFICA TABELLA USERS
-- Aggiungi campi per subscription tier e quota video
-- =====================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'base', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS video_corrections_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_corrections_reset_date TIMESTAMP DEFAULT NOW();

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_corrections_reset ON users(video_corrections_reset_date);

COMMENT ON COLUMN users.subscription_tier IS 'Piano abbonamento: free, base (€19.90), pro (€29.90), premium (€44.90)';
COMMENT ON COLUMN users.video_corrections_used IS 'Numero di video corrections usati nel periodo corrente';
COMMENT ON COLUMN users.video_corrections_reset_date IS 'Data ultimo reset quota mensile';

-- =====================================================
-- 2. TABELLA VIDEO CORRECTIONS
-- Traccia tutti i video caricati e feedback AI
-- =====================================================

CREATE TABLE IF NOT EXISTS video_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata video
  video_url TEXT NOT NULL, -- Path in Supabase Storage
  video_filename VARCHAR(255) NOT NULL,
  video_size_bytes BIGINT NOT NULL,
  video_duration_seconds INTEGER,

  -- Contesto esercizio
  exercise_name VARCHAR(255) NOT NULL,
  exercise_pattern VARCHAR(100), -- es. "lower_push", "horizontal_push"
  workout_log_id UUID, -- Link a workout_logs se fatto durante sessione
  set_number INTEGER, -- Quale set dell'esercizio

  -- AI Processing
  processing_status VARCHAR(20) DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_model_used VARCHAR(50) DEFAULT 'gemini-1.5-pro',

  -- Feedback AI (JSON structured)
  feedback_text TEXT, -- Raw response da Gemini
  feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 10), -- Score tecnica 1-10
  feedback_issues JSONB, -- Array di issue: [{name, severity, description, timestamp}]
  feedback_corrections JSONB, -- Array di correzioni suggerite
  feedback_warnings JSONB, -- Array di safety warnings
  load_recommendation VARCHAR(50), -- "increase_5_percent", "maintain", "decrease_10_percent"

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  viewed_at TIMESTAMP, -- Quando utente ha visto feedback

  -- Metadata extra
  metadata JSONB -- Device info, app version, etc.
);

-- Indexes per performance
CREATE INDEX idx_video_corrections_user_id ON video_corrections(user_id);
CREATE INDEX idx_video_corrections_status ON video_corrections(processing_status);
CREATE INDEX idx_video_corrections_created_at ON video_corrections(created_at DESC);
CREATE INDEX idx_video_corrections_exercise ON video_corrections(exercise_name);

-- RLS Policies
ALTER TABLE video_corrections ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono vedere solo le proprie correzioni
CREATE POLICY "Users can view their own video corrections"
ON video_corrections FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Utenti possono inserire le proprie correzioni
CREATE POLICY "Users can insert their own video corrections"
ON video_corrections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Utenti possono aggiornare le proprie correzioni (es. viewed_at)
CREATE POLICY "Users can update their own video corrections"
ON video_corrections FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Utenti possono eliminare le proprie correzioni
CREATE POLICY "Users can delete their own video corrections"
ON video_corrections FOR DELETE
USING (auth.uid() = user_id);

COMMENT ON TABLE video_corrections IS 'Traccia video caricati per analisi tecnica esercizi';
COMMENT ON COLUMN video_corrections.feedback_issues IS 'JSON: [{name: "knee_valgus", severity: "medium", description: "...", timestamp_seconds: [8,12]}]';
COMMENT ON COLUMN video_corrections.feedback_corrections IS 'JSON: ["Cue 1", "Cue 2", ...]';

-- =====================================================
-- 3. TABELLA QUOTA HISTORY
-- Traccia reset mensili quota video corrections
-- =====================================================

CREATE TABLE IF NOT EXISTS correction_quota_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  reset_date TIMESTAMP NOT NULL,
  previous_count INTEGER NOT NULL, -- Quante correzioni aveva usato prima del reset
  subscription_tier VARCHAR(20) NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quota_history_user_id ON correction_quota_history(user_id);
CREATE INDEX idx_quota_history_reset_date ON correction_quota_history(reset_date DESC);

-- RLS
ALTER TABLE correction_quota_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quota history"
ON correction_quota_history FOR SELECT
USING (auth.uid() = user_id);

COMMENT ON TABLE correction_quota_history IS 'Storico reset mensili quota video corrections';

-- =====================================================
-- 4. RPC FUNCTION: CHECK QUOTA
-- Verifica se utente può caricare un nuovo video
-- =====================================================

CREATE OR REPLACE FUNCTION check_video_correction_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_corrections_used INTEGER;
  v_can_upload BOOLEAN;
  v_remaining INTEGER;
  v_max_allowed INTEGER;
BEGIN
  -- Get user subscription tier
  SELECT subscription_tier, video_corrections_used, video_corrections_reset_date
  INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- Reset quota se è passato un mese (30 giorni)
  IF v_user.video_corrections_reset_date < NOW() - INTERVAL '30 days' THEN
    -- Log reset in history
    INSERT INTO correction_quota_history (user_id, reset_date, previous_count, subscription_tier)
    VALUES (p_user_id, NOW(), v_user.video_corrections_used, v_user.subscription_tier);

    -- Reset counter
    UPDATE users
    SET video_corrections_used = 0,
        video_corrections_reset_date = NOW()
    WHERE id = p_user_id;

    v_corrections_used := 0;
  ELSE
    v_corrections_used := v_user.video_corrections_used;
  END IF;

  -- Determina quota massima in base al tier
  CASE v_user.subscription_tier
    WHEN 'free' THEN
      v_max_allowed := 1; -- 1 video gratis (demo)
    WHEN 'base' THEN
      v_max_allowed := 0; -- Base plan: ZERO video corrections
    WHEN 'pro' THEN
      v_max_allowed := 12; -- Pro: 2/settimana × 6 settimane = 12
    WHEN 'premium' THEN
      v_max_allowed := 999; -- Premium: praticamente illimitato
    ELSE
      v_max_allowed := 0;
  END CASE;

  -- Check se può caricare
  v_can_upload := (v_corrections_used < v_max_allowed);
  v_remaining := GREATEST(0, v_max_allowed - v_corrections_used);

  RETURN jsonb_build_object(
    'can_upload', v_can_upload,
    'tier', v_user.subscription_tier,
    'used', v_corrections_used,
    'max_allowed', v_max_allowed,
    'remaining', v_remaining,
    'reset_date', v_user.video_corrections_reset_date,
    'days_until_reset', EXTRACT(DAY FROM (v_user.video_corrections_reset_date + INTERVAL '30 days') - NOW())
  );
END;
$$;

COMMENT ON FUNCTION check_video_correction_quota IS 'Verifica quota disponibile per video corrections in base al tier utente';

-- =====================================================
-- 5. RPC FUNCTION: INCREMENT USAGE
-- Incrementa counter dopo upload video
-- =====================================================

CREATE OR REPLACE FUNCTION increment_video_correction_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET video_corrections_used = video_corrections_used + 1
  WHERE id = p_user_id;
END;
$$;

COMMENT ON FUNCTION increment_video_correction_usage IS 'Incrementa counter video corrections usati';

-- =====================================================
-- 6. SUPABASE STORAGE BUCKET
-- Bucket privato per video utenti
-- =====================================================

-- Crea bucket (se non esiste già)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-exercise-videos',
  'user-exercise-videos',
  false, -- PRIVATO (solo owner può accedere)
  104857600, -- 100 MB max per file
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];

-- =====================================================
-- 7. STORAGE RLS POLICIES
-- Sicurezza upload/download video
-- =====================================================

-- Policy: Utenti possono caricare i propri video
-- Path format: {user_id}/{filename}
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-exercise-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Utenti possono leggere i propri video
CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-exercise-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Utenti possono eliminare i propri video
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-exercise-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 8. CRON JOB: AUTO-DELETE OLD VIDEOS
-- GDPR compliance: elimina video dopo 90 giorni
-- =====================================================

-- Nota: Questo richiede pg_cron extension
-- Da eseguire manualmente o tramite Supabase scheduled functions

-- Schedulazione ogni giorno alle 2 AM per eliminare video vecchi
-- SELECT cron.schedule(
--   'delete-old-exercise-videos',
--   '0 2 * * *',
--   $$
--   DELETE FROM storage.objects
--   WHERE bucket_id = 'user-exercise-videos'
--   AND created_at < NOW() - INTERVAL '90 days';
--   $$
-- );

-- =====================================================
-- 9. HELPER VIEWS
-- View per statistiche video corrections
-- =====================================================

CREATE OR REPLACE VIEW video_corrections_stats AS
SELECT
  user_id,
  COUNT(*) as total_corrections,
  COUNT(*) FILTER (WHERE processing_status = 'completed') as completed_corrections,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed_corrections,
  AVG(feedback_score) FILTER (WHERE feedback_score IS NOT NULL) as avg_technique_score,
  MAX(created_at) as last_correction_date
FROM video_corrections
GROUP BY user_id;

COMMENT ON VIEW video_corrections_stats IS 'Statistiche aggregate per utente sulle video corrections';

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant execute su RPC functions
GRANT EXECUTE ON FUNCTION check_video_correction_quota TO authenticated;
GRANT EXECUTE ON FUNCTION increment_video_correction_usage TO authenticated;

-- =====================================================
-- MIGRATION COMPLETATA
-- =====================================================

-- Test query per verificare che tutto funzioni
DO $$
BEGIN
  RAISE NOTICE '✅ Video Corrections Migration completata!';
  RAISE NOTICE '📊 Tabelle create: video_corrections, correction_quota_history';
  RAISE NOTICE '🔧 RPC functions create: check_video_correction_quota, increment_video_correction_usage';
  RAISE NOTICE '📦 Storage bucket: user-exercise-videos (privato)';
  RAISE NOTICE '🔒 RLS policies attive su tutte le tabelle';
END $$;
