/**
 * WORKOUT TRACKING & MISSED SESSION MANAGEMENT
 *
 * Handles:
 * 1. Tracking completed vs missed workouts
 * 2. Detecting unvalidated sessions (started but not completed)
 * 3. Program adjustment after missed weeks
 * 4. Streak calculation and motivation
 */

import { calculateDetraining, getDetrainingFactor } from './detrainingModel';
import { Level } from '../types';

export type WorkoutStatus = 'completed' | 'missed' | 'partial' | 'skipped' | 'scheduled';

export interface WorkoutSession {
  id: string;
  programId: string;
  dayIndex: number;
  scheduledDate: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  exercisesCompleted?: number;
  exercisesTotal?: number;
  notes?: string;
  feedback?: SessionFeedback;
}

export interface SessionFeedback {
  perceivedDifficulty: 1 | 2 | 3 | 4 | 5; // 1=too easy, 5=too hard
  energyLevel: 1 | 2 | 3 | 4 | 5;
  painReported: boolean;
  wouldRepeat: boolean;
}

export interface WorkoutStreak {
  current: number;
  longest: number;
  lastWorkoutDate: string | null;
  weeklyGoal: number;
  weeklyCompleted: number;
}

export interface MissedWorkoutAnalysis {
  daysMissed: number;
  consecutiveMissedDays: number;
  missedInCurrentWeek: number;
  totalScheduledThisWeek: number;
  completionRate: number; // 0-100%
  trend: 'improving' | 'stable' | 'declining';
  recommendation: MissedWorkoutRecommendation;
}

export interface MissedWorkoutRecommendation {
  action: 'continue' | 'restart_week' | 'deload' | 'reset_program';
  volumeAdjustment: number; // 0.5 - 1.0
  intensityAdjustment: number; // 0.5 - 1.0
  message: string;
  additionalNotes: string[];
}

export interface UnvalidatedSession {
  sessionId: string;
  programId: string;
  dayName: string;
  startedAt: string;
  exercisesStarted: number;
  exercisesCompleted: number;
  reason?: 'abandoned' | 'interrupted' | 'technical_issue' | 'unknown';
}

/**
 * Calculate days since last completed workout
 */
export function daysSinceLastWorkout(sessions: WorkoutSession[]): number {
  const completed = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() -
                    new Date(a.completedAt || a.scheduledDate).getTime());

  if (completed.length === 0) {
    return Infinity;
  }

  const lastDate = new Date(completed[0].completedAt || completed[0].scheduledDate);
  const now = new Date();
  return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Analyze missed workouts and provide recommendations
 */
export function analyzeMissedWorkouts(
  sessions: WorkoutSession[],
  weeklyGoal: number,
  level: Level = 'intermediate'
): MissedWorkoutAnalysis {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
  weekStart.setHours(0, 0, 0, 0);

  // Sessions this week
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledDate);
    return sessionDate >= weekStart;
  });

  const completedThisWeek = thisWeekSessions.filter(s => s.status === 'completed').length;
  const missedThisWeek = thisWeekSessions.filter(s =>
    s.status === 'missed' ||
    (s.status === 'scheduled' && new Date(s.scheduledDate) < now)
  ).length;

  // Calculate consecutive missed days
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  let consecutiveMissed = 0;
  for (const session of sortedSessions) {
    if (session.status === 'completed') break;
    if (session.status === 'missed' || session.status === 'skipped') {
      consecutiveMissed++;
    }
  }

  // Overall completion rate (last 4 weeks)
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(now.getDate() - 28);

  const recentSessions = sessions.filter(s =>
    new Date(s.scheduledDate) >= fourWeeksAgo &&
    new Date(s.scheduledDate) <= now
  );

  const completedRecent = recentSessions.filter(s => s.status === 'completed').length;
  const totalRecent = recentSessions.length || 1;
  const completionRate = Math.round((completedRecent / totalRecent) * 100);

  // Determine trend
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const firstHalf = recentSessions.filter(s =>
    new Date(s.scheduledDate) >= fourWeeksAgo &&
    new Date(s.scheduledDate) < twoWeeksAgo
  );
  const secondHalf = recentSessions.filter(s =>
    new Date(s.scheduledDate) >= twoWeeksAgo
  );

  const firstHalfRate = firstHalf.filter(s => s.status === 'completed').length / (firstHalf.length || 1);
  const secondHalfRate = secondHalf.filter(s => s.status === 'completed').length / (secondHalf.length || 1);

  let trend: 'improving' | 'stable' | 'declining';
  if (secondHalfRate > firstHalfRate + 0.1) trend = 'improving';
  else if (secondHalfRate < firstHalfRate - 0.1) trend = 'declining';
  else trend = 'stable';

  // Generate recommendation
  const recommendation = generateMissedWorkoutRecommendation(
    consecutiveMissed,
    completionRate,
    level,
    daysSinceLastWorkout(sessions)
  );

  return {
    daysMissed: missedThisWeek,
    consecutiveMissedDays: consecutiveMissed,
    missedInCurrentWeek: missedThisWeek,
    totalScheduledThisWeek: thisWeekSessions.length,
    completionRate,
    trend,
    recommendation
  };
}

