import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function Screening() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('[SCREENING] 🔍 Extracting userId...');
        
        // ✅ OPZIONE 1: userId dai URL params
        let idToUse = userId;
        
        // ✅ OPZIONE 2: Se params fallisce, prova da session state
        if (!idToUse && location.state?.userId) {
          idToUse = location.state.userId;
          console.log('[SCREENING] ✅ userId dal location state:', idToUse);
        }

        // ✅ OPZIONE 3: Se ancora non c'è, prova da localStorage
        if (!idToUse) {
          idToUse = localStorage.getItem('userId');
          console.log('[SCREENING] ✅ userId da localStorage:', idToUse);
        }

        if (!idToUse) {
          console.error('[SCREENING] ❌ NO userId found anywhere!');
          setError('❌ User ID non trovato. Torna alla login.');
          setLoading(false);
          return;
        }

        console.log('[SCREENING] ✅ Using userId:', idToUse);

        // ✅ Fetch user data da Supabase
        console.log('[SCREENING] 📡 Fetching from Supabase...');
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('onboarding_data, assessment_data')
          .eq('user_id', idToUse)
          .single();

        if (userError) {
          console.error('[SCREENING] ❌ Supabase Query Error:', userError);
          setError(`❌ Errore caricamento dati: ${userError.message}`);
          setLoading(false);
          return;
        }

        if (!userData) {
          console.error('[SCREENING] ❌ User data is null!');
          setError('❌ Utente non trovato nel database.');
          setLoading(false);
          return;
        }

        console.log('[SCREENING] ✅ User data fetched:', userData);

        // ✅ Set onboarding data
        setData(userData.onboarding_data);

        // ✅ Set assessment data se esiste
        if (userData.assessment_data) {
          console.log('[SCREENING] ✅ Assessment data found');
          setQuizData(userData.assessment_data.quizData);
          setLevelResult(userData.assessment_data.levelResult);
        } else {
          console.warn('[SCREENING] ⚠️ No assessment_data found');
        }

        console.log('[SCREENING] ✅ All data loaded successfully');
        setLoading(false);
      } catch (err) {
        console.error('[SCREENING] ❌ Exception:', err);
        setError(`❌ Errore: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, location.state]);

  const handleGenerateProgram = async () => {
    console.log('[SCREENING] 🎯 Generating program...');
    
    if (!userId && !localStorage.getItem('userId')) {
      setError('❌ User ID non disponibile');
      return;
    }

    if (!levelResult || !data) {
      setError('❌ Dati assessment non disponibili');
      return;
    }

    setGeneratingProgram(true);

    try {
      const assessmentId = data.assessmentId;
      const userIdToUse = userId || localStorage.getItem('userId');

      console.log('[SCREENING] 📤 Sending to API:', {
        userId: userIdToUse,
        assessmentId,
        level: levelResult.level,
      });

      const response = await fetch('/api/program/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          assessmentId,
          level: levelResult.level,
          trainingLocation: data?.trainingLocation || 'gym',
          equipment: data?.equipment || {},
          goal: data?.goal || 'muscle_gain',
          homeType: data?.homeType || 'bodyweight',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[SCREENING] ❌ API Error:', errorData);
        setError(`❌ Errore API: ${errorData.error || response.statusText}`);
        setGeneratingProgram(false);
        return;
      }

      const programData = await response.json();
      console.log('[SCREENING] ✅ Program generated:', programData);

      // ✅ Salva in Supabase
      const assessmentData = {
        exercises: programData.exercises || [],
        completedAt: new Date().toISOString(),
        completed: true,
        location: data.trainingLocation,
        frequency: data.activityLevel?.weeklyFrequency,
        duration: data.activityLevel?.sessionDuration,
        goal: data.goal,
        level: levelResult.level,
        finalScore: levelResult.finalScore,
        practicalScore: levelResult.practicalScore,
        physicalScore: levelResult.physicalScore,
      };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ assessment_data: assessmentData })
        .eq('user_id', userIdToUse);

      if (updateError) {
        console.error('[SCREENING] ⚠️ DB Update Error:', updateError);
      } else {
        console.log('[SCREENING] ✅ Assessment saved to DB');
      }

      // ✅ Navigate to Dashboard
      navigate(`/dashboard/${userIdToUse}`, {
        state: { program: programData, assessment: levelResult },
      });
    } catch (err) {
      console.error('[SCREENING] ❌ Error:', err);
      setError(`❌ Errore: ${err.message}`);
    } finally {
      setGeneratingProgram(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⏳ Caricamento assessment...</h2>
        <p>userId: {userId || 'NOT FOUND'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>{error}</h2>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Torna a Login
        </button>
      </div>
    );
  }

  if (!levelResult || !data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚠️ Dati non disponibili</h2>
        <p>levelResult: {levelResult ? '✅' : '❌'}</p>
        <p>data: {data ? '✅' : '❌'}</p>
      </div>
    );
  }

  const levelText = levelResult.level === 'beginner' 
    ? 'Principiante' 
    : levelResult.level === 'intermediate' 
    ? 'Intermedio' 
    : 'Avanzato';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1>Ecco il tuo profilo fitness completo</h1>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <h2>Il tuo livello</h2>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{levelText}</p>
          <p style={{ fontSize: '18px', color: '#666' }}>Punteggio totale: {levelResult.finalScore}%</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h3>📚 Quiz Teorico</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{quizData?.score || 0}%</p>
            <small>50% del calcolo</small>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h3>💪 Test Pratici</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{levelResult.practicalScore}%</p>
            <small>30% del calcolo</small>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h3>📊 Parametri Fisici</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{levelResult.physicalScore}%</p>
            <small>20% del calcolo</small>
          </div>
        </div>

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
          <h3>La formula di calcolo</h3>
          <p>Il programma di allenamento sarà calibrato su questo livello per garantire progressi ottimali e sicuri.</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h2>{generatingProgram ? '⏳ Creazione programma...' : '🎯 Personalizzazione in corso'}</h2>

        <button
          onClick={handleGenerateProgram}
          disabled={generatingProgram}
          style={{
            background: generatingProgram ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: generatingProgram ? 'not-allowed' : 'pointer',
            marginTop: '20px',
          }}
        >
          {generatingProgram ? 'Generazione in corso...' : 'Genera Programma Personalizzato'}
        </button>

        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>

      {/* DEBUG INFO */}
      <div style={{ marginTop: '40px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '12px' }}>
        <h4>🐛 Debug Info:</h4>
        <pre>{JSON.stringify({ userId, hasLevelResult: !!levelResult, hasData: !!data }, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Screening;