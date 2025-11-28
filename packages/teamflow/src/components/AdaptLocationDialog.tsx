import { useState } from "react";
import { X, Home, Dumbbell, HelpCircle } from "lucide-react";
import { adaptExercisesForLocation, LocationAdaptationOptions, Exercise } from "@fitnessflow/shared";

interface AdaptLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  dayName: string;
  currentLocation: string;
  currentExercises: Exercise[];
  onAdapt: (exercises: Exercise[], location: string) => void;
}

export default function AdaptLocationDialog({
  isOpen,
  onClose,
  programId,
  dayName,
  currentLocation,
  currentExercises,
  onAdapt,
}: AdaptLocationDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState<"gym" | "home">(
    currentLocation === "gym" ? "gym" : "home"
  );
  const [homeType, setHomeType] = useState<"with_equipment" | "bodyweight">(
    "bodyweight"
  );
  const [equipment, setEquipment] = useState({
    barbell: false,
    dumbbellMaxKg: 0,
    kettlebellKg: [] as number[],
    bands: false,
    pullupBar: false,
    bench: false,
  });
  const [isAdapting, setIsAdapting] = useState(false);

  if (!isOpen) return null;

  const handleAdapt = () => {
    setIsAdapting(true);
    try {
      // Costruisci opzioni per l'adapter
      const options: LocationAdaptationOptions = {
        location: selectedLocation,
        homeType: selectedLocation === "home" ? homeType : undefined,
        equipment: selectedLocation === "home" && homeType === "with_equipment"
          ? equipment
          : undefined,
      };

      // Usa la logica client-side per adattare gli esercizi
      const adaptedExercises = adaptExercisesForLocation(currentExercises, options);

      console.log("[AdaptLocation] Location:", selectedLocation);
      console.log("[AdaptLocation] Esercizi originali:", currentExercises.length);
      console.log("[AdaptLocation] Esercizi adattati:", adaptedExercises.length);

      // Log delle sostituzioni
      adaptedExercises.forEach((ex, i) => {
        if (ex.wasReplaced && ex.name !== currentExercises[i]?.name) {
          console.log(`[AdaptLocation] Sostituito: ${currentExercises[i]?.name} -> ${ex.name}`);
        }
      });

      onAdapt(adaptedExercises, selectedLocation);
      onClose();
    } catch (error) {
      console.error("Errore adattamento:", error);
      alert("Errore durante l'adattamento. Riprova.");
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold">⚙️ Adatta Workout</h2>
            <p className="text-sm text-slate-400 mt-1">
              Modifica dove farai l'allenamento oggi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            data-testid="button-close-adapt"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Dove ti alleni oggi?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedLocation("gym")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLocation === "gym"
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                data-testid="button-location-gym"
              >
                <Dumbbell className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                <p className="font-bold text-lg">🏋️ Palestra</p>
                <p className="text-xs text-slate-400 mt-1">
                  Attrezzatura completa
                </p>
              </button>

              <button
                onClick={() => setSelectedLocation("home")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLocation === "home"
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                data-testid="button-location-home"
              >
                <Home className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                <p className="font-bold text-lg">🏠 Casa</p>
                <p className="text-xs text-slate-400 mt-1">
                  Con o senza attrezzatura
                </p>
              </button>
            </div>
          </div>

          {/* Home Equipment Selection */}
          {selectedLocation === "home" && (
            <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
              <label className="block text-sm font-semibold">
                Che attrezzatura hai a disposizione?
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHomeType("bodyweight")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    homeType === "bodyweight"
                      ? "border-orange-600 bg-orange-600/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  data-testid="button-home-bodyweight"
                >
                  <p className="font-semibold">🤸 Solo Corpo Libero</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Nessuna attrezzatura
                  </p>
                </button>

                <button
                  onClick={() => setHomeType("with_equipment")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    homeType === "with_equipment"
                      ? "border-orange-600 bg-orange-600/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  data-testid="button-home-equipment"
                >
                  <p className="font-semibold">🏋️ Ho Attrezzatura</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Manubri, bande, ecc.
                  </p>
                </button>
              </div>

              {/* Equipment Details */}
              {homeType === "with_equipment" && (
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-300 font-medium">
                    Seleziona cosa hai:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={equipment.barbell}
                        onChange={(e) =>
                          setEquipment({ ...equipment, barbell: e.target.checked })
                        }
                        className="w-4 h-4"
                        data-testid="checkbox-barbell"
                      />
                      <span className="text-sm">Bilanciere</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={equipment.bands}
                        onChange={(e) =>
                          setEquipment({ ...equipment, bands: e.target.checked })
                        }
                        className="w-4 h-4"
                        data-testid="checkbox-bands"
                      />
                      <span className="text-sm">Bande Elastiche</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={equipment.pullupBar}
                        onChange={(e) =>
                          setEquipment({ ...equipment, pullupBar: e.target.checked })
                        }
                        className="w-4 h-4"
                        data-testid="checkbox-pullup"
                      />
                      <span className="text-sm">Sbarra Trazioni</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={equipment.bench}
                        onChange={(e) =>
                          setEquipment({ ...equipment, bench: e.target.checked })
                        }
                        className="w-4 h-4"
                        data-testid="checkbox-bench"
                      />
                      <span className="text-sm">Panca</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm">
                      Manubri (kg massimi per mano):
                    </label>
                    <input
                      type="number"
                      value={equipment.dumbbellMaxKg || ""}
                      onChange={(e) =>
                        setEquipment({
                          ...equipment,
                          dumbbellMaxKg: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Es. 20"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
                      data-testid="input-dumbbell-max"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">
                      AdaptFlow sostituirà automaticamente gli esercizi con
                      varianti adatte all'attrezzatura che hai indicato.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
              data-testid="button-cancel-adapt"
            >
              Annulla
            </button>
            <button
              onClick={handleAdapt}
              disabled={isAdapting}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              data-testid="button-confirm-adapt"
            >
              {isAdapting ? "Adattamento..." : "✓ Adatta Workout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
