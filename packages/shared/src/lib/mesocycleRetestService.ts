/**
 * MESOCYCLE RETEST SERVICE
 *
 * Gestisce il retest a fine mesociclo (ogni 4-6 settimane).
 * Il retest:
 * 1. Testa i nuovi massimali (1RM stimato dai sub-max)
 * 2. Confronta con i dati di inizio mesociclo
 * 3. Aggiorna le baselines per il programma successivo
 * 4. Ricalibra il volume profile (MEV/MRV) con i dati reali
 * 5. Genera raccomandazioni per il prossimo mesociclo
 *
 * Dependency injection pattern.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackContext } from './feedbackHistoryService';
import type { MuscleVolumeProfile } from './volumeProfileService';

// ================================================================
// TYPES
// ================================================================

export interface RetestExerciseResult {
  exercise: string;
  pattern: string;
  old_max: number;       // 1RM stimato inizio mesociclo
  new_max: number;       // 1RM stimato da retest
  change_percent: number;
  reps_tested: number;   // quante reps ha fatto nel test
  weight_tested: number; // peso usato nel test
}

export interface RetestInput {
  programId?: string;
  mesocycleNumber: number;
  weeksCompleted: number;
  totalSessionsCompleted: number;
  exerciseResults: RetestExerciseResult[];
}

export interface RetestRecommendations {
  volume_change: string;         // "+10%", "-5%", "maintain"
  intensity_change: string;      // "+5%", "-10%", "maintain"
  exercise_swaps: Array<{
    old_exercise: string;
    new_exercise: string;
    reason: string;
  }>;
  deload_needed: boolean;
  new_baselines: Record<string, {
    estimated1RM: number;
    weight10RM: number;
  }>;
  overall_progress: 'excellent' | 'good' | 'stalling' | 'regressing';
  next_mesocycle_focus: string;
}

export interface RetestSummary {
  id: string;
  mesocycle_number: number;
  retest_date: string;
  weeks_completed: number;
  total_sessions_completed: number;
  exercise_results: RetestExerciseResult[];
  avg_session_rpe: number | null;
  avg_completion_rate: number | null;
  recommendations: RetestRecommendations | null;
  user_accepted_recommendations: boolean | null;
}

// ================================================================
// SERVICE STATE
// ================================================================

let supabase: SupabaseClient | null = null;

export function initMesocycleRetestService(client: SupabaseClient): void {
  supabase = client;
}

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('[MesocycleRetest] Service not initialized.');
  }
  return supabase;
}

// ================================================================
// RETEST LOGIC
// ================================================================

/**
 * Process a retest and generate recommendations.
 * Called when user completes end-of-mesocycle testing.
 */
