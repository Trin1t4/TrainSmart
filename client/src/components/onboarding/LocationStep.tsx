import React, { useState } from 'react';
import { Home, Dumbbell, CheckCircle, Circle } from 'lucide-react';

interface OnboardingData {
  trainingLocation?: 'gym' | 'home';
  trainingType?: 'bodyweight' | 'equipment' | 'machines';
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
  };
}

interface LocationStepProps {
  data: Partial<OnboardingData>;
  onNext: (stepData: Partial<OnboardingData>) => void;
}

export default function LocationStep({ data, onNext }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home'>(
    data.trainingLocation || 'home'
  );
  const [trainingType, setTrainingType] = useState<'bodyweight' | 'equipment'>(
    data.trainingType || 'bodyweight'
  );
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
    parallelBars: data.equipment?.parallelBars || false
  });

  const toggleEquipment = (key: string) => {
    setEquipment(prev => ({
      ...prev,
      [key]: !prev[key]
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
    console.log('[LOCATION_STEP] 🔧 Equipment:', equipment);

    onNext({
      trainingLocation: selectedLocation,
      trainingType,
      equipment
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dove ti alleni?</h2>
        <p className="text-slate-400">Scegli il tuo ambiente di allenamento principale</p>
      </div>

      {/* Selezione Location */}
      <div className="grid grid-cols-2 gap-4">
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
            <p className="font-bold text-lg text-white">Casa</p>
            <p className="text-xs text-slate-400 mt-1">Corpo libero o piccoli attrezzi</p>
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
            <p className="font-bold text-lg text-white">Palestra</p>
            <p className="text-xs text-slate-400 mt-1">Completa o calisthenics</p>
          </div>
        </button>
      </div>

      {/* Sub-step: Tipo di allenamento (CASA) o Area (PALESTRA) */}
      {selectedLocation === 'home' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">Che tipo di allenamento fai a casa?</h3>
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
              <p className="font-semibold text-white text-sm">A Corpo Libero</p>
              <p className="text-xs text-slate-400 mt-1">Solo bodyweight, no attrezzi</p>
            </button>

            <button
              onClick={() => setTrainingType('equipment')}
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'equipment'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">Piccoli Attrezzi</p>
              <p className="text-xs text-slate-400 mt-1">Manubri, elastici, ecc.</p>
            </button>
          </div>
        </div>
      )}

      {selectedLocation === 'gym' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">Che area della palestra usi principalmente?</h3>
            <p className="text-xs text-slate-400 mb-3">Scegli in base al tuo livello e preferenze</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'bodyweight'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">Calisthenics</p>
              <p className="text-xs text-slate-400 mt-1">Barra, anelli, parallele</p>
              <p className="text-xs text-emerald-400 mt-1">Intermedio/Avanzato</p>
            </button>

            {/* Sala Pesi - Pesi Liberi */}
            <button
              onClick={() => {
                setTrainingType('equipment');
                // Pre-configura per pesi liberi (bilanciere, manubri)
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
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'equipment'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">Pesi Liberi</p>
              <p className="text-xs text-slate-400 mt-1">Bilanciere, manubri, squat rack</p>
              <p className="text-xs text-emerald-400 mt-1">Tutti i livelli</p>
            </button>

            {/* Sala Pesi - Macchine (per principianti) */}
            <button
              onClick={() => {
                setTrainingType('machines');
                // Pre-configura per macchine guidate
                setEquipment({
                  pullupBar: true,
                  loopBands: true,
                  dumbbells: true,
                  dumbbellMaxKg: 30, // Manubri leggeri come complemento
                  barbell: false, // NO bilanciere per chi sceglie macchine
                  kettlebell: false,
                  kettlebellKg: 0,
                  bench: true,
                  rings: false,
                  parallelBars: false
                });
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                trainingType === 'machines'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white text-sm">Macchine</p>
              <p className="text-xs text-slate-400 mt-1">Leg press, chest press, lat machine</p>
              <p className="text-xs text-yellow-400 mt-1">Consigliato principianti</p>
            </button>
          </div>

          {/* Conferma equipaggiamento auto-configurato */}
          {trainingType && (
            <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-emerald-300 font-medium mb-2">
                ✅ Equipaggiamento configurato:
              </p>
              <p className="text-xs text-emerald-200">
                {trainingType === 'bodyweight'
                  ? 'Barra trazioni, Anelli, Parallele, Elastici - Focus: skill calisthenics avanzate'
                  : trainingType === 'equipment'
                  ? 'Bilanciere, Manubri (50kg), Panca, Kettlebell (32kg), Barra - Focus: forza e massa con pesi liberi'
                  : 'Macchine guidate, Manubri leggeri (30kg), Panca, Barra assistita - Focus: sicurezza e tecnica per principianti'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selezione Attrezzatura (solo per CASA + equipment) */}
      {selectedLocation === 'home' && trainingType === 'equipment' && (
        <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <h3 className="font-semibold text-white mb-3">Quali attrezzi hai a disposizione a casa?</h3>
            <p className="text-xs text-slate-400 mb-4">Seleziona tutto ciò che hai disponibile</p>
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
                <span className="text-white font-medium">Barra per Trazioni</span>
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
                <span className="text-white font-medium">Loop Bands (elastici)</span>
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
                  <span className="text-white font-medium">Manubri</span>
                </div>
              </button>
              {equipment.dumbbells && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">Peso massimo (kg)</label>
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
                <span className="text-white font-medium">Bilanciere</span>
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
                  <span className="text-white font-medium">Kettlebell</span>
                </div>
              </button>
              {equipment.kettlebell && (
                <div className="mt-2 ml-8">
                  <label className="text-xs text-slate-400 block mb-1">Peso (kg)</label>
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
                <span className="text-white font-medium">Panca</span>
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
                <span className="text-white font-medium">Anelli</span>
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
                <span className="text-white font-medium">Parallele</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3 rounded-lg font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20"
        >
          Continua →
        </button>
      </div>
    </div>
  );
}
