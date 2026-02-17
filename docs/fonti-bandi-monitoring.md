# Fonti Bandi e Finanziamenti - TrainSmart

Questo documento elenca tutte le fonti monitorate quotidianamente alle 10:00 per trovare bandi e opportunità di finanziamento rilevanti per TrainSmart.

## 🇮🇹 NAZIONALI

### 1. Invitalia
**URL:** https://www.invitalia.it/per-chi-vuole-fare-impresa  
**Focus:** Smart&Start Italia, Autoimpiego, Cultura Cresce, Resto al Sud  
**Rilevanza:** ⭐⭐⭐⭐⭐ (principale fonte per startup italiane)

### 2. MISE (Ministero Imprese e Made in Italy)
**URL:** https://www.mise.gov.it/index.php/it/incentivi  
**Focus:** Fondo Impresa Femminile, Nuova Sabatini, Transizione 4.0  
**Rilevanza:** ⭐⭐⭐⭐⭐ (incentivi nazionali, tax credit R&D)

### 3. AGID (Agenzia per l'Italia Digitale)
**URL:** https://www.agid.gov.it/it/piattaforme/fondo-innovazione  
**Focus:** Innovazione tecnologica per PA, digital transformation  
**Rilevanza:** ⭐⭐⭐ (principalmente B2B pubblico)

---

## 🏙️ REGIONALI

### 4. Regione Lombardia
**URL:** https://www.regione.lombardia.it/wps/portal/istituzionale/HP/DettaglioRedazionale/servizi-e-informazioni/imprese/incentivi-e-agevolazioni  
**Focus:** Bandi regionali innovazione, startup, digital  
**Rilevanza:** ⭐⭐⭐⭐⭐ (sede legale a Milano)

### 5. Regione Piemonte
**URL:** https://www.regione.piemonte.it/web/temi/fondi-progetti-europei  
**Focus:** Fondi europei, innovazione, ricerca  
**Rilevanza:** ⭐⭐⭐ (mercato potenziale Nord-Ovest)

### 6. Regione Lazio
**URL:** https://www.regione.lazio.it/cittadini/imprese-lavoro  
**Focus:** Startup, innovazione, hub Roma  
**Rilevanza:** ⭐⭐⭐ (mercato potenziale Centro)

---

## 🇪🇺 EUROPEI & INTERNAZIONALI

### 7. EU Digital Europe Programme
**URL:** https://digital-strategy.ec.europa.eu/en/funding  
**Focus:** AI, cybersecurity, digital skills, advanced computing  
**Rilevanza:** ⭐⭐⭐⭐ (AI = core di TrainSmart)

### 8. EIC Accelerator (European Innovation Council)
**URL:** https://eic.ec.europa.eu/eic-funding-opportunities_en  
**Focus:** Deep tech, breakthrough innovation (fino a €2.5M grant + equity)  
**Rilevanza:** ⭐⭐⭐⭐⭐ (massimo finanziamento disponibile per scale-up)

---

## 🚀 ACCELERATORI & VENTURE CAPITAL

### 9. CDP Venture Capital
**URL:** https://www.cdp.it/sitointernet/it/per_chi_vuole_fare_impresa.page  
**Focus:** Venture capital, acceleratori italiani, corporate venture  
**Rilevanza:** ⭐⭐⭐⭐⭐ (equity, non solo grant)

### 10. PoliHub Milano
**URL:** https://www.polihub.it/startup-program/  
**Focus:** Incubatore Politecnico Milano, tech startups  
**Rilevanza:** ⭐⭐⭐⭐ (rete Milano, mentorship, validazione)

---

## 🔍 PAROLE CHIAVE DI RICERCA

Quando analizzo le pagine, cerco queste keyword:
- **Health tech** / Digital health
- **Wellness** / Fitness tech
- **AI** / Artificial Intelligence / Machine Learning
- **Sport tech** / Sportello digitale
- **B2C SaaS** / Mobile app
- **Innovazione sociale** (wellness accessibile)
- **Deep tech** / Tecnologia applicata
- **Startup innovative** (registro speciale)

---

## 📊 CRITERI DI RILEVANZA

Un bando è considerato **molto rilevante** se:
1. ✅ Aperto a startup innovative italiane
2. ✅ Focus su health tech / wellness / AI / sport
3. ✅ Budget >€50K (sostenibile per TrainSmart)
4. ✅ Scadenza entro 3-6 mesi (tempo sufficiente per application)
5. ✅ Non richiede co-finanziamento >50% (sostenibilità economica)

Un bando è **mediamente rilevante** se:
1. ⚠️ Aperto a PMI innovative (non solo startup)
2. ⚠️ Focus generico digitale (non health-specific)
3. ⚠️ Budget €20-50K
4. ⚠️ Richiede partnership (università, centri ricerca)

Un bando è **poco rilevante** se:
1. ❌ Solo per specifici settori (es: agricoltura, manifatturiero)
2. ❌ Solo per regioni diverse da Lombardia (salvo bandi nazionali/EU)
3. ❌ Budget <€20K (effort application non giustificato)
4. ❌ Richiede co-finanziamento >70%

---

## 🤖 AUTOMAZIONE

**Cron Job attivo:**
- **Frequenza:** Ogni giorno alle 10:00 (Europe/Rome)
- **Metodo:** `web_fetch` (gratuito, no API Brave)
- **Output:** Telegram message con 3-5 bandi più rilevanti
- **Formato:** Titolo, scadenza, budget, requisiti, link

**Gestione:**
```bash
# Vedere lo stato
openclaw cron list

# Modificare
openclaw cron update <job-id>

# Disabilitare temporaneamente
openclaw cron update <job-id> --patch '{"enabled": false}'
```

---

## 📝 NOTE

- **Tempistiche:** I bandi sono spesso pubblicati con 30-90 giorni di preavviso
- **Stagionalità:** Picchi a gennaio-marzo (nuovi fondi annuali) e settembre-ottobre (chiusura budget annuale)
- **Ricorrenza:** Smart&Start, Nuova Sabatini = sempre aperti (sportello)
- **Competitività:** EIC Accelerator < 5% approval rate (alta selettività)
- **Preparazione:** Documenti da tenere pronti (pitch deck, business plan, bilanci, team CV)

---

**Ultimo aggiornamento:** 17 Febbraio 2026  
**Prossima revisione:** Aprile 2026 (post feedback 2 mesi)
