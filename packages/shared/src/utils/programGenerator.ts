/**
 * Program Generator
 * Core logic per generazione programmi baseline-aware
 */

import { Level, Goal, PatternBaselines, Exercise, Program } from '../types';
import {
  isExerciseConflicting,
  applyPainDeload,
  findSafeAlternative,
  getCorrectiveExercises
} from './painManagement';
import { convertToMachineVariant } from './exerciseMapping';
import { NormalizedPainArea } from './validators';
import { generateWeeklySplit } from './weeklySplitGenerator';

export interface VolumeResult {
  sets: number;
  reps: number;
  rest: string;
  intensity: string;
  notes?: string;
}

/**
 * Calcola volume (sets/reps/rest) basato su baseline, goal e dayType
 * Sistema DUP (Daily Undulating Periodization) per variare stimoli
 *
 * @param baselineMaxReps - Max reps ottenute nello screening
 * @param goal - Obiettivo dell'allenamento
 * @param level - Livello dell'atleta
 * @param location - Gym o home (default: gym)
 * @param dayType - Tipo di giorno: 'heavy' (intensità), 'volume' (ipertrofia), 'moderate' (misto)
 * @returns - Volume configuration (sets, reps, rest, intensity)
 */
export function calculateVolume(
  baselineMaxReps: number,
  goal: string,
  level: string,
  location: 'gym' | 'home' = 'gym',
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
): VolumeResult {
  // BEGINNER: Scheda di ADATTAMENTO ANATOMICO fissa
  // 3x10 @ 65% del massimale, rest 90s
  // Focus: imparare tecnica, costruire base, prevenire infortuni
  if (level === 'beginner') {
    const workingReps = Math.max(8, Math.min(Math.floor(baselineMaxReps * 0.65), 10));

    return {
      sets: 3,
      reps: workingReps, // Target 10 reps, ma max 65% della baseline
      rest: '90s',
      intensity: '65%', // Percentuale del massimale
      notes: 'Adattamento Anatomico - Focus sulla tecnica'
    };
  }

  // INTERMEDIATE/ADVANCED: Sistema DUP (Daily Undulating Periodization)
  // Ogni giorno ha intensità/volume diversi per stimoli ottimali
  // Heavy = forza/intensità | Volume = ipertrofia | Moderate = misto

  const workingReps = Math.max(4, Math.floor(baselineMaxReps * 0.75));
  let sets = 4;
  let reps = workingReps;
  let rest = '90s';
  let intensity = '75%';
  let notes = '';

  // ========================================
  // STRENGTH (forza)
  // ========================================
  if (goal === 'forza' || goal === 'strength') {
    if (location === 'gym') {
      // GYM STRENGTH - Volume basato su livello
      // Beginner: 3 sets (9 sets/week), Intermediate: 4 (12/week), Advanced: 5 (15/week)
      if (dayType === 'heavy') {
        if (level === 'beginner') {
          sets = 3;
        } else if (level === 'intermediate') {
          sets = 4;
        } else { // advanced
          sets = 5;
        }
        reps = Math.max(3, Math.min(workingReps, 5)); // 3-5 reps
        rest = '3-5min';
        intensity = '85-90%';
        notes = 'Heavy Day - Forza massimale';
      } else if (dayType === 'volume') {
        sets = level === 'beginner' ? 3 : 4;
        reps = Math.max(10, Math.min(workingReps, 15)); // 10-15 reps (VERO VOLUME!)
        rest = '90-120s';
        intensity = '65-70%';
        notes = 'Volume Day - Ipertrofia + work capacity';
      } else { // moderate
        sets = level === 'beginner' ? 3 : 4;
        reps = Math.max(5, Math.min(workingReps, 6)); // 5-6 reps (forza richiede basse reps!)
        rest = '2-3min';
        intensity = '75-80%';
        notes = 'Moderate Day - Forza submassimale';
      }
    } else {
      // CALISTHENICS STRENGTH
      if (dayType === 'heavy') {
        sets = level === 'advanced' ? 6 : 5;
        reps = Math.max(3, Math.min(workingReps, 6)); // 3-6 reps
        rest = '2-3min';
        intensity = '80-85%';
        notes = 'Heavy Day - Skill strength';
      } else if (dayType === 'volume') {
        sets = 5;
        reps = Math.max(10, Math.min(workingReps, 15)); // 10-15 reps (VERO VOLUME!)
        rest = '90s';
        intensity = '60-70%';
        notes = 'Volume Day - Work capacity';
      } else { // moderate
        sets = 5;
        reps = Math.max(5, Math.min(workingReps, 6)); // 5-6 reps (forza!)
        rest = '90-120s';
        intensity = '70-75%';
        notes = 'Moderate Day - Forza submassimale';
      }
    }
  }
  // ========================================
  // HYPERTROPHY (ipertrofia/massa)
  // ========================================
  else if (goal === 'massa' || goal === 'massa muscolare' || goal === 'muscle_gain' || goal === 'ipertrofia') {
    // HYPERTROPHY - Volume alto, basato su livello
    // Beginner: 3-4 sets (10-15 sets/week), Intermediate: 4-5 (15-22/week), Advanced: 5-6 (20-28/week)
    if (dayType === 'heavy') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 5;
      }
      // 6 o 8 reps - mai 7 (numeri "puliti" per ipertrofia)
      reps = workingReps <= 6 ? 6 : 8;
      rest = '90-120s';
      intensity = '80-85%';
      notes = 'Heavy Day - Tensione meccanica';
    } else if (dayType === 'volume') {
      if (level === 'beginner') {
        sets = 4;
      } else if (level === 'intermediate') {
        sets = 5;
      } else { // advanced
        sets = 6;
      }
      reps = Math.max(10, Math.min(workingReps, 15)); // 10-15 reps
      rest = '60-75s';
      intensity = '65-70%';
      notes = 'Volume Day - Stress metabolico';
    } else { // moderate
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 5;
      }
      reps = Math.max(8, Math.min(workingReps, 12)); // 8-12 reps
      rest = '75-90s';
      intensity = '70-80%';
      notes = 'Moderate Day - Ipertrofia classica';
    }
  }
  // ========================================
  // FAT LOSS (tonificazione/dimagrimento)
  // ========================================
  else if (goal === 'fat_loss' || goal === 'tonificazione' || goal === 'dimagrimento' || goal === 'definizione') {
    // FAT LOSS - Volume moderato-alto con rest brevi per consumo calorico
    // Beginner: 3 sets, Intermediate: 4, Advanced: 4-5
    if (dayType === 'heavy') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(8, Math.min(workingReps, 10)); // 8-10 reps
      rest = '75-90s';
      intensity = '75-80%';
      notes = 'Heavy Day - Preservazione massa';
    } else if (dayType === 'volume') {
      if (level === 'beginner') {
        sets = 4;
      } else if (level === 'intermediate') {
        sets = 5;
      } else { // advanced
        sets = 5;
      }
      reps = Math.max(12, Math.min(workingReps, 15)); // 12-15 reps
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Volume Day - Consumo calorico';
    } else { // moderate
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(10, Math.min(workingReps, 12)); // 10-12 reps
      rest = '60-75s';
      intensity = '70-75%';
      notes = 'Moderate Day - Definizione';
    }
  }
  // ========================================
  // ENDURANCE (resistenza)
  // ========================================
  else if (goal === 'endurance' || goal === 'resistenza') {
    // ENDURANCE - Volume moderato con reps alte e rest brevi
    // Beginner: 3 sets, Intermediate: 4, Advanced: 4-5
    if (dayType === 'heavy') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(12, Math.min(workingReps, 15)); // 12-15 reps
      rest = '60s';
      intensity = '65-70%';
      notes = 'Heavy Day - Forza resistente';
    } else if (dayType === 'volume') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 5;
      }
      reps = Math.max(15, Math.min(workingReps, 20)); // 15-20 reps
      rest = '30-45s';
      intensity = '55-65%';
      notes = 'Volume Day - Capacità aerobica';
    } else { // moderate
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(12, Math.min(workingReps, 18)); // 12-18 reps
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Moderate Day - Endurance muscolare';
    }
  }
  // ========================================
  // GENERAL FITNESS
  // ========================================
  else if (goal === 'general_fitness') {
    // GENERAL FITNESS - Volume moderato bilanciato
    // Beginner: 3 sets, Intermediate: 4, Advanced: 4
    if (dayType === 'heavy') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(6, Math.min(workingReps, 10)); // 6-10 reps
      rest = '90s';
      intensity = '75-80%';
      notes = 'Heavy Day - Forza generale';
    } else if (dayType === 'volume') {
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(10, Math.min(workingReps, 15)); // 10-15 reps
      rest = '60-75s';
      intensity = '65-75%';
      notes = 'Volume Day - Fitness generale';
    } else { // moderate
      if (level === 'beginner') {
        sets = 3;
      } else if (level === 'intermediate') {
        sets = 4;
      } else { // advanced
        sets = 4;
      }
      reps = Math.max(8, Math.min(workingReps, 12)); // 8-12 reps
      rest = '75-90s';
      intensity = '70-78%';
      notes = 'Moderate Day - Bilanciato';
    }
  }
  // ========================================
  // BENESSERE (DUP leggera - wellness focus)
  // ========================================
  else if (goal === 'benessere' || goal === 'wellness') {
    // BENESSERE - DUP leggera: variazione minima, focus su movimento e recupero
    // Intensità più basse, rest più lunghi, enfasi su qualità del movimento
    if (dayType === 'heavy') {
      sets = 3;
      reps = Math.max(8, Math.min(workingReps, 10)); // 8-10 reps
      rest = '90-120s';
      intensity = '65-70%';
      notes = 'Forza leggera - Focus tecnica e controllo';
    } else if (dayType === 'volume') {
      sets = 3;
      reps = Math.max(12, Math.min(workingReps, 15)); // 12-15 reps
      rest = '75-90s';
      intensity = '55-65%';
      notes = 'Volume moderato - Movimento fluido';
    } else { // moderate
      sets = 3;
      reps = Math.max(10, Math.min(workingReps, 12)); // 10-12 reps
      rest = '90s';
      intensity = '60-68%';
      notes = 'Bilanciato - Benessere generale';
    }
  }
  // ========================================
  // SPECIAL GOALS (NO DUP - approccio specifico)
  // ========================================
  else if (goal === 'sport_performance' || goal === 'prestazioni_sportive') {
    // Sport-specific: Forza esplosiva + resistenza specifica
    sets = 4;
    reps = Math.max(6, Math.min(workingReps, 10));
    rest = '90-120s';
    intensity = '70-80%';
    notes = 'Allenamento sport-specifico';
  } else if (goal === 'motor_recovery' || goal === 'recupero_motorio') {
    // RECUPERO MOTORIO: Sistema PAIN-AWARE per algie croniche e post-fisioterapia
    // Target: lombalgia, post-ACL, tendinopatie, tutte le algie
    // Feedback dolore (0-10) regna sovrano e adatta automaticamente

    // Parametri base conservativi (sistema li adatta in base a dolore)
    sets = 2; // Partenza conservativa, sistema aumenta se dolore 0-3
    reps = Math.max(8, Math.min(workingReps, 10)); // Range controllato
    rest = '150-180s'; // Rest lunghi per recupero completo
    intensity = '40-60%'; // Intensità bassa, focus qualità movimento

    notes = `🩹 RECUPERO MOTORIO - Sistema PAIN-AWARE attivo:
• Dolore 0-3 → Continua normale, progressione graduale
• Dolore 4-6 → Riduzione carico/reps automatica
• Dolore 7+ → Stop esercizio, contatta fisioterapista
• Focus: tecnica perfetta, movimento controllato, propriocezione
• ASCOLTA IL TUO CORPO - il dolore guida il programma`;
  } else if (goal === 'pre_partum' || goal === 'gravidanza') {
    // PRE-PARTUM: Sistema level-aware per donne allenate
    // ⚠️ IMPORTANTE: Se beginner (mai fatto pesi) → NON iniziare in gravidanza

    if (level === 'beginner') {
      // BEGINNER: NON dovrebbe allenarsi con pesi in gravidanza
      // Sistema fornisce programma molto blando solo se insiste
      sets = 2;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '120s';
      intensity = '40-50%';
      notes = '⚠️ PRE-PARTUM BEGINNER: Non iniziare allenamento con pesi in gravidanza senza esperienza pregressa. Consulta medico e personal trainer specializzato. Programma solo mobility/bodyweight leggero.';
    } else if (level === 'intermediate') {
      // INTERMEDIATE: Allenata, può continuare con adattamenti
      sets = 3;
      reps = Math.max(8, Math.min(workingReps, 12));
      rest = '120-150s'; // Rest più lunghi
      intensity = '55-65%';
      notes = 'Pre-Partum INTERMEDIATE - MANTENIMENTO (no progressioni carico). Evita supino dopo 1° trimestre, respira sempre (no Valsalva). Stop se malessere.';
    } else {
      // ADVANCED: Esperta, può allenarsi con intensità più alta
      sets = dayType === 'heavy' ? 4 : 3;
      reps = Math.max(6, Math.min(workingReps, 10)); // Può fare anche forza
      rest = '150-180s'; // Rest lunghi per recupero completo
      intensity = '60-75%'; // Fino a 75% se sta bene
      notes = 'Pre-Partum ADVANCED - MANTENIMENTO (no progressioni carico). Donna allenata può continuare con intensità controllata. Evita supino, respira sempre, stop se sintomi. Clearance medica necessaria.';
    }
  } else if (goal === 'post_partum') {
    // POST-PARTUM: Sistema level-aware con focus su recupero
    // Timing: beginner 6+ settimane, intermediate 8+, advanced 12+ con clearance

    if (level === 'beginner') {
      // BEGINNER: Focus su pavimento pelvico e core
      sets = 2;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '90-120s';
      intensity = '40-50%';
      notes = 'Post-Partum BEGINNER (6+ settimane) - Focus pavimento pelvico e core profondo. Respirazione diaframmatica. Progressione molto graduale. Clearance medica necessaria.';
    } else if (level === 'intermediate') {
      // INTERMEDIATE: Può aumentare intensità gradualmente
      sets = 3;
      reps = Math.max(10, Math.min(workingReps, 12));
      rest = '120-150s';
      intensity = '55-65%';
      notes = 'Post-Partum INTERMEDIATE (8+ settimane) - MANTENIMENTO. Focus stabilità core e prevenzione diastasi. Check pavimento pelvico prima di aumentare carico.';
    } else {
      // ADVANCED: Può riprendere allenamento intenso con cautela
      sets = 3;
      reps = Math.max(6, Math.min(workingReps, 10));
      rest = '150-180s';
      intensity = '60-75%'; // Fino a 75% se recupero completo
      notes = 'Post-Partum ADVANCED (12+ settimane) - MANTENIMENTO. Donna allenata può riprendere intensità. Verifica diastasi e pavimento pelvico OK prima di heavy lifting. Clearance medica necessaria.';
    }
  } else if (goal === 'disability' || goal === 'disabilita') {
    // DISABILITÀ: Adattamenti individualizzati, focus su capacità residue
    // Tempi di recupero generosi, progressione molto graduale
    sets = 2;
    reps = Math.max(6, Math.min(workingReps, 10));
    rest = '120-180s';
    intensity = '50-65%';
    notes = 'Adattato - Focus su capacità funzionali';
  }
  // ========================================
  // DEFAULT FALLBACK
  // ========================================
  else {
    sets = 4;
    reps = Math.max(8, Math.min(workingReps, 12));
    rest = '75-90s';
    intensity = '70%';
    notes = 'Programma generale';
  }

  return { sets, reps, rest, intensity, notes };
}

