# Deployment Rehberi

Bu rehber, uygulamanızı canlıya almak için adım adım talimatlar içerir.

## 📱 Mobil Uygulama Deployment

### iOS (App Store)

#### Ön Gereksinimler
- macOS bilgisayar
- Apple Developer hesabı (99$/yıl)
- Xcode kurulu

#### Adım 1: Apple Developer Hesabı
1. https://developer.apple.com/ adresine gidin
2. Hesap oluşturun ve ücretini ödeyin (99$/yıl)
3. Certificates, Identifiers & Profiles bölümünden:
   - App ID oluşturun: `com.yourcompany.aviationexam`
   - Push notification capability ekleyin

#### Adım 2: App Store Connect
1. https://appstoreconnect.apple.com/ adresine gidin
2. "My Apps" → "+" → "New App"
3. Gerekli bilgileri doldurun:
   - Platform: iOS
   - Name: Havacılık Sınav Takip
   - Primary Language: Turkish
   - Bundle ID: Önceki adımda oluşturduğunuz
   - SKU: aviation-exam-001

#### Adım 3: Build ve Upload
```bash
cd mobile-app

# Expo hesabı oluşturun (ücretsiz)
npx expo register

# Build yapın
eas build --platform ios

# Build tamamlandığında otomatik olarak App Store Connect'e yüklenir
```

#### Adım 4: Metadata ve Screenshots
1. App Store Connect'te uygulamanıza gidin
2. Screenshots ekleyin (6.5", 5.5" iPhone için)
3. App Preview video (isteğe bağlı)
4. Description yazın
5. Keywords ekleyin
6. Privacy Policy URL ekleyin

#### Adım 5: Review için Gönderme
1. "Submit for Review" butonuna tıklayın
2. Export Compliance bilgilerini doldurun
3. Review süresi: 1-7 gün

### Android (Play Store)

#### Ön Gereksinimler
- Google Play Console hesabı (25$ tek seferlik)

#### Adım 1: Play Console Hesabı
1. https://play.google.com/console adresine gidin
2. Hesap oluşturun ve 25$ ücretini ödeyin
3. Developer hesabı doğrulamasını tamamlayın

#### Adım 2: Uygulama Oluşturma
1. "Create app" butonuna tıklayın
2. Gerekli bilgileri doldurun:
   - App name: Havacılık Sınav Takip
   - Default language: Turkish
   - App or game: App
   - Free or paid: Free

#### Adım 3: Build ve Upload
```bash
cd mobile-app

# Build yapın
eas build --platform android

# AAB dosyası oluşturulacak
```

#### Adım 4: Store Listing
1. Play Console'da uygulamanıza gidin
2. Store listing bölümünü doldurun:
   - Short description (80 karakter)
   - Full description (4000 karakter)
   - Screenshots (en az 2 adet)
   - Feature graphic (1024x500)
   - App icon (512x512)

#### Adım 5: Content Rating
1. Content rating anketi doldurun
2. Educational/informational app olarak işaretleyin

#### Adım 6: Pricing & Distribution
1. Free olarak işaretleyin
2. Ülkeler seçin (Türkiye mutlaka)
3. Content guidelines kabul edin

#### Adım 7: Review için Gönderme
1. "Start rollout to production" → "Rollout"
2. Review süresi: 1-7 gün

## 💻 Admin Panel Deployment

### Seçenek 1: Firebase Hosting (Önerilen)

#### Kurulum
```bash
# Firebase CLI kur
npm install -g firebase-tools

# Firebase'e giriş yap
firebase login

# Proje klasörüne git
cd admin-panel

# Firebase'i başlat
firebase init hosting

# Build klasörü: dist
# Single page app: Yes
# GitHub Actions: No (isteğe bağlı)
```

#### Build ve Deploy
```bash
# Production build
npm run build

# Deploy et
firebase deploy --only hosting
```

URL: `https://your-project-id.web.app`

### Seçenek 2: Vercel (Alternatif)

```bash
# Vercel CLI kur
npm install -g vercel

cd admin-panel

# Deploy
vercel

# Production
vercel --prod
```

### Seçenek 3: Netlify

1. https://netlify.com adresine gidin
2. GitHub repo bağla veya manual upload
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

## 🔐 Production Güvenliği

### Firebase Security Rules Güncelleme

```javascript
// Production rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isAdmin();
    }
    
    match /calendarEvents/{eventId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    match /admins/{adminId} {
      allow read: if isOwner(adminId);
    }
  }
}
```

### Environment Variables

`.env` dosyası oluşturun (GIT'e commit ETMEYİN):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

Config dosyasını güncelleyin:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

## 📊 Analytics Ekleme

### Firebase Analytics
```bash
cd mobile-app
expo install expo-firebase-analytics
```

```typescript
import * as Analytics from 'expo-firebase-analytics';

// Event tracking
Analytics.logEvent('user_registered', {
  group: 'PPL',
  platform: 'mobile'
});
```

### Google Analytics (Admin Panel)
```bash
cd admin-panel
npm install react-ga4
```

```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

## 🔔 Push Notifications

### Firebase Cloud Messaging
```bash
cd mobile-app
expo install expo-notifications
```

Config güncellemesi:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## 🧪 Pre-Launch Checklist

- [ ] Firebase security rules production'a hazır
- [ ] API keys environment variables'da
- [ ] Error tracking (Sentry) kuruldu
- [ ] Analytics çalışıyor
- [ ] Privacy Policy hazır
- [ ] Terms of Service hazır
- [ ] Screenshots hazır (iOS: 6.5", Android: multiple)
- [ ] App icons doğru boyutlarda
- [ ] Test kullanıcılar ile test edildi
- [ ] Crash test yapıldı
- [ ] Performance test yapıldı
- [ ] Email verification çalışıyor
- [ ] Admin panel production URL'de

## 🚀 Launch Day

1. **Son kontroller:**
   - Tüm özellikler test edildi mi?
   - Backend hazır mı?
   - Support email çalışıyor mu?

2. **Deploy:**
   - Admin panel deploy
   - Mobil apps submit

3. **Monitor:**
   - Crash reports
   - User feedback
   - Analytics
   - Performance

## 📈 Post-Launch

1. **İlk 24 saat:**
   - Real-time monitoring
   - Hızlı bug fix için hazır olun

2. **İlk hafta:**
   - User feedback topla
   - Analytics incele
   - Kritik buglar düzelt

3. **İlk ay:**
   - Feature requests değerlendir
   - Performance optimization
   - User retention analizi

## 🆘 Sorun Giderme

### App Store Rejection
- Privacy Policy eksik → Ekleyin
- Crash oluyor → Düzeltin ve resubmit
- Metadata hatalı → Düzeltin

### Play Store Rejection
- Content rating yanlış → Düzeltin
- Screenshots yetersiz → Daha fazla ekleyin
- APK imza sorunu → Keystore kontrol edin

### Firebase Quota Aşımı
- Spark plan'dan Blaze plan'a geçin
- Read/write işlemlerini optimize edin
- Cache kullanın

## 📞 Destek

- Firebase: https://firebase.google.com/support
- Expo: https://docs.expo.dev/
- App Store: https://developer.apple.com/contact/
- Play Store: https://support.google.com/googleplay/android-developer/

İyi şanslar! 🎉