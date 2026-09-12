import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { firstValueFrom, Subscription } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { LocalFinanceService } from 'src/app/services/local-finance.service';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SmartDetectionService } from 'src/app/services/smart-detection.service';
import { SplitwiseService } from 'src/app/services/splitwise.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { BiometricConsentComponent } from 'src/app/components/biometric-consent/biometric-consent.component';

interface DashboardData {
  total_balance: number;
  total_month_expense: number;
  month_income: number;
  month_saving: number;
  auto_detected_count: number;
  budget_status: any;
  expense_breakdown: Record<string, unknown>;
  transaction_breakdown: TransactionRow[];
  recent_groups: any[];
  recent_expenses: Expense[];
  features: Record<string, boolean>;
}

interface Expense {
  expense_name?: string;
  category?: string;
  expense_amount?: number;
  amount?: number;
  created_at?: string;
  source_type?: string;
  source_ref_id?: string;
}

interface TransactionRow {
  source_type: string;
  transaction_type: string;
  total: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PAYMENT_SOURCE_LABELS: Record<string, string> = {
  gpay: 'GPay',
  phonepe: 'PhonePe',
  paytm: 'Paytm',
  upi: 'UPI',
  bank: 'Bank',
  unknown: 'Unknown',
};

const PAYMENT_SOURCE_ICONS: Record<string, string> = {
  gpay: 'logo-google',
  phonepe: 'wallet-outline',
  paytm: 'card-outline',
  upi: 'swap-horizontal-outline',
  bank: 'business-outline',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  multi: 'Multi',
  scan: 'Scan',
  voice: 'Voice',
  auto: 'Auto',
};

const PAYMENT_TYPE_ICONS: Record<string, string> = {
  'Cash': '💰',
  'Bank Transfer': '🏦',
  'UPI': '📱',
  'Credit Card': '💳',
  'Debit Card': '💳',
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  activeTab = 'expenses';
  unreadNotificationCount = 0;
  user: any = null;
  userFirstName = '';
  currentMonth = '';
  splitwiseGroupCount = 0;
  splitwiseStatusMessage = '';

  private notificationSub?: Subscription;
  private readonly autoDetectedHandler = (): void => { void this.loadDashboard(); };

  constructor(
    private navCtrl: NavController,
    private uiToast: UiToastService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private apiService: ApiService,
    public appConfig: AppConfigService,
    private localFinance: LocalFinanceService,
    private onboardingService: OnboardingService,
    private smartDetectionService: SmartDetectionService,
    private userPreferences: UserPreferencesService,
    private mockNotificationService: MockNotificationService,
    private splitwiseService: SplitwiseService,
  ) {}

  ngOnInit(): void {
    this.currentMonth = MONTH_NAMES[new Date().getMonth()];

    this.notificationSub = this.mockNotificationService.unreadCount$.subscribe(
      (count) => { this.unreadNotificationCount = count; }
    );

    void this.onboardingService.initialize();

    void this.loadDashboard().then(() => {
      void this.checkBiometricConsent();
      void this.ensureIntegrationConsentPrompt();
    });

    window.addEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    window.removeEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  async checkBiometricConsent(): Promise<void> {
    if (localStorage.getItem('biometric_prompt_shown') === 'true') return;

    const modal = await this.modalCtrl.create({
      component: BiometricConsentComponent,
      backdropDismiss: false,
    });
    await modal.present();
  }

  private async ensureIntegrationConsentPrompt(): Promise<void> {
    if (this.userPreferences.hasIntegrationVisibilityConsent()) return;

    const alert = await this.alertCtrl.create({
      header: 'Enable smart expense tracking',
      message: 'Allow access to notifications to automatically detect your expenses from supported bank, UPI, and wallet alerts.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Not Now',
          role: 'cancel',
          handler: () => {
            void firstValueFrom(this.userPreferences.savePreferences({
              integration_visibility_enabled: false,
              integration_visibility_consent_at: new Date().toISOString(),
            }));
          },
        },
        {
          text: 'Enable',
          handler: async () => {
            await this.smartDetectionService.enableSmartTracking();
            void firstValueFrom(this.userPreferences.savePreferences({
              integration_visibility_enabled: true,
              integration_visibility_consent_at: new Date().toISOString(),
            }));
          },
        },
      ],
    });

    await alert.present();
  }

