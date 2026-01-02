/**
 * CardioProposalStep
 * Propone l'integrazione del cardio/corsa dopo la selezione dell'obiettivo
 * Solo per goal che possono beneficiare del cardio (non recupero/gravidanza)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame, Zap, Activity, ChevronRight, X } from 'lucide-react';
import { OnboardingData, Goal } from '../../types/onboarding.types';

interface CardioProposalStepProps {
  data: Partial<OnboardingData>;
  onAccept: () => void; // Utente vuole aggiungere cardio → vai a RunningOnboarding
  onSkip: () => void; // Utente salta cardio → continua con solo pesi
}

// Benefici del cardio per ogni obiettivo
const CARDIO_BENEFITS: Record<string, {
  title: string;
  benefits: string[];
  suggested: 'high' | 'medium' | 'low';
  sessionsRange: string;
}> = {
  dimagrimento: {
    title: 'Cardio per Dimagrimento',
    benefits: [
      'Aumenta il deficit calorico giornaliero',
      'Migliora la sensibilità insulinica',
      'Accelera il metabolismo basale',
      'Favorisce l\'utilizzo dei grassi come energia',
    ],
    suggested: 'high',
    sessionsRange: '3-4 sessioni/settimana',
  },
  tonificazione: {
    title: 'Cardio per Tonificazione',
    benefits: [
      'Migliora la definizione muscolare',
      'Aumenta la vascolarizzazione',
      'Supporta il recupero tra sessioni',
      'Mantiene basso il grasso corporeo',
    ],
    suggested: 'medium',
    sessionsRange: '2-3 sessioni/settimana',
  },
  ipertrofia: {
    title: 'Cardio per Recupero',
    benefits: [
      'Migliora il recupero muscolare',
      'Aumenta il flusso di nutrienti ai muscoli',
      'Mantiene la salute cardiovascolare',
      'Non interferisce con la crescita muscolare (Zona 2)',
    ],
    suggested: 'low',
    sessionsRange: '2 sessioni/settimana (leggere)',
  },
  forza: {
    title: 'Cardio per Recupero',
    benefits: [
      'Migliora il recupero tra sessioni pesanti',
      'Mantiene la capacità aerobica di base',
      'Supporta la salute cardiovascolare',
      'Aiuta la gestione del peso corporeo',
    ],
    suggested: 'low',
    sessionsRange: '1-2 sessioni/settimana (leggere)',
  },
  resistenza: {
    title: 'Base Aerobica',
    benefits: [
      'Costruire resistenza cardiovascolare',
      'Aumentare la capacità di lavoro',
      'Migliorare l\'efficienza cardiaca',
      'Preparazione per distanze maggiori',
    ],
    suggested: 'high',
    sessionsRange: '3-4 sessioni/settimana',
  },
  benessere: {
    title: 'Cardio per Benessere',
    benefits: [
      'Riduce stress e ansia',
      'Migliora qualità del sonno',
      'Aumenta l\'energia quotidiana',
      'Supporta la salute mentale',
    ],
    suggested: 'medium',
    sessionsRange: '2-3 sessioni/settimana',
  },
};

export default function CardioProposalStep({ data, onAccept, onSkip }: CardioProposalStepProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Determina il goal primario per mostrare i benefici appropriati
  const primaryGoal = data.goals?.[0] || data.goal || 'benessere';
  const cardioInfo = CARDIO_BENEFITS[primaryGoal] || CARDIO_BENEFITS.benessere;

  // Colori in base al livello di suggerimento
  const suggestionColors = {
    high: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
      badge: 'bg-green-500',
      text: 'Consigliato',
    },
    medium: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/50',
      badge: 'bg-blue-500',
      text: 'Opzionale',
    },
    low: {
      bg: 'from-slate-500/20 to-gray-500/20',
      border: 'border-slate-500/50',
      badge: 'bg-slate-500',
      text: 'Facoltativo',
    },
  };

  const colors = suggestionColors[cardioInfo.suggested];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Vuoi aggiungere il cardio?
        </h2>
        <p className="text-gray-400">
          La corsa può integrare il tuo programma di forza
        </p>
      </div>

      {/* Card principale con benefici */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${colors.bg} rounded-xl border ${colors.border} p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{cardioInfo.title}</h3>
          <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full font-medium`}>
            {colors.text}
          </span>
        </div>

        {/* Benefici */}
        <div className="space-y-2 mb-4">
          {cardioInfo.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Frequenza suggerita */}
        <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-gray-400">Frequenza suggerita</p>
            <p className="text-sm font-medium text-white">{cardioInfo.sessionsRange}</p>
          </div>
        </div>
      </motion.div>

      {/* Info Zona 2 */}
      <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-100 mb-1">Allenamento in Zona 2</p>
            <p className="text-sm text-blue-300">
              Ti guideremo con un programma di corsa basato sulla frequenza cardiaca,
              per massimizzare i benefici senza interferire con i tuoi allenamenti di forza.
            </p>
          </div>
        </div>
      </div>

      {/* Bottoni azione */}
      <div className="space-y-3">
        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          Sì, voglio aggiungere il cardio
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onSkip}
          className="w-full border-2 border-gray-700 text-gray-300 py-4 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          No, solo pesi per ora
        </button>
      </div>

      {/* Note */}
      <p className="text-center text-xs text-gray-500">
        Potrai sempre aggiungere il cardio in seguito dalle impostazioni
      </p>
    </div>
  );
}
