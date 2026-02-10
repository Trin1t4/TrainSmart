/**
 * Baseline Inference Service
 *
 * Stima i pattern mancanti dai test di screening usando correlazioni biomeccaniche.
 * I pesi stimati vengono marcati come "estimated" e verranno adattati dopo 2-3 sedute
 * basandosi sul feedback RPE/RIR dell'utente.
 *
 * FIX 2025-01: Corretto calcolo difficulty per bodyweight exercises.
 */

import type { PatternBaselines, PatternBaseline, Level } from '../types';

// ============================================================================
// COEFFICIENTI DI CORRELAZIONE
// ============================================================================

/**
 * Correlazioni biomeccaniche tra pattern (fonti primarie)
 *
 * Ricerca:
 * - Nuzzo et al. 2008: "Relationship Among Estimated 1RM Strength"
 * - Comfort et al. 2014: "Squat and Deadlift Strength Relationships"
 * - Ratamess et al. 2009: NSCA Guidelines
 * - Hales et al. 2009: "Kinematic analysis of the powerlifting style squat and DL"
 *
 * Valori conservativi (per difetto) per sicurezza
 */
const PATTERN_CORRELATIONS: Record<string, { source: string; ratio: number; difficultyAdjust?: number }> = {
  // vertical_pull inferito da horizontal_push
  // DIFFICULTY: Le trazioni sono MOLTO più difficili dei push-up → -2 difficoltà
  vertical_pull: { source: 'horizontal_push', ratio: 0.80, difficultyAdjust: -2 },

  // horizontal_pull inferito da vertical_pull
  horizontal_pull: { source: 'vertical_pull', ratio: 0.85, difficultyAdjust: 0 },

  // Fallback: horizontal_pull da horizontal_push
  horizontal_pull_fallback: { source: 'horizontal_push', ratio: 0.70, difficultyAdjust: -1 },

  // vertical_push inferito da horizontal_push
  // DIFFICULTY: Pike push-up sono MOLTO più difficili dei push-up standard → -2 difficoltà
  vertical_push: { source: 'horizontal_push', ratio: 0.65, difficultyAdjust: -2 },

  // lower_pull inferito da lower_push
  // Ref: Comfort et al. 2014 - DL 1RM ≈ 1.2× Squat 1RM
  // Per 10RM il rapporto si comprime → conservativo 1.10
  lower_pull: { source: 'lower_push', ratio: 1.10, difficultyAdjust: 0 },
};

/**
 * Correlazioni secondarie multi-sorgente per stima più accurata
 * Usate quando la sorgente primaria non è disponibile
 *
 * Ref: Symmetric Strength ratios, ExRx strength standards
 */
const MULTI_SOURCE_CORRELATIONS: Record<string, Array<{ source: string; ratio: number; confidence: number }>> = {
  lower_pull: [
    { source: 'lower_push', ratio: 1.10, confidence: 0.85 },       // Squat → DL (alta correlazione)
    { source: 'horizontal_push', ratio: 1.50, confidence: 0.55 },  // Bench → DL (correlazione moderata)
  ],
  lower_push: [
    { source: 'lower_pull', ratio: 0.88, confidence: 0.85 },       // DL → Squat
    { source: 'horizontal_push', ratio: 1.25, confidence: 0.55 },  // Bench → Squat
  ],
  horizontal_push: [
    { source: 'vertical_push', ratio: 1.50, confidence: 0.70 },    // OHP → Bench
    { source: 'lower_push', ratio: 0.65, confidence: 0.50 },       // Squat → Bench
  ],
  vertical_push: [
    { source: 'horizontal_push', ratio: 0.65, confidence: 0.80 },  // Bench → OHP
  ],
  vertical_pull: [
    { source: 'horizontal_push', ratio: 0.80, confidence: 0.60 },  // Bench → Pull-up
    { source: 'horizontal_pull', ratio: 1.05, confidence: 0.70 },  // Row → Pull-up
  ],
  horizontal_pull: [
    { source: 'vertical_pull', ratio: 0.85, confidence: 0.70 },    // Pull-up → Row
    { source: 'horizontal_push', ratio: 0.70, confidence: 0.60 },  // Bench → Row
  ],
};

/**
 * Stima un 10RM usando multiple sorgenti (media pesata per confidenza)
 * Ritorna il risultato più conservativo se più sorgenti sono disponibili
 */
