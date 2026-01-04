/**
 * FIX 9: AUTO-REGULATION IMPROVEMENTS
 * 
 * Migliora il sistema di auto-regolazione esistente con:
 * 
 * 1. DAMPING: Aggiustamenti graduali invece di +7.5% immediato
 * 2. RIR MEDIA PESATA: Considera tutti i set, non solo l'ultimo
 * 3. LEARNING PERIOD: Primi N sessioni = raccolta dati, no auto-adjust
 * 4. MOLTIPLICATORE CATEGORIA: Compound vs Isolation pesano diversamente
 * 
 * COME APPLICARE:
 * Integrare queste funzioni in LiveWorkoutSession.tsx e autoRegulationService.ts
 */

import { Level } from '../types';

// ============================================================
// CONFIGURAZIONE
// ============================================================

/**
 * Configurazione per livello utente
 */
const LEVEL_CONFIG: Record<Level, {
  learningPeriodSessions: number;  // Sessioni prima di auto-adjust
  maxAdjustmentPercent: number;    // Max adjustment per sessione
  dampingFactor: number;           // 0-1: quanto "smussare" gli adjustment
  minConsecutiveSets: number;      // Set consecutivi per confermare pattern
}> = {
  beginner: {
    learningPeriodSessions: 6,
    maxAdjustmentPercent: 5,
    dampingFactor: 0.5,        // Molto conservativo
    minConsecutiveSets: 3,
  },
  intermediate: {
    learningPeriodSessions: 3,
    maxAdjustmentPercent: 7.5,
    dampingFactor: 0.7,
    minConsecutiveSets: 2,
  },
  advanced: {
    learningPeriodSessions: 1,
    maxAdjustmentPercent: 10,
    dampingFactor: 0.9,        // Quasi diretto
    minConsecutiveSets: 1,
  },
};

/**
 * Moltiplicatori fatica per categoria esercizio
 * Un RPE 9 su Squat è sistemicamente più faticoso di un RPE 9 su Curl
 */
const FATIGUE_MULTIPLIERS: Record<string, number> = {
  // Compound Lower Body - massima fatica sistemica
  lower_push: 1.4,      // Squat, Leg Press
  lower_pull: 1.3,      // Deadlift, RDL
  
  // Compound Upper Body - fatica media-alta
  horizontal_push: 1.1, // Bench, Push-up
  horizontal_pull: 1.1, // Row
  vertical_push: 1.0,   // Military Press
  vertical_pull: 1.0,   // Pull-up, Lat Pulldown
  
  // Isolation / Core - fatica locale
  core: 0.7,
  corrective: 0.5,
  accessory: 0.8,
};

/**
 * Pesi per la media RIR (ultimi set pesano di più)
 */
const SET_WEIGHTS = {
  last: 0.5,        // Ultimo set = 50% del peso
  secondLast: 0.3,  // Penultimo = 30%
  others: 0.2,      // Altri = 20% diviso
};

// ============================================================
// TIPI
// ============================================================

interface SetData {
  setNumber: number;
  repsCompleted: number;
  repsTarget: number;
  rpe: number;
  rir: number;
  weight: number;
}

interface ExerciseSessionData {
  exerciseName: string;
  pattern: string;
  sets: SetData[];
  targetRIR: number;
}

interface AdjustmentResult {
  shouldAdjust: boolean;
  adjustmentPercent: number;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  applyTo: 'next_set' | 'next_session';
}

interface LearningPeriodStatus {
  isInLearningPeriod: boolean;
  sessionsCompleted: number;
  sessionsRemaining: number;
  message: string;
}

interface WeightedRIRResult {
  weightedRIR: number;
  rawRIRs: number[];
  weights: number[];
  interpretation: string;
}

// ============================================================
// 1. LEARNING PERIOD
// ============================================================

/**
 * Verifica se l'utente è ancora nel learning period
 * Durante il learning period:
 * - Raccogliamo dati
 * - NON facciamo auto-adjust
 * - Mostriamo feedback educativo
 */
export function checkLearningPeriod(
  userId: string,
  exerciseName: string,
  sessionsWithExercise: number,
  level: Level
): LearningPeriodStatus {
  const config = LEVEL_CONFIG[level];
  const required = config.learningPeriodSessions;
  
  if (sessionsWithExercise >= required) {
    return {
      isInLearningPeriod: false,
      sessionsCompleted: sessionsWithExercise,
      sessionsRemaining: 0,
      message: '✅ Calibrazione completata. Auto-regolazione attiva.',
    };
  }
  
  const remaining = required - sessionsWithExercise;
  
  return {
    isInLearningPeriod: true,
    sessionsCompleted: sessionsWithExercise,
    sessionsRemaining: remaining,
    message: `📊 Fase di calibrazione: ${sessionsWithExercise}/${required} sessioni. ` +
             `Ancora ${remaining} per attivare auto-regolazione.`,
  };
}

