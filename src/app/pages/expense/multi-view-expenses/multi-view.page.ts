import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MultiExpense, MultiExpenseService } from 'src/app/services/multi-expense.service';

@Component({
  selector: 'app-multi-view',
  templateUrl: './multi-view.page.html',
  styleUrls: ['./multi-view.page.scss'],
})
export class MultiViewPage implements OnInit {

  multiExpenses: MultiExpense[] = [];
  filteredExpenses: MultiExpense[] = [];
  searchTerm: string = '';
  selectedMonth: string = 'all';
  totalFilteredAmount: number = 0;
  loading: boolean = false;

  constructor(
    private router: Router,
    private multiExpenseService: MultiExpenseService
  ) {}

  ngOnInit() {
    this.loadAutoExpenses();
  }

  async loadAutoExpenses() {
    this.loading = true;
    try {
      const response = await this.multiExpenseService.getMultiExpenses().toPromise();
      if (response && response.success) {
        this.multiExpenses = response.data;
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error loading multi-expenses:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredExpenses = this.multiExpenses.filter((multiExpense) => {
      let matchesSearch = true;
      let matchesMonth = true;

      // 🔍 Apply Search Filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matchesSearch =
          multiExpense.title.toLowerCase().includes(searchLower) ||
          (multiExpense.description?.toLowerCase().includes(searchLower) ?? false);
      }

      // 📅 Apply Month Filter
      if (this.selectedMonth && this.selectedMonth !== 'all') {
        const expenseMonth = new Date(multiExpense.created_at || '').toLocaleString('default', { month: 'long' });
        matchesMonth = expenseMonth === this.selectedMonth;
      }

      return matchesSearch && matchesMonth;
    });

    // 💰 Calculate total after filtering
    this.totalFilteredAmount = this.filteredExpenses.reduce(
      (sum, exp) => sum + (exp.total_amount || 0),
      0
    );
  }

  async editAutoExpense(id: number | string) {
    await this.router.navigate([`/multi-expense/${id}`]);
  }

  async deleteAutoExpense(id: number | string) {
    try {
      await this.multiExpenseService.deleteMultiExpense(String(id)).toPromise();
      await this.loadAutoExpenses();
    } catch (error) {
      console.error('Error deleting multi-expense:', error);
    }
  }

  navigateToMultiExpense() {
    this.router.navigate(['/multi-expense']);
  }
}
