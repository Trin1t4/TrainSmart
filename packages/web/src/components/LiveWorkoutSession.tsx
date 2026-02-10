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

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Play, Pause, SkipForward, X, Info, ThumbsDown, ArrowLeftRight, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { autoRegulationService } from '@trainsmart/shared';
import { BETA_FLAGS } from '../config/featureFlags';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../lib/i18n';
import { getExerciseDescription } from '../utils/exerciseDescriptions';
import painManagementService, {
  classifyDiscomfort,
  PAIN_THRESHOLDS,
  BODY_AREA_LABELS,
  type DiscomfortResponse,
  type DiscomfortIntensity,
  type BodyArea,
  type UserChoice
} from '../lib/painManagementService';
import HybridRecoveryModal from './HybridRecoveryModal';
import VideoUploadModal from './VideoUploadModal';
import { isExerciseSupportedInternally } from '../lib/videoCorrectionEngine';
import ExerciseDislikeModal from './ExerciseDislikeModal';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import WorkoutGridView from './WorkoutGridView';
import WorkoutModeSelector from './WorkoutModeSelector';
import { getVariantsForExercise } from '../utils/exerciseVariants';
import {
  adaptExercisesForLocation,
  analyzeExerciseFeedback,
  getDowngradedExercise,
  getUpgradedExercise,
  isBodyweightExercise,
  getExerciseAlternatives,
  isSpecialPopulation,
  DifficultyFeedback,
  ProgressionResult,
  ExerciseAlternative,
  logExerciseSkip,
  getActiveAlerts,
  acknowledgeSkipAlert,
  generateSkipFeedback,
  MUSCLE_GROUP_NAMES,
  startProgressiveWorkout,
  saveProgressiveSet,
  updateProgressiveProgress,
  completeProgressiveWorkout,
  abandonProgressiveWorkout,
  type SkipReason,
  type SkipPatternAlert,
  // RIR Adjustment Logic (TUT = aggravante)
  calculateDowngrade,
  calculateUpgrade,
  getEducationalMessage,
  getTempoById,
  getStandardTempo,
  formatTempoDisplay,
  isStandardTempo,
  type TempoModifier,
  type DowngradeInput,
  type UpgradeInput,
  // Exercise Modification Service
  saveModification,
  updateModification,
  removeModification,
  getActiveModifications,
  type ExerciseModification,
  // Program Normalizer Unified
  normalizeOnLoad,
  updateExerciseWeight,
  prepareForSave,
  type NormalizedProgram,
  // Video Analysis Integration
  getSuggestedWeightForExercise,
  getVideoCorrectiveExercisesFromVideo,
  addVideoCorrectiveExercisesToProgram,
  type SuggestedWeight,
  type VideoCorrectiveExercise,
  type VideoCorrectiveData,
} from '@trainsmart/shared';

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
  supersetGroup?: number; // ID gruppo superset (esercizi con stesso ID vanno eseguiti in sequenza senza pausa)
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
// Handles formats: "90s", "60-90s", "2-3min", "3-5min", or numbers (90, 3)
const parseRestTimeToSeconds = (rest: string | number | undefined): number => {
  // Handle undefined/null
  if (rest === undefined || rest === null) {
    return 90; // Default 90 seconds
  }

  // Handle number input (assume seconds if > 10, minutes if <= 10)
  if (typeof rest === 'number') {
    return rest <= 10 ? rest * 60 : rest;
  }

  // Remove whitespace and convert to lowercase
  const cleaned = String(rest).trim().toLowerCase();

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

// Pattern degli esercizi principali (compound)
const COMPOUND_PATTERNS = [
  'lower_push', 'lower_pull', 'squat', 'deadlift',
  'horizontal_push', 'horizontal_pull', 'bench', 'row',
  'vertical_push', 'vertical_pull', 'press', 'pullup'
];

// Pattern degli esercizi complementari/accessori
const ACCESSORY_PATTERNS = ['accessory', 'core', 'corrective', 'isolation'];

/**
 * Adatta gli esercizi in base al tempo disponibile:
 * - 45+ min: tutti gli esercizi normali
 * - 30-44 min: crea superset per complementari (riduce tempi recupero)
 * - 20-29 min: rimuove esercizi complementari, tiene solo compound
 *
 * NOTA: Superset/jumpset NON applicabili in gravidanza per sicurezza
 */
const adaptExercisesForTime = (
  exercises: Exercise[],
  availableTime: number,
  isPregnancy: boolean = false
): { exercises: Exercise[]; adaptationMode: 'full' | 'superset' | 'compound_only'; message: string } => {
  // 45+ minuti: allenamento completo
  if (availableTime >= 45) {
    return {
      exercises,
      adaptationMode: 'full',
      message: ''
    };
  }

  // Gravidanza: NO superset/jumpset, taglia solo i complementari se necessario
  if (isPregnancy) {
    if (availableTime < 30) {
      // Rimuovi complementari
      const compoundExercises = exercises.filter(ex => {
        const pattern = ex.pattern?.toLowerCase() || '';
        const name = ex.name?.toLowerCase() || '';
        if (ACCESSORY_PATTERNS.some(p => pattern.includes(p))) return false;
        const compoundNames = ['squat', 'stacco', 'deadlift', 'panca', 'bench', 'press', 'row', 'rematore', 'trazioni', 'pullup'];
        return compoundNames.some(n => name.includes(n)) || COMPOUND_PATTERNS.some(p => pattern.includes(p));
      });

      return {
        exercises: compoundExercises,
        adaptationMode: 'compound_only',
        message: `🤰 Gravidanza: esercizi ridotti per ${availableTime} minuti (no superset per sicurezza)`
      };
    }

    // 30-44 min in gravidanza: nessun superset, mantieni tutto con pause normali
    return {
      exercises,
      adaptationMode: 'full',
      message: '🤰 Gravidanza: pause normali mantenute per sicurezza'
    };
  }

  // Identifica esercizi compound vs accessori
  const isCompound = (ex: Exercise) => {
    const pattern = ex.pattern?.toLowerCase() || '';
    const name = ex.name?.toLowerCase() || '';

    // Check pattern
    if (COMPOUND_PATTERNS.some(p => pattern.includes(p))) return true;
    if (ACCESSORY_PATTERNS.some(p => pattern.includes(p))) return false;

    // Check name per esercizi comuni
    const compoundNames = ['squat', 'stacco', 'deadlift', 'panca', 'bench', 'press', 'row', 'rematore', 'trazioni', 'pullup', 'pull-up', 'dip', 'military'];
    if (compoundNames.some(n => name.includes(n))) return true;

    // Default: considera compound se ha peso significativo
    return ex.weight && Number(ex.weight) >= 20;
  };

  const compoundExercises = exercises.filter(isCompound);
  const accessoryExercises = exercises.filter(ex => !isCompound(ex));

  // 20-29 minuti: solo compound, rimuovi complementari
  if (availableTime < 30) {
    return {
      exercises: compoundExercises,
      adaptationMode: 'compound_only',
      message: `⚡ Modalità Express: ${accessoryExercises.length} esercizi complementari rimossi per rispettare i ${availableTime} minuti`
    };
  }

  // 30-44 minuti: crea superset/jumpset per gli accessori (if enabled)
  if (!BETA_FLAGS.SUPERSET) {
    // Supersets disabled — return all exercises as-is
    return {
      exercises: [...compoundExercises, ...accessoryExercises],
      adaptationMode: 'standard',
      message: `⏱️ ${availableTime} minuti disponibili`
    };
  }

  // Raggruppa accessori a 2 a 2 in superset (stessa pausa per entrambi)
  const supersetAccessories: Exercise[] = [];
  for (let i = 0; i < accessoryExercises.length; i += 2) {
    const ex1 = accessoryExercises[i];
    const ex2 = accessoryExercises[i + 1];

    if (ex2) {
      // Crea superset: marca entrambi con stesso supersetGroup
      const groupId = Math.floor(i / 2) + 100; // ID univoco per superset
      supersetAccessories.push({
        ...ex1,
        supersetGroup: groupId,
        rest: '60s', // Riduce pausa tra esercizi superset
        notes: `${ex1.notes || ''} [SUPERSET con ${ex2.name}]`.trim()
      });
      supersetAccessories.push({
        ...ex2,
        supersetGroup: groupId,
        rest: ex1.rest, // Pausa normale dopo il secondo esercizio
        notes: `${ex2.notes || ''} [SUPERSET]`.trim()
      });
    } else {
      // Esercizio singolo rimasto
      supersetAccessories.push(ex1);
    }
  }

  return {
    exercises: [...compoundExercises, ...supersetAccessories],
    adaptationMode: 'superset',
    message: `🔄 Modalità Superset: ${Math.floor(accessoryExercises.length / 2)} superset creati per ottimizzare i ${availableTime} minuti`
  };
};

interface RecoveryData {
  sleepHours: number;
  stressLevel: number;
  hasInjury: boolean;
  injuryDetails: string | null;
  menstrualCycle: string | null;
  availableTime: number; // minuti disponibili
  isFemale: boolean;
  timestamp: string;
}

interface LiveWorkoutSessionProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  programId: string;
  dayName: string;
  exercises: Exercise[];
  onWorkoutComplete?: (logs: any[]) => void;
  onLocationChange?: (newLocation: 'gym' | 'home', equipment: Record<string, boolean>) => Promise<void>;
  recoveryData?: RecoveryData; // Dati dal RecoveryScreening pre-workout
  /** Location originale del programma (per tracking auto-regulation) */
  originalLocation?: 'gym' | 'home' | 'home_gym';
}

