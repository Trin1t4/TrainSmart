import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

interface GoalStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

// Goal organizzati per categoria
const getGoalOptions = (t: (key: string) => string) => [
  // FITNESS GOALS
  { value: 'forza', label: t('onboarding.goal.strength'), desc: t('onboarding.goal.strengthDesc'), category: 'fitness' },
  { value: 'ipertrofia', label: t('onboarding.goal.hypertrophy'), desc: t('onboarding.goal.hypertrophyDesc'), category: 'fitness' },
  { value: 'tonificazione', label: t('onboarding.goal.toning'), desc: t('onboarding.goal.toningDesc'), category: 'fitness' },
  { value: 'dimagrimento', label: t('onboarding.goal.weight_loss'), desc: t('onboarding.goal.weightLossDesc'), category: 'fitness' },
  { value: 'resistenza', label: t('onboarding.goal.endurance'), desc: t('onboarding.goal.enduranceDesc'), category: 'fitness' },
  // SPORT & WELLNESS
  { value: 'prestazioni_sportive', label: t('onboarding.goal.sport'), desc: t('onboarding.goal.sportsDesc'), category: 'sport' },
  { value: 'corsa', label: t('onboarding.goal.running'), desc: t('onboarding.goal.runningDesc'), category: 'sport' },
  { value: 'benessere', label: t('onboarding.goal.wellness'), desc: t('onboarding.goal.wellnessDesc'), category: 'wellness' },
  // SPECIAL NEEDS
  { value: 'motor_recovery', label: t('onboarding.goal.motorRecovery'), desc: t('onboarding.goal.motorRecoveryDesc'), category: 'health', disclaimer: 'recovery' },
  { value: 'pre_partum', label: t('onboarding.goal.prePartum'), desc: t('onboarding.goal.prePartumDesc'), category: 'health', disclaimer: 'pregnancy' },
  { value: 'post_partum', label: t('onboarding.goal.postPartum'), desc: t('onboarding.goal.postPartumDesc'), category: 'health', disclaimer: 'pregnancy' },
  { value: 'disabilita', label: t('onboarding.goal.disability'), desc: t('onboarding.goal.disabilityDesc'), category: 'health', disclaimer: 'disability' }
];

const getSportsOptions = (t: (key: string) => string) => [
  { value: 'calcio', label: t('sport.soccer'), roles: [t('role.goalkeeper'), t('role.defender'), t('role.midfielder'), t('role.striker')] },
  { value: 'basket', label: t('sport.basketball'), roles: [t('role.pointGuard'), t('role.guard'), t('role.forward'), t('role.center')] },
  { value: 'pallavolo', label: t('sport.volleyball'), roles: [t('role.setter'), t('role.opposite'), t('role.middle'), t('role.libero'), t('role.hitter')] },
  { value: 'rugby', label: t('sport.rugby'), roles: [t('role.back'), t('role.scrumHalf'), t('role.prop'), t('role.hooker'), t('role.lock')] },
  { value: 'tennis', label: t('sport.tennis'), roles: [t('role.singles'), t('role.doubles')] },
  { value: 'corsa', label: t('sport.running'), roles: [t('role.sprint'), t('role.long')] },
  { value: 'nuoto', label: t('sport.swimming'), roles: [t('role.freestyle'), t('role.breaststroke'), t('role.backstroke'), t('role.butterfly'), t('role.medley')] },
  { value: 'ciclismo', label: t('sport.cycling'), roles: [t('role.road'), t('role.mtb'), t('role.track')] },
  { value: 'crossfit', label: t('sport.crossfit'), roles: [] },
  { value: 'powerlifting', label: t('sport.powerlifting'), roles: [] },
  { value: 'altro', label: t('sport.other'), roles: [] }
];

