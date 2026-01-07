/**
 * PAIN/DISCOMFORT MESSAGING SYSTEM - DCSS Paradigm
 * 
 * Sistema di messaggistica per la gestione del fastidio/dolore.
 * 
 * PRINCIPI GUIDA:
 * 1. LINGUAGGIO: "Fastidio" invece di "dolore" dove possibile
 * 2. SCELTA: L'utente decide sempre come procedere
 * 3. EDUCAZIONE: Spiega il perché, non solo il cosa
 * 4. TOLERABLE DISCOMFORT: 3-4/10 che non peggiora è accettabile
 * 5. SOGLIA PROFESSIONISTA: 7+/10 o 3+ sessioni consecutive
 * 
 * Riferimenti:
 * - Silbernagel KG et al. - Pain monitoring model for tendinopathy
 * - O'Sullivan P et al. - Cognitive Functional Therapy
 * - Moseley GL - Explain Pain
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
  | 'skip_exercise'        // Salta questo esercizio
  | 'end_session';         // Termina la sessione

export interface DiscomfortResponse {
  level: DiscomfortLevel;
  category: DiscomfortCategory;
  canProceed: boolean;
  requiresProfessional: boolean;
  
  // Messaggi
  acknowledgment: string;
  acknowledgmentIt: string;
  explanation: string;
  explanationIt: string;
  
  // Opzioni per l'utente
  options: UserOption[];
  
  // Educazione
  educationalNote?: string;
  educationalNoteIt?: string;
  
  // Warning se necessario
  warning?: string;
  warningIt?: string;
}

export interface UserOption {
  id: UserChoice;
  label: string;
  labelIt: string;
  description: string;
  descriptionIt: string;
  recommended?: boolean;
  loadModifier?: number;  // es. 0.8 = -20%
}

export interface TolerableDiscomfortInfo {
  message: string;
  messageIt: string;
  threshold: number;
  checkInPrompt: string;
  checkInPromptIt: string;
}

export interface PersistentDiscomfortCheck {
  consecutiveSessions: number;
  shouldSuggestProfessional: boolean;
  message: string;
  messageIt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOLERABLE_THRESHOLD = 4;  // Fastidio fino a 4/10 generalmente accettabile
const PROFESSIONAL_THRESHOLD = 7;  // 7+/10 = consulta professionista
const SESSIONS_FOR_PROFESSIONAL = 3;  // 3+ sessioni consecutive = consulta professionista

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Categorizza il livello di fastidio
 */
export function categorizeDiscomfort(level: DiscomfortLevel): DiscomfortCategory {
  if (level === 0) return 'none';
  if (level <= 3) return 'mild';
  if (level <= 5) return 'moderate';
  if (level <= 6) return 'significant';
  return 'severe';
}

/**
 * Genera risposta completa per un livello di fastidio segnalato
 */
export function getDiscomfortResponse(
  level: DiscomfortLevel,
  bodyArea: string,
  exerciseName: string,
  consecutiveSessions: number = 0
): DiscomfortResponse {
  const category = categorizeDiscomfort(level);
  const areaLabel = BODY_AREA_LABELS[bodyArea] || bodyArea;
  
  // Check se serve professionista
  const requiresProfessional = level >= PROFESSIONAL_THRESHOLD || consecutiveSessions >= SESSIONS_FOR_PROFESSIONAL;
  
  // Genera risposta basata sulla categoria
  switch (category) {
    case 'none':
      return getNoDiscomfortResponse();
    case 'mild':
      return getMildDiscomfortResponse(level, areaLabel, exerciseName);
    case 'moderate':
      return getModerateDiscomfortResponse(level, areaLabel, exerciseName, consecutiveSessions);
    case 'significant':
      return getSignificantDiscomfortResponse(level, areaLabel, exerciseName, consecutiveSessions);
    case 'severe':
      return getSevereDiscomfortResponse(level, areaLabel, exerciseName);
  }
}

// ============================================================================
// RESPONSE GENERATORS BY CATEGORY
// ============================================================================

