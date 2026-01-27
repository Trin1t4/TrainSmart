# TrainSmart Bug Fix Script
## Data: 23 Gennaio 2026

---

## 🔴 BUG 1: Reset Goal - "Benessere" genera programma "Forza"

### File: `api/lib/programGenerator.js`

**Trova questa sezione (circa riga 10-30):**
```javascript
const GOAL_NORMALIZATION = {
  // Italian → English mapping
  'forza': 'strength',
  'ipertrofia': 'muscle_gain',
  'massa': 'muscle_gain',
  'massa_muscolare': 'muscle_gain',
  'dimagrimento': 'fat_loss',
  'perdita_peso': 'fat_loss',
  'tonificazione': 'toning',
  'resistenza': 'endurance',
  'performance': 'performance',
  'performance_sportiva': 'performance',
  'recupero_motorio': 'motor_recovery',
  'motor_recovery': 'motor_recovery',
  'generale': 'general_fitness',
  'fitness_generale': 'general_fitness',
  'general_fitness': 'general_fitness',
  // Already correct (passthrough)
  'strength': 'strength',
  'muscle_gain': 'muscle_gain',
  'fat_loss': 'fat_loss',
  'toning': 'toning',
  'endurance': 'endurance',
  'disability': 'disability',
  'pregnancy': 'pregnancy'
};
```

**Sostituisci con:**
```javascript
const GOAL_NORMALIZATION = {
  // Italian → English mapping
  'forza': 'strength',
  'ipertrofia': 'muscle_gain',
  'massa': 'muscle_gain',
  'massa_muscolare': 'muscle_gain',
  'dimagrimento': 'fat_loss',
  'perdita_peso': 'fat_loss',
  'tonificazione': 'toning',
  'resistenza': 'endurance',
  'performance': 'performance',
  'performance_sportiva': 'performance',
  'prestazioni_sportive': 'performance',
  'recupero_motorio': 'motor_recovery',
  'motor_recovery': 'motor_recovery',
  'generale': 'general_fitness',
  'fitness_generale': 'general_fitness',
  'general_fitness': 'general_fitness',
  // ✅ FIX: Aggiunto benessere/wellness
  'benessere': 'general_fitness',
  'wellness': 'general_fitness',
  // ✅ FIX: Aggiunto corsa
  'corsa': 'endurance',
  'running': 'endurance',
  // Already correct (passthrough)
  'strength': 'strength',
  'muscle_gain': 'muscle_gain',
  'fat_loss': 'fat_loss',
  'toning': 'toning',
  'endurance': 'endurance',
  'disability': 'disability',
  'pregnancy': 'pregnancy'
};
```

---

### File: `api/lib/GOAL_CONFIGS_COMPLETE_CJS.js`

**Trova questa sezione (dopo `motor_recovery`):**
```javascript
  motor_recovery: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore, progressione: difficoltà → carico → ROM',
    homeStrategy: 'mobility_strength',
    painThreshold: true,
    progressionOrder: ['difficulty', 'load', 'rom']
  }
}
```

**Sostituisci con:**
```javascript
  motor_recovery: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore, progressione: difficoltà → carico → ROM',
    homeStrategy: 'mobility_strength',
    painThreshold: true,
    progressionOrder: ['difficulty', 'load', 'rom']
  },

  // ✅ FIX: Aggiunta configurazione general_fitness per goal "benessere"
  general_fitness: {
    name: 'Fitness Generale / Benessere',
    repsRange: '10-15',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 45 },
    intensity: 'moderate',
    focus: 'balanced_health',
    setsMultiplier: 1.0,
    notes: 'Programma bilanciato per salute e benessere generale',
    homeStrategy: 'balanced_bodyweight',
    targetRIR: 3,
    includesCardio: false,
    includesMobility: true,
    mobilityFrequency: 2
  },

  // ✅ FIX: Aggiunta configurazione endurance per goal "corsa/resistenza"
  endurance: {
    name: 'Resistenza',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'moderate',
    focus: 'muscular_endurance',
    setsMultiplier: 0.9,
    notes: 'Alta densità, recuperi brevi, focus resistenza muscolare',
    homeStrategy: 'high_rep_circuits',
    targetRIR: 2,
    includesCardio: true,
    cardioFrequency: 3
  }
}
```

