import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Expense } from '../../../models/expense.model';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = [];
  data: any[] = [];

  constructor(private navCtrl: NavController,private db: DatabaseService,private alertController: AlertController) {}

  ngOnInit() {
    this.loadExpenses();
  }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  loadExpenses() {
    // Retrieve the expenses array from localStorage
    this.db.getAllExpenses().then((data) => {
      this.expenses = data;
    });
  }

  saveExpenses() {
    // Save the updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  deleteExpense(id: string) {
    this.db.deleteExpense(id).then(() => {
      this.loadExpenses();
    });
  }


  editExpense(expense: any) {
    // Implement navigation to the edit page, passing the expense as a parameter
    this.navCtrl.navigateForward('/add-expense', {
      state: { expense },
    });
    console.log('Edit Expense:', expense);
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses);

    // Create a workbook and add the worksheet
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expenses': worksheet },
      SheetNames: ['Expenses'],
    };
  
    // Generate a buffer from the workbook
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    // Use FileSaver to save the file
    saveAs(blob, 'expenses.xlsx');
  }
}
