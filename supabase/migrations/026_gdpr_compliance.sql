-- ============================================================================
-- GDPR COMPLIANCE SCHEMA - TrainSmart
-- ============================================================================
--
-- Tabelle per gestione completa GDPR:
-- - Consensi utente con audit trail
-- - Richieste export dati
-- - Richieste cancellazione account
-- - Log audit per conformità
--
-- ============================================================================

-- ============================================================================
-- 1. TABELLA CONSENSI UTENTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Array di consensi con dettagli
  consents JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Verifica età
  age_verified BOOLEAN DEFAULT FALSE,
  age_verification_date TIMESTAMPTZ,
  date_of_birth DATE, -- Opzionale, solo se necessario
  country VARCHAR(2), -- ISO country code

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique per utente
  CONSTRAINT user_consents_user_id_unique UNIQUE (user_id)
);

-- Index per query veloci
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);

-- RLS (Row Level Security)
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Policy: utente può vedere/modificare solo i propri consensi
DROP POLICY IF EXISTS "Users can manage own consents" ON user_consents;
CREATE POLICY "Users can manage own consents" ON user_consents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_consents_updated_at ON user_consents;
CREATE TRIGGER trigger_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_consents_updated_at();

-- ============================================================================
-- 2. TABELLA AUDIT LOG CONSENSI
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dettagli azione
  action VARCHAR(20) NOT NULL, -- 'grant', 'revoke', 'update'
  consents_affected TEXT[] NOT NULL, -- Array di tipi consenso
  details JSONB, -- Dettagli completi

  -- Metadata per audit
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index per query audit
CREATE INDEX IF NOT EXISTS idx_consent_audit_user_id ON consent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_created_at ON consent_audit_log(created_at);

-- RLS
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: solo lettura per l'utente, scrittura via service role
DROP POLICY IF EXISTS "Users can view own audit log" ON consent_audit_log;
CREATE POLICY "Users can view own audit log" ON consent_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow insert for authenticated users (for logging)
DROP POLICY IF EXISTS "Users can insert own audit log" ON consent_audit_log;
CREATE POLICY "Users can insert own audit log" ON consent_audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. TABELLA RICHIESTE EXPORT DATI
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'processing', 'ready', 'expired', 'failed'

  -- Configurazione
  format VARCHAR(10) NOT NULL DEFAULT 'json', -- 'json', 'csv', 'pdf'
  includes TEXT[] NOT NULL, -- Lista tabelle da includere

  -- Risultato
  download_url TEXT,
  expires_at TIMESTAMPTZ,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'ready', 'expired', 'failed')),
  CONSTRAINT valid_format CHECK (format IN ('json', 'csv', 'pdf'))
);

-- Index
CREATE INDEX IF NOT EXISTS idx_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_export_requests_status ON data_export_requests(status);

-- RLS
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own export requests" ON data_export_requests;
CREATE POLICY "Users can manage own export requests" ON data_export_requests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. TABELLA RICHIESTE CANCELLAZIONE
-- ============================================================================

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'confirmed', 'cancelled', 'completed'

  -- Scheduling
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  reason TEXT,
  confirmation_token VARCHAR(100),

  -- Constraint
  CONSTRAINT valid_deletion_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Index
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled ON deletion_requests(scheduled_deletion_at);

