import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion, safeMotionVariants } from '../../hooks/useReducedMotion';
import { Button } from '../ui/button';
import {
  Home, Building2, ChevronLeft, ChevronRight,
  Check, AlertCircle, Dumbbell
} from 'lucide-react';
import type {
  QuickStartData,
  QuickStartGoal,
  QuickStartLocation,
  ExperienceLevel,
} from '@trainsmart/shared';

// =============================================================================
// TYPES
// =============================================================================

type Step = 'goal-location' | 'frequency-experience' | 'pain-summary';

interface QuickStartFlowV2Props {
  userId: string;
  onComplete: (data: QuickStartData) => Promise<void>;
}

// =============================================================================
// OPTIONS
// =============================================================================

const GOALS: { value: QuickStartGoal; emoji: string; label: string; desc: string }[] = [
  { value: 'forza', emoji: '💪', label: 'Forza', desc: 'Aumenta la tua forza massimale' },
  { value: 'massa', emoji: '🏋️', label: 'Massa', desc: 'Costruisci muscoli' },
  { value: 'dimagrimento', emoji: '🔥', label: 'Dimagrimento', desc: 'Perdi grasso, mantieni muscoli' },
  { value: 'resistenza', emoji: '🏃', label: 'Resistenza', desc: 'Migliora stamina e capacità aerobica' },
  { value: 'generale', emoji: '🎯', label: 'Fitness Generale', desc: 'Un po\' di tutto' },
];

