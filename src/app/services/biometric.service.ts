import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  /**
   * Check whether biometric authentication
   * is supported and available on this device
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable === true;
    } catch (error) {
      console.warn('Biometric availability check failed', error);
      return false;
    }
  }

  /**
   * Perform biometric authentication
   * Used for biometric login (after consent)
   */
  async verifyIdentity(): Promise<boolean> {
    try {
      const availability = await NativeBiometric.isAvailable();

      if (!availability.isAvailable) {
        console.warn('Biometric not available on this device');
        return false;
      }

      await NativeBiometric.verifyIdentity({
        reason: 'Authenticate to continue',
        title: 'Pocket Money',
        subtitle: 'Secure Login',
        description: 'Confirm your identity to proceed',
        maxAttempts: 2,
        useFallback: true // allow device PIN if needed (recommended)
      });

      console.log('✅ Biometric authentication successful');
      return true;

    } catch (error: any) {
      console.error('❌ Biometric authentication failed', error);
      return false;
    }
  }

  /**
   * Helper: check if user has enabled biometrics
   * (stored after consent modal)
   */
  isBiometricEnabled(): boolean {
    return localStorage.getItem('biometric_enabled') === 'true';
  }
  
  enableBiometric(): void {
    localStorage.setItem('biometric_enabled', 'true');
  }

  disableBiometric(): void {
    localStorage.setItem('biometric_enabled', 'false');
  }

  /**
   * Helper: clear biometric flags on logout
   */
  clearBiometricFlags() {
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_prompt_shown');
  }
}
