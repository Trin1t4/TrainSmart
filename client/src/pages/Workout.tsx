import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, Info, AlertCircle } from 'lucide-react';
import { RecoveryScreening, RecoveryData } from '../components/RecoveryScreening';

export default function Workout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);

  const [showRecoveryScreening, setShowRecoveryScreening] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  useEffect(() => {
    loadProgram();
  }, []);

  async function loadProgram() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading program:', error);
        return;
      }

      setProgram(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStartWorkout() {
    setShowRecoveryScreening(true);
  }

  async function handleRecoveryComplete(data: RecoveryData) {
    setRecoveryData(data);
    setShowRecoveryScreening(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calcola adjustment AdaptFlow in base ai dati di recupero
      const adjustment = calculateAdaptiveAdjustment(data);

      // Naviga a sessione allenamento con adjustment
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
      alert('Errore nel caricamento della sessione. Riprova.');
    }
  }

  function calculateAdaptiveAdjustment(recovery: RecoveryData) {
    let volumeMultiplier = 1.0;
    let intensityMultiplier = 1.0;
    const skipExercises: string[] = [];
    const warnings: string[] = [];

    // Sonno insufficiente
    if (recovery.sleepHours < 6) {
      volumeMultiplier = 0.8;
      warnings.push('Sonno insufficiente: volume ridotto 20%');
    }
    if (recovery.sleepHours < 5) {
      volumeMultiplier = 0.7;
      intensityMultiplier = 0.9;
      warnings.push('Sonno molto insufficiente: volume -30%, intensità -10%');
    }

    // Stress elevato
    if (recovery.stressLevel >= 8) {
      intensityMultiplier = 0.8;
      volumeMultiplier = 0.85;
      warnings.push('Stress elevato: intensità -20%, volume -15%');
    } else if (recovery.stressLevel >= 6) {
      intensityMultiplier = 0.9;
      warnings.push('Stress moderato: intensità -10%');
    }

    // Dolori/fastidi
    if (recovery.hasInjury && recovery.injuryDetails) {
      volumeMultiplier *= 0.85;
      intensityMultiplier *= 0.85;
      warnings.push(`Dolore rilevato (${recovery.injuryDetails}): riduzione 15%`);

      // Logica per saltare esercizi in base al tipo di dolore
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

    // Fase ciclo luteale (più fatica, performance ridotta)
    if (recovery.isFemale && recovery.menstrualCycle === 'luteal') {
      volumeMultiplier *= 0.9;
      warnings.push('Fase luteale: volume -10% (può aumentare percezione di fatica)');
    }

    // Fase mestruazione (maggior flessibilità)
    if (recovery.isFemale && recovery.menstrualCycle === 'menstruation') {
      volumeMultiplier *= 0.8;
      warnings.push('Fase mestruazione: volume -20% (adatta agli eventuali sintomi)');
    }

    return {
      volumeMultiplier: Math.max(0.6, volumeMultiplier),
      intensityMultiplier: Math.max(0.7, intensityMultiplier),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Caricamento programma...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Nessun Programma Trovato</h2>
            <p className="text-gray-300 mb-6">Non hai ancora un programma attivo.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Torna alla Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todayWorkout = program.weekly_schedule[currentDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            {program.name}
          </h1>
          <p className="text-gray-400 text-lg">{program.description}</p>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
          {program.weekly_schedule.map((day, index) => (
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

        {/* Today's Workout */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            {todayWorkout.dayName}
          </h2>

          {todayWorkout.exercises.map((exercise, index) => (
            <div key={index}>
              {exercise.type === 'giant_set' ? (
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-400">
                        {exercise.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {exercise.rounds} giri • {exercise.restBetweenRounds}s recupero tra i giri
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {exercise.exercises?.map((subEx, subIdx) => (
                      <div
                        key={subIdx}
                        className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-emerald-500"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white text-lg">
                            {subIdx + 1}. {subEx.name}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {subEx.reps} reps
                          </span>
                        </div>
                        {subEx.notes && (
                          <p className="text-sm text-gray-400 mb-2">{subEx.notes}</p>
                        )}
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
                <div className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {exercise.name}
                      </h3>
                      {exercise.notes && (
                        <p className="text-gray-400 text-sm">{exercise.notes}</p>
                      )}
                    </div>
                    {exercise.weight && (
                      <div className="bg-emerald-500/20 px-4 py-2 rounded-lg">
                        <span className="text-emerald-400 font-bold text-lg">
                          {exercise.weight}kg
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Serie</p>
                      <p className="text-white font-bold text-xl">{exercise.sets}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Ripetizioni</p>
                      <p className="text-white font-bold text-xl">{exercise.reps}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Recupero</p>
                      <p className="text-white font-bold text-xl">{exercise.rest}s</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            Torna alla Dashboard
          </button>
          <button
            onClick={handleStartWorkout}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/50"
          >
            Inizia Allenamento
          </button>
        </div>
      </div>

      {/* Recovery Screening Modal */}
      {showRecoveryScreening && (
        <RecoveryScreening
          onComplete={handleRecoveryComplete}
          onSkip={() => {
            setShowRecoveryScreening(false);
            // Inizia allenamento senza screening
            handleRecoveryComplete({
              sleepHours: 7,
              stressLevel: 5,
              hasInjury: false,
              injuryDetails: null,
              menstrualCycle: null,
              isFemale: false,
              timestamp: new Date().toISOString(),
            });
          }}
        />
      )}
    </div>
  );
}
