/**
 * PAIN MESSAGING SYSTEM - DCSS Paradigm
 * 
 * Sistema di messaggistica per la gestione del fastidio/dolore.
 * Basato su principi di pain science moderna e approccio DCSS.
 * 
 * PRINCIPI:
 * 1. Il dolore è un segnale complesso, non un indicatore lineare di danno
 * 2. L'utente ha sempre scelta su come procedere
 * 3. Linguaggio non catastrofista
 * 4. Educazione integrata nei messaggi
 * 5. Tolerable discomfort (3-4/10) è accettabile durante l'allenamento
 * 
 * Riferimenti:
 * - Moseley GL, Butler DS - Explain Pain
 * - O'Sullivan P - Cognitive Functional Therapy
 * - Silbernagel KG - Pain monitoring model for tendinopathy
 */

// ============================================================================
// TYPES
// ============================================================================

export type DiscomfortLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type DiscomfortCategory = 'none' | 'mild' | 'moderate' | 'significant' | 'severe';

export type UserChoice = 
  | 'continue_normal'      // Procedi come programmato
  | 'continue_adapted'     // Procedi con adattamento
  | 'switch_exercise'      // Cambia esercizio
  | 'skip_exercise'        // Salta esercizio
  | 'end_session';         // Termina sessione

export interface DiscomfortResponse {
  category: DiscomfortCategory;
  primaryMessage: string;
  primaryMessageIt: string;
  educationalNote?: string;
  educationalNoteIt?: string;
  options: UserOption[];
  showProfessionalAdvice: boolean;
  professionalAdviceMessage?: string;
  professionalAdviceMessageIt?: string;
  tolerableDiscomfortReminder: boolean;
}

export interface UserOption {
  choice: UserChoice;
  label: string;
  labelIt: string;
  description: string;
  descriptionIt: string;
  recommended: boolean;
  loadReduction?: number;  // Percentuale di riduzione carico (es. 20 = -20%)
}

export interface PersistentDiscomfortResponse {
  sessionsWithDiscomfort: number;
  message: string;
  messageIt: string;
  recommendation: 'continue_adapting' | 'consult_professional';
  options: UserOption[];
}

