/**
 * CYCLE SCREENING NOTIFICATION
 *
 * Dopo ogni ciclo completo (4 sett lavoro + 1 deload + 1 retest = 6 settimane)
 * chiede all'utente di aggiornare:
 * - Peso corporeo
 * - Eventuali dolori/fastidi
 * - Conferma location (palestra/casa)
 * - Conferma obiettivo
 *
 * Questo permette di adattare il programma successivo.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Activity, X, ChevronRight, AlertCircle, CheckCircle, MapPin, Target, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { MedicalRestrictionArea, MedicalRestrictionsData, MedicalRestriction } from '../types/onboarding.types';

// Body areas for pain tracking
const BODY_AREAS = [
  { id: 'shoulder', label: 'Spalla', icon: '🦾' },
  { id: 'elbow', label: 'Gomito', icon: '💪' },
  { id: 'wrist', label: 'Polso', icon: '✋' },
  { id: 'lower_back', label: 'Zona Lombare', icon: '🔙' },
  { id: 'upper_back', label: 'Zona Dorsale', icon: '🔝' },
  { id: 'hip', label: 'Anca', icon: '🦴' },
  { id: 'knee', label: 'Ginocchio', icon: '🦵' },
  { id: 'ankle', label: 'Caviglia', icon: '🦶' },
];

// Medical restriction areas
const MEDICAL_AREAS: Array<{ value: MedicalRestrictionArea; label: string; icon: string }> = [
  { value: 'neck', label: 'Collo', icon: '🦴' },
  { value: 'shoulder', label: 'Spalla', icon: '💪' },
  { value: 'lower_back', label: 'Lombare', icon: '⬇️' },
  { value: 'hip', label: 'Anca', icon: '🦴' },
  { value: 'knee', label: 'Ginocchio', icon: '🦵' },
  { value: 'ankle', label: 'Caviglia', icon: '👣' },
  { value: 'wrist', label: 'Polso', icon: '🤚' },
  { value: 'elbow', label: 'Gomito', icon: '💪' },
  { value: 'arm', label: 'Braccio intero', icon: '🦾' },
  { value: 'leg', label: 'Gamba intera', icon: '🦿' },
];

// Goal options
const GOALS = [
  { id: 'forza', label: 'Forza', icon: '💪', description: 'Aumentare i carichi massimali' },
  { id: 'ipertrofia', label: 'Ipertrofia', icon: '🏋️', description: 'Aumentare la massa muscolare' },
  { id: 'dimagrimento', label: 'Dimagrimento', icon: '🔥', description: 'Perdere grasso mantenendo muscolo' },
  { id: 'resistenza', label: 'Resistenza', icon: '🏃', description: 'Migliorare endurance e capacità' },
];

interface CycleScreeningNotificationProps {
  currentCycle: number;
  currentWeight?: number;
  currentLocation?: 'gym' | 'home';
  currentGoal?: string;
  currentMedicalRestrictions?: MedicalRestrictionsData;
  onComplete: (data: {
    weight: number;
    painAreas: string[];
    location: 'gym' | 'home';
    goal: string;
    locationChanged: boolean;
    goalChanged: boolean;
    medicalRestrictions?: MedicalRestrictionsData;
    restrictionsChanged: boolean;
  }) => void;
  onDismiss: () => void;
}

export default function CycleScreeningNotification({
  currentCycle,
  currentWeight = 0,
  currentLocation = 'gym',
  currentGoal = 'ipertrofia',
  currentMedicalRestrictions,
  onComplete,
  onDismiss
}: CycleScreeningNotificationProps) {
  const [step, setStep] = useState<'intro' | 'weight' | 'pain' | 'medical' | 'location' | 'goal' | 'confirm'>('intro');
  const [weight, setWeight] = useState(currentWeight);
  const [selectedPainAreas, setSelectedPainAreas] = useState<string[]>([]);
  const [location, setLocation] = useState<'gym' | 'home'>(currentLocation);
  const [goal, setGoal] = useState(currentGoal);
  const [saving, setSaving] = useState(false);

  // Medical restrictions state
  const hasMedicalRestrictions = currentMedicalRestrictions?.hasRestrictions && currentMedicalRestrictions.restrictions.length > 0;
  const [medicalAction, setMedicalAction] = useState<'confirm' | 'update' | 'remove'>('confirm');
  const [selectedMedicalAreas, setSelectedMedicalAreas] = useState<MedicalRestrictionArea[]>(
    currentMedicalRestrictions?.restrictions?.map(r => r.area) || []
  );
  const [medicalRestrictionsChanged, setMedicalRestrictionsChanged] = useState(false);

  const toggleMedicalArea = (area: MedicalRestrictionArea) => {
    setSelectedMedicalAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const togglePainArea = (areaId: string) => {
    setSelectedPainAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(a => a !== areaId)
        : [...prev, areaId]
    );
  };

  const locationChanged = location !== currentLocation;
  const goalChanged = goal !== currentGoal;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Update onboarding data with new weight, location, goal
        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .update({
            personal_info: {
              weight: weight
            },
            pain_areas: selectedPainAreas,
            training_location: location,
            goal: goal,
            last_screening_date: new Date().toISOString(),
            last_screening_cycle: currentCycle
          })
          .eq('user_id', user.id);

        if (onboardingError) {
          console.error('Error updating onboarding:', onboardingError);
        }

        // Also update localStorage
        const localOnboarding = localStorage.getItem('onboarding_data');
        if (localOnboarding) {
          const parsed = JSON.parse(localOnboarding);
          parsed.personalInfo = {
            ...parsed.personalInfo,
            weight: weight
          };
          parsed.painAreas = selectedPainAreas;
          parsed.trainingLocation = location;
          parsed.goal = goal;
          parsed.lastScreeningDate = new Date().toISOString();
          parsed.lastScreeningCycle = currentCycle;
          // Update medical restrictions if changed
          if (medicalRestrictionsChanged) {
            if (medicalAction === 'remove') {
              parsed.medicalRestrictions = { hasRestrictions: false, restrictions: [] };
            } else if (medicalAction === 'update') {
              parsed.medicalRestrictions = {
                hasRestrictions: selectedMedicalAreas.length > 0,
                restrictions: selectedMedicalAreas.map(area => ({
                  area,
                  startDate: currentMedicalRestrictions?.restrictions?.find(r => r.area === area)?.startDate || new Date().toISOString(),
                  lastConfirmedDate: new Date().toISOString(),
                })),
              };
            }
          }
          localStorage.setItem('onboarding_data', JSON.stringify(parsed));
        }
      }

      // Build medical restrictions data
      let finalMedicalRestrictions: MedicalRestrictionsData | undefined;
      if (medicalAction === 'remove') {
        finalMedicalRestrictions = { hasRestrictions: false, restrictions: [] };
      } else if (medicalAction === 'update') {
        finalMedicalRestrictions = {
          hasRestrictions: selectedMedicalAreas.length > 0,
          restrictions: selectedMedicalAreas.map(area => ({
            area,
            startDate: currentMedicalRestrictions?.restrictions?.find(r => r.area === area)?.startDate || new Date().toISOString(),
            lastConfirmedDate: new Date().toISOString(),
          })),
        };
      } else if (hasMedicalRestrictions) {
        // Confirm: update lastConfirmedDate
        finalMedicalRestrictions = {
          hasRestrictions: true,
          restrictions: (currentMedicalRestrictions?.restrictions || []).map(r => ({
            ...r,
            lastConfirmedDate: new Date().toISOString(),
          })),
        };
      }

      onComplete({
        weight,
        painAreas: selectedPainAreas,
        location,
        goal,
        locationChanged,
        goalChanged,
        medicalRestrictions: finalMedicalRestrictions,
        restrictionsChanged: medicalRestrictionsChanged,
      });
    } catch (error) {
      console.error('Error saving cycle screening:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-300">
              Aggiornamento Ciclo {currentCycle}
            </h3>
            <p className="text-sm text-slate-400">
              Aggiorna i tuoi parametri per il prossimo ciclo
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* INTRO STEP */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <p className="text-slate-300 mb-3">
                Hai completato il <strong className="text-blue-400">Ciclo {currentCycle}</strong>!
                Prima di iniziare il nuovo ciclo, aggiorniamo alcuni parametri:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span>Peso corporeo attuale</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Eventuali dolori o fastidi</span>
                </li>
                {hasMedicalRestrictions && (
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span>Aggiorna prescrizioni mediche</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Conferma location (palestra/casa)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Conferma obiettivo</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-emerald-300">
                Questi dati permettono di ottimizzare il programma del prossimo ciclo
                e prevenire infortuni.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('weight')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Inizia
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* WEIGHT STEP */}
        {step === 'weight' && (
          <motion.div
            key="weight"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-white">Peso Attuale</h4>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setWeight(prev => Math.max(30, prev - 0.5))}
                  className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold transition-colors"
                >
                  -
                </button>

                <div className="text-center">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-24 text-center text-4xl font-bold bg-transparent text-white border-b-2 border-blue-500 focus:outline-none"
                    step="0.5"
                    min="30"
                    max="200"
                  />
                  <p className="text-slate-400 text-sm mt-1">kg</p>
                </div>

                <button
                  onClick={() => setWeight(prev => Math.min(200, prev + 0.5))}
                  className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold transition-colors"
                >
                  +
                </button>
              </div>

              {currentWeight > 0 && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  Peso precedente: {currentWeight}kg
                  {weight !== currentWeight && (
                    <span className={weight > currentWeight ? 'text-amber-400' : 'text-emerald-400'}>
                      {' '}({weight > currentWeight ? '+' : ''}{(weight - currentWeight).toFixed(1)}kg)
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('intro')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('pain')}
                disabled={weight <= 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PAIN STEP */}
        {step === 'pain' && (
          <motion.div
            key="pain"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <h4 className="text-lg font-bold text-white">Dolori o Fastidi?</h4>
              </div>

              <p className="text-sm text-slate-400 mb-4">
                Seleziona le zone dove senti dolore o fastidio (anche lieve).
                Questo ci aiuta a modificare gli esercizi per prevenire infortuni.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {BODY_AREAS.map(area => (
                  <button
                    key={area.id}
                    onClick={() => togglePainArea(area.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedPainAreas.includes(area.id)
                        ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/10'
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{area.icon}</span>
                      <span className={`text-sm font-medium ${
                        selectedPainAreas.includes(area.id) ? 'text-amber-300' : 'text-slate-300'
                      }`}>
                        {area.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPainAreas.length === 0 && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Nessun dolore? Perfetto! Clicca avanti.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('weight')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(hasMedicalRestrictions ? 'medical' : 'location')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* MEDICAL STEP */}
        {step === 'medical' && (
          <motion.div
            key="medical"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-400" />
                <h4 className="text-lg font-bold text-white">Prescrizioni Mediche</h4>
              </div>

              <p className="text-sm text-slate-400 mb-4">
                Hai restrizioni mediche attive. La situazione e' cambiata?
              </p>

              {/* Chip restrizioni attuali */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(medicalAction === 'update' ? selectedMedicalAreas : currentMedicalRestrictions?.restrictions || []).map((item) => {
                  const area = typeof item === 'string' ? item : item.area;
                  const areaInfo = MEDICAL_AREAS.find(a => a.value === area);
                  return (
                    <span
                      key={area}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium"
                    >
                      {areaInfo?.icon} {areaInfo?.label || area}
                    </span>
                  );
                })}
              </div>

              {/* 3 opzioni */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMedicalAction('confirm');
                    setMedicalRestrictionsChanged(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    medicalAction === 'confirm'
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <span className={`text-sm font-medium ${medicalAction === 'confirm' ? 'text-red-300' : 'text-slate-300'}`}>
                    Confermo stesse restrizioni
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMedicalAction('update');
                    setMedicalRestrictionsChanged(true);
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    medicalAction === 'update'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <span className={`text-sm font-medium ${medicalAction === 'update' ? 'text-amber-300' : 'text-slate-300'}`}>
                    Aggiorna restrizioni
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMedicalAction('remove');
                    setSelectedMedicalAreas([]);
                    setMedicalRestrictionsChanged(true);
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    medicalAction === 'remove'
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <span className={`text-sm font-medium ${medicalAction === 'remove' ? 'text-emerald-300' : 'text-slate-300'}`}>
                    Rimuovi tutte (il medico ha rimosso le prescrizioni)
                  </span>
                </button>
              </div>

              {/* Selettore zone (solo se "update") */}
              <AnimatePresence>
                {medicalAction === 'update' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {MEDICAL_AREAS.map(area => (
                        <button
                          key={area.value}
                          onClick={() => toggleMedicalArea(area.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedMedicalAreas.includes(area.value)
                              ? 'border-red-500 bg-red-500/20'
                              : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{area.icon}</span>
                            <span className={`text-sm font-medium ${
                              selectedMedicalAreas.includes(area.value) ? 'text-red-300' : 'text-slate-300'
                            }`}>
                              {area.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('pain')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('location')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* LOCATION STEP */}
        {step === 'location' && (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-bold text-white">Dove ti allenerai?</h4>
              </div>

              <p className="text-sm text-slate-400 mb-4">
                Conferma dove vuoi allenarti nel prossimo ciclo.
                Se cambi location, genereremo un nuovo programma adatto.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLocation('gym')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    location === 'gym'
                      ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🏋️</span>
                    <span className={`font-bold ${location === 'gym' ? 'text-emerald-300' : 'text-slate-300'}`}>
                      Palestra
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Attrezzatura completa</p>
                  </div>
                </button>

                <button
                  onClick={() => setLocation('home')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    location === 'home'
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🏠</span>
                    <span className={`font-bold ${location === 'home' ? 'text-blue-300' : 'text-slate-300'}`}>
                      Casa
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Corpo libero / minima</p>
                  </div>
                </button>
              </div>

              {locationChanged && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    ⚠️ Cambio location: verrà generato un nuovo programma adatto a {location === 'gym' ? 'palestra' : 'casa'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(hasMedicalRestrictions ? 'medical' : 'pain')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('goal')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* GOAL STEP */}
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-emerald-400" />
                <h4 className="text-lg font-bold text-white">Obiettivo</h4>
              </div>

              <p className="text-sm text-slate-400 mb-4">
                Conferma o cambia il tuo obiettivo per il prossimo ciclo.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      goal === g.id
                        ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{g.icon}</span>
                      <span className={`font-bold text-sm ${goal === g.id ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {g.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{g.description}</p>
                  </button>
                ))}
              </div>

              {goalChanged && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-300">
                    ⚠️ Cambio obiettivo: il programma verrà ottimizzato per "{GOALS.find(g => g.id === goal)?.label}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('location')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('confirm')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* CONFIRM STEP */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <h4 className="text-lg font-bold text-white mb-4">Riepilogo</h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Peso</span>
                  <span className="font-bold text-white">{weight} kg</span>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Dolori</span>
                  <div className="mt-2">
                    {selectedPainAreas.length === 0 ? (
                      <span className="text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Nessun dolore segnalato
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedPainAreas.map(areaId => {
                          const area = BODY_AREAS.find(a => a.id === areaId);
                          return (
                            <span
                              key={areaId}
                              className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium"
                            >
                              {area?.icon} {area?.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Restrictions */}
                {hasMedicalRestrictions && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-400 flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      Prescrizioni mediche
                    </span>
                    {medicalAction === 'remove' ? (
                      <span className="text-emerald-400 text-sm">Rimosse tutte le restrizioni</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(medicalAction === 'update' ? selectedMedicalAreas : currentMedicalRestrictions?.restrictions || []).map((item) => {
                          const area = typeof item === 'string' ? item : item.area;
                          const areaInfo = MEDICAL_AREAS.find(a => a.value === area);
                          return (
                            <span
                              key={area}
                              className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium"
                            >
                              {areaInfo?.icon} {areaInfo?.label || area}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    Location
                  </span>
                  <span className={`font-bold ${locationChanged ? 'text-purple-300' : 'text-white'}`}>
                    {location === 'gym' ? '🏋️ Palestra' : '🏠 Casa'}
                    {locationChanged && <span className="text-xs ml-2 text-purple-400">(cambiato)</span>}
                  </span>
                </div>

                {/* Goal */}
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Obiettivo
                  </span>
                  <span className={`font-bold ${goalChanged ? 'text-emerald-300' : 'text-white'}`}>
                    {GOALS.find(g => g.id === goal)?.icon} {GOALS.find(g => g.id === goal)?.label}
                    {goalChanged && <span className="text-xs ml-2 text-emerald-400">(cambiato)</span>}
                  </span>
                </div>
              </div>
            </div>

            {selectedPainAreas.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-300">
                  Il prossimo programma terrà conto dei dolori segnalati,
                  evitando esercizi che potrebbero aggravare la situazione.
                </p>
              </div>
            )}

            {(locationChanged || goalChanged) && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-300">
                  {locationChanged && goalChanged
                    ? '⚠️ Hai cambiato location e obiettivo: verrà generato un nuovo programma personalizzato.'
                    : locationChanged
                      ? '⚠️ Hai cambiato location: verrà generato un nuovo programma adatto.'
                      : '⚠️ Hai cambiato obiettivo: il programma verrà ottimizzato di conseguenza.'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('goal')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors"
              >
                Indietro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Conferma e Inizia Ciclo {currentCycle + 1}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
