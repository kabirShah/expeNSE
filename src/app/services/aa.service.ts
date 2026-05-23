import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, of, interval, switchMap, takeWhile } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AAConsent, AAConsentStatus, CreateConsentPayload, AAConsentApiResponse } from '../models/aa-consent.model';
import { AAAccount, AAAccountWithBalance, AAAccountsApiResponse } from '../models/aa-account.model';
import { AATransaction, AATransactionsApiResponse, AASyncLog } from '../models/aa-transaction.model';

export interface AAConsentResponse {
  success: boolean;
  consent_id: string;
  consent_handle?: string | null;
  consent_url: string | null;
}

export interface AAConnectedAccount {
  id?: number;
  bank_name: string;
  masked_account_number: string | null;
  account_ref?: string | null;
  type?: string | null;
  current_balance?: number | null;
  available_balance?: number | null;
}

export interface AASyncResponse {
  accounts: AAConnectedAccount[];
  transactions: AATransaction[];
}

@Injectable({
  providedIn: 'root'
})
export class AaService {
  private readonly base = `${environment.apiURL}/aa`;
  private readonly lastConsentKey = 'aa_last_consent_id';
  private readonly fallbackKey = 'aa_sms_fallback_ready';

  // Reactive state management
  private consentsSubject = new BehaviorSubject<AAConsent[]>([]);
  private accountsSubject = new BehaviorSubject<AAAccount[]>([]);
  private transactionsSubject = new BehaviorSubject<AATransaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private syncStatusSubject = new BehaviorSubject<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Public observables
  consents$ = this.consentsSubject.asObservable();
  accounts$ = this.accountsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  syncStatus$ = this.syncStatusSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  // ==================== CONSENT MANAGEMENT ====================

  /**
   * Create a new AA consent
   */
  createConsent(redirectUrl: string): Observable<AAConsentResponse> {
    return this.http.post<AAConsentResponse>(`${this.base}/consents`, {
      redirect_url: redirectUrl
    }).pipe(
      tap((response) => {
        if (response?.consent_id) {
          localStorage.setItem(this.lastConsentKey, response.consent_id);
        }
      })
    );
  }

  /**
   * Create consent with full payload (Setu API)
   */
  createConsentWithPayload(payload: CreateConsentPayload): Observable<AAConsentApiResponse> {
    return this.http.post<AAConsentApiResponse>(`${this.base}/consents`, payload);
  }

  /**
   * Get consent status by ID
   */
  getConsentStatus(consentId: string): Observable<AAConsentApiResponse> {
    return this.http.get<AAConsentApiResponse>(`${this.base}/consents/${consentId}`);
  }

