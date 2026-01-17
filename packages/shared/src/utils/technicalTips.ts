/**
 * ============================================================================
 * TECHNICAL TIPS - Consigli Tecnici con Paywall
 * ============================================================================
 *
 * Gestisce la logica dei consigli tecnici durante l'allenamento.
 *
 * REGOLE DI ACCESSO:
 * - Trial gratuito: NO consigli tecnici
 * - Early Bird (base): NO consigli tecnici
 * - Pro: SÌ consigli tecnici (€24.90/mese)
 * - Coach (premium): SÌ consigli tecnici (€39.90/mese)
 *
 * FILOSOFIA:
 * - I consigli sono OPT-IN (l'utente deve attivarli)
 * - Chiediamo conferma in 2 momenti: onboarding + dopo sessione 1
 * - Se non ha il piano giusto, mostriamo upsell gentile
 *
 * @module technicalTips
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'trial' | 'base' | 'pro' | 'premium' | 'coach';

export interface TechnicalTipsSettings {
  enabled: boolean;
  confirmedInOnboarding: boolean;
  confirmedAfterSession1: boolean;
  lastConfirmationDate?: string;
}

export interface TipsAccessResult {
  hasAccess: boolean;
  reason: 'plan_ok' | 'needs_upgrade' | 'not_enabled' | 'trial_period';
  requiredTier?: SubscriptionTier;
  upgradeMessage?: string;
  upgradeMessageIt?: string;
}

export interface TechnicalTip {
  id: string;
  exercisePattern: string;
  exerciseName: string;
  tipType: 'form' | 'breathing' | 'tempo' | 'cue' | 'safety';
  priority: 'high' | 'medium' | 'low';
  tip: string;
  tipIt: string;
  source?: string;  // Riferimento scientifico se applicabile
}

export interface TipFeedback {
  tipId: string;
  wasHelpful: boolean;
  userId: string;
  timestamp: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Piani che hanno accesso ai consigli tecnici
 *
 * STRATEGIA UPSELL:
 * - Trial: SÌ → si innamorano della feature
 * - Early Bird: NO → devono upgradare a Pro per riaverla
 * - Pro/Coach: SÌ → hanno pagato
 */
export const TIERS_WITH_TIPS_ACCESS: readonly SubscriptionTier[] = [
  'trial',    // ← SÌ! Si innamorano, poi pagano
  'pro',
  'premium',
  'coach'
];

/**
 * Piani che NON hanno accesso
 */
export const TIERS_WITHOUT_TIPS_ACCESS: readonly SubscriptionTier[] = [
  'free',
  'base'     // ← Early Bird NON ha accesso → upsell a Pro
];

/**
 * Prezzo minimo per sbloccare la feature
 */
export const MINIMUM_TIER_FOR_TIPS: SubscriptionTier = 'pro';
export const MINIMUM_PRICE_FOR_TIPS = 24.90;

// ============================================================================
// ACCESS CONTROL
// ============================================================================

/**
 * Verifica se l'utente può ricevere consigli tecnici
 *
 * @param tier - Piano dell'utente
 * @param settings - Impostazioni consigli dell'utente
 * @param trialDaysRemaining - Giorni rimanenti nel trial (opzionale)
 * @returns Risultato con accesso e eventuale messaggio di upgrade
 */
export function checkTipsAccess(
  tier: SubscriptionTier,
  settings?: TechnicalTipsSettings,
  trialDaysRemaining?: number
): TipsAccessResult {
  // 1. Verifica se il piano lo permette
  const tierAllowed = TIERS_WITH_TIPS_ACCESS.includes(tier);

  if (!tierAllowed) {
    // Era in trial e ora ha Early Bird? Messaggio specifico
    const wasInTrial = tier === 'base'; // Assumiamo che base = post-trial

    return {
      hasAccess: false,
      reason: 'needs_upgrade',
      requiredTier: 'pro',
      upgradeMessage: wasInTrial
        ? `You enjoyed technical tips during your trial! Upgrade to Pro (€${MINIMUM_PRICE_FOR_TIPS}/month) to keep them.`
        : `Technical tips are available with Pro plan (€${MINIMUM_PRICE_FOR_TIPS}/month) or higher.`,
      upgradeMessageIt: wasInTrial
        ? `Ti sono piaciuti i consigli tecnici durante il trial! Passa a Pro (€${MINIMUM_PRICE_FOR_TIPS}/mese) per continuare a riceverli.`
        : `I consigli tecnici sono disponibili con il piano Pro (€${MINIMUM_PRICE_FOR_TIPS}/mese) o superiore.`
    };
  }

  // 2. Se è in trial, mostra reminder che è temporaneo (ultimi 7 giorni)
  if (tier === 'trial' && trialDaysRemaining !== undefined && trialDaysRemaining <= 7) {
    // Ha accesso ma avvisiamo che sta per finire
    if (settings && !settings.enabled) {
      return {
        hasAccess: false,
        reason: 'not_enabled'
      };
    }

    return {
      hasAccess: true,
      reason: 'trial_period',
      upgradeMessage: `${trialDaysRemaining} days left in your trial. Upgrade to Pro to keep technical tips!`,
      upgradeMessageIt: `${trialDaysRemaining} giorni rimasti nel trial. Passa a Pro per mantenere i consigli tecnici!`
    };
  }

  // 3. Verifica se l'utente li ha attivati
  if (settings && !settings.enabled) {
    return {
      hasAccess: false,
      reason: 'not_enabled'
    };
  }

  // 4. OK, può ricevere consigli
  return {
    hasAccess: true,
    reason: 'plan_ok'
  };
}