/**
 * Generate recommendation based on missed workout analysis
 */
function generateMissedWorkoutRecommendation(
  consecutiveMissed: number,
  completionRate: number,
  level: Level,
  daysSinceLast: number
): MissedWorkoutRecommendation {
  // Use detraining model for scientific adjustments
  const detraining = calculateDetraining({
    daysSinceTraining: daysSinceLast,
    level,
    goal: 'general'
  });

  // Determine action based on severity
  let action: 'continue' | 'restart_week' | 'deload' | 'reset_program';
  let message: string;
  const additionalNotes: string[] = [];

  if (consecutiveMissed === 0 || daysSinceLast <= 3) {
    action = 'continue';
    message = 'Continua normalmente con il tuo programma';
  }
  else if (consecutiveMissed <= 2 || daysSinceLast <= 7) {
    action = 'continue';
    message = 'Riprendi da dove avevi lasciato';
    additionalNotes.push('Aumenta il riscaldamento di 5 minuti');
  }
  else if (consecutiveMissed <= 4 || daysSinceLast <= 14) {
    action = 'restart_week';
    message = 'Ricomincia la settimana corrente con volume ridotto';
    additionalNotes.push('Prima sessione: 70% del volume');
    additionalNotes.push('Focus su tecnica e connessione mente-muscolo');
  }
  else if (consecutiveMissed <= 7 || daysSinceLast <= 21) {
    action = 'deload';
    message = 'Settimana di deload prima di riprendere';
    additionalNotes.push('50% volume, 80% intensità per 1 settimana');
    additionalNotes.push('Priorità a mobilità e recupero');
    additionalNotes.push('Non inseguire i pesi precedenti subito');
  }
  else {
    action = 'reset_program';
    message = 'Programma di ri-adattamento consigliato';
    additionalNotes.push(`${detraining.reAdaptationWeeks} settimane di riadattamento`);
    additionalNotes.push('Inizia con 50% del volume precedente');
    additionalNotes.push('Aumenta gradualmente 10-15% a settimana');
    additionalNotes.push('Considera una nuova valutazione fisica');
  }

  // Adjust for completion rate
  if (completionRate < 50) {
    additionalNotes.push('📊 Tasso completamento basso - considera obiettivi più realistici');
    additionalNotes.push('Prova a ridurre la frequenza settimanale');
  }

  return {
    action,
    volumeAdjustment: detraining.volumeMultiplier,
    intensityAdjustment: detraining.intensityMultiplier,
    message,
    additionalNotes
  };
}

/**
 * Detect unvalidated (partially completed) sessions
 */
export function findUnvalidatedSessions(sessions: WorkoutSession[]): UnvalidatedSession[] {
  return sessions
    .filter(s =>
      s.status === 'partial' ||
      (s.startedAt && !s.completedAt && s.status !== 'completed')
    )
    .map(s => ({
      sessionId: s.id,
      programId: s.programId,
      dayName: `Day ${s.dayIndex + 1}`,
      startedAt: s.startedAt || s.scheduledDate,
      exercisesStarted: s.exercisesTotal || 0,
      exercisesCompleted: s.exercisesCompleted || 0,
      reason: 'unknown' as const
    }));
}

