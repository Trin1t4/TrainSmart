/**
 * DELOAD SUGGESTION MODAL
 *
 * Mostra suggerimenti di deload/adjustment basati su RPE trend
 * in modo interattivo invece di applicarli automaticamente.
 *
 * L'utente può:
 * - Accettare il deload suggerito
 * - Rifiutare e continuare
 * - Modificare la percentuale di riduzione
 * - Posticipare di una settimana
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, Check, X, Clock, Settings } from 'lucide-react';
import { type ProgramAdjustment, type ExerciseAdjustment } from '@trainsmart/shared';
import { useTranslation } from '../lib/i18n';

interface DeloadSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  adjustment: ProgramAdjustment;
  onAccept: (modifiedAdjustment: ProgramAdjustment) => void;
  onReject: () => void;
  onPostpone: () => void;
}

export default function DeloadSuggestionModal({
  open,
  onClose,
  adjustment,
  onAccept,
  onReject,
  onPostpone
}: DeloadSuggestionModalProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [customReduction, setCustomReduction] = useState(Math.abs(adjustment.volume_change_percent));

  if (!open) return null;

  const isDeload = adjustment.adjustment_type === 'deload_week';
  const isDecrease = adjustment.adjustment_type === 'decrease_volume';
  const isIncrease = adjustment.adjustment_type === 'increase_volume';

  // Calcola esercizi affected con nuove percentuali custom
  const getModifiedAdjustment = (): ProgramAdjustment => {
    const ratio = customReduction / Math.abs(adjustment.volume_change_percent);

    return {
      ...adjustment,
      volume_change_percent: isIncrease ? customReduction : -customReduction,
      exercises_affected: adjustment.exercises_affected.map(ex => ({
        ...ex,
        new_sets: isIncrease
          ? Math.round(ex.old_sets * (1 + customReduction / 100))
          : Math.max(1, Math.round(ex.old_sets * (1 - customReduction / 100)))
      }))
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                isDeload ? 'bg-red-500/20' :
                isDecrease ? 'bg-orange-500/20' :
                'bg-emerald-500/20'
              }`}>
                {isDeload && <AlertTriangle className="w-6 h-6 text-red-400" />}
                {isDecrease && <TrendingDown className="w-6 h-6 text-orange-400" />}
                {isIncrease && <TrendingUp className="w-6 h-6 text-emerald-400" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isDeload && t('deload.suggested')}
                  {isDecrease && t('deload.reduce_volume')}
                  {isIncrease && t('deload.increase_volume')}
                </h2>
                <p className="text-slate-400 text-sm">
                  Basato su {adjustment.sessions_analyzed} sessioni analizzate
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reason */}
          <div className={`rounded-xl p-4 mb-6 ${
            isDeload ? 'bg-red-500/10 border border-red-500/30' :
            isDecrease ? 'bg-orange-500/10 border border-orange-500/30' :
            'bg-emerald-500/10 border border-emerald-500/30'
          }`}>
            <p className={`font-semibold mb-2 ${
              isDeload ? 'text-red-300' :
              isDecrease ? 'text-orange-300' :
              'text-emerald-300'
            }`}>
              {isDeload && 'RPE critico rilevato'}
              {isDecrease && 'RPE troppo alto'}
              {isIncrease && 'RPE troppo basso'}
            </p>
            <p className="text-slate-300 text-sm">
              {isDeload && (
                <>
                  Il tuo RPE medio delle ultime sessioni ({adjustment.avg_rpe_before.toFixed(1)}/10) indica
                  un rischio di sovrallenamento. Un deload di una settimana permetterà al corpo di recuperare.
                </>
              )}
              {isDecrease && (
                <>
                  Il tuo RPE medio ({adjustment.avg_rpe_before.toFixed(1)}/10) suggerisce che il carico
                  attuale è troppo alto. Riducendo il volume potrai mantenere la qualità dell'allenamento.
                </>
              )}
              {isIncrease && (
                <>
                  Il tuo RPE medio ({adjustment.avg_rpe_before.toFixed(1)}/10) suggerisce che il carico
                  attuale è troppo basso. Aumentare il volume stimolerà maggiori adattamenti.
                </>
              )}
            </p>
          </div>

          {/* RPE Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">RPE Medio</p>
              <p className={`text-2xl font-bold ${
                adjustment.avg_rpe_before >= 9 ? 'text-red-400' :
                adjustment.avg_rpe_before >= 8 ? 'text-orange-400' :
                adjustment.avg_rpe_before <= 5 ? 'text-blue-400' :
                'text-white'
              }`}>
                {adjustment.avg_rpe_before.toFixed(1)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">Target RPE</p>
              <p className="text-2xl font-bold text-emerald-400">7-8</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">Sessioni</p>
              <p className="text-2xl font-bold text-white">{adjustment.sessions_analyzed}</p>
            </div>
          </div>

          {/* Suggested Change */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-slate-300 font-semibold">Modifica suggerita</p>
              <span className={`text-lg font-bold ${
                isIncrease ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {isIncrease ? '+' : '-'}{customReduction}%
              </span>
            </div>

            {/* Custom Reduction Slider */}
            <div className="mb-4">
              <input
                type="range"
                min="5"
                max={isDeload ? 50 : 30}
                step="5"
                value={customReduction}
                onChange={(e) => setCustomReduction(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isIncrease ? 'accent-emerald-500' : 'accent-orange-500'
                }`}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>5%</span>
                <span>Personalizza</span>
                <span>{isDeload ? '50%' : '30%'}</span>
              </div>
            </div>

            {/* Exercises Affected Summary */}
            <div className="flex justify-between items-center">
              <p className="text-slate-400 text-sm">
                {adjustment.exercises_affected.length} esercizi coinvolti
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                {showDetails ? 'Nascondi' : 'Dettagli'}
              </button>
            </div>
          </div>

          {/* Detailed Exercise List */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-slate-800/30 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <p className="text-slate-400 text-xs mb-3 font-semibold">Modifiche per esercizio:</p>
                  <div className="space-y-2">
                    {getModifiedAdjustment().exercises_affected.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-300 truncate flex-1">{ex.exercise_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{ex.old_sets} sets</span>
                          <span className="text-slate-400">→</span>
                          <span className={isIncrease ? 'text-emerald-400' : 'text-orange-400'}>
                            {ex.new_sets} sets
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary: Accept */}
            <button
              onClick={() => onAccept(getModifiedAdjustment())}
              className={`w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isIncrease
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
              }`}
            >
              <Check className="w-5 h-5" />
              {isDeload && t('deload.apply')}
              {isDecrease && t('deload.reduce_volume')}
              {isIncrease && t('deload.increase_volume')}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onPostpone}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {t('deload.postpone')}
              </button>
              <button
                onClick={onReject}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('deload.ignore')}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <p className="text-slate-500 text-xs text-center mt-4">
            {isDeload
              ? 'Un deload ogni 4-6 settimane aiuta il recupero e previene infortuni'
              : 'Il sistema continuerà a monitorare il tuo RPE per futuri aggiustamenti'}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
