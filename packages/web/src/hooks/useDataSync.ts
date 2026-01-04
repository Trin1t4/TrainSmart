/**
 * useDataSync - Hook per sincronizzazione bidirezionale localStorage ↔ Supabase
 *
 * Risolve ISSUE-003: i dati salvati in localStorage ora vengono sincronizzati con Supabase
 *
 * Strategia:
 * 1. All'avvio, carica da Supabase e merge con localStorage (latest_wins)
 * 2. Ogni save scrive sia in localStorage che in Supabase
 * 3. Gestisce stato offline con retry automatico
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import {
  safeStorage,
  STORAGE_KEYS,
  TABLE_MAPPINGS,
  mergeData,
  getSyncStatus,
  updateSyncStatus,
  clearPendingSync,
  type SyncConfig
} from '@trainsmart/shared';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: string[];
  errors: string[];
}

/**
 * Hook per sincronizzare un singolo tipo di dato
 */
export function useDataSync() {
  const { user, isAuthenticated } = useAuth();
  const syncInProgress = useRef(false);

  /**
   * Sincronizza un singolo key da localStorage a Supabase
   */
  const syncToSupabase = useCallback(async (key: string, data: any): Promise<boolean> => {
    if (!user?.id || !isAuthenticated) {
      console.log('[SYNC] Skipping sync - user not authenticated');
      return false;
    }

    const config = TABLE_MAPPINGS[key];
    if (!config) {
      console.warn(`[SYNC] No table mapping for key: ${key}`);
      return false;
    }

    try {
      console.log(`[SYNC] Syncing ${key} to ${config.supabaseTable}...`);

      // Prepara i dati per Supabase
      const supabaseData = {
        [config.userIdField || 'user_id']: user.id,
        ...prepareForSupabase(key, data),
        updated_at: new Date().toISOString()
      };

      // Upsert su Supabase
      const { error } = await supabase
        .from(config.supabaseTable)
        .upsert(supabaseData, {
          onConflict: config.userIdField || 'user_id'
        });

      if (error) {
        console.error(`[SYNC] Error syncing ${key}:`, error);
        return false;
      }

      console.log(`[SYNC] ✅ ${key} synced successfully`);
      clearPendingSync(key);
      return true;
    } catch (err) {
      console.error(`[SYNC] Exception syncing ${key}:`, err);
      return false;
    }
  }, [user, isAuthenticated]);

  /**
   * Carica dati da Supabase e merge con localStorage
   */
  const loadFromSupabase = useCallback(async (key: string): Promise<any> => {
    if (!user?.id || !isAuthenticated) {
      return safeStorage.get(key);
    }

    const config = TABLE_MAPPINGS[key];
    if (!config) {
      return safeStorage.get(key);
    }

    try {
      console.log(`[SYNC] Loading ${key} from ${config.supabaseTable}...`);

      const { data: remoteData, error } = await supabase
        .from(config.supabaseTable)
        .select('*')
        .eq(config.userIdField || 'user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error(`[SYNC] Error loading ${key}:`, error);
        return safeStorage.get(key);
      }

      const localData = safeStorage.get(key);

      if (!remoteData) {
        console.log(`[SYNC] No remote data for ${key}, using local`);
        return localData;
      }

      if (!localData) {
        console.log(`[SYNC] No local data for ${key}, using remote`);
        safeStorage.set(key, extractLocalData(key, remoteData));
        return remoteData;
      }

      // Merge con strategia configurata
      const { merged, conflicts } = mergeData(
        localData,
        extractLocalData(key, remoteData),
        config.mergeStrategy || 'latest_wins'
      );

      if (conflicts.length > 0) {
        console.warn(`[SYNC] Conflicts in ${key}:`, conflicts);
      }

      // Salva merged in localStorage
      safeStorage.set(key, merged);
      console.log(`[SYNC] ✅ ${key} loaded and merged`);

      return merged;
    } catch (err) {
      console.error(`[SYNC] Exception loading ${key}:`, err);
      return safeStorage.get(key);
    }
  }, [user, isAuthenticated]);

  /**
   * Sincronizza tutti i pending changes
   */
  const syncAllPending = useCallback(async () => {
    if (syncInProgress.current) {
      console.log('[SYNC] Sync already in progress, skipping');
      return;
    }

    if (!user?.id || !isAuthenticated) {
      console.log('[SYNC] User not authenticated, skipping sync');
      return;
    }

    syncInProgress.current = true;
    const status = getSyncStatus();

    console.log(`[SYNC] Syncing ${status.pendingChanges.length} pending changes...`);

    for (const key of status.pendingChanges) {
      const data = safeStorage.get(key);
      if (data) {
        await syncToSupabase(key, data);
      }
    }

    updateSyncStatus({
      lastSyncAt: new Date().toISOString(),
      isOnline: navigator.onLine
    });

    syncInProgress.current = false;
  }, [user, isAuthenticated, syncToSupabase]);

  /**
   * Inizializza i dati all'avvio dell'app
   */
  const initializeData = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      return;
    }

    console.log('[SYNC] Initializing data sync...');

    // Carica e merge tutti i dati importanti
    const keysToSync = [
      STORAGE_KEYS.ONBOARDING,
      STORAGE_KEYS.SCREENING,
      STORAGE_KEYS.PROGRAM
    ];

    for (const key of keysToSync) {
      await loadFromSupabase(key);
    }

    // Sincronizza eventuali pending changes
    await syncAllPending();

    console.log('[SYNC] ✅ Data sync initialized');
  }, [user, isAuthenticated, loadFromSupabase, syncAllPending]);

  // Inizializza al mount quando l'utente è autenticato
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initializeData();
    }
  }, [isAuthenticated, user?.id, initializeData]);

  // Listener per tornare online
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SYNC] Back online, syncing pending changes...');
      updateSyncStatus({ isOnline: true });
      syncAllPending();
    };

    const handleOffline = () => {
      console.log('[SYNC] Went offline');
      updateSyncStatus({ isOnline: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllPending]);

  return {
    syncToSupabase,
    loadFromSupabase,
    syncAllPending,
    initializeData
  };
}

/**
 * Prepara i dati per Supabase (struttura specifica per tabella)
 */
function prepareForSupabase(key: string, data: any): Record<string, any> {
  switch (key) {
    case STORAGE_KEYS.ONBOARDING:
      return {
        onboarding_data: data,
        onboarding_completed: true
      };
    case STORAGE_KEYS.SCREENING:
      return {
        assessment_type: 'screening',
        assessment_data: data,
        level: data.level,
        score: data.finalScore
      };
    case STORAGE_KEYS.PROGRAM:
      return {
        program_data: data,
        is_active: true
      };
    default:
      return { data };
  }
}

/**
 * Estrae i dati rilevanti dalla risposta Supabase per localStorage
 */
function extractLocalData(key: string, supabaseData: any): any {
  switch (key) {
    case STORAGE_KEYS.ONBOARDING:
      return supabaseData.onboarding_data || supabaseData;
    case STORAGE_KEYS.SCREENING:
      return supabaseData.assessment_data || supabaseData;
    case STORAGE_KEYS.PROGRAM:
      return supabaseData.program_data || supabaseData;
    default:
      return supabaseData.data || supabaseData;
  }
}

export default useDataSync;
