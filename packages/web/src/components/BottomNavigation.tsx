import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Play, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  matchPaths?: string[];
  isCTA?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    icon: Home,
    labelKey: 'nav.home',
    matchPaths: ['/dashboard']
  },
  {
    path: '/workout',
    icon: ClipboardList,
    labelKey: 'nav.program',
    matchPaths: ['/workout']
  },
  {
    path: '/workout',
    icon: Play,
    labelKey: 'nav.train',
    matchPaths: ['/workout-session', '/workout'],
    isCTA: true
  },
  {
    path: '/stats',
    icon: BarChart3,
    labelKey: 'nav.stats',
    matchPaths: ['/stats', '/progress']
  },
  {
    path: '/profile',
    icon: User,
    labelKey: 'nav.profile',
    matchPaths: ['/profile', '/settings']
  }
];

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (item: NavItem): boolean => {
    const allPaths = [item.path, ...(item.matchPaths || [])];
    return allPaths.some(p => location.pathname.startsWith(p));
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom"
      aria-label="Navigazione principale"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          // CTA Button (central)
          if (item.isCTA) {
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center -mt-4"
                aria-label={t(item.labelKey) || 'Allenati'}
              >
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-3 shadow-lg shadow-primary/30">
                  <Icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="text-xs mt-1 font-semibold text-primary">
                  {t(item.labelKey) || 'Allenati'}
                </span>
              </motion.button>
            );
          }

          // Regular nav item
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 px-1 rounded-xl transition-colors touch-target focus-visible-ring ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey) || item.labelKey.split('.').pop()}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'text-primary' : ''}`} aria-hidden="true" />
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-primary' : ''}`} aria-hidden="true">
                {t(item.labelKey) || item.labelKey.split('.').pop()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
