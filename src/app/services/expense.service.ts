import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private apiUrl = 'http://127.0.0.1:8000/api/expenses';

  constructor(private http: HttpClient) {
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getExpenses()  {
  // No need to send user_id as query param, backend will use authenticated user
  return this.http.get<Expense[]>(this.apiUrl, { headers: this.getAuthHeaders() });
}
  getExpenseById(id: string) {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

createExpense(expense: Expense)  {
  // Always attach user_id from localStorage
  const userId = localStorage.getItem('user_id');
  const payload = { ...expense, user_id: userId }; // <-- Attach user_id
  return this.http.post(this.apiUrl, payload, { headers: this.getAuthHeaders() });
}


  updateExpense(id: string, expense: Expense)  {
    return this.http.put(`${this.apiUrl}/${id}`, expense, { headers: this.getAuthHeaders() });
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}