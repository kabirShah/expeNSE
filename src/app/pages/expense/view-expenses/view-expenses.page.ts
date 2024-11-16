import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = [];
  data: any[] = [];

  constructor(private databaseService: DatabaseService,private alertController: AlertController) {}

  ngOnInit() {
    this.loadExpenses();
  }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  loadExpenses() {
    // Retrieve the expenses array from localStorage
    this.databaseService.getAllExpenses().then((data) => {
      this.expenses = data;
    });
  }

  saveExpenses() {
    // Save the updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  deleteExpense(id: string) {
    this.databaseService.deleteExpense(id).then(() => {
      this.loadExpenses();
    });
  }

  editExpense(expense: any) {
    // Implement navigation to the edit page, passing the expense as a parameter
    console.log('Edit Expense:', expense);
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses);
    const workbook: XLSX.WorkBook = {
      Sheets: { Expenses: worksheet },
      SheetNames: ['Expenses'],
    };
    XLSX.writeFile(workbook, 'expenses.xlsx');
  }
}
