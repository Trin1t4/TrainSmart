import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../lib/i18n';
import { shouldSuggestFreeWeight, type FreeWeightSuggestion } from '@trainsmart/shared';
import FreeWeightSuggestionCard from '../components/FreeWeightSuggestionCard';

interface RecoveryScreeningProps {
  onComplete: (data: RecoveryData) => void;
  onSkip?: () => void;
  workoutExercises?: any[]; // Esercizi del workout per proposta peso libero
}

export interface RecoveryData {
  sleepHours: number;
  stressLevel: number;
  hasInjury: boolean;
  injuryDetails: string | null;
  menstrualCycle: 'follicular' | 'ovulation' | 'luteal' | 'menstruation' | 'menopause' | 'prefer_not_say' | null;
  isFemale: boolean;
  availableTime: number; // minuti disponibili per l'allenamento
  timestamp: string;
  // Free weight suggestion
  tryFreeWeight?: string | null; // Nome esercizio corpo libero accettato
  replaceMachine?: string | null; // Nome macchina da sostituire
}

export const RecoveryScreening: React.FC<RecoveryScreeningProps> = ({
  onComplete,
  onSkip,
  workoutExercises = [],
}) => {
  const { t } = useTranslation();
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [hasInjury, setHasInjury] = useState<boolean>(false);
  const [injuryDetails, setInjuryDetails] = useState<string>('');
  const [menstrualCycle, setMenstrualCycle] = useState<
    'follicular' | 'ovulation' | 'luteal' | 'menstruation' | 'menopause' | 'prefer_not_say' | null
  >(null);
  const [isFemale, setIsFemale] = useState<boolean>(false);
  const [hasMenopausePreference, setHasMenopausePreference] = useState<boolean>(false);
  const [availableTime, setAvailableTime] = useState<number>(45); // default 45 min

  // Free weight suggestion state
  const [freeWeightSuggestion, setFreeWeightSuggestion] = useState<FreeWeightSuggestion | null>(null);
  const [acceptedFreeWeight, setAcceptedFreeWeight] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);

  useEffect(() => {
    fetchUserGender();
  }, []);

  // Controlla se mostrare proposta peso libero quando cambiano le condizioni
  useEffect(() => {
    if (workoutExercises.length > 0) {
      const suggestion = shouldSuggestFreeWeight(
        {
          sleepHours,
          stressLevel,
          hasInjury,
          menstrualCycle: menstrualCycle || undefined
        },
        workoutExercises
      );

      if (suggestion.shouldSuggest) {
        setFreeWeightSuggestion(suggestion);
        // Mostra la proposta solo se le condizioni sono buone
        if (sleepHours >= 6.5 && stressLevel <= 5 && !hasInjury) {
          setShowSuggestion(true);
        }
      } else {
        setFreeWeightSuggestion(null);
        setShowSuggestion(false);
      }
    }
  }, [sleepHours, stressLevel, hasInjury, menstrualCycle, workoutExercises]);

  const fetchUserGender = async () => {
    try {
      // Check localStorage for saved menstrual preference (menopausa = chiedi una volta)
      const savedPreference = localStorage.getItem('menstrual_preference');
      if (savedPreference === 'menopause') {
        console.log('[RECOVERY] ✅ User has menopause preference saved - hiding menstrual section');
        setHasMenopausePreference(true);
        setMenstrualCycle('menopause'); // Auto-set per salvare nei dati
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('onboarding_data')
          .eq('user_id', userData.user.id)
          .single();

        if (profileData?.onboarding_data?.personalInfo?.gender === 'F') {
          setIsFemale(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user gender:', error);
    }
  };

  // Handler per salvare preferenza menopausa (chiedi una volta sola)
  const handleMenstrualChoice = (choice: 'menopause' | 'prefer_not_say' | 'follicular' | 'ovulation' | 'luteal' | 'menstruation') => {
    setMenstrualCycle(choice);

    // SOLO menopausa viene salvata (chiedi una volta)
    if (choice === 'menopause') {
      localStorage.setItem('menstrual_preference', 'menopause');
      console.log('[RECOVERY] 💾 Saved menopause preference - will not ask again');
      setHasMenopausePreference(true);
    }
    // Ciclo normale o "Non voglio rispondere" = NON salvare (chiedi sempre)
  };

  // Calcola gli adattamenti in tempo reale
  const getAdaptations = () => {
    const adaptations: string[] = [];

    // Tempo disponibile
    if (availableTime <= 20) {
      adaptations.push('⚡ Allenamento Express - solo esercizi principali');
    } else if (availableTime <= 30) {
      adaptations.push('🏃 Allenamento Veloce - riduzione pause e accessori');
    } else if (availableTime >= 75) {
      adaptations.push('🏋️ Allenamento Completo - tutti gli esercizi + accessori');
    }

    if (sleepHours < 6) {
      const reduction = sleepHours < 5 ? 30 : 20;
      adaptations.push(`🔻 Volume ridotto del ${reduction}% per sonno insufficiente`);
    }

    if (stressLevel >= 8) {
      adaptations.push('🔻 Intensità ridotta del 20% per stress elevato');
    } else if (stressLevel >= 6) {
      adaptations.push('⚠️ Intensità ridotta del 10% per stress moderato');
    }

    if (hasInjury && injuryDetails) {
      adaptations.push('🩹 Esercizi modificati per evitare zone doloranti');
    }

    if (isFemale && menstrualCycle === 'menstruation') {
      adaptations.push('🔴 Intensità ottimizzata per fase mestruale');
    }

    if (isFemale && menstrualCycle === 'menopause') {
      adaptations.push('🧘‍♀️ Programma ottimizzato per menopausa (focus resistenza)');
    }

    if (adaptations.length === 0) {
      return ['✅ Nessun adattamento necessario - Allenamento standard'];
    }

    return adaptations;
  };

  const handleComplete = async () => {
    const recoveryData: RecoveryData = {
      sleepHours,
      stressLevel,
      hasInjury,
      injuryDetails: hasInjury ? injuryDetails : null,
      menstrualCycle: isFemale ? menstrualCycle : null,
      isFemale,
      availableTime,
      timestamp: new Date().toISOString(),
      // Free weight suggestion accepted
      tryFreeWeight: acceptedFreeWeight,
      replaceMachine: acceptedFreeWeight && freeWeightSuggestion ? freeWeightSuggestion.machineExercise : null,
    };

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('recovery_tracking').insert({
          user_id: userData.user.id,
          sleep_hours: sleepHours,
          stress_level: stressLevel,
          has_injury: hasInjury,
          injury_details: hasInjury ? injuryDetails : null,
          menstrual_cycle: isFemale ? menstrualCycle : null,
          is_female: isFemale,
          available_time: availableTime,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving recovery data:', error);
    }

    onComplete(recoveryData);
  };

  const adaptations = getAdaptations();
  const hasWarnings = sleepHours < 6 || stressLevel >= 6 || hasInjury;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 my-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('screening.title')}</h2>
          <p className="text-gray-600">{t('screening.subtitle')}</p>
        </div>

        <div className="space-y-8">
          {/* Tempo Disponibile */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900">⏱️ Quanto tempo hai oggi?</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { min: 20, label: '20 min', icon: '⚡', desc: 'Express' },
                { min: 30, label: '30 min', icon: '🏃', desc: 'Veloce' },
                { min: 45, label: '45 min', icon: '💪', desc: 'Standard' },
                { min: 60, label: '60 min', icon: '🔥', desc: 'Completo' },
                { min: 90, label: '90+ min', icon: '🏋️', desc: 'Lungo' },
              ].map((option) => (
                <button
                  key={option.min}
                  onClick={() => setAvailableTime(option.min)}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${
                    availableTime === option.min
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl">{option.icon}</div>
                  <div className="font-bold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sonno */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900">💤 {t('screening.sleep')}</span>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-3xl font-bold text-emerald-600 w-16 text-center">{sleepHours}h</span>
              </div>
              <div className="mt-2 text-sm">
                {sleepHours < 6 && <span className="text-red-600 font-medium">⚠️ {t('screening.sleep_insufficient')}</span>}
                {sleepHours >= 6 && sleepHours <= 9 && <span className="text-emerald-600 font-medium">✅ {t('screening.sleep_optimal')}</span>}
                {sleepHours > 9 && <span className="text-amber-600 font-medium">⚠️ {t('screening.sleep_excessive')}</span>}
              </div>
            </label>
          </div>

          {/* Stress */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900">😰 {t('screening.stress')}</span>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-3xl font-bold text-emerald-600 w-16 text-center">{stressLevel}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                1 = Completamente rilassato | 10 = Stress massimo
              </div>
            </label>
          </div>

          {/* Dolori */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900">🩹 {t('screening.pain_question')}</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHasInjury(false);
                  setInjuryDetails('');
                }}
                className={`flex-1 p-4 border-2 rounded-xl font-semibold transition-all ${
                  !hasInjury
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ✅ {t('screening.no_pain')}
              </button>
              <button
                onClick={() => setHasInjury(true)}
                className={`flex-1 p-4 border-2 rounded-xl font-semibold transition-all ${
                  hasInjury
                    ? 'bg-red-100 border-red-500 text-red-900'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🩹 {t('screening.have_pain')}
              </button>
            </div>

            {hasInjury && (
              <textarea
                value={injuryDetails}
                onChange={(e) => setInjuryDetails(e.target.value)}
                placeholder="Descrivi dove hai dolore (es. spalla destra, ginocchio sinistro, lombare...)"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                rows={3}
              />
            )}
          </div>

          {/* Ciclo Mestruale (solo donne) - NASCONDI se ha salvato menopausa */}
          {isFemale && !hasMenopausePreference && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-lg font-semibold text-gray-900">🩸 Fase del ciclo mestruale</span>
                <p className="text-xs text-gray-500 mt-1">
                  Se scegli "Menopausa", non ti chiederemo più questa domanda
                </p>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleMenstrualChoice('menstruation')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'menstruation'
                      ? 'bg-red-100 border-red-500 text-red-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🔴 Mestruazione<br/><span className="text-xs font-normal">(Giorni 1-5)</span>
                </button>
                <button
                  onClick={() => handleMenstrualChoice('follicular')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'follicular'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🟢 Follicolare<br/><span className="text-xs font-normal">(Giorni 6-12)</span>
                </button>
                <button
                  onClick={() => handleMenstrualChoice('ovulation')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'ovulation'
                      ? 'bg-amber-100 border-amber-500 text-amber-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🟡 Ovulazione<br/><span className="text-xs font-normal">(Giorni 13-15)</span>
                </button>
                <button
                  onClick={() => handleMenstrualChoice('luteal')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'luteal'
                      ? 'bg-orange-100 border-orange-500 text-orange-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🟠 Luteale<br/><span className="text-xs font-normal">(Giorni 16-28)</span>
                </button>
                {/* NUOVE OPZIONI: Menopausa + Non voglio rispondere */}
                <button
                  onClick={() => handleMenstrualChoice('menopause')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'menopause'
                      ? 'bg-purple-100 border-purple-500 text-purple-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🧘‍♀️ Menopausa<br/><span className="text-xs font-normal">(Non chiederò più)</span>
                </button>
                <button
                  onClick={() => handleMenstrualChoice('prefer_not_say')}
                  className={`p-4 border-2 rounded-xl font-semibold text-sm transition-all ${
                    menstrualCycle === 'prefer_not_say'
                      ? 'bg-gray-100 border-gray-500 text-gray-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🙅‍♀️ Preferisco non rispondere<br/><span className="text-xs font-normal">(Chiederò ogni volta)</span>
                </button>
              </div>
            </div>
          )}

          {/* Badge info se ha menopausa salvata */}
          {isFemale && hasMenopausePreference && (
            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧘‍♀️</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Programma ottimizzato per menopausa
                  </p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Focus su resistenza, densità ossea e recupero. Preferenza salvata.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Proposta peso libero (solo se condizioni ottimali) */}
          {showSuggestion && freeWeightSuggestion && !acceptedFreeWeight && (
            <FreeWeightSuggestionCard
              machineExercise={freeWeightSuggestion.machineExercise}
              freeWeightAlternative={freeWeightSuggestion.freeWeightAlternative}
              freeWeightDescription={freeWeightSuggestion.freeWeightDescription}
              videoUrl={freeWeightSuggestion.videoUrl}
              onAccept={() => {
                setAcceptedFreeWeight(freeWeightSuggestion.freeWeightAlternative);
                setShowSuggestion(false);
              }}
              onDecline={() => {
                setShowSuggestion(false);
              }}
            />
          )}

          {/* Badge se ha accettato la proposta */}
          {acceptedFreeWeight && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💪</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Oggi provi: {acceptedFreeWeight}
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Inizierai con peso leggero per imparare la tecnica
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Box Adattamenti AdaptFlow */}
          <div className={`p-5 rounded-xl border-2 ${
            hasWarnings
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              🎯 AdaptFlow - Adattamenti per oggi
            </h3>
            <div className="space-y-2">
              {adaptations.map((adaptation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-900 font-medium">{adaptation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottoni */}
          <div className="flex gap-3 pt-4">
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
              >
                Salta
              </button>
            )}
            <button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all"
            >
              🚀 {t('screening.start_workout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
