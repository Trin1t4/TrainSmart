# TRAINSMART — SOUL DOCUMENT

> **Versione**: 2.0 — Febbraio 2026
> **Autore**: Dario (Founder & Developer)
> **Scopo**: Documento fondante. Chiunque tocchi questo codebase deve leggerlo prima.

---

## 1. PERCHÉ ESISTE TRAINSMART

Il 73% delle persone abbandona l'allenamento entro 6 mesi (Sperandei et al., 2016). La causa primaria non è la pigrizia — è il dolore. Le app di fitness esistenti reagiscono al dolore in due modi: lo ignorano o bloccano l'esercizio. Entrambi falliscono.

TrainSmart esiste per risolvere un problema preciso: **le persone smettono di allenarsi perché provano fastidio e non sanno come adattare il workout**. La soluzione non è rimuovere gli esercizi, ma adattarli intelligentemente — riducendo carichi, modificando ROM, sostituendo varianti — mantenendo la struttura della sessione intatta.

### Il Claim Fondamentale

> TrainSmart è l'unica app che **adatta automaticamente il tuo allenamento quando provi fastidio**, offrendoti scelte intelligenti invece di imposizioni.

Ogni decisione tecnica, di design, e di business deve servire questo claim. Se una feature non lo supporta, non la facciamo.

---

## 2. I TRE PILASTRI

### 2.1 PAIN DETECT 2.0

Il differenziatore primario. Nessun competitor (Fitbod, JEFIT, Strong, Hevy) ha un sistema equivalente.

**Come funziona:**

1. L'utente segnala fastidio su una delle **9 zone corporee**: `shoulder`, `elbow`, `wrist`, `upper_back`, `lower_back`, `hip`, `knee`, `ankle`, `neck` (+ `chest` come estensione).
2. L'intensità è riportata su scala **0-10**.
3. Il sistema classifica l'intensità:

| Range | Classificazione | Azione |
|-------|----------------|--------|
| 0 | None | Nessuna |
| 1-3 | Mild | Monitora, continua |
| 4-5 | Moderate | Riduce carico (10-20%), offre opzioni |
| 6-7 | Significant | Riduce carico (30-50%), suggerisce sostituzione |
| 8-10 | Severe | Stop esercizio, referral fisioterapista |

4. Il sistema propone **tre opzioni** all'utente:
   - **Procedi** — continua con monitoraggio
   - **Adatta** — riduce carico/ROM/variante
   - **Salta** — salta l'esercizio

**Filosofia: "Scelta, non imposizione."** Il sistema offre opzioni con spiegazioni. L'utente decide. Mai forzare un cambiamento.

**Flusso dati nel DB:**

```
Segnalazione utente
  → pain_history (log grezzo, persistenza storica)
  → discomfort_tracking (stato corrente per zona, sessioni consecutive)
  → pain_thresholds (per-esercizio: ultimo peso sicuro, sessioni pain-free consecutive ★)
  → exercise_modifications (adattamenti attivi: variante, tempo, peso, riduzione %)
  → pain_logs (dettaglio per-set: peso, reps, ROM%, adattamenti applicati)
```

**Metriche chiave:**
- `consecutive_pain_free_sessions` in `pain_thresholds` — governa la progressione post-infortunio. L'esercizio progredisce SOLO dopo N sessioni senza dolore.
- `needs_physiotherapist_contact` — flag booleano che scatta sopra soglia 8/10. Trigger per referral professionale.
- `load_reduction_active` in `discomfort_tracking` — indica riduzione carico attiva per zona.

**Sostituzione esercizi:**
Il sistema mantiene un grafo di sostituzioni per pattern di movimento (`painDetectSubstitution.ts`). Ogni esercizio ha:
- `involvedAreas` — zone corporee coinvolte
- `alternatives` — esercizi sostitutivi dello stesso pattern
- `reducedROMOption` — variante a ROM ridotto (es. Floor Press per Bench Press)

