import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
})
export class BudgetPage implements OnInit {
  budgets: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.api.getBudgets().subscribe({
      next: (res) => {
        this.budgets = Array.isArray(res) ? res : (res?.data || []);
      }
    });
  }

  getProgressColor(pct: number): string {
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warning';
    return 'success';
  }
}
