/**
 * DATA SYNCHRONIZATION SERVICE
 *
 * Handles bidirectional sync between localStorage and Supabase.
 * Provides resilience against browser data loss and offline support.
 *
 * Strategy:
 * 1. Always write to localStorage first (instant, offline-capable)
 * 2. Sync to Supabase when online
 * 3. On app load, merge data with "last modified wins" strategy
 * 4. Handle conflicts with user notification
 */

export interface SyncableData {
  id?: string;
  user_id?: string;
  updated_at: string;
  created_at?: string;
  [key: string]: any;
}

export interface SyncResult {
  success: boolean;
  source: 'local' | 'remote' | 'merged';
  data: any;
  conflicts?: string[];
  error?: string;
}

export interface SyncConfig {
  localKey: string;
  supabaseTable: string;
  userIdField?: string;
  mergeStrategy?: 'local_wins' | 'remote_wins' | 'latest_wins';
}

// Storage keys used by the app
export const STORAGE_KEYS = {
  ONBOARDING: 'onboarding_data',
  SCREENING: 'screening_data',
  QUIZ: 'quiz_data',
  RECOVERY: 'recovery_screening_data',
  PROGRAM: 'current_program',
  USER_PREFERENCES: 'user_preferences',
  SYNC_STATUS: 'sync_status'
} as const;

// Supabase table mappings
export const TABLE_MAPPINGS: Record<string, SyncConfig> = {
  [STORAGE_KEYS.ONBOARDING]: {
    localKey: STORAGE_KEYS.ONBOARDING,
    supabaseTable: 'user_profiles',
    userIdField: 'user_id',
    mergeStrategy: 'latest_wins'
  },
  [STORAGE_KEYS.SCREENING]: {
    localKey: STORAGE_KEYS.SCREENING,
    supabaseTable: 'user_assessments',
    userIdField: 'user_id',
    mergeStrategy: 'latest_wins'
  },
  [STORAGE_KEYS.PROGRAM]: {
    localKey: STORAGE_KEYS.PROGRAM,
    supabaseTable: 'training_programs',
    userIdField: 'user_id',
    mergeStrategy: 'remote_wins' // Programs are generated server-side
  }
};

/**
 * Safe localStorage wrapper with error handling
 */
