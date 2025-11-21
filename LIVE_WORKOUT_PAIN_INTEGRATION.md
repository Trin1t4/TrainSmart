# 🩹 LiveWorkoutSession - Pain Tracking Integration

Modifiche necessarie per integrare pain tracking in LiveWorkoutSession.tsx

---

## 📋 STEP 1: Import painManagementService

**Riga: ~23** (dopo altri import)

```typescript
import { useTranslation } from '../lib/i18n';
import { getExerciseDescription } from '../utils/exerciseDescriptions';
import painManagementService from '../lib/painManagementService'; // ✅ ADD THIS
```

---

## 📋 STEP 2: Aggiungere State per Pain Tracking

**Riga: ~169** (dopo currentRIR)

```typescript
const [currentRIR, setCurrentRIR] = useState(2); // RIR percepito (0-5)
const [currentPainLevel, setCurrentPainLevel] = useState(0); // ✅ ADD THIS (0-10)
const [showPainAlert, setShowPainAlert] = useState(false); // ✅ ADD THIS
const [painAdaptations, setPainAdaptations] = useState<any[]>([]); // ✅ ADD THIS
```

---

## 📋 STEP 3: Modificare handleRPESubmit per includere Pain Logging

**Riga: ~810** (funzione handleRPESubmit completa)

```typescript
// Handle RPE submission with pain tracking
const handleRPESubmit = async () => {
  if (!currentExercise) return;

  // Context-aware RPE adjustment
  const contextAdj = calculateContextAdjustment(
    stressLevel,
    sleepQuality,
    nutritionQuality,
    hydration
  );
  const adjustedRPE = Math.max(1, Math.min(10, currentRPE + contextAdj));

  // Log set completion
  const setLog: SetLog = {
    set_number: currentSet,
    reps_completed: currentReps,
    weight_used: currentWeight,
    rpe: currentRPE,
    rpe_adjusted: adjustedRPE,
    rir_perceived: currentRIR,
    adjusted: false,
    adjustment_reason: undefined
  };

  // ✅ ADD: Log pain if pain level > 0
  if (currentPainLevel > 0) {
    try {
      await painManagementService.logPain({
        user_id: userId,
        program_id: programId,
        exercise_name: currentExercise.name,
        day_name: dayName,
        set_number: currentSet,
        weight_used: currentWeight || undefined,
        reps_completed: currentReps,
        rom_percentage: 100, // TODO: Track ROM if needed
        pain_level: currentPainLevel,
        rpe: currentRPE,
        adaptations: painAdaptations
      });

      console.log(`🩹 Pain logged: ${currentExercise.name} - Level ${currentPainLevel}/10`);
    } catch (error) {
      console.error('Error logging pain:', error);
    }
  }

  // ✅ ADD: Check for pain-based adaptation
  if (currentPainLevel >= 4) {
    const suggestion = painManagementService.suggestAdaptation(
      currentPainLevel,
      currentWeight || 0,
      currentReps,
      100, // ROM percentage
      painAdaptations
    );

    console.log('🩹 Pain adaptation suggested:', suggestion);

    // Show alert with suggestion
    if (suggestion.action !== 'continue') {
      setShowPainAlert(true);
      toast.warning(suggestion.message, {
        duration: 5000
      });

      // Apply adaptation automatically for next set
      if (suggestion.new_weight !== undefined) {
        // User should reduce weight for next set
        console.log(`⚠️ Suggested weight reduction: ${currentWeight}kg → ${suggestion.new_weight}kg`);
      }
      if (suggestion.new_reps !== undefined) {
        // User should reduce reps for next set
        console.log(`⚠️ Suggested reps reduction: ${currentReps} → ${suggestion.new_reps}`);
      }

      // Track adaptation
      setPainAdaptations([
        ...painAdaptations,
        {
          type: suggestion.action === 'reduce_weight' ? 'weight_reduced' :
                suggestion.action === 'reduce_reps' ? 'reps_reduced' :
                suggestion.action === 'reduce_rom' ? 'rom_reduced' : 'exercise_stopped',
          from: currentWeight,
          to: suggestion.new_weight || currentWeight,
          reason: `pain_${currentPainLevel}`,
          timestamp: new Date().toISOString()
        }
      ]);

      // If should stop exercise
      if (suggestion.action === 'stop_exercise') {
        toast.error('Esercizio sospeso per dolore persistente. Contatta fisioterapista.', {
          duration: 8000
        });
        // Skip to next exercise
        if (currentExerciseIndex < totalExercises - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSet(1);
          setShowRPEInput(false);
          setCurrentPainLevel(0); // Reset
          setPainAdaptations([]); // Reset
          return;
        }
      }
    }
  }

  // ✅ ADD: Check for hybrid recovery activation (2+ sessions persistent pain)
  if (currentPainLevel >= 4) {
    try {
      const shouldActivate = await painManagementService.shouldActivateHybridRecovery(
        userId,
        currentExercise.name
      );

      if (shouldActivate.shouldActivate) {
        toast.warning(
          `🔄 Dolore persistente rilevato per ${shouldActivate.sessions} sessioni. Sistema suggerisce Recovery Mode in itinere.`,
          { duration: 8000 }
        );
        console.log('🔄 Hybrid recovery suggested:', shouldActivate);
        // TODO: Show modal per attivazione hybrid recovery
      }
    } catch (error) {
      console.error('Error checking hybrid recovery:', error);
    }
  }

  // Update set logs
  const updatedLogs = {
    ...setLogs,
    [currentExercise.name]: [
      ...(setLogs[currentExercise.name] || []),
      setLog
    ]
  };
  setSetLogs(updatedLogs);

  // Auto-regulation analysis
  analyzeRPEAndSuggest(currentRPE);

  // Hide RPE input
  setShowRPEInput(false);

  // Reset for next set
  setCurrentReps(0);
  setCurrentWeight(0);
  setCurrentRPE(7);
  setCurrentRIR(2);
  setCurrentPainLevel(0); // ✅ ADD: Reset pain level

  // Proceed to next set or exercise
  proceedToNextSet();
};
```

