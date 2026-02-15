/**
 * MaximalsInput.tsx
 *
 * Componente per l'inserimento facoltativo dei massimali.
 * Supporta sia bilanciere che macchine (per neofiti).
 *
 * Esercizi supportati:
 * - Bilanciere: Panca, Squat, Stacco, Military, LAT, Pulley
 * - Macchine: Chest Press, Pressa, Shoulder Press
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, ChevronDown, ChevronUp, Info, CheckCircle,
  Save, X, HelpCircle
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface UserMaximals {
  // Bilanciere (1RM o 5RM)
  benchPress?: { weight: number; repMax: 1 | 5 };
  squat?: { weight: number; repMax: 1 | 5 };
  deadlift?: { weight: number; repMax: 1 | 5 };
  militaryPress?: { weight: number; repMax: 1 | 5 };

  // Cavi
  latPulldown?: { weight: number };
  seatedRow?: { weight: number };

  // Macchine (alternative per neofiti)
  chestPress?: { weight: number };
  legPress?: { weight: number };
  shoulderPress?: { weight: number };

  // Metadata
  updatedAt?: string;
  source?: 'user_input' | 'calculated' | 'test';
}

interface MaximalsInputProps {
  initialData?: UserMaximals;
  onSave: (maximals: UserMaximals) => void;
  onSkip?: () => void;
  showSkip?: boolean;
  compact?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BARBELL_EXERCISES = [
  {
    key: 'benchPress',
    label: 'Panca Piana',
    icon: '🏋️',
    pattern: 'horizontal_push',
    description: 'Distensioni su panca con bilanciere'
  },
  {
    key: 'squat',
    label: 'Squat',
    icon: '🦵',
    pattern: 'lower_push',
    description: 'Squat con bilanciere'
  },
  {
    key: 'deadlift',
    label: 'Stacco',
    icon: '💪',
    pattern: 'lower_pull',
    description: 'Stacco da terra'
  },
  {
    key: 'militaryPress',
    label: 'Military Press',
    icon: '🏋️',
    pattern: 'vertical_push',
    description: 'Distensioni sopra la testa'
  },
];

const CABLE_EXERCISES = [
  {
    key: 'latPulldown',
    label: 'LAT Machine',
    icon: '⬇️',
    pattern: 'vertical_pull',
    description: 'Tirate al lat machine'
  },
  {
    key: 'seatedRow',
    label: 'Pulley',
    icon: '➡️',
    pattern: 'horizontal_pull',
    description: 'Rematore ai cavi'
  },
];

const MACHINE_EXERCISES = [
  {
    key: 'chestPress',
    label: 'Chest Press',
    icon: '🔲',
    pattern: 'horizontal_push',
    description: 'Alternativa alla panca per neofiti'
  },
  {
    key: 'legPress',
    label: 'Pressa',
    icon: '🦵',
    pattern: 'lower_push',
    description: 'Alternativa allo squat per neofiti'
  },
  {
    key: 'shoulderPress',
    label: 'Shoulder Press',
    icon: '⬆️',
    pattern: 'vertical_push',
    description: 'Alternativa al military per neofiti'
  },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ExerciseInputProps {
  exercise: typeof BARBELL_EXERCISES[0];
  value?: { weight: number; repMax?: 1 | 5 };
  onChange: (value: { weight: number; repMax?: 1 | 5 } | undefined) => void;
  showRepMax?: boolean;
}

function ExerciseInput({ exercise, value, onChange, showRepMax = true }: ExerciseInputProps) {
  const [localWeight, setLocalWeight] = useState(value?.weight?.toString() || '');
  const [repMax, setRepMax] = useState<1 | 5>(value?.repMax || 5);
  const [showInfo, setShowInfo] = useState(false);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalWeight(newValue);

    if (newValue === '' || newValue === '0') {
      onChange(undefined);
    } else {
      const weight = parseFloat(newValue);
      if (!isNaN(weight) && weight > 0) {
        onChange({ weight, repMax });
      }
    }
  };

  const handleRepMaxChange = (newRepMax: 1 | 5) => {
    setRepMax(newRepMax);
    if (localWeight && parseFloat(localWeight) > 0) {
      onChange({ weight: parseFloat(localWeight), repMax: newRepMax });
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{exercise.icon}</span>
          <div>
            <div className="font-semibold text-white">{exercise.label}</div>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              {showInfo ? 'Nascondi' : 'Info'}
            </button>
          </div>
        </div>

        {value?.weight && (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        )}
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-400 mb-3 bg-slate-700/50 p-2 rounded"
          >
            {exercise.description}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="number"
            min="0"
            step="2.5"
            value={localWeight}
            onChange={handleWeightChange}
            placeholder="kg"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {showRepMax && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleRepMaxChange(1)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                repMax === 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              1RM
            </button>
            <button
              type="button"
              onClick={() => handleRepMaxChange(5)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                repMax === 5
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              5RM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MaximalsInput({
  initialData,
  onSave,
  onSkip,
  showSkip = true,
  compact = false
}: MaximalsInputProps) {
  const [maximals, setMaximals] = useState<UserMaximals>(initialData || {});
  const [showMachines, setShowMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateMaximal = (key: string, value: { weight: number; repMax?: 1 | 5 } | undefined) => {
    setMaximals(prev => {
      if (value === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    const dataToSave: UserMaximals = {
      ...maximals,
      updatedAt: new Date().toISOString(),
      source: 'user_input'
    };

    // Simula un breve delay per feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    onSave(dataToSave);
    setIsSaving(false);
  };

  const hasAnyMaximal = Object.keys(maximals).some(
    key => !['updatedAt', 'source'].includes(key) && maximals[key as keyof UserMaximals]
  );

  const filledCount = Object.keys(maximals).filter(
    key => !['updatedAt', 'source'].includes(key) && maximals[key as keyof UserMaximals]
  ).length;

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header */}
      {!compact && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Conosci i tuoi massimali?</h2>
          <p className="text-slate-400 mt-2">
            Se sai quanto sollevi, inseriscilo qui. Il sistema calibrerà i carichi automaticamente.
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-semibold mb-1">Non sai i tuoi massimali?</p>
          <p className="text-blue-300/80">
            Nessun problema! Salta questo passaggio e li testeremo insieme alla prima seduta.
          </p>
        </div>
      </div>

      {/* Barbell Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>🏋️</span> Bilanciere
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BARBELL_EXERCISES.map(exercise => (
            <ExerciseInput
              key={exercise.key}
              exercise={exercise}
              value={maximals[exercise.key as keyof UserMaximals] as any}
              onChange={(value) => updateMaximal(exercise.key, value)}
              showRepMax={true}
            />
          ))}
        </div>
      </div>

      {/* Cable Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>🔗</span> Cavi / Pulley
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CABLE_EXERCISES.map(exercise => (
            <ExerciseInput
              key={exercise.key}
              exercise={exercise}
              value={maximals[exercise.key as keyof UserMaximals] as any}
              onChange={(value) => updateMaximal(exercise.key, value)}
              showRepMax={false}
            />
          ))}
        </div>
      </div>

      {/* Machines Section (Collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowMachines(!showMachines)}
          className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition"
        >
          <div className="flex items-center gap-2">
            <span>🔲</span>
            <span className="font-semibold text-white">Macchine</span>
            <span className="text-xs text-slate-400">(per chi preferisce)</span>
          </div>
          {showMachines ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showMachines && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {MACHINE_EXERCISES.map(exercise => (
                <ExerciseInput
                  key={exercise.key}
                  exercise={exercise}
                  value={maximals[exercise.key as keyof UserMaximals] as any}
                  onChange={(value) => updateMaximal(exercise.key, value)}
                  showRepMax={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!showMachines && (
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Se non usi il bilanciere, clicca qui per inserire i massimali alle macchine
          </p>
        )}
      </div>

      {/* Summary */}
      {hasAnyMaximal && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">
                {filledCount} massimali inseriti
              </span>
            </div>
            <span className="text-xs text-emerald-400/70">
              I carichi verranno calcolati automaticamente
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 bg-slate-700 text-slate-300 py-4 rounded-lg font-semibold text-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Non li conosco
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {hasAnyMaximal ? 'Salva massimali' : 'Continua senza'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS (exported for use elsewhere)
// ============================================================================

// 1RM utilities — SSOT import from shared
export { calculate1RMFrom5RM, calculate5RMFrom1RM, calculatePercentage1RM as calculatePercentage } from '@trainsmart/shared';

/**
 * Normalizza i massimali a 1RM per uniformità
 */
export function normalizeMaximalsTo1RM(maximals: UserMaximals): Record<string, number> {
  const normalized: Record<string, number> = {};

  const barbellKeys = ['benchPress', 'squat', 'deadlift', 'militaryPress'];

  for (const key of barbellKeys) {
    const value = maximals[key as keyof UserMaximals] as { weight: number; repMax: 1 | 5 } | undefined;
    if (value?.weight) {
      normalized[key] = value.repMax === 5
        ? calculate1RMFrom5RM(value.weight)
        : value.weight;
    }
  }

  // Cavi e macchine non hanno repMax, li salviamo come sono
  const otherKeys = ['latPulldown', 'seatedRow', 'chestPress', 'legPress', 'shoulderPress'];
  for (const key of otherKeys) {
    const value = maximals[key as keyof UserMaximals] as { weight: number } | undefined;
    if (value?.weight) {
      normalized[key] = value.weight;
    }
  }

  return normalized;
}

/**
 * Mappa pattern → massimale da usare (con fallback macchine)
 */
export function getMaximalForPattern(
  pattern: string,
  maximals: UserMaximals
): number | null {
  const normalized = normalizeMaximalsTo1RM(maximals);

  const patternMapping: Record<string, string[]> = {
    horizontal_push: ['benchPress', 'chestPress'],
    vertical_push: ['militaryPress', 'shoulderPress'],
    lower_push: ['squat', 'legPress'],
    lower_pull: ['deadlift'],
    vertical_pull: ['latPulldown'],
    horizontal_pull: ['seatedRow'],
  };

  const candidates = patternMapping[pattern] || [];

  for (const key of candidates) {
    if (normalized[key]) {
      return normalized[key];
    }
  }

  return null;
}
