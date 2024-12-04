import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as HighCharts from 'highcharts';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
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
    this.updateCharts();
    this.filterExpenses();
    this.createManualChart();
    this.createAutoChart();
  }
  async initFilters(){
    this.categories = ['All', ...new Set(this.manualExpenses.map((expense) => expense.category))];
    // Set the default month to the current month
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.getMonthName(currentMonthIndex);
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
  isExpenseInMonth(expenseDate: string, month: string, year: number): boolean {
    const expenseDateObj = new Date(expenseDate);
    return (
      expenseDateObj.getMonth() + 1 === parseInt(month) && 
      expenseDateObj.getFullYear() === year
    );
  }
  async loadExpenses(){
    this.manualExpenses = await this.db.getAllManualExpenses();
    this.filteredManualExpenses = [...this.manualExpenses];
    this.autoExpenses = await this.db.getAllAutoExpenses();
  }
  // async fetchExpensesData() {
  //   try {
  //     // Replace the URL with your actual backend API endpoint
  //     const response: any = await this.http.get('http://localhost:3000/api/expenses').toPromise();
  //     this.manualExpenses = response; // Assign the fetched data
  //   } catch (error) {
  //     console.error('Error fetching expenses data:', error);
  //   }
  // }
  createManualChart() {
    const categories = this.filteredManualExpenses.map(expense => expense.category);
    const amounts = this.filteredManualExpenses.map(expense => expense.amount);

    HighCharts.chart('manualExpensesContainer', {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Manual Expenses Analytics',
        align: 'left',
      },
      subtitle: {
        text: `Source: Local Data (${this.getSelectedMonthName()})`,
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'Expense Categories',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total Amount Spent',
        },
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
    const categories = this.filteredAutoExpenses.map((expense) => expense.category);
    const amounts = this.filteredAutoExpenses.map((expense) => expense.amount);
  
    HighCharts.chart('autoExpensesContainer', {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Auto Expenses Analytics',
        align: 'left',
      },
      subtitle: {
        text: `Source: Local Data (${this.getSelectedMonthName()})`,
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'Expense Categories',
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total Amount Spent',
        },
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

  updateCharts() {
    const categories = this.filteredManualExpenses.map((expense) => expense.category);
    const amounts = this.filteredManualExpenses.map((expense) => expense.amount);
    HighCharts.chart('manualcontainer', {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Expenses by Category',
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'Categories',
        },
      },
      yAxis: {
        title: {
          text: 'Total Amount',
        },
      },
      series: [
        {
          name: 'Expenses',
          data: amounts,
        },
      ] as HighCharts.SeriesColumnOptions[],
    });
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
  
  applyFilters() {
    const today = new Date();
    const selectedMonthIndex = this.getMonthNameIndex(this.selectedMonth);
    const startOfMonth = new Date(today.getFullYear(), selectedMonthIndex, 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), selectedMonthIndex + 1, 0).toISOString();

    this.filteredManualExpenses = this.manualExpenses.filter((expense) => {
      const isInMonth = this.isExpenseInDateRange(expense.date, startOfMonth, endOfMonth);
      const isInCategory =
        this.selectedCategory === 'All' || expense.category === this.selectedCategory;

      return isInMonth && isInCategory;
    });

    this.updateCharts();
  }

}
