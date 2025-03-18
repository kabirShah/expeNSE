import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BiometricService } from '../../../services/biometric.service';

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
    private toastCtrl: ToastController
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

  loginWithFacebook() {
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
