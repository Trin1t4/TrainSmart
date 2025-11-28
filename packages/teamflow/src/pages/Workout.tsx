import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { X, Info, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { RecoveryScreening } from '../pages/RecoveryScreening';
import type { RecoveryData } from '../pages/RecoveryScreening';
import { useTranslation } from '../lib/i18n';
import { getAlternativesWithParams, hasAlternatives, type ExerciseAlternative, type SuggestedParams } from '@fitnessflow/shared';

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

  useEffect(() => {
    loadProgram();
  }, []);

  async function loadProgram() {
    try {
      // ✅ PRIORITIZE SUPABASE: Try cloud data first if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        console.log('[WORKOUT] User authenticated, loading from Supabase...');
        const { data, error } = await supabase
          .from('training_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)  // ✅ FIX: is_active (boolean), not 'status'
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          console.log('[WORKOUT] ✅ Loaded from Supabase:', data.id);

          // ✅ FIX: Convert Supabase format (weekly_split) → Workout format (weekly_schedule)
          if (data.weekly_split?.days?.length > 0) {
            const formattedProgram = {
              name: data.name || 'Il Tuo Programma',
              description: data.notes || '',
              weekly_schedule: data.weekly_split.days.map((day: any) => ({
                dayName: day.dayName || day.name || 'Workout',
                exercises: (day.exercises || [])
                  .filter((ex: any) => ex && ex.name && ex.pattern) // ✅ Filter undefined
                  .map((ex: any) => ({
                    name: ex.name,
                    sets: ex.sets || 3,
                    reps: ex.reps?.toString() || '10',
                    rest: parseRestToSeconds(ex.rest) || 90,
                    notes: ex.notes || '',
                    type: 'standard',
                    intensity: ex.intensity,
                    baseline: ex.baseline
                  }))
              }))
            };
            setProgram(formattedProgram);
          } else {
            // Fallback: Old format without weekly_split
            setProgram({
              name: data.name || 'Il Tuo Programma',
              description: data.notes || '',
              weekly_schedule: generateWeeklySchedule(data)
            });
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

        // Converti formato Dashboard -> formato Workout
        const formattedProgram = {
          name: parsedProgram.name || 'Il Tuo Programma',
          description: parsedProgram.notes || '',
          weekly_schedule: generateWeeklySchedule(parsedProgram)
        };

        setProgram(formattedProgram);
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

  function generateWeeklySchedule(dashboardProgram: any) {
    // Genera una schedule settimanale basata sui dati del Dashboard
    const daysPerWeek = dashboardProgram.frequency || 3;
    const exercises = dashboardProgram.exercises || [];

    const schedule = [];

    for (let i = 0; i < daysPerWeek; i++) {
      const dayName = dashboardProgram.split === 'FULL BODY'
        ? `Full Body ${i + 1}`
        : dashboardProgram.split === 'UPPER/LOWER'
        ? (i % 2 === 0 ? 'Upper Body' : 'Lower Body')
        : `Day ${i + 1}`;

      // ✅ FIX CRITICO: Filter out null/undefined BEFORE mapping
      const validExercises = exercises
        .filter((ex: any) => ex !== null && ex !== undefined)
        .map((ex: any) => {
          // ✅ Gestione NUOVO formato oggetti da Dashboard.tsx (baseline-aware)
          if (typeof ex === 'object' && ex.name) {
            // Nuovo formato: oggetto con { name, sets, reps, rest, intensity, notes, baseline }
            return {
              name: ex.name,
              sets: ex.sets || 3,
              reps: ex.reps?.toString() || '10',
              rest: parseRestToSeconds(ex.rest) || 90,
              notes: ex.notes || '',
              type: 'standard',
              intensity: ex.intensity,
              baseline: ex.baseline
            };
          } else if (typeof ex === 'string') {
            // Vecchio formato: stringa "Exercise: 3x12-15"
            const parts = ex.split(':');
            const name = parts[0].trim();
            const setsReps = parts[1]?.trim() || '3x10';
            const [sets, reps] = setsReps.split('x');

            return {
              name: name,
              sets: parseInt(sets) || 3,
              reps: reps || '10',
              rest: 90,
              notes: '',
              type: 'standard'
            };
          } else {
            // Should not reach here after filter, but safety fallback
            return null;
          }
        })
        .filter((ex: any) => ex !== null); // ✅ Remove any nulls from unknown formats

      schedule.push({
        dayName: dayName,
        exercises: validExercises
      });
    }

    return schedule;
  }

  // Helper: converte rest da formato "2-3min" o "90s" a secondi
  function parseRestToSeconds(rest: string | number): number {
    if (typeof rest === 'number') return rest;
    if (!rest) return 90;

    // Formato: "2-3min" → prendi valore medio
    if (rest.includes('-') && rest.includes('min')) {
      const [min, max] = rest.replace('min', '').split('-').map(s => parseInt(s.trim()));
      return ((min + max) / 2) * 60;
    }

    // Formato: "90s" → rimuovi 's'
    if (rest.includes('s')) {
      return parseInt(rest.replace('s', ''));
    }

    // Formato: "2min" → converti a secondi
    if (rest.includes('min')) {
      return parseInt(rest.replace('min', '')) * 60;
    }

    // Default
    return 90;
  }

  function handleStartWorkout() {
    setShowRecoveryScreening(true);
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
    const skipExercises: string[] = [];
    const warnings: string[] = [];

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

console.log("📊 MULTIPLIER:", { volumeMultiplier, intensityMultiplier });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            {program.name}
          </h1>
          <p className="text-gray-400 text-lg">{program.description}</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
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
          <h2 className="text-3xl font-bold text-white mb-6">{todayWorkout.dayName}</h2>

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
                <div className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Serie</p>
                      <p className="text-white font-bold text-xl">{exercise.sets}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Ripetizioni</p>
                      <p className="text-white font-bold text-xl">
                        {getSubstitutedReps(exercise.name, exercise.reps)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-1">Recupero</p>
                      <p className="text-white font-bold text-xl">{exercise.rest}s</p>
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

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            {t('dashboard.back_to_dashboard')}
          </button>
          <button
            onClick={handleStartWorkout}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/50"
          >
            {t('dashboard.start_workout')}
          </button>
        </div>
      </div>

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
              isFemale: false,
              timestamp: new Date().toISOString(),
            });
          }}
        />
      )}
    </div>
  );
}
