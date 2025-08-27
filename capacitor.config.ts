import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.pocketexpense.app',
  appName: 'pocket-money',
  webDir: 'www',
  plugins: {
     GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: "154523177520-opt7hor5f5m17ritj5nrpsehutv9h9ov.apps.googleusercontent.com", // ✅ paste here
      forceCodeForRefreshToken: false
    },
//     49:b5:c1:91:eb:ae:3d:3f:5d:35:4b:6c:b2:72:2d:14:3c:5e:91:f9
//     49:B5:C1:91:EB:AE:3D:3F:5D:35:4B:6C:B2:72:2D:14:3C:5E:91:F9
// SHA-1

// d7:a6:ec:42:d6:a6:1b:fe:e8:76:9c:fb:7f:82:d7:52:95:2b:57:1c:91:cd:e5:d1:b5:7f:09:e7:ca:e2:68:a9
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
