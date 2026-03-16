import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    const loginTime = this.authService.getLoginTime();
    const rememberMe = localStorage.getItem('rememberMe'); // '7d' or '1d'

    if (!token || !loginTime) {
      this.clearAuth();
      this.router.navigate(['/login']);
      return false;
    }

    const now = Date.now();
    const expiry =
      rememberMe === '7d'
        ? 1000 * 60 * 60 * 24 * 7
        : 1000 * 60 * 60 * 24;

    if (now - Number(loginTime) > expiry) {
      this.clearAuth();
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  private clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('user');
    sessionStorage.clear();
  }
}
