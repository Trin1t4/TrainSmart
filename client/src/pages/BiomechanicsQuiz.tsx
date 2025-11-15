import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAnswer, QuizResult, ExperienceLevel } from '../types/onboarding.types';

const QUIZ_QUESTIONS = [
  { 
    id: 1, 
    question: "Quando fai uno Squat (accosciata), dove dovresti sentire maggiormente il lavoro?", 
    options: ["Principalmente sulle ginocchia", "Gambe e glutei", "Solo sulla schiena", "NON LO SO"], 
    correct: 1, 
    explanation: "Lo squat lavora principalmente gambe e glutei quando fatto correttamente" 
  },
  { 
    id: 2, 
    question: "Durante un esercizio di spinta (es. piegamenti o panca), come dovrebbero muoversi le scapole?", 
    options: ["Retratte e stabili", "Sollevate verso le orecchie", "Completamente rilassate", "NON LO SO"], 
    correct: 0, 
    explanation: "Le scapole vanno retratte (portate indietro) per stabilità e sicurezza della spalla" 
  },
  { 
    id: 3, 
    question: "Cosa significa 'progressione' nell'allenamento?", 
    options: ["Cambiare esercizi ogni settimana", "Aumentare gradualmente difficoltà/carico", "Allenarsi tutti i giorni", "NON LO SO"], 
    correct: 1, 
    explanation: "Progressione significa aumentare gradualmente la difficoltà nel tempo per migliorare" 
  },
  { 
    id: 4, 
    question: "In un esercizio di trazione (es. trazioni alla sbarra), da dove parte il movimento?", 
    options: ["Piegando subito le braccia", "Attivando prima la schiena e scapole", "Oscillando con il corpo", "NON LO SO"], 
    correct: 1, 
    explanation: "Il movimento inizia attivando schiena e scapole, poi si piegano le braccia" 
  },
  { 
    id: 5, 
    question: "Quante ripetizioni dovresti lasciare 'in riserva' per un allenamento sicuro ed efficace?", 
    options: ["Nessuna, sempre al massimo", "1-3 ripetizioni prima del limite", "Fermarsi a metà", "NON LO SO"], 
    correct: 1, 
    explanation: "Lasciare 1-3 ripetizioni prima del limite permette di allenarsi duro ma in sicurezza" 
  }
];

export default function BiomechanicsQuiz() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);

  const q = QUIZ_QUESTIONS[current];

  const handleAnswer = () => {
    if (selected === null) return;
    const correct = selected === q.correct;
    setAnswers([...answers, { questionId: q.id, answer: q.options[selected], correct }]);
    setShowExp(true);
  };

  const next = () => {
    if (current < QUIZ_QUESTIONS.length - 1) {
      // ✅ Prossima domanda
      setCurrent(current + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      // ✅ ULTIMA DOMANDA: Salva e vai direttamente allo screening
      const finalAnswers = [...answers, { questionId: q.id, answer: q.options[selected!], correct: selected === q.correct }];
      const correctCount = finalAnswers.filter(a => a.correct).length;
      const score = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
      
      const quizData = {
        score: score,
        correctAnswers: correctCount,
        totalQuestions: QUIZ_QUESTIONS.length,
        answers: finalAnswers,
        completedAt: new Date().toISOString()
      };
      
      quizData.level = score >= 80 ? "advanced" : score >= 50 ? "intermediate" : "beginner";
      localStorage.setItem('quiz_data', JSON.stringify(quizData));
      
      // ✅ VAI DIRETTAMENTE ALLO SCREENING (nessuna schermata intermedia)
      navigate('/screening');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Quiz Conoscenze Base</h1>
            <span className="text-slate-300">{current + 1} / {QUIZ_QUESTIONS.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all" 
              style={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} 
            />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{q.question}</h2>
          
          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => !showExp && setSelected(i)} 
                disabled={showExp}
                className={`w-full p-4 rounded-lg border-2 text-left transition ${
                  showExp && i === q.correct 
                    ? 'border-green-500 bg-green-500/20 text-white' 
                    : showExp && selected === i 
                    ? 'border-red-500 bg-red-500/20 text-white' 
                    : selected === i 
                    ? 'border-emerald-500 bg-emerald-500/20 text-white' 
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                } ${showExp ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                  opt === 'NON LO SO' ? 'italic text-slate-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    showExp && i === q.correct 
                      ? 'border-green-500 bg-green-500' 
                      : showExp && selected === i 
                      ? 'border-red-500 bg-red-500' 
                      : selected === i 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-slate-500'
                  }`}>
                    {showExp && i === q.correct && '✓'}
                    {showExp && selected === i && i !== q.correct && '✕'}
                  </div>
                  <span className="font-medium">{opt}</span>
                </div>
              </button>
            ))}
          </div>

          {showExp && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-emerald-300 mb-2">💡 Spiegazione</p>
              <p className="text-slate-300">{q.explanation}</p>
            </div>
          )}

          {!showExp ? (
            <button 
              onClick={handleAnswer} 
              disabled={selected === null}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              Conferma Risposta
            </button>
          ) : (
            <button 
              onClick={next}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              {current < QUIZ_QUESTIONS.length - 1 ? 'Prossima Domanda →' : 'Inizia Screening Pratico →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
