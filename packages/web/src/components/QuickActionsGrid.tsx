/**
 * QuickActionsGrid - Clean icon grid for dashboard navigation
 *
 * Modern app-style grid with large icons for quick access to main features
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Calendar,
  BarChart3,
  Trophy,
  User,
  Dumbbell,
  Target,
  Footprints,
  ClipboardCheck,
  Settings
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  path?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface QuickActionsGridProps {
  hasProgram: boolean;
  hasRunning?: boolean;
  completedToday?: boolean;
  weeklyProgress?: { completed: number; total: number };
  onStartWorkout?: () => void;
  onViewProgram?: () => void;
}

export default function QuickActionsGrid({
  hasProgram,
  hasRunning = false,
  completedToday = false,
  weeklyProgress,
  onStartWorkout,
  onViewProgram,
}: QuickActionsGridProps) {
  const navigate = useNavigate();

  // Azioni principali basate sullo stato dell'utente
  const actions: QuickAction[] = [
    // CTA Principale - Inizia Allenamento
    {
      id: 'workout',
      icon: Play,
      label: completedToday ? 'Continua' : 'Allenati',
      sublabel: completedToday ? 'Fatto oggi' : 'Inizia ora',
      color: 'text-emerald-400',
      bgColor: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
      onClick: onStartWorkout,
      disabled: !hasProgram,
    },
    // Programma Settimanale
    {
      id: 'schedule',
      icon: Calendar,
      label: 'Programma',
      sublabel: weeklyProgress
        ? `${weeklyProgress.completed}/${weeklyProgress.total} settimana`
        : 'La tua scheda',
      color: 'text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30',
      onClick: onViewProgram,
      disabled: !hasProgram,
    },
    // Statistiche e Progressi
    {
      id: 'stats',
      icon: BarChart3,
      label: 'Statistiche',
      sublabel: 'I tuoi progressi',
      color: 'text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30',
      path: '/stats',
    },
    // Record Personali
    {
      id: 'records',
      icon: Trophy,
      label: 'Record',
      sublabel: 'I tuoi massimali',
      color: 'text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30',
      path: '/stats#records',
    },
  ];

  // Aggiungi corsa se abilitata
  if (hasRunning) {
    actions.splice(2, 0, {
      id: 'running',
      icon: Footprints,
      label: 'Corsa',
      sublabel: 'Sessione cardio',
      color: 'text-cyan-400',
      bgColor: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
      path: '/workout?tab=running',
    });
  }

  // Aggiungi valutazione se non ha programma
  if (!hasProgram) {
    actions.push({
      id: 'screening',
      icon: ClipboardCheck,
      label: 'Valutazione',
      sublabel: 'Test fisico',
      color: 'text-orange-400',
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30',
      path: '/screening',
    });
  }

  const handleAction = (action: QuickAction) => {
    if (action.disabled) return;
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: action.disabled ? 1 : 1.02 }}
            whileTap={{ scale: action.disabled ? 1 : 0.98 }}
            onClick={() => handleAction(action)}
            disabled={action.disabled}
            className={`
              relative p-4 rounded-2xl border backdrop-blur-sm
              transition-all duration-200
              ${action.bgColor}
              ${action.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg cursor-pointer active:shadow-md'
              }
            `}
          >
            {/* Badge */}
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${action.color} bg-white/5`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Label */}
            <p className={`font-semibold text-sm ${action.disabled ? 'text-slate-500' : 'text-white'}`}>
              {action.label}
            </p>

            {/* Sublabel */}
            {action.sublabel && (
              <p className={`text-xs mt-0.5 ${action.disabled ? 'text-slate-600' : 'text-slate-400'}`}>
                {action.sublabel}
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
