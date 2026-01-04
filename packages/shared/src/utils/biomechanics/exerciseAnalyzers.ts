/**
 * MEDIAPIPE EXERCISE ANALYZERS - Evidence-Based
 *
 * Sistema di analisi biomeccanica client-side per form check in tempo reale.
 * Utilizza MediaPipe Pose per rilevare i landmark corporei e applicare
 * analisi basate su letteratura scientifica.
 *
 * Riferimenti chiave:
 * - Fry AC et al. (2003) - Knee past toe myth debunked
 * - Kompf & Arandjelović (2017) - Squat depth and muscle activation
 * - Schoenfeld BJ (2010) - Full ROM for hypertrophy
 * - McGill SM (2007, 2015) - Spine mechanics
 * - Lorenzetti S et al. (2018) - Torso lean and femur length
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnalysisContext {
  goal: 'strength' | 'hypertrophy' | 'powerlifting' | 'rehab' | 'general';
  morphotype?: UserMorphotype;
  painAreas?: string[];
  injuryHistory?: string[];
  equipment?: 'barbell' | 'dumbbell' | 'machine' | 'bodyweight';
}

export interface UserMorphotype {
  femurToTibia?: 'short' | 'average' | 'long';
  torsoToFemur?: 'short' | 'average' | 'long';
  armToTorso?: 'short' | 'average' | 'long';
  humerusToForearm?: 'short' | 'average' | 'long';
  ankleDorsiflexion?: 'limited' | 'normal' | 'hypermobile';
  hipFlexion?: 'limited' | 'normal' | 'hypermobile';
  shoulderFlexion?: 'limited' | 'normal' | 'hypermobile';
  thoracicExtension?: 'limited' | 'normal' | 'hypermobile';
}

export interface FormCheck {
  id: string;
  phase: string | 'ALL';
  type: 'safety' | 'efficiency' | 'optimization';
  severity: 'high' | 'medium' | 'low';
  check: (angles: Record<string, number>, prevAngles?: Record<string, number>, context?: AnalysisContext) => boolean;
  issue: string;
  issueIt: string;
  rationale: string;
  rationaleIt: string;
  correction: string;
  correctionIt: string;
  reference?: string;
  exceptions?: string;
}

export interface ROMRange {
  angle: string;
  phase: string;
  acceptable: { min: number; max: number };
  optimal: { min: number; max: number };
  context: string;
}

export interface AnalysisResult {
  phase: string;
  angles: Record<string, number>;
  issues: Array<{
    id: string;
    type: 'safety' | 'efficiency' | 'optimization';
    severity: 'high' | 'medium' | 'low';
    issue: string;
    issueIt: string;
    rationale: string;
    rationaleIt: string;
    correction: string;
    correctionIt: string;
    reference?: string;
  }>;
  cue?: { cue: string; cueIt: string };
  morphotypeNotes?: string[];
  romStatus?: Record<string, 'below' | 'acceptable' | 'optimal' | 'above'>;
}

export interface ExerciseAnalyzer {
  name: string;
  nameIt: string;
  phases: string[];
  formChecks: FormCheck[];
  romRanges: ROMRange[];
  cues: Array<{ phase: string; cue: string; cueIt: string }>;
  analyze: (angles: Record<string, number>, prevAngles?: Record<string, number>, context?: AnalysisContext) => AnalysisResult;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get acceptable knee travel range based on morphotype
 * Reference: Fry AC et al. (2003), Lorenzetti S et al. (2018)
 */
export function getAcceptableKneeTravelRange(morphotype?: UserMorphotype): { min: number; max: number } {
  if (!morphotype) return { min: -2, max: 10 };

  switch (morphotype.femurToTibia) {
    case 'long':
      return { min: 5, max: 15 };   // DEVE avanzare il ginocchio
    case 'short':
      return { min: -5, max: 8 };   // Può restare indietro
    default:
      return { min: 0, max: 12 };
  }
}

/**
 * Get acceptable torso lean range based on morphotype and goal
 * Reference: Lorenzetti S et al. (2018)
 */
export function getAcceptableTorsoLeanRange(
  morphotype?: UserMorphotype,
  goal?: string
): { min: number; max: number } {
  let base = { min: 25, max: 55 };

  // Femori lunghi RICHIEDONO più lean
  if (morphotype?.femurToTibia === 'long') {
    base.max = 65;
  }

  // Powerlifting (low bar) richiede più lean
  if (goal === 'powerlifting') {
    base = { min: 35, max: 70 };
  }

  // Rehab: più conservativo
  if (goal === 'rehab') {
    base.max = 50;
  }

  return base;
}

/**
 * Get acceptable shoulder abduction range
 * Reference: Green CM & Comfort P (2007)
 */
export function getAcceptableShoulderAbductionRange(context?: AnalysisContext): { min: number; max: number } {
  if (context?.goal === 'powerlifting') {
    return { min: 30, max: 75 };  // More tucked for powerlifting
  }
  if (context?.goal === 'hypertrophy') {
    return { min: 45, max: 85 };  // Slightly more abduction for chest activation
  }
  return { min: 35, max: 80 };    // Default safe range
}

/**
 * Check ROM status against range
 */
function getROMStatus(value: number, range: ROMRange): 'below' | 'acceptable' | 'optimal' | 'above' {
  if (value < range.acceptable.min) return 'below';
  if (value > range.acceptable.max) return 'above';
  if (value >= range.optimal.min && value <= range.optimal.max) return 'optimal';
  return 'acceptable';
}

/**
 * Determine squat phase from knee angle
 */
function getSquatPhase(kneeAngle: number): string {
  if (kneeAngle > 160) return 'STANDING';
  if (kneeAngle > 120) return 'DESCENT';
  if (kneeAngle <= 120) return 'BOTTOM';
  return 'ASCENT';
}

// ============================================================================
// SQUAT ANALYZER
// ============================================================================

