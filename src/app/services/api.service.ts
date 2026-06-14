import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiURL;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getWallets(): Observable<any> {
    return this.http.get(`${this.base}/wallets`);
  }

  getAppConfig(): Observable<any> {
    return this.http.get(`${this.base}/app-config`);
  }

  getOnboardingStatus(): Observable<any> {
    return this.http.get(`${this.base}/onboarding/status`, { headers: this.authHeaders() });
  }

  saveOnboardingStep(data: any): Observable<any> {
    return this.http.post(`${this.base}/onboarding/save-step`, data, { headers: this.authHeaders() });
  }

  initSync(messages: any[]): Observable<any> {
    return this.http.post(`${this.base}/sync/init`, { messages }, { headers: this.authHeaders() });
  }

  getSyncStatus(): Observable<any> {
    return this.http.get(`${this.base}/sync/status`, { headers: this.authHeaders() });
  }

  completeOnboarding(): Observable<any> {
    return this.http.post(`${this.base}/onboarding/complete`, {}, { headers: this.authHeaders() });
  }

  saveOnboardingProfile(data: any): Observable<any> {
    return this.http.post(`${this.base}/onboarding/profile`, data, { headers: this.authHeaders() });
  }

  getTrialStatus(): Observable<any> {
    return this.http.get(`${this.base}/onboarding/trial-status`, { headers: this.authHeaders() });
  }

  createWallet(data: any): Observable<any> {
    return this.http.post(`${this.base}/wallets`, data);
  }

  updateWallet(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/wallets/${id}`, data);
  }

  addBalance(id: number, amount: number): Observable<any> {
    return this.http.post(`${this.base}/wallets/${id}/add-balance`, { amount });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.base}/categories`);
  }

  getTransactions(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((k) => {
      const value = filters[k];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(k, value);
      }
    });
    return this.http.get(`${this.base}/transactions`, { params });
  }

  addTransaction(data: any): Observable<any> {
    return this.http.post(`${this.base}/transactions`, data);
  }

  addMultiTransactions(data: any[]): Observable<any> {
    return this.http.post(`${this.base}/transactions/multi`, { transactions: data });
  }

  uploadReceipt(file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.base}/receipts`, form);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.base}/transactions/${id}`);
  }

  getDashboardSummary(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) params = params.set('timezone', timezone);
    return this.http.get(`${this.base}/dashboard/summary`, {
      params,
      headers: this.authHeaders()
    });
  }

  getGroups(): Observable<any> {
    return this.http.get(`${this.base}/groups`, { headers: this.authHeaders() });
  }

  createGroup(data: { name: string; description?: string | null; member_user_ids?: number[] }): Observable<any> {
    return this.http.post(`${this.base}/groups`, data, { headers: this.authHeaders() });
  }

  addExpenseToGroup(groupId: number | string, data: any): Observable<any> {
    return this.http.post(`${this.base}/groups/${groupId}/expenses`, data, { headers: this.authHeaders() });
  }

  getGroupBalances(groupId: number | string): Observable<any> {
    return this.http.get(`${this.base}/groups/${groupId}/balances`, { headers: this.authHeaders() });
  }

  getPaymentBreakdown(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get(`${this.base}/dashboard/payment-breakdown`, { params });
  }

  generateReport(payload: any): Observable<any> {
    return this.http.post(`${this.base}/reports/generate`, payload);
  }

  getReports(): Observable<any> {
    return this.http.get(`${this.base}/reports`);
  }

  getReportById(id: number): Observable<any> {
    return this.http.get(`${this.base}/reports/${id}`);
  }

  parseVoice(transcript: string): Observable<any> {
    return this.http.post(`${this.base}/voice/parse`, { transcript });
  }

  getVoiceEntries(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((k) => {
      const value = filters[k];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(k, value);
      }
    });
    return this.http.get(`${this.base}/voice`, { params });
  }

  confirmVoice(entryId: number, data: any): Observable<any> {
    return this.http.post(`${this.base}/voice/${entryId}/confirm`, data);
  }

  autoDetectTransaction(data: any): Observable<any> {
    return this.http.post(`${this.base}/transactions/auto-detect`, data, {
      headers: this.authHeaders()
    });
  }

  parseDetectedTransaction(data: { raw_text: string; package_name?: string; received_at?: string }): Observable<any> {
    return this.http.post(`${this.base}/transactions/parse-detection`, data, {
      headers: this.authHeaders()
    });
  }

  getBudgets(): Observable<any> {
    return this.http.get(`${this.base}/budgets`);
  }

  createBudget(data: any): Observable<any> {
    return this.http.post(`${this.base}/budgets`, data);
  }

  updateBudget(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/budgets/${id}`, data);
  }

  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${this.base}/budgets/${id}`);
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.base}/notifications`);
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.post(`${this.base}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.post(`${this.base}/notifications/read-all`, {});
  }

  getRecurring(): Observable<any> {
    return this.http.get(`${this.base}/recurring`);
  }

  createRecurring(data: any): Observable<any> {
    return this.http.post(`${this.base}/recurring`, data);
  }

  updateRecurring(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/recurring/${id}`, data);
  }

  deleteRecurring(id: number): Observable<any> {
    return this.http.delete(`${this.base}/recurring/${id}`);
  }
}
