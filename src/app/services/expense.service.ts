import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';
import { LocalFinanceService } from './local-finance.service';
import { UserPreferencesService } from './user-preferences.service';

export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ExpenseApiResponse<T> {
  success: boolean;
  data: T;
  features?: {
    enable_payment_source_detection?: boolean;
    enable_auto_tracking?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiURL}/expenses`;
  private readonly expensesSubject = new BehaviorSubject<Expense[]>([]);
  readonly expenses$ = this.expensesSubject.asObservable();

  private readonly balanceDeltaSubject = new BehaviorSubject<number>(0);
  readonly balanceDelta$ = this.balanceDeltaSubject.asObservable();
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  readonly categories$ = this.categoriesSubject.asObservable();
  private categoriesLoaded = false;
  private categoriesRequest$?: Observable<{ success: boolean; data: any[] }>;

  constructor(
    private http: HttpClient,
    private localFinance: LocalFinanceService,
    private userPreferences: UserPreferencesService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
  
  getCategories(forceRefresh = false): Observable<{ success: boolean; data: any[] }> {
    if (this.userPreferences.isDeviceOnlyMode()) {
      const categories = this.categoriesLoaded && this.categoriesSubject.value.length
        ? this.categoriesSubject.value
        : this.userPreferences.getDefaultCategories();
      this.categoriesSubject.next(categories);
      this.categoriesLoaded = true;
      return of({ success: true, data: categories });
    }

    if (!forceRefresh && this.categoriesLoaded) {
      return of({ success: true, data: this.categoriesSubject.value });
    }

    if (!forceRefresh && this.categoriesRequest$) {
      return this.categoriesRequest$;
    }

    const request$ = this.http.get<{ success: boolean; data: any[] }>(
      `${environment.apiURL}/categories`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((res) => {
        const categories = res?.data || [];
        this.categoriesSubject.next(categories);
        this.categoriesLoaded = true;
      }),
      finalize(() => {
        this.categoriesRequest$ = undefined;
      }),
      shareReplay(1)
    );

    this.categoriesRequest$ = request$;
    return request$;
  }

  hasCachedCategories(): boolean {
    return this.categoriesLoaded && this.categoriesSubject.value.length > 0;
  }

  getCachedCategories(): Category[] {
    return [...this.categoriesSubject.value];
  }

  getCachedExpenses(): Expense[] {
    return [...this.expensesSubject.value];
  }

  getGroupExpenses(groupId: number): Observable<any> {
  return this.http.get(
    `${environment.apiURL}/groups/${groupId}/expenses`,
    { headers: this.getAuthHeaders() }
  );
}
createCategory(data: { name: string }) {
  if (this.userPreferences.isDeviceOnlyMode()) {
    const categories = this.categoriesSubject.value;
    const nextCategory = {
      id: Date.now(),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-')
    };
    this.categoriesSubject.next([...categories, nextCategory]);
    this.categoriesLoaded = true;
    return of({ success: true, data: nextCategory });
  }

  return this.http.post(
    `${environment.apiURL}/categories`,
    data,
    { headers: this.getAuthHeaders() }
  );
}

  addCategoryToCache(category: Category): void {
    const categories = this.categoriesSubject.value;
    const exists = categories.some((item) => item.id === category.id);

    if (exists) {
      return;
    }

    this.categoriesSubject.next([...categories, category]);
    this.categoriesLoaded = true;
  }

  // Local UI cache for non-blocking/optimistic rendering.
  setExpenses(expenses: Expense[]): void {
    this.expensesSubject.next(this.sortExpenses(expenses || []));
  }

  addOptimisticExpense(expense: Expense): void {
    this.expensesSubject.next(
      this.sortExpenses([expense, ...this.expensesSubject.value])
    );
  }

  replaceOptimisticExpense(tempId: number, saved: Expense): void {
    this.expensesSubject.next(
      this.sortExpenses(
        this.expensesSubject.value.map((exp) =>
          exp.id === tempId ? saved : exp
        )
      )
    );
  }

  updateExpenseInCache(id: string | number, updatedExpense: Partial<Expense>): void {
    this.expensesSubject.next(
      this.sortExpenses(
        this.expensesSubject.value.map((expense) =>
          String(expense.id) === String(id) ? { ...expense, ...updatedExpense } : expense
        )
      )
    );
  }

  rollbackOptimisticExpense(tempId: number): void {
    this.expensesSubject.next(
      this.expensesSubject.value.filter((exp) => exp.id !== tempId)
    );
  }

  removeExpenseFromCache(id: number): void {
    this.expensesSubject.next(
      this.expensesSubject.value.filter((exp) => exp.id !== id)
    );
  }

  adjustBalanceDelta(delta: number): void {
    this.balanceDeltaSubject.next(this.balanceDeltaSubject.value + delta);
  }

  resetBalanceDelta(): void {
    this.balanceDeltaSubject.next(0);
  }


  // ✅ Get all expenses
  private sortExpenses(expenses: Expense[]): Expense[] {
    return [...expenses].sort((a, b) => this.getExpenseSortTime(b) - this.getExpenseSortTime(a));
  }

  private getExpenseSortTime(expense: Expense): number {
    const value = expense.date || expense.created_at || expense.updated_at;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  getExpenses(period: string = 'month', page: number = 1, perPage: number = 10): Observable<ExpenseApiResponse<PaginatedResponse<Expense>>> {
    if (this.userPreferences.isDeviceOnlyMode()) {
      const filtered = this.filterExpensesByPeriod(this.localFinance.getExpenses(), period);
      const offset = (page - 1) * perPage;
      const pageItems = filtered.slice(offset, offset + perPage);
      const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

      return of({
        success: true,
        features: {
          enable_payment_source_detection: false,
          enable_auto_tracking: false
        },
        data: {
          current_page: page,
          data: pageItems,
          last_page: lastPage,
          per_page: perPage,
          total: filtered.length
        }
      });
    }

    return this.http.get<ExpenseApiResponse<PaginatedResponse<Expense>>>(
      `${this.apiUrl}?period=${period}&page=${page}&per_page=${perPage}`,
      { headers: this.getAuthHeaders() }
    );
  }




  // ✅ Get single expense by ID
  getExpenseById(id: string) {
    if (this.userPreferences.isDeviceOnlyMode()) {
      const expense = this.localFinance.getExpenseById(id);
      return of({ success: true, data: expense as Expense });
    }

    return this.http.get<{ success: boolean; data: Expense }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Create new expense
  createExpense(expense: Expense) {
    if (this.userPreferences.isDeviceOnlyMode()) {
      const saved = this.localFinance.saveExpense(this.attachCategorySnapshot(expense));
      return of({ success: true, data: saved });
    }

    return this.http.post<{ success: boolean; data: Expense }>(
      this.apiUrl,
      expense,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Bulk insert expenses
  createMultipleExpenses(expenses: Expense[]) {
    return this.http.post<{ success: boolean; data: Expense[] }>(
      `${this.apiUrl}/bulk`,
      { expenses },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Update expense by ID
  updateExpense(id: string, expense: Expense) {
    if (this.userPreferences.isDeviceOnlyMode()) {
      const numericId = Number(id);
      const saved = this.localFinance.saveExpense({
        ...this.attachCategorySnapshot(expense),
        id: Number.isNaN(numericId) ? expense.id : numericId
      });
      return of({ success: true, data: saved });
    }

    return this.http.put<{ success: boolean; data: Expense }>(
      `${this.apiUrl}/${id}`,
      expense,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Delete expense by ID
  deleteExpense(id: string) {
    if (this.userPreferences.isDeviceOnlyMode()) {
      this.localFinance.deleteExpense(id);
      return of({ success: true, message: 'Expense deleted successfully' });
    }

    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  private filterExpensesByPeriod(expenses: Expense[], period: string): Expense[] {
    const now = new Date();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      if (Number.isNaN(expenseDate.getTime())) {
        return false;
      }

      switch (period) {
        case 'today':
          return expenseDate.toDateString() === now.toDateString();
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        }
        case '6months': {
          const start = new Date(now);
          start.setMonth(now.getMonth() - 6);
          return expenseDate >= start && expenseDate <= now;
        }
        case 'month':
        default:
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
      }
    });
  }

  private attachCategorySnapshot(expense: any): Expense {
    const categoryId = Number(expense?.category_id);
    const categories = this.categoriesSubject.value.length
      ? this.categoriesSubject.value
      : this.userPreferences.getDefaultCategories();
    const category = categories.find((item) => Number(item.id) === categoryId);

    return {
      ...expense,
      category: expense.category || category || undefined
    };
  }
}
