import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { AuthService } from 'src/app/services/auth.service';
import { BiometricService } from 'src/app/services/biometric.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  logForm!: FormGroup;
  passwordType: 'password' | 'text' = 'password';
  isLoading = false;
  checkingBiometric = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private biometricService: BiometricService,
    private uiToast: UiToastService,
    private alertCtrl: AlertController,
    private cd: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkBiometricLogin();
  }

  private initForm(): void {
    this.logForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordType =
      this.passwordType === 'password' ? 'text' : 'password';
  }

  private async checkBiometricLogin(): Promise<void> {
    const biometricEnabled =
      localStorage.getItem('biometric_enabled') === 'true';

    const token = this.authService.getToken();
    const loginTime = this.authService.getLoginTime();

    this.checkingBiometric = biometricEnabled && !!token && !!loginTime;

    if (this.checkingBiometric) {
      const success = await this.biometricService.verifyIdentity();
      this.checkingBiometric = false;

      if (success) {
        localStorage.setItem('loginTime', Date.now().toString());
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    }
  }

  async login(): Promise<void> {
    if (!navigator.onLine) {
      this.showToast('No internet connection.');
      return;
    }

    if (this.logForm.invalid) {
      this.showToast('Please enter valid credentials.');
      return;
    }

    const { email, password, rememberMe } = this.logForm.value;
    this.isLoading = true;

    this.authService.loginLaravel(email, password).subscribe({
      next: async (res: any) => {
        this.authService.saveSession(res.token, res.user, rememberMe);
        this.isLoading = false;

        this.showToast('Login successful');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: async (err) => {
        this.isLoading = false;

        if (!err.status || err.status >= 500) {
          this.showToast('Server not reachable. Try again later.');
        } else {
          this.showToast(err.error?.message || 'Invalid credentials.');
        }
      }
    });
  }

  goToRegister(): void {
    this.cd.detectChanges();
    this.router.navigateByUrl('/register');
  }

  forgotPassword(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  get showPageLoader(): boolean {
    return this.checkingBiometric || this.isLoading;
  }

  get loaderText(): string {
    return this.checkingBiometric ? 'Authenticating...' : 'Signing you in...';
  }

  private async showToast(message: string): Promise<void> {
    await this.uiToast.show(message, 'primary');
  }

  async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Authentication Failed',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
