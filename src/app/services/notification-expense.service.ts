import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationExpense, NotificationExpenseResponse, ParsedNotification, KNOWN_NOTIFICATION_PACKAGES } from '../models/notification-expense.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationExpenseService {
  private readonly base = `${environment.apiURL}/expenses`;

  // Reactive state
  private autoExpensesSubject = new BehaviorSubject<NotificationExpense[]>([]);
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  private lastSyncSubject = new BehaviorSubject<Date | null>(null);

  autoExpenses$ = this.autoExpensesSubject.asObservable();
  isListening$ = this.isListeningSubject.asObservable();
  lastSync$ = this.lastSyncSubject.asObservable();

  // Known transaction keywords
  private readonly debitKeywords = ['debited', 'debited from', 'paid to', 'sent to', 'withdrawn', 'purchase', 'payment'];
  private readonly creditKeywords = ['credited', 'credited to', 'received', 'deposited', 'refund', 'cashback'];
  private readonly amountPatterns = [
    /Rs\.?\s*([\d,]+(\.\d{1,2})?)/i,
    /INR\s*([\d,]+(\.\d{1,2})?)/i,
    /₹\s*([\d,]+(\.\d{1,2})?)/i,
    /([\d,]+(\.\d{1,2})?)\s*Rs/i,
  ];
  private readonly referencePatterns = [
    /UPI\w*[:\s]*([A-Z0-9]+)/i,
    /Ref[:\s]*([A-Z0-9]+)/i,
    /Txn[:\s]*([A-Z0-9]+)/i,
    /ID[:\s]*([A-Z0-9]+)/i,
    /Transaction\s*ID[:\s]*([A-Z0-9]+)/i,
  ];

  constructor(private readonly http: HttpClient) {}

  // ==================== PARSING LOGIC ====================

  /**
   * Parse a notification message to extract expense data
   */
  parseNotification(title: string, message: string, postedAt?: number): ParsedNotification {
    const combined = `${title} ${message}`.toLowerCase();
    
    // Detect transaction type
    let type: 'CREDIT' | 'DEBIT' | null = null;
    for (const keyword of this.debitKeywords) {
      if (combined.includes(keyword)) {
        type = 'DEBIT';
        break;
      }
    }
    if (!type) {
      for (const keyword of this.creditKeywords) {
        if (combined.includes(keyword)) {
          type = 'CREDIT';
          break;
        }
      }
    }

    // Extract amount
    let amount: number | null = null;
    for (const pattern of this.amountPatterns) {
      const match = combined.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        amount = parseFloat(amountStr);
        if (amount > 0 && amount < 10000000) { // Sanity check
          break;
        }
      }
    }

    // Extract reference
    let reference: string | null = null;
    for (const pattern of this.referencePatterns) {
      const match = combined.match(pattern);
      if (match) {
        reference = match[1];
        break;
      }
    }

    // Extract merchant (simplified - take first meaningful segment)
    let merchant: string | null = null;
    const upiMatch = combined.match(/to\s+([a-zA-Z0-9]+)@/);
    if (upiMatch) {
      merchant = upiMatch[1];
    } else {
      // Try to extract from "paid to X" or "credited to X"
      const toMatch = combined.match(/(?:paid|credited|received)\s+to\s+([a-zA-Z]+)/);
      if (toMatch) {
        merchant = toMatch[1];
      }
    }

    // Create narration from message
    let narration = message.substring(0, 200);
    // Clean up the narration
    narration = narration
      .replace(/Rs\.?\s*[\d,]+(\.\d{1,2})?/gi, '')
      .replace(/INR\s*[\d,]+(\.\d{1,2})?/gi, '')
      .replace(/₹\s*[\d,]+(\.\d{1,2})?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const isValid = type !== null && amount !== null && amount > 0;

    return {
      amount,
      type,
      date: postedAt ? new Date(postedAt) : new Date(),
      narration: narration || 'Auto-detected expense',
      reference,
      merchant,
      isValid
    };
  }

  /**
   * Check if notification should be processed
   */
  shouldProcessNotification(packageName: string, title: string, message: string): boolean {
    // Check if it's from a known app
    const knownApp = KNOWN_NOTIFICATION_PACKAGES.find(
      p => packageName.includes(p.name) || p.name.includes(packageName)
    );
    if (knownApp) {
      return true;
    }

    // Check if message contains transaction keywords
    const combined = `${title} ${message}`.toLowerCase();
    const transactionKeywords = ['debited', 'credited', 'upi', 'rs.', 'inr', '₹'];
    return transactionKeywords.some(keyword => combined.includes(keyword));
  }

  /**
   * Generate hash for duplicate detection
   */
  // ==================== API METHODS ====================

  /**
   * Submit auto-detected expense to backend
   */
  createAutoExpense(expense: NotificationExpense): Observable<NotificationExpenseResponse> {
    const payload = {
      amount: expense.amount,
      type: expense.type,
      date: expense.date,
      narration: expense.narration || expense.merchant || 'Auto-detected expense',
      reference_id: expense.reference_id,
      source: 'NOTIFICATION',
      merchant: expense.merchant,
      package_name: expense.package_name,
      payment_method: this.getPaymentMethod(expense.package_name)
    };

    return this.http.post<any>(`${this.base}/auto`, payload, { headers: this.getAuthHeaders() }).pipe(
      map((response) => ({
        success: !!response?.success,
        message: response?.message,
        is_duplicate: !!response?.duplicate,
        data: response?.data ? this.fromExpenseResponse(response.data, expense) : undefined
      })),
      tap((response) => {
        if (response?.success && response?.data) {
          const current = this.autoExpensesSubject.getValue();
          this.autoExpensesSubject.next([response.data, ...current]);
          this.lastSyncSubject.next(new Date());
        }
      })
    );
  }

  /**
   * Process and submit notification
   */
  processNotification(
    packageName: string,
    title: string,
    message: string,
    userId: number,
    postedAt?: number
  ): Observable<NotificationExpenseResponse | null> {
    // Check if we should process this notification
    if (!this.shouldProcessNotification(packageName, title, message)) {
      return of(null);
    }

    // Parse the notification
    const parsed = this.parseNotification(title, message, postedAt);
    if (!parsed.isValid || parsed.type !== 'DEBIT') {
      return of(null);
    }

    // Create expense object
    const expense: NotificationExpense = {
      amount: parsed.amount!,
      type: parsed.type!,
      date: parsed.date!.toISOString(),
      narration: parsed.narration,
      reference_id: parsed.reference || undefined,
      source: 'NOTIFICATION',
      merchant: parsed.merchant || undefined,
      package_name: packageName,
      raw_notification: message
    };

    return this.createAutoExpense(expense);
  }

  /**
   * Get auto-detected expenses from backend
   */
  getAutoExpenses(page = 1, limit = 20): Observable<{ success: boolean; data: NotificationExpense[]; total?: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('source', 'NOTIFICATION');

    return this.http.get<{ success: boolean; data: NotificationExpense[]; total?: number }>(`${this.base}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        if (response?.success && response?.data) {
          this.autoExpensesSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Check for duplicates in backend
   */
  checkDuplicate(hash: string): Observable<{ is_duplicate: boolean; existing_id?: number }> {
    return this.http.get<{ is_duplicate: boolean; existing_id?: number }>(`${this.base}/check-duplicate`, {
      params: new HttpParams().set('hash', hash),
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete an auto-detected expense
   */
  deleteAutoExpense(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        const current = this.autoExpensesSubject.getValue();
        this.autoExpensesSubject.next(current.filter(e => e.id !== id));
      })
    );
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Get cached auto expenses
   */
  getCachedAutoExpenses(): NotificationExpense[] {
    return this.autoExpensesSubject.getValue();
  }

  /**
   * Set listening state
   */
  setListeningState(listening: boolean): void {
    this.isListeningSubject.next(listening);
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncSubject.getValue();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.autoExpensesSubject.next([]);
    this.lastSyncSubject.next(null);
  }

  private getPaymentMethod(packageName?: string): 'UPI' | 'Bank Transfer' | 'Mobile Wallet' {
    const provider = KNOWN_NOTIFICATION_PACKAGES.find((item) =>
      packageName ? packageName.includes(item.name) || item.name.includes(packageName) : false
    );

    if (provider?.type === 'upi') {
      return 'UPI';
    }

    if (provider?.type === 'wallet') {
      return 'Mobile Wallet';
    }

    return 'Bank Transfer';
  }

  private fromExpenseResponse(data: any, fallback: NotificationExpense): NotificationExpense {
    return {
      ...fallback,
      id: data?.id,
      amount: Number(data?.amount ?? fallback.amount),
      date: data?.date || data?.expense_date || fallback.date,
      narration: data?.description || fallback.narration,
      merchant: data?.merchant_name || fallback.merchant,
      raw_notification: data?.notes || fallback.raw_notification
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
  }
}
