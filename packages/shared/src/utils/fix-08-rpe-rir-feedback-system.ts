/**
 * FIX 8: SISTEMA RPE/RIR FEEDBACK MIGLIORATO
 * 
 * PROBLEMI ATTUALI:
 * 1. Nessun warm-up set di calibrazione
 * 2. Aggiustamenti troppo aggressivi (±10%)
 * 3. Confusione RIR vs RPE
 * 4. Nessun learning period per principianti
 * 5. Non differenzia compound vs isolation
 * 6. Manca feedback pre-set
 * 
 * SOLUZIONI:
 * 1. "Feeler Set" opzionale prima dei working sets
 * 2. Aggiustamenti graduali con damping
 * 3. Separazione chiara RIR/RPE con conversione validata
 * 4. Learning period di 4 sessioni per calibrare l'utente
 * 5. Moltiplicatori diversi per tipo esercizio
 * 6. Check-in pre-workout con readiness score
 */

import { Level, Exercise } from '../types';

// ============================================================
// TIPI
// ============================================================

/**
 * Feedback dell'utente per un singolo set
 */
interface SetFeedback {
  setNumber: number;
  repsCompleted: number;
  repsTarget: number;
  weightUsed: number;
  rpe: number;           // 1-10: Sforzo percepito
  rir: number;           // 0-5: Reps che potevi ancora fare
  tempoSeconds?: number; // Tempo totale del set
  formQuality?: 'perfect' | 'good' | 'degraded' | 'failed';
}

/**
 * Readiness pre-workout
 */
interface ReadinessCheck {
  sleepQuality: number;      // 1-10
  stressLevel: number;       // 1-10
  musclesoreness: number;    // 1-10 (DOMS)
  motivation: number;        // 1-10
  nutritionToday: 'good' | 'normal' | 'poor';
  hydration: 'good' | 'normal' | 'poor';
  hoursSlept?: number;
}

/**
 * Risultato della calibrazione utente
 */
interface UserCalibration {
  userId: string;
  sessionsCompleted: number;
  isCalibrated: boolean;
  rirAccuracy: number;        // 0-1: quanto è accurato nel stimare RIR
  rpeConsistency: number;     // 0-1: quanto è consistente nei rating
  tendencyBias: 'overestimates' | 'underestimates' | 'accurate';
  adjustmentFactor: number;   // Moltiplicatore per correggere il bias
  lastUpdated: string;
}

/**
 * Suggerimento di aggiustamento
 */
interface AdjustmentSuggestion {
  type: 'increase_weight' | 'decrease_weight' | 'increase_reps' | 'decrease_reps' | 'maintain' | 'stop_exercise';
  confidence: 'high' | 'medium' | 'low';
  percentChange: number;
  reason: string;
  applyTo: 'this_set' | 'next_set' | 'next_session';
  userMessage: string;
}

/**
 * Tipo di esercizio per modulazione
 */
type ExerciseCategory = 'compound_lower' | 'compound_upper' | 'isolation' | 'core' | 'corrective';

// ============================================================
// CONFIGURAZIONE
// ============================================================

/**
 * Parametri di calibrazione per livello
 */
const CALIBRATION_CONFIG: Record<Level, {
  learningPeriodSessions: number;
  maxAdjustmentPercent: number;
  minSessionsForAutoAdjust: number;
  rirBuffer: number;  // Buffer di sicurezza aggiunto al RIR target
}> = {
  beginner: {
    learningPeriodSessions: 6,    // 6 sessioni prima di auto-adjust
    maxAdjustmentPercent: 5,      // Max ±5% per sessione
    minSessionsForAutoAdjust: 3,  // Almeno 3 sessioni con stesso esercizio
    rirBuffer: 1,                 // +1 RIR di sicurezza
  },
  intermediate: {
    learningPeriodSessions: 4,
    maxAdjustmentPercent: 7.5,
    minSessionsForAutoAdjust: 2,
    rirBuffer: 0,
  },
  advanced: {
    learningPeriodSessions: 2,
    maxAdjustmentPercent: 10,
    minSessionsForAutoAdjust: 1,
    rirBuffer: 0,
  },
};

