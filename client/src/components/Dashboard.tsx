      import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasProgram, setHasProgram] = useState(false);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUserProgress();
  }, []);

  async function checkUserProgress() {
    try {
      // Check programma esistente
      const existingProgram = localStorage.getItem('programGenerated') || localStorage.getItem('generatedProgram');
      if (existingProgram) {
        setHasProgram(true);
      }

      // Check user (ma NON fare redirect)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Usa un ID temporaneo invece di redirect
        const tempId = localStorage.getItem('tempUserId') || 'user-' + Date.now();
        localStorage.setItem('tempUserId', tempId);
        setUserId(tempId);
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  }

  async function handleGenerateProgram() {
    try {
      setGeneratingProgram(true);

      // Leggi tutti i dati disponibili (senza redirect se mancano)
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      const quizData = JSON.parse(localStorage.getItem('quiz_data') || '{}');
      const screeningData = JSON.parse(localStorage.getItem('screening_data') || '{}');

      // CALCOLO INTELLIGENTE DEL LEVEL
      let userLevel = 'beginner';
      
      if (screeningData.level) {
        userLevel = screeningData.level;
        console.log('Level from screening:', userLevel);
      } else if (quizData.level) {
        userLevel = quizData.level;
        console.log('Level from quiz:', userLevel);
      } else if (quizData.score !== undefined) {
        userLevel = quizData.score >= 80 ? 'advanced' : 
                   quizData.score >= 50 ? 'intermediate' : 'beginner';
        console.log('Level calculated from score:', quizData.score, '→', userLevel);
      }

      // MAPPING GOAL
      const goalMap = {
        'forza': 'strength',
        'massa': 'muscle_gain',
        'definizione': 'fat_loss',
        'resistenza': 'endurance'
      };

      const goal = goalMap[onboardingData.goal?.toLowerCase()] || onboardingData.goal || 'muscle_gain';

      console.log('🎯 GENERATING WITH:', { level: userLevel, goal });

      // PREPARA INPUT
      const programInput = {
        userId: userId || 'test-user',
        level: userLevel,
        goal: goal,
        location: onboardingData.trainingLocation || 'home',
        frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
        equipment: onboardingData.equipment || {}
      };

      // CHIAMA API
      const response = await fetch('/api/program-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programInput)
      });

      if (!response.ok) {
        throw new Error('Generazione fallita');
      }

      const data = await response.json();
      
      // SALVA
      localStorage.setItem('programGenerated', JSON.stringify({
        timestamp: new Date().toISOString(),
        program: data.program || data
      }));
      
      

      setHasProgram(true);
      alert('✅ Programma generato con successo!');

    } catch (error) {
      console.error('Error:', error);
      alert('Errore nella generazione. Riprova.');
    } finally {
      setGeneratingProgram(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasProgram ? (
                <>
                  <CheckCircle className="text-green-500" />
                  Programma Pronto
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-500" />
                  Nessun Programma
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasProgram ? (
              <button
                onClick={handleGenerateProgram}
                disabled={generatingProgram}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {generatingProgram ? 'Generazione...' : (
                  <>
                    <Zap className="w-5 h-5" />
                    Genera Programma Intelligente
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/workout')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  <Activity className="inline mr-2" />
                  Vai all'Allenamento
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('programGenerated');
                    localStorage.removeItem('generatedProgram');
                    setHasProgram(false);
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  Rigenera Programma
                </button>
              </>
            )}

            {/* Debug Info */}
            <details className="mt-8 pt-8 border-t border-gray-700">
              <summary className="cursor-pointer text-gray-400">Debug Info</summary>
              <pre className="mt-4 text-xs bg-gray-900 p-4 rounded">
{JSON.stringify({
  onboarding: !!localStorage.getItem('onboarding_data'),
  quiz: !!localStorage.getItem('quiz_data'),
  screening: !!localStorage.getItem('screening_data'),
  program: hasProgram
}, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
