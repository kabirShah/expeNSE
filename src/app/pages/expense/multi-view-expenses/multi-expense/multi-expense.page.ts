import { Component } from '@angular/core';
import { ExpenseParserService } from '../../../../services/expense-parser.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-multi-expense',
  templateUrl: './multi-expense.page.html',
  styleUrls: ['./multi-expense.page.scss'],
})
export class MultiExpensePage {
  message: string = '';
  multiForm!:FormGroup;

  constructor(
    private expenseParserService: ExpenseParserService,
    private toastCtrl: ToastController,
    private fb:FormBuilder,
    private router: Router
  ) {
    this.multiForm = this.fb.group({
      message:['',Validators.required]
    });
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
    if (this.multiForm.valid) {
      const message = this.multiForm.value.message; // Get the message from the form
      try {
        await this.expenseParserService.parseMessageAndSave(message);
        this.message = ''; // Clear input field
        this.showToast('Expense saved successfully!');
        this.router.navigate(['/view-drop']);
      } catch (error) {
        this.showToast('Invalid message format. Please try again.');
      }
    }

  }
}
