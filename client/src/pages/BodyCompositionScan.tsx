import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BodyCompositionResult {
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  bodyShape: string;
}

export default function BodyCompositionScan() {
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState<{
    front: File | null;
    back: File | null;
  }>({
    front: null,
    back: null
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BodyCompositionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ CATTURA FOTO
  const capturePhoto = (position: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotos({ ...photos, [position]: file });
      setError(null);
    }
  };

  // ✅ HELPER: Converti File a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ✅ ANALIZZA CON AI
  const analyzeBodyComposition = async () => {
    if (!photos.front || !photos.back) {
      setError('Carica entrambe le foto (fronte e retro)');
      return;
    }

    setAnalyzing(true);
    setError(null);
    
    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      
      if (!onboardingData.personalInfo) {
        throw new Error('Dati personali mancanti');
      }
      
      // Converti immagini a base64
      const frontBase64 = await fileToBase64(photos.front);
      const backBase64 = await fileToBase64(photos.back);
      
      console.log('[BODY SCAN] Sending analysis request...');
      
      // Chiama API
      const response = await fetch('/api/body-composition-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontBase64,
          backImage: backBase64,
          height: onboardingData.personalInfo.height,
          weight: onboardingData.personalInfo.weight,
          age: onboardingData.personalInfo.age,
          gender: onboardingData.personalInfo.gender
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Errore durante l\'analisi');
      }
      
      const data = await response.json();
      
      console.log('[BODY SCAN] Analysis complete:', data);
      
      setResults({
        bodyFatPercentage: data.bodyFatPercentage,
        fatMassKg: data.fatMassKg,
        leanMassKg: data.leanMassKg,
        bodyShape: data.bodyShape
      });
      
      // ✅ Salva in localStorage
      const updatedOnboarding = {
        ...onboardingData,
        bodyComposition: {
          bodyFatPercentage: data.bodyFatPercentage,
          fatMassKg: data.fatMassKg,
          leanMassKg: data.leanMassKg,
          bodyShape: data.bodyShape,
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
          scan_date: new Date().toISOString()
        });
      }
      
    } catch (err: any) {
      console.error('[BODY SCAN] Error:', err);
      setError(err.message || 'Errore durante l\'analisi. Riprova.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ✅ SKIP (opzionale)
  const skipScan = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">📸 Scansione Corporea AI</h1>
          <p className="text-slate-300 mb-2">
            Analizza la tua composizione corporea con intelligenza artificiale
          </p>
          <p className="text-slate-400 text-sm">
            Stima body fat %, massa magra e forma corporea da 2 foto
          </p>
        </div>
        
        {/* ISTRUZIONI */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-blue-300 mb-3">💡 Per risultati accurati:</p>
          <ul className="text-sm text-blue-200 space-y-2">
            <li>✓ Indossa abbigliamento aderente (pantaloncini + top/reggiseno sportivo)</li>
            <li>✓ Posizione neutra: piedi alla larghezza spalle, braccia lungo i fianchi</li>
            <li>✓ Sfondo neutro e buona illuminazione naturale</li>
            <li>✓ Camera a 2-3 metri di distanza, altezza torace</li>
            <li>✓ Foto frontale a corpo intero + foto posteriore</li>
          </ul>
        </div>
        
        {/* CATTURA FOTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <PhotoCapture 
            position="front" 
            label="Foto Frontale" 
            icon="🧍"
            photo={photos.front} 
            onCapture={(e) => capturePhoto('front', e)} 
          />
          <PhotoCapture 
            position="back" 
            label="Foto Posteriore" 
            icon="🧍"
            photo={photos.back} 
            onCapture={(e) => capturePhoto('back', e)} 
          />
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
                <p className="text-lg font-bold text-white capitalize">{results.bodyShape}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-400 mb-2">ℹ️ Questi dati verranno usati per:</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Calcolo preciso del tuo livello fitness (30% del punteggio)</li>
                <li>• Personalizzazione del programma di allenamento</li>
                <li>• Tracking progressi nel tempo</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate('/quiz')}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
            >
              Continua con il Quiz →
            </button>
          </div>
        )}
        
        {/* BOTTONI AZIONE */}
        {!results && (
          <>
            <button
              onClick={analyzeBodyComposition}
              disabled={!photos.front || !photos.back || analyzing}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition mb-3"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Analisi in corso...
                </span>
              ) : (
                'Analizza Composizione Corporea →'
              )}
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

// ✅ COMPONENTE FOTO CAPTURE
interface PhotoCaptureProps {
  position: 'front' | 'back';
  label: string;
  icon: string;
  photo: File | null;
  onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PhotoCapture({ position, label, icon, photo, onCapture }: PhotoCaptureProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-sm text-slate-300 mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {label}
      </p>
      
      {photo ? (
        <div className="relative">
          <img 
            src={URL.createObjectURL(photo)} 
            alt={label}
            className="w-full h-48 object-cover rounded-lg" 
          />
          <label 
            htmlFor={`${position}-input`}
            className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-600 transition"
          >
            Cambia
          </label>
          <input
            id={`${position}-input`}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCapture}
            className="hidden"
          />
        </div>
      ) : (
        <label 
          htmlFor={`${position}-input`}
          className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition cursor-pointer"
        >
          <span className="text-4xl mb-2">📷</span>
          <span className="text-sm font-medium">Scatta o Carica</span>
          <input
            id={`${position}-input`}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCapture}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
