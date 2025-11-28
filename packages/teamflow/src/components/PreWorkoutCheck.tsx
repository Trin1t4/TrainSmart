import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Moon, Battery, AlertCircle, ChevronRight, Info, TrendingUp, CheckCircle, RefreshCw } from "lucide-react";

// Distretti muscolari disponibili
const MUSCLE_DISTRICTS = [
  { value: "spalla_dx", label: "Spalla Destra", affectedExercises: ["bench", "press", "row"] },
  { value: "spalla_sx", label: "Spalla Sinistra", affectedExercises: ["bench", "press", "row"] },
  { value: "gomito_dx", label: "Gomito Destro", affectedExercises: ["bench", "press", "row"] },
  { value: "gomito_sx", label: "Gomito Sinistro", affectedExercises: ["bench", "press", "row"] },
  { value: "polso_dx", label: "Polso Destro", affectedExercises: ["bench", "press"] },
  { value: "polso_sx", label: "Polso Sinistro", affectedExercises: ["bench", "press"] },
  { value: "schiena_alta", label: "Schiena Alta", affectedExercises: ["row", "deadlift", "squat"] },
  { value: "schiena_bassa", label: "Schiena Bassa", affectedExercises: ["deadlift", "squat"] },
  { value: "anca_dx", label: "Anca Destra", affectedExercises: ["squat", "deadlift"] },
  { value: "anca_sx", label: "Anca Sinistra", affectedExercises: ["squat", "deadlift"] },
  { value: "ginocchio_dx", label: "Ginocchio Destro", affectedExercises: ["squat"] },
  { value: "ginocchio_sx", label: "Ginocchio Sinistro", affectedExercises: ["squat"] },
  { value: "caviglia_dx", label: "Caviglia Destra", affectedExercises: ["squat"] },
  { value: "caviglia_sx", label: "Caviglia Sinistra", affectedExercises: ["squat"] },
];

interface PreWorkoutCheckProps {
  workout: any; // Il workout corrente con esercizi
  onComplete: (data: PreWorkoutData) => void;
  onSkip: () => void;
}

export interface PreWorkoutData {
  sleepHours: number;
  energyLevel: number;
  painLevel: number;
  painLocation?: string;
  notes?: string;
  loadReduction?: number;
  affectedExercises?: string[];
  availableWeights?: Record<string, { planned: number; available: number }>;
}

