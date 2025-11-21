/**
 * Exercise Descriptions & Technique Cues
 * File separato per facile editing delle descrizioni
 */

import { CORRECTIVE_EXERCISE_DESCRIPTIONS } from './correctiveExerciseDescriptions';

export interface ExerciseDescription {
  description: string;
  technique: string[];
}

/**
 * Database descrizioni esercizi
 * Chiave = nome esercizio (case-insensitive matching)
 */
export const EXERCISE_DESCRIPTIONS: Record<string, ExerciseDescription> = {

  // ============================================
  // LOWER PUSH (Squat pattern)
  // ============================================

  'Bodyweight Squat': {
    description: 'Movimento base per gambe. Scendi come se ti sedessi su una sedia invisibile, mantenendo il peso distribuito sul piede.',
    technique: [
      'Piedi larghezza spalle',
      'Peso su tripode (tallone + base alluce + mignolo)',
      'Ginocchia in linea con le punte',
      'Core attivo, schiena neutra'
    ]
  },

  'Goblet Squat': {
    description: 'Squat con peso frontale che migliora la postura. Il peso davanti al petto aiuta a mantenere il busto eretto.',
    technique: [
      'Tieni il peso vicino al petto',
      'Peso su tripode del piede',
      'Gomiti puntati verso il basso',
      'Spingi i gomiti tra le ginocchia'
    ]
  },

  'Front Squat': {
    description: 'Squat con bilanciere sulle spalle anteriori. Enfatizza i quadricipiti e richiede ottima mobilità.',
    technique: [
      'Bilanciere sulle clavicole',
      'Peso su tripode del piede',
      'Gomiti alti e paralleli al pavimento',
      'Busto il più verticale possibile'
    ]
  },

  'Back Squat': {
    description: 'Re degli esercizi per le gambe. Bilanciere sui trapezi, movimento completo che coinvolge tutto il lower body.',
    technique: [
      'Bilanciere sui trapezi (non sul collo)',
      'Peso su tripode del piede',
      'Petto in fuori, schiena neutra',
      'Spingi il pavimento con i piedi'
    ]
  },

  'Leg Press': {
    description: 'Movimento guidato per gambe. Ottimo per caricare peso in sicurezza senza stress sulla schiena.',
    technique: [
      'Schiena ben appoggiata allo schienale',
      'Spingi con tripode del piede',
      'Non bloccare le ginocchia in alto',
      'Scendi fino a 90° di flessione'
    ]
  },

  'Bulgarian Split Squat': {
    description: 'Squat unilaterale con piede posteriore elevato. Eccellente per equilibrio, forza e correzione di squilibri.',
    technique: [
      'Piede posteriore su panca dietro',
      'Peso su tripode del piede anteriore',
      'Busto leggermente inclinato avanti',
      'Scendi verticalmente'
    ]
  },

  'Pistol Squat': {
    description: 'Squat su una gamba sola. Richiede forza, equilibrio e mobilità eccezionali. Esercizio avanzato.',
    technique: [
      'Gamba libera tesa davanti',
      'Braccia avanti per bilanciare',
      'Peso su tripode del piede',
      'Scendi lentamente e controllato'
    ]
  },

  // ============================================
  // LOWER PULL (Deadlift/Hip Hinge)
  // ============================================

  'Bodyweight Hip Hinge': {
    description: 'Movimento fondamentale per imparare a piegarsi dalle anche. Propedeutico a tutti i deadlift.',
    technique: [
      'Piega dalle anche, non dalla schiena',
      'Peso sui talloni',
      'Ginocchia leggermente flesse',
      'Schiena sempre neutra'
    ]
  },

  'Conventional Deadlift': {
    description: 'Esercizio fondamentale per forza totale. Solleva il bilanciere da terra fino alla posizione eretta.',
    technique: [
      'Bilanciere sopra la metà del piede',
      'Schiena neutra durante tutto il movimento',
      'Spingi il pavimento con i piedi',
      'Blocca glutei e core in alto'
    ]
  },

  'Romanian Deadlift (RDL)': {
    description: 'Deadlift con focus sugli ischiocrurali. Movimento eccentrico controllato per massimo stretch muscolare.',
    technique: [
      'Peso sui talloni',
      'Ginocchia leggermente flesse e fisse',
      'Bilanciere scende lungo le gambe',
      'Senti lo stretch nei femorali'
    ]
  },

  'Sumo Deadlift': {
    description: 'Variante con stance largo. Riduce il ROM e coinvolge maggiormente glutei e adduttori.',
    technique: [
      'Piedi molto larghi, punte in fuori',
      'Presa stretta tra le gambe',
      'Spingi le ginocchia in fuori',
      'Busto più verticale del conventional'
    ]
  },

  'Trap Bar Deadlift': {
    description: 'Deadlift con trap bar esagonale. Più sicuro per la schiena, ottimo per principianti e carichi pesanti.',
    technique: [
      'Entra dentro la barra',
      'Presa neutra sulle maniglie',
      'Busto naturalmente più verticale',
      'Spingi il pavimento come in uno squat'
    ]
  },

  'Nordic Hamstring Curl': {
    description: 'Esercizio avanzato per femorali. Scendi lentamente controllandoti con i muscoli posteriori della coscia.',
    technique: [
      'Caviglie bloccate',
      'Corpo dritto come una tavola',
      'Scendi il più lentamente possibile',
      'Usa le mani per aiutarti a risalire'
    ]
  },

  'Leg Curl (Machine)': {
    description: 'Isolamento puro per ischiocrurali. Movimento semplice e sicuro per sviluppare i femorali.',
    technique: [
      'Ginocchia allineate con il perno della macchina',
      'Contrai completamente in alto',
      'Fase negativa lenta e controllata',
      'Non inarcare la schiena'
    ]
  },

  // ============================================
  // HORIZONTAL PUSH (Bench Press pattern)
  // ============================================

  'Standard Push-up': {
    description: 'Esercizio classico per petto e tricipiti. Spingi il corpo dal pavimento mantenendo il corpo rigido.',
    technique: [
      'Scapole retratte in partenza',
      'Mani poco più larghe delle spalle',
      'Corpo in linea retta (plank)',
      'Gomiti a 45° dal corpo'
    ]
  },

  'Diamond Push-up': {
    description: 'Push-up con mani vicine a forma di diamante. Massimo focus sui tricipiti e petto interno.',
    technique: [
      'Scapole retratte in partenza',
      'Pollici e indici si toccano',
      'Gomiti stretti al corpo',
      'Core contrattissimo'
    ]
  },

  'Archer Push-up': {
    description: 'Push-up asimmetrico che prepara al one-arm push-up. Un braccio lavora, l\'altro assiste.',
    technique: [
      'Scapole retratte in partenza',
      'Mani molto larghe',
      'Un braccio si piega, l\'altro resta teso',
      'Mantieni il core stabile'
    ]
  },

  'Flat Barbell Bench Press': {
    description: 'Esercizio fondamentale per la forza del petto. Spingi il bilanciere dal petto alle braccia tese.',
    technique: [
      'Scapole addotte e depresse',
      'Arco lombare naturale',
      'Bilanciere tocca il petto basso',
      'Spingi verso l\'alto e indietro'
    ]
  },

  'Incline Bench Press': {
    description: 'Panca inclinata per enfatizzare il petto alto. Angolo 30-45° per massimo stimolo.',
    technique: [
      'Scapole addotte e depresse',
      'Panca inclinata 30-45°',
      'Bilanciere tocca la clavicola',
      'Gomiti leggermente più aperti'
    ]
  },

  'Decline Bench Press': {
    description: 'Panca declinata per il petto basso. Minor stress sulle spalle rispetto alla panca piana.',
    technique: [
      'Scapole addotte e depresse',
      'Panca declinata 15-30°',
      'Bilanciere tocca il petto basso',
      'Gambe ben bloccate'
    ]
  },

  'Dumbbell Bench Press': {
    description: 'Panca con manubri per maggiore ROM e attivazione degli stabilizzatori. Ottimo per simmetria.',
    technique: [
      'Scapole addotte e depresse',
      'Manubri alla larghezza delle spalle',
      'Scendi fino a sentire stretch nel petto',
      'Spingi convergendo in alto'
    ]
  },

  'Chest Dips': {
    description: 'Dip alle parallele con focus sul petto. Inclinazione in avanti per massimo stretch pettorale.',
    technique: [
      'Scapole retratte in partenza',
      'Busto inclinato in avanti',
      'Gomiti larghi',
      'Scendi fino a 90° o più'
    ]
  },

  // ============================================
  // VERTICAL PUSH (Overhead Press)
  // ============================================

  'Pike Push-up': {
    description: 'Push-up a V rovesciata per le spalle. Propedeutico al handstand push-up.',
    technique: [
      'Scapole retratte in partenza',
      'Forma una V rovesciata col corpo',
      'Testa verso il pavimento tra le mani',
      'Gomiti verso fuori'
    ]
  },

  'Wall Handstand Push-up': {
    description: 'Push-up in verticale contro il muro. Esercizio avanzato per forza esplosiva delle spalle.',
    technique: [
      'Scapole retratte in partenza',
      'Mani a 10-15cm dal muro',
      'Testa tocca il pavimento',
      'Core sempre contratto'
    ]
  },

  'Military Press (Barbell)': {
    description: 'Press in piedi con bilanciere. Esercizio fondamentale per forza delle spalle e stabilità del core.',
    technique: [
      'Scapole addotte e depresse',
      'Presa poco più larga delle spalle',
      'Bilanciere parte dalle clavicole',
      'Blocca glutei e core'
    ]
  },

  'Dumbbell Shoulder Press': {
    description: 'Press con manubri per maggiore ROM e lavoro degli stabilizzatori. Ottimo per simmetria.',
    technique: [
      'Scapole addotte e depresse',
      'Manubri all\'altezza delle orecchie',
      'Gomiti sotto i polsi',
      'Non inarcare la schiena'
    ]
  },

  'Arnold Press': {
    description: 'Press con rotazione inventato da Arnold. Coinvolge tutti e tre i capi del deltoide.',
    technique: [
      'Scapole addotte e depresse',
      'Parti con manubri davanti, palmi verso di te',
      'Ruota mentre spingi',
      'Movimento fluido e controllato'
    ]
  },

  'Push Press': {
    description: 'Press con assistenza delle gambe. Permette carichi più pesanti e sviluppa potenza esplosiva.',
    technique: [
      'Scapole addotte e depresse',
      'Piccolo dip con le ginocchia',
      'Estendi gambe esplosivamente',
      'Blocca in alto'
    ]
  },

  // ============================================
  // VERTICAL PULL (Pull-up/Lat Pulldown)
  // ============================================

  'Standard Pull-up': {
    description: 'Re degli esercizi per la schiena. Tira il corpo verso la sbarra con presa prona.',
    technique: [
      'Scapole retratte in partenza',
      'Presa poco più larga delle spalle',
      'Tira i gomiti verso il basso',
      'Mento sopra la sbarra'
    ]
  },

  'Wide Grip Pull-up': {
    description: 'Pull-up con presa molto larga. Maggiore enfasi sulla larghezza dorsale e minor coinvolgimento bicipiti.',
    technique: [
      'Scapole retratte in partenza',
      'Presa 1.5x larghezza spalle',
      'Gomiti puntano verso l\'esterno',
      'Petto verso la sbarra'
    ]
  },

  'Chin-up (Supinated)': {
    description: 'Trazioni con presa supina (palmi verso di te). Maggiore coinvolgimento dei bicipiti.',
    technique: [
      'Scapole retratte in partenza',
      'Presa larghezza spalle, palmi verso di te',
      'Gomiti stretti al corpo',
      'Tira fino al mento sopra'
    ]
  },

  'Neutral Grip Pull-up': {
    description: 'Trazioni con presa neutra (palmi uno di fronte all\'altro). Più facile per le spalle.',
    technique: [
      'Scapole retratte in partenza',
      'Usa maniglie parallele',
      'Gomiti stretti durante la trazione',
      'Buon compromesso tra pull-up e chin-up'
    ]
  },

  'Lat Pulldown (Machine)': {
    description: 'Versione alla macchina della trazione. Permette carichi progressivi e variabili.',
    technique: [
      'Scapole addotte e depresse',
      'Petto in fuori, leggera inclinazione indietro',
      'Tira la barra al petto alto',
      'Non usare slancio'
    ]
  },

  'Assisted Pull-up': {
    description: 'Pull-up con assistenza della macchina. Perfetto per costruire la forza necessaria alle trazioni libere.',
    technique: [
      'Scapole retratte in partenza',
      'Ginocchia o piedi sulla piattaforma',
      'Stessa tecnica del pull-up normale',
      'Riduci assistenza progressivamente'
    ]
  },

  // ============================================
  // HORIZONTAL PULL (Row pattern)
  // ============================================

  'Inverted Row': {
    description: 'Rematore a corpo libero sotto una sbarra. Ottima alternativa al rematore con pesi.',
    technique: [
      'Scapole retratte in partenza',
      'Corpo dritto come una tavola',
      'Tira il petto verso la sbarra',
      'Gomiti a 45° dal corpo'
    ]
  },

  'Barbell Row': {
    description: 'Rematore con bilanciere per spessore dorsale. Movimento compound per tutta la schiena.',
    technique: [
      'Scapole addotte e depresse',
      'Busto inclinato 45°, schiena neutra',
      'Tira il bilanciere verso l\'ombelico',
      'Gomiti stretti al corpo'
    ]
  },

  'Dumbbell Row': {
    description: 'Rematore unilaterale con manubrio. Permette maggiore ROM e correzione di squilibri.',
    technique: [
      'Scapole retratte in partenza',
      'Un ginocchio e mano sulla panca',
      'Tira il gomito verso il soffitto',
      'Non usare slancio'
    ]
  },

  'Seated Cable Row': {
    description: 'Rematore ai cavi da seduto. Tensione costante durante tutto il movimento.',
    technique: [
      'Scapole addotte e depresse',
      'Schiena dritta, petto in fuori',
      'Tira verso l\'addome basso',
      'Stringi le scapole indietro'
    ]
  },

  'T-Bar Row': {
    description: 'Rematore con T-bar per massimo carico. Ottimo per costruire spessore nella schiena.',
    technique: [
      'Scapole addotte e depresse',
      'Busto quasi parallelo al pavimento',
      'Tira verso il petto',
      'Non arrotondare la schiena'
    ]
  },

  // ============================================
  // CORE
  // ============================================

  'Plank': {
    description: 'Esercizio base per la stabilità del core. Mantieni la posizione il più a lungo possibile.',
    technique: [
      'Gomiti sotto le spalle',
      'Corpo in linea retta',
      'Glutei contratti',
      'Non far cadere i fianchi'
    ]
  },

  'Side Plank': {
    description: 'Plank laterale per gli obliqui e la stabilità laterale. Ottimo per prevenire infortuni.',
    technique: [
      'Gomito sotto la spalla',
      'Corpo in linea retta laterale',
      'Fianchi alti',
      'Non ruotare il bacino'
    ]
  },

  'Hanging Leg Raise': {
    description: 'Alzate gambe alla sbarra per addominali bassi. Richiede buona presa e controllo.',
    technique: [
      'Appeso alla sbarra, braccia tese',
      'Alza le gambe fino a 90° o più',
      'Non oscillare',
      'Scendi controllato'
    ]
  },

  'Ab Wheel Rollout': {
    description: 'Rollout con ruota per addominali. Esercizio avanzato per core anti-estensione.',
    technique: [
      'Parti in ginocchio',
      'Core contratto durante tutto il movimento',
      'Vai solo fin dove controlli',
      'Non inarcare la schiena'
    ]
  },

  'Cable Crunch': {
    description: 'Crunch ai cavi per carico progressivo sugli addominali. Permette di aggiungere resistenza.',
    technique: [
      'In ginocchio, corda dietro la testa',
      'Fletti il busto verso le ginocchia',
      'Contrai gli addominali',
      'Non tirare con le braccia'
    ]
  },

  'Pallof Press': {
    description: 'Press anti-rotazione ai cavi. Perfetto per stabilità del core e prevenzione infortuni.',
    technique: [
      'Cavo all\'altezza del petto',
      'Spingi le mani in avanti',
      'Resisti alla rotazione',
      'Core sempre contratto'
    ]
  },

  // === TRICIPITI ===
  'Tricep Dips': {
    description: 'Dip alle parallele per tricipiti e petto. Esercizio compound a corpo libero molto efficace per la massa delle braccia.',
    technique: [
      'Presa salda sulle parallele',
      'Scendi fino a 90° di flessione gomito',
      'Gomiti vicini al corpo per tricipiti',
      'Spingi verticalmente senza oscillare',
      'Non bloccare completamente i gomiti in alto'
    ]
  },

  'Tricep Pushdown': {
    description: 'Pushdown ai cavi per isolamento tricipiti. Permette di mantenere tensione costante durante tutto il movimento.',
    technique: [
      'Gomiti fermi ai fianchi',
      'Spingi la barra/corda verso il basso',
      'Estendi completamente i gomiti',
      'Contrai il tricipite in basso',
      'Risali controllato senza alzare i gomiti'
    ]
  },

  'Skull Crushers': {
    description: 'French press con bilanciere per tricipiti. Ottimo per il capo lungo del tricipite, richiede controllo.',
    technique: [
      'Sdraiato su panca, bilanciere sopra la fronte',
      'Gomiti fissi, fletti solo gli avambracci',
      'Scendi controllato verso la fronte',
      'Estendi completamente in alto',
      'Non allargare i gomiti'
    ]
  },

  // === BICIPITI ===
  'Barbell Curl': {
    description: 'Curl con bilanciere per bicipiti. Esercizio fondamentale per la massa dei bicipiti con carico elevato.',
    technique: [
      'Presa supina larghezza spalle',
      'Gomiti fermi ai fianchi',
      'Curla il peso contraendo i bicipiti',
      'Non oscillare con il busto',
      'Scendi controllato senza estendere completamente'
    ]
  },

  'Hammer Curl': {
    description: 'Curl a martello per bicipiti e brachiale. Ottimo per lo sviluppo del brachioradiale e la larghezza del braccio.',
    technique: [
      'Manubri con presa neutra (pollici in alto)',
      'Gomiti fermi ai fianchi',
      'Curla alternato o simultaneo',
      'Contrai in alto per 1 secondo',
      'Scendi controllato'
    ]
  },

  'Chin-up': {
    description: 'Trazioni presa supina per dorsali e bicipiti. Variante che enfatizza maggiormente i bicipiti rispetto alle trazioni prone.',
    technique: [
      'Presa supina larghezza spalle',
      'Parti da braccia distese',
      'Tira portando il mento sopra la sbarra',
      'Scapole addotte durante la trazione',
      'Scendi controllato senza oscillare'
    ]
  },

  // === POLPACCI ===
  'Standing Calf Raise': {
    description: 'Calf raise in piedi per gastrocnemio. Lavora principalmente il polpaccio nella sua porzione superiore.',
    technique: [
      'Avampiedi sulla pedana, talloni liberi',
      'Gambe quasi completamente estese',
      'Sali sulle punte il più possibile',
      'Contrai in alto per 2 secondi',
      'Scendi lentamente sotto il parallelo'
    ]
  },

  'Seated Calf Raise': {
    description: 'Calf raise da seduto per soleo. Lavora il muscolo profondo del polpaccio con ginocchia flesse.',
    technique: [
      'Seduto con ginocchia a 90°',
      'Avampiedi sulla pedana',
      'Spingi sulle punte sollevando il peso',
      'Contrai in alto per 2 secondi',
      'Scendi lentamente per stretch completo'
    ]
  }
};

/**
 * Trova descrizione e technique per un esercizio dato il nome
 * Cerca prima negli esercizi normali, poi negli esercizi correttivi
 */
export function getExerciseDescription(exerciseName: string): ExerciseDescription | null {
  // Cerca match esatto negli esercizi normali (case-insensitive)
  const key = Object.keys(EXERCISE_DESCRIPTIONS).find(
    k => k.toLowerCase() === exerciseName.toLowerCase()
  );

  if (key) {
    return EXERCISE_DESCRIPTIONS[key];
  }

  // Se non trovato, cerca negli esercizi correttivi
  const correctiveKey = Object.keys(CORRECTIVE_EXERCISE_DESCRIPTIONS).find(
    k => k.toLowerCase() === exerciseName.toLowerCase()
  );

  if (correctiveKey) {
    return CORRECTIVE_EXERCISE_DESCRIPTIONS[correctiveKey];
  }

  return null;
}
