# REPORT DEBUGGING - FitnessFlow

Data: 2025-11-17
App URL: http://127.0.0.1:5175

---

## PROBLEMA 1: SCREENING LOCATION NON FUNZIONANTE (CRITICO)

### Causa Root
**BUG trovato in**: `client/src/pages/Screening.tsx` (linea 24)

Il componente `Screening.tsx` stava cercando:
```javascript
localStorage.getItem('onboardingData')  // ❌ SBAGLIATO - chiave inesistente
```

Ma `Onboarding.tsx` salva con:
```javascript
localStorage.setItem('onboarding_data', ...)  // ✅ CORRETTO - con underscore
```

**Risultato**: `userData` era sempre `null`, quindi `trainingLocation` e `trainingType` non venivano mai passati a `ScreeningFlow.tsx`

### Fix Applicata
File: `client/src/pages/Screening.tsx`

```javascript
// PRIMA (BUG):
const localData = localStorage.getItem('onboardingData');

// DOPO (FIXED):
const localData = localStorage.getItem('onboarding_data');  // ✅ Chiave corretta
if (localData) {
  const parsedData = JSON.parse(localData);
  setUserData(parsedData);
  console.log('[SCREENING] ✅ Loaded onboarding data:', parsedData);
  console.log('[SCREENING] 🏠 Training location:', parsedData.trainingLocation);
  console.log('[SCREENING] 🎯 Training type:', parsedData.trainingType);
}
```

### Impatto
Ora `ScreeningFlow.tsx` riceve correttamente `userData` con:
- `trainingLocation`: 'gym' | 'home'
- `trainingType`: 'bodyweight' | 'equipment' | 'machines'

E la logica di screening funziona:
```javascript
// ScreeningFlow.tsx - linea 145-146
const isGymMode = userData?.trainingLocation === 'gym' &&
                  (userData?.trainingType === 'equipment' || userData?.trainingType === 'machines');
```

**Risultato atteso**:
- CASA + Corpo Libero → CALISTHENICS mode (progressioni bodyweight)
- CASA + Piccoli Attrezzi → CALISTHENICS mode (progressioni bodyweight)
- PALESTRA + Calisthenics → CALISTHENICS mode (progressioni bodyweight)
- PALESTRA + Pesi Liberi → GYM mode (test 10RM con bilanciere/manubri)
- PALESTRA + Macchine → GYM mode (test 10RM con macchine)

---

## PROBLEMA 2: GOOGLE FONTS NON VISIBILI (UI)

### Causa Root
**BUG trovato in**: `client/src/index.css` (linea 35)

Le Google Fonts erano importate correttamente in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
```

E configurate in `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['Outfit', 'Inter', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace']
}
```

**MA** il CSS globale in `index.css` non le usava:
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...  /* ❌ NO Inter */
}
```

### Fix Applicata
File: `client/src/index.css`

```css
/* PRIMA (BUG): */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...

/* DOPO (FIXED): */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
                ^^^^^^^^ Aggiunto Inter come font primaria
```

### Impatto
Ora tutte le pagine useranno:
- **Font base**: Inter (sans-serif moderna e leggibile)
- **Titoli/Display**: Outfit (via classe `font-display`)
- **Codice/Monospace**: JetBrains Mono (via classe `font-mono`)

Gli stili applicati in `Dashboard.tsx`, `PainStep.tsx` ecc. ora funzioneranno correttamente:
```javascript
className="font-display font-bold"  // → Outfit font
className="font-mono"               // → JetBrains Mono
```

---

## COME TESTARE LE FIX

### TEST 1: Screening Location (CRITICO)

1. Apri http://127.0.0.1:5175
2. Vai su Dashboard → Reset Profondo (elimina tutto)
3. Completa onboarding scegliendo:
   - **TEST A - PALESTRA PESI**:
     - Location: Palestra
     - Area: Pesi Liberi (o Macchine)
     - Completa gli step fino al quiz
   - **TEST B - CASA CORPO LIBERO**:
     - Location: Casa
     - Tipo: A Corpo Libero
     - Completa gli step fino al quiz

4. Completa il quiz teorico
5. Arriva alla pagina Screening
6. **VERIFICA I CONSOLE LOG** (F12 → Console):
   ```
   [SCREENING] ✅ Loaded onboarding data: {trainingLocation: "gym", trainingType: "equipment", ...}
   [SCREENING] 🏠 Training location: gym
   [SCREENING] 🎯 Training type: equipment
   [SCREENING] Mode: GYM | Location: gym | TrainingType: equipment
   ```

7. **VERIFICA UI SCREENING**:
   - TEST A (PALESTRA): Deve mostrare "Test 10RM" con input peso in kg (Back Squat, Bench Press, ecc.)
   - TEST B (CASA): Deve mostrare dropdown varianti calisthenics (Air Squat, Push-up, ecc.)

### TEST 2: Google Fonts (UI)

1. Apri http://127.0.0.1:5175/dashboard
2. Apri DevTools (F12) → Tab "Computed"
3. Seleziona un titolo (es. "Dashboard Intelligente")
4. Verifica che `font-family` mostri: **"Outfit"** (non system fonts)
5. Seleziona testo normale (es. paragrafi)
6. Verifica che `font-family` mostri: **"Inter"** (non -apple-system)

**Aspetto visivo atteso**:
- Titoli più moderni e bold (Outfit è più display-friendly)
- Testo generale più pulito e leggibile (Inter è più readable)
- Numeri/codice più chiari (JetBrains Mono per monospace)

---

## FILE MODIFICATI

1. `client/src/pages/Screening.tsx`
   - Fix localStorage key: `'onboardingData'` → `'onboarding_data'`
   - Aggiunto logging dettagliato per debug

2. `client/src/index.css`
   - Aggiunto 'Inter' come font primaria nel body

---

## VERIFICHE CONSOLE LOG

Durante il flusso completo dovresti vedere:

```
# ONBOARDING
[LOCATION_STEP] 🏠 Saving location: gym
[LOCATION_STEP] 🎯 Training type: equipment
[ONBOARDING] 📋 COMPLETE DATA OBJECT: {...}
[ONBOARDING] 🏠 trainingLocation value: gym

# SCREENING
[SCREENING] ✅ Loaded onboarding data: {trainingLocation: "gym", ...}
[SCREENING] 🏠 Training location: gym
[SCREENING] 🎯 Training type: equipment
[SCREENING] Mode: GYM | Location: gym | TrainingType: equipment

# SCREENING FLOW
📋 Test 10RM: Trova il peso massimo con cui riesci a fare esattamente 10 ripetizioni
🎯 1RM stimato: 85 kg (Calcolato con formula di Brzycki)
```

---

## STATUS FIX

- ✅ BUG CRITICO risolto: Screening ora riceve correttamente i dati di location/type
- ✅ BUG UI risolto: Google Fonts ora visibili su tutta l'app
- ✅ Logging migliorato per debug futuro
- ⚠️ TEST MANUALE RICHIESTO: Esegui i test sopra per confermare

---

## PROSSIMI STEP

1. Testa il flusso completo (onboarding → quiz → screening → dashboard)
2. Verifica che GYM mode mostri test 10RM
3. Verifica che CALISTHENICS mode mostri progressioni bodyweight
4. Verifica font Outfit/Inter visibili nel browser
5. Se tutto ok → commit delle modifiche
