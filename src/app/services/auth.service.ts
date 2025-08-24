import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, tap } from 'rxjs';

export interface LoginResponse { token: string; user: any }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {
    const token = this.getToken();
    if (token) {
      // Optionally load profile
    }
  }

  login(email: string, password: string) {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(payload: any) {
    return this.api.post<LoginResponse>('/auth/register', payload).pipe(
      tap(res => {
        this.setToken(res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  forgotPassword(email: string) {
    return this.api.post<any>('/auth/forgot-password', { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.api.post<any>('/auth/verify-otp', { email, otp });
  }

  resetPassword(email: string, otp: string, password: string) {
    return this.api.post<any>('/auth/reset-password', { email, otp, password });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
}

// Removed legacy AngularFire AuthService to avoid duplicate declarations
