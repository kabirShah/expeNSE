import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense, ExpenseCategory, TransactionType } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private manualDb: any; // For View Expenses
  private autoDb: any; // For View Drops
  private credits: any[] = [];
  private expenses: any[] = []; 
  private ExpenseCategory: any[]=[];
  private TransactionType: any[]=[];
  
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
  async updateManualExpense(expense: any) {
    const expenses = await this.getAllManualExpenses();
  
    const index = expenses.findIndex((exp) => exp._id === expense._id);
  
    if (index !== -1) {
      expenses[index] = expense;
      localStorage.setItem('expenses', JSON.stringify(expenses));
      return Promise.resolve(true);
    }
  
    return Promise.reject('Expense not found');
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
