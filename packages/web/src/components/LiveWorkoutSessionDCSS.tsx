/**
 * LIVE WORKOUT SESSION - DCSS Updates
 * 
 * Questo file contiene gli AGGIORNAMENTI da integrare in LiveWorkoutSession.tsx
 * Non è un file completo, ma i pezzi da modificare/aggiungere.
 * 
 * CAMBIAMENTI:
 * 1. Tolerable discomfort reminder per utenti con fastidio pre-segnalato
 * 2. Post-set check: "Come è andato il fastidio?" con opzioni
 * 3. Linguaggio DCSS invece di allarmistico
 * 4. Return to normal celebration quando recupera
 */

// ============================================================================
// NUOVI TIPI
// ============================================================================

interface DiscomfortCheck {
  exerciseName: string;
  setNumber: number;
  before: number;  // Livello pre-set (o ultimo noto)
  after: number;   // Livello post-set
  trend: 'improved' | 'stable' | 'worsened' | 'significantly_worsened';
  userChoice: 'continue' | 'reduce' | 'skip' | null;
}

interface RecoveryProgress {
  exerciseId: string;
  exerciseName: string;
  painFreeSessions: number;
  currentLoadPercent: number;
  phase: 'light_load' | 'progressive' | 'return_to_normal';
  justCompleted: boolean;  // Se ha appena completato il recovery
}

// ============================================================================
// NUOVE COSTANTI - MESSAGGI DCSS
// ============================================================================

const DCSS_MESSAGES = {
  // Tolerable discomfort reminder
  tolerableReminder: {
    it: '💡 Reminder: Un fastidio fino a 3-4/10 che non peggiora durante il set è generalmente accettabile. Se supera 5/10 o peggiora, fermati e segnalalo.',
    en: '💡 Reminder: Discomfort up to 3-4/10 that doesn\'t worsen during the set is generally acceptable. If it exceeds 5/10 or worsens, stop and report it.'
  },
  
  // Post-set check question
  postSetCheck: {
    it: 'Come è andato il fastidio durante il set?',
    en: 'How was the discomfort during the set?'
  },
  
  // Post-set options
  postSetOptions: {
    better: { it: '😊 Meglio o uguale', en: '😊 Better or same' },
    slightlyWorse: { it: '😐 Leggermente peggio', en: '😐 Slightly worse' },
    muchWorse: { it: '😟 Molto peggio', en: '😟 Much worse' }
  },
  
  // Responses to post-set check
  responses: {
    better: {
      it: 'Ottimo! Continua così. Il movimento spesso aiuta.',
      en: 'Great! Keep going. Movement often helps.'
    },
    slightlyWorse: {
      it: 'Vuoi ridurre il carico per le prossime serie? (Consigliato: -15%)',
      en: 'Would you like to reduce the load for the next sets? (Recommended: -15%)'
    },
    muchWorse: {
      it: 'Ti suggeriamo di saltare le serie rimanenti di questo esercizio. Vuoi passare al prossimo?',
      en: 'We suggest skipping the remaining sets of this exercise. Want to move to the next one?'
    }
  },
  
  // Recovery progress
  recoveryProgress: {
    title: { it: '📈 Aggiornamento recupero', en: '📈 Recovery update' },
    sessions: { it: 'Sessioni senza fastidio', en: 'Pain-free sessions' },
    load: { it: 'Carico attuale', en: 'Current load' },
    nextStep: { it: 'Prossimo obiettivo', en: 'Next milestone' }
  },
  
  // Recovery complete celebration
  recoveryComplete: {
    title: { it: '🎉 Recupero completato!', en: '🎉 Recovery complete!' },
    message: {
      it: '{exercise} è tornato nel programma senza restrizioni! Ottimo lavoro nel gestire questa situazione.',
      en: '{exercise} is back in the program without restrictions! Great job managing this situation.'
    },
    stats: {
      it: 'Nelle ultime sessioni hai:\n✅ Zero fastidi segnalati\n✅ Completato tutte le serie\n✅ Raggiunto il carico pre-adattamento',
      en: 'In the last sessions you:\n✅ Zero discomfort reported\n✅ Completed all sets\n✅ Reached pre-adaptation load'
    }
  },
  
  // Educational notes
  educational: {
    adaptingIsGood: {
      it: 'Adattare il carico non è "perdere" - è allenarsi in modo intelligente. Il corpo si adatta meglio con stimoli costanti che con pause forzate.',
      en: 'Adapting the load isn\'t "losing" - it\'s training smart. The body adapts better with consistent stimulus than forced breaks.'
    },
    movementHelps: {
      it: 'Il movimento spesso aiuta il recupero più del riposo completo. Stai facendo la cosa giusta continuando ad allenarti con le giuste modifiche.',
      en: 'Movement often helps recovery more than complete rest. You\'re doing the right thing by continuing to train with appropriate modifications.'
    }
  }
};

// ============================================================================
// NUOVE FUNZIONI
// ============================================================================

/**
 * Check se mostrare il tolerable discomfort reminder
 * Lo mostra solo se l'utente ha segnalato fastidio pre-workout su questa zona
 */
