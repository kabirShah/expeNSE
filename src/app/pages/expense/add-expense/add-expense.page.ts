import { Component, ViewChild } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { IonDatetime, NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
})
export class AddExpensePage {
  @ViewChild('dobPicker', { static: false })  dobPicker!:IonDatetime;

  newExpense: any = {
    date: '',
    category: '',
    transactionType: '',
    description: '',
    amount: 0,
    notes: ''
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

  constructor(private navCtrl: NavController) {}

  onCategoryChange(event: any) {
    this.newExpense.category = event.detail.value;
  }
  async addExpense() {
    // Retrieve current expenses from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push({ ...this.newExpense }); // Add new entry to the array
    // Save updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    // Reset form fields
    this.newExpense = { date: '', category: '', transactionType: '', description: '', amount: 0, notes: '' };
    // Navigate to the View Expenses page
    this.navCtrl.navigateBack('/view-expenses');
  }

  openDatePicker(){
    this.isDatePickerOpen = true;
  }
  onDateChange(event:any){
    this.newExpense.date = event.detail.value; // Update DOB in user object
    this.isDatePickerOpen = false; // Close the date picker after selection
  }
  onTransactionTypeChange(event: any) {
    this.newExpense.transactionType = event.detail.value;
  }
}
