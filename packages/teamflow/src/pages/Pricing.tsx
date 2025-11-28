import { Check, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Pricing() {
  const plans = [
    {
      name: 'Base',
      price: 19.90,
      description: 'Programmi personalizzati per iniziare',
      features: [
        'Programmi di allenamento personalizzati',
        'Weekly split intelligente',
        'Adattamento a location e attrezzatura',
        'Tracking progressi',
        'Supporto via email'
      ],
      active: true,
      highlighted: false,
      cta: 'Inizia Ora',
      link: '/register'
    },
    {
      name: 'Pro',
      price: 29.90,
      description: 'Con correzioni AI mensili',
      features: [
        'Tutto del piano Base',
        '2 correzioni AI al mese',
        'Analisi tecnica video',
        'Aggiustamenti biomeccanici',
        'Supporto prioritario'
      ],
      active: false,
      highlighted: true,
      cta: 'Coming Soon',
      badge: 'Presto disponibile'
    },
    {
      name: 'Premium',
      price: 49.90,
      description: 'Correzioni illimitate',
      features: [
        'Tutto del piano Pro',
        'Correzioni AI illimitate',
        'Coaching settimanale',
        'Pianificazione nutrizionale',
        'Accesso prioritario a nuove feature'
      ],
      active: false,
      highlighted: false,
      cta: 'Coming Soon',
      badge: 'Presto disponibile'
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
            Allenamenti scientifici e personalizzati per raggiungere i tuoi obiettivi
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`
                relative h-full rounded-2xl p-8 backdrop-blur-lg transition-all duration-300
                ${plan.highlighted
                  ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20'
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
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.active ? 'text-emerald-400' : 'text-slate-500'}`}>
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
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.active ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={`text-sm ${plan.active ? 'text-slate-300' : 'text-slate-500'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.active ? (
                  <Link
                    to={plan.link}
                    className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg text-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
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
