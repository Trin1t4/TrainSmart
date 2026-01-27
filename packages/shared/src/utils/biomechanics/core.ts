/**
 * Biomechanics Engine - Core Utilities
 * Funzioni base per calcoli geometrici e analisi pose
 */

import type {
  PoseLandmark,
  PoseLandmarks,
  UserProportions,
  Morphotype,
  MorphotypeType,
  FrameAnalysis,
  ExercisePhase,
  CameraValidationResult
} from '../../types/biomechanics.types';

// ============================================
// COSTANTI
// ============================================

export const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
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

// ============================================
// FUNZIONI GEOMETRICHE
// ============================================

/**
 * Converte gradi in radianti
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converte radianti in gradi
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calcola la distanza euclidea tra due punti
 */
export function distance(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = (p2.z || 0) - (p1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calcola la distanza 2D (ignora z)
 */
export function distance2D(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcola il punto medio tra due landmark
 */
export function midpoint(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: ((p1.z || 0) + (p2.z || 0)) / 2,
    visibility: Math.min(p1.visibility, p2.visibility)
  };
}

/**
 * Calcola l'angolo tra tre punti (in gradi)
 * Il punto centrale (p2) è il vertice dell'angolo
 */
export function calculateAngle(p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;

  const angle = Math.atan2(Math.abs(cross), dot);
  return toDegrees(angle);
}

/**
 * Calcola l'angolo rispetto alla verticale
 */
export function angleFromVertical(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(Math.abs(dx), Math.abs(dy));
  return toDegrees(angle);
}

/**
 * Calcola l'angolo rispetto all'orizzontale
 */
export function angleFromHorizontal(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(dy, dx);
  return toDegrees(angle);
}

// ============================================
// PROPORZIONI E MORFOTIPO
// ============================================

/**
 * Calcola le proporzioni corporee dai landmark
 */
export function calculateProportions(landmarks: PoseLandmarks): UserProportions {
  // Lunghezze segmenti (media tra lato destro e sinistro)
  const leftFemur = distance(landmarks.left_hip, landmarks.left_knee);
  const rightFemur = distance(landmarks.right_hip, landmarks.right_knee);
  const femurLength = (leftFemur + rightFemur) / 2;

  const leftTibia = distance(landmarks.left_knee, landmarks.left_ankle);
  const rightTibia = distance(landmarks.right_knee, landmarks.right_ankle);
  const tibiaLength = (leftTibia + rightTibia) / 2;

  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const torsoLength = distance(hipMid, shoulderMid);

  const leftArm = distance(landmarks.left_shoulder, landmarks.left_elbow) +
    distance(landmarks.left_elbow, landmarks.left_wrist);
  const rightArm = distance(landmarks.right_shoulder, landmarks.right_elbow) +
    distance(landmarks.right_elbow, landmarks.right_wrist);
  const armLength = (leftArm + rightArm) / 2;

  // Rapporti
  const femurToTorso = femurLength / torsoLength;
  const armToTorso = armLength / torsoLength;
  const tibiaToFemur = tibiaLength / femurLength;

  return {
    femurLength,
    tibiaLength,
    torsoLength,
    armLength,
    femurToTorso,
    armToTorso,
    tibiaToFemur
  };
}

/**
 * Classifica il morfotipo basandosi sulle proporzioni
 */
export function classifyMorphotype(proportions: UserProportions): Morphotype {
  const { femurToTorso, armToTorso } = proportions;

  // Femori lunghi
  if (femurToTorso > 1.1) {
    return {
      type: 'LONG_FEMUR',
      squatImplications: {
        expectedTorsoLean: 'high',      // 45-60°
        preferredStance: 'wide',
        preferredStyle: 'low_bar',
        depthChallenge: true
      },
      deadliftImplications: {
        preferredStyle: 'sumo',
        hipStartPosition: 'high'
      },
      note: 'Le tue proporzioni richiedono più inclinazione del torso nello squat - è normale!'
    };
  }

  // Torso lungo
  if (femurToTorso < 0.9) {
    return {
      type: 'LONG_TORSO',
      squatImplications: {
        expectedTorsoLean: 'low',       // 20-35°
        preferredStance: 'medium',
        preferredStyle: 'high_bar',
        depthChallenge: false
      },
      deadliftImplications: {
        preferredStyle: 'conventional',
        hipStartPosition: 'low'
      },
      note: 'Con un torso lungo puoi mantenere una posizione più verticale nello squat.'
    };
  }

  // Braccia lunghe
  if (armToTorso > 1.1) {
    return {
      type: 'LONG_ARMS',
      benchImplications: {
        romAdvantage: false,  // ROM maggiore = più lavoro
        gripWidth: 'wide'
      },
      deadliftImplications: {
        preferredStyle: 'conventional',
        hipStartPosition: 'high',
        advantage: true
      },
      note: 'Le braccia lunghe ti danno un vantaggio nello stacco ma ROM maggiore in panca.'
    };
  }

  // Braccia corte
  if (armToTorso < 0.9) {
    return {
      type: 'SHORT_ARMS',
      benchImplications: {
        romAdvantage: true,   // ROM minore
        gripWidth: 'medium'
      },
      deadliftImplications: {
        preferredStyle: 'sumo',
        hipStartPosition: 'low'
      },
      note: 'Le braccia corte ti avvantaggiano in panca ma richiedono setup attento nello stacco.'
    };
  }

  // Proporzioni bilanciate
  return {
    type: 'BALANCED',
    squatImplications: {
      expectedTorsoLean: 'medium',
      preferredStance: 'medium',
      preferredStyle: 'high_bar',
      depthChallenge: false
    },
    deadliftImplications: {
      preferredStyle: 'conventional',
      hipStartPosition: 'medium'
    },
    benchImplications: {
      romAdvantage: false,
      gripWidth: 'medium'
    },
    note: 'Proporzioni bilanciate - puoi adattarti bene a diversi stili.'
  };
}

// ============================================
// VALIDAZIONE CAMERA
// ============================================

/**
 * Valida l'angolazione della camera (dovrebbe essere ~45° posteriore-laterale)
 */
export function validateCameraAngle(landmarks: PoseLandmarks): CameraValidationResult {
  // Verifica che i landmark principali siano visibili
  const requiredLandmarks = [
    landmarks.left_shoulder,
    landmarks.right_shoulder,
    landmarks.left_hip,
    landmarks.right_hip,
    landmarks.left_knee,
    landmarks.right_knee,
    landmarks.left_ankle,
    landmarks.right_ankle
  ];

  const allVisible = requiredLandmarks.every(l => l.visibility > 0.5);
  if (!allVisible) {
    return {
      valid: false,
      error: 'BODY_NOT_VISIBLE',
      message: 'Non riesco a vedere tutto il corpo. Assicurati di essere completamente inquadrato.'
    };
  }

  // Calcola l'overlap delle spalle per stimare l'angolo
  const shoulderWidth = distance2D(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipWidth = distance2D(landmarks.left_hip, landmarks.right_hip);

  // Se vediamo entrambe le spalle/anche con overlap parziale = ~45°
  // Stima basata sulla differenza di x tra spalla sx e dx
  const shoulderDeltaX = Math.abs(landmarks.right_shoulder.x - landmarks.left_shoulder.x);

  // Normalizza rispetto alla larghezza attesa (circa 0.3-0.4 della frame width per vista 45°)
  // Vista laterale pura: shoulderDeltaX ~ 0 (spalle sovrapposte)
  // Vista frontale pura: shoulderDeltaX ~ 0.3-0.4 (spalle ben separate)
  // Vista 45°: shoulderDeltaX ~ 0.15-0.25

  if (shoulderDeltaX < 0.08) {
    return {
      valid: false,
      error: 'CAMERA_TOO_LATERAL',
      message: 'La camera è troppo di lato. Spostati più dietro per vedere anche la schiena.'
    };
  }

  if (shoulderDeltaX > 0.35) {
    return {
      valid: false,
      error: 'CAMERA_TOO_POSTERIOR',
      message: 'La camera è troppo dietro. Spostati più di lato per vedere anche il fianco.'
    };
  }

  // Stima l'angolo approssimativo
  const estimatedAngle = Math.round(45 * (shoulderDeltaX / 0.2));

  return {
    valid: true,
    estimatedAngle: Math.min(60, Math.max(30, estimatedAngle))
  };
}

// ============================================
// CORREZIONE PROSPETTIVA
// ============================================

/**
 * Corregge l'angolo misurato per la prospettiva della camera
 */
export function correctAngleForPerspective(
  measuredAngle: number,
  cameraAngle: number = 45,
  jointPlane: 'SAGITTAL' | 'FRONTAL'
): number {
  if (jointPlane === 'SAGITTAL') {
    // Angoli nel piano sagittale (es. flessione ginocchio)
    return measuredAngle / Math.cos(toRadians(cameraAngle));
  }

  if (jointPlane === 'FRONTAL') {
    // Angoli nel piano frontale (es. valgismo)
    return measuredAngle / Math.sin(toRadians(cameraAngle));
  }

  return measuredAngle;
}

// ============================================
// ANALISI VELOCITÀ E FASE
// ============================================

/**
 * Calcola la velocità tra due frame
 */
export function calculateVelocity(
  landmarks1: PoseLandmarks,
  landmarks2: PoseLandmarks,
  deltaTime: number
): number {
  // Usa il baricentro (media delle anche) come riferimento
  const hip1 = midpoint(landmarks1.left_hip, landmarks1.right_hip);
  const hip2 = midpoint(landmarks2.left_hip, landmarks2.right_hip);

  const displacement = distance2D(hip1, hip2);
  return displacement / deltaTime;
}

/**
 * Trova il frame con velocità minima (sticking point)
 */
export function findMinVelocityFrame(frames: FrameAnalysis[]): FrameAnalysis | null {
  if (frames.length < 3) return null;

  // Escludi il primo e ultimo frame, e i frame di inversione
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length === 0) return null;

  let minVelocity = Infinity;
  let minFrame: FrameAnalysis | null = null;

  for (const frame of concentricFrames) {
    if (frame.velocity !== undefined && frame.velocity < minVelocity && frame.velocity > 0) {
      minVelocity = frame.velocity;
      minFrame = frame;
    }
  }

  return minFrame;
}

/**
 * Determina la fase del movimento basandosi sulla posizione e direzione
 */
export function determinePhase(
  currentFrame: PoseLandmarks,
  previousFrame: PoseLandmarks | null,
  exercise: string
): ExercisePhase {
  if (!previousFrame) return 'SETUP';

  const currentHip = midpoint(currentFrame.left_hip, currentFrame.right_hip);
  const prevHip = midpoint(previousFrame.left_hip, previousFrame.right_hip);

  // Direzione del movimento (y aumenta verso il basso nell'immagine)
  const movingDown = currentHip.y > prevHip.y;
  const movingUp = currentHip.y < prevHip.y;

  // Calcola l'angolo del ginocchio per determinare la profondità
  const kneeAngle = calculateAngle(
    currentFrame.left_hip,
    currentFrame.left_knee,
    currentFrame.left_ankle
  );

  // Per squat/stacco
  if (['BACK_SQUAT', 'FRONT_SQUAT', 'DEADLIFT_CONVENTIONAL', 'DEADLIFT_SUMO'].includes(exercise)) {
    if (movingDown) {
      return kneeAngle < 100 ? 'BOTTOM' : 'ECCENTRIC';
    }
    if (movingUp) {
      return kneeAngle > 160 ? 'LOCKOUT' : 'CONCENTRIC';
    }
    return kneeAngle < 100 ? 'BOTTOM' : 'MID_RANGE';
  }

  // Per panca/OHP (movimento braccia)
  if (['BENCH_PRESS', 'OVERHEAD_PRESS', 'PUSH_UP'].includes(exercise)) {
    const elbowAngle = calculateAngle(
      currentFrame.left_shoulder,
      currentFrame.left_elbow,
      currentFrame.left_wrist
    );

    if (elbowAngle < 100) return 'BOTTOM';
    if (elbowAngle > 160) return 'LOCKOUT';
    return movingUp ? 'CONCENTRIC' : 'ECCENTRIC';
  }

  // Default
  return 'MID_RANGE';
}

// ============================================
// UTILITY ANGOLI SPECIFICI
// ============================================

/**
 * Calcola l'angolo del ginocchio
 */
export function getKneeAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_hip, landmarks.left_knee, landmarks.left_ankle);
  }
  return calculateAngle(landmarks.right_hip, landmarks.right_knee, landmarks.right_ankle);
}

