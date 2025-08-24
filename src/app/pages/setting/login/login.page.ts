import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, FacebookAuthProvider } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  logForm!:FormGroup;
  passwordType: string = 'password';

  constructor(
    private biometricService: BiometricService,
    private fb:FormBuilder, 
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    private auth:Auth,
    private toastCtrl: ToastController,
    private http: HttpClient
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
      const {email,password} = this.logForm.value;
      try{
        await signInWithEmailAndPassword(this.auth, email, password);
        this.showToast('Login successfully');
        this.navCtrl.navigateForward('/home');
      }catch (error){
        this.showToast("Error");
      }
      console.log("Login Form", this.logForm.value);
    }else{
      this.showToast('Please fill out the form correctly.');
      console.log("Invalid login form");
    }
  }

  async loginWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      try {
        await signInWithPopup(this.auth, provider);
      } catch (popupError) {
        await signInWithRedirect(this.auth, provider);
      }
      this.showToast('Facebook login successful');
      this.navCtrl.navigateForward('/home');
    } catch (error) {
      this.showToast('Facebook login failed');
    }
  }

  async loginWithGoogle() {
    try {
      let idToken: string | null = null;
      if (Capacitor.getPlatform() === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        idToken = credential?.idToken || null;
      } else {
        const user = await GoogleAuth.signIn();
        idToken = user.authentication.idToken;
      }

      if (!idToken) {
        throw new Error('Google ID token not found');
      }

      this.http.post('http://127.0.0.1:8000/api/google-login', { id_token: idToken })
        .subscribe({
          next: async (res: any) => {
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('loginTime', Date.now().toString());
            localStorage.setItem('rememberMe', '1d');
            const toast = await this.toastCtrl.create({
              message: `Welcome ${res.user.first_name || res.user.name}`,
              duration: 2000,
              position: 'top',
              color: 'success'
            });
            await toast.present();
            this.router.navigate(['/home']);
          },
          error: async () => {
            const toast = await this.toastCtrl.create({
              message: 'Google Sign-In failed at server. Try again.',
              duration: 2000,
              position: 'top',
              color: 'danger'
            });
            await toast.present();
          }
        });

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      const toast = await this.toastCtrl.create({
        message: 'Google Sign-In failed. Please try again.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
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
