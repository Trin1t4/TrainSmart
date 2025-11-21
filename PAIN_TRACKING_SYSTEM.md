# 🩹 PAIN TRACKING SYSTEM - Recupero Motorio Intelligente

Sistema completo per gestione algie e recupero motorio con feedback dolore real-time e auto-adattamento.

---

## 📋 OVERVIEW

**Target utenti**:
- Algie croniche (lombalgia, cervicalgia, etc)
- Post-operatori (ACL, menisco, spalla, etc)
- Post-fisioterapia ritorno attività
- Tendinopatie
- Qualsiasi condizione dolorosa che richiede monitoring

**Principio base**: **IL DOLORE REGNA SOVRANO**
- Feedback dolore 0-10 dopo ogni set
- Sistema adatta automaticamente carico/reps/ROM
- Progressione solo quando dolore assente
- Alert automatici per contatto fisioterapista

---

## 🎯 LOGICA SISTEMA

### **Scala Dolore (0-10)**:

```
0 = Nessun dolore
1-3 = Lieve, tollerabile, OK per continuare
4-6 = Moderato, interferisce → RIDUZIONE NECESSARIA
7-10 = Severo, insopportabile → STOP IMMEDIATO
```

### **Adattamento Progressivo (4 Steps)**:

```
SET 1: Dolore 5/10
├─ STEP 1: Riduzione carico -20% (60kg → 48kg)
│  SET 2: Dolore ancora 5/10
│  ├─ STEP 2: Riduzione reps -3 (10 → 7 reps)
│  │  SET 3: Dolore ancora 4/10
│  │  ├─ STEP 3: Riduzione ROM (100% → 50%, es: half squat)
│  │  │  SET 4: Dolore ancora 4/10
│  │  │  └─ STEP 4: STOP esercizio + Alert "Contatta fisioterapista"
```

### **Progressione Automatica**:

```
Se dolore 0-3 per 2+ sessioni consecutive:
  └─ Suggerimento: +5-10% carico o +2 reps
  └─ Progressione graduale e conservativa
```

---

## 🗄️ DATABASE SCHEMA

### **Tabella: `pain_logs`**
Log dettagliato di ogni set con dolore.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK users |
| exercise_name | TEXT | Nome esercizio |
| set_number | INT | Numero set |
| weight_used | DECIMAL | Peso kg |
| reps_completed | INT | Reps completate |
| rom_percentage | INT | ROM % (100 = full, 50 = half) |
| **pain_level** | INT | **Dolore 0-10** |
| rpe | INT | Sforzo 1-10 |
| pain_location | TEXT | Dove fa male (es: "lower_back") |
| adaptations | JSONB | Array adattamenti applicati |

### **Tabella: `pain_thresholds`**
Soglie sicure memorizzate per esercizio.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| user_id | UUID | FK users |
| exercise_name | TEXT | Nome esercizio |
| **last_safe_weight** | DECIMAL | **Ultimo peso senza dolore** |
| **last_safe_reps** | INT | **Ultime reps senza dolore** |
| last_safe_rom | INT | ROM sicuro % |
| **consecutive_pain_free_sessions** | INT | **Sessioni consecutive senza dolore** |
| max_pain_recorded | INT | Dolore massimo mai registrato |
| **needs_physiotherapist_contact** | BOOL | **Flag alert fisio** |

**Constraint**: UNIQUE(user_id, exercise_name)

---

## 🔧 SERVICE API

### **painManagementService**

```typescript
// 1. Log dolore dopo set
await painManagementService.logPain({
  user_id: userId,
  exercise_name: 'Squat',
  set_number: 1,
  weight_used: 60,
  reps_completed: 10,
  pain_level: 5, // ⚠️
  rpe: 7
});

// 2. Ottieni soglia sicura
const threshold = await painManagementService.getPainThreshold(
  userId,
  'Squat'
);
// → { last_safe_weight: 50, last_safe_reps: 8, ... }

// 3. Suggerisci adattamento
const suggestion = painManagementService.suggestAdaptation(
  painLevel: 5,
  currentWeight: 60,
  currentReps: 10,
  currentRom: 100,
  previousAdaptations: []
);
// → { action: 'reduce_weight', new_weight: 48, message: '...' }

// 4. Suggerisci progressione
const progression = await painManagementService.suggestProgression(
  userId,
  'Squat',
  currentWeight: 50,
  currentReps: 10
);
// → { shouldProgress: true, newWeight: 52.5, ... }

// 5. Ottieni esercizi con alert
const alerts = await painManagementService.getExercisesNeedingAttention(userId);
// → [{ exercise_name: 'Squat', last_pain_level: 7, needs_physiotherapist_contact: true }]
```

