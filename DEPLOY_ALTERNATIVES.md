# Ücretsiz Deploy Alternatifleri

## 1. Netlify (Vercel Benzeri) ⭐⭐⭐⭐⭐

**Özellikler:**
- ✅ 100 GB bandwidth/ay
- ✅ Otomatik HTTPS
- ✅ GitHub/GitLab entegrasyonu
- ✅ Forms, Functions, Identity (ekstra)

**Deploy:**
```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Dashboard:** https://app.netlify.com

## 2. Cloudflare Pages ⭐⭐⭐⭐⭐

**Özellikler:**
- ✅ SINIRSIZ bandwidth! 🚀
- ✅ En hızlı CDN
- ✅ GitHub entegrasyonu
- ✅ Workers (serverless functions)

**Deploy:**
1. https://dash.cloudflare.com → Pages
2. "Create a project" → GitHub bağla
3. Build settings:
   - Build command: `npm run build`
   - Output: `dist`

**Avantajları:**
- Sınırsız bandwidth (en iyi!)
- DDoS koruması
- WAF (Web Application Firewall)

## 3. Firebase Hosting ⭐⭐⭐⭐

**Özellikler:**
- ✅ 10 GB storage
- ✅ 360 MB/day bandwidth (küçük)
- ✅ Google altyapısı
- ✅ Realtime Database + Auth

**Deploy:**
```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 4. GitHub Pages ⭐⭐⭐

**Özellikler:**
- ✅ Tamamen ücretsiz
- ✅ username.github.io
- ❌ Statik dosyalar (API yok)

**Deploy:**
```powershell
npm install gh-pages -D
```

**package.json:**
```json
{
  "homepage": "https://ttarhan36.github.io/senkronv2",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

```powershell
npm run deploy
```

## 5. Render ⭐⭐⭐⭐

**Özellikler:**
- ✅ 100 GB bandwidth
- ✅ Backend desteği (Node.js, Python)
- ✅ PostgreSQL database (ücretsiz)
- ✅ Auto sleep (15 dakika inaktif sonra)

**Deploy:**
1. https://render.com → GitHub bağla
2. "New Static Site"
3. Build: `npm run build`
4. Publish: `dist`

## 6. Railway ⭐⭐⭐⭐

**Özellikler:**
- ✅ $5 ücretsiz kredi/ay
- ✅ Full-stack (frontend + backend + database)
- ✅ Docker desteği
- ✅ Kolay deployment

## Karşılaştırma Tablosu

| Platform | Bandwidth | Build Time | Projeler | Hız | Kolay | Önerilen |
|----------|-----------|------------|----------|-----|-------|----------|
| **Vercel** | 100 GB | 6000 dk | ∞ | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ |
| **Netlify** | 100 GB | 300 dk | ∞ | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ |
| **Cloudflare** | ∞ | ∞ | ∞ | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ |
| **Firebase** | 10 GB | - | ∞ | ⚡⚡⚡⚡ | ⭐⭐⭐ | ⚠️ |
| **GitHub Pages** | 100 GB | - | ∞ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⚠️ |
| **Render** | 100 GB | - | ∞ | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ |
| **Railway** | ~5 GB | - | ∞ | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ⚠️ |

## Tavsiye

**En İyi 3:**
1. **Vercel** - En kolay, hızlı, popüler ✅
2. **Cloudflare Pages** - Sınırsız bandwidth ✅
3. **Netlify** - Ekstra özellikler (forms, functions) ✅

## Domain + Hosting Paketler (Ücretli)

Eğer özel domain + hosting isterseniz:

### Türkiye Hosting

**1. Natro.com**
- Domain (.com.tr): 89 TL/yıl
- Hosting (Bayi): 200 TL/yıl
- **Toplam:** 289 TL/yıl

**2. HostingTR**
- Domain (.com): 150 TL/yıl
- SSD Hosting: 180 TL/yıl
- **Toplam:** 330 TL/yıl

**3. TurkticareNet**
- Domain + Hosting: 250 TL/yıl

### Yurtdışı (Daha Ucuz!)

**1. NameCheap**
- Domain (.com): $8/yıl (~280 TL)
- Hosting: ÜCRETSİZ (Vercel/Netlify)
- **Toplam:** 280 TL/yıl

**2. Porkbun**
- Domain (.com): $7/yıl (~245 TL)
- **Toplam:** 245 TL/yıl

## Önerilen Çözüm

**ÜCRETSİZ:**
```
Domain: senkronv2.vercel.app (ücretsiz)
Hosting: Vercel (ücretsiz)
SSL: Otomatik (ücretsiz)
CDN: Global (ücretsiz)

TOPLAM: 0 TL ✅
```

**ÖZEL DOMAIN:**
```
Domain: senkron.com (NameCheap, $8/yıl)
Hosting: Vercel (ücretsiz)
SSL: Otomatik (ücretsiz)

TOPLAM: ~280 TL/yıl
```

## 🚀 Hemen Deploy!

**En Hızlı Yol (5 Dakika):**

1. https://vercel.com → GitHub ile giriş
2. "Add New..." → "Project"
3. Repo seç: ttarhan36/turnuva
4. "Deploy" 🎉

**Sonuç:** https://senkronv2.vercel.app (veya benzeri)

Domain sonra ekleyebilirsiniz!

## 📞 Hangisini Seçmeliyim?

**İlk defa deploy:** Vercel (en kolay)
**En hızlı CDN:** Cloudflare Pages
**En fazla bandwidth:** Cloudflare (sınırsız)
**Full-stack:** Render veya Railway
**Sadece frontend:** Vercel, Netlify, Cloudflare

Hepsi ücretsiz, hepsi HTTPS, hepsi hızlı! 🎯
