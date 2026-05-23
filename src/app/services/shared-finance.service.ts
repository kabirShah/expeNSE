import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import {
  DeviceContact,
  RecurringSharedExpense,
  SharedApiResponse,
  SharedExpensePayload,
  SharedFriend,
  SharedItem,
  SharedParticipant,
  SharedSplitResult,
  SharedSplitType
} from '../models/shared-finance.model';

@Injectable({
  providedIn: 'root'
})
export class SharedFinanceService extends BaseApiService {
  private sharedUrl = `${this.apiUrl}/shared`;

  constructor(http: HttpClient) {
    super(http);
  }

  getFriends(): Observable<SharedApiResponse<any>> {
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/friends`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  syncContacts(contacts: Array<Partial<DeviceContact>>): Observable<SharedApiResponse<DeviceContact[]>> {
    return this.http.post<SharedApiResponse<DeviceContact[]>>(
      `${this.sharedUrl}/contacts/sync`,
      { contacts },
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getDeviceContacts(): Observable<SharedApiResponse<any>> {
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/contacts`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  inviteContact(contactId: number): Observable<SharedApiResponse<SharedFriend>> {
    return this.http.post<SharedApiResponse<SharedFriend>>(
      `${this.sharedUrl}/contacts/${contactId}/invite`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  toggleFavorite(friendId: number): Observable<SharedApiResponse<SharedFriend>> {
    return this.http.patch<SharedApiResponse<SharedFriend>>(
      `${this.sharedUrl}/friends/${friendId}/favorite`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  respondToFriend(friendId: number, status: 'accepted' | 'rejected' | 'blocked'): Observable<SharedApiResponse<SharedFriend>> {
    return this.http.patch<SharedApiResponse<SharedFriend>>(
      `${this.sharedUrl}/friends/${friendId}/respond`,
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  calculateSplit(payload: {
    amount: number;
    split_type: SharedSplitType;
    participants: SharedParticipant[];
    items?: SharedItem[];
  }): Observable<SharedApiResponse<{ amount: number; split_type: SharedSplitType; splits: SharedSplitResult[] }>> {
    return this.http.post<SharedApiResponse<{ amount: number; split_type: SharedSplitType; splits: SharedSplitResult[] }>>(
      `${this.sharedUrl}/splits/calculate`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  simplifyBalances(balances: Record<number, number>): Observable<SharedApiResponse<Array<{ from_user_id: number; to_user_id: number; amount: number }>>> {
    return this.http.post<SharedApiResponse<Array<{ from_user_id: number; to_user_id: number; amount: number }>>>(
      `${this.sharedUrl}/balances/simplify`,
      { balances },
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  addGroupExpense(groupId: number, payload: SharedExpensePayload): Observable<SharedApiResponse<any>> {
    return this.http.post<SharedApiResponse<any>>(
      `${this.apiUrl}/groups/${groupId}/expenses`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getExpenseComments(expenseId: number): Observable<SharedApiResponse<any>> {
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/expenses/${expenseId}/comments`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  addExpenseComment(expenseId: number, payload: { comment?: string; reaction?: string }): Observable<SharedApiResponse<any>> {
    return this.http.post<SharedApiResponse<any>>(
      `${this.sharedUrl}/expenses/${expenseId}/comments`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getRecurringSharedExpenses(groupId?: number): Observable<SharedApiResponse<any>> {
    const params = groupId ? { group_id: String(groupId) } : undefined;
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/recurring-expenses`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(catchError(this.handleError));
  }

  createRecurringSharedExpense(payload: RecurringSharedExpense): Observable<SharedApiResponse<RecurringSharedExpense>> {
    return this.http.post<SharedApiResponse<RecurringSharedExpense>>(
      `${this.sharedUrl}/recurring-expenses`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getActivity(groupId?: number): Observable<SharedApiResponse<any>> {
    const params = groupId ? { group_id: String(groupId) } : undefined;
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/activity`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(catchError(this.handleError));
  }

  getSharedAnalytics(): Observable<SharedApiResponse<any>> {
    return this.http.get<SharedApiResponse<any>>(
      `${this.sharedUrl}/analytics/summary`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }
}
