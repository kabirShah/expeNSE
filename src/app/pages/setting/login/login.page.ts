import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  logForm!:FormGroup;
  passwordType: string = 'password';
  isLoading: boolean = false;

  constructor(
    private biometricService: BiometricService,
    private fb:FormBuilder, 
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    private auth:Auth,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) {
    this.logForm = this.fb.group({
      email:['', [Validators.required, Validators.email]],
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
  async loginWithBiometric(){
    try {
      const isAuthenticated = await this.biometricService.verifyIdentity();

      if (isAuthenticated) {
        localStorage.setItem('isLoggedIn', 'true'); // Store login status
        this.router.navigateByUrl('/home'); // Navigate to Home Page
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
    if (this.logForm.valid) {
      const { email, password } = this.logForm.value;
      this.isLoading = true; // ✅ Show loading state
  
      // ✅ Show Ionic Loading Spinner
      const loading = await this.loadingController.create({
        message: 'Logging in...',
        spinner: 'crescent',
        duration: 5000, // Auto-hide after 5s if request is stuck
      });
      await loading.present();
  
      try { 
        this.authService.loginLaravel(email, password).subscribe({
          next: async (res: any) => {
            this.isLoading = false;
            await loading.dismiss(); // ✅ Hide loading spinner
            localStorage.setItem('auth_token', res.token);
            this.showToast('Login successful!');
            this.navCtrl.navigateForward('/home');
          },
          error: async (err) => {
            this.isLoading = false;
            await loading.dismiss(); // ✅ Hide loading spinner
            console.error('❌ Laravel Login Error:', err);
            this.showToast(err.error?.message || 'Invalid credentials.');
          }
        });
      } catch (error) {
        this.isLoading = false;
        await loading.dismiss(); // ✅ Hide loading spinner
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

  loginWithGoogle() {
    console.log('Logging in with Google');
    // Integrate Google login API logic here
  }
  register(){
    this.navCtrl.navigateForward('/register');
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
