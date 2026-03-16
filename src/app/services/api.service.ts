import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiURL;

  constructor(private http: HttpClient) {}

  getWallets(): Observable<any> {
    return this.http.get(`${this.base}/wallets`);
  }

  createWallet(data: any): Observable<any> {
    return this.http.post(`${this.base}/wallets`, data);
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
    form.append('receipt', file);
    return this.http.post(`${this.base}/transactions/scan`, form);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.base}/transactions/${id}`);
  }

  getDashboardSummary(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get(`${this.base}/dashboard/summary`, { params });
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

  confirmVoice(entryId: number, data: any): Observable<any> {
    return this.http.post(`${this.base}/voice/${entryId}/confirm`, data);
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
