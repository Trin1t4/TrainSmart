/**
 * Physiotherapist Referral Modal
 * Quando il recovery protocol non funziona e il dolore persiste
 * → Sistema rimanda l'utente a un fisioterapista professionista
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Heart, ExternalLink, X, FileText } from 'lucide-react';

interface PhysioReferralModalProps {
  painAreas: string[];
  exercisesAffected: string[];
  onClose: () => void;
  onDownloadReport?: () => void;
}

export default function PhysioReferralModal({
  painAreas,
  exercisesAffected,
  onClose,
  onDownloadReport
}: PhysioReferralModalProps) {
  const handleFindPhysio = () => {
    // Link a servizi per trovare fisioterapisti (placeholder)
    window.open('https://www.google.com/maps/search/fisioterapista', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl border border-amber-500/50 max-w-2xl w-full shadow-2xl shadow-amber-500/20"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Consulenza Professionale Necessaria
                </h2>
                <p className="text-amber-200 text-sm mt-1">
                  Il dolore persiste nonostante il protocollo di recupero
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Message */}
          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <div className="flex items-start gap-4">
              <Heart className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  La tua salute è la priorità
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Abbiamo notato che il dolore in alcune aree persiste anche dopo aver
                  applicato i protocolli di recupero motorio. Questo suggerisce che potrebbe
                  esserci una problematica che richiede una valutazione professionale più
                  approfondita.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ti consigliamo fortemente di consultare un{' '}
                  <strong className="text-amber-300">fisioterapista qualificato</strong>{' '}
                  per una diagnosi accurata e un piano di trattamento personalizzato.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Areas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Aree che necessitano attenzione
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {painAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-amber-200 text-sm font-medium capitalize">
                    {area.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises Affected */}
          {exercisesAffected.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Esercizi sospesi
              </h4>
              <div className="bg-slate-700/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <ul className="space-y-2">
                  {exercisesAffected.map((exercise, index) => (
                    <li key={index} className="text-slate-300 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                      {exercise}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Cosa fare ora
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">1.</span>
                <span>
                  <strong className="text-white">Sospendi</strong> temporaneamente gli
                  esercizi che causano dolore
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">2.</span>
                <span>
                  <strong className="text-white">Prenota</strong> una visita con un
                  fisioterapista qualificato
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">3.</span>
                <span>
                  <strong className="text-white">Porta</strong> il report dettagliato delle
                  tue sessioni (puoi scaricarlo qui sotto)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">4.</span>
                <span>
                  <strong className="text-white">Segui</strong> le indicazioni del
                  professionista prima di riprendere l'allenamento
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onDownloadReport && (
              <button
                onClick={onDownloadReport}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Scarica Report
              </button>
            )}
            <button
              onClick={handleFindPhysio}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Trova Fisioterapista
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-700">
            <p>
              Questo è un consiglio automatizzato basato sui tuoi dati di allenamento.
              <br />
              Non sostituisce una valutazione medica professionale.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