Se l'area dolorosa non è coinvolta nell'esercizio, il sistema segnala che è probabilmente sicuro continuare. Non genera falsi allarmi.

**Disclaimer obbligatorio:**
> "TrainSmart fornisce suggerimenti basati sulle tue segnalazioni, ma non sostituisce il parere di un professionista sanitario. In caso di dolore persistente o intenso, consulta un medico o fisioterapista."

Questo disclaimer è hardcoded in `PAIN_DETECT_DISCLAIMER` e deve apparire in ogni contesto dove si parla di dolore.

---

### 2.2 AUTO-REGULATION (RPE/RIR)

Il sistema di autoregolazione modifica il volume in base al feedback dell'utente, prevenendo sovrallenamento e sottovallenamento.

**Metriche raccolte per-set (`set_logs`):**
- `reps_completed` — reps effettive
- `weight_used` — peso effettivo in kg
- `rpe` — Rate of Perceived Exertion (1-10)
- `rir` — Reps in Reserve (0-4+)
- `was_adjusted` — se il peso è stato modificato in-sessione

**Metriche aggregate per-esercizio (`exercise_logs`):**
- `exercise_rpe` — RPE medio dell'esercizio
- `difficulty_vs_baseline` — easier / as_expected / harder
- `technique_quality` — excellent / good / fair / poor
- `sets_to_failure` — quanti set portati a cedimento
- `reps_in_reserve` — RIR medio

**Logica di adjustment (`autoRegulationService.ts`):**

| Condizione | Azione | Entità |
|-----------|--------|--------|
| RPE medio > 8.5 per 2+ sessioni | Riduce volume -10% | `program_adjustments` |
| RPE medio > 9.0 per 3+ sessioni | Deload automatico -30% | `program_adjustments` |
| RPE medio < 6.0 per 2+ sessioni | Aumenta volume +10% | `program_adjustments` |
| RIR effettivo < target per 2+ set | Alert di sicurezza | `rir_safety_alerts` |
| Esercizio skippato 3+ sessioni consecutive | Pattern alert | `skip_pattern_alerts` |

**Target RPE ideale: 7-8** (allenamento efficace ma sostenibile).

**Principio critico:** L'adjustment viene **proposto**, non applicato automaticamente. Il campo `user_accepted` in `program_adjustments` traccia la decisione dell'utente. Coerenza con la filosofia "scelta, non imposizione".

**Normalizzazione RPE contestuale:**
Il sistema aggiusta l'RPE percepito per fattori contestuali (stress, sonno, nutrizione, idratazione). Un RPE 9 dopo una notte insonne non ha lo stesso significato di un RPE 9 dopo 8 ore di sonno. Il `context_adjustment` corregge il dato grezzo.

**Adjustment in-sessione (tempo reale):**
- Surplus ≥5 reps rispetto al target → +10% peso automatico, notifica utente
- Surplus 3-4 reps → +5% peso automatico
- Surplus 1-2 reps → monitoraggio, incremento dalla sessione successiva
- RIR effettivo < target → alert di sicurezza, suggerimento riduzione peso

---

### 2.3 DCSS (Dynamic Correspondence of Strength and Skill)

Paradigma metodologico di Paolo Evangelista. Governa come TrainSmart pensa alla tecnica e alla programmazione.

**Principi fondamentali:**

1. **Non esiste una tecnica "perfetta" universale.** La tecnica ottimale dipende dalle proporzioni individuali dell'utente. Un utente con femore lungo avrà uno squat diverso da uno con femore corto. Entrambi sono corretti.

2. **I tessuti si adattano ai carichi progressivi.** La spina non è fragile. La flessione lombare sotto carico non è intrinsecamente pericolosa (Saraceni et al., 2020; Caneiro et al., 2019). Il paradigma McGill della "neutral spine" rigida è superato.

3. **Gerarchia delle correzioni: Sicurezza → Efficienza → Ottimizzazione.** TrainSmart corregge solo se c'è un rischio di infortunio, non per aderire a uno standard estetico.

