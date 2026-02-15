/**
 * PROGRESSIVE OVERLOAD SYSTEM - TrainSmart
 * 
 * Implementa progressione sistematica del carico nel tempo.
 * 
 * STRATEGIE:
 * 1. Linear Progression (beginners): +2.5% ogni settimana
 * 2. Double Progression (intermediate): aumenta reps, poi peso
 * 3. Wave Periodization (advanced): cicli di carico ondulatori
 * 
 * REFERENCE: 
 * - Schoenfeld BJ et al. (2017) - Progressive overload principles
 * - Zourdos MC et al. (2016) - RIR-based training prescription
 */

// ============================================================================
// TYPES
// ============================================================================

export type ProgressionStrategy = 'linear' | 'double' | 'wave' | 'autoregulated';

/**
 * Raccomandazione carico dalla Video Analysis
 */
export type VideoLoadRecommendation =
  | 'increase_5_percent'
  | 'maintain'
  | 'decrease_10_percent'
  | 'decrease_20_percent';

/**
 * Risultato dell'applicazione della raccomandazione video
 */
export interface VideoProgressionResult extends ProgressionResult {
  videoApplied: boolean;
  videoRecommendation?: VideoLoadRecommendation;
  videoScore?: number;
  originalWeight?: number;  // Peso prima dell'override video
}

export interface ProgressionConfig {
  strategy: ProgressionStrategy;
  weeklyIncrementPercent: number;
  minRepsForProgression: number;
  maxRepsBeforeProgression: number;
  deloadFrequencyWeeks: number;
  deloadPercent: number;
  minWeightIncrementKg: number;
}

export interface ProgressionResult {
  newWeight: number;
  weightChange: number;
  percentChange: number;
  reason: string;
  isDeload: boolean;
  nextTarget?: {
    sets: number;
    reps: string;
    weight: number;
  };
}

export interface WeeklyPlan {
  week: number;
  targetWeight: number;
  targetReps: string;
  note: string;
  isDeload: boolean;
}

export interface ExerciseProgressionHistory {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  rir: number;
  e1rm: number;
}

// ============================================================================
// CONFIGURATION BY LEVEL
// ============================================================================

export const PROGRESSION_CONFIG: Record<string, ProgressionConfig> = {
  beginner: {
    strategy: 'linear',
    weeklyIncrementPercent: 2.5,
    minRepsForProgression: 0, // non usato in linear
    maxRepsBeforeProgression: 0, // non usato in linear
    deloadFrequencyWeeks: 4,
    deloadPercent: 10,
    minWeightIncrementKg: 2.5
  },
  intermediate: {
    strategy: 'double',
    weeklyIncrementPercent: 0, // basato su reps raggiunge
    minRepsForProgression: 8,
    maxRepsBeforeProgression: 12,
    deloadFrequencyWeeks: 5,
    deloadPercent: 15,
    minWeightIncrementKg: 2.5
  },
  advanced: {
    strategy: 'wave',
    weeklyIncrementPercent: 0,
    minRepsForProgression: 0,
    maxRepsBeforeProgression: 0,
    deloadFrequencyWeeks: 6,
    deloadPercent: 20,
    minWeightIncrementKg: 1.25
  }
};

// Configurazione per tipo di esercizio
export const EXERCISE_TYPE_MODIFIERS: Record<string, Partial<ProgressionConfig>> = {
  compound_lower: {
    weeklyIncrementPercent: 2.5,
    minWeightIncrementKg: 2.5
  },
  compound_upper: {
    weeklyIncrementPercent: 2.0,
    minWeightIncrementKg: 2.5
  },
  isolation: {
    weeklyIncrementPercent: 1.5,
    minWeightIncrementKg: 1.25
  },
  bodyweight: {
    // Per bodyweight, la progressione è su variante/reps, non peso
    weeklyIncrementPercent: 0,
    minWeightIncrementKg: 0
  }
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Arrotonda il peso all'incremento più vicino disponibile in palestra
 */
function roundToNearestIncrement(weight: number, increment: number = 2.5): number {
  return Math.round(weight / increment) * increment;
}

/**
 * Calcola Estimated 1RM — delegato al SSOT (oneRepMaxCalculator)
 */
import { estimate1RM } from './oneRepMaxCalculator';

export function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 15) reps = 15; // Cap per accuratezza
  return Math.round(estimate1RM(weight, reps));
}

