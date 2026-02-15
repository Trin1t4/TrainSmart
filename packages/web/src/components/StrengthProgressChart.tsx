/**
 * STRENGTH PROGRESS CHART
 *
 * Grafico dedicato SOLO alla progressione di forza/volume.
 * Mostra: carico, volume, E1RM stimato nel tempo.
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
  ComposedChart,
  Bar,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Dumbbell, ChevronDown, Target, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface StrengthProgressChartProps {
  userId: string;
  className?: string;
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

interface AggregatedProgressData {
  date: string;
  formattedDate: string;
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  avgE1RM: number;
  totalSets: number;
  totalReps: number;
}

// Calcola E1RM — delegato al SSOT (oneRepMaxCalculator)
import { estimate1RM } from '@trainsmart/shared';
function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) reps = 12; // Limita per precisione
  return estimate1RM(weight, reps);
}

// Calcola volume (peso x reps x sets)
function calculateVolume(weight: number, reps: number, sets: number): number {
  return weight * reps * sets;
}

export default function StrengthProgressChart({ userId, className = '' }: StrengthProgressChartProps) {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'volume' | 'strength' | 'combined'>('combined');

  useEffect(() => {
    loadWorkoutData();
  }, [userId, timeRange]);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading workout data:', error);
        return;
      }

      setWorkoutLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggrega dati per data
  const aggregatedData = useMemo(() => {
    if (workoutLogs.length === 0) return [];

    const byDate = new Map<string, WorkoutLog[]>();
    workoutLogs.forEach(log => {
      const date = log.created_at?.split('T')[0] || '';
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(log);
    });

    const result: AggregatedProgressData[] = [];
    byDate.forEach((logs, date) => {
      let totalVolume = 0;
      let totalWeight = 0;
      let maxWeight = 0;
      let totalE1RM = 0;
      let totalSets = 0;
      let totalReps = 0;

      logs.forEach(log => {
        const weight = log.weight || 0;
        const reps = log.reps || 0;
        const sets = log.sets || 1;

        totalVolume += calculateVolume(weight, reps, sets);
        totalWeight += weight;
        maxWeight = Math.max(maxWeight, weight);
        totalE1RM += calculateE1RM(weight, reps);
        totalSets += sets;
        totalReps += reps * sets;
      });

      result.push({
        date,
        formattedDate: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
        totalVolume: Math.round(totalVolume),
        avgWeight: Math.round(totalWeight / logs.length),
        maxWeight,
        avgE1RM: Math.round(totalE1RM / logs.length),
        totalSets,
        totalReps,
      });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [workoutLogs]);

  // Calcola statistiche generali
  const overallStats = useMemo(() => {
    if (aggregatedData.length === 0) return null;

    const volumes = aggregatedData.map(d => d.totalVolume);
    const e1rms = aggregatedData.map(d => d.avgE1RM);

    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const maxVolume = Math.max(...volumes);
    const avgE1RM = e1rms.reduce((a, b) => a + b, 0) / e1rms.length;
    const maxE1RM = Math.max(...e1rms);

    // Trend: confronta prima e seconda metà
    const mid = Math.floor(aggregatedData.length / 2);
    const firstHalfVol = aggregatedData.slice(0, mid).reduce((sum, d) => sum + d.totalVolume, 0) / Math.max(mid, 1);
    const secondHalfVol = aggregatedData.slice(mid).reduce((sum, d) => sum + d.totalVolume, 0) / Math.max(aggregatedData.length - mid, 1);
    const volumeTrend = secondHalfVol > firstHalfVol * 1.05 ? 'up' : secondHalfVol < firstHalfVol * 0.95 ? 'down' : 'stable';

    const firstHalfE1RM = aggregatedData.slice(0, mid).reduce((sum, d) => sum + d.avgE1RM, 0) / Math.max(mid, 1);
    const secondHalfE1RM = aggregatedData.slice(mid).reduce((sum, d) => sum + d.avgE1RM, 0) / Math.max(aggregatedData.length - mid, 1);
    const strengthTrend = secondHalfE1RM > firstHalfE1RM * 1.02 ? 'up' : secondHalfE1RM < firstHalfE1RM * 0.98 ? 'down' : 'stable';

    const volumeChange = firstHalfVol > 0 ? ((secondHalfVol - firstHalfVol) / firstHalfVol * 100) : 0;
    const strengthChange = firstHalfE1RM > 0 ? ((secondHalfE1RM - firstHalfE1RM) / firstHalfE1RM * 100) : 0;

    return {
      avgVolume: Math.round(avgVolume),
      maxVolume,
      avgE1RM: Math.round(avgE1RM),
      maxE1RM,
      volumeTrend,
      strengthTrend,
      volumeChange: Math.round(volumeChange),
      strengthChange: Math.round(strengthChange * 10) / 10,
      totalWorkouts: aggregatedData.length,
    };
  }, [aggregatedData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.value.toLocaleString()}
              {entry.dataKey === 'totalVolume' ? ' kg' : entry.dataKey === 'avgE1RM' || entry.dataKey === 'avgWeight' ? ' kg' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  const hasNoData = aggregatedData.length === 0;

  return (
    <div className={`bg-slate-800/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Progressione Forza & Volume</h3>
          {overallStats && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              {overallStats.totalWorkouts} sessioni
            </span>
          )}
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
              {/* Controls */}
              <div className="flex flex-wrap gap-3 mb-4">
                {/* Time Range */}
                <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                  {(['7d', '30d', '90d', 'all'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        timeRange === range
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {range === 'all' ? 'Tutto' : range}
                    </button>
                  ))}
                </div>

                {/* View Mode */}
                <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                  {(['volume', 'strength', 'combined'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        viewMode === mode
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'volume' ? 'Volume' : mode === 'strength' ? 'Forza' : 'Tutto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              {overallStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-slate-400">Volume Medio</p>
                    </div>
                    <p className="text-xl font-bold text-white">{overallStats.avgVolume.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">kg per sessione</p>
                    {overallStats.volumeTrend !== 'stable' && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        overallStats.volumeTrend === 'up' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${overallStats.volumeTrend === 'down' ? 'rotate-180' : ''}`} />
                        {overallStats.volumeChange > 0 ? '+' : ''}{overallStats.volumeChange}%
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-amber-400" />
                      <p className="text-xs text-slate-400">E1RM Medio</p>
                    </div>
                    <p className="text-xl font-bold text-white">{overallStats.avgE1RM}</p>
                    <p className="text-xs text-slate-500">kg stimato</p>
                    {overallStats.strengthTrend !== 'stable' && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        overallStats.strengthTrend === 'up' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${overallStats.strengthTrend === 'down' ? 'rotate-180' : ''}`} />
                        {overallStats.strengthChange > 0 ? '+' : ''}{overallStats.strengthChange}%
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-slate-400">Volume Max</p>
                    </div>
                    <p className="text-xl font-bold text-white">{overallStats.maxVolume.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">kg record</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs text-slate-400">E1RM Max</p>
                    </div>
                    <p className="text-xl font-bold text-white">{overallStats.maxE1RM}</p>
                    <p className="text-xs text-slate-500">kg record</p>
                  </div>
                </div>
              )}

              {/* Main Chart */}
              <div className="h-72">
                {hasNoData ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Dumbbell className="w-12 h-12 text-slate-500 mb-3" />
                    <p className="text-slate-400">Nessun dato di allenamento</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Completa i tuoi primi workout per vedere i progressi
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="volume"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                      />
                      <YAxis
                        yAxisId="strength"
                        orientation="right"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        label={{ value: 'E1RM (kg)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />

                      {/* Volume */}
                      {(viewMode === 'volume' || viewMode === 'combined') && (
                        <Bar
                          yAxisId="volume"
                          dataKey="totalVolume"
                          name="Volume"
                          fill="#3b82f6"
                          opacity={0.7}
                          radius={[4, 4, 0, 0]}
                        />
                      )}

                      {/* E1RM */}
                      {(viewMode === 'strength' || viewMode === 'combined') && (
                        <Line
                          yAxisId="strength"
                          type="monotone"
                          dataKey="avgE1RM"
                          name="E1RM Stimato"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* Average Weight */}
                      {(viewMode === 'strength' || viewMode === 'combined') && (
                        <Line
                          yAxisId="strength"
                          type="monotone"
                          dataKey="avgWeight"
                          name="Peso Medio"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Formula Explanation */}
              {!hasNoData && (
                <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Formule utilizzate:</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    E1RM (Epley): Peso x (1 + Reps/30) | Volume: Peso x Reps x Serie
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