export const SQUAT_ANALYZER: ExerciseAnalyzer = {
  name: 'Squat',
  nameIt: 'Squat',
  phases: ['STANDING', 'DESCENT', 'BOTTOM', 'ASCENT'],

  romRanges: [
    {
      angle: 'left_knee',
      phase: 'BOTTOM',
      acceptable: { min: 70, max: 120 },
      optimal: { min: 80, max: 100 },
      context: 'Hip crease at or below knee = ~80-100° knee angle'
    },
    {
      angle: 'right_knee',
      phase: 'BOTTOM',
      acceptable: { min: 70, max: 120 },
      optimal: { min: 80, max: 100 },
      context: 'Hip crease at or below knee = ~80-100° knee angle'
    },
    {
      angle: 'torso_lean',
      phase: 'BOTTOM',
      acceptable: { min: 25, max: 65 },
      optimal: { min: 35, max: 55 },
      context: 'Varies by femur:torso ratio and bar position'
    }
  ],

  formChecks: [
    // SAFETY CHECKS
    {
      id: 'LUMBAR_FLEXION_EXCESSIVE',
      phase: 'BOTTOM',
      type: 'safety',
      severity: 'high',
      check: (angles, _, context) => {
        const maxLean = context?.goal === 'powerlifting' ? 80 : 70;
        return (angles.torso_lean || 0) > maxLean;
      },
      issue: 'Excessive lumbar flexion (butt wink)',
      issueIt: 'Flessione lombare eccessiva (butt wink)',
      rationale: 'Spinal flexion under load increases disc injury risk. May indicate hip mobility limitation.',
      rationaleIt: 'La flessione spinale sotto carico aumenta il rischio di lesioni discali. Può indicare mobilità anca limitata.',
      correction: 'Stop descent when pelvis starts to tuck. Work on hip mobility.',
      correctionIt: 'Ferma la discesa quando il bacino inizia a ruotare. Lavora sulla mobilità delle anche.',
      reference: 'McGill SM (2015) - Low Back Disorders'
    },
    {
      id: 'KNEE_VALGUS_DYNAMIC',
      phase: 'ASCENT',
      type: 'safety',
      severity: 'high',
      check: (angles) => {
        const leftKnee = angles.left_knee_valgus || 0;
        const rightKnee = angles.right_knee_valgus || 0;
        return Math.abs(leftKnee - rightKnee) > 25;
      },
      issue: 'Dynamic knee valgus during ascent',
      issueIt: 'Valgo dinamico del ginocchio durante la salita',
      rationale: 'Increases ACL and meniscus injury risk. Often indicates hip abductor weakness.',
      rationaleIt: 'Aumenta rischio lesione LCA e menisco. Spesso indica debolezza abduttori anca.',
      correction: 'Push knees out, cue "spread the floor". Strengthen glutes.',
      correctionIt: 'Spingi le ginocchia fuori, "allarga il pavimento". Rinforza i glutei.',
      reference: 'Hewett TE et al. (2005) - ACL injury mechanisms'
    },

    // EFFICIENCY CHECKS
    {
      id: 'TORSO_LEAN_MISMATCH',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'medium',
      check: (angles, _, context) => {
        const range = getAcceptableTorsoLeanRange(context?.morphotype, context?.goal);
        const torsoLean = angles.torso_lean || 0;
        return torsoLean < range.min || torsoLean > range.max;
      },
      issue: 'Torso lean outside optimal range for your build',
      issueIt: 'Inclinazione busto fuori range ottimale per la tua struttura',
      rationale: 'Torso angle should match femur length. Long femurs require more forward lean.',
      rationaleIt: 'Angolo busto deve corrispondere a lunghezza femore. Femori lunghi richiedono più inclinazione.',
      correction: 'This may be correct for you. Consider heel elevation if mobility limited.',
      correctionIt: 'Potrebbe essere corretto per te. Considera rialzo talloni se mobilità limitata.',
      reference: 'Lorenzetti S et al. (2018)',
      exceptions: 'Long femurs naturally require more lean - this is NOT an error'
    },
    {
      id: 'DEPTH_INSUFFICIENT_HYPERTROPHY',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'medium',
      check: (angles, _, context) => {
        if (context?.goal !== 'hypertrophy') return false;
        return (angles.left_knee || 180) > 105 && (angles.right_knee || 180) > 105;
      },
      issue: 'Insufficient depth for hypertrophy goals',
      issueIt: 'Profondità insufficiente per obiettivi di ipertrofia',
      rationale: 'Full ROM squats produce greater quad and glute hypertrophy.',
      rationaleIt: 'Squat a ROM completo produce maggiore ipertrofia di quadricipiti e glutei.',
      correction: 'Aim for hip crease below knee. Work on mobility if limited.',
      correctionIt: 'Mira a portare la piega dell\'anca sotto il ginocchio. Lavora sulla mobilità se limitata.',
      reference: 'Schoenfeld BJ (2010) - Full ROM for hypertrophy'
    },

    // OPTIMIZATION CHECKS
    {
      id: 'DESCENT_SPEED',
      phase: 'DESCENT',
      type: 'optimization',
      severity: 'low',
      check: (angles, prevAngles) => {
        if (!prevAngles) return false;
        const kneeChange = Math.abs((angles.left_knee || 0) - (prevAngles.left_knee || 0));
        return kneeChange > 30; // Too fast if >30° per frame
      },
      issue: 'Descent may be too fast',
      issueIt: 'Discesa potrebbe essere troppo veloce',
      rationale: 'Controlled eccentric improves muscle activation and control.',
      rationaleIt: 'Eccentrica controllata migliora attivazione muscolare e controllo.',
      correction: 'Slow down the descent. Aim for 2-3 seconds.',
      correctionIt: 'Rallenta la discesa. Punta a 2-3 secondi.',
      reference: 'Standard coaching practice'
    },
    {
      id: 'ASYMMETRIC_DEPTH',
      phase: 'BOTTOM',
      type: 'optimization',
      severity: 'low',
      check: (angles) => {
        const diff = Math.abs((angles.left_knee || 0) - (angles.right_knee || 0));
        return diff > 10 && diff <= 25;
      },
      issue: 'Slight depth asymmetry detected',
      issueIt: 'Leggera asimmetria nella profondità rilevata',
      rationale: 'Some asymmetry is normal. Only concerning if >25° or progressing.',
      rationaleIt: 'Un po\' di asimmetria è normale. Preoccupante solo se >25° o in peggioramento.',
      correction: 'Monitor for progression. Consider unilateral work.',
      correctionIt: 'Monitora il progresso. Considera lavoro unilaterale.',
      reference: 'Clinical observation'
    }
  ],

  cues: [
    { phase: 'DESCENT', cue: 'Sit back into the squat', cueIt: 'Siediti indietro nello squat' },
    { phase: 'BOTTOM', cue: 'Drive through the whole foot', cueIt: 'Spingi attraverso tutto il piede' },
    { phase: 'ASCENT', cue: 'Push the floor away', cueIt: 'Spingi via il pavimento' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = getSquatPhase(angles.left_knee || 180);
    const issues: AnalysisResult['issues'] = [];
    const morphotypeNotes: string[] = [];

    // Run form checks
    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    // Add morphotype-specific notes
    if (context?.morphotype?.femurToTibia === 'long') {
      morphotypeNotes.push('Femori lunghi: più avanzamento ginocchio e inclinazione busto sono NORMALI per te');
    }
    if (context?.morphotype?.ankleDorsiflexion === 'limited') {
      morphotypeNotes.push('Mobilità caviglia limitata: considera rialzo talloni o stance più largo');
    }

    // Get ROM status
    const romStatus: Record<string, 'below' | 'acceptable' | 'optimal' | 'above'> = {};
    for (const range of this.romRanges) {
      if (range.phase === phase && angles[range.angle] !== undefined) {
        romStatus[range.angle] = getROMStatus(angles[range.angle], range);
      }
    }

    // Get appropriate cue
    const cue = this.cues.find(c => c.phase === phase);

    return {
      phase,
      angles,
      issues,
      cue,
      morphotypeNotes: morphotypeNotes.length > 0 ? morphotypeNotes : undefined,
      romStatus: Object.keys(romStatus).length > 0 ? romStatus : undefined
    };
  }
};

// ============================================================================
// BENCH PRESS ANALYZER
// ============================================================================

export const BENCH_PRESS_ANALYZER: ExerciseAnalyzer = {
  name: 'Bench Press',
  nameIt: 'Panca Piana',
  phases: ['START', 'DESCENT', 'BOTTOM', 'PRESS'],

  romRanges: [
    {
      angle: 'left_elbow',
      phase: 'BOTTOM',
      acceptable: { min: 70, max: 110 },
      optimal: { min: 80, max: 100 },
      context: 'Full ROM requires elbows at or below shoulder level'
    },
    {
      angle: 'shoulder_abduction',
      phase: 'ALL',
      acceptable: { min: 35, max: 85 },
      optimal: { min: 45, max: 75 },
      context: 'Excessive abduction increases shoulder stress'
    }
  ],

  formChecks: [
    // SAFETY
    {
      id: 'SHOULDER_EXCESSIVE_ABDUCTION',
      phase: 'ALL',
      type: 'safety',
      severity: 'high',
      check: (angles, _, context) => {
        const range = getAcceptableShoulderAbductionRange(context);
        return (angles.shoulder_abduction || 0) > range.max;
      },
      issue: 'Shoulders flared too wide',
      issueIt: 'Spalle troppo aperte',
      rationale: 'Increases impingement and rotator cuff injury risk.',
      rationaleIt: 'Aumenta rischio impingement e lesione cuffia rotatori.',
      correction: 'Tuck elbows to 45-75°. Cue "bend the bar".',
      correctionIt: 'Chiudi i gomiti a 45-75°. Cue "piega la barra".',
      reference: 'Green CM & Comfort P (2007)'
    },

    // EFFICIENCY
    {
      id: 'RANGE_OF_MOTION_BENCH',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'medium',
      check: (angles, _, context) => {
        if (context?.goal !== 'hypertrophy') return false;
        return (angles.left_elbow || 0) > 105;
      },
      issue: 'Partial range of motion',
      issueIt: 'Range di movimento parziale',
      rationale: 'Full ROM is superior for hypertrophy.',
      rationaleIt: 'ROM completo è superiore per ipertrofia.',
      correction: 'Touch chest (or close to it) unless injury prevents.',
      correctionIt: 'Tocca il petto (o avvicinati) se non ci sono infortuni.',
      reference: 'Schoenfeld & Grgic (2020)'
    },
    {
      id: 'ARM_ASYMMETRY_BENCH',
      phase: 'ALL',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        const diff = Math.abs((angles.left_elbow || 0) - (angles.right_elbow || 0));
        return diff > 15;
      },
      issue: 'Arm asymmetry detected',
      issueIt: 'Asimmetria braccia rilevata',
      rationale: 'May indicate strength imbalance or mobility limitation.',
      rationaleIt: 'Può indicare squilibrio di forza o limitazione mobilità.',
      correction: 'Add unilateral dumbbell work. Check for tightness.',
      correctionIt: 'Aggiungi lavoro unilaterale con manubri. Controlla rigidità.',
      reference: 'Clinical observation'
    }
  ],

  cues: [
    { phase: 'START', cue: 'Retract and depress scapulae', cueIt: 'Retrarre e deprimere le scapole' },
    { phase: 'DESCENT', cue: 'Control the bar down', cueIt: 'Controlla la barra in discesa' },
    { phase: 'BOTTOM', cue: 'Drive feet into floor', cueIt: 'Spingi i piedi nel pavimento' },
    { phase: 'PRESS', cue: 'Press up and slightly back', cueIt: 'Spingi su e leggermente indietro' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = angles.left_elbow > 150 ? 'START' :
                  angles.left_elbow > 110 ? 'DESCENT' :
                  angles.left_elbow < 100 ? 'BOTTOM' : 'PRESS';

    const issues: AnalysisResult['issues'] = [];
    const morphotypeNotes: string[] = [];

    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    if (context?.morphotype?.armToTorso === 'long') {
      morphotypeNotes.push('Braccia lunghe: ROM più lungo = più lavoro. Grip più largo può aiutare.');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, issues, cue, morphotypeNotes: morphotypeNotes.length > 0 ? morphotypeNotes : undefined };
  }
};

// ============================================================================
// DEADLIFT ANALYZER
// ============================================================================

export const DEADLIFT_ANALYZER: ExerciseAnalyzer = {
  name: 'Deadlift',
  nameIt: 'Stacco da Terra',
  phases: ['SETUP', 'LIFT', 'LOCKOUT', 'DESCENT'],

  romRanges: [
    {
      angle: 'hip_angle',
      phase: 'SETUP',
      acceptable: { min: 55, max: 95 },
      optimal: { min: 65, max: 85 },
      context: 'Hip height varies by body proportions'
    },
    {
      angle: 'torso_lean',
      phase: 'SETUP',
      acceptable: { min: 30, max: 60 },
      optimal: { min: 35, max: 50 },
      context: 'More upright with long arms, more lean with short arms'
    }
  ],

  formChecks: [
    // SAFETY
    {
      id: 'LUMBAR_ROUNDING',
      phase: 'ALL',
      type: 'safety',
      severity: 'high',
      check: (angles, _, context) => {
        const maxLean = context?.goal === 'powerlifting' ? 35 : 25;
        return (angles.lumbar_flexion || 0) > maxLean;
      },
      issue: 'Lumbar spine rounding',
      issueIt: 'Arrotondamento colonna lombare',
      rationale: 'Increases disc injury risk, especially under heavy load.',
      rationaleIt: 'Aumenta rischio lesione discale, specialmente sotto carico pesante.',
      correction: 'Set back flat before lifting. Engage lats. Lower weight if needed.',
      correctionIt: 'Prepara la schiena dritta prima di sollevare. Attiva i dorsali. Riduci peso se necessario.',
      reference: 'McGill SM (2007) - Spine mechanics'
    },
    {
      id: 'HIPS_RISE_FIRST',
      phase: 'LIFT',
      type: 'safety',
      severity: 'high',
      check: (angles, prevAngles) => {
        if (!prevAngles) return false;
        const hipExtension = (angles.hip_angle || 0) - (prevAngles.hip_angle || 0);
        const kneeExtension = (angles.left_knee || 0) - (prevAngles.left_knee || 0);
        return hipExtension > 15 && kneeExtension < 5;
      },
      issue: 'Hips rising faster than shoulders',
      issueIt: 'Anche si alzano più velocemente delle spalle',
      rationale: 'Puts excessive stress on lower back. Usually means weight too heavy or poor setup.',
      rationaleIt: 'Mette stress eccessivo sulla bassa schiena. Di solito significa peso troppo pesante o setup scarso.',
      correction: 'Push through the floor, keep chest up. Consider reducing weight.',
      correctionIt: 'Spingi attraverso il pavimento, mantieni petto alto. Considera ridurre il peso.',
      reference: 'Hales M (2010)'
    },

    // EFFICIENCY
    {
      id: 'SETUP_HIPS_TOO_LOW',
      phase: 'SETUP',
      type: 'efficiency',
      severity: 'medium',
      check: (angles, _, context) => {
        const minHip = context?.morphotype?.torsoToFemur === 'short' ? 55 : 65;
        return (angles.hip_angle || 90) < minHip;
      },
      issue: 'Hips too low in setup',
      issueIt: 'Anche troppo basse nel setup',
      rationale: 'Squatting the deadlift reduces efficiency and puts knees in way of bar.',
      rationaleIt: 'Fare squat nello stacco riduce efficienza e mette le ginocchia davanti alla barra.',
      correction: 'Raise hips until shins are more vertical. Shoulders over or slightly in front of bar.',
      correctionIt: 'Alza le anche fino a quando gli stinchi sono più verticali. Spalle sopra o leggermente davanti alla barra.',
      reference: 'Standard biomechanics'
    },
    {
      id: 'LOCKOUT_HYPEREXTENSION',
      phase: 'LOCKOUT',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        return (angles.hip_angle || 0) > 185;
      },
      issue: 'Excessive back hyperextension at lockout',
      issueIt: 'Iperestensione eccessiva della schiena al lockout',
      rationale: 'Unnecessary stress on spine. Stand tall is sufficient.',
      rationaleIt: 'Stress non necessario sulla colonna. Stare dritti è sufficiente.',
      correction: 'Squeeze glutes, stand tall. Don\'t lean back.',
      correctionIt: 'Stringi i glutei, stai dritto. Non inclinarti indietro.',
      reference: 'Safety concern'
    }
  ],

  cues: [
    { phase: 'SETUP', cue: 'Wedge into the bar, take slack out', cueIt: 'Incuneati nella barra, togli il gioco' },
    { phase: 'LIFT', cue: 'Push the floor away', cueIt: 'Spingi via il pavimento' },
    { phase: 'LOCKOUT', cue: 'Hips through, squeeze glutes', cueIt: 'Anche avanti, stringi i glutei' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = angles.hip_angle < 100 ? 'SETUP' :
                  angles.hip_angle < 160 ? 'LIFT' :
                  angles.hip_angle >= 170 ? 'LOCKOUT' : 'DESCENT';

    const issues: AnalysisResult['issues'] = [];
    const morphotypeNotes: string[] = [];

    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    if (context?.morphotype?.armToTorso === 'long') {
      morphotypeNotes.push('Braccia lunghe: busto più dritto naturalmente (vantaggio)');
    }
    if (context?.morphotype?.armToTorso === 'short') {
      morphotypeNotes.push('Braccia corte: considera sumo per ridurre ROM');
    }
    if (context?.morphotype?.femurToTibia === 'long') {
      morphotypeNotes.push('Femori lunghi: sumo tipicamente più adatto');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, issues, cue, morphotypeNotes: morphotypeNotes.length > 0 ? morphotypeNotes : undefined };
  }
};

// ============================================================================
// BARBELL ROW ANALYZER
// ============================================================================

export const BARBELL_ROW_ANALYZER: ExerciseAnalyzer = {
  name: 'Barbell Row',
  nameIt: 'Rematore con Bilanciere',
  phases: ['START', 'PULL', 'CONTRACTED', 'LOWER'],

  romRanges: [
    {
      angle: 'torso_lean',
      phase: 'ALL',
      acceptable: { min: 20, max: 70 },
      optimal: { min: 30, max: 60 },
      context: 'More horizontal = more lat. More upright = more trap/rhomboid'
    },
    {
      angle: 'elbow',
      phase: 'CONTRACTED',
      acceptable: { min: 60, max: 110 },
      optimal: { min: 70, max: 95 },
      context: 'Full contraction means elbows past torso'
    }
  ],

  formChecks: [
    // SAFETY
    {
      id: 'EXCESSIVE_BODY_ENGLISH',
      phase: 'PULL',
      type: 'safety',
      severity: 'high',
      check: (angles, prevAngles) => {
        if (!prevAngles) return false;
        const torsoChange = Math.abs((angles.torso_lean || 0) - (prevAngles.torso_lean || 0));
        return torsoChange > 20;
      },
      issue: 'Excessive body swing',
      issueIt: 'Oscillazione del corpo eccessiva',
      rationale: 'Using momentum puts spine at risk and reduces muscle activation.',
      rationaleIt: 'Usare lo slancio mette a rischio la colonna e riduce attivazione muscolare.',
      correction: 'Keep torso stable. If you need to swing, reduce weight.',
      correctionIt: 'Mantieni il torso stabile. Se devi oscillare, riduci il peso.',
      reference: 'McGill SM (2007)'
    },

    // EFFICIENCY
    {
      id: 'TORSO_TOO_UPRIGHT',
      phase: 'ALL',
      type: 'efficiency',
      severity: 'medium',
      check: (angles, _, context) => {
        if (context?.goal !== 'hypertrophy') return false;
        return (angles.torso_lean || 0) > 70;
      },
      issue: 'Torso too upright for lat activation',
      issueIt: 'Torso troppo dritto per attivazione dorsali',
      rationale: 'More upright shifts emphasis to traps. More horizontal = more lats.',
      rationaleIt: 'Più dritto sposta enfasi sui trapezi. Più orizzontale = più dorsali.',
      correction: 'Lean forward more (45-60°) if targeting lats.',
      correctionIt: 'Inclinati di più in avanti (45-60°) se miri ai dorsali.',
      reference: 'Fenwick CM et al. (2009)'
    },
    {
      id: 'INCOMPLETE_CONTRACTION',
      phase: 'CONTRACTED',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        return (angles.left_elbow || 180) > 110;
      },
      issue: 'Incomplete contraction',
      issueIt: 'Contrazione incompleta',
      rationale: 'Not pulling to full contraction limits muscle development.',
      rationaleIt: 'Non tirare a contrazione completa limita lo sviluppo muscolare.',
      correction: 'Pull until elbows pass torso. Touch bar to belly.',
      correctionIt: 'Tira finché i gomiti passano il torso. Tocca la barra alla pancia.',
      reference: 'Standard technique'
    }
  ],

  cues: [
    { phase: 'START', cue: 'Hinge at hips, chest up', cueIt: 'Cerniera alle anche, petto alto' },
    { phase: 'PULL', cue: 'Drive elbows back', cueIt: 'Porta i gomiti indietro' },
    { phase: 'CONTRACTED', cue: 'Squeeze shoulder blades', cueIt: 'Stringi le scapole' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = angles.left_elbow > 150 ? 'START' :
                  angles.left_elbow > 110 ? 'PULL' :
                  angles.left_elbow < 100 ? 'CONTRACTED' : 'LOWER';

    const issues: AnalysisResult['issues'] = [];

    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, issues, cue };
  }
};

