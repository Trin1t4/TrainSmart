/**
 * Video Correction Engine
 *
 * Sistema ibrido per l'analisi video degli esercizi:
 * 1. Estrae landmark usando MediaPipe Pose (in-browser)
 * 2. Analizza con il nostro Biomechanics Engine interno
 * 3. Se fallisce, usa Gemini 1.5 Pro come fallback
 */

import {
  analyzeExercise,
  type AnalysisConfig,
  type SupportedExercise,
  SUPPORTED_EXERCISES
} from '@trainsmart/shared';
import type { FormAnalysisResult, PoseLandmarks, FrameLandmarkSnapshot } from '@trainsmart/shared';

import { getPoseDetector, isPoseDetectionSupported, type VideoAnalysisProgress } from './poseDetectionService';
import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export interface CorrectionResult {
  success: boolean;
  source: 'internal' | 'failed';

  // Risultato analisi
  score?: number;
  issues?: Array<{
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp_seconds?: number[];
  }>;
  corrections?: string[];
  warnings?: string[];
  loadRecommendation?: 'increase_5_percent' | 'maintain' | 'decrease_10_percent' | 'decrease_20_percent';

  // Sticking point (solo da internal)
  stickingPoint?: {
    detected: boolean;
    position?: string;
    recommendations?: string[];
  };

  // Morfotipo (solo da internal)
  morphotype?: {
    type: string;
    note?: string;
  };

  // Visual overlay landmark snapshots
  issueLandmarks?: FrameLandmarkSnapshot[];

  // Metadata
  framesAnalyzed?: number;
  confidence?: number;
  processingTime?: number;

  error?: string;
}

export interface CorrectionProgress {
  stage: 'initializing' | 'extracting' | 'analyzing' | 'completed' | 'failed';
  percentage: number;
  message: string;
}

// ============================================
// EXERCISE NAME MAPPING
// ============================================

/**
 * Mappa il nome esercizio italiano/inglese al SupportedExercise
 */
function mapExerciseToSupported(exerciseName: string): SupportedExercise | null {
  const name = exerciseName.toLowerCase().trim();

  // Squat variants
  if (name.includes('back squat') || name.includes('squat bilanciere') ||
      name.includes('squat con bilanciere') || name === 'barbell squat') {
    return 'BACK_SQUAT';
  }
  if (name.includes('front squat') || name.includes('squat frontale')) {
    return 'FRONT_SQUAT';
  }
  if (name.includes('goblet')) {
    return 'BACK_SQUAT'; // Analizziamo come squat generico
  }
  if (name.includes('bulgarian') || name.includes('split squat') || name.includes('bulgaro')) {
    return 'BULGARIAN_SPLIT_SQUAT';
  }
  if (name.includes('squat') && !name.includes('pistol') && !name.includes('skater')) {
    return 'BACK_SQUAT';
  }

  // Deadlift variants
  if (name.includes('sumo')) {
    return 'DEADLIFT_SUMO';
  }
  if (name.includes('romanian') || name.includes('rdl') || name.includes('rumeno')) {
    return 'ROMANIAN_DEADLIFT';
  }
  if (name.includes('deadlift') || name.includes('stacco')) {
    return 'DEADLIFT_CONVENTIONAL';
  }

  // Bench
  if (name.includes('bench') || name.includes('panca piana') || name.includes('distensioni')) {
    return 'BENCH_PRESS';
  }

  // Press
  if (name.includes('overhead') || name.includes('military') || name.includes('lento avanti')) {
    return 'OVERHEAD_PRESS';
  }

  // Pull variants
  if (name.includes('pull-up') || name.includes('pullup') || name.includes('trazioni')) {
    return 'PULL_UP';
  }
  if (name.includes('chin-up') || name.includes('chinup')) {
    return 'CHIN_UP';
  }
  if (name.includes('lat pulldown') || name.includes('lat machine')) {
    return 'LAT_PULLDOWN';
  }
  if (name.includes('barbell row') || name.includes('rematore bilanciere')) {
    return 'BARBELL_ROW';
  }
  if (name.includes('dumbbell row') || name.includes('rematore manubrio')) {
    return 'DUMBBELL_ROW';
  }
  if (name.includes('row') || name.includes('rematore')) {
    return 'BARBELL_ROW';
  }

  // Hip hinge
  if (name.includes('hip thrust') || name.includes('ponte glutei')) {
    return 'HIP_THRUST';
  }

  // Bodyweight
  if (name.includes('push-up') || name.includes('pushup') || name.includes('piegamenti')) {
    return 'PUSH_UP';
  }
  if (name.includes('dip')) {
    return 'DIP';
  }
  if (name.includes('pistol squat') || name.includes('pistol') || name === 'pistol') {
    return 'PISTOL_SQUAT';
  }
  if (name.includes('skater squat') || name.includes('skater')) {
    return 'SKATER_SQUAT';
  }
  if (name.includes('archer push') || name.includes('archer pushup') || name.includes('piegamenti arciere')) {
    return 'ARCHER_PUSH_UP';
  }
  if (name.includes('inverted row') || name.includes('australian') || name.includes('body row') ||
      name.includes('trazioni orizzontali') || name.includes('trazioni australiane')) {
    return 'INVERTED_ROW';
  }

  // Unilateral
  if (name.includes('lunge') || name.includes('affondo')) {
    return 'LUNGE_FORWARD';
  }

  // Machines
  if (name.includes('leg press')) {
    return 'LEG_PRESS';
  }
  if (name.includes('leg extension')) {
    return 'LEG_EXTENSION';
  }
  if (name.includes('leg curl')) {
    return 'LEG_CURL';
  }
  if (name.includes('cable row') || name.includes('pulley')) {
    return 'CABLE_ROW';
  }
  if (name.includes('chest press')) {
    return 'CHEST_PRESS';
  }
  if (name.includes('shoulder press machine')) {
    return 'SHOULDER_PRESS_MACHINE';
  }

  return null;
}

