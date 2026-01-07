/**
 * MEDIAPIPE EXERCISE ANALYZERS - Evidence-Based (DCSS Paradigm)
 *
 * Sistema di analisi biomeccanica client-side per form check in tempo reale.
 * Utilizza MediaPipe Pose per rilevare i landmark corporei e applicare
 * analisi basate su letteratura scientifica MODERNA.
 *
 * PARADIGMA: DCSS di Paolo Evangelista
 * - La tecnica ottimale dipende dalle proporzioni individuali
 * - L'obiettivo è lo stimolo, non la "forma perfetta"
 * - I tessuti si adattano ai carichi progressivi
 * - Osservazioni, non giudizi
 *
 * Riferimenti chiave:
 * - Evangelista P - DCSS (Didattica e Correzione degli esercizi)
 * - Swain CTV et al. (2020) - No association between lumbar flexion and back pain
 * - Caneiro JP et al. (2019) - Beliefs about the body and pain
 * - Vigotsky AD et al. (2015) - Lumbar flexion in powerlifters is normal
 * - Lorenzetti S et al. (2018) - Torso lean and femur length relationship
 * - Kompf & Arandjelović (2017) - Squat depth and muscle activation
 * - Schoenfeld BJ (2010) - Full ROM for hypertrophy
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnalysisContext {
  goal: 'strength' | 'hypertrophy' | 'powerlifting' | 'rehab' | 'general';
  morphotype?: UserMorphotype;
  discomfortAreas?: string[];  // Renamed from painAreas
  injuryHistory?: string[];
  equipment?: 'barbell' | 'dumbbell' | 'machine' | 'bodyweight';
  userExperience?: 'beginner' | 'intermediate' | 'advanced';
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

/**
 * NUOVA CLASSIFICAZIONE SEVERITY (DCSS-aligned)
 * 
 * - 'note': Osservazione tecnica, non necessariamente da correggere
 * - 'suggestion': Suggerimento per ottimizzare, opzionale
 * - 'attention': Merita attenzione, potrebbe indicare sovraccarico o limitazione
 * - 'concern': Perdita di controllo significativa, valutare se procedere
 */
export type ObservationSeverity = 'note' | 'suggestion' | 'attention' | 'concern';

/**
 * NUOVA CLASSIFICAZIONE TIPO
 * 
 * - 'technique': Osservazione sulla meccanica del movimento
 * - 'efficiency': Suggerimento per ottimizzare lo stimolo
 * - 'individual': Nota legata alle proporzioni/struttura individuale
 */
export type ObservationType = 'technique' | 'efficiency' | 'individual';

export interface FormObservation {
  id: string;
  phase: string | 'ALL';
  type: ObservationType;
  severity: ObservationSeverity;
  check: (angles: Record<string, number>, prevAngles?: Record<string, number>, context?: AnalysisContext) => boolean;
  observation: string;
  observationIt: string;
  context: string;        // Spiega PERCHÉ potrebbe succedere (non "rischio")
  contextIt: string;
  suggestion: string;     // Suggerimento opzionale
  suggestionIt: string;
  askUser?: string;       // Domanda per l'utente (es. "Senti fastidio?")
  askUserIt?: string;
  reference?: string;
  individualNote?: string; // Nota se dipende da proporzioni
}

export interface ROMRange {
  angle: string;
  phase: string;
  acceptable: { min: number; max: number };
  typical: { min: number; max: number };  // Renamed from "optimal" - less judgmental
  context: string;
}

export interface AnalysisResult {
  phase: string;
  angles: Record<string, number>;
  observations: Array<{
    id: string;
    type: ObservationType;
    severity: ObservationSeverity;
    observation: string;
    observationIt: string;
    context: string;
    contextIt: string;
    suggestion: string;
    suggestionIt: string;
    askUser?: string;
    askUserIt?: string;
    reference?: string;
  }>;
  cue?: { cue: string; cueIt: string };
  individualNotes?: string[];
  romStatus?: Record<string, 'below' | 'acceptable' | 'typical' | 'above'>;
}

