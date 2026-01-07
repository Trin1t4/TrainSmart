/**
 * BIOMECHANICS QUIZ - DCSS Paradigm Revision
 * 
 * Principi:
 * 1. Risposte sfumate, non binarie
 * 2. "Dipende" è spesso la risposta corretta
 * 3. Contesto sempre fornito
 * 4. No dogmi (spine neutral always, etc.)
 * 5. Spiegazioni post-risposta educative
 */

export interface QuizQuestion {
  id: string;
  category: 'technique' | 'anatomy' | 'programming' | 'safety';
  question: string;
  questionIt: string;
  options: QuizOption[];
  explanation: string;
  explanationIt: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  reference?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  textIt: string;
  isCorrect: boolean;
  isTechniqueGap?: boolean;  // Se true, indica gap di conoscenza tecnica
  isOverconfident?: boolean; // Se true, indica conoscenza troppo rigida
  feedback?: string;
  feedbackIt?: string;
}

// ============================================================================
// QUIZ QUESTIONS - DCSS Paradigm
// ============================================================================

export const DCSS_QUIZ_QUESTIONS: QuizQuestion[] = [
  
  // ==================== TECHNIQUE ====================
  
  {
    id: 'squat_depth',
    category: 'technique',
    difficulty: 'basic',
    question: 'How deep should you squat?',
    questionIt: 'Quanto profondo dovresti scendere nello squat?',
    options: [
      {
        id: 'a',
        text: 'Always "ass to grass" for maximum gains',
        textIt: 'Sempre "ass to grass" per massimi risultati',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Depth beyond your mobility can compromise form',
        feedbackIt: 'Profondità oltre la tua mobilità può compromettere la forma'
      },
      {
        id: 'b',
        text: 'To parallel or slightly below, based on your goals and mobility',
        textIt: 'Al parallelo o poco sotto, in base ai tuoi obiettivi e mobilità',
        isCorrect: true,
        feedback: 'Correct! Depth depends on goals, mobility, and structure',
        feedbackIt: 'Corretto! La profondità dipende da obiettivi, mobilità e struttura'
      },
      {
        id: 'c',
        text: 'Never below parallel - it damages the knees',
        textIt: 'Mai sotto il parallelo - danneggia le ginocchia',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'This is a myth - deep squats are safe when done with proper form',
        feedbackIt: 'Questo è un mito - squat profondi sono sicuri se fatti con tecnica corretta'
      },
      {
        id: 'd',
        text: 'I\'m not sure',
        textIt: 'Non sono sicuro',
        isCorrect: false,
        feedback: 'No problem - we\'ll teach you!',
        feedbackIt: 'Nessun problema - te lo insegneremo!'
      }
    ],
    explanation: 'Squat depth is individual. Parallel is sufficient for most goals. Going deeper is fine if you have the mobility. The key is maintaining control throughout the movement.',
    explanationIt: 'La profondità dello squat è individuale. Il parallelo è sufficiente per la maggior parte degli obiettivi. Andare più profondo va bene se hai la mobilità. La chiave è mantenere il controllo durante tutto il movimento.',
    reference: 'Kompf & Arandjelović (2017)'
  },
  
  {
    id: 'deadlift_back',
    category: 'technique',
    difficulty: 'intermediate',
    question: 'During a deadlift, what is the priority for your back position?',
    questionIt: 'Durante lo stacco, qual è la priorità per la posizione della schiena?',
    options: [
      {
        id: 'a',
        text: 'Keep it perfectly straight at all times',
        textIt: 'Mantenerla perfettamente dritta sempre',
        isCorrect: false,
        isOverconfident: true,
        feedback: '"Perfectly straight" is neither possible nor necessary',
        feedbackIt: '"Perfettamente dritta" non è né possibile né necessario'
      },
      {
        id: 'b',
        text: 'Maintain control without sudden loss of position',
        textIt: 'Mantenere il controllo senza perdite improvvise di posizione',
        isCorrect: true,
        feedback: 'Exactly! Control is key, not a specific angle',
        feedbackIt: 'Esatto! Il controllo è la chiave, non un angolo specifico'
      },
      {
        id: 'c',
        text: 'Some rounding is fine - position doesn\'t matter if the weight goes up',
        textIt: 'Un po\' di arrotondamento va bene - la posizione non importa se il peso sale',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Control matters - uncontrolled rounding indicates the load exceeds your capacity',
        feedbackIt: 'Il controllo conta - arrotondamento non controllato indica che il carico supera la tua capacità'
      },
      {
        id: 'd',
        text: 'I don\'t know',
        textIt: 'Non so',
        isCorrect: false,
        feedback: 'We\'ll cover this in your program',
        feedbackIt: 'Lo tratteremo nel tuo programma'
      }
    ],
    explanation: 'The key is CONTROL, not a "perfect" position. Some lumbar flexion is normal, especially with heavy loads. What matters is that there are no sudden losses of position, which indicate the load is challenging your capacity.',
    explanationIt: 'La chiave è il CONTROLLO, non una posizione "perfetta". Una certa flessione lombare è normale, specialmente con carichi pesanti. Quello che conta è che non ci siano perdite improvvise di posizione, che indicano che il carico sta sfidando la tua capacità.',
    reference: 'Vigotsky et al. (2015), Swain et al. (2020)'
  },
  
  {
    id: 'butt_wink',
    category: 'technique',
    difficulty: 'intermediate',
    question: 'What is "butt wink" (lumbar flexion at the bottom of a squat)?',
    questionIt: 'Cos\'è il "butt wink" (flessione lombare nel bottom dello squat)?',
    options: [
      {
        id: 'a',
        text: 'A dangerous error that must be corrected immediately',
        textIt: 'Un errore pericoloso da correggere immediatamente',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Research doesn\'t support this - moderate flexion is common and often normal',
        feedbackIt: 'La ricerca non supporta questo - una flessione moderata è comune e spesso normale'
      },
      {
        id: 'b',
        text: 'A common occurrence that may or may not be relevant depending on the individual',
        textIt: 'Un evento comune che può essere o meno rilevante a seconda dell\'individuo',
        isCorrect: true,
        feedback: 'Correct! It depends on your structure, load, and whether it causes discomfort',
        feedbackIt: 'Corretto! Dipende dalla tua struttura, dal carico, e se causa fastidio'
      },
      {
        id: 'c',
        text: 'A sign of weak abs that needs specific core work',
        textIt: 'Un segno di addominali deboli che richiede lavoro specifico sul core',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'It\'s usually related to hip/ankle mobility or structure, not core strength',
        feedbackIt: 'Di solito è legato a mobilità anca/caviglia o struttura, non forza del core'
      },
      {
        id: 'd',
        text: 'I\'ve never heard of this',
        textIt: 'Non ne ho mai sentito parlare',
        isCorrect: false,
        feedback: 'No worries - we\'ll explain it in your program',
        feedbackIt: 'Nessun problema - lo spiegheremo nel tuo programma'
      }
    ],
    explanation: 'Butt wink is common and often normal. It depends on your pelvis structure, hip mobility, and femur length. Studies (Swain 2020) show no correlation between moderate lumbar flexion and back pain in trained individuals.',
    explanationIt: 'Il butt wink è comune e spesso normale. Dipende dalla struttura del bacino, mobilità dell\'anca e lunghezza del femore. Studi (Swain 2020) non mostrano correlazione tra flessione lombare moderata e mal di schiena in soggetti allenati.',
    reference: 'Swain et al. (2020), Caneiro et al. (2019)'
  },
  
  {
    id: 'torso_lean',
    category: 'technique',
    difficulty: 'advanced',
    question: 'During a squat, how upright should your torso be?',
    questionIt: 'Durante lo squat, quanto verticale dovrebbe essere il busto?',
    options: [
      {
        id: 'a',
        text: 'As upright as possible - leaning forward is bad form',
        textIt: 'Il più verticale possibile - inclinarsi in avanti è cattiva tecnica',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Forward lean is physics, not bad form - it depends on your proportions',
        feedbackIt: 'L\'inclinazione in avanti è fisica, non cattiva tecnica - dipende dalle tue proporzioni'
      },
      {
        id: 'b',
        text: 'It depends on your femur length, bar position, and goals',
        textIt: 'Dipende dalla lunghezza del femore, posizione della barra e obiettivi',
        isCorrect: true,
        feedback: 'Exactly! Long femurs require more forward lean - this is mechanical necessity',
        feedbackIt: 'Esatto! Femori lunghi richiedono più inclinazione - è una necessità meccanica'
      },
      {
        id: 'c',
        text: 'It doesn\'t matter as long as the weight goes up',
        textIt: 'Non importa purché il peso salga',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Torso angle affects muscle emphasis and efficiency',
        feedbackIt: 'L\'angolo del busto influenza l\'enfasi muscolare e l\'efficienza'
      },
      {
        id: 'd',
        text: 'I\'m not sure',
        textIt: 'Non sono sicuro',
        isCorrect: false
      }
    ],
    explanation: 'Torso lean depends on your proportions. If you have long femurs relative to your torso, you MUST lean forward more - it\'s physics, not technique error. Low bar squats also require more lean than high bar.',
    explanationIt: 'L\'inclinazione del busto dipende dalle tue proporzioni. Se hai femori lunghi rispetto al torso, DEVI inclinarti di più - è fisica, non errore tecnico. Lo squat low bar richiede anche più inclinazione dell\'high bar.',
    reference: 'Lorenzetti et al. (2018), DCSS Evangelista'
  },
  
  // ==================== ANATOMY ====================
  
  {
    id: 'muscle_soreness',
    category: 'anatomy',
    difficulty: 'basic',
    question: 'Is muscle soreness (DOMS) a sign of a good workout?',
    questionIt: 'I DOMS (dolori muscolari post-allenamento) sono segno di un buon allenamento?',
    options: [
      {
        id: 'a',
        text: 'Yes - no pain, no gain',
        textIt: 'Sì - senza dolore non c\'è guadagno',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Soreness is not a reliable indicator of workout quality',
        feedbackIt: 'I DOMS non sono un indicatore affidabile della qualità dell\'allenamento'
      },
      {
        id: 'b',
        text: 'Not necessarily - it indicates novelty, not effectiveness',
        textIt: 'Non necessariamente - indicano novità, non efficacia',
        isCorrect: true,
        feedback: 'Correct! DOMS decrease as you adapt, but gains continue',
        feedbackIt: 'Corretto! I DOMS diminuiscono con l\'adattamento, ma i progressi continuano'
      },
      {
        id: 'c',
        text: 'Always - if you\'re not sore, you didn\'t train hard enough',
        textIt: 'Sempre - se non hai DOMS, non ti sei allenato abbastanza',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Advanced trainees often progress with minimal soreness',
        feedbackIt: 'Gli atleti avanzati spesso progrediscono con DOMS minimi'
      },
      {
        id: 'd',
        text: 'I don\'t know',
        textIt: 'Non so',
        isCorrect: false
      }
    ],
    explanation: 'DOMS (Delayed Onset Muscle Soreness) primarily indicates that you did something new or unfamiliar. As you adapt to a program, soreness decreases, but that doesn\'t mean the workouts are less effective.',
    explanationIt: 'I DOMS (Dolori Muscolari a Insorgenza Ritardata) indicano principalmente che hai fatto qualcosa di nuovo o non familiare. Man mano che ti adatti al programma, i DOMS diminuiscono, ma questo non significa che gli allenamenti siano meno efficaci.',
    reference: 'Schoenfeld & Contreras (2013)'
  },
  
  {
    id: 'pain_training',
    category: 'anatomy',
    difficulty: 'intermediate',
    question: 'Should you train through discomfort?',
    questionIt: 'Dovresti allenarti nonostante un fastidio?',
    options: [
      {
        id: 'a',
        text: 'Never - any discomfort means you should stop',
        textIt: 'Mai - qualsiasi fastidio significa che dovresti fermarti',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Mild discomfort (1-4/10) that doesn\'t worsen is often fine to work through',
        feedbackIt: 'Un fastidio lieve (1-4/10) che non peggiora è spesso gestibile'
      },
      {
        id: 'b',
        text: 'Mild discomfort (1-4/10) that doesn\'t worsen is generally acceptable',
        textIt: 'Un fastidio lieve (1-4/10) che non peggiora è generalmente accettabile',
        isCorrect: true,
        feedback: 'Correct! The key is that it doesn\'t worsen during or after exercise',
        feedbackIt: 'Corretto! La chiave è che non peggiori durante o dopo l\'esercizio'
      },
      {
        id: 'c',
        text: 'Always push through - discomfort is weakness leaving the body',
        textIt: 'Sempre andare avanti - il fastidio è debolezza che lascia il corpo',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Ignoring significant discomfort can lead to injury',
        feedbackIt: 'Ignorare un fastidio significativo può portare a infortuni'
      },
      {
        id: 'd',
        text: 'I\'m not sure when to push and when to stop',
        textIt: 'Non sono sicuro di quando insistere e quando fermarmi',
        isCorrect: false,
        feedback: 'Our system will help you make these decisions',
        feedbackIt: 'Il nostro sistema ti aiuterà a prendere queste decisioni'
      }
    ],
    explanation: 'In modern rehabilitation, "tolerable discomfort" (around 3-4/10 that doesn\'t worsen) is considered acceptable and often therapeutic. The key indicators are: it doesn\'t worsen during exercise, and it doesn\'t feel worse the next day.',
    explanationIt: 'Nella riabilitazione moderna, il "fastidio tollerabile" (circa 3-4/10 che non peggiora) è considerato accettabile e spesso terapeutico. Gli indicatori chiave sono: non peggiora durante l\'esercizio e non si sente peggio il giorno dopo.',
    reference: 'Silbernagel et al. (tendinopathy protocols)'
  },
  
  // ==================== PROGRAMMING ====================
  
  {
    id: 'training_frequency',
    category: 'programming',
    difficulty: 'basic',
    question: 'How often should you train each muscle group?',
    questionIt: 'Quanto spesso dovresti allenare ogni gruppo muscolare?',
    options: [
      {
        id: 'a',
        text: 'Once a week maximum - muscles need time to recover',
        textIt: 'Una volta a settimana al massimo - i muscoli hanno bisogno di tempo per recuperare',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Research shows 2x per week may be optimal for hypertrophy',
        feedbackIt: 'La ricerca mostra che 2 volte a settimana può essere ottimale per l\'ipertrofia'
      },
      {
        id: 'b',
        text: 'It depends on volume, intensity, and individual recovery',
        textIt: 'Dipende da volume, intensità e recupero individuale',
        isCorrect: true,
        feedback: 'Correct! 1-3 times per week can all work depending on how you structure it',
        feedbackIt: 'Corretto! 1-3 volte a settimana possono funzionare tutte a seconda di come le strutturi'
      },
      {
        id: 'c',
        text: 'Every day for maximum gains',
        textIt: 'Ogni giorno per massimi risultati',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Recovery is when growth happens - too frequent training can impair it',
        feedbackIt: 'Il recupero è quando avviene la crescita - allenarsi troppo spesso può compromettarlo'
      },
      {
        id: 'd',
        text: 'I don\'t know',
        textIt: 'Non so',
        isCorrect: false
      }
    ],
    explanation: 'Optimal frequency depends on many factors. Research generally supports 2x per week for hypertrophy, but once weekly can work with sufficient volume. The key is total weekly volume and quality of each session.',
    explanationIt: 'La frequenza ottimale dipende da molti fattori. La ricerca generalmente supporta 2 volte a settimana per l\'ipertrofia, ma anche una volta può funzionare con volume sufficiente. La chiave è il volume settimanale totale e la qualità di ogni sessione.',
    reference: 'Schoenfeld et al. (2016)'
  },
  
  {
    id: 'exercise_selection',
    category: 'programming',
    difficulty: 'intermediate',
    question: 'Are compound exercises (squat, deadlift, bench) mandatory for results?',
    questionIt: 'Gli esercizi composti (squat, stacco, panca) sono obbligatori per i risultati?',
    options: [
      {
        id: 'a',
        text: 'Yes - you can\'t build muscle without the "big lifts"',
        textIt: 'Sì - non puoi costruire muscolo senza i "big lifts"',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Muscles respond to tension, not specific exercises',
        feedbackIt: 'I muscoli rispondono alla tensione, non a esercizi specifici'
      },
      {
        id: 'b',
        text: 'No - what matters is progressive overload on any challenging exercise',
        textIt: 'No - quello che conta è il sovraccarico progressivo su qualsiasi esercizio sfidante',
        isCorrect: true,
        feedback: 'Correct! Machines, cables, and dumbbells can all build muscle effectively',
        feedbackIt: 'Corretto! Macchine, cavi e manubri possono tutti costruire muscolo efficacemente'
      },
      {
        id: 'c',
        text: 'Compounds are better but isolation works too',
        textIt: 'I composti sono migliori ma anche gli isolati funzionano',
        isCorrect: false,
        feedback: 'Both have their place - neither is inherently "better"',
        feedbackIt: 'Entrambi hanno il loro posto - nessuno è intrinsecamente "migliore"'
      },
      {
        id: 'd',
        text: 'I\'m not sure',
        textIt: 'Non sono sicuro',
        isCorrect: false
      }
    ],
    explanation: 'Muscles don\'t know what exercise you\'re doing - they only know tension. Compound exercises are efficient because they train multiple muscles at once, but machines and isolation work can be equally effective for building muscle.',
    explanationIt: 'I muscoli non sanno quale esercizio stai facendo - conoscono solo la tensione. Gli esercizi composti sono efficienti perché allenano più muscoli contemporaneamente, ma macchine e isolati possono essere ugualmente efficaci per costruire muscolo.',
    reference: 'DCSS Evangelista, Schoenfeld (2010)'
  },
  
  // ==================== SAFETY ====================
  
  {
    id: 'warm_up',
    category: 'safety',
    difficulty: 'basic',
    question: 'What\'s the best way to warm up before lifting?',
    questionIt: 'Qual è il modo migliore per riscaldarsi prima di sollevare pesi?',
    options: [
      {
        id: 'a',
        text: 'Static stretching for 10-15 minutes',
        textIt: 'Stretching statico per 10-15 minuti',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Static stretching before lifting may temporarily reduce strength',
        feedbackIt: 'Lo stretching statico prima di sollevare può ridurre temporaneamente la forza'
      },
      {
        id: 'b',
        text: 'Light cardio, then warm-up sets of the exercises you\'ll do',
        textIt: 'Cardio leggero, poi set di riscaldamento degli esercizi che farai',
        isCorrect: true,
        feedback: 'Correct! Specific warm-up sets prepare you for the movement',
        feedbackIt: 'Corretto! Set di riscaldamento specifici ti preparano per il movimento'
      },
      {
        id: 'c',
        text: 'No warm-up needed if you start light',
        textIt: 'Nessun riscaldamento necessario se inizi leggero',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Some warm-up helps prepare joints, muscles, and nervous system',
        feedbackIt: 'Un po\' di riscaldamento aiuta a preparare articolazioni, muscoli e sistema nervoso'
      },
      {
        id: 'd',
        text: 'I don\'t know the best approach',
        textIt: 'Non conosco l\'approccio migliore',
        isCorrect: false
      }
    ],
    explanation: 'An effective warm-up includes: 5 minutes of light cardio to raise body temperature, then progressive warm-up sets of the exercises you\'ll perform. Static stretching is better saved for after the workout.',
    explanationIt: 'Un riscaldamento efficace include: 5 minuti di cardio leggero per alzare la temperatura corporea, poi set di riscaldamento progressivi degli esercizi che eseguirai. Lo stretching statico è meglio riservarlo a dopo l\'allenamento.',
    reference: 'ACSM Guidelines'
  },
  
  {
    id: 'rir_failure',
    category: 'safety',
    difficulty: 'intermediate',
    question: 'Should you train to failure on every set?',
    questionIt: 'Dovresti arrivare a cedimento in ogni serie?',
    options: [
      {
        id: 'a',
        text: 'Yes - if you\'re not failing, you\'re not trying hard enough',
        textIt: 'Sì - se non arrivi a cedimento, non ti stai impegnando abbastanza',
        isCorrect: false,
        isOverconfident: true,
        feedback: 'Training to failure on every set causes excessive fatigue and can impair recovery',
        feedbackIt: 'Allenarsi a cedimento in ogni serie causa eccessivo affaticamento e può compromettere il recupero'
      },
      {
        id: 'b',
        text: 'No - stopping 1-3 reps before failure is often more sustainable',
        textIt: 'No - fermarsi 1-3 rep prima del cedimento è spesso più sostenibile',
        isCorrect: true,
        feedback: 'Correct! RIR (Reps in Reserve) approach allows for better volume management',
        feedbackIt: 'Corretto! L\'approccio RIR (Reps in Reserve) permette una migliore gestione del volume'
      },
      {
        id: 'c',
        text: 'Never go near failure - it\'s dangerous',
        textIt: 'Mai avvicinarsi al cedimento - è pericoloso',
        isCorrect: false,
        isTechniqueGap: true,
        feedback: 'Hard training is necessary for progress - failure has its place',
        feedbackIt: 'Allenarsi duro è necessario per progredire - il cedimento ha il suo posto'
      },
      {
        id: 'd',
        text: 'I don\'t know what RIR/failure means',
        textIt: 'Non so cosa significhi RIR/cedimento',
        isCorrect: false,
        feedback: 'We\'ll teach you about this important concept',
        feedbackIt: 'Ti insegneremo questo concetto importante'
      }
    ],
    explanation: 'Research shows that training 1-3 reps shy of failure (RIR 1-3) produces similar muscle growth to failure training, with less fatigue. Saving failure for the last set of an exercise is a sustainable approach.',
    explanationIt: 'La ricerca mostra che allenarsi 1-3 rep prima del cedimento (RIR 1-3) produce una crescita muscolare simile all\'allenamento a cedimento, con meno affaticamento. Riservare il cedimento per l\'ultima serie di un esercizio è un approccio sostenibile.',
    reference: 'Helms et al. (2016), DCSS'
  }
];

