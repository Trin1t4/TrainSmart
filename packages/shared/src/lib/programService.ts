/**
 * TRAINSMART - PROGRAM SERVICE (v2 con normalizzazione)
 * Complete service layer for training programs with Supabase cloud sync
 *
 * CHANGELOG v2:
 * - Integrata normalizzazione automatica su TUTTI i metodi di lettura
 * - Tutti i programmi restituiti sono sempre NormalizedProgram
 * - Aggiunto prepareForSave() prima dei salvataggi
 *
 * Features:
 * - CRUD operations for training programs
 * - Multi-device synchronization
 * - Offline support with localStorage fallback
 * - Active program management
 * - Program history tracking
 * - AUTOMATIC NORMALIZATION on load
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  normalizeOnLoad,
  normalizeMany,
  prepareForSave,
  type NormalizedProgram
} from '../utils/programNormalizerUnified';

// ===== TYPES =====

// Legacy type per compatibilità (ora usiamo NormalizedProgram)
export interface TrainingProgram {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  location?: string;
  training_type?: string;
  frequency: number;
  split: string;
  days_per_week?: number;
  weekly_split?: any;
  exercises?: any[];
  total_weeks?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  status?: 'draft' | 'active' | 'completed' | 'paused' | 'archived';
  assessment_id?: string;
  progression?: any[];
  includes_deload?: boolean;
  deload_frequency?: number;
  pain_areas?: string[];
  corrective_exercises?: any[];
  available_equipment?: any;
  pattern_baselines?: any;
  weekly_schedule?: any[];
  metadata?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
}

export interface ProgramServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
}

// ===== CONSTANTS =====

const CACHE_KEY_ACTIVE = 'currentProgram';
const CACHE_KEY_HISTORY = 'programHistory';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===== SUPABASE CLIENT (Dependency Injection) =====

let supabase: SupabaseClient | null = null;

/**
 * Initialize the program service with a Supabase client
 * Must be called before using any service functions
 */
export function initProgramService(client: SupabaseClient): void {
  supabase = client;
}

/**
 * Get the current Supabase client
 * Throws if not initialized
 */
function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[ProgramService] Supabase client not initialized. Call initProgramService first.');
  }
  return supabase;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get current authenticated user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await getSupabase().auth.getUser();
    if (error || !user) {
      console.warn('[ProgramService] No authenticated user:', error?.message);
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('[ProgramService] Error getting user:', error);
    return null;
  }
}

/**
 * Validate program data before save
 */
function validateProgram(program: Partial<TrainingProgram>): { valid: boolean; error?: string } {
  if (!program.name || program.name.trim().length === 0) {
    return { valid: false, error: 'Program name is required' };
  }

  if (!program.level || !['beginner', 'intermediate', 'advanced'].includes(program.level)) {
    return { valid: false, error: 'Invalid program level' };
  }

  if (!program.frequency || program.frequency < 1 || program.frequency > 7) {
    return { valid: false, error: 'Frequency must be between 1 and 7' };
  }

  if (!program.split || program.split.trim().length === 0) {
    return { valid: false, error: 'Program split is required' };
  }

  return { valid: true };
}

/**
 * Cache program to localStorage (normalizzato)
 */
function cacheToLocalStorage(key: string, data: any): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('[ProgramService] Failed to cache to localStorage:', error);
  }
}

/**
 * Get cached program from localStorage
 */
function getFromLocalStorage(key: string, maxAge: number = CACHE_DURATION): any | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('[ProgramService] Failed to get from localStorage:', error);
    return null;
  }
}

// ===== MAIN SERVICE FUNCTIONS =====

/**
 * CREATE: Save new program to Supabase
 * Input può essere raw o già normalizzato - viene preparato per il DB
 */
export async function createProgram(
  program: TrainingProgram | NormalizedProgram
): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Creating program:', program.name);

  // Validate
  const validation = validateProgram(program);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      // Fallback to localStorage if not authenticated
      console.warn('[ProgramService] No user, saving to localStorage only');
      const normalized = normalizeOnLoad(program);
      if (normalized) {
        cacheToLocalStorage(CACHE_KEY_ACTIVE, normalized);
      }
      return { success: true, data: normalized!, fromCache: true };
    }

    // Deactivate all existing programs BEFORE creating new one
    console.log('[ProgramService] Deactivating existing programs...');
    const { error: deactivateError } = await getSupabase()
      .from('training_programs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.warn('[ProgramService] Warning: Failed to deactivate old programs:', deactivateError.message);
    } else {
      console.log('[ProgramService] Old programs deactivated');
    }

    // Prepara per il salvataggio (rimuove campi runtime se normalizzato)
    const isAlreadyNormalized = '_normalized' in program;
    const programData = isAlreadyNormalized 
      ? prepareForSave(program as NormalizedProgram)
      : {
          ...program,
          user_id: userId,
          is_active: true,
          status: program.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

    // Assicura user_id e is_active
    programData.user_id = userId;
    programData.is_active = true;
    if (!programData.created_at) {
      programData.created_at = new Date().toISOString();
    }

    // Insert to Supabase
    const { data, error } = await getSupabase()
      .from('training_programs')
      .insert(programData)
      .select()
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      const normalized = normalizeOnLoad(programData);
      cacheToLocalStorage(CACHE_KEY_ACTIVE, normalized);
      return { success: false, error: error.message, data: normalized!, fromCache: true };
    }

    console.log('[ProgramService] Program created successfully:', data.id);

    // ✅ NORMALIZZA prima di restituire e cachare
    const normalized = normalizeOnLoad(data)!;
    cacheToLocalStorage(CACHE_KEY_ACTIVE, normalized);

    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error creating program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get active program for current user
 * ✅ RESTITUISCE SEMPRE NormalizedProgram
 */
