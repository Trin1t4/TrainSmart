import { useState, useMemo } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface PersonalInfoStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function PersonalInfoStep({ data, onNext }: PersonalInfoStepProps) {
  const [gender, setGender] = useState(data.personalInfo?.gender || 'M');
  const [age, setAge] = useState(data.personalInfo?.age || '');
  const [height, setHeight] = useState(data.personalInfo?.height || '');
  const [weight, setWeight] = useState(data.personalInfo?.weight || '');

  // BMI calcolato dinamicamente
  const bmi = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (h > 0 && w > 0) {
      return ((w / (h / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [height, weight]);

  const handleSubmit = () => {
    if (!age || !height || !weight) return;

    onNext({
      personalInfo: {
        gender,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        bmi: bmi ? Number(bmi) : 0
      }
    });
  };

  const isValid = age && height && weight && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">👤 Dati Biometrici</h2>
        <p className="text-slate-400">Inserisci i tuoi dati personali per personalizzare il programma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genere */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Genere</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('M')}
              className={`p-4 rounded-lg border-2 transition-all ${
                gender === 'M'
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-1">👨</div>
              <div className="font-semibold">Uomo</div>
            </button>
            <button
              type="button"
              onClick={() => setGender('F')}
              className={`p-4 rounded-lg border-2 transition-all ${
                gender === 'F'
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-1">👩</div>
              <div className="font-semibold">Donna</div>
            </button>
          </div>
        </div>

        {/* Età */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Età (anni)</label>
          <input
            type="number"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Es: 25"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Altezza */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Altezza (cm)</label>
          <input
            type="number"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Es: 175"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Peso (kg)</label>
          <input
            type="number"
            min="30"
            max="250"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Es: 70"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* BMI Display - SOLO NUMERO */}
      {bmi && (
        <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">BMI (Indice di Massa Corporea)</span>
            <span className="text-3xl font-bold text-emerald-400">{bmi}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continua →
      </button>
    </div>
  );
}