// ============================================================================
// QUIZ EVALUATION
// ============================================================================

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  techniqueGaps: string[];      // IDs of questions showing knowledge gaps
  overconfidentAreas: string[]; // IDs of questions showing rigid thinking
  recommendedFocus: string[];
  overallLevel: 'beginner' | 'intermediate' | 'advanced';
  feedback: string;
  feedbackIt: string;
}

export function evaluateQuiz(answers: Record<string, string>): QuizResult {
  let correct = 0;
  const techniqueGaps: string[] = [];
  const overconfidentAreas: string[] = [];
  
  for (const question of DCSS_QUIZ_QUESTIONS) {
    const userAnswer = answers[question.id];
    if (!userAnswer) continue;
    
    const selectedOption = question.options.find(o => o.id === userAnswer);
    if (!selectedOption) continue;
    
    if (selectedOption.isCorrect) {
      correct++;
    } else {
      if (selectedOption.isTechniqueGap) {
        techniqueGaps.push(question.id);
      }
      if (selectedOption.isOverconfident) {
        overconfidentAreas.push(question.id);
      }
    }
  }
  
  const total = Object.keys(answers).length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;
  
  // Determine level
  let overallLevel: 'beginner' | 'intermediate' | 'advanced';
  if (percentage >= 80 && overconfidentAreas.length === 0) {
    overallLevel = 'advanced';
  } else if (percentage >= 50) {
    overallLevel = 'intermediate';
  } else {
    overallLevel = 'beginner';
  }
  
  // Generate recommendations
  const recommendedFocus: string[] = [];
  if (techniqueGaps.length > 0) {
    recommendedFocus.push('technique_education');
  }
  if (overconfidentAreas.length > 0) {
    recommendedFocus.push('flexibility_mindset');  // They have rigid beliefs
  }
  
  // Generate feedback
  let feedback: string;
  let feedbackIt: string;
  
  if (overconfidentAreas.length > techniqueGaps.length) {
    feedback = 'You have good knowledge, but some beliefs may be more rigid than the science supports. We\'ll provide nuanced guidance.';
    feedbackIt = 'Hai buone conoscenze, ma alcune credenze potrebbero essere più rigide di quanto la scienza supporti. Ti forniremo indicazioni sfumate.';
  } else if (techniqueGaps.length > 2) {
    feedback = 'We\'ll focus on teaching you the fundamentals with plenty of explanation and guidance.';
    feedbackIt = 'Ci concentreremo sull\'insegnarti i fondamentali con molte spiegazioni e indicazioni.';
  } else {
    feedback = 'Great foundation! We\'ll fine-tune your approach based on your specific goals.';
    feedbackIt = 'Ottima base! Perfezioneremo il tuo approccio in base ai tuoi obiettivi specifici.';
  }
  
  return {
    totalQuestions: total,
    correctAnswers: correct,
    techniqueGaps,
    overconfidentAreas,
    recommendedFocus,
    overallLevel,
    feedback,
    feedbackIt
  };
}

export default {
  questions: DCSS_QUIZ_QUESTIONS,
  evaluate: evaluateQuiz
};