function shouldShowTolerableReminder(
  currentExercise: { name: string; pattern: string },
  preWorkoutDiscomfort: Array<{ area: string; intensity: number }>
): boolean {
  if (!preWorkoutDiscomfort || preWorkoutDiscomfort.length === 0) return false;
  
  // Mappa pattern a zone del corpo
  const patternToArea: Record<string, string[]> = {
    'lower_push': ['lower_back', 'hip', 'knee'],
    'lower_pull': ['lower_back', 'hip', 'hamstring'],
    'horizontal_push': ['shoulder', 'elbow', 'wrist'],
    'horizontal_pull': ['shoulder', 'elbow', 'upper_back'],
    'vertical_push': ['shoulder', 'neck'],
    'vertical_pull': ['shoulder', 'elbow'],
    'core': ['lower_back', 'hip']
  };
  
  const relevantAreas = patternToArea[currentExercise.pattern] || [];
  
  // Se l'utente ha segnalato fastidio in una zona rilevante, mostra reminder
  return preWorkoutDiscomfort.some(d => 
    relevantAreas.includes(d.area) && d.intensity >= 1 && d.intensity <= 6
  );
}

/**
 * Valuta il cambio di fastidio post-set
 */
function evaluateDiscomfortChange(
  before: number,
  after: number
): 'improved' | 'stable' | 'worsened' | 'significantly_worsened' {
  const change = after - before;
  
  if (change <= -1) return 'improved';
  if (change <= 0) return 'stable';
  if (change <= 2 && after <= 6) return 'worsened';
  return 'significantly_worsened';
}

/**
 * Genera il messaggio per il recovery progress
 */
function generateRecoveryMessage(
  progress: RecoveryProgress,
  language: 'it' | 'en'
): {
  title: string;
  content: string;
  showCelebration: boolean;
} {
  const t = DCSS_MESSAGES;
  
  // Se ha appena completato il recovery
  if (progress.justCompleted || progress.phase === 'return_to_normal' && progress.currentLoadPercent >= 100) {
    return {
      title: t.recoveryComplete.title[language],
      content: t.recoveryComplete.message[language].replace('{exercise}', progress.exerciseName) + 
               '\n\n' + t.recoveryComplete.stats[language],
      showCelebration: true
    };
  }
  
  // Progress update normale
  const targetSessions = 3;
  const nextLoadPercent = Math.min(100, progress.currentLoadPercent + 15);
  
  return {
    title: t.recoveryProgress.title[language],
    content: `${progress.exerciseName}\n` +
             `• ${t.recoveryProgress.sessions[language]}: ${progress.painFreeSessions}/${targetSessions}\n` +
             `• ${t.recoveryProgress.load[language]}: ${progress.currentLoadPercent}%\n` +
             `• ${t.recoveryProgress.nextStep[language]}: ${nextLoadPercent}%`,
    showCelebration: false
  };
}

// ============================================================================
// COMPONENTE: Tolerable Discomfort Reminder
// ============================================================================

interface TolerableReminderProps {
  language: 'it' | 'en';
  onDismiss: () => void;
}

