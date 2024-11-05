import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage {

  notificationsEnabled: boolean = true; // Default value
  selectedTheme: string = 'light'; // Default theme

  constructor() {}
  changeProfilePicture() {
    // Logic to change the profile picture
    console.log('Change Profile Picture clicked');
  }

  updateProfile() {
    // Logic to update profile information
    console.log('Update Profile clicked');
  }

  changePassword() {
    // Logic to change the password
    console.log('Change Password clicked');
  }

  manageAccount() {
    // Logic to manage the account
    console.log('Manage Account clicked');
  }

  viewPrivacyPolicy() {
    // Logic to view privacy policy
    console.log('View Privacy Policy clicked');
  }

  viewTerms() {
    // Logic to view terms of service
    console.log('View Terms of Service clicked');
  }
}
