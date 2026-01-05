-- ================================================================
-- EXERCISE MODIFICATIONS TABLE
-- Traccia modifiche persistenti agli esercizi tra sessioni:
-- - Downgrade varianti (RIR troppo basso)
-- - Upgrade varianti (RIR troppo alto)
-- - TUT modifier attivi
-- - Weight adjustments
-- ================================================================

CREATE TABLE IF NOT EXISTS exercise_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL DEFAULT 1,

  -- Identificazione esercizio
  exercise_name TEXT NOT NULL,
  exercise_pattern TEXT,

  -- Variante
  original_variant TEXT,
  current_variant TEXT NOT NULL,
  variant_changed BOOLEAN DEFAULT FALSE,

  -- Tempo/TUT
  original_tempo TEXT DEFAULT '2-0-1-0',
  current_tempo TEXT DEFAULT '2-0-1-0',
  tempo_modifier_id TEXT,
  tempo_changed BOOLEAN DEFAULT FALSE,

  -- Peso
  original_weight DECIMAL(6,2),
  current_weight DECIMAL(6,2),
  weight_reduction_percent INTEGER,

  -- Reps
  original_reps INTEGER,
  current_reps INTEGER,

  -- Motivo e tracking
  reason TEXT NOT NULL CHECK (reason IN (
    'rir_exceeded_downgrade',
    'rir_high_add_tut',
    'rir_high_upgrade',
    'user_request',
    'pain_adaptation'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  rir_target INTEGER,
  rir_actual INTEGER,

  -- Stato
  is_active BOOLEAN DEFAULT TRUE,
  applied_count INTEGER DEFAULT 0,
  last_applied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query frequenti
CREATE INDEX IF NOT EXISTS idx_exercise_mods_user_program
ON exercise_modifications(user_id, program_id, is_active);

CREATE INDEX IF NOT EXISTS idx_exercise_mods_exercise
ON exercise_modifications(user_id, program_id, exercise_name, is_active);

CREATE INDEX IF NOT EXISTS idx_exercise_mods_active
ON exercise_modifications(user_id, is_active)
WHERE is_active = TRUE;

-- RLS
ALTER TABLE exercise_modifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own modifications" ON exercise_modifications;
CREATE POLICY "Users can view own modifications"
  ON exercise_modifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own modifications" ON exercise_modifications;
CREATE POLICY "Users can insert own modifications"
  ON exercise_modifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own modifications" ON exercise_modifications;
CREATE POLICY "Users can update own modifications"
  ON exercise_modifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own modifications" ON exercise_modifications;
CREATE POLICY "Users can delete own modifications"
  ON exercise_modifications FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- FUNZIONE: Ottieni modifiche attive per un workout
-- ================================================================

CREATE OR REPLACE FUNCTION get_workout_modifications(
  p_user_id UUID,
  p_program_id UUID
)
RETURNS TABLE (
  exercise_name TEXT,
  current_variant TEXT,
  tempo_modifier_id TEXT,
  current_tempo TEXT,
  current_weight DECIMAL,
  current_reps INTEGER,
  has_tut BOOLEAN,
  has_variant_change BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    em.exercise_name,
    em.current_variant,
    em.tempo_modifier_id,
    em.current_tempo,
    em.current_weight,
    em.current_reps,
    (em.tempo_changed AND em.tempo_modifier_id IS NOT NULL AND em.tempo_modifier_id != 'standard') as has_tut,
    em.variant_changed as has_variant_change
  FROM exercise_modifications em
  WHERE em.user_id = p_user_id
    AND em.program_id = p_program_id
    AND em.is_active = TRUE
  ORDER BY em.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNZIONE: Conta modifiche attive per utente
-- ================================================================

CREATE OR REPLACE FUNCTION count_active_modifications(
  p_user_id UUID,
  p_program_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_count INTEGER,
  with_tut_count INTEGER,
  downgrade_count INTEGER,
  upgrade_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_count,
    COUNT(*) FILTER (WHERE tempo_changed AND tempo_modifier_id IS NOT NULL AND tempo_modifier_id != 'standard')::INTEGER as with_tut_count,
    COUNT(*) FILTER (WHERE reason = 'rir_exceeded_downgrade')::INTEGER as downgrade_count,
    COUNT(*) FILTER (WHERE reason IN ('rir_high_add_tut', 'rir_high_upgrade'))::INTEGER as upgrade_count
  FROM exercise_modifications
  WHERE user_id = p_user_id
    AND (p_program_id IS NULL OR program_id = p_program_id)
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- TRIGGER: Aggiorna updated_at automaticamente
-- ================================================================

CREATE OR REPLACE FUNCTION update_exercise_modification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exercise_modifications_updated_at ON exercise_modifications;
CREATE TRIGGER exercise_modifications_updated_at
  BEFORE UPDATE ON exercise_modifications
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_modification_timestamp();

-- ================================================================
-- COMMENTI
-- ================================================================

COMMENT ON TABLE exercise_modifications IS 'Traccia modifiche persistenti agli esercizi (downgrade/upgrade/TUT)';
COMMENT ON COLUMN exercise_modifications.tempo_modifier_id IS 'ID del tempo modifier: standard, slow_eccentric, slow_both, pause_bottom, etc.';
COMMENT ON COLUMN exercise_modifications.reason IS 'Motivo della modifica: rir_exceeded_downgrade (troppo difficile), rir_high_add_tut (facile, aggiungi TUT), rir_high_upgrade (facile con TUT, upgrade)';
