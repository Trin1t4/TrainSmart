/**
 * ASSESSMENT PAGE - Team Edition
 *
 * Form completo per inserire i risultati dei test atletici:
 * - Test di Forza (con video dimostrativi)
 * - Test di Potenza (con descrizioni)
 * - Test Aerobici (con protocolli dettagliati)
 * - Test Anaerobici (con protocolli dettagliati)
 * - Test Velocità/Agilità (con setup)
 * - Test Mobilità (con video)
 *
 * Calcola automaticamente scores e genera profilo atleta
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Wind,
  Timer,
  Activity,
  Move,
  CheckCircle,
  AlertCircle,
  Play,
  Info,
  X,
} from 'lucide-react';
import { supabase, TeamMember, Team } from '../lib/supabase';
import {
  StrengthTests,
  PowerTests,
  AerobicTests,
  AnaerobicTests,
  SpeedAgilityTests,
  MobilityTests,
  CoreEnduranceTests,
  calculateAthleteScores,
  generateAthleteProfile,
} from '../lib/athleteAssessment';
import { toast } from 'sonner';

interface AssessmentPageProps {
  teamMember: TeamMember;
}

type TestCategory = 'strength' | 'power' | 'aerobic' | 'anaerobic' | 'speed_agility' | 'mobility' | 'core_endurance';

const CATEGORIES: { key: TestCategory; label: string; icon: any }[] = [
  { key: 'strength', label: 'Forza', icon: Target },
  { key: 'power', label: 'Potenza', icon: Zap },
  { key: 'aerobic', label: 'Aerobico', icon: Wind },
  { key: 'anaerobic', label: 'Anaerobico', icon: Timer },
  { key: 'speed_agility', label: 'Velocità & Agilità', icon: Activity },
  { key: 'core_endurance', label: 'Core & Tenute', icon: Timer },
  { key: 'mobility', label: 'Mobilità', icon: Move },
];

// Video URLs per i test (da Supabase Storage)
const VIDEO_BASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-videos';

const TEST_VIDEOS: Record<string, string> = {
  // Strength tests
  back_squat: `${VIDEO_BASE_URL}/back-squat.mp4`,
  front_squat: `${VIDEO_BASE_URL}/front-squat.mp4`,
  deadlift: `${VIDEO_BASE_URL}/conventional-deadlift.mp4`,
  bench_press: `${VIDEO_BASE_URL}/flat-barbell-bench-press.mp4`,
  pull_ups: `${VIDEO_BASE_URL}/standard-pull-up.mp4`,
  push_ups: `${VIDEO_BASE_URL}/standard-push-up.mp4`,
  inverted_row: `${VIDEO_BASE_URL}/inverted-row.mp4`,
  nordic_curl: `${VIDEO_BASE_URL}/nordic-hamstring-curl.mp4`,
  pistol_squat: `${VIDEO_BASE_URL}/pistol-squat.mp4`,
  hip_thrust: `${VIDEO_BASE_URL}/hip-thrust.mp4`,
  romanian_deadlift: `${VIDEO_BASE_URL}/romanian-deadlift.mp4`,
  goblet_squat: `${VIDEO_BASE_URL}/goblet-squat.mp4`,
  // Core tests
  plank: `${VIDEO_BASE_URL}/plank.mp4`,
  side_plank: `${VIDEO_BASE_URL}/side-plank-modified.mp4`,
  dead_bug: `${VIDEO_BASE_URL}/dead-bug.mp4`,
  bird_dog: `${VIDEO_BASE_URL}/bird-dog.mp4`,
  hanging_leg_raise: `${VIDEO_BASE_URL}/hanging-leg-raise.mp4`,
};

// Descrizioni dettagliate dei test
const TEST_DESCRIPTIONS: Record<string, { title: string; protocol: string; equipment?: string; notes?: string }> = {
  // Test Aerobici
  yo_yo_ir1: {
    title: 'Yo-Yo Intermittent Recovery Test Level 1',
    protocol: `1. Posiziona 2 coni a 20m di distanza e un terzo cono a 5m (zona recupero)
2. L'atleta corre 2x20m (andata e ritorno) seguendo i beep audio
3. Dopo ogni 40m, 10 secondi di recupero attivo nella zona 5m
4. La velocità aumenta progressivamente ogni livello
5. Il test termina quando l'atleta non riesce a raggiungere il cono per 2 volte consecutive
6. Registra la distanza totale percorsa`,
    equipment: 'Coni, audio Yo-Yo IR1, metro',
    notes: 'Valori tipici calciatori pro: 2000-2400m. Semi-pro: 1600-2000m'
  },
  cooper_test: {
    title: 'Cooper Test (12 minuti)',
    protocol: `1. Riscaldamento 10 minuti (jogging leggero + dinamico)
2. L'atleta corre per 12 minuti alla massima velocità sostenibile
3. Può essere fatto su pista (ideale) o campo misurato
4. Cronometra esattamente 12 minuti
5. Registra la distanza totale percorsa in metri
6. Formula VO2max: (distanza - 504.9) / 44.73`,
    equipment: 'Pista/campo misurato, cronometro',
    notes: 'Eccellente: >3000m | Buono: 2700-3000m | Medio: 2400-2700m'
  },
  beep_test: {
    title: 'Beep Test (Multi-Stage Fitness Test)',
    protocol: `1. Posiziona 2 coni a 20m di distanza
2. L'atleta corre tra i coni sincronizzandosi con i beep
3. Inizia a 8.5 km/h, aumenta 0.5 km/h ogni livello
4. Ogni livello ha più navette
5. Test termina quando l'atleta manca 2 beep consecutivi
6. Registra livello e navetta (es. "12.5")`,
    equipment: 'Coni, audio Beep Test',
    notes: 'Livello 12+ = buona forma aerobica per sport di squadra'
  },
  // Test Anaerobici
  sprint_tests: {
    title: 'Test Sprint (10m, 20m, 30m)',
    protocol: `1. Riscaldamento completo (10 min + sprint progressivi)
2. Partenza da fermo, posizione atletica
3. Cronometraggio con fotocellule o manuale
4. 3 prove per ogni distanza, recupero 2-3 min tra prove
5. Registra il tempo migliore
6. Per sprint 10m: valuta accelerazione. 30m: velocità massima`,
    equipment: 'Fotocellule o cronometro, coni',
    notes: '10m elite: <1.70s | 30m elite: <4.00s'
  },
  rsa_test: {
    title: 'RSA Test (Repeated Sprint Ability) 6x30m',
    protocol: `1. 6 sprint massimali di 30m
2. Recupero 20 secondi tra ogni sprint (passivo)
3. Registra tutti i tempi
4. Calcola: Best time, Average time, Fatigue Index
5. Fatigue Index = ((Average - Best) / Best) × 100
6. FI <5% = eccellente capacità di recupero`,
    equipment: 'Fotocellule, cronometro, coni',
    notes: 'Indica la capacità di ripetere sprint ad alta intensità'
  },
  sprint_300m: {
    title: 'Sprint 300m (Test Lattacido)',
    protocol: `1. Riscaldamento completo (15 min)
2. Sprint massimale su 300m
3. Partenza da fermo
4. Registra il tempo totale
5. Opzionale: ripetere dopo 3-5 min per valutare recupero
6. Test molto impegnativo - atleta deve essere preparato`,
    equipment: 'Pista, cronometro',
    notes: 'Elite: <38s | Buono: 38-42s | Medio: 42-46s'
  },
  // Test Agilità
  t_test: {
    title: 'T-Test (Agilità)',
    protocol: `1. Setup a T: cono A (start), B a 10m, C e D a 5m da B (laterali)
2. Sprint A→B, tocca cono
3. Shuffle laterale B→C, tocca cono
4. Shuffle C→D (10m), tocca cono
5. Shuffle D→B, tocca cono
6. Corsa all'indietro B→A
7. Registra tempo totale`,
    equipment: '4 coni, cronometro',
    notes: 'Elite: <9.5s | Buono: 9.5-10.5s | Medio: 10.5-11.5s'
  },
  illinois_test: {
    title: 'Illinois Agility Test',
    protocol: `1. Setup: rettangolo 10m x 5m con 4 coni ai vertici
2. 4 coni al centro in linea, distanziati 3.3m
3. Partenza prona, mani alle spalle
4. Corri il percorso a slalom tra i coni centrali
5. Tocca le linee di fondo
6. Registra tempo totale`,
    equipment: '8 coni, cronometro',
    notes: 'Elite: <15.2s | Buono: 15.2-16.1s | Medio: 16.1-17.0s'
  },
  pro_agility: {
    title: 'Pro Agility 5-10-5',
    protocol: `1. 3 coni in linea a 5 yard (4.57m) di distanza
2. Partenza dal cono centrale, posizione atletica
3. Sprint 5 yard a destra, tocca linea
4. Sprint 10 yard a sinistra, tocca linea
5. Sprint 5 yard a destra, attraversa il centro
6. Registra tempo totale`,
    equipment: '3 coni, cronometro',
    notes: 'Elite: <4.2s | Buono: 4.2-4.5s'
  },
  // Test Potenza
  cmj: {
    title: 'Counter Movement Jump (CMJ)',
    protocol: `1. Posizione eretta, mani sui fianchi (akimbo)
2. Contro-movimento veloce (piegamento ginocchia ~90°)
3. Salto massimale verticale immediato
4. Atterraggio stabile sugli avampiedi
5. 3 prove, recupero 30s, registra la migliore
6. Misura con jump mat, app o stima da flight time`,
    equipment: 'Jump mat / My Jump app / Optojump',
    notes: 'Calciatori pro: 40-50cm | Baskettisti: 50-65cm'
  },
  squat_jump: {
    title: 'Squat Jump (SJ)',
    protocol: `1. Posizione semi-squat (90° ginocchia), mani sui fianchi
2. Mantieni 2-3 secondi immobile (no contromovimento!)
3. Salta verticalmente alla massima altezza
4. Atterraggio stabile
5. 3 prove, recupero 30s
6. SJ deve essere inferiore al CMJ (differenza = elastic energy)`,
    equipment: 'Jump mat / My Jump app',
    notes: 'Rapporto CMJ/SJ indica utilizzo componente elastica'
  },
  broad_jump: {
    title: 'Standing Broad Jump (Salto in Lungo da Fermo)',
    protocol: `1. Piedi paralleli sulla linea di partenza
2. Oscillazione braccia + piegamento ginocchia
3. Salto massimale in avanti
4. Atterraggio su entrambi i piedi
5. Misura dalla linea al tallone più vicino
6. 3 prove, registra la migliore`,
    equipment: 'Metro, nastro adesivo per linea',
    notes: 'Eccellente: >280cm | Buono: 250-280cm | Medio: 220-250cm'
  },
  drop_jump: {
    title: 'Drop Jump (RSI - Reactive Strength Index)',
    protocol: `1. Scatola altezza 30-40cm
2. Fai un passo avanti dalla scatola (non saltare!)
3. Atterra su entrambi i piedi
4. Rimbalza immediatamente verso l'alto (minimo contatto)
5. RSI = Altezza salto / Tempo di contatto
6. 3 prove, registra la migliore`,
    equipment: 'Scatola 30-40cm, jump mat/Optojump',
    notes: 'RSI >2.0 = eccellente reattività | <1.5 = lavora su pliometria'
  },
  // Test Core Endurance
  plank_hold: {
    title: 'Front Plank Hold',
    protocol: `1. Posizione prona, gomiti sotto le spalle
2. Corpo in linea retta (niente anche alte o cedimenti)
3. Contrai addome e glutei
4. Mantieni la posizione il più a lungo possibile
5. Test termina quando la forma si rompe
6. Registra tempo in secondi`,
    equipment: 'Tappetino, cronometro',
    notes: 'Eccellente: >120s | Buono: 60-120s | Base: 30-60s'
  },
  side_plank: {
    title: 'Side Plank Hold',
    protocol: `1. Posizione laterale, gomito sotto la spalla
2. Corpo in linea retta dalla testa ai piedi
3. Anca alta, non cedere
4. Mantieni il più a lungo possibile
5. Testa entrambi i lati separatamente
6. Registra tempo in secondi per ogni lato`,
    equipment: 'Tappetino, cronometro',
    notes: 'Asimmetria >10% tra i lati indica rischio infortuni'
  },
  mcgill_tests: {
    title: 'McGill Big 3 - Core Endurance Battery',
    protocol: `TEST 1 - Trunk Flexion (Curl-up):
- Ginocchia piegate, una gamba tesa
- Mani sotto la lordosi lombare
- Solleva testa e spalle (stacca scapole)
- Mantieni la posizione

TEST 2 - Back Extension (Biering-Sorensen):
- Prono su lettino, busto fuori dal bordo
- Bacino e gambe fissate
- Mantieni corpo orizzontale

TEST 3 - Side Bridge:
- Gomito sotto spalla, piedi sovrapposti
- Corpo in linea retta laterale
- Mantieni posizione`,
    equipment: 'Lettino/panca, cronometro',
    notes: 'Rapporti ideali: Flexion/Extension = 1:1 | Side/Extension = 0.75:1'
  },
  hollow_body: {
    title: 'Hollow Body Hold',
    protocol: `1. Sdraiato supino, braccia sopra la testa
2. Solleva gambe tese (20-30cm da terra)
3. Solleva spalle (scapole staccate)
4. Mantieni la zona lombare a contatto col pavimento
5. Corpo a forma di "banana"
6. Registra tempo massimo con forma corretta`,
    equipment: 'Tappetino, cronometro',
    notes: 'Fondamentale per ginnastica e calisthenics. Target: 60s+'
  },
  wall_sit: {
    title: 'Wall Sit (Sedia a Muro)',
    protocol: `1. Schiena contro il muro
2. Scendi fino a cosce parallele al pavimento (90° ginocchia)
3. Piedi alla larghezza spalle, punte avanti
4. Braccia incrociate sul petto
5. Mantieni la posizione il più a lungo possibile
6. Test termina quando scivoli o ti alzi`,
    equipment: 'Muro, cronometro',
    notes: 'Eccellente: >90s | Buono: 60-90s | Base: 30-60s'
  },
  dead_hang: {
    title: 'Dead Hang (Presa Passiva)',
    protocol: `1. Afferra la sbarra con presa prona, larghezza spalle
2. Lasciati appendere completamente (braccia tese)
3. Spalle rilassate (passive hang) o attive (active hang)
4. Mantieni la presa il più a lungo possibile
5. Test termina quando molli la presa
6. Registra tempo in secondi`,
    equipment: 'Sbarra per trazioni, cronometro',
    notes: 'Dead hang passivo: 60s+ buono | Active hang: 45s+ buono'
  },
};

export default function AssessmentPage({ teamMember }: AssessmentPageProps) {
  const { athleteId } = useParams();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<TestCategory>('strength');

  // Test data state
  const [strengthTests, setStrengthTests] = useState<StrengthTests>({});
  const [powerTests, setPowerTests] = useState<PowerTests>({});
  const [aerobicTests, setAerobicTests] = useState<AerobicTests>({});
  const [anaerobicTests, setAnaerobicTests] = useState<AnaerobicTests>({});
  const [speedAgilityTests, setSpeedAgilityTests] = useState<SpeedAgilityTests>({});
  const [mobilityTests, setMobilityTests] = useState<MobilityTests>({});
  const [coreEnduranceTests, setCoreEnduranceTests] = useState<CoreEnduranceTests>({});
  const [notes, setNotes] = useState('');

  // Modal state for video/info
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<{ title: string; protocol: string; equipment?: string; notes?: string } | null>(null);

  const isStaff = ['owner', 'coach', 'assistant_coach', 'physio'].includes(teamMember.role);

  useEffect(() => {
    if (athleteId) {
      loadAthleteData();
    }
  }, [athleteId]);

  const loadAthleteData = async () => {
    try {
      const { data: athleteData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', athleteId)
        .single();

      setAthlete(athleteData);

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();

      setTeam(teamData);
    } catch (error: any) {
      toast.error('Errore nel caricamento dati atleta');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!athlete || !team) return;

    setSaving(true);
    try {
      const scores = calculateAthleteScores(
        {
          strength: strengthTests,
          power: powerTests,
          aerobic: aerobicTests,
          anaerobic: anaerobicTests,
          speed_agility: speedAgilityTests,
          mobility: mobilityTests,
        },
        team.sport,
        team.level || 'semi_pro',
        'male'
      );

      const profile = generateAthleteProfile(scores, {
        mobility: mobilityTests,
        strength: strengthTests,
      });

      const { error } = await supabase.from('athlete_assessments').insert({
        team_id: teamMember.team_id,
        user_id: athleteId,
        assessed_by: teamMember.user_id,
        assessment_date: new Date().toISOString().split('T')[0],
        strength_tests: strengthTests,
        power_tests: powerTests,
        aerobic_tests: aerobicTests,
        anaerobic_tests: anaerobicTests,
        speed_agility_tests: speedAgilityTests,
        mobility_tests: mobilityTests,
        core_endurance_tests: coreEnduranceTests,
        scores,
        profile,
        notes,
      });

      if (error) throw error;

      toast.success('Valutazione salvata con successo!');
      navigate(`/athlete/${athleteId}`);
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const goToNextCategory = () => {
    const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
    if (currentIndex < CATEGORIES.length - 1) {
      setCurrentCategory(CATEGORIES[currentIndex + 1].key);
    }
  };

  const goToPrevCategory = () => {
    const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(CATEGORIES[currentIndex - 1].key);
    }
  };

  const openVideo = (videoKey: string) => {
    setCurrentVideo(TEST_VIDEOS[videoKey]);
    setShowVideoModal(true);
  };

  const openInfo = (infoKey: string) => {
    setCurrentInfo(TEST_DESCRIPTIONS[infoKey]);
    setShowInfoModal(true);
  };

  const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
  const isFirstCategory = currentIndex === 0;
  const isLastCategory = currentIndex === CATEGORIES.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-status-risk mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Accesso Negato</h3>
          <p className="text-slate-400">Solo lo staff può eseguire valutazioni</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-team-dark">
      {/* Header */}
      <header className="bg-team-card border-b border-team-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/athlete/${athleteId}`}
              className="p-2 hover:bg-team-border rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Nuova Valutazione</h1>
              <p className="text-slate-400 text-sm">
                #{athlete?.jersey_number} {athlete?.position}
              </p>
            </div>
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salva'}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentCategory(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  currentCategory === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-team-dark text-slate-400 hover:bg-team-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-6"
          >
            {/* Strength Tests */}
            {currentCategory === 'strength' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-400" />
                  Test di Forza
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithVideo
                    label="Back Squat 1RM"
                    unit="kg"
                    value={strengthTests.back_squat_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, back_squat_1rm: v })}
                    onVideoClick={() => openVideo('back_squat')}
                  />
                  <TestInputWithVideo
                    label="Front Squat 1RM"
                    unit="kg"
                    value={strengthTests.front_squat_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, front_squat_1rm: v })}
                    onVideoClick={() => openVideo('front_squat')}
                  />
                  <TestInputWithVideo
                    label="Deadlift 1RM"
                    unit="kg"
                    value={strengthTests.deadlift_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, deadlift_1rm: v })}
                    onVideoClick={() => openVideo('deadlift')}
                  />
                  <TestInputWithVideo
                    label="Bench Press 1RM"
                    unit="kg"
                    value={strengthTests.bench_press_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, bench_press_1rm: v })}
                    onVideoClick={() => openVideo('bench_press')}
                  />
                  <TestInputWithVideo
                    label="Pull-ups Max"
                    unit="reps"
                    value={strengthTests.pull_ups_max}
                    onChange={(v) => setStrengthTests({ ...strengthTests, pull_ups_max: v })}
                    onVideoClick={() => openVideo('pull_ups')}
                  />
                  <TestInputWithVideo
                    label="Nordic Curl"
                    unit="reps"
                    value={strengthTests.nordic_curl_reps}
                    onChange={(v) => setStrengthTests({ ...strengthTests, nordic_curl_reps: v })}
                    onVideoClick={() => openVideo('nordic_curl')}
                  />
                </div>
              </div>
            )}

            {/* Power Tests */}
            {currentCategory === 'power' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Test di Potenza
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="CMJ (Counter Movement Jump)"
                    unit="cm"
                    value={powerTests.cmj_height}
                    onChange={(v) => setPowerTests({ ...powerTests, cmj_height: v })}
                    onInfoClick={() => openInfo('cmj')}
                  />
                  <TestInputWithInfo
                    label="Squat Jump"
                    unit="cm"
                    value={powerTests.squat_jump_height}
                    onChange={(v) => setPowerTests({ ...powerTests, squat_jump_height: v })}
                    onInfoClick={() => openInfo('squat_jump')}
                  />
                  <TestInputWithInfo
                    label="Drop Jump"
                    unit="cm"
                    value={powerTests.drop_jump_height}
                    onChange={(v) => setPowerTests({ ...powerTests, drop_jump_height: v })}
                    onInfoClick={() => openInfo('drop_jump')}
                  />
                  <TestInputWithInfo
                    label="Drop Jump RSI"
                    unit=""
                    step={0.01}
                    value={powerTests.drop_jump_rsi}
                    onChange={(v) => setPowerTests({ ...powerTests, drop_jump_rsi: v })}
                    onInfoClick={() => openInfo('drop_jump')}
                  />
                  <TestInputWithInfo
                    label="Broad Jump"
                    unit="cm"
                    value={powerTests.broad_jump}
                    onChange={(v) => setPowerTests({ ...powerTests, broad_jump: v })}
                    onInfoClick={() => openInfo('broad_jump')}
                  />
                  <TestInput
                    label="Med Ball Throw (Chest)"
                    unit="m"
                    step={0.1}
                    value={powerTests.med_ball_throw_chest}
                    onChange={(v) => setPowerTests({ ...powerTests, med_ball_throw_chest: v })}
                  />
                </div>
              </div>
            )}

            {/* Aerobic Tests */}
            {currentCategory === 'aerobic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-400" />
                  Test Aerobici
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="Yo-Yo IR1 Distance"
                    unit="m"
                    value={aerobicTests.yo_yo_ir1_distance}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, yo_yo_ir1_distance: v })}
                    onInfoClick={() => openInfo('yo_yo_ir1')}
                  />
                  <TestInputWithInfo
                    label="Cooper Test (12 min)"
                    unit="m"
                    value={aerobicTests.cooper_test_distance}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, cooper_test_distance: v })}
                    onInfoClick={() => openInfo('cooper_test')}
                  />
                  <TestInputWithInfo
                    label="Beep Test Level"
                    unit=""
                    step={0.1}
                    value={aerobicTests.beep_test_vo2max}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, beep_test_vo2max: v })}
                    onInfoClick={() => openInfo('beep_test')}
                  />
                  <TestInput
                    label="VO2max Stimato"
                    unit="ml/kg/min"
                    step={0.1}
                    value={aerobicTests.vo2max_estimated}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, vo2max_estimated: v })}
                  />
                  <TestInput
                    label="FC a Riposo"
                    unit="bpm"
                    value={aerobicTests.resting_hr}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, resting_hr: v })}
                  />
                  <TestInput
                    label="HR Recovery (1 min)"
                    unit="bpm drop"
                    value={aerobicTests.hr_recovery_1min}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, hr_recovery_1min: v })}
                  />
                </div>
              </div>
            )}

            {/* Anaerobic Tests */}
            {currentCategory === 'anaerobic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />
                  Test Anaerobici
                </h2>

                <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
                  <p className="text-sm text-blue-400">
                    <Info className="w-4 h-4 inline mr-2" />
                    Clicca sull'icona info per vedere il protocollo dettagliato di ogni test
                  </p>
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Alattacido (0-10s)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="Sprint 10m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_10m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_10m: v })}
                    onInfoClick={() => openInfo('sprint_tests')}
                  />
                  <TestInputWithInfo
                    label="Sprint 20m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_20m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_20m: v })}
                    onInfoClick={() => openInfo('sprint_tests')}
                  />
                  <TestInputWithInfo
                    label="Sprint 30m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_30m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_30m: v })}
                    onInfoClick={() => openInfo('sprint_tests')}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Lattacido (10s-2min)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="Sprint 300m"
                    unit="sec"
                    step={0.1}
                    value={anaerobicTests.sprint_300m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_300m: v })}
                    onInfoClick={() => openInfo('sprint_300m')}
                  />
                  <TestInputWithInfo
                    label="RSA 6x30m (Best)"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.rsa_6x30m_best}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_best: v })}
                    onInfoClick={() => openInfo('rsa_test')}
                  />
                  <TestInputWithInfo
                    label="RSA 6x30m (Avg)"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.rsa_6x30m_avg}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_avg: v })}
                    onInfoClick={() => openInfo('rsa_test')}
                  />
                  <TestInputWithInfo
                    label="RSA Fatigue Index"
                    unit="%"
                    step={0.1}
                    value={anaerobicTests.rsa_6x30m_fatigue_index}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_fatigue_index: v })}
                    onInfoClick={() => openInfo('rsa_test')}
                  />
                </div>
              </div>
            )}

            {/* Speed & Agility Tests */}
            {currentCategory === 'speed_agility' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Test Velocità & Agilità
                </h2>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Velocità Lineare</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Sprint 5m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_5m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_5m: v })}
                  />
                  <TestInput
                    label="Sprint 10m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_10m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_10m: v })}
                  />
                  <TestInput
                    label="Sprint 20m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_20m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_20m: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Agilità / COD</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="T-Test"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.t_test}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, t_test: v })}
                    onInfoClick={() => openInfo('t_test')}
                  />
                  <TestInputWithInfo
                    label="Illinois Test"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.illinois_test}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, illinois_test: v })}
                    onInfoClick={() => openInfo('illinois_test')}
                  />
                  <TestInputWithInfo
                    label="Pro Agility 5-10-5"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.pro_agility_5_10_5}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, pro_agility_5_10_5: v })}
                    onInfoClick={() => openInfo('pro_agility')}
                  />
                </div>
              </div>
            )}

            {/* Core Endurance Tests */}
            {currentCategory === 'core_endurance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />
                  Test Core & Tenute Isometriche
                </h2>

                <div className="p-3 bg-orange-500/10 rounded-lg mb-4">
                  <p className="text-sm text-orange-400">
                    <Info className="w-4 h-4 inline mr-2" />
                    I test isometrici sono misurati in SECONDI di tenuta con forma corretta
                  </p>
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Plank & Core Stability</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithVideo
                    label="Front Plank Hold"
                    unit="sec"
                    value={coreEnduranceTests.plank_hold}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, plank_hold: v })}
                    onVideoClick={() => openVideo('plank')}
                  />
                  <TestInputWithInfo
                    label="Side Plank SX"
                    unit="sec"
                    value={coreEnduranceTests.side_plank_left}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, side_plank_left: v })}
                    onInfoClick={() => openInfo('side_plank')}
                  />
                  <TestInputWithInfo
                    label="Side Plank DX"
                    unit="sec"
                    value={coreEnduranceTests.side_plank_right}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, side_plank_right: v })}
                    onInfoClick={() => openInfo('side_plank')}
                  />
                  <TestInputWithInfo
                    label="Hollow Body Hold"
                    unit="sec"
                    value={coreEnduranceTests.hollow_body_hold}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, hollow_body_hold: v })}
                    onInfoClick={() => openInfo('hollow_body')}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">McGill Big 3 (Gold Standard)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="McGill Flexion"
                    unit="sec"
                    value={coreEnduranceTests.mcgill_flexion}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, mcgill_flexion: v })}
                    onInfoClick={() => openInfo('mcgill_tests')}
                  />
                  <TestInputWithInfo
                    label="McGill Extension (Sorensen)"
                    unit="sec"
                    value={coreEnduranceTests.mcgill_extension}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, mcgill_extension: v })}
                    onInfoClick={() => openInfo('mcgill_tests')}
                  />
                  <TestInputWithInfo
                    label="McGill Side Bridge SX"
                    unit="sec"
                    value={coreEnduranceTests.mcgill_side_bridge_left}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, mcgill_side_bridge_left: v })}
                    onInfoClick={() => openInfo('mcgill_tests')}
                  />
                  <TestInputWithInfo
                    label="McGill Side Bridge DX"
                    unit="sec"
                    value={coreEnduranceTests.mcgill_side_bridge_right}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, mcgill_side_bridge_right: v })}
                    onInfoClick={() => openInfo('mcgill_tests')}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Altri Test Isometrici</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInputWithInfo
                    label="Wall Sit"
                    unit="sec"
                    value={coreEnduranceTests.wall_sit}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, wall_sit: v })}
                    onInfoClick={() => openInfo('wall_sit')}
                  />
                  <TestInputWithInfo
                    label="Dead Hang"
                    unit="sec"
                    value={coreEnduranceTests.dead_hang}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, dead_hang: v })}
                    onInfoClick={() => openInfo('dead_hang')}
                  />
                  <TestInput
                    label="L-Sit"
                    unit="sec"
                    value={coreEnduranceTests.l_sit}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, l_sit: v })}
                  />
                  <TestInput
                    label="Superman Hold"
                    unit="sec"
                    value={coreEnduranceTests.superman_hold}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, superman_hold: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Test Dinamici Core (Reps)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Sit-ups (1 min)"
                    unit="reps"
                    value={coreEnduranceTests.sit_ups_1min}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, sit_ups_1min: v })}
                  />
                  <TestInputWithVideo
                    label="Hanging Leg Raises Max"
                    unit="reps"
                    value={coreEnduranceTests.leg_raises_max}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, leg_raises_max: v })}
                    onVideoClick={() => openVideo('hanging_leg_raise')}
                  />
                  <TestInput
                    label="V-Ups Max"
                    unit="reps"
                    value={coreEnduranceTests.v_ups_max}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, v_ups_max: v })}
                  />
                  <TestInput
                    label="Toes to Bar Max"
                    unit="reps"
                    value={coreEnduranceTests.toes_to_bar_max}
                    onChange={(v) => setCoreEnduranceTests({ ...coreEnduranceTests, toes_to_bar_max: v })}
                  />
                </div>
              </div>
            )}

            {/* Mobility Tests */}
            {currentCategory === 'mobility' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Move className="w-5 h-5 text-purple-400" />
                  Test Mobilità
                </h2>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Caviglia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Dorsiflessione SX"
                    unit="cm"
                    value={mobilityTests.ankle_dorsiflexion_left}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, ankle_dorsiflexion_left: v })}
                  />
                  <TestInput
                    label="Dorsiflessione DX"
                    unit="cm"
                    value={mobilityTests.ankle_dorsiflexion_right}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, ankle_dorsiflexion_right: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Anca</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Rotazione Interna SX"
                    unit="°"
                    value={mobilityTests.hip_internal_rotation_left}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, hip_internal_rotation_left: v })}
                  />
                  <TestInput
                    label="Rotazione Interna DX"
                    unit="°"
                    value={mobilityTests.hip_internal_rotation_right}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, hip_internal_rotation_right: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">FMS & Flessibilità</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="FMS Totale"
                    unit="/21"
                    value={mobilityTests.fms_total}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, fms_total: v })}
                  />
                  <TestInput
                    label="Sit & Reach"
                    unit="cm"
                    value={mobilityTests.sit_and_reach}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, sit_and_reach: v })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Notes */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Note Aggiuntive</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
            placeholder="Osservazioni, limitazioni, note particolari..."
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={goToPrevCategory}
            disabled={isFirstCategory}
            className="flex items-center gap-2 px-4 py-2 bg-team-card hover:bg-team-border disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Precedente
          </button>

          {isLastCategory ? (
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Completa Valutazione'}
            </button>
          ) : (
            <button
              onClick={goToNextCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Successivo
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && currentVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                src={currentVideo}
                controls
                autoPlay
                loop
                className="w-full rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && currentInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{currentInfo.title}</h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary-400 mb-2">PROTOCOLLO</h3>
                  <p className="text-slate-300 whitespace-pre-line text-sm">{currentInfo.protocol}</p>
                </div>

                {currentInfo.equipment && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary-400 mb-2">ATTREZZATURA</h3>
                    <p className="text-slate-300 text-sm">{currentInfo.equipment}</p>
                  </div>
                )}

                {currentInfo.notes && (
                  <div className="p-3 bg-primary-500/10 rounded-lg">
                    <h3 className="text-sm font-semibold text-primary-400 mb-1">VALORI DI RIFERIMENTO</h3>
                    <p className="text-slate-300 text-sm">{currentInfo.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Test Input Components
interface TestInputProps {
  label: string;
  unit: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  step?: number;
}

function TestInput({ label, unit, value, onChange, step = 1 }: TestInputProps) {
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-1">
        {label} {unit && <span className="text-slate-500">({unit})</span>}
      </label>
      <input
        type="number"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
        placeholder="-"
      />
    </div>
  );
}

interface TestInputWithVideoProps extends TestInputProps {
  onVideoClick: () => void;
}

function TestInputWithVideo({ label, unit, value, onChange, step = 1, onVideoClick }: TestInputWithVideoProps) {
  return (
    <div>
      <label className="flex items-center justify-between text-slate-300 text-sm mb-1">
        <span>
          {label} {unit && <span className="text-slate-500">({unit})</span>}
        </span>
        <button
          type="button"
          onClick={onVideoClick}
          className="p-1 text-primary-400 hover:text-primary-300 transition-colors"
          title="Guarda video"
        >
          <Play className="w-4 h-4" />
        </button>
      </label>
      <input
        type="number"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
        placeholder="-"
      />
    </div>
  );
}

interface TestInputWithInfoProps extends TestInputProps {
  onInfoClick: () => void;
}

function TestInputWithInfo({ label, unit, value, onChange, step = 1, onInfoClick }: TestInputWithInfoProps) {
  return (
    <div>
      <label className="flex items-center justify-between text-slate-300 text-sm mb-1">
        <span>
          {label} {unit && <span className="text-slate-500">({unit})</span>}
        </span>
        <button
          type="button"
          onClick={onInfoClick}
          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
          title="Vedi protocollo"
        >
          <Info className="w-4 h-4" />
        </button>
      </label>
      <input
        type="number"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
        placeholder="-"
      />
    </div>
  );
}
