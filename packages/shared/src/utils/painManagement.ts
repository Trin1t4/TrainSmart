/**
 * Pain Management System
 * Gestione intelligente dolori/infortuni con:
 * - Deload progressivo basato su severità
 * - Sostituzione gerarchica esercizi
 * - Esercizi correttivi per recupero
 */

import { PainArea, PainSeverity } from '../types';

export interface PainExerciseMapping {
  avoid: string[];
  substitutions: Record<string, string[]>;
  correctives: string[];
}

/**
 * Mappa zone doloranti → gerarchie di sostituzione progressive
 * Le alternative sono ordinate dalla PIÙ SIMILE alla PIÙ CONSERVATIVA
 */
export const PAIN_EXERCISE_MAP: Record<PainArea, PainExerciseMapping> = {
  knee: {
    avoid: ['pistol', 'jump', 'bulgarian'],
    // GERARCHIA: mantieni pattern unilaterale → bilaterale → catena posteriore
    substitutions: {
      // Pistol Squat patterns
      'pistol': ['Affondi', 'Squat Completo', 'Glute Bridge'],
      'pistol assistito': ['Affondi', 'Squat Completo', 'Glute Bridge'],
      'pistol squat': ['Affondi', 'Squat Completo', 'Glute Bridge'],

      // Jump patterns
      'jump': ['Step Up', 'Squat Completo', 'Glute Bridge'],
      'jump squat': ['Step Up', 'Squat Completo', 'Glute Bridge'],

      // Squat patterns (solo se dolore moderato/severo)
      'squat': ['Goblet Squat', 'Box Squat', 'Glute Bridge'],
      'bulgarian': ['Affondi', 'Step Up', 'Glute Bridge'],
      'lunge': ['Step Up', 'Squat Completo', 'Glute Bridge']
    },
    correctives: ['Knee Mobility Circles', 'VMO Activation', 'Wall Sit Isometric', 'Quad Stretch']
  },

  lower_back: {
    avoid: ['good_morning'], // Solo good morning è sempre da evitare
    substitutions: {
      // GERARCHIA: mild → moderate → severe
      // mild: stesso pattern, carico ridotto (deload gestito separatamente)
      // moderate: pattern simile ma più sicuro (meno ROM, meno carico assiale)
      // severe: pattern completamente diverso (no carico sulla colonna)

      'stacco': ['RDL (ROM ridotto)', 'Hip Hinge Isometrico', 'Glute Bridge'],
      'deadlift': ['RDL (ROM ridotto)', 'Hip Hinge Isometrico', 'Glute Bridge'],
      'good morning': ['Hip Hinge Leggero', 'Bird Dog', 'Glute Bridge'],
      'rdl': ['RDL (ROM ridotto)', 'Hip Hinge Isometrico', 'Glute Bridge'],
      'hip hinge': ['Hip Hinge (ROM ridotto)', 'Hip Hinge Isometrico', 'Glute Bridge'],

      // Squat: riduzione ROM prima, poi cambio pattern
      'squat': ['Box Squat (Parallelo)', 'Box Squat (Alto)', 'Leg Press']
    },
    correctives: ['Cat-Cow', 'Bird Dog', 'Dead Bug', 'Pelvic Tilt', 'McGill Big 3']
  },

  shoulder: {
    avoid: ['hspu', 'handstand', 'overhead'],
    substitutions: {
      // Vertical push progressions
      'hspu': ['Pike Push-up', 'Incline Push-up', 'Push-up Standard'],
      'handstand': ['Pike Push-up', 'Incline Push-up', 'Push-up Standard'],
      'pike push': ['Incline Pike Push-up', 'Incline Push-up', 'Push-up Standard'],

      // Overhead patterns
      'overhead': ['Landmine Press', 'Floor Press', 'Push-up Standard'],
      'military press': ['Landmine Press', 'Floor Press', 'Push-up'],
      'press': ['Landmine Press', 'Floor Press', 'Push-up'],

      // Horizontal push (se dolore moderato)
      'push-up': ['Incline Push-up', 'Wall Push-up', 'Isometric Hold']
    },
    correctives: ['Shoulder Dislocations', 'Band Pull-Aparts', 'Face Pulls', 'YTW', 'Wall Slides']
  },

  wrist: {
    avoid: ['hspu', 'planche', 'push_up_standard'],
    substitutions: {
      'hspu': ['Pike su Pugni', 'Parallettes Pike', 'Dips'],
      'handstand': ['Handstand su Pugni', 'Parallettes', 'Dips'],
      'planche': ['Parallettes Lean', 'Dips', 'Ring Push-up'],
      'push-up': ['Knuckle Push-up', 'Parallettes Push-up', 'Dips'],
      'push up': ['Knuckle Push-up', 'Parallettes Push-up', 'Dips']
    },
    correctives: ['Wrist Circles', 'Wrist Flexion/Extension', 'Finger Flexion', 'Forearm Stretch']
  },

  ankle: {
    avoid: ['jump', 'sprint', 'pistol'],
    substitutions: {
      'jump': ['Step Up', 'Box Step', 'Squat'],
      'sprint': ['Walking Lunges', 'Step Up', 'Squat'],
      'calf raise': ['Seated Calf Raise', 'Isometric Calf Hold'],
      'pistol': ['Squat Completo', 'Goblet Squat', 'Leg Press']
    },
    correctives: ['Ankle Circles', 'Dorsiflexion Stretch', 'Calf Stretch', 'Ankle Mobility Drills']
  },

  elbow: {
    avoid: ['pull-up', 'chin-up', 'bicep_curl'],
    substitutions: {
      'pull-up': ['Assisted Pull-up', 'Inverted Row', 'Lat Pulldown'],
      'chin-up': ['Assisted Chin-up', 'Inverted Row', 'Lat Pulldown'],
      'bicep curl': ['Isometric Hold', 'Eccentric Only', 'Band Curl Leggero']
    },
    correctives: ['Elbow Circles', 'Forearm Stretch', 'Bicep/Tricep Stretch', 'Golfer Elbow Rehab']
  },

  hip: {
    avoid: ['squat', 'lunge', 'pistol'],
    substitutions: {
      'squat': ['Box Squat', 'Goblet Squat', 'Leg Press'],
      'lunge': ['Step Up', 'Split Squat', 'Leg Press'],
      'pistol': ['Squat Assistito', 'Goblet Squat', 'Leg Press']
    },
    correctives: ['Hip Circles', 'Pigeon Stretch', 'Hip Flexor Stretch', 'Glute Activation']
  },

  neck: {
    avoid: ['overhead', 'hspu', 'shrug'],
    substitutions: {
      'overhead': ['Landmine Press', 'Floor Press', 'Push-up'],
      'military press': ['Landmine Press', 'Floor Press', 'Push-up'],
      'shrug': ['Face Pull', 'Band Pull-Apart', 'Reverse Fly'],
      'pull-up': ['Lat Pulldown', 'Inverted Row', 'Seated Row']
    },
    correctives: ['Neck Stretches', 'Chin Tucks', 'Upper Trap Release', 'Levator Scapulae Stretch']
  }
};

