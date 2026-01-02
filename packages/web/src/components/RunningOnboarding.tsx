/**
 * Running Onboarding Component
 * Onboarding dedicato per l'allenamento aerobico/corsa
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Timer,
  Target,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  Activity,
  Zap,
  Trophy,
  Flame,
  Wind,
} from 'lucide-react';
import type {
  RunningGoal,
  RunningIntegration,
  RunningCapacity,
  RunningPreferences,
} from '@trainsmart/shared';
import { estimateHRMax, getZone2Range } from '@trainsmart/shared';

/**
 * Preset per sport che richiedono corsa obbligatoria
 * Permette di saltare goal/integration/frequency e fare solo screening capacità
 */
interface SportRunningPreset {
  goal: RunningGoal;
  integration: RunningIntegration;
  sessionsPerWeek: number;
  sportName: string;
}

interface RunningOnboardingProps {
  age: number;
  onComplete: (preferences: RunningPreferences) => void;
  onBack: () => void;
  includesWeights?: boolean; // true se l'utente vuole anche pesi
  sportPreset?: SportRunningPreset; // preset per sport che richiedono corsa
  strengthFrequency?: number; // frequenza allenamenti pesi (per calcolo giorni alternati)
}

type Step = 'capacity' | 'goal' | 'integration' | 'frequency' | 'hrTest' | 'summary';

const RUNNING_GOALS: { id: RunningGoal; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'base_aerobica',
    label: 'Base Aerobica',
    description: 'Costruire resistenza con Zone 2. Ideale per iniziare.',
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: 'preparazione_5k',
    label: 'Preparazione 5K',
    description: 'Programma per correre la tua prima 5K.',
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: 'preparazione_10k',
    label: 'Preparazione 10K',
    description: 'Programma per correre 10 km.',
    icon: <Trophy className="w-6 h-6" />,
  },
  {
    id: 'resistenza_generale',
    label: 'Resistenza Generale',
    description: 'Migliorare la capacità cardiovascolare.',
    icon: <Activity className="w-6 h-6" />,
  },
  {
    id: 'complemento_sport',
    label: 'Complemento Sport',
    description: 'Resistenza per prestazioni sportive.',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'dimagrimento_cardio',
    label: 'Dimagrimento',
    description: 'Cardio per bruciare calorie.',
    icon: <Flame className="w-6 h-6" />,
  },
  {
    id: 'recupero_attivo',
    label: 'Recupero Attivo',
    description: 'Corsa leggera tra sessioni pesi.',
    icon: <Wind className="w-6 h-6" />,
  },
];

const INTEGRATION_OPTIONS: { id: RunningIntegration; label: string; description: string }[] = [
  {
    id: 'separate_days',
    label: 'Giorni Separati',
    description: 'Pesi e running in giorni diversi (es. Lu/Me/Ve pesi, Ma/Gio running)',
  },
  {
    id: 'post_workout',
    label: 'Dopo i Pesi',
    description: 'Running breve (15-20min) dopo la sessione pesi',
  },
  {
    id: 'hybrid_alternate',
    label: 'Sessioni Ibride',
    description: 'Sessioni alternate pesi/running (ideale per sport)',
  },
];

/**
 * Requisiti minimi per ogni obiettivo running
 */
const GOAL_REQUIREMENTS: Record<RunningGoal, {
  minSessions: number;
  minWeeks: number;
  minLevel: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
  description: string;
  warning?: string;
}> = {
  base_aerobica: {
    minSessions: 2,
    minWeeks: 8,
    minLevel: 'sedentary',
    description: 'Costruire resistenza con corse facili in Zona 2',
  },
  preparazione_5k: {
    minSessions: 3,
    minWeeks: 8,
    minLevel: 'beginner',
    description: 'Richiede almeno 3 sessioni/sett e capacità di correre 10+ min',
    warning: 'Se non riesci ancora a correre 10 minuti, parti con "Base Aerobica" prima',
  },
  preparazione_10k: {
    minSessions: 3,
    minWeeks: 12,
    minLevel: 'intermediate',
    description: 'Richiede almeno 3 sessioni/sett e capacità di correre 30+ min',
    warning: 'Per la 10K serve già una buona base. Consigliato prima completare 5K',
  },
  resistenza_generale: {
    minSessions: 2,
    minWeeks: 8,
    minLevel: 'beginner',
    description: 'Migliorare la capacità cardiovascolare generale',
  },
  complemento_sport: {
    minSessions: 2,
    minWeeks: 6,
    minLevel: 'beginner',
    description: 'Running come supporto alle prestazioni sportive',
  },
  dimagrimento_cardio: {
    minSessions: 3,
    minWeeks: 8,
    minLevel: 'sedentary',
    description: 'Focus su volume e costanza per bruciare calorie',
    warning: 'Per dimagrire serve costanza: almeno 3 sessioni/sett per 8+ settimane',
  },
  recupero_attivo: {
    minSessions: 2,
    minWeeks: 4,
    minLevel: 'sedentary',
    description: 'Corse leggere per recupero tra sessioni pesi',
  },
};

