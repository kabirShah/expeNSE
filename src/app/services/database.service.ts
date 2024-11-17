import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private manualDb: any; // For View Expenses
  private autoDb: any; // For View Drops

  constructor() {
    this.manualDb = new PouchDB('expDatabase'); // Manually added expenses
    this.autoDb = new PouchDB('dropDatabase'); // Auto-parsed expenses
  }

  // Manual Expense CRUD
  addManualExpense(expense: Expense) {
    return this.manualDb.post(expense);
  }
  getAllManualExpenses() {
    return this.manualDb.allDocs({ include_docs: true }).then((result) => {
      return result.rows.map((row) => row.doc);
    });
  }
  deleteManualExpense(id: string) {
    return this.manualDb.get(id).then((doc) => this.manualDb.remove(doc));
  }

  // Auto Expense CRUD
  addAutoExpense(expense: Expense) {
    return this.autoDb.post(expense);
  }
  getAllAutoExpenses() {
    return this.autoDb.allDocs({ include_docs: true }).then((result) => {
      return result.rows.map((row) => row.doc);
    });
  }
  deleteAutoExpense(id: string) {
    return this.autoDb.get(id).then((doc) => this.autoDb.remove(doc));
  }
}
