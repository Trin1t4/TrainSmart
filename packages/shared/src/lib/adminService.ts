/**
 * ADMIN SERVICE - Analytics & User Management
 *
 * Service per dashboard admin con accesso completo ai dati analytics.
 * Richiede ruolo 'admin' o 'superadmin' per funzionare.
 *
 * NOTE: This service uses dependency injection for the Supabase client.
 * Initialize with initAdminService(supabaseClient) before use.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPES
// ================================================================

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin' | 'superadmin';
  granted_at: string;
  granted_by: string | null;
  notes: string | null;
}

export interface BusinessMetrics {
  date_id: string;
  new_registrations: number;
  onboarding_completions: number;
  screening_completions: number;
  program_creations: number;
  daily_active_users: number;
  workouts_logged: number;
  avg_session_duration_minutes: number | null;
  registration_to_onboarding_rate: number | null;
  onboarding_to_screening_rate: number | null;
  screening_to_program_rate: number | null;
  program_to_workout_rate: number | null;
  returning_users: number;
  churn_count: number;
}

export interface UserAnalytics {
  user_id: string;
  email: string;
  created_at: string;
  total_programs_created: number;
  total_workouts_logged: number;
  is_active: boolean;
  last_activity_at: string;
  cohort_month: string;
}

export interface RPETrend {
  month_start_date: string;
  user_id: string;
  avg_session_rpe: number;
  avg_exercise_rpe: number;
  total_workouts: number;
  high_rpe_sessions: number;
  low_rpe_sessions: number;
  adjustments_count: number;
}

export interface ProgramPopularity {
  level: string;
  goal: string;
  location: string;
  split: string;
  total_programs: number;
  active_programs: number;
  avg_frequency: number;
  total_users: number;
}

export interface AdminDashboardData {
  businessMetrics: BusinessMetrics[];
  totalUsers: number;
  activeUsers: number;
  totalPrograms: number;
  totalWorkouts: number;
  conversionRates: {
    registrationToOnboarding: number;
    onboardingToScreening: number;
    screeningToProgram: number;
    programToWorkout: number;
  };
  recentUsers: UserAnalytics[];
  programPopularity: ProgramPopularity[];
  rpeTrends: RPETrend[];
}

// ================================================================
// SUPABASE CLIENT (Dependency Injection)
// ================================================================

let supabase: SupabaseClient | null = null;

/**
 * Initialize the admin service with a Supabase client
 * Must be called before using any service functions
 */
export function initAdminService(client: SupabaseClient): void {
  supabase = client;
}

/**
 * Get the current Supabase client
 * Throws if not initialized
 */
function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[AdminService] Supabase client not initialized. Call initAdminService first.');
  }
  return supabase;
}

// ================================================================
// AUTH & ROLE CHECK
// ================================================================

/**
 * Verifica se l'utente corrente e admin
 */
export async function isAdmin(): Promise<{ data: boolean; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('is_admin');

    if (error) throw error;

    return { data: data || false, error: null };
  } catch (error) {
    console.error('[AdminService] Error checking admin status:', error);
    return { data: false, error };
  }
}

/**
 * Ottieni il ruolo dell'utente corrente
 */
export async function getUserRole(): Promise<{ data: string | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_user_role');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error getting user role:', error);
    return { data: null, error };
  }
}

// ================================================================
// BUSINESS METRICS
// ================================================================

/**
 * Ottieni metriche business per periodo
 */
export async function getBusinessMetrics(
  daysBack: number = 30
): Promise<{ data: BusinessMetrics[] | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_business_metrics_admin', {
      days_back: daysBack
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching business metrics:', error);
    return { data: null, error };
  }
}

/**
 * Ottieni metriche aggregate totali
 */