export default function LiveWorkoutSession({
  open,
  onClose,
  userId,
  programId,
  dayName,
  exercises: initialExercises,
  onWorkoutComplete,
  onLocationChange,
  recoveryData,
  originalLocation = 'gym'
}: LiveWorkoutSessionProps) {
  const { t } = useTranslation();

  // Pre-workout state - se abbiamo recoveryData, bypassa il check interno
  const [showPreWorkout, setShowPreWorkout] = useState(!recoveryData);
  const [mood, setMood] = useState<'great' | 'good' | 'ok' | 'tired'>(
    recoveryData ? (recoveryData.sleepHours >= 7 ? 'good' : 'tired') : 'good'
  );
  const [sleepQuality, setSleepQuality] = useState(recoveryData?.sleepHours ?? 7);

  // NEW: Contextual feedback
  const [stressLevel, setStressLevel] = useState(recoveryData?.stressLevel ?? 5);

  // Tempo disponibile per la sessione (in minuti)
  const [availableTime] = useState(recoveryData?.availableTime ?? 45);
  const [nutritionQuality, setNutritionQuality] = useState<'good' | 'normal' | 'poor'>('normal');
  const [hydration, setHydration] = useState<'good' | 'normal' | 'poor'>('normal');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ duration: number; exerciseCount: number; avgRPE: number; totalVolume: number } | null>(null);
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
  const [userGoal, setUserGoal] = useState<string>(''); // Per rilevare popolazioni speciali (gravidanza, etc.)

  // User data for relative strength calculation
  const [userBodyweight, setUserBodyweight] = useState<number>(75); // Default 75kg
  const [realLoads, setRealLoads] = useState<Record<string, number>>({}); // Carichi reali dai test

  // Workout state - adatta esercizi in base al tempo disponibile
  // Nota: isPregnancy viene determinato da userGoal che è caricato async
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [adaptationMessage, setAdaptationMessage] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [locationSwitched, setLocationSwitched] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<'gym' | 'home'>('gym');

  // Current set state
  const [showRPEInput, setShowRPEInput] = useState(false);
  const [showRIRConfirm, setShowRIRConfirm] = useState(false); // Conferma RIR post-set
  const [activeTempo, setActiveTempo] = useState<Record<string, string>>({}); // TUT attivi per esercizio {exerciseName: tempoId}
  const [currentRPE, setCurrentRPE] = useState(7);
  const [currentRIR, setCurrentRIR] = useState(2); // RIR percepito (0-5)
  const [currentDifficulty, setCurrentDifficulty] = useState(5); // Difficoltà esercizio 1-10
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [showExerciseDescription, setShowExerciseDescription] = useState(false);

  // Auto-adjustment state
  const [showProgressionSuggestion, setShowProgressionSuggestion] = useState(false);
  const [progressionResult, setProgressionResult] = useState<ProgressionResult | null>(null);
  const [exerciseAdjustments, setExerciseAdjustments] = useState<Record<string, { adjusted: boolean; originalName: string; newWeight?: number }>>({});

  // Exercise modifications (persistent across sessions)
  const [loadedModifications, setLoadedModifications] = useState<Record<string, ExerciseModification>>({});

  // Video upload modal state
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  // Pain tracking state
  const [currentPainLevel, setCurrentPainLevel] = useState(0); // 0-10 scale
  const [showPainAlert, setShowPainAlert] = useState(false);
  const [painAdaptations, setPainAdaptations] = useState<any[]>([]);

  // Pain Detect 2.0 state
  const [painDetectResponse, setPainDetectResponse] = useState<DiscomfortResponse | null>(null);
  const [showPainOptionsModal, setShowPainOptionsModal] = useState(false);
  const [pendingPainArea, setPendingPainArea] = useState<BodyArea | null>(null);

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

  // Station Occupied / Alternatives Modal state
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [currentAlternatives, setCurrentAlternatives] = useState<ExerciseAlternative[]>([]);

  // Exercise Selector Dropdown state
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Grid View state
  const [useGridView, setUseGridView] = useState(false);

  // Mode Selector state - shown after pre-workout to let user choose guided vs free mode
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Skip Tracking state
  const [showSkipReasonModal, setShowSkipReasonModal] = useState(false);
  const [skipAlerts, setSkipAlerts] = useState<SkipPatternAlert[]>([]);
  const [showSkipAlert, setShowSkipAlert] = useState(false);
  const [currentSkipAlert, setCurrentSkipAlert] = useState<SkipPatternAlert | null>(null);

  // Progressive Workout Save state
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [exercisesCompletedCount, setExercisesCompletedCount] = useState(0);

  // Adjustment state
  const [suggestion, setSuggestion] = useState<{
    type: 'reduce' | 'increase' | 'maintain';
    message: string;
    newSets?: number;
    newReps?: number;
    newRest?: string;
    weightAdjustment?: number; // Percentage adjustment for next session (+5 = increase 5%, -5 = decrease 5%)
  } | null>(null);

  // Video Analysis Weight Suggestion state
  const [videoSuggestedWeight, setVideoSuggestedWeight] = useState<SuggestedWeight | null>(null);
  const [videoCorrectiveData, setVideoCorrectiveData] = useState<VideoCorrectiveData | null>(null);
  const [showCorrectivesModal, setShowCorrectivesModal] = useState(false);
  const [isLoadingVideoSuggestion, setIsLoadingVideoSuggestion] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const targetReps = typeof currentExercise?.reps === 'number'
    ? currentExercise.reps
    : parseInt(currentExercise?.reps?.split('-')[0] || '10');
  const exerciseInfo = currentExercise ? getExerciseDescription(currentExercise.name) : null;

  // ════════════════════════════════════════════════════════════════════════
  // STIMA PESO RUNTIME per esercizi senza peso assegnato
  // Usa i carichi reali dai test (realLoads) + rapporti biomeccanici
  // ════════════════════════════════════════════════════════════════════════
  const estimatedWeight = useMemo(() => {
    if (!currentExercise || currentExercise.weight || isBodyweightExercise(currentExercise.name)) {
      return null; // Ha già un peso o è bodyweight
    }
    if (Object.keys(realLoads).length === 0) return null;

    const name = currentExercise.name.toLowerCase();
    const pattern = currentExercise.pattern?.toLowerCase() || '';

    // Mappa pattern → chiave realLoads
    const PATTERN_KEYS: Record<string, string> = {
      lower_push: 'lower_push', lower_pull: 'lower_pull',
      horizontal_push: 'horizontal_push', horizontal_pull: 'horizontal_pull',
      vertical_push: 'vertical_push', vertical_pull: 'vertical_pull',
      core: 'core'
    };

    // Ratios esercizio-specifico (conservativi, per difetto)
    const RATIOS: Record<string, number> = {
      'stacco': 1.0, 'deadlift': 1.0, 'conventional deadlift': 1.0,
      'stacco sumo': 0.85, 'sumo deadlift': 0.85,
      'stacco rumeno': 0.65, 'romanian deadlift': 0.65, 'rdl': 0.65,
      'good morning': 0.40, 'hip thrust': 0.90, 'leg curl': 0.30,
      'hyperextension': 0.35, 'glute bridge': 0.70,
      'panca piana': 1.0, 'bench press': 1.0, 'flat bench': 1.0,
      'panca inclinata': 0.80, 'incline bench': 0.80, 'incline press': 0.80,
      'panca declinata': 0.95, 'floor press': 0.85, 'dumbbell press': 0.80,
      'chest press': 0.85, 'dips': 0.85,
      'military press': 1.0, 'overhead press': 1.0, 'lento avanti': 1.0,
      'push press': 1.10, 'arnold press': 0.72,
      'alzate laterali': 0.25, 'lateral raise': 0.25,
      'alzate frontali': 0.28, 'front raise': 0.28, 'face pull': 0.30,
      'barbell row': 1.0, 'rematore': 1.0, 'bent over row': 1.0,
      'seated row': 0.90, 'cable row': 0.85, 'dumbbell row': 0.50,
      't-bar row': 0.90, 'lat pulldown': 1.0, 'lat machine': 1.0,
      'squat': 1.0, 'back squat': 1.0, 'front squat': 0.80,
      'goblet squat': 0.45, 'leg press': 1.40, 'pressa': 1.40,
      'hack squat': 1.10, 'squat bulgaro': 0.55, 'bulgarian split squat': 0.55,
      'affondi': 0.50, 'lunge': 0.50, 'leg extension': 0.35, 'step up': 0.50,
      'curl bilanciere': 0.35, 'barbell curl': 0.35, 'hammer curl': 0.30,
      'tricep pushdown': 0.35, 'french press': 0.30, 'skull crusher': 0.30,
      'croci': 0.25, 'croci cavi': 0.25, 'cable fly': 0.25,
      'shrugs': 0.55, 'calf raises': 0.50, 'seated calf': 0.40,
    };

    // Cross-pattern estimation (se il pattern diretto non ha 10RM)
    const CROSS_PATTERN: Record<string, { source: string; ratio: number }[]> = {
      lower_pull: [{ source: 'lower_push', ratio: 1.10 }],
      lower_push: [{ source: 'lower_pull', ratio: 0.88 }],
      horizontal_pull: [{ source: 'horizontal_push', ratio: 0.70 }, { source: 'vertical_pull', ratio: 0.85 }],
      vertical_push: [{ source: 'horizontal_push', ratio: 0.65 }],
      vertical_pull: [{ source: 'horizontal_push', ratio: 0.80 }],
      horizontal_push: [{ source: 'vertical_push', ratio: 1.50 }],
    };

    // 1. Trova il 10RM del pattern
    let patternKey = PATTERN_KEYS[pattern] || '';
    let weight10RM = realLoads[patternKey] || 0;

    // 2. Se pattern diretto non ha 10RM, inferisci da altri pattern
    if (!weight10RM && patternKey) {
      const crossPatterns = CROSS_PATTERN[patternKey];
      if (crossPatterns) {
        for (const cp of crossPatterns) {
          if (realLoads[cp.source]) {
            weight10RM = Math.round(realLoads[cp.source] * cp.ratio);
            console.log(`📊 Stima cross-pattern: ${patternKey} da ${cp.source} (${realLoads[cp.source]}kg × ${cp.ratio} = ${weight10RM}kg)`);
            break;
          }
        }
      }
    }

    if (!weight10RM) return null;

    // 3. Applica rapporto esercizio-specifico
    let exerciseRatio = 1.0;
    let matchKey = '';
    for (const [key, ratio] of Object.entries(RATIOS)) {
      if (name.includes(key) && key.length > matchKey.length) {
        matchKey = key;
        exerciseRatio = ratio;
      }
    }

    // 4. Applica intensità (default 70%)
    let intensityPct = 0.70;
    if (currentExercise.intensity) {
      const m = currentExercise.intensity.match(/(\d+)/);
      if (m) intensityPct = parseInt(m[1]) / 100;
    }

    // 5. Calcola e arrotonda a 2.5kg
    const estimated = Math.round((weight10RM * exerciseRatio * intensityPct) / 2.5) * 2.5;
    if (estimated < 5) return null;

    console.log(`📊 Stima runtime: ${currentExercise.name} = ${weight10RM}kg × ${exerciseRatio} × ${Math.round(intensityPct * 100)}% = ${estimated}kg`);
    return estimated;
  }, [currentExercise, realLoads]);

  // Calculate adjusted sets (may be modified by auto-regulation)
  const [adjustedSets, setAdjustedSets] = useState<Record<string, number>>({});
  const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;

  // ========================================================================
  // SUPERSET HELPERS
  // ========================================================================

  // Check if current exercise is part of a superset
  const isInSuperset = currentExercise?.supersetGroup !== undefined;

  // Check if current exercise is the last in its superset group
  const isLastInSupersetGroup = (): boolean => {
    if (!isInSuperset || !currentExercise) return true;

    const currentGroup = currentExercise.supersetGroup;
    // Find the next exercise with the same superset group
    const nextWithSameGroup = exercises
      .slice(currentExerciseIndex + 1)
      .find(ex => ex.supersetGroup === currentGroup);

    return !nextWithSameGroup;
  };

  // Get the next exercise in the current superset group
  const getNextSupersetExercise = (): Exercise | null => {
    if (!isInSuperset || !currentExercise) return null;

    const currentGroup = currentExercise.supersetGroup;
    return exercises
      .slice(currentExerciseIndex + 1)
      .find(ex => ex.supersetGroup === currentGroup) || null;
  };

  // State to track accumulated RPE for superset (to calculate average at the end)
  const [supersetRPEAccumulator, setSupersetRPEAccumulator] = useState<number[]>([]);

  // Fetch user data: gender, bodyweight, and test baselines for accurate strength matching
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          // Fetch profile with onboarding data
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('onboarding_data')
            .eq('user_id', userData.user.id)
            .single();

          if (profileData?.onboarding_data) {
            const onboarding = profileData.onboarding_data;

            // Gender for menstrual tracking
            if (onboarding.personalInfo?.gender === 'F') {
              setIsFemale(true);
            }

            // Goal per rilevare popolazioni speciali (gravidanza, disabilità, etc.)
            if (onboarding.goal) {
              setUserGoal(onboarding.goal);
            }

            // PESO CORPOREO - fondamentale per calcolo forza relativa
            if (onboarding.personalInfo?.weight) {
              const weight = Number(onboarding.personalInfo.weight);
              if (weight > 0 && weight < 300) { // Sanity check
                setUserBodyweight(weight);
                console.log(`⚖️ User bodyweight: ${weight}kg`);
              }
            }
          }

          // Fetch current program to get baselines (carichi reali dai test)
          const { data: programData } = await supabase
            .from('user_programs')
            .select('screening_data')
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (programData?.screening_data?.patternBaselines) {
            const baselines = programData.screening_data.patternBaselines;
            const loads: Record<string, number> = {};

            // Estrai i carichi reali dai test per ogni pattern
            Object.entries(baselines).forEach(([pattern, baseline]: [string, any]) => {
              if (baseline?.weight10RM && baseline.weight10RM > 0) {
                loads[pattern] = baseline.weight10RM;
                console.log(`🏋️ Real load for ${pattern}: ${baseline.weight10RM}kg (from test)`);
              }
            });

            if (Object.keys(loads).length > 0) {
              setRealLoads(loads);
              console.log('📊 Real loads from screening:', loads);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Adatta esercizi per il tempo disponibile (inclusa logica gravidanza)
  useEffect(() => {
    // Applica adattamento solo se abbiamo recoveryData e non è già stato fatto
    if (recoveryData && !workoutStartTime) {
      const isPregnancy = isSpecialPopulation(userGoal);
      const adaptation = adaptExercisesForTime(initialExercises, availableTime, isPregnancy);

      if (adaptation.exercises.length !== exercises.length || adaptation.message) {
        setExercises(adaptation.exercises);
        setAdaptationMessage(adaptation.message);
        console.log(`⏱️ Time adaptation (${availableTime}min, pregnancy=${isPregnancy}):`, adaptation.message);
      }
    }
  }, [recoveryData, availableTime, userGoal, initialExercises, workoutStartTime]);

  // Fetch video-based weight suggestion when exercise changes
  useEffect(() => {
    const fetchVideoSuggestion = async () => {
      if (!BETA_FLAGS.VIDEO_ANALYSIS) return;
      if (!currentExercise || !userId) return;

      // Only fetch for non-bodyweight exercises
      if (isBodyweightExercise(currentExercise.name)) {
        setVideoSuggestedWeight(null);
        setVideoCorrectiveData(null);
        return;
      }

      setIsLoadingVideoSuggestion(true);
      try {
        // Fetch weight suggestion from video analysis
        const suggestion = await getSuggestedWeightForExercise(
          userId,
          currentExercise.name,
          currentExercise.pattern,
          1 // weekNumber
        );
        setVideoSuggestedWeight(suggestion);

        // Also fetch corrective exercises if there's video data
        if (suggestion?.videoApplied) {
          const correctives = await getVideoCorrectiveExercisesFromVideo(
            userId,
            currentExercise.name,
            30 // last 30 days
          );
          setVideoCorrectiveData(correctives);
        } else {
          setVideoCorrectiveData(null);
        }
      } catch (error) {
        console.error('Error fetching video suggestion:', error);
        setVideoSuggestedWeight(null);
        setVideoCorrectiveData(null);
      } finally {
        setIsLoadingVideoSuggestion(false);
      }
    };

    fetchVideoSuggestion();
  }, [currentExerciseIndex, currentExercise?.name, userId]);

  // Auto-start workout when recoveryData is provided (bypassing internal pre-workout)
  useEffect(() => {
    if (recoveryData && !showPreWorkout && !workoutStartTime) {
      // Mostra messaggio adattamento tempo se presente
      if (adaptationMessage) {
        toast.info(adaptationMessage, { duration: 5000 });
      }

      // Avvia il workout
      setWorkoutStartTime(new Date());

      // Crea workout log per salvataggio progressivo
      const initProgressiveWorkout = async () => {
        try {
          const { workoutId, error } = await startProgressiveWorkout({
            userId,
            programId,
            dayName,
            totalExercises: exercises.length,
            mood: recoveryData.sleepHours >= 7 ? 'good' : 'tired',
            sleepQuality: recoveryData.sleepHours,
            notes: recoveryData.hasInjury ? `Injury: ${recoveryData.injuryDetails}` : undefined,
          });

          if (workoutId) {
            setWorkoutLogId(workoutId);
            console.log('[ProgressiveWorkout] Auto-started with ID:', workoutId);
          }
        } catch (err) {
          console.error('[ProgressiveWorkout] Failed to start:', err);
        }
      };

      initProgressiveWorkout();
    }
  }, [recoveryData, showPreWorkout, workoutStartTime, adaptationMessage, userId, programId, dayName, exercises.length]);

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

  // Load exercise modifications from DB at workout start
  useEffect(() => {
    if (!userId || !programId || !open) return;

    const loadModifications = async () => {
      try {
        const { data: modifications, error } = await getActiveModifications(
          supabase,
          userId,
          programId
        );

        if (error) {
          console.error('[ExerciseModifications] Error loading:', error);
          return;
        }

        if (modifications && modifications.length > 0) {
          // Convert array to Record<exerciseName, modification>
          const modsMap: Record<string, ExerciseModification> = {};
          const tempoMap: Record<string, string> = {};

          modifications.forEach((mod) => {
            modsMap[mod.exercise_name] = mod;

            // Se ha TUT attivo, impostalo
            if (mod.tempo_changed && mod.tempo_modifier_id && mod.tempo_modifier_id !== 'standard') {
              tempoMap[mod.exercise_name] = mod.tempo_modifier_id;
            }
          });

          setLoadedModifications(modsMap);
          setActiveTempo(tempoMap);

          console.log('[ExerciseModifications] Loaded:', modifications.length, 'modifications');

          // Notifica utente se ci sono modifiche attive
          const tutCount = Object.keys(tempoMap).length;
          const variantCount = modifications.filter(m => m.variant_changed).length;

          if (tutCount > 0 || variantCount > 0) {
            toast.info(
              `📋 ${modifications.length} modifiche caricate: ${tutCount} TUT, ${variantCount} varianti`,
              { duration: 4000 }
            );
          }
        }
      } catch (error) {
        console.error('[ExerciseModifications] Error:', error);
      }
    };

    loadModifications();
  }, [userId, programId, open]);

  // Handle location switch - TEMPORARY for this session only
  // Uses biomechanical pattern matching to find equivalent exercises
  const handleSessionLocationSwitch = async () => {
    try {
      setSwitchingLocation(true);

      console.log('🏋️ Switching location for this SESSION ONLY (temporary)');
      console.log('Equipment selected:', homeEquipment);
      console.log('Current exercises:', exercises.map(e => `${e.name} (${e.pattern})`));

      // Build equipment object for locationAdapter
      const equipment = {
        barbell: false,
        dumbbellMaxKg: homeEquipment.dumbbell ? 30 : 0, // Assume 30kg if has dumbbells
        kettlebellKg: homeEquipment.kettlebell ? [16, 24] : undefined,
        bands: homeEquipment.bands || false,
        pullupBar: homeEquipment.pullUpBar || false,
        bench: false // Assume no bench at home
      };

      // Determine home type based on equipment
      const hasEquipment = homeEquipment.dumbbell || homeEquipment.bands || homeEquipment.pullUpBar || homeEquipment.kettlebell;
      const homeType = hasEquipment ? 'with_equipment' : 'bodyweight';

      console.log('🏠 Home type:', homeType);
      console.log('🛠️ Equipment config:', equipment);
      console.log(`⚖️ User bodyweight: ${userBodyweight}kg`);
      console.log('📊 Real loads from tests:', realLoads);

      // Use the shared locationAdapter with:
      // - Biomechanical pattern matching
      // - User bodyweight for relative strength calculation
      // - Real loads from screening tests (not estimates)
      const adaptedExercises = adaptExercisesForLocation(
        exercises as any, // Cast because Exercise types might differ slightly
        {
          location: 'home',
          homeType: homeType as 'bodyweight' | 'with_equipment',
          equipment,
          userBodyweight, // Peso corporeo per calcolo forza relativa
          realLoads // Carichi REALI dai test (priorità su stime)
        }
      );

      // Log what changed
      const changes: string[] = [];
      adaptedExercises.forEach((adapted, i) => {
        if (adapted.name !== exercises[i].name) {
          changes.push(`${exercises[i].name} → ${adapted.name}`);
          console.log(`🔄 ${exercises[i].pattern}: ${exercises[i].name} → ${adapted.name}`);
        }
      });

      // Cast back to our Exercise type and preserve original properties
      const homeExercises = adaptedExercises.map((adapted, i) => ({
        ...exercises[i],
        name: adapted.name,
        notes: adapted.name !== exercises[i].name
          ? `Adattato da: ${exercises[i].name}. ${exercises[i].notes || ''}`
          : exercises[i].notes
      }));

      setExercises(homeExercises);
      setLocationSwitched(true);
      setCurrentLocation('home'); // Track location for progression analysis
      setShowLocationSwitch(false);
      setSwitchingLocation(false);

      if (changes.length > 0) {
        toast.success('🏠 Location cambiata per questa sessione!', {
          description: `${changes.length} esercizi adattati per casa`
        });
      } else {
        toast.success('🏠 Location cambiata!', {
          description: 'Esercizi già compatibili con allenamento casa'
        });
      }

      console.log('✅ Session exercises adapted for home:', homeExercises);
      console.log('📝 Changes made:', changes);

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
      lower_back: ['Dead Bugs 2x10/side', 'Bird Dogs 2x10/side', 'Cat-Cow 2x10', 'Side Plank 2x20s/side'],
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
  const handleStartWorkout = async () => {
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
    // Show mode selector instead of starting immediately
    setShowModeSelector(true);
  };

  // Actually start the workout after mode selection
  const handleModeSelected = async (gridMode: boolean) => {
    setShowModeSelector(false);
    setUseGridView(gridMode);
    setWorkoutStartTime(new Date());

    // STEP 3: Create workout_log for progressive saving
    try {
      const { workoutId, error } = await startProgressiveWorkout({
        userId,
        programId,
        dayName,
        totalExercises: exercises.length, // exercises state was already updated
        mood,
        sleepQuality,
        notes: painAreas.length > 0 ? `Pain areas: ${painAreas.map(p => `${p.area}(${p.intensity})`).join(', ')}` : undefined,
      });

      if (workoutId) {
        setWorkoutLogId(workoutId);
        console.log('[ProgressiveWorkout] Workout started with ID:', workoutId);
      } else {
        console.error('[ProgressiveWorkout] Failed to create workout:', error);
      }
    } catch (err) {
      console.error('[ProgressiveWorkout] Error starting workout:', err);
    }

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

  // Progressive save: Update progress when exercise/set changes
  useEffect(() => {
    if (workoutLogId && !showPreWorkout) {
      // Count completed exercises (those with at least one set logged)
      const completedCount = Object.keys(setLogs).length;

      updateProgressiveProgress(
        workoutLogId,
        currentExerciseIndex,
        currentSet,
        completedCount
      ).then(updated => {
        if (updated) {
          console.log(`[ProgressiveWorkout] Progress updated: Ex ${currentExerciseIndex + 1}/${totalExercises}, Set ${currentSet}`);
        }
      }).catch(err => {
        console.error('[ProgressiveWorkout] Error updating progress:', err);
      });
    }
  }, [workoutLogId, currentExerciseIndex, currentSet, showPreWorkout]);

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

  /**
   * Salva un alert di sicurezza RIR nel database
   */
  const saveRIRSafetyAlert = async (
    alertData: {
      exercise_name: string;
      exercise_pattern?: string;
      set_number: number;
      target_rir: number;
      actual_rir: number;
      target_reps: number;
      actual_reps: number;
      weight_used?: number;
      severity: 'warning' | 'critical';
      auto_adjustment_applied: boolean;
      adjustment_details?: {
        old_weight: number;
        new_weight: number;
        reduction_percent: number;
      };
    }
  ) => {
    try {
      const { error } = await supabase
        .from('rir_safety_alerts')
        .insert({
          user_id: userId,
          program_id: programId,
          workout_log_id: workoutLogId,
          ...alertData
        });

      if (error) {
        console.error('[RIR Safety] Failed to save alert:', error);
      } else {
        console.log('[RIR Safety] Alert saved:', alertData.severity, alertData.exercise_name);
      }
    } catch (err) {
      console.error('[RIR Safety] Error saving alert:', err);
    }
  };

  /**
   * Valida RIR e applica downgrade/upgrade secondo la logica:
   * - DOWNGRADE (RIR < target): Variante facile, NO TUT
   * - UPGRADE (RIR > target, no TUT): Aggiungi TUT
   * - UPGRADE (RIR > target, già TUT): Upgrade variante, rimuovi TUT
   *
   * TUT = AGGRAVANTE (aumenta difficoltà)
   */
  // overrideRIR: when user confirms "Yes" on RIR check, we pass the target RIR directly
  // because React setState is async and currentRIR wouldn't be updated yet
  const handleRIRValidationAndComplete = async (overrideRIR?: number) => {
    if (!currentExercise) return;

    const targetReps = typeof currentExercise.reps === 'number'
      ? currentExercise.reps
      : parseInt(String(currentExercise.reps).split('-')[0]) || 10;
    const targetRIR = currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity);
    const currentWeightNum = typeof currentWeight === 'number' ? currentWeight : parseFloat(String(currentWeight)) || 0;

    const isBW = isBodyweightExercise(currentExercise.name);
    const exerciseType = isBW ? 'bodyweight' : 'weighted';
    // Use overrideRIR if provided (from "Yes" button), otherwise use currentRIR from state
    const actualRIR = overrideRIR ?? currentRIR;
    const rirDelta = actualRIR - targetRIR;

    // Trova modifica attiva per questo esercizio
    const activeMod = Object.values(loadedModifications).find(
      mod => mod.current_variant === currentExercise.name || mod.exercise_name === currentExercise.name
    );

    // ================================================================
    // CASO 1: RIR TROPPO BASSO → DOWNGRADE (variante facile, NO TUT)
    // ================================================================
    if (rirDelta <= -2) {
      const downgradeResult = calculateDowngrade({
        exerciseName: currentExercise.name,
        exercisePattern: currentExercise.pattern,
        exerciseType,
        targetReps,
        actualReps: currentReps,
        targetRIR,
        actualRIR: actualRIR,
        currentWeight: currentWeightNum,
        location: currentLocation as 'gym' | 'home' | 'home_gym'
      });

      if (downgradeResult.needsDowngrade) {
        // Mostra toast
        if (downgradeResult.severity === 'critical') {
          toast.error(downgradeResult.userMessage, { duration: 10000 });
        } else {
          toast.warning(downgradeResult.userMessage, { duration: 6000 });
        }

        // Messaggio educativo
        toast.info(getEducationalMessage(downgradeResult.severity), { duration: 8000 });

        // Applica riduzione peso localmente
        if (downgradeResult.newWeight) {
          setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: downgradeResult.newWeight! }));
          setCurrentWeight(downgradeResult.newWeight);
        }

        // Rimuovi TUT (downgrade = NO TUT)
        setActiveTempo(prev => {
          const updated = { ...prev };
          delete updated[currentExercise.name];
          return updated;
        });

        // Salva modifica nel DB
        await saveModification(supabase, {
          user_id: userId,
          program_id: programId,
          cycle_number: 1,
          exercise_name: currentExercise.name,
          exercise_pattern: currentExercise.pattern,
          original_variant: downgradeResult.newVariant ? currentExercise.name : undefined,
          current_variant: downgradeResult.newVariant || currentExercise.name,
          variant_changed: !!downgradeResult.newVariant,
          original_tempo: '2-0-1-0',
          current_tempo: '2-0-1-0', // NO TUT
          tempo_modifier_id: undefined,
          tempo_changed: false,
          original_weight: currentWeightNum,
          current_weight: downgradeResult.newWeight,
          weight_reduction_percent: downgradeResult.weightReductionPercent,
          original_reps: targetReps,
          current_reps: downgradeResult.newReps,
          reason: 'rir_exceeded_downgrade',
          severity: downgradeResult.severity,
          rir_target: targetRIR,
          rir_actual: actualRIR
        });

        // Salva alert sicurezza
        await saveRIRSafetyAlert({
          exercise_name: currentExercise.name,
          exercise_pattern: currentExercise.pattern,
          set_number: currentSet,
          target_rir: targetRIR,
          actual_rir: actualRIR,
          target_reps: targetReps,
          actual_reps: currentReps,
          weight_used: currentWeightNum || undefined,
          severity: downgradeResult.severity,
          auto_adjustment_applied: true,
          adjustment_details: {
            type: 'downgrade',
            new_variant: downgradeResult.newVariant,
            new_weight: downgradeResult.newWeight,
            new_reps: downgradeResult.newReps
          }
        });

        console.log(`[Downgrade] Applied:`, downgradeResult);
      }
    }

    // ================================================================
    // CASO 2: RIR TROPPO ALTO → UPGRADE (TUT aggravante)
    // ================================================================
    else if (rirDelta >= 2) {
      const upgradeResult = calculateUpgrade({
        exerciseName: currentExercise.name,
        exercisePattern: currentExercise.pattern,
        exerciseType,
        targetRIR,
        actualRIR: actualRIR,
        targetReps,
        actualReps: currentReps,
        currentWeight: currentWeightNum,
        activeModification: activeMod ? {
          original_variant: activeMod.original_variant || undefined,
          current_variant: activeMod.current_variant,
          tempo_modifier_id: activeMod.tempo_modifier_id || undefined,
          original_weight: activeMod.original_weight || undefined,
          current_weight: activeMod.current_weight || undefined,
          original_reps: activeMod.original_reps || undefined
        } : undefined,
        location: currentLocation as 'gym' | 'home' | 'home_gym'
      });

      if (upgradeResult.canUpgrade) {
        toast.success(upgradeResult.userMessage, { duration: 8000 });

        // Gestisci in base al tipo di upgrade
        if (upgradeResult.upgradeType === 'add_tut') {
          // Aggiungi TUT
          setActiveTempo(prev => ({
            ...prev,
            [currentExercise.name]: upgradeResult.newTempo!.id
          }));

          // Salva modifica
          await saveModification(supabase, {
            user_id: userId,
            program_id: programId,
            cycle_number: 1,
            exercise_name: currentExercise.name,
            exercise_pattern: currentExercise.pattern,
            original_variant: undefined,
            current_variant: currentExercise.name,
            variant_changed: false,
            original_tempo: '2-0-1-0',
            current_tempo: upgradeResult.newTempo!.tempo,
            tempo_modifier_id: upgradeResult.newTempo!.id,
            tempo_changed: true,
            original_weight: currentWeightNum,
            current_weight: currentWeightNum,
            original_reps: targetReps,
            current_reps: upgradeResult.newReps,
            reason: 'rir_high_add_tut',
            severity: 'warning',
            rir_target: targetRIR,
            rir_actual: actualRIR
          });

          console.log(`[Upgrade] Added TUT:`, upgradeResult.newTempo);

        } else if (upgradeResult.upgradeType === 'upgrade_variant' ||
                   upgradeResult.upgradeType === 'increase_weight') {
          // Upgrade variante/peso, rimuovi TUT
          setActiveTempo(prev => {
            const updated = { ...prev };
            delete updated[currentExercise.name];
            if (upgradeResult.newVariant) {
              delete updated[upgradeResult.newVariant];
            }
            return updated;
          });

          if (upgradeResult.newWeight) {
            setAdjustedWeights(prev => ({
              ...prev,
              [currentExercise.name]: upgradeResult.newWeight!
            }));
          }

          // Rimuovi modifica (tornato a livello superiore)
          if (activeMod?.id) {
            await removeModification(supabase, activeMod.id);
            setLoadedModifications(prev => {
              const updated = { ...prev };
              const key = Object.keys(prev).find(k => prev[k].id === activeMod.id);
              if (key) delete updated[key];
              return updated;
            });
            console.log(`[Upgrade] Removed modification, upgraded to:`, upgradeResult);
          }
        }
      }
    }

    // ================================================================
    // CASO 3: RIR -1 → Warning leggero
    // ================================================================
    else if (rirDelta === -1) {
      toast.warning(
        `⚠️ Sei andato leggermente oltre il limite`,
        {
          description: `Hai fatto RIR ${actualRIR} invece di RIR ${targetRIR}. La prossima volta fermati 1 rep prima.`,
          duration: 6000
        }
      );

      await saveRIRSafetyAlert({
        exercise_name: currentExercise.name,
        exercise_pattern: currentExercise.pattern,
        set_number: currentSet,
        target_rir: targetRIR,
        actual_rir: actualRIR,
        target_reps: targetReps,
        actual_reps: currentReps,
        weight_used: currentWeightNum || undefined,
        severity: 'warning',
        auto_adjustment_applied: false
      });
    }

    // ================================================================
    // CASO 4: RIR nel range (±1) → OK
    // ================================================================
    else {
      console.log(`[RIR] OK: ${actualRIR} vs target ${targetRIR}`);
    }

    // ================================================================
    // LOG DEL SET (critico per non perdere dati)
    // ================================================================
    const newSetLog: SetLog = {
      set_number: currentSet,
      reps_completed: currentReps,
      weight_used: currentWeight || undefined,
      rpe: currentRPE,
      rir_perceived: actualRIR,
      adjusted: false
    };

    setSetLogs(prev => ({
      ...prev,
      [currentExercise.name]: [...(prev[currentExercise.name] || []), newSetLog]
    }));

    // PROGRESSIVE SAVE: Salva il set nel database in tempo reale
    if (workoutLogId) {
      saveProgressiveSet({
        workout_log_id: workoutLogId,
        exercise_name: currentExercise.name,
        exercise_index: currentExerciseIndex,
        set_number: currentSet,
        reps_completed: currentReps,
        weight_used: currentWeight || undefined,
        rpe: currentRPE,
        rir: actualRIR,
        was_adjusted: false,
      }).then(saved => {
        if (saved) {
          console.log(`[ProgressiveWorkout] Set saved from RIR validation: ${currentExercise.name} Set ${currentSet}`);
        }
      }).catch(err => {
        console.error('[ProgressiveWorkout] Error saving set:', err);
      });
    }

    // Reset input per prossimo set
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
    setCurrentRIR(2);

    // Procedi con il completamento del set (skipRPEInput=true perché abbiamo già raccolto il feedback)
    handleSetComplete(true);
  };

  // Handle set completion
  // skipRPEInput: true quando il feedback RPE è già stato raccolto (da handleRIRValidationAndComplete)
  const handleSetComplete = (skipRPEInput = false) => {
    if (currentReps === 0) {
      toast.error('Inserisci il numero di reps completate');
      return;
    }

    // Initialize if not exists
    if (!currentExercise) return;

    if (!setLogs[currentExercise.name]) {
      setSetLogs(prev => ({ ...prev, [currentExercise.name]: [] }));
    }

    // ========================================================================
    // SUPERSET LOGIC: Se è il primo esercizio di un superset, passa direttamente
    // al secondo senza mostrare il feedback RPE (verrà raccolto alla fine)
    // ========================================================================
    if (BETA_FLAGS.SUPERSET && isInSuperset && !isLastInSupersetGroup()) {
      // Salva il log base senza RPE (verrà completato alla fine del superset)
      const basicSetLog: SetLog = {
        set_number: currentSet,
        reps_completed: currentReps,
        weight_used: currentWeight || undefined,
        rpe: 0, // Placeholder, verrà aggiornato alla fine del superset
        rir_perceived: 0,
        adjusted: false
      };

      setSetLogs(prev => ({
        ...prev,
        [currentExercise.name]: [...(prev[currentExercise.name] || []), basicSetLog]
      }));

      // Passa al prossimo esercizio del superset (senza timer, senza feedback)
      const nextSuperset = getNextSupersetExercise();
      if (nextSuperset) {
        const nextIndex = exercises.findIndex(ex => ex.name === nextSuperset.name);
        if (nextIndex !== -1) {
          setCurrentExerciseIndex(nextIndex);
          // Mantieni lo stesso numero di set (es. set 1 di A → set 1 di B)
          toast.info(`⚡ Superset: ${nextSuperset.name}`, { duration: 2000 });
        }
      }

      // Reset input per prossimo esercizio
      setCurrentReps(0);
      setCurrentWeight(0);
      return;
    }

    // ========================================================================
    // TIMER AUTOMATICO: Parte SUBITO quando l'utente conferma i dati della serie
    // (non dopo il feedback RPE - così l'utente può riposare mentre compila)
    // ========================================================================
    const shouldStartTimer = currentSet < currentTargetSets || currentExerciseIndex < totalExercises - 1;

    if (shouldStartTimer) {
      let restSeconds = parseRestTimeToSeconds(currentExercise.rest);
      if (menstrualPhase === 'menopause') {
        restSeconds = Math.round(restSeconds * 1.2); // +20% rest per menopausa
      }
      setRestTimeRemaining(restSeconds);
      setRestTimerActive(true);
      console.log(`⏱️ Rest timer started: ${restSeconds}s`);
    }

    // Esercizio normale o ultimo del superset: mostra input RPE
    // Se skipRPEInput è true, il feedback è già stato raccolto → procedi al prossimo set
    if (skipRPEInput) {
      // Feedback già raccolto, procedi direttamente
      proceedToNextSet();
    } else {
      setShowRPEInput(true);
    }
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
      setShowRIRConfirm(false);
      setActiveTempo(null); // Reset tempo per nuovo esercizio
      setCurrentPainLevel(0);
      setPainAdaptations([]);
    }
  };

  /**
   * Handler per skippare esercizio senza attivare Recovery (from HybridRecoveryModal)
   */
  const handleSkipExercise = () => {
    console.log('⏭️ Exercise skipped without recovery activation');
    setShowHybridRecoveryModal(false);

    // Use the skip tracking - assume fatigue if coming from recovery modal
    handleSkipWithReason('fatigue');
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
        // Significativamente oltre il target - ridurre carico AUTOMATICAMENTE
        setSuggestion({
          type: 'reduce',
          message: `⚠️ Ultimo set: RIR ${perceivedRIR} vs target ${targetRIR} - Hai spinto ${wentTooHard} RIR oltre il programmato. Peso -5% applicato automaticamente.`,
          newRest: increaseRest(currentExercise.rest),
          weightAdjustment: -5
        });
        // Auto-apply weight adjustment
        autoApplyWeightAdjustment(-5);
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
        // Significativamente sotto il target - aumentare carico AUTOMATICAMENTE
        const weightIncrease = targetRIR === 0 ? 7.5 : 5;
        setSuggestion({
          type: 'increase',
          message: `💪 Ultimo set: RIR ${perceivedRIR} vs target ${targetRIR} - Avevi ancora ${tooEasy} rep in più! Peso +${weightIncrease}% applicato automaticamente.`,
          weightAdjustment: weightIncrease
        });
        // Auto-apply weight adjustment
        autoApplyWeightAdjustment(weightIncrease);
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

  // Auto-apply weight adjustment without user confirmation
  const autoApplyWeightAdjustment = async (percentChange: number) => {
    if (!currentExercise) return;

    const currentWeight = typeof currentExercise.weight === 'number'
      ? currentExercise.weight
      : parseFloat(String(currentExercise.weight)) || 0;

    if (currentWeight <= 0) return;

    const newWeight = Math.round(currentWeight * (1 + percentChange / 100) * 2) / 2;

    // Update local state
    setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));

    // Persist to database
    try {
      await persistWeightAdjustment(currentExercise.name, newWeight, percentChange);
      console.log(`[Auto-Regulation] Weight adjusted: ${currentExercise.name} ${currentWeight}kg → ${newWeight}kg (${percentChange > 0 ? '+' : ''}${percentChange}%)`);
    } catch (error) {
      console.error('[Auto-Regulation] Failed to persist:', error);
    }
  };

  // ========================================================================
  // EXERCISE PROGRESSION/REGRESSION ANALYSIS
  // Analyzes difficulty, RPE, RIR to suggest exercise downgrade/upgrade
  // ========================================================================
  const analyzeExerciseProgression = () => {
    if (!currentExercise) return;

    const targetReps = typeof currentExercise.reps === 'string'
      ? parseInt(currentExercise.reps.split('-')[0])
      : currentExercise.reps;

    const feedback: DifficultyFeedback = {
      rpe: currentRPE,
      rir: currentRIR,
      difficulty: currentDifficulty,
      completedReps: currentReps,
      targetReps: targetReps,
      weight: currentWeight || undefined
    };

    const result = analyzeExerciseFeedback(feedback, currentLocation);

    console.log('📊 Exercise progression analysis:', {
      exercise: currentExercise.name,
      pattern: currentExercise.pattern,
      location: currentLocation,
      feedback,
      result
    });

    // If action needed (not maintain), show suggestion
    if (result.action !== 'maintain') {
      if (result.action === 'downgrade') {
        // Find downgraded exercise
        const downgrade = getDowngradedExercise(
          currentExercise.name,
          currentExercise.pattern,
          currentLocation
        );

        if (downgrade) {
          result.newExercise = downgrade.name;
          result.newDifficulty = downgrade.difficulty;
          result.recommendation = `${result.recommendation}\n\nSuggerimento: ${currentExercise.name} → ${downgrade.name}`;
        }
      } else if (result.action === 'upgrade') {
        // Find upgraded exercise
        const upgrade = getUpgradedExercise(
          currentExercise.name,
          currentExercise.pattern,
          currentLocation
        );

        if (upgrade) {
          result.newExercise = upgrade.name;
          result.newDifficulty = upgrade.difficulty;
          result.recommendation = `${result.recommendation}\n\nProssima sessione: ${currentExercise.name} → ${upgrade.name}`;
        }
      }

      setProgressionResult(result);
      setShowProgressionSuggestion(true);
    }
  };

  // Apply exercise downgrade/upgrade
  const applyExerciseProgression = () => {
    if (!progressionResult || !currentExercise) return;

    if (progressionResult.action === 'downgrade' && progressionResult.newExercise) {
      // Replace current exercise with easier version
      const updatedExercises = exercises.map((ex, idx) => {
        if (idx === currentExerciseIndex) {
          return {
            ...ex,
            name: progressionResult.newExercise!,
            notes: `Adattato da ${currentExercise.name} (difficoltà ridotta)`
          };
        }
        return ex;
      });

      setExercises(updatedExercises);
      setExerciseAdjustments(prev => ({
        ...prev,
        [currentExercise.name]: {
          adjusted: true,
          originalName: currentExercise.name
        }
      }));

      toast.success(`🔄 Esercizio adattato: ${progressionResult.newExercise}`, {
        description: 'Versione più gestibile per questa sessione'
      });
    } else if (progressionResult.action === 'reduce_weight' && progressionResult.newWeight) {
      // Reduce weight for next set
      setCurrentWeight(progressionResult.newWeight);
      setExerciseAdjustments(prev => ({
        ...prev,
        [currentExercise.name]: {
          adjusted: true,
          originalName: currentExercise.name,
          newWeight: progressionResult.newWeight
        }
      }));

      toast.info(`⚖️ Peso ridotto a ${progressionResult.newWeight}kg`, {
        description: 'Per le prossime serie'
      });
    }

    setShowProgressionSuggestion(false);
    setProgressionResult(null);
  };

  // Dismiss progression suggestion
  const dismissProgressionSuggestion = () => {
    setShowProgressionSuggestion(false);
    setProgressionResult(null);
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

    // ========================================================================
    // AUTO-REGOLAZIONE CARICO BASATA SU REPS COMPLETATE VS TARGET
    // - Troppe poche reps = carico troppo alto → riduci
    // - Troppe reps = carico troppo basso → aumenta
    // ========================================================================
    const repsDelta = currentReps - targetReps; // Positivo = eccesso, Negativo = deficit
    let weightAdjusted = false;

    const currentWeightNum = typeof currentExercise.weight === 'number'
      ? currentExercise.weight
      : parseFloat(String(currentExercise.weight)) || 0;

    // CASO 1: CARICO TROPPO ALTO (cliente fa meno reps del previsto)
    if (repsDelta <= -4) {
      // DEFICIT SIGNIFICATIVO (>=4 reps in meno): Riduci carico IMMEDIATAMENTE
      // Es: 6 reps su 10 previste = troppo pesante
      if (currentWeightNum > 0) {
        const newWeight = Math.round(currentWeightNum * 0.9 * 2) / 2; // -10%, arrotondato a 0.5kg
        setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));
        setCurrentWeight(newWeight); // Applica subito per i prossimi set
        weightAdjusted = true;

        toast.error(
          `⚠️ Carico ridotto: ${currentWeightNum}kg → ${newWeight}kg`,
          {
            description: `Hai completato ${currentReps}/${targetReps} reps. Il carico era troppo alto.`,
            duration: 5000
          }
        );
        console.log(`[AUTO-REGULATION] Immediate weight reduction: ${currentWeightNum}kg → ${newWeight}kg (${currentReps}/${targetReps} reps)`);
      }
    } else if (repsDelta <= -2) {
      // DEFICIT LIEVE (2-3 reps in meno): Monitora, ritarerà dalla prossima sessione
      toast.info(
        `📊 Monitoraggio carico`,
        {
          description: `${currentReps}/${targetReps} reps. Il sistema valuterà per la prossima sessione.`,
          duration: 4000
        }
      );
      console.log(`[AUTO-REGULATION] Monitoring deficit: ${currentReps}/${targetReps} reps`);
    }

    // CASO 2: CARICO TROPPO BASSO (cliente fa più reps del previsto)
    // Logica: se target 10 @ RIR 2 = 12RM, ma cliente fa 15 @ RIR 2 = 17RM
    // Deve aumentare il peso per riportarlo a 12RM
    else if (repsDelta >= 5) {
      // ECCESSO SIGNIFICATIVO (>=5 reps in più): Aumenta carico IMMEDIATAMENTE
      // Es: 15 reps su 10 previste = troppo leggero
      if (currentWeightNum > 0) {
        const newWeight = Math.round(currentWeightNum * 1.10 * 2) / 2; // +10%, arrotondato a 0.5kg
        setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));
        setCurrentWeight(newWeight); // Applica subito per i prossimi set
        weightAdjusted = true;

        toast.success(
          `💪 Carico aumentato: ${currentWeightNum}kg → ${newWeight}kg`,
          {
            description: `Hai completato ${currentReps}/${targetReps} reps. Ottimo! Il carico era troppo leggero.`,
            duration: 5000
          }
        );
        console.log(`[AUTO-REGULATION] Immediate weight increase: ${currentWeightNum}kg → ${newWeight}kg (${currentReps}/${targetReps} reps)`);
      }
    } else if (repsDelta >= 3) {
      // ECCESSO MODERATO (3-4 reps in più): Aumenta automaticamente (+5%)
      if (currentWeightNum > 0) {
        const newWeight = Math.round(currentWeightNum * 1.05 * 2) / 2; // +5%, arrotondato a 0.5kg
        setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));
        setCurrentWeight(newWeight);
        weightAdjusted = true;

        toast.success(
          `📈 Carico aumentato: ${currentWeightNum}kg → ${newWeight}kg`,
          {
            description: `${currentReps}/${targetReps} reps completate. Progressione applicata.`,
            duration: 4000
          }
        );
        console.log(`[AUTO-REGULATION] Moderate weight increase: ${currentWeightNum}kg → ${newWeight}kg (${currentReps}/${targetReps} reps)`);
      }
    } else if (repsDelta >= 1) {
      // ECCESSO LIEVE (1-2 reps in più): Monitora, aumenterà dalla prossima sessione (+2-3%)
      toast.info(
        `📊 Ottimo lavoro!`,
        {
          description: `${currentReps}/${targetReps} reps. Leggero aumento previsto per la prossima sessione.`,
          duration: 4000
        }
      );
      console.log(`[AUTO-REGULATION] Monitoring surplus: ${currentReps}/${targetReps} reps - will increase next session`);
    }

    // Log the set with RIR
    const newSetLog: SetLog = {
      set_number: currentSet,
      reps_completed: currentReps,
      weight_used: currentWeight || undefined,
      rpe: currentRPE,
      rpe_adjusted: adjustedRPE,
      rir_perceived: currentRIR,
      adjusted: weightAdjusted
    };

    setSetLogs(prev => ({
      ...prev,
      [currentExercise.name]: [...(prev[currentExercise.name] || []), newSetLog]
    }));

    // PROGRESSIVE SAVE: Salva il set nel database in tempo reale
    if (workoutLogId) {
      saveProgressiveSet({
        workout_log_id: workoutLogId,
        exercise_name: currentExercise.name,
        exercise_index: currentExerciseIndex,
        set_number: currentSet,
        reps_completed: currentReps,
        weight_used: currentWeight || undefined,
        rpe: currentRPE,
        rir: currentRIR,
        was_adjusted: weightAdjusted,
      }).then(saved => {
        if (saved) {
          console.log(`[ProgressiveWorkout] Set saved: ${currentExercise.name} Set ${currentSet}`);
        }
      }).catch(err => {
        console.error('[ProgressiveWorkout] Error saving set:', err);
      });
    }

    // NOTA: Il timer ora parte in handleSetComplete, non qui (per partire subito dopo i dati)

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

    // Check for pain-based adaptation - PAIN DETECT 2.0
    if (currentPainLevel >= PAIN_THRESHOLDS.SUGGEST_REDUCTION) {
      // Determina l'area del corpo dall'esercizio
      const painArea = determinePainArea(currentExercise.name, painAreas);

      // Usa il nuovo sistema Pain Detect 2.0
      const response = painManagementService.evaluateDiscomfortV2(
        painArea,
        currentPainLevel as DiscomfortIntensity,
        currentExercise.name
      );

      console.log('🩹 Pain Detect 2.0 response:', response);

      // Se intensità >= 4, mostra modal con opzioni
      if (currentPainLevel >= 4) {
        setPainDetectResponse(response);
        setPendingPainArea(painArea);
        setShowPainOptionsModal(true);

        // Non procedere automaticamente - aspetta scelta utente
        return;
      }

      // Per livelli 1-3, mostra solo toast informativo
      if (response.showTolerableReminder) {
        toast.info(response.educationalNoteIt || 'Fastidio lieve, monitorando...', {
          duration: 3000
        });
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

    // Analyze exercise progression (especially for home workouts)
    // Only on last set to avoid too many interruptions
    // FIX: Use currentTargetSets instead of currentExercise.sets to match UI
    if (currentSet === currentTargetSets) {
      analyzeExerciseProgression();
    }

    // Reset for next set
    setShowRPEInput(false);
    setShowRIRConfirm(false);
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
    setCurrentRIR(2);
    setCurrentDifficulty(5);
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

  /**
   * Persist weight adjustment to the program in Supabase
   *
   * REFACTORED: Usa il normalizer unificato invece di gestire
   * manualmente 3 strutture diverse (weekly_schedule, weekly_split, exercises[])
   */
  const persistWeightAdjustment = async (
    exerciseName: string,
    newWeight: number,
    percentChange: number
  ) => {
    try {
      // 1. Fetch current program (raw dal DB)
      const { data: rawProgram, error: fetchError } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (fetchError || !rawProgram) {
        throw new Error('Failed to fetch program');
      }

      // 2. Normalizza (gestisce automaticamente weekly_schedule, weekly_split, exercises[])
      const program = normalizeOnLoad(rawProgram);

      if (!program) {
        throw new Error('Failed to normalize program');
      }

      // 3. Aggiorna usando la utility (immutable, gestisce qualsiasi struttura)
      const updatedProgram = updateExerciseWeight(
        program,
        exerciseName,
        newWeight,
        `Auto-adjusted ${percentChange > 0 ? '+' : ''}${percentChange}% (RIR feedback)`
      );

      // 4. Prepara per il salvataggio (rimuove _normalized, _normalizedAt, etc.)
      const dbPayload = prepareForSave(updatedProgram);

      // 5. Salva nel DB
      const { error: updateError } = await supabase
        .from('training_programs')
        .update(dbPayload)
        .eq('id', programId);

      if (updateError) {
        throw updateError;
      }

      // 6. Log per analytics
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
          pattern: currentExercise?.pattern,
          avg_rpe: currentRPE,
          old_weight: currentExercise?.weight,
          new_weight: newWeight,
          reason: `RIR ${currentRIR} feedback`
        }],
        applied: true,
        user_accepted: true
      }).catch(err => {
        // Non critico - logga ma non blocca
        console.warn('[RIR Adjustment] Failed to log adjustment:', err);
      });

      // 7. Clear cache per forzare refresh
      localStorage.removeItem('currentProgram');

      console.log(`[RIR Adjustment] ✅ Persisted: ${exerciseName} → ${newWeight}kg (${percentChange > 0 ? '+' : ''}${percentChange}%)`);

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
  // NOTA: Il timer ora parte in handleRPESubmit, non qui
  const proceedToNextSet = () => {
    if (!currentExercise) return;

    // ========================================================================
    // SUPERSET LOGIC: Se siamo nell'ultimo esercizio di un superset,
    // torna al primo esercizio del gruppo per il prossimo set
    // ========================================================================
    if (BETA_FLAGS.SUPERSET && isInSuperset && isLastInSupersetGroup()) {
      // Trova il primo esercizio del superset group
      const currentGroup = currentExercise.supersetGroup;
      const firstInGroup = exercises.find(ex => ex.supersetGroup === currentGroup);

      if (firstInGroup && currentSet < currentTargetSets) {
        // Torna al primo esercizio del superset per il prossimo set
        const firstIndex = exercises.findIndex(ex => ex.name === firstInGroup.name);
        if (firstIndex !== -1) {
          setCurrentExerciseIndex(firstIndex);
          setCurrentSet(prev => prev + 1);
          toast.info(`🔄 Set ${currentSet + 1} - Superset`, { duration: 2000 });
          return;
        }
      }
    }

    // Check if more sets remaining (esercizi normali)
    if (currentSet < currentTargetSets) {
      setCurrentSet(prev => prev + 1);
      // Timer già avviato in handleRPESubmit
    } else {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        // Se è superset, salta tutti gli esercizi del gruppo già completati
        let nextIndex = currentExerciseIndex + 1;
        if (BETA_FLAGS.SUPERSET && isInSuperset) {
          const currentGroup = currentExercise.supersetGroup;
          // Trova il prossimo esercizio che NON è nel gruppo corrente
          while (nextIndex < totalExercises && exercises[nextIndex].supersetGroup === currentGroup) {
            nextIndex++;
          }
        }

        if (nextIndex < totalExercises) {
          setCurrentExerciseIndex(nextIndex);
          setCurrentSet(1);
          toast.success(`✅ ${currentExercise.name} completato!`, {
            description: 'Prossimo esercizio'
          });
        } else {
          // Workout complete!
          handleWorkoutComplete();
        }
      } else {
        // Workout complete!
        handleWorkoutComplete();
      }
    }
  };

  // Jump to a specific exercise (manual selection)
  const jumpToExercise = (exerciseIndex: number) => {
    if (exerciseIndex < 0 || exerciseIndex >= exercises.length) return;

    // Reset state for new exercise
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSet(1);
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
    setCurrentRIR(2);
    setShowRPEInput(false);
    setShowRIRConfirm(false);
    setRestTimerActive(false);
    setRestTimeRemaining(0);
    setShowExerciseSelector(false);

    toast.info(`⏭️ Passato a: ${exercises[exerciseIndex].name}`, { duration: 2000 });
  };

  // =============================================================================
  // PAIN DETECT 2.0 HELPERS
  // =============================================================================

  /**
   * Determina l'area del corpo basandosi su pain areas segnalate o pattern esercizio
   */
  const determinePainArea = (
    exerciseName: string,
    areas: Array<{ area: string; intensity: number }>
  ): BodyArea => {
    // Se c'è un'area già segnalata, usa quella
    if (areas.length > 0) {
      const topArea = areas.reduce((max, curr) =>
        curr.intensity > max.intensity ? curr : max
      );
      return mapToPainDetectArea(topArea.area);
    }

    // Altrimenti, inferisci dall'esercizio
    const name = exerciseName.toLowerCase();

    if (name.includes('squat') || name.includes('leg press') || name.includes('lunge') || name.includes('leg extension')) {
      return 'knee';
    }
    if (name.includes('deadlift') || name.includes('row') || name.includes('good morning') || name.includes('hyperextension')) {
      return 'lower_back';
    }
    if (name.includes('press') || name.includes('fly') || name.includes('raise') || name.includes('lateral')) {
      return 'shoulder';
    }
    if (name.includes('curl') || name.includes('extension') || name.includes('pushdown') || name.includes('tricep')) {
      return 'elbow';
    }
    if (name.includes('pull') || name.includes('chin') || name.includes('lat')) {
      return 'shoulder';
    }
    if (name.includes('hip') || name.includes('thrust') || name.includes('glute') || name.includes('abduct')) {
      return 'hip';
    }
    if (name.includes('calf') || name.includes('ankle')) {
      return 'ankle';
    }

    // Esercizi di core/addominali
    if (name.includes('plank') || name.includes('crunch') || name.includes('sit-up') || name.includes('ab ') || name.includes('core')) {
      return 'lower_back';
    }
    // Esercizi per il collo/trapezio
    if (name.includes('shrug') || name.includes('neck') || name.includes('trap')) {
      return 'neck';
    }
    // Esercizi per la parte alta della schiena
    if (name.includes('face pull') || name.includes('rear delt') || name.includes('band pull')) {
      return 'upper_back';
    }
    // Esercizi per i polsi
    if (name.includes('wrist')) {
      return 'wrist';
    }

    return 'lower_back'; // Default conservativo
  };

  const mapToPainDetectArea = (legacyArea: string): BodyArea => {
    const mapping: Record<string, BodyArea> = {
      'neck': 'neck',
      'shoulder': 'shoulder',
      'elbow': 'elbow',
      'wrist': 'wrist',
      'scapula': 'upper_back',
      'thoracic_spine': 'upper_back',
      'upper_back': 'upper_back',
      'lower_back': 'lower_back',
      'hip': 'hip',
      'knee': 'knee',
      'ankle': 'ankle',
    };
    return mapping[legacyArea] || 'lower_back';
  };

  /**
   * Gestisce la scelta dell'utente dal modal Pain Detect
   */
  const handlePainChoice = async (choice: UserChoice) => {
    if (!painDetectResponse || !currentExercise) return;

    console.log(`🩹 User choice: ${choice}`);
    setShowPainOptionsModal(false);

    switch (choice) {
      case 'continue_normal':
        toast.info('👍 Continui normalmente. Monitora il fastidio.', { duration: 3000 });
        break;

      case 'continue_adapted':
        const reduction = painDetectResponse.autoAdaptations?.load || 20;
        const newWeight = currentWeight ? Math.round(currentWeight * (1 - reduction / 100) / 2.5) * 2.5 : undefined;

        if (newWeight) {
          toast.warning(`⚠️ Carico ridotto: ${currentWeight}kg → ${newWeight}kg (-${reduction}%)`, {
            duration: 5000
          });
          setAdjustedWeights(prev => ({
            ...prev,
            [currentExercise.name]: newWeight
          }));
        }

        setPainAdaptations([
          ...painAdaptations,
          {
            type: 'weight_reduced',
            from: currentWeight,
            to: newWeight,
            reason: `pain_${currentPainLevel}`,
            timestamp: new Date().toISOString()
          }
        ]);
        break;

      case 'substitute_exercise':
        if (pendingPainArea) {
          const sub = painManagementService.findSubstitute(
            currentExercise.name,
            pendingPainArea,
            currentPainLevel as DiscomfortIntensity
          );

          if (sub.found && sub.substitute) {
            setExercises(prev => prev.map((ex, idx) =>
              idx === currentExerciseIndex
                ? { ...ex, name: sub.substitute!, notes: `🔄 Sostituito: ${currentExercise.name}` }
                : ex
            ));
            toast.success(`🔄 ${currentExercise.name} → ${sub.substitute}`, { duration: 5000 });
          } else {
            toast.error('Nessuna alternativa disponibile. Considera di saltare.', { duration: 5000 });
          }
        }
        break;

      case 'skip_exercise':
        toast.info(`⏭️ ${currentExercise.name} saltato`, { duration: 3000 });

        if (currentExerciseIndex < totalExercises - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSet(1);
          setShowRPEInput(false);
          setShowRIRConfirm(false);
          setCurrentPainLevel(0);
          setPainAdaptations([]);
        } else {
          handleWorkoutComplete();
        }
        break;

      case 'skip_area':
        if (pendingPainArea) {
          toast.warning(`🛑 Tutti gli esercizi per ${BODY_AREA_LABELS[pendingPainArea]?.it || pendingPainArea} saranno saltati`, {
            duration: 5000
          });
          setPainAreas(prev => [
            ...prev.filter(p => mapToPainDetectArea(p.area) !== pendingPainArea),
            { area: pendingPainArea, intensity: 10 }
          ]);
        }
        handlePainChoice('skip_exercise');
        break;

      case 'end_session':
        toast.info('👋 Sessione terminata. Il recupero è parte dell\'allenamento!', { duration: 5000 });
        handleWorkoutComplete();
        break;
    }

    setPainDetectResponse(null);
    setPendingPainArea(null);
  };

  // Complete entire workout
  const handleWorkoutComplete = async () => {
    // Se workoutStartTime è null ma abbiamo workoutLogId, abbandona il workout nel DB
    if (!workoutStartTime) {
      if (workoutLogId) {
        console.log('[ProgressiveWorkout] Abandoning workout due to early termination');
        await abandonProgressiveWorkout(workoutLogId);
      }
      onClose();
      return;
    }

    const duration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60);
    const avgRPE = calculateAverageRPE();

    // Calculate total volume for celebration
    const totalVolume = Object.values(setLogs).flat().reduce((sum, s) => {
      return sum + (s.weight_used || 0) * (s.reps_completed || 0);
    }, 0);

    // Save to database via autoRegulationService
    try {
      const exerciseLogs = Object.entries(setLogs)
        .filter(([, sets]) => sets && sets.length > 0) // Skip exercises with no sets
        .map(([exerciseName, sets]) => {
          const exercise = exercises.find(ex => ex.name === exerciseName)!;
          const avgRPE = sets.reduce((sum, s) => sum + s.rpe, 0) / sets.length;

          return {
            exercise_name: exerciseName,
            pattern: exercise.pattern,
            sets_completed: sets.length,
            reps_completed: Math.round(sets.reduce((sum, s) => sum + s.reps_completed, 0) / sets.length),
            weight_used: sets[0]?.weight_used,
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

      // PROGRESSIVE SAVE: Complete the workout (update status to 'completed')
      if (workoutLogId) {
        await completeProgressiveWorkout(workoutLogId, {
          sessionRpe: adjustedAvgRPE,
          durationMinutes: duration,
          exercisesCompleted: Object.keys(setLogs).length,
          notes: workoutNotes,
        });
        console.log('[ProgressiveWorkout] Workout completed and finalized');
      }

      // Also log via autoRegulationService for analytics compatibility
      await autoRegulationService.logWorkout(userId, programId, {
        day_name: dayName,
        split_type: currentExercise?.pattern || 'Full Body',
        session_duration_minutes: duration,
        session_rpe: adjustedAvgRPE, // Use context-adjusted RPE
        exercises: exerciseLogs,
        mood: mood as any,
        sleep_quality: sleepQuality,
        notes: workoutNotes,
        // Additional context data
        stress_level: stressLevel,
        nutrition_quality: nutritionQuality,
        hydration: hydration,
        context_adjustment: contextAdjustment,
        // Location adaptation tracking
        is_location_adapted: locationSwitched,
        original_location: originalLocation,
        actual_location: currentLocation,
        exclude_from_progression: locationSwitched // Escludi sessioni adattate dall'auto-regulation
      });

      // CALIBRAZIONE PESI: Salva i pesi effettivamente usati per esercizi con peso stimato
      // Questo permette al sistema di calibrare già dalla prima seduta
      for (const log of exerciseLogs) {
        const avgExerciseRPE = log.exercise_rpe;

        // Se RPE fuori range ottimale (6-8), logga per calibrazione futura
        if (avgExerciseRPE >= 9 || avgExerciseRPE <= 5) {
          console.log(
            `[Calibrazione] ${log.exercise_name}: RPE ${avgExerciseRPE.toFixed(1)} fuori range → ` +
            `suggerito adattamento peso ${avgExerciseRPE >= 9 ? '-5%' : '+5%'} per prossima sessione`
          );
        }

        // Per esercizi bodyweight, logga se troppo facile/difficile
        if (!log.weight_used && avgExerciseRPE !== undefined) {
          if (avgExerciseRPE >= 9) {
            console.log(`[Calibrazione BW] ${log.exercise_name}: troppo difficile → considera regressione`);
          } else if (avgExerciseRPE <= 5) {
            console.log(`[Calibrazione BW] ${log.exercise_name}: troppo facile → considera progressione`);
          }
        }
      }

      if (onWorkoutComplete) {
        onWorkoutComplete(exerciseLogs);
      }

      // Show celebration screen instead of closing immediately
      setCelebrationData({
        duration,
        exerciseCount: Object.keys(setLogs).length,
        avgRPE: adjustedAvgRPE,
        totalVolume: Math.round(totalVolume),
      });
      setShowCelebration(true);
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

  // Skip exercise - now shows modal to select reason
  const skipExercise = () => {
    setShowSkipReasonModal(true);
  };

  // Handle skip with reason tracking
  const handleSkipWithReason = async (reason: SkipReason, painArea?: string, painLevel?: number) => {
    if (!currentExercise) return;

    setShowSkipReasonModal(false);

    // Log the skip to database
    try {
      const { alert } = await logExerciseSkip(
        userId,
        currentExercise.name,
        currentExercise.pattern,
        {
          programId: programId,
          skipReason: reason,
          painArea: painArea,
          painLevel: painLevel,
          dayName: dayName,
        }
      );

      // If a new alert was created, show it
      if (alert) {
        setCurrentSkipAlert(alert);
        setShowSkipAlert(true);
        toast.warning(
          `Hai saltato esercizi per ${MUSCLE_GROUP_NAMES[alert.muscle_group as keyof typeof MUSCLE_GROUP_NAMES]} nelle ultime ${alert.consecutive_sessions} sedute`,
          { duration: 5000 }
        );
      } else {
        toast.info('Esercizio saltato. Passiamo al prossimo.', { duration: 3000 });
      }

      console.log(`[SkipTracking] Exercise skipped: ${currentExercise.name}, reason: ${reason}`);
    } catch (error) {
      console.error('[SkipTracking] Error logging skip:', error);
      toast.info('Esercizio saltato. Passiamo al prossimo.', { duration: 3000 });
    }

    // Move to next exercise
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setShowRPEInput(false);
      setShowRIRConfirm(false);
      setActiveTempo(null); // Reset tempo per nuovo esercizio
      setCurrentPainLevel(0);
      setPainAdaptations([]);
    } else {
      handleWorkoutComplete();
    }
  };

  // Handle skip alert acknowledgment
  const handleSkipAlertResponse = async (accepted: boolean) => {
    if (!currentSkipAlert) return;

    await acknowledgeSkipAlert(
      currentSkipAlert.id,
      accepted ? 'accepted' : 'declined'
    );

    if (accepted && currentSkipAlert.load_reduction_percent) {
      toast.success(
        `Carico ridotto del ${currentSkipAlert.load_reduction_percent}% per ${MUSCLE_GROUP_NAMES[currentSkipAlert.muscle_group as keyof typeof MUSCLE_GROUP_NAMES]}`,
        { duration: 5000 }
      );
    }

    setShowSkipAlert(false);
    setCurrentSkipAlert(null);
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

  // Convert setLogs to format required by WorkoutGridView
  const getGridViewExerciseLogs = () => {
    return exercises.map((ex, index) => {
      const logs = setLogs[ex.name] || [];
      const totalSets = adjustedSets[ex.name] || ex.sets;

      // Create sets array with proper completed status
      const setsArray = Array.from({ length: totalSets }, (_, setIdx) => {
        const existingLog = logs[setIdx];
        if (existingLog) {
          return {
            set_number: setIdx + 1,
            reps_completed: existingLog.reps_completed,
            weight_used: existingLog.weight_used,
            rpe: existingLog.rpe,
            completed: true,
          };
        }
        return {
          set_number: setIdx + 1,
          reps_completed: 0,
          weight_used: 0,
          rpe: 7,
          completed: false,
        };
      });

      return {
        exerciseName: ex.name,
        sets: setsArray,
      };
    });
  };

  // Handle set completion from grid view
  const handleGridCompleteSet = async (exerciseIndex: number, setIndex: number, reps: number, weight: number, rpe: number) => {
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;

    // Update local setLogs
    const newLog: SetLog = {
      set_number: setIndex + 1,
      reps_completed: reps,
      weight_used: weight || undefined,
      rpe: rpe,
      rpe_adjusted: rpe,
      adjusted: false,
    };

    setSetLogs(prev => {
      const exerciseLogs = prev[exercise.name] || [];
      const updated = [...exerciseLogs];
      updated[setIndex] = newLog;
      return { ...prev, [exercise.name]: updated };
    });

    // Save to database if workout started
    if (workoutLogId) {
      try {
        await saveProgressiveSet({
          workout_log_id: workoutLogId,
          exercise_name: exercise.name,
          exercise_index: exerciseIndex,
          set_number: setIndex + 1,
          reps_completed: reps,
          weight_used: weight || undefined,
          rpe: rpe,
        });
      } catch (err) {
        console.error('[GridView] Error saving set:', err);
      }
    }

    // Start rest timer
    const restSeconds = parseRestTimeToSeconds(exercise.rest || '90s');
    const exerciseLogsForEx = setLogs[exercise.name] || [];
    const totalSets = adjustedSets[exercise.name] || exercise.sets;
    const completedAfter = exerciseLogsForEx.length + 1;

    if (completedAfter < totalSets) {
      setRestTimeRemaining(restSeconds);
      setRestTimerActive(true);
    }
  };

  // Handle finish workout from grid view
  const handleGridFinishWorkout = () => {
    handleWorkoutComplete();
  };

  // Handle skip rest from grid view
  const handleGridSkipRest = () => {
    setRestTimerActive(false);
    setRestTimeRemaining(0);
  };

  // Handle end workout early from grid view
  const handleGridEndEarly = () => {
    if (confirm('Vuoi terminare il workout anticipatamente?')) {
      handleWorkoutComplete();
    }
  };

  // Get current weight for exercise (adjusted or original)
  const getCurrentExerciseWeight = () => {
    if (!currentExercise) return undefined;
    return adjustedWeights[currentExercise.name]
      || (typeof currentExercise.weight === 'number' ? currentExercise.weight : currentExercise.weight);
  };

  if (!open) return null;

  // POST-WORKOUT CELEBRATION
  if (showCelebration && celebrationData) {
    const getRPEMessage = (rpe: number) => {
      if (rpe <= 6) return { text: 'Sessione controllata', color: 'text-emerald-400' };
      if (rpe <= 8) return { text: 'Intensità ottimale', color: 'text-blue-400' };
      return { text: 'Sessione intensa!', color: 'text-amber-400' };
    };
    const rpeMsg = getRPEMessage(celebrationData.avgRPE);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="text-7xl mb-4"
          >
            {celebrationData.avgRPE >= 8 ? '🔥' : '💪'}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Workout Completato!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm font-medium mb-6 ${rpeMsg.color}`}
          >
            {rpeMsg.text}
          </motion.p>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-400">{celebrationData.duration}'</p>
              <p className="text-xs text-slate-500">Durata</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-400">{celebrationData.exerciseCount}</p>
              <p className="text-xs text-slate-500">Esercizi</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-400">{celebrationData.avgRPE.toFixed(1)}</p>
              <p className="text-xs text-slate-500">RPE Medio</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-400">
                {celebrationData.totalVolume > 1000
                  ? `${(celebrationData.totalVolume / 1000).toFixed(1)}k`
                  : celebrationData.totalVolume}
              </p>
              <p className="text-xs text-slate-500">Volume (kg)</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all"
          >
            Chiudi
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

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
                <label className={`text-sm font-semibold ${isSpecialPopulation(userGoal) ? 'text-slate-500' : 'text-slate-300'}`}>
                  🩸 {t('menstrual.track')}
                </label>
                {menstrualPhase !== 'none' && !isSpecialPopulation(userGoal) && (
                  <span className="text-xs text-pink-400 font-bold">
                    Giorno {cycleDayNumber}
                  </span>
                )}
              </div>

              {/* Messaggio per gravidanza/popolazioni speciali */}
              {isSpecialPopulation(userGoal) ? (
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">
                    🤰 Durante la gravidanza il tracking del ciclo mestruale non è applicabile.
                  </p>
                  <p className="text-xs text-slate-500">
                    Il tuo programma è già ottimizzato per questa fase speciale.
                  </p>
                  {/* Mostra i pulsanti ma disabilitati e anneriti */}
                  <div className="grid grid-cols-2 gap-2 mt-3 opacity-40 pointer-events-none">
                    {[
                      { key: 'none', label: t('menstrual.not_track'), emoji: '⚪', days: '' },
                      { key: 'follicular', label: t('menstrual.follicular'), emoji: '💪', days: '(6-13)' },
                      { key: 'ovulation', label: t('menstrual.ovulation'), emoji: '🔥', days: '(14-16)' },
                      { key: 'luteal', label: t('menstrual.luteal'), emoji: '⚠️', days: '(17-28)' },
                      { key: 'menstrual', label: t('menstrual.menstruation'), emoji: '🩸', days: '(1-5)' }
                    ].map(({ key, label, emoji, days }) => (
                      <div
                        key={key}
                        className="p-3 rounded-lg border-2 bg-slate-800 border-slate-700 text-slate-500"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl grayscale">{emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="text-xs font-semibold">{label}</div>
                            {days && <div className="text-xs opacity-60">{days}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              {/* Cycle Day Number Slider (shown when phase selected, NOT for special populations) */}
              {menstrualPhase !== 'none' && !isSpecialPopulation(userGoal) && (
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

              {/* Cycle Info Box (NOT for special populations) */}
              {menstrualPhase !== 'none' && !isSpecialPopulation(userGoal) && (
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

  // MODE SELECTOR - Let user choose between guided and free mode
  if (showModeSelector) {
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
            <h2 className="text-2xl font-bold text-white">🎯 Scegli Modalità</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <WorkoutModeSelector
            workout={{
              dayName: dayName,
              exercises: exercises.map(ex => ({
                id: ex.name,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                rest: parseInt(ex.rest?.replace(/\D/g, '') || '90'),
                weight: typeof ex.weight === 'number' ? String(ex.weight) : ex.weight || null,
                notes: ex.notes,
                pattern: ex.pattern,
              })),
            }}
            onStartGuided={() => handleModeSelected(false)}
            onStartExercise={(exercise, index) => {
              // Start in grid mode at specific exercise
              handleModeSelected(true);
              // Jump to selected exercise after a short delay
              setTimeout(() => {
                setCurrentExerciseIndex(index);
              }, 100);
            }}
            completedExercises={new Set(Object.keys(setLogs).filter(name =>
              setLogs[name]?.length >= (adjustedSets[name] || exercises.find(e => e.name === name)?.sets || 0)
            ))}
          />
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
          <div className="flex items-center gap-2">
            {/* Grid View Toggle */}
            <button
              onClick={() => setUseGridView(!useGridView)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                useGridView
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={useGridView ? 'Vista Lineare' : 'Vista Griglia'}
            >
              {useGridView ? '📋 Lineare' : '📊 Griglia'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Grid View Mode */}
        {useGridView ? (
          <WorkoutGridView
            exercises={exercises}
            exerciseLogs={getGridViewExerciseLogs()}
            dayName={dayName}
            isResting={restTimerActive}
            restTimeLeft={restTimeRemaining}
            onCompleteSet={handleGridCompleteSet}
            onSkipRest={handleGridSkipRest}
            onFinishWorkout={handleGridFinishWorkout}
            onEndWorkoutEarly={handleGridEndEarly}
            onClose={onClose}
          />
        ) : (
        <>
        {/* Progress with Exercise Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
            {/* Exercise Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExerciseSelector(!showExerciseSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all"
              >
                <span>Esercizio {currentExerciseIndex + 1}/{totalExercises}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showExerciseSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showExerciseSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50"
                >
                  {exercises.map((ex, idx) => {
                    const isSuperset = ex.supersetGroup;
                    const isCurrent = idx === currentExerciseIndex;
                    const isCompleted = setLogs[ex.name]?.length >= (adjustedSets[ex.name] || ex.sets);

                    return (
                      <button
                        key={idx}
                        onClick={() => jumpToExercise(idx)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-700 last:border-b-0 ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isCompleted
                            ? 'bg-slate-700/50 text-slate-400'
                            : 'hover:bg-slate-700 text-white'
                        }`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          isCurrent ? 'bg-emerald-500 text-white' :
                          isCompleted ? 'bg-green-500/30 text-green-300' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ex.name}</p>
                          <p className="text-xs text-slate-400">
                            {ex.sets}x{ex.reps} {BETA_FLAGS.SUPERSET && isSuperset && `• Superset ${ex.supersetGroup}`}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-xs bg-emerald-500/30 px-2 py-0.5 rounded">Attuale</span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
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
            <div className="flex items-center gap-2">
              {/* Station Occupied button */}
              <button
                onClick={() => {
                  const alternatives = getExerciseAlternatives(currentExercise.name, currentLocation === 'gym');
                  setCurrentAlternatives(alternatives);
                  setShowAlternativesModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/50 rounded-lg transition-all group"
                title="Postazione occupata? Trova un'alternativa"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-medium text-slate-400 group-hover:text-amber-400 transition-colors">Occupata</span>
              </button>
              {/* Dislike button */}
              <button
                onClick={() => setShowDislikeModal(true)}
                className="p-2 bg-slate-700/50 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/50 rounded-lg transition-all group"
                title={t('exercise_dislike.title')}
              >
                <ThumbsDown className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
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

          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-slate-400 text-sm">Target</p>
              <p className="text-emerald-400 font-bold text-xl">{targetReps} reps</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Sets</p>
              <p className="text-blue-400 font-bold text-xl">{currentSet}/{currentTargetSets}</p>
            </div>
            {BETA_FLAGS.RPE_RIR_INPUT_UI && (
              <div>
                <p className="text-slate-400 text-sm">RIR</p>
                <p className="text-orange-400 font-bold text-xl">
                  {currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity)}
                </p>
              </div>
            )}
            <div>
              <p className="text-slate-400 text-sm">Rest</p>
              <p className="text-purple-400 font-bold text-xl">{currentExercise.rest}</p>
            </div>
          </div>

          {/* RIR Safety Reminder */}
          {BETA_FLAGS.RPE_RIR_INPUT_UI && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
              <p className="text-purple-300 text-sm text-center">
                Fermati quando ti restano <span className="font-bold">~{currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity)} reps</span> in tank
              </p>
              <p className="text-slate-500 text-xs text-center mt-1">
                Non forzare le reps a costo di superare questo limite
              </p>
            </div>
          )}

          {/* Active Tempo Modifier - TUT Aggravante */}
          {currentExercise && activeTempo[currentExercise.name] && !isStandardTempo(activeTempo[currentExercise.name]) && (() => {
            const tempoMod = getTempoById(activeTempo[currentExercise.name]);
            if (!tempoMod) return null;
            return (
              <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">
                      ⏱️ TUT Attivo: {tempoMod.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {formatTempoDisplay(tempoMod.tempo)} ({tempoMod.tut_per_rep}s/rep, +{Math.round(tempoMod.difficulty_increase * 100)}% difficoltà)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newTempo = { ...activeTempo };
                      delete newTempo[currentExercise.name];
                      setActiveTempo(newTempo);
                    }}
                    className="text-slate-500 hover:text-amber-400 text-xs underline"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-2 italic">
                  {tempoMod.description_it}
                </p>
              </div>
            );
          })()}

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

              {/* DCSS Note - Variabilità individuale */}
              {exerciseInfo.dcssNote && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-amber-400/80 italic leading-relaxed">
                    {exerciseInfo.dcssNote}
                  </p>
                </div>
              )}

              {/* Common Variations */}
              {exerciseInfo.commonVariations && exerciseInfo.commonVariations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wide">
                    Variazioni comuni
                  </p>
                  <ul className="space-y-1">
                    {exerciseInfo.commonVariations.map((variation, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{variation}</span>
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

            {currentExercise.pattern !== 'core' && !isBodyweightExercise(currentExercise.name) && (
              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Peso (kg)
                  {/* Video-based suggestion takes priority */}
                  {videoSuggestedWeight?.videoApplied ? (
                    <span className="ml-2">
                      <span className="text-purple-400 font-bold">
                        📹 Video: {videoSuggestedWeight.suggestedWeight}kg
                      </span>
                      {videoSuggestedWeight.videoRecommendation === 'increase_5_percent' && (
                        <span className="text-emerald-400 text-xs ml-1">(+5%)</span>
                      )}
                      {videoSuggestedWeight.videoRecommendation?.includes('decrease') && (
                        <span className="text-orange-400 text-xs ml-1">
                          ({videoSuggestedWeight.videoRecommendation.replace('decrease_', '-').replace('_percent', '%')})
                        </span>
                      )}
                    </span>
                  ) : currentExercise.weight ? (
                    <span className="text-amber-400 font-bold"> - Suggerito: {currentExercise.weight}</span>
                  ) : estimatedWeight ? (
                    <span className="text-blue-400 font-bold"> - Stimato: ~{estimatedWeight}kg</span>
                  ) : null}
                  {isLoadingVideoSuggestion && (
                    <span className="text-slate-500 text-xs ml-2">Caricamento...</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder={videoSuggestedWeight?.suggestedWeight?.toString() || currentExercise.weight || (estimatedWeight ? String(estimatedWeight) : "0")}
                />
                {/* Show corrective exercises button if available */}
                {BETA_FLAGS.VIDEO_ANALYSIS && videoCorrectiveData && videoCorrectiveData.correctiveExercises.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCorrectivesModal(true)}
                    className="mt-2 w-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm py-2 px-3 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    {videoCorrectiveData.correctiveExercises.length} esercizi correttivi disponibili
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (currentReps === 0) return;
                if (!BETA_FLAGS.RPE_RIR_INPUT_UI) {
                  // Skip RIR dialog — auto-assume target RIR was respected
                  const targetRIR = currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity);
                  handleRIRValidationAndComplete(targetRIR);
                  return;
                }
                setShowRIRConfirm(true); // Mostra conferma RIR invece di procedere direttamente
              }}
              disabled={currentReps === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Set Completato
            </button>
          </div>
        )}

        {/* ================================================================
            RIR CONFIRMATION - Post-set safety check
            ================================================================ */}
        {BETA_FLAGS.RPE_RIR_INPUT_UI && showRIRConfirm && !showRPEInput && currentExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            {/* Recap del set */}
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm">Hai completato</p>
              <p className="text-3xl font-bold text-white">
                {currentReps} reps
                {currentWeight > 0 && <span className="text-emerald-400"> @ {currentWeight}kg</span>}
              </p>
            </div>

            {/* Domanda RIR */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 font-bold text-center mb-2">
                Hai rispettato RIR {currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity)}?
              </p>
              <p className="text-slate-400 text-xs text-center">
                Ti sei fermato quando ti restavano ~{currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity)} reps?
              </p>
            </div>

            {/* Bottoni Sì/No */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const targetRIR = currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity);
                  setCurrentRIR(targetRIR);
                  setCurrentRPE(10 - targetRIR);
                  setShowRIRConfirm(false);
                  // FIX: Pass targetRIR directly because React setState is async
                  // and currentRIR wouldn't be updated yet when the function runs
                  handleRIRValidationAndComplete(targetRIR);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Sì
              </button>
              <button
                onClick={() => {
                  setShowRIRConfirm(false);
                  setShowRPEInput(true); // Mostra input RIR effettivo
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                No, diverso
              </button>
            </div>
          </motion.div>
        )}

        {/* RPE & RIR Input - Quando dice "No, diverso" */}
        {BETA_FLAGS.RPE_RIR_INPUT_UI && showRPEInput && !suggestion && currentExercise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 font-bold mb-2">Feedback Post-Set</p>
              <p className="text-slate-400 text-sm">RPE e RIR per calibrare la progressione</p>
            </div>

            {/* RPE Scale - Rating of Perceived Exertion */}
            <div>
              <div className="text-center mb-3">
                <p className="text-emerald-400 font-bold text-sm">SCALA RPE (Rating of Perceived Exertion)</p>
                <p className="text-slate-500 text-xs">Quanto è stato faticoso questo set da 1 a 10?</p>
              </div>
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
              <div className="text-center mb-3">
                <p className="text-purple-400 font-bold text-sm">SCALA RIR (Reps In Reserve)</p>
                <p className="text-slate-500 text-xs">Quante ripetizioni potevi ancora fare prima di cedere?</p>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-purple-300 font-bold">RIR selezionato</p>
                  <p className="text-slate-400 text-xs">0 = cedimento, 5+ = molto facile</p>
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

            {/* Exercise Difficulty Rating - Only show for home workouts */}
            {locationSwitched && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-cyan-300 font-bold">📊 Difficoltà Esercizio</p>
                    <p className="text-slate-400 text-xs">Quanto è stato difficile questo esercizio?</p>
                  </div>
                  <span className={`text-3xl font-bold ${
                    currentDifficulty <= 4 ? 'text-green-400' :
                    currentDifficulty <= 6 ? 'text-yellow-400' :
                    currentDifficulty <= 8 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>{currentDifficulty}</span>
                </div>

                {/* Difficulty Scale 1-10 */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentDifficulty}
                    onChange={(e) => setCurrentDifficulty(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                      <button
                        key={val}
                        onClick={() => setCurrentDifficulty(val)}
                        className={`p-1 rounded text-xs font-bold transition-all ${
                          currentDifficulty === val
                            ? val <= 4 ? 'bg-green-500/30 text-green-300' :
                              val <= 6 ? 'bg-yellow-500/30 text-yellow-300' :
                              val <= 8 ? 'bg-orange-500/30 text-orange-300' :
                              'bg-red-500/30 text-red-300'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* Difficulty level indicators */}
                  <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                    <div className="text-center">
                      <span className="text-green-400">1-4</span>
                      <p className="text-slate-500">Facile</p>
                    </div>
                    <div className="text-center">
                      <span className="text-yellow-400">5-6</span>
                      <p className="text-slate-500">Medio</p>
                    </div>
                    <div className="text-center">
                      <span className="text-orange-400">7-8</span>
                      <p className="text-slate-500">Difficile</p>
                    </div>
                    <div className="text-center">
                      <span className="text-red-400">9-10</span>
                      <p className="text-slate-500">Max</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty Warning */}
                {currentDifficulty >= 8 && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    <p className="text-amber-300 text-xs font-semibold">
                      ⚠️ Esercizio molto difficile
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {currentDifficulty >= 9
                        ? 'Il sistema suggerirà una versione più facile'
                        : 'Considera una variante più accessibile se non riesci a mantenere la forma'}
                    </p>
                  </div>
                )}
              </div>
            )}

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

            {/* Video Upload Button - only for supported exercises */}
            {BETA_FLAGS.VIDEO_ANALYSIS && isExerciseSupportedInternally(currentExercise.name) && (
              <button
                onClick={() => setShowVideoUpload(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mb-3"
              >
                <span>📹</span>
                <span>Carica Video Form Check</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowRPEInput(false);
                handleRIRValidationAndComplete();
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Continua
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

        {/* Exercise Progression Suggestion */}
        <AnimatePresence>
          {showProgressionSuggestion && progressionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl p-4 mb-6 border ${
                progressionResult.action === 'downgrade' || progressionResult.action === 'reduce_weight'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : progressionResult.action === 'upgrade' || progressionResult.action === 'increase_weight'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {(progressionResult.action === 'downgrade' || progressionResult.action === 'reduce_weight') && (
                  <TrendingDown className="w-6 h-6 text-orange-400 flex-shrink-0" />
                )}
                {(progressionResult.action === 'upgrade' || progressionResult.action === 'increase_weight') && (
                  <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                )}

                <div className="flex-1">
                  <p className={`font-bold mb-1 ${
                    progressionResult.action === 'downgrade' || progressionResult.action === 'reduce_weight'
                      ? 'text-orange-300'
                      : 'text-emerald-300'
                  }`}>
                    {progressionResult.action === 'downgrade' && '📉 Esercizio Troppo Difficile'}
                    {progressionResult.action === 'reduce_weight' && '⚖️ Riduzione Carico Suggerita'}
                    {progressionResult.action === 'upgrade' && '📈 Pronto per Progressione'}
                    {progressionResult.action === 'increase_weight' && '💪 Aumenta il Carico'}
                  </p>
                  <p className="text-slate-300 text-sm mb-2">{progressionResult.reason}</p>
                  <p className="text-slate-400 text-xs whitespace-pre-line">{progressionResult.recommendation}</p>

                  {progressionResult.newExercise && (
                    <div className="mt-3 bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Alternativa suggerita:</p>
                      <p className="text-white font-bold">{progressionResult.newExercise}</p>
                    </div>
                  )}

                  {progressionResult.newWeight && (
                    <div className="mt-3 bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Nuovo peso suggerito:</p>
                      <p className="text-white font-bold">{progressionResult.newWeight}kg</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {(progressionResult.action === 'downgrade' || progressionResult.action === 'reduce_weight') && (
                  <button
                    onClick={applyExerciseProgression}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    {progressionResult.action === 'downgrade' ? 'Cambia Esercizio' : 'Applica Riduzione'}
                  </button>
                )}

                {(progressionResult.action === 'upgrade' || progressionResult.action === 'increase_weight') && (
                  <button
                    onClick={applyExerciseProgression}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    Ricorda per Prossima Sessione
                  </button>
                )}

                <button
                  onClick={dismissProgressionSuggestion}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  Continua Così
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
        </>
        )}
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

      {/* Pain Detect 2.0 Options Modal */}
      {showPainOptionsModal && painDetectResponse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 ${
              painDetectResponse.level === 'mild' ? 'bg-green-500' :
              painDetectResponse.level === 'moderate' ? 'bg-amber-500' :
              'bg-red-500'
            } text-white`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {painDetectResponse.level === 'mild' && '💪 Fastidio Lieve'}
                {painDetectResponse.level === 'moderate' && '⚠️ Fastidio Moderato'}
                {painDetectResponse.level === 'significant' && '🛑 Fastidio Significativo'}
                {painDetectResponse.level === 'severe' && '❌ Fastidio Severo'}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                {currentPainLevel}/10 - {currentExercise?.name}
              </p>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                {painDetectResponse.messageIt}
              </p>

              {painDetectResponse.educationalNoteIt && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 {painDetectResponse.educationalNoteIt}
                  </p>
                </div>
              )}

              {painDetectResponse.showTolerableReminder && (
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ Un fastidio 3-4/10 che non peggiora è generalmente accettabile.
                  </p>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                {painDetectResponse.options.map((option) => (
                  <button
                    key={option.choice}
                    onClick={() => handlePainChoice(option.choice)}
                    className={`
                      w-full p-3 rounded-xl text-left transition-all
                      ${option.recommended
                        ? 'bg-blue-500 text-white hover:bg-blue-600 ring-2 ring-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.labelIt}</span>
                      {option.recommended && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          Consigliato
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 opacity-80 ml-8">
                      {option.descriptionIt}
                    </p>
                    {option.loadReductionPercent && (
                      <p className="text-xs mt-1 opacity-60 ml-8">
                        📉 -{option.loadReductionPercent}% carico
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {painDetectResponse.suggestProfessional && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚕️ {painDetectResponse.professionalMessageIt}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center">
                {painManagementService.disclaimer.it.substring(0, 80)}...
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Upload Modal */}
      {BETA_FLAGS.VIDEO_ANALYSIS && (
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
      )}

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

      {/* Station Occupied / Alternatives Modal */}
      <AnimatePresence>
        {showAlternativesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAlternativesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                  Postazione Occupata?
                </h3>
                <button
                  onClick={() => setShowAlternativesModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Ecco delle alternative equivalenti per <span className="text-white font-semibold">{currentExercise.name}</span>:
              </p>

              {currentAlternatives.length > 0 ? (
                <div className="space-y-3">
                  {currentAlternatives.map((alt, index) => {
                    // Calcola peso convertito se disponibile
                    const currentWeight = getCurrentExerciseWeight();
                    const convertedWeight = alt.weightFactor && currentWeight > 0
                      ? Math.round(currentWeight * alt.weightFactor)
                      : null;
                    const convertedReps = alt.repsFactor && alt.repsFactor !== 1
                      ? Math.round(targetReps * alt.repsFactor)
                      : null;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          // Sostituisci l'esercizio corrente
                          const updatedExercises = [...exercises];
                          const oldName = currentExercise.name;
                          updatedExercises[currentExerciseIndex] = {
                            ...currentExercise,
                            name: alt.name,
                            notes: `${currentExercise.notes || ''} (sostituito da ${oldName})`.trim(),
                            // Aggiorna peso se c'è conversione
                            ...(convertedWeight && { weight: convertedWeight }),
                            // Aggiorna reps se c'è conversione
                            ...(convertedReps && { reps: convertedReps })
                          };
                          setExercises(updatedExercises);
                          setShowAlternativesModal(false);

                          toast.success(`Esercizio cambiato!`, {
                            description: `${oldName} → ${alt.name}${convertedWeight ? ` (${convertedWeight}kg)` : ''}`
                          });
                        }}
                        className="w-full bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/50 rounded-xl p-4 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold group-hover:text-amber-300 transition-colors">
                              {alt.name}
                            </p>
                            {alt.notes && (
                              <p className="text-slate-400 text-xs mt-1">{alt.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {convertedWeight && (
                              <p className="text-amber-400 font-bold text-lg">{convertedWeight}kg</p>
                            )}
                            {convertedReps && (
                              <p className="text-blue-400 text-sm">{convertedReps} reps</p>
                            )}
                            {!convertedWeight && !convertedReps && (
                              <span className="text-slate-500 text-xs">
                                {alt.equipment === 'bodyweight' ? '🏠 Corpo libero' : '🏋️ Palestra'}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">Nessuna alternativa disponibile per questo esercizio.</p>
                  <p className="text-slate-500 text-sm mt-2">Prova a chiedere aiuto al trainer.</p>
                </div>
              )}

              <button
                onClick={() => setShowAlternativesModal(false)}
                className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
              >
                Annulla
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Reason Modal */}
      <AnimatePresence>
        {showSkipReasonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkipReasonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <SkipForward className="w-5 h-5 text-amber-400" />
                  Perché salti questo esercizio?
                </h3>
                <button
                  onClick={() => setShowSkipReasonModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Tracciamo i motivi per aiutarti a migliorare il programma.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleSkipWithReason('pain')}
                  className="w-full py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">🩹</span>
                  <div className="text-left">
                    <p className="font-semibold">Dolore/Fastidio</p>
                    <p className="text-xs text-red-400/70">Sento dolore in questa zona</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSkipWithReason('fatigue')}
                  className="w-full py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">😓</span>
                  <div className="text-left">
                    <p className="font-semibold">Troppo stanco</p>
                    <p className="text-xs text-amber-400/70">Non ho energie per questo esercizio</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSkipWithReason('equipment')}
                  className="w-full py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">🏋️</span>
                  <div className="text-left">
                    <p className="font-semibold">Attrezzatura non disponibile</p>
                    <p className="text-xs text-blue-400/70">Postazione occupata o macchinario rotto</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSkipWithReason('time')}
                  className="w-full py-3 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">⏰</span>
                  <div className="text-left">
                    <p className="font-semibold">Poco tempo</p>
                    <p className="text-xs text-purple-400/70">Devo accorciare la seduta</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSkipWithReason('dislike')}
                  className="w-full py-3 px-4 bg-slate-600/50 hover:bg-slate-600/70 text-slate-300 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">👎</span>
                  <div className="text-left">
                    <p className="font-semibold">Non mi piace</p>
                    <p className="text-xs text-slate-400/70">Preferisco altri esercizi</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowSkipReasonModal(false)}
                className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
              >
                Annulla
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Pattern Alert Modal */}
      <AnimatePresence>
        {showSkipAlert && currentSkipAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-amber-900/50 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-amber-500/30 shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Pattern Rilevato
                </h3>
                <p className="text-amber-300 font-semibold mt-1">
                  {MUSCLE_GROUP_NAMES[currentSkipAlert.muscle_group as keyof typeof MUSCLE_GROUP_NAMES]}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentSkipAlert.suggested_action}
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
                <p className="text-green-300 text-sm font-semibold">
                  💡 Suggerimento: -{currentSkipAlert.load_reduction_percent}% carico
                </p>
                <p className="text-green-400/70 text-xs mt-1">
                  Ridurremo automaticamente il carico per prevenire infortuni
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSkipAlertResponse(true)}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Accetta
                </button>
                <button
                  onClick={() => handleSkipAlertResponse(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                >
                  Ignora
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corrective Exercises Modal */}
      <AnimatePresence>
        {BETA_FLAGS.VIDEO_ANALYSIS && showCorrectivesModal && videoCorrectiveData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCorrectivesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-purple-900/50 to-slate-800 rounded-2xl p-6 max-w-lg w-full border border-purple-500/30 shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📹 Esercizi Correttivi
                </h3>
                <button
                  onClick={() => setShowCorrectivesModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Dall'analisi video di <span className="text-purple-300 font-semibold">{videoCorrectiveData.exerciseName}</span>,
                ecco gli esercizi consigliati per migliorare la tecnica:
              </p>

              {/* Issues detected */}
              {videoCorrectiveData.issues.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs uppercase mb-2">Problemi rilevati:</p>
                  <div className="flex flex-wrap gap-2">
                    {videoCorrectiveData.issues.map((issue, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          issue.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-600/50 text-slate-300'
                        }`}
                      >
                        {issue.name.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Corrective exercises */}
              <div className="space-y-3 mb-4">
                <p className="text-slate-500 text-xs uppercase">Esercizi correttivi:</p>
                {videoCorrectiveData.correctiveExercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{exercise.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exercise.type === 'activation' ? 'bg-emerald-500/20 text-emerald-300' :
                        exercise.type === 'mobility' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {exercise.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {exercise.sets}×{exercise.reps}
                    </p>
                    {exercise.notes && (
                      <p className="text-slate-500 text-xs mt-1">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobility drills */}
              {videoCorrectiveData.mobilityDrills.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs uppercase mb-2">Mobilità:</p>
                  <div className="flex flex-wrap gap-2">
                    {videoCorrectiveData.mobilityDrills.map((drill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full"
                      >
                        {drill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => {
                    if (!programId) {
                      toast.error('Nessun programma attivo');
                      return;
                    }
                    try {
                      const result = await addVideoCorrectiveExercisesToProgram(
                        userId,
                        programId,
                        videoCorrectiveData.correctiveExercises,
                        'warmup'
                      );
                      if (result.success) {
                        toast.success('Esercizi aggiunti!', {
                          description: result.message
                        });
                        setShowCorrectivesModal(false);
                      } else {
                        toast.error('Errore', { description: result.message });
                      }
                    } catch (error) {
                      toast.error('Errore durante l\'aggiunta');
                    }
                  }}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Aggiungi al Warmup
                </button>
                <button
                  onClick={() => setShowCorrectivesModal(false)}
                  className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                >
                  Dopo
                </button>
              </div>

              <p className="text-slate-500 text-xs text-center mt-3">
                Gli esercizi verranno aggiunti come riscaldamento a tutte le sessioni
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
