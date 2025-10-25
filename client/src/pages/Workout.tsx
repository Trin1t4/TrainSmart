import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Workout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);

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
            <div
              key={index}
              className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all"
            >
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
          <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/50">
            Inizia Allenamento
          </button>
        </div>
      </div>
    </div>
  );
}