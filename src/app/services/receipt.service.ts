/**
 * Receipt Service (Facade)
 * Coordinates HTTP service, state management, and offline support
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import {
  Receipt,
  ReceiptListItem,
  ReceiptFilters,
  ReceiptAnalytics,
  ReceiptStatusResponse,
  ReceiptImageUrlResponse,
  ApiResponse,
  PaginatedResponse,
  ReceiptOfflineQueueItem,
} from '../receipt/models/receipt.model';
import { ReceiptHttpService } from './receipt-http.service';
import { ReceiptStateService } from './receipt-state.service';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private isOnline$ = new BehaviorSubject<boolean>(true);
  private uploadProgress$ = new BehaviorSubject<number>(0);

  constructor(
    private httpService: ReceiptHttpService,
    private stateService: ReceiptStateService
  ) {
    this.initializeNetworkMonitoring();
  }

  // ──────────────────────────────────────────────────────────────────────
  // NETWORK & STATUS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Initialize network status monitoring
   */
  private initializeNetworkMonitoring(): void {
    Network.addListener('networkStatusChange', status => {
      this.isOnline$.next(status.connected);
      if (status.connected) {
        this.syncOfflineQueue();
      }
    });

    // Check initial status
    Network.getStatus().then(status => {
      this.isOnline$.next(status.connected);
    });
  }

  /**
   * Get online status
   */
  getOnlineStatus(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }

  /**
   * Get upload progress
   */
  getUploadProgress(): Observable<number> {
    return this.uploadProgress$.asObservable();
  }

  // ──────────────────────────────────────────────────────────────────────
  // LIST & FILTERING
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get receipts list with filters
   */
  getReceipts(filters: ReceiptFilters): Observable<PaginatedResponse<ReceiptListItem>> {
    this.stateService.setCurrentFilters(filters);
    return this.httpService.getReceipts(filters).pipe(
      tap(response => {
        this.stateService.setReceipts(response.data);
        // Cache receipts for offline access
        response.data.forEach(receipt => this.stateService.cacheReceipt(receipt as Receipt));
      }),
      catchError(error => {
        console.error('Error loading receipts:', error);
        throw error;
      })
    );
  }

  /**
   * Search receipts
   */
  searchReceipts(searchTerm: string, filters?: ReceiptFilters): Observable<PaginatedResponse<ReceiptListItem>> {
    const mergedFilters = { ...filters, search: searchTerm, page: 1 };
    return this.getReceipts(mergedFilters);
  }

  // ──────────────────────────────────────────────────────────────────────
  // UPLOAD
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Upload receipt with automatic offline handling
   */
  uploadReceipt(
    files: File[],
    metadata?: { title?: string; notes?: string }
  ): Observable<ApiResponse<Receipt>> {
    const isOnline = this.isOnline$.value;

    if (!isOnline) {
      return this.addUploadToOfflineQueue(files, metadata);
    }

    return this.httpService.uploadReceipt(files, metadata).pipe(
      tap(response => {
        if (response.data) {
          this.stateService.addReceipt(response.data);
          this.stateService.cacheReceipt(response.data);
        }
      })
    );
  }

  /**
   * Upload with progress tracking
   */
  uploadReceiptWithProgress(
    files: File[],
    onProgress?: (progress: number) => void,
    metadata?: { title?: string; notes?: string }
  ): Observable<ApiResponse<Receipt>> {
    const isOnline = this.isOnline$.value;

    if (!isOnline) {
      return this.addUploadToOfflineQueue(files, metadata);
    }

    const progressHandler = (progress: number) => {
      this.uploadProgress$.next(progress);
      if (onProgress) onProgress(progress);
    };

    return this.httpService.uploadReceiptWithProgress(files, progressHandler, metadata).pipe(
      tap(response => {
        if (response.data) {
          this.stateService.addReceipt(response.data);
          this.stateService.cacheReceipt(response.data);
          this.uploadProgress$.next(0);
        }
      }),
      finalize(() => this.uploadProgress$.next(0))
    );
  }

  /**
   * Add upload to offline queue
   */
  private addUploadToOfflineQueue(
    files: File[],
    metadata?: { title?: string; notes?: string }
  ): Observable<ApiResponse<Receipt>> {
    const queueItem: ReceiptOfflineQueueItem = {
      id: `${Date.now()}_${Math.random()}`,
      type: 'upload',
      data: metadata,
      files: files,
      status: 'pending',
      created_at: Date.now(),
      retry_count: 0,
    };

    return from(this.stateService.addToOfflineQueue(queueItem)).pipe(
      switchMap(() =>
        new Observable<ApiResponse<Receipt>>(observer => {
          observer.next({
            message: 'Upload queued for sync when online',
            data: {
              id: 0,
              status: 'draft',
              user_id: 0,
            } as any,
          });
          observer.complete();
        })
      )
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // DETAIL & OPERATIONS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get receipt details
   */
  getReceipt(id: number): Observable<Receipt> {
    return this.httpService.getReceipt(id).pipe(
      tap(receipt => {
        this.stateService.setSelectedReceipt(receipt);
        this.stateService.cacheReceipt(receipt);
      }),
      catchError(error =>
        from(this.stateService.getCachedReceipt(id)).pipe(
          map(cached => {
            if (cached) return cached as Receipt;
            throw error;
          })
        )
      )
    );
  }

  /**
   * Update receipt
   */
  updateReceipt(id: number, data: Partial<Receipt>): Observable<ApiResponse<Receipt>> {
    return this.httpService.updateReceipt(id, data).pipe(
      tap(response => {
        if (response.data) {
          this.stateService.updateReceipt(id, response.data);
          this.stateService.updateSelectedReceipt(response.data);
          this.stateService.cacheReceipt(response.data);
        }
      })
    );
  }

  /**
   * Delete receipt
   */
  deleteReceipt(id: number): Observable<ApiResponse<any>> {
    return this.httpService.deleteReceipt(id).pipe(
      tap(() => {
        this.stateService.removeReceipt(id);
        if (this.stateService.getSelectedReceiptSync()?.id === id) {
          this.stateService.setSelectedReceipt(null);
        }
      })
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Reprocess OCR for receipt
   */
  reprocessOCR(id: number): Observable<ApiResponse<Receipt>> {
    return this.httpService.reprocessOCR(id).pipe(
      tap(response => {
        if (response.data) {
          this.stateService.updateSelectedReceipt(response.data);
        }
      })
    );
  }

  /**
   * Confirm receipt
   */
  confirmReceipt(id: number): Observable<ApiResponse<Receipt>> {
    return this.httpService.confirmReceipt(id).pipe(
      tap(response => {
        if (response.data) {
          this.stateService.updateReceipt(id, response.data);
          this.stateService.updateSelectedReceipt(response.data);
        }
      })
    );
  }

  /**
   * Create expense from receipt
   */
  createExpense(
    id: number,
    data: { account_id?: number; category_id?: number; title?: string; notes?: string }
  ): Observable<ApiResponse<any>> {
    return this.httpService.createExpense(id, data).pipe(
      tap(response => {
        if (response.data?.receipt) {
          this.stateService.updateSelectedReceipt(response.data.receipt);
        }
      })
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // STATUS & INFO
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get receipt processing status (for polling)
   */
  getReceiptStatus(id: number): Observable<ReceiptStatusResponse> {
    return this.httpService.getReceiptStatus(id);
  }

  /**
   * Poll status (convenience wrapper) - returns the status observable
   */
  pollStatus(id: number): Observable<ReceiptStatusResponse> {
    return this.getReceiptStatus(id);
  }

  /**
   * Get image URL
   */
  getImageUrl(id: number, type: 'original' | 'processed' = 'processed'): Observable<ReceiptImageUrlResponse> {
    return this.httpService.getImageUrl(id, type);
  }

  /**
   * Signed image URL wrapper for compatibility
   */
  getSignedImageUrl(id: number, type: 'original' | 'processed' = 'processed') {
    return this.getImageUrl(id, type);
  }

  // ───────────────────────────────────────────────────────────────────
  // Draft helpers (simple Preferences-backed)
  // ───────────────────────────────────────────────────────────────────

  async saveDraft(receiptId: number, formData: any): Promise<void> {
    await Preferences.set({ key: `receipt_draft_${receiptId}`, value: JSON.stringify({ ...formData, savedAt: new Date().toISOString() }) });
  }

  async loadDraft(receiptId: number): Promise<any | null> {
    const { value } = await Preferences.get({ key: `receipt_draft_${receiptId}` });
    return value ? JSON.parse(value) : null;
  }

  async clearDraft(receiptId: number): Promise<void> {
    await Preferences.remove({ key: `receipt_draft_${receiptId}` });
  }

  // ───────────────────────────────────────────────────────────────────
  // Recalculation helpers (local, deterministic)
  // ───────────────────────────────────────────────────────────────────

  recalculateItem(item: Partial<ReceiptListItem> | any): { tax: number; total: number } {
    const qty = Number(item.qty ?? 1);
    const price = Number(item.unit_price ?? 0);
    const discount = Number(item.discount ?? 0);
    const taxRate = Number(item.tax_rate ?? 0);

    const base = qty * price;
    const discounted = base - discount;
    const tax = parseFloat((discounted * taxRate / 100).toFixed(2));
    const total = parseFloat((discounted + tax).toFixed(2));
    return { tax, total };
  }

  recalculateTotals(items: any[]): { subtotal: number; tax: number; discount: number; total: number } {
    const subtotal = items.reduce((s, i) => s + (Number(i.unit_price ?? 0) * Number(i.qty ?? 1)), 0);
    const tax = items.reduce((s, i) => s + Number(i.tax ?? 0), 0);
    const discount = items.reduce((s, i) => s + Number(i.discount ?? 0), 0);
    const total = parseFloat((subtotal + tax - discount).toFixed(2));
    return { subtotal: parseFloat(subtotal.toFixed(2)), tax: parseFloat(tax.toFixed(2)), discount: parseFloat(discount.toFixed(2)), total };
  }

  /**
   * Get analytics
   */
  getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<ApiResponse<ReceiptAnalytics>> {
    return this.httpService.getAnalytics(period);
  }

  // ──────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get receipts from state
   */
  getReceiptsFromState(): Observable<ReceiptListItem[]> {
    return this.stateService.getReceipts();
  }

  /**
   * Get selected receipt from state
   */
  getSelectedReceiptFromState(): Observable<Receipt | null> {
    return this.stateService.getSelectedReceipt();
  }

  /**
   * Set selected receipt
   */
  setSelectedReceipt(receipt: Receipt | null): void {
    this.stateService.setSelectedReceipt(receipt);
  }

  // ──────────────────────────────────────────────────────────────────────
  // OFFLINE QUEUE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get offline queue
   */
  getOfflineQueue(): Observable<ReceiptOfflineQueueItem[]> {
    return this.stateService.getOfflineQueue();
  }

  /**
   * Get offline queue count
   */
  getOfflineQueueCount(status?: 'pending' | 'synced' | 'failed'): number {
    return this.stateService.getQueueCount(status);
  }

  /**
   * Sync offline queue when back online
   */
  async syncOfflineQueue(): Promise<void> {
    const pending = this.stateService.getPendingItems();

    if (pending.length === 0) {
      this.stateService.setSyncStatus('idle');
      return;
    }

    this.stateService.setSyncStatus('syncing');

    for (const item of pending) {
      try {
        if (item.type === 'upload' && item.files) {
          await this.httpService
            .uploadReceipt(item.files, item.data)
            .toPromise()
            .then(async () => {
              await this.stateService.updateQueueItemStatus(item.id, 'synced');
            });
        }
        // Add other sync operations as needed
      } catch (error) {
        console.error('Error syncing offline item:', error);
        await this.stateService.updateQueueItemStatus(item.id, 'failed', String(error));
      }
    }

    this.stateService.setSyncStatus('completed');
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    await this.stateService.clearOfflineQueue();
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    this.httpService.clearCache();
    await this.stateService.clearAllStorage();
  }
}
