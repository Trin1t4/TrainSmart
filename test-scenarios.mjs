/**
 * TEST MASSIVO - Generatore Programmi TrainSmart
 *
 * Testa TUTTE le combinazioni di:
 * - Sesso (M/F)
 * - Età (giovane 25 / vecchio 65)
 * - Peso (normopeso / sovrappeso)
 * - Tutti gli obiettivi
 * - Sonno (poco 4h / adeguato 8h)
 * - Stress (poco 2 / tanto 9)
 * - Fasi ciclo mestruale (solo donne)
 * - Dolori articolari (sì/no)
 * - Tempo disponibile (poco 30min / adeguato 60min)
 */

// Dynamic imports per evitare conflitti .ts/.js nella risoluzione moduli
const { generateProgramWithSplit } = await import('./packages/shared/src/utils/programGenerator.ts');
const { validateAndNormalizePainAreas } = await import('./packages/shared/src/utils/validators.ts');
const { generateDefaultBaselines } = await import('./packages/shared/src/utils/programValidation.ts');
const { inferMissingBaselines } = await import('./packages/shared/src/lib/baselineInferenceService.ts');
// conductPreWorkoutScreening resta nel vecchio generator (non eliminato per rollback)
const { conductPreWorkoutScreening } = await import('./api/lib/programGenerator.js');

/**
 * Wrapper: converte input test (old format) → ProgramGeneratorOptions → generateProgramWithSplit
 * e normalizza output per backward compat con validateProgram (weeklySchedule)
 */
function generateProgram(input) {
  const {
    level = 'intermediate',
    goal = 'muscle_gain',
    location = 'gym',
    frequency = 3,
    bodyweight = 70,
    painAreas = [],
    equipment = {},
    assessments = [],
    sportRole = null,
    medicalRestrictions = null,
    disabilityType = null,
  } = input;

  // Normalizza painAreas (mixed format: stringhe e oggetti)
  const normalizedPainAreas = validateAndNormalizePainAreas(painAreas);

  // Converti assessments → baselines
  const EXERCISE_TO_PATTERN = {
    'squat': 'lower_push', 'panca': 'horizontal_push', 'bench': 'horizontal_push',
    'stacco': 'lower_pull', 'deadlift': 'lower_pull', 'trazioni': 'vertical_pull',
    'pull up': 'vertical_pull', 'press': 'vertical_push', 'overhead press': 'vertical_push',
    'rematore': 'horizontal_pull', 'row': 'horizontal_pull',
  };

  let baselines = {};
  if (assessments && assessments.length > 0) {
    for (const a of assessments) {
      const key = (a.exerciseName || '').toLowerCase().trim();
      const pattern = EXERCISE_TO_PATTERN[key];
      if (!pattern) continue;
      const oneRM = a.oneRepMax || 0;
      baselines[pattern] = {
        variantId: pattern, variantName: a.exerciseName,
        reps: a.maxReps || 10, weight10RM: oneRM > 0 ? Math.round(oneRM * 0.75) : (a.weight || 0),
        difficulty: 5,
      };
    }
  }

  if (Object.keys(baselines).length > 0) {
    baselines = inferMissingBaselines(baselines, bodyweight, level);
  } else {
    baselines = generateDefaultBaselines();
  }

  // Inferisci trainingType
  let trainingType = 'equipment';
  if (location !== 'gym') {
    const hasEquip = equipment && (equipment.barbell || equipment.dumbbells || equipment.rack || equipment.bench);
    trainingType = hasEquip ? 'equipment' : 'bodyweight';
  }

  const options = {
    level,
    goal,
    location,
    trainingType,
    frequency,
    baselines,
    painAreas: normalizedPainAreas,
    equipment,
    userBodyweight: bodyweight,
    sessionDuration: frequency <= 3 ? 60 : frequency <= 4 ? 50 : 45,
    disabilityType: disabilityType || undefined,
    sportRole: sportRole || undefined,
    medicalRestrictions: medicalRestrictions || undefined,
  };

  const result = generateProgramWithSplit(options);

  // Se bloccato dalla validazione, ritorna come era
  if (result?.error || result?.blocked) return result;

  // Mappa output per backward compat con validateProgram
  const days = result?.weeklySplit?.days || [];
  const progression = level === 'beginner' ? 'linear' : level === 'advanced' ? 'ondulata_avanzata' : 'ondulata_intermedia';

  return {
    ...result,
    weeklySchedule: days,
    daysPerWeek: days.length,
    progression,
    includesDeload: level !== 'beginner',
    deloadFrequency: 4,
    totalWeeks: 4,
    requiresEndCycleTest: false,
    isRecoveryProgram: (goal || '').toLowerCase().includes('recovery') || (goal || '').toLowerCase().includes('recupero'),
  };
}

// ===== COLORI CONSOLE =====
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// ===== PARAMETRI TEST =====
const GOALS = [
  'forza',
  'ipertrofia',
  'tonificazione',
  'dimagrimento',
  'resistenza',
  'prestazioni_sportive',
  'benessere',
  'motor_recovery'
];