/**
 * Calcola peso per un target di reps dato un E1RM — delegato al SSOT
 */
import { calculateNRMFrom1RM } from './oneRepMaxCalculator';

export function weightForReps(e1rm: number, targetReps: number): number {
  if (targetReps === 1) return e1rm;
  return roundToNearestIncrement(calculateNRMFrom1RM(e1rm, targetReps));
}

/**
 * Determina il tipo di esercizio per applicare modificatori
 */
function getExerciseType(exerciseName: string, pattern?: string): string {
  const nameLower = exerciseName.toLowerCase();
  
  // Bodyweight
  if (nameLower.includes('push-up') || nameLower.includes('pull-up') || 
      nameLower.includes('dip') || nameLower.includes('plank')) {
    return 'bodyweight';
  }
  
  // Compound lower
  if (nameLower.includes('squat') || nameLower.includes('deadlift') || 
      nameLower.includes('leg press') || pattern === 'lower_push' || pattern === 'lower_pull') {
    return 'compound_lower';
  }
  
  // Compound upper
  if (nameLower.includes('bench') || nameLower.includes('row') || 
      nameLower.includes('press') || nameLower.includes('pulldown')) {
    return 'compound_upper';
  }
  
  // Default to isolation
  return 'isolation';
}

/**
 * MAIN FUNCTION: Calcola il peso per la prossima sessione
 */
export function calculateNextWeight(
  currentWeight: number,
  completedReps: number,
  targetReps: number,
  level: string,
  weekNumber: number,
  exerciseName: string = '',
  pattern?: string
): ProgressionResult {
  const baseConfig = PROGRESSION_CONFIG[level] || PROGRESSION_CONFIG.intermediate;
  const exerciseType = getExerciseType(exerciseName, pattern);
  const typeModifiers = EXERCISE_TYPE_MODIFIERS[exerciseType] || {};
  
  // Merge config con modificatori
  const config: ProgressionConfig = { ...baseConfig, ...typeModifiers };
  
  // ========== CHECK DELOAD ==========
  if (weekNumber > 0 && weekNumber % config.deloadFrequencyWeeks === 0) {
    const deloadWeight = roundToNearestIncrement(
      currentWeight * (1 - config.deloadPercent / 100),
      config.minWeightIncrementKg
    );
    
    return {
      newWeight: deloadWeight,
      weightChange: deloadWeight - currentWeight,
      percentChange: -config.deloadPercent,
      reason: `📉 Settimana di deload (settimana ${weekNumber}) - Riduzione ${config.deloadPercent}%`,
      isDeload: true,
      nextTarget: {
        sets: 3,
        reps: `${targetReps}`,
        weight: deloadWeight
      }
    };
  }
  
  // ========== LINEAR PROGRESSION (Beginners) ==========
  if (config.strategy === 'linear') {
    const increment = currentWeight * (config.weeklyIncrementPercent / 100);
    const newWeight = roundToNearestIncrement(
      currentWeight + increment,
      config.minWeightIncrementKg
    );
    
    // Assicurati che ci sia almeno l'incremento minimo
    const finalWeight = newWeight <= currentWeight 
      ? currentWeight + config.minWeightIncrementKg 
      : newWeight;
    
    return {
      newWeight: finalWeight,
      weightChange: finalWeight - currentWeight,
      percentChange: ((finalWeight - currentWeight) / currentWeight) * 100,
      reason: `📈 Progressione lineare: +${config.weeklyIncrementPercent}% settimanale`,
      isDeload: false,
      nextTarget: {
        sets: 3,
        reps: `${targetReps}`,
        weight: finalWeight
      }
    };
  }
  
  // ========== DOUBLE PROGRESSION (Intermediate) ==========
  if (config.strategy === 'double') {
    // Se hai raggiunto il top del range di reps, aumenta peso
    if (completedReps >= config.maxRepsBeforeProgression) {
      const increment = Math.max(
        currentWeight * 0.05, // 5%
        config.minWeightIncrementKg
      );
      const newWeight = roundToNearestIncrement(
        currentWeight + increment,
        config.minWeightIncrementKg
      );
      
      return {
        newWeight,
        weightChange: newWeight - currentWeight,
        percentChange: ((newWeight - currentWeight) / currentWeight) * 100,
        reason: `🎯 Hai raggiunto ${completedReps} reps! Aumenta peso e torna a ${config.minRepsForProgression} reps`,
        isDeload: false,
        nextTarget: {
          sets: 3,
          reps: `${config.minRepsForProgression}-${config.maxRepsBeforeProgression}`,
          weight: newWeight
        }
      };
    }
    
    // Altrimenti continua con stesso peso, punta a più reps
    return {
      newWeight: currentWeight,
      weightChange: 0,
      percentChange: 0,
      reason: `💪 Continua con ${currentWeight}kg - Obiettivo: raggiungere ${config.maxRepsBeforeProgression} reps`,
      isDeload: false,
      nextTarget: {
        sets: 3,
        reps: `${Math.min(completedReps + 1, config.maxRepsBeforeProgression)}+`,
        weight: currentWeight
      }
    };
  }
  
  // ========== WAVE PERIODIZATION (Advanced) ==========
  if (config.strategy === 'wave') {
    // Pattern: Week 1 = medium, Week 2 = heavy, Week 3 = light
    const wavePosition = weekNumber % 3;
    
    let intensityMultiplier: number;
    let repsTarget: string;
    let note: string;
    
    switch (wavePosition) {
      case 1: // Medium
        intensityMultiplier = 1.0;
        repsTarget = '8-10';
        note = '🔸 Wave Medium - Volume moderato';
        break;
      case 2: // Heavy
        intensityMultiplier = 1.05;
        repsTarget = '5-6';
        note = '🔴 Wave Heavy - Alta intensità';
        break;
      case 0: // Light (week 3, 6, 9...)
        intensityMultiplier = 0.90;
        repsTarget = '12-15';
        note = '🟢 Wave Light - Recovery/Volume';
        break;
      default:
        intensityMultiplier = 1.0;
        repsTarget = '8-10';
        note = 'Wave standard';
    }
    
    const newWeight = roundToNearestIncrement(
      currentWeight * intensityMultiplier,
      config.minWeightIncrementKg
    );
    
    return {
      newWeight,
      weightChange: newWeight - currentWeight,
      percentChange: (intensityMultiplier - 1) * 100,
      reason: note,
      isDeload: wavePosition === 0,
      nextTarget: {
        sets: wavePosition === 2 ? 4 : 3,
        reps: repsTarget,
        weight: newWeight
      }
    };
  }
  
  // ========== AUTOREGULATED (fallback) ==========
  // Basato puramente su RIR/performance della sessione
  return {
    newWeight: currentWeight,
    weightChange: 0,
    percentChange: 0,
    reason: '🤖 Autoregolazione - segui il sistema RIR',
    isDeload: false
  };
}