/**
 * Calcola l'angolo dell'anca
 */
export function getHipAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_shoulder, landmarks.left_hip, landmarks.left_knee);
  }
  return calculateAngle(landmarks.right_shoulder, landmarks.right_hip, landmarks.right_knee);
}

/**
 * Calcola l'angolo del gomito
 */
export function getElbowAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_shoulder, landmarks.left_elbow, landmarks.left_wrist);
  }
  return calculateAngle(landmarks.right_shoulder, landmarks.right_elbow, landmarks.right_wrist);
}

/**
 * Calcola l'inclinazione del torso rispetto alla verticale
 */
export function getTorsoAngle(landmarks: PoseLandmarks): number {
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  return angleFromVertical(hipMid, shoulderMid);
}

/**
 * Calcola il valgismo del ginocchio (positivo = valgo, negativo = varo)
 */
export function getKneeValgus(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  // Confronta la posizione x del ginocchio rispetto alla linea anca-caviglia
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;
  const knee = side === 'left' ? landmarks.left_knee : landmarks.right_knee;
  const ankle = side === 'left' ? landmarks.left_ankle : landmarks.right_ankle;

  // Posizione x attesa del ginocchio (interpolazione lineare)
  const expectedKneeX = hip.x + (ankle.x - hip.x) * ((knee.y - hip.y) / (ankle.y - hip.y));

  // Deviazione (positivo = ginocchio verso l'interno = valgo)
  const deviation = knee.x - expectedKneeX;

  // Converti in gradi approssimativi
  const kneeToAnkleDistance = distance2D(knee, ankle);
  return toDegrees(Math.atan(deviation / kneeToAnkleDistance));
}

