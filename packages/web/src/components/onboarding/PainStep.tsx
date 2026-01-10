import { useState } from 'react';
import { OnboardingData, PainArea, PainSeverity, PainEntry } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

interface PainStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
  /** Se false, non permette la raccolta dati sanitari (Art. 9 GDPR) */
  healthConsentGranted?: boolean;
  /** Callback per aprire il modal di consenso */
  onRequestConsent?: () => void;
}

/**
 * Mapping zone dolore italiano → PainArea types
 * Alcune zone sono mappate come best-match (es. cervicale/dorsale → shoulder)
 */
const getPainAreas = (t: (key: string) => string): Array<{ value: PainArea; label: string; icon: string }> => [
  { value: 'neck', label: t('body.neck'), icon: '🦴' },
  { value: 'shoulder', label: t('body.shoulder'), icon: '💪' },
  { value: 'lower_back', label: t('body.lowerBack'), icon: '⬇️' },
  { value: 'hip', label: t('body.hip'), icon: '🦴' },
  { value: 'knee', label: t('body.knee'), icon: '🦵' },
  { value: 'ankle', label: t('body.ankle'), icon: '👣' },
  { value: 'wrist', label: t('body.wrist'), icon: '🤚' },
  { value: 'elbow', label: t('body.elbow'), icon: '💪' }
];

/**
 * Converti intensità dolore (1-10) → severity type
 */
function intensityToSeverity(intensity: number): PainSeverity {
  if (intensity >= 8) return 'severe';
  if (intensity >= 4) return 'moderate';
  return 'mild';
}

export default function PainStep({ data, onNext, onBack, healthConsentGranted = true, onRequestConsent }: PainStepProps) {
  const { t } = useTranslation();
  const PAIN_AREAS = getPainAreas(t);

  // GDPR Art. 9: Se il consenso non è stato dato, mostra blocco
  if (!healthConsentGranted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">{t('onboarding.pain.title')}</h2>
          <p className="text-slate-400 text-base">{t('onboarding.pain.subtitle')}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔒</div>
            <div>
              <h3 className="font-semibold text-amber-200 mb-2">
                {t('gdpr.consent_required_title') || 'Consenso richiesto'}
              </h3>
              <p className="text-sm text-amber-200/80 mb-4">
                {t('gdpr.health_data_explanation') || 'Per raccogliere informazioni sui tuoi dolori e condizioni fisiche, abbiamo bisogno del tuo consenso esplicito secondo l\'Art. 9 del GDPR.'}
              </p>
              {onRequestConsent && (
                <button
                  onClick={onRequestConsent}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {t('gdpr.give_consent') || 'Dai il consenso'}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNext({ painAreas: [] })}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-4 rounded-lg font-semibold text-lg transition"
        >
          {t('onboarding.pain.skip') || 'Salta questo passaggio'}
        </button>
      </div>
    );
  }

  const [hasPain, setHasPain] = useState<boolean | null>(
    data.painAreas ? data.painAreas.length > 0 : null
  );

  // Inizializza da painAreas esistenti (se presenti)
  const initialPainMap: Map<PainArea, number> = new Map();
  if (data.painAreas) {
    data.painAreas.forEach((entry) => {
      const intensity = entry.severity === 'severe' ? 9 : entry.severity === 'moderate' ? 5 : 2;
      initialPainMap.set(entry.area, intensity);
    });
  }

  const [painIntensity, setPainIntensity] = useState<Map<PainArea, number>>(initialPainMap);

  const togglePainArea = (area: PainArea) => {
    const newMap = new Map(painIntensity);
    if (newMap.has(area)) {
      newMap.delete(area);
    } else {
      newMap.set(area, 5); // Default: moderate
    }
    setPainIntensity(newMap);
  };

  const handleSubmit = () => {
    if (hasPain === false) {
      // Nessun dolore → painAreas vuoto
      onNext({ painAreas: [] });
      return;
    }

    // Converti Map<PainArea, intensity> → PainEntry[]
    const painAreas: PainEntry[] = Array.from(painIntensity.entries()).map(([area, intensity]) => ({
      area,
      severity: intensityToSeverity(intensity)
    }));

    onNext({ painAreas });
  };

  const selectedAreas = Array.from(painIntensity.keys());
  const isValid = hasPain !== null && (hasPain === false || selectedAreas.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">{t('onboarding.pain.title')}</h2>
        <p className="text-slate-400 text-base">{t('onboarding.pain.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setHasPain(false);
            setPainIntensity(new Map());
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            hasPain === false
              ? 'border-emerald-500 bg-emerald-500/20 text-white'
              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="text-4xl mb-2">✅</div>
          <div className="font-display font-bold text-lg">{t('onboarding.pain.none')}</div>
          <div className="text-sm text-slate-400 mt-1">{t('onboarding.pain.feelGood')}</div>
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
          <div className="font-display font-bold text-lg">{t('onboarding.pain.hasPain')}</div>
          <div className="text-sm text-slate-400 mt-1">{t('onboarding.pain.specifyAreas')}</div>
        </button>
      </div>

      {hasPain === true && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-display font-semibold text-lg text-white mb-3">{t('onboarding.pain.selectAreas')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAIN_AREAS.map((area, index) => (
                <button
                  key={`${area.value}-${index}`}
                  onClick={() => togglePainArea(area.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    painIntensity.has(area.value)
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

          {selectedAreas.length > 0 && (
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50">
              <h3 className="font-display font-semibold text-lg text-white mb-4">{t('onboarding.pain.intensity')}</h3>
              <div className="space-y-3">
                {selectedAreas.map((area) => {
                  const areaInfo = PAIN_AREAS.find((a) => a.value === area);
                  const intensity = painIntensity.get(area) || 5;
                  const severity = intensityToSeverity(intensity);

                  return (
                    <div key={area}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300 text-sm">
                          {areaInfo?.icon} {areaInfo?.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono font-bold text-xl">{intensity}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            severity === 'severe' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            severity === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {severity === 'severe' ? t('onboarding.pain.severe') : severity === 'moderate' ? t('onboarding.pain.moderate') : t('onboarding.pain.mild')}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => {
                          const newMap = new Map(painIntensity);
                          newMap.set(area, Number(e.target.value));
                          setPainIntensity(newMap);
                        }}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{t('onboarding.pain.mildRange')}</span>
                        <span>{t('onboarding.pain.moderateRange')}</span>
                        <span>{t('onboarding.pain.severeRange')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-amber-200 font-medium">
              {t('onboarding.pain.warning')}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-slate-700 text-white py-4 rounded-lg font-semibold text-lg hover:bg-slate-600 transition"
          >
            {t('common.back')}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
