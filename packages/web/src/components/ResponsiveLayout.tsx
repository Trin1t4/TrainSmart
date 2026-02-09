import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';
import BottomNavigation from './BottomNavigation';
import MobileHeader from './MobileHeader';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

// Pagine che NON devono mostrare la navigazione
const PAGES_WITHOUT_NAV = [
  '/',           // Landing
  '/login',
  '/register',
  '/onboarding',
  '/optional-quizzes',
  '/first-session-assessment',
  '/quiz',
  '/quiz-full',
  '/screening',
  '/screening-full',
  '/body-scan',
  '/workout-session', // Full-screen workout mode
  '/video-feedback',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/demo',
  '/payment-success',
  '/admin',
];

// Titoli custom per alcune pagine
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'TrainSmart',
  '/workout': 'Programma',
  '/stats': 'Statistiche',
  '/profile': 'Profilo',
  '/settings': 'Impostazioni',
  '/recovery-screening': 'Recovery',
};

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Check if current page should show navigation
  const shouldShowNav = !PAGES_WITHOUT_NAV.some(path =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Get page title
  const pageTitle = PAGE_TITLES[location.pathname];

  if (!isMobile) {
    // Desktop: render children without mobile navigation
    return <>{children}</>;
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - sempre visibile quando c'è la nav */}
      {shouldShowNav && (
        <MobileHeader
          title={pageTitle}
          showLogo={!pageTitle || pageTitle === 'TrainSmart'}
        />
      )}

      {/* Main Content with padding for header and bottom nav */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`
          ${shouldShowNav ? 'pt-14' : ''}
          ${shouldShowNav ? 'pb-20' : ''}
          focus:outline-none
        `}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {shouldShowNav && <BottomNavigation />}
    </div>
  );
}
