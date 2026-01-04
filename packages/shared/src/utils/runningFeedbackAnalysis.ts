/**
 * RUNNING FEEDBACK ANALYSIS
 *
 * Pattern detection, trend analysis, and adjustment generation
 * for running session feedback.
 */

import type {
  RunningSessionFeedback,
  RunningPattern,
  RunningPatternId,
  RunningAdjustment,
  RunningFeedbackAnalysis,
  LegsFeel,
  BreathingQuality,
  RunQuality,
  MentalState,
  RecoveryFeeling
} from '../types/runningFeedback.types';

import {
  RUNNING_FEEDBACK_THRESHOLDS,
  getLegsFeelScore,
  getBreathingScore,
  getRunQualityScore,
  getMentalStateScore,
  getRecoveryFeelingScore
} from '../types/runningFeedback.types';

const {
  HR_DRIFT_EXCELLENT,
  HR_DRIFT_GOOD,
  HR_DRIFT_CONCERNING,
  HR_DRIFT_HIGH,
  RPE_TOO_EASY,
  RPE_OPTIMAL_MIN,
  RPE_OPTIMAL_MAX,
  RPE_TOO_HARD,
  MIN_SESSIONS_FOR_ANALYSIS,
  CONSECUTIVE_BAD_SESSIONS,
  CONSECUTIVE_GOOD_SESSIONS
} = RUNNING_FEEDBACK_THRESHOLDS;

// ============================================================================
// SCORE CALCULATIONS
// ============================================================================

/**
 * Calculate session score (0-100)
 */
