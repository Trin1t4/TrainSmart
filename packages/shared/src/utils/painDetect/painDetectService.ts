/**
 * Pain Detect 2.0 - Core Service
 *
 * Logica principale per la valutazione e gestione del fastidio durante l'allenamento.
 */

import {
  BodyArea,
  DiscomfortIntensity,
  DiscomfortLevel,
  DiscomfortReport,
  DiscomfortResponse,
  DiscomfortTrend,
  ExerciseCheck,
  ExerciseParams,
  AdaptedExerciseParams,
  LoadReduction,
  PostSetResult,
  ReportPhase,
  UserChoice,
  UserOption,
  PAIN_THRESHOLDS,
  LOAD_REDUCTIONS,
  BODY_AREA_LABELS,
} from './painDetectTypes';

// =============================================================================
// CLASSIFICAZIONE FASTIDIO
// =============================================================================

/**
 * Classifica l'intensità del fastidio in un livello descrittivo
 */
export function classifyDiscomfort(intensity: DiscomfortIntensity): DiscomfortLevel {
  if (intensity === 0) return 'none';
  if (intensity <= 3) return 'mild';
  if (intensity <= 4) return 'moderate';
  if (intensity <= 6) return 'significant';
  return 'severe';
}

/**
 * Ottiene le riduzioni di carico basate sull'intensità del fastidio
 */
export function getLoadReductions(intensity: DiscomfortIntensity): LoadReduction {
  if (intensity <= 3) return LOAD_REDUCTIONS.MILD;
  if (intensity === 4) return LOAD_REDUCTIONS.MODERATE_LOW;
  if (intensity <= 6) return LOAD_REDUCTIONS.MODERATE_HIGH;
  return LOAD_REDUCTIONS.SIGNIFICANT;
}

// =============================================================================
// MESSAGGI PER LIVELLO
// =============================================================================

interface LevelMessages {
  messageIt: string;
  messageEn: string;
  educationalNoteIt?: string;
  educationalNoteEn?: string;
}

function getMessagesForLevel(level: DiscomfortLevel, exerciseName?: string): LevelMessages {
  const exercise = exerciseName || "l'esercizio";

  switch (level) {
    case 'none':
      return {
        messageIt: 'Nessun fastidio segnalato. Puoi procedere normalmente.',
        messageEn: 'No discomfort reported. You can proceed normally.',
      };
    case 'mild':
      return {
        messageIt: `Fastidio lieve (1-3/10). Puoi continuare ${exercise} monitorando le sensazioni.`,
        messageEn: `Mild discomfort (1-3/10). You can continue ${exercise} while monitoring your sensations.`,
        educationalNoteIt: 'Un fastidio lieve che non aumenta durante il movimento è generalmente accettabile.',
        educationalNoteEn: 'Mild discomfort that doesn\'t increase during movement is generally acceptable.',
      };
    case 'moderate':
      return {
        messageIt: `Fastidio moderato (4/10). Considera una leggera riduzione del carico per ${exercise}.`,
        messageEn: `Moderate discomfort (4/10). Consider a slight load reduction for ${exercise}.`,
        educationalNoteIt: 'A questo livello, ridurre il carico del 10% può aiutare a completare l\'allenamento in sicurezza.',
        educationalNoteEn: 'At this level, reducing the load by 10% can help complete the workout safely.',
      };
    case 'significant':
      return {
        messageIt: `Fastidio significativo (5-6/10). Raccomandiamo adattamenti o sostituzione per ${exercise}.`,
        messageEn: `Significant discomfort (5-6/10). We recommend adaptations or substitution for ${exercise}.`,
        educationalNoteIt: 'Con questo livello di fastidio, continuare senza adattamenti potrebbe peggiorare la situazione.',
        educationalNoteEn: 'At this level of discomfort, continuing without adaptations could worsen the situation.',
      };
    case 'severe':
      return {
        messageIt: `Fastidio severo (7+/10). Si consiglia di saltare ${exercise} e consultare un professionista.`,
        messageEn: `Severe discomfort (7+/10). We recommend skipping ${exercise} and consulting a professional.`,
        educationalNoteIt: 'Un dolore intenso richiede attenzione medica. Non forzare attraverso il dolore.',
        educationalNoteEn: 'Intense pain requires medical attention. Do not push through pain.',
      };
  }
}

