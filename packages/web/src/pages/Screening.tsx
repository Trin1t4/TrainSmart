import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ScreeningFlow from '../components/ScreeningFlow';
import WarmupGuide from '../components/assessment/WarmupGuide';

/**
 * Screening - Pagina per lo screening leggero con 2 test pratici
 * Usata dopo BiomechanicsQuiz (3 domande)
 *
 * Gestisce 3 scenari:
 * 1. In palestra + test ora → riscaldamento + test completi
 * 2. Non in palestra + conosco massimali → NO riscaldamento, inserimento manuale
 * 3. Non in palestra + non conosco → va direttamente alla dashboard (gestito altrove)
 */
export default function Screening() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarmup, setShowWarmup] = useState(true);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserData();

    // Check if this is manual entry mode (user knows their maxes, not in gym)
    const manualEntry = location.state?.manualEntry === true;
    setIsManualEntry(manualEntry);

    // Skip warmup if:
    // 1. Manual entry mode (user is not in gym)
    // 2. Warmup was already completed this session
    const warmupCompleted = sessionStorage.getItem('warmup_completed');
    if (manualEntry || warmupCompleted === 'true' || warmupCompleted === 'skipped') {
      setShowWarmup(false);
      if (manualEntry) {
        console.log('[SCREENING] Manual entry mode - skipping warmup');
      }
    }
  }, [location.state]);

  const fetchUserData = async () => {
    try {
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        currentUserId = 'test-' + Date.now();
        localStorage.setItem('userId', currentUserId);
      }
      setUserId(currentUserId);

      // 1. Prima prova navigation state (priorità) - passato da Dashboard
      const navUserData = location.state?.userData;

      // 2. Poi localStorage come fallback
      const localData = localStorage.getItem('onboarding_data');
      const storedOnboarding = localData ? JSON.parse(localData) : null;

      // 3. Merge: navigation state ha priorità su localStorage
      const finalUserData = {
        // Base da localStorage
        ...storedOnboarding,
        // Override da navigation state se presente
        ...(navUserData && {
          trainingLocation: navUserData.trainingLocation || storedOnboarding?.trainingLocation,
          trainingType: navUserData.trainingType || storedOnboarding?.trainingType,
          equipment: navUserData.equipment || storedOnboarding?.equipment,
          personalInfo: navUserData.personalInfo || storedOnboarding?.personalInfo,
          goal: navUserData.goal || storedOnboarding?.goal
        })
      };

      console.log('[SCREENING] ✅ userData resolved:', {
        fromNavState: !!navUserData,
        trainingLocation: finalUserData.trainingLocation,
        trainingType: finalUserData.trainingType
      });

      setUserData(finalUserData);
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
    // Aggiungi piccolo delay per permettere a Framer Motion di completare animations
    // Questo previene il crash "removeChild" quando il componente si smonta
    setTimeout(() => {
      navigate('/dashboard');
    }, 150);
  };

  const handleWarmupComplete = () => {
    sessionStorage.setItem('warmup_completed', 'true');
    setShowWarmup(false);
  };

  const handleWarmupSkip = () => {
    // Still mark as "done" but show warning
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
    <ScreeningFlow
      onComplete={handleComplete}
      userData={userData}
      userId={userId}
    />
  );
}