export default function RunningOnboarding({
  age,
  onComplete,
  onBack,
  includesWeights = true,
  sportPreset,
  strengthFrequency: propStrengthFrequency,
}: RunningOnboardingProps) {
  const [step, setStep] = useState<Step>('capacity');
  const [capacity, setCapacity] = useState<RunningCapacity>({
    canRun5Min: false,
    canRun10Min: false,
    canRun20Min: false,
    canRun30Min: false,
  });
  // Se c'è un preset, usa quei valori, altrimenti default
  const [goal, setGoal] = useState<RunningGoal>(sportPreset?.goal || 'base_aerobica');
  const [integration, setIntegration] = useState<RunningIntegration>(sportPreset?.integration || 'separate_days');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(sportPreset?.sessionsPerWeek || 3);
  const [restingHR, setRestingHR] = useState<number | undefined>();

  // Frequenza pesi (per calcolo giorni alternati)
  const [strengthFrequency, setStrengthFrequency] = useState(propStrengthFrequency || 3);

  const hrMax = estimateHRMax(age);
  const zone2Range = getZone2Range(hrMax);

  // Calcola sessioni running disponibili per giorni alternati
  const getAvailableRunningDays = (strengthDays: number): { min: number; max: number; recommended: number } => {
    // Con N giorni pesi, abbiamo 7-N giorni disponibili per running
    // Ma vogliamo almeno 1 giorno di riposo totale
    const availableDays = 7 - strengthDays;
    const maxRunning = Math.min(availableDays - 1, 4); // Max 4, lascia almeno 1 giorno libero
    const minRunning = Math.max(2, Math.min(maxRunning, 2)); // Min 2 sessioni
    const recommended = Math.min(strengthDays, maxRunning); // Idealmente stesso numero dei pesi
    return { min: minRunning, max: maxRunning, recommended };
  };

  // Sessioni disponibili per hybrid_alternate
  const alternateRunningSessions = getAvailableRunningDays(strengthFrequency);

  // Step flow: con preset salta goal/integration/frequency
  // Normal: capacity → goal → integration → frequency → hrTest → summary
  // Sport preset: capacity → hrTest → summary
  const getNextStep = (current: Step): Step | null => {
    if (sportPreset) {
      // Flusso abbreviato per sport
      switch (current) {
        case 'capacity': return 'hrTest';
        case 'hrTest': return 'summary';
        case 'summary': return null;
        default: return 'hrTest';
      }
    } else {
      // Flusso normale
      switch (current) {
        case 'capacity': return 'goal';
        case 'goal': return includesWeights ? 'integration' : 'frequency';
        case 'integration': return 'frequency';
        case 'frequency': return 'hrTest';
        case 'hrTest': return 'summary';
        case 'summary': return null;
        default: return 'goal';
      }
    }
  };

  const getPrevStep = (current: Step): Step | null => {
    if (sportPreset) {
      switch (current) {
        case 'hrTest': return 'capacity';
        case 'summary': return 'hrTest';
        default: return null;
      }
    } else {
      switch (current) {
        case 'goal': return 'capacity';
        case 'integration': return 'goal';
        case 'frequency': return includesWeights ? 'integration' : 'goal';
        case 'hrTest': return 'frequency';
        case 'summary': return 'hrTest';
        default: return null;
      }
    }
  };

  // Determina livello running
  const getRunningLevel = (): 'sedentary' | 'beginner' | 'intermediate' | 'advanced' => {
    if (!capacity.canRun5Min) return 'sedentary';
    if (!capacity.canRun20Min) return 'beginner';
    if (!capacity.canRun30Min) return 'intermediate';
    return 'advanced';
  };

  // Ordine livelli per confronto
  const levelOrder = { sedentary: 0, beginner: 1, intermediate: 2, advanced: 3 };

  // Valida se obiettivo è raggiungibile
  const validateGoal = (selectedGoal: RunningGoal) => {
    const requirements = GOAL_REQUIREMENTS[selectedGoal];
    const userLevel = getRunningLevel();
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Controllo livello
    if (levelOrder[userLevel] < levelOrder[requirements.minLevel]) {
      issues.push(`Richiede livello "${requirements.minLevel}" ma sei "${userLevel}"`);
      if (selectedGoal === 'preparazione_5k' && userLevel === 'sedentary') {
        suggestions.push('Inizia con "Base Aerobica" per 8 settimane');
      } else if (selectedGoal === 'preparazione_10k') {
        suggestions.push('Completa prima una "Preparazione 5K"');
      }
    }

    // Controllo sessioni (sarà verificato dopo frequency step)
    if (sessionsPerWeek < requirements.minSessions) {
      issues.push(`Richiede almeno ${requirements.minSessions} sessioni/sett (tu hai ${sessionsPerWeek})`);
      suggestions.push(`Aumenta a ${requirements.minSessions} sessioni settimanali`);
    }

    return {
      isAchievable: issues.length === 0,
      issues,
      suggestions,
      requirements,
    };
  };

  // Obiettivi filtrati in base al livello
  const getGoalStatus = (g: RunningGoal) => {
    const requirements = GOAL_REQUIREMENTS[g];
    const userLevel = getRunningLevel();
    const isLevelOk = levelOrder[userLevel] >= levelOrder[requirements.minLevel];
    return {
      isAvailable: isLevelOk,
      needsHigherLevel: !isLevelOk,
      requirements,
    };
  };

  const handleComplete = () => {
    const preferences: RunningPreferences = {
      enabled: true,
      goal,
      integration: includesWeights ? integration : 'running_only',
      sessionsPerWeek,
      capacity: {
        ...capacity,
        restingHeartRate: restingHR,
      },
    };
    onComplete(preferences);
  };

  // Determina gli step in base al contesto
  // Sport preset: solo capacity → hrTest → summary (goal/integration/frequency pre-configurati)
  // Con pesi: capacity → goal → integration → frequency → hrTest → summary
  // Solo running: capacity → goal → frequency → hrTest → summary
  const steps: Step[] = sportPreset
    ? ['capacity', 'hrTest', 'summary']
    : includesWeights
      ? ['capacity', 'goal', 'integration', 'frequency', 'hrTest', 'summary']
      : ['capacity', 'goal', 'frequency', 'hrTest', 'summary'];

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-lg mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Configurazione Running</span>
            <span>{currentStepIndex + 1}/{steps.length}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Capacità Running */}
          {step === 'capacity' && (
            <motion.div
              key="capacity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Banner sport preset */}
              {sportPreset && (
                <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-100">
                        Corsa per {sportPreset.sportName}
                      </p>
                      <p className="text-sm text-blue-300 mt-1">
                        {sessionsPerWeek} sessioni/settimana • {integration === 'hybrid_alternate' ? 'Giorni alternati' : integration === 'separate_days' ? 'Giorni separati' : 'Post allenamento'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Test Capacità Running
                </h2>
                <p className="text-gray-400">
                  {sportPreset
                    ? 'Valutiamo il tuo livello attuale per calibrare il programma'
                    : 'Quanto riesci a correre senza fermarti?'}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'canRun5Min', label: '5 minuti', sublabel: 'Riesco a correre 5 minuti continui' },
                  { key: 'canRun10Min', label: '10 minuti', sublabel: 'Riesco a correre 10 minuti continui' },
                  { key: 'canRun20Min', label: '20 minuti', sublabel: 'Riesco a correre 20 minuti continui' },
                  { key: 'canRun30Min', label: '30+ minuti', sublabel: 'Riesco a correre 30 minuti o più' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      const key = item.key as keyof RunningCapacity;
                      const newValue = !capacity[key];
                      // Se attivi un livello, attiva anche quelli precedenti
                      const newCapacity = { ...capacity };
                      if (key === 'canRun30Min') {
                        newCapacity.canRun30Min = newValue;
                        if (newValue) {
                          newCapacity.canRun20Min = true;
                          newCapacity.canRun10Min = true;
                          newCapacity.canRun5Min = true;
                        }
                      } else if (key === 'canRun20Min') {
                        newCapacity.canRun20Min = newValue;
                        if (newValue) {
                          newCapacity.canRun10Min = true;
                          newCapacity.canRun5Min = true;
                        } else {
                          newCapacity.canRun30Min = false;
                        }
                      } else if (key === 'canRun10Min') {
                        newCapacity.canRun10Min = newValue;
                        if (newValue) {
                          newCapacity.canRun5Min = true;
                        } else {
                          newCapacity.canRun20Min = false;
                          newCapacity.canRun30Min = false;
                        }
                      } else {
                        newCapacity.canRun5Min = newValue;
                        if (!newValue) {
                          newCapacity.canRun10Min = false;
                          newCapacity.canRun20Min = false;
                          newCapacity.canRun30Min = false;
                        }
                      }
                      setCapacity(newCapacity);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      capacity[item.key as keyof RunningCapacity]
                        ? 'border-green-500 bg-green-900/30'
                        : 'border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.sublabel}
                      </div>
                    </div>
                    {capacity[item.key as keyof RunningCapacity] && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-100">
                      Livello: {getRunningLevel() === 'sedentary' ? 'Sedentario' :
                               getRunningLevel() === 'beginner' ? 'Principiante' :
                               getRunningLevel() === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                    </p>
                    <p className="text-sm text-blue-300">
                      {getRunningLevel() === 'sedentary'
                        ? 'Partirai con camminata/corsa alternata'
                        : getRunningLevel() === 'beginner'
                          ? 'Costruirai gradualmente fino a 45min'
                          : getRunningLevel() === 'intermediate'
                            ? 'Aggiungerai varietà: tempo e intervalli'
                            : 'Programma avanzato con lavori di qualità'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Obiettivo Running */}
          {step === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Obiettivo Running
                </h2>
                <p className="text-gray-400">
                  Cosa vuoi ottenere con la corsa?
                </p>
              </div>

              <div className="grid gap-3">
                {RUNNING_GOALS.map((g) => {
                  const status = getGoalStatus(g.id);
                  const isDisabled = status.needsHigherLevel;

                  return (
                    <button
                      key={g.id}
                      onClick={() => !isDisabled && setGoal(g.id)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        isDisabled
                          ? 'border-gray-700 opacity-50 cursor-not-allowed'
                          : goal === g.id
                            ? 'border-green-500 bg-green-900/30'
                            : 'border-gray-700 hover:border-green-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isDisabled
                          ? 'bg-gray-700 text-gray-400'
                          : goal === g.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-800 text-gray-400'
                      }`}>
                        {g.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {g.label}
                          {isDisabled && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-900 text-yellow-300 rounded">
                              Livello richiesto: {status.requirements.minLevel}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {g.description}
                        </div>
                        {status.requirements.minSessions > 2 && !isDisabled && (
                          <div className="text-xs text-blue-400 mt-1">
                            Richiede almeno {status.requirements.minSessions} sessioni/settimana
                          </div>
                        )}
                      </div>
                      {goal === g.id && !isDisabled && <Check className="w-6 h-6 text-green-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Warning se obiettivo ha requisiti */}
              {GOAL_REQUIREMENTS[goal].warning && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-200">
                        Nota importante
                      </p>
                      <p className="text-sm text-yellow-300">
                        {GOAL_REQUIREMENTS[goal].warning}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Integrazione (solo se include pesi) */}
          {step === 'integration' && includesWeights && (
            <motion.div
              key="integration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Come Integrare
                </h2>
                <p className="text-gray-400">
                  Come vuoi combinare running e pesi?
                </p>
              </div>

              <div className="space-y-3">
                {INTEGRATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setIntegration(opt.id);
                      // Se giorni alternati, imposta sessioni running al valore raccomandato
                      if (opt.id === 'hybrid_alternate') {
                        const available = getAvailableRunningDays(strengthFrequency);
                        setSessionsPerWeek(available.recommended);
                      }
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      integration === opt.id
                        ? 'border-green-500 bg-green-900/30'
                        : 'border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">
                          {opt.label}
                        </div>
                        <div className="text-sm text-gray-400">
                          {opt.description}
                        </div>
                      </div>
                      {integration === opt.id && <Check className="w-6 h-6 text-green-500" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selezione frequenza pesi per giorni alternati */}
              {integration === 'hybrid_alternate' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-teal-900/30 border border-teal-700 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-teal-100">Quanti giorni alleni coi pesi?</p>
                      <p className="text-sm text-teal-300 mt-1">
                        Serve per calcolare i giorni disponibili per la corsa
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    {[2, 3, 4, 5].map((num) => {
                      const available = getAvailableRunningDays(num);
                      return (
                        <button
                          key={num}
                          onClick={() => {
                            setStrengthFrequency(num);
                            setSessionsPerWeek(available.recommended);
                          }}
                          className={`w-14 h-14 rounded-xl border-2 font-bold text-lg transition-all ${
                            strengthFrequency === num
                              ? 'border-teal-500 bg-teal-900/50 text-teal-300'
                              : 'border-gray-600 text-gray-400 hover:border-teal-400'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-teal-200">
                      Con <strong>{strengthFrequency} giorni pesi</strong> hai{' '}
                      <strong>{alternateRunningSessions.max} giorni</strong> disponibili per la corsa
                    </p>
                    <p className="text-xs text-teal-300/70 mt-1">
                      Consigliato: {alternateRunningSessions.recommended} sessioni running
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Frequenza */}
          {step === 'frequency' && (
            <motion.div
              key="frequency"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Frequenza Running
                </h2>
                <p className="text-gray-400">
                  {integration === 'hybrid_alternate'
                    ? `Con ${strengthFrequency} giorni pesi, hai ${alternateRunningSessions.max} giorni disponibili`
                    : 'Quante sessioni di running a settimana?'}
                </p>
              </div>

              {/* Giorni alternati: opzioni limitate */}
              {integration === 'hybrid_alternate' ? (
                <>
                  <div className="flex justify-center gap-4">
                    {Array.from(
                      { length: alternateRunningSessions.max - alternateRunningSessions.min + 1 },
                      (_, i) => alternateRunningSessions.min + i
                    ).map((num) => {
                      const minRequired = GOAL_REQUIREMENTS[goal].minSessions;
                      const isBelowMin = num < minRequired;
                      const isRecommended = num === alternateRunningSessions.recommended;

                      return (
                        <button
                          key={num}
                          onClick={() => setSessionsPerWeek(num)}
                          className={`w-20 h-20 rounded-2xl border-2 font-bold text-2xl transition-all relative ${
                            sessionsPerWeek === num
                              ? isBelowMin
                                ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                                : 'border-green-500 bg-green-900/30 text-green-400'
                              : 'border-gray-700 text-gray-400 hover:border-green-300'
                          }`}
                        >
                          {num}
                          {isRecommended && sessionsPerWeek !== num && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-[10px] rounded-full flex items-center justify-center">
                              ★
                            </span>
                          )}
                          {isBelowMin && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                              !
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-4">
                    <p className="text-sm text-teal-200 text-center">
                      <strong>Giorni alternati:</strong> {strengthFrequency} pesi + {sessionsPerWeek} running = {strengthFrequency + sessionsPerWeek} giorni totali
                    </p>
                    <p className="text-xs text-teal-300/70 text-center mt-1">
                      {7 - strengthFrequency - sessionsPerWeek > 0
                        ? `Hai ancora ${7 - strengthFrequency - sessionsPerWeek} giorno/i di riposo completo`
                        : 'Attenzione: nessun giorno di riposo completo'}
                    </p>
                  </div>
                </>
              ) : (
                /* Altre modalità: opzioni standard */
                <div className="flex justify-center gap-4">
                  {[2, 3, 4].map((num) => {
                    const minRequired = GOAL_REQUIREMENTS[goal].minSessions;
                    const isBelowMin = num < minRequired;

                    return (
                      <button
                        key={num}
                        onClick={() => setSessionsPerWeek(num)}
                        className={`w-20 h-20 rounded-2xl border-2 font-bold text-2xl transition-all relative ${
                          sessionsPerWeek === num
                            ? isBelowMin
                              ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                              : 'border-green-500 bg-green-900/30 text-green-400'
                            : 'border-gray-700 text-gray-400 hover:border-green-300'
                        }`}
                      >
                        {num}
                        {isBelowMin && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                            !
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Validazione frequenza vs obiettivo */}
              {sessionsPerWeek < GOAL_REQUIREMENTS[goal].minSessions ? (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-200">
                        Frequenza insufficiente per "{RUNNING_GOALS.find(g => g.id === goal)?.label}"
                      </p>
                      <p className="text-sm text-yellow-300">
                        Questo obiettivo richiede almeno {GOAL_REQUIREMENTS[goal].minSessions} sessioni/settimana.
                        {integration === 'hybrid_alternate'
                          ? ` Con ${strengthFrequency} giorni pesi, considera di ridurre i pesi o cambiare obiettivo.`
                          : ' Considera obiettivo "Base Aerobica" o "Recupero Attivo".'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-900/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-300">
                    ✓ {sessionsPerWeek} sessioni sono adeguate per "{RUNNING_GOALS.find(g => g.id === goal)?.label}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {sessionsPerWeek === 2 && 'Ideale per iniziare o come complemento'}
                    {sessionsPerWeek === 3 && 'Frequenza ottimale per costruire base aerobica'}
                    {sessionsPerWeek === 4 && 'Per runner più esperti o focus endurance'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: FC a Riposo */}
          {step === 'hrTest' && (
            <motion.div
              key="hrTest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  FC a Riposo
                </h2>
                <p className="text-gray-400">
                  Misurala al mattino appena sveglio (opzionale)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequenza Cardiaca a Riposo (bpm)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={120}
                    value={restingHR || ''}
                    onChange={(e) => setRestingHR(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="es. 65"
                    className="w-full p-4 text-xl text-center border-2 border-gray-700 rounded-xl focus:border-green-500 focus:ring-green-500 bg-gray-800 text-white"
                  />
                </div>

                <div className="bg-blue-900/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>Come misurarla:</strong> Appena sveglio, prima di alzarti, conta i battiti per 60 secondi.
                    Oppure usa uno smartwatch o cardiofrequenzimetro.
                  </p>
                </div>

                <div className="bg-green-900/30 rounded-lg p-4">
                  <p className="font-medium text-green-100 mb-2">
                    Zone HR basate sulla tua età ({age} anni):
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-green-300">
                      FC Max stimata: <strong>{hrMax} bpm</strong>
                    </div>
                    <div className="text-green-300">
                      Zona 2 target: <strong>{zone2Range.min}-{zone2Range.max} bpm</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={goNext}
                  className="w-full text-center text-gray-400 py-2"
                >
                  Salta per ora →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Summary */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Riepilogo Running
                </h2>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Livello</span>
                  <span className="font-semibold text-white capitalize">
                    {getRunningLevel() === 'sedentary' ? 'Sedentario' :
                     getRunningLevel() === 'beginner' ? 'Principiante' :
                     getRunningLevel() === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Obiettivo</span>
                  <span className="font-semibold text-white">
                    {RUNNING_GOALS.find(g => g.id === goal)?.label}
                  </span>
                </div>
                {includesWeights && (
                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400">Integrazione</span>
                    <span className="font-semibold text-white">
                      {INTEGRATION_OPTIONS.find(i => i.id === integration)?.label}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Sessioni/Settimana</span>
                  <span className="font-semibold text-white">
                    {sessionsPerWeek}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-400">Zona 2 Target</span>
                  <span className="font-semibold text-green-400">
                    {zone2Range.min}-{zone2Range.max} bpm
                  </span>
                </div>
                {restingHR && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">FC Riposo</span>
                    <span className="font-semibold text-white">
                      {restingHR} bpm
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  Il tuo programma di 8 settimane ti porterà da{' '}
                  <strong>
                    {getRunningLevel() === 'sedentary' ? '0 a 20 minuti' :
                     getRunningLevel() === 'beginner' ? '20 a 45 minuti' :
                     getRunningLevel() === 'intermediate' ? '45 a 60+ minuti' : 'volume alto con qualità'}
                  </strong>
                  {' '}di corsa continua in Zona 2.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={goBack}
            className="flex-1 py-3 px-4 border-2 border-gray-700 rounded-xl font-medium text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Indietro
          </button>
          {step !== 'summary' ? (
            <button
              onClick={goNext}
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              Avanti
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Conferma
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
