# HybridRecoveryModal Component

## Panoramica

Componente modal multi-step per attivare il **Recovery Mode in itinere** quando un utente ha dolore persistente (≥4/10) dopo 3 tentativi di riduzione durante un esercizio.

Il modal permette di:
- Attivare Recovery Mode solo per l'area corporea dolorante
- Continuare l'allenamento normale per il resto del corpo
- Visualizzare esercizi coinvolti e parametri recovery

---

## Props Interface

```typescript
interface HybridRecoveryModalProps {
  open: boolean;                    // Visibilità modal
  onClose: () => void;              // Handler chiusura
  exerciseName: string;             // Nome esercizio che causa dolore
  painLevel: number;                // Livello dolore 0-10
  sessions: number;                 // Numero sessioni con dolore persistente
  allExercises: string[];           // Tutti gli esercizi del workout corrente
  onActivate: (bodyArea: string, affectedExercises: string[]) => void;
  onSkip: () => void;               // Handler per skippare senza recovery
}
```

---

## Utilizzo

```typescript
import HybridRecoveryModal from './HybridRecoveryModal';

function LiveWorkoutSession() {
  const [showModal, setShowModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);

  const handleActivate = (bodyArea: string, affectedExercises: string[]) => {
    console.log('Recovery activated:', { bodyArea, affectedExercises });
    // Salvare su database...
  };

  return (
    <>
      {/* ... workout UI ... */}

      {recoveryData && (
        <HybridRecoveryModal
          open={showModal}
          onClose={() => setShowModal(false)}
          exerciseName={recoveryData.exerciseName}
          painLevel={recoveryData.painLevel}
          sessions={recoveryData.sessions}
          allExercises={['Squat', 'Bench Press', 'Deadlift', ...]}
          onActivate={handleActivate}
          onSkip={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

---

## Flow Multi-Step

### 1. CONFIRM (Step iniziale)

Mostra:
- Livello dolore attuale
- Numero sessioni con dolore
- Esercizio che causa problema
- Benefici del Recovery Mode

Azioni:
- "Sì, attiva Recovery" → vai a SELECT_AREA
- "No, salta esercizio" → chiama `onSkip()`

---

### 2. SELECT_AREA

Mostra:
- Grid 2x4 di aree corporee
- Ogni area con icona emoji e label

Aree disponibili:
```typescript
{
  lower_back: '🦴 Lower Back',
  knee: '🦵 Ginocchio',
  shoulder: '💪 Spalla',
  hip: '🦿 Anca',
  neck: '🦴 Collo',
  ankle: '🦵 Caviglia',
  elbow: '🦴 Gomito',
  wrist: '✋ Polso'
}
```

Azioni:
- Click su area → identifica esercizi → vai a SUMMARY
- "Indietro" → torna a CONFIRM

---

### 3. SUMMARY

Mostra:
- Area selezionata
- **Esercizi in Recovery Mode** (primary): parametri ridotti
- **Esercizi con cautela** (secondary): monitoraggio attento
- **Altri esercizi normali**: continuano invariati
- Box parametri recovery:
  - Sets: 2
  - Reps: 8-10
  - Carico: 40-60%
  - ROM: 50% (ridotto)

Azioni:
- "Continua Workout" → chiama `onActivate(bodyArea, affectedExercises)`
- "Cambia area corporea" → torna a SELECT_AREA

---

## Body Area Exercise Mapping

Il componente usa un mapping interno per identificare automaticamente gli esercizi coinvolti:

```typescript
const BODY_AREA_EXERCISE_MAP = {
  lower_back: {
    primary: ['Squat', 'Deadlift', 'Good Morning', 'Romanian DL', ...],
    secondary: ['Leg Press', 'Lunges', 'Step-ups'],
    icon: '🦴'
  },
  knee: {
    primary: ['Squat', 'Leg Extension', 'Leg Press', ...],
    secondary: ['Deadlift', 'Leg Curl', ...],
    icon: '🦵'
  },
  // ...
};
```

**Logica identificazione:**
1. Riceve `allExercises` come prop
2. Per l'area selezionata, itera gli esercizi
3. Usa `includes()` case-insensitive per matching:
   - Se match con `primary` pattern → RECOVERY MODE
   - Se match con `secondary` pattern → CAUTELA
   - Altrimenti → NORMALE

**Esempio:**
```typescript
Area selezionata: 'lower_back'
All exercises: ['Squat', 'Bench Press', 'Leg Press', 'Row', 'Deadlift']

