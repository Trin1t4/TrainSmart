import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BodyCompositionResult {
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  bodyShape: string;
  healthRisk: string;
  method: string;
}

export default function BodyCompositionScan() {
  const navigate = useNavigate();
  
  const [measurements, setMeasurements] = useState({
    waistCm: '',
    neckCm: '',
    hipCm: ''
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BodyCompositionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recupera dati onboarding per sapere se maschio/femmina
  const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
  const isFemale = onboardingData.personalInfo?.gender === 'female';

  const analyzeMeasurements = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      if (!measurements.waistCm || !measurements.neckCm) {
        throw new Error('Inserisci almeno vita e collo');
      }

      if (isFemale && !measurements.hipCm) {
        throw new Error('Per le donne la misura fianchi è obbligatoria');
      }
      
      const response = await fetch('/api/body-composition-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: onboardingData.personalInfo.height,
          weight: onboardingData.personalInfo.weight,
          age: onboardingData.personalInfo.age,
          gender: onboardingData.personalInfo.gender,
          waistCm: parseFloat(measurements.waistCm),
          neckCm: parseFloat(measurements.neckCm),
          hipCm: measurements.hipCm ? parseFloat(measurements.hipCm) : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel calcolo');
      }
      
      const data = await response.json();
      setResults(data);
      
      // ✅ Salva in localStorage
      const updatedOnboarding = {
        ...onboardingData,
        bodyComposition: {
          bodyFatPercentage: data.bodyFatPercentage,
          fatMassKg: data.fatMassKg,
          leanMassKg: data.leanMassKg,
          bodyShape: data.bodyShape,
          healthRisk: data.healthRisk,
          method: 'us_navy_formula',
          measurements: {
            waistCm: parseFloat(measurements.waistCm),
            neckCm: parseFloat(measurements.neckCm),
            hipCm: measurements.hipCm ? parseFloat(measurements.hipCm) : null
          },
          scanDate: new Date().toISOString()
        }
      };
      localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
      
      // ✅ Salva su Supabase (se logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('body_scans').insert({
          user_id: user.id,
          body_fat_percentage: data.bodyFatPercentage,
          fat_mass_kg: data.fatMassKg,
          lean_mass_kg: data.leanMassKg,
          body_shape: data.bodyShape,
          health_risk: data.healthRisk,
          method: 'us_navy_formula',
          scan_date: new Date().toISOString()
        });
      }
      
    } catch (err: any) {
      console.error('[BODY SCAN] Error:', err);
      setError(err.message || 'Errore nel calcolo');
    } finally {
      setAnalyzing(false);
    }
  };

  const skipScan = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">📏 Composizione Corporea</h1>
          <p className="text-slate-300 mb-2">
            Calcola il tuo body fat % con la formula US Navy (accuracy 96%)
          </p>
          <p className="text-slate-400 text-sm">
            Serve solo un metro da sarta e 2-3 misure
          </p>
        </div>
        
        {/* ISTRUZIONI */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-blue-300 mb-3">📐 Come misurare correttamente:</p>
          <div className="space-y-3 text-sm text-blue-200">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">1.</span>
              <div>
                <strong>Circonferenza Vita:</strong> punto più stretto dell'addome (all'altezza ombelico), 
                a pancia rilassata, metro orizzontale
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">2.</span>
              <div>
                <strong>Circonferenza Collo:</strong> sotto il pomo d'Adamo, testa dritta, 
                metro orizzontale senza stringere
              </div>
            </div>
            {isFemale && (
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">3.</span>
                <div>
                  <strong>Circonferenza Fianchi:</strong> punto più largo dei glutei, 
                  piedi uniti, metro orizzontale
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* INPUT MISURE */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Circonferenza Vita (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                value={measurements.waistCm}
                onChange={(e) => setMeasurements({ ...measurements, waistCm: e.target.value })}
                placeholder="es. 85"
                className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Circonferenza Collo (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                value={measurements.neckCm}
                onChange={(e) => setMeasurements({ ...measurements, neckCm: e.target.value })}
                placeholder="es. 38"
                className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            {isFemale && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Circonferenza Fianchi (cm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={measurements.hipCm}
                  onChange={(e) => setMeasurements({ ...measurements, hipCm: e.target.value })}
                  placeholder="es. 95"
                  className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* ERRORE */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-300">⚠️ {error}</p>
          </div>
        )}
        
        {/* RISULTATI */}
        {results && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Risultati Analisi</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/50">
                <p className="text-xs text-emerald-300 mb-1">Body Fat %</p>
                <p className="text-3xl font-bold text-white">{results.bodyFatPercentage}%</p>
              </div>
              
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/50">
                <p className="text-xs text-blue-300 mb-1">Massa Magra</p>
                <p className="text-3xl font-bold text-white">{results.leanMassKg}kg</p>
              </div>
              
              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/50">
                <p className="text-xs text-purple-300 mb-1">Massa Grassa</p>
                <p className="text-2xl font-bold text-white">{results.fatMassKg}kg</p>
              </div>
              
              <div className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/50">
                <p className="text-xs text-amber-300 mb-1">Forma Corporea</p>
                <p className="text-lg font-bold text-white capitalize">{results.bodyShape.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-400 mb-2">ℹ️ Formula US Navy - Accuracy 96% vs DXA</p>
              <p className="text-xs text-slate-300">
                Questi dati verranno usati per calcolare il tuo livello fitness (30% del punteggio totale) 
                e personalizzare il programma di allenamento.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/quiz')}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition"
            >
              Continua con il Quiz →
            </button>
          </div>
        )}
        
        {/* BOTTONI AZIONE */}
        {!results && (
          <>
            <button
              onClick={analyzeMeasurements}
              disabled={!measurements.waistCm || !measurements.neckCm || (isFemale && !measurements.hipCm) || analyzing}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition mb-3"
            >
              {analyzing ? 'Calcolo in corso...' : 'Calcola Body Fat %'}
            </button>
            
            <button
              onClick={skipScan}
              disabled={analyzing}
              className="w-full bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-600 transition"
            >
              Salta (usa solo BMI) →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