// ============================================================================
// PULL-UP ANALYZER
// ============================================================================

export const PULLUP_ANALYZER: ExerciseAnalyzer = {
  name: 'Pull-up',
  nameIt: 'Trazioni',
  phases: ['HANGING', 'PULL', 'TOP', 'LOWER'],

  romRanges: [
    {
      angle: 'elbow',
      phase: 'HANGING',
      acceptable: { min: 160, max: 180 },
      optimal: { min: 165, max: 180 },
      context: 'Full extension at bottom'
    },
    {
      angle: 'elbow',
      phase: 'TOP',
      acceptable: { min: 50, max: 110 },
      optimal: { min: 60, max: 90 },
      context: 'Chin over bar'
    }
  ],

  formChecks: [
    // EFFICIENCY
    {
      id: 'PARTIAL_REP_TOP',
      phase: 'TOP',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        return (angles.left_elbow || 0) > 110;
      },
      issue: 'Partial rep - not reaching full contraction',
      issueIt: 'Ripetizione parziale - non raggiungi contrazione completa',
      rationale: 'Chin should clear the bar for full lat activation.',
      rationaleIt: 'Il mento dovrebbe superare la sbarra per attivazione dorsali completa.',
      correction: 'Pull chin over bar. Use assistance if needed.',
      correctionIt: 'Porta il mento sopra la sbarra. Usa assistenza se necessario.',
      reference: 'Standard technique'
    },
    {
      id: 'PARTIAL_REP_BOTTOM',
      phase: 'HANGING',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        return (angles.left_elbow || 0) < 165;
      },
      issue: 'Not achieving full extension at bottom',
      issueIt: 'Non raggiungi estensione completa in basso',
      rationale: 'Full stretch at bottom increases muscle activation.',
      rationaleIt: 'Stretch completo in basso aumenta attivazione muscolare.',
      correction: 'Fully extend arms at bottom of each rep.',
      correctionIt: 'Estendi completamente le braccia in fondo a ogni ripetizione.',
      reference: 'Schoenfeld & Grgic (2020)'
    },
    {
      id: 'ASYMMETRIC_PULL',
      phase: 'PULL',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        const diff = Math.abs((angles.left_elbow || 0) - (angles.right_elbow || 0));
        return diff > 20;
      },
      issue: 'Pulling asymmetrically',
      issueIt: 'Trazione asimmetrica',
      rationale: 'May indicate strength imbalance or mobility issue.',
      rationaleIt: 'Può indicare squilibrio di forza o problema di mobilità.',
      correction: 'Focus on pulling evenly. Add single-arm work.',
      correctionIt: 'Concentrati su tirare uniformemente. Aggiungi lavoro a un braccio.',
      reference: 'Clinical observation'
    },

    // OPTIMIZATION
    {
      id: 'EXCESSIVE_KIPPING',
      phase: 'PULL',
      type: 'optimization',
      severity: 'low',
      check: (angles, prevAngles) => {
        if (!prevAngles) return false;
        const shoulderChange = Math.abs((angles.shoulder_angle || 0) - (prevAngles.shoulder_angle || 0));
        return shoulderChange > 30;
      },
      issue: 'Significant kipping detected',
      issueIt: 'Kipping significativo rilevato',
      rationale: 'Strict pull-ups build more strength. Kipping is valid for CrossFit.',
      rationaleIt: 'Trazioni strette costruiscono più forza. Kipping è valido per CrossFit.',
      correction: 'Use strict form for strength building.',
      correctionIt: 'Usa forma stretta per costruire forza.',
      reference: 'Standard coaching',
      exceptions: 'Kipping is a legitimate technique in CrossFit'
    }
  ],

  cues: [
    { phase: 'HANGING', cue: 'Engage lats, shoulders down', cueIt: 'Attiva dorsali, spalle giù' },
    { phase: 'PULL', cue: 'Drive elbows down', cueIt: 'Porta i gomiti giù' },
    { phase: 'TOP', cue: 'Chin over bar, squeeze', cueIt: 'Mento sopra sbarra, stringi' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = angles.left_elbow > 160 ? 'HANGING' :
                  angles.left_elbow > 110 ? 'PULL' :
                  angles.left_elbow < 100 ? 'TOP' : 'LOWER';

    const issues: AnalysisResult['issues'] = [];

    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, issues, cue };
  }
};

