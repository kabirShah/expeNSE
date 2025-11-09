import { Injectable } from '@angular/core';
import { MultiExpenseService, MultiExpense } from './multi-expense.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseParserService {
  constructor(private multiExpenseService: MultiExpenseService) {}

  async parseMessageAndSave(title: string, message: string, category?: string) {
    const multiExpense: MultiExpense = {
      title,
      description: message,
      totalAmount: 0, // Backend will calculate this
      category
    };

    // Create multi-expense using backend parser
    await this.multiExpenseService.createMultiExpense(multiExpense).toPromise();
  }
}
