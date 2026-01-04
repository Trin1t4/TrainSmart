/**
 * FIX 7: HOME TRAINING - GESTIONE TIRATE SENZA ATTREZZATURA
 * 
 * PROBLEMA: A casa senza barra, tavolo robusto o elastici, le tirate
 * orizzontali (Row) non sono eseguibili. Il sistema deve gestire questo caso.
 * 
 * SOLUZIONE:
 * 1. Durante onboarding, chiedere attrezzatura disponibile in dettaglio
 * 2. Se manca TUTTO per le tirate:
 *    a) Avvisare l'utente del problema (squilibrio push/pull)
 *    b) Offrire alternative creative (door rows, furniture rows)
 *    c) Suggerire acquisto minimo (elastici ~15€)
 *    d) Se rifiuta tutto: sostituire con esercizi compensativi
 * 3. Tracciare il "debito" di tirate per bilanciare quando possibile
 * 
 * IMPORTANTE: Non è possibile fare un vero Row senza resistenza esterna.
 * Le alternative sono compromessi, non equivalenti.
 */

import { Exercise, Level, Goal } from '../types';

// ============================================================
// CONFIGURAZIONE ATTREZZATURA PER TIRATE
// ============================================================

/**
 * Attrezzatura che permette tirate orizzontali
 */
export const HORIZONTAL_PULL_EQUIPMENT = {
  // Attrezzatura ideale
  ideal: [
    { id: 'pull_up_bar', name: 'Barra trazioni', allowsInvertedRow: true },
    { id: 'rings', name: 'Anelli/TRX', allowsInvertedRow: true },
    { id: 'resistance_bands', name: 'Elastici resistenza', allowsRow: true },
    { id: 'dumbbells', name: 'Manubri', allowsRow: true },
    { id: 'kettlebell', name: 'Kettlebell', allowsRow: true },
  ],
  
  // Attrezzatura improvvisata
  makeshift: [
    { id: 'sturdy_table', name: 'Tavolo robusto', allowsInvertedRow: true, warning: 'Assicurati che regga il tuo peso' },
    { id: 'two_chairs_broomstick', name: 'Due sedie + manico scopa', allowsInvertedRow: true, warning: 'Setup instabile, attenzione' },
    { id: 'door_towel', name: 'Porta + asciugamano', allowsRow: true, warning: 'Solo porte robuste, rischio danni' },
    { id: 'backpack_weights', name: 'Zaino con pesi', allowsRow: true, warning: 'Limitato nel carico' },
  ],
};

/**
 * Esercizi alternativi quando non è possibile fare Row
 * NOTA: Questi NON sono equivalenti, sono compensativi
 */
export const PULL_ALTERNATIVES_NO_EQUIPMENT: Exercise[] = [
  {
    pattern: 'horizontal_pull' as any,
    name: 'Prone Y-T-W Raises',
    sets: 3,
    reps: '10 each',
    rest: '45s',
    intensity: 'Bodyweight',
    notes: '⚠️ Compensativo: lavora romboidi/trapezio ma non è un row. Esegui Y, T, W in sequenza.',
  },
  {
    pattern: 'horizontal_pull' as any,
    name: 'Reverse Snow Angels',
    sets: 3,
    reps: 15,
    rest: '30s',
    intensity: 'Bodyweight',
    notes: '⚠️ Compensativo: rear delt e trapezio medio. A pancia in giù, braccia lungo i fianchi → sopra la testa.',
  },
  {
    pattern: 'horizontal_pull' as any,
    name: 'Prone Cobra Hold',
    sets: 3,
    reps: '20-30s hold',
    rest: '30s',
    intensity: 'Bodyweight',
    notes: '⚠️ Compensativo: isometrico per estensori spinali e trapezio.',
  },
  {
    pattern: 'horizontal_pull' as any,
    name: 'Superman Pulls',
    sets: 3,
    reps: 12,
    rest: '45s',
    intensity: 'Bodyweight',
    notes: '⚠️ Compensativo: simula row a terra. Da superman, porta i gomiti verso i fianchi.',
  },
  {
    pattern: 'horizontal_pull' as any,
    name: 'Wall Slides',
    sets: 2,
    reps: 15,
    rest: '30s',
    intensity: 'Bodyweight',
    notes: '⚠️ Mobilità + attivazione: schiena al muro, braccia a "W", scivola su/giù.',
  },
];