// ============================================================================
// OVERHEAD PRESS ANALYZER
// ============================================================================

export const OVERHEAD_PRESS_ANALYZER: ExerciseAnalyzer = {
  name: 'Overhead Press',
  nameIt: 'Military Press',
  phases: ['RACK', 'PRESS', 'LOCKOUT', 'LOWER'],

  romRanges: [
    {
      angle: 'shoulder_flexion',
      phase: 'LOCKOUT',
      acceptable: { min: 160, max: 180 },
      optimal: { min: 170, max: 180 },
      context: 'Full overhead position'
    },
    {
      angle: 'torso_lean',
      phase: 'ALL',
      acceptable: { min: 0, max: 25 },
      optimal: { min: 0, max: 15 },
      context: 'Excessive lean puts stress on lower back'
    }
  ],

  formChecks: [
    // SAFETY
    {
      id: 'EXCESSIVE_BACK_LEAN',
      phase: 'ALL',
      type: 'safety',
      severity: 'high',
      check: (angles, _, context) => {
        const maxLean = context?.goal === 'strength' ? 25 : 15;
        return (angles.back_lean || 0) > maxLean;
      },
      issue: 'Excessive backward lean',
      issueIt: 'Inclinazione indietro eccessiva',
      rationale: 'Converts press into incline bench, increases lower back stress.',
      rationaleIt: 'Trasforma la pressa in panca inclinata, aumenta stress sulla bassa schiena.',
      correction: 'Squeeze glutes, keep ribs down. Consider seated press.',
      correctionIt: 'Stringi i glutei, mantieni costole basse. Considera pressa seduta.',
      reference: 'Saeterbakken AH & Fimland MS (2013)'
    },

    // EFFICIENCY
    {
      id: 'INCOMPLETE_LOCKOUT',
      phase: 'LOCKOUT',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        return (angles.shoulder_flexion || 0) < 170 || (angles.left_elbow || 0) < 165;
      },
      issue: 'Incomplete lockout',
      issueIt: 'Lockout incompleto',
      rationale: 'Full lockout increases stability and shoulder strength.',
      rationaleIt: 'Lockout completo aumenta stabilità e forza delle spalle.',
      correction: 'Push head through at top. Lock elbows.',
      correctionIt: 'Passa la testa attraverso in alto. Blocca i gomiti.',
      reference: 'Standard technique'
    },
    {
      id: 'ARM_ASYMMETRY_OHP',
      phase: 'LOCKOUT',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => {
        const diff = Math.abs((angles.left_elbow || 0) - (angles.right_elbow || 0));
        return diff > 15;
      },
      issue: 'Arm asymmetry at lockout',
      issueIt: 'Asimmetria braccia al lockout',
      rationale: 'May indicate strength imbalance or mobility limitation.',
      rationaleIt: 'Può indicare squilibrio di forza o limitazione mobilità.',
      correction: 'Add single-arm work. Check shoulder mobility.',
      correctionIt: 'Aggiungi lavoro a un braccio. Controlla mobilità spalle.',
      reference: 'Clinical observation'
    }
  ],

  cues: [
    { phase: 'RACK', cue: 'Big breath, brace core', cueIt: 'Grande respiro, stabilizza il core' },
    { phase: 'PRESS', cue: 'Drive bar up and slightly back', cueIt: 'Spingi la barra su e leggermente indietro' },
    { phase: 'LOCKOUT', cue: 'Push head through', cueIt: 'Passa la testa attraverso' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = angles.shoulder_flexion < 90 ? 'RACK' :
                  angles.shoulder_flexion < 150 ? 'PRESS' :
                  angles.shoulder_flexion >= 170 ? 'LOCKOUT' : 'LOWER';

    const issues: AnalysisResult['issues'] = [];
    const morphotypeNotes: string[] = [];

    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({
            id: check.id,
            type: check.type,
            severity: check.severity,
            issue: check.issue,
            issueIt: check.issueIt,
            rationale: check.rationale,
            rationaleIt: check.rationaleIt,
            correction: check.correction,
            correctionIt: check.correctionIt,
            reference: check.reference
          });
        }
      }
    }

    if (context?.morphotype?.shoulderFlexion === 'limited') {
      morphotypeNotes.push('Mobilità spalla limitata: lavora su estensione toracica e flessibilità dorsali');
    }
    if (context?.morphotype?.armToTorso === 'long') {
      morphotypeNotes.push('Braccia lunghe: bar path più lungo = più lavoro, serve più stabilità core');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, issues, cue, morphotypeNotes: morphotypeNotes.length > 0 ? morphotypeNotes : undefined };
  }
};

