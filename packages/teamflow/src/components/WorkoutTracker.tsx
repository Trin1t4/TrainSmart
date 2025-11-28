import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Check,
  X,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  AlertCircle,
  Settings,
} from "lucide-react";
import AdaptLocationDialog from "./AdaptLocationDialog";

// Mapping esercizi per identificare tipo
const EXERCISE_MAPPING: Record<string, string> = {
  "squat": "squat",
  "panca piana": "bench",
  "panca": "bench",
  "stacco": "deadlift",
  "rematore": "row",
  "pulley": "row",
  "lat": "row",
  "military press": "press",
  "shoulder press": "press",
  "press": "press"
};

function getExerciseKey(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase();
  for (const [key, value] of Object.entries(EXERCISE_MAPPING)) {
    if (name.includes(key)) {
      return value;
    }
  }
  return null;
}

export default function WorkoutTracker({ programDay, preWorkoutData, onComplete }: any) {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sets, setSets] = useState<any>({});
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTarget, setRestTarget] = useState(0);
  const [notes, setNotes] = useState("");
  const [isAdaptDialogOpen, setIsAdaptDialogOpen] = useState(false);
  const [adaptedExercises, setAdaptedExercises] = useState<any[] | null>(null);
  
  // Usa esercizi adattati se presenti, altrimenti quelli originali
  const currentExercises = adaptedExercises || programDay?.exercises || [];
  
  // Calcola riduzione carico per esercizio corrente
  const exercise = currentExercises[currentExercise];
  const exerciseKey = exercise ? getExerciseKey(exercise.name) : null;
  const isAffectedByPain = preWorkoutData?.affectedExercises?.includes(exerciseKey);
  const loadReduction = isAffectedByPain ? (preWorkoutData.loadReduction || 0) : 0;

  // Inizia workout
  useEffect(() => {
    if (programDay) {
      startWorkout();
    }
  }, [programDay]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isResting && timer < restTarget) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else if (timer >= restTarget && isResting) {
      setIsResting(false);
      // Notifica (vibration se mobile)
      if (navigator.vibrate) navigator.vibrate(200);
    }
    return () => clearInterval(interval);
  }, [isResting, timer, restTarget]);

  const startWorkout = async () => {
    const res = await fetch("/api/workout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programId: programDay.programId,
        dayName: programDay.name,
        ...(preWorkoutData && {
          sleepHours: preWorkoutData.sleepHours,
          energyLevel: preWorkoutData.energyLevel,
          painLevel: preWorkoutData.painLevel,
          painLocation: preWorkoutData.painLocation,
          preWorkoutNotes: preWorkoutData.notes
        })
      }),
    });
    const workout = await res.json();
    setWorkoutId(workout.id);
  };

  const addSet = async (exercise: any, setNumber: number) => {
    const setData = {
      exerciseName: exercise.name,
      setNumber,
      reps: sets[exercise.name]?.[setNumber]?.reps || 0,
      weight: sets[exercise.name]?.[setNumber]?.weight || exercise.weight || 0,
      rpe: sets[exercise.name]?.[setNumber]?.rpe || null,
    };

    const res = await fetch(`/api/workout/${workoutId}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setData),
    });

    const savedSet = await res.json();

    // Aggiorna stato locale
    setSets((prev: any) => ({
      ...prev,
      [exercise.name]: {
        ...(prev[exercise.name] || {}),
        [setNumber]: { ...setData, id: savedSet.id },
      },
    }));

    // Avvia rest timer
    startRest(exercise.rest);
  };

  const updateSetValue = (
    exerciseName: string,
    setNumber: number,
    field: string,
    value: any,
  ) => {
    setSets((prev: any) => ({
      ...prev,
      [exerciseName]: {
        ...(prev[exerciseName] || {}),
        [setNumber]: {
          ...(prev[exerciseName]?.[setNumber] || {}),
          [field]: value,
        },
      },
    }));
  };

  const startRest = (seconds: number) => {
    setTimer(0);
    setRestTarget(seconds);
    setIsResting(true);
  };

  const skipRest = () => {
    setIsResting(false);
    setTimer(0);
  };

  const completeWorkout = async () => {
    await fetch(`/api/workout/${workoutId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (onComplete) onComplete();
  };

  const handleAdapt = (exercises: any[], location: string) => {
    setAdaptedExercises(exercises);
    // Reset esercizio corrente se oltre il numero di esercizi adattati
    if (currentExercise >= exercises.length) {
      setCurrentExercise(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!programDay) {
    return (
      <div className="text-center py-8 text-slate-400">
        Carica un programma per iniziare
      </div>
    );
  }

  const completedSets = Object.keys(sets[exercise?.name] || {}).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">{programDay.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdaptDialogOpen(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
              data-testid="button-open-adapt-dialog"
            >
              <Settings className="w-4 h-4" />
              Adatta
            </button>
            <button
              onClick={completeWorkout}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
              data-testid="button-complete-workout"
            >
              <Check className="w-4 h-4" />
              Completa
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Dumbbell className="w-4 h-4" />
          Esercizio {currentExercise + 1}/{currentExercises.length}
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-emerald-500 animate-pulse" />
            <h2 className="text-4xl font-bold mb-2">
              {formatTime(restTarget - timer)}
            </h2>
            <p className="text-slate-400 mb-6">Recupero...</p>
            <button
              onClick={skipRest}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Salta Recupero
            </button>
          </div>
        </div>
      )}

      {/* Current Exercise */}
      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          {/* Giant Set Rendering */}
          {exercise.type === 'giant_set' ? (
            <>
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-600/50 rounded-xl p-6 mb-6">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  {exercise.name}
                </h2>
                <p className="text-xl text-orange-400 font-semibold mb-4">
                  {exercise.rounds || exercise.sets} giri - ZERO pause tra esercizi
                </p>
                
                {/* Lista esercizi del Giant Set */}
                <div className="space-y-3 mb-4">
                  {exercise.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold">
                          {i + 1}. {ex.name}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {ex.reps} reps
                        </span>
                      </div>
                      {ex.notes && (
                        <p className="text-sm text-slate-400">
                          {ex.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {exercise.totalNotes && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-400 font-semibold">
                      {exercise.totalNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking per Giant Set - tratta come un unico "blocco" */}
              <div className="space-y-3">
                {Array.from({ length: exercise.rounds || exercise.sets }).map((_, idx) => {
                  const setNumber = idx + 1;
                  const setData = sets[exercise.name]?.[setNumber] || {};
                  const isCompleted = !!setData.id;

                  return (
                    <div
                      key={setNumber}
                      className={`border rounded-lg p-4 ${
                        isCompleted
                          ? "border-emerald-600 bg-emerald-600/10"
                          : "border-orange-700 bg-orange-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold">
                          Giro {setNumber}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-slate-400">
                            Completa tutti gli esercizi del giro senza pausa
                          </p>
                        </div>

                        {!isCompleted ? (
                          <button
                            onClick={() => addSet(exercise, setNumber)}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold"
                          >
                            ✓ Giro Completato
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-emerald-600 rounded-lg opacity-50 font-semibold">
                            ✓ Completato
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Rendering normale per esercizio singolo */}
              <h2 className="text-2xl font-bold mb-2">{exercise.name}</h2>
              <div className="flex gap-4 text-sm text-slate-400 mb-4">
                <span>{exercise.sets} serie</span>
                <span>•</span>
                <span>{exercise.reps} reps</span>
                <span>•</span>
                <span>{exercise.rest}s recupero</span>
              </div>

              {exercise.note && (
                <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg mb-4">
                  ⚠️ {exercise.note}
                </div>
              )}

              {loadReduction > 0 && (
                <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg mb-4 border border-red-500/20">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Carico ridotto per protezione
                  </div>
                  <p className="text-xs text-red-400">
                    Abbiamo ridotto automaticamente il carico del <strong>{loadReduction}%</strong> per questo esercizio a causa del dolore segnalato. Il peso suggerito è già adattato.
                  </p>
                </div>
              )}

              {/* Sets Table */}
              <div className="space-y-3">
                {Array.from({ length: exercise.sets }).map((_, idx) => {
                  const setNumber = idx + 1;
                  const setData = sets[exercise.name]?.[setNumber] || {};
                  const isCompleted = !!setData.id;

                  return (
                    <div
                      key={setNumber}
                      className={`border rounded-lg p-4 ${
                        isCompleted
                          ? "border-emerald-600 bg-emerald-600/10"
                          : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Set Number */}
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                      {setNumber}
                    </div>

                    {/* Weight Input */}
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="2.5"
                        value={setData.weight || (exercise.weight ? Math.round((exercise.weight * (1 - loadReduction / 100)) * 4) / 4 : "") || ""}
                        onChange={(e) =>
                          updateSetValue(
                            exercise.name,
                            setNumber,
                            "weight",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                        disabled={isCompleted}
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={setData.reps || ""}
                        onChange={(e) =>
                          updateSetValue(
                            exercise.name,
                            setNumber,
                            "reps",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                        disabled={isCompleted}
                      />
                    </div>

                    {/* RPE Input */}
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">
                        RPE (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={setData.rpe || ""}
                        onChange={(e) =>
                          updateSetValue(
                            exercise.name,
                            setNumber,
                            "rpe",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                        disabled={isCompleted}
                      />
                    </div>

                    {/* Check Button */}
                    {!isCompleted ? (
                      <button
                        onClick={() => addSet(exercise, setNumber)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        disabled={!setData.weight || !setData.reps}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-emerald-600 rounded-lg opacity-50">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Exercise Navigation */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() =>
                setCurrentExercise(Math.max(0, currentExercise - 1))
              }
              disabled={currentExercise === 0}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              ← Precedente
            </button>
            <button
              onClick={() =>
                setCurrentExercise(
                  Math.min(
                    currentExercises.length - 1,
                    currentExercise + 1,
                  ),
                )
              }
              disabled={currentExercise === currentExercises.length - 1}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Successivo →
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-slate-900 rounded-xl p-6">
          <label className="block text-sm font-semibold mb-2">
            Note Workout
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Come ti sei sentito? Difficoltà? Note tecniche..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 min-h-[100px]"
          />
        </div>
      </div>

      {/* Adapt Location Dialog */}
      <AdaptLocationDialog
        isOpen={isAdaptDialogOpen}
        onClose={() => setIsAdaptDialogOpen(false)}
        programId={programDay.programId}
        dayName={programDay.name}
        currentLocation={programDay.location || "gym"}
        currentExercises={currentExercises}
        onAdapt={handleAdapt}
      />
    </div>
  );
}