Output:
{
  primary: ['Squat', 'Deadlift'],        // Recovery mode
  secondary: ['Leg Press'],              // Cautela
  normal: ['Bench Press', 'Row']         // Normali
}
```

---

## State Management Interno

```typescript
const [step, setStep] = useState<'confirm' | 'select_area' | 'summary'>('confirm');
const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);
const [affectedExercises, setAffectedExercises] = useState({
  primary: [],
  secondary: [],
  normal: []
});
```

**Reset automatico:**
- Quando `open` diventa `true`, reset a step='confirm'
- Previene inconsistenze se riaperto

**useEffect** per identificazione esercizi:
- Trigger: `selectedBodyArea` cambia
- Calcola `affectedExercises` automaticamente

---

## Styling & Animations

**Framework:** TailwindCSS + Framer Motion

**Color scheme:**
- Orange (500/600/700): Recovery mode theme
- Red (500): Pain warning
- Emerald (500): Normal exercises
- Yellow (500): Caution exercises
- Slate (700/800/900): Background + borders

**Animations:**
```typescript
// Modal container
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="backdrop-blur-sm"
/>

// Content card
<motion.div
  initial={{ scale: 0.9, y: 20 }}
  animate={{ scale: 1, y: 0 }}
  exit={{ scale: 0.9, y: 20 }}
/>

// Step transitions
<AnimatePresence mode="wait">
  {step === 'confirm' && <motion.div initial={{ opacity: 0, x: -20 }} ... />}
  {step === 'select_area' && <motion.div initial={{ opacity: 0, x: -20 }} ... />}
  {step === 'summary' && <motion.div initial={{ opacity: 0, x: -20 }} ... />}
</AnimatePresence>
```

**Responsive:**
- Modal: `max-w-lg w-full`
- Grid body area: `grid-cols-2 gap-3`
- Max height: `max-h-[90vh] overflow-y-auto`
- Padding: `p-4` su mobile, `p-6` su desktop

---

## Testing

### Test manuale:

1. Triggare modal da LiveWorkoutSession:
```typescript
setHybridRecoveryData({
  exerciseName: 'Squat',
  painLevel: 5,
  sessions: 3
});
setShowHybridRecoveryModal(true);
```

2. Verificare flow:
   - CONFIRM → click "Sì, attiva Recovery"
   - SELECT_AREA → seleziona "Lower Back"
   - SUMMARY → verifica lista esercizi
   - Click "Continua Workout"

3. Verificare callback:
```typescript
onActivate={(bodyArea, affectedExercises) => {
  console.log('Body area:', bodyArea);
  console.log('Affected exercises:', affectedExercises);
}}
```

### Edge cases:

- [ ] Modal chiuso → cliccando overlay
- [ ] Modal chiuso → bottone X
- [ ] Step backward → da SELECT_AREA a CONFIRM
- [ ] Step backward → da SUMMARY a SELECT_AREA
- [ ] Nessun esercizio affected (area non coinvolta)
- [ ] Tutti esercizi affected
- [ ] Riaperto modal dopo chiusura (reset state)

---

## Performance

- Rendering condizionale: `{hybridRecoveryData && <Modal />}`
- useEffect solo quando necessario (selectedBodyArea change)
- Nessun re-render eccessivo
- AnimatePresence con `mode="wait"` per evitare overlap

---

## Future Improvements

### Database Integration
```typescript
const handleActivateRecovery = async (bodyArea, affectedExercises) => {
  // Salvare su exercise_recovery_status
  await supabase.from('exercise_recovery_status').insert({
    user_id: userId,
    body_area: bodyArea,
    affected_exercises: affectedExercises,
    recovery_parameters: {
      sets: 2,
      reps_range: '8-10',
      intensity: '40-60%',
      rom: 50
    },
    activated_at: new Date().toISOString(),
    status: 'active'
  });
};
```

### Parametri Recovery Override
```typescript
// In LiveWorkoutSession, quando carica esercizio:
const isInRecovery = recoveryStatus[currentExercise.name];

if (isInRecovery) {
  currentExercise.sets = 2;
  currentExercise.reps = '8-10';
  currentExercise.intensity = '40-60%';
  // Mostra badge "🔄 RECOVERY MODE"
}
```

### Progress Tracking
```typescript
// Quando dolore < 3 per 3 sessioni consecutive:
if (shouldExitRecovery) {
  showProgressionModal({
    message: '🎉 Area recuperata! Tornare parametri normali?',
    bodyArea,
    affectedExercises
  });
}
```

### Multi-Area Support
```typescript
// State:
const [activeRecoveryAreas, setActiveRecoveryAreas] = useState<string[]>([]);

// UI badge su esercizio:
{activeRecoveryAreas.includes('lower_back') && (
  <span className="text-orange-400">🔄 RECOVERY: Lower Back</span>
)}
```

---

## Dependencies

```json
{
  "react": "^18.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x"
}
```

**Nessuna dipendenza esterna aggiuntiva richiesta.**

---

## Maintainability

- **Single Responsibility**: Solo gestione UI modal recovery
- **Props Drilling**: Minimo (solo necessari)
- **State Locale**: Gestito internamente (step, selection)
- **Side Effects**: Controllati con useEffect
- **TypeScript**: Fully typed, no `any`

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-11-20
