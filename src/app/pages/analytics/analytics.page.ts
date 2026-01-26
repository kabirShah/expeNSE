import { Component, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements AfterViewInit {

  /* ===============================
     STATE
     =============================== */
  isLoading = true;
  hasError = false;
  hasData = false;
  apiTimeMs = 0;

  /* ===============================
     DATA
     =============================== */
  manualExpenses: any[] = [];
  autoExpenses: any[] = [];
  filteredManualExpenses: any[] = [];
  filteredAutoExpenses: any[] = [];

  /* ===============================
     FILTERS
     =============================== */
  selectedMonthIndex = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  categories: string[] = ['All'];
  selectedCategory = 'All';

  /* ===============================
     METRICS
     =============================== */
  totalSpent = 0;
  manualTotal = 0;
  autoTotal = 0;

  /* ===============================
     INSIGHT
     =============================== */
  insightText = '';

  /* ===============================
     CHARTS
     =============================== */
  manualChart?: Highcharts.Chart;
  autoChart?: Highcharts.Chart;

  readonly monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  constructor(private db: DatabaseService) {}

  async ngAfterViewInit() {
    await this.fetchAnalytics();
  }

  /* ===============================
     MAIN FETCH
     =============================== */
  async fetchAnalytics() {
    this.isLoading = true;
    this.hasError = false;
    this.hasData = false;

    const startTime = performance.now();
    console.group('📊 Analytics API');

    try {
      if ((this.db as any).getAllManualExpenses) {
        console.log('➡️ Manual expenses');
        this.manualExpenses = await (this.db as any).getAllManualExpenses();
      }

      console.log('➡️ Auto expenses');
      this.autoExpenses = await this.db.getAllAutoExpenses();

      this.hasData =
        this.manualExpenses.length > 0 || this.autoExpenses.length > 0;

      this.initCategories();
      this.applyFilters();

      console.log('✅ Analytics loaded');

    } catch (err) {
      console.error('❌ Analytics failed', err);
      this.hasError = true;
    } finally {
      this.apiTimeMs = Math.round(performance.now() - startTime);
      this.isLoading = false;
      console.log(`⏱ API Time: ${this.apiTimeMs} ms`);
      console.groupEnd();
    }
  }

  retry() {
    this.fetchAnalytics();
  }

  /* ===============================
     FILTERING
     =============================== */
  applyFilters() {
    const start = new Date(this.selectedYear, this.selectedMonthIndex, 1);
    const end = new Date(this.selectedYear, this.selectedMonthIndex + 1, 0, 23, 59, 59);

    this.filteredManualExpenses = this.filter(this.manualExpenses, start, end);
    this.filteredAutoExpenses = this.filter(this.autoExpenses, start, end);

    this.calculateMetrics();
    this.renderCharts();
    this.generateInsight();
  }

  filter(list: any[], start: Date, end: Date) {
    return list.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end &&
        (this.selectedCategory === 'All' || e.category === this.selectedCategory);
    });
  }

  /* ===============================
     METRICS
     =============================== */
  calculateMetrics() {
    this.manualTotal = this.sum(this.filteredManualExpenses);
    this.autoTotal = this.sum(this.filteredAutoExpenses);
    this.totalSpent = this.manualTotal + this.autoTotal;
  }

  sum(list: any[]) {
    return list.reduce((t, i) => t + Number(i.amount || 0), 0);
  }

  /* ===============================
     CATEGORY
     =============================== */
  initCategories() {
    const set = new Set([
      ...this.manualExpenses.map(e => e.category),
      ...this.autoExpenses.map(e => e.category)
    ]);
    this.categories = ['All', ...Array.from(set)];
  }

  selectCategory(c: string) {
    this.selectedCategory = c;
    this.applyFilters();
  }

  /* ===============================
     MONTH NAV
     =============================== */
  prevMonth() {
    this.selectedMonthIndex === 0
      ? (this.selectedMonthIndex = 11, this.selectedYear--)
      : this.selectedMonthIndex--;
    this.applyFilters();
  }

  nextMonth() {
    this.selectedMonthIndex === 11
      ? (this.selectedMonthIndex = 0, this.selectedYear++)
      : this.selectedMonthIndex++;
    this.applyFilters();
  }

  get selectedMonthName() {
    return this.monthNames[this.selectedMonthIndex];
  }

  /* ===============================
     CHARTS
     =============================== */
  renderCharts() {
    this.manualChart?.destroy();
    this.autoChart?.destroy();

    this.manualChart = Highcharts.chart('manualExpensesContainer', {
      chart: { type: 'column' },
      accessibility: { enabled: false },
      title: { text: 'Manual Expenses' },
      series: [{
        type: 'column',
        name: 'Manual',
        data: Object.values(this.group(this.filteredManualExpenses))
      }]
    });

    this.autoChart = Highcharts.chart('autoExpensesContainer', {
      chart: { type: 'column' },
      accessibility: { enabled: false },
      title: { text: 'Auto Expenses' },
      series: [{
        type: 'column',
        name: 'Auto',
        data: Object.values(this.group(this.filteredAutoExpenses))
      }]
    });
  }

  group(list: any[]) {
    return list.reduce((a, e) => {
      a[e.category] = (a[e.category] || 0) + Number(e.amount);
      return a;
    }, {});
  }

  /* ===============================
     INSIGHT
     =============================== */
  generateInsight() {
    if (!this.totalSpent) {
      this.insightText = '';
      return;
    }

    this.insightText =
      this.manualTotal > this.autoTotal
        ? 'Manual spending dominates this month.'
        : 'Recurring expenses dominate this month.';
  }
}
