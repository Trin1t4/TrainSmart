import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { OnboardingData, RunningPreferences } from '../types/onboarding.types';
import { useTranslation } from '../lib/i18n';
import AnagraficaStep from '../components/onboarding/AnagraficaStep';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import ScreeningTypeStep from '../components/onboarding/ScreeningTypeStep';
import LocationStep from '../components/onboarding/LocationStep';
import GoalStep from '../components/onboarding/GoalStep';
import MedicalDisclaimer from '../components/onboarding/MedicalDisclaimer';
import RunningOnboarding from '../components/RunningOnboarding';
import SimpleRunningCapacityStep from '../components/onboarding/SimpleRunningCapacityStep';
import {
  sportRequiresRunning,
  getSportRunningConfig,
  SportType
} from '../utils/sportSpecificTraining';

// Onboarding - 5 step + cardio opzionale alla fine
// 0. Anagrafica (nome, cognome, data nascita)
// 1. Personal Info (genere, età, altezza, peso)
// 2. Screening Type (approfondito vs leggero)
// 3. Location (casa/palestra)
// 4. Goal (obiettivo)
// 5. Cardio (opzionale, in base al goal e screening type)

// Goal che NON mostrano l'opzione cardio
const GOALS_WITHOUT_CARDIO = [
  'motor_recovery',
  'pre_partum',
  'post_partum',
  'disabilita',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showRunningOnboarding, setShowRunningOnboarding] = useState(false);
  const [showSimpleRunning, setShowSimpleRunning] = useState(false);
  const [sportRunningPreset, setSportRunningPreset] = useState<{
    goal: 'complemento_sport';
    integration: 'separate_days' | 'post_workout' | 'hybrid_alternate';
    sessionsPerWeek: number;
    sportName: string;
  } | null>(null);

  // Check if user already accepted disclaimer
  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem('medical_disclaimer_accepted');
    if (disclaimerAccepted === 'true') {
      setShowDisclaimer(false);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('medical_disclaimer_accepted', 'true');
    localStorage.setItem('medical_disclaimer_date', new Date().toISOString());
    setShowDisclaimer(false);
  };

  const handleDisclaimerDecline = () => {
    navigate('/');
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />
    );
  }

  const totalSteps = 5; // 0-4 (Anagrafica → Goal)
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    console.log('[ONBOARDING] 📝 Step data received:', stepData);
    console.log('[ONBOARDING] 📋 Current data state:', newData);
    setData(newData);
  };

  const saveOnboardingToDatabase = async (onboardingData: Partial<OnboardingData>) => {
    try {
      let user = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!user && attempts < maxAttempts) {
        attempts++;
        console.log(`[ONBOARDING] 🔄 Attempt ${attempts}/${maxAttempts} to get user session...`);
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (currentUser) {
          user = currentUser;
          console.log('[ONBOARDING] ✅ User session found:', user.email);
          break;
        }

        if (attempts < maxAttempts) {
          console.log('[ONBOARDING] ⏳ Session not ready, waiting 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.error('[ONBOARDING] ❌ User not authenticated after', maxAttempts, 'attempts:', userError);
          throw new Error('User not authenticated. Prova a fare logout e login di nuovo.');
        }
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('[ONBOARDING] 📤 Saving to Supabase:', JSON.stringify(onboardingData, null, 2));

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          onboarding_data: onboardingData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('[ONBOARDING] ❌ Error saving to database:', error);
        throw error;
      }

      console.log('[ONBOARDING] ✅ Onboarding saved to database successfully');
    } catch (error) {
      console.error('[ONBOARDING] ❌ Failed to save onboarding:', error);
      throw error;
    }
  };

  // Determina se mostrare cardio in base al goal
  const shouldShowCardio = (goalData: Partial<OnboardingData>): boolean => {
    const goals = goalData.goals || [];
    const primaryGoal = goals[0] || goalData.goal;

    // Goal esclusi dal cardio
    if (GOALS_WITHOUT_CARDIO.includes(primaryGoal || '')) {
      return false;
    }

    return true;
  };

  // Determina se lo sport richiede corsa obbligatoria
  const sportRequiresRunningCheck = (goalData: Partial<OnboardingData>): boolean => {
    const isSportGoal = goalData.goals?.includes('prestazioni_sportive') ||
                        goalData.goal === 'prestazioni_sportive';
    const selectedSport = goalData.sport as SportType | undefined;

    return isSportGoal && !!selectedSport && sportRequiresRunning(selectedSport);
  };

  const navigateToQuiz = (finalData: Partial<OnboardingData>) => {
    if (finalData.goal === 'motor_recovery') {
      console.log('[ONBOARDING] 🏥 Motor recovery → /recovery-screening');
      navigate('/recovery-screening');
    } else {
      const screeningType = finalData.screeningType;
      if (screeningType === 'thorough') {
        console.log('[ONBOARDING] 📊 Thorough screening → /quiz-full');
        navigate('/quiz-full');
      } else {
        console.log('[ONBOARDING] ⚡ Light screening → /quiz');
        navigate('/quiz');
      }
    }
  };

  const saveAndNavigate = async (finalData: Partial<OnboardingData>) => {
    setIsSaving(true);
    try {
      console.log('[ONBOARDING] 💾 Saving to localStorage...');
      localStorage.setItem('onboarding_data', JSON.stringify(finalData));

      console.log('[ONBOARDING] 🔄 Saving to Supabase...');
      await saveOnboardingToDatabase(finalData);

      navigateToQuiz(finalData);
    } catch (error) {
      console.error('[ONBOARDING] ❌ Error saving onboarding:', error);
      alert(t('onboarding.error.save_failed'));
      setIsSaving(false);
    }
  };

  const nextStep = async (mergedData?: Partial<OnboardingData>) => {
    const finalData = mergedData || data;

    if (currentStep < totalSteps - 1) {
      // Vai al prossimo step
      console.log(`[ONBOARDING] ➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    } else {
      // Step finale (GoalStep) - controlla cardio
      console.log('[ONBOARDING] 🎯 Final step completed, checking cardio...');

      if (!finalData.trainingLocation) {
        console.error('[ONBOARDING] ❌ LOCATION IS MISSING!');
        alert(t('onboarding.error.location_missing'));
        setCurrentStep(3);
        return;
      }

      // 1. Sport che richiede corsa obbligatoria → RunningOnboarding con preset
      if (sportRequiresRunningCheck(finalData)) {
        const selectedSport = finalData.sport as SportType;
        const sportRunningConfig = getSportRunningConfig(selectedSport);
        console.log(`[ONBOARDING] 🏃 Sport "${selectedSport}" requires running → showing RunningOnboarding`);

        const sportLabels: Record<string, string> = {
          calcio: 'Calcio', basket: 'Basket', rugby: 'Rugby',
          boxe: 'Boxe', tennis: 'Tennis', corsa: 'Corsa',
        };

        setSportRunningPreset({
          goal: 'complemento_sport',
          integration: sportRunningConfig.integration,
          sessionsPerWeek: sportRunningConfig.sessionsPerWeek,
          sportName: sportLabels[selectedSport] || selectedSport,
        });
        setShowRunningOnboarding(true);
        return;
      }

      // 2. Goal senza cardio → salva e vai al quiz
      if (!shouldShowCardio(finalData)) {
        console.log('[ONBOARDING] ⏭️ Goal without cardio → saving...');
        await saveAndNavigate(finalData);
        return;
      }

      // 3. Mostra opzione cardio in base al tipo di screening
      if (finalData.screeningType === 'thorough') {
        // Screening approfondito → RunningOnboarding completo
        console.log('[ONBOARDING] 🏃 Showing full RunningOnboarding (thorough screening)');
        setShowRunningOnboarding(true);
      } else {
        // Screening veloce → domanda semplice capacità
        console.log('[ONBOARDING] 🏃 Showing simple running capacity (light screening)');
        setShowSimpleRunning(true);
      }
    }
  };

  const prevStep = () => {
    if (showRunningOnboarding) {
      console.log('[ONBOARDING] ⬅️ Going back from RunningOnboarding');
      setShowRunningOnboarding(false);
      setSportRunningPreset(null);
      return;
    }

    if (showSimpleRunning) {
      console.log('[ONBOARDING] ⬅️ Going back from SimpleRunning');
      setShowSimpleRunning(false);
      return;
    }

    if (currentStep > 0) {
      console.log(`[ONBOARDING] ⬅️ Moving back from step ${currentStep} to ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    console.log(`[ONBOARDING] ✅ Step ${currentStep} completed with data:`, stepData);
    const mergedData = { ...data, ...stepData };
    updateData(stepData);
    nextStep(mergedData);
  };

  // Handler per completamento running onboarding (completo)
  const handleRunningOnboardingComplete = async (runningPrefs: RunningPreferences) => {
    console.log('[ONBOARDING] 🏃 Running onboarding completed:', runningPrefs);
    const finalData = { ...data, running: runningPrefs };
    setData(finalData);
    await saveAndNavigate(finalData);
  };

  // Handler per completamento simple running
  const handleSimpleRunningComplete = async (runningPrefs: RunningPreferences) => {
    console.log('[ONBOARDING] 🏃 Simple running completed:', runningPrefs);
    const finalData = { ...data, running: runningPrefs };
    setData(finalData);
    await saveAndNavigate(finalData);
  };

  // Handler per skip cardio
  const handleSkipCardio = async () => {
    console.log('[ONBOARDING] ⏭️ User skipped cardio');
    await saveAndNavigate(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AnagraficaStep data={data} onNext={handleStepComplete} />;
      case 1:
        return <PersonalInfoStep data={data} onNext={handleStepComplete} />;
      case 2:
        return <ScreeningTypeStep data={data} onNext={handleStepComplete} />;
      case 3:
        return <LocationStep data={data} onNext={handleStepComplete} />;
      case 4:
        return <GoalStep data={data} onNext={handleStepComplete} />;
      default:
        return null;
    }
  };

  // RunningOnboarding completo (screening approfondito o sport)
  if (showRunningOnboarding) {
    return (
      <RunningOnboarding
        age={data.personalInfo?.age || 30}
        onComplete={handleRunningOnboardingComplete}
        onBack={() => {
          setShowRunningOnboarding(false);
          setSportRunningPreset(null);
        }}
        includesWeights={true}
        sportPreset={sportRunningPreset || undefined}
      />
    );
  }

  // SimpleRunning (screening veloce)
  if (showSimpleRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
            <SimpleRunningCapacityStep
              onComplete={handleSimpleRunningComplete}
              onSkip={handleSkipCardio}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={prevStep}
              disabled={isSaving}
              className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition disabled:opacity-50"
            >
              ← {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{t('onboarding.title')}</h1>
            <span className="text-slate-300">{t('onboarding.step_of').replace('{{current}}', String(currentStep + 1)).replace('{{total}}', String(totalSteps))}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          {renderStep()}
        </div>

        <div className="flex gap-4 mt-6">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              disabled={isSaving}
              className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← {t('common.back')}
            </button>
          )}

          {isSaving && (
            <div className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('common.saving')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
