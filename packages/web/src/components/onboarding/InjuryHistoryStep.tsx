import React, { useState } from 'react';
import { AlertTriangle, Plus, X, ChevronRight, Info } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

// Tipi di infortuni comuni con controindicazioni associate
const COMMON_INJURIES = [
  {
    id: 'acl_reconstruction',
    label: 'Ricostruzione LCA (Legamento Crociato Anteriore)',
    labelEn: 'ACL Reconstruction',
    area: 'knee',
    isRecent: false,
    contraindications: [
      'single_leg_plyometrics_heavy',
      'cutting_movements_uncontrolled',
      'deep_pivot_sports'
    ],
    cautions: [
      'heavy_squats_initial',
      'running_hard_surfaces',
      'rapid_direction_changes'
    ]
  },
  {
    id: 'meniscus_surgery',
    label: 'Intervento al Menisco',
    labelEn: 'Meniscus Surgery',
    area: 'knee',
    isRecent: false,
    contraindications: [
      'deep_squats_heavy',
      'high_impact_jumping'
    ],
    cautions: [
      'leg_extension_full_rom',
      'heavy_leg_press_deep'
    ]
  },
  {
    id: 'rotator_cuff_repair',
    label: 'Riparazione Cuffia dei Rotatori',
    labelEn: 'Rotator Cuff Repair',
    area: 'shoulder',
    isRecent: false,
    contraindications: [
      'upright_rows',
      'behind_neck_press',
      'behind_neck_pulldown'
    ],
    cautions: [
      'heavy_overhead_press',
      'wide_grip_bench',
      'dips_deep'
    ]
  },
  {
    id: 'labrum_repair',
    label: 'Riparazione Labbro Glenoideo (SLAP/Bankart)',
    labelEn: 'Labrum Repair (SLAP/Bankart)',
    area: 'shoulder',
    isRecent: false,
    contraindications: [
      'behind_neck_movements',
      'extreme_external_rotation_loaded'
    ],
    cautions: [
      'overhead_throwing',
      'bench_press_very_deep',
      'dips_deep'
    ]
  },
  {
    id: 'disc_herniation',
    label: 'Ernia del Disco (Lombare)',
    labelEn: 'Disc Herniation (Lumbar)',
    area: 'lower_back',
    isRecent: false,
    contraindications: [
      'good_morning',
      'romanian_deadlift_heavy_flexion',
      'russian_twist',
      'sit_ups_full'
    ],
    cautions: [
      'conventional_deadlift',
      'back_squat_heavy',
      'bent_over_row_heavy'
    ]
  },
  {
    id: 'disc_herniation_cervical',
    label: 'Ernia del Disco (Cervicale)',
    labelEn: 'Disc Herniation (Cervical)',
    area: 'neck',
    isRecent: false,
    contraindications: [
      'behind_neck_press',
      'behind_neck_pulldown',
      'neck_bridges',
      'heavy_shrugs'
    ],
    cautions: [
      'overhead_press_heavy',
      'upright_rows'
    ]
  },
  {
    id: 'patellar_dislocation',
    label: 'Lussazione Rotulea',
    labelEn: 'Patellar Dislocation',
    area: 'knee',
    isRecent: false,
    contraindications: [
      'deep_squats_narrow_stance',
      'leg_extension_full_rom',
      'lateral_lunges_deep'
    ],
    cautions: [
      'lunges_forward',
      'step_ups_high'
    ]
  },
  {
    id: 'achilles_rupture',
    label: 'Rottura Tendine d\'Achille',
    labelEn: 'Achilles Tendon Rupture',
    area: 'ankle',
    isRecent: false,
    contraindications: [
      'box_jumps_high',
      'depth_jumps',
      'explosive_calf_work'
    ],
    cautions: [
      'running_sprints',
      'calf_raises_heavy',
      'plyometrics'
    ]
  },
  {
    id: 'ankle_reconstruction',
    label: 'Ricostruzione Legamenti Caviglia',
    labelEn: 'Ankle Ligament Reconstruction',
    area: 'ankle',
    isRecent: false,
    contraindications: [
      'lateral_jumping_uncontrolled'
    ],
    cautions: [
      'single_leg_balance_unstable',
      'lateral_movements_fast'
    ]
  },
  {
    id: 'hip_replacement',
    label: 'Protesi d\'Anca',
    labelEn: 'Hip Replacement',
    area: 'hip',
    isRecent: false,
    contraindications: [
      'deep_hip_flexion_over_90',
      'hip_adduction_across_midline',
      'internal_rotation_hip_loaded'
    ],
    cautions: [
      'squats_very_deep',
      'leg_press_deep',
      'lunges_very_deep'
    ]
  },
  {
    id: 'spinal_fusion',
    label: 'Fusione Spinale',
    labelEn: 'Spinal Fusion',
    area: 'lower_back',
    isRecent: false,
    contraindications: [
      'spinal_rotation_loaded',
      'hyperextension_back',
      'good_morning',
      'russian_twist'
    ],
    cautions: [
      'deadlift_conventional',
      'back_squat_heavy',
      'overhead_press_standing'
    ]
  }
];

export interface InjuryRecord {
  id: string;
  label: string;
  area: string;
  isRecent: boolean;
  contraindications: string[];
  cautions: string[];
  notes?: string;
  dateOfInjury?: string;
}

interface InjuryHistoryStepProps {
  data: {
    injuryHistory?: InjuryRecord[];
  };
  onNext: (data: { injuryHistory: InjuryRecord[] }) => void;
  onBack?: () => void;
}

