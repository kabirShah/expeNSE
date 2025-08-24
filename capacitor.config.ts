import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'expenseManagerApp',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'REPLACE_WITH_WEB_CLIENT_ID',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