function TolerableDiscomfortReminder({ language, onDismiss }: TolerableReminderProps) {
  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <p className="text-sm text-blue-200">
            {DCSS_MESSAGES.tolerableReminder[language]}
          </p>
          <button
            onClick={onDismiss}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            {language === 'it' ? 'Ho capito' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Post-Set Discomfort Check
// ============================================================================

interface PostSetDiscomfortCheckProps {
  language: 'it' | 'en';
  exerciseName: string;
  onResponse: (response: 'better' | 'slightlyWorse' | 'muchWorse') => void;
}

function PostSetDiscomfortCheck({ language, exerciseName, onResponse }: PostSetDiscomfortCheckProps) {
  const t = DCSS_MESSAGES;
  
  return (
    <div className="bg-slate-800/80 rounded-xl p-4 space-y-4">
      <p className="text-white font-medium">
        {t.postSetCheck[language]}
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onResponse('better')}
          className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition-colors"
        >
          <span className="text-2xl block mb-1">😊</span>
          <span className="text-xs text-emerald-300">
            {language === 'it' ? 'Meglio/Uguale' : 'Better/Same'}
          </span>
        </button>
        
        <button
          onClick={() => onResponse('slightlyWorse')}
          className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors"
        >
          <span className="text-2xl block mb-1">😐</span>
          <span className="text-xs text-amber-300">
            {language === 'it' ? 'Un po\' peggio' : 'Slightly worse'}
          </span>
        </button>
        
        <button
          onClick={() => onResponse('muchWorse')}
          className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg transition-colors"
        >
          <span className="text-2xl block mb-1">😟</span>
          <span className="text-xs text-red-300">
            {language === 'it' ? 'Molto peggio' : 'Much worse'}
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Recovery Progress Card
// ============================================================================

interface RecoveryProgressCardProps {
  progress: RecoveryProgress;
  language: 'it' | 'en';
  onDismiss: () => void;
}

function RecoveryProgressCard({ progress, language, onDismiss }: RecoveryProgressCardProps) {
  const message = generateRecoveryMessage(progress, language);
  
  return (
    <div className={`rounded-xl p-4 ${
      message.showCelebration 
        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40' 
        : 'bg-slate-800/80 border border-slate-700'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-bold ${message.showCelebration ? 'text-emerald-300' : 'text-white'}`}>
            {message.title}
          </h3>
          <p className="text-sm text-slate-300 whitespace-pre-line mt-2">
            {message.content}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {message.showCelebration && (
        <div className="mt-4 text-center">
          <span className="text-4xl">🎉</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HOOK: useDiscomfortTracking
// ============================================================================

interface UseDiscomfortTrackingReturn {
  showReminder: boolean;
  dismissReminder: () => void;
  showPostSetCheck: boolean;
  triggerPostSetCheck: () => void;
  handlePostSetResponse: (response: 'better' | 'slightlyWorse' | 'muchWorse') => void;
  postSetResponse: string | null;
  recoveryProgress: RecoveryProgress | null;
  dismissRecoveryProgress: () => void;
}

function useDiscomfortTracking(
  currentExercise: { name: string; pattern: string } | null,
  preWorkoutDiscomfort: Array<{ area: string; intensity: number }>,
  currentSet: number
): UseDiscomfortTrackingReturn {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [showPostSetCheck, setShowPostSetCheck] = useState(false);
  const [postSetResponse, setPostSetResponse] = useState<string | null>(null);
  const [recoveryProgress, setRecoveryProgress] = useState<RecoveryProgress | null>(null);
  
  // Mostra reminder al primo set se c'è fastidio rilevante
  useEffect(() => {
    if (currentExercise && currentSet === 1 && !reminderDismissed) {
      const shouldShow = shouldShowTolerableReminder(currentExercise, preWorkoutDiscomfort);
      setShowReminder(shouldShow);
    }
  }, [currentExercise, currentSet, preWorkoutDiscomfort, reminderDismissed]);
  
  const dismissReminder = () => {
    setShowReminder(false);
    setReminderDismissed(true);
  };
  
  const triggerPostSetCheck = () => {
    // Mostra solo se c'era fastidio pre-segnalato
    if (currentExercise && shouldShowTolerableReminder(currentExercise, preWorkoutDiscomfort)) {
      setShowPostSetCheck(true);
    }
  };
  
  const handlePostSetResponse = (response: 'better' | 'slightlyWorse' | 'muchWorse') => {
    setPostSetResponse(response);
    setShowPostSetCheck(false);
    
    // TODO: Logica per applicare riduzioni o skip
    if (response === 'muchWorse') {
      // Skip remaining sets
    } else if (response === 'slightlyWorse') {
      // Suggest load reduction
    }
  };
  
  const dismissRecoveryProgress = () => {
    setRecoveryProgress(null);
  };
  
  return {
    showReminder,
    dismissReminder,
    showPostSetCheck,
    triggerPostSetCheck,
    handlePostSetResponse,
    postSetResponse,
    recoveryProgress,
    dismissRecoveryProgress
  };
}

// ============================================================================
// ISTRUZIONI DI INTEGRAZIONE
// ============================================================================

/**
 * COME INTEGRARE IN LiveWorkoutSession.tsx:
 * 
 * 1. Aggiungi questi import:
 *    - I tipi DiscomfortCheck e RecoveryProgress
 *    - I componenti TolerableDiscomfortReminder, PostSetDiscomfortCheck, RecoveryProgressCard
 *    - Il hook useDiscomfortTracking
 *    - Le costanti DCSS_MESSAGES
 * 
 * 2. Nel componente principale, aggiungi:
 *    ```tsx
 *    const discomfortTracking = useDiscomfortTracking(
 *      currentExercise,
 *      painAreas, // dal pre-workout check
 *      currentSet
 *    );
 *    ```
 * 
 * 3. Nel render, PRIMA dell'esercizio corrente:
 *    ```tsx
 *    {discomfortTracking.showReminder && (
 *      <TolerableDiscomfortReminder
 *        language={language}
 *        onDismiss={discomfortTracking.dismissReminder}
 *      />
 *    )}
 *    ```
 * 
 * 4. DOPO il completamento del set (nel flow RPE/RIR):
 *    ```tsx
 *    {discomfortTracking.showPostSetCheck && (
 *      <PostSetDiscomfortCheck
 *        language={language}
 *        exerciseName={currentExercise.name}
 *        onResponse={discomfortTracking.handlePostSetResponse}
 *      />
 *    )}
 *    ```
 * 
 * 5. Chiama triggerPostSetCheck() dopo il completamento del set
 *    (dentro handleSetComplete o dopo handleRPESelect)
 * 
 * 6. Mostra RecoveryProgressCard quando l'utente completa un esercizio
 *    che era in recovery (check dal painManagementService)
 */

export {
  TolerableDiscomfortReminder,
  PostSetDiscomfortCheck,
  RecoveryProgressCard,
  useDiscomfortTracking,
  DCSS_MESSAGES,
  shouldShowTolerableReminder,
  evaluateDiscomfortChange,
  generateRecoveryMessage
};

export type {
  DiscomfortCheck,
  RecoveryProgress
};
