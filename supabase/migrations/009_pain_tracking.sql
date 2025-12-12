/**
 * SUPABASE MIGRATION - PAIN TRACKING SYSTEM
 *
 * Sistema intelligente per recupero motorio:
 * - Traccia dolore in tempo reale durante workout
 * - Memorizza soglie sicure per ogni esercizio
 * - Auto-adatta carico/reps/ROM in base a feedback
 * - Progressione automatica quando assenza dolore
 */

-- ============================================================================
-- 1. PAIN LOGS - Log dettagliato di ogni set con dolore
-- ============================================================================

CREATE TABLE IF NOT EXISTS pain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID, -- Riferimento al programma corrente
  exercise_name TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  day_name TEXT, -- es: "Push A", "Lower B"

  -- Dati set
  set_number INT NOT NULL,
  weight_used DECIMAL(6,2), -- Peso in kg (NULL per bodyweight)
  reps_completed INT NOT NULL,
  rom_percentage INT DEFAULT 100, -- 100 = full ROM, 50 = half ROM, etc

  -- Feedback utente
  pain_level INT NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  rpe INT CHECK (rpe >= 1 AND rpe <= 10),
  pain_location TEXT, -- "lower_back", "knee", "shoulder", etc

  -- Adattamenti applicati
  adaptations JSONB DEFAULT '[]'::jsonb,
  -- Esempio: [{"type": "weight_reduced", "from": 60, "to": 48, "reason": "pain_4"}]

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_pain_logs_user_exercise ON pain_logs(user_id, exercise_name);
CREATE INDEX idx_pain_logs_session_date ON pain_logs(session_date DESC);
CREATE INDEX idx_pain_logs_pain_level ON pain_logs(pain_level) WHERE pain_level > 3;

-- ============================================================================
-- 2. PAIN THRESHOLDS - Soglie sicure memorizzate per esercizio
-- ============================================================================

CREATE TABLE IF NOT EXISTS pain_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,

  -- Parametri sicuri (ultimi valori senza dolore significativo)
  last_safe_weight DECIMAL(6,2),
  last_safe_reps INT,
  last_safe_rom INT DEFAULT 100, -- Percentuale ROM sicuro

  -- Tracking progressione
  last_session_date TIMESTAMP WITH TIME ZONE,
  consecutive_pain_free_sessions INT DEFAULT 0,
  total_sessions INT DEFAULT 0,

  -- Storico dolore
  max_pain_recorded INT DEFAULT 0,
  last_pain_level INT DEFAULT 0,
  last_pain_date TIMESTAMP WITH TIME ZONE,

  -- Flag per alert
  needs_physiotherapist_contact BOOLEAN DEFAULT FALSE,
  physiotherapist_contacted_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint per evitare duplicati
  UNIQUE(user_id, exercise_name)
);

-- Indici per performance
CREATE INDEX idx_pain_thresholds_user ON pain_thresholds(user_id);
CREATE INDEX idx_pain_thresholds_needs_contact ON pain_thresholds(needs_physiotherapist_contact)
  WHERE needs_physiotherapist_contact = TRUE;

-- ============================================================================
-- 3. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE pain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_thresholds ENABLE ROW LEVEL SECURITY;

-- Pain Logs Policies
CREATE POLICY "Users can view their own pain logs"
  ON pain_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain logs"
  ON pain_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pain logs"
  ON pain_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Pain Thresholds Policies
CREATE POLICY "Users can view their own pain thresholds"
  ON pain_thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain thresholds"
  ON pain_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pain thresholds"
  ON pain_thresholds FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. FUNCTIONS - Helper per calcoli e aggiornamenti
-- ============================================================================