/**
 * Verifica se la spine è in posizione neutrale
 */
export function isSpineNeutral(landmarks: PoseLandmarks): boolean {
  // Semplificazione: verifica l'allineamento spalla-anca
  // Una spine neutrale mantiene una curva lombare naturale

  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);

  // Calcola la curvatura approssimativa usando il punto medio
  // In una vista laterale, con spine neutrale, la linea è relativamente dritta

  // Per ora, ritorniamo true se l'angolo del torso è ragionevole
  const torsoAngle = getTorsoAngle(landmarks);

  // Torso inclinato oltre 70° probabilmente indica perdita di neutralità
  return torsoAngle < 70;
}

/**
 * Verifica se i talloni sono a terra
 *
 * NOTA: Questa funzione è soggetta a falsi positivi a causa di:
 * - Rumore nei landmark dei piedi (bassa visibilità)
 * - Prospettiva della camera (vista laterale/45°)
 * - Variazioni naturali nella posizione del piede
 *
 * Per ridurre i falsi positivi:
 * 1. Usiamo una soglia più alta (0.04 invece di 0.02)
 * 2. Verifichiamo la visibilità dei landmark
 * 3. Usiamo anche la caviglia come riferimento aggiuntivo
 */
export function areHeelsDown(landmarks: PoseLandmarks): boolean {
  // Verifica visibilità minima dei landmark dei piedi
  const MIN_VISIBILITY = 0.5;
  const leftFootVisible = landmarks.left_heel.visibility > MIN_VISIBILITY &&
                          landmarks.left_foot_index.visibility > MIN_VISIBILITY;
  const rightFootVisible = landmarks.right_heel.visibility > MIN_VISIBILITY &&
                           landmarks.right_foot_index.visibility > MIN_VISIBILITY;

  // Se i piedi non sono ben visibili, assumiamo talloni a terra (evita falsi positivi)
  if (!leftFootVisible && !rightFootVisible) {
    return true;
  }

  // Soglia aumentata per ridurre sensibilità al rumore
  // 0.04 = 4% dell'altezza frame, circa 43 pixel a 1080p
  const THRESHOLD = 0.04;

  // Metodo primario: confronto tallone vs punta del piede
  // In coordinate MediaPipe: Y cresce verso il basso
  // Tallone alzato = heel.y < foot_index.y (tallone più in alto)
  let leftHeelUp = false;
  let rightHeelUp = false;

  if (leftFootVisible) {
    const leftDelta = landmarks.left_foot_index.y - landmarks.left_heel.y;
    leftHeelUp = leftDelta > THRESHOLD;
  }

  if (rightFootVisible) {
    const rightDelta = landmarks.right_foot_index.y - landmarks.right_heel.y;
    rightHeelUp = rightDelta > THRESHOLD;
  }

  // Metodo secondario: confronto tallone vs caviglia
  // Se il tallone è significativamente più alto della caviglia, è alzato
  // Questo è più robusto perché la caviglia ha maggiore visibilità
  const ANKLE_THRESHOLD = 0.02;

  if (leftFootVisible && landmarks.left_ankle.visibility > MIN_VISIBILITY) {
    const heelAboveAnkle = landmarks.left_ankle.y - landmarks.left_heel.y;
    // Il tallone dovrebbe essere SOTTO la caviglia (heel.y > ankle.y)
    // Se heel.y < ankle.y di molto, il tallone è alzato
    if (heelAboveAnkle > ANKLE_THRESHOLD) {
      leftHeelUp = true;
    }
  }

  if (rightFootVisible && landmarks.right_ankle.visibility > MIN_VISIBILITY) {
    const heelAboveAnkle = landmarks.right_ankle.y - landmarks.right_heel.y;
    if (heelAboveAnkle > ANKLE_THRESHOLD) {
      rightHeelUp = true;
    }
  }

  // Entrambi i talloni devono essere giù
  return !leftHeelUp && !rightHeelUp;
}

