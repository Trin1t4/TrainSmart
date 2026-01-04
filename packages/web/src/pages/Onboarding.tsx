import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { OnboardingData } from '../types/onboarding.types';
import { useTranslation } from '../lib/i18n';
import AnagraficaStep from '../components/onboarding/AnagraficaStep';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import GoalStep from '../components/onboarding/GoalStep';
import RunningInterestStep from '../components/onboarding/RunningInterestStep';
import RunningOnboarding from '../components/RunningOnboarding';
import LocationStep from '../components/onboarding/LocationStep';
import ScreeningTypeStep from '../components/onboarding/ScreeningTypeStep';
import MedicalDisclaimer from '../components/onboarding/MedicalDisclaimer';
import {
  sportRequiresRunning,
  SportType
} from '../utils/sportSpecificTraining';
import type { RunningPreferences } from '@trainsmart/shared';

// Onboarding - 6 step (running condizionale)
// 0. Anagrafica (nome, cognome, data nascita)
// 1. Personal Info (genere, età, altezza, peso)
// 2. Goal (obiettivo)
// 3. Running Interest (condizionale - solo interesse + livello)
// 4. Location + Frequenza
// 5. Screening Type (approfondito vs leggero)
// → Poi salva e vai al quiz appropriato

// Goal che NON mostrano l'opzione running
const GOALS_WITHOUT_RUNNING = [
  'motor_recovery',
  'pre_partum',
  'post_partum',
  'disabilita',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth(); // User già verificato da ProtectedRoute
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [skipRunningStep, setSkipRunningStep] = useState(false);
  const [showRunningOnboarding, setShowRunningOnboarding] = useState(false);

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

  // Calcola step totali (5 se skip running, 6 se include running)
  const totalSteps = skipRunningStep ? 5 : 6;
  const effectiveStep = skipRunningStep && currentStep > 2 ? currentStep - 1 : currentStep;
  const progress = ((effectiveStep + 1) / totalSteps) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    console.log('[ONBOARDING] 📝 Step data received:', stepData);
    console.log('[ONBOARDING] 📋 Current data state:', newData);
    setData(newData);
  };

  const saveOnboardingToDatabase = async (onboardingData: Partial<OnboardingData>) => {
    try {
      // User già disponibile da useAuth (verificato da ProtectedRoute)
      if (!user) {
        console.error('[ONBOARDING] ❌ User not available from auth hook');
        throw new Error('User not authenticated. Prova a fare logout e login di nuovo.');
      }

      console.log('[ONBOARDING] ✅ Using authenticated user:', user.email);
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

  // Determina se mostrare lo step running in base al goal
  const shouldShowRunningStep = (goalData: Partial<OnboardingData>): boolean => {
    const goals = goalData.goals || [];
    const primaryGoal = goals[0] || goalData.goal;

    // Goal esclusi dal running
    if (GOALS_WITHOUT_RUNNING.includes(primaryGoal || '')) {
      return false;
    }

    return true;
  };

  // Determina se lo sport richiede corsa obbligatoria
  const checkSportRequiresRunning = (goalData: Partial<OnboardingData>): boolean => {
    // Se l'obiettivo è corsa, la corsa è ovviamente obbligatoria
    if (goalData.goals?.includes('corsa') || goalData.goal === 'corsa') {
      return true;
    }

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

  // Steps: 0=Anagrafica, 1=PersonalInfo, 2=Goal, 3=Running(condizionale), 4=Location, 5=ScreeningType
  const nextStep = async (mergedData?: Partial<OnboardingData>) => {
    const finalData = mergedData || data;

    // Step 2 (Goal) completato → determina se mostrare Running
    if (currentStep === 2) {
      // Se lo sport richiede running obbligatoriamente, vai direttamente a RunningOnboarding completo
      const requiresRunning = checkSportRequiresRunning(finalData);
      if (requiresRunning) {
        console.log('[ONBOARDING] 🏃 Sport requires running, showing full RunningOnboarding');
        setShowRunningOnboarding(true);
        setSkipRunningStep(false);
        setCurrentStep(3);
        return;
      }

      const showRunning = shouldShowRunningStep(finalData);
      console.log(`[ONBOARDING] 🎯 Goal completed, showRunning: ${showRunning}`);

      if (!showRunning) {
        // Skip running step, vai direttamente a Location (step 4)
        setSkipRunningStep(true);
        console.log('[ONBOARDING] ⏭️ Skipping running step → Location');
        setCurrentStep(4);
        return;
      } else {
        setSkipRunningStep(false);
      }
    }

    // Step 5 (ScreeningType) completato → salva e naviga
    if (currentStep === 5) {
      console.log('[ONBOARDING] 🎯 Final step completed, saving...');

      if (!finalData.trainingLocation) {
        console.error('[ONBOARDING] ❌ LOCATION IS MISSING!');
        alert(t('onboarding.error.location_missing'));
        setCurrentStep(4);
        return;
      }

      await saveAndNavigate(finalData);
      return;
    }

    // Vai al prossimo step normale
    console.log(`[ONBOARDING] ➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Se siamo a Location (4) e avevamo skippato running, torna a Goal (2)
      if (currentStep === 4 && skipRunningStep) {
        console.log('[ONBOARDING] ⬅️ Going back from Location to Goal (skipped running)');
        setCurrentStep(2);
        return;
      }

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

  // Handler per RunningInterestStep
  const handleRunningInterestComplete = (stepData: { runningInterest: { enabled: boolean; level?: string; goal?: string; integration?: string } }) => {
    console.log('[ONBOARDING] 🏃 Running interest completed:', stepData);
    console.log('[ONBOARDING] 🏃 Full runningInterest object:', JSON.stringify(stepData.runningInterest, null, 2));

    // Verifica che tutti i campi necessari siano presenti se enabled
    if (stepData.runningInterest.enabled) {
      if (!stepData.runningInterest.goal) {
        console.warn('[ONBOARDING] ⚠️ Running enabled but goal is missing!');
      }
      if (!stepData.runningInterest.integration) {
        console.warn('[ONBOARDING] ⚠️ Running enabled but integration is missing!');
      }
    }

    const mergedData = { ...data, ...stepData };
    updateData(stepData as Partial<OnboardingData>);
    nextStep(mergedData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AnagraficaStep data={data} onNext={handleStepComplete} />;
      case 1:
        return <PersonalInfoStep data={data} onNext={handleStepComplete} onBack={prevStep} />;
      case 2:
        return <GoalStep data={data} onNext={handleStepComplete} onBack={prevStep} />;
      case 3:
        // Se l'utente ha detto sì al running, mostra l'onboarding completo
        if (showRunningOnboarding) {
          return (
            <RunningOnboarding
              age={data.personalInfo?.age || 30}
              onComplete={(runningPrefs: RunningPreferences) => {
                console.log('[ONBOARDING] 🏃 Running preferences completed:', runningPrefs);
                // Salva le preferenze running COMPLETE nel campo 'running'
                const updatedData = { ...data, running: runningPrefs };
                setData(updatedData);
                setShowRunningOnboarding(false);
                // Vai al prossimo step (Location)
                setCurrentStep(4);
              }}
              onBack={() => {
                setShowRunningOnboarding(false);
                // L'utente può tornare indietro e dire "no" al running
              }}
              includesWeights={true}
              strengthFrequency={data.activityLevel?.weeklyFrequency || 3}
            />
          );
        }

        // Altrimenti mostra RunningInterestStep per chiedere SE vuole running
        return (
          <RunningInterestStep
            data={data}
            onNext={(stepData) => {
              console.log('[ONBOARDING] 🏃 Running interest:', stepData);

              if (stepData.runningInterest?.enabled) {
                // L'utente VUOLE running → converti i dati in RunningPreferences
                // e vai direttamente a Location (senza passare per RunningOnboarding)
                const ri = stepData.runningInterest;

                // Mappa il livello calcolato alla capacità nel formato RunningCapacity
                const levelToCapacity: Record<string, { canRun5Min: boolean; canRun10Min: boolean; canRun20Min: boolean; canRun30Min: boolean }> = {
                  'sedentary': { canRun5Min: false, canRun10Min: false, canRun20Min: false, canRun30Min: false },
                  'beginner': { canRun5Min: true, canRun10Min: true, canRun20Min: false, canRun30Min: false },
                  'intermediate': { canRun5Min: true, canRun10Min: true, canRun20Min: true, canRun30Min: false },
                  'advanced': { canRun5Min: true, canRun10Min: true, canRun20Min: true, canRun30Min: true }
                };

                // Mappa il goal di RunningInterestStep al formato RunningGoal
                const goalMapping: Record<string, string> = {
                  'build_base': 'base_aerobica',
                  'weight_loss': 'dimagrimento_cardio',
                  'health': 'base_aerobica',
                  'run_5k': 'preparazione_5k',
                  'improve_endurance': 'resistenza_generale',
                  'run_5k_time': 'preparazione_5k',
                  'run_10k': 'preparazione_10k',
                  'run_10k_time': 'preparazione_10k',
                  'half_marathon': 'preparazione_10k',
                  'speed_work': 'resistenza_generale'
                };

                // Costruisci RunningPreferences complete
                const runningPrefs: RunningPreferences = {
                  enabled: true,
                  goal: (goalMapping[ri.goal || ''] || 'base_aerobica') as RunningPreferences['goal'],
                  integration: ri.integration === 'post_workout' ? 'post_workout' : 'separate_days',
                  sessionsPerWeek: ri.integration === 'post_workout' ? 2 : 3,
                  capacity: {
                    ...levelToCapacity[ri.level || 'sedentary'],
                    currentPace: ri.currentPace,
                    restingHeartRate: ri.restingHR,
                  },
                };

                console.log('[ONBOARDING] 🏃 Converted to RunningPreferences:', runningPrefs);

                // Salva sia runningInterest (per backward compat) che running (nuovo formato)
                const updatedData = {
                  ...data,
                  runningInterest: stepData.runningInterest,
                  running: runningPrefs
                };
                setData(updatedData);

                // Vai direttamente a Location (step 4)
                setCurrentStep(4);
              } else {
                // L'utente NON vuole running → salva e vai a Location
                updateData(stepData as Partial<OnboardingData>);
                setCurrentStep(4);
              }
            }}
            onBack={prevStep}
            sportRequiresRunning={checkSportRequiresRunning(data)}
          />
        );
      case 4:
        return <LocationStep data={data} onNext={handleStepComplete} onBack={prevStep} />;
      case 5:
        return <ScreeningTypeStep data={data} onNext={handleStepComplete} onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{t('onboarding.title')}</h1>
            <span className="text-slate-300">{t('onboarding.step_of').replace('{{current}}', String(effectiveStep + 1)).replace('{{total}}', String(totalSteps))}</span>
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

        {/* Indicatore salvataggio */}
        {isSaving && (
          <div className="flex gap-4 mt-6">
            <div className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
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
          </div>
        )}
      </div>
    </div>
  );
}
