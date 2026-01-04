/**
 * FIX 1: NO BASELINE HANDLING
 * 
 * PROBLEMA: Quando un pattern non ha baseline dallo screening, il sistema genera
 * un placeholder inutile come "lower_push (No Baseline)" senza peso suggerito.
 * 
 * SOLUZIONE: Fallback intelligente in 3 step:
 * 1. Prova a inferire da pattern correlati
 * 2. Se non riesce, usa parametri conservativi basati su level + peso corporeo
 * 3. Marca l'esercizio come `needsCalibration: true` per auto-calibrazione dopo 2 sessioni
 * 
 * COME APPLICARE:
 * Sostituire la funzione `createExercise` in weeklySplitGenerator.ts
 */

import { Level, Goal, PatternBaselines, Exercise } from '../types';

// ============================================================
// COSTANTI PER INFERENZA
// ============================================================

/**
 * Coefficienti di correlazione tra pattern
 * Usati per stimare un pattern mancante da uno esistente
 */
const PATTERN_CORRELATIONS: Record<string, { source: string; ratio: number; fallbackSource?: string; fallbackRatio?: number }> = {
  // vertical_pull inferito da horizontal_push (tipicamente 80%)
  vertical_pull: { source: 'horizontal_push', ratio: 0.80 },
  
  // horizontal_pull inferito da vertical_pull (85%) o horizontal_push (70%)
  horizontal_pull: { source: 'vertical_pull', ratio: 0.85, fallbackSource: 'horizontal_push', fallbackRatio: 0.70 },
  
  // vertical_push inferito da horizontal_push (65%)
  vertical_push: { source: 'horizontal_push', ratio: 0.65 },
  
  // lower_pull inferito da lower_push (110% - stacco > squat tipicamente)
  lower_pull: { source: 'lower_push', ratio: 1.10 },
  
  // lower_push inferito da lower_pull (90%)
  lower_push: { source: 'lower_pull', ratio: 0.90 },
  
  // horizontal_push inferito da vertical_push (155%)
  horizontal_push: { source: 'vertical_push', ratio: 1.55 },
};

/**
 * Esercizi di default per ogni pattern quando non c'è baseline
 * Organizzati per location (gym/home)
 */
const DEFAULT_EXERCISES: Record<string, { gym: string; home: string; difficulty: number }> = {
  lower_push: { gym: 'Goblet Squat', home: 'Squat a Corpo Libero', difficulty: 4 },
  lower_pull: { gym: 'Romanian Deadlift', home: 'Single Leg Deadlift', difficulty: 5 },
  horizontal_push: { gym: 'Panca Piana con Manubri', home: 'Push-up', difficulty: 4 },
  horizontal_pull: { gym: 'Rematore con Manubrio', home: 'Inverted Row', difficulty: 5 },
  vertical_push: { gym: 'Military Press con Manubri', home: 'Pike Push-up', difficulty: 5 },
  vertical_pull: { gym: 'Lat Pulldown', home: 'Australian Pull-up', difficulty: 5 },
  core: { gym: 'Cable Crunch', home: 'Plank', difficulty: 3 },
};

/**
 * Parametri conservativi per livello quando non c'è baseline
 */
const CONSERVATIVE_PARAMS: Record<Level, { sets: number; reps: number; rir: number; intensityPercent: number }> = {
  beginner: { sets: 3, reps: 10, rir: 4, intensityPercent: 60 },
  intermediate: { sets: 3, reps: 10, rir: 3, intensityPercent: 65 },
  advanced: { sets: 4, reps: 8, rir: 3, intensityPercent: 70 },
};

/**
 * Stima peso iniziale basato su peso corporeo (quando non c'è nessun dato)
 * Valori conservativi per sicurezza
 */
const BODYWEIGHT_RATIOS: Record<string, number> = {
  lower_push: 0.5,      // 50% BW per squat iniziale (con manubrio/goblet)
  lower_pull: 0.4,      // 40% BW per RDL iniziale
  horizontal_push: 0.25, // 25% BW per panca manubri iniziale (per manubrio)
  horizontal_pull: 0.2,  // 20% BW per row iniziale (per manubrio)
  vertical_push: 0.15,   // 15% BW per military iniziale (per manubrio)
  vertical_pull: 0.4,    // 40% BW per lat pulldown iniziale
  core: 0.15,           // 15% BW per cable crunch
};

// ============================================================
// TIPO ESTESO PER ESERCIZIO CON CALIBRAZIONE
// ============================================================

export interface ExerciseWithCalibration extends Exercise {
  needsCalibration?: boolean;
  inferredFrom?: string;
  calibrationNote?: string;
}

// ============================================================
// FUNZIONE DI INFERENZA
// ============================================================

/**
 * Tenta di inferire un baseline mancante da altri pattern disponibili
 */
