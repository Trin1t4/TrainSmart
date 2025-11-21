# 🩹 Pain Tracking System - Migration Guide

Sistema pain tracking completo è pronto per il deployment su Supabase.

---

## ✅ COMPONENTI GIÀ IMPLEMENTATI

### 1. **Database Schema**
- File: `supabase_pain_tracking.sql`
- Tabelle: `pain_logs`, `pain_thresholds`
- Trigger automatici per aggiornamento soglie
- RLS policies per sicurezza
- Views per dashboard

### 2. **Service Layer**
- File: `packages/web/src/lib/painManagementService.ts`
- Metodi: logPain, getPainThreshold, suggestAdaptation, suggestProgression
- Multi-session detection per hybrid recovery

### 3. **Frontend Integration**
- File: `packages/web/src/components/LiveWorkoutSession.tsx`
- Pain tracking UI (slider 0-10)
- Adattamento automatico real-time
- Hybrid recovery modal

### 4. **Hybrid Recovery Modal**
- File: `packages/web/src/components/HybridRecoveryModal.tsx`
- 3-step flow (confirm → select area → summary)
- 8 body areas mappate
- Exercise identification automatico

---

## 🚀 DEPLOYMENT STEP-BY-STEP

### STEP 1: Backup Database (IMPORTANTE!)

Prima di eseguire qualsiasi migration, fai backup:

1. Vai su **Supabase Dashboard**
2. Seleziona il tuo progetto
3. Vai su **Database** > **Backups**
4. Click **Create backup**
5. Aspetta conferma backup completato

### STEP 2: Eseguire Migration SQL

**Opzione A: SQL Editor (Consigliata)**

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Click **New query**
3. Copia TUTTO il contenuto di `supabase_pain_tracking.sql`
4. Incolla nell'editor
5. Click **Run** (o Ctrl+Enter)
6. Aspetta conferma: "Success. No rows returned"

**Opzione B: CLI (Avanzata)**

```bash
# Se hai Supabase CLI installato
supabase db push

# O direttamente via psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" -f supabase_pain_tracking.sql
```

### STEP 3: Verificare Creazione Tabelle

Dopo l'esecuzione, verifica che le tabelle siano state create:

```sql
-- Controlla tabelle create
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pain_logs', 'pain_thresholds');

-- Dovrebbe ritornare:
-- pain_logs
-- pain_thresholds
```

### STEP 4: Verificare Trigger

Controlla che il trigger automatico sia attivo:

```sql
-- Controlla trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_pain_threshold';

-- Dovrebbe ritornare:
-- trigger_update_pain_threshold | INSERT | pain_logs
```

### STEP 5: Verificare RLS Policies

Controlla che le RLS policies siano attive:

```sql
-- Controlla RLS attivo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pain_logs', 'pain_thresholds');

-- Dovrebbe ritornare rowsecurity = true per entrambe

-- Controlla policies create
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('pain_logs', 'pain_thresholds');

-- Dovrebbe ritornare 6 policies (3 per tabella)
```

### STEP 6: Test Inserimento

Testa che il sistema funzioni:

```sql
-- Test insert (sostituisci USER_ID con tuo user_id reale)
INSERT INTO pain_logs (
  user_id,
  exercise_name,
  set_number,
  reps_completed,
  pain_level,
  weight_used
) VALUES (
  'YOUR_USER_ID_HERE', -- Sostituisci con UUID reale
  'Test Squat',
  1,
  10,
  5,
  60
);

-- Verifica inserimento
SELECT * FROM pain_logs WHERE exercise_name = 'Test Squat';

-- Verifica trigger (dovrebbe aver creato pain_threshold)
SELECT * FROM pain_thresholds WHERE exercise_name = 'Test Squat';

-- Cleanup test
DELETE FROM pain_logs WHERE exercise_name = 'Test Squat';
DELETE FROM pain_thresholds WHERE exercise_name = 'Test Squat';
```

---

## 🔍 TROUBLESHOOTING

### Errore: "relation already exists"

**Causa**: Le tabelle esistono già (migration già eseguita).

**Soluzione**:
```sql
-- Verifica esistenza
SELECT * FROM pain_logs LIMIT 1;
SELECT * FROM pain_thresholds LIMIT 1;

-- Se esistono e funzionano, la migration è già stata fatta
```

### Errore: "permission denied"

**Causa**: User non ha permessi di creazione tabelle.

**Soluzione**:
- Usa l'utente **postgres** (default su Supabase)
- Vai su **Settings** > **Database** > copia connection string con password

### Errore: "function log10 does not exist"

**Causa**: PostgreSQL < 9.0 (raro su Supabase).

**Soluzione**:
```sql
-- Aggiungi questa funzione prima della migration
CREATE OR REPLACE FUNCTION log10(numeric)
RETURNS numeric AS $$
  SELECT log(10, $1);
$$ LANGUAGE SQL IMMUTABLE;
```

### Trigger non funziona

**Verifica**:
```sql
-- Test manuale trigger
SELECT update_pain_threshold_after_session();

-- Se errore, controlla log
SELECT * FROM pg_stat_activity WHERE query LIKE '%pain%';
```

---

## 📊 MONITORING POST-MIGRATION

Dopo deployment, monitora che tutto funzioni:

### Query Utili

