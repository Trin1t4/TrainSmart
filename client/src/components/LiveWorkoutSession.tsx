/**
 * LIVE WORKOUT SESSION - Real-Time RPE Feedback & Auto-Regulation
 *
 * Esperienza workout interattiva:
 * 1. Mostra esercizio corrente + set target
 * 2. User completa il set
 * 3. Chiede RPE immediatamente (1-10)
 * 4. Sistema riadatta volume/intensità in real-time
 * 5. Continua con prossimo set/esercizio
 *
 * Auto-regulation logic:
 * - RPE 9-10 (troppo alto) → Riduci volume (-1 set, -2 reps, +rest)
 * - RPE 1-4 (troppo basso) → Aumenta volume (+1 set, +2 reps)
 * - RPE 6-8 (ottimale) → Mantieni programmazione
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Play, Pause, SkipForward, X } from 'lucide-react';
import { toast } from 'sonner';
import autoRegulationService from '../lib/autoRegulationService';

interface Exercise {
  name: string;
  pattern: string;
  sets: number;
  reps: number | string;
  rest: string;
  intensity: string;
  notes?: string;
}

interface SetLog {
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rpe: number;
  adjusted: boolean;
  adjustment_reason?: string;
}

interface LiveWorkoutSessionProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  programId: string;
  dayName: string;
  exercises: Exercise[];
  onWorkoutComplete?: (logs: any[]) => void;
}

export default function LiveWorkoutSession({
  open,
  onClose,
  userId,
  programId,
  dayName,
  exercises: initialExercises,
  onWorkoutComplete
}: LiveWorkoutSessionProps) {
  // Pre-workout state
  const [showPreWorkout, setShowPreWorkout] = useState(true);
  const [mood, setMood] = useState<'great' | 'good' | 'ok' | 'tired'>('good');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [showLocationSwitch, setShowLocationSwitch] = useState(false);
  const [switchingLocation, setSwitchingLocation] = useState(false);
  const [homeEquipment, setHomeEquipment] = useState({
    dumbbell: false,
    barbell: false,
    pullUpBar: false,
    rings: false,
    bands: false,
    kettlebell: false,
    bench: false
  });

  // Pain screening state
  const [painAreas, setPainAreas] = useState<Array<{
    area: string;
    intensity: number;
  }>>([]);
  const [showPainScreen, setShowPainScreen] = useState(false);
  const [selectedPainArea, setSelectedPainArea] = useState<string | null>(null);

  // Menstrual cycle tracking state (for female athletes)
  const [menstrualPhase, setMenstrualPhase] = useState<'follicular' | 'ovulation' | 'luteal' | 'menstrual' | 'menopause' | 'none'>('none');
  const [cycleDayNumber, setCycleDayNumber] = useState<number>(14);
  const [showCycleTracker, setShowCycleTracker] = useState(false);

  // Workout state
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [locationSwitched, setLocationSwitched] = useState(false);

  // Current set state
  const [showRPEInput, setShowRPEInput] = useState(false);
  const [currentRPE, setCurrentRPE] = useState(7);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);

  // Adjustment state
  const [suggestion, setSuggestion] = useState<{
    type: 'reduce' | 'increase' | 'maintain';
    message: string;
    newSets?: number;
    newReps?: number;
    newRest?: string;
  } | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const targetReps = typeof currentExercise?.reps === 'number'
    ? currentExercise.reps
    : parseInt(currentExercise?.reps?.split('-')[0] || '10');

  // Calculate adjusted sets (may be modified by auto-regulation)
  const [adjustedSets, setAdjustedSets] = useState<Record<string, number>>({});
  const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;

  // Handle location switch for THIS SESSION ONLY
  const handleSessionLocationSwitch = async () => {
    try {
      setSwitchingLocation(true);

      console.log('🏋️ Switching location for this session only...');
      console.log('Equipment selected:', homeEquipment);

      // Map gym exercises to home equivalents
      const homeExercises = exercises.map(ex => {
        // Keep core exercises as-is (bodyweight)
        if (ex.pattern === 'core') return ex;

        // Map gym → home equivalents based on pattern
        const homeEquivalents: Record<string, { name: string; notes?: string }> = {
          // Lower Push
          'Squat (Bilanciere)': { name: 'Pistol Squat Assistito', notes: 'Usa una sedia per supporto' },
          'Bulgarian Split Squat': { name: 'Split Squat Corpo Libero', notes: 'Aggiungi peso se hai manubri' },
          'Leg Press': { name: 'Air Squat + Jump', notes: 'Volume alto per compensare' },

          // Horizontal Push
          'Panca Piana': { name: 'Push-up', notes: homeEquipment.dumbbell ? 'Usa manubri per push-up weighted' : 'Standard push-ups' },
          'Chest Press Manubri': { name: 'Push-up Diamonds', notes: 'Focus su pettorali' },
          'Piegamenti Sbarra': { name: 'Push-up Wide', notes: 'Ampia stance per petto' },

          // Vertical Push
          'Military Press': { name: 'Pike Push-up', notes: homeEquipment.dumbbell ? 'Usa manubri overhead' : 'Pike push-ups progressivi' },
          'Shoulder Press Manubri': { name: 'Handstand Push-up Progressione', notes: 'Wall-assisted HSPU' },

          // Vertical Pull
          'Trazioni': { name: homeEquipment.pullUpBar ? ex.name : 'Australian Pull-up (Tavolo)', notes: homeEquipment.pullUpBar ? 'Usa sbarra' : 'Usa tavolo robusto' },
          'Lat Machine': { name: 'Inverted Row (Tavolo)', notes: 'Usa tavolo o sbarra bassa' },
          'Pull-down': { name: homeEquipment.bands ? 'Band Pull-down' : 'Scap Pull-ups', notes: 'Focus su dorsali' },

          // Horizontal Pull
          'Rematore Bilanciere': { name: homeEquipment.dumbbell ? 'Rematore Manubri' : 'Inverted Row', notes: 'Focus su middle back' },
          'Rematore Manubri': { name: homeEquipment.dumbbell ? ex.name : 'Bodyweight Row (Tavolo)', notes: 'Mantieni intensità' },
          'Cable Row': { name: homeEquipment.bands ? 'Band Row' : 'Inverted Row', notes: 'Controlla movimento' },

          // Lower Pull
          'Stacchi Rumeni': { name: homeEquipment.dumbbell ? 'RDL Manubri' : 'Nordic Curl Assistito', notes: 'Focus hamstrings' },
          'Leg Curl': { name: 'Nordic Curl Progressione', notes: 'Usa letto/divano per bloccare piedi' },
          'Good Morning': { name: 'Single Leg RDL', notes: 'Equilibrio + posterior chain' }
        };

        // Find home equivalent
        const homeEquiv = homeEquivalents[ex.name];

        if (homeEquiv) {
          return {
            ...ex,
            name: homeEquiv.name,
            notes: homeEquiv.notes || ex.notes,
            intensity: ex.intensity // Keep same intensity intent
          };
        }

        // If no specific mapping, keep original (might be bodyweight already)
        return ex;
      });

      setExercises(homeExercises);
      setLocationSwitched(true);
      setShowLocationSwitch(false);
      setSwitchingLocation(false);

      toast.success('🏠 Location cambiata per questa sessione!', {
        description: 'Esercizi adattati per allenamento casa'
      });

      console.log('✅ Session exercises adapted for home:', homeExercises);

    } catch (error) {
      console.error('❌ Error switching location:', error);
      toast.error('Errore durante cambio location');
      setSwitchingLocation(false);
    }
  };

  // Handle pain area selection
  const handlePainAreaToggle = (area: string) => {
    const existingPain = painAreas.find(p => p.area === area);

    if (existingPain) {
      // Remove pain area
      setPainAreas(prev => prev.filter(p => p.area !== area));
      setSelectedPainArea(null);
    } else {
      // Add pain area with default intensity 5
      setPainAreas(prev => [...prev, { area, intensity: 5 }]);
      setSelectedPainArea(area);
    }
  };

  const handlePainIntensityChange = (area: string, intensity: number) => {
    setPainAreas(prev => prev.map(p =>
      p.area === area ? { ...p, intensity } : p
    ));
  };

  // BIOMECHANICAL INTELLIGENCE: Analyze which joints/muscles are involved in each exercise
  const getExerciseBiomechanics = (exercise: Exercise): {
    primaryJoints: string[];
    secondaryJoints: string[];
    loadLevel: 'high' | 'medium' | 'low';
    kinecticChain: string[];
  } => {
    // Multi-joint analysis for intelligent pain adaptation
    const exerciseName = exercise.name.toLowerCase();
    const pattern = exercise.pattern;

    // Default biomechanics
    let primaryJoints: string[] = [];
    let secondaryJoints: string[] = [];
    let loadLevel: 'high' | 'medium' | 'low' = 'medium';
    let kinecticChain: string[] = [];

    // Pattern-based biomechanical analysis
    if (pattern === 'vertical_push') {
      primaryJoints = ['shoulder'];
      secondaryJoints = ['elbow', 'upper_back'];
      kinecticChain = ['shoulder', 'upper_back', 'core'];
      loadLevel = exerciseName.includes('bilanciere') || exerciseName.includes('handstand') ? 'high' : 'medium';
    } else if (pattern === 'horizontal_push') {
      primaryJoints = ['shoulder', 'elbow'];
      secondaryJoints = ['wrist', 'upper_back'];
      kinecticChain = ['shoulder', 'upper_back', 'core'];
      loadLevel = exerciseName.includes('panca') || exerciseName.includes('bilanciere') ? 'high' : 'medium';
    } else if (pattern === 'vertical_pull') {
      primaryJoints = ['shoulder', 'upper_back'];
      secondaryJoints = ['elbow', 'neck'];
      kinecticChain = ['shoulder', 'upper_back', 'core', 'elbow'];
      loadLevel = exerciseName.includes('trazioni') || exerciseName.includes('pull-up') ? 'high' : 'medium';
    } else if (pattern === 'horizontal_pull') {
      primaryJoints = ['upper_back', 'shoulder'];
      secondaryJoints = ['elbow', 'lower_back'];
      kinecticChain = ['upper_back', 'shoulder', 'core', 'lower_back'];
      loadLevel = exerciseName.includes('bilanciere') ? 'high' : 'medium';
    } else if (pattern === 'lower_push') {
      primaryJoints = ['knee', 'hip'];
      secondaryJoints = ['ankle', 'lower_back'];
      kinecticChain = ['ankle', 'knee', 'hip', 'core', 'lower_back'];
      loadLevel = exerciseName.includes('bilanciere') || exerciseName.includes('squat') ? 'high' : 'medium';
    } else if (pattern === 'lower_pull') {
      primaryJoints = ['hip', 'lower_back'];
      secondaryJoints = ['knee', 'upper_back'];
      kinecticChain = ['ankle', 'knee', 'hip', 'lower_back', 'core'];
      loadLevel = exerciseName.includes('stacchi') || exerciseName.includes('deadlift') ? 'high' : 'medium';
    }

    return { primaryJoints, secondaryJoints, loadLevel, kinecticChain };
  };

  // Suggest corrective exercises based on pain area
  const getCorrectiveExercises = (area: string): string[] => {
    const correctiveMap: Record<string, string[]> = {
      shoulder: ['Face Pulls 2x15', 'Band Pull-Aparts 2x20', 'Wall Slides 2x10', 'Scapular Push-ups 2x12'],
      upper_back: ['Cat-Cow 2x10', 'Thoracic Rotations 2x8/side', 'Foam Roll T-Spine 3min'],
      lower_back: ['Dead Bugs 2x10/side', 'Bird Dogs 2x10/side', 'Cat-Cow 2x10', 'McGill Big 3'],
      hip: ['Hip 90/90 Stretch 2x30s/side', 'Clamshells 2x15', 'Hip Bridges 2x15'],
      knee: ['Terminal Knee Extensions 2x15', 'Wall Sits 2x30s', 'VMO Activation Drills'],
      ankle: ['Ankle Circles 2x10/direction', 'Calf Raises 2x15', 'Ankle Dorsiflexion Stretch 2x30s'],
      elbow: ['Wrist Curls 2x15', 'Forearm Stretches 2x30s', 'Elbow Circles 2x10'],
      wrist: ['Wrist Circles 2x10', 'Prayer Stretches 2x30s', 'Fist Pumps 2x20'],
      neck: ['Neck Retractions 2x10', 'Chin Tucks 2x10', 'Gentle Neck Rotations 2x5/side']
    };
    return correctiveMap[area] || [];
  };

  // Adapt exercises based on pain areas WITH BIOMECHANICAL INTELLIGENCE
  const adaptExercisesForPain = (exercisesToAdapt: Exercise[]): Exercise[] => {
    if (painAreas.length === 0) return exercisesToAdapt;

    console.log('🩹 Adapting exercises with biomechanical intelligence:', painAreas);

    // First pass: Add corrective exercises at the beginning
    const correctiveExercises: Exercise[] = [];
    painAreas.forEach(({ area, intensity }) => {
      if (intensity >= 4) {
        const correctives = getCorrectiveExercises(area);
        if (correctives.length > 0) {
          correctiveExercises.push({
            name: `🩹 Corrective: ${area.toUpperCase()}`,
            pattern: 'core',
            sets: 2,
            reps: correctives.join(' • '),
            rest: '30s',
            intensity: 'Light',
            notes: `⚡ Esegui PRIMA del workout: ${correctives.slice(0, 2).join(' + ')}`
          });
        }
      }
    });

    // Second pass: Adapt main exercises based on biomechanics
    const adaptedMainExercises = exercisesToAdapt.map(ex => {
      let adapted = { ...ex };
      let adaptationNotes: string[] = [];

      // Get biomechanical analysis for this exercise
      const biomech = getExerciseBiomechanics(ex);

      painAreas.forEach(({ area, intensity }) => {
        // Check if pain area affects this exercise
        const isPrimaryJoint = biomech.primaryJoints.includes(area);
        const isSecondaryJoint = biomech.secondaryJoints.includes(area);
        const isInKineticChain = biomech.kinecticChain.includes(area);

        if (!isPrimaryJoint && !isSecondaryJoint && !isInKineticChain) {
          return; // This exercise doesn't involve painful area
        }

        // INTELLIGENT ADAPTATION BASED ON:
        // 1. Pain intensity
        // 2. Joint involvement (primary vs secondary)
        // 3. Exercise load level
        // 4. Kinetic chain implications

        const shouldSubstitute = (isPrimaryJoint && intensity >= 7) || (biomech.loadLevel === 'high' && intensity >= 6);
        const shouldReduceVolume = (isPrimaryJoint && intensity >= 4) || (isSecondaryJoint && intensity >= 6);
        const shouldAddWarning = isInKineticChain && intensity >= 3;

        // HIGH INTENSITY PAIN (7-10): Sostituisci esercizio
        // MEDIUM PAIN (4-6): Riduci volume/intensità
        // LOW PAIN (1-3): Aggiungi warm-up note

        switch (area) {
          case 'shoulder':
            if (['vertical_push', 'horizontal_push', 'vertical_pull'].includes(ex.pattern)) {
              if (intensity >= 7) {
                // Sostituisci con esercizio più sicuro
                const safeAlternatives: Record<string, string> = {
                  'Military Press': 'Lateral Raises (leggero)',
                  'Shoulder Press Manubri': 'Front Raises',
                  'Panca Piana': 'Push-up su Ginocchia (ROM ridotto)',
                  'Trazioni': 'Lat Machine (ROM ridotto)',
                  'Pike Push-up': 'Shoulder Mobility Work'
                };
                if (safeAlternatives[ex.name]) {
                  adapted.name = safeAlternatives[ex.name];
                  adaptationNotes.push(`⚠️ DOLORE SPALLA: Esercizio sostituito`);
                }
              } else if (intensity >= 4) {
                adapted.sets = Math.max(1, ex.sets - 1);
                adapted.intensity = 'RPE 5-6 (ridotto)';
                adaptationNotes.push(`🩹 Dolore spalla: -1 set, intensità ridotta`);
              } else {
                adaptationNotes.push(`⚡ Dolore spalla lieve: Warm-up scapolare 5min`);
              }
            }
            break;

          case 'elbow':
            if (['horizontal_push', 'vertical_pull', 'horizontal_pull'].includes(ex.pattern)) {
              if (intensity >= 7) {
                adapted.reps = typeof ex.reps === 'number' ? Math.floor(ex.reps * 0.7) : ex.reps;
                adapted.intensity = 'RPE 4-5 (molto ridotto)';
                adaptationNotes.push(`⚠️ DOLORE GOMITO: Volume ridotto 30%`);
              } else if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore gomito: ROM ridotto, no lockout`);
              }
            }
            break;

          case 'wrist':
            if (ex.pattern === 'horizontal_push') {
              if (intensity >= 7) {
                if (ex.name.includes('Push-up')) {
                  adapted.name = 'Push-up su Pugni Chiusi';
                  adaptationNotes.push(`⚠️ DOLORE POLSO: Push-up su pugni`);
                }
              } else if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore polso: Usa wrist wraps o pugni chiusi`);
              }
            }
            break;

          case 'lower_back':
            if (['lower_pull', 'lower_push'].includes(ex.pattern)) {
              if (intensity >= 7) {
                const safeAlternatives: Record<string, string> = {
                  'Squat (Bilanciere)': 'Goblet Squat (leggero)',
                  'Stacchi Rumeni': 'Glute Bridge',
                  'Good Morning': 'Bird Dog (isometrico)'
                };
                if (safeAlternatives[ex.name]) {
                  adapted.name = safeAlternatives[ex.name];
                  adaptationNotes.push(`⚠️ DOLORE SCHIENA: Esercizio sostituito`);
                }
              } else if (intensity >= 4) {
                adapted.sets = Math.max(2, ex.sets - 1);
                adaptationNotes.push(`🩹 Dolore schiena: ROM ridotto, no flexion completa`);
              } else {
                adaptationNotes.push(`⚡ Dolore schiena lieve: Warm-up core 5min`);
              }
            }
            break;

          case 'knee':
            if (ex.pattern === 'lower_push') {
              if (intensity >= 7) {
                const safeAlternatives: Record<string, string> = {
                  'Squat (Bilanciere)': 'Wall Sit (isometrico)',
                  'Bulgarian Split Squat': 'Step-up (basso)',
                  'Leg Press': 'Leg Extension (leggero)'
                };
                if (safeAlternatives[ex.name]) {
                  adapted.name = safeAlternatives[ex.name];
                  adaptationNotes.push(`⚠️ DOLORE GINOCCHIO: Esercizio sostituito`);
                }
              } else if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore ginocchio: Profondità ridotta (1/2 squat)`);
              }
            }
            break;

          case 'hip':
            if (ex.pattern === 'lower_push') {
              if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore anca: ROM ridotto, stance più stretta`);
              }
            }
            break;

          case 'upper_back':
            if (['horizontal_pull', 'vertical_pull'].includes(ex.pattern)) {
              if (intensity >= 7) {
                adapted.sets = Math.max(1, ex.sets - 1);
                adapted.intensity = 'RPE 5-6 (ridotto)';
                adaptationNotes.push(`⚠️ DOLORE DORSO: Volume ridotto, evita sovraccarico`);
              } else if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore dorso: ROM controllato, no overstretch`);
              } else {
                adaptationNotes.push(`⚡ Dolore dorso lieve: Warm-up scapole + thoracic mobility`);
              }
            }
            break;

          case 'ankle':
            if (ex.pattern === 'lower_push') {
              if (intensity >= 7) {
                const safeAlternatives: Record<string, string> = {
                  'Squat (Bilanciere)': 'Leg Press (piedi alti)',
                  'Bulgarian Split Squat': 'Leg Extension',
                  'Air Squat + Jump': 'Seated Leg Press',
                  'Pistol Squat Assistito': 'Single Leg Press'
                };
                if (safeAlternatives[ex.name]) {
                  adapted.name = safeAlternatives[ex.name];
                  adaptationNotes.push(`⚠️ DOLORE CAVIGLIA: Esercizio sostituito (no ankle mobility)`);
                }
              } else if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore caviglia: ROM ridotto, stance più ampia, talloni rialzati`);
              } else {
                adaptationNotes.push(`⚡ Dolore caviglia lieve: Warm-up ankle mobility 5min`);
              }
            }
            break;

          case 'neck':
            if (ex.pattern === 'vertical_pull') {
              if (intensity >= 4) {
                adaptationNotes.push(`🩹 Dolore collo: Testa neutra, no protrazione`);
              }
            }
            break;
        }
      });

      if (adaptationNotes.length > 0) {
        adapted.notes = adaptationNotes.join(' | ') + (ex.notes ? ` | ${ex.notes}` : '');
      }

      return adapted;
    });

    // Return corrective exercises + adapted main exercises
    return [...correctiveExercises, ...adaptedMainExercises];
  };

  // Adapt exercises based on menstrual cycle phase
  const adaptExercisesForCycle = (exercisesToAdapt: Exercise[]): Exercise[] => {
    if (menstrualPhase === 'none') return exercisesToAdapt;

    console.log('🩸 Adapting exercises for menstrual cycle:', menstrualPhase, `Day ${cycleDayNumber}`);

    let volumeMultiplier = 1.0;
    let intensityAdjustment = '';
    let cycleNotes: string[] = [];

    switch (menstrualPhase) {
      case 'follicular': // Days 6-13: High energy, best performance
        volumeMultiplier = 1.0;
        intensityAdjustment = 'RPE 7-9 (normal/alto)';
        cycleNotes.push('💪 Fase Follicolare: Energia alta, ottimale per progressione');
        break;

      case 'ovulation': // Days 14-16: Peak energy, max strength
        volumeMultiplier = 1.1; // Slightly increase volume
        intensityAdjustment = 'RPE 8-9 (push it!)';
        cycleNotes.push('🔥 Ovulazione: Picco energia, max performance');
        break;

      case 'luteal': // Days 17-28: Energy drops, more fatigue
        volumeMultiplier = 0.85; // Reduce volume 15%
        intensityAdjustment = 'RPE 6-7 (moderato)';
        cycleNotes.push('⚠️ Fase Luteale: Energia ridotta, focus su tecnica');
        break;

      case 'menstrual': // Days 1-5: Bleeding, cramps, low energy
        volumeMultiplier = 0.70; // Reduce volume 30%
        intensityAdjustment = 'RPE 4-6 (leggero)';
        cycleNotes.push('🩸 Mestruale: Riduci intensità, ascolta il corpo');
        break;

      case 'menopause': // Menopausa: focus resistenza, recupero, bone density
        volumeMultiplier = 0.95; // Slight reduction (-5%)
        intensityAdjustment = 'RPE 6-7 (moderato, focus resistenza)';
        cycleNotes.push('🧘‍♀️ Menopausa: Focus resistenza e densità ossea, +20% rest');
        break;
    }

    return exercisesToAdapt.map(ex => {
      const adapted = { ...ex };

      // Adjust volume based on cycle phase
      if (menstrualPhase === 'ovulation') {
        // Slightly increase sets during ovulation (peak performance)
        adapted.sets = Math.min(ex.sets + 1, ex.sets + 1);
      } else if (menstrualPhase === 'luteal') {
        // Reduce sets during luteal phase
        adapted.sets = Math.max(Math.floor(ex.sets * volumeMultiplier), 2);
        adapted.rest = increaseRest(ex.rest); // More rest
      } else if (menstrualPhase === 'menstrual') {
        // Significantly reduce sets during menstruation
        adapted.sets = Math.max(Math.floor(ex.sets * volumeMultiplier), 1);
        adapted.rest = increaseRest(ex.rest);

        // Avoid intense core work if cramping
        if (ex.pattern === 'core' && cycleDayNumber <= 3) {
          adapted.intensity = 'RPE 3-4 (molto leggero)';
          adapted.notes = '🩸 Crampi? Sostituisci con stretching dolce | ' + (ex.notes || '');
        }
      } else if (menstrualPhase === 'menopause') {
        // Menopause: slight volume reduction, increased rest for recovery
        adapted.sets = Math.max(Math.floor(ex.sets * volumeMultiplier), 2);
        adapted.rest = increaseRest(ex.rest); // +30s rest
      }

      // Update intensity recommendation
      if (intensityAdjustment && menstrualPhase !== 'follicular') {
        adapted.intensity = intensityAdjustment;
      }

      // Add cycle-specific notes
      if (cycleNotes.length > 0 && !adapted.notes?.includes(cycleNotes[0])) {
        adapted.notes = cycleNotes[0] + (adapted.notes ? ` | ${adapted.notes}` : '');
      }

      return adapted;
    });
  };

  // Helper: Increase rest time
  const increaseRest = (currentRest: string): string => {
    const seconds = parseInt(currentRest.replace(/\D/g, ''));
    return `${seconds + 30}s`;
  };

  // Start workout after pre-check
  const handleStartWorkout = () => {
    let adaptedExercises = exercises;

    // STEP 1: Adapt for pain if needed
    if (painAreas.length > 0) {
      adaptedExercises = adaptExercisesForPain(adaptedExercises);

      toast.success('🩹 Esercizi adattati per dolore', {
        description: `${painAreas.length} zona/e con adattamenti`
      });
    }

    // STEP 2: Adapt for menstrual cycle if tracked
    if (menstrualPhase !== 'none') {
      adaptedExercises = adaptExercisesForCycle(adaptedExercises);

      const cycleMessages = {
        follicular: '💪 Fase Follicolare: Energia ottimale',
        ovulation: '🔥 Ovulazione: Picco performance',
        luteal: '⚠️ Fase Luteale: Ridotta intensità 15%',
        menstrual: '🩸 Mestruale: Ridotto volume 30%'
      };

      toast.info(cycleMessages[menstrualPhase], {
        description: `Giorno ${cycleDayNumber} del ciclo`
      });
    }

    setExercises(adaptedExercises);
    setShowPreWorkout(false);
    setWorkoutStartTime(new Date());

    const painSummary = painAreas.length > 0
      ? ` • Pain: ${painAreas.map(p => p.area).join(', ')}`
      : '';

    const cycleSummary = menstrualPhase !== 'none'
      ? ` • Cycle: ${menstrualPhase} (day ${cycleDayNumber})`
      : '';

    toast.success('💪 Workout iniziato!', {
      description: `Mood: ${mood} • Sleep: ${sleepQuality}/10${locationSwitched ? ' • Casa' : ''}${painSummary}${cycleSummary}`
    });
  };

  // Rest timer countdown
  useEffect(() => {
    if (restTimerActive && restTimeRemaining > 0) {
      const timer = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            toast.success('⏰ Rest completato!', { description: 'Pronto per il prossimo set' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restTimerActive, restTimeRemaining]);

  // Handle set completion
  const handleSetComplete = () => {
    if (currentReps === 0) {
      toast.error('Inserisci il numero di reps completate');
      return;
    }

    // Initialize if not exists
    if (!currentExercise) return;

    if (!setLogs[currentExercise.name]) {
      setSetLogs(prev => ({ ...prev, [currentExercise.name]: [] }));
    }

    setShowRPEInput(true);
  };

  // Analyze RPE and provide suggestions
  const analyzeRPEAndSuggest = (rpe: number) => {
    const exerciseName = currentExercise.name;
    const currentSetNumber = currentSet;
    const totalSetsPlanned = currentTargetSets;

    // HIGH RPE (9-10) - Reduce volume/intensity
    if (rpe >= 9) {
      if (currentSetNumber < totalSetsPlanned) {
        // Still have sets remaining - suggest reducing
        const remainingSets = totalSetsPlanned - currentSetNumber;
        setSuggestion({
          type: 'reduce',
          message: `RPE troppo alto! Hai ancora ${remainingSets} set. Vuoi ridurre?`,
          newSets: totalSetsPlanned - 1, // Remove 1 set
          newReps: Math.max(targetReps - 2, targetReps * 0.8), // Reduce reps
          newRest: increaseRest(currentExercise.rest) // More rest
        });
      } else {
        // Last set - just note high fatigue
        setSuggestion({
          type: 'reduce',
          message: 'RPE molto alto. Considera più recupero per il prossimo workout.',
          newRest: increaseRest(currentExercise.rest)
        });
      }
    }
    // LOW RPE (1-4) - Increase volume
    else if (rpe <= 4 && currentSetNumber === totalSetsPlanned) {
      // Last set but too easy - suggest adding a set
      setSuggestion({
        type: 'increase',
        message: 'RPE troppo basso! Hai riserve. Vuoi aggiungere 1 set?',
        newSets: totalSetsPlanned + 1,
        newReps: targetReps + 2
      });
    }
    // OPTIMAL RPE (5-8)
    else {
      setSuggestion({
        type: 'maintain',
        message: '✅ RPE ottimale! Continua così.',
      });
    }
  };

  // Helper: Decrease rest time
  const decreaseRest = (currentRest: string): string => {
    const seconds = parseInt(currentRest.replace(/\D/g, ''));
    return `${Math.max(30, seconds - 15)}s`;
  };

  // Handle RPE submission
  const handleRPESubmit = () => {
    if (!currentExercise) return;

    // Log the set
    const newSetLog: SetLog = {
      set_number: currentSet,
      reps_completed: currentReps,
      weight_used: currentWeight || undefined,
      rpe: currentRPE,
      adjusted: false
    };

    setSetLogs(prev => ({
      ...prev,
      [currentExercise.name]: [...(prev[currentExercise.name] || []), newSetLog]
    }));

    // Analyze RPE and provide suggestions
    analyzeRPEAndSuggest(currentRPE);

    // Reset for next set
    setShowRPEInput(false);
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
  };

  // Apply suggestion (adjust program)
  const applySuggestion = () => {
    if (!suggestion || !currentExercise) return;

    if (suggestion.type === 'reduce' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toast.success('Volume ridotto', {
        description: `${currentExercise.name}: ${suggestion.newSets} sets`
      });
    } else if (suggestion.type === 'increase' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toast.success('Volume aumentato', {
        description: `${currentExercise.name}: ${suggestion.newSets} sets`
      });
    }

    // Mark last set as adjusted
    setSetLogs(prev => {
      const exerciseLogs = prev[currentExercise.name] || [];
      const lastSet = exerciseLogs[exerciseLogs.length - 1];
      if (lastSet) {
        lastSet.adjusted = true;
        lastSet.adjustment_reason = suggestion.message;
      }
      return { ...prev };
    });

    setSuggestion(null);
    proceedToNextSet();
  };

  // Dismiss suggestion and continue
  const dismissSuggestion = () => {
    setSuggestion(null);
    proceedToNextSet();
  };

  // Proceed to next set or exercise
  const proceedToNextSet = () => {
    if (!currentExercise) return;

    // Check if more sets remaining
    if (currentSet < currentTargetSets) {
      setCurrentSet(prev => prev + 1);

      // Start rest timer (aumentato +20% per menopausa)
      let restSeconds = parseInt(currentExercise.rest.replace(/\D/g, ''));
      if (menstrualPhase === 'menopause') {
        restSeconds = Math.round(restSeconds * 1.2); // +20% rest per menopausa
        console.log('🧘‍♀️ Menopause: increased rest time by 20%');
      }
      setRestTimeRemaining(restSeconds);
      setRestTimerActive(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        toast.success(`✅ ${currentExercise.name} completato!`, {
          description: 'Prossimo esercizio'
        });
      } else {
        // Workout complete!
        handleWorkoutComplete();
      }
    }
  };

  // Complete entire workout
  const handleWorkoutComplete = async () => {
    if (!workoutStartTime) return;

    const duration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60);
    const avgRPE = calculateAverageRPE();

    toast.success('🎉 Workout completato!', {
      description: `${duration} minuti • RPE medio: ${avgRPE}`
    });

    // Save to database via autoRegulationService
    try {
      const exerciseLogs = Object.entries(setLogs).map(([exerciseName, sets]) => {
        const exercise = exercises.find(ex => ex.name === exerciseName)!;
        const avgRPE = sets.reduce((sum, s) => sum + s.rpe, 0) / sets.length;

        return {
          exercise_name: exerciseName,
          pattern: exercise.pattern,
          sets_completed: sets.length,
          reps_completed: Math.round(sets.reduce((sum, s) => sum + s.reps_completed, 0) / sets.length),
          weight_used: sets[0].weight_used,
          exercise_rpe: avgRPE,
          difficulty_vs_baseline: avgRPE > 8 ? 'harder' as const : avgRPE < 5 ? 'easier' as const : 'as_expected' as const,
          notes: sets.some(s => s.adjusted) ? 'Volume auto-adjusted during workout' : ''
        };
      });

      // Build workout notes with pain tracking
      const painNote = painAreas.length > 0
        ? `Pain areas: ${painAreas.map(p => `${p.area}(${p.intensity}/10)`).join(', ')}`
        : '';

      const workoutNotes = [
        'Live workout with real-time RPE feedback',
        painNote
      ].filter(Boolean).join(' | ');

      await autoRegulationService.logWorkout(userId, programId, {
        day_name: dayName,
        split_type: currentExercise?.pattern || 'Full Body',
        session_duration_minutes: duration,
        session_rpe: avgRPE,
        exercises: exerciseLogs,
        mood: mood as any,
        sleep_quality: sleepQuality,
        notes: workoutNotes
      });

      if (onWorkoutComplete) {
        onWorkoutComplete(exerciseLogs);
      }

      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Errore salvataggio workout');
    }
  };

  // Calculate average RPE across all sets
  const calculateAverageRPE = (): number => {
    const allRPEs = Object.values(setLogs).flatMap(sets => sets.map(s => s.rpe));
    if (allRPEs.length === 0) return 7;
    return Math.round((allRPEs.reduce((a, b) => a + b, 0) / allRPEs.length) * 10) / 10;
  };

  // Skip exercise
  const skipExercise = () => {
    if (confirm(`Vuoi saltare "${currentExercise?.name}"?`)) {
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
      } else {
        handleWorkoutComplete();
      }
    }
  };

  if (!open) return null;

  // PRE-WORKOUT CHECK-IN
  if (showPreWorkout) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">👋 Pre-Workout Check-In</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm mb-3">Come ti senti oggi?</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'great', emoji: '🔥', label: 'Ottimo' },
                { value: 'good', emoji: '😊', label: 'Bene' },
                { value: 'ok', emoji: '😐', label: 'OK' },
                { value: 'tired', emoji: '😴', label: 'Stanco' }
              ].map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => setMood(value as any)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    mood === value
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Qualità del sonno</span>
              <span className="text-white font-bold">{sleepQuality}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="grid grid-cols-10 gap-1 mt-1">
              {[1,2,3,4,5,6,7,8,9,10].map(val => (
                <div
                  key={val}
                  className={`text-center text-xs ${sleepQuality === val ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>

          {/* PAIN SCREENING */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-slate-300 text-sm font-semibold">🩹 Hai dolori oggi?</label>
              {painAreas.length > 0 && (
                <span className="text-xs text-red-400 font-bold">
                  {painAreas.length} zona/e
                </span>
              )}
            </div>

            {/* Body Map - Pain Area Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { key: 'shoulder', label: 'Spalla', color: 'red' },
                { key: 'elbow', label: 'Gomito', color: 'orange' },
                { key: 'wrist', label: 'Polso', color: 'yellow' },
                { key: 'upper_back', label: 'Dorso', color: 'blue' },
                { key: 'lower_back', label: 'Schiena Bassa', color: 'red' },
                { key: 'knee', label: 'Ginocchio', color: 'orange' },
                { key: 'hip', label: 'Anca', color: 'yellow' },
                { key: 'ankle', label: 'Caviglia', color: 'amber' },
                { key: 'neck', label: 'Collo', color: 'purple' }
              ].map(({ key, label, color }) => {
                const isPainful = painAreas.find(p => p.area === key);
                const intensity = isPainful?.intensity || 5;

                return (
                  <div key={key}>
                    <button
                      onClick={() => handlePainAreaToggle(key)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                        isPainful
                          ? intensity >= 7
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : intensity >= 4
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold">{label}</div>
                          {isPainful && (
                            <div className="text-xs opacity-70">
                              Intensità: {intensity}/10
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Pain Intensity Slider (shown when area selected) */}
                    {isPainful && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 px-2"
                      >
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={intensity}
                          onChange={(e) => handlePainIntensityChange(key, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Lieve</span>
                          <span>Severo</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pain Info Box */}
            {painAreas.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-xs font-semibold mb-1">
                  ⚠️ Esercizi adattati automaticamente
                </p>
                <p className="text-slate-400 text-xs">
                  {painAreas.filter(p => p.intensity >= 7).length > 0 && '• Dolore alto (7-10): Esercizi sostituiti'}
                  {painAreas.filter(p => p.intensity >= 4 && p.intensity < 7).length > 0 && ' • Dolore medio (4-6): Volume ridotto'}
                  {painAreas.filter(p => p.intensity < 4).length > 0 && ' • Dolore lieve (1-3): Warm-up extra'}
                </p>
              </div>
            )}
          </div>

          {/* MENSTRUAL CYCLE TRACKING (for female athletes) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-300 text-sm font-semibold">🩸 Traccia Ciclo Mestruale</label>
              {menstrualPhase !== 'none' && (
                <span className="text-xs text-pink-400 font-bold">
                  Giorno {cycleDayNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              I numeri indicano i giorni del ciclo (es: 6-13 = giorni dal 6° al 13° del tuo ciclo mestruale)
            </p>

            {/* Cycle Phase Selection */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'none', label: 'Non Tracciare', emoji: '⚪', color: 'gray', days: '' },
                { key: 'follicular', label: 'Follicolare', emoji: '💪', color: 'green', days: '(6-13)' },
                { key: 'ovulation', label: 'Ovulazione', emoji: '🔥', color: 'orange', days: '(14-16)' },
                { key: 'luteal', label: 'Luteale', emoji: '⚠️', color: 'yellow', days: '(17-28)' },
                { key: 'menstrual', label: 'Mestruale', emoji: '🩸', color: 'red', days: '(1-5)' }
              ].map(({ key, label, emoji, color, days }) => (
                <button
                  key={key}
                  onClick={() => {
                    setMenstrualPhase(key as any);
                    if (key === 'follicular') setCycleDayNumber(10);
                    else if (key === 'ovulation') setCycleDayNumber(14);
                    else if (key === 'luteal') setCycleDayNumber(21);
                    else if (key === 'menstrual') setCycleDayNumber(3);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    menstrualPhase === key
                      ? color === 'green'
                        ? 'bg-green-500/20 border-green-500 text-green-300'
                        : color === 'orange'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : color === 'yellow'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : color === 'red'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold">{label}</div>
                      {days && <div className="text-xs opacity-60">{days}</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Cycle Day Number Slider (shown when phase selected) */}
            {menstrualPhase !== 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Giorno del ciclo</span>
                  <span className="text-white font-bold">{cycleDayNumber}/28</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="28"
                  value={cycleDayNumber}
                  onChange={(e) => {
                    const day = parseInt(e.target.value);
                    setCycleDayNumber(day);
                    // Auto-detect phase based on day
                    if (day >= 1 && day <= 5) setMenstrualPhase('menstrual');
                    else if (day >= 6 && day <= 13) setMenstrualPhase('follicular');
                    else if (day >= 14 && day <= 16) setMenstrualPhase('ovulation');
                    else setMenstrualPhase('luteal');
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </motion.div>
            )}

            {/* Cycle Info Box */}
            {menstrualPhase !== 'none' && (
              <div className={`mt-3 rounded-lg p-3 border ${
                menstrualPhase === 'follicular'
                  ? 'bg-green-500/10 border-green-500/30'
                  : menstrualPhase === 'ovulation'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : menstrualPhase === 'luteal'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${
                  menstrualPhase === 'follicular' ? 'text-green-300' :
                  menstrualPhase === 'ovulation' ? 'text-orange-300' :
                  menstrualPhase === 'luteal' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {menstrualPhase === 'follicular' && '💪 Energia alta - Ottimale per progressione'}
                  {menstrualPhase === 'ovulation' && '🔥 Picco performance - Push it!'}
                  {menstrualPhase === 'luteal' && '⚠️ Energia ridotta - Intensità -15%'}
                  {menstrualPhase === 'menstrual' && '🩸 Crampi/Fatica - Volume -30%'}
                </p>
                <p className="text-slate-400 text-xs">
                  {menstrualPhase === 'follicular' && 'Allenamenti intensi, volume alto, focus forza'}
                  {menstrualPhase === 'ovulation' && 'Max volume/intensità, sfrutta il picco ormonale'}
                  {menstrualPhase === 'luteal' && 'Ridurre intensità, più recupero, focus tecnica'}
                  {menstrualPhase === 'menstrual' && 'Evitare core intenso, stretching/mobilità OK'}
                </p>
              </div>
            )}
          </div>

          {/* Location Switch Button (VIOLA) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLocationSwitch(true)}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
          >
            🏠 Cambia Location per Oggi
          </motion.button>

          {locationSwitched && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <p className="text-purple-300 text-sm font-semibold">
                ✅ Sessione adattata per casa!
              </p>
            </div>
          )}

          {/* Start Workout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartWorkout}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            Inizia Allenamento
          </motion.button>

          {/* Location Switch Modal */}
          {showLocationSwitch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowLocationSwitch(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">🏠 Attrezzatura Casa Disponibile</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { key: 'dumbbell', label: 'Manubri', icon: '🏋️' },
                    { key: 'barbell', label: 'Bilanciere', icon: '⚡' },
                    { key: 'pullUpBar', label: 'Sbarra', icon: '🔥' },
                    { key: 'rings', label: 'Anelli', icon: '⭕' },
                    { key: 'bands', label: 'Elastici', icon: '🎗️' },
                    { key: 'kettlebell', label: 'Kettlebell', icon: '🎯' }
                  ].map(({ key, label, icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        homeEquipment[key as keyof typeof homeEquipment]
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={homeEquipment[key as keyof typeof homeEquipment]}
                        onChange={(e) => setHomeEquipment(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-blue-300 text-sm">
                    💡 Gli esercizi verranno adattati automaticamente in base all'attrezzatura disponibile
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLocationSwitch(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSessionLocationSwitch}
                    disabled={switchingLocation}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    {switchingLocation ? 'Adattamento...' : 'Conferma'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // MAIN WORKOUT UI (after pre-check)
  if (!currentExercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">💪 Live Workout</h2>
            <p className="text-slate-400 text-sm">{dayName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Esercizio {currentExerciseIndex + 1}/{totalExercises}</span>
            <span>Set {currentSet}/{currentTargetSets}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentExerciseIndex * 100) + (currentSet / currentTargetSets * 100)) / totalExercises}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        <motion.div
          key={currentExercise.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700"
        >
          <h3 className="text-2xl font-bold text-white mb-2">{currentExercise.name}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm">Target</p>
              <p className="text-emerald-400 font-bold text-xl">{targetReps} reps</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Sets</p>
              <p className="text-blue-400 font-bold text-xl">{currentSet}/{currentTargetSets}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Rest</p>
              <p className="text-purple-400 font-bold text-xl">{currentExercise.rest}</p>
            </div>
          </div>
        </motion.div>

        {/* Rest Timer */}
        {restTimerActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-blue-300 font-bold text-lg mb-2">⏱️ Rest Timer</p>
            <p className="text-5xl font-bold text-blue-400">{restTimeRemaining}s</p>
            <button
              onClick={() => {
                setRestTimerActive(false);
                setRestTimeRemaining(0);
              }}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Skip Rest →
            </button>
          </motion.div>
        )}

        {/* Set Input (if not showing RPE) */}
        {!showRPEInput && !restTimerActive && !suggestion && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Reps Completate</label>
              <input
                type="number"
                value={currentReps || ''}
                onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-2xl font-bold text-center"
                placeholder={`${targetReps}`}
                autoFocus
              />
            </div>

            {currentExercise.pattern !== 'core' && (
              <div>
                <label className="block text-slate-300 text-sm mb-2">Peso (kg) - Opzionale</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="0"
                />
              </div>
            )}

            <button
              onClick={handleSetComplete}
              disabled={currentReps === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Set Completato
            </button>
          </div>
        )}

        {/* RPE Input */}
        {showRPEInput && !suggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 font-bold mb-2">Come ti sei sentito?</p>
              <p className="text-slate-400 text-sm">RPE: Rate of Perceived Exertion (1-10)</p>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Molto Facile</span>
                <span className="text-2xl font-bold text-white">{currentRPE}</span>
                <span>Massimo Sforzo</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRPE}
                onChange={(e) => setCurrentRPE(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="grid grid-cols-10 gap-1 mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map(val => (
                  <div
                    key={val}
                    className={`text-center text-xs ${currentRPE === val ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRPESubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300"
            >
              Conferma RPE
            </button>
          </motion.div>
        )}

        {/* Auto-Regulation Suggestion */}
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl p-4 mb-6 border ${
                suggestion.type === 'reduce'
                  ? 'bg-red-500/10 border-red-500/30'
                  : suggestion.type === 'increase'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {suggestion.type === 'reduce' && <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                {suggestion.type === 'increase' && <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
                {suggestion.type === 'maintain' && <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />}

                <div className="flex-1">
                  <p className={`font-bold mb-1 ${
                    suggestion.type === 'reduce' ? 'text-red-300' :
                    suggestion.type === 'increase' ? 'text-emerald-300' :
                    'text-blue-300'
                  }`}>
                    {suggestion.type === 'reduce' && '⚠️ Auto-Regulation Suggerita'}
                    {suggestion.type === 'increase' && '📈 Potenziale da Esprimere'}
                    {suggestion.type === 'maintain' && '✅ RPE Ottimale'}
                  </p>
                  <p className="text-slate-300 text-sm">{suggestion.message}</p>

                  {(suggestion.newSets || suggestion.newReps) && (
                    <div className="mt-2 text-xs text-slate-400">
                      {suggestion.newSets && <span>Sets: {currentTargetSets} → {suggestion.newSets}</span>}
                      {suggestion.newReps && <span className="ml-3">Reps: {targetReps} → {suggestion.newReps}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {suggestion.type !== 'maintain' && (
                  <button
                    onClick={applySuggestion}
                    className={`flex-1 font-bold py-3 rounded-lg transition-all duration-300 ${
                      suggestion.type === 'reduce'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    Applica Modifica
                  </button>
                )}

                <button
                  onClick={dismissSuggestion}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  {suggestion.type === 'maintain' ? 'Continua' : 'Ignora'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Set History for Current Exercise */}
        {setLogs[currentExercise.name]?.length > 0 && (
          <div className="bg-slate-800/30 rounded-xl p-4 mb-4">
            <h4 className="text-slate-400 text-sm mb-2">Set Completati:</h4>
            <div className="space-y-1">
              {setLogs[currentExercise.name].map((set, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-300">Set {set.set_number}</span>
                  <span className="text-emerald-400">{set.reps_completed} reps</span>
                  <span className={`${
                    set.rpe >= 9 ? 'text-red-400' :
                    set.rpe <= 4 ? 'text-blue-400' :
                    'text-slate-400'
                  }`}>
                    RPE {set.rpe}
                  </span>
                  {set.adjusted && <span className="text-amber-400 text-xs">⚡ Adjusted</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-2">
          <button
            onClick={skipExercise}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
          >
            Salta Esercizio
          </button>

          <button
            onClick={() => {
              if (confirm('Vuoi terminare il workout?')) {
                handleWorkoutComplete();
              }
            }}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Termina Workout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
