import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private manualDb: any; // For View Expenses
  private autoDb: any; // For View Drops
  private credits: any[] = [];
  private expenses: any[] = []; 

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
  async getAllExpenses() {
    const result = await this.manualDb.allDocs({
      include_docs: true,
      descending: true,
    });
    return result.rows.map(row => row.doc);
  }
  // Balance Management
  async getUserBalance(): Promise<number | null> {
      const balanceDoc = await this.manualDb.get('userBalance');
      return balanceDoc ? balanceDoc.amount : null;
    // catch (error) {
    //   if (error.status === 404) {
    //     return null;  // No balance set
    //   }
    //   throw error;
    // }
  }
  async setUserBalance(balance: number) {
      const balanceDoc = await this.manualDb.get('userBalance');
      await this.manualDb.put({
        ...balanceDoc,
        amount: balance,
      });
  }
  async addCredit(credit: { id: number; amount: number; date: string }) {
    this.credits.push(credit);
    return Promise.resolve(true);
  }

  // Retrieve all credits
  async getAllCredits() {
    return Promise.resolve(this.credits);
  }
}
