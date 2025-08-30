import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { CreditCard } from '../models/credit-card.model';
import { DebitCard } from '../models/debit-card.model';

@Injectable({
  providedIn: 'root'
})
export class CardApiService extends BaseApiService {
  private creditCardsUrl = `${this.apiUrl}/credit-cards`;
  private debitCardsUrl = `${this.apiUrl}/debit-cards`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Credit Card Operations

  // Get all credit cards
  getCreditCards(): Observable<{ success: boolean; data: CreditCard[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: CreditCard[] }>(
      this.creditCardsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get credit card by ID
  getCreditCardById(id: string): Observable<{ success: boolean; data: CreditCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: CreditCard }>(
      `${this.creditCardsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new credit card
  createCreditCard(card: CreditCard): Observable<{ success: boolean; data: CreditCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: CreditCard }>(
      this.creditCardsUrl,
      card,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update credit card
  updateCreditCard(id: string, card: CreditCard): Observable<{ success: boolean; data: CreditCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: CreditCard }>(
      `${this.creditCardsUrl}/${id}`,
      card,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete credit card
  deleteCreditCard(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.creditCardsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Debit Card Operations

  // Get all debit cards
  getDebitCards(): Observable<{ success: boolean; data: DebitCard[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: DebitCard[] }>(
      this.debitCardsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get debit card by ID
  getDebitCardById(id: string): Observable<{ success: boolean; data: DebitCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: DebitCard }>(
      `${this.debitCardsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new debit card
  createDebitCard(card: DebitCard): Observable<{ success: boolean; data: DebitCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: DebitCard }>(
      this.debitCardsUrl,
      card,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update debit card
  updateDebitCard(id: string, card: DebitCard): Observable<{ success: boolean; data: DebitCard }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: DebitCard }>(
      `${this.debitCardsUrl}/${id}`,
      card,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete debit card
  deleteDebitCard(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.debitCardsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
