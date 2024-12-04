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
    this.filterExpenses();
    this.createManualChart();
    this.createAutoChart();
  }
  
  async filterExpenses(){
    this.filteredManualExpenses = this.manualExpenses.filter(expense=>
      this.isExpenseInMonth(expense.date, this.selectedMonth, this.selectedYear)
    );
    this.filteredAutoExpenses = this.autoExpenses.filter(expense=>
      this.isExpenseInMonth(expense.date, this.selectedMonth, this.selectedYear)
    )
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
    const categories = this.filteredAutoExpenses.map(expense => expense.category);
    const amounts = this.filteredAutoExpenses.map(expense => expense.amount);

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
}
