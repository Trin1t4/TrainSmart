import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Target,
  Trophy,
  Video,
  TestTube,
  FileQuestion,
  Dumbbell,
  Moon,
  Settings,
  CreditCard,
  Mail,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

interface MenuSection {
  titleKey: string;
  items: MenuItem[];
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      navigate('/');
      toast.success('Logout effettuato');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuSections: MenuSection[] = [
    {
      titleKey: 'menu.training',
      items: [
        { icon: Calendar, labelKey: 'menu.calendar', path: '/workout' },
        { icon: Target, labelKey: 'menu.goals', path: '/profile' },
        { icon: Trophy, labelKey: 'menu.records', path: '/stats' },
        { icon: Video, labelKey: 'menu.videoFeedback', path: '/video-feedback' },
      ]
    },
    {
      titleKey: 'menu.assessment',
      items: [
        { icon: TestTube, labelKey: 'menu.screening', path: '/screening' },
        { icon: FileQuestion, labelKey: 'menu.quiz', path: '/quiz-full' },
        { icon: Dumbbell, labelKey: 'menu.progressions', path: '/first-session-assessment' },
        { icon: Moon, labelKey: 'menu.recovery', path: '/recovery-screening' },
      ]
    },
    {
      titleKey: 'menu.account',
      items: [
        { icon: Settings, labelKey: 'menu.settings', path: '/profile' },
        { icon: CreditCard, labelKey: 'menu.subscription', path: '/pricing' },
        { icon: Mail, labelKey: 'menu.contact', path: '/about' },
        { icon: LogOut, labelKey: 'menu.logout', onClick: handleLogout },
      ]
    }
  ];

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

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between safe-area-top">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-lg">TrainSmart</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Chiudi menu"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Menu Sections */}
            <div className="p-4 space-y-6">
              {menuSections.map((section) => (
                <div key={section.titleKey}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    {t(section.titleKey) || section.titleKey.split('.').pop()}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isDisabled = item.disabled;

                      return (
                        <motion.button
                          key={item.labelKey}
                          whileTap={isDisabled ? {} : { scale: 0.98 }}
                          onClick={() => {
                            if (isDisabled) return;
                            if (item.onClick) {
                              item.onClick();
                            } else if (item.path) {
                              handleNavigation(item.path);
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/50 active:bg-muted'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isDisabled ? 'bg-muted/30' : 'bg-muted/50'}`}>
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <span className={`flex-1 text-left font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}>
                            {t(item.labelKey) || item.labelKey.split('.').pop()}
                          </span>
                          {item.badge && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {!isDisabled && !item.onClick && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                TrainSmart v4.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
