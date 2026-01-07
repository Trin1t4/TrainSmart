/**
 * LANDING PAGE COPY UPDATES - DCSS Paradigm
 * 
 * Sezioni della landing page con copy aggiornato.
 * Da integrare nel componente Landing.tsx esistente.
 * 
 * CAMBIAMENTI PRINCIPALI:
 * - "Protegge" → "Adatta"
 * - "Rischio" → "Impegnativo per"
 * - Focus su scelta dell'utente
 * - Linguaggio educational
 */

import React from 'react';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle,
  User,
  BarChart3,
  Zap
} from 'lucide-react';

// ============================================================================
// HERO SECTION
// ============================================================================

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-8">
          <span className="text-emerald-400 text-sm font-medium">
            Basato su DCSS di Paolo Evangelista
          </span>
        </div>
        
        {/* Main Title - UPDATED */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Allenamento che si adatta
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            a TE
          </span>
        </h1>
        
        {/* Subtitle - UPDATED */}
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
          Alle tue <span className="text-emerald-400 font-medium">proporzioni</span>,
          al tuo <span className="text-emerald-400 font-medium">stato attuale</span>,
          ai tuoi <span className="text-emerald-400 font-medium">obiettivi</span>.
          <br className="hidden md:block" />
          Programmazione scientifica, esperienza personalizzata.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all">
            Inizia Gratis
          </button>
          <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all">
            Scopri di più
          </button>
        </div>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-12 text-slate-400 text-sm">
          <span>✓ 6 settimane gratis</span>
          <span>✓ Nessuna carta richiesta</span>
          <span>✓ Cancella quando vuoi</span>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// PAIN DETECT FEATURE SECTION - UPDATED
// ============================================================================

export const PainDetectSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Main Feature Card - UPDATED COPY */}
        <div className="bg-gradient-to-br from-red-900/30 to-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
            
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-red-500/20 rounded-full px-3 py-1 mb-3">
                <span className="text-xs font-bold text-red-400">FEATURE PRINCIPALE</span>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3">
                Pain Detect & AdaptFlow
              </h3>
              
              {/* Description - UPDATED */}
              <p className="text-slate-300 mb-4 text-lg">
                Segnali un fastidio? Il sistema ti propone{' '}
                <strong className="text-emerald-400">opzioni</strong>: ridurre il carico, 
                provare una variante, o continuare se ti senti pronto.{' '}
                <strong className="text-white">Tu scegli, noi supportiamo.</strong>
              </p>
              
              {/* Tags - UPDATED */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">
                  Adattamento personalizzato
                </span>
                <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">
                  Tu scegli come procedere
                </span>
                <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg">
                  Tracking intelligente
                </span>
              </div>
            </div>
          </div>
          
          {/* How it works - UPDATED */}
          <div className="mt-8 pt-8 border-t border-red-500/20">
            <h4 className="text-lg font-semibold text-white mb-4">Come funziona:</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-slate-300 text-sm">
                  <strong className="text-white">Segnali</strong> un fastidio 
                  indicando zona e intensità
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-slate-300 text-sm">
                  <strong className="text-white">Ricevi opzioni</strong>: 
                  riduci carico, cambia esercizio, o procedi
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-slate-300 text-sm">
                  <strong className="text-white">Tu decidi</strong> come procedere, 
                  il sistema traccia e adatta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// FEATURES GRID - UPDATED
// ============================================================================

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'Assessment Completo',
      description: 'Quiz + test pratici per calibrare il programma sulle tue capacità attuali. Non giudichiamo, misuriamo.',
      color: 'emerald'
    },
    {
      icon: User,
      title: 'Analisi Biomeccanica',
      description: 'Ti aiuta a capire il tuo movimento. Osservazioni personalizzate per le tue proporzioni, non standard universali.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Progressione Intelligente',
      description: 'Bilancia stimolo e recupero. Adatta automaticamente in base al tuo feedback reale.',
      color: 'purple'
    },
    {
      icon: RefreshCw,
      title: 'Auto-Regolazione',
      description: 'Il programma risponde a come ti senti. RPE alto? Adattiamo. Troppo facile? Progrediamo.',
      color: 'amber'
    },
    {
      icon: BarChart3,
      title: 'Tracking Completo',
      description: 'Monitora progressi, volume, intensità. Dati che ti aiutano a capire il tuo percorso.',
      color: 'cyan'
    },
    {
      icon: Zap,
      title: 'Anywhere, Anytime',
      description: 'Casa o palestra, il programma si adatta. Attrezzatura minima? Nessun problema.',
      color: 'orange'
    }
  ];
  
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    orange: 'text-orange-400 bg-orange-500/20'
  };
  
  return (
    <section className="py-20 px-4 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Tutto ciò di cui hai bisogno
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Un sistema completo che si adatta a te, non il contrario.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color]}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// EVANGELISTA QUOTE SECTION
// ============================================================================

