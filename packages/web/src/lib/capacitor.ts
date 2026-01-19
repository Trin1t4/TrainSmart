/**
 * Capacitor Native Bridge
 * 
 * Centralizza tutte le interazioni con i plugin Capacitor.
 * Fornisce API type-safe e gestisce graceful degradation su web.
 */

import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { Device, DeviceInfo } from '@capacitor/device';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { LocalNotifications, LocalNotificationSchema, ScheduleOptions } from '@capacitor/local-notifications';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Share, ShareResult } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// ============================================================
// PLATFORM DETECTION
// ============================================================

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isWeb = Capacitor.getPlatform() === 'web';

// ============================================================
// DEVICE INFO
// ============================================================

export async function getDeviceInfo(): Promise<DeviceInfo> {
  return Device.getInfo();
}

export async function getDeviceId(): Promise<string> {
  const { identifier } = await Device.getId();
  return identifier;
}

// ============================================================
// APP LIFECYCLE & DEEP LINKING
// ============================================================

type DeepLinkHandler = (url: string) => void;
let deepLinkHandlers: DeepLinkHandler[] = [];

export function initAppListeners() {
  if (!isNative) return;
  
  // Handle app URL open (deep linking)
  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    console.log('[Capacitor] App URL opened:', event.url);
    deepLinkHandlers.forEach(handler => handler(event.url));
  });
  
  // Handle back button (Android)
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // Optionally minimize app or show exit confirmation
      App.minimizeApp();
    }
  });
  
  // Handle app state changes
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('[Capacitor] App state:', isActive ? 'active' : 'background');
  });
}

export function addDeepLinkHandler(handler: DeepLinkHandler) {
  deepLinkHandlers.push(handler);
  return () => {
    deepLinkHandlers = deepLinkHandlers.filter(h => h !== handler);
  };
}

export async function exitApp() {
  if (isNative) {
    await App.exitApp();
  }
}

// ============================================================
// SPLASH SCREEN
// ============================================================

export async function hideSplashScreen() {
  if (!isNative) return;
  
  try {
    await SplashScreen.hide({
      fadeOutDuration: 500
    });
  } catch (error) {
    console.error('[Capacitor] Error hiding splash:', error);
  }
}

export async function showSplashScreen() {
  if (!isNative) return;
  
  try {
    await SplashScreen.show({
      autoHide: false
    });
  } catch (error) {
    console.error('[Capacitor] Error showing splash:', error);
  }
}

// ============================================================
// STATUS BAR
// ============================================================

export async function setStatusBarStyle(style: 'dark' | 'light') {
  if (!isNative) return;
  
  try {
    await StatusBar.setStyle({
      style: style === 'dark' ? Style.Dark : Style.Light
    });
  } catch (error) {
    console.error('[Capacitor] Error setting status bar style:', error);
  }
}

export async function hideStatusBar() {
  if (!isNative) return;
  
  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('[Capacitor] Error hiding status bar:', error);
  }
}

export async function showStatusBar() {
  if (!isNative) return;
  
  try {
    await StatusBar.show();
  } catch (error) {
    console.error('[Capacitor] Error showing status bar:', error);
  }
}

// ============================================================
// HAPTICS
// ============================================================

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!isNative) return;
  
  const styleMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy
  };
  
  try {
    await Haptics.impact({ style: styleMap[style] });
  } catch (error) {
    // Silently fail - haptics not critical
  }
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isNative) return;
  
  const typeMap = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error
  };
  
  try {
    await Haptics.notification({ type: typeMap[type] });
  } catch (error) {
    // Silently fail
  }
}

export async function hapticVibrate() {
  if (!isNative) return;
  
  try {
    await Haptics.vibrate();
  } catch (error) {
    // Silently fail
  }
}

// ============================================================
// KEYBOARD
// ============================================================

type KeyboardHandler = (info: KeyboardInfo) => void;
let keyboardShowHandlers: KeyboardHandler[] = [];
let keyboardHideHandlers: (() => void)[] = [];

export function initKeyboardListeners() {
  if (!isNative) return;
  
  Keyboard.addListener('keyboardWillShow', (info) => {
    keyboardShowHandlers.forEach(h => h(info));
  });
  
  Keyboard.addListener('keyboardWillHide', () => {
    keyboardHideHandlers.forEach(h => h());
  });
}

export function onKeyboardShow(handler: KeyboardHandler) {
  keyboardShowHandlers.push(handler);
  return () => {
    keyboardShowHandlers = keyboardShowHandlers.filter(h => h !== handler);
  };
}

export function onKeyboardHide(handler: () => void) {
  keyboardHideHandlers.push(handler);
  return () => {
    keyboardHideHandlers = keyboardHideHandlers.filter(h => h !== handler);
  };
}

export async function hideKeyboard() {
  if (!isNative) return;
  
  try {
    await Keyboard.hide();
  } catch (error) {
    // Silently fail
  }
}

