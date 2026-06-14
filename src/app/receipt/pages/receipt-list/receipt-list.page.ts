/**
 * Receipt List Page
 * Displays all receipts with filtering, search, and pagination
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent, RefresherCustomEvent, AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReceiptService } from '../../../services/receipt.service';
import { ReceiptListItem, ReceiptFilters, ReceiptStatus, ReceiptType, ReceiptOfflineQueueItem } from '../../models/receipt.model';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.page.html',
  styleUrls: ['./receipt-list.page.scss'],
})
export class ReceiptListPage implements OnInit, OnDestroy {
  // Data
  receipts: ReceiptListItem[] = [];
  filteredReceipts: ReceiptListItem[] = [];

  // State
  isLoading = true;
  isLoadingMore = false;
  hasMore = true;
  isOnline = true;
  offlineQueueCount = 0;
  showFilters = false;

  // Pagination
  private currentPage = 1;
  private perPage = 20;

  // Filters
  searchCtrl = new FormControl('');
  activeStatus: ReceiptStatus | '' = '';
  activeType: ReceiptType | '' = '';
  dateFrom = '';
  dateTo = '';

  // UI
  readonly statusFilters: { value: ReceiptStatus | ''; label: string; color: string }[] = [
    { value: '', label: 'All', color: 'medium' },
    { value: 'review', label: 'Review', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'primary' },
    { value: 'saved', label: 'Saved', color: 'success' },
    { value: 'failed', label: 'Failed', color: 'danger' },
  ];

  readonly typeFilters: { value: ReceiptType | ''; label: string; icon: string }[] = [
    { value: '', label: 'All', icon: 'grid-outline' },
    { value: 'grocery', label: 'Grocery', icon: 'basket-outline' },
    { value: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' },
    { value: 'fuel', label: 'Fuel', icon: 'car-outline' },
    { value: 'pharmacy', label: 'Pharmacy', icon: 'medical-outline' },
    { value: 'utility', label: 'Utility', icon: 'flash-outline' },
    { value: 'shopping', label: 'Shopping', icon: 'bag-outline' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadReceipts(true);
    this.monitorNetworkStatus();
    this.monitorOfflineQueue();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────────────────────────────────────────────────────────────
  // NETWORK & OFFLINE
  // ──────────────────────────────────────────────────────────────────────

  private monitorNetworkStatus(): void {
    this.receiptService
      .getOnlineStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
        if (isOnline && this.offlineQueueCount > 0) {
          // Auto-sync when back online
          this.syncOfflineQueue();
        }
      });
  }

  private monitorOfflineQueue(): void {
    this.receiptService
      .getOfflineQueue()
      .pipe(takeUntil(this.destroy$))
      .subscribe((queue: ReceiptOfflineQueueItem[]) => {
        this.offlineQueueCount = queue.filter(q => q.status === 'pending').length;
      });
  }

  async syncOfflineQueue(): Promise<void> {
    await this.receiptService.syncOfflineQueue();
    this.loadReceipts(true);
  }

  // ──────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ──────────────────────────────────────────────────────────────────────

  private buildFilters(): ReceiptFilters {
    return {
      page: this.currentPage,
      per_page: this.perPage,
      search: this.searchCtrl.value || undefined,
      status: this.activeStatus || undefined,
      receipt_type: this.activeType || undefined,
      category_id: undefined,
      date_from: this.dateFrom || undefined,
      date_to: this.dateTo || undefined,
      requires_review: this.activeStatus === 'review' ? true : undefined,
    };
  }

  loadReceipts(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 1;
      this.hasMore = true;
      this.receipts = [];
      this.isLoading = true;
    }

    const filters = this.buildFilters();

    this.receiptService
      .getReceipts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (reset) {
            this.receipts = response.data;
          } else {
            this.receipts.push(...response.data);
          }

          const meta = response.meta;
          this.hasMore = !!meta && meta.current_page < meta.last_page;
          this.isLoading = false;
        },
        error: error => {
          console.error('Error loading receipts:', error);
          this.isLoading = false;
          this.showError('Failed to load receipts');
        },
      });
  }

  // ──────────────────────────────────────────────────────────────────────
  // SEARCH & FILTERS
  // ──────────────────────────────────────────────────────────────────────

  private setupSearch(): void {
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadReceipts(true);
      });
  }

  setStatusFilter(status: ReceiptStatus | ''): void {
    this.activeStatus = status;
    this.loadReceipts(true);
  }

  setTypeFilter(type: ReceiptType | ''): void {
    this.activeType = type;
    this.loadReceipts(true);
  }

  setDateFilter(from?: string, to?: string): void {
    if (from) this.dateFrom = from;
    if (to) this.dateTo = to;
    this.loadReceipts(true);
  }

  resetFilters(): void {
    this.activeStatus = '';
    this.activeType = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchCtrl.setValue('');
    this.showFilters = false;
    this.loadReceipts(true);
  }

  // ──────────────────────────────────────────────────────────────────────
  // UI INTERACTIONS
  // ──────────────────────────────────────────────────────────────────────

  onRefresh(event: RefresherCustomEvent): void {
    this.loadReceipts(true);
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  }

  onLoadMore(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMore) {
      event.detail.complete();
      return;
    }

    this.currentPage++;
    this.isLoadingMore = true;

    const filters = this.buildFilters();
    this.receiptService
      .getReceipts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.receipts.push(...response.data);
          const meta2 = response.meta;
          this.hasMore = !!meta2 && meta2.current_page < meta2.last_page;
          this.isLoadingMore = false;
          event.detail.complete();
        },
        error: error => {
          console.error('Error loading more receipts:', error);
          this.isLoadingMore = false;
          event.detail.complete();
        },
      });
  }

  viewReceipt(id: number): void {
    this.router.navigate(['/receipt/details', id]);
  }

  async deleteReceipt(id: number, event: Event): Promise<void> {
    event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: 'Delete Receipt',
      message: 'Are you sure you want to delete this receipt?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.receiptService
              .deleteReceipt(id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.receipts = this.receipts.filter(r => r.id !== id);
                  this.showSuccess('Receipt deleted');
                },
                error: error => {
                  console.error('Error deleting receipt:', error);
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

  getTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      grocery: 'basket-outline',
      restaurant: 'restaurant-outline',
      fuel: 'car-outline',
      pharmacy: 'medical-outline',
      utility: 'flash-outline',
      shopping: 'bag-outline',
      mall: 'storefront-outline',
      general: 'receipt-outline',
    };
    return iconMap[type] || 'receipt-outline';
  }

  formatAmount(amount: number | undefined): string {
    return amount ? `₹${amount.toFixed(2)}` : '₹0.00';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async showSuccess(message: string): Promise<void> {
    // You can also use Toast if available
    console.log('Success:', message);
  }
}
