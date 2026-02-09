import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { X, Info, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Dumbbell, Clock, PlayCircle, XCircle, PlusCircle, Footprints } from 'lucide-react';
import { RecoveryScreening } from '../pages/RecoveryScreening';
import type { RecoveryData } from '../pages/RecoveryScreening';
import RunningSessionView, { RunningCompletionData } from '../components/RunningSessionView';
import { toast } from 'sonner';
import { useTranslation } from '../lib/i18n';
import {
  getAlternativesWithParams,
  hasAlternatives,
  type ExerciseAlternative,
  type SuggestedParams,
  getInProgressWorkout,
  getWorkoutSets,
  abandonProgressiveWorkout,
  logExerciseSkip,
  patternToMuscleGroup,
  type ProgressiveWorkoutSession,
  type ProgressiveSetLog,
  // Program Normalizer Unified
  normalizeOnLoad,
  type NormalizedProgram,
} from '@trainsmart/shared';

export default function Workout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [showRecoveryScreening, setShowRecoveryScreening] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  // Exercise alternatives state
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [substitutions, setSubstitutions] = useState<Record<string, {
    name: string;
    suggestedWeight?: string;
    suggestedReps?: number;
  }>>({});

  // In-progress workout state
  const [inProgressWorkout, setInProgressWorkout] = useState<ProgressiveWorkoutSession | null>(null);
  const [inProgressSets, setInProgressSets] = useState<ProgressiveSetLog[]>([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeModalType, setResumeModalType] = useState<'same_day' | 'different_day'>('same_day');
  const [missedExercises, setMissedExercises] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Running session state
  const [showRunningSession, setShowRunningSession] = useState(false);

  // Workout type selection state
  const [showWorkoutTypeSelector, setShowWorkoutTypeSelector] = useState(false);

  useEffect(() => {
    loadProgram();
  }, []);

  // Check for in-progress workout after program loads
  useEffect(() => {
    if (userId && program) {
      checkInProgressWorkout();
    }
  }, [userId, program]);

  async function checkInProgressWorkout() {
    if (!userId) return;

    try {
      const workout = await getInProgressWorkout(userId);

      if (workout) {
        const workoutDate = new Date(workout.workout_date);
        const today = new Date();
        const isToday = workoutDate.toDateString() === today.toDateString();

        // Get completed sets
        const sets = await getWorkoutSets(workout.id);
        setInProgressSets(sets);

        // Calculate missed exercises (not in completed sets)
        const completedExercises = new Set(sets.map(s => s.exercise_name));
        const allExercises = program?.weekly_schedule?.flatMap((day: any) =>
          day.exercises?.map((ex: any) => ex.name) || []
        ) || [];

        // Find exercises from the interrupted workout that weren't completed
        // We need the original workout's exercises - for now use day_name to find them
        const workoutDay = program?.weekly_schedule?.find((day: any) =>
          day.dayName === workout.day_name
        );
        const missedExs = workoutDay?.exercises
          ?.filter((ex: any) => !completedExercises.has(ex.name))
          ?.map((ex: any) => ex.name) || [];

        setMissedExercises(missedExs);
        setInProgressWorkout(workout);

        if (isToday) {
          // Same day - auto resume
          setResumeModalType('same_day');
        } else {
          // Different day - ask to merge
          setResumeModalType('different_day');
        }

        setShowResumeModal(true);
      }
    } catch (error) {
      console.error('[Workout] Error checking in-progress workout:', error);
    }
  }

  // Handle resume workout (same day)
  async function handleResumeWorkout() {
    if (!inProgressWorkout) return;

    setShowResumeModal(false);

    // Navigate to workout session with resume data
    navigate('/workout-session', {
      state: {
        program,
        dayIndex: currentDay,
        resumeWorkoutId: inProgressWorkout.id,
        resumeExerciseIndex: inProgressWorkout.current_exercise_index,
        resumeSetNumber: inProgressWorkout.current_set,
        completedSets: inProgressSets,
      }
    });
  }

  // Handle merge missed exercises into today's workout
  async function handleMergeExercises() {
    if (!inProgressWorkout) return;

    // Mark old workout as abandoned
    await abandonProgressiveWorkout(inProgressWorkout.id);

    setShowResumeModal(false);
    setInProgressWorkout(null);

    // The missed exercises will be added to today's workout in the session
    navigate('/workout-session', {
      state: {
        program,
        dayIndex: currentDay,
        mergeExercises: missedExercises, // Pass missed exercises to add
      }
    });
  }

  // Handle skip all missed exercises (counts as skip for pattern detection)
  async function handleSkipMissedExercises() {
    if (!inProgressWorkout || !userId) return;

    // Log each missed exercise as a skip
    for (const exerciseName of missedExercises) {
      // Find the exercise pattern from program
      const exercise = program?.weekly_schedule
        ?.flatMap((day: any) => day.exercises || [])
        ?.find((ex: any) => ex.name === exerciseName);

      const pattern = exercise?.pattern || exercise?.type || 'compound';

      await logExerciseSkip(
        userId,
        exerciseName,
        pattern,
        {
          programId: inProgressWorkout.program_id || undefined,
          skipReason: 'other', // Workout not completed
          dayName: inProgressWorkout.day_name,
        }
      );
    }

    // Mark old workout as abandoned
    await abandonProgressiveWorkout(inProgressWorkout.id);

    setShowResumeModal(false);
    setInProgressWorkout(null);
    setMissedExercises([]);

    console.log(`[Workout] Logged ${missedExercises.length} exercises as skipped`);
  }

  /**
   * Load program from Supabase or localStorage
   *
   * REFACTORED: Usa normalizeOnLoad() per gestire automaticamente
   * tutti i formati (weekly_split, weekly_schedule, exercises[])
   */
  async function loadProgram() {
    try {
      // ✅ PRIORITIZE SUPABASE: Try cloud data first if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id); // Save user ID for in-progress check
        console.log('[WORKOUT] User authenticated, loading from Supabase...');

        const { data, error } = await supabase
          .from('training_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          console.log('[WORKOUT] ✅ Loaded from Supabase:', data.id);

          // ✅ USA IL NORMALIZER UNIFICATO
          // Gestisce automaticamente: weekly_split, weekly_schedule, exercises[]
          const normalized = normalizeOnLoad(data);

          if (normalized) {
            // Converti NormalizedProgram → formato Workout page
            // Il normalizer garantisce sempre weekly_split.days[]
            const formattedProgram = {
              id: normalized.id,
              name: normalized.name || 'Il Tuo Programma',
              description: normalized.description || '',
              weekly_schedule: normalized.weekly_split.days.map((day) => ({
                dayName: day.dayName || `Giorno ${day.dayIndex + 1}`,
                dayType: day.dayType,
                muscleGroups: day.muscleGroups,
                runningSession: day.runningSession,
                exercises: day.exercises
                  .filter((ex) => ex && ex.name) // Safety filter
                  .map((ex) => ({
                    name: ex.name,
                    pattern: ex.pattern,
                    sets: ex.sets || 3,
                    reps: ex.reps?.toString() || '10',
                    rest: typeof ex.rest === 'number' ? ex.rest : parseRestToSeconds(ex.rest) || 90,
                    notes: ex.notes || '',
                    type: 'standard',
                    intensity: ex.intensity,
                    weight: ex.weight,
                    targetRir: ex.targetRir,
                    videoUrl: ex.videoUrl,
                    alternatives: ex.alternatives,
                    baseline: ex.baseline
                  }))
              }))
            };

            setProgram(formattedProgram);
            console.log('[WORKOUT] ✅ Program normalized and formatted:', {
              days: formattedProgram.weekly_schedule.length,
              totalExercises: formattedProgram.weekly_schedule.reduce(
                (sum, day) => sum + day.exercises.length, 0
              )
            });
          } else {
            console.warn('[WORKOUT] Normalization returned null');
          }

          setLoading(false);
          return;
        } else {
          console.warn('[WORKOUT] Supabase load failed:', error?.message);
        }
      }

      // Fallback: Try localStorage (for offline mode or no user)
      const localProgram = localStorage.getItem('currentProgram');
      if (localProgram) {
        console.log('[WORKOUT] ⚠️ Loading from localStorage (fallback)');
        const parsedProgram = JSON.parse(localProgram);

        // ✅ USA IL NORMALIZER ANCHE PER LOCALSTORAGE
        const normalized = normalizeOnLoad(parsedProgram);

        if (normalized) {
          const formattedProgram = {
            id: normalized.id,
            name: normalized.name || 'Il Tuo Programma',
            description: normalized.description || '',
            weekly_schedule: normalized.weekly_split.days.map((day) => ({
              dayName: day.dayName || `Giorno ${day.dayIndex + 1}`,
              dayType: day.dayType,
              muscleGroups: day.muscleGroups,
              runningSession: day.runningSession,
              exercises: day.exercises
                .filter((ex) => ex && ex.name)
                .map((ex) => ({
                  name: ex.name,
                  pattern: ex.pattern,
                  sets: ex.sets || 3,
                  reps: ex.reps?.toString() || '10',
                  rest: typeof ex.rest === 'number' ? ex.rest : parseRestToSeconds(ex.rest) || 90,
                  notes: ex.notes || '',
                  type: 'standard',
                  intensity: ex.intensity,
                  weight: ex.weight,
                  targetRir: ex.targetRir,
                  videoUrl: ex.videoUrl,
                  alternatives: ex.alternatives,
                  baseline: ex.baseline
                }))
            }))
          };

          setProgram(formattedProgram);
        }

        setLoading(false);
        return;
      }

      console.log('[WORKOUT] No program found in Supabase or localStorage');
      setLoading(false);
    } catch (error) {
      console.error('[WORKOUT] Error:', error);
      setLoading(false);
    }
  }

  // NOTE: generateWeeklySchedule() rimossa - ora normalizeOnLoad() gestisce tutti i formati

  // Helper: converte rest da formato "2-3min" o "90s" a secondi
  function parseRestToSeconds(rest: string | number | undefined | null): number {
    if (rest == null) return 90;
    if (typeof rest === 'number') return isNaN(rest) ? 90 : rest;
    if (!rest || typeof rest !== 'string') return 90;

    const str = rest.trim();

    // Formato: "2-3min" → prendi valore medio
    if (str.includes('-') && str.includes('min')) {
      const [min, max] = str.replace('min', '').split('-').map(s => parseInt(s.trim()));
      const result = ((min + max) / 2) * 60;
      return isNaN(result) ? 90 : result;
    }

    // Formato: "90s" → rimuovi 's'
    if (str.includes('s')) {
      const result = parseInt(str.replace('s', ''));
      return isNaN(result) ? 90 : result;
    }

    // Formato: "2min" → converti a secondi
    if (str.includes('min')) {
      const result = parseInt(str.replace('min', '')) * 60;
      return isNaN(result) ? 90 : result;
    }

    // Prova a parsare come numero puro
    const parsed = parseInt(str);
    if (!isNaN(parsed)) return parsed;

    // Default
    return 90;
  }

  // Check if user has running in their program
  function hasRunningInProgram(): boolean {
    // Check onboarding data for running preference
    const onboardingData = localStorage.getItem('onboarding_data');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      if (data.running?.enabled || data.runningInterest?.enabled) {
        return true;
      }
    }
    // Also check if any day in schedule is type 'running'
    return program?.weekly_schedule?.some((day: any) => day.type === 'running') || false;
  }

  // Check if today's workout has strength exercises
  function hasStrengthExercises(): boolean {
    const todayWorkout = program?.weekly_schedule?.[currentDay];
    return todayWorkout?.exercises && todayWorkout.exercises.length > 0;
  }

  function handleStartWorkout() {
    // Show workout type selector if user has both options available
    const hasRunning = hasRunningInProgram();
    const hasStrength = hasStrengthExercises();

    console.log('[Workout] hasRunning:', hasRunning, 'hasStrength:', hasStrength);

    if (hasRunning && hasStrength) {
      // User has both options - show selector
      setShowWorkoutTypeSelector(true);
      return;
    }

    // Only running available
    if (hasRunning && !hasStrength) {
      handleSelectRunning();
      return;
    }

    // Only strength available (or nothing)
    handleSelectStrength();
  }

  function handleSelectStrength() {
    setShowWorkoutTypeSelector(false);
    const todayWorkout = program?.weekly_schedule?.[currentDay];

    // CHECK: Safety guard - se exercises è vuoto, mostra errore
    if (!todayWorkout?.exercises || todayWorkout.exercises.length === 0) {
      console.warn('[Workout] Day has no exercises');
      toast.error('Nessun esercizio programmato per oggi');
      return;
    }

    // Giorno normale (strength) → procedi con recovery screening
    setShowRecoveryScreening(true);
  }

  function handleSelectRunning() {
    setShowWorkoutTypeSelector(false);

    // Get running session from program or create default
    const todayWorkout = program?.weekly_schedule?.[currentDay];

    if (todayWorkout?.runningSession) {
      // Use existing running session
      setShowRunningSession(true);
    } else {
      // Create default running session from onboarding preferences
      const onboardingData = localStorage.getItem('onboarding_data');
      let runningPrefs = null;
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        runningPrefs = data.running || data.runningInterest;
      }

      // Set a default running session
      const defaultSession = {
        type: runningPrefs?.goal === 'base_aerobica' ? 'easy_run' : 'interval',
        targetDuration: 30,
        warmup: { duration: 5, description: 'Camminata veloce o corsa leggera' },
        mainWork: runningPrefs?.goal === 'base_aerobica'
          ? { type: 'continuous', duration: 20, intensity: 'easy', targetHR: '120-140' }
          : { type: 'intervals', sets: 6, workDuration: 60, restDuration: 90, intensity: 'moderate' },
        cooldown: { duration: 5, description: 'Camminata di defaticamento' },
        notes: 'Sessione di corsa'
      };

      // Temporarily add to program for the view
      if (program) {
        const updatedSchedule = [...program.weekly_schedule];
        updatedSchedule[currentDay] = {
          ...updatedSchedule[currentDay],
          runningSession: defaultSession
        };
        setProgram({ ...program, weekly_schedule: updatedSchedule });
      }

      setShowRunningSession(true);
    }
  }

  // Handler per running session completion
  async function handleRunningComplete(data: RunningCompletionData) {
    console.log('[Workout] Running session completed:', data);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && program) {
        const todayWorkout = program.weekly_schedule[currentDay];

        // Salva nel workout_logs
        const { error } = await supabase.from('workout_logs').insert({
          user_id: user.id,
          program_id: program.id,
          day_name: todayWorkout?.dayName || `Running Day ${currentDay + 1}`,
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
          console.error('[Workout] Error saving running session:', error);
          toast.error('Errore nel salvataggio');
        } else {
          toast.success('Sessione running salvata!');
        }
      }
    } catch (error) {
      console.error('[Workout] Error in handleRunningComplete:', error);
    }

    setShowRunningSession(false);
    navigate('/dashboard');
  }

  function handleRunningCancel() {
    setShowRunningSession(false);
  }

  async function handleRecoveryComplete(data: RecoveryData) {
    setRecoveryData(data);
    setShowRecoveryScreening(false);

    try {
      const adjustment = calculateAdaptiveAdjustment(data);

      navigate('/workout-session', {
        state: {
          program,
          dayIndex: currentDay,
          adjustment,
          recoveryData: data
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert(t('workout.error_loading'));
    }
  }

  function calculateAdaptiveAdjustment(recovery: RecoveryData) {
    console.log("🔍 RECOVERY DATA:", recovery);
    let volumeMultiplier = 1.0;
    let intensityMultiplier = 1.0;
    let restMultiplier = 1.0;
    let exerciseMode: 'express' | 'reduced' | 'standard' | 'full' | 'extended' = 'standard';
    const skipExercises: string[] = [];
    const warnings: string[] = [];

    // TEMPO DISPONIBILE - adatta struttura allenamento
    const availableTime = recovery.availableTime || 45;
    if (availableTime <= 20) {
      exerciseMode = 'express';
      volumeMultiplier *= 0.5; // Solo 50% del volume
      restMultiplier = 0.6; // Pause ridotte 40%
      warnings.push('⚡ Express 20min: solo esercizi principali, pause ridotte');
    } else if (availableTime <= 30) {
      exerciseMode = 'reduced';
      volumeMultiplier *= 0.7; // 70% del volume
      restMultiplier = 0.8; // Pause ridotte 20%
      warnings.push('🏃 Veloce 30min: esercizi ridotti, pause brevi');
    } else if (availableTime >= 75) {
      exerciseMode = 'extended';
      volumeMultiplier *= 1.15; // +15% volume
      warnings.push('🏋️ Lungo 90min+: allenamento completo con accessori');
    } else if (availableTime >= 60) {
      exerciseMode = 'full';
      volumeMultiplier *= 1.1; // +10% volume
      warnings.push('🔥 Completo 60min: tutti gli esercizi');
    }
    // 45 min = standard, nessuna modifica

    if (recovery.sleepHours < 6) {
      volumeMultiplier = 0.8;
      warnings.push('Sonno insufficiente: volume ridotto 20%');
    }
    if (recovery.sleepHours < 5) {
      volumeMultiplier = 0.7;
      intensityMultiplier = 0.9;
      warnings.push('Sonno molto insufficiente: volume -30%, intensità -10%');
    }

    if (recovery.stressLevel >= 8) {
      intensityMultiplier = 0.8;
      volumeMultiplier = 0.85;
      warnings.push('Stress elevato: intensità -20%, volume -15%');
    } else if (recovery.stressLevel >= 6) {
      intensityMultiplier = 0.9;
      warnings.push('Stress moderato: intensità -10%');
    }

    if (recovery.hasInjury && recovery.injuryDetails) {
      volumeMultiplier *= 0.85;
      intensityMultiplier *= 0.85;
      warnings.push(`Dolore rilevato (${recovery.injuryDetails}): riduzione 15%`);

      const injuryLower = recovery.injuryDetails.toLowerCase();
      if (injuryLower.includes('spalla') || injuryLower.includes('shoulder')) {
        skipExercises.push('Military Press', 'Shoulder Press', 'Alzate Laterali', 'Push Press');
      }
      if (injuryLower.includes('schiena') || injuryLower.includes('back') || injuryLower.includes('dorso')) {
        skipExercises.push('Stacco', 'Deadlift', 'Good Morning', 'Row Pesante');
      }
      if (injuryLower.includes('ginocchio') || injuryLower.includes('knee')) {
        skipExercises.push('Squat', 'Leg Press', 'Lunge', 'Jump Squat');
      }
      if (injuryLower.includes('polso') || injuryLower.includes('wrist')) {
        skipExercises.push('Push Press', 'Military Press');
      }
    }

    if (recovery.isFemale && recovery.menstrualCycle === 'luteal') {
      volumeMultiplier *= 0.9;
      warnings.push('Fase luteale: volume -10%');
    }

    if (recovery.isFemale && recovery.menstrualCycle === 'menstruation') {
      volumeMultiplier *= 0.8;
      warnings.push('Fase mestruazione: volume -20%');
    }

    // MENOPAUSE ADAPTATIONS: focus resistenza, più rest, bone density
    if (recovery.isFemale && recovery.menstrualCycle === 'menopause') {
      volumeMultiplier *= 0.95; // Volume leggermente ridotto (-5%)
      intensityMultiplier *= 0.95; // Intensità leggermente ridotta (-5%)
      warnings.push('Programma menopausa: focus resistenza e densità ossea');
    }

console.log("📊 MULTIPLIER:", { volumeMultiplier, intensityMultiplier, restMultiplier, exerciseMode });
    return {
      volumeMultiplier: Math.max(0.5, volumeMultiplier), // Minimo 50% per express
      intensityMultiplier: Math.max(0.7, intensityMultiplier),
      restMultiplier,
      exerciseMode,
      skipExercises,
      recommendation: getRecommendation(volumeMultiplier, intensityMultiplier, warnings)
    };
  }

  function getRecommendation(volume: number, intensity: number, warnings: string[]): string {
    let baseMsg = '';

    if (volume < 0.75 || intensity < 0.75) {
      baseMsg = '🔴 Seduta leggera - Recupero attivo consigliato';
    } else if (volume < 0.9 || intensity < 0.9) {
      baseMsg = '🟡 Seduta moderata - Ascolta il tuo corpo';
    } else {
      baseMsg = '🟢 Seduta normale - Vai forte! 💪';
    }

    if (warnings.length > 0) {
      return baseMsg + ' | ' + warnings[0];
    }
    return baseMsg;
  }

  // Get the displayed exercise name (original or substituted)
  function getDisplayedExerciseName(originalName: string): string {
    return substitutions[originalName]?.name || originalName;
  }

  // Get substituted weight if available
  function getSubstitutedWeight(originalName: string, originalWeight?: string): string | undefined {
    const sub = substitutions[originalName];
    if (sub?.suggestedWeight) {
      return sub.suggestedWeight;
    }
    return originalWeight;
  }

  // Get substituted reps if available
  function getSubstitutedReps(originalName: string, originalReps: string | number): string | number {
    const sub = substitutions[originalName];
    if (sub?.suggestedReps) {
      return sub.suggestedReps;
    }
    return originalReps;
  }

  // Handle exercise substitution with params
  function handleSubstitute(
    originalName: string,
    newName: string,
    suggested?: SuggestedParams
  ) {
    setSubstitutions(prev => ({
      ...prev,
      [originalName]: {
        name: newName,
        suggestedWeight: suggested?.weightDisplay,
        suggestedReps: suggested?.reps || undefined
      }
    }));
    setExpandedExercise(null);
  }

  // Reset to original exercise
  function handleResetExercise(originalName: string) {
    setSubstitutions(prev => {
      const updated = { ...prev };
      delete updated[originalName];
      return updated;
    });
  }

  // Toggle alternatives panel
  function toggleAlternatives(index: number) {
    setExpandedExercise(expandedExercise === index ? null : index);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">{t('workout.loading')}</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">{t('dashboard.no_program')}</h2>
            <p className="text-gray-300 mb-6">{t('dashboard.no_program_desc')}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {t('dashboard.back_to_dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

    // Safety guard: ensure program.weekly_schedule exists and has data
    if (!program.weekly_schedule || program.weekly_schedule.length === 0) {
          return (
                  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                            <p className="text-xl text-gray-300">Nessun programma disponibile</p>
                          </div>
                );
        }
  
  const todayWorkout = program.weekly_schedule[currentDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            {program.name}
          </h1>
          <p className="text-gray-400 text-base md:text-lg">{program.description}</p>
        </div>

        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {program.weekly_schedule.map((day: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                currentDay === index
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {day.dayName}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">{todayWorkout.dayName}</h2>

          {todayWorkout.exercises.map((exercise: any, index: number) => (
            <div key={index}>
              {exercise.type === 'giant_set' ? (
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-400">{exercise.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {exercise.rounds} giri • {exercise.restBetweenRounds}s recupero tra i giri
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {exercise.exercises?.map((subEx: any, subIdx: number) => (
                      <div key={subIdx} className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-emerald-500">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white text-lg">
                            {subIdx + 1}. {subEx.name}
                          </span>
                          <span className="text-emerald-400 font-bold">{subEx.reps} reps</span>
                        </div>
                        {subEx.notes && <p className="text-sm text-gray-400 mb-2">{subEx.notes}</p>}
                        {subEx.muscleGroup && (
                          <span className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                            🎯 {subEx.muscleGroup}
                          </span>
                        )}
                        {subEx.tempo && (
                          <span className="inline-block bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded ml-2">
                            ⏱️ {subEx.tempo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {exercise.totalNotes && (
                    <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-300">{exercise.totalNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-4 md:p-6 hover:border-emerald-500/60 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <h3 className="text-lg md:text-2xl font-bold text-white break-words">
                          {getDisplayedExerciseName(exercise.name)}
                        </h3>
                        {/* Show substituted badge */}
                        {substitutions[exercise.name] && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Sostituito
                          </span>
                        )}
                      </div>
                      {exercise.notes && <p className="text-gray-400 text-sm">{exercise.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.weight && (
                        <div className="bg-emerald-500/20 px-4 py-2 rounded-lg">
                          <span className="text-emerald-400 font-bold text-lg">{exercise.weight}kg</span>
                        </div>
                      )}
                      {/* Switch button - only show if exercise has alternatives */}
                      {hasAlternatives(exercise.name) && (
                        <button
                          onClick={() => toggleAlternatives(index)}
                          className={`p-2 rounded-lg transition-all ${
                            expandedExercise === index
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
                          }`}
                          title="Postazione occupata? Cambia esercizio"
                        >
                          <RefreshCw className={`w-5 h-5 ${expandedExercise === index ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alternatives panel */}
                  {expandedExercise === index && (
                    <div className="mb-4 bg-gray-900/70 rounded-lg p-4 border border-orange-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-semibold text-sm">
                          Postazione occupata? Scegli un'alternativa:
                        </span>
                      </div>
                      <div className="space-y-2">
                        {getAlternativesWithParams(exercise.name, exercise.weight, exercise.reps, true).map((alt, altIdx: number) => (
                          <button
                            key={altIdx}
                            onClick={() => handleSubstitute(exercise.name, alt.name, alt.suggested)}
                            className="w-full flex items-center justify-between p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-all group"
                          >
                            <div className="text-left flex-1">
                              <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                {alt.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {alt.notes && (
                                  <span className="text-gray-500 text-xs">{alt.notes}</span>
                                )}
                              </div>
                              {/* Suggested weight/reps */}
                              {alt.suggested && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-emerald-400 text-sm font-medium">
                                    {alt.suggested.weightDisplay}
                                  </span>
                                  {alt.suggested.reps > 0 && (
                                    <span className="text-gray-400 text-sm">
                                      × {alt.suggested.repsDisplay}
                                    </span>
                                  )}
                                  <span className="text-gray-600 text-xs italic">
                                    (RIR per calibrare)
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                alt.equipment === 'gym'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : alt.equipment === 'bodyweight'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {alt.equipment === 'gym' ? 'Attrezzi' : alt.equipment === 'bodyweight' ? 'Corpo libero' : 'Entrambi'}
                              </span>
                              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 rotate-[-90deg]" />
                            </div>
                          </button>
                        ))}
                        {/* Reset to original */}
                        {substitutions[exercise.name] && (
                          <button
                            onClick={() => handleResetExercise(exercise.name)}
                            className="w-full flex items-center justify-center gap-2 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-400 hover:text-white transition-all text-sm"
                          >
                            <X className="w-4 h-4" />
                            Torna all'originale ({exercise.name})
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-2 md:p-4 text-center">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Serie</p>
                      <p className="text-white font-bold text-lg md:text-xl">{exercise.sets}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2 md:p-4 text-center">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Reps</p>
                      <p className="text-white font-bold text-lg md:text-xl">
                        {getSubstitutedReps(exercise.name, exercise.reps)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2 md:p-4 text-center">
                      <p className="text-gray-400 text-xs md:text-sm mb-1">Rest</p>
                      <p className="text-white font-bold text-lg md:text-xl">{exercise.rest}s</p>
                    </div>
                  </div>
                  {/* Show suggested weight when substituted */}
                  {substitutions[exercise.name]?.suggestedWeight && (
                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">
                            Peso suggerito: {substitutions[exercise.name].suggestedWeight}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          Usa RIR 2-3 per calibrare
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg"
          >
            {t('dashboard.back_to_dashboard')}
          </button>
          <button
            onClick={handleStartWorkout}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg shadow-lg shadow-emerald-500/50"
          >
            {t('dashboard.start_workout')}
          </button>
        </div>
      </div>

      {/* Workout Type Selector Modal */}
      {showWorkoutTypeSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Cosa vuoi fare oggi?</h3>
              <p className="text-slate-400 text-sm">Scegli il tipo di allenamento</p>
            </div>

            <div className="space-y-4">
              {/* Strength/Weights Option */}
              <button
                onClick={handleSelectStrength}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white p-6 rounded-xl flex items-center gap-4 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/30"
              >
                <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-8 h-8 text-blue-200" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-bold block">Pesi</span>
                  <span className="text-blue-200 text-sm">Allenamento di forza</span>
                </div>
              </button>

              {/* Running Option */}
              <button
                onClick={handleSelectRunning}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white p-6 rounded-xl flex items-center gap-4 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-emerald-500/30"
              >
                <div className="w-16 h-16 bg-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Footprints className="w-8 h-8 text-emerald-200" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-bold block">Corsa</span>
                  <span className="text-emerald-200 text-sm">Sessione cardio</span>
                </div>
              </button>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setShowWorkoutTypeSelector(false)}
              className="w-full mt-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Running Session View */}
      {showRunningSession && program?.weekly_schedule?.[currentDay]?.runningSession && (
        <RunningSessionView
          session={program.weekly_schedule[currentDay].runningSession}
          dayName={program.weekly_schedule[currentDay].dayName || `Giorno ${currentDay + 1}`}
          onComplete={handleRunningComplete}
          onCancel={handleRunningCancel}
        />
      )}

      {showRecoveryScreening && (
        <RecoveryScreening
          onComplete={handleRecoveryComplete}
          onSkip={() => {
            setShowRecoveryScreening(false);
            handleRecoveryComplete({
              sleepHours: 7,
              stressLevel: 5,
              hasInjury: false,
              injuryDetails: null,
              menstrualCycle: null,
              availableTime: 45,
              isFemale: false,
              timestamp: new Date().toISOString(),
            });
          }}
        />
      )}

      {/* Resume Workout Modal */}
      {showResumeModal && inProgressWorkout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            {resumeModalType === 'same_day' ? (
              // SAME DAY - Resume workout
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                    <PlayCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Workout in corso</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Hai un workout iniziato oggi che non hai completato
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Giorno:</span>
                    <span className="text-white font-semibold">{inProgressWorkout.day_name}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progresso:</span>
                    <span className="text-emerald-400 font-semibold">
                      {inProgressWorkout.exercises_completed}/{inProgressWorkout.total_exercises} esercizi
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Set completati:</span>
                    <span className="text-white">{inProgressSets.length}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleResumeWorkout}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Riprendi
                  </button>
                  <button
                    onClick={handleSkipMissedExercises}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Abbandona
                  </button>
                </div>
              </>
            ) : (
              // DIFFERENT DAY - Merge or skip
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Workout non completato</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Hai {missedExercises.length} esercizi non completati da {inProgressWorkout.day_name}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Esercizi mancanti:</p>
                  <div className="flex flex-wrap gap-2">
                    {missedExercises.slice(0, 5).map((ex, i) => (
                      <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs">
                        {ex}
                      </span>
                    ))}
                    {missedExercises.length > 5 && (
                      <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded-lg text-xs">
                        +{missedExercises.length - 5} altri
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-4 text-center">
                  Vuoi aggiungere questi esercizi alla seduta di oggi?
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleMergeExercises}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Sì, accorpa alla seduta di oggi
                  </button>
                  <button
                    onClick={handleSkipMissedExercises}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    No, salta (conta come skip)
                  </button>
                </div>

                <p className="text-slate-500 text-xs text-center mt-4">
                  Se salti, gli esercizi verranno conteggiati per il tracking pattern
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