/**
 * Esercizi con attrezzatura improvvisata
 */
export const MAKESHIFT_ROW_EXERCISES: Record<string, Exercise> = {
  door_towel: {
    pattern: 'horizontal_pull' as any,
    name: 'Door Towel Rows',
    sets: 3,
    reps: '10-15',
    rest: '60s',
    intensity: 'Bodyweight',
    notes: 'Asciugamano su porta socchiusa. Tira verso il petto. ⚠️ Solo porte robuste!',
  },
  two_chairs_broomstick: {
    pattern: 'horizontal_pull' as any,
    name: 'Inverted Row (sedie + scopa)',
    sets: 3,
    reps: '8-12',
    rest: '60s',
    intensity: 'Bodyweight',
    notes: 'Manico scopa tra due sedie. Sdraiati sotto e tira. ⚠️ Verifica stabilità!',
  },
  backpack_weights: {
    pattern: 'horizontal_pull' as any,
    name: 'Backpack Bent Over Row',
    sets: 3,
    reps: '12-15',
    rest: '60s',
    intensity: 'Low-Medium',
    notes: 'Zaino con libri/bottiglie. Piegato in avanti, tira verso il fianco.',
  },
  sturdy_table: {
    pattern: 'horizontal_pull' as any,
    name: 'Table Inverted Row',
    sets: 3,
    reps: '8-12',
    rest: '60s',
    intensity: 'Bodyweight',
    notes: 'Sdraiati sotto un tavolo robusto, afferra il bordo, tira il petto al tavolo.',
  },
};

// ============================================================
// TIPI
// ============================================================

interface EquipmentCheckResult {
  canDoHorizontalPull: boolean;
  availableMethod: 'ideal' | 'makeshift' | 'compensatory' | 'none';
  equipment?: string;
  exercise?: Exercise;
  warning?: string;
  recommendation?: string;
}

interface PullDebt {
  weeksMissed: number;
  compensatoryExercisesDone: number;
  shouldRecommendEquipment: boolean;
}

// ============================================================
// FUNZIONI PRINCIPALI
// ============================================================

/**
 * Verifica se l'utente può fare tirate orizzontali con la sua attrezzatura
 */
export function checkHorizontalPullCapability(
  availableEquipment: string[],
  location: 'home' | 'gym' | 'home_gym'
): EquipmentCheckResult {
  
  // In palestra c'è sempre attrezzatura
  if (location === 'gym') {
    return {
      canDoHorizontalPull: true,
      availableMethod: 'ideal',
      equipment: 'gym_equipment',
    };
  }
  
  // Home gym con attrezzatura
  if (location === 'home_gym') {
    // Verifica attrezzatura ideale
    for (const eq of HORIZONTAL_PULL_EQUIPMENT.ideal) {
      if (availableEquipment.includes(eq.id)) {
        return {
          canDoHorizontalPull: true,
          availableMethod: 'ideal',
          equipment: eq.id,
        };
      }
    }
  }
  
  // Home: cerca attrezzatura ideale
  for (const eq of HORIZONTAL_PULL_EQUIPMENT.ideal) {
    if (availableEquipment.includes(eq.id)) {
      return {
        canDoHorizontalPull: true,
        availableMethod: 'ideal',
        equipment: eq.id,
      };
    }
  }
  
  // Home: cerca attrezzatura improvvisata
  for (const eq of HORIZONTAL_PULL_EQUIPMENT.makeshift) {
    if (availableEquipment.includes(eq.id)) {
      return {
        canDoHorizontalPull: true,
        availableMethod: 'makeshift',
        equipment: eq.id,
        exercise: MAKESHIFT_ROW_EXERCISES[eq.id],
        warning: eq.warning,
      };
    }
  }
  
  // Nessuna attrezzatura per tirate
  return {
    canDoHorizontalPull: false,
    availableMethod: 'compensatory',
    recommendation: generateEquipmentRecommendation(),
  };
}

/**
 * Genera raccomandazione acquisto attrezzatura minima
 */
