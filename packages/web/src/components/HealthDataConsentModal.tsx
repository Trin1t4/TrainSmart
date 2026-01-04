/**
 * ============================================================================
 * HEALTH DATA CONSENT MODAL - TrainSmart
 * ============================================================================
 *
 * Modal per raccolta consenso esplicito al trattamento dati sanitari.
 * Conforme Art. 9 GDPR - Consenso esplicito per categorie particolari di dati.
 *
 * QUANDO MOSTRARLO:
 * - Prima di raccogliere pain_areas nell'onboarding
 * - Prima di raccogliere injury_history
 * - Prima di attivare tracking ciclo mestruale
 * - Quando l'utente attiva funzionalità che richiedono dati sanitari
 */

import { useState, useEffect } from 'react';
import {
  Shield,
  Heart,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  getHealthConsentText,
  saveConsents,
  getConsents,
  hasHealthDataConsent,
  LEGAL_DOCUMENT_VERSIONS
} from '@trainsmart/shared';

interface HealthDataConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  userId: string;
  language?: 'it' | 'en';
  /** Se true, l'utente può procedere senza consenso (ma senza dati sanitari) */
  allowSkip?: boolean;
}

export default function HealthDataConsentModal({
  isOpen,
  onAccept,
  onDecline,
  userId,
  language = 'it',
  allowSkip = true
}: HealthDataConsentModalProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const content = getHealthConsentText(language);

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!confirmed) return;

    setSaving(true);
    try {
      const result = await saveConsents(userId, {
        health_data_processing: true
      }, {
        user_agent: navigator.userAgent
      });

      if (result.success) {
        onAccept();
      } else {
        alert(language === 'it'
          ? 'Errore nel salvataggio. Riprova.'
          : 'Error saving consent. Please try again.');
      }
    } catch (error) {
      console.error('Error saving health consent:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    setSaving(true);
    try {
      await saveConsents(userId, {
        health_data_processing: false
      });
      onDecline();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {content.title}
              </h2>
              <p className="text-sm text-slate-400">
                {language === 'it' ? 'Articolo 9 GDPR' : 'GDPR Article 9'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Descrizione principale */}
          <p className="text-slate-300 leading-relaxed">
            {content.description}
          </p>

          {/* Tipi di dati raccolti */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              {language === 'it' ? 'Dati che raccogliamo:' : 'Data we collect:'}
            </h3>
            <ul className="space-y-2">
              {content.dataTypes.map((type, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>{type}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Finalità */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              <strong>{language === 'it' ? 'Finalità:' : 'Purpose:'}</strong>{' '}
              {content.purpose}
            </p>
          </div>

          {/* Dettagli espandibili */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg text-slate-300 hover:bg-slate-700/50 transition"
          >
            <span className="text-sm font-medium">
              {language === 'it' ? 'Dettagli e diritti' : 'Details and rights'}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {expanded && (
            <div className="space-y-4 text-sm text-slate-400 animate-in slide-in-from-top-2">
              {/* Diritti */}
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-amber-400 mt-0.5" />
                <p>{content.rights}</p>
              </div>

              {/* Sicurezza */}
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 mt-0.5" />
                <p>
                  {language === 'it'
                    ? 'I tuoi dati sono criptati e conservati in server UE conformi al GDPR.'
                    : 'Your data is encrypted and stored on GDPR-compliant EU servers.'}
                </p>
              </div>

              {/* Link privacy policy */}
              <a
                href="/privacy-policy"
                target="_blank"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
              >
                <ExternalLink className="w-4 h-4" />
                {language === 'it' ? 'Leggi la Privacy Policy completa' : 'Read full Privacy Policy'}
              </a>

              {/* Versione documento */}
              <p className="text-xs text-slate-500">
                {language === 'it' ? 'Versione documento:' : 'Document version:'}{' '}
                {LEGAL_DOCUMENT_VERSIONS.health_data_consent}
              </p>
            </div>
          )}

          {/* Warning se rifiuta */}
          {allowSkip && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm">
                {language === 'it'
                  ? 'Se non acconsenti, potrai comunque usare l\'app ma senza le funzionalità di adattamento al dolore e gestione infortuni.'
                  : 'If you don\'t consent, you can still use the app but without pain adaptation and injury management features.'}
              </p>
            </div>
          )}

          {/* Checkbox conferma */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-all ${
                confirmed
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-slate-500 group-hover:border-slate-400'
              }`}>
                {confirmed && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
            <span className="text-slate-300 text-sm leading-relaxed">
              {language === 'it'
                ? 'Ho letto e compreso le informazioni sopra riportate e acconsento esplicitamente al trattamento dei miei dati relativi alla salute per le finalità indicate.'
                : 'I have read and understood the information above and explicitly consent to the processing of my health-related data for the purposes indicated.'}
            </span>
          </label>
        </div>

        {/* Footer con bottoni */}
        <div className="sticky bottom-0 bg-slate-800 p-6 border-t border-slate-700 flex gap-3">
          {allowSkip && (
            <button
              onClick={handleDecline}
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition disabled:opacity-50"
            >
              {saving ? '...' : (language === 'it' ? 'Non acconsento' : 'I do not consent')}
            </button>
          )}

          <button
            onClick={handleAccept}
            disabled={!confirmed || saving}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              confirmed
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                {language === 'it' ? 'Acconsento' : 'I consent'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK per gestire quando mostrare il modal
// ============================================================================

/**
 * Hook per verificare se serve il consenso dati sanitari
 */
export function useHealthConsentCheck(userId: string | null) {
  const [needsConsent, setNeedsConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      if (!userId) {
        setNeedsConsent(null);
        setLoading(false);
        return;
      }

      try {
        const result = await getConsents(userId);

        if (result.success && result.data) {
          const consents = result.data.consents.reduce((acc, c) => {
            acc[c.consent_type] = c.granted;
            return acc;
          }, {} as Record<string, boolean>);

          setNeedsConsent(!hasHealthDataConsent(consents));
        } else {
          // Nessun consenso salvato = serve consenso
          setNeedsConsent(true);
        }
      } catch (error) {
        console.error('Error checking health consent:', error);
        setNeedsConsent(true);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [userId]);

  return { needsConsent, loading };
}
