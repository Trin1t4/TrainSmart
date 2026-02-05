/**
 * React Query hooks for Program data
 * Sostituisce fetch diretti con cached queries
 *
 * IMPORTANTE: Tutti i programmi vengono normalizzati via normalizeProgram()
 * per garantire una struttura dati unificata (weekly_schedule[])
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { normalizeProgram, type NormalizedProgram } from '@trainsmart/shared';

// Query Keys (centralized)
export const programKeys = {
  all: ['programs'] as const,
  byUser: (userId: string) => [...programKeys.all, 'user', userId] as const,
  current: (userId: string) => [...programKeys.all, 'current', userId] as const,
};

/**
 * Fetch current active program for user
 * Cache: 5 minutes, auto-refetch in background
 */
export function useCurrentProgram() {
  // ✅ FIX: Get userId from Supabase session instead of store (more reliable)
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  return useQuery({
    queryKey: programKeys.current(userId || ''),
    queryFn: async () => {
      // Double-check session at fetch time
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (!currentUserId) {
        console.log('[useCurrentProgram] No userId in session, skipping fetch');
        throw new Error('No user ID');
      }

      console.log('[useCurrentProgram] Fetching active program for user:', currentUserId);

      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (error) {
        console.error('[useCurrentProgram] Error fetching program:', error);
        throw error;
      }

      // No program found in Supabase - check localStorage fallback
      if (!data) {
        console.log('[useCurrentProgram] No active program in Supabase, checking localStorage...');
        try {
          const localProgram = localStorage.getItem('currentProgram');
          if (localProgram) {
            const parsed = JSON.parse(localProgram);
            console.log('[useCurrentProgram] Found program in localStorage fallback:', parsed?.name);
            const normalized = normalizeProgram(parsed) as NormalizedProgram;

            // ════════════════════════════════════════════════════════════════════
            // FIX: Sync localStorage program to Supabase per evitare perdita dati
            // Se il programma esiste solo in localStorage, salvalo anche su Supabase
            // ════════════════════════════════════════════════════════════════════
            if (currentUserId && normalized) {
              console.log('[useCurrentProgram] Syncing localStorage program to Supabase...');
              try {
                const { error: syncError } = await supabase
                  .from('training_programs')
                  .upsert({
                    user_id: currentUserId,
                    name: normalized.name || 'Programma Recuperato',
                    weekly_split: normalized.weekly_schedule || normalized.weekly_split,
                    weekly_schedule: normalized.weekly_schedule,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                    // Preserve other fields if they exist
                    ...(normalized.id ? { id: normalized.id } : {})
                  }, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                  });

                if (syncError) {
                  console.warn('[useCurrentProgram] Failed to sync to Supabase:', syncError);
                } else {
                  console.log('[useCurrentProgram] ✅ Program synced to Supabase successfully');
                }
              } catch (syncErr) {
                console.warn('[useCurrentProgram] Sync error:', syncErr);
              }
            }

            return normalized;
          }
        } catch (e) {
          console.warn('[useCurrentProgram] Failed to parse localStorage fallback:', e);
        }
        return null;
      }

      console.log('[useCurrentProgram] Program fetched (raw):', {
        id: data?.id,
        name: data?.name,
        hasWeeklySplit: !!data?.weekly_split,
        hasWeeklySchedule: !!data?.weekly_schedule,
        exercisesCount: data?.exercises?.length || 0
      });

      // NORMALIZZA IL PROGRAMMA per garantire struttura unificata
      const normalized = normalizeProgram(data) as NormalizedProgram;

      console.log('[useCurrentProgram] Program normalized:', {
        id: normalized?.id,
        weeklyScheduleDays: normalized?.weekly_schedule?.length || 0
      });

      return normalized;
    },
    enabled: !!userId, // Solo se c'è userId
    staleTime: 5 * 60 * 1000, // 5min
    cacheTime: 10 * 60 * 1000, // 10min
  });
}

/**
 * Fetch all programs for user (history)
 */
export function useUserPrograms() {
  const userId = useAppStore((state) => state.userId);

  return useQuery({
    queryKey: programKeys.byUser(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normalizza tutti i programmi
      return (data || []).map(p => normalizeProgram(p) as NormalizedProgram);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10min (more stable)
  });
}

/**
 * Create new program
 * Automatically invalidates cache dopo creazione
 */
export function useCreateProgram() {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);

  return useMutation({
    mutationFn: async (programData: any) => {
      const { data, error } = await supabase
        .from('training_programs')
        .insert({
          ...programData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida cache per refetch automatico
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

/**
 * Update program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programId, updates }: { programId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('training_programs')
        .update(updates)
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

/**
 * Prefetch current program (for route transitions)
 * Use this to preload program data before navigation
 */
export function usePrefetchCurrentProgram() {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);

  return () => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: programKeys.current(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('training_programs')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
