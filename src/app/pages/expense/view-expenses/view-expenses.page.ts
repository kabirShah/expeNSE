import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = [];

  constructor(private dbService: DatabaseService, private navCtrl: NavController) {}

  async ngOnInit() {
    this.expenses = await this.dbService.getAllExpenses();
  }

  async deleteExpense(id: number) {
    await this.dbService.deleteExpense(id);
    this.expenses = await this.dbService.getAllExpenses();
  }

  editExpense(expense: any) {
    this.navCtrl.navigateForward(`/edit-expense/${expense.id}`);
  }
}
