/**
 * ============================================================================
 * PROGRAM VALIDATION & RUNTIME ADAPTATION
 * ============================================================================
 *
 * Sistema di validazione input e adattamento runtime per generazione programmi.
 * Gestisce:
 * - Validazione combinazioni impossibili
 * - Fallback per baseline invalidi
 * - Warning per goal conflittuali
 * - Limiti frequenza per level
 * - Runtime adaptation (cambio seduta)
 *
 * @module programValidation
 * @version 1.0.0
 */

import type { Level, Goal, PatternBaselines } from '../types';
import type { NormalizedPainArea } from './validators';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  corrections: ValidationCorrection[];
  shouldBlock: boolean; // Se true, non generare il programma
  suggestRest: boolean; // Se true, suggerisci giorno di riposo
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationCorrection {
  field: string;
  originalValue: any;
  correctedValue: any;
  reason: string;
}

export interface RuntimeContext {
  actualLocation?: 'gym' | 'home' | 'home_gym';
  emergingPainAreas?: NormalizedPainArea[];
  availableEquipment?: string[];
  availableTime?: number;
  detrainingFactor?: number;
  screeningResults?: ScreeningResults | null;
  previousSessionFeedback?: SessionFeedback;
}

export interface ScreeningResults {
  screening: {
    sleep: number; // 1-10
    stress: number; // 1-10
    painAreas: string[];
    timestamp: string;
  };
  recommendations: {
    intensityMultiplier: number;
    shouldReduceVolume: boolean;
    shouldFocusOnRecovery: boolean;
    volumeReduction: number;
  };
  warnings: string[];
}

export interface SessionFeedback {
  averageRPE: number;
  completionRate: number;
  notes?: string;
}

export interface RuntimeAdaptation {
  locationChanged: boolean;
  newLocation?: string;
  painAdaptations: PainAdaptation[];
  volumeMultiplier: number;
  intensityMultiplier: number;
  exerciseReplacements: ExerciseReplacement[];
  timeCompression?: TimeCompression;
  detrainingAdjustment?: number;
  warnings: string[];
  shouldSuggestRest: boolean;
}

export interface PainAdaptation {
  area: string;
  action: 'exclude' | 'deload' | 'replace';
  affectedPatterns: string[];
}

export interface ExerciseReplacement {
  original: string;
  replacement: string;
  reason: string;
}

