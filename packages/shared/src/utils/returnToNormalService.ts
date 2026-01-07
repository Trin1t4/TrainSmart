/**
 * RETURN TO NORMAL SERVICE - DCSS Paradigm
 * 
 * Servizio per gestire il ritorno progressivo ai carichi normali
 * dopo un periodo di adattamento per fastidio.
 * 
 * PRINCIPI:
 * 1. Progressione graduale (non salti improvvisi)
 * 2. Celebrazione dei progressi (rinforzo positivo)
 * 3. Scelta sempre all'utente
 * 4. Tracking trasparente
 * 5. Educazione integrata
 */

// Note: This service requires supabase client to be passed or configured
// The actual supabase client should be imported from the app that uses this service
// For now, we export types and pure functions; the class methods need supabase injected

// Placeholder - will be set by the consuming app
let supabase: any = null;

export function setSupabaseClient(client: any) {
  supabase = client;
}

// ============================================================================
// TYPES
// ============================================================================

export interface RecoveryProgress {
  id?: string;
  user_id: string;
  exercise_name: string;
  body_area: string;
  
  // Timeline
  started_at: string;
  last_updated: string;
  completed_at?: string;
  
  // Progress tracking
  current_load_percentage: number;  // Es. 80 = 80% del carico originale
  target_load_percentage: number;   // Sempre 100
  sessions_at_current_load: number;
  sessions_without_discomfort: number;
  
  // History
  progression_history: ProgressionStep[];
  
  // Status
  status: 'in_progress' | 'completed' | 'paused' | 'regressed';
  
  // Original context
  original_discomfort_level: number;
  original_load?: number;
}

export interface ProgressionStep {
  date: string;
  from_percentage: number;
  to_percentage: number;
  reason: 'scheduled' | 'user_ready' | 'discomfort_free' | 'regression';
  discomfort_reported: boolean;
  discomfort_level?: number;
  notes?: string;
}

export interface ProgressionSuggestion {
  canProgress: boolean;
  suggestedPercentage: number;
  reason: string;
  reasonIt: string;
  userChoice: boolean;  // Se true, chiedi all'utente
  celebrationMessage?: string;
  celebrationMessageIt?: string;
}

