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
    const expensePattern = /(\d+(\.\d{1,2})?)₹\s*([\w\s]+?)(?:\s*paid by\s*([\w\s]+))?(?:\s*using\s*([\w\s]+))?/gi;
    let match;
    const expenses: Expense[] = [];
  
    while ((match = expensePattern.exec(message)) !== null) {
      const [, amount, , description, paidBy = 'Unknown', transactionType = 'Cash'] = match;
  
      expenses.push({
        date: new Date().toISOString(),
        category: this.detectCategory(description),
        transactionType: this.detectTransactionType(transactionType),
        description: description.trim(),
        amount: parseFloat(amount),
        notes: '',
        paidBy: paidBy.trim(),
      });
    }
    return expenses;
  }
  private detectCategory(description: string): string {
    const categories: { [key: string]: string[] } = {
      Groceries: ['milk', 'khakhra', 'tea', 'grocery'],
      Transport: ['auto', 'petrol', 'transport'],
      Food: ['lunch', 'poha', 'dabeli', 'sandwich', 'food'],
      Rent: ['rent'],
      Education: ['education', 'loan'],
      Miscellaneous: ['soda', 'coffee', 'show', 'bill'],
    };
  
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'Miscellaneous'; 
  }
  
  private detectTransactionType(transactionType: string): string {
    const types = ['Cash', 'UPI', 'Card', 'Wallet', 'Bank Transfer'];
    return types.includes(transactionType) ? transactionType : 'Cash';
  }
}
