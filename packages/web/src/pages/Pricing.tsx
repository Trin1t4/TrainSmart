import { Check, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Pricing() {
  const plans = [
    {
      name: 'Early Bird',
      price: 12.90,
      originalPrice: 19.90,
      description: 'Prezzo bloccato per sempre',
      features: [
        '6 settimane GRATIS per iniziare',
        'Programmi di allenamento personalizzati',
        'Pain Detect',
        'Weekly split intelligente',
        'Adattamento location e attrezzatura',
        'Tracking progressi'
      ],
      active: true,
      highlighted: true,
      cta: 'Blocca il Prezzo',
      link: '/register',
      badge: 'FINO A MARZO',
      isEarlyBird: true
    },
    {
      name: 'Pro',
      price: 24.90,
      description: 'Con analisi video tecnica',
      features: [
        'Tutto di Early Bird',
        '2 analisi video al mese',
        'Feedback tecnica con Gemini',
        'Suggerimenti biomeccanici personalizzati',
        'Supporto prioritario'
      ],
      active: false,
      highlighted: false,
      cta: 'Prossimamente',
      badge: 'COMING SOON'
    },
    {
      name: 'Coach',
      price: 39.90,
      description: 'Coaching 1:1',
      features: [
        'Tutto di Pro',
        'Analisi video illimitate',
        'Chat supporto dedicata',
        'Programmazione personalizzata avanzata',
        'Consulenza tecnica diretta'
      ],
      active: false,
      highlighted: false,
      cta: 'Prossimamente',
      badge: 'COMING SOON'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-4">
            Scegli il Tuo Piano
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Le prime <span className="text-emerald-400 font-semibold">6 settimane sono GRATIS</span>. Allenamenti scientifici e personalizzati.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.highlighted ? 'md:-mt-4' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className={`text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1 ${
                    (plan as any).isEarlyBird
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-slate-600 text-white'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`
                relative h-full rounded-2xl p-8 backdrop-blur-lg transition-all duration-300
                ${(plan as any).isEarlyBird
                  ? 'bg-gradient-to-br from-amber-900/60 to-orange-800/40 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20'
                  : plan.active
                    ? 'bg-slate-800/50 border border-slate-700 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10'
                    : 'bg-slate-800/30 border border-slate-700/50 opacity-60'
                }
              `}>
                {/* Lock Icon for Disabled Plans */}
                {!plan.active && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                )}

                {/* Plan Name */}
                <h3 className={`text-2xl font-bold mb-2 ${plan.active ? 'text-white' : 'text-slate-400'}`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-6 ${plan.active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {(plan as any).originalPrice && (
                    <span className="text-lg text-slate-500 line-through">
                      €{(plan as any).originalPrice.toFixed(2)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${
                      (plan as any).isEarlyBird
                        ? 'text-amber-400'
                        : plan.active
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                    }`}>
                      €{plan.price.toFixed(2)}
                    </span>
                    <span className={`text-sm ${plan.active ? 'text-slate-400' : 'text-slate-600'}`}>
                      /mese
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        (plan as any).isEarlyBird
                          ? 'text-amber-500'
                          : plan.active
                            ? 'text-emerald-400'
                            : 'text-slate-600'
                      }`} />
                      <span className={`text-sm ${plan.active ? 'text-slate-300' : 'text-slate-500'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.active ? (
                  <Link
                    to={plan.link || '/register'}
                    className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg text-center shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all duration-300"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-700/50 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed border border-slate-600/50"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Confronto valore</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-amber-400 font-bold text-lg mb-2">Early Bird</div>
                <p className="text-slate-300">Programmi personalizzati + Pain Detect base</p>
                <p className="text-slate-500 text-xs mt-2">Segnalazione zone doloranti e adattamento automatico</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-emerald-400 font-bold text-lg mb-2">Pro</div>
                <p className="text-slate-300">+ Analisi video della tua tecnica</p>
                <p className="text-slate-500 text-xs mt-2">Gemini analizza i tuoi movimenti e suggerisce correzioni</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-purple-400 font-bold text-lg mb-2">Coach</div>
                <p className="text-slate-300">+ Supporto diretto e programmazione avanzata</p>
                <p className="text-slate-500 text-xs mt-2">Consulenza tecnica e chat dedicata</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
          >
            ← Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}
