/**
 * DCSS Philosophy Section
 * Sezione dedicata alla filosofia DCSS di Paolo Evangelista
 *
 * Principi chiave:
 * - Tecnica adattata alle proporzioni individuali
 * - Gerarchia delle correzioni: Sicurezza > Efficienza > Ottimizzazione
 * - No dogmi sulla "tecnica perfetta" universale
 */

import { Quote, AlertTriangle, Shield, Zap, Target, Lightbulb } from 'lucide-react';

interface DCSSPhilosophySectionProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function DCSSPhilosophySection({
  className = '',
  variant = 'default'
}: DCSSPhilosophySectionProps) {
  if (variant === 'compact') {
    return (
      <section className={`py-12 bg-gradient-to-r from-emerald-900/20 to-slate-800/20 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-xl md:text-2xl font-medium text-white mb-4 leading-relaxed">
              "Non esiste una tecnica <span className="text-red-400 line-through">'perfetta'</span> universale."
            </blockquote>
            <p className="text-slate-400">
              La tecnica ottimale dipende dalle tue proporzioni individuali.
              TrainSmart si adatta a TE, non il contrario.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-r from-emerald-900/20 to-slate-800/20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Quote className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Approccio DCSS</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              La Filosofia di TrainSmart
            </h2>

            <blockquote className="text-xl md:text-2xl font-medium text-white mb-6 leading-relaxed max-w-3xl mx-auto">
              "Non esiste una tecnica <span className="text-red-400 line-through">'perfetta'</span> universale.
              La tecnica ottimale dipende dalle <span className="text-emerald-400 font-semibold">proporzioni individuali</span>."
            </blockquote>

            <p className="text-slate-400 mb-2">
              — <span className="text-white font-medium">Paolo Evangelista</span>
            </p>
            <p className="text-slate-500 text-sm">
              DCSS (Didattica e Correzione degli esercizi per lo Strength & Conditioning)
            </p>
          </div>

          {/* Gerarchia delle Correzioni */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white text-center mb-8">
              La Gerarchia delle Correzioni
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 1. Sicurezza */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border-2 border-red-500/40 hover:border-red-500/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">1°</div>
                    <div className="text-white font-semibold">Sicurezza</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Protezione articolare, colonna in posizione controllata,
                  range of motion sicuro. La sicurezza viene SEMPRE prima.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Nessun movimento causa dolore acuto
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Articolazioni in posizione stabile
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Carico appropriato al livello
                  </li>
                </ul>
              </div>

              {/* 2. Efficienza */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border-2 border-yellow-500/40 hover:border-yellow-500/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">2°</div>
                    <div className="text-white font-semibold">Efficienza</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Percorso ottimale della forza, timing corretto,
                  attivazione muscolare efficace per massimizzare i risultati.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    Linea di forza diretta
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    Attivazione muscoli target
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    Respirazione coordinata
                  </li>
                </ul>
              </div>

              {/* 3. Ottimizzazione */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border-2 border-emerald-500/40 hover:border-emerald-500/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">3°</div>
                    <div className="text-white font-semibold">Ottimizzazione</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Adattamenti individuali alle TUE proporzioni uniche.
                  Quello che è "sbagliato" per uno può essere perfetto per un altro.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    Rapporto femori/torso
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    Lunghezza braccia
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    Mobilità articolare individuale
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Principi Chiave */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Sfatiamo i Miti</h4>
                  <ul className="space-y-2 text-slate-400 text-sm">
                    <li>"<span className="line-through text-slate-500">Le ginocchia non devono mai superare le punte</span>"
                      → Dipende dalle tue leve e proporzioni</li>
                    <li>"<span className="line-through text-slate-500">La schiena deve essere sempre dritta</span>"
                      → Una leggera flessione controllata è spesso necessaria</li>
                    <li>"<span className="line-through text-slate-500">Esiste una tecnica perfetta universale</span>"
                      → La tecnica ottimale è individuale</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Come TrainSmart Applica il DCSS</h4>
                  <ul className="space-y-2 text-slate-400 text-sm">
                    <li>Adatta i criteri di valutazione alle TUE proporzioni</li>
                    <li>Suggerisce varianti esercizi basate sulla tua struttura</li>
                    <li>Non giudica la tecnica su standard "universali"</li>
                    <li>Prioritizza sempre sicurezza → efficienza → ottimizzazione</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Nota finale */}
          <div className="text-center">
            <p className="text-slate-500 max-w-2xl mx-auto text-sm">
              TrainSmart analizza il TUO corpo e adatta i criteri di valutazione a TE,
              non a un modello standardizzato. Quello che è "sbagliato" per uno
              può essere <span className="text-emerald-400">perfetto per te</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