export async function getActiveProgram(): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Getting active program...');

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      // Try localStorage
      const cached = getFromLocalStorage(CACHE_KEY_ACTIVE, Infinity);
      if (cached) {
        console.log('[ProgramService] Returning cached program (no user)');
        // Cache potrebbe essere già normalizzato o no
        const normalized = normalizeOnLoad(cached);
        return { success: true, data: normalized!, fromCache: true };
      }
      return { success: false, error: 'No authenticated user and no cached program' };
    }

    // Try cache first (fast)
    const cached = getFromLocalStorage(CACHE_KEY_ACTIVE);
    if (cached) {
      console.log('[ProgramService] Returning cached active program');
      const normalized = normalizeOnLoad(cached);
      return { success: true, data: normalized!, fromCache: true };
    }

    // Fetch from Supabase
    const { data, error } = await getSupabase()
      .from('training_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('[ProgramService] No active program found');
      return { success: false, error: 'No active program found' };
    }

    // ✅ NORMALIZZA PRIMA DI RESTITUIRE
    const normalized = normalizeOnLoad(data)!;
    console.log(`[ProgramService] Loaded & normalized: ${normalized.id} (was: ${normalized._originalStructure})`);

    // Update last_accessed_at
    await getSupabase()
      .from('training_programs')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', data.id);

    // Cache normalizzato
    cacheToLocalStorage(CACHE_KEY_ACTIVE, normalized);

    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error getting active program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get all programs for current user (history)
 * ✅ RESTITUISCE SEMPRE NormalizedProgram[]
 */
export async function getAllPrograms(): Promise<ProgramServiceResponse<NormalizedProgram[]>> {
  console.log('[ProgramService] Getting all programs...');

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      const cached = getFromLocalStorage(CACHE_KEY_HISTORY, Infinity);
      if (cached) {
        const normalized = normalizeMany(cached);
        return { success: true, data: normalized, fromCache: true };
      }
      return { success: false, error: 'No authenticated user' };
    }

    // Try cache first
    const cached = getFromLocalStorage(CACHE_KEY_HISTORY);
    if (cached) {
      console.log('[ProgramService] Returning cached program history');
      const normalized = normalizeMany(cached);
      return { success: true, data: normalized, fromCache: true };
    }

    // Fetch from Supabase
    const { data, error } = await getSupabase()
      .from('training_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    // ✅ NORMALIZZA TUTTI
    const normalized = normalizeMany(data || []);
    console.log(`[ProgramService] Loaded ${normalized.length} programs (all normalized)`);

    // Cache
    cacheToLocalStorage(CACHE_KEY_HISTORY, normalized);

    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error getting all programs:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get program by ID
 * ✅ RESTITUISCE SEMPRE NormalizedProgram
 */
export async function getProgramById(programId: string): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Getting program by ID:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await getSupabase()
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    // ✅ NORMALIZZA
    const normalized = normalizeOnLoad(data)!;
    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error getting program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * UPDATE: Update existing program
 * Accetta sia partial updates raw che NormalizedProgram
 */
export async function updateProgram(
  programId: string,
  updates: Partial<TrainingProgram> | Partial<NormalizedProgram>
): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Updating program:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    // Se l'update è un NormalizedProgram completo, prepara per il save
    const isNormalizedUpdate = '_normalized' in updates;
    const dbUpdates = isNormalizedUpdate
      ? prepareForSave(updates as NormalizedProgram)
      : {
          ...updates,
          updated_at: new Date().toISOString()
        };

    // Rimuovi campi che non devono essere aggiornati direttamente
    delete (dbUpdates as any)._normalized;
    delete (dbUpdates as any)._normalizedAt;
    delete (dbUpdates as any)._originalStructure;

    const { data, error } = await getSupabase()
      .from('training_programs')
      .update(dbUpdates)
      .eq('id', programId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[ProgramService] Program updated successfully');

    // Invalidate cache
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY_ACTIVE);
      localStorage.removeItem(CACHE_KEY_HISTORY);
    }

    // ✅ NORMALIZZA il risultato
    const normalized = normalizeOnLoad(data)!;
    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error updating program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * DELETE: Delete program
 */
