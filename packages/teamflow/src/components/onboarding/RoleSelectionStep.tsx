import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Users, ChevronRight, Trophy } from 'lucide-react';
import type { UserMode } from '@/types';

interface RoleSelectionStepProps {
  data: { userMode?: UserMode };
  onNext: (data: { userMode: UserMode }) => void;
}

export default function RoleSelectionStep({ data, onNext }: RoleSelectionStepProps) {
  const [selected, setSelected] = useState<UserMode | null>(data.userMode || null);

  const handleContinue = () => {
    if (selected) {
      onNext({ userMode: selected });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Come vuoi usare TeamFlow?
        </h2>
        <p className="text-slate-400">
          Scegli il tuo ruolo per personalizzare l'esperienza
        </p>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Individual Athlete */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected('individual')}
          className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
            selected === 'individual'
              ? 'bg-blue-500/20 border-blue-500'
              : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          }`}
        >
          {selected === 'individual' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
            selected === 'individual' ? 'bg-blue-500/30' : 'bg-slate-700'
          }`}>
            <User className={`w-7 h-7 ${selected === 'individual' ? 'text-blue-400' : 'text-slate-400'}`} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Atleta Individuale</h3>
          <p className="text-slate-400 text-sm mb-4">
            Mi alleno da solo e voglio un programma personalizzato per me
          </p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'individual' ? 'bg-blue-400' : 'bg-slate-500'}`} />
              Programma personale
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'individual' ? 'bg-blue-400' : 'bg-slate-500'}`} />
              Auto-screening rapido
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'individual' ? 'bg-blue-400' : 'bg-slate-500'}`} />
              Tracciamento progressi
            </li>
          </ul>
        </motion.button>

        {/* Coach / Team Manager */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected('team')}
          className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
            selected === 'team'
              ? 'bg-orange-500/20 border-orange-500'
              : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          }`}
        >
          {selected === 'team' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
            selected === 'team' ? 'bg-orange-500/30' : 'bg-slate-700'
          }`}>
            <Users className={`w-7 h-7 ${selected === 'team' ? 'text-orange-400' : 'text-slate-400'}`} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Coach / Allenatore</h3>
          <p className="text-slate-400 text-sm mb-4">
            Gestisco una squadra e voglio programmare gli allenamenti per i miei atleti
          </p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'team' ? 'bg-orange-400' : 'bg-slate-500'}`} />
              Database giocatori
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'team' ? 'bg-orange-400' : 'bg-slate-500'}`} />
              Test e screening individuali
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'team' ? 'bg-orange-400' : 'bg-slate-500'}`} />
              Assegnazione programmi
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className={`w-1.5 h-1.5 rounded-full ${selected === 'team' ? 'bg-orange-400' : 'bg-slate-500'}`} />
              Analytics squadra
            </li>
          </ul>
        </motion.button>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
          selected
            ? selected === 'team'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30'
            : 'bg-slate-700 cursor-not-allowed opacity-50'
        }`}
      >
        Continua
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
