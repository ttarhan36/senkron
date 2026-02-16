# GitHub → Vercel Otomatik Deploy

## Adımlar (5 Dakika)

### 1. Kodu GitHub'a Push

```powershell
cd C:\Users\ttrob\Documents\verdent-projects\senkronV2

git add .
git commit -m "feat: production ready for deployment"
git push origin main
```

### 2. Vercel'e Bağla

1. **https://vercel.com** → "Sign Up" (GitHub ile)
2. Authorize Vercel → GitHub erişimi ver
3. **"Add New..."** → **"Project"**
4. Repo seçin: **ttarhan36/turnuva**
5. **"Import"** tıklayın

### 3. Ayarlar

**Framework Preset:** Vite ✅ (otomatik algılanır)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables** (şimdilik gerek yok, sonra eklersiniz):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

### 4. Deploy

**"Deploy"** butonuna tıklayın!

⏱️ **2-3 dakika bekleyin...**

✅ **Başarılı!** 
```
🎉 https://turnuva.vercel.app
```

veya

```
🎉 https://senkronv2-[random].vercel.app
```

### 5. Domain Değiştir (Opsiyonel)

Settings → Domains → Add Domain:
```
senkronv2.vercel.app
```

## 🔄 Artık Otomatik!

Her `git push` → Otomatik deploy! 🚀

```powershell
# Değişiklik yap
git add .
git commit -m "update: yeni özellik"
git push

# 2 dakika sonra → Canlıda! ✅
```

## 📱 Preview Deployments

Her branch için otomatik preview:

```
main → https://senkronv2.vercel.app (production)
dev → https://senkronv2-git-dev.vercel.app (preview)
```

## 🔍 Deployment Logs

Vercel Dashboard → Deployments → Log'lara bakın

Build hatası varsa detaylı gösterir.

## ⚠️ Sık Karşılaşılan Hatalar

### 1. Build Fails - TypeScript Error

**Çözüm:** `tsconfig.json` kontrol edin veya:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### 2. Environment Variables Missing

.env değişkenlerini Vercel'e ekleyin:
Dashboard → Settings → Environment Variables

### 3. 404 on Refresh

`vercel.json` rewrites ekleyin (✅ zaten ekledik)

## 🎯 Domain Almak İster misiniz?

**Türk Sağlayıcılar:**
- **Natro.com** → .com.tr: 89 TL/yıl
- **DomainRacer** → .com: $10/yıl
- **NameCheap** → .com: $8/yıl

**Önerilen Domainler:**
- `senkron.app` 
- `senkronv2.com`
- `okulpanel.com`
- `akillipanel.com`

Domain aldıktan sonra Vercel'de "Add Domain" ile bağlayın.

## 🚀 Hemen Başlayın!

1. https://vercel.com → GitHub ile giriş
2. "Add New..." → "Project"
3. Repo seç → "Import"
4. **Deploy!** 🎉

Deployment link'ini buraya yapıştırın! 🔗
