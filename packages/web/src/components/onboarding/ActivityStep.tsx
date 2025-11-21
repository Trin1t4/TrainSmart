import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function ActivityStep({ data, onNext }: Props) {
  const { t } = useTranslation();
  const [frequency, setFrequency] = useState(data.activityLevel?.weeklyFrequency || 3);
  const [duration, setDuration] = useState<15 | 20 | 30 | 45 | 60 | 90>(data.activityLevel?.sessionDuration || 60);

  const handleSubmit = () => {
    onNext({ activityLevel: { weeklyFrequency: frequency, sessionDuration: duration } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('onboarding.activity.title')}</h2>
        <p className="text-slate-400">{t('onboarding.activity.subtitle')}</p>
      </div>

      {/* Frequenza Settimanale */}
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <label className="text-sm font-semibold text-white">
            {t('onboarding.activity.daysPerWeek')}
          </label>
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg px-4 py-2">
            <span className="text-3xl text-emerald-400 font-bold">{frequency}</span>
            <span className="text-sm text-emerald-300 ml-1">giorni</span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="7"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${((frequency - 1) / 6) * 100}%, rgb(51 65 85) ${((frequency - 1) / 6) * 100}%, rgb(51 65 85) 100%)`
          }}
        />

        <div className="flex justify-between text-xs text-slate-400 mt-3">
          <span>{t('onboarding.activity.oneDay')}</span>
          <span>{t('onboarding.activity.sevenDays')}</span>
        </div>
      </div>

      {/* Durata Sessione */}
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <label className="block text-sm font-semibold text-white mb-4">
          {t('onboarding.activity.sessionDuration')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[15, 20, 30, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                duration === m
                  ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-lg shadow-emerald-500/20'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <div className={`text-2xl font-bold ${duration === m ? 'text-emerald-400' : 'text-slate-300'}`}>
                {m}
              </div>
              <div className={`text-xs mt-1 ${duration === m ? 'text-emerald-300' : 'text-slate-500'}`}>
                {t('onboarding.activity.minutes')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3 rounded-lg font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
