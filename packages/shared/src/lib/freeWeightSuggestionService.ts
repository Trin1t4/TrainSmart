/**
 * Free Weight Suggestion Service
 *
 * Propone esercizi a corpo libero/pesi liberi a chi usa solo macchine,
 * ma SOLO quando l'utente e in condizioni ottimali (lucidita completa).
 *
 * Funzionalità:
 * - Proposta graduale pesi liberi (1x/settimana, solo in condizioni ottimali)
 * - Aggiornamento automatico preferenze dopo 3 accettazioni
 * - Tracking progressi macchina → peso libero
 * - Stima carico iniziale ribassata per sicurezza
 */

export interface RecoveryConditions {
  sleepHours: number;
  stressLevel: number;
  hasInjury: boolean;
  menstrualCycle?: 'follicular' | 'ovulation' | 'luteal' | 'menstruation' | 'menopause' | 'prefer_not_say' | null;
}

export interface FreeWeightSuggestion {
  shouldSuggest: boolean;
  machineExercise: string;
  freeWeightAlternative: string;
  freeWeightDescription: string;
  videoUrl?: string;
  reason?: string;
  suggestedWeight?: number; // Peso suggerito per iniziare (basato su macchina)
}

// Record di progressione per un esercizio
export interface ExerciseProgressRecord {
  date: string;
  exerciseType: 'machine' | 'free_weight';
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

// Tracking completo per una coppia macchina/peso libero
export interface MachineToFreeWeightProgress {
  machineExercise: string;
  freeWeightExercise: string;
  machineHistory: ExerciseProgressRecord[];
  freeWeightHistory: ExerciseProgressRecord[];
  transitionDate?: string; // Quando ha iniziato a usare il peso libero
  isTransitioned: boolean; // Se ha completato la transizione
}

// Fattori di conversione carico: macchina → peso libero
// Valori < 1 perché il peso libero richiede più stabilizzazione
const MACHINE_TO_FREEWEIGHT_CONVERSION: Record<string, number> = {
  // Leg Press → Squat o Stacco (progressione multipla)
  'leg_press': 0.35,      // Leg Press 100kg → Squat ~35kg (bilanciere incluso)
  'Leg Press': 0.35,
  'leg_press_to_deadlift': 0.40, // Leg Press 100kg → Stacco ~40kg per iniziare
  'Leg Press_to_deadlift': 0.40,
  // Upper body
  'chest_press': 0.70,    // Chest Press 60kg → Panca ~42kg
  'Chest Press': 0.70,
  'shoulder_press_machine': 0.65, // Shoulder Press 40kg → Military ~26kg
  'Shoulder Press Machine': 0.65,
  'row_machine': 0.75,    // Row Machine 50kg → Pulley ~38kg
  'Row Machine': 0.75,
  // Lower body isolamento → nessuna conversione per leg_curl (resta isolamento)
  'leg_extension': 0.40,  // Leg Extension 50kg → Bulgarian ~20kg (manubri)
  'Leg Extension': 0.40,
  // Glutei e catena posteriore
  'glute_machine': 0.70,  // Glute Machine → Hip Thrust Bilanciere
  'Glute Machine': 0.70,
  'back_extension': 0.60, // Back Extension → Good Morning (carico ridotto)
  'Back Extension': 0.60,
  'hip_thrust_machine': 0.80, // Hip Thrust Machine → Hip Thrust Bilanciere
  'Hip Thrust Machine': 0.80,
};

// Tipo per alternativa singola
interface FreeWeightAlternativeInfo {
  name: string;
  description: string;
  videoUrl: string;
  benefits: string;
  conversionFactor: number;
}

// Progressioni multiple per macchina → pesi liberi
// L'utente viene guidato attraverso ogni alternativa in ordine
const MACHINE_TO_FREEWEIGHT_PROGRESSION: Record<string, FreeWeightAlternativeInfo[]> = {
  'leg_press': [
    {
      name: 'Squat con Bilanciere',
      description: 'Lo squat attiva piu muscoli: core, stabilizzatori, glutei. E il re degli esercizi per le gambe.',
      videoUrl: '/videos/exercises/back-squat.mp4',
      benefits: 'Maggiore attivazione muscolare globale, forza funzionale',
      conversionFactor: 0.35
    },
    {
      name: 'Stacco da Terra',
      description: 'Lo stacco e un movimento di spinta fondamentale. Insieme allo squat, forma la base della forza per le gambe.',
      videoUrl: '/videos/exercises/conventional-deadlift.mp4',
      benefits: 'Forza totale, pattern di spinta dal pavimento, costruisce massa e potenza',
      conversionFactor: 0.40  // Leg Press 100kg → Stacco ~40kg per iniziare
    }
  ],
  'Leg Press': [
    {
      name: 'Squat con Bilanciere',
      description: 'Lo squat attiva piu muscoli: core, stabilizzatori, glutei. E il re degli esercizi per le gambe.',
      videoUrl: '/videos/exercises/back-squat.mp4',
      benefits: 'Maggiore attivazione muscolare globale, forza funzionale',
      conversionFactor: 0.35
    },
    {
      name: 'Stacco da Terra',
      description: 'Lo stacco e un movimento di spinta fondamentale. Insieme allo squat, forma la base della forza per le gambe.',
      videoUrl: '/videos/exercises/conventional-deadlift.mp4',
      benefits: 'Forza totale, pattern di spinta dal pavimento, costruisce massa e potenza',
      conversionFactor: 0.40
    }
  ],
};

// Mapping semplice per esercizi con singola alternativa (retrocompatibilità)
const MACHINE_TO_FREEWEIGHT_MAP: Record<string, FreeWeightAlternativeInfo> = {
  'chest_press': {
    name: 'Panca Piana',
    description: 'La panca piana attiva stabilizzatori e core. Movimento piu naturale e completo.',
    videoUrl: '/videos/exercises/flat-barbell-bench-press.mp4',
    benefits: 'Stabilizzazione attiva, maggiore ROM',
    conversionFactor: 0.70
  },
  'Chest Press': {
    name: 'Panca Piana',
    description: 'La panca piana attiva stabilizzatori e core. Movimento piu naturale e completo.',
    videoUrl: '/videos/exercises/flat-barbell-bench-press.mp4',
    benefits: 'Stabilizzazione attiva, maggiore ROM',
    conversionFactor: 0.70
  },
  'shoulder_press_machine': {
    name: 'Military Press',
    description: 'Il military press in piedi attiva tutto il core e insegna la stabilita verticale.',
    videoUrl: '/videos/exercises/military-press.mp4',
    benefits: 'Core engagement, equilibrio, forza funzionale',
    conversionFactor: 0.65
  },
  'Shoulder Press Machine': {
    name: 'Military Press',
    description: 'Il military press in piedi attiva tutto il core e insegna la stabilita verticale.',
    videoUrl: '/videos/exercises/military-press.mp4',
    benefits: 'Core engagement, equilibrio, forza funzionale',
    conversionFactor: 0.65
  },
  'row_machine': {
    name: 'Pulley Basso',
    description: 'Il pulley basso richiede controllo del tronco e attiva la catena posteriore.',
    videoUrl: '/videos/exercises/seated-cable-row.mp4',
    benefits: 'Controllo posturale, attivazione core',
    conversionFactor: 0.75
  },
  'Row Machine': {
    name: 'Pulley Basso o Rematore con Bilanciere',
    description: 'Esercizi a cavi o bilanciere richiedono piu controllo e attivano la catena posteriore.',
    videoUrl: '/videos/exercises/barbell-row.mp4',
    benefits: 'Controllo posturale, attivazione core',
    conversionFactor: 0.75
  },
  // Leg Curl: nessun mapping - resta come esercizio di isolamento per hamstring
  // Gli hamstring vengono comunque lavorati indirettamente da Squat e Stacco

  'glute_machine': {
    name: 'Hip Thrust con Bilanciere',
    description: 'L\'hip thrust con bilanciere e il miglior esercizio per i glutei. Permette carichi elevati con massima attivazione.',
    videoUrl: '/videos/exercises/barbell-hip-thrust.mp4',
    benefits: 'Massima attivazione glutei, costruisce forza e massa',
    conversionFactor: 0.70  // Glute Machine 60kg → Hip Thrust ~42kg
  },
  'Glute Machine': {
    name: 'Hip Thrust con Bilanciere',
    description: 'L\'hip thrust con bilanciere e il miglior esercizio per i glutei. Permette carichi elevati con massima attivazione.',
    videoUrl: '/videos/exercises/barbell-hip-thrust.mp4',
    benefits: 'Massima attivazione glutei, costruisce forza e massa',
    conversionFactor: 0.70
  },
  'back_extension': {
    name: 'Good Morning',
    description: 'Il good morning allena la catena posteriore con enfasi su erettori spinali e glutei. Richiede controllo e tecnica.',
    videoUrl: '/videos/exercises/good-morning.mp4',
    benefits: 'Rinforzo catena posteriore, mobilita anca, transfert su squat e stacco',
    conversionFactor: 0.60  // Back Extension con peso → Good Morning (carico ridotto per sicurezza)
  },
  'Back Extension': {
    name: 'Good Morning',
    description: 'Il good morning allena la catena posteriore con enfasi su erettori spinali e glutei. Richiede controllo e tecnica.',
    videoUrl: '/videos/exercises/good-morning.mp4',
    benefits: 'Rinforzo catena posteriore, mobilita anca, transfert su squat e stacco',
    conversionFactor: 0.60
  },
  'hip_thrust_machine': {
    name: 'Hip Thrust con Bilanciere',
    description: 'L\'hip thrust con bilanciere permette carichi maggiori e attivazione glutei superiore.',
    videoUrl: '/videos/exercises/barbell-hip-thrust.mp4',
    benefits: 'Massima attivazione glutei, trasferimento diretto dalla macchina',
    conversionFactor: 0.80  // Trasferimento quasi diretto
  },
  'Hip Thrust Machine': {
    name: 'Hip Thrust con Bilanciere',
    description: 'L\'hip thrust con bilanciere permette carichi maggiori e attivazione glutei superiore.',
    videoUrl: '/videos/exercises/barbell-hip-thrust.mp4',
    benefits: 'Massima attivazione glutei, trasferimento diretto dalla macchina',
    conversionFactor: 0.80
  },
  'leg_extension': {
    name: 'Bulgarian Split Squat',
    description: 'Allena i quadricipiti unilateralmente, migliorando equilibrio e stabilita.',
    videoUrl: '/videos/exercises/bulgarian-split-squat.mp4',
    benefits: 'Equilibrio, correzione asimmetrie, stabilita',
    conversionFactor: 0.40
  },
  'Leg Extension': {
    name: 'Bulgarian Split Squat',
    description: 'Allena i quadricipiti unilateralmente, migliorando equilibrio e stabilita.',
    videoUrl: '/videos/exercises/bulgarian-split-squat.mp4',
    benefits: 'Equilibrio, correzione asimmetrie, stabilita',
    conversionFactor: 0.40
  }
};

/**
 * Verifica se l'utente e in condizioni ottimali per provare un nuovo esercizio
 */
export function isInOptimalCondition(conditions: RecoveryConditions): { optimal: boolean; reason?: string } {
  // Controllo sonno: almeno 6.5 ore
  if (conditions.sleepHours < 6.5) {
    return {
      optimal: false,
      reason: 'Sonno insufficiente - meglio restare sulla routine abituale'
    };
  }

  // Controllo stress: massimo 5/10
  if (conditions.stressLevel > 5) {
    return {
      optimal: false,
      reason: 'Livello di stress elevato - non e il momento per nuove sfide'
    };
  }

  // Controllo infortuni
  if (conditions.hasInjury) {
    return {
      optimal: false,
      reason: 'Presenza di dolore/infortunio - priorita al recupero'
    };
  }

  // Controllo fase mestruale (solo se specificata e in fase difficile)
  if (conditions.menstrualCycle === 'menstruation') {
    return {
      optimal: false,
      reason: 'Fase mestruale - meglio non introdurre nuovi movimenti'
    };
  }

  return { optimal: true };
}

/**
 * Controlla se l'utente ha usato solo macchine durante lo screening iniziale
 */
export function getUserMachinePreference(): { usedOnlyMachines: boolean; age?: number } {
  try {
    const screeningData = localStorage.getItem('screening_data');
    const onboardingData = localStorage.getItem('onboarding_data');

    if (!screeningData) {
      return { usedOnlyMachines: false };
    }

    const screening = JSON.parse(screeningData);
    let age: number | undefined;

    if (onboardingData) {
      const onboarding = JSON.parse(onboardingData);
      age = onboarding.personalInfo?.age;
    }

    return {
      usedOnlyMachines: screening.usedOnlyMachines === true,
      age
    };
  } catch (error) {
    console.error('[FreeWeightSuggestion] Error reading user preference:', error);
    return { usedOnlyMachines: false };
  }
}

/**
 * Ottieni gli esercizi già accettati dall'utente dallo storico
 */
function getAcceptedExercises(): string[] {
  try {
    const historyKey = 'freeweight_suggestion_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    return history
      .filter((h: any) => h.accepted)
      .map((h: any) => h.exercise);
  } catch {
    return [];
  }
}

/**
 * Trova l'esercizio macchina nel workout e propone l'alternativa a corpo libero.
 * Supporta progressioni multiple: se l'utente ha accettato la prima alternativa,
 * propone la successiva nella lista.
 */
export function findFreeWeightAlternative(workoutExercises: any[]): { machineExercise: string; alternative: FreeWeightAlternativeInfo } | null {
  if (!workoutExercises || workoutExercises.length === 0) {
    return null;
  }

  const acceptedExercises = getAcceptedExercises();

  for (const exercise of workoutExercises) {
    const exerciseId = exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '_');
    const exerciseName = exercise.name;

    // 1. Prima controlla se c'è una progressione multipla
    const progression = MACHINE_TO_FREEWEIGHT_PROGRESSION[exerciseId] || MACHINE_TO_FREEWEIGHT_PROGRESSION[exerciseName];

    if (progression && progression.length > 0) {
      // Trova la prossima alternativa non ancora accettata
      for (const alt of progression) {
        if (!acceptedExercises.includes(alt.name)) {
          return {
            machineExercise: exerciseName || exerciseId,
            alternative: alt
          };
        }
      }
      // Se ha accettato tutte le alternative di questa progressione, passa al prossimo esercizio
      continue;
    }

    // 2. Fallback al mapping semplice (singola alternativa)
    const alternative = MACHINE_TO_FREEWEIGHT_MAP[exerciseId] || MACHINE_TO_FREEWEIGHT_MAP[exerciseName];

    if (alternative && !acceptedExercises.includes(alternative.name)) {
      return {
        machineExercise: exerciseName || exerciseId,
        alternative
      };
    }
  }

