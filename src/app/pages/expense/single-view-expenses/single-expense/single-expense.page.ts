import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';

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
  expenseId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private expService: ExpenseService
  ) {}

  ngOnInit() {
    this.createForm();
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.loadExpense(this.expenseId);
    }
  }

  createForm() {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString(), Validators.required],
      category: ['', Validators.required],
      transaction_type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      notes: [''],
    });
  }

async loadExpense(id: string) {
  try {
    this.expService.getExpenseById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.expenseForm.patchValue(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading expense:', err);
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}


  saveExpense() {
    if (this.expenseForm.invalid) {
      this.showToast('Please enter a valid expense!', 'danger');
      return;
    }

    const expense = this.expenseForm.value;

    if (this.expenseId) {
      // Update expense
      this.expService.updateExpense(this.expenseId, expense).subscribe({
        next: () => {
          this.showToast('Expense updated successfully', 'success');
          this.navCtrl.navigateBack('/single-view-expenses');
        },
        error: (err) => {
          console.error('Error updating expense', err);
          this.showToast('Failed to update expense', 'danger');
        },
      });
    } else {
      // Create expense
      this.expService.createExpense(expense).subscribe({
        next: () => {
          this.showToast('Expense added successfully', 'success');
          this.navCtrl.navigateBack('/single-view-expenses');
        },
        error: (err) => {
          console.error('Error creating expense', err);
          this.showToast('Failed to save expense', 'danger');
        },
      });
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