// ============================================================================
// ADDITIONAL ANALYZERS (11 more exercises)
// ============================================================================

// RDL ANALYZER
export const RDL_ANALYZER: ExerciseAnalyzer = {
  name: 'Romanian Deadlift',
  nameIt: 'Stacco Rumeno',
  phases: ['START', 'HINGE', 'BOTTOM', 'RETURN'],
  romRanges: [
    { angle: 'hip_angle', phase: 'BOTTOM', acceptable: { min: 60, max: 110 }, optimal: { min: 70, max: 95 }, context: 'Depends on hamstring flexibility' }
  ],
  formChecks: [
    {
      id: 'LUMBAR_ROUNDING_RDL',
      phase: 'ALL',
      type: 'safety',
      severity: 'high',
      check: (angles) => (angles.lumbar_flexion || 0) > 15,
      issue: 'Lower back rounding',
      issueIt: 'Arrotondamento bassa schiena',
      rationale: 'RDL should maintain neutral spine. Stop descent when back starts to round.',
      rationaleIt: 'Lo stacco rumeno dovrebbe mantenere colonna neutra. Ferma la discesa quando la schiena inizia ad arrotondarsi.',
      correction: 'Stop at hamstring stretch, not at floor.',
      correctionIt: 'Fermati allo stretch dei femorali, non al pavimento.',
      reference: 'McGill SM (2007)'
    },
    {
      id: 'KNEES_TOO_BENT_RDL',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => (angles.left_knee || 180) < 150,
      issue: 'Excessive knee bend - becoming a squat',
      issueIt: 'Piegamento ginocchio eccessivo - sta diventando uno squat',
      rationale: 'RDL targets hamstrings. Too much knee bend shifts load to quads.',
      rationaleIt: 'Lo stacco rumeno lavora i femorali. Troppo piegamento ginocchio sposta carico sui quadricipiti.',
      correction: 'Keep slight knee bend constant throughout movement.',
      correctionIt: 'Mantieni leggera flessione ginocchio costante durante tutto il movimento.',
      reference: 'Standard technique'
    }
  ],
  cues: [
    { phase: 'START', cue: 'Soft knees, chest up', cueIt: 'Ginocchia morbide, petto alto' },
    { phase: 'HINGE', cue: 'Push hips back', cueIt: 'Spingi le anche indietro' },
    { phase: 'BOTTOM', cue: 'Feel hamstring stretch', cueIt: 'Senti stretch femorali' }
  ],
  analyze(angles, prevAngles, context) {
    const phase = angles.hip_angle > 160 ? 'START' : angles.hip_angle < 100 ? 'BOTTOM' : 'HINGE';
    const issues: AnalysisResult['issues'] = [];
    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({ id: check.id, type: check.type, severity: check.severity, issue: check.issue, issueIt: check.issueIt, rationale: check.rationale, rationaleIt: check.rationaleIt, correction: check.correction, correctionIt: check.correctionIt, reference: check.reference });
        }
      }
    }
    const cue = this.cues.find(c => c.phase === phase);
    return { phase, angles, issues, cue };
  }
};

