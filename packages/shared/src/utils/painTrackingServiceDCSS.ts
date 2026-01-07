/**
 * PAIN TRACKING SERVICE - DCSS Paradigm Revision
 * 
 * Principi guida:
 * 1. Fastidio, non "dolore" (linguaggio meno allarmante)
 * 2. Scelta all'utente: proponiamo opzioni, l'utente decide
 * 3. Tolerable discomfort: 3-4/10 che non peggiora è accettabile
 * 4. Return to normal: celebriamo il recupero
 * 5. 7+/10: consigliamo professionista, non permettiamo allenamento zona
 * 
 * Flow:
 * - Livello 1-3: Registra, informa, procedi
 * - Livello 4-6: Proponi opzioni (riduci/cambia/continua)
 * - Livello 7+: Consiglia professionista, salta zona
 */

// ============================================================================
// TYPES
// ============================================================================

export type DiscomfortLevel = 'none' | 'mild' | 'moderate' | 'significant';

export type UserChoice = 
  | 'continue_normal'      // Procedi come programmato
  | 'continue_adapted'     // Procedi con adattamento
  | 'change_exercise'      // Cambia esercizio
  | 'skip_exercise'        // Salta esercizio
  | 'end_session';         // Termina sessione

export interface DiscomfortReport {
  area: string;
  intensity: number;  // 1-10
  level: DiscomfortLevel;
  timestamp: string;
  sessionId: string;
  exerciseId?: string;
  exerciseName?: string;
  phase: 'pre_workout' | 'during_set' | 'post_set' | 'post_workout';
}

export interface AdaptationOption {
  id: UserChoice;
  label: string;
  labelIt: string;
  description: string;
  descriptionIt: string;
  recommended: boolean;
  loadReduction?: number;  // percentage
  alternativeExercise?: string;
}

export interface DiscomfortResponse {
  level: DiscomfortLevel;
  message: string;
  messageIt: string;
  options: AdaptationOption[];
  showTolerableReminder: boolean;
  suggestProfessional: boolean;
  canContinue: boolean;
  educationalNote?: string;
  educationalNoteIt?: string;
}

export interface RecoveryProgress {
  area: string;
  exerciseId: string;
  exerciseName: string;
  painFreeSessions: number;
  targetSessions: number;
  currentLoadPercent: number;
  nextLoadPercent: number;
  phase: 'active_rest' | 'light_load' | 'progressive' | 'return_to_normal';
  isComplete: boolean;
}

