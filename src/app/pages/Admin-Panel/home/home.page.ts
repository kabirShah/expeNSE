import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  Platform,
  ModalController
} from '@ionic/angular';
import { firstValueFrom, Subscription } from 'rxjs';

import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { BalanceService } from 'src/app/services/balance.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { CardApiService } from 'src/app/services/card-api.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SplitService } from 'src/app/services/split.service';

import { BiometricConsentComponent } from 'src/app/components/biometric-consent/biometric-consent.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  /* ── State ── */
  isLoading  = true;
  hasError   = false;
  errorMessage = '';
  activeTab: string = 'expenses';
  unreadNotificationCount = 0;

  /* ── User ── */
  user: any        = null;
  email            = '';
  userFirstName    = '';
  currentMonth     = '';
  currentYear: number = new Date().getFullYear();

  /* ── Totals ── */
  totalTodayExpense  = 0;
  totalMonthExpense  = 0;
  totalYearExpense   = 0;
  totalBalance       = 0;
  monthSaving        = 0;
  yearSaving         = 0;

  /* ── Counts ── */
  creditCardsCount   = 0;
  debitCardsCount    = 0;
  invoicesCount      = 0;
  splitExpensesCount = 0;

  /* ── Data lists ── */
  balances:        Balance[] = [];
  allExpenses:     any[]     = [];
  allTransactions: any[]     = [];

  expenseCategoriesCount: { [key: string]: number } = {};
  transactionTypesCount:  { [key: string]: number } = {};

  spendingByApp: { name: string; amount: number }[] = [];

  private appSpendMap: { [key: string]: number } = {};
  private notificationSub?: Subscription;

  constructor(
    private router:          Router,
    private navCtrl:         NavController,
    private alertCtrl:       AlertController,
    private uiToast:         UiToastService,
    private modalCtrl:       ModalController,
    private platform:        Platform,
    private authService:     AuthService,
    private balanceService:  BalanceService,
    private expenseService:  ExpenseService,
    private transactionService: TransactionService,
    private cardApiService:  CardApiService,
    private invoiceService:  InvoiceService,
    private splitService:    SplitService,
    private menuService:     MenuService,
    private mockNotificationService: MockNotificationService
  ) {}

  /* ════════════════════════════════════
     LIFECYCLE
     ════════════════════════════════════ */
  ngOnInit(): void {
    this.currentMonth = this.getMonthName(new Date().getMonth());

    this.notificationSub = this.mockNotificationService.unreadCount$.subscribe(
      (count) => { this.unreadNotificationCount = count; }
    );

    this.loadDashboard().then(() => {
      this.checkBiometricConsent();
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }

  /* ════════════════════════════════════
     BIOMETRIC CONSENT
     ════════════════════════════════════ */
  async checkBiometricConsent(): Promise<void> {
    if (localStorage.getItem('biometric_prompt_shown') === 'true') return;

    const modal = await this.modalCtrl.create({
      component: BiometricConsentComponent,
      backdropDismiss: false,
    });
    await modal.present();
  }

  /* ════════════════════════════════════
     DASHBOARD LOAD
     ════════════════════════════════════ */
  async loadDashboard(month?: number, year?: number): Promise<void> {
    this.isLoading    = true;
    this.hasError     = false;
    this.errorMessage = '';

    try {
      const res: any = await this.authService.getDashboard(month, year).toPromise();

      if (!res || !res.success) {
        this.hasError     = true;
        this.errorMessage = 'Unable to load dashboard data.';
        this.showToast('Failed to load dashboard', 'danger');
        return;
      }

      this.mapDashboard(res);
      await this.loadAdditionalCounts();

    } catch (err) {
      console.error('Dashboard load error', err);
      this.hasError     = true;
      this.errorMessage = 'Network issue while loading dashboard.';
      this.showToast('Failed to load dashboard', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  retryDashboard(): void {
    this.loadDashboard();
  }

  /* ════════════════════════════════════
     DATA MAPPING
     ════════════════════════════════════ */
  private mapDashboard(res: any): void {
    this.user          = res.user || null;
    this.userFirstName = (this.user?.name || '').split(' ')[0] || '';
    this.email         = this.user?.email || '';

    const totals = res.totals || {};
    this.totalBalance      = +totals.balance       || 0;
    this.totalTodayExpense = +totals.today_expense  || 0;
    this.totalMonthExpense = +totals.month_expense  || 0;
    this.totalYearExpense  = +totals.year_expense   || 0;
    this.monthSaving       = +totals.month_saving   || 0;
    this.yearSaving        = +totals.year_saving    || 0;

    this.balances        = res.recent?.balances     || [];
    this.allExpenses     = res.recent?.expenses     || [];
    this.allTransactions = res.recent?.transactions || [];

    /* category counts */
    this.expenseCategoriesCount = {};
    this.allExpenses.forEach(e => {
      const name = e.category?.name || 'Uncategorized';
      this.expenseCategoriesCount[name] = (this.expenseCategoriesCount[name] || 0) + 1;
    });

    /* transaction type counts */
    this.transactionTypesCount = {};
    this.allTransactions.forEach(t => {
      const type = t.type || 'unknown';
      this.transactionTypesCount[type] = (this.transactionTypesCount[type] || 0) + 1;
    });

    this.calculateSavings();
    this.calculateSpendingByApp();
  }

  private calculateSpendingByApp(): void {
    this.appSpendMap = {};

    this.allExpenses.forEach(expense => {
      const amount = +expense.amount || 0;
      const source =
        expense.source_app    ||
        expense.payment_app   ||
        expense.payment_method||
        'Other';

      const key = source.toLowerCase();
      this.appSpendMap[key] = (this.appSpendMap[key] || 0) + amount;
    });

    this.spendingByApp = Object.keys(this.appSpendMap)
      .map(key => ({ name: this.formatAppName(key), amount: this.appSpendMap[key] }))
      .sort((a, b) => b.amount - a.amount);
  }

  private formatAppName(key: string): string {
    const map: { [k: string]: string } = {
      phonepe:    'PhonePe',
      gpay:       'Google Pay',
      googlepay:  'Google Pay',
      amazonpay:  'Amazon Pay',
      paytm:      'Paytm',
      card:       'Cards',
      cash:       'Cash',
    };
    return map[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
  }

  /* ════════════════════════════════════
     ADDITIONAL COUNTS
     ════════════════════════════════════ */
  async loadAdditionalCounts(): Promise<void> {
    const [credit, debit, invoices, splits] = await Promise.all([
      firstValueFrom(this.cardApiService.getCreditCards())
        .then((res: any) => res?.data?.length || 0).catch(() => 0),
      firstValueFrom(this.cardApiService.getDebitCards())
        .then((res: any) => res?.data?.length || 0).catch(() => 0),
      firstValueFrom(this.invoiceService.getInvoices())
        .then((res: any) => res?.data?.length || 0).catch(() => 0),
      firstValueFrom(this.splitService.getSplits())
        .then((res: any) => res?.data?.length || 0).catch(() => 0),
    ]);

    this.creditCardsCount   = credit;
    this.debitCardsCount    = debit;
    this.invoicesCount      = invoices;
    this.splitExpensesCount = splits;
  }

  calculateSavings(): void {
    this.monthSaving = this.totalBalance - this.totalMonthExpense;
    this.yearSaving  = this.totalBalance - this.totalYearExpense;
  }

  /* ════════════════════════════════════
     TEMPLATE HELPERS
     ════════════════════════════════════ */

  /**
   * Returns an Ionic icon name for a given payment app name.
   * Used in the spending-by-app list.
   */
  getAppIcon(appName: string): string {
    const name = appName.toLowerCase();
    if (name.includes('gpay') || name.includes('google'))   return 'logo-google';
    if (name.includes('phonepe'))                           return 'phone-portrait-outline';
    if (name.includes('paytm'))                             return 'phone-portrait-outline';
    if (name.includes('amazon'))                            return 'bag-handle-outline';
    if (name.includes('card') || name.includes('credit'))   return 'card-outline';
    if (name.includes('cash'))                              return 'cash-outline';
    if (name.includes('upi'))                               return 'flash-outline';
    return 'wallet-outline';
  }

  /**
   * Returns the percentage width for the app-row bar fill,
   * relative to the highest spending app (100%).
   */
  getAppPercent(amount: number): number {
    if (!this.spendingByApp.length) return 0;
    const max = this.spendingByApp[0]?.amount || 1;
    return Math.round((amount / max) * 100);
  }

  /* ════════════════════════════════════
     NAVIGATION
     ════════════════════════════════════ */
  navigateTo(route: string): void {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }

  openNotifications(): void {
    this.navCtrl.navigateForward('/notifications');
  }

  getTabName(route: string): string {
    switch (route) {
      case '/single-view-expenses': return 'expenses';
      case '/groups':               return 'groups';
      case '/multi-view-expense':   return 'add';
      case '/scan':                 return 'scan';
      case '/balance':              return 'balance';
      case '/analytics':            return 'analytics';
      default:                      return 'expenses';
    }
  }

  /* ════════════════════════════════════
     UTILITIES
     ════════════════════════════════════ */
  getMonthName(index: number): string {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    return months[index] || 'Unknown';
  }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'primary'
  ): Promise<void> {
    await this.uiToast.show(message, color);
  }
}
