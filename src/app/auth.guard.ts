import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const loginTime = localStorage.getItem('loginTime') || sessionStorage.getItem('loginTime');;
    const rememberMe = localStorage.getItem('rememberMe')|| sessionStorage.getItem('rememberMe');; // '1y' or '1d'

    if (token && loginTime) {
      const now = new Date().getTime();
      const expiry =
        rememberMe === '7d'
          ? 1000 * 60 * 60 * 24 * 7   // 7 days if remember me
          : 1000 * 60 * 60 * 24;      // 1 day otherwise

      if (now - parseInt(loginTime, 10) < expiry) {
        return true; // ✅ Still valid
      } else {
        this.clearAuth();
        this.router.navigate(['/login']);
        return false;
      }
    }

    // ❌ No token found
    this.router.navigate(['/login']);
    return false;
  }
  private clearAuth() {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('rememberMe');
}
}