/**
 * Converte il risultato interno nel formato standard
 */
function convertInternalResult(result: FormAnalysisResult, confidence: number): CorrectionResult {
  return {
    success: true,
    source: 'internal',
    score: result.overallScore,
    issues: result.issues.map(issue => ({
      name: issue.code,
      severity: issue.severity.toLowerCase() as 'low' | 'medium' | 'high',
      description: issue.description,
      timestamp_seconds: issue.timestamp ? [issue.timestamp] : undefined
    })),
    corrections: result.recommendations.immediate,
    warnings: result.issues
      .filter(i => i.type === 'SAFETY')
      .map(i => i.description),
    loadRecommendation: calculateLoadRecommendation(result),
    stickingPoint: result.stickingPoint ? {
      detected: result.stickingPoint.detected,
      position: result.stickingPoint.position,
      recommendations: result.stickingPoint.recommendations?.cues
    } : undefined,
    morphotype: result.morphotype ? {
      type: result.morphotype.type,
      note: result.morphotype.note
    } : undefined,
    issueLandmarks: result.issueLandmarks,
    framesAnalyzed: result.framesAnalyzed,
    confidence
  };
}

/**
 * Calcola la raccomandazione sul carico basandosi sugli issues
 */
function calculateLoadRecommendation(result: FormAnalysisResult): CorrectionResult['loadRecommendation'] {
  const safetyIssues = result.issues.filter(i => i.type === 'SAFETY');
  const highSeverity = safetyIssues.filter(i => i.severity === 'HIGH').length;
  const mediumSeverity = safetyIssues.filter(i => i.severity === 'MEDIUM').length;

  if (highSeverity >= 2) return 'decrease_20_percent';
  if (highSeverity >= 1) return 'decrease_10_percent';
  if (mediumSeverity >= 2) return 'decrease_10_percent';
  if (result.overallScore >= 8 && result.issues.length === 0) return 'increase_5_percent';
  return 'maintain';
}

// ============================================
// MAIN ENGINE
// ============================================

export class VideoCorrectionEngine {
  private onProgress?: (progress: CorrectionProgress) => void;