// ============================================================
// NETWORK
// ============================================================

export async function getNetworkStatus(): Promise<ConnectionStatus> {
  return Network.getStatus();
}

export function onNetworkChange(handler: (status: ConnectionStatus) => void) {
  const listener = Network.addListener('networkStatusChange', handler);
  return () => listener.remove();
}

// ============================================================
// BROWSER (In-App Browser)
// ============================================================

export async function openInAppBrowser(url: string) {
  try {
    await Browser.open({
      url,
      presentationStyle: 'popover',
      toolbarColor: '#0f172a'
    });
  } catch (error) {
    // Fallback to window.open
    window.open(url, '_blank');
  }
}

export async function closeInAppBrowser() {
  try {
    await Browser.close();
  } catch (error) {
    // Ignore
  }
}

// ============================================================
// CLIPBOARD
// ============================================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.write({ string: text });
    return true;
  } catch (error) {
    // Fallback to web API
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

export async function readFromClipboard(): Promise<string | null> {
  try {
    const { value } = await Clipboard.read();
    return value || null;
  } catch (error) {
    return null;
  }
}

// ============================================================
// SHARE
// ============================================================

export async function shareContent(options: {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}): Promise<ShareResult | null> {
  try {
    return await Share.share(options);
  } catch (error) {
    // Fallback to Web Share API
    if (navigator.share) {
      await navigator.share(options);
      return { activityType: 'web-share' };
    }
    return null;
  }
}

export async function canShare(): Promise<boolean> {
  if (isNative) return true;
  return !!navigator.share;
}

// ============================================================
// LOCAL NOTIFICATIONS
// ============================================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch (error) {
    return false;
  }
}

export async function scheduleLocalNotification(options: {
  id: number;
  title: string;
  body: string;
  schedule?: { at: Date };
  extra?: Record<string, any>;
}): Promise<void> {
  if (!isNative) {
    // Web fallback - use Notification API for immediate
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, { body: options.body });
    }
    return;
  }
  
  const notification: LocalNotificationSchema = {
    id: options.id,
    title: options.title,
    body: options.body,
    schedule: options.schedule,
    extra: options.extra,
    sound: 'notification.wav',
    smallIcon: 'ic_stat_icon',
    iconColor: '#10b981'
  };
  
  await LocalNotifications.schedule({ notifications: [notification] });
}

export async function cancelNotification(id: number) {
  if (!isNative) return;
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

export async function cancelAllNotifications() {
  if (!isNative) return;
  const pending = await LocalNotifications.getPending();
  await LocalNotifications.cancel(pending);
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================

let pushTokenCallback: ((token: string) => void) | null = null;
let pushNotificationCallback: ((notification: PushNotificationSchema) => void) | null = null;
let pushActionCallback: ((action: ActionPerformed) => void) | null = null;

export async function initPushNotifications(callbacks: {
  onToken?: (token: string) => void;
  onNotification?: (notification: PushNotificationSchema) => void;
  onAction?: (action: ActionPerformed) => void;
}) {
  if (!isNative) return;
  
  pushTokenCallback = callbacks.onToken || null;
  pushNotificationCallback = callbacks.onNotification || null;
  pushActionCallback = callbacks.onAction || null;
  
  // Request permission
  const permission = await PushNotifications.requestPermissions();
  
  if (permission.receive === 'granted') {
    // Register with APNs/FCM
    await PushNotifications.register();
  }
  
  // Token received
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('[Push] Token:', token.value);
    pushTokenCallback?.(token.value);
  });
  
  // Registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('[Push] Registration error:', error);
  });
  
  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[Push] Received:', notification);
    pushNotificationCallback?.(notification);
  });
  
  // User tapped on notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[Push] Action:', action);
    pushActionCallback?.(action);
  });
}

// ============================================================
// PREFERENCES (Secure Storage)
// ============================================================

export async function setPreference(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export async function getPreference(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value;
}

export async function removePreference(key: string): Promise<void> {
  await Preferences.remove({ key });
}

export async function clearPreferences(): Promise<void> {
  await Preferences.clear();
}

// ============================================================
// INITIALIZATION
// ============================================================

export async function initCapacitor() {
  console.log('[Capacitor] Platform:', Capacitor.getPlatform());
  console.log('[Capacitor] Is native:', isNative);
  
  if (!isNative) {
    console.log('[Capacitor] Running in web mode');
    return;
  }
  
  // Initialize listeners
  initAppListeners();
  initKeyboardListeners();
  
  // Set status bar style
  await setStatusBarStyle('dark');
  
  // Hide splash screen after a delay
  setTimeout(() => hideSplashScreen(), 500);
  
  console.log('[Capacitor] Initialized');
}

// Export types
export type { DeviceInfo, ConnectionStatus, ShareResult };