export const EvangelistaSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        {/* Quote */}
        <blockquote className="text-xl md:text-2xl text-slate-300 italic mb-6">
          "La tecnica ottimale dipende dalle{' '}
          <span className="text-emerald-400 font-medium">proporzioni individuali</span>:
          rapporto femore/torso/tibia, lunghezza braccia, mobilità articolare, struttura del bacino."
        </blockquote>
        
        {/* Attribution */}
        <p className="text-slate-400 mb-8">
          — <span className="text-white font-medium">Paolo Evangelista</span>, 
          DCSS (Didattica e Correzione degli esercizi per lo Strength & Conditioning)
        </p>
        
        {/* Hierarchy */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-red-500/30">
            <div className="text-3xl font-bold text-red-400 mb-1">1°</div>
            <div className="text-white font-semibold mb-1">Controllo</div>
            <p className="text-slate-400 text-sm">
              Movimento controllato, articolazioni stabili, range of motion appropriato
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-400 mb-1">2°</div>
            <div className="text-white font-semibold mb-1">Efficienza</div>
            <p className="text-slate-400 text-sm">
              Percorso ottimale, timing corretto, attivazione muscolare
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-emerald-500/30">
            <div className="text-3xl font-bold text-emerald-400 mb-1">3°</div>
            <div className="text-white font-semibold mb-1">Personalizzazione</div>
            <p className="text-slate-400 text-sm">
              Adattamenti individuali alle tue proporzioni uniche
            </p>
          </div>
        </div>
        
        {/* Closing statement */}
        <p className="text-slate-500 max-w-2xl mx-auto text-sm">
          TrainSmart analizza il TUO corpo e adatta i criteri di valutazione a TE, 
          non a un modello standardizzato. Quello che è "sbagliato" per uno può essere 
          perfetto per un altro.
        </p>
      </div>
    </section>
  );
};

// ============================================================================
// EDUCATIONAL SECTION - NEW
// ============================================================================

export const EducationalSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          La Scienza Dietro TrainSmart
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Non seguiamo dogmi. Seguiamo l'evidenza scientifica moderna.
        </p>
        
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Il corpo si adatta
            </h3>
            <p className="text-slate-400">
              Non "proteggiamo" il tuo corpo come se fosse fragile. Lo sfidiamo progressivamente 
              perché sappiamo che muscoli, tendini e ossa si rafforzano in risposta al carico. 
              La chiave è la progressione intelligente.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Non esistono esercizi "pericolosi"
            </h3>
            <p className="text-slate-400">
              Esistono carichi inappropriati per il tuo livello attuale. Ogni esercizio può essere 
              sicuro se progressato correttamente. Ogni esercizio può causare problemi se fatto 
              con carico eccessivo per le tue capacità.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Il fastidio non è sempre danno
            </h3>
            <p className="text-slate-400">
              Un fastidio lieve durante l'allenamento (1-3/10) è spesso normale e non indica danno. 
              Ti insegniamo a distinguere tra sensazioni normali e segnali che richiedono attenzione. 
              Tu decidi sempre come procedere.
            </p>
          </div>
          
          {/* Card 4 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              La tecnica è individuale
            </h3>
            <p className="text-slate-400">
              Non esiste uno squat "perfetto" universale. Chi ha femori lunghi DEVE inclinarsi di più. 
              Chi ha braccia corte DEVE avvicinarsi di più al bilanciere nello stacco. 
              TrainSmart capisce le tue proporzioni e adatta i criteri.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// CTA SECTION - UPDATED
// ============================================================================

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-emerald-900/20">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Pronto a iniziare?
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          6 settimane gratuite per provare. Nessuna carta richiesta. 
          Cancella quando vuoi.
        </p>
        
        <button className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all">
          Inizia Gratis Ora
        </button>
        
        <p className="text-slate-500 text-sm mt-6">
          Già oltre 1.000 utenti allenano con TrainSmart
        </p>
      </div>
    </section>
  );
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  HeroSection,
  PainDetectSection,
  FeaturesGrid,
  EvangelistaSection,
  EducationalSection,
  CTASection
};
