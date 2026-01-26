/**
 * Biomechanics Engine
 * Sistema di analisi video basato sui principi DCSS di Paolo Evangelista
 *
 * 106 esercizi con analisi biomeccanica completa
 * Esporta tutti i moduli per l'analisi biomeccanica degli esercizi
 */

// Core utilities
export * from './core';

// Exercise definition types
export * from './exerciseDefinitionTypes';

// Exercise metadata (106 exercises)
export * from './exerciseMetadata';

// Exercise definitions with error detection (Part 1 & 2)
export * from './exerciseDefinitions';
export * from './exerciseDefinitionsPart2';

// Analyzers
export * from './analyzers/squatAnalyzer';
export * from './analyzers/deadliftAnalyzer';
export * from './analyzers/benchAnalyzer';
export * from './analyzers/pullAnalyzer';
export * from './analyzers/machineAnalyzer';
export * from './analyzers/bodyweightAnalyzer';

// Re-export types for convenience
export type {
  PoseLandmark,
  PoseLandmarks,
  UserProportions,
  Morphotype,
  MorphotypeType,
  FrameAnalysis,
  Issue,
  IssueSeverity,
  IssueType,
  ExercisePhase,
  StickingPointAnalysis,
  FormAnalysisResult,
  SupportedExercise,
  CameraValidationResult,
  // Nuovi tipi per vista 45° latero-posteriore
  AsymmetryType,
  ScapularIssue,
  AsymmetryAnalysis,
  ScapularAnalysis,
  LateroPosteriorAnalysis
} from '../../types/biomechanics.types';

// Export funzioni e tipi per analisi asimmetrie (vista 45°)
export {
  detectDepthAsymmetry,
  detectKneeAsymmetry,
  detectTorsoRotation,
  detectLateralWeightShift,
  detectScapularPosition,
  analyzeFullAsymmetry,
  type BilateralAsymmetryResult,
  type ScapularPositionResult,
  type FullAsymmetryAnalysis
} from './core';

// Export controlli latero-posteriori dagli analyzer
export {
  SQUAT_LATERO_POSTERIOR_CHECKS,
  analyzeSquatFrameAsymmetry,
  type LateroPosteriorCheck
} from './analyzers/squatAnalyzer';

export {
  DEADLIFT_LATERO_POSTERIOR_CHECKS,
  type DeadliftLateroPosteriorCheck
} from './analyzers/deadliftAnalyzer';

// ============================================
// MAIN ANALYZER FUNCTION
// ============================================

import type {
  PoseLandmarks,
  SupportedExercise,
  FormAnalysisResult,
  Morphotype
} from '../../types/biomechanics.types';

import { calculateProportions, classifyMorphotype, validateCameraAngle } from './core';
import { analyzeSquatFrame, analyzeFullSquat } from './analyzers/squatAnalyzer';
import { analyzeDeadliftFrame, analyzeFullDeadlift } from './analyzers/deadliftAnalyzer';
import { analyzeBenchFrame, analyzeFullBench } from './analyzers/benchAnalyzer';
import { analyzeRowFrame, analyzePullUpFrame, analyzeFullRow, analyzeFullPullUp } from './analyzers/pullAnalyzer';
import { analyzeMachineFrame, analyzeFullMachine } from './analyzers/machineAnalyzer';
import { analyzeBodyweightFrame, analyzeFullBodyweight } from './analyzers/bodyweightAnalyzer';

/**
 * Configurazione per l'analisi
 */
export interface AnalysisConfig {
  exercise: SupportedExercise;
  style?: 'conventional' | 'sumo';  // Per deadlift
  fps?: number;  // Frame per second del video
}

/**
 * Analizza una sequenza di frame per un esercizio specifico
 *
 * @param frameSequence - Array di landmark per ogni frame
 * @param config - Configurazione dell'analisi
 * @returns Risultato completo dell'analisi
 */
