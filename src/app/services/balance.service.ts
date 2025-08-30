import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Balance } from '../models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceService extends BaseApiService {
  private balanceUrl = `${this.apiUrl}/balances`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all balances
  getBalances(): Observable<{ success: boolean; data: Balance[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Balance[] }>(
      this.balanceUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get balance by ID
  getBalanceById(id: string): Observable<{ success: boolean; data: Balance }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Balance }>(
      `${this.balanceUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new balance
  createBalance(balance: Balance): Observable<{ success: boolean; data: Balance }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Balance }>(
      this.balanceUrl,
      balance,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update balance
  updateBalance(id: string, balance: Balance): Observable<{ success: boolean; data: Balance }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: Balance }>(
      `${this.balanceUrl}/${id}`,
      balance,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete balance
  deleteBalance(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.balanceUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
