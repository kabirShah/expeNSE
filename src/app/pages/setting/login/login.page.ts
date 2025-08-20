import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';
import { AuthService } from 'src/app/services/auth.service';
import { setPersistence, browserLocalPersistence } from '@angular/fire/auth';

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
    private biometricService: BiometricService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    private auth : Auth,   
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
    try {
      const isAuthenticated = await this.biometricService.verifyIdentity();

      if (isAuthenticated) {
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigateByUrl('/home');
      } else {
        this.showErrorAlert('Authentication failed.');
      }
    } catch (error) {
      this.showErrorAlert('Biometric authentication error.');
    }
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
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
            this.navCtrl.navigateForward('/home');
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

  loginWithFacebook() {
    this.navCtrl.navigateForward('/home');
    console.log('Logging in with Facebook');
    // Integrate Facebook login API logic here
  }

  async signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(this.auth, provider);
    if (result) {
      console.log('Google Sign-In Result:', result.user);

      const toast = await this.toastCtrl.create({
        message: `Welcome ${result.user.displayName}`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();

      // Save user info to localStorage
      localStorage.setItem('googleuser', JSON.stringify(result.user));

      // ✅ navigate to home
      this.router.navigate(['/home']);
    }
  } catch (error) {
    console.error('Google Login Error:', error);
    const toast = await this.toastCtrl.create({
      message: 'Google Sign-In failed. Please try again.',
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}

  register() {
    this.router.navigateByUrl('/register', { replaceUrl: true });

    // this.navCtrl.navigateForward('/register');
  }

  forgotPassword() {
    this.navCtrl.navigateForward('/forgot-password');
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