/**
 * PRE-WORKOUT DISCOMFORT CHECK - DCSS Paradigm
 * 
 * Componente per il check del fastidio prima dell'allenamento.
 * Approccio collaborativo: l'utente sceglie come procedere.
 * 
 * PRINCIPI:
 * 1. "Fastidio" invece di "dolore" (meno allarmante)
 * 2. Sempre dare scelta all'utente
 * 3. Tolerable discomfort education
 * 4. Mai bloccare, sempre supportare
 * 5. Livello 7+ = consiglio forte di non procedere, ma scelta rimane all'utente per 7
 *    Livello 8+ = non permettiamo "procedi comunque"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  Heart,
  Zap
} from 'lucide-react';
import {
  getPreWorkoutDiscomfortResponse,
  getBodyAreaLabelIt,
  TOLERABLE_DISCOMFORT_REMINDER,
  STOP_THRESHOLD,
  type DiscomfortLevel,
  type UserChoice
} from './painMessages';

// ============================================================================
// TYPES
// ============================================================================

interface BodyArea {
  id: string;
  label: string;
  labelIt: string;
  icon: string;
}

interface PreWorkoutResult {
  hasDiscomfort: boolean;
  discomfortAreas: Array<{
    area: string;
    level: DiscomfortLevel;
  }>;
  userChoice: UserChoice;
  loadReduction?: number;
  skipAreas?: string[];
  alternativeExercises?: Record<string, string>;
}

interface PreWorkoutDiscomfortCheckProps {
  onComplete: (result: PreWorkoutResult) => void;
  onSkip: () => void;
  exercisesInSession?: string[];  // Per suggerire alternative
  alternativesMap?: Record<string, string>;  // exercise -> alternative
  language?: 'it' | 'en';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BODY_AREAS: BodyArea[] = [
  { id: 'neck', label: 'Neck', labelIt: 'Collo', icon: '🦴' },
  { id: 'shoulder', label: 'Shoulder', labelIt: 'Spalla', icon: '💪' },
  { id: 'upper_back', label: 'Upper Back', labelIt: 'Dorsale', icon: '🔙' },
  { id: 'lower_back', label: 'Lower Back', labelIt: 'Lombare', icon: '⬇️' },
  { id: 'hip', label: 'Hip', labelIt: 'Anca', icon: '🦴' },
  { id: 'knee', label: 'Knee', labelIt: 'Ginocchio', icon: '🦵' },
  { id: 'ankle', label: 'Ankle', labelIt: 'Caviglia', icon: '👟' },
  { id: 'elbow', label: 'Elbow', labelIt: 'Gomito', icon: '💪' },
  { id: 'wrist', label: 'Wrist', labelIt: 'Polso', icon: '🤚' }
];

const INTENSITY_LEVELS: { value: DiscomfortLevel; label: string; labelIt: string; color: string }[] = [
  { value: 1, label: 'Barely noticeable', labelIt: 'Appena percettibile', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 2, label: 'Very mild', labelIt: 'Molto lieve', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 3, label: 'Mild', labelIt: 'Lieve', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 4, label: 'Moderate', labelIt: 'Moderato', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 5, label: 'Moderate+', labelIt: 'Moderato+', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 6, label: 'Bothersome', labelIt: 'Fastidioso', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 7, label: 'Significant', labelIt: 'Significativo', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 8, label: 'Strong', labelIt: 'Forte', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 9, label: 'Very strong', labelIt: 'Molto forte', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 10, label: 'Maximum', labelIt: 'Massimo', color: 'bg-red-100 text-red-700 border-red-300' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PreWorkoutDiscomfortCheck({
  onComplete,
  onSkip,
  exercisesInSession = [],
  alternativesMap = {},
  language = 'it'
}: PreWorkoutDiscomfortCheckProps) {
  const [step, setStep] = useState<'initial' | 'selectArea' | 'selectIntensity' | 'showOptions'>('initial');
  const [hasDiscomfort, setHasDiscomfort] = useState<boolean | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<DiscomfortLevel | null>(null);
  const [showTolerableInfo, setShowTolerableInfo] = useState(false);

  const t = (it: string, en: string) => language === 'it' ? it : en;

  // Handle "No discomfort" selection
  const handleNoDiscomfort = () => {
    onComplete({
      hasDiscomfort: false,
      discomfortAreas: [],
      userChoice: 'continue_normal'
    });
  };

  // Handle area selection
  const handleAreaSelect = (areaId: string) => {
    setSelectedArea(areaId);
    setStep('selectIntensity');
  };

  // Handle intensity selection
  const handleIntensitySelect = (level: DiscomfortLevel) => {
    setSelectedIntensity(level);
    setStep('showOptions');
  };

  // Handle user choice from options
  const handleUserChoice = (choice: UserChoice, loadReduction?: number) => {
    if (!selectedArea || selectedIntensity === null) return;

    onComplete({
      hasDiscomfort: true,
      discomfortAreas: [{ area: selectedArea, level: selectedIntensity }],
      userChoice: choice,
      loadReduction,
      skipAreas: choice === 'skip_exercise' ? [selectedArea] : undefined,
      alternativeExercises: choice === 'switch_exercise' ? { [selectedArea]: alternativesMap[selectedArea] || '' } : undefined
    });
  };

  // Get response based on current selection
  const getResponse = () => {
    if (!selectedArea || selectedIntensity === null) return null;
    
    const area = BODY_AREAS.find(a => a.id === selectedArea);
    const areaLabel = area?.label || selectedArea;
    const areaLabelIt = area?.labelIt || selectedArea;
    const alternative = alternativesMap[selectedArea];

    return getPreWorkoutDiscomfortResponse(
      selectedIntensity,
      areaLabel,
      areaLabelIt,
      exercisesInSession[0] || 'esercizio',
      alternative
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* ============ STEP 1: Initial Question ============ */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {t('Come ti senti oggi?', 'How are you feeling today?')}
                </h1>
                <p className="text-slate-400">
                  {t(
                    'Segnala eventuali fastidi per adattare la sessione',
                    'Report any discomfort to adapt the session'
                  )}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <button
                  onClick={handleNoDiscomfort}
                  className="w-full p-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">✅</div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-white">
                        {t('Nessun fastidio', 'No discomfort')}
                      </div>
                      <div className="text-sm text-emerald-300">
                        {t('Mi sento bene, iniziamo!', "I feel good, let's go!")}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-emerald-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setHasDiscomfort(true);
                    setStep('selectArea');
                  }}
                  className="w-full p-6 rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">⚠️</div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-white">
                        {t('Ho un fastidio', 'I have some discomfort')}
                      </div>
                      <div className="text-sm text-amber-300">
                        {t('Voglio segnalare una zona', 'I want to report an area')}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-amber-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Tolerable Discomfort Info */}
              <button
                onClick={() => setShowTolerableInfo(!showTolerableInfo)}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
              >
                <Info className="w-4 h-4" />
                {t('Info sul fastidio durante l\'allenamento', 'Info about discomfort during training')}
              </button>

              {showTolerableInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                >
                  <p className="text-sm text-blue-300">
                    {language === 'it' 
                      ? TOLERABLE_DISCOMFORT_REMINDER.messageIt 
                      : TOLERABLE_DISCOMFORT_REMINDER.message}
                  </p>
                </motion.div>
              )}

              {/* Skip */}
              <button
                onClick={onSkip}
                className="w-full text-center text-slate-500 hover:text-slate-400 transition-colors text-sm"
              >
                {t('Salta questo check', 'Skip this check')}
              </button>
            </motion.div>
          )}

          {/* ============ STEP 2: Select Area ============ */}
          {step === 'selectArea' && (
            <motion.div
              key="selectArea"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">
                  {t('Dove senti il fastidio?', 'Where do you feel the discomfort?')}
                </h2>
                <p className="text-slate-400 text-sm">
                  {t('Seleziona la zona interessata', 'Select the affected area')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {BODY_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaSelect(area.id)}
                    className="p-4 rounded-xl border-2 border-slate-600 bg-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">{area.icon}</span>
                    <span className="text-sm text-slate-300">
                      {language === 'it' ? area.labelIt : area.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('initial')}
                className="w-full text-center text-slate-500 hover:text-slate-400 transition-colors"
              >
                ← {t('Indietro', 'Back')}
              </button>
            </motion.div>
          )}

          {/* ============ STEP 3: Select Intensity ============ */}
          {step === 'selectIntensity' && (
            <motion.div
              key="selectIntensity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">
                  {t('Quanto è intenso?', 'How intense is it?')}
                </h2>
                <p className="text-slate-400 text-sm">
                  {t('1 = appena percettibile, 10 = massimo', '1 = barely noticeable, 10 = maximum')}
                </p>
              </div>

              {/* Intensity Scale */}
              <div className="space-y-2">
                {INTENSITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => handleIntensitySelect(level.value)}
                    className={`w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all hover:scale-[1.02] ${level.color}`}
                  >
                    <span className="font-bold text-lg w-8">{level.value}</span>
                    <span className="flex-1 text-left">
                      {language === 'it' ? level.labelIt : level.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Guidance note */}
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 text-center">
                  {t(
                    '💡 Un fastidio 1-3 è generalmente accettabile durante l\'allenamento',
                    '💡 Discomfort 1-3 is generally acceptable during training'
                  )}
                </p>
              </div>

              <button
                onClick={() => setStep('selectArea')}
                className="w-full text-center text-slate-500 hover:text-slate-400 transition-colors"
              >
                ← {t('Indietro', 'Back')}
              </button>
            </motion.div>
          )}

          {/* ============ STEP 4: Show Options ============ */}
          {step === 'showOptions' && selectedIntensity !== null && (
            <motion.div
              key="showOptions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {(() => {
                const response = getResponse();
                if (!response) return null;

                const area = BODY_AREAS.find(a => a.id === selectedArea);
                const areaLabel = language === 'it' ? area?.labelIt : area?.label;

                return (
                  <>
                    {/* Header with intensity */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                        selectedIntensity <= 3 ? 'bg-green-500/20 text-green-300' :
                        selectedIntensity <= 6 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        <span className="font-bold">{selectedIntensity}/10</span>
                        <span>{areaLabel}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        {language === 'it' ? response.primaryMessageIt : response.primaryMessage}
                      </h2>
                    </div>

                    {/* Educational Note */}
                    {response.educationalNote && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-sm text-blue-300">
                          💡 {language === 'it' ? response.educationalNoteIt : response.educationalNote}
                        </p>
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400 font-medium">
                        {t('Come vuoi procedere?', 'How would you like to proceed?')}
                      </p>
                      
                      {response.options.map((option, index) => (
                        <button
                          key={option.choice}
                          onClick={() => handleUserChoice(option.choice, option.loadReduction)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                            option.recommended 
                              ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20' 
                              : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              option.recommended ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
                            }`}>
                              {option.recommended ? <CheckCircle className="w-3 h-3" /> : <span className="text-xs">{index + 1}</span>}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                {language === 'it' ? option.labelIt : option.label}
                                {option.recommended && (
                                  <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
                                    {t('Consigliato', 'Recommended')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                {language === 'it' ? option.descriptionIt : option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Professional Advice */}
                    {response.showProfessionalAdvice && (
                      <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-400">
                            {language === 'it' 
                              ? response.professionalAdviceMessageIt 
                              : response.professionalAdviceMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tolerable Discomfort Reminder */}
                    {response.tolerableDiscomfortReminder && (
                      <p className="text-xs text-center text-slate-500">
                        {t(
                          'Ricorda: un fastidio fino a 3-4/10 che non peggiora è generalmente ok.',
                          'Remember: discomfort up to 3-4/10 that doesn\'t worsen is generally ok.'
                        )}
                      </p>
                    )}

                    <button
                      onClick={() => setStep('selectIntensity')}
                      className="w-full text-center text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      ← {t('Indietro', 'Back')}
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { PreWorkoutResult, PreWorkoutDiscomfortCheckProps };
