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
-- FINE MIGRATION
-- =====================================================
