import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  MessageCircle,
  Mail,
  FileQuestion,
  ChevronRight
} from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: () => void;
  href?: string;
}

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {

  const helpItems: HelpItem[] = [
    {
      icon: FileQuestion,
      title: 'FAQ',
      description: 'Risposte alle domande frequenti',
      href: '/about#faq'
    },
    {
      icon: MessageCircle,
      title: 'Come funziona',
      description: 'Guida rapida all\'uso dell\'app',
      href: '/about'
    },
    {
      icon: Mail,
      title: 'Contattaci',
      description: 'Scrivici per assistenza',
      href: 'mailto:support@trainsmart.app'
    }
  ];

  const handleItemClick = (item: HelpItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      if (item.href.startsWith('mailto:')) {
        window.location.href = item.href;
      } else {
        window.location.href = item.href;
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel - slides from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between safe-area-top">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-lg">Aiuto</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Chiudi pannello aiuto"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Quick Help Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Supporto
                </h3>
                <div className="space-y-2">
                  {helpItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.title}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Suggerimenti
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Pain Detect:</strong> Se durante un esercizio senti fastidio,
                    segnalalo usando la scala 1-10. Il sistema adatterà automaticamente il tuo programma.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-4 mt-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Video Analysis:</strong> Carica un video del tuo movimento
                    per ricevere feedback sulla tecnica.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-border">
              <a
                href="mailto:support@trainsmart.app"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contatta il supporto
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
