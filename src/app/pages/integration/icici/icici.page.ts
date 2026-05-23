import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IntegrationProvider, IntegrationVisibilityService } from 'src/app/services/integration-visibility.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-icici',
  templateUrl: './icici.page.html',
  styleUrls: ['./icici.page.scss'],
})
export class ICICIPage implements OnInit {
  provider?: IntegrationProvider;
  enabled = false;
  integrationVisibilityEnabled = false;

  constructor(
    private integrationVisibility: IntegrationVisibilityService,
    private userPreferences: UserPreferencesService,
    private uiToast: UiToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.provider = this.integrationVisibility.getProvider('icici');
    this.enabled = this.integrationVisibility.getProviderState('icici').enabled;
    this.integrationVisibilityEnabled = this.userPreferences.isIntegrationVisibilityEnabled();
  }

  async onToggle(event: any): Promise<void> {
    const enable = event.detail.checked;

    if (enable && !this.integrationVisibilityEnabled) {
      event.target.checked = false;
      this.enabled = false;
      await this.uiToast.show('Enable smart expense tracking in Settings first.', 'warning');
      return;
    }

    await firstValueFrom(this.integrationVisibility.saveProviderState('icici', enable));
    this.enabled = enable;
    await this.uiToast.show(enable ? 'ICICI visibility enabled.' : 'ICICI visibility disabled.', 'primary');
  }

  openSettings(): void {
    this.router.navigate(['/setting']);
  }

}
