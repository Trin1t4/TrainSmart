/**
 * FIX 3: DUP (DAILY UNDULATING PERIODIZATION) ADATTATO PER LIVELLO
 * 
 * PROBLEMA: I principianti non dovrebbero fare "Heavy Days" con RIR 1-2.
 * Non hanno ancora la propriocezione per fermarsi in sicurezza vicino al cedimento.
 * La letteratura suggerisce RIR 3-4 fisso per i primi 6-12 mesi.
 * 
 * SOLUZIONE:
 * 1. BEGINNER: Elimina Heavy Days, tutto è Moderate con RIR 3-4
 * 2. INTERMEDIATE: DUP standard ma con RIR minimo 2
 * 3. ADVANCED: DUP completo con Heavy/Moderate/Volume
 * 
 * RIFERIMENTI SCIENTIFICI:
 * - Zourdos et al. (2016): RIR accuracy improves with training experience
 * - Hackett et al. (2012): Novices underestimate proximity to failure by 2-4 reps
 * - Helms et al. (2016): RPE-based training requires 6+ months experience
 * 
 * COME APPLICARE:
 * 1. Sostituire getTargetRIR() in weeklySplitGenerator.ts
 * 2. Modificare le chiamate a createExercise per usare getDayTypeForLevel()
 */

import { Level, Goal } from '../types';

// ============================================================
// CONFIGURAZIONE RIR PER LIVELLO
// ============================================================

/**
 * RIR minimi per livello (sicurezza)
 * Basati su letteratura scientifica sulla percezione dello sforzo
 */
const MIN_RIR_BY_LEVEL: Record<Level, number> = {
  beginner: 3,      // Mai sotto RIR 3
  intermediate: 2,  // Mai sotto RIR 2
  advanced: 1,      // Può arrivare a RIR 1
};

/**
 * RIR target per combinazione level + dayType + goal
 * Struttura: level -> dayType -> goal -> RIR
 */
const RIR_MATRIX: Record<Level, Record<string, Record<string, number>>> = {
  // ============================================================
  // BEGINNER: Range conservativo RIR 3-4
  // Nessun Heavy Day reale, tutto è "Moderate" mascherato
  // ============================================================
  beginner: {
    heavy: {
      // "Heavy" per beginner = Moderate con focus tecnica
      forza: 3,
      strength: 3,
      ipertrofia: 4,
      hypertrophy: 4,
      muscle_gain: 4,
      dimagrimento: 4,
      fat_loss: 4,
      resistenza: 4,
      endurance: 4,
      generale: 4,
      general_fitness: 4,
      prestazioni_sportive: 3,
      sport_performance: 3,
      default: 4,
    },
    moderate: {
      forza: 3,
      strength: 3,
      ipertrofia: 4,
      hypertrophy: 4,
      muscle_gain: 4,
      dimagrimento: 4,
      fat_loss: 4,
      resistenza: 4,
      endurance: 4,
      generale: 4,
      general_fitness: 4,
      prestazioni_sportive: 3,
      sport_performance: 3,
      default: 4,
    },
    volume: {
      forza: 4,
      strength: 4,
      ipertrofia: 4,
      hypertrophy: 4,
      muscle_gain: 4,
      dimagrimento: 4,
      fat_loss: 4,
      resistenza: 4,
      endurance: 4,
      generale: 4,
      general_fitness: 4,
      prestazioni_sportive: 4,
      sport_performance: 4,
      default: 4,
    },
  },
  
  // ============================================================
  // INTERMEDIATE: DUP moderato RIR 2-4
  // Heavy Days possibili ma con margine di sicurezza
  // ============================================================
  intermediate: {
    heavy: {
      forza: 2,
      strength: 2,
      ipertrofia: 2,
      hypertrophy: 2,
      muscle_gain: 2,
      dimagrimento: 3,
      fat_loss: 3,
      resistenza: 3,
      endurance: 3,
      generale: 3,
      general_fitness: 3,
      prestazioni_sportive: 2,
      sport_performance: 2,
      default: 2,
    },
    moderate: {
      forza: 2,
      strength: 2,
      ipertrofia: 3,
      hypertrophy: 3,
      muscle_gain: 3,
      dimagrimento: 3,
      fat_loss: 3,
      resistenza: 3,
      endurance: 3,
      generale: 3,
      general_fitness: 3,
      prestazioni_sportive: 2,
      sport_performance: 2,
      default: 3,
    },
    volume: {
      forza: 3,
      strength: 3,
      ipertrofia: 3,
      hypertrophy: 3,
      muscle_gain: 3,
      dimagrimento: 4,
      fat_loss: 4,
      resistenza: 4,
      endurance: 4,
      generale: 4,
      general_fitness: 4,
      prestazioni_sportive: 3,
      sport_performance: 3,
      default: 3,
    },
  },
  
  // ============================================================
  // ADVANCED: DUP completo RIR 1-4
  // Può lavorare vicino al cedimento quando appropriato
  // ============================================================
  advanced: {
    heavy: {
      forza: 1,
      strength: 1,
      ipertrofia: 2,
      hypertrophy: 2,
      muscle_gain: 2,
      dimagrimento: 2,
      fat_loss: 2,
      resistenza: 2,
      endurance: 2,
      generale: 2,
      general_fitness: 2,
      prestazioni_sportive: 1,
      sport_performance: 1,
      default: 2,
    },
    moderate: {
      forza: 2,
      strength: 2,
      ipertrofia: 2,
      hypertrophy: 2,
      muscle_gain: 2,
      dimagrimento: 3,
      fat_loss: 3,
      resistenza: 3,
      endurance: 3,
      generale: 3,
      general_fitness: 3,
      prestazioni_sportive: 2,
      sport_performance: 2,
      default: 2,
    },
    volume: {
      forza: 3,
      strength: 3,
      ipertrofia: 3,
      hypertrophy: 3,
      muscle_gain: 3,
      dimagrimento: 4,
      fat_loss: 4,
      resistenza: 4,
      endurance: 4,
      generale: 4,
      general_fitness: 4,
      prestazioni_sportive: 3,
      sport_performance: 3,
      default: 3,
    },
  },
};

