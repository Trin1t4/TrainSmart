/**
 * TEAMMATE AS LOAD SYSTEM
 *
 * Sistema per usare i compagni di squadra come carico negli esercizi di potenza.
 * Quando non ci sono attrezzi disponibili, si può usare un compagno di peso appropriato.
 *
 * Esempi:
 * - Back Squat → Partner Squat (compagno sulle spalle)
 * - Deadlift → Partner Lift (compagno da terra)
 * - Hip Thrust → Partner Hip Thrust (compagno sui fianchi)
 * - Rows → Partner Rows (compagno come resistenza)
 */

export interface Teammate {
  id: string;
  name: string;
  weight: number; // kg
  height?: number; // cm
  available?: boolean;
}

export interface TeammateLoadSuggestion {
  targetWeight: number; // Peso target dell'esercizio
  teammate: Teammate;
  difference: number; // Differenza dal peso target (negativa = sotto)
  percentage: number; // % del peso target
  notes: string;
  isRecommended: boolean;
}

export interface PartnerExercise {
  name: string;
  originalExercise: string;
  description: string;
  technique: string[];
  safetyNotes: string[];
  minPartnerWeight: number; // Peso minimo partner (kg)
  maxPartnerWeight: number; // Peso massimo partner (kg)
  type: 'carry' | 'resistance' | 'support';
}

