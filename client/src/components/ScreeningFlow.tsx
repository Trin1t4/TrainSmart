import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Target,
  TrendingUp,
  Dumbbell,
  Calendar,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const STEPS = [
  { id: "goal", title: "Obiettivo", icon: Target },
  { id: "sport", title: "Sport", icon: TrendingUp }, // Solo se performance
  { id: "soccer_role", title: "Ruolo Calcio", icon: Target }, // Solo se sport = calcio
  { id: "specific_goals", title: "Obiettivi Specifici", icon: Target }, // Solo se toning o muscle_gain
  { id: "disability_type", title: "Tipo Disabilità", icon: AlertCircle }, // Solo se disability
  { id: "pregnancy_info", title: "Info Gravidanza", icon: AlertCircle }, // Solo se pregnancy
  { id: "bodyweight", title: "Peso", icon: TrendingUp },
  { id: "availability", title: "Disponibilità", icon: Calendar },
  { id: "location", title: "Location", icon: Dumbbell },
  { id: "equipment", title: "Attrezzatura", icon: Dumbbell }, // Solo se home
  { id: "injuries", title: "Infortuni", icon: AlertCircle },
];

const GOALS = [
  {
    id: "weight_loss",
    label: "Perdita Peso",
    emoji: "🔥",
    description: "Focus su deficit calorico e cardio",
  },
  {
    id: "muscle_gain",
    label: "Massa Muscolare",
    emoji: "💪",
    description: "Ipertrofia e surplus calorico",
  },
  {
    id: "strength",
    label: "Forza",
    emoji: "⚡",
    description: "Massimali e potenza",
  },
  {
    id: "toning",
    label: "Tonificazione",
    emoji: "✨",
    description: "Obiettivo estetico - definizione e composizione corporea",
  },
  {
    id: "performance",
    label: "Prestazioni Sportive",
    emoji: "🏆",
    description: "Obiettivo prestativo - forza, potenza, performance atletica",
  },
  {
    id: "endurance",
    label: "Resistenza",
    emoji: "🏃",
    description: "Capacità aerobica",
  },
  {
    id: "general",
    label: "Fitness Generale",
    emoji: "🎯",
    description: "Salute e benessere",
  },
  {
    id: "disability",
    label: "Disabilità Motorie",
    emoji: "🦽",
    description: "Programmi adattati per limitazioni fisiche",
  },
  {
    id: "pregnancy",
    label: "Gravidanza",
    emoji: "🤰",
    description: "Allenamento sicuro per donne in gravidanza",
  },
];

const SPORTS = [
  { id: "calcio", label: "Calcio", emoji: "⚽" },
  { id: "basket", label: "Basket", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "pallavolo", label: "Pallavolo", emoji: "🏐" },
  { id: "nuoto", label: "Nuoto", emoji: "🏊" },
  { id: "motocross", label: "Motocross", emoji: "🏍️" },
  { id: "rugby", label: "Rugby", emoji: "🏉" },
];

const SOCCER_ROLES = [
  { id: "portiere", label: "Portiere", emoji: "🧤", description: "Esplosività e reattività" },
  { id: "difensore", label: "Difensore", emoji: "🛡️", description: "Forza e duelli" },
  { id: "centrocampista", label: "Centrocampista", emoji: "🏃", description: "Resistenza aerobica" },
  { id: "attaccante", label: "Attaccante", emoji: "⚡", description: "Velocità ed esplosività" },
];

const INJURY_AREAS = [
  { id: "knee", label: "Ginocchia", emoji: "🦵" },
  { id: "shoulder", label: "Spalle", emoji: "💪" },
  { id: "back", label: "Schiena", emoji: "🔙" },
  { id: "elbow", label: "Gomiti", emoji: "💪" },
  { id: "wrist", label: "Polsi", emoji: "🤚" },
  { id: "ankles", label: "Caviglie", emoji: "🦶" },
];

