import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiURL}/expenses`;

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

  // ✅ Get all expenses
  getExpenses() {
    return this.http.get<{ success: boolean; data: Expense[] }>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
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
