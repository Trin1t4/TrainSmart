/**
 * React Query hooks for Exercise data
 * Questi sono dati STATICI → cache infinita
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getExerciseDescription } from '../utils/exerciseDescriptions';

export const exerciseKeys = {
  all: ['exercises'] as const,
  description: (name: string) => [...exerciseKeys.all, 'description', name] as const,
};

/**
 * Get exercise description (cached forever)
 * Questi dati non cambiano mai → perfect for infinite cache
 */
export function useExerciseDescription(exerciseName: string) {
  return useQuery({
    queryKey: exerciseKeys.description(exerciseName),
    queryFn: () => {
      const description = getExerciseDescription(exerciseName);
      if (!description) {
        throw new Error(`Exercise "${exerciseName}" not found`);
      }
      return description;
    },
    staleTime: Infinity, // Mai stale
    cacheTime: Infinity, // Mai garbage collected
    enabled: !!exerciseName, // Solo se c'è un nome
  });
}

/**
 * Preload exercise descriptions (prefetch strategy)
 * Chiama questo quando sai che l'utente userà questi esercizi
 */
export function usePrefetchExercises(exerciseNames: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    exerciseNames.forEach((name) => {
      queryClient.prefetchQuery({
        queryKey: exerciseKeys.description(name),
        queryFn: () => getExerciseDescription(name),
        staleTime: Infinity,
      });
    });
  }, [exerciseNames, queryClient]);
}
