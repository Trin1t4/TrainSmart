import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function BodyCompositionScan() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    sideLeft: null,
    sideRight: null
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // ✅ CATTURA FOTO
  const capturePhoto = async (position: 'front' | 'back' | 'sideLeft' | 'sideRight') => {
    // Usa camera API o file upload
    const file = await openCamera(position);
    setPhotos({ ...photos, [position]: file });
  };

  // ✅ ANALIZZA CON AI
  const analyzeBodyComposition = async () => {
    setAnalyzing(true);
    
    const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
    
    // Prepara dati
    const formData = new FormData();
    formData.append('front', photos.front);
    formData.append('back', photos.back);
    formData.append('height', onboardingData.personalInfo.height);
    formData.append('weight', onboardingData.personalInfo.weight);
    formData.append('age', onboardingData.personalInfo.age);
    formData.append('gender', onboardingData.personalInfo.gender);
    
    // ✅ CHIAMA API AI (usa servizio esterno o implementa CNN)
    const response = await fetch('/api/body-composition/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    setResults({
      bodyFatPercentage: data.bodyFatPercentage,
      fatMassKg: data.fatMassKg,
      leanMassKg: data.leanMassKg,
      bodyShape: data.bodyShape, // 'apple', 'pear', 'hourglass', etc.
      proportions: data.proportions // ratios
    });
    
    // Salva su Supabase
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
    
    // Salva localmente
    const updatedOnboarding = {
      ...onboardingData,
      bodyComposition: results
    };
    localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
    
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">📸 Scansione Corporea</h1>
        <p className="text-slate-300 mb-8">
          Scatta 2-4 foto per analizzare la tua composizione corporea con AI
        </p>
        
        {/* ISTRUZIONI */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 mb-6">
          <p className="text-sm text-blue-300 mb-3">💡 Per risultati accurati:</p>
          <ul className="text-sm text-blue-200 space-y-2">
            <li>• Indossa abbigliamento aderente (pantaloncini + top)</li>
            <li>• Piedi alla larghezza spalle, braccia leggermente divaricate</li>
            <li>• Sfondo neutro, buona illuminazione</li>
            <li>• Camera a 2 metri di distanza, altezza vita</li>
          </ul>
        </div>
        
        {/* CATTURA FOTO */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <PhotoCapture position="front" label="Fronte" onCapture={capturePhoto} photo={photos.front} />
          <PhotoCapture position="back" label="Retro" onCapture={capturePhoto} photo={photos.back} />
          <PhotoCapture position="sideLeft" label="Lato Sx (opzionale)" onCapture={capturePhoto} photo={photos.sideLeft} />
          <PhotoCapture position="sideRight" label="Lato Dx (opzionale)" onCapture={capturePhoto} photo={photos.sideRight} />
        </div>
        
        {/* BOTTONE ANALISI */}
        <button
          onClick={analyzeBodyComposition}
          disabled={!photos.front || !photos.back || analyzing}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg"
        >
          {analyzing ? 'Analisi in corso...' : 'Analizza Composizione Corporea →'}
        </button>
        
        {/* RISULTATI */}
        {results && (
          <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Risultati</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/20 rounded-lg p-4">
                <p className="text-sm text-emerald-300">Body Fat %</p>
                <p className="text-3xl font-bold text-white">{results.bodyFatPercentage}%</p>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">Massa Magra</p>
                <p className="text-3xl font-bold text-white">{results.leanMassKg}kg</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold"
            >
              Continua con il Quiz →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoCapture({ position, label, onCapture, photo }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-sm text-slate-300 mb-3">{label}</p>
      {photo ? (
        <div className="relative">
          <img src={URL.createObjectURL(photo)} className="w-full h-40 object-cover rounded" />
          <button
            onClick={() => onCapture(position)}
            className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded text-sm"
          >
            Riprendi
          </button>
        </div>
      ) : (
        <button
          onClick={() => onCapture(position)}
          className="w-full h-40 border-2 border-dashed border-slate-600 rounded flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition"
        >
          📷 Scatta
        </button>
      )}
    </div>
  );
}