export interface TimeCompression {
  originalDuration: number;
  availableDuration: number;
  exercisesRemoved: string[];
  setsReduced: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Frequenza massima per livello */
const MAX_FREQUENCY_BY_LEVEL: Record<string, number> = {
  beginner: 4,
  intermediate: 5,
  advanced: 6
};

/** Frequenza minima consigliata */
const MIN_EFFECTIVE_FREQUENCY = 2;

/** Durata minima sessione efficace (minuti) */
const MIN_SESSION_DURATION = 20;

/** Goal che richiedono rest lunghi (minuti per esercizio) */
const HIGH_REST_GOALS = ['forza', 'strength', 'prestazioni_sportive', 'sport_performance'];

/** Goal conflittuali */
const GOAL_CONFLICTS: [string, string][] = [
  ['forza', 'resistenza'],
  ['forza', 'dimagrimento'],
  ['massa', 'dimagrimento'],
  ['ipertrofia', 'resistenza']
];

/** Goal che overridano il level */
const LEVEL_OVERRIDE_GOALS = ['gravidanza', 'disabilita', 'motor_recovery', 'recupero_motorio'];

/** Numero massimo di pain areas severe prima di bloccare */
const MAX_SEVERE_PAIN_AREAS = 2;

/** Numero massimo totale di pain areas prima di warning */
const MAX_TOTAL_PAIN_AREAS = 4;

/** Equipment disponibile per location */
const EQUIPMENT_BY_LOCATION: Record<string, string[]> = {
  home: ['bodyweight', 'resistance_bands', 'light_dumbbells'],
  home_gym: ['bodyweight', 'barbell', 'dumbbells', 'rack', 'bench', 'cables', 'pull_up_bar'],
  gym: ['all']
};

/** Training types validi per location */
const VALID_TRAINING_TYPES: Record<string, string[]> = {
  home: ['bodyweight'],
  home_gym: ['bodyweight', 'equipment'],
  gym: ['bodyweight', 'equipment', 'machines']
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Valida tutti gli input del program generator
 */
export function validateProgramInput(options: {
  level: Level;
  goal: Goal;
  goals?: string[];
  location: 'gym' | 'home' | 'home_gym';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  sessionDuration?: number;
  equipment?: Record<string, boolean>;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const corrections: ValidationCorrection[] = [];

  let shouldBlock = false;
  let suggestRest = false;

  // 1. VALIDAZIONE LOCATION + TRAINING TYPE
  const locationValidation = validateLocationTrainingType(
    options.location,
    options.trainingType,
    options.equipment
  );
  errors.push(...locationValidation.errors);
  warnings.push(...locationValidation.warnings);
  corrections.push(...locationValidation.corrections);

  // 2. VALIDAZIONE FREQUENZA PER LEVEL
  const frequencyValidation = validateFrequency(
    options.frequency,
    options.level,
    options.goal
  );
  errors.push(...frequencyValidation.errors);
  warnings.push(...frequencyValidation.warnings);
  corrections.push(...frequencyValidation.corrections);

  // 3. VALIDAZIONE BASELINE
  const baselineValidation = validateBaselines(options.baselines);
  errors.push(...baselineValidation.errors);
  warnings.push(...baselineValidation.warnings);
  corrections.push(...baselineValidation.corrections);
  if (baselineValidation.shouldBlock) shouldBlock = true;

  // 4. VALIDAZIONE PAIN AREAS
  const painValidation = validatePainAreas(options.painAreas);
  errors.push(...painValidation.errors);
  warnings.push(...painValidation.warnings);
  if (painValidation.shouldBlock) shouldBlock = true;
  if (painValidation.suggestRest) suggestRest = true;

  // 5. VALIDAZIONE GOAL CONFLITTUALI
  const goalValidation = validateGoals(
    options.goal,
    options.goals,
    options.level
  );
  warnings.push(...goalValidation.warnings);

  // 6. VALIDAZIONE DURATA SESSIONE
  if (options.sessionDuration) {
    const durationValidation = validateSessionDuration(
      options.sessionDuration,
      options.goal,
      options.frequency
    );
    errors.push(...durationValidation.errors);
    warnings.push(...durationValidation.warnings);
  }

  // Determina se bloccare
  const criticalErrors = errors.filter(e => e.severity === 'critical');
  if (criticalErrors.length > 0) {
    shouldBlock = true;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    corrections,
    shouldBlock,
    suggestRest
  };
}

/**
 * Valida combinazione location + training type
 */
function validateLocationTrainingType(
  location: string,
  trainingType: string,
  equipment?: Record<string, boolean>
): { errors: ValidationError[]; warnings: ValidationWarning[]; corrections: ValidationCorrection[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const corrections: ValidationCorrection[] = [];

  const validTypes = VALID_TRAINING_TYPES[location] || [];

  // Home + Machines = impossibile
  if (location === 'home' && trainingType === 'machines') {
    errors.push({
      code: 'INVALID_LOCATION_TRAINING',
      field: 'trainingType',
      message: 'Non puoi usare macchine a casa. Verrà usato bodyweight.',
      severity: 'high'
    });
    corrections.push({
      field: 'trainingType',
      originalValue: 'machines',
      correctedValue: 'bodyweight',
      reason: 'Macchine non disponibili a casa'
    });
  }

  // Equipment training senza equipment dichiarato
  if (trainingType === 'equipment' && location !== 'gym') {
    const hasEquipment = equipment && Object.values(equipment).some(v => v === true);
    if (!hasEquipment) {
      warnings.push({
        code: 'NO_EQUIPMENT_DECLARED',
        field: 'equipment',
        message: 'Hai selezionato allenamento con attrezzi ma non hai specificato quali hai.',
        suggestion: 'Verifica l\'attrezzatura disponibile o passa a bodyweight'
      });
      corrections.push({
        field: 'trainingType',
        originalValue: 'equipment',
        correctedValue: 'bodyweight',
        reason: 'Nessun equipment specificato'
      });
    }
  }

  return { errors, warnings, corrections };
}

/**
 * Valida frequenza settimanale per level
 */
function validateFrequency(
  frequency: number,
  level: string,
  goal: string
): { errors: ValidationError[]; warnings: ValidationWarning[]; corrections: ValidationCorrection[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const corrections: ValidationCorrection[] = [];

  const maxFreq = MAX_FREQUENCY_BY_LEVEL[level] || 5;

  // Frequenza troppo alta per level
  if (frequency > maxFreq) {
    warnings.push({
      code: 'FREQUENCY_TOO_HIGH',
      field: 'frequency',
      message: `${frequency}x/settimana è troppo per livello ${level}. Massimo consigliato: ${maxFreq}x.`,
      suggestion: `Ridotto a ${maxFreq}x per garantire recupero adeguato`
    });
    corrections.push({
      field: 'frequency',
      originalValue: frequency,
      correctedValue: maxFreq,
      reason: `Frequenza massima per ${level}`
    });
  }

  // Frequenza troppo bassa per efficacia
  if (frequency < MIN_EFFECTIVE_FREQUENCY) {
    warnings.push({
      code: 'FREQUENCY_TOO_LOW',
      field: 'frequency',
      message: `${frequency}x/settimana potrebbe non essere sufficiente per vedere progressi significativi.`,
      suggestion: 'Considera almeno 2-3 sessioni settimanali per risultati ottimali'
    });
  }

  // Frequenza 7 = nessun recupero
  if (frequency >= 7) {
    errors.push({
      code: 'NO_REST_DAYS',
      field: 'frequency',
      message: 'Allenamento 7 giorni su 7 non permette recupero. Massimo 6x/settimana.',
      severity: 'high'
    });
    corrections.push({
      field: 'frequency',
      originalValue: frequency,
      correctedValue: 6,
      reason: 'Almeno 1 giorno di riposo necessario'
    });
  }

  // Goal specifici richiedono frequenze specifiche
  const goalLowerVal = (goal || '').toLowerCase();
  if ((goalLowerVal === 'gravidanza' || goalLowerVal === 'pregnancy') && frequency > 3) {
    warnings.push({
      code: 'PREGNANCY_FREQUENCY',
      field: 'frequency',
      message: 'Durante la gravidanza, 3x/settimana è il massimo consigliato.',
      suggestion: 'Frequenza ridotta a 3x per sicurezza'
    });
    corrections.push({
      field: 'frequency',
      originalValue: frequency,
      correctedValue: 3,
      reason: 'Limite sicurezza gravidanza'
    });
  }

  return { errors, warnings, corrections };
}

/**
 * Valida baseline
 */
function validateBaselines(
  baselines: PatternBaselines
): { errors: ValidationError[]; warnings: ValidationWarning[]; corrections: ValidationCorrection[]; shouldBlock: boolean } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const corrections: ValidationCorrection[] = [];
  let shouldBlock = false;

  const patterns = ['lower_push', 'lower_pull', 'horizontal_push', 'vertical_push', 'vertical_pull', 'core'];
  let nullCount = 0;
  let invalidCount = 0;

  patterns.forEach(pattern => {
    const baseline = (baselines as any)[pattern];

    if (!baseline) {
      nullCount++;
      return;
    }

    // Reps = 0 o negativo
    if (baseline.reps <= 0) {
      invalidCount++;
      warnings.push({
        code: 'INVALID_BASELINE_REPS',
        field: `baselines.${pattern}`,
        message: `Baseline ${pattern} ha reps ${baseline.reps}. Verrà usato default.`,
        suggestion: 'Rifai lo screening per questo pattern'
      });
      corrections.push({
        field: `baselines.${pattern}.reps`,
        originalValue: baseline.reps,
        correctedValue: 10,
        reason: 'Default per reps invalide'
      });
    }

    // Reps estremi (>50)
    if (baseline.reps > 50) {
      warnings.push({
        code: 'EXTREME_BASELINE_REPS',
        field: `baselines.${pattern}`,
        message: `Baseline ${pattern} ha ${baseline.reps} reps - valore estremo.`,
        suggestion: 'Limitato a 50 reps per calcoli realistici'
      });
      corrections.push({
        field: `baselines.${pattern}.reps`,
        originalValue: baseline.reps,
        correctedValue: 50,
        reason: 'Limite massimo reps'
      });
    }

    // Weight negativo
    if (baseline.weight10RM && baseline.weight10RM < 0) {
      warnings.push({
        code: 'NEGATIVE_WEIGHT',
        field: `baselines.${pattern}`,
        message: `Peso negativo per ${pattern}. Convertito a bodyweight.`,
        suggestion: 'Verificare input peso'
      });
      corrections.push({
        field: `baselines.${pattern}.weight10RM`,
        originalValue: baseline.weight10RM,
        correctedValue: 0,
        reason: 'Peso non può essere negativo'
      });
    }
  });

  // Tutti null = impossibile generare
  if (nullCount === patterns.length) {
    errors.push({
      code: 'NO_BASELINES',
      field: 'baselines',
      message: 'Nessun baseline disponibile. Completa lo screening prima di generare il programma.',
      severity: 'critical'
    });
    shouldBlock = true;
  } else if (nullCount >= 4) {
    warnings.push({
      code: 'FEW_BASELINES',
      field: 'baselines',
      message: `Solo ${patterns.length - nullCount} pattern hanno baseline. Programma sarà limitato.`,
      suggestion: 'Completa lo screening per tutti i pattern'
    });
  }

  return { errors, warnings, corrections, shouldBlock };
}

/**
 * Valida pain areas
 */
function validatePainAreas(
  painAreas: NormalizedPainArea[]
): { errors: ValidationError[]; warnings: ValidationWarning[]; shouldBlock: boolean; suggestRest: boolean } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let shouldBlock = false;
  let suggestRest = false;

  if (!painAreas || painAreas.length === 0) {
    return { errors, warnings, shouldBlock, suggestRest };
  }

  const severeCount = painAreas.filter(p => p.severity === 'severe').length;
  const totalCount = painAreas.length;

  // Troppi dolori severe
  if (severeCount > MAX_SEVERE_PAIN_AREAS) {
    errors.push({
      code: 'TOO_MANY_SEVERE_PAIN',
      field: 'painAreas',
      message: `Hai ${severeCount} zone con dolore severo. Consigliamo di consultare un medico prima di allenarti.`,
      severity: 'critical'
    });
    shouldBlock = true;
    suggestRest = true;
  }

  // Troppi dolori totali
  if (totalCount > MAX_TOTAL_PAIN_AREAS) {
    warnings.push({
      code: 'MANY_PAIN_AREAS',
      field: 'painAreas',
      message: `Hai ${totalCount} zone doloranti. Il programma sarà molto limitato.`,
      suggestion: 'Considera un periodo di recupero attivo o consulto fisioterapico'
    });
  }

  // Dolore bilaterale severe (es. entrambe ginocchia)
  const bilateralPairs = [
    ['left_knee', 'right_knee'],
    ['left_shoulder', 'right_shoulder'],
    ['left_hip', 'right_hip'],
    ['left_ankle', 'right_ankle']
  ];

  bilateralPairs.forEach(([left, right]) => {
    const leftPain = painAreas.find(p => p.area === left && p.severity === 'severe');
    const rightPain = painAreas.find(p => p.area === right && p.severity === 'severe');

    if (leftPain && rightPain) {
      const bodyPart = left.replace('left_', '').replace('right_', '');
      warnings.push({
        code: 'BILATERAL_SEVERE_PAIN',
        field: 'painAreas',
        message: `Dolore severo bilaterale a ${bodyPart}. Molti esercizi saranno esclusi.`,
        suggestion: 'Consulta un fisioterapista prima di continuare'
      });
    }
  });

  return { errors, warnings, shouldBlock, suggestRest };
}

/**
 * Valida goal e goal multipli
 */
function validateGoals(
  primaryGoal: string,
  goals?: string[],
  level?: string
): { warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  // Goal che ignorano il level
  if (LEVEL_OVERRIDE_GOALS.includes(primaryGoal) && level === 'advanced') {
    warnings.push({
      code: 'LEVEL_OVERRIDE',
      field: 'level',
      message: `Per goal "${primaryGoal}", i parametri di sicurezza hanno priorità sul livello advanced.`,
      suggestion: 'Intensità e volume saranno adattati per sicurezza'
    });
  }

  // Multi-goal: check conflitti
  if (goals && goals.length > 1) {
    const conflicts: string[] = [];

    GOAL_CONFLICTS.forEach(([g1, g2]) => {
      if (goals.includes(g1) && goals.includes(g2)) {
        conflicts.push(`${g1} + ${g2}`);
      }
    });

    if (conflicts.length > 0) {
      warnings.push({
        code: 'CONFLICTING_GOALS',
        field: 'goals',
        message: `Goal potenzialmente conflittuali: ${conflicts.join(', ')}.`,
        suggestion: 'La progressione sarà più lenta. Considera di prioritizzare un solo obiettivo.'
      });
    }

    // 3 goal = warning progressione
    if (goals.length === 3) {
      warnings.push({
        code: 'TOO_MANY_GOALS',
        field: 'goals',
        message: 'Con 3 obiettivi (40-30-30), la progressione per ciascuno sarà significativamente ridotta.',
        suggestion: 'Considera di concentrarti su 1-2 obiettivi per risultati più rapidi'
      });
    }
  }

  return { warnings };
}

/**
 * Valida durata sessione
 */
function validateSessionDuration(
  duration: number,
  goal: string,
  frequency: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Durata troppo corta
  if (duration < MIN_SESSION_DURATION) {
    errors.push({
      code: 'SESSION_TOO_SHORT',
      field: 'sessionDuration',
      message: `${duration} minuti non sono sufficienti per un workout efficace. Minimo ${MIN_SESSION_DURATION} minuti.`,
      severity: 'high'
    });
  }

  // Goal forza + durata corta = conflitto
  if (HIGH_REST_GOALS.includes(goal)) {
    const minForStrength = 45;
    if (duration < minForStrength) {
      warnings.push({
        code: 'STRENGTH_TIME_CONFLICT',
        field: 'sessionDuration',
        message: `Per goal "${goal}" servono rest lunghi (3-5 min). Con ${duration} min potrai fare pochi esercizi.`,
        suggestion: `Considera almeno ${minForStrength} minuti o cambia goal`
      });
    }
  }

  // Stima esercizi possibili
  const avgTimePerExercise = HIGH_REST_GOALS.includes(goal) ? 12 : 8;
  const warmupCooldown = 8;
  const maxExercises = Math.floor((duration - warmupCooldown) / avgTimePerExercise);

  if (maxExercises < 3) {
    warnings.push({
      code: 'FEW_EXERCISES_POSSIBLE',
      field: 'sessionDuration',
      message: `Con ${duration} minuti potrai fare solo ${maxExercises} esercizi. Workout minimale.`,
      suggestion: 'Aumenta la durata o riduci la frequenza per sessioni più complete'
    });
  }

  return { errors, warnings };
}

// ============================================================================
// RUNTIME ADAPTATION
// ============================================================================

/**
 * Adatta il workout alle condizioni runtime (cambio seduta)
 */
export function adaptWorkoutToRuntime(
  originalOptions: {
    location: string;
    trainingType: string;
    painAreas: NormalizedPainArea[];
    sessionDuration?: number;
    goal: string;
    level: string;
  },
  runtimeContext: RuntimeContext
): RuntimeAdaptation {
  const warnings: string[] = [];
  let volumeMultiplier = 1.0;
  let intensityMultiplier = 1.0;
  let shouldSuggestRest = false;
  const painAdaptations: PainAdaptation[] = [];
  const exerciseReplacements: ExerciseReplacement[] = [];
  let timeCompression: TimeCompression | undefined;
  let detrainingAdjustment: number | undefined;

  // 1. CAMBIO LOCATION
  const locationChanged = runtimeContext.actualLocation !== undefined &&
    runtimeContext.actualLocation !== originalOptions.location;

  if (locationChanged) {
    warnings.push(`Location cambiata: ${originalOptions.location} → ${runtimeContext.actualLocation}`);

    // Da gym a home: sostituisci esercizi
    if (originalOptions.location === 'gym' && runtimeContext.actualLocation === 'home') {
      exerciseReplacements.push(
        { original: 'Barbell Squat', replacement: 'Squat Bodyweight', reason: 'Gym → Home' },
        { original: 'Bench Press', replacement: 'Push-up', reason: 'Gym → Home' },
        { original: 'Lat Pulldown', replacement: 'Inverted Row', reason: 'Gym → Home' },
        { original: 'Leg Press', replacement: 'Lunge', reason: 'Gym → Home' },
        { original: 'Cable Row', replacement: 'Towel Row', reason: 'Gym → Home' }
      );
    }
  }

  // 2. NUOVI DOLORI EMERGENTI
  if (runtimeContext.emergingPainAreas && runtimeContext.emergingPainAreas.length > 0) {
    runtimeContext.emergingPainAreas.forEach(pain => {
      warnings.push(`Nuovo dolore rilevato: ${pain.area} (${pain.severity})`);

      const affectedPatterns = getAffectedPatterns(pain.area);

      if (pain.severity === 'severe') {
        painAdaptations.push({
          area: pain.area,
          action: 'exclude',
          affectedPatterns
        });
      } else {
        painAdaptations.push({
          area: pain.area,
          action: 'deload',
          affectedPatterns
        });
        volumeMultiplier *= 0.8;
      }
    });
  }

  // 3. SCREENING PRE-WORKOUT
  if (runtimeContext.screeningResults) {
    const { recommendations, screening, warnings: screeningWarnings } = runtimeContext.screeningResults;

    // Applica moltiplicatori
    intensityMultiplier *= recommendations.intensityMultiplier;

    if (recommendations.shouldReduceVolume) {
      volumeMultiplier *= (1 - recommendations.volumeReduction);
    }

    // Sonno critico (≤3)
    if (screening.sleep <= 3) {
      warnings.push('Sonno critico: considera riposo attivo');
      volumeMultiplier *= 0.7;
      intensityMultiplier *= 0.8;
    }

    // Stress critico (≥9)
    if (screening.stress >= 9) {
      warnings.push('Stress molto alto: workout ridotto');
      volumeMultiplier *= 0.7;
    }

    // Combinazione critica
    if (screening.sleep <= 3 && screening.stress >= 8) {
      shouldSuggestRest = true;
      warnings.push('ATTENZIONE: Sonno basso + stress alto. Consigliato giorno di riposo.');
    }

    // Recovery focus
    if (recommendations.shouldFocusOnRecovery) {
      warnings.push('Focus su recupero: priorità a mobilità e stretching');
    }

    warnings.push(...screeningWarnings);
  }

  // 4. DETRAINING
  if (runtimeContext.detrainingFactor && runtimeContext.detrainingFactor < 1) {
    detrainingAdjustment = runtimeContext.detrainingFactor;
    const reduction = Math.round((1 - runtimeContext.detrainingFactor) * 100);
    warnings.push(`Detraining rilevato: carichi ridotti del ${reduction}% per riadattamento`);
    intensityMultiplier *= runtimeContext.detrainingFactor;
  }

  // 5. FEEDBACK SESSIONE PRECEDENTE (Auto-regulation)
  if (runtimeContext.previousSessionFeedback) {
    const { averageRPE, completionRate } = runtimeContext.previousSessionFeedback;

    // RPE troppo alto = ridurre
    if (averageRPE >= 9.5) {
      warnings.push('Sessione precedente troppo intensa (RPE ≥9.5). Carichi ridotti.');
      intensityMultiplier *= 0.9;
    } else if (averageRPE >= 9) {
      warnings.push('RPE alto nella sessione precedente. Leggera riduzione intensità.');
      intensityMultiplier *= 0.95;
    }

    // RPE troppo basso = aumentare (solo se completion alta)
    if (averageRPE <= 6 && completionRate >= 1) {
      warnings.push('Sessione precedente troppo facile. Considera aumentare i carichi.');
      // Non modifichiamo automaticamente per sicurezza
    }

    // Completion rate basso = troppo difficile
    if (completionRate < 0.7) {
      warnings.push('Non hai completato il workout precedente. Volume ridotto.');
      volumeMultiplier *= 0.85;
    }
  }

  // 6. TEMPO DISPONIBILE RIDOTTO
  if (runtimeContext.availableTime &&
      originalOptions.sessionDuration &&
      runtimeContext.availableTime < originalOptions.sessionDuration) {

    timeCompression = {
      originalDuration: originalOptions.sessionDuration,
      availableDuration: runtimeContext.availableTime,
      exercisesRemoved: [],
      setsReduced: 0
    };

    const reduction = Math.round((1 - runtimeContext.availableTime / originalOptions.sessionDuration) * 100);
    warnings.push(`Tempo ridotto: ${originalOptions.sessionDuration}min → ${runtimeContext.availableTime}min (-${reduction}%)`);

    // La compressione effettiva viene gestita da adaptWorkoutToTimeLimit nel weeklySplitGenerator
  }

  // 7. EQUIPMENT DISPONIBILE CAMBIATO
  if (runtimeContext.availableEquipment) {
    // Logica per sostituire esercizi basati su equipment non disponibile
    // Per ora solo warning
    warnings.push(`Equipment disponibile: ${runtimeContext.availableEquipment.join(', ')}`);
  }

  return {
    locationChanged,
    newLocation: runtimeContext.actualLocation,
    painAdaptations,
    volumeMultiplier,
    intensityMultiplier,
    exerciseReplacements,
    timeCompression,
    detrainingAdjustment,
    warnings,
    shouldSuggestRest
  };
}

/**
 * Determina quali pattern sono affetti da un'area dolorante
 */
function getAffectedPatterns(painArea: string): string[] {
  const patternMap: Record<string, string[]> = {
    'lower_back': ['lower_push', 'lower_pull', 'core'],
    'upper_back': ['horizontal_pull', 'vertical_pull'],
    'neck': ['vertical_push', 'core'],
    'left_shoulder': ['horizontal_push', 'vertical_push', 'vertical_pull'],
    'right_shoulder': ['horizontal_push', 'vertical_push', 'vertical_pull'],
    'left_knee': ['lower_push', 'lower_pull'],
    'right_knee': ['lower_push', 'lower_pull'],
    'left_hip': ['lower_push', 'lower_pull'],
    'right_hip': ['lower_push', 'lower_pull'],
    'left_wrist': ['horizontal_push', 'vertical_pull'],
    'right_wrist': ['horizontal_push', 'vertical_pull'],
    'left_ankle': ['lower_push'],
    'right_ankle': ['lower_push'],
    'left_elbow': ['horizontal_push', 'vertical_push'],
    'right_elbow': ['horizontal_push', 'vertical_push']
  };

  return patternMap[painArea] || [];
}

/**
 * Applica le correzioni automatiche alle options
 */
export function applyCorrections(
  options: any,
  corrections: ValidationCorrection[]
): any {
  const corrected = { ...options };

  corrections.forEach(correction => {
    const path = correction.field.split('.');
    let current = corrected;

    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    const lastKey = path[path.length - 1];
    current[lastKey] = correction.correctedValue;
  });

  return corrected;
}

/**
 * Genera default baselines quando mancanti
 */
export function generateDefaultBaselines(): PatternBaselines {
  const defaultBaseline = {
    reps: 10,
    weight10RM: 0,
    difficulty: 5,
    variantId: 'default',
    variantName: 'Default'
  };

  return {
    lower_push: { ...defaultBaseline, variantName: 'Squat Bodyweight' },
    lower_pull: { ...defaultBaseline, variantName: 'Glute Bridge' },
    horizontal_push: { ...defaultBaseline, variantName: 'Push-up' },
    vertical_push: { ...defaultBaseline, variantName: 'Pike Push-up' },
    vertical_pull: { ...defaultBaseline, variantName: 'Inverted Row' },
    core: { ...defaultBaseline, variantName: 'Plank', reps: 30 }
  };
}

/**
 * Formatta i risultati di validazione per output utente
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ ERRORI:');
    result.errors.forEach(e => lines.push(`   • ${e.message}`));
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️ AVVISI:');
    result.warnings.forEach(w => {
      lines.push(`   • ${w.message}`);
      if (w.suggestion) lines.push(`     → ${w.suggestion}`);
    });
  }

  if (result.corrections.length > 0) {
    lines.push('🔧 CORREZIONI AUTOMATICHE:');
    result.corrections.forEach(c => lines.push(`   • ${c.field}: ${c.originalValue} → ${c.correctedValue} (${c.reason})`));
  }

  if (result.shouldBlock) {
    lines.push('');
    lines.push('🛑 PROGRAMMA NON GENERABILE - Risolvi gli errori sopra');
  }

  if (result.suggestRest) {
    lines.push('');
    lines.push('💤 CONSIGLIO: Considera un giorno di riposo o recupero attivo');
  }

  return lines.join('\n');
}