function getNoDiscomfortResponse(): DiscomfortResponse {
  return {
    level: 0,
    category: 'none',
    canProceed: true,
    requiresProfessional: false,
    acknowledgment: 'Great, no discomfort reported.',
    acknowledgmentIt: 'Ottimo, nessun fastidio segnalato.',
    explanation: 'You\'re good to go with the planned workout.',
    explanationIt: 'Puoi procedere con l\'allenamento programmato.',
    options: [
      {
        id: 'continue_normal',
        label: 'Continue',
        labelIt: 'Continua',
        description: 'Proceed with planned workout',
        descriptionIt: 'Procedi con l\'allenamento programmato',
        recommended: true
      }
    ]
  };
}

function getMildDiscomfortResponse(
  level: DiscomfortLevel,
  areaLabel: string,
  exerciseName: string
): DiscomfortResponse {
  return {
    level,
    category: 'mild',
    canProceed: true,
    requiresProfessional: false,
    
    acknowledgment: `Mild discomfort noted (${level}/10) in ${areaLabel}.`,
    acknowledgmentIt: `Fastidio lieve registrato (${level}/10) a ${areaLabel}.`,
    
    explanation: 'This level of discomfort is generally acceptable during training. We\'ll keep track of it.',
    explanationIt: 'Questo livello di fastidio è generalmente accettabile durante l\'allenamento. Lo terremo monitorato.',
    
    options: [
      {
        id: 'continue_normal',
        label: 'Continue as planned',
        labelIt: 'Continua come programmato',
        description: 'Proceed normally, we\'ll monitor',
        descriptionIt: 'Procedi normalmente, monitoreremo',
        recommended: true
      },
      {
        id: 'continue_adapted',
        label: 'Reduce load slightly',
        labelIt: 'Riduci leggermente il carico',
        description: '-10% load as precaution',
        descriptionIt: '-10% carico per precauzione',
        loadModifier: 0.9
      }
    ],
    
    educationalNote: 'Mild discomfort (1-3/10) that doesn\'t worsen during exercise is normal and not a sign of damage. Your body adapts to training stress over time.',
    educationalNoteIt: 'Un fastidio lieve (1-3/10) che non peggiora durante l\'esercizio è normale e non è segno di danno. Il tuo corpo si adatta allo stress dell\'allenamento nel tempo.'
  };
}

function getModerateDiscomfortResponse(
  level: DiscomfortLevel,
  areaLabel: string,
  exerciseName: string,
  consecutiveSessions: number
): DiscomfortResponse {
  const options: UserOption[] = [
    {
      id: 'continue_adapted',
      label: 'Continue with reduced load',
      labelIt: 'Continua con carico ridotto',
      description: '-20% load on exercises involving this area',
      descriptionIt: '-20% carico sugli esercizi che coinvolgono questa zona',
      recommended: true,
      loadModifier: 0.8
    },
    {
      id: 'switch_exercise',
      label: 'Try an alternative',
      labelIt: 'Prova un\'alternativa',
      description: 'Switch to a variation that loads this area differently',
      descriptionIt: 'Passa a una variante che carica questa zona diversamente'
    },
    {
      id: 'continue_normal',
      label: 'Proceed as planned',
      labelIt: 'Procedi come programmato',
      description: 'If you feel you can manage it',
      descriptionIt: 'Se senti di poterlo gestire'
    }
  ];

  let warning: string | undefined;
  let warningIt: string | undefined;
  
  if (consecutiveSessions >= 2) {
    warning = `This is session ${consecutiveSessions + 1} with discomfort in this area. If it continues, consider consulting a professional.`;
    warningIt = `Questa è la sessione ${consecutiveSessions + 1} con fastidio in questa zona. Se continua, considera di consultare un professionista.`;
  }

  return {
    level,
    category: 'moderate',
    canProceed: true,
    requiresProfessional: false,
    
    acknowledgment: `Moderate discomfort noted (${level}/10) in ${areaLabel}.`,
    acknowledgmentIt: `Fastidio moderato registrato (${level}/10) a ${areaLabel}.`,
    
    explanation: 'We can adapt today\'s session to work around this. You choose how to proceed.',
    explanationIt: 'Possiamo adattare la sessione di oggi per gestire questo. Tu scegli come procedere.',
    
    options,
    
    educationalNote: 'Moderate discomfort (4-5/10) is in the "yellow zone". It\'s okay to train through it if it doesn\'t worsen, but listening to your body is important.',
    educationalNoteIt: 'Un fastidio moderato (4-5/10) è nella "zona gialla". Va bene allenarsi con questo livello se non peggiora, ma ascoltare il tuo corpo è importante.',
    
    warning,
    warningIt
  };
}

