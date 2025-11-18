# 🤖 RPE AUTO-REGULATION SYSTEM

## Overview

Sistema avanzato di auto-regolazione basato su **RPE (Rate of Perceived Exertion)** che adatta automaticamente il volume e l'intensità del programma in base alla fatica percepita dall'utente.

### Obiettivi del Sistema

1. **Prevenire Sovrallenamento**: Riduce volume quando RPE troppo alto
2. **Ottimizzare Progressione**: Aumenta volume quando RPE troppo basso
3. **Personalizzazione Adattiva**: Ogni utente ha recupero diverso
4. **Sostenibilità**: Allenamento efficace ma sostenibile nel tempo

---

## 📊 Come Funziona

### 1. Workout Logging

Dopo ogni sessione, l'utente registra:

- **Per ogni esercizio**:
  - Sets completati
  - Reps completati (media se variabile)
  - Peso utilizzato (opzionale)
  - **RPE esercizio** (1-10) ⭐
  - Difficoltà vs baseline (più facile/come previsto/più duro)
  - Note (opzionale)

- **Per la sessione**:
  - Mood (energizzato/normale/stanco/stressato)
  - Qualità sonno (1-10)
  - Note generali

### 2. RPE Analysis

Il sistema analizza gli ultimi **2 workouts** (configurabile):

- **RPE medio sessione** = Media di tutti gli RPE esercizi
- **RPE medio esercizio** = Media RPE per singolo esercizio
- **Trend**: Increasing/Decreasing/Stable

### 3. Auto-Regulation Trigger

**Trigger dopo 2 sessioni se**:

| Condizione | RPE Medio | Azione | Adjustment |
|------------|-----------|--------|------------|
| **Sovrallenamento** | > 8.5 | Riduce volume | -10% sets |
| **Sovrallenamento Critico** | > 9.0 | Deload week | -30% sets + reps basse |
| **Sottovallenamento** | < 6.0 | Aumenta volume | +10% sets |
| **Ottimale** | 7.0 - 8.5 | Nessun adjustment | - |

### 4. Automatic Adjustment

Il sistema modifica automaticamente il programma:

#### Esempio - Volume Decrease (RPE alto)

**PRIMA**:
```
Squat: 5 sets x 3-5 reps @ 85-90%
Bench Press: 4 sets x 3-5 reps @ 85-90%
```

**DOPO (auto-adjusted)**:
```
Squat: 4 sets x 3-5 reps @ 85-90% [Auto-adjusted: RPE troppo alto (8.8/10) - Riduzione volume]
Bench Press: 4 sets x 3-5 reps @ 85-90% [Auto-adjusted: RPE troppo alto (9.1/10) - Riduzione volume]
```

#### Esempio - Deload Week (RPE critico)

**PRIMA**:
```
Squat: 5 sets x 3-5 reps @ 85-90%
```

**DOPO (deload)**:
```
Squat: 3 sets x 3-4 reps @ 85-90% [Auto-adjusted: RPE critico (9.2/10) - Deload necessario]
```

---

## 🗄️ Database Schema

### Tabelle

1. **`workout_logs`**
   - ID workout, user_id, program_id
   - workout_date, day_name, split_type
   - **session_rpe** (auto-calcolato da exercise logs)
   - mood, sleep_quality
   - completed, exercises_completed

2. **`exercise_logs`**
   - ID, workout_log_id
   - exercise_name, pattern
   - sets_completed, reps_completed, weight_used
   - **exercise_rpe** (1-10) ⭐ CORE METRIC
   - difficulty_vs_baseline
   - notes, technique_quality

3. **`program_adjustments`**
   - History adjustments applicati
   - trigger_type, avg_rpe_before
   - adjustment_type, volume_change_percent
   - exercises_affected (JSONB)
   - applied, user_accepted

### Functions (PostgreSQL)

- `get_avg_rpe_last_sessions(user_id, program_id, sessions_count)` → RPE analysis
- `get_exercises_needing_adjustment(user_id, program_id, sessions_count)` → Esercizi fuori range
- `update_session_rpe()` → Trigger che auto-calcola session RPE da exercise logs

---

## 💻 Implementation

### Frontend Components

#### 1. WorkoutLogger.tsx

Modal per logging post-workout:

```tsx
<WorkoutLogger
  open={showLogger}
  onClose={() => setShowLogger(false)}
  userId={user.id}
  programId={activeProgram.id}
  dayName="Day A - Full Body"
  splitType="Full Body 3x"
  exercises={todayWorkout.exercises}
  onWorkoutLogged={() => refreshProgram()}
/>
```