/**
 * Moltiplicatori fatica per categoria esercizio
 * Compound lower body = più fatica sistemica
 */
const FATIGUE_MULTIPLIERS: Record<ExerciseCategory, number> = {
  compound_lower: 1.3,   // Squat, Deadlift = più faticosi
  compound_upper: 1.1,   // Bench, Row = fatica moderata
  isolation: 0.8,        // Curl, Extension = meno fatica sistemica
  core: 0.7,
  corrective: 0.5,
};

/**
 * Conversione RPE ↔ RIR (basata su ricerca)
 * Helms et al. (2016), Zourdos et al. (2016)
 */
const RPE_TO_RIR: Record<number, number> = {
  10: 0,    // Cedimento
  9.5: 0.5, // Forse 1 rep
  9: 1,     // 1 rep sicura
  8.5: 1.5,
  8: 2,
  7.5: 2.5,
  7: 3,
  6.5: 3.5,
  6: 4,
  5: 5,     // 5+ reps
};

const RIR_TO_RPE: Record<number, number> = {
  0: 10,
  1: 9,
  2: 8,
  3: 7,
  4: 6,
  5: 5,
};

// ============================================================
// 1. READINESS CHECK (PRE-WORKOUT)
// ============================================================

/**
 * Calcola readiness score e suggerisce modifiche alla sessione
 */
export function calculateReadinessScore(check: ReadinessCheck): {
  score: number;           // 0-100
  recommendation: 'full' | 'reduced' | 'light' | 'skip';
  volumeModifier: number;  // 0.5-1.0
  intensityModifier: number;
  message: string;
} {
  // Pesi per ogni fattore
  const weights = {
    sleep: 0.25,
    stress: 0.20,
    soreness: 0.20,
    motivation: 0.15,
    nutrition: 0.10,
    hydration: 0.10,
  };
  
  // Normalizza valori (0-1)
  const sleepScore = check.sleepQuality / 10;
  const stressScore = (10 - check.stressLevel) / 10; // Inverso
  const sorenessScore = (10 - check.musclesoreness) / 10; // Inverso
  const motivationScore = check.motivation / 10;
  const nutritionScore = check.nutritionToday === 'good' ? 1 : check.nutritionToday === 'normal' ? 0.7 : 0.4;
  const hydrationScore = check.hydration === 'good' ? 1 : check.hydration === 'normal' ? 0.7 : 0.4;
  
  // Score pesato
  const rawScore = 
    sleepScore * weights.sleep +
    stressScore * weights.stress +
    sorenessScore * weights.soreness +
    motivationScore * weights.motivation +
    nutritionScore * weights.nutrition +
    hydrationScore * weights.hydration;
  
  const score = Math.round(rawScore * 100);
  
  // Determina raccomandazione
  let recommendation: 'full' | 'reduced' | 'light' | 'skip';
  let volumeModifier: number;
  let intensityModifier: number;
  let message: string;
  
  if (score >= 80) {
    recommendation = 'full';
    volumeModifier = 1.0;
    intensityModifier = 1.0;
    message = '💪 Ottima giornata! Puoi allenarti al 100%.';
  } else if (score >= 60) {
    recommendation = 'reduced';
    volumeModifier = 0.85;
    intensityModifier = 0.95;
    message = '👍 Giornata normale. Riduciamo leggermente il volume (-15%).';
  } else if (score >= 40) {
    recommendation = 'light';
    volumeModifier = 0.7;
    intensityModifier = 0.85;
    message = '⚠️ Recupero incompleto. Sessione leggera consigliata (-30% volume, -15% intensità).';
  } else {
    recommendation = 'skip';
    volumeModifier = 0;
    intensityModifier = 0;
    message = '🛑 Riposo consigliato oggi. Il recupero è parte dell\'allenamento!';
  }
  
  // Fattori critici che forzano riduzione
  if (check.sleepQuality <= 3 || check.hoursSlept && check.hoursSlept < 5) {
    volumeModifier = Math.min(volumeModifier, 0.7);
    message = '😴 Sonno insufficiente. Sessione ridotta per sicurezza.';
  }
  
  if (check.musclesoreness >= 8) {
    volumeModifier = Math.min(volumeModifier, 0.6);
    message = '🔥 DOMS elevato. Sessione molto leggera o mobilità.';
  }
  
  return { score, recommendation, volumeModifier, intensityModifier, message };
}

