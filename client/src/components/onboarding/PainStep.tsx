import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface PainStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

const PAIN_AREAS = [
  { value: 'cervicale', label: 'Cervicale/Collo', icon: '🦴' },
  { value: 'spalle', label: 'Spalle', icon: '💪' },
  { value: 'dorsale', label: 'Zona Dorsale', icon: '🔙' },
  { value: 'lombare', label: 'Zona Lombare', icon: '⬇️' },
  { value: 'anche', label: 'Anche/Bacino', icon: '🦴' },
  { value: 'ginocchia', label: 'Ginocchia', icon: '🦵' },
  { value: 'caviglie', label: 'Caviglie/Piedi', icon: '👣' },
  { value: 'polsi', label: 'Polsi/Mani', icon: '🤚' },
  { value: 'gomiti', label: 'Gomiti', icon: '💪' }
];

export default function PainStep({ data, onNext }: PainStepProps) {
  const [hasPain, setHasPain] = useState<boolean | null>(data.painScreening?.hasPain ?? null);
  const [painAreas, setPainAreas] = useState<string[]>(data.painScreening?.painAreas || []);
  const [painIntensity, setPainIntensity] = useState<{ [key: string]: number }>(
    data.painScreening?.painIntensity || {}
  );

  const togglePainArea = (area: string) => {
    if (painAreas.includes(area)) {
      setPainAreas(painAreas.filter((a) => a !== area));
      const newIntensity = { ...painIntensity };
      delete newIntensity[area];
      setPainIntensity(newIntensity);
    } else {
      setPainAreas([...painAreas, area]);
      setPainIntensity({ ...painIntensity, [area]: 5 });
    }
  };

  const handleSubmit = () => {
    onNext({
      painScreening: {
        hasPain: hasPain || false,
        painAreas,
        painIntensity,
        screenedAt: new Date().toISOString()
      }
    });
  };

  const isValid = hasPain !== null && (hasPain === false || painAreas.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🩺 Screening Dolori</h2>
        <p className="text-slate-400">Hai dolori o fastidi attuali durante l'allenamento?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setHasPain(false);
            setPainAreas([]);
            setPainIntensity({});
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            hasPain === false
              ? 'border-emerald-500 bg-emerald-500/20 text-white'
              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="text-4xl mb-2">✅</div>
          <div className="font-bold text-lg">Nessun dolore</div>
          <div className="text-sm text-slate-400 mt-1">Mi sento bene</div>
        </button>

        <button
          onClick={() => setHasPain(true)}
          className={`p-6 rounded-lg border-2 transition-all ${
            hasPain === true
              ? 'border-amber-500 bg-amber-500/20 text-white'
              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="text-4xl mb-2">⚠️</div>
          <div className="font-bold text-lg">Ho dolori</div>
          <div className="text-sm text-slate-400 mt-1">Specificare zone</div>
        </button>
      </div>

      {hasPain === true && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-semibold text-white mb-3">Seleziona le zone con dolore/fastidio:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAIN_AREAS.map((area) => (
                <button
                  key={area.value}
                  onClick={() => togglePainArea(area.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    painAreas.includes(area.value)
                      ? 'border-amber-500 bg-amber-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{area.icon}</span>
                    <span className="text-sm font-medium">{area.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {painAreas.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="font-semibold text-white mb-4">Intensità del dolore (1-10):</h3>
              <div className="space-y-3">
                {painAreas.map((area) => {
                  const areaInfo = PAIN_AREAS.find((a) => a.value === area);
                  return (
                    <div key={area}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300 text-sm">
                          {areaInfo?.icon} {areaInfo?.label}
                        </span>
                        <span className="text-white font-bold text-lg">{painIntensity[area] || 5}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={painIntensity[area] || 5}
                        onChange={(e) =>
                          setPainIntensity({ ...painIntensity, [area]: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Lieve</span>
                        <span>Moderato</span>
                        <span>Severo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              ⚠️ Se i dolori sono severi (8+) o persistenti, consulta un medico prima di iniziare
            </p>
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
