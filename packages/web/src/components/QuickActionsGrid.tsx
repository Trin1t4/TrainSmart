/**
 * QuickActionsGrid - Griglia monitoraggio progressi
 *
 * Mostra 4 card con dati di monitoraggio:
 * - Monitoraggio dolore
 * - Progressione forza/volume
 * - Database progressi scientifici
 * - Tutti i tuoi RM
 */

import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Database,
  Trophy,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface MonitoringCardProps {
  painAreas?: number;
  hasPainImprovement?: boolean;
  strengthProgress?: number; // percentuale di miglioramento
  volumeProgress?: number; // percentuale di miglioramento
  totalWorkouts?: number;
  personalRecords?: number;
  latestPR?: string;
  onPainClick?: () => void;
  onProgressClick?: () => void;
  onDatabaseClick?: () => void;
  onRecordsClick?: () => void;
}

export default function QuickActionsGrid({
  painAreas = 0,
  hasPainImprovement = false,
  strengthProgress = 0,
  volumeProgress = 0,
  totalWorkouts = 0,
  personalRecords = 0,
  latestPR,
  onPainClick,
  onProgressClick,
  onDatabaseClick,
  onRecordsClick,
}: MonitoringCardProps) {

  const cards = [
    // 1. Monitoraggio Dolore
    {
      id: 'pain',
      icon: painAreas > 0 ? AlertCircle : CheckCircle,
      label: 'Monitoraggio Dolore',
      value: painAreas > 0 ? `${painAreas} zone` : 'Tutto ok',
      sublabel: hasPainImprovement ? 'In miglioramento' : painAreas > 0 ? 'Monitorato' : 'Nessun dolore',
      color: painAreas > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: painAreas > 0
        ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30'
        : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
      onClick: onPainClick,
      trend: hasPainImprovement ? 'up' : null,
    },
    // 2. Progressione Forza & Volume
    {
      id: 'progress',
      icon: TrendingUp,
      label: 'Forza & Volume',
      value: strengthProgress > 0 ? `+${strengthProgress}%` : '—',
      sublabel: volumeProgress > 0 ? `Volume +${volumeProgress}%` : 'Inizia ad allenarti',
      color: strengthProgress > 0 ? 'text-blue-400' : 'text-slate-400',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30',
      onClick: onProgressClick,
      trend: strengthProgress > 0 ? 'up' : strengthProgress < 0 ? 'down' : null,
    },
    // 3. Database Progressi Scientifici
    {
      id: 'database',
      icon: Database,
      label: 'Storico Allenamenti',
      value: totalWorkouts > 0 ? `${totalWorkouts}` : '0',
      sublabel: totalWorkouts > 0 ? 'sessioni registrate' : 'Nessuna sessione',
      color: totalWorkouts > 0 ? 'text-purple-400' : 'text-slate-400',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30',
      onClick: onDatabaseClick,
      trend: null,
    },
    // 4. Tutti i tuoi RM
    {
      id: 'records',
      icon: Trophy,
      label: 'I tuoi RM',
      value: personalRecords > 0 ? `${personalRecords}` : '—',
      sublabel: latestPR || (personalRecords > 0 ? 'record personali' : 'Nessun record'),
      color: personalRecords > 0 ? 'text-amber-400' : 'text-slate-400',
      bgColor: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30',
      onClick: onRecordsClick,
      trend: latestPR ? 'up' : null,
    },
  ];

  const getTrendIcon = (trend: string | null) => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-emerald-400" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-400" />;
    return null;
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={card.onClick}
            className={`
              relative p-4 rounded-2xl border backdrop-blur-sm text-left
              transition-all duration-200 hover:shadow-lg cursor-pointer
              ${card.bgColor}
            `}
          >
            {/* Header con icona e trend */}
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} bg-white/5`}>
                <Icon className="w-5 h-5" />
              </div>
              {card.trend && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  {getTrendIcon(card.trend)}
                </div>
              )}
            </div>

            {/* Valore principale */}
            <p className={`text-2xl font-bold ${card.color} mb-0.5`}>
              {card.value}
            </p>

            {/* Label */}
            <p className="font-medium text-sm text-white mb-0.5">
              {card.label}
            </p>

            {/* Sublabel */}
            <p className="text-xs text-slate-400">
              {card.sublabel}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
