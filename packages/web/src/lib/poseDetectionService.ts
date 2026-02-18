/**
 * Pose Detection Service
 * Usa MediaPipe Pose per estrarre i landmark dal video
 * e li converte nel formato del nostro Biomechanics Engine
 */

import type { PoseLandmarks, PoseLandmark } from '@trainsmart/shared';

// MediaPipe landmark indices
const MP_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
} as const;

export interface PoseDetectionResult {
  success: boolean;
  landmarks?: PoseLandmarks;
  confidence: number;
  error?: string;
}

export interface VideoAnalysisProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  status: 'extracting' | 'analyzing' | 'completed' | 'failed';
}

export interface VideoAnalysisResult {
  success: boolean;
  frameSequence: PoseLandmarks[];
  fps: number;
  duration: number;
  averageConfidence: number;
  frameImages?: Map<number, string>; // frameIndex → base64 JPEG
  error?: string;
}

/**
 * Converte i landmark MediaPipe nel formato del nostro engine
 */
function convertMediaPipeLandmarks(mpLandmarks: any[]): PoseLandmarks {
  const getLandmark = (index: number): PoseLandmark => ({
    x: mpLandmarks[index]?.x || 0,
    y: mpLandmarks[index]?.y || 0,
    z: mpLandmarks[index]?.z || 0,
    visibility: mpLandmarks[index]?.visibility || 0
  });

  return {
    // Testa
    nose: getLandmark(MP_LANDMARKS.NOSE),
    left_eye: getLandmark(MP_LANDMARKS.LEFT_EYE),
    right_eye: getLandmark(MP_LANDMARKS.RIGHT_EYE),
    left_ear: getLandmark(MP_LANDMARKS.LEFT_EAR),
    right_ear: getLandmark(MP_LANDMARKS.RIGHT_EAR),

    // Spalle
    left_shoulder: getLandmark(MP_LANDMARKS.LEFT_SHOULDER),
    right_shoulder: getLandmark(MP_LANDMARKS.RIGHT_SHOULDER),

    // Braccia
    left_elbow: getLandmark(MP_LANDMARKS.LEFT_ELBOW),
    right_elbow: getLandmark(MP_LANDMARKS.RIGHT_ELBOW),
    left_wrist: getLandmark(MP_LANDMARKS.LEFT_WRIST),
    right_wrist: getLandmark(MP_LANDMARKS.RIGHT_WRIST),

    // Anche
    left_hip: getLandmark(MP_LANDMARKS.LEFT_HIP),
    right_hip: getLandmark(MP_LANDMARKS.RIGHT_HIP),

    // Gambe
    left_knee: getLandmark(MP_LANDMARKS.LEFT_KNEE),
    right_knee: getLandmark(MP_LANDMARKS.RIGHT_KNEE),
    left_ankle: getLandmark(MP_LANDMARKS.LEFT_ANKLE),
    right_ankle: getLandmark(MP_LANDMARKS.RIGHT_ANKLE),

    // Piedi
    left_heel: getLandmark(MP_LANDMARKS.LEFT_HEEL),
    right_heel: getLandmark(MP_LANDMARKS.RIGHT_HEEL),
    left_foot_index: getLandmark(MP_LANDMARKS.LEFT_FOOT_INDEX),
    right_foot_index: getLandmark(MP_LANDMARKS.RIGHT_FOOT_INDEX)
  };
}

/**
 * Calcola la confidence media dei landmark chiave
 */
function calculateConfidence(landmarks: PoseLandmarks): number {
  const keyLandmarks = [
    landmarks.left_shoulder,
    landmarks.right_shoulder,
    landmarks.left_hip,
    landmarks.right_hip,
    landmarks.left_knee,
    landmarks.right_knee,
    landmarks.left_ankle,
    landmarks.right_ankle
  ];

  const totalVisibility = keyLandmarks.reduce((sum, l) => sum + l.visibility, 0);
  return totalVisibility / keyLandmarks.length;
}

