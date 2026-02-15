/**
 * ALL TIME PERSONAL RECORDS
 *
 * Vista riassuntiva di TUTTI gli 1RM dell'utente.
 * Mostra in un colpo solo tutti i PR per capire i miglioramenti.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Dumbbell, ChevronDown, Award, Target } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AllTimePersonalRecordsProps {
  userId: string;
  className?: string;
}

interface WorkoutLog {
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  created_at: string;
}

interface ExercisePR {
  exercise: string;
  currentE1RM: number;
  firstE1RM: number;
  maxE1RM: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  totalSessions: number;
}

// Calcola E1RM — delegato al SSOT (oneRepMaxCalculator)
import { estimate1RM } from '@trainsmart/shared';
function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) reps = 12;
  return Math.round(estimate1RM(weight, reps));
}

// Pattern per raggruppare esercizi simili
function normalizeExerciseName(name: string): string {
  const lower = name.toLowerCase();

  // Squat variants
  if (lower.includes('squat') || lower.includes('accosciata')) {
    if (lower.includes('front') || lower.includes('frontale')) return 'Front Squat';
    if (lower.includes('goblet')) return 'Goblet Squat';
    return 'Back Squat';
  }

  // Bench variants
  if (lower.includes('bench') || lower.includes('panca')) {
    if (lower.includes('incline') || lower.includes('inclinata')) return 'Panca Inclinata';
    return 'Panca Piana';
  }

  // Deadlift variants
  if (lower.includes('deadlift') || lower.includes('stacco')) {
    if (lower.includes('romanian') || lower.includes('rumeno') || lower.includes('rdl')) return 'Stacco Rumeno';
    if (lower.includes('sumo')) return 'Stacco Sumo';
    return 'Stacco da Terra';
  }

  // Press variants
  if (lower.includes('overhead') || lower.includes('military') || lower.includes('lento avanti') || lower.includes('shoulder press')) {
    return 'Lento Avanti';
  }

  // Rows
  if (lower.includes('row') || lower.includes('rematore')) {
    return 'Rematore';
  }

  // Pull-ups
  if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('trazioni')) {
    return 'Trazioni';
  }

  return name;
}

export default function AllTimePersonalRecords({ userId, className = '' }: AllTimePersonalRecordsProps) {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'e1rm' | 'change'>('e1rm');

  useEffect(() => {
    loadWorkoutData();
  }, [userId]);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      // Query exercise_logs with join to workout_logs for user filtering
      const { data, error } = await supabase
        .from('exercise_logs')
        .select(`
          id,
          exercise_name,
          weight_used,
          reps_completed,
          created_at,
          workout_log_id,
          workout_logs!inner(user_id)
        `)
        .eq('workout_logs.user_id', userId)
        .gt('weight_used', 0)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading workout data:', error);
        return;
      }

      // Map to expected format
      const mapped = (data || []).map((log: any) => ({
        id: log.id,
        exercise_name: log.exercise_name,
        weight: log.weight_used,
        reps: log.reps_completed,
        created_at: log.created_at
      }));

      setWorkoutLogs(mapped);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcola tutti i PR per esercizio
  const exercisePRs = useMemo(() => {
    if (workoutLogs.length === 0) return [];

    // Raggruppa per esercizio normalizzato
    const byExercise = new Map<string, WorkoutLog[]>();

    workoutLogs.forEach(log => {
      const normalized = normalizeExerciseName(log.exercise_name);
      if (!byExercise.has(normalized)) {
        byExercise.set(normalized, []);
      }
      byExercise.get(normalized)!.push(log);
    });

    const prs: ExercisePR[] = [];

    byExercise.forEach((logs, exercise) => {
      if (logs.length === 0) return;

      // Ordina per data
      const sorted = logs.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Calcola E1RM per ogni log
      const e1rms = sorted.map(log => ({
        e1rm: calculateE1RM(log.weight, log.reps),
        date: log.created_at
      }));

      const firstE1RM = e1rms[0].e1rm;
      const currentE1RM = e1rms[e1rms.length - 1].e1rm;
      const maxE1RM = Math.max(...e1rms.map(e => e.e1rm));

      const change = currentE1RM - firstE1RM;
      const changePercent = firstE1RM > 0 ? (change / firstE1RM) * 100 : 0;

      prs.push({
        exercise,
        currentE1RM,
        firstE1RM,
        maxE1RM,
        change,
        changePercent: Math.round(changePercent * 10) / 10,
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
        lastUpdated: e1rms[e1rms.length - 1].date,
        totalSessions: logs.length
      });
    });

    // Ordina
    return prs.sort((a, b) => {
      if (sortBy === 'name') return a.exercise.localeCompare(b.exercise);
      if (sortBy === 'e1rm') return b.currentE1RM - a.currentE1RM;
      return b.changePercent - a.changePercent;
    });
  }, [workoutLogs, sortBy]);

  // Statistiche globali
  const globalStats = useMemo(() => {
    if (exercisePRs.length === 0) return null;

    const totalE1RM = exercisePRs.reduce((sum, pr) => sum + pr.currentE1RM, 0);
    const avgChange = exercisePRs.reduce((sum, pr) => sum + pr.changePercent, 0) / exercisePRs.length;
    const improving = exercisePRs.filter(pr => pr.trend === 'up').length;
    const declining = exercisePRs.filter(pr => pr.trend === 'down').length;

    return {
      totalE1RM,
      avgChange: Math.round(avgChange * 10) / 10,
      improving,
      declining,
      stable: exercisePRs.length - improving - declining
    };
  }, [exercisePRs]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasNoData = exercisePRs.length === 0;

  return (
    <div className={`bg-gradient-to-br from-amber-900/30 to-orange-900/20 rounded-xl overflow-hidden border border-amber-700/30 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Tutti i Tuoi 1RM</h3>
            <p className="text-xs text-slate-400">Personal Records per ogni esercizio</p>
          </div>
          {globalStats && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">
              {exercisePRs.length} esercizi
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          {hasNoData ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Nessun dato disponibile</p>
              <p className="text-sm text-slate-500">Completa i tuoi allenamenti per vedere i PR</p>
            </div>
          ) : (
            <>
              {/* Global Stats */}
              {globalStats && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{globalStats.totalE1RM}</p>
                    <p className="text-xs text-slate-400">Totale E1RM</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${globalStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {globalStats.avgChange >= 0 ? '+' : ''}{globalStats.avgChange}%
                    </p>
                    <p className="text-xs text-slate-400">Media Δ</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{globalStats.improving}</p>
                    <p className="text-xs text-slate-400">In crescita</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-400">{globalStats.stable}</p>
                    <p className="text-xs text-slate-400">Stabili</p>
                  </div>
                </div>
              )}

              {/* Sort Controls */}
              <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 mb-4 w-fit">
                {[
                  { key: 'e1rm', label: 'Per Forza' },
                  { key: 'change', label: 'Per Progresso' },
                  { key: 'name', label: 'A-Z' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as typeof sortBy)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      sortBy === key
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* PR Table */}
              <div className="space-y-2">
                {exercisePRs.map((pr, index) => (
                  <motion.div
                    key={pr.exercise}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Exercise Name & Sessions */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        pr.trend === 'up' ? 'bg-emerald-500/20' :
                        pr.trend === 'down' ? 'bg-red-500/20' : 'bg-slate-600/50'
                      }`}>
                        {index === 0 && sortBy === 'e1rm' ? (
                          <Trophy className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Dumbbell className={`w-5 h-5 ${
                            pr.trend === 'up' ? 'text-emerald-400' :
                            pr.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{pr.exercise}</p>
                        <p className="text-xs text-slate-500">{pr.totalSessions} sessioni</p>
                      </div>
                    </div>

                    {/* Current E1RM */}
                    <div className="text-right mr-4">
                      <p className="text-xl font-bold text-white">{pr.currentE1RM} <span className="text-sm text-slate-400">kg</span></p>
                      <p className="text-xs text-slate-500">E1RM attuale</p>
                    </div>

                    {/* Change */}
                    <div className={`flex items-center gap-1 min-w-[80px] justify-end ${
                      pr.trend === 'up' ? 'text-emerald-400' :
                      pr.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {pr.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {pr.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {pr.trend === 'stable' && <Minus className="w-4 h-4" />}
                      <div className="text-right">
                        <p className="font-medium">
                          {pr.change >= 0 ? '+' : ''}{pr.change} kg
                        </p>
                        <p className="text-xs opacity-70">
                          {pr.changePercent >= 0 ? '+' : ''}{pr.changePercent}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>In crescita (&gt;2kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-slate-400" />
                  <span>Stabile (±2kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span>In calo (&gt;2kg)</span>
                </div>
              </div>

              {/* Formula Note */}
              <div className="mt-3 p-2 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-400">E1RM</strong> = 1 Rep Max stimato (formula Epley: Peso × (1 + Reps/30))
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