// ============================================
// ANALISI VISTA LATERO-POSTERIORE (45°)
// Controlli specifici per errori visibili solo
// dalla vista a 45° posteriore-laterale
// ============================================

/**
 * Risultato dell'analisi di asimmetria bilaterale
 */
export interface BilateralAsymmetryResult {
  hasAsymmetry: boolean;
  asymmetryType?: 'DEPTH' | 'KNEE_ANGLE' | 'HIP_ANGLE' | 'TORSO_ROTATION' | 'WEIGHT_SHIFT';
  weakerSide?: 'LEFT' | 'RIGHT';
  delta: number;  // Differenza percentuale o in gradi
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
}

/**
 * Rileva asimmetria nella profondità del movimento (un lato scende più dell'altro)
 * Visibile dalla vista 45° latero-posteriore
 */
export function detectDepthAsymmetry(landmarks: PoseLandmarks): BilateralAsymmetryResult {
  // Confronta la posizione Y delle anche
  const leftHipY = landmarks.left_hip.y;
  const rightHipY = landmarks.right_hip.y;

  // Confronta la posizione Y delle ginocchia
  const leftKneeY = landmarks.left_knee.y;
  const rightKneeY = landmarks.right_knee.y;

  // Delta nelle anche (normalizzato)
  const hipDelta = Math.abs(leftHipY - rightHipY);

  // Delta nelle ginocchia
  const kneeDelta = Math.abs(leftKneeY - rightKneeY);

  // Combinato: se un lato è significativamente più basso
  const totalDelta = (hipDelta + kneeDelta) / 2;

  // Soglie: > 0.02 = lieve, > 0.04 = medio, > 0.06 = severo
  if (totalDelta < 0.02) {
    return { hasAsymmetry: false, delta: totalDelta * 100, severity: 'LOW' };
  }

  const weakerSide = leftHipY > rightHipY ? 'LEFT' : 'RIGHT';
  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    totalDelta > 0.06 ? 'HIGH' : totalDelta > 0.04 ? 'MEDIUM' : 'LOW';

  return {
    hasAsymmetry: true,
    asymmetryType: 'DEPTH',
    weakerSide,
    delta: totalDelta * 100,
    severity,
    description: `Lato ${weakerSide === 'LEFT' ? 'sinistro' : 'destro'} scende meno in profondità`
  };
}

