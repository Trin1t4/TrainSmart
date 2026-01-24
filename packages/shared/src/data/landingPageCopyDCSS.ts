/**
 * LANDING PAGE COPY - DCSS Paradigm
 * 
 * Copy aggiornato per la landing page di TrainSmart.
 * Linguaggio non catastrofista, focus su adattamento e scelta dell'utente.
 * 
 * Questo file contiene SOLO il copy, da integrare nel componente Landing.tsx
 */

// ============================================================================
// HERO SECTION
// ============================================================================

export const HERO_COPY = {
  // Vecchio: "Un sistema che PROTEGGE il tuo corpo mentre ti fa progredire"
  headline: {
    it: "Allenamento che si adatta a TE",
    en: "Training that adapts to YOU"
  },
  subheadline: {
    it: "Alle tue proporzioni. Al tuo stato attuale. Ai tuoi obiettivi.",
    en: "To your proportions. Your current state. Your goals."
  },
  cta: {
    it: "Inizia Gratis",
    en: "Start Free"
  }
};

// ============================================================================
// VALUE PROPOSITION
// ============================================================================

export const VALUE_PROP_COPY = {
  // Vecchio: "Non è l'ennesima app con schede preconfezionate. È un sistema che protegge il tuo corpo..."
  main: {
    it: "Non è l'ennesima app con schede preconfezionate. È un sistema che capisce il TUO corpo e adatta l'allenamento a TE.",
    en: "Not another app with pre-made programs. A system that understands YOUR body and adapts training to YOU."
  },
  supporting: {
    it: "Perché quello che funziona per uno potrebbe non funzionare per un altro. E quello che sembra inadatto per uno può essere ottimale per te.",
    en: "Because what works for one person might not work for another. And what seems unsuitable for one can be optimal for you."
  }
};

// ============================================================================
// PAIN DETECT FEATURE
// ============================================================================

export const PAIN_DETECT_COPY = {
  // Vecchio: "Segnali un dolore alla spalla? Il sistema adatta automaticamente il tuo programma: 
  // riduce i carichi, sostituisce gli esercizi a rischio con alternative sicure."
  title: {
    it: "Pain Detect & AdaptFlow",
    en: "Pain Detect & AdaptFlow"
  },
  description: {
    it: "Segnali un fastidio? Il sistema ti propone opzioni: ridurre il carico, provare una variante, o continuare se ti senti pronto. Tu scegli, noi supportiamo.",
    en: "Report discomfort? The system offers options: reduce load, try a variation, or continue if you feel ready. You choose, we support."
  },
  features: [
    {
      it: "Adattamento intelligente del carico",
      en: "Smart load adaptation"
    },
    {
      it: "Varianti che lavorano diversamente sulla zona",
      en: "Variations that work differently on the area"
    },
    {
      it: "Sempre tu a decidere come procedere",
      en: "You always decide how to proceed"
    }
  ],
  note: {
    it: "Un fastidio lieve (1-3/10) che non peggiora durante l'esercizio è generalmente accettabile. Il tuo corpo è resiliente.",
    en: "Mild discomfort (1-3/10) that doesn't worsen during exercise is generally acceptable. Your body is resilient."
  }
};

// ============================================================================
// ASSESSMENT FEATURE
// ============================================================================

export const ASSESSMENT_COPY = {
  title: {
    it: "Assessment Completo",
    en: "Complete Assessment"
  },
  // Vecchio: "Quiz + test pratici per valutare il tuo livello reale"
  description: {
    it: "Quiz + test pratici per calibrare il programma sulle tue capacità attuali. Non chiediamo solo 'quanti anni ti alleni', ma testiamo come ti muovi.",
    en: "Quiz + practical tests to calibrate the program to your current abilities. We don't just ask 'how long have you trained', we test how you move."
  },
  features: [
    {
      it: "Valutazione movimento, non solo questionario",
      en: "Movement assessment, not just questionnaire"
    },
    {
      it: "Calibrazione su TUE proporzioni",
      en: "Calibrated to YOUR proportions"
    },
    {
      it: "Programma che parte da dove sei, non da dove 'dovresti' essere",
      en: "Program starts from where you are, not where you 'should' be"
    }
  ]
};

// ============================================================================
// BIOMECHANICS FEATURE
// ============================================================================

