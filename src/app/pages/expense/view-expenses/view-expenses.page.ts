import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = [];
  data: any[] = [];

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.loadExpenses();
  }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  loadExpenses() {
    // Retrieve the expenses array from localStorage
    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    this.expenses = storedExpenses;
  }

  saveExpenses() {
    // Save the updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  async editExpense(expense: any, index: number) {
    const alert = await this.alertController.create({
      header: 'Edit Expense',
      inputs: [
        { name: 'date', type: 'date', value: expense.date, placeholder: 'Date' },
        { name: 'category', type: 'text', value: expense.category, placeholder: 'Category' },
        { name: 'transactionType', type: 'text', value: expense.transactionType, placeholder: 'Type' },
        { name: 'description', type: 'text', value: expense.description, placeholder: 'Description' },
        { name: 'amount', type: 'number', value: expense.amount, placeholder: 'Amount' },
        { name: 'notes', type: 'text', value: expense.notes, placeholder: 'Notes' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            this.expenses[index] = { ...expense, ...data }; // Update the expense object
            this.saveExpenses(); // Save changes to localStorage
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteExpense(index: number) {
    const alert = await this.alertController.create({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            this.expenses.splice(index, 1); // Remove the selected expense
            this.saveExpenses(); // Save changes to localStorage
          },
        },
      ],
    });

    await alert.present();
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
