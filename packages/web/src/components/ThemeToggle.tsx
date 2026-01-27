import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface ThemeToggleProps {
  /** Show all three options (light, dark, system) vs just toggle */
  showSystemOption?: boolean;
  /** Compact mode for header placement */
  compact?: boolean;
}

const themeOptions = [
  { value: 'light' as const, icon: Sun, labelKey: 'theme.light' },
  { value: 'system' as const, icon: Monitor, labelKey: 'theme.system' },
  { value: 'dark' as const, icon: Moon, labelKey: 'theme.dark' },
];

export default function ThemeToggle({
  showSystemOption = false,
  compact = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Three-option selector (for Profile/Settings)
  if (showSystemOption) {
    return (
      <div
        className="flex items-center gap-1 p-1 bg-muted rounded-lg"
        role="radiogroup"
        aria-label={t('theme.label')}
      >
        {themeOptions.map(({ value, icon: Icon, labelKey }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative p-2.5 rounded-md transition-colors touch-target focus-visible-ring
              ${theme === value
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            role="radio"
            aria-checked={theme === value}
            aria-label={t(labelKey)}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            {theme === value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-background rounded-md shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown toggle (for Header)
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2.5 rounded-xl transition-colors touch-target focus-visible-ring
          text-muted-foreground hover:text-foreground hover:bg-muted/50
          ${compact ? '' : 'bg-muted/30'}
        `}
        aria-label={t('theme.toggle')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Sun className="w-5 h-5" aria-hidden="true" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl bg-card border border-border shadow-lg overflow-hidden"
              role="menu"
              aria-orientation="vertical"
            >
              {themeOptions.map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    touch-target focus-visible-ring
                    ${theme === value
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                    }
                  `}
                  role="menuitem"
                  aria-current={theme === value ? 'true' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                  {theme === value && (
                    <motion.svg
                      layoutId="theme-check"
                      className="w-4 h-4 ml-auto text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
