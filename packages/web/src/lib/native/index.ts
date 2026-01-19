/**
 * Native Module Exports
 * 
 * Punto di ingresso centralizzato per tutte le funzionalità native.
 */

// Core Capacitor utilities
export {
  isNative,
  isIOS,
  isAndroid,
  isWeb,
  initCapacitor,
  
  // Device
  getDeviceInfo,
  getDeviceId,
  
  // App lifecycle
  addDeepLinkHandler,
  exitApp,
  
  // UI
  hideSplashScreen,
  showSplashScreen,
  setStatusBarStyle,
  hideStatusBar,
  showStatusBar,
  
  // Haptics
  hapticImpact,
  hapticNotification,
  hapticVibrate,
  
  // Keyboard
  onKeyboardShow,
  onKeyboardHide,
  hideKeyboard,
  
  // Network
  getNetworkStatus,
  onNetworkChange,
  
  // Browser
  openInAppBrowser,
  closeInAppBrowser,
  
  // Clipboard
  copyToClipboard,
  readFromClipboard,
  
  // Share
  shareContent,
  canShare,
  
  // Notifications
  requestNotificationPermission,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  initPushNotifications,
  
  // Preferences
  setPreference,
  getPreference,
  removePreference,
  clearPreferences,
  
  // Types
  type DeviceInfo,
  type ConnectionStatus,
  type ShareResult
} from './capacitor';

// React Hooks
export {
  useCapacitor,
  useDeepLinks,
  useNetworkStatus,
  useHaptics,
  useShare,
  useNotifications,
  useDeviceInfo,
  useBrowser,
  usePreferences,
  useSafeArea
} from '../hooks/useCapacitor';

// In-App Purchases (iOS only)
export {
  IAP_PRODUCTS,
  initIAP,
  loadProducts,
  purchaseProduct,
  verifyReceipt,
  restorePurchases,
  finishTransaction,
  addTransactionListener,
  useIAP,
  type IAPProductId
} from './iapService';
