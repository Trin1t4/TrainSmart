import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Info, Check, Timer, RotateCw, X, ZoomIn, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getExerciseImageWithFallback, calculateLevelFromScreening } from '@trainsmart/shared';

// Video disponibili per i test iniziali (SOLO quelli verificati esistenti)
// Chiavi in italiano per match con i nomi tradotti
const SCREENING_VIDEOS: Record<string, string> = {
  // === PUSH-UPS (italiano) ===
  'Pike Push-up': '/videos/exercises/pike-push-up.mp4',
  'Pike Push-up Elevato': '/videos/exercises/pike-push-up.mp4',
  'HSPU al Muro (ROM parziale)': '/videos/exercises/wall-handstand-push-up.mp4',
  'HSPU al Muro (ROM completo)': '/videos/exercises/wall-handstand-push-up.mp4',
  'HSPU in Verticale Libera': '/videos/exercises/wall-handstand-push-up.mp4',
  'Push-up al Muro': '/videos/exercises/wall-push-up.mp4',
  'Push-up Inclinato (rialzato)': '/videos/exercises/incline-push-up.mp4',
  'Push-up Standard': '/videos/exercises/standard-push-up.mp4',
  'Push-up su Ginocchia': '/videos/exercises/knee-push-up.mp4',
  'Push-up Diamante': '/videos/exercises/diamond-push-up.mp4',
  'Push-up Arciere': '/videos/exercises/archer-push-up.mp4',
  'Pseudo Planche Push-up': '/videos/exercises/pseudo-planche-push-up.mp4',
  'Push-up a Un Braccio': '/videos/exercises/one-arm-push-up.mp4',
  'Camminata al Muro': '/videos/exercises/wall-walk.mp4',

  // === SQUAT (italiano) ===
  'Squat Assistito (con supporto)': '/videos/exercises/modified-squat.mp4',
  'Squat a Corpo Libero': '/videos/exercises/deep-squat-hold.mp4',
  'Squat con Salto': '/videos/exercises/squat-jump.mp4',
  'Split Squat Bulgaro': '/videos/exercises/bulgarian-split-squat.mp4',
  'Pistol Squat Assistito': '/videos/exercises/pistol-squat.mp4',
  'Shrimp Squat (Squat Gambero)': '/videos/exercises/shrimp-squat.mp4',
  'Pistol Squat': '/videos/exercises/pistol-squat.mp4',

  // === PULL (italiano) ===
  'Rematore Inverso (barra alta)': '/videos/exercises/inverted-row.mp4',
  'Rematore Inverso (barra media)': '/videos/exercises/inverted-row.mp4',
  'Rematore Inverso (barra bassa)': '/videos/exercises/inverted-row.mp4',
  'Trazione Negativa (solo eccentrica)': '/videos/exercises/standard-pull-up.mp4',
  'Trazione con Elastico': '/videos/exercises/assisted-pull-up.mp4',
  'Trazione alla Sbarra': '/videos/exercises/standard-pull-up.mp4',
  'Chin-up (presa supina)': '/videos/exercises/chin-up.mp4',
  'Trazione Arciere': '/videos/exercises/standard-pull-up.mp4',
  'Progressione Trazione a Un Braccio': '/videos/exercises/standard-pull-up.mp4',

  // === HINGE/CORE (italiano) ===
  'Ponte Glutei': '/videos/exercises/glute-bridge.mp4',
  'Ponte Glutei a Una Gamba': '/videos/exercises/single-leg-glute-bridge.mp4',
  'Hip Thrust': '/videos/exercises/hip-thrust.mp4',
  'Stacco Rumeno a Una Gamba (corpo libero)': '/videos/exercises/single-leg-rdl.mp4',
  'Nordic Curl (solo eccentrica)': '/videos/exercises/nordic-hamstring-curl.mp4',
  'Nordic Curl (completo)': '/videos/exercises/nordic-hamstring-curl.mp4',
  'Leg Curl Scivolato': '/videos/exercises/slider-leg-curl.mp4',
  'Slider Leg Curl': '/videos/exercises/slider-leg-curl.mp4',
  'Plank': '/videos/exercises/plank.mp4',
  'Plank Laterale': '/videos/exercises/side-plank.mp4',
  'Copenhagen Plank': '/videos/exercises/copenhagen-plank.mp4',
  'Hollow Body Hold': '/videos/exercises/hollow-body-hold.mp4',
  'L-sit Raccolto': '/videos/exercises/l-sit.mp4',
  'L-sit a Una Gamba': '/videos/exercises/l-sit.mp4',
  'L-sit Completo': '/videos/exercises/l-sit.mp4',
  'L-sit': '/videos/exercises/l-sit.mp4',
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
  'Chest Press': '/videos/exercises/chest-press.mp4',
  'Shoulder Press Machine': '/videos/exercises/shoulder-press-machine.mp4',
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

// ===== PROGRESSIONI CALISTHENICS SCIENTIFICHE =====
const CALISTHENICS_PATTERNS = [
  {
    id: 'lower_push',
    name: 'Spinta Gambe (Squat)',
    description: 'Progressioni squat - dalla più facile alla più difficile',
    progressions: [
      { id: 'squat_assisted', name: 'Squat Assistito (con supporto)', difficulty: 1 },
      { id: 'air_squat', name: 'Squat a Corpo Libero', difficulty: 2 },
      { id: 'jump_squat', name: 'Squat con Salto', difficulty: 4 },
      { id: 'bulgarian_split', name: 'Split Squat Bulgaro', difficulty: 5 },
      { id: 'pistol_assisted', name: 'Pistol Squat Assistito', difficulty: 7 },
      { id: 'shrimp_squat', name: 'Shrimp Squat (Squat Gambero)', difficulty: 8 },
      { id: 'pistol', name: 'Pistol Squat', difficulty: 10 }
    ]
  },
  {
    id: 'horizontal_push',
    name: 'Spinta Orizzontale (Push-up)',
    description: 'Progressioni push-up orizzontali',
    progressions: [
      { id: 'wall_pushup', name: 'Push-up al Muro', difficulty: 1 },
      { id: 'incline_pushup', name: 'Push-up Inclinato (rialzato)', difficulty: 2 },
      { id: 'knee_pushup', name: 'Push-up su Ginocchia', difficulty: 3 },
      { id: 'standard_pushup', name: 'Push-up Standard', difficulty: 5 },
      { id: 'diamond_pushup', name: 'Push-up Diamante', difficulty: 6 },
      { id: 'archer_pushup', name: 'Push-up Arciere', difficulty: 8 },
      { id: 'pseudo_planche', name: 'Pseudo Planche Push-up', difficulty: 9 },
      { id: 'one_arm_pushup', name: 'Push-up a Un Braccio', difficulty: 10 }
    ]
  },
  {
    id: 'vertical_push',
    name: 'Spinta Verticale (Pike → HSPU)',
    description: 'Progressioni spinta verticale verso handstand',
    progressions: [
      { id: 'pike_pushup', name: 'Pike Push-up', difficulty: 4 },
      { id: 'elevated_pike', name: 'Pike Push-up Elevato', difficulty: 5 },
      { id: 'wall_walk', name: 'Camminata al Muro', difficulty: 6 },
      { id: 'wall_hspu_partial', name: 'HSPU al Muro (ROM parziale)', difficulty: 7 },
      { id: 'wall_hspu', name: 'HSPU al Muro (ROM completo)', difficulty: 8 },
      { id: 'freestanding_hspu', name: 'HSPU in Verticale Libera', difficulty: 10 }
    ]
  },
  {
    id: 'vertical_pull',
    name: 'Tirata Verticale (Row → Trazioni)',
    description: 'Progressioni trazione verticale - BASE: rematore inverso',
    progressions: [
      { id: 'inverted_row_high', name: 'Rematore Inverso (barra alta)', difficulty: 2 },
      { id: 'inverted_row_mid', name: 'Rematore Inverso (barra media)', difficulty: 3 },
      { id: 'inverted_row_low', name: 'Rematore Inverso (barra bassa)', difficulty: 4 },
      { id: 'negative_pullup', name: 'Trazione Negativa (solo eccentrica)', difficulty: 5 },
      { id: 'band_pullup', name: 'Trazione con Elastico', difficulty: 6 },
      { id: 'pullup', name: 'Trazione alla Sbarra', difficulty: 7 },
      { id: 'chinup', name: 'Chin-up (presa supina)', difficulty: 7 },
      { id: 'archer_pullup', name: 'Trazione Arciere', difficulty: 9 },
      { id: 'one_arm_pullup_prog', name: 'Progressione Trazione a Un Braccio', difficulty: 10 }
    ]
  },
  {
    id: 'lower_pull',
    name: 'Tirata Gambe (Cerniera/Femorali)',
    description: 'Progressioni cerniera anca e femorali',
    progressions: [
      { id: 'glute_bridge', name: 'Ponte Glutei', difficulty: 2 },
      { id: 'single_leg_glute', name: 'Ponte Glutei a Una Gamba', difficulty: 3 },
      { id: 'rdl_bodyweight', name: 'Stacco Rumeno a Una Gamba (corpo libero)', difficulty: 4 },
      { id: 'nordic_eccentric', name: 'Nordic Curl (solo eccentrica)', difficulty: 6 },
      { id: 'nordic_full', name: 'Nordic Curl (completo)', difficulty: 9 },
      { id: 'sliding_leg_curl', name: 'Leg Curl Scivolato', difficulty: 5 }
    ]
  },
  {
    id: 'core',
    name: 'Stabilità Core',
    description: 'Progressioni core e stabilità',
    progressions: [
      { id: 'plank', name: 'Plank', difficulty: 2, isometric: true },
      { id: 'side_plank', name: 'Plank Laterale', difficulty: 3, isometric: true },
      { id: 'hollow_body', name: 'Hollow Body Hold', difficulty: 5, isometric: true },
      { id: 'lsit_tuck', name: 'L-sit Raccolto', difficulty: 6, isometric: true },
      { id: 'lsit_one_leg', name: 'L-sit a Una Gamba', difficulty: 7, isometric: true },
      { id: 'lsit_full', name: 'L-sit Completo', difficulty: 9, isometric: true },
      { id: 'dragon_flag', name: 'Dragon Flag', difficulty: 10 }
    ]
  }
];

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

export default function ScreeningFlowFull({ onComplete, userData, userId }) {
  const { t } = useTranslation();

  // Determina modalità test in base a location e trainingType
  const isGymMode = userData?.trainingLocation === 'gym' &&
                    (userData?.trainingType === 'equipment' || userData?.trainingType === 'machines');

  // Distingui tra pesi liberi e macchine
  const isMachinesMode = userData?.trainingType === 'machines';

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

  console.log('[SCREENING] Mode:', testType, '| Location:', userData?.trainingLocation, '| TrainingType:', userData?.trainingType);

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

    // 3. Parametri fisici (da onboarding - BMI, età)
    const onboardingData = localStorage.getItem('onboarding_data');
    let physicalScore = 65; // Default

    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const bmi = data.personalInfo?.bmi || 25;
      const age = data.personalInfo?.age || 30;

      // Score basato su BMI (18.5-24.9 = ottimale)
      let bmiScore = 70;
      if (bmi >= 18.5 && bmi <= 24.9) bmiScore = 85;
      else if (bmi < 18.5 || bmi > 30) bmiScore = 50;

      // Score basato su età
      let ageScore = 70;
      if (age < 30) ageScore = 85;
      else if (age < 40) ageScore = 75;
      else if (age > 50) ageScore = 60;

      physicalScore = ((bmiScore + ageScore) / 2).toFixed(1);
    }

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

    // 6. Salva dati completi con BASELINE per ogni pattern
    const screeningData = {
      level: level,
      finalScore: finalScore,
      quizScore: quizScore,
      practicalScore: practicalScore,
      physicalScore: physicalScore,
      patternBaselines: practicalResults, // ← BASELINE per programma
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

            {/* Bottone Avanti - NO freccia indietro nei test */}
            <button
              onClick={handleNext}
              disabled={isGymMode ? !weight : (!selectedVariant || !reps)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {currentPattern < MOVEMENT_PATTERNS.length - 1 ? 'Prossimo Pattern' : 'Completa Assessment'}
              <ArrowRight className="w-4 h-4" />
            </button>
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
