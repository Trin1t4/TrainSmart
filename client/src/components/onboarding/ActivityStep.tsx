import { useState, useEffect } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export function ActivityStep({ data, onNext }: Props) {
  const [frequency, setFrequency] = useState(data.activityLevel?.weeklyFrequency || 3);
  const [duration, setDuration] = useState<15 | 20 | 30 | 45 | 60 | 90>(data.activityLevel?.sessionDuration || 60);

  useEffect(() => {
    onNext({ activityLevel: { weeklyFrequency: frequency, sessionDuration: duration } });
  }, [frequency, duration]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Frequenza Allenamento</h2>
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>1 giorno</span>
          <span>7 giorni</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Durata sessione</label>
        <div className="grid grid-cols-6 gap-3">
          {[15, 20, 30, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m as any)}
              className={`p-4 rounded-lg border-2 transition ${duration === m ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
            >
              <div className="text-2xl font-bold">{m}'</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GoalStep({ data, onNext }: Props) {
  const [goal, setGoal] = useState(data.goal || '');

  const goals = [
    { value: 'muscle_gain', emoji: '💪', label: 'Massa Muscolare', desc: 'Ipertrofia' },
    { value: 'strength', emoji: '⚡', label: 'Forza', desc: 'Massimali' },
    { value: 'weight_loss', emoji: '🔥', label: 'Dimagrimento', desc: 'Perdere grasso' },
    { value: 'toning', emoji: '✨', label: 'Tonificazione', desc: 'Definizione' },
    { value: 'endurance', emoji: '🏃', label: 'Resistenza', desc: 'Cardio' },
    { value: 'performance', emoji: '⚽', label: 'Performance', desc: 'Sport specifico' }
  ];

  useEffect(() => {
    if (goal) {
      onNext({ goal: goal as any });
    }
  }, [goal]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Obiettivo Principale</h2>
        <p className="text-slate-300">Cosa vuoi raggiungere?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {goals.map(g => (
          <button
            key={g.value}
            type="button"
            onClick={() => setGoal(g.value)}
            className={`p-5 rounded-lg border-2 text-left transition ${goal === g.value ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
          >
            <div className="text-3xl mb-2">{g.emoji}</div>
            <div className="font-semibold text-lg">{g.label}</div>
            <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PainStep({ data, onNext }: Props) {
  const [painAreas, setPainAreas] = useState<string[]>(data.painAreas || []);

  const areas = [
    { value: 'none', emoji: '✅', label: 'Nessun dolore' },
    { value: 'lower_back', emoji: '🦴', label: 'Schiena bassa' },
    { value: 'knee', emoji: '🦵', label: 'Ginocchia' },
    { value: 'shoulder', emoji: '💪', label: 'Spalle' },
    { value: 'neck', emoji: '🙇', label: 'Collo' },
    { value: 'wrist', emoji: '🤝', label: 'Polsi' },
    { value: 'hip', emoji: '🦴', label: 'Anche' },
    { value: 'ankles', emoji: '🦶', label: 'Caviglie' }
  ];

  const togglePainArea = (area: string) => {
    if (area === 'none') {
      setPainAreas([]);
    } else {
      setPainAreas(prev => {
        const filtered = prev.filter(a => a !== 'none');
        return filtered.includes(area) ? filtered.filter(a => a !== area) : [...filtered, area];
      });
    }
  };

  useEffect(() => {
    onNext({ painAreas });
  }, [painAreas]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dolori o Limitazioni</h2>
        <p className="text-slate-300">Segnala eventuali zone problematiche</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {areas.map(area => (
          <button
            key={area.value}
            type="button"
            onClick={() => togglePainArea(area.value)}
            className={`p-4 rounded-lg border-2 text-left transition ${painAreas.includes(area.value) || (area.value === 'none' && painAreas.length === 0) ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
          >
            <div className="text-2xl mb-1">{area.emoji}</div>
            <div className="font-semibold text-sm">{area.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
