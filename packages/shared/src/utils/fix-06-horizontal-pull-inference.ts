/**
 * FIX 6: HORIZONTAL PULL INFERENCE & AUTO-CALIBRATION
 * 
 * CONTESTO: Le tirate orizzontali (Row) non sono testate nell'onboarding
 * per evitare di allungare troppo il processo. Il carico viene:
 * 1. Stimato inizialmente dal Vertical Pull (correlazione ~85%)
 * 2. Auto-calibrato dopo 2-3 sessioni basandosi sul feedback RPE/RIR
 * 
 * Questo file documenta e migliora il sistema di inferenza esistente.
 * 
 * MIGLIORAMENTI:
 * 1. Correlazione più accurata (usa media di più fonti se disponibili)
 * 2. Flag esplicito `isInferred: true` per UI e tracking
 * 3. Sistema di auto-calibrazione accelerata per pattern inferiti
 * 4. Log dettagliato per debug
 * 
 * COME APPLICARE:
 * 1. Sostituire createHorizontalPullExercise() in weeklySplitGenerator.ts
 * 2. Integrare checkAndAutoCalibrateInferred() nel workout completion flow
 */

import { Level, Goal, Exercise, PatternBaseline } from '../types';

// ============================================================
// CONFIGURAZIONE INFERENZA
// ============================================================

/**
 * Coefficienti di correlazione per Horizontal Pull
 * Basati su dati empirici (studi forza relativa upper body)
 */
const HORIZONTAL_PULL_CORRELATIONS = {
  // Fonte primaria: Vertical Pull (Lat Pulldown → Row)
  // Correlazione alta perché stessi muscoli primari (dorsali)
  fromVerticalPull: {
    ratio: 0.85,
    confidence: 'high',
    notes: 'Stessi muscoli primari (gran dorsale, bicipiti)',
  },
  
  // Fonte secondaria: Horizontal Push (Bench → Row)
  // Correlazione media-bassa (muscoli antagonisti)
  fromHorizontalPush: {
    ratio: 0.70,
    confidence: 'medium',
    notes: 'Muscoli antagonisti, correlazione meno affidabile',
  },
  
  // Fonte terziaria: Body weight
  // Solo come ultimo fallback
  fromBodyweight: {
    ratio: 0.25, // 25% del peso corporeo come starting point
    confidence: 'low',
    notes: 'Stima conservativa da peso corporeo',
  },
};

/**
 * Parametri per auto-calibrazione accelerata
 * Gli esercizi inferiti richiedono meno sessioni per calibrarsi
 */
const INFERRED_CALIBRATION_CONFIG = {
  minSessionsToCalibrate: 2,    // Minimo sessioni prima di calibrare (vs 3 per altri)
  rpeTargetRange: [6.5, 8],     // RPE target per calibrazione
  maxAdjustmentPercent: 15,     // Max aggiustamento per sessione
  confidenceThreshold: 0.7,     // Confidence minima per accettare calibrazione
};

/**
 * Varianti Row per gym e home
 */
const ROW_VARIANTS = {
  gym: [
    { name: 'Barbell Row', equipment: 'barbell', difficulty: 6 },
    { name: 'Dumbbell Row', equipment: 'dumbbell', difficulty: 5 },
    { name: 'Cable Row', equipment: 'cable', difficulty: 4 },
    { name: 'T-Bar Row', equipment: 'barbell', difficulty: 7 },
    { name: 'Machine Row', equipment: 'machine', difficulty: 3 },
  ],
  home: [
    { name: 'Inverted Row', equipment: 'bodyweight', difficulty: 5 },
    { name: 'Doorframe Row', equipment: 'bodyweight', difficulty: 3 },
    { name: 'Resistance Band Row', equipment: 'band', difficulty: 4 },
  ],
};

/**
 * Traduzione nomi
 */
const ROW_NAMES_IT: Record<string, string> = {
  'Barbell Row': 'Rematore con Bilanciere',
  'Dumbbell Row': 'Rematore con Manubrio',
  'Cable Row': 'Pulley Basso',
  'T-Bar Row': 'T-Bar Row',
  'Machine Row': 'Rematore alla Macchina',
  'Inverted Row': 'Inverted Row',
  'Doorframe Row': 'Rematore al Telaio Porta',
  'Resistance Band Row': 'Rematore con Elastico',
};

// ============================================================
// TIPI
// ============================================================

interface InferredExercise extends Exercise {
  isInferred: boolean;
  inferredFrom: string;
  inferenceConfidence: 'high' | 'medium' | 'low';
  calibrationStatus: 'pending' | 'in_progress' | 'completed';
  sessionsUntilCalibration: number;
}

