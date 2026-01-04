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
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Play, Pause, SkipForward, X, Info, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { autoRegulationService } from '@trainsmart/shared';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../lib/i18n';
import { getExerciseDescription } from '../utils/exerciseDescriptions';
import painManagementService from '../lib/painManagementService';
import HybridRecoveryModal from './HybridRecoveryModal';
import VideoUploadModal from './VideoUploadModal';
import ExerciseDislikeModal from './ExerciseDislikeModal';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import { getVariantsForExercise } from '../utils/exerciseVariants';

interface Exercise {
  name: string;
  pattern: string;
  sets: number;
  reps: number | string;
  rest: string;
  intensity: string;
  notes?: string;
  weight?: number | string; // Peso suggerito in kg
  targetRir?: number; // RIR target programmato (0-4)
}

// Helper: Extract BASE target RIR from exercise notes (e.g., "RIR 2" or "RIR 0")
// This is the target for the LAST set - earlier sets will have higher RIR
const extractBaseTargetRIR = (notes?: string, intensity?: string): number => {
  // First check notes for explicit RIR
  if (notes) {
    const rirMatch = notes.match(/RIR\s*(\d)/i);
    if (rirMatch) {
      return parseInt(rirMatch[1]);
    }
  }

  // Fallback: infer from intensity string
  if (intensity) {
    const intensityLower = intensity.toLowerCase();
    if (intensityLower.includes('cedimento') || intensityLower.includes('failure') || intensityLower.includes('max')) {
      return 0;
    }
    if (intensityLower.includes('heavy') || intensityLower.includes('pesante')) {
      return 1;
    }
    if (intensityLower.includes('moderate') || intensityLower.includes('moderato')) {
      return 2;
    }
    if (intensityLower.includes('light') || intensityLower.includes('leggero') || intensityLower.includes('volume')) {
      return 3;
    }
  }

  // Default: RIR 2 (common hypertrophy target)
  return 2;
};

// Legacy compatibility
const extractTargetRIR = extractBaseTargetRIR;

interface SetLog {
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rpe: number;
  rpe_adjusted?: number; // RPE normalizzato per fattori contestuali
  rir_perceived?: number; // RIR percepito dall'utente
  adjusted: boolean;
  adjustment_reason?: string;
}

// Funzione per calcolare il fattore di normalizzazione RPE
const calculateContextAdjustment = (
  stressLevel: number,
  sleepQuality: number,
  nutritionQuality: 'good' | 'normal' | 'poor',
  hydration: 'good' | 'normal' | 'poor'
): number => {
  let adjustment = 0;

  // Stress alto inflaziona RPE (sottraiamo per normalizzare)
  if (stressLevel >= 8) adjustment -= 1.0;
  else if (stressLevel >= 7) adjustment -= 0.5;

  // Sonno scarso inflaziona RPE
  if (sleepQuality <= 3) adjustment -= 1.0;
  else if (sleepQuality <= 5) adjustment -= 0.5;

  // Nutrizione scarsa inflaziona RPE
  if (nutritionQuality === 'poor') adjustment -= 0.5;
  else if (nutritionQuality === 'good') adjustment += 0.25;

  // Idratazione scarsa inflaziona RPE
  if (hydration === 'poor') adjustment -= 0.5;
  else if (hydration === 'good') adjustment += 0.25;

  return adjustment;
};

