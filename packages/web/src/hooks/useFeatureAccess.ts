/**
 * HOOKS: useFeatureAccess
 * React hooks per verificare accesso alle feature
 */

import { useState, useEffect, useCallback } from 'react';
import {
  checkFeatureAccessCached,
  invalidateFeatureCache,
  getUserFeatures,
  type UserFeature
} from '../lib/featureService';

// ================================================================
// useFeatureAccess
// Verifica accesso a una singola feature
// ================================================================

interface UseFeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFeatureAccess(featureKey: string): UseFeatureAccessResult {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccess = useCallback(async () => {
    if (!featureKey) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const access = await checkFeatureAccessCached(featureKey);
      setHasAccess(access);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check feature access'));
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [featureKey]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const refetch = useCallback(() => {
    invalidateFeatureCache();
    fetchAccess();
  }, [fetchAccess]);

  return { hasAccess, isLoading, error, refetch };
}

// ================================================================
// useMultipleFeatures
// Verifica accesso a multiple feature in una sola chiamata
// ================================================================

interface UseMultipleFeaturesResult {
  access: Record<string, boolean>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMultipleFeatures(featureKeys: string[]): UseMultipleFeaturesResult {
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccess = useCallback(async () => {
    if (!featureKeys.length) {
      setAccess({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await Promise.all(
        featureKeys.map(async (key) => ({
          key,
          access: await checkFeatureAccessCached(key)
        }))
      );

      const accessMap: Record<string, boolean> = {};
      results.forEach(({ key, access }) => {
        accessMap[key] = access;
      });

      setAccess(accessMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check features'));
      setAccess({});
    } finally {
      setIsLoading(false);
    }
  }, [featureKeys.join(',')]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const refetch = useCallback(() => {
    invalidateFeatureCache();
    fetchAccess();
  }, [fetchAccess]);

  return { access, isLoading, error, refetch };
}

// ================================================================
// useAllFeatures
// Ottiene tutte le feature con stato accesso per l'utente corrente
// ================================================================

interface UseAllFeaturesResult {
  features: UserFeature[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasAccess: (featureKey: string) => boolean;
}

export function useAllFeatures(): UseAllFeaturesResult {
  const [features, setFeatures] = useState<UserFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getUserFeatures();
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch features'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const hasAccess = useCallback((featureKey: string): boolean => {
    const feature = features.find(f => f.key === featureKey);
    return feature?.has_access ?? false;
  }, [features]);

  return { features, isLoading, error, refetch: fetchFeatures, hasAccess };
}

// ================================================================
// useFeaturesByCategory
// Ottiene feature raggruppate per categoria
// ================================================================

interface UseFeaturesByCategoryResult {
  categories: Record<string, UserFeature[]>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFeaturesByCategory(): UseFeaturesByCategoryResult {
  const { features, isLoading, error, refetch } = useAllFeatures();

  const categories = features.reduce((acc, feature) => {
    const cat = feature.category || 'other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(feature);
    return acc;
  }, {} as Record<string, UserFeature[]>);

  return { categories, isLoading, error, refetch };
}

export default useFeatureAccess;
