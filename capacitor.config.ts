import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novo.app',
  appName: 'MSL',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
  ,
  android: {
    webContentsDebuggingEnabled: true
  },
 
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    Keyboard: {
      resize: "none"
    },
    Camera: {
      webUseInput: true // ✅ Permet d'utiliser `<input type="file">` pour la caméra sur le web
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
      overlaysWebView: false, // Important pour éviter que le header chevauche la barre d'état
    }
  },
};
export default config;
