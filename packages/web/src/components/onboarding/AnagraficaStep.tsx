import { useState, useMemo } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

// Calcola età dalla data di nascita
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 && age < 120 ? age : null;
}

interface AnagraficaStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function AnagraficaStep({ data, onNext }: AnagraficaStepProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(data.anagrafica?.firstName || '');
  const [lastName, setLastName] = useState(data.anagrafica?.lastName || '');
  const [birthDate, setBirthDate] = useState(data.anagrafica?.birthDate || '');
  const [privacyAccepted, setPrivacyAccepted] = useState(data.anagrafica?.privacyAccepted || false);
  const [termsAccepted, setTermsAccepted] = useState(data.anagrafica?.termsAccepted || false);

  // Calcola età in tempo reale
  const calculatedAge = useMemo(() => calculateAge(birthDate), [birthDate]);

  const handleSubmit = () => {
    if (!firstName || !lastName || !privacyAccepted || !termsAccepted) return;

    onNext({
      anagrafica: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate || undefined,
        privacyAccepted,
        termsAccepted
      }
    });
  };

  const isValid = firstName.trim() && lastName.trim() && privacyAccepted && termsAccepted;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dati Anagrafici</h2>
        <p className="text-slate-400">Inserisci i tuoi dati personali per iniziare</p>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nome <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Il tuo nome"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Cognome */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cognome <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Il tuo cognome"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Data di Nascita (opzionale) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Data di Nascita <span className="text-slate-500 text-xs">(opzionale)</span>
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          {/* Mostra età calcolata */}
          {calculatedAge !== null && (
            <div className="mt-2 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              <span className="text-emerald-400 text-lg">🎂</span>
              <span className="text-emerald-400 font-semibold text-lg">{calculatedAge} anni</span>
              <span className="text-slate-400 text-sm ml-auto">Età calcolata automaticamente</span>
            </div>
          )}
        </div>
      </div>

      {/* Privacy & Terms */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
            required
          />
          <label htmlFor="privacy" className="text-sm text-slate-300 cursor-pointer">
            <span className="text-red-400">*</span> Accetto l'
            <a href="/privacy-policy" target="_blank" className="text-blue-400 hover:text-blue-300 underline mx-1">
              Informativa sulla Privacy
            </a>
            e autorizzo il trattamento dei miei dati personali secondo il GDPR.
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
            <span className="text-red-400">*</span> Accetto i
            <a href="/terms-of-service" target="_blank" className="text-blue-400 hover:text-blue-300 underline mx-1">
              Termini e Condizioni d'Uso
            </a>
            del servizio TrainSmart.
          </label>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          <span className="text-red-400">*</span> Campi obbligatori
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continua
      </button>
    </div>
  );
}
