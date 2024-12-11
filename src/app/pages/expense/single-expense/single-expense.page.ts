import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-single-expense',
  templateUrl: './single-expense.page.html',
})
export class SingleExpensePage implements OnInit {
  expenseForm!: FormGroup;
  expenseCategories = [
    'Utilities', 'Clothes Shopping', 'Entertainment', 'Groceries',
    'Miscellaneous', 'Rent', 'Transport', 'Healthcare',
    'Dining Out', 'Education', 'Personal Care', 'Savings & Investments',
    'Subscriptions', 'Household Supplies', 'Travel'
  ];
  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createForm();

    // Populate the form if navigation state exists
    const navState = this.router.getCurrentNavigation()?.extras.state;
    if (navState?.['expense']) {
      this.expenseForm.patchValue(navState['expense']);
    }
  }

  createForm() {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString(), Validators.required],
      category: ['', Validators.required],
      transactionType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      notes: [''],
      _id: ['']
    });
  }

  async saveExpense() {
    if (this.expenseForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    const expense = this.expenseForm.value;
    try {
      if (expense._id) {
      await this.db.updateManualExpense(expense);
      this.navCtrl.navigateBack('/single-view-expenses');
      }else{
        await this.db.addManualExpense(expense);
        console.log('Expense added manually successfully');
      }
      this.expenseForm.reset();
      this.navCtrl.navigateBack('/single-view-expenses'); 
    } catch (error) {
      console.error('Error saving expense', error);
    }
  }
}
