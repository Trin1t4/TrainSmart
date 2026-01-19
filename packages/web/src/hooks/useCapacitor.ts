/**
 * useCapacitor Hook
 * 
 * Fornisce accesso type-safe alle funzionalità native Capacitor.
 * Gestisce automaticamente il fallback su web.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isNative,
  isIOS,
  isAndroid,
  isWeb,
  initCapacitor,
  addDeepLinkHandler,
  getNetworkStatus,
  onNetworkChange,
  hapticImpact,
  hapticNotification,
  copyToClipboard,
  shareContent,
  canShare,
  openInAppBrowser,
  scheduleLocalNotification,
  requestNotificationPermission,
  getDeviceInfo,
  setPreference,
  getPreference,
  removePreference,
  type ConnectionStatus,
  type DeviceInfo
} from './capacitor';

// ============================================================
// MAIN HOOK
// ============================================================

export function useCapacitor() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    initCapacitor().then(() => setInitialized(true));
  }, []);
  
  return {
    initialized,
    isNative,
    isIOS,
    isAndroid,
    isWeb,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web'
  };
}

// ============================================================
// DEEP LINKING HOOK
// ============================================================

export function useDeepLinks() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isNative) return;
    
    const removeHandler = addDeepLinkHandler((url) => {
      console.log('[DeepLink] Received:', url);
      
      // Parse URL and navigate
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search;
        
        // Handle trainsmart:// scheme
        if (url.startsWith('trainsmart://')) {
          const path = url.replace('trainsmart://', '/');
          navigate(path);
          return;
        }
        
        // Handle https://trainsmart.me links
        if (urlObj.hostname === 'trainsmart.me' || urlObj.hostname === 'www.trainsmart.me') {
          navigate(path || '/');
        }
      } catch (error) {
        console.error('[DeepLink] Error parsing URL:', error);
      }
    });
    
    return removeHandler;
  }, [navigate]);
}

// ============================================================
// NETWORK STATUS HOOK
// ============================================================

export function useNetworkStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Get initial status
    getNetworkStatus().then((s) => {
      setStatus(s);
      setIsOnline(s.connected);
    });
    
    // Listen for changes
    const unsubscribe = onNetworkChange((s) => {
      setStatus(s);
      setIsOnline(s.connected);
    });
    
    // Also listen to web events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { status, isOnline };
}

// ============================================================
// HAPTICS HOOK
// ============================================================

export function useHaptics() {
  const impact = useCallback((style?: 'light' | 'medium' | 'heavy') => {
    hapticImpact(style);
  }, []);
  
  const notification = useCallback((type?: 'success' | 'warning' | 'error') => {
    hapticNotification(type);
  }, []);
  
  return { impact, notification, isAvailable: isNative };
}

// ============================================================
// SHARE HOOK
// ============================================================

export function useShare() {
  const [canShareNative, setCanShareNative] = useState(false);
  
  useEffect(() => {
    canShare().then(setCanShareNative);
  }, []);
  
  const share = useCallback(async (options: {
    title?: string;
    text?: string;
    url?: string;
  }) => {
    // Haptic feedback
    hapticImpact('light');
    
    const result = await shareContent({
      ...options,
      dialogTitle: 'Condividi TrainSmart'
    });
    
    return result;
  }, []);
  
  const copy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      hapticNotification('success');
    }
    return success;
  }, []);
  
  return { share, copy, canShare: canShareNative };
}

// ============================================================
// NOTIFICATIONS HOOK
// ============================================================

export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  
  useEffect(() => {
    // Check web notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  }, []);
  
  const schedule = useCallback(async (options: {
    id: number;
    title: string;
    body: string;
    schedule?: { at: Date };
  }) => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    
    await scheduleLocalNotification(options);
    return true;
  }, [permission, requestPermission]);
  
  return {
    permission,
    requestPermission,
    schedule,
    isSupported: isNative || 'Notification' in window
  };
}

// ============================================================
// DEVICE INFO HOOK
// ============================================================

export function useDeviceInfo() {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  
  useEffect(() => {
    getDeviceInfo().then(setInfo);
  }, []);
  
  return info;
}

// ============================================================
// BROWSER HOOK (In-App Browser)
// ============================================================

export function useBrowser() {
  const open = useCallback(async (url: string) => {
    hapticImpact('light');
    await openInAppBrowser(url);
  }, []);
  
  return { open };
}

// ============================================================
// PREFERENCES HOOK (Secure Storage)
// ============================================================

export function usePreferences<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  
  // Load initial value
  useEffect(() => {
    getPreference(key).then((stored) => {
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored));
        } catch {
          setValue(stored as unknown as T);
        }
      }
      setLoading(false);
    });
  }, [key]);
  
  // Set value
  const set = useCallback(async (newValue: T) => {
    setValue(newValue);
    const serialized = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
    await setPreference(key, serialized);
  }, [key]);
  
  // Remove value
  const remove = useCallback(async () => {
    setValue(defaultValue);
    await removePreference(key);
  }, [key, defaultValue]);
  
  return { value, set, remove, loading };
}

// ============================================================
// SAFE AREA HOOK
// ============================================================

export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  
  useEffect(() => {
    const computeSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10) || 
             parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) ||
                parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10) ||
              parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10) ||
               parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10)
      });
    };
    
    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);
    
    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);
  
  return safeArea;
}
