import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AlertController, Platform } from '@ionic/angular';
import { BiometricService } from './services/biometric.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform,
    private biometricService: BiometricService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
  }
  initializeApp(){
    this.platform.ready().then(() => {
      this.authenticate();
      this.loadDarkMode();
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
  async authenticate() {
    try {
      const isAuthenticated = await this.biometricService.verifyIdentity();
      if (isAuthenticated) {
        this.router.navigateByUrl('/home');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.showErrorAlert(errorMessage);
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

}
