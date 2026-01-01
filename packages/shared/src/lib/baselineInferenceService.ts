/**
 * Baseline Inference Service
 *
 * Stima i pattern mancanti dai test di screening usando correlazioni biomeccaniche.
 * I pesi stimati vengono marcati come "estimated" e verranno adattati dopo 2-3 sedute
 * basandosi sul feedback RPE/RIR dell'utente.
 */

import type { PatternBaselines, PatternBaseline, Level } from '../types';

/**
 * Coefficienti di correlazione tra pattern
 * Basati su rapporti di forza tipici in soggetti allenati
 */
const PATTERN_CORRELATIONS: Record<string, { source: string; ratio: number }> = {
  // vertical_pull inferito da horizontal_push (Bench Press → Lat Pulldown/Pull-up)
  // In media il lat pulldown è circa 80% della panca piana
  // Per trazioni bodyweight: consideriamo che chi fa 80kg panca può fare lat 64kg
  // che corrisponde circa al peso corporeo medio → trazioni a corpo libero
  vertical_pull: { source: 'horizontal_push', ratio: 0.80 },

  // horizontal_pull inferito da vertical_pull (Lat Pulldown → Row)
  // Il rematore è circa 85% del lat pulldown per la maggior parte delle persone
  horizontal_pull: { source: 'vertical_pull', ratio: 0.85 },

  // Se vertical_pull non disponibile, horizontal_pull può essere inferito da horizontal_push
  // Row è circa 70% della panca (ratio indiretto: 0.80 × 0.85 ≈ 0.68, arrotondiamo a 0.70)
  // Questo viene usato come fallback
  horizontal_pull_fallback: { source: 'horizontal_push', ratio: 0.70 },

  // vertical_push inferito da horizontal_push (Bench → Military Press)
  // Il military press è circa 65% della panca in media
  vertical_push: { source: 'horizontal_push', ratio: 0.65 },

  // lower_pull inferito da lower_push (Squat → Deadlift)
  // CAUTO: Solo 110% dello squat per sicurezza, poi si adatta
  lower_pull: { source: 'lower_push', ratio: 1.10 },
};

/**
 * Nomi degli esercizi di default per i pattern stimati
 */
const DEFAULT_VARIANT_NAMES: Record<string, string> = {
  vertical_pull: 'Lat Pulldown',    // Stimato da panca piana
  horizontal_pull: 'Barbell Row',
  horizontal_pull_fallback: 'Barbell Row', // Fallback da panca
  vertical_push: 'Military Press',
  lower_pull: 'Romanian Deadlift', // RDL più sicuro per iniziare
};

/**
 * Coefficienti per stima iniziale basata su peso corporeo
 * Usati quando non ci sono test di forza (onboarding rapido)
 */
const BODYWEIGHT_BASED_ESTIMATES: Record<string, { ratio: number; variantName: string }> = {
  // Rapporto peso corporeo → peso stimato per 10RM
  lower_push: { ratio: 0.8, variantName: 'Back Squat' },      // 80% BW per principianti
  lower_pull: { ratio: 0.9, variantName: 'Romanian Deadlift' }, // 90% BW (cauto)
  horizontal_push: { ratio: 0.5, variantName: 'Bench Press' },  // 50% BW
  horizontal_pull: { ratio: 0.4, variantName: 'Barbell Row' },  // 40% BW
  vertical_push: { ratio: 0.35, variantName: 'Military Press' }, // 35% BW
  vertical_pull: { ratio: 0.5, variantName: 'Lat Pulldown' },   // 50% BW
  core: { ratio: 0.3, variantName: 'Cable Crunch' },           // 30% BW
};

