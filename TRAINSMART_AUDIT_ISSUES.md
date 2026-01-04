# 🔍 TrainSmart - Audit Tecnico & Issue Tracking

**Data Audit:** Gennaio 2026
**Versione App:** Beta
**Auditor:** Claude (AI Assistant)

---

## ✅ FIX APPLICATI (4 Gennaio 2026)

| Issue | Stato | Descrizione Fix |
|-------|-------|-----------------|
| ISSUE-001 | ✅ RISOLTO | Creato `programNormalizer.ts` - utility centralizzata per gestione formati |
| ISSUE-002 | ✅ RISOLTO | Unificato client Supabase: corretto path errato in useUser.ts, standardizzato named export |
| ISSUE-004 | ✅ RISOLTO | Integrato `exerciseSubstitutionEngine` in `adaptToPain()` con mappatura area→movimenti |
| ISSUE-006 | ✅ RISOLTO | Rimosso retry loop auth in Onboarding, ora usa `useAuth` hook |
| ISSUE-009 | ✅ RISOLTO | Creato `caseConverter.ts` con utility snake_case ↔ camelCase |

### File Modificati:
- `packages/shared/src/utils/programNormalizer.ts` (NUOVO)
- `packages/shared/src/utils/caseConverter.ts` (NUOVO)
- `packages/shared/src/utils/programGenerator.ts` (integrato substitution engine)
- `packages/web/src/hooks/useUser.ts` (fix import path)
- `packages/web/src/hooks/useAuth.ts` (standardizzato import)
- `packages/web/src/pages/Login.tsx` (standardizzato import)
- `packages/web/src/pages/Onboarding.tsx` (rimosso retry, usa useAuth)
- `packages/web/src/lib/supabaseClient.ts` (rimosso default export)
- `packages/teamflow/src/*` (stesse fix applicate)

---

## 📊 Riepilogo Esecutivo (Aggiornato)

| Severità | Conteggio | Risolti | Descrizione |
|----------|-----------|---------|-------------|
| 🔴 Critico | 3 | 2 | ISSUE-002 ✅, ISSUE-001 ✅ (parziale), ISSUE-003 pending |
| 🟠 Alto | 4 | 2 | ISSUE-004 ✅, ISSUE-006 ✅, ISSUE-005/007 pending |
| 🟡 Medio | 4 | 1 | ISSUE-009 ✅, altri pending |
| 🟢 Basso | 2 | 0 | Nice-to-have / ottimizzazioni |

---

## 🔴 CRITICITÀ P0 - DA RISOLVERE IMMEDIATAMENTE

### ISSUE-001: Struttura Programma Inconsistente (3 formati)

**Severità:** 🔴 Critico  
**Componenti Affetti:** `LiveWorkoutSession.tsx`, `programService.ts`, `Dashboard.tsx`  
**Impatto:** Bug nel salvataggio pesi, sessioni non persistite correttamente

#### Descrizione
Il sistema gestisce i programmi in **tre formati diversi**, causando codice difensivo e bug imprevedibili:

```typescript
// Formato 1: weekly_schedule (legacy/team)
program.weekly_schedule[].exercises[]

// Formato 2: weekly_split.days (main app)
program.weekly_split.days[].exercises[]

// Formato 3: exercises[] (flat structure)
program.exercises[]
```

#### Evidenza nel Codice
```typescript
// LiveWorkoutSession.tsx - linee ~150-200
if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) { ... }
if (!updated && program.weekly_split?.days && Array.isArray(program.weekly_split.days)) { ... }
if (!updated && program.exercises && Array.isArray(program.exercises)) { ... }
```

#### Soluzione Proposta
1. Definire UN SOLO formato canonico: `weekly_split.days[].exercises[]`
2. Creare migration script per convertire dati esistenti
3. Aggiungere validation layer che rifiuta formati legacy
4. Deprecare `weekly_schedule` e `exercises[]` flat