/**
 * Rileva asimmetria negli angoli del ginocchio (valgismo/varismo asimmetrico)
 * Fondamentale dalla vista 45° per vedere entrambe le ginocchia
 */
export function detectKneeAsymmetry(landmarks: PoseLandmarks): BilateralAsymmetryResult {
  const leftKneeAngle = calculateAngle(
    landmarks.left_hip,
    landmarks.left_knee,
    landmarks.left_ankle
  );

  const rightKneeAngle = calculateAngle(
    landmarks.right_hip,
    landmarks.right_knee,
    landmarks.right_ankle
  );

  const angleDelta = Math.abs(leftKneeAngle - rightKneeAngle);

  // Soglie: > 5° = lieve, > 10° = medio, > 15° = severo
  if (angleDelta < 5) {
    return { hasAsymmetry: false, delta: angleDelta, severity: 'LOW' };
  }

  // Il lato con angolo maggiore è più "esteso" quindi potenzialmente più debole
  const weakerSide = leftKneeAngle > rightKneeAngle ? 'LEFT' : 'RIGHT';
  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    angleDelta > 15 ? 'HIGH' : angleDelta > 10 ? 'MEDIUM' : 'LOW';

  return {
    hasAsymmetry: true,
    asymmetryType: 'KNEE_ANGLE',
    weakerSide,
    delta: angleDelta,
    severity,
    description: `Ginocchio ${weakerSide === 'LEFT' ? 'sinistro' : 'destro'} con ${angleDelta.toFixed(1)}° di differenza`
  };
}

