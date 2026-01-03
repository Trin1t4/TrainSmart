-- =====================================================
-- FEATURE FLAGS SYSTEM
-- Sistema centralizzato per gestire accesso feature per tier
-- =====================================================

-- =====================================================
-- 1. TABELLA FEATURES
-- Definisce tutte le feature disponibili nell'app
-- =====================================================
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificatori
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Tier minimo richiesto
  -- 'base' = disponibile a tutti gli abbonati
  -- 'premium' = richiede premium o elite
  -- 'elite' = solo elite
  min_tier VARCHAR(20) NOT NULL DEFAULT 'base'
    CHECK (min_tier IN ('base', 'premium', 'elite')),

  -- Global toggle - se false, feature disabilitata per tutti
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Categorizzazione
  category VARCHAR(50),

  -- Metadata opzionale
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_features_key ON features(key);
CREATE INDEX IF NOT EXISTS idx_features_min_tier ON features(min_tier);
CREATE INDEX IF NOT EXISTS idx_features_category ON features(category);
CREATE INDEX IF NOT EXISTS idx_features_enabled ON features(is_enabled);

-- =====================================================
-- 2. TABELLA FEATURE OVERRIDES
-- Override specifici per utente (es. beta testers, promo)
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,

  -- Tipo di override
  override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('grant', 'revoke')),

  -- Scadenza opzionale (per promo temporanee)
  expires_at TIMESTAMPTZ,

  -- Metadata
  reason TEXT,
  granted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un solo override per user/feature
  CONSTRAINT unique_user_feature_override UNIQUE (user_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_overrides_user ON feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_overrides_feature ON feature_overrides(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_overrides_expires ON feature_overrides(expires_at);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_overrides ENABLE ROW LEVEL SECURITY;

-- Features: tutti possono leggere (per UI)
DROP POLICY IF EXISTS "Anyone can read features" ON features;
CREATE POLICY "Anyone can read features"
  ON features FOR SELECT
  USING (true);

-- Features: solo admin possono modificare
DROP POLICY IF EXISTS "Admins can manage features" ON features;
CREATE POLICY "Admins can manage features"
  ON features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Overrides: utenti vedono solo i propri
DROP POLICY IF EXISTS "Users can view own overrides" ON feature_overrides;
CREATE POLICY "Users can view own overrides"
  ON feature_overrides FOR SELECT
  USING (auth.uid() = user_id);

-- Overrides: admin possono vedere/gestire tutti
DROP POLICY IF EXISTS "Admins can manage all overrides" ON feature_overrides;
CREATE POLICY "Admins can manage all overrides"
  ON feature_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 4. RPC FUNCTION: check_feature_access
-- Verifica se utente ha accesso a una feature
-- =====================================================
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_key VARCHAR(100)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feature RECORD;
  v_override RECORD;
  v_user_tier VARCHAR(20);
  v_tier_order INTEGER;
  v_min_tier_order INTEGER;
BEGIN
  -- 1. Ottieni la feature
  SELECT id, min_tier, is_enabled
  INTO v_feature
  FROM features
  WHERE key = p_feature_key;

  -- Feature non trovata = accesso negato
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Feature disabilitata globalmente = accesso negato
  IF NOT v_feature.is_enabled THEN
    RETURN FALSE;
  END IF;

  -- 2. Controlla override specifico per utente
  SELECT override_type
  INTO v_override
  FROM feature_overrides
  WHERE user_id = p_user_id
    AND feature_id = v_feature.id
    AND (expires_at IS NULL OR expires_at > NOW());

  IF FOUND THEN
    IF v_override.override_type = 'grant' THEN
      RETURN TRUE;
    ELSIF v_override.override_type = 'revoke' THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- 3. Controlla tier utente dalla subscription
  SELECT tier INTO v_user_tier
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND expires_at > NOW();

  -- No subscription attiva = solo feature 'base' se tier = 'base'
  IF NOT FOUND THEN
    RETURN v_feature.min_tier = 'base';
  END IF;

  -- 4. Confronta tier (base < premium < elite)
  v_tier_order := CASE v_user_tier
    WHEN 'base' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'pro' THEN 2  -- pro = premium
    WHEN 'elite' THEN 3
    ELSE 0
  END;

  v_min_tier_order := CASE v_feature.min_tier
    WHEN 'base' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'elite' THEN 3
    ELSE 99
  END;

  -- Accesso se tier utente >= tier minimo feature
  RETURN v_tier_order >= v_min_tier_order;
END;
$$;

-- =====================================================
-- 5. RPC FUNCTION: get_user_features
-- Ritorna tutte le feature con stato accesso per utente
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_features(p_user_id UUID)
RETURNS TABLE (
  key VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  min_tier VARCHAR(20),
  has_access BOOLEAN,
  access_reason VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.key,
    f.name,
    f.description,
    f.category,
    f.min_tier,
    check_feature_access(p_user_id, f.key) as has_access,
    CASE
      WHEN NOT f.is_enabled THEN 'disabled'::VARCHAR(50)
      WHEN EXISTS (
        SELECT 1 FROM feature_overrides fo
        WHERE fo.user_id = p_user_id
          AND fo.feature_id = f.id
          AND fo.override_type = 'grant'
          AND (fo.expires_at IS NULL OR fo.expires_at > NOW())
      ) THEN 'override_grant'::VARCHAR(50)
      WHEN EXISTS (
        SELECT 1 FROM feature_overrides fo
        WHERE fo.user_id = p_user_id
          AND fo.feature_id = f.id
          AND fo.override_type = 'revoke'
          AND (fo.expires_at IS NULL OR fo.expires_at > NOW())
      ) THEN 'override_revoke'::VARCHAR(50)
      ELSE 'tier'::VARCHAR(50)
    END as access_reason
  FROM features f
  ORDER BY f.category, f.name;
END;
$$;

-- =====================================================
-- 6. ADMIN RPC FUNCTIONS
-- =====================================================

-- Lista tutte le features (admin)
CREATE OR REPLACE FUNCTION admin_list_features()
RETURNS TABLE (
  id UUID,
  key VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  min_tier VARCHAR(20),
  is_enabled BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  override_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    f.id,
    f.key,
    f.name,
    f.description,
    f.category,
    f.min_tier,
    f.is_enabled,
    f.metadata,
    f.created_at,
    f.updated_at,
    (SELECT COUNT(*) FROM feature_overrides WHERE feature_id = f.id) as override_count
  FROM features f
  ORDER BY f.category, f.name;
END;
$$;

-- Toggle enable/disable feature
CREATE OR REPLACE FUNCTION admin_toggle_feature(
  p_feature_key VARCHAR(100),
  p_enabled BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE features
  SET is_enabled = p_enabled, updated_at = NOW()
  WHERE key = p_feature_key;

  RETURN FOUND;
END;
$$;

-- Cambia min_tier feature
CREATE OR REPLACE FUNCTION admin_set_feature_tier(
  p_feature_key VARCHAR(100),
  p_min_tier VARCHAR(20)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Valida tier
  IF p_min_tier NOT IN ('base', 'premium', 'elite') THEN
    RAISE EXCEPTION 'Invalid tier: %', p_min_tier;
  END IF;

  UPDATE features
  SET min_tier = p_min_tier, updated_at = NOW()
  WHERE key = p_feature_key;

  RETURN FOUND;
END;
$$;

-- Crea/modifica override per utente
CREATE OR REPLACE FUNCTION admin_set_feature_override(
  p_user_id UUID,
  p_feature_key VARCHAR(100),
  p_override_type VARCHAR(20),
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feature_id UUID;
BEGIN
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get feature ID
  SELECT id INTO v_feature_id FROM features WHERE key = p_feature_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Feature not found: %', p_feature_key;
  END IF;

  -- Se override_type NULL, rimuovi override
  IF p_override_type IS NULL THEN
    DELETE FROM feature_overrides
    WHERE user_id = p_user_id AND feature_id = v_feature_id;
    RETURN TRUE;
  END IF;

  -- Valida override_type
  IF p_override_type NOT IN ('grant', 'revoke') THEN
    RAISE EXCEPTION 'Invalid override type: %', p_override_type;
  END IF;

  -- Upsert override
  INSERT INTO feature_overrides (user_id, feature_id, override_type, expires_at, reason, granted_by)
  VALUES (p_user_id, v_feature_id, p_override_type, p_expires_at, p_reason, auth.uid())
  ON CONFLICT (user_id, feature_id)
  DO UPDATE SET
    override_type = p_override_type,
    expires_at = p_expires_at,
    reason = p_reason,
    granted_by = auth.uid();

  RETURN TRUE;
END;
$$;

-- Crea nuova feature (admin)
CREATE OR REPLACE FUNCTION admin_create_feature(
  p_key VARCHAR(100),
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_min_tier VARCHAR(20) DEFAULT 'base',
  p_category VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feature_id UUID;
BEGIN
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Valida tier
  IF p_min_tier NOT IN ('base', 'premium', 'elite') THEN
    RAISE EXCEPTION 'Invalid tier: %', p_min_tier;
  END IF;

  INSERT INTO features (key, name, description, min_tier, category, metadata)
  VALUES (p_key, p_name, p_description, p_min_tier, p_category, p_metadata)
  RETURNING id INTO v_feature_id;

  RETURN v_feature_id;
END;
$$;

-- =====================================================
-- 7. SEED INITIAL FEATURES
-- =====================================================
INSERT INTO features (key, name, description, min_tier, category, metadata) VALUES
  -- Training Features (base)
  ('training_programs', 'Programmi Allenamento', 'Accesso ai programmi di allenamento personalizzati', 'base', 'training', '{}'),
  ('pain_management', 'Gestione Dolore', 'Sistema di tracking e gestione zone doloranti', 'base', 'training', '{}'),
  ('auto_regulation', 'Autoregolazione RPE', 'Adattamento automatico carichi basato su RPE', 'base', 'training', '{}'),
  ('workout_tracking', 'Tracking Allenamenti', 'Salvataggio e storico allenamenti', 'base', 'training', '{}'),

  -- Analytics (base/premium)
  ('basic_stats', 'Statistiche Base', 'Visualizzazione progressi e storico', 'base', 'analytics', '{}'),
  ('advanced_analytics', 'Analytics Avanzate', 'Report dettagliati e insights', 'premium', 'analytics', '{}'),
  ('weekly_reports', 'Report Settimanali', 'Report personalizzati settimanali via email', 'premium', 'analytics', '{}'),

  -- AI Features (premium)
  ('video_corrections', 'Correzioni Video AI', 'Analisi video esercizi con feedback AI', 'premium', 'ai', '{"weekly_limit": 2}'),
  ('photo_analysis', 'Analisi Foto Composizione', 'Analisi body composition da foto', 'premium', 'ai', '{}'),

  -- Social (base)
  ('community_access', 'Accesso Community', 'Partecipazione alla community', 'base', 'social', '{}'),
  ('achievements', 'Sistema Achievements', 'Obiettivi e badge', 'base', 'social', '{}'),
  ('leaderboards', 'Classifiche', 'Accesso alle classifiche', 'base', 'social', '{}'),

  -- Support (elite)
  ('priority_support', 'Supporto Prioritario', 'Accesso prioritario al supporto', 'elite', 'support', '{}'),
  ('coach_consultations', 'Consulenze Coach', 'Consultazioni mensili con coach', 'elite', 'support', '{}'),

  -- Beta/Future (elite)
  ('early_access', 'Early Access', 'Accesso anticipato nuove funzionalita', 'elite', 'beta', '{}'),
  ('beta_features', 'Beta Features', 'Accesso a funzionalita in beta', 'elite', 'beta', '{}')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_feature_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_features TO authenticated;
GRANT EXECUTE ON FUNCTION admin_list_features TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_feature TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_feature_tier TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_feature_override TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_feature TO authenticated;

-- =====================================================
-- SUCCESS
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Feature Flags Migration completata!';
  RAISE NOTICE 'Tabelle: features, feature_overrides';
  RAISE NOTICE 'RPC: check_feature_access, get_user_features, admin_*';
END $$;
