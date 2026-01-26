import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Info, Check, Timer, RotateCw, X, ZoomIn, Play, Pause, Volume2, VolumeX, BookOpen, Dumbbell } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import {
  getExerciseImageWithFallback,
  calculateLevelFromScreening,
  calculatePhysicalScoreFromOnboarding,
  CALISTHENICS_PATTERNS
} from '@trainsmart/shared';

// ============================================================
// DISCREPANCY DETECTION: Quiz teorico vs Test pratici
// ============================================================

interface ScreeningDiscrepancy {
  hasDiscrepancy: boolean;
  type: 'theory_practice_gap' | 'intuitive_mover' | 'balanced' | null;
  quizScore: number;
  practicalScore: number;
  gap: number;
  feedback: string;
}

/**
 * Rileva discrepanza tra conoscenza teorica (quiz) e capacità pratica (test)
 *
 * - theory_practice_gap: Conosce la teoria ma non riesce a metterla in pratica
 * - intuitive_mover: Si muove bene istintivamente ma non conosce la teoria
 * - balanced: Buon equilibrio tra teoria e pratica
 */
function detectScreeningDiscrepancy(
  quizScore: number,      // 0-100 dal quiz teorico
  practicalScore: number  // 0-100 dai test pratici
): ScreeningDiscrepancy {
  const gap = Math.abs(quizScore - practicalScore);
  const threshold = 25; // 25% di discrepanza = significativo

  if (gap < threshold) {
    return {
      hasDiscrepancy: false,
      type: 'balanced',
      quizScore,
      practicalScore,
      gap,
      feedback: 'Buon bilanciamento tra conoscenza teorica e capacità pratica.'
    };
  }

  if (quizScore > practicalScore) {
    return {
      hasDiscrepancy: true,
      type: 'theory_practice_gap',
      quizScore,
      practicalScore,
      gap,
      feedback: `Conosci bene la teoria (${quizScore}%) ma la pratica è indietro (${Math.round(practicalScore)}%). Focus: più pratica, meno studio. Il corpo impara facendo!`
    };
  }

  return {
    hasDiscrepancy: true,
    type: 'intuitive_mover',
    quizScore,
    practicalScore,
    gap,
    feedback: `Ti muovi bene istintivamente (${Math.round(practicalScore)}%) ma la teoria è debole (${quizScore}%). Focus: impara i principi base per evitare errori tecnici.`
  };
}

