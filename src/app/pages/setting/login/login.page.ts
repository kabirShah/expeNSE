import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  constructor(private navCtrl: NavController) {}

  login() {
    console.log('Logging in with', this.email, this.password);
    if (this.rememberMe) {
      // Store login info or token if "Remember Me" is checked
    }
    // Add actual login logic here
  }

  loginWithFacebook() {
    console.log('Logging in with Facebook');
    // Integrate Facebook login API logic here
  }

  loginWithGoogle() {
    console.log('Logging in with Google');
    // Integrate Google login API logic here
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }

  forgotPassword() {
    this.navCtrl.navigateForward('/forgot-password');
  }
}
