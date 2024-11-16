import { Component } from '@angular/core';
import { ExpenseParserService } from '../../../services/expense-parser.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-drop-expense',
  templateUrl: './drop-expense.page.html',
  styleUrls: ['./drop-expense.page.scss'],
})
export class DropExpensePage {
  message: string = '';

  constructor(
    private expenseParserService: ExpenseParserService,
    private toastController: ToastController
  ) {}

  async submitMessage() {
    try {
      await this.expenseParserService.parseMessageAndSave(this.message);
      this.message = ''; // Clear input field
      this.showToast('Expense saved successfully!');
    } catch (error) {
      this.showToast('Invalid message format. Please try again.');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
