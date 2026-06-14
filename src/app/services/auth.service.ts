import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/* ===============================
   TYPES
   =============================== */

export interface LoginResponse {
  token: string;
  user: any;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

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

  loginLaravel(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_URL}/auth/login`,
      { email, password }
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, userData);
  }

  sendOtp(payload: { mobile?: string; phone?: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/send-otp`, payload);
  }

  verifyOtp(payload: { mobile?: string; phone?: string; otp: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/verify-otp`, payload);
  }

  loginOtp(payload: { mobile?: string; phone?: string; otp: string }): Observable<any> {
    return this.verifyOtp(payload);
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.API_URL}/forgot-password`,
      { email }
    );
  }

  resetPassword(
    payload: ResetPasswordPayload
  ): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.API_URL}/reset-password`,
      payload
    );
  }

  /* ===============================
     SESSION HANDLING
     =============================== */

  saveSession(token: string, user: any, rememberMe: boolean, trial?: any): void {
    const now = Date.now().toString();

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('auth_token', token);
    storage.setItem('loginTime', now);
    storage.setItem('user', JSON.stringify(user));
    storage.setItem('user_id', String(user?.id ?? ''));
    storage.setItem('trial', JSON.stringify(trial ?? null));
    localStorage.setItem('rememberMe', rememberMe ? '7d' : '1d');
    localStorage.setItem('token_timestamp', now);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user_id', String(user?.id ?? ''));
    localStorage.setItem('trial', JSON.stringify(trial ?? null));
  }

  clearSession(): void {
    localStorage.clear();
    sessionStorage.clear();
  }

  getToken(): string | null {
    return (
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token')
    );
  }

  getUser(): any | null {
    const user =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getTrial(): any | null {
    const trial =
      localStorage.getItem('trial') ||
      sessionStorage.getItem('trial');
    return trial ? JSON.parse(trial) : null;
  }

  getLoginTime(): string | null {
    return (
      localStorage.getItem('loginTime') ||
      sessionStorage.getItem('loginTime')
    );
  }

  isSessionValid(): boolean {
    const token = this.getToken();
    const loginTime =
      localStorage.getItem('loginTime') ||
      sessionStorage.getItem('loginTime');

    if (!token || !loginTime) return false;

    const diffDays =
      (Date.now() - Number(loginTime)) / (1000 * 60 * 60 * 24);

    return diffDays <= this.TOKEN_EXPIRY_DAYS;
  }

  /* ===============================
     HEADERS (SAFE)
     =============================== */

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /* ===============================
     DATA
     =============================== */

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/me`, {
      headers: this.authHeaders()
    });
  }

  getDashboard(month?: number, year?: number): Observable<any> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) params.timezone = timezone;

    return this.http.get<any>(`${this.API_URL}/dashboard`, {
      params,
      headers: this.authHeaders().set('X-Timezone', timezone)
    });
  }
  updateProfile(formData: FormData) {
    return this.http.put(
      `${this.API_URL}/auth/profile`,
      formData
    );
  }


  /* ===============================
     LOGOUT
     =============================== */

  logout(): void {
    this.http.post(`${this.API_URL}/auth/logout`, {}, {
      headers: this.authHeaders()
    }).subscribe({
      error: () => void 0
    });

    this.clearSession();
  }
}
