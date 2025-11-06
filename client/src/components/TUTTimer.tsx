import { useState, useEffect, useRef } from 'react';

interface TUTTimerProps {
  tempo: {
    eccentric: number;
    pause: number;
    concentric: number;
  };
  currentRep: number;
  totalReps: number;
  onRepComplete?: () => void;
}

type Phase = 'eccentric' | 'pause' | 'concentric';

const PHASE_CONFIG = {
  eccentric: {
    label: 'Eccentrica (giù)',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    emoji: '🔴',
    instruction: 'Scendi lentamente'
  },
  pause: {
    label: 'Pausa',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    emoji: '🟡',
    instruction: 'Mantieni la posizione'
  },
  concentric: {
    label: 'Concentrica (su)',
    color: 'bg-green-500',
    textColor: 'text-green-400',
    emoji: '🟢',
    instruction: 'Sali controllato'
  }
};

export default function TUTTimer({ tempo, currentRep, totalReps, onRepComplete }: TUTTimerProps) {
  const [phase, setPhase] = useState<Phase>('eccentric');
  const [timeLeft, setTimeLeft] = useState(tempo.eccentric);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Phase complete - move to next
          advancePhase();
          return tempo[getNextPhase()];
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, tempo]);

  const getNextPhase = (): Phase => {
    if (phase === 'eccentric') return 'pause';
    if (phase === 'pause') return 'concentric';
    return 'eccentric'; // Loop back for next rep
  };

  const advancePhase = () => {
    playBeep();
    
    if (phase === 'concentric') {
      // Rep completed
      if (onRepComplete) onRepComplete();
      setPhase('eccentric');
    } else {
      setPhase(getNextPhase());
    }
  };

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio not supported or blocked
      console.log('Audio beep not available');
    }
  };

  const skipPhase = () => {
    advancePhase();
    setTimeLeft(tempo[getNextPhase()]);
  };

  const currentPhaseConfig = PHASE_CONFIG[phase];
  const currentPhaseDuration = tempo[phase];
  const progress = ((currentPhaseDuration - timeLeft) / currentPhaseDuration) * 100;

  return (
    <div className="bg-gray-800/50 border-2 border-emerald-500/50 rounded-xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-white text-xl font-bold mb-2">
          Rep {currentRep} / {totalReps}
        </div>
        <div className={`text-2xl font-bold ${currentPhaseConfig.textColor} mb-1`}>
          {currentPhaseConfig.emoji}
          {currentPhaseConfig.label}
        </div>
        <div className="text-gray-400 text-sm">
          {currentPhaseConfig.instruction}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-8xl font-bold text-white mb-2">
          {timeLeft}
        </div>
        <div className="text-gray-400">secondi</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 ${currentPhaseConfig.color} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0s</span>
          <span>{currentPhaseDuration}s</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
        >
          {isRunning ? '⏸️ Pausa' : '▶️ Riprendi'}
        </button>
        <button
          onClick={skipPhase}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
        >
          ⏭️ Skip Fase
        </button>
      </div>

      {/* Next Phase Preview */}
      <div className="text-center text-sm text-gray-400">
        <div>
          {phase === 'eccentric' && (
            <>Prossima fase: {PHASE_CONFIG.pause.emoji} Pausa ({tempo.pause}s)</>
          )}
          {phase === 'pause' && (
            <>Prossima fase: {PHASE_CONFIG.concentric.emoji} Concentrica ({tempo.concentric}s)</>
          )}
          {phase === 'concentric' && currentRep < totalReps && (
            <>Prossima rep: {PHASE_CONFIG.eccentric.emoji} Eccentrica ({tempo.eccentric}s)</>
          )}
          {phase === 'concentric' && currentRep === totalReps && (
            <>🎉 Ultima rep!</>
          )}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="flex justify-center gap-6 mt-6">
        {(['eccentric', 'pause', 'concentric'] as Phase[]).map((p) => (
          <div key={p} className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${phase === p ? PHASE_CONFIG[p].color : 'bg-slate-600'}`} />
            <div className={`text-xs mt-1 ${phase === p ? PHASE_CONFIG[p].textColor : 'text-slate-600'}`}>
              {tempo[p]}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
