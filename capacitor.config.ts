import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'expenseManagerApp',
  webDir: 'www',
  plugins: {
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
