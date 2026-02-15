-- Migration 20260215: Aggiunge supporto lateralità (unilaterale/bilaterale)
-- Risolve il bug dei massimali sballati quando si converte tra esercizi
-- bilaterali (bilanciere) e unilaterali (un braccio/gamba)
--
-- CONTESTO SCIENTIFICO:
-- Il "bilateral deficit" (Archontides & Fazey, 1993) indica che la somma
-- della forza unilaterale supera la forza bilaterale del 5-15%.
-- Questo significa che NON è corretto raddoppiare semplicemente il peso
-- unilaterale per ottenere l'equivalente bilaterale.
--
-- Fattore correttivo: bilateral ≈ (unilateral_per_side * 2) * 0.90
--
-- RIFERIMENTI:
-- - Archontides, C., & Fazey, J. A. (1993). Bilateral deficit in maximal
--   voluntary isometric strength. Journal of Sports Sciences.
-- - Kuruganti, U., Murphy, T., & Pardy, T. (2011). Bilateral deficit
--   phenomenon and the role of antagonist muscle activity.

-- =====================================================
-- 1. AGGIUNGI COLONNA is_unilateral
-- =====================================================

ALTER TABLE exercise_library 
ADD COLUMN IF NOT EXISTS is_unilateral BOOLEAN DEFAULT false;

COMMENT ON COLUMN exercise_library.is_unilateral IS 
'TRUE se l''esercizio è eseguito con un arto alla volta (es. rematore 1 braccio, curl concentrazione, pistol squat). Il peso registrato si riferisce al singolo arto.';

-- =====================================================
-- 2. AGGIORNA ESERCIZI ESISTENTI
-- =====================================================

-- Esercizi UPPER BODY unilaterali
UPDATE exercise_library 
SET is_unilateral = true 
WHERE is_unilateral IS NOT true 
AND (
  -- Pattern espliciti "single arm/leg"
  LOWER(name) LIKE '%single arm%'
  OR LOWER(name) LIKE '%single leg%'
  OR LOWER(name) LIKE '%one arm%'
  OR LOWER(name) LIKE '%one leg%'
  OR LOWER(name) LIKE '%un braccio%'
  OR LOWER(name) LIKE '%una gamba%'
  OR LOWER(name) LIKE '%1 braccio%'
  OR LOWER(name) LIKE '%1 gamba%'
  OR LOWER(name) LIKE '%unilateral%'
  
  -- Esercizi classicamente unilaterali
  OR LOWER(name) LIKE '%concentration curl%'
  OR LOWER(name) LIKE '%curl concentrazione%'
  OR LOWER(name) LIKE '%pistol squat%'
  OR LOWER(name) LIKE '%bulgarian split squat%'
  OR LOWER(name) LIKE '%split squat bulgaro%'
  OR LOWER(name) LIKE '%affondo bulgaro%'
  OR LOWER(name) LIKE '%single leg rdl%'
  OR LOWER(name) LIKE '%single leg hip thrust%'
  OR LOWER(name) LIKE '%single leg calf raise%'
  OR LOWER(name) LIKE '%step up%'
  OR LOWER(name) LIKE '%lunge%'
  OR LOWER(name) LIKE '%affond%' -- affondi/affondo
  
  -- Esercizi specifici unilaterali per nome esatto
  OR LOWER(name) IN (
    'dumbbell row',
    'concentration curl',
    'tricep kickback',
    'bulgarian split squat',
    'pistol squat',
    'single leg rdl',
    'single leg hip thrust',
    'single leg calf raise',
    'single leg press',
    'step up',
    'lunge',
    'walking lunge',
    'reverse lunge',
    'curtsy lunge',
    'cossack squat',
    'skater squat'
  )
);

-- NOTA: Esercizi come "Dumbbell Bench Press" o "Dumbbell Shoulder Press"
-- NON sono unilaterali (si usano 2 manubri insieme).
-- "Dumbbell Row" / "Rematore Manubrio" invece È tipicamente unilaterale.
UPDATE exercise_library 
SET is_unilateral = true 
WHERE is_unilateral IS NOT true 
AND (
  LOWER(name) LIKE '%dumbbell row%'
  OR LOWER(name) LIKE '%rematore manubrio%'
  OR LOWER(name) LIKE '%rematore con manubrio%'
  OR LOWER(name) LIKE '%rematore un braccio%'
  OR LOWER(name) LIKE '%db row%'
  OR LOWER(name) LIKE '%kickback%'
  OR LOWER(name) LIKE '%tricep kickback%'
);

-- =====================================================
-- 3. CREA INDICE PER QUERY VELOCI
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_exercise_library_laterality 
ON exercise_library(is_unilateral);

-- =====================================================
-- 4. FUNZIONE HELPER: Converti peso da unilaterale a bilaterale
-- =====================================================

