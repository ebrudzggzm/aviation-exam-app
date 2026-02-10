# Firebase Kurulum Rehberi

Bu rehber, Firebase projenizi adım adım nasıl kuracağınızı gösterir.

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" (Proje ekle) butonuna tıklayın
3. Proje adı girin: `aviation-exam-tracker`
4. Google Analytics'i isteğe bağlı olarak etkinleştirin
5. "Create project" butonuna tıklayın

## 2. Authentication Kurulumu

1. Sol menüden "Authentication" seçeneğine tıklayın
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine geçin
4. "Email/Password" provider'ı seçin
5. "Enable" toggle'ını açın
6. "Save" butonuna tıklayın

## 3. Firestore Database Kurulumu

1. Sol menüden "Firestore Database" seçeneğine tıklayın
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçeneğini seçin (geliştirme için)
   - ⚠️ Production'da mutlaka güvenlik kurallarını güncelleyin!
4. Location seçin (Europe-west için `eur3` önerilir)
5. "Enable" butonuna tıklayın

## 4. Web App Kaydı

1. Project Overview sayfasından "Add app" butonuna tıklayın
2. Web ikonu (</>) seçin
3. App nickname girin: `Aviation Exam Tracker`
4. "Also set up Firebase Hosting" işaretlemeyin
5. "Register app" butonuna tıklayın
6. **ÖNEMLİ:** Gösterilen config bilgilerini kopyalayın

## 5. Config Bilgilerini Projeye Ekleme

Firebase Console'dan aldığınız config bilgileri şuna benzer:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "aviation-exam-tracker.firebaseapp.com",
  projectId: "aviation-exam-tracker",
  storageBucket: "aviation-exam-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

Bu bilgileri `shared/firebaseConfig.ts` dosyasına yapıştırın:

```typescript
const firebaseConfig = {
  apiKey: "BURAYA_API_KEY_YAPIŞTIRIN",
  authDomain: "BURAYA_AUTH_DOMAIN_YAPIŞTIRIN",
  projectId: "BURAYA_PROJECT_ID_YAPIŞTIRIN",
  storageBucket: "BURAYA_STORAGE_BUCKET_YAPIŞTIRIN",
  messagingSenderId: "BURAYA_MESSAGING_SENDER_ID_YAPIŞTIRIN",
  appId: "BURAYA_APP_ID_YAPIŞTIRIN"
};
```

## 6. Admin Kullanıcı Oluşturma

Yönetim paneline erişim için bir admin kullanıcı oluşturun:

1. Mobil uygulamayı çalıştırın
2. E-posta ile kayıt olun
3. Firebase Console > Authentication > Users
4. Kullanıcınızın UID'sini kopyalayın
5. Firestore Database'e gidin
6. Yeni collection oluşturun: `admins`
7. Document ID olarak kopyaladığınız UID'yi kullanın
8. Field ekleyin:
   ```
   isAdmin: true
   email: "your-email@example.com"
   ```

## 7. Security Rules Güncelleme (Production için)

⚠️ **ÇOK ÖNEMLİ:** Test mode sadece geliştirme içindir!

Firestore Database > Rules sekmesinden aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin kontrolü için yardımcı fonksiyon
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Kullanıcılar
    match /users/{userId} {
      // Kullanıcı kendi verilerini okuyabilir/yazabilir
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admin tüm kullanıcıları görebilir
      allow read: if isAdmin();
    }
    
    // Takvim olayları
    match /calendarEvents/{eventId} {
      // Kullanıcı kendi olaylarını görebilir
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      // Admin tüm olayları görebilir ve yönetebilir
      allow read, write: if isAdmin();
    }
    
    // Veri girişleri
    match /dataEntries/{entryId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow read: if isAdmin();
    }
    
    // Admin koleksiyonu
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
    }
  }
}
```

## 8. Cloud Functions Kurulumu (İsteğe Bağlı)

Bildirimler ve otomasyon için:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

## 9. Hosting Kurulumu (İsteğe Bağlı)

Admin panelini Firebase Hosting'de yayınlamak için:

```bash
firebase init hosting
# Build klasörü olarak 'admin-panel/dist' seçin
```

## 10. Test Etme

1. Mobil uygulamayı başlatın: `cd mobile-app && npm start`
2. Admin panelini başlatın: `cd admin-panel && npm run dev`
3. Test kullanıcısı oluşturun
4. Admin panelden giriş yapın
5. Kullanıcıları görüntüleyin

## Sorun Giderme

### "Permission denied" hatası
- Firestore security rules'u kontrol edin
- Admin kullanıcısını doğru oluşturduğunuzdan emin olun

### "API key not valid" hatası
- firebaseConfig.ts dosyasındaki bilgileri kontrol edin
- Firebase Console'dan doğru bilgileri kopyaladığınızdan emin olun

### Authentication çalışmıyor
- Firebase Console > Authentication > Sign-in method
- Email/Password provider'ın etkin olduğundan emin olun

## Faydalı Linkler

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

## Destek

Sorunlarla karşılaşırsanız:
1. Firebase Console'u kontrol edin
2. Browser console'da hata mesajlarını inceleyin
3. Firebase Status sayfasını kontrol edin: https://status.firebase.google.com/