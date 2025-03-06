import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Expense, ExpenseCategory, TransactionType } from '../models/expense.model';
import { CreditCard } from '../models/credit-card.model';
import { Balance } from '../models/balance.model';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private manualDb: PouchDB.Database<Expense>;
  private autoDb: PouchDB.Database<Expense>;
  private scanDb: PouchDB.Database<Invoice>;
  private creditDb: any;
  private credits: any[] = [];
  private balanceDb: any;
  private debitDb: any;
  private expenses: any[] = []; 
  private ExpenseCategory: any[]=[];
  private TransactionType: any[]=[];


  constructor() {
    this.manualDb = new PouchDB('expDatabase'); // Manually added expenses
    this.autoDb = new PouchDB('dropDatabase'); // Auto-parsed expenses
    this.creditDb = new PouchDB('creditCards');
    this.debitDb = new PouchDB('debitCards');
    this.balanceDb = new PouchDB('balanceDB');
    this.scanDb = new PouchDB('scanned_invoices');
  }
  private handleError(error: any): never {
    console.error('Database Error:', error);
    throw error;
  }
 async getCards(id:string): Promise<CreditCard | undefined>{
    try {
      return await this.creditDb.get(id);
    } catch (error) {
      if (error === 404) return undefined;
      this.handleError(error);
    }
  }
   async updateCards(cards: CreditCard) {
      try {
        
      if (!cards._id || !cards._rev) {
        throw new Error('Expense must have a valid _id and _rev for updates');
      }
        const response = await this.creditDb.put(cards);
        return response;
      } catch (error) {
        this.handleError(error);
      }
    }
    async addCreditCard(card: CreditCard) {
        try {
          card._id = card._id || new Date().toISOString();
          const response = await this.creditDb.put(card);
          return response;
        } catch (error) {
          this.handleError(error);
       }
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
  async getAllBalance(): Promise <Balance[]>{
    try{
      const result = await this.balanceDb.allDocs({include_docs:true});
      return result.rows.map((row)=>row.doc as Balance);
    } catch(error){
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
  async saveBalance(balance: Balance) {
    try {
      balance._id = balance._id || new Date().toISOString();
      const response = await this.balanceDb.put(balance);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }
  async getUserBalance(): Promise<{ _id: string, _rev: string, balance: number } | null> {
    try {
      const balanceDoc = await this.balanceDb.get('userBalance');
      return balanceDoc || null; // Return the full document or null if not found
    } catch (error) {
      if (error === 404) {
        return null; // Return null if the document is not found
      }
      throw error; // Handle other errors
    }
  }
  async saveInvoice(invoice: Invoice) {
    invoice._id = new Date().toISOString(); // Unique ID
    try {
      await this.scanDb.put(invoice);
      console.log('Invoice saved:', invoice);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  }
  async getInvoices(): Promise<Invoice[]> {
    try {
      const result = await this.scanDb.allDocs({ include_docs: true });
      return result.rows.map(row => row.doc as Invoice);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }  
  async deleteInvoice(invoiceId: string) {
    try {
      const doc = await this.scanDb.get(invoiceId); // Fetch invoice by ID
      await this.scanDb.remove(doc); // Remove invoice from PouchDB
      console.log('Invoice deleted:', invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }
  async saveManualExpenses(expenses: Expense[]) {
    try {
      const savePromises = expenses.map((expense) => {
        // If _id and _rev exist, update, else add as new expense
        if (expense._id && expense._rev) {
          return this.updateManualExpense(expense);
        } else {
          return this.addManualExpense(expense);
        }
      });
  
      // Wait for all save/update operations to complete
      await Promise.all(savePromises);
      console.log('Expenses saved successfully');
    } catch (error) {
      console.error('Error saving expenses:', error);
      this.handleError(error);
    }
  }
  async addReceipt(receipt: any){
    return await this.scanDb.put({...receipt, _id: receipt.id});
  }
  async getAllReceipts(){
    const result = await this.scanDb.allDocs({ include_docs: true });
    return result.rows.map((row: any) => row.doc);
  }
  async deleteReceipt(id: string){
    const doc = await this.scanDb.get(id);
    return await this.scanDb.remove(doc);
  }
  
}