// ============================================================
// 2. FEELER SET (CALIBRAZIONE PRE-WORKING)
// ============================================================

/**
 * Suggerisce peso per "feeler set" di calibrazione
 * Il feeler set è un set leggero per testare come ci si sente oggi
 */
export function calculateFeelerSetWeight(
  programmedWeight: number,
  lastSessionRPE?: number,
  readinessScore?: number
): {
  feelerWeight: number;
  feelerReps: number;
  instruction: string;
} {
  // Feeler set = 60-70% del peso programmato
  let feelerPercent = 0.65;
  
  // Se ultima sessione era dura, parti più basso
  if (lastSessionRPE && lastSessionRPE >= 9) {
    feelerPercent = 0.55;
  }
  
  // Se readiness bassa, parti ancora più basso
  if (readinessScore && readinessScore < 60) {
    feelerPercent = 0.50;
  }
  
  const feelerWeight = Math.round(programmedWeight * feelerPercent * 2) / 2;
  
  return {
    feelerWeight,
    feelerReps: 5, // Sempre 5 reps per feeler
    instruction: `Esegui 5 reps a ${feelerWeight}kg. Valuta come ti senti. Se RPE > 5, potremmo dover ridurre il peso di lavoro.`,
  };
}

/**
 * Analizza feedback del feeler set e aggiusta peso working sets
 */
export function analyzeFeelerSet(
  feelerFeedback: SetFeedback,
  programmedWeight: number,
  targetRIR: number
): {
  adjustedWorkingWeight: number;
  percentChange: number;
  confidence: 'high' | 'medium' | 'low';
  message: string;
} {
  // Feeler set dovrebbe essere RPE 4-5 (molto facile)
  // Se è più alto, il peso programmato è troppo
  
  const expectedFeelerRPE = 4;
  const actualRPE = feelerFeedback.rpe;
  const rpeDiff = actualRPE - expectedFeelerRPE;
  
  let percentChange = 0;
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let message = '';
  
  if (rpeDiff >= 3) {
    // Feeler set era RPE 7+ = peso programmato TROPPO ALTO
    percentChange = -15;
    confidence = 'high';
    message = `⚠️ Il feeler set era già impegnativo (RPE ${actualRPE}). Riduciamo il peso di lavoro del 15%.`;
  } else if (rpeDiff >= 2) {
    // Feeler set era RPE 6 = peso programmato un po' alto
    percentChange = -10;
    confidence = 'medium';
    message = `📉 Il feeler set era RPE ${actualRPE}. Riduciamo il peso del 10%.`;
  } else if (rpeDiff >= 1) {
    // Feeler set era RPE 5 = peso programmato ok ma monitora
    percentChange = -5;
    confidence = 'low';
    message = `👀 Feeler set RPE ${actualRPE}. Leggera riduzione per sicurezza (-5%).`;
  } else if (rpeDiff <= -2) {
    // Feeler set era RPE 2 o meno = peso programmato troppo basso
    percentChange = 5;
    confidence = 'low';
    message = `📈 Feeler set molto facile (RPE ${actualRPE}). Possiamo aumentare un po' (+5%).`;
  } else {
    // Feeler set era RPE 3-4 = perfetto
    message = `✅ Feeler set perfetto (RPE ${actualRPE}). Il peso programmato è corretto.`;
  }
  
  const adjustedWeight = Math.round(programmedWeight * (1 + percentChange / 100) * 2) / 2;
  
  return { adjustedWorkingWeight: adjustedWeight, percentChange, confidence, message };
}