---

## 🔴 BUG 2: Serie non avanza + Peso non si adatta

### File: `packages/web/src/components/LiveWorkoutSession.tsx`

**PROBLEMA 1: currentTargetSets potrebbe essere undefined**

**Trova questa riga (circa riga 150-200):**
```typescript
const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets;
```

**Sostituisci con:**
```typescript
// ✅ FIX: Fallback sicuro per evitare undefined
const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;
```

---

**PROBLEMA 2: handleSetComplete non avanza la serie correttamente**

**Trova la funzione `handleSetComplete` (cerca "const handleSetComplete"):**

Nella funzione, **dopo** il blocco che salva il set nei logs, **aggiungi questo codice PRIMA della fine della funzione:**

```typescript
  // ✅ FIX: Avanza automaticamente alla serie successiva se RPE input è disabilitato
  // o se l'utente ha già fornito feedback inline
  const shouldAutoAdvance = !showRPEInput || skipRPEInput;
  
  if (shouldAutoAdvance) {
    // Avvia timer di recupero
    const shouldStartTimer = currentSet < currentTargetSets || currentExerciseIndex < totalExercises - 1;
    if (shouldStartTimer && currentExercise) {
      let restSeconds = parseRestTimeToSeconds(currentExercise.rest);
      if (menstrualPhase === 'menopause') {
        restSeconds = Math.round(restSeconds * 1.2);
      }
      setRestTimeRemaining(restSeconds);
      setRestTimerActive(true);
      console.log(`⏱️ Rest timer started: ${restSeconds}s`);
    }
    
    // Avanza alla serie/esercizio successivo
    proceedToNextSet();
  }
```

---

**PROBLEMA 3: proceedToNextSet non viene chiamato correttamente**

**Trova la funzione `proceedToNextSet` e SOSTITUISCI INTERAMENTE con:**

```typescript
// ✅ FIX: Funzione proceedToNextSet completamente rivista
const proceedToNextSet = () => {
  if (!currentExercise) {
    console.warn('[proceedToNextSet] No current exercise');
    return;
  }

  console.log(`[proceedToNextSet] Current: Ex ${currentExerciseIndex + 1}/${totalExercises}, Set ${currentSet}/${currentTargetSets}`);

  // ========================================================================
  // SUPERSET LOGIC
  // ========================================================================
  if (isInSuperset && isLastInSupersetGroup()) {
    const currentGroup = currentExercise.supersetGroup;
    const firstInGroup = exercises.find(ex => ex.supersetGroup === currentGroup);

    if (firstInGroup && currentSet < currentTargetSets) {
      const firstIndex = exercises.findIndex(ex => ex.name === firstInGroup.name);
      if (firstIndex !== -1) {
        setCurrentExerciseIndex(firstIndex);
        setCurrentSet(prev => prev + 1);
        toast.info(`🔄 Set ${currentSet + 1} - Superset`, { duration: 2000 });
        console.log(`[proceedToNextSet] Superset: back to first exercise, set ${currentSet + 1}`);
        return;
      }
    }
  }

  // ========================================================================
  // NORMAL FLOW: Check if more sets remaining
  // ========================================================================
  if (currentSet < currentTargetSets) {
    const nextSet = currentSet + 1;
    console.log(`[proceedToNextSet] Advancing to set ${nextSet}/${currentTargetSets}`);
    setCurrentSet(nextSet);
    
    // Reset inputs per il prossimo set
    setCurrentReps(0);
    setShowRPEInput(false);
    setShowRIRConfirm(false);
    
  } else {
    // ========================================================================
    // ALL SETS COMPLETED: Move to next exercise
    // ========================================================================
    console.log(`[proceedToNextSet] All ${currentTargetSets} sets completed for ${currentExercise.name}`);
    
    // Se è superset, salta tutti gli esercizi del gruppo già completati
    let nextIndex = currentExerciseIndex + 1;
    if (isInSuperset) {
      const currentGroup = currentExercise.supersetGroup;
      while (nextIndex < totalExercises && exercises[nextIndex].supersetGroup === currentGroup) {
        nextIndex++;
      }
    }

    if (nextIndex < totalExercises) {
      console.log(`[proceedToNextSet] Moving to exercise ${nextIndex + 1}/${totalExercises}: ${exercises[nextIndex].name}`);
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setCurrentReps(0);
      setCurrentWeight(0);
      setShowRPEInput(false);
      setShowRIRConfirm(false);
      
      toast.success(`✅ ${currentExercise.name} completato!`, {
        description: `Prossimo: ${exercises[nextIndex].name}`
      });
    } else {
      // Workout complete!
      console.log('[proceedToNextSet] All exercises completed, finishing workout');
      handleWorkoutComplete();
    }
  }
};
```