// Video disponibili per i test iniziali (SOLO quelli verificati esistenti)
// Chiavi in italiano per match con i nomi tradotti
const SCREENING_VIDEOS: Record<string, string> = {
  // === PUSH-UPS (italiano) ===
  'Pike Push-up': '/videos/exercises/pike-push-up.mp4',
  'Pike Push-up su Ginocchia': '/videos/exercises/pike-push-up.mp4',
  'Pike Push-up Elevato': '/videos/exercises/elevated-pike-push-up.mp4',
  'HSPU al Muro (ROM parziale)': '/videos/exercises/wall-handstand-push-up.mp4',
  'HSPU al Muro (ROM completo)': '/videos/exercises/wall-handstand-push-up.mp4',
  'HSPU al Muro (Deficit)': '/videos/exercises/wall-handstand-push-up.mp4',
  'HSPU in Verticale Libera': '/videos/exercises/wall-handstand-push-up.mp4',
  'Push-up al Muro': '/videos/exercises/wall-push-up.mp4',
  'Push-up Inclinato (rialzato)': '/videos/exercises/incline-push-up.mp4',
  'Push-up Standard': '/videos/exercises/standard-push-up.mp4',
  'Push-up su Ginocchia': '/videos/exercises/knee-push-up.mp4',
  'Push-up Larghi': '/videos/exercises/standard-push-up.mp4', // Fallback to standard
  'Push-up Diamante': '/videos/exercises/diamond-push-up.mp4',
  'Push-up Declinato': '/videos/exercises/decline-push-up.mp4',
  'Push-up Arciere': '/videos/exercises/archer-push-up.mp4',
  'Pseudo Planche Push-up': '/videos/exercises/pseudo-planche-push-up.mp4',
  'Push-up a Un Braccio': '/videos/exercises/one-arm-push-up.mp4',
  'Camminata al Muro': '/videos/exercises/wall-handstand-push-up.mp4', // Fallback - wall-walk.mp4 non disponibile

  // === SQUAT (italiano) ===
  'Squat Assistito (con supporto)': '/videos/exercises/modified-squat.mp4',
  'Squat a Corpo Libero': '/videos/exercises/deep-squat-hold.mp4',
  'Squat con Pausa': '/videos/exercises/pause-squat.mp4',
  'Squat con Salto': '/videos/exercises/squat-jump.mp4',
  'Split Squat': '/videos/exercises/split-squat.mp4',
  'Split Squat Bulgaro': '/videos/exercises/bulgarian-split-squat.mp4',
  'Skater Squat': '/videos/exercises/skater-squat.mp4',
  'Pistol Squat Assistito': '/videos/exercises/assisted-pistol-squat.mp4',
  'Shrimp Squat (Squat Gambero)': '/videos/exercises/shrimp-squat.mp4',
  'Pistol Squat': '/videos/exercises/pistol-squat.mp4',

  // === PULL (italiano) ===
  'Dead Hang': '/videos/exercises/standard-pull-up.mp4', // Fallback - same starting position
  'Rematore Inverso (barra alta)': '/videos/exercises/inverted-row.mp4',
  'Rematore Inverso (barra media)': '/videos/exercises/inverted-row.mp4',
  'Rematore Inverso (barra bassa)': '/videos/exercises/inverted-row.mp4',
  'Scapular Pull-up': '/videos/exercises/standard-pull-up.mp4', // Fallback
  'Trazione Negativa (solo eccentrica)': '/videos/exercises/standard-pull-up.mp4',
  'Trazione con Elastico': '/videos/exercises/assisted-pull-up.mp4',
  'Trazione alla Sbarra': '/videos/exercises/standard-pull-up.mp4',
  'Chin-up (presa supina)': '/videos/exercises/chin-up.mp4',
  'Trazioni Presa Larga': '/videos/exercises/wide-grip-pull-up.mp4',
  'Trazione Arciere': '/videos/exercises/standard-pull-up.mp4',
  'Progressione Trazione a Un Braccio': '/videos/exercises/standard-pull-up.mp4',

  // === HORIZONTAL PULL (Row pattern) ===
  'Floor Pull': '/videos/exercises/inverted-row.mp4', // Fallback
  'Inverted Row (Facilitato)': '/videos/exercises/inverted-row.mp4',
  'Inverted Row': '/videos/exercises/inverted-row.mp4',
  'Inverted Row (Piedi Elevati)': '/videos/exercises/inverted-row.mp4',
  'Archer Row': '/videos/exercises/inverted-row.mp4', // Fallback

  // === LOWER PULL / HINGE (italiano) ===
  'Ponte Glutei': '/videos/exercises/glute-bridge.mp4',
  'Ponte Glutei a Una Gamba': '/videos/exercises/single-leg-glute-bridge.mp4',
  'Hip Hinge a Corpo Libero': '/videos/exercises/romanian-deadlift.mp4', // Fallback
  'Hip Thrust': '/videos/exercises/hip-thrust.mp4',
  'Hip Thrust Rialzato': '/videos/exercises/hip-thrust.mp4',
  'Stacco Rumeno a Una Gamba (corpo libero)': '/videos/exercises/single-leg-rdl.mp4',
  'Leg Curl Scivolato': '/videos/exercises/slider-leg-curl.mp4',
  'Slider Leg Curl': '/videos/exercises/slider-leg-curl.mp4',
  'Nordic Curl (solo eccentrica)': '/videos/exercises/nordic-hamstring-curl.mp4',
  'Nordic Curl (Parziale)': '/videos/exercises/nordic-hamstring-curl.mp4',
  'Nordic Curl (Assistito)': '/videos/exercises/nordic-hamstring-curl.mp4',
  'Nordic Curl (completo)': '/videos/exercises/nordic-hamstring-curl.mp4',

  // === CORE (italiano) ===
  'Dead Bug': '/videos/exercises/dead-bug.mp4',
  'Bird Dog': '/videos/exercises/bird-dog.mp4',
  'Plank': '/videos/exercises/plank.mp4',
  'Plank Laterale': '/videos/exercises/side-plank.mp4',
  'Plank con Oscillazione': '/videos/exercises/plank.mp4', // Fallback to plank
  'Copenhagen Plank': '/videos/exercises/copenhagen-plank.mp4',
  'Hollow Body Hold': '/videos/exercises/hollow-body-hold.mp4',
  'Hollow Body Rock': '/videos/exercises/hollow-body-rock.mp4',
  'L-sit Raccolto': '/videos/exercises/l-sit.mp4',
  'L-sit a Una Gamba': '/videos/exercises/l-sit.mp4',
  'L-sit Completo': '/videos/exercises/l-sit.mp4',
  'L-sit': '/videos/exercises/l-sit.mp4',
  'Hanging Knee Raise': '/videos/exercises/hanging-knee-raise.mp4',
  'Hanging Leg Raise': '/videos/exercises/hanging-leg-raise.mp4',
  'Toes to Bar': '/videos/exercises/hanging-leg-raise.mp4', // Fallback
  'Dragon Flag (Parziale)': '/videos/exercises/dragon-flag.mp4',
  'Dragon Flag': '/videos/exercises/dragon-flag.mp4',
  'Lying Leg Raise': '/videos/exercises/lying-leg-raise.mp4',
  'Alzate Gambe Sdraiato': '/videos/exercises/lying-leg-raise.mp4',

  // === POWER/SALTI ===
  'Box Jump': '/videos/exercises/box-jump.mp4',
  'Broad Jump': '/videos/exercises/broad-jump.mp4',
  'Drop Jump': '/videos/exercises/drop-jump.mp4',
  'Counter Movement Jump': '/videos/exercises/counter-movement-jump.mp4',
  'Med Ball Chest Pass': '/videos/exercises/med-ball-chest-pass.mp4',
  'Med Ball Overhead Throw': '/videos/exercises/med-ball-overhead-throw.mp4',

  // === ROWS ===
  'Band Rows': '/videos/exercises/band-rows.mp4',
  'Rematore con Elastico': '/videos/exercises/band-rows.mp4',

  // === PALESTRA - Pesi Liberi (italiano) ===
  'Squat con Bilanciere': '/videos/exercises/back-squat.mp4',
  'Panca Piana': '/videos/exercises/flat-barbell-bench-press.mp4',
  'Lento Avanti': '/videos/exercises/military-press.mp4',
  'Lat Machine': '/videos/exercises/lat-pulldown.mp4',
  'Pulley Basso': '/videos/exercises/seated-cable-row.mp4',
  'Stacco da Terra': '/videos/exercises/conventional-deadlift.mp4',
  'Crunch ai Cavi': '/videos/exercises/cable-crunch.mp4',

  // === PALESTRA - Macchine (italiano) ===
  'Leg Press': '/videos/exercises/leg-press.mp4',
  'Chest Press': '/videos/exercises/dumbbell-bench-press.mp4', // Fallback - chest-press.mp4 non disponibile
  'Shoulder Press Machine': '/videos/exercises/dumbbell-shoulder-press.mp4', // Fallback - shoulder-press-machine.mp4 non disponibile
  'Leg Curl': '/videos/exercises/leg-curl.mp4',
};

