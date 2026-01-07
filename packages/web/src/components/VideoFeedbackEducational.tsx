/**
 * VIDEO FEEDBACK COMPONENT - Educational Paradigm
 * 
 * Componente React per mostrare feedback video in modo educational,
 * non giudicante. Basato su DCSS di Evangelista.
 * 
 * PRINCIPI:
 * 1. Osservazioni, non errori
 * 2. Contesto sempre fornito
 * 3. L'utente decide se agire
 * 4. Disclaimer sulla precisione
 * 5. Niente score numerici - solo feedback qualitativo
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  MessageCircle,
  BookOpen,
  User,
  HelpCircle,
  ThumbsUp,
  Settings
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
  observations: Observation[];
  individualNotes?: string[];
  timestamp?: string;
  language?: 'en' | 'it';
  onUserResponse?: (observationId: string, wantsSuggestions: boolean) => void;
  onDismiss?: () => void;
}

interface ObservationCardProps {
  observation: Observation;
  language: 'en' | 'it';
  onResponse?: (wantsSuggestions: boolean) => void;
}

// ============================================================================
// SEVERITY STYLING
// ============================================================================

const getSeverityStyle = (severity: Observation['severity']) => {
  switch (severity) {
    case 'note':
      return {
        bg: 'bg-slate-700/50',
        border: 'border-slate-600',
        icon: '📊',
        iconColor: 'text-slate-400',
        label: { en: 'Note', it: 'Nota' }
      };
    case 'suggestion':
      return {
        bg: 'bg-blue-900/30',
        border: 'border-blue-700/50',
        icon: '💡',
        iconColor: 'text-blue-400',
        label: { en: 'Suggestion', it: 'Suggerimento' }
      };
    case 'attention':
      return {
        bg: 'bg-amber-900/30',
        border: 'border-amber-700/50',
        icon: '📋',
        iconColor: 'text-amber-400',
        label: { en: 'Worth noting', it: 'Da considerare' }
      };
    case 'concern':
      return {
        bg: 'bg-orange-900/30',
        border: 'border-orange-700/50',
        icon: '⚠️',
        iconColor: 'text-orange-400',
        label: { en: 'Attention', it: 'Attenzione' }
      };
  }
};

const getTypeLabel = (type: Observation['type'], language: 'en' | 'it') => {
  const labels = {
    technique: { en: 'Technique', it: 'Tecnica' },
    efficiency: { en: 'Efficiency', it: 'Efficienza' },
    individual: { en: 'Individual', it: 'Individuale' }
  };
  return labels[type][language];
};

// ============================================================================
// OBSERVATION CARD COMPONENT
// ============================================================================

const ObservationCard: React.FC<ObservationCardProps> = ({ 
  observation, 
  language,
  onResponse 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [responded, setResponded] = useState(false);
  
  const style = getSeverityStyle(observation.severity);
  const text = {
    observation: language === 'it' ? observation.observationIt : observation.observation,
    context: language === 'it' ? observation.contextIt : observation.context,
    suggestion: language === 'it' ? observation.suggestionIt : observation.suggestion,
    askUser: language === 'it' ? observation.askUserIt : observation.askUser
  };
  
  const handleResponse = (wantsSuggestions: boolean) => {
    setResponded(true);
    onResponse?.(wantsSuggestions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-2xl">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.iconColor}`}>
              {style.label[language]}
            </span>
            <span className="text-xs text-slate-500">
              {getTypeLabel(observation.type, language)}
            </span>
          </div>
          <p className="text-white font-medium">{text.observation}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Context */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">
                    {language === 'it' ? 'Contesto' : 'Context'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{text.context}</p>
              </div>

              {/* Suggestion */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">
                    {language === 'it' ? 'Suggerimento' : 'Suggestion'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{text.suggestion}</p>
              </div>

              {/* Reference if available */}
              {observation.reference && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen className="w-3 h-3" />
                  <span>{observation.reference}</span>
                </div>
              )}

              {/* Ask User Section */}
              {text.askUser && !responded && (
                <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">
                      {language === 'it' ? 'Domanda per te' : 'Question for you'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{text.askUser}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(true)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {language === 'it' ? 'Sì, dammi suggerimenti' : 'Yes, show suggestions'}
                    </button>
                    <button
                      onClick={() => handleResponse(false)}
                      className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {language === 'it' ? 'No, va bene così' : 'No, I\'m fine'}
                    </button>
                  </div>
                </div>
              )}

              {/* Response Confirmation */}
              {responded && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{language === 'it' ? 'Risposta registrata' : 'Response recorded'}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// MAIN VIDEO FEEDBACK COMPONENT
// ============================================================================

export const VideoFeedbackEducational: React.FC<VideoFeedbackProps> = ({
  exerciseName,
  exerciseNameIt,
  observations,
  individualNotes,
  timestamp,
  language = 'it',
  onUserResponse,
  onDismiss
}) => {
  const name = language === 'it' ? exerciseNameIt : exerciseName;
  
  // Group observations by type
  const techniqueObs = observations.filter(o => o.type === 'technique');
  const efficiencyObs = observations.filter(o => o.type === 'efficiency');
  const individualObs = observations.filter(o => o.type === 'individual');
  
  const hasObservations = observations.length > 0;
  
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-white">
              {language === 'it' ? 'Analisi del Movimento' : 'Movement Analysis'}
            </h2>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <span className="font-medium text-white">{name}</span>
          {timestamp && (
            <>
              <span>•</span>
              <span>{timestamp}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* No Observations - All Good */}
        {!hasObservations && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'it' ? 'Movimento controllato' : 'Controlled movement'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {language === 'it' 
                ? 'Non abbiamo osservazioni particolari da segnalare. Il movimento appare controllato e appropriato.'
                : 'No particular observations to note. Movement appears controlled and appropriate.'}
            </p>
          </div>
        )}

        {/* Observations */}
        {hasObservations && (
          <>
            {/* Section Header */}
            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'it' 
                  ? `${observations.length} osservazion${observations.length === 1 ? 'e' : 'i'}` 
                  : `${observations.length} observation${observations.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {/* Technique Observations */}
            {techniqueObs.length > 0 && (
              <div className="space-y-3">
                {techniqueObs.map(obs => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    language={language}
                    onResponse={(wants) => onUserResponse?.(obs.id, wants)}
                  />
                ))}
              </div>
            )}

            {/* Efficiency Observations */}
            {efficiencyObs.length > 0 && (
              <div className="space-y-3">
                {efficiencyObs.map(obs => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    language={language}
                    onResponse={(wants) => onUserResponse?.(obs.id, wants)}
                  />
                ))}
              </div>
            )}

            {/* Individual Notes */}
            {individualObs.length > 0 && (
              <div className="space-y-3">
                {individualObs.map(obs => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    language={language}
                    onResponse={(wants) => onUserResponse?.(obs.id, wants)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Individual/Morphotype Notes */}
        {individualNotes && individualNotes.length > 0 && (
          <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-purple-300">
                {language === 'it' ? 'Note per la tua struttura' : 'Notes for your build'}
              </span>
            </div>
            <ul className="space-y-2">
              {individualNotes.map((note, idx) => (
                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="mb-2">
                {language === 'it' 
                  ? 'Questa analisi usa la fotocamera del telefono che ha precisione limitata (±5-10° sugli angoli). Le osservazioni sono indicative, non diagnostiche.'
                  : 'This analysis uses your phone camera which has limited precision (±5-10° on angles). Observations are indicative, not diagnostic.'}
              </p>
              <p>
                {language === 'it'
                  ? 'Per una valutazione accurata, consulta un coach o fisioterapista di persona.'
                  : 'For an accurate assessment, consult a coach or physiotherapist in person.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {language === 'it' 
              ? 'Queste osservazioni non indicano necessariamente problemi.' 
              : 'These observations don\'t necessarily indicate problems.'}
          </p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {language === 'it' ? 'Ho capito' : 'Got it'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUMMARY COMPONENT (for post-session review)
// ============================================================================

interface SessionSummaryProps {
  exerciseCount: number;
  totalObservations: {
    technique: number;
    efficiency: number;
    individual: number;
  };
  commonPatterns: Array<{ id: string; count: number; type: string }>;
  summary: string;
  summaryIt: string;
  language?: 'en' | 'it';
}

export const VideoSessionSummary: React.FC<SessionSummaryProps> = ({
  exerciseCount,
  totalObservations,
  commonPatterns,
  summary,
  summaryIt,
  language = 'it'
}) => {
  const totalObs = totalObservations.technique + totalObservations.efficiency + totalObservations.individual;
  
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {language === 'it' ? 'Riepilogo Sessione' : 'Session Summary'}
        </h3>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{exerciseCount}</div>
            <div className="text-xs text-slate-400">
              {language === 'it' ? 'Esercizi' : 'Exercises'}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{totalObs}</div>
            <div className="text-xs text-slate-400">
              {language === 'it' ? 'Osservazioni' : 'Observations'}
            </div>
          </div>
          <div className="bg-emerald-900/30 rounded-lg p-3 text-center border border-emerald-700/30">
            <div className="text-2xl font-bold text-emerald-400">
              {totalObs === 0 ? '✓' : `${totalObs}`}
            </div>
            <div className="text-xs text-emerald-300">
              {language === 'it' ? 'Da rivedere' : 'To review'}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <p className="text-slate-300">
            {language === 'it' ? summaryIt : summary}
          </p>
        </div>

        {/* Common Patterns */}
        {commonPatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">
              {language === 'it' ? 'Pattern frequenti' : 'Common patterns'}
            </h4>
            <div className="space-y-2">
              {commonPatterns.slice(0, 3).map(pattern => (
                <div 
                  key={pattern.id}
                  className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-slate-300">{pattern.id.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-slate-500">{pattern.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default VideoFeedbackEducational;