function inferBaseline(
  patternId: string,
  baselines: PatternBaselines,
  userBodyweight?: number
): { weight10RM: number; reps: number; source: string } | null {
  const correlation = PATTERN_CORRELATIONS[patternId];
  
  if (!correlation) {
    return null;
  }
  
  // Prova fonte primaria
  const sourceBaseline = baselines[correlation.source as keyof PatternBaselines];
  if (sourceBaseline?.weight10RM && sourceBaseline.weight10RM > 0) {
    return {
      weight10RM: Math.round(sourceBaseline.weight10RM * correlation.ratio * 2) / 2, // Arrotonda a 0.5kg
      reps: sourceBaseline.reps || 10,
      source: correlation.source,
    };
  }
  
  // Prova fonte fallback
  if (correlation.fallbackSource && correlation.fallbackRatio) {
    const fallbackBaseline = baselines[correlation.fallbackSource as keyof PatternBaselines];
    if (fallbackBaseline?.weight10RM && fallbackBaseline.weight10RM > 0) {
      return {
        weight10RM: Math.round(fallbackBaseline.weight10RM * correlation.fallbackRatio * 2) / 2,
        reps: fallbackBaseline.reps || 10,
        source: correlation.fallbackSource,
      };
    }
  }
  
  return null;
}

/**
 * Stima peso iniziale da peso corporeo (ultimo fallback)
 */
function estimateFromBodyweight(
  patternId: string,
  bodyweight: number,
  level: Level
): number {
  const ratio = BODYWEIGHT_RATIOS[patternId] || 0.2;
  const levelMultiplier = level === 'beginner' ? 0.8 : level === 'intermediate' ? 1.0 : 1.2;
  
  // Calcola e arrotonda a 2.5kg (incremento standard manubri)
  const estimated = bodyweight * ratio * levelMultiplier;
  return Math.round(estimated / 2.5) * 2.5;
}

// ============================================================
// FUNZIONE PRINCIPALE - SOSTITUISCE createExercise
// ============================================================

/**
 * Crea un esercizio con gestione intelligente del caso "no baseline"
 * 
 * @param patternId - Pattern motorio (lower_push, horizontal_pull, etc.)
 * @param baseline - Baseline dallo screening (può essere null/undefined)
 * @param variantIndex - Indice della variante da usare
 * @param options - Opzioni del generatore (level, goal, location, etc.)
 * @param dayType - Tipo di giorno DUP (heavy, moderate, volume)
 * @returns Exercise con eventuale flag needsCalibration
 */
export function createExerciseWithFallback(
  patternId: string,
  baseline: any,
  variantIndex: number,
  options: {
    level: Level;
    goal: Goal;
    location: 'gym' | 'home' | 'home_gym';
    trainingType: 'bodyweight' | 'equipment' | 'machines';
    painAreas: any[];
    baselines: PatternBaselines;
    userBodyweight?: number;
  },
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
): ExerciseWithCalibration {
  const { level, goal, location, baselines, userBodyweight } = options;
  
  // ✅ CASO 1: Baseline presente → usa il flusso normale
  if (baseline && (baseline.reps > 0 || baseline.weight10RM > 0)) {
    // Qui va il codice originale di createExercise
    // Per brevità, ritorno un placeholder che indica di usare il codice esistente
    return createExerciseOriginal(patternId, baseline, variantIndex, options, dayType);
  }
  
  // ============================================================
  // CASO 2: No Baseline → Fallback Intelligente
  // ============================================================
  
  console.log(`⚠️ [NoBaseline] Pattern ${patternId} senza baseline, avvio fallback...`);
  
  let inferredWeight: number | null = null;
  let inferredReps = 10;
  let inferenceSource = '';
  let needsCalibration = true;
  
  // STEP 1: Prova inferenza da pattern correlati
  const inferred = inferBaseline(patternId, baselines, userBodyweight);
  if (inferred) {
    inferredWeight = inferred.weight10RM;
    inferredReps = inferred.reps;
    inferenceSource = `Stimato da ${inferred.source}`;
    console.log(`   ✓ Inferito da ${inferred.source}: ${inferredWeight}kg × ${inferredReps} reps`);
  }
  
  // STEP 2: Se non inferito e abbiamo bodyweight, stima da BW
  if (!inferredWeight && userBodyweight && userBodyweight > 0 && location !== 'home') {
    inferredWeight = estimateFromBodyweight(patternId, userBodyweight, level);
    inferenceSource = `Stimato da peso corporeo (${userBodyweight}kg)`;
    console.log(`   ✓ Stimato da BW: ${inferredWeight}kg`);
  }
  
  // STEP 3: Parametri conservativi
  const params = CONSERVATIVE_PARAMS[level];
  const defaultExercise = DEFAULT_EXERCISES[patternId];
  
  if (!defaultExercise) {
    console.error(`   ✗ Pattern ${patternId} non riconosciuto!`);
    // Fallback estremo
    return {
      pattern: patternId as any,
      name: 'Esercizio da Definire',
      sets: 3,
      reps: 10,
      rest: '90s',
      intensity: '60%',
      needsCalibration: true,
      calibrationNote: 'Pattern non riconosciuto - consulta un trainer',
    };
  }
  
  // Scegli esercizio in base a location
  const exerciseName = location === 'home' 
    ? defaultExercise.home 
    : defaultExercise.gym;
  
  // Calcola peso suggerito (se gym e abbiamo una stima)
  let suggestedWeight: string | undefined;
  if (inferredWeight && location !== 'home') {
    // Applica moltiplicatore per dayType
    const dayMultiplier = dayType === 'heavy' ? 1.0 : dayType === 'moderate' ? 0.85 : 0.75;
    const adjustedWeight = Math.round(inferredWeight * dayMultiplier * 2) / 2;
    suggestedWeight = `${adjustedWeight}kg`;
  }
  
  // Calcola sets/reps in base a dayType (ma conservativi per calibrazione)
  let sets = params.sets;
  let reps: number | string = params.reps;
  let rest = '90s';
  let intensity = `${params.intensityPercent}%`;
  
  if (dayType === 'heavy') {
    sets = Math.max(3, params.sets);
    reps = Math.max(6, params.reps - 2);
    rest = '2-3min';
    intensity = `${Math.min(75, params.intensityPercent + 10)}%`;
  } else if (dayType === 'volume') {
    sets = params.sets;
    reps = `${params.reps}-${params.reps + 2}`;
    rest = '60-90s';
    intensity = `${Math.max(55, params.intensityPercent - 5)}%`;
  }
  
  // Costruisci nota di calibrazione
  const calibrationNote = [
    '🔄 Peso da calibrare',
    inferenceSource,
    `Dopo 2 sessioni il sistema adatterà automaticamente in base al tuo RPE`,
  ].filter(Boolean).join(' | ');
  
  console.log(`   → Esercizio fallback: ${exerciseName} (${sets}×${reps} @ ${intensity})`);
  console.log(`   → needsCalibration: true`);
  
  return {
    pattern: patternId as any,
    name: exerciseName,
    sets,
    reps,
    rest,
    intensity,
    weight: suggestedWeight,
    needsCalibration: true,
    inferredFrom: inferenceSource || undefined,
    calibrationNote,
    baseline: {
      variantId: 'fallback',
      difficulty: defaultExercise.difficulty,
      maxReps: typeof reps === 'number' ? reps : parseInt(reps),
    },
    notes: calibrationNote,
  };
}

