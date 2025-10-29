import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AssessmentExercise {
  name: string;
  rm10?: number;
  variant?: {
    level: number;
    name: string;
    maxReps: number;
  };
}

export default function Assessment() {
  const navigate = useNavigate();
  
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exercises, setExercises] = useState<AssessmentExercise[]>([]);
  const [test, setTest] = useState({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
    
    const parsedOnboarding = JSON.parse(storedOnboarding);
    const parsedQuiz = JSON.parse(storedQuiz);
    
    setOnboardingData(parsedOnboarding);
    setQuizData(parsedQuiz);
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

  const isGym = onboardingData.trainingLocation === 'gym';

  const gymExercises = [
    { name: 'Squat', unit: 'kg', description: 'Bilanciere dietro, scendi parallelo o sotto' },
    { name: 'Stacco da terra', unit: 'kg', description: 'Bilanciere a terra, schiena neutra' },
    { name: 'Panca piana', unit: 'kg', description: 'Bilanciere al petto, gomiti 45°' },
    { name: 'Trazioni/Lat machine', unit: 'kg', description: 'Se non fai trazioni, usa lat machine' },
    { name: 'Military press', unit: 'kg', description: 'Bilanciere sopra la testa, in piedi' },
    { name: 'Pulley basso', unit: 'kg', description: 'Tirata orizzontale, scapole retratte' }
  ];

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
      if (!test.rm10 || test.rm10 <= 0) return;
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
      if (!test.variant || !test.maxReps || test.maxReps <= 0) return;
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

  // ✅ CALCOLO LIVELLO FINALE CON FORMULA 70% + 30%
  const calculateFinalLevel = (practicalExercises: AssessmentExercise[]) => {
    console.log('[ASSESSMENT] 🧮 Calculating final level...');
    
    const bodyweight = onboardingData.personalInfo?.weight || 70;
    const height = onboardingData.personalInfo?.height || 175;
    const age = onboardingData.personalInfo?.age || 30;
    const gender = onboardingData.personalInfo?.gender || 'male';

    // ===== 1. PRACTICAL SCORE (70%) =====
    let practicalScore = 0;
    
    if (isGym) {
      // GYM: Forza relativa al peso corporeo
      const standards = {
        'Squat': gender === 'male' ? 1.5 : 1.0,
        'Stacco da terra': gender === 'male' ? 2.0 : 1.3,
        'Panca piana': gender === 'male' ? 1.0 : 0.6,
        'Trazioni/Lat machine': gender === 'male' ? 1.0 : 0.8,
        'Military press': gender === 'male' ? 0.75 : 0.5,
        'Pulley basso': gender === 'male' ? 0.9 : 0.7
      };
      
      let totalScore = 0;
      let count = 0;
      
      practicalExercises.forEach(ex => {
        if (ex.rm10 && ex.rm10 > 0) {
          const estimated1RM = ex.rm10 * 1.33;
          const relativeStrength = estimated1RM / bodyweight;
          const standard = standards[ex.name as keyof typeof standards] || 1.0;
          const percentOfStandard = (relativeStrength / standard) * 100;
          
          totalScore += Math.min(percentOfStandard, 150);
          count++;
          
          console.log(`[ASSESSMENT] 🏋️ ${ex.name}: ${ex.rm10}kg × 1.33 = ${estimated1RM.toFixed(0)}kg 1RM → ${relativeStrength.toFixed(2)}x BW (${percentOfStandard.toFixed(0)}% standard)`);
        }
      });
      
      practicalScore = count > 0 ? totalScore / count : 50;
      
    } else {
      // HOME: Media level normalizzata
      let totalLevel = 0;
      let count = 0;
      
      practicalExercises.forEach(ex => {
        if (ex.variant) {
          const level = ex.variant.level;
          const maxReps = ex.variant.maxReps;
          
          // Punteggio da 0-100 basato su level (1-5) e reps
          const levelScore = (level / 5) * 70; // Max 70 punti da level
          const repsScore = Math.min(maxReps / 20, 1) * 30; // Max 30 punti da reps
          const exerciseScore = levelScore + repsScore;
          
          totalLevel += exerciseScore;
          count++;
          
          console.log(`[ASSESSMENT] 🏠 ${ex.name}: level ${level}, ${maxReps} reps → ${exerciseScore.toFixed(0)}% score`);
        }
      });
      
      practicalScore = count > 0 ? totalLevel / count : 50;
    }
    
    console.log(`[ASSESSMENT] 💪 Practical Score (70%): ${practicalScore.toFixed(1)}%`);

    // ===== 2. PHYSICAL PARAMS SCORE (30%) =====
    const bmi = bodyweight / ((height / 100) ** 2);
    const bmiScore = bmi >= 18.5 && bmi <= 25 ? 100 : 
                     bmi < 18.5 ? Math.max(0, 50 + (bmi - 18.5) * 10) :
                     Math.max(0, 100 - (bmi - 25) * 5);

    const ageScore = age <= 30 ? 100 :
                     age <= 40 ? 90 :
                     age <= 50 ? 80 :
                     age <= 60 ? 70 : 60;

    const physicalScore = (bmiScore * 0.6 + ageScore * 0.4);
    
    console.log(`[ASSESSMENT] 📊 Physical Score (30%): BMI=${bmi.toFixed(1)} (${bmiScore.toFixed(0)}/100), Age=${age} (${ageScore}/100) → ${physicalScore.toFixed(1)}%`);

    // ===== 3. WEIGHTED FINAL SCORE =====
    const finalScore = (practicalScore * 0.7) + (physicalScore * 0.3);
    
    let finalLevel: string;
    if (finalScore >= 75) {
      finalLevel = 'advanced';
    } else if (finalScore >= 50) {
      finalLevel = 'intermediate';
    } else {
      finalLevel = 'beginner';
    }
    
    console.log(`[ASSESSMENT] ⚖️ FINAL SCORE: ${practicalScore.toFixed(1)}% × 0.7 + ${physicalScore.toFixed(1)}% × 0.3 = ${finalScore.toFixed(1)}%`);
    console.log(`[ASSESSMENT] 🎯 FINAL LEVEL: ${finalLevel.toUpperCase()}`);
    
    return {
      level: finalLevel,
      finalScore: finalScore.toFixed(1),
      practicalScore: practicalScore.toFixed(1),
      physicalScore: physicalScore.toFixed(1),
      breakdown: {
        bmi: bmi.toFixed(1),
        bmiScore: bmiScore.toFixed(0),
        age,
        ageScore
      }
    };
  };

  const complete = async (final: AssessmentExercise[]) => {
    setSaving(true);
    
    try {
      // ✅ CALCOLA LIVELLO FINALE
      const levelResult = calculateFinalLevel(final);
      
      const assessmentData = { 
        exercises: final, 
        completedAt: new Date().toISOString(), 
        completed: true,
        location: onboardingData.trainingLocation,
        frequency: onboardingData.activityLevel?.weeklyFrequency,
        duration: onboardingData.activityLevel?.sessionDuration,
        goal: onboardingData.goal,
        level: levelResult.level, // ✅ LIVELLO CORRETTO
        finalScore: levelResult.finalScore,
        practicalScore: levelResult.practicalScore,
        physicalScore: levelResult.physicalScore,
        breakdown: levelResult.breakdown,
        sport: onboardingData.sport || '',
        sportRole: onboardingData.sportRole || '',
        painScreening: onboardingData.painScreening,
        personalInfo: onboardingData.personalInfo,
        quizScore: quizData.score || 0
      };
      
      localStorage.setItem('assessment_data', JSON.stringify(assessmentData));

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: true,
            assessment_completed: true,
            training_frequency: onboardingData.activityLevel?.weeklyFrequency,
            session_duration: onboardingData.activityLevel?.sessionDuration,
            training_goal: onboardingData.goal,
            training_level: levelResult.level, // ✅ LIVELLO CORRETTO
            training_location: onboardingData.trainingLocation,
            sport: onboardingData.sport || null,
            sport_role: onboardingData.sportRole || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            assessment_type: isGym ? 'gym' : 'home',
            exercises: final,
            level: levelResult.level, // ✅ LIVELLO CORRETTO
            final_score: parseFloat(levelResult.finalScore),
            practical_score: parseFloat(levelResult.practicalScore),
            physical_score: parseFloat(levelResult.physicalScore),
            completed: true,
            completed_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error in complete:', error);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold mb-2">Calcolo livello e salvataggio...</p>
          <p className="text-slate-400 text-sm">Stiamo creando il tuo programma personalizzato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
            <span>Location: <span className="text-emerald-400 font-semibold">{isGym ? '🏋️ Palestra' : '🏠 Casa'}</span></span>
            <span>Quiz: <span className="text-emerald-400 font-semibold">{quizData.score}%</span></span>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{current.name}</h2>
            <p className="text-slate-300">
              {isGym ? current.description : 'Scegli la variante più difficile che riesci a completare'}
            </p>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-200">
              💡 {isGym 
                ? 'Fai 2-3 tentativi progressivi. Il 10RM è il peso massimo con cui riesci a fare ESATTAMENTE 10 ripetizioni con tecnica perfetta.' 
                : 'Testa le varianti in ordine crescente. Registra la più difficile che riesci a fare con almeno 3-5 ripetizioni pulite.'}
            </p>
          </div>
          
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
                    <p className="text-sm text-slate-400 mb-1">📊 1RM Stimato:</p>
                    <div className="text-center mt-2">
                      <p className="text-3xl font-bold text-emerald-400">
                        {Math.round(test.rm10 * 1.33)}kg
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Massimale teorico calcolato</p>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={submit} 
                disabled={!test.rm10 || test.rm10 <= 0} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment ✓'}
              </button>
            </div>
          ) : (
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
                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600 animate-in fade-in duration-300">
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
                disabled={!test.variant || !test.maxReps || test.maxReps <= 0} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentIdx < total - 1 ? 'Prossimo Esercizio →' : 'Completa Assessment ✓'}
              </button>
            </div>
          )}
        </div>
        
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
