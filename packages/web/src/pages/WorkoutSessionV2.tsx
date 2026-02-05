/**
 * Workout Session V2 - Semplificata
 *
 * Principi:
 * - Route-based (riceve stato via location.state)
 * - BottomSheet per conferma uscita
 * - Rest timer visuale con progress circolare
 * - Auto-save progressivo dopo ogni set
 * - Accessibilità: reduced motion, focus management
 * - Massimo 4-5 useState per UI state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  X, Check, Timer, SkipForward, ChevronRight,
  AlertCircle, Dumbbell, Play, Video, Minus, Plus
} from 'lucide-react';
import {
  startProgressiveWorkout,
  saveProgressiveSet,
  updateProgressiveProgress,
  completeProgressiveWorkout,
  abandonProgressiveWorkout,
} from '@trainsmart/shared';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { BottomSheet, BottomSheetFooter } from '../components/ui/BottomSheet';
import { useReducedMotion } from '../hooks/useReducedMotion';
import VideoUploadModal from '../components/VideoUploadModal';
import { isExerciseSupportedInternally } from '../lib/videoCorrectionEngine';
import painManagementService from '../lib/painManagementService';

// =============================================================================
// TYPES
// =============================================================================

interface Exercise {
  name: string;
  pattern?: string;
  sets: number;
  reps: number | string;
  rest: number | string;
  weight?: number | string;
  notes?: string;
  intensity?: string;
}

interface SessionState {
  program: any;
  dayIndex: number;
  adjustment?: {
    volumeMultiplier: number;
    intensityMultiplier: number;
    restMultiplier?: number;
    exerciseMode?: 'express' | 'reduced' | 'standard' | 'full' | 'extended';
    skipExercises: string[];
    recommendation: string;
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function parseRestSeconds(rest: string | number | undefined): number {
  if (!rest) return 90;
  if (typeof rest === 'number') return rest <= 10 ? rest * 60 : rest;
  const cleaned = String(rest).trim().toLowerCase();
  // "90s" or "60-90s"
  if (cleaned.includes('s') && !cleaned.includes('min')) {
    const nums = cleaned.match(/\d+/g)?.map(Number) || [90];
    return nums.length > 1 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
  }
  // "2-3min" or "3min"
  if (cleaned.includes('min')) {
    const nums = cleaned.match(/\d+/g)?.map(Number) || [2];
    const mins = nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0];
    return Math.round(mins * 60);
  }
  const n = parseInt(cleaned);
  return isNaN(n) ? 90 : (n <= 10 ? n * 60 : n);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function WorkoutSessionV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const state = location.state as SessionState | undefined;

  // Core session state
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // UI state
  const [showExitSheet, setShowExitSheet] = useState(false);
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  // Feedback state (RPE, RIR, Pain, Weight)
  const [currentRPE, setCurrentRPE] = useState(7);
  const [currentRIR, setCurrentRIR] = useState(2);
  const [currentPainLevel, setCurrentPainLevel] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [adjustedWeights, setAdjustedWeights] = useState<Record<string, number>>({});

  // Auto-save state
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const sessionStartRef = useRef(new Date());

  // ---------- Guards ----------

  useEffect(() => {
    if (!state?.program) {
      navigate('/workout');
    }
  }, [state, navigate]);

  // ---------- Get user ----------

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // ---------- Init progressive workout ----------

  useEffect(() => {
    if (!userId || !state?.program || workoutLogId) return;

    const workout = state.program.weekly_schedule?.[state.dayIndex];
    if (!workout) return;

    startProgressiveWorkout({
      userId,
      programId: state.program.id,
      dayName: workout.dayName || workout.name || `Giorno ${state.dayIndex + 1}`,
      totalExercises: workout.exercises?.length || 0,
    }).then(result => {
      if (result.workoutId) {
        setWorkoutLogId(result.workoutId);
      }
    });
  }, [userId, state?.program, workoutLogId]);

  // ---------- Rest timer ----------

  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) {
      if (isResting && restTimeLeft <= 0) setIsResting(false);
      return;
    }
    const interval = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  // ---------- Computed values (safe for hooks) ----------

  const workout = state?.program?.weekly_schedule?.[state?.dayIndex ?? 0];
  const adjustment = state?.adjustment || {
    volumeMultiplier: 1,
    intensityMultiplier: 1,
    restMultiplier: 1,
    skipExercises: [] as string[],
    recommendation: '',
  };

  // Filter & limit exercises
  const rawExercises: Exercise[] = (workout?.exercises || []).filter(
    (ex: Exercise) => !adjustment.skipExercises.some(skip => ex.name.includes(skip))
  );
  const mode = adjustment.exerciseMode || 'standard';
  const exercises = mode === 'express' ? rawExercises.slice(0, 3)
    : mode === 'reduced' ? rawExercises.slice(0, 4)
    : rawExercises;

  const currentExercise = exercises[exerciseIndex];
  const adjustedSets = currentExercise ? Math.max(1, Math.round(currentExercise.sets * adjustment.volumeMultiplier)) : 1;
  const baseWeight = currentExercise?.weight
    ? Math.round(Number(currentExercise.weight) * adjustment.intensityMultiplier)
    : null;
  // Use user-adjusted weight if available, otherwise use base weight
  const adjustedWeight = currentExercise ? (adjustedWeights[currentExercise.name] ?? baseWeight) : null;
  const totalRestSeconds = currentExercise ? parseRestSeconds(currentExercise.rest) : 90;
  const adjustedRest = Math.max(30, Math.round(totalRestSeconds * (adjustment.restMultiplier || 1)));

  const progress = exercises.length > 0
    ? ((exerciseIndex + (setNumber - 1) / adjustedSets) / exercises.length) * 100
    : 0;

  // Initialize weight when exercise changes (must be before early returns)
  useEffect(() => {
    if (currentExercise && adjustedWeight !== null) {
      setCurrentWeight(adjustedWeight);
    }
  }, [exerciseIndex, currentExercise?.name]);

  // ---------- Early return if no state ----------

  if (!state?.program) return null;
  if (!workout?.exercises?.length) return null;
  if (!currentExercise) {
    return <EmptyExercises onBack={() => navigate('/workout')} />;
  }

  const handleCompleteSet = () => {
    // Open feedback sheet instead of immediately completing
    setCurrentWeight(adjustedWeight);
    setShowFeedbackSheet(true);
  };

  const handleFeedbackSubmit = async () => {
    setShowFeedbackSheet(false);

    // Save weight adjustment if user changed it
    if (currentWeight !== null && currentWeight !== adjustedWeight) {
      setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: currentWeight }));
      toast.info(`Peso aggiornato: ${currentWeight}kg`);
    }

    // Auto-save set with feedback data
    if (workoutLogId) {
      await saveProgressiveSet({
        workout_log_id: workoutLogId,
        exercise_name: currentExercise.name,
        exercise_index: exerciseIndex,
        set_number: setNumber,
        reps_completed: typeof currentExercise.reps === 'number'
          ? currentExercise.reps
          : parseInt(String(currentExercise.reps)) || 10,
        weight_used: currentWeight || undefined,
        rpe: currentRPE,
        rir: currentRIR,
      });
    }

    // Log pain if reported
    if (currentPainLevel > 0 && userId) {
      try {
        await painManagementService.logPain({
          user_id: userId,
          program_id: state?.program?.id,
          exercise_name: currentExercise.name,
          day_name: workout?.dayName || workout?.name || 'Workout',
          set_number: setNumber,
          weight_used: currentWeight || undefined,
          reps_completed: typeof currentExercise.reps === 'number' ? currentExercise.reps : 10,
          rom_percentage: 100,
          pain_level: currentPainLevel,
          rpe: currentRPE,
          adaptations: []
        });

        // Show warning for moderate/high pain
        if (currentPainLevel >= 4 && currentPainLevel < 7) {
          toast.warning('Dolore moderato rilevato. Considera di ridurre il carico.');
        } else if (currentPainLevel >= 7) {
          toast.error('Dolore alto! Considera di saltare questo esercizio o ridurre significativamente il carico.');
        }
      } catch (error) {
        console.error('Error logging pain:', error);
      }
    }

    // Reset feedback state for next set
    setCurrentRPE(7);
    setCurrentRIR(2);
    setCurrentPainLevel(0);

    // Continue with set progression
    if (setNumber < adjustedSets) {
      // Prossimo set, inizia rest
      setSetNumber(prev => prev + 1);
      setRestTimeLeft(adjustedRest);
      setIsResting(true);

      if (workoutLogId) {
        await updateProgressiveProgress(workoutLogId, exerciseIndex, setNumber + 1, exercisesCompleted);
      }
    } else {
      // Esercizio completato
      const newCompleted = exercisesCompleted + 1;
      setExercisesCompleted(newCompleted);

      if (workoutLogId) {
        await updateProgressiveProgress(workoutLogId, exerciseIndex + 1, 1, newCompleted);
      }

      if (exerciseIndex < exercises.length - 1) {
        setExerciseIndex(prev => prev + 1);
        setSetNumber(1);
        toast.success(`${currentExercise.name} completato!`);
      } else {
        handleFinishWorkout();
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleFinishWorkout = async () => {
    const durationMinutes = Math.round(
      (new Date().getTime() - sessionStartRef.current.getTime()) / 60000
    );

    if (workoutLogId) {
      await completeProgressiveWorkout(workoutLogId, {
        durationMinutes,
        exercisesCompleted: exercises.length,
      });
    }

    toast.success('Allenamento completato!');
    navigate('/workout');
  };

  const handleExitWorkout = async () => {
    if (workoutLogId) {
      await abandonProgressiveWorkout(workoutLogId);
    }
    setShowExitSheet(false);
    navigate('/workout');
  };

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-safe-area-inset-bottom">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 safe-area-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">
              {workout.dayName || workout.name || 'Workout'}
            </h1>
            <p className="text-xs text-slate-400">
              Esercizio {exerciseIndex + 1}/{exercises.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitSheet(true)}
            aria-label="Esci dall'allenamento"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-emerald-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Adjustment banner */}
        {(adjustment.volumeMultiplier < 1 || adjustment.intensityMultiplier < 1) && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <p className="text-amber-300 text-sm font-medium">
              AdaptFlow attivo: {adjustment.recommendation}
            </p>
          </div>
        )}

        {/* Rest Timer */}
        <AnimatePresence mode="wait">
          {isResting ? (
            <RestTimerView
              key="rest"
              timeLeft={restTimeLeft}
              totalTime={adjustedRest}
              onSkip={handleSkipRest}
              reducedMotion={reducedMotion}
            />
          ) : (
            <ExerciseView
              key={`exercise-${exerciseIndex}`}
              exercise={currentExercise}
              setNumber={setNumber}
              totalSets={adjustedSets}
              weight={adjustedWeight}
              onCompleteSet={handleCompleteSet}
              isLastSet={setNumber === adjustedSets}
              isLastExercise={exerciseIndex === exercises.length - 1}
              reducedMotion={reducedMotion}
            />
          )}
        </AnimatePresence>

        {/* Set indicators */}
        <div className="flex gap-2 justify-center" role="group" aria-label="Progresso serie">
          {Array.from({ length: adjustedSets }).map((_, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                idx + 1 < setNumber
                  ? 'bg-emerald-500 text-white'
                  : idx + 1 === setNumber && !isResting
                  ? 'bg-emerald-500/40 text-white border-2 border-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
              aria-label={`Serie ${idx + 1}${idx + 1 < setNumber ? ' completata' : idx + 1 === setNumber ? ' corrente' : ''}`}
            >
              {idx + 1 < setNumber ? (
                <Check className="w-4 h-4" />
              ) : (
                idx + 1
              )}
            </div>
          ))}
        </div>

        {/* Upcoming exercises preview */}
        {exerciseIndex < exercises.length - 1 && (
          <div className="bg-slate-800/40 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Prossimo</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium">{exercises[exerciseIndex + 1].name}</p>
                <p className="text-slate-400 text-sm">
                  {exercises[exerciseIndex + 1].sets}x{exercises[exerciseIndex + 1].reps}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Exit Confirmation BottomSheet */}
      <BottomSheet
        open={showExitSheet}
        onOpenChange={setShowExitSheet}
        title="Uscire dall'allenamento?"
        description="Il progresso verrà salvato ma il workout sarà segnato come abbandonato."
      >
        <div className="space-y-3 pt-2">
          <p className="text-slate-300 text-sm">
            Hai completato <span className="font-bold text-white">{exercisesCompleted}</span> esercizi
            su <span className="font-bold text-white">{exercises.length}</span>.
          </p>
        </div>
        <BottomSheetFooter>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowExitSheet(false)}
          >
            Continua
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleExitWorkout}
          >
            Esci
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      {/* Post-Set Feedback BottomSheet */}
      <BottomSheet
        open={showFeedbackSheet}
        onOpenChange={setShowFeedbackSheet}
        title="Feedback Set"
        description={`${currentExercise?.name} - Serie ${setNumber}/${adjustedSets}`}
      >
        <div className="space-y-6 pt-2">
          {/* Weight Modifier */}
          {currentWeight !== null && (
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-300 font-medium">Peso usato</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentWeight(Math.max(0, (currentWeight || 0) - 2.5))}
                    className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5 text-slate-300" />
                  </button>
                  <span className="text-2xl font-bold text-emerald-400 min-w-[80px] text-center">
                    {currentWeight}kg
                  </span>
                  <button
                    onClick={() => setCurrentWeight((currentWeight || 0) + 2.5)}
                    className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RPE Slider */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-emerald-300 font-bold text-sm">RPE - Sforzo Percepito</p>
                <p className="text-slate-500 text-xs">Quanto è stato faticoso?</p>
              </div>
              <span className="text-3xl font-bold text-emerald-400">{currentRPE}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentRPE}
              onChange={(e) => setCurrentRPE(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Facile</span>
              <span>Massimo</span>
            </div>
          </div>

          {/* RIR Buttons */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-purple-300 font-bold text-sm">RIR - Ripetizioni in Riserva</p>
                <p className="text-slate-500 text-xs">Quante reps potevi ancora fare?</p>
              </div>
              <span className="text-3xl font-bold text-purple-400">{currentRIR}</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map(rir => (
                <button
                  key={rir}
                  onClick={() => setCurrentRIR(rir)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    currentRIR === rir
                      ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-lg font-bold">{rir}</div>
                  <div className="text-xs">
                    {rir === 0 ? 'Max' : rir === 5 ? '5+' : `${rir}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pain Level */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-red-300 font-bold text-sm">Dolore</p>
                <p className="text-slate-500 text-xs">0 = nessuno, 10 = insopportabile</p>
              </div>
              <span className={`text-3xl font-bold ${
                currentPainLevel === 0 ? 'text-green-400' :
                currentPainLevel <= 3 ? 'text-yellow-400' :
                currentPainLevel <= 6 ? 'text-orange-400' : 'text-red-400'
              }`}>{currentPainLevel}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={currentPainLevel}
              onChange={(e) => setCurrentPainLevel(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs mt-2">
              <span className="text-green-400">Nessuno</span>
              <span className="text-yellow-400">Lieve</span>
              <span className="text-orange-400">Moderato</span>
              <span className="text-red-400">Severo</span>
            </div>
            {currentPainLevel >= 4 && (
              <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                <p className="text-amber-300 text-xs font-semibold">
                  {currentPainLevel >= 7
                    ? '⚠️ Dolore alto! Considera di interrompere o ridurre il carico.'
                    : '⚠️ Dolore moderato. Il sistema adatterà le prossime sessioni.'}
                </p>
              </div>
            )}
          </div>

          {/* Video Form Check Button */}
          {currentExercise && isExerciseSupportedInternally(currentExercise.name) && (
            <button
              onClick={() => {
                setShowFeedbackSheet(false);
                setShowVideoUpload(true);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Carica Video Form Check
            </button>
          )}
        </div>
        <BottomSheetFooter>
          <Button
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleFeedbackSubmit}
          >
            <Check className="w-5 h-5 mr-2" />
            Conferma
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      {/* Video Upload Modal */}
      {currentExercise && (
        <VideoUploadModal
          open={showVideoUpload}
          onClose={() => {
            setShowVideoUpload(false);
            setShowFeedbackSheet(true);
          }}
          exerciseName={currentExercise.name}
          exercisePattern={currentExercise.pattern}
          workoutLogId={workoutLogId || undefined}
          setNumber={setNumber}
          onUploadComplete={(correctionId) => {
            toast.success('Video analizzato! Controlla i risultati nella cronologia.');
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function RestTimerView({
  timeLeft,
  totalTime,
  onSkip,
  reducedMotion,
}: {
  timeLeft: number;
  totalTime: number;
  onSkip: () => void;
  reducedMotion: boolean;
}) {
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 60; // r=60
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-800/60 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center"
    >
      <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Recupero</p>

      {/* Circular progress */}
      <div className="relative w-36 h-36 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r="60"
            fill="none"
            stroke="currentColor"
            className="text-slate-700"
            strokeWidth="6"
          />
          <circle
            cx="64" cy="64" r="60"
            fill="none"
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: reducedMotion ? 'none' : 'stroke-dashoffset 1s linear',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <Button variant="outline" size="lg" onClick={onSkip}>
        <SkipForward className="w-5 h-5 mr-2" />
        Salta Recupero
      </Button>
    </motion.div>
  );
}

function ExerciseView({
  exercise,
  setNumber,
  totalSets,
  weight,
  onCompleteSet,
  isLastSet,
  isLastExercise,
  reducedMotion,
}: {
  exercise: Exercise;
  setNumber: number;
  totalSets: number;
  weight: number | null;
  onCompleteSet: () => void;
  isLastSet: boolean;
  isLastExercise: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden"
    >
      {/* Exercise header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex-1 mr-4">
            {exercise.name}
          </h2>
          {weight && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex-shrink-0">
              <span className="text-emerald-400 font-bold text-lg">{weight}kg</span>
            </div>
          )}
        </div>

        {exercise.notes && (
          <p className="text-slate-400 text-sm mb-4">{exercise.notes}</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-slate-500 text-xs mb-1">Serie</p>
            <p className="text-white font-bold text-xl">
              {setNumber}/{totalSets}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-slate-500 text-xs mb-1">Ripetizioni</p>
            <p className="text-white font-bold text-xl">{exercise.reps}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-slate-500 text-xs mb-1">Recupero</p>
            <p className="text-white font-bold text-xl">
              {typeof exercise.rest === 'number' ? `${exercise.rest}s` : exercise.rest}
            </p>
          </div>
        </div>
      </div>

      {/* Complete set CTA */}
      <div className="p-6 pt-2">
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          onClick={onCompleteSet}
        >
          <Check className="w-6 h-6 mr-2" />
          {isLastSet && isLastExercise
            ? 'Completa Allenamento'
            : isLastSet
            ? 'Completa Esercizio'
            : 'Serie Completata'
          }
        </Button>
      </div>
    </motion.div>
  );
}

function EmptyExercises({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <p className="text-xl text-slate-300 mb-4">Nessun esercizio disponibile</p>
        <Button variant="primary" onClick={onBack}>
          Torna al workout
        </Button>
      </div>
    </div>
  );
}