// =============================================================================
// OPZIONI UTENTE
// =============================================================================

function generateUserOptions(
  level: DiscomfortLevel,
  intensity: DiscomfortIntensity,
  hasAlternative: boolean
): UserOption[] {
  const options: UserOption[] = [];

  switch (level) {
    case 'none':
    case 'mild':
      options.push({
        choice: 'continue_normal',
        labelIt: 'Continua normalmente',
        labelEn: 'Continue normally',
        descriptionIt: 'Prosegui senza modifiche',
        descriptionEn: 'Proceed without modifications',
        icon: '✅',
        recommended: true,
      });
      break;

    case 'moderate':
      options.push({
        choice: 'continue_adapted',
        labelIt: 'Continua con carico ridotto',
        labelEn: 'Continue with reduced load',
        descriptionIt: 'Riduzione del 10% sul carico',
        descriptionEn: '10% load reduction',
        icon: '⚖️',
        recommended: true,
        loadReductionPercent: 10,
      });
      options.push({
        choice: 'continue_normal',
        labelIt: 'Continua normalmente',
        labelEn: 'Continue normally',
        descriptionIt: 'Prosegui senza modifiche',
        descriptionEn: 'Proceed without modifications',
        icon: '💪',
        recommended: false,
      });
      break;

    case 'significant':
      if (hasAlternative) {
        options.push({
          choice: 'substitute_exercise',
          labelIt: 'Sostituisci esercizio',
          labelEn: 'Substitute exercise',
          descriptionIt: 'Passa a un esercizio alternativo più sicuro',
          descriptionEn: 'Switch to a safer alternative exercise',
          icon: '🔄',
          recommended: true,
        });
      }
      options.push({
        choice: 'continue_adapted',
        labelIt: 'Continua con adattamenti',
        labelEn: 'Continue with adaptations',
        descriptionIt: 'Riduzione del 20% carico, +25% riposo',
        descriptionEn: '20% load reduction, +25% rest',
        icon: '⚖️',
        recommended: !hasAlternative,
        loadReductionPercent: 20,
      });
      options.push({
        choice: 'skip_exercise',
        labelIt: 'Salta esercizio',
        labelEn: 'Skip exercise',
        descriptionIt: 'Passa al prossimo esercizio',
        descriptionEn: 'Move to the next exercise',
        icon: '⏭️',
        recommended: false,
      });
      break;

    case 'severe':
      options.push({
        choice: 'skip_exercise',
        labelIt: 'Salta esercizio',
        labelEn: 'Skip exercise',
        descriptionIt: 'Salta questo esercizio per oggi',
        descriptionEn: 'Skip this exercise for today',
        icon: '⏭️',
        recommended: true,
      });
      options.push({
        choice: 'skip_area',
        labelIt: 'Salta tutti per questa zona',
        labelEn: 'Skip all for this area',
        descriptionIt: 'Evita tutti gli esercizi che coinvolgono questa zona',
        descriptionEn: 'Avoid all exercises involving this area',
        icon: '🚫',
        recommended: false,
      });
      options.push({
        choice: 'end_session',
        labelIt: 'Termina sessione',
        labelEn: 'End session',
        descriptionIt: 'Concludi l\'allenamento per oggi',
        descriptionEn: 'End the workout for today',
        icon: '🛑',
        recommended: false,
      });
      break;
  }

  return options;
}

// =============================================================================
// VALUTAZIONE FASTIDIO
// =============================================================================

export interface EvaluateContext {
  exerciseName?: string;
  alternativeAvailable?: string;
  isRecurringIssue?: boolean;
}

/**
 * Valuta il fastidio segnalato e genera una risposta con opzioni
 */
