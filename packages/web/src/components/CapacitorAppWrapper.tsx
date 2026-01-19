/**
 * CapacitorAppWrapper
 * 
 * Wrappa l'applicazione React per:
 * - Inizializzare Capacitor all'avvio
 * - Gestire deep linking
 * - Mostrare offline banner quando disconnesso
 * - Gestire back button su Android
 */

import { useEffect, useState, ReactNode } from 'react';
import { useDeepLinks, useNetworkStatus, useCapacitor } from '../hooks/useCapacitor';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CapacitorAppWrapperProps {
  children: ReactNode;
}

export default function CapacitorAppWrapper({ children }: CapacitorAppWrapperProps) {
  const { initialized, isNative, platform } = useCapacitor();
  const { isOnline } = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  
  // Initialize deep linking
  useDeepLinks();
  
  // Show offline banner with delay (avoid flashing)
  useEffect(() => {
    if (!isOnline) {
      const timer = setTimeout(() => setShowOfflineBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowOfflineBanner(false);
    }
  }, [isOnline]);
  
  // Add platform class to body
  useEffect(() => {
    if (isNative) {
      document.body.classList.add('capacitor', `platform-${platform}`);
    }
    return () => {
      document.body.classList.remove('capacitor', 'platform-ios', 'platform-android');
    };
  }, [isNative, platform]);
  
  // Handle viewport for keyboard on mobile
  useEffect(() => {
    if (!isNative) return;
    
    // Prevent viewport zoom on input focus (iOS)
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }, [isNative]);
  
  return (
    <>
      {children}
      
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-3 flex items-center justify-center gap-2 safe-area-top"
          >
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Sei offline</span>
            <span className="text-amber-100 text-sm">
              Alcune funzionalità potrebbero non essere disponibili
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Online Restored Toast */}
      <AnimatePresence>
        {!showOfflineBanner && isOnline && (
          <OnlineRestoredToast />
        )}
      </AnimatePresence>
    </>
  );
}

// Toast that shows briefly when connection is restored
function OnlineRestoredToast() {
  const [show, setShow] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  
  useEffect(() => {
    // Track if user has been offline
    const wasOffline = sessionStorage.getItem('was_offline') === 'true';
    
    if (wasOffline) {
      setHasBeenOffline(true);
      setShow(true);
      sessionStorage.removeItem('was_offline');
      
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Set offline flag
  useEffect(() => {
    const handleOffline = () => {
      sessionStorage.setItem('was_offline', 'true');
    };
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, []);
  
  if (!show || !hasBeenOffline) return null;
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm"
    >
      <Wifi className="w-5 h-5" />
      <span className="font-medium">Connessione ripristinata</span>
    </motion.div>
  );
}

// CSS to add to index.css for native apps
export const CAPACITOR_CSS = `
/* Capacitor-specific styles */
.capacitor {
  /* Prevent text selection on long press */
  -webkit-user-select: none;
  user-select: none;
  
  /* Prevent callout on long press */
  -webkit-touch-callout: none;
}

/* iOS specific */
.platform-ios {
  /* Account for status bar */
  padding-top: env(safe-area-inset-top);
}

/* Android specific */
.platform-android {
  /* Android usually handles safe areas differently */
}

/* Allow text selection in inputs */
.capacitor input,
.capacitor textarea,
.capacitor [contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}

/* Prevent rubber-band scrolling on iOS */
.capacitor body {
  overscroll-behavior: none;
}

/* Native-like button press effect */
.capacitor button:active,
.capacitor a:active,
.capacitor [role="button"]:active {
  opacity: 0.7;
  transform: scale(0.98);
}
`;
