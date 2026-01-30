import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Shield, BookOpen, CheckCircle, XCircle, ArrowRight, MapPin, Clock, Edit3, Dumbbell, Info } from 'lucide-react';
import { DCSS_QUIZ_QUESTIONS, type QuizQuestion, type QuizOption, evaluateQuiz } from '@trainsmart/shared';

// ============================================================================
// TYPES - DCSS Paradigm
// ============================================================================

type Level = 'beginner' | 'intermediate' | 'advanced';

interface Answer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  isTechniqueGap?: boolean;
  isOverconfident?: boolean;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Answer[];
  askedQuestions: string[];
}

// ============================================================================
// DCSS QUIZ QUESTIONS - Imported from shared package
// Uses nuanced, evidence-based questions without dogma
// ============================================================================

// Use DCSS questions directly from shared package
const QUESTIONS = DCSS_QUIZ_QUESTIONS;
const MAX_QUESTIONS = 7;

// ============================================================================
// ADAPTIVE SELECTION - DCSS Paradigm
// ============================================================================

function selectNextQuestion(state: QuizState, pool: QuizQuestion[]): QuizQuestion | null {
  const available = pool.filter(q => !state.askedQuestions.includes(q.id));

  if (available.length === 0) return null;
  if (state.answers.length >= MAX_QUESTIONS) return null;

  // Count overconfident and technique gap answers
  const overconfidentCount = state.answers.filter(a => a.isOverconfident).length;
  const techniqueGapCount = state.answers.filter(a => a.isTechniqueGap).length;

  // Early exit if pattern is clear
  if ((overconfidentCount >= 2 || techniqueGapCount >= 2) && state.answers.length >= 4) {
    return null;
  }

  // Adaptive selection based on previous answers
  const byCategory: Record<string, QuizQuestion[]> = {
    technique: [],
    anatomy: [],
    programming: [],
    safety: []
  };

  available.forEach(q => {
    if (byCategory[q.category]) {
      byCategory[q.category].push(q);
    }
  });

  // Priority: technique first, then safety, then programming, then anatomy
  const categoryOrder = ['technique', 'safety', 'programming', 'anatomy'];

  for (const cat of categoryOrder) {
    const catQuestions = byCategory[cat];
    if (catQuestions.length > 0) {
      // Prioritize by difficulty based on current performance
      const correctCount = state.answers.filter(a => a.correct).length;
      const accuracy = state.answers.length > 0 ? correctCount / state.answers.length : 0.5;

      // If doing well, try harder questions; if struggling, stick to basics
      const targetDifficulty = accuracy > 0.7 ? 'intermediate' : 'basic';
      const matchingDifficulty = catQuestions.filter(q => q.difficulty === targetDifficulty);

      if (matchingDifficulty.length > 0) {
        return matchingDifficulty[Math.floor(Math.random() * matchingDifficulty.length)];
      }
      return catQuestions[Math.floor(Math.random() * catQuestions.length)];
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

function calculateLevel(state: QuizState): { level: Level; label: string; description: string } {
  const correctCount = state.answers.filter(a => a.correct).length;
  const overconfidentCount = state.answers.filter(a => a.isOverconfident).length;
  const techniqueGapCount = state.answers.filter(a => a.isTechniqueGap).length;
  const total = state.answers.length;
  const accuracy = total > 0 ? correctCount / total : 0;

  // Rule: too many overconfident answers = needs flexibility training
  if (overconfidentCount >= 2) {
    return {
      level: 'intermediate',
      label: 'Costruzione',
      description: 'Hai buone conoscenze, ma alcune credenze potrebbero essere più rigide di quanto la scienza supporti. Il tuo programma includerà indicazioni sfumate e flessibili.',
    };
  }

  // Rule: too many technique gaps = beginner focus
  if (techniqueGapCount >= 2) {
    return {
      level: 'beginner',
      label: 'Fondamenta',
      description: 'Ci sono alcuni concetti tecnici da approfondire. Il tuo programma includerà spiegazioni dettagliate e progressione graduale.',
    };
  }

  // Accuracy-based level
  if (accuracy >= 0.8) {
    return {
      level: 'advanced',
      label: 'Padronanza',
      description: 'Ottima comprensione dei principi dell\'allenamento. Il programma sarà diretto e senza spiegazioni ridondanti.',
    };
  }

  if (accuracy >= 0.5) {
    return {
      level: 'intermediate',
      label: 'Costruzione',
      description: 'Conosci le basi e sai muoverti bene. Il tuo programma sarà calibrato per farti progredire con intensità appropriate.',
    };
  }

  return {
    level: 'beginner',
    label: 'Fondamenta',
    description: 'Ci concentreremo sull\'insegnarti i fondamentali con molte spiegazioni e indicazioni.',
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BiomechanicsQuizFull() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo;

  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    askedQuestions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(() =>
    selectNextQuestion(state, QUESTIONS)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [testChoice, setTestChoice] = useState<'gym' | 'know_maxes' | 'later' | null>(null);

  const result = useMemo(() => calculateLevel(state), [state]);

  const handleAnswer = useCallback(() => {
    if (selected === null || !currentQuestion) return;

    const selectedOption = currentQuestion.options.find(o => o.id === selected);
    if (!selectedOption) return;

    const isCorrect = selectedOption.isCorrect;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId: selected,
      correct: isCorrect,
      isTechniqueGap: selectedOption.isTechniqueGap,
      isOverconfident: selectedOption.isOverconfident,
    };

    setState({
      ...state,
      answers: [...state.answers, newAnswer],
      askedQuestions: [...state.askedQuestions, currentQuestion.id],
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

    // Build DCSS-compatible answer record for evaluation
    const answerRecord: Record<string, string> = {};
    state.answers.forEach(a => {
      answerRecord[a.questionId] = a.selectedOptionId;
    });

    const quizData = {
      level: finalResult.level,
      levelLabel: finalResult.label,
      totalQuestions: state.answers.length,
      correctAnswers: state.answers.filter(a => a.correct).length,
      overconfidentCount: state.answers.filter(a => a.isOverconfident).length,
      techniqueGapCount: state.answers.filter(a => a.isTechniqueGap).length,
      answers: state.answers,
      completedAt: new Date().toISOString(),
      paradigm: 'DCSS', // Mark as DCSS quiz
    };

    localStorage.setItem('quiz_data', JSON.stringify(quizData));

    // Se viene da optional-quizzes, torna lì
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    if (testChoice === 'gym') {
      // Vai ai test pratici con riscaldamento
      navigate('/screening-full');
    } else if (testChoice === 'know_maxes') {
      // Vai a inserire i massimali manualmente
      navigate('/screening-full', { state: { manualEntry: true } });
    } else {
      // Salta i test, vai alla dashboard
      localStorage.setItem('screening_pending', 'true');
      navigate('/dashboard');
    }
  }, [state, navigate, testChoice, returnTo]);

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

            {/* DCSS Feedback */}
            {state.answers.filter(a => a.isOverconfident).length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300 text-sm">
                  Alcune risposte indicano credenze che potrebbero essere più rigide di quanto la scienza supporti.
                  Il tuo programma includerà indicazioni sfumate basate su evidenze attuali.
                </p>
              </div>
            )}

            {state.answers.filter(a => a.isTechniqueGap).length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-300 text-sm">
                  Ci sono alcuni concetti tecnici da approfondire. Il tuo programma includerà spiegazioni
                  dettagliate e indicazioni educative.
                </p>
              </div>
            )}

            {/* Se viene da OptionalQuizzes, mostra solo il pulsante per tornare */}
            {returnTo ? (
              <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
              >
                Torna ai quiz opzionali
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
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
                          <p className="text-xs text-slate-400">4 test pratici (~10 min)</p>
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
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const selectedOption = selected ? currentQuestion.options.find(o => o.id === selected) : null;
  const correctOption = currentQuestion.options.find(o => o.isCorrect);

  // Category labels for DCSS
  const categoryLabels: Record<string, { bg: string; text: string; label: string }> = {
    technique: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Tecnica' },
    anatomy: { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Anatomia' },
    programming: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Programmazione' },
    safety: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'Sicurezza' },
  };

  const categoryInfo = categoryLabels[currentQuestion.category] || categoryLabels.technique;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Quiz Biomeccanica</h1>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${categoryInfo.bg} ${categoryInfo.text}`}>
                {categoryInfo.label}
              </span>
              <span className="text-slate-300">{state.answers.length + 1} / max {MAX_QUESTIONS}</span>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all rounded-full"
              style={{ width: `${Math.min(((state.answers.length + 1) / MAX_QUESTIONS) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
            {currentQuestion.questionIt || currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = opt.isCorrect;
              const isWrong = showExplanation && isSelected && !isCorrect;
              const showAsCorrect = showExplanation && isCorrect;

              return (
                <button
                  key={opt.id}
                  onClick={() => !showExplanation && setSelected(opt.id)}
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
                    (opt.textIt || opt.text).toLowerCase().includes('non') && (opt.textIt || opt.text).toLowerCase().includes('so')
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
                    <span className="font-medium">{opt.textIt || opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation with option-level feedback */}
          {showExplanation && selectedOption && (
            <div className={`border rounded-lg p-4 mb-6 ${
              selectedOption.isCorrect
                ? 'bg-emerald-500/10 border-emerald-500'
                : 'bg-amber-500/10 border-amber-500'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                selectedOption.isCorrect
                  ? 'text-emerald-300'
                  : 'text-amber-300'
              }`}>
                {selectedOption.isCorrect ? '✓ Corretto!' : '✗ Non esattamente'}
              </p>
              {/* Show option-specific feedback if available */}
              {selectedOption.feedbackIt && (
                <p className="text-slate-400 text-sm mb-2 italic">{selectedOption.feedbackIt}</p>
              )}
              {/* Show general explanation */}
              <p className="text-slate-300">
                {currentQuestion.explanationIt || currentQuestion.explanation}
              </p>
              {/* Show reference if available */}
              {currentQuestion.reference && (
                <p className="text-slate-500 text-xs mt-2">Fonte: {currentQuestion.reference}</p>
              )}
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
              {state.answers.length >= MAX_QUESTIONS - 1 || !selectNextQuestion({...state, askedQuestions: [...state.askedQuestions, currentQuestion.id]}, QUESTIONS)
                ? 'Vedi Risultato →'
                : 'Prossima Domanda →'
              }
            </button>
          )}
        </div>

        {/* Info box */}
        <div className="mt-4 text-center text-slate-500 text-sm">
          <p>Le risposte sono sfumate - spesso "dipende" è la risposta giusta.</p>
        </div>
      </div>
    </div>
  );
}