// LUNGE ANALYZER
export const LUNGE_ANALYZER: ExerciseAnalyzer = {
  name: 'Lunge',
  nameIt: 'Affondo',
  phases: ['START', 'DESCENT', 'BOTTOM', 'ASCENT'],
  romRanges: [
    { angle: 'front_knee', phase: 'BOTTOM', acceptable: { min: 70, max: 105 }, optimal: { min: 80, max: 95 }, context: '~90° at bottom is typical' }
  ],
  formChecks: [
    {
      id: 'FRONT_KNEE_COLLAPSE',
      phase: 'ALL',
      type: 'safety',
      severity: 'high',
      check: (angles) => (angles.front_knee_valgus || 0) > 20,
      issue: 'Front knee collapsing inward',
      issueIt: 'Ginocchio anteriore che crolla verso l\'interno',
      rationale: 'Increases knee injury risk. Usually indicates hip weakness.',
      rationaleIt: 'Aumenta rischio infortunio ginocchio. Di solito indica debolezza anche.',
      correction: 'Push knee out over toe. Strengthen glutes.',
      correctionIt: 'Spingi ginocchio fuori sopra la punta. Rinforza glutei.',
      reference: 'Hewett TE et al. (2005)'
    },
    {
      id: 'TORSO_FORWARD_LUNGE',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => (angles.torso_lean || 0) > 30,
      issue: 'Excessive forward lean',
      issueIt: 'Inclinazione in avanti eccessiva',
      rationale: 'Puts more stress on lower back. Keep torso upright.',
      rationaleIt: 'Mette più stress sulla bassa schiena. Mantieni torso dritto.',
      correction: 'Keep chest up, drop straight down.',
      correctionIt: 'Mantieni petto alto, scendi dritto.',
      reference: 'Standard technique'
    }
  ],
  cues: [
    { phase: 'DESCENT', cue: 'Drop straight down', cueIt: 'Scendi dritto' },
    { phase: 'BOTTOM', cue: 'Drive through front heel', cueIt: 'Spingi attraverso tallone anteriore' }
  ],
  analyze(angles, prevAngles, context) {
    const phase = angles.front_knee > 150 ? 'START' : angles.front_knee < 100 ? 'BOTTOM' : 'DESCENT';
    const issues: AnalysisResult['issues'] = [];
    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({ id: check.id, type: check.type, severity: check.severity, issue: check.issue, issueIt: check.issueIt, rationale: check.rationale, rationaleIt: check.rationaleIt, correction: check.correction, correctionIt: check.correctionIt, reference: check.reference });
        }
      }
    }
    const cue = this.cues.find(c => c.phase === phase);
    return { phase, angles, issues, cue };
  }
};

