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
 * Converti peso unilaterale a bilaterale equivalente
 * 
 * @param unilateralWeight Peso per singolo arto
 * @returns Peso bilaterale equivalente
 */
export function unilateralToBilateral(unilateralWeight: number): number {
  return unilateralWeight * 2 * BILATERAL_DEFICIT_FACTOR;
}

/**
 * Converti peso bilaterale a unilaterale equivalente
 * 
 * @param bilateralWeight Peso totale bilaterale
 * @returns Peso per singolo arto
 */
export function bilateralToUnilateral(bilateralWeight: number): number {
  return (bilateralWeight / 2) / BILATERAL_DEFICIT_FACTOR;
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
// EXPORT
// ===================================================== 

export default {
  getExerciseLaterality,
  isBilateralDumbbell,
  unilateralToBilateral,
  bilateralToUnilateral,
  formatWeightDisplay,
  convertWeightWithLaterality,
  BILATERAL_DEFICIT_FACTOR,
  UNILATERAL_EXERCISES,
  BILATERAL_DUMBBELL_EXERCISES,
};
