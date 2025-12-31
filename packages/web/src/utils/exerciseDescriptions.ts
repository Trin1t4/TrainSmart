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
  },

  // ============================================
  // ALIAS ITALIANI E NOMI COMUNI
  // ============================================

  'Deadlift': {
    description: 'Movimento fondamentale per catena posteriore. Stacchi da terra con bilanciere per massimo sviluppo forza.',
    technique: [
      'Piedi larghezza anca sotto il bilanciere',
      'Presa poco oltre la larghezza spalle',
      'Schiena neutra, petto in fuori',
      'Spingi coi piedi, non tirare con la schiena',
      'Lockout completando con anche, non iperestendendo'
    ]
  },

  'Stacco': {
    description: 'Movimento fondamentale per catena posteriore. Stacchi da terra con bilanciere per massimo sviluppo forza.',
    technique: [
      'Piedi larghezza anca sotto il bilanciere',
      'Presa poco oltre la larghezza spalle',
      'Schiena neutra, petto in fuori',
      'Spingi coi piedi, non tirare con la schiena',
      'Lockout completando con anche, non iperestendendo'
    ]
  },

  'Bench Press': {
    description: 'Fondamentale per petto, spalle e tricipiti. Panca piana con bilanciere per sviluppo forza upper body.',
    technique: [
      'Scapole retratte e depresse',
      'Piedi piantati a terra',
      'Arco lombare naturale',
      'Barra tocca al centro del petto',
      'Spingi esplosivamente mantenendo controllo'
    ]
  },

  'Panca Piana': {
    description: 'Fondamentale per petto, spalle e tricipiti. Panca piana con bilanciere per sviluppo forza upper body.',
    technique: [
      'Scapole retratte e depresse',
      'Piedi piantati a terra',
      'Arco lombare naturale',
      'Barra tocca al centro del petto',
      'Spingi esplosivamente mantenendo controllo'
    ]
  },

  'Squat': {
    description: 'Re degli esercizi per le gambe. Squat con bilanciere per massimo sviluppo quadricipiti, glutei e core.',
    technique: [
      'Bilanciere sulla trap, non sul collo',
      'Piedi larghezza spalle',
      'Peso su tripode del piede',
      'Scendi sotto il parallelo se mobilità lo permette',
      'Spingi esplosivamente mantenendo il busto verticale'
    ]
  },

  'Military Press': {
    description: 'Overhead press verticale per deltoidi. Movimento fondamentale per sviluppo spalle e stabilità core.',
    technique: [
      'Piedi larghezza anca, core attivo',
      'Barra parte dalle clavicole',
      'Spingi verso l\'alto e leggermente indietro',
      'Testa passa attraverso nella fase finale',
      'Lockout completo con bicipiti vicino alle orecchie'
    ]
  },

  'Lat Pulldown': {
    description: 'Lat machine per sviluppo dorsali. Movimento verticale per schiena larga e spessa.',
    technique: [
      'Presa poco oltre larghezza spalle',
      'Scapole depresse, petto in fuori',
      'Tira verso lo sterno, non verso il mento',
      'Gomiti verso il basso e indietro',
      'Contrai dorsali in basso per 1 secondo'
    ]
  },

  'Crunch ai Cavi': {
    description: 'Crunch con resistenza progressiva. Isola addominali superiori con tensione costante.',
    technique: [
      'Inginocchiato con corda dietro la testa',
      'Piega il busto contraendo gli addominali',
      'Gomiti verso le ginocchia',
      'Mantieni tensione costante',
      'Non tirare con le braccia, usa gli addominali'
    ]
  },

  // ============================================
  // CALISTHENICS - ESERCIZI AGGIUNTIVI
  // ============================================

  'Squat a Corpo Libero': {
    description: 'Movimento base per gambe. Scendi come se ti sedessi su una sedia invisibile, mantenendo il peso distribuito sul piede.',
    technique: [
      'Piedi larghezza spalle',
      'Peso su tripode (tallone + base alluce + mignolo)',
      'Ginocchia in linea con le punte',
      'Core attivo, schiena neutra'
    ]
  },

  'Squat con Salto': {
    description: 'Squat esplosivo con fase di volo. Sviluppa potenza e forza reattiva nelle gambe.',
    technique: [
      'Scendi in squat profondo',
      'Esplodi verso l\'alto con massima velocità',
      'Atterra morbido sugli avampiedi',
      'Ammortizza l\'impatto flettendo le ginocchia'
    ]
  },

  'Shrimp Squat': {
    description: 'Squat su una gamba con gamba posteriore piegata. Esercizio avanzato per forza unilaterale.',
    technique: [
      'Afferra la caviglia dietro con la mano',
      'Scendi lentamente sulla gamba d\'appoggio',
      'Ginocchio posteriore tocca terra',
      'Mantieni il busto il più verticale possibile'
    ]
  },

  'Skater Squat': {
    description: 'Squat unilaterale con gamba libera dietro. Ottimo per equilibrio e forza monopodalica.',
    technique: [
      'Gamba libera leggermente piegata dietro',
      'Scendi controllato sulla gamba d\'appoggio',
      'Braccia avanti per equilibrio',
      'Non appoggiare la gamba libera a terra'
    ]
  },

  'Hip Thrust': {
    description: 'Esercizio principale per i glutei. Spinta del bacino verso l\'alto con massima attivazione glutea.',
    technique: [
      'Scapole appoggiate su panca',
      'Piedi larghezza anche',
      'Spingi con i talloni',
      'Stringi i glutei in cima al movimento',
      'Mento leggermente verso il petto'
    ]
  },

  'Ponte Glutei': {
    description: 'Ponte a terra per attivazione glutei. Base per progressione verso hip thrust.',
    technique: [
      'Sdraiato supino, ginocchia piegate',
      'Piedi vicino ai glutei',
      'Spingi bacino verso l\'alto',
      'Stringi i glutei in cima',
      'Non iperestendere la schiena'
    ]
  },

  'Slider Leg Curl': {
    description: 'Curl femorali a corpo libero con slider o asciugamano. Ottimo per femorali senza attrezzi.',
    technique: [
      'Supino con talloni su slider',
      'Solleva il bacino (ponte)',
      'Trascina i talloni verso i glutei',
      'Mantieni i fianchi alti',
      'Torna lentamente controllando'
    ]
  },

  'Trazioni': {
    description: 'Esercizio fondamentale per dorsali e bicipiti. Tira il corpo verso la sbarra.',
    technique: [
      'Presa salda, leggermente più larga delle spalle',
      'Scapole retratte e depresse',
      'Tira i gomiti verso i fianchi',
      'Mento sopra la sbarra',
      'Scendi controllato'
    ]
  },

  'Rematore Inverso': {
    description: 'Row orizzontale a corpo libero. Ottimo per dorsali e propedeutico alle trazioni.',
    technique: [
      'Corpo rigido come un plank',
      'Tira il petto verso la sbarra',
      'Scapole retratte',
      'Gomiti vicino al corpo',
      'Scendi controllato'
    ]
  },

  'Rematore Inverso Facilitato': {
    description: 'Versione facilitata del rematore inverso con ginocchia piegate. Ideale per principianti.',
    technique: [
      'Posizionati sotto un tavolo o sbarra bassa',
      'Piega le ginocchia per ridurre la difficoltà',
      'Mantieni il corpo in linea dai ginocchi alle spalle',
      'Tira il petto verso la sbarra retraendo le scapole',
      'Scendi controllato senza perdere la tensione'
    ]
  },

  'Rematore Inverso Presa Larga': {
    description: 'Variante del rematore inverso con presa più larga delle spalle. Enfatizza i dorsali e deltoidi posteriori.',
    technique: [
      'Impugna la sbarra più larga delle spalle',
      'Corpo rigido dalla testa ai talloni',
      'Tira i gomiti verso l\'esterno',
      'Spremi le scapole insieme in cima',
      'Scendi in modo controllato'
    ]
  },

  'Rematore Inverso Piedi Elevati': {
    description: 'Versione avanzata del rematore inverso con piedi su rialzo. Aumenta il carico sui dorsali.',
    technique: [
      'Posiziona i piedi su una sedia o rialzo',
      'Mantieni il corpo perfettamente rigido',
      'Tira il petto fino alla sbarra',
      'Scapole retratte e depresse',
      'Controlla la discesa lentamente'
    ]
  },

  'Superman Row': {
    description: 'Esercizio a terra per dorsali senza attrezzatura. Simula il movimento del rematore da prono.',
    technique: [
      'Distenditi a pancia in giù',
      'Braccia tese davanti alla testa',
      'Solleva petto e braccia da terra',
      'Porta i gomiti indietro come in una remata',
      'Torna alla posizione di partenza controllato'
    ]
  },

  'Prone Y Raise': {
    description: 'Esercizio a terra per dorsali e deltoidi posteriori. Braccia formano una Y.',
    technique: [
      'Distenditi prono a terra',
      'Braccia tese formando una Y davanti',
      'Pollici verso l\'alto',
      'Solleva le braccia contraendo la schiena',
      'Mantieni 2-3 secondi in cima'
    ]
  },

  'Dead Bug': {
    description: 'Esercizio anti-estensione per core. Braccia e gambe si muovono in modo opposto.',
    technique: [
      'Supino, braccia verso il soffitto',
      'Ginocchia a 90° sopra i fianchi',
      'Premi la schiena a terra',
      'Estendi braccio e gamba opposti',
      'Mantieni la schiena piatta'
    ]
  },

  'Bird Dog': {
    description: 'Esercizio anti-rotazione per core. Estendi braccio e gamba opposti mantenendo stabilità.',
    technique: [
      'Quattro zampe, mani sotto spalle',
      'Core attivo, schiena neutra',
      'Estendi braccio e gamba opposti',
      'Non ruotare i fianchi',
      'Torna lentamente controllando'
    ]
  },

  'Hollow Body Hold': {
    description: 'Tenuta isometrica anti-estensione. Fondamentale per ginnastica e calisthenics.',
    technique: [
      'Supino, braccia sopra la testa',
      'Solleva spalle e gambe da terra',
      'Premi la schiena bassa a terra',
      'Corpo a forma di banana',
      'Mantieni la posizione senza tremare'
    ]
  },

  'L-sit': {
    description: 'Tenuta isometrica avanzata. Gambe tese in avanti sostenendo il corpo con le braccia.',
    technique: [
      'Mani a terra ai lati dei fianchi',
      'Spingi forte per sollevare il corpo',
      'Gambe tese e parallele al pavimento',
      'Core e quadricipiti contratti',
      'Spalle depresse'
    ]
  },

  'Dragon Flag': {
    description: 'Esercizio core avanzato reso famoso da Bruce Lee. Richiede forza estrema del core.',
    technique: [
      'Supino, aggrappato a supporto dietro la testa',
      'Solleva tutto il corpo mantenendolo rigido',
      'Solo le spalle toccano la panca',
      'Scendi lentamente controllando',
      'Non flettere i fianchi'
    ]
  },

  'Copenhagen Plank': {
    description: 'Plank laterale con adduttori. Rafforza gli adduttori e la stabilità laterale.',
    technique: [
      'Gomito a terra, gamba superiore su panca',
      'Gamba inferiore libera',
      'Solleva i fianchi creando linea retta',
      'Attiva gli adduttori della gamba superiore',
      'Mantieni il core contratto'
    ]
  },

  'Push-up Diamante': {
    description: 'Push-up con mani vicine a forma di diamante. Enfatizza tricipiti e petto interno.',
    technique: [
      'Mani unite formando un diamante',
      'Gomiti vicino al corpo',
      'Scendi controllato',
      'Petto tocca le mani',
      'Spingi forte tornando su'
    ]
  },

  'Push-up Arciere': {
    description: 'Push-up unilaterale. Un braccio lavora mentre l\'altro assiste. Propedeutico per push-up a un braccio.',
    technique: [
      'Mani molto larghe',
      'Piega un braccio, l\'altro resta teso',
      'Sposta il peso sul braccio piegato',
      'Alterna i lati',
      'Mantieni il core attivo'
    ]
  },

  'Rematore con Bilanciere': {
    description: 'Row con bilanciere per dorsali e trapezi. Movimento fondamentale per la schiena.',
    technique: [
      'Busto inclinato a 45°',
      'Schiena neutra, core attivo',
      'Tira il bilanciere verso l\'ombelico',
      'Scapole retratte in cima',
      'Scendi controllato'
    ]
  },

  'Rematore con Manubrio': {
    description: 'Row unilaterale con manubrio. Ottimo per correggere squilibri e isolare un lato.',
    technique: [
      'Una mano e ginocchio su panca',
      'Schiena parallela al pavimento',
      'Tira il manubrio verso il fianco',
      'Gomito vicino al corpo',
      'Scendi controllato'
    ]
  },

  'Pulley Basso': {
    description: 'Row seduto ai cavi. Movimento controllato per dorsali con tensione costante.',
    technique: [
      'Seduto con petto alto',
      'Tira l\'handle verso l\'ombelico',
      'Scapole retratte in cima',
      'Non oscillare con il busto',
      'Torna controllato mantenendo tensione'
    ]
  },

  'Alzate Laterali': {
    description: 'Isolamento per deltoidi laterali. Braccia tese, movimento controllato.',
    technique: [
      'Leggera flessione dei gomiti',
      'Solleva le braccia lateralmente',
      'Ferma a livello delle spalle',
      'Controlla la discesa',
      'Non oscillare con il corpo'
    ]
  },

  'Face Pull': {
    description: 'Esercizio per deltoidi posteriori e salute delle spalle. Essenziale per bilanciare push e pull.',
    technique: [
      'Cavo all\'altezza del viso',
      'Tira verso il viso separando le mani',
      'Gomiti alti, rotazione esterna',
      'Stringi le scapole',
      'Torna controllato'
    ]
  },

  // ============================================
  // ALTERNATIVE BODYWEIGHT (da locationAdapter)
  // ============================================

  'Floor Pull (asciugamano)': {
    description: 'Trazione a terra usando un asciugamano. Alternativa alle trazioni quando non hai sbarra.',
    technique: [
      'Sdraiato prono con asciugamano teso davanti',
      'Afferra le estremità dell\'asciugamano',
      'Tira il petto da terra tirando l\'asciugamano',
      'Scapole retratte e depresse',
      'Mantieni core attivo durante il movimento'
    ]
  },

  'Floor Pull con Asciugamano': {
    description: 'Trazione a terra usando un asciugamano. Alternativa alle trazioni quando non hai sbarra.',
    technique: [
      'Sdraiato prono con asciugamano teso davanti',
      'Afferra le estremità dell\'asciugamano',
      'Tira il petto da terra tirando l\'asciugamano',
      'Scapole retratte e depresse',
      'Mantieni core attivo durante il movimento'
    ]
  },

  'Floor Pull Facilitato': {
    description: 'Versione facilitata del floor pull con ginocchia piegate. Per principianti.',
    technique: [
      'Sdraiato prono con ginocchia piegate',
      'Asciugamano teso davanti a te',
      'Tira sollevando solo il petto',
      'Movimento più breve e controllato',
      'Aumenta gradualmente il ROM'
    ]
  },

  'Floor Pull a Un Braccio': {
    description: 'Floor pull unilaterale per massima intensità. Esercizio avanzato per dorsali.',
    technique: [
      'Sdraiato prono, un braccio teso con asciugamano',
      'L\'altro braccio stabilizza',
      'Tira con un braccio solo',
      'Mantieni i fianchi a terra',
      'Alterna i lati'
    ]
  },

  'Inverted Row (tavolo)': {
    description: 'Rematore inverso usando un tavolo robusto. Ottima alternativa casalinga alle trazioni.',
    technique: [
      'Sdraiato sotto un tavolo robusto',
      'Afferra il bordo del tavolo',
      'Tira il petto verso il tavolo',
      'Corpo rigido come un plank',
      'Scendi controllato'
    ]
  },

  'Rematore Inverso (tavolo)': {
    description: 'Rematore inverso usando un tavolo robusto. Ottima alternativa casalinga alle trazioni.',
    technique: [
      'Sdraiato sotto un tavolo robusto',
      'Afferra il bordo del tavolo',
      'Tira il petto verso il tavolo',
      'Corpo rigido come un plank',
      'Scendi controllato'
    ]
  },

  'Inverted Row Facilitato': {
    description: 'Rematore inverso con angolo più verticale. Versione più facile per principianti.',
    technique: [
      'Sbarra o tavolo ad altezza media',
      'Piedi più avanti per ridurre difficoltà',
      'Tira il petto verso la sbarra',
      'Mantieni il corpo allineato',
      'Progredisci abbassando la sbarra'
    ]
  },

  'Rematore Inverso Facilitato': {
    description: 'Rematore inverso con angolo più verticale. Versione più facile per principianti.',
    technique: [
      'Sbarra o tavolo ad altezza media',
      'Piedi più avanti per ridurre difficoltà',
      'Tira il petto verso la sbarra',
      'Mantieni il corpo allineato',
      'Progredisci abbassando la sbarra'
    ]
  },

  'Inverted Row Singolo Braccio': {
    description: 'Rematore inverso con un braccio solo. Esercizio avanzato per forza unilaterale.',
    technique: [
      'Sotto sbarra o tavolo',
      'Un braccio afferra, l\'altro sul petto',
      'Tira con un braccio solo',
      'Ruota leggermente il busto',
      'Alterna i lati'
    ]
  },

  'Rematore Inverso a Un Braccio': {
    description: 'Rematore inverso con un braccio solo. Esercizio avanzato per forza unilaterale.',
    technique: [
      'Sotto sbarra o tavolo',
      'Un braccio afferra, l\'altro sul petto',
      'Tira con un braccio solo',
      'Ruota leggermente il busto',
      'Alterna i lati'
    ]
  },

  'Inverted Row Piedi Elevati': {
    description: 'Rematore inverso con piedi su rialzo. Aumenta la difficoltà del movimento.',
    technique: [
      'Piedi su sedia o panca',
      'Corpo più orizzontale',
      'Tira il petto alla sbarra',
      'Core sempre attivo',
      'Scendi lentamente'
    ]
  },

  'Rematore Inverso Piedi Elevati': {
    description: 'Rematore inverso con piedi su rialzo. Aumenta la difficoltà del movimento.',
    technique: [
      'Piedi su sedia o panca',
      'Corpo più orizzontale',
      'Tira il petto alla sbarra',
      'Core sempre attivo',
      'Scendi lentamente'
    ]
  },

  'Scapular Pull (a terra)': {
    description: 'Retrazione scapolare a terra. Esercizio base per attivazione dorsale.',
    technique: [
      'Sdraiato prono, braccia tese in avanti',
      'Solleva le braccia retraendo le scapole',
      'Non piegare i gomiti',
      'Stringi le scapole insieme',
      'Tieni 2-3 secondi in cima'
    ]
  },

  'Retrazione Scapolare a Terra': {
    description: 'Retrazione scapolare a terra. Esercizio base per attivazione dorsale.',
    technique: [
      'Sdraiato prono, braccia tese in avanti',
      'Solleva le braccia retraendo le scapole',
      'Non piegare i gomiti',
      'Stringi le scapole insieme',
      'Tieni 2-3 secondi in cima'
    ]
  },

  'Band Pull-apart': {
    description: 'Aperture con elastico per deltoidi posteriori. Ottimo per salute spalle.',
    technique: [
      'Elastico teso davanti al petto',
      'Braccia tese, palmi in giù',
      'Apri le braccia tirando l\'elastico',
      'Stringi le scapole insieme',
      'Torna controllato'
    ]
  },

  'Prone Y-raise': {
    description: 'Alzate a Y da prono per trapezio e deltoidi posteriori.',
    technique: [
      'Sdraiato a pancia in giù',
      'Braccia tese formando una Y',
      'Solleva le braccia da terra',
      'Pollici verso l\'alto',
      'Tieni 2 secondi in cima'
    ]
  },

  'Y-raise Prono': {
    description: 'Alzate a Y da prono per trapezio e deltoidi posteriori.',
    technique: [
      'Sdraiato a pancia in giù',
      'Braccia tese formando una Y',
      'Solleva le braccia da terra',
      'Pollici verso l\'alto',
      'Tieni 2 secondi in cima'
    ]
  },

  // ============================================
  // PUSH-UP VARIANTI
  // ============================================

  'Knee Push-up': {
    description: 'Push-up sulle ginocchia. Versione facilitata per costruire forza.',
    technique: [
      'Ginocchia a terra, piedi sollevati',
      'Corpo dritto dalle ginocchia alle spalle',
      'Mani poco più larghe delle spalle',
      'Scendi controllato',
      'Spingi forte tornando su'
    ]
  },

  'Push-up sulle Ginocchia': {
    description: 'Push-up sulle ginocchia. Versione facilitata per costruire forza.',
    technique: [
      'Ginocchia a terra, piedi sollevati',
      'Corpo dritto dalle ginocchia alle spalle',
      'Mani poco più larghe delle spalle',
      'Scendi controllato',
      'Spingi forte tornando su'
    ]
  },

  'Wall Push-up': {
    description: 'Push-up al muro. Versione più facile per principianti assoluti.',
    technique: [
      'Mani sul muro a larghezza spalle',
      'Piedi arretrati di un passo',
      'Corpo dritto',
      'Piega i gomiti avvicinando il petto al muro',
      'Spingi tornando alla posizione di partenza'
    ]
  },

  'Push-up al Muro': {
    description: 'Push-up al muro. Versione più facile per principianti assoluti.',
    technique: [
      'Mani sul muro a larghezza spalle',
      'Piedi arretrati di un passo',
      'Corpo dritto',
      'Piega i gomiti avvicinando il petto al muro',
      'Spingi tornando alla posizione di partenza'
    ]
  },

  'Incline Push-up': {
    description: 'Push-up inclinati con mani rialzate. Più facile del push-up standard.',
    technique: [
      'Mani su panca, sedia o scalino',
      'Corpo dritto dai piedi alle spalle',
      'Scendi portando il petto verso il rialzo',
      'Spingi forte tornando su',
      'Abbassa gradualmente l\'altezza per progredire'
    ]
  },

  'Push-up Inclinati': {
    description: 'Push-up inclinati con mani rialzate. Più facile del push-up standard.',
    technique: [
      'Mani su panca, sedia o scalino',
      'Corpo dritto dai piedi alle spalle',
      'Scendi portando il petto verso il rialzo',
      'Spingi forte tornando su',
      'Abbassa gradualmente l\'altezza per progredire'
    ]
  },

  'Deficit Push-up': {
    description: 'Push-up con mani su rialzi per maggiore ROM. Più difficile dello standard.',
    technique: [
      'Mani su blocchi o libri',
      'Scendi più in basso del normale',
      'Senti lo stretch nel petto',
      'Mantieni core attivo',
      'Spingi esplosivamente'
    ]
  },

  'Push-up Deficit': {
    description: 'Push-up con mani su rialzi per maggiore ROM. Più difficile dello standard.',
    technique: [
      'Mani su blocchi o libri',
      'Scendi più in basso del normale',
      'Senti lo stretch nel petto',
      'Mantieni core attivo',
      'Spingi esplosivamente'
    ]
  },

  'Push-up a Un Braccio': {
    description: 'Push-up su un braccio solo. Esercizio molto avanzato per forza e controllo.',
    technique: [
      'Gambe larghe per stabilità',
      'Un braccio al centro del petto',
      'L\'altro braccio dietro la schiena',
      'Scendi lentamente',
      'Spingi forte mantenendo il corpo stabile'
    ]
  },

  'Push-up a Un Braccio (Assistito)': {
    description: 'Push-up a un braccio con assistenza. Propedeutico al one arm push-up.',
    technique: [
      'Un braccio centrale, l\'altro su un rialzo',
      'Il braccio sul rialzo assiste leggermente',
      'Sposta gradualmente più peso sul braccio principale',
      'Mantieni il core attivo',
      'Progredisci riducendo l\'assistenza'
    ]
  },

  // ============================================
  // PIKE PUSH-UP VARIANTI
  // ============================================

  'Pike Push-up (Knee)': {
    description: 'Pike push-up sulle ginocchia. Versione facilitata per costruire forza nelle spalle.',
    technique: [
      'Ginocchia a terra, anche piegate',
      'Forma una V rovesciata',
      'Testa verso il pavimento',
      'Spingi verticalmente',
      'Gomiti verso fuori'
    ]
  },

  'Pike Push-up sulle Ginocchia': {
    description: 'Pike push-up sulle ginocchia. Versione facilitata per costruire forza nelle spalle.',
    technique: [
      'Ginocchia a terra, anche piegate',
      'Forma una V rovesciata',
      'Testa verso il pavimento',
      'Spingi verticalmente',
      'Gomiti verso fuori'
    ]
  },

  'Elevated Pike Push-up': {
    description: 'Pike push-up con piedi rialzati. Aumenta il carico sulle spalle.',
    technique: [
      'Piedi su panca o sedia',
      'Forma V rovesciata più verticale',
      'Testa verso il pavimento tra le mani',
      'Spingi verticalmente',
      'Core sempre contratto'
    ]
  },

  'Pike Push-up Elevato': {
    description: 'Pike push-up con piedi rialzati. Aumenta il carico sulle spalle.',
    technique: [
      'Piedi su panca o sedia',
      'Forma V rovesciata più verticale',
      'Testa verso il pavimento tra le mani',
      'Spingi verticalmente',
      'Core sempre contratto'
    ]
  },

  'Elevated Pike Push-up (High)': {
    description: 'Pike push-up con piedi molto rialzati. Quasi verticale, molto impegnativo.',
    technique: [
      'Piedi su superficie alta (muro, scatola alta)',
      'Corpo quasi verticale',
      'Testa tocca il pavimento',
      'Spingi forte verso l\'alto',
      'Richiede ottimo controllo del core'
    ]
  },

  'Pike Push-up Alto': {
    description: 'Pike push-up con piedi molto rialzati. Quasi verticale, molto impegnativo.',
    technique: [
      'Piedi su superficie alta (muro, scatola alta)',
      'Corpo quasi verticale',
      'Testa tocca il pavimento',
      'Spingi forte verso l\'alto',
      'Richiede ottimo controllo del core'
    ]
  },

  'Wall Shoulder Tap': {
    description: 'Tocchi spalla in posizione verticale al muro. Costruisce stabilità per handstand.',
    technique: [
      'In posizione verticale con piedi al muro',
      'Solleva una mano toccando la spalla opposta',
      'Mantieni i fianchi stabili',
      'Alterna le mani',
      'Core sempre contratto'
    ]
  },

  'Shoulder Tap al Muro': {
    description: 'Tocchi spalla in posizione verticale al muro. Costruisce stabilità per handstand.',
    technique: [
      'In posizione verticale con piedi al muro',
      'Solleva una mano toccando la spalla opposta',
      'Mantieni i fianchi stabili',
      'Alterna le mani',
      'Core sempre contratto'
    ]
  },

  'Wall Handstand Push-up (Eccentric)': {
    description: 'Solo fase eccentrica dell\'HSPU. Per costruire forza nel movimento.',
    technique: [
      'In verticale al muro',
      'Scendi lentamente (4-5 secondi)',
      'Testa tocca il pavimento',
      'Torna su aiutandoti con le gambe',
      'Ripeti la discesa controllata'
    ]
  },

  'HSPU al Muro (Solo Eccentrica)': {
    description: 'Solo fase eccentrica dell\'HSPU. Per costruire forza nel movimento.',
    technique: [
      'In verticale al muro',
      'Scendi lentamente (4-5 secondi)',
      'Testa tocca il pavimento',
      'Torna su aiutandoti con le gambe',
      'Ripeti la discesa controllata'
    ]
  },

  'Freestanding Handstand Push-up': {
    description: 'Handstand push-up senza muro. Livello elite di forza e controllo.',
    technique: [
      'Verticale libera senza supporto',
      'Scendi controllato',
      'Spingi tornando su mantenendo l\'equilibrio',
      'Richiede anni di pratica',
      'Core e spalle fortissimi'
    ]
  },

  'Verticale Push-up Libero': {
    description: 'Handstand push-up senza muro. Livello elite di forza e controllo.',
    technique: [
      'Verticale libera senza supporto',
      'Scendi controllato',
      'Spingi tornando su mantenendo l\'equilibrio',
      'Richiede anni di pratica',
      'Core e spalle fortissimi'
    ]
  },

  // ============================================
  // SQUAT VARIANTI AGGIUNTIVE
  // ============================================

  'Squat Gamberetto': {
    description: 'Squat su una gamba con gamba posteriore piegata. Esercizio avanzato per forza unilaterale.',
    technique: [
      'Afferra la caviglia dietro con la mano',
      'Scendi lentamente sulla gamba d\'appoggio',
      'Ginocchio posteriore tocca terra',
      'Mantieni il busto il più verticale possibile'
    ]
  },

  'Squat del Pattinatore': {
    description: 'Squat unilaterale con gamba libera dietro. Ottimo per equilibrio e forza monopodalica.',
    technique: [
      'Gamba libera leggermente piegata dietro',
      'Scendi controllato sulla gamba d\'appoggio',
      'Braccia avanti per equilibrio',
      'Non appoggiare la gamba libera a terra'
    ]
  },

  'Squat a Pistola': {
    description: 'Squat su una gamba sola. Richiede forza, equilibrio e mobilità eccezionali.',
    technique: [
      'Gamba libera tesa davanti',
      'Braccia avanti per bilanciare',
      'Peso su tripode del piede',
      'Scendi lentamente e controllato'
    ]
  },

  'Squat a Pistola (Assistito)': {
    description: 'Pistol squat con supporto. Per costruire forza verso il pistol completo.',
    technique: [
      'Tieniti a un supporto (porta, TRX, sedia)',
      'Gamba libera tesa davanti',
      'Scendi usando l\'assistenza per bilanciare',
      'Riduci gradualmente l\'aiuto',
      'Spingi tornando su'
    ]
  },

  'Affondi Statici': {
    description: 'Affondo senza spostamento. Ottimo per forza e stabilità delle gambe.',
    technique: [
      'Piedi sfalsati, uno avanti uno dietro',
      'Scendi verticalmente',
      'Entrambe le ginocchia a 90°',
      'Peso distribuito su entrambi i piedi',
      'Spingi tornando su'
    ]
  },

  'Squat Bulgaro': {
    description: 'Squat unilaterale con piede posteriore elevato. Eccellente per forza e equilibrio.',
    technique: [
      'Piede posteriore su panca dietro',
      'Peso su tripode del piede anteriore',
      'Busto leggermente inclinato avanti',
      'Scendi verticalmente'
    ]
  },

  // ============================================
  // LOWER PULL VARIANTI
  // ============================================

  'Leg Curl Scorrevole': {
    description: 'Curl femorali a corpo libero con slider. Ottimo per femorali senza attrezzi.',
    technique: [
      'Supino con talloni su slider o asciugamano',
      'Solleva il bacino (ponte)',
      'Trascina i talloni verso i glutei',
      'Mantieni i fianchi alti',
      'Torna lentamente controllando'
    ]
  },

  'Leg Curl Scorrevole Singolo': {
    description: 'Slider leg curl su una gamba. Versione avanzata per massima intensità.',
    technique: [
      'Un piede su slider, l\'altro in aria',
      'Solleva il bacino',
      'Trascina il tallone verso il gluteo',
      'L\'altra gamba rimane tesa',
      'Controlla il ritorno'
    ]
  },

  'Hip Thrust Monopodalico': {
    description: 'Hip thrust su una gamba. Massima attivazione glutea unilaterale.',
    technique: [
      'Scapole su panca, un piede a terra',
      'L\'altra gamba piegata in aria',
      'Spingi col tallone',
      'Stringi il gluteo in cima',
      'Scendi controllato'
    ]
  },

  'Hip Thrust Elevato': {
    description: 'Hip thrust con piedi rialzati. Aumenta il ROM e l\'intensità.',
    technique: [
      'Scapole su panca, piedi su rialzo',
      'Maggiore escursione del movimento',
      'Spingi forte coi talloni',
      'Stringi i glutei in cima',
      'Scendi lentamente'
    ]
  },

  'Stacco Rumeno Monopodalico': {
    description: 'RDL su una gamba per equilibrio e forza posteriore. Ottimo per glutei e femorali.',
    technique: [
      'In piedi su una gamba',
      'Piega dalle anche, gamba libera va indietro',
      'Schiena neutra durante tutto il movimento',
      'Senti lo stretch nei femorali',
      'Torna su contraendo glutei'
    ]
  },

  'Ponte Glutei Monopodalico': {
    description: 'Ponte a terra su una gamba. Progressione verso hip thrust unilaterale.',
    technique: [
      'Supino, un piede a terra, l\'altro in aria',
      'Spingi col tallone sollevando il bacino',
      'Stringi il gluteo in cima',
      'Non ruotare i fianchi',
      'Scendi controllato'
    ]
  },

  'Nordic Curl (Solo Eccentrica)': {
    description: 'Solo fase negativa del Nordic curl. Per costruire forza per il movimento completo.',
    technique: [
      'Caviglie bloccate',
      'Corpo dritto come una tavola',
      'Scendi il più lentamente possibile',
      'Usa le mani per tornare su',
      'Aumenta gradualmente il tempo di discesa'
    ]
  },

  // ============================================
  // TRAZIONI VARIANTI
  // ============================================

  'Trazioni Negative': {
    description: 'Solo fase eccentrica delle trazioni. Per costruire forza verso le trazioni complete.',
    technique: [
      'Sali con un salto o uno step',
      'Scendi lentamente (5-10 secondi)',
      'Controlla tutto il movimento',
      'Ripeti più volte',
      'Progressione verso trazioni complete'
    ]
  },

  'Trazioni con Elastico': {
    description: 'Trazioni assistite con elastico. Per costruire forza gradualmente.',
    technique: [
      'Elastico ancorato alla sbarra',
      'Piede o ginocchio nell\'elastico',
      'L\'elastico assiste la salita',
      'Stessa tecnica delle trazioni normali',
      'Usa elastici sempre più leggeri'
    ]
  },

  'Trazioni Presa Larga': {
    description: 'Trazioni con presa molto larga. Maggiore enfasi sulla larghezza dorsale.',
    technique: [
      'Presa 1.5x larghezza spalle',
      'Gomiti verso l\'esterno',
      'Tira il petto verso la sbarra',
      'Scapole depresse e retratte',
      'Scendi controllato'
    ]
  },

  'Trazioni Presa Neutra': {
    description: 'Trazioni con presa parallela. Più facile per le spalle, buon coinvolgimento bicipiti.',
    technique: [
      'Usa maniglie parallele',
      'Palmi uno di fronte all\'altro',
      'Gomiti vicini al corpo',
      'Tira fino al petto',
      'Ottimo compromesso tra pull-up e chin-up'
    ]
  },

  'Trazioni Assistite': {
    description: 'Trazioni alla macchina assistita. Per costruire forza verso le trazioni libere.',
    technique: [
      'Ginocchia sulla piattaforma',
      'Imposta il peso di assistenza',
      'Stessa tecnica delle trazioni normali',
      'Riduci l\'assistenza progressivamente',
      'Obiettivo: trazioni a corpo libero'
    ]
  },

  // ============================================
  // ALIAS NOMI ITALIANI TRADOTTI
  // ============================================

  'Lat Machine': {
    description: 'Lat pulldown per sviluppo dorsali. Movimento verticale per schiena larga.',
    technique: [
      'Presa poco oltre larghezza spalle',
      'Scapole depresse, petto in fuori',
      'Tira verso lo sterno',
      'Gomiti verso il basso e indietro',
      'Contrai dorsali per 1 secondo'
    ]
  },

  'Panca Inclinata': {
    description: 'Distensioni su panca inclinata. Enfatizza il petto alto.',
    technique: [
      'Panca a 30-45°',
      'Scapole retratte',
      'Bilanciere tocca la clavicola',
      'Spingi verso l\'alto',
      'Gomiti leggermente più aperti'
    ]
  },

  'Panca Declinata': {
    description: 'Distensioni su panca declinata. Minor stress sulle spalle, focus petto basso.',
    technique: [
      'Panca declinata 15-30°',
      'Gambe bloccate',
      'Scapole retratte',
      'Bilanciere tocca il petto basso',
      'Spingi controllato'
    ]
  },

  'Squat con Bilanciere': {
    description: 'Back squat con bilanciere. Re degli esercizi per le gambe.',
    technique: [
      'Bilanciere sui trapezi',
      'Piedi larghezza spalle',
      'Peso su tripode del piede',
      'Scendi sotto il parallelo',
      'Spingi esplosivamente'
    ]
  },

  'Squat Frontale': {
    description: 'Front squat con bilanciere sulle clavicole. Enfatizza i quadricipiti.',
    technique: [
      'Bilanciere sulle clavicole',
      'Gomiti alti e paralleli al pavimento',
      'Busto il più verticale possibile',
      'Core contratto',
      'Richiede buona mobilità'
    ]
  },

  'Stacco da Terra': {
    description: 'Deadlift convenzionale. Esercizio fondamentale per forza totale.',
    technique: [
      'Bilanciere sopra la metà del piede',
      'Schiena neutra',
      'Spingi il pavimento coi piedi',
      'Blocca glutei e core in alto',
      'Non iperestendere la schiena'
    ]
  },

  'Alzate Gambe a Terra': {
    description: 'Alzate gambe da supino per addominali bassi. Alternativa al leg raise alla sbarra.',
    technique: [
      'Supino con mani sotto i glutei',
      'Gambe tese',
      'Solleva le gambe fino a 90°',
      'Premi la schiena bassa a terra',
      'Scendi controllato senza toccare'
    ]
  },

  'Dips': {
    description: 'Parallele per petto e tricipiti. Esercizio compound molto efficace.',
    technique: [
      'Presa salda sulle parallele',
      'Inclinati avanti per petto, dritto per tricipiti',
      'Scendi fino a 90° di flessione gomito',
      'Spingi tornando su',
      'Non bloccare completamente i gomiti'
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
