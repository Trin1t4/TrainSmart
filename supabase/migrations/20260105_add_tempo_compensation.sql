-- ================================================================
-- TEMPO / TUT COMPENSATION TRACKING
-- Aggiunge il tracking dei tempo modifier applicati per compensare
-- riduzioni di peso o downgrade di varianti
-- ================================================================

-- Aggiungi colonne per il tempo a rir_safety_alerts
ALTER TABLE rir_safety_alerts
ADD COLUMN IF NOT EXISTS tempo_applied TEXT,          -- ID del tempo modifier (es: 'slow_eccentric')
ADD COLUMN IF NOT EXISTS tempo_notation TEXT,         -- Formato "E-PB-C-PA" (es: "4-0-1-0")
ADD COLUMN IF NOT EXISTS tut_per_rep INTEGER,         -- Secondi totali per rep
ADD COLUMN IF NOT EXISTS compensation_level TEXT;     -- 'light', 'moderate', 'heavy'

-- Aggiungi constraint per compensation_level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_compensation_level'
  ) THEN
    ALTER TABLE rir_safety_alerts
    ADD CONSTRAINT valid_compensation_level
    CHECK (compensation_level IS NULL OR compensation_level IN ('light', 'moderate', 'heavy'));
  END IF;
END $$;

-- Commenti per documentazione
COMMENT ON COLUMN rir_safety_alerts.tempo_applied IS 'ID del tempo modifier applicato (standard, slow_eccentric, slow_both, pause_bottom, etc.)';
COMMENT ON COLUMN rir_safety_alerts.tempo_notation IS 'Formato tempo: ECCENTRICA-PAUSA_BASSO-CONCENTRICA-PAUSA_ALTO (es: 4-0-1-0)';
COMMENT ON COLUMN rir_safety_alerts.tut_per_rep IS 'Tempo totale sotto tensione per ripetizione in secondi';
COMMENT ON COLUMN rir_safety_alerts.compensation_level IS 'Livello di compensazione: light (5-10%), moderate (10-15%), heavy (>15%)';

-- ================================================================
-- AGGIUNGI COLONNE A EXERCISE_LOGS PER TRACKING TEMPO USATO
-- ================================================================

ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS tempo_used TEXT,             -- Formato "E-PB-C-PA" usato in questa serie
ADD COLUMN IF NOT EXISTS tut_total INTEGER;           -- TUT totale per la serie (secondi)

-- ================================================================
-- FUNZIONE: Analisi TUT/Tempo per esercizio
-- Ritorna stats sull'uso del tempo per un esercizio specifico
-- ================================================================

CREATE OR REPLACE FUNCTION get_exercise_tempo_stats(
  p_user_id UUID,
  p_exercise_name TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  sessions_with_tempo INTEGER,
  total_sessions INTEGER,
  avg_tut_per_rep DECIMAL,
  most_used_tempo TEXT,
  compensation_triggered_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH tempo_data AS (
    SELECT
      el.tempo_used,
      el.tut_total,
      wl.id as workout_id
    FROM exercise_logs el
    JOIN workout_logs wl ON el.workout_log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND el.exercise_name = p_exercise_name
      AND wl.workout_date > NOW() - (p_days || ' days')::INTERVAL
  ),
  alert_data AS (
    SELECT COUNT(*) as alert_count
    FROM rir_safety_alerts
    WHERE user_id = p_user_id
      AND exercise_name = p_exercise_name
      AND tempo_applied IS NOT NULL
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ),
  tempo_ranking AS (
    SELECT tempo_used, COUNT(*) as cnt
    FROM tempo_data
    WHERE tempo_used IS NOT NULL
    GROUP BY tempo_used
    ORDER BY cnt DESC
    LIMIT 1
  )
  SELECT
    COUNT(*) FILTER (WHERE td.tempo_used IS NOT NULL)::INTEGER as sessions_with_tempo,
    COUNT(DISTINCT td.workout_id)::INTEGER as total_sessions,
    AVG(td.tut_total / NULLIF(el.reps_completed, 0))::DECIMAL as avg_tut_per_rep,
    tr.tempo_used as most_used_tempo,
    ad.alert_count::INTEGER as compensation_triggered_count
  FROM tempo_data td
  CROSS JOIN alert_data ad
  LEFT JOIN tempo_ranking tr ON TRUE
  LEFT JOIN exercise_logs el ON TRUE
  GROUP BY tr.tempo_used, ad.alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
