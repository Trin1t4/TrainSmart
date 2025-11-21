# 🔄 HYBRID RECOVERY SYSTEM - Recupero Motorio Parallelo

Sistema rivoluzionario: **Recupero motorio si innesta nel programma normale** senza perdere sedute!

---

## 🎯 PROBLEMA RISOLTO

**❌ Sistema tradizionale**:
```
User ha mal di schiena durante squat
  → Stop allenamento lower body
  → Perde 2-3 settimane di progressione
  → Frustrazione e detraining
```

**✅ Sistema ibrido**:
```
User ha mal di schiena durante squat
  → Squat/Deadlift → RECOVERY MODE (2x8, 40%, ROM ridotto)
  → Upper body → CONTINUA NORMALE (Bench 4x6, 80%)
  → User mantiene allenamento e progressione dove possibile!
```

---

## 💡 COME FUNZIONA

### **Scenario Completo**:

```
📅 SESSIONE LOWER BODY

SET 1 Squat @ 100kg x 8:
  └─ Dolore lower back 6/10 ⚠️

SISTEMA:
  1. Riduce carico → 80kg
  2. Set 2 @ 80kg: Dolore ancora 6/10 ⚠️
  3. Riduce reps → 80kg x 5
  4. Set 3: Dolore ancora 5/10 ⚠️

┌─────────────────────────────────────────────┐
│ ⚠️ DOLORE PERSISTENTE - RECOVERY MODE      │
├─────────────────────────────────────────────┤
│ Quale area corporea?                        │
│                                             │
│ [LOWER BACK] [Knee] [Hip] [Altro...]      │
└─────────────────────────────────────────────┘

USER SELEZIONA: Lower Back

┌─────────────────────────────────────────────┐
│ 🔄 MODALITÀ RECOVERY ATTIVATA               │
├─────────────────────────────────────────────┤
│ Lower back: RECOVERY MODE attivo            │
│                                             │
│ Programma modificato:                       │
│ ✅ Upper body → Continua normale            │
│ ⚠️ Lower back exercises → Recovery mode    │
│                                             │
│ Esercizi coinvolti:                         │
│ • Squat → 2x8 @ 40%, ROM 50%               │
│ • Deadlift → 2x8 @ 40%, focus tecnica      │
│ • Good Morning → Saltato temporaneamente   │
│                                             │
│ Non coinvolti (normali):                    │
│ • Bench Press → 4x6 @ 80%                  │
│ • Row → 4x8 @ 75%                          │
│ • Overhead Press → 3x8 @ 70%               │
│                                             │
│ [OK, CONTINUA WORKOUT]                     │
└─────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE EXTENSION

### **Nuova tabella: `exercise_recovery_status`**

```sql
CREATE TABLE exercise_recovery_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_name TEXT NOT NULL,

  -- Status
  is_in_recovery BOOLEAN DEFAULT FALSE,
  recovery_reason TEXT, -- "lower_back_pain", "knee_pain", etc
  body_area_affected TEXT, -- "lower_back", "knee", "shoulder"

  -- Recovery parameters (override program defaults)
  recovery_sets INT DEFAULT 2,
  recovery_reps INT DEFAULT 8,
  recovery_intensity TEXT DEFAULT '40-60%',
  recovery_rom_percentage INT DEFAULT 50,

  -- Tracking
  recovery_started_date TIMESTAMP WITH TIME ZONE,
  sessions_in_recovery INT DEFAULT 0,
  last_pain_level INT,

  -- Criteri per uscita recovery
  consecutive_pain_free_sessions_needed INT DEFAULT 2,
  exit_criteria_met BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, exercise_name)
);
```

---

## 🔧 LOGICA IMPLEMENTAZIONE

### **1. Detection & Activation**

```typescript
// Durante workout, se dolore persiste dopo 3 tentativi:

