import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface PaymentProvider {
  id?: string;
  name: string;
  type: string;
  logo?: string;
  description?: string;
  features: string[];
  feeStructure?: any;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentProviderService extends BaseApiService {
  private paymentProvidersUrl = `${this.apiUrl}/payment-providers`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all payment providers
  getPaymentProviders(): Observable<{ success: boolean; data: PaymentProvider[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: PaymentProvider[] }>(
      this.paymentProvidersUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get payment provider by ID
  getPaymentProviderById(id: string): Observable<{ success: boolean; data: PaymentProvider }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: PaymentProvider }>(
      `${this.paymentProvidersUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get payment providers by type
  getPaymentProvidersByType(type: string): Observable<{ success: boolean; data: PaymentProvider[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: PaymentProvider[] }>(
      `${this.paymentProvidersUrl}/type/${type}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Calculate fee for a payment provider
  calculateFee(id: string, amount: number): Observable<{ success: boolean; fee: number; total: number }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; fee: number; total: number }>(
      `${this.paymentProvidersUrl}/${id}/calculate-fee`,
      { amount },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Check if payment provider supports a feature
  checkFeature(id: string, feature: string): Observable<{ success: boolean; supported: boolean }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; supported: boolean }>(
      `${this.paymentProvidersUrl}/${id}/check-feature`,
      { feature },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get payment providers by feature
  getPaymentProvidersByFeature(feature: string): Observable<{ success: boolean; data: PaymentProvider[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: PaymentProvider[] }>(
      `${this.paymentProvidersUrl}/feature/${feature}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Validate amount for payment provider
  validateAmount(id: string, amount: number): Observable<{ success: boolean; valid: boolean; message?: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }

    return this.http.post<{ success: boolean; valid: boolean; message?: string }>(
      `${this.paymentProvidersUrl}/${id}/validate-amount`,
      { amount },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Initiate payment with a provider
  initiatePayment(providerName: string, paymentData: { amount: number; currency?: string; description?: string; metadata?: any }): Observable<any> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }

    return this.http.post<any>(
      `${this.apiUrl}/payments/initiate/${providerName}`,
      paymentData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Verify payment status
  verifyPayment(providerName: string, transactionId: string): Observable<any> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }

    return this.http.get<any>(
      `${this.apiUrl}/payments/verify/${providerName}/${transactionId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get supported payment methods for a provider
  getSupportedMethods(providerName: string): Observable<{ success: boolean; data: { provider: string; supported_methods: string[] } }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }

    return this.http.get<{ success: boolean; data: { provider: string; supported_methods: string[] } }>(
      `${this.apiUrl}/payments/methods/${providerName}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
