# TrainSmart - Fix Coerenza Completi

**Data:** 24 Gennaio 2026  
**Versione:** 2.0  
**Priorità:** Alta

---

## 📦 Contenuto del Pacchetto

| File | Scopo | Priorità |
|------|-------|----------|
| `01-exerciseDescriptions-DCSS.ts` | Descrizioni esercizi allineate a DCSS | 🔴 Alta |
| `02-goalMapper-unified.ts` | Mapping goal centralizzato | 🔴 Alta |
| `03-programGenerator-multiGoal.patch.ts` | Supporto multi-goal | 🟡 Media |
| `04-landing-dcss-section.tsx` | Sezione landing che spiega DCSS | 🟡 Media |
| `05-i18n-complete.patch.ts` | Chiavi i18n mancanti | 🟢 Bassa |

---

## 🔴 FIX 1: Descrizioni Esercizi Allineate a DCSS

### Problema
Le descrizioni attuali usano linguaggio McGill ("schiena neutra sempre") mentre il marketing promette approccio DCSS di Evangelista.

### Soluzione
Sostituisci il contenuto di `packages/web/src/utils/exerciseDescriptions.ts` con il file `01-exerciseDescriptions-DCSS.ts`.

### Principi DCSS applicati:
1. **Nessuna posizione "corretta" universale** - la tecnica varia per antropometria
2. **Osservazioni, non errori** - "potresti notare" invece di "devi fare"
3. **Variabilità individuale** - note su come le proporzioni influenzano il movimento
4. **Focus sul controllo** - non sulla posizione statica

---

## 🔴 FIX 2: Goal Mapping Centralizzato

### Problema
Esistono due sistemi di goal (italiano nell'onboarding, inglese nel generator) senza mapping esplicito.

### Soluzione
1. Crea il file `packages/shared/src/utils/goalMapper.ts` con il contenuto di `02-goalMapper-unified.ts`
2. Aggiorna `packages/shared/src/index.ts` per esportarlo
3. Usa `normalizeGoal()` ovunque si passi un goal al generator

### Mapping completo:
```
ITALIANO → INGLESE (canonical)
forza → strength
ipertrofia → muscle_gain
massa → muscle_gain
massa muscolare → muscle_gain
tonificazione → toning
dimagrimento → fat_loss
resistenza → endurance
benessere → general_fitness
prestazioni_sportive → performance
sport_performance → performance
motor_recovery → motor_recovery
pre_partum → pregnancy
post_partum → postnatal
disabilita → disability
```

---

## 🟡 FIX 3: Supporto Multi-Goal

### Problema
L'onboarding permette di selezionare più goal, ma il generator usa solo il primo.

### Soluzione
Applica la patch in `03-programGenerator-multiGoal.patch.ts` per:
1. Accettare array di goal
2. Combinare parametri di allenamento intelligentemente
3. Bilanciare volume/intensità per obiettivi multipli

---

## 🟡 FIX 4: Sezione Landing DCSS

### Problema
La landing cita Evangelista ma non spiega cosa significa DCSS per l'utente.

### Soluzione
Aggiungi la sezione in `04-landing-dcss-section.tsx` dopo la sezione "Come Funziona".

---

## 🟢 FIX 5: i18n Completo

### Problema
Alcune chiavi i18n sono incomplete o mancanti.

### Soluzione
Aggiungi le chiavi da `05-i18n-complete.patch.ts` a `packages/web/src/lib/i18n.tsx`.

---

## ✅ Checklist di Implementazione

### Fase 1: Goal Mapping (30 min)
- [ ] Crea `packages/shared/src/utils/goalMapper.ts`
- [ ] Aggiungi export in `packages/shared/src/index.ts`
- [ ] Aggiorna `api/lib/programGenerator.js` per usare `normalizeGoal()`
- [ ] Aggiorna `packages/web/src/components/Dashboard.tsx` per usare `normalizeGoal()`
- [ ] Testa: genera programma con goal "ipertrofia" → deve produrre programma muscle_gain

### Fase 2: Descrizioni DCSS (20 min)
- [ ] Backup di `exerciseDescriptions.ts`
- [ ] Sostituisci con versione DCSS
- [ ] Verifica che i nomi esercizi matchino quelli nel database
- [ ] Testa: visualizza descrizione squat → deve menzionare variabilità individuale

### Fase 3: Multi-Goal (45 min)
- [ ] Applica patch al program generator
- [ ] Aggiorna Dashboard per passare array goals
- [ ] Testa: seleziona "forza" + "ipertrofia" → programma deve bilanciare entrambi

### Fase 4: Landing DCSS (15 min)
- [ ] Aggiungi sezione alla landing
- [ ] Verifica responsive su mobile
- [ ] Testa: la sezione spiega chiaramente cosa rende TrainSmart diverso

### Fase 5: i18n (10 min)
- [ ] Aggiungi chiavi mancanti
- [ ] Verifica che non ci siano chiavi duplicate
- [ ] Testa: cambia lingua → tutte le stringhe devono essere tradotte

---

## 🧪 Test di Regressione

Dopo aver applicato tutti i fix, verifica:

1. **Onboarding completo** → Deve salvare goal correttamente
2. **Genera programma beginner/ipertrofia** → Deve creare weekly split corretto
3. **Pain Detect durante workout** → Deve offrire opzioni (non forzare)
4. **Visualizza esercizio** → Descrizione deve essere DCSS-style
5. **Cambia lingua** → Nessuna chiave mancante

---

## 📝 Note per lo Sviluppatore

### Perché DCSS è importante
Paolo Evangelista (DCSS - Dynamics of Correspondence of Stimulus to Structure) sostiene che:
- Non esiste una tecnica "perfetta" universale
- La tecnica ottimale dipende dalle proporzioni individuali
- I tessuti si adattano ai carichi progressivi
- La flessione spinale moderata è normale, non intrinsecamente pericolosa

Questo è **scientificamente supportato** da ricerche recenti che mostrano come la paura del movimento ("kinesiophofia") sia più dannosa della flessione spinale stessa.

### Riferimenti
- Evangelista, P. - "DCSS: Il Metodo"
- Saraceni et al. (2020) - "To Flex or Not to Flex? A Narrative Review"
- Caneiro et al. (2021) - "Beliefs about the body and pain"
