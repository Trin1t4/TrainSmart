import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla home
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-slate-700">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Informativa sulla Privacy</h1>
          <p className="text-slate-400 mb-8">Ultimo aggiornamento: 19 Gennaio 2026</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            {/* Intro */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">1. Titolare del Trattamento</h2>
              <p className="text-slate-300 leading-relaxed">
                Il titolare del trattamento dei dati personali è <strong className="text-white">TrainSmart</strong>
                (di seguito "noi", "nostro" o "Titolare"), raggiungibile all'indirizzo email:
                <a href="mailto:privacy@trainsmart.me" className="text-emerald-400 hover:text-emerald-300 ml-1">
                  privacy@trainsmart.me
                </a>
              </p>
            </section>

            {/* Dati raccolti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">2. Dati Personali Raccolti</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Raccogliamo i seguenti tipi di dati personali:
              </p>

              <h3 className="text-lg font-medium text-white mb-2">2.1 Dati forniti dall'utente</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Nome e cognome</li>
                <li>Indirizzo email</li>
                <li>Data di nascita (opzionale)</li>
                <li>Dati fisici: altezza, peso, circonferenze corporee</li>
                <li>Informazioni sulla salute: zone di dolore, limitazioni fisiche</li>
                <li>Preferenze di allenamento: obiettivi, frequenza, location</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-2">2.2 Dati raccolti automaticamente</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Dati di utilizzo dell'app (pagine visitate, funzionalità usate)</li>
                <li>Dati tecnici (tipo di dispositivo, browser, sistema operativo)</li>
                <li>Indirizzo IP (anonimizzato)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-2 mt-4">2.3 Permessi dell'App Mobile</h3>
              <p className="text-slate-300 leading-relaxed mb-2">
                L'app TrainSmart richiede i seguenti permessi sul tuo dispositivo:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>
                  <strong className="text-white">Fotocamera (CAMERA):</strong> utilizzata esclusivamente per la funzione
                  di scansione della composizione corporea (Body Composition Scan) che permette di analizzare le tue
                  misure corporee tramite foto. Le immagini vengono elaborate localmente e <strong className="text-white">non vengono
                  mai caricate sui nostri server</strong> né condivise con terzi. Puoi utilizzare l'app senza concedere
                  questo permesso, rinunciando alla funzionalità di scansione.
                </li>
                <li>
                  <strong className="text-white">Notifiche:</strong> per inviarti promemoria sugli allenamenti e aggiornamenti
                  sul tuo programma. Puoi disattivare le notifiche in qualsiasi momento dalle impostazioni del dispositivo.
                </li>
                <li>
                  <strong className="text-white">Accesso a Internet:</strong> necessario per sincronizzare i tuoi dati di
                  allenamento e accedere ai contenuti dell'app.
                </li>
              </ul>
            </section>

            {/* Dati sanitari */}
            <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">3. Trattamento dei Dati Sanitari</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Alcuni dati che raccogliamo possono essere considerati <strong className="text-white">"dati relativi alla salute"</strong>
                ai sensi dell'art. 9 del GDPR (dati sensibili). Questi includono:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Zone di dolore o fastidio fisico</li>
                <li>Condizioni fisiche pregresse (es. recupero motorio)</li>
                <li>Informazioni sul ciclo mestruale (se fornite volontariamente)</li>
              </ul>
              <p className="text-slate-300 leading-relaxed">
                Il trattamento di questi dati avviene <strong className="text-white">esclusivamente con il tuo consenso esplicito</strong>
                e per le seguenti finalità:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                <li>Personalizzazione del programma di allenamento</li>
                <li>Esclusione automatica di esercizi potenzialmente dannosi</li>
                <li>Adattamento dell'intensità in base alle tue condizioni</li>
              </ul>
            </section>

            {/* Finalità */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">4. Finalità del Trattamento</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                I tuoi dati personali sono trattati per le seguenti finalità:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Erogazione del servizio:</strong> creazione del tuo programma di allenamento personalizzato</li>
                <li><strong className="text-white">Gestione account:</strong> autenticazione, recupero password, comunicazioni di servizio</li>
                <li><strong className="text-white">Miglioramento del servizio:</strong> analisi aggregate e anonime sull'utilizzo dell'app</li>
                <li><strong className="text-white">Marketing (solo con consenso):</strong> invio di newsletter e comunicazioni promozionali</li>
              </ul>
            </section>

            {/* Base giuridica */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">5. Base Giuridica</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Contratto:</strong> il trattamento è necessario per l'esecuzione del servizio richiesto</li>
                <li><strong className="text-white">Consenso:</strong> per i dati sanitari e le comunicazioni di marketing</li>
                <li><strong className="text-white">Legittimo interesse:</strong> per la sicurezza e il miglioramento del servizio</li>
              </ul>
            </section>

            {/* Conservazione */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">6. Conservazione dei Dati</h2>
              <p className="text-slate-300 leading-relaxed">
                I tuoi dati personali sono conservati per il tempo necessario alle finalità per cui sono stati raccolti:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li><strong className="text-white">Dati account:</strong> fino alla cancellazione dell'account + 30 giorni</li>
                <li><strong className="text-white">Dati di allenamento:</strong> fino alla cancellazione dell'account</li>
                <li><strong className="text-white">Dati sanitari:</strong> fino alla revoca del consenso o cancellazione account</li>
                <li><strong className="text-white">Dati di fatturazione:</strong> 10 anni (obblighi fiscali)</li>
              </ul>
            </section>

            {/* Diritti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">7. I Tuoi Diritti</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Ai sensi del GDPR, hai i seguenti diritti:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Accesso:</strong> ottenere conferma e copia dei tuoi dati</li>
                <li><strong className="text-white">Rettifica:</strong> correggere dati inesatti</li>
                <li><strong className="text-white">Cancellazione:</strong> richiedere la cancellazione dei tuoi dati</li>
                <li><strong className="text-white">Portabilità:</strong> ricevere i tuoi dati in formato strutturato</li>
                <li><strong className="text-white">Opposizione:</strong> opporti al trattamento per legittimo interesse</li>
                <li><strong className="text-white">Revoca consenso:</strong> revocare il consenso in qualsiasi momento</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Per esercitare i tuoi diritti, contattaci a:
                <a href="mailto:privacy@trainsmart.me" className="text-emerald-400 hover:text-emerald-300 ml-1">
                  privacy@trainsmart.me
                </a>
              </p>
            </section>

            {/* Condivisione */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">8. Condivisione dei Dati</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                I tuoi dati possono essere condivisi con:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Supabase:</strong> hosting database e autenticazione (USA, con clausole contrattuali standard)</li>
                <li><strong className="text-white">Vercel:</strong> hosting applicazione (USA, con clausole contrattuali standard)</li>
                <li><strong className="text-white">Stripe:</strong> elaborazione pagamenti (PCI-DSS compliant)</li>
                <li><strong className="text-white">Resend:</strong> invio email transazionali</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong className="text-white">Non vendiamo</strong> i tuoi dati personali a terzi.
              </p>
            </section>

            {/* Sicurezza */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">9. Sicurezza</h2>
              <p className="text-slate-300 leading-relaxed">
                Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>Crittografia in transito (HTTPS/TLS)</li>
                <li>Crittografia a riposo per dati sensibili</li>
                <li>Autenticazione sicura con hashing password</li>
                <li>Accesso limitato ai dati (principio del minimo privilegio)</li>
                <li>Backup regolari e disaster recovery</li>
              </ul>
            </section>

            {/* Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">10. Cookie</h2>
              <p className="text-slate-300 leading-relaxed">
                Per informazioni sui cookie utilizzati, consulta la nostra{' '}
                <Link to="/cookie-policy" className="text-emerald-400 hover:text-emerald-300">
                  Cookie Policy
                </Link>.
              </p>
            </section>

            {/* Modifiche */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">11. Modifiche alla Privacy Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                Ci riserviamo il diritto di modificare questa informativa. In caso di modifiche sostanziali,
                ti informeremo via email o tramite un avviso nell'app. La data dell'ultimo aggiornamento è
                indicata all'inizio di questo documento.
              </p>
            </section>

            {/* Contatti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">12. Contatti</h2>
              <p className="text-slate-300 leading-relaxed">
                Per qualsiasi domanda relativa a questa informativa o al trattamento dei tuoi dati personali,
                puoi contattarci a:
              </p>
              <ul className="list-none text-slate-300 space-y-2 mt-4">
                <li>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacy@trainsmart.me" className="text-emerald-400 hover:text-emerald-300">
                    privacy@trainsmart.me
                  </a>
                </li>
              </ul>
            </section>

            {/* Reclami */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">13. Diritto di Reclamo</h2>
              <p className="text-slate-300 leading-relaxed">
                Hai il diritto di proporre reclamo all'autorità di controllo competente. In Italia, l'autorità è il{' '}
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Garante per la Protezione dei Dati Personali
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
