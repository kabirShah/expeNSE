import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.apiURL;
  private TOKEN_EXPIRY_DAYS = 7;

  constructor(private http: HttpClient) {}

  /* ===============================
     AUTH API CALLS
     =============================== */

  loginLaravel(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password });
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, userData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, data);
  }

  /* ===============================
     SESSION HANDLING (SINGLE SOURCE)
     =============================== */

  saveSession(token: string, user: any, rememberMe: boolean): void {
    const now = Date.now().toString();

    if (rememberMe) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('loginTime', now);
    } else {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('loginTime', now);
    }

    localStorage.setItem('user', JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('user');

    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('loginTime');
  }

  getToken(): string | null {
    return (
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token')
    );
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /* ===============================
     SESSION VALIDATION
     =============================== */

  isSessionValid(): boolean {
    const token = this.getToken();
    const loginTime =
      localStorage.getItem('loginTime') ||
      sessionStorage.getItem('loginTime');

    if (!token || !loginTime) {
      return false;
    }

    const diffDays =
      (Date.now() - Number(loginTime)) /
      (1000 * 60 * 60 * 24);

    return diffDays <= this.TOKEN_EXPIRY_DAYS;
  }

  /* ===============================
     HEADERS
     =============================== */

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /* ===============================
     DATA
     =============================== */

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/user`, {
      headers: this.getAuthHeaders()
    });
  }

  getDashboard(month?: number, year?: number): Observable<any> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<any>(`${this.API_URL}/dashboard`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  /* ===============================
     LOGOUT (NO NAVIGATION)
     =============================== */

  logout(): void {
    this.clearSession();
  }
}