export const safeStorage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[SYNC] Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set(key: string, value: any): boolean {
    try {
      const data = {
        ...value,
        updated_at: new Date().toISOString(),
        _localVersion: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`[SYNC] Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[SYNC] Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  /**
   * Get all app data for backup/export
   */
  getAllAppData(): Record<string, any> {
    const data: Record<string, any> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = safeStorage.get(key);
      if (value) {
        data[key] = value;
      }
    });
    return data;
  }
};

/**
 * Compare timestamps and determine which data is newer
 */
export function compareTimestamps(local: any, remote: any): 'local' | 'remote' | 'equal' {
  const localTime = new Date(local?.updated_at || local?._localVersion || 0).getTime();
  const remoteTime = new Date(remote?.updated_at || 0).getTime();

  if (localTime > remoteTime) return 'local';
  if (remoteTime > localTime) return 'remote';
  return 'equal';
}

/**
 * Merge two data objects based on strategy
 */
export function mergeData(
  local: any,
  remote: any,
  strategy: 'local_wins' | 'remote_wins' | 'latest_wins' = 'latest_wins'
): { merged: any; conflicts: string[] } {
  const conflicts: string[] = [];

  if (!local && !remote) {
    return { merged: null, conflicts };
  }

  if (!local) {
    return { merged: remote, conflicts };
  }

  if (!remote) {
    return { merged: local, conflicts };
  }

  let winner: 'local' | 'remote';

  switch (strategy) {
    case 'local_wins':
      winner = 'local';
      break;
    case 'remote_wins':
      winner = 'remote';
      break;
    case 'latest_wins':
    default:
      winner = compareTimestamps(local, remote) === 'remote' ? 'remote' : 'local';
  }

  // Deep merge with conflict detection
  const merged = { ...(winner === 'remote' ? remote : local) };

  // Check for field-level conflicts
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  allKeys.forEach(key => {
    if (key.startsWith('_') || key === 'updated_at' || key === 'created_at') return;

    const localVal = JSON.stringify(local[key]);
    const remoteVal = JSON.stringify(remote[key]);

    if (localVal !== remoteVal && local[key] !== undefined && remote[key] !== undefined) {
      conflicts.push(key);
    }
  });

  return { merged, conflicts };
}

/**
 * Sync status tracker
 */
export interface SyncStatus {
  lastSyncAt: string | null;
  pendingChanges: string[];
  syncErrors: Array<{ key: string; error: string; timestamp: string }>;
  isOnline: boolean;
}

export function getSyncStatus(): SyncStatus {
  const stored = safeStorage.get<SyncStatus>(STORAGE_KEYS.SYNC_STATUS);
  return stored || {
    lastSyncAt: null,
    pendingChanges: [],
    syncErrors: [],
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

export function updateSyncStatus(updates: Partial<SyncStatus>): void {
  const current = getSyncStatus();
  safeStorage.set(STORAGE_KEYS.SYNC_STATUS, { ...current, ...updates });
}

export function markPendingSync(key: string): void {
  const status = getSyncStatus();
  if (!status.pendingChanges.includes(key)) {
    status.pendingChanges.push(key);
    updateSyncStatus(status);
  }
}

export function clearPendingSync(key: string): void {
  const status = getSyncStatus();
  status.pendingChanges = status.pendingChanges.filter(k => k !== key);
  updateSyncStatus(status);
}

/**
 * Data validation helpers
 */
export function validateOnboardingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('Data is null or undefined');
    return { valid: false, errors };
  }

  // Required fields
  const requiredFields = ['trainingLocation', 'goal'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Type validation
  if (data.frequency && (typeof data.frequency !== 'number' || data.frequency < 1 || data.frequency > 7)) {
    errors.push('Frequency must be a number between 1 and 7');
  }

  return { valid: errors.length === 0, errors };
}

export function validateScreeningData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('Data is null or undefined');
    return { valid: false, errors };
  }

  // Required fields
  if (!data.level || !['beginner', 'intermediate', 'advanced'].includes(data.level)) {
    errors.push('Invalid or missing level');
  }

  if (data.finalScore !== undefined && (typeof data.finalScore !== 'number' || data.finalScore < 0 || data.finalScore > 100)) {
    errors.push('Final score must be a number between 0 and 100');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create a sync-aware data saver
 * Saves to localStorage immediately and queues for Supabase sync
 */
export function createSyncedSaver(key: string) {
  return {
    save(data: any): boolean {
      const success = safeStorage.set(key, data);
      if (success) {
        markPendingSync(key);
      }
      return success;
    },

    load<T>(): T | null {
      return safeStorage.get<T>(key);
    },

    clear(): boolean {
      const success = safeStorage.remove(key);
      if (success) {
        clearPendingSync(key);
      }
      return success;
    }
  };
}

// Pre-configured savers for common data types
export const onboardingSaver = createSyncedSaver(STORAGE_KEYS.ONBOARDING);
export const screeningSaver = createSyncedSaver(STORAGE_KEYS.SCREENING);
export const recoverySaver = createSyncedSaver(STORAGE_KEYS.RECOVERY);
export const programSaver = createSyncedSaver(STORAGE_KEYS.PROGRAM);

/**
 * Backup all user data to a downloadable JSON file
 * Useful for data portability (GDPR compliance)
 */
export function exportUserData(): string {
  const allData = safeStorage.getAllAppData();
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    data: allData
  }, null, 2);
}

/**
 * Import user data from a backup file
 */
export function importUserData(jsonString: string): { success: boolean; imported: string[]; errors: string[] } {
  const imported: string[] = [];
  const errors: string[] = [];

  try {
    const backup = JSON.parse(jsonString);

    if (!backup.data || typeof backup.data !== 'object') {
      return { success: false, imported, errors: ['Invalid backup format'] };
    }

    Object.entries(backup.data).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key as any)) {
        if (safeStorage.set(key, value)) {
          imported.push(key);
        } else {
          errors.push(`Failed to import ${key}`);
        }
      }
    });

    return { success: errors.length === 0, imported, errors };
  } catch (error) {
    return { success: false, imported, errors: ['Failed to parse backup file'] };
  }
}

export default {
  safeStorage,
  STORAGE_KEYS,
  TABLE_MAPPINGS,
  compareTimestamps,
  mergeData,
  getSyncStatus,
  updateSyncStatus,
  markPendingSync,
  clearPendingSync,
  validateOnboardingData,
  validateScreeningData,
  createSyncedSaver,
  onboardingSaver,
  screeningSaver,
  recoverySaver,
  programSaver,
  exportUserData,
  importUserData
};
