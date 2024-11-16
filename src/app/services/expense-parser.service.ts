import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseParserService {
  constructor(private databaseService: DatabaseService) {}

  parseMessageAndSave(message: string) {
    // Example: "200₹ Grocery Shopping paid by Jay"
    const match = message.match(/(\d+)₹ (.+) paid by (\w+)/i);
    if (match) {
      const [, amount, description, paidBy] = match;
      const expense: Expense = {
        date: new Date().toISOString(), // Current date
        category: this.detectCategory(description),
        transactionType: 'Cash', // Default for now
        description: description.trim(),
        amount: parseFloat(amount),
        notes: '',
        paidBy: paidBy.trim(),
      };

      // Save parsed expense to the database
      return this.databaseService.addExpense(expense);
    } else {
      throw new Error('Invalid message format');
    }
  }

  detectCategory(description: string): string {
    if (description.includes('grocery')) return 'Groceries';
    if (description.includes('shopping')) return 'Clothes Shopping';
    if (description.includes('transport') || description.includes('petrol')) return 'Transport';
    return 'Miscellaneous';
  }
}