export function analyzeExercise(
  frameSequence: PoseLandmarks[],
  config: AnalysisConfig
): FormAnalysisResult {
  if (frameSequence.length === 0) {
    return {
      exercise: config.exercise,
      duration: 0,
      framesAnalyzed: 0,
      overallScore: 0,
      issues: [],
      strengths: [],
      recommendations: { immediate: [], accessories: [], mobility: [] }
    };
  }

  // Valida l'inquadratura
  const cameraValidation = validateCameraAngle(frameSequence[0]);
  if (!cameraValidation.valid) {
    return {
      exercise: config.exercise,
      duration: 0,
      framesAnalyzed: 0,
      overallScore: 0,
      issues: [{
        type: 'SAFETY',
        code: 'INVALID_CAMERA_ANGLE',
        severity: 'HIGH',
        description: cameraValidation.message || 'Inquadratura non valida',
        correction: 'Posiziona la camera a 45° dietro e di lato (posteriore-laterale)'
      }],
      strengths: [],
      recommendations: { immediate: ['Correggi la posizione della camera'], accessories: [], mobility: [] }
    };
  }

  // Calcola proporzioni dal primo frame
  const proportions = calculateProportions(frameSequence[0]);
  const morphotype = classifyMorphotype(proportions);

  // Determina le fasi e analizza ogni frame
  const fps = config.fps || 30;
  const analyzedFrames = analyzeFrameSequence(frameSequence, config.exercise, fps, morphotype, config.style);

  // Analisi completa in base all'esercizio
  const fullAnalysis = performFullAnalysis(analyzedFrames, config.exercise, morphotype, config.style);

  return {
    exercise: config.exercise,
    duration: frameSequence.length / fps,
    framesAnalyzed: frameSequence.length,
    estimatedProportions: proportions,
    morphotype,
    ...fullAnalysis
  };
}

/**
 * Analizza ogni frame della sequenza
 */
function analyzeFrameSequence(
  frames: PoseLandmarks[],
  exercise: SupportedExercise,
  fps: number,
  morphotype: Morphotype,
  style?: 'conventional' | 'sumo'
): import('../../types/biomechanics.types').FrameAnalysis[] {
  const analyzedFrames: import('../../types/biomechanics.types').FrameAnalysis[] = [];

  let previousFrame: PoseLandmarks | null = null;

  for (let i = 0; i < frames.length; i++) {
    const timestamp = i / fps;
    const currentFrame = frames[i];

    // Determina la fase (semplificato - in produzione userebbe più logica)
    const phase = determineExercisePhase(currentFrame, previousFrame, exercise, i, frames.length);

    let frameAnalysis: import('../../types/biomechanics.types').FrameAnalysis;

    // Analizza in base al tipo di esercizio
    switch (exercise) {
      case 'BACK_SQUAT':
      case 'FRONT_SQUAT':
        frameAnalysis = analyzeSquatFrame(currentFrame, i, timestamp, phase, morphotype);
        break;

      case 'DEADLIFT_CONVENTIONAL':
      case 'DEADLIFT_SUMO':
        frameAnalysis = analyzeDeadliftFrame(
          currentFrame, i, timestamp, phase,
          exercise === 'DEADLIFT_SUMO' ? 'sumo' : 'conventional',
          morphotype
        );
        break;

      case 'BENCH_PRESS':
        frameAnalysis = analyzeBenchFrame(currentFrame, i, timestamp, phase, morphotype);
        break;

      case 'BARBELL_ROW':
      case 'DUMBBELL_ROW':
        frameAnalysis = analyzeRowFrame(currentFrame, i, timestamp, phase, morphotype);
        break;

      case 'PULL_UP':
      case 'CHIN_UP':
      case 'LAT_PULLDOWN':
        frameAnalysis = analyzePullUpFrame(currentFrame, i, timestamp, phase, morphotype);
        break;

      // Macchine
      case 'LEG_PRESS':
      case 'LEG_EXTENSION':
      case 'LEG_CURL':
      case 'CABLE_ROW':
      case 'CHEST_PRESS':
      case 'SHOULDER_PRESS_MACHINE':
        const machineType = exercise.toLowerCase().replace('_machine', '') as 'leg_press' | 'leg_curl' | 'lat_pulldown' | 'leg_extension' | 'cable_row' | 'chest_press' | 'shoulder_press';
        frameAnalysis = analyzeMachineFrame(currentFrame, i, timestamp, phase, machineType, morphotype);
        break;

      // Corpo libero e Unilaterali
      case 'PUSH_UP':
      case 'DIP':
      case 'LUNGE_FORWARD':
      case 'BULGARIAN_SPLIT_SQUAT':
      case 'ROMANIAN_DEADLIFT':
      case 'HIP_THRUST':
      case 'PISTOL_SQUAT':
      case 'SKATER_SQUAT':
      case 'ARCHER_PUSH_UP':
      case 'INVERTED_ROW':
        frameAnalysis = analyzeBodyweightFrame(currentFrame, i, timestamp, phase, exercise, morphotype);
        break;

      default:
        // Default analysis per esercizi non ancora implementati
        frameAnalysis = {
          frameNumber: i,
          timestamp,
          phase: phase as any,
          angles: {},
          issues: []
        };
    }

    // Calcola velocità
    if (previousFrame && i > 0) {
      frameAnalysis.velocity = calculateFrameVelocity(previousFrame, currentFrame, 1 / fps);
    }

    analyzedFrames.push(frameAnalysis);
    previousFrame = currentFrame;
  }

  return analyzedFrames;
}

