/**
 * PAIN MANAGEMENT SERVICE - MIGRATO A PAIN DETECT 2.0
 * 
 * File: packages/web/src/lib/painManagementService.ts
 * 
 * Questo file mantiene la compatibilità con il codice esistente
 * ma usa internamente il sistema Pain Detect 2.0 unificato.
 */

import { supabase } from './supabaseClient';

// Import dal nuovo sistema Pain Detect 2.0
import {
  classifyDiscomfort,
  evaluateDiscomfort,
  applyAdaptations,
  getLoadReductions,
  findSubstitution,
  PAIN_THRESHOLDS,
  LOAD_REDUCTIONS,
  BODY_AREA_LABELS,
  PAIN_DETECT_DISCLAIMER,
  type DiscomfortIntensity,
  type DiscomfortResponse,
  type BodyArea,
  type UserChoice,
  type DiscomfortReport
} from '@trainsmart/shared';

// =============================================================================
// TYPES (Mantenuti per compatibilità con codice esistente)
// =============================================================================

export interface PainLog {
  id?: string;
  user_id: string;
  program_id?: string;
  exercise_name: string;
  session_date?: string;
  day_name?: string;
  set_number: number;
  weight_used?: number;
  reps_completed: number;
  rom_percentage?: number;
  pain_level: number; // 0-10
  rpe?: number;
  pain_location?: string;
  adaptations?: Adaptation[];
  notes?: string;
}

export interface Adaptation {
  type: 'weight_reduced' | 'reps_reduced' | 'rom_reduced' | 'exercise_stopped' | 'exercise_substituted';
  from?: number;
  to?: number;
  reason: string;
  timestamp: string;
}

export interface PainThreshold {
  id?: string;
  user_id: string;
  exercise_name: string;
  last_safe_weight?: number;
  last_safe_reps?: number;
  last_safe_rom?: number;
  last_session_date?: string;
  consecutive_pain_free_sessions: number;
  total_sessions: number;
  max_pain_recorded: number;
  last_pain_level: number;
  last_pain_date?: string;
  needs_physiotherapist_contact: boolean;
  physiotherapist_contacted_date?: string;
}

/**
 * Risposta compatibile con il vecchio sistema
 */
export interface AdaptationSuggestion {
  action: 'continue' | 'reduce_weight' | 'reduce_reps' | 'reduce_rom' | 'stop_exercise' | 'substitute_exercise';
  message: string;
  new_weight?: number;
  new_reps?: number;
  new_rom?: number;
  substitute_exercise?: string;
  alert_level: 'success' | 'warning' | 'error';
  /** Risposta completa dal nuovo sistema Pain Detect 2.0 */
  _painDetectResponse?: DiscomfortResponse;
}

export interface PainEvent {
  area: string;
  intensity: number;
  exercise: string;
  timestamp: string;
}

// =============================================================================
// PAIN MANAGEMENT SERVICE
// =============================================================================

class PainManagementService {
  // Cache per eventi di dolore della sessione corrente
  private sessionPainEvents: PainEvent[] = [];

  // =========================================================================
  // DATABASE OPERATIONS
  // =========================================================================

  /**
   * Log dolore dopo un set (persiste su Supabase)
   */
  async logPain(painLog: PainLog): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('pain_logs')
        .insert({
          user_id: painLog.user_id,
          program_id: painLog.program_id,
          exercise_name: painLog.exercise_name,
          session_date: painLog.session_date || new Date().toISOString(),
          day_name: painLog.day_name,
          set_number: painLog.set_number,
          weight_used: painLog.weight_used,
          reps_completed: painLog.reps_completed,
          rom_percentage: painLog.rom_percentage || 100,
          pain_level: painLog.pain_level,
          rpe: painLog.rpe,
          pain_location: painLog.pain_location,
          adaptations: painLog.adaptations || [],
          notes: painLog.notes
        })
        .select()
        .single();

      if (error) {
        console.error('[PainService] Error logging pain:', error);
        return { success: false, error: error.message };
      }

