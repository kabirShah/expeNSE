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

  totalExpense: number = 0;            // Total for ALL items
  totalFilteredAmount: number = 0;     // Total AFTER filters
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

        // Total of ALL multi expenses
        this.totalExpense = this.multiExpenses.reduce(
          (sum, e) => sum + Number(e.total_amount ?? 0),
          0
        );

        this.applyFilters();
      }

    } catch (error) {
      console.error('Error loading multi-expenses:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredExpenses = this.multiExpenses.filter((exp) => {
      let matchesSearch = true;
      let matchesMonth = true;

      // SEARCH FILTER
      if (this.searchTerm) {
        const s = this.searchTerm.toLowerCase();
        matchesSearch =
          exp.title.toLowerCase().includes(s) ||
          (exp.description?.toLowerCase().includes(s) ?? false);
      }

      // MONTH FILTER
      if (this.selectedMonth !== 'all') {
        const expenseMonth = exp.created_at
          ? new Date(exp.created_at).toLocaleString('default', { month: 'long' })
          : '';

        matchesMonth = expenseMonth === this.selectedMonth;
      }

      return matchesSearch && matchesMonth;
    });

    // Total for filtered results
    this.totalFilteredAmount = this.filteredExpenses.reduce(
      (sum, e) => sum + Number(e.total_amount ?? 0),
      0
    );

    console.log("Filtered total:", this.totalFilteredAmount);
  }

  trackById(index: number, item: MultiExpense) {
    return item.id;
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