function generateEquipmentRecommendation(): string {
  return `
⚠️ ATTENZIONE: Senza attrezzatura per le tirate, il programma avrà uno squilibrio push/pull.

SOLUZIONI (in ordine di preferenza):

1. 🏋️ Elastici di resistenza (€15-25)
   - Più versatili, permettono progressione
   - Occupano zero spazio
   - Link: cerca "resistance bands set" su Amazon

2. 🚪 Barra trazioni da porta (€20-35)
   - Permette trazioni E inverted rows
   - Nessun montaggio permanente
   - Verifica compatibilità porta

3. 🪑 Setup improvvisato GRATUITO:
   - Tavolo robusto per inverted row
   - Due sedie + manico scopa
   - Asciugamano su porta (con cautela)

Senza almeno una di queste opzioni, useremo esercizi compensativi
che lavorano muscoli simili ma NON sostituiscono le tirate.
`.trim();
}

/**
 * Seleziona l'esercizio appropriato per horizontal pull in base all'attrezzatura
 */
export function selectHorizontalPullExercise(
  availableEquipment: string[],
  location: 'home' | 'gym' | 'home_gym',
  level: Level,
  goal: Goal | string,
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
): { exercise: Exercise; isCompensatory: boolean; warning?: string } {
  
  const capability = checkHorizontalPullCapability(availableEquipment, location);
  
  // Può fare tirate normali
  if (capability.canDoHorizontalPull && capability.exercise) {
    return {
      exercise: adjustExerciseForDayType(capability.exercise, dayType, level),
      isCompensatory: false,
      warning: capability.warning,
    };
  }
  
  // Deve usare compensativi
  if (!capability.canDoHorizontalPull) {
    // Seleziona 2 esercizi compensativi per coprire più muscoli
    const compensatory = selectCompensatoryExercises(level, dayType);
    
    return {
      exercise: compensatory,
      isCompensatory: true,
      warning: '⚠️ Esercizio compensativo - non equivalente a un row. Considera di procurarti elastici o una barra.',
    };
  }
  
  // Caso standard (gym o attrezzatura ideale)
  return {
    exercise: createStandardRowExercise(location, level, dayType),
    isCompensatory: false,
  };
}

/**
 * Seleziona esercizi compensativi appropriati
 */
function selectCompensatoryExercises(
  level: Level,
  dayType: 'heavy' | 'volume' | 'moderate'
): Exercise {
  // Per principianti: esercizi più semplici
  if (level === 'beginner') {
    return {
      ...PULL_ALTERNATIVES_NO_EQUIPMENT[0], // Prone Y-T-W
      sets: 2,
      reps: '8 each',
    };
  }
  
  // Per intermedi/avanzati: combinazione
  const baseExercise = dayType === 'volume'
    ? PULL_ALTERNATIVES_NO_EQUIPMENT[1] // Reverse Snow Angels (più reps)
    : PULL_ALTERNATIVES_NO_EQUIPMENT[3]; // Superman Pulls (più intenso)
  
  return adjustExerciseForDayType(baseExercise, dayType, level);
}

/**
 * Aggiusta parametri esercizio per dayType
 */
function adjustExerciseForDayType(
  exercise: Exercise,
  dayType: 'heavy' | 'volume' | 'moderate',
  level: Level
): Exercise {
  const adjusted = { ...exercise };
  
  switch (dayType) {
    case 'heavy':
      adjusted.sets = level === 'advanced' ? 4 : 3;
      adjusted.rest = '60-90s';
      break;
    case 'volume':
      adjusted.sets = 3;
      if (typeof adjusted.reps === 'number') {
        adjusted.reps = adjusted.reps + 5;
      }
      adjusted.rest = '30-45s';
      break;
    case 'moderate':
    default:
      // Mantieni default
      break;
  }
  
  return adjusted;
}

/**
 * Crea row standard per gym
 */
function createStandardRowExercise(
  location: string,
  level: Level,
  dayType: 'heavy' | 'volume' | 'moderate'
): Exercise {
  const isGym = location === 'gym' || location === 'home_gym';
  
  const exercise: Exercise = {
    pattern: 'horizontal_pull' as any,
    name: isGym ? 'Rematore con Manubrio' : 'Inverted Row',
    sets: 3,
    reps: 10,
    rest: '90s',
    intensity: '70%',
  };
  
  return adjustExerciseForDayType(exercise, dayType, level);
}

