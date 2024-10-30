import { Component } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
})
export class AddExpensePage {
  expense = {
    date: '',
    category: '',
    transactionType: '',
    description: '',
    amount: 0,
    notes: ''
  };

  constructor(private navCtrl: NavController) {}

  async addExpense() {
    this.navCtrl.navigateBack('/view-expenses');
  }
}