export interface ReturnToNormalResult {
  isComplete: boolean;
  currentPercentage: number;
  sessionsWithoutDiscomfort: number;
  nextStep: string;
  nextStepIt: string;
  showCelebration: boolean;
  celebrationMessage?: string;
  celebrationMessageIt?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Soglie per la progressione
 * Basate su principi di esposizione graduale
 */
export const PROGRESSION_CONFIG = {
  // Sessioni richieste a ogni livello prima di progredire
  SESSIONS_REQUIRED_PER_LEVEL: 2,
  
  // Incrementi di carico (percentuale)
  LOAD_INCREMENT: 10,  // +10% per step
  
  // Percentuali di partenza basate su intensità fastidio iniziale
  STARTING_PERCENTAGE: {
    mild: 90,      // 1-3: parti dal 90%
    moderate: 80,  // 4-6: parti dall'80%
    significant: 70, // 7: parti dal 70%
    severe: 60     // 8+: parti dal 60%
  },
  
  // Minimo per considerare "ritorno al normale"
  TARGET_PERCENTAGE: 100
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcola la percentuale di partenza basata sul livello di fastidio
 */
export function calculateStartingPercentage(discomfortLevel: number): number {
  if (discomfortLevel <= 3) return PROGRESSION_CONFIG.STARTING_PERCENTAGE.mild;
  if (discomfortLevel <= 6) return PROGRESSION_CONFIG.STARTING_PERCENTAGE.moderate;
  if (discomfortLevel === 7) return PROGRESSION_CONFIG.STARTING_PERCENTAGE.significant;
  return PROGRESSION_CONFIG.STARTING_PERCENTAGE.severe;
}

/**
 * Determina se l'utente può progredire al prossimo livello
 */
export function canProgressToNextLevel(progress: RecoveryProgress): ProgressionSuggestion {
  const { 
    current_load_percentage, 
    sessions_without_discomfort,
    sessions_at_current_load 
  } = progress;
  
  // Già al 100%? Completato!
  if (current_load_percentage >= 100) {
    return {
      canProgress: false,
      suggestedPercentage: 100,
      reason: 'Already at full capacity',
      reasonIt: 'Già a piena capacità',
      userChoice: false,
      celebrationMessage: `🎉 You've returned to full capacity on ${progress.exercise_name}!`,
      celebrationMessageIt: `🎉 Sei tornato a piena capacità su ${progress.exercise_name}!`
    };
  }
  
  // Non abbastanza sessioni senza fastidio
  if (sessions_without_discomfort < PROGRESSION_CONFIG.SESSIONS_REQUIRED_PER_LEVEL) {
    const remaining = PROGRESSION_CONFIG.SESSIONS_REQUIRED_PER_LEVEL - sessions_without_discomfort;
    return {
      canProgress: false,
      suggestedPercentage: current_load_percentage,
      reason: `Need ${remaining} more discomfort-free session(s) at current load`,
      reasonIt: `Servono altre ${remaining} sessione/i senza fastidio al carico attuale`,
      userChoice: false
    };
  }
  
  // Pronto per progredire!
  const nextPercentage = Math.min(100, current_load_percentage + PROGRESSION_CONFIG.LOAD_INCREMENT);
  
  return {
    canProgress: true,
    suggestedPercentage: nextPercentage,
    reason: `${sessions_without_discomfort} sessions without discomfort. Ready for ${nextPercentage}%!`,
    reasonIt: `${sessions_without_discomfort} sessioni senza fastidio. Pronto per il ${nextPercentage}%!`,
    userChoice: true,  // Chiedi conferma all'utente
    celebrationMessage: nextPercentage === 100 
      ? `🎉 Ready to return to full capacity!`
      : `📈 Great progress! Ready to increase to ${nextPercentage}%`,
    celebrationMessageIt: nextPercentage === 100
      ? `🎉 Pronto per tornare a piena capacità!`
      : `📈 Ottimi progressi! Pronto per aumentare al ${nextPercentage}%`
  };
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class ReturnToNormalService {
  /**
   * Inizia il tracking del recupero per un esercizio
   */
  async startRecoveryTracking(
    userId: string,
    exerciseName: string,
    bodyArea: string,
    discomfortLevel: number,
    originalLoad?: number
  ): Promise<RecoveryProgress | null> {
    const startingPercentage = calculateStartingPercentage(discomfortLevel);
    
    const progress: Omit<RecoveryProgress, 'id'> = {
      user_id: userId,
      exercise_name: exerciseName,
      body_area: bodyArea,
      started_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      current_load_percentage: startingPercentage,
      target_load_percentage: 100,
      sessions_at_current_load: 0,
      sessions_without_discomfort: 0,
      progression_history: [{
        date: new Date().toISOString(),
        from_percentage: 100,
        to_percentage: startingPercentage,
        reason: 'scheduled',
        discomfort_reported: true,
        discomfort_level: discomfortLevel,
        notes: `Started recovery at ${startingPercentage}% due to ${discomfortLevel}/10 discomfort`
      }],
      status: 'in_progress',
      original_discomfort_level: discomfortLevel,
      original_load: originalLoad
    };
    
    try {
      const { data, error } = await supabase
        .from('recovery_progress')
        .insert(progress)
        .select()
        .single();
      
      if (error) {
        console.error('Error starting recovery tracking:', error);
        return null;
      }
      
      console.log(`✅ Started recovery tracking for ${exerciseName} at ${startingPercentage}%`);
      return data;
    } catch (error) {
      console.error('Exception starting recovery tracking:', error);
      return null;
    }
  }
  
  /**
   * Registra una sessione completata
   */
  async recordSession(
    userId: string,
    exerciseName: string,
    hadDiscomfort: boolean,
    discomfortLevel?: number
  ): Promise<ReturnToNormalResult | null> {
    try {
      // Ottieni il progress corrente
      const { data: progress, error } = await supabase
        .from('recovery_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('status', 'in_progress')
        .single();
      
      if (error || !progress) {
        // Nessun recovery in corso per questo esercizio
        return null;
      }
      
      // Aggiorna contatori
      let updatedProgress = { ...progress } as RecoveryProgress;
      updatedProgress.sessions_at_current_load += 1;
      updatedProgress.last_updated = new Date().toISOString();
      
      if (hadDiscomfort && discomfortLevel && discomfortLevel >= 4) {
        // Fastidio significativo: reset contatore, possibile regressione
        updatedProgress.sessions_without_discomfort = 0;
        
        // Se fastidio alto, regredisci
        if (discomfortLevel >= 6) {
          const newPercentage = Math.max(60, updatedProgress.current_load_percentage - PROGRESSION_CONFIG.LOAD_INCREMENT);
          updatedProgress.progression_history.push({
            date: new Date().toISOString(),
            from_percentage: updatedProgress.current_load_percentage,
            to_percentage: newPercentage,
            reason: 'regression',
            discomfort_reported: true,
            discomfort_level: discomfortLevel,
            notes: `Regressed due to ${discomfortLevel}/10 discomfort`
          });
          updatedProgress.current_load_percentage = newPercentage;
          updatedProgress.sessions_at_current_load = 0;
        }
      } else {
        // Nessun fastidio significativo: incrementa contatore
        updatedProgress.sessions_without_discomfort += 1;
      }
      
      // Verifica se può progredire
      const suggestion = canProgressToNextLevel(updatedProgress);
      
      // Salva aggiornamenti
      const { error: updateError } = await supabase
        .from('recovery_progress')
        .update({
          sessions_at_current_load: updatedProgress.sessions_at_current_load,
          sessions_without_discomfort: updatedProgress.sessions_without_discomfort,
          current_load_percentage: updatedProgress.current_load_percentage,
          progression_history: updatedProgress.progression_history,
          last_updated: updatedProgress.last_updated,
          status: updatedProgress.current_load_percentage >= 100 ? 'completed' : 'in_progress',
          completed_at: updatedProgress.current_load_percentage >= 100 ? new Date().toISOString() : null
        })
        .eq('id', progress.id);
      
      if (updateError) {
        console.error('Error updating recovery progress:', updateError);
      }
      
      // Prepara risultato
      const isComplete = updatedProgress.current_load_percentage >= 100;
      
      return {
        isComplete,
        currentPercentage: updatedProgress.current_load_percentage,
        sessionsWithoutDiscomfort: updatedProgress.sessions_without_discomfort,
        nextStep: suggestion.reason,
        nextStepIt: suggestion.reasonIt,
        showCelebration: suggestion.canProgress || isComplete,
        celebrationMessage: suggestion.celebrationMessage,
        celebrationMessageIt: suggestion.celebrationMessageIt
      };
    } catch (error) {
      console.error('Exception recording session:', error);
      return null;
    }
  }
  
  /**
   * Applica la progressione al prossimo livello (chiamato dopo conferma utente)
   */
  async applyProgression(
    userId: string,
    exerciseName: string
  ): Promise<{ success: boolean; newPercentage: number }> {
    try {
      const { data: progress, error } = await supabase
        .from('recovery_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('status', 'in_progress')
        .single();
      
      if (error || !progress) {
        return { success: false, newPercentage: 0 };
      }
      
      const suggestion = canProgressToNextLevel(progress);
      
      if (!suggestion.canProgress) {
        return { success: false, newPercentage: progress.current_load_percentage };
      }
      
      // Applica progressione
      const newHistory = [...progress.progression_history, {
        date: new Date().toISOString(),
        from_percentage: progress.current_load_percentage,
        to_percentage: suggestion.suggestedPercentage,
        reason: 'user_ready' as const,
        discomfort_reported: false,
        notes: `Progressed after ${progress.sessions_without_discomfort} discomfort-free sessions`
      }];
      
      const isComplete = suggestion.suggestedPercentage >= 100;
      
      const { error: updateError } = await supabase
        .from('recovery_progress')
        .update({
          current_load_percentage: suggestion.suggestedPercentage,
          sessions_at_current_load: 0,
          sessions_without_discomfort: 0,
          progression_history: newHistory,
          last_updated: new Date().toISOString(),
          status: isComplete ? 'completed' : 'in_progress',
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq('id', progress.id);
      
      if (updateError) {
        console.error('Error applying progression:', updateError);
        return { success: false, newPercentage: progress.current_load_percentage };
      }
      
      console.log(`✅ Progressed ${exerciseName} to ${suggestion.suggestedPercentage}%`);
      return { success: true, newPercentage: suggestion.suggestedPercentage };
    } catch (error) {
      console.error('Exception applying progression:', error);
      return { success: false, newPercentage: 0 };
    }
  }
  
  /**
   * Ottieni tutti i recovery in corso per un utente
   */
  async getActiveRecoveries(userId: string): Promise<RecoveryProgress[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('last_updated', { ascending: false });
      
      if (error) {
        console.error('Error fetching active recoveries:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching active recoveries:', error);
      return [];
    }
  }
  
  /**
   * Ottieni lo storico dei recovery completati
   */
  async getCompletedRecoveries(userId: string, limit = 10): Promise<RecoveryProgress[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching completed recoveries:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching completed recoveries:', error);
      return [];
    }
  }
  
  /**
   * Calcola il carico effettivo da usare per un esercizio
   */
  async getEffectiveLoad(
    userId: string,
    exerciseName: string,
    programmedLoad: number
  ): Promise<{ load: number; isReduced: boolean; percentage: number; reason?: string }> {
    try {
      const { data: progress } = await supabase
        .from('recovery_progress')
        .select('current_load_percentage')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('status', 'in_progress')
        .single();
      
      if (!progress) {
        // Nessun recovery in corso, usa carico normale
        return { load: programmedLoad, isReduced: false, percentage: 100 };
      }
      
      const effectiveLoad = Math.round(programmedLoad * (progress.current_load_percentage / 100));
      
      return {
        load: effectiveLoad,
        isReduced: true,
        percentage: progress.current_load_percentage,
        reason: `Recovery in progress (${progress.current_load_percentage}%)`
      };
    } catch (error) {
      console.error('Exception getting effective load:', error);
      return { load: programmedLoad, isReduced: false, percentage: 100 };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const returnToNormalService = new ReturnToNormalService();
export default returnToNormalService;

// ============================================================================
// UI HELPER MESSAGES
// ============================================================================

export const RECOVERY_MESSAGES = {
  started: {
    title: { it: 'Piano di Recupero Avviato', en: 'Recovery Plan Started' },
    message: { 
      it: 'Partiremo dal {percentage}% del carico e aumenteremo gradualmente. Il tuo corpo si adatterà!',
      en: "We'll start at {percentage}% load and increase gradually. Your body will adapt!"
    }
  },
  inProgress: {
    title: { it: 'Recupero in Corso', en: 'Recovery In Progress' },
    message: {
      it: 'Attualmente al {percentage}%. {sessions} sessioni senza fastidio.',
      en: 'Currently at {percentage}%. {sessions} sessions without discomfort.'
    }
  },
  readyToProgress: {
    title: { it: 'Pronto per Progredire!', en: 'Ready to Progress!' },
    message: {
      it: 'Ottimo lavoro! Vuoi aumentare al {percentage}%?',
      en: 'Great work! Want to increase to {percentage}%?'
    }
  },
  completed: {
    title: { it: '🎉 Recupero Completato!', en: '🎉 Recovery Complete!' },
    message: {
      it: 'Sei tornato a piena capacità su {exercise}. Il tuo corpo si è adattato e recuperato!',
      en: "You're back to full capacity on {exercise}. Your body adapted and recovered!"
    }
  },
  regressed: {
    title: { it: 'Carico Ridotto', en: 'Load Reduced' },
    message: {
      it: 'Abbiamo ridotto al {percentage}% per il fastidio segnalato. Un passo indietro per due avanti.',
      en: "We've reduced to {percentage}% due to reported discomfort. One step back for two forward."
    }
  }
};
