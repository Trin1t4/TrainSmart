/**
 * ============================================================================
 * UNIFIED PROGRAM GENERATOR - SINGLE ENTRY POINT
 * ============================================================================
 *
 * PROBLEMA RISOLTO:
 * Esistevano DUE sistemi di generazione paralleli:
 * 1. generateProgramAPI → generateWeeklyScheduleAPI (NO DUP, statico)
 * 2. generateProgramWithSplit → generateWeeklySplit (DUP corretto)
 *
 * Questo causava schede identiche quando si passava per il path sbagliato.
 *
 * SOLUZIONE:
 * Questo è l'UNICO entry point per generare programmi.
 * Tutti gli altri metodi sono deprecati e reindirizzano qui.
 *
 * @module unifiedProgramGenerator
 * @version 1.0.0
 */

import type { Level, Goal, PatternBaselines, WeeklySplit } from '../types';
import type { NormalizedPainArea } from './validators';
import { generateWeeklySplit } from './weeklySplitGenerator';
import { integrateRunningIntoSplit } from './runningProgramGenerator';
import {
  validateProgramInput,
  applyCorrections,
  adaptWorkoutToRuntime,
  type RuntimeContext,
  type ValidationResult
} from './programValidation';
import {
  toCanonicalGoal,
  toProgramGoal,
  toDatabaseGoal,
  getGoalConfig,
  allowsHeavyDays,
  getMaxIntensityForBeginner,
  requiresMedicalClearance,
  type CanonicalGoal,
  type ProgramGoal,
  type DatabaseGoal
} from './goalMapper';
import {
  calculateSafetyLimits,
  applySafetyCap,
  type SafetyContext,
  type DayType
} from './safetyCaps';
import type { RunningPreferences } from '../types/onboarding.types';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedProgramOptions {
  // Required
  level: Level;
  goal: string;  // Accetta QUALSIASI formato, verrà normalizzato
  location: 'gym' | 'home' | 'home_gym';
  frequency: number;
  baselines: PatternBaselines;

  // Optional
  goals?: string[];
  trainingType?: 'bodyweight' | 'equipment' | 'machines';
  painAreas?: NormalizedPainArea[];
  equipment?: Record<string, boolean>;
  muscularFocus?: string | string[];
  sport?: string;
  sportRole?: string;
  sessionDuration?: number;
  userBodyweight?: number;
  legsGoalType?: 'toning' | 'slimming' | 'rebalance';
  gender?: 'M' | 'F';
  runningPrefs?: RunningPreferences;
  userAge?: number;

  // Screening data (CRITICAL per safety)
  quizScore?: number;
  practicalScore?: number;
  discrepancyType?: 'none' | 'minor' | 'major' | 'intuitive_mover' | 'theory_practice_gap' | null;
}

export interface UnifiedProgramResult {
  success: boolean;
  program?: {
    name: string;
    description: string;
    splitName: string;
    frequency: number;
    totalWeeks: number;
    level: Level;
    goal: CanonicalGoal;       // Formato canonico
    goalDatabase: DatabaseGoal; // Formato database
    goalProgram: ProgramGoal;   // Formato programGenerator
    location: string;
    weeklySplit: WeeklySplit;
    includesDeload: boolean;
    deloadFrequency?: number;
    hasMetabolicFinisher: boolean;
    hasRunning: boolean;
    requiresMedicalClearance: boolean;
  };
  validation?: {
    errors: string[];
    warnings: string[];
    corrections: string[];
  };
  error?: string;
}

// ============================================================================
// SAFETY CHECKS
// ============================================================================

/**
 * Verifica se l'utente può accedere a heavy days
 */
function canAccessHeavyDays(
  level: Level,
  goal: string,
  quizScore?: number,
  practicalScore?: number,
  discrepancyType?: string
): boolean {
  // Beginners: MAI heavy days
  if (level === 'beginner') return false;

  // Goal che non permettono heavy days
  if (!allowsHeavyDays(goal)) return false;

  // Se abbiamo screening data, verifica discrepanza
  if (quizScore !== undefined && practicalScore !== undefined) {
    const delta = Math.abs(quizScore - practicalScore);

    // Discrepanza maggiore del 30%: limita a moderate
    if (delta > 30 || discrepancyType === 'major') {
      console.warn('[Safety] Major screening discrepancy, limiting to moderate days');
      return false;
    }
  }

  return true;
}

/**
 * Calcola l'intensità massima permessa
 */
