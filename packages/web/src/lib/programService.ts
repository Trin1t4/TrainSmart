/**
 * FITNESSFLOW - PROGRAM SERVICE
 * Complete service layer for training programs with Supabase cloud sync
 *
 * Features:
 * - CRUD operations for training programs
 * - Multi-device synchronization
 * - Offline support with localStorage fallback
 * - Active program management
 * - Program history tracking
 */

import { supabase } from './supabaseClient';

// ===== TYPES =====

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
  weekly_split?: any[];
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

// ===== HELPER FUNCTIONS =====

/**
 * Get current authenticated user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
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
 * Cache program to localStorage
 */
function cacheToLocalStorage(key: string, data: any): void {
  try {
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
 */
export async function createProgram(
  program: TrainingProgram
): Promise<ProgramServiceResponse<TrainingProgram>> {
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
      cacheToLocalStorage(CACHE_KEY_ACTIVE, program);
      return { success: true, data: program, fromCache: true };
    }

    // ✅ FIX: Deactivate all existing programs BEFORE creating new one
    console.log('[ProgramService] Deactivating existing programs...');
    const { error: deactivateError } = await supabase
      .from('training_programs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.warn('[ProgramService] Warning: Failed to deactivate old programs:', deactivateError.message);
      // Continue anyway - not critical
    } else {
      console.log('[ProgramService] ✅ Old programs deactivated');
    }

    // Prepare program data
    const programData = {
      ...program,
      user_id: userId,
      is_active: true, // New programs are active by default
      status: program.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[ProgramService] Inserting program data:', {
      name: programData.name,
      level: programData.level,
      goal: programData.goal,
      split: programData.split,
      hasWeeklySplit: !!programData.weekly_split,
      weeklySplitDays: programData.weekly_split?.days?.length || 0,
      hasExercises: !!programData.exercises,
      exercisesCount: programData.exercises?.length || 0,
      is_active: programData.is_active,
      status: programData.status
    });

    // Insert to Supabase
    const { data, error } = await supabase
      .from('training_programs')
      .insert(programData)
      .select()
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      // Fallback to localStorage
      cacheToLocalStorage(CACHE_KEY_ACTIVE, programData);
      return { success: false, error: error.message, data: programData, fromCache: true };
    }

    console.log('[ProgramService] Program created successfully:', {
      id: data.id,
      name: data.name,
      hasWeeklySplit: !!data.weekly_split,
      weeklySplitDays: data.weekly_split?.days?.length || 0,
      exercisesCount: data.exercises?.length || 0,
      is_active: data.is_active
    });

    // Cache locally for fast access
    cacheToLocalStorage(CACHE_KEY_ACTIVE, data);

    return { success: true, data };

  } catch (error: any) {
    console.error('[ProgramService] Error creating program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get active program for current user
 */
export async function getActiveProgram(): Promise<ProgramServiceResponse<TrainingProgram>> {
  console.log('[ProgramService] Getting active program...');

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      // Try localStorage
      const cached = getFromLocalStorage(CACHE_KEY_ACTIVE, Infinity);
      if (cached) {
        console.log('[ProgramService] Returning cached program (no user)');
        return { success: true, data: cached, fromCache: true };
      }
      return { success: false, error: 'No authenticated user and no cached program' };
    }

    // Try cache first (fast)
    const cached = getFromLocalStorage(CACHE_KEY_ACTIVE);
    if (cached) {
      console.log('[ProgramService] Returning cached active program');
      return { success: true, data: cached, fromCache: true };
    }

    // Fetch from Supabase
    const { data, error } = await supabase
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

    console.log('[ProgramService] Active program loaded:', data.id);

    // Update last_accessed_at
    await supabase
      .from('training_programs')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', data.id);

    // Cache for future
    cacheToLocalStorage(CACHE_KEY_ACTIVE, data);

    return { success: true, data };

  } catch (error: any) {
    console.error('[ProgramService] Error getting active program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get all programs for current user (history)
 */
export async function getAllPrograms(): Promise<ProgramServiceResponse<TrainingProgram[]>> {
  console.log('[ProgramService] Getting all programs...');

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      const cached = getFromLocalStorage(CACHE_KEY_HISTORY, Infinity);
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }
      return { success: false, error: 'No authenticated user' };
    }

    // Try cache first
    const cached = getFromLocalStorage(CACHE_KEY_HISTORY);
    if (cached) {
      console.log('[ProgramService] Returning cached program history');
      return { success: true, data: cached, fromCache: true };
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[ProgramService] Loaded ${data.length} programs`);

    // Cache
    cacheToLocalStorage(CACHE_KEY_HISTORY, data);

    return { success: true, data };

  } catch (error: any) {
    console.error('[ProgramService] Error getting all programs:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * READ: Get program by ID
 */
export async function getProgramById(programId: string): Promise<ProgramServiceResponse<TrainingProgram>> {
  console.log('[ProgramService] Getting program by ID:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[ProgramService] Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    console.error('[ProgramService] Error getting program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * UPDATE: Update existing program
 */
export async function updateProgram(
  programId: string,
  updates: Partial<TrainingProgram>
): Promise<ProgramServiceResponse<TrainingProgram>> {
  console.log('[ProgramService] Updating program:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await supabase
      .from('training_programs')
      .update({
        ...updates,
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

    console.log('[ProgramService] Program updated successfully');

    // Invalidate cache
    localStorage.removeItem(CACHE_KEY_ACTIVE);
    localStorage.removeItem(CACHE_KEY_HISTORY);

    return { success: true, data };

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

    const { error } = await supabase
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
    localStorage.removeItem(CACHE_KEY_ACTIVE);
    localStorage.removeItem(CACHE_KEY_HISTORY);

    return { success: true };

  } catch (error: any) {
    console.error('[ProgramService] Error deleting program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * SPECIAL: Set program as active (deactivates all others)
 */
export async function setActiveProgram(programId: string): Promise<ProgramServiceResponse<TrainingProgram>> {
  console.log('[ProgramService] Setting active program:', programId);

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }

    // The trigger in Supabase will automatically deactivate other programs
    const { data, error } = await supabase
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
    localStorage.removeItem(CACHE_KEY_ACTIVE);
    localStorage.removeItem(CACHE_KEY_HISTORY);

    // Cache new active program
    cacheToLocalStorage(CACHE_KEY_ACTIVE, data);

    return { success: true, data };

  } catch (error: any) {
    console.error('[ProgramService] Error setting active program:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * SPECIAL: Mark program as completed
 */
export async function completeProgram(programId: string): Promise<ProgramServiceResponse<TrainingProgram>> {
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
  localStorage.removeItem(CACHE_KEY_ACTIVE);
  localStorage.removeItem(CACHE_KEY_HISTORY);
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
    const { data: existingPrograms, error: checkError } = await supabase
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
    const localProgram = localStorage.getItem('currentProgram');
    if (!localProgram) {
      console.log('[ProgramService] No localStorage program to migrate');
      return { success: true };
    }

    const program = JSON.parse(localProgram);
    console.log('[ProgramService] Found localStorage program to migrate:', program.name);

    // Create program in Supabase
    const result = await createProgram({
      ...program,
      is_active: true,
      status: 'active'
    });

    if (result.success) {
      console.log('[ProgramService] Migration successful, clearing localStorage');
      // Optional: clear localStorage after successful migration
      // localStorage.removeItem('currentProgram');
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