/**
 * Verifica veloce (senza dettagli)
 */
export function canReceiveTips(
  tier: SubscriptionTier,
  tipsEnabled: boolean = true
): boolean {
  return TIERS_WITH_TIPS_ACCESS.includes(tier) && tipsEnabled;
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Crea impostazioni default per nuovo utente
 */
export function createDefaultTipsSettings(): TechnicalTipsSettings {
  return {
    enabled: false,  // Default OFF - l'utente deve opt-in
    confirmedInOnboarding: false,
    confirmedAfterSession1: false
  };
}

/**
 * Aggiorna impostazioni dopo scelta in onboarding
 */
export function updateSettingsFromOnboarding(
  settings: TechnicalTipsSettings,
  wantsTips: boolean
): TechnicalTipsSettings {
  return {
    ...settings,
    enabled: wantsTips,
    confirmedInOnboarding: true,
    lastConfirmationDate: new Date().toISOString()
  };
}

/**
 * Aggiorna impostazioni dopo conferma post-sessione 1
 */
export function updateSettingsAfterSession1(
  settings: TechnicalTipsSettings,
  confirmsTips: boolean
): TechnicalTipsSettings {
  return {
    ...settings,
    enabled: confirmsTips,
    confirmedAfterSession1: true,
    lastConfirmationDate: new Date().toISOString()
  };
}

/**
 * Verifica se mostrare la conferma post-sessione 1
 */
export function shouldShowSession1Confirmation(
  settings: TechnicalTipsSettings,
  sessionsCompleted: number
): boolean {
  return sessionsCompleted === 1 &&
         settings.confirmedInOnboarding &&
         !settings.confirmedAfterSession1;
}

// ============================================================================
// TIPS DATABASE (Sample - in produzione sarebbe in Supabase)
// ============================================================================

/**
 * Consigli tecnici per pattern comuni
 *
 * In produzione questi sarebbero in un database con:
 * - Più varianti per esercizio
 * - Rotation per non mostrare sempre lo stesso
 * - Peso basato su feedback utenti
 */
export const TECHNICAL_TIPS_DATABASE: TechnicalTip[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // SQUAT
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'squat_chest_up',
    exercisePattern: 'lower_push',
    exerciseName: 'Squat',
    tipType: 'form',
    priority: 'high',
    tip: 'Keep your chest up and proud throughout the movement. This helps maintain a neutral spine.',
    tipIt: 'Tieni il petto alto e in fuori durante tutto il movimento. Questo aiuta a mantenere la colonna neutra.',
    source: 'Rippetoe, Starting Strength'
  },
  {
    id: 'squat_knees_out',
    exercisePattern: 'lower_push',
    exerciseName: 'Squat',
    tipType: 'cue',
    priority: 'high',
    tip: 'Push your knees out in line with your toes. Don\'t let them cave inward.',
    tipIt: 'Spingi le ginocchia in fuori in linea con le punte dei piedi. Non lasciarle cedere verso l\'interno.',
    source: 'NSCA Guidelines'
  },
  {
    id: 'squat_breathing',
    exercisePattern: 'lower_push',
    exerciseName: 'Squat',
    tipType: 'breathing',
    priority: 'medium',
    tip: 'Take a deep breath at the top, brace your core, squat, then exhale as you stand.',
    tipIt: 'Inspira profondamente in alto, contrai il core, scendi, poi espira mentre sali.',
    source: 'Valsalva technique'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // DEADLIFT
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'deadlift_hips_shoulders',
    exercisePattern: 'lower_pull',
    exerciseName: 'Stacco',
    tipType: 'form',
    priority: 'high',
    tip: 'Hips and shoulders should rise together. If hips shoot up first, the bar gets away from you.',
    tipIt: 'Anche e spalle devono salire insieme. Se le anche salgono prima, il bilanciere si allontana.',
    source: 'Rippetoe, Starting Strength'
  },
  {
    id: 'deadlift_slack',
    exercisePattern: 'lower_pull',
    exerciseName: 'Stacco',
    tipType: 'cue',
    priority: 'high',
    tip: 'Pull the slack out of the bar before you lift. You should hear a "click" as the bar touches the plates.',
    tipIt: 'Tira via il "gioco" dal bilanciere prima di sollevare. Dovresti sentire un "click" quando il bilanciere tocca i dischi.',
    source: 'Powerlifting technique'
  },
  {
    id: 'deadlift_push_floor',
    exercisePattern: 'lower_pull',
    exerciseName: 'Stacco',
    tipType: 'cue',
    priority: 'medium',
    tip: 'Think of pushing the floor away with your feet, not pulling the bar up.',
    tipIt: 'Pensa a spingere il pavimento via con i piedi, non a tirare su il bilanciere.',
    source: 'Common coaching cue'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BENCH PRESS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'bench_arch',
    exercisePattern: 'horizontal_push',
    exerciseName: 'Panca',
    tipType: 'form',
    priority: 'high',
    tip: 'Maintain a slight arch in your lower back and keep your shoulder blades squeezed together.',
    tipIt: 'Mantieni un leggero arco nella parte bassa della schiena e tieni le scapole addotte.',
    source: 'Powerlifting technique'
  },
  {
    id: 'bench_elbows',
    exercisePattern: 'horizontal_push',
    exerciseName: 'Panca',
    tipType: 'form',
    priority: 'high',
    tip: 'Keep elbows at roughly 45-75° from your body, not flared out at 90°.',
    tipIt: 'Tieni i gomiti a circa 45-75° dal corpo, non svasati a 90°.',
    source: 'Shoulder safety'
  },
  {
    id: 'bench_leg_drive',
    exercisePattern: 'horizontal_push',
    exerciseName: 'Panca',
    tipType: 'cue',
    priority: 'medium',
    tip: 'Push your feet into the floor as you press. This creates leg drive and stabilizes your body.',
    tipIt: 'Spingi i piedi nel pavimento mentre premi. Questo crea spinta dalle gambe e stabilizza il corpo.',
    source: 'Powerlifting technique'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ROW
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'row_squeeze',
    exercisePattern: 'horizontal_pull',
    exerciseName: 'Rematore',
    tipType: 'form',
    priority: 'high',
    tip: 'Squeeze your shoulder blades together at the top of the movement. Hold for 1 second.',
    tipIt: 'Stringi le scapole insieme in cima al movimento. Tieni per 1 secondo.',
    source: 'Back activation'
  },
  {
    id: 'row_stable_torso',
    exercisePattern: 'horizontal_pull',
    exerciseName: 'Rematore',
    tipType: 'form',
    priority: 'high',
    tip: 'Keep your torso stable. If you\'re swinging a lot, the weight is too heavy.',
    tipIt: 'Mantieni il busto stabile. Se oscilli molto, il peso è troppo pesante.',
    source: 'Form check'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // OVERHEAD PRESS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'ohp_head_through',
    exercisePattern: 'vertical_push',
    exerciseName: 'Lento Avanti',
    tipType: 'cue',
    priority: 'high',
    tip: 'As the bar passes your forehead, push your head "through the window" to lock out directly overhead.',
    tipIt: 'Quando il bilanciere passa la fronte, spingi la testa "attraverso la finestra" per bloccare direttamente sopra.',
    source: 'Rippetoe, Starting Strength'
  },
  {
    id: 'ohp_no_lean',
    exercisePattern: 'vertical_push',
    exerciseName: 'Lento Avanti',
    tipType: 'safety',
    priority: 'high',
    tip: 'Don\'t lean back excessively. If you need to lean back a lot, the weight is too heavy.',
    tipIt: 'Non inclinarti indietro eccessivamente. Se devi inclinarti molto, il peso è troppo pesante.',
    source: 'Spine safety'
  }
];

