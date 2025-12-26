/**
 * Weekly Split View Component
 * Visualizza il programma split settimana per giorno
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklySplit, DayWorkout, Exercise } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Target, Zap, Activity, Info, ChevronDown, ImageIcon } from 'lucide-react';
import { getExerciseDescription } from '../utils/exerciseDescriptions';
import { getExerciseImageWithFallback, isStaticExercise } from '@trainsmart/shared';

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

// ✅ React.memo: Prevent re-render of individual day cards
const DayCard = React.memo(function DayCard({ day, index, showDetails }: DayCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);

  // Filtra esercizi validi e separa principali da correttivi
  const validExercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  const mainExercises = validExercises.filter(ex => ex.pattern !== 'corrective');
  const correctiveExercises = validExercises.filter(ex => ex.pattern === 'corrective');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold">{day.dayNumber}</span>
              </div>
              <div>
                <CardTitle className="text-white text-lg">{day.dayName}</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  <Target className="inline w-4 h-4 mr-1" />
                  {day.focus}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="text-sm">{mainExercises.length} esercizi</span>
              <Zap className="w-5 h-5" />
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Esercizi principali */}
              {mainExercises.map((exercise, exIndex) => (
                <ExerciseRow key={exIndex} exercise={exercise} index={exIndex} />
              ))}

              {/* Esercizi correttivi (se presenti) */}
              {correctiveExercises.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                    Esercizi Correttivi
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
  const [imageError, setImageError] = React.useState(false);
  const exerciseInfo = getExerciseDescription(exercise.name);

  // Get exercise image if it's a static exercise
  const exerciseImage = isStaticExercise(exercise.name)
    ? getExerciseImageWithFallback(exercise.name)
    : null;

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

  const patternColor = patternColors[exercise.pattern] || 'bg-gray-600';

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
          {/* Top row: Image + Name + Pattern */}
          <div className="flex items-center gap-3">
            {/* Exercise Image */}
            {exerciseImage && !imageError ? (
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-gray-600">
                <img
                  src={exerciseImage}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            ) : exerciseImage && imageError ? (
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-600 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            ) : null}

            {/* Exercise Name + Pattern */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium text-sm md:text-base truncate max-w-[180px] md:max-w-none">
                  {exercise.name}
                </p>
                <div className={`${patternColor} rounded px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-white uppercase tracking-wider`}>
                  {exercise.pattern.replace('_', ' ')}
                </div>
              </div>
              {exercise.notes && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{exercise.notes}</p>
              )}
            </div>

            {/* Expand indicator */}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                showDescription ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Volume Info - Grid on mobile, flex on desktop */}
          <div className="grid grid-cols-4 md:flex md:items-center gap-2 md:gap-3 text-center bg-gray-800/50 rounded-lg p-2 md:p-0 md:bg-transparent">
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs">Sets</p>
              <p className="text-white font-bold text-sm md:text-base">{exercise.sets}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs">Reps</p>
              <p className="text-white font-bold text-sm md:text-base">{exercise.reps}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs">Rest</p>
              <p className="text-white font-bold text-sm md:text-base">{exercise.rest}</p>
            </div>
            {exercise.weight ? (
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs">Peso</p>
                <p className="text-amber-400 font-bold text-sm md:text-base">{exercise.weight}</p>
              </div>
            ) : exercise.intensity ? (
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs">Int.</p>
                <p className="text-blue-400 font-bold text-sm md:text-base">{exercise.intensity}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-[10px] md:text-xs">RIR</p>
                <p className="text-green-400 font-bold text-sm md:text-base">2-3</p>
              </div>
            )}
          </div>

          {/* Desktop only: Baseline + Replaced indicator */}
          <div className="hidden md:flex items-center gap-2">
            {exercise.baseline && (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Base: {exercise.baseline.maxReps}r</span>
              </div>
            )}
            {exercise.wasReplaced && (
              <div className="bg-yellow-600 rounded px-2 py-1 text-xs font-medium text-white">
                Sost.
              </div>
            )}
          </div>
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

                {/* Mobile only: Show baseline if present */}
                {exercise.baseline && (
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>Baseline: {exercise.baseline.maxReps} reps</span>
                    </div>
                  </div>
                )}

                {/* Mobile only: Show replaced indicator if present */}
                {exercise.wasReplaced && (
                  <div className="md:hidden mt-2">
                    <span className="bg-yellow-600 rounded px-2 py-1 text-xs font-medium text-white">
                      Esercizio sostituito per adattamento
                    </span>
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
 * Compact version - mostra solo nomi giorni + numero esercizi
 */
export function WeeklySplitCompact({ weeklySplit }: { weeklySplit: WeeklySplit }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {weeklySplit.days.map((day, index) => {
        const validExercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
        const mainExercises = validExercises.filter(ex => ex.pattern !== 'corrective');
        return (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-3 border border-gray-600"
          >
            <p className="text-white font-medium text-sm mb-1">
              Giorno {day.dayNumber}
            </p>
            <p className="text-gray-400 text-xs">
              {mainExercises.length} esercizi
            </p>
          </div>
        );
      })}
    </div>
  );
}
