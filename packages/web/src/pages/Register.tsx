import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import VideoMosaicBackground from '../components/VideoMosaicBackground';
import { saveConsents } from '@trainsmart/shared';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Consensi GDPR
  const [consents, setConsents] = useState({
    privacy: false,
    terms: false,
    dataProcessing: false,
    marketing: false, // opzionale
  });

  // Validazione password
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return t('auth.password_requirements');
    if (!/[A-Z]/.test(pass)) return t('auth.password_uppercase');
    if (!/[a-z]/.test(pass)) return 'Deve contenere almeno una lettera minuscola';
    if (!/[0-9]/.test(pass)) return t('auth.password_number');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validazioni
    if (!email || !password || !confirmPassword) {
      setError('Compila tutti i campi');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Inserisci un\'email valida');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwords_not_match'));
      return;
    }

    // Verifica consensi obbligatori
    if (!consents.privacy || !consents.terms || !consents.dataProcessing) {
      setError('Devi accettare Privacy Policy, Termini di Servizio e il trattamento dei dati per continuare');
      return;
    }

    try {
      setLoading(true);

      // Timestamp consensi
      const consentTimestamp = new Date().toISOString();

      // Registrazione con Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            created_at: consentTimestamp,
            consents: {
              privacy_accepted: consentTimestamp,
              terms_accepted: consentTimestamp,
              data_processing_accepted: consentTimestamp,
              marketing_accepted: consents.marketing ? consentTimestamp : null,
            }
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        // Profile is created automatically by database trigger (on_auth_user_created_profile)
        // No manual INSERT needed here - the trigger handles it with SECURITY DEFINER

        // Salva consensi nella tabella user_consents (GDPR compliant)
        try {
          await saveConsents(data.user.id, {
            privacy_policy: consents.privacy,
            terms_of_service: consents.terms,
            data_processing: consents.dataProcessing,
            health_data_processing: consents.dataProcessing, // Same as dataProcessing for health data
            marketing_emails: consents.marketing,
          }, {
            user_agent: navigator.userAgent
          });
        } catch (consentError) {
          console.error('Error saving consents to user_consents table:', consentError);
          // Non bloccare la registrazione per errore nei consensi
        }

        // Successo!
        setSuccess(true);
        
        // Se la conferma email è disabilitata, vai direttamente all'onboarding
        if (data.user.confirmed_at || data.session) {
          setTimeout(() => {
            navigate('/onboarding');
          }, 2000);
        }
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Gestisci errori comuni
      if (err.message?.includes('User already registered')) {
        setError('Questa email è già registrata. Prova ad accedere.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Email non valida');
      } else if (err.message?.includes('Password should be')) {
        setError('La password non rispetta i requisiti minimi');
      } else {
        setError(err.message || 'Errore durante la registrazione. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 12.5;
    return strength;
  };

  const strength = passwordStrength(password);
  const strengthColor = strength < 50 ? 'bg-red-500' : strength < 75 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthText = strength < 50 ? 'Debole' : strength < 75 ? 'Media' : 'Forte';

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
        <VideoMosaicBackground videoCount={12} opacity={0.06} blur={2} />
        <div className="max-w-md w-full relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-emerald-500 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Registrazione Completata! 🎉</h2>
            <p className="text-slate-300 mb-6">
              Controlla la tua email per confermare l'account. Se non hai ricevuto l'email, controlla lo spam.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Vai al Login
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Inizia Subito
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Video Mosaic Background */}
      <VideoMosaicBackground videoCount={12} opacity={0.06} blur={2} />

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/50">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            Crea il tuo Account
          </h1>
          <p className="text-slate-400">Inizia il tuo percorso fitness personalizzato</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 shadow-2xl animate-slide-up">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="nome@esempio.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Sicurezza password:</span>
                    <span className={`text-xs font-medium ${strength < 50 ? 'text-red-400' : strength < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mt-3 space-y-1">
                <div className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  Almeno 8 caratteri
                </div>
                <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  Maiuscole e minuscole
                </div>
                <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  Almeno un numero
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t('auth.passwords_not_match')}
                </p>
              )}
            </div>

            {/* Consensi GDPR */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Per creare il tuo account, devi accettare i seguenti consensi obbligatori.
                </p>
              </div>

              {/* Privacy Policy */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consents.privacy}
                  onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition">
                  Ho letto e accetto l'{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-emerald-400 hover:text-emerald-300 underline">
                    Informativa sulla Privacy
                  </Link>
                  {' '}<span className="text-red-400">*</span>
                </span>
              </label>

              {/* Terms of Service */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consents.terms}
                  onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition">
                  Accetto i{' '}
                  <Link to="/terms-of-service" target="_blank" className="text-emerald-400 hover:text-emerald-300 underline">
                    Termini di Servizio
                  </Link>
                  {' '}<span className="text-red-400">*</span>
                </span>
              </label>

              {/* Data Processing (per dati sanitari) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consents.dataProcessing}
                  onChange={(e) => setConsents({ ...consents, dataProcessing: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition">
                  Acconsento al trattamento dei miei dati relativi alla salute (zone di dolore, condizioni fisiche)
                  per la personalizzazione del programma di allenamento{' '}
                  <span className="text-red-400">*</span>
                </span>
              </label>

              {/* Marketing (opzionale) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consents.marketing}
                  onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition">
                  Desidero ricevere comunicazioni promozionali e aggiornamenti via email{' '}
                  <span className="text-slate-500">(opzionale)</span>
                </span>
              </label>

              <p className="text-xs text-slate-500 mt-2">
                <span className="text-red-400">*</span> Campi obbligatori
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword || !consents.privacy || !consents.terms || !consents.dataProcessing}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('auth.register')}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-slate-400">{t('auth.have_account')}</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full text-center bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-slate-600"
          >
            {t('auth.login')}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/terms-of-service" className="text-emerald-400 hover:text-emerald-300">Termini di Servizio</Link>
          {' '}&bull;{' '}
          <Link to="/privacy-policy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
          {' '}&bull;{' '}
          <Link to="/cookie-policy" className="text-emerald-400 hover:text-emerald-300">Cookie Policy</Link>
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
      `}</style>
    </div>
  );
}
