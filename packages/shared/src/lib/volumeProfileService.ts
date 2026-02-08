/**
 * VOLUME PROFILE SERVICE (MEV/MRV)
 *
 * Gestisce il profilo di volume personalizzato per ogni utente.
 * Basato sulla ricerca di Mike Israetel / Renaissance Periodization:
 *
 * - MEV (Minimum Effective Volume): set minimi/settimana per mantenere/crescere
 * - MAV (Maximum Adaptive Volume): sweet spot per la crescita ottimale
 * - MRV (Maximum Recoverable Volume): oltre questo → overtraining
 *
 * Il sistema parte da defaults basati sulla ricerca e si calibra
 * automaticamente con i feedback degli allenamenti (RPE, RIR, recupero).
 *
 * Dependency injection pattern.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPES
// ================================================================

export interface MuscleVolumeProfile {
  muscle_group: string;
  mev: number;
  mav: number;
  mrv: number;
  current_volume: number;
  volume_trend: 'increasing' | 'stable' | 'decreasing' | 'needs_deload';
  avg_rpe_at_current_volume: number | null;
  calibration_confidence: 'low' | 'medium' | 'high';
  sessions_tracked: number;
}

export interface VolumeRecommendation {
  muscle_group: string;
  recommended_sets_per_week: number;
  zone: 'below_mev' | 'mev_to_mav' | 'mav_to_mrv' | 'above_mrv';
  action: 'increase' | 'maintain' | 'decrease' | 'deload';
  reason: string;
}

/**
 * Pattern → muscle groups mapping.
 * Used to connect exercise patterns to the volume profile.
 */
export const PATTERN_TO_MUSCLES: Record<string, string[]> = {
  horizontal_push: ['chest', 'triceps', 'shoulders'],
  vertical_push: ['shoulders', 'triceps'],
  horizontal_pull: ['back', 'biceps'],
  vertical_pull: ['back', 'biceps'],
  lower_push: ['quads', 'glutes'],
  lower_pull: ['hamstrings', 'glutes'],
  core: ['core'],
};

/**
 * Research-based defaults per livello (Israetel/RP guidelines).
 * Sets per week per muscle group.
 */
export const VOLUME_DEFAULTS: Record<string, Record<string, { mev: number; mav: number; mrv: number }>> = {
  beginner: {
    chest:      { mev: 6,  mav: 12, mrv: 16 },
    back:       { mev: 8,  mav: 14, mrv: 18 },
    quads:      { mev: 6,  mav: 12, mrv: 16 },
    hamstrings: { mev: 4,  mav: 10, mrv: 14 },
    shoulders:  { mev: 6,  mav: 12, mrv: 16 },
    biceps:     { mev: 4,  mav: 10, mrv: 14 },
    triceps:    { mev: 4,  mav: 10, mrv: 12 },
    core:       { mev: 0,  mav: 8,  mrv: 12 },
    glutes:     { mev: 0,  mav: 8,  mrv: 12 },
    calves:     { mev: 4,  mav: 8,  mrv: 12 },
  },
  intermediate: {
    chest:      { mev: 8,  mav: 16, mrv: 20 },
    back:       { mev: 10, mav: 18, mrv: 22 },
    quads:      { mev: 8,  mav: 16, mrv: 22 },
    hamstrings: { mev: 6,  mav: 12, mrv: 16 },
    shoulders:  { mev: 8,  mav: 16, mrv: 20 },
    biceps:     { mev: 6,  mav: 14, mrv: 18 },
    triceps:    { mev: 6,  mav: 12, mrv: 16 },
    core:       { mev: 0,  mav: 12, mrv: 16 },
    glutes:     { mev: 4,  mav: 12, mrv: 18 },
    calves:     { mev: 6,  mav: 12, mrv: 14 },
  },
  advanced: {
    chest:      { mev: 10, mav: 20, mrv: 24 },
    back:       { mev: 12, mav: 22, mrv: 26 },
    quads:      { mev: 10, mav: 20, mrv: 26 },
    hamstrings: { mev: 8,  mav: 16, mrv: 20 },
    shoulders:  { mev: 10, mav: 20, mrv: 24 },
    biceps:     { mev: 8,  mav: 18, mrv: 22 },
    triceps:    { mev: 8,  mav: 16, mrv: 20 },
    core:       { mev: 4,  mav: 16, mrv: 20 },
    glutes:     { mev: 6,  mav: 16, mrv: 22 },
    calves:     { mev: 8,  mav: 14, mrv: 18 },
  },
};

