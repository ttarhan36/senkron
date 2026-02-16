# Electron ile Masaüstü Uygulamaya Dönüştürme

## 1. Gerekli Paketleri Kurun

```powershell
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

## 2. package.json Güncelleyin

```json
{
  "name": "senkron-v2",
  "version": "2.5.0",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.senkron.app",
    "productName": "Senkron V2",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/icon.png"
    }
  }
}
```

## 3. Electron Main Process Oluşturun

`electron/main.js` dosyası:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Senkron V2 - Bulut Modu',
    backgroundColor: '#080c10'
  });

  // Development mode
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

## 4. Electron Preload (Opsiyonel)

`electron/preload.js` - Güvenlik için:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // API'ler buraya
  platform: process.platform,
  version: process.versions.electron
});
```

## 5. Çalıştırma

**Development:**
```powershell
npm run electron:dev
```

**Production Build:**
```powershell
npm run electron:build
```

Çıktı: `dist-electron/` klasöründe `.exe`, `.dmg`, `.AppImage` dosyaları

## 6. İkon Dosyaları

- Windows: `public/icon.ico` (256x256)
- Mac: `public/icon.icns` (512x512)
- Linux: `public/icon.png` (512x512)

Online dönüştürücü: https://cloudconvert.com/png-to-ico

## 7. Dağıtım

**Auto-Update için:**
```powershell
npm install --save-dev electron-updater
```

**Kod imzalama (Windows):**
```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "YOUR_PASSWORD"
}
```

## 8. Sonuç

✅ Windows: `Senkron-V2-Setup-2.5.0.exe` (Installer)
✅ Windows: `Senkron-V2-2.5.0-Portable.exe` (Portable)
✅ Mac: `Senkron-V2-2.5.0.dmg`
✅ Linux: `Senkron-V2-2.5.0.AppImage`