// ============================================================================
// PLANNING FUNCTIONS
// ============================================================================

/**
 * Genera piano di progressione per N settimane
 */
export function generateProgressionPlan(
  startingWeight: number,
  level: string,
  weeks: number,
  exerciseName: string = '',
  pattern?: string
): WeeklyPlan[] {
  const plan: WeeklyPlan[] = [];
  let currentWeight = startingWeight;
  const config = PROGRESSION_CONFIG[level] || PROGRESSION_CONFIG.intermediate;
  
  for (let week = 1; week <= weeks; week++) {
    const result = calculateNextWeight(
      currentWeight,
      10, // Assume reps completate per simulazione
      10,
      level,
      week,
      exerciseName,
      pattern
    );
    
    plan.push({
      week,
      targetWeight: result.newWeight,
      targetReps: result.nextTarget?.reps || '8-12',
      note: result.reason,
      isDeload: result.isDeload
    });
    
    // Aggiorna per prossima settimana (skip deload per calcolo)
    if (!result.isDeload) {
      currentWeight = result.newWeight;
    }
  }
  
  return plan;
}

/**
 * Analizza storico e suggerisce prossima progressione
 */
export function analyzeProgressionHistory(
  history: ExerciseProgressionHistory[],
  level: string
): {
  trend: 'improving' | 'plateau' | 'declining';
  suggestion: string;
  estimatedE1RM: number;
  weeklyE1RMChange: number;
} {
  if (history.length < 2) {
    return {
      trend: 'improving',
      suggestion: 'Continua a raccogliere dati per analisi accurata',
      estimatedE1RM: history[0]?.e1rm || 0,
      weeklyE1RMChange: 0
    };
  }
  
  // Calcola trend E1RM
  const recentE1RMs = history.slice(-4).map(h => h.e1rm);
  const avgRecent = recentE1RMs.reduce((a, b) => a + b, 0) / recentE1RMs.length;
  
  const olderE1RMs = history.slice(-8, -4).map(h => h.e1rm);
  const avgOlder = olderE1RMs.length > 0 
    ? olderE1RMs.reduce((a, b) => a + b, 0) / olderE1RMs.length 
    : avgRecent;
  
  const weeklyChange = (avgRecent - avgOlder) / Math.max(olderE1RMs.length, 1);
  
  let trend: 'improving' | 'plateau' | 'declining';
  let suggestion: string;
  
  if (weeklyChange > 1) {
    trend = 'improving';
    suggestion = '✅ Ottima progressione! Continua con la strategia attuale.';
  } else if (weeklyChange >= -0.5) {
    trend = 'plateau';
    suggestion = '⚠️ Plateau rilevato. Considera: variare stimolo, aumentare volume, o prendere un deload.';
  } else {
    trend = 'declining';
    suggestion = '🔴 Performance in calo. Verifica: recupero, nutrizione, stress. Considera un deload.';
  }
  
  return {
    trend,
    suggestion,
    estimatedE1RM: Math.round(avgRecent),
    weeklyE1RMChange: Math.round(weeklyChange * 10) / 10
  };
}

