import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AlertController, Platform } from '@ionic/angular';
import { BiometricService } from './services/biometric.service';
import { Router } from '@angular/router';
import { MenuService } from './services/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform,
    private router: Router,
    private alertCtrl: AlertController,
    private menuService: MenuService,
    private bio: BiometricService
  ) {
    this.initializeApp();
  }
  initializeApp(){
    this.platform.ready().then(() => {
      this.loadDarkMode();
      this.checkLoginStatus();
    });
  }
  loadDarkMode() {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    document.body.classList.toggle('dark-theme', darkMode);
  }

  toggleDarkMode(enabled: boolean) {
    document.body.classList.toggle('dark-theme', enabled);
    localStorage.setItem('dark-mode', String(enabled));
  }
  async checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isBiometricVerified = localStorage.getItem('isBiometricVerified') === 'true';
    if (isLoggedIn ) {
      this.router.navigateByUrl('/home');  // Redirect to Home if already logged in
    } else if(isLoggedIn && !isBiometricVerified){
      const biometricPassed = await this.runBiometricOnce();
      if (biometricPassed) {
        localStorage.setItem('isBiometricVerified', 'true');
        this.router.navigateByUrl('/home');
      } else {
        localStorage.clear();
        this.router.navigateByUrl('/login');
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }
  async runBiometricOnce(): Promise<boolean> {
    try {
      return await this.bio.verifyIdentity();
    } catch (error) {
      console.error('Biometric failed:', error);
      return false;
    }
  }
  
  async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Authentication Failed',
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  closeMenu(){
    this.menuService.closeMenu();
  }
}