/**
 * Video Feedback View - Display AI analysis results
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Minus, Play } from 'lucide-react';
import { getVideoCorrection, getVideoSignedUrl, markVideoAsViewed, type VideoCorrection, type FeedbackIssue } from '../lib/videoCorrectionService';

interface VideoFeedbackViewProps {
  correctionId: string;
  onClose?: () => void;
}

export default function VideoFeedbackView({ correctionId, onClose }: VideoFeedbackViewProps) {
  const [correction, setCorrection] = useState<VideoCorrection | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorrection();
  }, [correctionId]);

  async function loadCorrection() {
    setLoading(true);

    const data = await getVideoCorrection(correctionId);
    setCorrection(data);

    if (data?.video_url) {
      const signedUrl = await getVideoSignedUrl(data.video_url);
      setVideoUrl(signedUrl);

      // Mark as viewed
      if (!data.viewed_at) {
        await markVideoAsViewed(correctionId);
      }
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento feedback...</p>
        </div>
      </div>
    );
  }

  if (!correction || correction.processing_status !== 'completed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-300">
            {correction?.processing_status === 'processing'
              ? 'Analisi ancora in corso...'
              : 'Feedback non disponibile'}
          </p>
        </div>
      </div>
    );
  }

  const score = correction.feedback_score || 0;
  const issues = correction.feedback_issues || [];
  const corrections = correction.feedback_corrections || [];
  const warnings = correction.feedback_warnings || [];

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Severity badge
  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-blue-900/50 text-blue-400 border-blue-700',
      medium: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
      high: 'bg-red-900/50 text-red-400 border-red-700'
    };
    return styles[severity as keyof typeof styles] || styles.low;
  };

  // Load recommendation icon
  const getLoadRecommendationIcon = (rec: string) => {
    if (rec.includes('increase')) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (rec.includes('decrease')) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Analisi Video Completata</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-gray-400">{correction.exercise_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Video Player */}
          <div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Video Registrato
              </h2>
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  playsInline
                />
              ) : (
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Video non disponibile</p>
                </div>
              )}
            </div>

            {/* Overall Score */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mt-6 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                Punteggio Tecnica
              </p>
              <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}/10
              </div>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-300">
                {score >= 8 && 'Ottima esecuzione! Solo piccoli affinamenti.'}
                {score >= 6 && score < 8 && 'Buona forma, ma ci sono margini di miglioramento.'}
                {score >= 4 && score < 6 && 'Forma moderata, riduci il carico e lavora sulla tecnica.'}
                {score < 4 && 'Forma compromessa, rivedi il pattern di movimento.'}
              </p>
            </div>

            {/* Load Recommendation */}
            {correction.load_recommendation && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mt-6">
                <div className="flex items-center gap-3">
                  {getLoadRecommendationIcon(correction.load_recommendation)}
                  <div>
                    <p className="text-sm text-gray-400">Raccomandazione Carico</p>
                    <p className="text-white font-medium">
                      {correction.load_recommendation === 'increase_5_percent' && 'Aumenta del 5%'}
                      {correction.load_recommendation === 'maintain' && 'Mantieni carico attuale'}
                      {correction.load_recommendation === 'decrease_10_percent' && 'Riduci del 10%'}
                      {correction.load_recommendation === 'decrease_20_percent' && 'Riduci del 20%'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Feedback Details */}
          <div className="space-y-6">
            {/* Safety Warnings */}
            {warnings.length > 0 && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  ⚠️ Avvisi Sicurezza
                </h3>
                <ul className="space-y-2">
                  {warnings.map((warning, i) => (
                    <li key={i} className="text-red-300 text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues Detected */}
            {issues.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-bold mb-4">Errori Rilevati</h3>
                <div className="space-y-3">
                  {issues.map((issue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`border rounded-lg p-3 ${getSeverityBadge(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium capitalize">
                          {issue.name.replace(/_/g, ' ')}
                        </p>
                        <span className="text-xs uppercase px-2 py-1 rounded bg-black/20">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{issue.description}</p>
                      {issue.timestamp_seconds && issue.timestamp_seconds.length > 0 && (
                        <p className="text-xs opacity-70 mt-2">
                          Visibile a: {issue.timestamp_seconds.map(t => `${t}s`).join(', ')}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrective Cues */}
            {corrections.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Come Correggere
                </h3>
                <ul className="space-y-3">
                  {corrections.map((cue, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span className="text-green-400 font-bold mt-0.5">✓</span>
                      <span>{cue}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* No Issues - Perfect! */}
            {issues.length === 0 && corrections.length === 0 && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-green-400 font-bold text-xl mb-2">
                  Esecuzione Perfetta! 🎉
                </h3>
                <p className="text-gray-300">
                  Non sono stati rilevati errori tecnici. Continua così!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Analizza Altro Video
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Torna al Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
