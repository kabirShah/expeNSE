import { Component, ViewChild } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { IonDatetime, NavController } from '@ionic/angular';
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
})
export class AddExpensePage {
  @ViewChild('dobPicker', { static: false })  dobPicker!:IonDatetime;

  expense: Expense = {
    date: new Date().toISOString(),
    category: '',
    transactionType: '',
    description: '',
    amount: 0,
    notes: '',
  };


  isDatePickerOpen = false;
  expenseCategories = [
    'Utilities', 'Clothes Shopping', 'Entertainment', 'Groceries',
    'Miscellaneous', 'Rent', 'Transport', 'Healthcare',
    'Dining Out', 'Education', 'Personal Care', 'Savings & Investments',
    'Subscriptions', 'Household Supplies', 'Travel'
  ];

  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];

  selectedCategory: string = '';
  selectedTransactionType: string = '';

  constructor(private navCtrl: NavController, private db: DatabaseService) {}

  onCategoryChange(event: any) {
    this.expense.category = event.detail.value;
  }

  saveExpense() {
    this.db.addExpense(this.expense).then(() => {
      this.expense = { date: '', category: '', transactionType: '', description: '', amount: 0, notes: '' };
      this.navCtrl.navigateBack('/view-expenses');
    });
  }

  openDatePicker(){
    this.isDatePickerOpen = true;
  }
  onDateChange(event:any){
    this.expense.date = event.detail.value; // Update DOB in user object
    this.isDatePickerOpen = false; // Close the date picker after selection
  }
  onTransactionTypeChange(event: any) {
    this.expense.transactionType = event.detail.value;
  }
}
