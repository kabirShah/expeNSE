import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  logForm!:FormGroup;

  constructor(private fb:FormBuilder, private navCtrl: NavController, private router: Router) {
    this.logForm = this.fb.group({
      email:['', Validators.required],
      password: ['', Validators.required],
      rememberMe: ['']
    })
  }

  login() {
    console.log('Logging in with', this.logForm);
    if (this.logForm.valid) {
      // await createUserWithEmailAndPassword(this.auth, email, password);
      console.log("Login Form", this.logForm.value);
    }else{
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
}
