/**
 * EXERCISE FORM CUES - Evidence-Based (2024)
 *
 * Basato su ricerca scientifica aggiornata:
 * - Schoenfeld et al. (biomeccanica squat/deadlift)
 * - Contreras et al. (hip dominant movements)
 * - McGill (core stability, spine safety)
 * - NSCA, ACSM guidelines
 * - Helms, Nippard, RP (science-based coaching)
 */

export interface FormCue {
  category: 'setup' | 'execution' | 'breathing' | 'common_errors' | 'safety';
  text: string;
  priority: 'critical' | 'important' | 'optimal';
}

export interface ExerciseFormCues {
  exerciseName: string;
  cues: FormCue[];
  keyPoints: string[];
  videoTimestamps?: { time: number; cue: string }[];
}

// ============================================================================
// LOWER BODY - SQUAT PATTERN
// ============================================================================

export const SQUAT_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Squat (Back/Front/Goblet)',
  cues: [
    {
      category: 'setup',
      text: 'Piedi larghezza spalle, punte leggermente extra-ruotate (10-30°)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Respiro profondo, brace addominale (360° core tension)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Scendi con controllo, ginocchia tracking in linea con punte piedi',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Ginocchia POSSONO superare punte (normale per morfologia e squat profondo)',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Profondità: almeno parallelo (coscia parallela), full ROM se mobilità lo permette',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Peso su MID-FOOT (tripod: tallone + base alluce + mignolo), NON solo talloni',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Petto in alto, colonna neutra (no iper-estensione, no flessione)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Risalita: spingi pavimento con TUTTO il piede, estendi anche e ginocchia contemporaneamente',
      priority: 'critical'
    },
    {
      category: 'breathing',
      text: 'Valsalva: inspira e trattieni in discesa, espira in alto (o top 1/3 risalita)',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Butt wink eccessivo (bacino retroverso in basso) → limita profondità se accade',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Knee valgus (ginocchia che collassano in dentro) → attiva glutei, spingi ginocchia fuori',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Morning good (anche salgono prima di ginocchia) → mantieni petto alto',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Se dolore ginocchio/schiena: verifica mobilità caviglia, anche, thoracic spine',
      priority: 'critical'
    }
  ],
  keyPoints: [
    'Ginocchia oltre punte = OK se controllato',
    'Peso su mid-foot (tripod), non solo talloni',
    'Profondità individuale (dipende da mobilità)',
    'Brace core (360° tension), non solo "schiena dritta"'
  ]
};

// ============================================================================
// LOWER BODY - HIP HINGE PATTERN (Deadlift, RDL, Good Morning)
// ============================================================================

export const DEADLIFT_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Deadlift (Conventional/Sumo/RDL)',
  cues: [
    {
      category: 'setup',
      text: 'Bilanciere sopra mid-foot (non punte piedi), tibie quasi verticali',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Grip appena fuori gambe (conv) o larghezza spalle (sumo)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Scapole sopra bilanciere (non retratte), colonna neutra',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Brace addominale massimo (Valsalva), lats engaged ("piegare bilanciere")',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Tira slack dalla barra, crea tensione totale corpo PRIMA di sollevare',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Spingi pavimento con piedi (leg press), estendi anche e ginocchia insieme',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Barra sale in linea verticale vicino a gambe (no swing in avanti)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Lockout: anche estese, NO iper-estensione lombare',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Discesa: hip hinge controllato, barra vicina a gambe',
      priority: 'important'
    },
    {
      category: 'breathing',
      text: 'Valsalva: respiro massimo, brace, trattieni durante tutta rep',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Schiena arrotondata (flessione lombare) → ridurre carico, lavorare su setup',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Anche salgono prima di spalle → "chest up", cue "leg press il pavimento"',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Barra lontana da corpo → lats non attivi, più stress lombare',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Se dolore lombare: check setup, ridurre ROM (deficit/blocks), lavorare su hinge pattern',
      priority: 'critical'
    }
  ],
  keyPoints: [
    'Slack out della barra prima di tirare = fondamentale',
    'Lats engaged (protezione lombare)',
    'Lockout = anche estese, NO over-extension',
    'Barra sempre vicina al corpo'
  ]
};

