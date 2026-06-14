/**
 * Receipt Review Page (Stub)
 * Placeholder for receipt review functionality
 * Can be expanded with detailed review/edit UI
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Receipt } from '../../models/receipt.model';
import { ReceiptService } from '../../../services/receipt.service';

@Component({
  selector: 'app-receipt-review',
  templateUrl: './receipt-review.page.html',
  styleUrls: ['./receipt-review.page.scss'],
})
export class ReceiptReviewPage implements OnInit, OnDestroy {
  receipt: Receipt | null = null;
  isLoading = true;
  isPolling = false;
  pollingAttempts = 0;

  readonly MAX_POLLING_ATTEMPTS = 30;
  readonly POLL_INTERVAL_MS = 2000;

  private receiptId: number | null = null;
  private pollingTimer: any;
  private destroy$ = new Subject<void>();

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.receiptId = parseInt(id, 10);
        this.loadReceipt();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReceipt(): void {
    if (!this.receiptId) return;

    this.receiptService
      .getReceipt(this.receiptId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: receipt => {
          this.receipt = receipt;
          this.isLoading = false;

          if (['draft', 'processing'].includes(receipt.status)) {
            this.startPolling();
          } else {
            this.stopPolling();
          }
        },
        error: error => {
          console.error('Error loading receipt:', error);
          this.isLoading = false;
          this.router.navigate(['/receipt/list']);
        },
      });
  }

  private startPolling(): void {
    if (this.isPolling || !this.receiptId) return;

    this.isPolling = true;
    this.pollingAttempts = 0;
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
    if (!this.receiptId || this.pollingAttempts >= this.MAX_POLLING_ATTEMPTS) {
      this.stopPolling();
      return;
    }

    this.pollingTimer = setTimeout(() => {
      this.receiptService
        .getReceiptStatus(this.receiptId!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: status => {
            this.pollingAttempts++;

            if (status.status === 'processing') {
              this.pollStatus();
              return;
            }

            this.stopPolling();
            this.loadReceipt();
          },
          error: error => {
            console.error('Error polling receipt status:', error);
            this.pollingAttempts++;
            this.pollStatus();
          },
        });
    }, this.POLL_INTERVAL_MS);
  }

  navigateToDetails(): void {
    if (this.receiptId) {
      this.router.navigate(['/receipt/details', this.receiptId]);
    }
  }

  formatAmount(amount?: number): string {
    return `INR ${Number(amount ?? 0).toFixed(2)}`;
  }

  formatConfidence(confidence?: number): string {
    return confidence === undefined || confidence === null ? 'Pending' : `${Math.round(confidence)}%`;
  }
}
