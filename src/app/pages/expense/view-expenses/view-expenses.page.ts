import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = []; 
  data: any[] = [];
  ngOnInit() {
    this.loadExpenses();
  }
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expenses': worksheet },
      SheetNames: ['Expenses']
    };
    XLSX.writeFile(workbook, 'expenses.xlsx');
  }
  loadExpenses(){
    // Retrieve the expenses array from localStorage
    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    this.expenses = storedExpenses;
  }
  ionViewWillEnter() {
    this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  }
}
