import { useState, useMemo } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';
import { calculateBodyComposition, validateMeasurements } from '@fitnessflow/shared';

interface PersonalInfoStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function PersonalInfoStep({ data, onNext }: PersonalInfoStepProps) {
  const { t } = useTranslation();
  const [gender, setGender] = useState(data.personalInfo?.gender || 'M');
  const [age, setAge] = useState(data.personalInfo?.age || '');
  const [height, setHeight] = useState(data.personalInfo?.height || '');
  const [weight, setWeight] = useState(data.personalInfo?.weight || '');

  // Navy Method - Circumferences
  const [neck, setNeck] = useState(data.personalInfo?.neck?.toString() || '');
  const [waist, setWaist] = useState(data.personalInfo?.waist?.toString() || '');
  const [hips, setHips] = useState(data.personalInfo?.hips?.toString() || '');

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

    const personalInfo: any = {
      gender,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      bmi: bmi ? Number(bmi) : 0,
      neck: neck ? Number(neck) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined
    };

    // Calcola body composition con Navy Method (se circonferenze fornite)
    if (personalInfo.neck && personalInfo.waist) {
      try {
        const bodyComp = calculateBodyComposition({
          gender: gender as 'M' | 'F',
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
          neck: Number(neck),
          waist: Number(waist),
          hips: hips ? Number(hips) : undefined
        });

        personalInfo.bodyFat = bodyComp.bodyFatPercentage;
        personalInfo.fatMass = bodyComp.fatMass;
        personalInfo.leanMass = bodyComp.leanMass;

        console.log('✅ Body composition calculated (Navy Method):', bodyComp);
      } catch (error) {
        console.warn('⚠️ Navy Method failed, skipping body composition:', error);
      }
    }

    onNext({ personalInfo });
  };

  const isValid = age && height && weight && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('onboarding.personal.title')}</h2>
        <p className="text-slate-400">{t('onboarding.personal.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genere */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.personal.gender')}</label>
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
              <div className="font-semibold">{t('onboarding.personal.male')}</div>
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
              <div className="font-semibold">{t('onboarding.personal.female')}</div>
            </button>
          </div>
        </div>

        {/* Età */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.personal.age')}</label>
          <input
            type="number"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t('onboarding.personal.agePlaceholder')}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Altezza */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.personal.height')}</label>
          <input
            type="number"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={t('onboarding.personal.heightPlaceholder')}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.personal.weight')}</label>
          <input
            type="number"
            min="30"
            max="250"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={t('onboarding.personal.weightPlaceholder')}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Circonferenze per Navy Method */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📏</span>
          <div>
            <h3 className="text-white font-bold">{t('onboarding.personal.circumferences')}</h3>
            <p className="text-slate-400 text-xs">{t('onboarding.personal.circumferencesDesc')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Collo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('onboarding.personal.neck')}
            </label>
            <input
              type="number"
              step="0.1"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              placeholder={t('onboarding.personal.neckPlaceholder')}
              className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vita */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('onboarding.personal.waist')} {gender === 'M' ? t('onboarding.personal.waistNavel') : t('onboarding.personal.waistNarrowest')}
            </label>
            <input
              type="number"
              step="0.1"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder={t('onboarding.personal.waistPlaceholder')}
              className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fianchi (solo donne) */}
          {gender === 'F' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('onboarding.personal.hips')} {t('onboarding.personal.hipsWidest')}
              </label>
              <input
                type="number"
                step="0.1"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder={t('onboarding.personal.hipsPlaceholder')}
                className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <p className="text-xs text-slate-500">
            {t('onboarding.personal.navyMethodNote')}
          </p>
        </div>
      </div>

      {/* BMI Display - SOLO NUMERO */}
      {bmi && (
        <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">{t('onboarding.personal.bmi')}</span>
            <span className="text-3xl font-bold text-emerald-400">{bmi}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('common.continue')}
      </button>
    </div>
  );
}