export const ROMANIAN_DEADLIFT_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Romanian Deadlift (RDL)',
  cues: [
    {
      category: 'setup',
      text: 'Partenza in alto (lockout), non da pavimento',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Hip hinge dominante: anche indietro, ginocchia minimal bend (10-20°)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Stretch hamstrings: scendi finché senti tensione posteriori coscia (NON finché tocchi pavimento)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Colonna neutra durante tutta ROM, NO arrotondamento lombare',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Barra vicina a gambe (sfiora tibie/cosce), scapole neutrali',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Risalita: contrazione glutei e hamstrings, spingi anche in avanti',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Troppa flessione ginocchia → diventa squat, perde focus hamstrings',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Arrotondare schiena per toccare pavimento → ROM individuale (stretch hamstrings)',
      priority: 'critical'
    },
    {
      category: 'safety',
      text: '⚠️ ROM dipende da mobilità hamstrings (tight hamstrings = ROM ridotto OK)',
      priority: 'important'
    }
  ],
  keyPoints: [
    'ROM individuale (stop quando hamstrings stretched)',
    'Hip hinge, non squat',
    'Focus eccentrico controllato (glutei/hamstrings)'
  ]
};

// ============================================================================
// UPPER BODY - HORIZONTAL PUSH (Bench Press, Push-up)
// ============================================================================

export const BENCH_PRESS_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Bench Press (Barbell/Dumbbell)',
  cues: [
    {
      category: 'setup',
      text: 'Scapole retratte e depresse (shoulder blades together e down)',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Arch lombare naturale (estensione thoracic, non solo lower back)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Piedi piantati a terra (leg drive), 5 punti contatto (testa, scapole, glutei, piedi)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Grip: avambracci verticali al bottom (tipicamente larghezza spalle + 5-10cm)',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Unrack: barra sopra spalle, NO sopra faccia',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Discesa: barra verso mid-chest/lower chest (non collo), gomiti 45-75° (non flared 90°)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Touch chest controllato (no bounce), mantieni scapole retratte',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Spinta: leg drive, barra sale leggermente indietro verso rack position',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Lockout: gomiti estesi ma non iper-estesi, scapole ancora retratte',
      priority: 'important'
    },
    {
      category: 'breathing',
      text: 'Inspira in alto, trattieni in discesa, espira in risalita (o top)',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Gomiti flared 90° → stress spalle, usa 45-75° (dipende da grip)',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Scapole non retratte → impingement spalla, instabilità',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Bounce sulla chest → controllo, no rimbalzo',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Dolore spalla: check retraction scapole, ridurre ROM (board press), ridurre grip width',
      priority: 'critical'
    }
  ],
  keyPoints: [
    'Scapular retraction = protezione spalla',
    'Gomiti 45-75° (non 90° flared)',
    'Leg drive (stabilità, più forza)',
    'Barra a mid/lower chest, non collo'
  ]
};

export const PUSHUP_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Push-up',
  cues: [
    {
      category: 'setup',
      text: 'Mani larghezza spalle +5-10cm, dita leggermente extra-ruotate',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Corpo in linea retta (plank position): testa-spalle-anche-caviglie',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Core braced (glutei contratti, addome tight)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Scendi con controllo: gomiti 45-75° (non flared), scapole protratte in alto',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Full ROM: petto a ~2cm da pavimento (o touch), corpo in linea',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Spingi: protrazione scapolare (shoulder blades apart in alto)',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Anche che scendono (sagging) → core debole, ridurre difficoltà (incline)',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Anche troppo alte (pike) → perdita tensione petto',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Testa in avanti → mantieni cervicale neutra',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Progressione: Wall → Incline → Standard → Decline → Weighted',
      priority: 'important'
    }
  ],
  keyPoints: [
    'Corpo in linea (no sagging)',
    'Scapular protraction in alto (serratus activation)',
    'Gomiti 45-75°, non flared',
    'Core braced sempre'
  ]
};

// ============================================================================
// UPPER BODY - VERTICAL PUSH (Overhead Press)
// ============================================================================

export const OVERHEAD_PRESS_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Overhead Press (Barbell/Dumbbell)',
  cues: [
    {
      category: 'setup',
      text: 'Piedi larghezza anche, core braced (glutei contratti)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Barra su clavicole/upper chest, gomiti davanti barra',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Grip: avambracci verticali visti frontalmente',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Spinta verticale: barra sale vicina a faccia, testa leggermente indietro',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Quando barra passa fronte, porta testa in avanti sotto barra',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Lockout: barra sopra mid-foot (non davanti), scapole elevate (shrug leggero)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Discesa: testa indietro, barra vicina a faccia, gomiti davanti',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'NO iper-estensione lombare (lean back eccessivo)',
      priority: 'critical'
    },
    {
      category: 'breathing',
      text: 'Valsalva: inspira in basso, trattieni, espira in alto',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Lower back arching (compenso mobilità thoracic) → core debole',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Barra troppo avanti → inefficiente, stress spalle',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Gomiti dietro barra → perdita forza, stress polsi',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Richiede mobilità thoracic spine e spalle. Se limitate: seated, landmine press',
      priority: 'important'
    }
  ],
  keyPoints: [
    'Traiettoria verticale (bar path dritto)',
    'Core bracing (no lower back arch)',
    'Scapular elevation al lockout',
    'Testa si muove (back poi forward)'
  ]
};

