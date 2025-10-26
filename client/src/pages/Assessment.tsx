import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentExercise } from '../types/onboarding.types';
import { supabase } from '../lib/supabase';

// Helper function to shuffle array deterministically
const shuffleArray = <T,>(array: T[], seed: number): T[] => {
  const arr = [...array];
  let currentSeed = seed;
  
  for (let i = arr.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 7 domande TECNICHE (tecnica esercizi) - con "Non lo so"
const TECHNICAL_QUESTIONS = [
  {
    question: "Durante lo squat, dove deve passare la linea del bilanciere vista di lato?",
    options: [
      "Dietro i talloni",
      "Davanti alle punte dei piedi",
      "Sul centro del piede, in linea con le caviglie",
      "Non importa, basta scendere parallelo",
      "Non lo so"
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
      "Attaccato al corpo o a pochi millimetri di distanza",
      "Non lo so"
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
      "Elevarsi completamente verso l'alto",
      "Non lo so"
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
      "Leggermente diagonale verso i piedi in discesa, verso la testa in salita",
      "Non lo so"
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
      "Sopra la testa",
      "Non lo so"
    ],
    correctAnswer: 2,
    type: "technical"
  },
  {
    question: "Durante il rematore con bilanciere, qual è l'angolo corretto del busto?",
    options: [
      "Dipende dall'umore",
      "Completamente verticale (90°)",
      "Quasi orizzontale al pavimento (10-20° sopra)",
      "Circa 45° rispetto al pavimento",
      "Non lo so"
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
      "Una tecnica di respirazione per stabilizzare il core sotto carico pesante",
      "Non lo so"
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

// Sports and roles
const SPORTS_OPTIONS = [
  { value: 'none', label: 'Nessuno', roles: [] },
  { value: 'calcio', label: '⚽ Calcio', roles: ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] },
  { value: 'basket', label: '🏀 Basket', roles: ['Playmaker', 'Guardia', 'Ala', 'Centro'] },
  { value: 'pallavolo', label: '🏐 Pallavolo', roles: ['Alzatore', 'Opposto', 'Centrale', 'Libero', 'Schiacciatore'] },
  { value: 'rugby', label: '🏉 Rugby', roles: ['Trequarti', 'Mediano', 'Pilone', 'Tallonatore', 'Seconda Linea'] },
  { value: 'tennis', label: '🎾 Tennis', roles: ['Singolo', 'Doppio'] },
  { value: 'corsa', label: '🏃 Corsa', roles: ['Velocità (100-400m)', 'Mezzofondo (800-3000m)', 'Fondo (5km+)'] },
  { value: 'nuoto', label: '🏊 Nuoto', roles: ['Stile Libero', 'Rana', 'Dorso', 'Farfalla', 'Misti'] },
  { value: 'ciclismo', label: '🚴 Ciclismo', roles: ['Strada', 'MTB', 'Pista'] },
  { value: 'crossfit', label: '💪 CrossFit', roles: [] },
  { value: 'powerlifting', label: '🏋️ Powerlifting', roles: [] },
  { value: 'altro', label: '🎯 Altro', roles: [] }
];

export default function Assessment() {
  const navigate = useNavigate();
  
  // STEP 0: Setup data collection
  const [setupComplete, setSetupComplete] = useState(false);
  const [location, setLocation] = useState<'gym' | 'home'>('gym');
  const [frequency, setFrequency] = useState(3);
  const [duration, setDuration] = useState(45);
  const [goal, setGoal] = useState('ipertrofia');
  const [sport, setSport] = useState('none');
  const [role, setRole] = useState('');
  
  // Quiz - with shuffled options
  const [quizComplete, setQuizComplete] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [calculatedLevel, setCalculatedLevel] = useState('');
  
  // Shuffle questions once (deterministic)
  const shuffledTechnicalQuestions = useMemo(() => {
    return TECHNICAL_QUESTIONS.map((q, idx) => {
      const shuffled = shuffleArray(q.options.map((opt, i) => ({ opt, originalIdx: i })), idx + 1);
      const newCorrectAnswer = shuffled.findIndex(item => item.originalIdx === q.correctAnswer);
      return {
        ...q,
        options: shuffled.map(item => item.opt),
        correctAnswer: newCorrectAnswer
      };
    });
  }, []);

  const ALL_QUIZ_QUESTIONS = [...shuffledTechnicalQuestions, ...PERFORMANCE_QUESTIONS];
  
  // Physical tests
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exercises, setExercises] = useState<AssessmentExercise[]>([]);
  const [test, setTest] = useState({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
  const [saving, setSaving] = useState(false);

  // Load onboarding data
  const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
  const { personalInfo } = onboardingData;
  const age = personalInfo?.age || 0;
  const weight = personalInfo?.weight || 0;
  const height = personalInfo?.height || 0;
  const gender = personalInfo?.gender || 'M';
  const bmi = personalInfo?.bmi || 0;
  const photoUrl = onboardingData.photoUrl || null;

  const isGym = location === 'gym';

  // Goals options
  const goalOptions = [
    { value: 'forza', label: '💪 Forza', desc: 'Aumentare forza massimale' },
    { value: 'ipertrofia', label: '🏋️ Ipertrofia', desc: 'Crescita muscolare' },
    { value: 'tonificazione', label: '✨ Tonificazione', desc: 'Definizione muscolare' },
    { value: 'dimagrimento', label: '🔥 Dimagrimento', desc: 'Perdita peso/grasso' },
    { value: 'benessere', label: '🧘 Benessere', desc: 'Salute generale' },
    { value: 'resistenza', label: '🏃 Resistenza', desc: 'Capacità aerobica' },
    { value: 'gravidanza', label: '🤰 Gravidanza', desc: 'Pre/post parto' },
    { value: 'disabilita', label: '♿ Disabilità', desc: 'Adattamenti specifici' }
  ];

  const durationOptions = [15, 20, 30, 45, 60, 90];

  const selectedSport = SPORTS_OPTIONS.find(s => s.value === sport);
  const sportRoles = selectedSport?.roles || [];

  const gymExercises = [
    { name: 'Squat', unit: 'kg' },
    { name: 'Panca piana', unit: 'kg' },
    { name: 'Trazioni/Lat', unit: 'kg' },
    { name: 'Military press', unit: 'kg' },
    { name: 'Pulley', unit: 'kg' }
  ];

  const homeExercises = [
    { name: 'Squat', variants: [
      { level: 1, name: 'Assistito', desc: 'Con sostegno' }, 
      { level: 2, name: 'Completo', desc: 'Peso corpo' }, 
      { level: 3, name: 'Jump squat', desc: 'Con salto' }, 
      { level: 4, name: 'Pistol assistito', desc: 'Una gamba' }, 
      { level: 5, name: 'Pistol completo', desc: 'Libero' }
    ]},
    { name: 'Push-up', variants: [
      { level: 1, name: 'Su ginocchia', desc: 'Facilitato' }, 
      { level: 2, name: 'Standard', desc: 'Classico' }, 
      { level: 3, name: 'Mani strette', desc: 'Tricipiti' }, 
      { level: 4, name: 'Archer', desc: 'Un braccio più' }, 
      { level: 5, name: 'One-arm', desc: 'Un braccio' }
    ]},
    { name: 'Trazioni', variants: [
      { level: 1, name: 'Australian', desc: 'Rematore' }, 
      { level: 2, name: 'Negative', desc: 'Eccentrica' }, 
      { level: 3, name: 'Assistite', desc: 'Con banda' }, 
      { level: 4, name: 'Complete', desc: 'Full ROM' }, 
      { level: 5, name: 'Zavorrate', desc: 'Con peso' }
    ]},
    { name: 'Spalle', variants: [
      { level: 1, name: 'Plank to pike', desc: 'Mobilità' }, 
      { level: 2, name: 'Pike push-up', desc: 'A V' }, 
      { level: 3, name: 'Pike elevato', desc: 'Piedi alti' }, 
      { level: 4, name: 'Handstand assistito', desc: 'Al muro' }, 
      { level: 5, name: 'Handstand', desc: 'Libera' }
    ]},
    { name: 'Gambe uni', variants: [
      { level: 1, name: 'Affondi', desc: 'Base' }, 
      { level: 2, name: 'Squat bulgaro', desc: 'Piede dietro' }, 
      { level: 3, name: 'Single leg DL', desc: 'Una gamba' }, 
      { level: 4, name: 'Jump lunge', desc: 'Con salto' }, 
      { level: 5, name: 'Pistol squat', desc: 'Una gamba' }
    ]}
  ];

  const list = isGym ? gymExercises : homeExercises;
  const current = list[currentIdx];
  const total = list.length;

  const completeSetup = () => {
    setSetupComplete(true);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedQuizAnswer(index);
  };

  const handleNextQuiz = () => {
    if (selectedQuizAnswer === null) return;

    const question = ALL_QUIZ_QUESTIONS[currentQuizQuestion];
    const newAnswers = [...quizAnswers, selectedQuizAnswer];
    setQuizAnswers(newAnswers);

    // Calculate scores
    let newTechnicalScore = technicalScore;
    let newPerformanceScore = performanceScore;

    if (question.type === "technical") {
      if (selectedQuizAnswer === question.correctAnswer) {
        newTechnicalScore = technicalScore + 1;
        setTechnicalScore(newTechnicalScore);
      }
      // "Non lo so" conta come sbagliata (non aggiunge punti)
    } else if (question.type === "performance") {
      const scores = (question as any).scores;
      newPerformanceScore = performanceScore + scores[selectedQuizAnswer];
      setPerformanceScore(newPerformanceScore);
    }

    if (currentQuizQuestion < ALL_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
      setSelectedQuizAnswer(null);
    } else {
      // Quiz complete - calculate level
      const technicalPercentage = Math.round((newTechnicalScore / shuffledTechnicalQuestions.length) * 100);
      const maxPerformanceScore = PERFORMANCE_QUESTIONS.reduce((sum, q: any) => sum + Math.max(...q.scores), 0);
      const performancePercentage = Math.round((newPerformanceScore / maxPerformanceScore) * 100);

      // LOGICA DETERMINAZIONE LIVELLO (dal quiz originale)
      let level: string;
      if (technicalPercentage < 50) {
        level = "beginner";
      } else if (performancePercentage < 40) {
        level = "intermediate";
      } else {
        level = "advanced";
      }

      setCalculatedLevel(level);

      // Save all data to localStorage
      const updatedOnboarding = {
        ...onboardingData,
        trainingLocation: location,
        frequency,
        duration,
        goal,
        sport,
        role,
        level,
        quizAnswers: newAnswers,
        technicalScore: newTechnicalScore,
        performanceScore: newPerformanceScore
      };
      localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
      
      setQuizComplete(true);
    }
  };

  const submit = () => {
    if (isGym) {
      if (!test.rm10) return;
      const ex: AssessmentExercise = { name: current.name, rm10: test.rm10 };
      const updated = [...exercises, ex];
      setExercises(updated);
      if (currentIdx < total - 1) {
        setCurrentIdx(currentIdx + 1);
        setTest({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
      } else {
        complete(updated);
      }
    } else {
      if (!test.variant || !test.maxReps) return;
      const ex: AssessmentExercise = { 
        name: current.name, 
        variant: { 
          level: test.variantLevel, 
          name: test.variant, 
          maxReps: test.maxReps 
        } 
      };
      const updated = [...exercises, ex];
      setExercises(updated);
      if (currentIdx < total - 1) {
        setCurrentIdx(currentIdx + 1);
        setTest({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
      } else {
        complete(updated);
      }
    }
  };

  const complete = async (final: AssessmentExercise[]) => {
    setSaving(true);
    
    try {
      const completeOnboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      
      const assessmentData = { 
        exercises: final, 
        completedAt: new Date().toISOString(), 
        completed: true,
        frequency: completeOnboardingData.frequency,
        duration: completeOnboardingData.duration,
        goal: completeOnboardingData.goal,
        level: completeOnboardingData.level,
        location: completeOnboardingData.trainingLocation,
        sport: completeOnboardingData.sport,
        role: completeOnboardingData.role
      };
      localStorage.setItem('assessment_data', JSON.stringify(assessmentData));

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: true,
            training_frequency: completeOnboardingData.frequency,
            session_duration: completeOnboardingData.duration,
            training_goal: completeOnboardingData.goal,
            training_level: completeOnboardingData.level,
            training_location: completeOnboardingData.trainingLocation,
            sport: completeOnboardingData.sport,
            sport_role: completeOnboardingData.role,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            assessment_type: isGym ? 'gym' : 'home',
            exercises: final,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (assessmentError) {
          console.error('Error saving assessment:', assessmentError);
        }
      }
    } catch (error) {
      console.error('Error in complete:', error);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  // STEP 0: Setup Screen
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">📋 Setup Allenamento</h1>
            <p className="text-slate-300">Configura il tuo programma personalizzato</p>
          </div>

          <div className="space-y-6">
            {/* Biometric Data Recap */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">👤 Dati Biometrici</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Genere</p>
                  <p className="text-2xl font-bold text-white">{gender === 'M' ? '👨 Uomo' : '👩 Donna'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Età</p>
                  <p className="text-2xl font-bold text-white">{age} anni</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Altezza</p>
                  <p className="text-2xl font-bold text-white">{height} cm</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Peso</p>
                  <p className="text-2xl font-bold text-white">{weight} kg</p>
                </div>
              </div>
              {bmi > 0 && (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">BMI</span>
                    <span className="text-2xl font-bold text-emerald-400">{bmi}</span>
                  </div>
                </div>
              )}
              {photoUrl && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-2">📸 Foto di riferimento caricata</p>
                </div>
              )}
            </div>

            {/* Location Selection */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">📍 Dove ti alleni?</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLocation('gym')}
                  className={`p-6 rounded-lg border-2 transition ${
                    location === 'gym'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-4xl mb-2">🏋️</div>
                  <div className="font-bold text-lg">Palestra</div>
                  <div className="text-sm text-slate-400 mt-1">Attrezzatura completa</div>
                </button>
                <button
                  onClick={() => setLocation('home')}
                  className={`p-6 rounded-lg border-2 transition ${
                    location === 'home'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-4xl mb-2">🏠</div>
                  <div className="font-bold text-lg">Casa</div>
                  <div className="text-sm text-slate-400 mt-1">Corpo libero / minimo</div>
                </button>
              </div>
            </div>

            {/* Training Frequency */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">📅 Frequenza Settimanale</h2>
              <p className="text-sm text-slate-400 mb-4">Quanti giorni a settimana puoi allenarti?</p>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <button
                    key={day}
                    onClick={() => setFrequency(day)}
                    className={`aspect-square rounded-lg font-bold text-lg transition ${
                      frequency === day 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-center text-emerald-400 font-semibold mt-3">
                {frequency} {frequency === 1 ? 'giorno' : 'giorni'} / settimana
              </p>
            </div>

            {/* Session Duration */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">⏱️ Durata Allenamento</h2>
              <p className="text-sm text-slate-400 mb-4">Quanto tempo hai per sessione?</p>
              <div className="grid grid-cols-3 gap-3">
                {durationOptions.map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`py-4 rounded-lg font-bold transition ${
                      duration === mins
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              <p className="text-center text-emerald-400 font-semibold mt-3">
                Sessioni da {duration} minuti
              </p>
            </div>

            {/* Goal Selection */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">🎯 Obiettivo Principale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      goal === opt.value
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{opt.label}</div>
                    <div className="text-sm text-slate-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sport Selection */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">⚽ Prestazioni Sportive</h2>
              <p className="text-sm text-slate-400 mb-4">Pratichi uno sport specifico? (opzionale)</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => {
                      setSport(e.target.value);
                      setRole(''); // Reset role when sport changes
                    }}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    {SPORTS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {sportRoles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ruolo/Posizione</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    >
                      <option value="">Seleziona ruolo...</option>
                      {sportRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {sport !== 'none' && (
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                    <p className="text-sm text-blue-200">
                      ℹ️ Il programma sarà ottimizzato per le esigenze del tuo sport
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={completeSetup}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              Continua al Quiz Tecnico →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (!quizComplete) {
    const quizQuestion = ALL_QUIZ_QUESTIONS[currentQuizQuestion];
    const quizProgress = ((currentQuizQuestion + 1) / ALL_QUIZ_QUESTIONS.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all" style={{ width: `${quizProgress}%` }} />
            </div>
            <div className="flex justify-between text-sm text-slate-300">
              <span>Domanda {currentQuizQuestion + 1} di {ALL_QUIZ_QUESTIONS.length}</span>
              <span className="font-semibold">{quizQuestion.type === "technical" ? "🎯 Tecnica" : "💪 Prestazioni"}</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">{quizQuestion.question}</h2>
              <p className="text-sm text-slate-400">
                {quizQuestion.type === "technical" ? "Seleziona la risposta tecnicamente corretta (o 'Non lo so')" : "Seleziona l'opzione che ti rappresenta"}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {quizQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedQuizAnswer === index 
                      ? 'border-emerald-500 bg-emerald-500/20 text-white' 
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedQuizAnswer === index ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'
                    }`}>
                      {selectedQuizAnswer === index && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={option === "Non lo so" ? "italic text-slate-400" : ""}>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleNextQuiz}
              disabled={selectedQuizAnswer === null}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              {currentQuizQuestion === ALL_QUIZ_QUESTIONS.length - 1 ? 'Inizia Test Fisici →' : 'Prossima Domanda →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Salvataggio assessment...</p>
        </div>
      </div>
    );
  }

  // Physical Tests
  const progress = ((currentIdx + 1) / total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">💪 Test Fisici</h1>
            <span className="text-slate-300">{currentIdx + 1} / {total}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{current.name}</h2>
            <p className="text-slate-300">
              {isGym ? 'Trova il tuo 10RM (peso massimo per 10 ripetizioni pulite)' : 'Scegli la variante più difficile che riesci a fare'}
            </p>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-200">
              💡 {isGym ? 'Fai 2-3 tentativi. Conta solo le ripetizioni perfette' : 'Testa le varianti in ordine. Registra la più difficile che riesci'}
            </p>
          </div>
          
          {isGym ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Peso 10RM (kg)</label>
                <input 
                  type="number" 
                  value={test.rm10 || ''} 
                  onChange={e => setTest({ ...test, rm10: +e.target.value })} 
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
                  placeholder="0" 
                  min="0" 
                  step="2.5" 
                />
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Peso partenza consigliato: ~{test.rm10 ? (() => {
                    const oneRM = test.rm10 * (36 / 27);
                    const weight = oneRM * (30 / 36);
                    return Math.round(weight / 2.5) * 2.5;
                  })() : 0}kg (5 reps, RIR 2)
                </p>
              </div>
              <button 
                onClick={submit} 
                disabled={!test.rm10} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment →'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Scegli la variante più difficile</label>
                <div className="space-y-2">
                  {current.variants.map(v => (
                    <button 
                      key={v.level} 
                      type="button" 
                      onClick={() => setTest({ ...test, variant: v.name, variantLevel: v.level })} 
                      className={`w-full p-4 rounded-lg border-2 text-left transition ${test.variant === v.name ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${test.variant === v.name ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                          {v.level}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{v.name}</div>
                          <div className="text-sm text-slate-400">{v.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {test.variant && (
                <div className="bg-slate-700/50 rounded-lg p-5">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Quante ripetizioni pulite riesci a fare?</label>
                  <input 
                    type="number" 
                    value={test.maxReps || ''} 
                    onChange={e => setTest({ ...test, maxReps: +e.target.value })} 
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
                    placeholder="0" 
                    min="1" 
                    max="50" 
                  />
                </div>
              )}
              
              <button 
                onClick={submit} 
                disabled={!test.variant || !test.maxReps} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment →'}
              </button>
            </div>
          )}
        </div>
        
        {exercises.length > 0 && (
          <div className="mt-6 bg-slate-800/30 rounded-xl p-5 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">✅ Esercizi completati:</h3>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{ex.name}</span>
                  <span className="font-semibold text-emerald-400">
                    {ex.rm10 ? `${ex.rm10}kg` : `${ex.variant?.name} × ${ex.variant?.maxReps}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