function getSignificantDiscomfortResponse(
  level: DiscomfortLevel,
  areaLabel: string,
  exerciseName: string,
  consecutiveSessions: number
): DiscomfortResponse {
  const options: UserOption[] = [
    {
      id: 'switch_exercise',
      label: 'Use alternative exercise',
      labelIt: 'Usa esercizio alternativo',
      description: 'Switch to a variation that avoids loading this area',
      descriptionIt: 'Passa a una variante che evita di caricare questa zona',
      recommended: true
    },
    {
      id: 'skip_exercise',
      label: 'Skip exercises for this area',
      labelIt: 'Salta esercizi per questa zona',
      description: 'Continue with exercises that don\'t involve this area',
      descriptionIt: 'Continua con esercizi che non coinvolgono questa zona'
    },
    {
      id: 'continue_adapted',
      label: 'Try with significant reduction',
      labelIt: 'Prova con riduzione significativa',
      description: '-40% load, stop if it worsens',
      descriptionIt: '-40% carico, fermati se peggiora',
      loadModifier: 0.6
    }
  ];

  let warning = `Discomfort at ${level}/10 is significant. We recommend modifying today's session.`;
  let warningIt = `Un fastidio a ${level}/10 è significativo. Ti consigliamo di modificare la sessione di oggi.`;
  
  if (consecutiveSessions >= SESSIONS_FOR_PROFESSIONAL - 1) {
    warning += ' If this persists in the next session, we strongly recommend consulting a physiotherapist or sports medicine professional.';
    warningIt += ' Se persiste nella prossima sessione, ti consigliamo fortemente di consultare un fisioterapista o un medico dello sport.';
  }

  return {
    level,
    category: 'significant',
    canProceed: true,
    requiresProfessional: consecutiveSessions >= SESSIONS_FOR_PROFESSIONAL,
    
    acknowledgment: `Significant discomfort reported (${level}/10) in ${areaLabel}.`,
    acknowledgmentIt: `Fastidio significativo segnalato (${level}/10) a ${areaLabel}.`,
    
    explanation: 'At this level, we recommend modifying your session. Here are your options:',
    explanationIt: 'A questo livello, ti consigliamo di modificare la sessione. Ecco le tue opzioni:',
    
    options,
    
    educationalNote: 'Discomfort at 6/10 is telling you something. Training through it occasionally is okay, but consistent discomfort at this level deserves attention.',
    educationalNoteIt: 'Un fastidio a 6/10 ti sta dicendo qualcosa. Allenarsi attraverso di esso occasionalmente va bene, ma un fastidio costante a questo livello merita attenzione.',
    
    warning,
    warningIt
  };
}

function getSevereDiscomfortResponse(
  level: DiscomfortLevel,
  areaLabel: string,
  exerciseName: string
): DiscomfortResponse {
  return {
    level,
    category: 'severe',
    canProceed: false,  // NON può procedere normalmente
    requiresProfessional: true,
    
    acknowledgment: `Severe discomfort reported (${level}/10) in ${areaLabel}.`,
    acknowledgmentIt: `Fastidio severo segnalato (${level}/10) a ${areaLabel}.`,
    
    explanation: 'At this level, we recommend not training this area today and consulting a healthcare professional.',
    explanationIt: 'A questo livello, ti consigliamo di non allenare questa zona oggi e di consultare un professionista sanitario.',
    
    options: [
      {
        id: 'skip_exercise',
        label: 'Skip exercises for this area',
        labelIt: 'Salta esercizi per questa zona',
        description: 'Continue with exercises that don\'t involve this area',
        descriptionIt: 'Continua con esercizi che non coinvolgono questa zona',
        recommended: true
      },
      {
        id: 'end_session',
        label: 'End today\'s session',
        labelIt: 'Termina la sessione di oggi',
        description: 'If you prefer to rest today',
        descriptionIt: 'Se preferisci riposarti oggi'
      }
    ],
    
    warning: '⚠️ Discomfort at 7+/10 indicates you should not push through today. This is not about being tough - it\'s about being smart. Please consider consulting a physiotherapist or doctor, especially if this is recurring.',
    warningIt: '⚠️ Un fastidio a 7+/10 indica che non dovresti forzare oggi. Non si tratta di essere duri - si tratta di essere intelligenti. Per favore considera di consultare un fisioterapista o un medico, specialmente se questo è ricorrente.',
    
    educationalNote: 'Severe discomfort is your body\'s clear signal to stop. Training through this can prolong recovery. Rest today is an investment in your long-term progress.',
    educationalNoteIt: 'Un fastidio severo è il segnale chiaro del tuo corpo di fermarti. Allenarsi attraverso questo può prolungare il recupero. Riposare oggi è un investimento nel tuo progresso a lungo termine.'
  };
}

