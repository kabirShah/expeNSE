import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBase;
  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  setToken(token: string | null) {
    this.authToken = token;
  }

  private headers(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.authToken) headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    return headers;
  }

  // Auth
  login(payload: { email: string; password: string }): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.baseUrl}/auth/login`, payload, { headers: this.headers() });
  }
  register(payload: any): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.baseUrl}/auth/register`, payload, { headers: this.headers() });
  }
  requestPasswordReset(payload: { email: string }): Observable<ApiResponse<{ otpSent: boolean }>> {
    return this.http.post<ApiResponse<{ otpSent: boolean }>>(`${this.baseUrl}/auth/forgot-password`, payload, { headers: this.headers() });
  }
  verifyOtp(payload: { email: string; otp: string }): Observable<ApiResponse<{ verified: boolean }>> {
    return this.http.post<ApiResponse<{ verified: boolean }>>(`${this.baseUrl}/auth/verify-otp`, payload, { headers: this.headers() });
  }
  resetPassword(payload: { email: string; password: string; otp: string }): Observable<ApiResponse<{}>> {
    return this.http.post<ApiResponse<{}>>(`${this.baseUrl}/auth/reset-password`, payload, { headers: this.headers() });
  }

  // Dashboard
  getDashboardStats(params: { range: 'day'|'week'|'month'|'year' }): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/dashboard?range=${params.range}`, { headers: this.headers() });
  }

  // Expenses
  getExpenses(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/expenses`, { headers: this.headers() });
  }
  createExpense(payload: any): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.baseUrl}/expenses`, payload, { headers: this.headers() });
  }
  bulkCreateExpenses(payload: any[]): Observable<ApiResponse<{ count: number }>> {
    return this.http.post<ApiResponse<{ count: number }>>(`${this.baseUrl}/expenses/bulk`, { items: payload }, { headers: this.headers() });
  }

  // PDF Import/Export
  importPdf(formData: FormData): Observable<ApiResponse<{ imported: number }>> {
    const headers = this.headers().delete('Content-Type');
    return this.http.post<ApiResponse<{ imported: number }>>(`${this.baseUrl}/import/pdf`, formData, { headers });
  }
  exportPdf(params: { range: 'month'|'year' }): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/pdf?range=${params.range}`, { headers: this.headers(), responseType: 'blob' });
  }

  // Bank Integrations
  listBankIntegrations(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/integrations/banks`, { headers: this.headers() });
  }
}