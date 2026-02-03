/**
 * Dashboard V2 - Semplificata
 *
 * Principi:
 * - Nessun modal per flussi principali (usa routing)
 * - Skeleton loading
 * - Massimo 3-4 useState per UI state
 * - Quick actions chiare
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProgram } from '../hooks/useProgram';
import { useReducedMotion, safeMotionVariants } from '../hooks/useReducedMotion';
import { Button } from '../components/ui/button';
import { SkeletonDashboard } from '../components/ui/skeleton';
import {
  Activity, Calendar, TrendingUp, Dumbbell,
  Play, Settings, AlertTriangle, Footprints,
  ChevronRight, Zap
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DashboardV2() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  // Data hooks
  const { data: program, isLoading: programLoading } = useCurrentProgram();

  // UI state (minimizzato!)
  const [showDeloadBanner, setShowDeloadBanner] = useState(true);

  // Loading
  if (programLoading) {
    return <SkeletonDashboard />;
  }

  // No program - CTA to create
  if (!program) {
    return <NoProgramState onCreateProgram={() => navigate('/onboarding')} />;
  }

  // Trova prossimo workout
  const weeklySchedule = (program as any).weekly_schedule || (program as any).weekly_split?.days || [];
  const nextWorkoutDay = weeklySchedule[0];
  const isDeloadWeek = (program as any).current_week_type === 'deload';

  // Quick stats
  const stats: QuickStat[] = [
    {
      label: 'Settimana',
      value: `${(program as any).current_week || 1}/6`,
      icon: <Calendar className="w-5 h-5" />,
      color: 'blue',
    },
    {
      label: 'Giorni',
      value: weeklySchedule.length || 0,
      icon: <Dumbbell className="w-5 h-5" />,
      color: 'emerald',
    },
    {
      label: 'Split',
      value: (program as any).split || 'FB',
      icon: <Zap className="w-5 h-5" />,
      color: 'amber',
    },
    {
      label: 'Progressi',
      value: '--',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'purple',
      onClick: () => navigate('/stats'),
    },
  ];

  const variants = safeMotionVariants.slideUp(reducedMotion);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-4 safe-area-top">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Ciao! 👋
            </h1>
            <p className="text-sm text-slate-400">
              {isDeloadWeek ? 'Settimana di deload' : 'Pronto per allenarti?'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            aria-label="Impostazioni"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Deload Banner */}
        {isDeloadWeek && showDeloadBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-300">Settimana di Deload</p>
                <p className="text-sm text-amber-200/80 mt-1">
                  Intensità ridotta per favorire il recupero. Il tuo corpo si adatta durante il riposo.
                </p>
              </div>
              <button
                onClick={() => setShowDeloadBanner(false)}
                className="text-amber-400 hover:text-amber-300 text-sm"
                aria-label="Chiudi banner"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {stats.map((stat, i) => (
            <QuickStatCard key={i} stat={stat} />
          ))}
        </motion.div>

        {/* Main CTA - Start Workout */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {nextWorkoutDay?.dayName || nextWorkoutDay?.name || 'Prossimo Workout'}
                  </h2>
                  <p className="text-sm text-slate-300">
                    {nextWorkoutDay?.exercises?.length || 0} esercizi
                  </p>
                </div>
                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Activity className="w-7 h-7 text-emerald-400" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/workout`)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Inizia Allenamento
                </Button>

                <Button
                  variant="cardio"
                  size="lg"
                  onClick={() => navigate('/running')}
                  aria-label="Sessione di corsa"
                >
                  <Footprints className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Week Overview */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <div className="p-4 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Questa Settimana</h3>
              <button
                onClick={() => navigate('/workout')}
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Vedi tutto
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4 grid gap-2">
              {weeklySchedule.slice(0, 4).map((day: any, i: number) => (
                <WorkoutDayRow
                  key={i}
                  day={day}
                  onClick={() => navigate(`/workout`)}
                />
              ))}
              {weeklySchedule.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Nessun giorno di allenamento trovato</p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function QuickStatCard({ stat }: { stat: QuickStat }) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const Component = stat.onClick ? 'button' : 'div';

  return (
    <Component
      onClick={stat.onClick}
      className={`rounded-xl p-4 border ${colorClasses[stat.color]} ${
        stat.onClick ? 'hover:bg-opacity-20 transition-colors cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {stat.icon}
        <span className="text-xs text-slate-400">{stat.label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{stat.value}</p>
    </Component>
  );
}

function WorkoutDayRow({
  day,
  isCompleted,
  onClick,
}: {
  day: any;
  isCompleted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isCompleted}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left min-h-[56px] ${
        isCompleted
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
      }`}>
        {isCompleted ? (
          <span className="text-white text-sm">✓</span>
        ) : (
          <Dumbbell className="w-5 h-5 text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
          {day.dayName || day.name || `Giorno ${day.dayNumber || ''}`}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {day.exercises?.length || 0} esercizi
        </p>
      </div>

      {!isCompleted && (
        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
      )}
    </button>
  );
}

function NoProgramState({ onCreateProgram }: { onCreateProgram: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Dumbbell className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Benvenuto in TrainSmart!</h1>
        <p className="text-slate-400 mb-8">
          Crea il tuo primo programma personalizzato in meno di 2 minuti.
        </p>
        <Button variant="primary" size="lg" onClick={onCreateProgram}>
          Crea il mio programma
        </Button>
      </div>
    </div>
  );
}