function estimateFromMultipleSources(
  targetPattern: string,
  baselines: PatternBaselines
): number | null {
  const correlations = MULTI_SOURCE_CORRELATIONS[targetPattern];
  if (!correlations) return null;

  let weightedSum = 0;
  let totalConfidence = 0;
  let minEstimate = Infinity;

  for (const corr of correlations) {
    const source = baselines[corr.source as keyof PatternBaselines];
    if (source?.weight10RM && source.weight10RM > 0) {
      const estimate = source.weight10RM * corr.ratio;
      weightedSum += estimate * corr.confidence;
      totalConfidence += corr.confidence;
      minEstimate = Math.min(minEstimate, estimate);
      console.log(`[MultiSource] ${targetPattern} da ${corr.source}: ${source.weight10RM}kg × ${corr.ratio} = ${estimate.toFixed(1)}kg (conf: ${corr.confidence})`);
    }
  }

  if (totalConfidence === 0) return null;

  const weightedAvg = weightedSum / totalConfidence;

  // Stima conservativa: prendi il minore tra media pesata e stima più bassa
  const conservativeEstimate = Math.min(weightedAvg, minEstimate);
  console.log(`[MultiSource] ${targetPattern}: media pesata=${weightedAvg.toFixed(1)}kg, min=${minEstimate.toFixed(1)}kg → conservativo: ${conservativeEstimate.toFixed(1)}kg`);

  return Math.round(conservativeEstimate);
}

// ============================================================================
// DATABASE VARIANTI per ogni pattern con difficulty
// ============================================================================

