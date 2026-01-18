/**
 * FirstSessionAssessment.tsx
 *
 * Test pratici alla prima seduta in palestra.
 * Testa i pattern fondamentali per calibrare baselines reali:
 * - Push (push-up o chest press)
 * - Pull (australian row o lat machine)
 * - Squat (bodyweight o goblet)
 *
 * I risultati sovrascrivono i default e calibrano il programma.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle, ChevronRight, ChevronLeft,
  Target, Video, AlertCircle, Sparkles, RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { PatternBaselines, PatternBaseline } from '@trainsmart/shared';

// ============================================================================
// TYPES
// ============================================================================

interface TestResult {
  reps: number;
  rpe?: number; // Opzionale: quanto era difficile 1-10
  notes?: string;
}

interface AssessmentData {
  pushTest?: TestResult;
  pullTest?: TestResult;
  squatTest?: TestResult;
  completedAt?: string;
}

interface FirstSessionAssessmentProps {
  userId: string;
  location: 'gym' | 'home';
  currentBaselines?: PatternBaselines;
  onComplete: (baselines: PatternBaselines) => void;
  onSkip?: () => void;
}

interface TestDefinition {
  id: 'push' | 'pull' | 'squat';
  pattern: keyof PatternBaselines;
  title: string;
  gymExercise: string;
  homeExercise: string;
  gymVideoUrl?: string;
  homeVideoUrl?: string;
  instructions: string[];
  targetReps: { beginner: string; intermediate: string; advanced: string };
  icon: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TESTS: TestDefinition[] = [
  {
    id: 'push',
    pattern: 'horizontal_push',
    title: 'Test Push',
    gymExercise: 'Chest Press (o Push-up)',
    homeExercise: 'Push-up',
    instructions: [
      'Posizionati in posizione di partenza',
      'Esegui il maggior numero di ripetizioni possibili',
      'Mantieni la tecnica corretta fino alla fine',
      'Fermati quando non riesci più a completare una rep pulita',
    ],
    targetReps: {
      beginner: '< 10 reps',
      intermediate: '10-20 reps',
      advanced: '> 20 reps'
    },
    icon: '💪'
  },
  {
    id: 'pull',
    pattern: 'horizontal_pull',
    title: 'Test Pull',
    gymExercise: 'Lat Machine (o Australian Row)',
    homeExercise: 'Australian Row (sotto un tavolo)',
    instructions: [
      'Imposta un peso moderato (lat) o trova una posizione inclinata (row)',
      'Esegui trazioni portando il petto verso la barra/tavolo',
      'Conta quante ripetizioni riesci a fare con tecnica corretta',
      'Il petto deve toccare (o avvicinarsi molto) alla barra',
    ],
    targetReps: {
      beginner: '< 8 reps',
      intermediate: '8-15 reps',
      advanced: '> 15 reps'
    },
    icon: '🔙'
  },
  {
    id: 'squat',
    pattern: 'lower_push',
    title: 'Test Squat',
    gymExercise: 'Goblet Squat (o Bodyweight)',
    homeExercise: 'Bodyweight Squat',
    instructions: [
      'Piedi larghezza spalle, punte leggermente in fuori',
      'Scendi fino a quando le cosce sono parallele al pavimento',
      'Risali completamente estendendo le ginocchia',
      'Conta le ripetizioni fino a quando la tecnica si deteriora',
    ],
    targetReps: {
      beginner: '< 15 reps',
      intermediate: '15-30 reps',
      advanced: '> 30 reps'
    },
    icon: '🦵'
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determina il livello basato sulle reps e calcola la baseline
 */
function calculateLevelFromReps(
  testId: 'push' | 'pull' | 'squat',
  reps: number
): { level: 'beginner' | 'intermediate' | 'advanced'; baseline: string; difficulty: number } {

  const thresholds = {
    push: { intermediate: 10, advanced: 20 },
    pull: { intermediate: 8, advanced: 15 },
    squat: { intermediate: 15, advanced: 30 },
  };

  const t = thresholds[testId];

  if (reps < t.intermediate) {
    return {
      level: 'beginner',
      baseline: getBaselineExercise(testId, 'beginner'),
      difficulty: 3
    };
  } else if (reps < t.advanced) {
    return {
      level: 'intermediate',
      baseline: getBaselineExercise(testId, 'intermediate'),
      difficulty: 5
    };
  } else {
    return {
      level: 'advanced',
      baseline: getBaselineExercise(testId, 'advanced'),
      difficulty: 7
    };
  }
}

