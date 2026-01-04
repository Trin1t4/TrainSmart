/**
 * FIX 5: ACCESSORI CON VOLUME ADATTATO AL GOAL
 * 
 * PROBLEMA: Gli accessori (bicipiti, tricipiti, polpacci) hanno sempre
 * gli stessi parametri fissi (3 sets × 12 reps @ 60s rest) indipendentemente
 * dal goal dell'utente.
 * 
 * SOLUZIONE:
 * 1. Adattare sets/reps/rest in base al goal
 * 2. Forza: meno reps (6-8), più rest (90s-2min)
 * 3. Ipertrofia: reps medie (10-12), rest standard (60-90s)
 * 4. Resistenza/Dimagrimento: più reps (15-20), meno rest (30-45s)
 * 
 * COME APPLICARE:
 * Sostituire createAccessoryExercise() in weeklySplitGenerator.ts
 */

import { Level, Goal, Exercise } from '../types';
import { ACCESSORY_VARIANTS } from './exerciseVariants';
import { convertToMachineVariant } from './exerciseMapping';

// ============================================================
// CONFIGURAZIONE ACCESSORI PER GOAL
// ============================================================

/**
 * Parametri accessori per goal
 * Struttura: goal → { sets, reps, rest, intensity, notes }
 */
const ACCESSORY_PARAMS_BY_GOAL: Record<string, {
  sets: { beginner: number; intermediate: number; advanced: number };
  reps: { beginner: number | string; intermediate: number | string; advanced: number | string };
  rest: string;
  intensity: string;
  notes?: string;
}> = {
  // ============================================================
  // FORZA: Meno reps, più rest, intensità alta
  // ============================================================
  forza: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 8, intermediate: '6-8', advanced: '5-6' },
    rest: '90s-2min',
    intensity: '80-85%',
    notes: 'Focus forza: carichi pesanti, rest completo',
  },
  strength: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 8, intermediate: '6-8', advanced: '5-6' },
    rest: '90s-2min',
    intensity: '80-85%',
    notes: 'Strength focus: heavy loads, full rest',
  },
  
  // ============================================================
  // IPERTROFIA: Reps medie, tempo sotto tensione
  // ============================================================
  ipertrofia: {
    sets: { beginner: 3, intermediate: 4, advanced: 4 },
    reps: { beginner: '10-12', intermediate: '10-12', advanced: '8-12' },
    rest: '60-90s',
    intensity: '70-75%',
    notes: 'Focus ipertrofia: tempo sotto tensione',
  },
  hypertrophy: {
    sets: { beginner: 3, intermediate: 4, advanced: 4 },
    reps: { beginner: '10-12', intermediate: '10-12', advanced: '8-12' },
    rest: '60-90s',
    intensity: '70-75%',
  },
  muscle_gain: {
    sets: { beginner: 3, intermediate: 4, advanced: 4 },
    reps: { beginner: '10-12', intermediate: '10-12', advanced: '8-12' },
    rest: '60-90s',
    intensity: '70-75%',
  },
  
  // ============================================================
  // DIMAGRIMENTO: Più reps, meno rest (densità metabolica)
  // ============================================================
  dimagrimento: {
    sets: { beginner: 3, intermediate: 3, advanced: 3 },
    reps: { beginner: '12-15', intermediate: '15-18', advanced: '15-20' },
    rest: '30-45s',
    intensity: '60-65%',
    notes: 'Focus metabolico: densità alta',
  },
  fat_loss: {
    sets: { beginner: 3, intermediate: 3, advanced: 3 },
    reps: { beginner: '12-15', intermediate: '15-18', advanced: '15-20' },
    rest: '30-45s',
    intensity: '60-65%',
  },
  
  // ============================================================
  // RESISTENZA: Molte reps, poco rest
  // ============================================================
  resistenza: {
    sets: { beginner: 2, intermediate: 3, advanced: 3 },
    reps: { beginner: 15, intermediate: '15-20', advanced: '20-25' },
    rest: '30s',
    intensity: '50-60%',
    notes: 'Focus endurance: alte ripetizioni',
  },
  endurance: {
    sets: { beginner: 2, intermediate: 3, advanced: 3 },
    reps: { beginner: 15, intermediate: '15-20', advanced: '20-25' },
    rest: '30s',
    intensity: '50-60%',
  },
  
  // ============================================================
  // GENERALE: Bilanciato
  // ============================================================
  generale: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 12, intermediate: '10-12', advanced: '10-12' },
    rest: '60s',
    intensity: '70%',
  },
  general_fitness: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 12, intermediate: '10-12', advanced: '10-12' },
    rest: '60s',
    intensity: '70%',
  },
  
  // ============================================================
  // SPORT: Simile a forza ma con componente esplosiva
  // ============================================================
  prestazioni_sportive: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 10, intermediate: '8-10', advanced: '6-10' },
    rest: '60-90s',
    intensity: '70-80%',
    notes: 'Focus sport: velocità esecuzione',
  },
  sport_performance: {
    sets: { beginner: 3, intermediate: 3, advanced: 4 },
    reps: { beginner: 10, intermediate: '8-10', advanced: '6-10' },
    rest: '60-90s',
    intensity: '70-80%',
  },
};

