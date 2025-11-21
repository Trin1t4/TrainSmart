/**
 * PAIN MANAGEMENT SERVICE
 *
 * Sistema intelligente per recupero motorio con feedback dolore real-time:
 * - Traccia dolore per ogni set
 * - Adatta automaticamente carico/reps/ROM
 * - Memorizza soglie sicure
 * - Suggerisce progressioni quando dolore assente
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

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
  rpe?: number; // 1-10
  pain_location?: string;
  adaptations?: Adaptation[];
  notes?: string;
}

export interface Adaptation {
  type: 'weight_reduced' | 'reps_reduced' | 'rom_reduced' | 'exercise_stopped';
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

export interface AdaptationSuggestion {
  action: 'continue' | 'reduce_weight' | 'reduce_reps' | 'reduce_rom' | 'stop_exercise';
  message: string;
  new_weight?: number;
  new_reps?: number;
  new_rom?: number;
  alert_level: 'success' | 'warning' | 'error';
}

// ============================================================================
// PAIN MANAGEMENT SERVICE
// ============================================================================

class PainManagementService {
  /**
   * Log dolore dopo un set
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
        console.error('Error logging pain:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Pain logged successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Exception logging pain:', error);
      return { success: false, error: String(error) };
    }
  }

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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - normale per primo utilizzo
          return null;
        }
        console.error('Error fetching pain threshold:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching pain threshold:', error);
      return null;
    }
  }

  /**
   * Suggerisce adattamento basato su livello dolore
   *
   * LOGICA:
   * - Dolore 0-3: ✅ Continua normale
   * - Dolore 4-6: ⚠️ Riduzione progressiva (peso → reps → ROM)
   * - Dolore 7-10: ❌ Stop o riduzione ROM drastica
   */
  suggestAdaptation(
    painLevel: number,
    currentWeight: number,
    currentReps: number,
    currentRom: number,
    previousAdaptations: Adaptation[]
  ): AdaptationSuggestion {
    // DOLORE 0-3: OK, continua
    if (painLevel <= 3) {
      return {
        action: 'continue',
        message: `✅ Dolore minimo (${painLevel}/10). Continua con i parametri attuali.`,
        alert_level: 'success'
      };
    }

    // DOLORE 7-10: STOP o riduzione ROM drastica
    if (painLevel >= 7) {
      // Se già ridotto ROM, stop
      if (currentRom < 100) {
        return {
          action: 'stop_exercise',
          message: `❌ DOLORE ALTO (${painLevel}/10). Sospendi esercizio e contatta fisioterapista.`,
          alert_level: 'error'
        };
      }

      // Altrimenti riduci ROM al 50%
      return {
        action: 'reduce_rom',
        message: `⚠️ DOLORE ALTO (${painLevel}/10). Riduci ROM al 50% (es: half squat). Se persiste, sospendi.`,
        new_rom: 50,
        alert_level: 'error'
      };
    }

    // DOLORE 4-6: Riduzione progressiva
    const hasReducedWeight = previousAdaptations.some(a => a.type === 'weight_reduced');
    const hasReducedReps = previousAdaptations.some(a => a.type === 'reps_reduced');
    const hasReducedRom = previousAdaptations.some(a => a.type === 'rom_reduced');

    // Step 1: Riduci peso (-20%)
    if (!hasReducedWeight) {
      const newWeight = Math.max(0, currentWeight * 0.8);
      return {
        action: 'reduce_weight',
        message: `⚠️ Dolore moderato (${painLevel}/10). Riduci carico del 20%.`,
        new_weight: Math.round(newWeight * 10) / 10, // Arrotonda a 0.1kg
        alert_level: 'warning'
      };
    }

    // Step 2: Riduci reps (-3)
    if (!hasReducedReps) {
      const newReps = Math.max(3, currentReps - 3);
      return {
        action: 'reduce_reps',
        message: `⚠️ Dolore persiste (${painLevel}/10). Riduci ripetizioni a ${newReps}.`,
        new_reps: newReps,
        alert_level: 'warning'
      };
    }

    // Step 3: Riduci ROM (50%)
    if (!hasReducedRom) {
      return {
        action: 'reduce_rom',
        message: `⚠️ Dolore persiste (${painLevel}/10). Riduci ROM al 50% (es: half range).`,
        new_rom: 50,
        alert_level: 'warning'
      };
    }

    // Step 4: Tutto provato, stop
    return {
      action: 'stop_exercise',
      message: `❌ Dolore persiste dopo tutte le riduzioni (${painLevel}/10). Sospendi esercizio e contatta fisioterapista.`,
      alert_level: 'error'
    };
  }

  /**
   * Calcola progressione suggerita se dolore assente
   *
   * Se dolore 0-3 per 2+ sessioni consecutive → aumenta carico/reps
   */
  async suggestProgression(
    userId: string,
    exerciseName: string,
    currentWeight: number,
    currentReps: number
  ): Promise<{ shouldProgress: boolean; suggestion?: string; newWeight?: number; newReps?: number }> {
    try {
      const threshold = await this.getPainThreshold(userId, exerciseName);

      if (!threshold) {
        return { shouldProgress: false };
      }

      // Se dolore recente, no progressione
      if (threshold.last_pain_level > 3) {
        return { shouldProgress: false };
      }

      // Progressione dopo 2+ sessioni senza dolore
      if (threshold.consecutive_pain_free_sessions >= 2) {
        // Aumenta peso del 5-10%
        const newWeight = Math.round(currentWeight * 1.05 * 10) / 10;

        return {
          shouldProgress: true,
          suggestion: `💪 ${threshold.consecutive_pain_free_sessions} sessioni senza dolore! Suggerito aumento carico +5%.`,
          newWeight: newWeight
        };
      }

      return { shouldProgress: false };
    } catch (error) {
      console.error('Error calculating progression:', error);
      return { shouldProgress: false };
    }
  }

  /**
   * Ottieni esercizi che necessitano attenzione fisioterapista
   */
  async getExercisesNeedingAttention(userId: string): Promise<PainThreshold[]> {
    try {
      const { data, error } = await supabase
        .from('pain_thresholds')
        .select('*')
        .eq('user_id', userId)
        .or('last_pain_level.gte.4,needs_physiotherapist_contact.eq.true')
        .order('last_pain_date', { ascending: false });

      if (error) {
        console.error('Error fetching exercises needing attention:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching exercises needing attention:', error);
      return [];
    }
  }

  /**
   * Marca fisioterapista contattato
   */
  async markPhysiotherapistContacted(userId: string, exerciseName: string): Promise<void> {
    try {
      await supabase
        .from('pain_thresholds')
        .update({
          needs_physiotherapist_contact: false,
          physiotherapist_contacted_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName);

      console.log('✅ Fisioterapista marcato come contattato per', exerciseName);
    } catch (error) {
      console.error('Error marking physiotherapist contacted:', error);
    }
  }

  /**
   * Ottieni storico dolore per esercizio (per grafici)
   */
  async getPainHistory(userId: string, exerciseName: string, limit = 20): Promise<PainLog[]> {
    try {
      const { data, error } = await supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('session_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching pain history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching pain history:', error);
      return [];
    }
  }

  /**
   * Detecta dolore persistente multi-sessione
   *
   * TRIGGER: 2+ sedute consecutive con dolore 4-6 simile
   * → Proponi attivazione recovery mode in itinere
   */
  async shouldActivateHybridRecovery(
    userId: string,
    exerciseName: string
  ): Promise<{ shouldActivate: boolean; reason?: string; sessions: number; avgPain: number }> {
    try {
      // Ottieni ultime 3 sessioni per questo esercizio
      const history = await this.getPainHistory(userId, exerciseName, 10);

      if (history.length < 2) {
        return { shouldActivate: false, sessions: 0, avgPain: 0 };
      }

      // Raggruppa per sessione (data)
      const sessionGroups = new Map<string, PainLog[]>();
      history.forEach(log => {
        const date = log.session_date?.split('T')[0]; // Solo data, no ora
        if (!date) return;

        if (!sessionGroups.has(date)) {
          sessionGroups.set(date, []);
        }
        sessionGroups.get(date)!.push(log);
      });

      // Prendi ultime 2-3 sessioni distinte
      const recentSessions = Array.from(sessionGroups.values())
        .slice(0, 3)
        .map(logs => {
          // Calcola dolore medio per sessione
          const avgPain = logs.reduce((sum, log) => sum + log.pain_level, 0) / logs.length;
          const maxPain = Math.max(...logs.map(l => l.pain_level));
          return { avgPain, maxPain, count: logs.length };
        });

      if (recentSessions.length < 2) {
        return { shouldActivate: false, sessions: 0, avgPain: 0 };
      }

      // Check: Dolore persistente 4-6 per 2+ sessioni
      const persistentPainSessions = recentSessions.filter(
        session => session.avgPain >= 4 && session.avgPain <= 6
      );

      if (persistentPainSessions.length >= 2) {
        const avgPainAcrossSessions =
          persistentPainSessions.reduce((sum, s) => sum + s.avgPain, 0) / persistentPainSessions.length;

        return {
          shouldActivate: true,
          reason: `Dolore persistente ${avgPainAcrossSessions.toFixed(1)}/10 per ${persistentPainSessions.length} sessioni consecutive. Sistema suggerisce recovery mode in itinere per recupero mirato.`,
          sessions: persistentPainSessions.length,
          avgPain: avgPainAcrossSessions
        };
      }

      // Check alternativo: Dolore alto (≥7) in 2+ sessioni
      const highPainSessions = recentSessions.filter(session => session.maxPain >= 7);

      if (highPainSessions.length >= 2) {
        return {
          shouldActivate: true,
          reason: `Dolore alto (≥7/10) per ${highPainSessions.length} sessioni. Recovery mode urgente raccomandato.`,
          sessions: highPainSessions.length,
          avgPain: highPainSessions.reduce((sum, s) => sum + s.maxPain, 0) / highPainSessions.length
        };
      }

      return { shouldActivate: false, sessions: 0, avgPain: 0 };
    } catch (error) {
      console.error('Error checking hybrid recovery criteria:', error);
      return { shouldActivate: false, sessions: 0, avgPain: 0 };
    }
  }
}

// Export singleton instance
export const painManagementService = new PainManagementService();
export default painManagementService;
