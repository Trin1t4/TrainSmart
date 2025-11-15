import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

// 7 domande TECNICHE (tecnica esercizi)
const TECHNICAL_QUESTIONS = [
  {
    question: "Durante lo squat, dove deve passare la linea del bilanciere vista di lato?",
    options: [
      "Dietro i talloni",
      "Davanti alle punte dei piedi",
      "Sul centro del piede, in linea con le caviglie",
      "Non importa, basta scendere parallelo"
    ],
    correctAnswer: 2,
    type: "technical"
  },
  {
    question: "Nello stacco da terra, dove deve rimanere il bilanciere durante tutta la salita?",
    options: [
      "Deve toccare solo all'inizio",
      "Lontano dal corpo per evitare di toccare le gambe",
      "Deve oscillare liberamente",
      "Attaccato al corpo o a pochi millimetri di distanza"
    ],
    correctAnswer: 3,
    type: "technical"
  },
  {
    question: "Cosa devono fare le scapole PRIMA di iniziare a tirare nelle trazioni?",
    options: [
      "Depresse (abbassate) e leggermente addotte (avvicinate)",
      "Rimanere completamente rilassate",
      "Non importa, basta tirare forte",
      "Elevarsi completamente verso l'alto"
    ],
    correctAnswer: 0,
    type: "technical"
  },
  {
    question: "Nella panca piana, qual è la traiettoria corretta del bilanciere?",
    options: [
      "Orizzontale parallela al pavimento",
      "Verticale dritta su e giù",
      "Circolare intorno al petto",
      "Leggermente diagonale verso i piedi in discesa, verso la testa in salita"
    ],
    correctAnswer: 3,
    type: "technical"
  },
  {
    question: "Nel military press, dove deve essere posizionato il bilanciere a inizio movimento?",
    options: [
      "All'altezza dell'ombelico",
      "Appoggiato sulle spalle dietro la testa",
      "All'altezza delle clavicole/parte alta petto",
      "Sopra la testa"
    ],
    correctAnswer: 2,
    type: "technical"
  },
  {
    question: "Nel pulley basso, qual è il movimento corretto delle scapole?",
    options: [
      "Devono rimanere completamente ferme",
      "Solo elevazione verso le orecchie",
      "Retrazione (avvicinamento) portando i gomiti indietro",
      "Dipende dalla presa"
    ],
    correctAnswer: 2,
    type: "technical"
  },
  {
    question: "Cos'è il 'valsalva' e quando si usa?",
    options: [
      "Una marca di bilancieri",
      "Un esercizio per i polpacci",
      "Un tipo di squat bulgaro",
      "Una tecnica di respirazione per stabilizzare il core sotto carico pesante"
    ],
    correctAnswer: 3,
    type: "technical"
  }
];

// 3 domande PRESTAZIONI (carichi e 1RM)
const PERFORMANCE_QUESTIONS = [
  {
    question: "Quanto pesi e quanto fai di squat per 5 ripetizioni con buona tecnica?",
    options: [
      "Meno del mio peso corporeo",
      "Uguale al mio peso corporeo",
      "1.5x il mio peso corporeo",
      "2x o più il mio peso corporeo"
    ],
    correctAnswer: -1,
    scores: [0, 1, 2, 3],
    type: "performance"
  },
  {
    question: "Quanto fai di panca piana per 5 ripetizioni con buona tecnica?",
    options: [
      "Meno di 60kg",
      "60-80kg",
      "80-100kg",
      "Oltre 100kg"
    ],
    correctAnswer: -1,
    scores: [0, 1, 2, 3],
    type: "performance"
  },
  {
    question: "Conosci i tuoi massimali (1RM) negli esercizi fondamentali?",
    options: [
      "No, non li ho mai testati",
      "Sì, ma sono stime approssimative",
      "Sì, li ho calcolati con formule affidabili",
      "Sì, li ho testati realmente e li aggiorno regolarmente"
    ],
    correctAnswer: -1,
    scores: [0, 1, 2, 3],
    type: "performance"
  }
];

const ALL_QUESTIONS = [...TECHNICAL_QUESTIONS, ...PERFORMANCE_QUESTIONS];

