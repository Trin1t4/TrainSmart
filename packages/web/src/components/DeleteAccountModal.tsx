import { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
  onSuccess
}: DeleteAccountModalProps) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmEmail.toLowerCase() !== userEmail.toLowerCase()) {
      setError('L\'email inserita non corrisponde');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Sessione non valida. Effettua nuovamente il login.');
        return;
      }

      // Call the delete endpoint
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ confirmEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Errore durante la cancellazione');
      }

      // Success - clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      onSuccess();

    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.message || 'Si è verificato un errore. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('warning');
    setConfirmEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'warning' ? (
          /* Step 1: Warning */
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Elimina Account</h3>
                <p className="text-sm text-slate-400">Questa azione è irreversibile</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-200 font-medium mb-2">
                  Eliminando il tuo account perderai:
                </p>
                <ul className="text-sm text-red-200/80 space-y-1 list-disc list-inside">
                  <li>Tutti i tuoi dati personali</li>
                  <li>Lo storico degli allenamenti</li>
                  <li>I programmi personalizzati</li>
                  <li>Le statistiche e i progressi</li>
                  <li>L'abbonamento attivo (senza rimborso)</li>
                </ul>
              </div>

              <p className="text-sm text-slate-300">
                In conformità al GDPR, tutti i tuoi dati personali saranno eliminati
                permanentemente dai nostri server entro 30 giorni.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
              >
                Annulla
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Continua
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Confirm with email */
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Conferma Eliminazione</h3>
                <p className="text-sm text-slate-400">Inserisci la tua email per confermare</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Digita <span className="text-white font-mono">{userEmail}</span> per confermare
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Inserisci la tua email"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('warning')}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                Indietro
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmEmail.toLowerCase() !== userEmail.toLowerCase()}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Elimina Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
