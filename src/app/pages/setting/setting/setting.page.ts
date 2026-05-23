import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { BiometricService } from 'src/app/services/biometric.service';
import { SmartDetectionService } from 'src/app/services/smart-detection.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

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
  integrationVisibilityEnabled = false;
  readonly integrationPartners = ['HDFC', 'ICICI', 'Kotak', 'PhonePe', 'Google Pay'];

  constructor(
    private router: Router,
    private biometricService: BiometricService,
    private alertCtrl: AlertController,
    private uiToast: UiToastService,
    private authService: AuthService,
    private userPreferences: UserPreferencesService,
    private smartDetectionService: SmartDetectionService
  ) {
    this.isDarkMode = localStorage.getItem('dark-mode') === 'true';
  }

  ngOnInit() {
    this.biometricEnabled = this.biometricService.isBiometricEnabled();
    this.integrationVisibilityEnabled = this.userPreferences.isIntegrationVisibilityEnabled();
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

  async onToggleIntegrationVisibility(event: any) {
    const enable = event.detail.checked;

    if (enable) {
      const alert = await this.alertCtrl.create({
        header: 'Enable smart expense tracking',
        message: 'Allow access to notifications to automatically detect your expenses from supported bank, UPI, and wallet alerts.',
        buttons: [
          {
            text: 'Not Now',
            role: 'cancel',
            handler: () => {
              event.target.checked = false;
              this.integrationVisibilityEnabled = false;
            }
          },
          {
            text: 'Enable',
            handler: async () => {
              await this.smartDetectionService.enableSmartTracking();
              this.integrationVisibilityEnabled = true;
              this.userPreferences.savePreferences({
                integration_visibility_enabled: true,
                integration_visibility_consent_at: new Date().toISOString()
              }).subscribe();
              this.showToast('Smart expense tracking enabled');
            }
          }
        ]
      });

      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Disable smart expense tracking?',
      message: 'The app will stop adding newly detected bank and UPI transactions until you enable this again.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Disable',
          handler: () => {
            this.integrationVisibilityEnabled = false;
            this.userPreferences.savePreferences({
              integration_visibility_enabled: false
            }).subscribe();
            localStorage.removeItem('smart_tracking_enabled');
            this.showToast('Smart expense tracking disabled');
          }
        }
      ]
    });

    await alert.present();
  }

  openIntegrationVisibility() {
    this.router.navigate(['integration']);
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