// ============================================================
// FUNZIONE PRINCIPALE - SOSTITUISCE getTargetRIR()
// ============================================================

/**
 * Determina RIR target basato su level, goal e dayType
 * 
 * NOVITÀ rispetto alla versione precedente:
 * - Matrix completa per ogni combinazione
 * - RIR minimi garantiti per livello
 * - Beginner non ha mai Heavy Days reali
 * 
 * @param dayType - Tipo di giorno DUP: 'heavy' | 'volume' | 'moderate'
 * @param goal - Obiettivo utente
 * @param level - Livello fitness
 * @returns RIR target (1-4)
 */
export function getTargetRIR(
  dayType: 'heavy' | 'volume' | 'moderate',
  goal: string,
  level: Level = 'intermediate'
): number {
  // 1. Recupera RIR dalla matrix
  const levelMatrix = RIR_MATRIX[level] || RIR_MATRIX.intermediate;
  const dayMatrix = levelMatrix[dayType] || levelMatrix.moderate;
  const targetRIR = dayMatrix[goal] ?? dayMatrix.default ?? 3;
  
  // 2. Applica floor di sicurezza per livello
  const minRIR = MIN_RIR_BY_LEVEL[level] || 2;
  const safeRIR = Math.max(targetRIR, minRIR);
  
  // 3. Log per debug
  if (level === 'beginner' && dayType === 'heavy') {
    console.log(`⚠️ [DUP Safety] Beginner Heavy Day → RIR forzato a ${safeRIR} (non ${targetRIR})`);
  }
  
  return safeRIR;
}

// ============================================================
// FUNZIONE: ADATTA DAYTYPE PER LIVELLO
// ============================================================

/**
 * Per i principianti, converte Heavy Days in Moderate Days
 * mantenendo comunque una leggera differenziazione nel volume
 */
export function getDayTypeForLevel(
  originalDayType: 'heavy' | 'volume' | 'moderate',
  level: Level
): 'heavy' | 'volume' | 'moderate' {
  if (level === 'beginner') {
    // Beginner: niente heavy, tutto moderate o volume
    if (originalDayType === 'heavy') {
      return 'moderate';
    }
  }
  
  return originalDayType;
}

