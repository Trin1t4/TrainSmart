/**
 * React Query hooks for User data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';

export const userKeys = {
  all: ['users'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
};

/**
 * Fetch current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 10 * 60 * 1000, // 10min (user data raramente cambia)
    cacheTime: 30 * 60 * 1000, // 30min
  });
}

/**
 * Fetch user profile from database
 */
export function useUserProfile() {
  const userId = useAppStore((state) => state.userId);

  return useQuery({
    queryKey: userKeys.byId(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!userId) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