export default function QuizComponent() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = ALL_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ALL_QUESTIONS.length) * 100;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Calcola punteggi
    if (question.type === "technical") {
      if (selectedAnswer === question.correctAnswer) {
        setTechnicalScore(technicalScore + 1);
      }
    } else if (question.type === "performance") {
      const scores = (question as any).scores;
      setPerformanceScore(performanceScore + scores[selectedAnswer]);
    }

    if (currentQuestion < ALL_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const technicalPercentage = Math.round((technicalScore / TECHNICAL_QUESTIONS.length) * 100);
    const maxPerformanceScore = PERFORMANCE_QUESTIONS.reduce((sum, q: any) => sum + Math.max(...q.scores), 0);
    const performancePercentage = Math.round((performanceScore / maxPerformanceScore) * 100);

    // LOGICA DETERMINAZIONE LIVELLO
    let level: string;
    let levelLabel: string;
    let message: string;

    if (technicalPercentage < 50) {
      // Tecnica insufficiente
      if (performancePercentage >= 70) {
        // ✅ CASO SPECIALE: Carichi OTTIMI ma tecnica scarsa → INTERMEDIATE
        level = "intermediate";
        levelLabel = "Intermedio";
        message = "Hai una base di forza solida (carichi ottimi!), ma la tecnica necessita miglioramenti. Programma Intermedio con enfasi sulla forma corretta per evitare infortuni e massimizzare i risultati. Partirai all'85% dei carichi calcolati.";
      } else {
        // Carichi normali/bassi + tecnica scarsa → BEGINNER
        level = "beginner";
        levelLabel = "Principiante";
        message = "La tecnica è fondamentale per la sicurezza. Inizierai con un programma che enfatizza la tecnica corretta e costruisce la base di forza. Carichi al 70% per perfezionare i movimenti prima di progredire.";
      }
    } else if (performancePercentage < 40) {
      level = "intermediate";
      levelLabel = "Intermedio";
      message = "Ottima tecnica! Ora è il momento di costruire forza con un programma strutturato per aumentare i carichi in sicurezza.";
    } else {
      level = "advanced";
      levelLabel = "Avanzato";
      message = "Eccellente! Hai tecnica solida e buoni carichi. Sei pronto per un programma avanzato con periodizzazione e progressione ottimale.";
    }

    // Salva quiz e vai all'assessment
    const handleContinue = () => {
      try {
        // Calcola il finalScore totale
        const finalScore = technicalPercentage + performancePercentage;
        
        // 🧠 CALCOLO INTELLIGENTE DEL LEVEL
        // Usa il level già calcolato dalla logica sopra (che considera tecnica e prestazioni)
        // Non sovrascriverlo con una semplice somma!
        
        // Salva risultato quiz in localStorage
        const quizData = {
          score: finalScore,  // Score totale per compatibilità
          level: level,  // USA IL LEVEL CALCOLATO SOPRA (beginner/intermediate/advanced)
          technicalScore,
          performanceScore,
          technicalPercentage,
          performancePercentage,
          answers,
          completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('quiz_data', JSON.stringify(quizData));
        
        console.log('📊 QUIZ COMPLETED:', {
          totalScore: finalScore,
          calculatedLevel: level,
          technical: `${technicalScore}/${TECHNICAL_QUESTIONS.length} (${technicalPercentage}%)`,
          performance: `${performanceScore}/${maxPerformanceScore} (${performancePercentage}%)`
        });
        
        // Vai all'assessment
        navigate('/dashboard');
      } catch (error) {
        console.error("Error saving quiz:", error);
        alert("Errore nel salvataggio. Riprova.");
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center py-12">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                {technicalPercentage >= 50 ? (
                  <CheckCircle2 className="w-10 h-10 text-chart-3" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-chart-2" />
                )}
              </div>
              <CardTitle className="text-3xl">Valutazione Completata!</CardTitle>
              <CardDescription className="text-lg">
                Tecnica: {technicalScore}/{TECHNICAL_QUESTIONS.length} ({technicalPercentage}%) | 
                Prestazioni: {performanceScore}/{maxPerformanceScore} ({performancePercentage}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Livello determinato:</p>
                  <p className="text-2xl font-bold text-primary">{levelLabel}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground text-left">{message}</p>
                  </div>
                </div>

                {technicalPercentage < 50 && performancePercentage >= 60 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ <strong>Importante:</strong> Anche se hai buoni carichi, la tecnica insufficiente può portare a infortuni. 
                      Il programma Principiante ti aiuterà a perfezionare la forma prima di aumentare l'intensità.
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg" data-testid="button-continue">
                Continua al Test di Forza
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center py-12">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Domanda {currentQuestion + 1} di {ALL_QUESTIONS.length}</span>
            <span>{question.type === "technical" ? "Tecnica" : "Prestazioni"}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
            <CardDescription>
              {question.type === "technical" ? "Seleziona la risposta tecnicamente corretta" : "Seleziona l'opzione che ti rappresenta"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border transition-all hover-elevate ${
                  selectedAnswer === index 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
                data-testid={`button-option-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-primary bg-primary' : 'border-muted'
                  }`}>
                    {selectedAnswer === index && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </CardContent>

          <div className="p-6 pt-0">
            <Button 
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full"
              size="lg"
              data-testid="button-next-question"
            >
              {currentQuestion === ALL_QUESTIONS.length - 1 ? 'Vedi Risultato' : 'Prossima Domanda'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