---

## 🎨 UI FLOW

### **1. Durante Workout - Dopo ogni set**:

```
┌────────────────────────────────────────┐
│ ✅ Set 1 completato: 10 reps @ 60kg   │
├────────────────────────────────────────┤
│ 📊 Come ti sei sentito?                │
│                                         │
│ RPE (Sforzo):  [1] [2] ... [10]       │
│                                         │
│ 🩹 DOLORE:     [0] [1] ... [10]       │
│                                         │
│ 0 = Nessun dolore                      │
│ 3 = Lieve, OK                          │
│ 6 = Moderato, interferisce            │
│ 10 = Severo, insopportabile           │
└────────────────────────────────────────┘
```

### **2. Se dolore 4-6 → Adattamento**:

```
┌────────────────────────────────────────┐
│ ⚠️ DOLORE RILEVATO (5/10)              │
├────────────────────────────────────────┤
│ Azione automatica:                     │
│ Carico ridotto: 60kg → 48kg (-20%)    │
│                                         │
│ Prossimo set:                          │
│ 10 reps @ 48kg                         │
│                                         │
│ Se dolore persiste, ridurremo le       │
│ ripetizioni automaticamente.           │
│                                         │
│ [OK, CONTINUA]                         │
└────────────────────────────────────────┘
```

### **3. Se dolore persiste dopo 3 step → Stop**:

```
┌────────────────────────────────────────┐
│ ❌ DOLORE PERSISTENTE (5/10)           │
├────────────────────────────────────────┤
│ Dopo riduzione di:                     │
│ • Carico: 60kg → 48kg                  │
│ • Reps: 10 → 7                         │
│ • ROM: 100% → 50% (half squat)        │
│                                         │
│ Il dolore persiste ancora.             │
│                                         │
│ ⚠️ RACCOMANDAZIONE:                    │
│ Sospendi questo esercizio e           │
│ contatta il tuo fisioterapista.        │
│                                         │
│ [CONTATTA FISIO] [SALTA ESERCIZIO]    │
└────────────────────────────────────────┘
```

### **4. Se dolore 0-3 per 2+ sessioni → Progressione**:

```
┌────────────────────────────────────────┐
│ 💪 PROGRESSIONE DISPONIBILE            │
├────────────────────────────────────────┤
│ Squat: 3 sessioni consecutive         │
│ senza dolore significativo!            │
│                                         │
│ Peso attuale: 50kg                     │
│ Peso suggerito: 52.5kg (+5%)          │
│                                         │
│ Vuoi applicare la progressione?        │
│                                         │
│ [SÌ, AUMENTA] [NO, MANTIENI]          │
└────────────────────────────────────────┘
```

---

## 🏥 CASI D'USO SPECIFICI

### **Caso 1: Lombalgia Cronica**

**Setup**:
- Goal: motor_recovery
- Pain location: "lower_back"
- Esercizi focus: Deadlift, Squat, Good Morning

**Workflow**:
1. User fa Deadlift 3x8 @ 50kg
2. Set 1: dolore 2/10 → ✅ Continua
3. Set 2: dolore 4/10 → ⚠️ Riduzione carico a 40kg
4. Set 3 @ 40kg: dolore 2/10 → ✅ Registra soglia sicura
5. Sessione 2: Parte da 40kg (soglia sicura)
6. Se 2+ sessioni senza dolore → Suggerisce 42kg

### **Caso 2: Post-Operatorio ACL**

**Setup**:
- Goal: motor_recovery
- Pain location: "knee"
- Esercizi focus: Leg Extension, Squat parziale, Leg Press

**Workflow**:
1. Squat partenza ROM 50% (half squat)
2. Dolore 1/10 per 3 sessioni → Suggerisce ROM 75%
3. ROM 75%: dolore 3/10 per 2 sessioni → ✅ Mantiene
4. Progressione graduale ROM: 50% → 75% → 100% over 8-12 settimane

### **Caso 3: Tendinopatia Spalla**

**Setup**:
- Goal: motor_recovery
- Pain location: "shoulder"
- Esercizi focus: Overhead Press, Lateral Raise

