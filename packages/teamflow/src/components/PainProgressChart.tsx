/**
 * PAIN PROGRESS CHART
 *
 * Grafico multi-dimensionale per visualizzare:
 * - Dolore nel tempo per ogni zona
 * - Correlazione con: Carico, Reps, ROM, Serie
 * - Progressione/regressione visuale
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
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import { Activity, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PainLog } from '../lib/painManagementService';

interface PainProgressChartProps {
  userId: string;
  className?: string;
}

// Colori per le diverse zone di dolore
const PAIN_AREA_COLORS: Record<string, string> = {
  knee: '#ef4444',        // red
  lower_back: '#f97316',  // orange
  shoulder: '#eab308',    // yellow
  wrist: '#22c55e',       // green
  ankle: '#3b82f6',       // blue
  elbow: '#8b5cf6',       // purple
  hip: '#ec4899',         // pink
  neck: '#06b6d4',        // cyan
  general: '#6b7280',     // gray
};

// Traduzioni zone dolore
const PAIN_AREA_LABELS: Record<string, string> = {
  knee: 'Ginocchio',
  lower_back: 'Schiena Bassa',
  shoulder: 'Spalla',
  wrist: 'Polso',
  ankle: 'Caviglia',
  elbow: 'Gomito',
  hip: 'Anca',
  neck: 'Collo',
  general: 'Generale',
};

interface AggregatedPainData {
  date: string;
  formattedDate: string;
  [key: string]: number | string | undefined; // pain_knee, pain_lower_back, etc.
  avgWeight?: number;
  avgReps?: number;
  avgRom?: number;
  totalSets?: number;
}

export default function PainProgressChart({ userId, className = '' }: PainProgressChartProps) {
  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showMetrics, setShowMetrics] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExpanded, setIsExpanded] = useState(true);

  // Carica dati dolore
  useEffect(() => {
    loadPainData();
  }, [userId, timeRange]);

  const loadPainData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: true });

      // Filtra per time range
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('session_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading pain data:', error);
        return;
      }

      setPainLogs(data || []);

      // Auto-seleziona tutte le zone presenti nei dati
      const uniqueAreas = [...new Set((data || []).map(log => log.pain_location).filter(Boolean))];
      if (selectedAreas.length === 0 && uniqueAreas.length > 0) {
        setSelectedAreas(uniqueAreas as string[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggrega dati per data
  const aggregatedData = useMemo(() => {
    if (painLogs.length === 0) return [];

    // Raggruppa per data
    const byDate = new Map<string, PainLog[]>();
    painLogs.forEach(log => {
      const date = log.session_date?.split('T')[0] || '';
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(log);
    });

    // Crea dati aggregati
    const result: AggregatedPainData[] = [];
    byDate.forEach((logs, date) => {
      const dataPoint: AggregatedPainData = {
        date,
        formattedDate: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      };

      // Dolore per zona (media del giorno)
      const painByArea = new Map<string, number[]>();
      logs.forEach(log => {
        const area = log.pain_location || 'general';
        if (!painByArea.has(area)) {
          painByArea.set(area, []);
        }
        painByArea.get(area)!.push(log.pain_level);
      });

      painByArea.forEach((levels, area) => {
        const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
        dataPoint[`pain_${area}`] = Math.round(avg * 10) / 10;
      });

      // Metriche aggiuntive
      const weights = logs.filter(l => l.weight_used).map(l => l.weight_used!);
      const reps = logs.filter(l => l.reps_completed).map(l => l.reps_completed);
      const roms = logs.filter(l => l.rom_percentage).map(l => l.rom_percentage!);

      if (weights.length > 0) {
        dataPoint.avgWeight = Math.round(weights.reduce((a, b) => a + b, 0) / weights.length);
      }
      if (reps.length > 0) {
        dataPoint.avgReps = Math.round(reps.reduce((a, b) => a + b, 0) / reps.length);
      }
      if (roms.length > 0) {
        dataPoint.avgRom = Math.round(roms.reduce((a, b) => a + b, 0) / roms.length);
      }
      dataPoint.totalSets = logs.length;

      result.push(dataPoint);
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [painLogs]);

  // Ottieni zone uniche dai dati
  const uniqueAreas = useMemo(() => {
    return [...new Set(painLogs.map(log => log.pain_location).filter(Boolean))] as string[];
  }, [painLogs]);

  // Calcola trend per ogni zona
  const trends = useMemo(() => {
    const result: Record<string, { trend: 'up' | 'down' | 'stable'; change: number; current: number }> = {};

    uniqueAreas.forEach(area => {
      const areaLogs = painLogs
        .filter(l => l.pain_location === area)
        .sort((a, b) => (a.session_date || '').localeCompare(b.session_date || ''));

      if (areaLogs.length < 2) {
        result[area] = { trend: 'stable', change: 0, current: areaLogs[0]?.pain_level || 0 };
        return;
      }

      // Confronta prima e seconda metà
      const mid = Math.floor(areaLogs.length / 2);
      const firstHalf = areaLogs.slice(0, mid);
      const secondHalf = areaLogs.slice(mid);

      const avgFirst = firstHalf.reduce((sum, l) => sum + l.pain_level, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, l) => sum + l.pain_level, 0) / secondHalf.length;

      const change = avgSecond - avgFirst;
      const current = areaLogs[areaLogs.length - 1].pain_level;

      result[area] = {
        trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
        change: Math.round(change * 10) / 10,
        current,
      };
    });

    return result;
  }, [painLogs, uniqueAreas]);

  // Toggle area selezionata
  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isPain = entry.dataKey.startsWith('pain_');
          const area = isPain ? entry.dataKey.replace('pain_', '') : null;

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-400">
                {area ? PAIN_AREA_LABELS[area] || area : entry.name}:
              </span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value}
                {isPain ? '/10' : entry.dataKey === 'avgRom' ? '%' : entry.dataKey === 'avgWeight' ? 'kg' : ''}
              </span>
            </div>
          );
        })}
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

  if (painLogs.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Tracking Dolore</h3>
        </div>
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Nessun dato sul dolore registrato.</p>
          <p className="text-sm text-slate-500 mt-1">I dati verranno mostrati dopo i tuoi allenamenti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header Collapsible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Tracking Dolore & Progressione</h3>
          {uniqueAreas.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
              {uniqueAreas.length} zone tracciate
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
              {/* Controlli */}
              <div className="flex flex-wrap gap-4 mb-4">
                {/* Time Range */}
                <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                  {(['7d', '30d', '90d', 'all'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        timeRange === range
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {range === 'all' ? 'Tutto' : range}
                    </button>
                  ))}
                </div>

                {/* Toggle Metrics */}
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    showMetrics
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {showMetrics ? 'Nascondi' : 'Mostra'} Metriche
                </button>
              </div>

              {/* Area Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {uniqueAreas.map(area => {
                  const trend = trends[area];
                  const isSelected = selectedAreas.includes(area);
                  const color = PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general;

                  return (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-slate-700 border-2'
                          : 'bg-slate-800/50 border border-slate-600 opacity-50'
                      }`}
                      style={{ borderColor: isSelected ? color : undefined }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white">{PAIN_AREA_LABELS[area] || area}</span>

                      {/* Trend indicator */}
                      {trend && (
                        <span className={`text-xs ${
                          trend.trend === 'down' ? 'text-emerald-400' :
                          trend.trend === 'up' ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {trend.trend === 'down' && <TrendingDown className="w-3 h-3 inline" />}
                          {trend.trend === 'up' && <TrendingUp className="w-3 h-3 inline" />}
                          {trend.current}/10
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {uniqueAreas.filter(a => selectedAreas.includes(a)).map(area => {
                  const trend = trends[area];
                  if (!trend) return null;

                  const color = PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general;
                  const isImproving = trend.trend === 'down';
                  const isWorsening = trend.trend === 'up';

                  return (
                    <div
                      key={area}
                      className="bg-slate-700/50 rounded-lg p-3 border-l-4"
                      style={{ borderColor: color }}
                    >
                      <p className="text-xs text-slate-400 mb-1">{PAIN_AREA_LABELS[area]}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{trend.current}</span>
                        <span className="text-slate-400">/10</span>
                      </div>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${
                        isImproving ? 'text-emerald-400' :
                        isWorsening ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {isImproving && <TrendingDown className="w-3 h-3" />}
                        {isWorsening && <TrendingUp className="w-3 h-3" />}
                        {isImproving && <CheckCircle className="w-3 h-3" />}
                        {isWorsening && <AlertTriangle className="w-3 h-3" />}
                        <span>
                          {isImproving ? `${Math.abs(trend.change)} in meno` :
                           isWorsening ? `+${trend.change} rispetto all'inizio` :
                           'Stabile'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="pain"
                      domain={[0, 10]}
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      label={{ value: 'Dolore', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    {showMetrics && (
                      <YAxis
                        yAxisId="metrics"
                        orientation="right"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        label={{ value: 'Carico (kg)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
                      />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Zona verde (dolore accettabile) */}
                    <ReferenceLine y={3} yAxisId="pain" stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Soglia sicura', fill: '#22c55e', fontSize: 10 }} />

                    {/* Zona rossa (dolore alto) */}
                    <ReferenceLine y={7} yAxisId="pain" stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Stop', fill: '#ef4444', fontSize: 10 }} />

                    {/* Linee dolore per ogni zona selezionata */}
                    {selectedAreas.map(area => (
                      <Line
                        key={area}
                        yAxisId="pain"
                        type="monotone"
                        dataKey={`pain_${area}`}
                        name={PAIN_AREA_LABELS[area] || area}
                        stroke={PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general}
                        strokeWidth={2}
                        dot={{ fill: PAIN_AREA_COLORS[area] || PAIN_AREA_COLORS.general, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls
                      />
                    ))}

                    {/* Metriche aggiuntive */}
                    {showMetrics && (
                      <>
                        <Bar
                          yAxisId="metrics"
                          dataKey="avgWeight"
                          name="Peso medio"
                          fill="#3b82f6"
                          opacity={0.3}
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="metrics"
                          type="monotone"
                          dataKey="avgReps"
                          name="Reps medie"
                          stroke="#22c55e"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Info */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-emerald-500" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#22c55e' }}></div>
                  <span>Soglia sicura (0-3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-red-500" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#ef4444' }}></div>
                  <span>Zona stop (7+)</span>
                </div>
                {showMetrics && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-blue-500/30 rounded"></div>
                      <span>Carico</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-emerald-500" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#22c55e' }}></div>
                      <span>Reps</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
