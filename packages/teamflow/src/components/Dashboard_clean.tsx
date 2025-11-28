import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Activity, Calendar, TrendingUp, Dumbbell, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

      const response = await fetch('/api/program-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          assessmentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate program');
      }

      const data = await response.json();
      console.log('Program generated:', data);

      await checkUserProgress();

    } catch (error) {
      console.error('Error generating program:', error);
      alert('Errore nella generazione del programma. Riprova.');
    } finally {
      setGeneratingProgram(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Il tuo hub di allenamento personalizzato</p>
        </div>

        {!hasAssessment ? (
          <Card className="mb-8 border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Completa lo Screening</CardTitle>
                  <CardDescription>
                    Inizia il tuo percorso con una valutazione biomeccanica
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/screening')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Inizia lo Screening
              </Button>
            </CardContent>
          </Card>
        ) : !hasProgram ? (
          <Card className="mb-8 border-l-4 border-l-green-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle>Genera il Tuo Programma</CardTitle>
                  <CardDescription>
                    Assessment completato! Crea il tuo programma personalizzato
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateProgram}
                disabled={generatingProgram}
                className="bg-green-600 hover:bg-green-700"
              >
                {generatingProgram ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generazione in corso...
                  </>
                ) : (
                  'Genera Programma'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-l-4 border-l-indigo-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Dumbbell className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle>Il Tuo Programma è Pronto!</CardTitle>
                  <CardDescription>
                    Inizia il tuo prossimo allenamento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/workout')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Vai all'Allenamento
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allenamenti Completati</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Inizia per vedere i progressi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prossimo Allenamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">Non programmato</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progressi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">Completa l'assessment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Totale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0h</div>
              <p className="text-xs text-muted-foreground">Questo mese</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}