/**
 * Parametri speciali per polpacci (sempre più reps)
 */
const CALVES_REPS_BONUS = 3; // +3 reps rispetto agli altri accessori

/**
 * Traduzione nomi esercizi
 */
const ACCESSORY_NAMES_IT: Record<string, string> = {
  'Tricep Pushdown': 'Pushdown Tricipiti',
  'Overhead Tricep Extension': 'French Press',
  'Diamond Push-up': 'Push-up Diamante',
  'Bench Dips': 'Dip su Panca',
  'Barbell Curl': 'Curl con Bilanciere',
  'Dumbbell Curl': 'Curl con Manubri',
  'Hammer Curl': 'Hammer Curl',
  'Chin-up': 'Chin-up (presa supina)',
  'Standing Calf Raise': 'Calf Raise in Piedi',
  'Seated Calf Raise': 'Calf Raise Seduto',
  'Single Leg Calf Raise': 'Calf Raise Monopodalico',
  'Donkey Calf Raise': 'Donkey Calf Raise',
};

// ============================================================
// FUNZIONE PRINCIPALE
// ============================================================

/**
 * Crea esercizio accessorio con parametri adattati al goal
 * 
 * SOSTITUISCE createAccessoryExercise() in weeklySplitGenerator.ts
 * 
 * @param muscleGroup - Gruppo muscolare: 'triceps' | 'biceps' | 'calves'
 * @param variantIndex - Indice della variante da usare (0, 1, 2...)
 * @param options - Opzioni (level, goal, location, trainingType)
 * @param dayType - Tipo di giorno DUP (opzionale, per ulteriore customizzazione)
 * @returns Esercizio con parametri adattati
 */
export function createAccessoryExerciseAdapted(
  muscleGroup: 'triceps' | 'biceps' | 'calves',
  variantIndex: number,
  options: {
    level: Level;
    goal: Goal | string;
    location: 'gym' | 'home' | 'home_gym';
    trainingType: 'bodyweight' | 'equipment' | 'machines';
  },
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
): Exercise {
  const { level, goal, location, trainingType } = options;
  
  // 1. Seleziona variante esercizio
  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  const variants = ACCESSORY_VARIANTS[muscleGroup]?.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  ) || [];
  
  if (variants.length === 0) {
    console.warn(`[Accessory] Nessuna variante per ${muscleGroup} @ ${equipment}`);
    return createFallbackAccessory(muscleGroup, goal, level);
  }
  
  const selectedVariant = variants[variantIndex % variants.length];
  let exerciseName = selectedVariant.name;
  
  // 2. Conversione a macchine se richiesto
  if (location === 'gym' && trainingType === 'machines') {
    exerciseName = convertToMachineVariant(exerciseName);
  }
  
  // 3. Ottieni parametri per goal
  const normalizedGoal = normalizeGoal(goal);
  const params = ACCESSORY_PARAMS_BY_GOAL[normalizedGoal] || ACCESSORY_PARAMS_BY_GOAL.generale;
  
  // 4. Estrai valori per livello
  const sets = params.sets[level];
  let reps = params.reps[level];
  let rest = params.rest;
  const intensity = params.intensity;
  
  // 5. Aggiusta per polpacci (sempre più reps)
  if (muscleGroup === 'calves') {
    if (typeof reps === 'number') {
      reps = reps + CALVES_REPS_BONUS;
    } else if (typeof reps === 'string') {
      // "10-12" → "13-15"
      const match = reps.match(/(\d+)-(\d+)/);
      if (match) {
        const low = parseInt(match[1]) + CALVES_REPS_BONUS;
        const high = parseInt(match[2]) + CALVES_REPS_BONUS;
        reps = `${low}-${high}`;
      } else {
        reps = parseInt(reps) + CALVES_REPS_BONUS;
      }
    }
  }
  
  // 6. Aggiusta per dayType (opzionale)
  if (dayType === 'heavy') {
    // Su heavy day: meno reps, più rest
    if (typeof reps === 'number') {
      reps = Math.max(6, reps - 2);
    }
    rest = adjustRest(rest, 1.2);
  } else if (dayType === 'volume') {
    // Su volume day: più reps, meno rest
    if (typeof reps === 'number') {
      reps = reps + 2;
    }
    rest = adjustRest(rest, 0.8);
  }
  
  // 7. Traduci nome
  const translatedName = ACCESSORY_NAMES_IT[exerciseName] || exerciseName;
  
  // 8. Costruisci esercizio
  return {
    pattern: 'core', // Gli accessori usano 'core' come pattern generico
    name: translatedName,
    sets,
    reps,
    rest,
    intensity,
    notes: params.notes,
  };
}

