import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MenuService } from './services/menu.service';
import { AppConfigService } from './services/app-config.service';
import { AuthService } from './services/auth.service';
import { OnboardingService } from './services/onboarding.service';
import { SmartDetectionService } from './services/smart-detection.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private menuService: MenuService,
    private authService: AuthService,
    private appConfigService: AppConfigService,
    private onboardingService: OnboardingService,
    private smartDetectionService: SmartDetectionService
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(() => {
      this.loadDarkMode();
      void this.appConfigService.initialize();

      if (this.authService.getToken()) {
        void this.onboardingService.initialize();
        void this.smartDetectionService.startIfEnabled();
      }
    });
  }

  /* ===============================
     DARK MODE HANDLING
     =============================== */

  loadDarkMode(): void {
    const darkModeEnabled = localStorage.getItem('dark-mode') === 'true';
    document.body.classList.toggle('dark-theme', darkModeEnabled);
  }

  toggleDarkMode(enabled: boolean): void {
    document.body.classList.toggle('dark-theme', enabled);
    localStorage.setItem('dark-mode', String(enabled));
  }

  /* ===============================
     MENU HANDLING
     =============================== */

  closeMenu(): void {
    this.menuService.closeMenu();
  }
}
