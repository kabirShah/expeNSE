import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense } from '../models/expense.model'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;

  constructor() {
    this.db = new PouchDB('expenseDB');
  }

  addExpense(expense: Expense) {
    return this.db.post(expense);
  }

  getAllExpenses(): Promise<Expense[]> {
    return this.db.allDocs({ include_docs: true }).then(result => {
      return result.rows.map(row => row.doc as Expense);
    });
  }

  deleteExpense(expenseId: string) {
    return this.db.get(expenseId).then(doc => {
      return this.db.remove(doc);
    });
  }

  updateExpense(expense: Expense) {
    return this.db.put(expense);
  }

  syncWithRemoteServer() {
    const remoteDb = new PouchDB('https://remote-couchdb-server.com/my_database');
    this.db.sync(remoteDb, { live: true, retry: true });
  }
}