  return null;
}

/**
 * Funzione principale: determina se mostrare la proposta
 */
export function shouldSuggestFreeWeight(
  conditions: RecoveryConditions,
  workoutExercises: any[]
): FreeWeightSuggestion {
  // 1. Controlla se l'utente ha usato solo macchine
  const { usedOnlyMachines, age } = getUserMachinePreference();

  if (!usedOnlyMachines) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Utente usa gia pesi liberi'
    };
  }

  // 2. Controlla eta (max 50 anni per questa proposta)
  if (age && age > 50) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Proposta riservata a utenti sotto i 50 anni'
    };
  }

  // 3. Controlla condizioni di recupero
  const optimalCheck = isInOptimalCondition(conditions);
  if (!optimalCheck.optimal) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: optimalCheck.reason
    };
  }

  // 4. Trova esercizio macchina nel workout con alternativa disponibile
  const alternative = findFreeWeightAlternative(workoutExercises);
  if (!alternative) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Nessun esercizio macchina con alternativa nel workout di oggi'
    };
  }

  // 5. Controlla frequenza (non proporre ogni volta - max 1 volta a settimana)
  const lastSuggestionKey = 'last_freeweight_suggestion';
  const lastSuggestion = localStorage.getItem(lastSuggestionKey);
  if (lastSuggestion) {
    const daysSinceLastSuggestion = (Date.now() - parseInt(lastSuggestion)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSuggestion < 7) {
      return {
        shouldSuggest: false,
        machineExercise: '',
        freeWeightAlternative: '',
        freeWeightDescription: '',
        reason: `Proposta gia mostrata ${Math.floor(daysSinceLastSuggestion)} giorni fa - aspetta 7 giorni`
      };
    }
  }

  // Tutto ok! Proponi l'esercizio
  // Calcola peso suggerito basandosi sullo storico delle performance
  const weightSuggestion = calculateSuggestedWeight(alternative.machineExercise);

  return {
    shouldSuggest: true,
    machineExercise: alternative.machineExercise,
    freeWeightAlternative: alternative.alternative.name,
    freeWeightDescription: alternative.alternative.description,
    videoUrl: alternative.alternative.videoUrl,
    suggestedWeight: weightSuggestion?.suggestedWeight
  };
}