function getMaxAllowedIntensityLocal(
  level: Level,
  goal: string,
  quizScore?: number,
  discrepancyType?: string
): DayType {
  // Beginners: usa config del goal
  if (level === 'beginner') {
    return getMaxIntensityForBeginner(goal);
  }

  // Goal speciali: sempre volume/moderate
  const config = getGoalConfig(goal);
  if (config.category === 'special') {
    return 'volume';
  }

  // Quiz score basso: limita
  if (quizScore !== undefined && quizScore < 50) {
    return 'moderate';
  }

  // Discrepanza maggiore: limita
  if (discrepancyType === 'major') {
    return 'moderate';
  }

  // Altrimenti permetti tutto
  return 'heavy';
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * ENTRY POINT UNICO per la generazione programmi
 *
 * Questo è l'UNICO metodo che dovrebbe essere chiamato per generare programmi.
 * Gestisce:
 * - Normalizzazione del goal
 * - Validazione input
 * - Safety checks
 * - Generazione split con DUP
 * - Integrazione running
 */
export function generateProgramUnified(
  options: UnifiedProgramOptions,
  runtimeContext?: RuntimeContext
): UnifiedProgramResult {
  console.log('[UNIFIED] ========================================');
  console.log('[UNIFIED] GENERAZIONE PROGRAMMA UNIFICATA');
  console.log('[UNIFIED] ========================================');

  // ============================================
  // STEP 1: NORMALIZZA GOAL
  // ============================================
  const canonicalGoal = toCanonicalGoal(options.goal);
  const programGoal = toProgramGoal(options.goal);
  const databaseGoal = toDatabaseGoal(options.goal);
  const goalConfig = getGoalConfig(options.goal);

  console.log(`[UNIFIED] Goal normalization:`);
  console.log(`  Input: "${options.goal}"`);
  console.log(`  Canonical: "${canonicalGoal}"`);
  console.log(`  Program: "${programGoal}"`);
  console.log(`  Database: "${databaseGoal}"`);

  // ============================================
  // STEP 2: VALIDAZIONE INPUT
  // ============================================
  const trainingType = options.trainingType || (options.location === 'home' ? 'bodyweight' : 'equipment');
  const painAreas = options.painAreas || [];

  const validation = validateProgramInput({
    level: options.level,
    goal: canonicalGoal as Goal,  // USA IL GOAL NORMALIZZATO
    goals: options.goals,
    location: options.location,
    trainingType,
    frequency: options.frequency,
    baselines: options.baselines,
    painAreas,
    sessionDuration: options.sessionDuration,
    equipment: options.equipment
  });

  if (validation.errors.length > 0) {
    console.error('[UNIFIED] Validation errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('[UNIFIED] Validation warnings:', validation.warnings);
  }

  // Blocca se errori critici
  if (validation.shouldBlock) {
    console.error('[UNIFIED] BLOCCATO - Errori critici');
    return {
      success: false,
      error: 'Impossibile generare il programma. Risolvi gli errori.',
      validation: {
        errors: validation.errors.map(e => e.message),
        warnings: validation.warnings.map(w => w.message),
        corrections: []
      }
    };
  }

  // ============================================
  // STEP 3: APPLICA CORREZIONI
  // ============================================
  const correctedOptions = applyCorrections({
    ...options,
    goal: canonicalGoal,
    trainingType,
    painAreas
  }, validation.corrections);

  // ============================================
  // STEP 4: SAFETY CHECKS
  // ============================================
  const normalizedDiscrepancy = normalizeDiscrepancyType(options.discrepancyType);

  const canHeavy = canAccessHeavyDays(
    options.level,
    canonicalGoal,
    options.quizScore,
    options.practicalScore,
    normalizedDiscrepancy
  );

  const maxIntensity = getMaxAllowedIntensityLocal(
    options.level,
    canonicalGoal,
    options.quizScore,
    normalizedDiscrepancy
  );

  console.log(`[UNIFIED] Safety checks:`);
  console.log(`  Can access heavy days: ${canHeavy}`);
  console.log(`  Max intensity allowed: ${maxIntensity}`);
  console.log(`  Requires medical clearance: ${requiresMedicalClearance(canonicalGoal)}`);

  // ============================================
  // STEP 5: RUNTIME ADAPTATION (se presente)
  // ============================================
  let runtimeAdaptation = null;
  if (runtimeContext) {
    runtimeAdaptation = adaptWorkoutToRuntime(
      {
        location: correctedOptions.location,
        trainingType: correctedOptions.trainingType,
        painAreas: correctedOptions.painAreas,
        sessionDuration: correctedOptions.sessionDuration,
        goal: canonicalGoal,
        level: correctedOptions.level
      },
      runtimeContext
    );

    if (runtimeAdaptation.warnings.length > 0) {
      console.warn('[UNIFIED] Runtime warnings:', runtimeAdaptation.warnings);
    }
  }

  // ============================================
  // STEP 6: GENERA WEEKLY SPLIT (con DUP)
  // ============================================
  console.log('[UNIFIED] Generating weekly split with DUP...');

  // Map discrepancy type to the expected format
  const weeklySplitDiscrepancy = options.discrepancyType === 'major'
    ? 'theory_practice_gap'
    : options.discrepancyType === 'minor'
      ? 'intuitive_mover'
      : null;

  const weeklySplit = generateWeeklySplit({
    level: correctedOptions.level,
    goal: canonicalGoal as Goal,
    location: correctedOptions.location as 'gym' | 'home' | 'home_gym',
    trainingType: correctedOptions.trainingType as 'bodyweight' | 'equipment' | 'machines',
    frequency: correctedOptions.frequency,
    baselines: correctedOptions.baselines,
    painAreas: correctedOptions.painAreas,
    equipment: correctedOptions.equipment,
    muscularFocus: Array.isArray(correctedOptions.muscularFocus)
      ? correctedOptions.muscularFocus[0]
      : correctedOptions.muscularFocus,
    sessionDuration: correctedOptions.sessionDuration,
    userBodyweight: correctedOptions.userBodyweight,
    // CRITICAL: Passa i dati di screening per safety caps
    quizScore: options.quizScore,
    practicalScore: options.practicalScore,
    discrepancyType: weeklySplitDiscrepancy
  });

  console.log(`[UNIFIED] Split generato: ${weeklySplit.splitName}`);
  console.log(`[UNIFIED] Giorni: ${weeklySplit.days.length}`);

  // Verifica che ogni giorno abbia esercizi diversi (anti-regression)
  const exercisesByDay = weeklySplit.days.map((d: any) =>
    d.exercises?.map((e: any) => `${e.name}:${e.dayType}`).join(',')
  );
  const uniquePatterns = new Set(exercisesByDay);
  if (uniquePatterns.size < weeklySplit.days.length && weeklySplit.days.length > 1) {
    console.warn('[UNIFIED] WARNING: Some days have identical exercise patterns!');
    console.warn('[UNIFIED] This may indicate DUP is not working correctly.');
  }

  // ============================================
  // STEP 7: INTEGRA RUNNING (se abilitato)
  // ============================================
  let finalSplit = weeklySplit;
  let hasRunning = false;

  if (correctedOptions.runningPrefs?.enabled) {
    console.log('[UNIFIED] Integrating running sessions...');

    finalSplit = integrateRunningIntoSplit(
      weeklySplit,
      correctedOptions.runningPrefs,
      1,  // weekNumber
      options.userAge
    );

    hasRunning = true;
    const runningDays = finalSplit.days.filter((d: any) =>
      d.type === 'running' || d.runningSession
    ).length;
    console.log(`[UNIFIED] Running days: ${runningDays}`);
  }

  // ============================================
  // STEP 8: APPLICA RUNTIME MULTIPLIERS
  // ============================================
  if (runtimeAdaptation) {
    const { volumeMultiplier, intensityMultiplier } = runtimeAdaptation;

    if (volumeMultiplier < 1 || intensityMultiplier < 1) {
      console.log(`[UNIFIED] Applying runtime multipliers: vol=${volumeMultiplier}, int=${intensityMultiplier}`);

      finalSplit.days.forEach((day: any) => {
        if (day.exercises) {
          day.exercises.forEach((exercise: any) => {
            if (volumeMultiplier < 1 && typeof exercise.sets === 'number') {
              exercise.sets = Math.max(2, Math.round(exercise.sets * volumeMultiplier));
            }
            if (intensityMultiplier < 1) {
              const reduction = Math.round((1 - intensityMultiplier) * 100);
              exercise.notes = exercise.notes
                ? `${exercise.notes} | Intensità ridotta -${reduction}%`
                : `Intensità ridotta -${reduction}%`;
            }
          });
        }
      });
    }
  }

  // ============================================
  // STEP 9: CALCOLA PARAMETRI FINALI
  // ============================================
  const includesDeload = options.level === 'intermediate' || options.level === 'advanced';
  const deloadFrequency = includesDeload ? 4 : undefined;

  let totalWeeks = 4;
  if (canonicalGoal === 'strength') totalWeeks = 8;
  else if (canonicalGoal === 'hypertrophy') totalWeeks = 12;
  else if (canonicalGoal === 'sport_performance') totalWeeks = 8;
  else if (canonicalGoal === 'toning' || canonicalGoal === 'fat_loss') totalWeeks = 8;

  // ============================================
  // STEP 10: COSTRUISCI RISULTATO
  // ============================================
  const result: UnifiedProgramResult = {
    success: true,
    program: {
      name: `Programma ${finalSplit.splitName} - ${options.level}`,
      description: finalSplit.description || `${correctedOptions.frequency}x/settimana con DUP`,
      splitName: finalSplit.splitName,
      frequency: correctedOptions.frequency,
      totalWeeks,
      level: options.level,
      goal: canonicalGoal,
      goalDatabase: databaseGoal,
      goalProgram: programGoal,
      location: options.location,
      weeklySplit: finalSplit,
      includesDeload,
      deloadFrequency,
      hasMetabolicFinisher: finalSplit.days.some((d: any) => d.hasMetabolicFinisher),
      hasRunning,
      requiresMedicalClearance: requiresMedicalClearance(canonicalGoal)
    },
    validation: {
      errors: validation.errors.map(e => e.message),
      warnings: validation.warnings.map(w => w.message),
      corrections: validation.corrections.map(c => c.reason)
    }
  };

  console.log('[UNIFIED] ========================================');
  console.log('[UNIFIED] GENERAZIONE COMPLETATA');
  console.log('[UNIFIED] ========================================');

  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizza il discrepancy type in un formato standard
 */
function normalizeDiscrepancyType(
  discrepancy?: string | null
): 'none' | 'minor' | 'major' {
  if (!discrepancy) return 'none';

  const d = discrepancy.toLowerCase();
  if (d === 'major' || d === 'theory_practice_gap') return 'major';
  if (d === 'minor' || d === 'intuitive_mover') return 'minor';
  return 'none';
}

// ============================================================================
// BACKWARD COMPATIBILITY WRAPPERS
// ============================================================================

/**
 * @deprecated Usa generateProgramUnified() invece
 * Mantenuto per backward compatibility durante la transizione
 */
export function generateProgramAPI(input: any): any {
  console.warn('[DEPRECATED] generateProgramAPI() is deprecated, use generateProgramUnified()');

  const result = generateProgramUnified({
    level: input.level,
    goal: input.goal,
    location: input.location || 'gym',
    frequency: input.frequency,
    baselines: input.baselines || {},
    painAreas: input.painAreas,
    equipment: input.equipment,
    quizScore: input.quizScore,
    practicalScore: input.practicalScore
  });

  if (!result.success) {
    return { error: true, message: result.error };
  }

  // Converti al vecchio formato per backward compatibility
  return {
    name: result.program!.name,
    description: result.program!.description,
    split: result.program!.splitName.toLowerCase().replace(/\s+/g, '_'),
    daysPerWeek: result.program!.frequency,
    location: result.program!.location,
    weeklySchedule: result.program!.weeklySplit.days,
    progression: 'ondulata_giornaliera',
    includesDeload: result.program!.includesDeload,
    deloadFrequency: result.program!.deloadFrequency,
    totalWeeks: result.program!.totalWeeks,
    requiresEndCycleTest: true,
    hasMetabolicFinisher: result.program!.hasMetabolicFinisher
  };
}

/**
 * @deprecated Usa generateProgramUnified() invece
 */
export function generateProgramWithSplitLegacy(options: any, runtimeContext?: RuntimeContext): any {
  console.warn('[DEPRECATED] generateProgramWithSplit() legacy wrapper, use generateProgramUnified()');

  const result = generateProgramUnified({
    level: options.level,
    goal: options.goal,
    goals: options.goals,
    location: options.location,
    trainingType: options.trainingType,
    frequency: options.frequency,
    baselines: options.baselines,
    painAreas: options.painAreas,
    equipment: options.equipment,
    muscularFocus: options.muscularFocus,
    sport: options.sport,
    sportRole: options.sportRole,
    sessionDuration: options.sessionDuration,
    userBodyweight: options.userBodyweight,
    legsGoalType: options.legsGoalType,
    gender: options.gender,
    runningPrefs: options.runningPrefs,
    userAge: options.userAge,
    quizScore: options.quizScore,
    practicalScore: options.practicalScore,
    discrepancyType: options.discrepancyType
  }, runtimeContext);

  if (!result.success) {
    return { error: true, blocked: true, message: result.error, validation: result.validation };
  }

  return {
    splitName: result.program!.splitName,
    description: result.program!.description,
    totalWeeks: result.program!.totalWeeks,
    includesDeload: result.program!.includesDeload,
    deloadFrequency: result.program!.deloadFrequency,
    weeklySplit: result.program!.weeklySplit,
    validationWarnings: result.validation?.warnings,
    corrections: result.validation?.corrections
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateProgramUnified,
  // Backward compatibility
  generateProgramAPI,
  generateProgramWithSplitLegacy
};
