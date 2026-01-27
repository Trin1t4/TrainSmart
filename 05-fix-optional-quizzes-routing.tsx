// ============================================================================
// FILE: packages/web/src/pages/Onboarding.tsx
// SEZIONE: funzione navigateToQuiz
// AZIONE: AGGIUNGI all'inizio della funzione
// ============================================================================

const navigateToQuiz = (finalData: Partial<OnboardingData>) => {
  // ✅ FIX: Salva il tipo di screening per routing successivo
  const screeningType = finalData.screeningType || 'light';
  localStorage.setItem('screening_type', screeningType);
  console.log(`[ONBOARDING] 📝 Screening type saved: ${screeningType}`);
  
  // ... resto della funzione esistente (NON MODIFICARE) ...
  if (finalData.goal === 'motor_recovery') {
    console.log('[ONBOARDING] 🏥 Motor recovery → /recovery-screening');
    navigate('/recovery-screening');
  } else {
    // ... etc
  }
};


// ============================================================================
// FILE: packages/web/src/components/ScreeningFlow.tsx
// SEZIONE: dove viene chiamato onComplete o navigate('/dashboard')
// AZIONE: MODIFICA per navigare a optional-quizzes se screening light
// ============================================================================

// TROVA il punto dove lo screening termina e naviga alla dashboard
// Potrebbe essere in handleComplete, onSubmit, o simile
// SOSTITUISCI con:

const handleScreeningComplete = async (results: any) => {
  // Salva i risultati
  localStorage.setItem('screening_data', JSON.stringify(results));
  
  // ✅ FIX: Naviga a quiz opzionali se screening light
  const screeningType = localStorage.getItem('screening_type') || 'light';
  
  if (screeningType === 'light') {
    console.log('[SCREENING] ✅ Light screening completed → /optional-quizzes');
    navigate('/optional-quizzes');
  } else {
    console.log('[SCREENING] ✅ Full screening completed → /dashboard');
    navigate('/dashboard');
  }
  
  // Chiama onComplete se fornito
  if (onComplete) {
    onComplete(results);
  }
};


// ============================================================================
// FILE: packages/web/src/pages/OptionalQuizzes.tsx
// SEZIONE: handleProceedToDashboard
// AZIONE: AGGIUNGI salvataggio flag completamento
// ============================================================================

const handleProceedToDashboard = async () => {
  setIsNavigating(true);

  // ✅ FIX: Segna i quiz come completati (o skippati)
  localStorage.setItem('optional_quizzes_completed', 'true');
  console.log('[OPTIONAL_QUIZZES] ✅ Marked as completed/skipped');

  await new Promise(resolve => setTimeout(resolve, 500));
  navigate('/dashboard');
};


// ============================================================================
// FILE: packages/web/src/components/Dashboard.tsx
// SEZIONE: Nel JSX principale, dopo il saluto/header
// AZIONE: AGGIUNGI il banner per quiz opzionali
// ============================================================================

// Aggiungi l'import se non presente:
// import { ClipboardCheck } from 'lucide-react';

// Nel JSX, AGGIUNGI questo blocco (es. dopo il messaggio di benvenuto):

{/* ✅ FIX: Banner per quiz opzionali non completati */}
{(() => {
  const screeningType = localStorage.getItem('screening_type');
  const quizzesCompleted = localStorage.getItem('optional_quizzes_completed');
  
  // Mostra banner solo se: screening light + quiz non completati
  if (screeningType === 'light' && quizzesCompleted !== 'true') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">🎯 Migliora il tuo programma</h3>
              <p className="text-sm text-slate-400">
                Completa i quiz opzionali per una personalizzazione più accurata del tuo allenamento
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.setItem('optional_quizzes_completed', 'true');
                // Force re-render to hide banner
                window.location.reload();
              }}
              className="px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Non ora
            </button>
            <button
              onClick={() => navigate('/optional-quizzes')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Completa Quiz →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
})()}


// ============================================================================
// NOTA: Puoi anche aggiungere un link permanente nel profilo utente
// per accedere ai quiz opzionali in qualsiasi momento
// ============================================================================
