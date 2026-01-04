/**
 * CENTRALIZED SERVICE INITIALIZATION
 *
 * Initializes all services with a single Supabase client.
 * Call this once at app startup in main.tsx or App.tsx.
 *
 * Usage:
 * ```typescript
 * import { initAllServices } from '@trainsmart/shared';
 * import { supabase } from './lib/supabaseClient';
 *
 * initAllServices(supabase);
 * ```
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Core services
import { initProgramService } from './programService';
import { initAutoRegulationService } from './autoRegulationService';
import { initAdminService } from './adminService';

// Social services
import { initStreakService } from './streakService';
import { initPersonalRecordsService } from './personalRecordsService';
import { initAchievementService } from './achievementService';
import { initFollowService } from './followService';
import { initSocialService } from './socialService';

// Workout services
import { initSkipTrackingService } from './skipTrackingService';
import { initProgressiveWorkoutService } from './progressiveWorkoutService';

// Pain/Discomfort tracking
import { initDiscomfortService } from './discomfortTrackingService';
import { initAdaptationService } from './exerciseAdaptationService';

// GDPR & Compliance
import { initGDPRService } from './gdprComplianceService';

let initialized = false;

export interface InitServicesOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Skip specific services (useful for testing) */
  skip?: Array<
    | 'program'
    | 'autoRegulation'
    | 'admin'
    | 'streak'
    | 'personalRecords'
    | 'achievement'
    | 'follow'
    | 'social'
    | 'skipTracking'
    | 'progressiveWorkout'
    | 'discomfort'
    | 'adaptation'
    | 'gdpr'
  >;
}

/**
 * Initialize all services with a Supabase client.
 * Safe to call multiple times - will only initialize once.
 */
export function initAllServices(
  client: SupabaseClient,
  options: InitServicesOptions = {}
): void {
  if (initialized) {
    if (options.verbose) {
      console.log('[InitServices] Already initialized');
    }
    return;
  }

  const skip = new Set(options.skip || []);
  const log = options.verbose ? console.log : () => {};

  try {
    // Core services
    if (!skip.has('program')) {
      initProgramService(client);
      log('[InitServices] ✓ ProgramService');
    }

    if (!skip.has('autoRegulation')) {
      initAutoRegulationService(client);
      log('[InitServices] ✓ AutoRegulationService');
    }

    if (!skip.has('admin')) {
      initAdminService(client);
      log('[InitServices] ✓ AdminService');
    }

    // Social services
    if (!skip.has('streak')) {
      initStreakService(client);
      log('[InitServices] ✓ StreakService');
    }

    if (!skip.has('personalRecords')) {
      initPersonalRecordsService(client);
      log('[InitServices] ✓ PersonalRecordsService');
    }

    if (!skip.has('achievement')) {
      initAchievementService(client);
      log('[InitServices] ✓ AchievementService');
    }

    if (!skip.has('follow')) {
      initFollowService(client);
      log('[InitServices] ✓ FollowService');
    }

    if (!skip.has('social')) {
      initSocialService(client);
      log('[InitServices] ✓ SocialService');
    }

    // Workout services
    if (!skip.has('skipTracking')) {
      initSkipTrackingService(client);
      log('[InitServices] ✓ SkipTrackingService');
    }

    if (!skip.has('progressiveWorkout')) {
      initProgressiveWorkoutService(client);
      log('[InitServices] ✓ ProgressiveWorkoutService');
    }

    // Pain/Discomfort tracking
    if (!skip.has('discomfort')) {
      initDiscomfortService(client);
      log('[InitServices] ✓ DiscomfortService');
    }

    if (!skip.has('adaptation')) {
      initAdaptationService(client);
      log('[InitServices] ✓ AdaptationService');
    }

    // GDPR & Compliance
    if (!skip.has('gdpr')) {
      initGDPRService(client);
      log('[InitServices] ✓ GDPRService');
    }

    initialized = true;
    log('[InitServices] All services initialized successfully');
  } catch (error) {
    console.error('[InitServices] Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Check if services have been initialized
 */
export function areServicesInitialized(): boolean {
  return initialized;
}

/**
 * Reset initialization state (for testing only)
 */
export function resetServicesForTesting(): void {
  initialized = false;
}