// ============================================================
// 3. LEARNING PERIOD & USER CALIBRATION
// ============================================================

/**
 * Verifica se l'utente è in learning period
 */
export function isInLearningPeriod(
  calibration: UserCalibration | null,
  level: Level
): boolean {
  if (!calibration) return true;
  
  const config = CALIBRATION_CONFIG[level];
  return calibration.sessionsCompleted < config.learningPeriodSessions;
}

/**
 * Durante il learning period, raccogliamo dati senza fare auto-adjust
 */
export function handleLearningPeriodFeedback(
  feedback: SetFeedback,
  actualOutcome: {
    didFail: boolean;           // Ha fallito il set?
    repsCouldHaveDone: number;  // Quante reps avrebbe potuto fare (retrospettivo)
  }
): {
  rirAccuracyDelta: number;     // Quanto era accurata la stima RIR
  message: string;
} {
  // Calcola RIR reale vs percepito
  const actualRIR = actualOutcome.didFail ? 0 : actualOutcome.repsCouldHaveDone;
  const perceivedRIR = feedback.rir;
  const accuracy = 1 - Math.abs(actualRIR - perceivedRIR) / 5;
  
  let message = '';
  
  if (Math.abs(actualRIR - perceivedRIR) <= 1) {
    message = '✅ Ottima stima del RIR! Il tuo feeling è accurato.';
  } else if (perceivedRIR > actualRIR) {
    message = `📊 Tendenza a sottovalutare la fatica. Pensavi RIR ${perceivedRIR}, era ~${actualRIR}.`;
  } else {
    message = `📊 Tendenza a sopravvalutare la fatica. Pensavi RIR ${perceivedRIR}, era ~${actualRIR}.`;
  }
  
  return { rirAccuracyDelta: accuracy, message };
}

/**
 * Aggiorna calibrazione utente dopo il learning period
 */
