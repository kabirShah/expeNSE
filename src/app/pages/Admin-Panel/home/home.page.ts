import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Balance } from 'src/app/models/balance.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  email: any;
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();
  
  totalTodayExpense: number = 0;
  totalMonthExpense: number = 0;
  totalYearExpense: number = 0;
  totalBalance: number = 0;
  creditTotal: number = 0;
  debitTotal: number = 0;
  userBalance: number = 0;
  monthSaving: number = 0;
  yearSaving: number = 0;
  balances: Balance[] = [];

  constructor(
    private router: Router,
    private db: DatabaseService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.currentMonth = this.getMonthName(new Date().getMonth());
    console.log('Current Month:', this.currentMonth);
    
    await this.loadBalance();
    await this.loadExpenses();
    this.calculateSavings();
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Unknown';
  }

  async loadBalance() {
    try {
      const balanceDocs: Balance[] = await this.db.getAllBalances();
      if (balanceDocs.length > 0) {
        this.totalBalance = balanceDocs.reduce((sum, record) => sum + (record.balance || 0), 0);
        this.userBalance = this.totalBalance - this.totalMonthExpense;
        this.balances = balanceDocs.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); // Sort by date
      } else {
        this.totalBalance = 0;
        this.userBalance = 0;
        this.balances = [];
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }
  
  

  async loadExpenses() {
    const manualExpenses = await this.db.getAllManualExpenses();
    const todayStr = new Date().toISOString().split('T')[0];

    this.totalTodayExpense = this.sumExpenses(manualExpenses.filter(exp => exp.date.startsWith(todayStr)));
    this.totalMonthExpense = this.sumExpenses(manualExpenses, 'month');
    this.totalYearExpense = this.sumExpenses(manualExpenses, 'year');

    await this.calculateCreditsAndDebits();
  }

  async calculateCreditsAndDebits() {
    const credits = await this.db.getAllCredits();
    const debits = await this.db.getAllExpenses();

    this.creditTotal = this.sumExpenses(credits);
    this.debitTotal = this.sumExpenses(debits);
    this.userBalance = this.creditTotal - this.debitTotal;
  }

  sumExpenses(expenses: any[], filter?: 'month' | 'year'): number {
    const now = new Date();
    return expenses.reduce((sum, expense) => {
      const date = new Date(expense.date);
      if (!filter || 
         (filter === 'month' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) ||
         (filter === 'year' && date.getFullYear() === now.getFullYear())) {
        return sum + (expense?.amount || 0);
      }
      return sum;
    }, 0);
  }

  calculateSavings() {
    this.monthSaving = this.totalBalance - this.totalMonthExpense;
    this.yearSaving = this.totalBalance - this.totalYearExpense;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
