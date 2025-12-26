import React from 'react';
import { ClipboardCheck, Zap, Clock, Target, CheckCircle2 } from 'lucide-react';
import { OnboardingData } from '../../types/onboarding.types';

interface ScreeningTypeStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

type ScreeningType = 'thorough' | 'light';

export default function ScreeningTypeStep({ data, onNext }: ScreeningTypeStepProps) {
  const [selectedType, setSelectedType] = React.useState<ScreeningType | null>(
    (data as any).screeningType || null
  );

  const handleSelect = (type: ScreeningType) => {
    setSelectedType(type);
  };

  const handleSubmit = () => {
    if (!selectedType) return;
    onNext({ screeningType: selectedType } as any);
  };

  const options = [
    {
      type: 'thorough' as ScreeningType,
      title: 'Screening Approfondito',
      subtitle: 'Consigliato per programmi personalizzati',
      description: 'Analisi completa delle tue capacità per un programma su misura',
      details: [
        '7 domande dettagliate',
        '4 test fisici pratici',
        'Calibrazione precisa del programma',
        'Durata: ~10-15 minuti'
      ],
      icon: ClipboardCheck,
      color: 'emerald',
      recommended: true
    },
    {
      type: 'light' as ScreeningType,
      title: 'Screening Rapido',
      subtitle: 'Per iniziare subito',
      description: 'Valutazione essenziale per partire velocemente',
      details: [
        '3 domande veloci',
        '2 test fisici base',
        'Programma standard adattato',
        'Durata: ~5 minuti'
      ],
      icon: Zap,
      color: 'blue',
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Scegli il Tipo di Valutazione
        </h2>
        <p className="text-slate-400">
          Quanto vuoi che sia approfondita l'analisi delle tue capacità?
        </p>
      </div>

      <div className="grid gap-4">
        {options.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedType === option.type;
          const colorClasses = option.color === 'emerald'
            ? {
                bg: 'bg-emerald-500/20',
                border: 'border-emerald-500',
                text: 'text-emerald-400',
                ring: 'ring-emerald-500/30'
              }
            : {
                bg: 'bg-blue-500/20',
                border: 'border-blue-500',
                text: 'text-blue-400',
                ring: 'ring-blue-500/30'
              };

          return (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={`relative w-full p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `${colorClasses.border} ${colorClasses.bg} ring-4 ${colorClasses.ring}`
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              {/* Recommended badge */}
              {option.recommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  Consigliato
                </div>
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                  isSelected ? colorClasses.bg : 'bg-slate-600/50'
                }`}>
                  <IconComponent className={`w-7 h-7 ${isSelected ? colorClasses.text : 'text-slate-400'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {option.title}
                    </h3>
                    {isSelected && (
                      <CheckCircle2 className={`w-5 h-5 ${colorClasses.text}`} />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{option.description}</p>

                  {/* Details list */}
                  <div className="grid grid-cols-2 gap-2">
                    {option.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? colorClasses.bg.replace('/20', '') : 'bg-slate-500'
                        }`} />
                        <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
        <p className="text-sm text-slate-400 text-center">
          <Target className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          Lo screening approfondito permette di creare un programma piu preciso e adatto alle tue capacità reali
        </p>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
      >
        Continua
      </button>
    </div>
  );
}
