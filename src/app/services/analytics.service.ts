import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = `${environment.apiURL}/analytics`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /* ================= SUMMARY ================= */
  getSummary(month?: number, year?: number): Observable<any> {
    let url = `${this.apiUrl}/summary`;

    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }

    return this.http.get(url, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= MONTHLY TREND ================= */
  getMonthlyTrend(year?: number): Observable<any> {
    let url = `${this.apiUrl}/monthly-trend`;

    if (year) {
      url += `?year=${year}`;
    }

    return this.http.get(url, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= DAILY TREND ================= */
  getDailyTrend(month?: number, year?: number): Observable<any> {
    let url = `${this.apiUrl}/daily-trend`;

    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }

    return this.http.get(url, {
      headers: this.getAuthHeaders()
    });
  }

  /* ================= BALANCE TRENDS ================= */
  getBalanceTrends(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/balance-trends`;

    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    return this.http.get(url, {
      headers: this.getAuthHeaders()
    });
  }
}
