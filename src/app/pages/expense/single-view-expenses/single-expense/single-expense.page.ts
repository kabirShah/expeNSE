import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  isSubmitting = false;
  submitAttempted = false;
  expenseId: string | null = null;
  pageLoading = false;
  categoriesLoading = false;
  private pendingLoads = 0;
  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];
  categories: any[] = [];
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
    this.pendingLoads = this.expenseId ? 2 : 1;
    this.pageLoading = true;
    this.loadCategories();

    if (this.expenseId) {
      this.loadExpense(this.expenseId);
    }
  }
async openAddCategoryPrompt() {
  const name = prompt('Enter new category');

  if (!name || !name.trim()) return;

  this.expService.createCategory({ name }).subscribe((res: any) => {

    const newCategory = res.data;

    this.expService.addCategoryToCache(newCategory);
    this.categories = this.expService.getCachedCategories();

    // auto select it
    this.expenseForm.patchValue({
      category_id: newCategory.id
    });

    this.showToast('Category added', 'success');
  });
}
  createForm() {
    this.expenseForm = this.fb.group({
      date: [this.getTodayDateValue(), [Validators.required, this.noFutureDateValidator()]],
      transaction_type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500), this.trimmedRequiredValidator()]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category_id: [null, Validators.required],
      notes: ['', Validators.maxLength(1000)],
    });
  }

  loadCategories() {
    this.categories = this.expService.getCachedCategories();
    this.categoriesLoading = !this.categories.length;

    this.expService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || [];
        this.categoriesLoading = false;
        this.markLoadDone();
      },
      error: (err) => {
        console.error('Category load error:', err);
        this.categoriesLoading = false;
        this.markLoadDone();
      }
    });
  }

  async loadExpense(id: string) {
    this.expService.getExpenseById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.expenseForm.patchValue({
            ...response.data,
            date: this.normalizeDateValue(response.data.date)
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
      date: this.normalizeDateValue(event.detail.value)
    });
    this.expenseForm.get('date')?.markAsTouched();
    this.expenseForm.get('date')?.updateValueAndValidity();
  }

  saveExpense() {
    if (this.expenseForm.invalid) {
      this.submitAttempted = true;
      this.expenseForm.markAllAsTouched();
      this.showToast('Please correct the highlighted fields', 'danger');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const formValue = this.expenseForm.value;
    const payload = {
      ...formValue,
      description: this.normalizeTextValue(this.expenseForm.value.description),
      notes: this.normalizeOptionalTextValue(this.expenseForm.value.notes),
      date: this.normalizeDateValue(this.expenseForm.value.date)
    };
    const isEdit = !!this.expenseId;
    const amount = Number(payload.amount) || 0;
    const selectedCategory = this.categories.find((category) => category.id === payload.category_id);
    this.isSubmitting = true;

    if (isEdit && this.expenseId) {
      const cachedExpense = this.expService
        .getCachedExpenses()
        .find((expense) => String(expense.id) === String(this.expenseId));

      this.expService.updateExpense(this.expenseId, payload).subscribe({
        next: (res) => {
          const updatedExpense: Expense = {
            ...(cachedExpense || {}),
            ...(res?.data || {}),
            ...payload,
            amount,
            category: selectedCategory || res?.data?.category || cachedExpense?.category
          };

          this.expService.updateExpenseInCache(this.expenseId!, updatedExpense);
          this.mockNotificationService.addCrudNotification(
            'Expense',
            'updated',
            `${payload.description || 'Expense'} • ₹${amount}`
          );

          this.showToast('Transaction updated successfully', 'success');
          this.navCtrl.navigateBack('/single-view-expenses');
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Update Error:', err);
          const msg = err.error?.message || 'Failed to update transaction';
          this.showToast(msg, 'danger');
        },
        complete: () => {
          this.isSubmitting = false;
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
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
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

  shouldShowError(fieldName: string): boolean {
    const control = this.expenseForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.submitAttempted);
  }

  getFieldError(fieldName: string): string {
    const control = this.expenseForm.get(fieldName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      switch (fieldName) {
        case 'date':
          return 'Please select a date';
        case 'transaction_type':
          return 'Please select a payment method';
        case 'description':
          return 'Description is required';
        case 'amount':
          return 'Amount is required';
        case 'category_id':
          return 'Please select a category';
        default:
          return 'This field is required';
      }
    }

    if (control.errors['futureDate']) {
      return 'Future dates are not allowed';
    }

    if (control.errors['trimmedRequired']) {
      return 'Description cannot be only spaces';
    }

    if (control.errors['minlength']) {
      return 'Description must be at least 3 characters';
    }

    if (control.errors['maxlength']) {
      if (fieldName === 'description') {
        return 'Description must be 500 characters or less';
      }

      if (fieldName === 'notes') {
        return 'Notes must be 1000 characters or less';
      }
    }

    if (control.errors['min']) {
      return 'Amount must be greater than 0';
    }

    return 'Please enter a valid value';
  }

  getTodayDateValue(): string {
    return this.normalizeDateValue(new Date());
  }

  private normalizeTextValue(value: any): string {
    return String(value ?? '').trim();
  }

  private normalizeOptionalTextValue(value: any): string {
    return String(value ?? '').trim();
  }

  private normalizeDateValue(value: any): string {
    if (!value) {
      return this.formatDateParts(new Date());
    }

    if (typeof value === 'string') {
      const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateOnlyMatch) {
        return dateOnlyMatch[1];
      }
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.formatDateParts(new Date());
    }

    return this.formatDateParts(parsedDate);
  }

  private formatDateParts(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private trimmedRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');
      return value.trim().length ? null : { trimmedRequired: true };
    };
  }

  private noFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const normalizedValue = this.normalizeDateValue(control.value);
      const selectedDate = new Date(`${normalizedValue}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime())) {
        return { futureDate: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
    };
  }
}