// ============================================================================
// VIDEO ANALYSIS INTEGRATION
// ============================================================================

/**
 * Percentuali di modifica per ogni raccomandazione video
 */
const VIDEO_RECOMMENDATION_MODIFIERS: Record<VideoLoadRecommendation, number> = {
  'increase_5_percent': 1.05,    // +5%
  'maintain': 1.0,               // Nessuna modifica
  'decrease_10_percent': 0.90,   // -10%
  'decrease_20_percent': 0.80    // -20%
};

/**
 * Messaggi per l'utente in base alla raccomandazione
 */
const VIDEO_RECOMMENDATION_MESSAGES: Record<VideoLoadRecommendation, string> = {
  'increase_5_percent': '🎥✅ Video Analysis: Tecnica eccellente! Puoi aumentare il carico',
  'maintain': '🎥 Video Analysis: Tecnica corretta, mantieni il carico attuale',
  'decrease_10_percent': '🎥⚠️ Video Analysis: Problemi tecnici rilevati, riduci il carico del 10%',
  'decrease_20_percent': '🎥🚨 Video Analysis: Problemi significativi, riduci il carico del 20%'
};

/**
 * Applica la raccomandazione della Video Analysis al peso
 *
 * @param currentWeight - Peso attuale in kg
 * @param videoRecommendation - Raccomandazione dalla video analysis
 * @param minIncrement - Incremento minimo (default 2.5kg)
 * @returns Nuovo peso arrotondato
 */
export function applyVideoRecommendation(
  currentWeight: number,
  videoRecommendation: VideoLoadRecommendation,
  minIncrement: number = 2.5
): number {
  const modifier = VIDEO_RECOMMENDATION_MODIFIERS[videoRecommendation];
  const newWeight = currentWeight * modifier;
  return roundToNearestIncrement(newWeight, minIncrement);
}

/**
 * Calcola il peso per la prossima sessione integrando il feedback della Video Analysis
 *
 * PRIORITÀ:
 * 1. Se video dice DECREASE → OVERRIDE obbligatorio (sicurezza)
 * 2. Se video dice INCREASE → Bonus aggiuntivo alla progressione
 * 3. Se video dice MAINTAIN → Usa progressione normale
 *
 * @param currentWeight - Peso attuale in kg
 * @param completedReps - Reps completate nell'ultima sessione
 * @param targetReps - Reps target
 * @param level - Livello utente ('beginner' | 'intermediate' | 'advanced')
 * @param weekNumber - Numero settimana nel programma
 * @param exerciseName - Nome esercizio
 * @param pattern - Pattern movimento (opzionale)
 * @param videoRecommendation - Raccomandazione dalla video analysis (opzionale)
 * @param videoScore - Score tecnica 1-10 dalla video analysis (opzionale)
 */
