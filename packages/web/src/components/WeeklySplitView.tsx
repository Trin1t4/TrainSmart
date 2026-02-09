/**
 * Weekly Split View Component
 * Visualizza il programma split settimana per giorno
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklySplit, DayWorkout, Exercise } from '../types';
import { RunningSession, RunningInterval } from '@trainsmart/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Target, Zap, Activity, Info, ChevronDown, ImageIcon, Flame, Timer, Heart, Footprints, Moon, Dumbbell } from 'lucide-react';
import { getExerciseDescription } from '../utils/exerciseDescriptions';
import { getExerciseImageWithFallback, isStaticExercise } from '@trainsmart/shared';
import { getExerciseVideoUrl } from '../utils/exerciseVideos';

interface WeeklySplitViewProps {
  weeklySplit: WeeklySplit;
  showDetails?: boolean;
}

// ✅ React.memo: Prevents re-render when props haven't changed
const WeeklySplitView = React.memo(function WeeklySplitView({ weeklySplit, showDetails = true }: WeeklySplitViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Split */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">{weeklySplit.splitName}</h2>
        <p className="text-blue-100">{weeklySplit.description}</p>
      </motion.div>

      {/* Giorni di allenamento */}
      <div className="grid grid-cols-1 gap-4">
        {weeklySplit.days.map((day, index) => (
          <DayCard key={index} day={day} index={index} showDetails={showDetails} />
        ))}
      </div>
    </div>
  );
});

export default WeeklySplitView;

interface DayCardProps {
  day: DayWorkout;
  index: number;
  showDetails: boolean;
}

// Color schemes per tipo giornata
const dayTypeStyles = {
  strength: {
    badge: 'bg-blue-600',
    border: 'hover:border-blue-500',
    icon: Dumbbell,
    label: 'Forza',
  },
  running: {
    badge: 'bg-green-600',
    border: 'hover:border-green-500',
    icon: Footprints,
    label: 'Corsa',
  },
  mixed: {
    badge: 'bg-teal-600',
    border: 'hover:border-teal-500',
    icon: Zap,
    label: 'Misto',
  },
  rest: {
    badge: 'bg-gray-600',
    border: 'hover:border-gray-500',
    icon: Moon,
    label: 'Riposo',
  },
};

// ✅ React.memo: Prevent re-render of individual day cards
const DayCard = React.memo(function DayCard({ day, index, showDetails }: DayCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);

  // Determina tipo giornata
  const dayType = day.type || 'strength';
  const style = dayTypeStyles[dayType];
  const DayIcon = style.icon;

  // Filtra esercizi validi e separa principali da correttivi
  const validExercises = day.exercises?.filter(ex => ex && ex.name && ex.pattern) || [];
  const mainExercises = validExercises.filter(ex => ex.pattern !== 'corrective');
  const correctiveExercises = validExercises.filter(ex => ex.pattern === 'corrective');

  // Calcola info riassuntiva
  const hasStrength = mainExercises.length > 0;
  const hasRunning = !!day.runningSession;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-gray-800 border-gray-700 ${style.border} transition-all`}>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${style.badge} rounded-full w-10 h-10 flex items-center justify-center`}>
                <span className="text-white font-bold">{day.dayNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg">{day.dayName}</CardTitle>
                  {dayType !== 'strength' && (
                    <span className={`${style.badge} text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-medium`}>
                      {style.label}
                    </span>
                  )}
                </div>
                <CardDescription className="text-gray-400 text-sm">
                  <Target className="inline w-4 h-4 mr-1" />
                  {day.focus}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              {hasStrength && <span className="text-sm">{mainExercises.length} esercizi</span>}
              {hasRunning && (
                <span className="text-sm text-green-400">
                  <Footprints className="inline w-4 h-4 mr-1" />
                  {day.runningSession!.totalDuration} min
                </span>
              )}
              <DayIcon className="w-5 h-5" />
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Sessione Running (se presente) */}
              {day.runningSession && (
                <RunningSessionRow session={day.runningSession} />
              )}

              {/* Esercizi correttivi/attivazione (se presenti) - PRIMA degli esercizi principali */}
              {correctiveExercises.length > 0 && (
                <div className="mb-3 pb-3 border-b border-gray-700">
                  <p className="text-xs text-amber-400/80 mb-2 uppercase tracking-wider">
                    Attivazione & Mobilità
                  </p>
                  {correctiveExercises.map((exercise, exIndex) => (
                    <ExerciseRow
                      key={`corrective-${exIndex}`}
                      exercise={exercise}
                      index={exIndex}
                      isCorrective
                    />
                  ))}
                </div>
              )}

              {/* Separatore se ci sono sia running che esercizi */}
              {hasRunning && hasStrength && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 border-t border-gray-700"></div>
                  <span className="text-xs text-gray-500 uppercase">Forza</span>
                  <div className="flex-1 border-t border-gray-700"></div>
                </div>
              )}

              {/* Esercizi principali */}
              {mainExercises.map((exercise, exIndex) => (
                <ExerciseRow key={exIndex} exercise={exercise} index={exIndex} />
              ))}

              {/* Messaggio riposo */}
              {dayType === 'rest' && !hasStrength && !hasRunning && (
                <div className="text-center py-6 text-gray-400">
                  <Moon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-sm">Giornata di riposo</p>
                  <p className="text-xs text-gray-500 mt-1">Recupero attivo consigliato</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
});

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  isCorrective?: boolean;
}