export const BIOMECHANICS_COPY = {
  title: {
    it: "Analisi del Movimento",
    en: "Movement Analysis"
  },
  // Vecchio: "Corregge la tua tecnica"
  description: {
    it: "Ti aiuta a capire il tuo movimento. Non giudizi, ma osservazioni basate sulla tua struttura individuale.",
    en: "Helps you understand your movement. Not judgments, but observations based on your individual structure."
  },
  quote: {
    text: {
      it: "La tecnica ottimale dipende dalle proporzioni individuali: rapporto femore/torso/tibia, lunghezza braccia, mobilità articolare, struttura del bacino.",
      en: "Optimal technique depends on individual proportions: femur/torso/tibia ratio, arm length, joint mobility, pelvic structure."
    },
    author: "Paolo Evangelista",
    source: "DCSS"
  },
  note: {
    it: "Quello che sembra inadatto per uno può essere ottimale per un altro. TrainSmart analizza TE, non un modello standardizzato.",
    en: "What seems unsuitable for one can be optimal for another. TrainSmart analyzes YOU, not a standardized model."
  }
};

// ============================================================================
// PROGRESSION FEATURE
// ============================================================================

export const PROGRESSION_COPY = {
  title: {
    it: "Progressione Intelligente",
    en: "Smart Progression"
  },
  // Vecchio: "Protegge da sovrallenamento"
  description: {
    it: "Bilancia stimolo e recupero. Il sistema impara dal tuo feedback e adatta volume e intensità settimana dopo settimana.",
    en: "Balances stimulus and recovery. The system learns from your feedback and adapts volume and intensity week after week."
  },
  features: [
    {
      it: "Auto-regolazione basata su come ti senti",
      en: "Auto-regulation based on how you feel"
    },
    {
      it: "Deload quando serve, progressione quando sei pronto",
      en: "Deload when needed, progression when you're ready"
    },
    {
      it: "Niente programmi rigidi che non ascoltano il tuo corpo",
      en: "No rigid programs that don't listen to your body"
    }
  ]
};

// ============================================================================
// HIERARCHY SECTION (Evangelista's Priority)
// ============================================================================

export const HIERARCHY_COPY = {
  title: {
    it: "Gerarchia delle Correzioni",
    en: "Correction Hierarchy"
  },
  subtitle: {
    it: "Basato sui principi DCSS di Paolo Evangelista",
    en: "Based on DCSS principles by Paolo Evangelista"
  },
  levels: [
    {
      number: "1°",
      title: {
        it: "Controllo",
        en: "Control"
      },
      // Vecchio: "Sicurezza" - troppo allarmista
      description: {
        it: "Mantieni il controllo del movimento. Senza controllo, non c'è stimolo efficace.",
        en: "Maintain control of the movement. Without control, there's no effective stimulus."
      }
    },
    {
      number: "2°",
      title: {
        it: "Efficienza",
        en: "Efficiency"
      },
      description: {
        it: "Percorso ottimale del carico, timing adeguato, attivazione muscolare mirata.",
        en: "Optimal load path, appropriate timing, targeted muscle activation."
      }
    },
    {
      number: "3°",
      title: {
        it: "Ottimizzazione",
        en: "Optimization"
      },
      description: {
        it: "Adattamenti individuali alle tue proporzioni uniche. Non standard, ma personalizzato.",
        en: "Individual adaptations to your unique proportions. Not standard, but personalized."
      }
    }
  ]
};

// ============================================================================
// TRIAL / PRICING SECTION
// ============================================================================

export const TRIAL_COPY = {
  title: {
    it: "6 Settimane Gratis",
    en: "6 Weeks Free"
  },
  subtitle: {
    it: "Prova tutto, senza impegno. Poi scegli il piano adatto a te.",
    en: "Try everything, no commitment. Then choose the plan that fits you."
  },
  features: [
    {
      it: "Programma completo personalizzato",
      en: "Complete personalized program"
    },
    {
      it: "Pain Detect attivo",
      en: "Pain Detect active"
    },
    {
      it: "Assessment iniziale",
      en: "Initial assessment"
    },
    {
      it: "Nessuna carta di credito richiesta",
      en: "No credit card required"
    }
  ]
};

// ============================================================================
// SOCIAL PROOF / TESTIMONIALS
// ============================================================================

export const TESTIMONIAL_COPY = {
  title: {
    it: "Cosa Dicono Gli Utenti",
    en: "What Users Say"
  },
  // Placeholder - da popolare con testimonial reali
  testimonials: [
    {
      text: {
        it: "Finalmente un'app che non mi tratta come se fossi fragile. Mi fa capire il mio corpo invece di spaventarmi.",
        en: "Finally an app that doesn't treat me like I'm fragile. It helps me understand my body instead of scaring me."
      },
      author: "Marco, 32",
      context: {
        it: "3 mesi di utilizzo",
        en: "3 months of use"
      }
    },
    {
      text: {
        it: "Avevo sempre paura di 'sbagliare' la tecnica. TrainSmart mi ha fatto capire che il mio squat è giusto per ME.",
        en: "I was always afraid of 'wrong' technique. TrainSmart helped me understand that my squat is right for ME."
      },
      author: "Laura, 28",
      context: {
        it: "Femori lunghi, ex-kinesiofobica",
        en: "Long femurs, former kinesiophobe"
      }
    }
  ]
};