/**
 * Rileva rotazione del tronco durante il movimento
 * Solo visibile dalla vista 45° (le spalle ruotano rispetto alle anche)
 */
export function detectTorsoRotation(landmarks: PoseLandmarks): BilateralAsymmetryResult {
  // Calcola l'angolo delle spalle rispetto all'orizzontale
  const shoulderAngle = Math.atan2(
    landmarks.right_shoulder.y - landmarks.left_shoulder.y,
    landmarks.right_shoulder.x - landmarks.left_shoulder.x
  );

  // Calcola l'angolo delle anche rispetto all'orizzontale
  const hipAngle = Math.atan2(
    landmarks.right_hip.y - landmarks.left_hip.y,
    landmarks.right_hip.x - landmarks.left_hip.x
  );

  // La differenza indica rotazione del tronco
  const rotationDelta = toDegrees(Math.abs(shoulderAngle - hipAngle));

  // Soglie: > 5° = lieve, > 10° = medio, > 15° = severo
  if (rotationDelta < 5) {
    return { hasAsymmetry: false, delta: rotationDelta, severity: 'LOW' };
  }

  // Determina la direzione della rotazione
  const rotatingToward = shoulderAngle > hipAngle ? 'LEFT' : 'RIGHT';
  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    rotationDelta > 15 ? 'HIGH' : rotationDelta > 10 ? 'MEDIUM' : 'LOW';

  return {
    hasAsymmetry: true,
    asymmetryType: 'TORSO_ROTATION',
    weakerSide: rotatingToward,
    delta: rotationDelta,
    severity,
    description: `Tronco ruota di ${rotationDelta.toFixed(1)}° verso ${rotatingToward === 'LEFT' ? 'sinistra' : 'destra'}`
  };
}