export function evaluateDiscomfort(
  report: DiscomfortReport,
  context?: EvaluateContext
): DiscomfortResponse {
  const level = classifyDiscomfort(report.intensity);
  const messages = getMessagesForLevel(level, context?.exerciseName);
  const hasAlternative = !!context?.alternativeAvailable;
  const options = generateUserOptions(level, report.intensity, hasAlternative);

  const response: DiscomfortResponse = {
    reportId: report.id,
    level,
    intensity: report.intensity,
    messageIt: messages.messageIt,
    messageEn: messages.messageEn,
    educationalNoteIt: messages.educationalNoteIt,
    educationalNoteEn: messages.educationalNoteEn,
    showTolerableReminder: level === 'mild' || (level === 'moderate' && report.intensity <= PAIN_THRESHOLDS.TOLERABLE_MAX),
    suggestProfessional: report.intensity >= PAIN_THRESHOLDS.PROFESSIONAL_ADVICE,
    options,
  };

  // Aggiungi messaggio professionista se necessario
  if (response.suggestProfessional) {
    response.professionalMessageIt = 'Con un dolore di questa intensità, ti consigliamo di consultare un medico o fisioterapista prima di continuare l\'allenamento.';
    response.professionalMessageEn = 'With pain at this intensity, we recommend consulting a doctor or physiotherapist before continuing your workout.';
  }

  // Aggiungi adattamenti automatici se il livello lo richiede
  if (level === 'moderate' || level === 'significant') {
    response.autoAdaptations = getLoadReductions(report.intensity);
  }

  return response;
}

// =============================================================================
// APPLICAZIONE ADATTAMENTI
// =============================================================================

/**
 * Applica le riduzioni di carico ai parametri dell'esercizio
 */
export function applyAdaptations(
  params: ExerciseParams,
  intensity: DiscomfortIntensity,
  context: 'gym' | 'home' = 'gym'
): AdaptedExerciseParams {
  const reductions = getLoadReductions(intensity);
  const level = classifyDiscomfort(intensity);

  // Se nessuna riduzione necessaria, ritorna i parametri originali
  if (reductions.load === 0 && reductions.volume === 0) {
    return { ...params };
  }

  // Calcola nuovi valori
  const originalWeight = params.weight || 0;
  const newWeight = Math.round(originalWeight * (1 - reductions.load / 100));

  const originalSets = params.sets;
  const newSets = Math.max(1, Math.round(originalSets * (1 - reductions.volume / 100)));

  const originalRest = params.restSeconds;
  const newRest = Math.round(originalRest * (1 + reductions.rest / 100));

  // Genera nota di adattamento
  let adaptationNote = '';
  let adaptationNoteIt = '';

  if (reductions.load > 0 && reductions.load < 100) {
    adaptationNote = `Load reduced by ${reductions.load}%`;
    adaptationNoteIt = `Carico ridotto del ${reductions.load}%`;
  }
  if (reductions.volume > 0 && reductions.volume < 100) {
    adaptationNote += adaptationNote ? `, volume reduced by ${reductions.volume}%` : `Volume reduced by ${reductions.volume}%`;
    adaptationNoteIt += adaptationNoteIt ? `, volume ridotto del ${reductions.volume}%` : `Volume ridotto del ${reductions.volume}%`;
  }
  if (reductions.rest > 0) {
    adaptationNote += adaptationNote ? `, rest increased by ${reductions.rest}%` : `Rest increased by ${reductions.rest}%`;
    adaptationNoteIt += adaptationNoteIt ? `, riposo aumentato del ${reductions.rest}%` : `Riposo aumentato del ${reductions.rest}%`;
  }

  return {
    sets: newSets,
    reps: params.reps,
    weight: newWeight > 0 ? newWeight : undefined,
    restSeconds: newRest,
    adaptationNote,
    adaptationNoteIt,
    originalParams: params,
  };
}

// =============================================================================
// VALUTAZIONE POST-SET
// =============================================================================

/**
 * Valuta il trend del fastidio dopo un set
 */
