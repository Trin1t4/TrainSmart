/**
 * DCSS PHILOSOPHY SECTION - Landing Page
 * 
 * Da inserire in packages/web/src/pages/Landing.tsx
 * dopo la sezione "Come Funziona"
 * 
 * Questa sezione spiega cosa rende TrainSmart diverso
 * e perché l'approccio DCSS è superiore al "one size fits all"
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Scale, 
  Shield, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Quote
} from 'lucide-react';

interface DCSSPhilosophySectionProps {
  className?: string;
}

export const DCSSPhilosophySection: React.FC<DCSSPhilosophySectionProps> = ({ 
  className = '' 
}) => {
  return (
    <section className={`py-20 bg-gradient-to-b from-slate-900 to-slate-800 ${className}`}>
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Perché TrainSmart è Diverso
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Non esistono tecniche "perfette" universali. Esistono tecniche ottimali per{' '}
            <span className="text-emerald-400 font-semibold">il TUO corpo</span>.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          
          {/* Old Approach */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-red-950/30 rounded-2xl p-6 border border-red-800/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400">Approccio Tradizionale</h3>
            </div>
            
            <ul className="space-y-3">
              {[
                '"La schiena deve essere sempre neutra"',
                '"Il ginocchio non deve mai superare la punta"',
                '"Questa è la tecnica CORRETTA"',
                'Stesso programma per tutti',
                'Ignora le differenze individuali'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-400">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-red-300/80 italic">
              Risultato: paura del movimento, tecnica forzata, infortuni
            </p>
          </motion.div>

          {/* DCSS Approach */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-emerald-950/30 rounded-2xl p-6 border border-emerald-800/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">Approccio TrainSmart (DCSS)</h3>
            </div>
            
            <ul className="space-y-3">
              {[
                'La tecnica ottimale dipende dalle TUE proporzioni',
                'Il ginocchio può andare dove serve per TE',
                'Osserviamo, non giudichiamo',
                'Programma personalizzato sulle TUE caratteristiche',
                'Adattamenti individuali basati su dati reali'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-emerald-300/80 italic">
              Risultato: movimento naturale, progressione sicura, risultati duraturi
            </p>
          </motion.div>
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 relative">
            <Quote className="w-8 h-8 text-emerald-500/30 absolute top-4 left-4" />
            
            <blockquote className="text-lg text-slate-300 italic pl-8">
              "La tecnica ottimale dipende dalle proporzioni individuali: rapporto femore/torso/tibia, 
              lunghezza delle braccia, mobilità articolare, struttura del bacino. 
              Quello che è 'sbagliato' per uno può essere perfetto per un altro."
            </blockquote>
            
            <div className="mt-4 pl-8">
              <p className="text-emerald-400 font-semibold">— Paolo Evangelista</p>
              <p className="text-slate-500 text-sm">DCSS - Il Metodo</p>
            </div>
          </div>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* Pillar 1: Individualità */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Individualità</h4>
            <p className="text-slate-400 text-sm">
              Le tue proporzioni corporee (femori, torso, braccia) determinano 
              la TUA tecnica ottimale. Non esiste un "modello perfetto" universale.
            </p>
          </motion.div>

          {/* Pillar 2: Adattamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Adattamento</h4>
            <p className="text-slate-400 text-sm">
              I tuoi tessuti si adattano ai carichi progressivi. 
              Il sistema monitora e adatta il programma in base alle tue risposte reali.
            </p>
          </motion.div>

          {/* Pillar 3: Sicurezza */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Sicurezza</h4>
            <p className="text-slate-400 text-sm">
              Pain Detect rileva il fastidio e ti offre opzioni: 
              ridurre il carico, cambiare esercizio, o continuare. Tu scegli.
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/30"
          >
            Scopri il TUO programma
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-slate-500 text-sm mt-3">
            Le prime 6 settimane sono gratuite
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DCSSPhilosophySection;

/**
 * ISTRUZIONI DI INTEGRAZIONE
 * 
 * 1. Crea il file: packages/web/src/components/landing/DCSSPhilosophySection.tsx
 * 2. Importa in Landing.tsx:
 *    import { DCSSPhilosophySection } from '../components/landing/DCSSPhilosophySection';
 * 3. Inserisci dopo la sezione "Come Funziona":
 *    <DCSSPhilosophySection />
 * 
 * ALTERNATIVA: Se preferisci aggiungere direttamente in Landing.tsx,
 * copia il JSX del return statement sopra.
 */
