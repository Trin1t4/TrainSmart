import { useState, useEffect } from 'react';
import { OnboardingData, BodyPhotos, BodyAnalysis } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function PhotoAnalysisStep({ data, onNext }: Props) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<BodyPhotos>(data.bodyPhotos || {});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(data.bodyAnalysis || null);

  const handleFileUpload = (position: keyof BodyPhotos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newPhotos = { ...photos, [position]: event.target?.result as string };
      setPhotos(newPhotos);
      if (newPhotos.front && newPhotos.side && newPhotos.back) analyzeBody(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const analyzeBody = async (photos: BodyPhotos) => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const bmi = data.personalInfo?.bmi || 22;
    const gender = data.personalInfo?.gender || 'M';
    let estimatedBodyFat = gender === 'M' ? (bmi < 20 ? 12 : bmi < 25 ? 18 : bmi < 30 ? 25 : 32) : (bmi < 20 ? 20 : bmi < 25 ? 27 : bmi < 30 ? 35 : 42);
    let muscleMass: 'low' | 'average' | 'high' = bmi < 20 ? 'low' : bmi > 27 ? 'high' : 'average';
    const suggestions = [];
    if (estimatedBodyFat > (gender === 'M' ? 20 : 30)) suggestions.push(t('onboarding.photo.suggestion1'));
    if (muscleMass === 'low') suggestions.push(t('onboarding.photo.suggestion2'));
    setAnalysis({ estimatedBodyFat, muscleMass, suggestions });
    setAnalyzing(false);
  };

  const handleSubmit = () => {
    onNext({ 
      bodyPhotos: photos, 
      bodyAnalysis: analysis || undefined 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">📸 {t('onboarding.photo.title')}</h2>
        <p className="text-slate-300">{t('onboarding.photo.subtitle')}</p>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
        <p className="text-sm text-emerald-200">💡 {t('onboarding.photo.tips')}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {(['front', 'side', 'back'] as const).map((pos) => (
          <div key={pos}>
            <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
              {t(`onboarding.photo.${pos}`)}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(pos, e)}
              className="hidden"
              id={`photo-${pos}`}
            />
            <label
              htmlFor={`photo-${pos}`}
              className="block aspect-[3/4] bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500 transition overflow-hidden"
            >
              {photos[pos] ? (
                <img src={photos[pos]} alt={pos} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm">{t('onboarding.photo.upload')}</span>
                </div>
              )}
            </label>
          </div>
        ))}
      </div>
      
      {analyzing && (
        <div className="bg-slate-700 rounded-lg p-6 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">{t('onboarding.photo.analyzing')}</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">📊 {t('onboarding.photo.results')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">{t('onboarding.photo.bodyFat')}</p>
              <p className="text-3xl font-bold text-white">{analysis.estimatedBodyFat}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">{t('onboarding.photo.muscleMass')}</p>
              <p className="text-3xl font-bold text-white capitalize">{t(`onboarding.photo.muscleMass${analysis.muscleMass.charAt(0).toUpperCase() + analysis.muscleMass.slice(1)}`)}</p>
            </div>
          </div>
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">💡 {t('onboarding.photo.suggestions')}:</p>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* BOTTONE CONTINUA */}
      <button
        onClick={handleSubmit}
        disabled={analyzing}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {photos.front || photos.side || photos.back ? `${t('onboarding.photo.continueBtn')} →` : `${t('onboarding.photo.skipBtn')} →`}
      </button>
    </div>
  );
}