export default function InjuryHistoryStep({ data, onNext, onBack }: InjuryHistoryStepProps) {
  const { t } = useTranslation();
  const [selectedInjuries, setSelectedInjuries] = useState<InjuryRecord[]>(
    data.injuryHistory || []
  );
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInjury, setCustomInjury] = useState('');
  const [expandedInjury, setExpandedInjury] = useState<string | null>(null);

  const toggleInjury = (injury: typeof COMMON_INJURIES[0]) => {
    const exists = selectedInjuries.find(i => i.id === injury.id);

    if (exists) {
      setSelectedInjuries(prev => prev.filter(i => i.id !== injury.id));
    } else {
      setSelectedInjuries(prev => [...prev, {
        ...injury,
        notes: '',
        dateOfInjury: ''
      }]);
    }
  };

  const updateInjuryDetails = (id: string, field: 'isRecent' | 'notes' | 'dateOfInjury', value: boolean | string) => {
    setSelectedInjuries(prev => prev.map(injury => {
      if (injury.id === id) {
        return { ...injury, [field]: value };
      }
      return injury;
    }));
  };

  const handleSubmit = () => {
    onNext({ injuryHistory: selectedInjuries });
  };

  const hasNoInjuries = selectedInjuries.length === 0;

  // Area icons
  const areaIcons: Record<string, string> = {
    'knee': '🦵',
    'shoulder': '💪',
    'lower_back': '🔙',
    'neck': '🔝',
    'ankle': '🦶',
    'hip': '🦴',
    'other': '🩹'
  };

  // Area translations
  const areaLabels: Record<string, string> = {
    'knee': 'Ginocchio',
    'shoulder': 'Spalla',
    'lower_back': 'Zona Lombare',
    'neck': 'Collo',
    'ankle': 'Caviglia',
    'hip': 'Anca',
    'other': 'Altro'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">
            Storico Infortuni
          </h2>
        </div>
        <p className="text-slate-400">
          Hai avuto infortuni o interventi chirurgici in passato?
          Questo ci aiuta a creare un programma sicuro per te.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Perche e importante?</p>
            <p>
              Alcuni esercizi possono essere controindicati dopo certi infortuni.
              TrainSmart evitera automaticamente movimenti potenzialmente pericolosi
              e suggerira alternative sicure.
            </p>
          </div>
        </div>
      </div>

      {/* Common Injuries List */}
      <div className="space-y-3">
        {COMMON_INJURIES.map(injury => {
          const isSelected = selectedInjuries.some(i => i.id === injury.id);
          const selectedInjury = selectedInjuries.find(i => i.id === injury.id);

          return (
            <div key={injury.id}>
              <button
                onClick={() => toggleInjury(injury)}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{areaIcons[injury.area] || '🩹'}</span>
                    <div>
                      <p className="font-medium text-white">{injury.label}</p>
                      <p className="text-sm text-slate-400">{areaLabels[injury.area] || injury.area}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-slate-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isSelected && selectedInjury && (
                <div className="mt-2 ml-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Recent Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm text-slate-300">
                      Infortunio recente? (ultimi 12 mesi)
                    </label>
                    <button
                      onClick={() => updateInjuryDetails(injury.id, 'isRecent', !selectedInjury.isRecent)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        selectedInjury.isRecent ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        selectedInjury.isRecent ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-1">
                      Note aggiuntive (opzionale)
                    </label>
                    <textarea
                      value={selectedInjury.notes || ''}
                      onChange={(e) => updateInjuryDetails(injury.id, 'notes', e.target.value)}
                      placeholder="Es: Operato nel 2022, fisioterapia completata"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white text-sm placeholder-slate-500"
                      rows={2}
                    />
                  </div>

                  {/* What will be avoided */}
                  <div className="mt-3 text-xs text-slate-400">
                    <p className="font-medium text-slate-300 mb-1">Cosa eviteremo:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {injury.contraindications.slice(0, 3).map((c, i) => (
                        <li key={i}>{c.replace(/_/g, ' ')}</li>
                      ))}
                      {injury.contraindications.length > 3 && (
                        <li>+{injury.contraindications.length - 3} altri...</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Injury Input */}
      {showCustomInput ? (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <label className="text-sm text-slate-300 block mb-2">
            Descrivi il tuo infortunio
          </label>
          <textarea
            value={customInjury}
            onChange={(e) => setCustomInjury(e.target.value)}
            placeholder="Es: Frattura clavicola 2020, completamente guarita"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                if (customInjury.trim()) {
                  setSelectedInjuries(prev => [...prev, {
                    id: `custom_${Date.now()}`,
                    label: customInjury,
                    area: 'other',
                    isRecent: false,
                    contraindications: [],
                    cautions: [],
                    notes: customInjury
                  }]);
                  setCustomInjury('');
                  setShowCustomInput(false);
                }
              }}
              className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium"
            >
              Aggiungi
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomInjury('');
              }}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomInput(true)}
          className="w-full p-4 rounded-lg border border-dashed border-slate-600 hover:border-slate-500 transition-colors flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300"
        >
          <Plus className="w-5 h-5" />
          Aggiungi altro infortunio
        </button>
      )}

      {/* Summary */}
      {selectedInjuries.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-300 mb-2">
            Infortuni selezionati: <span className="font-medium text-amber-400">{selectedInjuries.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedInjuries.map(injury => (
              <span
                key={injury.id}
                className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs flex items-center gap-1"
              >
                {injury.label.length > 30 ? injury.label.substring(0, 30) + '...' : injury.label}
                {injury.isRecent && <span className="text-red-400">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition"
          >
            Indietro
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition"
        >
          {hasNoInjuries ? 'Nessun infortunio, continua' : 'Continua'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
