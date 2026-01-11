import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token =
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token');

    const loginTime = localStorage.getItem('loginTime');
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
