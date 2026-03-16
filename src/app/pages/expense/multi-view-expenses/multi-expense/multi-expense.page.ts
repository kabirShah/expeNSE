import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MultiExpenseService, MultiExpense } from 'src/app/services/multi-expense.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-multi-expense',
  templateUrl: './multi-expense.page.html',
  styleUrls: ['./multi-expense.page.scss'],
})
export class MultiExpensePage implements OnInit {
  multiForm!: FormGroup;
  isProcessing = false;
  pageLoading = false;
  expenseId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private uiToast: UiToastService,
    private multiExpenseService: MultiExpenseService,
    private router: Router,
    private route: ActivatedRoute,
    private mockNotificationService: MockNotificationService
  ) {
    this.multiForm = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      category: ['Miscellaneous']
    });
  }

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.isEditMode = true;
      this.loadExpense(this.expenseId);
    }
  }

  async loadExpense(id: string) {
    this.pageLoading = true;
    try {
      const response = await this.multiExpenseService.getMultiExpenseById(id).toPromise();
      if (response && response.success) {
        const exp = response.data;
        this.multiForm.patchValue({
          title: exp.title || '',
          message: exp.description || '',
          category: exp.category || 'Miscellaneous'
        });
      }
    } catch (error) {
      console.error('Error loading multi-expense:', error);
      this.showToast('Failed to load expense details.');
    } finally {
      this.pageLoading = false;
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'primary') {
    await this.uiToast.show(message, color);
  }

  async submitForm() {
    if (this.multiForm.invalid) {
      this.showToast('Please fill all required fields.', 'warning');
      return;
    }

    this.isProcessing = true;
    const { title, message, category } = this.multiForm.value;

    try {
      if (this.isEditMode && this.expenseId) {
        const updatedExpense: MultiExpense = {
          title,
          description: message,
          category
        };

        await this.multiExpenseService.updateMultiExpense(this.expenseId, updatedExpense).toPromise();
        this.mockNotificationService.addCrudNotification(
          'Multi Expense',
          'updated',
          `${title || 'Multi expense'} was updated.`
        );
        this.showToast('Multi-expense updated successfully!', 'success');
      } else {
        const newExpense: MultiExpense = {
          title,
          description: message,
          category
        };

        await this.multiExpenseService.createMultiExpense(newExpense).toPromise();
        this.mockNotificationService.addCrudNotification(
          'Multi Expense',
          'created',
          `${title || 'Multi expense'} was created.`
        );
        this.showToast('Multi-expense added successfully!', 'success');
      }

      this.multiForm.reset();
      this.router.navigate(['/multi-view-expense']);
    } catch (error) {
      console.error('Error saving expense:', error);
      this.showToast('Failed to save expense. Please try again.', 'danger');
    } finally {
      this.isProcessing = false;
    }
  }
}