export interface ExerciseAnalyzer {
  name: string;
  nameIt: string;
  phases: string[];
  formObservations: FormObservation[];
  romRanges: ROMRange[];
  cues: Array<{ phase: string; cue: string; cueIt: string }>;
  analyze: (angles: Record<string, number>, prevAngles?: Record<string, number>, context?: AnalysisContext) => AnalysisResult;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get acceptable torso lean range based on morphotype
 * DCSS principle: Long femurs REQUIRE more forward lean - it's not an error
 */
function getAcceptableTorsoLeanRange(
  morphotype?: UserMorphotype,
  goal?: string
): { min: number; max: number } {
  let base = { min: 25, max: 60 };

  // Femori lunghi RICHIEDONO più lean - è NORMALE, non un problema
  if (morphotype?.femurToTibia === 'long') {
    base.max = 70;
  }

  // Powerlifting (low bar) richiede più lean - è TECNICA, non errore
  if (goal === 'powerlifting') {
    base = { min: 35, max: 75 };
  }

  return base;
}

/**
 * Get acceptable shoulder abduction range for bench press
 */
function getAcceptableShoulderAbductionRange(context?: AnalysisContext): { min: number; max: number } {
  if (context?.goal === 'powerlifting') {
    return { min: 30, max: 75 };  // More tucked for powerlifting
  }
  if (context?.goal === 'hypertrophy') {
    return { min: 45, max: 80 };  // Slightly more abduction can increase chest activation
  }
  return { min: 35, max: 80 };    // Default range
}

/**
 * Check ROM status against range
 */
function getROMStatus(value: number, range: ROMRange): 'below' | 'acceptable' | 'typical' | 'above' {
  if (value < range.acceptable.min) return 'below';
  if (value > range.acceptable.max) return 'above';
  if (value >= range.typical.min && value <= range.typical.max) return 'typical';
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
// SQUAT ANALYZER (DCSS Paradigm)
// ============================================================================

export const SQUAT_ANALYZER: ExerciseAnalyzer = {
  name: 'Squat',
  nameIt: 'Squat',
  phases: ['STANDING', 'DESCENT', 'BOTTOM', 'ASCENT'],

  romRanges: [
    {
      angle: 'left_knee',
      phase: 'BOTTOM',
      acceptable: { min: 60, max: 130 },
      typical: { min: 80, max: 110 },
      context: 'La profondità dipende da obiettivi e struttura. Parallelo (~90°) è sufficiente per la maggior parte degli obiettivi.'
    },
    {
      angle: 'torso_lean',
      phase: 'BOTTOM',
      acceptable: { min: 20, max: 75 },
      typical: { min: 35, max: 55 },
      context: 'Varia significativamente in base al rapporto femore:torso e alla posizione della barra.'
    }
  ],

  formObservations: [
    // ========== TECHNIQUE OBSERVATIONS ==========
    {
      id: 'LUMBAR_FLEXION_OBSERVED',
      phase: 'BOTTOM',
      type: 'technique',
      severity: 'note',  // NOT 'high' - it's an observation, not an error
      check: (angles, _, context) => {
        // Detect significant lumbar flexion, but with reasonable threshold
        const torsoLean = angles.torso_lean || 0;
        const threshold = context?.goal === 'powerlifting' ? 80 : 70;
        return torsoLean > threshold;
      },
      observation: 'Lumbar flexion observed at bottom position',
      observationIt: 'Flessione lombare osservata nel bottom',
      context: 'This is common and often normal. It can depend on: hip/ankle mobility, femur length, load relative to your capacity, or acetabulum structure.',
      contextIt: 'È comune e spesso normale. Può dipendere da: mobilità anca/caviglia, lunghezza femore, carico relativo alla tua capacità, o struttura dell\'acetabolo.',
      suggestion: 'If this doesn\'t cause discomfort, it may be fine for your structure. To reduce it: work on hip mobility, try heel elevation, or reduce depth slightly.',
      suggestionIt: 'Se non causa fastidio, potrebbe essere normale per la tua struttura. Per ridurla: lavora su mobilità anca, prova rialzo talloni, o riduci leggermente la profondità.',
      askUser: 'Do you feel discomfort in your lower back during this movement?',
      askUserIt: 'Senti fastidio nella bassa schiena durante questo movimento?',
      reference: 'Swain et al. (2020): No association between lumbar flexion and back pain in trained lifters'
    },
    {
      id: 'KNEE_VALGUS_DYNAMIC',
      phase: 'ASCENT',
      type: 'technique',
      severity: 'suggestion',  // Changed from 'high'
      check: (angles) => {
        const leftValgus = angles.left_knee_valgus || 0;
        const rightValgus = angles.right_knee_valgus || 0;
        // Only flag if SIGNIFICANT and ASYMMETRIC
        return Math.abs(leftValgus - rightValgus) > 20;
      },
      observation: 'Knee tracking inward during ascent',
      observationIt: 'Ginocchia che si muovono verso l\'interno in risalita',
      context: 'Some inward movement is normal and functional. It becomes relevant if excessive, asymmetric, or associated with discomfort.',
      contextIt: 'Un certo movimento verso l\'interno è normale e funzionale. Diventa rilevante se eccessivo, asimmetrico, o associato a fastidio.',
      suggestion: 'Cue: "Push knees out" or "Spread the floor". Glute activation work can help if you want to address this.',
      suggestionIt: 'Cue: "Spingi le ginocchia fuori" o "Allarga il pavimento". Lavoro di attivazione glutei può aiutare se vuoi lavorarci.',
      askUser: 'Do you feel any discomfort in your knees?',
      askUserIt: 'Senti fastidio alle ginocchia?',
      reference: 'DCSS: Moderate valgus is often functional; excessive valgus may indicate glute activation opportunity'
    },
    {
      id: 'HEEL_RISE_OBSERVED',
      phase: 'BOTTOM',
      type: 'technique',
      severity: 'note',
      check: (angles) => {
        // This would need heel tracking which MediaPipe provides
        return (angles.heel_elevation || 0) > 5;
      },
      observation: 'Heels lifting from floor',
      observationIt: 'Talloni che si alzano dal pavimento',
      context: 'Usually indicates ankle mobility limitation. Not inherently problematic if controlled.',
      contextIt: 'Di solito indica limitazione nella mobilità della caviglia. Non è intrinsecamente problematico se controllato.',
      suggestion: 'Options: heel elevation (squat shoes or plates), ankle mobility work, or reduce depth to where heels stay down.',
      suggestionIt: 'Opzioni: rialzo talloni (scarpe da squat o dischi), lavoro su mobilità caviglia, o ridurre profondità dove i talloni restano giù.',
      reference: 'DCSS: Heel rise is a mobility issue, not a safety issue'
    },

    // ========== EFFICIENCY OBSERVATIONS ==========
    {
      id: 'TORSO_LEAN_INDIVIDUAL',
      phase: 'BOTTOM',
      type: 'individual',
      severity: 'note',
      check: (angles, _, context) => {
        const range = getAcceptableTorsoLeanRange(context?.morphotype, context?.goal);
        const torsoLean = angles.torso_lean || 0;
        return torsoLean < range.min || torsoLean > range.max;
      },
      observation: 'Torso lean outside typical range for your build',
      observationIt: 'Inclinazione busto fuori dal range tipico per la tua struttura',
      context: 'Torso angle should match your femur length. Long femurs require more forward lean - this is physics, not technique error.',
      contextIt: 'L\'angolo del busto deve corrispondere alla lunghezza del femore. Femori lunghi richiedono più inclinazione - è fisica, non errore tecnico.',
      suggestion: 'This may be correct for you. If you feel excessive lower back fatigue, consider heel elevation or front squat variation.',
      suggestionIt: 'Potrebbe essere corretto per te. Se senti eccessivo affaticamento nella bassa schiena, considera rialzo talloni o variante front squat.',
      individualNote: 'Torso lean is highly individual. What looks "wrong" may be optimal for your proportions.',
      reference: 'Lorenzetti et al. (2018): Torso lean correlates with femur:torso ratio'
    },
    {
      id: 'DEPTH_OBSERVATION',
      phase: 'BOTTOM',
      type: 'efficiency',
      severity: 'note',
      check: (angles) => {
        const knee = angles.left_knee || angles.right_knee || 180;
        return knee > 110; // Not reaching parallel
      },
      observation: 'Squat depth above parallel',
      observationIt: 'Profondità squat sopra il parallelo',
      context: 'Depth depends on your goals. Parallel is sufficient for most purposes. Deeper is fine if you have the mobility.',
      contextIt: 'La profondità dipende dai tuoi obiettivi. Il parallelo è sufficiente per la maggior parte degli scopi. Più profondo va bene se hai la mobilità.',
      suggestion: 'For hypertrophy: parallel is fine. For powerlifting: just below parallel is required. For mobility: go as deep as controlled.',
      suggestionIt: 'Per ipertrofia: parallelo va bene. Per powerlifting: appena sotto il parallelo è richiesto. Per mobilità: vai profondo quanto controlli.',
      reference: 'Kompf & Arandjelović (2017): Depth and muscle activation'
    }
  ],

  cues: [
    { phase: 'STANDING', cue: 'Big breath, brace your core', cueIt: 'Grande respiro, stabilizza il core' },
    { phase: 'DESCENT', cue: 'Control the descent, knees track over toes', cueIt: 'Controlla la discesa, ginocchia in linea con le punte' },
    { phase: 'BOTTOM', cue: 'Maintain tension, don\'t relax', cueIt: 'Mantieni tensione, non rilassarti' },
    { phase: 'ASCENT', cue: 'Drive through your feet, lead with chest', cueIt: 'Spingi attraverso i piedi, guida col petto' }
  ],

  analyze(angles, prevAngles, context) {
    const phase = getSquatPhase(angles.left_knee || angles.right_knee || 180);
    const observations: AnalysisResult['observations'] = [];
    const individualNotes: string[] = [];

    for (const obs of this.formObservations) {
      if (obs.phase === 'ALL' || obs.phase === phase) {
        if (obs.check(angles, prevAngles, context)) {
          observations.push({
            id: obs.id,
            type: obs.type,
            severity: obs.severity,
            observation: obs.observation,
            observationIt: obs.observationIt,
            context: obs.context,
            contextIt: obs.contextIt,
            suggestion: obs.suggestion,
            suggestionIt: obs.suggestionIt,
            askUser: obs.askUser,
            askUserIt: obs.askUserIt,
            reference: obs.reference
          });
          
          if (obs.individualNote) {
            individualNotes.push(obs.individualNote);
          }
        }
      }
    }

    // Add morphotype-specific notes
    if (context?.morphotype?.femurToTibia === 'long') {
      individualNotes.push('Con femori lunghi, più inclinazione del busto è normale e necessaria per mantenere il bilanciere sopra il centro del piede.');
    }
    if (context?.morphotype?.ankleDorsiflexion === 'limited') {
      individualNotes.push('Con mobilità caviglia limitata, considera scarpe con tacco o rialzo talloni per raggiungere profondità confortevolmente.');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { 
      phase, 
      angles, 
      observations, 
      cue, 
      individualNotes: individualNotes.length > 0 ? individualNotes : undefined 
    };
  }
};

// ============================================================================
// DEADLIFT ANALYZER (DCSS Paradigm)
// ============================================================================

export const DEADLIFT_ANALYZER: ExerciseAnalyzer = {
  name: 'Deadlift',
  nameIt: 'Stacco da Terra',
  phases: ['SETUP', 'LIFT', 'LOCKOUT', 'DESCENT'],

  romRanges: [
    {
      angle: 'hip_angle',
      phase: 'SETUP',
      acceptable: { min: 55, max: 100 },
      typical: { min: 65, max: 90 },
      context: 'Hip height varies significantly by body proportions. Find what lets you maintain a strong back position.'
    },
    {
      angle: 'torso_lean',
      phase: 'SETUP',
      acceptable: { min: 25, max: 65 },
      typical: { min: 35, max: 55 },
      context: 'More upright with long arms, more horizontal with short arms. Both are correct for different builds.'
    }
  ],

  formObservations: [
    {
      id: 'LUMBAR_FLEXION_DEADLIFT',
      phase: 'ALL',
      type: 'technique',
      severity: 'note',  // Changed from 'high'
      check: (angles, prevAngles) => {
        const currentLean = angles.torso_lean || 0;
        const prevLean = prevAngles?.torso_lean || currentLean;
        // Only flag if there's SUDDEN loss of position (>15° change in one frame)
        return Math.abs(currentLean - prevLean) > 15;
      },
      observation: 'Sudden change in back position during lift',
      observationIt: 'Cambio improvviso della posizione della schiena durante il sollevamento',
      context: 'A gradual, controlled back position is fine. Sudden changes may indicate the load is challenging your current capacity.',
      contextIt: 'Una posizione della schiena graduale e controllata va bene. Cambi improvvisi possono indicare che il carico sta sfidando la tua capacità attuale.',
      suggestion: 'If this happens consistently, consider: reducing load, strengthening back position with paused deadlifts, or checking if fatigue is a factor.',
      suggestionIt: 'Se succede costantemente, considera: ridurre il carico, rinforzare la posizione della schiena con stacchi in pausa, o verificare se la fatica è un fattore.',
      askUser: 'Do you feel like you\'re losing control of the weight?',
      askUserIt: 'Senti di perdere il controllo del peso?',
      reference: 'Vigotsky et al. (2015): Some lumbar flexion is normal in heavy deadlifts; sudden changes indicate capacity limit'
    },
    {
      id: 'UPPER_BACK_ROUNDING',
      phase: 'LIFT',
      type: 'technique',
      severity: 'note',
      check: (angles) => {
        return (angles.thoracic_flexion || 0) > 30;
      },
      observation: 'Upper back rounding during lift',
      observationIt: 'Arrotondamento della parte alta della schiena durante il sollevamento',
      context: 'Upper back (thoracic) rounding is common and often acceptable, especially in conventional stance. It\'s different from lower back rounding.',
      contextIt: 'L\'arrotondamento della parte alta della schiena (toracica) è comune e spesso accettabile, specialmente nello stacco convenzionale. È diverso dall\'arrotondamento lombare.',
      suggestion: 'Upper back rounding is a valid technique choice for some lifters. Focus on keeping lower back stable.',
      suggestionIt: 'L\'arrotondamento della parte alta della schiena è una scelta tecnica valida per alcuni atleti. Concentrati sul mantenere la bassa schiena stabile.',
      reference: 'DCSS: Thoracic flexion is acceptable; lumbar control is the priority'
    },
    {
      id: 'LOCKOUT_HYPEREXTENSION',
      phase: 'LOCKOUT',
      type: 'efficiency',
      severity: 'note',
      check: (angles) => {
        return (angles.hip_angle || 0) > 190; // Hyperextension
      },
      observation: 'Hyperextension at lockout',
      observationIt: 'Iperestensione al lockout',
      context: 'Excessive lean back at lockout puts unnecessary stress on the lower back. The lift is complete when you\'re standing tall.',
      contextIt: 'Inclinarsi troppo indietro al lockout mette stress non necessario sulla bassa schiena. Il sollevamento è completo quando sei in piedi dritto.',
      suggestion: 'Finish tall with glutes squeezed, hips fully extended. No need to lean back.',
      suggestionIt: 'Finisci in posizione eretta con glutei contratti, anche completamente estese. Non c\'è bisogno di inclinarsi indietro.',
      reference: 'Standard technique'
    },
    {
      id: 'BAR_DRIFT',
      phase: 'LIFT',
      type: 'efficiency',
      severity: 'suggestion',
      check: (angles) => {
        return (angles.bar_path_deviation || 0) > 8; // cm from vertical
      },
      observation: 'Bar drifting away from body',
      observationIt: 'Bilanciere che si allontana dal corpo',
      context: 'Keeping the bar close is mechanically efficient. Drift increases the moment arm and makes the lift harder.',
      contextIt: 'Tenere il bilanciere vicino è meccanicamente efficiente. L\'allontanamento aumenta il braccio di leva e rende il sollevamento più difficile.',
      suggestion: 'Cue: "Drag the bar up your legs". Keep lats engaged.',
      suggestionIt: 'Cue: "Trascina il bilanciere sulle gambe". Mantieni i dorsali attivi.',
      reference: 'DCSS: Bar path optimization'
    }
  ],

  cues: [
    { phase: 'SETUP', cue: 'Chest up, lats tight, slack out of the bar', cueIt: 'Petto alto, dorsali tesi, togli il gioco dal bilanciere' },
    { phase: 'LIFT', cue: 'Push the floor away, keep bar close', cueIt: 'Spingi il pavimento via, tieni il bilanciere vicino' },
    { phase: 'LOCKOUT', cue: 'Stand tall, squeeze glutes', cueIt: 'In piedi dritto, stringi i glutei' },
    { phase: 'DESCENT', cue: 'Hinge at hips, control the descent', cueIt: 'Piegati dalle anche, controlla la discesa' }
  ],

  analyze(angles, prevAngles, context) {
    const hipAngle = angles.hip_angle || 180;
    const phase = hipAngle < 100 ? 'SETUP' :
                  hipAngle < 160 ? 'LIFT' :
                  hipAngle >= 175 ? 'LOCKOUT' : 'DESCENT';

    const observations: AnalysisResult['observations'] = [];
    const individualNotes: string[] = [];

    for (const obs of this.formObservations) {
      if (obs.phase === 'ALL' || obs.phase === phase) {
        if (obs.check(angles, prevAngles, context)) {
          observations.push({
            id: obs.id,
            type: obs.type,
            severity: obs.severity,
            observation: obs.observation,
            observationIt: obs.observationIt,
            context: obs.context,
            contextIt: obs.contextIt,
            suggestion: obs.suggestion,
            suggestionIt: obs.suggestionIt,
            askUser: obs.askUser,
            askUserIt: obs.askUserIt,
            reference: obs.reference
          });
        }
      }
    }

    // Morphotype notes
    if (context?.morphotype?.armToTorso === 'long') {
      individualNotes.push('Con braccia lunghe, puoi mantenere un torso più verticale. Questo è un vantaggio meccanico, non un errore.');
    }
    if (context?.morphotype?.armToTorso === 'short') {
      individualNotes.push('Con braccia corte, avrai più inclinazione del torso. Considera lo stacco sumo o trap bar come alternative che potrebbero adattarsi meglio.');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, observations, cue, individualNotes: individualNotes.length > 0 ? individualNotes : undefined };
  }
};

// ============================================================================
// BENCH PRESS ANALYZER (DCSS Paradigm)
// ============================================================================

export const BENCH_PRESS_ANALYZER: ExerciseAnalyzer = {
  name: 'Bench Press',
  nameIt: 'Panca Piana',
  phases: ['START', 'DESCENT', 'BOTTOM', 'PRESS'],

  romRanges: [
    {
      angle: 'elbow',
      phase: 'BOTTOM',
      acceptable: { min: 70, max: 120 },
      typical: { min: 80, max: 100 },
      context: 'Depth depends on shoulder mobility and goals. Touch chest if possible without discomfort.'
    },
    {
      angle: 'shoulder_abduction',
      phase: 'ALL',
      acceptable: { min: 30, max: 80 },
      typical: { min: 45, max: 70 },
      context: 'Elbow angle from torso. More tucked = less shoulder stress, more flared = more chest activation.'
    }
  ],

  formObservations: [
    {
      id: 'ELBOW_FLARE_EXCESSIVE',
      phase: 'ALL',
      type: 'technique',
      severity: 'suggestion',
      check: (angles) => {
        const abduction = angles.shoulder_abduction || 0;
        return abduction > 80;
      },
      observation: 'Elbows flared wide (>80° from torso)',
      observationIt: 'Gomiti molto larghi (>80° dal torso)',
      context: 'Very wide elbow position increases shoulder stress. Some lifters tolerate this fine; others may feel shoulder discomfort.',
      contextIt: 'Una posizione molto larga dei gomiti aumenta lo stress sulla spalla. Alcuni atleti la tollerano bene; altri possono sentire fastidio alla spalla.',
      suggestion: 'If you have shoulder discomfort, try tucking elbows to 45-60°. If it feels fine, this may work for you.',
      suggestionIt: 'Se hai fastidio alla spalla, prova a tenere i gomiti a 45-60°. Se non dà problemi, potrebbe funzionare per te.',
      askUser: 'Do you feel any shoulder discomfort with this elbow position?',
      askUserIt: 'Senti fastidio alla spalla con questa posizione dei gomiti?',
      reference: 'Green CM & Comfort P (2007): Shoulder abduction and impingement risk'
    },
    {
      id: 'SCAPULAE_POSITION',
      phase: 'ALL',
      type: 'efficiency',
      severity: 'note',
      check: (angles) => {
        // This would need scapula tracking
        return (angles.scapula_protraction || 0) > 15;
      },
      observation: 'Scapulae not fully retracted',
      observationIt: 'Scapole non completamente retratte',
      context: 'Retracted scapulae create a stable pressing surface and may reduce shoulder stress.',
      contextIt: 'Le scapole retratte creano una superficie di spinta stabile e possono ridurre lo stress sulla spalla.',
      suggestion: 'Cue: "Put your scapulae in your back pockets" before unracking.',
      suggestionIt: 'Cue: "Metti le scapole nelle tasche posteriori" prima di staccare il bilanciere.',
      reference: 'Standard technique'
    },
    {
      id: 'ARCH_OBSERVATION',
      phase: 'ALL',
      type: 'individual',
      severity: 'note',
      check: (angles) => {
        // Detect if there's lumbar arch
        return (angles.lumbar_extension || 0) > 30;
      },
      observation: 'Significant lumbar arch',
      observationIt: 'Arco lombare significativo',
      context: 'Arch is a technique choice. More arch = shorter ROM and better shoulder position. Less arch = more chest work. Both are valid.',
      contextIt: 'L\'arco è una scelta tecnica. Più arco = ROM più corto e migliore posizione spalla. Meno arco = più lavoro pettorale. Entrambi sono validi.',
      suggestion: 'Choose your arch based on your goals and comfort. Powerlifters often arch more; bodybuilders may prefer less.',
      suggestionIt: 'Scegli il tuo arco in base ai tuoi obiettivi e comfort. I powerlifter spesso arcuano di più; i bodybuilder possono preferire meno.',
      reference: 'DCSS: Arch is individual preference and goal-dependent'
    }
  ],

  cues: [
    { phase: 'START', cue: 'Retract scapulae, set your arch', cueIt: 'Retrai le scapole, imposta il tuo arco' },
    { phase: 'DESCENT', cue: 'Control the bar down to your chest', cueIt: 'Controlla la barra in discesa verso il petto' },
    { phase: 'BOTTOM', cue: 'Stay tight, drive feet into floor', cueIt: 'Resta compatto, spingi i piedi nel pavimento' },
    { phase: 'PRESS', cue: 'Press up and slightly back toward rack', cueIt: 'Spingi su e leggermente indietro verso i supporti' }
  ],

  analyze(angles, prevAngles, context) {
    const elbowAngle = angles.left_elbow || angles.right_elbow || 180;
    const phase = elbowAngle > 150 ? 'START' :
                  elbowAngle > 110 ? 'DESCENT' :
                  elbowAngle < 100 ? 'BOTTOM' : 'PRESS';

    const observations: AnalysisResult['observations'] = [];
    const individualNotes: string[] = [];

    for (const obs of this.formObservations) {
      if (obs.phase === 'ALL' || obs.phase === phase) {
        if (obs.check(angles, prevAngles, context)) {
          observations.push({
            id: obs.id,
            type: obs.type,
            severity: obs.severity,
            observation: obs.observation,
            observationIt: obs.observationIt,
            context: obs.context,
            contextIt: obs.contextIt,
            suggestion: obs.suggestion,
            suggestionIt: obs.suggestionIt,
            askUser: obs.askUser,
            askUserIt: obs.askUserIt,
            reference: obs.reference
          });
        }
      }
    }

    // Morphotype notes
    if (context?.morphotype?.armToTorso === 'long') {
      individualNotes.push('Con braccia lunghe, il ROM è più lungo. Considera grip più largo o più arco per compensare.');
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, observations, cue, individualNotes: individualNotes.length > 0 ? individualNotes : undefined };
  }
};

// ============================================================================
// BARBELL ROW ANALYZER (DCSS Paradigm)
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
      typical: { min: 30, max: 60 },
      context: 'More horizontal = more lat emphasis. More upright = more trap/rhomboid emphasis. Both are valid variations.'
    },
    {
      angle: 'elbow',
      phase: 'CONTRACTED',
      acceptable: { min: 60, max: 110 },
      typical: { min: 70, max: 95 },
      context: 'Full contraction means elbows at or past torso line.'
    }
  ],