4. **Variabilità ≠ errore.** I `dcssVariability` nei `technicalExerciseDescriptions` documentano esplicitamente le variazioni accettabili per ogni esercizio, le differenze antropometriche, e i pattern compensatori da distinguere (accettabili vs. rischiosi).

**Impatto sul codice:**
- `technicalExerciseDescriptions.ts` — ogni esercizio ha `dcssVariability.anthropometricFactors` e `dcssVariability.acceptableVariations`
- `DCSSPhilosophySection.tsx` — landing page con confronto approccio tradizionale vs. DCSS
- Il video correction system (MediaPipe + Gemini) valuta la tecnica considerando le variazioni individuali, non uno standard rigido

---

## 3. IL VIAGGIO DELL'UTENTE

### 3.1 Onboarding (90 secondi)

**`SlimOnboarding.tsx`** — 3 step:

| Step | Raccoglie | Validazione |
|------|----------|-------------|
| 1. Chi sei | Nome, età, genere | Nome ≥2 char, 14 ≤ età ≤ 100 |
| 2. Obiettivo | Goal primario (strength/hypertrophy/fat_loss/toning/endurance/wellness/performance/motor_recovery/pregnancy/post_partum/disability) | Selezione obbligatoria |
| 3. Logistica | Frequenza (1-7), durata sessione (30/45/60/90 min), location (home/gym), tipo (bodyweight/equipment/machines), equipment disponibile, aree dolore, tipo screening (light/full) | Frequenza ≥1 |

**Output:** oggetto `onboarding_data` salvato in `user_profiles.onboarding_data` (JSONB) + localStorage come backup.

**Post-onboarding:** navigazione a `/optional-quizzes` → screening biomeccanico (light o full) → generazione programma.

### 3.2 Assessment / Screening

Due percorsi paralleli:

**Screening Light (`ScreeningFlow.tsx`):** 2 test — `lower_push` (squat) + `horizontal_push` (push/bench). Veloce, adatto alla beta.

**Screening Full (`ScreeningFlowFull.tsx`):** 4 test — `lower_push`, `vertical_pull`, `horizontal_push`, `core`. Assessment dettagliato.

Ogni test adatta le varianti alla location:
- **Bodyweight** → `CALISTHENICS_PATTERNS` (es. Bodyweight Squat, Push-up)
- **Gym pesi liberi** → `GYM_PATTERNS_FREEWEIGHTS` (es. Back Squat, Bench Press)
- **Gym macchine** → `GYM_PATTERNS_MACHINES` (es. Leg Press, Chest Press Machine)

**Output:** `pattern_baselines` — mappa `{pattern: {weight10RM, estimatedLevel, variant}}` che alimenta il calcolo dei pesi nel programma.

### 3.3 Generazione Programma

Due generatori paralleli (problema architetturale noto):

**Client-side (`packages/shared/src/utils/programGenerator.ts`):** generatore completo con supporto DUP, superset, pre-exhaustion, finisher metabolici, warm-up dinamici. Produce programmi funzionanti.

**API-side (`api/lib/programGenerator.js`):** generatore legacy che può produrre `weekly_schedule: []` vuoto in certi path. **Da deprecare o allineare.**

**Logica di split:**
- 1 giorno → Full Body
- 2 giorni → Upper/Lower
- 3 giorni → Push/Pull/Legs
- 4 giorni → Upper/Lower 2x
- 5 giorni → PPL + Upper/Lower
- 6 giorni → PPL 2x

**Strategie di progressione (`weeklySplitGenerator.ts`):**

| Livello | Strategia | Meccanismo |
|---------|-----------|------------|
| Beginner | Linear | +2.5% peso/settimana su compound, +1 rep/2 settimane su accessori |
| Intermediate | Double | Prima reps, poi peso quando il range superiore è raggiunto |
| Advanced | Wave | Ondulazione del carico su cicli 3-4 settimane |
| Home/Bodyweight | Variant Progression | Progressione per variante (es. Push-up → Diamond → Archer → One-arm) |

