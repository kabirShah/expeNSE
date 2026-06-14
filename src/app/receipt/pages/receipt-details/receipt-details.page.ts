/**
 * Receipt Details Page
 * Displays full receipt data with OCR results and actions
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Receipt, ReceiptItem, ReceiptStatusResponse } from '../../models/receipt.model';
import { ReceiptService } from '../../../services/receipt.service';

@Component({
  selector: 'app-receipt-details',
  templateUrl: './receipt-details.page.html',
  styleUrls: ['./receipt-details.page.scss'],
})
export class ReceiptDetailsPage implements OnInit, OnDestroy {
  receipt: Receipt | null = null;
  imageUrl: string | null = null;
  isLoading = true;
  isPolling = false;
  pollingCount = 0;
  readonly MAX_POLLING_ATTEMPTS = 30;
  readonly POLL_INTERVAL_MS = 2000;

  showAdvanced = false;

  private receiptId: number | null = null;
  private pollingTimer: any;
  private destroy$ = new Subject<void>();

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.receiptId = parseInt(id, 10);
        this.loadReceiptDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────────────────────────────────────────────────────────────
  // LOADING
  // ──────────────────────────────────────────────────────────────────────

  private loadReceiptDetails(): void {
    if (!this.receiptId) return;

    this.isLoading = true;
    this.receiptService
      .getReceipt(this.receiptId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: receipt => {
          this.receipt = receipt;
          this.loadImage();
          this.isLoading = false;

          // Start polling if still processing
          if (['draft', 'processing'].includes(receipt.status)) {
            this.startPolling();
          }
        },
        error: error => {
          console.error('Error loading receipt:', error);
          this.isLoading = false;
          this.showError('Failed to load receipt');
          this.router.navigate(['/receipt-list']);
        },
      });
  }

  private loadImage(): void {
    if (!this.receiptId) return;

    this.receiptService
      .getImageUrl(this.receiptId, 'processed')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.imageUrl = response.url;
        },
        error: error => {
          console.error('Error loading image:', error);
          // Fall back to original image
          this.receiptService
            .getImageUrl(this.receiptId!, 'original')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: response => {
                this.imageUrl = response.url;
              },
              error: err => {
                console.error('Error loading original image:', err);
              },
            });
        },
      });
  }

  // ──────────────────────────────────────────────────────────────────────
  // POLLING FOR PROCESSING STATUS
  // ──────────────────────────────────────────────────────────────────────

  private startPolling(): void {
    if (this.isPolling || !this.receiptId) return;

    this.isPolling = true;
    this.pollingCount = 0;
    this.pollStatus();
  }

  private stopPolling(): void {
    this.isPolling = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private pollStatus(): void {
    if (!this.receiptId || this.pollingCount >= this.MAX_POLLING_ATTEMPTS) {
      this.stopPolling();
      return;
    }

    this.pollingTimer = setTimeout(() => {
      this.receiptService
        .getReceiptStatus(this.receiptId!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: status => {
            this.pollingCount++;

            if (status.status === 'processing') {
              // Still processing, continue polling
              this.pollStatus();
            } else {
              // Processing complete, reload receipt
              this.stopPolling();
              this.loadReceiptDetails();
            }
          },
          error: error => {
            console.error('Error polling status:', error);
            this.pollingCount++;
            // Continue polling on error
            this.pollStatus();
          },
        });
    }, this.POLL_INTERVAL_MS);
  }

  // ──────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────

  async reprocessOCR(): Promise<void> {
    if (!this.receiptId || !this.receipt) return;

    const alert = await this.alertCtrl.create({
      header: 'Reprocess Receipt',
      message: 'Are you sure you want to reprocess this receipt?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reprocess',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Reprocessing...',
            });
            await loading.present();

            this.receiptService
              .reprocessOCR(this.receiptId!)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: response => {
                  loading.dismiss();
                  if (response.data) {
                    this.receipt = response.data;
                    this.showSuccess('Receipt reprocessed');
                    this.startPolling();
                  }
                },
                error: error => {
                  loading.dismiss();
                  console.error('Error reprocessing:', error);
                  this.showError('Failed to reprocess receipt');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmReceipt(): Promise<void> {
    if (!this.receiptId || !this.receipt) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirm Receipt',
      message: 'Mark this receipt as confirmed?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Confirming...',
            });
            await loading.present();

            this.receiptService
              .confirmReceipt(this.receiptId!)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: response => {
                  loading.dismiss();
                  if (response.data) {
                    this.receipt = response.data;
                    this.showSuccess('Receipt confirmed');
                  }
                },
                error: error => {
                  loading.dismiss();
                  console.error('Error confirming:', error);
                  this.showError('Failed to confirm receipt');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async createExpense(): Promise<void> {
    if (!this.receiptId) return;

    const alert = await this.alertCtrl.create({
      header: 'Create Expense',
      message: 'Create an expense from this receipt?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Creating expense...',
            });
            await loading.present();

            this.receiptService
              .createExpense(this.receiptId!, {})
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: response => {
                  loading.dismiss();
                  this.showSuccess('Expense created successfully');
                  this.router.navigate(['/expenses']);
                },
                error: error => {
                  loading.dismiss();
                  console.error('Error creating expense:', error);
                  this.showError('Failed to create expense');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteReceipt(): Promise<void> {
    if (!this.receiptId) return;

    const alert = await this.alertCtrl.create({
      header: 'Delete Receipt',
      message: 'Are you sure you want to delete this receipt?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Deleting...',
            });
            await loading.present();

            this.receiptService
              .deleteReceipt(this.receiptId!)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  loading.dismiss();
                  this.showSuccess('Receipt deleted');
                  this.router.navigate(['/receipt-list']);
                },
                error: error => {
                  loading.dismiss();
                  console.error('Error deleting:', error);
                  this.showError('Failed to delete receipt');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  // ──────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      draft: 'medium',
      processing: 'primary',
      review: 'warning',
      confirmed: 'primary',
      saved: 'success',
      failed: 'danger',
    };
    return colorMap[status] || 'medium';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      draft: 'document-outline',
      processing: 'hourglass-outline',
      review: 'eye-outline',
      confirmed: 'checkmark-outline',
      saved: 'download-outline',
      failed: 'close-circle-outline',
    };
    return iconMap[status] || 'document-outline';
  }

  formatAmount(amount: number | undefined): string {
    return amount ? `₹${amount.toFixed(2)}` : '₹0.00';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatConfidence(confidence: number | undefined): string {
    if (!confidence) return 'N/A';
    return `${Math.round(confidence)}%`;
  }

  canReprocess(): boolean {
    return this.receipt?.status === 'failed' || this.receipt?.status === 'review';
  }

  canConfirm(): boolean {
    return this.receipt?.status === 'review' || this.receipt?.status === 'confirmed';
  }

  canCreateExpense(): boolean {
    return (this.receipt?.status === 'confirmed' || this.receipt?.status === 'saved') && !this.receipt?.expense_id;
  }

  private async showError(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  private async showSuccess(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }
}