const PATTERN_VARIANTS_DB: Record<string, Array<{ id: string; name: string; difficulty: number }>> = {
  vertical_push: [
    { id: 'wall_shoulder_tap', name: 'Wall Shoulder Tap', difficulty: 1 },
    { id: 'incline_pike', name: 'Pike Push-up Inclinato', difficulty: 2 },
    { id: 'pike_knee', name: 'Pike Push-up su Ginocchia', difficulty: 3 },
    { id: 'pike_pushup', name: 'Pike Push-up', difficulty: 5 },
    { id: 'pike_elevated', name: 'Pike Push-up Elevato', difficulty: 6 },
    { id: 'pike_elevated_high', name: 'Pike Push-up Alto', difficulty: 7 },
    { id: 'wall_hspu_eccentric', name: 'HSPU al Muro (Solo Eccentrica)', difficulty: 8 },
    { id: 'wall_hspu', name: 'HSPU al Muro', difficulty: 9 },
    { id: 'hspu', name: 'Handstand Push-up', difficulty: 10 },
  ],

  vertical_pull: [
    { id: 'prone_y_raise', name: 'Prone Y Raise', difficulty: 1 },
    { id: 'superman_pull', name: 'Superman Pull', difficulty: 2 },
    { id: 'floor_pull_easy', name: 'Floor Pull Facilitato', difficulty: 3 },
    { id: 'inverted_row_high', name: 'Inverted Row (alto)', difficulty: 4 },
    { id: 'inverted_row_table', name: 'Inverted Row (tavolo)', difficulty: 5 },
    { id: 'negative_pullup', name: 'Trazioni Negative', difficulty: 6 },
    { id: 'assisted_pullup', name: 'Trazioni Assistite', difficulty: 6 },
    { id: 'pullup', name: 'Pull-up', difficulty: 7 },
    { id: 'pullup_wide', name: 'Pull-up Larghe', difficulty: 8 },
    { id: 'weighted_pullup', name: 'Pull-up Zavorrate', difficulty: 9 },
  ],

  horizontal_pull: [
    { id: 'prone_ytw', name: 'Prone Y-T-W Raises', difficulty: 2 },
    { id: 'superman_row', name: 'Superman Row', difficulty: 3 },
    { id: 'inverted_row_high', name: 'Inverted Row (alto)', difficulty: 4 },
    { id: 'inverted_row', name: 'Inverted Row', difficulty: 5 },
    { id: 'inverted_row_feet', name: 'Inverted Row Piedi Elevati', difficulty: 6 },
    { id: 'archer_row', name: 'Archer Row', difficulty: 7 },
    { id: 'one_arm_row', name: 'One Arm Inverted Row', difficulty: 8 },
  ],

  lower_pull: [
    { id: 'glute_bridge', name: 'Glute Bridge', difficulty: 2 },
    { id: 'hip_thrust_bw', name: 'Hip Thrust Bodyweight', difficulty: 3 },
    { id: 'single_leg_bridge', name: 'Single Leg Glute Bridge', difficulty: 4 },
    { id: 'slider_leg_curl', name: 'Slider Leg Curl', difficulty: 5 },
    { id: 'nordic_eccentric', name: 'Nordic Curl (Solo Eccentrica)', difficulty: 6 },
    { id: 'nordic_assisted', name: 'Nordic Curl Assistito', difficulty: 7 },
    { id: 'nordic_partial', name: 'Nordic Curl Parziale', difficulty: 8 },
    { id: 'nordic_curl', name: 'Nordic Curl', difficulty: 9 },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcola adjustment basato su reps
 * Meno di 10 reps = persona più debole del previsto → scala giù la difficulty
 */
function calculateRepsAdjustment(reps: number): number {
  if (reps >= 15) return 0.5;   // Molto forte → può fare di più
  if (reps >= 12) return 0.25;
  if (reps >= 10) return 0;     // Standard
  if (reps >= 8) return -0.5;   // Sotto media → scala giù
  if (reps >= 6) return -1;     // Debole → scala giù di più
  return -1.5;                   // Molto debole
}

/**
 * Calcola reps appropriate per l'esercizio inferito
 * NON deve mai dare numeri assurdi tipo 20+ per esercizi difficili
 */
function calculateInferredReps(sourceReps: number, targetDifficulty: number): number {
  // Esercizi molto difficili (diff >= 7): max 8 reps
  if (targetDifficulty >= 7) {
    return Math.min(sourceReps, 8);
  }

  // Esercizi difficili (diff >= 5): max 12 reps
  if (targetDifficulty >= 5) {
    return Math.min(sourceReps, 12);
  }

  // Esercizi intermedi (diff >= 3): può fare qualche rep in più
  if (targetDifficulty >= 3) {
    return Math.min(sourceReps + 2, 15);
  }

  // Esercizi facili: può fare di più ma non esagerare
  return Math.min(sourceReps + 4, 20);
}

/**
 * Stima difficulty da peso (per gym mode)
 */
function estimateDifficultyFromWeight(weight: number, bodyweight: number): number {
  const ratio = weight / bodyweight;

  if (ratio >= 1.5) return 9;
  if (ratio >= 1.2) return 8;
  if (ratio >= 1.0) return 7;
  if (ratio >= 0.8) return 6;
  if (ratio >= 0.6) return 5;
  if (ratio >= 0.4) return 4;
  if (ratio >= 0.2) return 3;
  return 2;
}

/**
 * Trova la variante bodyweight appropriata per una difficulty target
 * LOGICA: Trova l'esercizio con difficulty <= target (mai troppo difficile)
 */
function findVariantForDifficulty(pattern: string, targetDifficulty: number): { id: string; name: string } {
  const variants = PATTERN_VARIANTS_DB[pattern];

  if (!variants || variants.length === 0) {
    console.warn(`[findVariantForDifficulty] Pattern non trovato: ${pattern}`);
    return { id: 'default', name: 'Esercizio Base' };
  }

  // Trova la variante con difficulty più alta che sia <= target
  let best = variants[0]; // Fallback al più facile

  for (const v of variants) {
    if (v.difficulty <= targetDifficulty) {
      if (v.difficulty > best.difficulty) {
        best = v;
      }
    }
  }

  console.log(`[findVariantForDifficulty] ${pattern} diff=${targetDifficulty} → ${best.name} (diff=${best.difficulty})`);

  return { id: best.id, name: best.name };
}

// ============================================================================
// Coefficienti per stima iniziale basata su peso corporeo
// ============================================================================

const BODYWEIGHT_BASED_ESTIMATES: Record<string, { ratio: number; variantName: string; difficulty: number }> = {
  lower_push: { ratio: 0.8, variantName: 'Back Squat', difficulty: 5 },
  lower_pull: { ratio: 0.9, variantName: 'Romanian Deadlift', difficulty: 5 },
  horizontal_push: { ratio: 0.5, variantName: 'Bench Press', difficulty: 5 },
  horizontal_pull: { ratio: 0.4, variantName: 'Barbell Row', difficulty: 5 },
  vertical_push: { ratio: 0.35, variantName: 'Military Press', difficulty: 5 },
  vertical_pull: { ratio: 0.5, variantName: 'Lat Pulldown', difficulty: 5 },
  core: { ratio: 0.3, variantName: 'Cable Crunch', difficulty: 3 },
};

// ============================================================================
// FUNZIONE PRINCIPALE
// ============================================================================

/**
 * Inferisce i pattern mancanti dai baselines esistenti.
 *
 * FIX 2025-01: Corretto calcolo difficulty per bodyweight exercises.
 * La difficulty effettiva ora considera:
 * - difficultyAdjust dal pattern correlato
 * - Reps effettive del test (meno reps = meno forza disponibile)
 * - Limite reps ragionevole per esercizi difficili
 */
export function inferMissingBaselines(
  baselines: PatternBaselines,
  userBodyweight: number = 75,
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): PatternBaselines {
  const result = { ...baselines };

  // Moltiplicatore livello fitness
  const levelMultiplier = fitnessLevel === 'advanced' ? 1.3 :
                          fitnessLevel === 'intermediate' ? 1.15 : 1.0;

  // Controlla se abbiamo QUALCHE baseline con dati validi
  const hasAnyBaseline = Object.values(baselines).some(b =>
    b && (b.weight10RM || (b.reps && b.difficulty))
  );

  // Se nessun baseline testato (onboarding rapido), stima TUTTI basandosi sul peso corporeo
  if (!hasAnyBaseline) {
    console.log(`[BaselineInference] Nessun test trovato → stima basata su peso corporeo ${userBodyweight}kg (${fitnessLevel})`);

    for (const [pattern, estimate] of Object.entries(BODYWEIGHT_BASED_ESTIMATES)) {
      const patternKey = pattern as keyof PatternBaselines;
      const estimatedWeight = Math.round(userBodyweight * estimate.ratio * levelMultiplier);

      result[patternKey] = {
        variantId: pattern,
        variantName: estimate.variantName,
        difficulty: estimate.difficulty,
        reps: 10,
        weight10RM: estimatedWeight,
        testDate: new Date().toISOString(),
        isEstimated: true,
        estimatedFrom: 'bodyweight',
      };

      console.log(`[BaselineInference] ${pattern}: ${estimatedWeight}kg - STIMATO DA PESO CORPOREO`);
    }

    return result;
  }

  // Lista pattern da inferire
  const patternsToInfer: (keyof PatternBaselines)[] = [
    'vertical_pull', 'horizontal_pull', 'vertical_push', 'lower_pull'
  ];

  for (const targetPattern of patternsToInfer) {
    // Skip se già presente con dati validi
    const existingTarget = result[targetPattern];
    if (existingTarget?.variantId && !existingTarget?.isEstimated) {
      continue;
    }

    // Trova correlazione
    let correlation = PATTERN_CORRELATIONS[targetPattern as string];
    if (!correlation) continue;

    let sourceBaseline = baselines[correlation.source as keyof PatternBaselines];

    // Prova fallback per horizontal_pull se vertical_pull non disponibile
    if (!sourceBaseline && targetPattern === 'horizontal_pull') {
      correlation = PATTERN_CORRELATIONS['horizontal_pull_fallback'];
      sourceBaseline = baselines[correlation.source as keyof PatternBaselines];
    }

    if (!sourceBaseline) continue;

    // --- CALCOLO DIFFICULTY CORRETTO ---
    let inferredDifficulty: number;
    let inferredReps: number;

    const hasGymData = sourceBaseline.weight10RM && sourceBaseline.weight10RM > 0;
    const hasBodyweightData = sourceBaseline.reps && sourceBaseline.difficulty;

    if (hasBodyweightData && !hasGymData) {
      // === BODYWEIGHT MODE ===
      const baseDifficulty = sourceBaseline.difficulty!;
      const adjustment = correlation.difficultyAdjust || 0;
      const sourceReps = sourceBaseline.reps || 10;

      // FIX: Considera anche le reps - meno reps = meno margine
      const repsAdjustment = calculateRepsAdjustment(sourceReps);

      // Calcola difficulty effettiva
      // Es: push-up larghi (diff 5) + adjustment(-2) + repsAdj(-0.5 per 8 reps) = 2.5 → arrotonda a 3
      inferredDifficulty = Math.round(
        Math.max(1, Math.min(10, baseDifficulty + adjustment + repsAdjustment))
      );

      // Calcola reps appropriate
      inferredReps = calculateInferredReps(sourceReps, inferredDifficulty);

      console.log(`[Inference] ${targetPattern}: ` +
        `source=${correlation.source} baseDiff=${baseDifficulty} adj=${adjustment} ` +
        `reps=${sourceReps} repsAdj=${repsAdjustment.toFixed(1)} ` +
        `→ inferredDiff=${inferredDifficulty} reps=${inferredReps}`);

    } else if (hasGymData) {
      // === GYM MODE ===
      // Prova stima multi-sorgente per maggiore accuratezza
      const multiSourceEstimate = estimateFromMultipleSources(targetPattern as string, baselines);
      const singleSourceEstimate = Math.round(sourceBaseline.weight10RM! * correlation.ratio);

      // Usa il valore più conservativo tra single-source e multi-source
      const inferredWeight = multiSourceEstimate
        ? Math.min(singleSourceEstimate, multiSourceEstimate)
        : singleSourceEstimate;

      inferredDifficulty = estimateDifficultyFromWeight(inferredWeight, userBodyweight);
      inferredReps = 10; // Standard per gym

      console.log(`[Inference GYM] ${targetPattern}: ` +
        `single=${singleSourceEstimate}kg, multi=${multiSourceEstimate || 'N/A'}kg ` +
        `→ conservativo: ${inferredWeight}kg (diff=${inferredDifficulty})`);

    } else {
      // Fallback conservativo
      inferredDifficulty = 3;
      inferredReps = 10;
    }

    // Trova variante appropriata per la difficulty calcolata
    const variantInfo = findVariantForDifficulty(targetPattern as string, inferredDifficulty);

    // Salva baseline inferito
    result[targetPattern] = {
      variantId: variantInfo.id,
      variantName: variantInfo.name,
      difficulty: inferredDifficulty,
      reps: inferredReps,
      weight10RM: hasGymData ? (() => {
        const single = Math.round(sourceBaseline.weight10RM! * correlation.ratio);
        const multi = estimateFromMultipleSources(targetPattern as string, baselines);
        return multi ? Math.min(single, multi) : single;
      })() : 0,
      testDate: new Date().toISOString(),
      isEstimated: true,
      estimatedFrom: correlation.source + (hasBodyweightData && !hasGymData ? ' (bodyweight)' : ''),
    } as PatternBaseline;
  }

  return result;
}

// ============================================================================
// FUNZIONI UTILITÀ ESPORTATE
// ============================================================================

/**
 * Verifica se un pattern ha un peso stimato che deve essere adattato
 */
export function isPatternEstimated(baseline: PatternBaseline | undefined): boolean {
  return baseline?.isEstimated === true;
}

/**
 * Conta quante sedute sono state completate per un pattern stimato
 */
export interface PatternSessionCount {
  pattern: string;
  sessionCount: number;
  lastSessionDate: string;
  isValidated: boolean;
}

/**
 * Calcola l'adattamento del peso basato sul feedback RPE medio
 */
export function calculateWeightAdjustment(
  currentWeight: number,
  avgRPE: number,
  targetRPE: number = 7.5
): { newWeight: number; adjustmentPercent: number; reason: string } {
  const rpeDiff = avgRPE - targetRPE;

  let adjustmentPercent = 0;
  let reason = '';

  if (rpeDiff >= 2) {
    adjustmentPercent = -5;
    reason = 'RPE troppo alto, riduco peso del 5%';
  } else if (rpeDiff >= 1) {
    adjustmentPercent = -2.5;
    reason = 'RPE leggermente alto, riduco peso del 2.5%';
  } else if (rpeDiff <= -2) {
    adjustmentPercent = 5;
    reason = 'RPE troppo basso, aumento peso del 5%';
  } else if (rpeDiff <= -1) {
    adjustmentPercent = 2.5;
    reason = 'RPE leggermente basso, aumento peso del 2.5%';
  } else {
    reason = 'RPE ottimale, mantieni peso';
  }

  const newWeight = Math.round(currentWeight * (1 + adjustmentPercent / 100));

  return { newWeight, adjustmentPercent, reason };
}

/**
 * Determina se un peso stimato dovrebbe essere "validato"
 */
export function shouldValidateEstimatedWeight(
  sessionCount: number,
  avgRPE: number
): boolean {
  return sessionCount >= 2 && avgRPE >= 6 && avgRPE <= 9;
}

export default {
  inferMissingBaselines,
  isPatternEstimated,
  calculateWeightAdjustment,
  shouldValidateEstimatedWeight
};