  async loadDashboard(month?: number, year?: number): Promise<void> {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const res = this.userPreferences.isDeviceOnlyMode()
        ? this.localFinance.getDashboardSummary(this.authService.getUser())
        : await firstValueFrom(this.apiService.getDashboardSummary(month, year));

      if (!res?.success) {
        this.setError(res?.message ?? 'Unable to load dashboard data.');
        return;
      }

      this.mapDashboard(res);
      this.loadSplitwiseOverview();
    } catch (err) {
      console.error('Dashboard load error', err);
      this.setError(err instanceof Error ? err.message : 'Network issue while loading dashboard.');
    } finally {
      this.isLoading = false;
    }
  }

  retryDashboard(): void {
    void this.loadDashboard();
  }

  private setError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    void this.showToast('Failed to load dashboard', 'danger');
  }

  private loadSplitwiseOverview(): void {
    this.splitwiseStatusMessage = '';
    this.splitwiseService.getGroups().subscribe({
      next: (response) => { this.splitwiseGroupCount = response.data?.length ?? 0; },
      error: () => {
        this.splitwiseGroupCount = 0;
        this.splitwiseStatusMessage = 'Splitwise data unavailable.';
      },
    });
  }

  private mapDashboard(res: any): void {
    const totals = res?.totals ?? {};
    this.dashboardData = {
      total_balance: +(res?.total_balance ?? totals.total_balance ?? totals.balance ?? 0),
      total_month_expense: +(res?.total_expense ?? res?.total_month_expense ?? totals.total_month_expense ?? totals.month_expense ?? 0),
      month_income: +(res?.month_income ?? totals.month_income ?? 0),
      month_saving: +(res?.month_saving ?? totals.month_saving ?? 0),
      auto_detected_count: +(res?.auto_detected_count ?? 0),
      budget_status: res?.budget_status ?? null,
      expense_breakdown: res?.breakdown ?? {},
      transaction_breakdown: res?.transaction_breakdown
        ?? this.breakdownToRows(res?.breakdown)
        ?? res?.breakdowns?.transaction_month
        ?? [],
      recent_groups: res?.recent_groups ?? res?.groups?.recent_groups ?? [],
      recent_expenses: res?.recent_transactions ?? res?.recent_expenses ?? res?.recent?.expenses ?? [],
      features: res?.features ?? {},
    };

    this.user = res.user ?? this.authService.getUser() ?? null;
    this.userFirstName = (this.user?.name ?? '').split(' ')[0] ?? '';
  }

  // ── Computed getters ──────────────────────────────────────────────────────

  get totalBalance(): number {
    return +(this.dashboardData?.total_balance ?? 0);
  }

  get totalMonthExpense(): number {
    return +(this.dashboardData?.total_month_expense ?? 0);
  }

  get monthIncome(): number {
    return +(this.dashboardData?.month_income ?? 0);
  }

  get monthSaving(): number {
    return +(this.dashboardData?.month_saving ?? 0);
  }

  get transactionBreakdown(): TransactionRow[] {
    return this.dashboardData?.transaction_breakdown ?? [];
  }

  get recentExpenses(): Expense[] {
    return this.dashboardData?.recent_expenses ?? [];
  }

  get isPaymentSourceEnabled(): boolean {
    return !!this.dashboardData?.features?.['enable_payment_source_detection'];
  }

  get isAutoTrackingEnabled(): boolean {
    return !!this.dashboardData?.features?.['enable_auto_tracking'];
  }

  get autoDetectedCount(): number {
    return +(this.dashboardData?.auto_detected_count ?? 0);
  }

  get budgetStatus(): any {
    return this.dashboardData?.budget_status ?? null;
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  getGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good Morning';
    if (h >= 12 && h < 17) return 'Good Afternoon';
    if (h >= 17 && h < 21) return 'Good Evening';
    return 'Good Night';
  }

  getIcon(type: string): string {
    return PAYMENT_TYPE_ICONS[type] ?? '💵';
  }

  getSourceTypeLabel(source: string | null | undefined): string {
    return TRANSACTION_TYPE_LABELS[source ?? ''] ?? 'Single';
  }

  getPaymentSourceLabel(source: string | null | undefined): string {
    return PAYMENT_SOURCE_LABELS[source ?? ''] ?? '';
  }

  getPaymentSourceIcon(source: string | null | undefined): string {
    return PAYMENT_SOURCE_ICONS[source ?? ''] ?? 'help-circle-outline';
  }

  isAutoDetected(expense: Expense): boolean {
    return ['sms', 'notification'].includes(String(expense?.source_type ?? ''))
      && !expense?.source_ref_id;
  }

  isSavingNegative(): boolean {
    return this.monthSaving < 0;
  }

  isExpenseWithinBalance(): boolean {
    return this.totalMonthExpense <= this.totalBalance;
  }

  getSavingInsight(): string {
    if (this.monthSaving > 0) return 'You saved well this month';
    if (this.monthSaving < 0) return 'You overspent this month';
    return 'You are exactly on track this month';
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  navigateTo(route: string): void {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }

  openNotifications(): void {
    this.navCtrl.navigateForward('/notifications');
  }

  getTabName(route: string): string {
    const TAB_MAP: Record<string, string> = {
      '/single-view-expenses': 'expenses',
      '/multi-view-expense': 'add',
      '/scan': 'scan',
      '/balance': 'balance',
      '/analytics': 'analytics',
    };
    return TAB_MAP[route] ?? 'expenses';
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  trackByExpense(_index: number, item: Expense): string | number {
    return (item as any)?.id ?? _index;
  }

  private breakdownToRows(breakdown: Record<string, number> | null | undefined): TransactionRow[] {
    if (!breakdown) return [];
    return Object.entries(breakdown).map(([source, total]) => ({
      source_type: source,
      transaction_type: this.getSourceTypeLabel(source),
      total,
    }));
  }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'primary',
  ): Promise<void> {
    await this.uiToast.show(message, color);
  }
getExpenseTitle(item: any): string {
  return String(
    item?.expense_name ||
    item?.category ||
    'Expense'
  );
}

getAvatarLetter(item: any): string {
  return this.getExpenseTitle(item)
    .charAt(0)
    .toUpperCase();
}

}