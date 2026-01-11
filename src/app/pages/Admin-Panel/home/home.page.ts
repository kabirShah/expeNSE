import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  ToastController,
  Platform,
  ModalController
} from '@ionic/angular';

import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BalanceService } from 'src/app/services/balance.service';

import { BiometricConsentComponent } from 'src/app/components/biometric-consent/biometric-consent.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  /* =============================
   * UI STATE
   * ============================= */
  loading = true;
  activeTab: string = 'expenses';

  /* =============================
   * USER & DATE
   * ============================= */
  user: any = null;
  email = '';
  userFirstName = '';
  currentMonth = '';
  currentYear: number = new Date().getFullYear();

  /* =============================
   * TOTALS
   * ============================= */
  totalTodayExpense = 0;
  totalMonthExpense = 0;
  totalYearExpense = 0;
  totalBalance = 0;
  monthSaving = 0;
  yearSaving = 0;

  /* =============================
   * COUNTS
   * ============================= */
  creditCardsCount = 0;
  debitCardsCount = 0;
  invoicesCount = 0;
  splitExpensesCount = 0;

  /* =============================
   * DATA
   * ============================= */
  balances: Balance[] = [];
  allExpenses: any[] = [];
  allTransactions: any[] = [];

  /* =============================
   * CATEGORY & TYPE COUNTS
   * ============================= */
  expenseCategoriesCount: { [key: string]: number } = {};
  transactionTypesCount: { [key: string]: number } = {};

  /* =============================
   * APP-WISE SPENDING
   * ============================= */
  spendingByApp: { name: string; amount: number }[] = [];
  private appSpendMap: { [key: string]: number } = {};

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private platform: Platform,

    private authService: AuthService,
    private balanceService: BalanceService,
    private expenseService: ExpenseService,
    private transactionService: TransactionService,
    private databaseService: DatabaseService,
    private menuService: MenuService
  ) {}

  /* ============================================================
   * LIFECYCLE
   * ============================================================ */
  ngOnInit(): void {
    this.currentMonth = this.getMonthName(new Date().getMonth());

    this.loadDashboard().then(() => {
      this.checkBiometricConsent();
    });
  }

  /* ============================================================
   * BIOMETRIC CONSENT (ONE TIME)
   * ============================================================ */
  async checkBiometricConsent(): Promise<void> {
    const promptShown = localStorage.getItem('biometric_prompt_shown');

    if (promptShown === 'true') {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: BiometricConsentComponent,
      backdropDismiss: false
    });

    await modal.present();
  }

  /* ============================================================
   * DASHBOARD LOAD
   * ============================================================ */
  async loadDashboard(month?: number, year?: number): Promise<void> {
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
  private mapDashboard(res: any): void {

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

    this.calculateSavings();
    this.calculateSpendingByApp();
  }

  /* ============================================================
   * APP-WISE SPENDING
   * ============================================================ */
  private calculateSpendingByApp(): void {
    this.appSpendMap = {};

    this.allExpenses.forEach(expense => {
      const amount = +expense.amount || 0;
      const source =
        expense.source_app ||
        expense.payment_app ||
        expense.payment_method ||
        'Other';

      const key = source.toLowerCase();
      this.appSpendMap[key] = (this.appSpendMap[key] || 0) + amount;
    });

    this.spendingByApp = Object.keys(this.appSpendMap)
      .map(key => ({
        name: this.formatAppName(key),
        amount: this.appSpendMap[key]
      }))
      .sort((a, b) => b.amount - a.amount);
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
  async loadAdditionalCounts(): Promise<void> {
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

      this.creditCardsCount = creditCards?.length || 0;
      this.debitCardsCount = debitCards?.length || 0;
      this.invoicesCount = invoices?.length || 0;
      this.splitExpensesCount = splitExpenses?.length || 0;

    } catch (err) {
      console.warn('Additional counts failed', err);
    }
  }

  /* ============================================================
   * HELPERS
   * ============================================================ */
  calculateSavings(): void {
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

  /* ============================================================
   * NAVIGATION
   * ============================================================ */
  navigateTo(route: string): void {
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
   * LOGOUT (CLEAN & CENTRALIZED)
   * ============================================================ */
  async logout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout();
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
  async showToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
