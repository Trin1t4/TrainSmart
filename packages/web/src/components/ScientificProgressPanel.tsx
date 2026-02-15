/**
 * SCIENTIFIC PROGRESS PANEL
 *
 * Database dei progressi scientifici basati su formule.
 * Mostra al cliente in modo chiaro che sta migliorando.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  Award,
  Target,
  ChevronDown,
  Info,
  Sparkles,
  BarChart3,
  Users,
  Zap,
  ArrowUpRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ScientificProgressPanelProps {
  userId: string;
  className?: string;
  userWeight?: number; // kg
  userGender?: 'M' | 'F';
}

interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  sets: number;
  created_at: string;
  rpe?: number;
}

// ============================================
// FORMULE SCIENTIFICHE PER IL CALCOLO 1RM — SSOT
// ============================================
import { calculateOneRM, estimate1RM } from '@trainsmart/shared';

// Wrapper per backward compatibility con il rendering dettagliato
function epleyFormula(weight: number, reps: number): number {
  const result = calculateOneRM({ weight, reps, formula: 'epley' });
  return result.estimated1RM;
}

function brzyckiFormula(weight: number, reps: number): number {
  const result = calculateOneRM({ weight, reps, formula: 'brzycki' });
  return result.estimated1RM;
}

function landerFormula(weight: number, reps: number): number {
  const result = calculateOneRM({ weight, reps, formula: 'lander' });
  return result.estimated1RM;
}

function averageE1RM(weight: number, reps: number): number {
  return Math.round(estimate1RM(weight, reps));
}

// Wilks Score (forza relativa al peso corporeo)
function calculateWilks(total: number, bodyWeight: number, isMale: boolean): number {
  // Coefficienti Wilks
  const maleCoeff = [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8];
  const femaleCoeff = [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];

  const coeff = isMale ? maleCoeff : femaleCoeff;
  const x = bodyWeight;

  const denominator = coeff[0] + coeff[1]*x + coeff[2]*x**2 + coeff[3]*x**3 + coeff[4]*x**4 + coeff[5]*x**5;

  if (denominator === 0) return 0;
  return Math.round((500 / denominator) * total * 100) / 100;
}

// DOTS Score (formula più moderna del Wilks)
function calculateDOTS(total: number, bodyWeight: number, isMale: boolean): number {
  const maleCoeff = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
  const femaleCoeff = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];

  const coeff = isMale ? maleCoeff : femaleCoeff;
  const x = bodyWeight;

  const denominator = coeff[0] + coeff[1]*x + coeff[2]*x**2 + coeff[3]*x**3 + coeff[4]*x**4;

  if (denominator === 0) return 0;
  return Math.round((500 / denominator) * total * 100) / 100;
}

// Classificazione forza rispetto alla popolazione
function getStrengthLevel(e1rm: number, bodyWeight: number, exercise: string): { level: string; percentile: number; color: string } {
  // Rapporti standard per esercizi principali (maschio medio)
  const standards: Record<string, { beginner: number; intermediate: number; advanced: number; elite: number }> = {
    'squat': { beginner: 0.75, intermediate: 1.25, advanced: 1.75, elite: 2.5 },
    'bench': { beginner: 0.5, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
    'deadlift': { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.75 },
    'press': { beginner: 0.35, intermediate: 0.65, advanced: 0.95, elite: 1.35 },
    'row': { beginner: 0.5, intermediate: 0.85, advanced: 1.2, elite: 1.6 },
    'default': { beginner: 0.5, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
  };

  const exerciseLower = exercise.toLowerCase();
  let standardKey = 'default';
  if (exerciseLower.includes('squat')) standardKey = 'squat';
  else if (exerciseLower.includes('bench') || exerciseLower.includes('panca')) standardKey = 'bench';
  else if (exerciseLower.includes('deadlift') || exerciseLower.includes('stacco')) standardKey = 'deadlift';
  else if (exerciseLower.includes('press') || exerciseLower.includes('military')) standardKey = 'press';
  else if (exerciseLower.includes('row') || exerciseLower.includes('rematore')) standardKey = 'row';

  const std = standards[standardKey];
  const ratio = e1rm / bodyWeight;

  if (ratio < std.beginner) {
    return { level: 'Fondamenta', percentile: Math.round((ratio / std.beginner) * 25), color: '#94a3b8' };
  } else if (ratio < std.intermediate) {
    const progress = (ratio - std.beginner) / (std.intermediate - std.beginner);
    return { level: 'Costruzione', percentile: Math.round(25 + progress * 25), color: '#22c55e' };
  } else if (ratio < std.advanced) {
    const progress = (ratio - std.intermediate) / (std.advanced - std.intermediate);
    return { level: 'Padronanza', percentile: Math.round(50 + progress * 25), color: '#3b82f6' };
  } else if (ratio < std.elite) {
    const progress = (ratio - std.advanced) / (std.elite - std.advanced);
    return { level: 'Elite', percentile: Math.round(75 + progress * 20), color: '#f59e0b' };
  } else {
    return { level: 'Campione', percentile: 99, color: '#ef4444' };
  }
}

// Calcola proiezione futura basata sul trend
function projectProgress(currentE1RM: number, weeklyGrowthRate: number, weeks: number): number {
  return Math.round(currentE1RM * Math.pow(1 + weeklyGrowthRate / 100, weeks));
}

export default function ScientificProgressPanel({
  userId,
  className = '',
  userWeight = 75,
  userGender = 'M'
}: ScientificProgressPanelProps) {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    loadWorkoutData();
  }, [userId]);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading workout data:', error);
        return;
      }

      setWorkoutLogs(data || []);

      // Auto-seleziona primo esercizio
      if (data && data.length > 0 && !selectedExercise) {
        const uniqueExercises = [...new Set(data.map(l => l.exercise_name))];
        setSelectedExercise(uniqueExercises[0] || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Esercizi unici
  const uniqueExercises = useMemo(() => {
    return [...new Set(workoutLogs.map(l => l.exercise_name))];
  }, [workoutLogs]);

  // Dati per esercizio selezionato
  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];

    const logs = workoutLogs
      .filter(l => l.exercise_name === selectedExercise)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    return logs.map(log => ({
      date: log.created_at.split('T')[0],
      formattedDate: new Date(log.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      weight: log.weight,
      reps: log.reps,
      e1rm_epley: Math.round(epleyFormula(log.weight, log.reps)),
      e1rm_brzycki: Math.round(brzyckiFormula(log.weight, log.reps)),
      e1rm_lander: Math.round(landerFormula(log.weight, log.reps)),
      e1rm_avg: averageE1RM(log.weight, log.reps),
      volume: log.weight * log.reps * log.sets,
    }));
  }, [workoutLogs, selectedExercise]);

  // Statistiche scientifiche
  const scientificStats = useMemo(() => {
    if (exerciseData.length < 2) return null;

    const current = exerciseData[exerciseData.length - 1];
    const first = exerciseData[0];
    const isMale = userGender === 'M';

    // Progresso E1RM
    const e1rmProgress = current.e1rm_avg - first.e1rm_avg;
    const e1rmProgressPercent = ((e1rmProgress / first.e1rm_avg) * 100).toFixed(1);

    // Calcola rate di crescita settimanale
    const daysDiff = (new Date(current.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    const weeksDiff = Math.max(daysDiff / 7, 1);
    const weeklyGrowthRate = (e1rmProgress / first.e1rm_avg * 100) / weeksDiff;

    // Wilks e DOTS
    const wilksScore = calculateWilks(current.e1rm_avg, userWeight, isMale);
    const dotsScore = calculateDOTS(current.e1rm_avg, userWeight, isMale);

    // Livello forza
    const strengthLevel = getStrengthLevel(current.e1rm_avg, userWeight, selectedExercise);

    // Proiezioni future
    const projection4w = projectProgress(current.e1rm_avg, weeklyGrowthRate, 4);
    const projection12w = projectProgress(current.e1rm_avg, weeklyGrowthRate, 12);

    // Volume trend
    const volumes = exerciseData.map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, volumes.length);
    const volumeTrend = ((recentVolume - avgVolume) / avgVolume * 100).toFixed(1);

    return {
      current: {
        e1rm: current.e1rm_avg,
        weight: current.weight,
        reps: current.reps,
        e1rm_epley: current.e1rm_epley,
        e1rm_brzycki: current.e1rm_brzycki,
        e1rm_lander: current.e1rm_lander,
      },
      progress: {
        absolute: e1rmProgress,
        percent: e1rmProgressPercent,
        weeklyRate: weeklyGrowthRate.toFixed(2),
        weeksDiff: Math.round(weeksDiff),
      },
      relativeStrength: {
        wilks: wilksScore,
        dots: dotsScore,
        ratio: (current.e1rm_avg / userWeight).toFixed(2),
      },
      strengthLevel,
      projections: {
        weeks4: projection4w,
        weeks12: projection12w,
      },
      volume: {
        trend: volumeTrend,
        isIncreasing: recentVolume > avgVolume,
      },
    };
  }, [exerciseData, userWeight, userGender, selectedExercise]);

  // Radar chart data per confronto formule
  const radarData = useMemo(() => {
    if (!scientificStats) return [];

    return [
      { formula: 'Epley', value: scientificStats.current.e1rm_epley },
      { formula: 'Brzycki', value: scientificStats.current.e1rm_brzycki },
      { formula: 'Lander', value: scientificStats.current.e1rm_lander },
      { formula: 'Media', value: scientificStats.current.e1rm },
    ];
  }, [scientificStats]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  const hasNoData = workoutLogs.length === 0;

  return (
    <div className={`bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl overflow-hidden border border-slate-700/50 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Database Progressi Scientifici</h3>
            <p className="text-xs text-slate-400">Formule e metriche per capire i tuoi miglioramenti</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              {hasNoData ? (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Nessun dato disponibile</p>
                  <p className="text-sm text-slate-500">Completa i tuoi allenamenti per vedere le analisi scientifiche</p>
                </div>
              ) : (
                <>
                  {/* Exercise Selector */}
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-2 block">Seleziona esercizio:</label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueExercises.map(ex => (
                        <button
                          key={ex}
                          onClick={() => setSelectedExercise(ex)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedExercise === ex
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-700/50 text-slate-400 hover:text-white'
                          }`}
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>

                  {scientificStats ? (
                    <>
                      {/* Current Status */}
                      <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-400" />
                          Stato Attuale - {selectedExercise}
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-white">{scientificStats.current.e1rm}</p>
                            <p className="text-xs text-slate-400">E1RM (kg)</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-amber-400">+{scientificStats.progress.percent}%</p>
                            <p className="text-xs text-slate-400">Progresso totale</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-emerald-400">{scientificStats.progress.weeklyRate}%</p>
                            <p className="text-xs text-slate-400">Crescita/settimana</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold" style={{ color: scientificStats.strengthLevel.color }}>
                              {scientificStats.strengthLevel.level}
                            </p>
                            <p className="text-xs text-slate-400">Top {100 - scientificStats.strengthLevel.percentile}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Formula Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Formule 1RM */}
                        <div className="bg-slate-700/30 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Formule 1RM a Confronto
                          </h4>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">Epley</p>
                                <p className="text-xs text-slate-500">Peso × (1 + Reps/30)</p>
                              </div>
                              <p className="text-lg font-bold text-blue-400">{scientificStats.current.e1rm_epley} kg</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">Brzycki</p>
                                <p className="text-xs text-slate-500">Peso × 36/(37-Reps)</p>
                              </div>
                              <p className="text-lg font-bold text-purple-400">{scientificStats.current.e1rm_brzycki} kg</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">Lander</p>
                                <p className="text-xs text-slate-500">100×Peso/(101.3-2.67×Reps)</p>
                              </div>
                              <p className="text-lg font-bold text-emerald-400">{scientificStats.current.e1rm_lander} kg</p>
                            </div>
                            <div className="border-t border-slate-600 pt-2 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-white">Media Ponderata</p>
                                <p className="text-xs text-slate-500">Più accurata per range 3-10 reps</p>
                              </div>
                              <p className="text-xl font-bold text-amber-400">{scientificStats.current.e1rm} kg</p>
                            </div>
                          </div>
                        </div>

                        {/* Forza Relativa */}
                        <div className="bg-slate-700/30 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            Forza Relativa al Peso Corporeo
                          </h4>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">Rapporto Peso/BW</p>
                                <p className="text-xs text-slate-500">E1RM ÷ Peso corporeo</p>
                              </div>
                              <p className="text-lg font-bold text-white">{scientificStats.relativeStrength.ratio}x</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">Wilks Score</p>
                                <p className="text-xs text-slate-500">Standard powerlifting</p>
                              </div>
                              <p className="text-lg font-bold text-amber-400">{scientificStats.relativeStrength.wilks}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-white">DOTS Score</p>
                                <p className="text-xs text-slate-500">Formula moderna IPF</p>
                              </div>
                              <p className="text-lg font-bold text-emerald-400">{scientificStats.relativeStrength.dots}</p>
                            </div>

                            {/* Strength Level Bar */}
                            <div className="pt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Livello popolazione</span>
                                <span style={{ color: scientificStats.strengthLevel.color }}>
                                  {scientificStats.strengthLevel.level}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${scientificStats.strengthLevel.percentile}%`,
                                    backgroundColor: scientificStats.strengthLevel.color
                                  }}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Sei più forte del {scientificStats.strengthLevel.percentile}% della popolazione
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Projections */}
                      <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 rounded-xl p-4 mb-4 border border-emerald-500/20">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          Proiezioni Future (al ritmo attuale)
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-xs text-slate-400">Tra 4 settimane</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{scientificStats.projections.weeks4} kg</p>
                            <p className="text-xs text-emerald-300/60">
                              +{scientificStats.projections.weeks4 - scientificStats.current.e1rm} kg previsti
                            </p>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-xs text-slate-400">Tra 12 settimane</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{scientificStats.projections.weeks12} kg</p>
                            <p className="text-xs text-blue-300/60">
                              +{scientificStats.projections.weeks12 - scientificStats.current.e1rm} kg previsti
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-3 text-center">
                          Basato sul tuo rate di crescita di {scientificStats.progress.weeklyRate}% a settimana
                        </p>
                      </div>

                      {/* E1RM Progress Chart */}
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Progressione E1RM nel Tempo
                        </h4>

                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={exerciseData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis
                                dataKey="formattedDate"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                              />
                              <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                domain={['dataMin - 5', 'dataMax + 5']}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1e293b',
                                  border: '1px solid #334155',
                                  borderRadius: '8px',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="e1rm_avg"
                                name="E1RM"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ fill: '#f59e0b', r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="weight"
                                name="Peso usato"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-white font-medium">Stai migliorando!</p>
                            <p className="text-xs text-slate-400 mt-1">
                              In {scientificStats.progress.weeksDiff} settimane hai aumentato il tuo E1RM su {selectedExercise} di{' '}
                              <span className="text-emerald-400 font-medium">+{scientificStats.progress.absolute} kg</span>{' '}
                              ({scientificStats.progress.percent}%). Continua così!
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Info className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">Seleziona un esercizio con almeno 2 sessioni registrate</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
