import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, SkipForward, CheckCircle, AlertTriangle, Flame } from 'lucide-react';

interface WarmupExercise {
  name: string;
  duration: number; // seconds
  description: string;
  targetArea: string;
  icon: string;
}

const WARMUP_EXERCISES: WarmupExercise[] = [
  {
    name: 'Marcia sul posto',
    duration: 60,
    description: 'Alza le ginocchia alternandole, braccia in movimento naturale',
    targetArea: 'Cardiovascolare',
    icon: '🚶'
  },
  {
    name: 'Rotazioni spalle',
    duration: 30,
    description: 'Grandi cerchi in avanti, poi indietro. 15 per direzione',
    targetArea: 'Spalle',
    icon: '🔄'
  },
  {
    name: 'Rotazioni busto',
    duration: 30,
    description: 'Mani sui fianchi, ruota il busto da un lato all\'altro',
    targetArea: 'Core / Schiena',
    icon: '↔️'
  },
  {
    name: 'Squat leggeri',
    duration: 45,
    description: 'Scendi lentamente fino a parallelo, poi risali. 10-12 ripetizioni',
    targetArea: 'Gambe',
    icon: '🦵'
  },
  {
    name: 'Slanci gamba avanti/indietro',
    duration: 40,
    description: 'Tieni un supporto, slancia la gamba avanti e indietro. 10 per gamba',
    targetArea: 'Anche / Flessori',
    icon: '🦿'
  },
  {
    name: 'Rotazioni polsi e caviglie',
    duration: 30,
    description: 'Cerchi con polsi e caviglie in entrambe le direzioni',
    targetArea: 'Articolazioni',
    icon: '✋'
  },
  {
    name: 'Jumping jacks leggeri',
    duration: 45,
    description: 'Salta aprendo gambe e braccia, poi chiudi. Mantieni ritmo moderato',
    targetArea: 'Tutto il corpo',
    icon: '⭐'
  }
];

interface WarmupGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function WarmupGuide({ onComplete, onSkip }: WarmupGuideProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WARMUP_EXERCISES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const exercise = WARMUP_EXERCISES[currentExercise];
  const totalExercises = WARMUP_EXERCISES.length;
  const progress = ((currentExercise + (1 - timeLeft / exercise.duration)) / totalExercises) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Move to next exercise
      if (currentExercise < totalExercises - 1) {
        setCurrentExercise((prev) => prev + 1);
        setTimeLeft(WARMUP_EXERCISES[currentExercise + 1].duration);
      } else {
        // Warmup complete
        setIsRunning(false);
        setIsCompleted(true);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentExercise, totalExercises]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipExercise = () => {
    if (currentExercise < totalExercises - 1) {
      setCurrentExercise((prev) => prev + 1);
      setTimeLeft(WARMUP_EXERCISES[currentExercise + 1].duration);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-emerald-500/30 p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Riscaldamento Completato!</h2>
          <p className="text-slate-300 mb-6">
            Sei pronto per il test di valutazione. Ricorda: ascolta il tuo corpo e fermati se senti dolore.
          </p>
          <button
            onClick={onComplete}
            className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5" />
            Inizia Assessment
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Riscaldamento Pre-Assessment</h1>
          <p className="text-slate-400">
            Prepara il tuo corpo per il test di valutazione
          </p>
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            <strong>Importante:</strong> Un riscaldamento adeguato riduce il rischio di infortuni e migliora le tue performance nel test. Non saltarlo!
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Esercizio {currentExercise + 1} di {totalExercises}</span>
            <span>{Math.round(progress)}% completato</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current exercise card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-700 overflow-hidden mb-6"
          >
            {/* Exercise header */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{exercise.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
                  <p className="text-emerald-400 text-sm">{exercise.targetArea}</p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="p-8 text-center">
              <div className="text-7xl font-bold text-white mb-4 font-mono">
                {formatTime(timeLeft)}
              </div>
              <p className="text-slate-300 text-lg mb-8">{exercise.description}</p>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <button
                  onClick={handleSkipExercise}
                  className="w-16 h-16 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center transition"
                >
                  <SkipForward className="w-8 h-8 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Exercise list preview */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Prossimi esercizi:</h3>
          <div className="space-y-2">
            {WARMUP_EXERCISES.slice(currentExercise + 1, currentExercise + 4).map((ex, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="text-lg">{ex.icon}</span>
                <span>{ex.name}</span>
                <span className="text-slate-500 ml-auto">{ex.duration}s</span>
              </div>
            ))}
            {currentExercise + 4 < totalExercises && (
              <div className="text-slate-500 text-sm">
                ...e altri {totalExercises - currentExercise - 4} esercizi
              </div>
            )}
          </div>
        </div>

        {/* Skip button */}
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-slate-300 text-sm underline transition"
          >
            Salta il riscaldamento (non consigliato)
          </button>
        </div>
      </div>
    </div>
  );
}
