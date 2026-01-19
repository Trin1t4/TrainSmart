import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.trainsmart.app',
  appName: 'TrainSmart',
  webDir: 'dist',
  
  // Server configuration for development
  server: {
    // Per development: usa l'URL locale
    // url: 'http://localhost:5173',
    // cleartext: true,
    
    // Per production: usa i file buildati
    androidScheme: 'https',
    iosScheme: 'https',
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile',
    // Schema per deep linking
    scheme: 'trainsmart',
  },
  
  // Android specific configuration
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true solo in dev
    // Schema per deep linking
    // buildOptions: {
    //   keystorePath: 'keys/release.keystore',
    //   keystoreAlias: 'trainsmart',
    // },
  },
  
  // Plugins configuration
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0f172a', // slate-900
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    
    // App (deep linking)
    App: {
      // No specific config needed
    },
    
    // Browser (for OAuth redirects)
    Browser: {
      // No specific config needed
    },
    
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#10b981', // emerald-500
      sound: 'notification.wav',
    },
    
    // CapacitorHttp - per richieste native (bypass CORS)
    CapacitorHttp: {
      enabled: true,
    },
  },
  
  // Logging (disable in production)
  loggingBehavior: 'none', // 'debug' per development
};

export default config;
