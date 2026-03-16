import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: 'app-single-expense',
  templateUrl: './single-expense.page.html',
  styleUrls: ['./single-expense.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleExpensePage implements OnInit {
  expenseForm!: FormGroup;
  expenseId: string | null = null;
  pageLoading = false;
  private pendingLoads = 0;
  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private uiToast: UiToastService,
    private expService: ExpenseService,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit() {
    this.createForm();
    this.expenseId = this.route.snapshot.paramMap.get('id');

    this.pendingLoads = this.expenseId ? 1 : 0;
    this.pageLoading = true;

    if (this.expenseId) {
      this.loadExpense(this.expenseId);
    } else {
      this.pageLoading = false;
    }
  }

  createForm() {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString(), Validators.required],
      transaction_type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
    });
  }

  async loadExpense(id: string) {
    this.expService.getExpenseById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.expenseForm.patchValue({
            ...response.data,
            date: response.data.date || new Date().toISOString()
          });
        }
        this.markLoadDone();
      },
      error: (err) => {
        console.error(err);
        this.markLoadDone();
      }
    });
  }

  private markLoadDone() {
    this.pendingLoads = Math.max(0, this.pendingLoads - 1);
    if (this.pendingLoads === 0) {
      this.pageLoading = false;
    }
  }

  onDateChange(event: any) {
    this.expenseForm.patchValue({
      date: event.detail.value
    });
  }

  saveExpense() {
    if (this.expenseForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    const payload = this.expenseForm.value;
    const isEdit = !!this.expenseId;
    const amount = Number(payload.amount) || 0;

    if (isEdit && this.expenseId) {
      this.expService.updateExpense(this.expenseId, payload).subscribe({
        next: () => {
          this.mockNotificationService.addCrudNotification(
            'Expense',
            'updated',
            `${payload.description || 'Expense'} • ₹${amount}`
          );

          this.showToast('Transaction updated successfully', 'success');
          this.navCtrl.navigateBack('/single-view-expenses');
        },
        error: (err) => {
          console.error('Update Error:', err);
          const msg = err.error?.message || 'Failed to update transaction';
          this.showToast(msg, 'danger');
        }
      });
      return;
    }

    // Optimistic create: update UI first, sync API in background.
    const tempId = -Date.now();
    const optimisticExpense: Expense = {
      id: tempId,
      transaction_type: payload.transaction_type,
      description: payload.description,
      amount,
      date: payload.date,
      notes: payload.notes
    };

    this.expService.addOptimisticExpense(optimisticExpense);
    this.expService.adjustBalanceDelta(-amount);
    this.navCtrl.navigateBack('/single-view-expenses');

    this.expService.createExpense(payload).subscribe({
      next: (res) => {
        const savedExpense = res?.data;
        if (savedExpense) {
          this.expService.replaceOptimisticExpense(tempId, savedExpense);
        }

        this.mockNotificationService.addCrudNotification(
          'Expense',
          'created',
          `${payload.description || 'Expense'} • ₹${amount}`
        );
      },
      error: (err) => {
        console.error('Create Error:', err);
        this.expService.rollbackOptimisticExpense(tempId);
        this.expService.adjustBalanceDelta(amount);
        this.uiToast.showError(err.error?.message || 'Expense sync failed. Changes reverted.');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium') {
    await this.uiToast.show(message, color);
  }
}


