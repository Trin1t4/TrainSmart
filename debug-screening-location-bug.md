# Debug: Bug Massimali Home vs Gym

## Il Problema
Quando l'utente:
1. Completa onboarding con `trainingLocation = 'home'`
2. Sceglie "test più tardi"
3. Clicca "Fai i test ora" dalla Dashboard

→ Gli vengono mostrati i test da PALESTRA (10RM bilanciere) invece che CALISTHENICS

---

## STEP 1: Inserisci questo in `Dashboard.tsx`

Trova il bottone "Fai i test ora" (circa riga dove c'è `onClick={() => navigate('/screening')}`):

```tsx
// PRIMA (bug):
onClick={() => {
  const screeningType = dataStatus.onboarding?.screeningType;
  if (screeningType === 'thorough') {
    navigate('/screening-full');
  } else {
    navigate('/screening');
  }
}}

// DOPO (con debug + fix):
onClick={() => {
  const screeningType = dataStatus.onboarding?.screeningType;
  const onboardingData = dataStatus.onboarding;
  
  // 🔍 DEBUG: Log cosa c'è in onboarding
  console.group('🔍 [DEBUG] Dashboard → Screening Navigation');
  console.log('trainingLocation:', onboardingData?.trainingLocation);
  console.log('trainingType:', onboardingData?.trainingType);
  console.log('equipment:', onboardingData?.equipment);
  console.log('Full onboarding:', onboardingData);
  console.groupEnd();
  
  // ✅ FIX: Passa i dati nello state della navigazione
  const navigationState = {
    userData: {
      trainingLocation: onboardingData?.trainingLocation,
      trainingType: onboardingData?.trainingType,
      equipment: onboardingData?.equipment,
      personalInfo: onboardingData?.personalInfo
    }
  };
  
  if (screeningType === 'thorough') {
    navigate('/screening-full', { state: navigationState });
  } else {
    navigate('/screening', { state: navigationState });
  }
}}
```

---

## STEP 2: Inserisci questo in `Screening.tsx`

Trova la funzione `fetchUserData()` e aggiungi logging:

```tsx
async function fetchUserData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }

    // 🔍 DEBUG: Log dati da localStorage
    const onboardingRaw = localStorage.getItem('onboarding_data');
    console.group('🔍 [DEBUG] Screening.tsx → fetchUserData');
    console.log('Raw localStorage onboarding_data:', onboardingRaw);
    
    if (onboardingRaw) {
      const onboarding = JSON.parse(onboardingRaw);
      console.log('Parsed trainingLocation:', onboarding.trainingLocation);
      console.log('Parsed trainingType:', onboarding.trainingType);
      console.log('Parsed equipment:', onboarding.equipment);
      
      // ✅ FIX: Usa i dati da navigation state SE presenti, altrimenti localStorage
      const navState = location.state?.userData;
      const finalUserData = {
        ...onboarding,
        // Override con navigation state se presente
        trainingLocation: navState?.trainingLocation || onboarding.trainingLocation,
        trainingType: navState?.trainingType || onboarding.trainingType,
        equipment: navState?.equipment || onboarding.equipment
      };
      
      console.log('🎯 Final userData to pass to ScreeningFlow:', finalUserData);
      console.groupEnd();
      
      setUserData(finalUserData);
    } else {
      console.warn('⚠️ No onboarding_data in localStorage!');
      console.groupEnd();
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    setLoading(false);
  }
}
```

---

## STEP 3: Inserisci questo in `ScreeningFlow.tsx`

All'inizio del componente, subito dopo le dichiarazioni di stato:

```tsx
export default function ScreeningFlow({ onComplete, userData, userId }) {
  const { t } = useTranslation();

  // 🔍 DEBUG: Log cosa riceve il componente
  useEffect(() => {
    console.group('🔍 [DEBUG] ScreeningFlow → Props Received');
    console.log('userData:', userData);
    console.log('userData.trainingLocation:', userData?.trainingLocation);
    console.log('userData.trainingType:', userData?.trainingType);
    console.groupEnd();
  }, [userData]);

  // Determina modalità test in base a location e trainingType
  const isGymMode = userData?.trainingLocation === 'gym' &&
                    (userData?.trainingType === 'equipment' || userData?.trainingType === 'machines');

  // 🔍 DEBUG: Log decisione mode
  console.log('🎯 [DEBUG] isGymMode calculated:', isGymMode, {
    location: userData?.trainingLocation,
    type: userData?.trainingType,
    locationIsGym: userData?.trainingLocation === 'gym',
    typeIsEquipment: userData?.trainingType === 'equipment',
    typeIsMachines: userData?.trainingType === 'machines'
  });

  // ... resto del codice
```

---

## STEP 4: Verifica il Bug

1. Fai un reset completo
2. Completa onboarding scegliendo **HOME** + **Corpo libero** (o piccoli attrezzi)
3. Scegli "Farò i test dopo"
4. Vai in Dashboard
5. Apri la Console del browser (F12)
6. Clicca "Fai i test ora"

### Output atteso se il bug è confermato:

```
🔍 [DEBUG] Dashboard → Screening Navigation
  trainingLocation: "home"
  trainingType: "bodyweight"
  ...

🔍 [DEBUG] Screening.tsx → fetchUserData
  Raw localStorage: "{"trainingLocation":"home",...}"
  Parsed trainingLocation: "home"
  ...

🔍 [DEBUG] ScreeningFlow → Props Received
  userData: undefined  ← 🐛 QUI! userData arriva undefined
  userData.trainingLocation: undefined

🎯 [DEBUG] isGymMode calculated: false {
  location: undefined,  ← Ma location è undefined!
  type: undefined,
  ...
}
```

**Ma poi mostra GYM patterns** perché c'è un fallback sbagliato o userData non viene passato correttamente.

---

## ROOT CAUSE PROBABILE

Guardando il codice, il problema è probabilmente qui in `Screening.tsx`:

```tsx
// Il componente NON passa userData a ScreeningFlow correttamente
// o c'è un problema di timing (userData è null al primo render)

return (
  <ScreeningFlow
    onComplete={handleComplete}
    userData={userData}  // ← Potrebbe essere null/undefined
    userId={userId}
  />
);
```

---

## FIX DEFINITIVO (dopo debug)

Se confermato, aggiungi un guard in `ScreeningFlow.tsx`:

```tsx
export default function ScreeningFlow({ onComplete, userData, userId }) {
  // ✅ GUARD: Se userData non ha location, recupera da localStorage
  const effectiveUserData = useMemo(() => {
    if (userData?.trainingLocation) {
      return userData;
    }
    
    // Fallback: leggi da localStorage
    const stored = localStorage.getItem('onboarding_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.warn('⚠️ [ScreeningFlow] userData mancante, usando localStorage fallback');
      return {
        ...userData,
        trainingLocation: parsed.trainingLocation,
        trainingType: parsed.trainingType,
        equipment: parsed.equipment,
        personalInfo: parsed.personalInfo
      };
    }
    
    return userData;
  }, [userData]);

  // Usa effectiveUserData invece di userData
  const isGymMode = effectiveUserData?.trainingLocation === 'gym' &&
                    (effectiveUserData?.trainingType === 'equipment' || 
                     effectiveUserData?.trainingType === 'machines');
  
  // ... resto del codice con effectiveUserData
}
```

---

## Checklist

- [ ] Inserito debug in Dashboard.tsx
- [ ] Inserito debug in Screening.tsx  
- [ ] Inserito debug in ScreeningFlow.tsx
- [ ] Testato con HOME + bodyweight
- [ ] Confermato che userData arriva undefined/incompleto
- [ ] Applicato fix con fallback localStorage
- [ ] Rimosso console.log di debug
