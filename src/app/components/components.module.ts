import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { BiometricConsentComponent } from './biometric-consent/biometric-consent.component';

@NgModule({
  declarations: [BiometricConsentComponent],
  imports: [CommonModule, IonicModule],
  exports: [BiometricConsentComponent],
})
export class ComponentsModule {}