**Features**:
- Form per ogni esercizio (sets/reps/weight/RPE)
- RPE slider 1-10 con labels
- Difficulty selector (easier/as_expected/harder)
- Mood & sleep quality tracking
- Auto-trigger auto-regulation

#### 2. Dashboard Integration

Nel Dashboard, aggiungi:

```tsx
// State
const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
const [todayWorkout, setTodayWorkout] = useState<any>(null);

// Button per aprire logger
<Button onClick={() => {
  setTodayWorkout(getCurrentWorkout());
  setShowWorkoutLogger(true);
}}>
  📝 Registra Workout
</Button>

// Modal
<WorkoutLogger
  open={showWorkoutLogger}
  onClose={() => setShowWorkoutLogger(false)}
  userId={user.id}
  programId={activeProgram.id}
  dayName={todayWorkout?.dayName}
  splitType={activeProgram.split}
  exercises={todayWorkout?.exercises || []}
  onWorkoutLogged={() => {
    // Refresh program (potrebbe essere stato auto-adjusted)
    loadActiveProgram();
  }}
/>
```

### Backend Service

#### autoRegulationService.ts

Funzioni principali:

1. **Workout Logging**:
   ```ts
   createWorkoutLog(userId, programId, dayName, splitType)
   addExerciseLog(workoutLogId, exerciseData)
   completeWorkout(workoutLogId, totalExercises, notes, mood, sleepQuality)
   ```

2. **RPE Analysis**:
   ```ts
   analyzeRPE(userId, programId, sessionsCount)
   // Returns: { avg_session_rpe, avg_exercise_rpe, trend, needs_adjustment, adjustment_type }

   getExercisesNeedingAdjustment(userId, programId, sessionsCount)
   // Returns: Array of exercises with RPE fuori range
   ```

3. **Auto-Regulation**:
   ```ts
   applyAutoRegulation(userId, programId)
   // Analizza RPE → Identifica esercizi → Calcola adjustments → Applica al programma
   // Automatico: modifica direttamente il programma senza chiedere conferma

   applyAdjustmentToProgram(adjustmentId, programId, exercisesAffected)
   // Modifica effettivamente gli exercises nel programma
   ```

4. **History**:
   ```ts
   getRecentWorkouts(userId, limit)
   getWorkoutExercises(workoutLogId)
   getAdjustmentHistory(userId, programId)
   ```

---

## 🧪 Testing

### Test Cases

#### 1. Test Sovrallenamento (RPE alto)

**Setup**:
1. Crea 2 workout logs con RPE medio > 8.5
2. Trigger auto-regulation

**Aspettato**:
- Sistema crea program_adjustment con `adjustment_type: 'decrease_volume'`
- Volume ridotto del 10% (sets arrotondati)
- Toast notifica utente

#### 2. Test Deload Week

**Setup**:
1. Crea 2 workout logs con RPE medio > 9.0
2. Trigger auto-regulation

**Aspettato**:
- Sistema crea adjustment con `adjustment_type: 'deload_week'`
- Volume ridotto del 30%
- Toast avvisa "Deload necessario"

#### 3. Test Sottovallenamento (RPE basso)

**Setup**:
1. Crea 2 workout logs con RPE medio < 6.0
2. Trigger auto-regulation

**Aspettato**:
- Sistema aumenta volume del 10%

#### 4. Test RPE Ottimale

**Setup**:
1. Crea 2 workout logs con RPE medio 7-8
2. Trigger auto-regulation

**Aspettato**:
- Nessun adjustment
- Console log: "RPE nel range ottimale"

### Manual Testing Steps

1. **Esegui migration SQL** in Supabase:
   ```bash
   # Copia contenuto di rpe_autoregulation_migration.sql
   # Incolla in Supabase SQL Editor
   # Esegui
   ```

2. **Verifica tabelle create**:
   ```sql
   SELECT * FROM workout_logs LIMIT 1;
   SELECT * FROM exercise_logs LIMIT 1;
   SELECT * FROM program_adjustments LIMIT 1;
   ```

3. **Testa workout logging**:
   - Apri app, vai a Dashboard
   - Click "Registra Workout"
   - Compila form con RPE > 8.5 per tutti esercizi
   - Salva
   - Verifica database: `SELECT * FROM workout_logs ORDER BY created_at DESC LIMIT 1;`