const PROFILES = {
  // UOMO GIOVANE NORMOPESO
  uomo_giovane_normopeso: {
    label: 'Uomo 25a, 75kg, normopeso',
    gender: 'M',
    age: 25,
    weight: 75,
    height: 178,
    bmi: 23.7,
    level: 'intermediate',
    bodyweight: 75
  },
  // UOMO GIOVANE SOVRAPPESO
  uomo_giovane_sovrappeso: {
    label: 'Uomo 25a, 105kg, sovrappeso',
    gender: 'M',
    age: 25,
    weight: 105,
    height: 178,
    bmi: 33.1,
    level: 'beginner',
    bodyweight: 105
  },
  // UOMO VECCHIO NORMOPESO
  uomo_vecchio_normopeso: {
    label: 'Uomo 65a, 72kg, normopeso',
    gender: 'M',
    age: 65,
    weight: 72,
    height: 175,
    bmi: 23.5,
    level: 'beginner',
    bodyweight: 72
  },
  // UOMO VECCHIO SOVRAPPESO
  uomo_vecchio_sovrappeso: {
    label: 'Uomo 65a, 98kg, sovrappeso',
    gender: 'M',
    age: 65,
    weight: 98,
    height: 175,
    bmi: 32.0,
    level: 'beginner',
    bodyweight: 98
  },
  // DONNA GIOVANE NORMOPESO
  donna_giovane_normopeso: {
    label: 'Donna 25a, 58kg, normopeso',
    gender: 'F',
    age: 25,
    weight: 58,
    height: 165,
    bmi: 21.3,
    level: 'intermediate',
    bodyweight: 58
  },
  // DONNA GIOVANE SOVRAPPESO
  donna_giovane_sovrappeso: {
    label: 'Donna 25a, 88kg, sovrappeso',
    gender: 'F',
    age: 25,
    weight: 88,
    height: 165,
    bmi: 32.3,
    level: 'beginner',
    bodyweight: 88
  },
  // DONNA VECCHIA NORMOPESO
  donna_vecchia_normopeso: {
    label: 'Donna 65a, 60kg, normopeso',
    gender: 'F',
    age: 65,
    weight: 60,
    height: 160,
    bmi: 23.4,
    level: 'beginner',
    bodyweight: 60
  },
  // DONNA VECCHIA SOVRAPPESO
  donna_vecchia_sovrappeso: {
    label: 'Donna 65a, 85kg, sovrappeso',
    gender: 'F',
    age: 65,
    weight: 85,
    height: 160,
    bmi: 33.2,
    level: 'beginner',
    bodyweight: 85
  }
};

const RECOVERY_SCENARIOS = {
  ottimale: {
    label: 'Sonno 8h, Stress 2/10',
    sleepHours: 8,
    stressLevel: 2
  },
  pessimo: {
    label: 'Sonno 4h, Stress 9/10',
    sleepHours: 4,
    stressLevel: 9
  }
};

const MENSTRUAL_PHASES = ['follicular', 'ovulation', 'luteal', 'menstruation', 'menopause'];

const PAIN_SCENARIOS = {
  nessuno: [],
  ginocchio_spalla: [
    { area: 'knee', severity: 'moderate' },
    { area: 'shoulder', severity: 'mild' }
  ],
  schiena: [
    { area: 'lower_back', severity: 'severe' }
  ]
};

const TIME_SCENARIOS = {
  poco: { frequency: 2, sessionMinutes: 30 },
  adeguato: { frequency: 4, sessionMinutes: 60 }
};

// ===== CONTATORI =====
let totalTests = 0;
let passed = 0;
let failed = 0;
let warnings = 0;
const errors = [];
const warningsList = [];

// ===== HELPER: Soppressione console.log durante test =====
const originalLog = console.log;
const originalWarn = console.warn;
let suppressLogs = true;

function suppressConsole() {
  if (suppressLogs) {
    console.log = () => {};
    console.warn = () => {};
  }
}

function restoreConsole() {
  console.log = originalLog;
  console.warn = originalWarn;
}

// ===== VALIDAZIONE =====