export function updateUserCalibration(
  existing: UserCalibration | null,
  newSession: {
    avgRirAccuracy: number;
    avgRpeConsistency: number;
  }
): UserCalibration {
  const sessionsCompleted = (existing?.sessionsCompleted || 0) + 1;
  
  // Media mobile delle metriche
  const alpha = 0.3; // Peso per nuovi dati
  const rirAccuracy = existing
    ? existing.rirAccuracy * (1 - alpha) + newSession.avgRirAccuracy * alpha
    : newSession.avgRirAccuracy;
  
  const rpeConsistency = existing
    ? existing.rpeConsistency * (1 - alpha) + newSession.avgRpeConsistency * alpha
    : newSession.avgRpeConsistency;
  
  // Determina bias
  let tendencyBias: UserCalibration['tendencyBias'] = 'accurate';
  let adjustmentFactor = 1.0;
  
  if (rirAccuracy < 0.6) {
    // Bassa accuratezza = alto adjustment
    adjustmentFactor = rirAccuracy < 0.4 ? 0.7 : 0.85;
  }
  
  // Determina direzione bias (da dati storici)
  // TODO: implementare analisi direzione bias
  
  return {
    userId: existing?.userId || '',
    sessionsCompleted,
    isCalibrated: sessionsCompleted >= 4 && rirAccuracy >= 0.6,
    rirAccuracy,
    rpeConsistency,
    tendencyBias,
    adjustmentFactor,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================
// 4. ANALISI FEEDBACK SET (DURANTE WORKOUT)
// ============================================================

/**
 * Analizza feedback di un set e suggerisce aggiustamento
 * Versione migliorata con damping e categoria esercizio
 */
export function analyzeSetFeedback(
  feedback: SetFeedback,
  targetRIR: number,
  exerciseCategory: ExerciseCategory,
  calibration: UserCalibration | null,
  level: Level,
  isLastSet: boolean
): AdjustmentSuggestion {
  const config = CALIBRATION_CONFIG[level];
  
  // Applica buffer RIR per principianti
  const effectiveTargetRIR = targetRIR + config.rirBuffer;
  
  // Applica correzione calibrazione utente
  let perceivedRIR = feedback.rir;
  if (calibration && calibration.isCalibrated) {
    perceivedRIR = Math.round(feedback.rir * calibration.adjustmentFactor);
  }
  
  const rirDiff = perceivedRIR - effectiveTargetRIR;
  
  // Se in learning period, non suggerire aggiustamenti automatici
  if (isInLearningPeriod(calibration, level)) {
    return {
      type: 'maintain',
      confidence: 'low',
      percentChange: 0,
      reason: 'Learning period - raccolta dati',
      applyTo: 'next_session',
      userMessage: `📊 Stiamo imparando il tuo feeling. RIR ${feedback.rir}, target era ${targetRIR}. Continua così!`,
    };
  }
  
  // Calcola percentuale di aggiustamento con damping
  let baseAdjustment = 0;
  let confidence: AdjustmentSuggestion['confidence'] = 'medium';
  let type: AdjustmentSuggestion['type'] = 'maintain';
  let applyTo: AdjustmentSuggestion['applyTo'] = 'next_session';
  let reason = '';
  let userMessage = '';
  
  // RIR troppo alto = peso troppo leggero
  if (rirDiff >= 3) {
    baseAdjustment = Math.min(config.maxAdjustmentPercent, rirDiff * 2.5);
    type = 'increase_weight';
    confidence = 'high';
    reason = `RIR ${perceivedRIR} vs target ${effectiveTargetRIR}`;
    userMessage = `📈 Peso troppo leggero! Puoi aumentare del ${baseAdjustment.toFixed(0)}%.`;
    applyTo = isLastSet ? 'next_session' : 'next_set';
  } else if (rirDiff >= 2) {
    baseAdjustment = Math.min(config.maxAdjustmentPercent * 0.7, rirDiff * 2);
    type = 'increase_weight';
    confidence = 'medium';
    reason = `RIR ${perceivedRIR} leggermente sopra target ${effectiveTargetRIR}`;
    userMessage = `👍 Set controllato. Prossima sessione +${baseAdjustment.toFixed(0)}%.`;
    applyTo = 'next_session';
  }
  // RIR troppo basso = peso troppo pesante
  else if (rirDiff <= -2) {
    baseAdjustment = -Math.min(config.maxAdjustmentPercent, Math.abs(rirDiff) * 3);
    type = 'decrease_weight';
    confidence = 'high';
    reason = `RIR ${perceivedRIR} sotto target ${effectiveTargetRIR}`;
    userMessage = `⚠️ Set troppo duro! Riduciamo ${Math.abs(baseAdjustment).toFixed(0)}%.`;
    applyTo = 'this_set'; // Aggiusta subito per sicurezza
  } else if (rirDiff <= -1) {
    baseAdjustment = -Math.min(config.maxAdjustmentPercent * 0.5, Math.abs(rirDiff) * 2);
    type = 'decrease_weight';
    confidence = 'medium';
    reason = `RIR ${perceivedRIR} vicino ma sotto target ${effectiveTargetRIR}`;
    userMessage = `📉 Un po' pesante. -${Math.abs(baseAdjustment).toFixed(0)}% per prossimo set.`;
    applyTo = isLastSet ? 'next_session' : 'next_set';
  }
  // RIR nel range
  else {
    type = 'maintain';
    confidence = 'high';
    reason = 'RIR nel range target';
    userMessage = `✅ Perfetto! RIR ${perceivedRIR} = carico calibrato.`;
  }
  
  // Applica moltiplicatore fatica per categoria
  const fatigueMult = FATIGUE_MULTIPLIERS[exerciseCategory];
  const adjustedChange = baseAdjustment * fatigueMult;
  
  // Considera anche reps completate vs target
  const repsDiff = feedback.repsCompleted - feedback.repsTarget;
  if (repsDiff >= 3 && type === 'maintain') {
    // Ha fatto molte più reps = aumenta
    type = 'increase_weight';
    baseAdjustment = Math.min(config.maxAdjustmentPercent * 0.5, repsDiff * 1.5);
    userMessage = `📈 Ottime ${feedback.repsCompleted} reps! +${baseAdjustment.toFixed(0)}% prossima volta.`;
    applyTo = 'next_session';
  } else if (repsDiff <= -2) {
    // Ha fatto molte meno reps = riduci
    type = 'decrease_weight';
    baseAdjustment = -Math.min(config.maxAdjustmentPercent, Math.abs(repsDiff) * 2);
    userMessage = `📉 Solo ${feedback.repsCompleted}/${feedback.repsTarget} reps. Riduciamo per prossima sessione.`;
    applyTo = 'next_session';
  }
  
  // Form quality override
  if (feedback.formQuality === 'degraded' || feedback.formQuality === 'failed') {
    type = 'decrease_weight';
    baseAdjustment = Math.min(baseAdjustment, -5);
    confidence = 'high';
    userMessage = '⚠️ Tecnica compromessa. Riduciamo il carico per sicurezza.';
    applyTo = 'this_set';
  }
  
  return {
    type,
    confidence,
    percentChange: Math.round(adjustedChange * 10) / 10,
    reason,
    applyTo,
    userMessage,
  };
}

// ============================================================
// 5. ANALISI POST-SESSIONE
// ============================================================

/**
 * Analizza l'intera sessione e suggerisce modifiche per la prossima
 */
export function analyzeSessionFeedback(
  sessionFeedback: {
    exercises: Array<{
      name: string;
      category: ExerciseCategory;
      sets: SetFeedback[];
      targetRIR: number;
    }>;
    sessionDurationMinutes: number;
    overallRPE: number;
  },
  readinessCheck: ReadinessCheck,
  calibration: UserCalibration | null,
  level: Level
): {
  sessionQuality: 'excellent' | 'good' | 'suboptimal' | 'poor';
  adjustmentsForNextSession: Array<{
    exerciseName: string;
    adjustment: AdjustmentSuggestion;
  }>;
  volumeAdjustment: number;     // -20% to +10%
  recoveryRecommendation: string;
  insights: string[];
} {
  const insights: string[] = [];
  const adjustments: Array<{ exerciseName: string; adjustment: AdjustmentSuggestion }> = [];
  
  // Analizza ogni esercizio
  let totalRirDiff = 0;
  let exercisesAnalyzed = 0;
  
  for (const exercise of sessionFeedback.exercises) {
    // Considera solo l'ultimo set (più indicativo del carico)
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (!lastSet) continue;
    
    const adjustment = analyzeSetFeedback(
      lastSet,
      exercise.targetRIR,
      exercise.category,
      calibration,
      level,
      true
    );
    
    if (adjustment.type !== 'maintain') {
      adjustments.push({ exerciseName: exercise.name, adjustment });
    }
    
    totalRirDiff += lastSet.rir - exercise.targetRIR;
    exercisesAnalyzed++;
  }
  
  const avgRirDiff = exercisesAnalyzed > 0 ? totalRirDiff / exercisesAnalyzed : 0;
  
  // Determina qualità sessione
  let sessionQuality: 'excellent' | 'good' | 'suboptimal' | 'poor';
  let volumeAdjustment = 0;
  
  if (Math.abs(avgRirDiff) <= 0.5 && sessionFeedback.overallRPE >= 6 && sessionFeedback.overallRPE <= 8) {
    sessionQuality = 'excellent';
    insights.push('🎯 Sessione calibrata perfettamente!');
  } else if (Math.abs(avgRirDiff) <= 1.5 && sessionFeedback.overallRPE <= 9) {
    sessionQuality = 'good';
    insights.push('👍 Buona sessione, piccoli aggiustamenti per ottimizzare.');
  } else if (sessionFeedback.overallRPE >= 9.5 || avgRirDiff <= -2) {
    sessionQuality = 'poor';
    volumeAdjustment = -15;
    insights.push('⚠️ Sessione troppo intensa. Riduciamo il volume per recuperare.');
  } else {
    sessionQuality = 'suboptimal';
    if (avgRirDiff > 1.5) {
      volumeAdjustment = 5;
      insights.push('📈 Sessione troppo leggera. Possiamo spingere di più.');
    } else {
      volumeAdjustment = -10;
      insights.push('📉 Sessione non ottimale. Leggera riduzione per recupero.');
    }
  }
  
  // Recovery recommendation basata su readiness + session quality
  let recoveryRecommendation = '';
  const readinessResult = calculateReadinessScore(readinessCheck);
  
  if (sessionQuality === 'poor' || readinessResult.score < 50) {
    recoveryRecommendation = '🛌 48-72h di recupero consigliato. Focus su sonno e nutrizione.';
  } else if (sessionQuality === 'suboptimal') {
    recoveryRecommendation = '💤 Almeno 48h prima della prossima sessione intensa.';
  } else {
    recoveryRecommendation = '✅ Recupero standard 24-48h.';
  }
  
  return {
    sessionQuality,
    adjustmentsForNextSession: adjustments,
    volumeAdjustment,
    recoveryRecommendation,
    insights,
  };
}

// ============================================================
// 6. HELPER: CATEGORIA ESERCIZIO
// ============================================================

/**
 * Determina categoria esercizio dal pattern
 */
export function getExerciseCategory(pattern: string): ExerciseCategory {
  const lower = pattern.toLowerCase();
  
  if (lower.includes('lower_push') || lower.includes('lower_pull')) {
    return 'compound_lower';
  }
  if (lower.includes('horizontal_push') || lower.includes('horizontal_pull') || 
      lower.includes('vertical_push') || lower.includes('vertical_pull')) {
    return 'compound_upper';
  }
  if (lower.includes('core')) {
    return 'core';
  }
  if (lower.includes('corrective')) {
    return 'corrective';
  }
  
  // Default per accessori
  return 'isolation';
}

// ============================================================
// 7. UI HELPERS
// ============================================================

/**
 * Converte RPE in descrizione testuale
 */
export function getRPEDescription(rpe: number): string {
  if (rpe <= 3) return 'Molto facile - Riscaldamento';
  if (rpe <= 5) return 'Facile - Potrei fare molte più reps';
  if (rpe <= 6) return 'Moderato - 4+ reps in riserva';
  if (rpe <= 7) return 'Sfidante - 3 reps in riserva';
  if (rpe <= 8) return 'Duro - 2 reps in riserva';
  if (rpe <= 9) return 'Molto duro - 1 rep in riserva';
  return 'Massimo - Cedimento';
}

/**
 * Converte RIR in emoji e descrizione
 */
export function getRIRDisplay(rir: number): { emoji: string; text: string; color: string } {
  switch (rir) {
    case 0: return { emoji: '🔥', text: 'Cedimento', color: 'text-red-500' };
    case 1: return { emoji: '⚡', text: '1 in riserva', color: 'text-orange-500' };
    case 2: return { emoji: '💪', text: '2 in riserva', color: 'text-yellow-500' };
    case 3: return { emoji: '👍', text: '3 in riserva', color: 'text-green-500' };
    case 4: return { emoji: '✅', text: '4 in riserva', color: 'text-emerald-500' };
    default: return { emoji: '😌', text: '5+ in riserva', color: 'text-blue-500' };
  }
}

// ============================================================
// EXPORT
// ============================================================

export {
  SetFeedback,
  ReadinessCheck,
  UserCalibration,
  AdjustmentSuggestion,
  ExerciseCategory,
  CALIBRATION_CONFIG,
  FATIGUE_MULTIPLIERS,
  RPE_TO_RIR,
  RIR_TO_RPE,
};
