import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private db: any;
  private API_URL = 'http://127.0.0.1:8000/api/expenses';

  constructor(private http: HttpClient) {
    this.db = new PouchDB('expenses');
  }

  async addExpense(expense: any) {
    const response: any = await firstValueFrom(this.http.post(this.API_URL, expense));
    
    return this.db.put({
      _id: response.id.toString(), // Laravel ni Primary Key store kariye
      ...response
    });
  }

  async getExpenses() {
    const result = await this.db.allDocs({ include_docs: true });
    return result.rows.map(row => row.doc);
  }

  async deleteExpense(id: string) {
    await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
    
    const doc = await this.db.get(id);
    return this.db.remove(doc);
  }
}
