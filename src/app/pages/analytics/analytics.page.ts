import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {

  isLoading = false;
  hasError = false;
  errorMessage = '';
  private pendingRequests = 0;
  private failedRequests = 0;

  totalExpense: number = 0;
  totalMultiExpense: number = 0;
  totalSpend: number = 0;
  currentBalance: number = 0;

  /* ================= SPENDING MIX DOUGHNUT ================= */
  spendingMixChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Single Expense', 'Multi Expense'],
    datasets: [{
      data: [0, 0]
    }]
  };

  /* ================= MONTHLY LINE (EXPENSE + MULTI) ================= */
  monthlyChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Single Expenses',
        fill: false,
        tension: 0.3
      },
      {
        data: [],
        label: 'Multi Expenses',
        fill: false,
        tension: 0.3
      }
    ]
  };

  /* ================= DAILY BAR (EXPENSE + MULTI) ================= */
  dailyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Single Expenses'
      },
      {
        data: [],
        label: 'Multi Expenses'
      }
    ]
  };

  /* ================= BALANCE TREND ================= */
  balanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Balance',
      fill: false,
      tension: 0.3
    }]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private uiToast: UiToastService
  ) {}

  ngOnInit() {
    this.loadAllAnalytics();
  }

  /* ================= LOAD ALL ================= */
  loadAllAnalytics() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.pendingRequests = 4;
    this.failedRequests = 0;

    this.loadSummary();
    this.loadMonthlyTrend();
    this.loadDailyTrend();
    this.loadBalanceTrend();
  }

  private markRequestDone(success: boolean) {
    if (!success) {
      this.failedRequests += 1;
    }

    this.pendingRequests -= 1;
    if (this.pendingRequests <= 0) {
      this.isLoading = false;
      if (this.failedRequests === 4) {
        this.hasError = true;
        this.errorMessage = 'Unable to load analytics data right now.';
        this.showToast('Failed to load analytics', 'danger');
      }
    }
  }

  /* ================= SUMMARY ================= */
  loadSummary() {
    this.analyticsService.getSummary().subscribe({
      next: (res) => {
        const expenseTotal = Number(res?.data?.expense_total || 0);
        const multiTotal = Number(res?.data?.multi_expense_total || 0);

        this.totalExpense = expenseTotal;
        this.totalMultiExpense = multiTotal;
        this.totalSpend = Number(res?.data?.total_spend || 0);
        this.currentBalance = Number(res?.data?.current_balance || 0);

        this.spendingMixChartData = {
          labels: ['Single Expense', 'Multi Expense'],
          datasets: [{
            data: [expenseTotal, multiTotal]
          }]
        };

        this.markRequestDone(true);
      },
      error: (err) => {
        console.error('Summary Error:', err);
        this.markRequestDone(false);
      }
    });
  }

  /* ================= MONTHLY TREND ================= */
  loadMonthlyTrend() {
    this.analyticsService.getMonthlyTrend().subscribe({
      next: (res) => {

        const data = res?.data || [];

        this.monthlyChartData = {
          labels: data.map((m: any) => m.label),
          datasets: [
            {
              data: data.map((m: any) => Number(m.expense_total)),
              label: 'Single Expenses',
              fill: false,
              tension: 0.3
            },
            {
              data: data.map((m: any) => Number(m.multi_expense_total)),
              label: 'Multi Expenses',
              fill: false,
              tension: 0.3
            }
          ]
        };

        this.markRequestDone(true);
      },
      error: (err) => {
        console.error('Monthly Trend Error:', err);
        this.markRequestDone(false);
      }
    });
  }

  /* ================= DAILY TREND ================= */
  loadDailyTrend() {
    this.analyticsService.getDailyTrend().subscribe({
      next: (res) => {

        const data = res?.data || [];

        this.dailyChartData = {
          labels: data.map((d: any) => `Day ${d.day}`),
          datasets: [
            {
              data: data.map((d: any) => Number(d.expense_total)),
              label: 'Single Expenses'
            },
            {
              data: data.map((d: any) => Number(d.multi_expense_total)),
              label: 'Multi Expenses'
            }
          ]
        };

        this.markRequestDone(true);
      },
      error: (err) => {
        console.error('Daily Trend Error:', err);
        this.markRequestDone(false);
      }
    });
  }

  /* ================= BALANCE TREND ================= */
  loadBalanceTrend() {
    this.analyticsService.getBalanceTrends().subscribe({
      next: (res) => {
        const data = res?.data || [];

        this.balanceChartData = {
          labels: data.map((b: any) => String(b.date_added || '').slice(0, 10)),
          datasets: [{
            data: data.map((b: any) => Number(b.amount)),
            label: 'Balance',
            fill: false,
            tension: 0.3
          }]
        };

        this.markRequestDone(true);
      },
      error: (err) => {
        console.error('Balance Trend Error:', err);
        this.markRequestDone(false);
      }
    });
  }

  retryLoad(): void {
    this.loadAllAnalytics();
  }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium'
  ): Promise<void> {
    await this.uiToast.show(message, color);
  }

}