4. **Testa auto-regulation**:
   - Ripeti step 3 per secondo workout
   - Dopo secondo workout, verifica:
     ```sql
     SELECT * FROM program_adjustments ORDER BY trigger_date DESC LIMIT 1;
     ```
   - Verifica programma modificato:
     ```sql
     SELECT exercises FROM training_programs WHERE id = '<program_id>';
     ```

5. **Verifica UI**:
   - Toast notifica auto-regulation
   - Programma aggiornato nel Dashboard
   - Sets ridotti negli esercizi

---

## 📈 RPE Scale Reference

| RPE | Descrizione | RIR (Reps In Reserve) | Intensità |
|-----|-------------|----------------------|-----------|
| 1-2 | Molto facile | 8+ reps left | Warm-up |
| 3-4 | Facile | 6-7 reps left | Technique work |
| 5-6 | Moderato | 4-5 reps left | Volume work |
| 7 | Impegnativo | 3 reps left | Hypertrophy sweet spot |
| 8 | Molto impegnativo | 2 reps left | Strength training |
| 9 | Quasi massimale | 1 rep left | Heavy day |
| 10 | Massimale | 0 reps left | 1RM test |

**Target RPE Ideale**: **7-8**
- Abbastanza intenso per stimolare adattamenti
- Abbastanza sostenibile per recuperare

---

## 🎯 Best Practices

### Per gli Utenti

1. **Sii Onesto con RPE**: Non sottostimare o sovrastimare
2. **Considera Contesto**: Sonno scarso = RPE più alto è normale
3. **Trust the System**: Se sistema riduce volume, fidati
4. **Long-term View**: 1-2 settimane RPE alto possono capitare

### Per gli Sviluppatori

1. **Logging Accurato**: Assicurati che trigger update_session_rpe funzioni
2. **Error Handling**: Auto-regulation potrebbe fallire, gestisci gracefully
3. **Performance**: Usa indexes per query RPE analysis
4. **Testing**: Testa edge cases (es. 0 workouts logged)

---

## 🚀 Deployment Checklist

- [ ] Esegui `rpe_autoregulation_migration.sql` in Supabase Production
- [ ] Verifica RLS policies attive
- [ ] Testa funzioni PostgreSQL (`get_avg_rpe_last_sessions`, etc.)
- [ ] Verifica trigger `update_session_rpe` funzionante
- [ ] Deploy frontend con WorkoutLogger component
- [ ] Test end-to-end con utente reale
- [ ] Monitor logs per errori auto-regulation
- [ ] Aggiungi dashboard analytics (RPE trends, adjustments count)

---

## 🔮 Future Enhancements

1. **RPE Trends Dashboard**:
   - Chart RPE ultimi 30 giorni
   - Heatmap RPE per esercizio
   - Correlation RPE vs sleep/mood

2. **Smart Deload Timing**:
   - Auto-deload ogni 4-6 settimane anche se RPE ok
   - Preventive deload based on accumulated fatigue

3. **Exercise-Specific Adjustments**:
   - Adjustments solo per esercizi con RPE alto
   - Mantieni volume su esercizi con RPE ottimale

4. **Machine Learning**:
   - Predici RPE futuro basato su trend
   - Suggerisci deload PRIMA che RPE diventi critico

5. **Social Features**:
   - Confronta RPE con altri utenti simili
   - Community average RPE per esercizio

---

## 📚 References

- **RPE Scale**: Borg Scale (1982), modified for resistance training
- **Auto-Regulation**: Mike Tuchscherer's RTS methodology
- **Volume Recommendations**: Mike Israetel (Renaissance Periodization)
- **DUP Programming**: Brad Schoenfeld research on frequency

---

## 🆘 Troubleshooting

### Problema: Session RPE sempre NULL

**Causa**: Trigger `update_session_rpe` non funziona

**Fix**:
```sql
-- Verifica trigger esiste
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_session_rpe';

-- Riesegui creazione trigger
CREATE TRIGGER trigger_update_session_rpe
AFTER INSERT OR UPDATE ON exercise_logs
FOR EACH ROW
EXECUTE FUNCTION update_session_rpe();
```

### Problema: Auto-regulation non parte

**Causa**: Meno di 2 sessioni logged

**Fix**: Verifica count:
```sql
SELECT COUNT(*) FROM workout_logs
WHERE user_id = '<user_id>'
  AND program_id = '<program_id>'
  AND completed = true;
```

### Problema: Adjustments non applicati

**Causa**: `applyAdjustmentToProgram` fallisce

**Fix**: Check logs console, verifica RLS policies, verifica formato JSONB exercises_affected

---

**Sistema creato da**: Claude Code
**Data**: 2025-01-18
**Versione**: 1.0.0