**Deload:** automatico ogni N settimane (default 4, modulabile 3-5 in base a RPE storico). -10% peso, -1 set, stessi esercizi.

### 3.4 Sessione di Allenamento

**`LiveWorkoutSession.tsx`** — l'interfaccia principale durante il workout.

**Funzionalità chiave:**
- Timer rest tra set con countdown visuale
- Input per-set: reps, peso, RPE (1-10), RIR (0-4+)
- Pain Detect integrato: segnalazione fastidio durante la sessione
- Auto-regulation in tempo reale: adjustment peso basato su surplus/deficit reps
- Superset management: esercizi raggruppati senza pausa tra loro
- Progressive save: ogni set salvato in tempo reale su `set_logs` via Supabase
- Session wellness: assessment pre/post workout (sonno, stress, energia, pain areas)
- Readiness score (0-100): calcolato da fattori contestuali, categorizzato in optimal/good/reduced/low

**RIR targeting:**
Il sistema calcola il target RIR per-set con rampa progressiva. Se il target base è RIR 2 per l'ultimo set:
- Set 1 di 4: RIR 4
- Set 2 di 4: RIR 3
- Set 3 di 4: RIR 2-3
- Set 4 di 4: RIR 2 (target)

Questo previene l'esaurimento prematuro sui primi set.

### 3.5 Post-sessione e Ciclo

**Dopo ogni sessione:**
- `workout_logs` → log aggregato sessione
- `exercise_logs` → dettaglio per esercizio
- `set_logs` → dettaglio per set
- Auto-regulation analysis → eventuale `program_adjustments`
- Pain threshold update → trigger `update_pain_threshold_after_session()`
- Skip pattern check → trigger `check_and_create_skip_alert()`

**Fine ciclo (4-8 settimane):**
- Retest opzionale degli stessi pattern dello screening iniziale
- Confronto `pattern_baselines` pre/post
- Generazione nuovo programma con `feedbackContext` dal ciclo precedente
- Il nuovo programma tiene conto di: RPE storico, deload frequency ottimale, aree dolore persistenti

---

## 4. STRUTTURA DATI CANONICA

### 4.1 Il Formato — weekly_split

**Esiste un solo formato accettabile per i programmi.** Tutti e tre i formati storici (`weekly_split`, `weekly_schedule`, `exercises[]`) vengono normalizzati in questo formato dal `programNormalizerUnified.ts`:

```typescript
interface NormalizedProgram {
  id: string;
  user_id: string;
  weekly_split: {
    days: [{
      dayIndex: number;
      dayName: string;          // "Push Day", "Full Body A"
      dayType: 'strength' | 'hypertrophy' | 'endurance' | 'recovery' | 'mixed';
      muscleGroups: string[];
      exercises: [{
        id: string;             // "ex_0_0_squat_1a"
        name: string;
        pattern: string;        // "lower_push", "horizontal_pull", etc.
        sets: number;
        reps: string | number;  // "8-12" o 10
        rest: number;           // secondi
        weight?: string | number;
        tempo?: string;         // "2-0-1-0" (ecc-pause-conc-pause)
        targetRir?: number;
        videoUrl?: string;
        alternatives?: string[];
        warmup?: { sets, reps, percentage, ramp[] };
      }];
      estimatedDuration: number; // minuti
      location: 'gym' | 'home' | 'home_gym';
    }];
    totalDays: number;
    restDays: number[];
    splitName?: string;
  };
  _normalized: true;
  _normalizedAt: string;
  _originalStructure: 'weekly_split' | 'weekly_schedule' | 'exercises' | 'already_normalized';
}
```

**Regola non negoziabile:** qualsiasi codice che legge un programma DEVE passare per `normalizeProgram()`. Mai accedere direttamente a `weekly_schedule` o `exercises[]` senza normalizzazione.

