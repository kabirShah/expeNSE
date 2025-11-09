import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MultiExpenseService, MultiExpense } from 'src/app/services/multi-expense.service';

@Component({
  selector: 'app-multi-expense',
  templateUrl: './multi-expense.page.html',
  styleUrls: ['./multi-expense.page.scss'],
})
export class MultiExpensePage implements OnInit {
  multiForm!: FormGroup;
  isProcessing = false;
  expenseId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private multiExpenseService: MultiExpenseService,
    private router: Router,
    private route: ActivatedRoute
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
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
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
        // 🟢 UPDATE existing expense
        const updatedExpense: MultiExpense = {
          title,
          description: message,
          category
        };

        await this.multiExpenseService.updateMultiExpense(this.expenseId, updatedExpense).toPromise();
        this.showToast('Multi-expense updated successfully!', 'success');
      } else {
        // 🆕 CREATE new expense
        const newExpense: MultiExpense = {
          title,
          description: message,
          category
        };

        await this.multiExpenseService.createMultiExpense(newExpense).toPromise();
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
