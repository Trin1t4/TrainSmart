/**
 * RM CALCULATOR WITH LATERALITY SUPPORT
 * 
 * Sistema per gestire conversioni tra esercizi considerando la lateralità
 * (unilaterale vs bilaterale) e il bilateral deficit.
 * 
 * NOTA SCIENTIFICA:
 * Il "bilateral deficit" (Archontides & Fazey, 1993) indica che la somma
 * della forza unilaterale supera la forza bilaterale del 5-15%,
 * quindi NON è corretto semplicemente raddoppiare il peso unilaterale
 * per ottenere l'equivalente bilaterale.
 * 
 * Fattore correttivo: bilateral_equivalent ≈ unilateral_per_side * 2 * 0.90
 * (il 10% di deficit è una media conservativa dalla letteratura)
 * 
 * RIFERIMENTI:
 * - Archontides, C., & Fazey, J. A. (1993). Bilateral deficit in maximal
 *   voluntary isometric strength. Journal of Sports Sciences.
 * - Kuruganti, U., Murphy, T., & Pardy, T. (2011). Bilateral deficit
 *   phenomenon and the role of antagonist muscle activity during maximal
 *   isometric knee extensions. Journal of Sports Sciences.
 */

// ===================================================== 
// TIPI
// ===================================================== 

export type Laterality = 'bilateral' | 'unilateral';

export interface ExerciseConversion {
  sourceExercise: string;
  targetExercise: string;
  sourceWeight: number;
  targetWeight: number;
  conversionFactor: number;
  accuracy: number;
  // Campi lateralità
  sourceLaterality: Laterality;
  targetLaterality: Laterality;
  isPerSide: boolean; // true = il peso target è per singolo arto
  displayWeight: string; // "36kg per lato" o "80kg"
}

// ===================================================== 
// COSTANTI
// ===================================================== 

/**
 * Fattore di correzione per bilateral deficit
 * 
 * Quando si converte da unilaterale a bilaterale:
 * bilateral_1RM ≈ (unilateral_per_side * 2) * BILATERAL_DEFICIT_FACTOR
 * 
 * Quando si converte da bilaterale a unilaterale:
 * unilateral_per_side ≈ (bilateral_1RM / 2) / BILATERAL_DEFICIT_FACTOR
 */
export const BILATERAL_DEFICIT_FACTOR = 0.90;

// ===================================================== 
// MAPPE LATERALITÀ ESERCIZI
// ===================================================== 

/**
 * Esercizi classificati come unilaterali (un arto alla volta).
 * 
 * IMPORTANTE: Il peso registrato è PER SINGOLO ARTO.
 * 
 * Per convertire a bilaterale:
 * bilateral ≈ unilateral_per_side * 2 * BILATERAL_DEFICIT_FACTOR
 */
export const UNILATERAL_EXERCISES: Set<string> = new Set([
  // Upper Body - Pull
  'dumbbell row',              // Rematore manubrio (1 braccio alla volta)
  'one arm cable row',
  'concentration curl',
  'single arm pulldown',
  
  // Upper Body - Push
  'single arm dumbbell press',
  'tricep kickback',
  
  // Lower Body
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
  'skater squat',
]);

/**
 * Esercizi con manubri che sono BILATERALI (entrambe le mani lavorano insieme).
 * 
 * Il peso indicato è PER MANUBRIO, ma entrambi lavorano simultaneamente.
 * NON sono unilaterali.
 * 
 * Esempio: Dumbbell bench press con 30kg → 30kg per braccio, 60kg totali
 */
export const BILATERAL_DUMBBELL_EXERCISES: Set<string> = new Set([
  'dumbbell bench press',
  'incline dumbbell press',
  'dumbbell shoulder press',
  'dumbbell curl',             // Curl con 2 manubri contemporaneamente
  'hammer curl',               // Curl martello con 2 manubri
  'dumbbell fly',
  'dumbbell lateral raise',
  'dumbbell front raise',
  'dumbbell romanian deadlift',
  'goblet squat',
]);

// ===================================================== 
// UTILITY FUNCTIONS
// ===================================================== 

