import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface MultiExpense {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  members: MultiExpenseMember[];
  settled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MultiExpenseMember {
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
export class MultiExpenseService extends BaseApiService {
  private multiExpensesUrl = `${this.apiUrl}/multi-expenses`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all multi expenses
  getMultiExpenses(): Observable<{ success: boolean; data: MultiExpense[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: MultiExpense[] }>(
      this.multiExpensesUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get multi expense by ID
  getMultiExpenseById(id: string): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: MultiExpense }>(
      `${this.multiExpensesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new multi expense
  createMultiExpense(multiExpense: MultiExpense): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: MultiExpense }>(
      this.multiExpensesUrl,
      multiExpense,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update multi expense
  updateMultiExpense(id: string, multiExpense: MultiExpense): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: MultiExpense }>(
      `${this.multiExpensesUrl}/${id}`,
      multiExpense,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete multi expense
  deleteMultiExpense(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.multiExpensesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get multi expense members
  getMembers(multiExpenseId: string): Observable<{ success: boolean; data: MultiExpenseMember[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: MultiExpenseMember[] }>(
      `${this.multiExpensesUrl}/${multiExpenseId}/members`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Add member to multi expense
  addMember(multiExpenseId: string, member: MultiExpenseMember): Observable<{ success: boolean; data: MultiExpenseMember }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: MultiExpenseMember }>(
      `${this.multiExpensesUrl}/${multiExpenseId}/members`,
      member,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update multi expense member
  updateMember(multiExpenseId: string, memberId: string, member: MultiExpenseMember): Observable<{ success: boolean; data: MultiExpenseMember }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: MultiExpenseMember }>(
      `${this.multiExpensesUrl}/${multiExpenseId}/members/${memberId}`,
      member,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete multi expense member
  deleteMember(multiExpenseId: string, memberId: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.multiExpensesUrl}/${multiExpenseId}/members/${memberId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Settle multi expense member (alternative endpoint)
  settleMember(multiExpenseId: string, memberId: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.multiExpensesUrl}/${multiExpenseId}/members/${memberId}/settle`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