CREATE OR REPLACE FUNCTION unilateral_to_bilateral(
  weight_per_side NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  -- Applica bilateral deficit (factor 0.90)
  -- bilateral ≈ (unilateral * 2) * 0.90
  RETURN ROUND((weight_per_side * 2 * 0.90)::NUMERIC, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION unilateral_to_bilateral IS
'Converte un peso unilaterale (per singolo arto) in equivalente bilaterale, considerando il bilateral deficit (Archontides & Fazey, 1993).';

-- =====================================================
-- 5. FUNZIONE HELPER: Converti peso da bilaterale a unilaterale
-- =====================================================

CREATE OR REPLACE FUNCTION bilateral_to_unilateral(
  total_weight NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  -- Inverso del bilateral deficit
  -- unilateral_per_side ≈ (bilateral / 2) / 0.90
  RETURN ROUND((total_weight / 2 / 0.90)::NUMERIC, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION bilateral_to_unilateral IS
'Converte un peso bilaterale totale in peso per singolo arto, considerando il bilateral deficit.';

-- =====================================================
-- 6. FUNZIONE: Determina lateralità esercizio
-- =====================================================

CREATE OR REPLACE FUNCTION get_exercise_laterality(
  exercise_name TEXT
) RETURNS TEXT AS $$
DECLARE
  is_uni BOOLEAN;
BEGIN
  -- Check nel database
  SELECT is_unilateral INTO is_uni
  FROM exercise_library
  WHERE LOWER(name) = LOWER(exercise_name)
  LIMIT 1;
  
  IF is_uni IS NULL THEN
    -- Se non trovato in DB, inferisci da pattern nel nome
    IF exercise_name ~* 'single (arm|leg)|one (arm|leg)|un braccio|una gamba|1 (braccio|gamba)|unilateral' THEN
      RETURN 'unilateral';
    ELSE
      RETURN 'bilateral';
    END IF;
  END IF;
  
  RETURN CASE WHEN is_uni THEN 'unilateral' ELSE 'bilateral' END;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_exercise_laterality IS
'Determina se un esercizio è unilaterale o bilaterale basandosi sul database o pattern nel nome.';

-- =====================================================
-- 7. VISTA: Massimali con lateralità esposta
-- =====================================================

CREATE OR REPLACE VIEW user_maxes_with_laterality AS
SELECT 
  user_id,
  exercise_name,
  max_weight,
  test_date,
  get_exercise_laterality(exercise_name) AS laterality,
  CASE 
    WHEN get_exercise_laterality(exercise_name) = 'unilateral' 
    THEN max_weight || 'kg per lato'
    ELSE max_weight || 'kg'
  END AS display_weight
FROM user_maxes;

COMMENT ON VIEW user_maxes_with_laterality IS
'Vista che espone i massimali utente con informazioni sulla lateralità per display corretto in UI.';

-- =====================================================
-- 8. AGGIORNA TABELLA exercise_conversions (se esiste)
-- =====================================================

-- Aggiungi colonne per indicare la lateralità di sorgente e destinazione
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_conversions') THEN
    ALTER TABLE exercise_conversions 
    ADD COLUMN IF NOT EXISTS source_is_unilateral BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS target_is_unilateral BOOLEAN DEFAULT false;
    
    -- Aggiorna le conversioni esistenti con la lateralità corretta
    -- Bilanciere -> Manubrio singolo (unilaterale)
    UPDATE exercise_conversions 
    SET target_is_unilateral = true 
    WHERE LOWER(target_exercise_name) LIKE '%dumbbell row%' 
       OR LOWER(target_exercise_name) LIKE '%rematore manubrio%';
    
    UPDATE exercise_conversions 
    SET source_is_unilateral = true 
    WHERE LOWER(source_exercise_name) LIKE '%dumbbell row%' 
       OR LOWER(source_exercise_name) LIKE '%rematore manubrio%';
    
    -- Sincronizza con exercise_library per le conversioni future
    UPDATE exercise_conversions ec 
    SET source_is_unilateral = el.is_unilateral 
    FROM exercise_library el 
    WHERE ec.source_exercise_id = el.id 
      AND el.is_unilateral = true;
    
    UPDATE exercise_conversions ec 
    SET target_is_unilateral = el.is_unilateral 
    FROM exercise_library el 
    WHERE ec.target_exercise_id = el.id 
      AND el.is_unilateral = true;
  END IF;
END $$;

-- =====================================================
-- 9. FUNZIONE: Conversione peso con lateralità
-- =====================================================

CREATE OR REPLACE FUNCTION converti_peso_con_lateralita(
  p_source_weight DECIMAL,
  p_conversion_factor DECIMAL,
  p_source_is_unilateral BOOLEAN,
  p_target_is_unilateral BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_converted_weight DECIMAL;
  v_display_note TEXT;
BEGIN
  v_converted_weight := ROUND(p_source_weight * p_conversion_factor, 1);
  
  -- Caso 1: Bilaterale -> Bilaterale (nessuna correzione)
  IF NOT p_source_is_unilateral AND NOT p_target_is_unilateral THEN
    v_display_note := v_converted_weight || 'kg';
  
  -- Caso 2: Bilaterale -> Unilaterale
  -- Il fattore di conversione già dà il peso per singolo arto
  ELSIF NOT p_source_is_unilateral AND p_target_is_unilateral THEN
    v_display_note := v_converted_weight || 'kg per lato';
  
  -- Caso 3: Unilaterale -> Bilaterale
  -- Il peso sorgente è per singolo arto, serve raddoppiare prima di convertire
  ELSIF p_source_is_unilateral AND NOT p_target_is_unilateral THEN
    -- source_weight è per 1 arto, moltiplica per 2 per avere il totale bilaterale equivalente
    v_converted_weight := ROUND((p_source_weight * 2) * p_conversion_factor, 1);
    v_display_note := v_converted_weight || 'kg';
  
  -- Caso 4: Unilaterale -> Unilaterale
  ELSE
    v_display_note := v_converted_weight || 'kg per lato';
  END IF;
  
  RETURN jsonb_build_object(
    'weight', v_converted_weight,
    'display', v_display_note,
    'is_per_side', p_target_is_unilateral
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION converti_peso_con_lateralita IS
'Converte un peso tra esercizi gestendo correttamente la lateralità (unilaterale/bilaterale). Ritorna JSON con weight, display e is_per_side.';

-- =====================================================
-- FINE MIGRATION
-- =====================================================