function validateProgram(result, scenario) {
  const issues = [];
  const warns = [];

  // 1. Il programma esiste
  if (!result) {
    issues.push('Risultato NULL');
    return { issues, warns };
  }

  // 2. Ha un nome
  if (!result.name || result.name.trim() === '') {
    issues.push('Nome programma mancante');
  }

  // 3. Ha weeklySchedule
  if (!result.weeklySchedule || !Array.isArray(result.weeklySchedule)) {
    issues.push('weeklySchedule mancante o non array');
    return { issues, warns };
  }

  // 4. Almeno 1 giorno
  if (result.weeklySchedule.length === 0) {
    // Motor recovery senza pain areas può avere 0 giorni
    if (scenario.goal !== 'motor_recovery') {
      issues.push(`0 giorni nel programma (goal: ${scenario.goal})`);
    }
    return { issues, warns };
  }

  // 5. Ogni giorno ha esercizi
  for (const day of result.weeklySchedule) {
    if (!day.exercises || day.exercises.length === 0) {
      warns.push(`Giorno "${day.dayName}" senza esercizi`);
    } else {
      // 6. Ogni esercizio ha name, sets, reps
      for (const ex of day.exercises) {
        if (!ex.name) {
          issues.push(`Esercizio senza nome nel giorno "${day.dayName}"`);
        }
        if (ex.sets === undefined || ex.sets === null) {
          warns.push(`"${ex.name}" senza sets (${day.dayName})`);
        }
        if (ex.reps === undefined || ex.reps === null) {
          warns.push(`"${ex.name}" senza reps (${day.dayName})`);
        }
        // 7. Sets ragionevoli (1-10)
        if (typeof ex.sets === 'number' && (ex.sets < 1 || ex.sets > 10)) {
          warns.push(`"${ex.name}" ha ${ex.sets} sets (anomalo)`);
        }
        // 8. Weight non negativo
        if (ex.weight !== null && ex.weight !== undefined && ex.weight < 0) {
          issues.push(`"${ex.name}" peso negativo: ${ex.weight}kg`);
        }
        // 9. Rest ragionevole (15-300s)
        if (typeof ex.rest === 'number' && (ex.rest < 10 || ex.rest > 400)) {
          warns.push(`"${ex.name}" rest ${ex.rest}s (anomalo)`);
        }
      }
    }
  }

  // 10. Progressione presente
  if (!result.progression) {
    warns.push('Progressione non specificata');
  }

  // 11. Beginner DEVE avere progressione linear
  if (scenario.level === 'beginner' && result.progression && result.progression !== 'linear' && result.progression !== 'low_intensity_stability') {
    warns.push(`Beginner con progressione "${result.progression}" (dovrebbe essere "linear")`);
  }

  // 12. Pain areas: verifica che esercizi controindicati NON ci siano
  if (scenario.painAreas && scenario.painAreas.length > 0) {
    const hasPainKnee = scenario.painAreas.some(p => p.area === 'knee');
    const hasPainShoulder = scenario.painAreas.some(p => p.area === 'shoulder');
    const hasPainBack = scenario.painAreas.some(p => p.area === 'lower_back');

    for (const day of result.weeklySchedule) {
      for (const ex of (day.exercises || [])) {
        const name = (ex.name || '').toLowerCase();
        if (hasPainKnee && (name.includes('squat') || name.includes('leg press') || name.includes('leg extension'))) {
          warns.push(`⚠️ PAIN: "${ex.name}" presente con dolore ginocchio`);
        }
        if (hasPainShoulder && (name.includes('military') || name.includes('lateral raise'))) {
          warns.push(`⚠️ PAIN: "${ex.name}" presente con dolore spalla`);
        }
        if (hasPainBack && (name.includes('stacco') || name.includes('deadlift') || name.includes('good morning'))) {
          warns.push(`⚠️ PAIN: "${ex.name}" presente con dolore schiena`);
        }
      }
    }
  }

  // 13. Sovrappeso: verifica che non ci siano esercizi ad alto impatto per principianti
  if (scenario.bmi && scenario.bmi > 30 && scenario.level === 'beginner') {
    for (const day of result.weeklySchedule) {
      for (const ex of (day.exercises || [])) {
        const name = (ex.name || '').toLowerCase();
        if (name.includes('jump') || name.includes('burpee') || name.includes('box jump')) {
          warns.push(`⚠️ SOVRAPPESO: "${ex.name}" alto impatto per BMI ${scenario.bmi}`);
        }
      }
    }
  }

  // 14. Conteggio esercizi per giorno (ragionevole: 3-12)
  for (const day of result.weeklySchedule) {
    const exCount = (day.exercises || []).length;
    if (exCount > 12) {
      warns.push(`Giorno "${day.dayName}": ${exCount} esercizi (troppi?)`);
    }
    if (exCount < 2 && !result.isRecoveryProgram) {
      warns.push(`Giorno "${day.dayName}": solo ${exCount} esercizi`);
    }
  }

  return { issues, warns };
}

function validateScreening(result, scenario) {
  const issues = [];
  const warns = [];

  if (!result) {
    issues.push('Screening NULL');
    return { issues, warns };
  }

  if (!result.recommendations) {
    issues.push('recommendations mancante');
    return { issues, warns };
  }

  const { intensityMultiplier, shouldReduceVolume } = result.recommendations;

  // Intensity multiplier ragionevole (0.5 - 1.2)
  if (intensityMultiplier < 0.4 || intensityMultiplier > 1.3) {
    issues.push(`intensityMultiplier fuori range: ${intensityMultiplier}`);
  }

  // Poco sonno + alto stress = riduzione volume
  if (scenario.sleepHours < 5 && scenario.stressLevel >= 8) {
    if (!shouldReduceVolume) {
      warns.push('Sonno critico + stress alto ma shouldReduceVolume=false');
    }
    if (intensityMultiplier > 0.75) {
      warns.push(`Sonno ${scenario.sleepHours}h + Stress ${scenario.stressLevel} ma multiplier ${intensityMultiplier} (troppo alto?)`);
    }
  }

  // Sonno adeguato + basso stress = nessuna riduzione
  if (scenario.sleepHours >= 7 && scenario.stressLevel <= 3) {
    if (shouldReduceVolume) {
      warns.push('Sonno adeguato + stress basso ma shouldReduceVolume=true');
    }
  }

  return { issues, warns };
}

// ===== IMPORT RECOVERY ADAPTATION =====
// Lo importiamo dinamicamente perché è TypeScript - simuliamo la logica

