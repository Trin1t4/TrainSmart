/**
 * FEEDBACK HISTORY SERVICE
 *
 * Fornisce al programGenerator i dati storici di feedback degli allenamenti.
 * Dopo 3-4 sessioni completate, questi dati vengono usati per:
 * - Calibrare i carichi nel nuovo programma
 * - Aggiustare volume e intensità per esercizio
 * - Applicare program_adjustments pendenti
 * - Decidere se serve un deload anticipato
 *
 * Dependency injection pattern (come tutti i servizi TrainSmart).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPES
// ================================================================

export interface ExerciseFeedback {
  exercise_name: string;
  pattern: string;
  sessions_count: number;
  avg_rpe: number;
  avg_rir: number | null;
  avg_weight: number | null;
  avg_reps: number;
  avg_sets: number;
  difficulty_distribution: {
    easier: number;
    as_expected: number;
    harder: number;
  };
  technique_distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  trend: 'too_hard' | 'too_easy' | 'optimal' | 'acceptable';
  last_weight_used: number | null;
  weight_progression: Array<{ date: string; weight: number }> | null;
}

export interface SessionFeedbackSummary {
  total_sessions: number;
  avg_session_rpe: number;
  avg_completion_rate: number;
  avg_duration_minutes: number;
  avg_sleep_quality: number | null;
  mood_distribution: Record<string, number>;
  rpe_trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  needs_deload: boolean;
  sessions: Array<{
    date: string;
    rpe: number;
    duration: number;
    completed_pct: number;
    mood: string | null;
    sleep: number | null;
  }>;
}

export interface PendingAdjustment {
  id: string;
  trigger_type: string;
  avg_rpe_before: number;
  adjustment_type: string;
  volume_change_percent: number;
  exercises_affected: any;
  trigger_date: string;
}

export interface FeedbackContext {
  exerciseFeedback: ExerciseFeedback[];
  sessionSummary: SessionFeedbackSummary | null;
  pendingAdjustments: PendingAdjustment[];
  hasEnoughData: boolean; // true after 3+ sessions
  sessionsCompleted: number;
}

/**
 * Weight adjustment recommendation based on feedback
 */
export interface WeightCalibration {
  exercise_name: string;
  pattern: string;
  suggested_weight_change_percent: number; // -15 to +10
  reason: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Volume adjustment per muscle group based on feedback
 */
export interface VolumeCalibration {
  pattern: string;
  suggested_sets_change: number; // -2 to +2
  reason: string;
}

// ================================================================
// SERVICE STATE
// ================================================================

let supabase: SupabaseClient | null = null;

export function initFeedbackHistoryService(client: SupabaseClient): void {
  supabase = client;
}

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('[FeedbackHistory] Service not initialized. Call initFeedbackHistoryService() first.');
  }
  return supabase;
}

// ================================================================
// DATA FETCHING
// ================================================================

const MIN_SESSIONS_FOR_CALIBRATION = 3;

/**
 * Fetch complete feedback context for program generation.
 * This is the main entry point called by the programGenerator.
 */
export async function getFeedbackContext(
  userId: string,
  sessionsLimit: number = 4,
  programId?: string
): Promise<FeedbackContext> {
  const client = getClient();

  // Parallel fetch all three data sources
  const [exerciseResult, sessionResult, adjustmentsResult] = await Promise.all([
    client.rpc('get_exercise_feedback_history', {
      p_user_id: userId,
      p_sessions_limit: sessionsLimit,
    }),
    client.rpc('get_session_feedback_summary', {
      p_user_id: userId,
      p_sessions_limit: sessionsLimit,
    }),
    client.rpc('get_pending_adjustments_for_generation', {
      p_user_id: userId,
      p_program_id: programId || null,
    }),
  ]);

  const exerciseFeedback: ExerciseFeedback[] = exerciseResult.data || [];
  const sessionSummary: SessionFeedbackSummary | null = sessionResult.data || null;
  const pendingAdjustments: PendingAdjustment[] = adjustmentsResult.data || [];

  const sessionsCompleted = sessionSummary?.total_sessions ?? 0;

  return {
    exerciseFeedback,
    sessionSummary,
    pendingAdjustments,
    hasEnoughData: sessionsCompleted >= MIN_SESSIONS_FOR_CALIBRATION,
    sessionsCompleted,
  };
}

// ================================================================
// CALIBRATION LOGIC
// ================================================================

