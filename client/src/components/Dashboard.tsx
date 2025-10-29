import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, Calendar, TrendingUp, Dumbbell, Clock, CheckCircle, AlertCircle, Zap, Target, Award } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [hasProgram, setHasProgram] = useState(false);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    checkUserProgress();
  }, []);

  async function checkUserProgress() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);

      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assessmentError) {
        console.error('Error checking assessment:', assessmentError);
      }

      if (assessmentData) {
        setHasAssessment(true);
        setAssessmentId(assessmentData.id);

        const { data: programData, error: programError } = await supabase
          .from('training_programs')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (programError) {
          console.error('Error checking program:', programError);
        }

        if (programData) {
          setHasProgram(true);
        }
      }

    } catch (error) {
      console.error('Error checking progress:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateProgram() {
    if (!userId || !assessmentId) {
      alert('Dati mancanti. Riprova.');
      return;
    }

    try {
      setGeneratingProgram(true);

      // ✅ LEGGI ONBOARDING + QUIZ + ASSESSMENT DA LOCALSTORAGE
      const onboardingDataRaw = localStorage.getItem('onboarding_data');
      const quizDataRaw = localStorage.getItem('quiz_data');
      const assessmentDataRaw = localStorage.getItem('assessment_data');

      if (!onboardingDataRaw || !quizDataRaw || !assessmentDataRaw) {
        alert('Dati mancanti. Rifai lo screening.');
        navigate('/onboarding');
        return;
      }

      const onboardingData = JSON.parse(onboardingDataRaw);
      const quizData = JSON.parse(quizDataRaw);
      const assessmentData = JSON.parse(assessmentDataRaw);

      // ✅ UNISCI TUTTI I DATI
      const programInput = {
        userId,
        assessmentId,
        location: onboardingData.trainingLocation,
        hasGym: onboardingData.trainingLocation === 'gym',
        equipment: onboardingData.equipment || {},
        goal: onboardingData.goal || 'muscle_gain',
        level: quizData.level || assessmentData.level || 'intermediate',
        frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
        painAreas: onboardingData.painAreas || assessmentData.painAreas || [],
        disabilityType: onboardingData.disabilityType || null,
        sportRole: onboardingData.sportRole || null,
        specificBodyParts: onboardingData.specificBodyParts || []
      };

      console.log('📤 Sending program input:', programInput);

      const response = await fetch('/api/program/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programInput),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate program');
      }

      const data = await response.json();
      console.log('✅ Program generated:', data);

      await checkUserProgress();

    } catch (error) {
      console.error('Error generating program:', error);
      alert('Errore nella generazione del programma. Riprova.');
    } finally {
      setGeneratingProgram(false);
    }
  }

  async function handleResetProgram() {
    if (!confirm('⚠️ RESET COMPLETO\n\nQuesto cancellerà TUTTO:\n• Programma di allenamento\n• Assessment\n• Dati onboarding\n\nDovrai rifare lo screening da zero.\n\nSei sicuro?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Cancella training programs
      const { error: programError } = await supabase
        .from('training_programs')
        .delete()
        .eq('user_id', user.id);

      if (programError) {
        console.error('Error deleting programs:', programError);
      }

      // 2. Cancella assessments
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('user_id', user.id);

      if (assessmentError) {
        console.error('Error deleting assessments:', assessmentError);
      }

      // ✅ 3. NUOVO - Reset onboarding_data nel database
      const { error: onboardingError } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_data: null,
          onboarding_completed: false 
        })
        .eq('user_id', user.id);

      if (onboardingError) {
        console.error('Error resetting onboarding:', onboardingError);
      }

      // 4. Cancella localStorage
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('quiz_data');
      localStorage.removeItem('assessment_data');

      // 5. Redirect automatico all'onboarding
      navigate('/onboarding');

    } catch (error) {
      console.error('Error during reset:', error);
      alert('Errore durante il reset. Riprova.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-emerald-500 mx-auto mb-4"></div>
            <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <p className="text-gray-300 font-medium">Caricamento Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Il tuo centro di controllo fitness</p>
          </div>
        </div>

        {!hasAssessment ? (
          <Card className="mb-8 bg-gradient-to-r from-amber-900/30 to-gray-900/50 border-2 border-amber-500 backdrop-blur-sm hover:border-amber-400 transition-all duration-300 animate-slide-up shadow-2xl shadow-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/30 rounded-xl animate-pulse-slow">
                  <AlertCircle className="w-8 h-8 text-amber-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Screening Richiesto</CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    Completa lo screening per generare il tuo programma personalizzato
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-4 text-lg rounded-lg shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
              >
                <Target className="w-5 h-5 mr-2 inline pointer-events-none" />
                Inizia Screening
              </button>
            </CardContent>
          </Card>
        ) : !hasProgram ? (
          <Card className="mb-8 bg-gradient-to-r from-emerald-900/30 to-gray-900/50 border-2 border-emerald-500 backdrop-blur-sm hover:border-emerald-400 transition-all duration-300 animate-slide-up shadow-2xl shadow-emerald-500/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/30 rounded-xl animate-pulse-slow">
                  <CheckCircle className="w-8 h-8 text-emerald-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Assessment Completato!</CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    Genera il tuo programma personalizzato
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <button
                onClick={handleGenerateProgram}
                disabled={generatingProgram}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-4 text-lg rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {generatingProgram ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2 pointer-events-none" />
                    Genera Programma
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gradient-to-r from-emerald-900/30 to-gray-900/50 border-2 border-emerald-500 backdrop-blur-sm hover:border-emerald-400 transition-all duration-300 animate-slide-up shadow-2xl shadow-emerald-500/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/30 rounded-xl animate-bounce-slow">
                  <Award className="w-8 h-8 text-emerald-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Il Tuo Programma è Pronto!</CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    Inizia il tuo prossimo allenamento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/workout')}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105"
                >
                  <Dumbbell className="w-5 h-5 mr-2 pointer-events-none" />
                  Vai all'Allenamento
                </button>
                <button
  onClick={handleResetProgram}
  className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 cursor-pointer"
  title="Reset Completo (cancella tutto)"
>
  <span className="text-xl pointer-events-none">🔄</span>
  <span className="ml-2 pointer-events-none">Reset</span>
</button>

              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 animate-slide-up-delay-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Allenamenti Completati</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="text-xs text-gray-500 mt-1">Inizia per vedere i progressi</p>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 w-0 animate-progress"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 animate-slide-up-delay-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Prossimo Allenamento</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">---</div>
              <p className="text-xs text-gray-500 mt-1">Non programmato</p>
              <div className="mt-2 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-8 w-full bg-gray-700/50 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 animate-slide-up-delay-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Progressi</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">---</div>
              <p className="text-xs text-gray-500 mt-1">Completa l'assessment</p>
              <div className="mt-2 flex items-end gap-1 h-12">
                {[30, 50, 40, 60, 45, 70, 65].map((height, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400/50 rounded-t animate-grow" style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 animate-slide-up-delay-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Tempo Totale</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0h</div>
              <p className="text-xs text-gray-500 mt-1">Questo mese</p>
              <div className="mt-2 relative">
                <div className="flex justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-700" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="175.93" strokeDashoffset="175.93" className="text-emerald-500 animate-circle-progress" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="fixed top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 50%; }
        }
        @keyframes grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes circle-progress {
          from { stroke-dashoffset: 175.93; }
          to { stroke-dashoffset: 88; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delay-1 { animation: slide-up 0.6s ease-out 0.1s both; }
        .animate-slide-up-delay-2 { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-slide-up-delay-3 { animation: slide-up 0.6s ease-out 0.3s both; }
        .animate-slide-up-delay-4 { animation: slide-up 0.6s ease-out 0.4s both; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-progress { animation: progress 2s ease-out forwards; }
        .animate-grow { animation: grow 1s ease-out forwards; transform-origin: bottom; }
        .animate-circle-progress { animation: circle-progress 2s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite 3s; }
      `}</style>
    </div>
  );
}