export default function PreWorkoutCheck({ workout, onComplete, onSkip }: PreWorkoutCheckProps) {
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [energyLevel, setEnergyLevel] = useState<number[]>([7]);
  const [painLevel, setPainLevel] = useState<number[]>([1]);
  const [painLocation, setPainLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [availableWeights, setAvailableWeights] = useState<Record<string, { planned: number; available: number }>>({});

  const { toast } = useToast();

  // Recupera analisi dolore persistente
  const { data: painAnalysisData } = useQuery({
    queryKey: ["/api/workout/pain-analysis"]
  });

  // Mutazione per ricalibrazione programma
  const recalibrateMutation = useMutation({
    mutationFn: () => apiRequest("/api/program/recalibrate", {
      method: "POST"
    }),
    onSuccess: (data: any) => {
      toast({
        title: "Programma ricalibrato!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/program/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout/pain-analysis"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile ricalibra il programma",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    onComplete({
      sleepHours,
      energyLevel: energyLevel[0],
      painLevel: painLevel[0],
      painLocation: painLevel[0] > 0 ? painLocation : undefined,
      notes: notes || undefined,
      loadReduction: suggestion.loadReduction,
      affectedExercises: suggestion.affectedExercises,
      availableWeights: Object.keys(availableWeights).length > 0 ? availableWeights : undefined
    });
  };

  const getEnergyLabel = (value: number) => {
    if (value <= 3) return "Molto stanco";
    if (value <= 5) return "Poco riposato";
    if (value <= 7) return "Discreto";
    if (value <= 9) return "Bene";
    return "Ottimo!";
  };

  const getPainLabel = (value: number) => {
    if (value === 1) return "Nessun dolore";
    if (value <= 3) return "Leggero fastidio";
    if (value <= 5) return "Dolore moderato";
    if (value <= 7) return "Dolore importante";
    return "Dolore significativo";
  };

  const getWorkoutSuggestion = () => {
    const energy = energyLevel[0];
    const pain = painLevel[0];
    const sleep = sleepHours;

    // Calcola riduzione carico basata su dolore e distretto
    const selectedDistrict = MUSCLE_DISTRICTS.find(d => d.value === painLocation);
    let loadReduction = 0;
    let affectedExercisesList = "";

    if (pain > 0 && selectedDistrict) {
      // Calcola riduzione percentuale basata sul livello di dolore
      if (pain >= 8) {
        loadReduction = 40;
      } else if (pain >= 6) {
        loadReduction = 30;
      } else if (pain >= 4) {
        loadReduction = 20;
      } else if (pain >= 2) {
        loadReduction = 10;
      }

      // Lista esercizi interessati
      const exerciseNames = selectedDistrict.affectedExercises.map(ex => {
        switch(ex) {
          case "bench": return "Panca";
          case "squat": return "Squat";
          case "deadlift": return "Stacco";
          case "row": return "Rematore/Pulley";
          case "press": return "Military Press";
          default: return ex;
        }
      });
      affectedExercisesList = exerciseNames.join(", ");
    }

    if (pain >= 7) {
      return {
        type: "warning",
        message: `Dolore significativo a ${selectedDistrict?.label || 'distretto selezionato'}. Ridurremo automaticamente il carico del ${loadReduction}% per gli esercizi: ${affectedExercisesList}. Procedi con cautela.`,
        adjustment: `Riduzione carico ${loadReduction}% su: ${affectedExercisesList}`,
        loadReduction,
        affectedExercises: selectedDistrict?.affectedExercises || []
      };
    }

    if (energy <= 4 || sleep < 5) {
      return {
        type: "warning",
        message: "Recupero insufficiente. Ti consiglio di ridurre il volume del 20-30% per evitare sovrallenamento.",
        adjustment: "Riduzione volume 20-30%",
        loadReduction: 0,
        affectedExercises: []
      };
    }

    if (pain >= 4 && selectedDistrict) {
      return {
        type: "caution",
        message: `Dolore moderato a ${selectedDistrict.label}. Ridurremo il carico del ${loadReduction}% per: ${affectedExercisesList}. Monitora attentamente.`,
        adjustment: `Riduzione carico ${loadReduction}% su: ${affectedExercisesList}`,
        loadReduction,
        affectedExercises: selectedDistrict.affectedExercises
      };
    }

    if (pain >= 2 && selectedDistrict) {
      return {
        type: "caution",
        message: `Leggero fastidio a ${selectedDistrict.label}. Per sicurezza ridurremo il carico del ${loadReduction}% per: ${affectedExercisesList}.`,
        adjustment: `Riduzione carico ${loadReduction}% su: ${affectedExercisesList}`,
        loadReduction,
        affectedExercises: selectedDistrict.affectedExercises
      };
    }

    return {
      type: "success",
      message: "Ottime condizioni! Sei pronto per un allenamento produttivo.",
      adjustment: "Nessuna modifica necessaria",
      loadReduction: 0,
      affectedExercises: []
    };
  };

  const suggestion = getWorkoutSuggestion();

  // Filtra esercizi con peso dal workout
  const exercisesWithWeight = workout?.exercises?.filter((ex: any) => ex.weight && ex.weight > 0) || [];

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-background flex items-center py-12">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check Pre-Allenamento</CardTitle>
            <CardDescription>
              Rispondi a queste domande per ottimizzare la tua sessione
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Ore di sonno */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Quante ore hai dormito?</Label>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                  className="w-24"
                  data-testid="input-sleep-hours"
                />
                <span className="text-sm text-muted-foreground">ore</span>
              </div>
            </div>

            {/* Livello energia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Come ti senti riposato?</Label>
              </div>
              <div className="space-y-2">
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-energy"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Stanchissimo</span>
                  <span className="font-semibold text-primary">{energyLevel[0]} - {getEnergyLabel(energyLevel[0])}</span>
                  <span>10 - Perfetto</span>
                </div>
              </div>
            </div>

            {/* Livello dolore */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Hai qualche dolore?</Label>
              </div>
              <div className="space-y-2">
                <Slider
                  value={painLevel}
                  onValueChange={setPainLevel}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-pain"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Nessuno</span>
                  <span className="font-semibold text-primary">{painLevel[0]} - {getPainLabel(painLevel[0])}</span>
                  <span>10 - Molto forte</span>
                </div>
              </div>

              {painLevel[0] > 1 && (
                <div className="mt-3">
                  <Label className="text-sm font-semibold">Seleziona il distretto dolorante</Label>
                  <Select value={painLocation} onValueChange={setPainLocation}>
                    <SelectTrigger className="mt-1" data-testid="select-pain-location">
                      <SelectValue placeholder="Scegli dove senti dolore..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_DISTRICTS.map((district) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Note opzionali */}
            <div className="space-y-2">
              <Label className="text-sm">Note aggiuntive (opzionale)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Qualsiasi altra cosa che vuoi annotare..."
                rows={2}
                data-testid="input-notes"
              />
            </div>

            {/* Analisi dolore persistente */}
            {painAnalysisData?.recoveryCheck?.canReturnToNormal && (
              <div className="rounded-lg p-4 bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Recupero completato!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      {painAnalysisData.recoveryCheck.message}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => recalibrateMutation.mutate()}
                      disabled={recalibrateMutation.isPending}
                      className="gap-2"
                      data-testid="button-recalibrate"
                    >
                      <RefreshCw className={`w-4 h-4 ${recalibrateMutation.isPending ? 'animate-spin' : ''}`} />
                      {recalibrateMutation.isPending ? 'Ricalibrazione...' : 'Ricalibra Programma'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {painAnalysisData?.painAnalysis?.isPersistent && !painAnalysisData?.recoveryCheck?.canReturnToNormal && (
              <div className="rounded-lg p-4 bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Attenzione: Dolore persistente rilevato
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {painAnalysisData.painAnalysis.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggerimento automatico */}
            <div className={`rounded-lg p-4 ${
              suggestion.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
              suggestion.type === 'caution' ? 'bg-blue-500/10 border border-blue-500/20' :
              'bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  suggestion.type === 'warning' ? 'text-amber-500' :
                  suggestion.type === 'caution' ? 'text-blue-500' :
                  'text-emerald-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${
                    suggestion.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                    suggestion.type === 'caution' ? 'text-blue-600 dark:text-blue-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {suggestion.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Modifica suggerita:</strong> {suggestion.adjustment}
                  </p>
                </div>
              </div>
            </div>

            {/* Pesi disponibili oggi */}
            {exercisesWithWeight.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Peso disponibile oggi (opzionale)</Label>
                <p className="text-xs text-muted-foreground">
                  Se hai meno peso del previsto, il sistema ricalcolerà automaticamente serie/reps/tempo
                </p>
                
                <div className="space-y-3">
                  {exercisesWithWeight.map((ex: any, idx: number) => {
                    const planned = ex.weight || 0;
                    const available = availableWeights[ex.name]?.available;
                    const hasInput = available !== undefined && available !== '';
                    const ratio = hasInput ? (Number(available) / planned) : 1;
                    const needsCalibration = hasInput && ratio < 0.9;

                    return (
                      <div key={idx} className="bg-muted/50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">{ex.name}</span>
                          <span className="text-xs text-primary">Programmato: {planned}kg</span>
                        </div>
                        
                        <Input
                          type="number"
                          min={0}
                          step={2.5}
                          placeholder={`Peso disponibile (kg)`}
                          value={availableWeights[ex.name]?.available || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAvailableWeights(prev => ({
                              ...prev,
                              [ex.name]: { planned, available: val }
                            }));
                          }}
                          className="w-full"
                          data-testid={`input-weight-${ex.name.toLowerCase().replace(/\s/g, '-')}`}
                        />

                        {needsCalibration && (
                          <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-600 dark:text-orange-400">
                            Peso ridotto del {Math.round((1 - ratio) * 100)}% → Il sistema adatterà automaticamente l'allenamento
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onSkip}
                className="flex-1"
                data-testid="button-skip-check"
              >
                Salta
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                data-testid="button-start-workout"
              >
                Inizia Allenamento
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
