import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  reports: any[] = [];
  isLoading = false;
  currentReport: any = null;

  reportTypes = [
    { type: 'weekly', label: 'This Week', icon: 'calendar-outline' },
    { type: 'monthly', label: 'This Month', icon: 'calendar' },
    { type: 'half_yearly', label: 'Last 6 Months', icon: 'stats-chart' },
    { type: 'custom', label: 'Custom', icon: 'options' },
  ];

  customFrom = '';
  customTo = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.api.getReports().subscribe({
      next: (res) => {
        this.reports = res?.data || res?.report || [];
      }
    });
  }

  generate(type: string): void {
    const payload: any = { type };
    if (type === 'custom') {
      payload.date_from = this.customFrom;
      payload.date_to = this.customTo;
    }

    this.isLoading = true;
    this.api.generateReport(payload).subscribe({
      next: (res) => {
        this.currentReport = res?.data || null;
        this.loadReports();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
