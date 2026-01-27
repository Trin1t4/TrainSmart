// ============================================================================
// FIX: Bug Massimali Home vs Gym
// ============================================================================
// PROBLEMA: Quando utente home sceglie "test dopo", al click su "Fai test ora"
//           vengono mostrati i pattern GYM invece di CALISTHENICS
// 
// ROOT CAUSE: userData non viene passato correttamente da Screening → ScreeningFlow
// ============================================================================

// ============================================================================
// FILE 1: Dashboard.tsx
// ============================================================================
// Trova il banner "Completa i test fisici" e sostituisci l'onClick del bottone

// CERCA QUESTO:
/*
onClick={() => {
  const screeningType = dataStatus.onboarding?.screeningType;
  if (screeningType === 'thorough') {
    navigate('/screening-full');
  } else {
    navigate('/screening');
  }
}}
*/

// SOSTITUISCI CON QUESTO:
const handleStartScreening = () => {
  const screeningType = dataStatus.onboarding?.screeningType;
  const onboardingData = dataStatus.onboarding;
  
  // Prepara state da passare alla navigazione
  const navigationState = {
    userData: {
      trainingLocation: onboardingData?.trainingLocation,
      trainingType: onboardingData?.trainingType,
      equipment: onboardingData?.equipment,
      personalInfo: onboardingData?.personalInfo,
      goal: onboardingData?.goal
    }
  };
  
  console.log('[Dashboard] Starting screening with userData:', navigationState.userData);
  
  if (screeningType === 'thorough') {
    navigate('/screening-full', { state: navigationState });
  } else {
    navigate('/screening', { state: navigationState });
  }
};

// E usa: onClick={handleStartScreening}


// ============================================================================
// FILE 2: Screening.tsx (e ScreeningFull.tsx - stesso fix)
// ============================================================================
// Modifica fetchUserData per usare navigation state come priorità

// CERCA la funzione fetchUserData e SOSTITUISCI con:

async function fetchUserData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }

    // 1. Prima prova navigation state (priorità)
    const navUserData = location.state?.userData;
    
    // 2. Poi localStorage come fallback
    const onboardingRaw = localStorage.getItem('onboarding_data');
    const storedOnboarding = onboardingRaw ? JSON.parse(onboardingRaw) : null;
    
    // 3. Merge: navigation state ha priorità
    const finalUserData = {
      // Base da localStorage
      ...storedOnboarding,
      // Override da navigation state se presente
      ...(navUserData && {
        trainingLocation: navUserData.trainingLocation || storedOnboarding?.trainingLocation,
        trainingType: navUserData.trainingType || storedOnboarding?.trainingType,
        equipment: navUserData.equipment || storedOnboarding?.equipment,
        personalInfo: navUserData.personalInfo || storedOnboarding?.personalInfo
      })
    };
    
    console.log('[Screening] userData resolved:', {
      fromNavState: !!navUserData,
      trainingLocation: finalUserData.trainingLocation,
      trainingType: finalUserData.trainingType
    });
    
    setUserData(finalUserData);
    
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    setLoading(false);
  }
}


// ============================================================================
// FILE 3: ScreeningFlow.tsx (e ScreeningFlowFull.tsx - stesso fix)
// ============================================================================
// Aggiungi fallback a localStorage se userData è incompleto

// AGGIUNGI questo import se non c'è già:
import { useMemo } from 'react';

// ALL'INIZIO del componente, DOPO le dichiarazioni di props:

export default function ScreeningFlow({ onComplete, userData, userId }) {
  const { t } = useTranslation();

  // ✅ FIX: Garantisci che userData abbia sempre trainingLocation
  const effectiveUserData = useMemo(() => {
    // Se userData ha già trainingLocation, usalo
    if (userData?.trainingLocation) {
      console.log('[ScreeningFlow] Using passed userData:', userData.trainingLocation);
      return userData;
    }
    
    // Fallback: recupera da localStorage
    try {
      const stored = localStorage.getItem('onboarding_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[ScreeningFlow] Fallback to localStorage:', parsed.trainingLocation);
        return {
          ...userData,
          trainingLocation: parsed.trainingLocation || 'home', // Default safe: home
          trainingType: parsed.trainingType || 'bodyweight',
          equipment: parsed.equipment || {},
          personalInfo: parsed.personalInfo
        };
      }
    } catch (e) {
      console.error('[ScreeningFlow] Error reading localStorage:', e);
    }
    
    // Ultimate fallback: assume home/bodyweight (più sicuro)
    console.warn('[ScreeningFlow] No userData found, defaulting to home/bodyweight');
    return {
      ...userData,
      trainingLocation: 'home',
      trainingType: 'bodyweight',
      equipment: {}
    };
  }, [userData]);

  // ✅ USA effectiveUserData invece di userData per la logica
  const isGymMode = effectiveUserData?.trainingLocation === 'gym' &&
                    (effectiveUserData?.trainingType === 'equipment' || 
                     effectiveUserData?.trainingType === 'machines');

  console.log('[ScreeningFlow] Mode decision:', {
    isGymMode,
    location: effectiveUserData?.trainingLocation,
    type: effectiveUserData?.trainingType
  });

  // ... RESTO DEL CODICE - usa effectiveUserData dove serve userData


// ============================================================================
// RIEPILOGO MODIFICHE
// ============================================================================
/*
1. Dashboard.tsx:
   - Passa userData nello state di navigate()

2. Screening.tsx / ScreeningFull.tsx:
   - fetchUserData() merge navigation state + localStorage

3. ScreeningFlow.tsx / ScreeningFlowFull.tsx:
   - useMemo per effectiveUserData con fallback a localStorage
   - Default a home/bodyweight se tutto fallisce (più sicuro)

FILOSOFIA:
- Mai assumere "gym" come default
- Home/bodyweight è il default sicuro (non richiede attrezzatura)
- Triple fallback: navigation state → localStorage → safe default
*/
