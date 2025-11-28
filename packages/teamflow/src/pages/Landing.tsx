import { Link } from 'react-router-dom';
import { Trophy, Target, TrendingUp, ChevronRight, Shield, Zap, Users, Dribbble } from 'lucide-react';
import { motion } from 'framer-motion';

const SPORTS = [
  { name: 'Calcio', icon: '⚽' },
  { name: 'Basket', icon: '🏀' },
  { name: 'Pallavolo', icon: '🏐' },
  { name: 'Rugby', icon: '🏉' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Nuoto', icon: '🏊' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 shadow-lg shadow-orange-500/50"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
          >
            TeamFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-300 mb-2"
          >
            Preparazione Atletica Scientifica
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            Programmi di forza e condizionamento specifici per il tuo sport.
            <br />
            <span className="text-orange-400 font-medium">La forza è la madre di tutte le qualità atletiche.</span>
          </motion.p>

          {/* Sport badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {SPORTS.map((sport) => (
              <span
                key={sport.name}
                className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-1.5"
              >
                <span>{sport.icon}</span>
                {sport.name}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              to="/register"
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all duration-300 flex items-center justify-center gap-2"
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
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-orange-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sport-Specific</h3>
              <p className="text-slate-400 text-sm">
                Programmi calibrati sul tuo sport e ruolo. Calcio, basket, volley, rugby e altri.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Prevenzione Infortuni</h3>
              <p className="text-slate-400 text-sm">
                Esercizi accessori mirati alle aree a rischio del tuo sport. Hamstring, ACL, spalla.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Periodizzazione</h3>
              <p className="text-slate-400 text-sm">
                Off-season, pre-season, in-season. Il programma si adatta alla tua stagione agonistica.
              </p>
            </motion.div>
          </div>

          {/* Philosophy Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-lg rounded-3xl p-8 border border-slate-700 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              La Filosofia TeamFlow
            </h2>
            <div className="text-left space-y-4 text-slate-300">
              <p>
                <span className="text-orange-400 font-semibold">1. Fondamentali sempre.</span> Squat, panca, stacco come base. Non esistono scorciatoie.
              </p>
              <p>
                <span className="text-orange-400 font-semibold">2. No junk volume.</span> Ogni esercizio ha uno scopo. Qualità &gt; quantità.
              </p>
              <p>
                <span className="text-orange-400 font-semibold">3. Sport-specific.</span> Gli accessori sono calibrati sulle esigenze del tuo sport.
              </p>
              <p>
                <span className="text-orange-400 font-semibold">4. Prevenzione.</span> Meglio un esercizio in più oggi che un infortunio domani.
              </p>
            </div>
          </motion.div>

          {/* For Teams CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-12 p-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-orange-400">Per Squadre e Società</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Gestisci la preparazione atletica di tutta la squadra. Dashboard per allenatori, programmi condivisi.
            </p>
            <a
              href="mailto:team@teamflow.it"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium"
            >
              Contattaci per una demo
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 TeamFlow. Preparazione atletica scientifica.</p>
        </div>
      </footer>
    </div>
  );
}
