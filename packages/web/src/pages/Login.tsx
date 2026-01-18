import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Aggiunto Link
import { supabase } from "../lib/supabaseClient";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"; // ✅ Icone
import { useTranslation } from '../lib/i18n';
import { usePrefetchCurrentProgram } from '../hooks/useProgram'; // ✅ Prefetch hook
import VideoMosaicBackground from '../components/VideoMosaicBackground';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const prefetchProgram = usePrefetchCurrentProgram(); // ✅ Prefetch hook
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(""); // Reset errore

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.session) {
      // Smart routing: controlla Supabase con Auth UUID
      try {
        const authUserId = data.session.user.id;
        console.log('[LOGIN] 🔍 Checking user data, authUserId:', authUserId);

        // 1. Check se ha programma attivo su Supabase
        const { data: programs, error: programError } = await supabase
          .from('training_programs')
          .select('id')
          .eq('user_id', authUserId)
          .eq('is_active', true)
          .limit(1);

        console.log('[LOGIN] 📊 Programs:', { programs, error: programError });

        if (!programError && programs && programs.length > 0) {
          console.log('[LOGIN] ✅ Has active program → dashboard');
          // ✅ Prefetch program data before navigation for instant load
          prefetchProgram();
          window.location.href = "/dashboard";
          return;
        }

        // 2. Check se ha completato onboarding su Supabase
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, onboarding_data')
          .eq('user_id', authUserId)
          .maybeSingle(); // ← usa maybeSingle invece di single per evitare errori se non esiste

        console.log('[LOGIN] 📋 Profile:', { profile, error: profileError });

        if (!profileError && profile?.onboarding_completed) {
          // Ha completato onboarding ma non ha programma → dashboard (genererà programma)
          console.log('[LOGIN] ℹ️ Has onboarding, no program → dashboard');
          window.location.href = "/dashboard";
          return;
        }

        // 3. Fallback: controlla localStorage
        const hasOnboarding = localStorage.getItem('onboarding_data');
        console.log('[LOGIN] 📂 localStorage onboarding:', !!hasOnboarding);

        if (hasOnboarding) {
          // Ha dati locali → dashboard
          console.log('[LOGIN] ℹ️ Has localStorage data → dashboard');
          window.location.href = "/dashboard";
        } else {
          // Nuovo utente → onboarding
          console.log('[LOGIN] 🆕 New user → slim-onboarding');
          window.location.href = "/slim-onboarding";
        }
      } catch (err) {
        console.error('[LOGIN] Error:', err);
        // Fallback sicuro: vai a dashboard che gestirà il caso
        window.location.href = "/dashboard";
      }
    } else {
      // fallback: redirect
      window.location.href = "/";
    }
  };

  // Permetti login con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Mosaic Background */}
      <VideoMosaicBackground videoCount={12} opacity={0.06} blur={2} />

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/50">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            Bentornato!
          </h1>
          <p className="text-slate-400">Accedi al tuo account</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 shadow-2xl animate-slide-up">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition">
                {t('auth.forgot_password')}
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('auth.login')}
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-slate-400">{t('auth.no_account')}</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full text-center bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-slate-600"
          >
            {t('auth.register')}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/terms-of-service" className="text-emerald-400 hover:text-emerald-300">Termini di Servizio</Link>
          {' '}&bull;{' '}
          <Link to="/privacy-policy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
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