// Database esercizi con partner
export const PARTNER_EXERCISES: Record<string, PartnerExercise> = {
  // ============================================
  // LOWER BODY - CARRY
  // ============================================

  'Partner Squat (Piggyback)': {
    name: 'Partner Squat (Piggyback)',
    originalExercise: 'Back Squat',
    description: 'Squat con compagno sulla schiena in posizione piggyback. Eccellente per potenza e team building.',
    technique: [
      'Il partner sale sulla schiena, aggrappandosi alle spalle',
      'L\'atleta tiene le gambe del partner con le mani',
      'Scendi in squat controllato (non oltre parallelo)',
      'Mantieni il busto il più verticale possibile',
      'Comunicazione costante con il partner'
    ],
    safetyNotes: [
      'Il partner deve stare fermo e non muoversi',
      'Superficie non scivolosa obbligatoria',
      'Warm-up adeguato prima di caricare',
      'Interrompere se c\'è dolore alla schiena'
    ],
    minPartnerWeight: 40,
    maxPartnerWeight: 100,
    type: 'carry'
  },

  'Partner Squat (Front)': {
    name: 'Partner Squat (Front)',
    originalExercise: 'Front Squat',
    description: 'Squat con compagno frontale. Il partner viene tenuto come un sacco davanti al corpo.',
    technique: [
      'Il partner viene sollevato e tenuto davanti al petto',
      'Il partner si aggrappa al collo dell\'atleta',
      'Scendi in squat mantenendo il busto eretto',
      'Il partner deve tenere le gambe raccolte',
      'Comunicazione costante'
    ],
    safetyNotes: [
      'Solo per atleti esperti',
      'Peso partner non superiore al 70% del peso corporeo',
      'Superficie stabile e non scivolosa',
      'Spotter consigliato'
    ],
    minPartnerWeight: 30,
    maxPartnerWeight: 80,
    type: 'carry'
  },

  'Partner Lunge (Piggyback)': {
    name: 'Partner Lunge (Piggyback)',
    originalExercise: 'Walking Lunge',
    description: 'Affondi camminati con compagno sulla schiena.',
    technique: [
      'Partner sulla schiena in posizione piggyback',
      'Fai un passo avanti in affondo',
      'Ginocchio posteriore sfiora il pavimento',
      'Spingi per tornare su e alterna gamba',
      'Mantieni equilibrio e controllo'
    ],
    safetyNotes: [
      'Spazio ampio per camminare',
      'Partner stabile e fermo',
      'Evitare se problemi a ginocchia o caviglie'
    ],
    minPartnerWeight: 30,
    maxPartnerWeight: 80,
    type: 'carry'
  },

  'Partner Hip Thrust': {
    name: 'Partner Hip Thrust',
    originalExercise: 'Hip Thrust',
    description: 'Hip thrust con compagno seduto sulle anche.',
    technique: [
      'Schiena su una panca, piedi a terra',
      'Partner seduto sulle anche (zona bassa addome)',
      'Spingi le anche verso l\'alto',
      'Contrai i glutei in alto',
      'Scendi controllato'
    ],
    safetyNotes: [
      'Partner deve sedersi sulla zona ossea (anche), non sull\'addome',
      'Comunicare se c\'è disagio',
      'Superficie della panca stabile'
    ],
    minPartnerWeight: 40,
    maxPartnerWeight: 100,
    type: 'carry'
  },

  'Fireman Carry Walk': {
    name: 'Fireman Carry Walk',
    originalExercise: 'Farmer Walk',
    description: 'Trasporto del pompiere. Il partner viene portato sulle spalle in posizione orizzontale.',
    technique: [
      'Partner viene caricato sulle spalle (posizione pompiere)',
      'Un braccio tra le gambe del partner, l\'altro tiene il braccio',
      'Cammina per la distanza/tempo richiesto',
      'Mantieni core contratto e postura eretta',
      'Passi controllati e stabili'
    ],
    safetyNotes: [
      'Tecnica di caricamento corretta essenziale',
      'Partner deve rilassarsi e non muoversi',
      'Fermarsi se affaticamento eccessivo'
    ],
    minPartnerWeight: 50,
    maxPartnerWeight: 120,
    type: 'carry'
  },

  // ============================================
  // UPPER BODY - RESISTANCE
  // ============================================

  'Partner Push-up (Resistance)': {
    name: 'Partner Push-up (Resistance)',
    originalExercise: 'Weighted Push-up',
    description: 'Push-up con partner che applica resistenza sulla schiena.',
    technique: [
      'Posizione push-up standard',
      'Partner mette le mani sulla parte alta della schiena',
      'Partner applica pressione durante la discesa',
      'Riduce pressione durante la salita o mantiene',
      'Comunicare l\'intensità desiderata'
    ],
    safetyNotes: [
      'Partner non deve premere sulla zona lombare',
      'Pressione graduale, non improvvisa',
      'Comunicazione costante sull\'intensità'
    ],
    minPartnerWeight: 0, // Solo resistenza manuale
    maxPartnerWeight: 0,
    type: 'resistance'
  },

  'Partner Row (Resistance Band Style)': {
    name: 'Partner Row (Resistance)',
    originalExercise: 'Seated Cable Row',
    description: 'Rematore con partner che fornisce resistenza tenendo le mani/polsi.',
    technique: [
      'Seduto a terra, gambe tese',
      'Partner in piedi o seduto di fronte, tiene i polsi',
      'Tira verso il corpo, partner resiste',
      'Partner controlla la resistenza',
      'Mantieni schiena dritta'
    ],
    safetyNotes: [
      'Partner deve fornire resistenza costante',
      'Non rilasciare improvvisamente',
      'Comunicare prima di iniziare ogni rep'
    ],
    minPartnerWeight: 0,
    maxPartnerWeight: 0,
    type: 'resistance'
  },

  'Wheelbarrow Push-up': {
    name: 'Wheelbarrow Push-up',
    originalExercise: 'Decline Push-up',
    description: 'Push-up con partner che tiene le caviglie (posizione carriola).',
    technique: [
      'Posizione push-up, partner tiene le caviglie',
      'Partner solleva le gambe all\'altezza desiderata',
      'Esegui push-up mantenendo core rigido',
      'Comunicare se troppo alto/basso',
      'Partner mantiene posizione stabile'
    ],
    safetyNotes: [
      'Partner non deve cambiare altezza durante l\'esercizio',
      'Iniziare con angolo basso e aumentare',
      'Core sempre contratto'
    ],
    minPartnerWeight: 0,
    maxPartnerWeight: 0,
    type: 'support'
  },

  // ============================================
  // POWER / EXPLOSIVE
  // ============================================

  'Partner Broad Jump (With Carry)': {
    name: 'Partner Broad Jump (With Carry)',
    originalExercise: 'Broad Jump',
    description: 'Salto in lungo con partner sulle spalle. Test esplosività con carico.',
    technique: [
      'Partner sulla schiena in posizione piggyback',
      'Prepara il salto con oscillazione braccia',
      'Salta in avanti con massima potenza',
      'Atterra controllato su entrambi i piedi',
      'Partner deve stare fermo durante il salto'
    ],
    safetyNotes: [
      'Solo per atleti avanzati',
      'Superficie di atterraggio morbida',
      'Partner leggero (< 60kg)',
      'Pratica prima senza salto'
    ],
    minPartnerWeight: 30,
    maxPartnerWeight: 60,
    type: 'carry'
  },

  'Partner Sled Push Simulation': {
    name: 'Partner Sled Push Simulation',
    originalExercise: 'Sled Push',
    description: 'Simulazione sled push: partner resiste mentre l\'atleta spinge.',
    technique: [
      'Atleta in posizione di spinta (45° inclinazione)',
      'Mani sulle spalle/petto del partner',
      'Partner resiste camminando all\'indietro',
      'Mantieni drive costante con le gambe',
      'Partner regola resistenza in base alla forza'
    ],
    safetyNotes: [
      'Partner deve guardare dove cammina',
      'Superficie non scivolosa',
      'Comunicare per fermarsi',
      'Partner in posizione atletica stabile'
    ],
    minPartnerWeight: 50,
    maxPartnerWeight: 120,
    type: 'resistance'
  },

  'Partner Resisted Sprint': {
    name: 'Partner Resisted Sprint',
    originalExercise: 'Sled Pull Sprint',
    description: 'Sprint con partner che resiste tenendo i fianchi da dietro.',
    technique: [
      'Partner dietro, tiene i fianchi o usa una cintura',
      'L\'atleta inizia lo sprint',
      'Partner resiste progressivamente',
      'Mantieni tecnica di corsa corretta',
      'Sprint per 10-20 metri'
    ],
    safetyNotes: [
      'Partner deve correre/camminare dietro',
      'Non tirare lateralmente',
      'Comunicare prima di partire'
    ],
    minPartnerWeight: 50,
    maxPartnerWeight: 100,
    type: 'resistance'
  }
};

