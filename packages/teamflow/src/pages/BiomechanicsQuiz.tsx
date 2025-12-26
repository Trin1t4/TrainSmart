import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, AlertTriangle, Shield, BookOpen, CheckCircle, XCircle, ArrowRight, MapPin, Clock, Edit3, Dumbbell } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type Category = 'A' | 'B' | 'C';
type Flag = 'bro_science_believer' | 'technique_gap' | 'safety_risk' | 'knows_rpe' | 'knows_periodization';
type Level = 'beginner' | 'intermediate' | 'advanced';

interface QuestionOption {
  text: string;
  correct: boolean;
  flag?: Flag;
  partial?: boolean; // Per risposte "accettabili ma non ottime"
}

interface Question {
  id: string;
  category: Category;
  weight: number;
  text: string;
  options: QuestionOption[];
  explanation: string;
}

interface Answer {
  questionId: string;
  category: Category;
  weight: number;
  correct: boolean;
  selectedOption: string;
  flag?: Flag;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Answer[];
  flags: Flag[];
  score: number;
  askedQuestions: string[];
  categoryACounts: { asked: number; wrong: number };
  categoryBCounts: { asked: number; wrong: number };
  categoryCCounts: { asked: number; wrong: number };
}

// ============================================================================
// QUESTION POOL - 21 DOMANDE
// ============================================================================

