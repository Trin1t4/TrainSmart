/**
 * Video Correction Engine
 *
 * Sistema di analisi video degli esercizi:
 * 1. Estrae landmark usando MediaPipe Pose (in-browser)
 * 2. Analizza con il nostro Biomechanics Engine interno
 *
 * NO FALLBACK ESTERNO - Solo analisi interna per privacy e costi
 */

import type { PoseLandmarks as SharedPoseLandmarks } from '@trainsmart/shared';
import { getPoseDetector, isPoseDetectionSupported, type VideoAnalysisProgress } from './poseDetectionService';
import { supabase } from './supabaseClient';
import { createLandmarkSnapshot } from './biomechanics/landmarkConverter';
import { getExerciseBodySegments } from './biomechanics/issueSegmentMapping';
import type { FrameLandmarkSnapshot, SegmentDef } from './biomechanics/types';

// ============================================
// TYPES
// ============================================

export interface CorrectionResult {
  success: boolean;
  source: 'internal' | 'gemini' | 'failed';

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

  // Metadata
  framesAnalyzed?: number;
  confidence?: number;
  processingTime?: number;

  // Visual overlay data
  issueLandmarks?: FrameLandmarkSnapshot[];
  fps?: number;

  error?: string;
}

export interface CorrectionProgress {
  stage: 'initializing' | 'extracting' | 'analyzing' | 'fallback' | 'completed' | 'failed';
  percentage: number;
  message: string;
}

// Tipi supportati per l'analisi interna
type SupportedExercise =
  | 'BACK_SQUAT' | 'FRONT_SQUAT' | 'BULGARIAN_SPLIT_SQUAT'
  | 'DEADLIFT_CONVENTIONAL' | 'DEADLIFT_SUMO' | 'ROMANIAN_DEADLIFT'
  | 'BENCH_PRESS' | 'OVERHEAD_PRESS'
  | 'PULL_UP' | 'CHIN_UP' | 'LAT_PULLDOWN' | 'BARBELL_ROW' | 'DUMBBELL_ROW'
  | 'HIP_THRUST' | 'PUSH_UP' | 'DIP'
  | 'PISTOL_SQUAT' | 'SKATER_SQUAT' | 'ARCHER_PUSH_UP' | 'INVERTED_ROW'
  | 'LUNGE_FORWARD'
  | 'LEG_PRESS' | 'LEG_EXTENSION' | 'LEG_CURL'
  | 'CABLE_ROW' | 'CHEST_PRESS' | 'SHOULDER_PRESS_MACHINE';

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
 * Calcola la raccomandazione sul carico basandosi sugli issues
 */