// ============================================================
// TRACKING "DEBITO" TIRATE
// ============================================================

/**
 * Traccia quante settimane l'utente ha fatto solo compensativi
 * Dopo N settimane, suggerisce più insistentemente l'acquisto
 */
export function trackPullDebt(
  currentDebt: PullDebt,
  didCompensatoryThisWeek: boolean
): PullDebt {
  if (didCompensatoryThisWeek) {
    return {
      weeksMissed: currentDebt.weeksMissed + 1,
      compensatoryExercisesDone: currentDebt.compensatoryExercisesDone + 1,
      shouldRecommendEquipment: currentDebt.weeksMissed >= 3, // Dopo 3 settimane
    };
  }
  
  // Reset se ha fatto tirate vere
  return {
    weeksMissed: 0,
    compensatoryExercisesDone: currentDebt.compensatoryExercisesDone,
    shouldRecommendEquipment: false,
  };
}

/**
 * Genera messaggio per utente con debito tirate
 */
export function generatePullDebtWarning(debt: PullDebt): string | null {
  if (debt.weeksMissed < 2) return null;
  
  if (debt.weeksMissed >= 4) {
    return `
⚠️ ATTENZIONE SQUILIBRIO

Sono ${debt.weeksMissed} settimane che il tuo programma non include vere tirate orizzontali.
Questo può portare a:
- Squilibrio muscolare spalle (rischio infortuni)
- Postura cifotica (spalle in avanti)
- Plateau nei push (panca, push-up)

🎯 SOLUZIONE ECONOMICA:
Un set di elastici (€15-20) risolve il problema completamente.
Oppure una barra da porta (€25-30) per trazioni e inverted row.

Il tuo corpo ti ringrazierà! 💪
    `.trim();
  }
  
  if (debt.weeksMissed >= 2) {
    return `
💡 SUGGERIMENTO

Da ${debt.weeksMissed} settimane usiamo esercizi compensativi per le tirate.
Per risultati migliori, considera un set di elastici (~€15).
    `.trim();
  }
  
  return null;
}

// ============================================================
// INTEGRAZIONE CON ONBOARDING
// ============================================================

/**
 * Domande aggiuntive per onboarding home training
 */
export const HOME_EQUIPMENT_QUESTIONS = {
  horizontalPull: {
    question: {
      it: 'Hai attrezzatura per esercizi di tirata?',
      en: 'Do you have equipment for pulling exercises?',
    },
    options: [
      { id: 'pull_up_bar', label: { it: 'Barra per trazioni', en: 'Pull-up bar' } },
      { id: 'rings', label: { it: 'Anelli o TRX', en: 'Rings or TRX' } },
      { id: 'resistance_bands', label: { it: 'Elastici di resistenza', en: 'Resistance bands' } },
      { id: 'dumbbells', label: { it: 'Manubri', en: 'Dumbbells' } },
      { id: 'sturdy_table', label: { it: 'Tavolo molto robusto', en: 'Very sturdy table' } },
      { id: 'none', label: { it: 'Nessuna di queste', en: 'None of these' } },
    ],
    multiSelect: true,
    showWarningIf: ['none'],
    warning: {
      it: 'Senza attrezzatura per le tirate, il programma avrà limitazioni. Consigliamo almeno un set di elastici (€15-20).',
      en: 'Without pulling equipment, the program will have limitations. We recommend at least a resistance band set (€15-20).',
    },
  },
};

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * In weeklySplitGenerator.ts, quando crei horizontal pull:
 * 
 * ```typescript
 * // Invece di creare sempre un row standard:
 * const { exercise, isCompensatory, warning } = selectHorizontalPullExercise(
 *   userEquipment,
 *   location,
 *   level,
 *   goal,
 *   dayType
 * );
 * 
 * if (isCompensatory) {
 *   // Traccia il "debito"
 *   // Mostra warning all'utente
 *   console.warn(warning);
 * }
 * 
 * days[dayIndex].exercises.push(exercise);
 * ```
 */

// ============================================================
// EXPORT
// ============================================================

export {
  EquipmentCheckResult,
  PullDebt,
};
