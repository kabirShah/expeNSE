import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseParserService {
  constructor(private db: DatabaseService) {}

  async parseMessageAndSave(message: string) {
    const expenses = this.extractExpenses(message);

    if (expenses.length === 0) {
      throw new Error('No valid expenses found in the message.');
    }

    for (const expense of expenses) {
      await this.db.addAutoExpense(expense);
    }
  }

  private extractExpenses(message: string): Expense[] {
    // Example message: "200₹ Groceries paid by Jay, 500₹ Transport paid by Sam"
    const expensePattern = /(\d+)₹ ([\w\s]+) paid by (\w+)/gi;
    let match;
    const expenses: Expense[] = [];

    while ((match = expensePattern.exec(message)) !== null) {
      const [, amount, description, paidBy] = match;
      expenses.push({
        date: new Date().toISOString(),
        category: this.detectCategory(description),
        transactionType: 'Cash', // Default for now
        description: description.trim(),
        amount: parseFloat(amount),
        notes: '',
        paidBy: paidBy.trim(),
      });
    }
    return expenses;
  }

  private detectCategory(description: string): string {
    if (description.toLowerCase().includes('grocery')) return 'Groceries';
    if (description.toLowerCase().includes('shopping')) return 'Clothes Shopping';
    if (description.toLowerCase().includes('transport')) return 'Transport';
    return 'Miscellaneous';
  }
}
