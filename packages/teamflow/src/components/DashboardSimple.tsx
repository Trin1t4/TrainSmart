import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function DashboardSimple() {
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  
  useEffect(() => {
    // Recupera il programma salvato in localStorage
    const savedProgram = localStorage.getItem('programGenerated') || localStorage.getItem('generatedProgram');
    if (savedProgram) {
      setProgram(JSON.parse(savedProgram));
    }
  }, []);

  const startWorkout = () => {
    navigate('/workout');
  };

  const regenerateProgram = () => {
    // Pulisci e torna all'assessment
    localStorage.removeItem('generatedProgram');
    localStorage.removeItem('programGenerated');
    navigate('/assessment-home');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">La Tua Dashboard</h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {program ? '✅ Programma Pronto!' : '📋 Nessun Programma'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {program ? 'Il tuo programma personalizzato è stato generato' : 'Genera un nuovo programma'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {program && (
              <div className="bg-gray-700 p-4 rounded">
                <p className="mb-2">Nome: {program.name || 'Programma Personalizzato'}</p>
                <p className="mb-2">Split: {program.split || 'Full Body'}</p>
                <p className="mb-2">Giorni: {program.daysPerWeek || 3}/settimana</p>
                <p>Durata: {program.totalWeeks || 4} settimane</p>
              </div>
            )}
            
            <div className="flex gap-4">
              {program ? (
                <>
                  <Button onClick={startWorkout} className="bg-green-600 hover:bg-green-700">
                    Inizia Allenamento
                  </Button>
                  <Button onClick={regenerateProgram} variant="outline">
                    Nuovo Programma
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/onboarding')} className="bg-blue-600 hover:bg-blue-700">
                  Crea Programma
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
