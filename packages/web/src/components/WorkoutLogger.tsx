/**
 * WORKOUT LOGGER COMPONENT
 *
 * Modal/Page per logging post-workout con RPE tracking.
 * Permette all'utente di registrare:
 * - Sets/reps completati per ogni esercizio
 * - RPE per ogni esercizio (1-10 scale)
 * - Note, mood, sleep quality
 *
 * Trigger auto-regulation dopo 2+ sessioni se RPE fuori range
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Video } from 'lucide-react';
import autoRegulationService, { ExerciseLog } from '../lib/autoRegulationService';
import { toast } from 'sonner';
import { useTranslation } from '../lib/i18n';
import VideoUploadModal from './VideoUploadModal';
import { isExerciseSupportedInternally } from '../lib/videoCorrectionEngine';

interface Exercise {
  name: string;
  pattern: string;
  sets: number;
  reps: number | string;
  rest: string;
  intensity: string;
}

interface WorkoutLoggerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  programId: string;
  dayName: string;
  splitType: string;
  exercises: Exercise[];
  onWorkoutLogged?: () => void;
}

export default function WorkoutLogger({
  open,
  onClose,
  userId,
  programId,
  dayName,
  splitType,
  exercises,
  onWorkoutLogged
}: WorkoutLoggerProps) {
  const { t } = useTranslation();

  // State per ogni esercizio
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, {
    sets_completed: number;
    reps_completed: number;
    weight_used?: number;
    exercise_rpe: number;
    difficulty_vs_baseline: 'easier' | 'as_expected' | 'harder';
    notes: string;
  }>>({});

  // State globale workout
  const [mood, setMood] = useState<string>('normal');
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // State video correction modal
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Inizializza logs con valori default
  useEffect(() => {
    if (open && exercises.length > 0) {
      const initialLogs: typeof exerciseLogs = {};
      exercises.forEach(ex => {
        initialLogs[ex.name] = {
          sets_completed: ex.sets,
          reps_completed: typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps.split('-')[0]),
          exercise_rpe: 7, // Default RPE medio
          difficulty_vs_baseline: 'as_expected',
          notes: ''
        };
      });
      setExerciseLogs(initialLogs);
    }
  }, [open, exercises]);

  // Calcola RPE medio sessione
  const calculateSessionRPE = (): number => {
    const rpeValues = Object.values(exerciseLogs).map(log => log.exercise_rpe);
    if (rpeValues.length === 0) return 7;
    return Math.round((rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length) * 10) / 10;
  };

  // Update log per singolo esercizio
  const updateExerciseLog = (exerciseName: string, field: string, value: any) => {
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: value
      }
    }));
  };

  // Salva workout
  const handleSaveWorkout = async () => {
    setLoading(true);

    try {
      console.log('[WorkoutLogger] Inizio salvataggio workout...');

      // 1. Crea workout log
      const { data: workoutLog, error: workoutError } = await autoRegulationService.createWorkoutLog(
        userId,
        programId,
        dayName,
        splitType
      );

      if (workoutError || !workoutLog) {
        throw new Error('Errore creazione workout log');
      }

      console.log('[WorkoutLogger] Workout log creato:', workoutLog.id);

      // 2. Aggiungi exercise logs
      for (const exercise of exercises) {
        const log = exerciseLogs[exercise.name];
        if (!log) continue;

        const { error: exerciseError } = await autoRegulationService.addExerciseLog(
          workoutLog.id,
          {
            exercise_name: exercise.name,
            pattern: exercise.pattern,
            sets_completed: log.sets_completed,
            reps_completed: log.reps_completed,
            weight_used: log.weight_used,
            exercise_rpe: log.exercise_rpe,
            difficulty_vs_baseline: log.difficulty_vs_baseline,
            notes: log.notes
          }
        );

        if (exerciseError) {
          console.error('[WorkoutLogger] Errore log esercizio:', exercise.name, exerciseError);
        } else {
          console.log('[WorkoutLogger] Exercise log salvato:', exercise.name, 'RPE:', log.exercise_rpe);
        }
      }

      // 3. Completa workout
      const { error: completeError } = await autoRegulationService.completeWorkout(
        workoutLog.id,
        exercises.length,
        workoutNotes,
        mood,
        sleepQuality
      );

      if (completeError) {
        throw new Error('Errore completamento workout');
      }

      console.log('[WorkoutLogger] ✅ Workout completato');

      // 4. TRIGGER AUTO-REGULATION
      console.log('[WorkoutLogger] 🤖 Trigger auto-regulation...');
      const { data: adjustment, error: autoRegError } = await autoRegulationService.applyAutoRegulation(
        userId,
        programId
      );

      if (autoRegError) {
        console.warn('[WorkoutLogger] Warning auto-regulation:', autoRegError);
      } else if (adjustment) {
        // Auto-adjustment applicato!
        const changePercent = adjustment.volume_change_percent;
        const direction = changePercent > 0 ? 'aumentato' : 'ridotto';

        toast.success(`🤖 Auto-Regulation Attivato!`, {
          description: `Volume ${direction} del ${Math.abs(changePercent)}% in base al tuo RPE medio (${adjustment.avg_rpe_before}/10). ${adjustment.exercises_affected.length} esercizi modificati.`,
          duration: 6000
        });

        console.log('[WorkoutLogger] ✅ Auto-regulation applicato:', adjustment);
      } else {
        console.log('[WorkoutLogger] ✅ RPE nel range ottimale, nessun adjustment necessario');
      }

      // 5. Success toast
      const sessionRPE = calculateSessionRPE();
      toast.success('Workout salvato!', {
        description: `RPE medio sessione: ${sessionRPE}/10. Ottimo lavoro! 💪`
      });

      // 6. Callback e chiudi
      if (onWorkoutLogged) {
        onWorkoutLogged();
      }

      onClose();
    } catch (error: any) {
      console.error('[WorkoutLogger] Errore salvataggio workout:', error);
      toast.error('Errore salvataggio workout', {
        description: error.message || 'Riprova più tardi'
      });
    } finally {
      setLoading(false);
    }
  };

  // RPE Color helper
  const getRPEColor = (rpe: number): string => {
    if (rpe <= 5) return 'text-green-600';
    if (rpe <= 7) return 'text-yellow-600';
    if (rpe <= 8.5) return 'text-orange-600';
    return 'text-red-600';
  };

  // RPE Label helper
  const getRPELabel = (rpe: number): string => {
    if (rpe <= 5) return 'Facile';
    if (rpe <= 6.5) return 'Moderato';
    if (rpe <= 8) return 'Impegnativo';
    if (rpe <= 9) return 'Molto duro';
    return 'Massimale';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {t('workoutLogger.title')} - {dayName}
          </DialogTitle>
          <DialogDescription>
            {t('workoutLogger.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('workoutLogger.split')}</p>
                <p className="font-medium">{splitType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('workoutLogger.sessionRPE')}</p>
                <p className={`text-2xl font-bold ${getRPEColor(calculateSessionRPE())}`}>
                  {calculateSessionRPE()}/10
                </p>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('workoutLogger.exercises')}</h3>

            {exercises.map((exercise, idx) => {
              const log = exerciseLogs[exercise.name] || {
                sets_completed: exercise.sets,
                reps_completed: typeof exercise.reps === 'number' ? exercise.reps : 10,
                exercise_rpe: 7,
                difficulty_vs_baseline: 'as_expected' as const,
                notes: ''
              };

              return (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  {/* Exercise Name */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <Badge variant="outline">{exercise.pattern}</Badge>
                  </div>

                  {/* Sets & Reps */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`sets-${idx}`} className="text-xs">{t('workout.sets')} {t('workout.completed').toLowerCase()}</Label>
                      <Input
                        id={`sets-${idx}`}
                        type="number"
                        min={1}
                        value={log.sets_completed}
                        onChange={(e) => updateExerciseLog(exercise.name, 'sets_completed', parseInt(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`reps-${idx}`} className="text-xs">{t('workout.reps')}</Label>
                      <Input
                        id={`reps-${idx}`}
                        type="number"
                        min={1}
                        value={log.reps_completed}
                        onChange={(e) => updateExerciseLog(exercise.name, 'reps_completed', parseInt(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${idx}`} className="text-xs">{t('workout.weight')} (kg)</Label>
                      <Input
                        id={`weight-${idx}`}
                        type="number"
                        min={0}
                        step={0.5}
                        value={log.weight_used || ''}
                        onChange={(e) => updateExerciseLog(exercise.name, 'weight_used', parseFloat(e.target.value) || undefined)}
                        placeholder={exercise.weight || t('workoutLogger.optional')}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* RPE Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">RPE - {getRPELabel(log.exercise_rpe)}</Label>
                      <span className={`text-xl font-bold ${getRPEColor(log.exercise_rpe)}`}>
                        {log.exercise_rpe}/10
                      </span>
                    </div>
                    <Slider
                      value={[log.exercise_rpe]}
                      onValueChange={([value]) => updateExerciseLog(exercise.name, 'exercise_rpe', value)}
                      min={1}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{t('rpe.2')}</span>
                      <span>{t('rpe.4')}</span>
                      <span>{t('rpe.10')}</span>
                    </div>
                  </div>

                  {/* Difficulty vs Baseline */}
                  <div>
                    <Label className="text-xs mb-2 block">{t('workoutLogger.vsBaseline')}</Label>
                    <div className="flex gap-2">
                      {(['easier', 'as_expected', 'harder'] as const).map(diff => (
                        <Button
                          key={diff}
                          type="button"
                          variant={log.difficulty_vs_baseline === diff ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateExerciseLog(exercise.name, 'difficulty_vs_baseline', diff)}
                          className="flex-1 text-xs"
                        >
                          {diff === 'easier' && <TrendingDown className="w-3 h-3 mr-1" />}
                          {diff === 'as_expected' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {diff === 'harder' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {diff === 'easier' ? t('workoutLogger.easier') : diff === 'as_expected' ? t('workoutLogger.asExpected') : t('workoutLogger.harder')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor={`notes-${idx}`} className="text-xs">{t('workoutLogger.notesOptional')}</Label>
                    <Input
                      id={`notes-${idx}`}
                      value={log.notes}
                      onChange={(e) => updateExerciseLog(exercise.name, 'notes', e.target.value)}
                      placeholder={t('workoutLogger.notesPlaceholder')}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Video Form Check Button - only for supported exercises */}
                  {isExerciseSupportedInternally(exercise.name) && (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setShowVideoUpload(true);
                        }}
                        className="w-full"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        📹 Record Form Check
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Session Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">{t('workoutLogger.sessionDetails')}</h3>

            {/* Mood */}
            <div>
              <Label className="text-xs mb-2 block">{t('mood.question')}</Label>
              <div className="flex gap-2 flex-wrap">
                {['energized', 'normal', 'tired', 'stressed'].map(m => (
                  <Button
                    key={m}
                    type="button"
                    variant={mood === m ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMood(m)}
                  >
                    {m === 'energized' ? `⚡ ${t('mood.energized')}` : m === 'normal' ? `😊 ${t('mood.normal')}` : m === 'tired' ? `😴 ${t('mood.tired')}` : `😰 ${t('mood.stressed')}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">{t('workoutLogger.sleepQuality')}</Label>
                <span className="font-semibold">{sleepQuality}/10</span>
              </div>
              <Slider
                value={[sleepQuality]}
                onValueChange={([value]) => setSleepQuality(value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Workout Notes */}
            <div>
              <Label htmlFor="workout-notes" className="text-xs">{t('workout.notes')}</Label>
              <Textarea
                id="workout-notes"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder={t('workout.notes_placeholder')}
                rows={3}
                className="text-sm"
              />
            </div>
          </div>

          {/* RPE Warning */}
          {calculateSessionRPE() > 8.5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-orange-900">{t('workoutLogger.rpeHigh')}</p>
                <p className="text-orange-700">
                  {t('workoutLogger.rpeWarning').replace('{rpe}', calculateSessionRPE().toString())}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveWorkout}
              disabled={loading}
              className="flex-1"
            >
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Video Upload Modal */}
      {showVideoUpload && selectedExercise && (
        <VideoUploadModal
          open={showVideoUpload}
          onClose={() => {
            setShowVideoUpload(false);
            setSelectedExercise(null);
          }}
          exerciseName={selectedExercise.name}
          exercisePattern={selectedExercise.pattern}
          onUploadComplete={(correctionId) => {
            setShowVideoUpload(false);
            setSelectedExercise(null);
            toast.success('Video caricato! Analisi in corso...');
            // Opzionale: naviga a feedback view
            // window.location.href = `/video-feedback/${correctionId}`;
          }}
        />
      )}
    </Dialog>
  );
}
