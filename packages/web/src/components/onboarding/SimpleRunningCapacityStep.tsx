/**
 * SimpleRunningCapacityStep
 * Versione semplificata per screening veloce - solo domanda capacità running
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Check, ChevronRight, X } from 'lucide-react';
import { RunningCapacity, RunningPreferences } from '@trainsmart/shared';

interface SimpleRunningCapacityStepProps {
  onComplete: (prefs: RunningPreferences) => void;
  onSkip: () => void;
}

const CAPACITY_OPTIONS = [
  {
    key: 'none' as const,
    label: 'Non riesco a correre',
    sublabel: 'Meno di 5 minuti continui',
    level: 'sedentary' as const,
  },
  {
    key: 'canRun5Min' as const,
    label: '5 minuti',
    sublabel: 'Riesco a correre 5 minuti continui',
    level: 'sedentary' as const,
  },
  {
    key: 'canRun10Min' as const,
    label: '10 minuti',
    sublabel: 'Riesco a correre 10 minuti continui',
    level: 'beginner' as const,
  },
  {
    key: 'canRun20Min' as const,
    label: '20 minuti',
    sublabel: 'Riesco a correre 20 minuti continui',
    level: 'intermediate' as const,
  },
  {
    key: 'canRun30Min' as const,
    label: '30+ minuti',
    sublabel: 'Riesco a correre 30 minuti o più',
    level: 'advanced' as const,
  },
];

export default function SimpleRunningCapacityStep({ onComplete, onSkip }: SimpleRunningCapacityStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleComplete = () => {
    if (!selected) return;

    // Costruisci capacity in base alla selezione
    const capacity: RunningCapacity = {
      canRun5Min: ['canRun5Min', 'canRun10Min', 'canRun20Min', 'canRun30Min'].includes(selected),
      canRun10Min: ['canRun10Min', 'canRun20Min', 'canRun30Min'].includes(selected),
      canRun20Min: ['canRun20Min', 'canRun30Min'].includes(selected),
      canRun30Min: selected === 'canRun30Min',
    };

    // Determina sessioni in base al livello
    const selectedOption = CAPACITY_OPTIONS.find(o => o.key === selected);
    const sessionsPerWeek = selectedOption?.level === 'advanced' ? 3 : 2;

    const prefs: RunningPreferences = {
      enabled: true,
      goal: 'base_aerobica', // Default per screening veloce
      integration: 'separate_days', // Default
      sessionsPerWeek,
      capacity,
    };

    onComplete(prefs);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Timer className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Vuoi aggiungere la corsa?
        </h2>
        <p className="text-gray-400">
          Quanto riesci a correre senza fermarti?
        </p>
      </div>

      {/* Opzioni capacità */}
      <div className="space-y-3">
        {CAPACITY_OPTIONS.map((option) => (
          <motion.button
            key={option.key}
            onClick={() => setSelected(option.key)}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
              selected === option.key
                ? 'border-green-500 bg-green-900/30'
                : 'border-gray-700 hover:border-green-300/50'
            }`}
          >
            <div>
              <div className="font-semibold text-white">
                {option.label}
              </div>
              <div className="text-sm text-gray-400">
                {option.sublabel}
              </div>
            </div>
            {selected === option.key && (
              <Check className="w-6 h-6 text-green-500" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Info box */}
      {selected && selected !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/30 rounded-lg p-4 border border-blue-800"
        >
          <p className="text-sm text-blue-300">
            Aggiungeremo sessioni di corsa leggera in Zona 2 per migliorare la tua resistenza
            e supportare il recupero tra gli allenamenti.
          </p>
        </motion.div>
      )}

      {/* Bottoni azione */}
      <div className="space-y-3 pt-2">
        {selected && selected !== 'none' && (
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
          >
            Aggiungi corsa al programma
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onSkip}
          className="w-full border-2 border-gray-700 text-gray-300 py-4 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          {selected === 'none' ? 'Continua senza corsa' : 'Salta per ora'}
        </button>
      </div>

      {/* Note */}
      <p className="text-center text-xs text-gray-500">
        Potrai sempre aggiungere o modificare il cardio in seguito
      </p>
    </div>
  );
}
