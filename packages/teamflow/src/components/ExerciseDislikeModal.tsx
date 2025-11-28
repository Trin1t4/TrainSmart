/**
 * Exercise Dislike Modal - Anamnesi esercizio
 *
 * Workflow intelligente:
 * 1. "È troppo pesante" → Riduzione carico automatica (-15/20%)
 * 2. "Sento dolore" → Prima riduzione carico. Se persiste → sostituzione pain-friendly
 * 3. "Non mi piace" → Prima proposta riduzione carico. Se rifiuta → sostituzione biomeccanica
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, AlertTriangle, ThumbsDown, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface ExerciseDislikeModalProps {
  open: boolean;
  onClose: () => void;
  exerciseName: string;
  exercisePattern: string;
  currentWeight?: number | string;
  onReduceWeight: (percentage: number) => void;
  onReplaceExercise: (reason: 'pain' | 'dislike') => void;
  onReportPain: (area: string, level: number) => void;
}

type DislikeReason = 'too_heavy' | 'pain' | 'dislike' | null;
type SubStep = 'main' | 'pain_area' | 'pain_level' | 'dislike_confirm' | 'action_taken';

const PAIN_AREAS = [
  { id: 'shoulder', label: 'Spalla', emoji: '🦾' },
  { id: 'elbow', label: 'Gomito', emoji: '💪' },
  { id: 'wrist', label: 'Polso', emoji: '✋' },
  { id: 'lower_back', label: 'Zona Lombare', emoji: '🔙' },
  { id: 'upper_back', label: 'Zona Dorsale', emoji: '🔝' },
  { id: 'knee', label: 'Ginocchio', emoji: '🦵' },
  { id: 'hip', label: 'Anca', emoji: '🦴' },
  { id: 'ankle', label: 'Caviglia', emoji: '🦶' },
  { id: 'neck', label: 'Collo', emoji: '🦒' },
];

export default function ExerciseDislikeModal({
  open,
  onClose,
  exerciseName,
  exercisePattern,
  currentWeight,
  onReduceWeight,
  onReplaceExercise,
  onReportPain,
}: ExerciseDislikeModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<DislikeReason>(null);
  const [subStep, setSubStep] = useState<SubStep>('main');
  const [painArea, setPainArea] = useState<string>('');
  const [painLevel, setPainLevel] = useState(5);
  const [actionMessage, setActionMessage] = useState('');

  const handleClose = () => {
    // Reset state on close
    setReason(null);
    setSubStep('main');
    setPainArea('');
    setPainLevel(5);
    setActionMessage('');
    onClose();
  };

  const handleTooHeavy = () => {
    // Reduce weight by 15%
    onReduceWeight(15);
    setActionMessage(t('exercise_dislike.weight_reduced'));
    setSubStep('action_taken');

    // Auto-close after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handlePainSelect = (area: string) => {
    setPainArea(area);
    setSubStep('pain_level');
  };

  const handlePainConfirm = () => {
    // Report pain first
    onReportPain(painArea, painLevel);

    if (painLevel >= 7) {
      // High pain → Replace exercise immediately
      onReplaceExercise('pain');
      setActionMessage(t('exercise_dislike.replaced_for_pain'));
    } else if (painLevel >= 4) {
      // Moderate pain → Reduce weight first
      onReduceWeight(20);
      setActionMessage(t('exercise_dislike.weight_reduced_for_pain'));
    } else {
      // Mild pain → Just reduce a bit
      onReduceWeight(10);
      setActionMessage(t('exercise_dislike.mild_pain_adjusted'));
    }

    setSubStep('action_taken');
    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  const handleDislikeConfirm = (acceptReducedWeight: boolean) => {
    if (acceptReducedWeight) {
      // User accepts reduced weight
      onReduceWeight(15);
      setActionMessage(t('exercise_dislike.weight_reduced_dislike'));
    } else {
      // User wants replacement
      onReplaceExercise('dislike');
      setActionMessage(t('exercise_dislike.replaced_for_dislike'));
    }

    setSubStep('action_taken');
    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">
              {subStep === 'action_taken'
                ? '✅ ' + t('common.done')
                : '💬 ' + t('exercise_dislike.title')}
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Exercise name */}
            <div className="text-center mb-6">
              <p className="text-emerald-400 font-bold text-xl">{exerciseName}</p>
              {currentWeight && (
                <p className="text-slate-400 text-sm mt-1">
                  {t('exercise_dislike.current_weight')}: {currentWeight} kg
                </p>
              )}
            </div>

            {/* Main Step - Choose Reason */}
            {subStep === 'main' && (
              <div className="space-y-3">
                <p className="text-slate-300 text-center mb-4">
                  {t('exercise_dislike.why_not_like')}
                </p>

                {/* Too Heavy */}
                <button
                  onClick={handleTooHeavy}
                  className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-amber-300 font-semibold">
                        {t('exercise_dislike.too_heavy')}
                      </p>
                      <p className="text-amber-400/60 text-sm">
                        {t('exercise_dislike.too_heavy_desc')}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 ml-auto transition-colors" />
                  </div>
                </button>

                {/* Pain */}
                <button
                  onClick={() => {
                    setReason('pain');
                    setSubStep('pain_area');
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-red-300 font-semibold">
                        {t('exercise_dislike.feel_pain')}
                      </p>
                      <p className="text-red-400/60 text-sm">
                        {t('exercise_dislike.feel_pain_desc')}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-red-400/50 group-hover:text-red-400 ml-auto transition-colors" />
                  </div>
                </button>

                {/* Don't Like */}
                <button
                  onClick={() => {
                    setReason('dislike');
                    setSubStep('dislike_confirm');
                  }}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-purple-300 font-semibold">
                        {t('exercise_dislike.dont_like')}
                      </p>
                      <p className="text-purple-400/60 text-sm">
                        {t('exercise_dislike.dont_like_desc')}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400/50 group-hover:text-purple-400 ml-auto transition-colors" />
                  </div>
                </button>
              </div>
            )}

            {/* Pain Area Selection */}
            {subStep === 'pain_area' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-center mb-4">
                  {t('exercise_dislike.where_pain')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PAIN_AREAS.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => handlePainSelect(area.id)}
                      className="bg-slate-700/50 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/50 rounded-lg p-3 text-center transition-all"
                    >
                      <span className="text-2xl block mb-1">{area.emoji}</span>
                      <span className="text-xs text-slate-300">{area.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSubStep('main')}
                  className="w-full mt-4 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ← {t('common.back')}
                </button>
              </div>
            )}

            {/* Pain Level Selection */}
            {subStep === 'pain_level' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-center mb-2">
                  {t('exercise_dislike.pain_intensity')}
                </p>
                <p className="text-red-400 text-center font-bold text-4xl mb-4">
                  {painLevel}/10
                </p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{t('exercise_dislike.pain_mild')}</span>
                  <span>{t('exercise_dislike.pain_moderate')}</span>
                  <span>{t('exercise_dislike.pain_severe')}</span>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-slate-700/50 text-sm">
                  {painLevel >= 7 ? (
                    <p className="text-red-300">
                      ⚠️ {t('exercise_dislike.pain_will_replace')}
                    </p>
                  ) : painLevel >= 4 ? (
                    <p className="text-amber-300">
                      🔄 {t('exercise_dislike.pain_will_reduce')}
                    </p>
                  ) : (
                    <p className="text-green-300">
                      ✅ {t('exercise_dislike.pain_will_adjust')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSubStep('pain_area')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    ← {t('common.back')}
                  </button>
                  <button
                    onClick={handlePainConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </div>
            )}

            {/* Dislike Confirmation */}
            {subStep === 'dislike_confirm' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-center mb-4">
                  {t('exercise_dislike.dislike_try_lighter')}
                </p>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm text-center">
                    {t('exercise_dislike.dislike_lighter_suggestion')}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleDislikeConfirm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    ✅ {t('exercise_dislike.try_lighter')}
                  </button>
                  <button
                    onClick={() => handleDislikeConfirm(false)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    🔄 {t('exercise_dislike.replace_exercise')}
                  </button>
                  <button
                    onClick={() => setSubStep('main')}
                    className="w-full text-slate-400 hover:text-white text-sm transition-colors mt-2"
                  >
                    ← {t('common.back')}
                  </button>
                </div>
              </div>
            )}

            {/* Action Taken */}
            {subStep === 'action_taken' && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <p className="text-emerald-300 font-semibold text-lg">
                  {actionMessage}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