-- Funzione per aggiornare pain_thresholds dopo ogni sessione
CREATE OR REPLACE FUNCTION update_pain_threshold_after_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Se dolore basso (0-3), aggiorna soglia sicura
  IF NEW.pain_level <= 3 THEN
    INSERT INTO pain_thresholds (
      user_id,
      exercise_name,
      last_safe_weight,
      last_safe_reps,
      last_safe_rom,
      last_session_date,
      consecutive_pain_free_sessions,
      total_sessions,
      last_pain_level,
      updated_at
    ) VALUES (
      NEW.user_id,
      NEW.exercise_name,
      NEW.weight_used,
      NEW.reps_completed,
      NEW.rom_percentage,
      NEW.session_date,
      1,
      1,
      NEW.pain_level,
      NOW()
    )
    ON CONFLICT (user_id, exercise_name)
    DO UPDATE SET
      last_safe_weight = CASE
        WHEN NEW.pain_level = 0 THEN NEW.weight_used
        ELSE pain_thresholds.last_safe_weight
      END,
      last_safe_reps = CASE
        WHEN NEW.pain_level = 0 THEN NEW.reps_completed
        ELSE pain_thresholds.last_safe_reps
      END,
      last_safe_rom = CASE
        WHEN NEW.pain_level = 0 THEN NEW.rom_percentage
        ELSE pain_thresholds.last_safe_rom
      END,
      last_session_date = NEW.session_date,
      consecutive_pain_free_sessions = CASE
        WHEN NEW.pain_level = 0 THEN pain_thresholds.consecutive_pain_free_sessions + 1
        ELSE pain_thresholds.consecutive_pain_free_sessions
      END,
      total_sessions = pain_thresholds.total_sessions + 1,
      last_pain_level = NEW.pain_level,
      updated_at = NOW();

  -- Se dolore alto (4+), marca per alert
  ELSIF NEW.pain_level >= 4 THEN
    INSERT INTO pain_thresholds (
      user_id,
      exercise_name,
      last_session_date,
      consecutive_pain_free_sessions,
      total_sessions,
      max_pain_recorded,
      last_pain_level,
      last_pain_date,
      needs_physiotherapist_contact,
      updated_at
    ) VALUES (
      NEW.user_id,
      NEW.exercise_name,
      NEW.session_date,
      0, -- Reset consecutive pain-free
      1,
      NEW.pain_level,
      NEW.pain_level,
      NEW.session_date,
      NEW.pain_level >= 7, -- Alert se dolore ≥7
      NOW()
    )
    ON CONFLICT (user_id, exercise_name)
    DO UPDATE SET
      consecutive_pain_free_sessions = 0, -- Reset
      total_sessions = pain_thresholds.total_sessions + 1,
      max_pain_recorded = GREATEST(pain_thresholds.max_pain_recorded, NEW.pain_level),
      last_pain_level = NEW.pain_level,
      last_pain_date = NEW.session_date,
      last_session_date = NEW.session_date,
      needs_physiotherapist_contact = CASE
        WHEN NEW.pain_level >= 7 THEN TRUE
        ELSE pain_thresholds.needs_physiotherapist_contact
      END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornamento automatico
CREATE TRIGGER trigger_update_pain_threshold
  AFTER INSERT ON pain_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_pain_threshold_after_session();

-- ============================================================================
-- 5. VIEWS - Viste utili per dashboard e report
-- ============================================================================

-- Vista: Esercizi con alert attivi
CREATE OR REPLACE VIEW exercises_needing_attention AS
SELECT
  pt.user_id,
  pt.exercise_name,
  pt.last_pain_level,
  pt.last_pain_date,
  pt.max_pain_recorded,
  pt.consecutive_pain_free_sessions,
  pt.needs_physiotherapist_contact
FROM pain_thresholds pt
WHERE pt.last_pain_level >= 4
   OR pt.needs_physiotherapist_contact = TRUE
ORDER BY pt.last_pain_date DESC;

-- Vista: Progressione esercizi senza dolore
CREATE OR REPLACE VIEW exercises_ready_for_progression AS
SELECT
  pt.user_id,
  pt.exercise_name,
  pt.last_safe_weight,
  pt.last_safe_reps,
  pt.consecutive_pain_free_sessions,
  pt.last_session_date
FROM pain_thresholds pt
WHERE pt.consecutive_pain_free_sessions >= 2
  AND pt.last_pain_level <= 3
ORDER BY pt.consecutive_pain_free_sessions DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Le policies RLS gestiscono già i permessi, ma per sicurezza:
GRANT SELECT, INSERT, UPDATE ON pain_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pain_thresholds TO authenticated;
GRANT SELECT ON exercises_needing_attention TO authenticated;
GRANT SELECT ON exercises_ready_for_progression TO authenticated;

-- ============================================================================
-- COMMENTS per documentazione
-- ============================================================================

COMMENT ON TABLE pain_logs IS 'Log dettagliato dolore per ogni set durante allenamento';
COMMENT ON TABLE pain_thresholds IS 'Soglie sicure memorizzate per ogni esercizio per recupero motorio';
COMMENT ON COLUMN pain_logs.pain_level IS 'Scala 0-10: 0-3 OK, 4-6 riduci carico/reps, 7-10 stop';
COMMENT ON COLUMN pain_thresholds.consecutive_pain_free_sessions IS 'Numero sessioni consecutive senza dolore (per auto-progressione)';
COMMENT ON FUNCTION update_pain_threshold_after_session IS 'Aggiorna automaticamente soglie sicure dopo ogni set logged';
