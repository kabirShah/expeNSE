import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { ExpenseApiService } from './expense-api.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  constructor(private db: DatabaseService, private expenseApi: ExpenseApiService) {}

  async syncManualExpensesToServer() {
    const manual = await this.db.getAllManualExpenses();
    for (const exp of manual) {
      try {
        await this.expenseApi.create(exp as any).toPromise();
      } catch (e) {
        console.error('Failed to sync expense', exp, e);
      }
    }
  }
}

