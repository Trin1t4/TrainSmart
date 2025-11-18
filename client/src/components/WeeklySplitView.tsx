/**
 * Weekly Split View Component
 * Visualizza il programma split settimana per giorno
 */

import React from 'react';
import { motion } from 'framer-motion';
import { WeeklySplit, DayWorkout, Exercise } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Target, Zap, Activity } from 'lucide-react';

interface WeeklySplitViewProps {
  weeklySplit: WeeklySplit;
  showDetails?: boolean;
}

export default function WeeklySplitView({ weeklySplit, showDetails = true }: WeeklySplitViewProps) {
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
}

interface DayCardProps {
  day: DayWorkout;
  index: number;
  showDetails: boolean;
}

function DayCard({ day, index, showDetails }: DayCardProps) {
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
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">{mainExercises.length} esercizi</span>
              <Zap className="w-5 h-5" />
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
}

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  isCorrective?: boolean;
}

function ExerciseRow({ exercise, index, isCorrective = false }: ExerciseRowProps) {
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
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isCorrective ? 'bg-gray-700/50' : 'bg-gray-700'
      }`}
    >
      {/* Pattern Badge */}
      <div className={`${patternColor} rounded px-2 py-1 text-xs font-medium text-white uppercase tracking-wider min-w-[100px] text-center`}>
        {exercise.pattern.replace('_', ' ')}
      </div>

      {/* Exercise Info */}
      <div className="flex-1">
        <p className="text-white font-medium">{exercise.name}</p>
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