export async function deleteProgram(programId: string): Promise<ProgramServiceResponse<void>> {
  console.log('[ProgramService] Deleting program:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    const { error } = await getSupabase()
      .from('training_programs')
      .delete()
      .eq('id', programId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[ProgramService] Program deleted successfully');

    // Invalidate cache
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY_ACTIVE);
      localStorage.removeItem(CACHE_KEY_HISTORY);
    }

    return { success: true };

  } catch (error: any) {
    console.error('[ProgramService] Error deleting program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * SPECIAL: Set program as active (deactivates all others)
 */
export async function setActiveProgram(programId: string): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Setting active program:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    // The trigger in Supabase will automatically deactivate other programs
    const { data, error } = await getSupabase()
      .from('training_programs')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[ProgramService] Active program set successfully');

    // Invalidate cache
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY_ACTIVE);
      localStorage.removeItem(CACHE_KEY_HISTORY);
    }

    // ✅ NORMALIZZA e cache
    const normalized = normalizeOnLoad(data)!;
    cacheToLocalStorage(CACHE_KEY_ACTIVE, normalized);

    return { success: true, data: normalized };

  } catch (error: any) {
    console.error('[ProgramService] Error setting active program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * SPECIAL: Mark program as completed
 */
export async function completeProgram(programId: string): Promise<ProgramServiceResponse<NormalizedProgram>> {
  console.log('[ProgramService] Completing program:', programId);

  return updateProgram(programId, {
    status: 'completed',
    is_active: false,
    end_date: new Date().toISOString()
  });
}

/**
 * UTILITY: Clear all cache
 */
export function clearProgramCache(): void {
  console.log('[ProgramService] Clearing cache...');
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CACHE_KEY_ACTIVE);
    localStorage.removeItem(CACHE_KEY_HISTORY);
  }
}

/**
 * MIGRATION: Migrate localStorage program to Supabase
 * Should be called once when user first authenticates
 */
export async function migrateLocalStorageToSupabase(): Promise<ProgramServiceResponse<void>> {
  console.log('[ProgramService] Starting localStorage migration...');

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user for migration' };
    }

    // Check if user already has programs in Supabase
    const { data: existingPrograms, error: checkError } = await getSupabase()
      .from('training_programs')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('[ProgramService] Error checking existing programs:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingPrograms && existingPrograms.length > 0) {
      console.log('[ProgramService] User already has programs in Supabase, skipping migration');
      return { success: true };
    }

    // Get program from localStorage
    if (typeof localStorage === 'undefined') {
      console.log('[ProgramService] No localStorage available');
      return { success: true };
    }

    const localProgram = localStorage.getItem('currentProgram');
    if (!localProgram) {
      console.log('[ProgramService] No localStorage program to migrate');
      return { success: true };
    }

    const parsed = JSON.parse(localProgram);
    // Potrebbe essere { data, timestamp } o direttamente il programma
    const program = parsed.data || parsed;
    
    console.log('[ProgramService] Found localStorage program to migrate:', program.name);

    // Create program in Supabase
    const result = await createProgram({
      ...program,
      is_active: true,
      status: 'active'
    });

    if (result.success) {
      console.log('[ProgramService] Migration successful');
      return { success: true };
    } else {
      console.error('[ProgramService] Migration failed:', result.error);
      return { success: false, error: result.error };
    }

  } catch (error: any) {
    console.error('[ProgramService] Migration error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * SYNC: Force sync from Supabase (refresh cache)
 */
export async function syncProgramsFromCloud(): Promise<ProgramServiceResponse<void>> {
  console.log('[ProgramService] Syncing programs from cloud...');

  try {
    // Clear cache
    clearProgramCache();

    // Fetch fresh data
    const activeResult = await getActiveProgram();
    const allResult = await getAllPrograms();

    if (!activeResult.success && !allResult.success) {
      return { success: false, error: 'Failed to sync from cloud' };
    }

    console.log('[ProgramService] Sync complete');
    return { success: true };

  } catch (error: any) {
    console.error('[ProgramService] Sync error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ===== RE-EXPORT NORMALIZER UTILITIES =====
// Per comodità, ri-esporta le utility del normalizer

export {
  normalizeOnLoad,
  normalizeMany,
  prepareForSave,
  type NormalizedProgram,
} from '../utils/programNormalizerUnified';

export {
  getAllExercises,
  getExercisesForDay,
  getExerciseById,
  getExerciseByName,
  updateExerciseInProgram,
  updateExerciseWeight,
  isNormalizedProgram,
  detectProgramStructure,
} from '../utils/programNormalizerUnified';
