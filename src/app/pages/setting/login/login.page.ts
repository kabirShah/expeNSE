import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';
import { AuthService } from 'src/app/services/auth.service';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  logForm!: FormGroup;
  passwordType: string = 'password';
  isLoading: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private biometricService: BiometricService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private http: HttpClient
  ) {
    
    this.logForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: ['']
    });
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

async loginWithBiometric() {
  await Haptics.impact({ style: ImpactStyle.Light });
  try {
    const isAuthenticated = await this.biometricService.verifyIdentity();

    if (isAuthenticated) {
      // ✅ Check if there's a valid session
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const user = localStorage.getItem('user');

      if (token && user) {
        // Already stored from a previous login → refresh loginTime
        const now = new Date().getTime();
        localStorage.setItem('loginTime', now.toString());
        // Use consistent navigation method
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.showErrorAlert('No saved session. Please login manually first.');
      }
    } else {
      this.showErrorAlert('Authentication failed.');
    }
  } catch (error) {
    this.showErrorAlert('Biometric authentication error.');
  }
}


togglePasswordVisibility() {
  this.passwordType =
    this.passwordType === 'password' ? 'text' : 'password';
}


  async login() {
    if (!navigator.onLine) {
      this.showToast('No internet connection. Please connect and try again.');
      return;
    }

    if (this.logForm.valid) {
      const email = this.logForm.value.email!;
      const password = this.logForm.value.password!;
      const remember = this.logForm.value.rememberMe;
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Logging in...',
        spinner: 'crescent',
        duration: 5000,
      });
      await loading.present();

      try {
        this.authService?.loginLaravel(email, password)?.subscribe({
          next: async (res: any) => {
            const now = new Date().getTime();
            this.isLoading = false;
            await loading.dismiss();

            // ✅ Store token based on Remember Me choice
            if (remember) {
              localStorage.setItem('auth_token', res.token);
              localStorage.setItem('rememberMe', '7d');
              localStorage.setItem('loginTime', now.toString());
              localStorage.setItem('user', JSON.stringify(res.user));
            } else {
              sessionStorage.setItem('auth_token', res.token);
              localStorage.setItem('rememberMe', '1d');
              localStorage.setItem('loginTime', now.toString());
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            this.showToast('Login successful!');
            this.router.navigateByUrl('/home', { replaceUrl: true });
          },
          error: async (err) => {
            this.isLoading = false;
            await loading.dismiss();
            console.error('❌ Laravel Login Error:', err);

            // Server unreachable or network error
            if (!err.status || err.status === 0 || err.status >= 500) {
              this.showToast('Application server is not reachable. Please try again later.');
            } else {
              this.showToast(err.error?.message || 'Invalid credentials.');
            }
          }
        });
      } catch (error) {
        this.isLoading = false;
        await loading.dismiss();
        console.error('❌ Unexpected Error:', error);
        this.showToast('Something went wrong. Please try again.');
      }
    } else {
      this.showToast('Please fill out the form correctly.');
    }
  }




  goToRegister() {
    this.cd.detectChanges();
    Object.values(this.logForm.controls).forEach(control => control.markAsTouched());
    this.router.navigateByUrl('/register');
  }


  forgotPassword() {
    this.router.navigateByUrl('/forgot-password', { replaceUrl: true });
  }


  async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Login Failed',
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}