import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { UserPreferencesService } from './user-preferences.service';

export interface LocalWallet {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
  color?: string | null;
  icon?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalBudget {
  id: number;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date?: string | null;
  category_id?: number | null;
  alert_at: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalFinanceService {
  constructor(private userPreferences: UserPreferencesService) {}

  getWallets(): LocalWallet[] {
    return this.read<LocalWallet>(this.walletKey()).sort((a, b) => b.id - a.id);
  }

  saveWallet(wallet: Partial<LocalWallet>): LocalWallet {
    const items = this.getWallets();
    const now = new Date().toISOString();
    const saved: LocalWallet = {
      id: wallet.id || Date.now(),
      name: wallet.name || 'Main Wallet',
      type: wallet.type || 'cash',
      balance: Number(wallet.balance || 0),
      currency: wallet.currency || 'INR',
      is_default: wallet.is_default ?? items.length === 0,
      color: wallet.color || '#1F8A70',
      icon: wallet.icon || 'wallet',
      created_at: wallet.created_at || now,
      updated_at: now
    };

    const next = items.filter((item) => item.id !== saved.id);
    if (saved.is_default) {
      next.forEach((item) => item.is_default = false);
    }
    next.unshift(saved);
    this.write(this.walletKey(), next);
    return saved;
  }

  getBudgets(): any[] {
    const budgets = this.read<LocalBudget>(this.budgetKey());
    const expenses = this.getExpenses();

    return budgets
      .filter((budget) => budget.is_active)
      .sort((a, b) => b.id - a.id)
      .map((budget) => {
        const spent = expenses
          .filter((expense) => this.isExpenseWithinBudget(expense, budget))
          .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

        const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 1000) / 10 : 0;

        return {
          ...budget,
          spent,
          remaining: Math.max(0, Number(budget.amount) - spent),
          percentage,
          is_over: spent > Number(budget.amount),
          is_alert: percentage >= Number(budget.alert_at || 80)
        };
      });
  }

  saveBudget(budget: Partial<LocalBudget>): LocalBudget {
    const items = this.read<LocalBudget>(this.budgetKey());
    const now = new Date().toISOString();
    const saved: LocalBudget = {
      id: budget.id || Date.now(),
      name: budget.name || 'Monthly Budget',
      amount: Number(budget.amount || 0),
      period: (budget.period as LocalBudget['period']) || 'monthly',
      start_date: budget.start_date || this.getMonthStart(),
      end_date: budget.end_date || this.getMonthEnd(),
      category_id: budget.category_id ?? null,
      alert_at: Number(budget.alert_at || 80),
      is_active: budget.is_active ?? true,
      created_at: budget.created_at || now,
      updated_at: now
    };

    const next = items.filter((item) => item.id !== saved.id);
    next.unshift(saved);
    this.write(this.budgetKey(), next);
    return saved;
  }

  getExpenses(): Expense[] {
    return this.read<Expense>(this.expenseKey()).sort((a, b) => this.getSortTime(b) - this.getSortTime(a));
  }

  getExpenseById(id: string | number): Expense | undefined {
    return this.getExpenses().find((expense) => String(expense.id) === String(id));
  }

  saveExpense(expense: Partial<Expense>): Expense {
    const items = this.getExpenses();
    const now = new Date().toISOString();
    const saved: Expense = {
      id: expense.id || Date.now(),
      expense_id: expense.expense_id,
      user_id: expense.user_id,
      category: expense.category,
      transaction_type: expense.transaction_type || 'Cash',
      description: expense.description || 'Expense',
      amount: Number(expense.amount || 0),
      date: expense.date || this.formatDate(new Date()),
      payment_source: expense.payment_source ?? null,
      notes: expense.notes || '',
      paidBy: expense.paidBy,
      created_at: expense.created_at || now,
      updated_at: now
    };

    const next = items.filter((item) => String(item.id) !== String(saved.id));
    next.unshift(saved);
    this.write(this.expenseKey(), next);
    return saved;
  }

  deleteExpense(id: string | number): void {
    const next = this.getExpenses().filter((expense) => String(expense.id) !== String(id));
    this.write(this.expenseKey(), next);
  }

  getDashboardSummary(user: any): any {
    const wallets = this.getWallets();
    const expenses = this.getExpenses();
    const today = this.formatDate(new Date());
    const monthPrefix = today.slice(0, 7);
    const yearPrefix = today.slice(0, 4);

    const totals = {
      balance: wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
      total_balance: wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
      balance_count: wallets.length,
      today_expense: expenses.filter((expense) => String(expense.date).startsWith(today)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      month_expense: expenses.filter((expense) => String(expense.date).startsWith(monthPrefix)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      year_expense: expenses.filter((expense) => String(expense.date).startsWith(yearPrefix)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      total_month_expense: expenses.filter((expense) => String(expense.date).startsWith(monthPrefix)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      month_income: 0,
      month_saving: -expenses.filter((expense) => String(expense.date).startsWith(monthPrefix)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      year_saving: 0
    };

    return {
      success: true,
      user,
      features: {
        enable_payment_source_detection: false,
        enable_auto_tracking: false
      },
      totals,
      recent: {
        balances: wallets.slice(0, 5).map((wallet) => ({
          id: wallet.id,
          amount: wallet.balance,
          source: wallet.name,
          date_added: wallet.updated_at
        })),
        expenses: expenses.slice(0, 10),
        transactions: []
      },
      recent_expenses: expenses.slice(0, 5),
      breakdowns: {
        transaction_month: []
      }
    };
  }

  private isExpenseWithinBudget(expense: Expense, budget: LocalBudget): boolean {
    const date = String(expense.date || '');
    if (date < budget.start_date) {
      return false;
    }

    if (budget.end_date && date > budget.end_date) {
      return false;
    }

    if (!budget.category_id) {
      return true;
    }

    return Number(expense.category?.id) === Number(budget.category_id);
  }

  private getSortTime(item: Expense): number {
    const value = item.date || item.created_at || item.updated_at;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private walletKey(): string {
    return `pm_wallets_${this.userScope()}`;
  }

  private budgetKey(): string {
    return `pm_budgets_${this.userScope()}`;
  }

  private expenseKey(): string {
    return `pm_expenses_${this.userScope()}`;
  }

  private userScope(): string {
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id') || 'guest';
    return String(userId);
  }

  private read<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private write(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getMonthStart(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getMonthEnd(): string {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.formatDate(end);
  }

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