// HIP THRUST ANALYZER
export const HIP_THRUST_ANALYZER: ExerciseAnalyzer = {
  name: 'Hip Thrust',
  nameIt: 'Hip Thrust',
  phases: ['START', 'THRUST', 'TOP', 'LOWER'],
  romRanges: [
    { angle: 'hip_angle', phase: 'TOP', acceptable: { min: 170, max: 190 }, optimal: { min: 175, max: 185 }, context: 'Full hip extension at top' }
  ],
  formChecks: [
    {
      id: 'HYPEREXTENSION_HIP_THRUST',
      phase: 'TOP',
      type: 'safety',
      severity: 'medium',
      check: (angles) => (angles.hip_angle || 0) > 195,
      issue: 'Excessive lower back hyperextension',
      issueIt: 'Iperestensione eccessiva della bassa schiena',
      rationale: 'Overextension comes from spine, not hips. Reduces glute activation.',
      rationaleIt: 'L\'iperestensione viene dalla colonna, non dalle anche. Riduce attivazione glutei.',
      correction: 'Tuck chin, squeeze glutes, posterior pelvic tilt at top.',
      correctionIt: 'Tira il mento, stringi i glutei, retroversione del bacino in alto.',
      reference: 'Contreras B (2013)'
    },
    {
      id: 'INCOMPLETE_EXTENSION_HT',
      phase: 'TOP',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => (angles.hip_angle || 0) < 170,
      issue: 'Incomplete hip extension',
      issueIt: 'Estensione anca incompleta',
      rationale: 'Full extension maximizes glute contraction.',
      rationaleIt: 'Estensione completa massimizza contrazione glutei.',
      correction: 'Drive hips to full extension. Squeeze hard at top.',
      correctionIt: 'Porta le anche a estensione completa. Stringi forte in alto.',
      reference: 'Standard technique'
    }
  ],
  cues: [
    { phase: 'START', cue: 'Feet flat, chin tucked', cueIt: 'Piedi piatti, mento tucked' },
    { phase: 'TOP', cue: 'Squeeze glutes, hold', cueIt: 'Stringi i glutei, tieni' }
  ],
  analyze(angles, prevAngles, context) {
    const phase = angles.hip_angle < 100 ? 'START' : angles.hip_angle >= 170 ? 'TOP' : 'THRUST';
    const issues: AnalysisResult['issues'] = [];
    for (const check of this.formChecks) {
      if (check.phase === 'ALL' || check.phase === phase) {
        if (check.check(angles, prevAngles, context)) {
          issues.push({ id: check.id, type: check.type, severity: check.severity, issue: check.issue, issueIt: check.issueIt, rationale: check.rationale, rationaleIt: check.rationaleIt, correction: check.correction, correctionIt: check.correctionIt, reference: check.reference });
        }
      }
    }
    const cue = this.cues.find(c => c.phase === phase);
    return { phase, angles, issues, cue };
  }
};

