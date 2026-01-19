# TrainSmart Mobile App Setup

Guida completa per configurare, buildare e pubblicare TrainSmart su App Store e Google Play Store.

## 📋 Prerequisiti

### Per iOS
- macOS (obbligatorio per compilare)
- Xcode 15+ (scarica da App Store)
- Apple Developer Account ($99/anno)
- CocoaPods: `sudo gem install cocoapods`

### Per Android
- Android Studio (qualsiasi OS)
- Google Play Developer Account ($25 una tantum)
- JDK 17+

### Strumenti comuni
- Node.js 18+
- npm/pnpm/yarn

---

## 🚀 Setup Iniziale

### 1. Installa dipendenze

```bash
cd packages/web
npm install
```

### 2. Aggiungi piattaforme

```bash
# Aggiungi iOS (solo su macOS)
npm run ios:add

# Aggiungi Android
npm run android:add
```

### 3. Genera Assets (icone e splash screen)

**Crea le immagini sorgente:**

Nella cartella `packages/web/assets/`:

| File | Dimensione | Descrizione |
|------|-----------|-------------|
| `icon.png` | 1024x1024 | Icona principale (no trasparenza) |
| `icon-foreground.png` | 1024x1024 | Foreground per adaptive icon Android |
| `icon-background.png` | 1024x1024 | Background per adaptive icon Android |
| `splash.png` | 2732x2732 | Splash screen (logo centrato) |
| `splash-dark.png` | 2732x2732 | Splash screen dark mode |
| `notification-icon.png` | 96x96 | Icona notifiche Android (bianco su trasparente) |

**Genera tutte le dimensioni:**

```bash
npm run assets:generate
```

---

## 🍎 Build iOS

### 1. Prima configurazione

```bash
# Build webapp
npm run build

# Sincronizza con iOS
npm run ios:sync

# Apri Xcode
npm run ios:open
```

### 2. Configura in Xcode

1. **Seleziona il Team:**
   - Click su "App" nel navigator
   - Tab "Signing & Capabilities"
   - Seleziona il tuo Apple Developer Team

2. **Configura Bundle ID:**
   - Deve corrispondere a quello registrato su App Store Connect
   - Default: `me.trainsmart.app`

3. **Aggiungi Capabilities:**
   - Associated Domains (già configurato)
   - Push Notifications (già configurato)
   - In-App Purchase (se usi IAP)

4. **Configura Apple-App-Site-Association:**
   - Sostituisci `TEAM_ID` in `ios/App/App/App.entitlements` con il tuo Team ID
   - Il Team ID lo trovi su developer.apple.com → Account → Membership

### 3. Universal Links Setup

Su Vercel, assicurati che `.well-known/apple-app-site-association` sia servito con:
- Content-Type: `application/json`
- No redirect

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [
        { "key": "Content-Type", "value": "application/json" }
      ]
    }
  ]
}
```

### 4. Build per TestFlight

1. In Xcode: Product → Archive
2. Window → Organizer
3. Distribute App → App Store Connect
4. Upload

### 5. App Store Connect

1. Vai su [App Store Connect](https://appstoreconnect.apple.com)
2. Crea nuova app
3. Compila metadati (descrizione, screenshot, privacy policy)
4. Invia per review

---

## 🤖 Build Android

### 1. Prima configurazione

```bash
# Build webapp
npm run build

# Sincronizza con Android
npm run android:sync

# Apri Android Studio
npm run android:open
```

### 2. Configura Firebase (Push Notifications)

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Crea progetto "TrainSmart"
3. Aggiungi app Android con package name `me.trainsmart.app`
4. Scarica `google-services.json`
5. Copia in `android/app/google-services.json`

### 3. Crea Keystore per Release

```bash
cd android/app

# Genera keystore (CONSERVA PASSWORD E FILE!)
keytool -genkey -v -keystore release.keystore -alias trainsmart -keyalg RSA -keysize 2048 -validity 10000
```

**NON perdere questo file e le password!** Senza non potrai aggiornare l'app.

### 4. Configura Signing

Crea `android/keystore.properties`:
```properties
storeFile=release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=trainsmart
keyPassword=YOUR_KEY_PASSWORD
```

Aggiungi a `android/app/build.gradle`:
```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... resto config
        }
    }
}
```

### 5. App Links Setup

Ottieni SHA-256 fingerprint:

```bash
# Debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256

