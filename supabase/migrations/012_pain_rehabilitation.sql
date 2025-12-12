-- =============================================
-- PAIN TRACKING & REHABILITATION SYSTEM
-- Sistema di rieducazione motoria parallela
-- =============================================

-- Tabella per tracciare dolori segnalati post-workout
-- Trigger rieducazione dopo 2 sessioni consecutive con dolore
CREATE TABLE IF NOT EXISTS pain_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_area VARCHAR(50) NOT NULL,  -- 'lower_back', 'knee', 'shoulder', 'neck', 'hip', 'ankle', 'wrist', 'elbow'
  consecutive_sessions INTEGER DEFAULT 1,
  first_reported TIMESTAMPTZ DEFAULT NOW(),
  last_reported TIMESTAMPTZ DEFAULT NOW(),
  last_session_without_pain TIMESTAMPTZ,  -- Per tracking recupero
  rehabilitation_offered BOOLEAN DEFAULT FALSE,
  rehabilitation_accepted BOOLEAN DEFAULT FALSE,
  rehabilitation_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, body_area)
);

-- Tabella per rieducazioni attive in parallelo al programma principale
CREATE TABLE IF NOT EXISTS active_rehabilitations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_area VARCHAR(50) NOT NULL,  -- Zona in rieducazione
  current_phase INTEGER DEFAULT 1,  -- Fase 1 (mobility), 2 (stability), 3 (strength)
  sessions_completed INTEGER DEFAULT 0,
  pain_free_sessions INTEGER DEFAULT 0,  -- Per uscita automatica (4 sessioni senza dolore)
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_session_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'paused', 'completed', 'abandoned'
  notes TEXT,  -- Note utente o sistema

  UNIQUE(user_id, body_area)
);

-- Tabella per storico sessioni di rieducazione
CREATE TABLE IF NOT EXISTS rehabilitation_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rehabilitation_id INTEGER NOT NULL REFERENCES active_rehabilitations(id) ON DELETE CASCADE,
  body_area VARCHAR(50) NOT NULL,
  phase INTEGER NOT NULL,
  exercises_completed JSONB,  -- Array di esercizi completati con dettagli
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),  -- 0-10 scala dolore
  duration_minutes INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_pain_tracking_user ON pain_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_tracking_area ON pain_tracking(body_area);
CREATE INDEX IF NOT EXISTS idx_pain_tracking_consecutive ON pain_tracking(consecutive_sessions);
CREATE INDEX IF NOT EXISTS idx_active_rehab_user ON active_rehabilitations(user_id);
CREATE INDEX IF NOT EXISTS idx_active_rehab_status ON active_rehabilitations(status);
CREATE INDEX IF NOT EXISTS idx_rehab_sessions_user ON rehabilitation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rehab_sessions_rehab ON rehabilitation_sessions(rehabilitation_id);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_pain_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pain_tracking_updated_at
  BEFORE UPDATE ON pain_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_pain_tracking_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE pain_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_rehabilitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehabilitation_sessions ENABLE ROW LEVEL SECURITY;

-- Policies per pain_tracking
CREATE POLICY "Users can view own pain tracking"
  ON pain_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pain tracking"
  ON pain_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pain tracking"
  ON pain_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pain tracking"
  ON pain_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Policies per active_rehabilitations
CREATE POLICY "Users can view own rehabilitations"
  ON active_rehabilitations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rehabilitations"
  ON active_rehabilitations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rehabilitations"
  ON active_rehabilitations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rehabilitations"
  ON active_rehabilitations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies per rehabilitation_sessions
CREATE POLICY "Users can view own rehab sessions"
  ON rehabilitation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rehab sessions"
  ON rehabilitation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rehab sessions"
  ON rehabilitation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- RPC FUNCTIONS
-- =============================================

-- Funzione per segnalare dolore post-workout
-- Ritorna trigger_rehabilitation = true se raggiunge 2 sessioni consecutive
CREATE OR REPLACE FUNCTION report_workout_pain(
  p_user_id UUID,
  p_body_areas TEXT[]  -- Array di zone doloranti (può essere vuoto)
)
RETURNS JSONB AS $$
DECLARE
  v_area TEXT;
  v_tracking RECORD;
  v_trigger_area TEXT := NULL;
  v_all_tracked_areas TEXT[] := ARRAY['lower_back', 'knee', 'shoulder', 'neck', 'hip', 'ankle', 'wrist', 'elbow'];