/**
 * Calcola 1RM usando formule multiple per maggiore accuratezza
 *
 * - Reps 1-6: Brzycki (più accurata per bassi reps)
 * - Reps 7-10: Media Brzycki + Epley
 * - Reps 11+: Epley (più accurata per alti reps)
 *
 * Nota: Per reps > 15, l'errore può essere significativo.
 * In questi casi, è consigliabile usare pesi più pesanti per il test.
 */
function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;

  // Formule:
  // Brzycki: weight * 36 / (37 - reps) oppure weight / (1.0278 - 0.0278 × reps)
  // Epley: weight * (1 + reps / 30)
  // Lander: weight * 100 / (101.3 - 2.67 * reps)

  const brzycki = weight / (1.0278 - 0.0278 * reps);
  const epley = weight * (1 + reps / 30);

  if (reps <= 6) {
    // Brzycki è più accurata per bassi reps
    return Math.round(brzycki * 10) / 10;
  } else if (reps <= 10) {
    // Media delle due formule
    return Math.round(((brzycki + epley) / 2) * 10) / 10;
  } else {
    // Epley è più accurata per alti reps, ma con warning
    // Per reps > 15, l'errore può superare il 10%
    if (reps > 15) {
      console.warn(`[1RM] High rep count (${reps}) - estimate may be inaccurate (±15%)`);
    }
    return Math.round(epley * 10) / 10;
  }
}

// ===== PROGRESSIONI CALISTHENICS - IMPORTATE DA SSOT =====
// CALISTHENICS_PATTERNS è importato da @trainsmart/shared (Single Source of Truth)

// ===== PROGRESSIONI PALESTRA - PESI LIBERI (10RM TEST) =====
// Per chi si allena con bilanciere e manubri
const GYM_PATTERNS_FREEWEIGHTS = [
  {
    id: 'lower_push',
    name: 'Squat con Bilanciere',
    description: 'Test 10RM Squat con bilanciere',
    exercise: { id: 'back_squat', name: 'Squat con Bilanciere', unit: 'kg' }
  },
  {
    id: 'horizontal_push',
    name: 'Panca Piana',
    description: 'Test 10RM Panca piana con bilanciere',
    exercise: { id: 'bench_press', name: 'Panca Piana', unit: 'kg' }
  },
  {
    id: 'vertical_push',
    name: 'Lento Avanti',
    description: 'Test 10RM Lento avanti con bilanciere in piedi',
    exercise: { id: 'military_press', name: 'Lento Avanti', unit: 'kg' }
  },
  {
    id: 'vertical_pull',
    name: 'Lat Machine',
    description: 'Test 10RM Lat Machine (o Trazioni zavorrate)',
    exercise: { id: 'lat_pulldown', name: 'Lat Machine', unit: 'kg' }
  },
  {
    id: 'horizontal_pull',
    name: 'Pulley Basso',
    description: 'Test 10RM Pulley Basso (rematore ai cavi)',
    exercise: { id: 'low_cable_row', name: 'Pulley Basso', unit: 'kg' }
  },
  {
    id: 'lower_pull',
    name: 'Stacco da Terra',
    description: 'Test 10RM Stacco da terra con bilanciere',
    exercise: { id: 'deadlift', name: 'Stacco da Terra', unit: 'kg' }
  },
  {
    id: 'core',
    name: 'Crunch ai Cavi',
    description: 'Test 10RM Crunch ai cavi',
    exercise: { id: 'cable_crunch', name: 'Crunch ai Cavi', unit: 'kg' }
  }
];