// ============================================================================
// TOLERABLE DISCOMFORT SYSTEM
// ============================================================================

/**
 * Informazioni sul "tolerable discomfort" da mostrare prima del set
 */
export function getTolerableDiscomfortInfo(reportedLevel: DiscomfortLevel): TolerableDiscomfortInfo {
  if (reportedLevel === 0) {
    return {
      message: '',
      messageIt: '',
      threshold: 0,
      checkInPrompt: '',
      checkInPromptIt: ''
    };
  }
  
  return {
    message: `Reminder: Discomfort up to ${TOLERABLE_THRESHOLD}/10 that doesn't worsen during the set is generally acceptable. If it exceeds 5/10 or worsens, stop and let us know.`,
    messageIt: `Reminder: Un fastidio fino a ${TOLERABLE_THRESHOLD}/10 che non peggiora durante il set è generalmente accettabile. Se supera 5/10 o peggiora, fermati e segnalacelo.`,
    threshold: TOLERABLE_THRESHOLD,
    checkInPrompt: 'How did the discomfort feel during the set?',
    checkInPromptIt: 'Come è stato il fastidio durante il set?'
  };
}

/**
 * Opzioni per il check-in post-set quando c'è fastidio pre-esistente
 */
export function getPostSetDiscomfortOptions(): Array<{
  id: string;
  label: string;
  labelIt: string;
  emoji: string;
  action: 'continue' | 'reduce' | 'skip';
}> {
  return [
    {
      id: 'better_or_same',
      label: 'Better or same',
      labelIt: 'Meglio o uguale',
      emoji: '😊',
      action: 'continue'
    },
    {
      id: 'slightly_worse',
      label: 'Slightly worse',
      labelIt: 'Leggermente peggio',
      emoji: '😐',
      action: 'reduce'
    },
    {
      id: 'much_worse',
      label: 'Much worse',
      labelIt: 'Molto peggio',
      emoji: '😟',
      action: 'skip'
    }
  ];
}

// ============================================================================
// PERSISTENT DISCOMFORT HANDLING
// ============================================================================

/**
 * Check per fastidio persistente multi-sessione
 */
export function checkPersistentDiscomfort(
  bodyArea: string,
  consecutiveSessions: number
): PersistentDiscomfortCheck {
  const areaLabel = BODY_AREA_LABELS[bodyArea] || bodyArea;
  
  if (consecutiveSessions < 2) {
    return {
      consecutiveSessions,
      shouldSuggestProfessional: false,
      message: '',
      messageIt: ''
    };
  }
  
  if (consecutiveSessions >= SESSIONS_FOR_PROFESSIONAL) {
    return {
      consecutiveSessions,
      shouldSuggestProfessional: true,
      message: `The discomfort in your ${areaLabel} has been present for ${consecutiveSessions} consecutive sessions. While the program is adapting, we recommend consulting a physiotherapist or sports medicine professional for a proper assessment. This isn't an alarm - it's a sensible precaution for persistent issues.`,
      messageIt: `Il fastidio a ${areaLabel} è presente da ${consecutiveSessions} sessioni consecutive. Mentre il programma si sta adattando, ti consigliamo di consultare un fisioterapista o un medico dello sport per una valutazione appropriata. Non è un allarme - è una precauzione sensata per problemi persistenti.`
    };
  }
  
  return {
    consecutiveSessions,
    shouldSuggestProfessional: false,
    message: `This is session ${consecutiveSessions} with discomfort in your ${areaLabel}. We're tracking this and adapting your program. If it continues for another session, we'll suggest consulting a professional.`,
    messageIt: `Questa è la sessione ${consecutiveSessions} con fastidio a ${areaLabel}. Stiamo monitorando e adattando il tuo programma. Se continua per un'altra sessione, ti suggeriremo di consultare un professionista.`
  };
}