BEGIN
  -- Per ogni zona tracciata
  FOREACH v_area IN ARRAY v_all_tracked_areas
  LOOP
    -- Ottieni tracking corrente per questa zona
    SELECT * INTO v_tracking
    FROM pain_tracking
    WHERE user_id = p_user_id AND body_area = v_area;

    IF v_area = ANY(p_body_areas) THEN
      -- Utente ha segnalato dolore in questa zona
      IF v_tracking IS NULL THEN
        -- Prima segnalazione: crea record
        INSERT INTO pain_tracking (user_id, body_area, consecutive_sessions)
        VALUES (p_user_id, v_area, 1);
      ELSE
        -- Incrementa contatore
        UPDATE pain_tracking
        SET
          consecutive_sessions = consecutive_sessions + 1,
          last_reported = NOW()
        WHERE user_id = p_user_id AND body_area = v_area;

        -- Check trigger (2+ sessioni E non ancora offerta rieducazione)
        IF v_tracking.consecutive_sessions + 1 >= 2
           AND NOT v_tracking.rehabilitation_offered
           AND v_trigger_area IS NULL THEN
          -- Marca come offerta
          UPDATE pain_tracking
          SET rehabilitation_offered = TRUE
          WHERE user_id = p_user_id AND body_area = v_area;

          v_trigger_area := v_area;
        END IF;
      END IF;
    ELSE
      -- Utente NON ha segnalato dolore in questa zona
      IF v_tracking IS NOT NULL AND v_tracking.consecutive_sessions > 0 THEN
        -- Reset contatore
        UPDATE pain_tracking
        SET
          consecutive_sessions = 0,
          last_session_without_pain = NOW()
        WHERE user_id = p_user_id AND body_area = v_area;
      END IF;
    END IF;
  END LOOP;

  -- Ritorna risultato
  IF v_trigger_area IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'trigger_rehabilitation', true,
      'body_area', v_trigger_area,
      'message', 'Dolore persistente rilevato. Vuoi attivare il programma di rieducazione?'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'trigger_rehabilitation', false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per accettare/rifiutare rieducazione