if (painLevel >= 4 && adaptationAttempts >= 3) {
  // Mostra popup area selection
  const bodyArea = await askUserBodyArea();
  // → User seleziona "lower_back"

  // Identifica esercizi coinvolti
  const affectedExercises = identifyAffectedExercises(
    currentProgram,
    bodyArea
  );
  // → ['Squat', 'Deadlift', 'Good Morning', 'Leg Press']

  // Attiva recovery mode per questi esercizi
  await activateRecoveryMode(userId, affectedExercises, bodyArea);

  // Rigenera workout ibrido
  const hybridWorkout = generateHybridWorkout(
    currentProgram,
    affectedExercises
  );
}
```

### **2. Identificazione Esercizi Coinvolti**

```typescript
function identifyAffectedExercises(
  program: Program,
  bodyArea: string
): string[] {
  const bodyAreaMap = {
    'lower_back': {
      primary: ['Squat', 'Deadlift', 'Good Morning', 'Romanian DL'],
      secondary: ['Leg Press', 'Lunges', 'Step-ups']
    },
    'knee': {
      primary: ['Squat', 'Leg Extension', 'Leg Press', 'Lunges'],
      secondary: ['Deadlift', 'Leg Curl']
    },
    'shoulder': {
      primary: ['Overhead Press', 'Lateral Raise', 'Face Pull'],
      secondary: ['Bench Press', 'Dips', 'Pullups']
    },
    // ... altri mapping
  };

  const affected = bodyAreaMap[bodyArea];

  // Filtra esercizi del programma che coinvolgono area
  return program.exercises
    .filter(ex =>
      affected.primary.some(name => ex.name.includes(name)) ||
      affected.secondary.some(name => ex.name.includes(name))
    )
    .map(ex => ex.name);
}
```

### **3. Generazione Workout Ibrido**

```typescript
function generateHybridWorkout(
  originalProgram: Program,
  affectedExercises: string[]
): HybridWorkout {
  const hybrid = { ...originalProgram };

  hybrid.exercises = originalProgram.exercises.map(ex => {
    if (affectedExercises.includes(ex.name)) {
      // Esercizio in RECOVERY MODE
      return {
        ...ex,
        sets: 2,
        reps: '8-10',
        intensity: '40-60%',
        rest: '150-180s',
        rom_percentage: 50,
        notes: `🔄 RECOVERY MODE - ${ex.notes || ''}`,
        is_recovery: true
      };
    } else {
      // Esercizio NORMALE
      return {
        ...ex,
        is_recovery: false
      };
    }
  });

  return hybrid;
}
```

---

## 🎨 UI EXAMPLES

### **Durante workout - Activation**:

```
┌─────────────────────────────────────────────┐
│ ⚠️ DOLORE PERSISTENTE (5/10)               │
├─────────────────────────────────────────────┤
│ Dopo 3 tentativi di riduzione il dolore    │
│ persiste durante Squat.                     │
│                                             │
│ Vuoi attivare RECOVERY MODE per questa     │
│ area corporea?                              │
│                                             │
│ Questo ti permetterà di:                    │
│ ✅ Continuare allenamento resto del corpo  │
│ ✅ Recuperare gradualmente l'area dolorosa │
│ ✅ Non perdere sessioni                    │
│                                             │
│ [SÌ, ATTIVA RECOVERY] [NO, SALTA ESERCIZIO]│
└─────────────────────────────────────────────┘

↓ User clicca "SÌ, ATTIVA RECOVERY"

┌─────────────────────────────────────────────┐
│ 🔍 QUALE AREA CORPOREA?                     │
├─────────────────────────────────────────────┤
│ Seleziona l'area che causa dolore:         │
│                                             │
│ [🦴 LOWER BACK]  [🦵 KNEE]                 │
│ [🦿 HIP]         [💪 SHOULDER]              │
│ [🦴 NECK]        [🦵 ANKLE]                 │
│ [Altri...]                                  │
└─────────────────────────────────────────────┘

↓ User seleziona "LOWER BACK"