// ============================================================================
// RETURN TO NORMAL CELEBRATION
// ============================================================================

/**
 * Messaggi per quando l'utente torna al normale dopo un periodo di adattamento
 */
export function getReturnToNormalMessage(
  bodyArea: string,
  exerciseName: string,
  sessionsInRecovery: number,
  currentLoadPercent: number
): {
  title: string;
  titleIt: string;
  message: string;
  messageIt: string;
  nextStep: string;
  nextStepIt: string;
} {
  const areaLabel = BODY_AREA_LABELS[bodyArea] || bodyArea;
  
  if (currentLoadPercent < 100) {
    // Ancora in progressione
    const nextPercent = Math.min(100, currentLoadPercent + 15);
    return {
      title: '📈 Progress Update',
      titleIt: '📈 Aggiornamento Progresso',
      message: `Great news! You've completed ${sessionsInRecovery} sessions without discomfort in your ${areaLabel}. Your body is adapting well.`,
      messageIt: `Ottime notizie! Hai completato ${sessionsInRecovery} sessioni senza fastidio a ${areaLabel}. Il tuo corpo si sta adattando bene.`,
      nextStep: `Next step: We'll increase load to ${nextPercent}% for "${exerciseName}".`,
      nextStepIt: `Prossimo passo: Aumenteremo il carico al ${nextPercent}% per "${exerciseName}".`
    };
  }
  
  // Tornato al 100%
  return {
    title: '🎉 Back to Full Capacity!',
    titleIt: '🎉 Tornato a Piena Capacità!',
    message: `"${exerciseName}" is back in your program without restrictions! Over the past ${sessionsInRecovery} sessions you:\n\n✅ Trained without discomfort\n✅ Progressively increased load\n✅ Reached your pre-adaptation capacity`,
    messageIt: `"${exerciseName}" è tornato nel tuo programma senza restrizioni! Nelle ultime ${sessionsInRecovery} sessioni hai:\n\n✅ Allenato senza fastidio\n✅ Aumentato progressivamente il carico\n✅ Raggiunto la tua capacità pre-adattamento`,
    nextStep: 'Your body adapts! Continue with normal progression.',
    nextStepIt: 'Il tuo corpo si adatta! Continua con la progressione normale.'
  };
}

// ============================================================================
// PRE-WORKOUT CHECK MESSAGES
// ============================================================================

/**
 * Messaggi per il check pre-workout
 */
export const PRE_WORKOUT_MESSAGES = {
  title: {
    en: 'How are you feeling today?',
    it: 'Come ti senti oggi?'
  },
  subtitle: {
    en: 'Let us know if anything feels off so we can adapt your session.',
    it: 'Facci sapere se qualcosa non va così possiamo adattare la tua sessione.'
  },
  noDiscomfort: {
    en: 'I feel good, ready to train',
    it: 'Mi sento bene, pronto ad allenarmi'
  },
  hasDiscomfort: {
    en: 'I have some discomfort',
    it: 'Ho qualche fastidio'
  },
  selectArea: {
    en: 'Where do you feel discomfort?',
    it: 'Dove senti fastidio?'
  },
  selectIntensity: {
    en: 'How intense is it?',
    it: 'Quanto è intenso?'
  },
  intensityLabels: {
    en: ['None', 'Minimal', 'Mild', 'Noticeable', 'Moderate', 'Uncomfortable', 'Significant', 'Strong', 'Severe', 'Very severe', 'Maximum'],
    it: ['Nessuno', 'Minimo', 'Lieve', 'Percepibile', 'Moderato', 'Fastidioso', 'Significativo', 'Forte', 'Severo', 'Molto severo', 'Massimo']
  }
};

// ============================================================================
// BODY AREA LABELS
// ============================================================================

