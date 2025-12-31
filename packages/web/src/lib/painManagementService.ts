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
        .maybeSingle();

      if (error) {
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
   * NUOVA LOGICA INTELLIGENTE:
   * - Dolore 0-3: ✅ Continua normale, considera progressione
   * - Dolore 4-5: ⚠️ Riduzione carico, mantieni volume
   *   - FORZA: -20% peso, +2-3 reps (compensi con volume)
   *   - MASSA/ENDURANCE: -20% peso, mantieni reps
   * - Dolore 5 persistente (2-3 set): 🔄 Mobility Protocol
   * - Dolore 6+: 🔄 Exercise Substitution (variante meno stressante)
   * - Dolore 7-10: ❌ Stop + consiglia fisioterapista
   */
  suggestAdaptation(
    painLevel: number,
    currentWeight: number,
    currentReps: number,
    currentRom: number,
    previousAdaptations: Adaptation[],
    goal?: string // 'forza', 'massa', 'endurance', etc.
  ): AdaptationSuggestion {
    // DOLORE 0-3: OK, continua
    if (painLevel <= 3) {
      return {
        action: 'continue',
        message: `✅ Dolore minimo (${painLevel}/10). Continua con i parametri attuali.`,
        alert_level: 'success'
      };
    }

    // DOLORE 7-10: STOP immediato + fisioterapista
    if (painLevel >= 7) {
      return {
        action: 'stop_exercise',
        message: `❌ DOLORE ALTO (${painLevel}/10). SOSPENDI esercizio e contatta fisioterapista.`,
        alert_level: 'error'
      };
    }

    // DOLORE 6: Exercise substitution (variante meno stressante)
    if (painLevel === 6) {
      return {
        action: 'stop_exercise', // Will be handled by LiveWorkout with substitution
        message: `🔄 Dolore ${painLevel}/10. Passa a variante meno stressante (es: Leg Press invece Squat).`,
        alert_level: 'warning'
      };
    }

    // DOLORE 4-5: Riduzione carico, mantieni volume
    const hasReducedWeight = previousAdaptations.some(a => a.type === 'weight_reduced');
    const isForza = goal?.toLowerCase().includes('forza') || goal?.toLowerCase().includes('strength');

    // Step 1: Riduci peso (-20%)
    if (!hasReducedWeight) {
      const newWeight = Math.max(0, currentWeight * 0.8);

      if (isForza) {
        // FORZA: Compensa con volume (+2-3 reps)
        const newReps = currentReps + 3;
        return {
          action: 'reduce_weight',
          message: `⚠️ Dolore ${painLevel}/10. Riduci carico -20%, aumenta reps a ${newReps} (mantieni volume).`,
          new_weight: Math.round(newWeight * 10) / 10,
          new_reps: newReps,
          alert_level: 'warning'
        };
      } else {
        // MASSA/ENDURANCE: Mantieni reps
        return {
          action: 'reduce_weight',
          message: `⚠️ Dolore ${painLevel}/10. Riduci carico -20%, mantieni ripetizioni.`,
          new_weight: Math.round(newWeight * 10) / 10,
          alert_level: 'warning'
        };
      }
    }

    // Step 2: Dolore persiste a 5 → Mobility Protocol
    if (painLevel === 5 && hasReducedWeight) {
      return {
        action: 'stop_exercise', // Will trigger mobility protocol
        message: `🔄 Dolore persiste a 5/10. Passa a MOBILITY PROTOCOL: mobilità + rinforzo zona specifica.`,
        alert_level: 'warning'
      };
    }

    // Step 3: Dolore scende (4) dopo riduzione → continua con progressione graduale
    if (painLevel === 4 && hasReducedWeight) {
      return {
        action: 'continue',
        message: `📈 Dolore in diminuzione (4/10). Continua con carichi ridotti. Prossima sessione: +5% peso.`,
        alert_level: 'success'
      };
    }

    // Default: continua monitorando
    return {
      action: 'continue',
      message: `⚠️ Dolore ${painLevel}/10. Continua monitorando. Se persiste, passa a variante.`,
      alert_level: 'warning'
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

  /**
   * EXERCISE SUBSTITUTIONS - Varianti meno stressanti per dolore 6+
   * Sostituisce esercizi ad alto carico con varianti biomeccanicamente più sicure
   */
  getExerciseSubstitution(exerciseName: string, painArea: string): { name: string; notes: string } | null {
    const substitutions: Record<string, Record<string, { name: string; notes: string }>> = {
      // LOWER BODY - Dolore schiena/ginocchio/anca
      'Back Squat': {
        lower_back: { name: 'Leg Press', notes: 'Riduce stress lombare, mantieni range controllato' },
        knee: { name: 'Goblet Squat', notes: 'ROM ridotto, focus su controllo' },
        hip: { name: 'Box Squat', notes: 'Profondità controllata, riduce stress anca' }
      },
      'Deadlift': {
        lower_back: { name: 'Leg Extension + Leg Curl', notes: 'Isola quadricipiti e femorali, zero stress lombare' },
        knee: { name: 'RDL leggero', notes: 'ROM parziale, focus su femorali' },
        hip: { name: 'Hip Thrust', notes: 'Movimento più controllato, meno stress articolare' }
      },
      'Stacco': {
        lower_back: { name: 'Leg Extension + Leg Curl', notes: 'Isola quadricipiti e femorali, zero stress lombare' },
        knee: { name: 'RDL leggero', notes: 'ROM parziale, focus su femorali' }
      },
      'Squat (Bilanciere)': {
        lower_back: { name: 'Leg Press', notes: 'Riduce stress lombare' },
        knee: { name: 'Goblet Squat', notes: 'ROM controllato' }
      },

      // UPPER BODY - Dolore spalla/gomito
      'Bench Press': {
        shoulder: { name: 'Push-up su ginocchia', notes: 'Riduce carico, mantieni volume' },
        elbow: { name: 'Chest Press Manubri', notes: 'ROM più naturale, meno stress articolare' }
      },
      'Panca Piana': {
        shoulder: { name: 'Push-up', notes: 'Carico corporeo, più sicuro' },
        elbow: { name: 'Chest Press Manubri', notes: 'ROM controllato' }
      },
      'Military Press': {
        shoulder: { name: 'Lateral Raise leggero', notes: 'Isola deltoidi, riduce carico' },
        elbow: { name: 'Arnold Press seduto', notes: 'ROM più naturale' }
      },
      'Pull-up': {
        shoulder: { name: 'Lat Pulldown', notes: 'Carico controllato' },
        elbow: { name: 'Band Pull-apart', notes: 'Focus su upper back, zero stress gomiti' }
      },
      'Trazioni': {
        shoulder: { name: 'Lat Pulldown', notes: 'Carico controllato' },
        elbow: { name: 'Inverted Row', notes: 'Angolo più favorevole' }
      }
    };

    const exerciseSubs = substitutions[exerciseName];
    if (!exerciseSubs) return null;

    return exerciseSubs[painArea] || null;
  }

  /**
   * MOBILITY PROTOCOLS - Per dolore persistente a 5/10
   * Protocolli specifici per zona: mobilità → rinforzo
   */
  getMobilityProtocol(painArea: string): {
    name: string;
    mobility: { name: string; sets: number; duration: string }[];
    reinforcement: { name: string; sets: number; reps: number | string }[];
  } {
    const protocols: Record<string, any> = {
      lower_back: {
        name: 'Mobility Protocol - Schiena Bassa',
        mobility: [
          { name: 'Cat-Cow', sets: 2, duration: '60 secondi' },
          { name: 'Child Pose', sets: 2, duration: '45 secondi' },
          { name: 'Antero-Retroversione Bacino', sets: 2, duration: '60 secondi' }
        ],
        reinforcement: [
          { name: 'Dead Bug', sets: 3, reps: '8-10 per lato' },
          { name: 'Bird Dog', sets: 3, reps: '6-8 per lato' },
          { name: 'Plank', sets: 3, reps: '20-30 secondi' }
        ]
      },
      shoulder: {
        name: 'Mobility Protocol - Spalla',
        mobility: [
          { name: 'Circonduzione spalle', sets: 2, duration: '60 secondi' },
          { name: 'Wall Slides', sets: 2, duration: '10 ripetizioni' },
          { name: 'Band Pull-Apart', sets: 2, duration: '15 ripetizioni' }
        ],
        reinforcement: [
          { name: 'Scapular Push-up', sets: 3, reps: '8-10' },
          { name: 'Y-T-W', sets: 3, reps: '6 per lettera' },
          { name: 'Face Pull leggero', sets: 3, reps: '12-15' }
        ]
      },
      knee: {
        name: 'Mobility Protocol - Ginocchio',
        mobility: [
          { name: 'Foam Roll Quadricipiti', sets: 2, duration: '60 secondi per lato' },
          { name: 'Flessione/Estensione attiva', sets: 2, duration: '15 ripetizioni' },
          { name: 'Squat ROM ridotto', sets: 2, duration: '10 ripetizioni controllate' }
        ],
        reinforcement: [
          { name: 'Terminal Knee Extension (TKE)', sets: 3, reps: '12-15' },
          { name: 'Single Leg Balance', sets: 3, reps: '30 secondi per lato' },
          { name: 'Step-up controllato', sets: 3, reps: '8-10 per lato' }
        ]
      },
      hip: {
        name: 'Mobility Protocol - Anca',
        mobility: [
          { name: '90/90 Hip Stretch', sets: 2, duration: '60 secondi per lato' },
          { name: 'Pigeon Pose', sets: 2, duration: '45 secondi per lato' },
          { name: 'Hip Circle', sets: 2, duration: '10 cerchi per direzione' }
        ],
        reinforcement: [
          { name: 'Clamshell', sets: 3, reps: '12-15 per lato' },
          { name: 'Fire Hydrant', sets: 3, reps: '10-12 per lato' },
          { name: 'Glute Bridge', sets: 3, reps: '12-15' }
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
      }
    };

    return protocols[painArea] || protocols['lower_back']; // Default a lower_back
  }
}

// Export singleton instance
export const painManagementService = new PainManagementService();
export default painManagementService;
