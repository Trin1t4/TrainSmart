/**
 * React Query hooks for Program data
 * Sostituisce fetch diretti con cached queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

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
  const userId = useAppStore((state) => state.userId);

  return useQuery({
    queryKey: programKeys.current(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
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
        .from('programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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
        .from('programs')
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
        .from('programs')
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
          .from('programs')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
