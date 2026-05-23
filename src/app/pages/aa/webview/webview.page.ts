import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { firstValueFrom } from 'rxjs';
import { AaService, AAConnectedAccount } from 'src/app/services/aa.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-webview',
  templateUrl: './webview.page.html',
  styleUrls: ['./webview.page.scss'],
})
export class WebviewPage implements OnInit, OnDestroy {
  consentUrl: string | null = null;
  consentId: string | null = null;
  safeConsentUrl: SafeResourceUrl | null = null;
  isLoading = true;
  isSyncing = false;
  errorMessage = '';
  private removeUrlListener: (() => Promise<void>) | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly aaService: AaService,
    private readonly uiToast: UiToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.consentUrl = this.route.snapshot.queryParamMap.get('consentUrl');
    this.consentId = this.route.snapshot.queryParamMap.get('consentId');

    if (!this.consentUrl || !this.consentId) {
      this.errorMessage = 'Consent session is missing. Please start again.';
      this.isLoading = false;
      return;
    }

    this.safeConsentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.consentUrl);

    const listener = await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event?.url && this.isSuccessfulRedirect(event.url)) {
        void this.completeConnection();
      }
    });

    this.removeUrlListener = () => listener.remove();
  }

  ngOnDestroy(): void {
    if (this.removeUrlListener) {
      void this.removeUrlListener();
    }
  }

  onFrameLoad(frame: HTMLIFrameElement): void {
    this.isLoading = false;

    try {
      const currentUrl = frame?.contentWindow?.location?.href;
      if (currentUrl && this.isSuccessfulRedirect(currentUrl)) {
        void this.completeConnection();
      }
    } catch {
      // Cross-origin iframe access is expected until redirect lands on our domain.
    }
  }

  async completeConnection(): Promise<void> {
    if (!this.consentId || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(this.aaService.fetchTransactions(this.consentId));
      const firstAccount = response.accounts?.[0] || null;

      await this.router.navigate(['/aa/success'], {
        state: {
          account: firstAccount,
          consentId: this.consentId
        }
      });
    } catch (error) {
      console.error('AA sync failed', error);
      this.errorMessage = 'Consent was captured, but sync failed. You can retry now.';
      await this.uiToast.show(this.errorMessage, 'danger');
    } finally {
      this.isSyncing = false;
    }
  }

  async retrySync(): Promise<void> {
    await this.completeConnection();
  }

  openExternal(): void {
    if (this.consentUrl) {
      window.open(this.consentUrl, '_blank');
    }
  }

  private isSuccessfulRedirect(url: string): boolean {
    const normalized = url.toLowerCase();
    return normalized.includes('status=success')
      || normalized.includes('consent_status=success')
      || normalized.includes('/aa/success');
  }
}