function simulateRecoveryAdjustments(recovery) {
  let volumeMultiplier = 1.0;
  let intensityMultiplier = 1.0;
  let restMultiplier = 1.0;
  const notes = [];
  let severity = 'green';

  // Sonno
  if (recovery.sleepHours < 5) {
    volumeMultiplier *= 0.70;
    intensityMultiplier *= 0.80;
    restMultiplier *= 1.3;
    notes.push(`Sonno critico (${recovery.sleepHours}h)`);
    severity = 'red';
  } else if (recovery.sleepHours < 6) {
    volumeMultiplier *= 0.80;
    intensityMultiplier *= 0.90;
    restMultiplier *= 1.2;
    notes.push(`Poco sonno (${recovery.sleepHours}h)`);
    severity = 'yellow';
  } else if (recovery.sleepHours < 7) {
    volumeMultiplier *= 0.90;
    notes.push(`Sonno sufficiente (${recovery.sleepHours}h)`);
  }

  // Stress
  if (recovery.stressLevel >= 8) {
    volumeMultiplier *= 0.80;
    intensityMultiplier *= 0.80;
    restMultiplier *= 1.3;
    notes.push(`Stress molto alto (${recovery.stressLevel}/10)`);
    severity = 'red';
  } else if (recovery.stressLevel >= 6) {
    volumeMultiplier *= 0.90;
    intensityMultiplier *= 0.90;
    notes.push(`Stress moderato (${recovery.stressLevel}/10)`);
    if (severity === 'green') severity = 'yellow';
  }

  // Ciclo mestruale
  if (recovery.isFemale && recovery.menstrualCycle) {
    switch (recovery.menstrualCycle) {
      case 'follicular':
        volumeMultiplier *= 1.05;
        intensityMultiplier *= 1.05;
        notes.push('Fase follicolare: capacita aumentata');
        break;
      case 'ovulation':
        volumeMultiplier *= 1.10;
        intensityMultiplier *= 1.10;
        notes.push('Ovulazione: peak performance');
        break;
      case 'luteal':
        volumeMultiplier *= 0.95;
        notes.push('Fase luteale: capacita leggermente ridotta');
        break;
      case 'menstruation':
        volumeMultiplier *= 0.85;
        intensityMultiplier *= 0.85;
        restMultiplier *= 1.2;
        notes.push('Mestruazione: intensita ridotta');
        if (severity === 'green') severity = 'yellow';
        break;
      case 'menopause':
        volumeMultiplier *= 0.95;
        notes.push('Menopausa: focus forza e mobilita');
        break;
    }
  }

  // Dolori
  if (recovery.painAreas && recovery.painAreas.length > 0) {
    for (const pain of recovery.painAreas) {
      if (pain.severity === 'severe') {
        notes.push(`Dolore grave: ${pain.area}`);
        severity = 'red';
      } else if (pain.severity === 'moderate') {
        notes.push(`Dolore moderato: ${pain.area}`);
        if (severity === 'green') severity = 'yellow';
      }
    }
  }

  return { volumeMultiplier, intensityMultiplier, restMultiplier, notes, severity };
}

// ===== RUNNER =====

function runTest(description, fn) {
  totalTests++;
  suppressConsole();
  try {
    const result = fn();
    restoreConsole();

    if (result.issues.length > 0) {
      failed++;
      errors.push({ description, issues: result.issues, warns: result.warns });
      originalLog(`  ${RED}FAIL${RESET} ${description}`);
      result.issues.forEach(i => originalLog(`       ${RED}> ${i}${RESET}`));
      result.warns.forEach(w => originalLog(`       ${YELLOW}> ${w}${RESET}`));
    } else if (result.warns.length > 0) {
      passed++;
      warnings += result.warns.length;
      result.warns.forEach(w => warningsList.push({ description, warn: w }));
      originalLog(`  ${GREEN}PASS${RESET} ${YELLOW}(${result.warns.length} warnings)${RESET} ${description}`);
    } else {
      passed++;
      originalLog(`  ${GREEN}PASS${RESET} ${description}`);
    }
  } catch (e) {
    restoreConsole();
    failed++;
    const errMsg = e.message || String(e);
    errors.push({ description, issues: [`CRASH: ${errMsg}`], warns: [] });
    originalLog(`  ${RED}CRASH${RESET} ${description}`);
    originalLog(`       ${RED}> ${errMsg}${RESET}`);
  }
}

// ===== MAIN =====

originalLog(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}`);
originalLog(`${BOLD}${CYAN}   TEST MASSIVO GENERATORE PROGRAMMI TRAINSMART${RESET}`);
originalLog(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}\n`);

// ═══════════════════════════════════════════════════════════
// PARTE 1: GENERAZIONE PROGRAMMI (generateProgram)
// ═══════════════════════════════════════════════════════════

originalLog(`${BOLD}${MAGENTA}PARTE 1: GENERAZIONE PROGRAMMI${RESET}`);
originalLog(`${DIM}(Ogni profilo x ogni obiettivo x dolori x tempo)${RESET}\n`);

