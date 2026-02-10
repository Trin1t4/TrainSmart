/**
 * WORKOUT GRID VIEW - Vista a Griglia per Workout
 *
 * Implementa una vista alternativa a griglia per la sessione di workout.
 * Mostra tutti gli esercizi come card cliccabili, permettendo
 * di navigare liberamente tra gli esercizi invece di seguire un ordine lineare.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, CheckCircle } from 'lucide-react';
import { BETA_FLAGS } from '../config/featureFlags';

interface Exercise {
  name: string;
  pattern: string;
  sets: number;
  reps: number | string;
  rest: string;
  intensity: string;
  weight?: number | string;
  supersetGroup?: number;
}

interface SetLog {
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rpe: number;
  completed: boolean;
}

interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
}

interface WorkoutGridViewProps {
  exercises: Exercise[];
  exerciseLogs: ExerciseLog[];
  dayName: string;
  isResting: boolean;
  restTimeLeft: number;
  onCompleteSet: (exerciseIndex: number, setIndex: number, reps: number, weight: number, rpe: number) => void;
  onSkipRest: () => void;
  onFinishWorkout: () => void;
  onEndWorkoutEarly: () => void;
  onClose: () => void;
}

export default function WorkoutGridView({
  exercises,
  exerciseLogs,
  dayName,
  isResting,
  restTimeLeft,
  onCompleteSet,
  onSkipRest,
  onFinishWorkout,
  onEndWorkoutEarly,
  onClose
}: WorkoutGridViewProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Input state for current set
  const [setReps, setSetReps] = useState(10);
  const [setWeight, setSetWeight] = useState(0);
  const [setRpe, setSetRpe] = useState(7);

  // Helper functions
  const getCompletedSetsCount = (): number => {
    return exerciseLogs.reduce((total, log) => {
      return total + (log.sets?.filter(s => s.completed).length || 0);
    }, 0);
  };

  const getTotalSetsCount = (): number => {
    return exercises.reduce((total, ex) => total + ex.sets, 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize input values when selecting an exercise
  useEffect(() => {
    if (activeExerciseIndex !== null) {
      const exercise = exercises[activeExerciseIndex];
      const targetReps = typeof exercise.reps === 'number'
        ? exercise.reps
        : parseInt(String(exercise.reps).split('-')[0]) || 10;
      setSetReps(targetReps);

      const weight = typeof exercise.weight === 'number'
        ? exercise.weight
        : parseFloat(String(exercise.weight)) || 0;
      setSetWeight(weight);
    }
  }, [activeExerciseIndex, exercises]);

  const handleCompleteSetFromGrid = (exerciseIndex: number, setIndex: number) => {
    onCompleteSet(exerciseIndex, setIndex, setReps, setWeight, setRpe);

    // Check if exercise is now complete
    const exercise = exercises[exerciseIndex];
    const log = exerciseLogs[exerciseIndex];
    const completedAfter = (log?.sets?.filter(s => s.completed).length || 0) + 1;

    if (completedAfter >= exercise.sets) {
      // Exercise completed, close panel
      setActiveExerciseIndex(null);
    }
  };

  const completedSetsCount = getCompletedSetsCount();
  const totalSetsCount = getTotalSetsCount();
  const allComplete = completedSetsCount === totalSetsCount;

  return (
    <div style={{ minHeight: '100vh', background: '#1a202c', padding: '1rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header con progresso globale */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '1rem',
          background: '#2d3748',
          borderRadius: 12,
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>
              {dayName}
            </h1>
            <p style={{ color: '#a0aec0', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              {completedSetsCount}/{totalSetsCount} serie completate
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowEndConfirm(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#e53e3e',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Termina
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                background: '#4a5568',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra progresso */}
        <div style={{
          height: 6,
          background: '#4a5568',
          borderRadius: 3,
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #48bb78, #38a169)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Timer riposo globale (se attivo) */}
        {isResting && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.875rem' }}>
              Riposo
            </p>
            <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: '0.25rem 0' }}>
              {formatTime(restTimeLeft)}
            </p>
            <button
              onClick={onSkipRest}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Salta riposo
            </button>
          </div>
        )}

        {/* GRIGLIA ESERCIZI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
        }}>
          {exercises.map((exercise, index) => {
            const log = exerciseLogs[index];
            const completedSets = log?.sets?.filter(s => s.completed).length || 0;
            const totalSets = exercise.sets;
            const isComplete = completedSets >= totalSets;
            const isActive = activeExerciseIndex === index;
            const isInProgress = completedSets > 0 && !isComplete;

            return (
              <button
                key={index}
                onClick={() => setActiveExerciseIndex(isActive ? null : index)}
                style={{
                  padding: '1rem',
                  background: isActive
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : isComplete
                    ? '#2f855a'
                    : '#2d3748',
                  border: isActive
                    ? '2px solid #a78bfa'
                    : isInProgress
                    ? '2px solid #667eea'
                    : '2px solid transparent',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: isComplete && !isActive ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Indicatore stato */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>
                    {isComplete ? '✅' : isInProgress ? '🏋️' : '⚪'}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: isActive ? 'white' : '#a0aec0',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#4a5568',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 4,
                  }}>
                    {completedSets}/{totalSets}
                  </span>
                </div>

                {/* Nome esercizio */}
                <p style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {exercise.name}
                </p>

                {/* Dettagli */}
                <p style={{
                  color: isActive ? 'rgba(255,255,255,0.8)' : '#a0aec0',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0',
                }}>
                  {exercise.sets}x{exercise.reps} • {exercise.weight || '—'}kg
                </p>

                {/* Superset indicator */}
                {BETA_FLAGS.SUPERSET && exercise.supersetGroup && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    fontSize: '0.65rem',
                    background: '#ed8936',
                    color: 'white',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 4,
                  }}>
                    SUPERSET
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* PANNELLO ESERCIZIO ATTIVO */}
        <AnimatePresence>
          {activeExerciseIndex !== null && (() => {
            const exercise = exercises[activeExerciseIndex];
            const log = exerciseLogs[activeExerciseIndex];
            const completedSetsArr = log?.sets?.filter(s => s.completed) || [];
            const nextSetIndex = log?.sets?.findIndex(s => !s.completed) ?? 0;
            const allSetsComplete = completedSetsArr.length >= exercise.sets;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                  marginTop: '1.5rem',
                  background: '#2d3748',
                  borderRadius: 16,
                  padding: '1.5rem',
                  border: '2px solid #667eea',
                }}
              >
                {/* Header esercizio */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>
                      {exercise.name}
                    </h2>
                    <p style={{ color: '#a0aec0', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                      {exercise.sets} serie x {exercise.reps} reps
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveExerciseIndex(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a0aec0',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    x
                  </button>
                </div>

                {/* Serie completate */}
                {completedSetsArr.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: '#a0aec0', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Serie completate:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {completedSetsArr.map((set, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#48bb78',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                          }}
                        >
                          S{set.set_number}: {set.reps_completed}x{set.weight_used || 0}kg
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form per registrare serie */}
                {!allSetsComplete ? (
                  <>
                    <p style={{
                      color: '#667eea',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                    }}>
                      Serie {nextSetIndex + 1} di {exercise.sets}
                    </p>

                    {/* Input Reps */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ color: '#a0aec0', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                        Ripetizioni
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSetReps(prev => Math.max(0, prev - 1))}
                          style={{
                            width: 44,
                            height: 44,
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={setReps || ''}
                          onChange={(e) => setSetReps(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                          }}
                        />
                        <button
                          onClick={() => setSetReps(prev => prev + 1)}
                          style={{
                            width: 44,
                            height: 44,
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Input Peso */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ color: '#a0aec0', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                        Peso (kg)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSetWeight(prev => Math.max(0, prev - 2.5))}
                          style={{
                            width: 44,
                            height: 44,
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={setWeight || ''}
                          onChange={(e) => setSetWeight(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          step="0.5"
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                          }}
                        />
                        <button
                          onClick={() => setSetWeight(prev => prev + 2.5)}
                          style={{
                            width: 44,
                            height: 44,
                            background: '#4a5568',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Input RPE */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: '#a0aec0', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                        RPE (sforzo percepito): {setRpe}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={setRpe}
                        onChange={(e) => setSetRpe(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#718096', fontSize: '0.65rem' }}>
                        <span>Facile</span>
                        <span>Massimale</span>
                      </div>
                    </div>

                    {/* Bottone conferma */}
                    <button
                      onClick={() => handleCompleteSetFromGrid(activeExerciseIndex, nextSetIndex)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        border: 'none',
                        borderRadius: 12,
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Completa Serie {nextSetIndex + 1}
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎉</span>
                    <p style={{ color: '#48bb78', fontSize: '1rem', fontWeight: 600, margin: '0.5rem 0' }}>
                      Esercizio completato!
                    </p>
                    <button
                      onClick={() => setActiveExerciseIndex(null)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#4a5568',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Chiudi
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Check completamento totale */}
        {allComplete && (
          <button
            onClick={onFinishWorkout}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🏆 Completa Allenamento
          </button>
        )}
      </div>

      {/* Modal conferma uscita */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            background: '#2d3748',
            borderRadius: 16,
            padding: '1.5rem',
            maxWidth: 350,
            width: '100%',
          }}>
            <h3 style={{ color: 'white', margin: '0 0 1rem' }}>
              Terminare l'allenamento?
            </h3>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Hai completato {completedSetsCount} di {totalSetsCount} serie.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#4a5568',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Continua
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndWorkoutEarly();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e53e3e',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Termina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
