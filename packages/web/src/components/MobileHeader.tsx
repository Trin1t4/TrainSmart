import { Menu, HelpCircle, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import HelpPanel from './HelpPanel';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  transparent?: boolean;
}

export default function MobileHeader({
  title,
  showLogo = true,
  transparent = false
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 safe-area-top ${
          transparent
            ? 'bg-transparent'
            : 'bg-background/95 backdrop-blur-xl border-b border-border'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-target focus-visible-ring"
            aria-label="Apri menu"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </motion.button>

          {/* Center - Logo or Title */}
          <div className="flex items-center gap-2">
            {showLogo && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <h1 className="text-lg font-display font-bold text-foreground">
              {title || 'TrainSmart'}
            </h1>
          </div>

          {/* Right side - Help */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsHelpOpen(true)}
            className="p-2.5 -mr-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-target focus-visible-ring"
            aria-label="Aiuto"
          >
            <HelpCircle className="w-6 h-6" aria-hidden="true" />
          </motion.button>
        </div>
      </header>

      {/* Hamburger Menu Drawer */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Help Panel */}
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
