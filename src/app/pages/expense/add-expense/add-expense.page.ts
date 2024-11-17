import { Component, ViewChild } from '@angular/core';
import { IonDatetime, NavController } from '@ionic/angular';
import { DatabaseService } from '../../../services/database.service';
import { Expense } from 'src/app/models/expense.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
})
export class AddExpensePage {
  @ViewChild('dobPicker', { static: false }) dobPicker!: IonDatetime;

  expense: Expense = {
    date: new Date().toISOString(),
    category: '',
    transactionType: '',
    description: '',
    amount: 0,
    notes: '',
    paidBy:''
  };

  isDatePickerOpen = false;
  expenseCategories = [
    'Utilities', 'Clothes Shopping', 'Entertainment', 'Groceries',
    'Miscellaneous', 'Rent', 'Transport', 'Healthcare',
    'Dining Out', 'Education', 'Personal Care', 'Savings & Investments',
    'Subscriptions', 'Household Supplies', 'Travel'
  ];

  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];

  constructor(private navCtrl: NavController, private db: DatabaseService, private router: Router) {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    if (navState) {
      this.expense = navState['expense'];
    }
  }

  onCategoryChange(event: any) {
    this.expense.category = event.detail.value;
  }

  async saveExpense() {
    try {
      await this.db.addManualExpense(this.expense);
      this.expense = { date: '', category: '', transactionType: '', description: '', amount: 0, notes: '', paidBy: '' };
      this.navCtrl.navigateBack('/view-expenses');
    } catch (error) {
      console.error('Error saving expense', error);
    }
  }

  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  onDateChange(event: any) {
    this.expense.date = event.detail.value; // Update DOB in user object
    this.isDatePickerOpen = false; // Close the date picker after selection
  }

  onTransactionTypeChange(event: any) {
    this.expense.transactionType = event.detail.value;
  }
}
