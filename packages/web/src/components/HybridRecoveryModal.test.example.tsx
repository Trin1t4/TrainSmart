/**
 * HYBRID RECOVERY MODAL - Test Example
 *
 * Questo file mostra come testare il modal standalone.
 * NON è un file di test automatizzato, ma un esempio di utilizzo.
 */

import { useState } from 'react';
import HybridRecoveryModal from './HybridRecoveryModal';
import { toast } from 'sonner';

/**
 * Componente di test per HybridRecoveryModal
 */
export default function HybridRecoveryModalTest() {
  const [showModal, setShowModal] = useState(false);

  // Dati di esempio
  const testData = {
    exerciseName: 'Squat',
    painLevel: 5,
    sessions: 3,
    allExercises: [
      // Lower back exercises (will be affected)
      'Squat',
      'Deadlift',
      'Good Morning',
      'Leg Press',

      // Normal exercises
      'Bench Press',
      'Barbell Row',
      'Overhead Press',
      'Pull-ups',
      'Bicep Curl',
      'Tricep Extension',
      'Lateral Raise',
      'Face Pull'
    ]
  };

  const handleActivate = (bodyArea: string, affectedExercises: string[]) => {
    console.log('✅ Recovery Mode Activated!');
    console.log('Body Area:', bodyArea);
    console.log('Affected Exercises:', affectedExercises);

    toast.success(
      `Recovery Mode attivato per ${bodyArea}. ${affectedExercises.length} esercizi coinvolti.`,
      { duration: 5000 }
    );

    // Qui salveresti su database
    // await supabase.from('exercise_recovery_status').insert({...})
  };

  const handleSkip = () => {
    console.log('⏭️ Exercise skipped without recovery');
    toast.info('Esercizio saltato.', { duration: 3000 });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          HybridRecoveryModal - Test Interface
        </h1>

        {/* Test Info */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Test Data</h2>
          <div className="space-y-2 text-slate-300 text-sm">
            <p><strong>Exercise:</strong> {testData.exerciseName}</p>
            <p><strong>Pain Level:</strong> {testData.painLevel}/10</p>
            <p><strong>Sessions:</strong> {testData.sessions}</p>
            <p><strong>Total Exercises:</strong> {testData.allExercises.length}</p>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300"
        >
          Open Hybrid Recovery Modal
        </button>

        {/* Instructions */}
        <div className="mt-8 bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-3">Test Instructions</h3>
          <ol className="space-y-2 text-slate-400 text-sm list-decimal list-inside">
            <li>Click "Open Hybrid Recovery Modal"</li>
            <li><strong>Step 1 - Confirm:</strong> Click "Sì, attiva Recovery"</li>
            <li><strong>Step 2 - Select Area:</strong> Choose "Lower Back" or other area</li>
            <li><strong>Step 3 - Summary:</strong> Review affected exercises</li>
            <li>Click "Continua Workout" or "Cambia area corporea"</li>
            <li>Check console for logs</li>
          </ol>
        </div>

        {/* Expected Behavior */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2">Expected Behavior</h4>
          <p className="text-blue-200 text-sm mb-2">
            If you select <strong>"Lower Back"</strong>, you should see:
          </p>
          <ul className="space-y-1 text-blue-200 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-orange-400">🔄</span>
              <strong>Recovery Mode:</strong> Squat, Deadlift, Good Morning
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              <strong>Cautela:</strong> Leg Press
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✅</span>
              <strong>Normali:</strong> Bench Press, Row, Pullups, etc.
            </li>
          </ul>
        </div>

        {/* Console Logs */}
        <div className="mt-6 bg-slate-900 rounded-xl p-4 border border-slate-700">
          <h4 className="text-slate-300 font-semibold mb-2 text-sm">Expected Console Logs:</h4>
          <pre className="text-xs text-slate-500 font-mono">
{`🔍 Affected exercises identified: {
  primary: ['Squat', 'Deadlift', 'Good Morning'],
  secondary: ['Leg Press'],
  normal: ['Bench Press', 'Barbell Row', ...]
}

✅ Recovery Mode Activated!
Body Area: lower_back
Affected Exercises: ['Squat', 'Deadlift', 'Good Morning', 'Leg Press']`}
          </pre>
        </div>
      </div>

      {/* Modal Component */}
      <HybridRecoveryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        exerciseName={testData.exerciseName}
        painLevel={testData.painLevel}
        sessions={testData.sessions}
        allExercises={testData.allExercises}
        onActivate={handleActivate}
        onSkip={handleSkip}
      />
    </div>
  );
}

/**
 * USAGE IN APP:
 *
 * 1. Aggiungi route in App.tsx:
 *
 * import HybridRecoveryModalTest from './components/HybridRecoveryModal.test.example';
 *
 * <Route path="/test/recovery-modal" element={<HybridRecoveryModalTest />} />
 *
 *
 * 2. Naviga a: http://localhost:5173/test/recovery-modal
 *
 *
 * 3. Oppure usa in qualsiasi componente:
 *
 * const [showModal, setShowModal] = useState(false);
 *
 * <button onClick={() => setShowModal(true)}>Test Modal</button>
 *
 * <HybridRecoveryModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   exerciseName="Squat"
 *   painLevel={5}
 *   sessions={3}
 *   allExercises={['Squat', 'Bench Press', ...]}
 *   onActivate={(area, exercises) => console.log(area, exercises)}
 *   onSkip={() => setShowModal(false)}
 * />
 */