/**
 * Trova il compagno di squadra più adatto come carico
 *
 * @param targetWeight Peso target per l'esercizio (kg)
 * @param teammates Lista compagni disponibili
 * @param tolerance Tolleranza percentuale accettabile (default 20%)
 * @returns Lista compagni ordinati per adeguatezza
 */
export function findBestTeammateForLoad(
  targetWeight: number,
  teammates: Teammate[],
  tolerance: number = 0.2
): TeammateLoadSuggestion[] {
  if (!teammates || teammates.length === 0) return [];

  const suggestions: TeammateLoadSuggestion[] = teammates
    .filter(t => t.available !== false)
    .map(teammate => {
      const difference = teammate.weight - targetWeight;
      const percentage = (teammate.weight / targetWeight) * 100;
      const withinTolerance = Math.abs(difference) <= targetWeight * tolerance;

      // Calcola se è raccomandato (entro tolleranza e preferibilmente sotto target)
      const isRecommended = withinTolerance || (teammate.weight <= targetWeight && teammate.weight >= targetWeight * 0.7);

      let notes = '';
      if (difference > 0) {
        notes = `+${difference.toFixed(1)}kg sopra target (${percentage.toFixed(0)}%)`;
      } else if (difference < 0) {
        notes = `${difference.toFixed(1)}kg sotto target (${percentage.toFixed(0)}%)`;
      } else {
        notes = 'Peso esatto!';
      }

      if (teammate.weight < targetWeight * 0.5) {
        notes += ' - Troppo leggero, considera combinazione';
      } else if (teammate.weight > targetWeight * 1.3) {
        notes += ' - Troppo pesante, riduci carico o cambia esercizio';
      }

      return {
        targetWeight,
        teammate,
        difference,
        percentage,
        notes,
        isRecommended
      };
    })
    .sort((a, b) => {
      // Priorità: raccomandati prima, poi per differenza minima
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return Math.abs(a.difference) - Math.abs(b.difference);
    });

  return suggestions;
}

/**
 * Suggerisci esercizio partner equivalente
 *
 * @param exerciseName Nome esercizio originale
 * @returns Esercizio partner equivalente o null
 */
export function getPartnerExerciseFor(exerciseName: string): PartnerExercise | null {
  // Cerca match diretto
  const normalizedName = exerciseName.toLowerCase();

  // Mappa esercizi standard a partner exercises
  const mappings: Record<string, string> = {
    'back squat': 'Partner Squat (Piggyback)',
    'squat': 'Partner Squat (Piggyback)',
    'front squat': 'Partner Squat (Front)',
    'walking lunge': 'Partner Lunge (Piggyback)',
    'lunge': 'Partner Lunge (Piggyback)',
    'hip thrust': 'Partner Hip Thrust',
    'glute bridge': 'Partner Hip Thrust',
    'weighted push-up': 'Partner Push-up (Resistance)',
    'push-up': 'Partner Push-up (Resistance)',
    'farmer walk': 'Fireman Carry Walk',
    'seated row': 'Partner Row (Resistance)',
    'cable row': 'Partner Row (Resistance)',
    'broad jump': 'Partner Broad Jump (With Carry)',
    'sled push': 'Partner Sled Push Simulation',
    'sled pull': 'Partner Resisted Sprint',
    'sprint': 'Partner Resisted Sprint'
  };

  for (const [key, value] of Object.entries(mappings)) {
    if (normalizedName.includes(key)) {
      return PARTNER_EXERCISES[value] || null;
    }
  }

  return null;
}

/**
 * Calcola se un teammate è adatto per un esercizio specifico
 *
 * @param exercise Esercizio partner
 * @param teammate Compagno
 * @returns True se il peso è nel range accettabile
 */
export function isTeammateSuitableFor(exercise: PartnerExercise, teammate: Teammate): boolean {
  if (exercise.type !== 'carry') return true; // Per resistenza non conta il peso

  return teammate.weight >= exercise.minPartnerWeight &&
         teammate.weight <= exercise.maxPartnerWeight;
}

/**
 * Genera suggerimento di carico con compagno
 */
export function generateTeammateLoadMessage(
  exerciseName: string,
  targetWeight: number,
  suggestion: TeammateLoadSuggestion
): string {
  const partnerExercise = getPartnerExerciseFor(exerciseName);

  if (!partnerExercise) {
    return `Usa ${suggestion.teammate.name} (${suggestion.teammate.weight}kg) come resistenza. ${suggestion.notes}`;
  }

  return `
${partnerExercise.name}
Partner: ${suggestion.teammate.name} (${suggestion.teammate.weight}kg)
${suggestion.notes}

Tecnica:
${partnerExercise.technique.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Sicurezza:
${partnerExercise.safetyNotes.map(s => `- ${s}`).join('\n')}
`.trim();
}
