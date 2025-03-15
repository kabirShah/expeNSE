import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as HighCharts from 'highcharts';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.page.html',
    styleUrls: ['./analytics.page.scss'],
    standalone: false
})
export class AnalyticsPage implements AfterViewInit {
  manualExpenses: any[] = [];
  autoExpenses: any[] = [];
  filteredManualExpenses: any[]=[];
  filteredAutoExpenses: any[]=[];
  selectedMonth:string ='';
  selectedYear:number=new Date().getFullYear();
  categories: string[] = [];
  selectedCategory: string = 'All';

  months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];

  constructor(public navCtrl: NavController, private db:DatabaseService, private http: HttpClient) {}

  async ngAfterViewInit() {
    await this.loadExpenses();
    this.initFilters();
    this.filterExpenses();
    this.createManualChart();
    this.createAutoChart();
    this.applyFilters();
  }
  async initFilters(){
    this.categories = ['All', ...new Set(this.manualExpenses.map((expense) => expense.category))];
    // Set the default month to the current month
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.getMonthName(currentMonthIndex);
  }
  applyFilters() {
    const startOfMonth = new Date(this.selectedYear, this.getMonthNameIndex(this.selectedMonth), 1).toISOString();
    const endOfMonth = new Date(this.selectedYear, this.getMonthNameIndex(this.selectedMonth) + 1, 0).toISOString();
  
    this.filteredManualExpenses = this.filterExpensesByDateAndCategory(this.manualExpenses, startOfMonth, endOfMonth);
    this.filteredAutoExpenses = this.filterExpensesByDateAndCategory(this.autoExpenses, startOfMonth, endOfMonth);
  
    this.createManualChart(); // Redraw chart
    this.createAutoChart();   // Redraw chart
  }
  filterExpensesByDateAndCategory(expenses: any[], start: string, end: string) {
    return expenses.filter(expense => 
      this.isExpenseInDateRange(expense.date, start, end) &&
      (this.selectedCategory === 'All' || expense.category === this.selectedCategory)
    );
  }
  isExpenseInMonth(expenseDate: string, month: string, year: number): boolean {
    const expenseDateObj = new Date(expenseDate);
    console.log('Expense Date:', expenseDateObj, 'Month:', month, 'Year:', year);
    return (
      expenseDateObj.getMonth() + 1 === parseInt(month) && 
      expenseDateObj.getFullYear() === year
    );
  }
  getMonthName(monthIndex: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[monthIndex];
  }
  async filterExpenses(){
    if (!this.selectedMonth || !this.selectedYear) {
      console.warn('Month or Year not selected!');
      return;
    }
  
    // Filter manual expenses
    this.filteredManualExpenses = this.manualExpenses.filter((expense) =>
      this.isExpenseInMonth(expense.date, this.selectedMonth, this.selectedYear)
    );
  
    // Filter auto expenses
    this.filteredAutoExpenses = this.autoExpenses.filter((expense) =>
      this.isExpenseInMonth(expense.date, this.selectedMonth, this.selectedYear)
    );
  
    console.log('Filtered Manual Expenses:', this.filteredManualExpenses);
    console.log('Filtered Auto Expenses:', this.filteredAutoExpenses);
  
    // Refresh the charts
    this.createManualChart();
    this.createAutoChart();
  }

  async loadExpenses(){
    try {
      this.manualExpenses = await this.db.getAllManualExpenses();
      console.log('Manual Expenses:', this.manualExpenses);
      this.autoExpenses = await this.db.getAllAutoExpenses();
      console.log('Auto Expenses:', this.autoExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }
  createManualChart() {
    const groupedExpenses = this.groupExpensesByCategory(this.filteredManualExpenses);
    const categories = Object.keys(groupedExpenses);
    const amounts = Object.values(groupedExpenses);
  
    HighCharts.chart('manualExpensesContainer', {
      chart: { type: 'column' },
      title: { text: 'Manual Expenses Analytics', align: 'left' },
      subtitle: { text: `Source: Local Data (${this.getSelectedMonthName()})` },
      xAxis: {
        categories,
        title: { text: 'Expense Categories' },
      },
      yAxis: {
        min: 0,
        title: { text: 'Total Amount Spent' },
      },
      series: [
        {
          name: 'Manual Expenses',
          data: amounts,
        },
      ] as HighCharts.SeriesColumnOptions[],
    });
  }
  
  createAutoChart(){
    const groupedExpenses = this.groupExpensesByCategory(this.filteredAutoExpenses);
  const categories = Object.keys(groupedExpenses);
  const amounts = Object.values(groupedExpenses);

  HighCharts.chart('autoExpensesContainer', {
    chart: { type: 'column' },
    title: { text: 'Auto Expenses Analytics', align: 'left' },
    subtitle: { text: `Source: Local Data (${this.getSelectedMonthName()})` },
    xAxis: {
      categories,
      title: { text: 'Expense Categories' },
    },
    yAxis: {
      min: 0,
      title: { text: 'Total Amount Spent' },
    },
    series: [
      {
        name: 'Auto Expenses',
        data: amounts,
      },
    ] as HighCharts.SeriesColumnOptions[],
  });
  }

  getMonthNameIndex(monthName: string): number {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames.indexOf(monthName);
  }

  isExpenseInDateRange(date: string, start: string, end: string): boolean {
    const expenseDate = new Date(date).getTime();
    return expenseDate >= new Date(start).getTime() && expenseDate <= new Date(end).getTime();
  }

  getSelectedMonthName(): string {
    const month = this.months.find(m => m.value === this.selectedMonth);
    return month ? month.name : '';
  }
  getUniqueCategories(): string[] {
    const categories = [
      ...this.manualExpenses.map((e) => e.category),
      ...this.autoExpenses.map((e) => e.category),
    ];
    return [...new Set(categories)];
  }
  groupExpensesByCategory(expenses: any[]) {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
  }
  


}
