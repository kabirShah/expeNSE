import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  async verifyIdentity(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        throw new Error('Biometric authentication is not available on this device.');
      }

      await NativeBiometric.verifyIdentity({
        reason: 'For easy login',
        title: 'Paisa',
        subtitle: 'Authenticate',
        description: 'Please authenticate to proceed',
        maxAttempts: 2,
        useFallback: false, // better avoid PIN fallback if you want only biometric
      });

      console.log('✅ Biometric authentication successful');
      return true;
    } catch (error: any) {
      console.error('❌ Biometric auth error:', error.message || error);
      return false;
    }
  }
}