### 4.2 Pattern di Movimento

7 pattern fondamentali che governano la selezione esercizi, il matching dei pesi, e la struttura degli split:

| Pattern | Muscoli Primari | Esempi Gym | Esempi Home |
|---------|----------------|------------|-------------|
| `lower_push` | Quadricipiti, Glutei | Back Squat, Leg Press | Bodyweight Squat, Pistol |
| `lower_pull` | Femorali, Glutei | Stacco Rumeno, Leg Curl | Single Leg RDL, Nordic Curl |
| `horizontal_push` | Petto, Tricipiti | Bench Press, Dumbbell Press | Push-up, Archer Push-up |
| `horizontal_pull` | Dorsali, Bicipiti | Barbell Row, Cable Row | Inverted Row, TRX Row |
| `vertical_push` | Spalle, Tricipiti | Military Press, Arnold Press | Pike Push-up, HSPU |
| `vertical_pull` | Dorsali, Bicipiti | Pull-up, Lat Pulldown | Pull-up, Chin-up |
| `core` | Core | Pallof Press, Cable Crunch | Plank, Dead Bug, Hollow Hold |

---

## 5. DATABASE — ARCHITETTURA

### 5.1 Entità Centrali

**38 tabelle**, 56 funzioni, 120+ RLS policies, 130+ indici.

```
auth.users
  └── user_profiles (primary, 1:1)
  └── users (legacy)
  └── profiles (legacy)

assessments
  └── training_programs ★ (entità centrale)
        ├── workout_logs ★
        │     ├── exercise_logs
        │     ├── set_logs
        │     └── exercise_skips
        ├── exercise_modifications (Pain Detect)
        ├── program_adjustments (Auto-Regulation)
        ├── session_wellness
        ├── rir_safety_alerts
        └── skip_pattern_alerts

Pain System:
  pain_history → discomfort_tracking → pain_thresholds → pain_logs

Teams:
  teams → team_members, team_invites, athlete_checkins

Subscription:
  subscriptions (Stripe) + features + feature_overrides

GDPR:
  user_consents → consent_audit_log, data_export_requests, deletion_requests
```

### 5.2 Views Critiche

| View | Scopo |
|------|-------|
| `exercises_needing_attention` | Esercizi con dolore recente o flag fisioterapista |
| `exercises_ready_for_progression` | Esercizi con N sessioni pain-free consecutive |
| `video_corrections_stats` | Stats analisi video per utente |

### 5.3 Problemi Noti

1. **RLS duplicate** — Più tabelle hanno policy duplicate (pain_thresholds, workout_logs, set_logs, rir_safety_alerts, exercise_modifications). Ogni duplicato aggiunge overhead su ogni query.

2. **Identità utente frammentata** — Tre tabelle parallele: `users`, `profiles`, `user_profiles`. Subscription replicata in tre posti. Sorgente autoritativa: `subscriptions`.

3. **Tre strutture programma** — `weekly_split`, `weekly_schedule`, `exercises[]` coesistono in `training_programs`. `_normalized` flag traccia la migrazione. Il normalizer unifica tutto, ma il debito tecnico rimane nel DB.

---

## 6. PRINCIPI TECNICI NON NEGOZIABILI

### 6.1 I pesi DEVONO essere relativi al bodyweight dell'utente

Mai hardcodare valori assoluti. Il sistema attuale ha un bug noto (BUG-013): lo slim onboarding usa 70kg come peso di default. Questo invalida qualsiasi claim di personalizzazione. I calcoli di 1RM e le percentuali di carico devono usare il peso corporeo effettivo dell'utente o, in mancanza, non fare assunzioni.

### 6.2 Un solo normalizer, un solo formato

`programNormalizerUnified.ts` è l'unico punto di normalizzazione. Qualsiasi accesso a `training_programs` deve passare per `normalizeProgram()`. Non creare nuovi normalizer. Non leggere `weekly_schedule` o `exercises[]` direttamente.

