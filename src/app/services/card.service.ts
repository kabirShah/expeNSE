import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private creditDb: any;
  private debitDb: any;

  constructor() { 
    this.creditDb = new PouchDB('credit_cards');
    this.debitDb = new PouchDB('debit_cards');
  }
  // Add Card
  async addCard(card: Card, type: 'credit' | 'debit'): Promise<any> {
    const db = type === 'credit' ? this.creditDb : this.debitDb;

    try {
      // Convert Card model to object and post to DB
      const result = await db.post(card.toObject()); // toObject() returns the plain object
      return result;
    } catch (error) {
      console.error('Error adding card:', error);
      throw new Error('Failed to add card');
    }
  }

  // Get All Cards
  async getAllCards(type: 'credit' | 'debit'): Promise<any[]> {
    const db = type === 'credit' ? this.creditDb : this.debitDb;

    try {
      const result = await db.allDocs({ include_docs: true });
      return result.rows.map(row => row.doc);
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw new Error('Failed to fetch cards');
    }
  }

  // Update Card
  async updateCard(card: Card, type: 'credit' | 'debit'): Promise<any> {
    const db = type === 'credit' ? this.creditDb : this.debitDb;

    try {
      if (!card._id || !card._rev) {
        throw new Error('Invalid card data: _id and _rev are required for update');
      }

      const result = await db.put(card.toObject()); // toObject() returns the plain object
      return result;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card');
    }
  }

  // Delete Card
  async deleteCard(id: string, rev: string, type: 'credit' | 'debit'): Promise<any> {
    const db = type === 'credit' ? this.creditDb : this.debitDb;

    try {
      if (!id || !rev) {
        throw new Error('Card ID and revision are required for deletion');
      }

      const result = await db.remove(id, rev);
      return result;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw new Error('Failed to delete card');
    }
  }

}
