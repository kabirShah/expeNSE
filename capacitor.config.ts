import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myapp.app',
  appName: 'pocket-money',
  webDir: 'www',
  plugins: {
     GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '666026809070-0vkihl6e1kkrlnn588hak0d2bbkdb4nj.apps.googleusercontent.com',
      forceCodeForRefreshToken: false
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      iosContentMode: "ScaleAspectFill",
      showSpinner: false
    }
  }
};

export default config;
