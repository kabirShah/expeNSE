import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import {
  SplitwiseApiResponse,
  SplitwiseBalanceSummary,
  SplitwiseExpense,
  SplitwiseGroup,
  SplitwiseSettlement,
} from '../models/splitwise.model';

@Injectable({
  providedIn: 'root'
})
export class SplitwiseService extends BaseApiService {
  private route = `${this.apiUrl}/splitwise`;

  constructor(http: HttpClient) {
    super(http);
  }

  getGroups(): Observable<SplitwiseApiResponse<SplitwiseGroup[]>> {
    return this.http.get<SplitwiseApiResponse<SplitwiseGroup[]>>(
      `${this.route}/groups`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createGroup(payload: {
    name: string;
    description?: string;
    member_user_ids?: number[];
    members?: Array<{ user_id?: number; name?: string; email?: string }>;
  }): Observable<SplitwiseApiResponse<SplitwiseGroup>> {
    return this.http.post<SplitwiseApiResponse<SplitwiseGroup>>(
      `${this.route}/groups`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getGroup(groupId: number): Observable<SplitwiseApiResponse<SplitwiseGroup>> {
    return this.http.get<SplitwiseApiResponse<SplitwiseGroup>>(
      `${this.route}/groups/${groupId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getExpenses(groupId: number): Observable<SplitwiseApiResponse<SplitwiseExpense[]>> {
    return this.http.get<SplitwiseApiResponse<SplitwiseExpense[]>>(
      `${this.route}/expenses`,
      { headers: this.getAuthHeaders(), params: { group_id: String(groupId) } }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createExpense(payload: {
    group_id: number;
    paid_by_member_id: number;
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    expense_date: string;
    splits: Array<{ member_id: number; amount_owed: number }>;
  }): Observable<SplitwiseApiResponse<SplitwiseExpense>> {
    return this.http.post<SplitwiseApiResponse<SplitwiseExpense>>(
      `${this.route}/expenses`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getBalances(groupId: number): Observable<SplitwiseApiResponse<SplitwiseBalanceSummary>> {
    return this.http.get<SplitwiseApiResponse<SplitwiseBalanceSummary>>(
      `${this.route}/balances/${groupId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getSettlements(groupId?: number): Observable<SplitwiseApiResponse<SplitwiseSettlement[]>> {
    const options: { headers: ReturnType<BaseApiService['getAuthHeaders']>; params?: { group_id: string } } = {
      headers: this.getAuthHeaders(),
    };

    if (groupId) {
      options.params = { group_id: String(groupId) };
    }

    return this.http.get<SplitwiseApiResponse<SplitwiseSettlement[]>>(
      `${this.route}/settlements`,
      options
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createSettlement(payload: {
    group_id: number;
    payer_member_id: number;
    payee_member_id: number;
    amount: number;
    settled_at: string;
    note?: string;
  }): Observable<SplitwiseApiResponse<SplitwiseSettlement>> {
    return this.http.post<SplitwiseApiResponse<SplitwiseSettlement>>(
      `${this.route}/settlements`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }
}