/**
 * Ritorna l'esercizio baseline appropriato per pattern e livello
 */
function getBaselineExercise(
  testId: 'push' | 'pull' | 'squat',
  level: 'beginner' | 'intermediate' | 'advanced'
): string {
  const exercises = {
    push: {
      beginner: 'Incline Push-up',
      intermediate: 'Push-up',
      advanced: 'Diamond Push-up',
    },
    pull: {
      beginner: 'High Australian Row',
      intermediate: 'Australian Row',
      advanced: 'Low Australian Row',
    },
    squat: {
      beginner: 'Assisted Squat',
      intermediate: 'Bodyweight Squat',
      advanced: 'Pistol Squat Progression',
    },
  };

  return exercises[testId][level];
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TestCardProps {
  test: TestDefinition;
  location: 'gym' | 'home';
  result?: TestResult;
  onStart: () => void;
  isCompleted: boolean;
}

function TestCard({ test, location, result, onStart, isCompleted }: TestCardProps) {
  const exercise = location === 'gym' ? test.gymExercise : test.homeExercise;
  const levelInfo = result ? calculateLevelFromReps(test.id, result.reps) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 rounded-xl p-5 border-2 transition-all ${
        isCompleted
          ? 'border-emerald-500/50'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{test.icon}</span>
          <div>
            <h3 className="font-bold text-white text-lg">{test.title}</h3>
            <p className="text-slate-400 text-sm">{exercise}</p>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">{result?.reps} reps</span>
          </div>
        )}
      </div>

      {/* Level indicator after completion */}
      {levelInfo && (
        <div className={`mb-4 p-3 rounded-lg ${
          levelInfo.level === 'beginner' ? 'bg-blue-500/10 border border-blue-500/30' :
          levelInfo.level === 'intermediate' ? 'bg-yellow-500/10 border border-yellow-500/30' :
          'bg-emerald-500/10 border border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${
              levelInfo.level === 'beginner' ? 'text-blue-300' :
              levelInfo.level === 'intermediate' ? 'text-yellow-300' :
              'text-emerald-300'
            }`}>
              Livello: {levelInfo.level.charAt(0).toUpperCase() + levelInfo.level.slice(1)}
            </span>
            <span className="text-xs text-slate-400">
              Baseline: {levelInfo.baseline}
            </span>
          </div>
        </div>
      )}

      {/* Target ranges */}
      {!isCompleted && (
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-500/10 p-2 rounded text-center">
            <div className="text-blue-300 font-semibold">Beginner</div>
            <div className="text-blue-400/70">{test.targetReps.beginner}</div>
          </div>
          <div className="bg-yellow-500/10 p-2 rounded text-center">
            <div className="text-yellow-300 font-semibold">Intermediate</div>
            <div className="text-yellow-400/70">{test.targetReps.intermediate}</div>
          </div>
          <div className="bg-emerald-500/10 p-2 rounded text-center">
            <div className="text-emerald-300 font-semibold">Advanced</div>
            <div className="text-emerald-400/70">{test.targetReps.advanced}</div>
          </div>
        </div>
      )}

      {!isCompleted && (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Inizia Test
        </button>
      )}
    </motion.div>
  );
}

interface TestExecutionProps {
  test: TestDefinition;
  location: 'gym' | 'home';
  onComplete: (result: TestResult) => void;
  onBack: () => void;
}