const getMuscularFocusOptions = (t: (key: string) => string) => [
  { value: '', label: t('onboarding.goal.noFocus'), desc: t('onboarding.goal.noFocusDesc') },
  { value: 'glutei', label: t('muscles.glutes'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'addome', label: t('muscles.abs'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'petto', label: t('muscles.chest'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'dorso', label: t('muscles.back'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'spalle', label: t('muscles.shoulders'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'gambe', label: t('muscles.legs'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'braccia', label: t('muscles.arms'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'polpacci', label: t('muscles.calves'), desc: t('onboarding.goal.increasedVolume') }
];

export default function GoalStep({ data, onNext, onBack }: GoalStepProps) {
  const { t } = useTranslation();
  // Multi-goal support: array di goals (max 3)
  const [goals, setGoals] = useState<string[]>(
    data.goals || (data.goal ? [data.goal] : [])
  );
  const [sport, setSport] = useState(data.sport || '');
  const [sportRole, setSportRole] = useState(data.sportRole || '');
  // Multi-select muscular focus (array instead of string)
  const [muscularFocus, setMuscularFocus] = useState<string[]>(
    Array.isArray(data.muscularFocus)
      ? data.muscularFocus
      : data.muscularFocus
        ? [data.muscularFocus]
        : []
  );

  // Screening gambe per donne
  const [legsGoalType, setLegsGoalType] = useState<'toning' | 'slimming' | 'rebalance' | null>(
    (data as any).legsGoalType || null
  );
  const isFemale = data.personalInfo?.gender === 'F';

  const GOAL_OPTIONS = getGoalOptions(t);
  const SPORTS_OPTIONS = getSportsOptions(t);
  const MUSCULAR_FOCUS_OPTIONS = getMuscularFocusOptions(t);

  const selectedSport = SPORTS_OPTIONS.find(s => s.value === sport);
  const sportRoles = selectedSport?.roles || [];

  // Toggle selection di un goal
  const toggleGoal = (goalValue: string) => {
    setGoals(prev => {
      if (prev.includes(goalValue)) {
        // Deseleziona
        const newGoals = prev.filter(g => g !== goalValue);
        if (goalValue === 'prestazioni_sportive') {
          setSport('');
          setSportRole('');
        }
        return newGoals;
      } else {
        // Seleziona (max 3) - blocca il 4°
        if (prev.length >= 3) {
          return prev; // Non permette più di 3
        }
        return [...prev, goalValue];
      }
    });
  };

  // Toggle muscular focus selection (multi-select)
  const toggleMuscularFocus = (focusValue: string) => {
    // Empty string = "Nessun focus specifico" → deselect all
    if (focusValue === '') {
      setMuscularFocus([]);
      setLegsGoalType(null); // Reset legs screening
      return;
    }

    setMuscularFocus(prev => {
      if (prev.includes(focusValue)) {
        // Deselect
        if (focusValue === 'gambe') {
          setLegsGoalType(null); // Reset legs screening when deselecting legs
        }
        return prev.filter(f => f !== focusValue);
      } else {
        // Select (max 3 muscle groups)
        if (prev.length >= 3) {
          return prev; // Don't allow more than 3
        }
        return [...prev, focusValue];
      }
    });
  };

  // Check if we need to show legs screening (female + legs selected)
  const showLegsScreening = isFemale && muscularFocus.includes('gambe');

  const handleSubmit = () => {
    if (goals.length === 0) return;
    if (goals.includes('prestazioni_sportive') && !sport) return;
    // If female selected legs, must choose a legs goal type
    if (showLegsScreening && !legsGoalType) return;

    onNext({
      goal: goals[0], // backward compatibility
      goals, // multi-goal array
      sport: goals.includes('prestazioni_sportive') ? sport : '',
      sportRole: goals.includes('prestazioni_sportive') ? sportRole : '',
      // Multi-select muscular focus (array)
      muscularFocus: (goals.includes('ipertrofia') || goals.includes('tonificazione')) ? muscularFocus : [],
      // Legs goal type for females (PHA, rebalance, or standard toning)
      legsGoalType: showLegsScreening ? legsGoalType : undefined
    });
  };

  const isValid = goals.length > 0 &&
    (!goals.includes('prestazioni_sportive') || sport) &&
    (!showLegsScreening || legsGoalType);

  // Controlla se ha selezionato goal che richiedono UI aggiuntive
  const showSportSelection = goals.includes('prestazioni_sportive');
  const showMuscularFocus = goals.includes('ipertrofia') || goals.includes('tonificazione');

  // Disclaimer per goal speciali
  const showMotorRecoveryDisclaimer = goals.includes('motor_recovery');
  const showPregnancyDisclaimer = goals.includes('pre_partum') || goals.includes('post_partum');
  const showDisabilityDisclaimer = goals.includes('disabilita');
  const showWeightLossDisclaimer = goals.includes('dimagrimento');

  // Separa goal per categoria
  const fitnessGoals = GOAL_OPTIONS.filter(g => g.category === 'fitness');
  const sportWellnessGoals = GOAL_OPTIONS.filter(g => g.category === 'sport' || g.category === 'wellness');
  const healthGoals = GOAL_OPTIONS.filter(g => g.category === 'health');

  // Goal icons mapping
  const goalIcons: Record<string, string> = {
    // Fitness goals
    'forza': '💪',
    'ipertrofia': '🏋️',
    'tonificazione': '✨',
    'dimagrimento': '🔥',
    'resistenza': '🏃',
    // Sport & Wellness
    'prestazioni_sportive': '⚽',
    'benessere': '🧘',
    // Health
    'motor_recovery': '⚕️',
    'pre_partum': '🤰',
    'post_partum': '👶',
    'disabilita': '♿'
  };

  // Componente card riutilizzabile
  const GoalCard = ({ opt, colorScheme = 'emerald' }: { opt: typeof GOAL_OPTIONS[0], colorScheme?: 'emerald' | 'cyan' }) => {
    const isSelected = goals.includes(opt.value);
    const isDisabled = !isSelected && goals.length >= 3;
    const colors = colorScheme === 'cyan'
      ? {
          border: 'border-cyan-500',
          bg: 'from-cyan-500/20 to-cyan-600/10',
          shadow: 'shadow-cyan-500/10',
          check: 'bg-cyan-500',
          iconBg: 'bg-cyan-500/20',
          titleHover: 'group-hover:text-cyan-300',
          title: 'text-white'
        }
      : {
          border: 'border-emerald-500',
          bg: 'from-emerald-500/20 to-emerald-600/10',
          shadow: 'shadow-emerald-500/10',
          check: 'bg-emerald-500',
          iconBg: 'bg-emerald-500/20',
          titleHover: 'group-hover:text-emerald-300',
          title: 'text-white'
        };

    const icon = goalIcons[opt.value] || '🎯';

    return (
      <button
        onClick={() => toggleGoal(opt.value)}
        disabled={isDisabled}
        className={`group p-5 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden ${
          isSelected
            ? `${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg ${colors.shadow} scale-[1.02] hover:scale-[1.03]`
            : isDisabled
            ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed opacity-40'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/60 hover:scale-[1.01] hover:shadow-md'
        }`}
      >
        {/* Decorative gradient overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        )}

        {/* Checkmark badge */}
        {isSelected && (
          <div className={`absolute top-3 right-3 w-6 h-6 ${colors.check} rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-lg mb-3 text-2xl transition-all ${
          isSelected
            ? `${colors.iconBg} ring-2 ring-white/20`
            : 'bg-slate-700/50 group-hover:bg-slate-600/50'
        }`}>
          {icon}
        </div>

        {/* Title - INCREASED SIZE & CONTRAST */}
        <div className={`font-bold text-base mb-2 leading-tight transition-colors ${
          isSelected
            ? colors.title
            : `text-slate-200 ${!isDisabled ? colors.titleHover : ''}`
        }`}>
          {opt.label}
        </div>

        {/* Description - SMALLER & MUTED */}
        <p className={`text-xs leading-relaxed transition-colors ${
          isSelected
            ? 'text-slate-300/90'
            : 'text-slate-500 group-hover:text-slate-400'
        }`}>
          {opt.desc}
        </p>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con contatore */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{t('onboarding.goal.title')}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            goals.length === 3
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {goals.length}/3
          </span>
        </div>
        <p className="text-slate-400">
          {t('onboarding.goal.subtitle')}
        </p>

        {/* Selected goals pills */}
        {goals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {goals.map((g) => {
              const goalOpt = GOAL_OPTIONS.find(o => o.value === g);
              return (
                <span
                  key={g}
                  className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/30"
                >
                  {goalOpt?.label || g}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* FITNESS GOALS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Fitness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fitnessGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} />
          ))}
        </div>
      </div>

      {/* SPORT & WELLNESS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">Sport & Benessere</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sportWellnessGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} />
          ))}
        </div>
      </div>

      {/* HEALTH & SPECIAL NEEDS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Salute & Esigenze Speciali</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} colorScheme="cyan" />
          ))}
        </div>
      </div>

      {/* DISCLAIMER RECUPERO MOTORIO */}
      {showMotorRecoveryDisclaimer && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚕️</div>
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-2">{t('onboarding.goal.importantNote')}</p>
              <ul className="text-xs text-blue-200 space-y-1.5">
                <li>{t('onboarding.goal.recoveryNote1')}</li>
                <li>{t('onboarding.goal.recoveryNote2')}</li>
                <li>{t('onboarding.goal.recoveryNote3')}</li>
                <li>{t('onboarding.goal.recoveryNote4')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER GRAVIDANZA */}
      {showPregnancyDisclaimer && (
        <div className="bg-pink-500/10 border border-pink-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤰</div>
            <div>
              <p className="text-sm font-semibold text-pink-300 mb-2">{t('onboarding.goal.pregnancyImportant')}</p>
              <ul className="text-xs text-pink-200 space-y-1.5">
                <li>{t('onboarding.goal.pregnancyNote1')}</li>
                <li>{t('onboarding.goal.pregnancyNote2')}</li>
                <li>{t('onboarding.goal.pregnancyNote3')}</li>
                <li>{t('onboarding.goal.pregnancyNote4')}</li>
              </ul>
              {goals.includes('post_partum') && (
                <div className="mt-3 pt-3 border-t border-pink-500/30">
                  <p className="text-xs text-pink-300 font-medium mb-1">{t('onboarding.goal.postPartumIncludes')}</p>
                  <p className="text-xs text-pink-200">{t('onboarding.goal.postPartumFeatures')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER DISABILITÀ */}
      {showDisabilityDisclaimer && (
        <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">♿</div>
            <div>
              <p className="text-sm font-semibold text-purple-300 mb-2">{t('onboarding.goal.disabilityImportant')}</p>
              <ul className="text-xs text-purple-200 space-y-1.5">
                <li>{t('onboarding.goal.disabilityNote1')}</li>
                <li>{t('onboarding.goal.disabilityNote2')}</li>
                <li>{t('onboarding.goal.disabilityNote3')}</li>
                <li>{t('onboarding.goal.disabilityNote4')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER DIMAGRIMENTO */}
      {showWeightLossDisclaimer && (
        <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-orange-300 mb-2">Informazione Importante sul Dimagrimento</p>
              <p className="text-xs text-orange-200 mb-3">
                La base per dimagrire è il <strong className="text-orange-100">deficit calorico</strong>.
                Il dimagrimento si ottiene combinando l'attività fisica con una <strong className="text-orange-100">dieta equilibrata e ipocalorica</strong>.
              </p>
              <p className="text-xs text-orange-200 mb-3">
                L'allenamento ti aiuterà a:
              </p>
              <ul className="text-xs text-orange-200 space-y-1.5 mb-3">
                <li>• Aumentare il dispendio calorico giornaliero</li>
                <li>• Preservare la massa muscolare durante il deficit</li>
                <li>• Migliorare il metabolismo basale</li>
                <li>• Favorire la ricomposizione corporea</li>
              </ul>
              <div className="pt-3 border-t border-orange-500/30">
                <p className="text-xs text-orange-300 font-medium">
                  📋 Consulta un nutrizionista o un dietologo per un piano alimentare personalizzato che accompagni il tuo programma di allenamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MUSCULAR FOCUS - Condizionale per ipertrofia/tonificazione (MULTI-SELECT) */}
      {showMuscularFocus && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {t('onboarding.goal.muscularFocus')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('onboarding.goal.muscularFocusDesc')}
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              💪 Seleziona fino a 3 distretti - riceveranno serie extra o superset
            </p>
            {muscularFocus.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {muscularFocus.map((f) => {
                  const focusOpt = MUSCULAR_FOCUS_OPTIONS.find(o => o.value === f);
                  return (
                    <span key={f} className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
                      {focusOpt?.label || f}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MUSCULAR_FOCUS_OPTIONS.map((opt) => {
              const isSelected = muscularFocus.includes(opt.value);
              const isDisabled = !isSelected && muscularFocus.length >= 3 && opt.value !== '';

              // Muscle group icons
              const muscleIcons: Record<string, string> = {
                '': '🚫',
                'glutei': '🍑',
                'addome': '💎',
                'petto': '🦅',
                'dorso': '🛡️',
                'spalle': '⛰️',
                'gambe': '🦵',
                'braccia': '💪',
                'polpacci': '🦿'
              };

              const muscleIcon = muscleIcons[opt.value] || '💪';

              return (
                <button
                  key={opt.value}
                  onClick={() => toggleMuscularFocus(opt.value)}
                  disabled={isDisabled}
                  className={`group p-4 rounded-lg border-2 text-left transition-all duration-200 relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 shadow-md shadow-emerald-500/10 scale-[1.01]'
                      : isDisabled
                      ? 'border-slate-700 bg-slate-800/50 cursor-not-allowed opacity-50'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/70 hover:scale-[1.01]'
                  }`}
                >
                  {isSelected && opt.value !== '' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 ring-2 ring-white/20'
                        : 'bg-slate-600/50 group-hover:bg-slate-600/70'
                    }`}>
                      {muscleIcon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title - BOLD & LARGER */}
                      <div className={`font-bold text-sm mb-1 transition-colors ${
                        isSelected
                          ? 'text-white'
                          : 'text-slate-200 group-hover:text-slate-100'
                      }`}>
                        {opt.label}
                      </div>
                      {/* Description - MUTED */}
                      <div className={`text-xs transition-colors ${
                        isSelected
                          ? 'text-slate-300/90'
                          : 'text-slate-500 group-hover:text-slate-400'
                      }`}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LEGS SCREENING - Solo per donne che selezionano "gambe" */}
      {showLegsScreening && (
        <div className="space-y-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-5 border border-pink-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-xl">
              🦵
            </div>
            <div>
              <h4 className="font-bold text-white">Qual è il tuo obiettivo per le gambe?</h4>
              <p className="text-xs text-pink-200/80">Personalizzeremo il programma in base alle tue esigenze</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Opzione 1: Tono e volume */}
            <button
              onClick={() => setLegsGoalType('toning')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                legsGoalType === 'toning'
                  ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/10'
                  : 'border-slate-600 bg-slate-800/50 hover:border-pink-500/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  legsGoalType === 'toning' ? 'bg-pink-500/30' : 'bg-slate-700'
                }`}>
                  💪
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${legsGoalType === 'toning' ? 'text-white' : 'text-slate-200'}`}>
                    Più tono e definizione muscolare
                  </div>
                  <div className={`text-xs mt-1 ${legsGoalType === 'toning' ? 'text-pink-200' : 'text-slate-400'}`}>
                    Costruire muscolo, glutei sodi, cosce definite
                  </div>
                </div>
                {legsGoalType === 'toning' && (
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Opzione 2: Snellire/Drenare (PHA) */}
            <button
              onClick={() => setLegsGoalType('slimming')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                legsGoalType === 'slimming'
                  ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-600 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  legsGoalType === 'slimming' ? 'bg-cyan-500/30' : 'bg-slate-700'
                }`}>
                  💧
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${legsGoalType === 'slimming' ? 'text-white' : 'text-slate-200'}`}>
                    Snellire e drenare le gambe
                  </div>
                  <div className={`text-xs mt-1 ${legsGoalType === 'slimming' ? 'text-cyan-200' : 'text-slate-400'}`}>
                    Gambe pesanti, ritenzione idrica, cellulite - Programma PHA circolatorio
                  </div>
                </div>
                {legsGoalType === 'slimming' && (
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Opzione 3: Riequilibrare proporzioni */}
            <button
              onClick={() => setLegsGoalType('rebalance')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                legsGoalType === 'rebalance'
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                  : 'border-slate-600 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  legsGoalType === 'rebalance' ? 'bg-purple-500/30' : 'bg-slate-700'
                }`}>
                  ⚖️
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${legsGoalType === 'rebalance' ? 'text-white' : 'text-slate-200'}`}>
                    Riequilibrare le proporzioni
                  </div>
                  <div className={`text-xs mt-1 ${legsGoalType === 'rebalance' ? 'text-purple-200' : 'text-slate-400'}`}>
                    Valorizzare spalle e schiena, mantenere le gambe - Silhouette più armonica
                  </div>
                </div>
                {legsGoalType === 'rebalance' && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Info box in base alla selezione */}
          {legsGoalType === 'slimming' && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mt-2">
              <p className="text-xs text-cyan-200">
                <strong>Programma PHA:</strong> Alterna esercizi upper/lower per massimizzare la circolazione,
                drenare i liquidi e ridurre la sensazione di gambe pesanti.
              </p>
            </div>
          )}
          {legsGoalType === 'rebalance' && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
              <p className="text-xs text-purple-200">
                <strong>Programma Riproporzione:</strong> Focus su spalle, schiena e braccia per creare
                una silhouette più bilanciata. Le gambe lavoreranno in mantenimento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sport Selection - CONDIZIONALE */}
      {showSportSelection && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.goal.whichSport')}</label>
            <select
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setSportRole('');
              }}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">{t('onboarding.goal.selectSport')}</option>
              {SPORTS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {sport && sportRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.goal.rolePosition')}</label>
              <select
                value={sportRole}
                onChange={(e) => setSportRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">{t('onboarding.goal.selectRole')}</option>
                {sportRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sport && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                {t('onboarding.goal.sportOptimized')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottoni navigazione */}
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-slate-700 text-white py-4 rounded-lg font-semibold text-lg hover:bg-slate-600 transition"
          >
            ← {t('common.back')}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
