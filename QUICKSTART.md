# Hızlı Başlangıç Rehberi

Bu rehber projeyi 15 dakikada çalıştırmanızı sağlar.

## ✅ Ön Gereksinimler

- [ ] Node.js kurulu (https://nodejs.org/)
- [ ] Firebase hesabı (https://console.firebase.google.com/)
- [ ] Bir kod editörü (VS Code önerilir)

## 📱 Adım 1: Firebase Kurulumu (5 dakika)

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. "Add project" → Proje adı girin → Oluştur
3. **Authentication kurun:**
   - Sol menü → Authentication → Get started
   - Sign-in method → Email/Password → Enable
4. **Firestore kurun:**
   - Sol menü → Firestore Database → Create database
   - Test mode → Location seçin → Enable
5. **Web app ekleyin:**
   - Project Overview → Add app → Web (</> ikonu)
   - App nickname girin → Register app
   - **Config bilgilerini kopyalayın!** (bir sonraki adımda kullanacaksınız)

## 🔧 Adım 2: Projeyi Yapılandırma (3 dakika)

1. `shared/firebaseConfig.ts` dosyasını açın
2. Firebase Console'dan kopyaladığınız config bilgilerini yapıştırın:

```typescript
const firebaseConfig = {
  apiKey: "BURAYA_YAPIŞTIR",
  authDomain: "BURAYA_YAPIŞTIR",
  projectId: "BURAYA_YAPIŞTIR",
  storageBucket: "BURAYA_YAPIŞTIR",
  messagingSenderId: "BURAYA_YAPIŞTIR",
  appId: "BURAYA_YAPIŞTIR"
};
```

3. Dosyayı kaydedin

## 📱 Adım 3: Mobil Uygulamayı Başlatma (5 dakika)

Terminal/Command Prompt açın:

```bash
# Mobil app klasörüne gidin
cd mobile-app

# Bağımlılıkları yükleyin (ilk seferinde 2-3 dakika sürebilir)
npm install

# Uygulamayı başlatın
npm start
```

QR kod görünecek. Expo Go uygulaması ile telefonunuzdan okuyun veya:
- iOS için: `i` tuşuna basın
- Android için: `a` tuşuna basın
- Web için: `w` tuşuna basın

## 💻 Adım 4: Admin Panelini Başlatma (2 dakika)

**Yeni bir terminal penceresi açın:**

```bash
# Admin panel klasörüne gidin
cd admin-panel

# Bağımlılıkları yükleyin
npm install

# Dev sunucusunu başlatın
npm run dev
```

Tarayıcınızda otomatik olarak açılacak veya şu adresi kullanın:
http://localhost:5173

## 🎯 Adım 5: İlk Kullanıcıyı Oluşturma (2 dakika)

1. **Mobil uygulamada:**
   - "Kayıt Ol" butonuna tıklayın
   - E-posta ve şifre girin
   - Grup seçin (PPL veya ATPL)
   - Dönem seçin
   - "Kayıt Ol" → Derslerinizi seçin → Kaydet

2. **Admin panelde:**
   - Aynı e-posta ve şifre ile giriş yapın
   - Kullanıcıları görüntüleyin
   - Sınav planlayın

## 🎉 Tebrikler!

Uygulamanız çalışıyor! Şimdi neler yapabilirsiniz:

### Mobil Uygulamada:
- ✅ Kullanıcı kaydı yapma
- ✅ Ders seçimi
- ✅ Profil görüntüleme

### Admin Panelde:
- ✅ Kullanıcı listesini görüntüleme
- ✅ Excel'e aktarma
- ✅ Sınav planlama
- ✅ Takvim yönetimi

## 🚀 Sonraki Adımlar

1. **Güvenlik kurallarını güncelleyin:**
   - `FIREBASE_SETUP.md` dosyasındaki Security Rules bölümünü okuyun
   - Production'a geçmeden önce mutlaka uygulayın

2. **Admin kullanıcı oluşturun:**
   - Firebase Console → Firestore → `admins` collection oluşturun
   - Kullanıcı UID'nizi document ID olarak ekleyin
   - `isAdmin: true` field'ı ekleyin

3. **Özelleştirin:**
   - Renkleri değiştirin
   - Logo ekleyin
   - Ek özellikler geliştirin

## ❓ Sorun mu yaşıyorsunuz?

### Mobil uygulama açılmıyor
```bash
# Cache'i temizle ve tekrar dene
npm start -- --clear
```

### "Cannot connect to Metro" hatası
```bash
# Node modules'ı sil ve tekrar yükle
rm -rf node_modules
npm install
npm start
```

### Firebase bağlantı hatası
- `firebaseConfig.ts` dosyasını kontrol edin
- Bilgileri doğru kopyaladığınızdan emin olun
- Firebase Console'da projenin aktif olduğunu kontrol edin

### Admin panel açılmıyor
```bash
# Port çakışması varsa
npm run dev -- --port 5174
```

## 📚 Daha Fazla Bilgi

- Tam kurulum: `README.md`
- Firebase detayları: `FIREBASE_SETUP.md`
- Deployment: `README.md` içindeki "App Store & Play Store'a Yükleme" bölümü

## 💡 İpuçları

1. **Geliştirme sırasında:**
   - Her iki terminali açık tutun (mobil + admin)
   - Değişiklikler otomatik yansır (hot reload)

2. **Test için:**
   - Birden fazla kullanıcı oluşturun
   - Farklı grup ve dönemler deneyin
   - Excel export'u test edin

3. **Production'a geçerken:**
   - Firestore security rules'u güncelleyin
   - Environment variables kullanın
   - Analytics ekleyin

## 🎯 Başarıyla Çalıştığını Nasıl Anlarım?

- [x] Mobil uygulama açıldı ve kayıt olabiliyorum
- [x] Ders seçimi yapabiliyorum
- [x] Admin panele giriş yapabiliyorum
- [x] Kullanıcı listesini görebiliyorum
- [x] Excel export çalışıyor
- [x] Sınav ekleyebiliyorum

Hepsi ✅ ise harika! Projeniz hazır! 🎊