/**
 * Inferisce i pattern mancanti dai baselines esistenti.
 * Se non ci sono baselines (onboarding rapido), stima tutti basandosi sul peso corporeo.
 *
 * @param baselines - PatternBaselines con i dati dal test di screening
 * @param userBodyweight - Peso corporeo utente in kg (opzionale, default 75)
 * @param fitnessLevel - Livello fitness per regolare le stime (beginner/intermediate/advanced)
 * @returns PatternBaselines con i pattern mancanti stimati
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

  // Controlla se abbiamo QUALCHE baseline testato
  const hasAnyBaseline = Object.values(baselines).some(b => b && b.weight10RM);

  // Se nessun baseline testato (onboarding rapido), stima TUTTI basandosi sul peso corporeo
  if (!hasAnyBaseline) {
    console.log(`[BaselineInference] Nessun test trovato → stima basata su peso corporeo ${userBodyweight}kg (${fitnessLevel})`);

    for (const [pattern, estimate] of Object.entries(BODYWEIGHT_BASED_ESTIMATES)) {
      const patternKey = pattern as keyof PatternBaselines;
      const estimatedWeight = Math.round(userBodyweight * estimate.ratio * levelMultiplier);

      result[patternKey] = {
        variantId: pattern,
        variantName: estimate.variantName,
        difficulty: 5,
        reps: 10,
        weight10RM: estimatedWeight,
        testDate: new Date().toISOString(),
        isEstimated: true,
        estimatedFrom: 'bodyweight',
      };

      console.log(`[BaselineInference] ${pattern}: ${estimatedWeight}kg (${(estimate.ratio * 100).toFixed(0)}% BW × ${levelMultiplier}) - STIMATO DA PESO CORPOREO`);
    }

    return result;
  }

  // Per ogni pattern mancante, prova a stimarlo dal pattern correlato
  for (const [targetPattern, correlation] of Object.entries(PATTERN_CORRELATIONS)) {
    // Gestione pattern fallback (es. horizontal_pull_fallback → horizontal_pull)
    const actualTargetPattern = targetPattern.replace('_fallback', '');
    const targetKey = actualTargetPattern as keyof PatternBaselines;
    const sourceKey = correlation.source as keyof PatternBaselines;
    const isFallback = targetPattern.includes('_fallback');

    // Salta se il pattern target esiste già (testato o già stimato)
    if (result[targetKey] && result[targetKey]?.weight10RM) {
      continue;
    }

    // Salta se il pattern sorgente non esiste
    const sourceBaseline = result[sourceKey];
    if (!sourceBaseline || !sourceBaseline.weight10RM) {
      if (!isFallback) {
        console.log(`[BaselineInference] Cannot infer ${actualTargetPattern}: missing ${correlation.source}`);
      }
      continue;
    }

    // Calcola il peso stimato
    const estimatedWeight = Math.round(sourceBaseline.weight10RM * correlation.ratio);

    // Crea il baseline stimato
    const estimatedBaseline: PatternBaseline = {
      variantId: actualTargetPattern,
      variantName: DEFAULT_VARIANT_NAMES[targetPattern] || actualTargetPattern,
      difficulty: sourceBaseline.difficulty || 5,
      reps: 10, // Default 10RM
      weight10RM: estimatedWeight,
      testDate: new Date().toISOString(),
      isEstimated: true,
      estimatedFrom: correlation.source + (isFallback ? ' (fallback)' : ''),
    };

    result[targetKey] = estimatedBaseline;

    console.log(
      `[BaselineInference] ${actualTargetPattern}: ${estimatedWeight}kg (${correlation.ratio * 100}% of ${correlation.source} ${sourceBaseline.weight10RM}kg) - STIMATO${isFallback ? ' (FALLBACK)' : ''}`
    );
  }

  return result;
}

/**
 * Verifica se un pattern ha un peso stimato che deve essere adattato
 */
export function isPatternEstimated(baseline: PatternBaseline | undefined): boolean {
  return baseline?.isEstimated === true;
}

/**
 * Conta quante sedute sono state completate per un pattern stimato
 * Usato per determinare quando il peso è stato "validato" (dopo 2-3 sedute)
 */
export interface PatternSessionCount {
  pattern: string;
  sessionCount: number;
  lastSessionDate: string;
  isValidated: boolean; // true se >= 2 sedute completate
}

/**
 * Calcola l'adattamento del peso basato sul feedback RPE medio
 *
 * @param currentWeight - Peso attuale in kg
 * @param avgRPE - RPE medio delle ultime sedute (1-10)
 * @param targetRPE - RPE target (default 7-8)
 * @returns Nuovo peso suggerito
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
    // RPE troppo alto (es. 9-10) → riduci peso
    adjustmentPercent = -5;
    reason = 'RPE troppo alto, riduco peso del 5%';
  } else if (rpeDiff >= 1) {
    // RPE leggermente alto → piccola riduzione
    adjustmentPercent = -2.5;
    reason = 'RPE leggermente alto, riduco peso del 2.5%';
  } else if (rpeDiff <= -2) {
    // RPE troppo basso (es. 5-6) → aumenta peso
    adjustmentPercent = 5;
    reason = 'RPE troppo basso, aumento peso del 5%';
  } else if (rpeDiff <= -1) {
    // RPE leggermente basso → piccolo aumento
    adjustmentPercent = 2.5;
    reason = 'RPE leggermente basso, aumento peso del 2.5%';
  } else {
    reason = 'RPE ottimale, mantieni peso';
  }

  const newWeight = Math.round(currentWeight * (1 + adjustmentPercent / 100));

  return {
    newWeight,
    adjustmentPercent,
    reason
  };
}

/**
 * Determina se un peso stimato dovrebbe essere "validato" (confermato)
 * dopo un certo numero di sedute con RPE ottimale
 *
 * @param sessionCount - Numero di sedute completate
 * @param avgRPE - RPE medio delle sedute
 * @returns true se il peso può essere considerato validato
 */
export function shouldValidateEstimatedWeight(
  sessionCount: number,
  avgRPE: number
): boolean {
  // Dopo 2-3 sedute con RPE tra 6 e 9, considera il peso validato
  return sessionCount >= 2 && avgRPE >= 6 && avgRPE <= 9;
}

export default {
  inferMissingBaselines,
  isPatternEstimated,
  calculateWeightAdjustment,
  shouldValidateEstimatedWeight
};