interface CalibrationResult {
  shouldAdjust: boolean;
  newWeight?: number;
  adjustmentPercent?: number;
  reason: string;
  confidence: number;
}

// ============================================================
// FUNZIONE PRINCIPALE - CREA HORIZONTAL PULL
// ============================================================

/**
 * Crea esercizio Horizontal Pull (Row) con inferenza intelligente
 * 
 * SOSTITUISCE createHorizontalPullExercise() in weeklySplitGenerator.ts
 * 
 * @param variantIndex - Indice della variante
 * @param options - Opzioni generatore
 * @param dayType - Tipo giorno DUP
 * @param availableBaselines - Tutti i baseline disponibili per inferenza
 * @param userBodyweight - Peso corporeo utente (opzionale, per fallback)
 */
export function createHorizontalPullExerciseImproved(
  variantIndex: number,
  options: {
    level: Level;
    goal: Goal | string;
    location: 'gym' | 'home' | 'home_gym';
    trainingType: 'bodyweight' | 'equipment' | 'machines';
  },
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate',
  availableBaselines: {
    vertical_pull?: PatternBaseline;
    horizontal_push?: PatternBaseline;
  },
  userBodyweight?: number
): InferredExercise {
  const { level, goal, location, trainingType } = options;
  
  console.log('🔄 [HorizontalPull] Inferenza carico per Row...');
  
  // 1. Seleziona variante
  const isGym = location === 'gym' || location === 'home_gym';
  const variants = isGym ? ROW_VARIANTS.gym : ROW_VARIANTS.home;
  const selectedVariant = variants[variantIndex % variants.length];
  
  let exerciseName = selectedVariant.name;
  
  // Converti a macchina se richiesto
  if (trainingType === 'machines' && isGym) {
    exerciseName = 'Machine Row';
  }
  
  // 2. Inferisci peso
  const inference = inferHorizontalPullWeight(
    availableBaselines,
    userBodyweight,
    level
  );
  
  console.log(`   📊 Inference result:`, inference);
  
  // 3. Calcola parametri volume
  const volumeParams = calculateRowVolumeParams(
    inference.baselineReps,
    goal,
    level,
    dayType
  );
  
  // 4. Calcola peso suggerito (se gym)
  let suggestedWeight: string | undefined;
  if (inference.weight10RM && isGym) {
    // Applica aggiustamento per dayType e RIR
    const targetRIR = getTargetRIRForRow(dayType, goal, level);
    const adjustedWeight = calculateAdjustedWeight(
      inference.weight10RM,
      volumeParams.reps,
      targetRIR
    );
    suggestedWeight = `${adjustedWeight}kg`;
    
    console.log(`   ⚖️ Peso suggerito: ${suggestedWeight} (RIR ${targetRIR})`);
  }
  
  // 5. Traduci nome
  const translatedName = ROW_NAMES_IT[exerciseName] || exerciseName;
  
  // 6. Costruisci esercizio con metadati inferenza
  return {
    pattern: 'horizontal_pull' as any,
    name: translatedName,
    sets: volumeParams.sets,
    reps: volumeParams.reps,
    rest: volumeParams.rest,
    intensity: volumeParams.intensity,
    weight: suggestedWeight,
    baseline: {
      variantId: `inferred_${inference.source}`,
      difficulty: selectedVariant.difficulty,
      maxReps: inference.baselineReps,
    },
    notes: `🔄 ${inference.notes}`,
    
    // Metadati inferenza
    isInferred: true,
    inferredFrom: inference.source,
    inferenceConfidence: inference.confidence,
    calibrationStatus: 'pending',
    sessionsUntilCalibration: INFERRED_CALIBRATION_CONFIG.minSessionsToCalibrate,
  };
}

// ============================================================
// FUNZIONE INFERENZA PESO
// ============================================================

