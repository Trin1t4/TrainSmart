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

export interface VolumeResult {
  sets: number;
  reps: number;
  rest: string;
  intensity: string;
  notes?: string;
}

/**
 * Calcola volume (sets/reps/rest) basato su baseline e goal
 * Sistema adattivo con logica specifica per calisthenics
 *
 * @param baselineMaxReps - Max reps ottenute nello screening
 * @param goal - Obiettivo dell'allenamento
 * @param level - Livello dell'atleta
 * @returns - Volume configuration (sets, reps, rest, intensity)
 */
export function calculateVolume(
  baselineMaxReps: number,
  goal: string,
  level: string
): VolumeResult {
  // ✅ BEGINNER: Scheda di ADATTAMENTO ANATOMICO fissa
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

  // ✅ INTERMEDIATE/ADVANCED: Sistema adattivo basato su goal
  // REGOLA CALISTHENICS: VOLUME è il re, non intensità!
  // Forza = alto volume con progressioni di difficoltà
  // Ipertrofia = volume moderato con TUT (tempo sotto tensione)
  // Endurance = volume alto con reps alte

  const workingReps = Math.max(4, Math.floor(baselineMaxReps * 0.75));

  // ✅ FORZA (Calisthenics): ALTO VOLUME, reps moderate (5-8)
  // La progressione viene da varianti più difficili, non da reps bassissime
  let sets = 4; // Default
  let reps = workingReps;
  let rest = '90s';
  let intensity = '75%';

  if (goal === 'forza' || goal === 'strength') {
    // CALISTHENICS STRENGTH: Volume alto per skill acquisition + forza
    sets = level === 'advanced' ? 6 : 5; // Più sets per pratica
    reps = Math.max(5, Math.min(workingReps, 8)); // 5-8 reps (sweet spot calisthenics)
    rest = '2-3min'; // Recupero completo ma non eccessivo
    intensity = '75%'; // Volume > Intensità nel bodyweight
  } else if (goal === 'massa' || goal === 'massa muscolare' || goal === 'muscle_gain') {
    // IPERTROFIA: Volume moderato-alto, TUT
    sets = level === 'advanced' ? 5 : 4;
    reps = Math.max(6, Math.min(workingReps, 12)); // 6-12 reps
    rest = '60-90s';
    intensity = '70-80%'; // TUT importante
  } else if (goal === 'endurance') {
    // ENDURANCE: Volume alto, reps alte, rest brevi
    sets = 4;
    reps = Math.max(12, Math.min(workingReps, 20)); // 12-20 reps
    rest = '30-45s';
    intensity = '60-70%';
  } else {
    // GENERAL FITNESS: bilanciato
    sets = 4;
    reps = Math.max(8, Math.min(workingReps, 12)); // 8-12 reps
    rest = '60-90s';
    intensity = '70%';
  }

  return { sets, reps, rest, intensity };
}

export interface ProgramGeneratorOptions {
  level: Level;
  goal: Goal;
  location: 'gym' | 'home';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  equipment?: any;
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

  console.log('🎯 GENERAZIONE PROGRAMMA BASELINE-AWARE + EQUIPMENT-AWARE');
  console.log('📍 Location:', location);
  console.log('🏋️ Training Type:', trainingType);
  console.log('🔧 Equipment:', equipment);
  console.log('📊 Baselines dallo screening:', baselines);
  console.log('🩹 Dolori validati:', painAreas);

  // ✅ COSTRUISCI ESERCIZI BASATI SU BASELINE
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
    const volumeCalc = calculateVolume(baselineReps, goal, level);

    // Usa la STESSA variante dello screening (non più difficile!)
    let exerciseName = baseline.variantName;
    let finalSets = volumeCalc.sets;
    let finalReps = volumeCalc.reps;
    let painNotes = '';
    let wasReplaced = false;

    // ✅ GESTIONE DOLORI: Controlla conflitti con zone doloranti
    for (const painEntry of painAreas) {
      const painArea = painEntry.area;
      const severity = painEntry.severity;

      if (isExerciseConflicting(exerciseName, painArea)) {
        console.log(`⚠️ Conflitto: ${exerciseName} carica zona dolente: ${painArea} (${severity})`);

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

    // ✅ CONVERSIONE A MACCHINE (se palestra con trainingType === 'machines')
    let machineNotes = '';
    if (location === 'gym' && trainingType === 'machines') {
      const originalExercise = exerciseName;
      exerciseName = convertToMachineVariant(exerciseName);

      if (exerciseName !== originalExercise) {
        machineNotes = `Convertito a macchina guidata: ${originalExercise} → ${exerciseName}`;
        console.log(`🏋️ ${machineNotes}`);
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

    console.log(`✅ ${exerciseName}: ${finalSets}x${finalReps} @ ${volumeCalc.intensity} ${painNotes ? '(⚠️ ' + painNotes + ')' : ''}`);
  });

  // ✅ AGGIUNGI ESERCIZI CORRETTIVI per zone doloranti
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
  // Import dinamico per evitare circular dependencies
  const { generateWeeklySplit } = require('./weeklySplitGenerator');

  console.log('🎯 GENERAZIONE PROGRAMMA CON SPLIT INTELLIGENTE');
  console.log('📍 Location:', options.location);
  console.log('🏋️ Training Type:', options.trainingType);
  console.log('📊 Frequenza:', options.frequency);

  // Genera split settimanale
  const weeklySplit = generateWeeklySplit({
    level: options.level,
    goal: options.goal,
    location: options.location,
    trainingType: options.trainingType,
    frequency: options.frequency,
    baselines: options.baselines,
    painAreas: options.painAreas
  });

  console.log(`✅ Split generato: ${weeklySplit.splitName}`);
  console.log(`📅 Giorni di allenamento: ${weeklySplit.days.length}`);

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