-- RLS
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own deletion requests" ON deletion_requests;
CREATE POLICY "Users can manage own deletion requests" ON deletion_requests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. FUNZIONE PER RIMUOVERE CAMPI SANITARI DA JSONB
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_health_fields_from_jsonb(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  current_data JSONB;
  health_fields TEXT[] := ARRAY[
    'pain_areas',
    'pain_intensity',
    'injury_history',
    'menstrual_cycle',
    'body_fat_percentage',
    'medical_conditions',
    'physical_limitations',
    'disability_type',
    'pregnancy_status',
    'medications'
  ];
  field TEXT;
BEGIN
  -- Ottieni dati attuali
  SELECT onboarding_data INTO current_data
  FROM user_profiles
  WHERE user_id = user_id_param;

  IF current_data IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Rimuovi ogni campo sanitario
  FOREACH field IN ARRAY health_fields
  LOOP
    current_data := current_data - field;
  END LOOP;

  RETURN current_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. FUNZIONE PER DATA RETENTION CLEANUP (da chiamare via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION run_data_retention_cleanup()
RETURNS TABLE (
  data_type TEXT,
  records_deleted BIGINT,
  records_anonymized BIGINT
) AS $$
DECLARE
  cutoff_pain TIMESTAMPTZ := NOW() - INTERVAL '365 days';
  cutoff_body TIMESTAMPTZ := NOW() - INTERVAL '365 days';
  cutoff_menstrual TIMESTAMPTZ := NOW() - INTERVAL '180 days';
  cutoff_logs TIMESTAMPTZ := NOW() - INTERVAL '90 days';
  deleted_count BIGINT;
  anonymized_count BIGINT;
BEGIN
  -- Pain reports (cancella dopo 1 anno)
  -- Only run if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pain_reports') THEN
    DELETE FROM pain_reports WHERE created_at < cutoff_pain;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'pain_reports'::TEXT, deleted_count, 0::BIGINT;
  END IF;

  -- Body measurements (cancella dopo 1 anno)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'body_measurements') THEN
    DELETE FROM body_measurements WHERE created_at < cutoff_body;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'body_measurements'::TEXT, deleted_count, 0::BIGINT;
  END IF;

  -- Menstrual tracking (cancella dopo 6 mesi)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'menstrual_tracking') THEN
    DELETE FROM menstrual_tracking WHERE created_at < cutoff_menstrual;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'menstrual_tracking'::TEXT, deleted_count, 0::BIGINT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. FUNZIONE PER PROCESSARE CANCELLAZIONI PROGRAMMATE
-- ============================================================================

CREATE OR REPLACE FUNCTION process_scheduled_deletions()
RETURNS TABLE (
  user_id_deleted UUID,
  status TEXT
) AS $$
DECLARE
  req RECORD;
  tables_to_delete TEXT[] := ARRAY[
    'workout_sessions',
    'pain_reports',
    'body_measurements',
    'menstrual_tracking',
    'injury_history',
    'assessments',
    'training_programs',
    'achievements',
    'user_consents',
    'user_profiles'
  ];
  tbl TEXT;
BEGIN
  -- Trova richieste confermate e scadute
  FOR req IN
    SELECT * FROM deletion_requests
    WHERE status = 'confirmed'
    AND scheduled_deletion_at <= NOW()
  LOOP
    BEGIN
      -- Cancella da ogni tabella (solo se esiste)
      FOREACH tbl IN ARRAY tables_to_delete
      LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = tbl) THEN
          EXECUTE format('DELETE FROM %I WHERE user_id = $1', tbl) USING req.user_id;
        END IF;
      END LOOP;

      -- Aggiorna status
      UPDATE deletion_requests
      SET status = 'completed', completed_at = NOW()
      WHERE request_id = req.request_id;

      RETURN QUERY SELECT req.user_id, 'deleted'::TEXT;

    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT req.user_id, ('error: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Per service role (backend)
GRANT ALL ON user_consents TO service_role;
GRANT ALL ON consent_audit_log TO service_role;
GRANT ALL ON data_export_requests TO service_role;
GRANT ALL ON deletion_requests TO service_role;

-- Per authenticated users (via RLS)
GRANT SELECT, INSERT, UPDATE ON user_consents TO authenticated;
GRANT SELECT, INSERT ON consent_audit_log TO authenticated;
GRANT SELECT, INSERT ON data_export_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON deletion_requests TO authenticated;

-- ============================================================================
-- VERIFICA INSTALLAZIONE
-- ============================================================================

-- Esegui per verificare che tutto sia stato creato:
-- SELECT
--   table_name,
--   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
-- FROM information_schema.tables t
-- WHERE table_schema = 'public'
-- AND table_name IN (
--   'user_consents',
--   'consent_audit_log',
--   'data_export_requests',
--   'deletion_requests'
-- );
