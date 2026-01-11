import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular';

import { AuthService } from 'src/app/services/auth.service';
import { BiometricService } from 'src/app/services/biometric.service';

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
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private cd: ChangeDetectorRef
  ) {
    this.initForm();
  }

  /* =============================
     LIFECYCLE
     ============================= */
  ngOnInit(): void {
    this.checkBiometricLogin();
  }

  /* =============================
     FORM INIT
     ============================= */
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

  /* =============================
     BIOMETRIC AUTO LOGIN
     ============================= */
 private async checkBiometricLogin(): Promise<void> {
  const biometricEnabled =
    localStorage.getItem('biometric_enabled') === 'true';

  const token =
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token');

  const loginTime = localStorage.getItem('loginTime');

  // Start biometric check
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


  /* =============================
     EMAIL / PASSWORD LOGIN
     ============================= */
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

    const loader = await this.loadingCtrl.create({
      message: 'Signing in...',
      spinner: 'crescent'
    });
    await loader.present();

    this.authService.loginLaravel(email, password).subscribe({
      next: async (res: any) => {
        const now = Date.now().toString();

        // 🔐 ALWAYS store loginTime (CRITICAL FIX)
        localStorage.setItem('loginTime', now);
        localStorage.setItem('token_timestamp', now);

        if (rememberMe) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('rememberMe', '7d');
        } else {
          sessionStorage.setItem('auth_token', res.token);
          localStorage.setItem('rememberMe', '1d');
        }

        localStorage.setItem('user', JSON.stringify(res.user));

        await loader.dismiss();
        this.isLoading = false;

        this.showToast('Login successful');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: async (err) => {
        await loader.dismiss();
        this.isLoading = false;

        if (!err.status || err.status >= 500) {
          this.showToast('Server not reachable. Try again later.');
        } else {
          this.showToast(err.error?.message || 'Invalid credentials.');
        }
      }
    });
  }

  /* =============================
     NAVIGATION
     ============================= */
  goToRegister(): void {
    this.cd.detectChanges();
    this.router.navigateByUrl('/register');
  }

  forgotPassword(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  /* =============================
     UI HELPERS
     ============================= */
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
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
