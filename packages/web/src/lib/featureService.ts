/**
 * FEATURE SERVICE
 * Gestisce l'accesso alle feature in base al tier e agli override
 */

import { supabase } from './supabaseClient';

// ================================================================
// TYPES
// ================================================================

export type SubscriptionTier = 'base' | 'premium' | 'elite';

export interface Feature {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  min_tier: SubscriptionTier;
  is_enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserFeature {
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  min_tier: string;
  has_access: boolean;
  access_reason: 'tier' | 'override_grant' | 'override_revoke' | 'disabled' | 'no_subscription';
}

export interface FeatureOverride {
  id: string;
  user_id: string;
  feature_id: string;
  override_type: 'grant' | 'revoke';
  expires_at: string | null;
  reason: string | null;
  granted_by: string | null;
  created_at: string;
}

export interface AdminFeature extends Feature {
  override_count: number;
}

// ================================================================
// USER FUNCTIONS
// ================================================================

/**
 * Verifica se l'utente corrente ha accesso a una feature specifica
 */
export async function checkFeatureAccess(featureKey: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('check_feature_access', {
        p_user_id: user.id,
        p_feature_key: featureKey
      });

    if (error) {
      console.error('[FeatureService] Error checking access:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[FeatureService] Exception in checkFeatureAccess:', error);
    return false;
  }
}

/**
 * Verifica accesso per un utente specifico (per uso interno/admin)
 */
export async function checkFeatureAccessForUser(userId: string, featureKey: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_feature_access', {
        p_user_id: userId,
        p_feature_key: featureKey
      });

    if (error) {
      console.error('[FeatureService] Error checking access for user:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[FeatureService] Exception:', error);
    return false;
  }
}

/**
 * Ottiene tutte le feature con stato accesso per l'utente corrente
 */
export async function getUserFeatures(): Promise<UserFeature[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .rpc('get_user_features', { p_user_id: user.id });

    if (error) {
      console.error('[FeatureService] Error getting user features:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[FeatureService] Exception in getUserFeatures:', error);
    return [];
  }
}

/**
 * Ottiene lista feature accessibili per l'utente corrente
 */
export async function getAccessibleFeatures(): Promise<string[]> {
  const features = await getUserFeatures();
  return features.filter(f => f.has_access).map(f => f.key);
}

// ================================================================
// ADMIN FUNCTIONS
// ================================================================

/**
 * Lista tutte le feature (admin only)
 */
export async function adminListFeatures(): Promise<AdminFeature[]> {
  try {
    const { data, error } = await supabase.rpc('admin_list_features');

    if (error) {
      console.error('[FeatureService] Error listing features:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[FeatureService] Exception in adminListFeatures:', error);
    throw error;
  }
}

/**
 * Abilita/disabilita una feature globalmente (admin only)
 */
export async function adminToggleFeature(
  featureKey: string,
  enabled: boolean
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_toggle_feature', {
      p_feature_key: featureKey,
      p_enabled: enabled
    });

    if (error) {
      console.error('[FeatureService] Error toggling feature:', error);
      throw error;
    }

    // Invalida cache dopo modifica
    invalidateFeatureCache();

    return data === true;
  } catch (error) {
    console.error('[FeatureService] Exception in adminToggleFeature:', error);
    throw error;
  }
}

/**
 * Cambia il tier minimo richiesto per una feature (admin only)
 */
export async function adminSetFeatureTier(
  featureKey: string,
  minTier: SubscriptionTier
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_set_feature_tier', {
      p_feature_key: featureKey,
      p_min_tier: minTier
    });

    if (error) {
      console.error('[FeatureService] Error setting feature tier:', error);
      throw error;
    }

    invalidateFeatureCache();

    return data === true;
  } catch (error) {
    console.error('[FeatureService] Exception in adminSetFeatureTier:', error);
    throw error;
  }
}

/**
 * Crea/modifica/rimuove un override per un utente specifico (admin only)
 */
export async function adminSetFeatureOverride(
  userId: string,
  featureKey: string,
  overrideType: 'grant' | 'revoke' | null,
  expiresAt?: Date,
  reason?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_set_feature_override', {
      p_user_id: userId,
      p_feature_key: featureKey,
      p_override_type: overrideType,
      p_expires_at: expiresAt?.toISOString() || null,
      p_reason: reason || null
    });

    if (error) {
      console.error('[FeatureService] Error setting override:', error);
      throw error;
    }

    return data === true;
  } catch (error) {
    console.error('[FeatureService] Exception in adminSetFeatureOverride:', error);
    throw error;
  }
}

/**
 * Crea una nuova feature (admin only)
 */
export async function adminCreateFeature(
  key: string,
  name: string,
  description?: string,
  minTier: SubscriptionTier = 'base',
  category?: string,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('admin_create_feature', {
      p_key: key,
      p_name: name,
      p_description: description || null,
      p_min_tier: minTier,
      p_category: category || null,
      p_metadata: metadata
    });

    if (error) {
      console.error('[FeatureService] Error creating feature:', error);
      throw error;
    }

    invalidateFeatureCache();

    return data;
  } catch (error) {
    console.error('[FeatureService] Exception in adminCreateFeature:', error);
    throw error;
  }
}

/**
 * Ottiene tutti gli override per una feature (admin only)
 */
export async function adminGetFeatureOverrides(featureKey: string): Promise<FeatureOverride[]> {
  try {
    const { data: feature } = await supabase
      .from('features')
      .select('id')
      .eq('key', featureKey)
      .single();

    if (!feature) return [];

    const { data, error } = await supabase
      .from('feature_overrides')
      .select('*')
      .eq('feature_id', feature.id);

    if (error) {
      console.error('[FeatureService] Error getting overrides:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[FeatureService] Exception in adminGetFeatureOverrides:', error);
    return [];
  }
}

// ================================================================
// CACHE LAYER
// ================================================================

const featureCache = new Map<string, { value: boolean; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

/**
 * Versione cached di checkFeatureAccess
 */
export async function checkFeatureAccessCached(featureKey: string): Promise<boolean> {
  const cacheKey = featureKey;
  const cached = featureCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  const result = await checkFeatureAccess(featureKey);

  featureCache.set(cacheKey, {
    value: result,
    expires: Date.now() + CACHE_TTL
  });

  return result;
}

/**
 * Invalida la cache (da chiamare dopo upgrade tier, etc.)
 */
export function invalidateFeatureCache(): void {
  featureCache.clear();
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Mappa tier a numero per confronto
 */
export function tierToNumber(tier: string): number {
  switch (tier) {
    case 'base': return 1;
    case 'premium':
    case 'pro': return 2;
    case 'elite': return 3;
    default: return 0;
  }
}

/**
 * Verifica se un tier ha accesso a un altro tier
 */
export function tierHasAccess(userTier: string, requiredTier: string): boolean {
  return tierToNumber(userTier) >= tierToNumber(requiredTier);
}

/**
 * Ottiene colore badge per tier
 */
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'base': return 'bg-green-900/30 text-green-400 border-green-500/30';
    case 'premium':
    case 'pro': return 'bg-purple-900/30 text-purple-400 border-purple-500/30';
    case 'elite': return 'bg-amber-900/30 text-amber-400 border-amber-500/30';
    default: return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
  }
}

/**
 * Ottiene icona per categoria
 */
export function getCategoryIcon(category: string | null): string {
  switch (category) {
    case 'training': return 'dumbell';
    case 'ai': return 'bot';
    case 'analytics': return 'chart-bar';
    case 'social': return 'users';
    case 'support': return 'headphones';
    case 'beta': return 'flask';
    default: return 'settings';
  }
}
