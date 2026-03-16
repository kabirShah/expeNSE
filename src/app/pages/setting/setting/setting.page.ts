import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { BiometricService } from 'src/app/services/biometric.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  // Existing settings
  isDarkMode = false;
  notificationsEnabled: boolean = true;
  selectedTheme: string = 'light';

  // Biometric setting
  biometricEnabled = false;

  constructor(
    private router: Router,
    private biometricService: BiometricService,
    private alertCtrl: AlertController,
    private uiToast: UiToastService,
    private authService: AuthService
  ) {
    this.isDarkMode = localStorage.getItem('dark-mode') === 'true';
  }

  ngOnInit() {
    this.biometricEnabled = this.biometricService.isBiometricEnabled();
  }

  /* =========================
   * BIOMETRIC TOGGLE
   * ========================= */
  async onToggleBiometric(event: any) {
    const enable = event.detail.checked;

    if (enable) {
      const available = await this.biometricService.isBiometricAvailable();

      if (!available) {
        event.target.checked = false;
        this.biometricEnabled = false;
        this.showToast('Biometric authentication is not supported on this device.');
        return;
      }

      const verified = await this.biometricService.verifyIdentity();

      if (!verified) {
        event.target.checked = false;
        this.biometricEnabled = false;
        this.showToast('Biometric verification failed.');
        return;
      }

      this.biometricService.enableBiometric();
      this.biometricEnabled = true;
      this.showToast('Biometric login enabled');
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Disable Biometric Login?',
        message: 'You will need to use email and password to sign in next time.',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Disable',
            handler: () => {
              this.biometricService.disableBiometric();
              this.biometricEnabled = false;
              this.showToast('Biometric login disabled');
            }
          }
        ]
      });

      await alert.present();
    }
  }

  /* =========================
   * EXISTING ACTIONS
   * ========================= */
  updateProfile() {
    this.router.navigate(['profile']);
  }

  manageAccount() {
    console.log('Manage Account clicked');
  }

  viewPrivacyPolicy() {
    console.log('View Privacy Policy clicked');
  }

  viewTerms() {
    console.log('View Terms of Service clicked');
  }
  /* ============================================================
   * LOGOUT (CLEAN & CENTRALIZED)
   * ============================================================ */
  async logout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
  }

  toggleDarkMode(event: any) {
    const enabled = event.detail.checked;
    document.body.classList.toggle('dark-theme', enabled);
    localStorage.setItem('dark-mode', String(enabled));
  }
  

  /* =========================
   * TOAST
   * ========================= */
  private async showToast(message: string) {
    await this.uiToast.show(message, 'primary');
  }
}