┌─────────────────────────────────────────────┐
│ ✅ RECOVERY MODE ATTIVATO                   │
├─────────────────────────────────────────────┤
│ Area: Lower Back                            │
│                                             │
│ Esercizi modificati (RECOVERY):            │
│ 🔄 Squat                                    │
│ 🔄 Deadlift                                 │
│ 🔄 Good Morning                             │
│                                             │
│ Parametri recovery:                         │
│ • Sets: 2                                   │
│ • Reps: 8-10                                │
│ • Carico: 40-60%                           │
│ • ROM: 50% (ridotto)                       │
│ • Rest: 150-180s (lungo)                   │
│                                             │
│ Altri esercizi: NORMALI                     │
│ ✅ Bench Press (4x6 @ 80%)                 │
│ ✅ Row (4x8 @ 75%)                          │
│                                             │
│ [CONTINUA WORKOUT]                          │
└─────────────────────────────────────────────┘
```

### **Dashboard - Vista Recovery Status**:

```
┌─────────────────────────────────────────────┐
│ 🔄 RECOVERY MODE ATTIVI                     │
├─────────────────────────────────────────────┤
│ Lower Back (3 esercizi)                     │
│ ████████░░ 80% recuperato                   │
│ Attivo da: 5 sessioni                       │
│ Ultimo dolore: 2/10                         │
│                                             │
│ Esercizi:                                   │
│ • Squat: 2x8 @ 50kg (era 100kg)           │
│   Dolore: 6/10 → 2/10 ✅                   │
│                                             │
│ • Deadlift: 2x8 @ 40kg (era 80kg)          │
│   Dolore: 5/10 → 2/10 ✅                   │
│                                             │
│ Progressione suggerita:                     │
│ 💪 2 sessioni senza dolore consecutivo      │
│    → Pronto per aumentare carico +10%       │
│                                             │
│ [VEDI DETTAGLI] [DISATTIVA RECOVERY]       │
└─────────────────────────────────────────────┘
```

---

## 📊 ESEMPIO REALE: 8 SETTIMANE

### **Settimana 1 - Inizio Recovery**:
```
Lower Back Pain durante Squat (6/10)
├─ Squat: 100kg → RECOVERY (2x8 @ 40kg, ROM 50%)
├─ Deadlift: 80kg → RECOVERY (2x8 @ 30kg, ROM 50%)
└─ Upper body: NORMALE (Bench 4x6 @ 80kg)
```

### **Settimana 2-3 - Recovery Progressivo**:
```
Dolore ridotto (3/10)
├─ Squat: 2x8 @ 50kg (+25%), ROM 75%
├─ Deadlift: 2x8 @ 40kg (+33%), ROM 75%
└─ Upper body: PROGRESSIONE NORMALE (+5%)
```

### **Settimana 4-5 - Quasi Recuperato**:
```
Dolore minimo (1/10)
├─ Squat: 3x8 @ 60kg, ROM 100% ✅
├─ Deadlift: 3x8 @ 50kg, ROM 100% ✅
└─ Upper body: PROGRESSIONE NORMALE
```

### **Settimana 6-8 - Exit Recovery**:
```
Nessun dolore (0/10) per 2 sessioni
├─ Sistema suggerisce exit recovery mode
├─ Squat: Torna a programma normale 3x8 @ 70kg
└─ Progressione normale riprende per tutto
```

**Risultato**:
- ✅ Lower back recuperato in 6-8 settimane
- ✅ Upper body: continuato progressione normale (+20% forza)
- ✅ ZERO sessioni perse
- ✅ Utente motivato e senza frustrazione!

---

## 🎯 VANTAGGI SISTEMA IBRIDO

### **Per l'utente**:
1. ✅ **Non perde sessioni** - Continua ad allenarsi
2. ✅ **Recupero mirato** - Solo area problematica
3. ✅ **Progressione resto corpo** - No detraining
4. ✅ **Motivazione alta** - Vede progressi continui
5. ✅ **Flessibile** - Sistema si adatta automaticamente

### **Per il coach/fisio**:
1. ✅ **Monitoring preciso** - Tracking dolore dettagliato
2. ✅ **Intervento rapido** - Recovery attivato subito
3. ✅ **Compliance alta** - Utente continua ad allenarsi
4. ✅ **Report chiari** - Vede progression recovery
5. ✅ **Evidence-based** - Dati numerici dolore

### **Vs Sistema tradizionale**:

| Aspetto | Tradizionale | Sistema Ibrido |
|---------|--------------|----------------|
| Dolore lower back | Stop tutto lower | Recovery lower, normal upper |
| Tempo perso | 2-4 settimane | 0 settimane |
| Upper body | Stop progressione | Continua normale |
| Motivazione | Bassa (frustrato) | Alta (progredisce) |
| Compliance | Bassa | Alta |
| Recovery time | Più lungo | Più rapido |

---

## 🔐 SAFETY & EXIT CRITERIA

### **Attivazione Recovery Mode**:
- ✅ Dolore ≥4 dopo 3 tentativi riduzione
- ✅ User conferma area corporea
- ✅ Sistema identifica esercizi coinvolti
- ✅ Parametri recovery applicati automaticamente

### **Exit Criteria (uscita Recovery)**:
1. Dolore 0-3 per **2+ sessioni consecutive**
2. ROM tornato a 100%
3. Carico vicino a baseline pre-dolore (±20%)
4. User conferma assenza dolore

### **Monitoring Continuo**:
- ❌ Se dolore aumenta → Riduce ulteriormente
- ⚠️ Se dolore plateau (non migliora dopo 4 sessioni) → Alert fisio
- ✅ Se dolore assente → Progressione graduale +5-10%

---

## 💻 IMPLEMENTAZIONE TECNICA

### **Step 1: Database**
```sql
-- Già fatto: pain_logs, pain_thresholds
-- Nuovo: exercise_recovery_status
```

### **Step 2: Service Extension**
```typescript
// painManagementService esteso con:
- activateRecoveryMode(userId, exercises, bodyArea)
- deactivateRecoveryMode(userId, exercise)
- getRecoveryStatus(userId)
- checkExitCriteria(userId, exercise)
```

### **Step 3: Program Generator**
```typescript
// generateHybridProgram(original, recoveryExercises)
// Genera workout con mix recovery + normal
```

### **Step 4: LiveWorkoutSession**
```typescript
// Durante workout:
- Mostra badge "RECOVERY" su esercizi
- Parametri override da recovery_status
- Check dolore ogni set
- Suggerisce exit quando criteri met
```

---

## 🚀 ROADMAP IMPLEMENTAZIONE

### **Phase 1: Core System** (DONE ✅):
- [x] Database schema
- [x] painManagementService
- [x] Logica adattamento base

### **Phase 2: Hybrid System** (TODO):
- [ ] exercise_recovery_status table
- [ ] Body area mapping
- [ ] Hybrid workout generator
- [ ] UI activation flow

### **Phase 3: LiveWorkout Integration** (TODO):
- [ ] Recovery badge su esercizi
- [ ] Parameter override
- [ ] Exit criteria check
- [ ] Progressione suggerita

### **Phase 4: Dashboard** (TODO):
- [ ] Vista recovery status
- [ ] Grafici progression
- [ ] Export report fisio

---

**Sistema ibrido = GAME CHANGER per recupero motorio! 🔥**

Nessun altro sistema sul mercato fa questo!
