import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { estimate1RM } from '@trainsmart/shared';

// Test pratici di forza
const EXERCISES = [
  { name: 'Squat', type: 'lower', instruction: 'Massimo peso per 10 ripetizioni' },
  { name: 'Panca Piana', type: 'upper', instruction: 'Massimo peso per 10 ripetizioni' },
  { name: 'Stacco', type: 'lower', instruction: 'Massimo peso per 10 ripetizioni' },
  { name: 'Trazioni', type: 'upper', instruction: 'Massime ripetizioni o peso aggiunto' },
  { name: 'Military Press', type: 'upper', instruction: 'Massimo peso per 10 ripetizioni' }
];

export default function AssessmentFlow({ onComplete }) {
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [results, setResults] = useState({});
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('10');
  
  const exercise = EXERCISES[currentExercise];
  
  const handleNext = () => {
    // Salva risultato corrente
    if (weight) {
      setResults(prev => ({
        ...prev,
        [exercise.name]: { 
          weight: parseFloat(weight), 
          reps: parseInt(reps),
          oneRepMax: calculateOneRepMax(parseFloat(weight), parseInt(reps))
        }
      }));
    }
    
    // Prossimo esercizio o completa
    if (currentExercise < EXERCISES.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setWeight('');
      setReps('10');
    } else {
      handleComplete();
    }
  };
  
  const handleComplete = async () => {
    console.log('💪 Test pratici completati:', results);
    
    // Salva in localStorage
    localStorage.setItem('assessment_results', JSON.stringify({
      results,
      completedAt: new Date().toISOString()
    }));
    
    // Genera programma
    try {
      const response = await fetch('/api/program-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'test-user',
          assessmentId: 'assessment-' + Date.now(),
          assessmentData: results
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('generatedProgram', JSON.stringify(data.program || data));
        console.log('✅ Programma generato con test pratici');
      }
    } catch (error) {
      console.error('Errore generazione:', error);
    }
    
    // Vai alla dashboard
    navigate('/dashboard');
  };
  
  const handleSkip = () => {
    console.log('⏭️ Test pratici saltati');
    navigate('/dashboard');
  };
  
  const calculateOneRepMax = (weight: number, reps: number) => {
    return Math.round(estimate1RM(weight, reps));
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Test Pratici di Forza ({currentExercise + 1}/{EXERCISES.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{exercise.name}</h3>
              <p className="text-gray-400">{exercise.instruction}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Peso (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Es: 80"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Ripetizioni</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="10"
                />
              </div>
              
              {weight && reps && (
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-400">1RM stimato:</p>
                  <p className="text-xl font-bold text-green-400">
                    {calculateOneRepMax(parseFloat(weight), parseInt(reps))} kg
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {currentExercise < EXERCISES.length - 1 ? 'Prossimo' : 'Completa'}
              </Button>
              
              <Button 
                onClick={handleSkip}
                variant="outline"
                className="border-gray-600"
              >
                Salta Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