      console.log('[PainService] ✅ Pain logged:', data.id);
      return { success: true };
    } catch (error) {
      console.error('[PainService] Exception:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Registra un evento di dolore nella sessione (in memory)
   */
  logPainEvent(event: PainEvent): void {
    this.sessionPainEvents.push(event);
    console.log('[PainService] Pain event logged:', event);
  }

  /**
   * Ottiene gli eventi di dolore della sessione corrente
   */
  getSessionPainEvents(): PainEvent[] {
    return [...this.sessionPainEvents];
  }

  /**
   * Reset degli eventi di sessione (chiamare a inizio nuova sessione)
   */
  clearSessionEvents(): void {
    this.sessionPainEvents = [];
  }

  // =========================================================================
  // PAIN DETECT 2.0 - CORE FUNCTIONS
  // =========================================================================

  /**
   * SUGGERISCE ADATTAMENTO - USA PAIN DETECT 2.0
   * 
   * Mantiene la firma originale per compatibilità ma usa il nuovo sistema.
   */
  suggestAdaptation(
    painLevel: number,
    currentWeight: number,
    currentReps: number,
    currentRom: number,
    previousAdaptations: Adaptation[],
    goal?: string
  ): AdaptationSuggestion {
    // Normalizza l'intensità
    const intensity = Math.min(10, Math.max(0, Math.round(painLevel))) as DiscomfortIntensity;
    const level = classifyDiscomfort(intensity);
    
    // Crea un report per usare evaluateDiscomfort
    const report: DiscomfortReport = {
      id: `temp_${Date.now()}`,
      userId: 'temp',
      sessionId: 'temp',
      area: 'lower_back' as BodyArea, // Default
      intensity,
      phase: 'during_set',
      timestamp: new Date().toISOString()
    };

    const response = evaluateDiscomfort(report, {
      exerciseName: 'Current Exercise',
      isRecurringIssue: previousAdaptations.length >= 2
    });

    // ============================================
    // CONVERTI RISPOSTA PAIN DETECT 2.0 → LEGACY
    // ============================================

    // NONE o MILD (0-3): Continua
    if (level === 'none' || level === 'mild') {
      return {
        action: 'continue',
        message: response.messageIt,
        alert_level: 'success',
        _painDetectResponse: response
      };
    }

    // MODERATE (4-6): Riduci carico
    if (level === 'moderate') {
      const reductions = getLoadReductions(intensity);
      const newWeight = reductions.load > 0 
        ? Math.round(currentWeight * (1 - reductions.load / 100) / 2.5) * 2.5
        : currentWeight;

      // Se già adattato 2+ volte, suggerisci sostituzione
      if (previousAdaptations.length >= 2) {
        return {
          action: 'substitute_exercise',
          message: `⚠️ Fastidio persistente (${painLevel}/10). Considera un esercizio alternativo per questa zona.`,
          alert_level: 'warning',
          _painDetectResponse: response
        };
      }

      return {
        action: 'reduce_weight',
        message: response.messageIt,
        new_weight: newWeight,
        alert_level: 'warning',
        _painDetectResponse: response
      };
    }

    // SIGNIFICANT (7-8): Stop o sostituisci
    if (level === 'significant') {
      return {
        action: 'stop_exercise',
        message: response.messageIt,
        alert_level: 'error',
        _painDetectResponse: response
      };
    }

    // SEVERE (9-10): Stop assoluto + professionista
    return {
      action: 'stop_exercise',
      message: `⚠️ Fastidio severo (${painLevel}/10). Ti consigliamo di fermarti e consultare un professionista.`,
      alert_level: 'error',
      _painDetectResponse: response
    };
  }

  /**
   * Valuta il fastidio usando Pain Detect 2.0 direttamente
   * NUOVO METODO - usa questo per nuove implementazioni
   */
  evaluateDiscomfortV2(
    area: BodyArea,
    intensity: DiscomfortIntensity,
    exerciseName?: string,
    alternativeAvailable?: string
  ): DiscomfortResponse {
    const report: DiscomfortReport = {
      id: `eval_${Date.now()}`,
      userId: 'temp',
      sessionId: 'temp',
      area,
      intensity,
      phase: 'during_set',
      exerciseName,
      timestamp: new Date().toISOString()
    };

    return evaluateDiscomfort(report, {
      exerciseName,
      alternativeAvailable
    });
  }

  /**
   * Trova sostituzione per un esercizio
   */
  findSubstitute(
    exerciseName: string,
    painArea: BodyArea,
    intensity: DiscomfortIntensity
  ): { found: boolean; substitute?: string; rationale: string } {
    const result = findSubstitution(exerciseName, painArea, intensity);
    return {
      found: result.found,
      substitute: result.substitute,
      rationale: result.rationaleIt
    };
  }

  /**
   * Applica adattamenti a parametri esercizio
   */
  applyAdaptationsToExercise(
    params: { sets: number; reps: number; weight?: number; restSeconds: number },
    intensity: DiscomfortIntensity,
    location: 'gym' | 'home' = 'gym'
  ) {
    return applyAdaptations(params, intensity, location);
  }

  // =========================================================================
  // THRESHOLD MANAGEMENT
  // =========================================================================

  /**
   * Ottieni soglia sicura per esercizio
   */
  async getPainThreshold(userId: string, exerciseName: string): Promise<PainThreshold | null> {
    try {
      const { data, error } = await supabase
        .from('pain_thresholds')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .maybeSingle();

      if (error) {
        console.error('[PainService] Error fetching threshold:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[PainService] Exception:', error);
      return null;
    }
  }

  /**
   * Aggiorna soglia sicura dopo un set
   */
  async updatePainThreshold(
    userId: string,
    exerciseName: string,
    painLevel: number,
    currentWeight?: number,
    currentReps?: number,
    currentRom?: number
  ): Promise<{ success: boolean }> {
    try {
      const existing = await this.getPainThreshold(userId, exerciseName);
      const now = new Date().toISOString();

      const thresholdData = {
        user_id: userId,
        exercise_name: exerciseName,
        last_pain_level: painLevel,
        last_pain_date: painLevel > 0 ? now : existing?.last_pain_date,
        last_session_date: now,
        total_sessions: (existing?.total_sessions || 0) + 1,
        max_pain_recorded: Math.max(painLevel, existing?.max_pain_recorded || 0),
        consecutive_pain_free_sessions: painLevel <= 3 
          ? (existing?.consecutive_pain_free_sessions || 0) + 1 
          : 0,
        needs_physiotherapist_contact: painLevel >= PAIN_THRESHOLDS.PROFESSIONAL_ADVICE ||
          (existing?.consecutive_pain_free_sessions === 0 && (existing?.total_sessions || 0) >= 3),
        last_safe_weight: painLevel <= 3 ? currentWeight : existing?.last_safe_weight,
        last_safe_reps: painLevel <= 3 ? currentReps : existing?.last_safe_reps,
        last_safe_rom: painLevel <= 3 ? currentRom : existing?.last_safe_rom
      };

      const { error } = await supabase
        .from('pain_thresholds')
        .upsert(thresholdData, { onConflict: 'user_id,exercise_name' });

      if (error) {
        console.error('[PainService] Error updating threshold:', error);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('[PainService] Exception:', error);
      return { success: false };
    }
  }

  // =========================================================================
  // HISTORY & RECOVERY
  // =========================================================================

  /**
   * Ottieni storico dolore per esercizio
   */
  async getPainHistory(userId: string, exerciseName: string, limit: number = 10): Promise<PainLog[]> {
    try {
      const { data, error } = await supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('session_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[PainService] Error fetching history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[PainService] Exception:', error);
      return [];
    }
  }

  /**
   * Verifica se attivare hybrid recovery mode
   */
  async shouldActivateHybridRecovery(
    userId: string,
    exerciseName: string
  ): Promise<{ shouldActivate: boolean; reason?: string; sessions: number; avgPain: number }> {
    try {
      const history = await this.getPainHistory(userId, exerciseName, 10);

      if (history.length < 2) {
        return { shouldActivate: false, sessions: 0, avgPain: 0 };
      }

      // Raggruppa per sessione (data)
      const sessionGroups = new Map<string, PainLog[]>();
      history.forEach(log => {
        const date = log.session_date?.split('T')[0];
        if (!date) return;
        if (!sessionGroups.has(date)) sessionGroups.set(date, []);
        sessionGroups.get(date)!.push(log);
      });

      // Analizza ultime sessioni
      const recentSessions = Array.from(sessionGroups.values())
        .slice(0, 3)
        .map(logs => ({
          avgPain: logs.reduce((sum, log) => sum + log.pain_level, 0) / logs.length,
          maxPain: Math.max(...logs.map(l => l.pain_level)),
          count: logs.length
        }));

      if (recentSessions.length < 2) {
        return { shouldActivate: false, sessions: 0, avgPain: 0 };
      }

      // Check: Dolore moderato persistente (4-6) per 2+ sessioni
      const persistentPainSessions = recentSessions.filter(
        s => s.avgPain >= 4 && s.avgPain <= 6
      );

      if (persistentPainSessions.length >= 2) {
        const avgPain = persistentPainSessions.reduce((sum, s) => sum + s.avgPain, 0) / persistentPainSessions.length;
        return {
          shouldActivate: true,
          reason: `Fastidio moderato persistente (${avgPain.toFixed(1)}/10) per ${persistentPainSessions.length} sessioni. Ti proponiamo un protocollo di recupero.`,
          sessions: persistentPainSessions.length,
          avgPain
        };
      }

      // Check: Dolore alto (≥7) in 2+ sessioni
      const highPainSessions = recentSessions.filter(s => s.maxPain >= 7);
      if (highPainSessions.length >= 2) {
        return {
          shouldActivate: true,
          reason: `Fastidio significativo (≥7/10) per ${highPainSessions.length} sessioni. Consigliamo un periodo di recupero e consulto professionale.`,
          sessions: highPainSessions.length,
          avgPain: highPainSessions.reduce((sum, s) => sum + s.maxPain, 0) / highPainSessions.length
        };
      }

      return { shouldActivate: false, sessions: 0, avgPain: 0 };
    } catch (error) {
      console.error('[PainService] Exception:', error);
      return { shouldActivate: false, sessions: 0, avgPain: 0 };
    }
  }

  // =========================================================================
  // MOBILITY PROTOCOLS
  // =========================================================================

  /**
   * Ottieni protocollo mobilità per zona dolente
   */
  getMobilityProtocol(painArea: string): {
    name: string;
    mobility: Array<{ name: string; sets: number; duration?: string; reps?: string }>;
    reinforcement: Array<{ name: string; sets: number; reps: string }>;
  } {
    const protocols: Record<string, any> = {
      lower_back: {
        name: 'Mobility Protocol - Lombare',
        mobility: [
          { name: 'Cat-Cow', sets: 2, duration: '60 secondi' },
          { name: 'Child\'s Pose', sets: 2, duration: '45 secondi' },
          { name: 'Thread the Needle', sets: 2, duration: '30 secondi per lato' }
        ],
        reinforcement: [
          { name: 'Dead Bug', sets: 3, reps: '10 per lato' },
          { name: 'Bird Dog', sets: 3, reps: '8 per lato' },
          { name: 'Glute Bridge', sets: 3, reps: '12-15' }
        ]
      },
      knee: {
        name: 'Mobility Protocol - Ginocchio',
        mobility: [
          { name: 'Quad Stretch', sets: 2, duration: '45 secondi per lato' },
          { name: 'Half Kneeling Hip Flexor Stretch', sets: 2, duration: '45 secondi per lato' },
          { name: 'Foam Roll Quads/IT Band', sets: 2, duration: '60 secondi per lato' }
        ],
        reinforcement: [
          { name: 'Terminal Knee Extension (TKE)', sets: 3, reps: '12-15' },
          { name: 'Single Leg Balance', sets: 3, reps: '30 secondi per lato' },
          { name: 'Step-up controllato', sets: 3, reps: '8-10 per lato' }
        ]
      },
      shoulder: {
        name: 'Mobility Protocol - Spalla',
        mobility: [
          { name: 'Shoulder Circles', sets: 2, duration: '30 secondi per direzione' },
          { name: 'Wall Slides', sets: 2, reps: '10-12' },
          { name: 'Cross Body Stretch', sets: 2, duration: '30 secondi per lato' }
        ],
        reinforcement: [
          { name: 'Face Pull', sets: 3, reps: '15-20' },
          { name: 'External Rotation', sets: 3, reps: '12-15 per lato' },
          { name: 'Prone Y-T-W', sets: 2, reps: '8 per posizione' }
        ]
      },
      hip: {
        name: 'Mobility Protocol - Anca',
        mobility: [
          { name: '90/90 Hip Stretch', sets: 2, duration: '60 secondi per lato' },
          { name: 'Pigeon Pose', sets: 2, duration: '45 secondi per lato' },
          { name: 'Hip Circles', sets: 2, duration: '10 cerchi per direzione' }
        ],
        reinforcement: [
          { name: 'Clamshell', sets: 3, reps: '12-15 per lato' },
          { name: 'Fire Hydrant', sets: 3, reps: '10-12 per lato' },
          { name: 'Glute Bridge', sets: 3, reps: '12-15' }
        ]
      },
      ankle: {
        name: 'Mobility Protocol - Caviglia',
        mobility: [
          { name: 'Ankle Circles', sets: 2, duration: '30 secondi per direzione' },
          { name: 'Calf Stretch (muro)', sets: 2, duration: '45 secondi per lato' },
          { name: 'Dorsiflexion Mobilization', sets: 2, duration: '30 secondi per lato' }
        ],
        reinforcement: [
          { name: 'Single Leg Calf Raise', sets: 3, reps: '12-15 per lato' },
          { name: 'Tibialis Anterior Raise', sets: 3, reps: '15-20' },
          { name: 'Balance Reach', sets: 3, reps: '8 per direzione' }
        ]
      },
      elbow: {
        name: 'Mobility Protocol - Gomito',
        mobility: [
          { name: 'Stretching Bicipiti', sets: 2, duration: '45 secondi' },
          { name: 'Stretching Tricipiti', sets: 2, duration: '45 secondi' },
          { name: 'Pronazione/Supinazione', sets: 2, duration: '15 ripetizioni' }
        ],
        reinforcement: [
          { name: 'Hammer Curl leggero', sets: 3, reps: '12-15' },
          { name: 'Reverse Curl', sets: 3, reps: '10-12' },
          { name: 'Wrist Curl', sets: 3, reps: '15-20' }
        ]
      },
      wrist: {
        name: 'Mobility Protocol - Polso',
        mobility: [
          { name: 'Wrist Circles', sets: 2, duration: '30 secondi per direzione' },
          { name: 'Prayer Stretch', sets: 2, duration: '30 secondi' },
          { name: 'Reverse Prayer Stretch', sets: 2, duration: '30 secondi' }
        ],
        reinforcement: [
          { name: 'Wrist Curl', sets: 3, reps: '15-20' },
          { name: 'Reverse Wrist Curl', sets: 3, reps: '15-20' },
          { name: 'Finger Extensions', sets: 3, reps: '15-20' }
        ]
      },
      neck: {
        name: 'Mobility Protocol - Collo',
        mobility: [
          { name: 'Neck Rotations', sets: 2, duration: '30 secondi per direzione' },
          { name: 'Lateral Neck Stretch', sets: 2, duration: '30 secondi per lato' },
          { name: 'Chin Tucks', sets: 2, reps: '10-12' }
        ],
        reinforcement: [
          { name: 'Isometric Neck Hold', sets: 3, reps: '10 secondi per direzione' },
          { name: 'Prone Neck Extension', sets: 3, reps: '10-12' },
          { name: 'Wall Angels', sets: 3, reps: '10-12' }
        ]
      }
    };

    return protocols[painArea] || protocols['lower_back'];
  }

  // =========================================================================
  // CONSTANTS & UTILITIES
  // =========================================================================

  /**
   * Disclaimer da mostrare all'utente
   */
  get disclaimer(): { it: string; en: string } {
    return PAIN_DETECT_DISCLAIMER;
  }

  /**
   * Soglie Pain Detect
   */
  get thresholds() {
    return PAIN_THRESHOLDS;
  }

  /**
   * Labels aree del corpo
   */
  get bodyAreaLabels() {
    return BODY_AREA_LABELS;
  }

  /**
   * Classifica il livello di fastidio
   */
  classifyPain(intensity: number): 'none' | 'mild' | 'moderate' | 'significant' | 'severe' {
    return classifyDiscomfort(intensity as DiscomfortIntensity);
  }
}

// Export singleton instance
export const painManagementService = new PainManagementService();
export default painManagementService;

// Re-export tipi e costanti dal nuovo sistema per uso diretto
export {
  PAIN_THRESHOLDS,
  LOAD_REDUCTIONS,
  BODY_AREA_LABELS,
  PAIN_DETECT_DISCLAIMER,
  classifyDiscomfort,
  evaluateDiscomfort,
  applyAdaptations,
  findSubstitution,
  getLoadReductions
} from '@trainsmart/shared';

export type {
  DiscomfortIntensity,
  DiscomfortResponse,
  BodyArea,
  UserChoice
} from '@trainsmart/shared';
