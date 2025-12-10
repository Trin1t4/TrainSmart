import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Check, X, Timer } from 'lucide-react';
import { PostSetScreening, SetFeedback } from '../components/PostSetScreening';
import TUTTimer from '../components/TUTTimer';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  weight?: number;
    tempo?: {
    eccentric: number;
    pause: number;
    concentric: number;
  };
  notes?: string;
  type?: string;
  exercises?: any[];
  rounds?: number;
  restBetweenRounds?: number;
}

interface WorkoutSessionState {
  program: any;
  dayIndex: number;
  adjustment: {
    volumeMultiplier: number;
    intensityMultiplier: number;
    skipExercises: string[];
    recommendation: string;
  };
}

export default function WorkoutSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as WorkoutSessionState;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [sessionStartTime] = useState(new Date());
    const [currentRep, setCurrentRep] = useState(1);
  const [showPostSetScreening, setShowPostSetScreening] = useState(false);
  const [setFeedbackHistory, setSetFeedbackHistory] = useState<SetFeedback[]>([]);

  useEffect(() => {
    if (!state || !state.program) {
      navigate('/workout');
    }
  }, [state, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (restTimeLeft === 0 && isResting) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  if (!state || !state.program) {
    return null;
  }

  const workout = state.program.weekly_schedule[state.dayIndex];
  const exercises = workout.exercises.filter(
    (ex: Exercise) => !state.adjustment.skipExercises.some(skip => ex.name.includes(skip))
  );
  const currentExercise = exercises[currentExerciseIndex];
console.log("🎯 STATE RICEVUTO:", state.adjustment);
console.log("⚙️ ESERCIZIO CORRENTE:", {
  name: currentExercise.name,
  sets: currentExercise.sets,
  reps: currentExercise.reps,
  weight: currentExercise.weight
});

const adjustedSets = Math.max(1, Math.round(currentExercise.sets * state.adjustment.volumeMultiplier));



console.log("🔢 VOLUME ADJUSTMENT:", {
  exerciseName: currentExercise.name,
  originalSets: currentExercise.sets,
  volumeMultiplier: state.adjustment.volumeMultiplier,
  calculated: currentExercise.sets * state.adjustment.volumeMultiplier,
  adjustedSets: adjustedSets,
  wasReduced: adjustedSets < currentExercise.sets
});
console.log("✅ SETS CALCOLATI:", { originalSets: currentExercise.sets, adjustedSets });
const adjustedWeight = currentExercise.weight 
  ? Math.round(currentExercise.weight * state.adjustment.intensityMultiplier) 
  : null;


console.log("🏋️ PESO DEBUG:", {
  exerciseName: currentExercise.name,
  originalWeight: currentExercise.weight,
  hasWeight: !!currentExercise.weight,
  intensityMultiplier: state.adjustment.intensityMultiplier,
  adjustedWeight: adjustedWeight
});
  const getGoalType = (): 'hypertrophy' | 'strength' | 'endurance' | 'power' => {
    const reps = parseInt(currentExercise.reps);
    if (reps <= 5) return 'strength';
    if (reps <= 8) return 'power';
    if (reps <= 12) return 'hypertrophy';
    return 'endurance';
  };

  const handleCompleteSet = () => {
    setShowPostSetScreening(true);
  };

  const handlePostSetFeedback = (feedback: SetFeedback) => {
    setSetFeedbackHistory([...setFeedbackHistory, feedback]);
    setShowPostSetScreening(false);
    setCompletedSets([...completedSets, currentSet]);

    if (currentSet < adjustedSets) {
      setCurrentSet(currentSet + 1);
      setRestTimeLeft(currentExercise.rest);
      setIsResting(true);
    } else {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        setCompletedSets([]);
      } else {
        handleCompleteWorkout();
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
  };

  const handleCompleteWorkout = async () => {
    console.log('Allenamento completato!', {
      startTime: sessionStartTime,
      endTime: new Date(),
      feedbackHistory: setFeedbackHistory,
    });
    navigate('/workout');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{workout.dayName}</h1>
            <button
              onClick={() => {
                if (confirm('Sei sicuro di voler uscire? Il progresso non sarà salvato.')) {
                  navigate('/workout');
                }
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Esercizio {currentExerciseIndex + 1} di {exercises.length}</span>
              <span>{Math.round((currentExerciseIndex / exercises.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentExerciseIndex / exercises.length) * 100}%` }}
              />
            </div>
          </div>

          {(state.adjustment.volumeMultiplier < 1 || state.adjustment.intensityMultiplier < 1) && (
            <div className="mt-4 bg-yellow-900/30 border border-yellow-500/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="text-yellow-300 font-bold text-lg">AdaptFlow Attivo</span>
              </div>
              <p className="text-yellow-200/90 text-sm leading-relaxed">
                {state.adjustment.recommendation}
              </p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-yellow-500/30">
                {state.adjustment.volumeMultiplier < 1 && (
                  <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <span className="text-yellow-300 font-semibold">
                      📊 Volume: -{Math.round((1 - state.adjustment.volumeMultiplier) * 100)}%
                    </span>
                  </div>
                )}
                {state.adjustment.intensityMultiplier < 1 && (
                  <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <span className="text-yellow-300 font-semibold">
                      💪 Intensità: -{Math.round((1 - state.adjustment.intensityMultiplier) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isResting && (
          <div className="mb-6 bg-emerald-900/30 border-2 border-emerald-500 rounded-xl p-8 text-center animate-pulse">
            <Timer className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-2">Recupero</p>
            <p className="text-6xl font-bold text-emerald-400 mb-6">
              {formatTime(restTimeLeft)}
            </p>
            <button
              onClick={handleSkipRest}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Salta Recupero →
            </button>
          </div>
        )}

        {!isResting && (
          <div className="bg-gray-800/50 border-2 border-emerald-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-white">
                {currentExercise.name}
              </h2>
              {adjustedWeight && (
                <div className="bg-emerald-500/20 px-4 py-2 rounded-lg">
                  <span className="text-emerald-400 font-bold text-2xl">
                    {adjustedWeight}kg
                  </span>
                </div>
              )}
            </div>

            {currentExercise.notes && (
              <p className="text-gray-400 mb-4">{currentExercise.notes}</p>
            )}

            {currentExercise.type === 'giant_set' && currentExercise.exercises && (
              <div className="space-y-2 mb-6 bg-gray-900/50 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold mb-3">
                  🔥 {currentExercise.rounds} giri - Zero pause tra esercizi
                </p>
                {currentExercise.exercises.map((subEx: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-white">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{subEx.name}</span>
                    <span className="text-emerald-400">• {subEx.reps}</span>
                  </div>
                ))}
              </div>
            )}

                        <>
{/* Timer TUT o Rep Counter normale */}
            {currentExercise.tempo ? (
              <TUTTimer 
                tempo={currentExercise.tempo}
                currentRep={currentRep}
                totalReps={(() => {
                  const repsStr = currentExercise.reps;
                  if (typeof repsStr === 'string' && repsStr.includes('-')) {
                    return parseInt(repsStr.split('-')[1]) || 10;
                  }
                  return parseInt(repsStr) || 10;
                })()}
                onRepComplete={() => {
                  setCurrentRep(prev => prev + 1);
                }}
              />
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Serie</p>
                  <p className="text-white font-bold text-2xl">
                    {currentSet}/{adjustedSets}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Ripetizioni</p>
                  <p className="text-white font-bold text-2xl">{currentExercise.reps}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Recupero</p>
                  <p className="text-white font-bold text-2xl">{currentExercise.rest}s</p>
                </div>
              </div>
            )}
           

            <button
              onClick={handleCompleteSet}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              {currentSet === adjustedSets ? 'Completa Esercizio' : 'Serie Completata'}
            </button>
                        </>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {Array.from({ length: adjustedSets }).map((_, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                completedSets.includes(idx + 1)
                  ? 'bg-emerald-500 text-white'
                  : idx + 1 === currentSet
                  ? 'bg-emerald-500/50 text-white border-2 border-emerald-400'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {showPostSetScreening && (
        <PostSetScreening
          workoutId={state.program.id || 'current'}
          exerciseId={currentExercise.name}
          setNumber={currentSet}
          targetReps={parseInt(currentExercise.reps.split('-')[0])}
          goalType={getGoalType()}
          onComplete={handlePostSetFeedback}
        />
      )}
    </div>
  );
}
