import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '../types/onboarding.types';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import PhotoAnalysisStep from '../components/onboarding/PhotoAnalysisStep';
import LocationStep from '../components/onboarding/LocationStep';
import { ActivityStep, GoalStep, PainStep } from '../components/onboarding/ActivityStep';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData({ ...data, ...stepData });
  };

 const nextStep = () => {
  if (currentStep < totalSteps) {
    setCurrentStep(currentStep + 1);
  } else {
    // SALVA E VAI AL QUIZ
    localStorage.setItem('onboarding_data', JSON.stringify(data));
    navigate('/quiz');  // ← Assicurati che vada al quiz
  }
};

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={data} onNext={updateData} />;
      case 2:
        return <PhotoAnalysisStep data={data} onNext={updateData} />;
      case 3:
        return <LocationStep data={data} onNext={updateData} />;
      case 4:
        return <ActivityStep data={data} onNext={updateData} />;
      case 5:
        return <GoalStep data={data} onNext={updateData} />;
      case 6:
        return <PainStep data={data} onNext={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Setup Iniziale</h1>
            <span className="text-slate-300">Step {currentStep} di {totalSteps}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          {renderStep()}
        </div>
        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <button onClick={prevStep} className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition">
              ← Indietro
            </button>
          )}
          <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20">
            {currentStep === totalSteps ? 'Vai al Quiz →' : 'Avanti →'}
          </button>
        </div>
      </div>
    </div>
  );
}