/**
 * Esegue l'analisi completa per l'esercizio
 */
function performFullAnalysis(
  frames: import('../../types/biomechanics.types').FrameAnalysis[],
  exercise: SupportedExercise,
  morphotype: Morphotype,
  style?: 'conventional' | 'sumo'
): Omit<FormAnalysisResult, 'exercise' | 'duration' | 'framesAnalyzed' | 'estimatedProportions' | 'morphotype'> {

  switch (exercise) {
    case 'BACK_SQUAT':
    case 'FRONT_SQUAT':
      return analyzeFullSquat(frames, morphotype);

    case 'DEADLIFT_CONVENTIONAL':
    case 'DEADLIFT_SUMO':
      return analyzeFullDeadlift(frames, style || 'conventional', morphotype);

    case 'BENCH_PRESS':
      return analyzeFullBench(frames, morphotype);

    case 'BARBELL_ROW':
    case 'DUMBBELL_ROW':
      return analyzeFullRow(frames, morphotype);

    case 'PULL_UP':
    case 'CHIN_UP':
    case 'LAT_PULLDOWN':
      return analyzeFullPullUp(frames, morphotype);

    // Macchine
    case 'LEG_PRESS':
    case 'LEG_EXTENSION':
    case 'LEG_CURL':
    case 'CABLE_ROW':
    case 'CHEST_PRESS':
    case 'SHOULDER_PRESS_MACHINE':
      const fullMachineType = exercise.toLowerCase().replace('_machine', '') as 'leg_press' | 'leg_curl' | 'lat_pulldown' | 'leg_extension' | 'cable_row' | 'chest_press' | 'shoulder_press';
      return analyzeFullMachine(frames, fullMachineType, morphotype);

    // Corpo libero, Hip Hinge e Unilaterali
    case 'PUSH_UP':
    case 'DIP':
    case 'LUNGE_FORWARD':
    case 'BULGARIAN_SPLIT_SQUAT':
    case 'ROMANIAN_DEADLIFT':
    case 'HIP_THRUST':
    case 'PISTOL_SQUAT':
    case 'SKATER_SQUAT':
    case 'ARCHER_PUSH_UP':
    case 'INVERTED_ROW':
      return analyzeFullBodyweight(frames, exercise, morphotype);

    default:
      return {
        issues: [],
        strengths: [],
        stickingPoint: { detected: false },
        recommendations: { immediate: [], accessories: [], mobility: [] },
        overallScore: 7
      };
  }
}

/**
 * Determina la fase dell'esercizio basandosi sulla posizione
 */
function determineExercisePhase(
  currentFrame: PoseLandmarks,
  previousFrame: PoseLandmarks | null,
  exercise: SupportedExercise,
  frameIndex: number,
  totalFrames: number
): string {
  // Semplificazione: usa la posizione nel video
  const progress = frameIndex / totalFrames;

  if (progress < 0.1) return 'SETUP';
  if (progress < 0.4) return 'ECCENTRIC';
  if (progress < 0.5) return 'BOTTOM';
  if (progress < 0.9) return 'CONCENTRIC';
  return 'LOCKOUT';
}

/**
 * Calcola la velocità tra due frame
 */