/**
 * Normalizza nome esercizio per matching
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Rimuovi punteggiatura
    .replace(/\s+/g, ' ');       // Normalizza spazi
}

/**
 * Determina la lateralità di un esercizio dal nome canonico
 */
export function getExerciseLaterality(exerciseName: string): Laterality {
  const normalized = normalizeExerciseName(exerciseName);
  
  // Check esplicito nel set unilaterali
  if (UNILATERAL_EXERCISES.has(normalized)) {
    return 'unilateral';
  }
  
  // Check pattern nel nome originale (per esercizi non ancora mappati)
  const lower = exerciseName.toLowerCase();
  const unilateralPatterns = [
    'single arm',
    'single leg',
    'one arm',
    'one leg',
    'un braccio',
    'una gamba',
    '1 braccio',
    '1 gamba',
    'unilateral',
    'unilaterale',
  ];
  
  for (const pattern of unilateralPatterns) {
    if (lower.includes(pattern)) {
      return 'unilateral';
    }
  }
  
  return 'bilateral';
}

/**
 * Verifica se un esercizio usa manubri bilaterali
 */
export function isBilateralDumbbell(exerciseName: string): boolean {
  const normalized = normalizeExerciseName(exerciseName);
  return BILATERAL_DUMBBELL_EXERCISES.has(normalized);
}

/**
 * Arrotonda numero a n decimali (default 1)
 */
function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formatta peso per display (1 decimale)
 */
function formatWeight(weight: number): string {
  return round(weight, 1).toFixed(1) + 'kg';
}

/**
 * Converti peso unilaterale a bilaterale equivalente
 * Applica il bilateral deficit (Archontides & Fazey, 1993).
 * 
 * Es: Dumbbell Row 40kg (1 braccio) → ~72kg bilaterale equivalente
 * (40 * 2 * 0.90 = 72)
 * 
 * @param weightPerSide Peso per singolo arto
 * @returns Peso bilaterale equivalente
 */
export function unilateralToBilateral(weightPerSide: number): number {
  return round(weightPerSide * 2 * BILATERAL_DEFICIT_FACTOR);
}

/**
 * Converti peso bilaterale a unilaterale equivalente
 * Considera il bilateral deficit.
 * 
 * Es: Barbell Row 80kg → ~44kg per braccio
 * (80 / 2 / 0.90 = 44.4)
 * 
 * @param totalWeight Peso totale bilaterale
 * @returns Peso per singolo arto
 */
export function bilateralToUnilateral(totalWeight: number): number {
  return round(totalWeight / 2 / BILATERAL_DEFICIT_FACTOR);
}

/**
 * Formatta display peso considerando lateralità
 * 
 * @param weight Peso numerico
 * @param laterality Tipo di lateralità
 * @param isPerSide Per esercizi bilaterali con manubri (peso PER MANUBRIO)
 * @returns Stringa formattata (es: "36kg per lato", "80kg totale")
 */
export function formatWeightDisplay(
  weight: number,
  laterality: Laterality,
  isPerSide: boolean = false
): string {
  const roundedWeight = Math.round(weight * 10) / 10;
  
  if (laterality === 'unilateral') {
    return `${roundedWeight}kg per lato`;
  }
  
  if (isPerSide) {
    return `${roundedWeight}kg per manubrio`;
  }
  
  return `${roundedWeight}kg`;
}

/**
 * Calcola peso target per conversione tra esercizi con lateralità
 * 
 * @param sourceWeight Peso sorgente
 * @param sourceLaterality Lateralità esercizio sorgente
 * @param targetLaterality Lateralità esercizio target
 * @param conversionFactor Fattore di conversione biomeccanica (default 1.0)
 * @returns Peso target considerando lateralità e bilateral deficit
 */