export const BODY_AREA_LABELS: Record<string, string> = {
  // English keys, Italian values for display
  'neck': 'collo',
  'shoulder': 'spalla',
  'left_shoulder': 'spalla sinistra',
  'right_shoulder': 'spalla destra',
  'elbow': 'gomito',
  'left_elbow': 'gomito sinistro',
  'right_elbow': 'gomito destro',
  'wrist': 'polso',
  'left_wrist': 'polso sinistro',
  'right_wrist': 'polso destro',
  'upper_back': 'parte alta della schiena',
  'thoracic_spine': 'dorsale',
  'lower_back': 'bassa schiena',
  'lumbar': 'zona lombare',
  'hip': 'anca',
  'left_hip': 'anca sinistra',
  'right_hip': 'anca destra',
  'knee': 'ginocchio',
  'left_knee': 'ginocchio sinistro',
  'right_knee': 'ginocchio destro',
  'ankle': 'caviglia',
  'left_ankle': 'caviglia sinistra',
  'right_ankle': 'caviglia destra',
  'foot': 'piede',
  'chest': 'petto',
  'abdomen': 'addome'
};

// ============================================================================
// IN-SESSION DISCOMFORT MESSAGES
// ============================================================================

/**
 * Messaggi per quando emerge fastidio DURANTE l'esercizio
 */
export function getInSessionDiscomfortResponse(
  level: DiscomfortLevel,
  bodyArea: string,
  exerciseName: string,
  repAtDiscomfort?: number,
  totalReps?: number
): DiscomfortResponse {
  const areaLabel = BODY_AREA_LABELS[bodyArea] || bodyArea;
  const category = categorizeDiscomfort(level);
  
  // Fastidio durante l'esercizio è più significativo del pre-workout
  // perché indica che quel movimento specifico sta causando il problema
  
  if (level <= 3) {
    return {
      level,
      category,
      canProceed: true,
      requiresProfessional: false,
      
      acknowledgment: `Mild discomfort (${level}/10) noted during ${exerciseName}.`,
      acknowledgmentIt: `Fastidio lieve (${level}/10) notato durante ${exerciseName}.`,
      
      explanation: 'This level is generally okay to work through. Monitor if it changes.',
      explanationIt: 'Questo livello è generalmente ok. Monitora se cambia.',
      
      options: [
        {
          id: 'continue_normal',
          label: 'Continue set',
          labelIt: 'Continua il set',
          description: 'Keep going if it feels manageable',
          descriptionIt: 'Continua se sembra gestibile',
          recommended: true
        },
        {
          id: 'continue_adapted',
          label: 'Reduce for remaining sets',
          labelIt: 'Riduci per i set rimanenti',
          description: '-15% load for safety',
          descriptionIt: '-15% carico per sicurezza',
          loadModifier: 0.85
        }
      ]
    };
  }
  
  if (level <= 5) {
    return {
      level,
      category,
      canProceed: true,
      requiresProfessional: false,
      
      acknowledgment: repAtDiscomfort 
        ? `Discomfort emerged at rep ${repAtDiscomfort}/${totalReps} (${level}/10).`
        : `Discomfort (${level}/10) during ${exerciseName}.`,
      acknowledgmentIt: repAtDiscomfort
        ? `Fastidio emerso alla rep ${repAtDiscomfort}/${totalReps} (${level}/10).`
        : `Fastidio (${level}/10) durante ${exerciseName}.`,
      
      explanation: 'Discomfort emerging during exercise deserves attention. What would you like to do?',
      explanationIt: 'Un fastidio che emerge durante l\'esercizio merita attenzione. Cosa vorresti fare?',
      
      options: [
        {
          id: 'continue_adapted',
          label: 'Reduce load',
          labelIt: 'Riduci il carico',
          description: '-20% and complete remaining sets',
          descriptionIt: '-20% e completa i set rimanenti',
          recommended: true,
          loadModifier: 0.8
        },
        {
          id: 'switch_exercise',
          label: 'Switch to alternative',
          labelIt: 'Passa ad alternativa',
          description: 'Try a different variation',
          descriptionIt: 'Prova una variante diversa'
        },
        {
          id: 'skip_exercise',
          label: 'Skip remaining sets',
          labelIt: 'Salta i set rimanenti',
          description: 'Move to next exercise',
          descriptionIt: 'Passa al prossimo esercizio'
        }
      ],
      
      educationalNote: 'When discomfort appears during exercise, it\'s telling you this specific movement is challenging your current capacity. Adapting is smart, not weak.',
      educationalNoteIt: 'Quando un fastidio appare durante l\'esercizio, ti sta dicendo che questo movimento specifico sta sfidando la tua capacità attuale. Adattarsi è intelligente, non debole.'
    };
  }
  
  // 6+ durante esercizio = stop
  return {
    level,
    category: level >= 7 ? 'severe' : 'significant',
    canProceed: level < 7,
    requiresProfessional: level >= 7,
    
    acknowledgment: `⚠️ Significant discomfort (${level}/10) during ${exerciseName}.`,
    acknowledgmentIt: `⚠️ Fastidio significativo (${level}/10) durante ${exerciseName}.`,
    
    explanation: 'We recommend stopping this exercise for today.',
    explanationIt: 'Ti consigliamo di interrompere questo esercizio per oggi.',
    
    options: [
      {
        id: 'skip_exercise',
        label: 'Stop this exercise',
        labelIt: 'Ferma questo esercizio',
        description: 'Move to next exercise that doesn\'t involve this area',
        descriptionIt: 'Passa al prossimo esercizio che non coinvolge questa zona',
        recommended: true
      },
      {
        id: 'end_session',
        label: 'End session',
        labelIt: 'Termina sessione',
        description: 'If you prefer to rest today',
        descriptionIt: 'Se preferisci riposarti oggi'
      }
    ],
    
    warning: level >= 7
      ? 'Discomfort at this level is your body\'s clear signal. Please don\'t push through. Consider consulting a professional if this persists.'
      : 'This exercise doesn\'t seem right for you today. That\'s okay - we\'ll track this and adapt.',
    warningIt: level >= 7
      ? 'Un fastidio a questo livello è un segnale chiaro del tuo corpo. Per favore non forzare. Considera di consultare un professionista se persiste.'
      : 'Questo esercizio non sembra adatto per te oggi. Va bene - lo tracceremo e ci adatteremo.'
  };
}

