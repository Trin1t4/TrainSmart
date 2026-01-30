/**
 * OptionalQuizzes.tsx
 *
 * Schermata post-onboarding che offre quiz/input facoltativi:
 * - Massimali (bilanciere + macchine)
 * - Running
 * - Misure corpo (Navy Method)
 * - Quiz biomeccanico
 *
 * L'utente può completare uno, alcuni, tutti o nessuno prima di procedere.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Activity, Ruler, Brain, ArrowRight,
  CheckCircle, Clock, ChevronRight, Sparkles, X
} from 'lucide-react';
import MaximalsInput, { UserMaximals } from '../components/MaximalsInput';

// ============================================================================
// TYPES
// ============================================================================

type QuizType = 'maximals' | 'running' | 'bodyMeasures' | 'biomechanics' | null;

interface QuizOption {
  id: QuizType;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUIZ_OPTIONS: QuizOption[] = [
  {
    id: 'maximals',
    title: 'Massimali',
    description: 'Inserisci i tuoi carichi massimi per calibrare il programma',
    time: '2 min',
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
  },
  {
    id: 'running',
    title: 'Running',
    description: 'Aggiungi la corsa al tuo programma di allenamento',
    time: '2 min',
    icon: <Activity className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
  },
  {
    id: 'bodyMeasures',
    title: 'Misure Corpo',
    description: 'Traccia la composizione corporea con Navy Method',
    time: '2 min',
    icon: <Ruler className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
  },
  {
    id: 'biomechanics',
    title: 'Quiz Biomeccanico',
    description: 'Migliora la precisione del programma con un test teorico',
    time: '5 min',
    icon: <Brain className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OptionalQuizzes() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeQuiz, setActiveQuiz] = useState<QuizType>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<QuizType>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);

  // ============================================================================
  // INIT - Controlla quiz già completati
  // ============================================================================

  useEffect(() => {
    const completed = new Set<QuizType>();
    const previousQuizTimestamp = sessionStorage.getItem('last_quiz_timestamp');

    // Controlla quiz biomeccanico
    const quizData = localStorage.getItem('quiz_data');
    if (quizData) {
      try {
        const parsed = JSON.parse(quizData);
        if (parsed.completedAt) {
          completed.add('biomechanics');

          // Se il quiz è stato appena completato (timestamp diverso), trigger rigenerazione
          if (previousQuizTimestamp !== parsed.completedAt) {
            sessionStorage.setItem('last_quiz_timestamp', parsed.completedAt);
            // Solo se c'era già un programma (non primo onboarding)
            const hasProgram = localStorage.getItem('currentProgram') || sessionStorage.getItem('had_program');
            if (hasProgram || previousQuizTimestamp) {
              localStorage.setItem('regenerate_program', 'quiz');
              console.log('[OPTIONAL_QUIZZES] Quiz biomeccanico completato - programma verrà rigenerato');
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Controlla massimali
    if (user) {
      const maximals = localStorage.getItem(`maximals_${user.id}`);
      if (maximals) {
        completed.add('maximals');
      }
    }

    if (completed.size > 0) {
      setCompletedQuizzes(completed);
    }
  }, [user]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleQuizComplete = async (quizType: QuizType, data?: any) => {
    if (!quizType || !user) return;

    try {
      // Salva i dati specifici del quiz
      if (quizType === 'maximals' && data) {
        await saveMaximals(data);
        // Trigger rigenerazione programma con nuovi massimali
        localStorage.setItem('regenerate_program', 'maximals');
        console.log('[OPTIONAL_QUIZZES] Massimali salvati - programma verrà rigenerato');
      }
      // Altri quiz salvano i loro dati internamente

      // Segna come completato
      setCompletedQuizzes(prev => new Set([...prev, quizType]));
      setActiveQuiz(null);

    } catch (error) {
      console.error(`[OPTIONAL_QUIZZES] Error saving ${quizType}:`, error);
    }
  };

  const saveMaximals = async (maximals: UserMaximals) => {
    if (!user) return;

    // Always save to localStorage as primary storage
    try {
      localStorage.setItem(`maximals_${user.id}`, JSON.stringify(maximals));
      console.log('[OPTIONAL_QUIZZES] Maximals saved to localStorage');
    } catch (e) {
      console.warn('[OPTIONAL_QUIZZES] Failed to save maximals to localStorage:', e);
    }

    // Try to save to Supabase (column may not exist yet)
    const { error } = await supabase
      .from('user_profiles')
      .update({
        maximals: maximals,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.warn('[OPTIONAL_QUIZZES] Could not save maximals to Supabase (column may not exist yet), localStorage fallback used:', error.message);
      // Don't throw - localStorage fallback is sufficient
      return;
    }

    console.log('[OPTIONAL_QUIZZES] Maximals saved to Supabase');
  };

  const handleSkipQuiz = () => {
    setActiveQuiz(null);
  };

  const handleProceedToDashboard = async () => {
    setIsNavigating(true);

    // Breve delay per feedback visivo
    await new Promise(resolve => setTimeout(resolve, 500));

    navigate('/dashboard');
  };

  // ============================================================================
  // RENDER QUIZ CONTENT
  // ============================================================================

  const renderActiveQuiz = () => {
    switch (activeQuiz) {
      case 'maximals':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-orange-400" />
                Inserisci i tuoi massimali
              </h3>
              <button
                onClick={handleSkipQuiz}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MaximalsInput
              onSave={(data) => handleQuizComplete('maximals', data)}
              onSkip={handleSkipQuiz}
              showSkip={true}
              compact={true}
            />
          </motion.div>
        );

      case 'running':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Aggiungi Running
              </h3>
              <button
                onClick={handleSkipQuiz}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RunningQuizPlaceholder
              onComplete={() => handleQuizComplete('running')}
              onSkip={handleSkipQuiz}
            />
          </motion.div>
        );

      case 'bodyMeasures':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ruler className="w-6 h-6 text-purple-400" />
                Misure Corporee
              </h3>
              <button
                onClick={handleSkipQuiz}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BodyMeasuresPlaceholder
              onComplete={() => handleQuizComplete('bodyMeasures')}
              onSkip={handleSkipQuiz}
            />
          </motion.div>
        );

      case 'biomechanics':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-emerald-400" />
                Quiz Biomeccanico
              </h3>
              <button
                onClick={handleSkipQuiz}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BiomechanicsQuizPlaceholder
              onComplete={() => handleQuizComplete('biomechanics')}
              onSkip={handleSkipQuiz}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Programma pronto!
          </h1>
          <p className="text-slate-400">
            Vuoi personalizzare ancora di più? Questi quiz sono facoltativi.
          </p>
        </div>

        {/* Active Quiz */}
        <AnimatePresence mode="wait">
          {activeQuiz && (
            <div className="mb-8">
              {renderActiveQuiz()}
            </div>
          )}
        </AnimatePresence>

        {/* Quiz Options Grid */}
        {!activeQuiz && (
          <div className="space-y-4 mb-8">
            {QUIZ_OPTIONS.map((quiz, index) => {
              const isCompleted = completedQuizzes.has(quiz.id);

              return (
                <motion.button
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !isCompleted && setActiveQuiz(quiz.id)}
                  disabled={isCompleted}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                    isCompleted
                      ? 'border-emerald-500/50 bg-emerald-500/10 cursor-default'
                      : `${quiz.borderColor} ${quiz.bgColor} hover:bg-opacity-30 cursor-pointer`
                  }`}
                >
                  <div className={`p-3 rounded-lg ${isCompleted ? 'bg-emerald-500/20' : quiz.bgColor}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <span className={quiz.color}>{quiz.icon}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                        {quiz.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
                          Completato
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{quiz.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {quiz.time}
                    </div>
                    {!isCompleted && (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Proceed Button */}
        {!activeQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleProceedToDashboard}
              disabled={isNavigating}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isNavigating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparazione...
                </>
              ) : (
                <>
                  {completedQuizzes.size > 0
                    ? 'Vai al programma'
                    : 'Salta e vai al programma'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4">
              Puoi sempre completare questi quiz dal tuo profilo
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PLACEHOLDER COMPONENTS (da implementare in dettaglio)
// ============================================================================

function RunningQuizPlaceholder({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-200">
          Qui verrà integrato il RunningOnboarding esistente per raccogliere:
        </p>
        <ul className="text-blue-300/80 text-sm mt-2 space-y-1">
          <li>• Livello attuale di corsa</li>
          <li>• Obiettivo running</li>
          <li>• Integrazione con allenamento pesi</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-600 transition"
        >
          Salta
        </button>
        <button
          onClick={onComplete}
          className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Simula completamento
        </button>
      </div>
    </div>
  );
}

function BodyMeasuresPlaceholder({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [height, setHeight] = useState('');

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        Inserisci le tue misure per calcolare la composizione corporea con il Navy Method.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Altezza (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="170"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Collo (cm)</label>
          <input
            type="number"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            placeholder="38"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Vita (cm)</label>
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="85"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Fianchi (cm)</label>
          <input
            type="number"
            value={hips}
            onChange={(e) => setHips(e.target.value)}
            placeholder="95"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-600 transition"
        >
          Salta
        </button>
        <button
          onClick={onComplete}
          className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
        >
          Salva misure
        </button>
      </div>
    </div>
  );
}

function BiomechanicsQuizPlaceholder({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    // Naviga al quiz vero, con state per tornare qui dopo
    navigate('/quiz-full', { state: { returnTo: '/optional-quizzes' } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <p className="text-emerald-200">
          Test le tue conoscenze biomeccaniche:
        </p>
        <ul className="text-emerald-300/80 text-sm mt-2 space-y-1">
          <li>• Domande su mobilità e flessibilità</li>
          <li>• Valutazione conoscenze tecniche</li>
          <li>• Identificazione punti deboli</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-600 transition"
        >
          Salta
        </button>
        <button
          onClick={handleStartQuiz}
          className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition"
        >
          Inizia quiz
        </button>
      </div>
    </div>
  );
}
