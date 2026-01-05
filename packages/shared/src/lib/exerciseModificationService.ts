/**
 * EXERCISE MODIFICATION SERVICE
 *
 * Gestisce le modifiche persistenti agli esercizi:
 * - Downgrade varianti (per RIR basso)
 * - Upgrade varianti (per RIR alto)
 * - TUT modifier attivi
 * - Weight adjustments
 *
 * Le modifiche persistono tra sessioni e vengono caricate all'inizio del workout
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ExerciseModification {
  id: string;
  user_id: string;
  program_id: string;
  cycle_number: number;

  // Identificazione esercizio
  exercise_name: string;
  exercise_pattern: string;

  // Variante
  original_variant?: string;
  current_variant: string;
  variant_changed: boolean;

  // Tempo/TUT
  original_tempo: string;
  current_tempo: string;
  tempo_modifier_id?: string;
  tempo_changed: boolean;

  // Peso
  original_weight?: number;
  current_weight?: number;
  weight_reduction_percent?: number;

  // Reps
  original_reps?: number;
  current_reps?: number;

  // Motivo e tracking
  reason: 'rir_exceeded_downgrade' | 'rir_high_add_tut' | 'rir_high_upgrade' | 'user_request' | 'pain_adaptation';
  severity: 'warning' | 'critical';
  rir_target?: number;
  rir_actual?: number;

  // Stato
  is_active: boolean;
  applied_count: number;
  last_applied_at?: string;

  created_at: string;
  updated_at: string;
}

export interface SaveModificationInput {
  user_id: string;
  program_id: string;
  cycle_number: number;

  exercise_name: string;
  exercise_pattern: string;

  original_variant?: string;
  current_variant: string;
  variant_changed: boolean;

  original_tempo: string;
  current_tempo: string;
  tempo_modifier_id?: string;
  tempo_changed: boolean;

  original_weight?: number;
  current_weight?: number;
  weight_reduction_percent?: number;

  original_reps?: number;
  current_reps?: number;

  reason: ExerciseModification['reason'];
  severity: ExerciseModification['severity'];
  rir_target?: number;
  rir_actual?: number;
}

/**
 * Salva una nuova modifica o aggiorna esistente
 */
export async function saveModification(
  supabase: SupabaseClient,
  input: SaveModificationInput
): Promise<{ data: ExerciseModification | null; error: Error | null }> {
  try {
    // Prima cerca se esiste già una modifica attiva per questo esercizio
    const { data: existing } = await supabase
      .from('exercise_modifications')
      .select('*')
      .eq('user_id', input.user_id)
      .eq('program_id', input.program_id)
      .eq('exercise_name', input.exercise_name)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      // Aggiorna esistente
      const { data, error } = await supabase
        .from('exercise_modifications')
        .update({
          current_variant: input.current_variant,
          variant_changed: input.variant_changed,
          current_tempo: input.current_tempo,
          tempo_modifier_id: input.tempo_modifier_id,
          tempo_changed: input.tempo_changed,
          current_weight: input.current_weight,
          weight_reduction_percent: input.weight_reduction_percent,
          current_reps: input.current_reps,
          reason: input.reason,
          severity: input.severity,
          rir_target: input.rir_target,
          rir_actual: input.rir_actual,
          applied_count: existing.applied_count + 1,
          last_applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }

    // Crea nuova
    const { data, error } = await supabase
      .from('exercise_modifications')
      .insert({
        ...input,
        is_active: true,
        applied_count: 1,
        last_applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error saving:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Aggiorna una modifica esistente
 */
export async function updateModification(
  supabase: SupabaseClient,
  modificationId: string,
  updates: Partial<Omit<ExerciseModification, 'id' | 'user_id' | 'program_id' | 'created_at'>>
): Promise<{ data: ExerciseModification | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('exercise_modifications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', modificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error updating:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Rimuove una modifica (marca come non attiva)
 */
export async function removeModification(
  supabase: SupabaseClient,
  modificationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('exercise_modifications')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', modificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error removing:', error);
    return { error: error as Error };
  }
}

/**
 * Ottieni tutte le modifiche attive per un programma
 */
export async function getActiveModifications(
  supabase: SupabaseClient,
  userId: string,
  programId: string
): Promise<{ data: ExerciseModification[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('exercise_modifications')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error loading:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Ottieni modifica per un esercizio specifico
 */
export async function getModificationForExercise(
  supabase: SupabaseClient,
  userId: string,
  programId: string,
  exerciseName: string
): Promise<{ data: ExerciseModification | null; error: Error | null }> {
  try {
    // Cerca per nome esercizio o variante originale
    const { data, error } = await supabase
      .from('exercise_modifications')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('is_active', true)
      .or(`exercise_name.eq.${exerciseName},original_variant.eq.${exerciseName},current_variant.eq.${exerciseName}`)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error loading for exercise:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Resetta tutte le modifiche per un programma (es. nuovo ciclo)
 */
export async function resetModificationsForProgram(
  supabase: SupabaseClient,
  userId: string,
  programId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('exercise_modifications')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('is_active', true);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error resetting:', error);
    return { error: error as Error };
  }
}

/**
 * Conta modifiche attive per un utente
 */
export async function countActiveModifications(
  supabase: SupabaseClient,
  userId: string,
  programId?: string
): Promise<{ count: number; error: Error | null }> {
  try {
    let query = supabase
      .from('exercise_modifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (programId) {
      query = query.eq('program_id', programId);
    }

    const { count, error } = await query;

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('[ExerciseModification] Error counting:', error);
    return { count: 0, error: error as Error };
  }
}
