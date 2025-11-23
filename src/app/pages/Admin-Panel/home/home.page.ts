import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController, Platform } from '@ionic/angular';
import { BalanceService } from 'src/app/services/balance.service';
import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  loading = true;
  dashboard: any = null;
  email: string = '';
  user: any = null;
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();
  userFirstName: string = '';
  totalTodayExpense: number = 0;
  totalMonthExpense: number = 0;
  totalYearExpense: number = 0;
  totalBalance: number = 0;
  creditTotal: number = 0;
  debitTotal: number = 0;
  monthSaving: number = 0;
  yearSaving: number = 0;
  balances: Balance[] = [];
  activeTab: string = 'expenses';

  // counts
  creditCardsCount = 0;
  debitCardsCount = 0;
  invoicesCount = 0;
  splitExpensesCount = 0;

  // category counts by name
  expenseCategoriesCount: { [categoryName: string]: number } = {};
  transactionTypesCount: { [key: string]: number } = {};

  // filters & lists
  showFilters = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedCategory: number | 'All' = 'All';
  categoriesList: { id: number; name: string }[] = [];

  // raw data
  allExpenses: any[] = [];
  allTransactions: any[] = [];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuService: MenuService,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private transactionService: TransactionService,
    private databaseService: DatabaseService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.currentMonth = this.getMonthName(new Date().getMonth());
    this.loadDashboard();
  }

  async loadDashboard(month?: number, year?: number) {
    this.loading = true;
    try {
      const res: any = await this.authService.getDashboard(month, year).toPromise();
      if (!res || !res.success) {
        this.showToast('Failed to load dashboard', 'danger');
        this.loading = false;
        return;
      }

      this.dashboard = res;
      this.mapDashboard(res);
      await this.loadAdditionalCounts();
    } catch (err) {
      console.error('Dashboard load error', err);
      this.showToast('Failed to load dashboard', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private mapDashboard(res: any) {
    this.user = res.user || null;
    this.userFirstName = (this.user?.name || '').split(' ')[0] || '';
    this.email = this.user?.email || '';

    const totals = res.totals || {};
    this.totalBalance = +totals.balance || 0;
    this.totalTodayExpense = +totals.today_expense || 0;
    this.totalMonthExpense = +totals.month_expense || 0;
    this.totalYearExpense = +totals.year_expense || 0;
    this.monthSaving = +totals.month_saving || 0;
    this.yearSaving = +totals.year_saving || 0;

    this.balances = res.recent?.balances || [];

    // recent expenses contain category object; keep full objects
    this.allExpenses = res.recent?.expenses || [];
    this.allTransactions = res.recent?.transactions || [];

    // Build unique categoriesList from expenses (using category object)
    const catsMap = new Map<number, { id: number; name: string }>();
    this.allExpenses.forEach(e => {
      if (e.category && e.category.id) {
        catsMap.set(e.category.id, { id: e.category.id, name: e.category.name });
      }
    });
    this.categoriesList = Array.from(catsMap.values());

    // Build category counts by category name (safe: use name)
    this.expenseCategoriesCount = {};
    this.allExpenses.forEach(e => {
      const catName = e.category?.name || 'Uncategorized';
      this.expenseCategoriesCount[catName] = (this.expenseCategoriesCount[catName] || 0) + 1;
    });

    // transaction type counts (if available)
    this.transactionTypesCount = {};
    this.allTransactions.forEach(t => {
      const type = t.type || 'unknown';
      this.transactionTypesCount[type] = (this.transactionTypesCount[type] || 0) + 1;
    });

    // Recompute derived totals if needed
    this.calculateSavings();
  }

  async loadAdditionalCounts() {
    try {
      const [creditCards, debitCards, invoices, splitExpenses] = await Promise.all([
        this.databaseService.getAllCreditCards(),
        this.databaseService.getAllDebitCards(),
        this.databaseService.getInvoices(),
        this.databaseService.getSplitExpenses()
      ]);

      this.creditCardsCount = (creditCards || []).length;
      this.debitCardsCount = (debitCards || []).length;
      this.invoicesCount = (invoices || []).length;
      this.splitExpensesCount = (splitExpenses || []).length;
    } catch (err) {
      console.warn('Error fetching additional counts', err);
    }
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    return months[monthIndex] || 'Unknown';
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    // For dashboard short-list we can request backend with filters or filter locally.
    // Here we simply update UI; user can expand this to call API with filters.
    this.showFilters = false;
    this.showToast('Filters applied', 'success');
  }

  resetFilters() {
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.selectedCategory = 'All';
    this.showToast('Filters reset', 'success');
  }

  calculateSavings() {
    this.monthSaving = +(this.totalBalance - this.totalMonthExpense);
    this.yearSaving = +(this.totalBalance - this.totalYearExpense);
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }

  getTabName(route: string): string {
    switch (route) {
      case '/single-view-expenses': return 'expenses';
      case '/multi-view-expense': return 'add';
      case '/split-view': return 'split';
      case '/scan': return 'scan';
      case '/balance': return 'balance';
      default: return 'expenses';
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout', handler: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }

  // small helpers for template actions
  editBalance(balance: Balance) { /* open edit modal / navigate */ }
  deleteBalance(id?: string) { /* delete flow */ }

  getCategoryName(expense: any): string {
  return expense.category?.name || '';
}
}