#### File da Modificare
- [ ] `packages/shared/src/types/program.types.ts` - rimuovere tipi legacy
- [ ] `packages/web/src/components/LiveWorkoutSession.tsx` - rimuovere branch legacy
- [ ] `packages/shared/src/utils/programGenerator.ts` - output solo formato canonico
- [ ] `packages/shared/src/lib/programService.ts` - validation su insert/update

---

### ISSUE-002: Client Supabase Multipli

**Severità:** 🔴 Critico  
**Componenti Affetti:** Tutti i file che usano Supabase  
**Impatto:** Race condition su auth, sessioni non sincronizzate

#### Descrizione
Esistono **almeno 3 import diversi** per il client Supabase:

```typescript
// Pattern 1
import { supabase } from '../lib/supabaseClient';

// Pattern 2  
import supabase from '../lib/supabaseClient';

// Pattern 3
import { supabase } from '../lib/supabase';
```

Questo suggerisce l'esistenza di file diversi (`supabaseClient.ts` vs `supabase.ts`) o export inconsistenti.

#### Evidenza nel Codice
- `useUser.ts` → `import { supabase } from '../lib/supabase'`
- `Login.tsx` → `import supabase from '../lib/supabaseClient'`
- `Dashboard.tsx` → `import { supabase } from '../lib/supabaseClient'`

#### Soluzione Proposta
1. Verificare se esistono 2 file separati e unificarli
2. Standardizzare su export named: `export { supabase }`
3. Grep & replace su tutto il codebase
4. Aggiungere ESLint rule per prevenire import errati

#### File da Modificare
- [ ] Unificare in `packages/web/src/lib/supabase.ts` (singolo file)
- [ ] Find & Replace su tutti i componenti
- [ ] Rimuovere `supabaseClient.ts` se duplicato

---

### ISSUE-003: Sincronizzazione localStorage/Supabase Fragile

**Severità:** 🔴 Critico  
**Componenti Affetti:** Onboarding, Screening, Dashboard  
**Impatto:** Perdita dati utente, programmi non generabili

#### Descrizione
I dati critici (onboarding, screening, quiz) sono salvati in **entrambi** localStorage e Supabase, ma:
- Non c'è sincronizzazione bidirezionale affidabile
- Se localStorage viene svuotato, l'app non recupera da Supabase
- Se Supabase fallisce, localStorage non viene usato come fallback consistente

#### Evidenza nel Codice
```typescript
// Dashboard.tsx - loadData()
const onboarding = localStorage.getItem('onboarding_data');
// ... solo dopo tenta Supabase se localStorage è vuoto
```

```typescript
// Onboarding.tsx - salva in entrambi ma non atomicamente
localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
await supabase.from('user_profiles').upsert({ ... });
```

#### Soluzione Proposta
1. **Definire Source of Truth:** Supabase è master, localStorage è cache
2. **Startup Sync:** All'avvio, sempre fetch da Supabase → popola localStorage
3. **Write-through Cache:** Ogni write va a Supabase, poi localStorage
4. **Offline Queue:** Se offline, queue writes e sync quando online
5. Usare `dataSync.ts` che esiste ma non è integrato

#### File da Modificare
- [ ] `packages/shared/src/utils/dataSync.ts` - completare implementazione
- [ ] `packages/web/src/pages/Dashboard.tsx` - usare dataSync
- [ ] `packages/web/src/pages/Onboarding.tsx` - usare dataSync
- [ ] Creare `useSyncedStorage()` hook

---

## 🟠 CRITICITÀ P1 - ALTA PRIORITÀ

### ISSUE-004: Pain Detect - Due Sistemi Paralleli

**Severità:** 🟠 Alto  
**Componenti Affetti:** `programGenerator.ts`, `exerciseSubstitutionEngine.ts`  
**Impatto:** Sostituzioni esercizi inconsistenti, logica sofisticata non utilizzata

#### Descrizione
Esistono **due sistemi di gestione dolore** che non comunicano:

**Sistema 1 (Semplificato)** - `programGenerator.ts`:
```typescript
const painContraindications: Record<string, string[]> = {
  'shoulder': ['panca', 'press', 'lateral raise', 'dips', 'push-up', 'pull-up'],
  'knee': ['squat', 'leg press', 'leg curl', 'leg extension', 'lunge', 'jump'],
  // ... keyword matching
};
```

**Sistema 2 (Sofisticato)** - `exerciseSubstitutionEngine.ts`:
```typescript
// Analisi anatomica dei movimenti
// Matching su contraindicated_if_pain_in
// Score di similarità per sostituzioni
// Modifiche ROM/load/tempo
```

Il Sistema 2 è più accurato ma il Sistema 1 viene usato nella generazione programmi.

#### Soluzione Proposta
1. Deprecare il Sistema 1 (keyword matching)
2. Integrare `findSafeSubstitutions()` nel generator
3. Aggiungere confidence score alle sostituzioni
4. Log delle sostituzioni per debugging

#### File da Modificare
- [ ] `packages/shared/src/utils/programGenerator.ts` - rimuovere `adaptToPain()` semplificato
- [ ] Integrare `exerciseSubstitutionEngine.ts` nel flow di generazione
- [ ] Aggiungere campo `substitutionConfidence` al tipo Exercise

---

### ISSUE-005: State Management Frammentato

**Severità:** 🟠 Alto  
**Componenti Affetti:** Tutti  
**Impatto:** State desync, bug difficili da debuggare

#### Descrizione
L'app usa **tre sistemi di state** senza coordinazione:

| Sistema | Uso | Dati |
|---------|-----|------|
| Zustand (`useAppStore`) | Global state | userId, onboardingData, betaOverrides |
| React Query | Server state | programs, user profile |
| localStorage | Persistence | Tutto duplicato |

Problema: `userId` esiste in:
- `useAppStore.userId`
- `useCurrentUser().data?.id`
- `localStorage.tempUserId`

#### Soluzione Proposta
1. **Zustand** → solo UI state (sidebar, modals, theme)
2. **React Query** → TUTTI i dati server (user, programs, etc.)
3. **localStorage** → solo cache di React Query
4. Rimuovere `userId` da Zustand, usare solo `useCurrentUser()`

#### File da Modificare
- [ ] `packages/web/src/store/useAppStore.ts` - rimuovere userId, onboardingData
- [ ] Tutti i componenti che usano `useAppStore().userId` → `useCurrentUser()`
- [ ] Configurare React Query persistence

---

### ISSUE-006: Authentication Race Condition

**Severità:** 🟠 Alto  
**Componenti Affetti:** `Onboarding.tsx`, `Login.tsx`  
**Impatto:** Utenti bloccati, errori "not authenticated"

#### Descrizione
Il codice contiene retry loops che indicano timing issues:

```typescript
// Onboarding.tsx
while (!user && attempts < maxAttempts) {
  attempts++;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  // ...
}
```

Questo workaround nasconde un problema architetturale: la sessione Supabase non è pronta quando serve.

#### Soluzione Proposta
1. Usare `onAuthStateChange` listener globale
2. Non permettere navigazione a route protette finché auth non è resolved
3. Rimuovere retry loops, usare loading state appropriato
4. Centralizzare auth check in `ProtectedRoute.tsx`

#### File da Modificare
- [ ] `packages/web/src/components/ProtectedRoute.tsx` - attendere auth resolution
- [ ] `packages/web/src/pages/Onboarding.tsx` - rimuovere retry loop
- [ ] Creare `AuthProvider` context

---

### ISSUE-007: Assessment Data Non Sfruttati al 100%

**Severità:** 🟠 Alto  
**Componenti Affetti:** `programGenerator.ts`, `weeklySplitGenerator.ts`  
**Impatto:** Programmi generici invece che personalizzati

#### Descrizione
Lo screening raccoglie dati dettagliati per pattern:

```typescript
patternBaselines: {
  lower_push: { difficulty: 7, reps: 12, weight10RM: 80 },
  vertical_pull: { difficulty: 4, reps: 6 },
  // ...
}
```

