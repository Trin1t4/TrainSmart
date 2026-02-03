import React, { useState } from 'react';
import { Home, Dumbbell, Warehouse, CheckCircle, Circle, Calendar } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

type EquipmentPreference = 'prefer_machines' | 'prefer_free_weights' | 'mixed';

interface OnboardingData {
  trainingLocation?: 'gym' | 'home' | 'home_gym';
  trainingType?: 'bodyweight' | 'equipment' | 'machines';
  equipmentPreference?: EquipmentPreference;
  frequency?: number;
  equipment?: {
    pullupBar?: boolean;
    loopBands?: boolean;
    dumbbells?: boolean;
    dumbbellMaxKg?: number;
    barbell?: boolean;
    kettlebell?: boolean;
    kettlebellKg?: number;
    bench?: boolean;
    rings?: boolean;
    parallelBars?: boolean;
    sturdyTable?: boolean;
    noEquipment?: boolean;
  };
}

interface LocationStepProps {
  data: Partial<OnboardingData>;
  onNext: (stepData: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

export default function LocationStep({ data, onNext, onBack }: LocationStepProps) {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home' | 'home_gym'>(
    data.trainingLocation || 'home'
  );
  const [trainingType, setTrainingType] = useState<'bodyweight' | 'equipment' | 'machines'>(
    data.trainingType || 'bodyweight'
  );
  const [equipmentPreference, setEquipmentPreference] = useState<EquipmentPreference>(
    data.equipmentPreference || 'mixed'
  );
  const [frequency, setFrequency] = useState<number>(data.frequency || 3);
  const [equipment, setEquipment] = useState({
    pullupBar: data.equipment?.pullupBar || false,
    loopBands: data.equipment?.loopBands || false,
    dumbbells: data.equipment?.dumbbells || false,
    dumbbellMaxKg: data.equipment?.dumbbellMaxKg || 0,
    barbell: data.equipment?.barbell || false,
    kettlebell: data.equipment?.kettlebell || false,
    kettlebellKg: data.equipment?.kettlebellKg || 0,
    bench: data.equipment?.bench || false,
    rings: data.equipment?.rings || false,
    parallelBars: data.equipment?.parallelBars || false,
    rack: (data.equipment as any)?.rack || false,
    cables: (data.equipment as any)?.cables || false,
    sturdyTable: (data.equipment as any)?.sturdyTable || false,
    noEquipment: (data.equipment as any)?.noEquipment || false
  });

  const toggleEquipment = (key: string) => {
    setEquipment(prev => ({
      ...prev,
      [key]: !prev[key],
      // Se seleziona un attrezzo, resetta noEquipment
      noEquipment: key === 'noEquipment' ? !prev[key] : false
    }));
  };

  const updateEquipmentWeight = (key: string, value: number) => {
    setEquipment(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    console.log('[LOCATION_STEP] 🏠 Saving location:', selectedLocation);
    console.log('[LOCATION_STEP] 🎯 Training type:', trainingType);
    console.log('[LOCATION_STEP] 📅 Frequency:', frequency);
    console.log('[LOCATION_STEP] 🔧 Equipment:', equipment);

    onNext({
      trainingLocation: selectedLocation,
      trainingType,
      equipmentPreference: selectedLocation === 'gym' && trainingType === 'equipment' ? equipmentPreference : undefined,
      frequency,
      equipment
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('onboarding.location.title')}</h2>
        <p className="text-slate-400">{t('onboarding.location.subtitle')}</p>
      </div>

      {/* Selezione Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedLocation('home')}
          className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
            selectedLocation === 'home'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }`}
          data-testid="button-location-home"
        >
          <Home className={`w-12 h-12 ${selectedLocation === 'home' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <div className="text-center">
            <p className="font-bold text-lg text-white">{t('onboarding.location.home')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('onboarding.location.homeDesc')}</p>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedLocation('home_gym');
            setTrainingType('equipment');
          }}
          className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
            selectedLocation === 'home_gym'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }`}
          data-testid="button-location-home-gym"
        >
          <Warehouse className={`w-12 h-12 ${selectedLocation === 'home_gym' ? 'text-amber-400' : 'text-slate-400'}`} />
          <div className="text-center">
            <p className="font-bold text-lg text-white">{t('onboarding.location.homeGym') || 'Home Gym'}</p>
            <p className="text-xs text-slate-400 mt-1">{t('onboarding.location.homeGymDesc') || 'Garage o cantina attrezzata'}</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedLocation('gym')}
          className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
            selectedLocation === 'gym'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }`}
          data-testid="button-location-gym"
        >
          <Dumbbell className={`w-12 h-12 ${selectedLocation === 'gym' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <div className="text-center">
            <p className="font-bold text-lg text-white">{t('onboarding.location.gym')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('onboarding.location.gymDesc')}</p>
          </div>
        </button>
      </div>

      {/* Sub-step: Tipo di allenamento (CASA) o Area (PALESTRA) */}
      {selectedLocation === 'home' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">{t('onboarding.location.homeTrainingType')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTrainingType('bodyweight')}
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'bodyweight'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">{t('onboarding.location.bodyweight')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('onboarding.location.bodyweightDesc')}</p>
            </button>

            <button
              onClick={() => setTrainingType('equipment')}
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'equipment'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">{t('onboarding.location.smallEquipment')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('onboarding.location.smallEquipmentDesc')}</p>
            </button>
          </div>

          {/* Opzioni bodyweight - cosa hai a casa */}
          {trainingType === 'bodyweight' && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <p className="text-sm text-white font-medium mb-3">Cosa hai a disposizione?</p>
              <div className="space-y-2">
                <button
                  onClick={() => toggleEquipment('pullupBar')}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${
                    equipment.pullupBar
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {equipment.pullupBar ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">Barra per trazioni</p>
                    <p className="text-xs text-slate-400">Da porta o fissa</p>
                  </div>
                </button>

                <button
                  onClick={() => toggleEquipment('sturdyTable')}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${
                    (equipment as any).sturdyTable
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {(equipment as any).sturdyTable ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">Tavolo robusto</p>
                    <p className="text-xs text-slate-400">Per Inverted Row e simili</p>
                  </div>
                </button>

                <button
                  onClick={() => toggleEquipment('loopBands')}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${
                    equipment.loopBands
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {equipment.loopBands ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">Elastici / Bande</p>
                    <p className="text-xs text-slate-400">Loop bands o resistance bands</p>
                  </div>
                </button>

                {/* Nessuna delle precedenti */}
                <button
                  onClick={() => {
                    setEquipment(prev => ({
                      ...prev,
                      pullupBar: false,
                      sturdyTable: false,
                      loopBands: false,
                      noEquipment: true
                    }));
                  }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${
                    (equipment as any).noEquipment && !equipment.pullupBar && !(equipment as any).sturdyTable && !equipment.loopBands
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {(equipment as any).noEquipment && !equipment.pullupBar && !(equipment as any).sturdyTable && !equipment.loopBands ? (
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">Nessuna delle precedenti</p>
                    <p className="text-xs text-slate-400">Solo corpo libero senza attrezzi</p>
                  </div>
                </button>
              </div>

              {/* Info se nessun attrezzo */}
              {(equipment as any).noEquipment && !equipment.pullupBar && !(equipment as any).sturdyTable && !equipment.loopBands && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-300">
                    Nessun problema! Il programma includerà esercizi di tirata a pavimento e alternative senza attrezzi.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedLocation === 'gym' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">{t('onboarding.location.gymArea')}</h3>
            <p className="text-xs text-slate-400 mb-3">Scegli il tuo stile di allenamento principale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Area Calisthenics */}
            <button
              onClick={() => {
                setTrainingType('bodyweight');
                // Pre-configura equipaggiamento per area calisthenics
                setEquipment({
                  pullupBar: true,
                  loopBands: true,
                  dumbbells: false,
                  dumbbellMaxKg: 0,
                  barbell: false,
                  kettlebell: false,
                  kettlebellKg: 0,
                  bench: false,
                  rings: true,
                  parallelBars: true
                });
              }}
              className={`w-full p-5 rounded-xl border-2 transition-all flex flex-col min-h-[160px] ${
                trainingType === 'bodyweight'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-bold text-white text-lg mb-2">{t('onboarding.location.calisthenics')}</p>
              <p className="text-sm text-slate-400 mb-3 flex-grow">{t('onboarding.location.calisthenicsDesc')}</p>
              <p className="text-xs text-emerald-400 font-medium">{t('onboarding.location.intermediateAdvanced')}</p>
            </button>

            {/* Sala Pesi (include pesi liberi E macchine) */}
            <button
              onClick={() => {
                setTrainingType('equipment');
                // Pre-configura per sala pesi completa (pesi liberi + macchine disponibili)
                setEquipment({
                  pullupBar: true,
                  loopBands: true,
                  dumbbells: true,
                  dumbbellMaxKg: 50,
                  barbell: true,
                  kettlebell: true,
                  kettlebellKg: 32,
                  bench: true,
                  rings: false,
                  parallelBars: false
                });
              }}
              className={`w-full p-5 rounded-xl border-2 transition-all flex flex-col min-h-[160px] ${
                trainingType === 'equipment'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-bold text-white text-lg mb-2">Pesi</p>
              <p className="text-sm text-slate-400 mb-3 flex-grow">Pesi liberi e macchine. Durante i test sceglierai tu se usare bilanciere/manubri o macchine.</p>
              <p className="text-xs text-emerald-400 font-medium">{t('onboarding.location.allLevels')}</p>
            </button>
          </div>

          {/* Conferma equipaggiamento auto-configurato */}
          {trainingType && (
            <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-emerald-300 font-medium mb-2">
                {t('onboarding.location.equipmentConfigured')}
              </p>
              <p className="text-xs text-emerald-200">
                {trainingType === 'bodyweight'
                  ? t('onboarding.location.calisthenicsEquipment')
                  : 'Bilanciere, manubri, macchine, cavi - tutto disponibile. Sceglierai durante i test.'}
              </p>
            </div>
          )}

          {/* Preferenza Equipment: macchine vs pesi liberi (solo per gym + equipment) */}
          {trainingType === 'equipment' && (
            <div className="mt-4">
              <h4 className="font-semibold text-white mb-2 text-sm">Che tipo di attrezzi preferisci?</h4>
              <p className="text-xs text-slate-400 mb-3">Il programma bilancerà gli esercizi in base alla tua preferenza</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setEquipmentPreference('prefer_machines')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    equipmentPreference === 'prefer_machines'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="font-semibold text-white text-sm">Preferisco macchine</p>
                  <p className="text-xs text-slate-400 mt-1">Macchine guidate con supporto pesi liberi (~70/30)</p>
                </button>

                <button
                  onClick={() => setEquipmentPreference('mixed')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    equipmentPreference === 'mixed'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="font-semibold text-white text-sm">Mix di entrambi</p>
                  <p className="text-xs text-slate-400 mt-1">Alternanza bilanciata macchine e pesi liberi (~50/50)</p>
                </button>

                <button
                  onClick={() => setEquipmentPreference('prefer_free_weights')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    equipmentPreference === 'prefer_free_weights'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="font-semibold text-white text-sm">Preferisco pesi liberi</p>
                  <p className="text-xs text-slate-400 mt-1">Bilanciere, manubri e cavi come priorità</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HOME GYM - Selezione attrezzatura disponibile */}
      {selectedLocation === 'home_gym' && (
        <div className="space-y-4 p-6 bg-amber-900/20 rounded-xl border border-amber-500/50">
          <div>
            <h3 className="font-semibold text-white mb-2">
              {t('onboarding.location.homeGymEquipment') || 'Attrezzatura disponibile'}
            </h3>
            <p className="text-xs text-amber-200 mb-4">
              {t('onboarding.location.homeGymEquipmentDesc') || 'Seleziona cosa hai nella tua home gym'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Rack/Squat Stand */}
            <button
              onClick={() => toggleEquipment('rack')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                (equipment as any).rack
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {(equipment as any).rack ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.rack') || 'Rack / Squat Stand'}</span>
              </div>
            </button>

            {/* Bilanciere */}
            <button
              onClick={() => toggleEquipment('barbell')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.barbell
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.barbell ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.barbell')}</span>
              </div>
            </button>

            {/* Manubri */}
            <div className={`p-4 rounded-lg border-2 ${
              equipment.dumbbells
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-600'
            }`}>
              <button
                onClick={() => toggleEquipment('dumbbells')}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {equipment.dumbbells ? (
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="text-white font-medium">{t('equipment.dumbbells')}</span>
                </div>
              </button>
              {equipment.dumbbells && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">{t('equipment.maxWeight')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={equipment.dumbbellMaxKg}
                    onChange={(e) => updateEquipmentWeight('dumbbellMaxKg', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Panca */}
            <button
              onClick={() => toggleEquipment('bench')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.bench
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.bench ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.bench')}</span>
              </div>
            </button>

            {/* Barra Trazioni */}
            <button
              onClick={() => toggleEquipment('pullupBar')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.pullupBar
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.pullupBar ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.pullupBar')}</span>
              </div>
            </button>

            {/* Kettlebell */}
            <div className={`p-4 rounded-lg border-2 ${
              equipment.kettlebell
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-600'
            }`}>
              <button
                onClick={() => toggleEquipment('kettlebell')}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {equipment.kettlebell ? (
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="text-white font-medium">{t('equipment.kettlebell')}</span>
                </div>
              </button>
              {equipment.kettlebell && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">{t('equipment.weight')}</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={equipment.kettlebellKg}
                    onChange={(e) => updateEquipmentWeight('kettlebellKg', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Cavi / Cable Machine */}
            <button
              onClick={() => toggleEquipment('cables')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                (equipment as any).cables
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {(equipment as any).cables ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.cables') || 'Cavi / Pulley'}</span>
              </div>
            </button>

            {/* Elastici */}
            <button
              onClick={() => toggleEquipment('loopBands')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.loopBands
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.loopBands ? (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.loopBands')}</span>
              </div>
            </button>
          </div>

          {/* Summary */}
          <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-300 font-medium mb-1">
              {t('onboarding.location.homeGymSummary') || 'Il programma sarà ottimizzato per la tua attrezzatura'}
            </p>
            <p className="text-xs text-amber-200/70">
              {t('onboarding.location.homeGymNote') || 'Esercizi alternativi verranno suggeriti se manca qualcosa'}
            </p>
          </div>
        </div>
      )}

      {/* Selezione Attrezzatura (solo per CASA + equipment) */}
      {selectedLocation === 'home' && trainingType === 'equipment' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">{t('onboarding.location.homeEquipment')}</h3>
            <p className="text-xs text-slate-400 mb-4">{t('onboarding.location.selectAvailable')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Barra per Trazioni */}
            <button
              onClick={() => toggleEquipment('pullupBar')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.pullupBar
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.pullupBar ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.pullupBar')}</span>
              </div>
            </button>

            {/* Loop Bands */}
            <button
              onClick={() => toggleEquipment('loopBands')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.loopBands
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.loopBands ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.loopBands')}</span>
              </div>
            </button>

            {/* Manubri */}
            <div className={`p-4 rounded-lg border-2 ${
              equipment.dumbbells
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-600'
            }`}>
              <button
                onClick={() => toggleEquipment('dumbbells')}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {equipment.dumbbells ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="text-white font-medium">{t('equipment.dumbbells')}</span>
                </div>
              </button>
              {equipment.dumbbells && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">{t('equipment.maxWeight')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={equipment.dumbbellMaxKg}
                    onChange={(e) => updateEquipmentWeight('dumbbellMaxKg', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Bilanciere */}
            <button
              onClick={() => toggleEquipment('barbell')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.barbell
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.barbell ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.barbell')}</span>
              </div>
            </button>

            {/* Kettlebell */}
            <div className={`p-4 rounded-lg border-2 ${
              equipment.kettlebell
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-600'
            }`}>
              <button
                onClick={() => toggleEquipment('kettlebell')}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {equipment.kettlebell ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="text-white font-medium">{t('equipment.kettlebell')}</span>
                </div>
              </button>
              {equipment.kettlebell && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">{t('equipment.weight')}</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={equipment.kettlebellKg}
                    onChange={(e) => updateEquipmentWeight('kettlebellKg', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Panca */}
            <button
              onClick={() => toggleEquipment('bench')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.bench
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.bench ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.bench')}</span>
              </div>
            </button>

            {/* Anelli */}
            <button
              onClick={() => toggleEquipment('rings')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.rings
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.rings ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.rings')}</span>
              </div>
            </button>

            {/* Parallele */}
            <button
              onClick={() => toggleEquipment('parallelBars')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                equipment.parallelBars
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {equipment.parallelBars ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">{t('equipment.parallelBars')}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Selezione Frequenza */}
      <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-white">{t('onboarding.location.frequency')}</h3>
            <p className="text-xs text-slate-400">{t('onboarding.location.frequencyDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => setFrequency(num)}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                frequency === num
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <span className={`text-xl font-bold ${frequency === num ? 'text-emerald-400' : 'text-white'}`}>
                {num}
              </span>
              <span className="text-xs text-slate-400">
                {num === 1 ? 'giorno' : 'giorni'}
              </span>
            </button>
          ))}
        </div>

        {/* Info sulla frequenza */}
        <div className={`p-3 rounded-lg border ${
          frequency <= 2 ? 'bg-amber-900/20 border-amber-500/30' :
          frequency <= 4 ? 'bg-emerald-900/20 border-emerald-500/30' :
          'bg-blue-900/20 border-blue-500/30'
        }`}>
          <p className={`text-sm ${
            frequency <= 2 ? 'text-amber-300' :
            frequency <= 4 ? 'text-emerald-300' :
            'text-blue-300'
          }`}>
            {frequency === 1 && 'Full body consigliato - ogni sessione allena tutto il corpo'}
            {frequency === 2 && 'Full body o Upper/Lower - ottimo per iniziare'}
            {frequency === 3 && 'Push/Pull/Legs o Full body 3x - equilibrio ideale'}
            {frequency === 4 && 'Upper/Lower 2x o Push/Pull/Legs + extra - buon volume'}
            {frequency === 5 && 'Split avanzato - permette focus su ogni gruppo'}
            {frequency === 6 && 'Push/Pull/Legs 2x - alto volume, richiede buon recupero'}
          </p>
        </div>
      </div>

      {/* Bottoni navigazione */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition"
          >
            ← {t('common.back')}
          </button>
        )}
        <button
          onClick={handleNext}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 rounded-lg font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20`}
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