/**
 * Prompt user about unvalidated session
 */
export function getUnvalidatedSessionPrompt(session: UnvalidatedSession): {
  title: string;
  message: string;
  options: Array<{ label: string; action: 'complete' | 'discard' | 'resume' }>;
} {
  const exerciseProgress = session.exercisesCompleted > 0
    ? `(${session.exercisesCompleted}/${session.exercisesStarted} esercizi)`
    : '';

  return {
    title: 'Sessione non completata',
    message: `Hai iniziato "${session.dayName}" il ${new Date(session.startedAt).toLocaleDateString('it-IT')} ma non l'hai completato ${exerciseProgress}. Cosa vuoi fare?`,
    options: [
      { label: 'Segna come completato', action: 'complete' },
      { label: 'Riprendi da dove ero', action: 'resume' },
      { label: 'Scarta e ricomincia', action: 'discard' }
    ]
  };
}

/**
 * Calculate workout streak
 */
export function calculateStreak(sessions: WorkoutSession[], weeklyGoal: number): WorkoutStreak {
  const completed = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() -
                    new Date(a.completedAt || a.scheduledDate).getTime());

  if (completed.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastWorkoutDate: null,
      weeklyGoal,
      weeklyCompleted: 0
    };
  }

  // Current streak (consecutive days with workouts within expected frequency)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const maxDaysBetween = Math.ceil(7 / weeklyGoal) + 1; // Allow some flexibility

  for (let i = 0; i < completed.length - 1; i++) {
    const current = new Date(completed[i].completedAt || completed[i].scheduledDate);
    const next = new Date(completed[i + 1].completedAt || completed[i + 1].scheduledDate);
    const daysBetween = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

    if (daysBetween <= maxDaysBetween) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak + 1);
      tempStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak + 1);

  // Check if streak is still active (last workout within acceptable range)
  const daysSinceLast = daysSinceLastWorkout(sessions);
  if (daysSinceLast <= maxDaysBetween) {
    currentStreak = tempStreak + 1;
  } else {
    currentStreak = 0;
  }

  // This week's completions
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyCompleted = completed.filter(s => {
    const date = new Date(s.completedAt || s.scheduledDate);
    return date >= weekStart;
  }).length;

  return {
    current: currentStreak,
    longest: longestStreak,
    lastWorkoutDate: completed[0]?.completedAt || completed[0]?.scheduledDate || null,
    weeklyGoal,
    weeklyCompleted
  };
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: WorkoutStreak): string {
  const { current, weeklyGoal, weeklyCompleted } = streak;

  if (current === 0) {
    return '🔥 Inizia oggi la tua serie! Ogni campione comincia con il primo passo.';
  }

  if (current >= 30) {
    return `🏆 ${current} allenamenti consecutivi! Sei inarrestabile!`;
  }

  if (current >= 14) {
    return `💪 ${current} sessioni di fila! Stai costruendo un\'abitudine solida.`;
  }

  if (current >= 7) {
    return `🔥 ${current} allenamenti! Una settimana perfetta, continua così!`;
  }

  if (current >= 3) {
    return `✨ ${current} sessioni consecutive! Il momentum sta crescendo!`;
  }

  if (weeklyCompleted >= weeklyGoal) {
    return '🎯 Obiettivo settimanale raggiunto! Ottimo lavoro!';
  }

  const remaining = weeklyGoal - weeklyCompleted;
  return `📅 ${remaining} allenamenti per completare la settimana. Ce la puoi fare!`;
}

/**
 * Should show "missed workout" warning
 */
export function shouldShowMissedWarning(sessions: WorkoutSession[], weeklyGoal: number): boolean {
  const days = daysSinceLastWorkout(sessions);
  const expectedDaysBetween = Math.ceil(7 / weeklyGoal);
  return days > expectedDaysBetween + 2;
}

export default {
  daysSinceLastWorkout,
  analyzeMissedWorkouts,
  findUnvalidatedSessions,
  getUnvalidatedSessionPrompt,
  calculateStreak,
  getStreakMessage,
  shouldShowMissedWarning
};