// ===== PROGRESSIONI PALESTRA - MACCHINE (10RM TEST) =====
// Per chi si allena prevalentemente con macchine isotoniche
const GYM_PATTERNS_MACHINES = [
  {
    id: 'lower_push',
    name: 'Pressa (Leg Press)',
    description: 'Test 10RM Pressa per le gambe',
    exercise: { id: 'leg_press', name: 'Leg Press', unit: 'kg' }
  },
  {
    id: 'horizontal_push',
    name: 'Chest Press',
    description: 'Test 10RM Chest Press (pettorali)',
    exercise: { id: 'chest_press', name: 'Chest Press', unit: 'kg' }
  },
  {
    id: 'vertical_push',
    name: 'Shoulder Press (Macchina)',
    description: 'Test 10RM Shoulder Press alla macchina',
    exercise: { id: 'shoulder_press_machine', name: 'Shoulder Press Machine', unit: 'kg' }
  },
  {
    id: 'vertical_pull',
    name: 'Lat Machine',
    description: 'Test 10RM Lat Machine',
    exercise: { id: 'lat_pulldown', name: 'Lat Machine', unit: 'kg' }
  },
  {
    id: 'horizontal_pull',
    name: 'Pulley Basso',
    description: 'Test 10RM Pulley Basso (rematore ai cavi)',
    exercise: { id: 'low_cable_row', name: 'Pulley Basso', unit: 'kg' }
  },
  {
    id: 'lower_pull',
    name: 'Leg Curl',
    description: 'Test 10RM Leg Curl (femorali)',
    exercise: { id: 'leg_curl', name: 'Leg Curl', unit: 'kg' }
  },
  {
    id: 'core',
    name: 'Crunch ai Cavi',
    description: 'Test 10RM Crunch ai cavi',
    exercise: { id: 'cable_crunch', name: 'Crunch ai Cavi', unit: 'kg' }
  }
];

