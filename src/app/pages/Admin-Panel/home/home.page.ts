import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  expenses: any[] = [];
  data: any[] = [];

  constructor(private router: Router) {}

  navigateToViewExpenses() {
    this.router.navigate(['/view-expenses']);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/add-expense']);
  }
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expenses': worksheet },
      SheetNames: ['Expenses']
    };
    XLSX.writeFile(workbook, 'expenses.xlsx');
  }
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('Selected file:', file);
      // Add logic to process the file as needed
    }
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
