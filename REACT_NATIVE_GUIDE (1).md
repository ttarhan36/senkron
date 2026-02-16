# React Native ile Mobil Uygulamaya Dönüştürme

## Özellikler
✅ Native iOS ve Android app
✅ App Store / Play Store'da yayınlanabilir
✅ Native API'lere tam erişim
✅ Kamera, GPS, bildirimler

## ⚠️ Önemli Not
React web kodunuzu React Native'e dönüştürmek **büyük bir yeniden yazma** gerektirir çünkü:
- HTML/CSS yerine React Native bileşenleri kullanılır
- `<div>` → `<View>`
- `<span>` → `<Text>`
- Tailwind CSS çalışmaz (StyleSheet kullanılır)

## 1. Yeni React Native Projesi

```powershell
npx react-native init SenkronV2Mobile
```

## 2. UI Kütüphanesi Seçin

**React Native Paper** (Material Design):
```powershell
npm install react-native-paper react-native-safe-area-context
```

**NativeBase**:
```powershell
npm install native-base react-native-svg
```

## 3. Kod Yapısı Karşılaştırması

**Web (Şu anki):**
```jsx
<div className="flex h-screen bg-[#080c10]">
  <button className="px-4 py-2 bg-blue-500 text-white">
    Kaydet
  </button>
</div>
```

**React Native:**
```jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

<View style={styles.container}>
  <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Kaydet</Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080c10'
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6'
  },
  buttonText: {
    color: 'white'
  }
});
```

## 4. Navigasyon

```powershell
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

## 5. Supabase Entegrasyonu

```powershell
npm install @supabase/supabase-js
npm install react-native-url-polyfill
```

```typescript
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
```

## 6. Çalıştırma

**Android:**
```powershell
npx react-native run-android
```

**iOS (Mac gerekli):**
```powershell
npx react-native run-ios
```

## 7. Build ve Yayınlama

**Android APK:**
```powershell
cd android
./gradlew assembleRelease
# Çıktı: android/app/build/outputs/apk/release/app-release.apk
```

**iOS (Xcode gerekli):**
```powershell
cd ios
pod install
# Xcode'da Archive yapın
```

## 8. Tahmini Süre

React web → React Native dönüşümü:
- **Basit UI:** 2-4 hafta
- **Orta karmaşıklık:** 1-2 ay
- **Karmaşık (sizinki):** 2-3 ay

## Alternatif: Capacitor

Mevcut web kodunuzu minimal değişiklikle mobil app'e çevirir:

```powershell
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
npm run build
npx cap sync
npx cap open android
```

Web kodunuz %95 aynı kalır! ✅

## Tavsiye

Sizin için **en iyi seçenek:**
1. **Electron** - Hızlı masaüstü app (1 hafta)
2. **PWA** - Web + Mobil kullanım (2-3 gün)
3. **Tauri** - Hafif masaüstü (1-2 hafta)
4. **Capacitor** - Mobil app, kodda minimal değişiklik (2-3 hafta)
5. **React Native** - Tam native (2-3 ay, büyük yeniden yazma)