---

**PROBLEMA 4: Timer recupero non visibile nell'UI**

**Cerca nel JSX del componente dove viene mostrato il timer. Trova:**
```tsx
{restTimerActive && restTimeRemaining > 0 && (
```

**Se non esiste, AGGIUNGI questo blocco JSX subito dopo l'header dell'esercizio corrente:**

```tsx
{/* ✅ FIX: Rest Timer Display - sempre visibile quando attivo */}
{restTimerActive && restTimeRemaining > 0 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
  >
    <Timer className="w-5 h-5 animate-pulse" />
    <span className="text-2xl font-bold tabular-nums">
      {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
    </span>
    <button
      onClick={() => {
        setRestTimerActive(false);
        setRestTimeRemaining(0);
        toast.info('⏭️ Recupero saltato');
      }}
      className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm transition-colors"
    >
      Salta
    </button>
  </motion.div>
)}
```

---

## 🟡 BUG 3: Squat senza Pressa nelle alternative

### File: `packages/web/src/components/LiveWorkoutSession.tsx`

**Trova la chiamata a `getVariantsForExercise` (cerca "getVariantsForExercise"):**

```typescript
const variants = getVariantsForExercise(currentExercise.name, currentExercise.pattern);
```

**Aggiungi un fallback per determinare il pattern se mancante:**

```typescript
// ✅ FIX: Determina pattern automaticamente se mancante
const exercisePattern = currentExercise.pattern || determinePatternFromExercise(currentExercise.name);
const variants = getVariantsForExercise(currentExercise.name, exercisePattern);
```

**Poi AGGIUNGI questa funzione helper all'inizio del file (dopo gli imports):**