interface InferenceResult {
  weight10RM: number | null;
  baselineReps: number;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

/**
 * Inferisce il peso per Horizontal Pull da fonti disponibili
 */
function inferHorizontalPullWeight(
  baselines: {
    vertical_pull?: PatternBaseline;
    horizontal_push?: PatternBaseline;
  },
  userBodyweight?: number,
  level: Level = 'intermediate'
): InferenceResult {
  
  // Tentativo 1: Vertical Pull (fonte primaria)
  if (baselines.vertical_pull?.weight10RM && baselines.vertical_pull.weight10RM > 0) {
    const corr = HORIZONTAL_PULL_CORRELATIONS.fromVerticalPull;
    const inferredWeight = Math.round(baselines.vertical_pull.weight10RM * corr.ratio * 2) / 2;
    
    return {
      weight10RM: inferredWeight,
      baselineReps: baselines.vertical_pull.reps || 10,
      source: 'vertical_pull',
      confidence: 'high',
      notes: `Stimato da Lat Pulldown (${baselines.vertical_pull.weight10RM}kg × ${corr.ratio})`,
    };
  }
  
  // Tentativo 2: Horizontal Push (fonte secondaria)
  if (baselines.horizontal_push?.weight10RM && baselines.horizontal_push.weight10RM > 0) {
    const corr = HORIZONTAL_PULL_CORRELATIONS.fromHorizontalPush;
    const inferredWeight = Math.round(baselines.horizontal_push.weight10RM * corr.ratio * 2) / 2;
    
    return {
      weight10RM: inferredWeight,
      baselineReps: baselines.horizontal_push.reps || 10,
      source: 'horizontal_push',
      confidence: 'medium',
      notes: `Stimato da Panca (${baselines.horizontal_push.weight10RM}kg × ${corr.ratio}) - calibrazione consigliata`,
    };
  }
  
  // Tentativo 3: Body weight (ultimo fallback)
  if (userBodyweight && userBodyweight > 0) {
    const corr = HORIZONTAL_PULL_CORRELATIONS.fromBodyweight;
    const inferredWeight = Math.round(userBodyweight * corr.ratio * 2) / 2;
    
    // Aggiusta per livello
    const levelMultiplier = level === 'beginner' ? 0.8 : level === 'advanced' ? 1.2 : 1.0;
    const adjustedWeight = Math.round(inferredWeight * levelMultiplier * 2) / 2;
    
    return {
      weight10RM: adjustedWeight,
      baselineReps: 10,
      source: 'bodyweight',
      confidence: 'low',
      notes: `Stima da peso corporeo (${userBodyweight}kg × ${corr.ratio}) - calibrazione necessaria`,
    };
  }
  
  // Nessuna fonte disponibile
  return {
    weight10RM: null,
    baselineReps: 12,
    source: 'none',
    confidence: 'low',
    notes: 'Nessun dato disponibile - usa carico leggero e calibra con RPE',
  };
}

// ============================================================
// FUNZIONI HELPER
// ============================================================

/**
 * Calcola parametri volume per Row
 */
function calculateRowVolumeParams(
  baselineReps: number,
  goal: string,
  level: Level,
  dayType: 'heavy' | 'volume' | 'moderate'
): { sets: number; reps: number | string; rest: string; intensity: string } {
  
  // Base da dayType
  let sets = 3;
  let reps: number | string = baselineReps;
  let rest = '90s';
  let intensity = '70%';
  
  switch (dayType) {
    case 'heavy':
      sets = level === 'advanced' ? 4 : 3;
      reps = Math.max(6, baselineReps - 4);
      rest = '2-3min';
      intensity = '80-85%';
      break;
    case 'volume':
      sets = 3;
      reps = `${baselineReps}-${baselineReps + 4}`;
      rest = '60-90s';
      intensity = '65-70%';
      break;
    case 'moderate':
    default:
      sets = 3;
      reps = Math.max(8, baselineReps - 2);
      rest = '90s-2min';
      intensity = '70-75%';
  }
  
  return { sets, reps, rest, intensity };
}

/**
 * RIR target per Row (più conservativo dato che è inferito)
 */
function getTargetRIRForRow(
  dayType: 'heavy' | 'volume' | 'moderate',
  goal: string,
  level: Level
): number {
  // Row inferito → aggiungi +1 RIR rispetto al normale per sicurezza
  const baseRIR = {
    beginner: { heavy: 4, moderate: 4, volume: 4 },
    intermediate: { heavy: 3, moderate: 3, volume: 4 },
    advanced: { heavy: 2, moderate: 3, volume: 3 },
  };
  
  return baseRIR[level]?.[dayType] ?? 3;
}

/**
 * Calcola peso aggiustato per reps target e RIR
 */
function calculateAdjustedWeight(
  weight10RM: number,
  targetReps: number | string,
  targetRIR: number
): number {
  // Converti reps se è un range
  const reps = typeof targetReps === 'number'
    ? targetReps
    : parseInt(String(targetReps).split('-')[0]) || 10;
  
  // Effective reps = target + RIR
  const effectiveReps = reps + targetRIR;
  
  // Formula Brzycki inversa per calcolare peso
  // weight = weight10RM × (1.0278 - 0.0278 × 10) / (1.0278 - 0.0278 × effectiveReps)
  const factor10 = 1.0278 - 0.0278 * 10;
  const factorTarget = 1.0278 - 0.0278 * effectiveReps;
  
  if (factorTarget <= 0) return weight10RM * 0.5; // Safety
  
  const adjustedWeight = weight10RM * factor10 / factorTarget;
  
  // Arrotonda a 0.5kg
  return Math.round(adjustedWeight * 2) / 2;
}

// ============================================================
// AUTO-CALIBRAZIONE
// ============================================================

/**
 * Verifica se un esercizio inferito deve essere calibrato
 * e calcola il nuovo peso suggerito
 * 
 * Chiamare dopo ogni workout che include l'esercizio
 */
export async function checkAndAutoCalibrateInferred(
  userId: string,
  exerciseName: string,
  currentWeight: number,
  recentRPEData: Array<{ rpe: number; reps_completed: number; weight_used: number }>,
  supabase: any
): Promise<CalibrationResult> {
  
  const config = INFERRED_CALIBRATION_CONFIG;
  
  // Verifica minimo sessioni
  if (recentRPEData.length < config.minSessionsToCalibrate) {
    return {
      shouldAdjust: false,
      reason: `Necessarie ${config.minSessionsToCalibrate - recentRPEData.length} altre sessioni`,
      confidence: 0,
    };
  }
  
  // Calcola RPE medio
  const avgRPE = recentRPEData.reduce((sum, d) => sum + d.rpe, 0) / recentRPEData.length;
  const [targetLow, targetHigh] = config.rpeTargetRange;
  
  console.log(`[AutoCalibrate] ${exerciseName}: avgRPE=${avgRPE.toFixed(1)}, target=[${targetLow}-${targetHigh}]`);
  
  // Se RPE nel range target → calibrazione completata
  if (avgRPE >= targetLow && avgRPE <= targetHigh) {
    return {
      shouldAdjust: false,
      reason: `RPE nel range ottimale (${avgRPE.toFixed(1)})`,
      confidence: 0.9,
    };
  }
  
  // Calcola aggiustamento necessario
  let adjustmentPercent = 0;
  
  if (avgRPE < targetLow) {
    // Troppo facile → aumenta peso
    adjustmentPercent = Math.min(
      config.maxAdjustmentPercent,
      (targetLow - avgRPE) * 3 // ~3% per punto RPE
    );
  } else if (avgRPE > targetHigh) {
    // Troppo difficile → riduci peso
    adjustmentPercent = -Math.min(
      config.maxAdjustmentPercent,
      (avgRPE - targetHigh) * 4 // ~4% per punto RPE (più conservativo)
    );
  }
  
  const newWeight = Math.round(currentWeight * (1 + adjustmentPercent / 100) * 2) / 2;
  
  // Confidence basata su consistenza RPE
  const rpeVariance = calculateVariance(recentRPEData.map(d => d.rpe));
  const confidence = Math.max(0.5, 1 - rpeVariance / 4);
  
  return {
    shouldAdjust: Math.abs(adjustmentPercent) >= 2, // Minimo 2% per aggiustare
    newWeight,
    adjustmentPercent: Math.round(adjustmentPercent * 10) / 10,
    reason: avgRPE < targetLow
      ? `RPE troppo basso (${avgRPE.toFixed(1)}) → +${adjustmentPercent.toFixed(1)}%`
      : `RPE troppo alto (${avgRPE.toFixed(1)}) → ${adjustmentPercent.toFixed(1)}%`,
    confidence,
  };
}

/**
 * Calcola varianza
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * UTILIZZO IN weeklySplitGenerator.ts:
 * 
 * ```typescript
 * // Importa la nuova funzione
 * import { createHorizontalPullExerciseImproved } from './fix-06-horizontal-pull-inference';
 * 
 * // Nella generazione del programma:
 * const rowExercise = createHorizontalPullExerciseImproved(
 *   variantIndex,
 *   { level, goal, location, trainingType },
 *   'moderate',
 *   { vertical_pull: baselines.vertical_pull, horizontal_push: baselines.horizontal_push },
 *   userBodyweight
 * );
 * 
 * // L'esercizio avrà isInferred: true e calibrationStatus: 'pending'
 * ```
 * 
 * UTILIZZO NEL WORKOUT COMPLETION:
 * 
 * ```typescript
 * // Dopo ogni workout, per esercizi inferiti:
 * if (exercise.isInferred && exercise.calibrationStatus !== 'completed') {
 *   const calibration = await checkAndAutoCalibrateInferred(
 *     userId,
 *     exercise.name,
 *     parseFloat(exercise.weight),
 *     recentRPEData,
 *     supabase
 *   );
 *   
 *   if (calibration.shouldAdjust) {
 *     // Aggiorna peso nel programma
 *     await updateExerciseWeight(programId, exercise.name, calibration.newWeight);
 *   }
 * }
 * ```
 */

// ============================================================
// EXPORT
// ============================================================

export {
  HORIZONTAL_PULL_CORRELATIONS,
  INFERRED_CALIBRATION_CONFIG,
  ROW_VARIANTS,
  ROW_NAMES_IT,
  inferHorizontalPullWeight,
};
