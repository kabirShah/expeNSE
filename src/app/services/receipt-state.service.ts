/**
 * Receipt State Management Service
 * Manages receipt application state, offline queue, and local storage
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { Receipt, ReceiptListItem, ReceiptFilters, ReceiptOfflineQueueItem } from '../receipt/models/receipt.model';

@Injectable({
  providedIn: 'root',
})
export class ReceiptStateService {
  private readonly OFFLINE_QUEUE_KEY = 'receipt_offline_queue';
  private readonly RECEIPT_CACHE_KEY = 'receipt_cache';
  private readonly FILTERS_KEY = 'receipt_filters';

  // State Observables
  private receiptsState$ = new BehaviorSubject<ReceiptListItem[]>([]);
  private selectedReceipt$ = new BehaviorSubject<Receipt | null>(null);
  private offlineQueue$ = new BehaviorSubject<ReceiptOfflineQueueItem[]>([]);
  private syncStatus$ = new BehaviorSubject<'idle' | 'syncing' | 'completed' | 'failed'>('idle');
  private currentFilters$ = new BehaviorSubject<ReceiptFilters>({});

  constructor() {
    this.initializeState();
  }

  // ──────────────────────────────────────────────────────────────────────
  // PUBLIC OBSERVABLES
  // ──────────────────────────────────────────────────────────────────────

  getReceipts(): Observable<ReceiptListItem[]> {
    return this.receiptsState$.asObservable();
  }

  getSelectedReceipt(): Observable<Receipt | null> {
    return this.selectedReceipt$.asObservable();
  }

  getOfflineQueue(): Observable<ReceiptOfflineQueueItem[]> {
    return this.offlineQueue$.asObservable();
  }

  getSyncStatus(): Observable<'idle' | 'syncing' | 'completed' | 'failed'> {
    return this.syncStatus$.asObservable();
  }

  getCurrentFilters(): Observable<ReceiptFilters> {
    return this.currentFilters$.asObservable();
  }

  // ──────────────────────────────────────────────────────────────────────
  // RECEIPTS STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Set receipts list
   */
  setReceipts(receipts: ReceiptListItem[]): void {
    this.receiptsState$.next(receipts);
  }

  /**
   * Add receipt to list
   */
  addReceipt(receipt: ReceiptListItem): void {
    const current = this.receiptsState$.value;
    this.receiptsState$.next([receipt, ...current]);
  }

  /**
   * Update receipt in list
   */
  updateReceipt(id: number, updates: Partial<ReceiptListItem>): void {
    const current = this.receiptsState$.value;
    const index = current.findIndex(r => r.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      this.receiptsState$.next([...current]);
    }
  }

  /**
   * Remove receipt from list
   */
  removeReceipt(id: number): void {
    const current = this.receiptsState$.value.filter(r => r.id !== id);
    this.receiptsState$.next(current);
  }

  /**
   * Clear receipts list
   */
  clearReceipts(): void {
    this.receiptsState$.next([]);
  }

  // ──────────────────────────────────────────────────────────────────────
  // SELECTED RECEIPT MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Set selected receipt
   */
  setSelectedReceipt(receipt: Receipt | null): void {
    this.selectedReceipt$.next(receipt);
  }

  /**
   * Get current selected receipt (synchronous)
   */
  getSelectedReceiptSync(): Receipt | null {
    return this.selectedReceipt$.value;
  }

  /**
   * Update selected receipt data
   */
  updateSelectedReceipt(updates: Partial<Receipt>): void {
    const current = this.selectedReceipt$.value;
    if (current) {
      this.selectedReceipt$.next({ ...current, ...updates });
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // OFFLINE QUEUE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Add item to offline queue
   */
  async addToOfflineQueue(item: ReceiptOfflineQueueItem): Promise<void> {
    const queue = this.offlineQueue$.value;
    const updated = [...queue, item];
    this.offlineQueue$.next(updated);
    await this.saveOfflineQueue(updated);
  }

  /**
   * Remove item from queue
   */
  async removeFromOfflineQueue(itemId: string): Promise<void> {
    const queue = this.offlineQueue$.value.filter(q => q.id !== itemId);
    this.offlineQueue$.next(queue);
    await this.saveOfflineQueue(queue);
  }

  /**
   * Update queue item status
   */
  async updateQueueItemStatus(
    itemId: string,
    status: 'pending' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    const queue = this.offlineQueue$.value.map(item =>
      item.id === itemId ? { ...item, status, error, retry_count: item.retry_count + 1 } : item
    );
    this.offlineQueue$.next(queue);
    await this.saveOfflineQueue(queue);
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue$.next([]);
    await Preferences.remove({ key: this.OFFLINE_QUEUE_KEY });
  }

  /**
   * Get pending queue items
   */
  getPendingItems(): ReceiptOfflineQueueItem[] {
    return this.offlineQueue$.value.filter(q => q.status === 'pending');
  }

  /**
   * Get queue count by status
   */
  getQueueCount(status?: 'pending' | 'synced' | 'failed'): number {
    if (status) {
      return this.offlineQueue$.value.filter(q => q.status === status).length;
    }
    return this.offlineQueue$.value.length;
  }

  // ──────────────────────────────────────────────────────────────────────
  // SYNC STATUS MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  setSyncStatus(status: 'idle' | 'syncing' | 'completed' | 'failed'): void {
    this.syncStatus$.next(status);
  }

  // ──────────────────────────────────────────────────────────────────────
  // FILTERS MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Set current filters
   */
  setCurrentFilters(filters: ReceiptFilters): void {
    this.currentFilters$.next(filters);
    this.saveFilters(filters);
  }

  /**
   * Update specific filter
   */
  updateFilter(key: keyof ReceiptFilters, value: any): void {
    const current = this.currentFilters$.value;
    const updated = { ...current, [key]: value };
    this.setCurrentFilters(updated);
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.setCurrentFilters({});
  }

  // ──────────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Initialize state from storage
   */
  private async initializeState(): Promise<void> {
    try {
      // Load offline queue
      const queueData = await Preferences.get({ key: this.OFFLINE_QUEUE_KEY });
      if (queueData.value) {
        const queue = JSON.parse(queueData.value) as ReceiptOfflineQueueItem[];
        this.offlineQueue$.next(queue);
      }

      // Load filters
      const filtersData = await Preferences.get({ key: this.FILTERS_KEY });
      if (filtersData.value) {
        const filters = JSON.parse(filtersData.value) as ReceiptFilters;
        this.currentFilters$.next(filters);
      }
    } catch (error) {
      console.error('Error initializing receipt state:', error);
    }
  }

  /**
   * Save offline queue to storage
   */
  private async saveOfflineQueue(queue: ReceiptOfflineQueueItem[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.OFFLINE_QUEUE_KEY,
        value: JSON.stringify(queue),
      });
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Save filters to storage
   */
  private async saveFilters(filters: ReceiptFilters): Promise<void> {
    try {
      await Preferences.set({
        key: this.FILTERS_KEY,
        value: JSON.stringify(filters),
      });
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  /**
   * Cache receipt for offline access
   */
  async cacheReceipt(receipt: Receipt): Promise<void> {
    try {
      const cacheKey = `${this.RECEIPT_CACHE_KEY}_${receipt.id}`;
      await Preferences.set({
        key: cacheKey,
        value: JSON.stringify(receipt),
      });
    } catch (error) {
      console.error('Error caching receipt:', error);
    }
  }

  /**
   * Get cached receipt
   */
  async getCachedReceipt(id: number): Promise<Receipt | null> {
    try {
      const cacheKey = `${this.RECEIPT_CACHE_KEY}_${id}`;
      const data = await Preferences.get({ key: cacheKey });
      return data.value ? JSON.parse(data.value) : null;
    } catch (error) {
      console.error('Error retrieving cached receipt:', error);
      return null;
    }
  }

  /**
   * Clear all persistent storage
   */
  async clearAllStorage(): Promise<void> {
    try {
      await Preferences.remove({ key: this.OFFLINE_QUEUE_KEY });
      await Preferences.remove({ key: this.FILTERS_KEY });
      // Note: Receipt cache items are cleared individually as needed
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
