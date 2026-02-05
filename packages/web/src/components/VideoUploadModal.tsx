/**
 * Video Upload Modal - Record or upload exercise video for AI analysis
 *
 * Sistema di analisi locale:
 * 1. MediaPipe per estrazione landmark (in-browser)
 * 2. Biomechanics Engine interno per analisi
 *
 * Se l'analisi fallisce, l'utente deve riprovare con un video migliore.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Upload, CheckCircle, AlertCircle, Loader2, Cpu, Camera, Eye, RotateCcw } from 'lucide-react';
import { checkVideoQuota, type QuotaInfo } from '../lib/videoCorrectionService';
import { analyzeExerciseVideo, isExerciseSupportedInternally, type CorrectionProgress, type CorrectionResult } from '../lib/videoCorrectionEngine';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';

// Istruzioni per il posizionamento camera a 45° latero-posteriore
const CAMERA_SETUP_INSTRUCTIONS = {
  title: 'Posizionamento Camera',
  description: 'Per una migliore analisi, posiziona la camera a 45° dietro di te',
  steps: [
    { icon: '📐', text: 'Posiziona il telefono dietro di te, leggermente di lato (45°)' },
    { icon: '👁️', text: 'La camera deve vedere sia la schiena che il fianco' },
    { icon: '📏', text: 'Altezza: circa all\'altezza dei fianchi (1 metro)' },
    { icon: '📍', text: 'Distanza: 2-3 metri (devi stare tutto nell\'inquadratura)' },
    { icon: '💡', text: 'Assicurati che ci sia buona illuminazione (no controluce)' }
  ],
  benefits: [
    'Rileva asimmetrie dx/sx',
    'Identifica rotazione del tronco',
    'Analizza distribuzione del peso',
    'Verifica posizione scapole'
  ]
};

interface VideoUploadModalProps {
  open: boolean;
  onClose: () => void;
  exerciseName: string;
  exercisePattern?: string;
  workoutLogId?: string;
  setNumber?: number;
  onUploadComplete?: (correctionId: string) => void;
}

export default function VideoUploadModal({
  open,
  onClose,
  exerciseName,
  exercisePattern,
  workoutLogId,
  setNumber,
  onUploadComplete
}: VideoUploadModalProps) {
  const userId = useAppStore((state) => state.userId);

  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [analysisSource, setAnalysisSource] = useState<'internal' | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CorrectionResult | null>(null);
  const [showCameraGuide, setShowCameraGuide] = useState(true);  // Mostra guida per prima

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load quota on mount
  useEffect(() => {
    if (open && userId) {
      loadQuota();
    }
  }, [open, userId]);

  async function loadQuota() {
    if (!userId) return;
    const quota = await checkVideoQuota(userId);
    setQuotaInfo(quota);
  }

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera on mobile
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);

        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());

        // Show recorded video
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Failed to start recording:', error);
      setErrorMessage('Impossibile accedere alla camera. Verifica i permessi.');
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // Handle file select
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  }

  // Upload and analyze video with hybrid system
  async function handleUpload() {
    if (!recordedBlob || !userId) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setAnalysisSource(null);
    setAnalysisResult(null);

    try {
      // 1. First create a correction record in the database
      const timestamp = Date.now();
      const filename = `${exerciseName.replace(/\s+/g, '-')}_${timestamp}.mp4`;
      const filePath = `${userId}/${filename}`;

      // Upload video to storage
      setProcessingStatus('Caricamento video...');
      const { error: uploadError } = await supabase.storage
        .from('user-exercise-videos')
        .upload(filePath, recordedBlob, { contentType: 'video/mp4' });

      if (uploadError) {
        throw new Error(`Upload fallito: ${uploadError.message}`);
      }

      setUploadProgress(20);

      // Create correction record
      const { data: correctionData, error: insertError } = await supabase
        .from('video_corrections')
        .insert({
          user_id: userId,
          video_url: filePath,
          video_filename: filename,
          video_size_bytes: recordedBlob.size,
          exercise_name: exerciseName,
          exercise_pattern: exercisePattern,
          workout_log_id: workoutLogId,
          set_number: setNumber,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (insertError || !correctionData) {
        throw new Error(`Creazione record fallita: ${insertError?.message}`);
      }

      setUploadProgress(30);
      setUploadStatus('processing');
      setAnalysisSource('internal');

      // 2. Analyze with local engine (no external fallback)
      const result = await analyzeExerciseVideo(
        recordedBlob,
        exerciseName,
        userId,
        correctionData.id,
        (progress: CorrectionProgress) => {
          // Map progress to our UI
          setUploadProgress(30 + (progress.percentage * 0.7)); // 30-100%
          setProcessingStatus(progress.message);
        }
      );

      // 3. Handle result
      if (result.success) {
        setUploadStatus('success');
        setAnalysisResult(result);
        setProcessingStatus('Analisi completata!');
        onUploadComplete?.(correctionData.id);
      } else {
        throw new Error(result.error || 'Analisi fallita. Riprova con un video più chiaro e ben illuminato.');
      }

    } catch (error) {
      console.error('Video analysis failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Analisi fallita. Riprova.');
    }
  }

  // Reset modal
  function handleClose() {
    setRecordedBlob(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setIsRecording(false);
    setProcessingStatus('');
    setErrorMessage('');
    setAnalysisSource(null);
    setAnalysisResult(null);
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.srcObject = null;
    }
    onClose();
  }

  if (!open) return null;

  // Check quota
  if (quotaInfo && !quotaInfo.can_upload) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Quota Esaurita</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center py-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Hai utilizzato tutte le {quotaInfo.max_allowed} video correzioni del tuo piano{' '}
              <span className="font-bold text-blue-400">{quotaInfo.tier.toUpperCase()}</span>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Reset fra {Math.ceil(quotaInfo.days_until_reset)} giorni
            </p>

            <button
              onClick={() => {
                handleClose();
                // TODO: Open upgrade modal
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade a PRO/PREMIUM
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Video Correzione AI</h3>
            <p className="text-sm text-gray-400">{exerciseName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quota Info */}
        {quotaInfo && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Piano {quotaInfo.tier.toUpperCase()}</p>
              <p className="text-white font-medium">
                {quotaInfo.used}/{quotaInfo.max_allowed} video usati
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Reset fra</p>
              <p className="text-blue-400 font-medium">{Math.ceil(quotaInfo.days_until_reset)} giorni</p>
            </div>
          </div>
        )}

        {/* Video Preview */}
        <div className="bg-black rounded-lg mb-4 aspect-video overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={!!recordedBlob}
            playsInline
          />
        </div>

        {/* Success State */}
        <AnimatePresence>
          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-green-400 font-medium">Analisi Completata!</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-blue-300">
                      Biomechanica
                    </span>
                  </div>
                  {analysisResult?.score && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-300">Punteggio:</span>
                      <span className={`font-bold ${
                        analysisResult.score >= 8 ? 'text-green-400' :
                        analysisResult.score >= 6 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {analysisResult.score}/10
                      </span>
                      {analysisResult.morphotype && (
                        <span className="text-xs text-gray-400">
                          • {analysisResult.morphotype.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {uploadStatus === 'processing' && (
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-blue-400 font-medium">{processingStatus}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-blue-300">
                    Analisi Locale
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  Analisi in tempo reale sul tuo dispositivo
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadStatus === 'uploading' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Upload in corso...</span>
              <span className="text-sm text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!recordedBlob && !isRecording && (
            <>
              <button
                onClick={startRecording}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Registra Video
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Carica Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors animate-pulse"
            >
              ⏹️ Stop Recording
            </button>
          )}

          {recordedBlob && uploadStatus === 'idle' && (
            <>
              <button
                onClick={() => {
                  setRecordedBlob(null);
                  if (videoRef.current) {
                    videoRef.current.src = '';
                  }
                }}
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Riprova
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Analizza con AI
              </button>
            </>
          )}

          {uploadStatus === 'success' && (
            <button
              onClick={handleClose}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Visualizza Feedback
            </button>
          )}
        </div>

        {/* Camera Setup Guide */}
        <div className="mt-4">
          <button
            onClick={() => setShowCameraGuide(!showCameraGuide)}
            className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Come posizionare la camera (45° latero-posteriore)
              </span>
            </div>
            <RotateCcw className={`w-4 h-4 text-gray-400 transition-transform ${showCameraGuide ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCameraGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-b-lg border-t border-gray-700">
                  {/* Visual representation */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-48 h-32 bg-gray-800/50 rounded-lg p-2">
                      {/* Person icon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          Tu
                        </div>
                      </div>
                      {/* Camera position */}
                      <div className="absolute bottom-2 right-2 transform rotate-[-45deg]">
                        <div className="flex items-center gap-1">
                          <Camera className="w-5 h-5 text-green-400" />
                          <span className="text-xs text-green-400">45°</span>
                        </div>
                      </div>
                      {/* Viewing cone */}
                      <div className="absolute bottom-4 right-4 w-16 h-16">
                        <div className="w-full h-full border-l-2 border-b-2 border-green-400/30 rounded-bl-full"></div>
                      </div>
                      {/* Label */}
                      <span className="absolute top-1 left-2 text-[10px] text-gray-400">Vista dall'alto</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2 mb-4">
                    {CAMERA_SETUP_INSTRUCTIONS.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-base">{step.icon}</span>
                        <span className="text-gray-300">{step.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">
                        Questa angolazione permette di rilevare:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CAMERA_SETUP_INSTRUCTIONS.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-purple-800/50 text-purple-200 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
