import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { NativeBiometric } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  constructor (private router:Router){

  }
  
  async verifyIdentity(): Promise<boolean> {
    try {
      const isAvailable = await NativeBiometric.isAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available on this device.');
      }

      await NativeBiometric.verifyIdentity({
        reason: 'For easy login',
        title: 'Paisa',
        subtitle: 'Authenticate',
        description: 'Please authenticate to proceed',
        maxAttempts: 2,
        useFallback: true,
      });

      console.log('Biometric authentication successful:');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('Error verifying identity:', errorMessage);
      throw new Error(errorMessage);
    }
  }

}