/**
 * Registra che la proposta e stata mostrata (per non riproporre troppo spesso)
 */
export function markSuggestionShown(): void {
  localStorage.setItem('last_freeweight_suggestion', Date.now().toString());
}

/**
 * Registra se l'utente ha accettato di provare l'esercizio
 */
export function recordSuggestionResponse(accepted: boolean, exerciseName: string): void {
  const historyKey = 'freeweight_suggestion_history';
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

  history.push({
    timestamp: new Date().toISOString(),
    exercise: exerciseName,
    accepted
  });

  // Mantieni solo gli ultimi 20 record
  if (history.length > 20) {
    history.shift();
  }

  localStorage.setItem(historyKey, JSON.stringify(history));

  // Se ha accettato 3+ volte, aggiorna automaticamente le preferenze
  if (accepted) {
    const acceptedCount = history.filter((h: any) => h.accepted).length;
    if (acceptedCount >= 3) {
      console.log('[FreeWeightSuggestion] User has accepted 3+ times - updating preferences to free weights');
      updatePreferencesToFreeWeights();
    }
  }
}

// ============================================================================
// AGGIORNAMENTO AUTOMATICO PREFERENZE
// ============================================================================

/**
 * Aggiorna le preferenze dell'utente a "pesi liberi" dopo 3 accettazioni
 * Modifica sia localStorage che segnala il cambiamento
 */
