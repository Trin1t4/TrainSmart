/**
 * HYBRID RECOVERY MODE ACTIVATION MODAL
 *
 * Modal multi-step per attivare Recovery Mode in itinere per area corporea specifica.
 * Si attiva quando dolore persistente (≥4) dopo 3 tentativi di riduzione.
 *
 * STEP 1: Conferma attivazione
 * STEP 2: Selezione area corporea dolorante
 * STEP 3: Riepilogo esercizi coinvolti + parametri recovery
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, Activity, TrendingDown } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface HybridRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  exerciseName: string;
  painLevel: number;
  sessions: number;
  allExercises: string[]; // Tutti gli esercizi del workout corrente
  onActivate: (bodyArea: string, affectedExercises: string[]) => void;
  onSkip: () => void;
}

interface BodyAreaMapping {
  primary: string[];
  secondary: string[];
  icon: string;
}

// ============================================================================
// BODY AREA EXERCISE MAPPING
// ============================================================================

const BODY_AREA_EXERCISE_MAP: Record<string, BodyAreaMapping> = {
  lower_back: {
    primary: ['Squat', 'Deadlift', 'Good Morning', 'Romanian DL', 'Back Squat', 'Front Squat'],
    secondary: ['Leg Press', 'Lunges', 'Step-ups'],
    icon: '🦴'
  },
  knee: {
    primary: ['Squat', 'Leg Extension', 'Leg Press', 'Lunges', 'Bulgarian Split Squat'],
    secondary: ['Deadlift', 'Leg Curl', 'Step-ups'],
    icon: '🦵'
  },
  shoulder: {
    primary: ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press', 'Military Press'],
    secondary: ['Bench Press', 'Dips', 'Pullups', 'Incline Press'],
    icon: '💪'
  },
  hip: {
    primary: ['Hip Thrust', 'Lunges', 'Bulgarian Split Squat', 'Step-ups'],
    secondary: ['Squat', 'Deadlift', 'Leg Press'],
    icon: '🦿'
  },
  neck: {
    primary: ['Shrugs', 'Neck Extensions'],
    secondary: ['Overhead Press', 'Upright Row'],
    icon: '🦴'
  },
  ankle: {
    primary: ['Calf Raise', 'Seated Calf Raise', 'Jump'],
    secondary: ['Squat', 'Lunges', 'Leg Press'],
    icon: '🦵'
  },
  elbow: {
    primary: ['Bicep Curl', 'Tricep Extension', 'Skull Crushers'],
    secondary: ['Bench Press', 'Overhead Press', 'Rows'],
    icon: '🦴'
  },
  wrist: {
    primary: ['Wrist Curl', 'Reverse Wrist Curl'],
    secondary: ['Bench Press', 'Overhead Press', 'Deadlift'],
    icon: '✋'
  }
};

const BODY_AREA_LABELS: Record<string, string> = {
  lower_back: 'Lower Back',
  knee: 'Ginocchio',
  shoulder: 'Spalla',
  hip: 'Anca',
  neck: 'Collo',
  ankle: 'Caviglia',
  elbow: 'Gomito',
  wrist: 'Polso'
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function HybridRecoveryModal({
  open,
  onClose,
  exerciseName,
  painLevel,
  sessions,
  allExercises,
  onActivate,
  onSkip
}: HybridRecoveryModalProps) {
  const [step, setStep] = useState<'confirm' | 'select_area' | 'summary'>('confirm');
  const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);
  const [affectedExercises, setAffectedExercises] = useState<{
    primary: string[];
    secondary: string[];
    normal: string[];
  }>({ primary: [], secondary: [], normal: [] });

  // Reset step on modal open
  useEffect(() => {
    if (open) {
      setStep('confirm');
      setSelectedBodyArea(null);
      setAffectedExercises({ primary: [], secondary: [], normal: [] });
    }
  }, [open]);

  // Identifica esercizi coinvolti quando area selezionata
  useEffect(() => {
    if (!selectedBodyArea) return;

    const mapping = BODY_AREA_EXERCISE_MAP[selectedBodyArea];
    if (!mapping) return;

    const primary: string[] = [];
    const secondary: string[] = [];
    const normal: string[] = [];

    allExercises.forEach(exName => {
      const isPrimary = mapping.primary.some(pattern =>
        exName.toLowerCase().includes(pattern.toLowerCase())
      );
      const isSecondary = mapping.secondary.some(pattern =>
        exName.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isPrimary) {
        primary.push(exName);
      } else if (isSecondary) {
        secondary.push(exName);
      } else {
        normal.push(exName);
      }
    });

    setAffectedExercises({ primary, secondary, normal });

    console.log('🔍 Affected exercises identified:', { primary, secondary, normal });
  }, [selectedBodyArea, allExercises]);

  if (!open) return null;

  // ========================================================================
  // STEP 1: CONFERMA ATTIVAZIONE
  // ========================================================================

  const renderConfirmStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-red-500/20">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            DOLORE PERSISTENTE ({painLevel}/10)
          </h2>
          <p className="text-slate-400 text-sm">
            Rilevato per {sessions} sessioni consecutive
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Situazione */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-300 font-semibold mb-2">
          Dopo 3 tentativi di riduzione il dolore persiste durante:
        </p>
        <p className="text-white text-lg font-bold">
          {exerciseName}
        </p>
      </div>

      {/* Proposta */}
      <div className="space-y-3">
        <p className="text-slate-300 font-semibold">
          Vuoi attivare RECOVERY MODE per questa area corporea?
        </p>
        <p className="text-slate-400 text-sm">
          Il Recovery Mode ti permetterà di:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-slate-300">
            <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Continuare allenamento normale per il resto del corpo</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Recuperare gradualmente l'area dolorosa con parametri ridotti</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Non perdere sessioni e mantenere progressi</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSkip}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          No, salta esercizio
        </button>
        <button
          onClick={() => setStep('select_area')}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Sì, attiva Recovery
        </button>
      </div>

      {/* Info Note */}
      <p className="text-slate-500 text-xs text-center">
        Il Recovery Mode applicherà parametri ridotti (2 sets, 40-60% carico, ROM 50%) solo agli esercizi che coinvolgono l'area dolorosa.
      </p>
    </motion.div>
  );

  // ========================================================================
  // STEP 2: SELEZIONE AREA CORPOREA
  // ========================================================================

  const renderSelectAreaStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-500/20">
            <Activity className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              QUALE AREA CORPOREA?
            </h2>
            <p className="text-slate-400 text-sm">
              Seleziona l'area che causa dolore
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

      {/* Body Area Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(BODY_AREA_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedBodyArea(key);
              setStep('summary');
            }}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedBodyArea === key
                ? 'border-orange-500 bg-orange-500/20'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{BODY_AREA_EXERCISE_MAP[key].icon}</span>
              <span className="text-white font-semibold">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => setStep('confirm')}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-lg transition-colors"
      >
        Indietro
      </button>
    </motion.div>
  );

  // ========================================================================
  // STEP 3: SUMMARY
  // ========================================================================

  const renderSummaryStep = () => {
    if (!selectedBodyArea) return null;

    const bodyAreaLabel = BODY_AREA_LABELS[selectedBodyArea];
    const totalAffected = affectedExercises.primary.length + affectedExercises.secondary.length;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                RECOVERY MODE ATTIVATO
              </h2>
              <p className="text-slate-400 text-sm">
                Area: {bodyAreaLabel}
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

        {/* Affected Exercises */}
        <div className="space-y-4">
          {/* Primary affected */}
          {affectedExercises.primary.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Esercizi in RECOVERY MODE ({affectedExercises.primary.length})
              </p>
              <div className="space-y-2">
                {affectedExercises.primary.map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                    <span className="text-slate-300 text-sm">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary affected */}
          {affectedExercises.secondary.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Esercizi con cautela ({affectedExercises.secondary.length})
              </p>
              <div className="space-y-2">
                {affectedExercises.secondary.map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                    <span className="text-slate-300 text-sm">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal exercises */}
          {affectedExercises.normal.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Altri esercizi: NORMALI ({affectedExercises.normal.length})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {affectedExercises.normal.slice(0, 6).map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-400 text-xs truncate">{ex}</span>
                  </div>
                ))}
                {affectedExercises.normal.length > 6 && (
                  <span className="text-slate-500 text-xs col-span-2">
                    +{affectedExercises.normal.length - 6} altri...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recovery Parameters */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-slate-300 font-semibold mb-3">Parametri Recovery:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">Sets</p>
              <p className="text-white font-bold">2</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">Reps</p>
              <p className="text-white font-bold">8-10</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">Carico</p>
              <p className="text-white font-bold">40-60%</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">ROM</p>
              <p className="text-white font-bold">50% (ridotto)</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const allAffected = [...affectedExercises.primary, ...affectedExercises.secondary];
              onActivate(selectedBodyArea, allAffected);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Continua Workout
          </button>

          <button
            onClick={() => setStep('select_area')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-lg transition-colors"
          >
            Cambia area corporea
          </button>
        </div>

        {/* Info Note */}
        <p className="text-slate-500 text-xs text-center">
          Il sistema monitorerà il dolore e proporrà progressioni quando l'area sarà recuperata.
        </p>
      </motion.div>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

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
          className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {step === 'confirm' && renderConfirmStep()}
            {step === 'select_area' && renderSelectAreaStep()}
            {step === 'summary' && renderSummaryStep()}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