export function calculateNextWeightWithVideo(
  currentWeight: number,
  completedReps: number,
  targetReps: number,
  level: string,
  weekNumber: number,
  exerciseName: string = '',
  pattern?: string,
  videoRecommendation?: VideoLoadRecommendation,
  videoScore?: number
): VideoProgressionResult {
  // 1. Calcola progressione base (senza video)
  const baseResult = calculateNextWeight(
    currentWeight,
    completedReps,
    targetReps,
    level,
    weekNumber,
    exerciseName,
    pattern
  );

  // Se non c'è raccomandazione video, ritorna risultato base
  if (!videoRecommendation) {
    return {
      ...baseResult,
      videoApplied: false
    };
  }

  const exerciseType = getExerciseType(exerciseName, pattern);
  const minIncrement = EXERCISE_TYPE_MODIFIERS[exerciseType]?.minWeightIncrementKg || 2.5;

  // 2. CASO DECREASE: Override obbligatorio per sicurezza
  if (videoRecommendation === 'decrease_10_percent' || videoRecommendation === 'decrease_20_percent') {
    const videoWeight = applyVideoRecommendation(currentWeight, videoRecommendation, minIncrement);
    const percentChange = ((videoWeight - currentWeight) / currentWeight) * 100;

    return {
      newWeight: videoWeight,
      weightChange: videoWeight - currentWeight,
      percentChange,
      reason: VIDEO_RECOMMENDATION_MESSAGES[videoRecommendation],
      isDeload: true,  // Tratta come deload
      videoApplied: true,
      videoRecommendation,
      videoScore,
      originalWeight: baseResult.newWeight,
      nextTarget: {
        sets: 3,
        reps: `${targetReps}`,
        weight: videoWeight
      }
    };
  }

  // 3. CASO INCREASE: Applica bonus +5% alla progressione calcolata
  if (videoRecommendation === 'increase_5_percent') {
    // Applica +5% al peso calcolato dalla progressione base
    const videoWeight = roundToNearestIncrement(
      baseResult.newWeight * 1.05,
      minIncrement
    );
    const percentChange = ((videoWeight - currentWeight) / currentWeight) * 100;

    return {
      newWeight: videoWeight,
      weightChange: videoWeight - currentWeight,
      percentChange,
      reason: `${baseResult.reason} + ${VIDEO_RECOMMENDATION_MESSAGES[videoRecommendation]}`,
      isDeload: false,
      videoApplied: true,
      videoRecommendation,
      videoScore,
      originalWeight: baseResult.newWeight,
      nextTarget: {
        sets: baseResult.nextTarget?.sets || 3,
        reps: baseResult.nextTarget?.reps || `${targetReps}`,
        weight: videoWeight
      }
    };
  }

  // 4. CASO MAINTAIN: Usa progressione normale
  return {
    ...baseResult,
    videoApplied: true,
    videoRecommendation,
    videoScore,
    reason: `${baseResult.reason} (${VIDEO_RECOMMENDATION_MESSAGES[videoRecommendation]})`
  };
}

/**
 * Genera piano di progressione con supporto video analysis
 */
export function generateProgressionPlanWithVideo(
  startingWeight: number,
  level: string,
  weeks: number,
  exerciseName: string = '',
  pattern?: string,
  videoRecommendations?: Map<number, { recommendation: VideoLoadRecommendation; score: number }>
): WeeklyPlan[] {
  const plan: WeeklyPlan[] = [];
  let currentWeight = startingWeight;

  for (let week = 1; week <= weeks; week++) {
    const videoData = videoRecommendations?.get(week);

    const result = calculateNextWeightWithVideo(
      currentWeight,
      10,
      10,
      level,
      week,
      exerciseName,
      pattern,
      videoData?.recommendation,
      videoData?.score
    );

    plan.push({
      week,
      targetWeight: result.newWeight,
      targetReps: result.nextTarget?.reps || '8-12',
      note: result.reason,
      isDeload: result.isDeload
    });

    if (!result.isDeload) {
      currentWeight = result.newWeight;
    }
  }

  return plan;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const ProgressiveOverload = {
  calculateNextWeight,
  calculateNextWeightWithVideo,
  applyVideoRecommendation,
  generateProgressionPlan,
  generateProgressionPlanWithVideo,
  analyzeProgressionHistory,
  calculateE1RM,
  weightForReps,
  roundToNearestIncrement,
  PROGRESSION_CONFIG,
  EXERCISE_TYPE_MODIFIERS,
  VIDEO_RECOMMENDATION_MODIFIERS,
  VIDEO_RECOMMENDATION_MESSAGES
};

export default ProgressiveOverload;