Ma la generazione programma spesso usa solo il `level` globale:

```typescript
const userLevel = fitnessLevelOverride || screening.level;
// Poi usa userLevel per TUTTI gli esercizi
```

Un utente con pull-up forti ma squat deboli riceve lo stesso livello per entrambi.

#### Soluzione Proposta
1. Passare `patternBaselines` al generator
2. Selezionare variante esercizio per pattern, non globale
3. Calcolare volume/intensità per pattern
4. Mostrare all'utente perché ha ricevuto certe varianti

#### File da Modificare
- [ ] `packages/shared/src/utils/programGenerator.ts` - usare baselines per pattern
- [ ] `packages/shared/src/utils/weeklySplitGenerator.ts` - idem
- [ ] UI Dashboard - mostrare "perché questo esercizio"

---

## 🟡 CRITICITÀ P2 - MEDIA PRIORITÀ

### ISSUE-008: Branding/Design System Non Documentato

**Severità:** 🟡 Medio  
**Componenti Affetti:** Tutti i componenti UI  
**Impatto:** Inconsistenze visive, difficoltà per nuovi sviluppatori

#### Descrizione
L'app usa principalmente emerald come colore primario, ma senza documentazione:

- **Emerald** (`emerald-500`) → Azioni principali, successo
- **Cyan** (`cyan-500`) → Goal secondari (usato in GoalStep)
- **Amber** (`amber-500`) → Warning, screening alternativo
- **Blue** (`blue-500`) → Beta features, info
- **Red** (`red-500`) → Errori, pain areas

Non esiste un file di design tokens o documentazione.

#### Soluzione Proposta
1. Creare `DESIGN_SYSTEM.md` con tutti i colori e usi
2. Creare file `tailwind.config.js` con semantic colors
3. Usare CSS variables per temi

#### File da Creare
- [ ] `docs/DESIGN_SYSTEM.md`
- [ ] Estendere `tailwind.config.js` con semantic tokens

---

### ISSUE-009: Naming Convention Mista (snake_case vs camelCase)

**Severità:** 🟡 Medio  
**Componenti Affetti:** Tutti i file che interagiscono con Supabase  
**Impatto:** Bug sottili, cognitive load per sviluppatori

#### Descrizione
- **Supabase/Database:** `snake_case` → `training_programs`, `weekly_split`, `pain_areas`
- **TypeScript:** `camelCase` → `trainingPrograms`, `weeklySplit`, `painAreas`

La conversione avviene manualmente in vari punti senza un mapper centralizzato.

#### Soluzione Proposta
1. Creare utility `snakeToCamel()` e `camelToSnake()`
2. Applicare automaticamente su ogni fetch/insert
3. TypeScript types sempre in camelCase
4. Supabase types generati con transformer

#### File da Creare/Modificare
- [ ] `packages/shared/src/utils/caseConverter.ts`
- [ ] Wrapper per Supabase client con auto-conversion

---

### ISSUE-010: PWA Offline Non Funzionante

**Severità:** 🟡 Medio  
**Componenti Affetti:** Service Worker, Workout Session  
**Impatto:** Dati persi se utente va offline durante workout

#### Descrizione
L'app ha componenti PWA (`InstallPWA.tsx`) ma:
- Service worker non cachea dati critici
- Workout session non salva in IndexedDB se offline
- Nessuna strategia "offline-first"

#### Soluzione Proposta
1. Implementare Workbox per service worker
2. Salvare workout in IndexedDB durante sessione
3. Sync queue per quando torna online
4. UI indicator per stato offline

#### File da Modificare
- [ ] `vite.config.ts` - configurare vite-plugin-pwa
- [ ] `packages/web/src/components/LiveWorkoutSession.tsx` - IndexedDB save
- [ ] Creare `useOfflineSync()` hook

---

### ISSUE-011: Error Boundaries Insufficienti

**Severità:** 🟡 Medio  
**Componenti Affetti:** `App.tsx`, componenti lazy-loaded  
**Impatto:** Crash dell'intera app invece di errore localizzato

