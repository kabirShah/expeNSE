import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiURL}/expenses`;
  private readonly expensesSubject = new BehaviorSubject<Expense[]>([]);
  readonly expenses$ = this.expensesSubject.asObservable();

  private readonly balanceDeltaSubject = new BehaviorSubject<number>(0);
  readonly balanceDelta$ = this.balanceDeltaSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
  getCategories() {
    return this.http.get(`${environment.apiURL}/categories`, {
      headers: this.getAuthHeaders()
    });
  }
  getGroupExpenses(groupId: number): Observable<any> {
  return this.http.get(
    `${environment.apiURL}/groups/${groupId}/expenses`,
    { headers: this.getAuthHeaders() }
  );
}

  // Local UI cache for non-blocking/optimistic rendering.
  setExpenses(expenses: Expense[]): void {
    this.expensesSubject.next([...(expenses || [])]);
  }

  addOptimisticExpense(expense: Expense): void {
    this.expensesSubject.next([expense, ...this.expensesSubject.value]);
  }

  replaceOptimisticExpense(tempId: number, saved: Expense): void {
    this.expensesSubject.next(
      this.expensesSubject.value.map((exp) =>
        exp.id === tempId ? saved : exp
      )
    );
  }

  rollbackOptimisticExpense(tempId: number): void {
    this.expensesSubject.next(
      this.expensesSubject.value.filter((exp) => exp.id !== tempId)
    );
  }

  removeExpenseFromCache(id: number): void {
    this.expensesSubject.next(
      this.expensesSubject.value.filter((exp) => exp.id !== id)
    );
  }

  adjustBalanceDelta(delta: number): void {
    this.balanceDeltaSubject.next(this.balanceDeltaSubject.value + delta);
  }

  resetBalanceDelta(): void {
    this.balanceDeltaSubject.next(0);
  }


  // ✅ Get all expenses
  getExpenses(period: string = 'month') {
    return this.http.get<{ success: boolean; data: Expense[] }>(
      `${this.apiUrl}?period=${period}`,
      { headers: this.getAuthHeaders() }
    );
  }




  // ✅ Get single expense by ID
  getExpenseById(id: string) {
    return this.http.get<{ success: boolean; data: Expense }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Create new expense
  createExpense(expense: Expense) {
    return this.http.post<{ success: boolean; data: Expense }>(
      this.apiUrl,
      expense,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Bulk insert expenses
  createMultipleExpenses(expenses: Expense[]) {
    return this.http.post<{ success: boolean; data: Expense[] }>(
      `${this.apiUrl}/bulk`,
      { expenses },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Update expense by ID
  updateExpense(id: string, expense: Expense) {
    return this.http.put<{ success: boolean; data: Expense }>(
      `${this.apiUrl}/${id}`,
      expense,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Delete expense by ID
  deleteExpense(id: string) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