  /**
   * Get all consents for current user
   */
  getConsents(): Observable<AAConsent[]> {
    this.loadingSubject.next(true);
    return this.http.get<{ success: boolean; data: AAConsent[] }>(`${this.base}/consents`).pipe(
      tap((response) => {
        if (response?.success && response?.data) {
          this.consentsSubject.next(response.data);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch consents', error);
        return of({ success: false, data: [] });
      }),
      map((response) => response.data || []),
      tap(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Poll consent status until approved/rejected
   */
  pollConsentStatus(consentId: string, intervalMs = 3000, maxAttempts = 20): Observable<AAConsent | null> {
    let attempts = 0;
    
    return interval(intervalMs).pipe(
      switchMap(() => this.getConsentStatus(consentId)),
      map((response) => {
        const consent = response?.data;
        if (!consent) return null;
        // Stop polling if not pending
        if (consent.status !== 'PENDING') {
          attempts = maxAttempts; // Force stop
        }
        return consent;
      }),
      takeWhile((consent) => {
        if (!consent) return false;
        attempts++;
        const pending = consent.status === 'PENDING';
        const canContinue = attempts < maxAttempts;
        return pending && canContinue;
      }, true)
    );
  }

  /**
   * Revoke a consent
   */
  revokeConsent(consentId: string): Observable<any> {
    return this.http.post(`${this.base}/consents/${consentId}/revoke`, {});
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * Get all linked accounts
   */
  getAccounts(): Observable<AAAccount[]> {
    this.loadingSubject.next(true);
    return this.http.get<AAAccountsApiResponse>(`${this.base}/accounts`).pipe(
      tap((response) => {
        if (response?.success && response?.data) {
          this.accountsSubject.next(response.data);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch accounts', error);
        return of({ success: false, data: [] });
      }),
      map((response) => response.data || []),
      tap(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Get account by ID
   */
  getAccount(accountId: number): Observable<AAAccount> {
    return this.http.get<{ success: boolean; data: AAAccount }>(`${this.base}/accounts/${accountId}`).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Get accounts by consent ID
   */
  getAccountsByConsent(consentId: string): Observable<AAAccount[]> {
    const params = new HttpParams().set('consent_id', consentId);
    return this.http.get<AAAccountsApiResponse>(`${this.base}/accounts`, { params }).pipe(
      map((response) => response.data || [])
    );
  }

  // ==================== TRANSACTION MANAGEMENT ====================

  /**
   * Get transactions for an account
   */
  getTransactions(accountId?: number, page = 1, limit = 50): Observable<AATransactionsApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (accountId) {
      params = params.set('account_id', accountId.toString());
    }

    return this.http.get<AATransactionsApiResponse>(`${this.base}/transactions`, { params });
  }

  /**
   * Get all transactions across all accounts
   */
  getAllTransactions(page = 1, limit = 100): Observable<AATransaction[]> {
    this.loadingSubject.next(true);
    return this.getTransactions(undefined, page, limit).pipe(
      tap((response) => {
        if (response?.success && response?.data) {
          this.transactionsSubject.next(response.data);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch transactions', error);
        return of({ success: false, data: [] });
      }),
      map((response) => response.data || []),
      tap(() => this.loadingSubject.next(false))
    );
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Trigger data sync for a consent
   */
  syncData(consentId: string): Observable<any> {
    this.syncStatusSubject.next('syncing');
    return this.http.post(`${this.base}/sync`, { consent_id: consentId }).pipe(
      tap((response) => {
        this.syncStatusSubject.next('success');
      }),
      catchError((error) => {
        this.syncStatusSubject.next('error');
        throw error;
      })
    );
  }

  /**
   * Fetch and sync transactions (legacy method)
   */
  fetchTransactions(consentId?: string): Observable<AASyncResponse> {
    const resolvedConsentId = consentId || this.getLastConsentId();
    let params = new HttpParams();

    if (resolvedConsentId) {
      params = params.set('consent_id', resolvedConsentId);
    }

    return this.http.get<AASyncResponse>(`${this.base}/fetch-transactions`, { params });
  }

  /**
   * Fetch accounts (legacy method)
   */
  fetchAccounts(consentId?: string): Observable<AAConnectedAccount[]> {
    return this.fetchTransactions(consentId).pipe(
      map((response) => Array.isArray(response?.accounts) ? response.accounts : [])
    );
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Get cached consents
   */
  getCachedConsents(): AAConsent[] {
    return this.consentsSubject.getValue();
  }

  /**
   * Get cached accounts
   */
  getCachedAccounts(): AAAccount[] {
    return this.accountsSubject.getValue();
  }

  /**
   * Get cached transactions
   */
  getCachedTransactions(): AATransaction[] {
    return this.transactionsSubject.getValue();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.consentsSubject.next([]);
    this.accountsSubject.next([]);
    this.transactionsSubject.next([]);
    this.syncStatusSubject.next('idle');
  }

  // ==================== UTILITY METHODS ====================

  getLastConsentId(): string | null {
    return localStorage.getItem(this.lastConsentKey);
  }

  markSmsFallbackReady(): void {
    localStorage.setItem(this.fallbackKey, 'true');
  }

  isSmsFallbackReady(): boolean {
    return localStorage.getItem(this.fallbackKey) === 'true';
  }

  /**
   * Get active consent (approved and not expired)
   */
  getActiveConsent(): AAConsent | null {
    const consents = this.getCachedConsents();
    return consents.find(c => c.status === 'APPROVED' && (!c.expiry_at || new Date(c.expiry_at) > new Date())) || null;
  }

  /**
   * Check if user has any linked accounts
   */
  hasLinkedAccounts(): boolean {
    return this.getCachedAccounts().length > 0;
  }
}