export interface DeloadResult {
  sets: number;
  reps: number;
  loadReduction: number;
  needsReplacement?: boolean;
  needsEasierVariant?: boolean;
  note: string;
}

/**
 * Applica deload basato su intensità dolore
 * @param severity - 'mild' | 'moderate' | 'severe'
 * @param sets - sets originali
 * @param reps - reps originali
 * @param location - 'gym' | 'home'
 * @returns - sets/reps/load modificati
 */
export function applyPainDeload(
  severity: PainSeverity,
  sets: number,
  reps: number,
  location: 'gym' | 'home' | 'home_gym'
): DeloadResult {
  const hasWeights = location === 'gym' || location === 'home_gym';
  if (severity === 'mild') {
    // MILD (1-3): Deload leggero, continua con cautela
    // Stesso esercizio, volume/intensità ridotti, monitora
    return {
      sets: sets,
      reps: Math.max(3, Math.floor(reps * 0.85)), // -15% reps
      loadReduction: hasWeights ? 0.85 : 1.0, // -15% kg se gym/home_gym
      needsReplacement: false,
      needsEasierVariant: false,
      note: '⚠️ Dolore lieve - Deload applicato, monitora durante esecuzione'
    };
  } else if (severity === 'moderate') {
    // MODERATE: Tecnicamente non più usato (4+ = severe)
    // Manteniamo per backward compatibility con dati esistenti
    return {
      sets: Math.max(2, sets - 1),
      reps: Math.max(3, Math.floor(reps * 0.7)),
      loadReduction: hasWeights ? 0.70 : 1.0,
      needsReplacement: true, // Ora anche moderate = evita
      needsEasierVariant: true,
      note: '🛑 Dolore moderato - Esercizio sostituito per sicurezza'
    };
  } else if (severity === 'severe') {
    // SEVERE (4+): EVITA esercizio
    // Dolore 4+ pre-sessione = campanello d'allarme, non rischiare
    return {
      sets: Math.max(2, Math.floor(sets * 0.5)), // Sets ridotti per l'alternativa
      reps: Math.max(5, Math.floor(reps * 0.6)), // Reps ridotte per l'alternativa
      loadReduction: hasWeights ? 0.5 : 1.0,
      needsReplacement: true, // EVITA - sostituisci con esercizio sicuro
      needsEasierVariant: true,
      note: '🛑 EVITA - Dolore significativo, esercizio sostituito + correttivi'
    };
  }

  return { sets, reps, loadReduction: 1.0, note: '' };
}

