/**
 * SlimOnboarding.tsx
 *
 * Onboarding snello in 3 step (~90 secondi):
 * 1. Chi sei (nome, genere, età, peso opzionale)
 * 2. Cosa vuoi (obiettivo singolo)
 * 3. Dove e quanto (location, frequenza, dolori)
 *
 * Dopo il completamento → OptionalQuizzes per approfondimenti facoltativi
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BETA_FLAGS } from '../config/featureFlags';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Target, MapPin, Dumbbell, Home, Calendar,
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-react';
import type { OnboardingData, PainArea, PainEntry } from '../types/onboarding.types';
import HealthDataConsentModal from '../components/HealthDataConsentModal';
import MedicalDisclaimer from '../components/onboarding/MedicalDisclaimer';

// ============================================================================
// TYPES
// ============================================================================

interface SlimOnboardingData {
  // Step 1: Chi sei
  name: string;
  gender: 'M' | 'F';
  age: number;
  weight?: number; // Opzionale
  height?: number; // Opzionale

  // Step 2: Cosa vuoi
  goal: string;

  // Step 3: Dove e quanto
  location: 'gym' | 'home';
  trainingType: 'bodyweight' | 'equipment' | 'machines'; // Tipo allenamento
  frequency: number;
  // ⚠️ CRITICO: sessionDuration attiva adaptWorkoutToTimeLimit - NON RIMUOVERE
  sessionDuration: 30 | 45 | 60 | 90; // Durata sessione in minuti
  painAreas: PainEntry[];
  equipment?: Record<string, boolean>;
  screeningType: 'light' | 'full';
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Goal standard fitness/sport
const GOALS = [
  { value: 'forza', label: 'Forza', icon: '💪', desc: 'Diventa più forte' },
  { value: 'ipertrofia', label: 'Massa', icon: '🏋️', desc: 'Costruisci muscoli' },
  { value: 'tonificazione', label: 'Tonificazione', icon: '⚡', desc: 'Definisci il fisico' },
  { value: 'dimagrimento', label: 'Dimagrire', icon: '🔥', desc: 'Perdi grasso' },
  { value: 'resistenza', label: 'Resistenza', icon: '🏃', desc: 'Aumenta il fiato' },
  { value: 'prestazioni_sportive', label: 'Sport', icon: '🎯', desc: 'Migliora nello sport' },
  { value: 'benessere', label: 'Benessere', icon: '🧘', desc: 'Stai meglio' },
];

// Goal speciali con disclaimer medici
const SPECIAL_GOALS = [
  { value: 'motor_recovery', label: 'Recupero Motorio', icon: '🩹', desc: 'Post-infortunio o riabilitazione', disclaimer: 'recovery' },
  { value: 'pre_partum', label: 'Gravidanza', icon: '🤰', desc: 'Allenamento in gravidanza', disclaimer: 'pregnancy' },
  { value: 'post_partum', label: 'Post-Parto', icon: '👶', desc: 'Ripresa dopo il parto', disclaimer: 'pregnancy' },
  { value: 'disabilita', label: 'Esigenze Speciali', icon: '♿', desc: 'Adattamenti personalizzati', disclaimer: 'disability' },
];

const PAIN_AREAS: Array<{ value: PainArea; label: string; icon: string }> = [
  { value: 'neck', label: 'Collo', icon: '🦴' },
  { value: 'shoulder', label: 'Spalla', icon: '💪' },
  { value: 'lower_back', label: 'Lombare', icon: '⬇️' },
  { value: 'hip', label: 'Anca', icon: '🦴' },
  { value: 'knee', label: 'Ginocchio', icon: '🦵' },
  { value: 'ankle', label: 'Caviglia', icon: '👣' },
  { value: 'wrist', label: 'Polso', icon: '🤚' },
  { value: 'elbow', label: 'Gomito', icon: '💪' },
];

const HOME_EQUIPMENT = [
  { key: 'pullupBar', label: 'Sbarra trazioni', icon: '🔩' },
  { key: 'loopBands', label: 'Elastici', icon: '🔗' },
  { key: 'dumbbells', label: 'Manubri', icon: '🏋️' },
  { key: 'kettlebell', label: 'Kettlebell', icon: '🔔' },
  { key: 'bench', label: 'Panca', icon: '🛋️' },
  { key: 'rings', label: 'Anelli', icon: '⭕' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SlimOnboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showHealthConsent, setShowHealthConsent] = useState(false);
  const [healthConsentGranted, setHealthConsentGranted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [data, setData] = useState<SlimOnboardingData>({
    name: '',
    gender: 'M',
    age: 30,
    weight: undefined,
    goal: '',
    location: 'gym',
    trainingType: 'equipment', // Default: pesi liberi
    frequency: 3,
    sessionDuration: 60, // Default: 60 minuti
    painAreas: [],
    equipment: {},
    screeningType: 'light',
  });

  // Pain selection state
  const [showPainSelector, setShowPainSelector] = useState(false);
  const [selectedPainAreas, setSelectedPainAreas] = useState<PainArea[]>([]);

  // Equipment state (for home)
  const [showEquipment, setShowEquipment] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const updateData = (updates: Partial<SlimOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const togglePainArea = (area: PainArea) => {
    setSelectedPainAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const confirmPainAreas = () => {
    const painEntries: PainEntry[] = selectedPainAreas.map(area => ({
      area,
      severity: 'moderate' as const
    }));
    updateData({ painAreas: painEntries });
    setShowPainSelector(false);
  };

  const toggleEquipment = (key: string) => {
    updateData({
      equipment: {
        ...data.equipment,
        [key]: !data.equipment?.[key]
      }
    });
  };

  // ============================================================================
  // SAVE & COMPLETE
  // ============================================================================

  const handleComplete = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      // Converti SlimOnboardingData → OnboardingData standard
      const fullOnboardingData: Partial<OnboardingData> = {
        anagrafica: {
          firstName: data.name,
          lastName: '', // Non richiesto
          birthDate: '', // Non richiesto, usiamo età
          privacyAccepted: true,
          termsAccepted: true,
        },
        personalInfo: {
          gender: data.gender,
          age: data.age,
          height: data.height || null, // Sarà richiesto o calcolato dopo
          weight: data.weight || null, // Sarà richiesto o calcolato dopo
          bmi: data.weight && data.height ? +(data.weight / ((data.height / 100) ** 2)).toFixed(1) : 0,
        },
        goal: data.goal,
        goals: [data.goal],
        trainingLocation: data.location,
        trainingType: data.trainingType,
        frequency: data.frequency,
        // ╔════════════════════════════════════════════════════════════════════════════╗
        // ║  ⚠️  ATTENZIONE - SEZIONE CRITICA - NON MODIFICARE  ⚠️                     ║
        // ║                                                                            ║
        // ║  activityLevel.sessionDuration DEVE essere salvato per attivare           ║
        // ║  il sistema adaptWorkoutToTimeLimit in weeklySplitGenerator.ts            ║
        // ║                                                                            ║
        // ║  FLUSSO:                                                                   ║
        // ║  1. Utente seleziona durata (30/45/60/90 min) nello Step 3                ║
        // ║  2. Salvato in activityLevel.sessionDuration                              ║
        // ║  3. Dashboard legge: onboarding?.activityLevel?.sessionDuration           ║
        // ║  4. Passa a generateProgramWithSplit({ sessionDuration })                 ║
        // ║  5. weeklySplitGenerator chiama adaptWorkoutToTimeLimit se necessario     ║
        // ║                                                                            ║
        // ║  SE RIMOSSO: Il sistema NON adatterà i workout al tempo disponibile!      ║
        // ║                                                                            ║
        // ║  Data ultima modifica: 2025-01-30                                         ║
        // ╚════════════════════════════════════════════════════════════════════════════╝
        activityLevel: {
          weeklyFrequency: data.frequency,
          sessionDuration: data.sessionDuration,
        },
        painAreas: data.painAreas,
        equipment: data.equipment,
        screeningType: data.screeningType,
      };

      // Salva su Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          display_name: data.name,
          onboarding_data: fullOnboardingData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('[SLIM_ONBOARDING] Error saving profile:', profileError);
        throw profileError;
      }

      // Salva anche in localStorage per backup
      localStorage.setItem('onboarding_data', JSON.stringify(fullOnboardingData));

      console.log('[SLIM_ONBOARDING] Onboarding completato');

      // Naviga a OptionalQuizzes
      navigate('/optional-quizzes');

    } catch (error) {
      console.error('[SLIM_ONBOARDING] Error:', error);
      alert('Errore durante il salvataggio. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const isStep1Valid = data.name.trim().length >= 2 && data.age > 0 && data.age >= 14 && data.age <= 100;
  const isStep2Valid = data.goal !== '';
  const isStep3Valid = data.frequency >= 1 && data.frequency <= 7;

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: return isStep1Valid;
      case 1: return isStep2Valid;
      case 2: return isStep3Valid;
      default: return false;
    }
  };

  // ============================================================================
  // RENDER STEPS
  // ============================================================================

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Chi sei?</h2>
        <p className="text-slate-400 mt-2">Iniziamo con le basi</p>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Come ti chiami?
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Il tuo nome"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {/* Genere */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Genere
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'M', label: 'Maschio', icon: '👨' },
            { value: 'F', label: 'Femmina', icon: '👩' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({ gender: option.value as 'M' | 'F' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.gender === option.value
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-1">{option.icon}</div>
              <div className="font-semibold">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Età */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Età
        </label>
        <input
          type="number"
          min="14"
          max="100"
          value={data.age || ''}
          onChange={(e) => {
            const val = e.target.value;
            updateData({ age: val === '' ? 0 : parseInt(val) });
          }}
          placeholder="30"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {/* Altezza e Peso */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Altezza <span className="text-slate-500">(cm)</span>
          </label>
          <input
            type="number"
            min="100"
            max="250"
            value={data.height || ''}
            onChange={(e) => updateData({ height: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="170"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Peso <span className="text-slate-500">(kg)</span>
          </label>
          <input
            type="number"
            min="30"
            max="250"
            value={data.weight || ''}
            onChange={(e) => updateData({ weight: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="70"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
      </div>
    </motion.div>
  );

  // Disclaimer messages per goal speciali
  const getSpecialGoalDisclaimer = (disclaimer: string) => {
    switch (disclaimer) {
      case 'recovery':
        return {
          title: '⚠️ Nota importante sul recupero motorio',
          message: 'Questo programma supporta il recupero ma NON sostituisce la fisioterapia o il parere medico. Se sei in riabilitazione, consulta sempre il tuo specialista prima di iniziare.'
        };
      case 'pregnancy':
        return {
          title: '⚠️ Nota importante per la gravidanza',
          message: 'Prima di iniziare qualsiasi programma di allenamento in gravidanza o post-parto, è fondamentale ottenere il nulla osta dal tuo ginecologo o ostetrica.'
        };
      case 'disability':
        return {
          title: '⚠️ Adattamenti personalizzati',
          message: 'Il programma verrà adattato alle tue esigenze specifiche. Ti consigliamo di consultare il tuo medico o specialista per personalizzazioni ottimali.'
        };
      default:
        return null;
    }
  };

  const renderStep2 = () => {
    const selectedSpecialGoal = SPECIAL_GOALS.find(g => g.value === data.goal);
    const disclaimerInfo = selectedSpecialGoal ? getSpecialGoalDisclaimer(selectedSpecialGoal.disclaimer) : null;

    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Qual è il tuo obiettivo?</h2>
          <p className="text-slate-400 mt-2">Scegli il tuo focus principale</p>
        </div>

        {/* Goal standard */}
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(goal => (
            <button
              key={goal.value}
              type="button"
              onClick={() => updateData({ goal: goal.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.goal === goal.value
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">{goal.icon}</div>
              <div className="font-semibold">{goal.label}</div>
              <div className="text-xs text-slate-400 mt-1">{goal.desc}</div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-slate-800 text-slate-400">Esigenze speciali</span>
          </div>
        </div>

        {/* Goal speciali */}
        <div className="grid grid-cols-2 gap-3">
          {SPECIAL_GOALS.map(goal => (
            <button
              key={goal.value}
              type="button"
              onClick={() => updateData({ goal: goal.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.goal === goal.value
                  ? 'border-amber-500 bg-amber-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">{goal.icon}</div>
              <div className="font-semibold">{goal.label}</div>
              <div className="text-xs text-slate-400 mt-1">{goal.desc}</div>
            </button>
          ))}
        </div>

        {/* Disclaimer per goal speciali */}
        <AnimatePresence>
          {disclaimerInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-300 mb-1">{disclaimerInfo.title}</h4>
                  <p className="text-sm text-slate-300">{disclaimerInfo.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Dove e quanto?</h2>
        <p className="text-slate-400 mt-2">Ultimi dettagli</p>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Dove ti alleni?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              updateData({ location: 'gym', trainingType: 'equipment' });
              setShowEquipment(false);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.location === 'gym'
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Dumbbell className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">Palestra</div>
          </button>
          <button
            type="button"
            onClick={() => {
              updateData({ location: 'home', trainingType: 'bodyweight' });
              setShowEquipment(true);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.location === 'home'
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Home className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">Casa</div>
          </button>
        </div>
      </div>

      {/* Training Type (solo per palestra) */}
      <AnimatePresence>
        {data.location === 'gym' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Come preferisci allenarti?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateData({ trainingType: 'equipment' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.trainingType === 'equipment'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">🏋️</div>
                <div className="font-semibold">Pesi Liberi</div>
                <div className="text-xs text-slate-400 mt-1">Bilanciere, manubri</div>
              </button>
              <button
                type="button"
                onClick={() => updateData({ trainingType: 'machines' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.trainingType === 'machines'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">🔧</div>
                <div className="font-semibold">Macchine</div>
                <div className="text-xs text-slate-400 mt-1">Guidate, più sicure</div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equipment (solo per casa) */}
      <AnimatePresence>
        {showEquipment && data.location === 'home' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Che attrezzatura hai?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HOME_EQUIPMENT.map(eq => (
                <button
                  key={eq.key}
                  type="button"
                  onClick={() => toggleEquipment(eq.key)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    data.equipment?.[eq.key]
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xl">{eq.icon}</div>
                  <div className="text-xs mt-1">{eq.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Quante volte a settimana?
        </label>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="flex gap-2 flex-1">
            {(BETA_FLAGS.ADVANCED_SPLITS ? [2, 3, 4, 5, 6] : [2, 3, 4]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => updateData({ frequency: f })}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  data.frequency === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ⚠️ Session Duration - CRITICO per adaptWorkoutToTimeLimit - NON RIMUOVERE */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Quanto tempo hai per allenarti?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {([30, 45, 60, 90] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => updateData({ sessionDuration: d })}
              className={`py-3 rounded-lg font-bold transition-all ${
                data.sessionDuration === d
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="text-lg">{d}</div>
              <div className="text-xs opacity-75">min</div>
            </button>
          ))}
        </div>
      </div>

      {/* Screening Type */}
      {BETA_FLAGS.FULL_SCREENING ? (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tipo di assessment
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateData({ screeningType: 'light' })}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                data.screeningType === 'light'
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-semibold text-sm">Veloce</div>
              <div className="text-xs text-slate-400 mt-1">Test rapidi, inizia subito</div>
            </button>
            <button
              type="button"
              onClick={() => updateData({ screeningType: 'full' })}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                data.screeningType === 'full'
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-semibold text-sm">Completo</div>
              <div className="text-xs text-slate-400 mt-1">Assessment dettagliato</div>
            </button>
          </div>
        </div>
      ) : null}

      {/* Pain Areas */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Hai dolori articolari?
        </label>

        {!showPainSelector ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPainAreas([]);
                updateData({ painAreas: [] });
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.painAreas.length === 0 && !showPainSelector
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">No, tutto ok</div>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!healthConsentGranted) {
                  setShowHealthConsent(true);
                } else {
                  setShowPainSelector(true);
                }
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.painAreas.length > 0
                  ? 'border-amber-500 bg-amber-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">
                {data.painAreas.length > 0
                  ? `${data.painAreas.length} zona/e`
                  : 'Sì, dimmi dove'}
              </div>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
          >
            <p className="text-sm text-slate-400 mb-3">
              Seleziona le zone dolenti (puoi selezionarne più di una)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PAIN_AREAS.map(area => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => togglePainArea(area.value)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedPainAreas.includes(area.value)
                      ? 'border-amber-500 bg-amber-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xl">{area.icon}</div>
                  <div className="text-xs mt-1">{area.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPainSelector(false);
                  setSelectedPainAreas([]);
                }}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmPainAreas}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
              >
                Conferma ({selectedPainAreas.length})
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Medical Disclaimer
  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        onAccept={() => setShowDisclaimer(false)}
        language="it"
      />
    );
  }

  const totalSteps = 3;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Setup Rapido</h1>
            <span className="text-slate-400 text-sm">
              {currentStep + 1} di {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderStep1()}
            {currentStep === 1 && renderStep2()}
            {currentStep === 2 && renderStep3()}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 bg-slate-700 text-white py-4 rounded-lg font-semibold text-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Indietro
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={!isCurrentStepValid() || isSaving}
            className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvataggio...
              </>
            ) : currentStep === 2 ? (
              <>
                Completa
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Avanti
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Time estimate */}
        <p className="text-center text-slate-500 text-sm mt-4">
          ~{90 - (currentStep * 30)} secondi rimanenti
        </p>
      </div>

      {/* Health Data Consent Modal */}
      <HealthDataConsentModal
        isOpen={showHealthConsent}
        onAccept={() => {
          setHealthConsentGranted(true);
          setShowHealthConsent(false);
          setShowPainSelector(true);
        }}
        onDecline={() => {
          setShowHealthConsent(false);
        }}
        userId={user?.id || ''}
        language="it"
        allowSkip={true}
      />
    </div>
  );
}