/**
 * Rileva shift laterale del peso (centro di massa spostato su un lato)
 * Cruciale dalla vista 45° per vedere lo sbilanciamento
 */
export function detectLateralWeightShift(landmarks: PoseLandmarks): BilateralAsymmetryResult {
  // Calcola il centro di massa approssimato (baricentro tra spalle e anche)
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const centerOfMass = midpoint(shoulderMid, hipMid);

  // Calcola il punto medio tra le caviglie (base di appoggio)
  const ankleMid = midpoint(landmarks.left_ankle, landmarks.right_ankle);

  // Lo shift laterale è la differenza X tra centro di massa e base
  const lateralShift = centerOfMass.x - ankleMid.x;

  // Normalizza rispetto alla larghezza delle anche
  const hipWidth = distance2D(landmarks.left_hip, landmarks.right_hip);
  const normalizedShift = Math.abs(lateralShift) / hipWidth;

  // Soglie: > 0.1 = lieve, > 0.2 = medio, > 0.3 = severo
  if (normalizedShift < 0.1) {
    return { hasAsymmetry: false, delta: normalizedShift * 100, severity: 'LOW' };
  }

  const shiftDirection = lateralShift > 0 ? 'RIGHT' : 'LEFT';
  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    normalizedShift > 0.3 ? 'HIGH' : normalizedShift > 0.2 ? 'MEDIUM' : 'LOW';

  return {
    hasAsymmetry: true,
    asymmetryType: 'WEIGHT_SHIFT',
    weakerSide: shiftDirection === 'LEFT' ? 'RIGHT' : 'LEFT', // Il lato opposto allo shift è il più debole
    delta: normalizedShift * 100,
    severity,
    description: `Peso spostato verso ${shiftDirection === 'LEFT' ? 'sinistra' : 'destra'} del ${(normalizedShift * 100).toFixed(1)}%`
  };
}

/**
 * Rileva problemi di posizione delle scapole/upper back
 * Visibile dalla vista 45° posteriore
 */
export interface ScapularPositionResult {
  isOptimal: boolean;
  issue?: 'PROTRACTED' | 'ELEVATED' | 'ASYMMETRIC' | 'WINGING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
  correction?: string;
}

export function detectScapularPosition(landmarks: PoseLandmarks): ScapularPositionResult {
  // Distanza tra le spalle (indica protrazione/retrazione)
  const shoulderWidth = distance2D(landmarks.left_shoulder, landmarks.right_shoulder);

  // Distanza tra le anche per normalizzare
  const hipWidth = distance2D(landmarks.left_hip, landmarks.right_hip);

  // Rapporto spalle/anche (normalmente ~1.2-1.4)
  const shoulderToHipRatio = shoulderWidth / hipWidth;

  // Elevazione delle spalle (differenza Y rispetto alle orecchie)
  const leftElevation = landmarks.left_ear.y - landmarks.left_shoulder.y;
  const rightElevation = landmarks.right_ear.y - landmarks.right_shoulder.y;
  const avgElevation = (leftElevation + rightElevation) / 2;
  const elevationAsymmetry = Math.abs(leftElevation - rightElevation);

  // Controlla protrazione (spalle troppo strette/in avanti)
  if (shoulderToHipRatio < 1.1) {
    return {
      isOptimal: false,
      issue: 'PROTRACTED',
      severity: shoulderToHipRatio < 1.0 ? 'HIGH' : 'MEDIUM',
      description: 'Scapole protratte - spalle in avanti',
      correction: 'Retrarre le scapole, "petto fuori". Lavoro su romboidi e trapezio medio.'
    };
  }

  // Controlla elevazione eccessiva (spalle alle orecchie)
  if (avgElevation < 0.08) {  // Spalle troppo vicine alle orecchie
    return {
      isOptimal: false,
      issue: 'ELEVATED',
      severity: avgElevation < 0.05 ? 'HIGH' : 'MEDIUM',
      description: 'Spalle elevate - tensione nel trapezio superiore',
      correction: 'Abbassa le spalle, "spalle lontane dalle orecchie". Rilassa il trapezio superiore.'
    };
  }

  // Controlla asimmetria nell'elevazione
  if (elevationAsymmetry > 0.03) {
    return {
      isOptimal: false,
      issue: 'ASYMMETRIC',
      severity: elevationAsymmetry > 0.05 ? 'HIGH' : 'MEDIUM',
      description: `Spalla ${leftElevation < rightElevation ? 'sinistra' : 'destra'} più elevata`,
      correction: 'Possibile squilibrio muscolare. Valutare mobilità e forza unilaterale.'
    };
  }

  return {
    isOptimal: true,
    severity: 'LOW'
  };
}

