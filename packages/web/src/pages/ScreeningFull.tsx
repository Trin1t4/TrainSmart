import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ScreeningFlowFull from '../components/ScreeningFlowFull';
import WarmupGuide from '../components/assessment/WarmupGuide';

/**
 * ScreeningFull - Pagina per lo screening approfondito con 4 test pratici
 * Usata dopo BiomechanicsQuizFull (7 domande)
 */
export default function ScreeningFull() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarmup, setShowWarmup] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    // Check if warmup was already completed this session
    const warmupCompleted = sessionStorage.getItem('warmup_completed');
    if (warmupCompleted === 'true') {
      setShowWarmup(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        currentUserId = 'test-' + Date.now();
        localStorage.setItem('userId', currentUserId);
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

  const handleWarmupComplete = () => {
    sessionStorage.setItem('warmup_completed', 'true');
    setShowWarmup(false);
  };

  const handleWarmupSkip = () => {
    sessionStorage.setItem('warmup_completed', 'skipped');
    setShowWarmup(false);
  };

  if (loading) return <div>Caricamento...</div>;

  // Show warmup guide first
  if (showWarmup) {
    return (
      <WarmupGuide
        onComplete={handleWarmupComplete}
        onSkip={handleWarmupSkip}
      />
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
