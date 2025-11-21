/**
 * Pre-Workout Pain Check
 * SCENARIO 2: Se cliente arriva GIÀ con dolore all'inizio della seduta
 * → SALTA deload progressivo
 * → ATTIVA SUBITO recovery motorio
 * → NON stressare la parte
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, CheckCircle, X } from 'lucide-react';

interface PainArea {
  area: 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'scapula' | 'thoracic_spine' | 'lower_back' | 'hip' | 'knee' | 'ankle';
  label: string;
  icon?: string;
}

const BODY_AREAS: PainArea[] = [
  { area: 'neck', label: 'Collo', icon: '🦴' },
  { area: 'shoulder', label: 'Spalla', icon: '💪' },
  { area: 'elbow', label: 'Gomito', icon: '🦾' },
  { area: 'wrist', label: 'Polso', icon: '✋' },
  { area: 'scapula', label: 'Scapola', icon: '🏋️' },
  { area: 'thoracic_spine', label: 'Dorso', icon: '🧍' },
  { area: 'lower_back', label: 'Schiena Bassa', icon: '🔙' },
  { area: 'hip', label: 'Anca', icon: '🦵' },
  { area: 'knee', label: 'Ginocchio', icon: '🦿' },
  { area: 'ankle', label: 'Caviglia', icon: '👟' }
];

interface PreWorkoutPainCheckProps {
  onComplete: (result: {
    hasPain: boolean;
    painAreas?: PainArea['area'][];
    shouldActivateRecovery: boolean;
  }) => void;
  onSkip: () => void;
}

export default function PreWorkoutPainCheck({
  onComplete,
  onSkip
}: PreWorkoutPainCheckProps) {
  const [step, setStep] = useState<'initial' | 'pain_check' | 'area_selection'>('initial');
  const [selectedAreas, setSelectedAreas] = useState<PainArea['area'][]>([]);

  const handleNoPain = () => {
    onComplete({
      hasPain: false,
      shouldActivateRecovery: false
    });
  };

  const handleHasPain = () => {
    setStep('area_selection');
  };

  const toggleArea = (area: PainArea['area']) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleConfirmPainAreas = () => {
    if (selectedAreas.length === 0) {
      return; // Deve selezionare almeno un'area
    }

    onComplete({
      hasPain: true,
      painAreas: selectedAreas,
      shouldActivateRecovery: true // SCENARIO 2: Attiva subito recovery
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pre-Workout Check</h2>
              <p className="text-slate-400 text-sm mt-1">
                Come ti senti oggi prima di iniziare?
              </p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white transition"
            aria-label="Skip check"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Initial Question */}
            {step === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Info Alert */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-blue-300 mb-1">Importante!</p>
                    <p>
                      Se hai già dolore PRIMA di iniziare l'allenamento, attiveremo un
                      protocollo di recupero motorio specifico invece dello stress ulteriore.
                    </p>
                  </div>
                </div>

                {/* Main Question */}
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Hai dolore in qualche parte del corpo ADESSO?
                  </h3>
                  <p className="text-slate-400 text-sm mb-8">
                    (Prima ancora di iniziare l'allenamento)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    {/* NO PAIN */}
                    <button
                      onClick={handleNoPain}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-2 border-green-500/50 hover:border-green-400 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="relative z-10">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-semibold text-white">
                          NO, Sto Bene
                        </span>
                        <p className="text-xs text-green-300 mt-2">
                          Procedi con allenamento normale
                        </p>
                      </div>
                    </button>

                    {/* HAS PAIN */}
                    <button
                      onClick={handleHasPain}
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border-2 border-amber-500/50 hover:border-amber-400 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="relative z-10">
                        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-semibold text-white">
                          Sì, Ho Dolore
                        </span>
                        <p className="text-xs text-amber-300 mt-2">
                          Attiva protocollo recovery
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Area Selection */}
            {step === 'area_selection' && (
              <motion.div
                key="area_selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Dove senti dolore?
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Seleziona tutte le aree che ti fanno male (puoi selezionarne più di una)
                  </p>
                </div>

                {/* Body Areas Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BODY_AREAS.map((bodyArea) => {
                    const isSelected = selectedAreas.includes(bodyArea.area);
                    return (
                      <button
                        key={bodyArea.area}
                        onClick={() => toggleArea(bodyArea.area)}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                              : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                          }
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{bodyArea.icon}</div>
                          <div
                            className={`text-sm font-medium ${
                              isSelected ? 'text-amber-300' : 'text-slate-300'
                            }`}
                          >
                            {bodyArea.label}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setStep('initial')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleConfirmPainAreas}
                    disabled={selectedAreas.length === 0}
                    className={`
                      flex-1 py-3 rounded-lg font-semibold transition shadow-lg
                      ${
                        selectedAreas.length > 0
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {selectedAreas.length > 0
                      ? `Conferma (${selectedAreas.length} ${selectedAreas.length === 1 ? 'area' : 'aree'})`
                      : 'Seleziona almeno un\'area'}
                  </button>
                </div>

                {/* Info */}
                {selectedAreas.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-sm text-amber-200">
                      <strong>Sistema attiverà:</strong> Protocollo di recupero motorio per{' '}
                      {selectedAreas.length} {selectedAreas.length === 1 ? 'area' : 'aree'}.
                      NON stresseremo ulteriormente le parti dolorose.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
