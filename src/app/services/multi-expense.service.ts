import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

// ✅ Interfaces
export interface MultiExpenseMember {
  id?: number;
  multi_expense_id?: number;
  user_id?: number | null;
  name?: string;
  amount_owed?: number;
  amount_paid?: number;
  status?: string;
  multi_expense_member_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MultiExpense {
  id?: number;
  user_id?: number;
  title: string;
  description?: string;
  total_amount?: number;
  category?: string;
  multi_expense_id?: string;
  multiExpenseMembers?: MultiExpenseMember[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultiExpenseService extends BaseApiService {
  private readonly baseUrl = `${this.apiUrl}/multi-expenses`;

  constructor(http: HttpClient) {
    super(http);
  }

  /** 🌐 Get all multi-expenses for logged-in user */
  getMultiExpenses(): Observable<{ success: boolean; data: MultiExpense[] }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .get<{ success: boolean; data: MultiExpense[] }>(this.baseUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /** 🌐 Get a specific multi-expense by ID or UUID */
  getMultiExpenseById(id: string | number): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .get<{ success: boolean; data: MultiExpense }>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /** 🆕 Create a new multi-expense (backend auto-parses description) */
  createMultiExpense(expense: MultiExpense): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .post<{ success: boolean; data: MultiExpense }>(
        this.baseUrl,
        expense,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** ✏️ Update existing multi-expense */
  updateMultiExpense(id: string | number, expense: Partial<MultiExpense>): Observable<{ success: boolean; data: MultiExpense }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .put<{ success: boolean; data: MultiExpense }>(
        `${this.baseUrl}/${id}`,
        expense,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** ❌ Delete a multi-expense */
  deleteMultiExpense(id: string | number): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/${id}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** 👥 Get members of a specific multi-expense */
  getMembers(multiExpenseId: string | number): Observable<{ success: boolean; data: MultiExpenseMember[] }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .get<{ success: boolean; data: MultiExpenseMember[] }>(
        `${this.baseUrl}/${multiExpenseId}/members`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** ➕ Add a new member */
  addMember(multiExpenseId: string | number, member: MultiExpenseMember): Observable<{ success: boolean; data: MultiExpenseMember }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .post<{ success: boolean; data: MultiExpenseMember }>(
        `${this.baseUrl}/${multiExpenseId}/members`,
        member,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** ✏️ Update an existing member */
  updateMember(
    multiExpenseId: string | number,
    memberId: string | number,
    member: Partial<MultiExpenseMember>
  ): Observable<{ success: boolean; data: MultiExpenseMember }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .put<{ success: boolean; data: MultiExpenseMember }>(
        `${this.baseUrl}/${multiExpenseId}/members/${memberId}`,
        member,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** ❌ Delete a member */
  deleteMember(multiExpenseId: string | number, memberId: string | number): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/${multiExpenseId}/members/${memberId}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /** 💰 Mark member payment as settled or partially paid */
  settleMember(
    multiExpenseId: string | number,
    memberId: string | number,
    amount_paid: number
  ): Observable<{ success: boolean; data: MultiExpenseMember }> {
    if (!this.isOnline()) return this.handleOfflineError();

    return this.http
      .post<{ success: boolean; data: MultiExpenseMember }>(
        `${this.baseUrl}/${multiExpenseId}/members/${memberId}/settle`,
        { amount_paid },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }
}