export function convertWeightWithLaterality(
  sourceWeight: number,
  sourceLaterality: Laterality,
  targetLaterality: Laterality,
  conversionFactor: number = 1.0
): number {
  let adjustedWeight = sourceWeight;
  
  // Caso 1: Bilateral → Unilateral
  if (sourceLaterality === 'bilateral' && targetLaterality === 'unilateral') {
    adjustedWeight = bilateralToUnilateral(sourceWeight);
  }
  
  // Caso 2: Unilateral → Bilateral
  else if (sourceLaterality === 'unilateral' && targetLaterality === 'bilateral') {
    adjustedWeight = unilateralToBilateral(sourceWeight);
  }
  
  // Caso 3: Stessa lateralità (nessuna conversione deficit)
  // adjustedWeight rimane sourceWeight
  
  // Applica fattore di conversione biomeccanica
  return adjustedWeight * conversionFactor;
}

// ===================================================== 
// EXERCISE CONVERSIONS
// ===================================================== 

/**
 * Tabella conversioni tra esercizi con fattori biomeccanici e accuracy.
 * 
 * Il fattore di conversione rappresenta SEMPRE:
 * target_weight_per_working_unit = source_weight_per_working_unit * factor
 * 
 * Dove "working_unit" è:
 * - Per bilaterali: il peso TOTALE (bilanciere + dischi)
 * - Per unilaterali: il peso PER SINGOLO ARTO
 * - Per manubri bilaterali: il peso PER MANUBRIO
 * 
 * La lateralità viene gestita separatamente in convertExercise()
 * 
 * Accuracy: 1-5 (1=bassa, 5=alta affidabilità della conversione)
 */
export const EXERCISE_CONVERSIONS: Record<string, Record<string, { factor: number; accuracy: number }>> = {
  // ============================================================
  // Lower Push (Spinta Gambe)
  // ============================================================
  'back squat': {
    'front squat': { factor: 0.85, accuracy: 4 },
    'leg press': { factor: 1.5, accuracy: 4 },
    'hack squat': { factor: 1.2, accuracy: 3 },
    'goblet squat': { factor: 0.5, accuracy: 3 }, // peso del singolo manubrio/KB
    'bulgarian split squat': { factor: 0.35, accuracy: 3 }, // peso per gamba
    'smith machine squat': { factor: 0.9, accuracy: 3 },
    'single leg press': { factor: 0.85, accuracy: 3 }, // peso per gamba sulla pressa
    'lunge': { factor: 0.30, accuracy: 3 }, // peso per manubrio in mano
    'pistol squat': { factor: 0.15, accuracy: 2 }, // peso aggiuntivo tenuto al petto
  },
  'front squat': {
    'back squat': { factor: 1.18, accuracy: 4 },
    'goblet squat': { factor: 0.6, accuracy: 3 },
  },

  // ============================================================
  // Lower Pull (Hip Hinge)
  // ============================================================
  'deadlift': {
    'sumo deadlift': { factor: 0.95, accuracy: 4 },
    'romanian deadlift': { factor: 0.70, accuracy: 4 },
    'stiff leg deadlift': { factor: 0.65, accuracy: 3 },
    'trap bar deadlift': { factor: 1.05, accuracy: 4 },
    'rack pull': { factor: 1.2, accuracy: 3 },
    'good morning': { factor: 0.45, accuracy: 3 },
    'single leg rdl': { factor: 0.25, accuracy: 2 }, // peso per mano, unilaterale
  },
  'sumo deadlift': {
    'deadlift': { factor: 1.05, accuracy: 4 },
  },
  'romanian deadlift': {
    'deadlift': { factor: 1.43, accuracy: 4 },
    'stiff leg deadlift': { factor: 0.95, accuracy: 4 },
    'good morning': { factor: 0.65, accuracy: 3 },
    'single leg rdl': { factor: 0.35, accuracy: 2 }, // peso per mano, unilaterale
  },

  // ============================================================
  // Horizontal Push (Petto)
  // ============================================================
  'bench press': {
    'dumbbell bench press': { factor: 0.40, accuracy: 3 }, // peso PER manubrio (bilaterale)
    'incline bench press': { factor: 0.85, accuracy: 4 },
    'decline bench press': { factor: 1.1, accuracy: 4 },
    'floor press': { factor: 0.85, accuracy: 3 },
    'smith bench press': { factor: 0.9, accuracy: 3 },
    'chest press': { factor: 1.15, accuracy: 3 },
    'incline dumbbell press': { factor: 0.35, accuracy: 3 }, // peso PER manubrio (bilaterale)
  },
  'dumbbell bench press': {
    'bench press': { factor: 2.35, accuracy: 3 }, // x2 manubri + ~18% bilateral advantage
    'incline dumbbell press': { factor: 0.88, accuracy: 3 },
  },

  // ============================================================
  // Vertical Push (Spalle)
  // ============================================================
  'overhead press': {
    'dumbbell shoulder press': { factor: 0.40, accuracy: 3 }, // peso PER manubrio (bilaterale)
    'push press': { factor: 1.15, accuracy: 3 },
    'arnold press': { factor: 0.38, accuracy: 3 }, // peso PER manubrio
    'smith overhead press': { factor: 0.95, accuracy: 3 },
  },

  // ============================================================
  // Horizontal Pull (Schiena)
  // ============================================================
  'barbell row': {
    'dumbbell row': { factor: 0.50, accuracy: 3 }, // peso per il singolo braccio (unilaterale)
    'cable row': { factor: 0.9, accuracy: 3 },
    't-bar row': { factor: 1.1, accuracy: 3 },
    'seated row': { factor: 0.85, accuracy: 3 },
  },

  // ============================================================
  // Braccia
  // ============================================================
  'barbell curl': {
    'dumbbell curl': { factor: 0.45, accuracy: 3 }, // peso PER manubrio (bilaterale)
    'ez bar curl': { factor: 0.95, accuracy: 4 },
    'cable curl': { factor: 0.85, accuracy: 3 },
    'concentration curl': { factor: 0.40, accuracy: 3 }, // peso per il singolo braccio (unilaterale)
  },
};