const DISABILITY_TYPES = [
  { id: "paraplegia", label: "Paraplegia", emoji: "🦽", description: "Paralisi degli arti inferiori" },
  { id: "tetraplegia", label: "Tetraplegia", emoji: "🦼", description: "Paralisi di tutti e quattro gli arti" },
  { id: "hemiplegia", label: "Emiplegia", emoji: "🦯", description: "Paralisi di un lato del corpo" },
  { id: "amputazione_arti_inferiori", label: "Amputazione Arti Inferiori", emoji: "🦿", description: "Amputazione di una o entrambe le gambe" },
  { id: "amputazione_arti_superiori", label: "Amputazione Arti Superiori", emoji: "🦾", description: "Amputazione di uno o entrambi gli arti superiori" },
  { id: "sclerosi_multipla", label: "Sclerosi Multipla", emoji: "🧠", description: "Compromissione progressiva del movimento" },
  { id: "distrofia_muscolare", label: "Distrofia Muscolare", emoji: "💪", description: "Debolezza muscolare progressiva" },
  { id: "cerebral_palsy", label: "Paralisi Cerebrale", emoji: "🧠", description: "Disturbi del movimento e della postura" },
  { id: "altra", label: "Altra Disabilità Motoria", emoji: "🔧", description: "Specifica nelle note" },
];

const BODY_FOCUS_AREAS = [
  { id: "chest", label: "Petto", emoji: "🛡️", description: "Sviluppo pettorali" },
  { id: "arms", label: "Braccia", emoji: "💪", description: "Bicipiti e tricipiti" },
  { id: "shoulders", label: "Spalle", emoji: "🔥", description: "Deltoidi 3D" },
  { id: "back_width", label: "Schiena Larga", emoji: "🦅", description: "Dorsali e ampiezza" },
  { id: "back_thickness", label: "Schiena Spessa", emoji: "💎", description: "Trapezi e romboidi" },
  { id: "legs", label: "Gambe", emoji: "🦵", description: "Quadricipiti e femorali" },
  { id: "glutes", label: "Glutei", emoji: "🍑", description: "Focus glutei" },
  { id: "abs", label: "Addome", emoji: "⚡", description: "Core e definizione addominale" },
  { id: "calves", label: "Polpacci", emoji: "🦿", description: "Sviluppo polpacci" },
];

const PREGNANCY_COMPLICATIONS = [
  { id: "pre_eclampsia", label: "Pre-eclampsia", emoji: "⚠️", description: "Pressione alta in gravidanza" },
  { id: "gestational_diabetes", label: "Diabete Gestazionale", emoji: "🩺", description: "Glicemia elevata" },
  { id: "placenta_previa", label: "Placenta Previa", emoji: "🚨", description: "Placenta bassa" },
  { id: "cervical_insufficiency", label: "Insufficienza Cervicale", emoji: "⚠️", description: "Collo dell'utero debole" },
  { id: "multiple_pregnancy", label: "Gravidanza Gemellare", emoji: "👶👶", description: "Due o più feti" },
  { id: "previous_cesarean", label: "Precedente Cesareo", emoji: "🏥", description: "Storia di parto cesareo" },
];

interface ScreeningFlowProps {
  onComplete?: () => void;
}

