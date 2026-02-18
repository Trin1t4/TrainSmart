# 🚀 MIGRATION INSTRUCTIONS - Mesocycle Tracking

## ✅ CODICE DEPLOYATO

Commit: `acf99ee`  
Branch: `main`  
Status: **Pushed to GitHub** ✓

Vercel auto-deploy in corso: https://vercel.com/trin1t4s-projects/train-smart

---

## 📋 DATABASE MIGRATION DA APPLICARE

**⚠️ AZIONE RICHIESTA:** Applica questa migration SQL manualmente su Supabase

### Opzione 1: Supabase Dashboard (RACCOMANDATO)

1. Vai su: https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/sql/new
2. Copia-incolla il contenuto di `supabase/migrations/20260218_mesocycle_tracking.sql`
3. Clicca "Run" per eseguire la migration
4. Verifica che sia eseguita con successo (✓ Success)

### Opzione 2: CLI Locale (SE HAI SUPABASE CLI)

```bash
cd /path/to/TrainSmart
supabase db push
```

---

## 📝 COSA FA LA MIGRATION

Aggiunge 2 colonne alla tabella `volume_profiles`:

- **`mesocycle_number`** (INT, default 1): Traccia il numero di mesociclo corrente
- **`mesocycle_start_date`** (TIMESTAMPTZ, default NOW): Data inizio mesociclo

### Logica Progressive Tissue Adaptation:
- **Mesocicli 1-3**: Volume cappato a MAV (adattamento tessuti connettivi)
- **Mesocicli 4+**: Esplorazione range MAV-MRV

### Evidence Base:
- Muscoli: 6-8 settimane adattamento
- Tendini/legamenti: 12-16 settimane  
- Osso: 16-20 settimane

---

## 🔍 VERIFICA MIGRATION

Dopo aver applicato la migration, verifica con questa query:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'volume_profiles'
AND column_name IN ('mesocycle_number', 'mesocycle_start_date');
```

Output atteso:
```
column_name           | data_type                   | column_default
----------------------|-----------------------------|-----------------
mesocycle_number      | integer                     | 1
mesocycle_start_date  | timestamp with time zone    | now()
```

---

## ✅ CHECKLIST DEPLOYMENT COMPLETO

- [x] Codice pushato su GitHub (`main`)
- [x] Vercel auto-deploy triggered
- [ ] Migration SQL applicata su Supabase ← **TU DEVI FARE QUESTO**
- [ ] Verifica funzionamento su https://train-smart-ten.vercel.app

---

## 🐛 TROUBLESHOOTING

**Se la migration fallisce:**
- Controlla che la tabella `volume_profiles` esista
- Verifica che non esistano già le colonne (`IF NOT EXISTS` dovrebbe gestire questo)
- Se errore di permessi, usa Service Role key nel Supabase Dashboard

**Se il deploy Vercel fallisce:**
- Controlla build logs: https://vercel.com/trin1t4s-projects/train-smart/deployments
- Le correzioni TypeScript sono backward-compatible, non dovrebbero causare errori build

---

## 📊 TESTING DELLA NUOVA LOGICA

Dopo il deployment:

1. **Principiante Heavy Day Forza:**
   - Verifica che venga assegnato **3 serie** (non 4)
   
2. **Ipertrofia Range Reps:**
   - Beginner: 10-15 reps
   - Intermediate: 8-12 reps
   - Advanced: 6-12 reps

3. **Mesocycle Progression:**
   - Genera programma 1: volume = MEV + 30%
   - Completa 3 mesocicli con RPE < 7.5
   - Genera programma 4: volume dovrebbe aumentare di +2 set (se RPE basso)

---

## 📚 RIFERIMENTI

- Commit completo: https://github.com/Trin1t4/TrainSmart/commit/acf99ee
- Migration file: `supabase/migrations/20260218_mesocycle_tracking.sql`
- Helms et al. (2018): Volume per principianti
- Schoenfeld et al. (2017): Range reps ipertrofia
- Israetel/RP: MEV/MAV/MRV guidelines
