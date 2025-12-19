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

  // ═══════════════════════════════════════════════════════════════════════════
  // GINOCCHIO: 4 varianti in base al test
  // ═══════════════════════════════════════════════════════════════════════════

  // KNEE_FLEXION: Dolore quando pieghi il ginocchio (squat profondo, leg curl)
  knee_flexion: {
    avoid: ['pistol', 'sissy squat'],
    substitutions: {
      'squat': ['Box Squat (alto)', 'Leg Press (ROM limitato)', 'Wall Sit'],
      'leg curl': ['Hip Thrust', 'Glute Bridge', 'Cable Pull Through'],  // NO flessione ginocchio
      'lunge': ['Step Up (basso)', 'Split Squat (parziale)', 'Glute Bridge'],
      'bulgarian': ['Step Up (basso)', 'Hip Thrust', 'Glute Bridge'],
      'pistol': ['Box Squat', 'Leg Press', 'Glute Bridge']
    },
    correctives: ['Quad Stretch', 'Foam Roll Quad', 'Terminal Knee Extension', 'Wall Sit Isometric']
  },

  // KNEE_EXTENSION: Dolore quando estendi il ginocchio (leg extension, calci)
  knee_extension: {
    avoid: ['leg extension', 'sissy squat'],
    substitutions: {
      'leg extension': ['Wall Sit Isometric', 'Spanish Squat', 'Step Down Eccentric'],
      'squat': ['Box Squat', 'Goblet Squat', 'Leg Press'],
      'lunge': ['Reverse Lunge', 'Step Up', 'Hip Thrust'],
      'jump': ['Box Step Up', 'Sled Push', 'Glute Bridge']
    },
    correctives: ['VMO Activation', 'Terminal Knee Extension (leggero)', 'Patellar Mobilization', 'Hamstring Stretch']
  },

  // KNEE_LOAD: Dolore sotto carico assiale (squat pesante, salti, corsa)
  knee_load: {
    avoid: ['jump', 'pistol', 'sprint'],
    substitutions: {
      'squat': ['Leg Press', 'Leg Extension + Leg Curl', 'Belt Squat'],
      'lunge': ['Leg Press', 'Step Up (basso)', 'Glute Bridge'],
      'jump': ['Box Step Up', 'Sled Push', 'Bike/Ellittica'],
      'deadlift': ['Romanian DL', 'Hip Thrust', 'Cable Pull Through'],
      'running': ['Bike', 'Ellittica', 'Rowing (leggero)']
    },
    correctives: ['Knee Circles', 'Wall Sit', 'Step Down Eccentric', 'Glute Activation']
  },

  // KNEE: Dolore generico o multipli movimenti
  knee: {
    avoid: ['pistol', 'jump', 'sissy squat'],
    substitutions: {
      'squat': ['Leg Press', 'Belt Squat', 'Hip Thrust'],
      'lunge': ['Leg Press', 'Hip Thrust', 'Glute Bridge'],
      'leg extension': ['Wall Sit Isometric', 'Spanish Squat', 'Glute Bridge'],
      'leg curl': ['Romanian Deadlift', 'Hip Thrust', 'Glute Bridge'],
      'jump': ['Sled Push', 'Bike', 'Glute Bridge'],
      'pistol': ['Leg Press', 'Hip Thrust', 'Glute Bridge'],
      'bulgarian': ['Leg Press', 'Hip Thrust', 'Glute Bridge']
    },
    correctives: ['Knee Circles', 'VMO Activation', 'Wall Sit', 'Quad/Hamstring Stretch']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANCA: 5 varianti in base al test
  // ═══════════════════════════════════════════════════════════════════════════

  // HIP_FLEXION: Dolore quando porti il ginocchio al petto
  hip_flexion: {
    avoid: ['sit-up', 'v-up', 'leg raise'],
    substitutions: {
      'squat': ['Box Squat (alto)', 'Leg Press (ROM limitato)', 'Belt Squat'],
      'lunge': ['Step Up', 'Hip Thrust', 'Glute Bridge'],
      'sit-up': ['Plank', 'Dead Bug', 'Bird Dog'],
      'leg raise': ['Plank', 'Dead Bug', 'Pallof Press'],
      'deadlift': ['Romanian DL (parziale)', 'Hip Thrust', 'Cable Pull Through'],
      'rowing': ['Lat Pulldown', 'Cable Row (in piedi)', 'Face Pull']
    },
    correctives: ['Hip Flexor Stretch', 'Couch Stretch', 'Pigeon Pose', 'Psoas Release']
  },

  // HIP_EXTENSION: Dolore quando porti la gamba indietro
  hip_extension: {
    avoid: ['good morning', 'back extension'],
    substitutions: {
      'hip thrust': ['Glute Bridge (isometrico)', 'Clamshell', 'Cable Kickback (leggero)'],
      'glute bridge': ['Clamshell', 'Side Lying Hip Abduction', 'Isometric Bridge'],
      'deadlift': ['Leg Curl', 'Leg Press', 'Squat'],
      'romanian': ['Leg Curl', 'Seated Leg Curl', 'Lying Leg Curl'],
      'back extension': ['Bird Dog', 'Plank', 'Dead Bug'],
      'lunge': ['Squat', 'Leg Press', 'Step Up']
    },
    correctives: ['Glute Stretch', 'Piriformis Stretch', 'Hip Circles', 'Cat-Cow']
  },

  // HIP_ABDUCTION: Dolore quando allarghi la gamba
  hip_abduction: {
    avoid: ['sumo squat', 'side lunge'],
    substitutions: {
      'sumo squat': ['Squat standard', 'Leg Press', 'Goblet Squat'],
      'sumo deadlift': ['Conventional Deadlift', 'Romanian DL', 'Trap Bar DL'],
      'side lunge': ['Forward Lunge', 'Reverse Lunge', 'Step Up'],
      'hip abduction': ['Clamshell (leggero)', 'Glute Bridge', 'Monster Walk (leggero)'],
      'cable abduction': ['Glute Bridge', 'Hip Thrust', 'Clamshell']
    },
    correctives: ['Adductor Stretch', 'Frog Stretch', 'Butterfly Stretch', 'Foam Roll Adductors']
  },

  // HIP_ROTATION: Dolore in rotazione (piriforme)
  hip_rotation: {
    avoid: ['pigeon pose'],
    substitutions: {
      'squat': ['Box Squat', 'Leg Press', 'Goblet Squat (piedi paralleli)'],
      'lunge': ['Split Squat (dritto)', 'Step Up', 'Leg Press'],
      'deadlift': ['Trap Bar DL', 'Romanian DL', 'Leg Press'],
      'hip circle': ['Hip Flexor Stretch', 'Glute Bridge', 'Clamshell']
    },
    correctives: ['Piriformis Stretch', '90/90 Stretch', 'Supine Twist (leggero)', 'Glute Foam Roll']
  },

  // HIP: Dolore generico o multipli
  hip: {
    avoid: ['pistol', 'sumo squat', 'good morning'],
    substitutions: {
      'squat': ['Leg Press', 'Belt Squat', 'Goblet Squat'],
      'lunge': ['Leg Press', 'Step Up (basso)', 'Glute Bridge'],
      'deadlift': ['Leg Press', 'Leg Curl', 'Romanian DL (leggero)'],
      'hip thrust': ['Glute Bridge (isometrico)', 'Clamshell', 'Leg Press'],
      'pistol': ['Leg Press', 'Box Squat', 'Glute Bridge']
    },
    correctives: ['Hip Circles', 'Hip Flexor Stretch', 'Piriformis Stretch', '90/90 Mobility']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLONNA LOMBARE: 5 varianti in base al test
  // ═══════════════════════════════════════════════════════════════════════════

  // LOWER_BACK_FLEXION: Dolore quando ti pieghi in avanti
  lower_back_flexion: {
    avoid: ['good morning', 'jefferson curl', 'sit-up'],
    substitutions: {
      'deadlift': ['Trap Bar DL', 'Rack Pull', 'Hip Thrust'],
      'romanian': ['Hip Thrust', 'Cable Pull Through', 'Glute Bridge'],
      'barbell row': ['Chest Supported Row', 'Machine Row', 'Cable Row'],
      'sit-up': ['Plank', 'Dead Bug', 'Pallof Press'],
      'crunch': ['Plank', 'Bird Dog', 'Dead Bug']
    },
    correctives: ['Cat-Cow (focus estensione)', 'McKenzie Press Up', 'Prone Cobra', 'Bird Dog']
  },

  // LOWER_BACK_EXTENSION: Dolore in iperestensione
  lower_back_extension: {
    avoid: ['back extension', 'superman', 'cobra'],
    substitutions: {
      'back extension': ['Plank', 'Dead Bug', 'Bird Dog'],
      'superman': ['Bird Dog', 'Dead Bug', 'Plank'],
      'overhead press': ['Landmine Press', 'Seated Press (supportato)', 'Cable Press'],
      'hip thrust': ['Glute Bridge', 'Clamshell', 'Banded Hip Thrust']
    },
    correctives: ['Cat-Cow (focus flessione)', 'Knee to Chest', "Child's Pose", 'Pelvic Tilt']
  },

  // LOWER_BACK_LOAD: Dolore sotto carico assiale
  lower_back_load: {
    avoid: ['good morning'],
    substitutions: {
      'squat': ['Leg Press', 'Belt Squat', 'Hack Squat'],
      'deadlift': ['Leg Curl + Hip Thrust', 'Romanian DL (leggero)', 'Cable Pull Through'],
      'barbell row': ['Chest Supported Row', 'Machine Row', 'Seated Cable Row'],
      'overhead press': ['Seated Press (supportato)', 'Machine Press', 'Landmine Press'],
      'lunge': ['Leg Press', 'Split Squat (supportato)', 'Step Up']
    },
    correctives: ['McGill Big 3', 'Dead Bug', 'Bird Dog', 'Pallof Press']
  },

  // LOWER_BACK_ROTATION: Dolore in torsione
  lower_back_rotation: {
    avoid: ['russian twist', 'wood chop'],
    substitutions: {
      'russian twist': ['Pallof Press', 'Plank', 'Dead Bug'],
      'wood chop': ['Pallof Press', 'Anti-Rotation Press', 'Plank'],
      'cable rotation': ['Pallof Press', 'Plank with Shoulder Tap', 'Bird Dog'],
      'oblique crunch': ['Side Plank', 'Pallof Press', 'Dead Bug']
    },
    correctives: ['Cat-Cow', 'Supine Twist (controllato)', 'Open Book', 'Thread the Needle']
  },

  // LOWER_BACK: Dolore generico o multipli
  lower_back: {
    avoid: ['good_morning'],
    substitutions: {
      'squat': ['Leg Press', 'Belt Squat', 'Leg Extension + Leg Curl'],
      'deadlift': ['Leg Curl', 'Hip Thrust', 'Glute Bridge'],
      'romanian': ['Leg Curl', 'Hip Thrust', 'Glute Bridge'],
      'stacco': ['Leg Curl', 'Hip Thrust', 'Glute Bridge'],
      'barbell row': ['Chest Supported Row', 'Machine Row', 'Cable Row'],
      'good morning': ['Glute Bridge', 'Bird Dog', 'Hip Thrust']
    },
    correctives: ['Cat-Cow', 'Bird Dog', 'Dead Bug', 'McGill Big 3', 'Pelvic Tilt']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAVIGLIA: 4 varianti in base al test
  // ═══════════════════════════════════════════════════════════════════════════

  // ANKLE_DORSIFLEXION: Dolore quando porti il piede verso lo stinco
  ankle_dorsiflexion: {
    avoid: ['deep squat', 'pistol'],
    substitutions: {
      'squat': ['Box Squat (talloni rialzati)', 'Leg Press', 'Hack Squat'],
      'lunge': ['Reverse Lunge', 'Step Up', 'Split Squat (tallone rialzato)'],
      'pistol': ['Leg Press', 'Box Squat', 'Belt Squat'],
      'calf stretch': ['Foam Roll Calf', 'Self Massage', 'Seated Calf Stretch']
    },
    correctives: ['Ankle Circles', 'Calf Foam Roll', 'Banded Ankle Distraction', 'Wall Ankle Mobilization']
  },

  // ANKLE_PLANTARFLEXION: Dolore quando punti il piede
  ankle_plantarflexion: {
    avoid: ['box jump', 'sprint'],
    substitutions: {
      'calf raise': ['Seated Calf Raise (leggero)', 'Tibialis Raise', 'Ankle Isometric'],
      'jump': ['Step Up', 'Sled Push', 'Bike'],
      'sprint': ['Bike', 'Ellittica', 'Walking'],
      'running': ['Bike', 'Ellittica', 'Pool Running']
    },
    correctives: ['Ankle Circles', 'Achilles Stretch (delicato)', 'Eccentric Calf Lower', 'Tibialis Raise']
  },

  // ANKLE_STABILITY: Problemi di stabilità (inversione/eversione)
  ankle_stability: {
    avoid: ['pistol', 'single leg'],
    substitutions: {
      'single leg squat': ['Squat bilaterale', 'Leg Press', 'Smith Machine Squat'],
      'pistol': ['Leg Press', 'Squat', 'Belt Squat'],
      'lunge': ['Squat', 'Leg Press', 'Step Up (con supporto)'],
      'step up': ['Leg Press', 'Squat', 'Hack Squat'],
      'single leg deadlift': ['Romanian DL (bilaterale)', 'Leg Curl', 'Hip Thrust']
    },
    correctives: ['Ankle Alphabet', 'Balance Board (seduto)', 'Banded Ankle Eversion/Inversion', 'Single Leg Balance (supportato)']
  },

  // ANKLE: Dolore generico o multipli
  ankle: {
    avoid: ['jump', 'sprint', 'pistol'],
    substitutions: {
      'squat': ['Leg Press', 'Belt Squat', 'Hack Squat'],
      'lunge': ['Leg Press', 'Step Up (basso)', 'Split Squat (supportato)'],
      'calf raise': ['Seated Calf Raise', 'Tibialis Raise', 'Ankle Isometric'],
      'jump': ['Sled Push', 'Bike', 'Ellittica'],
      'pistol': ['Leg Press', 'Belt Squat', 'Hack Squat'],
      'sprint': ['Bike', 'Ellittica', 'Rowing']
    },
    correctives: ['Ankle Circles', 'Calf Stretch', 'Ankle Mobilization', 'Tibialis Raise']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPALLA: 4 varianti in base al test "Fa male overhead/spinta/rotazione?"
  // ═══════════════════════════════════════════════════════════════════════════

  // SHOULDER_OVERHEAD: Dolore solo su movimenti sopra la testa (impingement tipico)
  shoulder_overhead: {
    avoid: ['hspu', 'handstand'],
    substitutions: {
      'shoulder press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'overhead press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'military press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'arnold press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'pike push': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      'hspu': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      'handstand': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      'snatch': ['Kettlebell Swing', 'Hip Hinge', 'Deadlift'],
      'thruster': ['Front Squat', 'Goblet Squat', 'Leg Press']
    },
    correctives: ['Band Pull-Aparts', 'Face Pulls', 'YTW', 'Wall Slides']
  },

  // SHOULDER_PUSH: Dolore su spinte orizzontali (panca, push-up, dips)
  shoulder_push: {
    avoid: [],
    substitutions: {
      'bench press': ['Floor Press', 'Svend Press', 'Cable Fly'],
      'chest press': ['Floor Press', 'Svend Press', 'Cable Fly'],
      'push-up': ['Wall Push-up', 'Eccentric Push-up', 'Isometric Hold'],
      'dips': ['Tricep Pushdown', 'Close Grip Floor Press', 'Diamond Push-up'],
      'fly': ['Cable Fly (ROM ridotto)', 'Pec Deck (ROM ridotto)', 'Svend Press'],
      'incline press': ['Floor Press', 'Low Incline Press', 'Cable Fly']
    },
    correctives: ['Pec Minor Stretch', 'Doorway Stretch', 'Band Pull-Aparts', 'Thoracic Extension']
  },

  // SHOULDER_ROTATION: Dolore su rotazioni (cuffia dei rotatori)
  shoulder_rotation: {
    avoid: ['cuban rotation', 'scarecrow'],
    substitutions: {
      'external rotation': ['Isometric External Rotation', 'Band Pull-Aparts', 'Face Pull'],
      'internal rotation': ['Isometric Internal Rotation', 'Band Pull-Aparts', 'Face Pull'],
      'cuban rotation': ['Face Pull', 'Band Pull-Aparts', 'YTW'],
      'scarecrow': ['Face Pull', 'Band Pull-Aparts', 'YTW'],
      'arm circle': ['Shoulder Shrugs', 'Band Pull-Aparts', 'Face Pull']
    },
    correctives: ['Sleeper Stretch', 'Cross Body Stretch', 'Pendulum Circles', 'Isometric Rotations']
  },

  // SHOULDER: Dolore generico o su tutti i movimenti
  shoulder: {
    avoid: ['hspu', 'handstand'],
    substitutions: {
      // Overhead
      'shoulder press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'overhead press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'military press': ['Lateral Raise Machine', 'Cable Lateral Raise', 'Face Pull'],
      'pike push': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      'hspu': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      'handstand': ['Incline Push-up', 'Push-up Standard', 'Chest Press Machine'],
      // Horizontal push
      'bench press': ['Floor Press', 'Svend Press', 'Cable Fly'],
      'push-up': ['Wall Push-up', 'Eccentric Push-up', 'Isometric Hold'],
      'dips': ['Tricep Pushdown', 'Close Grip Floor Press', 'Diamond Push-up'],
      // Rotation
      'external rotation': ['Isometric Hold', 'Band Pull-Aparts', 'Face Pull'],
      'internal rotation': ['Isometric Hold', 'Band Pull-Aparts', 'Face Pull']
    },
    correctives: ['Band Pull-Aparts', 'Face Pulls', 'YTW', 'Wall Slides', 'Pendulum Circles']
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

  // ═══════════════════════════════════════════════════════════════════════════
  // GOMITO: 3 varianti in base al test "Fa male tirare o spingere?"
  // ═══════════════════════════════════════════════════════════════════════════

  // ELBOW_PULL: Dolore solo su movimenti di TIRATA (epicondilite laterale tipica)
  // Esercizi coinvolti: curl, pull-up, row, qualsiasi flessione gomito sotto carico
  elbow_pull: {
    avoid: [],
    substitutions: {
      'pull-up': ['Lat Pulldown (presa larga)', 'Straight Arm Pulldown', 'Machine Row'],
      'chin-up': ['Lat Pulldown (presa larga)', 'Straight Arm Pulldown', 'Machine Row'],
      'bicep curl': ['Hammer Curl (leggero)', 'Band Curl Leggero', 'Isometric Hold'],
      'curl': ['Hammer Curl (leggero)', 'Band Curl Leggero', 'Isometric Hold'],
      'barbell row': ['Machine Row', 'Chest Supported Row', 'Cable Row (presa neutra)'],
      'dumbbell row': ['Machine Row', 'Chest Supported Row', 'Cable Row (presa neutra)']
    },
    correctives: ['Wrist Extensor Stretch', 'Eccentric Wrist Extension', 'Forearm Pronation/Supination']
  },

  // ELBOW_PUSH: Dolore solo su movimenti di SPINTA (epicondilite mediale tipica)
  // Esercizi coinvolti: french press, dips, push-up, tricep extension
  elbow_push: {
    avoid: [],
    substitutions: {
      'french press': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'skull crusher': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'tricep extension': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'overhead extension': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'dips': ['Tricep Pushdown (cable)', 'Close Grip Bench Press', 'Push-up'],
      'close grip bench': ['Tricep Pushdown (cable)', 'Push-up', 'Cable Chest Press']
    },
    correctives: ['Wrist Flexor Stretch', 'Eccentric Wrist Flexion', 'Forearm Supination']
  },

  // ELBOW: Dolore su ENTRAMBI i movimenti (o non specificato)
  // Sostituisce sia tirate che spinte
  elbow: {
    avoid: [],
    substitutions: {
      // Pulling
      'pull-up': ['Lat Pulldown (presa larga)', 'Straight Arm Pulldown', 'Machine Row'],
      'chin-up': ['Lat Pulldown (presa larga)', 'Straight Arm Pulldown', 'Machine Row'],
      'bicep curl': ['Hammer Curl (leggero)', 'Band Curl Leggero', 'Isometric Hold'],
      'curl': ['Hammer Curl (leggero)', 'Band Curl Leggero', 'Isometric Hold'],
      'barbell row': ['Machine Row', 'Chest Supported Row', 'Cable Row (presa neutra)'],
      'dumbbell row': ['Machine Row', 'Chest Supported Row', 'Cable Row (presa neutra)'],
      // Pushing
      'french press': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'skull crusher': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'tricep extension': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'overhead extension': ['Tricep Pushdown (cable)', 'Tricep Kickback', 'Diamond Push-up (leggero)'],
      'dips': ['Tricep Pushdown (cable)', 'Close Grip Bench Press', 'Push-up']
    },
    correctives: ['Wrist Flexor Stretch', 'Wrist Extensor Stretch', 'Forearm Pronation/Supination']
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
    // MODERATE (5-6/10): Dolore attivo - NO forza, SI volume/recupero
    // Sostituisci esercizio + AUMENTA reps (lavoro leggero ad alto volume)
    return {
      sets: 3,
      reps: 12, // Reps ALTE per volume/recupero, non forza
      loadReduction: hasWeights ? 0.50 : 1.0, // -50% carico
      needsReplacement: true,
      needsEasierVariant: true,
      note: '⚠️ Adattamento dolore: volume leggero invece di forza'
    };
  } else if (severity === 'severe') {
    // SEVERE (7+): Dolore significativo - lavoro minimo, focus recupero
    return {
      sets: 2,
      reps: 15, // Reps molto alte, carico minimo
      loadReduction: hasWeights ? 0.40 : 1.0, // -60% carico
      needsReplacement: true,
      needsEasierVariant: true,
      note: '🛑 Dolore elevato: esercizio sostituito, lavoro di recupero'
    };
  }

  return { sets, reps, loadReduction: 1.0, note: '' };
}

/**
 * Controlla se esercizio carica zona dolorante
 * Verifica sia la lista avoid che le chiavi delle substitutions
 * @param exerciseName - Nome esercizio
 * @param painArea - Zona dolente
 * @param severity - Severità dolore (opzionale, default = controlla tutto)
 * @returns true se l'esercizio è in conflitto con la zona dolente
 */
export function isExerciseConflicting(
  exerciseName: string,
  painArea: PainArea,
  severity?: PainSeverity
): boolean {
  const mapping = PAIN_EXERCISE_MAP[painArea];
  if (!mapping) return false;

  const nameLower = exerciseName.toLowerCase();

  // 1. Controlla lista avoid (sempre da evitare)
  const avoidKeywords = mapping.avoid || [];
  if (avoidKeywords.some(keyword => nameLower.includes(keyword))) {
    return true;
  }

  // 2. Per dolore moderato/severe, controlla anche le substitutions
  // Questi esercizi non sono "vietati" ma richiedono sostituzione
  if (severity === 'moderate' || severity === 'severe' || !severity) {
    const substitutionKeys = Object.keys(mapping.substitutions || {});
    if (substitutionKeys.some(key => nameLower.includes(key.toLowerCase()))) {
      return true;
    }
  }

  return false;
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAPPATURA ESERCIZI → TIPO MOVIMENTO (per dolore gomito)
// ═══════════════════════════════════════════════════════════════════════════════

export type ElbowMovementType = 'pull' | 'push' | 'neutral';

/**
 * Mappa parole chiave esercizi → tipo di movimento per il gomito
 * PULL = flessione gomito sotto carico (bicipiti, tirate)
 * PUSH = estensione gomito sotto carico (tricipiti, spinte)
 * NEUTRAL = non stressa significativamente il gomito
 */
export const ELBOW_MOVEMENT_MAP: Record<string, ElbowMovementType> = {
  // ═══ PULL (flessione gomito) ═══
  'curl': 'pull',
  'bicep': 'pull',
  'hammer curl': 'pull',
  'preacher': 'pull',
  'concentration': 'pull',
  'pull-up': 'pull',
  'pullup': 'pull',
  'chin-up': 'pull',
  'chinup': 'pull',
  'row': 'pull',
  'rowing': 'pull',
  'lat pulldown': 'pull',
  'pulldown': 'pull',
  'face pull': 'pull',
  'upright row': 'pull',
  'shrug': 'pull',  // coinvolge presa

  // ═══ PUSH (estensione gomito) ═══
  'french press': 'push',
  'skull crusher': 'push',
  'tricep extension': 'push',
  'tricep pushdown': 'push',
  'pushdown': 'push',
  'kickback': 'push',
  'overhead extension': 'push',
  'dips': 'push',
  'dip': 'push',
  'close grip': 'push',
  'bench press': 'push',
  'push-up': 'push',
  'pushup': 'push',
  'push up': 'push',
  'chest press': 'push',
  'shoulder press': 'push',
  'overhead press': 'push',
  'military press': 'push',
  'incline press': 'push',
  'decline press': 'push',
  'floor press': 'push',
  'jm press': 'push',

  // ═══ NEUTRAL (non stressa gomito) ═══
  'squat': 'neutral',
  'deadlift': 'neutral',
  'leg press': 'neutral',
  'leg curl': 'neutral',
  'leg extension': 'neutral',
  'lunge': 'neutral',
  'hip thrust': 'neutral',
  'glute': 'neutral',
  'calf': 'neutral',
  'plank': 'neutral',
  'crunch': 'neutral',
  'lateral raise': 'neutral',
  'front raise': 'neutral',
  'fly': 'neutral',
  'pec deck': 'neutral'
};

/**
 * Determina il tipo di movimento di un esercizio rispetto al gomito
 */
export function getElbowMovementType(exerciseName: string): ElbowMovementType {
  const nameLower = exerciseName.toLowerCase();

  for (const [keyword, movementType] of Object.entries(ELBOW_MOVEMENT_MAP)) {
    if (nameLower.includes(keyword)) {
      return movementType;
    }
  }

  // Default: neutral se non riconosciuto
  return 'neutral';
}

/**
 * Verifica se un esercizio è in conflitto con un tipo specifico di dolore al gomito
 */
export function isElbowConflict(
  exerciseName: string,
  elbowPainType: 'elbow_pull' | 'elbow_push' | 'elbow'
): boolean {
  const movementType = getElbowMovementType(exerciseName);

  if (movementType === 'neutral') return false;

  switch (elbowPainType) {
    case 'elbow_pull':
      return movementType === 'pull';
    case 'elbow_push':
      return movementType === 'push';
    case 'elbow':
      return movementType === 'pull' || movementType === 'push';
    default:
      return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPPATURA ESERCIZI → TIPO MOVIMENTO SPALLA
// ═══════════════════════════════════════════════════════════════════════════════

export type ShoulderMovementType = 'overhead' | 'horizontal_push' | 'horizontal_pull' | 'rotation' | 'neutral';

/**
 * Mappa parole chiave esercizi → tipo di movimento per la spalla
 * OVERHEAD = braccio sopra la testa (più stressante per impingement)
 * HORIZONTAL_PUSH = spinta orizzontale (panca, push-up)
 * HORIZONTAL_PULL = tirata orizzontale (row)
 * ROTATION = rotazioni interne/esterne (problematiche per cuffia)
 */
export const SHOULDER_MOVEMENT_MAP: Record<string, ShoulderMovementType> = {
  // ═══ OVERHEAD (molto stressante) ═══
  'shoulder press': 'overhead',
  'overhead press': 'overhead',
  'military press': 'overhead',
  'push press': 'overhead',
  'arnold press': 'overhead',
  'behind neck': 'overhead',
  'hspu': 'overhead',
  'handstand': 'overhead',
  'pike push': 'overhead',
  'snatch': 'overhead',
  'jerk': 'overhead',
  'thruster': 'overhead',
  'overhead': 'overhead',

  // ═══ HORIZONTAL PUSH ═══
  'bench press': 'horizontal_push',
  'chest press': 'horizontal_push',
  'push-up': 'horizontal_push',
  'pushup': 'horizontal_push',
  'push up': 'horizontal_push',
  'dips': 'horizontal_push',
  'dip': 'horizontal_push',
  'floor press': 'horizontal_push',
  'incline press': 'horizontal_push',
  'decline press': 'horizontal_push',
  'fly': 'horizontal_push',
  'pec deck': 'horizontal_push',
  'cable crossover': 'horizontal_push',

  // ═══ HORIZONTAL PULL ═══
  'row': 'horizontal_pull',
  'rowing': 'horizontal_pull',
  'face pull': 'horizontal_pull',
  'rear delt': 'horizontal_pull',
  'reverse fly': 'horizontal_pull',
  'pull-apart': 'horizontal_pull',

  // ═══ ROTATION (problematico per cuffia dei rotatori) ═══
  'cuban rotation': 'rotation',
  'external rotation': 'rotation',
  'internal rotation': 'rotation',
  'scarecrow': 'rotation',
  'rotator cuff': 'rotation',
  'l-fly': 'rotation',
  'shoulder rotation': 'rotation',
  'arm circle': 'rotation',

  // ═══ LATERAL (relativamente sicuro) ═══
  'lateral raise': 'neutral',  // può essere problematico ma meno di overhead
  'front raise': 'neutral',
  'upright row': 'horizontal_pull',  // può causare impingement

  // ═══ NEUTRAL ═══
  'pulldown': 'neutral',  // verticale ma in trazione
  'pull-up': 'neutral',
  'lat pulldown': 'neutral',
  'shrug': 'neutral'
};

/**
 * Determina il tipo di movimento di un esercizio rispetto alla spalla
 */
export function getShoulderMovementType(exerciseName: string): ShoulderMovementType {
  const nameLower = exerciseName.toLowerCase();

  for (const [keyword, movementType] of Object.entries(SHOULDER_MOVEMENT_MAP)) {
    if (nameLower.includes(keyword)) {
      return movementType;
    }
  }

  return 'neutral';
}

/**
 * Verifica se un esercizio è in conflitto con un tipo specifico di dolore alla spalla
 * @param exerciseName - Nome esercizio
 * @param shoulderPainTypes - Array di tipi movimento che causano dolore
 */
export function isShoulderConflict(
  exerciseName: string,
  shoulderPainTypes: ShoulderMovementType[]
): boolean {
  const movementType = getShoulderMovementType(exerciseName);
  return shoulderPainTypes.includes(movementType);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE AL GOMITO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test per determinare il tipo di dolore al gomito
 * Da usare durante onboarding/screening quando l'utente segnala dolore al gomito
 */
export interface ElbowPainTest {
  pullPainLevel: number;  // 0-10: dolore su movimento di TIRATA
  pushPainLevel: number;  // 0-10: dolore su movimento di SPINTA
}

export interface ElbowTestInstructions {
  pullTest: {
    name: string;
    instructions: string;
    demo?: string;
  };
  pushTest: {
    name: string;
    instructions: string;
    demo?: string;
  };
}

/**
 * Istruzioni per i test del gomito da mostrare all'utente
 */
export const ELBOW_TEST_INSTRUCTIONS: ElbowTestInstructions = {
  pullTest: {
    name: 'Test Tirata (Bicipite)',
    instructions: `
1. Stai in piedi con un braccio lungo il fianco
2. Piega il gomito portando la mano verso la spalla (come un curl)
3. Opponi resistenza con l'altra mano mentre pieghi
4. Valuta il dolore da 0 a 10

Dolore tipico: parte ESTERNA del gomito (epicondilite laterale)
    `.trim(),
    demo: 'bicep_curl_test.gif'
  },
  pushTest: {
    name: 'Test Spinta (Tricipite)',
    instructions: `
1. Metti la mano su un tavolo o muro
2. Spingi verso il basso/avanti estendendo il gomito
3. Opponi resistenza mentre spingi
4. Valuta il dolore da 0 a 10

Dolore tipico: parte INTERNA del gomito (epicondilite mediale)
    `.trim(),
    demo: 'tricep_push_test.gif'
  }
};

/**
 * Determina il tipo di PainArea per il gomito in base ai risultati del test
 * @param testResult - Risultati del test tirata/spinta
 * @returns - 'elbow_pull' | 'elbow_push' | 'elbow' (entrambi)
 */
export function determineElbowPainType(testResult: ElbowPainTest): PainArea {
  const { pullPainLevel, pushPainLevel } = testResult;

  const hasPullPain = pullPainLevel >= 4;
  const hasPushPain = pushPainLevel >= 4;

  if (hasPullPain && hasPushPain) {
    // Dolore su entrambi i movimenti
    return 'elbow';
  } else if (hasPullPain) {
    // Dolore solo su tirate
    return 'elbow_pull';
  } else if (hasPushPain) {
    // Dolore solo su spinte
    return 'elbow_push';
  }

  // Dolore sotto soglia 4, nessuna area critica
  // Ritorna 'elbow' generico per sicurezza (verrà gestito come mild)
  return 'elbow';
}

/**
 * Genera il messaggio di spiegazione per l'utente in base al tipo di dolore
 */
export function getElbowPainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'elbow_pull':
      return `Il tuo dolore è principalmente sui movimenti di TIRATA (bicipiti, curl, trazioni).
Questo è tipico dell'epicondilite LATERALE (gomito del tennista).
Gli esercizi di tirata saranno adattati, mentre le spinte rimangono normali.`;

    case 'elbow_push':
      return `Il tuo dolore è principalmente sui movimenti di SPINTA (tricipiti, french press, dips).
Questo è tipico dell'epicondilite MEDIALE (gomito del golfista).
Gli esercizi di spinta saranno adattati, mentre le tirate rimangono normali.`;

    case 'elbow':
      return `Il tuo dolore coinvolge sia i movimenti di tirata che di spinta.
Tutti gli esercizi che stressano il gomito saranno adattati per permetterti di allenarti in sicurezza.`;

    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE ALLA SPALLA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test per determinare il tipo di dolore alla spalla
 */
export interface ShoulderPainTest {
  overheadPainLevel: number;   // 0-10: dolore su movimenti SOPRA LA TESTA
  pushPainLevel: number;       // 0-10: dolore su SPINTE orizzontali
  rotationPainLevel: number;   // 0-10: dolore su ROTAZIONI
}

export interface ShoulderTestInstructions {
  overheadTest: {
    name: string;
    instructions: string;
    demo?: string;
  };
  pushTest: {
    name: string;
    instructions: string;
    demo?: string;
  };
  rotationTest: {
    name: string;
    instructions: string;
    demo?: string;
  };
}

/**
 * Istruzioni per i test della spalla
 */
export const SHOULDER_TEST_INSTRUCTIONS: ShoulderTestInstructions = {
  overheadTest: {
    name: 'Test Overhead (Sopra la testa)',
    instructions: `
1. Stai in piedi con le braccia lungo i fianchi
2. Solleva lentamente il braccio dritto davanti a te fino sopra la testa
3. Mantieni la posizione per 2 secondi
4. Valuta il dolore da 0 a 10

Dolore tipico: durante il sollevamento o nella posizione finale
    `.trim(),
    demo: 'overhead_test.gif'
  },
  pushTest: {
    name: 'Test Spinta Orizzontale',
    instructions: `
1. Mettiti di fronte a un muro a distanza di un braccio
2. Appoggia le mani al muro all'altezza delle spalle
3. Fai un push-up contro il muro spingendo con forza
4. Valuta il dolore da 0 a 10

Dolore tipico: nella parte anteriore della spalla durante la spinta
    `.trim(),
    demo: 'wall_push_test.gif'
  },
  rotationTest: {
    name: 'Test Rotazione (Cuffia)',
    instructions: `
1. Piega il gomito a 90° con il braccio lungo il fianco
2. Ruota l'avambraccio verso l'esterno (come per aprire una porta)
3. Poi ruota verso l'interno (come per chiudere)
4. Valuta il dolore da 0 a 10 sul movimento più doloroso

Dolore tipico: parte posteriore/profonda della spalla
    `.trim(),
    demo: 'rotation_test.gif'
  }
};

/**
 * Determina il tipo di PainArea per la spalla in base ai risultati del test
 */
export function determineShoulderPainType(testResult: ShoulderPainTest): PainArea {
  const { overheadPainLevel, pushPainLevel, rotationPainLevel } = testResult;

  const hasOverheadPain = overheadPainLevel >= 4;
  const hasPushPain = pushPainLevel >= 4;
  const hasRotationPain = rotationPainLevel >= 4;

  // Conta quanti tipi di dolore sono presenti
  const painCount = [hasOverheadPain, hasPushPain, hasRotationPain].filter(Boolean).length;

  if (painCount >= 2) {
    // Dolore su 2+ movimenti → generico
    return 'shoulder';
  } else if (hasOverheadPain) {
    return 'shoulder_overhead';
  } else if (hasPushPain) {
    return 'shoulder_push';
  } else if (hasRotationPain) {
    return 'shoulder_rotation';
  }

  // Dolore sotto soglia, ritorna generico
  return 'shoulder';
}

/**
 * Genera il messaggio di spiegazione per la spalla
 */
export function getShoulderPainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'shoulder_overhead':
      return `Il tuo dolore è principalmente sui movimenti SOPRA LA TESTA (shoulder press, handstand).
Questo è tipico dell'impingement subacromiale.
Gli esercizi overhead saranno sostituiti con lavoro laterale/posteriore.`;

    case 'shoulder_push':
      return `Il tuo dolore è principalmente sulle SPINTE ORIZZONTALI (panca, push-up).
Questo può indicare stress sul tendine pettorale o capsula anteriore.
Le spinte saranno modificate con ROM ridotto o sostituite.`;

    case 'shoulder_rotation':
      return `Il tuo dolore è principalmente sulle ROTAZIONI.
Questo indica stress sulla cuffia dei rotatori.
Le rotazioni saranno sostituite con isometriche leggere e esercizi di stabilizzazione.`;

    case 'shoulder':
      return `Il tuo dolore coinvolge più tipi di movimento della spalla.
Tutti gli esercizi che stressano la spalla saranno adattati per permetterti di allenarti in sicurezza.`;

    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE AL GINOCCHIO
// ═══════════════════════════════════════════════════════════════════════════════

export interface KneePainTest {
  flexionPainLevel: number;    // 0-10: dolore in FLESSIONE (piegare)
  extensionPainLevel: number;  // 0-10: dolore in ESTENSIONE (raddrizzare)
  loadPainLevel: number;       // 0-10: dolore sotto CARICO (peso)
}

export const KNEE_TEST_INSTRUCTIONS = {
  flexionTest: {
    name: 'Test Flessione',
    instructions: `
1. In piedi, piega lentamente il ginocchio portando il tallone verso il gluteo
2. Usa una mano per aiutarti se necessario
3. Valuta il dolore da 0 a 10 durante il piegamento

Dolore tipico: parte posteriore del ginocchio o rotula
    `.trim()
  },
  extensionTest: {
    name: 'Test Estensione',
    instructions: `
1. Seduto con la gamba piegata
2. Estendi lentamente la gamba raddrizzandola completamente
3. Contrai il quadricipite nella posizione finale
4. Valuta il dolore da 0 a 10

Dolore tipico: sotto la rotula o parte anteriore
    `.trim()
  },
  loadTest: {
    name: 'Test Carico',
    instructions: `
1. In piedi su una gamba sola (quella da testare)
2. Piega leggermente il ginocchio come per fare un mini-squat
3. Valuta il dolore da 0 a 10 sotto carico

Dolore tipico: dolore diffuso che aumenta col peso
    `.trim()
  }
};

export function determineKneePainType(testResult: KneePainTest): PainArea {
  const { flexionPainLevel, extensionPainLevel, loadPainLevel } = testResult;

  const hasFlexionPain = flexionPainLevel >= 4;
  const hasExtensionPain = extensionPainLevel >= 4;
  const hasLoadPain = loadPainLevel >= 4;

  const painCount = [hasFlexionPain, hasExtensionPain, hasLoadPain].filter(Boolean).length;

  if (painCount >= 2) return 'knee';
  if (hasFlexionPain) return 'knee_flexion';
  if (hasExtensionPain) return 'knee_extension';
  if (hasLoadPain) return 'knee_load';

  return 'knee';
}

export function getKneePainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'knee_flexion':
      return `Il tuo dolore è principalmente in FLESSIONE (piegare il ginocchio).
Gli esercizi con flessione profonda saranno limitati o sostituiti.`;
    case 'knee_extension':
      return `Il tuo dolore è principalmente in ESTENSIONE (raddrizzare).
Le leg extension e movimenti simili saranno sostituiti.`;
    case 'knee_load':
      return `Il tuo dolore aumenta sotto CARICO.
Gli esercizi con peso sulla colonna saranno sostituiti con macchine.`;
    case 'knee':
      return `Il tuo dolore coinvolge più movimenti del ginocchio.
Tutti gli esercizi per le gambe saranno adattati.`;
    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE ALL'ANCA
// ═══════════════════════════════════════════════════════════════════════════════

export interface HipPainTest {
  flexionPainLevel: number;    // 0-10: portare ginocchio al petto
  extensionPainLevel: number;  // 0-10: portare gamba indietro
  abductionPainLevel: number;  // 0-10: allargare la gamba
  rotationPainLevel: number;   // 0-10: ruotare l'anca
}

export const HIP_TEST_INSTRUCTIONS = {
  flexionTest: {
    name: 'Test Flessione Anca',
    instructions: `
1. Sdraiato sulla schiena
2. Porta lentamente un ginocchio verso il petto
3. Valuta il dolore da 0 a 10

Dolore tipico: parte anteriore dell'anca/inguine
    `.trim()
  },
  extensionTest: {
    name: 'Test Estensione Anca',
    instructions: `
1. In piedi, tieni una sedia per equilibrio
2. Porta lentamente la gamba indietro (senza piegare la schiena)
3. Valuta il dolore da 0 a 10

Dolore tipico: parte posteriore dell'anca/gluteo
    `.trim()
  },
  abductionTest: {
    name: 'Test Abduzione',
    instructions: `
1. In piedi, tieni una sedia per equilibrio
2. Allarga lateralmente la gamba (come per fare una spaccata laterale)
3. Valuta il dolore da 0 a 10

Dolore tipico: parte esterna dell'anca o interno coscia
    `.trim()
  },
  rotationTest: {
    name: 'Test Rotazione',
    instructions: `
1. Seduto su una sedia
2. Ruota il piede verso l'interno e poi verso l'esterno
3. Valuta il dolore da 0 a 10 sul movimento peggiore

Dolore tipico: dolore profondo nell'anca
    `.trim()
  }
};

export function determineHipPainType(testResult: HipPainTest): PainArea {
  const { flexionPainLevel, extensionPainLevel, abductionPainLevel, rotationPainLevel } = testResult;

  const hasFlexionPain = flexionPainLevel >= 4;
  const hasExtensionPain = extensionPainLevel >= 4;
  const hasAbductionPain = abductionPainLevel >= 4;
  const hasRotationPain = rotationPainLevel >= 4;

  const painCount = [hasFlexionPain, hasExtensionPain, hasAbductionPain, hasRotationPain].filter(Boolean).length;

  if (painCount >= 2) return 'hip';
  if (hasFlexionPain) return 'hip_flexion';
  if (hasExtensionPain) return 'hip_extension';
  if (hasAbductionPain) return 'hip_abduction';
  if (hasRotationPain) return 'hip_rotation';

  return 'hip';
}

export function getHipPainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'hip_flexion':
      return `Il tuo dolore è principalmente in FLESSIONE dell'anca.
Squat profondi e sit-up saranno limitati o sostituiti.`;
    case 'hip_extension':
      return `Il tuo dolore è principalmente in ESTENSIONE dell'anca.
Hip thrust e stacchi saranno sostituiti con alternative.`;
    case 'hip_abduction':
      return `Il tuo dolore è principalmente in ABDUZIONE.
Sumo squat e movimenti laterali saranno evitati.`;
    case 'hip_rotation':
      return `Il tuo dolore è principalmente in ROTAZIONE (piriforme).
Gli esercizi con rotazione dell'anca saranno limitati.`;
    case 'hip':
      return `Il tuo dolore coinvolge più movimenti dell'anca.
Tutti gli esercizi che stressano l'anca saranno adattati.`;
    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE LOMBARE
// ═══════════════════════════════════════════════════════════════════════════════

export interface LowerBackPainTest {
  flexionPainLevel: number;    // 0-10: piegarsi in avanti
  extensionPainLevel: number;  // 0-10: piegarsi indietro
  loadPainLevel: number;       // 0-10: sotto carico verticale
  rotationPainLevel: number;   // 0-10: ruotare il busto
}

export const LOWER_BACK_TEST_INSTRUCTIONS = {
  flexionTest: {
    name: 'Test Flessione Lombare',
    instructions: `
1. In piedi con le gambe dritte
2. Piegati lentamente in avanti come per toccare le punte dei piedi
3. Valuta il dolore da 0 a 10

Dolore tipico: aumenta mentre ti pieghi avanti
    `.trim()
  },
  extensionTest: {
    name: 'Test Estensione Lombare',
    instructions: `
1. In piedi con le mani sui fianchi
2. Piegati lentamente all'indietro (iperestensione)
3. Valuta il dolore da 0 a 10

Dolore tipico: aumenta mentre ti pieghi indietro
    `.trim()
  },
  loadTest: {
    name: 'Test Carico Assiale',
    instructions: `
1. In piedi, immagina di avere un peso sulle spalle
2. Premi verso il basso attraverso la colonna
3. Oppure prova un mini-squat a corpo libero
4. Valuta il dolore da 0 a 10

Dolore tipico: compressione/peso sulla schiena
    `.trim()
  },
  rotationTest: {
    name: 'Test Rotazione',
    instructions: `
1. Seduto su una sedia con i piedi fissi
2. Ruota il busto prima a destra, poi a sinistra
3. Valuta il dolore da 0 a 10 sul lato peggiore

Dolore tipico: dolore durante la torsione
    `.trim()
  }
};

export function determineLowerBackPainType(testResult: LowerBackPainTest): PainArea {
  const { flexionPainLevel, extensionPainLevel, loadPainLevel, rotationPainLevel } = testResult;

  const hasFlexionPain = flexionPainLevel >= 4;
  const hasExtensionPain = extensionPainLevel >= 4;
  const hasLoadPain = loadPainLevel >= 4;
  const hasRotationPain = rotationPainLevel >= 4;

  const painCount = [hasFlexionPain, hasExtensionPain, hasLoadPain, hasRotationPain].filter(Boolean).length;

  if (painCount >= 2) return 'lower_back';
  if (hasFlexionPain) return 'lower_back_flexion';
  if (hasExtensionPain) return 'lower_back_extension';
  if (hasLoadPain) return 'lower_back_load';
  if (hasRotationPain) return 'lower_back_rotation';

  return 'lower_back';
}

export function getLowerBackPainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'lower_back_flexion':
      return `Il tuo dolore aumenta in FLESSIONE (piegarsi avanti).
Stacchi e row saranno sostituiti con varianti supportate.`;
    case 'lower_back_extension':
      return `Il tuo dolore aumenta in ESTENSIONE (piegarsi indietro).
Back extension e superman saranno evitati.`;
    case 'lower_back_load':
      return `Il tuo dolore aumenta sotto CARICO ASSIALE.
Squat e stacchi saranno sostituiti con Leg Press e macchine.`;
    case 'lower_back_rotation':
      return `Il tuo dolore aumenta in ROTAZIONE.
Russian twist e wood chop saranno sostituiti con Pallof Press.`;
    case 'lower_back':
      return `Il tuo dolore coinvolge più movimenti della colonna.
Tutti gli esercizi che stressano la schiena saranno adattati.`;
    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SPECIFICO PER DOLORE ALLA CAVIGLIA
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnklePainTest {
  dorsiflexionPainLevel: number;   // 0-10: piede verso stinco
  plantarflexionPainLevel: number; // 0-10: puntare il piede
  stabilityPainLevel: number;      // 0-10: instabilità laterale
}

export const ANKLE_TEST_INSTRUCTIONS = {
  dorsiflexionTest: {
    name: 'Test Dorsiflessione',
    instructions: `
1. In piedi di fronte a un muro
2. Porta il ginocchio verso il muro mantenendo il tallone a terra
3. Valuta il dolore da 0 a 10 nella parte anteriore della caviglia

Dolore tipico: "blocco" o dolore davanti alla caviglia
    `.trim()
  },
  plantarflexionTest: {
    name: 'Test Plantarflessione',
    instructions: `
1. In piedi, sollevati sulle punte dei piedi
2. Mantieni la posizione per 2 secondi
3. Valuta il dolore da 0 a 10

Dolore tipico: dolore al tendine d'Achille o polpaccio
    `.trim()
  },
  stabilityTest: {
    name: 'Test Stabilità',
    instructions: `
1. In piedi su una gamba sola
2. Chiudi gli occhi per 10 secondi
3. Nota se senti instabilità o dolore laterale
4. Valuta il dolore/instabilità da 0 a 10

Dolore tipico: "cedimento" o dolore sui lati della caviglia
    `.trim()
  }
};

export function determineAnklePainType(testResult: AnklePainTest): PainArea {
  const { dorsiflexionPainLevel, plantarflexionPainLevel, stabilityPainLevel } = testResult;

  const hasDorsiflexionPain = dorsiflexionPainLevel >= 4;
  const hasPlantarflexionPain = plantarflexionPainLevel >= 4;
  const hasStabilityPain = stabilityPainLevel >= 4;

  const painCount = [hasDorsiflexionPain, hasPlantarflexionPain, hasStabilityPain].filter(Boolean).length;

  if (painCount >= 2) return 'ankle';
  if (hasDorsiflexionPain) return 'ankle_dorsiflexion';
  if (hasPlantarflexionPain) return 'ankle_plantarflexion';
  if (hasStabilityPain) return 'ankle_stability';

  return 'ankle';
}

export function getAnklePainExplanation(painType: PainArea): string {
  switch (painType) {
    case 'ankle_dorsiflexion':
      return `Il tuo dolore è principalmente in DORSIFLESSIONE.
Squat profondi saranno fatti con talloni rialzati o sostituiti.`;
    case 'ankle_plantarflexion':
      return `Il tuo dolore è principalmente in PLANTARFLESSIONE.
Calf raise e salti saranno limitati o sostituiti.`;
    case 'ankle_stability':
      return `Hai problemi di STABILITÀ della caviglia.
Esercizi su una gamba saranno sostituiti con bilaterali.`;
    case 'ankle':
      return `Il tuo dolore coinvolge più movimenti della caviglia.
Tutti gli esercizi che stressano la caviglia saranno adattati.`;
    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNZIONE GENERICA: "NON SO" → USA TIPO GENERICO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Se l'utente non sa quale movimento fa male, usa il tipo generico
 * che applica deload su TUTTI i movimenti di quel distretto
 */
export function getGenericPainType(bodyPart: string): PainArea {
  const mapping: Record<string, PainArea> = {
    'ginocchio': 'knee',
    'knee': 'knee',
    'anca': 'hip',
    'hip': 'hip',
    'schiena': 'lower_back',
    'lombare': 'lower_back',
    'lower_back': 'lower_back',
    'back': 'lower_back',
    'caviglia': 'ankle',
    'ankle': 'ankle',
    'spalla': 'shoulder',
    'shoulder': 'shoulder',
    'gomito': 'elbow',
    'elbow': 'elbow',
    'polso': 'wrist',
    'wrist': 'wrist',
    'collo': 'neck',
    'neck': 'neck'
  };

  return mapping[bodyPart.toLowerCase()] || 'lower_back';
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIONE DOLORE RUNTIME - Flusso durante la seduta
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Storico dolore per tracciare pattern ricorrenti
 */
export interface PainHistoryEntry {
  date: string;           // ISO date
  sessionId: string;      // ID seduta
  area: PainArea;
  movement: string;       // es. "flexion", "extension", "load"
  exerciseName: string;
  step: 'deload' | 'substitution' | 'stop';  // A che punto si è fermato
  resolved: boolean;      // Se il dolore è passato con deload/sostituzione
}

export interface PainTracker {
  history: PainHistoryEntry[];
  currentSession: {
    sessionId: string;
    stoppedMovements: Array<{
      area: PainArea;
      movement: string;
      exerciseName: string;
    }>;
  };
}

/**
 * Risultato del flusso gestione dolore
 */
export type PainFlowResult =
  | { action: 'deload'; newLoad: number; message: string }
  | { action: 'substitute'; newExercise: string; message: string }
  | { action: 'stop'; message: string; showDisclaimer: boolean };

/**
 * Flusso gestione dolore durante l'esercizio
 *
 * @param exerciseName - Nome esercizio corrente
 * @param painArea - Zona dolente
 * @param currentStep - Step attuale (null = primo tentativo)
 * @param currentLoad - Carico attuale in kg (opzionale)
 * @param painHistory - Storico dolore per questa zona/movimento
 */
export function handleExercisePain(
  exerciseName: string,
  painArea: PainArea,
  currentStep: 'initial' | 'after_deload' | 'after_substitution',
  currentLoad?: number,
  painHistory?: PainHistoryEntry[]
): PainFlowResult {

  // Step 1: DELOAD - Prima prova a ridurre il carico
  if (currentStep === 'initial') {
    const newLoad = currentLoad ? Math.round(currentLoad * 0.5) : undefined;
    return {
      action: 'deload',
      newLoad: newLoad || 0,
      message: `Proviamo con carico ridotto${newLoad ? ` (${newLoad}kg)` : ''}. Se il dolore persiste, passiamo a un esercizio alternativo.`
    };
  }

  // Step 2: SOSTITUZIONE - Se dopo deload fa ancora male
  if (currentStep === 'after_deload') {
    const alternative = findSafeAlternative(exerciseName, painArea, 'moderate');

    if (alternative && alternative !== exerciseName) {
      return {
        action: 'substitute',
        newExercise: alternative,
        message: `Il dolore persiste. Sostituiamo con ${alternative}. Se anche questo fa male, saltiamo questo movimento per oggi.`
      };
    }

    // Nessuna alternativa disponibile → STOP con disclaimer
    return {
      action: 'stop',
      message: `Stop su questo movimento per oggi. Non ci sono alternative sicure. Continua col resto della seduta.`,
      showDisclaimer: true
    };
  }

  // Step 3: STOP - Anche l'alternativa fa male → STOP con disclaimer
  // Se arriviamo qui, l'utente ha provato deload + sostituzione e fa ancora male
  const isRecurring = checkRecurringPain(painArea, exerciseName, painHistory);

  return {
    action: 'stop',
    message: `Stop su questo movimento. Continua col resto della seduta.`,
    showDisclaimer: true  // Sempre disclaimer se arriviamo qui
  };
}

/**
 * Controlla se il dolore è ricorrente (più di 2 sedute con stesso problema)
 */
function checkRecurringPain(
  painArea: PainArea,
  exerciseName: string,
  history?: PainHistoryEntry[]
): boolean {
  if (!history || history.length === 0) return false;

  // Conta le sedute in cui questo movimento ha causato stop
  const stopsOnSameMovement = history.filter(entry =>
    entry.area === painArea &&
    entry.step === 'stop' &&
    !entry.resolved
  );

  // Se più di 2 sedute con stop sullo stesso movimento → ricorrente
  // Raggruppa per sessionId per contare sedute uniche
  const uniqueSessions = new Set(stopsOnSameMovement.map(e => e.sessionId));

  return uniqueSessions.size >= 2;
}

/**
 * Genera il disclaimer per dolore ricorrente
 */
export function getRecurringPainDisclaimer(painArea: PainArea): string {
  const areaNames: Record<string, string> = {
    'knee': 'ginocchio',
    'knee_flexion': 'ginocchio (flessione)',
    'knee_extension': 'ginocchio (estensione)',
    'knee_load': 'ginocchio (sotto carico)',
    'hip': 'anca',
    'hip_flexion': 'anca (flessione)',
    'hip_extension': 'anca (estensione)',
    'hip_abduction': 'anca (abduzione)',
    'hip_rotation': 'anca (rotazione)',
    'lower_back': 'zona lombare',
    'lower_back_flexion': 'zona lombare (flessione)',
    'lower_back_extension': 'zona lombare (estensione)',
    'lower_back_load': 'zona lombare (sotto carico)',
    'lower_back_rotation': 'zona lombare (rotazione)',
    'ankle': 'caviglia',
    'shoulder': 'spalla',
    'elbow': 'gomito',
    'wrist': 'polso',
    'neck': 'collo'
  };

  const areaName = areaNames[painArea] || painArea;

  return `⚠️ ATTENZIONE: Dolore ricorrente

Il dolore nella zona "${areaName}" si è presentato in più sedute consecutive, nonostante le modifiche al programma.

Ti consigliamo di:
1. Consultare un ORTOPEDICO o FISIOTERAPISTA prima di continuare
2. Non forzare i movimenti che causano dolore
3. Portare queste informazioni al professionista

Questo programma può adattare gli esercizi, ma non può sostituire una valutazione medica per dolori persistenti.`;
}

/**
 * Registra un evento dolore nello storico
 */
export function recordPainEvent(
  tracker: PainTracker,
  area: PainArea,
  movement: string,
  exerciseName: string,
  step: 'deload' | 'substitution' | 'stop',
  resolved: boolean
): PainTracker {
  const entry: PainHistoryEntry = {
    date: new Date().toISOString(),
    sessionId: tracker.currentSession.sessionId,
    area,
    movement,
    exerciseName,
    step,
    resolved
  };

  const newHistory = [...tracker.history, entry];

  // Se è uno stop, aggiungi ai movimenti fermati per questa sessione
  const newStoppedMovements = step === 'stop' && !resolved
    ? [...tracker.currentSession.stoppedMovements, { area, movement, exerciseName }]
    : tracker.currentSession.stoppedMovements;

  return {
    history: newHistory,
    currentSession: {
      ...tracker.currentSession,
      stoppedMovements: newStoppedMovements
    }
  };
}

/**
 * Inizializza un nuovo tracker o una nuova sessione
 */
export function initPainTracker(existingHistory?: PainHistoryEntry[]): PainTracker {
  return {
    history: existingHistory || [],
    currentSession: {
      sessionId: `session_${Date.now()}`,
      stoppedMovements: []
    }
  };
}

/**
 * Verifica se un movimento è stato stoppato in questa sessione
 */
export function isMovementStoppedThisSession(
  tracker: PainTracker,
  area: PainArea,
  movement: string
): boolean {
  return tracker.currentSession.stoppedMovements.some(
    m => m.area === area && m.movement === movement
  );
}
