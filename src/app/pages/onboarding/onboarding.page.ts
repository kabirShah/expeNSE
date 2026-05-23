import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { OnboardingService, OnboardingStep } from 'src/app/services/onboarding.service';
import { SmartDetectionService } from 'src/app/services/smart-detection.service';
import { StoragePreference, UserPreferencesService } from 'src/app/services/user-preferences.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  form!: FormGroup;
  currentStep: OnboardingStep = OnboardingStep.START;
  isSaving = false;
  isSyncing = false;
  syncMessage = 'Your smart tracking choice is saved with onboarding.';

  readonly stepOrder = [
    OnboardingStep.START,
    OnboardingStep.USER_DETAILS,
    OnboardingStep.PERMISSIONS,
    OnboardingStep.COMPLETE
  ];

  readonly storageOptions: Array<{
    value: StoragePreference;
    title: string;
    description: string;
  }> = [
    {
      value: 'device_only',
      title: 'This device only',
      description: 'Keep setup data local and skip cloud-backed sync.'
    },
    {
      value: 'cloud_sync',
      title: 'Sync across devices',
      description: 'Use the backend as source of truth and restore your setup anywhere.'
    },
    {
      value: 'hybrid',
      title: 'Local first with backup',
      description: 'Work fast on-device while still syncing with the backend.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public appConfig: AppConfigService,
    private onboardingService: OnboardingService,
    private uiToast: UiToastService,
    private userPreferences: UserPreferencesService,
    private smartDetectionService: SmartDetectionService
  ) {}

  async ngOnInit(): Promise<void> {
    const prefs = this.userPreferences.getLocalPreferences();

    this.form = this.fb.group({
      storage_preference: [prefs.storage_preference || 'cloud_sync', Validators.required],
      wallet_name: [prefs.setup_wallet_name || this.appConfig.getLabel(), [Validators.required, Validators.maxLength(100)]],
      wallet_type: [prefs.setup_wallet_type || 'cash', Validators.required],
      wallet_balance: [prefs.setup_wallet_balance ?? 0, [Validators.min(0)]],
      budget_name: [prefs.setup_budget_name || 'Monthly Budget', [Validators.maxLength(100)]],
      budget_amount: [prefs.setup_budget_amount ?? null, [Validators.min(0)]],
      budget_period: [prefs.setup_budget_period || 'monthly']
    });

    const state = await this.onboardingService.initialize(true);
    this.currentStep = state.is_completed ? OnboardingStep.COMPLETE : state.current_step;

    const saved = state.step_payload?.['preferences'];
    if (saved) {
      this.form.patchValue({
        storage_preference: saved.storage_preference ?? prefs.storage_preference ?? 'cloud_sync',
        wallet_name: saved.setup_wallet_name ?? prefs.setup_wallet_name ?? this.appConfig.getLabel(),
        wallet_type: saved.setup_wallet_type ?? prefs.setup_wallet_type ?? 'cash',
        wallet_balance: saved.setup_wallet_balance ?? prefs.setup_wallet_balance ?? 0,
        budget_name: saved.setup_budget_name ?? prefs.setup_budget_name ?? 'Monthly Budget',
        budget_amount: saved.setup_budget_amount ?? prefs.setup_budget_amount ?? null,
        budget_period: saved.setup_budget_period ?? prefs.setup_budget_period ?? 'monthly'
      });
    }

    if (state.sync_status === 'in_progress') {
      this.isSyncing = true;
      await this.watchSync();
    }
  }

  get progressIndex(): number {
    return this.stepOrder.indexOf(this.currentStep) + 1;
  }

  get syncStatus(): string {
    return this.onboardingService.snapshot.sync_status;
  }

  async continueFromIntro(): Promise<void> {
    await this.onboardingService.saveStep(OnboardingStep.USER_DETAILS);
    this.currentStep = OnboardingStep.USER_DETAILS;
  }

  async saveDetails(): Promise<void> {
    if (this.form.invalid) {
      await this.showToast('Add your main account details before continuing.', 'warning');
      return;
    }

    const values = this.form.getRawValue();
    const payload = {
      storage_preference: values.storage_preference,
      setup_wallet_name: values.wallet_name,
      setup_wallet_type: values.wallet_type,
      setup_wallet_balance: Number(values.wallet_balance || 0),
      setup_budget_name: values.budget_name || 'Monthly Budget',
      setup_budget_amount: values.budget_amount !== null && values.budget_amount !== '' ? Number(values.budget_amount) : null,
      setup_budget_period: values.budget_period
    };

    const persistRemote = values.storage_preference !== 'device_only';
    await firstValueFrom(this.userPreferences.savePreferences(payload, persistRemote));
    await this.onboardingService.saveStep(OnboardingStep.PERMISSIONS, { preferences: payload });
    this.currentStep = OnboardingStep.PERMISSIONS;
  }

  async allowAppVisibility(): Promise<void> {
    const values = this.form.getRawValue();
    await this.smartDetectionService.enableSmartTracking();

    await firstValueFrom(this.userPreferences.savePreferences({
      integration_visibility_enabled: true,
      integration_visibility_consent_at: new Date().toISOString(),
      storage_preference: values.storage_preference
    }, values.storage_preference !== 'device_only'));

    await this.onboardingService.saveStep(
      OnboardingStep.COMPLETE,
      { permission_requested_at: new Date().toISOString(), app_visibility_enabled: true },
      { permissions_granted: true, sync_consent_granted: false }
    );

    await this.onboardingService.completeOnboarding();
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  async continueWithoutSync(): Promise<void> {
    const values = this.form.getRawValue();
    await firstValueFrom(this.userPreferences.savePreferences({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      storage_preference: values.storage_preference
    }, values.storage_preference !== 'device_only'));
    await this.onboardingService.saveStep(
      OnboardingStep.COMPLETE,
      { skipped_sync: true },
      { permissions_granted: false, sync_consent_granted: false }
    );
    await this.onboardingService.completeOnboarding();
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  async startSync(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.currentStep = OnboardingStep.SYNC_PROGRESS;
    this.syncMessage = `Preparing your ${this.appConfig.getLabel().toLowerCase()} view.`;

    try {
      await this.onboardingService.saveStep(
        OnboardingStep.SYNC_INIT,
        { sync_message_count: 0 },
        { permissions_granted: true, sync_consent_granted: false }
      );

      await this.onboardingService.startSync([]);
      await this.watchSync();
    } catch (error) {
      console.error('Onboarding sync failed', error);
      this.syncMessage = 'Sync could not start. You can retry once your connection is stable.';
      await this.showToast('Sync could not start. Please try again.', 'danger');
    } finally {
      this.isSyncing = false;
    }
  }

  async finishOnboarding(): Promise<void> {
    const values = this.form.getRawValue();
    await firstValueFrom(this.userPreferences.savePreferences({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      storage_preference: values.storage_preference
    }, values.storage_preference !== 'device_only'));
    await this.onboardingService.completeOnboarding();
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private async watchSync(): Promise<void> {
    const state = await this.onboardingService.pollSyncStatus();
    this.isSyncing = false;

    if (state.sync_status === 'done') {
      this.currentStep = OnboardingStep.COMPLETE;
      this.syncMessage = `Your ${this.appConfig.getLabel().toLowerCase()} setup is ready.`;
      return;
    }

    this.currentStep = OnboardingStep.SYNC_PROGRESS;
    this.syncMessage = 'Sync paused before completion. You can retry safely without duplicate runs.';
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary'
  ): Promise<void> {
    await this.uiToast.show(message, color);
  }
}
