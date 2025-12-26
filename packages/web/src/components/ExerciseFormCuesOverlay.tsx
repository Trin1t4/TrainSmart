import React, { useState } from 'react';
import { getFormCues, getCriticalCues, FormCue } from '@trainsmart/shared';
import { Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ExerciseFormCuesOverlayProps {
  exerciseName: string;
  showOnVideo?: boolean; // Se true, overlay trasparente sul video
  className?: string;
}

export default function ExerciseFormCuesOverlay({
  exerciseName,
  showOnVideo = false,
  className = ''
}: ExerciseFormCuesOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'critical' | 'setup' | 'execution' | 'common_errors'>('critical');

  const formCues = getFormCues(exerciseName);
  const criticalCues = getCriticalCues(exerciseName);

  if (!formCues) {
    return null; // No cues available for this exercise
  }

  const getCategoryIcon = (category: FormCue['category']) => {
    switch (category) {
      case 'setup':
        return '🎯';
      case 'execution':
        return '💪';
      case 'breathing':
        return '🫁';
      case 'common_errors':
        return '❌';
      case 'safety':
        return '⚠️';
      default:
        return '✅';
    }
  };

  const getCategoryColor = (category: FormCue['category']) => {
    switch (category) {
      case 'setup':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'execution':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'breathing':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'common_errors':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'safety':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  const getPriorityBadge = (priority: FormCue['priority']) => {
    if (priority === 'critical') {
      return <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded font-bold">CRITICO</span>;
    }
    if (priority === 'important') {
      return <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">IMPORTANTE</span>;
    }
    return null;
  };

  const filteredCues = selectedCategory === 'all'
    ? formCues.cues
    : selectedCategory === 'critical'
    ? criticalCues
    : formCues.cues.filter(c => c.category === selectedCategory);

  // MINI VIEW (collapsed) - mostra solo key points critici
  if (!expanded && showOnVideo) {
    return (
      <div className={`absolute bottom-4 left-4 right-4 ${className}`}>
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Key Points</span>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Vedi tutti →
            </button>
          </div>

          <div className="space-y-1">
            {formCues.keyPoints.slice(0, 3).map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/90">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // FULL VIEW (expanded)
  return (
    <div className={`${showOnVideo ? 'absolute inset-0 flex items-center justify-center p-4' : ''} ${className}`}>
      <div className={`${showOnVideo ? 'max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-md' : 'bg-slate-800'} border border-slate-700 rounded-xl`}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white font-bold text-lg">Form Cues</h3>
              <p className="text-blue-100 text-xs">{formCues.exerciseName}</p>
            </div>
          </div>
          {showOnVideo && (
            <button
              onClick={() => setExpanded(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Key Points (sempre visibili) */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Punti Chiave
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formCues.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                <span className="text-green-400 font-bold">•</span>
                <span className="text-white">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="flex flex-wrap gap-2">
            {(['critical', 'all', 'setup', 'execution', 'common_errors'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat === 'critical' && '🔥 Critici'}
                {cat === 'all' && '📋 Tutti'}
                {cat === 'setup' && '🎯 Setup'}
                {cat === 'execution' && '💪 Esecuzione'}
                {cat === 'common_errors' && '❌ Errori Comuni'}
              </button>
            ))}
          </div>
        </div>

        {/* Cues List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredCues.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-8">
              Nessun cue disponibile per questa categoria
            </p>
          )}

          {filteredCues.map((cue, i) => (
            <div
              key={i}
              className={`border rounded-lg p-3 ${getCategoryColor(cue.category)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg">{getCategoryIcon(cue.category)}</span>
                  <p className="text-white text-sm flex-1">{cue.text}</p>
                </div>
                {getPriorityBadge(cue.priority)}
              </div>

              <div className="ml-7">
                <span className="text-xs uppercase font-semibold opacity-70">
                  {cue.category.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {filteredCues.length} cue{filteredCues.length !== 1 ? 's' : ''} mostrati
            </span>
            <span className="text-slate-400">
              {criticalCues.length} critici • {formCues.cues.length} totali
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MINI BADGE VERSION (per mostrare numero cues disponibili)
 */
export function ExerciseFormCuesBadge({ exerciseName }: { exerciseName: string }) {
  const formCues = getFormCues(exerciseName);
  const criticalCount = getCriticalCues(exerciseName).length;

  if (!formCues) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
      <Info className="w-3 h-3 text-blue-400" />
      <span className="text-xs text-blue-300 font-semibold">
        {criticalCount} cues
      </span>
    </div>
  );
}
