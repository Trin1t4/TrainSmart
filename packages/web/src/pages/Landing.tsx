import { Link } from 'react-router-dom';
import {
  Dumbbell, Target, TrendingUp, ChevronRight, User,
  CheckCircle, Play, Star, Shield, Zap, Clock,
  Smartphone, Brain, Activity, ArrowRight, Quote,
  Instagram, Mail, Heart, Flame, AlertTriangle,
  MapPin, RefreshCw, Home, Building2
} from 'lucide-react';
import { useState } from 'react';
import VideoMosaicBackground from '../components/VideoMosaicBackground';
import { DCSSPhilosophySection } from '../components/landing';

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        <VideoMosaicBackground videoCount={12} opacity={0.05} blur={2} />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Allenati senza pensieri</span>
            </div>

            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl mb-6 shadow-lg shadow-emerald-500/50">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              TrainSmart
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              L'allenamento che si adatta a TE, non il contrario
            </p>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Hai dolori? TrainSmart li rileva e adatta automaticamente gli esercizi.
              Non ti dice di fermarti. Ti dice COME continuare.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Inizia Gratis
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
              >
                Ho già un account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Nessuna carta richiesta
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                Privacy garantita
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VIDEO DEMO SECTION ===== */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Video Container with play overlay */}
            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-emerald-500/10 group cursor-pointer mb-8">
              {/* Placeholder gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-purple-900/30" />

              {/* Video preview mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  {/* App Preview Cards floating */}
                  <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 transform -rotate-6 shadow-lg">
                      <Activity className="w-8 h-8 text-red-400 mb-2" />
                      <div className="text-xs text-slate-400">Pain Detect</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/50 transform rotate-3 shadow-lg scale-110">
                      <TrendingUp className="w-10 h-10 text-emerald-400 mb-2" />
                      <div className="text-sm text-slate-300">Il tuo programma</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 transform rotate-6 shadow-lg">
                      <RefreshCw className="w-8 h-8 text-purple-400 mb-2" />
                      <div className="text-xs text-slate-400">Adatta</div>
                    </div>
                  </div>

                  {/* Play button */}
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/70">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                  <p className="text-slate-400 mt-4 text-sm">Guarda come funziona in 90 secondi</p>
                </div>
              </div>
            </div>

            {/* Video Key Points */}
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="text-3xl font-bold text-emerald-400 mb-1">10 min</div>
                <p className="text-slate-400 text-sm">Per avere il tuo programma personalizzato</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="text-3xl font-bold text-emerald-400 mb-1">21</div>
                <p className="text-slate-400 text-sm">Domande adattive per capire il tuo livello</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="text-3xl font-bold text-emerald-400 mb-1">0</div>
                <p className="text-slate-400 text-sm">Esercizi pericolosi se hai dolori</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cosa rende TrainSmart diverso?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Non è l'ennesima app con schede preconfezionate. È un sistema che protegge il tuo corpo mentre ti fa progredire.
            </p>
          </div>

          {/* PAIN DETECT - Feature principale (full width) */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-red-900/30 to-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50 hover:border-red-400 transition-colors">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-8 h-8 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-red-500/20 rounded-full px-3 py-1 mb-3">
                    <span className="text-xs font-bold text-red-400">FEATURE PRINCIPALE</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Pain Detect & AdaptFlow</h3>
                  <p className="text-slate-300 mb-4 text-lg">
                    Segnali un dolore alla spalla? Il sistema <strong className="text-emerald-400">adatta automaticamente</strong> il tuo programma: riduce i carichi, sostituisce gli esercizi a rischio con alternative sicure. Niente improvvisazione.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">Rilevamento zone doloranti</span>
                    <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">Sostituzione automatica esercizi</span>
                    <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">Deload intelligente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid - 2x3 perfettamente simmetrica */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Assessment */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Assessment Completo</h3>
              <p className="text-slate-400 text-sm">
                Quiz + test pratici per valutare il tuo livello reale. Non chiediamo solo "quanti anni ti alleni", ma testiamo forza e mobilità.
              </p>
            </div>

            {/* Sistema Adattivo */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sistema Adattivo</h3>
              <p className="text-slate-400 text-sm">
                Il programma evolve in base ai tuoi feedback e RPE. Regole intelligenti, non scatole nere incomprensibili.
              </p>
            </div>

            {/* Video */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Video Dimostrativi</h3>
              <p className="text-slate-400 text-sm">
                Ogni esercizio con video che mostra la tecnica corretta. Non sai come fare un movimento? Guarda e impara.
              </p>
            </div>

            {/* Progressione */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Progressione Automatica</h3>
              <p className="text-slate-400 text-sm">
                Aumento carichi basato sui tuoi risultati reali. Deload automatici quando serve. Il programma cresce con te.
              </p>
            </div>

            {/* Ovunque */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ovunque tu sia</h3>
              <p className="text-slate-400 text-sm">
                Casa, palestra, parco. Con bilanciere o a corpo libero. Il programma si genera per la TUA situazione.
              </p>
            </div>

            {/* Tracking */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tracking Intelligente</h3>
              <p className="text-slate-400 text-sm">
                Monitora progressi, PR e trend. Dashboard chiara che ti mostra dove stai andando e cosa migliorare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ADAPTIVE INTELLIGENCE SECTION ===== */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Intelligenza Adattiva</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              E se oggi non va come previsto?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              La vita è imprevedibile. Il tuo allenamento si adatta.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Location Change */}
            <div className="group relative bg-gradient-to-br from-purple-900/40 to-slate-800/60 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              {/* Icone animate */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-purple-400 group-hover:opacity-0 transition-opacity duration-300" />
                    <Home className="w-7 h-7 text-purple-400 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <RefreshCw className="w-6 h-6 text-purple-400/50 group-hover:rotate-180 transition-transform duration-500" />
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-purple-400 group-hover:opacity-0 transition-opacity duration-300" />
                  <Building2 className="w-7 h-7 text-purple-400 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Oggi non vai in palestra?
              </h3>
              <p className="text-slate-300 mb-4 text-lg">
                <span className="text-purple-400 font-semibold">Un tap.</span> Il tuo workout si trasforma istantaneamente per casa o palestra.
              </p>
              <p className="text-slate-400">
                Stessa struttura, stessi muscoli, esercizi diversi. Panca → Push-up. Lat machine → Trazioni. Leg press → Pistol squat. Zero scuse.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm text-purple-300">
                <MapPin className="w-4 h-4" />
                <span>Palestra ↔ Casa ↔ Home Gym</span>
              </div>
            </div>

            {/* Card 2: Station Occupied */}
            <div className="group relative bg-gradient-to-br from-orange-900/40 to-slate-800/60 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              {/* Visual: macchina occupata */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-orange-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-orange-400/50 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="relative w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Macchina occupata?
              </h3>
              <p className="text-slate-300 mb-4 text-lg">
                <span className="text-orange-400 font-semibold">Nessun problema.</span> Premi "Occupata" e ricevi l'alternativa migliore per te.
              </p>
              <p className="text-slate-400">
                Non una variante a caso: quella <span className="text-white font-medium">biomeccanicamente equivalente</span> per le tue proporzioni. Stessi muscoli, stesso ROM, diversa macchina.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm text-orange-300">
                <RefreshCw className="w-4 h-4" />
                <span>Alternative immediate basate su anatomia</span>
              </div>
            </div>
          </div>

          {/* Bottom message */}
          <div className="text-center mt-12">
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Perché l'allenamento perfetto è quello che <span className="text-emerald-400 font-semibold">riesci a fare</span>, non quello che sta sulla carta.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY SECTION - DCSS ===== */}
      <DCSSPhilosophySection />

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Come Funziona
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              In meno di 10 minuti avrai il tuo programma personalizzato
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/40">
                1
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-white mb-1">Completa l'Onboarding</h3>
                <p className="text-slate-400 text-sm">
                  Rispondi a poche domande su obiettivi, attrezzatura disponibile, giorni di allenamento e eventuali dolori articolari.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/40">
                2
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-white mb-1">Fai il Quiz Biomeccanico</h3>
                <p className="text-slate-400 text-sm">
                  Domande sulla tua storia sportiva, preferenze e capacità per capire il tuo livello di partenza.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/40">
                3
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-white mb-1">Test di Movimento (Opzionale)</h3>
                <p className="text-slate-400 text-sm">
                  Test pratici guidati per valutare forza e mobilità reale. Più dati = programma più preciso.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/40">
                4
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-white mb-1">Ricevi il Tuo Programma</h3>
                <p className="text-slate-400 text-sm">
                  Programma di 6 settimane generato istantaneamente. Inizia subito ad allenarti!
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              Inizia Ora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LA MIA STORIA ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Foto/Avatar - 4 colonne su 12 */}
              <div className="md:col-span-4 flex justify-center md:sticky md:top-8">
                <div className="relative">
                  <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
                    <User className="w-24 h-24 lg:w-28 lg:h-28 text-white/80" />
                  </div>
                  {/* Badge resilienza */}
                  <div className="absolute -bottom-3 -right-3 bg-slate-800 border-2 border-emerald-500 rounded-xl px-3 py-1.5 shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-bold text-xs">Resiliente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storia - 8 colonne su 12 */}
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-4">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">La Storia Dietro TrainSmart</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  So cosa significa farsi male.
                </h2>

                <div className="space-y-4 text-slate-300">
                  <p>
                    Mi chiamo <span className="text-white font-semibold">Dario</span>. Da ragazzo giocavo a calcio con il sogno di farlo diventare qualcosa di serio. Poi, alle visite mediche, la doccia fredda: una <span className="text-emerald-400">malformazione cardiaca</span>. Fine del sogno agonistico.
                  </p>

                  <p>
                    Ma non mi sono fermato. Ho continuato ad allenarmi, adattando gli sforzi alle mie possibilità. E lungo la strada mi sono fatto male. <span className="text-white font-medium">Tante volte</span>.
                  </p>

                  <div className="flex flex-wrap gap-3 my-6">
                    <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      2 ernie lombari
                    </span>
                    <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      Infortuni alle spalle
                    </span>
                    <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      Distorsioni alle caviglie
                    </span>
                  </div>

                  <p>
                    L'ultima ernia, ad <span className="text-white font-medium">agosto 2025</span>, è stata la goccia che ha fatto traboccare il vaso. Bloccato a letto, ho pensato: <em className="text-emerald-400">"Quanti infortuni avrei potuto evitare se mi fossi fermato quando il mio corpo me lo chiedeva?"</em>
                  </p>

                  <p>
                    So come ci si fa male. So cosa si prova a dover stare fermi per settimane. So quanto è frustrante perdere i progressi di mesi in un istante.
                  </p>

                  <p className="text-lg text-white font-medium pt-2">
                    Per questo ho creato TrainSmart. Per aiutarti a non commettere i miei stessi errori.
                  </p>
                </div>

                <div className="mt-8 p-4 bg-slate-800/70 rounded-xl border border-slate-700">
                  <p className="text-slate-400 italic">
                    "La resilienza non è non cadere mai. È rialzarsi ogni volta con più consapevolezza di prima. TrainSmart è la mia risposta a tutti gli infortuni che avrei voluto evitare."
                  </p>
                  <p className="text-emerald-400 font-medium mt-2">— Dario, Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING PREVIEW ===== */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Piani e Prezzi
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Le prime <span className="text-emerald-400 font-semibold">6 settimane sono GRATIS</span>. Poi scegli il piano adatto a te.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Early Bird */}
            <div className="bg-gradient-to-b from-amber-900/50 to-slate-800/50 rounded-2xl p-6 border-2 border-amber-500 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                EARLY BIRD
              </div>
              <h3 className="text-lg font-bold text-white mb-2 mt-2">Early Bird</h3>
              <div className="mb-1">
                <span className="text-sm text-slate-500 line-through">€19.90</span>
                <p className="text-2xl font-bold text-amber-400">€12.90<span className="text-sm font-normal text-slate-400">/mese</span></p>
              </div>
              <p className="text-amber-300/80 text-xs mb-4">Prezzo bloccato per sempre</p>
              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-emerald-400">6 settimane GRATIS</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Programmi personalizzati
                </li>
                <li className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Pain Detect & AdaptFlow
                </li>
                <li className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Adattamento location
                </li>
                <li className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Tracking progressi
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition shadow-lg shadow-amber-500/30 text-sm"
              >
                Blocca il Prezzo
              </Link>
            </div>

            {/* Pro - Coming Soon */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative opacity-60 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                COMING SOON
              </div>
              <h3 className="text-lg font-bold text-slate-400 mb-2 mt-2">Pro</h3>
              <p className="text-2xl font-bold text-slate-400 mb-1">€24.90<span className="text-sm font-normal text-slate-500">/mese</span></p>
              <p className="text-slate-500 text-xs mb-4">Con analisi video tecnica</p>
              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Tutto del piano Early Bird
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  2 analisi video al mese
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Feedback tecnica AI
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Supporto prioritario
                </li>
              </ul>
              <button
                disabled
                className="block w-full text-center py-2.5 bg-slate-700 text-slate-500 font-medium rounded-lg cursor-not-allowed text-sm"
              >
                Prossimamente
              </button>
            </div>

            {/* Coach - Coming Soon */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative opacity-60 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                COMING SOON
              </div>
              <h3 className="text-lg font-bold text-slate-400 mb-2 mt-2">Coach</h3>
              <p className="text-2xl font-bold text-slate-400 mb-1">€39.90<span className="text-sm font-normal text-slate-500">/mese</span></p>
              <p className="text-slate-500 text-xs mb-4">Coaching 1:1</p>
              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Tutto del piano Pro
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Analisi video illimitate
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Chat supporto dedicata
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  Consulenza tecnica diretta
                </li>
              </ul>
              <button
                disabled
                className="block w-full text-center py-2.5 bg-slate-700 text-slate-500 font-medium rounded-lg cursor-not-allowed text-sm"
              >
                Prossimamente
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8">
            <Link to="/pricing" className="text-emerald-400 hover:text-emerald-300">
              Vedi tutti i dettagli dei piani →
            </Link>
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Domande Frequenti
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Quanto tempo serve per completare l'assessment?",
                a: "Circa 5-10 minuti. L'onboarding e il quiz richiedono pochi minuti, i test di movimento sono opzionali e puoi farli quando vuoi."
              },
              {
                q: "Posso cambiare obiettivo o attrezzatura dopo?",
                a: "Sì, puoi modificare le preferenze, ma il programma non si rigenera automaticamente. Dovrai iniziare un nuovo ciclo di allenamento con le nuove impostazioni."
              },
              {
                q: "Funziona anche se mi alleno a casa senza attrezzi?",
                a: "Assolutamente sì. TrainSmart supporta allenamento a corpo libero, con manubri, bilanciere, kettlebell, elastici e palestra completa."
              },
              {
                q: "Come funziona il pain management?",
                a: "Se indichi di avere dolore a un'articolazione, il sistema evita o modifica automaticamente gli esercizi che potrebbero aggravarlo, suggerendo alternative sicure."
              },
              {
                q: "Cosa sono le analisi video?",
                a: "Carichi un video di te che esegui un esercizio e il nostro sistema di analisi biomeccanica esamina la tua tecnica frame per frame, identificando errori e suggerendo correzioni personalizzate. Disponibile per: Squat, Stacco, Panca, Trazioni, Rematore e altri esercizi fondamentali."
              },
              {
                q: "Posso annullare in qualsiasi momento?",
                a: "I piani sono per ciclo (6 settimane), non in abbonamento. Acquisti quando vuoi, senza vincoli o rinnovi automatici."
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINALE ===== */}
      <section className="py-20 bg-gradient-to-r from-emerald-900/30 to-slate-800/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto a iniziare?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Inizia ad allenarti in modo più intelligente con TrainSmart.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition"
          >
            Crea il tuo account gratuito
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ===== MEDICAL DISCLAIMER ===== */}
      <section className="py-8 bg-slate-800/30 border-t border-slate-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold text-sm">Avvertenza Importante</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              TrainSmart fornisce programmi di allenamento generati algoritmicamente basati su
              metodologie scientifiche. <strong className="text-slate-300">Non sostituisce il parere medico</strong>.
              Consulta sempre un medico prima di iniziare qualsiasi programma di allenamento,
              specialmente se hai condizioni mediche preesistenti, dolori cronici, o non ti alleni da tempo.
              Il sistema Pain Detect adatta gli esercizi ma <strong className="text-slate-300">non è uno strumento diagnostico</strong>.
              L'utente si allena a proprio rischio.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
              <Link to="/privacy-policy" className="hover:text-emerald-400 transition">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-emerald-400 transition">
                Termini di Servizio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                <span className="text-lg font-bold text-white">TrainSmart</span>
              </div>
              <p className="text-slate-500 text-xs">
                Allenamento personalizzato basato sulla scienza.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Prodotto</h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li><Link to="/pricing" className="hover:text-white transition">Prezzi</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Chi siamo</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Legale</h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition">Termini di Servizio</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-white transition">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contatti</h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>
                  <a href="mailto:info@trainsmart.me" className="flex items-center gap-1.5 hover:text-white transition">
                    <Mail className="w-3.5 h-3.5" />
                    info@trainsmart.me
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/trainsmart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition">
                    <Instagram className="w-3.5 h-3.5" />
                    @trainsmart
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2">
            <p>© {new Date().getFullYear()} TrainSmart. Tutti i diritti riservati.</p>
            <p>Made with ❤️ in Italy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
