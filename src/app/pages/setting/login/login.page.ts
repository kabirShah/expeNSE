import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, FacebookAuthProvider } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { HttpClient } from '@angular/common/http';
import { Network } from '@capacitor/network';
import { environment } from '../../../../environments/environment';

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
  async showToast(message: string, color: 'success'|'warning'|'danger'|'primary'|'medium' = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
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
        this.showToast('Login successfully', 'success');
        this.navCtrl.navigateForward('/home');
      }catch (error){
        this.showToast("Error", 'danger');
      }
      console.log("Login Form", this.logForm.value);
    }else{
      this.showToast('Please fill out the form correctly.', 'warning');
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
      this.showToast('Facebook login successful', 'success');
      this.navCtrl.navigateForward('/home');
    } catch (error) {
      this.showToast('Facebook login failed', 'danger');
    }
  }

  private getApiBaseForPlatform(): string {
    // Use Android emulator host mapping for localhost
    if (Capacitor.getPlatform() === 'android' && environment.apiBase.startsWith('http://127.0.0.1')) {
      return environment.apiBase.replace('127.0.0.1', '10.0.2.2');
    }
    return environment.apiBase;
  }

  async loginWithGoogle() {
    try {
      const status = await Network.getStatus();
      const online = status.connected;

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

      const apiBase = this.getApiBaseForPlatform();

      if (online) {
        this.http.post(`${apiBase}/google-login`, { id_token: idToken })
          .subscribe({
            next: async (res: any) => {
              localStorage.setItem('auth_token', res.token);
              localStorage.setItem('user', JSON.stringify(res.user));
              localStorage.setItem('loginTime', Date.now().toString());
              localStorage.setItem('rememberMe', '1d');
              await this.showToast(`Welcome ${res.user.first_name || res.user.name}`, 'success');
              this.router.navigate(['/home']);
            },
            error: async () => {
              const cachedUser = localStorage.getItem('user');
              const cachedToken = localStorage.getItem('auth_token');
              if (cachedUser && cachedToken) {
                await this.showToast('Server unreachable. Continuing in offline mode.', 'warning');
                this.router.navigate(['/home']);
              } else {
                await this.showToast('Google Sign-In failed at server. Try again.', 'danger');
              }
            }
          });
      } else {
        const cachedUser = localStorage.getItem('user');
        const cachedToken = localStorage.getItem('auth_token');
        if (cachedUser && cachedToken) {
          await this.showToast('Offline detected. Resuming previous session.', 'warning');
          this.router.navigate(['/home']);
        } else {
          await this.showToast('No internet. Please connect to sign in.', 'danger');
        }
      }

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      await this.showToast('Google Sign-In failed. Please try again.', 'danger');
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
