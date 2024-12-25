import { Injectable } from '@angular/core';
import { CreditCard } from '../models/credit-card.model';
import { DebitCard } from '../models/debit-card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private creditDb: any;
  private debitDb: any;

  constructor() { 
    this.creditDb = new PouchDB('creditCards');
    this.debitDb = new PouchDB('debitCards');
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
  getCreditCardsByUser(userId: string) {
    return this.creditDb.allDocs({ include_docs: true }).then((result) =>
      result.rows
        .map((row) => row.doc)
        .filter((card: CreditCard) => card.userId === userId)
    );
  }

  updateCreditCard(card: CreditCard) {
    return this.creditDb.put(card); // Requires _id and _rev
  }

  deleteCreditCard(id: string, rev: string) {
    return this.creditDb.remove(id, rev);
  }

  // Debit Card CRUD Operations
  addDebitCard(card: DebitCard) {
    return this.debitDb.post(card);
  }

  getDebitCardsByUser(userId: string) {
    return this.debitDb.allDocs({ include_docs: true }).then((result) =>
      result.rows
        .map((row) => row.doc)
        .filter((card: DebitCard) => card.userId === userId)
    );
  }

  updateDebitCard(card: DebitCard) {
    return this.debitDb.put(card); // Requires _id and _rev
  }

  deleteDebitCard(id: string, rev: string) {
    return this.debitDb.remove(id, rev);
  }
  async getCreditCardById(id: string): Promise<CreditCard> {
    try {
      return await this.creditDb.get(id);
    } catch (error) {
      console.error('Error fetching card by ID:', error);
      throw error;
    }
  }
}
