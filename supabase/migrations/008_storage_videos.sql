-- ============================================
-- SUPABASE STORAGE SETUP PER VIDEO ESERCIZI
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- Dashboard > SQL Editor > New Query

-- 1. Crea il bucket per i video degli esercizi
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-videos',
  'exercise-videos',
  true,  -- Pubblico per streaming veloce
  52428800,  -- 50MB max per file
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

-- 2. Policy per lettura pubblica (tutti possono vedere i video)
CREATE POLICY "Public video access"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-videos');

-- 3. Policy per upload (solo admin/authenticated)
CREATE POLICY "Admin video upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-videos'
  AND auth.role() = 'authenticated'
);

-- 4. Policy per delete (solo admin)
CREATE POLICY "Admin video delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-videos'
  AND auth.role() = 'authenticated'
);

-- 5. Policy per update (solo admin)
CREATE POLICY "Admin video update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercise-videos'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- COME CARICARE I VIDEO
-- ============================================
--
-- Opzione 1: Dashboard Supabase
-- 1. Vai su Storage > exercise-videos
-- 2. Click "Upload files"
-- 3. Seleziona i video
--
-- Opzione 2: CLI Supabase
-- supabase storage cp ./video.mp4 exercise-videos/push-up.mp4
--
-- Naming convention per i file:
-- - Usa kebab-case: push-up.mp4, barbell-squat.mp4
-- - Lowercase: romanian-deadlift.mp4
-- - No spazi o caratteri speciali
--
-- URL pubblico del video:
-- https://[PROJECT_ID].supabase.co/storage/v1/object/public/exercise-videos/[filename]
--
-- Esempio:
-- https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-videos/push-up.mp4