```typescript
/**
 * ✅ FIX: Determina il pattern di movimento dall'esercizio se non specificato
 */
function determinePatternFromExercise(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  // Lower Push (Squat pattern)
  if (name.includes('squat') || name.includes('leg press') || name.includes('pressa') || 
      name.includes('lunge') || name.includes('affondo') || name.includes('pistol') ||
      name.includes('leg extension') || name.includes('step up')) {
    return 'lower_push';
  }
  
  // Lower Pull (Deadlift/Hinge pattern)
  if (name.includes('deadlift') || name.includes('stacco') || name.includes('rdl') ||
      name.includes('hip thrust') || name.includes('glute bridge') || name.includes('nordic') ||
      name.includes('leg curl') || name.includes('good morning') || name.includes('hyperextension')) {
    return 'lower_pull';
  }
  
  // Horizontal Push (Bench pattern)
  if (name.includes('push-up') || name.includes('push up') || name.includes('piegament') ||
      name.includes('panca') || name.includes('bench') || name.includes('chest press') ||
      name.includes('floor press') || name.includes('dip')) {
    return 'horizontal_push';
  }
  
  // Horizontal Pull (Row pattern)
  if (name.includes('row') || name.includes('remator') || name.includes('pulley') ||
      name.includes('inverted row') || name.includes('seated cable')) {
    return 'horizontal_pull';
  }
  
  // Vertical Push (Overhead pattern)
  if (name.includes('military') || name.includes('shoulder press') || name.includes('pike') ||
      name.includes('handstand') || name.includes('arnold') || name.includes('lateral raise') ||
      name.includes('alzate')) {
    return 'vertical_push';
  }
  
  // Vertical Pull (Pull-up pattern)
  if (name.includes('pull-up') || name.includes('pull up') || name.includes('chin') ||
      name.includes('trazion') || name.includes('lat pulldown') || name.includes('lat machine')) {
    return 'vertical_pull';
  }
  
  // Core
  if (name.includes('plank') || name.includes('crunch') || name.includes('sit-up') ||
      name.includes('leg raise') || name.includes('ab wheel') || name.includes('dead bug') ||
      name.includes('bird dog') || name.includes('pallof')) {
    return 'core';
  }
  
  // Default fallback
  console.warn(`[determinePatternFromExercise] Unknown pattern for: ${exerciseName}`);
  return 'compound';
}
```

---

### File: `packages/web/src/utils/exerciseVariants.ts`

**Trova la funzione `getVariantsForExercise` e SOSTITUISCI con versione migliorata:**

```typescript
/**
 * Get all variants for a given exercise name and pattern
 * Used by ExerciseDislikeModal and Alternatives Modal to find replacements
 * ✅ FIX: Aggiunto fallback per pattern detection e mappatura più completa
 */
export function getVariantsForExercise(
  exerciseName: string,
  patternId?: string
): string[] {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  // ✅ FIX: Se pattern non fornito, prova a dedurlo dal nome esercizio
  let effectivePattern = patternId;
  
  if (!effectivePattern) {
    const name = exerciseName.toLowerCase();
    
    if (name.includes('squat') || name.includes('leg press') || name.includes('pressa') || 
        name.includes('lunge') || name.includes('affondo') || name.includes('pistol')) {
      effectivePattern = 'lower_push';
    } else if (name.includes('deadlift') || name.includes('stacco') || name.includes('hip thrust') ||
               name.includes('leg curl') || name.includes('nordic')) {
      effectivePattern = 'lower_pull';
    } else if (name.includes('push-up') || name.includes('panca') || name.includes('bench') ||
               name.includes('chest') || name.includes('dip')) {
      effectivePattern = 'horizontal_push';
    } else if (name.includes('row') || name.includes('remator') || name.includes('pulley')) {
      effectivePattern = 'horizontal_pull';
    } else if (name.includes('military') || name.includes('shoulder') || name.includes('pike') ||
               name.includes('alzate') || name.includes('lateral')) {
      effectivePattern = 'vertical_push';
    } else if (name.includes('pull-up') || name.includes('trazion') || name.includes('lat') ||
               name.includes('chin')) {
      effectivePattern = 'vertical_pull';
    } else if (name.includes('plank') || name.includes('crunch') || name.includes('ab')) {
      effectivePattern = 'core';
    }
    
    console.log(`[getVariantsForExercise] Pattern inferred: ${effectivePattern} for ${exerciseName}`);
  }

  const variants = variantMap[effectivePattern || ''];
  if (!variants) {
    console.warn(`[getVariantsForExercise] No variants for pattern: ${effectivePattern}`);
    return [];
  }

  // Return all variant names except the current one
  const alternativeNames = variants
    .map(v => v.name)
    .filter(name => name.toLowerCase() !== exerciseName.toLowerCase());
    
  console.log(`[getVariantsForExercise] Found ${alternativeNames.length} alternatives for ${exerciseName}:`, alternativeNames);
  
  return alternativeNames;
}
```