/**
 * Analisi completa delle asimmetrie dalla vista 45°
 */
export interface FullAsymmetryAnalysis {
  depth: BilateralAsymmetryResult;
  knee: BilateralAsymmetryResult;
  torsoRotation: BilateralAsymmetryResult;
  weightShift: BilateralAsymmetryResult;
  scapular: ScapularPositionResult;
  overallAsymmetryScore: number; // 0-10, dove 10 = perfetta simmetria
  primaryIssues: string[];
  recommendations: string[];
}

export function analyzeFullAsymmetry(landmarks: PoseLandmarks): FullAsymmetryAnalysis {
  const depth = detectDepthAsymmetry(landmarks);
  const knee = detectKneeAsymmetry(landmarks);
  const torsoRotation = detectTorsoRotation(landmarks);
  const weightShift = detectLateralWeightShift(landmarks);
  const scapular = detectScapularPosition(landmarks);

  // Calcola score complessivo
  let score = 10;
  const primaryIssues: string[] = [];
  const recommendations: string[] = [];

  // Penalità per asimmetrie
  if (depth.hasAsymmetry) {
    score -= depth.severity === 'HIGH' ? 2 : depth.severity === 'MEDIUM' ? 1 : 0.5;
    if (depth.description) primaryIssues.push(depth.description);
    recommendations.push('Lavoro unilaterale: Bulgarian split squat, single leg press');
  }

  if (knee.hasAsymmetry) {
    score -= knee.severity === 'HIGH' ? 1.5 : knee.severity === 'MEDIUM' ? 1 : 0.5;
    if (knee.description) primaryIssues.push(knee.description);
    recommendations.push('Rinforzo glutei unilaterale: clamshell, single leg glute bridge');
  }

  if (torsoRotation.hasAsymmetry) {
    score -= torsoRotation.severity === 'HIGH' ? 1.5 : torsoRotation.severity === 'MEDIUM' ? 1 : 0.5;
    if (torsoRotation.description) primaryIssues.push(torsoRotation.description);
    recommendations.push('Core anti-rotazione: Pallof press, plank con reach');
  }

  if (weightShift.hasAsymmetry) {
    score -= weightShift.severity === 'HIGH' ? 2 : weightShift.severity === 'MEDIUM' ? 1.5 : 0.5;
    if (weightShift.description) primaryIssues.push(weightShift.description);
    recommendations.push('Consapevolezza distribuzione peso: esercizi a specchio, feedback tattile');
  }

  if (!scapular.isOptimal) {
    score -= scapular.severity === 'HIGH' ? 1 : scapular.severity === 'MEDIUM' ? 0.5 : 0.25;
    if (scapular.description) primaryIssues.push(scapular.description);
    if (scapular.correction) recommendations.push(scapular.correction);
  }

  return {
    depth,
    knee,
    torsoRotation,
    weightShift,
    scapular,
    overallAsymmetryScore: Math.max(0, Math.min(10, score)),
    primaryIssues,
    recommendations: [...new Set(recommendations)]
  };
}