const QUESTIONS: Question[] = [
  // ===================== CATEGORIA A: TRAPPOLE BRO-SCIENCE (peso 3x) =====================
  {
    id: 'A1',
    category: 'A',
    weight: 3,
    text: 'Nello squat, le ginocchia non devono MAI superare la punta dei piedi',
    options: [
      { text: 'Vero, è pericoloso per le ginocchia', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, dipende dalla struttura e dalla profondità', correct: true },
      { text: 'Solo se fai squat frontale', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Le ginocchia che superano le punte sono normali e spesso necessarie per uno squat completo. Il mito nasce da uno studio degli anni \'70 male interpretato.',
  },
  {
    id: 'A2',
    category: 'A',
    weight: 3,
    text: 'Per bruciare più grasso devi fare cardio a stomaco vuoto',
    options: [
      { text: 'Vero, bruci direttamente i grassi', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, conta il deficit totale giornaliero', correct: true },
      { text: 'Vero ma solo al mattino', correct: false, flag: 'bro_science_believer' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Il corpo usa un mix di substrati energetici. Ciò che conta è il deficit calorico nelle 24h, non il timing.',
  },
  {
    id: 'A3',
    category: 'A',
    weight: 3,
    text: 'Se non senti bruciare il muscolo, non stai lavorando bene',
    options: [
      { text: 'Vero, il bruciore indica che funziona', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, il bruciore è solo accumulo di metaboliti', correct: true },
      { text: 'Dipende dall\'esercizio', correct: false, partial: true },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Il bruciore (acido lattico) non correla con l\'ipertrofia. La tensione meccanica è il driver principale della crescita muscolare.',
  },
  {
    id: 'A4',
    category: 'A',
    weight: 3,
    text: 'Più sudi, più dimagrisci',
    options: [
      { text: 'Vero, il sudore elimina il grasso', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, il sudore è solo termoregolazione', correct: true },
      { text: 'Parzialmente vero', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Il sudore è acqua, non grasso. Il peso perso sudando si riprende bevendo. La perdita di grasso avviene solo con deficit calorico.',
  },
  {
    id: 'A5',
    category: 'A',
    weight: 3,
    text: 'Devi mangiare proteine entro 30 minuti dall\'allenamento o perdi i guadagni',
    options: [
      { text: 'Vero, la finestra anabolica è fondamentale', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, hai ore di tempo, conta il totale giornaliero', correct: true },
      { text: 'Vero solo per i professionisti', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'La "finestra anabolica" di 30 minuti è un mito. La sintesi proteica resta elevata per 24-48 ore dopo l\'allenamento.',
  },
  {
    id: 'A6',
    category: 'A',
    weight: 3,
    text: 'Per definirti devi usare pesi leggeri e tante ripetizioni',
    options: [
      { text: 'Vero, i pesi pesanti sono per la massa', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, la definizione dipende dalla dieta', correct: true },
      { text: 'Dipende dal tipo di corpo', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Non esiste "allenamento per definizione". La definizione è perdita di grasso = deficit calorico. L\'allenamento serve a mantenere il muscolo.',
  },
  {
    id: 'A7',
    category: 'A',
    weight: 3,
    text: 'Se il giorno dopo non hai DOMS (dolori muscolari), non hai lavorato abbastanza',
    options: [
      { text: 'Vero, i DOMS indicano un buon allenamento', correct: false, flag: 'bro_science_believer' },
      { text: 'Falso, i DOMS non correlano con la crescita', correct: true },
      { text: 'Solo per i principianti', correct: false, partial: true },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'I DOMS indicano un carico nuovo, non efficace. Un programma ben strutturato riduce i DOMS nel tempo.',
  },

  // ===================== CATEGORIA B: SICUREZZA TECNICA (peso 2x) =====================
  {
    id: 'B1',
    category: 'B',
    weight: 2,
    text: 'Durante la panca piana, le scapole dovrebbero essere:',
    options: [
      { text: 'Rilassate e naturali', correct: false, flag: 'technique_gap' },
      { text: 'Retratte e depresse (indietro e in basso)', correct: true },
      { text: 'Protratte in avanti', correct: false, flag: 'technique_gap' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Scapole retratte = stabilità della spalla, minor rischio di impingement e maggiore attivazione del pettorale.',
  },
  {
    id: 'B2',
    category: 'B',
    weight: 2,
    text: 'Durante lo stacco da terra, la schiena deve essere:',
    options: [
      { text: 'Completamente dritta (verticale)', correct: false },
      { text: 'Neutra (curve naturali mantenute)', correct: true },
      { text: 'Leggermente arrotondata va bene', correct: false, flag: 'technique_gap' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: '"Schiena dritta" è un cue sbagliato. La schiena ha curve naturali (lordosi lombare) da mantenere sotto carico.',
  },
  {
    id: 'B3',
    category: 'B',
    weight: 2,
    text: 'Quando sollevi un peso pesante, dovresti:',
    options: [
      { text: 'Espirare sempre durante lo sforzo', correct: false, partial: true },
      { text: 'Trattenere il respiro e creare pressione addominale', correct: true },
      { text: 'Respirare normalmente', correct: false, flag: 'technique_gap' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'La manovra di Valsalva (trattenere + pressione) stabilizza la colonna. "Espira durante lo sforzo" va bene solo per carichi leggeri.',
  },
  {
    id: 'B4',
    category: 'B',
    weight: 2,
    text: 'Quanto dovresti scendere nello squat?',
    options: [
      { text: 'Fino a che le cosce sono parallele al pavimento', correct: false, partial: true },
      { text: 'Fin dove mantieni la schiena neutra senza compensi', correct: true },
      { text: 'Più scendi meglio è, sempre', correct: false, flag: 'technique_gap' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'La profondità dipende dalla mobilità individuale. Forzare oltre causa "butt wink" e stress lombare.',
  },
  {
    id: 'B5',
    category: 'B',
    weight: 2,
    text: 'Nelle trazioni alla sbarra, il movimento parte da:',
    options: [
      { text: 'Piegare le braccia', correct: false, flag: 'technique_gap' },
      { text: 'Deprimere le scapole, poi piegare', correct: true },
      { text: 'Usare lo slancio', correct: false, flag: 'technique_gap' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Attivare prima i dorsali (deprimere scapole) protegge le spalle e rende il movimento più efficace.',
  },
  {
    id: 'B6',
    category: 'B',
    weight: 2,
    text: 'Estendere completamente le braccia alla fine di una distensione (lockout) è:',
    options: [
      { text: 'Pericoloso per i gomiti', correct: false, flag: 'bro_science_believer' },
      { text: 'Normale e parte del ROM completo', correct: true },
      { text: 'Da evitare sempre', correct: false, flag: 'bro_science_believer' },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Il lockout completo è sicuro e allena l\'intero range di movimento. Il mito viene dal bodybuilding.',
  },
  {
    id: 'B7',
    category: 'B',
    weight: 2,
    text: 'Se senti dolore (non fatica) durante un esercizio, dovresti:',
    options: [
      { text: 'Continuare, è normale', correct: false, flag: 'safety_risk' },
      { text: 'Fermarti e valutare', correct: true },
      { text: 'Abbassare il peso e continuare', correct: false, partial: true },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Dolore ≠ fatica. Il dolore è un segnale da non ignorare mai durante l\'esecuzione.',
  },

  // ===================== CATEGORIA C: CONCETTI BASE (peso 1x) =====================
  {
    id: 'C1',
    category: 'C',
    weight: 1,
    text: 'Cosa significa "progressione" nell\'allenamento?',
    options: [
      { text: 'Cambiare esercizi spesso', correct: false },
      { text: 'Aumentare gradualmente carico/volume/difficoltà', correct: true },
      { text: 'Allenarsi più spesso', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Senza progressione non c\'è adattamento. È il principio base di qualsiasi programma efficace.',
  },
  {
    id: 'C2',
    category: 'C',
    weight: 1,
    text: 'Sai cosa significa RIR o RPE?',
    options: [
      { text: 'Mai sentito', correct: false, partial: true },
      { text: 'Ripetizioni in riserva / sforzo percepito', correct: true, flag: 'knows_rpe' },
      { text: 'Ha a che fare con la frequenza cardiaca', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'RIR (Repetitions In Reserve) e RPE (Rate of Perceived Exertion) sono strumenti per autoregolare l\'intensità.',
  },
  {
    id: 'C3',
    category: 'C',
    weight: 1,
    text: 'Cosa si intende per "volume" di allenamento?',
    options: [
      { text: 'Quanto sudi', correct: false },
      { text: 'Serie × ripetizioni × carico', correct: true },
      { text: 'Quante ore ti alleni', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Il volume è il lavoro totale svolto. È il driver principale dell\'ipertrofia.',
  },
  {
    id: 'C4',
    category: 'C',
    weight: 1,
    text: 'Quando cresce il muscolo?',
    options: [
      { text: 'Durante l\'allenamento', correct: false },
      { text: 'Durante il riposo e recupero', correct: true },
      { text: 'Subito dopo aver mangiato proteine', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'L\'allenamento è lo stimolo che "danneggia" il muscolo. La crescita vera avviene durante il recupero.',
  },
  {
    id: 'C5',
    category: 'C',
    weight: 1,
    text: 'Qual è la differenza principale tra allenare la forza e l\'ipertrofia?',
    options: [
      { text: 'Nessuna, sono la stessa cosa', correct: false },
      { text: 'Range di ripetizioni e recupero diversi', correct: true },
      { text: 'La forza usa macchine, l\'ipertrofia pesi liberi', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Forza = carichi alti, poche reps, recuperi lunghi. Ipertrofia = carichi medi, più reps, recuperi moderati.',
  },
  {
    id: 'C6',
    category: 'C',
    weight: 1,
    text: 'Quante volte a settimana dovresti allenare un muscolo per farlo crescere?',
    options: [
      { text: '1 volta, poi deve riposare 7 giorni', correct: false },
      { text: '2-3 volte funziona meglio per la maggior parte', correct: true },
      { text: 'Tutti i giorni per massimizzare', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'La ricerca moderna mostra che 2x/settimana per gruppo muscolare è spesso meglio di 1x con più volume concentrato.',
  },
  {
    id: 'C7',
    category: 'C',
    weight: 1,
    text: 'Cos\'è un "deload"?',
    options: [
      { text: 'Quando smetti di allenarti', correct: false },
      { text: 'Una settimana a intensità/volume ridotto per recuperare', correct: true, flag: 'knows_periodization' },
      { text: 'Un tipo di esercizio', correct: false },
      { text: 'Mai sentito', correct: false, partial: true },
    ],
    explanation: 'Il deload permette il recupero accumulato senza perdere gli adattamenti. È parte della periodizzazione.',
  },
  {
    id: 'C8',
    category: 'C',
    weight: 1,
    text: 'Qual è la differenza tra esercizi "compound" e "isolation"?',
    options: [
      { text: 'Compound usa macchine, isolation pesi liberi', correct: false },
      { text: 'Compound coinvolge più articolazioni, isolation una', correct: true },
      { text: 'Sono la stessa cosa', correct: false },
      { text: 'Non lo so', correct: false, partial: true },
    ],
    explanation: 'Squat = compound (anca + ginocchio). Leg extension = isolation (solo ginocchio).',
  },
];

// ============================================================================
// ADAPTIVE ALGORITHM
// ============================================================================

function selectNextQuestion(state: QuizState, pool: Question[]): Question | null {
  const available = pool.filter(q => !state.askedQuestions.includes(q.id));

  if (available.length === 0) return null;
  if (state.answers.length >= 7) return null; // Max 7 domande

  // Early exit: se già 2 errori in A, livello chiaro
  if (state.categoryACounts.wrong >= 2 && state.answers.length >= 4) {
    return null;
  }

  // Logica adattiva
  const { categoryACounts, categoryBCounts, categoryCCounts } = state;

  // 1. Prima domanda o poche domande A: pesca da A
  if (categoryACounts.asked < 2) {
    const categoryA = available.filter(q => q.category === 'A');
    if (categoryA.length > 0) {
      return categoryA[Math.floor(Math.random() * categoryA.length)];
    }
  }

  // 2. Se ha sbagliato in A, altra A per confermare
  if (categoryACounts.wrong > 0 && categoryACounts.asked < 3) {
    const categoryA = available.filter(q => q.category === 'A');
    if (categoryA.length > 0) {
      return categoryA[Math.floor(Math.random() * categoryA.length)];
    }
  }

  // 3. Passa a B se A è ok
  if (categoryBCounts.asked < 2) {
    const categoryB = available.filter(q => q.category === 'B');
    if (categoryB.length > 0) {
      return categoryB[Math.floor(Math.random() * categoryB.length)];
    }
  }

  // 4. Se ha sbagliato in B, altra B
  if (categoryBCounts.wrong > 0 && categoryBCounts.asked < 3) {
    const categoryB = available.filter(q => q.category === 'B');
    if (categoryB.length > 0) {
      return categoryB[Math.floor(Math.random() * categoryB.length)];
    }
  }

  // 5. Passa a C per discriminare intermediate/advanced
  if (categoryCCounts.asked < 3) {
    const categoryC = available.filter(q => q.category === 'C');
    if (categoryC.length > 0) {
      // Priorità a C2 (RIR/RPE) e C7 (deload) se non ancora chieste
      const priority = categoryC.filter(q => q.id === 'C2' || q.id === 'C7');
      if (priority.length > 0) {
        return priority[Math.floor(Math.random() * priority.length)];
      }
      return categoryC[Math.floor(Math.random() * categoryC.length)];
    }
  }

  // 6. Qualsiasi domanda rimanente
  return available[Math.floor(Math.random() * available.length)];
}

function calculateLevel(state: QuizState): { level: Level; label: string; description: string } {
  const { score, flags, categoryACounts, categoryBCounts } = state;

  // Regola override: 2+ errori bro-science = beginner
  const broScienceCount = flags.filter(f => f === 'bro_science_believer').length;
  if (broScienceCount >= 2) {
    return {
      level: 'beginner',
      label: 'Fondamenta',
      description: 'Hai esperienza pratica, ma ci sono alcuni concetti che potrebbero aiutarti ad allenarti in modo più efficace e sicuro. Il tuo programma includerà spiegazioni tecniche e progressione graduale.',
    };
  }

  // Regola: molti errori tecnici
  const techniqueGapCount = flags.filter(f => f === 'technique_gap').length;
  if (techniqueGapCount >= 2 || categoryBCounts.wrong >= 2) {
    return {
      level: 'beginner',
      label: 'Fondamenta',
      description: 'Hai esperienza pratica, ma ci sono alcuni concetti che potrebbero aiutarti ad allenarti in modo più efficace e sicuro. Il tuo programma includerà spiegazioni tecniche e progressione graduale.',
    };
  }

  // Calcolo basato su score
  // Score massimo teorico ~15-18 con 7 domande miste
  if (score < 6) {
    return {
      level: 'beginner',
      label: 'Fondamenta',
      description: 'Hai esperienza pratica, ma ci sono alcuni concetti che potrebbero aiutarti ad allenarti in modo più efficace e sicuro. Il tuo programma includerà spiegazioni tecniche e progressione graduale.',
    };
  }

  if (score < 12) {
    return {
      level: 'intermediate',
      label: 'Consapevole',
      description: 'Conosci le basi e sai muoverti bene. Il tuo programma sarà calibrato per farti progredire con intensità appropriate.',
    };
  }

  return {
    level: 'advanced',
    label: 'Preparato',
    description: 'Hai una buona comprensione della teoria e della pratica. Il programma sarà diretto e con meno spiegazioni ridondanti.',
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BiomechanicsQuiz() {
  const navigate = useNavigate();

  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    flags: [],
    score: 0,
    askedQuestions: [],
    categoryACounts: { asked: 0, wrong: 0 },
    categoryBCounts: { asked: 0, wrong: 0 },
    categoryCCounts: { asked: 0, wrong: 0 },
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() =>
    selectNextQuestion(state, QUESTIONS)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [testChoice, setTestChoice] = useState<'gym' | 'know_maxes' | 'later' | null>(null);

  const result = useMemo(() => calculateLevel(state), [state]);

  const handleAnswer = useCallback(() => {
    if (selected === null || !currentQuestion) return;

    const selectedOption = currentQuestion.options[selected];
    const isCorrect = selectedOption.correct;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      weight: currentQuestion.weight,
      correct: isCorrect,
      selectedOption: selectedOption.text,
      flag: selectedOption.flag,
    };

    // Aggiorna state
    const newFlags = selectedOption.flag && !isCorrect
      ? [...state.flags, selectedOption.flag]
      : selectedOption.flag && isCorrect && (selectedOption.flag === 'knows_rpe' || selectedOption.flag === 'knows_periodization')
        ? [...state.flags, selectedOption.flag]
        : state.flags;

    const newScore = isCorrect ? state.score + currentQuestion.weight : state.score;

    const newCategoryACounts = currentQuestion.category === 'A'
      ? { asked: state.categoryACounts.asked + 1, wrong: state.categoryACounts.wrong + (isCorrect ? 0 : 1) }
      : state.categoryACounts;

    const newCategoryBCounts = currentQuestion.category === 'B'
      ? { asked: state.categoryBCounts.asked + 1, wrong: state.categoryBCounts.wrong + (isCorrect ? 0 : 1) }
      : state.categoryBCounts;

    const newCategoryCCounts = currentQuestion.category === 'C'
      ? { asked: state.categoryCCounts.asked + 1, wrong: state.categoryCCounts.wrong + (isCorrect ? 0 : 1) }
      : state.categoryCCounts;

    setState({
      ...state,
      answers: [...state.answers, newAnswer],
      flags: newFlags,
      score: newScore,
      askedQuestions: [...state.askedQuestions, currentQuestion.id],
      categoryACounts: newCategoryACounts,
      categoryBCounts: newCategoryBCounts,
      categoryCCounts: newCategoryCCounts,
    });

    setShowExplanation(true);
  }, [selected, currentQuestion, state]);

  const handleNext = useCallback(() => {
    const newState = {
      ...state,
      askedQuestions: [...state.askedQuestions, currentQuestion?.id || ''],
    };

    const nextQuestion = selectNextQuestion(newState, QUESTIONS);

    if (!nextQuestion) {
      // Quiz completo
      setIsComplete(true);
      return;
    }

    setCurrentQuestion(nextQuestion);
    setSelected(null);
    setShowExplanation(false);
  }, [state, currentQuestion]);

  const handleFinish = useCallback(() => {
    const finalResult = calculateLevel(state);

    const quizData = {
      score: state.score,
      level: finalResult.level,
      levelLabel: finalResult.label,
      totalQuestions: state.answers.length,
      correctAnswers: state.answers.filter(a => a.correct).length,
      flags: state.flags,
      answers: state.answers,
      completedAt: new Date().toISOString(),
      // Breakdown per categoria
      categoryBreakdown: {
        A: state.categoryACounts,
        B: state.categoryBCounts,
        C: state.categoryCCounts,
      },
    };

    localStorage.setItem('quiz_data', JSON.stringify(quizData));

    if (testChoice === 'gym') {
      // Vai ai test pratici con riscaldamento
      navigate('/screening');
    } else if (testChoice === 'know_maxes') {
      // Vai a inserire i massimali manualmente
      navigate('/screening', { state: { manualEntry: true } });
    } else {
      // Salta i test, vai alla dashboard
      localStorage.setItem('screening_pending', 'true');
      navigate('/dashboard');
    }
  }, [state, navigate, testChoice]);

  // Schermata risultato
  if (isComplete) {
    const finalResult = calculateLevel(state);
    const correctCount = state.answers.filter(a => a.correct).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 text-center">
            {/* Icona livello */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              finalResult.level === 'advanced'
                ? 'bg-emerald-500/20 border-2 border-emerald-500'
                : finalResult.level === 'intermediate'
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-amber-500/20 border-2 border-amber-500'
            }`}>
              {finalResult.level === 'advanced' && <Brain className="w-10 h-10 text-emerald-400" />}
              {finalResult.level === 'intermediate' && <Shield className="w-10 h-10 text-blue-400" />}
              {finalResult.level === 'beginner' && <BookOpen className="w-10 h-10 text-amber-400" />}
            </div>

            {/* Titolo */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Il tuo livello: <span className={
                finalResult.level === 'advanced'
                  ? 'text-emerald-400'
                  : finalResult.level === 'intermediate'
                    ? 'text-blue-400'
                    : 'text-amber-400'
              }>{finalResult.label}</span>
            </h2>

            {/* Statistiche */}
            <div className="flex justify-center gap-6 my-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{correctCount}</div>
                <div className="text-sm text-slate-400">Risposte corrette</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{state.answers.length}</div>
                <div className="text-sm text-slate-400">Domande totali</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{state.score}</div>
                <div className="text-sm text-slate-400">Punteggio</div>
              </div>
            </div>

            {/* Descrizione */}
            <p className="text-slate-300 mb-8 leading-relaxed">
              {finalResult.description}
            </p>

            {/* Flags informativi (se positivi) */}
            {(state.flags.includes('knows_rpe') || state.flags.includes('knows_periodization')) && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <p className="text-emerald-300 text-sm">
                  {state.flags.includes('knows_rpe') && state.flags.includes('knows_periodization')
                    ? 'Conosci RPE/RIR e periodizzazione - ottimo!'
                    : state.flags.includes('knows_rpe')
                      ? 'Conosci RPE/RIR - useremo questo per calibrare i carichi.'
                      : 'Conosci la periodizzazione - il programma includerà deload programmati.'
                  }
                </p>
              </div>
            )}

            {/* Domanda: Sei in palestra? */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Sei in palestra adesso?
              </p>

              <div className="space-y-3">
                {/* Opzione 1: In palestra */}
                <button
                  onClick={() => setTestChoice('gym')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    testChoice === 'gym'
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      testChoice === 'gym' ? 'bg-emerald-500/30' : 'bg-slate-600/50'
                    }`}>
                      <Dumbbell className={`w-5 h-5 ${testChoice === 'gym' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${testChoice === 'gym' ? 'text-white' : 'text-slate-300'}`}>
                        Si, faccio i test adesso
                      </p>
                      <p className="text-xs text-slate-400">2 test pratici (~5 min)</p>
                    </div>
                  </div>
                </button>

                {/* Opzione 2: Conosco i massimali */}
                <button
                  onClick={() => setTestChoice('know_maxes')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    testChoice === 'know_maxes'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      testChoice === 'know_maxes' ? 'bg-blue-500/30' : 'bg-slate-600/50'
                    }`}>
                      <Edit3 className={`w-5 h-5 ${testChoice === 'know_maxes' ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${testChoice === 'know_maxes' ? 'text-white' : 'text-slate-300'}`}>
                        No, ma conosco i miei massimali
                      </p>
                      <p className="text-xs text-slate-400">Inserisco i valori manualmente</p>
                    </div>
                  </div>
                </button>

                {/* Opzione 3: Dopo */}
                <button
                  onClick={() => setTestChoice('later')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    testChoice === 'later'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      testChoice === 'later' ? 'bg-amber-500/30' : 'bg-slate-600/50'
                    }`}>
                      <Clock className={`w-5 h-5 ${testChoice === 'later' ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${testChoice === 'later' ? 'text-white' : 'text-slate-300'}`}>
                        Faro i test dopo
                      </p>
                      <p className="text-xs text-slate-400">Inizia con un programma base</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={!testChoice}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continua
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const correctOptionIndex = currentQuestion.options.findIndex(o => o.correct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Quiz Adattivo</h1>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                currentQuestion.category === 'A'
                  ? 'bg-red-500/20 text-red-300'
                  : currentQuestion.category === 'B'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-blue-500/20 text-blue-300'
              }`}>
                {currentQuestion.category === 'A' && 'Miti'}
                {currentQuestion.category === 'B' && 'Tecnica'}
                {currentQuestion.category === 'C' && 'Concetti'}
              </span>
              <span className="text-slate-300">{state.answers.length + 1} / max 7</span>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all rounded-full"
              style={{ width: `${Math.min(((state.answers.length + 1) / 7) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{currentQuestion.text}</h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = opt.correct;
              const isWrong = showExplanation && isSelected && !isCorrect;
              const showAsCorrect = showExplanation && isCorrect;

              return (
                <button
                  key={i}
                  onClick={() => !showExplanation && setSelected(i)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    showAsCorrect
                      ? 'border-green-500 bg-green-500/20 text-white'
                      : isWrong
                        ? 'border-red-500 bg-red-500/20 text-white'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                    opt.text.toLowerCase().includes('non lo so') || opt.text.toLowerCase().includes('mai sentito')
                      ? 'italic text-slate-400'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      showAsCorrect
                        ? 'border-green-500 bg-green-500'
                        : isWrong
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-500'
                    }`}>
                      {showAsCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                      {isWrong && <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium">{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={`border rounded-lg p-4 mb-6 ${
              selected !== null && currentQuestion.options[selected].correct
                ? 'bg-emerald-500/10 border-emerald-500'
                : 'bg-amber-500/10 border-amber-500'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                selected !== null && currentQuestion.options[selected].correct
                  ? 'text-emerald-300'
                  : 'text-amber-300'
              }`}>
                {selected !== null && currentQuestion.options[selected].correct ? '✓ Corretto!' : '✗ Non esattamente'}
              </p>
              <p className="text-slate-300">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          {!showExplanation ? (
            <button
              onClick={handleAnswer}
              disabled={selected === null}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              Conferma Risposta
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              {state.answers.length >= 6 || !selectNextQuestion({...state, askedQuestions: [...state.askedQuestions, currentQuestion.id]}, QUESTIONS)
                ? 'Vedi Risultato →'
                : 'Prossima Domanda →'
              }
            </button>
          )}
        </div>

        {/* Info box */}
        <div className="mt-4 text-center text-slate-500 text-sm">
          <p>Il quiz si adatta alle tue risposte per capire il tuo livello reale.</p>
        </div>
      </div>
    </div>
  );
}
