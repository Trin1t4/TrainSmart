import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Target, Heart, Lightbulb, Code, Dumbbell,
  Brain, ArrowRight, Github, Linkedin, Mail,
  ChevronDown, Award, Users, Sparkles
} from 'lucide-react';
import VideoMosaicBackground from '../components/VideoMosaicBackground';

export default function About() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Video Mosaic Background */}
      <VideoMosaicBackground videoCount={16} opacity={0.05} blur={2} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Image Placeholder */}
          <motion.div
            className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <User className="w-16 h-16 md:w-20 md:h-20 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            {...fadeIn}
          >
            Ciao, sono{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Dario
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Personal Trainer, Developer e creatore di TrainSmart
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="animate-bounce"
          >
            <ChevronDown className="w-8 h-8 mx-auto text-emerald-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* La Mia Storia */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-slate-800/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-slate-700 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">La Mia Storia</h2>
            </div>

            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p>
                Ho iniziato il mio percorso nel fitness più di <strong className="text-white">10 anni fa</strong>,
                prima come appassionato, poi come professionista. Nel tempo ho capito che la vera sfida
                non è solo allenarsi, ma farlo nel modo <strong className="text-emerald-400">giusto per il proprio corpo</strong>.
              </p>
              <p>
                Come Personal Trainer ho visto troppi clienti frustrati: programmi generici,
                zero personalizzazione, nessuna attenzione ai dolori o alle limitazioni individuali.
                Ho deciso che doveva esserci un modo migliore.
              </p>
              <p>
                Così è nato <strong className="text-emerald-400">TrainSmart</strong>: l'unione della mia
                esperienza sul campo con la tecnologia, per creare qualcosa che prima non esisteva.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perché TrainSmart */}
      <section className="relative z-10 py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Perché ho creato{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                TrainSmart
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              I problemi che ho visto ripetersi, e che ho voluto risolvere
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Target,
                title: "Programmi Generici",
                problem: "La stessa scheda per tutti, senza considerare livello, obiettivi o limitazioni.",
                solution: "TrainSmart crea programmi su misura basati su 15+ fattori personali."
              },
              {
                icon: Brain,
                title: "Zero Adattamento",
                problem: "Programmi statici che non cambiano mai, anche quando il corpo lo richiede.",
                solution: "Sistema di auto-regolazione basato su RPE che adatta carichi e volumi in tempo reale."
              },
              {
                icon: Heart,
                title: "Dolori Ignorati",
                problem: "Continuare ad allenarsi nonostante fastidi, peggiorando la situazione.",
                solution: "Pain tracking integrato con programmi di rieducazione automatici."
              },
              {
                icon: Lightbulb,
                title: "Nessuna Guida",
                problem: "Video tutorial confusi o assenti, esecuzioni sbagliate.",
                solution: "Video dimostrativi per ogni esercizio, con focus sulla tecnica corretta."
              },
              {
                icon: Award,
                title: "Zero Motivazione",
                problem: "Allenarsi diventa noioso senza feedback o riconoscimenti.",
                solution: "Sistema di streak, achievement e record personali per mantenerti motivato."
              },
              {
                icon: Users,
                title: "Allenamento Solitario",
                problem: "Nessuno con cui condividere progressi e successi.",
                solution: "Community integrata per condividere workout, PR e supportarsi a vicenda."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm mb-3">
                  <span className="text-red-400">Problema:</span> {item.problem}
                </p>
                <p className="text-slate-300 text-sm">
                  <span className="text-emerald-400">Soluzione:</span> {item.solution}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* La Visione */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">La Visione</h2>
            </div>

            <div className="space-y-6 text-lg text-slate-200 leading-relaxed">
              <p>
                Credo che <strong className="text-emerald-400">tutti meritino</strong> un allenamento
                intelligente, non solo chi può permettersi un personal trainer costoso.
              </p>
              <p>
                TrainSmart non vuole sostituire i professionisti del fitness - vuole
                <strong className="text-white"> democratizzare l'accesso</strong> a programmi
                personalizzati di qualità, basati su principi scientifici.
              </p>
              <p>
                Il mio obiettivo è semplice: aiutarti ad allenarti
                <strong className="text-emerald-400"> più intelligentemente</strong>,
                non solo più duramente. Perché il fitness dovrebbe migliorare la tua vita,
                non complicarla.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Competenze */}
      <section className="relative z-10 py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Le Competenze Dietro TrainSmart
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
              variants={fadeIn}
            >
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-8 h-8 text-emerald-400" />
                <h3 className="text-xl font-bold">Fitness & Coaching</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Personal Training certificato
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Preparazione atletica
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Biomeccanica del movimento
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Programmazione periodizzata
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Riabilitazione sportiva
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
              variants={fadeIn}
            >
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-8 h-8 text-emerald-400" />
                <h3 className="text-xl font-bold">Tecnologia</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Full-Stack Development
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  React & TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Database & Backend
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  UX/UI Design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  AI & Machine Learning basics
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto a iniziare il tuo percorso?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              TrainSmart è gratuito per iniziare. Nessuna carta di credito richiesta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2"
              >
                Inizia Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-slate-700/50 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl border border-slate-600 transition-all duration-300"
              >
                Ho già un account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            TrainSmart - Allenati intelligentemente
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@trainsmart.me"
              className="text-slate-400 hover:text-emerald-400 transition"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