// ============================================================================
// UPPER BODY - HORIZONTAL PULL (Row)
// ============================================================================

export const BARBELL_ROW_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Barbell Row (Bent-Over)',
  cues: [
    {
      category: 'setup',
      text: 'Hip hinge: busto 45-75° (dipende da mobilità), colonna neutra',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Ginocchia minimal bend, peso su mid-foot',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Grip: overhand (pronated) o underhand (supinated), larghezza spalle',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Tira barra verso lower chest/upper abs, gomiti vicino a corpo (non flared)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Retrazione scapolare: shoulder blades together (squeeze), mantieni 1sec',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Discesa controllata, protrai scapole (stretch lat)',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Colonna neutra SEMPRE (no extension/flexion)',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Usare momentum (body english) → ridurre carico, controllo',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Tirare verso petto alto (bicep dominant) → focus mid/lower chest',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Perdere neutralità colonna → ridurre angolo busto (più verticale)',
      priority: 'critical'
    },
    {
      category: 'safety',
      text: '⚠️ Se difficile mantenere posizione: Chest-supported row, Seal row',
      priority: 'important'
    }
  ],
  keyPoints: [
    'Retrazione scapolare (mid-back activation)',
    'Colonna neutra (isometric hold)',
    'Tira verso lower chest/abs',
    'Controllo, no momentum'
  ]
};

// ============================================================================
// UPPER BODY - VERTICAL PULL (Pull-up, Lat Pulldown)
// ============================================================================

export const PULLUP_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Pull-up / Chin-up',
  cues: [
    {
      category: 'setup',
      text: 'Dead hang: braccia completamente estese, scapole protratte (deprimi in setup)',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Grip: pronated (pull-up) o supinated (chin-up), larghezza spalle +5-10cm',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Inizia movimento: deprimi scapole (shoulder blades down), poi tira',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Tira gomiti verso fianchi (pensa "gomiti giù"), petto verso barra',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Top: mento sopra barra (o chest to bar), scapole retratte',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Discesa controllata (eccentric), torna a dead hang completo',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Kipping (momentum gambe) → se non strict, usa band/assisted',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Partial ROM (non dead hang) → Full ROM per sviluppo ottimale',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Spalle shrugged → depressione scapolare attiva',
      priority: 'critical'
    },
    {
      category: 'safety',
      text: '⚠️ Progressione: Scapular pulls → Negatives → Band assisted → Full pull-up',
      priority: 'important'
    }
  ],
  keyPoints: [
    'Scapular depression (lats activation)',
    'Full ROM (dead hang a dead hang)',
    'Controlled eccentric (forza, ipertrofia)',
    'No kipping se obiettivo forza/massa'
  ]
};

// ============================================================================
// CORE - ANTI-EXTENSION (Plank, Dead Bug)
// ============================================================================

export const PLANK_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Plank (Front/Side)',
  cues: [
    {
      category: 'setup',
      text: 'Gomiti sotto spalle, avambracci paralleli',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Corpo in linea retta: testa-spalle-anche-caviglie',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Posterior pelvic tilt leggero (glutei contratti)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Brace addominale 360° (respira shallow, mantieni tensione)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Scapole protratte (serratus engaged), non retratte',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Quadricipiti contratti (gambe attive)',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Anche che scendono (anterior pelvic tilt) → perde anti-extension',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Anche troppo alte → riduce difficoltà, perde tensione',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Trattenere respiro → respiri shallow ma continui',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Se dolore lombare: PPT (posterior tilt) più accentuato, ridurre durata',
      priority: 'critical'
    }
  ],
  keyPoints: [
    'Anti-extension (resist gravity)',
    'Posterior pelvic tilt (glutei)',
    'Total body tension (gambe, glutei, core, scapole)',
    'Respiro controllato, no apnea'
  ]
};

// ============================================================================
// HIP THRUST (Contreras - Glute Guy)
// ============================================================================