// ===================================================== 
// CONVERSION FUNCTION
// ===================================================== 

/**
 * Converti peso da un esercizio all'altro, gestendo correttamente la lateralità.
 * 
 * LOGICA:
 * - Se source=bilateral e target=unilateral: il fattore dà già il peso per arto
 * - Se source=unilateral e target=bilateral:
 *   peso_bilaterale = peso_unilaterale * 2 * BILATERAL_DEFICIT_FACTOR * fattore_inverso
 * - Se entrambi stessa lateralità: conversione diretta
 * 
 * Il campo isPerSide indica se il peso risultante è per singolo arto.
 * Il campo displayWeight fornisce la stringa da mostrare in UI.
 * 
 * @param sourceExercise Nome esercizio sorgente
 * @param targetExercise Nome esercizio target
 * @param sourceWeight Peso sorgente (1RM)
 * @returns Oggetto ExerciseConversion con tutti i dettagli o null se non trovata
 */
export function convertExercise(
  sourceExercise: string,
  targetExercise: string,
  sourceWeight: number
): ExerciseConversion | null {
  const source = normalizeExerciseName(sourceExercise);
  const target = normalizeExerciseName(targetExercise);
  
  const sourceLaterality = getExerciseLaterality(sourceExercise);
  const targetLaterality = getExerciseLaterality(targetExercise);

  // Cerca conversione diretta
  let conversionData: { factor: number; accuracy: number } | null = null;
  let isInverse = false;

  if (EXERCISE_CONVERSIONS[source]?.[target]) {
    conversionData = EXERCISE_CONVERSIONS[source][target];
  } else if (EXERCISE_CONVERSIONS[target]?.[source]) {
    conversionData = EXERCISE_CONVERSIONS[target][source];
    isInverse = true;
  }

  if (!conversionData) return null;

  const { factor, accuracy } = conversionData;
  let targetWeight: number;
  let effectiveFactor: number;

  if (!isInverse) {
    // Conversione diretta (fattore così com'è)
    // I fattori nella tabella sono già calibrati per la direzione source→target
    // considerando la lateralità tipica degli esercizi
    targetWeight = round(sourceWeight * factor);
    effectiveFactor = factor;
  } else {
    // Conversione inversa
    const inverseFactor = 1 / factor;

    if (sourceLaterality === 'unilateral' && targetLaterality === 'bilateral') {
      // Caso critico: da unilaterale a bilaterale
      // Il peso sorgente è per 1 arto. Per stimare il bilaterale:
      // bilateral ≈ (unilateral * 2) * bilateral_deficit * inverseFactor
      const bilateralEquivalent = sourceWeight * 2 * BILATERAL_DEFICIT_FACTOR;
      targetWeight = round(bilateralEquivalent * inverseFactor);
      effectiveFactor = round((2 * BILATERAL_DEFICIT_FACTOR) * inverseFactor, 3);
    } else if (sourceLaterality === 'bilateral' && targetLaterality === 'unilateral') {
      // Da bilaterale a unilaterale (inversione)
      // Il fattore originale (tabella) va da target→source (bilateral→bilateral)
      // Noi vogliamo source(bilateral)→target(unilateral)
      // Applichiamo inverseFactor e dividiamo per 2 (per avere per-lato)
      targetWeight = round(sourceWeight * inverseFactor);
      effectiveFactor = round(inverseFactor, 3);
    } else {
      // Stessa lateralità: inversione semplice
      targetWeight = round(sourceWeight * inverseFactor);
      effectiveFactor = round(inverseFactor, 3);
    }
  }

  // Determina se il peso è "per lato"
  const isPerSide = targetLaterality === 'unilateral';

  // Anche per esercizi con manubri bilaterali, indica "per manubrio"
  const isBilateralDumbbell = BILATERAL_DUMBBELL_EXERCISES.has(target);

  // Costruisci display string
  let displayWeight: string;
  if (isPerSide) {
    displayWeight = `${targetWeight}kg per lato`;
  } else if (isBilateralDumbbell) {
    displayWeight = `${targetWeight}kg per manubrio`;
  } else {
    displayWeight = `${targetWeight}kg`;
  }

  return {
    sourceExercise,
    targetExercise,
    sourceWeight,
    targetWeight,
    conversionFactor: effectiveFactor,
    accuracy: isInverse ? Math.max(1, accuracy - 1) : accuracy,
    sourceLaterality,
    targetLaterality,
    isPerSide,
    displayWeight,
  };
}