export function updatePreferencesToFreeWeights(): { success: boolean; message: string } {
  try {
    // 1. Aggiorna screening_data
    const screeningData = localStorage.getItem('screening_data');
    if (screeningData) {
      const screening = JSON.parse(screeningData);
      screening.usedOnlyMachines = false;
      screening.transitionedToFreeWeights = true;
      screening.transitionDate = new Date().toISOString();
      localStorage.setItem('screening_data', JSON.stringify(screening));
    }

    // 2. Aggiorna onboarding_data
    const onboardingData = localStorage.getItem('onboarding_data');
    if (onboardingData) {
      const onboarding = JSON.parse(onboardingData);
      onboarding.trainingType = 'equipment'; // Passa a pesi liberi
      onboarding.previousTrainingType = 'machines'; // Memorizza il precedente
      onboarding.transitionDate = new Date().toISOString();
      localStorage.setItem('onboarding_data', JSON.stringify(onboarding));
    }

    // 3. Registra l'evento di transizione
    const transitionKey = 'freeweight_transition';
    localStorage.setItem(transitionKey, JSON.stringify({
      date: new Date().toISOString(),
      completed: true,
      acceptanceCount: 3
    }));

    console.log('[FreeWeightSuggestion] ✅ Preferences updated to free weights');

    return {
      success: true,
      message: 'Complimenti! Hai completato la transizione ai pesi liberi. Il tuo prossimo programma includerà più esercizi con bilanciere e manubri.'
    };
  } catch (error) {
    console.error('[FreeWeightSuggestion] Error updating preferences:', error);
    return {
      success: false,
      message: 'Errore durante l\'aggiornamento delle preferenze'
    };
  }
}

