import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  email :any;
  expenses: any[] = [];
  data: any[] = [];
  currentMonthExpenses: any[] = []; // Filtered expenses for the current month
  monthlyLimit: number = 2000; // Default monthly limit (can be dynamic)
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();  
  totalManualExpense: number = 0; // Total manual monthly expenses
  totalAutoExpense: number = 0; // Total auto monthly expenses
  grandTotalExpense: number = 0;
  
  constructor(
    private router: Router,
    private db: DatabaseService) {}

    async ngOnInit() {
      await this.calculateTotalExpense();
      // this.authService.getProfile().then(user => {
      //   this.email = user?.email;
      //   console.log(user?.email);
      // }).catch(error => {
      //   console.error('Error getting user profile:', error);
      // });
    }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  async calculateTotalExpense(){
    const expenses = await this.db.getAllAutoExpenses(); // Replace this with your database fetch method
    this.totalAutoExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log('Total Auto Expense:', this.totalAutoExpense); // Debugging log
    this.grandTotalExpense = this.totalManualExpense + this.totalAutoExpense;
   }
  async loadExpenses() {
    // Retrieve the expenses array from localStorage
    this.db.getAllManualExpenses().then((data) => {
      this.expenses = data;
    });
    
    const allExpenses = await this.db.getAllManualExpenses();

    // Filter expenses for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    this.currentMonthExpenses = allExpenses.filter((expense) =>
      this.isExpenseInDateRange(expense.date, startOfMonth, endOfMonth)
    );

    // Calculate the total for the current month
    this.totalManualExpense = this.currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Update current month name
    this.currentMonth = this.getMonthName(today.getMonth());
  }
  isExpenseInDateRange(date: string, start: string, end: string): boolean {
    const expenseDate = new Date(date).getTime();
    return expenseDate >= new Date(start).getTime() && expenseDate <= new Date(end).getTime();
  }

  getMonthName(monthIndex: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[monthIndex];
  }
  navigateToViewExpenses() {
    this.router.navigate(['/view-expenses']);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/add-expense']);
  }
  navigateToDrop(){
    this.router.navigate(['/drop-expense']);
  }
  navigateToViewDrop(){
    this.router.navigate(['/view-drop']);
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
  // signOut(){
  //   console.log("Signout")
  //   this.authService.signOut().then(()=>{
  //     this.router.navigate(['login']);
  //   })
  // }
}
