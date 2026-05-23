import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AaService } from 'src/app/services/aa.service';
import { AAConsent, AAConsentStatus } from 'src/app/models/aa-consent.model';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-consent-status',
  templateUrl: './consent-status.page.html',
  styleUrls: ['./consent-status.page.scss'],
})
export class ConsentStatusPage implements OnInit, OnDestroy {
  consent: AAConsent | null = null;
  consentId: string | null = null;
  status: AAConsentStatus = 'PENDING';
  isLoading = true;
  isPolling = false;
  errorMessage = '';
  private pollSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly aaService: AaService,
    private readonly uiToast: UiToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.consentId = this.route.snapshot.queryParamMap.get('consentId');

    if (!this.consentId) {
      this.errorMessage = 'Consent ID is missing.';
      this.isLoading = false;
      return;
    }

    await this.loadConsentStatus();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  async loadConsentStatus(): Promise<void> {
    try {
      const response = await firstValueFrom(this.aaService.getConsentStatus(this.consentId!));
      
      if (response?.success && response?.data) {
        this.consent = response.data;
        this.status = response.data.status;
        
        // Navigate based on status
        if (this.status === 'APPROVED') {
          await this.router.navigate(['/aa/accounts']);
        }
      }
    } catch (error) {
      console.error('Failed to load consent status', error);
      this.errorMessage = 'Could not load consent status. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  startPolling(): void {
    if (this.status !== 'PENDING') return;
    
    this.isPolling = true;
    
    this.pollSubscription = this.aaService
      .pollConsentStatus(this.consentId!, 3000, 20)
      .subscribe({
        next: (consent) => {
          if (!consent) return;
          this.consent = consent;
          this.status = consent.status;
          
          if (this.status === 'APPROVED') {
            this.stopPolling();
            this.router.navigate(['/aa/accounts']);
          } else if (this.status === 'REJECTED' || this.status === 'EXPIRED') {
            this.stopPolling();
          }
        },
        error: (error) => {
          console.error('Polling error', error);
          this.isPolling = false;
        },
      });
  }

  stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.isPolling = false;
  }

  async cancelAndNavigate(): Promise<void> {
    this.stopPolling();
    await this.router.navigate(['/aa/connect-bank']);
  }

  async retryConnection(): Promise<void> {
    await this.router.navigate(['/aa/connect-bank']);
  }

  async recreateConsent(): Promise<void> {
    await this.router.navigate(['/aa/connect-bank']);
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'PENDING': return 'time-outline';
      case 'APPROVED': return 'checkmark-circle-outline';
      case 'REJECTED': return 'close-circle-outline';
      case 'EXPIRED': return 'hourglass-outline';
      case 'REVOKED': return 'ban-outline';
      default: return 'help-circle-outline';
    }
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'EXPIRED': return 'medium';
      case 'REVOKED': return 'danger';
      default: return 'primary';
    }
  }

  getStatusMessage(): string {
    switch (this.status) {
      case 'PENDING': return 'Waiting for bank approval...';
      case 'APPROVED': return 'Consent approved! Loading accounts...';
      case 'REJECTED': return 'Bank rejected the consent request.';
      case 'EXPIRED': return 'Consent has expired.';
      case 'REVOKED': return 'Consent has been revoked.';
      default: return 'Unknown status';
    }
  }
}