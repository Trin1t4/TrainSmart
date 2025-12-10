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
  /** Main coaching message - authoritative, not a question */
  coachingMessage: string;
  /** Scientific explanation - why we're doing this */
  explanation: string;
  /** What will change in the program */
  programChanges: string[];
  /** Motivational note */
  motivation: string;
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
 * Generate coaching decision for missed workouts
 * NO user choice - authoritative coach approach
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

  // COACHING DECISIONS - No choices, just clear direction

  if (consecutiveMissed === 0 || daysSinceLast <= 3) {
    return {
      action: 'continue',
      volumeAdjustment: 1.0,
      intensityAdjustment: 1.0,
      coachingMessage: 'Tutto regolare. Alleniamoci.',
      explanation: 'Nessuna pausa significativa rilevata.',
      programChanges: [],
      motivation: 'La costanza batte l\'intensità. Sempre.'
    };
  }

  if (daysSinceLast <= 7) {
    return {
      action: 'continue',
      volumeAdjustment: 0.95,
      intensityAdjustment: 1.0,
      coachingMessage: 'Bentornato. Ho aggiunto 5 minuti di riscaldamento.',
      explanation: `Sono passati ${daysSinceLast} giorni. Il tuo corpo è ancora "caldo" - nessuna perdita significativa di forza o massa.`,
      programChanges: [
        'Riscaldamento esteso (+5 min)',
        'Prime serie di attivazione leggere'
      ],
      motivation: 'Una settimana di pausa non cancella mesi di lavoro. Ripartiamo.'
    };
  }

  if (daysSinceLast <= 14) {
    const volumeReduction = Math.round((1 - detraining.volumeMultiplier) * 100);
    return {
      action: 'restart_week',
      volumeAdjustment: detraining.volumeMultiplier,
      intensityAdjustment: 0.90,
      coachingMessage: `${daysSinceLast} giorni di stop. Ricominciamo la settimana con volume ridotto.`,
      explanation: 'Dopo 1-2 settimane, i tuoi muscoli sono ancora lì ma il sistema nervoso ha bisogno di "risvegliarsi". Riduco il volume per evitare DOMS eccessivo e permetterti di riprendere il ritmo.',
      programChanges: [
        `Volume ridotto del ${volumeReduction}% questa settimana`,
        'Focus sulla tecnica, non sui numeri',
        'Riscaldamento esteso con mobilità articolare'
      ],
      motivation: 'Non stai ricominciando da zero. Stai ricominciando con esperienza.'
    };
  }

  if (daysSinceLast <= 28) {
    return {
      action: 'deload',
      volumeAdjustment: 0.50,
      intensityAdjustment: 0.80,
      coachingMessage: `${daysSinceLast} giorni di pausa. Questa settimana facciamo deload intelligente.`,
      explanation: `Dopo ${Math.floor(daysSinceLast / 7)} settimane, hai perso circa il ${Math.round((1 - detraining.strengthRetention / 100) * 100)}% della forza e il ${Math.round((1 - detraining.enduranceRetention / 100) * 100)}% della resistenza. È normale e recuperabile. Ma se riparti troppo forte, rischi infortuni o sovrallenamento.`,
      programChanges: [
        '50% del volume normale',
        '80% dell\'intensità (pesi più leggeri)',
        'Niente cedimento muscolare',
        'Focus su mobilità e recupero attivo',
        'Riscaldamento di 10-15 minuti'
      ],
      motivation: 'Il deload non è una punizione. È il trampolino per tornare più forte.'
    };
  }

  // > 4 settimane
  return {
    action: 'reset_program',
    volumeAdjustment: 0.50,
    intensityAdjustment: 0.70,
    coachingMessage: `${daysSinceLast} giorni di stop. Ho preparato un programma di ri-adattamento di ${detraining.reAdaptationWeeks} settimane.`,
    explanation: `Dopo più di un mese, il corpo ha bisogno di tempo per riadattarsi. Non è un reset - è una rampa di lancio. La ricerca mostra che chi riprende troppo intensamente dopo pause lunghe ha il 3x di probabilità di infortunarsi.`,
    programChanges: [
      `Programma di ${detraining.reAdaptationWeeks} settimane progressivo`,
      'Settimana 1-2: 50% volume, focus tecnica',
      'Settimana 3-4: 70% volume, introduzione intensità',
      'Settimana 5+: ritorno graduale al 100%',
      'Riscaldamento esteso ogni sessione',
      'Consiglio: ripeti la valutazione fisica'
    ],
    motivation: 'Non importa quanto tempo sei stato fermo. Importa che sei tornato. Il tuo corpo ha memoria muscolare - recupererai più velocemente di quanto pensi.'
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
 * Get coaching decision for unvalidated session
 * NO user choice - the system decides what's best
 */
export function getUnvalidatedSessionDecision(session: UnvalidatedSession): {
  action: 'restart_fresh' | 'count_as_partial';
  title: string;
  explanation: string;
  coachingNote: string;
} {
  const completionRatio = session.exercisesCompleted / session.exercisesStarted;
  const hoursSinceStart = (Date.now() - new Date(session.startedAt).getTime()) / (1000 * 60 * 60);

  // Decision logic: if completed >50% recently, count as partial. Otherwise restart.
  if (completionRatio >= 0.5 && hoursSinceStart < 48) {
    return {
      action: 'count_as_partial',
      title: 'Sessione parziale registrata',
      explanation: `Hai completato ${session.exercisesCompleted} esercizi su ${session.exercisesStarted}. Li conto come allenamento parziale - meglio metà che niente.`,
      coachingNote: 'Oggi riparti con una sessione completa. Il corpo si adatta alla costanza, non alla perfezione.'
    };
  }

  return {
    action: 'restart_fresh',
    title: 'Ricominciamo da zero',
    explanation: `La sessione del ${new Date(session.startedAt).toLocaleDateString('it-IT')} era incompleta. Non la conto - oggi riparti fresco.`,
    coachingNote: 'Meglio un allenamento completo fatto bene che due mezzi fatti male. Concentrati sulla qualità.'
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
  getUnvalidatedSessionDecision,
  calculateStreak,
  getStreakMessage,
  shouldShowMissedWarning
};