const PAIN_AREAS = [
  { id: 'shoulders', label: 'Spalle', emoji: '🦾' },
  { id: 'elbows', label: 'Gomiti', emoji: '💪' },
  { id: 'wrists', label: 'Polsi', emoji: '✋' },
  { id: 'upper_back', label: 'Parte alta schiena', emoji: '🔙' },
  { id: 'lower_back', label: 'Zona lombare', emoji: '⬇️' },
  { id: 'hips', label: 'Anche', emoji: '🦴' },
  { id: 'knees', label: 'Ginocchia', emoji: '🦵' },
  { id: 'ankles', label: 'Caviglie', emoji: '🦶' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function QuickStartFlowV2({ userId, onComplete }: QuickStartFlowV2Props) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  // Step state
  const [step, setStep] = useState<Step>('goal-location');

  // Form data
  const [goal, setGoal] = useState<QuickStartGoal | null>(null);
  const [location, setLocation] = useState<QuickStartLocation | null>(null);
  const [frequency, setFrequency] = useState<2 | 3 | 4 | 5 | 6>(3);
  const [experience, setExperience] = useState<{
    squat: ExperienceLevel;
    push: ExperienceLevel;
    hinge: ExperienceLevel;
  }>({ squat: 'sometimes', push: 'sometimes', hinge: 'sometimes' });
  const [painAreas, setPainAreas] = useState<string[]>([]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation variants
  const variants = safeMotionVariants.slideUp(reducedMotion);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleNext = () => {
    if (step === 'goal-location' && goal && location) {
      setStep('frequency-experience');
    } else if (step === 'frequency-experience') {
      setStep('pain-summary');
    }
  };

  const handleBack = () => {
    if (step === 'frequency-experience') {
      setStep('goal-location');
    } else if (step === 'pain-summary') {
      setStep('frequency-experience');
    }
  };

  const handleComplete = async () => {
    if (!goal || !location) return;

    setIsGenerating(true);
    setError(null);

    try {
      const data: QuickStartData = {
        goal,
        location,
        frequency,
        painAreas,
        experience,
      };
      await onComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePainArea = (id: string) => {
    setPainAreas(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  // Validation per procedere
  const canProceedStep1 = goal !== null && location !== null;
  const canComplete = canProceedStep1;

  // Progress percentage
  const progress = step === 'goal-location' ? 33 : step === 'frequency-experience' ? 66 : 100;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header con Progress */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 safe-area-top">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              {step === 'goal-location' && 'Step 1 di 3'}
              {step === 'frequency-experience' && 'Step 2 di 3'}
              {step === 'pain-summary' && 'Step 3 di 3'}
            </span>
            <span className="text-sm text-emerald-400 font-medium">{progress}%</span>
          </div>

          {/* Progress bar - clickabile per navigare */}
          <div className="flex gap-1">
            <button
              onClick={() => setStep('goal-location')}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step === 'goal-location' ? 'bg-emerald-500' :
                progress > 33 ? 'bg-emerald-500/50' : 'bg-slate-700'
              }`}
              aria-label="Vai a step 1"
            />
            <button
              onClick={() => canProceedStep1 && setStep('frequency-experience')}
              disabled={!canProceedStep1}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step === 'frequency-experience' ? 'bg-emerald-500' :
                progress > 66 ? 'bg-emerald-500/50' : 'bg-slate-700'
              }`}
              aria-label="Vai a step 2"
            />
            <button
              onClick={() => canProceedStep1 && setStep('pain-summary')}
              disabled={!canProceedStep1}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step === 'pain-summary' ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Vai a step 3"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: Goal + Location */}
            {step === 'goal-location' && (
              <motion.div
                key="step1"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2 }}
              >
                {/* Goal Selection */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Qual è il tuo obiettivo?</h2>
                  <p className="text-slate-400 mb-4">Scegli l'obiettivo principale</p>

                  <div className="grid gap-3">
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => setGoal(g.value)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left min-h-[64px] ${
                          goal === g.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <div>
                          <p className="font-medium text-white">{g.label}</p>
                          <p className="text-sm text-slate-400">{g.desc}</p>
                        </div>
                        {goal === g.value && (
                          <Check className="ml-auto w-5 h-5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Selection */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Dove ti alleni?</h2>
                  <p className="text-slate-400 mb-4">Personalizzeremo gli esercizi</p>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setLocation('home')}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all min-h-[120px] ${
                        location === 'home'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <Home className={`w-10 h-10 ${location === 'home' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="font-medium text-white">Casa</span>
                    </button>

                    <button
                      onClick={() => setLocation('gym')}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all min-h-[120px] ${
                        location === 'gym'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <Building2 className={`w-10 h-10 ${location === 'gym' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="font-medium text-white">Palestra</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Frequency + Experience */}
            {step === 'frequency-experience' && (
              <motion.div
                key="step2"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2 }}
              >
                {/* Frequency */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Quante volte a settimana?</h2>
                  <p className="text-slate-400 mb-4">Scegli la frequenza che riesci a mantenere</p>

                  <div className="flex justify-center gap-3">
                    {([2, 3, 4, 5, 6] as const).map(n => (
                      <button
                        key={n}
                        onClick={() => setFrequency(n)}
                        className={`w-14 h-14 rounded-xl font-bold text-xl transition-all ${
                          frequency === n
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">La tua esperienza</h2>
                  <p className="text-slate-400 mb-4">Quanto spesso esegui questi pattern?</p>

                  {(['squat', 'push', 'hinge'] as const).map(pattern => (
                    <div key={pattern} className="mb-4">
                      <p className="text-sm font-medium text-slate-300 mb-2">
                        {pattern === 'squat' && '🦵 Squat (accosciate, affondi)'}
                        {pattern === 'push' && '💪 Push (panca, push-up)'}
                        {pattern === 'hinge' && '🏋️ Hinge (stacco, good morning)'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['never', 'sometimes', 'regularly'] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => setExperience(prev => ({ ...prev, [pattern]: level }))}
                            className={`py-3 px-2 rounded-lg text-sm font-medium transition-all min-h-[48px] ${
                              experience[pattern] === level
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {level === 'never' && 'Mai'}
                            {level === 'sometimes' && 'A volte'}
                            {level === 'regularly' && 'Regolarmente'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Pain + Summary */}
            {step === 'pain-summary' && (
              <motion.div
                key="step3"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.2 }}
              >
                {/* Pain Areas */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Zone sensibili</h2>
                  <p className="text-slate-400 mb-4">
                    Hai dolori o fastidi? Adatteremo gli esercizi. (Opzionale)
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {PAIN_AREAS.map(area => (
                      <button
                        key={area.id}
                        onClick={() => togglePainArea(area.id)}
                        className={`flex items-center gap-2 py-3 px-4 rounded-lg transition-all min-h-[48px] ${
                          painAreas.includes(area.id)
                            ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{area.emoji}</span>
                        <span className="text-sm font-medium">{area.label}</span>
                      </button>
                    ))}
                  </div>

                  {painAreas.length === 0 && (
                    <p className="text-center text-slate-500 mt-3 text-sm">
                      Nessuna zona selezionata - Ottimo!
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    Riepilogo
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Obiettivo</span>
                      <span className="text-white font-medium">
                        {GOALS.find(g => g.value === goal)?.emoji} {GOALS.find(g => g.value === goal)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Luogo</span>
                      <span className="text-white font-medium">
                        {location === 'home' ? '🏠 Casa' : '🏢 Palestra'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frequenza</span>
                      <span className="text-white font-medium">{frequency}x / settimana</span>
                    </div>
                    {painAreas.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Zone sensibili</span>
                        <span className="text-amber-400 font-medium">{painAreas.length} aree</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer con navigazione */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 px-4 py-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step !== 'goal-location' && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Indietro
            </Button>
          )}

          {step !== 'pain-summary' ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={step === 'goal-location' && !canProceedStep1}
              className="flex-1"
            >
              Avanti
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              disabled={!canComplete}
              loading={isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Generazione...' : 'Crea il mio programma'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
