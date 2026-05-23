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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  dashboardData: any = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  activeTab = 'expenses';
  unreadNotificationCount = 0;
  user: any = null;
  userFirstName = '';
  currentMonth = '';
  private notificationSub?: Subscription;
  private autoDetectedHandler = () => {
    void this.loadDashboard();
  };

  splitwiseGroupCount = 0;
  splitwiseStatusMessage = '';

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
    private splitwiseService: SplitwiseService
  ) {}

  ngOnInit(): void {
    this.currentMonth = this.getMonthName(new Date().getMonth());

    this.notificationSub = this.mockNotificationService.unreadCount$.subscribe((count) => {
      this.unreadNotificationCount = count;
    });

    void this.onboardingService.initialize();
    this.loadDashboard().then(() => {
      this.checkBiometricConsent();
      void this.ensureIntegrationConsentPrompt();
    });

    window.addEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    window.removeEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  async checkBiometricConsent(): Promise<void> {
    if (localStorage.getItem('biometric_prompt_shown') === 'true') {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: BiometricConsentComponent,
      backdropDismiss: false,
    });
    await modal.present();
  }

  private async ensureIntegrationConsentPrompt(): Promise<void> {
    if (this.userPreferences.hasIntegrationVisibilityConsent()) {
      return;
    }

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
              integration_visibility_consent_at: new Date().toISOString()
            }));
          }
        },
        {
          text: 'Enable',
          handler: async () => {
            await this.smartDetectionService.enableSmartTracking();
            void firstValueFrom(this.userPreferences.savePreferences({
              integration_visibility_enabled: true,
              integration_visibility_consent_at: new Date().toISOString()
            }));
          }
        }
      ]
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

      console.log('Dashboard summary response:', res);

      if (!res || !res.success) {
        this.hasError = true;
        this.errorMessage = res?.message || 'Unable to load dashboard data.';
        this.showToast('Failed to load dashboard', 'danger');
        return;
      }

      this.mapDashboard(res);
      this.loadSplitwiseOverview();
    } catch (err) {
      console.error('Dashboard load error', err);
      this.hasError = true;
      this.errorMessage = err instanceof Error ? err.message : 'Network issue while loading dashboard.';
      this.showToast('Failed to load dashboard', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private loadSplitwiseOverview(): void {
    this.splitwiseStatusMessage = '';
    this.splitwiseService.getGroups().subscribe({
      next: (response) => {
        this.splitwiseGroupCount = response.data?.length ?? 0;
      },
      error: () => {
        this.splitwiseGroupCount = 0;
        this.splitwiseStatusMessage = 'Splitwise data unavailable.';
      },
    });
  }

  retryDashboard(): void {
    this.loadDashboard();
  }

  private mapDashboard(res: any): void {
    this.dashboardData = {
      total_balance: +(res?.total_balance ?? res?.totals?.total_balance ?? res?.totals?.balance ?? 0),
      total_month_expense: +(res?.total_expense ?? res?.total_month_expense ?? res?.totals?.total_month_expense ?? res?.totals?.month_expense ?? 0),
      month_income: +(res?.month_income ?? res?.totals?.month_income ?? 0),
      month_saving: +(res?.month_saving ?? res?.totals?.month_saving ?? 0),
      auto_detected_count: +(res?.auto_detected_count ?? 0),
      budget_status: res?.budget_status ?? null,
      expense_breakdown: res?.breakdown ?? {},
      transaction_breakdown: res?.transaction_breakdown ?? this.breakdownToRows(res?.breakdown) ?? res?.breakdowns?.transaction_month ?? [],
      recent_groups: res?.recent_groups ?? res?.groups?.recent_groups ?? [],
      recent_expenses: res?.recent_transactions ?? res?.recent_expenses ?? res?.recent?.expenses ?? [],
      features: res?.features ?? {},
    };
    this.user = res.user || this.authService.getUser() || null;
    this.userFirstName = (this.user?.name || '').split(' ')[0] || '';
    console.log('Mapped dashboard data:', this.dashboardData);
  }

  getGreeting(): string {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      return 'Good Morning';
    }
    if (hours >= 12 && hours < 17) {
      return 'Good Afternoon';
    }
    if (hours >= 17 && hours < 21) {
      return 'Good Evening';
    }
    return 'Good Night';
  }

  getIcon(type: string): string {
    switch (type) {
      case 'Cash':
        return '💰';
      case 'Bank Transfer':
        return '🏦';
      case 'UPI':
        return '📱';
      case 'Credit Card':
      case 'Debit Card':
        return '💳';
      default:
        return '💵';
    }
  }

  get totalBalance(): number {
    return +(this.dashboardData?.financial_container?.amount ?? this.dashboardData?.total_balance ?? 0);
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

  get transactionBreakdown(): any[] {
    return this.dashboardData?.transaction_breakdown || [];
  }

  private breakdownToRows(breakdown: Record<string, number> | null | undefined): any[] {
    if (!breakdown) {
      return [];
    }

    return Object.entries(breakdown).map(([source, total]) => ({
      source_type: source,
      transaction_type: this.getSourceTypeLabel(source),
      total
    }));
  }

  getSourceTypeLabel(source: string | null | undefined): string {
    switch (source) {
      case 'single':
        return 'Single';
      case 'multi':
        return 'Multi';
      case 'scan':
        return 'Scan';
      case 'voice':
        return 'Voice';
      case 'auto':
        return 'Auto';
      default:
        return 'Single';
    }
  }

  get recentExpenses(): any[] {
    return this.dashboardData?.recent_expenses || [];
  }

  get isPaymentSourceEnabled(): boolean {
    return !!this.dashboardData?.features?.enable_payment_source_detection;
  }

  get isAutoTrackingEnabled(): boolean {
    return !!this.dashboardData?.features?.enable_auto_tracking;
  }

  get autoDetectedCount(): number {
    return +(this.dashboardData?.auto_detected_count ?? 0);
  }

  get budgetStatus(): any {
    return this.dashboardData?.budget_status || null;
  }

  getPaymentSourceLabel(source: string | null | undefined): string {
    switch (source) {
      case 'gpay':
        return 'GPay';
      case 'phonepe':
        return 'PhonePe';
      case 'paytm':
        return 'Paytm';
      case 'upi':
        return 'UPI';
      case 'bank':
        return 'Bank';
      case 'unknown':
        return 'Unknown';
      default:
        return '';
    }
  }

  getPaymentSourceIcon(source: string | null | undefined): string {
    switch (source) {
      case 'gpay':
        return 'logo-google';
      case 'phonepe':
        return 'wallet-outline';
      case 'paytm':
        return 'card-outline';
      case 'upi':
        return 'swap-horizontal-outline';
      case 'bank':
        return 'business-outline';
      default:
        return 'help-circle-outline';
    }
  }

  isAutoDetected(expense: any): boolean {
    return ['sms', 'notification'].includes(String(expense?.source_type || '')) && !expense?.source_ref_id;
  }

  isSavingNegative(): boolean {
    return this.monthSaving < 0;
  }

  isExpenseWithinBalance(): boolean {
    return this.totalMonthExpense <= this.totalBalance;
  }

  getSavingInsight(): string {
    if (this.monthSaving > 0) {
      return 'You saved well this month';
    }
    if (this.monthSaving < 0) {
      return 'You overspent this month';
    }
    return 'You are exactly on track this month';
  }

  navigateTo(route: string): void {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }

  openNotifications(): void {
    this.navCtrl.navigateForward('/single-view-expenses');
  }

  getTabName(route: string): string {
    switch (route) {
      case '/single-view-expenses':
        return 'expenses';
      case '/multi-view-expense':
        return 'add';
      case '/scan':
        return 'scan';
      case '/balance':
        return 'balance';
      case '/analytics':
        return 'analytics';
      default:
        return 'expenses';
    }
  }

  getMonthName(index: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
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
