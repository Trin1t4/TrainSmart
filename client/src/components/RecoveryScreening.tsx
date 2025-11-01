import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PostSetScreeningProps {
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  targetReps: number;
  goalType: 'hypertrophy' | 'strength' | 'endurance' | 'power';
  onComplete: (feedback: SetFeedback) => void;
}

export interface SetFeedback {
  completed: boolean;
  rpe: number | null;
  repsDone: number | null;
  reason: 'pain' | 'fatigue' | 'other' | null;
  reasonDetails: string | null;
  needsAdjustment: boolean;
  adjustmentType: 'increase' | 'decrease' | 'maintain' | null;
}

export const PostSetScreening: React.FC<PostSetScreeningProps> = ({
  workoutId,
  exerciseId,
  setNumber,
  targetReps,
  goalType,
  onComplete,
}) => {
  const [step, setStep] = useState<'initial' | 'rpe' | 'incomplete' | 'reason'>('initial');
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [repsDone, setRepsDone] = useState<number>(0);
  const [reason, setReason] = useState<'pain' | 'fatigue' | 'other' | null>(null);
  const [reasonDetails, setReasonDetails] = useState<string>('');

  const getTargetRPE = (): { min: number; max: number } => {
    if (goalType === 'strength' || goalType === 'power') {
      if (setNumber === 1) return { min: 7, max: 8 };
      if (setNumber === 2) return { min: 7.5, max: 8.5 };
      return { min: 8, max: 9 };
    } else {
      if (setNumber === 1) return { min: 6.5, max: 7.5 };
      if (setNumber === 2) return { min: 7, max: 8 };
      return { min: 7.5, max: 8.5 };
    }
  };

  const handleInitialResponse = (isCompleted: boolean) => {
    setCompleted(isCompleted);
    if (isCompleted) {
      setStep('rpe');
    } else {
      setStep('incomplete');
    }
  };

  const handleRPESelection = (selectedRPE: number) => {
    setRpe(selectedRPE);
    submitFeedback(true, selectedRPE, null, null, null);
  };

  const handleIncompleteSubmit = () => {
    if (repsDone > 0) {
      setStep('reason');
    }
  };

  const handleReasonSubmit = () => {
    submitFeedback(false, null, repsDone, reason, reasonDetails);
  };

  const submitFeedback = async (
    isCompleted: boolean,
    rpeValue: number | null,
    reps: number | null,
    failReason: 'pain' | 'fatigue' | 'other' | null,
    details: string | null
  ) => {
    const target = getTargetRPE();
    let needsAdjustment = false;
    let adjustmentType: 'increase' | 'decrease' | 'maintain' | null = null;

    if (isCompleted && rpeValue !== null) {
      if (rpeValue < target.min) {
        needsAdjustment = true;
        adjustmentType = 'increase';
      } else if (rpeValue > target.max) {
        needsAdjustment = true;
        adjustmentType = 'decrease';
      } else {
        adjustmentType = 'maintain';
      }
    } else if (!isCompleted) {
      needsAdjustment = true;
      adjustmentType = 'decrease';
    }

    const feedback: SetFeedback = {
      completed: isCompleted,
      rpe: rpeValue,
      repsDone: reps,
      reason: failReason,
      reasonDetails: details,
      needsAdjustment,
      adjustmentType,
    };

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('set_feedback').insert({
          user_id: userData.user.id,
          workout_id: workoutId,
          exercise_id: exerciseId,
          set_number: setNumber,
          completed: isCompleted,
          rpe: rpeValue,
          reps_done: reps,
          target_reps: targetReps,
          reason: failReason,
          reason_details: details,
          needs_adjustment: needsAdjustment,
          adjustment_type: adjustmentType,
          goal_type: goalType,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving set feedback:', error);
    }

    onComplete(feedback);
  };

  const renderRPEScale = () => {
    const rpeDescriptions: { [key: number]: string } = {
      1: 'Molto facile',
      2: 'Facile',
      3: 'Leggero',
      4: 'Moderato',
      5: 'Moderato+',
      6: 'Impegnativo',
      7: 'Difficile',
      8: 'Molto difficile',
      9: 'Quasi massimale',
      10: 'Massimale',
    };

    const targetRPE = getTargetRPE();

    return (
      <div className="rpe-scale space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Scala Borg RPE (1-10)</h3>
          <p className="text-sm text-gray-600">Quanto era faticosa questa serie?</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2">
            Target: {targetRPE.min}-{targetRPE.max}
          </p>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
            const isTarget = value >= targetRPE.min && value <= targetRPE.max;
            const isSelected = rpe === value;
            
            return (
              <button
                key={value}
                onClick={() => handleRPESelection(value)}
                className={`p-3 border-2 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-lg'
                    : isTarget
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 hover:bg-emerald-200'
                    : value >= 7
                    ? 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs mt-1 font-medium">{rpeDescriptions[value]}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (step === 'initial' || completed === null) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hai completato la serie?</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleInitialResponse(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors cursor-pointer"
            >
              ✅ Sì
            </button>
            <button
              onClick={() => handleInitialResponse(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors cursor-pointer"
            >
              ❌ No
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'rpe') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8">
          {renderRPEScale()}
        </div>
      </div>
    );
  }

  if (step === 'incomplete') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quante ripetizioni hai fatto?</h3>
          <input
            type="number"
            min="0"
            max={targetReps}
            value={repsDone}
            onChange={(e) => setRepsDone(parseInt(e.target.value) || 0)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg mb-6 text-lg font-bold text-center focus:outline-none focus:border-blue-500"
            placeholder={`Target: ${targetReps} reps`}
            autoFocus
          />
          <button
            onClick={handleIncompleteSubmit}
            disabled={repsDone === 0}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors cursor-pointer"
          >
            Continua
          </button>
        </div>
      </div>
    );
  }

  if (step === 'reason') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Perché non hai completato?</h3>
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => setReason('pain')}
              className={`p-4 border-2 rounded-lg font-semibold transition-all cursor-pointer ${
                reason === 'pain'
                  ? 'bg-red-500 text-white border-red-600'
                  : 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100'
              }`}
            >
              🩹 Dolore
            </button>
            <button
              onClick={() => setReason('fatigue')}
              className={`p-4 border-2 rounded-lg font-semibold transition-all cursor-pointer ${
                reason === 'fatigue'
                  ? 'bg-orange-500 text-white border-orange-600'
                  : 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100'
              }`}
            >
              💪 Fatica
            </button>
            <button
              onClick={() => setReason('other')}
              className={`p-4 border-2 rounded-lg font-semibold transition-all cursor-pointer ${
                reason === 'other'
                  ? 'bg-gray-500 text-white border-gray-600'
                  : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200'
              }`}
            >
              📝 Altro
            </button>
          </div>

          {reason && (
            <>
              <textarea
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Descrivi (opzionale)"
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-6 text-sm focus:outline-none focus:border-blue-500"
                rows={3}
              />
              <button
                onClick={handleReasonSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors cursor-pointer"
              >
                Invia
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PostSetScreening;
