import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense, ExpenseCategory, TransactionType } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private manualDb: PouchDB.Database<Expense>;
  private autoDb: PouchDB.Database<Expense>;
  private credits: any[] = [];
  private expenses: any[] = []; 
  private ExpenseCategory: any[]=[];
  private TransactionType: any[]=[];
  
  constructor() {
    this.manualDb = new PouchDB('expDatabase'); // Manually added expenses
    this.autoDb = new PouchDB('dropDatabase'); // Auto-parsed expenses
  }
  private handleError(error: any): never {
    console.error('Database Error:', error);
    throw error;
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    try {
      return await this.manualDb.get(id);
    } catch (error) {
      if (error === 404) return undefined;
      this.handleError(error);
    }
  }
  async getAutoExpense(databaseName:string, id:string){
    return await this.autoDb.get(id);
  }
  // Manual Expense CRUD
  async addManualExpense(expense: Expense) {
    try {
      expense._id = expense._id || new Date().toISOString();
      const response = await this.manualDb.put(expense);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }
  async getAllManualExpenses(): Promise<Expense[]> {
    try {
      const result = await this.manualDb.allDocs({ include_docs: true });
      return result.rows.map((row) => row.doc as Expense);
    } catch (error) {
      this.handleError(error);
    }
  }
  async deleteManualExpense(id: string, rev: string) {
    try {
      const response = await this.manualDb.remove(id, rev);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Auto Expense CRUD
  async addAutoExpense(expense: Expense) {
    try {
      expense._id = expense._id || new Date().toISOString();
      const response = await this.autoDb.put(expense);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }
  async getAllAutoExpenses(): Promise<Expense[]> {
    try {
      const result = await this.autoDb.allDocs({ include_docs: true });
      return result.rows.map((row) => row.doc as Expense);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateManualExpense(expense: Expense) {
    try {
      
    if (!expense._id || !expense._rev) {
      throw new Error('Expense must have a valid _id and _rev for updates');
    }
      const response = await this.manualDb.put(expense);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAutoExpense(id: string) {
    try {
      const doc = await this.autoDb.get(id);
      const response = await this.autoDb.remove(doc);
      return response;
    } catch (error) {
      this.handleError(error);
    }
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
  async updateAutoExpense(expense: any) {
    try {
      const response = await this.autoDb.put(expense); // Ensure _id and _rev exist
      return response;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }
}
