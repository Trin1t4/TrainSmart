/**
 * Exercise Descriptions & Technique Cues
 * File separato per facile editing delle descrizioni
 */

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
  // TEST DI POTENZA (SALTI)
  // ============================================

  'Counter Movement Jump': {
    description: 'Test fondamentale per valutare la potenza esplosiva delle gambe. Sfrutta il ciclo stiramento-accorciamento per massimizzare l\'altezza del salto.',
    technique: [
      'Parti in piedi, mani sui fianchi (fisse)',
      'Esegui un rapido contromovimento (dip)',
      'Salta verticalmente con massima esplosività',
      'Atterra morbido sugli avampiedi',
      'Registra l\'altezza raggiunta'
    ]
  },

  'Squat Jump': {
    description: 'Salto da posizione statica senza contromovimento. Misura la potenza concentrica pura senza sfruttare l\'elasticità muscolare.',
    technique: [
      'Parti in posizione di mezzo squat (90° ginocchia)',
      'Mantieni la posizione per 2-3 secondi (elimina il riflesso)',
      'Salta verticalmente senza abbassarti prima',
      'Mani sui fianchi durante tutto il movimento',
      'Confronta con CMJ per valutare l\'efficienza elastica'
    ]
  },

  'Drop Jump': {
    description: 'Caduta da box seguita da rimbalzo immediato. Valuta la capacità reattiva e il Reactive Strength Index (RSI).',
    technique: [
      'Parti su un box (30-40cm)',
      'Lasciati cadere (non saltare giù)',
      'Al contatto, rimbalza immediatamente verso l\'alto',
      'Minimizza il tempo di contatto al suolo',
      'L\'obiettivo è massima altezza con minimo contatto'
    ]
  },

  'Broad Jump': {
    description: 'Salto in lungo da fermo. Misura la potenza orizzontale delle gambe, importante per sprint e cambi di direzione.',
    technique: [
      'Piedi paralleli, larghezza anche',
      'Oscilla le braccia per prendere slancio',
      'Salta in avanti con massima distanza',
      'Atterra su entrambi i piedi',
      'Misura dal punto di partenza al tallone più arretrato'
    ]
  },

  'Box Jump': {
    description: 'Salto su scatola di altezza variabile. Test di esplosività e coordinazione, molto usato nel CrossFit e preparazione atletica.',
    technique: [
      'Parti di fronte al box (altezza appropriata)',
      'Esegui contromovimento con braccia',
      'Salta atterrando con entrambi i piedi sul box',
      'Estendi completamente in alto',
      'Scendi controllato (step down preferito)'
    ]
  },

  'Med Ball Chest Pass': {
    description: 'Lancio palla medica dal petto. Test di potenza upper body, simula movimenti di spinta esplosiva.',
    technique: [
      'Palla medica (3-5kg) al petto',
      'Posizione atletica, piedi larghezza spalle',
      'Spingi la palla in avanti con massima forza',
      'Estendi completamente le braccia',
      'Misura la distanza del lancio'
    ]
  },

  'Med Ball Overhead Throw': {
    description: 'Lancio palla medica sopra la testa all\'indietro. Test di potenza totale del corpo, coinvolge catena posteriore.',
    technique: [
      'Palla medica (3-5kg) tra le mani',
      'Parti con palla davanti, braccia tese',
      'Oscillazione completa all\'indietro',
      'Lancia sopra la testa con tutto il corpo',
      'Segui il lancio con i piedi'
    ]
  },

  // ============================================
  // TEST MOBILITÀ / FMS
  // ============================================

  'Ankle Dorsiflexion Test': {
    description: 'Test ginocchio-muro per valutare la mobilità della caviglia in dorsiflessione. Fondamentale per squat e prevenzione infortuni.',
    technique: [
      'Piede a 5cm dal muro, ginocchio in linea col secondo dito',
      'Spingi il ginocchio verso il muro mantenendo il tallone a terra',
      'Se tocchi, allontana il piede e riprova',
      'Misura la distanza massima piede-muro (cm)',
      'Normale: 10-12cm | Ottimo: 15cm+'
    ]
  },

  'Hip Internal Rotation Test': {
    description: 'Test di rotazione interna dell\'anca da seduto. Identifica restrizioni che possono causare compensi in squat e deadlift.',
    technique: [
      'Seduto sul bordo di una panca, ginocchia a 90°',
      'Ruota il piede verso l\'esterno (rotazione interna dell\'anca)',
      'Mantieni il bacino fermo, non inclinare',
      'Misura l\'angolo raggiunto',
      'Normale: 35-40° | Atleti: 45°+'
    ]
  },

  'Sit and Reach Test': {
    description: 'Test classico di flessibilità per catena posteriore (lombari, glutei, ischiocrurali). Semplice e standardizzato.',
    technique: [
      'Seduto a terra, gambe tese, piedi contro il box',
      'Braccia tese in avanti, mani sovrapposte',
      'Flettiti in avanti lentamente senza rimbalzare',
      'Spingi il cursore il più avanti possibile',
      'Registra la distanza raggiunta in cm'
    ]
  },

  'Thomas Test': {
    description: 'Test per valutare la flessibilità dei flessori dell\'anca (iliopsoas, retto femorale). Identifica accorciamenti posturali.',
    technique: [
      'Sdraiato supino sul bordo del lettino',
      'Porta un ginocchio al petto e tienilo',
      'L\'altra gamba pende liberamente',
      'Osserva: coscia deve essere orizzontale o sotto',
      'Se la coscia sale = flessori accorciati'
    ]
  },

  'FMS Deep Squat': {
    description: 'Squat profondo con bastone sopra la testa. Valuta mobilità di caviglie, anche, torace e spalle contemporaneamente.',
    technique: [
      'Bastone sopra la testa, braccia tese',
      'Piedi larghezza spalle, punte leggermente fuori',
      'Scendi il più basso possibile',
      'Mantieni talloni a terra e busto eretto',
      'Score: 3=perfetto | 2=con rialzo talloni | 1=non completa | 0=dolore'
    ]
  },

  'FMS Hurdle Step': {
    description: 'Passo sopra un ostacolo all\'altezza della tuberosità tibiale. Valuta stabilità su una gamba e mobilità dell\'altra.',
    technique: [
      'Ostacolo all\'altezza della tibia',
      'Bastone sulle spalle dietro la testa',
      'Solleva un piede e passa sopra l\'ostacolo',
      'Tocca il tallone dall\'altra parte e torna',
      'Score basato su allineamento e stabilità'
    ]
  },

  'FMS Inline Lunge': {
    description: 'Affondo su una linea con bastone lungo la schiena. Valuta stabilità, equilibrio e mobilità in pattern di affondo.',
    technique: [
      'Piedi su una linea, uno davanti all\'altro',
      'Bastone lungo la schiena (tocca testa, torace, osso sacro)',
      'Scendi in affondo, ginocchio posteriore tocca dietro il tallone anteriore',
      'Torna su mantenendo equilibrio',
      'Score basato su profondità e stabilità del bastone'
    ]
  },

  'FMS Shoulder Mobility': {
    description: 'Test di mobilità delle spalle con pugno sopra e sotto. Valuta la capacità di raggiungere con entrambe le braccia.',
    technique: [
      'In piedi, porta una mano dietro la schiena dal basso (palmo fuori)',
      'L\'altra mano scende dietro la testa dall\'alto (palmo verso la schiena)',
      'Cerca di avvicinare i pugni',
      'Misura la distanza tra i pugni',
      'Score: 3=pugni sovrapposti | 2=distanza<1 mano | 1=distanza>1 mano'
    ]
  },

  'FMS Active Straight Leg Raise': {
    description: 'Sollevamento gamba tesa attivo da supino. Valuta la flessibilità degli ischiocrurali e la stabilità del core.',
    technique: [
      'Sdraiato supino, braccia lungo i fianchi',
      'Una gamba resta a terra, tesa',
      'Solleva l\'altra gamba tesa il più in alto possibile',
      'Mantieni entrambe le gambe completamente tese',
      'Usa un riferimento verticale per lo score'
    ]
  },

  'FMS Trunk Stability Push-Up': {
    description: 'Push-up per valutare la stabilità del tronco. Test della capacità di mantenere il corpo rigido durante la spinta.',
    technique: [
      'Posizione di partenza: corpo a terra, mani larghe',
      'Esegui un push-up mantenendo il corpo rigido come una tavola',
      'Il corpo deve sollevarsi come un\'unità',
      'Nessun cedimento nella zona lombare',
      'Score basato sulla capacità di eseguire senza compensi'
    ]
  },

  'FMS Rotary Stability': {
    description: 'Test di stabilità rotatoria in quadrupedia. Valuta la capacità di resistere alla rotazione del tronco.',
    technique: [
      'Posizione quadrupedica (mani e ginocchia)',
      'Estendi braccio destro e gamba destra contemporaneamente',
      'Porta gomito e ginocchio a toccarsi sotto il corpo',
      'Torna alla posizione di partenza',
      'Score basato su stabilità e controllo del movimento'
    ]
  },

  // ============================================
  // COLLO - PREVENZIONE INFORTUNI
  // ============================================

  'Neck Flexion': {
    description: 'Flessione del collo contro resistenza. Fondamentale per sport di contatto per prevenire colpi di frusta e lesioni cervicali.',
    technique: [
      'Seduto o in piedi con postura eretta',
      'Banda elastica o mano sulla fronte',
      'Porta il mento verso il petto contro resistenza',
      'Movimento lento e controllato (3-5 secondi)',
      'Non iperestendere, fermarsi al range naturale'
    ]
  },

  'Neck Extension': {
    description: 'Estensione del collo contro resistenza. Rinforza i muscoli posteriori del collo per stabilità cervicale.',
    technique: [
      'Seduto o in piedi con postura eretta',
      'Banda elastica o mano sulla nuca',
      'Porta la testa all\'indietro contro resistenza',
      'Guarda verso l\'alto mantenendo le spalle ferme',
      'Evita di inarcare la schiena'
    ]
  },

  'Neck Lateral Flexion': {
    description: 'Flessione laterale del collo contro resistenza. Rinforza i muscoli laterali per stabilità in movimenti multi-direzionali.',
    technique: [
      'Seduto o in piedi con postura eretta',
      'Banda elastica o mano sul lato della testa',
      'Porta l\'orecchio verso la spalla contro resistenza',
      'Mantieni le spalle basse e ferme',
      'Esegui entrambi i lati'
    ]
  },

  'Neck Rotation': {
    description: 'Rotazione del collo contro resistenza. Importante per la propriocezione cervicale e la prevenzione infortuni.',
    technique: [
      'Seduto o in piedi con postura eretta',
      'Banda elastica o mano sulla tempia',
      'Ruota la testa verso un lato contro resistenza',
      'Mantieni il mento parallelo al pavimento',
      'Movimento lento, evita scatti'
    ]
  },

  'Neck Isometric Hold': {
    description: 'Tenute isometriche del collo in tutte le direzioni. Costruisce resistenza e stabilità statica del rachide cervicale.',
    technique: [
      'Posiziona resistenza (mano o banda) nella direzione desiderata',
      'Spingi contro la resistenza SENZA muovere la testa',
      'Mantieni per 10-30 secondi',
      'Respira normalmente durante la tenuta',
      'Esegui in tutte e 4 le direzioni'
    ]
  },

  'Neck Harness Exercise': {
    description: 'Esercizio con harness per collo. Attrezzo specifico per caricare il collo in modo progressivo e sicuro.',
    technique: [
      'Indossa l\'harness correttamente sulla testa',
      'Peso appeso alla catena (inizia leggero)',
      'Esegui flessione/estensione controllata',
      'Range completo ma non forzato',
      'Progressione graduale del carico'
    ]
  },

  // ============================================
  // SCHIENA BASSA / POSTERIOR CHAIN
  // ============================================

  'Back Extension (45°)': {
    description: 'Estensione schiena su panca inclinata a 45°. Rinforza gli erettori spinali con carico moderato.',
    technique: [
      'Anca sul cuscinetto, gambe bloccate',
      'Braccia incrociate sul petto o dietro la testa',
      'Parti piegato in avanti (90°)',
      'Estendi fino a corpo in linea (non oltre)',
      'Contrai i glutei in alto'
    ]
  },

  'Back Extension (Roman Chair)': {
    description: 'Estensione su sedia romana (orizzontale). Versione più intensa per erettori spinali e glutei.',
    technique: [
      'Corpo orizzontale, anca sul bordo',
      'Gambe bloccate, mani dietro la testa',
      'Scendi controllato verso il basso',
      'Risali fino a corpo in linea',
      'Non iperestendere la zona lombare'
    ]
  },

  'Reverse Hyperextension': {
    description: 'Iperestensione inversa: busto fermo, gambe si sollevano. Eccellente per lombari e glutei senza compressione spinale.',
    technique: [
      'Prono su lettino/macchina, busto fermo',
      'Gambe pendono oltre il bordo',
      'Solleva le gambe tese fino all\'orizzontale',
      'Contrai glutei in alto',
      'Scendi controllato, evita slanci'
    ]
  },

  'Glute Ham Raise': {
    description: 'Gold standard per gli ischiocrurali. Combina flessione del ginocchio ed estensione dell\'anca in un unico movimento.',
    technique: [
      'Ginocchia sul cuscinetto, piedi bloccati',
      'Parti verticale, corpo dritto',
      'Scendi controllato in avanti (eccentrica femorali)',
      'Usa i femorali per tornare su',
      'Può assistere con le mani all\'inizio'
    ]
  },

  'Reverse Nordic Curl': {
    description: 'Nordic curl inverso per i quadricipiti. Eccentrica intensa per il retto femorale, ottimo per prevenzione infortuni.',
    technique: [
      'In ginocchio, busto eretto',
      'Piedi bloccati sotto qualcosa',
      'Inclinati all\'indietro mantenendo corpo dritto',
      'Scendi il più possibile controllato',
      'Torna su contraendo i quadricipiti'
    ]
  },

  // ============================================
  // CORE ISOMETRICO / TENUTE
  // ============================================

  'Hollow Body Hold': {
    description: 'Tenuta corpo cavo, fondamentale della ginnastica. Massima attivazione del core in anti-estensione.',
    technique: [
      'Sdraiato supino, braccia sopra la testa',
      'Solleva spalle e gambe da terra',
      'Zona lombare PREMUTA contro il pavimento',
      'Corpo a forma di banana',
      'Mantieni respirando'
    ]
  },

  'Hollow Body Rock': {
    description: 'Oscillazione in posizione corpo cavo. Progressione dinamica del hollow body hold.',
    technique: [
      'Mantieni la posizione hollow body',
      'Inizia un\'oscillazione avanti-indietro',
      'Il corpo si muove come un\'unità rigida',
      'Non perdere mai la forma cava',
      'Amplitude piccola, controllo massimo'
    ]
  },

  'Superman Hold': {
    description: 'Tenuta in estensione da prono. Rinforza gli estensori della schiena e i glutei.',
    technique: [
      'Prono a terra, braccia tese avanti',
      'Solleva braccia, petto e gambe da terra',
      'Guarda il pavimento (collo neutro)',
      'Contrai glutei e dorsali',
      'Mantieni respirando'
    ]
  },

  'L-Sit': {
    description: 'Tenuta a L su parallele o pavimento. Richiede forza core, flessibilità femorali e forza braccia.',
    technique: [
      'Mani su parallele o pavimento',
      'Solleva il corpo con le braccia tese',
      'Gambe tese in avanti, parallele al pavimento',
      'Corpo forma una L',
      'Deprimi le scapole, spingi via dal supporto'
    ]
  },

  'V-Up': {
    description: 'Chiusura a V dinamica. Esercizio avanzato che unisce crunch e leg raise in un unico movimento esplosivo.',
    technique: [
      'Sdraiato supino, braccia sopra la testa',
      'Solleva contemporaneamente busto e gambe',
      'Tocca le punte dei piedi con le mani',
      'Il corpo forma una V',
      'Scendi controllato senza toccare terra'
    ]
  },

  'Dragon Flag': {
    description: 'Bandiera del drago, resa famosa da Bruce Lee. Esercizio estremamente avanzato per il core.',
    technique: [
      'Sdraiato su panca, mani afferrano dietro la testa',
      'Solleva tutto il corpo rigido (solo spalle a contatto)',
      'Corpo dritto come una bandiera',
      'Scendi lentamente mantenendo rigidità',
      'Non inarcare la zona lombare'
    ]
  },

  'Hanging Knee Raise': {
    description: 'Sollevamento ginocchia appeso alla sbarra. Progressione verso il leg raise completo.',
    technique: [
      'Appeso alla sbarra, braccia tese',
      'Solleva le ginocchia verso il petto',
      'Contrai gli addominali, non oscillare',
      'Scendi controllato',
      'Progressione: gambe sempre più tese'
    ]
  },

  'Dead Bug': {
    description: 'Esercizio anti-estensione controllato. Ottimo per imparare a stabilizzare la zona lombare.',
    technique: [
      'Supino, braccia verso il soffitto, ginocchia a 90°',
      'Lombare premuta contro il pavimento',
      'Estendi braccio e gamba opposti',
      'Mantieni la lombare a terra durante il movimento',
      'Alterna i lati con controllo'
    ]
  },

  'Bird Dog': {
    description: 'Esercizio di stabilità in quadrupedia. Rinforza core e catena posteriore con minimo stress.',
    technique: [
      'Posizione quadrupedica, schiena neutra',
      'Estendi braccio destro e gamba sinistra',
      'Mantieni il corpo stabile, non ruotare',
      'Torna e alterna',
      'Focus sul controllo, non sulla velocità'
    ]
  },

  // ============================================
  // PETTORALI AGGIUNTIVI
  // ============================================

  'Incline Barbell Bench Press': {
    description: 'Panca inclinata con bilanciere per enfatizzare il petto alto. Angolo ottimale 30-45 gradi.',
    technique: [
      'Panca inclinata 30-45°',
      'Presa poco più larga delle spalle',
      'Bilanciere scende verso la clavicola',
      'Gomiti a 45-60° dal corpo',
      'Spingi verso l\'alto e leggermente indietro'
    ]
  },

  'Incline Dumbbell Bench Press': {
    description: 'Panca inclinata con manubri. Maggiore ROM e lavoro degli stabilizzatori rispetto al bilanciere.',
    technique: [
      'Panca inclinata 30-45°',
      'Manubri alla larghezza delle spalle',
      'Scendi sentendo lo stretch nel petto',
      'Spingi convergendo leggermente in alto',
      'Non toccare i manubri in alto'
    ]
  },

  'Cable Fly': {
    description: 'Croci ai cavi per isolamento pettorale. Tensione costante durante tutto il ROM.',
    technique: [
      'Cavi all\'altezza desiderata (alto/medio/basso)',
      'Passo in avanti per stabilità',
      'Braccia leggermente flesse (gomiti soft)',
      'Porta le mani insieme davanti al petto',
      'Contrai il petto e torna controllato'
    ]
  },

  'Dumbbell Fly': {
    description: 'Croci con manubri su panca. Classico esercizio di isolamento per stretch e contrazione del pettorale.',
    technique: [
      'Supino su panca, manubri sopra il petto',
      'Gomiti leggermente flessi e fissi',
      'Apri le braccia sentendo lo stretch',
      'Non scendere oltre il livello del petto',
      'Chiudi contraendo il petto'
    ]
  },

  'Pec Deck': {
    description: 'Croci alla macchina pec deck. Isolamento sicuro del pettorale con percorso guidato.',
    technique: [
      'Seduto, schiena appoggiata',
      'Avambracci sui cuscinetti',
      'Porta i cuscinetti insieme davanti',
      'Contrai il petto nella fase concentrica',
      'Torna controllato sentendo lo stretch'
    ]
  },

  // ============================================
  // SPALLE - CUFFIA DEI ROTATORI
  // ============================================

  'Rear Delt Fly': {
    description: 'Fly posteriore per il deltoide posteriore. Fondamentale per equilibrio delle spalle.',
    technique: [
      'Piegato in avanti o su panca inclinata',
      'Braccia pendono verso il basso',
      'Solleva lateralmente con gomiti soft',
      'Stringi le scapole in alto',
      'Scendi controllato'
    ]
  },

  'Face Pull': {
    description: 'Trazione al viso ai cavi. Eccellente per deltoide posteriore, trapezio e rotatori esterni.',
    technique: [
      'Cavo alto, corda a due mani',
      'Tira verso il viso separando le mani',
      'Gomiti alti, in linea con le spalle',
      'Ruota esternamente alla fine del movimento',
      'Squeeze delle scapole'
    ]
  },

  'Y-T-W Raises': {
    description: 'Sequenza di sollevamenti a Y, T e W per la cuffia dei rotatori e trapezio basso/medio.',
    technique: [
      'Prono su panca inclinata o in piedi piegato',
      'Y: braccia a 45° sopra la testa',
      'T: braccia laterali a 90°',
      'W: gomiti piegati, rotazione esterna',
      'Pesi leggeri, focus sulla qualità'
    ]
  },

  'External Rotation (Cable)': {
    description: 'Rotazione esterna ai cavi per infraspinato e teres minor. Fondamentale per la salute della spalla.',
    technique: [
      'Cavo all\'altezza del gomito',
      'Gomito piegato a 90°, aderente al fianco',
      'Ruota l\'avambraccio verso l\'esterno',
      'Mantieni il gomito fermo',
      'Torna controllato senza slancio'
    ]
  },

  'Cuban Press': {
    description: 'Press cubano: rotazione esterna + press. Esercizio completo per cuffia dei rotatori.',
    technique: [
      'Manubri leggeri, gomiti a 90° aperti laterali',
      'Ruota esternamente (avambracci verso l\'alto)',
      'Pressa sopra la testa',
      'Scendi invertendo il movimento',
      'Peso leggero, movimento controllato'
    ]
  },

  // ============================================
  // SCHIENA ALTA/MEDIA
  // ============================================

  'Seal Row': {
    description: 'Row su panca alta con petto supportato. Elimina completamente il cheating per isolamento puro.',
    technique: [
      'Prono su panca alta, petto supportato',
      'Braccia pendono verso il basso con pesi',
      'Tira i gomiti verso il soffitto',
      'Stringi le scapole in alto',
      'Scendi controllato fino a braccia tese'
    ]
  },

  'Chest Supported Row': {
    description: 'Rematore con supporto petto su panca inclinata. Isola i dorsali eliminando i compensi.',
    technique: [
      'Petto su panca inclinata (30-45°)',
      'Manubri pendono verso il basso',
      'Tira i gomiti indietro',
      'Contrai i dorsali in alto',
      'Lento ed eccentrico controllato'
    ]
  },

  'Pendlay Row': {
    description: 'Rematore esplosivo da terra. Ogni rep parte dal pavimento per potenza e forza.',
    technique: [
      'Bilanciere a terra, posizione deadlift',
      'Busto parallelo al pavimento',
      'Tira esplosivamente al petto',
      'Riappoggia completamente a terra',
      'Reset tra ogni ripetizione'
    ]
  },

  'Meadows Row': {
    description: 'Rematore unilaterale con landmine. Angolo unico per massimo stretch e contrazione.',
    technique: [
      'Bilanciere in landmine, stai di lato',
      'Afferra l\'estremità con una mano',
      'Tira verso il fianco',
      'Grande stretch in basso',
      'Squeeze forte in alto'
    ]
  },

  'Straight Arm Pulldown': {
    description: 'Pulldown a braccia tese. Isola i dorsali senza coinvolgimento dei bicipiti.',
    technique: [
      'Cavo alto, barra o corda',
      'Braccia tese (gomiti soft)',
      'Porta la barra verso le cosce',
      'Senti i dorsali lavorare',
      'Torna controllato sopra la testa'
    ]
  },

  'Dumbbell Pullover': {
    description: 'Pullover con manubrio. Lavora dorsali e pettorale con grande stretch toracico.',
    technique: [
      'Supino su panca, solo spalle supportate',
      'Manubrio sopra il petto, braccia leggermente flesse',
      'Porta il peso dietro la testa (stretch)',
      'Torna sopra il petto contraendo dorsali',
      'Mantieni i fianchi bassi per maggiore stretch'
    ]
  },

  // ============================================
  // BRACCIA AGGIUNTIVE
  // ============================================

  'Preacher Curl': {
    description: 'Curl su panca Scott. Isola il bicipite eliminando ogni possibilità di cheating.',
    technique: [
      'Braccia appoggiate sul cuscinetto inclinato',
      'Ascelle sul bordo superiore',
      'Curla verso le spalle',
      'Non estendere completamente in basso',
      'Contrazione lenta e controllata'
    ]
  },

  'Concentration Curl': {
    description: 'Curl concentrato seduto. Massimo isolamento del picco del bicipite.',
    technique: [
      'Seduto, gomito interno coscia',
      'Braccio pende verso il basso',
      'Curla verso la spalla opposta',
      'Contrai forte in alto',
      'Scendi lento fino a completa estensione'
    ]
  },

  'Incline Dumbbell Curl': {
    description: 'Curl su panca inclinata per massimo stretch del bicipite. Lavora il capo lungo.',
    technique: [
      'Panca inclinata 45-60°',
      'Braccia pendono indietro (stretch)',
      'Curla senza muovere i gomiti in avanti',
      'Senti lo stretch in partenza',
      'Non usare slancio'
    ]
  },

  'Spider Curl': {
    description: 'Curl prono su panca inclinata. Focus sulla contrazione del bicipite.',
    technique: [
      'Petto su panca inclinata',
      'Braccia pendono verticali',
      'Curla verso le spalle',
      'Massima contrazione in alto',
      'Eccentrica lenta'
    ]
  },

  'Overhead Tricep Extension': {
    description: 'French press sopra la testa. Massimo stretch per il capo lungo del tricipite.',
    technique: [
      'In piedi o seduto, manubrio sopra la testa',
      'Gomiti puntano in alto e fissi',
      'Scendi dietro la testa (stretch)',
      'Estendi completamente',
      'Gomiti fermi durante tutto il movimento'
    ]
  },

  'Close Grip Bench Press': {
    description: 'Panca con presa stretta per tricipiti. Compound pesante per massa delle braccia.',
    technique: [
      'Presa larghezza spalle o leggermente più stretta',
      'Gomiti vicini al corpo',
      'Bilanciere tocca il petto basso',
      'Spingi estendendo i tricipiti',
      'Non rimbalzare sul petto'
    ]
  },

  'Tricep Kickback': {
    description: 'Calcio indietro per tricipiti. Isolamento puro del capo laterale e mediale.',
    technique: [
      'Busto parallelo al pavimento',
      'Gomito fisso al fianco',
      'Estendi l\'avambraccio all\'indietro',
      'Contrai il tricipite in alto',
      'Movimento solo dell\'avambraccio'
    ]
  },

  // ============================================
  // GAMBE AGGIUNTIVE
  // ============================================

  'Hack Squat': {
    description: 'Squat alla macchina hack. Enfatizza i quadricipiti con supporto per la schiena.',
    technique: [
      'Schiena appoggiata allo schienale',
      'Piedi avanti sulla pedana',
      'Scendi fino a cosce parallele o oltre',
      'Spingi con i quadricipiti',
      'Non bloccare le ginocchia in alto'
    ]
  },

  'Sissy Squat': {
    description: 'Squat con ginocchia molto avanti. Isola il retto femorale con stretch intenso.',
    technique: [
      'In piedi, tieniti a qualcosa per equilibrio',
      'Sali sulle punte',
      'Inclina indietro mentre pieghi le ginocchia avanti',
      'Scendi il più possibile',
      'Risali contraendo i quadricipiti'
    ]
  },

  'Spanish Squat': {
    description: 'Squat con banda dietro le ginocchia. Ottimo per riabilitazione e attivazione quadricipiti.',
    technique: [
      'Banda fissata dietro, passa dietro le ginocchia',
      'Inclinati indietro appoggiandoti alla banda',
      'Scendi in squat mantenendo busto verticale',
      'Le ginocchia vanno avanti (la banda bilancia)',
      'Ottimo per dolore anteriore di ginocchio'
    ]
  },

  'Lying Leg Curl': {
    description: 'Leg curl sdraiato per ischiocrurali. Isolamento puro con macchina guidata.',
    technique: [
      'Prono sulla macchina, ginocchia oltre il bordo',
      'Rullo sopra i talloni',
      'Curla portando i talloni verso i glutei',
      'Contrai i femorali in alto',
      'Scendi controllato'
    ]
  },

  'Seated Leg Curl': {
    description: 'Leg curl seduto per ischiocrurali. Posizione diversa per stimolo complementare.',
    technique: [
      'Seduto, gambe sopra il rullo',
      'Cuscinetto sulle cosce ti tiene fermo',
      'Curla verso il basso/dietro',
      'Contrai i femorali a fine movimento',
      'Torna controllato'
    ]
  },

  'Single Leg Romanian Deadlift': {
    description: 'Stacco rumeno unilaterale. Eccellente per equilibrio, stabilità e forza dei femorali.',
    technique: [
      'In piedi su una gamba',
      'Fletti in avanti dall\'anca',
      'Gamba libera si estende dietro',
      'Mantieni la schiena dritta',
      'Senti lo stretch nel femorale d\'appoggio'
    ]
  },

  // ============================================
  // POLPACCI AGGIUNTIVI
  // ============================================

  'Single Leg Calf Raise': {
    description: 'Calf raise su una gamba. Corregge asimmetrie e aumenta l\'intensità.',
    technique: [
      'Su un gradino, una gamba sola',
      'Tallone pende oltre il bordo',
      'Sali il più possibile sulla punta',
      'Scendi sotto il parallelo (stretch)',
      'Tieni qualcosa per equilibrio'
    ]
  },

  'Donkey Calf Raise': {
    description: 'Calf raise a 90° (posizione asino). Stretch maggiore del gastrocnemio.',
    technique: [
      'Piegato a 90° all\'anca',
      'Avampiedi su un rialzo',
      'Peso sulla schiena o partner sopra',
      'Sali sulle punte, contrai',
      'Scendi per stretch completo'
    ]
  },

  'Tibialis Raise': {
    description: 'Sollevamento tibiale per il muscolo anteriore. Previene shin splints e squilibri.',
    technique: [
      'Schiena contro un muro, piedi avanti',
      'Solleva le punte dei piedi verso gli stinchi',
      'Mantieni i talloni a terra',
      'Contrai il tibiale in alto',
      'Scendi controllato'
    ]
  },

  // ============================================
  // GLUTEI AGGIUNTIVI
  // ============================================

  'Hip Thrust': {
    description: 'Re degli esercizi per i glutei. Massima attivazione glutea in accorciamento.',
    technique: [
      'Spalle su panca, piedi a terra',
      'Bilanciere sui fianchi (con cuscinetto)',
      'Spingi i fianchi verso l\'alto',
      'Stringi i glutei in alto (1-2 sec)',
      'Scendi controllato'
    ]
  },

  'Cable Pull Through': {
    description: 'Pull through ai cavi. Hip hinge con tensione costante per glutei e femorali.',
    technique: [
      'Cavo basso, passa tra le gambe',
      'Afferra con entrambe le mani',
      'Fletti in avanti dall\'anca (hip hinge)',
      'Estendi i fianchi, stringi i glutei',
      'Non tirare con le braccia'
    ]
  },

  'Frog Pump': {
    description: 'Pump a rana per attivazione glutea. Ottimo warm-up o finisher ad alte reps.',
    technique: [
      'Supino, piante dei piedi unite (gambe a rana)',
      'Ginocchia aperte verso l\'esterno',
      'Spingi i fianchi verso l\'alto',
      'Stringi i glutei in alto',
      'Movimento rapido, tante reps'
    ]
  },

  'Single Leg Hip Thrust': {
    description: 'Hip thrust unilaterale. Corregge asimmetrie e aumenta intensità.',
    technique: [
      'Spalle su panca, un piede a terra',
      'L\'altra gamba sollevata o piegata',
      'Spingi con una gamba sola',
      'Mantieni i fianchi livellati',
      'Contrai il gluteo in alto'
    ]
  },

  'Cable Kickback': {
    description: 'Calcio indietro ai cavi per isolamento gluteo. Tensione costante durante tutto il ROM.',
    technique: [
      'Cavigliera al cavo basso',
      'Inclinato in avanti, tieniti',
      'Estendi la gamba all\'indietro',
      'Contrai il gluteo a fine movimento',
      'Non inarcare la schiena'
    ]
  },

  'Fire Hydrant': {
    description: 'Esercizio idrante per gluteo medio. Ottimo per stabilità anca e prevenzione.',
    technique: [
      'Posizione quadrupedica',
      'Solleva il ginocchio lateralmente (come un cane all\'idrante)',
      'Mantieni 90° di flessione ginocchio',
      'Non ruotare il bacino',
      'Contrai il gluteo medio in alto'
    ]
  },

  // ============================================
  // ESERCIZI FUNZIONALI
  // ============================================

  'Sled Push': {
    description: 'Spinta slitta per condizionamento e forza delle gambe. Full body con focus lower body.',
    technique: [
      'Mani sulla slitta, braccia tese',
      'Corpo inclinato in avanti (45-60°)',
      'Spingi con passi potenti',
      'Drive dalle gambe, non dalle braccia',
      'Mantieni core rigido'
    ]
  },

  'Sled Pull': {
    description: 'Traino slitta camminando all\'indietro. Eccellente per riabilitazione ginocchio e condizionamento.',
    technique: [
      'Corda/maniglie in mano, faccia alla slitta',
      'Cammina all\'indietro',
      'Passi controllati',
      'Tira con tutto il corpo',
      'Ottimo per ginocchia sensibili'
    ]
  },

  'Battle Ropes': {
    description: 'Corde da battaglia per HIIT e condizionamento. Alto dispendio calorico, full body.',
    technique: [
      'Una corda per mano, posizione atletica',
      'Crea onde alternando le braccia',
      'Mantieni core rigido',
      'Varie tecniche: onde, slam, cerchi',
      'Lavora in intervalli'
    ]
  },

  'Farmer Walk': {
    description: 'Camminata del contadino con pesi. Grip, core, traps e condizionamento totale.',
    technique: [
      'Pesi pesanti in ogni mano',
      'Postura eretta, spalle indietro',
      'Passi controllati e stabili',
      'Core contratto, respira',
      'Cammina per distanza o tempo'
    ]
  },

  'Turkish Get Up': {
    description: 'Alzata turca completa. Esercizio complesso per mobilità, stabilità e forza funzionale.',
    technique: [
      'Supino con kettlebell in alto',
      'Alzati mantenendo il peso sopra la testa',
      'Sequenza: gomito, mano, ponte, ginocchio, in piedi',
      'Peso sempre verticale e stabile',
      'Movimento lento e controllato'
    ]
  },

  'Kettlebell Swing': {
    description: 'Swing con kettlebell. Hip hinge esplosivo per potenza, condizionamento e posterior chain.',
    technique: [
      'Piedi larghezza spalle, kettlebell davanti',
      'Hip hinge, afferra il KB',
      'Hiking pass tra le gambe',
      'Estensione esplosiva dei fianchi',
      'KB sale a livello spalle (Russian) o sopra (American)'
    ]
  },

  'Kettlebell Clean': {
    description: 'Clean con kettlebell. Porta il peso dalla posizione bassa al rack position.',
    technique: [
      'Swing iniziale come nel KB swing',
      'Tira il gomito indietro',
      'Ruota il polso, KB "gira" intorno alla mano',
      'Termina in rack position (KB sul petto)',
      'Non sbattere il KB sull\'avambraccio'
    ]
  },

  'Kettlebell Snatch': {
    description: 'Snatch con kettlebell. Movimento completo dalla terra sopra la testa in un\'azione.',
    technique: [
      'Swing iniziale',
      'Tira in alto vicino al corpo',
      'Punch through: inserisci la mano quando il KB decelera',
      'Braccio teso sopra la testa',
      'Movimento fluido e continuo'
    ]
  },

  // ============================================
  // STRETCHING / MOBILITÀ
  // ============================================

  'Pigeon Stretch': {
    description: 'Stretch del piccione per rotatori esterni dell\'anca e glutei. Classico dello yoga.',
    technique: [
      'Una gamba piegata davanti, l\'altra tesa dietro',
      'Cerca di portare lo stinco parallelo al bacino',
      'Abbassati in avanti per intensificare',
      'Mantieni i fianchi squadrati',
      'Respira profondamente nello stretch'
    ]
  },

  '90/90 Stretch': {
    description: 'Stretch 90/90 per rotazione interna ed esterna dell\'anca. Fondamentale per atleti.',
    technique: [
      'Seduto, entrambe le gambe a 90°',
      'Gamba anteriore: rotazione esterna',
      'Gamba posteriore: rotazione interna',
      'Mantieni busto eretto',
      'Alterna i lati'
    ]
  },

  'World Greatest Stretch': {
    description: 'Lo stretch più completo: anca, torace, spalle in un unico movimento dinamico.',
    technique: [
      'Affondo profondo avanti',
      'Gomito verso il pavimento interno al piede',
      'Ruota il torace, braccio verso il cielo',
      'Solleva la mano a terra, estendi la gamba davanti',
      'Alterna fluido tra le fasi'
    ]
  },

  'Couch Stretch': {
    description: 'Stretch dei flessori dell\'anca in posizione kneeling contro un muro. Intenso ed efficace.',
    technique: [
      'Ginocchio contro il muro, piede su per la parete',
      'L\'altra gamba in affondo davanti',
      'Contrai il gluteo del lato posteriore',
      'Mantieni busto eretto',
      'Senti lo stretch nei flessori'
    ]
  },

  'Bretzel Stretch': {
    description: 'Stretch bretzel per rotazione toracica. Complesso stretch che apre torace e anche.',
    technique: [
      'Sdraiato su un fianco',
      'Gamba sopra piegata, ginocchio a terra',
      'Gamba sotto tesa, afferrata dalla mano sopra',
      'Ruota il torace aprendo verso il soffitto',
      'Respira e aumenta gradualmente la rotazione'
    ]
  }
};

/**
 * Trova descrizione e technique per un esercizio dato il nome
 */
export function getExerciseDescription(exerciseName: string): ExerciseDescription | null {
  // Cerca match esatto (case-insensitive)
  const key = Object.keys(EXERCISE_DESCRIPTIONS).find(
    k => k.toLowerCase() === exerciseName.toLowerCase()
  );

  if (key) {
    return EXERCISE_DESCRIPTIONS[key];
  }

  return null;
}
