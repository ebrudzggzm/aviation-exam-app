# Havacılık Sınav Takip Sistemi

PPL ve ATPL öğrencileri için geliştirilmiş kapsamlı sınav takip ve yönetim sistemi.

## 🚀 Özellikler

### Mobil Uygulama (React Native)
- ✅ E-posta ile kullanıcı kaydı ve giriş
- ✅ PPL/ATPL grup seçimi
- ✅ Dönem seçimi (PPL aktif, ATPL aktif, ATPL akademik tamamlamış)
- ✅ Ders seçimi (PPL: 9 ders, ATPL: 14 ders)
- ✅ Ön/Son sınav seçimi
- 🔜 Aylık veri girişi
- 🔜 Push bildirimleri
- 🔜 Sınav takvimi görüntüleme

### Yönetim Paneli (React + Vite)
- ✅ Kullanıcı listesi görüntüleme
- ✅ Excel export
- ✅ Filtreleme (grup, dönem)
- ✅ Sınav planlaması
- ✅ Takvim yönetimi
- 🔜 Bildirim gönderme
- 🔜 Raporlar

## 📋 Gereksinimler

- Node.js 18.x veya üzeri
- npm veya yarn
- Firebase hesabı
- iOS geliştirme için: macOS + Xcode
- Android geliştirme için: Android Studio

## 🛠️ Kurulum

### 1. Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) üzerinde yeni bir proje oluşturun
2. Authentication'ı etkinleştirin:
   - Authentication > Sign-in method
   - Email/Password provider'ı etkinleştirin
3. Firestore Database oluşturun:
   - Firestore Database > Create database
   - Test mode ile başlayın (production'da security rules ekleyin)
4. Web app kaydı yapın:
   - Project Settings > Your apps > Add app > Web
   - Config bilgilerini kopyalayın

### 2. Proje Kurulumu

```bash
# Repository'yi klonlayın veya ZIP olarak indirin
cd aviation-exam-app

# Firebase config dosyasını düzenleyin
# shared/firebaseConfig.ts dosyasını açın
# Firebase Console'dan aldığınız bilgileri yapıştırın
```

### 3. Mobil Uygulama Kurulumu

```bash
cd mobile-app

# Bağımlılıkları yükleyin
npm install

# Expo'yu başlatın
npm start

# Uygulamayı çalıştırın:
# - iOS için: i tuşuna basın
# - Android için: a tuşuna basın
# - Web için: w tuşuna basın
```

### 4. Yönetim Paneli Kurulumu

```bash
cd admin-panel

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Tarayıcınızda açın: http://localhost:5173
```

## 📱 App Store & Play Store'a Yükleme

### iOS (App Store)

1. **Apple Developer Hesabı** oluşturun (99$/yıl)
2. **Build alın:**
   ```bash
   cd mobile-app
   expo build:ios
   ```
3. **App Store Connect'e yükleyin**
4. **Review için gönderin**

Detaylı bilgi: [Expo iOS Deployment](https://docs.expo.dev/distribution/app-stores/)

### Android (Play Store)

1. **Google Play Console** hesabı oluşturun (25$ tek seferlik)
2. **Build alın:**
   ```bash
   cd mobile-app
   expo build:android
   ```
3. **Play Console'a yükleyin**
4. **Review için gönderin**

Detaylı bilgi: [Expo Android Deployment](https://docs.expo.dev/distribution/app-stores/)

## 🔐 Güvenlik Kuralları

### Firestore Security Rules

Production'a geçmeden önce `firestore.rules` dosyasını güncelleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerini görebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin kullanıcılar tüm verileri görebilir
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Takvim olayları
    match /calendarEvents/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 📊 Veri Yapısı

### Firestore Collections

#### `users` Collection
```javascript
{
  email: "kullanici@example.com",
  group: "PPL" | "ATPL",
  period: "PPL aktif" | "ATPL aktif" | "ATPL akademik tamamlamış",
  lessons: ["10", "20", "30", ...],
  exams: {
    pre: true,
    final: false
  },
  createdAt: "2026-02-09T10:00:00.000Z",
  emailVerified: false
}
```

#### `calendarEvents` Collection
```javascript
{
  userId: "user_id",
  userEmail: "kullanici@example.com",
  date: "2026-03-15",
  lesson: "10",
  examType: "pre" | "final",
  notes: "Sınav notları",
  createdAt: "2026-02-09T10:00:00.000Z"
}
```

## 🔧 Geliştirme

### Klasör Yapısı

```
aviation-exam-app/
├── mobile-app/          # React Native mobil uygulama
│   ├── src/
│   │   └── screens/     # Ekranlar
│   ├── App.tsx
│   └── package.json
├── admin-panel/         # React yönetim paneli
│   ├── src/
│   │   ├── components/  # Bileşenler
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── shared/              # Ortak dosyalar
    └── firebaseConfig.ts
```

## 🚧 Yapılacaklar (Roadmap)

- [ ] Aylık veri girişi özelliği
- [ ] Push notification entegrasyonu
- [ ] E-posta bildirimleri
- [ ] Kullanıcı profil düzenleme
- [ ] Şifre sıfırlama
- [ ] Dark mode
- [ ] Çoklu dil desteği
- [ ] Analytics entegrasyonu
- [ ] Offline çalışma

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için: [your-email@example.com]

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz!