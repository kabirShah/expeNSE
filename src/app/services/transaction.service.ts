// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends BaseApiService {
  private transactionsUrl = `${this.apiUrl}/transactions`;

  constructor(http: HttpClient) { super(http); }

  getTransactions(): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      this.transactionsUrl, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getTransactionById(id: string | number): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.get<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/${id}`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createTransaction(transaction: Partial<Transaction>): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.post<{ success: boolean; data: Transaction }>(
      this.transactionsUrl, transaction, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  updateTransaction(id: string | number, transaction: Partial<Transaction>): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.put<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/${id}`, transaction, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  deleteTransaction(id: string | number): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.transactionsUrl}/${id}`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createMultiTransactions(payload: {
    transactions: Array<Partial<Transaction>>;
    batch_id?: string;
  }): Observable<{ success: boolean; batch_id: string; data: Transaction[] }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.post<{ success: boolean; batch_id: string; data: Transaction[] }>(
      `${this.transactionsUrl}/multi`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createScannedTransaction(payload: {
    amount: number;
    category: string;
    description?: string;
    currency?: string;
    payment_method?: string;
    source_app?: string;
    transaction_date?: string;
  }): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.post<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/scan`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getTransactionsByBatch(batchId: string): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) return this.handleOfflineError();
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.transactionsUrl}/by-batch/${batchId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }
}