// ============================================================================
// POST-EXERCISE DISCOMFORT MESSAGES  
// ============================================================================

/**
 * Messaggi per fastidio post-esercizio (dopo aver completato)
 */
export function getPostExerciseDiscomfortResponse(
  level: DiscomfortLevel,
  bodyArea: string,
  exerciseName: string
): {
  message: string;
  messageIt: string;
  action: 'log' | 'flag' | 'professional';
  shouldFlagExercise: boolean;
} {
  const areaLabel = BODY_AREA_LABELS[bodyArea] || bodyArea;
  
  if (level <= 3) {
    return {
      message: `Post-exercise discomfort noted. This is common and usually resolves within 24-48h. We'll check in next session.`,
      messageIt: `Fastidio post-esercizio annotato. È comune e di solito si risolve in 24-48h. Controlleremo alla prossima sessione.`,
      action: 'log',
      shouldFlagExercise: false
    };
  }
  
  if (level <= 5) {
    return {
      message: `Moderate post-exercise discomfort noted for "${exerciseName}". We'll track this and may adjust load next time if it persists.`,
      messageIt: `Fastidio moderato post-esercizio annotato per "${exerciseName}". Lo tracceremo e potremmo aggiustare il carico la prossima volta se persiste.`,
      action: 'flag',
      shouldFlagExercise: true
    };
  }
  
  if (level <= 6) {
    return {
      message: `Significant post-exercise discomfort. "${exerciseName}" has been flagged. Next session we'll use a modified version or alternative.`,
      messageIt: `Fastidio significativo post-esercizio. "${exerciseName}" è stato segnalato. La prossima sessione useremo una versione modificata o un'alternativa.`,
      action: 'flag',
      shouldFlagExercise: true
    };
  }
  
  return {
    message: `High post-exercise discomfort reported. We recommend rest and consulting a physiotherapist if this doesn't improve in 48-72h. "${exerciseName}" has been flagged for review.`,
    messageIt: `Fastidio post-esercizio elevato segnalato. Ti consigliamo riposo e di consultare un fisioterapista se non migliora in 48-72h. "${exerciseName}" è stato segnalato per revisione.`,
    action: 'professional',
    shouldFlagExercise: true
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  getDiscomfortResponse,
  getTolerableDiscomfortInfo,
  getPostSetDiscomfortOptions,
  checkPersistentDiscomfort,
  getReturnToNormalMessage,
  getInSessionDiscomfortResponse,
  getPostExerciseDiscomfortResponse,
  categorizeDiscomfort,
  PRE_WORKOUT_MESSAGES,
  BODY_AREA_LABELS,
  TOLERABLE_THRESHOLD,
  PROFESSIONAL_THRESHOLD,
  SESSIONS_FOR_PROFESSIONAL
};