/**
 * Controlla se esercizio carica zona dolorante
 */
export function isExerciseConflicting(exerciseName: string, painArea: PainArea): boolean {
  const avoidKeywords = PAIN_EXERCISE_MAP[painArea]?.avoid || [];
  const nameLower = exerciseName.toLowerCase();
  return avoidKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Trova alternativa sicura per esercizio usando GERARCHIA PROGRESSIVA
 * @param originalExercise - Nome esercizio originale
 * @param painArea - Zona dolente
 * @param severity - Severità dolore (mild/moderate/severe)
 * @returns - Nome alternativa appropriata
 */
export function findSafeAlternative(
  originalExercise: string,
  painArea: PainArea,
  severity: PainSeverity
): string {
  const substitutions = PAIN_EXERCISE_MAP[painArea]?.substitutions || {};
  const exerciseLower = originalExercise.toLowerCase();

  // Trova la chiave che matcha l'esercizio
  let matchedKey: string | null = null;
  for (const key of Object.keys(substitutions)) {
    if (exerciseLower.includes(key.toLowerCase())) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    console.warn(`Warning: Nessuna sostituzione trovata per: ${originalExercise}`);
    return originalExercise;
  }

  const alternatives = substitutions[matchedKey];

  // GERARCHIA BASATA SU SEVERITÀ:
  // - mild: prova PRIMA alternativa (più simile)
  // - moderate: prova SECONDA alternativa (intermedia)
  // - severe: vai ULTIMA alternativa (più conservativa)

  let index = 0;
  if (severity === 'moderate') {
    index = Math.min(1, alternatives.length - 1);
  } else if (severity === 'severe') {
    index = alternatives.length - 1; // Ultima (più conservativa)
  }

  const alternative = alternatives[index];
  console.log(`Sostituzione (${severity}): ${originalExercise} -> ${alternative}`);

  return alternative;
}

/**
 * Ottieni esercizi correttivi per zona dolente
 */
export function getCorrectiveExercises(painArea: PainArea): string[] {
  return PAIN_EXERCISE_MAP[painArea]?.correctives || [];
}
