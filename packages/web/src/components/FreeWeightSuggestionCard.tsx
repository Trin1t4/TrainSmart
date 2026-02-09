import React, { useState } from 'react';
import { Dumbbell, X, Play, ChevronRight, Sparkles } from 'lucide-react';
import { markSuggestionShown, recordSuggestionResponse } from '@trainsmart/shared';

interface FreeWeightSuggestionCardProps {
  machineExercise: string;
  freeWeightAlternative: string;
  freeWeightDescription: string;
  videoUrl?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function FreeWeightSuggestionCard({
  machineExercise,
  freeWeightAlternative,
  freeWeightDescription,
  videoUrl,
  onAccept,
  onDecline,
}: FreeWeightSuggestionCardProps) {
  const [showVideo, setShowVideo] = useState(false);

  const handleAccept = () => {
    markSuggestionShown();
    recordSuggestionResponse(true, freeWeightAlternative);
    onAccept();
  };

  const handleDecline = () => {
    markSuggestionShown();
    recordSuggestionResponse(false, freeWeightAlternative);
    onDecline();
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-2 border-blue-700 rounded-2xl p-5 shadow-lg animate-in slide-in-from-top duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Prova qualcosa di nuovo!</h3>
            <p className="text-sm text-blue-400 font-medium">Oggi sei in forma perfetta</p>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Proposta */}
      <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-blue-800">
        <p className="text-slate-300 mb-3">
          Visto che oggi usi <span className="font-semibold text-white">{machineExercise}</span>,
          perche non provi:
        </p>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-400 text-lg">{freeWeightAlternative}</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          {freeWeightDescription}
        </p>

        {/* Video preview */}
        {videoUrl && (
          <div className="mt-4">
            {showVideo ? (
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            ) : (
              <button
                onClick={() => setShowVideo(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900/50 hover:bg-blue-800/50 text-blue-400 rounded-lg transition font-medium"
              >
                <Play className="w-4 h-4 fill-current" />
                Guarda come si esegue
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 mb-4">
        <p className="text-emerald-400 text-sm font-medium">
          Inizierai con peso leggero per imparare la tecnica. Poi alternerai tra macchina e peso libero.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold transition"
        >
          No, resto sulla macchina
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
        >
          Si, proviamo!
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
