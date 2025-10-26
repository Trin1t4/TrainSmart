import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AssessmentExercise } from '../types/onboarding.types';

export default function Assessment() {
  const navigate = useNavigate();
  
  // Carica dati da localStorage
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Assessment state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exercises, setExercises] = useState<AssessmentExercise[]>([]);
  const [test, setTest] = useState({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carica dati salvati
    const storedOnboarding = localStorage.getItem('onboarding_data');
    const storedQuiz = localStorage.getItem('quiz_data');
    
    if (!storedOnboarding) {
      navigate('/onboarding');
      return;
    }
    
    if (!storedQuiz) {
      navigate('/quiz');
      return;
    }
    
    setOnboardingData(JSON.parse(storedOnboarding));
    setQuizData(JSON.parse(storedQuiz));
    setLoading(false);
  }, [navigate]);

  if (loading || !onboardingData || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Caricamento assessment...</p>
        </div>
      </div>
    );
  }

  const isGym = onboardingData.location === 'gym';
  const userLevel = quizData.level || 'beginner';

  // GYM: 6 ESERCIZI CON STACCO E PULLEY
  const gymExercises = [
    { name: 'Squat', unit: 'kg', description: 'Bilanciere dietro, scendi parallelo o sotto' },
    { name: 'Stacco da terra', unit: 'kg', description: 'Bilanciere a terra, schiena neutra' },
    { name: 'Panca piana', unit: 'kg', description: 'Bilanciere al petto, gomiti 45°' },
    { name: 'Trazioni/Lat machine', unit: 'kg', description: 'Se non fai trazioni, usa lat machine' },
    { name: 'Military press', unit: 'kg', description: 'Bilanciere sopra la testa, in piedi' },
    { name: 'Pulley basso', unit: 'kg', description: 'Tirata orizzontale, scapole retratte' }
  ];

  // CASA: 5 ESERCIZI CON VARIANTI
  const homeExercises = [
    { 
      name: 'Squat', 
      variants: [
        { level: 1, name: 'Assistito', desc: 'Con sostegno (sedia/muro)' }, 
        { level: 2, name: 'Completo', desc: 'Peso corporeo, parallelo' }, 
        { level: 3, name: 'Jump squat', desc: 'Con salto esplosivo' }, 
        { level: 4, name: 'Pistol assistito', desc: 'Una gamba con sostegno' }, 
        { level: 5, name: 'Pistol completo', desc: 'Una gamba, libero' }
      ]
    },
    { 
      name: 'Push-up', 
      variants: [
        { level: 1, name: 'Su ginocchia', desc: 'Facilitato, petto a terra' }, 
        { level: 2, name: 'Standard', desc: 'Classico, corpo dritto' }, 
        { level: 3, name: 'Mani strette', desc: 'Diamond, focus tricipiti' }, 
        { level: 4, name: 'Archer', desc: 'Peso spostato su un braccio' }, 
        { level: 5, name: 'One-arm', desc: 'Un braccio solo' }
      ]
    },
    { 
      name: 'Trazioni', 
      variants: [
        { level: 1, name: 'Australian row', desc: 'Corpo inclinato, barra bassa' }, 
        { level: 2, name: 'Negative', desc: 'Solo fase eccentrica' }, 
        { level: 3, name: 'Assistite', desc: 'Con banda elastica' }, 
        { level: 4, name: 'Complete', desc: 'Full ROM, petto alla sbarra' }, 
        { level: 5, name: 'Zavorrate', desc: 'Con peso aggiunto' }
      ]
    },
    { 
      name: 'Spalle vertical push', 
      variants: [
        { level: 1, name: 'Plank to pike', desc: 'Mobilità spalle' }, 
        { level: 2, name: 'Pike push-up', desc: 'Corpo a V invertita' }, 
        { level: 3, name: 'Pike elevato', desc: 'Piedi su rialzo' }, 
        { level: 4, name: 'Handstand assistito', desc: 'In verticale al muro' }, 
        { level: 5, name: 'Handstand push-up', desc: 'Piegamenti in verticale' }
      ]
    },
    { 
      name: 'Gambe unilaterali', 
      variants: [
        { level: 1, name: 'Affondi', desc: 'Base, avanti-indietro' }, 
        { level: 2, name: 'Squat bulgaro', desc: 'Piede posteriore elevato' }, 
        { level: 3, name: 'Single leg deadlift', desc: 'Una gamba, equilibrio' }, 
        { level: 4, name: 'Jump lunge', desc: 'Affondi con salto' }, 
        { level: 5, name: 'Pistol squat', desc: 'Squat completo una gamba' }
      ]
    }
  ];

  const list = isGym ? gymExercises : homeExercises;
  const current = list[currentIdx];
  const total = list.length;
  const progress = ((currentIdx + 1) / total) * 100;

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
      // Prepara dati completi assessment
      const assessmentData = { 
        exercises: final, 
        completedAt: new Date().toISOString(), 
        completed: true,
        location: onboardingData.location,
        frequency: onboardingData.frequency,
        duration: onboardingData.duration,
        goal: onboardingData.goal,
        level: userLevel,
        sport: onboardingData.sport,
        sportRole: onboardingData.sportRole,
        painScreening: onboardingData.painScreening,
        quizScores: {
          technical: quizData.technicalScore,
          performance: quizData.performanceScore
        }
      };
      
      // Salva in localStorage
      localStorage.setItem('assessment_data', JSON.stringify(assessmentData));

      // Salva su Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: true,
            assessment_completed: true,
            training_frequency: onboardingData.frequency,
            session_duration: onboardingData.duration,
            training_goal: onboardingData.goal,
            training_level: userLevel,
            training_location: onboardingData.location,
            sport: onboardingData.sport,
            sport_role: onboardingData.sportRole,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Insert assessment
        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            assessment_type: isGym ? 'gym' : 'home',
            exercises: final,
            level: userLevel,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (assessmentError) {
          console.error('Error saving assessment:', assessmentError);
        }

        // Insert quiz results
        const { error: quizError } = await supabase
          .from('quiz_results')
          .insert({
            user_id: user.id,
            technical_score: quizData.technicalScore,
            performance_score: quizData.performanceScore,
            level: userLevel,
            answers: quizData.answers,
            completed_at: new Date().toISOString()
          });

        if (quizError) {
          console.error('Error saving quiz:', quizError);
        }
      }
    } catch (error) {
      console.error('Error in complete:', error);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  // Loading durante salvataggio
  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold mb-2">Salvataggio assessment...</p>
          <p className="text-slate-400 text-sm">Stiamo creando il tuo programma personalizzato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header con progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">💪 Test Fisici</h1>
            <span className="text-slate-300 font-medium">{currentIdx + 1} / {total}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>Livello: <span className="text-emerald-400 font-semibold capitalize">{userLevel}</span></span>
            <span>Location: <span className="text-emerald-400 font-semibold">{isGym ? '🏋️ Palestra' : '🏠 Casa'}</span></span>
          </div>
        </div>
        
        {/* Card principale */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{current.name}</h2>
            <p className="text-slate-300">
              {isGym ? current.description : 'Scegli la variante più difficile che riesci a completare'}
            </p>
          </div>
          
          {/* Info box */}
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-200">
              💡 {isGym 
                ? 'Fai 2-3 tentativi progressivi. Il 10RM è il peso massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni con tecnica perfetta.' 
                : 'Testa le varianti in ordine crescente. Registra la più difficile che riesci a fare con almeno 3-5 ripetizioni pulite.'}
            </p>
          </div>
          
          {/* Form GYM */}
          {isGym ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Inserisci il tuo 10RM (peso massimo per 10 reps)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={test.rm10 || ''} 
                    onChange={e => setTest({ ...test, rm10: +e.target.value })} 
                    className="w-full bg-slate-700/80 border-2 border-slate-600 text-white rounded-xl px-6 py-4 text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
                    placeholder="0" 
                    min="0" 
                    step="2.5" 
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">kg</span>
                </div>
                {test.rm10 > 0 && (
                  <div className="mt-4 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-slate-400 mb-1">📊 Stime basate sul tuo 10RM:</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-slate-500">1RM stimato</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(test.rm10 * 1.33)}kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Peso partenza (5 reps, RIR 2)</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {Math.round((test.rm10 * 1.33 * 0.83) / 2.5) * 2.5}kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={submit} 
                disabled={!test.rm10} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment ✓'}
              </button>
            </div>
          ) : (
            /* Form CASA */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Seleziona la variante più difficile:</label>
                <div className="space-y-2">
                  {current.variants?.map(v => (
                    <button 
                      key={v.level} 
                      type="button" 
                      onClick={() => setTest({ ...test, variant: v.name, variantLevel: v.level })} 
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                        test.variant === v.name 
                          ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-lg ${
                          test.variant === v.name ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
                        }`}>
                          {v.level}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1 text-base">{v.name}</div>
                          <div className="text-sm text-slate-400">{v.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {test.variant && (
                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Quante ripetizioni pulite riesci a fare?
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={test.maxReps || ''} 
                      onChange={e => setTest({ ...test, maxReps: +e.target.value })} 
                      className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-xl px-6 py-4 text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
                      placeholder="0" 
                      min="1" 
                      max="50" 
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">reps</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={submit} 
                disabled={!test.variant || !test.maxReps} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment ✓'}
              </button>
            </div>
          )}
        </div>
        
        {/* Recap esercizi completati */}
        {exercises.length > 0 && (
          <div className="mt-6 bg-slate-800/30 backdrop-blur rounded-xl p-5 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="text-lg">✅</span> Esercizi completati:
            </h3>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-slate-700/50 rounded-lg px-4 py-3">
                  <span className="text-slate-300 font-medium">{ex.name}</span>
                  <span className="font-bold text-emerald-400">
                    {ex.rm10 ? `${ex.rm10}kg × 10` : `${ex.variant?.name} × ${ex.variant?.maxReps}`}
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
