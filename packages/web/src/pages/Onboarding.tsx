import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { OnboardingData, RunningPreferences } from '../types/onboarding.types';
import { useTranslation } from '../lib/i18n';
import TrainingTypeChoiceStep, { TrainingFocus } from '../components/onboarding/TrainingTypeChoiceStep';
import AnagraficaStep from '../components/onboarding/AnagraficaStep';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import ScreeningTypeStep from '../components/onboarding/ScreeningTypeStep';
import LocationStep from '../components/onboarding/LocationStep';
import GoalStep from '../components/onboarding/GoalStep';
import MedicalDisclaimer from '../components/onboarding/MedicalDisclaimer';
import RunningOnboarding from '../components/RunningOnboarding';
import {
  sportRequiresRunning,
  getSportRunningConfig,
  SportType
} from '../utils/sportSpecificTraining';

// Onboarding - 6+ step (dipende dalla scelta)
// 0. Training Type Choice (pesi/corsa/entrambi) - NEW
// 1. Anagrafica (nome, cognome, data nascita)
// 2. Personal Info (genere, età, altezza, peso)
// 3. Screening Type (approfondito vs leggero)
// 4. Location (casa/palestra) - solo se pesi
// 5. Goal (obiettivo) - solo se pesi
// 6. Running Onboarding - solo se corsa o entrambi

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // Start from 0 (training type choice)
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus | null>(null);
  const [showRunningOnboarding, setShowRunningOnboarding] = useState(false);
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
    // Navigate back to home if user doesn't accept
    navigate('/');
  };

  // Show medical disclaimer first
  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />
    );
  }

  // Calcola step totali in base alla scelta
  // Se solo running: 0 (choice) + 1 (anagrafica) + 2 (personal) + running onboarding
  // Se pesi o entrambi: 0 (choice) + 1-5 (weights steps) + eventuale running
  const getStepsForFocus = (): number => {
    if (!trainingFocus) return 1; // Solo step 0
    if (trainingFocus === 'running') return 3; // 0 + anagrafica + personal info (poi running onboarding separato)
    return 6; // 0 + 5 weights steps (poi eventuale running onboarding)
  };

  const totalSteps = getStepsForFocus();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    
    // 🔍 DEBUG - Log OGNI update
    console.log('[ONBOARDING] 📝 Step data received:', stepData);
    console.log('[ONBOARDING] 📋 Current data state:', newData);
    if (stepData.trainingLocation) {
      console.log('[ONBOARDING] 🏠 Location updated to:', stepData.trainingLocation);
    }
    
    setData(newData);
  };

  // ✅ Salva onboarding in Supabase
  const saveOnboardingToDatabase = async (onboardingData: Partial<OnboardingData>) => {
    try {
      // ✅ FIX: Retry mechanism per gestire session loading ritardata
      // (es: dopo email confirmation, sessione potrebbe non essere pronta subito)
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

      // 🔍 DEBUG - Stampa PRIMA di salvare
      console.log('[ONBOARDING] 📤 Saving to Supabase:', JSON.stringify(onboardingData, null, 2));
      console.log('[ONBOARDING] 🏠 Final location value:', onboardingData.trainingLocation);

      // ✅ FIX: UPSERT con onConflict su user_id + email (NOT NULL)
      // onConflict: 'user_id' → Usa UNIQUE constraint su user_id invece di PRIMARY KEY (id)
      // Quindi: se user_id esiste già → UPDATE, altrimenti → INSERT
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',  // ← FIX: email è NOT NULL nella tabella!
          onboarding_data: onboardingData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',  // ← KEY FIX: usa user_id per conflict detection
          ignoreDuplicates: false  // ← UPDATE se esiste, non ignorare
        });

      if (error) {
        console.error('[ONBOARDING] ❌ Error saving to database:', error);
        throw error;
      }

      console.log('[ONBOARDING] ✅ Onboarding saved to database successfully');
      console.log('[ONBOARDING] ✅ Location saved as:', onboardingData.trainingLocation);
    } catch (error) {
      console.error('[ONBOARDING] ❌ Failed to save onboarding:', error);
      throw error;
    }
  };

  // ✅ FIX: nextStep ora accetta dati mergiati per evitare race condition con React state
  const nextStep = async (mergedData?: Partial<OnboardingData>) => {
    const finalData = mergedData || data;

    // ═══ CASO RUNNING ONLY ═══
    // Dopo step 2 (PersonalInfo), vai direttamente a RunningOnboarding
    if (trainingFocus === 'running' && currentStep === 2) {
      console.log('[ONBOARDING] 🏃 Running only flow → showing RunningOnboarding');
      setShowRunningOnboarding(true);
      return;
    }

    // ═══ CASO ENTRAMBI ═══
    // Dopo step 5 (GoalStep), chiedi se vogliono aggiungere corsa
    if (trainingFocus === 'both' && currentStep === 5) {
      console.log('[ONBOARDING] 🏃+🏋️ Both flow → showing RunningOnboarding after weights');
      setShowRunningOnboarding(true);
      return;
    }

    if (currentStep < totalSteps - 1) {
      console.log(`[ONBOARDING] ➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    } else if (trainingFocus === 'weights') {
      // ✅ STEP FINALE SOLO PESI - Ma controlla se lo sport richiede corsa
      setIsSaving(true);
      try {
        // 🔍 DEBUG CRITICO - Stampa TUTTO prima di salvare
        console.log('[ONBOARDING] 🎯 ========== FINAL SAVE START ==========');
        console.log('[ONBOARDING] 📋 COMPLETE DATA OBJECT:');
        console.log('[ONBOARDING]', JSON.stringify(finalData, null, 2));
        console.log('[ONBOARDING] 🏠 trainingLocation value:', finalData.trainingLocation);
        console.log('[ONBOARDING] 🎯 goal value:', finalData.goal);
        console.log('[ONBOARDING] 🎯 goals array:', finalData.goals);

        // Se location è undefined, c'è un bug in LocationStep!
        if (!finalData.trainingLocation) {
          console.error('[ONBOARDING] ❌ LOCATION IS MISSING! LocationStep.tsx has a bug!');
          alert(t('onboarding.error.location_missing'));
          setIsSaving(false);
          setCurrentStep(4); // Torna al step della location (step 4)
          return;
        }

        // ═══ CONTROLLO CORSA PER SPORT ═══
        // Se l'utente ha scelto uno sport che richiede corsa, MOSTRA lo screening running
        const selectedSport = finalData.sport as SportType | undefined;
        const isSportGoal = finalData.goals?.includes('prestazioni_sportive') ||
                           finalData.goal === 'prestazioni_sportive';

        if (isSportGoal && selectedSport && sportRequiresRunning(selectedSport)) {
          const sportRunningConfig = getSportRunningConfig(selectedSport);
          console.log(`[ONBOARDING] 🏃 Sport "${selectedSport}" requires running → showing RunningOnboarding for screening`);
          console.log('[ONBOARDING] 🏃 Sport running config:', sportRunningConfig);

          // Salva i dati pesi in localStorage temporaneamente
          setData(finalData);

          // Prepara il preset per RunningOnboarding
          const sportLabels: Record<string, string> = {
            calcio: 'Calcio',
            basket: 'Basket',
            rugby: 'Rugby',
            boxe: 'Boxe',
            tennis: 'Tennis',
            corsa: 'Corsa',
          };

          setSportRunningPreset({
            goal: 'complemento_sport',
            integration: sportRunningConfig.integration,
            sessionsPerWeek: sportRunningConfig.sessionsPerWeek,
            sportName: sportLabels[selectedSport] || selectedSport,
          });

          // Mostra RunningOnboarding per fare lo screening di capacità
          setIsSaving(false);
          setShowRunningOnboarding(true);
          return;
        }

        const dataToSave = finalData;
        console.log('[ONBOARDING] 🎯 ========== END DEBUG ==========');

        // 1. Salva in localStorage
        console.log('[ONBOARDING] 💾 Saving to localStorage...');
        localStorage.setItem('onboarding_data', JSON.stringify(dataToSave));
        console.log('[ONBOARDING] ✅ Saved to localStorage');

        // 2. Salva in Supabase
        console.log('[ONBOARDING] 🔄 Saving to Supabase...');
        await saveOnboardingToDatabase(dataToSave);

        // 3. ✅ BRANCH CONDIZIONALE: Recupero Motorio vs Screening Type
        if (dataToSave.goal === 'motor_recovery') {
          console.log('[ONBOARDING] 🏥 Motor recovery goal detected → navigating to /recovery-screening');
          navigate('/recovery-screening');
        } else {
          // Controlla il tipo di screening scelto
          const screeningType = dataToSave.screeningType;
          if (screeningType === 'thorough') {
            console.log('[ONBOARDING] 📊 Thorough screening → navigating to /quiz-full');
            navigate('/quiz-full');
          } else {
            console.log('[ONBOARDING] ⚡ Light screening → navigating to /quiz');
            navigate('/quiz');
          }
        }
      } catch (error) {
        console.error('[ONBOARDING] ❌ Error saving onboarding:', error);
        alert(t('onboarding.error.save_failed'));
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    // Se siamo in RunningOnboarding, torniamo allo step precedente
    if (showRunningOnboarding) {
      console.log('[ONBOARDING] ⬅️ Going back from RunningOnboarding');
      setShowRunningOnboarding(false);
      return;
    }

    // Se siamo allo step 0, non possiamo tornare indietro
    if (currentStep === 0) {
      return;
    }

    // Altrimenti torniamo allo step precedente
    if (currentStep > 0) {
      console.log(`[ONBOARDING] ⬅️ Moving back from step ${currentStep} to ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    console.log(`[ONBOARDING] ✅ Step ${currentStep} completed with data:`, stepData);

    // ✅ FIX: Merge data PRIMA di chiamare nextStep
    // React setData è asincrono - non possiamo fare affidamento su `data` subito dopo setData()
    const mergedData = { ...data, ...stepData };
    updateData(stepData);

    // Passa i dati mergiati direttamente a nextStep per evitare race condition
    nextStep(mergedData);
  };

  // Handler per la scelta del tipo di allenamento (step 0)
  const handleTrainingTypeChoice = (choice: TrainingFocus) => {
    console.log('[ONBOARDING] 🎯 Training focus selected:', choice);
    setTrainingFocus(choice);
    setCurrentStep(1); // Vai al prossimo step
  };

  // Handler per completamento running onboarding
  const handleRunningOnboardingComplete = async (runningPrefs: RunningPreferences) => {
    console.log('[ONBOARDING] 🏃 Running onboarding completed:', runningPrefs);

    const finalData = { ...data, running: runningPrefs };
    setData(finalData);
    setIsSaving(true);

    try {
      // Salva in localStorage
      localStorage.setItem('onboarding_data', JSON.stringify(finalData));

      // Salva in Supabase
      await saveOnboardingToDatabase(finalData);

      // Naviga alla dashboard o al quiz in base al focus
      if (trainingFocus === 'running') {
        // Solo corsa → vai direttamente alla dashboard running
        console.log('[ONBOARDING] 🏃 Running only → navigating to /running-dashboard');
        navigate('/running-dashboard');
      } else {
        // Entrambi → vai al quiz per i pesi (già completato onboarding pesi)
        const screeningType = finalData.screeningType;
        if (screeningType === 'thorough') {
          navigate('/quiz-full');
        } else {
          navigate('/quiz');
        }
      }
    } catch (error) {
      console.error('[ONBOARDING] ❌ Error saving:', error);
      alert(t('onboarding.error.save_failed'));
      setIsSaving(false);
    }
  };

  // Render step in base al focus scelto
  // - Step 0: Scelta tipo allenamento
  // - Running only: 0 → 1 (Anagrafica) → 2 (PersonalInfo) → RunningOnboarding (gestito sopra)
  // - Weights/Both: 0 → 1-5 (weights steps) → eventuale RunningOnboarding
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TrainingTypeChoiceStep onNext={handleTrainingTypeChoice} />;
      case 1:
        return <AnagraficaStep data={data} onNext={handleStepComplete} />;
      case 2:
        return <PersonalInfoStep data={data} onNext={handleStepComplete} />;
      case 3:
        return <ScreeningTypeStep data={data} onNext={handleStepComplete} />;
      case 4:
        return <LocationStep data={data} onNext={handleStepComplete} />;
      case 5:
        return <GoalStep data={data} onNext={handleStepComplete} />;
      default:
        return null;
    }
  };

  // Se siamo in RunningOnboarding, mostra solo il componente (ha suo header/progress)
  if (showRunningOnboarding) {
    return (
      <RunningOnboarding
        age={data.personalInfo?.age || 30}
        onComplete={handleRunningOnboardingComplete}
        onBack={() => {
          setShowRunningOnboarding(false);
          setSportRunningPreset(null);
        }}
        includesWeights={trainingFocus === 'both' || sportRunningPreset !== null}
        sportPreset={sportRunningPreset || undefined}
      />
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