function calculateFrameVelocity(
  frame1: PoseLandmarks,
  frame2: PoseLandmarks,
  deltaTime: number
): number {
  const hip1 = {
    x: (frame1.left_hip.x + frame1.right_hip.x) / 2,
    y: (frame1.left_hip.y + frame1.right_hip.y) / 2
  };
  const hip2 = {
    x: (frame2.left_hip.x + frame2.right_hip.x) / 2,
    y: (frame2.left_hip.y + frame2.right_hip.y) / 2
  };

  const displacement = Math.sqrt(
    Math.pow(hip2.x - hip1.x, 2) + Math.pow(hip2.y - hip1.y, 2)
  );

  return displacement / deltaTime;
}

/**
 * Istruzioni per il setup della camera
 */
export const CAMERA_SETUP_INSTRUCTIONS = {
  position: '45_DEGREES_POSTERIOR_LATERAL',
  height: 'HIP_HEIGHT',
  distance: '2-3_METERS',
  instructions: [
    'Posiziona il telefono dietro di te, leggermente di lato (45°)',
    'Inquadra sia la schiena che il fianco per una visione completa',
    'Altezza consigliata: circa all\'altezza dei fianchi (1 metro)',
    'Distanza consigliata: 2-3 metri (tutto il corpo nell\'inquadratura)',
    'Un treppiede o superficie stabile migliora la qualità',
    'Una buona illuminazione (no controluce) aiuta l\'analisi'
  ]
};

/**
 * Lista degli esercizi supportati con descrizione
 */
export const SUPPORTED_EXERCISES: { id: SupportedExercise; name: string; category: string }[] = [
  // Squat
  { id: 'BACK_SQUAT', name: 'Back Squat', category: 'Squat' },
  { id: 'FRONT_SQUAT', name: 'Front Squat', category: 'Squat' },
  // Deadlift
  { id: 'DEADLIFT_CONVENTIONAL', name: 'Stacco Convenzionale', category: 'Deadlift' },
  { id: 'DEADLIFT_SUMO', name: 'Stacco Sumo', category: 'Deadlift' },
  // Bench
  { id: 'BENCH_PRESS', name: 'Panca Piana', category: 'Bench' },
  { id: 'OVERHEAD_PRESS', name: 'Overhead Press', category: 'Press' },
  // Pull
  { id: 'BARBELL_ROW', name: 'Barbell Row', category: 'Pull' },
  { id: 'DUMBBELL_ROW', name: 'Dumbbell Row', category: 'Pull' },
  { id: 'PULL_UP', name: 'Pull-up', category: 'Pull' },
  { id: 'CHIN_UP', name: 'Chin-up', category: 'Pull' },
  { id: 'LAT_PULLDOWN', name: 'Lat Pulldown', category: 'Pull' },
  // Hip Hinge
  { id: 'ROMANIAN_DEADLIFT', name: 'Romanian Deadlift', category: 'Hinge' },
  { id: 'HIP_THRUST', name: 'Hip Thrust', category: 'Hinge' },
  // Unilateral
  { id: 'LUNGE_FORWARD', name: 'Forward Lunge', category: 'Unilateral' },
  { id: 'BULGARIAN_SPLIT_SQUAT', name: 'Bulgarian Split Squat', category: 'Unilateral' },
  // Bodyweight
  { id: 'PUSH_UP', name: 'Push-up', category: 'Bodyweight' },
  { id: 'DIP', name: 'Dip', category: 'Bodyweight' },
  { id: 'PISTOL_SQUAT', name: 'Pistol Squat', category: 'Bodyweight' },
  { id: 'SKATER_SQUAT', name: 'Skater Squat', category: 'Bodyweight' },
  { id: 'ARCHER_PUSH_UP', name: 'Archer Push-up', category: 'Bodyweight' },
  { id: 'INVERTED_ROW', name: 'Inverted Row', category: 'Bodyweight' },
  // Macchine
  { id: 'LEG_PRESS', name: 'Leg Press', category: 'Machine' },
  { id: 'LEG_EXTENSION', name: 'Leg Extension', category: 'Machine' },
  { id: 'LEG_CURL', name: 'Leg Curl', category: 'Machine' },
  { id: 'CABLE_ROW', name: 'Cable Row', category: 'Machine' },
  { id: 'CHEST_PRESS', name: 'Chest Press Machine', category: 'Machine' },
  { id: 'SHOULDER_PRESS_MACHINE', name: 'Shoulder Press Machine', category: 'Machine' }
];
