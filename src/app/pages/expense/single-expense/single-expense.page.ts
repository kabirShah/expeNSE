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
      notes: ['']
    });
  }

  async saveExpense() {
    if (this.expenseForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    try {
      await this.db.addManualExpense(this.expenseForm.value);
      this.expenseForm.reset();
      this.navCtrl.navigateBack('/view-expenses');
    } catch (error) {
      console.error('Error saving expense', error);
    }
  }
}