#### Descrizione
C'è un `ErrorBoundary` globale ma non ci sono boundary granulari per:
- Singole pagine
- Componenti di terze parti (grafici, video)
- Operazioni async critiche

#### Soluzione Proposta
1. Aggiungere ErrorBoundary per ogni route lazy-loaded
2. Fallback UI specifiche per tipo di errore
3. Logging errori a servizio esterno (Sentry?)

#### File da Modificare
- [ ] `packages/web/src/App.tsx` - boundary per route
- [ ] `packages/web/src/components/ErrorBoundary.tsx` - varianti

---

## 🟢 OTTIMIZZAZIONI P3 - BASSA PRIORITÀ

### ISSUE-012: Bundle Size Non Ottimizzato

**Severità:** 🟢 Basso  
**Impatto:** Performance load iniziale

#### Descrizione
- Lazy loading implementato ma non verificato
- Possibili import pesanti non tree-shaken (lodash, date-fns)
- Nessun bundle analysis recente

#### Soluzione Proposta
1. Eseguire `npx vite-bundle-visualizer`
2. Verificare che lazy routes funzionino
3. Sostituire import completi con cherry-pick

---

### ISSUE-013: Test Coverage Assente

**Severità:** 🟢 Basso  
**Impatto:** Regressioni non catturate

#### Descrizione
Non ci sono test automatizzati visibili nel codebase per:
- Unit test delle utility functions
- Integration test dei flow critici
- E2E test

#### Soluzione Proposta
1. Setup Vitest per unit test
2. Test prioritari: `programGenerator`, `exerciseSubstitutionEngine`, `painManagement`
3. Playwright per E2E dei flow critici (onboarding → screening → program)

---

## 📅 Piano di Implementazione Suggerito

### Sprint 1 (Settimana 1-2) - Critical Fixes
- [ ] ISSUE-002: Unificare client Supabase
- [ ] ISSUE-001: Definire formato programma canonico + migration

### Sprint 2 (Settimana 3-4) - Data Integrity
- [ ] ISSUE-003: Implementare sync localStorage/Supabase
- [ ] ISSUE-006: Fix auth race conditions

### Sprint 3 (Settimana 5-6) - Pain Detect Enhancement
- [ ] ISSUE-004: Integrare exerciseSubstitutionEngine
- [ ] ISSUE-007: Usare patternBaselines nella generazione

### Sprint 4 (Settimana 7-8) - Polish
- [ ] ISSUE-005: Consolidare state management
- [ ] ISSUE-008: Documentare design system
- [ ] ISSUE-009: Case conversion automatica

### Backlog
- ISSUE-010: PWA offline
- ISSUE-011: Error boundaries
- ISSUE-012: Bundle optimization
- ISSUE-013: Test coverage

---

## 📝 Note per lo Sviluppo

### Comandi Utili
```bash
# Cercare tutti i file che importano supabase
grep -r "from.*supabase" packages/web/src --include="*.ts" --include="*.tsx"

# Cercare uso di localStorage
grep -r "localStorage" packages/web/src --include="*.ts" --include="*.tsx"

# Cercare weekly_schedule (legacy)
grep -r "weekly_schedule" packages/ --include="*.ts" --include="*.tsx"
```

### Branch Strategy
```
main
├── fix/supabase-client-unification (ISSUE-002)
├── fix/program-structure-canonical (ISSUE-001)
├── feat/data-sync-layer (ISSUE-003)
└── feat/pain-detect-integration (ISSUE-004)
```

---

## ✅ Checklist Pre-Release Beta Pubblica

- [ ] Tutti i P0 risolti
- [ ] Tutti i P1 risolti o con workaround documentati
- [ ] Test manuali su flow critici
- [ ] Backup strategy per dati utente
- [ ] Monitoring errori attivo
- [ ] Documentazione utente aggiornata

---

*Documento generato da audit automatico. Verificare manualmente ogni issue prima di procedere con i fix.*
