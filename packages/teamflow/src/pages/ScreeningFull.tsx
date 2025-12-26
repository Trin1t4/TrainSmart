import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ScreeningFlowFull from '../components/ScreeningFlowFull';

/**
 * ScreeningFull - Pagina per lo screening approfondito con 4 test pratici
 * Usata dopo BiomechanicsQuizFull (7 domande)
 */
export default function ScreeningFull() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Try to get authenticated user first
      const { data: { user } } = await supabase.auth.getUser();

      let currentUserId;
      if (user) {
        currentUserId = user.id;
      } else {
        currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
          currentUserId = 'test-' + Date.now();
          localStorage.setItem('userId', currentUserId);
        }
      }
      setUserId(currentUserId);

      const localData = localStorage.getItem('onboarding_data');
      if (localData) {
        const parsedData = JSON.parse(localData);
        setUserData(parsedData);
        console.log('[SCREENING-FULL] Loaded onboarding data:', parsedData);
        console.log('[SCREENING-FULL] Training location:', parsedData.trainingLocation);
      } else {
        console.warn('[SCREENING-FULL] No onboarding_data found in localStorage');
      }

      setLoading(false);
    } catch (error) {
      console.error('[SCREENING-FULL] Error:', error);
      setLoading(false);
    }
  };

  const handleComplete = async (screeningData) => {
    console.log('[SCREENING-FULL] Assessment completed, navigating to dashboard');
    console.log('[SCREENING-FULL] Data:', screeningData);

    // Mark as full screening completed
    const fullScreeningData = {
      ...screeningData,
      screeningType: 'thorough',
      testCount: 4
    };
    localStorage.setItem('screening_data', JSON.stringify(fullScreeningData));

    setTimeout(() => {
      navigate('/dashboard');
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <ScreeningFlowFull
      onComplete={handleComplete}
      userData={userData}
      userId={userId}
    />
  );
}
