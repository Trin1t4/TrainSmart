import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';
import { motion } from 'framer-motion';
import { Dribbble, Target, Trophy, Users, Bike, Dumbbell, Timer, Waves, Footprints } from 'lucide-react';

interface GoalStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

// Sport icons mapping
const sportIcons: Record<string, React.ReactNode> = {
  calcio: <Dribbble className="w-6 h-6" />,
  basket: <Target className="w-6 h-6" />,
  pallavolo: <Trophy className="w-6 h-6" />,
  rugby: <Users className="w-6 h-6" />,
  tennis: <Target className="w-6 h-6" />,
  corsa: <Footprints className="w-6 h-6" />,
  nuoto: <Waves className="w-6 h-6" />,
  ciclismo: <Bike className="w-6 h-6" />,
  crossfit: <Timer className="w-6 h-6" />,
  powerlifting: <Dumbbell className="w-6 h-6" />,
  altro: <Trophy className="w-6 h-6" />
};

const getSportsOptions = (t: (key: string) => string) => [
  { value: 'calcio', label: t('sport.soccer') || 'Calcio', roles: [t('role.goalkeeper') || 'Portiere', t('role.defender') || 'Difensore', t('role.midfielder') || 'Centrocampista', t('role.striker') || 'Attaccante'] },
  { value: 'basket', label: t('sport.basketball') || 'Basket', roles: [t('role.pointGuard') || 'Playmaker', t('role.guard') || 'Guardia', t('role.forward') || 'Ala', t('role.center') || 'Centro'] },
  { value: 'pallavolo', label: t('sport.volleyball') || 'Pallavolo', roles: [t('role.setter') || 'Alzatore', t('role.opposite') || 'Opposto', t('role.middle') || 'Centrale', t('role.libero') || 'Libero', t('role.hitter') || 'Schiacciatore'] },
  { value: 'rugby', label: t('sport.rugby') || 'Rugby', roles: [t('role.back') || 'Tre Quarti', t('role.scrumHalf') || 'Mediano', t('role.prop') || 'Pilone', t('role.hooker') || 'Tallonatore', t('role.lock') || 'Seconda Linea'] },
  { value: 'tennis', label: t('sport.tennis') || 'Tennis', roles: [t('role.singles') || 'Singolare', t('role.doubles') || 'Doppio'] },
  { value: 'corsa', label: t('sport.running') || 'Corsa', roles: [t('role.sprint') || 'Sprint (100-400m)', t('role.long') || 'Fondo (5K+)'] },
  { value: 'nuoto', label: t('sport.swimming') || 'Nuoto', roles: [t('role.freestyle') || 'Stile Libero', t('role.breaststroke') || 'Rana', t('role.backstroke') || 'Dorso', t('role.butterfly') || 'Farfalla', t('role.medley') || 'Misto'] },
  { value: 'ciclismo', label: t('sport.cycling') || 'Ciclismo', roles: [t('role.road') || 'Strada', t('role.mtb') || 'MTB', t('role.track') || 'Pista'] },
  { value: 'crossfit', label: t('sport.crossfit') || 'CrossFit', roles: [] },
  { value: 'powerlifting', label: t('sport.powerlifting') || 'Powerlifting', roles: [] },
  { value: 'altro', label: t('sport.other') || 'Altro Sport', roles: [] }
];

// Fasi stagionali
const SEASON_PHASES = [
  { value: 'off_season', label: 'Off-Season', desc: 'Costruisci forza base e massa' },
  { value: 'pre_season', label: 'Pre-Season', desc: 'Potenza esplosiva e condizionamento' },
  { value: 'in_season', label: 'In-Season', desc: 'Mantenimento e recupero' }
];

export default function GoalStep({ data, onNext }: GoalStepProps) {
  const { t } = useTranslation();
  const [sport, setSport] = useState(data.sport || '');
  const [sportRole, setSportRole] = useState(data.sportRole || '');
  const [seasonPhase, setSeasonPhase] = useState(data.seasonPhase || 'off_season');

  const SPORTS_OPTIONS = getSportsOptions(t);

  const selectedSport = SPORTS_OPTIONS.find(s => s.value === sport);
  const sportRoles = selectedSport?.roles || [];

  const handleSubmit = () => {
    if (!sport) return;

    onNext({
      goal: 'prestazioni_sportive', // Sempre sport performance per TeamFlow
      goals: ['prestazioni_sportive'],
      sport,
      sportRole,
      seasonPhase
    });
  };

  const isValid = sport !== '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Quale sport pratichi?
        </h2>
        <p className="text-slate-400">
          Creeremo un programma di preparazione atletica specifico per il tuo sport
        </p>
      </div>

      {/* Sport Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SPORTS_OPTIONS.map((sportOption, index) => (
          <motion.button
            key={sportOption.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              setSport(sportOption.value);
              setSportRole(''); // Reset role when changing sport
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
              sport === sportOption.value
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-300'
            }`}
          >
            <div className={sport === sportOption.value ? 'text-orange-400' : 'text-slate-400'}>
              {sportIcons[sportOption.value]}
            </div>
            <span className="font-medium text-sm">{sportOption.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Role Selection (if sport has roles) */}
      {sport && sportRoles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-slate-200">
            Qual è il tuo ruolo?
          </h3>
          <div className="flex flex-wrap gap-2">
            {sportRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSportRole(role)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  sportRole === role
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Season Phase Selection */}
      {sport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-slate-200">
            In che fase della stagione sei?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SEASON_PHASES.map((phase) => (
              <button
                key={phase.value}
                onClick={() => setSeasonPhase(phase.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  seasonPhase === phase.value
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className={`font-semibold ${seasonPhase === phase.value ? 'text-blue-400' : 'text-slate-200'}`}>
                  {phase.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{phase.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      {sport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
        >
          <h4 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Cosa include il tuo programma
          </h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Esercizi fondamentali (Squat, Panca, Stacco) per forza base</li>
            <li>• Accessori specifici per prevenzione infortuni {selectedSport?.label}</li>
            <li>• Periodizzazione adattata alla fase stagionale</li>
            <li>• Esercizi esplosivi per potenza sport-specifica</li>
          </ul>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: isValid ? 1.02 : 1 }}
        whileTap={{ scale: isValid ? 0.98 : 1 }}
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isValid
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        Continua
      </motion.button>
    </div>
  );
}
