import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RecoveryScreeningProps {
  onComplete: (data: RecoveryData) => void;
  onSkip?: () => void;
}

export interface RecoveryData {
  sleepHours: number;
  stressLevel: number;
  hasInjury: boolean;
  injuryDetails: string | null;
  menstrualCycle: 'follicular' | 'ovulation' | 'luteal' | 'menstruation' | null;
  isFemale: boolean;
  timestamp: string;
}

const RecoveryScreening: React.FC<RecoveryScreeningProps> = ({
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<'sleep' | 'stress' | 'injury' | 'cycle' | 'summary'>('sleep');
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [hasInjury, setHasInjury] = useState<boolean>(false);
  const [injuryDetails, setInjuryDetails] = useState<string>('');
  const [menstrualCycle, setMenstrualCycle] = useState<'follicular' | 'ovulation' | 'luteal' | 'menstruation' | null>(null);
  const [isFemale, setIsFemale] = useState<boolean>(false);

  useEffect(() => {
    fetchUserGender();
  }, []);

  const fetchUserGender = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('gender')
          .eq('user_id', userData.user.id)
          .single();

        if (profileData?.gender === 'female') {
          setIsFemale(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user gender:', error);
    }
  };

  const handleNext = () => {
    if (step === 'sleep') {
      setStep('stress');
    } else if (step === 'stress') {
      setStep('injury');
    } else if (step === 'injury') {
      if (isFemale) {
        setStep('cycle');
      } else {
        setStep('summary');
      }
    } else if (step === 'cycle') {
      setStep('summary');
    }
  };

  const handleBack = () => {
    if (step === 'stress') {
      setStep('sleep');
    } else if (step === 'injury') {
      setStep('stress');
    } else if (step === 'cycle') {
      setStep('injury');
    } else if (step === 'summary') {
      if (isFemale) {
        setStep('cycle');
      } else {
        setStep('injury');
      }
    }
  };

  const handleComplete = async () => {
    const recoveryData: RecoveryData = {
      sleepHours,
      stressLevel,
      hasInjury,
      injuryDetails: hasInjury ? injuryDetails : null,
      menstrualCycle: isFemale ? menstrualCycle : null,
      isFemale,
      timestamp: new Date().toISOString(),
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
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving recovery data:', error);
    }

    onComplete(recoveryData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        {step === 'sleep' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Come sta la tua ripresa?</h2>
              <p className="text-sm text-gray-600">Iniziamo con qualche domanda rapida</p>
            </div>
            <div className="space-y-4">
              <p className="font-semibold text-gray-900">Quante ore hai dormito stanotte?</p>
              <input
                type="number"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-bold"
              />
              <div className="text-xs text-gray-500">
                {sleepHours < 6 && '⚠️ Sonno insufficiente'}
                {sleepHours >= 6 && sleepHours <= 9 && '✅ Sonno ottimale'}
                {sleepHours > 9 && '⚠️ Sonno eccessivo'}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={onSkip}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold"
              >
                Salta
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                Avanti
              </button>
            </div>
          </div>
        )}

        {step === 'stress' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Livello di stress</h2>
            </div>
            <div className="space-y-4">
              <p className="font-semibold text-gray-900">Quanto sei stressato oggi?</p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-3xl font-bold text-gray-900 w-12 text-center">{stressLevel}</span>
              </div>
              <div className="text-xs text-gray-500">1 = Rilassato | 10 = Massimamente stressato</div>
              {stressLevel >= 8 && (
                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Stress elevato: considera un allenamento leggero o deload
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold"
              >
                Indietro
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                Avanti
              </button>
            </div>
          </div>
        )}

        {step === 'injury' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dolori o fastidi?</h2>
            </div>
            <div className="space-y-4">
              <p className="font-semibold text-gray-900">Hai dolori o fastidi oggi?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHasInjury(false);
                    setInjuryDetails('');
                  }}
                  className={`flex-1 p-4 border-2 rounded-lg font-semibold transition ${
                    !hasInjury ? 'bg-green-100 border-green-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ✅ No
                </button>
                <button
                  onClick={() => setHasInjury(true)}
                  className={`flex-1 p-4 border-2 rounded-lg font-semibold transition ${
                    hasInjury ? 'bg-red-100 border-red-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🩹 Sì
                </button>
              </div>
              {hasInjury && (
                <textarea
                  value={injuryDetails}
                  onChange={(e) => setInjuryDetails(e.target.value)}
                  placeholder="Descrivi il fastidio (es. dolore alla spalla, mal di schiena)"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold"
              >
                Indietro
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                {isFemale ? 'Avanti' : 'Fatto'}
              </button>
            </div>
          </div>
        )}

        {step === 'cycle' && isFemale && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Fase del ciclo</h2>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">In quale fase sei del ciclo mestruale?</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setMenstrualCycle('menstruation')}
                  className={`p-3 border-2 rounded-lg font-semibold text-sm transition ${
                    menstrualCycle === 'menstruation' ? 'bg-red-100 border-red-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🔴 Mestruazione (Giorni 1-5)
                </button>
                <button
                  onClick={() => setMenstrualCycle('follicular')}
                  className={`p-3 border-2 rounded-lg font-semibold text-sm transition ${
                    menstrualCycle === 'follicular' ? 'bg-green-100 border-green-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🟢 Follicolare (Giorni 6-12)
                </button>
                <button
                  onClick={() => setMenstrualCycle('ovulation')}
                  className={`p-3 border-2 rounded-lg font-semibold text-sm transition ${
                    menstrualCycle === 'ovulation' ? 'bg-yellow-100 border-yellow-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🟡 Ovulazione (Giorni 13-15)
                </button>
                <button
                  onClick={() => setMenstrualCycle('luteal')}
                  className={`p-3 border-2 rounded-lg font-semibold text-sm transition ${
                    menstrualCycle === 'luteal' ? 'bg-orange-100 border-orange-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🟠 Luteale (Giorni 16-28)
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold"
              >
                Indietro
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                Fatto
              </button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Riepilogo</h2>
            </div>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Sonno:</span>
                <span className="font-bold text-gray-900">{sleepHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stress:</span>
                <span className="font-bold text-gray-900">{stressLevel}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dolori:</span>
                <span className="font-bold text-gray-900">{hasInjury ? '🩹 Sì' : '✅ No'}</span>
              </div>
              {isFemale && menstrualCycle && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ciclo:</span>
                  <span className="font-bold text-gray-900">
                    {menstrualCycle === 'menstruation' && 'Mestruazione'}
                    {menstrualCycle === 'follicular' && 'Follicolare'}
                    {menstrualCycle === 'ovulation' && 'Ovulazione'}
                    {menstrualCycle === 'luteal' && 'Luteale'}
                  </span>
                </div>
              )}
            </div>
            {sleepHours < 6 && (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ Sonno insufficiente: AdaptFlow ridurrà l'intensità</p>
              </div>
            )}
            {stressLevel >= 8 && (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ Stress elevato: considera un allenamento leggero</p>
              </div>
            )}
            <button
              onClick={handleComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg"
            >
              Inizia Allenamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryScreening;
export type { RecoveryData };