  formObservations: [
    {
      id: 'BODY_ENGLISH',
      phase: 'PULL',
      type: 'technique',
      severity: 'note',
      check: (angles, prevAngles) => {
        if (!prevAngles) return false;
        const torsoChange = Math.abs((angles.torso_lean || 0) - (prevAngles.torso_lean || 0));
        return torsoChange > 20;
      },
      observation: 'Significant body momentum used',
      observationIt: 'Uso significativo di slancio corporeo',
      context: 'Some "body English" is acceptable and can be a valid technique choice. Excessive momentum may indicate the load is heavy relative to your strict strength.',
      contextIt: 'Un po\' di "slancio" è accettabile e può essere una scelta tecnica valida. Slancio eccessivo può indicare che il carico è pesante rispetto alla tua forza stretta.',
      suggestion: 'If you want stricter rows: reduce weight or try chest-supported rows. If you\'re intentionally using momentum for overload: that\'s a valid training tool.',
      suggestionIt: 'Se vuoi rematori più stretti: riduci il peso o prova rematori con supporto petto. Se stai usando intenzionalmente lo slancio per sovraccarico: è uno strumento di allenamento valido.',
      reference: 'DCSS: Controlled cheating is a valid technique; uncontrolled cheating indicates load selection issue'
    },
    {
      id: 'INCOMPLETE_ROM',
      phase: 'CONTRACTED',
      type: 'efficiency',
      severity: 'note',
      check: (angles) => {
        return (angles.left_elbow || 180) > 110;
      },
      observation: 'Elbows not reaching full contraction',
      observationIt: 'Gomiti che non raggiungono la contrazione completa',
      context: 'Full ROM typically means pulling until elbows are at or past your torso. Partial ROM is fine if intentional.',
      contextIt: 'ROM completo tipicamente significa tirare finché i gomiti sono al livello o oltre il torso. ROM parziale va bene se intenzionale.',
      suggestion: 'For full back development, pull until the bar touches your belly. For heavy overload work, partial ROM can be a valid tool.',
      suggestionIt: 'Per sviluppo completo della schiena, tira finché il bilanciere tocca la pancia. Per lavoro di sovraccarico pesante, ROM parziale può essere uno strumento valido.',
      reference: 'Schoenfeld (2010): Full ROM for hypertrophy'
    }
  ],