// ============================================================
// FUNZIONI HELPER
// ============================================================

/**
 * Normalizza nome goal
 */
function normalizeGoal(goal: string): string {
  return goal.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Aggiusta rest time di un fattore
 */
function adjustRest(rest: string, factor: number): string {
  // Parse range "60-90s" → [60, 90]
  const rangeMatch = rest.match(/(\d+)-(\d+)\s*s/);
  if (rangeMatch) {
    const low = Math.round(parseInt(rangeMatch[1]) * factor);
    const high = Math.round(parseInt(rangeMatch[2]) * factor);
    return `${low}-${high}s`;
  }
  
  // Parse single "60s"
  const singleMatch = rest.match(/(\d+)\s*s/);
  if (singleMatch) {
    const adjusted = Math.round(parseInt(singleMatch[1]) * factor);
    return `${adjusted}s`;
  }
  
  // Parse minutes "2min"
  const minMatch = rest.match(/(\d+)\s*min/);
  if (minMatch) {
    const seconds = parseInt(minMatch[1]) * 60 * factor;
    if (seconds >= 60) {
      return `${Math.round(seconds / 60)}min`;
    }
    return `${Math.round(seconds)}s`;
  }
  
  return rest;
}

/**
 * Fallback per accessori senza varianti disponibili
 */
function createFallbackAccessory(
  muscleGroup: 'triceps' | 'biceps' | 'calves',
  goal: string,
  level: Level
): Exercise {
  const names: Record<string, string> = {
    triceps: 'Estensione Tricipiti',
    biceps: 'Curl Bicipiti',
    calves: 'Calf Raise',
  };
  
  const params = ACCESSORY_PARAMS_BY_GOAL[normalizeGoal(goal)] || ACCESSORY_PARAMS_BY_GOAL.generale;
  
  return {
    pattern: 'core',
    name: names[muscleGroup],
    sets: params.sets[level],
    reps: params.reps[level],
    rest: params.rest,
    intensity: params.intensity,
    notes: `Accessorio ${muscleGroup}`,
  };
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * PRIMA (codice attuale):
 * ```typescript
 * function createAccessoryExercise(
 *   muscleGroup: 'triceps' | 'biceps' | 'calves',
 *   variantIndex: number,
 *   options: SplitGeneratorOptions,
 *   dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
 * ): Exercise {
 *   // ...
 *   const sets = level === 'advanced' ? 4 : 3;  // ← FISSO!
 *   const reps = muscleGroup === 'calves' ? 15 : 12;  // ← FISSO!
 *   // ...
 *   return {
 *     // ...
 *     sets: sets,
 *     reps: reps,
 *     rest: '60s',  // ← FISSO!
 *     intensity: '70%'  // ← FISSO!
 *   };
 * }
 * ```
 * 
 * DOPO (nuovo codice):
 * ```typescript
 * // Importa la nuova funzione
 * import { createAccessoryExerciseAdapted } from './fix-05-accessory-volume';
 * 
 * // Usa al posto di createAccessoryExercise
 * const exercise = createAccessoryExerciseAdapted(
 *   'triceps',
 *   0,
 *   { level, goal, location, trainingType },
 *   'heavy'
 * );
 * // → Se goal='forza': 3 sets × 6-8 reps @ 90s-2min
 * // → Se goal='dimagrimento': 3 sets × 15-18 reps @ 30-45s
 * ```
 */

// ============================================================
// EXPORT
// ============================================================

export {
  ACCESSORY_PARAMS_BY_GOAL,
  ACCESSORY_NAMES_IT,
};