# Release
keytool -list -v -keystore android/app/release.keystore -alias trainsmart | grep SHA256
```

Aggiorna `public/.well-known/assetlinks.json` con il fingerprint.

### 6. Build APK/AAB

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Seleziona Android App Bundle (AAB) per Play Store
3. Seleziona release keystore
4. Build

Oppure da terminale:
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 7. Google Play Console

1. Vai su [Google Play Console](https://play.google.com/console)
2. Crea nuova app
3. Compila listing (descrizione, screenshot, privacy policy)
4. Upload AAB
5. Rilascia su Internal Testing prima, poi Production

---

## 🔔 Push Notifications Setup

### iOS (APNs)

1. Su developer.apple.com → Certificates, Identifiers & Profiles
2. Crea APNs Key (o Certificate)
3. Configura il key nel tuo backend (Supabase)

### Android (FCM)

1. Firebase Console → Project Settings → Cloud Messaging
2. Copia Server Key
3. Configura nel backend

### Backend (Supabase)

Crea Edge Function per inviare push:

```typescript
// supabase/functions/send-push/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { token, title, body, data } = await req.json()
  
  // Per FCM (Android)
  const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      data
    })
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 💳 In-App Purchase (Solo iOS)

Se decidi di usare IAP per le subscription su iOS:

### 1. Configura Prodotti su App Store Connect

App Store Connect → In-App Purchases → Create:
- `trainsmart.base` - €12.90/6 settimane
- `trainsmart.pro` - €24.90/6 settimane  
- `trainsmart.coach` - €39.90/6 settimane

### 2. Installa Plugin

```bash
npm install @capacitor-community/in-app-purchases
npx cap sync
```

### 3. Implementa nel Frontend

```typescript
import { InAppPurchases } from '@capacitor-community/in-app-purchases';

// Carica prodotti
const { products } = await InAppPurchases.getProducts({
  productIds: ['trainsmart.base', 'trainsmart.pro', 'trainsmart.coach']
});

// Acquista
await InAppPurchases.purchaseProduct({ productId: 'trainsmart.pro' });

// Verifica receipt sul backend
```

---

## 📱 Testing

### iOS Simulator
```bash
npm run ios:run
```

### Android Emulator
```bash
npm run android:run
```

### Device Fisico
```bash
npm run ios:run:device
npm run android:run:device
```

---

## 🔄 Workflow di Update

Quando aggiorni l'app:

```bash
# 1. Build webapp
npm run build

# 2. Sync con native
npm run cap:sync

# 3. Incrementa version
# - iOS: Xcode → General → Version & Build
# - Android: android/app/build.gradle → versionCode & versionName

# 4. Build release
# iOS: Xcode Archive
# Android: ./gradlew bundleRelease

# 5. Upload
# iOS: App Store Connect
# Android: Play Console
```

---

## 🐛 Troubleshooting

### iOS

**"Could not find module 'Capacitor'"**
```bash
cd ios/App
pod install
```

**"Signing requires a development team"**
- Seleziona team in Xcode → Signing & Capabilities

### Android

**"SDK location not found"**
Crea `android/local.properties`:
```
sdk.dir=/Users/USERNAME/Library/Android/sdk
```

**"Execution failed for task ':app:processReleaseResources'"**
```bash
cd android
./gradlew clean
```

### Generale

**Assets non aggiornati**
```bash
npm run build
npm run cap:sync
```

---

## 📝 Checklist Pre-Release

### iOS
- [ ] Bundle ID corretto
- [ ] Team ID configurato
- [ ] App.entitlements aggiornato
- [ ] AASA file servito correttamente
- [ ] Privacy Policy URL configurata
- [ ] Screenshot preparati (6.5", 5.5", iPad)
- [ ] App Preview video (opzionale)
- [ ] Testato su dispositivo fisico

### Android
- [ ] Package name corretto
- [ ] google-services.json presente
- [ ] Release keystore creato e backup
- [ ] assetlinks.json con SHA256 corretto
- [ ] Privacy Policy URL configurata
- [ ] Screenshot preparati
- [ ] Feature graphic (1024x500)
- [ ] Testato su dispositivo fisico

---

## 📞 Supporto

Per problemi:
1. Controlla la [documentazione Capacitor](https://capacitorjs.com/docs)
2. Cerca su [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)
3. Apri issue su GitHub