/**
 * Controlla se l'utente ha completato la transizione ai pesi liberi
 */
export function hasCompletedTransition(): boolean {
  try {
    const transitionData = localStorage.getItem('freeweight_transition');
    if (transitionData) {
      const transition = JSON.parse(transitionData);
      return transition.completed === true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// TRACKING PROGRESSI MACCHINA → PESO LIBERO
// ============================================================================

const PROGRESS_TRACKING_KEY = 'machine_to_freeweight_progress';

/**
 * Registra una performance (sia macchina che peso libero)
 * Usato per tracciare i progressi e confrontare
 */
export function recordExercisePerformance(
  exerciseName: string,
  exerciseType: 'machine' | 'free_weight',
  weight: number,
  reps: number,
  sets: number,
  rpe?: number
): void {
  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_TRACKING_KEY) || '{}');

    // Trova la coppia macchina/peso libero
    const pairKey = findExercisePairKey(exerciseName);
    if (!pairKey) {
      console.log('[Progress] Exercise not in tracking map:', exerciseName);
      return;
    }

    // Inizializza se non esiste
    if (!allProgress[pairKey]) {
      allProgress[pairKey] = {
        machineExercise: pairKey,
        freeWeightExercise: MACHINE_TO_FREEWEIGHT_MAP[pairKey]?.name || '',
        machineHistory: [],
        freeWeightHistory: [],
        isTransitioned: false
      };
    }

    const record: ExerciseProgressRecord = {
      date: new Date().toISOString(),
      exerciseType,
      exerciseName,
      weight,
      reps,
      sets,
      rpe
    };

    // Aggiungi al corretto array
    if (exerciseType === 'machine') {
      allProgress[pairKey].machineHistory.push(record);
      // Mantieni solo gli ultimi 50 record per esercizio
      if (allProgress[pairKey].machineHistory.length > 50) {
        allProgress[pairKey].machineHistory.shift();
      }
    } else {
      allProgress[pairKey].freeWeightHistory.push(record);
      if (allProgress[pairKey].freeWeightHistory.length > 50) {
        allProgress[pairKey].freeWeightHistory.shift();
      }

      // Se è il primo record free weight, segna la data di transizione
      if (!allProgress[pairKey].transitionDate) {
        allProgress[pairKey].transitionDate = new Date().toISOString();
      }
    }

    localStorage.setItem(PROGRESS_TRACKING_KEY, JSON.stringify(allProgress));
    console.log(`[Progress] Recorded ${exerciseType} performance:`, exerciseName, weight, 'kg x', reps);
  } catch (error) {
    console.error('[Progress] Error recording performance:', error);
  }
}

