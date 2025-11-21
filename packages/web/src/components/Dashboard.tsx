import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, CheckCircle, AlertCircle, Zap, Target, RotateCcw, Trash2, History, Cloud, CloudOff, LogOut, Shield } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n';
import { validateAndNormalizePainAreas } from '../utils/validators';
import { generateProgram, generateProgramWithSplit } from '../utils/programGenerator';
import { motion } from 'framer-motion';
import WeeklySplitView from './WeeklySplitView';
import WorkoutLogger from './WorkoutLogger';
import LiveWorkoutSession from './LiveWorkoutSession';
import DeloadSuggestionModal from './DeloadSuggestionModal';
import RetestNotification from './RetestNotification';
import DeloadWeekNotification from './DeloadWeekNotification';
import { getRetestSchedule, Goal, DeloadConfig } from '../utils/retestProgression';
import {
  createProgram,
  getActiveProgram,
  getAllPrograms,
  migrateLocalStorageToSupabase,
  syncProgramsFromCloud,
  TrainingProgram
} from '../lib/programService';
import autoRegulationService, {
  ProgramAdjustment,
  getPendingAdjustments,
  rejectAdjustment,
  postponeAdjustment,
  acceptAndApplyAdjustment
} from '../lib/autoRegulationService';
import * as adminService from '../lib/adminService';
import { toast } from 'sonner';
// ✅ React Query hooks
import { useCurrentProgram, useUserPrograms, useCreateProgram, programKeys } from '../hooks/useProgram';

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

  // UI states (not related to data fetching)
  const [loading, setLoading] = useState(false);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProgramHistory, setShowProgramHistory] = useState(false);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  const [currentWorkoutDay, setCurrentWorkoutDay] = useState<any>(null);
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
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

  // Deload suggestion state
  const [showDeloadModal, setShowDeloadModal] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState<ProgramAdjustment | null>(null);

  // Retest state
  const [showRetestDismissed, setShowRetestDismissed] = useState(false);

  useEffect(() => {
    loadData();
    initializePrograms();
    checkAdminStatus();
  }, []);

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
        lastWorkout: null as string | null
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
    let lastWorkout: string | null = null;
    if (program.last_accessed_at || program.updated_at) {
      const lastDate = new Date(program.last_accessed_at || program.updated_at);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) lastWorkout = 'Oggi';
      else if (diffDays === 1) lastWorkout = 'Ieri';
      else lastWorkout = `${diffDays} giorni fa`;
    }

    const result = {
      daysActive,
      totalVolume,
      weeklyVolume,
      progression: Math.max(0, progression), // Non negativo
      lastWorkout
    };

    console.log('✅ Analytics calculated:', result);
    return result;
  }, [program, dataStatus.screening?.patternBaselines]);

  function loadData() {
    // Carica TUTTI i dati salvati
    const onboarding = localStorage.getItem('onboarding_data');
    const quiz = localStorage.getItem('quiz_data');
    const screening = localStorage.getItem('screening_data');

    if (onboarding) setDataStatus(prev => ({ ...prev, onboarding: JSON.parse(onboarding) }));
    if (quiz) setDataStatus(prev => ({ ...prev, quiz: JSON.parse(quiz) }));
    if (screening) setDataStatus(prev => ({ ...prev, screening: JSON.parse(screening) }));

    console.log('📊 DATA STATUS:', {
      hasOnboarding: !!onboarding,
      hasQuiz: !!quiz,
      hasScreening: !!screening,
      screeningLevel: screening ? JSON.parse(screening).level : null
    });
  }

  async function checkAdminStatus() {
    try {
      const { data: isUserAdmin } = await adminService.isAdmin();
      if (isUserAdmin) {
        setIsAdmin(true);
        console.log('🛡️ User is admin - showing Admin Panel button');
      }
    } catch (error) {
      console.log('ℹ️ User is not admin or error checking status');
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
      alert('✅ Reset completo! Tutti i dati sono stati eliminati.\n\nVerrai reindirizzato all\'onboarding.');

      // 4. REDIRECT
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);

    } catch (error) {
      console.error('❌ Reset error:', error);
      alert('Errore durante il reset. Alcuni dati potrebbero non essere stati eliminati.');
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

  const handleGenerateProgram = useCallback(async () => {
    try {
      setGeneratingProgram(true);

      // USA I DATI SALVATI DA SCREENING
      const { onboarding, quiz, screening } = dataStatus;

      if (!screening || !screening.level) {
        alert('⚠️ Completa prima lo screening per determinare il tuo livello!');
        navigate('/screening');
        return;
      }

      const userLevel = screening.level;

      // ✅ GOAL: Keep original Italian values for Supabase
      // Database constraint expects Italian values
      const originalGoal = onboarding?.goal || 'ipertrofia';
      const mappedGoal = originalGoal; // No mapping - use Italian directly

      console.group('🎯 PROGRAM GENERATION');
      console.log('Level from Screening:', userLevel);
      console.log('Screening Scores:', {
        final: screening.finalScore,
        quiz: quiz?.score,
        practical: screening.practicalScore,
        physical: screening.physicalScore
      });
      console.log('Goal:', originalGoal, '→', mappedGoal);
      console.groupEnd();

      // Genera localmente
      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, onboarding);

      console.log('📦 Generated program structure:', {
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

      // NEW: Salva su Supabase (con fallback localStorage)
      console.log('💾 Saving program to Supabase...');
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
            final: screening.finalScore,
            quiz: quiz?.score,
            practical: screening.practicalScore,
            physical: screening.physicalScore
          }
        }
      });

      if (saveResult.success) {
        console.log('✅ Program saved to Supabase:', saveResult.data?.id);

        // ✅ CLEANUP: Remove stale localStorage since we have fresh Supabase data
        if (!saveResult.fromCache) {
          console.log('🧹 Clearing stale localStorage cache (using Supabase as source of truth)');
          localStorage.removeItem('currentProgram');
        }

        // ✅ React Query: Invalidate and WAIT for refetch to complete
        console.log('🔄 Invalidating cache and waiting for refetch...');
        await queryClient.invalidateQueries({ queryKey: programKeys.all });

        // ✅ CRITICAL FIX: Wait for React Query to complete the refetch
        // This ensures `program` data is available before proceeding
        const refetchResult = await refetchProgram();

        console.log('✅ Refetch complete, program data:', {
          hasData: !!refetchResult.data,
          programId: refetchResult.data?.id,
          programName: refetchResult.data?.name
        });

        // ✅ VERIFICATION: Check if program is now available
        if (refetchResult.data) {
          alert(`✅ Programma ${userLevel.toUpperCase()} per ${mappedGoal.toUpperCase()} generato e salvato su cloud!`);

          // ✅ Scroll to top to show the new program (now guaranteed to be rendered)
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.error('❌ CRITICAL: Refetch succeeded but no program data returned');
          alert('⚠️ Errore: Programma salvato ma non recuperato. Ricarica la pagina.');
        }
      } else {
        console.warn('⚠️ Failed to save to Supabase, using localStorage:', saveResult.error);
        // Fallback to localStorage
        localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
        alert(`⚠️ Programma generato (salvato localmente)\n\n${saveResult.error || 'Errore sincronizzazione cloud'}`);
      }

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Errore nella generazione del programma');
    } finally {
      setGeneratingProgram(false);
    }
  }, [dataStatus, navigate, queryClient]);

  // ===== PROGRAM GENERATION (uses extracted utils) =====

  /**
   * Wrapper per generazione programma - usa utils estratti
   * Mantiene compatibilità con il codice esistente del Dashboard
   */
  function generateLocalProgram(level: string, goal: string, onboarding: any) {
    const location = onboarding?.trainingLocation || 'gym'; // ✅ FIX: Default gym invece di home
    const frequency = onboarding?.activityLevel?.weeklyFrequency || 3;
    const sessionDuration = onboarding?.activityLevel?.sessionDuration; // ✅ Get session duration
    const trainingType = onboarding?.trainingType || 'bodyweight';
    const equipment = onboarding?.equipment || {};
    const baselines = dataStatus.screening?.patternBaselines || {};
    const muscularFocus = onboarding?.muscularFocus || ''; // ✅ Get muscular focus from onboarding
    const goals = onboarding?.goals || [goal]; // ✅ Multi-goal support (fallback to single goal)

    // ⚠️ VALIDAZIONE: Avvisa se location mancante
    if (!onboarding?.trainingLocation) {
      console.warn('⚠️ trainingLocation missing in onboarding, defaulting to gym');
    }

    // Valida pain areas usando il validator estratto
    const rawPainAreas = onboarding?.painAreas || [];
    const painAreas = validateAndNormalizePainAreas(rawPainAreas);

    // Log session duration for debugging
    if (sessionDuration) {
      console.log(`⏱️ Session duration: ${sessionDuration} minutes`);
    }

    // Usa la NUOVA funzione con split intelligente + muscular focus + multi-goal
    const program = generateProgramWithSplit({
      level: level as any,
      goal: goal as any,
      goals, // ✅ Multi-goal support
      location,
      trainingType: trainingType as any,
      frequency,
      baselines,
      painAreas,
      equipment,
      muscularFocus, // ✅ Pass muscular focus to generator
      sessionDuration // ✅ Pass session duration for time adaptation
    });

    // Aggiungi campi richiesti dal formato esistente
    return {
      ...program,
      location,
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
      const updatedOnboarding = {
        ...dataStatus.onboarding,
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
      const updatedScreening = {
        ...dataStatus.screening,
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

      const userLevel = screening.level;

      // ✅ GOAL: Keep original Italian values for Supabase
      const originalGoal = onboarding?.goal || 'ipertrofia';
      const mappedGoal = originalGoal; // No mapping - use Italian directly

      console.log('🎯 Generating program with:', { level: userLevel, goal: mappedGoal, location: newLocation });

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
        console.groupEnd();
      } else {
        console.warn('⚠️ Failed to save:', saveResult.error);
        localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
        alert(`⚠️ Programma generato (salvato localmente)\n\n${saveResult.error || 'Errore sincronizzazione cloud'}`);
        setShowLocationSwitch(false);
        console.groupEnd();
      }

    } catch (error) {
      console.error('❌ Error switching location:', error);
      alert('Errore durante il cambio di location');
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

        alert(`✅ ${adjustmentLabel} applicato con successo!\n\nIl programma è stato aggiornato.`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[Dashboard] Error applying deload:', error);
      alert('Errore nell\'applicare l\'adjustment. Riprova.');
    }
  }, [queryClient]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con bottoni Reset e History + Sync Status */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
          >
            Dashboard Intelligente
          </motion.h1>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Sync Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              syncStatus === 'syncing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {syncStatus === 'synced' ? <Cloud className="w-4 h-4" /> :
               syncStatus === 'syncing' ? <Cloud className="w-4 h-4 animate-pulse" /> :
               <CloudOff className="w-4 h-4" />}
              <span className="font-medium">
                {syncStatus === 'synced' ? 'Sincronizzato' :
                 syncStatus === 'syncing' ? 'Sincronizzazione...' :
                 'Offline'}
              </span>
            </div>

            {/* Program History Button */}
            {programHistory.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProgramHistory(!showProgramHistory)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300"
              >
                <History className="w-4 h-4" />
                Storico ({programHistory.length})
              </motion.button>
            )}

            {/* Admin Panel Button (solo per admin) */}
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </motion.button>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-500/20 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </motion.button>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.onboarding ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.onboarding ? (
                    <>Goal: <span className="text-emerald-400">{dataStatus.onboarding.goal}</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.quiz ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Quiz Teorico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.quiz ? (
                    <>Score: <span className="text-emerald-400 font-mono">{dataStatus.quiz.score}%</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.screening ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Screening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.screening ? (
                    <>Level: <span className="text-emerald-400 font-bold">{dataStatus.screening.level?.toUpperCase()}</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Workouts Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-xl border-emerald-700/50 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2 text-emerald-300">
                  <Activity className="w-5 h-5" />
                  Giorni Attivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400">{analytics.daysActive}</span>
                  <span className="text-sm text-emerald-300/60">giorni</span>
                </div>
                <p className="text-xs text-emerald-300/50 mt-2">
                  {analytics.lastWorkout ? `Ultimo accesso: ${analytics.lastWorkout}` : 'Programma appena creato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-xl border-blue-700/50 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2 text-blue-300">
                  <Target className="w-5 h-5" />
                  Volume Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-400">
                    {analytics.totalVolume > 0 ? analytics.totalVolume.toLocaleString() : '0'}
                  </span>
                  <span className="text-sm text-blue-300/60">reps</span>
                </div>
                <p className="text-xs text-blue-300/50 mt-2">
                  Settimanale: {analytics.weeklyVolume > 0 ? analytics.weeklyVolume.toLocaleString() : '0'} reps/week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl border-purple-700/50 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2 text-purple-300">
                  <Zap className="w-5 h-5" />
                  Progressione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-purple-400">
                    {analytics.progression > 0 ? `+${analytics.progression}%` : '0%'}
                  </span>
                  <span className="text-sm text-purple-300/60">vs baseline</span>
                </div>
                <div className="mt-3 h-2 bg-purple-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, analytics.progression)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Program Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-3xl font-display font-bold">
                {hasProgram ? '✅ Il Tuo Programma' : '📋 Genera il Tuo Programma'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasProgram ? (
                <>
                  {dataStatus.screening && (
                    <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50">
                      <h3 className="font-display font-semibold text-lg mb-3">Il tuo profilo:</h3>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <span>• Livello:</span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {dataStatus.screening.level?.toUpperCase()}
                          </span>
                        </li>
                        <li>• Goal: <span className="text-emerald-400 font-semibold">{dataStatus.onboarding?.goal}</span></li>
                        <li>• Location: <span className="text-slate-200 font-semibold">{dataStatus.onboarding?.trainingLocation}</span></li>
                        <li>• Score finale: <span className="text-emerald-400 font-mono font-bold">{dataStatus.screening.finalScore}%</span></li>
                      </ul>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateProgram}
                    disabled={generatingProgram || !dataStatus.screening}
                    className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:shadow-none"
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
                        Genera Programma Personalizzato
                      </>
                    )}
                  </motion.button>

                  {!dataStatus.screening && (
                    <p className="text-center text-slate-400 text-sm">
                      Completa prima lo screening per generare il programma
                    </p>
                  )}
                </>
            ) : (
              <>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50">
                  <div className="mb-4">
                    <h3 className="text-2xl font-display font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {program.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        📊 Level: {program.level?.toUpperCase()}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        🎯 Goal: {program.goal}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-slate-600/50 text-slate-300 border border-slate-500/30 font-medium">
                        📍 {program.location}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="text-slate-300">Split: <span className="font-display font-semibold text-white">{program.split}</span></p>
                    <p className="text-slate-300">Frequenza: <span className="font-display font-semibold text-white">{program.frequency}x/settimana</span></p>
                  </div>

                  {/* NUOVO: Visualizza split settimanale se disponibile */}
                  {program.weekly_split?.days?.length > 0 ? (
                    <div>
                      <h4 className="font-display font-semibold text-lg mb-4">Programma Settimanale:</h4>
                      <WeeklySplitView weeklySplit={program.weekly_split} showDetails={true} />
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

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Get first day or full program exercises
                      const firstDay = program.weekly_split?.days?.[0];
                      if (firstDay) {
                        setCurrentWorkoutDay(firstDay);
                      }
                      setShowLiveWorkout(true);
                    }}
                    className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Activity className="w-5 h-5" />
                    {t('dashboard.start_workout')} LIVE
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSwitchStep('choose');
                      setSelectedLocation(null);
                      setShowLocationSwitch(true);
                    }}
                    className="px-6 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl border border-purple-500/50 transition-all duration-300 flex items-center gap-2"
                  >
                    🏋️
                    Cambia Location
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (confirm('Vuoi rigenerare il programma?')) {
                        localStorage.removeItem('currentProgram');

                        // ✅ React Query: Clear program cache (will show "no program" state)
                        queryClient.setQueryData(programKeys.current(program?.user_id || ''), null);
                        await queryClient.invalidateQueries({ queryKey: programKeys.all });
                      }
                    }}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl border border-slate-600/50 transition-all duration-300"
                  >
                    Rigenera
                  </motion.button>
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
            <h2 className="text-3xl font-display font-bold mb-6 text-white">🔄 Opzioni Reset</h2>
            
            <div className="space-y-4">
              {/* Reset Profondo */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Reset Profondo
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Elimina TUTTO: localStorage, Supabase, programmi, assessments. Ricomincia da zero.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeepReset}
                  disabled={resetting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300"
                >
                  {resetting ? 'Reset in corso...' : 'Esegui Reset Profondo'}
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
                    Principiante
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('intermediate')}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Intermedio
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('advanced')}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Avanzato
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
                              const result = await import('../lib/programService').then(m => m.setActiveProgram(prog.id!));
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
                  onClick={() => setShowLocationSwitch(false)}
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

      {/* Live Workout Session Modal */}
      {showLiveWorkout && currentWorkoutDay && program && (
        <LiveWorkoutSession
          open={showLiveWorkout}
          onClose={() => {
            setShowLiveWorkout(false);
            setCurrentWorkoutDay(null);
          }}
          userId={dataStatus.screening?.userId || program.user_id || ''}
          programId={program.id || ''}
          dayName={currentWorkoutDay.name || 'Day 1'}
          exercises={currentWorkoutDay.exercises || []}
          onWorkoutComplete={async () => {
            console.log('✅ Workout completato, refreshing program...');

            // ✅ React Query: Invalidate to refetch updated program
            await queryClient.invalidateQueries({ queryKey: programKeys.all });

            setShowLiveWorkout(false);
            setCurrentWorkoutDay(null);

            // Check for pending deload adjustments after workout completion
            setTimeout(() => {
              checkPendingAdjustments();
            }, 1000); // Small delay to allow auto-regulation to process
          }}
        />
      )}

      {/* Workout Logger Modal (post-workout logging) */}
      {showWorkoutLogger && currentWorkoutDay && program && (
        <WorkoutLogger
          open={showWorkoutLogger}
          onClose={() => {
            setShowWorkoutLogger(false);
            setCurrentWorkoutDay(null);
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

            setShowWorkoutLogger(false);
            setCurrentWorkoutDay(null);
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
    </div>
  );
}