// ============================================================================
// TIP SELECTION
// ============================================================================

/**
 * Ottieni un consiglio per un esercizio specifico
 *
 * @param exercisePattern - Pattern dell'esercizio
 * @param exerciseName - Nome esercizio (per matching più specifico)
 * @param previousTipIds - ID dei consigli già mostrati (per evitare ripetizioni)
 * @returns Consiglio o null se non disponibile
 */
export function getTipForExercise(
  exercisePattern: string,
  exerciseName?: string,
  previousTipIds: string[] = []
): TechnicalTip | null {
  // Filtra per pattern
  let candidates = TECHNICAL_TIPS_DATABASE.filter(
    tip => tip.exercisePattern === exercisePattern
  );

  // Se nome specifico, filtra ulteriormente
  if (exerciseName) {
    const nameMatches = candidates.filter(tip =>
      exerciseName.toLowerCase().includes(tip.exerciseName.toLowerCase()) ||
      tip.exerciseName.toLowerCase().includes(exerciseName.toLowerCase())
    );
    if (nameMatches.length > 0) {
      candidates = nameMatches;
    }
  }

  // Escludi già mostrati
  candidates = candidates.filter(tip => !previousTipIds.includes(tip.id));

  // Se nessun candidato, niente consiglio
  if (candidates.length === 0) return null;

  // Prioritizza per importanza
  const highPriority = candidates.filter(t => t.priority === 'high');
  if (highPriority.length > 0) {
    return highPriority[Math.floor(Math.random() * highPriority.length)];
  }

  // Altrimenti random
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Ottieni tutti i consigli per un pattern (per UI completa)
 */
export function getAllTipsForPattern(exercisePattern: string): TechnicalTip[] {
  return TECHNICAL_TIPS_DATABASE.filter(
    tip => tip.exercisePattern === exercisePattern
  ).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// UPSELL MESSAGES
// ============================================================================

/**
 * Messaggi per upsell quando l'utente non ha il piano giusto
 */
export const UPSELL_MESSAGES = {
  onToggleAttempt: {
    en: "Technical tips help you improve your form and prevent injuries. Upgrade to Pro (€24.90/month) to unlock this feature.",
    it: "I consigli tecnici ti aiutano a migliorare la tecnica e prevenire infortuni. Passa a Pro (€24.90/mese) per sbloccare questa funzione."
  },

  afterGoodSet: {
    en: "Great set! With Pro, you'd get personalized technique tips to improve even more.",
    it: "Ottima serie! Con Pro, riceveresti consigli tecnici personalizzati per migliorare ancora."
  },

  onFirstSession: {
    en: "Want feedback on your technique? Pro plan includes real-time coaching tips.",
    it: "Vuoi feedback sulla tua tecnica? Il piano Pro include consigli di coaching in tempo reale."
  },

  // NUOVI - Per utenti che hanno perso i consigli dopo il trial
  lostAfterTrial: {
    en: "Miss the technique tips? Upgrade to Pro (€24.90/month) to get them back!",
    it: "Ti mancano i consigli tecnici? Passa a Pro (€24.90/mese) per riaverli!"
  },

  // Per ultimi giorni di trial
  trialEnding: {
    en: "Your trial ends soon! Upgrade to Pro to keep receiving technique tips.",
    it: "Il tuo trial sta per finire! Passa a Pro per continuare a ricevere i consigli tecnici."
  },

  // Quando mostri un tip durante il trial
  tipDuringTrial: {
    en: "Pro tip! You're seeing this because you're in your free trial.",
    it: "Consiglio Pro! Lo vedi perché sei nel periodo di prova gratuito."
  }
};

/**
 * Genera messaggio di upsell contestuale
 */
export function getUpsellMessage(
  context: 'toggle' | 'after_set' | 'first_session' | 'lost_after_trial' | 'trial_ending' | 'tip_during_trial',
  language: 'en' | 'it' = 'it'
): string {
  switch (context) {
    case 'toggle':
      return UPSELL_MESSAGES.onToggleAttempt[language];
    case 'after_set':
      return UPSELL_MESSAGES.afterGoodSet[language];
    case 'first_session':
      return UPSELL_MESSAGES.onFirstSession[language];
    case 'lost_after_trial':
      return UPSELL_MESSAGES.lostAfterTrial[language];
    case 'trial_ending':
      return UPSELL_MESSAGES.trialEnding[language];
    case 'tip_during_trial':
      return UPSELL_MESSAGES.tipDuringTrial[language];
    default:
      return UPSELL_MESSAGES.onToggleAttempt[language];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TechnicalTips = {
  // Access control
  checkAccess: checkTipsAccess,
  canReceive: canReceiveTips,
  TIERS_WITH_ACCESS: TIERS_WITH_TIPS_ACCESS,
  MINIMUM_TIER: MINIMUM_TIER_FOR_TIPS,

  // Settings
  createDefaultSettings: createDefaultTipsSettings,
  updateFromOnboarding: updateSettingsFromOnboarding,
  updateAfterSession1: updateSettingsAfterSession1,
  shouldShowConfirmation: shouldShowSession1Confirmation,

  // Tips
  getTip: getTipForExercise,
  getAllForPattern: getAllTipsForPattern,
  DATABASE: TECHNICAL_TIPS_DATABASE,

  // Upsell
  getUpsellMessage,
  UPSELL_MESSAGES
};

export default TechnicalTips;