export async function getAggregatedMetrics(): Promise<{
  data: {
    totalUsers: number;
    activeUsers: number;
    totalPrograms: number;
    totalWorkouts: number;
  } | null;
  error: any;
}> {
  try {
    const { data, error } = await getSupabase().rpc('get_aggregated_metrics_admin');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching aggregated metrics:', error);
    return { data: null, error };
  }
}

// ================================================================
// USER ANALYTICS
// ================================================================

/**
 * Ottieni lista utenti con analytics
 */
export async function getUsersAnalytics(
  limit: number = 50
): Promise<{ data: UserAnalytics[] | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_users_analytics_admin', {
      limit_count: limit
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching users analytics:', error);
    return { data: null, error };
  }
}

// ================================================================
// RPE TRENDS
// ================================================================

/**
 * Ottieni RPE trends mensili
 */
export async function getRPETrends(
  monthsBack: number = 6
): Promise<{ data: RPETrend[] | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_rpe_trends_admin', {
      months_back: monthsBack
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching RPE trends:', error);
    return { data: null, error };
  }
}

// ================================================================
// PROGRAM POPULARITY
// ================================================================

/**
 * Ottieni programmi piu popolari
 */
export async function getProgramPopularity(): Promise<{ data: ProgramPopularity[] | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_program_popularity_admin');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching program popularity:', error);
    return { data: null, error };
  }
}

// ================================================================
// DASHBOARD DATA (All-in-One)
// ================================================================

/**
 * Ottieni tutti i dati per la dashboard admin in una chiamata
 */
export async function getAdminDashboardData(): Promise<{ data: AdminDashboardData | null; error: any }> {
  try {
    console.log('[AdminService] Fetching admin dashboard data...');

    // Fetch parallelo di tutti i dati
    const [
      businessMetricsResult,
      aggregatedMetricsResult,
      usersResult,
      programPopularityResult,
      rpeTrendsResult
    ] = await Promise.all([
      getBusinessMetrics(30),
      getAggregatedMetrics(),
      getUsersAnalytics(20),
      getProgramPopularity(),
      getRPETrends(6)
    ]);

    // Check errors
    if (businessMetricsResult.error) throw businessMetricsResult.error;
    if (aggregatedMetricsResult.error) throw aggregatedMetricsResult.error;
    if (usersResult.error) throw usersResult.error;
    if (programPopularityResult.error) throw programPopularityResult.error;
    if (rpeTrendsResult.error) throw rpeTrendsResult.error;

    // Calcola conversion rates medie
    const metrics = businessMetricsResult.data || [];
    const avgConversionRates = {
      registrationToOnboarding: calculateAverage(metrics.map(m => m.registration_to_onboarding_rate)),
      onboardingToScreening: calculateAverage(metrics.map(m => m.onboarding_to_screening_rate)),
      screeningToProgram: calculateAverage(metrics.map(m => m.screening_to_program_rate)),
      programToWorkout: calculateAverage(metrics.map(m => m.program_to_workout_rate))
    };

    const dashboardData: AdminDashboardData = {
      businessMetrics: businessMetricsResult.data || [],
      totalUsers: aggregatedMetricsResult.data?.totalUsers || 0,
      activeUsers: aggregatedMetricsResult.data?.activeUsers || 0,
      totalPrograms: aggregatedMetricsResult.data?.totalPrograms || 0,
      totalWorkouts: aggregatedMetricsResult.data?.totalWorkouts || 0,
      conversionRates: avgConversionRates,
      recentUsers: usersResult.data || [],
      programPopularity: programPopularityResult.data || [],
      rpeTrends: rpeTrendsResult.data || []
    };

    console.log('[AdminService] Dashboard data loaded:', {
      businessMetrics: dashboardData.businessMetrics.length,
      users: dashboardData.totalUsers,
      programs: dashboardData.totalPrograms,
      workouts: dashboardData.totalWorkouts
    });

    return { data: dashboardData, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching dashboard data:', error);
    return { data: null, error };
  }
}

// ================================================================
// ROLE MANAGEMENT
// ================================================================

/**
 * Concedi ruolo admin a un utente (solo superadmin)
 */
export async function grantAdminRole(
  userId: string,
  role: 'user' | 'admin' | 'superadmin',
  notes?: string
): Promise<{ data: boolean; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('grant_admin_role', {
      target_user_id: userId,
      new_role: role,
      admin_notes: notes || null
    });

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error('[AdminService] Error granting admin role:', error);
    return { data: false, error };
  }
}