// Helper function to parse rest time strings to seconds
// Handles formats: "90s", "60-90s", "2-3min", "3-5min"
const parseRestTimeToSeconds = (rest: string): number => {
  // Remove whitespace and convert to lowercase
  const cleaned = rest.trim().toLowerCase();

  // Check if it's in minutes format
  if (cleaned.includes('min')) {
    // Extract first number (in case of range like "2-3min")
    const match = cleaned.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      return minutes * 60; // Convert to seconds
    }
  }

  // Otherwise, it's in seconds format (e.g., "90s" or "60-90s")
  // Extract first number (in case of range like "60-90s")
  const match = cleaned.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  // Fallback: 90 seconds
  return 90;
};

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
  const { t } = useTranslation();

  // Pre-workout state
  const [showPreWorkout, setShowPreWorkout] = useState(true);
  const [mood, setMood] = useState<'great' | 'good' | 'ok' | 'tired'>('good');
  const [sleepQuality, setSleepQuality] = useState(7);

  // NEW: Contextual feedback
  const [stressLevel, setStressLevel] = useState(5);
  const [nutritionQuality, setNutritionQuality] = useState<'good' | 'normal' | 'poor'>('normal');
  const [hydration, setHydration] = useState<'good' | 'normal' | 'poor'>('normal');
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
  const [isFemale, setIsFemale] = useState(false);

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
  const [currentRIR, setCurrentRIR] = useState(2); // RIR percepito (0-5)
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [showExerciseDescription, setShowExerciseDescription] = useState(false);

  // Video upload modal state
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  // Pain tracking state
  const [currentPainLevel, setCurrentPainLevel] = useState(0); // 0-10 scale
  const [showPainAlert, setShowPainAlert] = useState(false);
  const [painAdaptations, setPainAdaptations] = useState<any[]>([]);

  // Hybrid Recovery Modal state
  const [showHybridRecoveryModal, setShowHybridRecoveryModal] = useState(false);
  const [hybridRecoveryData, setHybridRecoveryData] = useState<{
    exerciseName: string;
    painLevel: number;
    sessions: number;
  } | null>(null);

  // Exercise Dislike Modal state
  const [showDislikeModal, setShowDislikeModal] = useState(false);
  const [adjustedWeights, setAdjustedWeights] = useState<Record<string, number>>({});

  // Adjustment state
  const [suggestion, setSuggestion] = useState<{
    type: 'reduce' | 'increase' | 'maintain';
    message: string;
    newSets?: number;
    newReps?: number;
    newRest?: string;
    weightAdjustment?: number; // Percentage adjustment for next session (+5 = increase 5%, -5 = decrease 5%)
  } | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const targetReps = typeof currentExercise?.reps === 'number'
    ? currentExercise.reps
    : parseInt(currentExercise?.reps?.split('-')[0] || '10');
  const exerciseInfo = currentExercise ? getExerciseDescription(currentExercise.name) : null;

  // Calculate adjusted sets (may be modified by auto-regulation)
  const [adjustedSets, setAdjustedSets] = useState<Record<string, number>>({});
  const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;

  // Fetch user gender for menstrual cycle tracking
  useEffect(() => {
    const fetchUserGender = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('onboarding_data')
            .eq('user_id', userData.user.id)
            .single();

          if (profileData?.onboarding_data?.personalInfo?.gender === 'F') {
            setIsFemale(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user gender:', error);
      }
    };

    fetchUserGender();
  }, []);

  // Fetch pain thresholds for exercises at workout start
  useEffect(() => {
    if (!userId || !open) return;

    const fetchPainThresholds = async () => {
      try {
        // Check each exercise for existing pain thresholds
        const thresholds = await Promise.all(
          initialExercises.map(ex =>
            painManagementService.getPainThreshold(userId, ex.name)
          )
        );

        // Log thresholds for debugging
        thresholds.forEach((threshold, i) => {
          if (threshold && threshold.last_pain_level > 0) {
            console.log(`🩹 Pain threshold found for ${initialExercises[i].name}:`, threshold);

            if (threshold.last_safe_weight) {
              console.log(`   Safe weight: ${threshold.last_safe_weight}kg`);
            }
            if (threshold.needs_physiotherapist_contact) {
              toast.warning(
                `⚠️ ${initialExercises[i].name}: contatta fisioterapista (dolore precedente ${threshold.last_pain_level}/10)`,
                { duration: 8000 }
              );
            }
          }
        });
      } catch (error) {
        console.error('Error fetching pain thresholds:', error);
      }
    };

    fetchPainThresholds();
  }, [userId, open, initialExercises]);

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

    // First pass: Add corrective exercises at the beginning (INDIVIDUAL exercises, not grouped)
    const correctiveExercises: Exercise[] = [];
    painAreas.forEach(({ area, intensity }) => {
      if (intensity >= 4) {
        const correctives = getCorrectiveExercises(area);
        if (correctives.length > 0) {
          // Create INDIVIDUAL corrective exercises, not a single grouped one
          correctives.forEach((corrective: string) => {
            correctiveExercises.push({
              name: corrective,  // ✅ Nome specifico dell'esercizio (es. "Dead Bugs 2x10/side")
              pattern: 'corrective',  // ✅ Pattern corretto
              sets: 2,
              reps: '10-15',
              rest: '30s',
              intensity: 'Low',
              notes: `🩹 Correttivo per ${area} - Esegui con focus sulla qualità`
            });
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
    if (restTimerActive) {
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
  }, [restTimerActive]);

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

  // ========================================================================
  // HYBRID RECOVERY HANDLERS
  // ========================================================================

  /**
   * Handler per attivazione Recovery Mode
   */
  const handleActivateRecovery = (bodyArea: string, affectedExercises: string[]) => {
    console.log('🔄 Hybrid Recovery activated:', {
      bodyArea,
      affectedExercises,
      currentExercise: currentExercise?.name
    });

    // TODO: Salvare su database exercise_recovery_status
    // Per ora, solo console log per debugging
    toast.success(
      `✅ Recovery Mode attivato per ${bodyArea}. ${affectedExercises.length} esercizi coinvolti.`,
      { duration: 6000 }
    );

    // Chiudi modal e salta esercizio corrente
    setShowHybridRecoveryModal(false);
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setShowRPEInput(false);
      setCurrentPainLevel(0);
      setPainAdaptations([]);
    }
  };

  /**
   * Handler per skippare esercizio senza attivare Recovery
   */
  const handleSkipExercise = () => {
    console.log('⏭️ Exercise skipped without recovery activation');

    toast.info('Esercizio saltato. Passiamo al prossimo.', { duration: 3000 });

    setShowHybridRecoveryModal(false);
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setShowRPEInput(false);
      setCurrentPainLevel(0);
      setPainAdaptations([]);
    }
  };

  // Analyze RIR feedback and provide suggestions
  // LOGIC: Only evaluate on LAST SET - intermediate sets just collect data
  // The system understands that RIR naturally decreases across sets at same weight
  const analyzeRPEAndSuggest = (rpe: number) => {
    const exerciseName = currentExercise.name;
    const currentSetNumber = currentSet;
    const totalSetsPlanned = currentTargetSets;
    const isLastSet = currentSetNumber === totalSetsPlanned;

    // Target RIR is for the LAST set
    const targetRIR = currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity);
    const perceivedRIR = currentRIR;

    console.log(`[RIR Analysis] ${exerciseName} Set ${currentSetNumber}/${totalSetsPlanned}:`, {
      rpe,
      perceivedRIR,
      targetRIR,
      isLastSet,
      action: isLastSet ? 'EVALUATE' : 'TRACK ONLY'
    });

    // ========================================
    // SET INTERMEDI: Solo tracking, no giudizio
    // Il sistema sa che RIR cala naturalmente tra i set
    // ========================================
    if (!isLastSet) {
      const setsRemaining = totalSetsPlanned - currentSetNumber;

      // Avviso solo se RIR è già molto basso (rischio di non completare)
      if (perceivedRIR <= 1 && setsRemaining >= 2) {
        setSuggestion({
          type: 'reduce',
          message: `⚠️ Set ${currentSetNumber}/${totalSetsPlanned}: RIR ${perceivedRIR} - Attenzione! Mancano ${setsRemaining} set. Considera di ridurre il carico per completarli.`,
          newRest: increaseRest(currentExercise.rest),
          weightAdjustment: 0 // Non modificare il programma, solo avviso
        });
      } else {
        // Feedback positivo - il sistema tiene traccia
        setSuggestion({
          type: 'maintain',
          message: `📊 Set ${currentSetNumber}/${totalSetsPlanned}: RIR ${perceivedRIR} registrato. Il sistema valuterà il carico sull'ultimo set (target: RIR ${targetRIR}).`,
        });
      }
      return;
    }

    // ========================================
    // ULTIMO SET: Valutazione e adattamento carico
    // Questo è il momento della verità
    // ========================================
    const rirDelta = perceivedRIR - targetRIR;

    // CASO 1: Troppo duro (RIR inferiore al target)
    if (rirDelta < 0) {
      const wentTooHard = Math.abs(rirDelta);

      if (wentTooHard >= 2) {
        // Significativamente oltre il target
        setSuggestion({
          type: 'reduce',
          message: `⚠️ Ultimo set: RIR ${perceivedRIR} vs target ${targetRIR} - Hai spinto ${wentTooHard} RIR oltre il programmato. Riduci peso 5% per la prossima sessione.`,
          newRest: increaseRest(currentExercise.rest),
          weightAdjustment: -5
        });
      } else {
        // Leggermente oltre (1 RIR) - accettabile se target era già vicino al cedimento
        if (targetRIR <= 1) {
          setSuggestion({
            type: 'maintain',
            message: `✅ Ultimo set: RIR ${perceivedRIR} - Target ${targetRIR} raggiunto! Il sistema ha considerato tutti i set precedenti.`,
          });
        } else {
          setSuggestion({
            type: 'maintain',
            message: `⚡ Ultimo set: RIR ${perceivedRIR} (target ${targetRIR}) - Leggermente più intenso, monitora il recupero.`,
            weightAdjustment: 0
          });
        }
      }
    }
    // CASO 2: Troppo facile (RIR superiore al target)
    else if (rirDelta > 0) {
      const tooEasy = rirDelta;

      if (tooEasy >= 2) {
        // Significativamente sotto il target - aumentare carico
        setSuggestion({
          type: 'increase',
          message: `💪 Ultimo set: RIR ${perceivedRIR} vs target ${targetRIR} - Avevi ancora ${tooEasy} rep in più! Aumenta peso 5% per la prossima sessione.`,
          weightAdjustment: targetRIR === 0 ? 7.5 : 5
        });
      } else {
        // Leggermente sotto (1 RIR)
        if (targetRIR <= 1) {
          setSuggestion({
            type: 'maintain',
            message: `⚡ Ultimo set: RIR ${perceivedRIR} (target ${targetRIR}) - Quasi! Prova a spingere 1 rep in più la prossima volta.`,
            weightAdjustment: 0
          });
        } else {
          setSuggestion({
            type: 'maintain',
            message: `✅ Ultimo set: RIR ${perceivedRIR} - Vicino al target ${targetRIR}. Carico adeguato.`,
          });
        }
      }
    }
    // CASO 3: Perfetto!
    else {
      if (targetRIR === 0) {
        setSuggestion({
          type: 'maintain',
          message: `🔥 PERFETTO! Ultimo set a cedimento (RIR 0) come programmato. Il sistema ha analizzato l'intera serie.`,
        });
      } else {
        setSuggestion({
          type: 'maintain',
          message: `🔥 PERFETTO! RIR ${perceivedRIR} sull'ultimo set - Carico calibrato alla perfezione. Continua così!`,
        });
      }
    }
  };

  // Helper: Decrease rest time
  const decreaseRest = (currentRest: string): string => {
    const seconds = parseInt(currentRest.replace(/\D/g, ''));
    return `${Math.max(30, seconds - 15)}s`;
  };

  // Handle RPE submission with pain tracking
  const handleRPESubmit = async () => {
    if (!currentExercise) return;

    // Calculate adjusted RPE for context
    const contextAdj = calculateContextAdjustment(stressLevel, sleepQuality, nutritionQuality, hydration);
    const adjustedRPE = Math.max(1, Math.min(10, currentRPE + contextAdj));

    // Log the set with RIR
    const newSetLog: SetLog = {
      set_number: currentSet,
      reps_completed: currentReps,
      weight_used: currentWeight || undefined,
      rpe: currentRPE,
      rpe_adjusted: adjustedRPE,
      rir_perceived: currentRIR,
      adjusted: false
    };

    setSetLogs(prev => ({
      ...prev,
      [currentExercise.name]: [...(prev[currentExercise.name] || []), newSetLog]
    }));

    // Pain tracking integration
    if (currentPainLevel > 0) {
      try {
        await painManagementService.logPain({
          user_id: userId,
          program_id: programId,
          exercise_name: currentExercise.name,
          day_name: dayName,
          set_number: currentSet,
          weight_used: currentWeight || undefined,
          reps_completed: currentReps,
          rom_percentage: 100,
          pain_level: currentPainLevel,
          rpe: currentRPE,
          adaptations: painAdaptations
        });

        console.log(`🩹 Pain logged: ${currentExercise.name} - Level ${currentPainLevel}/10`);
      } catch (error) {
        console.error('Error logging pain:', error);
      }
    }

    // Check for pain-based adaptation
    if (currentPainLevel >= 4) {
      // TODO: Get goal from program data (for now defaulting to 'forza')
      const userGoal = 'forza'; // This should come from program metadata

      const suggestion = painManagementService.suggestAdaptation(
        currentPainLevel,
        currentWeight || 0,
        currentReps,
        100,
        painAdaptations,
        userGoal
      );

      console.log('🩹 Pain adaptation suggested:', suggestion);

      // Show alert with suggestion
      if (suggestion.action !== 'continue') {
        setShowPainAlert(true);
        toast.warning(suggestion.message, {
          duration: 5000
        });

        // Apply adaptation automatically for next set
        if (suggestion.new_weight !== undefined) {
          console.log(`⚠️ Suggested weight reduction: ${currentWeight}kg → ${suggestion.new_weight}kg`);
        }
        if (suggestion.new_reps !== undefined) {
          console.log(`⚠️ Suggested reps reduction: ${currentReps} → ${suggestion.new_reps}`);
        }

        // Track adaptation
        setPainAdaptations([
          ...painAdaptations,
          {
            type: suggestion.action === 'reduce_weight' ? 'weight_reduced' :
                  suggestion.action === 'reduce_reps' ? 'reps_reduced' :
                  suggestion.action === 'reduce_rom' ? 'rom_reduced' : 'exercise_stopped',
            from: currentWeight,
            to: suggestion.new_weight || currentWeight,
            reason: `pain_${currentPainLevel}`,
            timestamp: new Date().toISOString()
          }
        ]);

        // If should stop exercise
        if (suggestion.action === 'stop_exercise') {
          toast.error('Esercizio sospeso per dolore persistente. Contatta fisioterapista.', {
            duration: 8000
          });
          // Skip to next exercise
          if (currentExerciseIndex < totalExercises - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSet(1);
            setShowRPEInput(false);
            setCurrentPainLevel(0);
            setPainAdaptations([]);
            return;
          }
        }
      }
    }

    // Check for hybrid recovery activation (2+ sessions persistent pain)
    if (currentPainLevel >= 4 && painAdaptations.length >= 3) {
      try {
        const shouldActivate = await painManagementService.shouldActivateHybridRecovery(
          userId,
          currentExercise.name
        );

        if (shouldActivate.shouldActivate) {
          // Mostra modal invece di solo toast
          setHybridRecoveryData({
            exerciseName: currentExercise.name,
            painLevel: currentPainLevel,
            sessions: shouldActivate.sessions
          });
          setShowHybridRecoveryModal(true);

          toast.warning(
            `🔄 Dolore persistente rilevato per ${shouldActivate.sessions} sessioni.`,
            { duration: 5000 }
          );
          console.log('🔄 Hybrid recovery modal triggered:', shouldActivate);
        }
      } catch (error) {
        console.error('Error checking hybrid recovery:', error);
      }
    }

    // Analyze RPE and provide suggestions
    analyzeRPEAndSuggest(currentRPE);

    // Reset for next set
    setShowRPEInput(false);
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
    setCurrentRIR(2);
    setCurrentPainLevel(0);
  };

  // Apply suggestion and PERSIST changes to program (RIR-based auto-regulation)
  const applySuggestion = async () => {
    if (!suggestion || !currentExercise) return;

    let toastMessage = '';
    let toastDescription = '';

    // Apply set adjustments (local state for current session)
    if (suggestion.type === 'reduce' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toastMessage = 'Volume ridotto';
      toastDescription = `${currentExercise.name}: ${suggestion.newSets} sets`;
    } else if (suggestion.type === 'increase' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toastMessage = 'Volume aumentato';
      toastDescription = `${currentExercise.name}: ${suggestion.newSets} sets`;
    }

    // Apply weight adjustments (for next session - persist to program)
    if (suggestion.weightAdjustment && suggestion.weightAdjustment !== 0) {
      const currentWeight = typeof currentExercise.weight === 'number'
        ? currentExercise.weight
        : parseFloat(String(currentExercise.weight)) || 0;

      if (currentWeight > 0) {
        const newWeight = Math.round(currentWeight * (1 + suggestion.weightAdjustment / 100) * 2) / 2; // Round to 0.5kg

        // Update local state for immediate feedback
        setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));

        // PERSIST to database - update the program's exercise weight
        try {
          await persistWeightAdjustment(currentExercise.name, newWeight, suggestion.weightAdjustment);

          if (suggestion.weightAdjustment > 0) {
            toastMessage = toastMessage || 'Peso aumentato';
            toastDescription = `${currentExercise.name}: ${currentWeight}kg → ${newWeight}kg (+${suggestion.weightAdjustment}%)`;
          } else {
            toastMessage = toastMessage || 'Peso ridotto';
            toastDescription = `${currentExercise.name}: ${currentWeight}kg → ${newWeight}kg (${suggestion.weightAdjustment}%)`;
          }

          console.log(`[RIR Adjustment] Persisted weight change for ${currentExercise.name}: ${currentWeight}kg → ${newWeight}kg`);
        } catch (error) {
          console.error('[RIR Adjustment] Failed to persist weight change:', error);
          toast.error('Errore nel salvare l\'aggiustamento');
        }
      }
    }

    if (toastMessage) {
      toast.success(toastMessage, { description: toastDescription });
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

  // Persist weight adjustment to the program in Supabase
  const persistWeightAdjustment = async (exerciseName: string, newWeight: number, percentChange: number) => {
    try {
      // Fetch current program
      const { data: program, error: fetchError } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (fetchError || !program) {
        throw new Error('Failed to fetch program');
      }

      let updated = false;
      const updatePayload: any = { updated_at: new Date().toISOString() };

      // Check which structure the program uses: weekly_schedule or weekly_split
      // Method 1: Try weekly_schedule (legacy/team structure)
      if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
        const updatedSchedule = program.weekly_schedule.map((day: any) => ({
          ...day,
          exercises: day.exercises?.map((ex: any) => {
            if (ex.name === exerciseName) {
              updated = true;
              return {
                ...ex,
                weight: newWeight,
                notes: `${ex.notes || ''} | Auto-adjusted ${percentChange > 0 ? '+' : ''}${percentChange}% (RIR feedback)`.trim()
              };
            }
            return ex;
          })
        }));

        if (updated) {
          updatePayload.weekly_schedule = updatedSchedule;
        }
      }

      // Method 2: Try weekly_split.days (main app structure)
      if (!updated && program.weekly_split?.days && Array.isArray(program.weekly_split.days)) {
        const updatedSplit = {
          ...program.weekly_split,
          days: program.weekly_split.days.map((day: any) => ({
            ...day,
            exercises: day.exercises?.map((ex: any) => {
              if (ex.name === exerciseName) {
                updated = true;
                return {
                  ...ex,
                  weight: typeof newWeight === 'number' ? `${newWeight}kg` : newWeight,
                  notes: `${ex.notes || ''} | Auto-adjusted ${percentChange > 0 ? '+' : ''}${percentChange}% (RIR feedback)`.trim()
                };
              }
              return ex;
            })
          }))
        };

        if (updated) {
          updatePayload.weekly_split = updatedSplit;
        }
      }

      // Method 3: Try exercises array directly (flat structure)
      if (!updated && program.exercises && Array.isArray(program.exercises)) {
        const updatedExercises = program.exercises.map((ex: any) => {
          if (ex.name === exerciseName) {
            updated = true;
            return {
              ...ex,
              weight: typeof newWeight === 'number' ? `${newWeight}kg` : newWeight,
              notes: `${ex.notes || ''} | Auto-adjusted ${percentChange > 0 ? '+' : ''}${percentChange}% (RIR feedback)`.trim()
            };
          }
          return ex;
        });

        if (updated) {
          updatePayload.exercises = updatedExercises;
        }
      }

      if (!updated) {
        console.warn(`[RIR Adjustment] Exercise ${exerciseName} not found in program structure`);
        console.warn('[RIR Adjustment] Program structure:', {
          hasWeeklySchedule: !!program.weekly_schedule,
          hasWeeklySplit: !!program.weekly_split?.days,
          hasExercises: !!program.exercises
        });
        return;
      }

      // Save back to database
      const { error: updateError } = await supabase
        .from('training_programs')
        .update(updatePayload)
        .eq('id', programId);

      if (updateError) {
        throw updateError;
      }

      // Also log the adjustment for analytics
      await supabase.from('program_adjustments').insert({
        user_id: userId,
        program_id: programId,
        trigger_type: percentChange > 0 ? 'low_rpe' : 'high_rpe',
        avg_rpe_before: currentRPE,
        sessions_analyzed: 1,
        adjustment_type: percentChange > 0 ? 'increase_volume' : 'decrease_volume',
        volume_change_percent: percentChange,
        exercises_affected: [{
          exercise_name: exerciseName,
          pattern: currentExercise.pattern,
          avg_rpe: currentRPE,
          old_weight: currentExercise.weight,
          new_weight: newWeight,
          reason: `RIR ${currentRIR} feedback`
        }],
        applied: true,
        user_accepted: true
      });

      // Clear cache to ensure fresh data on next load
      localStorage.removeItem('currentProgram');

      console.log(`[RIR Adjustment] Successfully persisted: ${exerciseName} → ${newWeight}kg`);
    } catch (error) {
      console.error('[RIR Adjustment] Error persisting weight adjustment:', error);
      throw error;
    }
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
      let restSeconds = parseRestTimeToSeconds(currentExercise.rest);
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
    // Se workoutStartTime è null, chiudi comunque il modale
    if (!workoutStartTime) {
      onClose();
      return;
    }

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

      // Build workout notes with pain tracking and contextual factors
      const painNote = painAreas.length > 0
        ? `Pain areas: ${painAreas.map(p => `${p.area}(${p.intensity}/10)`).join(', ')}`
        : '';

      const contextNote = `Context: stress=${stressLevel}/10, nutrition=${nutritionQuality}, hydration=${hydration}`;

      // Calculate context adjustment for this session
      const contextAdjustment = calculateContextAdjustment(stressLevel, sleepQuality, nutritionQuality, hydration);
      const adjustedAvgRPE = Math.max(1, Math.min(10, avgRPE + contextAdjustment));

      const workoutNotes = [
        'Live workout with real-time RPE feedback',
        painNote,
        contextNote,
        contextAdjustment !== 0 ? `RPE adjusted by ${contextAdjustment > 0 ? '+' : ''}${contextAdjustment.toFixed(1)} for context` : ''
      ].filter(Boolean).join(' | ');

      await autoRegulationService.logWorkout(userId, programId, {
        day_name: dayName,
        split_type: currentExercise?.pattern || 'Full Body',
        session_duration_minutes: duration,
        session_rpe: adjustedAvgRPE, // Use context-adjusted RPE
        exercises: exerciseLogs,
        mood: mood as any,
        sleep_quality: sleepQuality,
        notes: workoutNotes,
        // NEW: Additional context data
        stress_level: stressLevel,
        nutrition_quality: nutritionQuality,
        hydration: hydration,
        context_adjustment: contextAdjustment
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

  // ===== EXERCISE DISLIKE HANDLERS =====

  // Handle weight reduction from dislike modal
  const handleReduceWeight = (percentage: number) => {
    if (!currentExercise) return;

    const currentWeight = adjustedWeights[currentExercise.name]
      || (typeof currentExercise.weight === 'number' ? currentExercise.weight : parseFloat(String(currentExercise.weight)) || 0);

    const newWeight = Math.round(currentWeight * (1 - percentage / 100) * 10) / 10;

    setAdjustedWeights(prev => ({
      ...prev,
      [currentExercise.name]: newWeight
    }));

    setCurrentWeight(newWeight);

    toast.success(`💪 Peso ridotto: ${currentWeight}kg → ${newWeight}kg (-${percentage}%)`);
    console.log(`[DISLIKE] Weight reduced for ${currentExercise.name}: ${currentWeight}kg → ${newWeight}kg`);
  };

  // Handle exercise replacement from dislike modal
  const handleReplaceExercise = (reason: 'pain' | 'dislike') => {
    if (!currentExercise) return;

    // Get variants for this exercise pattern
    const variants = getVariantsForExercise(currentExercise.name, currentExercise.pattern);

    if (variants && variants.length > 0) {
      // Pick first variant that's different from current
      const replacement = variants.find(v => v !== currentExercise.name) || variants[0];

      // Replace in exercises array
      setExercises(prev => prev.map((ex, idx) =>
        idx === currentExerciseIndex
          ? { ...ex, name: replacement, notes: `${reason === 'pain' ? '🩹' : '🔄'} Sostituito: ${currentExercise.name}` }
          : ex
      ));

      toast.success(`🔄 ${currentExercise.name} → ${replacement}`);
      console.log(`[DISLIKE] Exercise replaced: ${currentExercise.name} → ${replacement} (reason: ${reason})`);
    } else {
      toast.error('❌ Nessuna variante disponibile per questo esercizio');
      console.warn(`[DISLIKE] No variants found for ${currentExercise.name}`);
    }
  };

  // Handle pain report from dislike modal
  const handlePainFromDislike = (area: string, level: number) => {
    console.log(`[DISLIKE] Pain reported: ${area} - Level ${level}/10`);

    // Add to pain areas for this session
    setPainAreas(prev => [...prev.filter(p => p.area !== area), { area, intensity: level }]);

    // Log to pain management service
    painManagementService.logPainEvent({
      area,
      intensity: level,
      exercise: currentExercise?.name || '',
      timestamp: new Date().toISOString()
    });
  };

  // Get current weight for exercise (adjusted or original)
  const getCurrentExerciseWeight = () => {
    if (!currentExercise) return undefined;
    return adjustedWeights[currentExercise.name]
      || (typeof currentExercise.weight === 'number' ? currentExercise.weight : currentExercise.weight);
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
          className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">👋 Pre-Workout Check-In</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm mb-3">{t('mood.question')}</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'great', emoji: '🔥', label: t('mood.great') },
                { value: 'good', emoji: '😊', label: t('mood.good') },
                { value: 'ok', emoji: '😐', label: t('mood.ok') },
                { value: 'tired', emoji: '😴', label: t('mood.tired') }
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

          {/* NEW: Stress Level */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Livello di stress</span>
              <span className="text-white font-bold">{stressLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Rilassato</span>
              <span>Molto stressato</span>
            </div>
          </div>

          {/* NEW: Nutrition & Hydration */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* Nutrition */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Nutrizione oggi</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'good', emoji: '🥗', label: 'Buona' },
                  { value: 'normal', emoji: '🍽️', label: 'Normale' },
                  { value: 'poor', emoji: '🍟', label: 'Scarsa' }
                ].map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setNutritionQuality(value as any)}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                      nutritionQuality === value
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hydration */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Idratazione</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'good', emoji: '💧', label: 'Buona' },
                  { value: 'normal', emoji: '🥤', label: 'Normale' },
                  { value: 'poor', emoji: '🏜️', label: 'Scarsa' }
                ].map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setHydration(value as any)}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                      hydration === value
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contextual Warning */}
          {(stressLevel >= 7 || nutritionQuality === 'poor' || hydration === 'poor' || sleepQuality <= 4) && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-amber-300 text-xs font-semibold mb-1">
                ⚠️ Fattori che potrebbero influenzare il workout
              </p>
              <p className="text-slate-400 text-xs">
                {stressLevel >= 7 && '• Stress alto → RPE potrebbe essere inflazionato'}
                {sleepQuality <= 4 && ' • Sonno scarso → Performance ridotta'}
                {nutritionQuality === 'poor' && ' • Nutrizione scarsa → Energia bassa'}
                {hydration === 'poor' && ' • Disidratazione → Fatica precoce'}
              </p>
              <p className="text-amber-400 text-xs mt-2 font-semibold">
                Il sistema terrà conto di questi fattori nel calcolo RPE
              </p>
            </div>
          )}

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

          {/* MENSTRUAL CYCLE TRACKING (for female athletes only) */}
          {isFemale && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300 text-sm font-semibold">🩸 {t('menstrual.track')}</label>
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
                  { key: 'none', label: t('menstrual.not_track'), emoji: '⚪', color: 'gray', days: '' },
                  { key: 'follicular', label: t('menstrual.follicular'), emoji: '💪', color: 'green', days: '(6-13)' },
                  { key: 'ovulation', label: t('menstrual.ovulation'), emoji: '🔥', color: 'orange', days: '(14-16)' },
                  { key: 'luteal', label: t('menstrual.luteal'), emoji: '⚠️', color: 'yellow', days: '(17-28)' },
                  { key: 'menstrual', label: t('menstrual.menstruation'), emoji: '🩸', color: 'red', days: '(1-5)' }
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
                    <span>{t('menstrual.day')}</span>
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
          )}

          {/* Location Switch Button (VIOLA) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLocationSwitch(true)}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
          >
            🏠 {t('location.change_today')}
          </motion.button>

          {locationSwitched && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <p className="text-purple-300 text-sm font-semibold">
                ✅ {t('location.session_adapted')}
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
            {t('dashboard.start_workout')}
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
                <h3 className="text-xl font-bold text-white mb-4">🏠 {t('location.available_equipment')}</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { key: 'dumbbell', label: t('equipment.dumbbells'), icon: '🏋️' },
                    { key: 'barbell', label: t('equipment.barbell'), icon: '⚡' },
                    { key: 'pullUpBar', label: t('equipment.pullup_bar'), icon: '🔥' },
                    { key: 'rings', label: t('equipment.rings'), icon: '⭕' },
                    { key: 'bands', label: t('equipment.bands'), icon: '🎗️' },
                    { key: 'kettlebell', label: t('equipment.kettlebell'), icon: '🎯' }
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
        className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">{currentExercise.name}</h3>
              {/* Recovery badge if in recovery mode */}
              {(currentExercise as any).is_recovery && (
                <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-orange-300 text-xs font-bold">
                  🔄 RECOVERY
                </span>
              )}
            </div>
            {/* Dislike button */}
            <button
              onClick={() => setShowDislikeModal(true)}
              className="p-2 bg-slate-700/50 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/50 rounded-lg transition-all group"
              title={t('exercise_dislike.title')}
            >
              <ThumbsDown className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          {/* Exercise Video - Autoplay in loop */}
          <div className="mb-4">
            <ExerciseVideoPlayer
              exerciseName={currentExercise.name}
              autoPlay={true}
              loop={true}
              muted={true}
              className="w-full aspect-video rounded-lg"
              showFormCues={true}
            />
          </div>

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

          {/* Exercise Description Panel - Always Visible */}
          {exerciseInfo && (
            <div className="mt-4 bg-slate-900/80 rounded-lg p-4 border border-slate-700/50">
              {/* Description */}
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                {exerciseInfo.description}
              </p>

              {/* Technique */}
              {exerciseInfo.technique && exerciseInfo.technique.length > 0 && (
                <div>
                  <p className="text-xs text-blue-400 font-medium mb-2 uppercase tracking-wide">
                    Tecnica Corretta
                  </p>
                  <ul className="space-y-1.5">
                    {exerciseInfo.technique.map((cue, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
                <label className="block text-slate-300 text-sm mb-2">
                  Peso (kg){currentExercise.weight && <span className="text-amber-400 font-bold"> - Suggerito: {currentExercise.weight}</span>}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder={currentExercise.weight || "0"}
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

        {/* RPE & RIR Input */}
        {showRPEInput && !suggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 font-bold mb-2">Feedback Post-Set</p>
              <p className="text-slate-400 text-sm">RPE e RIR per calibrare la progressione</p>
            </div>

            {/* RPE Scale */}
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

            {/* RIR (Reps In Reserve) */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-purple-300 font-bold">RIR - Reps In Reserve</p>
                  <p className="text-slate-400 text-xs">Quante reps potevi ancora fare?</p>
                </div>
                <span className="text-3xl font-bold text-purple-400">{currentRIR}</span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map(rir => (
                  <button
                    key={rir}
                    onClick={() => setCurrentRIR(rir)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      currentRIR === rir
                        ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold">{rir}</div>
                    <div className="text-xs">
                      {rir === 0 && 'Max'}
                      {rir === 1 && '1 rep'}
                      {rir === 2 && '2 rep'}
                      {rir === 3 && '3 rep'}
                      {rir === 4 && '4 rep'}
                      {rir === 5 && '5+'}
                    </div>
                  </button>
                ))}
              </div>

              {/* RIR vs RPE Validation */}
              {(() => {
                // RPE 10 = RIR 0, RPE 9 = RIR 1, RPE 8 = RIR 2, etc.
                const expectedRIR = Math.max(0, 10 - currentRPE);
                const delta = Math.abs(currentRIR - expectedRIR);

                if (delta >= 2) {
                  return (
                    <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                      <p className="text-amber-300 text-xs font-semibold">
                        ⚠️ RPE {currentRPE} suggerisce RIR ~{expectedRIR}, ma hai indicato RIR {currentRIR}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {currentRIR > expectedRIR
                          ? 'Il carico potrebbe essere troppo leggero per il target'
                          : 'Il carico potrebbe essere troppo pesante per il target'}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Pain Level Tracking */}
            {(userId && programId && dayName) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-red-300 font-bold">🩹 Livello Dolore</p>
                    <p className="text-slate-400 text-xs">0 = nessuno, 10 = insopportabile</p>
                  </div>
                  <span className="text-3xl font-bold text-red-400">{currentPainLevel}</span>
                </div>

                {/* Pain Scale 0-10 */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={currentPainLevel}
                    onChange={(e) => setCurrentPainLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />

                  <div className="grid grid-cols-11 gap-1">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCurrentPainLevel(val)}
                        className={`p-2 rounded text-xs font-bold transition-all ${
                          currentPainLevel === val
                            ? val === 0 ? 'bg-green-500/30 text-green-300' :
                              val <= 3 ? 'bg-yellow-500/30 text-yellow-300' :
                              val <= 6 ? 'bg-orange-500/30 text-orange-300' :
                              'bg-red-500/30 text-red-300'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* Pain level indicators */}
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div className="text-center">
                      <span className="text-green-400">0-3</span>
                      <p className="text-slate-500">Lieve/OK</p>
                    </div>
                    <div className="text-center">
                      <span className="text-orange-400">4-6</span>
                      <p className="text-slate-500">Moderato</p>
                    </div>
                    <div className="text-center">
                      <span className="text-red-400">7-10</span>
                      <p className="text-slate-500">Severo</p>
                    </div>
                  </div>
                </div>

                {/* Pain Warning */}
                {currentPainLevel >= 4 && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    <p className="text-amber-300 text-xs font-semibold">
                      ⚠️ Dolore moderato/alto rilevato
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {currentPainLevel >= 7
                        ? 'Sistema ridurrà ROM o sospenderà esercizio'
                        : 'Sistema adatterà automaticamente carico/reps'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video Upload Button */}
            <button
              onClick={() => setShowVideoUpload(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mb-3"
            >
              <span>📹</span>
              <span>Carica Video Form Check</span>
            </button>

            <button
              onClick={handleRPESubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300"
            >
              Conferma Feedback
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

        {/* Set History for Current Exercise with Fatigue Analysis */}
        {setLogs[currentExercise.name]?.length > 0 && (
          <div className="bg-slate-800/30 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-slate-400 text-sm">Set Completati:</h4>
              {/* Fatigue Trend Indicator */}
              {setLogs[currentExercise.name].length >= 2 && (() => {
                const sets = setLogs[currentExercise.name];
                const firstHalfAvg = sets.slice(0, Math.ceil(sets.length / 2)).reduce((a, b) => a + b.rpe, 0) / Math.ceil(sets.length / 2);
                const secondHalfAvg = sets.slice(Math.ceil(sets.length / 2)).reduce((a, b) => a + b.rpe, 0) / (sets.length - Math.ceil(sets.length / 2));
                const trend = secondHalfAvg - firstHalfAvg;

                if (trend >= 1.5) {
                  return (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Fatica alta
                    </span>
                  );
                } else if (trend >= 0.5) {
                  return (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Fatica crescente
                    </span>
                  );
                } else if (trend <= -0.5) {
                  return (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Warming up
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-2">
              {setLogs[currentExercise.name].map((set, idx) => {
                // Calculate adjusted RPE for this set
                const contextAdj = calculateContextAdjustment(stressLevel, sleepQuality, nutritionQuality, hydration);
                const adjustedRPE = Math.max(1, Math.min(10, set.rpe + contextAdj));

                return (
                  <div key={idx} className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="text-slate-300 font-semibold">Set {set.set_number}</span>
                    <span className="text-emerald-400">{set.reps_completed} reps</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        set.rpe >= 9 ? 'text-red-400' :
                        set.rpe >= 8 ? 'text-orange-400' :
                        set.rpe <= 4 ? 'text-blue-400' :
                        'text-slate-300'
                      }`}>
                        RPE {set.rpe}
                      </span>
                      {contextAdj !== 0 && (
                        <span className="text-xs text-slate-500">
                          (adj: {adjustedRPE.toFixed(1)})
                        </span>
                      )}
                    </div>
                    {set.rir_perceived !== undefined && (
                      <span className="text-xs text-purple-400">
                        RIR {set.rir_perceived}
                      </span>
                    )}
                    {set.adjusted && <span className="text-amber-400 text-xs">⚡</span>}
                  </div>
                );
              })}
            </div>

            {/* Fatigue Warning */}
            {setLogs[currentExercise.name].length >= 2 && (() => {
              const sets = setLogs[currentExercise.name];
              const lastTwoAvg = sets.slice(-2).reduce((a, b) => a + b.rpe, 0) / 2;

              if (lastTwoAvg >= 9 && currentSet < currentTargetSets) {
                return (
                  <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                    <p className="text-red-300 text-xs font-semibold">
                      ⚠️ RPE molto alto negli ultimi set. Considera di:
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      • Ridurre le reps per i prossimi set
                      • Aumentare il recupero
                      • Terminare l'esercizio in anticipo
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Set Average Summary */}
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs">
              <span className="text-slate-500">Media RPE:</span>
              <span className="text-white font-bold">
                {(setLogs[currentExercise.name].reduce((a, b) => a + b.rpe, 0) / setLogs[currentExercise.name].length).toFixed(1)}
              </span>
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

      {/* Hybrid Recovery Modal */}
      {hybridRecoveryData && (
        <HybridRecoveryModal
          open={showHybridRecoveryModal}
          onClose={() => setShowHybridRecoveryModal(false)}
          exerciseName={hybridRecoveryData.exerciseName}
          painLevel={hybridRecoveryData.painLevel}
          sessions={hybridRecoveryData.sessions}
          allExercises={exercises.map(ex => ex.name)}
          onActivate={handleActivateRecovery}
          onSkip={handleSkipExercise}
        />
      )}

      {/* Video Upload Modal */}
      <VideoUploadModal
        open={showVideoUpload}
        onClose={() => setShowVideoUpload(false)}
        exerciseName={currentExercise.name}
        exercisePattern={currentExercise.pattern}
        setNumber={currentSet}
        onUploadComplete={(correctionId) => {
          setShowVideoUpload(false);
          toast.success('Video caricato! Analisi in corso...', {
            description: `Riceverai il feedback tra pochi secondi. ID: ${correctionId.substring(0, 8)}...`
          });
        }}
      />

      {/* Exercise Dislike Modal */}
      <ExerciseDislikeModal
        open={showDislikeModal}
        onClose={() => setShowDislikeModal(false)}
        exerciseName={currentExercise.name}
        exercisePattern={currentExercise.pattern}
        currentWeight={getCurrentExerciseWeight()}
        onReduceWeight={handleReduceWeight}
        onReplaceExercise={handleReplaceExercise}
        onReportPain={handlePainFromDislike}
      />
    </motion.div>
  );
}
