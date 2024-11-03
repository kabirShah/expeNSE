import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage {
  user = {
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    password: '',
  };

  constructor(private navCtrl: NavController) {}

  async register() {
    // Storing user information in Ionic Storage
    // await this.storage.set('user', this.user);
    this.navCtrl.navigateForward('/home');
  }

}