// PLANK ANALYZER
export const PLANK_ANALYZER: ExerciseAnalyzer = {
  name: 'Plank',
  nameIt: 'Plank',
  phases: ['HOLD'],
  romRanges: [
    { angle: 'body_line', phase: 'HOLD', acceptable: { min: 165, max: 195 }, optimal: { min: 175, max: 185 }, context: 'Straight line from head to heels' }
  ],
  formChecks: [
    {
      id: 'HIPS_SAGGING',
      phase: 'HOLD',
      type: 'safety',
      severity: 'high',
      check: (angles) => (angles.hip_sag || 0) > 15,
      issue: 'Hips sagging - hyperextending lower back',
      issueIt: 'Anche che cedono - iperestensione bassa schiena',
      rationale: 'Puts stress on lumbar spine instead of working core.',
      rationaleIt: 'Mette stress sulla colonna lombare invece di lavorare il core.',
      correction: 'Squeeze glutes, tuck pelvis slightly, engage abs.',
      correctionIt: 'Stringi glutei, retroverti leggermente il bacino, attiva addominali.',
      reference: 'McGill SM (2015)'
    },
    {
      id: 'HIPS_TOO_HIGH',
      phase: 'HOLD',
      type: 'efficiency',
      severity: 'medium',
      check: (angles) => (angles.hip_pike || 0) > 20,
      issue: 'Hips too high - pike position',
      issueIt: 'Anche troppo alte - posizione a picco',
      rationale: 'Reduces core engagement. This is easier but less effective.',
      rationaleIt: 'Riduce ingaggio del core. È più facile ma meno efficace.',
      correction: 'Lower hips to align with shoulders and ankles.',
      correctionIt: 'Abbassa le anche per allinearle con spalle e caviglie.',
      reference: 'Standard technique'
    }
  ],
  cues: [
    { phase: 'HOLD', cue: 'Straight line head to heels', cueIt: 'Linea dritta dalla testa ai talloni' }
  ],
  analyze(angles, prevAngles, context) {
    const phase = 'HOLD';
    const issues: AnalysisResult['issues'] = [];
    for (const check of this.formChecks) {
      if (check.check(angles, prevAngles, context)) {
        issues.push({ id: check.id, type: check.type, severity: check.severity, issue: check.issue, issueIt: check.issueIt, rationale: check.rationale, rationaleIt: check.rationaleIt, correction: check.correction, correctionIt: check.correctionIt, reference: check.reference });
      }
    }
    const cue = this.cues[0];
    return { phase, angles, issues, cue };
  }
};

// ============================================================================
// ALL ANALYZERS EXPORT
// ============================================================================

export const EXERCISE_ANALYZERS: Record<string, ExerciseAnalyzer> = {
  squat: SQUAT_ANALYZER,
  bench_press: BENCH_PRESS_ANALYZER,
  deadlift: DEADLIFT_ANALYZER,
  barbell_row: BARBELL_ROW_ANALYZER,
  pullup: PULLUP_ANALYZER,
  overhead_press: OVERHEAD_PRESS_ANALYZER,
  rdl: RDL_ANALYZER,
  romanian_deadlift: RDL_ANALYZER,
  lunge: LUNGE_ANALYZER,
  hip_thrust: HIP_THRUST_ANALYZER,
  plank: PLANK_ANALYZER
};

/**
 * Get analyzer by exercise name
 */
export function getExerciseAnalyzer(exerciseName: string): ExerciseAnalyzer | null {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return EXERCISE_ANALYZERS[normalized] || null;
}

/**
 * Generate session report from analysis history
 */
export function generateSessionReport(
  analysisHistory: AnalysisResult[],
  context: AnalysisContext
): {
  totalIssues: { safety: number; efficiency: number; optimization: number };
  mostCommonIssues: Array<{ id: string; count: number; type: string }>;
  morphotypeNotes: string[];
  overallAssessment: string;
  overallAssessmentIt: string;
} {
  const totalIssues = { safety: 0, efficiency: 0, optimization: 0 };
  const issueCounts: Record<string, { count: number; type: string }> = {};
  const allMorphotypeNotes = new Set<string>();

  for (const result of analysisHistory) {
    for (const issue of result.issues) {
      totalIssues[issue.type]++;
      if (!issueCounts[issue.id]) {
        issueCounts[issue.id] = { count: 0, type: issue.type };
      }
      issueCounts[issue.id].count++;
    }
    if (result.morphotypeNotes) {
      result.morphotypeNotes.forEach(note => allMorphotypeNotes.add(note));
    }
  }

  const mostCommonIssues = Object.entries(issueCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let overallAssessment: string;
  let overallAssessmentIt: string;

  if (totalIssues.safety > 0) {
    overallAssessment = 'Address safety issues first. These can increase injury risk.';
    overallAssessmentIt = 'Affronta prima i problemi di sicurezza. Questi possono aumentare il rischio di infortuni.';
  } else if (totalIssues.efficiency > analysisHistory.length * 0.3) {
    overallAssessment = 'Form is generally safe but could be more efficient.';
    overallAssessmentIt = 'La forma è generalmente sicura ma potrebbe essere più efficiente.';
  } else {
    overallAssessment = 'Good form overall. Minor optimization suggestions available.';
    overallAssessmentIt = 'Buona forma complessiva. Suggerimenti di ottimizzazione minori disponibili.';
  }

  return {
    totalIssues,
    mostCommonIssues,
    morphotypeNotes: Array.from(allMorphotypeNotes),
    overallAssessment,
    overallAssessmentIt
  };
}
