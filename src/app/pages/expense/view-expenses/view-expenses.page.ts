import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Expense } from '../../../models/expense.model';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  manualExpenses: any[] = [];

  expenses: any[] = [];
  data: any[] = [];

  constructor(private navCtrl: NavController,private db: DatabaseService,private alertController: AlertController) {}

  ngOnInit() {
    this.loadManualExpenses();
  }

  ionViewWillEnter() {
    this.loadManualExpenses();
  }

  async loadManualExpenses() {
    // Retrieve the expenses array from localStorage
    this.manualExpenses = await this.db.getAllManualExpenses();
  }

  async deleteExpense(id: string) {
    await this.db.deleteManualExpense(id);
    this.loadManualExpenses();
  }


  editExpense(expense: any) {
    // Implement navigation to the edit page, passing the expense as a parameter
    this.navCtrl.navigateForward('/add-expense', {
      state: { expense },
    });
    console.log('Edit Expense:', expense);
  }

  exportToExcel() {

  }
}