export default function ScreeningFlowFull({ onComplete, userData, userId, demoMode = false }: {
  onComplete: (results: any) => void;
  userData?: any;
  userId: string;
  demoMode?: boolean;
}) {
  const { t } = useTranslation();

  // FIX: Garantisci che userData abbia sempre trainingLocation con fallback a localStorage
  const effectiveUserData = useMemo(() => {
    // Se userData ha già trainingLocation, usalo
    if (userData?.trainingLocation) {
      console.log('[ScreeningFlowFull] Using passed userData:', userData.trainingLocation);
      return userData;
    }

    // Fallback: recupera da localStorage
    try {
      const stored = localStorage.getItem('onboarding_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[ScreeningFlowFull] Fallback to localStorage:', parsed.trainingLocation);
        return {
          ...userData,
          trainingLocation: parsed.trainingLocation || 'home',
          trainingType: parsed.trainingType || 'bodyweight',
          equipment: parsed.equipment || {},
          personalInfo: parsed.personalInfo
        };
      }
    } catch (e) {
      console.error('[ScreeningFlowFull] Error reading localStorage:', e);
    }

    // Ultimate fallback: assume home/bodyweight (più sicuro - non richiede attrezzatura)
    console.warn('[ScreeningFlowFull] No userData found, defaulting to home/bodyweight');
    return {
      ...userData,
      trainingLocation: 'home',
      trainingType: 'bodyweight',
      equipment: {}
    };
  }, [userData]);

  // Determina modalità test in base a location e trainingType (usa effectiveUserData)
  const isGymMode = effectiveUserData?.trainingLocation === 'gym' &&
                    (effectiveUserData?.trainingType === 'equipment' || effectiveUserData?.trainingType === 'machines');

  // Distingui tra pesi liberi e macchine
  const isMachinesMode = effectiveUserData?.trainingType === 'machines';

  // Seleziona il set di pattern corretto
  let MOVEMENT_PATTERNS;
  let testType;

  // FULL SCREENING: 4 test - squat, tirata, spinta orizzontale, core
  const FULL_PATTERN_IDS = ['lower_push', 'vertical_pull', 'horizontal_push', 'core'];

  if (!isGymMode) {
    // Calisthenics / Corpo libero
    MOVEMENT_PATTERNS = CALISTHENICS_PATTERNS.filter(p => FULL_PATTERN_IDS.includes(p.id));
    testType = 'CALISTHENICS';
  } else if (isMachinesMode) {
    // Palestra con macchine isotoniche
    MOVEMENT_PATTERNS = GYM_PATTERNS_MACHINES.filter(p => FULL_PATTERN_IDS.includes(p.id));
    testType = 'GYM_MACHINES';
  } else {
    // Palestra con pesi liberi (bilanciere/manubri)
    MOVEMENT_PATTERNS = GYM_PATTERNS_FREEWEIGHTS.filter(p => FULL_PATTERN_IDS.includes(p.id));
    testType = 'GYM_FREEWEIGHTS';
  }

  const [currentPattern, setCurrentPattern] = useState(0);
  const [results, setResults] = useState({});
  const [selectedVariant, setSelectedVariant] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState(''); // Per GYM mode (kg)
  const [showSummary, setShowSummary] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string; isVideo?: boolean } | null>(null);

  const pattern = MOVEMENT_PATTERNS[currentPattern];
  const progress = ((currentPattern + 1) / MOVEMENT_PATTERNS.length) * 100;

  console.log('[SCREENING-FULL] Mode:', testType, '| Location:', effectiveUserData?.trainingLocation, '| TrainingType:', effectiveUserData?.trainingType);

  // Funzione per tornare indietro
  const handleBack = () => {
    if (currentPattern > 0) {
      const prevPattern = MOVEMENT_PATTERNS[currentPattern - 1];
      const prevResult = results[prevPattern.id];

      setCurrentPattern(currentPattern - 1);

      // Ripristina i valori del pattern precedente
      if (prevResult) {
        if (isGymMode) {
          setWeight(prevResult.weight10RM?.toString() || '');
        } else {
          setSelectedVariant(prevResult.variantId || '');
          setReps(prevResult.reps?.toString() || '');
        }
      } else {
        setSelectedVariant('');
        setReps('');
        setWeight('');
      }
    }
  };

  // Funzione per aprire preview immagine/video
  const openImagePreview = (mediaUrl: string, exerciseName: string) => {
    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm');
    setImagePreview({ url: mediaUrl, name: exerciseName, isVideo });
  };

  // Funzione per chiudere preview immagine
  const closeImagePreview = () => {
    setImagePreview(null);
  };

  // Gestione tasto ESC per chiudere modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imagePreview) {
        closeImagePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imagePreview]);

  const handleNext = () => {
    // Validation diversa per GYM vs CALISTHENICS
    if (isGymMode) {
      // GYM: serve peso in kg (10RM fisso)
      if (!weight || parseFloat(weight) === 0) {
        alert('Inserisci il peso massimo (10RM) per questo esercizio');
        return;
      }
    } else {
      // CALISTHENICS: serve variante + reps/secondi
      if (!selectedVariant || !reps || parseInt(reps) === 0) {
        const selectedProgression = pattern.progressions?.find(p => p.id === selectedVariant);
        const unit = selectedProgression?.isometric ? 'secondi' : 'ripetizioni';
        alert(`Seleziona una variante e inserisci il numero di ${unit}`);
        return;
      }
    }

    let newResults;

    if (isGymMode) {
      // GYM MODE: Calcola 1RM con formula Brzycki
      const weight10RM = parseFloat(weight);
      const oneRM = calculateOneRepMax(weight10RM, 10);

      // Score basato su 1RM (normalizzato rispetto a peso corporeo)
      const bodyWeight = userData?.personalInfo?.weight || 70;
      const relativeStrength = oneRM / bodyWeight;

      // Score: relativeStrength moltiplicato per fattore pattern
      // Esempio: Squat 1RM = 100kg, BW = 70kg → 1.43 × 100 = 143
      const score = Math.round(relativeStrength * 100);

      newResults = {
        ...results,
        [pattern.id]: {
          patternName: pattern.name,
          variantId: pattern.exercise.id,
          variantName: pattern.exercise.name,
          weight10RM: weight10RM,
          oneRM: Math.round(oneRM * 10) / 10, // Arrotonda a 1 decimale
          relativeStrength: Math.round(relativeStrength * 100) / 100,
          difficulty: 8, // GYM exercises considerati advanced difficulty
          reps: 10, // Fisso per 10RM test
          score: score,
          mode: 'GYM'
        }
      };

      console.log(`[GYM] ${pattern.name}: 10RM=${weight10RM}kg → 1RM=${Math.round(oneRM)}kg | Score=${score}`);
    } else {
      // CALISTHENICS MODE: Sistema attuale
      const selectedProgression = pattern.progressions.find(p => p.id === selectedVariant);

      newResults = {
        ...results,
        [pattern.id]: {
          patternName: pattern.name,
          variantId: selectedVariant,
          variantName: selectedProgression.name,
          difficulty: selectedProgression.difficulty,
          reps: parseInt(reps),
          isometric: selectedProgression.isometric || false,
          score: selectedProgression.difficulty * parseInt(reps), // Fixed: removed × 10 multiplier
          mode: 'CALISTHENICS'
        }
      };
    }

    setResults(newResults);

    if (currentPattern < MOVEMENT_PATTERNS.length - 1) {
      setCurrentPattern(currentPattern + 1);
      setSelectedVariant('');
      setReps('');
      setWeight('');
    } else {
      // Completa screening
      calculateAndSave(newResults);
    }
  };

  const calculateAndSave = (practicalResults) => {
    // 1. Recupera quiz score - CALCOLA PERCENTUALE CORRETTA
    const quizData = localStorage.getItem('quiz_data');
    let quizScore = 50; // default

    if (quizData) {
      const parsed = JSON.parse(quizData);
      // Se abbiamo correctAnswers e totalQuestions, calcola la percentuale reale
      if (parsed.correctAnswers !== undefined && parsed.totalQuestions) {
        quizScore = Math.round((parsed.correctAnswers / parsed.totalQuestions) * 100);
      } else if (parsed.score !== undefined) {
        // Fallback: se score è già una percentuale (0-100), usalo
        // Altrimenti se è un punteggio pesato basso (<20), probabilmente è raw score
        // In quel caso, stimiamo che il max score sia ~14 per quiz full (7 domande × peso medio 2)
        const maxPossibleScore = (parsed.totalQuestions || 7) * 2; // peso medio ~2
        quizScore = parsed.score > 20 ? parsed.score : Math.round((parsed.score / maxPossibleScore) * 100);
      }
    }

    // 2. Calcola practical score dai pattern
    const patternScores = Object.values(practicalResults);
    const totalScore = patternScores.reduce((sum, p: any) => sum + p.score, 0);
    const maxPossibleScore = MOVEMENT_PATTERNS.length * 10 * 20; // 6 pattern × difficulty 10 × 20 reps
    const practicalScore = ((totalScore / maxPossibleScore) * 100).toFixed(1);

    // 3. Parametri fisici (da onboarding - Navy formula body composition)
    // Usa calculatePhysicalScoreFromOnboarding per calcolo più accurato
    const onboardingDataStr = localStorage.getItem('onboarding_data');
    const onboardingData = onboardingDataStr ? JSON.parse(onboardingDataStr) : null;
    const physicalScore = calculatePhysicalScoreFromOnboarding(onboardingData).toFixed(1);

    // 4. Score finale ponderato
    // ✅ FIX PROPORZIONI: Practical conta DI PIÙ del quiz teorico!
    // - Quiz teorico è utile ma secondario (20%)
    // - Test pratici sono LA cosa più importante (60%)
    // - Parametri fisici sono contesto (20%)
    const finalScore = (
      quizScore * 0.2 +                    // 20% peso al quiz teorico
      parseFloat(practicalScore) * 0.6 +   // 60% peso ai test pratici (PRINCIPALE!)
      parseFloat(physicalScore) * 0.2      // 20% peso ai parametri fisici
    ).toFixed(1);

    // 5. Determina livello usando funzione centralizzata
    const { level, finalScore: calculatedScore } = calculateLevelFromScreening(
      parseFloat(practicalScore),
      quizScore,
      parseFloat(physicalScore),
      isMachinesMode
    );

    if (isMachinesMode) {
      console.log('[SCREENING] ⚠️ Machines mode detected → forcing BEGINNER level');
    }

    // 5.5 Rileva discrepanza tra quiz e test pratici
    const discrepancy = detectScreeningDiscrepancy(quizScore, parseFloat(practicalScore));
    if (discrepancy.hasDiscrepancy) {
      console.log('[SCREENING] 🔍 Discrepancy detected:', discrepancy.type, `(gap: ${discrepancy.gap}%)`);
    }

    // 6. Salva dati completi con BASELINE per ogni pattern
    const screeningData = {
      level: level,
      finalScore: finalScore,
      quizScore: quizScore,
      practicalScore: practicalScore,
      physicalScore: physicalScore,
      patternBaselines: practicalResults, // ← BASELINE per programma
      discrepancy: discrepancy.hasDiscrepancy ? discrepancy.type : null,
      discrepancyGap: discrepancy.gap,
      discrepancyFeedback: discrepancy.feedback,
      completed: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('screening_data', JSON.stringify(screeningData));

    // Clear "test later" flag since tests are now completed
    localStorage.removeItem('screening_pending');

    const mode = Object.values(practicalResults)[0]?.mode || 'CALISTHENICS';
    console.log(`=== SCREENING ${mode} COMPLETED ===`);
    console.log('Quiz Score:', quizScore + '%');
    console.log('Practical Score:', practicalScore + '%');
    console.log('Physical Score:', physicalScore + '%');
    console.log('FINAL SCORE:', finalScore + '%');
    console.log('LEVEL:', level.toUpperCase());
    console.log('PATTERN BASELINES:', practicalResults);
    console.log('========================================');

    // 7. Mostra summary
    setShowSummary(true);
  };

  if (showSummary) {
    const screeningData = JSON.parse(localStorage.getItem('screening_data'));

    return (
      <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">
                Assessment Completato!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-block bg-emerald-500/20 border-2 border-emerald-500 rounded-full px-8 py-4">
                  <p className="text-sm text-emerald-300 mb-1">Il tuo livello</p>
                  <p className="text-4xl font-bold text-emerald-400 uppercase">
                    {screeningData.level}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Quiz Teorico</p>
                    <p className="text-2xl font-bold text-blue-400">{screeningData.quizScore}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Test Pratici</p>
                    <p className="text-2xl font-bold text-purple-400">{screeningData.practicalScore}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Parametri Fisici</p>
                    <p className="text-2xl font-bold text-orange-400">{screeningData.physicalScore}%</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6 mt-6">
                  <p className="text-sm text-slate-400 mb-2">Score Finale</p>
                  <p className="text-5xl font-bold text-white">{screeningData.finalScore}%</p>
                </div>

                {/* Discrepancy Feedback - Teoria vs Pratica */}
                {screeningData.discrepancy && (
                  <div className={`rounded-lg p-5 mt-6 border-2 ${
                    screeningData.discrepancy === 'theory_practice_gap'
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-blue-500/10 border-blue-500/50'
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        screeningData.discrepancy === 'theory_practice_gap'
                          ? 'bg-amber-500/20'
                          : 'bg-blue-500/20'
                      }`}>
                        {screeningData.discrepancy === 'theory_practice_gap' ? (
                          <BookOpen className="w-6 h-6 text-amber-400" />
                        ) : (
                          <Dumbbell className="w-6 h-6 text-blue-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg mb-1 ${
                          screeningData.discrepancy === 'theory_practice_gap'
                            ? 'text-amber-300'
                            : 'text-blue-300'
                        }`}>
                          {screeningData.discrepancy === 'theory_practice_gap'
                            ? '📚 Teorico ma Poco Pratico'
                            : '💪 Intuitivo ma Poco Teorico'}
                        </h4>
                        <p className={`text-sm ${
                          screeningData.discrepancy === 'theory_practice_gap'
                            ? 'text-amber-200/80'
                            : 'text-blue-200/80'
                        }`}>
                          {screeningData.discrepancyFeedback}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          <span className="flex items-center gap-1 text-slate-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            Quiz: {screeningData.quizScore}%
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Dumbbell className="w-3.5 h-3.5" />
                            Pratico: {screeningData.practicalScore}%
                          </span>
                          <span className="text-slate-500">
                            Gap: {screeningData.discrepancyGap?.toFixed(0) || Math.abs(screeningData.quizScore - screeningData.practicalScore).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pattern Baselines */}
                <div className="bg-slate-700/30 rounded-lg p-6 mt-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-400" />
                    Le tue baseline per ogni pattern
                  </h3>
                  <div className="space-y-3">
                    {Object.values(screeningData.patternBaselines).map((pattern: any, idx: number) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                        <p className="text-sm text-slate-300 font-medium">{pattern.patternName}</p>
                        {pattern.mode === 'GYM' ? (
                          <>
                            <p className="text-emerald-400 text-sm mt-1 font-mono">
                              {pattern.variantName}: 10RM = <strong>{pattern.weight10RM} kg</strong>
                            </p>
                            <p className="text-blue-400 text-xs mt-1 font-mono">
                              1RM stimato: {pattern.oneRM} kg • Rel. Strength: {pattern.relativeStrength}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-emerald-400 text-sm mt-1 flex items-center gap-2">
                              {pattern.isometric ? (
                                <>
                                  <Timer className="w-4 h-4" />
                                  {pattern.variantName} × {pattern.reps} secondi
                                </>
                              ) : (
                                <>
                                  <RotateCw className="w-4 h-4" />
                                  {pattern.variantName} × {pattern.reps} reps
                                </>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Difficoltà: {pattern.difficulty}/10
                            </p>
                          </>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Score: {pattern.score}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onComplete(screeningData)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {t('common.continue')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Assessment Pratico - Pattern {currentPattern + 1}/{MOVEMENT_PATTERNS.length}</h1>
            <span className="text-slate-300">{currentPattern + 1} / {MOVEMENT_PATTERNS.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{pattern.name}</CardTitle>
            <p className="text-slate-400 text-sm mt-2">{pattern.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
              <p className="text-emerald-300 font-medium mb-2">
                📋 {isGymMode ? 'Test 10RM' : 'Cosa fare'}:
              </p>
              {isGymMode ? (
                <ol className="text-emerald-200 text-sm space-y-1 list-decimal list-inside">
                  <li>Trova il peso massimo con cui riesci a fare <strong>esattamente 10 ripetizioni</strong> con forma perfetta</li>
                  <li>Inserisci il peso in kg (10RM = 10 Rep Max)</li>
                  <li>Calcoleremo automaticamente il tuo 1RM usando la formula di Brzycki</li>
                </ol>
              ) : (
                <ol className="text-emerald-200 text-sm space-y-1 list-decimal list-inside">
                  <li>Seleziona la variante più difficile che riesci a fare con buona forma</li>
                  <li>Inserisci il numero massimo di ripetizioni pulite che riesci a completare</li>
                </ol>
              )}
            </div>

            {isGymMode ? (
              /* GYM MODE: Solo input peso */
              <div className="space-y-2">
                <label className="text-white font-display font-semibold text-lg">
                  Peso 10RM (kg) - {pattern.name}
                </label>
                <p className="text-slate-400 text-sm mb-2">
                  Il peso massimo con cui riesci a fare esattamente 10 ripetizioni con forma perfetta
                </p>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="es. 60"
                    className="w-full p-4 pr-12 rounded-xl bg-slate-700 border-2 border-slate-600 text-white font-mono text-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">kg</span>
                </div>
                {weight && parseFloat(weight) > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-2">
                    <p className="text-blue-300 text-sm">
                      🎯 1RM stimato: <strong className="font-mono text-lg">{Math.round(calculateOneRepMax(parseFloat(weight), 10))} kg</strong>
                    </p>
                    <p className="text-blue-400 text-xs mt-1">
                      Calcolato con formula di Brzycki
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* CALISTHENICS MODE: Lista visuale con immagini */
              <>
                <div className="space-y-3">
                  <label className="text-white font-medium">Seleziona la variante più difficile che riesci a fare:</label>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                    {pattern.progressions.map((prog) => {
                      const videoUrl = SCREENING_VIDEOS[prog.name];
                      const imageUrl = getExerciseImageWithFallback(prog.name);
                      const isSelected = selectedVariant === prog.id;
                      const hasVideo = !!videoUrl;

                      return (
                        <div key={prog.id} className="relative">
                          <button
                            onClick={() => setSelectedVariant(prog.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            {/* Video o Immagine esercizio con pulsante zoom */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 group">
                              {hasVideo ? (
                                <>
                                  <video
                                    src={videoUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    onError={(e) => {
                                      // Fallback a immagine se video non carica
                                      const target = e.target as HTMLVideoElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-full h-full items-center justify-center text-2xl hidden">
                                    {imageUrl ? (
                                      <img src={imageUrl} alt={prog.name} className="w-full h-full object-cover" />
                                    ) : '🏋️'}
                                  </div>
                                  {/* Badge video */}
                                  <div className="absolute bottom-0.5 right-0.5 bg-emerald-500/90 rounded px-1 py-0.5">
                                    <Play className="w-2.5 h-2.5 text-white fill-white" />
                                  </div>
                                  {/* Bottone zoom overlay */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openImagePreview(videoUrl, prog.name);
                                    }}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <ZoomIn className="w-6 h-6 text-white" />
                                  </button>
                                </>
                              ) : imageUrl ? (
                                <>
                                  <img
                                    src={imageUrl}
                                    alt={prog.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect fill="%23374151" width="64" height="64"/><text x="32" y="36" text-anchor="middle" fill="%239ca3af" font-size="24">🏋️</text></svg>';
                                    }}
                                  />
                                  {/* Bottone zoom overlay */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openImagePreview(imageUrl, prog.name);
                                    }}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <ZoomIn className="w-6 h-6 text-white" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  🏋️
                                </div>
                              )}
                            </div>

                            {/* Info esercizio */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                                  {prog.name}
                                </p>
                                {prog.isometric && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                                    <Timer className="w-3 h-3" />
                                    Isometrico
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < prog.difficulty
                                          ? 'bg-emerald-500'
                                          : 'bg-slate-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-400">
                                  {prog.difficulty}/10
                                </span>
                              </div>
                            </div>

                            {/* Checkmark */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : 'border-2 border-slate-500'
                            }`}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input ripetizioni/secondi - appare solo dopo selezione */}
                {selectedVariant && (() => {
                  const selectedProgression = pattern.progressions.find(p => p.id === selectedVariant);
                  const isIsometric = selectedProgression?.isometric || false;
                  const unit = isIsometric ? 'secondi' : 'ripetizioni';
                  const icon = isIsometric ? Timer : RotateCw;
                  const IconComponent = icon;

                  return (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-white font-medium flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-emerald-400" />
                        {isIsometric
                          ? `Per quanti secondi riesci a tenere "${selectedProgression?.name}"?`
                          : `Quante ripetizioni pulite riesci a fare di "${selectedProgression?.name}"?`
                        }
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={isIsometric ? "300" : "100"}
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder={isIsometric ? "es. 60" : "es. 10"}
                          className="w-full p-4 pr-24 rounded-xl bg-slate-700 border-2 border-slate-600 text-white text-lg focus:border-emerald-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium flex items-center gap-1">
                          <IconComponent className="w-4 h-4" />
                          {unit}
                        </span>
                      </div>
                      {isIsometric && reps && parseInt(reps) > 0 && (
                        <p className="text-xs text-blue-300 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Mantieni la posizione corretta per {reps} {unit}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            <div className="flex gap-3">
              {/* Bottone Indietro */}
              {currentPattern > 0 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Indietro
                </button>
              )}

              {/* Bottone Avanti */}
              <button
                onClick={handleNext}
                disabled={isGymMode ? !weight : (!selectedVariant || !reps)}
                className={`${currentPattern > 0 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2`}
              >
                {currentPattern < MOVEMENT_PATTERNS.length - 1 ? 'Prossimo Pattern' : 'Completa Assessment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Preview Immagine */}
        {imagePreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeImagePreview}
          >
            <div
              className="relative max-w-4xl w-full bg-slate-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ZoomIn className="w-5 h-5 text-emerald-400" />
                  {imagePreview.name}
                </h3>
                <button
                  onClick={closeImagePreview}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video o Immagine grande */}
              <div className="p-6">
                <div className="relative rounded-xl overflow-hidden bg-slate-900">
                  {imagePreview.isVideo ? (
                    <video
                      src={imagePreview.url}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={imagePreview.url}
                      alt={imagePreview.name}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="%23374151" width="400" height="400"/><text x="200" y="220" text-anchor="middle" fill="%239ca3af" font-size="48">🏋️</text></svg>';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Footer con hint */}
              <div className="px-6 pb-4">
                <p className="text-sm text-slate-400 text-center">
                  Clicca fuori dall'immagine o premi ESC per chiudere
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
