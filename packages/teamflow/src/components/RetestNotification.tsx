/**
 * RETEST NOTIFICATION COMPONENT
 *
 * Mostra una notifica quando è tempo di retestare i massimali.
 * Include:
 * - Countdown al prossimo retest
 * - Configurazione del nuovo test (RM target)
 * - Peso suggerito per ogni pattern
 * - Istruzioni dettagliate
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, ChevronRight, Target, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import {
  RetestSchedule,
  RetestConfig,
  getRetestConfig,
  generateRetestInstructions,
  convertBaselines,
  Goal
} from '../utils/retestProgression';

interface RetestNotificationProps {
  schedule: RetestSchedule;
  goal: Goal;
  baselines: Record<string, { weight10RM?: number; reps?: number; difficulty?: number }>;
  onStartRetest: () => void;
  onDismiss: () => void;
}

export default function RetestNotification({
  schedule,
  goal,
  baselines,
  onStartRetest,
  onDismiss
}: RetestNotificationProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const { isRetestDue, daysUntilRetest, currentCycle, nextConfig } = schedule;

  // Converti baselines al nuovo target RM
  const convertedBaselines = convertBaselines(baselines, 10, nextConfig.targetRM);
  const instructions = generateRetestInstructions(nextConfig);

  // Goal display name
  const goalNames: Record<Goal, string> = {
    forza: 'Forza',
    ipertrofia: 'Ipertrofia',
    resistenza: 'Resistenza',
    dimagrimento: 'Dimagrimento',
    prestazioni: 'Prestazioni'
  };

  if (!isRetestDue) {
    // Mini banner non intrusivo
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 mb-4 cursor-pointer hover:border-slate-600 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">
                Prossimo retest tra <span className="font-bold text-blue-400">{daysUntilRetest} giorni</span>
              </p>
              <p className="text-xs text-slate-500">
                Ciclo {currentCycle} → Test {nextConfig.targetRM}RM ({goalNames[goal]})
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-700/50"
            >
              <p className="text-xs text-slate-400 mb-2">{nextConfig.description}</p>
              <p className="text-xs text-slate-500">
                Intensità: {nextConfig.intensity} | Recupero: {Math.floor(nextConfig.restSeconds / 60)} min
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Full notification quando è tempo di retestare
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/30 shadow-2xl shadow-amber-500/10 mb-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-300">
              È tempo di retestare!
            </h3>
            <p className="text-sm text-slate-400">
              Ciclo {currentCycle} completato - Calibra i nuovi carichi
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Test Info */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white text-lg">
            Test {nextConfig.targetRM}RM
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {goalNames[goal]}
          </span>
        </div>
        <p className="text-sm text-slate-300 mb-2">{nextConfig.description}</p>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>Intensità: <span className="text-amber-300">{nextConfig.intensity}</span></span>
          <span>Recupero: <span className="text-amber-300">{Math.floor(nextConfig.restSeconds / 60)} min</span></span>
        </div>
      </div>

      {/* Perché questo test */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-300 font-semibold mb-1">
          Perché test {nextConfig.targetRM}RM?
        </p>
        <p className="text-xs text-slate-400">
          {goal === 'forza' && (
            <>
              Il tuo obiettivo è la forza massimale. Man mano che progredisci, i test diventano più
              specifici (10RM → 6RM → 3RM → 1RM) per calibrare meglio i carichi pesanti.
            </>
          )}
          {goal === 'ipertrofia' && (
            <>
              Per l'ipertrofia, il range 6-12 reps è ottimale. Test nell'8RM ti permette di
              calibrare perfettamente il volume nel range di crescita muscolare.
            </>
          )}
          {(goal === 'resistenza' || goal === 'dimagrimento') && (
            <>
              Per {goalNames[goal].toLowerCase()}, reps più alte sono più specifiche. Test a {nextConfig.targetRM}RM
              ti permette di calibrare la capacità di lavoro e il volume totale.
            </>
          )}
          {goal === 'prestazioni' && (
            <>
              Per le prestazioni atletiche, la potenza richiede intensità moderate-alte.
              Test a {nextConfig.targetRM}RM calibra sia forza che velocità di esecuzione.
            </>
          )}
        </p>
      </div>

      {/* Suggested Weights */}
      {Object.keys(convertedBaselines).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Pesi suggeriti per il test
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(convertedBaselines).slice(0, 6).map(([pattern, data]) => (
              <div
                key={pattern}
                className="bg-slate-800/50 rounded-lg p-2 text-sm"
              >
                <p className="text-slate-400 text-xs truncate">{pattern.replace(/_/g, ' ')}</p>
                <p className="font-bold text-white">
                  {data.suggestedWeight}kg × {data.targetReps}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            * Pesi basati sul tuo 10RM precedente. Inizia leggermente sotto e aggiusta.
          </p>
        </div>
      )}

      {/* Instructions Toggle */}
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

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartRetest}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Inizia Retest
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDismiss}
          className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Rimanda
        </motion.button>
      </div>

      {/* Progress through cycles */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Progressione {goal}: {
            goal === 'forza' ? '10RM → 6RM → 3RM → 1RM' :
            goal === 'ipertrofia' ? '10RM → 8RM → 8RM → 6RM' :
            goal === 'resistenza' ? '10RM → 12RM → 15RM → 20RM' :
            '10RM → 10RM → 12RM → 15RM'
          }
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4].map(cycle => (
            <div
              key={cycle}
              className={`w-3 h-3 rounded-full ${
                cycle < currentCycle ? 'bg-emerald-500' :
                cycle === currentCycle ? 'bg-amber-500' :
                'bg-slate-600'
              }`}
              title={`Ciclo ${cycle}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
