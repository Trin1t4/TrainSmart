import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function ActivityStep({ data, onNext }: Props) {
  const [frequency, setFrequency] = useState(data.activityLevel?.weeklyFrequency || 3);
  const [duration, setDuration] = useState<15 | 20 | 30 | 45 | 60 | 90>(data.activityLevel?.sessionDuration || 60);

  const handleSubmit = () => {
    onNext({ activityLevel: { weeklyFrequency: frequency, sessionDuration: duration } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">📅 Frequenza Allenamento</h2>
        <p className="text-slate-300">Quante volte a settimana vuoi allenarti?</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-4">
          Giorni a settimana: <span className="text-2xl text-emerald-400 font-bold">{frequency}</span>
        </label>
        <input
          type="range"
          min="1"
          max="7"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>1 giorno</span>
          <span>7 giorni</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">⏱️ Durata sessione</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[15, 20, 30, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m as any)}
              className={`p-4 rounded-lg border-2 transition ${duration === m ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'}`}
            >
              <div className="text-2xl font-bold">{m}'</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
      >
        Continua →
      </button>
    </div>
  );
}