/**
 * Calculate weight adjustments for each exercise based on feedback.
 * Called by programGenerator when hasEnoughData === true.
 */
export function calculateWeightCalibrations(
  feedback: FeedbackContext,
  level: 'beginner' | 'intermediate' | 'advanced'
): WeightCalibration[] {
  if (!feedback.hasEnoughData) return [];

  const maxAdjust = level === 'beginner' ? 5 : level === 'intermediate' ? 7.5 : 10;
  const calibrations: WeightCalibration[] = [];

  for (const ex of feedback.exerciseFeedback) {
    if (ex.sessions_count < 2) continue;

    let changePercent = 0;
    let reason = '';
    let confidence: 'low' | 'medium' | 'high' = 'low';

    // RPE-based calibration
    if (ex.avg_rpe > 9.0) {
      // Way too hard — significant reduction
      changePercent = -Math.min(maxAdjust * 1.5, 15);
      reason = `RPE troppo alto (${ex.avg_rpe}). Riduzione carico necessaria.`;
      confidence = ex.sessions_count >= 3 ? 'high' : 'medium';
    } else if (ex.avg_rpe > 8.5) {
      // Slightly too hard
      changePercent = -Math.min(maxAdjust, 10);
      reason = `RPE elevato (${ex.avg_rpe}). Leggera riduzione.`;
      confidence = ex.sessions_count >= 3 ? 'medium' : 'low';
    } else if (ex.avg_rpe < 5.5) {
      // Too easy — increase
      changePercent = Math.min(maxAdjust, 10);
      reason = `RPE basso (${ex.avg_rpe}). Aumento carico.`;
      confidence = ex.sessions_count >= 3 ? 'high' : 'medium';
    } else if (ex.avg_rpe < 6.5) {
      // Slightly easy
      changePercent = Math.min(maxAdjust * 0.5, 5);
      reason = `RPE sotto target (${ex.avg_rpe}). Leggero aumento.`;
      confidence = 'medium';
    }

    // RIR confirmation (if available)
    if (ex.avg_rir !== null) {
      if (ex.avg_rir <= 0 && changePercent >= 0) {
        // User reporting RIR 0 (failure) but RPE says ok? Trust RIR.
        changePercent = -maxAdjust;
        reason = `RIR 0 (cedimento). Riduzione carico obbligatoria.`;
        confidence = 'high';
      } else if (ex.avg_rir >= 4 && changePercent <= 0) {
        // User reports lots of reps in reserve but RPE high? Calibration issue.
        // Beginner overestimation — trust RPE more
        if (level === 'beginner') {
          reason += ' [RIR probabilmente sovrastimato per livello]';
        } else {
          changePercent = Math.min(maxAdjust * 0.5, 5);
          reason = `RIR alto (${ex.avg_rir}). Possibile aumento.`;
        }
      }
    }

    // Difficulty distribution confirmation
    const totalDiff = ex.difficulty_distribution.easier + ex.difficulty_distribution.as_expected + ex.difficulty_distribution.harder;
    if (totalDiff > 0) {
      const harderRatio = ex.difficulty_distribution.harder / totalDiff;
      const easierRatio = ex.difficulty_distribution.easier / totalDiff;

      if (harderRatio > 0.7 && changePercent > -5) {
        changePercent = Math.min(changePercent, -5);
        reason += ' Percepito come troppo difficile dalla maggioranza delle sessioni.';
      } else if (easierRatio > 0.7 && changePercent < 5) {
        changePercent = Math.max(changePercent, 5);
        reason += ' Percepito come troppo facile dalla maggioranza delle sessioni.';
      }
    }

    // Weight progression trend (if available)
    if (ex.weight_progression && ex.weight_progression.length >= 2) {
      const first = ex.weight_progression[0]?.weight;
      const last = ex.weight_progression[ex.weight_progression.length - 1]?.weight;
      if (first && last && first > 0) {
        const progressPercent = ((last - first) / first) * 100;
        if (progressPercent > 15 && ex.avg_rpe > 8) {
          // Progressed too fast, RPE climbing
          reason += ` Progressione rapida (+${progressPercent.toFixed(0)}%) con RPE in salita.`;
        }
      }
    }

    if (changePercent !== 0) {
      calibrations.push({
        exercise_name: ex.exercise_name,
        pattern: ex.pattern,
        suggested_weight_change_percent: Math.round(changePercent * 10) / 10,
        reason: reason.trim(),
        confidence,
      });
    }
  }

  return calibrations;
}