/**
 * Query per ottenere numero sessioni con un esercizio
 */
export async function getSessionCountWithExercise(
  userId: string,
  exerciseName: string,
  supabase: any
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('exercise_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName);
    
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[LearningPeriod] Error:', err);
    return 0;
  }
}

// ============================================================
// 2. RIR MEDIA PESATA
// ============================================================

/**
 * Calcola RIR medio pesato di tutti i set
 * 
 * L'ultimo set pesa di più perché:
 * - È quello che meglio riflette la fatica reale
 * - I primi set possono essere influenzati da warm-up mentale
 * 
 * Ma consideriamo anche i set precedenti perché:
 * - Se tutti i set erano RIR 5 e l'ultimo RIR 1, c'è stata fatica anomala
 * - Pattern di fatica progressiva vs crollo improvviso
 */
export function calculateWeightedRIR(sets: SetData[]): WeightedRIRResult {
  if (sets.length === 0) {
    return {
      weightedRIR: 3, // Default safe
      rawRIRs: [],
      weights: [],
      interpretation: 'Nessun set completato',
    };
  }
  
  if (sets.length === 1) {
    return {
      weightedRIR: sets[0].rir,
      rawRIRs: [sets[0].rir],
      weights: [1.0],
      interpretation: 'Set singolo - RIR diretto',
    };
  }
  
  const rawRIRs = sets.map(s => s.rir);
  const weights: number[] = [];
  
  // Calcola pesi
  for (let i = 0; i < sets.length; i++) {
    if (i === sets.length - 1) {
      // Ultimo set
      weights.push(SET_WEIGHTS.last);
    } else if (i === sets.length - 2) {
      // Penultimo
      weights.push(SET_WEIGHTS.secondLast);
    } else {
      // Altri: dividi il rimanente
      const othersCount = sets.length - 2;
      weights.push(SET_WEIGHTS.others / Math.max(1, othersCount));
    }
  }
  
  // Normalizza pesi
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Calcola media pesata
  let weightedSum = 0;
  for (let i = 0; i < sets.length; i++) {
    weightedSum += rawRIRs[i] * normalizedWeights[i];
  }
  
  const weightedRIR = Math.round(weightedSum * 10) / 10;
  
  // Interpreta pattern
  let interpretation = '';
  const firstHalf = rawRIRs.slice(0, Math.ceil(rawRIRs.length / 2));
  const secondHalf = rawRIRs.slice(Math.ceil(rawRIRs.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (avgFirst - avgSecond >= 2) {
    interpretation = '⚠️ Fatica progressiva marcata (normale per high volume)';
  } else if (avgSecond - avgFirst >= 2) {
    interpretation = '🤔 RIR aumentato nei set finali (possibile warm-up lento)';
  } else if (Math.max(...rawRIRs) - Math.min(...rawRIRs) <= 1) {
    interpretation = '✅ RIR stabile - carico ben calibrato';
  } else {
    interpretation = '📊 Variazione normale tra i set';
  }
  
  return {
    weightedRIR,
    rawRIRs,
    weights: normalizedWeights,
    interpretation,
  };
}

// ============================================================
// 3. DAMPING AGGIUSTAMENTI
// ============================================================

/**
 * Applica damping all'aggiustamento suggerito
 * 
 * Invece di: "RIR +3 = +7.5% immediato"
 * Fa: "RIR +3 = +3.75% (damped) se confermato su 2+ set"
 */
export function calculateDampedAdjustment(
  rirDiff: number,           // RIR percepito - RIR target
  pattern: string,           // Pattern esercizio
  level: Level,
  consecutiveSetsWithSamePattern: number
): AdjustmentResult {
  const config = LEVEL_CONFIG[level];
  const fatigueMult = FATIGUE_MULTIPLIERS[pattern] || 1.0;
  
  // Base adjustment (prima del damping)
  // ~2.5% per punto di RIR di differenza
  const baseAdjustment = rirDiff * 2.5;
  
  // Applica damping
  const dampedAdjustment = baseAdjustment * config.dampingFactor;
  
  // Applica cap
  const cappedAdjustment = Math.max(
    -config.maxAdjustmentPercent,
    Math.min(config.maxAdjustmentPercent, dampedAdjustment)
  );
  
  // Considera la categoria dell'esercizio
  // Compound: più conservativi sugli aumenti (rischio infortunio)
  // Isolation: più liberali
  let finalAdjustment = cappedAdjustment;
  if (cappedAdjustment > 0 && fatigueMult > 1.0) {
    // Aumenti su compound → ancora più conservativi
    finalAdjustment = cappedAdjustment * 0.8;
  }
  
  // Verifica se abbiamo abbastanza conferme
  const hasEnoughConfirmation = consecutiveSetsWithSamePattern >= config.minConsecutiveSets;
  
  // Determina se applicare
  const shouldAdjust = hasEnoughConfirmation && Math.abs(finalAdjustment) >= 2;
  
  // Confidence
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (consecutiveSetsWithSamePattern >= 3 && Math.abs(rirDiff) >= 2) {
    confidence = 'high';
  } else if (consecutiveSetsWithSamePattern < 2) {
    confidence = 'low';
  }
  
  // Reason
  let reason = '';
  if (!shouldAdjust) {
    if (!hasEnoughConfirmation) {
      reason = `Necessarie ${config.minConsecutiveSets - consecutiveSetsWithSamePattern} altre conferme`;
    } else {
      reason = 'Differenza troppo piccola per aggiustare';
    }
  } else if (finalAdjustment > 0) {
    reason = `RIR ${rirDiff > 0 ? '+' : ''}${rirDiff} vs target → peso leggero`;
  } else {
    reason = `RIR ${rirDiff} vs target → peso pesante`;
  }
  
  return {
    shouldAdjust,
    adjustmentPercent: Math.round(finalAdjustment * 10) / 10,
    confidence,
    reason,
    applyTo: confidence === 'high' ? 'next_set' : 'next_session',
  };
}

// ============================================================
// 4. MOLTIPLICATORE CATEGORIA (Per Analisi Sessione)
// ============================================================

/**
 * Calcola RPE "normalizzato" considerando la categoria dell'esercizio
 * 
 * Un RPE 8 su Squat contribuisce di più alla fatica totale
 * di un RPE 8 su Bicep Curl
 */
export function calculateNormalizedSessionFatigue(
  exerciseData: ExerciseSessionData[]
): {
  rawAvgRPE: number;
  normalizedFatigue: number;  // 0-10 scale
  fatigueBreakdown: Array<{
    exercise: string;
    pattern: string;
    avgRPE: number;
    multiplier: number;
    contribution: number;
  }>;
  interpretation: string;
} {
  if (exerciseData.length === 0) {
    return {
      rawAvgRPE: 0,
      normalizedFatigue: 0,
      fatigueBreakdown: [],
      interpretation: 'Nessun esercizio',
    };
  }
  
  const breakdown: Array<{
    exercise: string;
    pattern: string;
    avgRPE: number;
    multiplier: number;
    contribution: number;
  }> = [];
  
  let totalRPE = 0;
  let totalWeightedFatigue = 0;
  let totalWeight = 0;
  
  for (const ex of exerciseData) {
    if (ex.sets.length === 0) continue;
    
    // Calcola RPE medio per questo esercizio
    const avgRPE = ex.sets.reduce((sum, s) => sum + s.rpe, 0) / ex.sets.length;
    totalRPE += avgRPE;
    
    // Ottieni moltiplicatore
    const multiplier = FATIGUE_MULTIPLIERS[ex.pattern] || 1.0;
    
    // Contributo alla fatica (pesato per numero set E moltiplicatore)
    const setsWeight = ex.sets.length;
    const contribution = avgRPE * multiplier * setsWeight;
    
    totalWeightedFatigue += contribution;
    totalWeight += setsWeight * multiplier;
    
    breakdown.push({
      exercise: ex.exerciseName,
      pattern: ex.pattern,
      avgRPE: Math.round(avgRPE * 10) / 10,
      multiplier,
      contribution: Math.round(contribution * 10) / 10,
    });
  }
  
  const rawAvgRPE = totalRPE / exerciseData.length;
  const normalizedFatigue = totalWeight > 0 
    ? totalWeightedFatigue / totalWeight 
    : rawAvgRPE;
  
  // Interpreta
  let interpretation = '';
  if (normalizedFatigue >= 9) {
    interpretation = '🔴 Sessione MOLTO faticosa - considera deload se ripetuto';
  } else if (normalizedFatigue >= 8) {
    interpretation = '🟠 Sessione impegnativa - recupero adeguato necessario';
  } else if (normalizedFatigue >= 6.5) {
    interpretation = '🟢 Sessione produttiva - range ideale';
  } else if (normalizedFatigue >= 5) {
    interpretation = '🔵 Sessione leggera - considera aumentare intensità';
  } else {
    interpretation = '⚪ Sessione molto leggera - aumenta carico';
  }
  
  return {
    rawAvgRPE: Math.round(rawAvgRPE * 10) / 10,
    normalizedFatigue: Math.round(normalizedFatigue * 10) / 10,
    fatigueBreakdown: breakdown,
    interpretation,
  };
}

// ============================================================
// 5. FUNZIONE PRINCIPALE DI ANALISI
// ============================================================

/**
 * Analizza un esercizio e decide se/come aggiustare
 * Combina tutti i miglioramenti
 */
export async function analyzeExerciseForAdjustment(
  userId: string,
  exerciseData: ExerciseSessionData,
  level: Level,
  supabase: any
): Promise<{
  learningStatus: LearningPeriodStatus;
  weightedRIR: WeightedRIRResult;
  adjustment: AdjustmentResult | null;
  summary: string;
}> {
  // 1. Check learning period
  const sessionsCount = await getSessionCountWithExercise(
    userId, 
    exerciseData.exerciseName, 
    supabase
  );
  const learningStatus = checkLearningPeriod(
    userId, 
    exerciseData.exerciseName, 
    sessionsCount, 
    level
  );
  
  // 2. Calcola RIR pesato
  const weightedRIR = calculateWeightedRIR(exerciseData.sets);
  
  // 3. Se in learning period, no adjustment
  if (learningStatus.isInLearningPeriod) {
    return {
      learningStatus,
      weightedRIR,
      adjustment: null,
      summary: `${learningStatus.message}\nRIR medio: ${weightedRIR.weightedRIR} | ${weightedRIR.interpretation}`,
    };
  }
  
  // 4. Calcola adjustment con damping
  const rirDiff = weightedRIR.weightedRIR - exerciseData.targetRIR;
  
  // Conta set consecutivi con stesso pattern di RIR
  let consecutiveSets = 0;
  const threshold = 1; // RIR diff threshold per considerare "stesso pattern"
  for (let i = exerciseData.sets.length - 1; i >= 0; i--) {
    const setRirDiff = exerciseData.sets[i].rir - exerciseData.targetRIR;
    if (Math.sign(setRirDiff) === Math.sign(rirDiff) && Math.abs(setRirDiff) >= 1) {
      consecutiveSets++;
    } else {
      break;
    }
  }
  
  const adjustment = calculateDampedAdjustment(
    rirDiff,
    exerciseData.pattern,
    level,
    consecutiveSets
  );
  
  // 5. Summary
  let summary = '';
  if (adjustment.shouldAdjust) {
    const direction = adjustment.adjustmentPercent > 0 ? '📈' : '📉';
    summary = `${direction} ${adjustment.adjustmentPercent > 0 ? '+' : ''}${adjustment.adjustmentPercent}% ` +
              `(${adjustment.confidence} confidence)\n` +
              `${adjustment.reason}`;
  } else {
    summary = `✅ Nessun aggiustamento\n${adjustment.reason}`;
  }
  
  return {
    learningStatus,
    weightedRIR,
    adjustment,
    summary,
  };
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * In LiveWorkoutSession.tsx, dopo aver raccolto tutti i set di un esercizio:
 * 
 * ```typescript
 * import { analyzeExerciseForAdjustment } from './fix-09-auto-regulation-improvements';
 * 
 * // Dopo l'ultimo set dell'esercizio
 * const analysis = await analyzeExerciseForAdjustment(
 *   userId,
 *   {
 *     exerciseName: currentExercise.name,
 *     pattern: currentExercise.pattern,
 *     sets: setLogs[currentExercise.name],
 *     targetRIR: extractBaseTargetRIR(currentExercise.notes),
 *   },
 *   userLevel,
 *   supabase
 * );
 * 
 * // Mostra feedback all'utente
 * toast.info(analysis.summary);
 * 
 * // Se c'è adjustment da fare
 * if (analysis.adjustment?.shouldAdjust) {
 *   const currentWeight = currentExercise.weight;
 *   const newWeight = currentWeight * (1 + analysis.adjustment.adjustmentPercent / 100);
 *   
 *   if (analysis.adjustment.applyTo === 'next_set') {
 *     // Applica subito (solo per advanced con high confidence)
 *     setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));
 *   } else {
 *     // Persisti per prossima sessione
 *     await persistWeightAdjustment(currentExercise.name, newWeight, analysis.adjustment.adjustmentPercent);
 *   }
 * }
 * ```
 */

// ============================================================
// EXPORT
// ============================================================

export {
  LEVEL_CONFIG,
  FATIGUE_MULTIPLIERS,
  SET_WEIGHTS,
  SetData,
  ExerciseSessionData,
  AdjustmentResult,
  LearningPeriodStatus,
  WeightedRIRResult,
};
