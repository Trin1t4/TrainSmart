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
import { getExerciseImageWithFallback, isStaticExercise } from '@fitnessflow/shared';

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
  const [showDescription, setShowDescription] = React.useState(true); // ✅ Always show description by default
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
    horizontal_pull: 'bg-cyan-600', // Row pattern
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
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Exercise Image (for static exercises) */}
        {exerciseImage && !imageError ? (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-600">
            <img
              src={exerciseImage}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        ) : exerciseImage && imageError ? (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        ) : null}

        {/* Pattern Badge */}
        <div className={`${patternColor} rounded px-2 py-1 text-xs font-medium text-white uppercase tracking-wider min-w-[100px] text-center`}>
          {exercise.pattern.replace('_', ' ')}
        </div>

        {/* Exercise Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{exercise.name}</p>
            {exerciseInfo && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Mostra spiegazione"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
          {exercise.notes && (
            <p className="text-xs text-gray-400 mt-1">{exercise.notes}</p>
          )}
        </div>

        {/* Volume Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Sets</p>
            <p className="text-white font-bold">{exercise.sets}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Reps</p>
            <p className="text-white font-bold">{exercise.reps}</p>
          </div>
          {exercise.weight && (
            <div className="text-center">
              <p className="text-gray-400 text-xs">Peso</p>
              <p className="text-amber-400 font-bold">{exercise.weight}</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-gray-400 text-xs">Rest</p>
            <p className="text-white font-bold">{exercise.rest}</p>
          </div>
          {exercise.intensity && (
            <div className="text-center">
              <p className="text-gray-400 text-xs">Intensità</p>
              <p className="text-blue-400 font-bold">{exercise.intensity}</p>
            </div>
          )}
        </div>

        {/* Baseline indicator - larghezza fissa per allineamento */}
        <div className="min-w-[120px] text-right">
          {exercise.baseline ? (
            <div className="text-xs text-green-400 flex items-center justify-end gap-1">
              <Activity className="w-3 h-3" />
              <span>Baseline: {exercise.baseline.maxReps}r</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              No baseline
            </div>
          )}
        </div>

        {/* Replaced indicator */}
        {exercise.wasReplaced && (
          <div className="bg-yellow-600 rounded px-2 py-1 text-xs font-medium text-white">
            Sostituito
          </div>
        )}
      </div>

      {/* Description Panel */}
      <AnimatePresence>
        {showDescription && exerciseInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-gray-600 mt-0">
              <div className="bg-gray-800 rounded-lg p-3 mt-3">
                {/* Description */}
                {exerciseInfo.description && (
                  <p className="text-sm text-gray-300 mb-3">
                    {exerciseInfo.description}
                  </p>
                )}

                {/* Technique Cues */}
                {exerciseInfo.technique && exerciseInfo.technique.length > 0 && (
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
