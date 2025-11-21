/**
 * Functional Screening Modal
 * Test funzionale rapido per identificare pattern di dolore specifici
 * Usa i protocolli da functionalScreening.ts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import {
  LOWER_BACK_QUICK_SCREEN,
  HIP_QUICK_SCREEN,
  KNEE_QUICK_SCREEN,
  SHOULDER_QUICK_SCREEN,
  NECK_QUICK_SCREEN,
  ELBOW_QUICK_SCREEN,
  WRIST_QUICK_SCREEN,
  SCAPULA_QUICK_SCREEN,
  THORACIC_SPINE_QUICK_SCREEN,
  ANKLE_QUICK_SCREEN,
  interpretScreeningResults,
  ScreeningResults,
  TestResult,
  ScreeningProtocol
} from '@shared/utils/functionalScreening';
import ScreeningVideoPlayer from './ScreeningVideoPlayer';

interface FunctionalScreeningModalProps {
  painArea: 'lower_back' | 'hip' | 'knee' | 'shoulder' | 'ankle' | 'elbow' | 'wrist' | 'neck' | 'scapula' | 'thoracic_spine';
  onComplete: (movementProfile: any) => void;
  onClose: () => void;
}

// Mappa painArea → protocollo screening
const SCREENING_PROTOCOLS: Record<string, ScreeningProtocol> = {
  lower_back: LOWER_BACK_QUICK_SCREEN,
  hip: HIP_QUICK_SCREEN,
  knee: KNEE_QUICK_SCREEN,
  shoulder: SHOULDER_QUICK_SCREEN,
  neck: NECK_QUICK_SCREEN,
  elbow: ELBOW_QUICK_SCREEN,
  wrist: WRIST_QUICK_SCREEN,
  scapula: SCAPULA_QUICK_SCREEN,
  thoracic_spine: THORACIC_SPINE_QUICK_SCREEN,
  ankle: ANKLE_QUICK_SCREEN
};

export default function FunctionalScreeningModal({
  painArea,
  onComplete,
  onClose
}: FunctionalScreeningModalProps) {
  const protocol = SCREENING_PROTOCOLS[painArea];

  if (!protocol) {
    return null; // Nessun protocollo disponibile per questa area
  }

  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [painLevel, setPainLevel] = useState(0);
  const [romRestricted, setRomRestricted] = useState(false);

  const currentTest = protocol.tests[currentTestIndex];
  const progress = ((currentTestIndex + 1) / protocol.tests.length) * 100;

  const handleNext = () => {
    // Salva risultato test corrente
    const result: TestResult = {
      test_name: currentTest.test_name,
      movement_tested: currentTest.movement_tested,
      pain_level: painLevel,
      rom_restriction: romRestricted,
      notes: ''
    };

    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);

    if (currentTestIndex < protocol.tests.length - 1) {
      // Vai al prossimo test
      setCurrentTestIndex(currentTestIndex + 1);
      setPainLevel(0);
      setRomRestricted(false);
    } else {
      // Completato! Interpreta risultati
      const screeningResults: ScreeningResults = {
        protocol_used: protocol.name,
        date: new Date().toISOString(),
        test_results: updatedResults
      };

      const movementProfile = interpretScreeningResults(screeningResults);

      console.log('📋 Functional Screening Completato:', movementProfile);
      onComplete(movementProfile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{protocol.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{protocol.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Test {currentTestIndex + 1} di {protocol.tests.length}
            </span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Test Content */}
        <div className="p-6 space-y-6">
          {/* Video Demo (if available) */}
          {currentTest.video_ref && (
            <div className="mb-6">
              <ScreeningVideoPlayer
                videoRef={currentTest.video_ref}
                autoPlay={false}
                loop={true}
                className="w-full aspect-video"
                showControls={true}
              />
            </div>
          )}

          {/* Test Name */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              {currentTest.test_name}
            </h3>
            <p className="text-slate-300 text-sm">
              {currentTest.procedure}
            </p>
          </div>

          {/* Pain Scale */}
          {currentTest.pain_scale && (
            <div className="space-y-3">
              <label className="block text-white font-semibold">
                Livello di Dolore Durante il Movimento
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">0 - Nessun dolore</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-mono font-bold ${
                      painLevel === 0 ? 'text-green-400' :
                      painLevel <= 3 ? 'text-yellow-400' :
                      painLevel <= 6 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {painLevel}
                    </span>
                    <span className="text-sm text-slate-400">/10</span>
                  </div>
                  <span className="text-sm text-slate-400">10 - Dolore massimo</span>
                </div>
              </div>
            </div>
          )}

          {/* ROM Assessment */}
          {currentTest.rom_assessment && (
            <div className="space-y-3">
              <label className="block text-white font-semibold">
                Range of Motion (ROM)
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setRomRestricted(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    !romRestricted
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${!romRestricted ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">ROM Completo</span>
                </button>
                <button
                  onClick={() => setRomRestricted(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    romRestricted
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${romRestricted ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">ROM Limitato</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleNext}
              disabled={currentTest.pain_scale && painLevel === undefined}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {currentTestIndex < protocol.tests.length - 1 ? 'Prossimo Test' : 'Completa Screening'}
            </button>
          </div>

          {/* Info Note */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-300">
              💡 <strong>Nota:</strong> Esegui il movimento lentamente e con controllo.
              Valuta il dolore durante l'INTERA esecuzione del movimento.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
