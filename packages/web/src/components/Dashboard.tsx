import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, CheckCircle, AlertCircle, Zap, Target, RotateCcw, Trash2, History, Cloud, CloudOff, LogOut, Shield, ClipboardList, Timer, Footprints } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n';
import { validateAndNormalizePainAreas, generateProgram, generateProgramWithSplit, inferMissingBaselines } from '@trainsmart/shared';
import { motion } from 'framer-motion';
import WeeklySplitView from './WeeklySplitView';
import WorkoutLogger from './WorkoutLogger';
import LiveWorkoutSession from './LiveWorkoutSession';
import RunningSessionView, { RunningCompletionData } from './RunningSessionView';
import { RecoveryScreening, RecoveryData } from '../pages/RecoveryScreening';
import DeloadSuggestionModal from './DeloadSuggestionModal';
import RetestNotification from './RetestNotification';
import DeloadWeekNotification from './DeloadWeekNotification';
import CycleScreeningNotification from './CycleScreeningNotification';
import PaywallModal from './PaywallModal';
import { getRetestSchedule, Goal, DeloadConfig } from '../utils/retestProgression';
import {
  createProgram,
  getActiveProgram,
  getAllPrograms,
  migrateLocalStorageToSupabase,
  syncProgramsFromCloud,
  setActiveProgram,
  type TrainingProgram,
  autoRegulationService,
  type ProgramAdjustment,
  getPendingAdjustments,
  rejectAdjustment,
  postponeAdjustment,
  acceptAndApplyAdjustment,
  isAdmin as checkIsAdminStatus,
  getAdminDashboardData
} from '@trainsmart/shared';
import { toast } from 'sonner';
// ✅ React Query hooks
import { useCurrentProgram, useUserPrograms, useCreateProgram, programKeys } from '../hooks/useProgram';
import VideoMosaicBackground from './VideoMosaicBackground';
import { useAppStore } from '../store/useAppStore';
import AddRunningModal from './AddRunningModal';
import QuickActionsGrid from './QuickActionsGrid';
import { trackDashboardClick } from '@trainsmart/shared';
import { useWorkoutFlow } from '../hooks/useWorkoutFlow';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // ✅ React Query hooks - replaces manual state management
  const { data: program, isLoading: programLoading, error: programError, refetch: refetchProgram } = useCurrentProgram();
  const { data: programHistory = [] } = useUserPrograms();

  // ✅ Derived states from React Query
  const hasProgram = !!program;
  const syncStatus: 'synced' | 'offline' | 'syncing' = programLoading ? 'syncing' : programError ? 'offline' : 'synced';

  // ✅ Beta tester overrides
  const { betaOverrides, fitnessLevelOverride } = useAppStore();

  // UI states (not related to data fetching)
  const [loading, setLoading] = useState(false);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProgramHistory, setShowProgramHistory] = useState(false);
  // Workout flow state machine (replaces individual workout-related state vars)
  const workoutFlow = useWorkoutFlow();
  const {
    showWorkoutLogger, showLiveWorkout, showRunningSession, showRecoveryScreening,
    currentWorkoutDay, recoveryData, runningDayData,
  } = workoutFlow;
  const [showLocationSwitch, setShowLocationSwitch] = useState(false);
  const [switchingLocation, setSwitchingLocation] = useState(false);
  const [switchStep, setSwitchStep] = useState<'choose' | 'equipment'>('choose');
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home' | null>(null);
  const [homeEquipment, setHomeEquipment] = useState({
    dumbbell: false,
    barbell: false,
    pullUpBar: false,
    rings: false,
    bands: false,
    kettlebell: false,
    bench: false
  });
  const [dataStatus, setDataStatus] = useState({
    onboarding: null as any,
    quiz: null as any,
    screening: null as any
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Serie incrementali state
  const [incrementalSetsEnabled, setIncrementalSetsEnabled] = useState(() => {
    return localStorage.getItem('incrementalSets_enabled') === 'true';
  });
  const [incrementalSetsMax, setIncrementalSetsMax] = useState(() => {
    return parseInt(localStorage.getItem('incrementalSets_max') || '6');
  });

  // Deload suggestion state
  const [showDeloadModal, setShowDeloadModal] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState<ProgramAdjustment | null>(null);

  // Retest state
  const [showRetestDismissed, setShowRetestDismissed] = useState(false);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);

  // User email for admin features
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Cycle screening state (post-cycle screening for weight/pain)
  const [showCycleScreening, setShowCycleScreening] = useState(false);
  const [cycleScreeningDismissed, setCycleScreeningDismissed] = useState(false);

  // Screening pending state (user chose "test later" during onboarding)
  const [screeningPending, setScreeningPending] = useState(false);

  // Add Running modal state
  const [showAddRunningModal, setShowAddRunningModal] = useState(false);

  // Completed sessions state
  const [completedSessions, setCompletedSessions] = useState<{
    total: number;
    thisWeek: number;
    lastWorkoutDate: string | null;
  } | null>(null);

  useEffect(() => {
    loadData();
    initializePrograms();
    checkAdminStatus();
    checkPaywallTrigger();
    loadUserEmail();
    loadCompletedSessions();
  }, []);

  // ✅ AUTO-GENERATE: Flag per tracciare se abbiamo già provato a generare
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false);

  // Load user email for feature gating
  async function loadUserEmail() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }

  // Load completed sessions count
  async function loadCompletedSessions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count all completed sessions
      const { count: totalCount, error: totalError } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      if (totalError) throw totalError;

      // Count sessions this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { count: weekCount, error: weekError } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('workout_date', weekStart.toISOString());

      if (weekError) throw weekError;

      // Find last workout
      const { data: lastWorkout, error: lastError } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('workout_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      setCompletedSessions({
        total: totalCount || 0,
        thisWeek: weekCount || 0,
        lastWorkoutDate: lastWorkout?.workout_date || null
      });

    } catch (error) {
      console.error('[Dashboard] Error loading sessions:', error);
      setCompletedSessions({ total: 0, thisWeek: 0, lastWorkoutDate: null });
    }
  }

  // Check if user is the developer (for reset access)
  const isDeveloper = userEmail === 'dario.tripol@gmail.com';

  // Check if user should see paywall (after 7 days)
  async function checkPaywallTrigger() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('created_at, subscription_tier')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Trial period: 6 settimane = 42 giorni
      const TRIAL_PERIOD_DAYS = 42;

      console.log('[Paywall] Days since signup:', daysSinceSignup, '/', TRIAL_PERIOD_DAYS, 'Tier:', userData.subscription_tier);

      // Show paywall after 6 WEEKS (42 days) if still on free tier
      if (daysSinceSignup >= TRIAL_PERIOD_DAYS && userData.subscription_tier === 'free') {
        console.log('[Paywall] ✅ Trial ended after 6 weeks, triggering paywall modal');
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('[Paywall] Error checking trigger:', error);
    }
  }

  // ✅ MEMOIZED: Retest schedule calculation (auto-recomputes when program changes)
  const retestSchedule = useMemo(() => {
    if (!program?.start_date || !program?.goal || !program?.level) return null;

    const schedule = getRetestSchedule(
      program.start_date,
      program.goal as Goal,
      program.level as 'beginner' | 'intermediate' | 'advanced'
    );

    console.log('[Dashboard] Retest schedule calculated:', schedule);
    return schedule;
  }, [program?.start_date, program?.goal, program?.level]);

  // Check if cycle screening should be shown (after completing a cycle)
  useEffect(() => {
    if (!retestSchedule || !dataStatus.onboarding) return;

    // Show cycle screening when we're in retest phase and haven't done screening for this cycle
    const lastScreeningCycle = dataStatus.onboarding.lastScreeningCycle || 0;
    const currentCycle = retestSchedule.currentCycle;

    // If user is in retest phase and hasn't done screening for current cycle, show it
    if (retestSchedule.phase === 'retest' && lastScreeningCycle < currentCycle && !cycleScreeningDismissed) {
      console.log('[Dashboard] Showing cycle screening for cycle:', currentCycle);
      setShowCycleScreening(true);
    }
  }, [retestSchedule, dataStatus.onboarding, cycleScreeningDismissed]);

  // ✅ SIMPLIFIED: Only handle localStorage migration (React Query handles fetching)
  async function initializePrograms() {
    try {
      console.log('🔄 Migrating localStorage to Supabase if needed...');
      await migrateLocalStorageToSupabase();
      console.log('✅ Migration complete, React Query will handle data fetching');
    } catch (error) {
      console.error('❌ Error during migration:', error);
    }
  }

  // ✅ MEMOIZED: Calculate analytics (auto-recomputes when program or screening changes)
  const analytics = useMemo(() => {
    if (!program) {
      return {
        daysActive: 0,
        totalVolume: 0,
        weeklyVolume: 0,
        progression: 0,
        lastWorkoutDays: null as number | null
      };
    }

    console.log('📊 Calculating real analytics from program...');

    // 1. CALCOLA GIORNI ATTIVI (dal programma start_date)
    let daysActive = 0;
    if (program.start_date || program.created_at) {
      const startDate = new Date(program.start_date || program.created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 2. CALCOLA VOLUME SETTIMANALE TEORICO (somma sets × reps per tutti gli esercizi)
    let weeklyVolume = 0;
    let totalSets = 0;

    // Se ha weekly_split, usa quello
    if (program.weekly_split && program.weekly_split.days) {
      program.weekly_split.days.forEach((day: any) => {
        day.exercises.forEach((ex: any) => {
          if (ex.sets && ex.reps) {
            // Converti reps (può essere "8-12" o 8)
            const repsValue = typeof ex.reps === 'string'
              ? parseInt(ex.reps.split('-')[0])
              : ex.reps;

            weeklyVolume += ex.sets * repsValue;
            totalSets += ex.sets;
          }
        });
      });
    } else if (program.exercises) {
      // Fallback: usa exercises array
      program.exercises.forEach((ex: any) => {
        if (ex.sets && ex.reps) {
          const repsValue = typeof ex.reps === 'string'
            ? parseInt(ex.reps.split('-')[0])
            : ex.reps;

          weeklyVolume += ex.sets * repsValue;
          totalSets += ex.sets;
        }
      });

      // Moltiplica per frequenza settimanale
      const frequency = program.frequency || 3;
      weeklyVolume = weeklyVolume * frequency;
    }

    // 3. CALCOLA VOLUME TOTALE (weekly × settimane attive)
    const weeksActive = Math.max(1, Math.ceil(daysActive / 7));
    const totalVolume = weeklyVolume * weeksActive;

    // 4. CALCOLA PROGRESSIONE (baseline vs target)
    let progression = 0;
    if (dataStatus.screening?.patternBaselines && program.exercises) {
      // Confronta baseline reps con target reps
      const baselines = dataStatus.screening.patternBaselines;
      let baselineTotal = 0;
      let targetTotal = 0;
      let count = 0;

      Object.values(baselines).forEach((baseline: any) => {
        if (baseline && baseline.reps) {
          baselineTotal += baseline.reps;
          count++;
        }
      });

      program.exercises.forEach((ex: any) => {
        if (ex.baseline && ex.reps) {
          const targetReps = typeof ex.reps === 'string'
            ? parseInt(ex.reps.split('-')[0])
            : ex.reps;
          targetTotal += targetReps;
        }
      });

      if (count > 0 && targetTotal > 0) {
        progression = Math.round(((targetTotal - baselineTotal) / baselineTotal) * 100);
      }
    }

    // 5. LAST WORKOUT (usa updated_at o last_accessed_at)
    let lastWorkoutDays: number | null = null;
    if (program.last_accessed_at || program.updated_at) {
      const lastDate = new Date(program.last_accessed_at || program.updated_at);
      const today = new Date();
      lastWorkoutDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const result = {
      daysActive,
      totalVolume,
      weeklyVolume,
      progression: Math.max(0, progression), // Non negativo
      lastWorkoutDays
    };

    console.log('✅ Analytics calculated:', result);
    return result;
  }, [program, dataStatus.screening?.patternBaselines]);

  async function loadData() {
    // 1. Carica da localStorage (immediato)
    const onboarding = localStorage.getItem('onboarding_data');
    const quiz = localStorage.getItem('quiz_data');
    const screening = localStorage.getItem('screening_data');
    const pendingScreening = localStorage.getItem('screening_pending');

    let onboardingData = onboarding ? JSON.parse(onboarding) : null;
    let quizData = quiz ? JSON.parse(quiz) : null;
    let screeningData = screening ? JSON.parse(screening) : null;

    // 2. Se manca qualcosa, prova da Supabase (fallback per cambio dispositivo)
    if (!onboardingData || !screeningData) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_data, screening_data, quiz_data')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profile) {
            if (!onboardingData && profile.onboarding_data) {
              onboardingData = profile.onboarding_data;
              localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
              console.log('[loadData] Synced onboarding from Supabase');
            }
            if (!screeningData && profile.screening_data) {
              screeningData = profile.screening_data;
              localStorage.setItem('screening_data', JSON.stringify(screeningData));
              console.log('[loadData] Synced screening from Supabase');
            }
            if (!quizData && profile.quiz_data) {
              quizData = profile.quiz_data;
              localStorage.setItem('quiz_data', JSON.stringify(quizData));
              console.log('[loadData] Synced quiz from Supabase');
            }
          }
        }
      } catch (err) {
        console.warn('[loadData] Failed to sync from Supabase:', err);
      }
    }

    if (onboardingData) setDataStatus(prev => ({ ...prev, onboarding: onboardingData }));
    if (quizData) setDataStatus(prev => ({ ...prev, quiz: quizData }));
    if (screeningData) setDataStatus(prev => ({ ...prev, screening: screeningData }));

    // Check if user chose "test later" during onboarding
    if (pendingScreening === 'true') {
      setScreeningPending(true);
    }

    console.log('📊 DATA STATUS:', {
      hasOnboarding: !!onboardingData,
      hasQuiz: !!quizData,
      hasScreening: !!screeningData,
      screeningPending: pendingScreening === 'true',
      screeningLevel: screeningData?.level || null
    });
  }

  async function checkAdminStatus() {
    try {
      const { data: isUserAdmin, error } = await checkIsAdminStatus();
      console.log('🔍 Admin check result:', { isUserAdmin, error });
      if (error) {
        console.error('❌ Admin check error:', error);
        return;
      }
      if (isUserAdmin) {
        setIsAdmin(true);
        console.log('🛡️ User is admin - showing Admin Panel button');
      } else {
        console.log('ℹ️ User is not admin (data returned false)');
      }
    } catch (error) {
      console.error('❌ Admin check exception:', error);
    }
  }

  async function handleDeepReset() {
    setResetting(true);
    
    try {
      console.log('🔄 STARTING DEEP RESET...');
      
      // 1. PULISCI LOCALSTORAGE
      console.log('1️⃣ Clearing localStorage...');
      const keysToRemove = [
        'onboarding_data',
        'quiz_data',
        'screening_data',
        'body_composition_data',
        'assessment_results',
        'currentProgram',
        'programGenerated',
        'generatedProgram',
        'recovery_screening_data',
        'recovery_program_data',
        'tempUserId',
        'userId',
        'loopBreaker'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`  ✅ Removed: ${key}`);
      });

      // 2. PULISCI SUPABASE
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('2️⃣ Cleaning Supabase for user:', user.id);
        
        // Cancella training programs
        const { error: programError } = await supabase
          .from('training_programs')
          .delete()
          .eq('user_id', user.id);
        
        if (programError) {
          console.error('Error deleting programs:', programError);
        } else {
          console.log('  ✅ Training programs deleted');
        }

        // Cancella assessments
        const { error: assessmentError } = await supabase
          .from('assessments')
          .delete()
          .eq('user_id', user.id);
        
        if (assessmentError) {
          console.error('Error deleting assessments:', assessmentError);
        } else {
          console.log('  ✅ Assessments deleted');
        }

        // Cancella body scans se esistono
        const { error: scanError } = await supabase
          .from('body_scans')
          .delete()
          .eq('user_id', user.id);
        
        if (!scanError) {
          console.log('  ✅ Body scans deleted');
        }

        // Cancella onboarding data
        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('user_id', user.id);
        
        if (!onboardingError) {
          console.log('  ✅ Onboarding data deleted');
        }
      } else {
        console.log('ℹ️ No authenticated user, skipping Supabase cleanup');
      }

      // 3. RESET UI STATE
      console.log('3️⃣ Resetting UI state...');
      // ✅ React Query: Invalidate all cached data
      queryClient.clear(); // Clear all React Query cache
      setDataStatus({
        onboarding: null,
        quiz: null,
        screening: null
      });

      console.log('✅ DEEP RESET COMPLETE!');
      alert(t('dashboard.reset.complete_message'));

      // 4. REDIRECT
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);

    } catch (error) {
      console.error('❌ Reset error:', error);
      alert(t('dashboard.reset.error_message'));
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  }

  // Reset solo obiettivo (mantiene assessment, screening, quiz)
  async function handleGoalReset() {
    setResetting(true);

    try {
      console.log('🎯 STARTING GOAL-ONLY RESET...');

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Cancella solo il programma attuale
        console.log('1️⃣ Deleting current program...');
        const { error: programError } = await supabase
          .from('training_programs')
          .delete()
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (programError) {
          console.error('Error deleting program:', programError);
        } else {
          console.log('  ✅ Active program deleted');
        }

        // 2. Reset solo il goal nell'onboarding data (mantieni tutto il resto)
        console.log('2️⃣ Resetting goal in onboarding...');

        // Clear localStorage program cache
        localStorage.removeItem('currentProgram');
        localStorage.removeItem('programGenerated');
        localStorage.removeItem('generatedProgram');

        // Clear React Query cache for programs
        queryClient.invalidateQueries({ queryKey: programKeys.all });
      }

      console.log('✅ GOAL RESET COMPLETE!');
      alert('Obiettivo resettato! Verrai reindirizzato per scegliere un nuovo obiettivo.');

      // Redirect to goal selection (onboarding)
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);

    } catch (error) {
      console.error('❌ Goal reset error:', error);
      alert('Errore durante il reset dell\'obiettivo');
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  }

  async function handleQuickTest(level: 'beginner' | 'intermediate' | 'advanced') {
    console.log(`🧪 QUICK TEST MODE: Setting up ${level} profile...`);
    
    // Crea dati di test per il livello scelto
    const testData = {
      beginner: {
        quizScore: 30,
        practicalScore: 25,
        physicalScore: 60
      },
      intermediate: {
        quizScore: 60,
        practicalScore: 55,
        physicalScore: 70
      },
      advanced: {
        quizScore: 90,
        practicalScore: 85,
        physicalScore: 80
      }
    };

    const scores = testData[level];
    const finalScore = (scores.quizScore * 0.5) + (scores.practicalScore * 0.3) + (scores.physicalScore * 0.2);

    // Salva dati di test
    const onboardingData = {
      personalInfo: {
        gender: 'M',
        age: 30,
        height: 175,
        weight: 75,
        bmi: 24.5
      },
      trainingLocation: 'home',
      goal: 'muscle_gain',
      activityLevel: {
        weeklyFrequency: 3,
        sessionDuration: 60
      },
      equipment: {}
    };

    const quizData = {
      score: scores.quizScore,
      level: level,
      completedAt: new Date().toISOString()
    };

    // Crea baseline mock appropriate per il livello
    const baselinesByLevel = {
      beginner: {
        lower_push: { variantId: 'air_squat', variantName: 'Air Squat', difficulty: 2, reps: 10 },
        horizontal_push: { variantId: 'incline_pushup', variantName: 'Incline Push-up', difficulty: 3, reps: 8 },
        vertical_push: { variantId: 'wall_pushup', variantName: 'Wall Push-up', difficulty: 2, reps: 12 },
        vertical_pull: { variantId: 'inverted_row', variantName: 'Inverted Row', difficulty: 4, reps: 6 },
        lower_pull: { variantId: 'glute_bridge', variantName: 'Glute Bridge', difficulty: 2, reps: 15 },
        core: { variantId: 'plank', variantName: 'Plank', difficulty: 3, reps: 30 }
      },
      intermediate: {
        lower_push: { variantId: 'pistol_assisted', variantName: 'Pistol Assistito', difficulty: 5, reps: 8 },
        horizontal_push: { variantId: 'standard_pushup', variantName: 'Push-up Standard', difficulty: 5, reps: 12 },
        vertical_push: { variantId: 'pike_pushup', variantName: 'Pike Push-up', difficulty: 6, reps: 10 },
        vertical_pull: { variantId: 'pullup', variantName: 'Pull-up', difficulty: 7, reps: 8 },
        lower_pull: { variantId: 'nordic_curl_assisted', variantName: 'Nordic Curl Assistito', difficulty: 6, reps: 6 },
        core: { variantId: 'hanging_knee_raise', variantName: 'Hanging Knee Raise', difficulty: 6, reps: 12 }
      },
      advanced: {
        lower_push: { variantId: 'pistol_squat', variantName: 'Pistol Squat', difficulty: 8, reps: 12 },
        horizontal_push: { variantId: 'archer_pushup', variantName: 'Archer Push-up', difficulty: 8, reps: 10 },
        vertical_push: { variantId: 'hspu', variantName: 'Handstand Push-up', difficulty: 9, reps: 8 },
        vertical_pull: { variantId: 'pullup_weighted', variantName: 'Pull-up Zavorrato', difficulty: 9, reps: 10 },
        lower_pull: { variantId: 'nordic_curl', variantName: 'Nordic Curl', difficulty: 9, reps: 8 },
        core: { variantId: 'dragon_flag', variantName: 'Dragon Flag', difficulty: 10, reps: 6 }
      }
    };

    const screeningData = {
      level: level,
      finalScore: finalScore.toFixed(1),
      practicalScore: scores.practicalScore.toFixed(1),
      physicalScore: scores.physicalScore.toFixed(1),
      patternBaselines: baselinesByLevel[level],
      completed: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    localStorage.setItem('quiz_data', JSON.stringify(quizData));
    localStorage.setItem('screening_data', JSON.stringify(screeningData));

    console.log(`✅ Test data created for ${level.toUpperCase()}`);
    alert(`✅ Profilo di test ${level.toUpperCase()} creato!\n\nOra puoi generare un programma.`);
    
    // Ricarica i dati
    loadData();
    setShowResetModal(false);
  }

  const handleGenerateProgram = useCallback(async (): Promise<boolean> => {
    try {
      setGeneratingProgram(true);

      // USA I DATI SALVATI DA SCREENING
      const { onboarding, quiz, screening } = dataStatus;

      // Se non c'è onboarding, non possiamo generare
      if (!onboarding) {
        alert('Completa prima l\'onboarding!');
        navigate('/onboarding');
        return false;
      }

      // Se non c'è screening, usa quiz.level come fallback, poi "beginner" come default
      const screeningLevel = screening?.level || quiz?.level || 'beginner';

      // Beta tester can override the screening level
      const userLevel = fitnessLevelOverride || screeningLevel;

      // GOAL: Keep original Italian values for Supabase
      const originalGoal = onboarding?.goal || 'ipertrofia';
      const mappedGoal = originalGoal;

      console.group('PROGRAM GENERATION');
      console.log('Level from Screening:', screening?.level || 'N/A');
      console.log('Level from Quiz:', quiz?.level || 'N/A');
      console.log('Level Override (Beta):', fitnessLevelOverride);
      console.log('Final Level:', userLevel);
      console.log('Screening Scores:', {
        final: screening?.finalScore || 'N/A',
        quiz: quiz?.score,
        practical: screening?.practicalScore || 'N/A',
        physical: screening?.physicalScore || 'N/A'
      });
      console.log('Goal:', originalGoal, '→', mappedGoal);
      console.groupEnd();

      // Genera localmente
      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, onboarding);

      console.log('Generated program structure:', {
        name: generatedProgram.name,
        split: generatedProgram.split,
        hasWeeklySplit: !!generatedProgram.weeklySplit,
        weeklySplitType: typeof generatedProgram.weeklySplit,
        weeklySplitDays: generatedProgram.weeklySplit?.days?.length || 0,
        hasExercises: !!generatedProgram.exercises,
        exercisesCount: generatedProgram.exercises?.length || 0,
        location: generatedProgram.location,
        frequency: generatedProgram.frequency
      });

      // Salva su Supabase (con fallback localStorage)
      console.log('Saving program to Supabase...');
      const saveResult = await createProgram({
        name: generatedProgram.name,
        description: `Programma ${userLevel} per ${mappedGoal}`,
        level: userLevel as 'beginner' | 'intermediate' | 'advanced',
        goal: mappedGoal,
        location: generatedProgram.location || 'home',
        training_type: onboarding?.trainingType || 'bodyweight',
        frequency: generatedProgram.frequency || 3,
        split: generatedProgram.split,
        days_per_week: generatedProgram.frequency || 3,
        weekly_split: generatedProgram.weeklySplit || { days: [] },
        exercises: generatedProgram.exercises || [],
        total_weeks: generatedProgram.totalWeeks || 8,
        start_date: new Date().toISOString(),
        is_active: true,
        status: 'active',
        pain_areas: onboarding?.painAreas || [],
        pattern_baselines: screening?.patternBaselines || {},
        available_equipment: onboarding?.equipment || {},
        metadata: {
          screeningScores: {
            final: screening?.finalScore || null,
            quiz: quiz?.score || null,
            practical: screening?.practicalScore || null,
            physical: screening?.physicalScore || null
          }
        }
      });

      if (saveResult.success) {
        console.log('Program saved to Supabase:', saveResult.data?.id);

        // CLEANUP: Remove stale localStorage since we have fresh Supabase data
        if (!saveResult.fromCache) {
          console.log('Clearing stale localStorage cache (using Supabase as source of truth)');
          localStorage.removeItem('currentProgram');
        }

        // React Query: Invalidate and WAIT for refetch to complete
        console.log('Invalidating cache and waiting for refetch...');
        await queryClient.invalidateQueries({ queryKey: programKeys.all });

        // Wait for React Query to complete the refetch
        const refetchResult = await refetchProgram();

        console.log('Refetch complete, program data:', {
          hasData: !!refetchResult.data,
          programId: refetchResult.data?.id,
          programName: refetchResult.data?.name
        });

        // VERIFICATION: Check if program is now available
        if (refetchResult.data) {
          alert(t('dashboard.generate.success_message').replace('{{level}}', userLevel.toUpperCase()).replace('{{goal}}', mappedGoal.toUpperCase()));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.error('CRITICAL: Refetch succeeded but no program data returned');
          alert(t('dashboard.error.program_not_recovered'));
        }
        return true;
      } else {
        console.warn('Failed to save to Supabase, using localStorage:', saveResult.error);
        // Fallback to localStorage
        localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
        alert(`${t('dashboard.error.saved_locally')}\n\n${saveResult.error || t('dashboard.error.cloud_sync')}`);
        return false;
      }

    } catch (error: any) {
      console.error('Error generating program:', error);
      // Show the actual error message if it's from validation
      const errorMsg = error?.message || t('dashboard.generate.error_message');
      alert(errorMsg);
      return false;
    } finally {
      setGeneratingProgram(false);
    }
  }, [dataStatus, navigate, queryClient, t, fitnessLevelOverride, refetchProgram]);

  // ===== REGENERATE PROGRAM WITH EXISTING RUNNING PREFS =====
  const handleRegenerateWithRunning = useCallback(async () => {
    if (!program || !dataStatus.screening || !dataStatus.onboarding?.runningInterest) {
      alert('Errore: dati mancanti per rigenerare il programma');
      return;
    }

    const runningInterest = dataStatus.onboarding.runningInterest;
    if (!runningInterest.enabled) {
      alert('La corsa non è abilitata nelle preferenze');
      return;
    }

    setGeneratingProgram(true);
    console.log('🏃 Regenerating program with existing running prefs:', runningInterest);

    try {
      const userLevel = fitnessLevelOverride || dataStatus.screening.level || 'beginner';
      const mappedGoal = dataStatus.onboarding.goal || 'ipertrofia';

      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, dataStatus.onboarding);

      // Salva il nuovo programma
      const saveResult = await createProgram({
        name: generatedProgram.name + ' + Corsa',
        description: `Programma ${userLevel} per ${mappedGoal} con corsa integrata`,
        level: userLevel as 'beginner' | 'intermediate' | 'advanced',
        goal: mappedGoal,
        location: dataStatus.onboarding.trainingLocation || 'gym',
        training_type: dataStatus.onboarding.trainingType || 'bodyweight',
        frequency: generatedProgram.frequency || 3,
        split: generatedProgram.split,
        days_per_week: generatedProgram.frequency || 3,
        weekly_split: generatedProgram.weeklySplit || { days: [] },
        exercises: generatedProgram.exercises || [],
        total_weeks: generatedProgram.totalWeeks || 8,
        start_date: new Date().toISOString(),
        is_active: true,
        status: 'active',
        pain_areas: dataStatus.onboarding.painAreas || [],
        pattern_baselines: dataStatus.screening.patternBaselines || {},
        available_equipment: dataStatus.onboarding.equipment || {},
        metadata: {
          screeningScores: {
            final: dataStatus.screening.finalScore,
            quiz: dataStatus.quiz?.score,
            practical: dataStatus.screening.practicalScore,
            physical: dataStatus.screening.physicalScore
          },
          runningRegenerated: true,
          runningPrefs: runningInterest
        }
      });

      if (saveResult.success) {
        console.log('✅ Program regenerated with running:', saveResult.data?.id);
        localStorage.removeItem('currentProgram');
        await queryClient.invalidateQueries({ queryKey: programKeys.all });
        await refetchProgram();
        alert('✅ Programma rigenerato con la corsa!\n\nLe sessioni di running sono ora integrate nel tuo programma.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Failed to save:', saveResult.error);
        alert('Errore nel salvataggio. Riprova.');
      }
    } catch (error) {
      console.error('Error regenerating with running:', error);
      alert('Errore durante la rigenerazione del programma.');
    } finally {
      setGeneratingProgram(false);
    }
  }, [program, dataStatus, fitnessLevelOverride, queryClient, refetchProgram, createProgram]);

  // AUTO-GENERATE PROGRAM: Se onboarding completato ma nessun programma, genera automaticamente
  useEffect(() => {
    // Condizioni per auto-generare:
    // 1. Onboarding completato (dataStatus.onboarding presente)
    // 2. Nessun programma esistente
    // 3. Non in fase di caricamento
    // 4. Non abbiamo già provato a generare
    // 5. Non stiamo già generando
    if (
      dataStatus.onboarding &&
      !program &&
      !programLoading &&
      !autoGenerateTriggered &&
      !generatingProgram
    ) {
      console.log('Auto-generating program after onboarding...');
      setAutoGenerateTriggered(true);
      handleGenerateProgram().then((success) => {
        if (!success) {
          // Reset flag to allow retry on next render cycle
          console.warn('Auto-generate failed, allowing retry...');
          setAutoGenerateTriggered(false);
        }
      });
    }
  }, [dataStatus.onboarding, program, programLoading, autoGenerateTriggered, generatingProgram, handleGenerateProgram]);

  // ===== AUTO-REGENERATE: Quando quiz o massimali vengono aggiornati =====
  useEffect(() => {
    const shouldRegenerate = localStorage.getItem('regenerate_program');

    if (shouldRegenerate && program && !programLoading && !generatingProgram && dataStatus.onboarding) {
      console.log('🔄 [AUTO-REGEN] Quiz/Massimali updated, regenerating program...');
      localStorage.removeItem('regenerate_program');

      handleGenerateProgram().then((success) => {
        if (success) {
          console.log('✅ [AUTO-REGEN] Program regenerated with new data');
        } else {
          console.warn('⚠️ [AUTO-REGEN] Failed to regenerate program');
        }
      });
    }
  }, [program, programLoading, generatingProgram, dataStatus.onboarding, handleGenerateProgram]);

  // ===== ADD RUNNING TO EXISTING PROGRAM =====
  const handleAddRunning = useCallback(async (runningPrefs: {
    enabled: boolean;
    level: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    integration: 'post_workout' | 'separate_days';
    restingHR?: number;
    currentPace?: string;
    maxHR: number;
  }) => {
    if (!program || !dataStatus.screening) {
      alert('Errore: programma o screening non trovato');
      return;
    }

    setGeneratingProgram(true);
    console.log('🏃 Adding running to existing program with prefs:', runningPrefs);

    try {
      // Salva le preferenze running nell'onboarding
      const currentOnboarding = dataStatus.onboarding || {};
      const updatedOnboarding = {
        ...currentOnboarding,
        runningInterest: {
          enabled: true,
          level: runningPrefs.level,
          goal: runningPrefs.goal,
          integration: runningPrefs.integration,
          restingHR: runningPrefs.restingHR,
          currentPace: runningPrefs.currentPace,
          maxHR: runningPrefs.maxHR,
        }
      };

      // Salva onboarding aggiornato
      localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
      setDataStatus(prev => ({ ...prev, onboarding: updatedOnboarding }));

      // Rigenera il programma con la corsa
      const userLevel = fitnessLevelOverride || dataStatus.screening.level || 'beginner';
      const mappedGoal = updatedOnboarding.goal || 'ipertrofia';

      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, updatedOnboarding);

      // Salva il nuovo programma
      const saveResult = await createProgram({
        name: generatedProgram.name + ' + Corsa',
        description: `Programma ${userLevel} per ${mappedGoal} con corsa integrata`,
        level: userLevel as 'beginner' | 'intermediate' | 'advanced',
        goal: mappedGoal,
        location: updatedOnboarding.trainingLocation || 'gym',
        training_type: updatedOnboarding.trainingType || 'bodyweight',
        frequency: generatedProgram.frequency || 3,
        split: generatedProgram.split,
        days_per_week: generatedProgram.frequency || 3,
        weekly_split: generatedProgram.weeklySplit || { days: [] },
        exercises: generatedProgram.exercises || [],
        total_weeks: generatedProgram.totalWeeks || 8,
        start_date: new Date().toISOString(),
        is_active: true,
        status: 'active',
        pain_areas: updatedOnboarding.painAreas || [],
        pattern_baselines: dataStatus.screening.patternBaselines || {},
        available_equipment: updatedOnboarding.equipment || {},
        metadata: {
          screeningScores: {
            final: dataStatus.screening.finalScore,
            quiz: dataStatus.quiz?.score,
            practical: dataStatus.screening.practicalScore,
            physical: dataStatus.screening.physicalScore
          },
          runningAdded: true,
          runningPrefs: runningPrefs
        }
      });

      if (saveResult.success) {
        console.log('✅ Program with running saved:', saveResult.data?.id);
        localStorage.removeItem('currentProgram');
        await queryClient.invalidateQueries({ queryKey: programKeys.all });
        await refetchProgram();
        setShowAddRunningModal(false);
        alert('✅ Corsa aggiunta al programma!\n\nIl tuo programma è stato rigenerato con le sessioni di corsa.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Failed to save:', saveResult.error);
        alert('Errore nel salvataggio. Riprova.');
      }
    } catch (error) {
      console.error('Error adding running:', error);
      alert('Errore durante l\'aggiunta della corsa.');
    } finally {
      setGeneratingProgram(false);
    }
  }, [program, dataStatus, fitnessLevelOverride, queryClient, refetchProgram]);

  // Check if program has running sessions
  const programHasRunning = useMemo(() => {
    if (!program?.weekly_split?.days) return false;
    return program.weekly_split.days.some((day: any) => day.runningSession);
  }, [program]);

  // Check for missing onboarding parts
  const missingOnboardingParts = useMemo(() => {
    const missing: string[] = [];
    const onboarding = dataStatus.onboarding;

    if (!onboarding) return ['onboarding']; // Complete onboarding missing

    // Debug logging
    console.log('[DASHBOARD] 🏃 Checking running interest:', {
      runningInterest: onboarding.runningInterest,
      enabled: onboarding.runningInterest?.enabled,
      integration: onboarding.runningInterest?.integration,
      goal: onboarding.runningInterest?.goal,
    });

    // Check if running interest was never asked (old users) or is incomplete
    const ri = onboarding.runningInterest;
    if (ri === undefined || ri === null) {
      console.log('[DASHBOARD] ⚠️ runningInterest is undefined/null → running_interest');
      missing.push('running_interest');
    }
    // Check if enabled is explicitly undefined (user never answered)
    else if (ri.enabled === undefined) {
      console.log('[DASHBOARD] ⚠️ runningInterest.enabled is undefined → running_interest');
      missing.push('running_interest');
    }
    // Check if running is enabled but goal not set
    else if (ri.enabled === true && !ri.goal) {
      console.log('[DASHBOARD] ⚠️ enabled but no goal → running_integration');
      missing.push('running_integration');
    }
    // Check if running is enabled but integration not set
    else if (ri.enabled === true && !ri.integration) {
      console.log('[DASHBOARD] ⚠️ enabled but no integration → running_integration');
      missing.push('running_integration');
    }

    console.log('[DASHBOARD] 📋 Missing parts:', missing);
    return missing;
  }, [dataStatus.onboarding]);

  // ===== PROGRAM GENERATION (uses extracted utils) =====

  /**
   * Wrapper per generazione programma - usa utils estratti
   * Mantiene compatibilità con il codice esistente del Dashboard
   * ✅ Applica beta overrides per testing rapido
   */
  function generateLocalProgram(level: string, goal: string, onboarding: any) {
    // ✅ BETA OVERRIDES: Applica override per i beta tester
    const finalLevel = betaOverrides.fitnessLevel || level;
    const finalGoal = betaOverrides.goal || goal;
    const finalLocation = betaOverrides.location || onboarding?.trainingLocation || 'gym';
    const finalFrequency = betaOverrides.frequency || onboarding?.frequency || onboarding?.activityLevel?.weeklyFrequency || 3;
    const finalSessionDuration = betaOverrides.sessionDuration || onboarding?.activityLevel?.sessionDuration;

    const trainingType = onboarding?.trainingType || 'bodyweight';
    const equipmentPreference = onboarding?.equipmentPreference;
    const equipment = onboarding?.equipment || {};
    const userBodyweight = onboarding?.personalInfo?.weight || 75;

    // Inferisci i pattern mancanti (horizontal_pull, vertical_push, lower_pull)
    // Per onboarding rapido senza test, stima basata su peso corporeo
    let rawBaselines = dataStatus.screening?.patternBaselines || {};

    // ✅ MASSIMALI: Se l'utente ha inserito i massimali, usali per i baselines
    // Cerca la chiave maximals_* nel localStorage (il pattern è maximals_{userId})
    const maximalsKey = Object.keys(localStorage).find(k => k.startsWith('maximals_'));
    const maximalsStr = maximalsKey ? localStorage.getItem(maximalsKey) : null;

    if (maximalsStr) {
      try {
        const maximals = JSON.parse(maximalsStr);
        console.log('🏋️ [MASSIMALI] Found user maximals:', maximals);

        // Converti massimali in baselines (peso → stima reps a peso corporeo)
        // Per ora usiamo i massimali come indicatore del livello di forza
        if (maximals.squat?.weight) {
          rawBaselines = {
            ...rawBaselines,
            lower_push: {
              ...rawBaselines.lower_push,
              maxWeight: maximals.squat.weight,
              repMax: maximals.squat.repMax || 1
            }
          };
        }
        if (maximals.deadlift?.weight) {
          rawBaselines = {
            ...rawBaselines,
            lower_pull: {
              ...rawBaselines.lower_pull,
              maxWeight: maximals.deadlift.weight,
              repMax: maximals.deadlift.repMax || 1
            }
          };
        }
        if (maximals.benchPress?.weight) {
          rawBaselines = {
            ...rawBaselines,
            horizontal_push: {
              ...rawBaselines.horizontal_push,
              maxWeight: maximals.benchPress.weight,
              repMax: maximals.benchPress.repMax || 1
            }
          };
        }
        if (maximals.militaryPress?.weight) {
          rawBaselines = {
            ...rawBaselines,
            vertical_push: {
              ...rawBaselines.vertical_push,
              maxWeight: maximals.militaryPress.weight,
              repMax: maximals.militaryPress.repMax || 1
            }
          };
        }
        if (maximals.latPulldown?.weight) {
          rawBaselines = {
            ...rawBaselines,
            vertical_pull: {
              ...rawBaselines.vertical_pull,
              maxWeight: maximals.latPulldown.weight
            }
          };
        }
        if (maximals.seatedRow?.weight) {
          rawBaselines = {
            ...rawBaselines,
            horizontal_pull: {
              ...rawBaselines.horizontal_pull,
              maxWeight: maximals.seatedRow.weight
            }
          };
        }

        console.log('🏋️ [MASSIMALI] Updated baselines with maximals:', rawBaselines);
      } catch (e) {
        console.warn('[MASSIMALI] Failed to parse maximals:', e);
      }
    }

    const baselines = inferMissingBaselines(rawBaselines, userBodyweight, finalLevel as any);
    const muscularFocus = onboarding?.muscularFocus || '';
    const goals = onboarding?.goals || [finalGoal];
    const sport = onboarding?.sport || '';
    const sportRole = onboarding?.sportRole || '';
    const legsGoalType = onboarding?.legsGoalType || undefined;
    const gender = onboarding?.personalInfo?.gender || 'M';

    // ✅ RUNNING: Gestione preferenze running (priorità a RunningPreferences complete)
    let runningPrefs: any = undefined;

    // Priorità 1: RunningPreferences complete (da RunningOnboarding)
    if ((onboarding as any)?.running?.enabled) {
      runningPrefs = (onboarding as any).running;
      console.log('🏃 Using complete RunningPreferences:', runningPrefs);
    }
    // Priorità 2: Legacy runningInterest (backward compatibility)
    else if (onboarding?.runningInterest?.enabled) {
      // Mappa il livello alla capacità con formato corretto
      const levelToCapacity: Record<string, { canRun5Min: boolean; canRun10Min: boolean; canRun20Min: boolean; canRun30Min: boolean }> = {
        'sedentary': { canRun5Min: false, canRun10Min: false, canRun20Min: false, canRun30Min: false },
        'beginner': { canRun5Min: true, canRun10Min: true, canRun20Min: false, canRun30Min: false },
        'intermediate': { canRun5Min: true, canRun10Min: true, canRun20Min: true, canRun30Min: false },
        'advanced': { canRun5Min: true, canRun10Min: true, canRun20Min: true, canRun30Min: true }
      };

      // Mappa goal principale a RunningGoal
      const goalToRunningGoal: Record<string, string> = {
        'dimagrimento': 'dimagrimento_cardio',
        'resistenza': 'resistenza_generale',
        'prestazioni_sportive': 'complemento_sport',
        'sport_performance': 'complemento_sport',
        'corsa': 'base_aerobica'
      };

      runningPrefs = {
        enabled: true,
        goal: goalToRunningGoal[finalGoal] || 'base_aerobica',
        integration: 'separate_days',
        sessionsPerWeek: 2,
        capacity: levelToCapacity[onboarding.runningInterest.level || 'beginner']
      };
      console.log('🏃 Converted legacy runningInterest to runningPrefs:', runningPrefs);
    }

    // ⚠️ VALIDAZIONE: Avvisa se location mancante
    if (!onboarding?.trainingLocation && !betaOverrides.location) {
      console.warn('⚠️ trainingLocation missing in onboarding, defaulting to gym');
    }

    // ✅ BETA: Pain areas override
    const rawPainAreas = betaOverrides.painAreas || onboarding?.painAreas || [];
    const painAreas = validateAndNormalizePainAreas(rawPainAreas);

    // Log beta overrides for debugging
    if (Object.values(betaOverrides).some(v => v !== null)) {
      console.log('🧪 BETA OVERRIDES APPLIED:', {
        level: betaOverrides.fitnessLevel ? `${level} → ${finalLevel}` : level,
        goal: betaOverrides.goal ? `${goal} → ${finalGoal}` : goal,
        location: betaOverrides.location ? `→ ${finalLocation}` : finalLocation,
        frequency: betaOverrides.frequency ? `→ ${finalFrequency}` : finalFrequency,
        painAreas: betaOverrides.painAreas ? painAreas : 'original',
      });
    }

    // Log session duration for debugging
    if (finalSessionDuration) {
      console.log(`⏱️ Session duration: ${finalSessionDuration} minutes`);
    }

    // ✅ SAFETY: Recupera dati screening granulari per safety checks
    const quizScore = dataStatus.screening?.quizScore;
    const practicalScore = dataStatus.screening?.practicalScore;
    const discrepancyType = dataStatus.screening?.discrepancy as 'intuitive_mover' | 'theory_practice_gap' | null | undefined;

    // Log per debug safety
    if (discrepancyType) {
      console.log(`🔍 [SCREENING SAFETY] Discrepancy: ${discrepancyType}`);
      console.log(`   Quiz: ${quizScore}% | Practical: ${practicalScore}%`);
    }

    // Usa la NUOVA funzione con split intelligente + muscular focus + multi-goal + sport + SAFETY
    const program = generateProgramWithSplit({
      level: finalLevel as any,
      goal: finalGoal as any,
      goals,
      location: finalLocation,
      trainingType: trainingType as any,
      frequency: finalFrequency,
      baselines,
      painAreas,
      equipment,
      equipmentPreference,
      muscularFocus,
      sessionDuration: finalSessionDuration,
      sport,
      sportRole,
      legsGoalType,
      gender,
      runningPrefs,
      userAge: onboarding?.personalInfo?.age || 30,
      quizScore,
      practicalScore,
      discrepancyType,
      // Serie incrementali
      incrementSets: localStorage.getItem('incrementalSets_enabled') === 'true' ? 1 : 0,
      maxSets: parseInt(localStorage.getItem('incrementalSets_max') || '6') || 6
    });

    // ✅ FIX: Controlla se la generazione è stata bloccata dalla validazione
    if (program?.error || program?.blocked) {
      console.error('[generateLocalProgram] Generazione bloccata dalla validazione:', program.errors || program.message);
      throw new Error(program.message || 'Generazione programma bloccata dalla validazione. ' +
        (program.errors?.map((e: any) => e.message).join('; ') || ''));
    }

    // Aggiungi campi richiesti dal formato esistente
    return {
      ...program,
      location: finalLocation,
      totalWeeks: 8,
      createdAt: new Date().toISOString()
    };
  }

  // ✅ Handle location choice (step 1)
  function handleLocationChoice(location: 'gym' | 'home') {
    setSelectedLocation(location);

    if (location === 'home') {
      // Go to equipment selection step
      setSwitchStep('equipment');
      // Pre-fill with current equipment if available
      if (dataStatus.onboarding?.equipment) {
        setHomeEquipment(dataStatus.onboarding.equipment);
      }
    } else {
      // Gym has everything, proceed directly
      handleLocationSwitch(location, {});
    }
  }

  // ✅ Location Switch Function
  async function handleLocationSwitch(newLocation: 'gym' | 'home', equipment: any) {
    try {
      setSwitchingLocation(true);

      console.group('🏋️ LOCATION SWITCH');
      console.log('Current location:', dataStatus.onboarding?.trainingLocation);
      console.log('New location:', newLocation);
      console.log('Equipment:', equipment);

      // 1. Determine training type based on location and equipment
      let trainingType = 'bodyweight';
      if (newLocation === 'gym') {
        trainingType = 'equipment'; // Gym has everything
      } else if (newLocation === 'home') {
        // Home: check equipment
        if (equipment.barbell || equipment.dumbbell) {
          trainingType = 'equipment';
        } else if (equipment.pullUpBar || equipment.rings) {
          trainingType = 'bodyweight'; // Calisthenics with equipment
        } else {
          trainingType = 'bodyweight'; // Pure bodyweight
        }
      }

      // 2. Update onboarding data with new location and equipment
      // ✅ FALLBACK: Se dataStatus.onboarding è vuoto, usa i dati dal programma esistente
      let onboardingBase = dataStatus.onboarding;

      if (!onboardingBase || !onboardingBase.goal) {
        console.log('⚠️ Onboarding data missing from localStorage, using program data as fallback...');
        if (program) {
          onboardingBase = {
            goal: program.goal,
            trainingLocation: program.location || 'gym',
            trainingType: program.training_type || 'equipment',
            painAreas: program.pain_areas || [],
            equipment: program.available_equipment || {}
          };
          console.log('✅ Reconstructed onboarding from program:', onboardingBase);
        }
      }

      const updatedOnboarding = {
        ...onboardingBase,
        trainingLocation: newLocation,
        trainingType: trainingType,
        equipment: newLocation === 'gym'
          ? {
              barbell: true,
              dumbbell: true,
              machines: true,
              pullUpBar: true,
              bench: true,
              cables: true
            }
          : equipment
      };

      localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
      setDataStatus(prev => ({ ...prev, onboarding: updatedOnboarding }));

      console.log('✅ Updated onboarding data:', updatedOnboarding);

      // 2. Update screening timestamp to trigger regeneration
      // ✅ FALLBACK: Se dataStatus.screening è vuoto, usa i dati dal programma esistente
      let screeningBase = dataStatus.screening;

      if (!screeningBase || !screeningBase.level) {
        console.log('⚠️ Screening data missing from localStorage, using program data as fallback...');
        if (program) {
          screeningBase = {
            level: program.level,
            patternBaselines: program.pattern_baselines || {},
            finalScore: program.metadata?.screeningScores?.final || 50,
            practicalScore: program.metadata?.screeningScores?.practical || 50,
            physicalScore: program.metadata?.screeningScores?.physical || 50,
            userId: program.user_id
          };
          console.log('✅ Reconstructed screening from program:', screeningBase);
        }
      }

      const updatedScreening = {
        ...screeningBase,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('screening_data', JSON.stringify(updatedScreening));
      setDataStatus(prev => ({ ...prev, screening: updatedScreening }));

      // 3. Regenerate program with new location
      const { onboarding, quiz, screening } = {
        onboarding: updatedOnboarding,
        quiz: dataStatus.quiz,
        screening: updatedScreening
      };

      // Verifica che screening abbia i dati necessari
      if (!screening || !screening.level) {
        console.error('❌ Screening data missing! Cannot switch location.');
        alert('Errore: dati di screening mancanti. Completa prima lo screening.');
        setSwitchingLocation(false);
        setShowLocationSwitch(false);
        setSwitchStep('choose');
        setSelectedLocation(null);
        return;
      }

      // ✅ Beta tester can override the screening level
      const userLevel = fitnessLevelOverride || screening.level;

      // ✅ GOAL: Keep original Italian values for Supabase
      const originalGoal = onboarding?.goal || 'ipertrofia';
      const mappedGoal = originalGoal; // No mapping - use Italian directly

      console.log('🎯 Generating program with:', { level: userLevel, goal: mappedGoal, location: newLocation, override: fitnessLevelOverride });

      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, onboarding);

      // 4. Save to Supabase
      const saveResult = await createProgram({
        name: generatedProgram.name,
        description: `Programma ${userLevel} per ${mappedGoal} - ${newLocation === 'gym' ? 'Palestra' : 'Casa'}`,
        level: userLevel as 'beginner' | 'intermediate' | 'advanced',
        goal: mappedGoal,
        location: newLocation,
        training_type: updatedOnboarding.trainingType || 'bodyweight',
        frequency: generatedProgram.frequency || 3,
        split: generatedProgram.split,
        days_per_week: generatedProgram.frequency || 3,
        weekly_split: generatedProgram.weeklySplit || { days: [] },
        exercises: generatedProgram.exercises || [],
        total_weeks: generatedProgram.totalWeeks || 8,
        start_date: new Date().toISOString(),
        is_active: true,
        status: 'active',
        pain_areas: onboarding?.painAreas || [],
        pattern_baselines: screening?.patternBaselines || {},
        available_equipment: onboarding?.equipment || {},
        metadata: {
          screeningScores: {
            final: screening.finalScore,
            quiz: quiz?.score,
            practical: screening.practicalScore,
            physical: screening.physicalScore
          },
          locationSwitched: true,
          previousLocation: dataStatus.onboarding?.trainingLocation
        }
      });

      if (saveResult.success) {
        console.log('✅ New program saved:', saveResult.data?.id);

        localStorage.removeItem('currentProgram');

        // ✅ React Query: Invalidate and WAIT for refetch to complete
        console.log('🔄 Invalidating cache and waiting for refetch...');
        await queryClient.invalidateQueries({ queryKey: programKeys.all });

        // ✅ Wait for React Query to complete the refetch
        await refetchProgram();

        console.log('✅ Refetch complete, program data is now available');

        const locationLabel = newLocation === 'gym' ? 'PALESTRA' : 'CASA';
        alert(`✅ Location cambiata!\n\nNuovo programma per ${locationLabel} generato con successo!`);

        // ✅ Scroll to top to show the new program
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setShowLocationSwitch(false);
        setSwitchStep('choose');
        setSelectedLocation(null);
        console.groupEnd();
      } else {
        console.warn('⚠️ Failed to save:', saveResult.error);
        localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
        alert(`${t('dashboard.error.saved_locally')}\n\n${saveResult.error || t('dashboard.error.cloud_sync')}`);
        setShowLocationSwitch(false);
        setSwitchStep('choose');
        setSelectedLocation(null);
        console.groupEnd();
      }

    } catch (error) {
      console.error('❌ Error switching location:', error);
      alert(t('dashboard.location_switch.error_message'));
      setShowLocationSwitch(false);
      setSwitchStep('choose');
      setSelectedLocation(null);
      console.groupEnd();
    } finally {
      setSwitchingLocation(false);
    }
  }

  // ✅ Logout function
  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      localStorage.clear(); // Clean all local data
      navigate('/login');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  }, [navigate]);

  // ✅ Check for pending deload adjustments
  const checkPendingAdjustments = useCallback(async () => {
    if (!program?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adjustments } = await getPendingAdjustments(user.id, program.id);

      if (adjustments && adjustments.length > 0) {
        // Show the most recent pending adjustment
        const latestAdjustment = adjustments[0];
        setPendingAdjustment(latestAdjustment);
        setShowDeloadModal(true);
        console.log('[Dashboard] Found pending adjustment:', latestAdjustment);
      }
    } catch (error) {
      console.error('[Dashboard] Error checking pending adjustments:', error);
    }
  }, [program?.id]);

  // ✅ Handle deload acceptance
  const handleDeloadAccept = useCallback(async (modifiedAdjustment: ProgramAdjustment) => {
    try {
      const result = await acceptAndApplyAdjustment(modifiedAdjustment);

      if (result.success) {
        console.log('[Dashboard] Deload applied successfully');

        // ✅ React Query: Invalidate to refetch updated program
        await queryClient.invalidateQueries({ queryKey: programKeys.all });

        setShowDeloadModal(false);
        setPendingAdjustment(null);

        // Show success notification
        const adjustmentLabel =
          modifiedAdjustment.adjustment_type === 'deload_week' ? 'Deload' :
          modifiedAdjustment.adjustment_type === 'decrease_volume' ? 'Riduzione volume' :
          'Aumento volume';

        alert(`✅ ${adjustmentLabel} ${t('common.success').toLowerCase()}!\n\n${t('dashboard.program.your_program_title').replace('✅ ', '')}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[Dashboard] Error applying deload:', error);
      alert(t('dashboard.error.adjustment'));
    }
  }, [queryClient, t]);

  // ✅ Handle deload rejection
  async function handleDeloadReject() {
    if (!pendingAdjustment?.id) return;

    try {
      await rejectAdjustment(pendingAdjustment.id);
      setShowDeloadModal(false);
      setPendingAdjustment(null);
      console.log('[Dashboard] Deload rejected');
    } catch (error) {
      console.error('[Dashboard] Error rejecting deload:', error);
    }
  }

  // ✅ Handle deload postponement
  async function handleDeloadPostpone() {
    if (!pendingAdjustment?.id) return;

    try {
      await postponeAdjustment(pendingAdjustment.id, 7); // Postpone 7 days
      setShowDeloadModal(false);
      setPendingAdjustment(null);
      console.log('[Dashboard] Deload postponed for 7 days');
      alert('Suggerimento rimandato di 7 giorni');
    } catch (error) {
      console.error('[Dashboard] Error postponing deload:', error);
    }
  }

  // Handler per running session completion
  async function handleRunningComplete(data: RunningCompletionData) {
    console.log('[Dashboard] Running session completed:', data);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && program && runningDayData) {
        // Salva nel workout_logs
        const { error } = await supabase.from('workout_logs').insert({
          user_id: user.id,
          program_id: program.id,
          day_name: runningDayData.dayName || runningDayData.name || 'Running',
          split_type: 'running',
          session_rpe: data.rpe,
          session_duration_minutes: data.actualDuration,
          completed: data.completed,
          exercises_completed: 1,
          total_exercises: 1,
          notes: [
            data.notes,
            data.distance ? `Distanza: ${data.distance} km` : null,
            data.avgHeartRate ? `FC media: ${data.avgHeartRate} bpm` : null,
            data.feltEasy ? 'Sessione percepita facile' : null,
          ].filter(Boolean).join(' | ') || null,
        });

        if (error) {
          console.error('[Dashboard] Error saving running:', error);
          toast.error('Errore nel salvataggio');
        } else {
          toast.success('Sessione running salvata!');
          // Refresh program data
          await queryClient.invalidateQueries({ queryKey: programKeys.all });
        }
      }
    } catch (error) {
      console.error('[Dashboard] Error in handleRunningComplete:', error);
      toast.error('Errore nel salvataggio');
    }

    // Chiudi e reset
    workoutFlow.completeRunning();
  }

  function handleRunningCancel() {
    workoutFlow.cancelRunning();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Video Mosaic Background */}
      <VideoMosaicBackground videoCount={9} opacity={0.04} blur={3} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header - Responsive: stacked on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
          >
            {dataStatus.onboarding?.anagrafica?.firstName
              ? `Ciao, ${dataStatus.onboarding.anagrafica.firstName}!`
              : t('dashboard.title')}
          </motion.h1>

          {/* Action buttons - horizontal scroll on mobile */}
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Sync Status Indicator - compact on mobile */}
            <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm whitespace-nowrap ${
              syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              syncStatus === 'syncing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {syncStatus === 'synced' ? <Cloud className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
               syncStatus === 'syncing' ? <Cloud className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" /> :
               <CloudOff className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span className="font-medium hidden sm:inline">
                {syncStatus === 'synced' ? 'Sync' :
                 syncStatus === 'syncing' ? '...' :
                 'Offline'}
              </span>
            </div>

            {/* Program History Button */}
            {programHistory.length > 1 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProgramHistory(!showProgramHistory)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl flex items-center gap-1.5 md:gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 whitespace-nowrap text-sm md:text-base"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Storico</span> ({programHistory.length})
              </motion.button>
            )}

            {/* Admin Panel Button (solo per admin) */}
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl flex items-center gap-1.5 md:gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300 whitespace-nowrap text-sm md:text-base"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </motion.button>
            )}

            {/* Logout Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl flex items-center gap-1.5 md:gap-2 shadow-lg shadow-slate-500/20 transition-all duration-300 whitespace-nowrap text-sm md:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </motion.button>

            {/* Reset Button - Solo per developer */}
            {isDeveloper && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResetModal(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-1.5 md:gap-2 shadow-lg shadow-red-500/20 transition-all duration-300 whitespace-nowrap text-sm md:text-base"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            )}
          </div>
        </div>

        {/* Banner: Complete Physical Tests (shown when user chose "test later") */}
        {screeningPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 md:p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200 text-lg">Completa i test fisici</h3>
                  <p className="text-amber-200/80 text-sm mt-1">
                    Sei in palestra? Completa i test pratici per ottenere un programma personalizzato sui tuoi massimali reali.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 ml-13 md:ml-0">
                <button
                  onClick={() => {
                    // Navigate to screening based on screeningType
                    const screeningType = dataStatus.onboarding?.screeningType;
                    const onboardingData = dataStatus.onboarding;

                    // FIX: Passa userData nello state della navigazione + skipWarmup
                    // L'utente ha già fatto onboarding, va direttamente ai test
                    const navigationState = {
                      skipWarmup: true, // Salta il riscaldamento, vai direttamente ai test
                      userData: {
                        trainingLocation: onboardingData?.trainingLocation,
                        trainingType: onboardingData?.trainingType,
                        equipment: onboardingData?.equipment,
                        personalInfo: onboardingData?.personalInfo,
                        goal: onboardingData?.goal
                      }
                    };

                    console.log('[Dashboard] Starting screening with userData:', navigationState.userData);

                    if (screeningType === 'thorough') {
                      navigate('/screening-full', { state: navigationState });
                    } else {
                      navigate('/screening', { state: navigationState });
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  Fai i test ora
                </button>
                <button
                  onClick={() => {
                    setScreeningPending(false);
                    // Don't remove from localStorage - just hide the banner for this session
                  }}
                  className="text-amber-300/70 hover:text-amber-200 text-sm font-medium"
                >
                  Dopo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Banner Completa Profilo (running interest) - SPOSTATO IN ALTO */}
        {missingOnboardingParts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200">Completa il tuo profilo</h3>
                  <p className="text-amber-200/70 text-sm">
                    {missingOnboardingParts.includes('running_interest')
                      ? 'Non ci hai ancora detto se vuoi integrare la corsa nel tuo allenamento'
                      : missingOnboardingParts.includes('running_integration')
                      ? 'Scegli come integrare la corsa: insieme ai pesi o in giorni separati'
                      : 'Alcune informazioni mancano per ottimizzare il tuo programma'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Se manca l'intero onboarding, naviga a onboarding
                  if (missingOnboardingParts.includes('onboarding')) {
                    navigate('/onboarding');
                  }
                  // ⚠️ IMPORTANTE: NON MODIFICARE - Deve andare DIRETTAMENTE a /optional-quizzes
                  // Non passare per /onboarding altrimenti l'utente deve rifare tutto il flusso
                  else if (missingOnboardingParts.includes('running_interest') || missingOnboardingParts.includes('running_integration')) {
                    navigate('/optional-quizzes');
                  }
                  // Fallback: mostra modale corsa
                  else {
                    setShowAddRunningModal(true);
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
              >
                Completa Ora
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid - Griglia monitoraggio progressi */}
        <QuickActionsGrid
          painAreas={dataStatus.onboarding?.painAreas?.length || 0}
          hasPainImprovement={false}
          strengthProgress={analytics.progression}
          volumeProgress={Math.round((analytics.weeklyVolume / 100) * 10)}
          totalWorkouts={completedSessions?.total || 0}
          personalRecords={0}
          latestPR={undefined}
          onPainClick={() => { trackDashboardClick('pain_monitoring'); navigate('/stats#pain'); }}
          onProgressClick={() => { trackDashboardClick('strength_volume'); navigate('/stats#progress'); }}
          onDatabaseClick={() => { trackDashboardClick('workout_history'); navigate('/stats#history'); }}
          onRecordsClick={() => { trackDashboardClick('personal_records'); navigate('/stats#records'); }}
        />

        {/* Deload Week Notification */}
        {retestSchedule && retestSchedule.phase === 'deload' && retestSchedule.deloadConfig && !showRetestDismissed && hasProgram && (
          <DeloadWeekNotification
            daysUntilRetest={retestSchedule.daysUntilRetest}
            deloadConfig={retestSchedule.deloadConfig}
            nextRetestConfig={retestSchedule.nextConfig}
            currentCycle={retestSchedule.currentCycle}
            onDismiss={() => setShowRetestDismissed(true)}
          />
        )}

        {/* Retest Notification */}
        {retestSchedule && (retestSchedule.phase === 'retest' || retestSchedule.phase === 'training') && !showRetestDismissed && hasProgram && (
          <RetestNotification
            schedule={retestSchedule}
            goal={(program?.goal || 'ipertrofia') as Goal}
            baselines={dataStatus.screening?.patternBaselines || {}}
            onStartRetest={() => {
              // Navigate to screening with retest mode
              navigate('/screening', {
                state: {
                  retestMode: true,
                  targetRM: retestSchedule.nextConfig.targetRM,
                  cycle: retestSchedule.currentCycle + 1
                }
              });
            }}
            onDismiss={() => setShowRetestDismissed(true)}
          />
        )}

        {/* Cycle Screening Notification - Dopo ogni ciclo completo */}
        {retestSchedule && showCycleScreening && !cycleScreeningDismissed && hasProgram && (
          <CycleScreeningNotification
            currentCycle={retestSchedule.currentCycle}
            currentWeight={dataStatus.onboarding?.personalInfo?.weight || 0}
            currentLocation={dataStatus.onboarding?.trainingLocation === 'home' ? 'home' : 'gym'}
            currentGoal={dataStatus.onboarding?.goal || 'ipertrofia'}
            onComplete={async (data) => {
              console.log('Cycle screening completed:', data);
              // Update local state with new data
              if (dataStatus.onboarding) {
                const updatedOnboarding = {
                  ...dataStatus.onboarding,
                  personalInfo: {
                    ...dataStatus.onboarding.personalInfo,
                    weight: data.weight
                  },
                  painAreas: data.painAreas,
                  trainingLocation: data.location,
                  goal: data.goal
                };
                setDataStatus(prev => ({ ...prev, onboarding: updatedOnboarding }));
                localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));

                // Se location o goal sono cambiati, rigenera il programma
                if (data.locationChanged || data.goalChanged) {
                  console.log('🔄 Location or goal changed, regenerating program...');
                  console.log('  - Location changed:', data.locationChanged, '→', data.location);
                  console.log('  - Goal changed:', data.goalChanged, '→', data.goal);

                  try {
                    const screening = dataStatus.screening;
                    if (!screening) {
                      console.error('❌ No screening data available');
                      return;
                    }

                    // ✅ Beta tester can override the screening level
                    const userLevel = fitnessLevelOverride || screening.level || (screening.finalScore >= 70 ? 'intermediate' : 'beginner');
                    const newLocation = data.location;
                    const newGoal = data.goal;

                    console.log('🎯 Generating new program with:', { level: userLevel, goal: newGoal, location: newLocation, override: fitnessLevelOverride });

                    // 1. Generate new program
                    const generatedProgram = generateLocalProgram(userLevel, newGoal, {
                      ...updatedOnboarding,
                      trainingLocation: newLocation,
                      goal: newGoal
                    });

                    // 2. Save to Supabase
                    const saveResult = await createProgram({
                      name: generatedProgram.name,
                      description: `Programma ${userLevel} per ${newGoal} - ${newLocation === 'gym' ? 'Palestra' : 'Casa'} (Ciclo ${retestSchedule?.currentCycle || 1})`,
                      level: userLevel as 'beginner' | 'intermediate' | 'advanced',
                      goal: newGoal,
                      location: newLocation,
                      training_type: updatedOnboarding.trainingType || 'bodyweight',
                      frequency: generatedProgram.frequency || 3,
                      split: generatedProgram.split,
                      days_per_week: generatedProgram.frequency || 3,
                      weekly_split: generatedProgram.weeklySplit || { days: [] },
                      exercises: generatedProgram.exercises || [],
                      total_weeks: generatedProgram.totalWeeks || 8,
                      start_date: new Date().toISOString(),
                      is_active: true,
                      status: 'active',
                      pain_areas: data.painAreas || [],
                      pattern_baselines: screening?.patternBaselines || {},
                      available_equipment: updatedOnboarding?.equipment || {},
                      metadata: {
                        screeningScores: {
                          final: screening.finalScore,
                          quiz: dataStatus.quiz?.score,
                          practical: screening.practicalScore,
                          physical: screening.physicalScore
                        },
                        cycleScreening: true,
                        previousCycle: retestSchedule?.currentCycle || 1,
                        locationChanged: data.locationChanged,
                        goalChanged: data.goalChanged,
                        previousLocation: dataStatus.onboarding?.trainingLocation,
                        previousGoal: dataStatus.onboarding?.goal
                      }
                    });

                    if (saveResult.success) {
                      console.log('✅ New program saved after cycle screening:', saveResult.data?.id);

                      localStorage.removeItem('currentProgram');

                      // 3. Invalidate React Query cache and refetch
                      console.log('🔄 Invalidating cache and waiting for refetch...');
                      await queryClient.invalidateQueries({ queryKey: programKeys.all });
                      await refetchProgram();

                      console.log('✅ Refetch complete, new program is now active');

                      const locationLabel = newLocation === 'gym' ? 'PALESTRA' : 'CASA';
                      const changeMessage = data.locationChanged && data.goalChanged
                        ? `Location (${locationLabel}) e obiettivo (${newGoal}) aggiornati!`
                        : data.locationChanged
                          ? `Location cambiata: ${locationLabel}`
                          : `Obiettivo aggiornato: ${newGoal}`;

                      alert(`✅ Nuovo ciclo iniziato!\n\n${changeMessage}\n\nNuovo programma generato con successo!`);

                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      console.warn('⚠️ Failed to save new program:', saveResult.error);
                      localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
                      alert(`Programma salvato localmente.\n\n${saveResult.error || 'Errore di sincronizzazione cloud'}`);
                    }
                  } catch (error) {
                    console.error('Error regenerating program after cycle screening:', error);
                    alert('Errore durante la rigenerazione del programma. Riprova.');
                  }
                }
              }
              setShowCycleScreening(false);
              setCycleScreeningDismissed(true);
            }}
            onDismiss={() => {
              setShowCycleScreening(false);
              setCycleScreeningDismissed(true);
            }}
          />
        )}

        {/* Main Program Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-3xl font-display font-bold">
                {hasProgram ? '✅ Il Tuo Programma' : '📋 Genera il Tuo Programma'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0">
              {!hasProgram ? (
                <>
                  {dataStatus.screening && (
                    <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-600/50">
                      <h3 className="font-display font-semibold text-base md:text-lg mb-2 md:mb-3">Il tuo profilo:</h3>
                      <ul className="text-xs md:text-sm text-slate-300 space-y-1.5 md:space-y-2">
                        <li className="flex items-center gap-2">
                          <span>• Livello:</span>
                          <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {dataStatus.screening.level?.toUpperCase()}
                          </span>
                        </li>
                        <li>• Goal: <span className="text-emerald-400 font-semibold">{dataStatus.onboarding?.goal}</span></li>
                        <li>• Location: <span className="text-slate-200 font-semibold">{dataStatus.onboarding?.trainingLocation}</span></li>
                        <li>• Score: <span className="text-emerald-400 font-mono font-bold">{dataStatus.screening.finalScore}%</span></li>
                      </ul>
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateProgram}
                    disabled={generatingProgram || !dataStatus.onboarding}
                    className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:shadow-none text-sm md:text-base"
                  >
                    {generatingProgram ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        Generazione...
                      </span>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span className="hidden sm:inline">Genera Programma Personalizzato</span>
                        <span className="sm:hidden">Genera Programma</span>
                      </>
                    )}
                  </motion.button>

                  {!dataStatus.screening && (
                    <p className="text-center text-slate-400 text-xs md:text-sm">
                      Completa prima lo screening per generare il programma
                    </p>
                  )}
                </>
            ) : (
              <>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-600/50">
                  <div className="mb-3 md:mb-4">
                    <h3 className="text-lg md:text-2xl font-display font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {program.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        📊 {program.level?.toUpperCase()}
                      </span>
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        🎯 {program.goal}
                      </span>
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-slate-600/50 text-slate-300 border border-slate-500/30 font-medium">
                        📍 {program.location}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="text-slate-300">Split: <span className="font-display font-semibold text-white">{program.split}</span></p>
                    <p className="text-slate-300">Frequenza: <span className="font-display font-semibold text-white">{program.frequency}x/settimana</span></p>
                  </div>

                  {/* Banner Aggiungi Corsa - se programma non ha running MA l'utente ha già completato onboarding */}
                  {!programHasRunning && missingOnboardingParts.length === 0 && dataStatus.onboarding?.runningInterest?.enabled === false && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                            <Timer className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-green-200">Vuoi aggiungere la corsa?</h3>
                            <p className="text-green-200/70 text-sm">Migliora resistenza e recupero con sessioni di running</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddRunningModal(true)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20 whitespace-nowrap"
                        >
                          + Aggiungi Corsa
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Banner Rigenera con Corsa - utente ha abilitato corsa ma programma non la include */}
                  {!programHasRunning && missingOnboardingParts.length === 0 && dataStatus.onboarding?.runningInterest?.enabled === true && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/50 rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center flex-shrink-0">
                            <Timer className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-teal-200">Corsa non ancora integrata</h3>
                            <p className="text-teal-200/70 text-sm">
                              Hai scelto di integrare la corsa ({dataStatus.onboarding?.runningInterest?.integration === 'post_workout' ? 'dopo i pesi' : 'giorni separati'}), ma il programma attuale non la include
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRegenerateWithRunning}
                          disabled={generatingProgram}
                          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-500/20 whitespace-nowrap disabled:opacity-50"
                        >
                          {generatingProgram ? 'Rigenerando...' : 'Rigenera con Corsa'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Serie Incrementali Config */}
                  <div className="mb-4 bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm text-slate-300">Serie Incrementali</h5>
                      <button
                        onClick={() => {
                          const newVal = !incrementalSetsEnabled;
                          setIncrementalSetsEnabled(newVal);
                          localStorage.setItem('incrementalSets_enabled', String(newVal));
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          incrementalSetsEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          incrementalSetsEnabled ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    {incrementalSetsEnabled && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">+1 serie/sett</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Max:</span>
                          <input
                            type="number"
                            min={2}
                            max={12}
                            value={incrementalSetsMax || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                              setIncrementalSetsMax(val);
                              localStorage.setItem('incrementalSets_max', String(val));
                            }}
                            className="w-14 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-center text-sm"
                          />
                          <span className="text-xs text-slate-400">serie</span>
                        </div>
                      </div>
                    )}
                    {incrementalSetsEnabled && (
                      <p className="text-xs text-slate-500 mt-2">
                        W1: base, W2: +1, W3: +2... fino a max {incrementalSetsMax}. Rigenera il programma per applicare.
                      </p>
                    )}
                  </div>

                  {/* NUOVO: Visualizza split settimanale se disponibile */}
                  {program.weekly_split?.days?.length > 0 ? (
                    <div>
                      <h4 className="font-display font-semibold text-lg mb-4">Programma Settimanale:</h4>
                      <WeeklySplitView weeklySplit={program.weekly_split} showDetails={false} />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-display font-semibold text-lg mb-4">Esercizi (basati sulle tue baseline):</h4>
                      <ul className="space-y-3">
                        {program.exercises?.map((ex: any, i: number) => {
                          const isCorrective = ex.pattern === 'corrective';
                          const wasReplaced = ex.wasReplaced;

                          return (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                              className={`rounded-xl p-4 border backdrop-blur-sm transition-all duration-200 ${
                                isCorrective
                                  ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                                  : wasReplaced
                                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                                  : 'bg-slate-800/50 border-slate-600/50 hover:border-emerald-500/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`font-mono font-bold text-lg ${
                                  isCorrective ? 'text-blue-400' : wasReplaced ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  {isCorrective ? '🔧' : wasReplaced ? '⚠️' : `${i + 1}.`}
                                </span>
                                <div className="flex-1">
                                  <p className={`font-semibold text-base ${
                                    isCorrective ? 'text-blue-300' : wasReplaced ? 'text-amber-300' : 'text-white'
                                  }`}>
                                    {ex?.name || 'Unknown Exercise'}
                                    {isCorrective && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">(Correttivo)</span>}
                                    {wasReplaced && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">(Sostituito)</span>}
                                  </p>
                                  {ex.sets && ex.reps && (
                                    <p className="text-sm text-slate-400 mt-2 font-medium">
                                      <span className="font-mono text-emerald-400">{ex.sets} sets</span> × <span className="font-mono text-emerald-400">{ex.reps} reps</span>
                                      {ex.weight && <span className="text-amber-400 font-mono font-bold"> • {ex.weight}</span>}
                                      {ex.intensity && <span className="text-blue-400 font-mono"> @ {ex.intensity}</span>}
                                      {' • '}Rest: <span className="font-mono">{ex.rest}</span>
                                    </p>
                                  )}
                                  {ex.notes && (
                                    <p className="text-xs text-slate-500 mt-2 italic">{ex.notes}</p>
                                  )}
                                </div>
                              </div>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {program.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-600/50">
                      <p className="text-sm text-slate-400 italic">{program.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons - stack on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      trackDashboardClick('start_workout');
                      // Get first day or full program exercises
                      const firstDay = program.weekly_split?.days?.[0];
                      if (!firstDay) return;

                      // CHECK: Se è giorno running puro, mostra interfaccia running
                      // Usa workoutFlow state machine per gestire la transizione
                      workoutFlow.startWorkout(firstDay);
                    }}
                    className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 text-sm md:text-base"
                  >
                    <Activity className="w-5 h-5" />
                    {t('dashboard.start_workout')} LIVE
                  </motion.button>

                  {/* Pulsante Corsa */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      trackDashboardClick('running_session');
                      // Trova il primo giorno running o crea una sessione running
                      const runningDay = program.weekly_split?.days?.find((day: any) => day.type === 'running' || day.runningSession);
                      if (runningDay) {
                        workoutFlow.startRunning(runningDay);
                      } else {
                        // Se non c'è running nel programma, crea una sessione base
                        workoutFlow.startRunning({
                          dayName: 'Corsa',
                          type: 'running',
                          runningSession: {
                            type: 'easy',
                            duration: 30,
                            notes: 'Corsa libera'
                          }
                        });
                      }
                    }}
                    className="flex-1 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 text-sm md:text-base"
                  >
                    <Footprints className="w-5 h-5" />
                    Corsa
                  </motion.button>

                  <div className="flex gap-2 md:gap-4">
                    {/* Pulsante Cambio Location PERMANENTE */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSwitchStep('choose');
                        setSelectedLocation(null);
                        setShowLocationSwitch(true);
                      }}
                      className="flex-1 sm:flex-none px-3 md:px-6 bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl border border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
                    >
                      🏋️
                      <span className="hidden sm:inline">Cambia Programma</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        if (confirm('Vuoi rigenerare il programma?')) {
                          localStorage.removeItem('currentProgram');

                          // ✅ React Query: Clear program cache (will show "no program" state)
                          queryClient.setQueryData(programKeys.current(program?.user_id || ''), null);
                          await queryClient.invalidateQueries({ queryKey: programKeys.all });
                        }
                      }}
                      className="flex-1 sm:flex-none px-3 md:px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 md:py-4 rounded-xl border border-slate-600/50 transition-all duration-300 text-sm md:text-base"
                    >
                      Rigenera
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Modal Reset */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-700/50 shadow-2xl"
          >
            <h2 className="text-3xl font-display font-bold mb-6 text-white">{t('dashboard.reset.modal_title')}</h2>

            <div className="space-y-4">
              {/* Reset Solo Obiettivo - Opzione principale */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Reset Obiettivo
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Resetta solo il programma e l'obiettivo. Mantiene assessment, screening e quiz completati.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoalReset}
                  disabled={resetting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all duration-300"
                >
                  {resetting ? 'Resetting...' : 'Reset Solo Obiettivo'}
                </motion.button>
              </div>

              {/* Reset Profondo */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  {t('dashboard.reset.deep_reset')}
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  {t('dashboard.reset.deep_reset_desc')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeepReset}
                  disabled={resetting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300"
                >
                  {resetting ? t('dashboard.reset.executing') : t('dashboard.reset.execute_deep')}
                </motion.button>
              </div>

              {/* Test Veloce */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-emerald-400 mb-2">🧪 Test Veloce</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Crea un profilo di test per provare i diversi livelli:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('beginner')}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Fondamenta
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('intermediate')}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Costruzione
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('advanced')}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Padronanza
                  </motion.button>
                </div>
              </div>

              {/* Annulla */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl border border-slate-600/50 transition-all duration-300"
              >
                {t('common.cancel')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Program History */}
      {showProgramHistory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowProgramHistory(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full border border-slate-700/50 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <History className="w-8 h-8 text-blue-400" />
                Storico Programmi
              </h2>
              <button
                onClick={() => setShowProgramHistory(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {programHistory.map((prog, index) => {
                const isActive = prog.is_active;
                const createdDate = prog.created_at ? new Date(prog.created_at).toLocaleDateString('it-IT') : 'N/A';
                const startDate = prog.start_date ? new Date(prog.start_date).toLocaleDateString('it-IT') : 'N/A';

                return (
                  <motion.div
                    key={prog.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-slate-700/50 border-slate-600/50 hover:border-slate-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className={`text-xl font-display font-bold mb-2 ${isActive ? 'text-emerald-300' : 'text-white'}`}>
                          {prog.name}
                          {isActive && (
                            <span className="ml-3 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ATTIVO
                            </span>
                          )}
                        </h3>
                        {prog.description && (
                          <p className="text-sm text-slate-400 mb-3">{prog.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="text-sm">
                        <span className="text-slate-400">Livello:</span>
                        <p className="font-semibold text-white">{prog.level?.toUpperCase()}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Obiettivo:</span>
                        <p className="font-semibold text-white">{prog.goal}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Frequenza:</span>
                        <p className="font-semibold text-white">{prog.frequency}x/settimana</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Split:</span>
                        <p className="font-semibold text-white">{prog.split}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 mb-4">
                      <div>Creato: {createdDate}</div>
                      <div>Inizio: {startDate}</div>
                    </div>

                    {!isActive && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            if (confirm(`Vuoi impostare "${prog.name}" come programma attivo?`)) {
                              const result = await setActiveProgram(prog.id!);
                              if (result.success) {
                                // ✅ React Query: Invalidate to refetch all programs
                                await queryClient.invalidateQueries({ queryKey: programKeys.all });
                                alert('Programma attivato con successo!');
                              } else {
                                alert('Errore: ' + result.error);
                              }
                            }
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Attiva Programma
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Just close modal - program is already in React Query cache
                            setShowProgramHistory(false);
                          }}
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Chiudi
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {programHistory.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nessun programma salvato</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Location Switch Modal */}
      {showLocationSwitch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowLocationSwitch(false);
            setSwitchStep('choose');
            setSelectedLocation(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-slate-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {switchStep === 'choose' ? (
              // STEP 1: Choose Location
              <>
                <h2 className="text-3xl font-display font-bold mb-6 text-white flex items-center gap-3">
                  🏋️ Cambia Location di Allenamento
                </h2>

                <p className="text-slate-300 mb-6">
                  Dove ti allenerai? Il programma verrà rigenerato con esercizi adatti alla nuova location.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* GYM */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLocationChoice('gym')}
                    disabled={switchingLocation}
                    className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-8 rounded-xl flex flex-col items-center gap-4 shadow-lg shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-6xl">🏋️</span>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Palestra</h3>
                      <p className="text-sm text-emerald-200">Accesso completo a bilancieri, manubri, macchine</p>
                    </div>
                  </motion.button>

                  {/* HOME */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLocationChoice('home')}
                    disabled={switchingLocation}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-8 rounded-xl flex flex-col items-center gap-4 shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-6xl">🏠</span>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Casa</h3>
                      <p className="text-sm text-blue-200">Programma personalizzato per la tua attrezzatura</p>
                    </div>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowLocationSwitch(false);
                    setSwitchStep('choose');
                    setSelectedLocation(null);
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl border border-slate-600/50 transition-all duration-300"
                >
                  {t('common.cancel')}
                </motion.button>
              </>
            ) : (
              // STEP 2: Equipment Selection (only for home)
              <>
                <h2 className="text-3xl font-display font-bold mb-4 text-white flex items-center gap-3">
                  🏠 Attrezzatura Disponibile a Casa
                </h2>

                <p className="text-slate-300 mb-6">
                  Seleziona l'attrezzatura che hai disponibile. Il programma sarà ottimizzato di conseguenza.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Equipment checkboxes */}
                  {[
                    { key: 'dumbbell', label: 'Manubri', icon: '🏋️' },
                    { key: 'barbell', label: 'Bilanciere', icon: '⚡' },
                    { key: 'pullUpBar', label: 'Sbarra Trazioni', icon: '🔥' },
                    { key: 'rings', label: 'Anelli', icon: '⭕' },
                    { key: 'bands', label: 'Elastici', icon: '🎗️' },
                    { key: 'kettlebell', label: 'Kettlebell', icon: '🎯' },
                    { key: 'bench', label: 'Panca', icon: '🪑' }
                  ].map(({ key, label, icon }) => (
                    <motion.label
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        homeEquipment[key as keyof typeof homeEquipment]
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={homeEquipment[key as keyof typeof homeEquipment]}
                        onChange={(e) => setHomeEquipment(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-5 h-5 rounded accent-emerald-500"
                      />
                      <span className="text-2xl">{icon}</span>
                      <span className="font-semibold">{label}</span>
                    </motion.label>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Nessuna attrezzatura?</strong> Nessun problema! Genereremo un programma calisthenics a corpo libero ottimizzato per te.
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSwitchStep('choose')}
                    disabled={switchingLocation}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl border border-slate-600/50 transition-all duration-300 disabled:opacity-50"
                  >
                    ← Indietro
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLocationSwitch('home', homeEquipment)}
                    disabled={switchingLocation}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {switchingLocation ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⚡
                        </motion.div>
                        Generazione...
                      </span>
                    ) : (
                      'Genera Programma Casa'
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Running Session View */}
      {showRunningSession && runningDayData?.runningSession && (
        <RunningSessionView
          session={runningDayData.runningSession}
          dayName={runningDayData.dayName || runningDayData.name || 'Running'}
          onComplete={handleRunningComplete}
          onCancel={handleRunningCancel}
        />
      )}

      {/* Recovery Screening Modal - Pre-workout check */}
      {showRecoveryScreening && (
        <RecoveryScreening
          onComplete={(data: RecoveryData) => {
            workoutFlow.completeRecovery(data);
          }}
          onSkip={() => {
            workoutFlow.skipRecovery();
          }}
        />
      )}

      {/* Live Workout Session Modal */}
      {showLiveWorkout && currentWorkoutDay && program && (
        <LiveWorkoutSession
          open={showLiveWorkout}
          onClose={() => {
            workoutFlow.closeLiveWorkout();
          }}
          userId={dataStatus.screening?.userId || program.user_id || ''}
          programId={program.id || ''}
          dayName={currentWorkoutDay.name || 'Day 1'}
          exercises={currentWorkoutDay.exercises || []}
          recoveryData={recoveryData || undefined}
          onWorkoutComplete={async () => {
            console.log('✅ Workout completato, refreshing program...');

            // ✅ React Query: Invalidate to refetch updated program
            await queryClient.invalidateQueries({ queryKey: programKeys.all });

            // Transition: LiveWorkout → WorkoutLogger
            workoutFlow.completeLiveWorkout();

            // Check for pending deload adjustments after workout completion
            setTimeout(() => {
              checkPendingAdjustments();
            }, 1000);
          }}
        />
      )}

      {/* Workout Logger Modal (post-workout logging) */}
      {showWorkoutLogger && currentWorkoutDay && program && (
        <WorkoutLogger
          open={showWorkoutLogger}
          onClose={() => {
            workoutFlow.closeWorkoutLogger();
          }}
          userId={dataStatus.screening?.userId || ''}
          programId={program.id || ''}
          dayName={currentWorkoutDay.name || 'Day 1'}
          splitType={program.split || 'Full Body'}
          exercises={currentWorkoutDay.exercises || []}
          onWorkoutLogged={async () => {
            console.log('✅ Workout logged, refreshing program...');

            // ✅ React Query: Invalidate to refetch updated program
            await queryClient.invalidateQueries({ queryKey: programKeys.all });

            workoutFlow.logWorkout();
          }}
        />
      )}

      {/* Deload Suggestion Modal */}
      {pendingAdjustment && (
        <DeloadSuggestionModal
          open={showDeloadModal}
          onClose={() => {
            setShowDeloadModal(false);
            setPendingAdjustment(null);
          }}
          adjustment={pendingAdjustment}
          onAccept={handleDeloadAccept}
          onReject={handleDeloadReject}
          onPostpone={handleDeloadPostpone}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSelectPlan={(tier) => {
          console.log('[Paywall] Selected tier:', tier);
          // TODO: Integrate Stripe payment flow
          alert(`Piano ${tier.toUpperCase()} selezionato!\n\nIntegrazione Stripe in arrivo...`);
        }}
        userProgress={{
          workoutsCompleted: analytics.daysActive,
          baselineImprovements: dataStatus.screening?.patternBaselines
            ? Object.keys(dataStatus.screening.patternBaselines).map(p => `${p} baseline`)
            : [],
          injuriesAvoided: program?.pain_areas?.length || 0
        }}
      />

      {/* Add Running Modal - For existing users to add running to their program */}
      <AddRunningModal
        isOpen={showAddRunningModal}
        onClose={() => setShowAddRunningModal(false)}
        onConfirm={handleAddRunning}
        userAge={dataStatus.onboarding?.personalInfo?.age}
      />
    </div>
  );
}