/**
 * ⚠️ SMART DETECTION: Rileva se la persona sta camminando o è ferma
 *
 * Calcola il movimento orizzontale delle anche (walking indicator)
 * Se le anche si muovono molto orizzontalmente → camminata
 * Se le anche si muovono principalmente verticalmente → esercizio
 */
function calculateHorizontalMotion(currentFrame: PoseLandmarks, previousFrame: PoseLandmarks): number {
  const hipDeltaX = Math.abs(
    ((currentFrame.left_hip.x + currentFrame.right_hip.x) / 2) -
    ((previousFrame.left_hip.x + previousFrame.right_hip.x) / 2)
  );
  return hipDeltaX;
}

/**
 * Rileva se i piedi sono "piantati" (non in movimento orizzontale)
 * Utile per capire quando la persona è in posizione per l'esercizio
 */
function areFeetPlanted(currentFrame: PoseLandmarks, previousFrame: PoseLandmarks, threshold: number = 0.02): boolean {
  const leftFootDeltaX = Math.abs(currentFrame.left_ankle.x - previousFrame.left_ankle.x);
  const rightFootDeltaX = Math.abs(currentFrame.right_ankle.x - previousFrame.right_ankle.x);

  return leftFootDeltaX < threshold && rightFootDeltaX < threshold;
}

/**
 * Trova la "finestra di esercizio" analizzando il movimento
 * Restituisce l'indice di inizio e fine dei frame validi
 */
function findExerciseWindow(
  frames: PoseLandmarks[],
  minStableFrames: number = 3
): { startIndex: number; endIndex: number } {
  if (frames.length < minStableFrames * 2) {
    return { startIndex: 0, endIndex: frames.length - 1 };
  }

  let startIndex = 0;
  let endIndex = frames.length - 1;

  // Trova inizio: primo punto dove i piedi sono stabili per N frame consecutivi
  let stableCount = 0;
  for (let i = 1; i < frames.length - minStableFrames; i++) {
    if (areFeetPlanted(frames[i], frames[i - 1])) {
      stableCount++;
      if (stableCount >= minStableFrames) {
        startIndex = Math.max(0, i - minStableFrames);
        console.log(`[SmartDetection] 🎯 Exercise start detected at frame ${startIndex}`);
        break;
      }
    } else {
      stableCount = 0;
    }
  }

  // Trova fine: ultimo punto dove i piedi sono ancora stabili
  stableCount = 0;
  for (let i = frames.length - 2; i > startIndex + minStableFrames; i--) {
    if (areFeetPlanted(frames[i], frames[i + 1])) {
      stableCount++;
      if (stableCount >= minStableFrames) {
        endIndex = Math.min(frames.length - 1, i + minStableFrames);
        console.log(`[SmartDetection] 🎯 Exercise end detected at frame ${endIndex}`);
        break;
      }
    } else {
      stableCount = 0;
    }
  }

  return { startIndex, endIndex };
}

/**
 * Classe principale per il Pose Detection
 * Usa MediaPipe Pose per estrarre i landmark frame by frame
 */
export class PoseDetector {
  private pose: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Inizializza MediaPipe Pose
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    await this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      // Dynamic import per evitare problemi SSR
      const { Pose } = await import('@mediapipe/pose');

      this.pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 2,        // 0, 1, or 2 - higher = more accurate but slower
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Prepara il modello
      await this.pose.initialize();
      this.isInitialized = true;