// ============================================================================
// FAQ SECTION
// ============================================================================

export const FAQ_COPY = {
  title: {
    it: "Domande Frequenti",
    en: "Frequently Asked Questions"
  },
  questions: [
    {
      q: {
        it: "Se segnalo dolore, l'app mi blocca l'allenamento?",
        en: "If I report pain, does the app block my training?"
      },
      a: {
        it: "No. Ti proponiamo opzioni (ridurre carico, provare variante, continuare) e TU scegli. Non siamo qui per imporre, ma per supportare. Solo in casi di fastidio molto alto (7+/10) ti consigliamo di fermarti, ma anche lì la scelta finale è tua.",
        en: "No. We offer options (reduce load, try variation, continue) and YOU choose. We're not here to impose, but to support. Only in cases of very high discomfort (7+/10) do we recommend stopping, but even then the final choice is yours."
      }
    },
    {
      q: {
        it: "La tecnica che mi suggerite è 'quella giusta'?",
        en: "Is the technique you suggest 'the right one'?"
      },
      a: {
        it: "Non esiste 'la tecnica giusta' universale. Esiste la tecnica giusta per TE, basata sulle tue proporzioni, mobilità e obiettivi. Quello che è ottimale per uno può non esserlo per un altro. Noi osserviamo e suggeriamo, non giudichiamo.",
        en: "There's no universal 'right technique'. There's the right technique for YOU, based on your proportions, mobility and goals. What's optimal for one may not be for another. We observe and suggest, we don't judge."
      }
    },
    {
      q: {
        it: "È un'app per principianti o avanzati?",
        en: "Is this app for beginners or advanced?"
      },
      a: {
        it: "Per tutti. L'assessment iniziale calibra il programma sul tuo livello reale. Un principiante avrà progressioni più graduali e più focus sui fondamentali. Un avanzato avrà periodizzazione più sofisticata e carichi relativi più alti.",
        en: "For everyone. The initial assessment calibrates the program to your real level. A beginner will have more gradual progressions and more focus on fundamentals. An advanced user will have more sophisticated periodization and higher relative loads."
      }
    },
    {
      q: {
        it: "Se il dolore persiste, cosa succede?",
        en: "If the discomfort persists, what happens?"
      },
      a: {
        it: "Dopo 3 sessioni con lo stesso fastidio, ti suggeriamo di consultare un fisioterapista o medico sportivo. Non è un allarme, è un suggerimento pratico. Intanto continuiamo ad adattare il tuo programma per permetterti di allenarti.",
        en: "After 3 sessions with the same discomfort, we suggest consulting a physiotherapist or sports doctor. It's not an alarm, it's a practical suggestion. Meanwhile we continue adapting your program to allow you to train."
      }
    },
    {
      q: {
        it: "L'analisi video è accurata?",
        en: "Is the video analysis accurate?"
      },
      a: {
        it: "Usiamo MediaPipe che ha una precisione di ±5-10° sugli angoli. È uno strumento educational, non diagnostico. Ti aiuta a capire pattern generali del tuo movimento. Per una valutazione accurata, un coach o fisioterapista di persona è sempre meglio.",
        en: "We use MediaPipe which has ±5-10° accuracy on angles. It's an educational tool, not diagnostic. It helps you understand general patterns of your movement. For accurate assessment, an in-person coach or physiotherapist is always better."
      }
    }
  ]
};

// ============================================================================
// FOOTER CTA
// ============================================================================

export const FOOTER_CTA_COPY = {
  headline: {
    it: "Pronto a scoprire l'allenamento adatto a TE?",
    en: "Ready to discover training that fits YOU?"
  },
  subheadline: {
    it: "6 settimane gratis. Nessun impegno. Nessuna carta richiesta.",
    en: "6 weeks free. No commitment. No card required."
  },
  cta: {
    it: "Inizia Ora",
    en: "Start Now"
  }
};

// ============================================================================
// DISCLAIMER (Footer)
// ============================================================================

export const DISCLAIMER_COPY = {
  text: {
    it: "TrainSmart è uno strumento di supporto all'allenamento, non un dispositivo medico. Per condizioni mediche, infortuni o dubbi sulla tua salute, consulta sempre un professionista sanitario qualificato.",
    en: "TrainSmart is a training support tool, not a medical device. For medical conditions, injuries or concerns about your health, always consult a qualified healthcare professional."
  }
};
