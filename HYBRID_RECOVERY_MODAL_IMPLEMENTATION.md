# Hybrid Recovery Modal - Implementation Summary

## Implementazione completata

### File creati

1. **`packages/web/src/components/HybridRecoveryModal.tsx`** (nuovo componente)
   - Modal multi-step per attivazione Recovery Mode
   - 3 step: Confirm → Select Area → Summary
   - Mapping body area → exercises
   - UI con framer-motion animations

### File modificati

2. **`packages/web/src/components/LiveWorkoutSession.tsx`**
   - Import del nuovo componente HybridRecoveryModal
   - Aggiunto state: `showHybridRecoveryModal`, `hybridRecoveryData`
   - Modificata funzione `handleRPESubmit()` per triggare modal quando:
     - `currentPainLevel >= 4`
     - `painAdaptations.length >= 3` (3 tentativi di riduzione)
     - `shouldActivateHybridRecovery()` ritorna `shouldActivate: true`
   - Aggiunti handler: `handleActivateRecovery()`, `handleSkipExercise()`
   - Renderizzato modal nel JSX

---

## Trigger del Modal

Il modal si attiva quando:

```typescript
if (currentPainLevel >= 4 && painAdaptations.length >= 3) {
  const shouldActivate = await painManagementService.shouldActivateHybridRecovery(
    userId,
    currentExercise.name
  );

  if (shouldActivate.shouldActivate) {
    setHybridRecoveryData({
      exerciseName: currentExercise.name,
      painLevel: currentPainLevel,
      sessions: shouldActivate.sessions
    });
    setShowHybridRecoveryModal(true);
  }
}
```

**Condizioni:**
1. Dolore >= 4/10 durante un esercizio
2. Dopo 3 tentativi di riduzione (weight → reps → ROM)
3. Il service conferma dolore persistente su 2+ sessioni

---

## UI del Modal - 3 Steps

### Step 1: Conferma Attivazione

```
┌─────────────────────────────────────────────┐
│ ⚠️ DOLORE PERSISTENTE (5/10)               │
├─────────────────────────────────────────────┤
│ Rilevato per 3 sessioni consecutive         │
│                                             │
│ Dopo 3 tentativi di riduzione il dolore    │
│ persiste durante: Squat                     │
│                                             │
│ Vuoi attivare RECOVERY MODE?               │
│                                             │
│ ✅ Continua allenamento resto del corpo    │
│ ✅ Recupera gradualmente area dolorosa     │
│ ✅ Non perdere sessioni                    │
│                                             │
│ [NO, SALTA ESERCIZIO] [SÌ, ATTIVA RECOVERY]│
└─────────────────────────────────────────────┘
```

### Step 2: Selezione Area Corporea

```
┌─────────────────────────────────────────────┐
│ 🔍 QUALE AREA CORPOREA?                     │
├─────────────────────────────────────────────┤
│ Seleziona l'area che causa dolore:         │
│                                             │
│ [🦴 Lower Back]  [🦵 Ginocchio]            │
│ [🦿 Anca]        [💪 Spalla]                │
│ [🦴 Collo]       [🦵 Caviglia]              │
│ [🦴 Gomito]      [✋ Polso]                  │
│                                             │
│ [INDIETRO]                                  │
└─────────────────────────────────────────────┘
```

### Step 3: Riepilogo Esercizi Coinvolti

```
┌─────────────────────────────────────────────┐
│ ✅ RECOVERY MODE ATTIVATO                   │
├─────────────────────────────────────────────┤
│ Area: Lower Back                            │
│                                             │
│ 🔄 Esercizi in RECOVERY MODE (3):          │
│   • Squat                                   │
│   • Deadlift                                │
│   • Good Morning                            │
│                                             │
│ ⚠️ Esercizi con cautela (2):               │
│   • Leg Press                               │
│   • Lunges                                  │
│                                             │
│ ✅ Altri esercizi: NORMALI (5)             │
│   ✓ Bench Press  ✓ Row                     │
│   ✓ Pullups      ✓ Dips                    │
│   ✓ Bicep Curl                              │
│                                             │
│ Parametri Recovery:                         │
│ Sets: 2  |  Reps: 8-10                     │
│ Carico: 40-60%  |  ROM: 50% (ridotto)      │
│                                             │
│ [CONTINUA WORKOUT]                          │
│ [CAMBIA AREA CORPOREA]                      │
└─────────────────────────────────────────────┘
```

---

## Body Area Exercise Mapping

Il modal usa questo mapping per identificare esercizi coinvolti:

```typescript
const BODY_AREA_EXERCISE_MAP = {
  lower_back: {
    primary: ['Squat', 'Deadlift', 'Good Morning', 'Romanian DL', ...],
    secondary: ['Leg Press', 'Lunges', 'Step-ups'],
    icon: '🦴'
  },
  knee: {
    primary: ['Squat', 'Leg Extension', 'Leg Press', 'Lunges', ...],
    secondary: ['Deadlift', 'Leg Curl', ...],
    icon: '🦵'
  },
  // ... altre aree
};
```