export function evaluatePostSet(
  exerciseId: string,
  beforeIntensity: DiscomfortIntensity,
  afterIntensity: DiscomfortIntensity
): PostSetResult {
  const delta = afterIntensity - beforeIntensity;

  let trend: DiscomfortTrend;
  let suggestedAction: UserChoice;
  let loadAdjustment = 0;
  let messageIt: string;
  let messageEn: string;

  if (delta < 0) {
    // Migliorato
    trend = 'improved';
    suggestedAction = 'continue_normal';
    messageIt = 'Il fastidio è diminuito. Ottimo segnale, puoi continuare.';
    messageEn = 'Discomfort has decreased. Good sign, you can continue.';
  } else if (delta === 0) {
    // Stabile
    trend = 'stable';
    if (afterIntensity <= PAIN_THRESHOLDS.TOLERABLE_MAX) {
      suggestedAction = 'continue_normal';
      messageIt = 'Il fastidio è rimasto stabile e a un livello accettabile.';
      messageEn = 'Discomfort remained stable at an acceptable level.';
    } else {
      suggestedAction = 'continue_adapted';
      loadAdjustment = -10;
      messageIt = 'Il fastidio è rimasto stabile ma elevato. Considera di ridurre il carico.';
      messageEn = 'Discomfort remained stable but high. Consider reducing the load.';
    }
  } else if (delta <= 2) {
    // Leggermente peggiorato
    trend = 'worsened';
    suggestedAction = 'continue_adapted';
    loadAdjustment = -20;
    messageIt = `Il fastidio è aumentato di ${delta} punti. Riduci il carico del 20%.`;
    messageEn = `Discomfort increased by ${delta} points. Reduce load by 20%.`;
  } else {
    // Significativamente peggiorato
    trend = 'significantly_worsened';
    suggestedAction = 'skip_exercise';
    loadAdjustment = -100;
    messageIt = `Il fastidio è aumentato significativamente (+${delta}). Si consiglia di saltare questo esercizio.`;
    messageEn = `Discomfort increased significantly (+${delta}). We recommend skipping this exercise.`;
  }

  return {
    trend,
    beforeIntensity,
    afterIntensity,
    delta,
    messageIt,
    messageEn,
    suggestedAction,
    loadAdjustment,
  };
}

// =============================================================================
// VERIFICA ESERCIZIO
// =============================================================================

/**
 * Verifica se un esercizio è appropriato basandosi sui report pre-workout
 */
export function checkExercise(
  exerciseId: string,
  exerciseAreas: BodyArea[],
  preWorkoutReports: DiscomfortReport[]
): ExerciseCheck {
  // Trova report che riguardano le aree dell'esercizio
  const relevantReports = preWorkoutReports.filter(
    (r) => exerciseAreas.includes(r.area)
  );

  if (relevantReports.length === 0) {
    return {
      exerciseId,
      appropriate: true,
    };
  }

  // Trova l'intensità massima tra i report rilevanti
  const maxReport = relevantReports.reduce((max, r) =>
    r.intensity > max.intensity ? r : max
  );

  const areaLabel = BODY_AREA_LABELS[maxReport.area].it;

  if (maxReport.intensity >= PAIN_THRESHOLDS.BLOCK_AREA) {
    return {
      exerciseId,
      appropriate: false,
      preWorkoutIntensity: maxReport.intensity,
      reasonIt: `Hai segnalato fastidio ${maxReport.intensity}/10 in ${areaLabel}. Si consiglia di evitare questo esercizio.`,
      reasonEn: `You reported ${maxReport.intensity}/10 discomfort in ${BODY_AREA_LABELS[maxReport.area].en}. We recommend avoiding this exercise.`,
      suggestedAction: 'skip_exercise',
    };
  }

  if (maxReport.intensity >= PAIN_THRESHOLDS.SUGGEST_SUBSTITUTION) {
    return {
      exerciseId,
      appropriate: false,
      preWorkoutIntensity: maxReport.intensity,
      reasonIt: `Hai segnalato fastidio ${maxReport.intensity}/10 in ${areaLabel}. Considera una sostituzione.`,
      reasonEn: `You reported ${maxReport.intensity}/10 discomfort in ${BODY_AREA_LABELS[maxReport.area].en}. Consider a substitution.`,
      suggestedAction: 'substitute_exercise',
    };
  }

  // Esercizio appropriato ma con fastidio da monitorare
  return {
    exerciseId,
    appropriate: true,
    preWorkoutIntensity: maxReport.intensity,
  };
}

// =============================================================================
// CREAZIONE REPORT
// =============================================================================

/**
 * Crea un nuovo report di fastidio
 */
export function createDiscomfortReport(
  userId: string,
  sessionId: string,
  area: BodyArea,
  intensity: DiscomfortIntensity,
  phase: ReportPhase,
  exerciseId?: string,
  exerciseName?: string,
  setNumber?: number
): DiscomfortReport {
  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    sessionId,
    area,
    intensity,
    phase,
    exerciseId,
    exerciseName,
    setNumber,
    timestamp: new Date(),
  };
}
