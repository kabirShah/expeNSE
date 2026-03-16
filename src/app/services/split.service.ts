import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface Split {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  total_amount: number;
  split_type: 'equal' | 'percentage' | 'custom';
  participants: SplitParticipant[];
  settled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SplitParticipant {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  amount_owed?: number;
  amount_paid?: number;
  status?: 'pending' | 'settled';
  percentage?: number;
  amount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SplitService extends BaseApiService {
  private splitsUrl = `${this.apiUrl}/splits`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all splits
  getSplits(): Observable<{ success: boolean; data: Split[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Split[] }>(
      this.splitsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get split by ID
  getSplitById(id: string): Observable<{ success: boolean; data: Split }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Split }>(
      `${this.splitsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new split
  createSplit(split: Split): Observable<{ success: boolean; data: Split }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Split }>(
      this.splitsUrl,
      split,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update split
  updateSplit(id: string, split: Split): Observable<{ success: boolean; data: Split }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: Split }>(
      `${this.splitsUrl}/${id}`,
      split,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete split
  deleteSplit(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.splitsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Calculate split amounts
  calculateSplit(amount: number, participants: number, method: string = 'equal'): Observable<{ success: boolean; amounts: number[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; amounts: number[] }>(
      `${this.splitsUrl}/calculate`,
      {
        total_amount: amount,
        split_type: method,
        participants: Array.from({ length: participants }, (_, i) => ({ user_id: i + 1 }))
      },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Settle split participant
  settleParticipant(splitId: string, participantId: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.splitsUrl}/${splitId}/settle/${participantId}`,
      { amount_paid: 0 },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get split summary
  getSplitSummary(splitId: string): Observable<{ success: boolean; summary: any }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; summary: any }>(
      `${this.splitsUrl}/${splitId}/summary`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