/**
 * Trova la chiave della coppia per un esercizio
 */
function findExercisePairKey(exerciseName: string): string | null {
  // Cerca direttamente
  if (MACHINE_TO_FREEWEIGHT_MAP[exerciseName]) {
    return exerciseName;
  }

  // Cerca per nome del peso libero (inverso)
  for (const [key, value] of Object.entries(MACHINE_TO_FREEWEIGHT_MAP)) {
    if (value.name === exerciseName || value.name.includes(exerciseName)) {
      return key;
    }
  }

  // Cerca per variazioni del nome
  const normalizedName = exerciseName.toLowerCase().replace(/\s+/g, '_');
  if (MACHINE_TO_FREEWEIGHT_MAP[normalizedName]) {
    return normalizedName;
  }

  return null;
}

/**
 * Ottiene i progressi di transizione per un esercizio specifico
 */
export function getTransitionProgress(machineExercise: string): MachineToFreeWeightProgress | null {
  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_TRACKING_KEY) || '{}');
    return allProgress[machineExercise] || null;
  } catch {
    return null;
  }
}

/**
 * Ottiene tutti i progressi di transizione
 */
export function getAllTransitionProgress(): Record<string, MachineToFreeWeightProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_TRACKING_KEY) || '{}');
  } catch {
    return {};
  }
}

// ============================================================================
// CALCOLO PESO SUGGERITO (RIBASSATO PER SICUREZZA)
// ============================================================================