/**
 * Ottieni tutti i ruoli utente
 */
export async function getAllUserRoles(): Promise<{ data: UserRole[] | null; error: any }> {
  try {
    const { data, error } = await getSupabase()
      .from('user_roles')
      .select('*')
      .order('granted_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching user roles:', error);
    return { data: null, error };
  }
}

// ================================================================
// USER INSIGHTS TYPES
// ================================================================

export interface DistributionItem {
  [key: string]: string | number;
  count: number;
}

export interface UserDemographics {
  totalUsers: number;
  genderDistribution: { gender: string; count: number }[];
  ageDistribution: { age_range: string; count: number }[];
  goalDistribution: { goal: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
  frequencyDistribution: { frequency: string; count: number }[];
}

export interface OnboardingInsights {
  totalCompleted: number;
  totalStarted: number;
  completionRate: number;
  avgTimeMinutes: number;
  timeDistribution: { time_bucket: string; count: number }[];
  recentCompletions: { completed_date: string; completions: number; avg_time: number }[];
}

export interface ClicksByTarget {
  click_target: string;
  clicks: number;
  unique_users: number;
}

export interface DashboardClicks {
  totalClicks: number;
  uniqueUsers: number;
  clicksByTarget: ClicksByTarget[];
  dailyTrend: { date: string; clicks: number; unique_users: number }[];
}

export interface UserInsightsData {
  demographics: UserDemographics;
  onboarding: OnboardingInsights;
  clicks: DashboardClicks;
}

// ================================================================
// USER INSIGHTS FUNCTIONS
// ================================================================

/**
 * Ottieni profilo demografico degli utenti
 */
export async function getUserDemographics(): Promise<{ data: UserDemographics | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_user_demographics_admin');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching user demographics:', error);
    return { data: null, error };
  }
}

/**
 * Ottieni insights sull'onboarding
 */
export async function getOnboardingInsights(): Promise<{ data: OnboardingInsights | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_onboarding_insights_admin');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching onboarding insights:', error);
    return { data: null, error };
  }
}

/**
 * Ottieni dati click dashboard
 */
export async function getDashboardClicks(daysBack: number = 30): Promise<{ data: DashboardClicks | null; error: any }> {
  try {
    const { data, error } = await getSupabase().rpc('get_dashboard_clicks_admin', {
      days_back: daysBack
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error fetching dashboard clicks:', error);
    return { data: null, error };
  }
}

/**
 * Ottieni tutti i dati user insights in una chiamata
 */
export async function getUserInsightsData(): Promise<{ data: UserInsightsData | null; error: any }> {
  try {
    const [demographicsResult, onboardingResult, clicksResult] = await Promise.all([
      getUserDemographics(),
      getOnboardingInsights(),
      getDashboardClicks(30)
    ]);

    if (demographicsResult.error) throw demographicsResult.error;
    if (onboardingResult.error) throw onboardingResult.error;
    if (clicksResult.error) throw clicksResult.error;

    return {
      data: {
        demographics: demographicsResult.data!,
        onboarding: onboardingResult.data!,
        clicks: clicksResult.data!,
      },
      error: null
    };
  } catch (error) {
    console.error('[AdminService] Error fetching user insights:', error);
    return { data: null, error };
  }
}

// ================================================================
// UTILS
// ================================================================

function calculateAverage(values: (number | null)[]): number {
  const validValues = values.filter(v => v !== null && !isNaN(v)) as number[];
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}
