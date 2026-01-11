import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BiometricService } from 'src/app/services/biometric.service';

@Component({
  selector: 'app-biometric-consent',
  templateUrl: './biometric-consent.component.html',
  styleUrls: ['./biometric-consent.component.scss'],
})
export class BiometricConsentComponent {

  biometricAvailable = false;

  constructor(
    private modalCtrl: ModalController,
    private biometricService: BiometricService
  ) {}

  async ionViewWillEnter() {
    // Check if device supports biometric
    this.biometricAvailable = await this.biometricService.isBiometricAvailable();
  }

  enableBiometric() {
    localStorage.setItem('biometric_enabled', 'true');
    localStorage.setItem('biometric_prompt_shown', 'true');
    this.close();
  }

  skipBiometric() {
    localStorage.setItem('biometric_enabled', 'false');
    localStorage.setItem('biometric_prompt_shown', 'true');
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
