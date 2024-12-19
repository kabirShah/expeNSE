import { Component, OnInit } from '@angular/core';
import { ExpenseParserService } from '../../../../services/expense-parser.service';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-multi-expense',
  templateUrl: './multi-expense.page.html',
  styleUrls: ['./multi-expense.page.scss'],
})
export class MultiExpensePage implements OnInit{
  multiForm!: FormGroup;
  isProcessing: boolean = false;
  expenseId: string | null = null;
  message: string = '';

  constructor(
    private expenseParserService: ExpenseParserService,
    private toastCtrl: ToastController,
    private db: DatabaseService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.multiForm = this.fb.group({
      message:['',Validators.required]
    });
  }
  async ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.loadExpense(this.expenseId);
    }
  }
  async loadExpense(id: string) {
    try {
      const expense = await this.db.getAutoExpense('dropDatabase', id);
      if (expense) {
        this.multiForm.patchValue({
          message: expense.description, // Assuming "description" holds the message
        });
      }
    } catch (error) {
      console.error('Error loading expense:', error);
    }
  }
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  async submitMessage() {
    if (this.multiForm.invalid || this.isProcessing) {
      this.showToast('Please enter a valid message.');
      return;
    }

    this.isProcessing = true;
    const message = this.multiForm.value.message.trim();

    try {
      if (this.expenseId) {
        // Update existing expense
        const updatedExpense = {
          _id: this.expenseId,
          description: message,
        };
        await this.db.updateAutoExpense(updatedExpense);
        this.showToast('Expense updated successfully!');
      } else {
        // Add a new expense
        await this.expenseParserService.parseMessageAndSave(message);
        this.showToast('Expense added successfully!');
      }
      this.multiForm.reset(); // Reset form on success
      this.router.navigate(['/multi-view-expense']);
    } catch (error) {
      console.error('Error saving expense:', error);
      this.showToast('Failed to save expense. Please try again.');
    } finally {
      this.isProcessing = false;
    }
    
  }
}
