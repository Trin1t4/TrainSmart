-- ================================================================
-- RIR SAFETY ALERTS
-- Traccia quando l'utente supera i limiti RIR prescritti
-- Utile per: coaching, identificare pattern, prevenire infortuni
-- ================================================================

CREATE TABLE IF NOT EXISTS rir_safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,

  -- Contesto esercizio
  exercise_name TEXT NOT NULL,
  exercise_pattern TEXT,
  set_number INTEGER NOT NULL,

  -- Dati RIR
  target_rir INTEGER NOT NULL,
  actual_rir INTEGER NOT NULL,
  rir_delta INTEGER GENERATED ALWAYS AS (actual_rir - target_rir) STORED,

  -- Dati performance
  target_reps INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  weight_used DECIMAL(6,2),

  -- Severita e azione
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  auto_adjustment_applied BOOLEAN DEFAULT FALSE,
  adjustment_details JSONB, -- { old_weight, new_weight, reduction_percent }

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  notes TEXT
);

-- Indici per query frequenti
CREATE INDEX IF NOT EXISTS idx_rir_alerts_user ON rir_safety_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_rir_alerts_user_date ON rir_safety_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rir_alerts_severity ON rir_safety_alerts(user_id, severity);
CREATE INDEX IF NOT EXISTS idx_rir_alerts_exercise ON rir_safety_alerts(user_id, exercise_name);

-- RLS
ALTER TABLE rir_safety_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON rir_safety_alerts;
CREATE POLICY "Users can view own alerts"
  ON rir_safety_alerts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON rir_safety_alerts;
CREATE POLICY "Users can insert own alerts"
  ON rir_safety_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON rir_safety_alerts;
CREATE POLICY "Users can update own alerts"
  ON rir_safety_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- FUNZIONE: Conta alert recenti per utente/esercizio
-- Utile per identificare pattern problematici
-- ================================================================

CREATE OR REPLACE FUNCTION get_rir_alert_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_alerts INTEGER,
  critical_alerts INTEGER,
  warning_alerts INTEGER,
  most_problematic_exercise TEXT,
  most_problematic_count INTEGER,
  avg_rir_delta DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE severity = 'critical')::INTEGER as critical,
      COUNT(*) FILTER (WHERE severity = 'warning')::INTEGER as warning,
      AVG(rir_delta)::DECIMAL as avg_delta
    FROM rir_safety_alerts
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ),
  problematic AS (
    SELECT
      exercise_name,
      COUNT(*)::INTEGER as cnt
    FROM rir_safety_alerts
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY exercise_name
    ORDER BY cnt DESC
    LIMIT 1
  )
  SELECT
    s.total,
    s.critical,
    s.warning,
    p.exercise_name,
    p.cnt,
    s.avg_delta
  FROM stats s
  LEFT JOIN problematic p ON TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNZIONE: Check se utente ha pattern problematico
-- Ritorna true se troppi alert critici recenti
-- ================================================================

CREATE OR REPLACE FUNCTION check_rir_safety_pattern(
  p_user_id UUID,
  p_exercise_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  has_problem BOOLEAN,
  alert_count INTEGER,
  recommendation TEXT
) AS $$
DECLARE
  v_critical_count INTEGER;
  v_recent_count INTEGER;
BEGIN
  -- Conta alert critici ultimi 14 giorni
  SELECT COUNT(*) INTO v_critical_count
  FROM rir_safety_alerts
  WHERE user_id = p_user_id
    AND severity = 'critical'
    AND created_at > NOW() - INTERVAL '14 days'
    AND (p_exercise_name IS NULL OR exercise_name = p_exercise_name);

  -- Conta alert totali ultimi 7 giorni
  SELECT COUNT(*) INTO v_recent_count
  FROM rir_safety_alerts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '7 days'
    AND (p_exercise_name IS NULL OR exercise_name = p_exercise_name);

  RETURN QUERY
  SELECT
    (v_critical_count >= 3 OR v_recent_count >= 5) as has_problem,
    v_recent_count as alert_count,
    CASE
      WHEN v_critical_count >= 3 THEN 'Pattern critico rilevato. Considera una revisione dei carichi con un professionista.'
      WHEN v_recent_count >= 5 THEN 'Stai spesso superando i limiti RIR. Prova a ridurre i carichi del 10%.'
      ELSE 'Nessun pattern problematico rilevato.'
    END as recommendation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
