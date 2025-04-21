import { HttpClient } from '@angular/common/http';
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
  getExpenses(userId: string)  {
    return this.http.get<Expense[]>(`${this.apiUrl}?user_id=${userId}`);
  }

  getExpenseById(id: string) {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Expense)  {
    return this.http.post(this.apiUrl, expense);
  }

  updateExpense(id: string, expense: Expense)  {
    return this.http.put(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