function calculateLoadRecommendation(
  overallScore: number,
  issues: CorrectionResult['issues']
): CorrectionResult['loadRecommendation'] {
  const safetyIssues = issues?.filter(i => i.severity === 'high') || [];
  const mediumIssues = issues?.filter(i => i.severity === 'medium') || [];

  if (safetyIssues.length >= 2) return 'decrease_20_percent';
  if (safetyIssues.length >= 1) return 'decrease_10_percent';
  if (mediumIssues.length >= 2) return 'decrease_10_percent';
  if (overallScore >= 8 && (!issues || issues.length === 0)) return 'increase_5_percent';
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
   * NO FALLBACK ESTERNO - Solo analisi interna per privacy e costi
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

      // 4. Estrai landmark dal video (Solo porzione centrale per evitare walk-in/walk-out)
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

      // 5. Analizza con regole biomeccaniche per-frame + keyframe
      this.updateProgress('analyzing', 65, 'Analisi biomeccanica in corso...');

      const analysisResult = this.analyzeWithRules(
        videoResult.frameSequence,
        supportedExercise
      );

      // 5b. Genera landmark snapshots solo per i keyframe
      const issueLandmarks = this.buildIssueLandmarks(
        videoResult.frameSequence,
        analysisResult.perFrameIssues,
        videoResult.fps,
        supportedExercise
      );

      this.updateProgress('analyzing', 90, 'Generazione feedback...');

      // 6. Costruisci il risultato
      const result: CorrectionResult = {
        success: true,
        source: 'internal',
        score: analysisResult.score,
        issues: analysisResult.issues,
        corrections: analysisResult.corrections,
        warnings: analysisResult.warnings,
        loadRecommendation: calculateLoadRecommendation(analysisResult.score, analysisResult.issues),
        framesAnalyzed: videoResult.frameSequence.length,
        confidence: videoResult.averageConfidence,
        processingTime: Date.now() - startTime,
        issueLandmarks,
        fps: videoResult.fps,
      };

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

  // ============================================
  // KEYFRAME DETECTION
  // ============================================

  /**
   * Calcola la metrica di "profondita'" di un frame in base all'esercizio.
   * Valori piu' alti = posizione piu' estrema (bottom).
   */
  private getDepthMetric(frame: any, exercise: SupportedExercise): number | null {
    switch (exercise) {
      // Lower body: hip.y (piu' alto = piu' profondo)
      case 'BACK_SQUAT':
      case 'FRONT_SQUAT':
      case 'BULGARIAN_SPLIT_SQUAT':
      case 'PISTOL_SQUAT':
      case 'SKATER_SQUAT':
      case 'LUNGE_FORWARD':
      case 'LEG_PRESS':
        if (frame.left_hip) return frame.left_hip.y;
        return null;

      // Deadlift: hip.y (basso = partenza, alto = lockout) — invertiamo
      case 'DEADLIFT_CONVENTIONAL':
      case 'DEADLIFT_SUMO':
      case 'ROMANIAN_DEADLIFT':
      case 'HIP_THRUST':
        if (frame.left_hip) return frame.left_hip.y;
        return null;

      // Upper body: wrist.y
      case 'BENCH_PRESS':
      case 'OVERHEAD_PRESS':
      case 'PUSH_UP':
      case 'DIP':
      case 'PULL_UP':
      case 'CHIN_UP':
      case 'LAT_PULLDOWN':
      case 'BARBELL_ROW':
      case 'DUMBBELL_ROW':
      case 'CABLE_ROW':
      case 'INVERTED_ROW':
        if (frame.left_wrist) return frame.left_wrist.y;
        return null;

      default:
        if (frame.left_hip) return frame.left_hip.y;
        return null;
    }
  }

  /**
   * Trova i keyframe (bottom/top di ogni rep) nella sequenza.
   * Usa smoothing + ricerca minimi/massimi locali.
   * Ritorna max 5 indici di frame significativi.
   */
  private findKeyFrames(frameSequence: any[], exercise: SupportedExercise): number[] {
    if (frameSequence.length < 5) {
      return frameSequence.length > 0 ? [0] : [];
    }

    // 1. Calcola metrica per ogni frame
    const raw: number[] = [];
    for (const frame of frameSequence) {
      const m = this.getDepthMetric(frame, exercise);
      raw.push(m ?? 0);
    }

    // 2. Smooth con media mobile (finestra 5)
    const windowSize = 5;
    const smoothed: number[] = [];
    for (let i = 0; i < raw.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(raw.length, i + Math.floor(windowSize / 2) + 1);
      let sum = 0;
      for (let j = start; j < end; j++) sum += raw[j];
      smoothed.push(sum / (end - start));
    }

    // 3. Trova minimi e massimi locali (bottom e top di ogni rep)
    const keyframes: { index: number; type: 'bottom' | 'top'; value: number }[] = [];
    const minNeighborhood = Math.max(3, Math.floor(frameSequence.length / 20));

    for (let i = minNeighborhood; i < smoothed.length - minNeighborhood; i++) {
      let isMax = true;
      let isMin = true;
      for (let j = i - minNeighborhood; j <= i + minNeighborhood; j++) {
        if (j === i) continue;
        if (smoothed[j] >= smoothed[i]) isMax = false;
        if (smoothed[j] <= smoothed[i]) isMin = false;
      }
      if (isMax) keyframes.push({ index: i, type: 'bottom', value: smoothed[i] });
      if (isMin) keyframes.push({ index: i, type: 'top', value: smoothed[i] });
    }

    // 4. Se nessun keyframe trovato, usa il frame con la metrica piu' estrema
    if (keyframes.length === 0) {
      let maxIdx = 0;
      let maxVal = smoothed[0];
      for (let i = 1; i < smoothed.length; i++) {
        if (smoothed[i] > maxVal) {
          maxVal = smoothed[i];
          maxIdx = i;
        }
      }
      return [maxIdx];
    }

    // 5. Ordina per significativita': bottom frame piu' profondi prima, poi top
    keyframes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'bottom' ? -1 : 1;
      return b.value - a.value;
    });

    // 6. Ritorna max 5 keyframe
    return keyframes.slice(0, 5).map(kf => kf.index).sort((a, b) => a - b);
  }

  /**
   * Valuta un singolo frame per check specifici dell'esercizio.
   * Ritorna la lista di issue per quel frame.
   */
  private checkFrameIssues(
    frame: any,
    exercise: SupportedExercise,
    isBottomFrame: boolean,
    _isTopFrame: boolean
  ): { code: string; severity: 'low' | 'medium' | 'high'; description: string }[] {
    const frameIssues: { code: string; severity: 'low' | 'medium' | 'high'; description: string }[] = [];

    switch (exercise) {
      case 'BACK_SQUAT':
      case 'FRONT_SQUAT':
        // Profondita': check SOLO sul bottom frame
        if (isBottomFrame && frame.left_hip && frame.left_knee) {
          if (frame.left_hip.y < frame.left_knee.y) {
            frameIssues.push({
              code: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              description: 'La profondità dello squat è insufficiente. L\'anca non scende sotto il ginocchio nel punto più basso del movimento.'
            });
          }
        }

        // Valgismo: check sui frame di discesa/salita
        if (frame.left_knee && frame.left_hip && frame.left_ankle) {
          const kneeX = frame.left_knee.x;
          const ankleX = frame.left_ankle.x;
          const hipX = frame.left_hip.x;
          const expectedKneeX = (hipX + ankleX) / 2;
          const valgus = Math.abs(kneeX - expectedKneeX);
          if (valgus > 0.06) {
            frameIssues.push({
              code: 'KNEE_VALGUS',
              severity: 'high',
              description: 'Le ginocchia tendono a collassare verso l\'interno (valgismo).'
            });
          }
        }

        // Forward lean eccessivo
        if (frame.left_hip && frame.left_shoulder && frame.left_ankle) {
          const torsoLean = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (torsoLean > 0.12) {
            frameIssues.push({
              code: 'EXCESSIVE_FORWARD_LEAN',
              severity: 'medium',
              description: 'Il busto si inclina eccessivamente in avanti. Mantieni il petto alto.'
            });
          }
        }

        // Talloni che si alzano
        if (frame.left_heel && frame.left_ankle) {
          const heelDiff = frame.left_ankle.y - frame.left_heel.y;
          if (heelDiff > 0.04) {
            frameIssues.push({
              code: 'HEEL_RISE',
              severity: 'medium',
              description: 'I talloni si sollevano durante il movimento. Distribuisci il peso su tutta la pianta del piede.'
            });
          }
        }
        break;

      case 'BULGARIAN_SPLIT_SQUAT':
      case 'PISTOL_SQUAT':
      case 'SKATER_SQUAT':
      case 'LUNGE_FORWARD':
        // Profondita' unilaterale
        if (isBottomFrame && frame.left_hip && frame.left_knee) {
          if (frame.left_hip.y < frame.left_knee.y) {
            frameIssues.push({
              code: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              description: 'La profondità è insufficiente. Cerca di scendere di più nel movimento.'
            });
          }
        }

        // Valgismo unilaterale
        if (frame.left_knee && frame.left_hip && frame.left_ankle) {
          const kneeX = frame.left_knee.x;
          const ankleX = frame.left_ankle.x;
          const hipX = frame.left_hip.x;
          const expectedKneeX = (hipX + ankleX) / 2;
          const valgus = Math.abs(kneeX - expectedKneeX);
          if (valgus > 0.06) {
            frameIssues.push({
              code: 'KNEE_VALGUS',
              severity: 'high',
              description: 'Il ginocchio collassa verso l\'interno. Spingi il ginocchio in fuori.'
            });
          }
        }

        // Inclinazione laterale del busto
        if (frame.left_shoulder && frame.right_shoulder) {
          const shoulderDiff = Math.abs(frame.left_shoulder.y - frame.right_shoulder.y);
          if (shoulderDiff > 0.05) {
            frameIssues.push({
              code: 'TORSO_SWING',
              severity: 'low',
              description: 'Il busto si inclina lateralmente. Mantieni le spalle allo stesso livello.'
            });
          }
        }
        break;

      case 'DEADLIFT_CONVENTIONAL':
      case 'DEADLIFT_SUMO':
        // Schiena arrotondata: check in base alla curvatura torso
        if (frame.left_hip && frame.left_shoulder) {
          const torsoAngle = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (torsoAngle > 0.15) {
            frameIssues.push({
              code: 'LOWER_BACK_ROUND',
              severity: 'high',
              description: 'La schiena appare eccessivamente curva durante il movimento.'
            });
          }
        }

        // Bar drift forward
        if (frame.left_wrist && frame.left_shoulder) {
          const barDrift = frame.left_wrist.x - frame.left_shoulder.x;
          if (barDrift > 0.08) {
            frameIssues.push({
              code: 'BAR_DRIFT_FORWARD',
              severity: 'medium',
              description: 'Il bilanciere si allontana dal corpo. Mantienilo vicino alle gambe.'
            });
          }
        }

        // Anche che salgono prima delle spalle (squat-morning)
        if (isBottomFrame && frame.left_hip && frame.left_shoulder) {
          // Questo check richiede due frame consecutivi, ma come euristica
          // controlliamo se le anche sono significativamente piu' alte delle spalle
          const hipShoulderDiff = frame.left_shoulder.y - frame.left_hip.y;
          if (hipShoulderDiff > 0.15) {
            frameIssues.push({
              code: 'HIPS_RISE_FIRST',
              severity: 'medium',
              description: 'Le anche salgono prima delle spalle. Mantieni l\'angolo del busto costante.'
            });
          }
        }
        break;

      case 'ROMANIAN_DEADLIFT':
        // Schiena
        if (frame.left_hip && frame.left_shoulder) {
          const torsoAngle = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (torsoAngle > 0.15) {
            frameIssues.push({
              code: 'LOWER_BACK_ROUND',
              severity: 'high',
              description: 'Mantieni la schiena neutra durante tutto il movimento.'
            });
          }
        }

        // Ginocchia troppo estese (hyperextension) o troppo flesse
        if (frame.left_knee && frame.left_hip && frame.left_ankle) {
          const kneeAngleRatio = Math.abs(frame.left_knee.y - frame.left_hip.y) /
            Math.max(0.01, Math.abs(frame.left_ankle.y - frame.left_hip.y));
          if (kneeAngleRatio < 0.3) {
            frameIssues.push({
              code: 'LOCKOUT_INCOMPLETE',
              severity: 'low',
              description: 'Mantieni una leggera flessione del ginocchio durante l\'RDL.'
            });
          }
        }
        break;

      case 'BENCH_PRESS':
        // Asimmetria braccia
        if (frame.left_wrist && frame.right_wrist) {
          const diff = Math.abs(frame.left_wrist.y - frame.right_wrist.y);
          if (diff > 0.1) {
            frameIssues.push({
              code: 'ARM_ASYMMETRY',
              severity: 'low',
              description: 'Le braccia si muovono in modo asimmetrico.'
            });
          }
        }

        // Elbow flare
        if (frame.left_elbow && frame.left_shoulder && frame.left_wrist) {
          const elbowFlare = Math.abs(frame.left_elbow.x - frame.left_shoulder.x);
          if (elbowFlare > 0.15) {
            frameIssues.push({
              code: 'ELBOW_FLARE',
              severity: 'medium',
              description: 'I gomiti si aprono troppo. Mantieni un angolo di circa 45° rispetto al busto.'
            });
          }
        }

        // Bar path: polsi non verticali sopra i gomiti
        if (frame.left_wrist && frame.left_elbow) {
          const barDeviation = Math.abs(frame.left_wrist.x - frame.left_elbow.x);
          if (barDeviation > 0.1) {
            frameIssues.push({
              code: 'BAR_PATH_DEVIATION',
              severity: 'low',
              description: 'Il bilanciere devia dalla traiettoria verticale ottimale.'
            });
          }
        }
        break;

      case 'OVERHEAD_PRESS':
        // Bar path
        if (frame.left_wrist && frame.left_shoulder) {
          const barDeviation = Math.abs(frame.left_wrist.x - frame.left_shoulder.x);
          if (barDeviation > 0.1) {
            frameIssues.push({
              code: 'BAR_PATH_DEVIATION',
              severity: 'medium',
              description: 'Il bilanciere dovrebbe seguire una traiettoria verticale vicino al viso.'
            });
          }
        }

        // Lean back eccessivo
        if (frame.left_hip && frame.left_shoulder) {
          const lean = frame.left_hip.x - frame.left_shoulder.x;
          if (lean > 0.08) {
            frameIssues.push({
              code: 'EXCESSIVE_FORWARD_LEAN',
              severity: 'medium',
              description: 'Inclinazione all\'indietro eccessiva. Contrai il core e i glutei.'
            });
          }
        }
        break;

      case 'PULL_UP':
      case 'CHIN_UP':
      case 'LAT_PULLDOWN':
        // Torso swing
        if (frame.left_hip && frame.left_shoulder) {
          const lean = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (lean > 0.12) {
            frameIssues.push({
              code: 'TORSO_SWING',
              severity: 'medium',
              description: 'Il busto oscilla eccessivamente. Cerca di mantenere il corpo stabile.'
            });
          }
        }

        // ROM incompleto (per pull-up/chin-up)
        if (isBottomFrame && (exercise === 'PULL_UP' || exercise === 'CHIN_UP')) {
          if (frame.left_elbow && frame.left_shoulder && frame.left_wrist) {
            const armExtension = Math.abs(frame.left_wrist.y - frame.left_shoulder.y);
            if (armExtension < 0.15) {
              frameIssues.push({
                code: 'INSUFFICIENT_DEPTH',
                severity: 'low',
                description: 'Le braccia non si estendono completamente nella fase negativa.'
              });
            }
          }
        }
        break;

      case 'BARBELL_ROW':
      case 'DUMBBELL_ROW':
      case 'CABLE_ROW':
      case 'INVERTED_ROW':
        // Torso swing
        if (frame.left_hip && frame.left_shoulder) {
          const lean = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (lean > 0.12) {
            frameIssues.push({
              code: 'TORSO_SWING',
              severity: 'medium',
              description: 'Il busto oscilla eccessivamente durante il movimento.'
            });
          }
        }

        // Schiena arrotondata nei row
        if (frame.left_hip && frame.left_shoulder) {
          const spineCheck = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (spineCheck > 0.18) {
            frameIssues.push({
              code: 'LOWER_BACK_ROUND',
              severity: 'high',
              description: 'La schiena si arrotonda durante il rematore. Mantieni il petto in fuori.'
            });
          }
        }
        break;

      case 'HIP_THRUST':
        // Lockout incompleto
        if (frame.left_hip && frame.left_shoulder && frame.left_knee) {
          const hipExtension = frame.left_hip.y - frame.left_shoulder.y;
          if (hipExtension < -0.03) {
            frameIssues.push({
              code: 'LOCKOUT_INCOMPLETE',
              severity: 'medium',
              description: 'Estensione dell\'anca incompleta. Spingi le anche fino al lockout completo.'
            });
          }
        }
        break;

      case 'PUSH_UP':
      case 'ARCHER_PUSH_UP':
        // Profondita'
        if (isBottomFrame && frame.left_elbow && frame.left_shoulder) {
          const elbowAngle = frame.left_elbow.y - frame.left_shoulder.y;
          if (elbowAngle < 0.05) {
            frameIssues.push({
              code: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              description: 'Scendi di più: il petto dovrebbe avvicinarsi al pavimento.'
            });
          }
        }

        // Spine alignment
        if (frame.left_hip && frame.left_shoulder && frame.left_ankle) {
          const hipSag = frame.left_hip.y - ((frame.left_shoulder.y + frame.left_ankle.y) / 2);
          if (Math.abs(hipSag) > 0.06) {
            frameIssues.push({
              code: 'SPINE_FLEXION',
              severity: 'medium',
              description: 'Le anche non sono allineate con spalle e caviglie. Mantieni il corpo come una tavola.'
            });
          }
        }
        break;

      case 'DIP':
        // Profondita'
        if (isBottomFrame && frame.left_elbow && frame.left_shoulder) {
          if (frame.left_shoulder.y < frame.left_elbow.y) {
            frameIssues.push({
              code: 'INSUFFICIENT_DEPTH',
              severity: 'low',
              description: 'La spalla non scende sotto il gomito. Aumenta il ROM se la mobilità lo permette.'
            });
          }
        }

        // Forward lean eccessivo
        if (frame.left_hip && frame.left_shoulder) {
          const lean = Math.abs(frame.left_shoulder.x - frame.left_hip.x);
          if (lean > 0.15) {
            frameIssues.push({
              code: 'EXCESSIVE_FORWARD_LEAN',
              severity: 'low',
              description: 'Inclinazione in avanti marcata. Per i tricipiti, mantieni il busto più verticale.'
            });
          }
        }
        break;

      case 'LEG_PRESS':
        // Profondita'
        if (isBottomFrame && frame.left_hip && frame.left_knee) {
          if (frame.left_hip.y < frame.left_knee.y) {
            frameIssues.push({
              code: 'INSUFFICIENT_DEPTH',
              severity: 'low',
              description: 'Il ROM alla leg press potrebbe essere maggiore.'
            });
          }
        }

        // Asimmetria gambe
        if (frame.left_knee && frame.right_knee) {
          const diff = Math.abs(frame.left_knee.y - frame.right_knee.y);
          if (diff > 0.08) {
            frameIssues.push({
              code: 'ARM_ASYMMETRY', // riuso codice
              severity: 'low',
              description: 'Le gambe si muovono in modo asimmetrico sulla leg press.'
            });
          }
        }
        break;

      case 'LEG_EXTENSION':
      case 'LEG_CURL':
        // Movimento esplosivo/incontrollato
        if (frame.left_knee && frame.right_knee) {
          const diff = Math.abs(frame.left_knee.y - frame.right_knee.y);
          if (diff > 0.08) {
            frameIssues.push({
              code: 'ARM_ASYMMETRY',
              severity: 'low',
              description: 'Asimmetria nel movimento. Controlla entrambe le gambe.'
            });
          }
        }
        break;

      case 'SHOULDER_PRESS_MACHINE':
      case 'CHEST_PRESS':
        // Asimmetria
        if (frame.left_wrist && frame.right_wrist) {
          const diff = Math.abs(frame.left_wrist.y - frame.right_wrist.y);
          if (diff > 0.08) {
            frameIssues.push({
              code: 'ARM_ASYMMETRY',
              severity: 'low',
              description: 'Le braccia si muovono in modo asimmetrico.'
            });
          }
        }
        break;
    }

    return frameIssues;
  }

  /**
   * Analisi basata su regole per-frame con rilevamento keyframe.
   */
  private analyzeWithRules(
    frameSequence: any[],
    exercise: SupportedExercise
  ): {
    score: number;
    issues: CorrectionResult['issues'];
    corrections: string[];
    warnings: string[];
    perFrameIssues: Map<number, { code: string; severity: 'low' | 'medium' | 'high'; description: string }[]>;
  } {
    const issues: CorrectionResult['issues'] = [];
    const corrections: string[] = [];
    const warnings: string[] = [];
    let score = 10;

    // Analisi base per tutti gli esercizi
    const avgVisibility = frameSequence.reduce((sum, f) => sum + (f.visibility || 0.5), 0) / frameSequence.length;

    if (avgVisibility < 0.5) {
      warnings.push('Visibilità bassa: assicurati di essere ben inquadrato');
      score -= 1;
    }

    // Trova keyframe
    const keyFrameIndices = this.findKeyFrames(frameSequence, exercise);

    // Identifica bottom e top frame
    const bottomIndices = new Set<number>();
    const topIndices = new Set<number>();
    if (keyFrameIndices.length > 0) {
      // Il frame con la metrica piu' alta e' il bottom
      let maxMetric = -Infinity;
      let maxIdx = keyFrameIndices[0];
      for (const idx of keyFrameIndices) {
        const m = this.getDepthMetric(frameSequence[idx], exercise) ?? 0;
        if (m > maxMetric) {
          maxMetric = m;
          maxIdx = idx;
        }
      }
      bottomIndices.add(maxIdx);

      // Il frame con la metrica piu' bassa e' il top/lockout
      let minMetric = Infinity;
      let minIdx = keyFrameIndices[0];
      for (const idx of keyFrameIndices) {
        const m = this.getDepthMetric(frameSequence[idx], exercise) ?? 0;
        if (m < minMetric) {
          minMetric = m;
          minIdx = idx;
        }
      }
      topIndices.add(minIdx);
    }

    // Valuta ciascun keyframe individualmente
    const perFrameIssues = new Map<number, { code: string; severity: 'low' | 'medium' | 'high'; description: string }[]>();
    const issueCodes = new Set<string>();

    for (const idx of keyFrameIndices) {
      const frame = frameSequence[idx];
      const isBottom = bottomIndices.has(idx);
      const isTop = topIndices.has(idx);
      const frameIssues = this.checkFrameIssues(frame, exercise, isBottom, isTop);
      perFrameIssues.set(idx, frameIssues);

      for (const fi of frameIssues) {
        issueCodes.add(fi.code);
      }
    }

    // Costruisci issues aggregate per il risultato globale
    Array.from(issueCodes).forEach(code => {
      const entries = Array.from(perFrameIssues.values());
      for (const frameIssues of entries) {
        const found = frameIssues.find(fi => fi.code === code);
        if (found) {
          issues.push({
            name: found.code,
            severity: found.severity,
            description: found.description,
          });
          score -= found.severity === 'high' ? 2 : found.severity === 'medium' ? 1.5 : 0.5;
          return;
        }
      }
    });

    // Correzioni specifiche per esercizio
    switch (exercise) {
      case 'BACK_SQUAT':
      case 'FRONT_SQUAT':
        if (issueCodes.has('INSUFFICIENT_DEPTH'))
          corrections.push('Aumenta la profondità dello squat: porta l\'anca sotto il livello delle ginocchia');
        if (issueCodes.has('KNEE_VALGUS'))
          corrections.push('Spingi le ginocchia in fuori nella direzione delle punte dei piedi');
        if (issueCodes.has('EXCESSIVE_FORWARD_LEAN'))
          corrections.push('Mantieni il petto alto e il core attivato per ridurre l\'inclinazione in avanti');
        if (issueCodes.has('HEEL_RISE'))
          corrections.push('Tieni i talloni a terra. Prova scarpe con rialzo o lavora sulla mobilità della caviglia');
        if (!issueCodes.size)
          corrections.push('Ottima tecnica! Mantieni questa qualità di movimento');
        break;

      case 'BULGARIAN_SPLIT_SQUAT':
      case 'PISTOL_SQUAT':
      case 'SKATER_SQUAT':
      case 'LUNGE_FORWARD':
        if (issueCodes.has('INSUFFICIENT_DEPTH'))
          corrections.push('Cerca di scendere con maggior profondità nel movimento');
        if (issueCodes.has('KNEE_VALGUS'))
          corrections.push('Attiva il gluteo medio per stabilizzare il ginocchio verso l\'esterno');
        if (issueCodes.has('TORSO_SWING'))
          corrections.push('Stabilizza il core per evitare oscillazioni laterali del busto');
        break;

      case 'DEADLIFT_CONVENTIONAL':
      case 'DEADLIFT_SUMO':
        if (issueCodes.has('LOWER_BACK_ROUND'))
          corrections.push('Mantieni la schiena neutra: attiva i dorsali prima della tirata');
        if (issueCodes.has('BAR_DRIFT_FORWARD'))
          corrections.push('Mantieni il bilanciere a contatto con le gambe durante tutto il movimento');
        if (issueCodes.has('HIPS_RISE_FIRST'))
          corrections.push('Inizia la tirata spingendo con le gambe, non alzando le anche');
        if (!issueCodes.size)
          corrections.push('Mantieni la schiena neutra durante tutto il movimento');
        break;

      case 'ROMANIAN_DEADLIFT':
        if (issueCodes.has('LOWER_BACK_ROUND'))
          corrections.push('Non scendere oltre il punto in cui perdi la neutralità della schiena');
        if (issueCodes.has('LOCKOUT_INCOMPLETE'))
          corrections.push('Mantieni una leggera flessione del ginocchio durante tutto il ROM');
        break;

      case 'BENCH_PRESS':
        if (issueCodes.has('ARM_ASYMMETRY'))
          corrections.push('Cerca di mantenere il movimento bilanciato e simmetrico');
        if (issueCodes.has('ELBOW_FLARE'))
          corrections.push('Riduci l\'apertura dei gomiti a circa 45° rispetto al busto');
        if (issueCodes.has('BAR_PATH_DEVIATION'))
          corrections.push('Il bilanciere dovrebbe scendere al petto e risalire verso il lockout in diagonale');
        break;

      case 'OVERHEAD_PRESS':
        if (issueCodes.has('BAR_PATH_DEVIATION'))
          corrections.push('Tieni il bilanciere vicino al viso durante la salita');
        if (issueCodes.has('EXCESSIVE_FORWARD_LEAN'))
          corrections.push('Contrai i glutei e il core per evitare di inarcare la schiena');
        break;

      case 'PULL_UP':
      case 'CHIN_UP':
        if (issueCodes.has('TORSO_SWING'))
          corrections.push('Riduci il kipping: controlla il movimento con i dorsali');
        if (issueCodes.has('INSUFFICIENT_DEPTH'))
          corrections.push('Estendi completamente le braccia nella fase negativa');
        corrections.push('Inizia con le braccia completamente distese');
        corrections.push('Porta il mento sopra la sbarra');
        break;

      case 'BARBELL_ROW':
      case 'DUMBBELL_ROW':
      case 'CABLE_ROW':
      case 'INVERTED_ROW':
        if (issueCodes.has('TORSO_SWING'))
          corrections.push('Mantieni il busto stabile e usa solo le braccia e la schiena');
        if (issueCodes.has('LOWER_BACK_ROUND'))
          corrections.push('Mantieni il petto in fuori e la schiena neutra durante il rematore');
        break;

      case 'HIP_THRUST':
        if (issueCodes.has('LOCKOUT_INCOMPLETE'))
          corrections.push('Spingi le anche fino alla completa estensione e contrai i glutei in alto');
        break;

      case 'PUSH_UP':
      case 'ARCHER_PUSH_UP':
        if (issueCodes.has('INSUFFICIENT_DEPTH'))
          corrections.push('Scendi fino a portare il petto vicino al pavimento');
        if (issueCodes.has('SPINE_FLEXION'))
          corrections.push('Mantieni il corpo allineato come una tavola: core e glutei contratti');
        break;

      case 'DIP':
        if (issueCodes.has('INSUFFICIENT_DEPTH'))
          corrections.push('Se la mobilità lo permette, cerca di portare la spalla sotto il gomito');
        if (issueCodes.has('EXCESSIVE_FORWARD_LEAN'))
          corrections.push('Per enfatizzare i tricipiti, mantieni il busto più verticale');
        break;

      default:
        corrections.push('Mantieni il controllo durante tutto il movimento');
    }

    score = Math.max(1, score);

    return { score, issues, corrections, warnings, perFrameIssues };
  }

  /**
   * Genera FrameLandmarkSnapshot[] SOLO per i keyframe rilevati.
   * Ogni keyframe ha status 'error' (con issues) o 'correct' (con segmenti verdi).
   */
  private buildIssueLandmarks(
    frameSequence: SharedPoseLandmarks[],
    perFrameIssues: Map<number, { code: string; severity: 'low' | 'medium' | 'high'; description: string }[]>,
    fps: number,
    exercise: SupportedExercise
  ): FrameLandmarkSnapshot[] {
    if (frameSequence.length === 0) {
      return [];
    }

    const snapshots: FrameLandmarkSnapshot[] = [];
    const exerciseSegments: SegmentDef[] = getExerciseBodySegments(exercise) as SegmentDef[];

    // Itera sui keyframe (indici presenti nella mappa)
    const entries = Array.from(perFrameIssues.entries());
    for (const [frameIndex, frameIssues] of entries) {
      if (frameIndex >= frameSequence.length) continue;

      const frame = frameSequence[frameIndex];
      const timestamp = fps > 0 ? frameIndex / fps : 0;

      const hasIssues = frameIssues.length > 0;

      const issuesCodes = frameIssues.map(fi => ({
        code: fi.code,
        severity: (fi.severity === 'high' ? 'HIGH' : fi.severity === 'medium' ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
      }));

      const snapshot = createLandmarkSnapshot(
        frame,
        frameIndex,
        timestamp,
        issuesCodes,
        hasIssues ? 'error' : 'correct',
        hasIssues ? undefined : exerciseSegments
      );

      // Solo se i landmark principali sono visibili
      const mainVisibility = snapshot.landmarks.left_hip.visibility;
      if (mainVisibility > 0.3) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
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
            morphotype: result.morphotype
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
  return [
    'Back Squat', 'Front Squat', 'Bulgarian Split Squat',
    'Deadlift', 'Sumo Deadlift', 'Romanian Deadlift',
    'Bench Press', 'Overhead Press',
    'Pull-up', 'Chin-up', 'Lat Pulldown', 'Barbell Row', 'Dumbbell Row',
    'Hip Thrust', 'Push-up', 'Dip',
    'Pistol Squat', 'Skater Squat', 'Archer Push-up', 'Inverted Row',
    'Lunge',
    'Leg Press', 'Leg Extension', 'Leg Curl',
    'Cable Row', 'Chest Press', 'Shoulder Press Machine'
  ];
}

/**
 * Esercizi con correzioni specifiche implementate (non solo feedback generico)
 */
const exercisesWithCorrections = new Set<SupportedExercise>([
  'BACK_SQUAT', 'FRONT_SQUAT', 'BULGARIAN_SPLIT_SQUAT',
  'DEADLIFT_CONVENTIONAL', 'DEADLIFT_SUMO', 'ROMANIAN_DEADLIFT',
  'BENCH_PRESS', 'OVERHEAD_PRESS',
  'PULL_UP', 'CHIN_UP',
  'BARBELL_ROW', 'DUMBBELL_ROW',
  'HIP_THRUST', 'PUSH_UP', 'DIP',
  'PISTOL_SQUAT', 'SKATER_SQUAT', 'LUNGE_FORWARD',
]);

export function hasSpecificCorrections(exerciseName: string): boolean {
  const mapped = mapExerciseToSupported(exerciseName);
  return mapped !== null && exercisesWithCorrections.has(mapped);
}
