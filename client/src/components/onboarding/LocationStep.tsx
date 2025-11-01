import { useState } from 'react';
import { Home, Dumbbell, HelpCircle } from 'lucide-react';
import { OnboardingData } from '../../types/onboarding.types';

interface LocationStepProps {
  data: Partial<OnboardingData>;
  onNext: (stepData: Partial<OnboardingData>) => void;
}

export default function LocationStep({ data, onNext }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<'gym' | 'home' | 'mixed'>(
    data.trainingLocation || 'gym'
  );
  const [homeType, setHomeType] = useState<'bodyweight' | 'withequipment'>(
    data.homeType || 'bodyweight'
  );
  const [equipment, setEquipment] = useState({
    barbell: data.equipment?.barbell || false,
    dumbbellMaxKg: data.equipment?.dumbbellMaxKg || 0,
    kettlebellKg: data.equipment?.kettlebellKg || [0],
    bands: data.equipment?.bands || false,
    pullupBar: data.equipment?.pullupBar || false,
    bench: data.equipment?.bench || false,
  });

  const handleNext = () => {
    console.log('[LOCATIONSTEP] 📍 Location selected:', selectedLocation);
    console.log('[LOCATIONSTEP] 🏠 Home type:', homeType);
    console.log('[LOCATIONSTEP] 🛠️ Equipment:', equipment);

    // ✅ PASSA LOCATION A onNext!
    onNext({
      trainingLocation: selectedLocation,
      homeType: selectedLocation === 'home' || selectedLocation === 'mixed' ? homeType : undefined,
      equipment: (selectedLocation === 'home' || selectedLocation === 'mixed') && homeType === 'withequipment' 
        ? equipment 
        : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dove ti Alleni?</h2>
        <p className="text-slate-300">Scegli il tuo ambiente di allenamento</p>
      </div>

      {/* Location Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GYM */}
        <button
          onClick={() => {
            console.log('[LOCATIONSTEP] ✅ GYM selected');
            setSelectedLocation('gym');
          }}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedLocation === 'gym'
              ? 'border-emerald-600 bg-emerald-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          data-testid="button-location-gym"
        >
          <Dumbbell className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
          <p className="font-bold text-lg text-white">Palestra</p>
          <p className="text-xs text-slate-400 mt-1">Attrezzatura completa</p>
        </button>

        {/* HOME */}
        <button
          onClick={() => {
            console.log('[LOCATIONSTEP] ✅ HOME selected');
            setSelectedLocation('home');
          }}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedLocation === 'home'
              ? 'border-blue-600 bg-blue-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          data-testid="button-location-home"
        >
          <Home className="w-10 h-10 mx-auto mb-3 text-blue-400" />
          <p className="font-bold text-lg text-white">Casa</p>
          <p className="text-xs text-slate-400 mt-1">Corpo libero o attrezzatura minima</p>
        </button>

        {/* MIXED */}
        <button
          onClick={() => {
            console.log('[LOCATIONSTEP] ✅ MIXED selected');
            setSelectedLocation('mixed');
          }}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedLocation === 'mixed'
              ? 'border-orange-600 bg-orange-600/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          data-testid="button-location-mixed"
        >
          <div className="w-10 h-10 mx-auto mb-3 text-orange-400 text-2xl flex items-center justify-center">🔄</div>
          <p className="font-bold text-lg text-white">Misto</p>
          <p className="text-xs text-slate-400 mt-1">Alcuni giorni palestra, altri casa</p>
        </button>
      </div>

      {/* HOME EQUIPMENT SELECTION */}
      {(selectedLocation === 'home' || selectedLocation === 'mixed') && (
        <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div>
            <p className="font-semibold text-white mb-3">Che attrezzatura hai a disposizione?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* BODYWEIGHT ONLY */}
            <button
              onClick={() => {
                console.log('[LOCATIONSTEP] ✅ BODYWEIGHT selected');
                setHomeType('bodyweight');
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                homeType === 'bodyweight'
                  ? 'border-orange-600 bg-orange-600/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              data-testid="button-home-bodyweight"
            >
              <p className="font-semibold text-white">Solo Corpo Libero</p>
              <p className="text-xs text-slate-400 mt-1">Nessuna attrezzatura</p>
            </button>

            {/* WITH EQUIPMENT */}
            <button
              onClick={() => {
                console.log('[LOCATIONSTEP] ✅ WITH EQUIPMENT selected');
                setHomeType('withequipment');
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                homeType === 'withequipment'
                  ? 'border-blue-600 bg-blue-600/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              data-testid="button-home-equipment"
            >
              <p className="font-semibold text-white">Ho Attrezzatura</p>
              <p className="text-xs text-slate-400 mt-1">Manubri, bande, ecc.</p>
            </button>
          </div>

          {/* EQUIPMENT DETAILS */}
          {homeType === 'withequipment' && (
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-300 font-medium">Seleziona cosa hai:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* BARBELL */}
                <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-900/30">
                  <input
                    type="checkbox"
                    checked={equipment.barbell}
                    onChange={(e) => {
                      console.log('[LOCATIONSTEP] ✅ Barbell toggled:', e.target.checked);
                      setEquipment({ ...equipment, barbell: e.target.checked });
                    }}
                    className="w-4 h-4"
                    data-testid="checkbox-equipment-barbell"
                  />
                  <span className="text-sm font-semibold">Bilanciere</span>
                </label>

                {/* DUMBBELL */}
                <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/30">
                  <label className="text-sm font-semibold text-white block mb-2">Manubri (kg max)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={equipment.dumbbellMaxKg}
                    onChange={(e) => {
                      console.log('[LOCATIONSTEP] ✅ Dumbbell max kg:', e.target.value);
                      setEquipment({ ...equipment, dumbbellMaxKg: parseFloat(e.target.value) || 0 });
                    }}
                    placeholder="Es. 20"
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500"
                    data-testid="input-dumbbell-max"
                  />
                </div>

                {/* BANDS */}
                <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-900/30">
                  <input
                    type="checkbox"
                    checked={equipment.bands}
                    onChange={(e) => {
                      console.log('[LOCATIONSTEP] ✅ Bands toggled:', e.target.checked);
                      setEquipment({ ...equipment, bands: e.target.checked });
                    }}
                    className="w-4 h-4"
                    data-testid="checkbox-equipment-bands"
                  />
                  <span className="text-sm font-semibold">Bande Elastiche</span>
                </label>

                {/* PULLUP BAR */}
                <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-900/30">
                  <input
                    type="checkbox"
                    checked={equipment.pullupBar}
                    onChange={(e) => {
                      console.log('[LOCATIONSTEP] ✅ Pullup bar toggled:', e.target.checked);
                      setEquipment({ ...equipment, pullupBar: e.target.checked });
                    }}
                    className="w-4 h-4"
                    data-testid="checkbox-equipment-pullupbar"
                  />
                  <span className="text-sm font-semibold">Sbarra per Trazioni</span>
                </label>

                {/* BENCH */}
                <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-900/30">
                  <input
                    type="checkbox"
                    checked={equipment.bench}
                    onChange={(e) => {
                      console.log('[LOCATIONSTEP] ✅ Bench toggled:', e.target.checked);
                      setEquipment({ ...equipment, bench: e.target.checked });
                    }}
                    className="w-4 h-4"
                    data-testid="checkbox-equipment-bench"
                  />
                  <span className="text-sm font-semibold">Panca</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INFO BOX */}
      <div className="p-4 bg-blue-600/10 border border-blue-600 rounded-lg flex gap-3">
        <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-300">Perché chiediamo questo?</p>
          <p className="text-xs text-blue-200 mt-1">
            La location determina quali esercizi potrai fare. Gli esercizi da palestra verranno adattati automaticamente a corpo libero se non hai attrezzatura.
          </p>
        </div>
      </div>

      {/* NEXT BUTTON */}
      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-lg transition-all hover:scale-105"
        data-testid="button-next-location"
      >
        Continua →
      </button>
    </div>
  );
}