  cues: [
    { phase: 'START', cue: 'Hinge forward, back flat, lats engaged', cueIt: 'Inclinati in avanti, schiena piatta, dorsali attivi' },
    { phase: 'PULL', cue: 'Pull with elbows, squeeze shoulder blades', cueIt: 'Tira coi gomiti, stringi le scapole' },
    { phase: 'CONTRACTED', cue: 'Hold briefly, feel the squeeze', cueIt: 'Tieni brevemente, senti la contrazione' },
    { phase: 'LOWER', cue: 'Control the descent, stretch at bottom', cueIt: 'Controlla la discesa, allunga in basso' }
  ],

  analyze(angles, prevAngles, context) {
    const elbowAngle = angles.left_elbow || angles.right_elbow || 180;
    const phase = elbowAngle > 150 ? 'START' :
                  elbowAngle > 120 ? 'PULL' :
                  elbowAngle < 100 ? 'CONTRACTED' : 'LOWER';

    const observations: AnalysisResult['observations'] = [];

    for (const obs of this.formObservations) {
      if (obs.phase === 'ALL' || obs.phase === phase) {
        if (obs.check(angles, prevAngles, context)) {
          observations.push({
            id: obs.id,
            type: obs.type,
            severity: obs.severity,
            observation: obs.observation,
            observationIt: obs.observationIt,
            context: obs.context,
            contextIt: obs.contextIt,
            suggestion: obs.suggestion,
            suggestionIt: obs.suggestionIt,
            askUser: obs.askUser,
            askUserIt: obs.askUserIt,
            reference: obs.reference
          });
        }
      }
    }

    const cue = this.cues.find(c => c.phase === phase);

    return { phase, angles, observations, cue };
  }
};