export function calculateSessionScore(feedback: RunningSessionFeedback): number {
  let score = 50; // Base

  const { rpe, legsFeel, breathingQuality, runQuality, recoveryFeeling, hrDrift, completed } = feedback;

  // === RPE (peso: 25%) ===
  if (rpe >= RPE_OPTIMAL_MIN && rpe <= RPE_OPTIMAL_MAX) {
    score += 25;
  } else if (rpe < RPE_TOO_EASY) {
    score += 15;  // Troppo facile, ma ok
  } else if (rpe <= RPE_TOO_HARD) {
    score += 10;
  } else {
    score -= 10;  // Troppo duro per Z2
  }

  // === Sensazioni (peso: 30%) ===
  const legsScore = getLegsFeelScore(legsFeel);
  const breathScore = getBreathingScore(breathingQuality);
  const runScore = getRunQualityScore(runQuality);
  const sensationsAvg = (legsScore + breathScore + runScore) / 3;
  score += (sensationsAvg - 2.5) * 15; // -15 to +15

  // === HR Drift (peso: 20%) ===
  if (hrDrift !== undefined) {
    if (hrDrift <= HR_DRIFT_EXCELLENT) score += 20;
    else if (hrDrift <= HR_DRIFT_GOOD) score += 15;
    else if (hrDrift <= HR_DRIFT_CONCERNING) score += 5;
    else score -= 10;
  }

  // === Completamento (peso: 15%) ===
  if (completed) {
    score += 15;
  } else {
    score -= 20;
  }

  // === Recovery feeling (peso: 10%) ===
  const recoveryScore = getRecoveryFeelingScore(recoveryFeeling);
  score += (recoveryScore - 2.5) * 5;

  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate readiness score (0-100)
 */
export function calculateReadinessScore(
  sleepQuality: number,        // 1-5
  stressLevel: number,         // 1-5
  restingHR?: number,
  baselineRestingHR?: number,
  soreness24h?: number         // 1-5
): number {
  let score = 50;

  // Sleep (peso: 35%)
  score += (sleepQuality - 3) * 12;

  // Stress (peso: 25%) - inverso
  score += (3 - stressLevel) * 8;

  // Resting HR vs baseline (peso: 25%)
  if (restingHR && baselineRestingHR) {
    const hrDiff = restingHR - baselineRestingHR;
    if (hrDiff <= -3) score += 15;      // HR più bassa = riposato
    else if (hrDiff <= 0) score += 10;
    else if (hrDiff <= 3) score += 0;
    else if (hrDiff <= 6) score -= 10;
    else score -= 20;                    // HR molto alta = non recuperato
  }

  // Soreness (peso: 15%)
  if (soreness24h) {
    score += (3 - soreness24h) * 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate fatigue indicator (0-100)
 */
export function calculateFatigueIndicator(feedback: RunningSessionFeedback): number {
  let fatigue = 0;

  // Legs feel
  if (feedback.legsFeel === 'dead') fatigue += 30;
  else if (feedback.legsFeel === 'heavy') fatigue += 20;
  else if (feedback.legsFeel === 'normal') fatigue += 10;

  // Breathing quality
  if (feedback.breathingQuality === 'gasping') fatigue += 25;
  else if (feedback.breathingQuality === 'labored') fatigue += 15;

  // RPE
  if (feedback.rpe >= 9) fatigue += 25;
  else if (feedback.rpe >= 8) fatigue += 15;
  else if (feedback.rpe >= 7) fatigue += 10;

  // HR Drift
  if (feedback.hrDrift) {
    if (feedback.hrDrift > HR_DRIFT_HIGH) fatigue += 20;
    else if (feedback.hrDrift > HR_DRIFT_CONCERNING) fatigue += 10;
  }

  return Math.min(100, fatigue);
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect patterns from recent sessions
 */
export function detectPatterns(sessions: RunningSessionFeedback[]): RunningPattern[] {
  const patterns: RunningPattern[] = [];

  if (sessions.length < CONSECUTIVE_BAD_SESSIONS) {
    return patterns;
  }

  const recent = sessions.slice(-CONSECUTIVE_BAD_SESSIONS);
  const now = new Date().toISOString();

  // === PATTERN 1: Overreaching ===
  const overreachingSessions = recent.filter(s =>
    (s.hrDrift !== undefined && s.hrDrift > HR_DRIFT_CONCERNING) &&
    (s.legsFeel === 'heavy' || s.legsFeel === 'dead') &&
    s.rpe >= RPE_TOO_HARD
  );

  if (overreachingSessions.length >= CONSECUTIVE_BAD_SESSIONS) {
    patterns.push({
      id: 'overreaching',
      name: 'Overreaching',
      nameIt: 'Sovrallenamento',
      severity: 'critical',
      confidence: 0.85,
      detectedAt: now,
      sessionsAnalyzed: sessions.length,
      suggestedAction: 'Reduce volume by 20% and add extra rest day',
      suggestedActionIt: 'Riduci volume del 20% e aggiungi giorno di riposo extra'
    });
  }

  // === PATTERN 2: Running Too Fast ===
  const tooFastSessions = recent.filter(s =>
    s.breathingQuality === 'labored' || s.breathingQuality === 'gasping'
  );

  if (tooFastSessions.length >= CONSECUTIVE_BAD_SESSIONS) {
    patterns.push({
      id: 'too_fast',
      name: 'Running Too Fast',
      nameIt: 'Corsa Troppo Veloce',
      severity: 'warning',
      confidence: 0.9,
      detectedAt: now,
      sessionsAnalyzed: sessions.length,
      suggestedAction: 'Slow down! You should be able to hold a conversation',
      suggestedActionIt: 'Rallenta! Dovresti poter tenere una conversazione'
    });
  }

  // === PATTERN 3: Poor Recovery ===
  const poorRecoverySessions = recent.filter(s =>
    s.recoveryFeeling === 'exhausted' &&
    s.sleepQualityLastNight <= 2
  );

  if (poorRecoverySessions.length >= CONSECUTIVE_BAD_SESSIONS) {
    patterns.push({
      id: 'poor_recovery',
      name: 'Poor Recovery',
      nameIt: 'Recupero Scarso',
      severity: 'warning',
      confidence: 0.75,
      detectedAt: now,
      sessionsAnalyzed: sessions.length,
      suggestedAction: 'Consider an extra rest day this week',
      suggestedActionIt: 'Considera un giorno di riposo extra questa settimana'
    });
  }

  // === PATTERN 4: Undertraining (positive) ===
  const recentGood = sessions.slice(-CONSECUTIVE_GOOD_SESSIONS);
  if (recentGood.length >= CONSECUTIVE_GOOD_SESSIONS) {
    const undertrainingSessions = recentGood.filter(s =>
      s.rpe <= RPE_TOO_EASY &&
      s.legsFeel === 'fresh' &&
      s.recoveryFeeling === 'energized'
    );

    if (undertrainingSessions.length >= CONSECUTIVE_GOOD_SESSIONS) {
      patterns.push({
        id: 'undertraining',
        name: 'Ready to Progress',
        nameIt: 'Pronto a Progredire',
        severity: 'info',
        confidence: 0.8,
        detectedAt: now,
        sessionsAnalyzed: sessions.length,
        suggestedAction: 'You can increase volume by 10%',
        suggestedActionIt: 'Puoi aumentare il volume del 10%'
      });
    }
  }

  // === PATTERN 5: Cardiac Adaptation (positive) ===
  if (sessions.length >= 6) {
    const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(Math.floor(sessions.length / 2));

    const avgDriftFirst = firstHalf
      .filter(s => s.hrDrift !== undefined)
      .reduce((sum, s) => sum + (s.hrDrift || 0), 0) / firstHalf.filter(s => s.hrDrift !== undefined).length;

    const avgDriftSecond = secondHalf
      .filter(s => s.hrDrift !== undefined)
      .reduce((sum, s) => sum + (s.hrDrift || 0), 0) / secondHalf.filter(s => s.hrDrift !== undefined).length;

    if (avgDriftSecond < avgDriftFirst - 2) {
      patterns.push({
        id: 'cardiac_adaptation',
        name: 'Cardiac Adaptation',
        nameIt: 'Adattamento Cardiaco',
        severity: 'info',
        confidence: 0.7,
        detectedAt: now,
        sessionsAnalyzed: sessions.length,
        suggestedAction: 'Your cardiovascular fitness is improving!',
        suggestedActionIt: 'La tua forma cardiovascolare sta migliorando!'
      });
    }
  }

  // === PATTERN 6: Mental Fatigue ===
  const mentalFatigueSessions = recent.filter(s =>
    s.mentalState === 'wanted_to_stop' || s.mentalState === 'distracted'
  );

  if (mentalFatigueSessions.length >= CONSECUTIVE_BAD_SESSIONS) {
    patterns.push({
      id: 'mental_fatigue',
      name: 'Mental Fatigue',
      nameIt: 'Fatica Mentale',
      severity: 'warning',
      confidence: 0.7,
      detectedAt: now,
      sessionsAnalyzed: sessions.length,
      suggestedAction: 'Consider varying your routes or adding rest',
      suggestedActionIt: 'Considera variare i percorsi o aggiungere riposo'
    });
  }

  return patterns;
}

// ============================================================================
// ADJUSTMENT GENERATION
// ============================================================================

/**
 * Generate adjustment based on patterns and session analysis
 */
export function generateAdjustment(
  sessions: RunningSessionFeedback[],
  patterns: RunningPattern[]
): RunningAdjustment | null {
  // Priorità ai pattern critici
  const criticalPattern = patterns.find(p => p.severity === 'critical');
  if (criticalPattern?.id === 'overreaching') {
    return {
      type: 'reduce_volume',
      volumeChangePercent: -20,
      reason: 'Multiple signs of overreaching detected',
      reasonIt: 'Rilevati multipli segni di sovrallenamento',
      userMessage: '⚠️ Your body needs recovery. Volume reduced by 20%.',
      userMessageIt: '⚠️ Il tuo corpo ha bisogno di recupero. Volume ridotto del 20%.',
      confidence: 0.85,
      requiresConfirmation: false  // Auto-apply per sicurezza
    };
  }

  // Warning patterns
  if (patterns.some(p => p.id === 'too_fast')) {
    return {
      type: 'slow_down',
      reason: 'Running too fast for Zone 2 training',
      reasonIt: 'Corsa troppo veloce per allenamento in Zona 2',
      userMessage: '🐢 Slow down! For Zone 2, you should be able to talk.',
      userMessageIt: '🐢 Rallenta! Per Zona 2, dovresti poter parlare.',
      confidence: 0.9,
      requiresConfirmation: false
    };
  }

  if (patterns.some(p => p.id === 'poor_recovery')) {
    return {
      type: 'add_rest_day',
      reason: 'Poor recovery indicators',
      reasonIt: 'Indicatori di recupero scarsi',
      userMessage: '😴 Consider an extra rest day this week.',
      userMessageIt: '😴 Considera un giorno di riposo extra questa settimana.',
      confidence: 0.75,
      requiresConfirmation: true
    };
  }

  if (patterns.some(p => p.id === 'mental_fatigue')) {
    return {
      type: 'reduce_intensity',
      reason: 'Mental fatigue detected',
      reasonIt: 'Rilevata fatica mentale',
      userMessage: '🧠 Try varying your routes or take an extra rest day.',
      userMessageIt: '🧠 Prova a variare i percorsi o prenditi un giorno di riposo extra.',
      confidence: 0.7,
      requiresConfirmation: true
    };
  }

  // Info patterns (positive)
  if (patterns.some(p => p.id === 'undertraining')) {
    return {
      type: 'increase_volume',
      volumeChangePercent: 10,
      addMinutes: 5,
      reason: 'Consistently easy sessions indicate readiness for progression',
      reasonIt: 'Sessioni costantemente facili indicano prontezza per progredire',
      userMessage: '🚀 You\'re ready for more! Volume increased by 10%.',
      userMessageIt: '🚀 Sei pronto per di più! Volume aumentato del 10%.',
      confidence: 0.8,
      requiresConfirmation: true
    };
  }

  // Check average RPE
  if (sessions.length >= MIN_SESSIONS_FOR_ANALYSIS) {
    const avgRPE = sessions.reduce((sum, s) => sum + s.rpe, 0) / sessions.length;

    if (avgRPE >= RPE_OPTIMAL_MIN && avgRPE <= RPE_OPTIMAL_MAX) {
      return {
        type: 'maintain',
        reason: 'Training load is appropriate',
        reasonIt: 'Il carico di allenamento è appropriato',
        userMessage: '✅ Great work! Keep going like this.',
        userMessageIt: '✅ Ottimo lavoro! Continua così.',
        confidence: 0.9,
        requiresConfirmation: false
      };
    }
  }

  return null;
}

// ============================================================================
// FULL ANALYSIS
// ============================================================================

/**
 * Perform full analysis on user's running sessions
 */
export function analyzeUserRunningProgress(
  sessions: RunningSessionFeedback[],
  userId: string,
  programId?: string
): RunningFeedbackAnalysis {
  const now = new Date().toISOString();

  if (sessions.length === 0) {
    return {
      userId,
      programId,
      analyzedAt: now,
      sessionsCount: 0,
      periodDays: 0,
      avgRPE: 0,
      avgSessionScore: 0,
      rpesTrend: 'stable',
      scoreTrend: 'stable',
      patterns: [],
      suggestedAdjustment: null,
      summary: 'No sessions to analyze yet.',
      summaryIt: 'Nessuna sessione da analizzare ancora.'
    };
  }

  // Calculate basic stats
  const avgRPE = sessions.reduce((sum, s) => sum + s.rpe, 0) / sessions.length;
  const avgSessionScore = sessions.reduce((sum, s) => sum + (s.sessionScore || calculateSessionScore(s)), 0) / sessions.length;

  const hrDriftSessions = sessions.filter(s => s.hrDrift !== undefined);
  const avgHRDrift = hrDriftSessions.length > 0
    ? hrDriftSessions.reduce((sum, s) => sum + (s.hrDrift || 0), 0) / hrDriftSessions.length
    : undefined;

  // Calculate period
  const dates = sessions.map(s => new Date(s.date).getTime());
  const periodDays = Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate trends
  const halfPoint = Math.floor(sessions.length / 2);
  const firstHalf = sessions.slice(0, halfPoint);
  const secondHalf = sessions.slice(halfPoint);

  const avgRPEFirst = firstHalf.reduce((sum, s) => sum + s.rpe, 0) / firstHalf.length;
  const avgRPESecond = secondHalf.reduce((sum, s) => sum + s.rpe, 0) / secondHalf.length;

  const avgScoreFirst = firstHalf.reduce((sum, s) => sum + (s.sessionScore || 0), 0) / firstHalf.length;
  const avgScoreSecond = secondHalf.reduce((sum, s) => sum + (s.sessionScore || 0), 0) / secondHalf.length;

  const rpesTrend: 'improving' | 'stable' | 'worsening' =
    avgRPESecond < avgRPEFirst - 0.5 ? 'improving' :
    avgRPESecond > avgRPEFirst + 0.5 ? 'worsening' : 'stable';

  const scoreTrend: 'improving' | 'stable' | 'worsening' =
    avgScoreSecond > avgScoreFirst + 5 ? 'improving' :
    avgScoreSecond < avgScoreFirst - 5 ? 'worsening' : 'stable';

  // Detect patterns
  const patterns = detectPatterns(sessions);

  // Generate adjustment
  const suggestedAdjustment = generateAdjustment(sessions, patterns);

  // Generate summary
  let summary: string;
  let summaryIt: string;

  const criticalPatterns = patterns.filter(p => p.severity === 'critical');
  const warningPatterns = patterns.filter(p => p.severity === 'warning');
  const infoPatterns = patterns.filter(p => p.severity === 'info');

  if (criticalPatterns.length > 0) {
    summary = 'Critical issues detected. Reduce training load immediately.';
    summaryIt = 'Problemi critici rilevati. Riduci il carico di allenamento immediatamente.';
  } else if (warningPatterns.length > 0) {
    summary = 'Some warning signs detected. Consider adjusting your training.';
    summaryIt = 'Alcuni segnali di attenzione rilevati. Considera di aggiustare il tuo allenamento.';
  } else if (infoPatterns.length > 0 && infoPatterns.some(p => p.id === 'undertraining')) {
    summary = 'Training is going well! You may be ready to progress.';
    summaryIt = 'L\'allenamento sta andando bene! Potresti essere pronto a progredire.';
  } else if (avgRPE >= RPE_OPTIMAL_MIN && avgRPE <= RPE_OPTIMAL_MAX) {
    summary = 'Training load appears appropriate. Keep up the good work!';
    summaryIt = 'Il carico di allenamento sembra appropriato. Continua così!';
  } else {
    summary = 'Continue monitoring your sessions for trends.';
    summaryIt = 'Continua a monitorare le tue sessioni per individuare trend.';
  }

  return {
    userId,
    programId,
    analyzedAt: now,
    sessionsCount: sessions.length,
    periodDays,
    avgRPE,
    avgSessionScore,
    avgHRDrift,
    rpesTrend,
    scoreTrend,
    patterns,
    suggestedAdjustment,
    summary,
    summaryIt
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert pace string "5:30" to seconds
 */
export function paceToSeconds(pace: string): number {
  const parts = pace.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Convert seconds to pace string "5:30"
 */
export function secondsToPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate pace from distance and duration
 */
export function calculatePace(distanceKm: number, durationMinutes: number): string {
  if (distanceKm <= 0) return '0:00';
  const paceSeconds = (durationMinutes * 60) / distanceKm;
  return secondsToPace(Math.round(paceSeconds));
}

/**
 * Get HR zone based on percentage of max HR
 */
export function getHRZone(
  heartRate: number,
  maxHR: number
): { zone: 1 | 2 | 3 | 4 | 5; label: string; labelIt: string } {
  const percentage = (heartRate / maxHR) * 100;

  if (percentage < 60) return { zone: 1, label: 'Zone 1 - Recovery', labelIt: 'Zona 1 - Recupero' };
  if (percentage < 70) return { zone: 2, label: 'Zone 2 - Aerobic', labelIt: 'Zona 2 - Aerobica' };
  if (percentage < 80) return { zone: 3, label: 'Zone 3 - Tempo', labelIt: 'Zona 3 - Tempo' };
  if (percentage < 90) return { zone: 4, label: 'Zone 4 - Threshold', labelIt: 'Zona 4 - Soglia' };
  return { zone: 5, label: 'Zone 5 - VO2max', labelIt: 'Zona 5 - VO2max' };
}

/**
 * Check if HR is in target Zone 2
 */
export function isInZone2(heartRate: number, maxHR: number): boolean {
  const percentage = (heartRate / maxHR) * 100;
  return percentage >= 60 && percentage < 70;
}

/**
 * Get feedback message for HR zone
 */
export function getHRZoneFeedback(avgHR: number, maxHR: number): {
  status: 'good' | 'warning' | 'danger';
  message: string;
  messageIt: string;
} {
  const percentage = (avgHR / maxHR) * 100;

  if (percentage <= 70) {
    return {
      status: 'good',
      message: 'Perfect! You\'re in Zone 2',
      messageIt: 'Perfetto! Sei in Zona 2'
    };
  } else if (percentage <= 80) {
    return {
      status: 'warning',
      message: 'Zone 3 - a bit too intense',
      messageIt: 'Zona 3 - un po\' troppo intenso'
    };
  } else {
    return {
      status: 'danger',
      message: 'Zone 4+ - too intense!',
      messageIt: 'Zona 4+ - troppo intenso!'
    };
  }
}