export const HIP_THRUST_FORM_CUES: ExerciseFormCues = {
  exerciseName: 'Hip Thrust (Barbell/Dumbbell)',
  cues: [
    {
      category: 'setup',
      text: 'Scapole su bench (mid-scapola), piedi larghezza anche',
      priority: 'important'
    },
    {
      category: 'setup',
      text: 'Piedi flat, distanza: tibie verticali al top (ginocchia 90°)',
      priority: 'critical'
    },
    {
      category: 'setup',
      text: 'Barra sopra anche (pad per comfort), chin tucked (mento verso petto)',
      priority: 'important'
    },
    {
      category: 'execution',
      text: 'Spingi talloni, estendi anche fino a linea retta (spalle-anche-ginocchia)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Lockout: glutei contratti MASSIMO (squeeze 1-2sec), NO iper-estensione lombare',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Posterior pelvic tilt al top (bacino retroverso, abs tight)',
      priority: 'critical'
    },
    {
      category: 'execution',
      text: 'Discesa controllata, stretch glutei in basso',
      priority: 'important'
    },
    {
      category: 'breathing',
      text: 'Espira al top (lockout), inspira in discesa',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Iper-estensione lombare → PPT al top, squeeze glutei non lower back',
      priority: 'critical'
    },
    {
      category: 'common_errors',
      text: '❌ Piedi troppo vicini/lontani → tibie verticali al top',
      priority: 'important'
    },
    {
      category: 'common_errors',
      text: '❌ Spingere su punte piedi → peso su talloni/mid-foot',
      priority: 'important'
    },
    {
      category: 'safety',
      text: '⚠️ Se dolore lombare: check PPT, ridurre ROM, focus glute squeeze',
      priority: 'critical'
    }
  ],
  keyPoints: [
    'Glute-dominant (non lower back)',
    'Posterior pelvic tilt al top',
    'Tibie verticali (optimal glute activation)',
    'Pause al top (1-2sec squeeze)'
  ]
};

// ============================================================================
// EXPORT COMPLETO
// ============================================================================

export const EXERCISE_FORM_DATABASE: Record<string, ExerciseFormCues> = {
  // Lower Body
  'Squat': SQUAT_FORM_CUES,
  'Back Squat': SQUAT_FORM_CUES,
  'Front Squat': SQUAT_FORM_CUES,
  'Goblet Squat': SQUAT_FORM_CUES,
  'Deadlift': DEADLIFT_FORM_CUES,
  'Conventional Deadlift': DEADLIFT_FORM_CUES,
  'Sumo Deadlift': DEADLIFT_FORM_CUES,
  'Romanian Deadlift': ROMANIAN_DEADLIFT_FORM_CUES,
  'RDL': ROMANIAN_DEADLIFT_FORM_CUES,
  'Hip Thrust': HIP_THRUST_FORM_CUES,

  // Upper Body Push
  'Bench Press': BENCH_PRESS_FORM_CUES,
  'Barbell Bench Press': BENCH_PRESS_FORM_CUES,
  'Dumbbell Bench Press': BENCH_PRESS_FORM_CUES,
  'Push-up': PUSHUP_FORM_CUES,
  'Overhead Press': OVERHEAD_PRESS_FORM_CUES,
  'Military Press': OVERHEAD_PRESS_FORM_CUES,
  'Dumbbell Shoulder Press': OVERHEAD_PRESS_FORM_CUES,

  // Upper Body Pull
  'Barbell Row': BARBELL_ROW_FORM_CUES,
  'Pull-up': PULLUP_FORM_CUES,
  'Chin-up': PULLUP_FORM_CUES,

  // Core
  'Plank': PLANK_FORM_CUES,
  'Front Plank': PLANK_FORM_CUES,
};

/**
 * Ottieni form cues per un esercizio
 */
export function getFormCues(exerciseName: string): ExerciseFormCues | null {
  // Cerca match esatto
  if (EXERCISE_FORM_DATABASE[exerciseName]) {
    return EXERCISE_FORM_DATABASE[exerciseName];
  }

  // Cerca match parziale (es: "Barbell Back Squat" → "Squat")
  for (const [key, value] of Object.entries(EXERCISE_FORM_DATABASE)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

/**
 * Filtra cues per categoria
 */
export function getCuesByCategory(
  exerciseName: string,
  category: FormCue['category']
): FormCue[] {
  const cues = getFormCues(exerciseName);
  if (!cues) return [];

  return cues.cues.filter(cue => cue.category === category);
}

/**
 * Ottieni solo cues critici (per quick reference)
 */
export function getCriticalCues(exerciseName: string): FormCue[] {
  const cues = getFormCues(exerciseName);
  if (!cues) return [];

  return cues.cues.filter(cue => cue.priority === 'critical');
}