CREATE OR REPLACE FUNCTION respond_to_rehabilitation(
  p_user_id UUID,
  p_body_area TEXT,
  p_accepted BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_rehab_id INTEGER;
BEGIN
  -- Aggiorna pain_tracking
  UPDATE pain_tracking
  SET rehabilitation_accepted = p_accepted
  WHERE user_id = p_user_id AND body_area = p_body_area;

  IF p_accepted THEN
    -- Crea rieducazione attiva
    INSERT INTO active_rehabilitations (user_id, body_area)
    VALUES (p_user_id, p_body_area)
    ON CONFLICT (user_id, body_area)
    DO UPDATE SET
      status = 'active',
      current_phase = 1,
      sessions_completed = 0,
      pain_free_sessions = 0,
      started_at = NOW(),
      completed_at = NULL
    RETURNING id INTO v_rehab_id;

    RETURN jsonb_build_object(
      'success', true,
      'rehabilitation_id', v_rehab_id,
      'message', 'Programma di rieducazione attivato'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Continueremo con gli adattamenti. Puoi attivare la rieducazione quando vuoi.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per completare sessione di rieducazione
CREATE OR REPLACE FUNCTION complete_rehabilitation_session(
  p_user_id UUID,
  p_body_area TEXT,
  p_exercises_completed JSONB,
  p_pain_level INTEGER,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_rehab RECORD;
  v_suggest_completion BOOLEAN := FALSE;
  v_advance_phase BOOLEAN := FALSE;
BEGIN
  -- Ottieni rieducazione attiva
  SELECT * INTO v_rehab
  FROM active_rehabilitations
  WHERE user_id = p_user_id AND body_area = p_body_area AND status = 'active';

  IF v_rehab IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nessuna rieducazione attiva per questa zona');
  END IF;

  -- Registra sessione
  INSERT INTO rehabilitation_sessions (
    user_id, rehabilitation_id, body_area, phase,
    exercises_completed, pain_level, duration_minutes, notes
  ) VALUES (
    p_user_id, v_rehab.id, p_body_area, v_rehab.current_phase,
    p_exercises_completed, p_pain_level, p_duration_minutes, p_notes
  );

  -- Aggiorna contatori
  IF p_pain_level <= 3 THEN
    -- Sessione senza dolore significativo
    UPDATE active_rehabilitations
    SET
      sessions_completed = sessions_completed + 1,
      pain_free_sessions = pain_free_sessions + 1,
      last_session_at = NOW()
    WHERE id = v_rehab.id;

    -- Check avanzamento fase (ogni 4 sessioni senza dolore)
    IF v_rehab.pain_free_sessions + 1 >= 4 AND v_rehab.current_phase < 3 THEN
      UPDATE active_rehabilitations
      SET
        current_phase = current_phase + 1,
        pain_free_sessions = 0  -- Reset per nuova fase
      WHERE id = v_rehab.id;
      v_advance_phase := TRUE;
    END IF;

    -- Check completamento (fase 3 + 4 sessioni senza dolore)
    IF v_rehab.current_phase = 3 AND v_rehab.pain_free_sessions + 1 >= 4 THEN
      v_suggest_completion := TRUE;
    END IF;
  ELSE
    -- Sessione con dolore - reset pain_free counter
    UPDATE active_rehabilitations
    SET
      sessions_completed = sessions_completed + 1,
      pain_free_sessions = 0,
      last_session_at = NOW()
    WHERE id = v_rehab.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'sessions_completed', v_rehab.sessions_completed + 1,
    'pain_free_sessions', CASE WHEN p_pain_level <= 3 THEN v_rehab.pain_free_sessions + 1 ELSE 0 END,
    'current_phase', CASE WHEN v_advance_phase THEN v_rehab.current_phase + 1 ELSE v_rehab.current_phase END,
    'phase_advanced', v_advance_phase,
    'suggest_completion', v_suggest_completion
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per completare/chiudere rieducazione
CREATE OR REPLACE FUNCTION complete_rehabilitation(
  p_user_id UUID,
  p_body_area TEXT,
  p_status TEXT DEFAULT 'completed'  -- 'completed' o 'abandoned'
)
RETURNS JSONB AS $$
BEGIN
  UPDATE active_rehabilitations
  SET
    status = p_status,
    completed_at = NOW()
  WHERE user_id = p_user_id AND body_area = p_body_area AND status = 'active';

  -- Reset anche il pain_tracking
  UPDATE pain_tracking
  SET
    consecutive_sessions = 0,
    rehabilitation_offered = FALSE,
    rehabilitation_accepted = FALSE
  WHERE user_id = p_user_id AND body_area = p_body_area;

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE
      WHEN p_status = 'completed' THEN 'Rieducazione completata con successo!'
      ELSE 'Rieducazione interrotta'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere tutte le rieducazioni attive di un utente
CREATE OR REPLACE FUNCTION get_active_rehabilitations(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', ar.id,
        'body_area', ar.body_area,
        'current_phase', ar.current_phase,
        'sessions_completed', ar.sessions_completed,
        'pain_free_sessions', ar.pain_free_sessions,
        'started_at', ar.started_at,
        'last_session_at', ar.last_session_at,
        'status', ar.status
      )
    ), '[]'::jsonb)
    FROM active_rehabilitations ar
    WHERE ar.user_id = p_user_id AND ar.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere pain tracking di un utente
CREATE OR REPLACE FUNCTION get_pain_tracking(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'body_area', pt.body_area,
        'consecutive_sessions', pt.consecutive_sessions,
        'first_reported', pt.first_reported,
        'last_reported', pt.last_reported,
        'rehabilitation_offered', pt.rehabilitation_offered,
        'rehabilitation_accepted', pt.rehabilitation_accepted
      )
    ), '[]'::jsonb)
    FROM pain_tracking pt
    WHERE pt.user_id = p_user_id AND pt.consecutive_sessions > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