### 6.3 Pain Detect non diagnostica

Il sistema classifica e adatta, non diagnostica. La terminologia è sempre "fastidio/discomfort", mai "dolore/lesione/infortunio" nel contesto dell'adattamento automatico. Il disclaimer medico è obbligatorio. Il referral al fisioterapista scatta sopra soglia 8/10.

### 6.4 Auto-Regulation propone, l'utente decide

Nessun adjustment viene applicato silenziosamente al programma dell'utente. L'adjustment viene creato in `program_adjustments`, l'utente lo vede, e il campo `user_accepted` traccia la decisione dell'utente. Eccezione: adjustment peso in-sessione per surplus reps significativo (≥3 reps), dove l'utente viene notificato in tempo reale.

### 6.5 Assessment-aware, non rule-based

Il generatore di programmi usa i `pattern_baselines` dallo screening per calcolare i pesi iniziali. Non usa regole fisse tipo "beginner = 20kg squat". Se manca il baseline per un pattern, il sistema usa stime conservative basate su livello e bodyweight, mai numeri arbitrari.

### 6.6 Progressive save, mai batch

Ogni set è salvato in tempo reale su `set_logs` durante la sessione. Se l'app crasha, l'utente non perde il lavoro. Il campo `status: 'in_progress'` in `workout_logs` e il partial index corrispondente supportano il recovery di sessioni interrotte.

### 6.7 Nessun dato medico senza consenso GDPR

L'intero sistema pain è gated dal consenso sanitario (`HealthDataConsentModal`). Il campo `user_consents.consents` (JSONB) traccia cosa l'utente ha accettato. L'`consent_audit_log` registra ogni modifica con IP e user agent. Le richieste di cancellazione dati (`deletion_requests`) sono processate con grace period e conferma.

---

## 7. STACK TECNICO

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Animazioni | Framer Motion |
| State Management | React Query (TanStack Query) |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Payments | Stripe + PayPal |
| Video Analysis | MediaPipe + Gemini 1.5 Pro |
| Video Hosting | YouTube (migrato da Supabase Storage per costi) |
| Deployment | Vercel (frontend) + Supabase (backend) |
| PWA | Service Worker + manifest.json |
| i18n | Custom i18n system (`i18n.tsx`) — IT, EN, FR, ES |
| Monorepo | `packages/web` (frontend) + `packages/shared` (business logic) |
| GDPR | Consent management + audit log + data export/deletion |

---

## 8. MODELLO DI BUSINESS

### 8.1 Pricing (Early Bird)

| Tier | Prezzo | Feature principali |
|------|--------|-------------------|
| Base | €12.90/mese | Programma personalizzato, Pain Detect, Auto-Regulation |
| Premium | €24.90/mese | + Video analysis (N corr/mese), report avanzati |
| Elite | €39.90/mese | + Coach virtuale, priorità supporto |

Dopo 6 mesi il prezzo aumenta di €10/mese. Ciclo di abbonamento basato sulla durata del programma (6-12 settimane).

### 8.2 Break-even

Break-even tecnico a **13 utenti paganti** (costi infrastruttura: Supabase, Vercel, dominio).

### 8.3 Piani futuri

- **B2B Corporate Wellness** — targeting HR con messaging ROI su riduzione assenteismo
- **App store** — Capacitor per iOS/Android. Google Play first per validare, poi iOS (15-30% commissione Apple IAP)
- **Verticali specializzati** — Over 60 con dolore cronico, partnership fisioterapia

---

## 9. TARGET

**Utente primario:** 25-45 anni, si allena 2-5 volte a settimana, ha provato altre app ma ha abbandonato per dolore/fastidio o mancanza di adattamento. Non ha competenze biomeccaniche avanzate. Vuole allenarsi in modo intelligente senza dover pensare troppo.

**Utente secondario:** Coach/preparatori atletici che gestiscono team (modulo Team con `teams`, `team_members`, `athlete_checkins`).

