import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { IntegrationProvider, IntegrationVisibilityService } from 'src/app/services/integration-visibility.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.page.html',
  styleUrls: ['./integration.page.scss'],
})
export class IntegrationPage implements OnInit {
  integrationVisibilityEnabled = false;
  banks: IntegrationProvider[] = [];
  apps: IntegrationProvider[] = [];

  constructor(
    private navCtrl: NavController,
    private userPreferences: UserPreferencesService,
    private integrationVisibility: IntegrationVisibilityService,
    private uiToast: UiToastService
  ) { }

  ngOnInit() {
    this.integrationVisibilityEnabled = this.userPreferences.isIntegrationVisibilityEnabled();
    this.banks = this.integrationVisibility.getProviders('bank');
    this.apps = this.integrationVisibility.getProviders('upi');
  }

  openRoute(route: string): void {
    this.navCtrl.navigateForward(route);
  }

  enabledCount(type: 'bank' | 'upi'): number {
    return this.integrationVisibility.getEnabledCount(type);
  }

  isEnabled(provider: IntegrationProvider): boolean {
    return this.integrationVisibility.getProviderState(provider.key).enabled;
  }

  allBanksEnabled(): boolean {
    return this.banks.length > 0 && this.banks.every((bank) => this.isEnabled(bank));
  }

  async toggleAllBanks(event: any): Promise<void> {
    const enabled = event.detail.checked;

    if (enabled && !this.integrationVisibilityEnabled) {
      event.target.checked = false;
      await this.uiToast.show('Turn on smart expense tracking in Settings first.', 'warning');
      return;
    }

    await firstValueFrom(
      this.integrationVisibility.saveProviderStates(
        this.banks.map((bank) => bank.key),
        enabled
      )
    );

    await this.uiToast.show(
      enabled
        ? 'All bank integrations are now enabled.'
        : 'All bank integrations are now disabled.',
      'primary'
    );
  }

  async toggleProvider(provider: IntegrationProvider, event: any): Promise<void> {
    const enabled = event.detail.checked;

    if (enabled && !this.integrationVisibilityEnabled) {
      event.target.checked = false;
      await this.uiToast.show('Turn on smart expense tracking in Settings first.', 'warning');
      return;
    }

    await firstValueFrom(this.integrationVisibility.saveProviderState(provider.key, enabled));
    await this.uiToast.show(
      enabled
        ? `${provider.name} expenses will now be visible to the user.`
        : `${provider.name} integration is now turned off.`,
      'primary'
    );
  }

}