**Workflow**:
1. Lateral Raise 3x12 @ 5kg
2. Set 1: dolore 6/10 → Riduzione carico a 4kg
3. Set 2 @ 4kg: dolore 5/10 → Riduzione reps a 9
4. Set 3 @ 4kg x 9: dolore 3/10 → ✅ Soglia trovata
5. Sistema registra: max safe = 4kg x 9 reps

---

## 📊 ANALYTICS & MONITORING

### **Dashboard per Fisioterapista/Utente**:

```
┌─────────────────────────────────────────────────┐
│ 📈 PROGRESSIONE RECUPERO MOTORIO                │
├─────────────────────────────────────────────────┤
│ Squat:                                          │
│ ████████░░ 80% recupero                         │
│ Peso: 40kg → 64kg (+60% in 8 settimane)       │
│ Dolore: 6/10 → 1/10                            │
│                                                  │
│ Deadlift:                                       │
│ ██████░░░░ 60% recupero                         │
│ Peso: 30kg → 42kg (+40% in 8 settimane)       │
│ ⚠️ Dolore oscillante (2-5/10)                  │
│                                                  │
│ [VEDI DETTAGLI] [ESPORTA PDF]                  │
└─────────────────────────────────────────────────┘
```

### **Alert Dashboard**:

```
┌─────────────────────────────────────────────────┐
│ ⚠️ ESERCIZI CHE NECESSITANO ATTENZIONE         │
├─────────────────────────────────────────────────┤
│ • Overhead Press                                │
│   Dolore 7/10 ultima sessione                  │
│   ❌ Fisioterapista da contattare               │
│                                                  │
│ • Leg Extension                                 │
│   Dolore 4-6/10 per 3 sessioni consecutive     │
│   ⚠️ Monitorare attentamente                    │
│                                                  │
│ [CONTATTA FISIO] [MODIFICA PROGRAMMA]          │
└─────────────────────────────────────────────────┘
```

---

## 🔐 SAFETY FEATURES

1. **❌ Stop automatico** se dolore ≥7 dopo riduzione ROM
2. **⚠️ Alert fisioterapista** se dolore persiste dopo 3 tentativi riduzione
3. **📊 Log completo** di tutti gli adattamenti per review medica
4. **🔒 RLS policies** - Utente vede solo i propri dati
5. **💾 Backup storico** - Nessun dato cancellato, sempre tracciabile

---

## 🚀 IMPLEMENTAZIONE REQUIRED

### **✅ COMPLETATO**:
1. ✅ Schema database (pain_logs, pain_thresholds)
2. ✅ Trigger automatici per aggiornamento soglie
3. ✅ painManagementService completo
4. ✅ Logica adattamento 4-step
5. ✅ Sistema progressione automatica
6. ✅ motor_recovery parameters aggiornati

### **⏳ DA FARE**:
1. ⏳ Modificare LiveWorkoutSession.tsx:
   - Aggiungere input scala dolore (0-10) dopo ogni set
   - Integrare painManagementService
   - UI per mostrare suggestion adattamento
   - Applicazione automatica riduzioni
   - Alert popup per fisioterapista

2. ⏳ Dashboard monitoring:
   - Vista esercizi con alert
   - Grafici progressione dolore
   - Export PDF per fisioterapista

3. ⏳ Testing completo sistema

---

## 📖 RIFERIMENTI SCIENTIFICI

- **Pain Scale 0-10**: Numeric Rating Scale (NRS), standard clinico
- **Load Management**: <3/10 pain acceptable during rehab (Silbernagel et al.)
- **Progressive Overload**: Graduale 5-10% incrementi in pain-free athletes
- **ROM Progression**: Stepwise ROM increase in post-surgical rehabilitation

---

## 💡 NOTE IMPLEMENTATIVE

**Perché questo sistema è rivoluzionario**:

1. **Feedback real-time**: Non aspetta fine workout, adatta SUBITO
2. **Memoria intelligente**: Impara soglie sicure per ogni utente
3. **Auto-regolante**: Sistema si adatta da solo, nessun calcolo manuale
4. **Safety-first**: Alert automatici, stop preventivi
5. **Tracciabilità medica**: Log completo per fisioterapista

**Differenza da sistemi tradizionali**:
- ❌ Tradizionale: "Riduci carico se fa male" (vago)
- ✅ Questo: Scala 0-10, adattamento automatico in 4 step precisi

---

**Sistema pronto per implementazione finale in LiveWorkoutSession!** 🚀
