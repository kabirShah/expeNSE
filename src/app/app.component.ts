import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MenuService } from './services/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private menuService: MenuService
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(() => {
      this.loadDarkMode();
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
