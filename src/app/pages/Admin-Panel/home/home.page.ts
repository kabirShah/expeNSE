import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
  debitTotal: number = 0;
  creditTotal: number = 0;
  userBalance: number = 0;
  isCreditAdded: boolean = false;

  constructor(
    private router: Router,
    private db: DatabaseService,
    private alertCtrl: AlertController) {}

    async ngOnInit() {
      await this.calculateTotalExpense();
    }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  async calculateTotalExpense(){
    const autoExpenses = await this.db.getAllAutoExpenses(); // Replace this with your database fetch method
    const manualExpenses = await this.db.getAllManualExpenses();
    this.totalAutoExpense = autoExpenses.reduce((sum,expense)=>sum+expense.amount,0);
    this.totalManualExpense = manualExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.grandTotalExpense = this.totalManualExpense + this.totalAutoExpense;
    console.log("Grand total: "+this.grandTotalExpense);
    //Calculate debits and credits
    await this.calculateTotalCredits();
    this.debitTotal = await this.calculateTotalDebits(); // Assuming expenses are debits
    this.userBalance = this.creditTotal - this.debitTotal;

    // if (this.userBalance <= 0) {
    //   console.error('No sufficient credit available. Please add more!');
    //   await this.askForCredit();
    // } else {
    //   console.log('Calculation successful! Current Balance:', this.userBalance);
    // }
   }

   async calculateTotalCredits(){
    const credits = await this.db.getAllCredits();
    this.creditTotal = credits.reduce((sum, credit) => sum + credit.amount, 0);
   }
   async calculateTotalDebits() {
    const expenses = await this.db.getAllExpenses(); // Mock method
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

   async loadExpenses() {
    const manualExpenses = await this.db.getAllManualExpenses();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    // Retrieve the expenses array from localStorage
    this.db.getAllManualExpenses().then((data) => {
      this.expenses = data;
    });
    
    const allExpenses = await this.db.getAllManualExpenses();
    console.log("All Expenses"+allExpenses);

    // Filter expenses for the current month
   
    this.currentMonthExpenses = manualExpenses.filter((expense) =>
      this.isExpenseInDateRange(expense.date, startOfMonth, endOfMonth)
    );
  

    // Calculate the total for the current month
    this.totalManualExpense = this.currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Update current month name
    this.totalManualExpense = this.currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    this.currentMonth = this.getMonthName(today.getMonth());
  
    // Update balance after loading expenses
    await this.calculateTotalExpense();
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

  async addSplit(){
    this.router.navigate(['/split']);
  }
  navigateToViewExpenses() {
    this.router.navigate(['/single-view-expenses']);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/single-expense']);
  }
  navigateToMultiExpense(){
    this.router.navigate(['/multi-expense']);
  }
  navigateToViewDrop(){
    this.router.navigate(['/multi-view-expense']);
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
