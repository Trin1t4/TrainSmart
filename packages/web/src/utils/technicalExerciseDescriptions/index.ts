/**
 * TECHNICAL EXERCISE DESCRIPTIONS - INDEX
 * 
 * File principale che esporta tutto il database di descrizioni tecniche
 * e fornisce funzioni helper per l'integrazione con il sistema esistente.
 * 
 * @file packages/web/src/utils/technicalExerciseDescriptions/index.ts
 */

// =============================================================================
// IMPORTS
// =============================================================================

import { 
  LOWER_PUSH_EXERCISES, 
  LOWER_PULL_EXERCISES,
  type TechnicalExerciseDescription,
  type MuscleActivation,
  type JointAction,
  type PhaseDescription,
  type CompensatoryPattern
} from './technicalExerciseDescriptions';

import {
  HORIZONTAL_PUSH_EXERCISES,
  HORIZONTAL_PULL_EXERCISES,
  VERTICAL_PULL_EXERCISES,
  VERTICAL_PUSH_EXERCISES,
  CORE_EXERCISES,
  ACCESSORY_EXERCISES
} from './technicalExerciseDescriptions_part2';

// =============================================================================
// RE-EXPORT TYPES
// =============================================================================

export type {
  TechnicalExerciseDescription,
  MuscleActivation,
  JointAction,
  PhaseDescription,
  CompensatoryPattern
};

// =============================================================================
// DATABASE COMPLETO
// =============================================================================

/**
 * Database completo di tutte le descrizioni tecniche degli esercizi
 */
export const TECHNICAL_EXERCISE_DATABASE: Record<string, TechnicalExerciseDescription> = {
  // Lower Body
  ...LOWER_PUSH_EXERCISES,
  ...LOWER_PULL_EXERCISES,
  
  // Upper Body Push
  ...HORIZONTAL_PUSH_EXERCISES,
  ...VERTICAL_PUSH_EXERCISES,
  
  // Upper Body Pull
  ...HORIZONTAL_PULL_EXERCISES,
  ...VERTICAL_PULL_EXERCISES,
  
  // Core & Accessory
  ...CORE_EXERCISES,
  ...ACCESSORY_EXERCISES
};

// =============================================================================
// ALIAS MAPPING (per compatibilità con nomi italiani/varianti)
// =============================================================================

/**
 * Mappa alias → nome canonico
 * Permette di trovare descrizioni usando nomi alternativi
 */