---

## 🟡 BUG 4: Quiz opzionali non accessibili dopo onboarding light

### File: `packages/web/src/components/ScreeningFlow.tsx`

**Trova la funzione `handleComplete` o dove viene chiamato `onComplete` alla fine dello screening.**

**Cerca qualcosa tipo:**
```typescript
onComplete(finalResults);
// oppure
navigate('/dashboard');
```

**MODIFICA per navigare ai quiz opzionali:**

```typescript
// ✅ FIX: Naviga a quiz opzionali invece di dashboard diretto
// Solo se l'utente ha fatto screening light
const screeningType = localStorage.getItem('screening_type') || 'light';

if (screeningType === 'light') {
  console.log('[SCREENING] Light screening completed → /optional-quizzes');
  navigate('/optional-quizzes');
} else {
  console.log('[SCREENING] Full screening completed → /dashboard');
  navigate('/dashboard');
}
```

---

### File: `packages/web/src/pages/Onboarding.tsx`

**Trova la funzione `navigateToQuiz` e salva il tipo di screening scelto:**

**Cerca:**
```typescript
const navigateToQuiz = (finalData: Partial<OnboardingData>) => {
```

**AGGIUNGI all'inizio della funzione:**
```typescript
const navigateToQuiz = (finalData: Partial<OnboardingData>) => {
  // ✅ FIX: Salva il tipo di screening per routing successivo
  const screeningType = finalData.screeningType || 'light';
  localStorage.setItem('screening_type', screeningType);
  console.log(`[ONBOARDING] Screening type saved: ${screeningType}`);
  
  // ... resto della funzione esistente ...
```

---

### File: `packages/web/src/components/Dashboard.tsx`

**Aggiungi un banner per completare i quiz opzionali. Cerca nel JSX principale e AGGIUNGI:**

```tsx
{/* ✅ FIX: Banner per quiz opzionali non completati */}
{(() => {
  const screeningType = localStorage.getItem('screening_type');
  const quizzesCompleted = localStorage.getItem('optional_quizzes_completed');
  
  if (screeningType === 'light' && quizzesCompleted !== 'true') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Migliora il tuo programma</h3>
              <p className="text-sm text-slate-400">
                Completa i quiz opzionali per una personalizzazione più accurata
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/optional-quizzes')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            Completa Quiz
          </button>
        </div>
      </motion.div>
    );
  }
  return null;
})()}
```

---

## 📝 RIEPILOGO FILE DA MODIFICARE

| File | Modifiche |
|------|-----------|
| `api/lib/programGenerator.js` | Aggiungere `benessere`, `wellness`, `corsa` a GOAL_NORMALIZATION |
| `api/lib/GOAL_CONFIGS_COMPLETE_CJS.js` | Aggiungere config `general_fitness` e `endurance` |
| `packages/web/src/components/LiveWorkoutSession.tsx` | Fix serie, timer, pattern detection |
| `packages/web/src/utils/exerciseVariants.ts` | Migliorare `getVariantsForExercise` |
| `packages/web/src/components/ScreeningFlow.tsx` | Routing a optional-quizzes |
| `packages/web/src/pages/Onboarding.tsx` | Salvare screening_type |
| `packages/web/src/components/Dashboard.tsx` | Banner quiz opzionali |

---

## ✅ TEST DA ESEGUIRE DOPO I FIX

1. **Reset completo** → Seleziona "Benessere" → Verifica che NON generi forza
2. **Workout session** → Completa un set → Verifica che avanzi al set 2
3. **Workout session** → Verifica timer recupero visibile
4. **Workout session** → Su Squat, clicca "Postazione occupata" → Verifica Leg Press nelle alternative
5. **Onboarding light** → Completa → Verifica redirect a `/optional-quizzes`
6. **Dashboard** → Se quiz non completati → Verifica banner visibile

