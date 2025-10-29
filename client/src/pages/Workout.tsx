import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, Info, AlertCircle } from 'lucide-react';

export default function Workout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  
  // ✅ Pre-Workout Screening State
  const [showScreening, setShowScreening] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [painAreas, setPainAreas] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(0);

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

      // Carica il programma attivo
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

  // ✅ Handler Inizia Allenamento
  function handleStartWorkout() {
    setShowScreening(true);
  }

  // ✅ Submit Screening e Inizia
  async function handleScreeningSubmit() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const screening = {
        user_id: user.id,
        program_id: program.id,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        pain_areas: painAreas,
        pain_level: painLevel,
        timestamp: new Date().toISOString()
      };

      // Salva screening
      await supabase.from('pre_workout_screenings').insert(screening);

      // Calcola adjustment AdaptFlow
      const adjustment = calculateAdaptiveAdjustment(screening);

      // Naviga a sessione allenamento con adjustment
      navigate('/workout-session', {
        state: {
          program,
          dayIndex: currentDay,
          adjustment
        }
      });
    } catch (error) {
      console.error('Error saving screening:', error);
      alert('Errore nel salvare lo screening. Riprova.');
    }
  }

  // ✅ AdaptFlow Logic
  function calculateAdaptiveAdjustment(screening: any) {
    let volumeMultiplier = 1.0;
    let intensityMultiplier = 1.0;
    const skipExercises: string[] = [];

    // Sonno < 6h → riduci volume 20%
    if (screening.sleep_hours < 6) {
      volumeMultiplier = 0.8;
    } else if (screening.sleep_hours < 5) {
      volumeMultiplier = 0.7;
      intensityMultiplier = 0.9;
    }

    // Stress alto (4-5) → riduci intensità 10-20%
    if (screening.stress_level >= 4) {
      intensityMultiplier = 0.9;
    }
    if (screening.stress_level >= 5) {
      intensityMultiplier = 0.8;
      volumeMultiplier = 0.9;
    }

    // Dolore > 5/10 → riduci entrambi 30%
    if (screening.pain_level > 5 && screening.pain_areas.length > 0) {
      volumeMultiplier = 0.7;
      intensityMultiplier = 0.7;

      // Identifica esercizi da saltare
      screening.pain_areas.forEach((area: string) => {
        if (area === 'shoulder') {
          skipExercises.push('Military Press', 'Shoulder Press', 'Alzate');
        }
        if (area === 'lower_back') {
          skipExercises.push('Stacco', 'Deadlift', 'Good Morning');
        }
        if (area === 'knee') {
          skipExercises.push('Squat', 'Leg Press', 'Lunge');
        }
      });
    }

    return {
      volumeMultiplier,
      intensityMultiplier,
      skipExercises,
      recommendation: getRecommendation(volumeMultiplier, intensityMultiplier)
    };
  }

  function getRecommendation(volume: number, intensity: number): string {
    if (volume < 0.8 || intensity < 0.8) {
      return 'Seduta leggera - Recupero attivo consigliato';
    }
    if (volume < 0.9 || intensity < 0.9) {
      return 'Seduta moderata - Ascolta il tuo corpo';
    }
    return 'Seduta normale - Vai forte! 💪';
  }

  // ✅ Toggle Pain Area
  function togglePainArea(area: string) {
    setPainAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
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
              {/* ✅ CHECK GIANT SET */}
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

                  {/* ✅ ESERCIZI DEL GIANT SET */}
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

                  {/* ✅ NOTE TOTALI GIANT SET */}
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
                /* ✅ ESERCIZIO NORMALE */
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

      {/* ✅ PRE-WORKOUT SCREENING MODAL */}
      {showScreening && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-white">Check Pre-Allenamento</h2>
              <button
                onClick={() => setShowScreening(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sonno */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Ore di sonno stanotte
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-emerald-400 font-bold text-2xl w-16 text-center">
                    {sleepHours}h
                  </span>
                </div>
                {sleepHours < 6 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ Sonno insufficiente - Ridurremo il volume dell'allenamento
                  </p>
                )}
              </div>

              {/* Stress */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Livello di stress (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setStressLevel(level)}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        stressLevel === level
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {stressLevel >= 4 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ Stress elevato - Ridurremo l'intensità dell'allenamento
                  </p>
                )}
              </div>

              {/* Dolori */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Hai dolori o fastidi oggi?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['shoulder', 'lower_back', 'knee', 'elbow', 'wrist', 'ankle'].map((area) => (
                    <button
                      key={area}
                      onClick={() => togglePainArea(area)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        painAreas.includes(area)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {area === 'shoulder' && '🦾 Spalle'}
                      {area === 'lower_back' && '💢 Schiena bassa'}
                      {area === 'knee' && '🦵 Ginocchia'}
                      {area === 'elbow' && '💪 Gomiti'}
                      {area === 'wrist' && '🤝 Polsi'}
                      {area === 'ankle' && '🦶 Caviglie'}
                    </button>
                  ))}
                </div>

                {painAreas.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-white font-semibold mb-2">
                      Intensità dolore (1-10)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={painLevel}
                        onChange={(e) => setPainLevel(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className={`font-bold text-2xl w-16 text-center ${
                        painLevel > 5 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {painLevel}/10
                      </span>
                    </div>
                    {painLevel > 5 && (
                      <p className="text-red-400 text-sm mt-2">
                        ⚠️ Dolore significativo - Salteremo gli esercizi problematici e ridurremo il carico
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pulsante Inizia */}
              <button
                onClick={handleScreeningSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg"
              >
                Conferma e Inizia Allenamento →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