export async function processRetest(
  userId: string,
  input: RetestInput,
  feedbackContext: FeedbackContext,
  volumeProfile: MuscleVolumeProfile[] | null
): Promise<{ success: boolean; recommendations: RetestRecommendations; retestId?: string; error?: string }> {
  const client = getClient();

  // Generate recommendations from retest data
  const recommendations = generateRetestRecommendations(
    input.exerciseResults,
    feedbackContext,
    volumeProfile
  );

  // Save to database
  const { data, error } = await client
    .from('mesocycle_retest')
    .insert({
      user_id: userId,
      program_id: input.programId || null,
      mesocycle_number: input.mesocycleNumber,
      weeks_completed: input.weeksCompleted,
      total_sessions_completed: input.totalSessionsCompleted,
      exercise_results: input.exerciseResults,
      avg_session_rpe: feedbackContext.sessionSummary?.avg_session_rpe || null,
      avg_completion_rate: feedbackContext.sessionSummary?.avg_completion_rate || null,
      volume_profile_snapshot: volumeProfile || null,
      recommendations,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[MesocycleRetest] Save error:', error);
    return { success: false, recommendations, error: error.message };
  }

  return {
    success: true,
    recommendations,
    retestId: data?.id,
  };
}

/**
 * Generate recommendations from retest results + feedback history.
 */
export function generateRetestRecommendations(
  exerciseResults: RetestExerciseResult[],
  feedbackContext: FeedbackContext,
  volumeProfile: MuscleVolumeProfile[] | null
): RetestRecommendations {
  // 1. Analyze overall progress
  const avgChangePercent =
    exerciseResults.length > 0
      ? exerciseResults.reduce((sum, r) => sum + r.change_percent, 0) / exerciseResults.length
      : 0;

  let overallProgress: RetestRecommendations['overall_progress'];
  if (avgChangePercent > 5) overallProgress = 'excellent';
  else if (avgChangePercent > 1) overallProgress = 'good';
  else if (avgChangePercent > -2) overallProgress = 'stalling';
  else overallProgress = 'regressing';

  // 2. Determine volume change
  let volumeChange = 'maintain';
  if (overallProgress === 'excellent' && feedbackContext.sessionSummary) {
    if (feedbackContext.sessionSummary.avg_session_rpe < 7.5) {
      volumeChange = '+10%';
    } else {
      volumeChange = '+5%';
    }
  } else if (overallProgress === 'stalling') {
    // Could be under-stimulated or over-fatigued
    if (feedbackContext.sessionSummary && feedbackContext.sessionSummary.avg_session_rpe > 8) {
      volumeChange = '-10%'; // Over-fatigued → reduce
    } else {
      volumeChange = '+10%'; // Under-stimulated → increase
    }
  } else if (overallProgress === 'regressing') {
    volumeChange = '-15%';
  }

  // 3. Determine intensity change
  let intensityChange = 'maintain';
  if (overallProgress === 'excellent') {
    intensityChange = '+5%';
  } else if (overallProgress === 'regressing') {
    intensityChange = '-10%';
  }

  // 4. Identify exercises that need swapping
  const exerciseSwaps: RetestRecommendations['exercise_swaps'] = [];
  for (const result of exerciseResults) {
    if (result.change_percent < -5) {
      exerciseSwaps.push({
        old_exercise: result.exercise,
        new_exercise: '', // To be filled by programGenerator
        reason: `Regressione di ${Math.abs(result.change_percent).toFixed(1)}% su ${result.exercise}. Variante diversa consigliata.`,
      });
    }
  }

  // Also check technique quality from feedback
  if (feedbackContext.exerciseFeedback) {
    for (const ex of feedbackContext.exerciseFeedback) {
      const poorTechnique = ex.technique_distribution.poor + ex.technique_distribution.fair;
      const total = poorTechnique + ex.technique_distribution.good + ex.technique_distribution.excellent;
      if (total > 0 && poorTechnique / total > 0.5) {
        const alreadySwapped = exerciseSwaps.find(
          (s) => s.old_exercise.toLowerCase() === ex.exercise_name.toLowerCase()
        );
        if (!alreadySwapped) {
          exerciseSwaps.push({
            old_exercise: ex.exercise_name,
            new_exercise: '',
            reason: `Tecnica scarsa su ${ex.exercise_name} nel ${((poorTechnique / total) * 100).toFixed(0)}% delle sessioni.`,
          });
        }
      }
    }
  }

  // 5. Check if deload needed before next mesocycle
  const deloadNeeded =
    overallProgress === 'regressing' ||
    (feedbackContext.sessionSummary?.needs_deload ?? false) ||
    (feedbackContext.sessionSummary?.avg_session_rpe ?? 0) > 8.5;

  // 6. Build new baselines from retest data
  const newBaselines: RetestRecommendations['new_baselines'] = {};
  for (const result of exerciseResults) {
    if (result.new_max > 0) {
      newBaselines[result.pattern] = {
        estimated1RM: result.new_max,
        weight10RM: Math.round((result.new_max * 0.75) / 2.5) * 2.5, // ~75% of 1RM
      };
    }
  }

  // 7. Determine next mesocycle focus
  let nextFocus: string;
  if (overallProgress === 'regressing') {
    nextFocus = 'Recupero e consolidamento tecnica. Ridurre carico, focus sulla forma.';
  } else if (overallProgress === 'stalling') {
    nextFocus = 'Variare stimolo: cambiare esercizi, modificare rep ranges, aggiungere tecniche d\'intensificazione.';
  } else if (overallProgress === 'excellent') {
    nextFocus = 'Continuare progressione. Considerare aumento volume graduale se RPE lo permette.';
  } else {
    nextFocus = 'Progressione solida. Mantenere struttura e aumentare carichi progressivamente.';
  }

  // Volume profile adjustments
  if (volumeProfile) {
    const needsDeloadMuscles = volumeProfile.filter((m) => m.volume_trend === 'needs_deload');
    if (needsDeloadMuscles.length > 0) {
      nextFocus += ` Attenzione: ${needsDeloadMuscles.map((m) => m.muscle_group).join(', ')} necessitano deload.`;
    }
  }

  return {
    volume_change: volumeChange,
    intensity_change: intensityChange,
    exercise_swaps: exerciseSwaps,
    deload_needed: deloadNeeded,
    new_baselines: newBaselines,
    overall_progress: overallProgress,
    next_mesocycle_focus: nextFocus,
  };
}

/**
 * Get the most recent retest for a user.
 */
export async function getLatestRetest(
  userId: string
): Promise<RetestSummary | null> {
  const client = getClient();

  const { data, error } = await client
    .from('mesocycle_retest')
    .select('*')
    .eq('user_id', userId)
    .order('retest_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return data as RetestSummary;
}

/**
 * Accept retest recommendations — marks them as accepted
 * and returns the new baselines to be applied.
 */
export async function acceptRetestRecommendations(
  userId: string,
  retestId: string
): Promise<{ success: boolean; newBaselines?: Record<string, any>; error?: string }> {
  const client = getClient();

  const { data, error } = await client
    .from('mesocycle_retest')
    .update({ user_accepted_recommendations: true })
    .eq('id', retestId)
    .eq('user_id', userId)
    .select('recommendations')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    newBaselines: (data?.recommendations as any)?.new_baselines || {},
  };
}

// estimate1RM — delegated to SSOT (oneRepMaxCalculator)
export { estimate1RM } from '../utils/oneRepMaxCalculator';

/**
 * Calculate change percent between old and new max.
 */
export function calculateChangePercent(oldMax: number, newMax: number): number {
  if (oldMax <= 0) return 0;
  return Math.round(((newMax - oldMax) / oldMax) * 1000) / 10;
}