function TestExecution({ test, location, onComplete, onBack }: TestExecutionProps) {
  const [step, setStep] = useState<'instructions' | 'input'>('instructions');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState<number>(7);

  const exercise = location === 'gym' ? test.gymExercise : test.homeExercise;

  const handleSubmit = () => {
    const repsNum = parseInt(reps);
    if (isNaN(repsNum) || repsNum < 0) return;

    onComplete({ reps: repsNum, rpe });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{test.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{test.title}</h3>
            <p className="text-slate-400">{exercise}</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'instructions' ? (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Video placeholder */}
            <div className="bg-slate-700/50 rounded-xl p-8 mb-6 flex flex-col items-center justify-center">
              <Video className="w-12 h-12 text-slate-500 mb-2" />
              <p className="text-slate-400 text-sm">Video dimostrativo</p>
              <p className="text-slate-500 text-xs mt-1">{exercise}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Come eseguire il test
              </h4>
              <ol className="space-y-2">
                {test.instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => setStep('input')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
            >
              Ho capito, inizia
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Timer/Countdown could go here */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Esegui il test e inserisci il numero di ripetizioni completate con tecnica corretta.
              </p>
            </div>

            {/* Reps Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quante ripetizioni hai fatto?
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-4 text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoFocus
              />
            </div>

            {/* RPE (optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quanto è stato difficile? (1 = facile, 10 = massimo)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRpe(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      rpe === n
                        ? n <= 3 ? 'bg-green-500 text-white' :
                          n <= 6 ? 'bg-yellow-500 text-white' :
                          n <= 8 ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('instructions')}
                className="flex-1 bg-slate-700 text-slate-300 py-4 rounded-xl font-semibold hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Indietro
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reps || parseInt(reps) < 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Conferma
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FirstSessionAssessment({
  userId,
  location,
  currentBaselines,
  onComplete,
  onSkip,
}: FirstSessionAssessmentProps) {
  const [activeTest, setActiveTest] = useState<TestDefinition | null>(null);
  const [results, setResults] = useState<AssessmentData>({});
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = Object.keys(results).filter(k => k !== 'completedAt').length;
  const allCompleted = completedCount === TESTS.length;

  const handleTestComplete = (testId: 'push' | 'pull' | 'squat', result: TestResult) => {
    const key = `${testId}Test` as keyof AssessmentData;
    setResults(prev => ({ ...prev, [key]: result }));
    setActiveTest(null);
  };

  const handleFinish = async () => {
    setIsSaving(true);

    try {
      // Costruisci baselines dai risultati
      const newBaselines: PatternBaselines = {
        ...(currentBaselines || {}),
      };

      // Mappa i risultati ai pattern
      if (results.pushTest) {
        const { level, baseline, difficulty } = calculateLevelFromReps('push', results.pushTest.reps);
        newBaselines.horizontal_push = {
          variantId: baseline.toLowerCase().replace(/\s+/g, '_'),
          variantName: baseline,
          difficulty,
          reps: results.pushTest.reps,
          testDate: new Date().toISOString(),
        };
      }

      if (results.pullTest) {
        const { level, baseline, difficulty } = calculateLevelFromReps('pull', results.pullTest.reps);
        newBaselines.horizontal_pull = {
          variantId: baseline.toLowerCase().replace(/\s+/g, '_'),
          variantName: baseline,
          difficulty,
          reps: results.pullTest.reps,
          testDate: new Date().toISOString(),
        };
      }

      if (results.squatTest) {
        const { level, baseline, difficulty } = calculateLevelFromReps('squat', results.squatTest.reps);
        newBaselines.lower_push = {
          variantId: baseline.toLowerCase().replace(/\s+/g, '_'),
          variantName: baseline,
          difficulty,
          reps: results.squatTest.reps,
          testDate: new Date().toISOString(),
        };
      }

      // Salva su Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          baselines: newBaselines,
          first_session_assessment: {
            ...results,
            completedAt: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('[FIRST_SESSION] Assessment saved', newBaselines);

      onComplete(newBaselines);

    } catch (error) {
      console.error('[FIRST_SESSION] Error saving:', error);
      alert('Errore durante il salvataggio. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Active test view
  if (activeTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <TestExecution
            test={activeTest}
            location={location}
            onComplete={(result) => handleTestComplete(activeTest.id, result)}
            onBack={() => setActiveTest(null)}
          />
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Target className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Test di Valutazione
          </h1>
          <p className="text-slate-400">
            Prima di iniziare, testiamo il tuo livello reale
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Completati</span>
            <span className="text-sm font-semibold text-white">
              {completedCount} / {TESTS.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / TESTS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Tests */}
        <div className="space-y-4 mb-8">
          {TESTS.map((test, index) => {
            const resultKey = `${test.id}Test` as keyof AssessmentData;
            const result = results[resultKey] as TestResult | undefined;

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TestCard
                  test={test}
                  location={location}
                  result={result}
                  onStart={() => setActiveTest(test)}
                  isCompleted={!!result}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-emerald-300 font-semibold">Tutti i test completati!</p>
                <p className="text-emerald-400/70 text-sm">
                  Il programma verrà calibrato sui tuoi risultati reali
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex-1 bg-slate-700 text-slate-300 py-4 rounded-xl font-semibold hover:bg-slate-600 transition"
              >
                Salta per ora
              </button>
            )}
            <button
              onClick={handleFinish}
              disabled={completedCount === 0 || isSaving}
              className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  {allCompleted ? 'Salva e genera programma' : `Continua con ${completedCount} test`}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {completedCount > 0 && completedCount < TESTS.length && (
            <p className="text-center text-slate-500 text-sm">
              Puoi completare i test mancanti in seguito
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
