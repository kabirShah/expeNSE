import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export type RoutineFrequency = 'daily' | 'weekly' | 'monthly';
export type RoutineStatus = 'active' | 'inactive';

export interface RoutineExpense {
  id?: number;
  title: string;
  amount: number;
  category_id: number;
  wallet_id: number;
  frequency: RoutineFrequency;
  start_date: string;
  end_date?: string | null;
  last_generated_at?: string | null;
  next_due_date?: string | null;
  status?: RoutineStatus;
  reminder?: boolean;
  notes?: string | null;
  category?: any;
  wallet?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RoutineExpenseService extends BaseApiService {
  private routineUrl = `${this.apiUrl}/routine-expenses`;

  constructor(http: HttpClient) {
    super(http);
  }

  getRoutineExpenses(): Observable<{ success: boolean; data: RoutineExpense[] }> {
    return this.http.get<{ success: boolean; data: RoutineExpense[] }>(
      this.routineUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createRoutineExpense(payload: RoutineExpense): Observable<{ success: boolean; data: RoutineExpense }> {
    return this.http.post<{ success: boolean; data: RoutineExpense }>(
      this.routineUrl,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updateRoutineExpense(id: number, payload: Partial<RoutineExpense>): Observable<{ success: boolean; data: RoutineExpense }> {
    return this.http.put<{ success: boolean; data: RoutineExpense }>(
      `${this.routineUrl}/${id}`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  deleteRoutineExpense(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.routineUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  toggleRoutineExpense(id: number): Observable<{ success: boolean; data: RoutineExpense }> {
    return this.http.patch<{ success: boolean; data: RoutineExpense }>(
      `${this.routineUrl}/${id}/toggle`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }
}