  constructor(onProgress?: (progress: CorrectionProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(stage: CorrectionProgress['stage'], percentage: number, message: string) {
    this.onProgress?.({ stage, percentage, message });
  }

  /**
   * Analizza un video usando il sistema interno (MediaPipe + Biomechanics Engine)
   *
   * ⚠️ NO FALLBACK ESTERNO - Solo analisi interna per privacy e costi
   */
  async analyzeVideo(
    videoBlob: Blob,
    exerciseName: string,
    userId?: string,
    correctionId?: string
  ): Promise<CorrectionResult> {
    const startTime = Date.now();

    // 1. Verifica supporto MediaPipe
    if (!isPoseDetectionSupported()) {
      console.log('[VideoCorrectionEngine] WebGL not supported');
      this.updateProgress('failed', 100, 'Browser non supportato');
      return {
        success: false,
        source: 'failed',
        error: 'Il tuo browser non supporta WebGL. Prova con Chrome, Firefox o Edge aggiornati.'
      };
    }

    // 2. Mappa l'esercizio
    const supportedExercise = mapExerciseToSupported(exerciseName);
    if (!supportedExercise) {
      console.log(`[VideoCorrectionEngine] Exercise "${exerciseName}" not supported`);
      this.updateProgress('failed', 100, 'Esercizio non supportato');
      return {
        success: false,
        source: 'failed',
        error: `L'esercizio "${exerciseName}" non è ancora supportato per l'analisi video. Supportiamo: Squat, Deadlift, Bench Press, Overhead Press, Row, Lunge.`
      };
    }

    try {
      // 3. Inizializza pose detector
      this.updateProgress('initializing', 5, 'Inizializzazione analisi...');
      const poseDetector = getPoseDetector();
      await poseDetector.initialize();

      // 4. Estrai landmark dal video (⚠️ Solo porzione centrale per evitare walk-in/walk-out)
      this.updateProgress('extracting', 10, 'Estrazione movimento dal video...');

      const videoResult = await poseDetector.analyzeVideoBlob(
        videoBlob,
        (progress) => {
          const percentage = 10 + (progress.percentage * 0.5); // 10-60%
          this.updateProgress('extracting', percentage,
            `Analisi frame ${progress.currentFrame}/${progress.totalFrames}...`);
        }
      );

      if (!videoResult.success || videoResult.frameSequence.length === 0) {
        console.log('[VideoCorrectionEngine] Pose detection failed:', videoResult.error);
        this.updateProgress('failed', 100, 'Rilevamento pose fallito');
        return {
          success: false,
          source: 'failed',
          error: videoResult.error || 'Non riesco a rilevare la tua posizione nel video. Assicurati di essere completamente inquadrato e ben illuminato.'
        };
      }

      // 5. Analizza con il Biomechanics Engine
      this.updateProgress('analyzing', 65, 'Analisi biomeccanica in corso...');

      const config: AnalysisConfig = {
        exercise: supportedExercise,
        fps: videoResult.fps,
        style: supportedExercise.includes('SUMO') ? 'sumo' : 'conventional'
      };

      const analysisResult = analyzeExercise(videoResult.frameSequence, config);

      this.updateProgress('analyzing', 90, 'Generazione feedback...');

      // 6. Converti il risultato
      const result = convertInternalResult(analysisResult, videoResult.averageConfidence);
      result.processingTime = Date.now() - startTime;

      // 7. Salva nel database se abbiamo correctionId
      if (correctionId) {
        await this.saveResultToDatabase(correctionId, result);
      }

      this.updateProgress('completed', 100, 'Analisi completata!');

      console.log(`[VideoCorrectionEngine] Internal analysis completed in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error('[VideoCorrectionEngine] Internal analysis failed:', error);
      this.updateProgress('failed', 100, 'Analisi fallita');
      return {
        success: false,
        source: 'failed',
        error: error instanceof Error ? error.message : 'Errore durante l\'analisi. Riprova con un video più breve e ben illuminato.'
      };
    }
  }

  /**
   * Salva il risultato nel database
   */
  private async saveResultToDatabase(correctionId: string, result: CorrectionResult): Promise<void> {
    try {
      await supabase
        .from('video_corrections')
        .update({
          processing_status: 'completed',
          ai_model_used: 'internal-biomechanics',
          feedback_score: result.score,
          feedback_issues: result.issues,
          feedback_corrections: result.corrections,
          feedback_warnings: result.warnings,
          load_recommendation: result.loadRecommendation,
          processed_at: new Date().toISOString(),
          metadata: {
            source: result.source,
            framesAnalyzed: result.framesAnalyzed,
            confidence: result.confidence,
            processingTime: result.processingTime,
            stickingPoint: result.stickingPoint,
            morphotype: result.morphotype,
            issueLandmarks: result.issueLandmarks
          }
        })
        .eq('id', correctionId);

      console.log('[VideoCorrectionEngine] Result saved to database');
    } catch (error) {
      console.error('[VideoCorrectionEngine] Failed to save result:', error);
    }
  }
}

/**
 * Funzione di convenienza per analizzare un video
 */
export async function analyzeExerciseVideo(
  videoBlob: Blob,
  exerciseName: string,
  userId?: string,
  correctionId?: string,
  onProgress?: (progress: CorrectionProgress) => void
): Promise<CorrectionResult> {
  const engine = new VideoCorrectionEngine(onProgress);
  return engine.analyzeVideo(videoBlob, exerciseName, userId, correctionId);
}

/**
 * Verifica se un esercizio è supportato dall'analisi interna
 */
export function isExerciseSupportedInternally(exerciseName: string): boolean {
  return mapExerciseToSupported(exerciseName) !== null;
}

/**
 * Lista degli esercizi supportati internamente
 */
export function getSupportedExercises(): string[] {
  return SUPPORTED_EXERCISES.map(e => e.name);
}
