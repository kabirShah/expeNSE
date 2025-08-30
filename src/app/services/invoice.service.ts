import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends BaseApiService {
  private invoicesUrl = `${this.apiUrl}/invoices`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all invoices
  getInvoices(): Observable<{ success: boolean; data: Invoice[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Invoice[] }>(
      this.invoicesUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get invoice by ID
  getInvoiceById(id: string): Observable<{ success: boolean; data: Invoice }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Invoice }>(
      `${this.invoicesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new invoice
  createInvoice(invoice: Invoice): Observable<{ success: boolean; data: Invoice }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Invoice }>(
      this.invoicesUrl,
      invoice,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update invoice
  updateInvoice(id: string, invoice: Invoice): Observable<{ success: boolean; data: Invoice }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: Invoice }>(
      `${this.invoicesUrl}/${id}`,
      invoice,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete invoice
  deleteInvoice(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.invoicesUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
