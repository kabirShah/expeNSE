import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, NavController } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage {
  @ViewChild('dobPicker') dobPicker!:IonDatetime;
  user = {
    firstName: '',
    lastName:'',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    password: '',
  };
  isDatePickerOpen = false;

  constructor(private navCtrl: NavController) {}

  async register() {
    // Storing user information in Ionic Storage
    // await this.storage.set('user', this.user);
    this.navCtrl.navigateForward('/home');
  }
  openDatePicker(){
    this.isDatePickerOpen = true;
  }
  onDateChange(event: any) {
    this.user.dob = event.detail.value; // Update DOB in user object
    this.isDatePickerOpen = false; // Close the date picker after selection
  }
}