      console.log('[PoseDetector] Initialized successfully');
    } catch (error) {
      console.error('[PoseDetector] Failed to initialize:', error);
      throw new Error('Failed to initialize pose detection');
    }
  }

  /**
   * Analizza un singolo frame (immagine o video element)
   */
  async detectPose(imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<PoseDetectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.pose.onResults((results: any) => {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          const landmarks = convertMediaPipeLandmarks(results.poseLandmarks);
          const confidence = calculateConfidence(landmarks);

          resolve({
            success: true,
            landmarks,
            confidence
          });
        } else {
          resolve({
            success: false,
            confidence: 0,
            error: 'No pose detected in frame'
          });
        }
      });

      this.pose.send({ image: imageSource });
    });
  }

  /**
   * Analizza un video completo e restituisce la sequenza di landmark
   *
   * ⚠️ IMPORTANTE: Analizza solo la PORZIONE CENTRALE del video
   * Questo evita di catturare l'utente mentre cammina verso la postazione
   * o mentre si allontana alla fine.
   *
   * Strategia: Salta il primo 20% e l'ultimo 20% del video
   * Analizza solo il 60% centrale (dove presumibilmente si svolge l'esercizio)
   */
  async analyzeVideo(
    videoElement: HTMLVideoElement,
    onProgress?: (progress: VideoAnalysisProgress) => void,
    targetFps: number = 10  // Analizziamo 10 fps per efficienza
  ): Promise<VideoAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const frameSequence: PoseLandmarks[] = [];
    const totalDuration = videoElement.duration;

    // ⚠️ SMART FRAME SELECTION: Analizza solo la porzione centrale del video
    // Salta il primo 20% (camminata verso postazione) e l'ultimo 20% (uscita)
    const SKIP_START_PERCENT = 0.20;  // Salta primo 20%
    const SKIP_END_PERCENT = 0.20;    // Salta ultimo 20%

    const startTime = totalDuration * SKIP_START_PERCENT;
    const endTime = totalDuration * (1 - SKIP_END_PERCENT);
    const analyzeDuration = endTime - startTime;

    // Se il video è troppo corto (< 5 secondi), analizza tutto
    const effectiveStartTime = totalDuration < 5 ? 0 : startTime;
    const effectiveEndTime = totalDuration < 5 ? totalDuration : endTime;
    const effectiveDuration = effectiveEndTime - effectiveStartTime;

    const totalFrames = Math.floor(effectiveDuration * targetFps);
    const frameInterval = 1 / targetFps;

    let confidenceSum = 0;
    let validFrames = 0;

    // Crea un canvas per estrarre i frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d')!;

    console.log(`[PoseDetector] Analyzing video: ${totalDuration}s total`);
    console.log(`[PoseDetector] ⏱️ Smart selection: analyzing ${effectiveStartTime.toFixed(1)}s - ${effectiveEndTime.toFixed(1)}s (${totalFrames} frames at ${targetFps} fps)`);
    if (totalDuration >= 5) {
      console.log(`[PoseDetector] ⚠️ Skipping first ${(SKIP_START_PERCENT * 100)}% and last ${(SKIP_END_PERCENT * 100)}% to avoid walk-in/walk-out`);
    }

    const frameImages = new Map<number, string>();
    const CAPTURE_EVERY_N_FRAMES = 5; // cattura 1 frame ogni 5 per performance

    onProgress?.({
      currentFrame: 0,
      totalFrames,
      percentage: 0,
      status: 'extracting'
    });

    for (let i = 0; i < totalFrames; i++) {
      // ⚠️ Inizia da effectiveStartTime, non da 0
      const currentTime = effectiveStartTime + (i * frameInterval);

      // Seek to frame
      videoElement.currentTime = currentTime;

      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener('seeked', onSeeked);
          resolve();
        };
        videoElement.addEventListener('seeked', onSeeked);
      });

      // Draw frame to canvas
      ctx.drawImage(videoElement, 0, 0);

      // Detect pose
      const result = await this.detectPose(canvas);

      if (result.success && result.landmarks) {
        frameSequence.push(result.landmarks);
        confidenceSum += result.confidence;
        validFrames++;
      } else {
        // Usa l'ultimo frame valido se disponibile (per continuità)
        if (frameSequence.length > 0) {
          frameSequence.push({ ...frameSequence[frameSequence.length - 1] });
        }
      }

      // Cattura snapshot del frame ogni N frame (dopo push, per avere indice corretto)
      if (frameSequence.length > 0 && frameSequence.length % CAPTURE_EVERY_N_FRAMES === 0) {
        try {
          frameImages.set(frameSequence.length - 1, canvas.toDataURL('image/jpeg', 0.4));
        } catch {
          // canvas tainted o errore — ignora silenziosamente
        }
      }

      onProgress?.({
        currentFrame: i + 1,
        totalFrames,
        percentage: Math.round(((i + 1) / totalFrames) * 100),
        status: 'extracting'
      });
    }

    // Verifica che abbiamo abbastanza frame validi
    const validPercentage = validFrames / totalFrames;

    if (validPercentage < 0.5) {
      return {
        success: false,
        frameSequence: [],
        fps: targetFps,
        duration: effectiveDuration,
        averageConfidence: 0,
        frameImages: new Map(),
        error: `Pose detection riuscita solo nel ${Math.round(validPercentage * 100)}% dei frame. Assicurati di essere completamente inquadrato.`
      };
    }

    // ⚠️ SMART DETECTION: Trova la finestra dove l'esercizio è effettivamente eseguito
    // Questo filtra ulteriormente i frame dove la persona sta ancora camminando
    console.log(`[PoseDetector] 🔍 Running smart exercise detection...`);
    const exerciseWindow = findExerciseWindow(frameSequence, 3);

    // Estrai solo i frame nella finestra di esercizio
    const filteredFrames = frameSequence.slice(exerciseWindow.startIndex, exerciseWindow.endIndex + 1);
    const framesRemoved = frameSequence.length - filteredFrames.length;

    if (framesRemoved > 0) {
      console.log(`[PoseDetector] 🎯 Smart detection removed ${framesRemoved} frames (walk-in/walk-out)`);
      console.log(`[PoseDetector] 📊 Using frames ${exerciseWindow.startIndex}-${exerciseWindow.endIndex} of ${frameSequence.length}`);
    }

    // Ricalcola confidence sui frame filtrati
    const filteredConfidence = filteredFrames.reduce((sum, frame) => sum + calculateConfidence(frame), 0) / filteredFrames.length;

    onProgress?.({
      currentFrame: totalFrames,
      totalFrames,
      percentage: 100,
      status: 'completed'
    });

    console.log(`[PoseDetector] ✅ Analysis complete: ${filteredFrames.length} exercise frames (${Math.round(filteredConfidence * 100)}% confidence)`);

    // Riallinea frameImages ai frame filtrati (mantieni offset originale)
    const filteredFrameImages = new Map<number, string>();
    for (const [origIdx, imgData] of frameImages) {
      const adjustedIdx = origIdx - exerciseWindow.startIndex;
      if (adjustedIdx >= 0 && adjustedIdx < filteredFrames.length) {
        filteredFrameImages.set(adjustedIdx, imgData);
      }
    }

    return {
      success: true,
      frameSequence: filteredFrames,
      fps: targetFps,
      duration: filteredFrames.length / targetFps,
      averageConfidence: filteredConfidence,
      frameImages: filteredFrameImages,
    };
  }

  /**
   * Analizza video da Blob
   */
  async analyzeVideoBlob(
    videoBlob: Blob,
    onProgress?: (progress: VideoAnalysisProgress) => void
  ): Promise<VideoAnalysisResult> {
    // Crea un video element temporaneo
    const videoUrl = URL.createObjectURL(videoBlob);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.muted = true;
    videoElement.playsInline = true;

    // Attendi che il video sia caricato
    await new Promise<void>((resolve, reject) => {
      videoElement.onloadedmetadata = () => resolve();
      videoElement.onerror = () => reject(new Error('Failed to load video'));
      videoElement.load();
    });

    try {
      const result = await this.analyzeVideo(videoElement, onProgress);
      return result;
    } finally {
      URL.revokeObjectURL(videoUrl);
    }
  }

  /**
   * Rilascia le risorse
   */
  close(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
  }
}

// Singleton instance
let poseDetectorInstance: PoseDetector | null = null;

/**
 * Ottieni l'istanza singleton del PoseDetector
 */
export function getPoseDetector(): PoseDetector {
  if (!poseDetectorInstance) {
    poseDetectorInstance = new PoseDetector();
  }
  return poseDetectorInstance;
}

/**
 * Utility per verificare se MediaPipe è supportato
 */
export function isPoseDetectionSupported(): boolean {
  // MediaPipe richiede WebGL
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}
