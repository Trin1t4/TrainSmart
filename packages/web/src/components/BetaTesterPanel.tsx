/**
 * Beta Tester Panel - Quick controls for testing different user configurations
 * Allows testers to quickly switch between levels, goals, locations, and pain areas
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Target,
  MapPin,
  AlertTriangle,
  Clock,
  Calendar,
  RotateCcw,
  Zap,
  Home,
  Building2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Configuration options
const LEVELS = [
  { id: 'beginner', label: 'Principiante', color: 'emerald', icon: '🌱' },
  { id: 'intermediate', label: 'Intermedio', color: 'blue', icon: '💪' },
  { id: 'advanced', label: 'Avanzato', color: 'purple', icon: '🔥' },
] as const;

const GOALS = [
  { id: 'forza', label: 'Forza', icon: '💪' },
  { id: 'ipertrofia', label: 'Ipertrofia', icon: '🏋️' },
  { id: 'dimagrimento', label: 'Dimagrimento', icon: '🔥' },
  { id: 'resistenza', label: 'Resistenza', icon: '🏃' },
] as const;

const LOCATIONS = [
  { id: 'gym', label: 'Palestra', icon: Building2 },
  { id: 'home', label: 'Casa', icon: Home },
] as const;

const PAIN_AREAS = [
  { id: 'lower_back', label: 'Schiena', icon: '🔙' },
  { id: 'shoulder', label: 'Spalle', icon: '🦾' },
  { id: 'knee', label: 'Ginocchia', icon: '🦵' },
  { id: 'neck', label: 'Collo', icon: '🦒' },
  { id: 'wrist', label: 'Polsi', icon: '✋' },
  { id: 'elbow', label: 'Gomiti', icon: '💪' },
] as const;

const FREQUENCIES = [2, 3, 4, 5, 6] as const;
const DURATIONS = [30, 45, 60, 75, 90] as const;

interface BetaTesterPanelProps {
  compact?: boolean;
}

export default function BetaTesterPanel({ compact = false }: BetaTesterPanelProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const {
    betaOverrides,
    setBetaOverride,
    resetBetaOverrides,
    onboardingData,
    clearOnboardingData,
  } = useAppStore();

  // Count active overrides
  const activeOverridesCount = Object.values(betaOverrides).filter(v => v !== null).length;

  // Toggle pain area
  const togglePainArea = (areaId: string) => {
    const currentAreas = betaOverrides.painAreas || [];
    const exists = currentAreas.find(p => p.area === areaId);

    if (exists) {
      const newAreas = currentAreas.filter(p => p.area !== areaId);
      setBetaOverride('painAreas', newAreas.length > 0 ? newAreas : null);
    } else {
      setBetaOverride('painAreas', [...currentAreas, { area: areaId, intensity: 5 }]);
    }
  };

  // Quick preset configurations
  const applyPreset = (preset: 'beginner-home' | 'advanced-gym' | 'rehab') => {
    switch (preset) {
      case 'beginner-home':
        setBetaOverride('fitnessLevel', 'beginner');
        setBetaOverride('location', 'home');
        setBetaOverride('goal', 'dimagrimento');
        setBetaOverride('frequency', 3);
        setBetaOverride('painAreas', null);
        break;
      case 'advanced-gym':
        setBetaOverride('fitnessLevel', 'advanced');
        setBetaOverride('location', 'gym');
        setBetaOverride('goal', 'forza');
        setBetaOverride('frequency', 5);
        setBetaOverride('painAreas', null);
        break;
      case 'rehab':
        setBetaOverride('fitnessLevel', 'beginner');
        setBetaOverride('location', 'gym');
        setBetaOverride('goal', 'resistenza');
        setBetaOverride('frequency', 3);
        setBetaOverride('painAreas', [
          { area: 'lower_back', intensity: 6 },
          { area: 'knee', intensity: 4 }
        ]);
        break;
    }
    toast.success('Preset applicato! Rigenera il programma per vedere le modifiche.');
  };

  // Generate new program with current overrides
  const regenerateProgram = () => {
    // Clear current program to force regeneration
    localStorage.removeItem('currentProgram');
    toast.success('Programma resettato. Vai alla Dashboard per generarne uno nuovo.');
    navigate('/dashboard');
  };

  if (compact && !isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 right-4 z-50 bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FlaskConical className="w-5 h-5" />
        {activeOverridesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {activeOverridesCount}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-amber-900/40 to-orange-900/30 border border-amber-500/30 rounded-xl overflow-hidden ${
        compact ? 'fixed bottom-20 right-4 z-50 w-80 max-h-[70vh] overflow-y-auto shadow-2xl' : ''
      }`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => compact && setIsExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-amber-400">Beta Tester Panel</span>
          {activeOverridesCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">
              {activeOverridesCount} attivi
            </span>
          )}
        </div>
        {compact && (
          <ChevronDown className="w-5 h-5 text-amber-400" />
        )}
      </div>

      {/* Quick Presets */}
      <div className="px-4 pb-3 border-b border-amber-500/20">
        <p className="text-xs text-slate-400 mb-2">Preset rapidi:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => applyPreset('beginner-home')}
            className="text-xs px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
          >
            🏠 Principiante Casa
          </button>
          <button
            onClick={() => applyPreset('advanced-gym')}
            className="text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
          >
            🏋️ Avanzato Palestra
          </button>
          <button
            onClick={() => applyPreset('rehab')}
            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            🩹 Rehab Mode
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Level */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Livello</span>
            {betaOverrides.fitnessLevel && (
              <button
                onClick={() => setBetaOverride('fitnessLevel', null)}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setBetaOverride('fitnessLevel', level.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  betaOverrides.fitnessLevel === level.id
                    ? level.color === 'emerald'
                      ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400 border'
                      : level.color === 'blue'
                      ? 'bg-blue-500/30 border-blue-500 text-blue-400 border'
                      : 'bg-purple-500/30 border-purple-500 text-purple-400 border'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                }`}
              >
                {level.icon} {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Obiettivo</span>
            {betaOverrides.goal && (
              <button
                onClick={() => setBetaOverride('goal', null)}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => setBetaOverride('goal', goal.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  betaOverrides.goal === goal.id
                    ? 'bg-blue-500/30 border-blue-500 text-blue-400 border'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                }`}
              >
                {goal.icon} {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Location</span>
            {betaOverrides.location && (
              <button
                onClick={() => setBetaOverride('location', null)}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                onClick={() => setBetaOverride('location', loc.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  betaOverrides.location === loc.id
                    ? 'bg-cyan-500/30 border-cyan-500 text-cyan-400 border'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                }`}
              >
                <loc.icon className="w-4 h-4" />
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Areas */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Zone Dolore</span>
            {betaOverrides.painAreas && betaOverrides.painAreas.length > 0 && (
              <button
                onClick={() => setBetaOverride('painAreas', null)}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PAIN_AREAS.map(area => {
              const isActive = betaOverrides.painAreas?.some(p => p.area === area.id);
              return (
                <button
                  key={area.id}
                  onClick={() => togglePainArea(area.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-red-500/30 border-red-500 text-red-400 border'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                  }`}
                >
                  {area.icon} {area.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Frequenza</span>
            </div>
            <div className="flex gap-1">
              {FREQUENCIES.map(freq => (
                <button
                  key={freq}
                  onClick={() => setBetaOverride('frequency', betaOverrides.frequency === freq ? null : freq)}
                  className={`flex-1 p-1.5 rounded text-xs font-medium transition-all ${
                    betaOverrides.frequency === freq
                      ? 'bg-indigo-500/30 border-indigo-500 text-indigo-400 border'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                  }`}
                >
                  {freq}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Durata</span>
            </div>
            <div className="flex gap-1">
              {DURATIONS.slice(0, 4).map(dur => (
                <button
                  key={dur}
                  onClick={() => setBetaOverride('sessionDuration', betaOverrides.sessionDuration === dur ? null : dur)}
                  className={`flex-1 p-1.5 rounded text-xs font-medium transition-all ${
                    betaOverrides.sessionDuration === dur
                      ? 'bg-indigo-500/30 border-indigo-500 text-indigo-400 border'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:border-slate-600'
                  }`}
                >
                  {dur}'
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-amber-500/20 space-y-2">
        <button
          onClick={regenerateProgram}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          Applica e Rigenera Programma
        </button>

        <div className="flex gap-2">
          <button
            onClick={resetBetaOverrides}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Override
          </button>
          <button
            onClick={() => {
              if (confirm('Vuoi resettare tutti i dati e ricominciare da zero?')) {
                clearOnboardingData();
                localStorage.removeItem('onboarding_data');
                localStorage.removeItem('screening_results');
                localStorage.removeItem('quiz_data');
                localStorage.removeItem('currentProgram');
                resetBetaOverrides();
                toast.success('Tutti i dati resettati!');
                navigate('/onboarding');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Reset Totale
          </button>
        </div>
      </div>

      {/* Current state summary */}
      {activeOverridesCount > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Override attivi:</p>
            <div className="flex flex-wrap gap-1">
              {betaOverrides.fitnessLevel && (
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                  Livello: {betaOverrides.fitnessLevel}
                </span>
              )}
              {betaOverrides.goal && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                  Goal: {betaOverrides.goal}
                </span>
              )}
              {betaOverrides.location && (
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                  Location: {betaOverrides.location}
                </span>
              )}
              {betaOverrides.painAreas && betaOverrides.painAreas.length > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                  Dolore: {betaOverrides.painAreas.map(p => p.area).join(', ')}
                </span>
              )}
              {betaOverrides.frequency && (
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                  {betaOverrides.frequency}x/sett
                </span>
              )}
              {betaOverrides.sessionDuration && (
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                  {betaOverrides.sessionDuration} min
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