---

## 📋 STEP 4: Aggiungere UI Pain Tracking nel Modal RPE

**Riga: ~1774** (dopo RIR section, prima del bottone submit)

```typescript
            </div>

            {/* ✅ ADD: Pain Level Tracking */}
            {(userId && programId && dayName) && ( // Only show if goal=motor_recovery or always
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-red-300 font-bold">🩹 Livello Dolore</p>
                    <p className="text-slate-400 text-xs">0 = nessuno, 10 = insopportabile</p>
                  </div>
                  <span className="text-3xl font-bold text-red-400">{currentPainLevel}</span>
                </div>

                {/* Pain Scale 0-10 */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={currentPainLevel}
                    onChange={(e) => setCurrentPainLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />

                  <div className="grid grid-cols-11 gap-1">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(val => (
                      <button
                        key={val}
                        onClick={() => setCurrentPainLevel(val)}
                        className={`p-2 rounded text-xs font-bold transition-all ${
                          currentPainLevel === val
                            ? val === 0 ? 'bg-green-500/30 text-green-300' :
                              val <= 3 ? 'bg-yellow-500/30 text-yellow-300' :
                              val <= 6 ? 'bg-orange-500/30 text-orange-300' :
                              'bg-red-500/30 text-red-300'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* Pain level indicators */}
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div className="text-center">
                      <span className="text-green-400">0-3</span>
                      <p className="text-slate-500">Lieve/OK</p>
                    </div>
                    <div className="text-center">
                      <span className="text-orange-400">4-6</span>
                      <p className="text-slate-500">Moderato</p>
                    </div>
                    <div className="text-center">
                      <span className="text-red-400">7-10</span>
                      <p className="text-slate-500">Severo</p>
                    </div>
                  </div>
                </div>

                {/* Pain Warning */}
                {currentPainLevel >= 4 && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    <p className="text-amber-300 text-xs font-semibold">
                      ⚠️ Dolore moderato/alto rilevato
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {currentPainLevel >= 7
                        ? 'Sistema ridurrà ROM o sospenderà esercizio'
                        : 'Sistema adatterà automaticamente carico/reps'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleRPESubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300"
            >
```

---

## 📋 STEP 5: Aggiungere check Pain Threshold all'inizio workout

**Riga: ~200** (dopo useEffect per gender fetch)

```typescript
// ✅ ADD: Fetch pain thresholds for exercises
useEffect(() => {
  if (!userId || !open) return;

  const fetchPainThresholds = async () => {
    try {
      // Check each exercise for existing pain thresholds
      const thresholds = await Promise.all(
        initialExercises.map(ex =>
          painManagementService.getPainThreshold(userId, ex.name)
        )
      );

      // Log thresholds for debugging
      thresholds.forEach((threshold, i) => {
        if (threshold && threshold.last_pain_level > 0) {
          console.log(`🩹 Pain threshold found for ${initialExercises[i].name}:`, threshold);

          if (threshold.last_safe_weight) {
            console.log(`   Safe weight: ${threshold.last_safe_weight}kg`);
          }
          if (threshold.needs_physiotherapist_contact) {
            toast.warning(
              `⚠️ ${initialExercises[i].name}: contatta fisioterapista (dolore precedente ${threshold.last_pain_level}/10)`,
              { duration: 8000 }
            );
          }
        }
      });
    } catch (error) {
      console.error('Error fetching pain thresholds:', error);
    }
  };

  fetchPainThresholds();
}, [userId, open, initialExercises]);
```

---

## 📋 STEP 6: Visualizzare Badge Recovery su Esercizi

**Riga: ~1555** (nel rendering currentExercise name)

```typescript
<div className="flex items-center justify-between mb-2">
  <div className="flex items-center gap-2">
    <h3 className="text-2xl font-bold text-white">{currentExercise.name}</h3>
    {/* ✅ ADD: Recovery badge if in recovery mode */}
    {currentExercise.is_recovery && (
      <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-orange-300 text-xs font-bold">
        🔄 RECOVERY
      </span>
    )}
  </div>
  {exerciseInfo && (
    <button
      onClick={() => setShowExerciseDescription(!showExerciseDescription)}
      className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
      title="Mostra spiegazione esercizio"
    >
      <Info className="w-5 h-5" />
    </button>
  )}
</div>
```

---

## 🎯 SUMMARY MODIFICHE

| Modifica | Riga | Tipo |
|----------|------|------|
| Import painManagementService | ~23 | Import |
| Add currentPainLevel state | ~169 | State |
| Modify handleRPESubmit | ~810 | Function |
| Add pain UI in modal | ~1774 | UI |
| Add pain threshold check | ~200 | useEffect |
| Add recovery badge | ~1555 | UI |

---

## 🧪 TESTING CHECKLIST

Dopo le modifiche, testare:

1. [ ] Pain tracking UI appare nel modal RPE
2. [ ] Pain level 0-10 salvato correttamente
3. [ ] Pain level 4-6 trigger adattamento carico
4. [ ] Pain level 7+ trigger warning stop
5. [ ] Pain thresholds caricati all'inizio workout
6. [ ] Badge RECOVERY mostrato su esercizi in recovery
7. [ ] Suggestion hybrid recovery dopo 2 sessioni dolore
8. [ ] Compilazione TypeScript senza errori

---

**Implementare queste modifiche in LiveWorkoutSession.tsx per completare il sistema pain-aware!** 🚀