**Non è per:** atleti agonisti che hanno già un preparatore, persone con patologie acute che necessitano riabilitazione medica.

---

## 10. GLOSSARIO

| Termine | Significato |
|---------|------------|
| **RPE** | Rate of Perceived Exertion (1-10). Quanto è stato duro il set soggettivamente. |
| **RIR** | Reps in Reserve. Quante reps potevi ancora fare. RIR 0 = cedimento. |
| **DUP** | Daily Undulating Periodization. Variazione del carico giorno per giorno. |
| **DCSS** | Dynamic Correspondence of Strength and Skill. Paradigma Evangelista. |
| **Pattern** | Categoria di movimento (lower_push, horizontal_pull, etc.). |
| **Baseline** | Prestazione di riferimento misurata nello screening. |
| **Deload** | Settimana a carico ridotto per facilitare il recupero. |
| **Split** | Divisione settimanale dell'allenamento (Full Body, PPL, Upper/Lower). |
| **Pain Detect** | Sistema proprietario di rilevazione e adattamento al fastidio. |
| **Normalizer** | Funzione che converte qualsiasi formato programma nel formato canonico. |
| **Progressive Save** | Salvataggio in tempo reale di ogni set durante la sessione. |
| **Readiness Score** | Punteggio 0-100 di prontezza pre-sessione basato su sonno, stress, energia. |
| **AdaptFlow** | Sistema di adattamento esercizi per cambio location (gym ↔ home). |

---

## 11. FILE CRITICI — MAPPA

| File | Ruolo | Tocca con cura |
|------|-------|---------------|
| `packages/shared/src/utils/programNormalizerUnified.ts` | Normalizer unico dei programmi | ⚠️ Critico |
| `packages/shared/src/utils/programGenerator.ts` | Generatore client-side programmi | ⚠️ Critico |
| `packages/shared/src/utils/weeklySplitGenerator.ts` | Split settimanale + progressione | ⚠️ Critico |
| `packages/shared/src/utils/painDetect/` | Modulo Pain Detect 2.0 completo | ⚠️ Critico |
| `packages/shared/src/lib/autoRegulationService.ts` | Auto-regulation RPE/RIR | ⚠️ Critico |
| `packages/web/src/components/LiveWorkoutSession.tsx` | UI sessione workout | Complesso |
| `packages/web/src/pages/SlimOnboarding.tsx` | Onboarding 90 secondi | |
| `packages/web/src/components/ScreeningFlow.tsx` | Screening light (2 test) | |
| `packages/web/src/components/ScreeningFlowFull.tsx` | Screening full (4 test) | |
| `packages/web/src/lib/painManagementService.ts` | Bridge Pain Detect → Supabase | |
| `packages/web/src/utils/technicalExerciseDescriptions.ts` | Tassonomia DCSS esercizi | |
| `api/lib/programGenerator.js` | Generatore API-side (legacy) | ⚠️ Da deprecare |
| `api/lib/exerciseDatabase.js` | Database esercizi completo | |
| `api/lib/exerciseSubstitutions.js` | Sostituzioni esercizi | |

---

## 12. COSA NON È TRAINSMART

- **Non è un'app di tracking generico.** Non è Strong o Hevy. Il valore è nell'adattamento intelligente, non nel contare i set.
- **Non è un sostituto medico.** Non diagnostica, non prescrive, non tratta. Adatta e suggerisce.
- **Non è un'app di "AI fitness".** Non usiamo la parola "AI" nel marketing a meno che non ci sia un modello che fa qualcosa di misurabile. Le regole Pain Detect sono regole, non AI. Il video analysis usa Gemini — quello sì.
- **Non è per tutti.** È per chi ha provato ad allenarsi e ha smesso perché faceva male o perché l'app non si adattava. Se vuoi solo un timer e un log, ci sono app migliori.

---

*Ultimo aggiornamento: Febbraio 2026*
*Questo documento è la verità. Se il codice non lo riflette, è il codice ad essere sbagliato.*
