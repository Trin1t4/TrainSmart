import { useState, useEffect } from "react";
import { ChevronRight, Check, Info, Dumbbell } from "lucide-react";

const MAIN_EXERCISES = [
  { 
    name: "Squat", 
    description: "Squat con bilanciere sulla schiena",
    instructions: "Trova il carico massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni con buona tecnica. L'ultima rep deve essere dura ma non cedimento."
  },
  { 
    name: "Panca Piana", 
    description: "Panca piana con bilanciere",
    instructions: "Trova il carico massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni controllate. L'ultima rep deve essere impegnativa."
  },
  { 
    name: "Stacco", 
    description: "Stacco da terra (conventional o sumo)",
    instructions: "Trova il carico massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni mantenendo la schiena neutra. Ultima rep difficile."
  },
  { 
    name: "Military Press", 
    description: "Shoulder press in piedi con bilanciere",
    instructions: "Trova il carico massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni senza compensi. Ultima rep dura."
  },
  { 
    name: "Pulley", 
    description: "Lat pulldown / Pulley (o trazioni assistite)",
    instructions: "Trova il carico massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni controllate. Usa presa prona larga."
  }
];

export default function AssessmentFlow({ onComplete }: { onComplete?: () => void }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const [calculatedRM, setCalculatedRM] = useState<number | null>(null);
  const [bodyWeight, setBodyWeight] = useState<number | null>(null);

  const exercise = MAIN_EXERCISES[currentExercise];
  const progress = ((currentExercise + 1) / MAIN_EXERCISES.length) * 100;
  
  // Test 10RM - ripetizioni fisse a 10
  const REPS_10RM = 10;

  // Recupera il peso corporeo dallo screening
  useEffect(() => {
    fetch("/api/screening")
      .then(res => {
        if (!res.ok) throw new Error("Screening not found");
        return res.json();
      })
      .then(data => {
        if (data && data.bodyWeight) {
          setBodyWeight(parseFloat(data.bodyWeight));
        }
      })
      .catch(err => {
        console.error("Error fetching bodyWeight:", err);
        // Se non c'è screening, l'utente potrebbe aver saltato il flusso
        // In questo caso non mostriamo suggerimenti peso
      });
  }, []);

  // Calcola carico suggerito basato sul peso corporeo (per 10RM)
  // 10RM ≈ 75% del 1RM, quindi usiamo moltiplicatori realistici
  const getSuggestedWeight = (exerciseName: string, bw: number) => {
    const multipliers: Record<string, number> = {
      "Squat": 0.75,         // 0.75x peso per 10RM (1RM ≈ 1.0x BW per principianti)
      "Panca Piana": 0.65,   // 0.65x peso per 10RM (1RM ≈ 0.85x BW per principianti)
      "Stacco": 1.0,         // 1.0x peso per 10RM (1RM ≈ 1.3x BW per principianti)
      "Military Press": 0.4, // 0.4x peso per 10RM (1RM ≈ 0.5x BW per principianti)
      "Pulley": 0.65,        // 0.65x peso per 10RM (1RM ≈ 0.85x BW per principianti)
    };
    
    const multiplier = multipliers[exerciseName] || 0.6;
    return Math.round(bw * multiplier / 2.5) * 2.5; // Arrotonda a 2.5kg
  };

  const suggestedWeight = bodyWeight ? getSuggestedWeight(exercise.name, bodyWeight) : null;

  const calculateBrzycki = (w: number, r: number) => {
    if (r === 1) return w;
    // Formula Brzycki corretta: 1RM = weight / (1.0278 - 0.0278 * reps)
    return w / (1.0278 - 0.0278 * r);
  };

  const handleCalculate = () => {
    const w = parseFloat(weight);

    if (w > 0) {
      const oneRM = calculateBrzycki(w, REPS_10RM);
      setCalculatedRM(oneRM);
    }
  };

  const handleSave = async () => {
    if (!calculatedRM) return;

   try {
  const handleSave = async () => {
  if (!calculatedRM) return;
  try {
    console.log("📤 Sending to /api/assessment:", { 
      exerciseName: exercise.name, 
      weight: parseFloat(weight), 
      reps: REPS_10RM 
    });
    
    const response = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseName: exercise.name,
        weight: parseFloat(weight),
        reps: REPS_10RM,
        notes
      })
    });
    
    console.log("✅ Response status:", response.status);
    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Error response:", error);
    }
    console.log("📤 Sending to /api/assessment:", { exerciseName: exercise.name, weight, reps: REPS_10RM });
  const response = await fetch("/api/assessment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exerciseName: exercise.name,
      weight: parseFloat(weight),
      reps: REPS_10RM,
      notes
    })
  });
  console.log("✅ Response:", response.status, await response.text());
        })
      });

      // Salva localmente
      setAssessments(prev => ({
        ...prev,
        [exercise.name]: {
          weight: parseFloat(weight),
          reps: REPS_10RM,
          oneRepMax: calculatedRM
        }
      }));

      // Prossimo esercizio o completa
      if (currentExercise < MAIN_EXERCISES.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setWeight("");
        setNotes("");
        setCalculatedRM(null);
        setShowInfo(true);
      } else {
        // Tutti gli esercizi completati - genera programma
        await generateProgram();
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Errore nel salvare l'assessment");
    }
  };

  const skipExercise = async () => {
    if (currentExercise < MAIN_EXERCISES.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setWeight("");
      setNotes("");
      setCalculatedRM(null);
      setShowInfo(true);
    } else {
      // Tutti gli esercizi completati - genera programma
      await generateProgram();
    }
  };

  const generateProgram = async () => {
  try {
    // Genera programma personalizzato
    const res = await fetch("/api/program/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        assessmentData: assessments 
      })
    });

      if (res.ok) {
        // Programma generato con successo - naviga alla home
        window.location.href = "/";
        if (onComplete) onComplete(assessments);
      } else {
        const error = await res.json();
        alert(`Errore nella generazione del programma: ${error.error || "Riprova"}`);
      }
    } catch (error) {
      console.error("Error generating program:", error);
      alert("Errore nella generazione del programma. Riprova.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assessment di Forza</h1>
          <p className="text-slate-400">
            Test 10RM per calcolare il tuo massimale teorico
          </p>
        </div>

        {/* Skip All Option */}
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-500 mb-1">Non conosci i tuoi massimali?</h3>
              <p className="text-sm text-slate-300">
                Nessun problema! Puoi saltare questi test e il programma userà carichi di default basati sul tuo peso corporeo e livello di esperienza. 
                I pesi saranno conservativi e potrai aggiornarli durante gli allenamenti.
              </p>
            </div>
          </div>
          <button
            onClick={() => generateProgram()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            data-testid="button-skip-all"
          >
            Salta tutti i test - Genera programma con pesi di default
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Esercizio {currentExercise + 1} di {MAIN_EXERCISES.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Info Card */}
        {showInfo && (
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-500 mb-1">Come funziona</h3>
                <p className="text-sm text-slate-300">
                  {exercise.instructions}
                </p>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                >
                  Ho capito →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Card */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{exercise.name}</h2>
              <p className="text-slate-400 text-sm">{exercise.description}</p>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-400">
                💡 <strong>Test 10RM standardizzato:</strong> Trova il carico massimo con cui riesci a fare <strong>esattamente 10 ripetizioni</strong>. 
                L'ultima rep deve essere dura ma non a cedimento muscolare.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Peso massimo per 10 ripetizioni (kg)
              </label>
              {suggestedWeight && (
                <div className="mb-3 bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-3">
                  <p className="text-sm text-emerald-400">
                    💡 <strong>Carico suggerito basato sul tuo peso corporeo ({bodyWeight}kg):</strong> ~{suggestedWeight}kg
                  </p>
                  <button
                    onClick={() => setWeight(suggestedWeight.toString())}
                    className="text-xs text-emerald-300 hover:text-emerald-200 mt-1"
                    data-testid="button-use-suggested"
                  >
                    Usa questo carico come punto di partenza →
                  </button>
                </div>
              )}
              <input
                type="number"
                step="2.5"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setCalculatedRM(null);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-lg"
                placeholder="es. 80"
                data-testid="input-weight"
              />
              <p className="text-xs text-slate-500 mt-1">
                Inserisci il peso con cui riesci a fare 10 reps (non 9, non 11)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Note (opzionale)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
                placeholder="Es. usato bilanciere, tecnica buona..."
                rows={2}
              />
            </div>

            {/* Calculate Button */}
            {!calculatedRM && (
              <button
                onClick={handleCalculate}
                disabled={!weight}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                data-testid="button-calculate"
              >
                Calcola Massimale (1RM)
              </button>
            )}

            {/* Result */}
            {calculatedRM && (
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-6">
                <div className="text-center">
                  <p className="text-sm text-emerald-400 mb-2">Massimale stimato (Formula Brzycki)</p>
                  <p className="text-4xl font-bold text-emerald-500" data-testid="text-calculated-rm">
                    {calculatedRM.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Basato su <strong>{weight}kg × 10 reps</strong> (test 10RM)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={skipExercise}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-sm"
            data-testid="button-skip"
          >
            Salta questo esercizio
          </button>
          <button
            onClick={handleSave}
            disabled={!calculatedRM}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2"
            data-testid="button-save"
          >
            {currentExercise < MAIN_EXERCISES.length - 1 ? (
              <>
                Successivo
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Completa
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Completed Exercises */}
        {Object.keys(assessments).length > 0 && (
          <div className="mt-8 bg-slate-900 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Esercizi completati</h3>
            <div className="space-y-2">
              {Object.entries(assessments).map(([name, data]) => (
                <div key={name} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-300">{name}</span>
                  <span className="font-mono text-emerald-500">
                    {data.oneRepMax.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}