/**
 * Restituisce la label da mostrare all'utente per il tipo di giorno
 * Per i beginner nascondiamo che sarebbe stato "Heavy"
 */
export function getDayTypeLabel(
  dayType: 'heavy' | 'volume' | 'moderate',
  level: Level,
  locale: 'it' | 'en' = 'it'
): string {
  const labels = {
    it: {
      heavy: 'Intensità Alta',
      moderate: 'Intensità Moderata',
      volume: 'Volume',
      beginner_heavy: 'Focus Tecnica', // Beginner non vede "Heavy"
    },
    en: {
      heavy: 'High Intensity',
      moderate: 'Moderate Intensity',
      volume: 'Volume',
      beginner_heavy: 'Technique Focus',
    },
  };
  
  const l = labels[locale];
  
  if (level === 'beginner' && dayType === 'heavy') {
    return l.beginner_heavy;
  }
  
  return l[dayType];
}

// ============================================================
// FUNZIONE: CALCOLA PARAMETRI VOLUME PER DAYTYPE + LEVEL
// ============================================================

/**
 * Parametri sets/reps adattati per level
 * I beginner fanno meno differenziazione tra i tipi di giorno
 */
export function getVolumeParamsForDayType(
  dayType: 'heavy' | 'volume' | 'moderate',
  level: Level,
  baselineReps: number
): { sets: number; reps: number | string; rest: string } {
  
  // ============================================================
  // BEGINNER: Differenziazione minima, focus su consistenza
  // ============================================================
  if (level === 'beginner') {
    switch (dayType) {
      case 'heavy':
        // "Heavy" per beginner = ancora reps medie, focus tecnica
        return {
          sets: 3,
          reps: Math.max(6, Math.min(10, baselineReps)),
          rest: '2min',
        };
      case 'volume':
        return {
          sets: 3,
          reps: `${baselineReps}-${baselineReps + 2}`,
          rest: '60-90s',
        };
      case 'moderate':
      default:
        return {
          sets: 3,
          reps: Math.max(8, Math.min(12, baselineReps)),
          rest: '90s',
        };
    }
  }
  
  // ============================================================
  // INTERMEDIATE: DUP standard
  // ============================================================
  if (level === 'intermediate') {
    switch (dayType) {
      case 'heavy':
        return {
          sets: 4,
          reps: Math.max(4, Math.min(6, baselineReps - 4)),
          rest: '2-3min',
        };
      case 'volume':
        return {
          sets: 3,
          reps: `${baselineReps}-${baselineReps + 4}`,
          rest: '60-90s',
        };
      case 'moderate':
      default:
        return {
          sets: 3,
          reps: Math.max(8, Math.min(10, baselineReps)),
          rest: '90s-2min',
        };
    }
  }
  
  // ============================================================
  // ADVANCED: DUP completo con range più ampi
  // ============================================================
  switch (dayType) {
    case 'heavy':
      return {
        sets: 5,
        reps: Math.max(3, Math.min(5, baselineReps - 5)),
        rest: '3-4min',
      };
    case 'volume':
      return {
        sets: 4,
        reps: `${baselineReps + 2}-${baselineReps + 6}`,
        rest: '60s',
      };
    case 'moderate':
    default:
      return {
        sets: 4,
        reps: Math.max(6, Math.min(8, baselineReps - 2)),
        rest: '2min',
      };
  }
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * PRIMA (codice attuale):
 * ```typescript
 * const targetRIR = getTargetRIR(dayType, goal, level);
 * // Problema: Beginner poteva avere RIR 2 su Heavy Day
 * ```
 * 
 * DOPO (nuovo codice):
 * ```typescript
 * // Adatta il dayType per il livello
 * const effectiveDayType = getDayTypeForLevel(dayType, level);
 * 
 * // Ottieni RIR sicuro (minimo garantito per livello)
 * const targetRIR = getTargetRIR(effectiveDayType, goal, level);
 * 
 * // Ottieni parametri volume adattati
 * const volumeParams = getVolumeParamsForDayType(effectiveDayType, level, baselineReps);
 * ```
 */

// ============================================================
// EXPORT
// ============================================================

export {
  MIN_RIR_BY_LEVEL,
  RIR_MATRIX,
};
