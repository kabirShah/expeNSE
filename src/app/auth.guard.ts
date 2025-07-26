import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('auth_token')|| sessionStorage.getItem('auth_token'); // Example: Check for a token in local storage
    if (token) {
      return true;
    }else{
      this.router.navigate(['/login']);
      return false;
    }
  }
}
