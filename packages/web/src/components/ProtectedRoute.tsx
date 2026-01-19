import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: ReactNode;
  requireEmailConfirmation?: boolean;
}

export default function ProtectedRoute({ children, requireEmailConfirmation = true }: Props) {
  const { isAuthenticated, isEmailConfirmed, isLoading } = useAuth();

  if (isLoading) {
    // Simple loading placeholder while auth state is determined
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-3">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Non autenticato → redirect a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticato ma email non confermata (e richiesta) → mostra messaggio
  if (requireEmailConfirmation && !isEmailConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-amber-500/50 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Conferma la tua Email</h2>
          <p className="text-slate-300 mb-6">
            Per accedere devi prima confermare la tua email. Controlla la tua casella di posta (anche lo spam).
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
