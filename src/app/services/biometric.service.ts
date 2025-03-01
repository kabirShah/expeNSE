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
  
  verifyIdentity() {
    NativeBiometric.isAvailable().then((isAvailable) => {
      if (isAvailable) {
        NativeBiometric.verifyIdentity({
          reason: 'For easy log in',
          title: 'Log in',
          subtitle: 'Authenticate',
          description: 'Please authenticate to proceed',
          maxAttempts: 2,
          useFallback:true,
        }).then((result) => {
          alert("Biometric authentication successful");
          this.router.navigateByUrl('/home');
          console.log(result);
        }).catch((error) => {
          console.error('Error verifying identity:', error);
        });
      } else {
        alert('Biometric authentication is not available on this device.');
      }
    }).catch((e) => {
      console.error(e);
      alert('Authentication failed');
    });
  }

}
