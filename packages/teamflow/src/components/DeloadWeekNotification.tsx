/**
 * DELOAD WEEK NOTIFICATION COMPONENT
 *
 * Mostra una notifica durante la settimana di deload.
 * Include:
 * - Countdown al retest
 * - Linee guida per il deload
 * - Configurazione riduzione volume/intensità
 * - Focus areas
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Battery,
  Calendar,
  ChevronRight,
  Moon,
  Activity,
  Heart,
  Dumbbell,
  Target,
  Info
} from 'lucide-react';
import {
  DeloadConfig,
  RetestConfig,
  generateDeloadInstructions
} from '../utils/retestProgression';
import { useTranslation } from '../lib/i18n';

interface DeloadWeekNotificationProps {
  daysUntilRetest: number;
  deloadConfig: DeloadConfig;
  nextRetestConfig: RetestConfig;
  currentCycle: number;
  onDismiss?: () => void;
}

export default function DeloadWeekNotification({
  daysUntilRetest,
  deloadConfig,
  nextRetestConfig,
  currentCycle,
  onDismiss
}: DeloadWeekNotificationProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const instructions = generateDeloadInstructions();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 mb-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Battery className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-300">
              {t('deload.title')}
            </h3>
            <p className="text-sm text-slate-400">
              Recupero attivo prima del test
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{daysUntilRetest}</p>
          <p className="text-xs text-slate-500">giorni al test</p>
        </div>
      </div>

      {/* Why Deload */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white text-sm">{t('deload.why')}</span>
        </div>
        <p className="text-sm text-slate-300">
          Dopo 4 settimane di carico progressivo, il tuo corpo ha accumulato fatica.
          Questa settimana permette la <span className="text-emerald-400 font-semibold">supercompensazione</span>:
          recuperi e diventi più forte per il test.
        </p>
      </div>

      {/* Reductions */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <Dumbbell className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">
            -{Math.round(deloadConfig.volumeReduction * 100)}%
          </p>
          <p className="text-xs text-slate-400">Volume</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">
            -{Math.round(deloadConfig.intensityReduction * 100)}%
          </p>
          <p className="text-xs text-slate-400">Intensità</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <Heart className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">RPE ≤7</p>
          <p className="text-xs text-slate-400">Max sforzo</p>
        </div>
      </div>

      {/* Quick Guidelines */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <Moon className="w-4 h-4" />
          {t('deload.guidelines')}
        </h4>
        <ul className="space-y-1">
          {deloadConfig.guidelines.slice(0, 4).map((guideline, index) => (
            <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              {guideline}
            </li>
          ))}
        </ul>
      </div>

      {/* Focus Areas */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-left bg-slate-800/50 rounded-lg p-3 mb-4 hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300 font-semibold">Aree di focus</span>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-slate-800/30 rounded-lg p-4 space-y-2">
              {deloadConfig.focusAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{area}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Instructions Toggle */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="w-full text-left bg-slate-800/50 rounded-lg p-3 mb-4 hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300 font-semibold">Istruzioni complete</span>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-slate-800/30 rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">
                {instructions.join('\n')}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Test Preview */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">
            Prossimo test: {nextRetestConfig.targetRM}RM
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {nextRetestConfig.description}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Ciclo {currentCycle} → Ciclo {currentCycle + 1}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center mb-2">
          Progressione ciclo
        </p>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }, (_, i) => {
            const weekNum = i + 1;
            const isDeloadWeek = weekNum === 5;
            const isCompleted = weekNum <= 4; // Training weeks completed

            return (
              <div
                key={i}
                className={`h-2 rounded-full ${
                  isDeloadWeek
                    ? 'w-6 bg-emerald-500 animate-pulse'
                    : isCompleted
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-slate-600'
                }`}
                title={isDeloadWeek ? 'Deload (ora)' : `Settimana ${weekNum}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
          <span>Training</span>
          <span>Deload</span>
        </div>
      </div>
    </motion.div>
  );
}
