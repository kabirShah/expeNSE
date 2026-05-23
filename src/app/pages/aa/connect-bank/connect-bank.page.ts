import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AaService } from 'src/app/services/aa.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-connect-bank',
  templateUrl: './connect-bank.page.html',
  styleUrls: ['./connect-bank.page.scss'],
})
export class ConnectBankPage {
  isConnecting = false;
  errorMessage = '';

  constructor(
    private readonly aaService: AaService,
    private readonly router: Router,
    private readonly uiToast: UiToastService
  ) {}

  async connectBank(): Promise<void> {
    this.isConnecting = true;
    this.errorMessage = '';

    try {
      const redirectUrl = `${window.location.origin}/aa/webview?status=success`;
      const response = await firstValueFrom(this.aaService.createConsent(redirectUrl));

      if (!response?.consent_url) {
        throw new Error('Consent URL was not returned.');
      }

      await this.router.navigate(['/aa/webview'], {
        queryParams: {
          consentUrl: response.consent_url,
          consentId: response.consent_id
        }
      });
    } catch (error) {
      console.error('AA consent creation failed', error);
      this.errorMessage = 'We could not start bank connection right now. Please try again.';
      await this.uiToast.show(this.errorMessage, 'danger');
    } finally {
      this.isConnecting = false;
    }
  }
}