export interface ProgramGeneratorOptions {
  level: Level;
  goal: Goal;
  goals?: string[]; // Multi-goal support (max 3)
  location: 'gym' | 'home';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  equipment?: any;
  muscularFocus?: string; // glutei, addome, petto, dorso, spalle, gambe, braccia, polpacci
  sessionDuration?: number; // Durata sessione disponibile in minuti (15, 20, 30, 45, 60, 90)
}

/**
 * Genera programma personalizzato baseline-aware
 * DEPRECATO: Usare generateProgramWithSplit() per split intelligenti
 *
 * @param options - Configurazione completa per generazione programma
 * @returns - Programma completo con esercizi e correttivi
 */
export function generateProgram(options: ProgramGeneratorOptions): Omit<Program, 'created_at'> {
  const { level, goal, location, trainingType, frequency, baselines, painAreas, equipment } = options;

  console.log('GENERAZIONE PROGRAMMA BASELINE-AWARE + EQUIPMENT-AWARE');
  console.log('Location:', location);
  console.log('Training Type:', trainingType);
  console.log('Equipment:', equipment);
  console.log('Baselines dallo screening:', baselines);
  console.log('Dolori validati:', painAreas);

  // COSTRUISCI ESERCIZI BASATI SU BASELINE
  const exercises: Exercise[] = [];

  // Pattern mapping: pattern_id → exercise name
  const patternMap = {
    lower_push: baselines.lower_push,
    horizontal_push: baselines.horizontal_push,
    vertical_push: baselines.vertical_push,
    vertical_pull: baselines.vertical_pull,
    lower_pull: baselines.lower_pull,
    core: baselines.core
  };

  // Per ogni pattern, crea esercizio basato su baseline + gestione dolori
  Object.entries(patternMap).forEach(([patternId, baseline]: [string, any]) => {
    if (!baseline) return;

    // Calcola sets/reps basati su baseline E goal
    const baselineReps = baseline.reps;
    const volumeCalc = calculateVolume(baselineReps, goal, level, location);

    // Usa la STESSA variante dello screening (non più difficile!)
    let exerciseName = baseline.variantName;
    let finalSets = volumeCalc.sets;
    let finalReps = volumeCalc.reps;
    let painNotes = '';
    let wasReplaced = false;

    // GESTIONE DOLORI: Controlla conflitti con zone doloranti
    for (const painEntry of painAreas) {
      const painArea = painEntry.area;
      const severity = painEntry.severity;

      if (isExerciseConflicting(exerciseName, painArea)) {
        console.log(`Warning: Conflitto: ${exerciseName} carica zona dolente: ${painArea} (${severity})`);

        // Applica deload basato su severità
        const deload = applyPainDeload(severity, finalSets, finalReps, location);

        finalSets = deload.sets;
        finalReps = deload.reps;
        painNotes = deload.note;

        // Se dolore severo o moderato casa → sostituisci esercizio
        if (deload.needsReplacement || (deload.needsEasierVariant && location === 'home')) {
          const alternative = findSafeAlternative(exerciseName, painArea, severity);
          exerciseName = alternative;
          wasReplaced = true;
          painNotes = `${painNotes} | Sostituito da ${baseline.variantName}`;
        }

        break; // Un solo dolore per volta (il primo trovato)
      }
    }

    // CONVERSIONE A MACCHINE (se palestra con trainingType === 'machines')
    let machineNotes = '';
    if (location === 'gym' && trainingType === 'machines') {
      const originalExercise = exerciseName;
      exerciseName = convertToMachineVariant(exerciseName);

      if (exerciseName !== originalExercise) {
        machineNotes = `Convertito a macchina guidata: ${originalExercise} -> ${exerciseName}`;
        console.log(`${machineNotes}`);
      }
    }

    exercises.push({
      pattern: patternId as any,
      name: exerciseName,
      sets: finalSets,
      reps: finalReps,
      rest: volumeCalc.rest,
      intensity: volumeCalc.intensity,
      baseline: {
        variantId: baseline.variantId,
        difficulty: baseline.difficulty,
        maxReps: baselineReps
      },
      wasReplaced: wasReplaced,
      notes: [
        volumeCalc.notes,
        `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
        painNotes,
        machineNotes
      ].filter(Boolean).join(' | ')
    });

    console.log(`${exerciseName}: ${finalSets}x${finalReps} @ ${volumeCalc.intensity} ${painNotes ? '(Warning: ' + painNotes + ')' : ''}`);
  });

  // AGGIUNGI ESERCIZI CORRETTIVI per zone doloranti
  const correctiveExercises: Exercise[] = [];
  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const correctives = getCorrectiveExercises(painArea);

    for (const corrective of correctives) {
      correctiveExercises.push({
        pattern: 'corrective',
        name: corrective,
        sets: 2,
        reps: '10-15',
        rest: '30s',
        intensity: 'Low',
        notes: `Correttivo per ${painArea} - Eseguire con focus sulla qualità`
      });
    }
  }

  // Aggiungi correttivi alla fine del programma
  exercises.push(...correctiveExercises);

  // Determina split basato su frequenza
  let split = 'FULL BODY';
  if (frequency >= 5) split = 'PUSH/PULL/LEGS';
  else if (frequency >= 4) split = 'UPPER/LOWER';
  else if (frequency >= 3) split = 'FULL BODY A/B';

  return {
    name: `Programma ${level.toUpperCase()} - ${goal}`,
    split: split,
    exercises: exercises,
    level,
    goal,
    frequency,
    notes: `Programma personalizzato basato sulle TUE baseline. Parti da dove sei realmente, non da template generici.`
  };
}

/**
 * NUOVA FUNZIONE - Genera programma con split intelligente
 * Sistema avanzato con giorni diversi e varianti
 *
 * @param options - Configurazione completa per generazione programma
 * @returns - Programma completo con split settimanale
 */
export function generateProgramWithSplit(options: ProgramGeneratorOptions): any {
  // generateWeeklySplit is now imported at the top of the file

  console.log('GENERAZIONE PROGRAMMA CON SPLIT INTELLIGENTE');
  console.log('Location:', options.location);
  console.log('Training Type:', options.trainingType);
  console.log('Frequenza:', options.frequency);

  // Multi-goal support logging
  if (options.goals && options.goals.length > 1) {
    console.log('Multi-goal:', options.goals.join(' + '));
    console.log('Distribuzione volume:', options.goals.length === 2 ? '70-30' : '40-30-30');
  }

  // Muscular Focus System
  if (options.muscularFocus) {
    console.log('Focus Muscolare:', options.muscularFocus.toUpperCase());
    console.log('   -> Volume aumentato per esercizi target');
    console.log('   -> Esercizi di isolamento aggiunti');
    console.log('   -> Focus esercizi posizionati all\'inizio');
  }

  // Genera split settimanale con muscular focus e multi-goal
  const weeklySplit = generateWeeklySplit({
    level: options.level,
    goal: options.goal,
    goals: options.goals, // Multi-goal support
    location: options.location,
    trainingType: options.trainingType,
    frequency: options.frequency,
    baselines: options.baselines,
    painAreas: options.painAreas,
    muscularFocus: options.muscularFocus, // Pass muscular focus to generator
    sessionDuration: options.sessionDuration // Pass session duration for time adaptation
  });

  console.log(`Split generato: ${weeklySplit.splitName}`);
  console.log(`Giorni di allenamento: ${weeklySplit.days.length}`);

  // Converte in formato Program compatibile con backend
  // Appiattisci tutti gli esercizi per compatibilità
  const allExercises: Exercise[] = [];
  weeklySplit.days.forEach(day => {
    allExercises.push(...day.exercises);
  });

  return {
    name: `Programma ${options.level.toUpperCase()} - ${options.goal}`,
    split: weeklySplit.splitName,
    exercises: allExercises,
    level: options.level,
    goal: options.goal,
    frequency: options.frequency,
    notes: `${weeklySplit.description}\n\nProgramma personalizzato basato sulle TUE baseline. Ogni giorno ha esercizi diversi per stimoli ottimali.`,
    weeklySplit: weeklySplit // Dati completi dello split
  };
}
