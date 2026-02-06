/**
 * CLICK TRACKING SERVICE
 *
 * Traccia le azioni degli utenti nella dashboard per analytics.
 * Fire-and-forget: non blocca la UI, non mostra errori all'utente.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function initClickTrackingService(client: SupabaseClient): void {
  supabase = client;
}

/**
 * Traccia un click nella dashboard utente.
 * Fire-and-forget — non ritorna nulla e non lancia errori.
 */
export function trackDashboardClick(target: DashboardClickTarget): void {
  if (!supabase) return;

  supabase.rpc('track_dashboard_click', { target }).catch(() => {
    // Silent fail — tracking should never break the app
  });
}

/** Valid click targets for type safety */
export type DashboardClickTarget =
  | 'pain_monitoring'
  | 'strength_volume'
  | 'workout_history'
  | 'personal_records'
  | 'start_workout'
  | 'running_session'
  | 'view_program';
