/**
 * PAIN PROGRESS CHART - MIGRATO A PAIN DETECT 2.0
 * 
 * File: packages/web/src/components/PainProgressChart.tsx
 *
 * Grafico multi-dimensionale per visualizzare:
 * - Dolore nel tempo per ogni zona
 * - Correlazione con: Carico, Reps, ROM, Serie
 * - Progressione/regressione visuale
 * 
 * MODIFICHE V2:
 * - Import tipi da Pain Detect 2.0
 * - Usa BODY_AREA_LABELS per consistenza
 * - Aggiunge indicatori soglie DCSS
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

// PAIN DETECT 2.0 imports
import {
  PAIN_THRESHOLDS,
  BODY_AREA_LABELS,
  classifyDiscomfort,
  type BodyArea,
  type DiscomfortIntensity
} from '../lib/painManagementService';

// Manteniamo PainLog type per compatibilità DB
interface PainLog {
  id?: string;
  user_id: string;
  program_id?: string;
  exercise_name: string;
  session_date?: string;
  day_name?: string;
  set_number: number;
  weight_used?: number;
  reps_completed: number;
  rom_percentage?: number;
  pain_level: number;
  rpe?: number;
  pain_location?: string;
  adaptations?: any[];
  notes?: string;
}

interface PainProgressChartProps {
  userId: string;
  className?: string;
}

// Colori per le diverse zone di dolore - allineati con Pain Detect 2.0
const PAIN_AREA_COLORS: Record<string, string> = {
  knee: '#ef4444',        // red
  lower_back: '#f97316',  // orange
  shoulder: '#eab308',    // yellow
  wrist: '#22c55e',       // green
  ankle: '#3b82f6',       // blue
  elbow: '#8b5cf6',       // purple
  hip: '#ec4899',         // pink
  neck: '#06b6d4',        // cyan
  upper_back: '#14b8a6',  // teal
  foot: '#6b7280',        // gray
  general: '#9ca3af',     // gray-400
};

// Usa BODY_AREA_LABELS da Pain Detect 2.0
const PAIN_AREA_LABELS_IT: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(BODY_AREA_LABELS).map(([key, val]) => [key, val.it])
  ),
  general: 'Generale',
  scapula: 'Scapola',
  thoracic_spine: 'Dorsale'
};

interface AggregatedPainData {
  date: string;
  formattedDate: string;
  [key: string]: number | string | undefined;
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

      // Auto-select areas with data
      const areasWithData = [...new Set(data?.map(log => log.pain_location).filter(Boolean))];
      if (areasWithData.length > 0 && selectedAreas.length === 0) {
        setSelectedAreas(areasWithData.slice(0, 3) as string[]); // Max 3 initial
      }
    } catch (error) {
      console.error('Exception loading pain data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggrega dati per data
  const aggregatedData = useMemo(() => {
    const grouped = new Map<string, PainLog[]>();

    painLogs.forEach(log => {
      const date = log.session_date?.split('T')[0] || '';
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(log);
    });

    const result: AggregatedPainData[] = [];

    grouped.forEach((logs, date) => {
      const dataPoint: AggregatedPainData = {
        date,
        formattedDate: new Date(date).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short'
        })
      };

      // Aggrega per area
      const areaGroups = new Map<string, number[]>();
      logs.forEach(log => {
        const area = log.pain_location || 'general';
        if (!areaGroups.has(area)) {
          areaGroups.set(area, []);
        }
        areaGroups.get(area)!.push(log.pain_level);
      });

      areaGroups.forEach((levels, area) => {
        const avg = levels.reduce((sum, l) => sum + l, 0) / levels.length;
        dataPoint[`pain_${area}`] = Math.round(avg * 10) / 10;
      });

      // Metriche correlate
      const validWeights = logs.filter(l => l.weight_used).map(l => l.weight_used!);
      const validReps = logs.filter(l => l.reps_completed).map(l => l.reps_completed);
      const validRom = logs.filter(l => l.rom_percentage).map(l => l.rom_percentage!);

      if (validWeights.length > 0) {
        dataPoint.avgWeight = Math.round(validWeights.reduce((a, b) => a + b, 0) / validWeights.length);
      }
      if (validReps.length > 0) {
        dataPoint.avgReps = Math.round(validReps.reduce((a, b) => a + b, 0) / validReps.length);
      }
      if (validRom.length > 0) {
        dataPoint.avgRom = Math.round(validRom.reduce((a, b) => a + b, 0) / validRom.length);
      }
      dataPoint.totalSets = logs.length;

      result.push(dataPoint);
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [painLogs]);

  // Calcola statistiche
  const stats = useMemo(() => {
    if (painLogs.length === 0) return null;

    const totalLogs = painLogs.length;
    const avgPain = painLogs.reduce((sum, log) => sum + log.pain_level, 0) / totalLogs;
    const maxPain = Math.max(...painLogs.map(l => l.pain_level));

    // Trend (primi vs ultimi 50%)
    const sortedByDate = [...painLogs].sort((a, b) =>
      (a.session_date || '').localeCompare(b.session_date || '')
    );
    const midpoint = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, midpoint);
    const secondHalf = sortedByDate.slice(midpoint);

    const avgFirst = firstHalf.length > 0
      ? firstHalf.reduce((sum, l) => sum + l.pain_level, 0) / firstHalf.length
      : 0;
    const avgSecond = secondHalf.length > 0
      ? secondHalf.reduce((sum, l) => sum + l.pain_level, 0) / secondHalf.length
      : 0;

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (avgSecond < avgFirst - 0.5) trend = 'improving';
    else if (avgSecond > avgFirst + 0.5) trend = 'worsening';

    // Sessioni senza dolore significativo (< TOLERABLE_MAX)
    const painFreeSessions = new Set(
      painLogs
        .filter(l => l.pain_level < PAIN_THRESHOLDS.TOLERABLE_MAX)
        .map(l => l.session_date?.split('T')[0])
    ).size;

    // Classificazione usando Pain Detect 2.0
    const classification = classifyDiscomfort(Math.round(avgPain) as DiscomfortIntensity);

    return {
      totalLogs,
      avgPain: Math.round(avgPain * 10) / 10,
      maxPain,
      trend,
      painFreeSessions,
      classification
    };
  }, [painLogs]);

  // Aree disponibili
  const availableAreas = useMemo(() => {
    return [...new Set(painLogs.map(l => l.pain_location).filter(Boolean))] as string[];
  }, [painLogs]);

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (painLogs.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            Nessun dato sul fastidio
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            I dati appariranno qui quando segnalerai fastidio durante gli allenamenti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Monitoraggio Fastidio
            </h3>
            {stats && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Media: {stats.avgPain}/10 •
                {stats.trend === 'improving' && ' 📉 In miglioramento'}
                {stats.trend === 'stable' && ' ➡️ Stabile'}
                {stats.trend === 'worsening' && ' 📈 In aumento'}
              </p>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Stats Cards */}
            {stats && (
              <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Media</p>
                  <p className={`text-2xl font-bold ${
                    stats.avgPain < PAIN_THRESHOLDS.TOLERABLE_MAX ? 'text-green-600' :
                    stats.avgPain < PAIN_THRESHOLDS.PROFESSIONAL_ADVICE ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {stats.avgPain}/10
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {stats.classification}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Massimo</p>
                  <p className={`text-2xl font-bold ${
                    stats.maxPain < PAIN_THRESHOLDS.TOLERABLE_MAX ? 'text-green-600' :
                    stats.maxPain < PAIN_THRESHOLDS.PROFESSIONAL_ADVICE ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {stats.maxPain}/10
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Trend</p>
                  <div className="flex items-center gap-1">
                    {stats.trend === 'improving' && (
                      <>
                        <TrendingDown className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">Migliora</span>
                      </>
                    )}
                    {stats.trend === 'stable' && (
                      <>
                        <span className="text-gray-600 font-medium">➡️ Stabile</span>
                      </>
                    )}
                    {stats.trend === 'worsening' && (
                      <>
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-medium">Peggiora</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Sessioni OK</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.painFreeSessions}
                  </p>
                  <p className="text-xs text-gray-500">
                    &lt; {PAIN_THRESHOLDS.TOLERABLE_MAX}/10
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
              {/* Time Range */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['7d', '30d', '90d', 'all'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      timeRange === range
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {range === '7d' ? '7 gg' : range === '30d' ? '30 gg' : range === '90d' ? '90 gg' : 'Tutto'}
                  </button>
                ))}
              </div>

              {/* Area Toggles */}
              <div className="flex flex-wrap gap-1">
                {availableAreas.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                      selectedAreas.includes(area)
                        ? 'text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: selectedAreas.includes(area)
                        ? PAIN_AREA_COLORS[area] || '#6b7280'
                        : undefined
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PAIN_AREA_COLORS[area] || '#6b7280' }}
                    />
                    {PAIN_AREA_LABELS_IT[area] || area}
                  </button>
                ))}
              </div>

              {/* Show Metrics Toggle */}
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`ml-auto px-2 py-1 text-xs rounded transition-colors ${
                  showMetrics
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {showMetrics ? '📊 Nascondi Metriche' : '📊 Mostra Metriche'}
              </button>
            </div>

            {/* Chart */}
            <div className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    ticks={[0, 2, 4, 6, 8, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name.startsWith('pain_')) {
                        const area = name.replace('pain_', '');
                        return [`${value}/10`, PAIN_AREA_LABELS_IT[area] || area];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />

                  {/* Reference Lines per soglie Pain Detect 2.0 */}
                  <ReferenceLine
                    y={PAIN_THRESHOLDS.TOLERABLE_MAX}
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    label={{ value: 'Tollerabile', fill: '#22c55e', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={PAIN_THRESHOLDS.PROFESSIONAL_ADVICE}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{ value: 'Professionista', fill: '#ef4444', fontSize: 10 }}
                  />

                  {/* Pain Lines per area selezionata */}
                  {selectedAreas.map(area => (
                    <Line
                      key={area}
                      type="monotone"
                      dataKey={`pain_${area}`}
                      name={`pain_${area}`}
                      stroke={PAIN_AREA_COLORS[area] || '#6b7280'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}

                  {/* Metrics (se abilitati) */}
                  {showMetrics && aggregatedData.some(d => d.avgWeight) && (
                    <Bar
                      dataKey="avgWeight"
                      name="Peso (kg)"
                      fill="#3b82f6"
                      opacity={0.3}
                      yAxisId="right"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Info */}
            <div className="px-4 pb-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="mb-1">
                      <span className="text-green-600">●</span> 0-{PAIN_THRESHOLDS.TOLERABLE_MAX - 1}: Fastidio tollerabile, continua normalmente
                    </p>
                    <p className="mb-1">
                      <span className="text-amber-600">●</span> {PAIN_THRESHOLDS.TOLERABLE_MAX}-{PAIN_THRESHOLDS.PROFESSIONAL_ADVICE - 1}: Fastidio moderato, considera adattamenti
                    </p>
                    <p>
                      <span className="text-red-600">●</span> {PAIN_THRESHOLDS.PROFESSIONAL_ADVICE}+: Consigliato consulto professionista
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
