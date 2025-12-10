import { useState } from 'react';
import { AlertTriangle, Heart, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MedicalDisclaimerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function MedicalDisclaimer({ onAccept, onDecline }: MedicalDisclaimerProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    understand: false,
    medical: false,
    responsibility: false,
  });

  const allChecked = Object.values(checkboxes).every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 border-b border-amber-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Disclaimer Medico</h2>
              <p className="text-amber-200/80 text-sm">Leggi attentamente prima di continuare</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-300 mb-2">TrainSmart NON è un dispositivo medico</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Questa applicazione fornisce suggerimenti generali di allenamento e <strong className="text-white">non sostituisce in alcun modo</strong> il parere di un medico, fisioterapista o altro professionista sanitario qualificato.
                </p>
              </div>
            </div>
          </div>

          {/* Expandable details */}
          <div className="border border-slate-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 transition"
            >
              <span className="font-medium text-slate-200">Informazioni importanti</span>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expanded && (
              <div className="p-5 bg-slate-800/50 space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="font-medium text-white mb-2">Consulta un medico PRIMA di iniziare se:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Hai problemi cardiaci, pressione alta o altre patologie cardiovascolari</li>
                    <li>Hai problemi articolari, ossei o muscolari cronici</li>
                    <li>Sei in gravidanza o post-partum</li>
                    <li>Hai avuto recenti interventi chirurgici</li>
                    <li>Soffri di diabete o altre condizioni metaboliche</li>
                    <li>Assumi farmaci che potrebbero influenzare l'attività fisica</li>
                    <li>Hai più di 40 anni e non sei abituato all'esercizio fisico</li>
                    <li>Hai qualsiasi dubbio sulla tua idoneità all'attività fisica</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Interrompi immediatamente l'allenamento se:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Avverti dolore al petto, al braccio o alla mascella</li>
                    <li>Hai difficoltà a respirare</li>
                    <li>Ti senti svenire o confuso</li>
                    <li>Avverti dolore acuto non muscolare</li>
                    <li>Noti battito cardiaco irregolare</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Limitazioni dell'app:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Il sistema di rilevamento del dolore NON è una diagnosi medica</li>
                    <li>I programmi di allenamento sono suggerimenti generali, non prescrizioni</li>
                    <li>L'app NON può valutare la tua tecnica di esecuzione</li>
                    <li>I risultati variano da persona a persona</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.understand}
                onChange={(e) => setCheckboxes({ ...checkboxes, understand: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition">
                <strong className="text-white">Comprendo</strong> che TrainSmart fornisce suggerimenti di allenamento generali e non sostituisce il parere medico professionale.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.medical}
                onChange={(e) => setCheckboxes({ ...checkboxes, medical: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition">
                <strong className="text-white">Confermo</strong> di non avere controindicazioni mediche all'attività fisica, oppure di aver consultato un medico che mi ha autorizzato.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.responsibility}
                onChange={(e) => setCheckboxes({ ...checkboxes, responsibility: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition">
                <strong className="text-white">Accetto</strong> la responsabilità della mia salute e mi impegno a interrompere l'allenamento e consultare un medico in caso di dolore o malessere.
              </span>
            </label>
          </div>

          {/* Safety tip */}
          <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-200">
              <strong>Consiglio:</strong> Ascolta sempre il tuo corpo. Se qualcosa non ti sembra giusto, fermati. È meglio saltare un allenamento che rischiare un infortunio.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition"
          >
            Non accetto
          </button>
          <button
            onClick={onAccept}
            disabled={!allChecked}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {allChecked && <CheckCircle className="w-5 h-5" />}
            Accetto e Continuo
          </button>
        </div>
      </div>
    </div>
  );
}
