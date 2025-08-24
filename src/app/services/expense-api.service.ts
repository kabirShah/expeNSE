import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  constructor(private api: ApiService) {}

  create(expense: Expense) { return this.api.post('/expenses', expense); }
  update(id: string, expense: Expense) { return this.api.put(`/expenses/${id}`, expense); }
  delete(id: string) { return this.api.delete(`/expenses/${id}`); }
  list(params?: any) { return this.api.get('/expenses'); }
}

