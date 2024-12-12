import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Expense } from '../../../models/expense.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { File } from "@ionic-native/file/ngx";
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './single-view-expenses.page.html',
})
export class SingleViewExpensesPage implements OnInit {
  manualExpenses: any[] = [];
  arr:any[]=[];
  expenses: any[] = [];
  data: any[] = [];

  constructor(
    private navCtrl: NavController,
    private db: DatabaseService,
    private file:File,
    private alertController: AlertController,
    private router: Router) {
  }

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
    this.navCtrl.navigateForward('/single-expense', {
      state: { expense },
    });
    console.log('Edit Expense:', expense);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/single-expense']);
  }

}
