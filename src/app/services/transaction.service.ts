import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends BaseApiService {
  private transactionsUrl = `${this.apiUrl}/transactions`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all transactions
  getTransactions(): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      this.transactionsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transaction by ID
  getTransactionById(id: string): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new transaction
  createTransaction(transaction: Transaction): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Transaction }>(
      this.transactionsUrl,
      transaction,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update transaction
  updateTransaction(id: string, transaction: Transaction): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/${id}`,
      transaction,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete transaction
  deleteTransaction(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.transactionsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transactions by type
  getTransactionsByType(type: string): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.transactionsUrl}/type/${type}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transactions by status
  getTransactionsByStatus(status: string): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.transactionsUrl}/status/${status}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transactions by date range
  getTransactionsByDateRange(startDate: string, endDate: string): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.transactionsUrl}/date-range`,
      { 
        headers: this.getAuthHeaders(),
        params: { start_date: startDate, end_date: endDate }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transaction summary
  getTransactionSummary(): Observable<{ success: boolean; data: any }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: any }>(
      `${this.transactionsUrl}/summary`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get transactions by category
  getTransactionsByCategory(category: string): Observable<{ success: boolean; data: Transaction[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.transactionsUrl}/category/${category}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update transaction status
  updateTransactionStatus(id: string, status: string): Observable<{ success: boolean; data: Transaction }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Transaction }>(
      `${this.transactionsUrl}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
