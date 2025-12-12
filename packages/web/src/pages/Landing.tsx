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
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-medium">Basta infortuni evitabili</span>
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
              L'app che ascolta il tuo corpo
            </p>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Hai dolori? TrainSmart li rileva e adatta automaticamente gli esercizi.
              Il primo sistema che protegge le tue articolazioni PRIMA che succeda qualcosa.
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

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* PAIN DETECT - Feature principale */}
            <div className="bg-gradient-to-br from-red-900/30 to-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50 hover:border-red-400 transition-colors md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-red-500/20 rounded-full px-3 py-1 mb-2">
                    <span className="text-xs font-bold text-red-400">FEATURE PRINCIPALE</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Pain Detect & AdaptFlow</h3>
                  <p className="text-slate-300 mb-4">
                    Segnali un dolore alla spalla? Il sistema <strong className="text-red-400">blocca automaticamente</strong> gli esercizi a rischio e li sostituisce con alternative sicure. Non devi improvvisare, non devi chiedere al "personal trainer" di turno.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">Rilevamento zone doloranti</span>
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">Sostituzione automatica esercizi</span>
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">Deload intelligente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Assessment Completo</h3>
              <p className="text-slate-400">
                Quiz + test pratici per valutare il tuo livello reale. Non chiediamo solo "quanti anni ti alleni", ma testiamo forza e mobilità.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sistema Adattivo</h3>
              <p className="text-slate-400">
                Il programma evolve in base ai tuoi feedback e RPE. Regole intelligenti, non scatole nere incomprensibili.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Video Dimostrativi</h3>
              <p className="text-slate-400">
                Ogni esercizio con video che mostra la tecnica corretta. Non sai come fare un movimento? Guarda e impara.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Progressione Automatica</h3>
              <p className="text-slate-400">
                Aumento carichi basato sui tuoi risultati reali. Deload automatici quando serve. Il programma cresce con te.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ovunque tu sia</h3>
              <p className="text-slate-400">
                Casa, palestra, parco. Con bilanciere o a corpo libero. Il programma si genera per la TUA situazione.
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
      <section className="py-16 bg-gradient-to-r from-emerald-900/20 to-slate-800/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Quote className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">La Nostra Filosofia</span>
            </div>

            <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
              "Non esiste una tecnica <span className="text-red-400 line-through">'perfetta'</span> universale."
            </blockquote>

            <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
              La tecnica ottimale dipende dalle <span className="text-emerald-400 font-medium">proporzioni individuali</span>:
              rapporto femore/torso/tibia, lunghezza braccia, mobilità articolare, struttura del bacino.
            </p>

            <p className="text-slate-400 mb-8">
              — <span className="text-white font-medium">Paolo Evangelista</span>, DCSS (Didattica e Correzione degli esercizi per lo Strength & Conditioning)
            </p>

            {/* Gerarchia delle correzioni */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-red-500/30">
                <div className="text-3xl font-bold text-red-400 mb-1">1°</div>
                <div className="text-white font-semibold mb-1">Sicurezza</div>
                <p className="text-slate-400 text-sm">Colonna neutrale, articolazioni protette, range of motion corretto</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-3xl font-bold text-yellow-400 mb-1">2°</div>
                <div className="text-white font-semibold mb-1">Efficienza</div>
                <p className="text-slate-400 text-sm">Percorso ottimale, timing corretto, attivazione muscolare</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-emerald-500/30">
                <div className="text-3xl font-bold text-emerald-400 mb-1">3°</div>
                <div className="text-white font-semibold mb-1">Ottimizzazione</div>
                <p className="text-slate-400 text-sm">Adattamenti individuali alle tue proporzioni uniche</p>
              </div>
            </div>

            <p className="text-slate-500 max-w-2xl mx-auto text-sm">
              TrainSmart analizza il TUO corpo e adatta i criteri di valutazione a TE, non a un modello standardizzato.
              Quello che è "sbagliato" per uno può essere perfetto per un altro.
            </p>
          </div>
        </div>
      </section>

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

          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/50">
                1
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Completa l'Onboarding</h3>
                <p className="text-slate-400">
                  Rispondi a poche domande su obiettivi, attrezzatura disponibile, giorni di allenamento e eventuali dolori articolari.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/50">
                2
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Fai il Quiz Biomeccanico</h3>
                <p className="text-slate-400">
                  Domande sulla tua storia sportiva, preferenze e capacità per capire il tuo livello di partenza.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/50">
                3
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Test di Movimento (Opzionale)</h3>
                <p className="text-slate-400">
                  Test pratici guidati per valutare forza e mobilità reale. Più dati = programma più preciso.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/50">
                4
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Ricevi il Tuo Programma</h3>
                <p className="text-slate-400">
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
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              {/* Foto/Avatar - occupa 2 colonne */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
                    <User className="w-24 h-24 md:w-32 md:h-32 text-white/80" />
                  </div>
                  {/* Badge resilienza */}
                  <div className="absolute -bottom-3 -right-3 bg-slate-800 border-2 border-emerald-500 rounded-xl px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-bold text-sm">Resiliente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storia - occupa 3 colonne */}
              <div className="md:col-span-3">
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
                    L'ultima ernia, ad <span className="text-white font-medium">agosto 2025</span>, è stata la goccia che ha fatto traboccare il vaso. Bloccato a letto, ho pensato: <em className="text-emerald-400">"Quanti infortuni avrei potuto evitare se avessi saputo cosa stavo sbagliando?"</em>
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

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cosa Dicono gli Utenti
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-emerald-500/30 mb-2" />
              <p className="text-slate-300 mb-4">
                "Finalmente un'app che capisce che ho male alla spalla e mi dà esercizi alternativi. Non devo più improvvisare!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Marco R.</p>
                  <p className="text-slate-500 text-sm">Palestra, 3x settimana</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-emerald-500/30 mb-2" />
              <p className="text-slate-300 mb-4">
                "Mi alleno a casa con poca attrezzatura. TrainSmart mi ha creato un programma completo solo con manubri e sbarra."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Giulia S.</p>
                  <p className="text-slate-500 text-sm">Home gym, 4x settimana</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-emerald-500/30 mb-2" />
              <p className="text-slate-300 mb-4">
                "La progressione si adatta ai miei risultati. Ogni settimana vedo miglioramenti reali senza dover pensare a nulla."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Alessandro M.</p>
                  <p className="text-slate-500 text-sm">Palestra, 5x settimana</p>
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

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Early Bird */}
            <div className="bg-gradient-to-b from-amber-900/50 to-slate-800/50 rounded-2xl p-8 border-2 border-amber-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                EARLY BIRD - FINO A MARZO
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Early Bird</h3>
              <div className="mb-1">
                <span className="text-lg text-slate-500 line-through">€19.90</span>
                <p className="text-3xl font-bold text-amber-400">€12.90<span className="text-lg font-normal text-slate-400">/mese</span></p>
              </div>
              <p className="text-amber-300/80 text-sm mb-2">Prezzo bloccato per sempre</p>
              <p className="text-slate-500 text-xs mb-6">+ Prelazione su tutti gli upgrade futuri</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span><strong className="text-emerald-400">6 settimane GRATIS</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  Programmi personalizzati
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  Pain Detect
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  Adattamento location e attrezzatura
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  Tracking progressi
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition shadow-lg shadow-amber-500/30"
              >
                Blocca il Prezzo
              </Link>
            </div>

            {/* Pro - Coming Soon */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 relative opacity-70">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Pro</h3>
              <p className="text-3xl font-bold text-slate-400 mb-1">€24.90<span className="text-lg font-normal text-slate-500">/mese</span></p>
              <p className="text-slate-500 text-sm mb-6">Con analisi video tecnica</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Tutto del piano Early Bird
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  2 analisi video al mese
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Feedback tecnica con Gemini
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Supporto prioritario
                </li>
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 bg-slate-700 text-slate-500 font-medium rounded-lg cursor-not-allowed"
              >
                Prossimamente
              </button>
            </div>

            {/* Coach - Coming Soon */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 relative opacity-70">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Coach</h3>
              <p className="text-3xl font-bold text-slate-400 mb-1">€39.90<span className="text-lg font-normal text-slate-500">/mese</span></p>
              <p className="text-slate-500 text-sm mb-6">Coaching 1:1</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Tutto del piano Pro
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Analisi video illimitate
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Chat supporto dedicata
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  Consulenza tecnica diretta
                </li>
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 bg-slate-700 text-slate-500 font-medium rounded-lg cursor-not-allowed"
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
                a: "Certo! Puoi modificare le tue preferenze in qualsiasi momento e il programma si rigenera automaticamente."
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
                a: "Carichi un video di te che fai un esercizio e Gemini (Google) analizza la tua tecnica, identificando errori e suggerendo correzioni specifiche per le tue proporzioni."
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
            Unisciti a migliaia di persone che si allenano in modo più intelligente con TrainSmart.
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

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">TrainSmart</span>
              </div>
              <p className="text-slate-500 text-sm">
                Allenamento personalizzato basato sulla scienza.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/pricing" className="hover:text-white transition">Prezzi</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Chi siamo</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition">Termini di Servizio</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-white transition">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contatti</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="mailto:info@trainsmart.me" className="flex items-center gap-2 hover:text-white transition">
                    <Mail className="w-4 h-4" />
                    info@trainsmart.me
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/trainsmart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
                    <Instagram className="w-4 h-4" />
                    @trainsmart
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} TrainSmart. Tutti i diritti riservati.</p>
            <p className="mt-2 md:mt-0">Made with ❤️ in Italy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
