import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage {
  isDarkMode = false;
  savingsGoal: number = 0;

  notificationsEnabled: boolean = true; // Default value
  selectedTheme: string = 'light'; // Default theme

  constructor(private router:Router) {
    this.isDarkMode = localStorage.getItem('dark-mode') === 'true';
  }
  
  updateProfile() {
    // Logic to update profile information
    this.router.navigate(['profile']);
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

  toggleDarkMode(event: any) {
    const enabled = event.detail.checked;
    document.body.classList.toggle('dark-theme', enabled);
    localStorage.setItem('dark-mode', String(enabled));
  }
  saveSavingsGoal(){

  }
}
