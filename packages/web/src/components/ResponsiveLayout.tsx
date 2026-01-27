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
  '/quiz',
  '/screening',
  '/body-scan',
  '/workout-session', // Full-screen workout mode
  '/video-feedback',
];

// Configurazione header per pagina
const PAGE_HEADER_CONFIG: Record<string, {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}> = {
  '/dashboard': {
    title: 'Dashboard',
    showMenu: false,
    showNotifications: true,
    showProfile: true,
  },
  '/workout': {
    title: 'Allenamento',
    showBack: true,
    showNotifications: false,
  },
  '/stats': {
    title: 'Statistiche',
    showBack: false,
  },
  '/profile': {
    title: 'Profilo',
    showBack: false,
  },
  '/settings': {
    title: 'Impostazioni',
    showBack: true,
  },
};

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Check if current page should show navigation
  const shouldShowNav = !PAGES_WITHOUT_NAV.some(path =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Get header config for current page
  const headerConfig = PAGE_HEADER_CONFIG[location.pathname];

  if (!isMobile) {
    // Desktop: render children without mobile navigation
    return <>{children}</>;
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {shouldShowNav && headerConfig && (
        <MobileHeader {...headerConfig} />
      )}

      {/* Main Content with padding for header and bottom nav */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`
          ${shouldShowNav && headerConfig ? 'pt-14' : ''}
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
