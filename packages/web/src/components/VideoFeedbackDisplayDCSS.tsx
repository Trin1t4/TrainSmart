/**
 * VIDEO FEEDBACK DISPLAY COMPONENT - Educational Approach
 * 
 * Componente per visualizzare il feedback dell'analisi video.
 * Approccio DCSS: educational, non giudicante, con scelta all'utente.
 * 
 * PRINCIPI:
 * 1. Osservazioni, non errori
 * 2. Contesto sempre fornito (perché potrebbe succedere)
 * 3. Scelta all'utente (vuoi lavorarci? va bene così?)
 * 4. Disclaimer sulla precisione
 * 5. Note individuali basate su morfotipo
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Info, 
  BookOpen, 
  User, 
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Observation {
  id: string;
  type: 'technique' | 'efficiency' | 'individual';
  severity: 'note' | 'suggestion' | 'attention' | 'concern';
  observation: string;
  observationIt: string;
  context: string;
  contextIt: string;
  suggestion: string;
  suggestionIt: string;
  askUser?: string;
  askUserIt?: string;
  reference?: string;
}

interface VideoFeedbackProps {
  exerciseName: string;
  exerciseNameIt: string;
  date: string;
  observations: Observation[];
  individualNotes?: string[];
  romStatus?: Record<string, 'below' | 'acceptable' | 'typical' | 'above'>;
  onWantSuggestions?: (observationId: string) => void;
  onDismiss?: (observationId: string) => void;
  language?: 'it' | 'en';
}

// ============================================================================
// SEVERITY CONFIG - Non-alarming colors and icons
// ============================================================================

const SEVERITY_CONFIG = {
  note: {
    color: 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600',
    textColor: 'text-slate-700 dark:text-slate-300',
    icon: '📊',
    label: { it: 'Osservazione', en: 'Observation' }
  },
  suggestion: {
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: '💡',
    label: { it: 'Suggerimento', en: 'Suggestion' }
  },
  attention: {
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: '📝',
    label: { it: 'Nota', en: 'Note' }
  },
  concern: {
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: '⚠️',
    label: { it: 'Attenzione', en: 'Attention' }
  }
};

const TYPE_CONFIG = {
  technique: {
    icon: '🎯',
    label: { it: 'Tecnica', en: 'Technique' }
  },
  efficiency: {
    icon: '⚡',
    label: { it: 'Efficienza', en: 'Efficiency' }
  },
  individual: {
    icon: '👤',
    label: { it: 'Individuale', en: 'Individual' }
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VideoFeedbackDisplay({
  exerciseName,
  exerciseNameIt,
  date,
  observations,
  individualNotes,
  romStatus,
  onWantSuggestions,
  onDismiss,
  language = 'it'
}: VideoFeedbackProps) {
  const [expandedObservations, setExpandedObservations] = useState<Set<string>>(new Set());
  const [dismissedObservations, setDismissedObservations] = useState<Set<string>>(new Set());
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const t = (obj: { it: string; en: string }) => obj[language];

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedObservations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedObservations(newSet);
  };

  const handleDismiss = (id: string) => {
    setDismissedObservations(prev => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const visibleObservations = observations.filter(o => !dismissedObservations.has(o.id));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              📊 {t({ it: 'Analisi del Movimento', en: 'Movement Analysis' })}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'it' ? exerciseNameIt : exerciseName} • {date}
            </p>
          </div>
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title={t({ it: 'Info sulla precisione', en: 'Accuracy info' })}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer - Collapsible */}
        {showDisclaimer && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>ℹ️ {t({ it: 'Nota sulla precisione', en: 'Accuracy note' })}:</strong>{' '}
              {t({
                it: 'Questa analisi usa la fotocamera del telefono che ha precisione limitata (±5-10° sugli angoli). È uno strumento educational, non diagnostico. Per una valutazione accurata, consulta un coach o fisioterapista di persona.',
                en: 'This analysis uses your phone camera which has limited precision (±5-10° on angles). It\'s an educational tool, not diagnostic. For accurate assessment, consult an in-person coach or physiotherapist.'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary - No score, qualitative instead */}
        {visibleObservations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              {t({ it: 'Movimento controllato', en: 'Controlled movement' })}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t({
                it: 'Nessuna osservazione particolare da segnalare. Continua così!',
                en: 'No particular observations to report. Keep it up!'
              })}
            </p>
          </div>
        ) : (
          <>
            {/* Quick Summary */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                {t({ it: 'Riepilogo', en: 'Summary' })}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t({
                  it: `${visibleObservations.length} osservazioni rilevate. Queste NON sono necessariamente errori - sono pattern che abbiamo notato. Rivedi e decidi se vuoi lavorarci.`,
                  en: `${visibleObservations.length} observations detected. These are NOT necessarily errors - they're patterns we noticed. Review and decide if you want to work on them.`
                })}
              </p>
            </div>

            {/* Observations List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t({ it: 'Osservazioni', en: 'Observations' })}
              </h3>

              {visibleObservations.map((obs) => {
                const severityConfig = SEVERITY_CONFIG[obs.severity];
                const typeConfig = TYPE_CONFIG[obs.type];
                const isExpanded = expandedObservations.has(obs.id);

                return (
                  <div
                    key={obs.id}
                    className={`rounded-xl border ${severityConfig.color} overflow-hidden transition-all`}
                  >
                    {/* Observation Header */}
                    <button
                      onClick={() => toggleExpand(obs.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{severityConfig.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityConfig.color} ${severityConfig.textColor}`}>
                              {t(severityConfig.label)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {typeConfig.icon} {t(typeConfig.label)}
                            </span>
                          </div>
                          <p className={`font-medium ${severityConfig.textColor}`}>
                            {language === 'it' ? obs.observationIt : obs.observation}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4">
                        {/* Context - Why this might happen */}
                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <HelpCircle className="w-4 h-4" />
                            {t({ it: 'Perché potrebbe succedere', en: 'Why this might happen' })}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {language === 'it' ? obs.contextIt : obs.context}
                          </p>
                        </div>

                        {/* Suggestion */}
                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            💡 {t({ it: 'Se vuoi lavorarci', en: 'If you want to work on it' })}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {language === 'it' ? obs.suggestionIt : obs.suggestion}
                          </p>
                        </div>

                        {/* Reference if available */}
                        {obs.reference && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {obs.reference}
                          </p>
                        )}

                        {/* User Choice Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {obs.askUserIt && (
                            <p className="w-full text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {language === 'it' ? obs.askUserIt : obs.askUser}
                            </p>
                          )}
                          <button
                            onClick={() => onWantSuggestions?.(obs.id)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {t({ it: 'Sì, dammi suggerimenti', en: 'Yes, give me suggestions' })}
                          </button>
                          <button
                            onClick={() => handleDismiss(obs.id)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                          >
                            {t({ it: 'Va bene così per me', en: 'It\'s fine for me' })}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Individual Notes based on Morphotype */}
        {individualNotes && individualNotes.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t({ it: 'Note per la tua struttura', en: 'Notes for your build' })}
            </h3>
            <ul className="space-y-2">
              {individualNotes.map((note, index) => (
                <li key={index} className="text-sm text-purple-600 dark:text-purple-400 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ROM Status - Optional */}
        {romStatus && Object.keys(romStatus).length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
              {t({ it: 'Range di Movimento', en: 'Range of Motion' })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(romStatus).map(([angle, status]) => (
                <div key={angle} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {angle.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-sm font-medium ${
                    status === 'typical' ? 'text-emerald-500' :
                    status === 'acceptable' ? 'text-blue-500' :
                    'text-amber-500'
                  }`}>
                    {status === 'typical' ? '✓ Tipico' :
                     status === 'acceptable' ? '○ Accettabile' :
                     status === 'below' ? '↓ Sotto range' : '↑ Sopra range'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Note */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <strong>{t({ it: 'Ricorda', en: 'Remember' })}:</strong>{' '}
            {t({
              it: 'Queste osservazioni sono informazioni, non giudizi. Se il movimento non ti causa fastidio e raggiungi i tuoi obiettivi, potrebbe essere perfetto per te. La "tecnica perfetta" universale non esiste.',
              en: 'These observations are information, not judgments. If the movement doesn\'t cause discomfort and you\'re reaching your goals, it might be perfect for you. Universal "perfect technique" doesn\'t exist.'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { Observation, VideoFeedbackProps };