// ================================================================
// SERVICE STATE
// ================================================================

let supabase: SupabaseClient | null = null;

export function initVolumeProfileService(client: SupabaseClient): void {
  supabase = client;
}

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('[VolumeProfile] Service not initialized. Call initVolumeProfileService() first.');
  }
  return supabase;
}

// ================================================================
// VOLUME PROFILE CRUD
// ================================================================

/**
 * Initialize volume profile for a user with research-based defaults.
 * Called once when user creates their first program.
 */
export async function initializeVolumeProfile(
  userId: string,
  level: string = 'beginner'
): Promise<{ success: boolean; error?: string }> {
  const client = getClient();

  const { data, error } = await client.rpc('initialize_volume_profile', {
    p_user_id: userId,
    p_level: level,
  });

  if (error) {
    console.error('[VolumeProfile] Init error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get the current volume profile for a user.
 * Returns null if not yet initialized.
 */
export async function getVolumeProfile(
  userId: string
): Promise<MuscleVolumeProfile[] | null> {
  const client = getClient();

  const { data, error } = await client.rpc('get_volume_profile', {
    p_user_id: userId,
  });

  if (error) {
    console.error('[VolumeProfile] Get error:', error);
    return null;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  return data as MuscleVolumeProfile[];
}

/**
 * Update volume profile based on recent workout feedback.
 * Called after every 3-4 sessions or at end of mesocycle.
 */
export async function updateVolumeProfileFromFeedback(
  userId: string,
  sessionsToAnalyze: number = 4
): Promise<{ success: boolean; updates?: any; error?: string }> {
  const client = getClient();

  const { data, error } = await client.rpc('update_volume_profile_from_feedback', {
    p_user_id: userId,
    p_sessions_to_analyze: sessionsToAnalyze,
  });

  if (error) {
    console.error('[VolumeProfile] Update error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, updates: data };
}

// ================================================================
// VOLUME RECOMMENDATIONS FOR PROGRAM GENERATION
// ================================================================

/**
 * Get volume recommendations for each muscle group.
 * Used by programGenerator to decide sets per exercise.
 */
export function getVolumeRecommendations(
  profile: MuscleVolumeProfile[],
  goal: string,
  frequency: number
): VolumeRecommendation[] {
  return profile.map((mp) => {
    const { muscle_group, mev, mav, mrv, current_volume, volume_trend, avg_rpe_at_current_volume } = mp;

    // Determine which zone the user is in
    let zone: VolumeRecommendation['zone'];
    let action: VolumeRecommendation['action'];
    let recommended: number;
    let reason: string;

    if (current_volume < mev) {
      zone = 'below_mev';
      action = 'increase';
      recommended = mev + (mav - mev) * 0.3; // Jump to 30% of productive range
      reason = `Volume sotto MEV (${current_volume}/${mev}). Aumento a ${recommended.toFixed(0)} set/settimana.`;
    } else if (current_volume <= mav) {
      zone = 'mev_to_mav';
      // In the sweet spot — decide based on RPE and trend
      if (volume_trend === 'needs_deload') {
        action = 'deload';
        recommended = mev;
        reason = `Deload necessario. Riduzione a MEV (${mev} set/settimana).`;
      } else if (avg_rpe_at_current_volume && avg_rpe_at_current_volume < 7) {
        action = 'increase';
        recommended = Math.min(current_volume + setsPerWeekIncrement(goal), mav);
        reason = `RPE basso (${avg_rpe_at_current_volume}). Aumento progressivo.`;
      } else {
        action = 'maintain';
        recommended = current_volume;
        reason = `Volume in zona produttiva. Mantenere.`;
      }
    } else if (current_volume <= mrv) {
      zone = 'mav_to_mrv';
      // Pushing limits — monitor carefully
      if (volume_trend === 'needs_deload' || (avg_rpe_at_current_volume && avg_rpe_at_current_volume > 8.5)) {
        action = 'decrease';
        recommended = mav;
        reason = `Volume alto (${current_volume}) con RPE elevato. Riduzione a MAV (${mav}).`;
      } else {
        action = 'maintain';
        recommended = current_volume;
        reason = `Volume tra MAV e MRV — monitorare RPE attentamente.`;
      }
    } else {
      zone = 'above_mrv';
      action = 'decrease';
      recommended = mav;
      reason = `Volume sopra MRV (${current_volume}/${mrv})! Riduzione immediata a MAV (${mav}).`;
    }

    return {
      muscle_group,
      recommended_sets_per_week: Math.round(recommended),
      zone,
      action,
      reason,
    };
  });
}

/**
 * Convert volume recommendations to per-exercise sets.
 * Given a weekly split with N sessions hitting a muscle group,
 * distribute total weekly sets across sessions.
 */
export function distributeSetsPerSession(
  weeklyRecommendedSets: number,
  sessionsPerWeek: number,
  exercisesPerSession: number = 1
): number {
  if (sessionsPerWeek <= 0) return 3; // fallback
  const totalPerSession = weeklyRecommendedSets / sessionsPerWeek;
  const perExercise = totalPerSession / Math.max(exercisesPerSession, 1);
  // Clamp to 2-6 sets per exercise
  return Math.max(2, Math.min(6, Math.round(perExercise)));
}

/**
 * Get the volume recommendation for a specific pattern.
 * Maps pattern → primary muscle group → recommendation.
 */
export function getRecommendedSetsForPattern(
  pattern: string,
  recommendations: VolumeRecommendation[]
): number | null {
  const muscles = PATTERN_TO_MUSCLES[pattern];
  if (!muscles || muscles.length === 0) return null;

  // Use the primary muscle group (first in list)
  const primaryMuscle = muscles[0];
  const rec = recommendations.find((r) => r.muscle_group === primaryMuscle);

  return rec?.recommended_sets_per_week ?? null;
}

// ================================================================
// MESOCYCLE VOLUME PROGRESSION
// ================================================================

/**
 * Calculate weekly volume progression across a mesocycle.
 * Volume ramps up from MEV toward MAV/MRV over the mesocycle,
 * then drops back for deload.
 *
 * Example for 4-week block:
 * Week 1: MEV + 30% range
 * Week 2: MEV + 50% range
 * Week 3: MEV + 70% range (overreach)
 * Week 4: MEV (deload)
 */
export function calculateMesocycleVolume(
  profile: MuscleVolumeProfile,
  weekNumber: number,
  totalWeeks: number,
  includesDeload: boolean
): number {
  const { mev, mav, mrv } = profile;
  const range = mav - mev; // productive range

  const trainingWeeks = includesDeload ? totalWeeks - 1 : totalWeeks;
  const isDeloadWeek = includesDeload && weekNumber === totalWeeks;

  if (isDeloadWeek) {
    return mev; // Deload = back to MEV
  }

  // Linear ramp from 30% to 80% of range
  const startFraction = 0.3;
  const endFraction = 0.8;
  const weekFraction = (weekNumber - 1) / Math.max(trainingWeeks - 1, 1);
  const currentFraction = startFraction + (endFraction - startFraction) * weekFraction;

  const volume = mev + range * currentFraction;

  // Never exceed MRV
  return Math.min(Math.round(volume), mrv);
}

// ================================================================
// HELPERS
// ================================================================

function setsPerWeekIncrement(goal: string): number {
  const goalLower = goal.toLowerCase();
  if (['strength', 'forza'].includes(goalLower)) return 1;
  if (['muscle_gain', 'ipertrofia', 'massa', 'hypertrophy'].includes(goalLower)) return 2;
  return 1;
}