// ============================================================
// PLACEHOLDER PER CODICE ORIGINALE
// ============================================================

/**
 * Questo è un placeholder - nella implementazione reale,
 * qui va il codice originale di createExercise per quando
 * il baseline È presente.
 */
function createExerciseOriginal(
  patternId: string,
  baseline: any,
  variantIndex: number,
  options: any,
  dayType: 'heavy' | 'volume' | 'moderate'
): ExerciseWithCalibration {
  // === INSERIRE QUI IL CODICE ORIGINALE DI createExercise ===
  // Questo placeholder esiste solo per compilazione
  
  throw new Error('Sostituire con il codice originale di createExercise');
}

// ============================================================
// HELPER: Verifica se esercizio necessita calibrazione
// ============================================================

/**
 * Controlla quante sessioni con questo esercizio l'utente ha completato
 * Se >= 2 e ha feedback RPE, possiamo auto-calibrare
 */
export async function shouldAutoCalibrateExercise(
  userId: string,
  exerciseName: string,
  supabase: any
): Promise<{ shouldCalibrate: boolean; avgRPE?: number; sessions: number }> {
  try {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('exercise_rpe, created_at')
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error || !data || data.length < 2) {
      return { shouldCalibrate: false, sessions: data?.length || 0 };
    }
    
    const validRPE = data.filter((d: any) => d.exercise_rpe != null);
    if (validRPE.length < 2) {
      return { shouldCalibrate: false, sessions: data.length };
    }
    
    const avgRPE = validRPE.reduce((sum: number, d: any) => sum + d.exercise_rpe, 0) / validRPE.length;
    
    return {
      shouldCalibrate: true,
      avgRPE: Math.round(avgRPE * 10) / 10,
      sessions: data.length,
    };
  } catch (err) {
    console.error('[AutoCalibrate] Error:', err);
    return { shouldCalibrate: false, sessions: 0 };
  }
}

/**
 * Auto-calibra il peso basandosi su RPE storico
 * 
 * RPE < 6: Aumenta peso 5-10%
 * RPE 6-8: Mantieni (range ottimale)
 * RPE > 8: Riduci peso 5-10%
 */
export function calculateCalibratedWeight(
  currentWeight: number,
  avgRPE: number,
  targetRPE: number = 7
): number {
  if (!currentWeight || currentWeight <= 0) return 0;
  
  const rpeDiff = avgRPE - targetRPE;
  let adjustment = 1.0;
  
  if (rpeDiff < -1.5) {
    // RPE molto basso → aumenta 10%
    adjustment = 1.10;
  } else if (rpeDiff < -0.5) {
    // RPE basso → aumenta 5%
    adjustment = 1.05;
  } else if (rpeDiff > 1.5) {
    // RPE molto alto → riduci 10%
    adjustment = 0.90;
  } else if (rpeDiff > 0.5) {
    // RPE alto → riduci 5%
    adjustment = 0.95;
  }
  // else: mantieni
  
  const newWeight = currentWeight * adjustment;
  return Math.round(newWeight * 2) / 2; // Arrotonda a 0.5kg
}
