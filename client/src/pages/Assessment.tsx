import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentExercise } from '../types/onboarding.types';
import { supabase } from '../lib/supabase';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exercises, setExercises] = useState<AssessmentExercise[]>([]);
  const [test, setTest] = useState({ variant: '', variantLevel: 1, maxReps: 0, rm10: 0 });
  const [saving, setSaving] = useState(false);

  const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
  const isGym = onboardingData.trainingLocation === 'gym';

  const gymExercises = [
    { name: 'Squat', unit: 'kg' },
    { name: 'Panca piana', unit: 'kg' },
    { name: 'Trazioni/Lat', unit: 'kg' },
    { name: 'Military press', unit: 'kg' },
    { name: 'Pulley', unit: 'kg' }
  ];

  const homeExercises = [
    { name: 'Squat', variants: [{ level: 1, name: 'Assistito', desc: 'Con sostegno' }, { level: 2, name: 'Completo', desc: 'Peso corpo' }, { level: 3, name: 'Jump squat', desc: 'Con salto' }, { level: 4, name: 'Pistol assistito', desc: 'Una gamba' }, { level: 5, name: 'Pistol completo', desc: 'Libero' }] },
    { name: 'Push-up', variants: [{ level: 1, name: 'Su ginocchia', desc: 'Facilitato' }, { level: 2, name: 'Standard', desc: 'Classico' }, { level: 3, name: 'Mani strette', desc: 'Tricipiti' }, { level: 4, name: 'Archer', desc: 'Un braccio più' }, { level: 5, name: 'One-arm', desc: 'Un braccio' }] },
    { name: 'Trazioni', variants: [{ level: 1, name: 'Australian', desc: 'Rematore' }, { level: 2, name: 'Negative', desc: 'Eccentrica' }, { level: 3, name: 'Assistite', desc: 'Con banda' }, { level: 4, name: 'Complete', desc: 'Full ROM' }, { level: 5, name: 'Zavorrate', desc: 'Con peso' }] },
    { name: 'Spalle', variants: [{ level: 1, name: 'Plank to pike', desc: 'Mobilità' }, { level: 2, name: 'Pike push-up', desc: 'A V' }, { level: 3, name: 'Pike elevato', desc: 'Piedi alti' }, { level: 4, name: 'Handstand assistito', desc: 'Al muro' }, { level: 5, name: 'Handstand', desc: 'Libera' }] },
    { name: 'Gambe uni', variants: [{ level: 1, name: 'Affondi', desc: 'Base' }, { level: 2, name: 'Squat bulgaro', desc: 'Piede dietro' }, { level: 3, name: 'Single leg DL', desc: 'Una gamba' }, { level: 4, name: 'Jump lunge', desc: 'Con salto' }, { level: 5, name: 'Pistol squat', desc: 'Una gamba' }] }
  ];

  const list = isGym ? gymExercises : homeExercises;
  const current = list[currentIdx];
  const total = list.length;

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
      const ex: AssessmentExercise = { name: current.name, variant: { level: test.variantLevel, name: test.variant, maxReps: test.maxReps } };
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
      // Salva in localStorage (fallback)
      const assessmentData = { exercises: final, completedAt: new Date().toISOString(), completed: true };
      localStorage.setItem('assessment_data', JSON.stringify(assessmentData));

      // Salva in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Prima aggiorna user_profiles per segnare onboarding completo
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Poi salva l'assessment
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
        } else {
          console.log('Assessment saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error in complete:', error);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  const progress = ((currentIdx + 1) / total) * 100;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Assessment Iniziale</h1>
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
  const oneRM = test.rm10 * (36 / 27); // Brzycki da 10RM
  const weight = oneRM * (30 / 36);     // 7RM (5 reps + RIR 2)
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