/**
 * Calcola il peso suggerito per iniziare con un peso libero,
 * basandosi sulle performance alla macchina corrispondente.
 *
 * Il peso è RIBASSATO del fattore di conversione (30-70% in meno)
 * per garantire sicurezza durante l'apprendimento del movimento.
 */
export function calculateSuggestedWeight(
  machineExercise: string,
  machineWeight?: number
): { suggestedWeight: number; explanation: string; conversionFactor: number } | null {
  const mapping = MACHINE_TO_FREEWEIGHT_MAP[machineExercise];
  if (!mapping) {
    return null;
  }

  // Se non abbiamo il peso della macchina, prova a recuperarlo dallo storico
  let weightToConvert = machineWeight;
  if (!weightToConvert) {
    const progress = getTransitionProgress(machineExercise);
    if (progress && progress.machineHistory.length > 0) {
      // Usa la media degli ultimi 3 allenamenti
      const recentRecords = progress.machineHistory.slice(-3);
      weightToConvert = recentRecords.reduce((sum, r) => sum + r.weight, 0) / recentRecords.length;
    }
  }

  if (!weightToConvert) {
    return null;
  }

  const suggestedWeight = Math.round(weightToConvert * mapping.conversionFactor);
  const reductionPercent = Math.round((1 - mapping.conversionFactor) * 100);

  return {
    suggestedWeight,
    explanation: `Basato sui tuoi ${weightToConvert}kg alla ${machineExercise}, ti consiglio di iniziare con ~${suggestedWeight}kg per ${mapping.name}. Questo è il ${100 - reductionPercent}% del carico alla macchina, per permetterti di imparare il movimento in sicurezza.`,
    conversionFactor: mapping.conversionFactor
  };
}

/**
 * Confronta le performance tra macchina e peso libero per lo stesso pattern
 */
export function comparePerformance(machineExercise: string): {
  machineAvg: { weight: number; reps: number } | null;
  freeWeightAvg: { weight: number; reps: number } | null;
  progressPercent: number | null;
  recommendation: string;
} | null {
  const progress = getTransitionProgress(machineExercise);
  if (!progress) {
    return null;
  }

  const machineRecent = progress.machineHistory.slice(-5);
  const freeWeightRecent = progress.freeWeightHistory.slice(-5);

  const machineAvg = machineRecent.length > 0 ? {
    weight: Math.round(machineRecent.reduce((s, r) => s + r.weight, 0) / machineRecent.length),
    reps: Math.round(machineRecent.reduce((s, r) => s + r.reps, 0) / machineRecent.length)
  } : null;

  const freeWeightAvg = freeWeightRecent.length > 0 ? {
    weight: Math.round(freeWeightRecent.reduce((s, r) => s + r.weight, 0) / freeWeightRecent.length),
    reps: Math.round(freeWeightRecent.reduce((s, r) => s + r.reps, 0) / freeWeightRecent.length)
  } : null;

  // Calcola progresso nel peso libero rispetto all'inizio
  let progressPercent: number | null = null;
  if (freeWeightRecent.length >= 2) {
    const firstFW = progress.freeWeightHistory[0];
    const lastFW = freeWeightRecent[freeWeightRecent.length - 1];
    if (firstFW && lastFW && firstFW.weight > 0) {
      progressPercent = Math.round(((lastFW.weight - firstFW.weight) / firstFW.weight) * 100);
    }
  }

  // Genera raccomandazione
  let recommendation = '';
  if (!freeWeightAvg) {
    recommendation = 'Non hai ancora provato il peso libero. Quando ti senti pronto, te lo proporremo!';
  } else if (progressPercent !== null && progressPercent > 20) {
    recommendation = `Ottimo progresso! Hai aumentato il carico del ${progressPercent}% dal primo allenamento.`;
  } else if (freeWeightRecent.length < 5) {
    recommendation = 'Continua così! Stai ancora prendendo confidenza con il movimento.';
  } else {
    recommendation = 'Il tuo controllo sta migliorando. Presto potrai aumentare il carico.';
  }

  return {
    machineAvg,
    freeWeightAvg,
    progressPercent,
    recommendation
  };
}
