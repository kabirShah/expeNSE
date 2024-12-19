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
  async getExpense(databaseName: string, id: string){
    return await this.manualDb.get(id); 
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
  async deleteManualExpense(databaseName:string, id: string, rev:string) {
    return await this.manualDb.remove(id,rev);
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
    try {
      // Fetch all expenses from localStorage
      const expenses = await this.getAllManualExpenses();
  
      // Find expense index
      const index = expenses.findIndex((exp) => exp._id === expense._id);
  
      if (index !== -1) {
        // Update the found expense
        expenses[index] = { ...expenses[index], ...expense }; 
  
        // Save back to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));
        console.log('Expense updated successfully');
        return Promise.resolve(true);
      } else {
        console.error('Expense not found for update');
        return Promise.reject('Expense not found');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      return Promise.reject(error);
    }
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
