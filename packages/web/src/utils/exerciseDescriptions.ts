/**
 * EXERCISE DESCRIPTIONS - DCSS ALIGNED
 *
 * Basato sui principi DCSS di Paolo Evangelista:
 * 1. La tecnica ottimale varia per proporzioni individuali
 * 2. Non esistono posizioni "sbagliate" universali
 * 3. Il focus è sul controllo del movimento, non su posizioni statiche
 * 4. I tessuti si adattano ai carichi progressivi
 *
 * LINGUAGGIO:
 * - "Potresti notare" invece di "Devi fare"
 * - "Varia in base alle tue proporzioni" invece di "Posizione corretta"
 * - "Controlla il movimento" invece di "Mantieni la schiena neutra"
 */

import { CORRECTIVE_EXERCISE_DESCRIPTIONS } from './correctiveExerciseDescriptions';

export interface ExerciseDescription {
  description: string;
  technique: string[];
  dcssNote?: string; // Nota sulla variabilità individuale
  commonVariations?: string[]; // Variazioni normali basate su antropometria
}

/**
 * Database descrizioni esercizi - DCSS Style
 * Chiave = nome esercizio (case-insensitive matching)
 */
export const EXERCISE_DESCRIPTIONS: Record<string, ExerciseDescription> = {

  // ============================================
  // LOWER PUSH (Squat Pattern)
  // ============================================

  'Bodyweight Squat': {
    description: 'Movimento fondamentale di accosciata. La profondità e la posizione del busto variano naturalmente in base alle tue proporzioni.',
    technique: [
      'Piedi alla larghezza che ti permette di scendere comodamente',
      'Le ginocchia seguono la direzione delle punte dei piedi',
      'Scendi fino a dove riesci a mantenere il controllo',
      'Risali spingendo il pavimento'
    ],
    dcssNote: 'Chi ha femori lunghi tenderà ad inclinarsi di più in avanti - è normale e funzionale.',
    commonVariations: [
      'Stance più largo con punte in fuori → maggiore profondità',
      'Stance più stretto → più lavoro sui quadricipiti',
      'Inclinazione busto variabile → dipende dal rapporto femori/torso'
    ]
  },

  'Goblet Squat': {
    description: 'Squat con peso tenuto al petto. Il carico anteriore aiuta naturalmente a mantenere il busto più verticale.',
    technique: [
      'Tieni il peso vicino al petto, gomiti verso il basso',
      'Scendi controllando la discesa',
      'La profondità dipende dalla tua mobilità attuale',
      'Spingi per risalire'
    ],
    dcssNote: 'Ottimo per imparare lo squat - il peso anteriore bilancia naturalmente il movimento.',
  },

  'Front Squat': {
    description: 'Squat con bilanciere sulle spalle anteriori. Richiede buona mobilità di polsi, spalle e caviglie.',
    technique: [
      'Bilanciere appoggiato sui deltoidi anteriori',
      'Gomiti alti per creare uno "scaffale"',
      'Il busto rimane più verticale rispetto al back squat',
      'Scendi controllando, risali spingendo'
    ],
    dcssNote: 'Se hai difficoltà con i polsi, prova la presa incrociata o usa le cinghie.',
    commonVariations: [
      'Presa clean (olimpica)',
      'Presa incrociata (bodybuilding)',
      'Con cinghie per mobilità limitata'
    ]
  },

  'Back Squat': {
    description: 'Squat con bilanciere sulle spalle posteriori. Il movimento "re" dell\'allenamento con i pesi.',
    technique: [
      'Bilanciere sui trapezi (high bar) o più basso sulle scapole (low bar)',
      'La larghezza dello stance dipende dalle tue proporzioni',
      'Scendi fino a dove riesci a controllare il movimento',
      'Spingi attraverso tutto il piede per risalire'
    ],
    dcssNote: 'High bar vs low bar: non c\'è uno "migliore" - dipende dalla tua struttura e obiettivi.',
    commonVariations: [
      'High bar → busto più verticale, più quadricipiti',
      'Low bar → busto più inclinato, più catena posteriore',
      'Profondità variabile → basata su mobilità e controllo'
    ]
  },

  'Bulgarian Split Squat': {
    description: 'Squat unilaterale con piede posteriore elevato. Eccellente per equilibrio e correzione di asimmetrie.',
    technique: [
      'Piede posteriore su panca o rialzo dietro di te',
      'Trova la distanza che ti permette di scendere comodamente',
      'Scendi verticalmente, il ginocchio anteriore può andare oltre la punta',
      'Spingi con la gamba anteriore per risalire'
    ],
    dcssNote: 'Il ginocchio che va oltre la punta del piede è normale e sicuro - dipende dalle proporzioni.',
  },

  'Pistol Squat': {
    description: 'Squat completo su una gamba sola. Richiede forza, equilibrio e mobilità eccezionali.',
    technique: [
      'Gamba libera tesa davanti a te',
      'Braccia avanti per bilanciare',
      'Scendi lentamente e controllato',
      'La flessione della caviglia determina quanto puoi scendere'
    ],
    dcssNote: 'Se non riesci a scendere completamente, lavora sulla mobilità delle caviglie con squat assistiti.',
  },

  'Leg Press': {
    description: 'Movimento di spinta con le gambe su macchina guidata. Permette di caricare molto senza stress sulla schiena.',
    technique: [
      'Posiziona i piedi sulla pedana dove ti senti stabile',
      'Piedi più alti → più glutei e femorali',
      'Piedi più bassi → più quadricipiti',
      'Scendi fino a dove la tua schiena rimane a contatto con lo schienale'
    ],
    dcssNote: 'Non c\'è una posizione "corretta" dei piedi - sperimenta per trovare quella che senti meglio.',
  },

  'Lunges': {
    description: 'Passo in avanti con accosciata. Movimento funzionale che lavora su forza e stabilità.',
    technique: [
      'Fai un passo in avanti mantenendo il controllo',
      'Scendi verticalmente',
      'Entrambe le ginocchia si flettono',
      'Spingi per tornare in posizione'
    ],
    dcssNote: 'La lunghezza del passo varia in base alla tua altezza e lunghezza delle gambe.',
  },

  // ============================================
  // LOWER PULL (Deadlift/Hip Hinge)
  // ============================================

  'Bodyweight Hip Hinge': {
    description: 'Movimento fondamentale di cerniera dell\'anca. Propedeutico a tutti gli stacchi.',
    technique: [
      'Piega dalle anche, non dalla vita',
      'Le ginocchia si flettono leggermente ma non si muovono in avanti',
      'Senti l\'allungamento nei femorali',
      'Il grado di flessione spinale varia - trova quello che controlli'
    ],
    dcssNote: 'Una leggera flessione della colonna è normale e sicura - i dischi sono progettati per questo.',
  },

  'Conventional Deadlift': {
    description: 'Sollevamento del bilanciere da terra. Movimento fondamentale per forza totale.',
    technique: [
      'Piedi sotto le anche, bilanciere sopra la metà del piede',
      'Afferra il bilanciere appena fuori dalle gambe',
      'Crea tensione prima di sollevare',
      'Spingi il pavimento e porta le anche avanti'
    ],
    dcssNote: 'La posizione della schiena dipende dalle tue proporzioni - chi ha braccia corte si inclinerà di più.',
    commonVariations: [
      'Braccia lunghe → schiena più verticale',
      'Braccia corte → schiena più inclinata',
      'Torso lungo → starting position più bassa'
    ]
  },

  'Sumo Deadlift': {
    description: 'Stacco con stance largo e presa stretta. Riduce il range of motion e coinvolge più glutei e adduttori.',
    technique: [
      'Piedi molto larghi, punte in fuori',
      'Afferra il bilanciere tra le gambe',
      'Spingi le ginocchia in fuori verso i gomiti',
      'Il busto rimane più verticale rispetto al conventional'
    ],
    dcssNote: 'Conventional vs Sumo: dipende dalla tua struttura. Chi ha torso lungo spesso preferisce sumo.',
  },

  'Romanian Deadlift (RDL)': {
    description: 'Stacco a gambe semi-tese. Focus sui femorali e glutei con movimento eccentrico controllato.',
    technique: [
      'Parti in piedi con il bilanciere',
      'Piega dalle anche spingendo il sedere indietro',
      'Il bilanciere scende lungo le gambe',
      'Scendi fino a dove senti tensione nei femorali'
    ],
    dcssNote: 'La profondità dipende dalla tua flessibilità - non forzare oltre il tuo range attuale.',
  },

  'Good Morning': {
    description: 'Flessione in avanti con bilanciere sulle spalle. Lavora tutta la catena posteriore.',
    technique: [
      'Bilanciere sulle spalle come per lo squat',
      'Piega dalle anche mantenendo le ginocchia leggermente flesse',
      'Scendi fino a dove mantieni il controllo',
      'Risali contraendo glutei e femorali'
    ],
    dcssNote: 'Inizia con carichi leggeri per trovare il tuo range di movimento ottimale.',
  },

  'Hip Thrust': {
    description: 'Estensione delle anche con schiena su panca. Esercizio principale per i glutei.',
    technique: [
      'Schiena appoggiata su una panca, bilanciere sulle anche',
      'Piedi a terra, ginocchia piegate a 90°',
      'Spingi le anche verso l\'alto contraendo i glutei',
      'Controlla la discesa'
    ],
    dcssNote: 'La posizione dei piedi influenza quali muscoli lavorano di più - sperimenta.',
  },

  'Nordic Hamstring Curl': {
    description: 'Esercizio eccentrico avanzato per i femorali. Eccellente per prevenzione infortuni.',
    technique: [
      'Caviglie bloccate, ginocchia a terra',
      'Scendi lentamente controllando con i femorali',
      'Vai più in basso che puoi controllare',
      'Usa le mani per aiutarti a risalire se necessario'
    ],
    dcssNote: 'È normale non riuscire a controllare tutta la discesa all\'inizio - la forza eccentrica si costruisce.',
  },

  'Trap Bar Deadlift': {
    description: 'Stacco con trap bar esagonale. Più sicuro per la schiena, ottimo per principianti e carichi pesanti.',
    technique: [
      'Entra dentro la barra, piedi alla larghezza anche',
      'Presa neutra sulle maniglie laterali',
      'Busto naturalmente più verticale',
      'Spingi il pavimento come in uno squat'
    ],
    dcssNote: 'Ottimo compromesso tra squat e deadlift - permette carichi pesanti con meno stress lombare.',
  },

  'Leg Curl (Machine)': {
    description: 'Isolamento puro per ischiocrurali. Movimento semplice e sicuro per sviluppare i femorali.',
    technique: [
      'Ginocchia allineate con il perno della macchina',
      'Contrai completamente in alto',
      'Fase negativa lenta e controllata',
      'Puoi variare la posizione dei piedi'
    ],
    dcssNote: 'La posizione dei piedi (punte in/out) enfatizza diverse porzioni dei femorali.',
  },

  // ============================================
  // UPPER PUSH (Pressing)
  // ============================================

  'Standard Push-up': {
    description: 'Piegamento sulle braccia. Esercizio fondamentale per petto, spalle e tricipiti.',
    technique: [
      'Mani alla larghezza che ti permette di scendere comodamente',
      'Corpo in linea dalla testa ai piedi',
      'Scendi fino a dove riesci a controllare',
      'Spingi per risalire'
    ],
    dcssNote: 'La larghezza delle mani e l\'angolo dei gomiti variano - trova quello che senti meglio sulle spalle.',
    commonVariations: [
      'Mani larghe → più petto',
      'Mani strette → più tricipiti',
      'Gomiti larghi vs stretti → dipende dalla tua struttura'
    ]
  },

  'Push-up': {
    description: 'Piegamento sulle braccia. Esercizio fondamentale per petto, spalle e tricipiti.',
    technique: [
      'Mani alla larghezza che ti permette di scendere comodamente',
      'Corpo in linea dalla testa ai piedi',
      'Scendi fino a dove riesci a controllare',
      'Spingi per risalire'
    ],
    dcssNote: 'La larghezza delle mani e l\'angolo dei gomiti variano - trova quello che senti meglio sulle spalle.',
  },

  'Diamond Push-up': {
    description: 'Push-up con mani vicine a forma di diamante. Massimo focus sui tricipiti.',
    technique: [
      'Pollici e indici si toccano formando un diamante',
      'Gomiti stretti al corpo durante la discesa',
      'Core sempre contratto',
      'Spingi fino all\'estensione completa'
    ],
    dcssNote: 'Se senti fastidio ai polsi, allarga leggermente la presa.',
  },

  'Archer Push-up': {
    description: 'Push-up asimmetrico verso un movimento unilaterale. Un braccio lavora, l\'altro assiste.',
    technique: [
      'Mani molto larghe',
      'Un braccio si piega, l\'altro resta quasi teso',
      'Mantieni il core stabile',
      'Alterna i lati'
    ],
    dcssNote: 'Progressione naturale verso il push-up a un braccio.',
  },

  'Bench Press': {
    description: 'Distensione su panca con bilanciere. Esercizio principale per il petto.',
    technique: [
      'Sdraiati con gli occhi sotto il bilanciere',
      'Afferra con presa che permette avambracci verticali in basso',
      'Scendi controllando verso il petto',
      'Spingi verso l\'alto'
    ],
    dcssNote: 'L\'arco lombare è naturale e protettivo - non appiattire la schiena forzatamente.',
    commonVariations: [
      'Presa larga → più petto',
      'Presa media → bilanciato',
      'Tocco alto vs basso → dipende dalla lunghezza delle braccia'
    ]
  },

  'Incline Bench Press': {
    description: 'Panca inclinata per enfatizzare la parte alta del petto e le spalle anteriori.',
    technique: [
      'Panca inclinata a 30-45°',
      'Il bilanciere scende verso la parte alta del petto',
      'Mantieni i piedi a terra per stabilità',
      'Spingi verso l\'alto e leggermente indietro'
    ],
    dcssNote: 'L\'angolo ottimale varia - alcuni preferiscono 30°, altri 45°. Prova entrambi.',
  },

  'Overhead Press': {
    description: 'Distensione sopra la testa. Esercizio fondamentale per le spalle.',
    technique: [
      'Bilanciere a livello delle clavicole',
      'Spingi verticalmente sopra la testa',
      'Il corpo può inclinarsi leggermente indietro',
      'Blocca con le braccia tese'
    ],
    dcssNote: 'Una leggera estensione della colonna è normale - permette al bilanciere di passare davanti al viso.',
  },

  'Dips': {
    description: 'Piegamenti alle parallele. Lavora petto, spalle e tricipiti.',
    technique: [
      'Afferra le parallele e solleva il corpo',
      'Scendi piegando i gomiti',
      'L\'inclinazione del busto determina il focus muscolare',
      'Spingi per risalire'
    ],
    dcssNote: 'Busto inclinato = più petto. Busto verticale = più tricipiti. Entrambi sono validi.',
  },

  // ============================================
  // UPPER PULL (Rowing/Pulling)
  // ============================================

  'Pull-up': {
    description: 'Trazione alla sbarra. Esercizio fondamentale per la schiena.',
    technique: [
      'Afferra la sbarra con presa prona',
      'Tira portando il petto verso la sbarra',
      'La larghezza della presa varia - trova quella comoda per le spalle',
      'Scendi controllando'
    ],
    dcssNote: 'Il range of motion dipende dalla mobilità delle spalle - non forzare oltre.',
  },

  'Chin-up': {
    description: 'Trazione con presa supina. Coinvolge maggiormente i bicipiti.',
    technique: [
      'Afferra la sbarra con palmi verso di te',
      'Tira portando il mento sopra la sbarra',
      'Scendi controllando',
      'Le braccia si estendono completamente in basso'
    ],
    dcssNote: 'Spesso più facile dei pull-up per i principianti grazie al maggiore coinvolgimento dei bicipiti.',
  },

  'Barbell Row': {
    description: 'Rematore con bilanciere. Esercizio principale per lo spessore della schiena.',
    technique: [
      'Piega in avanti dalle anche, ginocchia leggermente flesse',
      'Afferra il bilanciere e tiralo verso l\'addome',
      'L\'angolo del busto varia - più verticale = più trapezi, più inclinato = più dorsali',
      'Controlla la discesa'
    ],
    dcssNote: 'Non esiste un angolo "corretto" - varia in base agli obiettivi e alla tua struttura.',
    commonVariations: [
      'Pendlay row → busto parallelo al pavimento, reset ad ogni rep',
      'Yates row → busto più verticale, presa supina',
      'Standard row → angolo intermedio'
    ]
  },

  'Inverted Row': {
    description: 'Trazione orizzontale a corpo libero. Ottimo per principianti e per lavorare sulla schiena.',
    technique: [
      'Afferra una sbarra bassa o anelli',
      'Corpo in linea, talloni a terra',
      'Tira il petto verso la sbarra',
      'Scendi controllando'
    ],
    dcssNote: 'Più sei verticale, più è facile. Più sei orizzontale, più è difficile.',
  },

  'Face Pull': {
    description: 'Trazione al viso con cavi. Eccellente per la salute delle spalle e i muscoli posteriori.',
    technique: [
      'Tira la corda verso il viso, gomiti alti',
      'Ruota esternamente le spalle alla fine del movimento',
      'Controlla il ritorno',
      'Mantieni le scapole retratte'
    ],
    dcssNote: 'Ottimo esercizio di "prehab" - aiuta a bilanciare tutto il lavoro di pressing.',
  },

  'Lat Pulldown': {
    description: 'Trazione verticale alla lat machine. Simula il pull-up con carico regolabile.',
    technique: [
      'Afferra la barra larga con presa prona',
      'Tira verso il petto, non dietro il collo',
      'Contrai i dorsali, poi controlla la risalita',
      'Mantieni il busto leggermente inclinato'
    ],
    dcssNote: 'La presa dietro il collo è sconsigliata per lo stress sulla cuffia dei rotatori.',
  },

  // ============================================
  // CORE
  // ============================================

  'Plank': {
    description: 'Posizione statica di stabilizzazione del core. Fondamentale per la resistenza addominale.',
    technique: [
      'Avambracci a terra, corpo in linea dalla testa ai piedi',
      'Contrai gli addominali e i glutei',
      'Non lasciare che le anche scendano o salgano',
      'Respira normalmente mantenendo la tensione'
    ],
    dcssNote: 'Una leggera curva lombare è normale - non appiattire forzatamente la schiena.',
  },

  'Dead Bug': {
    description: 'Esercizio di stabilizzazione del core con movimenti alternati di braccia e gambe.',
    technique: [
      'Supino, braccia verso il soffitto, ginocchia a 90°',
      'Estendi un braccio e la gamba opposta',
      'Mantieni la zona lombare a contatto con il pavimento',
      'Alterna i lati'
    ],
    dcssNote: 'Se la schiena si solleva, riduci il range di movimento fino a quando riesci a controllarlo.',
  },

  'Hanging Leg Raise': {
    description: 'Sollevamento gambe alla sbarra. Esercizio avanzato per gli addominali.',
    technique: [
      'Appeso alla sbarra, braccia tese',
      'Solleva le gambe davanti a te',
      'Puoi piegare le ginocchia per renderlo più facile',
      'Controlla la discesa'
    ],
    dcssNote: 'L\'oscillazione è normale all\'inizio - con la pratica svilupperai il controllo.',
  },

  'Ab Wheel Rollout': {
    description: 'Rollout con ruota addominale. Esercizio avanzato per tutta la parete addominale.',
    technique: [
      'Ginocchia a terra, mani sulla ruota',
      'Rotola in avanti mantenendo la tensione addominale',
      'Vai avanti fino a dove riesci a controllare',
      'Tira indietro contraendo gli addominali'
    ],
    dcssNote: 'La progressione è importante - inizia con range limitato e aumenta gradualmente.',
  },

  // ============================================
  // ISOLATION
  // ============================================

  'Bicep Curl': {
    description: 'Flessione del gomito per i bicipiti. Esercizio di isolamento classico.',
    technique: [
      'In piedi o seduto, manubri ai lati',
      'Fletti i gomiti portando i pesi verso le spalle',
      'Un po\' di movimento del corpo è normale con carichi pesanti',
      'Controlla la discesa'
    ],
    dcssNote: 'Il "cheating" controllato può essere utile per overload - non è sempre sbagliato.',
  },

  'Tricep Pushdown': {
    description: 'Estensione del gomito ai cavi per i tricipiti.',
    technique: [
      'Afferra la barra o la corda al cavo alto',
      'Gomiti fissi ai lati',
      'Estendi completamente le braccia',
      'Controlla il ritorno'
    ],
    dcssNote: 'Sperimenta con diverse impugnature - ognuna enfatizza leggermente diversi capi del tricipite.',
  },

  'Lateral Raise': {
    description: 'Alzate laterali per i deltoidi laterali.',
    technique: [
      'Manubri ai lati, gomiti leggermente flessi',
      'Solleva lateralmente fino all\'altezza delle spalle',
      'Un po\' di slancio è accettabile con carichi pesanti',
      'Controlla la discesa'
    ],
    dcssNote: 'Non serve arrivare perfettamente a 90° - la tensione muscolare è ciò che conta.',
  },

  'Leg Extension': {
    description: 'Estensione delle ginocchia alla macchina. Isolamento per i quadricipiti.',
    technique: [
      'Seduto, caviglie sotto il rullo',
      'Estendi le ginocchia',
      'Contrai i quadricipiti in alto',
      'Controlla la discesa'
    ],
    dcssNote: 'Contrariamente al mito, non è intrinsecamente dannoso per le ginocchia - il carico deve essere appropriato.',
  },

  'Leg Curl': {
    description: 'Flessione delle ginocchia alla macchina. Isolamento per i femorali.',
    technique: [
      'Prono o seduto, caviglie sopra il rullo',
      'Fletti le ginocchia',
      'Contrai i femorali',
      'Controlla la risalita'
    ],
    dcssNote: 'Puoi variare la posizione dei piedi per enfatizzare diversamente i muscoli.',
  },

  'Calf Raise': {
    description: 'Sollevamento sui polpacci. Per lo sviluppo dei muscoli del polpaccio.',
    technique: [
      'In piedi su un rialzo, talloni oltre il bordo',
      'Solleva sui metatarsi',
      'Contrai i polpacci in alto',
      'Scendi lentamente, allungando i polpacci'
    ],
    dcssNote: 'Ginocchia dritte = gastrocnemio. Ginocchia flesse = soleo. Entrambi sono importanti.',
  },

  // Merge corrective exercises
  ...CORRECTIVE_EXERCISE_DESCRIPTIONS,
};

/**
 * Ottieni descrizione per un esercizio
 * Ritorna una descrizione di default se non trovata
 */
export function getExerciseDescription(exerciseName: string): ExerciseDescription {
  // Cerca match esatto
  if (EXERCISE_DESCRIPTIONS[exerciseName]) {
    return EXERCISE_DESCRIPTIONS[exerciseName];
  }

  // Cerca match parziale (case-insensitive)
  const lowerName = exerciseName.toLowerCase();
  for (const [key, value] of Object.entries(EXERCISE_DESCRIPTIONS)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default DCSS-style
  return {
    description: 'Esegui l\'esercizio con controllo, concentrandoti sul muscolo target.',
    technique: [
      'Mantieni il controllo durante tutto il movimento',
      'Respira in modo naturale',
      'Se senti dolore, riduci il carico o il range'
    ],
    dcssNote: 'La tecnica varia in base alle tue proporzioni individuali.'
  };
}

export default EXERCISE_DESCRIPTIONS;
