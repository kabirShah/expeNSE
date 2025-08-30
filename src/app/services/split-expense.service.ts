import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface SplitExpense {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  participants: SplitParticipant[];
  settled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SplitParticipant {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  amount: number;
  paid: boolean;
  settled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SplitExpenseService extends BaseApiService {
  private splitExpensesUrl = `${this.apiUrl}/split-expenses`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all split expenses
  getSplitExpenses(): Observable<{ success: boolean; data: SplitExpense[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: SplitExpense[] }>(
      this.splitExpensesUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get split expense by ID
  getSplitExpenseById(id: string): Observable<{ success: boolean; data: SplitExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: SplitExpense }>(
      `${this.splitExpensesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new split expense
  createSplitExpense(splitExpense: SplitExpense): Observable<{ success: boolean; data: SplitExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: SplitExpense }>(
      this.splitExpensesUrl,
      splitExpense,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update split expense
  updateSplitExpense(id: string, splitExpense: SplitExpense): Observable<{ success: boolean; data: SplitExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: SplitExpense }>(
      `${this.splitExpensesUrl}/${id}`,
      splitExpense,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete split expense
  deleteSplitExpense(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.splitExpensesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Settle split expense
  settleSplitExpense(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.splitExpensesUrl}/${id}/settle`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