export default function ScreeningFlow({ onComplete }: ScreeningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<{
    goal: string;
    sportType: string;
    sportRole: string;
    specificBodyParts: string[];
    disabilityType: string;
    pregnancyWeek: number;
    pregnancyTrimester: number;
    hasDoctorClearance: boolean;
    hasReadPregnancyDisclaimer: boolean;
    hasReadDisabilityDisclaimer: boolean;
    pregnancyComplications: string[];
    bodyWeight: number;
    level: string;
    frequency: number;
    location: string;
    hasGym: boolean | null;
    equipment: {
      barbell: boolean;
      dumbbellMaxKg: number;
      kettlebellKg: number[];
      bands: boolean;
      pullupBar: boolean;
      bench: boolean;
    };
    painAreas: string[];
  }>({
    goal: "",
    sportType: "",
    sportRole: "",
    specificBodyParts: [],
    disabilityType: "",
    pregnancyWeek: 12,
    pregnancyTrimester: 1,
    hasDoctorClearance: false,
    hasReadPregnancyDisclaimer: false,
    hasReadDisabilityDisclaimer: false,
    pregnancyComplications: [],
    bodyWeight: 70,
    level: "beginner",
    frequency: 3,
    location: "",
    hasGym: null,
    equipment: {
      barbell: false,
      dumbbellMaxKg: 0,
      kettlebellKg: [],
      bands: false,
      pullupBar: false,
      bench: false,
    },
    painAreas: [],
  });

  // Determina gli step visibili in base al goal e location
  const visibleSteps = STEPS.filter(step => {
    if (step.id === "sport") {
      return data.goal === "performance";
    }
    if (step.id === "soccer_role") {
      return data.sportType === "calcio";
    }
    if (step.id === "specific_goals") {
      return data.goal === "toning" || data.goal === "muscle_gain";
    }
    if (step.id === "disability_type") {
      return data.goal === "disability";
    }
    if (step.id === "pregnancy_info") {
      return data.goal === "pregnancy";
    }
    if (step.id === "equipment") {
      return data.location === "home";
    }
    return true;
  });

  const step = visibleSteps[currentStep];
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  // Step opzionali (possono essere skippati)
  const isOptionalStep = ['specific_goals', 'equipment', 'injuries'].includes(step.id);

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepara i dati per il submit
      const submitData: any = { ...data };
      
      // Aggiungi objectiveType solo se necessario
      if (data.goal === "toning") {
        submitData.objectiveType = "toning";
      } else if (data.goal === "performance") {
        submitData.objectiveType = "performance";
      }
      // Non include objectiveType se non è toning o performance

      await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      // Naviga al quiz per determinare il livello
      window.location.href = "/quiz";
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error saving screening:", error);
      alert("Errore nel salvare lo screening. Riprova.");
    }
  };

  const isStepValid = () => {
    switch (step.id) {
      case "goal":
        return data.goal !== "";
      case "sport":
        return data.sportType !== "";
      case "specific_goals":
        return true; // Optional - può essere vuoto o con selezioni multiple
      case "disability_type":
        return data.disabilityType !== "" && data.hasReadDisabilityDisclaimer;
      case "pregnancy_info":
        return data.hasReadPregnancyDisclaimer && data.hasDoctorClearance && data.pregnancyWeek >= 1 && data.pregnancyWeek <= 40;
      case "bodyweight":
        return data.bodyWeight >= 30 && data.bodyWeight <= 250;
      case "availability":
        return data.frequency >= 2;
      case "location":
        return data.location !== "";
      case "equipment":
        return true; // Optional, qualsiasi configurazione va bene
      case "injuries":
        return true; // Optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>
              Step {currentStep + 1} di {visibleSteps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {visibleSteps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;

            return (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? "bg-emerald-600"
                      : isCompleted
                        ? "bg-emerald-600/30"
                        : "bg-slate-800"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            {isOptionalStep && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                Opzionale
              </span>
            )}
          </div>
          {isOptionalStep && (
            <p className="text-sm text-slate-400 mb-4">
              💡 Questo step è opzionale. Puoi cliccare "Avanti" per saltarlo se non applicabile.
            </p>
          )}

          {/* Goal Step */}
          {step.id === "goal" && (
            <div className="space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setData({ ...data, goal: goal.id })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    data.goal === goal.id
                      ? "border-emerald-600 bg-emerald-600/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  data-testid={`button-goal-${goal.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{goal.label}</p>
                      <p className="text-sm text-slate-400">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sport Step - Solo per Prestazioni Sportive */}
          {step.id === "sport" && (
            <div>
              <p className="text-slate-400 mb-6">
                Per quale sport vuoi migliorare le prestazioni?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SPORTS.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => setData({ ...data, sportType: sport.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      data.sportType === sport.id
                        ? "border-emerald-600 bg-emerald-600/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    data-testid={`button-sport-${sport.id}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{sport.emoji}</div>
                      <p className="font-semibold text-sm">{sport.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Soccer Role Step - Solo per Calcio */}
          {step.id === "soccer_role" && (
            <div>
              <p className="text-slate-400 mb-6">
                Qual è il tuo ruolo in campo?
              </p>
              <div className="space-y-3">
                {SOCCER_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setData({ ...data, sportRole: role.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      data.sportRole === role.id
                        ? "border-emerald-600 bg-emerald-600/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    data-testid={`button-role-${role.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{role.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{role.label}</p>
                        <p className="text-sm text-slate-400">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-4 mt-6">
                <p className="text-sm text-emerald-400">
                  ⚽ La preparazione sarà adattata alle esigenze del tuo ruolo
                </p>
              </div>
            </div>
          )}

          {/* Specific Goals Step - Solo per Tonificazione e Ipertrofia */}
          {step.id === "specific_goals" && (
            <div>
              <p className="text-slate-400 mb-6">
                {data.goal === "toning" 
                  ? "Su quali zone vuoi concentrarti per la tonificazione?"
                  : "Quali gruppi muscolari vuoi sviluppare maggiormente?"}
              </p>
              <p className="text-sm text-emerald-400 mb-4">
                ✨ Seleziona uno o più obiettivi specifici (opzionale)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {BODY_FOCUS_AREAS.map((area) => {
                  const isSelected = data.specificBodyParts.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        const newParts = isSelected
                          ? data.specificBodyParts.filter(p => p !== area.id)
                          : [...data.specificBodyParts, area.id];
                        setData({ ...data, specificBodyParts: newParts });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                      data-testid={`button-bodypart-${area.id}`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-1">{area.emoji}</div>
                        <p className="font-semibold text-sm">{area.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{area.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mt-6">
                <p className="text-sm text-blue-400">
                  💡 La scheda verrà adattata per dare priorità alle zone selezionate
                </p>
              </div>
            </div>
          )}

          {/* Disability Type Step - Solo per Disabilità Motorie */}
          {step.id === "disability_type" && (
            <div>
              <p className="text-slate-400 mb-6">
                Seleziona il tipo specifico di disabilità motoria per ricevere un piano di allenamento individualizzato
              </p>
              <div className="space-y-3">
                {DISABILITY_TYPES.map((disability) => (
                  <button
                    key={disability.id}
                    onClick={() => setData({ ...data, disabilityType: disability.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      data.disabilityType === disability.id
                        ? "border-emerald-600 bg-emerald-600/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    data-testid={`button-disability-${disability.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{disability.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{disability.label}</p>
                        <p className="text-sm text-slate-400">{disability.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* LEGAL DISCLAIMER DISABILITY */}
              <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Avviso Medico Importante - Responsabilità Utente</AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <p className="text-sm">
                    <strong>Questo programma è complementare ma NON sostituisce le indicazioni del tuo fisioterapista o medico specialista.</strong>
                  </p>
                  <p className="text-sm">
                    Devi consultare sempre il tuo team medico prima di modificare la tua routine di allenamento. 
                    L'utente si assume piena responsabilità per le proprie scelte.
                  </p>
                  <label className="flex items-start gap-3 mt-4 p-3 bg-black/30 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.hasReadDisabilityDisclaimer}
                      onChange={(e) => setData({ ...data, hasReadDisabilityDisclaimer: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-red-600 text-red-600 focus:ring-red-600"
                      data-testid="checkbox-disability-disclaimer"
                    />
                    <span className="text-sm text-slate-200">
                      Ho letto e compreso. Confermo di aver consultato il mio team medico e procedo sotto mia responsabilità.
                    </span>
                  </label>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Pregnancy Info Step - Solo per Gravidanza */}
          {step.id === "pregnancy_info" && (
            <div>
              <p className="text-slate-400 mb-6">
                Fornisci informazioni sulla tua gravidanza per un programma sicuro e personalizzato
              </p>
              
              {/* Settimana di gravidanza */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Settimana di gravidanza: <span className="text-emerald-500 font-bold">{data.pregnancyWeek}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={data.pregnancyWeek}
                  onChange={(e) => {
                    const week = parseInt(e.target.value);
                    const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
                    setData({ ...data, pregnancyWeek: week, pregnancyTrimester: trimester });
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  data-testid="slider-pregnancy-week"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>13</span>
                  <span>27</span>
                  <span>40</span>
                </div>
              </div>

              {/* Trimestre (auto-calcolato) */}
              <div className="mb-6 p-4 bg-slate-800 rounded-xl">
                <p className="text-sm text-slate-300">
                  Trimestre: <span className="font-bold text-emerald-500">{data.pregnancyTrimester}°</span>
                </p>
              </div>

              {/* LEGAL DISCLAIMER */}
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Avviso Medico Importante - Responsabilità Utente</AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <p className="text-sm">
                    <strong>TrainSmart fornisce linee guida generali ma NON sostituisce il parere del tuo medico o ostetrica.</strong> 
                  </p>
                  <p className="text-sm">
                    Devi consultare sempre il tuo medico prima di iniziare qualsiasi programma di allenamento durante la gravidanza. 
                    L'utente si assume piena responsabilità per le proprie scelte di allenamento.
                  </p>
                  <label className="flex items-start gap-3 mt-4 p-3 bg-black/30 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.hasReadPregnancyDisclaimer}
                      onChange={(e) => setData({ ...data, hasReadPregnancyDisclaimer: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-red-600 text-red-600 focus:ring-red-600"
                      data-testid="checkbox-pregnancy-disclaimer"
                    />
                    <span className="text-sm text-slate-200">
                      Ho letto e compreso. Confermo di aver consultato il mio medico e procedo sotto mia responsabilità.
                    </span>
                  </label>
                </AlertDescription>
              </Alert>

              {/* Autorizzazione medica */}
              <div className="mb-6">
                <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={data.hasDoctorClearance}
                    onChange={(e) => setData({ ...data, hasDoctorClearance: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-slate-900"
                    data-testid="checkbox-doctor-clearance"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Ho l'autorizzazione medica per allenarmi</p>
                    <p className="text-sm text-slate-400">Richiesto per procedere</p>
                  </div>
                </label>
              </div>

              {/* Complicazioni (opzionale) */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Eventuali complicazioni (opzionale):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PREGNANCY_COMPLICATIONS.map((complication) => {
                    const isSelected = data.pregnancyComplications.includes(complication.id);
                    return (
                      <button
                        key={complication.id}
                        onClick={() => {
                          const updated = isSelected
                            ? data.pregnancyComplications.filter(c => c !== complication.id)
                            : [...data.pregnancyComplications, complication.id];
                          setData({ ...data, pregnancyComplications: updated });
                        }}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                        data-testid={`button-complication-${complication.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{complication.emoji}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{complication.label}</p>
                            <p className="text-xs text-slate-400">{complication.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4">
                <p className="text-sm text-amber-400">
                  ⚠️ Assicurati di aver consultato il tuo medico prima di iniziare qualsiasi programma di allenamento durante la gravidanza
                </p>
              </div>
            </div>
          )}

          {/* Body Weight Step */}
          {step.id === "bodyweight" && (
            <div>
              <p className="text-slate-400 mb-6">
                Qual è il tuo peso corporeo? (Serve per suggerire i carichi negli esercizi)
              </p>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      bodyWeight: Math.max(30, data.bodyWeight - 1),
                    })
                  }
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-2xl"
                  data-testid="button-bodyweight-decrease"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    value={data.bodyWeight}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 30;
                      setData({
                        ...data,
                        bodyWeight: Math.max(30, Math.min(250, value))
                      });
                    }}
                    className="text-5xl font-bold bg-transparent text-center w-full outline-none"
                    data-testid="input-bodyweight"
                  />
                  <p className="text-slate-400 text-sm mt-2">kg</p>
                </div>
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      bodyWeight: Math.min(250, data.bodyWeight + 1),
                    })
                  }
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-2xl"
                  data-testid="button-bodyweight-increase"
                >
                  +
                </button>
              </div>
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  💡 Il peso verrà usato per calcolare carichi suggeriti nel test di forza
                </p>
              </div>
            </div>
          )}

          {/* Availability Step */}
          {step.id === "availability" && (
            <div>
              <p className="text-slate-400 mb-6">
                Quanti giorni a settimana puoi allenarti?
              </p>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      frequency: Math.max(2, data.frequency - 1),
                    })
                  }
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-2xl"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <p className="text-5xl font-bold">{data.frequency}</p>
                  <p className="text-slate-400 text-sm mt-2">
                    giorni/settimana
                  </p>
                </div>
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      frequency: Math.min(6, data.frequency + 1),
                    })
                  }
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-2xl"
                >
                  +
                </button>
              </div>
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  💡 Consigliamo 3-5 giorni per risultati ottimali
                </p>
              </div>
            </div>
          )}

          {/* Location Step */}
          {step.id === "location" && (
            <div className="space-y-4">
              <p className="text-slate-400 mb-4">
                Dove ti alleni principalmente?
              </p>
              <button
                onClick={() => setData({ ...data, location: "gym", hasGym: true })}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  data.location === "gym"
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                data-testid="button-location-gym"
              >
                <p className="text-2xl mb-2">🏋️</p>
                <p className="font-semibold mb-1">Palestra</p>
                <p className="text-sm text-slate-400">
                  Accesso completo a bilancieri, manubri, macchine
                </p>
              </button>
              <button
                onClick={() => setData({ ...data, location: "home", hasGym: false })}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  data.location === "home"
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                data-testid="button-location-home"
              >
                <p className="text-2xl mb-2">🏠</p>
                <p className="font-semibold mb-1">Casa</p>
                <p className="text-sm text-slate-400">
                  Corpo libero o attrezzatura minima
                </p>
              </button>
              <button
//                 onClick={() => setData({ ...data, location: "mixed", hasGym: true })}
//                 className={`w-full p-6 rounded-xl border-2 transition-all ${
//                   data.location === "mixed"
//                     ? "border-emerald-600 bg-emerald-600/10"
//                     : "border-slate-700 hover:border-slate-600"
//                 }`}
//                 data-testid="button-location-mixed"
//               >
//                 <p className="text-2xl mb-2">🔀</p>
//                 <p className="font-semibold mb-1">Misto</p>
//                 <p className="text-sm text-slate-400">
//                   Alcuni giorni palestra, altri giorni casa
//                 </p>
              </button>
            </div>
          )}

          {/* Equipment Step - Solo per Home/Mixed */}
          {step.id === "equipment" && (
            <div className="space-y-4">
              <p className="text-slate-400 mb-4">
                Che attrezzatura hai disponibile a casa?
              </p>
              
              {/* Barbell */}
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 hover:border-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.equipment.barbell}
                  onChange={(e) => setData({
                    ...data,
                    equipment: { ...data.equipment, barbell: e.target.checked }
                  })}
                  className="w-5 h-5"
                  data-testid="checkbox-equipment-barbell"
                />
                <div className="flex-1">
                  <p className="font-semibold">Bilanciere</p>
                  <p className="text-sm text-slate-400">Con dischi</p>
                </div>
              </label>

              {/* Dumbbells */}
              <div className="p-4 rounded-xl border-2 border-slate-700">
                <label className="block mb-2">
                  <span className="font-semibold">Manubri fino a (kg):</span>
                </label>
                <input
                  type="number"
                  value={data.equipment.dumbbellMaxKg || ""}
                  onChange={(e) => setData({
                    ...data,
                    equipment: { ...data.equipment, dumbbellMaxKg: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="0 (se non li hai)"
                  className="w-full p-3 bg-slate-800 rounded-lg"
                  data-testid="input-equipment-dumbbells"
                />
              </div>

              {/* Bands */}
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 hover:border-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.equipment.bands}
                  onChange={(e) => setData({
                    ...data,
                    equipment: { ...data.equipment, bands: e.target.checked }
                  })}
                  className="w-5 h-5"
                  data-testid="checkbox-equipment-bands"
                />
                <div className="flex-1">
                  <p className="font-semibold">Elastici</p>
                  <p className="text-sm text-slate-400">Bande di resistenza</p>
                </div>
              </label>

              {/* Pull-up Bar */}
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 hover:border-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.equipment.pullupBar}
                  onChange={(e) => setData({
                    ...data,
                    equipment: { ...data.equipment, pullupBar: e.target.checked }
                  })}
                  className="w-5 h-5"
                  data-testid="checkbox-equipment-pullupbar"
                />
                <div className="flex-1">
                  <p className="font-semibold">Sbarra per trazioni</p>
                  <p className="text-sm text-slate-400">Pull-up bar</p>
                </div>
              </label>

              {/* Bench */}
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 hover:border-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.equipment.bench}
                  onChange={(e) => setData({
                    ...data,
                    equipment: { ...data.equipment, bench: e.target.checked }
                  })}
                  className="w-5 h-5"
                  data-testid="checkbox-equipment-bench"
                />
                <div className="flex-1">
                  <p className="font-semibold">Panca</p>
                  <p className="text-sm text-slate-400">Bench press</p>
                </div>
              </label>

              <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  💡 Adatteremo gli esercizi in base alla tua attrezzatura
                </p>
              </div>
            </div>
          )}

          {/* Injuries Step */}
          {step.id === "injuries" && (
            <div>
              <p className="text-slate-400 mb-4">
                Hai dolori o limitazioni? (opzionale)
              </p>
              <div className="space-y-2 mb-4">
                {INJURY_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => {
                      const current = data.painAreas || [];
                      setData({
                        ...data,
                        painAreas: current.includes(area.id)
                          ? current.filter((a) => a !== area.id)
                          : [...current, area.id],
                      });
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      data.painAreas?.includes(area.id)
                        ? "border-amber-600 bg-amber-600/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{area.emoji}</span>
                      <span className="font-semibold">{area.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4">
                <p className="text-sm text-amber-400">
                  ⚠️ Adatteremo gli esercizi per evitare stress su queste aree
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Indietro
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {currentStep === STEPS.length - 1 ? "Completa" : "Avanti"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
