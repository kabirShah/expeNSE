import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MultiExpense, MultiExpenseService, PaginatedMultiExpenseResponse } from 'src/app/services/multi-expense.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';

@Component({
  selector: 'app-multi-view',
  templateUrl: './multi-view.page.html',
  styleUrls: ['./multi-view.page.scss'],
})
export class MultiViewPage implements OnInit, OnDestroy {
  private readonly pageSize = 10;

  multiExpenses: MultiExpense[] = [];
  filteredExpenses: MultiExpense[] = [];

  searchTerm: string = '';
  selectedMonth: string = 'all';
  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  totalExpense: number = 0;
  totalFilteredAmount: number = 0;
  loading: boolean = false;
  loadingMore = false;
  hasMoreRecords = true;
  private currentPage = 1;
  private multiExpensesSub?: Subscription;

  constructor(
    private router: Router,
    private multiExpenseService: MultiExpenseService,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit() {
    this.multiExpensesSub = this.multiExpenseService.multiExpenses$.subscribe((items) => {
      this.multiExpenses = items || [];
      this.totalExpense = this.multiExpenses.reduce(
        (sum, e) => sum + Number(e.total_amount ?? 0),
        0
      );
      this.applyFilters();
    });

    if (this.multiExpenseService.getCachedMultiExpenses().length) {
      this.multiExpenses = this.multiExpenseService.getCachedMultiExpenses();
      this.totalExpense = this.multiExpenses.reduce(
        (sum, e) => sum + Number(e.total_amount ?? 0),
        0
      );
      this.applyFilters();
      this.refreshAutoExpenses();
      return;
    }

    this.loadAutoExpenses(true);
  }

  ionViewWillEnter() {
    if (!this.multiExpenses.length) {
      this.loadAutoExpenses(true);
      return;
    }

    this.refreshAutoExpenses();
  }

  ngOnDestroy() {
    this.multiExpensesSub?.unsubscribe();
  }

  async loadAutoExpenses(reset: boolean = false, event?: any) {
    if (reset) {
      this.currentPage = 1;
      this.hasMoreRecords = true;
      this.loading = !this.multiExpenses.length;
    } else if (!this.hasMoreRecords || this.loadingMore) {
      event?.target.complete();
      return;
    } else {
      this.loadingMore = true;
    }

    try {
      const page = reset ? 1 : this.currentPage + 1;
      const response = await this.multiExpenseService.getMultiExpenses(page, this.pageSize).toPromise();

      if (response && response.success) {
        const pagination = this.normalizePage(response.data);
        const nextExpenses = reset
          ? this.mergeExpenses(this.getOptimisticExpenses(), pagination.data)
          : this.mergeExpenses(this.multiExpenseService.getCachedMultiExpenses(), pagination.data);

        this.currentPage = pagination.current_page;
        this.hasMoreRecords = pagination.current_page < pagination.last_page;
        this.totalExpense = Number(response.total ?? this.totalExpense);
        this.multiExpenseService.setMultiExpenses(nextExpenses);
      }

    } catch (error) {
      console.error('Error loading multi-expenses:', error);
    } finally {
      this.finishLoading(event);
    }
  }

  refreshList(event: Event) {
    this.loadAutoExpenses(true, event);
  }

  loadMoreExpenses(event: Event) {
    this.loadAutoExpenses(false, event as InfiniteScrollCustomEvent);
  }

  private async refreshAutoExpenses() {
    try {
      const response = await this.multiExpenseService.getMultiExpenses(1, this.pageSize).toPromise();

      if (!(response && response.success)) {
        return;
      }

      const pagination = this.normalizePage(response.data);
      const merged = this.mergeExpenses(
        this.getOptimisticExpenses(),
        pagination.data,
        this.multiExpenseService.getCachedMultiExpenses()
      );

      this.currentPage = pagination.current_page;
      this.hasMoreRecords = pagination.current_page < pagination.last_page;
      this.totalExpense = Number(response.total ?? this.totalExpense);
      this.multiExpenseService.setMultiExpenses(merged);
    } catch (error) {
      console.error('Error refreshing multi-expenses:', error);
    }
  }

  applyFilters() {
    this.filteredExpenses = this.multiExpenses.filter((exp) => {
      let matchesSearch = true;
      let matchesMonth = true;

      if (this.searchTerm) {
        const s = this.searchTerm.toLowerCase();
        matchesSearch =
          exp.title.toLowerCase().includes(s) ||
          (exp.description?.toLowerCase().includes(s) ?? false);
      }

      if (this.selectedMonth !== 'all') {
        const expenseMonth = exp.created_at
          ? new Date(exp.created_at).toLocaleString('default', { month: 'long' })
          : '';

        matchesMonth = expenseMonth === this.selectedMonth;
      }

      return matchesSearch && matchesMonth;
    });

    this.totalFilteredAmount = this.filteredExpenses.reduce(
      (sum, e) => sum + Number(e.total_amount ?? 0),
      0
    );
  }

  trackById(index: number, item: MultiExpense) {
    return item.id;
  }

  async editAutoExpense(id: number | string) {
    await this.router.navigate([`/multi-expense/${id}`]);
  }

  async deleteAutoExpense(id: number | string) {
    const deleting = this.multiExpenses.find((exp) => String(exp.id) === String(id));

    try {
      await this.multiExpenseService.deleteMultiExpense(String(id)).toPromise();
      this.multiExpenseService.removeMultiExpenseFromCache(id);
      this.mockNotificationService.addCrudNotification(
        'Multi Expense',
        'deleted',
        `${deleting?.title || 'Multi expense'} was deleted.`
      );
    } catch (error) {
      console.error('Error deleting multi-expense:', error);
    }
  }

  navigateToMultiExpense() {
    this.router.navigate(['/multi-expense']);
  }

  private normalizePage(data: PaginatedMultiExpenseResponse | MultiExpense[]): PaginatedMultiExpenseResponse {
    if (Array.isArray(data)) {
      return {
        current_page: 1,
        data,
        last_page: 1,
        per_page: data.length,
        total: data.length
      };
    }

    return {
      current_page: Number(data?.current_page) || 1,
      data: data?.data || [],
      last_page: Number(data?.last_page) || 1,
      per_page: Number(data?.per_page) || this.pageSize,
      total: Number(data?.total) || 0
    };
  }

  private mergeExpenses(...groups: MultiExpense[][]): MultiExpense[] {
    const merged = new Map<string, MultiExpense>();
    const expenses = groups.reduce((all, group) => all.concat(group || []), [] as MultiExpense[]);

    expenses.forEach((expense) => {
      if (!expense) {
        return;
      }

      const key = String(expense.id ?? expense.multi_expense_id ?? `${expense.title}-${expense.created_at}-${expense.total_amount}`);
      if (!merged.has(key)) {
        merged.set(key, expense);
      }
    });

    return [...merged.values()].sort((a, b) => this.getSortTime(b) - this.getSortTime(a));
  }

  private getOptimisticExpenses(): MultiExpense[] {
    return this.multiExpenseService.getCachedMultiExpenses().filter((expense) => Number(expense.id) < 0);
  }

  private getSortTime(expense: MultiExpense): number {
    const value = expense.created_at || expense.updated_at;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private finishLoading(event?: any) {
    this.loading = false;
    this.loadingMore = false;
    event?.target?.complete?.();
  }
}
