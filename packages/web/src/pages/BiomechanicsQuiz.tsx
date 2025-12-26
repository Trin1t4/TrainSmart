import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Target, Brain, ArrowRight, CheckCircle, MapPin, Clock, Edit3 } from 'lucide-react';

// ============================================================================
// BETA: Quiz Semplificato - Solo 3 domande veloci
// ============================================================================

type Level = 'beginner' | 'intermediate' | 'advanced';

interface BetaQuestion {
  id: string;
  icon: any;
  question: string;
  options: {
    text: string;
    value: number;
    level?: Level;
  }[];
}

// 3 domande essenziali per determinare il livello
const BETA_QUESTIONS: BetaQuestion[] = [
  {
    id: 'experience',
    icon: Dumbbell,
    question: 'Da quanto tempo ti alleni con costanza?',
    options: [
      { text: 'Mai o meno di 3 mesi', value: 0, level: 'beginner' },
      { text: 'Da 3 mesi a 2 anni', value: 1, level: 'intermediate' },
      { text: 'Piu di 2 anni', value: 2, level: 'advanced' },
    ],
  },
  {
    id: 'frequency',
    icon: Target,
    question: 'Quante volte a settimana ti alleni (o vorresti allenarti)?',
    options: [
      { text: '1-2 volte', value: 0, level: 'beginner' },
      { text: '3-4 volte', value: 1, level: 'intermediate' },
      { text: '5+ volte', value: 2, level: 'advanced' },
    ],
  },
  {
    id: 'knowledge',
    icon: Brain,
    question: 'Come valuteresti la tua conoscenza della tecnica degli esercizi?',
    options: [
      { text: 'Base - ho bisogno di imparare', value: 0, level: 'beginner' },
      { text: 'Discreta - conosco gli esercizi principali', value: 1, level: 'intermediate' },
      { text: 'Avanzata - padroneggio le tecniche', value: 2, level: 'advanced' },
    ],
  },
];

function calculateLevel(answers: number[]): { level: Level; score: number } {
  const totalScore = answers.reduce((sum, val) => sum + val, 0);
  // Max score = 6 (3 domande × 2 punti max)

  if (totalScore <= 2) {
    return { level: 'beginner', score: totalScore };
  } else if (totalScore <= 4) {
    return { level: 'intermediate', score: totalScore };
  } else {
    return { level: 'advanced', score: totalScore };
  }
}

export default function BiomechanicsQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [testChoice, setTestChoice] = useState<'gym' | 'know_maxes' | 'later' | null>(null);

  const question = BETA_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / BETA_QUESTIONS.length) * 100;

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, question.options[selectedOption].value];
    setAnswers(newAnswers);

    if (currentQuestion < BETA_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Quiz completo
      const result = calculateLevel(newAnswers);

      // Salva i dati del quiz
      const quizData = {
        score: result.score,
        level: result.level,
        levelLabel: result.level === 'beginner' ? 'Principiante' : result.level === 'intermediate' ? 'Intermedio' : 'Avanzato',
        totalQuestions: BETA_QUESTIONS.length,
        correctAnswers: newAnswers.filter(a => a > 0).length,
        answers: newAnswers,
        completedAt: new Date().toISOString(),
        isBetaQuiz: true,
      };

      localStorage.setItem('quiz_data', JSON.stringify(quizData));
      setIsComplete(true);
    }
  };

  const handleFinish = () => {
    if (testChoice === 'gym') {
      // Vai ai test pratici
      navigate('/screening');
    } else if (testChoice === 'know_maxes') {
      // Vai a inserire i massimali manualmente
      navigate('/screening', { state: { manualEntry: true } });
    } else {
      // Salta i test, vai alla dashboard
      // Salva che i test sono da fare dopo
      localStorage.setItem('screening_pending', 'true');
      navigate('/dashboard');
    }
  };

  // Schermata risultato
  if (isComplete) {
    const result = calculateLevel(answers);
    const levelLabel = result.level === 'beginner' ? 'Principiante' : result.level === 'intermediate' ? 'Intermedio' : 'Avanzato';
    const levelColor = result.level === 'beginner' ? 'emerald' : result.level === 'intermediate' ? 'blue' : 'purple';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 text-center">
            {/* Icona */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-${levelColor}-500/20 border-2 border-${levelColor}-500`}>
              <CheckCircle className={`w-10 h-10 text-${levelColor}-400`} />
            </div>

            {/* Titolo */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Livello stimato: <span className={`text-${levelColor}-400`}>{levelLabel}</span>
            </h2>

            <p className="text-slate-400 mb-6">
              Per calibrare il programma, dobbiamo valutare le tue capacita fisiche
            </p>

            {/* Domanda: Sei in palestra? */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
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
                      <p className="text-xs text-slate-400">2-4 test pratici (~5 min)</p>
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

  const IconComponent = question.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Quiz Rapido</h1>
            <span className="text-slate-300">{currentQuestion + 1} / {BETA_QUESTIONS.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30">
            <IconComponent className="w-8 h-8 text-emerald-400" />
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-white text-center mb-6">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption === idx
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedOption === idx
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-500'
                  }`}>
                    {selectedOption === idx && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-medium">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
          >
            {currentQuestion < BETA_QUESTIONS.length - 1 ? 'Avanti' : 'Vedi Risultato'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-slate-500 text-sm mt-4">
          3 domande veloci per iniziare
        </p>
      </div>
    </div>
  );
}
