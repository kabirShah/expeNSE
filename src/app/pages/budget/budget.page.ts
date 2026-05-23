import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { LocalFinanceService } from 'src/app/services/local-finance.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
})
export class BudgetPage implements OnInit {
  budgets: any[] = [];

  constructor(
    private api: ApiService,
    private localFinance: LocalFinanceService,
    private userPreferences: UserPreferencesService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    if (this.userPreferences.isDeviceOnlyMode()) {
      this.budgets = this.localFinance.getBudgets();
      return;
    }

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
