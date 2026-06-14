/**
 * Receipt HTTP Service
 * Handles all receipt API communication with backend
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import {
  catchError,
  map,
  retry,
  tap,
  shareReplay,
  switchMap,
  finalize,
  timeout,
  filter,
} from 'rxjs/operators';
import {
  Receipt,
  ReceiptListItem,
  ReceiptFilters,
  ReceiptAnalytics,
  ReceiptStatusResponse,
  ReceiptImageUrlResponse,
  PaginatedResponse,
  ApiResponse,
} from '../receipt/models/receipt.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReceiptHttpService {
  private baseUrl = `${environment.apiUrl}/receipts`;
  private apiTimeout = 30000; // 30 seconds

  // Cache & State Management
  private receiptsCache$ = new BehaviorSubject<Map<string, any>>(new Map());
  private loadingState$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Get loading state
   */
  getLoadingState(): Observable<boolean> {
    return this.loadingState$.asObservable();
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingState$.next(loading);
  }

  // ──────────────────────────────────────────────────────────────────────
  // LIST & FILTERING
  // ──────────────────────────────────────────────────────────────────────

  /**
   * GET /api/receipts - List receipts with filters
   */
  getReceipts(filters: ReceiptFilters): Observable<PaginatedResponse<ReceiptListItem>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.receipt_type) params = params.set('receipt_type', filters.receipt_type);
    if (filters.category_id) params = params.set('category_id', filters.category_id.toString());
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    if (filters.requires_review !== undefined) params = params.set('requires_review', 'true');

    this.setLoading(true);
    return this.http.get<PaginatedResponse<ReceiptListItem>>(this.baseUrl, { params }).pipe(
      timeout(this.apiTimeout),
      retry(1),
      tap(response => this.cacheResponse('receipts_list', response)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false)),
      shareReplay(1)
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // UPLOAD
  // ──────────────────────────────────────────────────────────────────────

  /**
   * POST /api/receipts - Upload receipt with file(s)
   * Supports multi-page uploads
   */
  uploadReceipt(
    files: File[],
    metadata?: { title?: string; notes?: string }
  ): Observable<ApiResponse<Receipt>> {
    const formData = new FormData();

    if (files.length === 0) {
      return throwError(() => new Error('At least one file is required'));
    }

    // Main file is the first one
    formData.append('file', files[0]);

    // Additional files (multi-page)
    if (files.length > 1) {
      for (let i = 1; i < files.length; i++) {
        formData.append('additional_files[]', files[i]);
      }
    }

    // Optional metadata
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.notes) formData.append('notes', metadata.notes);

    this.setLoading(true);
    return this.http.post<ApiResponse<Receipt>>(`${this.baseUrl}`, formData).pipe(
      timeout(this.apiTimeout),
      tap(response => {
        if (response.data) {
          this.cacheResponse(`receipt_${response.data.id}`, response.data);
        }
      }),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
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
    const formData = new FormData();

    if (files.length === 0) {
      return throwError(() => new Error('At least one file is required'));
    }

    formData.append('file', files[0]);

    if (files.length > 1) {
      for (let i = 1; i < files.length; i++) {
        formData.append('additional_files[]', files[i]);
      }
    }

    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.notes) formData.append('notes', metadata.notes);

    this.setLoading(true);
    return this.http
      .post<ApiResponse<Receipt>>(`${this.baseUrl}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? 1;
            const percentDone = Math.round((100 * event.loaded) / total);
            if (onProgress) {
              onProgress(percentDone);
            }
            return null;
          }

          if (event.type === HttpEventType.Response) {
            return event.body as ApiResponse<Receipt>;
          }

          return null;
        }),
        filter((response): response is ApiResponse<Receipt> => response !== null),
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  // ──────────────────────────────────────────────────────────────────────
  // DETAIL & OPERATIONS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * GET /api/receipts/{id} - Get receipt details
   */
  getReceipt(id: number): Observable<Receipt> {
    const cacheKey = `receipt_${id}`;

    // Check cache first
    const cached = this.receiptsCache$.value.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    return this.http.get<Receipt | ApiResponse<Receipt>>(`${this.baseUrl}/${id}`).pipe(
      timeout(this.apiTimeout),
      retry(1),
      map(response => this.unwrapResponse(response)),
      tap(receipt => this.cacheResponse(cacheKey, receipt)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * PUT /api/receipts/{id} - Update receipt
   */
  updateReceipt(id: number, data: Partial<Receipt>): Observable<ApiResponse<Receipt>> {
    this.setLoading(true);
    return this.http.put<ApiResponse<Receipt>>(`${this.baseUrl}/${id}`, data).pipe(
      timeout(this.apiTimeout),
      tap(response => {
        if (response.data) {
          this.receiptsCache$.value.delete(`receipt_${id}`);
        }
      }),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * DELETE /api/receipts/{id} - Delete receipt
   */
  deleteReceipt(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      timeout(this.apiTimeout),
      tap(() => this.receiptsCache$.value.delete(`receipt_${id}`)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * POST /api/receipts/{id}/parse - Reprocess OCR
   */
  reprocessOCR(id: number): Observable<ApiResponse<Receipt>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<Receipt>>(`${this.baseUrl}/${id}/parse`, {}).pipe(
      timeout(this.apiTimeout),
      tap(() => this.receiptsCache$.value.delete(`receipt_${id}`)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * POST /api/receipts/{id}/confirm - Confirm receipt
   */
  confirmReceipt(id: number): Observable<ApiResponse<Receipt>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<Receipt>>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      timeout(this.apiTimeout),
      tap(() => this.receiptsCache$.value.delete(`receipt_${id}`)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * POST /api/receipts/{id}/expense - Create expense from receipt
   */
  createExpense(
    id: number,
    data: { account_id?: number; category_id?: number; title?: string; notes?: string }
  ): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/expense`, data).pipe(
      timeout(this.apiTimeout),
      tap(() => this.receiptsCache$.value.delete(`receipt_${id}`)),
      catchError(error => this.handleError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // STATUS & INFO
  // ──────────────────────────────────────────────────────────────────────

  /**
   * GET /api/receipts/{id}/status - Poll receipt processing status
   */
  getReceiptStatus(id: number): Observable<ReceiptStatusResponse> {
    return this.http.get<ReceiptStatusResponse>(`${this.baseUrl}/${id}/status`).pipe(
      timeout(this.apiTimeout),
      retry(1),
      tap(status => {
        if (!['draft', 'processing'].includes(status.status)) {
          this.clearCacheKey(`receipt_${id}`);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * GET /api/receipts/{id}/image - Get signed image URL
   */
  getImageUrl(id: number, type: 'original' | 'processed' = 'processed'): Observable<ReceiptImageUrlResponse> {
    const params = new HttpParams().set('type', type);
    return this.http.get<ReceiptImageUrlResponse>(`${this.baseUrl}/${id}/image`, { params }).pipe(
      timeout(this.apiTimeout),
      retry(1),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * GET /api/receipts/analytics - Get receipt analytics
   */
  getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<ApiResponse<ReceiptAnalytics>> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<ReceiptAnalytics>>(`${this.baseUrl}/analytics`, { params }).pipe(
      timeout(this.apiTimeout),
      retry(1),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // CACHE & HELPERS
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Cache response data
   */
  private cacheResponse(key: string, value: any): void {
    const cache = this.receiptsCache$.value;
    cache.set(key, value);
    this.receiptsCache$.next(cache);
  }

  private unwrapResponse<T>(response: T | ApiResponse<T>): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<T>).data as T;
    }

    return response as T;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.receiptsCache$.next(new Map());
  }

  /**
   * Clear specific cache key
   */
  clearCacheKey(key: string): void {
    const cache = this.receiptsCache$.value;
    cache.delete(key);
    this.receiptsCache$.next(cache);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.statusText || 'Unknown error';
    }

    console.error('Receipt Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      details: error.error,
    }));
  }
}