Il sistema identifica:
- **Primary**: Esercizi che vanno in Recovery Mode (parametri ridotti)
- **Secondary**: Esercizi da eseguire con cautela
- **Normal**: Esercizi che continuano normalmente

---

## Handler Implementati

### handleActivateRecovery()

```typescript
const handleActivateRecovery = (bodyArea: string, affectedExercises: string[]) => {
  console.log('🔄 Hybrid Recovery activated:', {
    bodyArea,
    affectedExercises,
    currentExercise: currentExercise?.name
  });

  // TODO: Salvare su database exercise_recovery_status
  toast.success(
    `✅ Recovery Mode attivato per ${bodyArea}. ${affectedExercises.length} esercizi coinvolti.`,
    { duration: 6000 }
  );

  // Chiudi modal e salta esercizio corrente
  setShowHybridRecoveryModal(false);
  // Skip to next exercise
  ...
};
```

### handleSkipExercise()

```typescript
const handleSkipExercise = () => {
  console.log('⏭️ Exercise skipped without recovery activation');
  toast.info('Esercizio saltato. Passiamo al prossimo.', { duration: 3000 });

  setShowHybridRecoveryModal(false);
  // Skip to next exercise
  ...
};
```

---

## Test Plan

### Come testare il modal:

1. **Avvia dev server:**
   ```bash
   cd packages/web
   npm run dev
   ```

2. **Simula scenario dolore persistente:**
   - Inizia un workout
   - Durante un esercizio (es: Squat), inserisci dolore >= 4/10
   - Ripeti per 3 set consecutivi con riduzione parametri
   - Il sistema dovrebbe:
     - Chiamare `shouldActivateHybridRecovery()`
     - Se ritorna `shouldActivate: true`, mostrare modal

3. **Verifica UI:**
   - Step 1: Conferma attivazione
   - Step 2: Seleziona "Lower Back" o altra area
   - Step 3: Verifica lista esercizi coinvolti
   - Click "Continua Workout"
   - Verifica toast di conferma

### Console Logs da verificare:

```
🔄 Hybrid recovery modal triggered: { shouldActivate: true, sessions: 3, avgPain: 5.2 }
🔍 Affected exercises identified: { primary: [...], secondary: [...], normal: [...] }
🔄 Hybrid Recovery activated: { bodyArea: 'lower_back', affectedExercises: [...] }
```

---

## Stato Attuale

### Implementato ✅
- [x] Componente HybridRecoveryModal con 3 step
- [x] Body area mapping (8 aree corporee)
- [x] Identificazione automatica esercizi coinvolti
- [x] Trigger del modal in LiveWorkoutSession
- [x] Handler per attivazione/skip
- [x] UI responsiva con framer-motion
- [x] Toast notifications
- [x] Console logging per debugging

### TODO (next steps) 🚧
- [ ] **Database Integration**: Salvare recovery status su `exercise_recovery_status` table
- [ ] **Parametri Recovery**: Implementare override effettivo (2 sets, 40% intensity, ROM 50%)
- [ ] **Progress Tracking**: Monitorare progressione recovery per riattivazione normale
- [ ] **Multi-area Support**: Gestire recovery mode su più aree contemporaneamente
- [ ] **Analytics**: Dashboard recovery mode (durata, esercizi coinvolti, progressione)

---

## Note Tecniche

### TypeScript
- Nessun errore TypeScript ✅
- Build completato con successo ✅
- Props interfaces ben definiti ✅

### Styling
- TailwindCSS per styling
- Orange theme per Recovery Mode
- Responsive (mobile + desktop)
- Animations con framer-motion

### Performance
- Modal renderizzato condizionalmente
- State management minimale
- No re-render inutili

---

## Problemi Noti

Nessuno al momento. Il build è pulito e il componente è pronto per il test.

---

## Architettura File

```
packages/web/src/components/
├── LiveWorkoutSession.tsx (modified)
│   ├── Import HybridRecoveryModal
│   ├── State: showHybridRecoveryModal, hybridRecoveryData
│   ├── Handlers: handleActivateRecovery(), handleSkipExercise()
│   └── Render: <HybridRecoveryModal />
│
└── HybridRecoveryModal.tsx (new)
    ├── 3 steps: confirm → select_area → summary
    ├── BODY_AREA_EXERCISE_MAP constant
    ├── identifyAffectedExercises() logic
    └── Framer motion animations
```

---

## Comandi Utili

```bash
# Build per verificare TypeScript
npm run build

# Dev server
npm run dev

# Grep per trovare riferimenti
grep -r "HybridRecoveryModal" packages/web/src/

# Check console logs
grep -r "Hybrid recovery" packages/web/src/
```

---

**Status**: ✅ Implementation Complete - Ready for Testing
**Next**: Test in dev environment + Database integration
