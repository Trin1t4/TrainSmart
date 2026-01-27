# 🔧 TrainSmart Bug Fix - Istruzioni di Applicazione

## Data: 23 Gennaio 2026
## Versione: 1.0

---

## 📋 CHECKLIST RAPIDA

- [ ] Fix 1: Goal "benessere" → `api/lib/programGenerator.js`
- [ ] Fix 2: Config general_fitness → `api/lib/GOAL_CONFIGS_COMPLETE_CJS.js`
- [ ] Fix 3: Serie workout → `packages/web/src/components/LiveWorkoutSession.tsx`
- [ ] Fix 4: Exercise variants → `packages/web/src/utils/exerciseVariants.ts`
- [ ] Fix 5: Quiz routing → Multiple files

---

## 🔴 FIX 1: Goal "Benessere" genera programma Forza

### Problema
Selezionando "Benessere" come obiettivo, il programma generato ha parametri di forza/ipertrofia invece che fitness generale.

### Causa Root
Il goal `benessere` non è mappato in `GOAL_NORMALIZATION`, quindi fallisce al default `muscle_gain`.

### File da modificare
`api/lib/programGenerator.js`

### Azione
1. Apri il file su GitHub
2. Trova `const GOAL_NORMALIZATION = {`
3. Aggiungi queste righe DOPO `'general_fitness': 'general_fitness',`:

```javascript
  // ✅ FIX: Aggiunto benessere/wellness
  'benessere': 'general_fitness',
  'wellness': 'general_fitness',
  // ✅ FIX: Aggiunto corsa
  'corsa': 'endurance',
  'running': 'endurance',
```

---

## 🔴 FIX 2: Configurazione general_fitness mancante

### Problema
Anche con la mappatura corretta, `GOAL_CONFIGS` non ha la configurazione per `general_fitness`.

### File da modificare
`api/lib/GOAL_CONFIGS_COMPLETE_CJS.js`

### Azione
1. Apri il file su GitHub
2. Trova la fine dell'oggetto `GOAL_CONFIGS`, dopo `motor_recovery: {...}`
3. PRIMA della chiusura `}`, aggiungi:

```javascript
  // DOPO motor_recovery, AGGIUNGI:
  
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
    includesMobility: true,
    mobilityFrequency: 2
  },

  endurance: {
    name: 'Resistenza',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'moderate',
    focus: 'muscular_endurance',
    setsMultiplier: 0.9,
    notes: 'Alta densità, recuperi brevi',
    homeStrategy: 'high_rep_circuits',
    targetRIR: 2,
    includesCardio: true,
    cardioFrequency: 3
  }
```

---

## 🔴 FIX 3: Serie non avanza durante workout

### Problema
- Sempre selezionata la prima serie
- Il peso non si adatta
- Non passa all'esercizio successivo
- Timer recupero non visibile

### File da modificare
`packages/web/src/components/LiveWorkoutSession.tsx`

### Azione 3.1: Fix currentTargetSets
Trova:
```typescript
const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets;
```
Sostituisci con:
```typescript
const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;
```

### Azione 3.2: Aggiungi helper function
All'inizio del file, dopo gli imports, aggiungi la funzione `determinePatternFromExercise` (vedi patch 03).

### Azione 3.3: Sostituisci proceedToNextSet
Trova la funzione `const proceedToNextSet = () => {` e sostituiscila interamente con la versione nel patch 03.

### Azione 3.4: Fix handleSetComplete
Alla fine di `handleSetComplete`, PRIMA della chiusura `}`, aggiungi il codice per avviare il timer e chiamare `proceedToNextSet()` (vedi patch 03).

### Azione 3.5: Aggiungi Timer UI
Nel JSX, aggiungi il componente timer visibile (vedi patch 03).

---

## 🟡 FIX 4: Squat senza Pressa nelle alternative

### Problema
Cliccando "Postazione occupata" su Squat, non appare Leg Press tra le alternative.

### File da modificare
`packages/web/src/utils/exerciseVariants.ts`

### Azione
Sostituisci la funzione `getVariantsForExercise` con la versione migliorata nel patch 04.

---

## 🟡 FIX 5: Quiz opzionali non accessibili

### Problema
Dopo onboarding light, non si viene reindirizzati ai quiz opzionali.

### File da modificare
1. `packages/web/src/pages/Onboarding.tsx`
2. `packages/web/src/components/ScreeningFlow.tsx`
3. `packages/web/src/pages/OptionalQuizzes.tsx`
4. `packages/web/src/components/Dashboard.tsx`

### Azioni
Segui le istruzioni nel patch 05.

---

## ✅ TEST POST-FIX

Dopo aver applicato tutti i fix, esegui questi test:

### Test 1: Goal Benessere
1. Fai logout
2. Fai "Reset completo" dalla dashboard (se hai accesso)
3. Rifai onboarding selezionando "Benessere"
4. **Verifica**: Il programma deve avere rep range 10-15, NON 3-5

### Test 2: Serie Workout
1. Inizia un workout
2. Completa la prima serie di un esercizio
3. **Verifica**: 
   - Timer recupero appare (es. "1:30")
   - Dopo il timer, passa a "Serie 2/3"
   - Completate tutte le serie, passa all'esercizio successivo

### Test 3: Alternative Esercizi
1. Durante workout, su un esercizio tipo Squat
2. Clicca "..." o "Postazione occupata"
3. **Verifica**: Appaiono alternative inclusa "Leg Press"

### Test 4: Quiz Opzionali
1. Crea nuovo account
2. Completa onboarding con "Screening Rapido"
3. **Verifica**: Dopo lo screening, redirect a `/optional-quizzes`
4. Nella Dashboard, se quiz skippati, appare banner

---

## 🆘 TROUBLESHOOTING

### "Le modifiche non hanno effetto"
- Pulisci cache browser (Ctrl+Shift+R)
- Verifica che Vercel abbia deployato (controlla Vercel Dashboard)
- Controlla console per errori

### "Errore di sintassi dopo le modifiche"
- Verifica di non aver duplicato codice
- Controlla parentesi graffe e virgole
- Usa un linter (ESLint)

### "Il workout ancora non funziona"
- Apri DevTools → Console
- Cerca log `[proceedToNextSet]`
- Verifica i valori di `currentSet` e `currentTargetSets`

---

## 📞 SUPPORTO

Se riscontri problemi nell'applicazione dei fix:
1. Verifica di aver seguito le istruzioni nell'ordine corretto
2. Confronta il codice con i file patch forniti
3. Controlla la console del browser per errori specifici