export const EXERCISE_ALIASES: Record<string, string> = {
  // Lower Push aliases
  'Squat a Corpo Libero': 'Bodyweight Squat',
  'Air Squat': 'Bodyweight Squat',
  'Squat': 'Bodyweight Squat',
  'Accosciata': 'Bodyweight Squat',
  'Squat con Bilanciere': 'Back Squat',
  'Squat Frontale': 'Front Squat',
  'Squat Bulgaro': 'Bulgarian Split Squat',
  'Split Squat Bulgaro': 'Bulgarian Split Squat',
  'Affondi Bulgari': 'Bulgarian Split Squat',
  'Pressa': 'Leg Press',
  'Pressa per Gambe': 'Leg Press',
  'Affondi': 'Lunges',
  'Affondi in Avanti': 'Lunges',
  'Affondi Camminati': 'Lunges',
  
  // Lower Pull aliases
  'Stacco da Terra': 'Conventional Deadlift',
  'Stacco Classico': 'Conventional Deadlift',
  'Deadlift': 'Conventional Deadlift',
  'Stacco Rumeno': 'Romanian Deadlift (RDL)',
  'RDL': 'Romanian Deadlift (RDL)',
  'Stacco a Gambe Tese': 'Romanian Deadlift (RDL)',
  'Ponte Glutei': 'Glute Bridge',
  'Spinta d\'Anca': 'Hip Thrust',
  'Nordic Hamstring Curl': 'Nordic Curl',
  
  // Horizontal Push aliases
  'Piegamenti': 'Push-up',
  'Flessioni': 'Push-up',
  'Panca Piana': 'Bench Press',
  'Distensioni su Panca': 'Bench Press',
  'Parallele': 'Dips',
  'Dip': 'Dips',
  'Panca Inclinata': 'Incline Bench Press',
  
  // Horizontal Pull aliases
  'Rematore con Bilanciere': 'Barbell Row',
  'Rematore': 'Barbell Row',
  'Bent Over Row': 'Barbell Row',
  'Rematore Inverso': 'Inverted Row',
  'Australian Pull-up': 'Inverted Row',
  'Pulley Basso': 'Seated Cable Row',
  'Cable Row': 'Seated Cable Row',
  
  // Vertical Pull aliases
  'Trazioni': 'Pull-up',
  'Trazioni alla Sbarra': 'Pull-up',
  'Chin-up': 'Pull-up',
  'Lat Machine': 'Lat Pulldown',
  'Pulley Alto': 'Lat Pulldown',
  'Tirate al Lat Machine': 'Lat Pulldown',
  
  // Vertical Push aliases
  'Lento Avanti': 'Overhead Press',
  'Military Press': 'Overhead Press',
  'Shoulder Press': 'Overhead Press',
  'Distensioni Sopra la Testa': 'Overhead Press',
  'Piegamenti Pike': 'Pike Push-up',
  
  // Core aliases
  'Plank Frontale': 'Plank',
  'Tenuta Isometrica': 'Plank',
  'Alzate Gambe alla Sbarra': 'Hanging Leg Raise',
  'Leg Raise': 'Hanging Leg Raise',
  
  // Accessory aliases
  'Curl con Bilanciere': 'Barbell Curl',
  'Curl Bilanciere': 'Barbell Curl',
  'Pushdown ai Cavi': 'Tricep Pushdown',
  'Tricep Pushdown Cable': 'Tricep Pushdown',
  'Push Down': 'Tricep Pushdown',
  'Alzate Laterali': 'Lateral Raise',
  'Calf Raise in Piedi': 'Calf Raise',
  'Standing Calf Raise': 'Calf Raise',
  'Sollevamento Polpacci': 'Calf Raise'
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ottieni la descrizione tecnica di un esercizio
 * Supporta nomi canonici, alias italiani, e matching fuzzy
 * 
 * @param exerciseName - Nome dell'esercizio (qualsiasi lingua/variante)
 * @returns Descrizione tecnica completa o null se non trovato
 */
export function getTechnicalDescription(exerciseName: string): TechnicalExerciseDescription | null {
  // 1. Check nome esatto
  if (TECHNICAL_EXERCISE_DATABASE[exerciseName]) {
    return TECHNICAL_EXERCISE_DATABASE[exerciseName];
  }
  
  // 2. Check alias
  const canonicalName = EXERCISE_ALIASES[exerciseName];
  if (canonicalName && TECHNICAL_EXERCISE_DATABASE[canonicalName]) {
    return TECHNICAL_EXERCISE_DATABASE[canonicalName];
  }
  
  // 3. Case-insensitive search
  const lowerName = exerciseName.toLowerCase();
  for (const [key, value] of Object.entries(TECHNICAL_EXERCISE_DATABASE)) {
    if (key.toLowerCase() === lowerName || value.nameIT.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // 4. Partial match (fallback)
  for (const [key, value] of Object.entries(TECHNICAL_EXERCISE_DATABASE)) {
    if (
      key.toLowerCase().includes(lowerName) || 
      lowerName.includes(key.toLowerCase()) ||
      value.nameIT.toLowerCase().includes(lowerName) ||
      lowerName.includes(value.nameIT.toLowerCase())
    ) {
      return value;
    }
  }
  
  return null;
}

/**
 * Ottieni solo le cue di coaching per un esercizio
 * Utile per visualizzazione rapida durante il workout
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Cue di coaching o null
 */
export function getCoachingCues(exerciseName: string): TechnicalExerciseDescription['coachingCues'] | null {
  const description = getTechnicalDescription(exerciseName);
  return description?.coachingCues ?? null;
}

/**
 * Ottieni le modifiche per un'area dolorante specifica
 * Integrazione diretta con Pain Detect 2.0
 * 
 * @param exerciseName - Nome dell'esercizio
 * @param painArea - Area del corpo con dolore
 * @returns Suggerimento di modifica o null
 */
export function getPainModification(exerciseName: string, painArea: string): string | null {
  const description = getTechnicalDescription(exerciseName);
  if (!description) return null;
  
  return description.painDetectIntegration.modifications[painArea] ?? null;
}

/**
 * Verifica se un esercizio è controindicato per una condizione
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Lista di controindicazioni o array vuoto
 */
export function getContraindications(exerciseName: string): string[] {
  const description = getTechnicalDescription(exerciseName);
  return description?.painDetectIntegration.contraindications ?? [];
}

/**
 * Ottieni la biomeccanica di un esercizio
 * Utile per analisi e display dettagliato
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Dati biomeccanici o null
 */
export function getBiomechanics(exerciseName: string): TechnicalExerciseDescription['biomechanics'] | null {
  const description = getTechnicalDescription(exerciseName);
  return description?.biomechanics ?? null;
}

/**
 * Ottieni i pattern compensatori da monitorare
 * Utile per video analysis e feedback
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Lista di pattern compensatori
 */
export function getCompensatoryPatterns(exerciseName: string): CompensatoryPattern[] {
  const description = getTechnicalDescription(exerciseName);
  return description?.dcssVariability.compensatoryPatterns ?? [];
}

/**
 * Ottieni le variazioni accettabili secondo DCSS
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Lista di variazioni accettabili
 */
export function getAcceptableVariations(exerciseName: string): string[] {
  const description = getTechnicalDescription(exerciseName);
  return description?.dcssVariability.acceptableVariations ?? [];
}

/**
 * Genera una descrizione semplificata per UI
 * Compatibile con il formato attuale di exerciseDescriptions.ts
 * 
 * @param exerciseName - Nome dell'esercizio
 * @returns Oggetto compatibile con ExerciseDescription legacy
 */
export function getLegacyDescription(exerciseName: string): {
  description: string;
  technique: string[];
  dcssNote?: string;
  commonVariations?: string[];
} | null {
  const tech = getTechnicalDescription(exerciseName);
  if (!tech) return null;
  
  return {
    description: `${tech.nameIT}. ${tech.biomechanics.primaryMuscles.map(m => m.muscle).join(', ')} come muscoli principali.`,
    technique: tech.coachingCues.execution,
    dcssNote: tech.dcssVariability.anthropometricFactors[0],
    commonVariations: tech.dcssVariability.acceptableVariations.slice(0, 3)
  };
}

/**
 * Lista tutti gli esercizi disponibili per un pattern
 * 
 * @param pattern - Pattern di movimento
 * @returns Lista di nomi esercizi
 */
export function getExercisesByPattern(pattern: string): string[] {
  return Object.entries(TECHNICAL_EXERCISE_DATABASE)
    .filter(([_, desc]) => desc.pattern === pattern)
    .map(([name, _]) => name);
}

/**
 * Lista tutti gli esercizi disponibili per un equipment
 * 
 * @param equipment - Tipo di attrezzatura
 * @returns Lista di nomi esercizi
 */
export function getExercisesByEquipment(equipment: string): string[] {
  return Object.entries(TECHNICAL_EXERCISE_DATABASE)
    .filter(([_, desc]) => desc.equipment === equipment)
    .map(([name, _]) => name);
}

/**
 * Ottieni statistiche sul database
 */
export function getDatabaseStats(): {
  totalExercises: number;
  byPattern: Record<string, number>;
  byEquipment: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const exercises = Object.values(TECHNICAL_EXERCISE_DATABASE);
  
  const byPattern: Record<string, number> = {};
  const byEquipment: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  
  exercises.forEach(ex => {
    byPattern[ex.pattern] = (byPattern[ex.pattern] || 0) + 1;
    byEquipment[ex.equipment] = (byEquipment[ex.equipment] || 0) + 1;
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
  });
  
  return {
    totalExercises: exercises.length,
    byPattern,
    byEquipment,
    byCategory
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default TECHNICAL_EXERCISE_DATABASE;
