import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ScreeningFlow from '../components/ScreeningFlow';

export default function Screening() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        currentUserId = 'test-' + Date.now();
        localStorage.setItem('userId', currentUserId);
      }
      setUserId(currentUserId);

      // FIX: Usa la chiave corretta 'onboarding_data' (con underscore)
      const localData = localStorage.getItem('onboarding_data');
      if (localData) {
        const parsedData = JSON.parse(localData);
        setUserData(parsedData);
        console.log('[SCREENING] ✅ Loaded onboarding data:', parsedData);
        console.log('[SCREENING] 🏠 Training location:', parsedData.trainingLocation);
        console.log('[SCREENING] 🎯 Training type:', parsedData.trainingType);
      } else {
        console.warn('[SCREENING] ⚠️ No onboarding_data found in localStorage');
      }

      setLoading(false);
    } catch (error) {
      console.error('[SCREENING] Error:', error);
      setLoading(false);
    }
  };

  const handleComplete = async (screeningData) => {
    console.log('[SCREENING] ✅ Assessment completed, navigating to dashboard');
    console.log('[SCREENING] Data:', screeningData);

    // I dati sono già salvati da ScreeningFlow in 'screening_data'
    // Naviga direttamente alla dashboard
    navigate('/dashboard');
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <ScreeningFlow 
      onComplete={handleComplete}
      userData={userData}
      userId={userId}
    />
  );
}