export interface RecoveryTracker {
  userId: string;
  activeRecoveries: Map<string, RecoveryProgress>;
  completedRecoveries: Array<{
    area: string;
    exerciseId: string;
    completedAt: string;
    totalWeeks: number;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOLERABLE_DISCOMFORT_THRESHOLD = 4;  // Up to 4/10 is generally acceptable
const PROFESSIONAL_THRESHOLD = 7;           // 7+ requires professional
const SESSIONS_FOR_RECOVERY = 3;            // 3 pain-free sessions to progress
const LOAD_PROGRESSION_STEPS = [60, 75, 85, 95, 100];  // % progression

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Classify discomfort level from intensity
 */
export function classifyDiscomfort(intensity: number): DiscomfortLevel {
  if (intensity <= 0) return 'none';
  if (intensity <= 3) return 'mild';
  if (intensity <= 6) return 'moderate';
  return 'significant';
}

/**
 * Evaluate discomfort and generate response with options
 * DCSS approach: Inform and offer choices, don't impose
 */
export function evaluateDiscomfort(
  report: DiscomfortReport,
  exerciseContext?: {
    exerciseName: string;
    targetMuscle: string;
    alternativeAvailable?: string;
  }
): DiscomfortResponse {
  const level = classifyDiscomfort(report.intensity);
  
  // ============================================
  // LEVEL: NONE (0)
  // ============================================
  if (level === 'none') {
    return {
      level: 'none',
      message: 'No discomfort reported. Proceed normally.',
      messageIt: 'Nessun fastidio segnalato. Procedi normalmente.',
      options: [{
        id: 'continue_normal',
        label: 'Continue',
        labelIt: 'Continua',
        description: 'Proceed with programmed workout',
        descriptionIt: 'Procedi con l\'allenamento programmato',
        recommended: true
      }],
      showTolerableReminder: false,
      suggestProfessional: false,
      canContinue: true
    };
  }
  
  // ============================================
  // LEVEL: MILD (1-3)
  // ============================================
  if (level === 'mild') {
    return {
      level: 'mild',
      message: `Mild discomfort noted (${report.intensity}/10). This level is generally acceptable during training. Proceed as you feel comfortable.`,
      messageIt: `Fastidio lieve registrato (${report.intensity}/10). Questo livello è generalmente accettabile durante l'allenamento. Procedi come ti senti.`,
      options: [
        {
          id: 'continue_normal',
          label: 'Continue normally',
          labelIt: 'Continua normalmente',
          description: 'Proceed with programmed workout',
          descriptionIt: 'Procedi con l\'allenamento programmato',
          recommended: true
        },
        {
          id: 'continue_adapted',
          label: 'Reduce load slightly',
          labelIt: 'Riduci leggermente il carico',
          description: '10% load reduction for extra comfort',
          descriptionIt: 'Riduzione del 10% per maggiore comfort',
          recommended: false,
          loadReduction: 10
        }
      ],
      showTolerableReminder: true,
      suggestProfessional: false,
      canContinue: true,
      educationalNote: 'Mild discomfort (1-3/10) that doesn\'t worsen during exercise is normal and generally safe to work through.',
      educationalNoteIt: 'Un fastidio lieve (1-3/10) che non peggiora durante l\'esercizio è normale e generalmente sicuro da gestire.'
    };
  }
  
  // ============================================
  // LEVEL: MODERATE (4-6)
  // ============================================
  if (level === 'moderate') {
    const options: AdaptationOption[] = [
      {
        id: 'continue_adapted',
        label: 'Continue with adaptation',
        labelIt: 'Continua con adattamento',
        description: '20% load reduction for this exercise',
        descriptionIt: 'Riduzione del 20% del carico per questo esercizio',
        recommended: true,
        loadReduction: 20
      },
      {
        id: 'continue_normal',
        label: 'Proceed as programmed',
        labelIt: 'Procedi come programmato',
        description: 'If you feel you can manage it',
        descriptionIt: 'Se senti di poterlo gestire',
        recommended: false
      }
    ];
    
    // Add exercise alternative if available
    if (exerciseContext?.alternativeAvailable) {
      options.splice(1, 0, {
        id: 'change_exercise',
        label: 'Change exercise',
        labelIt: 'Cambia esercizio',
        description: `Try ${exerciseContext.alternativeAvailable} instead`,
        descriptionIt: `Prova ${exerciseContext.alternativeAvailable} invece`,
        recommended: false,
        alternativeExercise: exerciseContext.alternativeAvailable
      });
    }
    
    options.push({
      id: 'skip_exercise',
      label: 'Skip this exercise',
      labelIt: 'Salta questo esercizio',
      description: 'Move to the next exercise',
      descriptionIt: 'Passa al prossimo esercizio',
      recommended: false
    });
    
    return {
      level: 'moderate',
      message: `Moderate discomfort (${report.intensity}/10). You have options for how to proceed.`,
      messageIt: `Fastidio moderato (${report.intensity}/10). Hai diverse opzioni per procedere.`,
      options,
      showTolerableReminder: true,
      suggestProfessional: false,
      canContinue: true,
      educationalNote: 'With moderate discomfort, adapting the load often allows you to continue training effectively while respecting your body\'s signals.',
      educationalNoteIt: 'Con fastidio moderato, adattare il carico spesso permette di continuare ad allenarti efficacemente rispettando i segnali del corpo.'
    };
  }
  
  // ============================================
  // LEVEL: SIGNIFICANT (7+)
  // ============================================
  return {
    level: 'significant',
    message: `Significant discomfort (${report.intensity}/10). We recommend consulting a physiotherapist or sports doctor before continuing with exercises involving this area.`,
    messageIt: `Fastidio importante (${report.intensity}/10). Ti consigliamo di consultare un fisioterapista o medico sportivo prima di continuare con esercizi che coinvolgono questa zona.`,
    options: [
      {
        id: 'skip_exercise',
        label: 'Skip exercises for this area',
        labelIt: 'Salta gli esercizi per questa zona',
        description: 'Continue with other exercises',
        descriptionIt: 'Continua con gli altri esercizi',
        recommended: true
      },
      {
        id: 'end_session',
        label: 'End session',
        labelIt: 'Termina sessione',
        description: 'Rest today, consult a professional',
        descriptionIt: 'Riposa oggi, consulta un professionista',
        recommended: false
      }
    ],
    showTolerableReminder: false,
    suggestProfessional: true,
    canContinue: false,  // Cannot continue with this area
    educationalNote: 'With significant discomfort, professional evaluation is recommended. This is not an emergency, but training through significant pain can delay recovery.',
    educationalNoteIt: 'Con fastidio importante, è consigliata una valutazione professionale. Non è un\'emergenza, ma allenarsi con dolore significativo può ritardare il recupero.'
  };
}

/**
 * Evaluate discomfort change during set
 * Returns guidance based on whether it got better, same, or worse
 */
export function evaluateDiscomfortChange(
  before: number,
  after: number,
  exerciseName: string
): {
  trend: 'improved' | 'stable' | 'worsened' | 'significantly_worsened';
  message: string;
  messageIt: string;
  recommendation: UserChoice;
  showAlert: boolean;
} {
  const change = after - before;
  
  // Improved or same
  if (change <= 0) {
    return {
      trend: change < 0 ? 'improved' : 'stable',
      message: after <= 0 
        ? 'Discomfort resolved during exercise. This is a good sign!'
        : 'Discomfort stayed the same or improved. You can continue.',
      messageIt: after <= 0
        ? 'Il fastidio si è risolto durante l\'esercizio. È un buon segno!'
        : 'Il fastidio è rimasto uguale o è migliorato. Puoi continuare.',
      recommendation: 'continue_normal',
      showAlert: false
    };
  }
  
  // Slightly worse (1-2 points)
  if (change <= 2 && after <= 6) {
    return {
      trend: 'worsened',
      message: `Discomfort increased slightly to ${after}/10. Consider reducing load for remaining sets.`,
      messageIt: `Il fastidio è aumentato leggermente a ${after}/10. Considera di ridurre il carico per le serie rimanenti.`,
      recommendation: 'continue_adapted',
      showAlert: false
    };
  }
  
  // Significantly worse (3+ points or now above 6)
  return {
    trend: 'significantly_worsened',
    message: `Discomfort increased to ${after}/10. We suggest skipping remaining sets of ${exerciseName}.`,
    messageIt: `Il fastidio è aumentato a ${after}/10. Ti suggeriamo di saltare le serie rimanenti di ${exerciseName}.`,
    recommendation: after >= 7 ? 'skip_exercise' : 'continue_adapted',
    showAlert: true
  };
}

/**
 * Check for persistent discomfort pattern
 * Returns true if same area reported in multiple consecutive sessions
 */
export function checkPersistentPattern(
  history: DiscomfortReport[],
  area: string,
  sessionThreshold: number = 3
): {
  isPersistent: boolean;
  consecutiveSessions: number;
  averageIntensity: number;
  message?: string;
  messageIt?: string;
} {
  // Group by session
  const sessionMap = new Map<string, DiscomfortReport[]>();
  history.forEach(report => {
    if (report.area === area) {
      const existing = sessionMap.get(report.sessionId) || [];
      existing.push(report);
      sessionMap.set(report.sessionId, existing);
    }
  });
  
  // Count consecutive sessions with this area
  const sessions = Array.from(sessionMap.keys()).sort().reverse();
  let consecutiveCount = 0;
  let totalIntensity = 0;
  
  for (const sessionId of sessions) {
    const reports = sessionMap.get(sessionId)!;
    const maxIntensity = Math.max(...reports.map(r => r.intensity));
    
    if (maxIntensity >= 4) {  // Only count if moderate+
      consecutiveCount++;
      totalIntensity += maxIntensity;
    } else {
      break;  // Chain broken
    }
  }
  
  const isPersistent = consecutiveCount >= sessionThreshold;
  const averageIntensity = consecutiveCount > 0 ? totalIntensity / consecutiveCount : 0;
  
  if (isPersistent) {
    return {
      isPersistent: true,
      consecutiveSessions: consecutiveCount,
      averageIntensity,
      message: `Discomfort in ${area} has been reported for ${consecutiveCount} consecutive sessions. Consider consulting a physiotherapist for a targeted assessment.`,
      messageIt: `Il fastidio a ${area} è stato segnalato per ${consecutiveCount} sessioni consecutive. Considera di consultare un fisioterapista per una valutazione mirata.`
    };
  }
  
  return {
    isPersistent: false,
    consecutiveSessions: consecutiveCount,
    averageIntensity
  };
}

// ============================================================================
// RECOVERY TRACKING
// ============================================================================

/**
 * Initialize recovery tracking for an area/exercise
 */
export function initializeRecovery(
  area: string,
  exerciseId: string,
  exerciseName: string,
  initialIntensity: number
): RecoveryProgress {
  return {
    area,
    exerciseId,
    exerciseName,
    painFreeSessions: 0,
    targetSessions: SESSIONS_FOR_RECOVERY,
    currentLoadPercent: initialIntensity >= 6 ? 60 : 75,  // Start lower for higher discomfort
    nextLoadPercent: initialIntensity >= 6 ? 75 : 85,
    phase: 'light_load',
    isComplete: false
  };
}

/**
 * Update recovery progress after a session
 * DCSS approach: Celebrate progress, encourage gradual return
 */
export function updateRecoveryProgress(
  progress: RecoveryProgress,
  sessionWasPainFree: boolean,
  maxDiscomfortDuringSession: number = 0
): {
  updatedProgress: RecoveryProgress;
  message: string;
  messageIt: string;
  celebration: boolean;
} {
  const updated = { ...progress };
  
  // Session with significant discomfort - reset or extend
  if (maxDiscomfortDuringSession >= 4) {
    updated.painFreeSessions = Math.max(0, updated.painFreeSessions - 1);
    
    // If discomfort returned at current load, maybe drop back
    if (maxDiscomfortDuringSession >= 5 && updated.currentLoadPercent > 60) {
      updated.currentLoadPercent = Math.max(60, updated.currentLoadPercent - 10);
    }
    
    return {
      updatedProgress: updated,
      message: `Discomfort returned during session. We'll stay at ${updated.currentLoadPercent}% load. Progress: ${updated.painFreeSessions}/${updated.targetSessions} sessions.`,
      messageIt: `Il fastidio è tornato durante la sessione. Restiamo al ${updated.currentLoadPercent}% del carico. Progresso: ${updated.painFreeSessions}/${updated.targetSessions} sessioni.`,
      celebration: false
    };
  }
  
  // Pain-free session - progress!
  if (sessionWasPainFree || maxDiscomfortDuringSession <= 3) {
    updated.painFreeSessions++;
    
    // Check if ready to progress load
    if (updated.painFreeSessions >= updated.targetSessions) {
      const currentIndex = LOAD_PROGRESSION_STEPS.indexOf(updated.currentLoadPercent);
      
      if (currentIndex < LOAD_PROGRESSION_STEPS.length - 1) {
        // Progress to next load level
        updated.currentLoadPercent = LOAD_PROGRESSION_STEPS[currentIndex + 1];
        updated.nextLoadPercent = LOAD_PROGRESSION_STEPS[currentIndex + 2] || 100;
        updated.painFreeSessions = 0;  // Reset counter for next phase
        
        // Update phase
        if (updated.currentLoadPercent >= 95) {
          updated.phase = 'return_to_normal';
        } else if (updated.currentLoadPercent >= 85) {
          updated.phase = 'progressive';
        }
        
        return {
          updatedProgress: updated,
          message: `Great progress! Moving to ${updated.currentLoadPercent}% load. ${updated.currentLoadPercent === 100 ? 'You\'re back to normal!' : `Next milestone: ${updated.nextLoadPercent}%`}`,
          messageIt: `Ottimo progresso! Passiamo al ${updated.currentLoadPercent}% del carico. ${updated.currentLoadPercent === 100 ? 'Sei tornato alla normalità!' : `Prossimo obiettivo: ${updated.nextLoadPercent}%`}`,
          celebration: true
        };
      } else {
        // Reached 100% - complete!
        updated.isComplete = true;
        updated.phase = 'return_to_normal';
        
        return {
          updatedProgress: updated,
          message: `🎉 ${updated.exerciseName} is back in your program without restrictions! Great job managing this recovery.`,
          messageIt: `🎉 ${updated.exerciseName} è tornato nel programma senza restrizioni! Ottimo lavoro nel gestire questo recupero.`,
          celebration: true
        };
      }
    }
    
    // Progress within current load level
    return {
      updatedProgress: updated,
      message: `Session completed! Progress: ${updated.painFreeSessions}/${updated.targetSessions} sessions at ${updated.currentLoadPercent}% load.`,
      messageIt: `Sessione completata! Progresso: ${updated.painFreeSessions}/${updated.targetSessions} sessioni al ${updated.currentLoadPercent}% del carico.`,
      celebration: updated.painFreeSessions === updated.targetSessions - 1  // Celebrate when close
    };
  }
  
  return {
    updatedProgress: updated,
    message: `Session recorded. Continue at ${updated.currentLoadPercent}% load.`,
    messageIt: `Sessione registrata. Continua al ${updated.currentLoadPercent}% del carico.`,
    celebration: false
  };
}

/**
 * Generate recovery summary for user
 */
export function generateRecoverySummary(
  progress: RecoveryProgress
): {
  title: string;
  titleIt: string;
  stats: Array<{ label: string; labelIt: string; value: string; status: 'complete' | 'in_progress' | 'pending' }>;
  nextStep: string;
  nextStepIt: string;
} {
  const stats = [
    {
      label: 'Pain-free sessions',
      labelIt: 'Sessioni senza fastidio',
      value: `${progress.painFreeSessions}/${progress.targetSessions}`,
      status: progress.painFreeSessions >= progress.targetSessions ? 'complete' as const : 'in_progress' as const
    },
    {
      label: 'Current load',
      labelIt: 'Carico attuale',
      value: `${progress.currentLoadPercent}%`,
      status: progress.currentLoadPercent >= 100 ? 'complete' as const : 'in_progress' as const
    },
    {
      label: 'Phase',
      labelIt: 'Fase',
      value: progress.phase.replace(/_/g, ' '),
      status: progress.isComplete ? 'complete' as const : 'in_progress' as const
    }
  ];
  
  let nextStep: string;
  let nextStepIt: string;
  
  if (progress.isComplete) {
    nextStep = 'Recovery complete! Continue training normally.';
    nextStepIt = 'Recupero completato! Continua ad allenarti normalmente.';
  } else if (progress.painFreeSessions >= progress.targetSessions - 1) {
    nextStep = `One more pain-free session and you'll progress to ${progress.nextLoadPercent}% load!`;
    nextStepIt = `Ancora una sessione senza fastidio e passerai al ${progress.nextLoadPercent}% del carico!`;
  } else {
    nextStep = `Complete ${progress.targetSessions - progress.painFreeSessions} more pain-free sessions to progress.`;
    nextStepIt = `Completa ancora ${progress.targetSessions - progress.painFreeSessions} sessioni senza fastidio per progredire.`;
  }
  
  return {
    title: `Recovery Progress: ${progress.exerciseName}`,
    titleIt: `Progresso Recupero: ${progress.exerciseName}`,
    stats,
    nextStep,
    nextStepIt
  };
}

// ============================================================================
// EXERCISE ADAPTATION
// ============================================================================

/**
 * Calculate load reduction based on discomfort level
 * DCSS approach: Gradual, not aggressive
 */
export function calculateLoadReduction(discomfortLevel: number): {
  percentage: number;
  message: string;
  messageIt: string;
} {
  if (discomfortLevel <= 3) {
    return {
      percentage: 0,
      message: 'No load reduction needed for mild discomfort.',
      messageIt: 'Nessuna riduzione necessaria per fastidio lieve.'
    };
  }
  
  if (discomfortLevel <= 4) {
    return {
      percentage: 10,
      message: '10% load reduction suggested for moderate discomfort.',
      messageIt: 'Riduzione del 10% suggerita per fastidio moderato.'
    };
  }
  
  if (discomfortLevel <= 6) {
    return {
      percentage: 20,
      message: '20% load reduction suggested. This allows you to continue training while respecting your body.',
      messageIt: 'Riduzione del 20% suggerita. Questo ti permette di continuare ad allenarti rispettando il tuo corpo.'
    };
  }
  
  // 7+: Should not be training this area
  return {
    percentage: 100,  // Skip entirely
    message: 'We recommend skipping this exercise today and consulting a professional.',
    messageIt: 'Ti consigliamo di saltare questo esercizio oggi e consultare un professionista.'
  };
}

/**
 * Get alternative exercise suggestion based on area of discomfort
 */
export function getAlternativeExercise(
  originalExercise: string,
  discomfortArea: string,
  availableEquipment: string[] = []
): {
  alternative: string;
  reason: string;
  reasonIt: string;
} | null {
  // This would be expanded with full exercise database
  const alternatives: Record<string, Record<string, { alt: string; reason: string; reasonIt: string }>> = {
    'lower_back': {
      'Barbell Squat': { 
        alt: 'Leg Press', 
        reason: 'Leg Press maintains quad stimulus with supported back position.',
        reasonIt: 'La Leg Press mantiene lo stimolo sui quadricipiti con la schiena supportata.'
      },
      'Conventional Deadlift': { 
        alt: 'Trap Bar Deadlift', 
        reason: 'Trap Bar allows more upright torso, reducing lower back stress.',
        reasonIt: 'La Trap Bar permette un torso più verticale, riducendo lo stress sulla bassa schiena.'
      },
      'Barbell Row': { 
        alt: 'Chest Supported Row', 
        reason: 'Chest support eliminates lower back demand while training back.',
        reasonIt: 'Il supporto petto elimina la richiesta sulla bassa schiena mentre alleni la schiena.'
      },
      'Romanian Deadlift': {
        alt: 'Lying Leg Curl',
        reason: 'Targets hamstrings without lower back loading.',
        reasonIt: 'Lavora i femorali senza caricare la bassa schiena.'
      }
    },
    'shoulder': {
      'Overhead Press': { 
        alt: 'Landmine Press', 
        reason: 'Landmine angle is easier on shoulders while training similar pattern.',
        reasonIt: 'L\'angolo del Landmine è più facile sulle spalle mentre allena un pattern simile.'
      },
      'Bench Press': { 
        alt: 'Floor Press', 
        reason: 'Limited ROM reduces shoulder stress at the bottom.',
        reasonIt: 'Il ROM limitato riduce lo stress sulla spalla nel punto basso.'
      },
      'Lateral Raise': {
        alt: 'Cable Lateral Raise',
        reason: 'Cable provides more consistent tension and often feels smoother.',
        reasonIt: 'Il cavo fornisce tensione più costante e spesso risulta più fluido.'
      }
    },
    'knee': {
      'Barbell Squat': { 
        alt: 'Box Squat', 
        reason: 'Box reduces knee travel and allows you to control depth.',
        reasonIt: 'Il box riduce l\'escursione del ginocchio e permette di controllare la profondità.'
      },
      'Leg Extension': { 
        alt: 'Leg Press (high and narrow)', 
        reason: 'Compound movement often more knee-friendly than isolated extension.',
        reasonIt: 'Il movimento composto è spesso più amichevole per il ginocchio dell\'estensione isolata.'
      },
      'Walking Lunge': {
        alt: 'Reverse Lunge',
        reason: 'Reverse lunges have lower knee shear forces.',
        reasonIt: 'Gli affondi inversi hanno minori forze di taglio sul ginocchio.'
      }
    }
  };
  
  const areaAlternatives = alternatives[discomfortArea];
  if (!areaAlternatives) return null;
  
  const exerciseAlt = areaAlternatives[originalExercise];
  if (!exerciseAlt) return null;
  
  return {
    alternative: exerciseAlt.alt,
    reason: exerciseAlt.reason,
    reasonIt: exerciseAlt.reasonIt
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  classifyDiscomfort,
  evaluateDiscomfort,
  evaluateDiscomfortChange,
  checkPersistentPattern,
  initializeRecovery,
  updateRecoveryProgress,
  generateRecoverySummary,
  calculateLoadReduction,
  getAlternativeExercise,
  TOLERABLE_DISCOMFORT_THRESHOLD,
  PROFESSIONAL_THRESHOLD,
  SESSIONS_FOR_RECOVERY
};
