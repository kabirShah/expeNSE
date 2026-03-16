import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface Wallet {
  id?: number;
  name: string;
  type: string;
  currency?: string;
  balance?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService extends BaseApiService {
  private walletsUrl = `${this.apiUrl}/wallets`;

  constructor(http: HttpClient) {
    super(http);
  }

  getWallets(): Observable<{ success: boolean; data: Wallet[] }> {
    return this.http.get<{ success: boolean; data: Wallet[] }>(
      this.walletsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createWallet(payload: Wallet): Observable<{ success: boolean; data: Wallet }> {
    return this.http.post<{ success: boolean; data: Wallet }>(
      this.walletsUrl,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updateWallet(id: number, payload: Partial<Wallet>): Observable<{ success: boolean; data: Wallet }> {
    return this.http.put<{ success: boolean; data: Wallet }>(
      `${this.walletsUrl}/${id}`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  deleteWallet(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.walletsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  addBalance(id: number, amount: number): Observable<{ success: boolean; data: Wallet }> {
    return this.http.post<{ success: boolean; data: Wallet }>(
      `${this.walletsUrl}/${id}/add-balance`,
      { amount },
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }
}
