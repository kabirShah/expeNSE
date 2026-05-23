import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { MultiExpenseService, MultiExpense } from 'src/app/services/multi-expense.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { ExpenseService } from 'src/app/services/expense.service';

@Component({
  selector: 'app-multi-expense',
  templateUrl: './multi-expense.page.html',
  styleUrls: ['./multi-expense.page.scss'],
})
export class MultiExpensePage implements OnInit {

  multiForm!: FormGroup;
  isProcessing = false;
  pageLoading = false;
  isEditMode = false;
  expenseId: string | null = null;

  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private uiToast: UiToastService,
    private multiExpenseService: MultiExpenseService,
    private expenseService: ExpenseService,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.isEditMode = true;
      this.loadExpense(this.expenseId);
    }
  }

  /* ================= FORM ================= */
  initForm() {
    this.multiForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', Validators.required]
    });
  }

  /* ================= LOAD CATEGORY ================= */
  async loadCategories() {
    try {
      const res: any = await firstValueFrom(this.expenseService.getCategories());
      this.categories = res?.data || [];
    } catch {
      this.showToast('Failed to load categories', 'danger');
    }
  }

  /* ================= LOAD EDIT ================= */
  async loadExpense(id: string) {
    this.pageLoading = true;
    try {
      const res = await firstValueFrom(
        this.multiExpenseService.getMultiExpenseById(id)
      );

      if (res?.success) {
        const exp = res.data;

        this.multiForm.patchValue({
          title: exp.title,
          message: exp.description,
          category: exp.category
        });
      }
    } catch {
      this.showToast('Failed to load expense', 'danger');
    } finally {
      this.pageLoading = false;
    }
  }

  /* ================= SUBMIT ================= */
  async submitForm() {
    if (this.multiForm.invalid) {
      this.multiForm.markAllAsTouched();
      this.showToast('Please complete all required fields', 'warning');
      return;
    }

    this.isProcessing = true;

    const { title, message, category } = this.multiForm.value;
    let tempId: number | null = null;

    try {
      /* ===== EDIT ===== */
      if (this.isEditMode && this.expenseId) {
        const cachedExpense = this.multiExpenseService
          .getCachedMultiExpenses()
          .find((expense) => String(expense.id) === String(this.expenseId));

        const res = await firstValueFrom(
          this.multiExpenseService.updateMultiExpense(this.expenseId, {
            title,
            description: message,
            category
          })
        );

        const updatedExpense: MultiExpense = {
          ...(cachedExpense || {}),
          ...(res?.data || {}),
          title,
          description: message,
          category,
          total_amount: this.getTotalAmount(message)
        };

        this.multiExpenseService.updateMultiExpenseInCache(this.expenseId, updatedExpense);

        this.showToast('Updated successfully', 'success');
        this.router.navigate(['/multi-view-expense']);
        return;
      }

      /* ===== CREATE (Optimistic UI) ===== */
      tempId = -Date.now();

      const optimistic: MultiExpense = {
        id: tempId,
        title,
        description: message,
        category,
        total_amount: this.getTotalAmount(message),
        created_at: new Date().toISOString()
      };

      this.multiExpenseService.addOptimisticMultiExpense(optimistic);

      this.router.navigate(['/multi-view-expense']);

      const res = await firstValueFrom(
        this.multiExpenseService.createMultiExpense({
          title,
          description: message,
          category
        })
      );

      if (res?.success) {
        this.multiExpenseService.replaceOptimisticMultiExpense(tempId, res.data);
      }

      this.showToast('Added successfully', 'success');

    } catch {
      if (tempId !== null) {
        this.multiExpenseService.rollbackOptimisticMultiExpense(tempId);
      }
      this.showToast('Failed to save expense', 'danger');
    } finally {
      this.isProcessing = false;
    }
  }

  /* ================= HELPERS ================= */
  getTotalAmount(message: string): number {
    const matches: string[] = [];
    const currencyPattern = /(?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi;
    let match: RegExpExecArray | null;

    while ((match = currencyPattern.exec(message)) !== null) {
      matches.push(match[1]);
    }

    if (!matches.length) {
      matches.push(...(message.match(/\b[0-9,]+(?:\.[0-9]{1,2})?\b/g) || []));
    }

    return matches.reduce((sum, value) => sum + Number(value.replace(/,/g, '')), 0);
  }

  get totalPreview(): number {
    return this.getTotalAmount(this.multiForm.get('message')?.value || '');
  }

  showError(field: string): boolean {
    const control = this.multiForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  async showToast(message: string, color: any = 'primary') {
    await this.uiToast.show(message, color);
  }
}