function ExerciseRow({ exercise, index, isCorrective = false }: ExerciseRowProps) {
  const [showDescription, setShowDescription] = React.useState(false); // Collapsed by default for mobile
  const [mediaError, setMediaError] = React.useState(false);
  const exerciseInfo = getExerciseDescription(exercise.name);

  // Video per tutti gli esercizi dinamici, immagine solo per statici come fallback
  const exerciseVideo = getExerciseVideoUrl(exercise.name);
  const exerciseImageFallback = getExerciseImageWithFallback(exercise.name);

  const patternColors: Record<string, string> = {
    lower_push: 'bg-green-600',
    lower_pull: 'bg-yellow-600',
    horizontal_push: 'bg-blue-600',
    horizontal_pull: 'bg-cyan-600',
    vertical_push: 'bg-purple-600',
    vertical_pull: 'bg-pink-600',
    core: 'bg-orange-600',
    corrective: 'bg-gray-600'
  };

  // Traduzioni pattern in italiano
  const patternLabels: Record<string, string> = {
    lower_push: 'gambe',
    lower_pull: 'femorali',
    horizontal_push: 'petto',
    horizontal_pull: 'dorsali',
    vertical_push: 'spalle',
    vertical_pull: 'dorsali',
    core: 'core',
    corrective: 'correttivo'
  };

  const patternColor = patternColors[exercise.pattern] || 'bg-gray-600';
  const patternLabel = patternLabels[exercise.pattern] || exercise.pattern.replace('_', ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-lg ${isCorrective ? 'bg-gray-700/50' : 'bg-gray-700'}`}
    >
      {/* Main Content - Clickable to expand */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => setShowDescription(!showDescription)}
      >
        {/* Mobile: Stack layout | Desktop: Row layout */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
          {/* Top row: Video/Image + Name + Pattern */}
          <div className="flex items-center gap-3">
            {/* Exercise Video/Image Media */}
            <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-gray-600">
              {!mediaError && exerciseVideo ? (
                // VIDEO per tutti gli esercizi
                <video
                  src={exerciseVideo}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                  onError={() => setMediaError(true)}
                />
              ) : !mediaError && exerciseImageFallback ? (
                // IMMAGINE fallback
                <img
                  src={exerciseImageFallback}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={() => setMediaError(true)}
                  loading="lazy"
                />
              ) : (
                // FALLBACK emoji
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-700">
                  🏋️
                </div>
              )}
            </div>

            {/* Exercise Name + Pattern */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium text-sm md:text-base truncate max-w-[180px] md:max-w-none">
                  {exercise.name}
                </p>
                <div className={`${patternColor} rounded px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-white uppercase tracking-wider`}>
                  {patternLabel}
                </div>
              </div>
              {/* Warmup indicator */}
              {exercise.warmup && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] md:text-xs text-orange-300">
                    {exercise.warmup.ramp ? (
                      // Rampa forza: mostra schema rampa con pesi calcolati
                      (() => {
                        const mainWeight = exercise.weight ? parseFloat(String(exercise.weight).replace('kg', '')) : 0;
                        return `Rampa: ${exercise.warmup.ramp.map(r => {
                          const warmupWeight = mainWeight > 0 ? Math.round(mainWeight * (r.percentage / 100) * 2) / 2 : 0;
                          return warmupWeight > 0 ? `${r.reps}r@${warmupWeight}kg` : `${r.reps}r@${r.percentage}%`;
                        }).join(' → ')}`;
                      })()
                    ) : (
                      // Standard warmup con peso calcolato
                      (() => {
                        const mainWeight = exercise.weight ? parseFloat(String(exercise.weight).replace('kg', '')) : 0;
                        const warmupWeight = mainWeight > 0 && exercise.warmup.percentage
                          ? Math.round(mainWeight * (exercise.warmup.percentage / 100) * 2) / 2
                          : 0;
                        return warmupWeight > 0
                          ? `Riscaldamento: ${exercise.warmup.sets}×${exercise.warmup.reps} @ ${warmupWeight}kg`
                          : `Riscaldamento: ${exercise.warmup.sets}×${exercise.warmup.reps} @ ${exercise.warmup.percentage || exercise.warmup.intensity}%`;
                      })()
                    )}
                  </span>
                </div>
              )}
              {/* Clean notes: filter out redundant info already shown elsewhere */}
              {exercise.notes && (() => {
                // Filter out info that's already displayed (carico, baseline, pattern)
                const cleanNotes = exercise.notes
                  .split(' | ')
                  .filter(note =>
                    !note.includes('Carico:') &&
                    !note.includes('💪 Carico') &&
                    !note.includes('Baseline:') &&
                    !note.toLowerCase().includes('pattern') &&
                    !note.includes('stimato da')
                  )
                  .join(' | ');
                return cleanNotes ? (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cleanNotes}</p>
                ) : null;
              })()}
            </div>

            {/* Expand indicator */}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                showDescription ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Volume Info - Grid on mobile */}
          <div className="grid grid-cols-4 gap-1.5 text-center bg-gray-800/50 rounded-lg p-2">
            <div>
              <p className="text-gray-500 text-[10px]">Sets</p>
              <p className="text-white font-bold text-sm">{exercise.sets}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px]">Reps</p>
              <p className="text-white font-bold text-sm">{exercise.reps}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px]">Rest</p>
              <p className="text-white font-bold text-sm">{exercise.rest}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px]">
                {exercise.weight ? 'Peso' : 'RIR'}
              </p>
              <p className={`font-bold text-sm ${exercise.weight ? 'text-amber-400' : 'text-green-400'}`}>
                {exercise.weight || (() => {
                  // Extract RIR from notes if present
                  const rirMatch = exercise.notes?.match(/RIR\s*(\d)/i);
                  return rirMatch ? rirMatch[1] : '2';
                })()}
              </p>
            </div>
          </div>

          {/* Baseline indicator - visible on mobile too */}
          {(exercise.baseline || exercise.wasReplaced) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {exercise.baseline && (
                <div className="text-[10px] text-green-400 flex items-center gap-1 bg-green-400/10 px-1.5 py-0.5 rounded">
                  <Activity className="w-3 h-3" />
                  <span>Riferimento: {exercise.baseline.maxReps} reps</span>
                </div>
              )}
              {exercise.wasReplaced && (
                <div className="bg-yellow-600/20 text-yellow-400 rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Sostituito
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description Panel - Expandable with max-height for mobile */}
      <AnimatePresence>
        {showDescription && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gray-600 max-h-[50vh] overflow-y-auto">
              <div className="bg-gray-800 rounded-lg p-3 mt-3">
                {/* Description */}
                {exerciseInfo?.description && (
                  <p className="text-sm text-gray-300 mb-3">
                    {exerciseInfo.description}
                  </p>
                )}

                {/* Technique Cues */}
                {exerciseInfo?.technique && exerciseInfo.technique.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-400 font-medium mb-2 uppercase tracking-wider">
                      Tecnica
                    </p>
                    <ul className="space-y-1">
                      {exerciseInfo.technique.map((cue, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DCSS Note - Variabilità individuale */}
                {exerciseInfo?.dcssNote && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-amber-400/80 italic">
                      {exerciseInfo.dcssNote}
                    </p>
                  </div>
                )}

                {/* Common Variations - Variazioni antropometriche */}
                {exerciseInfo?.commonVariations && exerciseInfo.commonVariations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wider">
                      Variazioni comuni
                    </p>
                    <ul className="space-y-1">
                      {exerciseInfo.commonVariations.map((variation, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional exercise info in expanded panel */}
                {exercise.intensity && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      <span className="text-blue-400">Intensità:</span> {exercise.intensity}
                    </p>
                  </div>
                )}

                {/* No description available */}
                {!exerciseInfo && (
                  <p className="text-sm text-gray-500 italic">
                    Descrizione non disponibile per questo esercizio.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Running Session Row - visualizza dettagli sessione running
 */
interface RunningSessionRowProps {
  session: RunningSession;
}

function RunningSessionRow({ session }: RunningSessionRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Traduzioni tipo sessione
  const sessionTypeLabels: Record<string, string> = {
    continuous: 'Continuo',
    intervals: 'Intervalli',
    fartlek: 'Fartlek',
    tempo: 'Tempo Run',
    long_run: 'Lungo',
  };

  // Traduzioni intensità
  const intensityLabels: Record<string, string> = {
    walk: 'Camminata',
    easy: 'Facile',
    zone2: 'Zona 2',
    tempo: 'Tempo',
    interval: 'Intervallo',
  };

  // Colori per intensità
  const intensityColors: Record<string, string> = {
    walk: 'bg-gray-600 text-gray-200',
    easy: 'bg-green-600/80 text-green-100',
    zone2: 'bg-green-600 text-white',
    tempo: 'bg-yellow-600 text-yellow-100',
    interval: 'bg-red-600 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-900/30 rounded-lg border border-green-700/50"
    >
      {/* Header */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 rounded-lg p-2">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{session.name}</p>
              <p className="text-green-300 text-xs">
                {sessionTypeLabels[session.type] || session.type} • RPE {session.rpe}/10
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-green-400 font-bold">{session.totalDuration} min</p>
              <p className="text-green-300 text-xs flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {session.targetHRZone.replace('zone', 'Z')}
              </p>
            </div>
            <ChevronDown className={`w-5 h-5 text-green-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Dettagli espansi */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-green-700/50">
              {/* Timeline degli intervalli */}
              <div className="mt-3 space-y-2">
                {/* Warmup */}
                {session.warmup && (
                  <IntervalPill interval={session.warmup} label="Riscaldamento" />
                )}

                {/* Main Set */}
                <div className="space-y-1.5">
                  {session.mainSet.map((interval, idx) => (
                    <IntervalPill key={idx} interval={interval} />
                  ))}
                </div>

                {/* Cooldown */}
                {session.cooldown && (
                  <IntervalPill interval={session.cooldown} label="Defaticamento" />
                )}
              </div>

              {/* Note */}
              {session.notes && (
                <div className="mt-3 pt-3 border-t border-green-700/30">
                  <p className="text-xs text-green-300/80">{session.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Pill per singolo intervallo running
 */
function IntervalPill({ interval, label }: { interval: RunningInterval; label?: string }) {
  const intensityLabels: Record<string, string> = {
    walk: 'Camminata',
    easy: 'Facile',
    zone2: 'Zona 2',
    tempo: 'Tempo',
    interval: 'Intervallo',
  };

  const intensityColors: Record<string, string> = {
    walk: 'bg-gray-600/50 border-gray-500',
    easy: 'bg-green-600/30 border-green-500/50',
    zone2: 'bg-green-600/50 border-green-500',
    tempo: 'bg-yellow-600/30 border-yellow-500/50',
    interval: 'bg-red-600/30 border-red-500/50',
  };

  const bgColor = intensityColors[interval.type] || 'bg-gray-600/50 border-gray-500';

  return (
    <div className={`flex items-center justify-between ${bgColor} border rounded-lg px-3 py-2`}>
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-green-300" />
        <span className="text-white text-sm font-medium">
          {label || intensityLabels[interval.type] || interval.type}
        </span>
        {interval.pace && (
          <span className="text-green-300 text-xs">@ {interval.pace}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-bold text-sm">{interval.duration} min</span>
        {interval.hrZone && (
          <span className="text-xs text-green-300/80 bg-green-800/50 px-1.5 py-0.5 rounded">
            {interval.hrZone.replace('zone', 'Z')}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version - mostra solo nomi giorni + numero esercizi
 */
export function WeeklySplitCompact({ weeklySplit }: { weeklySplit: WeeklySplit }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {weeklySplit.days.map((day, index) => {
        const validExercises = day.exercises?.filter(ex => ex && ex.name && ex.pattern) || [];
        const mainExercises = validExercises.filter(ex => ex.pattern !== 'corrective');
        const dayType = day.type || 'strength';
        const style = dayTypeStyles[dayType];
        const hasRunning = !!day.runningSession;

        return (
          <div
            key={index}
            className={`bg-gray-700 rounded-lg p-3 border ${
              dayType === 'running' ? 'border-green-600/50' :
              dayType === 'mixed' ? 'border-teal-600/50' :
              dayType === 'rest' ? 'border-gray-500' :
              'border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-medium text-sm">
                Giorno {day.dayNumber}
              </p>
              {dayType !== 'strength' && (
                <span className={`${style.badge} text-white text-[8px] px-1 py-0.5 rounded uppercase`}>
                  {style.label}
                </span>
              )}
            </div>
            <div className="text-xs space-y-0.5">
              {mainExercises.length > 0 && (
                <p className="text-gray-400">
                  {mainExercises.length} esercizi
                </p>
              )}
              {hasRunning && (
                <p className="text-green-400">
                  <Footprints className="inline w-3 h-3 mr-1" />
                  {day.runningSession!.totalDuration} min
                </p>
              )}
              {dayType === 'rest' && mainExercises.length === 0 && !hasRunning && (
                <p className="text-gray-500">Riposo</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