```sql
-- Totale pain logs per utente
SELECT user_id, COUNT(*) as total_logs
FROM pain_logs
GROUP BY user_id
ORDER BY total_logs DESC;

-- Esercizi con dolore alto (≥7)
SELECT user_id, exercise_name, MAX(pain_level) as max_pain
FROM pain_logs
WHERE pain_level >= 7
GROUP BY user_id, exercise_name;

-- Utenti con thresholds attivi
SELECT user_id, COUNT(*) as exercises_tracked
FROM pain_thresholds
GROUP BY user_id;

-- Esercizi che necessitano attenzione
SELECT * FROM exercises_needing_attention;

-- Esercizi ready for progression
SELECT * FROM exercises_ready_for_progression;
```

### Performance Check

```sql
-- Verifica indici creati
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('pain_logs', 'pain_thresholds');

-- Dovrebbe mostrare:
-- idx_pain_logs_user_exercise
-- idx_pain_logs_session_date
-- idx_pain_logs_pain_level
-- idx_pain_thresholds_user
-- idx_pain_thresholds_needs_contact
```

---

## 🧪 TESTING FRONTEND

Dopo migration, testa il sistema completo:

### 1. Test Pain Logging

1. Avvia app (`npm run dev`)
2. Login come utente test
3. Vai su **Dashboard** > **Start Workout**
4. Completa un set
5. Nel modal RPE, imposta dolore = 5/10
6. Click **Submit**
7. **Verifica**:
   - Console log: "🩹 Pain logged: [Exercise] - Level 5/10"
   - Nessun errore console
   - Toast warning appare

### 2. Test Adaptation

1. Ripeti set con dolore 5/10
2. Ripeti ancora (3° set con dolore)
3. **Verifica**:
   - Sistema riduce peso automaticamente
   - Console log: "🩹 Pain adaptation suggested"
   - Toast mostra suggerimento

### 3. Test Hybrid Recovery

1. Completa 2 workout con dolore persistente 4-6/10 su stesso esercizio
2. Al 3° workout, imposta dolore 5/10
3. **Verifica**:
   - Modal hybrid recovery appare
   - Selezione body area funziona
   - Lista esercizi coinvolti corretta

### 4. Test Pain Thresholds

1. Completa workout con dolore 0-3/10
2. Riapri workout
3. **Verifica**:
   - Console log: "🩹 Pain threshold found for [Exercise]"
   - Toast con peso sicuro suggerito (se applicabile)

---

## 📋 CHECKLIST DEPLOYMENT

Prima di considerare il deployment completo, verifica:

- [ ] Backup database creato
- [ ] Migration SQL eseguita senza errori
- [ ] Tabelle `pain_logs` e `pain_thresholds` esistono
- [ ] Trigger `trigger_update_pain_threshold` attivo
- [ ] RLS policies attive su entrambe le tabelle
- [ ] Test insert funziona
- [ ] Trigger aggiorna `pain_thresholds` correttamente
- [ ] Views `exercises_needing_attention` e `exercises_ready_for_progression` esistono
- [ ] Frontend pain tracking funziona (no errori console)
- [ ] Adaptation suggestions appaiono correttamente
- [ ] Hybrid recovery modal si attiva dopo 2+ sessioni

---

## 🔐 SECURITY CHECKLIST

- [ ] RLS abilitato su `pain_logs`
- [ ] RLS abilitato su `pain_thresholds`
- [ ] Policy "Users can view their own pain logs" attiva
- [ ] Policy "Users can insert their own pain logs" attiva
- [ ] Policy "Users can update their own pain logs" attiva
- [ ] Policy "Users can view their own pain thresholds" attiva
- [ ] Policy "Users can insert their own pain thresholds" attiva
- [ ] Policy "Users can update their own pain thresholds" attiva
- [ ] Test: user A NON può vedere pain logs di user B

---

## 🚨 ROLLBACK (In Caso di Problemi)

Se qualcosa va storto, puoi fare rollback:

```sql
-- ATTENZIONE: Questo cancellerà TUTTI i dati pain tracking!

-- 1. Drop views
DROP VIEW IF EXISTS exercises_needing_attention CASCADE;
DROP VIEW IF EXISTS exercises_ready_for_progression CASCADE;

-- 2. Drop triggers
DROP TRIGGER IF EXISTS trigger_update_pain_threshold ON pain_logs;

-- 3. Drop functions
DROP FUNCTION IF EXISTS update_pain_threshold_after_session();

-- 4. Drop tables (IN QUESTO ORDINE!)
DROP TABLE IF EXISTS pain_logs CASCADE;
DROP TABLE IF EXISTS pain_thresholds CASCADE;

-- 5. Restore dal backup creato in STEP 1
```

---

## 📞 SUPPORT

Se riscontri problemi durante la migration:

1. Controlla **Supabase Logs**: Dashboard > Logs > Postgres Logs
2. Verifica errori SQL in **SQL Editor** > History
3. Controlla **Browser Console** per errori frontend
4. Test con `psql` direttamente (se hai accesso)

---

## 📝 POST-DEPLOYMENT NOTES

Una volta deployato, documenta:

- Data deployment: _______________
- User che ha eseguito migration: _______________
- Eventuali errori riscontrati: _______________
- Numero pain_logs esistenti prima migration: _______________
- Numero pain_logs dopo primo test: _______________

---

**Migration pronta per essere eseguita!** 🚀

Segui gli step sopra nell'ordine. In caso di dubbi, fai prima un test su progetto Supabase di staging/development.