// ============================================================================
// EXPORT ALL ANALYZERS
// ============================================================================

export const EXERCISE_ANALYZERS: Record<string, ExerciseAnalyzer> = {
  squat: SQUAT_ANALYZER,
  bench_press: BENCH_PRESS_ANALYZER,
  deadlift: DEADLIFT_ANALYZER,
  barbell_row: BARBELL_ROW_ANALYZER,
  // Add more as needed
};

/**
 * Get analyzer by exercise name
 */
export function getExerciseAnalyzer(exerciseName: string): ExerciseAnalyzer | null {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return EXERCISE_ANALYZERS[normalized] || null;
}

/**
 * Generate session summary from analysis history
 * DCSS approach: Focus on patterns and actionable insights, not "errors"
 */
export function generateSessionSummary(
  analysisHistory: AnalysisResult[],
  context: AnalysisContext
): {
  totalObservations: { technique: number; efficiency: number; individual: number };
  commonPatterns: Array<{ id: string; count: number; type: string }>;
  individualNotes: string[];
  summary: string;
  summaryIt: string;
  actionItems: string[];
  actionItemsIt: string[];
} {
  const totalObservations = { technique: 0, efficiency: 0, individual: 0 };
  const observationCounts: Record<string, { count: number; type: string }> = {};
  const allIndividualNotes = new Set<string>();

  for (const result of analysisHistory) {
    for (const obs of result.observations) {
      totalObservations[obs.type]++;
      if (!observationCounts[obs.id]) {
        observationCounts[obs.id] = { count: 0, type: obs.type };
      }
      observationCounts[obs.id].count++;
    }
    if (result.individualNotes) {
      result.individualNotes.forEach(note => allIndividualNotes.add(note));
    }
  }

  const commonPatterns = Object.entries(observationCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate summary based on what was observed
  let summary: string;
  let summaryIt: string;
  const actionItems: string[] = [];
  const actionItemsIt: string[] = [];

  const totalObs = totalObservations.technique + totalObservations.efficiency + totalObservations.individual;

  if (totalObs === 0) {
    summary = 'Movement looked controlled throughout the session. No specific observations to note.';
    summaryIt = 'Il movimento è apparso controllato durante tutta la sessione. Nessuna osservazione specifica da notare.';
  } else if (totalObservations.technique > totalObservations.efficiency) {
    summary = `We noticed some technique patterns. These aren't necessarily errors - review the observations and decide if you want to work on them.`;
    summaryIt = `Abbiamo notato alcuni pattern tecnici. Non sono necessariamente errori - rivedi le osservazioni e decidi se vuoi lavorarci.`;
    actionItems.push('Review technique observations', 'Consider if any are causing discomfort');
    actionItemsIt.push('Rivedi le osservazioni tecniche', 'Considera se qualcuna causa fastidio');
  } else {
    summary = 'Movement quality looks good. Some efficiency suggestions noted for optimization if you\'re interested.';
    summaryIt = 'La qualità del movimento sembra buona. Alcuni suggerimenti di efficienza notati per ottimizzazione se ti interessa.';
    actionItems.push('Review efficiency suggestions if interested in optimization');
    actionItemsIt.push('Rivedi i suggerimenti di efficienza se interessato all\'ottimizzazione');
  }

  return {
    totalObservations,
    commonPatterns,
    individualNotes: Array.from(allIndividualNotes),
    summary,
    summaryIt,
    actionItems,
    actionItemsIt
  };
}