export interface ReturnToNormalResponse {
  message: string;
  messageIt: string;
  celebration: boolean;
  stats: {
    sessionsWithoutDiscomfort: number;
    currentLoadPercentage: number;
    originalLoadPercentage: number;
  };
  nextStep: string;
  nextStepIt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Categorizzazione livelli di fastidio
 * Basato su pain monitoring model (Silbernagel)
 */
export function categorizeDiscomfort(level: DiscomfortLevel): DiscomfortCategory {
  if (level === 0) return 'none';
  if (level <= 3) return 'mild';
  if (level <= 6) return 'moderate';
  if (level <= 7) return 'significant';
  return 'severe';  // 8-10
}

/**
 * Soglia per consiglio professionista
 * 3+ sessioni consecutive con fastidio moderato+
 */
export const SESSIONS_FOR_PROFESSIONAL_ADVICE = 3;

/**
 * Soglia fastidio tollerabile durante esercizio
 * Basato su pain monitoring model
 */
export const TOLERABLE_DISCOMFORT_THRESHOLD = 4;

/**
 * Soglia per stop immediato (non permettiamo "procedi comunque")
 */
export const STOP_THRESHOLD = 7;

// ============================================================================
// PRE-WORKOUT DISCOMFORT MESSAGES
// ============================================================================

/**
 * Genera risposta per fastidio segnalato PRE-WORKOUT
 */
export function getPreWorkoutDiscomfortResponse(
  level: DiscomfortLevel,
  bodyArea: string,
  bodyAreaIt: string,
  exerciseName: string,
  alternativeExercise?: string
): DiscomfortResponse {
  const category = categorizeDiscomfort(level);

  // ============ NONE (0) ============
  if (category === 'none') {
    return {
      category: 'none',
      primaryMessage: 'No discomfort reported. Proceeding as programmed.',
      primaryMessageIt: 'Nessun fastidio segnalato. Procediamo come programmato.',
      options: [{
        choice: 'continue_normal',
        label: 'Start workout',
        labelIt: 'Inizia allenamento',
        description: 'Begin your session as planned',
        descriptionIt: 'Inizia la sessione come pianificato',
        recommended: true
      }],
      showProfessionalAdvice: false,
      tolerableDiscomfortReminder: false
    };
  }

  // ============ MILD (1-3) ============
  if (category === 'mild') {
    return {
      category: 'mild',
      primaryMessage: `Mild discomfort noted in ${bodyArea}. This level is generally acceptable during training.`,
      primaryMessageIt: `Fastidio lieve notato a ${bodyAreaIt}. Questo livello è generalmente accettabile durante l'allenamento.`,
      educationalNote: 'Mild discomfort (1-3/10) that doesn\'t worsen during exercise is typically fine. Your body is resilient and adapts to training.',
      educationalNoteIt: 'Un fastidio lieve (1-3/10) che non peggiora durante l\'esercizio è tipicamente ok. Il tuo corpo è resiliente e si adatta all\'allenamento.',
      options: [
        {
          choice: 'continue_normal',
          label: 'Proceed as planned',
          labelIt: 'Procedi come pianificato',
          description: 'Start with programmed weights. Monitor how it feels.',
          descriptionIt: 'Inizia con i pesi programmati. Monitora come ti senti.',
          recommended: true
        },
        {
          choice: 'continue_adapted',
          label: 'Start lighter',
          labelIt: 'Inizia più leggero',
          description: 'Reduce load by 10% as a precaution',
          descriptionIt: 'Riduci il carico del 10% come precauzione',
          recommended: false,
          loadReduction: 10
        }
      ],
      showProfessionalAdvice: false,
      tolerableDiscomfortReminder: true
    };
  }

  // ============ MODERATE (4-6) ============
  if (category === 'moderate') {
    const options: UserOption[] = [
      {
        choice: 'continue_adapted',
        label: 'Continue with adaptation',
        labelIt: 'Continua con adattamento',
        description: `Reduce load by 20% for exercises involving ${bodyArea}`,
        descriptionIt: `Riduci il carico del 20% per esercizi che coinvolgono ${bodyAreaIt}`,
        recommended: true,
        loadReduction: 20
      },
      {
        choice: 'continue_normal',
        label: 'Proceed as planned',
        labelIt: 'Procedi come pianificato',
        description: 'I feel I can manage this. I\'ll monitor during exercise.',
        descriptionIt: 'Sento di poterlo gestire. Monitorerò durante l\'esercizio.',
        recommended: false
      }
    ];

    // Aggiungi opzione alternativa se disponibile
    if (alternativeExercise) {
      options.splice(1, 0, {
        choice: 'switch_exercise',
        label: 'Try alternative',
        labelIt: 'Prova alternativa',
        description: `${alternativeExercise} works the same muscles with less load on ${bodyArea}`,
        descriptionIt: `${alternativeExercise} lavora gli stessi muscoli con meno carico su ${bodyAreaIt}`,
        recommended: false
      });
    }

    return {
      category: 'moderate',
      primaryMessage: `Moderate discomfort (${level}/10) in ${bodyArea}. Let's adapt the session to work around this.`,
      primaryMessageIt: `Fastidio moderato (${level}/10) a ${bodyAreaIt}. Adattiamo la sessione per gestirlo.`,
      educationalNote: 'Moderate discomfort often responds well to load reduction. Many people train successfully with some discomfort by adjusting intensity.',
      educationalNoteIt: 'Il fastidio moderato spesso risponde bene alla riduzione del carico. Molte persone si allenano con successo con un certo fastidio adattando l\'intensità.',
      options,
      showProfessionalAdvice: false,
      tolerableDiscomfortReminder: true
    };
  }

  // ============ SIGNIFICANT (7) ============
  if (category === 'significant') {
    return {
      category: 'significant',
      primaryMessage: `Significant discomfort (${level}/10) in ${bodyArea}. We recommend skipping exercises that load this area today.`,
      primaryMessageIt: `Fastidio significativo (${level}/10) a ${bodyAreaIt}. Ti consigliamo di saltare gli esercizi che caricano questa zona oggi.`,
      educationalNote: 'At this discomfort level, training the affected area is unlikely to be productive. Rest or alternative work is usually the better choice.',
      educationalNoteIt: 'A questo livello di fastidio, allenare la zona interessata è improbabile che sia produttivo. Riposo o lavoro alternativo è di solito la scelta migliore.',
      options: [
        {
          choice: 'skip_exercise',
          label: 'Skip affected exercises',
          labelIt: 'Salta esercizi interessati',
          description: `We'll skip ${exerciseName} and similar. Continue with the rest of the workout.`,
          descriptionIt: `Saltiamo ${exerciseName} e simili. Continua con il resto dell'allenamento.`,
          recommended: true
        },
        {
          choice: 'switch_exercise',
          label: 'Do alternative exercises only',
          labelIt: 'Fai solo esercizi alternativi',
          description: alternativeExercise 
            ? `Replace with ${alternativeExercise} at reduced load`
            : 'We\'ll find alternatives that don\'t load this area',
          descriptionIt: alternativeExercise
            ? `Sostituisci con ${alternativeExercise} a carico ridotto`
            : 'Troveremo alternative che non caricano questa zona',
          recommended: false,
          loadReduction: 40
        },
        {
          choice: 'end_session',
          label: 'End session',
          labelIt: 'Termina sessione',
          description: 'If you don\'t feel like training today, that\'s okay',
          descriptionIt: 'Se non ti senti di allenarti oggi, va bene',
          recommended: false
        }
      ],
      showProfessionalAdvice: true,
      professionalAdviceMessage: 'If this discomfort persists, consider consulting a physiotherapist or sports medicine doctor.',
      professionalAdviceMessageIt: 'Se questo fastidio persiste, considera di consultare un fisioterapista o medico sportivo.',
      tolerableDiscomfortReminder: false
    };
  }

  // ============ SEVERE (8-10) ============
  // Livello 7+ non permette "procedi comunque"
  return {
    category: 'severe',
    primaryMessage: `You've reported significant discomfort (${level}/10). We strongly recommend not training this area today.`,
    primaryMessageIt: `Hai segnalato un fastidio importante (${level}/10). Ti consigliamo fortemente di non allenare questa zona oggi.`,
    educationalNote: 'High discomfort levels are your body\'s way of asking for rest. Pushing through rarely helps and may delay recovery.',
    educationalNoteIt: 'Livelli alti di fastidio sono il modo del tuo corpo di chiedere riposo. Forzare raramente aiuta e può ritardare il recupero.',
    options: [
      {
        choice: 'skip_exercise',
        label: 'Skip affected exercises',
        labelIt: 'Salta esercizi interessati',
        description: 'Train other body parts, rest the affected area',
        descriptionIt: 'Allena altre parti del corpo, riposa la zona interessata',
        recommended: true
      },
      {
        choice: 'end_session',
        label: 'Rest today',
        labelIt: 'Riposa oggi',
        description: 'Take the day off. Recovery is part of training.',
        descriptionIt: 'Prenditi il giorno. Il recupero è parte dell\'allenamento.',
        recommended: true
      }
    ],
    showProfessionalAdvice: true,
    professionalAdviceMessage: 'We recommend consulting a healthcare professional about this discomfort before your next training session.',
    professionalAdviceMessageIt: 'Ti consigliamo di consultare un professionista sanitario riguardo questo fastidio prima della prossima sessione di allenamento.',
    tolerableDiscomfortReminder: false
  };
}

// ============================================================================
// INTRA-WORKOUT DISCOMFORT MESSAGES
// ============================================================================

/**
 * Genera risposta per fastidio segnalato DURANTE l'esercizio
 */
export function getIntraWorkoutDiscomfortResponse(
  level: DiscomfortLevel,
  bodyArea: string,
  bodyAreaIt: string,
  exerciseName: string,
  setNumber: number,
  totalSets: number,
  wasProgressive: boolean,  // Il fastidio è peggiorato durante il set?
  alternativeExercise?: string
): DiscomfortResponse {
  const category = categorizeDiscomfort(level);
  const remainingSets = totalSets - setNumber;

  // ============ NONE or MILD (0-3) ============
  if (category === 'none' || category === 'mild') {
    return {
      category,
      primaryMessage: level === 0 
        ? 'Feeling good. Continue as planned.'
        : `Mild discomfort (${level}/10) - within acceptable range.`,
      primaryMessageIt: level === 0
        ? 'Ti senti bene. Continua come pianificato.'
        : `Fastidio lieve (${level}/10) - nel range accettabile.`,
      educationalNote: 'Discomfort up to 3-4/10 that doesn\'t worsen is generally acceptable during training.',
      educationalNoteIt: 'Un fastidio fino a 3-4/10 che non peggiora è generalmente accettabile durante l\'allenamento.',
      options: [{
        choice: 'continue_normal',
        label: 'Continue',
        labelIt: 'Continua',
        description: `${remainingSets} sets remaining`,
        descriptionIt: `${remainingSets} serie rimanenti`,
        recommended: true
      }],
      showProfessionalAdvice: false,
      tolerableDiscomfortReminder: true
    };
  }

  // ============ MODERATE (4-6) ============
  if (category === 'moderate') {
    // Se il dolore è PEGGIORATO durante il set, più conservativi
    if (wasProgressive) {
      return {
        category: 'moderate',
        primaryMessage: `Discomfort increased during the set (now ${level}/10). This is a signal to adapt.`,
        primaryMessageIt: `Il fastidio è aumentato durante la serie (ora ${level}/10). Questo è un segnale per adattare.`,
        educationalNote: 'Discomfort that worsens during exercise is your body asking for a change. Reducing load or switching exercises usually helps.',
        educationalNoteIt: 'Un fastidio che peggiora durante l\'esercizio è il tuo corpo che chiede un cambiamento. Ridurre il carico o cambiare esercizio di solito aiuta.',
        options: [
          {
            choice: 'continue_adapted',
            label: 'Reduce load and continue',
            labelIt: 'Riduci carico e continua',
            description: 'Drop weight by 20% for remaining sets',
            descriptionIt: 'Riduci il peso del 20% per le serie rimanenti',
            recommended: true,
            loadReduction: 20
          },
          {
            choice: 'switch_exercise',
            label: 'Switch exercise',
            labelIt: 'Cambia esercizio',
            description: alternativeExercise 
              ? `Try ${alternativeExercise} instead`
              : 'Move to a different exercise for this muscle group',
            descriptionIt: alternativeExercise
              ? `Prova ${alternativeExercise} invece`
              : 'Passa a un esercizio diverso per questo gruppo muscolare',
            recommended: false
          },
          {
            choice: 'skip_exercise',
            label: 'Skip remaining sets',
            labelIt: 'Salta serie rimanenti',
            description: `You've done ${setNumber}/${totalSets} sets. That's still productive work.`,
            descriptionIt: `Hai fatto ${setNumber}/${totalSets} serie. È comunque lavoro produttivo.`,
            recommended: false
          }
        ],
        showProfessionalAdvice: false,
        tolerableDiscomfortReminder: false
      };
    }

    // Dolore stabile, non peggiorato
    return {
      category: 'moderate',
      primaryMessage: `Moderate discomfort (${level}/10). How would you like to proceed?`,
      primaryMessageIt: `Fastidio moderato (${level}/10). Come preferisci procedere?`,
      educationalNote: 'Stable discomfort (not worsening) is often manageable. You know your body best.',
      educationalNoteIt: 'Un fastidio stabile (non in peggioramento) è spesso gestibile. Tu conosci il tuo corpo meglio di chiunque.',
      options: [
        {
          choice: 'continue_adapted',
          label: 'Reduce load',
          labelIt: 'Riduci carico',
          description: 'Drop 15% and continue',
          descriptionIt: 'Riduci del 15% e continua',
          recommended: true,
          loadReduction: 15
        },
        {
          choice: 'continue_normal',
          label: 'Continue as is',
          labelIt: 'Continua così',
          description: 'I can manage this level',
          descriptionIt: 'Riesco a gestire questo livello',
          recommended: false
        },
        {
          choice: 'skip_exercise',
          label: 'Move to next exercise',
          labelIt: 'Passa al prossimo esercizio',
          description: 'Skip remaining sets of this exercise',
          descriptionIt: 'Salta le serie rimanenti di questo esercizio',
          recommended: false
        }
      ],
      showProfessionalAdvice: false,
      tolerableDiscomfortReminder: true
    };
  }

  // ============ SIGNIFICANT (7) ============
  if (category === 'significant') {
    return {
      category: 'significant',
      primaryMessage: `Discomfort has reached ${level}/10. We recommend stopping this exercise.`,
      primaryMessageIt: `Il fastidio ha raggiunto ${level}/10. Ti consigliamo di fermare questo esercizio.`,
      educationalNote: 'At this level, continuing is unlikely to be productive and may increase recovery time.',
      educationalNoteIt: 'A questo livello, continuare è improbabile che sia produttivo e potrebbe aumentare i tempi di recupero.',
      options: [
        {
          choice: 'skip_exercise',
          label: 'Stop this exercise',
          labelIt: 'Ferma questo esercizio',
          description: 'Move to the next exercise in your program',
          descriptionIt: 'Passa al prossimo esercizio del programma',
          recommended: true
        },
        {
          choice: 'end_session',
          label: 'End workout',
          labelIt: 'Termina allenamento',
          description: `You've completed ${setNumber} sets. Good work today.`,
          descriptionIt: `Hai completato ${setNumber} serie. Buon lavoro oggi.`,
          recommended: false
        }
      ],
      showProfessionalAdvice: true,
      professionalAdviceMessage: 'If this happens frequently, consider consulting a physiotherapist.',
      professionalAdviceMessageIt: 'Se questo succede frequentemente, considera di consultare un fisioterapista.',
      tolerableDiscomfortReminder: false
    };
  }

  // ============ SEVERE (8-10) ============
  return {
    category: 'severe',
    primaryMessage: `High discomfort (${level}/10) reported. Please stop this exercise.`,
    primaryMessageIt: `Fastidio alto (${level}/10) segnalato. Per favore ferma questo esercizio.`,
    educationalNote: 'Your body is clearly signaling that this isn\'t right today. Stopping is the smart choice.',
    educationalNoteIt: 'Il tuo corpo sta chiaramente segnalando che oggi non è il caso. Fermarsi è la scelta intelligente.',
    options: [
      {
        choice: 'skip_exercise',
        label: 'Stop and continue with other exercises',
        labelIt: 'Ferma e continua con altri esercizi',
        description: 'Skip exercises that load this area',
        descriptionIt: 'Salta gli esercizi che caricano questa zona',
        recommended: true
      },
      {
        choice: 'end_session',
        label: 'End session',
        labelIt: 'Termina sessione',
        description: 'Rest is sometimes the best training',
        descriptionIt: 'Il riposo a volte è il miglior allenamento',
        recommended: true
      }
    ],
    showProfessionalAdvice: true,
    professionalAdviceMessage: 'We recommend consulting a healthcare professional before your next session.',
    professionalAdviceMessageIt: 'Ti consigliamo di consultare un professionista sanitario prima della prossima sessione.',
    tolerableDiscomfortReminder: false
  };
}

// ============================================================================
// PERSISTENT DISCOMFORT MESSAGES
// ============================================================================

/**
 * Genera risposta per fastidio PERSISTENTE (multiple sessioni)
 */
export function getPersistentDiscomfortResponse(
  sessionsWithDiscomfort: number,
  bodyArea: string,
  bodyAreaIt: string,
  averageLevel: number
): PersistentDiscomfortResponse {
  // Meno di 3 sessioni: continua ad adattare
  if (sessionsWithDiscomfort < SESSIONS_FOR_PROFESSIONAL_ADVICE) {
    return {
      sessionsWithDiscomfort,
      message: `Discomfort in ${bodyArea} has been present for ${sessionsWithDiscomfort} sessions. We're continuing to adapt your program.`,
      messageIt: `Il fastidio a ${bodyAreaIt} è stato presente per ${sessionsWithDiscomfort} sessioni. Continuiamo ad adattare il tuo programma.`,
      recommendation: 'continue_adapting',
      options: [
        {
          choice: 'continue_adapted',
          label: 'Continue with current adaptations',
          labelIt: 'Continua con gli adattamenti attuali',
          description: 'The modified program is designed to help you train around this',
          descriptionIt: 'Il programma modificato è progettato per aiutarti ad allenarti aggirando questo problema',
          recommended: true
        }
      ]
    };
  }

  // 3+ sessioni: suggerisci professionista
  return {
    sessionsWithDiscomfort,
    message: `Discomfort in ${bodyArea} has persisted for ${sessionsWithDiscomfort} sessions. While we continue adapting your program, we recommend consulting a professional.`,
    messageIt: `Il fastidio a ${bodyAreaIt} persiste da ${sessionsWithDiscomfort} sessioni. Mentre continuiamo ad adattare il tuo programma, ti consigliamo di consultare un professionista.`,
    recommendation: 'consult_professional',
    options: [
      {
        choice: 'continue_adapted',
        label: 'Continue training with adaptations',
        labelIt: 'Continua ad allenarti con adattamenti',
        description: 'Your program will remain adapted for this area',
        descriptionIt: 'Il tuo programma rimarrà adattato per questa zona',
        recommended: true
      },
      {
        choice: 'skip_exercise',
        label: 'Avoid this area entirely',
        labelIt: 'Evita questa zona completamente',
        description: 'We\'ll remove all exercises that load this area until you\'ve seen a professional',
        descriptionIt: 'Rimuoveremo tutti gli esercizi che caricano questa zona finché non avrai visto un professionista',
        recommended: false
      }
    ]
  };
}

// ============================================================================
// RETURN TO NORMAL MESSAGES
// ============================================================================

/**
 * Genera messaggio per RITORNO AL NORMALE dopo periodo di adattamento
 */
export function getReturnToNormalResponse(
  exerciseName: string,
  sessionsWithoutDiscomfort: number,
  currentLoadPercentage: number,
  nextLoadPercentage: number
): ReturnToNormalResponse {
  // Progressione in corso
  if (nextLoadPercentage < 100) {
    return {
      message: `Great progress on ${exerciseName}! You've completed ${sessionsWithoutDiscomfort} sessions without discomfort.`,
      messageIt: `Ottimi progressi su ${exerciseName}! Hai completato ${sessionsWithoutDiscomfort} sessioni senza fastidio.`,
      celebration: false,
      stats: {
        sessionsWithoutDiscomfort,
        currentLoadPercentage,
        originalLoadPercentage: 100
      },
      nextStep: `Today we'll try ${nextLoadPercentage}% of your original load.`,
      nextStepIt: `Oggi proviamo al ${nextLoadPercentage}% del tuo carico originale.`
    };
  }

  // Ritorno completo al 100%
  return {
    message: `🎉 ${exerciseName} is back in your program at full capacity!`,
    messageIt: `🎉 ${exerciseName} è tornato nel tuo programma a piena capacità!`,
    celebration: true,
    stats: {
      sessionsWithoutDiscomfort,
      currentLoadPercentage: 100,
      originalLoadPercentage: 100
    },
    nextStep: 'You\'ve successfully worked through this. Your body adapted and recovered. Great job!',
    nextStepIt: 'Hai lavorato con successo su questo. Il tuo corpo si è adattato e recuperato. Ottimo lavoro!'
  };
}

// ============================================================================
// TOLERABLE DISCOMFORT REMINDER
// ============================================================================

/**
 * Messaggio reminder sul fastidio tollerabile
 * Da mostrare quando appropriato
 */
export const TOLERABLE_DISCOMFORT_REMINDER = {
  title: 'About discomfort during training',
  titleIt: 'Sul fastidio durante l\'allenamento',
  message: `Discomfort up to ${TOLERABLE_DISCOMFORT_THRESHOLD}/10 that doesn't worsen during exercise is generally acceptable. Your body is resilient and adapts to training. If discomfort exceeds ${TOLERABLE_DISCOMFORT_THRESHOLD}/10 or worsens during a set, let us know and we'll adapt.`,
  messageIt: `Un fastidio fino a ${TOLERABLE_DISCOMFORT_THRESHOLD}/10 che non peggiora durante l'esercizio è generalmente accettabile. Il tuo corpo è resiliente e si adatta all'allenamento. Se il fastidio supera ${TOLERABLE_DISCOMFORT_THRESHOLD}/10 o peggiora durante una serie, faccelo sapere e adatteremo.`,
  source: 'Based on pain monitoring models used in rehabilitation (Silbernagel et al.)',
  sourceIt: 'Basato su modelli di monitoraggio del dolore usati in riabilitazione (Silbernagel et al.)'
};

// ============================================================================
// POST-SET DISCOMFORT CHECK
// ============================================================================

/**
 * Domande per il check del fastidio post-set
 */
export const POST_SET_DISCOMFORT_CHECK = {
  question: 'How did that set feel in terms of discomfort?',
  questionIt: 'Come è andata quella serie in termini di fastidio?',
  options: [
    {
      value: 'better',
      label: '😊 Better / No discomfort',
      labelIt: '😊 Meglio / Nessun fastidio',
      action: 'continue_normal'
    },
    {
      value: 'same',
      label: '😐 Same as before',
      labelIt: '😐 Come prima',
      action: 'continue_normal'
    },
    {
      value: 'slightly_worse',
      label: '😕 Slightly worse',
      labelIt: '😕 Leggermente peggio',
      action: 'offer_reduction'
    },
    {
      value: 'much_worse',
      label: '😟 Much worse',
      labelIt: '😟 Molto peggio',
      action: 'recommend_stop'
    }
  ]
};

// ============================================================================
// PROFESSIONAL ADVICE MESSAGES
// ============================================================================

/**
 * Messaggio standard per consiglio professionista
 * NON allarmista, informativo
 */
export const PROFESSIONAL_ADVICE_MESSAGE = {
  standard: {
    message: 'For persistent discomfort, a physiotherapist or sports medicine doctor can provide personalized assessment and guidance. This is a suggestion, not an emergency.',
    messageIt: 'Per fastidi persistenti, un fisioterapista o medico sportivo può fornire una valutazione e guida personalizzata. Questo è un suggerimento, non un\'emergenza.'
  },
  afterMultipleSessions: {
    message: 'This discomfort has been present for several sessions. While we continue adapting your training, a professional assessment could help identify the best path forward.',
    messageIt: 'Questo fastidio è presente da diverse sessioni. Mentre continuiamo ad adattare il tuo allenamento, una valutazione professionale potrebbe aiutare a identificare il percorso migliore.'
  },
  highDiscomfort: {
    message: 'With discomfort at this level, we recommend consulting a healthcare professional before continuing to train this area.',
    messageIt: 'Con un fastidio a questo livello, ti consigliamo di consultare un professionista sanitario prima di continuare ad allenare questa zona.'
  }
};

// ============================================================================
// BODY AREA LABELS (Italian)
// ============================================================================

export const BODY_AREA_LABELS_IT: Record<string, string> = {
  'neck': 'collo',
  'shoulder': 'spalla',
  'left_shoulder': 'spalla sinistra',
  'right_shoulder': 'spalla destra',
  'upper_back': 'parte alta della schiena',
  'lower_back': 'parte bassa della schiena',
  'hip': 'anca',
  'left_hip': 'anca sinistra',
  'right_hip': 'anca destra',
  'knee': 'ginocchio',
  'left_knee': 'ginocchio sinistro',
  'right_knee': 'ginocchio destro',
  'ankle': 'caviglia',
  'left_ankle': 'caviglia sinistra',
  'right_ankle': 'caviglia destra',
  'elbow': 'gomito',
  'left_elbow': 'gomito sinistro',
  'right_elbow': 'gomito destro',
  'wrist': 'polso',
  'left_wrist': 'polso sinistro',
  'right_wrist': 'polso destro'
};

/**
 * Helper per ottenere label italiana
 */
export function getBodyAreaLabelIt(area: string): string {
  return BODY_AREA_LABELS_IT[area] || area;
}