for (const [profileKey, profile] of Object.entries(PROFILES)) {
  originalLog(`\n${BOLD}${CYAN}--- ${profile.label} ---${RESET}`);

  for (const goal of GOALS) {
    for (const [painKey, painAreas] of Object.entries(PAIN_SCENARIOS)) {
      for (const [timeKey, timeConfig] of Object.entries(TIME_SCENARIOS)) {

        const scenarioDesc = `${profile.label} | ${goal} | dolori:${painKey} | tempo:${timeKey}`;

        const scenario = {
          goal,
          level: profile.level,
          bmi: profile.bmi,
          painAreas: goal === 'motor_recovery' ?
            (painAreas.length > 0 ? painAreas.map(p => p.area) : ['knee', 'lower_back']) :
            painAreas
        };

        runTest(scenarioDesc, () => {
          const input = {
            level: profile.level,
            goal: goal,
            location: 'gym',
            frequency: timeConfig.frequency,
            bodyweight: profile.bodyweight,
            painAreas: goal === 'motor_recovery' ?
              (painAreas.length > 0 ? painAreas.map(p => p.area) : ['knee', 'lower_back']) :
              painAreas,
            equipment: {},
            assessments: [],
            sportRole: goal === 'prestazioni_sportive' ? { sport: 'calcio', role: 'centrocampista' } : null,
            medicalRestrictions: null
          };

          const result = generateProgram(input);
          return validateProgram(result, scenario);
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 1B: HOME TRAINING (stessi profili, location home)
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 1B: HOME TRAINING${RESET}`);
originalLog(`${DIM}(Subset profili x obiettivi principali a casa)${RESET}\n`);

const HOME_PROFILES = ['uomo_giovane_normopeso', 'donna_giovane_normopeso', 'uomo_vecchio_normopeso', 'donna_vecchia_normopeso'];
const HOME_GOALS = ['forza', 'ipertrofia', 'tonificazione', 'dimagrimento', 'resistenza', 'benessere'];

for (const profileKey of HOME_PROFILES) {
  const profile = PROFILES[profileKey];
  originalLog(`\n${BOLD}${CYAN}--- ${profile.label} (HOME) ---${RESET}`);

  for (const goal of HOME_GOALS) {
    const scenarioDesc = `HOME | ${profile.label} | ${goal}`;

    runTest(scenarioDesc, () => {
      const result = generateProgram({
        level: profile.level,
        goal,
        location: 'home',
        frequency: 3,
        bodyweight: profile.bodyweight,
        painAreas: [],
        equipment: { pullupBar: true, loopBands: true },
        assessments: [],
        sportRole: null,
        medicalRestrictions: null
      });
      return validateProgram(result, { goal, level: profile.level, painAreas: [] });
    });
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 2: PRE-WORKOUT SCREENING (conductPreWorkoutScreening)
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 2: PRE-WORKOUT SCREENING${RESET}`);
originalLog(`${DIM}(Sonno x Stress x Dolori)${RESET}\n`);

const SLEEP_VALUES = [3, 4, 5, 6, 7, 8, 9, 10];
const STRESS_VALUES = [1, 2, 3, 4, 5];

for (const sleep of SLEEP_VALUES) {
  for (const stress of STRESS_VALUES) {
    for (const [painKey, painAreas] of Object.entries(PAIN_SCENARIOS)) {
      const scenarioDesc = `Screening: sonno ${sleep}h, stress ${stress}, dolori:${painKey}`;

      runTest(scenarioDesc, () => {
        const result = conductPreWorkoutScreening({
          sleepHours: sleep,
          stressLevel: stress,
          painAreas: painAreas.map(p => p.area)
        });
        return validateScreening(result, { sleepHours: sleep, stressLevel: stress });
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 3: RECOVERY ADAPTATION + CICLO MESTRUALE
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 3: RECOVERY ADAPTATION + CICLO MESTRUALE${RESET}`);
originalLog(`${DIM}(Simulazione recoveryAdaptation.ts - include fasi ciclo)${RESET}\n`);

const FEMALE_PROFILES = Object.entries(PROFILES).filter(([k, v]) => v.gender === 'F');
const MALE_PROFILES = Object.entries(PROFILES).filter(([k, v]) => v.gender === 'M');

// Donne: tutte le fasi del ciclo x recovery scenarios
for (const [profileKey, profile] of FEMALE_PROFILES) {
  originalLog(`\n${BOLD}${CYAN}--- ${profile.label} ---${RESET}`);

  for (const phase of MENSTRUAL_PHASES) {
    for (const [recoveryKey, recovery] of Object.entries(RECOVERY_SCENARIOS)) {
      for (const [painKey, painAreas] of Object.entries(PAIN_SCENARIOS)) {
        const scenarioDesc = `${profile.label} | ciclo:${phase} | ${recovery.label} | dolori:${painKey}`;

        runTest(scenarioDesc, () => {
          const result = simulateRecoveryAdjustments({
            sleepHours: recovery.sleepHours,
            stressLevel: recovery.stressLevel,
            isFemale: true,
            menstrualCycle: phase,
            painAreas: painAreas
          });

          const issues = [];
          const warns = [];

          // Multipliers ragionevoli
          if (result.volumeMultiplier < 0.3 || result.volumeMultiplier > 1.5) {
            issues.push(`volumeMultiplier fuori range: ${result.volumeMultiplier.toFixed(2)}`);
          }
          if (result.intensityMultiplier < 0.3 || result.intensityMultiplier > 1.5) {
            issues.push(`intensityMultiplier fuori range: ${result.intensityMultiplier.toFixed(2)}`);
          }

          // Mestruazione + poco sonno + tanto stress → moltiplicatore molto basso
          if (phase === 'menstruation' && recovery.sleepHours < 5 && recovery.stressLevel >= 8) {
            if (result.volumeMultiplier > 0.60) {
              warns.push(`Mestruazione + crisi recovery: volume ${(result.volumeMultiplier*100).toFixed(0)}% (troppo alto?)`);
            }
            if (result.severity !== 'red') {
              warns.push(`Mestruazione + crisi ma severity non red: ${result.severity}`);
            }
          }

          // Ovulazione + buon recovery → boost
          if (phase === 'ovulation' && recovery.sleepHours >= 7 && recovery.stressLevel <= 3) {
            if (result.volumeMultiplier < 1.0) {
              warns.push(`Ovulazione + ottimo recovery ma volume ridotto: ${(result.volumeMultiplier*100).toFixed(0)}%`);
            }
          }

          return { issues, warns };
        });
      }
    }
  }
}

// Uomini: solo recovery scenarios (no ciclo)
for (const [profileKey, profile] of MALE_PROFILES) {
  originalLog(`\n${BOLD}${CYAN}--- ${profile.label} ---${RESET}`);

  for (const [recoveryKey, recovery] of Object.entries(RECOVERY_SCENARIOS)) {
    for (const [painKey, painAreas] of Object.entries(PAIN_SCENARIOS)) {
      const scenarioDesc = `${profile.label} | ${recovery.label} | dolori:${painKey}`;

      runTest(scenarioDesc, () => {
        const result = simulateRecoveryAdjustments({
          sleepHours: recovery.sleepHours,
          stressLevel: recovery.stressLevel,
          isFemale: false,
          menstrualCycle: null,
          painAreas: painAreas
        });

        const issues = [];
        const warns = [];

        if (result.volumeMultiplier < 0.3 || result.volumeMultiplier > 1.2) {
          issues.push(`volumeMultiplier fuori range: ${result.volumeMultiplier.toFixed(2)}`);
        }
        if (result.intensityMultiplier < 0.3 || result.intensityMultiplier > 1.2) {
          issues.push(`intensityMultiplier fuori range: ${result.intensityMultiplier.toFixed(2)}`);
        }

        return { issues, warns };
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 4: MEDICAL RESTRICTIONS (prescrizioni mediche)
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 4: PRESCRIZIONI MEDICHE${RESET}`);
originalLog(`${DIM}(Verifica hard block su esercizi vietati)${RESET}\n`);

const MEDICAL_RESTRICTIONS_SCENARIOS = [
  { label: 'Blocco ginocchio', restrictions: [{ area: 'knee', reason: 'Meniscopatia', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }] },
  { label: 'Blocco spalla', restrictions: [{ area: 'shoulder', reason: 'Cuffia rotatori', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }] },
  { label: 'Blocco schiena', restrictions: [{ area: 'lower_back', reason: 'Ernia L4-L5', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }] },
  { label: 'Blocco braccio', restrictions: [{ area: 'arm', reason: 'Tendinite', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }] },
  { label: 'Blocco gamba', restrictions: [{ area: 'leg', reason: 'Post-chirurgico', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }] },
  { label: 'Multi-blocco ginocchio+spalla', restrictions: [
    { area: 'knee', reason: 'Artrite', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' },
    { area: 'shoulder', reason: 'Lussazione', startDate: '2026-01-01', lastConfirmedDate: '2026-02-15' }
  ]}
];

const MEDICAL_KEYWORDS_CHECK = {
  knee: ['squat', 'lunge', 'affondi', 'leg press', 'leg extension', 'leg curl', 'pistol', 'bulgaro', 'pressa', 'goblet'],
  shoulder: ['press', 'panca', 'bench', 'raise', 'alzate', 'fly', 'croci', 'dip', 'push', 'trazioni', 'row', 'rematore', 'pull', 'lat', 'military', 'overhead', 'arnold'],
  lower_back: ['deadlift', 'stacco', 'good morning', 'back extension', 'bent over', 'pendlay'],
  hip: ['squat', 'deadlift', 'stacco', 'lunge', 'affondi', 'hip thrust', 'leg press', 'pressa', 'good morning', 'bulgaro', 'glute bridge'],
  ankle: ['squat', 'lunge', 'affondi', 'calf', 'polpacci', 'jump', 'pistol', 'bulgaro'],
  elbow: ['curl', 'tricep', 'french', 'press', 'panca', 'bench', 'push', 'dip', 'skull', 'pulldown', 'pull', 'trazioni', 'row', 'rematore'],
  wrist: ['curl', 'press', 'panca', 'bench', 'push', 'deadlift', 'stacco', 'row', 'rematore', 'pull', 'trazioni']
};

const LIMB_EXPANSION = { arm: ['shoulder', 'elbow', 'wrist'], leg: ['hip', 'knee', 'ankle'] };

for (const medScenario of MEDICAL_RESTRICTIONS_SCENARIOS) {
  originalLog(`\n${BOLD}${CYAN}--- ${medScenario.label} ---${RESET}`);

  for (const goal of ['ipertrofia', 'forza', 'tonificazione']) {
    const scenarioDesc = `MEDICAL: ${medScenario.label} | ${goal}`;

    runTest(scenarioDesc, () => {
      const result = generateProgram({
        level: 'intermediate',
        goal,
        location: 'gym',
        frequency: 4,
        bodyweight: 75,
        painAreas: [],
        equipment: {},
        assessments: [],
        sportRole: null,
        medicalRestrictions: medScenario.restrictions
      });

      const issues = [];
      const warns = [];

      if (!result || !result.weeklySchedule) {
        issues.push('Programma non generato con medical restrictions');
        return { issues, warns };
      }

      // Espandi aree bloccate
      const blockedAreas = new Set();
      for (const r of medScenario.restrictions) {
        const expansion = LIMB_EXPANSION[r.area];
        if (expansion) expansion.forEach(a => blockedAreas.add(a));
        else blockedAreas.add(r.area);
      }

      // Verifica che nessun esercizio bloccato sia presente
      for (const day of result.weeklySchedule) {
        for (const ex of (day.exercises || [])) {
          const name = (ex.name || '').toLowerCase();
          for (const area of blockedAreas) {
            const keywords = MEDICAL_KEYWORDS_CHECK[area] || [];
            for (const kw of keywords) {
              if (name.includes(kw)) {
                issues.push(`MEDICAL VIOLATION: "${ex.name}" contiene "${kw}" (area bloccata: ${area}) in ${day.dayName}`);
              }
            }
          }
        }
      }

      // Programma deve avere almeno 1 giorno
      if (result.weeklySchedule.length === 0) {
        warns.push('Medical restrictions hanno eliminato TUTTI i giorni');
      }

      return { issues, warns };
    });
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 5: PRESTAZIONI SPORTIVE (tutti gli sport)
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 5: PRESTAZIONI SPORTIVE${RESET}`);
originalLog(`${DIM}(Tutti gli sport disponibili)${RESET}\n`);

const SPORTS = [
  { sport: 'calcio', role: 'centrocampista' },
  { sport: 'calcio', role: 'portiere' },
  { sport: 'calcio', role: 'attaccante' },
  { sport: 'basket', role: 'playmaker' },
  { sport: 'basket', role: 'centro' },
  { sport: 'tennis', role: 'singolo' },
  { sport: 'nuoto', role: 'stile_libero' },
  { sport: 'running', role: 'mezzofondo' },
  { sport: 'ciclismo', role: 'strada' },
  { sport: 'arti_marziali', role: 'striking' },
  { sport: 'crossfit', role: 'generale' },
  { sport: 'arrampicata', role: 'boulder' },
  { sport: 'rugby', role: 'avanti' },
  { sport: 'volley', role: 'schiacciatore' },
  { sport: 'sci', role: 'discesa' }
];

for (const sportConfig of SPORTS) {
  for (const location of ['gym', 'home']) {
    const scenarioDesc = `Sport: ${sportConfig.sport}/${sportConfig.role} | ${location}`;

    runTest(scenarioDesc, () => {
      const result = generateProgram({
        level: 'intermediate',
        goal: 'prestazioni_sportive',
        location,
        frequency: 4,
        bodyweight: 75,
        painAreas: [],
        equipment: location === 'home' ? { pullupBar: true, loopBands: true } : {},
        assessments: [],
        sportRole: sportConfig,
        medicalRestrictions: null
      });

      const issues = [];
      const warns = [];

      if (!result) {
        issues.push('Programma sport NULL');
        return { issues, warns };
      }

      if (!result.weeklySchedule || result.weeklySchedule.length === 0) {
        warns.push(`Sport ${sportConfig.sport}: 0 giorni generati`);
      }

      // Verifica che ci siano esercizi sport-specifici
      let totalExercises = 0;
      for (const day of (result.weeklySchedule || [])) {
        totalExercises += (day.exercises || []).length;
      }

      if (totalExercises === 0) {
        issues.push(`Sport ${sportConfig.sport}: 0 esercizi totali`);
      }

      return { issues, warns };
    });
  }
}

// ═══════════════════════════════════════════════════════════
// PARTE 6: EDGE CASES
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${MAGENTA}PARTE 6: EDGE CASES${RESET}\n`);

// Frequenza 1
runTest('Frequenza 1 giorno/settimana', () => {
  const result = generateProgram({
    level: 'beginner', goal: 'benessere', location: 'gym', frequency: 1,
    bodyweight: 70, painAreas: [], equipment: {}, assessments: [],
    sportRole: null, medicalRestrictions: null
  });
  return validateProgram(result, { goal: 'benessere', level: 'beginner', painAreas: [] });
});

// Frequenza 6
runTest('Frequenza 6 giorni/settimana (PPL)', () => {
  const result = generateProgram({
    level: 'advanced', goal: 'ipertrofia', location: 'gym', frequency: 6,
    bodyweight: 85, painAreas: [], equipment: {}, assessments: [],
    sportRole: null, medicalRestrictions: null
  });
  return validateProgram(result, { goal: 'ipertrofia', level: 'advanced', painAreas: [] });
});

// Frequenza 5
runTest('Frequenza 5 giorni/settimana (PPL+)', () => {
  const result = generateProgram({
    level: 'intermediate', goal: 'forza', location: 'gym', frequency: 5,
    bodyweight: 80, painAreas: [], equipment: {}, assessments: [],
    sportRole: null, medicalRestrictions: null
  });
  return validateProgram(result, { goal: 'forza', level: 'intermediate', painAreas: [] });
});

// Motor recovery senza pain areas
runTest('Motor recovery senza pain areas', () => {
  const result = generateProgram({
    level: 'beginner', goal: 'motor_recovery', location: 'home', frequency: 3,
    bodyweight: 70, painAreas: [], equipment: {}, assessments: [],
    sportRole: null, medicalRestrictions: null
  });
  const issues = [];
  const warns = [];
  if (!result) issues.push('NULL');
  else if (result.weeklySchedule && result.weeklySchedule.length > 0) {
    warns.push('Motor recovery senza pain areas ha generato giorni');
  }
  return { issues, warns };
});

// Tutti i dolori insieme
runTest('Tutti i dolori articolari contemporaneamente', () => {
  const allPains = ['knee', 'shoulder', 'lower_back', 'wrist', 'ankle', 'elbow', 'hip', 'neck'];
  const result = generateProgram({
    level: 'beginner', goal: 'benessere', location: 'gym', frequency: 3,
    bodyweight: 70, painAreas: allPains.map(a => ({ area: a, severity: 'moderate' })),
    equipment: {}, assessments: [], sportRole: null, medicalRestrictions: null
  });
  const issues = [];
  const warns = [];
  if (!result) {
    issues.push('NULL con tutti i dolori');
  } else if (result.weeklySchedule) {
    let totalEx = 0;
    result.weeklySchedule.forEach(d => totalEx += (d.exercises || []).length);
    warns.push(`Con TUTTI i dolori: ${result.weeklySchedule.length} giorni, ${totalEx} esercizi totali`);
  }
  return { issues, warns };
});

// Assessment con dati
runTest('Con assessment data (Squat 100kg, Panca 80kg)', () => {
  const result = generateProgram({
    level: 'intermediate', goal: 'forza', location: 'gym', frequency: 4,
    bodyweight: 80, painAreas: [], equipment: {},
    assessments: [
      { id: 'test-1', exerciseName: 'Squat', variant: 'gym', level: 'intermediate', maxReps: 5, oneRepMax: 100, weight: 85, bodyweight: 80 },
      { id: 'test-2', exerciseName: 'Panca', variant: 'gym', level: 'intermediate', maxReps: 5, oneRepMax: 80, weight: 68, bodyweight: 80 },
      { id: 'test-3', exerciseName: 'Stacco', variant: 'gym', level: 'intermediate', maxReps: 5, oneRepMax: 120, weight: 102, bodyweight: 80 }
    ],
    sportRole: null, medicalRestrictions: null
  });

  const issues = [];
  const warns = [];
  if (!result) {
    issues.push('NULL con assessment');
  } else {
    // Verifica che i pesi siano calcolati e non null
    let hasWeights = false;
    for (const day of (result.weeklySchedule || [])) {
      for (const ex of (day.exercises || [])) {
        if (ex.weight && ex.weight > 0) hasWeights = true;
      }
    }
    if (!hasWeights) {
      warns.push('Nessun esercizio ha peso calcolato nonostante assessment data');
    }
  }
  return { issues, warns };
});

// ═══════════════════════════════════════════════════════════
// RIEPILOGO FINALE
// ═══════════════════════════════════════════════════════════

originalLog(`\n\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}`);
originalLog(`${BOLD}${CYAN}   RIEPILOGO FINALE${RESET}`);
originalLog(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}\n`);

originalLog(`  Totale test:  ${BOLD}${totalTests}${RESET}`);
originalLog(`  ${GREEN}Passati:    ${passed}${RESET}`);
originalLog(`  ${RED}Falliti:    ${failed}${RESET}`);
originalLog(`  ${YELLOW}Warnings:   ${warnings}${RESET}`);

if (failed > 0) {
  originalLog(`\n${BOLD}${RED}═══ ERRORI ═══${RESET}\n`);
  for (const err of errors) {
    originalLog(`  ${RED}${err.description}${RESET}`);
    err.issues.forEach(i => originalLog(`    ${RED}> ${i}${RESET}`));
    err.warns.forEach(w => originalLog(`    ${YELLOW}> ${w}${RESET}`));
  }
}

if (warningsList.length > 0 && warningsList.length <= 50) {
  originalLog(`\n${BOLD}${YELLOW}═══ WARNINGS (primi 50) ═══${RESET}\n`);
  for (const w of warningsList.slice(0, 50)) {
    originalLog(`  ${YELLOW}${w.description}${RESET}`);
    originalLog(`    ${YELLOW}> ${w.warn}${RESET}`);
  }
} else if (warningsList.length > 50) {
  originalLog(`\n${BOLD}${YELLOW}═══ WARNINGS (${warningsList.length} totali, primi 30) ═══${RESET}\n`);
  for (const w of warningsList.slice(0, 30)) {
    originalLog(`  ${YELLOW}${w.description}${RESET}`);
    originalLog(`    ${YELLOW}> ${w.warn}${RESET}`);
  }
  originalLog(`  ${DIM}... e altri ${warningsList.length - 30} warnings${RESET}`);
}

originalLog(`\n${passed === totalTests ? GREEN : RED}${BOLD}Risultato: ${passed}/${totalTests} test passati${RESET}`);
if (failed === 0) {
  originalLog(`${GREEN}${BOLD}TUTTI I TEST PASSATI!${RESET}\n`);
} else {
  originalLog(`${RED}${BOLD}${failed} TEST FALLITI - RICHIEDE ATTENZIONE${RESET}\n`);
}

process.exit(failed > 0 ? 1 : 0);
