import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  ToastController,
  Platform
} from '@ionic/angular';

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

  /* -----------------------------
   * UI STATE
   * ----------------------------- */
  loading = true;
  activeTab: string = 'expenses';

  /* -----------------------------
   * USER & DATE
   * ----------------------------- */
  user: any = null;
  email: string = '';
  userFirstName: string = '';
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();

  /* -----------------------------
   * TOTALS
   * ----------------------------- */
  totalTodayExpense = 0;
  totalMonthExpense = 0;
  totalYearExpense = 0;
  totalBalance = 0;
  monthSaving = 0;
  yearSaving = 0;

  /* -----------------------------
   * COUNTS
   * ----------------------------- */
  creditCardsCount = 0;
  debitCardsCount = 0;
  invoicesCount = 0;
  splitExpensesCount = 0;

  /* -----------------------------
   * DATA
   * ----------------------------- */
  balances: Balance[] = [];
  allExpenses: any[] = [];
  allTransactions: any[] = [];

  /* -----------------------------
   * CATEGORY & TYPE COUNTS
   * ----------------------------- */
  expenseCategoriesCount: { [categoryName: string]: number } = {};
  transactionTypesCount: { [key: string]: number } = {};

  /* -----------------------------
   * APP-WISE SPENDING (CORE FEATURE)
   * ----------------------------- */
  spendingByApp: { name: string; amount: number }[] = [];
  private appSpendMap: { [key: string]: number } = {};

  /* -----------------------------
   * FILTERS (OPTIONAL)
   * ----------------------------- */
  showFilters = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedCategory: number | 'All' = 'All';

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

  /* ============================================================
   * LIFECYCLE
   * ============================================================ */
  ngOnInit() {
    this.currentMonth = this.getMonthName(new Date().getMonth());
    this.loadDashboard();
  }

  /* ============================================================
   * DASHBOARD LOAD
   * ============================================================ */
  async loadDashboard(month?: number, year?: number) {
    this.loading = true;

    try {
      const res: any = await this.authService
        .getDashboard(month, year)
        .toPromise();

      if (!res || !res.success) {
        this.showToast('Failed to load dashboard', 'danger');
        return;
      }

      this.mapDashboard(res);
      await this.loadAdditionalCounts();

    } catch (err) {
      console.error('Dashboard load error', err);
      this.showToast('Failed to load dashboard', 'danger');
    } finally {
      this.loading = false;
    }
  }

  /* ============================================================
   * MAP DASHBOARD RESPONSE
   * ============================================================ */
  private mapDashboard(res: any) {

    /* USER */
    this.user = res.user || null;
    this.userFirstName = (this.user?.name || '').split(' ')[0] || '';
    this.email = this.user?.email || '';

    /* TOTALS */
    const totals = res.totals || {};
    this.totalBalance = +totals.balance || 0;
    this.totalTodayExpense = +totals.today_expense || 0;
    this.totalMonthExpense = +totals.month_expense || 0;
    this.totalYearExpense = +totals.year_expense || 0;
    this.monthSaving = +totals.month_saving || 0;
    this.yearSaving = +totals.year_saving || 0;

    /* RECENT DATA */
    this.balances = res.recent?.balances || [];
    this.allExpenses = res.recent?.expenses || [];
    this.allTransactions = res.recent?.transactions || [];

    /* CATEGORY COUNTS */
    this.expenseCategoriesCount = {};
    this.allExpenses.forEach(e => {
      const name = e.category?.name || 'Uncategorized';
      this.expenseCategoriesCount[name] =
        (this.expenseCategoriesCount[name] || 0) + 1;
    });

    /* TRANSACTION TYPE COUNTS */
    this.transactionTypesCount = {};
    this.allTransactions.forEach(t => {
      const type = t.type || 'unknown';
      this.transactionTypesCount[type] =
        (this.transactionTypesCount[type] || 0) + 1;
    });

    /* DERIVED TOTALS */
    this.calculateSavings();

    /* CORE FEATURE */
    this.calculateSpendingByApp();
  }

  /* ============================================================
   * APP-WISE SPENDING AGGREGATION
   * ============================================================ */
  private calculateSpendingByApp() {
    this.appSpendMap = {};

    this.allExpenses.forEach(expense => {
      const amount = +expense.amount || 0;

      const source =
        expense.source_app ||
        expense.payment_app ||
        expense.payment_method ||
        'Other';

      const key = source.toLowerCase();

      if (!this.appSpendMap[key]) {
        this.appSpendMap[key] = 0;
      }

      this.appSpendMap[key] += amount;
    });

    this.spendingByApp = Object.keys(this.appSpendMap).map(key => ({
      name: this.formatAppName(key),
      amount: this.appSpendMap[key]
    }));

    this.spendingByApp.sort((a, b) => b.amount - a.amount);
  }

  private formatAppName(key: string): string {
    switch (key) {
      case 'phonepe': return 'PhonePe';
      case 'gpay':
      case 'googlepay': return 'Google Pay';
      case 'amazonpay': return 'Amazon Pay';
      case 'paytm': return 'Paytm';
      case 'card': return 'Cards';
      case 'cash': return 'Cash';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  }

  /* ============================================================
   * ADDITIONAL COUNTS
   * ============================================================ */
  async loadAdditionalCounts() {
    try {
      const [
        creditCards,
        debitCards,
        invoices,
        splitExpenses
      ] = await Promise.all([
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
      console.warn('Additional counts failed', err);
    }
  }

  /* ============================================================
   * HELPERS
   * ============================================================ */
  calculateSavings() {
    this.monthSaving = this.totalBalance - this.totalMonthExpense;
    this.yearSaving = this.totalBalance - this.totalYearExpense;
  }

  getMonthName(index: number): string {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    return months[index] || 'Unknown';
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  /* ============================================================
   * NAVIGATION
   * ============================================================ */
  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }

  getTabName(route: string): string {
    switch (route) {
      case '/single-view-expenses': return 'expenses';
      case '/multi-view-expense': return 'add';
      case '/scan': return 'scan';
      case '/balance': return 'balance';
      default: return 'expenses';
    }
  }

  /* ============================================================
   * LOGOUT
   * ============================================================ */
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          handler: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  /* ============================================================
   * TOAST
   * ============================================================ */
  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

}
