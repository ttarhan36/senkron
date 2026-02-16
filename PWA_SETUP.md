# PWA (Progressive Web App) Kurulumu

## Özellikler
✅ Ana ekrana eklenebilir
✅ Offline çalışma
✅ Push bildirimleri
✅ App gibi görünüm (tam ekran)
✅ iOS ve Android desteği

## 1. Vite PWA Plugin Kurun

```powershell
npm install vite-plugin-pwa -D
```

## 2. vite.config.ts Güncelleyin

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Senkron V2 - Akıllı Okul Yönetim Sistemi',
        short_name: 'Senkron V2',
        description: 'Bulut modu öğretmen ve öğrenci yönetim paneli',
        theme_color: '#0f172a',
        background_color: '#080c10',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

## 3. İkonlar Oluşturun

`public/` klasörüne:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico`

## 4. Meta Tags (index.html)

```html
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <meta name="theme-color" content="#0f172a" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Senkron V2" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
</head>
```

## 5. Build ve Deploy

```powershell
npm run build
```

Çıktı `dist/` klasörüne web sunucusuna yükleyin (HTTPS gerekli!)

## 6. Kullanım

**Chrome/Edge (Desktop):**
- Adres çubuğundaki "Install" ikonuna tıklayın

**iOS Safari:**
1. Paylaş butonuna tıklayın
2. "Ana Ekrana Ekle" seçin

**Android Chrome:**
1. Menü (⋮) → "Ana ekrana ekle"

## 7. Test

```powershell
npm run build
npm run preview
```

Chrome DevTools → Application → Manifest kontrol edin

## Avantajlar
- ✅ Platform bağımsız
- ✅ Kolay güncelleme
- ✅ App store gerektirmez
- ✅ Küçük boyut

## Sınırlamalar
- ❌ iOS'ta bazı API'ler kısıtlı
- ❌ Native özellikler kısıtlı
- ❌ Bluetooth, NFC sınırlı
