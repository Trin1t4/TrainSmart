import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { OnboardingData } from '../types/onboarding.types';
import { useTranslation } from '../lib/i18n';
import AnagraficaStep from '../components/onboarding/AnagraficaStep';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import LocationStep from '../components/onboarding/LocationStep';
import ActivityStep from '../components/onboarding/ActivityStep';
import GoalStep from '../components/onboarding/GoalStep';
import PainStep from '../components/onboarding/PainStep';
import MedicalDisclaimer from '../components/onboarding/MedicalDisclaimer';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

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

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      console.log(`[ONBOARDING] ➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    } else {
      // ✅ STEP FINALE - Salva e naviga
      setIsSaving(true);
      try {
        // 🔍 DEBUG CRITICO - Stampa TUTTO prima di salvare
        console.log('[ONBOARDING] 🎯 ========== FINAL SAVE START ==========');
        console.log('[ONBOARDING] 📋 COMPLETE DATA OBJECT:');
        console.log('[ONBOARDING]', JSON.stringify(data, null, 2));
        console.log('[ONBOARDING] 🏠 trainingLocation value:', data.trainingLocation);
        console.log('[ONBOARDING] 🎯 (check above - is it "gym", "home", or undefined?)');
        console.log('[ONBOARDING] 🎯 ========== END DEBUG ==========');

        // Se location è undefined, c'è un bug in LocationStep!
        if (!data.trainingLocation) {
          console.error('[ONBOARDING] ❌ LOCATION IS MISSING! LocationStep.tsx has a bug!');
          alert(t('onboarding.error.location_missing'));
          setIsSaving(false);
          setCurrentStep(3); // Torna al step della location (ora è step 3)
          return;
        }

        // 1. Salva in localStorage
        console.log('[ONBOARDING] 💾 Saving to localStorage...');
        localStorage.setItem('onboarding_data', JSON.stringify(data));
        console.log('[ONBOARDING] ✅ Saved to localStorage');
        
        // 2. Salva in Supabase
        console.log('[ONBOARDING] 🔄 Saving to Supabase...');
        await saveOnboardingToDatabase(data);
        
        // 3. ✅ BRANCH CONDIZIONALE: Recupero Motorio vs Flow Normale
        if (data.goal === 'motor_recovery') {
          console.log('[ONBOARDING] 🏥 Motor recovery goal detected → navigating to /recovery-screening');
          navigate('/recovery-screening');
        } else {
          console.log('[ONBOARDING] 💪 Standard goal → navigating to /quiz');
          navigate('/quiz');
        }
      } catch (error) {
        console.error('[ONBOARDING] ❌ Error saving onboarding:', error);
        alert(t('onboarding.error.save_failed'));
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      console.log(`[ONBOARDING] ⬅️ Moving back from step ${currentStep} to ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    console.log(`[ONBOARDING] ✅ Step ${currentStep} completed with data:`, stepData);
    updateData(stepData);
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AnagraficaStep data={data} onNext={handleStepComplete} />;
      case 2:
        return <PersonalInfoStep data={data} onNext={handleStepComplete} />;
      case 3:
        return <LocationStep data={data} onNext={handleStepComplete} />;
      case 4:
        return <ActivityStep data={data} onNext={handleStepComplete} />;
      case 5:
        return <GoalStep data={data} onNext={handleStepComplete} />;
      case 6:
        return <PainStep data={data} onNext={handleStepComplete} />;
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
            <span className="text-slate-300">{t('onboarding.step_of').replace('{{current}}', String(currentStep)).replace('{{total}}', String(totalSteps))}</span>
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
          {currentStep > 1 && (
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
