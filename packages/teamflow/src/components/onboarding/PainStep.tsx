import { useState } from 'react';
import { OnboardingData, PainArea, PainSeverity, PainEntry } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';
import { numericSeverityToString } from '@trainsmart/shared';

interface PainStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

/**
 * Extended pain area type with lateralization support
 * Base areas: knee, shoulder, hip, ankle, wrist, elbow, lower_back
 * Lateralized areas: left_knee, right_knee, left_shoulder, right_shoulder, etc.
 */
type ExtendedPainArea = PainArea |
  'left_knee' | 'right_knee' |
  'left_shoulder' | 'right_shoulder' |
  'left_hip' | 'right_hip' |
  'left_ankle' | 'right_ankle' |
  'left_wrist' | 'right_wrist' |
  'left_elbow' | 'right_elbow';

/**
 * Mapping zone dolore italiano → PainArea types
 * Supporta aree lateralizzate (sinistra/destra)
 */
const getPainAreas = (t: (key: string) => string): Array<{ value: ExtendedPainArea; label: string; icon: string; side?: 'left' | 'right' }> => [
  // Neck/Cervical → now has its own value
  { value: 'neck', label: t('body.neck'), icon: '🦴' },

  // Shoulders - lateralized
  { value: 'left_shoulder', label: `${t('body.shoulder')} (SX)`, icon: '💪', side: 'left' },
  { value: 'right_shoulder', label: `${t('body.shoulder')} (DX)`, icon: '💪', side: 'right' },

  // Lower back - central
  { value: 'lower_back', label: t('body.lowerBack'), icon: '⬇️' },

  // Hips - lateralized
  { value: 'left_hip', label: `${t('body.hip')} (SX)`, icon: '🦴', side: 'left' },
  { value: 'right_hip', label: `${t('body.hip')} (DX)`, icon: '🦴', side: 'right' },

  // Knees - lateralized
  { value: 'left_knee', label: `${t('body.knee')} (SX)`, icon: '🦵', side: 'left' },
  { value: 'right_knee', label: `${t('body.knee')} (DX)`, icon: '🦵', side: 'right' },

  // Ankles - lateralized
  { value: 'left_ankle', label: `${t('body.ankle')} (SX)`, icon: '👣', side: 'left' },
  { value: 'right_ankle', label: `${t('body.ankle')} (DX)`, icon: '👣', side: 'right' },

  // Wrists - lateralized
  { value: 'left_wrist', label: `${t('body.wrist')} (SX)`, icon: '🤚', side: 'left' },
  { value: 'right_wrist', label: `${t('body.wrist')} (DX)`, icon: '🤚', side: 'right' },

  // Elbows - lateralized
  { value: 'left_elbow', label: `${t('body.elbow')} (SX)`, icon: '💪', side: 'left' },
  { value: 'right_elbow', label: `${t('body.elbow')} (DX)`, icon: '💪', side: 'right' }
];

/**
 * Converti intensità dolore (1-10) → severity type
 * NUOVA LOGICA CONSERVATIVA:
 * - 1-3: mild (deload leggero, continua)
 * - 4+: severe (EVITA esercizio, sostituisci)
 *
 * Usa numericSeverityToString da @trainsmart/shared per consistenza
 */
function intensityToSeverity(intensity: number): PainSeverity {
  return numericSeverityToString(intensity);
}

/**
 * Get base area from lateralized area (e.g., left_knee → knee)
 */
function getBaseArea(area: ExtendedPainArea): PainArea {
  if (area.startsWith('left_') || area.startsWith('right_')) {
    return area.replace(/^(left_|right_)/, '') as PainArea;
  }
  return area as PainArea;
}

export default function PainStep({ data, onNext }: PainStepProps) {
  const { t } = useTranslation();
  const PAIN_AREAS = getPainAreas(t);

  const [hasPain, setHasPain] = useState<boolean | null>(
    data.painAreas ? data.painAreas.length > 0 : null
  );

  // Inizializza da painAreas esistenti (se presenti)
  // Supporta sia aree base che lateralizzate
  const initialPainMap: Map<ExtendedPainArea, number> = new Map();
  if (data.painAreas) {
    data.painAreas.forEach((entry) => {
      // Nuova logica: 4+ = severe, altrimenti mild
      const intensity = entry.severity === 'severe' ? 5 : 2;
      initialPainMap.set(entry.area as ExtendedPainArea, intensity);
    });
  }

  const [painIntensity, setPainIntensity] = useState<Map<ExtendedPainArea, number>>(initialPainMap);

  const togglePainArea = (area: ExtendedPainArea) => {
    const newMap = new Map(painIntensity);
    if (newMap.has(area)) {
      newMap.delete(area);
    } else {
      newMap.set(area, 3); // Default: mild (1-3 range, border)
    }
    setPainIntensity(newMap);
  };

  const handleSubmit = () => {
    if (hasPain === false) {
      // Nessun dolore → painAreas vuoto
      onNext({ painAreas: [] });
      return;
    }

    // Converti Map<ExtendedPainArea, intensity> → PainEntry[]
    // Per compatibilità DB, salva area base (senza lateralizzazione)
    // ma memorizziamo l'info lateralizzata per uso locale
    const painAreas: PainEntry[] = Array.from(painIntensity.entries()).map(([area, intensity]) => ({
      area: getBaseArea(area), // Converti left_knee → knee per compatibilità DB
      severity: intensityToSeverity(intensity),
      // Estensione: salviamo anche info lateralizzata per uso futuro
      ...(area !== getBaseArea(area) && { laterality: area.startsWith('left_') ? 'left' : 'right' })
    } as PainEntry));

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
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {/* Nuova logica: 1-3 = mild (OK), 4+ = severe (EVITA) */}
                            {severity === 'severe'
                              ? `${t('onboarding.pain.severe')} - EVITA`
                              : `${t('onboarding.pain.mild')} - OK`}
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
                        {/* Nuova scala: 1-3 = continua (mild), 4+ = evita (severe) */}
                        <span>1-3: Continua</span>
                        <span className="text-amber-400">|</span>
                        <span>4+: Evita esercizio</span>
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