// ===================================================== 
// ADDITIONAL HELPER FUNCTIONS
// ===================================================== 

/**
 * Formatta il peso per la visualizzazione in base alla lateralità.
 * Usare questa funzione ovunque si mostra un peso calcolato.
 * 
 * @param weight Peso numerico
 * @param exerciseName Nome esercizio
 * @returns Stringa formattata (es: "36.0kg per lato", "80.0kg")
 */
export function formatWeightWithLaterality(
  weight: number,
  exerciseName: string
): string {
  const laterality = getExerciseLaterality(exerciseName);
  const normalized = normalizeExerciseName(exerciseName);

  if (laterality === 'unilateral') {
    return `${formatWeight(weight)} per lato`;
  }

  if (BILATERAL_DUMBBELL_EXERCISES.has(normalized)) {
    return `${formatWeight(weight)} per manubrio`;
  }

  return formatWeight(weight);
}

/**
 * Verifica se un esercizio è un'esecuzione "per manubrio" (sia uni che bilaterale)
 * Utile per la UI: mostrare "per mano" / "per lato"
 * 
 * @param exerciseName Nome esercizio
 * @returns true se il peso è per singolo arto/manubrio
 */
export function isPerSideWeight(exerciseName: string): boolean {
  const laterality = getExerciseLaterality(exerciseName);
  if (laterality === 'unilateral') return true;

  const normalized = normalizeExerciseName(exerciseName);
  return BILATERAL_DUMBBELL_EXERCISES.has(normalized);
}

// ===================================================== 
// EXPORT
// ===================================================== 

export default {
  getExerciseLaterality,
  isBilateralDumbbell,
  unilateralToBilateral,
  bilateralToUnilateral,
  formatWeightDisplay,
  formatWeightWithLaterality,
  convertWeightWithLaterality,
  convertExercise,
  isPerSideWeight,
  BILATERAL_DEFICIT_FACTOR,
  UNILATERAL_EXERCISES,
  BILATERAL_DUMBBELL_EXERCISES,
  EXERCISE_CONVERSIONS,
};