/**
 * Calculate volume adjustments per pattern based on feedback.
 */
export function calculateVolumeCalibrations(
  feedback: FeedbackContext
): VolumeCalibration[] {
  if (!feedback.hasEnoughData || !feedback.sessionSummary) return [];

  const calibrations: VolumeCalibration[] = [];

  // Group exercises by pattern
  const byPattern = new Map<string, ExerciseFeedback[]>();
  for (const ex of feedback.exerciseFeedback) {
    const list = byPattern.get(ex.pattern) || [];
    list.push(ex);
    byPattern.set(ex.pattern, list);
  }

  for (const [pattern, exercises] of byPattern) {
    const avgRpe = exercises.reduce((sum, e) => sum + e.avg_rpe, 0) / exercises.length;

    let setsChange = 0;
    let reason = '';

    if (avgRpe > 8.5) {
      setsChange = -1;
      reason = `RPE medio alto (${avgRpe.toFixed(1)}) per pattern ${pattern}. Riduzione 1 set.`;
    } else if (avgRpe > 9.0) {
      setsChange = -2;
      reason = `RPE molto alto (${avgRpe.toFixed(1)}) per pattern ${pattern}. Riduzione 2 set.`;
    } else if (avgRpe < 5.5) {
      setsChange = 1;
      reason = `RPE basso (${avgRpe.toFixed(1)}) per pattern ${pattern}. Aggiunta 1 set.`;
    }

    // Session-level override: if overall needs deload, don't add volume
    if (feedback.sessionSummary.needs_deload && setsChange > 0) {
      setsChange = 0;
      reason = 'Deload necessario — volume invariato.';
    }

    if (setsChange !== 0) {
      calibrations.push({ pattern, suggested_sets_change: setsChange, reason });
    }
  }

  return calibrations;
}

/**
 * Apply pending program_adjustments to determine global multipliers.
 * Returns volume and intensity multipliers (0.5 - 1.2).
 */
export function applyPendingAdjustments(
  adjustments: PendingAdjustment[]
): { volumeMultiplier: number; intensityMultiplier: number; deloadForced: boolean } {
  if (adjustments.length === 0) {
    return { volumeMultiplier: 1.0, intensityMultiplier: 1.0, deloadForced: false };
  }

  let totalVolumeChange = 0;
  let deloadForced = false;

  for (const adj of adjustments) {
    if (adj.adjustment_type === 'deload') {
      deloadForced = true;
    }
    totalVolumeChange += adj.volume_change_percent || 0;
  }

  // Clamp total volume change to -40% / +20%
  totalVolumeChange = Math.max(-40, Math.min(20, totalVolumeChange));

  const volumeMultiplier = deloadForced ? 0.6 : 1 + totalVolumeChange / 100;
  const intensityMultiplier = deloadForced ? 0.8 : 1.0;

  return { volumeMultiplier, intensityMultiplier, deloadForced };
}

/**
 * Determine if the user should get a deload week based on feedback.
 */
export function shouldForceDeload(feedback: FeedbackContext): boolean {
  if (!feedback.sessionSummary) return false;

  // Direct flag from session analysis
  if (feedback.sessionSummary.needs_deload) return true;

  // RPE trend increasing + high avg
  if (
    feedback.sessionSummary.rpe_trend === 'increasing' &&
    feedback.sessionSummary.avg_session_rpe > 8.0
  ) {
    return true;
  }

  // Completion rate dropping (user skipping exercises)
  if (feedback.sessionSummary.avg_completion_rate < 70) {
    return true;
  }

  return false;
}

/**
 * Get exercise-specific weight suggestion based on last used weight + calibration.
 * Returns the suggested weight in kg, or null if no data.
 */
export function getSuggestedWeight(
  exerciseName: string,
  feedback: FeedbackContext,
  calibrations: WeightCalibration[]
): number | null {
  const ex = feedback.exerciseFeedback.find(
    (e) => e.exercise_name.toLowerCase() === exerciseName.toLowerCase()
  );
  if (!ex || !ex.last_weight_used) return null;

  const cal = calibrations.find(
    (c) => c.exercise_name.toLowerCase() === exerciseName.toLowerCase()
  );

  const changePercent = cal?.suggested_weight_change_percent ?? 0;
  const adjusted = ex.last_weight_used * (1 + changePercent / 100);

  // Round to nearest 2.5kg
  return Math.round(adjusted / 2.5) * 2.5;
}
